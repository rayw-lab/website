// CC-FXN-C2：DriveFeedback —— 驾驶反馈 DOM 层（功能 rubric F2「反馈闭环才算数」
// 铁律的确认层：输入/碰撞 → 世界响应 → 本层给玩家可感知确认）。
// 顾问报告 §4.2 PR #1 交付面四件：
//   ① cone-hit HUD 脉冲（灰盒锥桶 + 城市隔离墩统一「碰撞 ×N」瞬时脉冲）；
//   ② respawn toast（R 复位 / 坠落兜底两文案，reason 随 player 'respawn' 事件透传）；
//   ③ boost 可感知强化（BOOST 徽标 + 全屏速度暗角 + [data-ws-speed] 数字辉光——
//      View.ts 域外禁入，速度感强化全走 DOM 通道）；
//   ④ 翻车自救可视化倒计时（Player.rescueCountdown 镜像 → 倒计时数字 + 进度条 +
//      「R 立即复位」提示，flipJump 重试自动回充）。
//
// 纪律红线：
//   · ritual_idle 恒等：样式层显式门控——host[data-world-state] 为 robot_idle /
//     transforming 时整层 display:none（事件在这两态本就物理不可达：输入被 filters
//     拦、物理体冻结，此门是恒等合同的机器兜底）；
//   · CITY-03 循环动画配额：全部呈现为一次性事件驱动（pop 动画单次播完即静止、
//     暗角/进度条走 transition），零 infinite 关键帧——不占 ≤2 处 idle 循环配额；
//   · 埋点随行 = 复用：本层零新增白名单事件——cone-hit / respawn / boost-first /
//     upside-down / flip-jump 均已在 OBS-C1 接线，本层只是这些既有事件的呈现面；
//   · reduced-motion：动画/过渡压至 0.01ms（状态指示保留——boost 徽标 / 倒计时
//     是操作性信息而非动效，不因偏好剥夺）；
//   · 样式内联注入（Reveal.injectStyles 先例），壳静态段零字节、LHCI 零影响；
//   · pointer-events:none 全层穿透，不遮 CTA/HUD/摇杆热区。
import { RESCUE_DELAY, type RespawnReason } from '../player/Player';
import type { Game } from '../core/Game';

/** toast 驻留时长（设计秒，Ticker.delay 时基——暂停即冻结，SwiftShader 慢放同倍） */
const TOAST_DURATION = 2.8;
/** 碰撞脉冲驻留时长（设计秒） */
const PULSE_DURATION = 1.6;

const TOAST_TEXT: Record<RespawnReason, string> = {
  key: '已复位 · 回到最近路口',
  fall: '掉出边界 · 已就近重生',
  unstuck: '已脱困 · 回到最近路口', // 枚举预留位（屏上 unstuck 按钮未移植）
};

export class DriveFeedback {
  private readonly game: Game;
  /** 壳 HUD 速度数字（缺席容忍）：boost 期挂 data-boost='1' 上辉光（③ 的 DOM 通道） */
  private readonly speedEl: HTMLElement | null;

  private root!: HTMLElement;
  private collision!: HTMLElement;
  private toast!: HTMLElement;
  private boost!: HTMLElement;
  private flip!: HTMLElement;
  private flipCount!: HTMLElement;
  private flipBar!: HTMLElement;

  private toastFade: { kill(): void } | null = null;
  private pulseFade: { kill(): void } | null = null;
  private boostActive = false;
  /** 倒计时显示缓存（0.1s 量化）：仅变化帧写 DOM，防 0.25s 节拍空写 */
  private rescueShown: number | null = null;
  private disposed = false;

  constructor(game: Game, options: { stage: HTMLElement; speedEl?: HTMLElement | null }) {
    this.game = game;
    this.speedEl = options.speedEl ?? null;
    this.setDom(options.stage);
  }

  /** ① 碰撞脉冲：锥桶/隔离墩撞击沿触发（total = 累计数，index.ts 沿检测同源） */
  collisionPulse(total: number): void {
    if (this.disposed) return;
    this.collision.textContent = `碰撞 ×${total}`;
    this.collision.hidden = false;
    this.pop(this.collision);
    this.pulseFade?.kill();
    this.pulseFade = this.game.ticker.delay(PULSE_DURATION, () => {
      this.collision.hidden = true;
    });
  }

  /** ② respawn toast：player 'respawn' 事件 reason ∈ key/fall/unstuck 时呈现 */
  respawnToast(reason: RespawnReason): void {
    if (this.disposed) return;
    this.toast.textContent = TOAST_TEXT[reason];
    this.toast.hidden = false;
    this.pop(this.toast);
    this.toastFade?.kill();
    this.toastFade = this.game.ticker.delay(TOAST_DURATION, () => {
      this.toast.hidden = true;
    });
  }

  /** ③ boost 徽标 + 暗角 + 速度数字辉光（inputs 'boost' 动作沿驱动，即按即亮） */
  setBoost(active: boolean): void {
    if (this.disposed || active === this.boostActive) return;
    this.boostActive = active;
    if (active) {
      this.root.dataset.boost = '1';
      if (this.speedEl) this.speedEl.dataset.boost = '1';
      this.boost.hidden = false;
      this.pop(this.boost);
    } else {
      delete this.root.dataset.boost;
      if (this.speedEl) delete this.speedEl.dataset.boost;
      this.boost.hidden = true;
    }
  }

  /** ④ 翻车自救倒计时（Player.rescueCountdown 镜像；null = 收窗） */
  setRescue(remaining: number | null): void {
    if (this.disposed) return;
    if (remaining === null) {
      if (!this.flip.hidden) this.flip.hidden = true;
      this.rescueShown = null;
      return;
    }
    if (this.flip.hidden) {
      this.flip.hidden = false;
      this.pop(this.flip);
    }
    const quantized = Math.max(0, Math.round(remaining * 10) / 10);
    if (quantized === this.rescueShown) return;
    this.rescueShown = quantized;
    this.flipCount.textContent = quantized.toFixed(1);
    this.flipBar.style.width = `${Math.min((quantized / RESCUE_DELAY) * 100, 100)}%`;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.toastFade?.kill();
    this.pulseFade?.kill();
    // 壳 HUD 元素归壳所有：撤走本层挂的属性，不留残迹
    if (this.speedEl) delete this.speedEl.dataset.boost;
    this.root.remove();
  }

  /* ———————————————————— DOM ———————————————————— */

  /** 一次性 pop 动画重触发（remove → reflow → add；CITY-03：单次播完即静止） */
  private pop(el: HTMLElement): void {
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
  }

  private setDom(stage: HTMLElement): void {
    this.injectStyles();

    this.root = document.createElement('div');
    this.root.className = 'world-fb';
    this.root.dataset.worldFeedback = '';
    this.root.setAttribute('aria-hidden', 'true');

    const vignette = document.createElement('i');
    vignette.className = 'world-fb-vignette';

    // 顶部瞬时消息列（toast 与碰撞脉冲纵向堆叠，互不遮挡）
    const stack = document.createElement('div');
    stack.className = 'world-fb-stack';

    this.collision = document.createElement('p');
    this.collision.className = 'world-fb-chip world-fb-collision';
    this.collision.dataset.worldCollision = '';
    this.collision.hidden = true;

    this.toast = document.createElement('p');
    this.toast.className = 'world-fb-chip world-fb-toast';
    this.toast.dataset.worldToast = '';
    this.toast.hidden = true;

    stack.append(this.collision, this.toast);

    this.boost = document.createElement('p');
    this.boost.className = 'world-fb-boost';
    this.boost.dataset.worldBoost = '';
    this.boost.textContent = 'BOOST';
    this.boost.hidden = true;

    this.flip = document.createElement('div');
    this.flip.className = 'world-fb-flip';
    this.flip.dataset.worldFlip = '';
    this.flip.hidden = true;

    const flipTitle = document.createElement('p');
    flipTitle.className = 'world-fb-flip-title';
    flipTitle.textContent = '翻车检测 · 自动翻正';

    const flipNum = document.createElement('p');
    flipNum.className = 'world-fb-flip-num';
    this.flipCount = document.createElement('span');
    this.flipCount.dataset.worldFlipCount = '';
    this.flipCount.textContent = RESCUE_DELAY.toFixed(1);
    const flipUnit = document.createElement('span');
    flipUnit.className = 'world-fb-flip-unit';
    flipUnit.textContent = 's';
    flipNum.append(this.flipCount, flipUnit);

    const flipTrack = document.createElement('span');
    flipTrack.className = 'world-fb-flip-track';
    this.flipBar = document.createElement('i');
    flipTrack.appendChild(this.flipBar);

    const flipHint = document.createElement('p');
    flipHint.className = 'world-fb-flip-hint';
    flipHint.textContent = 'R 立即回到路口';

    this.flip.append(flipTitle, flipNum, flipTrack, flipHint);

    this.root.append(vignette, stack, this.boost, this.flip);
    stage.appendChild(this.root);
  }

  private injectStyles(): void {
    const styleId = 'world-feedback-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    // 霓虹语汇对齐既有 HUD（青主轴 + boost 品红轴，双主轴色纪律）；全层穿透不接管指针
    style.textContent = `
.world-fb{position:absolute;inset:0;z-index:5;pointer-events:none;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Noto Sans CJK SC',sans-serif;text-align:center}
[data-world-state='robot_idle'] .world-fb,[data-world-state='transforming'] .world-fb{display:none!important}
.world-fb-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 52%,rgba(152,32,84,.28) 82%,rgba(255,62,145,.38) 100%);opacity:0;transition:opacity .3s ease}
.world-fb[data-boost='1'] .world-fb-vignette{opacity:1}
.world-fb-stack{position:absolute;top:3.4rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.45rem;max-width:92%}
.world-fb-chip{margin:0;font-size:.85rem;letter-spacing:.06em;color:#eafffb;background:rgba(8,13,19,.78);border:1px solid rgba(73,197,182,.55);border-radius:999px;padding:.42em 1.25em;text-shadow:0 0 8px rgba(73,197,182,.55);box-shadow:0 0 14px rgba(73,197,182,.22)}
.world-fb-chip[hidden]{display:none}
.world-fb-collision{color:#ffe6d9;border-color:rgba(255,150,64,.6);text-shadow:0 0 8px rgba(255,150,64,.6);box-shadow:0 0 14px rgba(255,150,64,.25)}
.world-fb-boost{position:absolute;left:50%;bottom:6.4rem;transform:translateX(-50%);margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.92rem;font-weight:700;letter-spacing:.34em;padding:.4em 1.3em .4em 1.55em;color:#ffe9f4;background:rgba(24,7,16,.72);border:1px solid rgba(255,62,145,.75);border-radius:999px;text-shadow:0 0 12px rgba(255,62,145,.9);box-shadow:0 0 20px rgba(255,62,145,.35),inset 0 0 10px rgba(255,62,145,.22)}
.world-fb-boost[hidden]{display:none}
[data-ws-speed][data-boost='1']{color:#ffe9f4!important;text-shadow:0 0 16px rgba(255,62,145,.95)!important}
.world-fb-flip{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);width:15.5rem;padding:.9rem 1.2rem 1rem;background:rgba(8,12,19,.82);border:1px solid rgba(73,197,182,.6);border-radius:14px;box-shadow:0 0 26px rgba(73,197,182,.25)}
.world-fb-flip[hidden]{display:none}
.world-fb-flip-title{margin:0 0 .2rem;font-size:.78rem;letter-spacing:.18em;color:#bdfff4;text-shadow:0 0 8px rgba(73,197,182,.55)}
.world-fb-flip-num{margin:0 0 .45rem;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:1.9rem;font-weight:650;line-height:1.1;color:#eef2f7;text-shadow:0 0 12px rgba(73,197,182,.55)}
.world-fb-flip-unit{font-size:.6em;margin-left:.12em;color:#9fb3ad}
.world-fb-flip-track{display:block;height:4px;border-radius:2px;background:rgba(234,255,251,.16);overflow:hidden}
.world-fb-flip-track i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--neon-cyan,#49c5b6),#bdfff4);transition:width .25s linear}
.world-fb-flip-hint{margin:.55rem 0 0;font-size:.75rem;letter-spacing:.06em;color:#dfe5ec}
.world-fb .is-pop{animation:world-fb-pop .45s ease}
@keyframes world-fb-pop{0%{transform:scale(.86);opacity:.4}60%{transform:scale(1.06)}100%{transform:scale(1)}}
.world-fb-flip.is-pop{animation:world-fb-flip-pop .45s ease}
@keyframes world-fb-flip-pop{0%{transform:translate(-50%,-50%) scale(.9);opacity:.4}100%{transform:translate(-50%,-50%) scale(1)}}
@media (prefers-reduced-motion:reduce){.world-fb .is-pop,.world-fb-flip.is-pop{animation-duration:.01ms}.world-fb-vignette,.world-fb-flip-track i{transition-duration:.01ms}}
`;
    document.head.appendChild(style);
  }
}
