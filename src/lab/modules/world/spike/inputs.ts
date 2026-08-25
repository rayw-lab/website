// 驾驶输入层（roadmap §7.2 Step 7 + §7.3 Step 8）。
// 键位照抄 folio Player.js L220-239 动作表（砍 Gamepad/悬挂九宫格/honk）：
//   forward = W/↑  backward = S/↓  left = A/←  right = D/→
//   boost = Shift  brake = Space/B（folio 用 B/Ctrl，本站 Space 更顺手）  respawn = R
// 触屏：自绘虚拟摇杆（folio Nipple.ts 的精简版）——按下即生成动态原点，
//   y 轴 = 油门，x 轴 = 转向；只响应 touch/pen 指针，不干扰桌面鼠标。
import type { DriveIntent } from './vehicle';

export interface DriveInputs {
  /** 每帧读取（对象复用，勿持有引用跨帧） */
  read(): DriveIntent;
  /** respawn 沿事件语义（单帧脉冲，读后即清） */
  consumeRespawn(): boolean;
  /** 任意驾驶输入是否已发生过（HUD 教学提示消隐用） */
  hasDriven(): boolean;
  dispose(): void;
}

const KEY_ACTIONS: Record<string, keyof KeyState> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'boost',
  ShiftRight: 'boost',
  Space: 'brake',
  KeyB: 'brake',
};

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
  brake: boolean;
}

/**
 * @param stage 摇杆手势捕获面（画布容器）
 * @param joystickHost 摇杆视觉宿主（HUD 层内的定位容器；缺省则仅键盘）
 */
export function createDriveInputs(
  stage: HTMLElement,
  joystickHost: HTMLElement | null,
): DriveInputs {
  const keys: KeyState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    brake: false,
  };
  let respawnPulse = false;
  let driven = false;

  const listeners: Array<{ el: EventTarget; type: string; fn: EventListener }> = [];
  const on = (el: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    el.addEventListener(type, fn, opts);
    listeners.push({ el, type, fn });
  };

  // ---- 键盘 ----
  const onKey = (down: boolean) => (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.repeat) return;
    if (ke.code === 'KeyR' && down) {
      respawnPulse = true;
      return;
    }
    const action = KEY_ACTIONS[ke.code];
    if (!action) return;
    // 方向键/空格滚动页面 = 驾驶事故，一律拦截
    ke.preventDefault();
    keys[action] = down;
    if (down) driven = true;
  };
  on(window, 'keydown', onKey(true));
  on(window, 'keyup', onKey(false));

  // ---- 触屏虚拟摇杆（动态原点） ----
  let stickX = 0; // -1(右) ~ 1(左) 之前先按屏幕 dx 记，read() 时换算
  let stickY = 0; // -1(后) ~ 1(前)
  let activePointer: number | null = null;
  let originX = 0;
  let originY = 0;
  let baseEl: HTMLDivElement | null = null;
  let knobEl: HTMLDivElement | null = null;
  const RADIUS = 52; // px

  if (joystickHost) {
    baseEl = document.createElement('div');
    baseEl.className = 'ws-nipple-base';
    knobEl = document.createElement('div');
    knobEl.className = 'ws-nipple-knob';
    baseEl.appendChild(knobEl);
    baseEl.style.display = 'none';
    joystickHost.appendChild(baseEl);

    const place = (el: HTMLElement, x: number, y: number) => {
      const rect = joystickHost.getBoundingClientRect();
      el.style.left = `${x - rect.left}px`;
      el.style.top = `${y - rect.top}px`;
    };

    on(
      stage,
      'pointerdown',
      ((e: PointerEvent) => {
        if (e.pointerType === 'mouse' || activePointer !== null) return;
        activePointer = e.pointerId;
        originX = e.clientX;
        originY = e.clientY;
        stickX = 0;
        stickY = 0;
        driven = true;
        baseEl!.style.display = 'block';
        place(baseEl!, originX, originY);
        knobEl!.style.transform = 'translate(-50%, -50%)';
        stage.setPointerCapture(e.pointerId);
        e.preventDefault();
      }) as EventListener,
      { passive: false },
    );
    on(stage, 'pointermove', ((e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      const dx = e.clientX - originX;
      const dy = e.clientY - originY;
      const len = Math.hypot(dx, dy);
      const k = len > RADIUS ? RADIUS / len : 1;
      knobEl!.style.transform = `translate(calc(${dx * k}px - 50%), calc(${dy * k}px - 50%))`;
      // 死区 18%，其余线性
      const norm = (v: number) => {
        const n = (v * k) / RADIUS;
        return Math.abs(n) < 0.18 ? 0 : (n - Math.sign(n) * 0.18) / 0.82;
      };
      stickX = norm(dx);
      stickY = -norm(dy); // 屏幕上推 = 前进
    }) as EventListener);
    const release = ((e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      stickX = 0;
      stickY = 0;
      baseEl!.style.display = 'none';
    }) as EventListener;
    on(stage, 'pointerup', release);
    on(stage, 'pointercancel', release);
  }

  // ---- 意图合成（对象复用零分配） ----
  const intent: DriveIntent = { throttle: 0, steer: 0, boost: false, brake: false };

  return {
    read() {
      const kThrottle = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0);
      const kSteer = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
      intent.throttle = kThrottle !== 0 ? kThrottle : stickY;
      // steer 约定：+1 = 左；摇杆向左推 dx<0 → stickX<0 → 取负
      intent.steer = kSteer !== 0 ? kSteer : -stickX;
      intent.boost = keys.boost;
      intent.brake = keys.brake;
      return intent;
    },
    consumeRespawn() {
      const v = respawnPulse;
      respawnPulse = false;
      return v;
    },
    hasDriven: () => driven,
    dispose() {
      for (const { el, type, fn } of listeners) el.removeEventListener(type, fn);
      listeners.length = 0;
      baseEl?.remove();
    },
  };
}
