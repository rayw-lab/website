// [CC-BGM-C1]：BgmLoop —— 纯合成生成式氛围垫 v0（零资产零网络字节）。
// 上位裁决：董事会急裁 docs/research/cc-loop-board-bgm-synth-scope.md（§B 附条件批准 /
// §C 文件域修订 / §D 零资产三证 / §E HG-B1+HG-B2）；配方与交互正本 =
// 调研 docs/research/cc-bgm-rs.md §2–§4（衔接/声部配方/开关与 ducking 规格）。
//
// 声部（§3.1 配方，全部运行时程序化生成，无预录 PCM）：
//   ① pad   两振荡器（三角/正弦，±6 cent detune）走慢 LFO（~0.05Hz）扫低通
//           （400–1600Hz），两和弦交替（Am ↔ Fmaj7，16–20s 周期，setTargetAtTime 滑移）
//   ② motif A 小调五声随机短音（三角波）+ DelayNode（0.4s，feedback 0.35）尾巴，
//           平均 4–8s 一音；lookahead 调度（§2.3 two-clocks 最简版：ticker 每帧检查
//           未来 0.5s，至多排 1 音——suspend 时 ctx 时钟冻结，恢复零积压爆发（R5））
//   ③ air   带通噪声空气感（2–6kHz 低增益，复用 WorldAudio sharedNoise buffer）
// 频段让位（§0-5）：子总线高通 ~300Hz——27–920Hz 基频域完全让给引擎链与 thump。
//
// ducking 双通道（§4.2 规格 · HG-B1 方案 (i) 串联双 GainNode，两通道物理隔离）：
//   duckEngineGain  连续侧链：每帧 .value 直写 1 − DEPTH×min(engineLevel/0.30, 1)
//                   ——该参数上永不排自动化事件；
//   duckPulseGain   事件脉冲：只走 setTargetAtTime 自动化（撞击/打滑压至 ~0.25×
//                   τ0.6s 回弹；变形让位压至 ~0.15×、world-transform 完成沿 τ1.2s
//                   缓升；reduced-motion instant swap 走短脉冲对齐 transformCue）
//                   ——该参数上永不 .value 直写。
//   探针 duck 输出两通道合成有效值（1 − duckEngine×duckPulse），断言 G 取证面。
//
// 生命周期纪律（§2.2 / 避坑 §10-1）：本类只能在 WorldAudio.unlock() 之后 new——
// 模块顶层零副作用、构造前零 AudioNode（CITY-AUD-01 `__audioCtxCount===0` 回归合同）。
// 默认 OFF 恒定（禁项③最严读法；DP-B2 未获指挥官书面确认前禁改——只此一个常量位）；
// localStorage `world-bgm-on='1'` 显式 opt-in 后，下次会话在手势解锁后自动恢复
// （恢复永远晚于解锁，无「加载即响」路径；硬门 4 明文语义）。
// 活跃窗（§1.2）：car_ready/driving/灰盒 reveal 开、robot_idle/transforming 关
// ——window 开合沿走 setTargetAtTime 边沿自动化（非每帧），与开关钮共用 busGain。
// BGM 子总线挂 master 之下：音效钮 OFF 时必然无声，无第二套静音逻辑（§4.1 矩阵）。

/** BGM 开关持久键（'1' = 开；缺省/其他 = 关。默认 OFF = 禁项③） */
const STORAGE_KEY = 'world-bgm-on';
/** 子总线基准电平（§4.3：v0 固定混音不上滑杆，DP-B3） */
const BGM_BASE = 0.14;
/** 频段让位高通（§0-5：低频完全让给引擎 27–920Hz 基频域） */
const HIGHPASS_FREQ = 300;

/** 连续侧链（§4.2 行 1）：duck = DEPTH × min(engineLevel/REF, 1)，全速退至 ~45% */
const DUCK_DEPTH = 0.55;
const DUCK_ENGINE_REF = 0.3;
/** 事件脉冲（§4.2 行 2）：瞬时压至 0.25×，τ0.6s 回弹 */
const PULSE_FLOOR = 0.25;
const PULSE_TAU = 0.6;
/** 变形让位（§4.2 行 3）：压至 0.15×（ritual sweep 是主角），完成沿 τ1.2s 缓升 */
const TRANSFORM_FLOOR = 0.15;
const TRANSFORM_ATTACK_TAU = 0.08;
const TRANSFORM_RELEASE_TAU = 1.2;

/** pad 和声：Am（A4+E5）↔ Fmaj7（F4+E5，E = 大七度共同音——单声部滑移零跳进） */
const CHORDS: ReadonlyArray<readonly [number, number]> = [
  [440, 659.25],
  [349.23, 659.25],
];
const CHORD_PERIOD_MIN = 16;
const CHORD_PERIOD_SPAN = 4;
/** 和弦滑移时间常数（pad 目标频率 setTargetAtTime，§3.1-④） */
const CHORD_GLIDE_TAU = 2;
/** pad 低通 LFO：~0.05Hz 扫 400–1600Hz（中心 1000 ± 600，每帧 .value 单写） */
const PAD_LFO_HZ = 0.05;
const PAD_FILTER_CENTER = 1000;
const PAD_FILTER_SWING = 600;

/** motif：A 小调五声短音，平均 4–8s 一音；lookahead 视界 0.5s（§2.3） */
const PENTATONIC = [440, 523.25, 587.33, 659.25, 783.99, 880] as const;
const MOTIF_GAP_MIN = 4;
const MOTIF_GAP_SPAN = 4;
const MOTIF_LOOKAHEAD = 0.5;

/** __worldAudio.state().bgm 只读探针形状（e2e 实现口径，避坑 §10-3 与 spec 同步定形；
 *  零新增 window 面——探针经既有 __worldAudio 承载） */
export interface BgmProbe {
  /** 用户开关态（localStorage 记忆） */
  enabled: boolean;
  /** 声部已启动且开关开启且 ctx running（活跃窗关闭时仍 true——静默由 busGain 承载） */
  playing: boolean;
  /** 子总线合成有效电平（busGain × duckEngine × duckPulse；不含 master——主静音见 muted） */
  level: number;
  /** ducking 合成有效值 = 1 − duckEngine × duckPulse（HG-B1：两通道合成后取证） */
  duck: number;
}

export interface BgmLoopOptions {
  /** 钮挂载点（canvas 同级舞台元素，WorldAudio 静音钮同款） */
  stage: HTMLElement;
  /** WorldAudio sharedNoise 复用（§2.1 air 声部；零重复分配） */
  noise: AudioBuffer;
  /** 'world-bgm' 埋点回调（开钮/关钮 = 'user'，记忆恢复沿 = 'restore'；DP-B1 新 type） */
  log(enabled: boolean, source: 'user' | 'restore'): void;
}

/** mulberry32 带种 PRNG（§2.3：听感调参可复现；e2e 断言不依赖具体音符） */
const mulberry32 = (seed: number) => (): number => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export class BgmLoop {
  private readonly ctx: AudioContext;
  private readonly noise: AudioBuffer;
  private readonly log: BgmLoopOptions['log'];
  private readonly rng = mulberry32(0x0bc20826);

  /** 子总线常驻链（构造即建——构造点已在 unlock 之后，懒创建合同零涉及） */
  private readonly highpass: BiquadFilterNode;
  private readonly duckEngineGain: GainNode;
  private readonly duckPulseGain: GainNode;
  private readonly busGain: GainNode;

  /** 声部（首次开启一次性搭建后常驻——增益 0 即静默，引擎链同纪律） */
  private voices: {
    padOsc1: OscillatorNode;
    padOsc2: OscillatorNode;
    padFilter: BiquadFilterNode;
    airSrc: AudioBufferSourceNode;
    motifBus: GainNode;
  } | null = null;

  private enabled = false;
  /** 活跃窗镜像（WorldAudio.update 的引擎门同源；开合沿驱动 busGain 边沿自动化） */
  private windowOpen = false;
  private lfoPhase = 0;
  private chordIndex = 0;
  private nextChordAt = 0;
  private nextNoteAt = 0;

  private button!: HTMLButtonElement;
  private disposed = false;

  constructor(ctx: AudioContext, master: GainNode, options: BgmLoopOptions) {
    this.ctx = ctx;
    this.noise = options.noise;
    this.log = options.log;

    // 子总线：声部 → 高通（频段让位） → duckEngine（每帧直写） → duckPulse（自动化）
    //         → busGain（开关 × 活跃窗） → master（主静音总线之下）
    this.highpass = ctx.createBiquadFilter();
    this.highpass.type = 'highpass';
    this.highpass.frequency.value = HIGHPASS_FREQ;
    this.duckEngineGain = ctx.createGain();
    this.duckPulseGain = ctx.createGain();
    this.busGain = ctx.createGain();
    this.busGain.gain.setValueAtTime(0, ctx.currentTime); // 默认 OFF：未开钮/未还原记忆前恒 0（禁项③）
    this.highpass
      .connect(this.duckEngineGain)
      .connect(this.duckPulseGain)
      .connect(this.busGain)
      .connect(master);

    this.setDom(options.stage);

    // 记忆恢复沿（硬门 4）：显式 opt-in 记忆 → 解锁后自动恢复（构造点即解锁点，
    // 恢复必然晚于解锁）；无记忆/记忆 OFF 时零事件零声部（HG-B2 无种子口径）
    if (this.readOn()) this.setEnabled(true, 'restore');
  }

  /* ———————————————————— 每帧驱动（WorldAudio.update 尾部转发） ———————————————————— */

  /** engineLevel = WorldAudio 已平滑驻留值；open = 引擎门同源活跃窗（§1.2） */
  update(engineLevel: number, open: boolean, dt: number): void {
    if (this.disposed) return;

    // 活跃窗开合沿（非每帧）：busGain 边沿自动化——开 τ0.6 缓入 / 关 τ0.15 快收
    if (open !== this.windowOpen) {
      this.windowOpen = open;
      this.applyBusTarget(open ? 0.6 : 0.15);
    }

    // HG-B1 通道①：连续侧链每帧 .value 直写（engineLevel 已帧率无关平滑，零自动化事件）
    this.duckEngineGain.gain.value = 1 - DUCK_DEPTH * Math.min(engineLevel / DUCK_ENGINE_REF, 1);

    const voices = this.voices;
    if (!voices || !this.enabled) return;
    const t = this.ctx.currentTime;

    // pad 低通慢扫（JS 侧 LFO 每帧单写；suspend 时 ticker 停 = 相位天然冻结）
    this.lfoPhase += dt * PAD_LFO_HZ * Math.PI * 2;
    voices.padFilter.frequency.value =
      PAD_FILTER_CENTER + PAD_FILTER_SWING * Math.sin(this.lfoPhase);

    // 和声交替（16–20s 周期）：pad 目标频率 setTargetAtTime 滑移（边沿自动化）
    if (t >= this.nextChordAt) {
      this.chordIndex = this.chordIndex === 0 ? 1 : 0;
      const chord = CHORDS[this.chordIndex]!;
      voices.padOsc1.frequency.setTargetAtTime(chord[0], t, CHORD_GLIDE_TAU);
      voices.padOsc2.frequency.setTargetAtTime(chord[1], t, CHORD_GLIDE_TAU);
      this.nextChordAt = t + CHORD_PERIOD_MIN + this.rng() * CHORD_PERIOD_SPAN;
    }

    // motif lookahead 调度：每帧至多排 1 音（R5 防积压）；ctx 时基（suspend 冻结）
    if (t + MOTIF_LOOKAHEAD >= this.nextNoteAt) {
      const at = Math.max(this.nextNoteAt, t);
      this.scheduleNote(at, voices.motifBus);
      this.nextNoteAt = at + MOTIF_GAP_MIN + this.rng() * MOTIF_GAP_SPAN;
    }
  }

  /* ———————————————————— ducking 事件通道（WorldAudio 事件沿转发） ———————————————————— */

  /** 撞击/打滑脉冲 + reduced-motion 变形短脉冲：压至 0.25×，τ0.6s 回弹（自动化专线） */
  duckPulse(): void {
    if (this.disposed || !this.enabled) return;
    const p = this.duckPulseGain.gain;
    const t = this.ctx.currentTime;
    p.cancelScheduledValues(t);
    p.setValueAtTime(Math.min(p.value, PULSE_FLOOR), t);
    p.setTargetAtTime(1, t, PULSE_TAU);
  }

  /** 变形让位：'transforming' 起压至 0.15×，'world-transform' 完成沿 τ1.2s 缓升 */
  duckTransform(active: boolean): void {
    if (this.disposed || !this.enabled) return;
    const p = this.duckPulseGain.gain;
    const t = this.ctx.currentTime;
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
    if (active) p.setTargetAtTime(TRANSFORM_FLOOR, t, TRANSFORM_ATTACK_TAU);
    else p.setTargetAtTime(1, t, TRANSFORM_RELEASE_TAU);
  }

  /* ———————————————————— 探针 / 析构 ———————————————————— */

  /** 只读探针（__worldAudio.state().bgm 承载；SwiftShader 无声取证走数值面） */
  probe(): BgmProbe {
    const duckE = this.duckEngineGain.gain.value;
    const duckP = this.duckPulseGain.gain.value;
    return {
      enabled: this.enabled,
      playing: this.enabled && this.voices !== null && this.ctx.state === 'running',
      level: this.busGain.gain.value * duckE * duckP,
      duck: 1 - duckE * duckP,
    };
  }

  /** 全链拆除（WorldAudio.dispose 链尾调用；ctx.close 由 owner 负责） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.button.remove();
    if (this.voices) {
      for (const node of [this.voices.padOsc1, this.voices.padOsc2, this.voices.airSrc]) {
        try {
          node.stop();
        } catch {
          /* 已停止：忽略 */
        }
      }
      this.voices.motifBus.disconnect();
      this.voices = null;
    }
    this.highpass.disconnect();
    this.duckEngineGain.disconnect();
    this.duckPulseGain.disconnect();
    this.busGain.disconnect();
  }

  /* ———————————————————— 开关 / 持久化 / 声部搭建 ———————————————————— */

  private readOn(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false; // 隐私模式等存储不可用：默认 OFF、会话内切换照常（AUD 同款容错）
    }
  }

  private setEnabled(on: boolean, source: 'user' | 'restore'): void {
    this.enabled = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    } catch {
      /* 存储不可用：会话内生效即可 */
    }
    if (on) this.ensureVoices();
    this.applyBusTarget(on ? 0.6 : 0.15);
    this.applyButtonState();
    this.log(on, source);
  }

  /** busGain 目标 =（开钮 ∧ 活跃窗）? BGM_BASE : 0——单写入方（边沿自动化，防爆音） */
  private applyBusTarget(tau: number): void {
    const target = this.enabled && this.windowOpen ? BGM_BASE : 0;
    this.busGain.gain.setTargetAtTime(target, this.ctx.currentTime, tau);
  }

  /** 声部一次性搭建（pad + air + motif 延迟尾；即建即弃音符节点挂 motifBus） */
  private ensureVoices(): void {
    if (this.voices || this.disposed) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const chord = CHORDS[0]!;

    // pad：两振荡器 ±6 cent → 慢扫低通 → padGain
    const padOsc1 = ctx.createOscillator();
    padOsc1.type = 'triangle';
    padOsc1.frequency.value = chord[0];
    padOsc1.detune.value = 6;
    const padOsc2 = ctx.createOscillator();
    padOsc2.type = 'sine';
    padOsc2.frequency.value = chord[1];
    padOsc2.detune.value = -6;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = PAD_FILTER_CENTER;
    padFilter.Q.value = 0.8;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.32;
    padOsc1.connect(padFilter);
    padOsc2.connect(padFilter);
    padFilter.connect(padGain).connect(this.highpass);

    // air：sharedNoise → 带通 2–6kHz（中心 ~3.5k）低增益
    const airSrc = ctx.createBufferSource();
    airSrc.buffer = this.noise;
    airSrc.loop = true;
    const airBand = ctx.createBiquadFilter();
    airBand.type = 'bandpass';
    airBand.frequency.value = 3500;
    airBand.Q.value = 0.85;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.045;
    airSrc.connect(airBand).connect(airGain).connect(this.highpass);

    // motif 公共尾巴：干声 + DelayNode 反馈湿声（音符节点即建即弃挂 motifBus）
    const motifBus = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.4;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    motifBus.connect(this.highpass);
    motifBus.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(this.highpass);

    padOsc1.start();
    padOsc2.start();
    airSrc.start();
    this.nextChordAt = t + CHORD_PERIOD_MIN + this.rng() * CHORD_PERIOD_SPAN;
    this.nextNoteAt = t + 1.5; // 首音略退后：pad 先立住氛围
    this.voices = { padOsc1, padOsc2, padFilter, airSrc, motifBus };
  }

  /** 五声短音（thump/skid 同款 start+stop 即建即弃模式，零泄漏——R6） */
  private scheduleNote(at: number, motifBus: GainNode): void {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = PENTATONIC[Math.floor(this.rng() * PENTATONIC.length)]!;
    const gain = ctx.createGain();
    // exponentialRamp 目标不可为 0（避坑 §10-4，WorldAudio 全先例同式）
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.09, at + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
    osc.connect(gain).connect(motifBus);
    osc.start(at);
    osc.stop(at + 1.7);
  }

  /* ———————————————————— 钮（AUD 五件套纪律照抄：§10-7） ———————————————————— */

  private toggle(): void {
    if (this.disposed) return;
    this.setEnabled(!this.enabled, 'user');
  }

  private applyButtonState(): void {
    this.button.setAttribute('aria-pressed', String(this.enabled));
    this.button.textContent = this.enabled ? 'BGM ON' : 'BGM OFF';
    this.button.title = this.enabled ? '点击关闭氛围垫' : '点击开启氛围垫';
  }

  private setDom(stage: HTMLElement): void {
    this.injectStyles();
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'world-bgm-toggle';
    this.button.dataset.worldBgm = '';
    this.button.setAttribute('aria-label', 'BGM 氛围垫');
    this.applyButtonState();
    this.button.addEventListener('click', () => {
      this.toggle();
      this.button.blur(); // 焦点即还：驾驶键位零误触（AUD 同纪律）
    });
    stage.appendChild(this.button);
  }

  private injectStyles(): void {
    const styleId = 'world-bgm-style';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    // 紧邻音效钮组成右上钮组（§4.1）；零动画（禁项⑦）；robot_idle/transforming
    // 样式门由 WorldAudio 既有选择器扩位承载（同一 display:none 机器兜底）
    style.textContent = `
.world-bgm-toggle{position:absolute;top:.85rem;right:7.5rem;z-index:6;pointer-events:auto;font:inherit;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Noto Sans CJK SC',sans-serif;font-size:.72rem;letter-spacing:.14em;color:#9fb6b1;cursor:pointer;padding:.4em 1.05em;border-radius:999px;border:1px solid rgba(73,197,182,.32);background:rgba(12,13,17,.62)}
.world-bgm-toggle:hover,.world-bgm-toggle:focus-visible{color:#eafffb;border-color:rgba(73,197,182,.7)}
.world-bgm-toggle[aria-pressed='false']{color:#6f7d7a;border-color:rgba(120,132,130,.4)}
`;
    document.head.appendChild(style);
  }
}
