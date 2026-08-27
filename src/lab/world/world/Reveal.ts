// CC-E6：Reveal —— 首幕剧本编排（folio Intro + Reveal 合并移植的科技城版；
// 实施方案 §1.2 首幕 30 秒时间轴 / §3.2「world/Reveal(Intro+Reveal 合并移植)」；
// 补间与延时一律 Ticker.wait/delay + 手写缓动——gsap 禁令，第 6 章依赖红线）。
//
// 职责边界（与 TransformSystem 分工）：
//   · TransformSystem 管「形态与物理」（状态机、热交换、filters intro→driving）；
//   · Reveal 管「演出与 DOM」：机器人光柱开演节奏、CTA「变形 · 巡航态」（点击或
//     Space，CITY-05 唯一主 CTA）、变形期间 disabled + 进度可见、键位卡浮现与
//     再唤出（下详）、data-world-state 状态镜像（e2e SEL 契约 +
//     CC-E7 壳 CSS 钩子）、aria-live 文字状态提示（reduced-motion 验收）。
//
// [CC-FXN-C1] 键位卡/引导人性化（GAP-08/GAP-18，功能 rubric F1/F5）：
//   · 键位卡可再唤出：H（或 ?/Slash）与「键位」按钮 [data-world-hint-recall] toggle——
//     动作 categories 只有 'driving'（filters 热切后 = car_ready 起放行；robot_idle/
//     transforming 被 intro 闸门物理拦截，ritual_idle 恒等零旁路）；唤出为常显
//     （用户显式索取不再自动淡出，由 H/按钮/状态收回关闭）；
//   · 首驶引导：car_ready 浮现的键位卡在 driving 接管时不再即隐——重开一个完整
//     HINT_FADE_DELAY 阅读窗（刹车/E 进站/Esc 在首驶 5 秒内仍可读）；
//   · 触屏分文案：matchMedia('(pointer: coarse)')（SessionTimeline env.touch 同口径）
//     选 hint/status 触屏变体（键盘键位对触屏用户是噪声，GAP-18）；
//   · 埋点随行：hint-shown（car_ready 自动浮现）/ hint-recall {via: key|button}（再唤出）/
//     hint-dismissed {by: timeout|input}（观测规格 §3.4 ux 族，hint-recall 为随行加法）。
//
// DOM 契约（e2e/cyber-city.spec.ts SEL 常量区对齐；CC-E7 壳可整体复用）：
//   host[data-world-state]      robot_idle | transforming | car_ready | driving
//   [data-world-transform]      主 CTA（transforming 期间 disabled；car_ready 后隐藏）
//   [data-world-status]         role="status" aria-live 文字状态（reduced-motion 口径）
//   [data-world-hint]           键位卡（car_ready 浮现、超时淡出、H/按钮可再唤出）
//   [data-world-hint-recall]    键位卡唤出按钮（car_ready 起可见；触屏召回入口）
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

/**
 * [CC-FXN-C1] 键位卡文案（GAP-08 修复：E 进站 / Esc 菜单补进卡片——此前首驶
 * 5 秒后对玩家永久失明）。「V 切换视角」位次维持 VEH spec §8.2 冻结序
 * （插入刹车之后）；串尾加法随行注记见该 spec §8.2。
 */
const HINT_TEXT =
  'W/A/S/D 或方向键驾驶 · Shift 加速 · Space/B 刹车 · V 切换视角 · F 悬挂跳 · R 回到路口 · E 进站 · Esc 菜单';
/** 触屏键位卡（GAP-18：Nipple = 拖动摇杆转向加速 + 点按跳；POI = 点按标点进站；
 *  复位走壳 HUD「回到路口 (R)」按钮——键盘口径对触屏用户是噪声，整卡换稿） */
const HINT_TEXT_TOUCH =
  '拖动屏幕摇杆驾驶转向 · 点按屏幕跳跃 · 驶近光圈点按标点进站 · 「回到路口」按钮复位';

const STATUS_TEXT: Record<TransformState, string> = {
  robot_idle: '机器人形态 · 座舱 AI 就位——点击「变形 · 巡航态」或按 Space',
  transforming: '变形中 · 光幕遮蔽热交换，量产载体落地十字路口…',
  car_ready: '巡航态 · CarConcept 已落地十字路口——WASD 即刻可开',
  // [CC-FXN-C1] 常驻行补键位卡召回入口（GAP-08：卡片淡出后 status 是唯一常显文字面）
  driving: '驾驶中 · WASD/方向键转向，Shift 加速，V 切换视角，R 回到路口——按 H 重看键位',
};

/** [CC-FXN-C1] 触屏状态行（GAP-18 分文案；transforming 无键位语，双模同稿） */
const STATUS_TEXT_TOUCH: Record<TransformState, string> = {
  robot_idle: '机器人形态 · 座舱 AI 就位——点按「变形 · 巡航态」启动',
  transforming: STATUS_TEXT.transforming,
  car_ready: '巡航态 · CarConcept 已落地十字路口——拖动屏幕摇杆即刻可开',
  driving: '驾驶中 · 拖动摇杆转向加速，点按屏幕跳跃——点「操作说明」重看操作',
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
  /** [CC-FXN-C1] 键位卡唤出按钮（触屏召回入口；car_ready 起可见） */
  private recallBtn!: HTMLButtonElement;

  private ctaArmed = false;
  private robotTicking = false;
  private hintFade: { kill(): void } | null = null;
  /** [CC-FXN-C1] 触屏检测（构造时快照，SessionTimeline env.touch 同口径） */
  private readonly touch = matchMedia('(pointer: coarse)').matches;
  private readonly statusText: Record<TransformState, string>;
  private readonly unsubscribeState: () => void;
  private disposed = false;

  private readonly robotTickHandler = (): void => {
    this.robot.update(this.game.ticker.delta, this.game.ticker.elapsed);
  };

  private readonly transformActionHandler = (action: { active: boolean }): void => {
    if (action.active) this.requestTransform();
  };

  /** [CC-FXN-C1] H/? 键位卡 toggle（isToggle 语义：按下翻转一次，长按不连发） */
  private readonly hintToggleHandler = (action: { active: boolean }): void => {
    if (action.active) this.toggleHint('key');
  };

  private readonly swapHandler = (to: 'robot' | 'car'): void => {
    // 热交换：为车后停掉机器人 update 驱动，释放 idle 呼吸灯循环配额（E5 交接约定）
    if (to === 'car') this.stopRobotTick();
    else this.startRobotTick();
  };

  /**
   * [CC-VEH-VIEW] data-drive-view 镜像（spec §5.2）：消费 'world-drive-view'
   * [mode] 埋点（world-transform 先例同机制）。属性挂载窗 = car_ready 起
   * （applyState 落初值）；robot_idle 期间属性缺席——DOM 面恒等。
   */
  private readonly driveViewHandler = (mode: 'third' | 'fpv'): void => {
    this.host.dataset.driveView = mode;
  };

  constructor(game: Game, options: RevealOptions) {
    this.game = game;
    this.host = options.host;
    this.robot = options.robot;
    this.transformSystem = options.transformSystem;
    this.reducedMotion = options.reducedMotion ?? false;
    this.statusText = this.touch ? STATUS_TEXT_TOUCH : STATUS_TEXT;

    this.setDom(options.stage);
    this.startRobotTick();

    // 状态镜像 + 演出编排跟随状态机
    this.unsubscribeState = this.transformSystem.onStateChange((state) => {
      this.applyState(state);
    });
    this.transformSystem.events.on('swap', this.swapHandler);
    this.game.events.on('world-drive-view', this.driveViewHandler);

    // CTA 键触发：Space 仅在 intro 上下文有效（filters 天然闸门——
    // driving 后 Space 归还给刹车，悬挂跳在 KeyF；动作表见 Player.setInputs / A2 M7-M8）。
    // [CC-FXN-C1] hintToggle：H 主键 + Slash（?/ 同码）副键；categories 只有
    // 'driving' —— car_ready 帧 filters 已热切（TransformSystem.finish），robot_idle/
    // transforming 被 intro 闸门物理拦截（ritual_idle 恒等）。不进 DRIVE_ACTIONS
    // （看键位 ≠ 驾驶意图，与 V 键同纪律）。
    this.game.inputs.addActions([
      { name: 'transform', categories: ['intro'], keys: ['Keyboard.Space'] },
      { name: 'hintToggle', categories: ['driving'], keys: ['Keyboard.KeyH', 'Keyboard.Slash'] },
    ]);
    this.game.inputs.events.on('transform', this.transformActionHandler);
    this.game.inputs.events.on('hintToggle', this.hintToggleHandler);

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
    this.game.events.off('world-drive-view', this.driveViewHandler);
    this.game.inputs.events.off('transform', this.transformActionHandler);
    this.game.inputs.events.off('hintToggle', this.hintToggleHandler);
    this.root.remove();
    delete this.host.dataset.worldState;
    delete this.host.dataset.driveView;
  }

  /* ———————————————————— 演出编排 ———————————————————— */

  private enterRobotIdle(): void {
    if (this.disposed) return;
    this.ctaArmed = true;
    this.applyState('robot_idle');
    // [CC-OBS-C1] 漏斗步②：CTA armed（观测规格 §3.4 lifecycle/robot-idle 行）
    this.game.session.log('robot-idle');
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
    this.status.textContent = this.statusText[state];
    // [CC-FXN-C1] 键位卡唤出按钮：car_ready 起可见（与 hint/data-drive-view 同窗；
    // robot_idle/transforming 隐藏 = ritual_idle 恒等的 DOM 面保证）
    this.recallBtn.hidden = state !== 'car_ready' && state !== 'driving';

    switch (state) {
      case 'robot_idle':
        this.cta.hidden = false;
        this.cta.disabled = false;
        this.hideHint('input');
        // [CC-VEH-VIEW] 回变落地：属性摘除（robot_idle DOM 面恒等，spec §6.3 #5）
        delete this.host.dataset.driveView;
        break;
      case 'transforming':
        // CITY-05 验收：变形期间按钮 disabled + 进度可见（进度条随 host 态由 CSS 驱动）
        this.cta.disabled = true;
        // [CC-FXN-C1] 回变窗同样收卡（hint 在 transforming 隐藏；正向路径来路
        // robot_idle 已收，此处为空调用不打点）
        this.hideHint('input');
        break;
      case 'car_ready':
        this.cta.hidden = true;
        this.showHint();
        // [CC-VEH-VIEW] data-drive-view 从 car_ready 起挂载（V 生效窗同帧打开）
        this.host.dataset.driveView = this.game.view.driveView.mode;
        break;
      case 'driving':
        // [CC-FXN-C1] 首驶引导（GAP-08 修复，替换原「再次按键即隐」）：键位卡若
        // 还在自动淡出窗内则重开一个完整阅读窗——刹车/E 进站/Esc 在首驶头几秒
        // 仍可读；用户 H 唤出的常显卡（hintFade === null）不受扰动
        if (!this.hint.hidden && this.hintFade) this.armHintFade();
        break;
    }
  }

  private showHint(): void {
    this.hint.hidden = false;
    // [CC-OBS-C1] ux/hint-shown（观测规格 §3.4）
    this.game.session.log('hint-shown');
    this.armHintFade();
  }

  /** 自动淡出窗（car_ready 浮现 / driving 首驶各一窗） */
  private armHintFade(): void {
    this.hintFade?.kill();
    this.hintFade = this.game.ticker.delay(HINT_FADE_DELAY, () => this.hideHint('timeout'));
  }

  /**
   * [CC-FXN-C1] 键位卡再唤出/收起（GAP-08）：H（或 ?）键与「键位」按钮共用一个
   * toggle。唤出为常显（用户显式索取，不自动淡出——由 H/按钮再按或状态收回关闭）；
   * 埋点 hint-recall {via}（ux 族随行加法，观测规格 §3.4）。
   */
  private toggleHint(via: 'key' | 'button'): void {
    if (this.disposed) return;
    if (this.hint.hidden) {
      this.hint.hidden = false;
      this.hintFade?.kill();
      this.hintFade = null;
      this.game.session.log('hint-recall', { via });
    } else {
      this.hideHint('input');
    }
  }

  /**
   * [CC-OBS-C1] by 区分两类调用点（观测规格 §3.4 hint-dismissed 行）：
   * HINT_FADE_DELAY 到期 → 'timeout'；用户/状态收回 → 'input'（[CC-FXN-C1] 随行
   * 修订：driving 不再即隐——'input' 来路 = H/按钮收起、robot_idle/transforming）。
   * 仅在提示确实可见时打点（初始 hidden 的空调用不算 dismiss）。
   */
  private hideHint(by: 'timeout' | 'input'): void {
    this.hintFade?.kill();
    this.hintFade = null;
    if (!this.hint.hidden) {
      this.hint.hidden = true;
      this.game.session.log('hint-dismissed', { by });
    }
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
    // [CC-VEH-VIEW] 「V 切换视角」位次冻结（spec §8.2：插入刹车之后）；
    // [CC-FXN-C1] 串尾加 E 进站/Esc 菜单（GAP-08）+ 触屏整卡换稿（GAP-18）
    this.hint.textContent = this.touch ? HINT_TEXT_TOUCH : HINT_TEXT;
    this.hint.hidden = true;

    // [CC-FXN-C1] 键位卡唤出按钮：键盘用户有 H/?，本按钮 = 触屏召回入口 +
    // 桌面可发现性锚（GAP-08「召回入口：H/? 键或 HUD 按钮」）。car_ready 前隐藏。
    this.recallBtn = document.createElement('button');
    this.recallBtn.type = 'button';
    this.recallBtn.className = 'world-ritual-recall';
    this.recallBtn.dataset.worldHintRecall = '';
    this.recallBtn.setAttribute('aria-keyshortcuts', 'KeyH');
    this.recallBtn.setAttribute('aria-label', '键位卡：唤出或收起操作提示');
    this.recallBtn.innerHTML = this.touch ? '操作说明' : '键位 <kbd>H</kbd>';
    this.recallBtn.hidden = true;
    this.recallBtn.addEventListener('click', () => {
      this.toggleHint('button');
      // 焦点即还：Keyboard 只拦 Space 的按钮激活（keyup preventDefault），Enter/E
      // 进站键仍会二次激活聚焦按钮——点按后归还焦点，驾驶键位零误触
      this.recallBtn.blur();
    });

    this.root.append(this.status, this.cta, progress, this.hint, this.recallBtn);
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
.world-ritual-recall{pointer-events:auto;font:inherit;font-size:.68rem;letter-spacing:.14em;color:#9fb6b1;cursor:pointer;padding:.34em 1em;border-radius:999px;border:1px solid rgba(73,197,182,.32);background:rgba(12,13,17,.6);transition:color .25s,border-color .25s}
.world-ritual-recall:hover,.world-ritual-recall:focus-visible{color:#eafffb;border-color:rgba(73,197,182,.7)}
.world-ritual-recall[hidden]{display:none}
.world-ritual-recall kbd{font:inherit;font-size:.9em;letter-spacing:.1em;padding:.1em .5em;margin-left:.35em;border:1px solid rgba(234,255,251,.35);border-radius:6px;background:rgba(234,255,251,.08)}
@keyframes world-ritual-charge{from{width:0}to{width:100%}}
@media (prefers-reduced-motion:reduce){.world-ritual-cta,.world-ritual-recall{transition:none}[data-world-state='transforming'] .world-ritual-progress i{animation:none;width:100%}}
`;
    document.head.appendChild(style);
  }
}
