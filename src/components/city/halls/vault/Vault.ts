/**
 * 帧库 · S1 控制器
 *
 * 负责：装 manifest → 解码图集 → 喂引擎；输入（拖 / 滚轮 / 方向键）→ 视图目标；
 * 阻尼逼近 + 只在有变化时渲染；HUD（时码 / 帧号 / 标尺）；海报出图 + URL 确定性参数。
 * 状态机（草案 §2）：idle → blade → tilted → poster；pulled / flipped / exploded 由 W3 接。
 */
import { VolumeEngine, type VolumeView } from './volume/VolumeEngine';

export interface VaultManifest {
  ep: string; title: string; stage: string; label: string | null;
  sha256: string; duration_s: number; frames: number | null; fps_src: number;
  volume: { w: number; h: number; n: number; fps: number; atlas: string[]; proj: { xt: string; yt: string } };
  rings: { id: string; time_s: number; frame: number; defect_class: string; quote: string; fixed_in: string; status: string }[];
  video: { src: string };
}

type Phase = 'loading' | 'idle' | 'blade' | 'tilted' | 'poster' | 'unsupported';

const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR_CAP = 2;

export class Vault {
  private engine: VolumeEngine | null = null;
  private manifest!: VaultManifest;
  private readonly canvas: HTMLCanvasElement;
  private readonly host: HTMLElement;
  private target: VolumeView = { rx: 0.32, ry: -0.55, cut: 0.55, tilt: 0, cutOn: true, line: 0.55, edge: 0 };
  private view: VolumeView = { ...this.target };
  private raf = 0;
  private phase: Phase = 'loading';
  private bladeTimer = 0;
  private drag: { x: number; y: number } | null = null;

  constructor(host: HTMLElement) {
    this.host = host;
    this.canvas = host.querySelector('[data-vault-canvas]') as HTMLCanvasElement;
  }

  async mount(manifestUrl: string, base: string): Promise<void> {
    this.setPhase('loading');
    const engine = VolumeEngine.create(this.canvas);
    if (!engine) { this.setPhase('unsupported'); return; }
    this.engine = engine;
    const res = await fetch(manifestUrl);
    if (!res.ok) { this.setPhase('unsupported'); return; }
    this.manifest = (await res.json()) as VaultManifest;
    const dir = manifestUrl.replace(/[^/]+$/, '');
    const img = (name: string): Promise<ImageBitmap> =>
      fetch(dir + name).then((r) => r.blob()).then((b) => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }));
    const [atlases, xt, yt] = await Promise.all([
      Promise.all(this.manifest.volume.atlas.map(img)), img(this.manifest.volume.proj.xt), img(this.manifest.volume.proj.yt),
    ]);
    const { n, stride } = engine.load({ w: this.manifest.volume.w, h: this.manifest.volume.h, n: this.manifest.volume.n, atlases, xt, yt });
    this.host.dataset.vaultSlices = String(n);
    this.host.dataset.vaultStride = String(stride);
    this.readUrl();
    this.view = { ...this.target };
    this.bindInput();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(this.canvas);
    this.setPhase('idle');
    this.requestFrame();
    (window as unknown as { __vault?: unknown }).__vault = {
      state: () => ({ phase: this.phase, ...this.view, n, stride, ep: this.manifest.ep }),
      set: (o: Partial<VolumeView>) => { Object.assign(this.target, o); this.requestFrame(); },
      base,
    };
  }

  // ---------- 输入 ----------
  private bindInput(): void {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => { this.drag = { x: e.clientX, y: e.clientY }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointerup', () => { this.drag = null; });
    c.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      this.target.ry += (e.clientX - this.drag.x) * 0.006;
      this.target.rx = clamp(this.target.rx + (e.clientY - this.drag.y) * 0.006, -1.2, 1.2);
      this.drag = { x: e.clientX, y: e.clientY };
      this.requestFrame();
    });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.blade(this.target.cut + e.deltaY * 0.00025);
    }, { passive: false });
    this.host.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? this.manifest.volume.fps / this.frames() : 1 / this.frames();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const dir = e.key === 'ArrowLeft' ? -1 : 1;
        if (e.altKey) this.tilt(this.target.tilt + dir * 0.03);
        else this.blade(this.target.cut + dir * step);
      }
      if (e.key === '0') this.tilt(0);
    });
    this.host.querySelector('[data-vault-poster]')?.addEventListener('click', () => void this.poster());
    this.host.querySelectorAll<HTMLElement>('[data-vault-ring]').forEach((el) => {
      el.addEventListener('click', () => this.blade(Number(el.dataset.t)));
    });
  }

  private frames(): number { return this.engine?.frames ?? 1; }

  private blade(cut: number): void {
    this.target.cut = clamp(cut, 0, 1);
    this.target.line = this.target.cut;
    this.target.edge = 1;
    this.setPhase(this.target.tilt !== 0 ? 'tilted' : 'blade');
    clearTimeout(this.bladeTimer);
    this.bladeTimer = window.setTimeout(() => { this.target.edge = 0; this.requestFrame(); }, 800);
    this.requestFrame();
  }

  private tilt(t: number): void {
    this.target.tilt = clamp(t, -0.9, 0.9);
    this.setPhase(this.target.tilt !== 0 ? 'tilted' : 'blade');
    this.requestFrame();
  }

  // ---------- 渲染 ----------
  private resize(): void {
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; this.requestFrame(); }
  }

  private requestFrame(): void {
    if (!this.raf) this.raf = requestAnimationFrame(() => this.tick());
  }

  private tick(): void {
    this.raf = 0;
    const k = REDUCED ? 1 : 0.18;
    let moving = false;
    for (const key of ['rx', 'ry', 'cut', 'tilt', 'line', 'edge'] as const) {
      const d = this.target[key] - this.view[key];
      if (Math.abs(d) > 1e-4) { this.view[key] += d * k; moving = true; } else this.view[key] = this.target[key];
    }
    this.view.cutOn = this.target.cutOn;
    this.engine?.render(this.view, this.canvas.width, this.canvas.height);
    this.hud();
    if (moving) this.requestFrame();
  }

  private hud(): void {
    const t = this.view.cut * this.manifest.duration_s;
    // 源帧率已知 → 源帧号；未知（EP2 登记无 frames）→ 帧体切片号，前缀区分，不冒充
    const label = this.manifest.fps_src
      ? `f${Math.round(t * this.manifest.fps_src)}`
      : `s${Math.round(this.view.cut * (this.frames() - 1))}`;
    const mm = String(Math.floor(t / 60)).padStart(2, '0');
    const ss = (t % 60).toFixed(3).padStart(6, '0');
    setText(this.host, '[data-vault-tc]', `${mm}:${ss}`);
    setText(this.host, '[data-vault-frame]', label);
    setText(this.host, '[data-vault-tilt]', this.view.tilt === 0 ? '正切' : `斜 ${(this.view.tilt * 57.3).toFixed(0)}°`);
    this.host.style.setProperty('--vault-t', String(this.view.cut));
    this.host.dataset.vaultTilted = this.view.tilt !== 0 ? '1' : '';
  }

  // ---------- 海报 / URL ----------
  private async poster(): Promise<void> {
    if (!this.engine) return;
    this.setPhase('poster');
    const blob = await this.engine.snapshot({ ...this.view, edge: 0, line: -1 }, 1920, 1080);
    this.writeUrl();
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `frame-vault-${this.manifest.ep}-cut${this.view.cut.toFixed(3)}-tilt${this.view.tilt.toFixed(2)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    this.setPhase(this.view.tilt !== 0 ? 'tilted' : 'blade');
    this.requestFrame();
  }

  private readUrl(): void {
    const p = new URLSearchParams(location.search);
    const num = (k: string, lo: number, hi: number): number | null => {
      const v = Number(p.get(k)); return p.has(k) && Number.isFinite(v) ? clamp(v, lo, hi) : null;
    };
    const cut = num('cut', 0, 1), tilt = num('tilt', -0.9, 0.9), rx = num('rx', -1.2, 1.2), ry = num('ry', -6.3, 6.3);
    if (cut !== null) { this.target.cut = cut; this.target.line = cut; }
    if (tilt !== null) this.target.tilt = tilt;
    if (rx !== null) this.target.rx = rx;
    if (ry !== null) this.target.ry = ry;
  }

  private writeUrl(): void {
    const p = new URLSearchParams(location.search);
    p.set('ep', this.manifest.ep.toLowerCase());
    p.set('cut', this.view.cut.toFixed(3)); p.set('tilt', this.view.tilt.toFixed(3));
    p.set('rx', this.view.rx.toFixed(3)); p.set('ry', this.view.ry.toFixed(3));
    history.replaceState(null, '', `${location.pathname}?${p}`);
  }

  private setPhase(p: Phase): void { this.phase = p; this.host.dataset.vaultState = p; }
}

function clamp(v: number, lo: number, hi: number): number { return Math.min(hi, Math.max(lo, v)); }
function setText(root: ParentNode, sel: string, text: string): void {
  const el = root.querySelector(sel); if (el && el.textContent !== text) el.textContent = text;
}
