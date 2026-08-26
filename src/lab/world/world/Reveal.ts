// CC-E6：Reveal —— 首幕剧本编排（folio Intro + Reveal 合并移植的科技城版；
// 实施方案 §1.2 首幕 30 秒时间轴 / §3.2「world/Reveal(Intro+Reveal 合并移植)」；
// 补间与延时一律 Ticker.wait/delay + 手写缓动——gsap 禁令，第 6 章依赖红线）。
//
// 职责边界（与 TransformSystem 分工）：
//   · TransformSystem 管「形态与物理」（状态机、热交换、filters intro→driving）；
//   · Reveal 管「演出与 DOM」：机器人光柱开演节奏、CTA「变形 · 巡航态」（点击或
//     Space，CITY-05 唯一主 CTA）、变形期间 disabled + 进度可见、键位提示浮现
//     3s 后淡出（再次按键即隐）、data-world-state 状态镜像（e2e SEL 契约 +
//     CC-E7 壳 CSS 钩子）、aria-live 文字状态提示（reduced-motion 验收）。
//
// DOM 契约（e2e/cyber-city.spec.ts SEL 常量区对齐；CC-E7 壳可整体复用）：
//   host[data-world-state]     robot_idle | transforming | car_ready | driving
//   [data-world-transform]     主 CTA（transforming 期间 disabled；car_ready 后隐藏）
//   [data-world-status]        role="status" aria-live 文字状态（reduced-motion 口径）
//   [data-world-hint]          键位提示（car_ready 浮现，driving/超时淡出）
// 埋点：首幕开演 game.events.trigger('world-reveal')（实施方案 §1.1 幕②）。
//
// 循环动画配额（CITY-03 ≤2 处）：机器人 idle 呼吸灯由本类驱动 update()；
// 热交换为车后停驱（E5 交接：释放配额），回变机器人时恢复。
import { NEON } from '../../../data/neon-tokens';
import type { Game } from '../core/Game';
import type { HeroRobot } from '../city/HeroRobot';
import type { TransformState, TransformSystem } from '../player/TransformSystem';

/** 机器人光柱显现总长（HeroRobot PILLAR_FADE_END ≈1.1s）后进 robot_idle */
const ROBOT_REVEAL_DURATION = 1.15;
/** 键位提示自动淡出（实施方案 §1.2「操作提示浮现 3s 后淡出」，留读完余量） */
const HINT_FADE_DELAY = 4;

const STATUS_TEXT: Record<TransformState, string> = {
  robot_idle: '机器人形态 · 座舱 AI 就位——点击「变形 · 巡航态」或按 Space',
  transforming: '变形中 · 光幕遮蔽热交换，量产载体落地十字路口…',
  car_ready: '巡航态 · CarConcept 已落地十字路口——WASD 即刻可开',
  driving: '驾驶中 · WASD/方向键转向，Shift 加速，R 回到路口',
};

export interface RevealOptions {
  /** 状态镜像宿主（data-world-state 落点；壳页 [data-ws-host] / CC-E7 [data-world-host]） */
  host: HTMLElement;
  /** DOM 覆盖层挂载点（canvas 同级舞台元素） */
  stage: HTMLElement;
  robot: HeroRobot;
  transformSystem: TransformSystem;
  reducedMotion?: boolean;
}

export class Reveal {
  private readonly game: Game;
  private readonly host: HTMLElement;
  private readonly robot: HeroRobot;
  private readonly transformSystem: TransformSystem;
  private readonly reducedMotion: boolean;

  private root!: HTMLElement;
  private cta!: HTMLButtonElement;
  private status!: HTMLElement;
  private hint!: HTMLElement;

  private ctaArmed = false;
  private robotTicking = false;
  private hintFade: { kill(): void } | null = null;
  private readonly unsubscribeState: () => void;
  private disposed = false;

  private readonly robotTickHandler = (): void => {
    this.robot.update(this.game.ticker.delta, this.game.ticker.elapsed);
  };

  private readonly transformActionHandler = (action: { active: boolean }): void => {
    if (action.active) this.requestTransform();
  };

  private readonly swapHandler = (to: 'robot' | 'car'): void => {
    // 热交换：为车后停掉机器人 update 驱动，释放 idle 呼吸灯循环配额（E5 交接约定）
    if (to === 'car') this.stopRobotTick();
    else this.startRobotTick();
  };

  constructor(game: Game, options: RevealOptions) {
    this.game = game;
    this.host = options.host;
    this.robot = options.robot;
    this.transformSystem = options.transformSystem;
    this.reducedMotion = options.reducedMotion ?? false;

    this.setDom(options.stage);
    this.startRobotTick();

    // 状态镜像 + 演出编排跟随状态机
    this.unsubscribeState = this.transformSystem.onStateChange((state) => {
      this.applyState(state);
    });
    this.transformSystem.events.on('swap', this.swapHandler);

    // CTA 键触发：Space 仅在 intro 上下文有效（filters 天然闸门——
    // driving 后 Space 归还给刹车，悬挂跳在 KeyF；动作表见 Player.setInputs / A2 M7-M8）
    this.game.inputs.addActions([
      { name: 'transform', categories: ['intro'], keys: ['Keyboard.Space'] },
    ]);
    this.game.inputs.events.on('transform', this.transformActionHandler);

    // 首幕开演：等 shader 编译落地几拍（Game 坑④节奏，E5 同款）再起光柱
    this.game.ticker.wait(6, () => {
      if (this.disposed) return;
      this.robot.reveal();
      this.game.events.trigger('world-reveal');
      console.info('[reveal] 首幕开演：机器人光柱显现（world-reveal）');
      if (this.reducedMotion) this.enterRobotIdle();
      else this.game.ticker.delay(ROBOT_REVEAL_DURATION, () => this.enterRobotIdle());
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopRobotTick();
    this.hintFade?.kill();
    this.unsubscribeState();
    this.transformSystem.events.off('swap', this.swapHandler);
    this.game.inputs.events.off('transform', this.transformActionHandler);
    this.root.remove();
    delete this.host.dataset.worldState;
  }

  /* ———————————————————— 演出编排 ———————————————————— */

  private enterRobotIdle(): void {
    if (this.disposed) return;
    this.ctaArmed = true;
    this.applyState('robot_idle');
    console.info(
      '[reveal] 首幕就绪：robot_idle——CTA「变形 · 巡航态」可用（点击或 Space），' +
        `reduced-motion=${this.reducedMotion}`,
    );
  }

  private requestTransform(): void {
    if (!this.ctaArmed || this.disposed) return;
    if (this.transformSystem.state !== 'robot_idle') return;
    void this.transformSystem.transform('car');
  }

  private applyState(state: TransformState): void {
    this.host.dataset.worldState = state;
    this.status.textContent = STATUS_TEXT[state];

    switch (state) {
      case 'robot_idle':
        this.cta.hidden = false;
        this.cta.disabled = false;
        this.hideHint();
        break;
      case 'transforming':
        // CITY-05 验收：变形期间按钮 disabled + 进度可见（进度条随 host 态由 CSS 驱动）
        this.cta.disabled = true;
        break;
      case 'car_ready':
        this.cta.hidden = true;
        this.showHint();
        break;
      case 'driving':
        // 再次按键即隐（实施方案 §1.2）
        this.hideHint();
        break;
    }
  }

  private showHint(): void {
    this.hint.hidden = false;
    this.hintFade?.kill();
    this.hintFade = this.game.ticker.delay(HINT_FADE_DELAY, () => this.hideHint());
  }

  private hideHint(): void {
    this.hintFade?.kill();
    this.hintFade = null;
    this.hint.hidden = true;
  }

  private startRobotTick(): void {
    if (this.robotTicking) return;
    this.robotTicking = true;
    this.game.ticker.events.on('tick', this.robotTickHandler);
  }

  private stopRobotTick(): void {
    if (!this.robotTicking) return;
    this.robotTicking = false;
    this.game.ticker.events.off('tick', this.robotTickHandler);
  }

  /* ———————————————————— DOM 覆盖层 ———————————————————— */

  private setDom(stage: HTMLElement): void {
    this.injectStyles();

    this.root = document.createElement('div');
    this.root.className = 'world-ritual';
    this.root.dataset.worldRitual = '';

    this.status = document.createElement('p');
    this.status.className = 'world-ritual-status';
    this.status.dataset.worldStatus = '';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');
    this.status.textContent = '首幕加载中 · 座舱 AI 机器人显现在即…';

    this.cta = document.createElement('button');
    this.cta.type = 'button';
    this.cta.className = 'world-ritual-cta';
    this.cta.dataset.worldTransform = '';
    this.cta.setAttribute('aria-keyshortcuts', 'Space');
    this.cta.innerHTML = '变形 · 巡航态 <kbd>Space</kbd>';
    this.cta.hidden = true;
    this.cta.addEventListener('click', () => this.requestTransform());

    const progress = document.createElement('span');
    progress.className = 'world-ritual-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.appendChild(document.createElement('i'));

    this.hint = document.createElement('p');
    this.hint.className = 'world-ritual-hint';
    this.hint.dataset.worldHint = '';
    this.hint.textContent =
      'W/A/S/D 或方向键驾驶 · Shift 加速 · Space/B 刹车 · F 悬挂跳 · R 回到路口';
    this.hint.hidden = true;

    this.root.append(this.status, this.cta, progress, this.hint);
    stage.appendChild(this.root);
  }

  private injectStyles(): void {
    const styleId = 'world-ritual-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    // 覆盖层样式自带（隐藏路径演示自足；CC-E7 壳接管后可平移进壳页样式表）
    style.textContent = `
.world-ritual{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:.7rem;padding-bottom:8%;pointer-events:none;text-align:center;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Noto Sans CJK SC',sans-serif}
.world-ritual-status{margin:0;font-size:.78rem;letter-spacing:.08em;color:#bdfff4;background:rgba(10,14,20,.66);border:1px solid rgba(73,197,182,.45);border-radius:999px;padding:.38em 1.2em;text-shadow:0 0 8px rgba(73,197,182,.55)}
.world-ritual-cta{pointer-events:auto;font:inherit;font-size:1.02rem;font-weight:600;letter-spacing:.22em;color:#eafffb;cursor:pointer;padding:.85em 2.3em;border-radius:999px;border:1px solid rgba(73,197,182,.85);background:linear-gradient(180deg,rgba(18,46,52,.92),rgba(10,22,30,.92));box-shadow:0 0 26px rgba(73,197,182,.4),inset 0 0 14px rgba(73,197,182,.28);text-shadow:0 0 10px rgba(73,197,182,.8);transition:box-shadow .25s,transform .25s}
.world-ritual-cta:hover:not(:disabled){box-shadow:0 0 40px rgba(73,197,182,.65),inset 0 0 18px rgba(73,197,182,.4);transform:translateY(-1px)}
.world-ritual-cta:disabled{opacity:.55;cursor:wait}
.world-ritual-cta[hidden]{display:none}
.world-ritual-cta kbd{font:inherit;font-size:.7em;letter-spacing:.1em;padding:.15em .55em;margin-left:.4em;border:1px solid rgba(234,255,251,.4);border-radius:6px;background:rgba(234,255,251,.08)}
.world-ritual-progress{display:none;width:210px;height:3px;border-radius:2px;background:rgba(234,255,251,.16);overflow:hidden}
.world-ritual-progress i{display:block;width:0;height:100%;background:linear-gradient(90deg,${NEON.cyan},#bdfff4)}
[data-world-state='transforming'] .world-ritual-progress{display:block}
[data-world-state='transforming'] .world-ritual-progress i{animation:world-ritual-charge 1.05s linear forwards}
.world-ritual-hint{margin:0;font-size:.8rem;color:#dfe2e7;background:rgba(12,13,17,.66);border-radius:999px;padding:.4em 1.2em;transition:opacity .4s}
.world-ritual-hint[hidden]{display:none}
@keyframes world-ritual-charge{from{width:0}to{width:100%}}
@media (prefers-reduced-motion:reduce){.world-ritual-cta{transition:none}[data-world-state='transforming'] .world-ritual-progress i{animation:none;width:100%}}
`;
    document.head.appendChild(style);
  }
}
