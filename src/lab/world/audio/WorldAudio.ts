// [CC-AUD-C1]：WorldAudio —— 驾驶五事件合成音效层 v0（董事会 R5 终裁 §B AUD-C1 /
// 调研 docs/research/cc-audio-pubg-nav-research.md §3/§5 落地；上位裁决 =
// cyber-city-gameplay-features.md G3「WebAudio 纯合成零资产」+ SRD §12.7.7 手写
// 播放层 / howler 永不引入）。
//
// 五事件（全部合成，0 网络字节；挂点复用既有状态/事件，零新增事件面）：
//   ① 加速        引擎哼鸣频率/音量随速度爬升 + |accelerating| 咬合增强（G3 v1）
//   ② 巡航循环    同一引擎层常驻振荡器——合成天然无缝，零循环爆点（研究 §2.3）
//   ③ 刹车打滑    'brake' 动作激活沿 + 速度阈值 → 带通噪声突发（skid 反馈优先）
//   ④ 撞击        index.ts 碰撞沿（cone-hit / streetProps.hitCount 同源同拍）→
//                 低频正弦 thump + 噪声瞬态，强度随当前速度（G3 v0 ②）
//   ⑤ 机器人变形  TransformSystem 事件驱动对齐四拍：'transforming' 起充能扫频 →
//                 'swap' 光幕峰值 whoosh → 'world-transform' 落地 thump（G3 v0 ①）。
//                 事件驱动而非预排程 —— holding（waitFor 多转）时天然跟拍，且免
//                 静态 import 时间轴常量（TransformSystem 留在 ritual 动态分包）。
// 随行小件：FPV 舱内闷化——'world-drive-view' 切 fpv 时引擎层低通收窄（研究 §5.2）。
//
// Autoplay 合规（研究 §3，Chrome 71+/Safari/Firefox 同口径）：
//   AudioContext 懒创建——首个用户手势（window pointerdown/keydown 捕获段）内
//   new，直接 running；变形 CTA 点击 / Space / WASD / reduced-motion「显式进入」
//   按钮全部天然覆盖（folio Reveal.updateStep(1)→audio.init 同构先例）。
//   无手势路径下 AudioContext 不存在 = 可断言的合规副产品（e2e CITY-AUD-01）。
//   iOS：navigator.audioSession.type='playback' feature-detect（研究 §3.3 DP-2）。
//
// 「解锁 ≠ 出声」两状态位分离（研究 §3.2-3）：unlocked = 手势解锁；muted = 用户
// 偏好（localStorage 记忆，默认开声）——静音只压主 GainNode，事件计数照常。
// reduced-motion 口径独立（G3：动效偏好 ≠ 声音偏好），但变形为 instant swap 时
// 1.05s 扫频与画面失配 → 直切短确认音（任务书「reduced-motion 可静音或直切」取直切）。
//
// 纪律红线：
//   · ritual_idle 恒等：静音钮在 robot_idle/transforming 由样式门整件 display:none
//     （DriveFeedback 同款机器兜底）；音频不触渲染路径，poster 逐字节恒等零涉及；
//   · `/` 首包零音频字节：本模块随 world 分包懒加载，合成零资产（G-A′ 天然覆盖）；
//   · 循环动画配额（CITY-03）零占用：无任何视觉呈现，静音钮零动画；
//   · 埋点：'world-audio' {enabled, source:'auto'|'user'}（观测规格 §3.4 随行加法）；
//   · dispose 全链拆除：手势/可见性监听、事件订阅、ticker、DOM、ctx.close()。
import type { Game } from '../core/Game';
import type { TransformForm, TransformState, TransformSystem } from '../player/TransformSystem';

/** 静音偏好持久键（'1' = 静音；缺省/其他 = 开声） */
const STORAGE_KEY = 'world-audio-muted';
/** 主总线音量（全部配方经此；静音 = 0） */
const MASTER_VOLUME = 0.6;

/** 引擎层参数（速度域 = View focusPoint.smoothedPosition 差分——focusPointSpeed
 *  同源同式（View.update L725），只读消费零 view/ 改动；速度 m/s 真值，物理车
 *  常态软限速 ≈10、boost 更高 —— 归一上限取 12） */
const SPEED_NORM_MAX = 12;
const ENGINE_FREQ_MIN = 55;
const ENGINE_FREQ_SPAN = 380;
const ENGINE_ACCEL_FREQ_KICK = 26;
const ENGINE_IDLE_GAIN = 0.045;
const ENGINE_SPEED_GAIN = 0.22;
const ENGINE_ACCEL_GAIN = 0.07;
/** boost 谐波（G3 v1「boost 加谐波」）：二次谐波锯齿的目标增益 */
const BOOST_HARMONIC_GAIN = 0.35;
/** 引擎低通：third 开阔 / fpv 舱内闷化（研究 §5.2 PUBG 签名，一只 BiquadFilter） */
const LOWPASS_THIRD_BASE = 4800;
const LOWPASS_THIRD_SPEED_SPAN = 2600;
const LOWPASS_FPV = 1150;

/** 刹车打滑：速度阈值（m/s，低速点刹不出胎噪）与触发冷却（ctx 时基秒，antiSpam） */
const SKID_MIN_SPEED = 3;
const SKID_COOLDOWN = 0.4;
/** 撞击 thump 冷却（碰撞连击限流，folio Audio.js antiSpam 同款思路） */
const IMPACT_COOLDOWN = 0.25;

/** e2e 取证计数面（R5 §D 硬门「事件音触发计数」；只计实际排程出声的触发） */
interface AudioCounts {
  transform: number;
  impact: number;
  skid: number;
}

declare global {
  interface Window {
    /** [CC-AUD-C1] 只读探针（__worldSpike 同段纪律：挂载/ dispose 删除） */
    __worldAudio?: {
      state(): {
        unlocked: boolean;
        running: boolean;
        muted: boolean;
        engineLevel: number;
        counts: AudioCounts;
      };
    };
  }
}

export interface WorldAudioOptions {
  /** 静音钮挂载点（canvas 同级舞台元素，Reveal/DriveFeedback 同款） */
  stage: HTMLElement;
  /** 变形系统（ritual 路径才有；null = 灰盒/poi 腿，变形音自然缺席） */
  transform?: TransformSystem | null;
}

export class WorldAudio {
  private readonly game: Game;
  private readonly transform: TransformSystem | null;
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  /** 引擎链（unlock 时一次性搭建，常驻零启停——增益 0 即静默，振荡器开销可忽略） */
  private engine: {
    saw: OscillatorNode;
    sub: OscillatorNode;
    boostOsc: OscillatorNode;
    boostGain: GainNode;
    gain: GainNode;
    lowpass: BiquadFilterNode;
    noiseGain: GainNode;
  } | null = null;
  /** 变形充能扫频在途节点（'transforming' 起、'swap' 峰值收拍） */
  private ritualSweep: { band: BiquadFilterNode; gain: GainNode; src: AudioBufferSourceNode } | null = null;
  private sharedNoise: AudioBuffer | null = null;

  private muted: boolean;
  private unlockLogged = false;
  private readonly counts: AudioCounts = { transform: 0, impact: 0, skid: 0 };

  /** 速度差分状态（View focusPoint.smoothedPosition 只读消费） */
  private readonly lastFocus = { x: 0, z: 0, primed: false };
  private speed = 0;
  /** 引擎参数平滑驻留（JS 侧低通后直写 .value，避免每帧堆自动化事件） */
  private engineLevel = 0;
  private engineFreq = ENGINE_FREQ_MIN;
  private boostLevel = 0;
  private lowpassFreq = LOWPASS_THIRD_BASE;
  private fpv = false;

  private lastSkidAt = -Infinity;
  private lastImpactAt = -Infinity;

  private button!: HTMLButtonElement;
  private disposed = false;

  /* ———————————————————— 监听器（构造挂载 / dispose 摘除） ———————————————————— */

  /** 首手势解锁（捕获段先于一切业务 handler；非 once——修饰键单击不构成合法
   *  activation 时保持待命，下一个合法手势续解，直至 running 才摘除） */
  private readonly gestureHandler = (): void => this.unlock();

  /** 后台标签静音（ticker 停摆时引擎增益驻留会拖尾出声；已解锁后 resume 合法） */
  private readonly visibilityHandler = (): void => {
    if (!this.ctx || !this.unlockLogged) return;
    if (document.hidden) void this.ctx.suspend().catch(() => {});
    else void this.ctx.resume().catch(() => {});
  };

  private readonly tickHandler = (): void => this.update();

  private readonly stateChangeHandler = (state: TransformState): void => {
    if (state === 'transforming' && !this.reducedMotion) this.ritualCharge();
  };

  private readonly swapHandler = (): void => {
    if (!this.reducedMotion) this.ritualPeak();
  };

  private readonly transformDoneHandler = (to: TransformForm): void => {
    if (this.reducedMotion) this.transformCue(to);
    else this.ritualLanding(to);
  };

  private readonly brakeHandler = (action: { active: boolean }): void => {
    if (action.active && this.speed >= SKID_MIN_SPEED) this.skid();
  };

  private readonly driveViewHandler = (mode: 'third' | 'fpv'): void => {
    this.fpv = mode === 'fpv';
  };

  constructor(game: Game, options: WorldAudioOptions) {
    this.game = game;
    this.transform = options.transform ?? null;
    this.muted = this.readMuted();

    this.setDom(options.stage);

    // 首手势解锁兜底面（研究 §3.2 解锁链）：CTA 点击（pointerdown 先行）/ Space /
    // WASD keydown / reduced-motion 显式进入按钮——window 捕获段一网覆盖，零新增 UI
    window.addEventListener('pointerdown', this.gestureHandler, { capture: true, passive: true });
    window.addEventListener('keydown', this.gestureHandler, { capture: true, passive: true });
    document.addEventListener('visibilitychange', this.visibilityHandler);

    if (this.transform) {
      this.transform.events.on('stateChange', this.stateChangeHandler);
      this.transform.events.on('swap', this.swapHandler);
    }
    this.game.events.on('world-transform', this.transformDoneHandler);
    this.game.events.on('world-drive-view', this.driveViewHandler);
    this.game.inputs.events.on('brake', this.brakeHandler);

    // order 8：视觉同步（4）/车辆 post（5）/相机（7）之后取速度差分，HUD 节拍（999）前
    this.game.ticker.events.on('tick', this.tickHandler, 8);

    window.__worldAudio = {
      state: () => ({
        unlocked: this.ctx !== null,
        running: this.ctx?.state === 'running',
        muted: this.muted,
        engineLevel: this.engineLevel,
        counts: { ...this.counts },
      }),
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener('pointerdown', this.gestureHandler, { capture: true });
    window.removeEventListener('keydown', this.gestureHandler, { capture: true });
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    if (this.transform) {
      this.transform.events.off('stateChange', this.stateChangeHandler);
      this.transform.events.off('swap', this.swapHandler);
    }
    this.game.events.off('world-transform', this.transformDoneHandler);
    this.game.events.off('world-drive-view', this.driveViewHandler);
    this.game.inputs.events.off('brake', this.brakeHandler);
    this.game.ticker.events.off('tick', this.tickHandler);
    this.button.remove();
    delete window.__worldAudio;
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  /* ———————————————————— ④ 撞击（index.ts 碰撞沿调用，公共面） ———————————————————— */

  /** 撞击 thump：强度随当前速度（impulse 代理——碰撞沿与速度域同拍读数）+ 冷却限流 */
  impact(): void {
    const ctx = this.runningCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (t - this.lastImpactAt < IMPACT_COOLDOWN) return;
    this.lastImpactAt = t;
    this.counts.impact += 1;
    this.thump(Math.min(0.35 + this.speed / 10, 1));
  }

  /* ———————————————————— 手势解锁 ———————————————————— */

  private unlock(): void {
    if (this.disposed) return;
    if (!this.ctx) {
      try {
        // 手势内新建：合法 activation 下直接 running（优于「先建后 resume」，
        // 免加载期 suspended 悬挂告警——folio Start 按钮同构）
        this.ctx = new AudioContext();
      } catch {
        return; // 环境无 WebAudio：整层静默降级，游戏路径零影响
      }
      // iOS 静音拨键坑（研究 §3.3）：声明播放意图（feature-detect，非 WebKit 无此面）
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      try {
        if (nav.audioSession) nav.audioSession.type = 'playback';
      } catch {
        /* audioSession 只读/不支持：忽略 */
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER_VOLUME;
      this.master.connect(this.ctx.destination);
      this.buildEngine(this.ctx, this.master);
      this.ctx.addEventListener('statechange', () => this.onRunning());
    } else if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    this.onRunning();
  }

  /** running 确立（可能晚于 unlock 一拍）：摘手势监听 + 'world-audio' 解锁埋点 */
  private onRunning(): void {
    if (this.disposed || this.unlockLogged || this.ctx?.state !== 'running') return;
    this.unlockLogged = true;
    window.removeEventListener('pointerdown', this.gestureHandler, { capture: true });
    window.removeEventListener('keydown', this.gestureHandler, { capture: true });
    this.game.session.log('world-audio', { enabled: !this.muted, source: 'auto' });
  }

  private runningCtx(): AudioContext | null {
    return this.ctx && this.ctx.state === 'running' && this.master ? this.ctx : null;
  }

  /* ———————————————————— ①② 引擎层（加速 + 巡航循环，每帧参数驱动） ———————————————————— */

  private buildEngine(ctx: AudioContext, master: GainNode): void {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = LOWPASS_THIRD_BASE;
    gain.connect(lowpass).connect(master);

    // 电机声底：锯齿基频 + 正弦低八度体腔（EV whine 比 V8 更贴赛博概念车，研究 §2.2）
    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.value = ENGINE_FREQ_MIN;
    const sawGain = ctx.createGain();
    sawGain.gain.value = 0.5;
    saw.connect(sawGain).connect(gain);

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = ENGINE_FREQ_MIN * 0.5;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.6;
    sub.connect(subGain).connect(gain);

    // boost 二次谐波（G3 v1）：boosting 时渐入
    const boostOsc = ctx.createOscillator();
    boostOsc.type = 'sawtooth';
    boostOsc.frequency.value = ENGINE_FREQ_MIN * 2;
    const boostGain = ctx.createGain();
    boostGain.gain.value = 0;
    boostOsc.connect(boostGain).connect(gain);

    // 风噪/路噪底（速度² 渐入）：带通白噪声与引擎同吃低通与总线
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = this.noiseBuffer(ctx);
    noiseSrc.loop = true;
    const noiseBand = ctx.createBiquadFilter();
    noiseBand.type = 'bandpass';
    noiseBand.frequency.value = 900;
    noiseBand.Q.value = 0.7;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseSrc.connect(noiseBand).connect(noiseGain).connect(gain);

    saw.start();
    sub.start();
    boostOsc.start();
    noiseSrc.start();
    this.engine = { saw, sub, boostOsc, boostGain, gain, lowpass, noiseGain };
  }

  /** 每帧：速度差分 + 引擎参数低通直写（帧率无关式 1−e^(−rate·dt)，R4 纪律同款） */
  private update(): void {
    if (this.disposed) return;
    const dt = this.game.ticker.delta;

    const fp = this.game.view.focusPoint.smoothedPosition;
    if (dt > 0) {
      if (this.lastFocus.primed) {
        // respawn/moveTo 帧瞬移尖峰截断（40 m/s 封顶，正常速度域 ≤ ~15）
        this.speed = Math.min(Math.hypot(fp.x - this.lastFocus.x, fp.z - this.lastFocus.z) / dt, 40);
      }
      this.lastFocus.x = fp.x;
      this.lastFocus.z = fp.z;
      this.lastFocus.primed = true;
    }

    const engine = this.engine;
    if (!engine || !this.ctx || this.ctx.state !== 'running') {
      this.engineLevel = 0;
      return;
    }

    // 引擎门：ritual 驾驶窗（car_ready/driving）或灰盒 wandering（gate 'none' 且已
    // reveal）——robot_idle/transforming 恒静默（物理体冻结 + 本门双保险）
    const gate = this.game.view.driveView.gate;
    const open =
      gate === 'car_ready' || gate === 'driving' || (gate === 'none' && this.game.revealed);

    const speedNorm = Math.min(this.speed / SPEED_NORM_MAX, 1);
    const accel = Math.min(Math.abs(this.game.player.accelerating), 1);
    const levelTarget = open
      ? ENGINE_IDLE_GAIN + ENGINE_SPEED_GAIN * speedNorm + ENGINE_ACCEL_GAIN * accel
      : 0;
    const freqTarget =
      ENGINE_FREQ_MIN + ENGINE_FREQ_SPAN * speedNorm + ENGINE_ACCEL_FREQ_KICK * accel;
    const boostTarget = open && this.game.player.boosting > 0 ? BOOST_HARMONIC_GAIN : 0;
    const lowpassTarget = this.fpv
      ? LOWPASS_FPV
      : LOWPASS_THIRD_BASE + LOWPASS_THIRD_SPEED_SPAN * speedNorm;

    const kGain = 1 - Math.exp(-6 * dt);
    const kFreq = 1 - Math.exp(-8 * dt);
    this.engineLevel += (levelTarget - this.engineLevel) * kGain;
    this.engineFreq += (freqTarget - this.engineFreq) * kFreq;
    this.boostLevel += (boostTarget - this.boostLevel) * kGain;
    this.lowpassFreq += (lowpassTarget - this.lowpassFreq) * (1 - Math.exp(-5 * dt));

    engine.gain.gain.value = this.engineLevel;
    engine.saw.frequency.value = this.engineFreq;
    engine.sub.frequency.value = this.engineFreq * 0.5;
    engine.boostOsc.frequency.value = this.engineFreq * 2;
    engine.boostGain.gain.value = this.boostLevel;
    engine.lowpass.frequency.value = this.lowpassFreq;
    engine.noiseGain.gain.value = open ? 0.06 * speedNorm * speedNorm : 0;
  }

  /* ———————————————————— ③ 刹车打滑 ———————————————————— */

  private skid(): void {
    const ctx = this.runningCtx();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    if (t - this.lastSkidAt < SKID_COOLDOWN) return;
    this.lastSkidAt = t;
    this.counts.skid += 1;

    const duration = Math.min(0.35 + this.speed * 0.03, 0.8);
    const peak = 0.32 * Math.min(this.speed / 8, 1);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 1.1;
    band.frequency.setValueAtTime(2600, t);
    band.frequency.exponentialRampToValueAtTime(620, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.02), t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(band).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.05);
  }

  /* ———————————————————— ⑤ 变形四拍（事件驱动跟拍） ———————————————————— */

  /** 拍①②（charge + veil-in）：带通噪声上行扫频，setTargetAtTime 渐近峰值——
   *  holding（充能环多转）时驻留峰值继续鸣响，与画面天然同步 */
  private ritualCharge(): void {
    const ctx = this.runningCtx();
    if (!ctx || !this.master) return;
    this.stopRitualSweep();
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 2;
    band.frequency.setValueAtTime(260, t);
    band.frequency.setTargetAtTime(2400, t, 0.32);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.setTargetAtTime(0.22, t, 0.2);
    src.connect(band).connect(gain).connect(this.master);
    src.start(t);
    this.ritualSweep = { band, gain, src };
  }

  /** 拍③（光幕峰值热交换 'swap'）：增益尖峰 + 扫频回落释放 */
  private ritualPeak(): void {
    const ctx = this.runningCtx();
    const sweep = this.ritualSweep;
    if (!ctx || !sweep) return;
    const t = ctx.currentTime;
    sweep.gain.gain.cancelScheduledValues(t);
    sweep.gain.gain.setValueAtTime(Math.max(sweep.gain.gain.value, 0.01), t);
    sweep.gain.gain.linearRampToValueAtTime(0.38, t + 0.05);
    sweep.gain.gain.setTargetAtTime(0.0001, t + 0.08, 0.16);
    sweep.band.frequency.cancelScheduledValues(t);
    sweep.band.frequency.setTargetAtTime(520, t + 0.05, 0.14);
    sweep.src.stop(t + 1.2);
    this.ritualSweep = null;
  }

  /** 拍④（'world-transform' 完成沿）：car = 落地 thump；robot = 双音下行收形 */
  private ritualLanding(to: TransformForm): void {
    const ctx = this.runningCtx();
    if (!ctx) return;
    this.counts.transform += 1;
    if (to === 'car') this.thump(1);
    else this.twoTone(660, 440);
  }

  /** reduced-motion instant swap：直切短确认音（car 上行 / robot 下行） */
  private transformCue(to: TransformForm): void {
    const ctx = this.runningCtx();
    if (!ctx) return;
    this.counts.transform += 1;
    if (to === 'car') this.twoTone(440, 660);
    else this.twoTone(660, 440);
  }

  /* ———————————————————— 合成配方原语 ———————————————————— */

  /** 低频 thump（撞击/落地共用）：正弦下坠 + 噪声瞬态，强度参数化（G3 v0 ②） */
  private thump(intensity: number): void {
    const ctx = this.runningCtx();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.28);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.55 * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc.connect(oscGain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.35);

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(ctx);
    const band = ctx.createBiquadFilter();
    band.type = 'lowpass';
    band.frequency.setValueAtTime(760, t);
    band.frequency.exponentialRampToValueAtTime(240, t + 0.12);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3 * intensity, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    noise.connect(band).connect(noiseGain).connect(this.master);
    noise.start(t);
    noise.stop(t + 0.18);
  }

  /** 双音滑移短确认（三角波 0.22s）：from → to Hz */
  private twoTone(from: number, to: number): void {
    const ctx = this.runningCtx();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.setValueAtTime(from, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(to, t + 0.13);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.setValueAtTime(0.14, t + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  private stopRitualSweep(): void {
    if (!this.ritualSweep || !this.ctx) return;
    try {
      this.ritualSweep.src.stop(this.ctx.currentTime + 0.02);
    } catch {
      /* 已停止：忽略 */
    }
    this.ritualSweep = null;
  }

  /** 共享 1s 白噪声 buffer（全配方复用，~0.2MB 单例内存） */
  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.sharedNoise) {
      const length = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      this.sharedNoise = buffer;
    }
    return this.sharedNoise;
  }

  /* ———————————————————— 静音钮（右上常驻 · localStorage 记忆 · a11y） ———————————————————— */

  private readMuted(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false; // 隐私模式等存储不可用：默认开声、会话内切换照常
    }
  }

  private toggle(): void {
    if (this.disposed) return;
    this.muted = !this.muted;
    try {
      localStorage.setItem(STORAGE_KEY, this.muted ? '1' : '0');
    } catch {
      /* 存储不可用：会话内生效即可 */
    }
    if (this.ctx && this.master) {
      // setTargetAtTime 渐变防爆音（~30ms 收敛）
      this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER_VOLUME, this.ctx.currentTime, 0.03);
    }
    this.applyButtonState();
    this.game.session.log('world-audio', { enabled: !this.muted, source: 'user' });
  }

  private applyButtonState(): void {
    this.button.setAttribute('aria-pressed', String(this.muted));
    this.button.textContent = this.muted ? '音效 OFF' : '音效 ON';
    this.button.title = this.muted ? '点击开启音效' : '点击静音';
  }

  private setDom(stage: HTMLElement): void {
    this.injectStyles();
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'world-audio-toggle';
    this.button.dataset.worldAudio = '';
    this.button.setAttribute('aria-label', '静音音效');
    this.applyButtonState();
    this.button.addEventListener('click', () => {
      this.toggle();
      this.button.blur(); // 焦点即还（Reveal recall 按钮同纪律：驾驶键位零误触）
    });
    stage.appendChild(this.button);
  }

  private injectStyles(): void {
    const styleId = 'world-audio-style';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    // 右上常驻（G3）；robot_idle/transforming 样式门整件隐藏（poster/恒等合同的
    // 机器兜底，DriveFeedback 同款）；无 data-world-state 的灰盒/poi 腿恒可见
    style.textContent = `
.world-audio-toggle{position:absolute;top:.85rem;right:.95rem;z-index:6;pointer-events:auto;font:inherit;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Noto Sans CJK SC',sans-serif;font-size:.72rem;letter-spacing:.14em;color:#9fb6b1;cursor:pointer;padding:.4em 1.05em;border-radius:999px;border:1px solid rgba(73,197,182,.32);background:rgba(12,13,17,.62);transition:color .25s,border-color .25s}
.world-audio-toggle:hover,.world-audio-toggle:focus-visible{color:#eafffb;border-color:rgba(73,197,182,.7)}
.world-audio-toggle[aria-pressed='true']{color:#6f7d7a;border-color:rgba(120,132,130,.4);text-decoration:line-through}
[data-world-state='robot_idle'] .world-audio-toggle,[data-world-state='transforming'] .world-audio-toggle{display:none!important}
@media (prefers-reduced-motion:reduce){.world-audio-toggle{transition:none}}
`;
    document.head.appendChild(style);
  }
}
