/**
 * LAB RA-01 · 多语言 TTS × 座舱可视化 —— 引擎（零依赖 vanilla TS）。
 *
 * 单向数据流（见 docs/research/tts-cockpit-visualization.md 第 4 节）：
 * HTMLAudioElement 播放时钟 → rAF 每帧读 currentTime → 查 timeline
 * → 字幕逐词高亮 / 分段动作驱动 HMI / AnalyserNode 频谱画波形。
 * 界面状态是播放时刻的纯函数（幂等应用），不做一次性触发簿记。
 *
 * 生命周期（挂载条件/暂停/卸载）由统一 facade 经 index.ts 的 mount() 驱动（SRD §9.2）。
 */
import type { LabInstance, LabMountOptions } from '../../contracts';
import manifest from '../../../data/tts-manifest.json';

type Word = { c: [number, number]; t: [number, number] };
type Seg = { c: [number, number]; t: [number, number]; action: string };
interface Timeline {
  locale: string;
  voice: string;
  dir: 'ltr' | 'rtl';
  text: string;
  chars: number;
  durationMs: number;
  words: Word[];
  segments: Seg[];
  peakIntervalMs: number;
  peaks: number[];
}
type Status = 'idle' | 'loading' | 'speaking' | 'done' | 'error';

const RAW_BASE = import.meta.env.BASE_URL as string;
const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : RAW_BASE + '/';

const DEFAULT_LOCALE = 'zh-CN';
const DEFAULT_SCENE = 'nav';

export function createTtsCockpit(opts: LabMountOptions): LabInstance {
  const { host, params } = opts;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
    const el = host.querySelector<T>(`#${id}`);
    if (!el) throw new Error(`missing #${id}`);
    return el;
  };
  const $s = (id: string): SVGGraphicsElement =>
    host.querySelector(`#${id}`) as unknown as SVGGraphicsElement;

  // ---------------------------------------------------------------- 状态

  let localeCode = DEFAULT_LOCALE;
  let sceneId = DEFAULT_SCENE;
  let status: Status = 'idle';
  let timeline: Timeline | null = null;
  let wordSpans: HTMLSpanElement[] = [];
  let rafId = 0;
  let speedNow = 0;
  let pausedWhileSpeaking = false;
  let disposed = false;

  const audio = new Audio();
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let freqData: Uint8Array | null = null;

  const timelineCache = new Map<string, Timeline>();
  const pathLenCache = new Map<string, number>();
  const fracCache = new Map<string, number>();

  const localeOf = (code: string) => manifest.locales.find((l) => l.code === code)!;
  const sceneOf = (id: string) => manifest.scenes.find((s) => s.id === id)!;

  /** 事件登记表：dispose 时统一解绑（§9.2） */
  const listeners: Array<{ el: EventTarget; type: string; fn: EventListener }> = [];
  const on = (el: EventTarget, type: string, fn: EventListener) => {
    el.addEventListener(type, fn);
    listeners.push({ el, type, fn });
  };

  // ---------------------------------------------------------------- 元素

  const screen = $('screen');
  const consoleEl = $('console');
  const playBtn = $<HTMLButtonElement>('play-btn');
  const progressFill = $('progress-fill');
  const statusLine = $('status-line');
  const caption = $('caption');
  const userLine = $('user-line');
  const userText = $('user-text');
  const clock = $('clock');
  const wave = $<HTMLCanvasElement>('wave');
  const orb = $('orb');
  const orbLabel = $('orb-label');
  const speedNum = $s('speed-num');
  const needle = $s('needle');
  const gaugeFill = $s('gauge-fill');
  const statsBox = $('stats');

  // ---------------------------------------------------------------- 工具

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const clipUrl = (ext: string) => `${BASE}demo/tts/${sceneId}/${localeCode}.${ext}`;

  function setStatus(next: Status, line?: string) {
    status = next;
    screen.dataset.state = next;
    const stateText = { idle: 'IDLE', loading: 'LOADING', speaking: 'SPEAKING', done: 'DONE', error: 'ERROR' }[next];
    $('hmi-state').textContent = stateText;
    orbLabel.textContent = `VOICE ${stateText}`;
    playBtn.dataset.playing = String(next === 'speaking');
    playBtn.textContent = next === 'speaking' ? '■ 停止' : '▶ 播放播报';
    if (line) statusLine.textContent = line;
  }

  /** 深链状态同步回 URL（history.replaceState，不产生历史条目 —— §9.2 契约） */
  function writeURL() {
    const next = new URLSearchParams();
    if (localeCode !== DEFAULT_LOCALE) next.set('locale', localeCode);
    if (sceneId !== DEFAULT_SCENE) next.set('scene', sceneId);
    const qs = next.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  /** 在 path 上采样，找与 (x,y) 最近的长度占比（途经点/泊车锚点用） */
  function fractionAt(path: SVGPathElement, x: number, y: number, key: string): number {
    const hit = fracCache.get(key);
    if (hit !== undefined) return hit;
    const total = path.getTotalLength();
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i <= 400; i++) {
      const p = path.getPointAtLength((total * i) / 400);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i / 400;
      }
    }
    fracCache.set(key, best);
    return best;
  }

  function setRoute(pathId: string, carId: string, p: number) {
    const path = $s(pathId) as SVGPathElement;
    const car = $s(carId);
    const pr = REDUCED ? (p >= 1 ? 1 : Math.floor(p * 4) / 4) : p;
    path.style.strokeDashoffset = String(100 * (1 - pr));
    let len = pathLenCache.get(pathId);
    if (len === undefined) {
      len = path.getTotalLength();
      pathLenCache.set(pathId, len);
    }
    const pt = path.getPointAtLength(len * pr);
    car.setAttribute('cx', pt.x.toFixed(1));
    car.setAttribute('cy', pt.y.toFixed(1));
  }

  // ---------------------------------------------------------------- 字幕

  function buildCaption(tl: Timeline) {
    caption.innerHTML = '';
    caption.setAttribute('dir', tl.dir);
    wordSpans = [];
    let cursor = 0;
    for (const w of tl.words) {
      if (w.c[0] > cursor) caption.appendChild(document.createTextNode(tl.text.slice(cursor, w.c[0])));
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = tl.text.slice(w.c[0], w.c[1]);
      caption.appendChild(span);
      wordSpans.push(span);
      cursor = w.c[1];
    }
    if (cursor < tl.text.length) caption.appendChild(document.createTextNode(tl.text.slice(cursor)));
  }

  function paintCaption(tMs: number) {
    const tl = timeline!;
    for (let i = 0; i < wordSpans.length; i++) {
      const [t0, t1] = tl.words[i]!.t;
      wordSpans[i]!.classList.toggle('said', tMs >= t1);
      wordSpans[i]!.classList.toggle('now', tMs >= t0 && tMs < t1);
    }
  }

  // ---------------------------------------------------------------- 场景联动

  const seg = (action: string): Seg | undefined => timeline!.segments.find((s) => s.action === action);
  const fired = (action: string, tMs: number) => {
    const s = seg(action);
    return !!s && tMs >= s.t[0];
  };
  const segP = (action: string, tMs: number) => {
    const s = seg(action);
    if (!s) return 0;
    return clamp01((tMs - s.t[0]) / Math.max(1, s.t[1] - s.t[0]));
  };
  /** 从某动作起点到播报结束的全局进度（路线在播完时恰好走完） */
  const tailP = (action: string, tMs: number) => {
    const s = seg(action);
    if (!s) return 0;
    return clamp01((tMs - s.t[0]) / Math.max(1, timeline!.durationMs - s.t[0]));
  };

  function applyScene(tMs: number) {
    switch (sceneId) {
      case 'nav': {
        const p = tailP('route:draw', tMs);
        setRoute('nav-route', 'nav-car', p);
        $('nav-chip-dist').classList.toggle('on', fired('route:info', tMs));
        $('nav-chip-eta').classList.toggle('on', fired('route:eta', tMs));
        $s('nav-dest').classList.toggle('reached', p >= 0.995);
        return 62 * Math.sin(Math.PI * clamp01(p)) + 2;
      }
      case 'tour': {
        const path = $s('tour-route') as SVGPathElement;
        const nodes = Array.from(host.querySelectorAll<SVGGElement>('.tour-node'));
        const marks: Array<[number, number]> = [[seg('route:draw')?.t[0] ?? 0, 0]];
        for (const n of nodes) {
          const wp = n.dataset.wp!;
          const s = seg(`wp:${wp}`);
          if (!s) continue;
          const f = fractionAt(path, Number(n.dataset.x), Number(n.dataset.y), `tour-${wp}`);
          marks.push([s.t[0], f]);
          n.classList.toggle('active', tMs >= s.t[0]);
        }
        marks.push([timeline!.durationMs, 1]);
        let p = 0;
        for (let i = 1; i < marks.length; i++) {
          const [ta, fa] = marks[i - 1]!;
          const [tb, fb] = marks[i]!;
          if (tMs <= tb || i === marks.length - 1) {
            p = fa + (fb - fa) * clamp01((tMs - ta) / Math.max(1, tb - ta));
            break;
          }
        }
        setRoute('tour-route', 'tour-car', p);
        $('tour-chip').classList.toggle('on', fired('route:info', tMs));
        return 54 * Math.sin(Math.PI * clamp01(p)) + 2;
      }
      case 'lane': {
        const left = fired('lane:left', tMs);
        $s('lane-scanline').classList.toggle('on', fired('lane:scan', tMs) && !left);
        $s('lane-left-hl').classList.toggle('on', left);
        $s('lane-arrow').classList.toggle('on', left);
        $('lane-chip').classList.toggle('on', left);
        const car = $s('lane-car');
        car.style.transform = left ? 'translate(175px, 170px)' : 'translate(260px, 170px)';
        return 82;
      }
      case 'park': {
        const path = $s('park-path') as SVGPathElement;
        const fFound = fractionAt(path, 296, 152, 'park-found');
        const p1 = segP('park:enter', tMs);
        const found = fired('park:found', tMs);
        const p2 = fired('park:go', tMs) ? tailP('park:go', tMs) : 0;
        const p = found ? fFound + (1 - fFound) * p2 : fFound * p1;
        setRoute('park-path', 'park-car', p);
        $s('park-b2').classList.toggle('on', found);
        $s('park-slot').classList.toggle('on', found);
        $('park-chip-found').classList.toggle('on', found);
        $('park-chip-go').classList.toggle('on', fired('park:go', tMs));
        return 12 * (1 - 0.7 * p) + 2;
      }
      case 'travel': {
        const pTemp = segP('wx:temp', tMs);
        $('wx-temp').textContent = `${Math.round(-18 * pTemp)}°`;
        $s('wx-icon').classList.toggle('on', fired('wx:snow', tMs));
        $('wx-chip-jacket').classList.toggle('on', fired('wx:cloth', tMs));
        $('wx-chip-hat').classList.toggle('on', fired('wx:acc', tMs));
        $('wx-chip-gloves').classList.toggle('on', fired('wx:acc', tMs));
        return 0;
      }
    }
    return 0;
  }

  function resetSceneVisuals() {
    for (const [pathId, carId] of [
      ['nav-route', 'nav-car'],
      ['tour-route', 'tour-car'],
      ['park-path', 'park-car'],
    ] as const) {
      const path = $s(pathId) as SVGPathElement | null;
      if (path) setRoute(pathId, carId, 0);
    }
    host
      .querySelectorAll('.chip.on, .tour-node.active, .lane-hl.on, .lane-arrow.on, .slot.on, .lvl.on, .wx-icon.on, .wx-chip.on, .scanline.on, .dest.reached')
      .forEach((el) => el.classList.remove('on', 'active', 'reached'));
    const laneCar = $s('lane-car');
    if (laneCar) laneCar.style.transform = 'translate(260px, 170px)';
    $('wx-temp').textContent = '0°';
    speedNow = 0;
    paintGauge(0);
    userLine.classList.remove('visible');
    progressFill.style.width = '0%';
    clock.textContent = '00.0 / 00.0 s';
  }

  // ---------------------------------------------------------------- 仪表

  function initGaugeTicks() {
    const g = $s('gauge-ticks');
    if (g.childNodes.length > 0) return; // 幂等：重复挂载不重复画刻度
    const ns = 'http://www.w3.org/2000/svg';
    for (let v = 0; v <= 120; v += 30) {
      const a = ((-120 + v * 2) * Math.PI) / 180;
      const sin = Math.sin(a);
      const cos = Math.cos(a);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(100 + 70 * sin));
      line.setAttribute('y1', String(105 - 70 * cos));
      line.setAttribute('x2', String(100 + 78 * sin));
      line.setAttribute('y2', String(105 - 78 * cos));
      g.appendChild(line);
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', String(100 + 57 * sin));
      label.setAttribute('y', String(105 - 57 * cos + 3));
      label.setAttribute('text-anchor', 'middle');
      label.textContent = String(v);
      g.appendChild(label);
    }
  }

  function paintGauge(target: number) {
    speedNow = REDUCED ? target : speedNow + (target - speedNow) * 0.08;
    if (Math.abs(target - speedNow) < 0.3) speedNow = target;
    const v = Math.max(0, Math.min(120, speedNow));
    speedNum.textContent = String(Math.round(v));
    needle.style.transform = `rotate(${-120 + (v / 120) * 240}deg)`;
    gaugeFill.style.strokeDashoffset = String(100 - (v / 120) * 100);
  }

  // ---------------------------------------------------------------- 波形

  const waveCtx = wave.getContext('2d')!;
  const BAR_N = 48;
  const barPattern = Array.from({ length: BAR_N }, (_, i) => 0.45 + 0.55 * Math.abs(Math.sin(i * 2.7 + 1.3)));

  let waveColors: { accent: string; dim: string } | null = null;

  function paintWave(tMs: number, playing: boolean) {
    const W = wave.width;
    const H = wave.height;
    waveCtx.clearRect(0, 0, W, H);
    if (!waveColors) {
      const style = getComputedStyle(screen);
      waveColors = {
        accent: style.getPropertyValue('--scr-accent').trim() || '#ff8a4b',
        dim: style.getPropertyValue('--scr-line').trim() || '#2a3342',
      };
    }
    const { accent, dim } = waveColors;

    let levels: number[] | null = null;
    let rms = 0;
    if (playing && analyser && freqData) {
      analyser.getByteFrequencyData(freqData as Uint8Array<ArrayBuffer>);
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) sum += freqData[i]!;
      if (sum > 0) {
        levels = [];
        for (let i = 0; i < BAR_N; i++) {
          const bin = Math.floor((i / BAR_N) * freqData.length * 0.72);
          levels.push(freqData[bin]! / 255);
        }
        rms = sum / freqData.length / 255;
      }
    }
    if (playing && !levels && timeline) {
      // AnalyserNode 不可用/静音路由时：预计算峰值降级（仍与播放时钟同步）
      const peak = timeline.peaks[Math.floor(tMs / timeline.peakIntervalMs)] ?? 0;
      levels = barPattern.map((f, i) => peak * f * (0.72 + 0.28 * Math.sin(tMs / 90 + i * 0.9)));
      rms = peak * 0.8;
    }

    const bw = W / BAR_N;
    if (levels) {
      waveCtx.fillStyle = accent;
      for (let i = 0; i < BAR_N; i++) {
        const h = Math.max(2, levels[i]! * (H - 8));
        waveCtx.globalAlpha = 0.35 + 0.65 * levels[i]!;
        waveCtx.fillRect(i * bw + bw * 0.24, (H - h) / 2, bw * 0.52, h);
      }
      waveCtx.globalAlpha = 1;
    } else {
      waveCtx.fillStyle = dim;
      for (let i = 0; i < BAR_N; i++) waveCtx.fillRect(i * bw + bw * 0.24, H / 2 - 1.5, bw * 0.52, 3);
    }
    orb.style.setProperty('--rms', String(0.7 + rms * 1.1));
  }

  // ---------------------------------------------------------------- 播放

  async function fetchTimeline(): Promise<Timeline> {
    const key = `${sceneId}/${localeCode}`;
    const hit = timelineCache.get(key);
    if (hit) return hit;
    const res = await fetch(clipUrl('timeline.json'));
    if (!res.ok) throw new Error(`timeline ${res.status}`);
    const tl = (await res.json()) as Timeline;
    timelineCache.set(key, tl);
    return tl;
  }

  function preloadSelection() {
    fetchTimeline().catch(() => undefined);
    const url = clipUrl('mp3');
    if (!audio.src.endsWith(url)) {
      audio.src = url;
      audio.load();
    }
  }

  function ensureAudioGraph() {
    if (audioCtx) return;
    try {
      const Ctx = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctx();
      const src = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.72;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch {
      audioCtx = null; // 波形走峰值降级
    }
  }

  function frame() {
    if (!timeline) return;
    const tMs = audio.currentTime * 1000;
    const dur = timeline.durationMs;
    progressFill.style.width = `${clamp01(tMs / dur) * 100}%`;
    clock.textContent = `${(tMs / 1000).toFixed(1).padStart(4, '0')} / ${(dur / 1000).toFixed(1)} s`;
    paintCaption(tMs);
    const speedTarget = applyScene(tMs);
    paintGauge(status === 'speaking' ? speedTarget : 0);
    paintWave(tMs, status === 'speaking');
    if (status === 'speaking') rafId = requestAnimationFrame(frame);
  }

  function finishPlayback() {
    if (!timeline) return;
    cancelAnimationFrame(rafId);
    const tEnd = timeline.durationMs;
    paintCaption(tEnd);
    applyScene(tEnd);
    speedNow = 0;
    paintGauge(0);
    paintWave(tEnd, false);
    progressFill.style.width = '100%';
    setStatus('done', `播报完成 · ${localeCode} · 动作时间轴已同步`);
    const secs = timeline.durationMs / 1000;
    $('stat-chars').textContent = String(timeline.chars);
    $('stat-dur').textContent = `${secs.toFixed(1)} s`;
    $('stat-rate').textContent = `${(timeline.chars / secs).toFixed(1)} 字符/s`;
    $('stat-words').textContent = String(timeline.words.length);
    statsBox.hidden = false;
  }

  function stopPlayback(toIdle = true) {
    cancelAnimationFrame(rafId);
    pausedWhileSpeaking = false;
    audio.pause();
    audio.currentTime = 0;
    if (toIdle) {
      setStatus('idle', '待机 · 选择语言与场景后播放');
      resetSceneVisuals();
      caption.innerHTML = '<span class="cap-placeholder">— 选择语言与场景，点击「播放播报」 —</span>';
      paintWave(0, false);
    }
  }

  async function play() {
    if (status === 'speaking') {
      stopPlayback();
      return;
    }
    try {
      setStatus('loading', '加载音频与时间轴 …');
      ensureAudioGraph();
      if (audioCtx?.state === 'suspended') void audioCtx.resume();
      timeline = await fetchTimeline();
      buildCaption(timeline);
      userText.textContent = (sceneOf(sceneId).user as Record<string, string>)[localeCode] ?? '';
      userLine.classList.add('visible');
      resetSceneVisualsSoft();
      await audio.play();
      const loc = localeOf(localeCode);
      setStatus('speaking', `播报中 · ${loc.name} · voice=${timeline.voice}`);
      statsBox.hidden = true;
      rafId = requestAnimationFrame(frame);
    } catch (err) {
      console.error(err);
      setStatus('error', '资源加载失败 — 请检查网络后刷新重试');
    }
  }

  /** 播放前软复位（保留用户指令行与字幕结构） */
  function resetSceneVisualsSoft() {
    progressFill.style.width = '0%';
    applyScene(0);
    paintCaption(0);
  }

  // ---------------------------------------------------------------- 选择

  function selectLocale(code: string, syncURL = true) {
    stopPlayback();
    localeCode = code;
    const loc = localeOf(code);
    host.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.locale === code));
    });
    $('hmi-locale').textContent = code;
    $('hmi-dir').textContent = loc.dir.toUpperCase();
    screen.dataset.dir = loc.dir;
    consoleEl.setAttribute('dir', loc.dir);
    updateUserPreview();
    preloadSelection();
    if (syncURL) writeURL();
  }

  function selectScene(id: string, syncURL = true) {
    stopPlayback();
    sceneId = id;
    const scene = sceneOf(id);
    host.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.scene === id));
    });
    screen.dataset.scene = id;
    $('hmi-scene-tag').textContent = scene.tag;
    updateUserPreview();
    preloadSelection();
    if (syncURL) writeURL();
  }

  function updateUserPreview() {
    const scene = sceneOf(sceneId);
    userText.textContent = (scene.user as Record<string, string>)[localeCode] ?? '';
    userLine.classList.add('visible');
  }

  // ---------------------------------------------------------------- 启动

  initGaugeTicks();
  host.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((b) => {
    on(b, 'click', () => selectLocale(b.dataset.locale!));
  });
  host.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((b) => {
    on(b, 'click', () => void selectScene(b.dataset.scene!));
  });
  on(playBtn, 'click', () => void play());
  on(audio, 'ended', finishPlayback);

  // 深链初始状态（facade 已按 manifest.deepLinkParams 白名单过滤：locale / scene）
  const initLocale = params.get('locale');
  const initScene = params.get('scene');
  selectLocale(
    initLocale && manifest.locales.some((l) => l.code === initLocale) ? initLocale : DEFAULT_LOCALE,
    false,
  );
  selectScene(
    initScene && manifest.scenes.some((s) => s.id === initScene) ? initScene : DEFAULT_SCENE,
    false,
  );
  paintWave(0, false);
  opts.onBackend?.('dom'); // SVG/DOM HMI，无 GPU 后端
  // e2e 测试钩子（不影响功能）
  (window as unknown as { __ttscAudio: HTMLAudioElement }).__ttscAudio = audio;

  // ---------------------------------------------------------------- LabInstance 契约

  return {
    pause: () => {
      if (status === 'speaking' && !audio.paused) {
        pausedWhileSpeaking = true;
        audio.pause();
        cancelAnimationFrame(rafId); // RAF 必须停（§9.2）
      }
    },
    resume: () => {
      if (pausedWhileSpeaking && status === 'speaking') {
        pausedWhileSpeaking = false;
        void audio.play().then(() => {
          rafId = requestAnimationFrame(frame);
        });
      }
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      stopPlayback(false);
      for (const { el, type, fn } of listeners) el.removeEventListener(type, fn);
      listeners.length = 0;
      audio.removeAttribute('src');
      audio.load();
      void audioCtx?.close();
      audioCtx = null;
      analyser = null;
      freqData = null;
      timelineCache.clear();
      pathLenCache.clear();
      fracCache.clear();
    },
    setParam: (key, value) => {
      if (key === 'locale' && manifest.locales.some((l) => l.code === value)) selectLocale(value);
      else if (key === 'scene' && manifest.scenes.some((s) => s.id === value)) selectScene(value);
    },
  };
}
