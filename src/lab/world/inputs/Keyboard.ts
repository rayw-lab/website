// 移植自 folio-2025 sources/Game/Inputs/Keyboard.js（49 行）。
// 保留：code 与 key 双注册（动作表可写 Keyboard.KeyW 或 Keyboard.w）、
// blur 时全键抬起（防切窗后按键卡死）、输入框聚焦时吞键（Escape 除外）。
// 改动：监听接 AbortSignal（dispose 解绑，SRD §9.2）；
//   驾驶键 preventDefault（CC-E2 承接 spike inputs.ts 纪律：方向键/空格滚动页面
//   = 驾驶事故，一律拦截——输入框聚焦守卫在前，不影响正常打字）。
import { Events } from '../core/Events';

/** 拦截 UA 默认行为的驾驶键（方向键滚页、Space 滚页/触发聚焦按钮） */
const PREVENT_DEFAULT_CODES = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
]);

export class Keyboard {
  readonly events = new Events();
  private pressed: string[] = [];

  constructor(signal: AbortSignal) {
    // 失焦 → 全部按下的键触发 up（folio：防加载切窗后车辆自己跑）
    window.addEventListener(
      'blur',
      () => {
        for (const key of this.pressed) this.events.trigger('up', [key]);
        this.pressed = [];
      },
      { signal },
    );

    addEventListener(
      'keydown',
      (event) => {
        // 输入框内不吞键（Escape 除外）
        if (
          document.activeElement?.matches('input, textarea, [contenteditable]') &&
          event.code !== 'Escape'
        )
          return;

        if (PREVENT_DEFAULT_CODES.has(event.code)) event.preventDefault();

        this.pressed.push(event.code, event.key);
        this.events.trigger('down', [event.code, event.key]);
      },
      { signal },
    );

    addEventListener(
      'keyup',
      (event) => {
        // Space 对聚焦按钮的 click 激活发生在 keyup——刹车键不得误触「进入」按钮
        if (PREVENT_DEFAULT_CODES.has(event.code)) event.preventDefault();

        const indexCode = this.pressed.indexOf(event.code);
        if (indexCode !== -1) this.pressed.splice(indexCode, 1);

        const indexKey = this.pressed.indexOf(event.key);
        if (indexKey !== -1) this.pressed.splice(indexKey, 1);

        this.events.trigger('up', [event.code, event.key]);
      },
      { signal },
    );
  }
}
