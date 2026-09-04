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
  reviews: { id: string; date: string; verdict: string; category: string; timecode: string | null }[];
  video: { src: string; sha256: string; bytes: number };
  script: { source: string; model: string; segments: number; cues: { start: number; end: number; text: string }[] } | null;
}

type Phase = 'loading' | 'idle' | 'blade' | 'tilted' | 'poster' | 'pulled' | 'flipped' | 'exploded' | 'unsupported';

const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR_CAP = 2;
const MOBILE = typeof matchMedia === 'function' && matchMedia('(max-width: 768px)').matches;

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
    // URL 里的 ep 优先于 SSR 默认集（海报分享链接要能落到同一集）
    const wanted = new URLSearchParams(location.search).get('ep');
    const slot = wanted ? this.host.querySelector<HTMLElement>(`[data-vault-slot][data-key="${wanted}"]`) : null;
    const ok = await this.loadEpisode(slot?.dataset.manifest ?? manifestUrl);
    if (!ok) { this.setPhase('unsupported'); return; }
    this.readUrl();
    this.view = { ...this.target };
    this.bindInput();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(this.canvas);
    this.setPhase('idle');
    this.requestFrame();
    this.nudge();
    (window as unknown as { __vault?: unknown }).__vault = {
      state: () => ({ phase: this.phase, ...this.view, n: this.frames(), stride: Number(this.host.dataset.vaultStride), ep: this.manifest.ep }),
      set: (o: Partial<VolumeView>) => { Object.assign(this.target, o); this.requestFrame(); },
      base,
    };
  }

  /** 装一集：manifest → 图集解码 → 帧体上传 → 头部/片架/门环/视频重绑。返回 false = 装载失败 */
  private async loadEpisode(manifestUrl: string): Promise<boolean> {
    const engine = this.engine;
    if (!engine) return false;
    const res = await fetch(manifestUrl);
    if (!res.ok) return false;
    const m = (await res.json()) as VaultManifest;
    const dir = manifestUrl.replace(/[^/]+$/, '');
    const img = (name: string): Promise<ImageBitmap> =>
      fetch(dir + name).then((r) => r.blob()).then((b) => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }));
    const [atlases, xt, yt] = await Promise.all([
      Promise.all(m.volume.atlas.map(img)), img(m.volume.proj.xt), img(m.volume.proj.yt),
    ]);
    const { n, stride } = engine.load({ w: m.volume.w, h: m.volume.h, n: m.volume.n, atlases, xt, yt });
    this.manifest = m;
    this.host.dataset.vaultSlices = String(n);
    this.host.dataset.vaultStride = String(stride);
    this.host.dataset.vaultEp = m.ep;
    this.bindHeader(m);
    this.buildRings(m);
    this.buildScript(m);
    const video = this.video();
    if (video) {
      video.pause();
      // 视频在 GitHub Release（跨域、本机实测 <120 KB/s）：装集即拉元数据（moov 在头部，faststart），
      // 第一次刮时再整段预载（见 blade()），双击抽帧时不至于等十几秒
      video.preload = 'metadata';
      video.src = m.video.src;
    }
    this.host.querySelectorAll<HTMLElement>('[data-vault-slot]').forEach((s) => s.setAttribute('aria-pressed', s.dataset.manifest === manifestUrl ? 'true' : 'false'));
    return true;
  }

  private bindHeader(m: VaultManifest): void {
    const stageName: Record<string, string> = { D: '开发', S: '台本锁', A: '样片锁', P: '画面锁', M: '声音锁', F: '定稿' };
    setText(this.host, '[data-vault-ep-label]', m.ep);
    setText(this.host, '[data-vault-title]', m.title);
    setText(this.host, '[data-vault-lock]', `${stageName[m.stage] ?? m.stage}${m.label ? ` · ${m.label}` : ''}${m.stage !== 'F' ? ' · 工作剪' : ''}`);
    this.host.querySelector<HTMLElement>('[data-vault-lock]')?.setAttribute('data-stage', m.stage);
    setText(this.host, '[data-vault-meta]', `${m.duration_s.toFixed(2)} s · ${m.volume.n} slices @ ${m.volume.fps} fps · sha ${m.sha256.slice(0, 8)}`);
    setText(this.host, '[data-vault-dur]', mmss(m.duration_s));
    setText(this.host, '[data-vault-pull-cap]', `${m.stage === 'F' ? '成片' : `工作剪 ${m.label ?? ''}`} · sha ${(m.video?.sha256 ?? '').slice(0, 8)}`);
    this.host.querySelector<HTMLAnchorElement>('[data-vault-download]')?.setAttribute('href', m.video?.src ?? '');
  }

  /** 门环 = manifest.rings（LOCATABLE 且在时长内）；悬停出卡片，点击刀锋跳到被抓的那一帧 */
  private buildRings(m: VaultManifest): void {
    const box = this.host.querySelector<HTMLElement>('[data-vault-rings]');
    const card = this.host.querySelector<HTMLElement>('[data-vault-card]');
    if (!box || !card) return;
    box.replaceChildren();
    const rings = m.rings.filter((r) => r.status === 'LOCATABLE' && r.time_s >= 0 && r.time_s <= m.duration_s);
    // 同一时刻（±0.4% 时长）的多次退回合成一枚粗环：环的粗细 = 退回次数（草案 §3.6）
    const groups: { t: number; items: typeof rings }[] = [];
    for (const r of [...rings].sort((a, b) => a.time_s - b.time_s)) {
      const g = groups[groups.length - 1];
      if (g && Math.abs(r.time_s - g.t) <= m.duration_s * 0.004) g.items.push(r); else groups.push({ t: r.time_s, items: [r] });
    }
    for (const g of groups) {
      const b = document.createElement('button');
      const t = (g.t / m.duration_s).toFixed(4);
      b.type = 'button'; b.className = 'vault__ring'; b.dataset.vaultRing = ''; b.dataset.t = t; b.dataset.count = String(g.items.length);
      b.style.setProperty('--x', `${((g.t / m.duration_s) * 100).toFixed(2)}%`);
      b.setAttribute('aria-label', `人审退回 ${g.items.map((r) => r.id).join('、')}：${mmss(g.t)} ${g.items.map((r) => r.quote).join('；')}`);
      const show = (): void => {
        card.innerHTML = g.items.map((r) =>
          `<q>${esc(r.quote)}</q><small>${mmss(r.time_s)} · f${r.frame} · ${esc(r.defect_class)}${r.fixed_in ? ` · 修于 ${esc(r.fixed_in)}` : ''} · ${esc(r.id)}</small>`,
        ).join('');
        card.style.setProperty('--x', b.style.getPropertyValue('--x'));
        card.hidden = false;
      };
      b.addEventListener('mouseenter', show); b.addEventListener('focus', show);
      b.addEventListener('mouseleave', () => { card.hidden = true; }); b.addEventListener('blur', () => { card.hidden = true; });
      b.addEventListener('click', () => { this.blade(Number(t)); b.classList.add('is-hit'); setTimeout(() => b.classList.remove('is-hit'), 900); });
      box.appendChild(b);
    }
    this.host.dataset.vaultRings = String(groups.length);
    this.host.dataset.vaultRejects = String(rings.length);
    const label = this.host.querySelector<HTMLElement>('[data-vault-rejects-label]');
    if (label) { label.hidden = rings.length === 0; setText(label, '[data-vault-rejects-n]', String(rings.length)); }
  }

  /** 片架切集：淡出 → 换帧体 → 淡入；URL 记 ep */
  private async switchEp(slot: HTMLElement): Promise<void> {
    const url = slot.dataset.manifest;
    if (!url || slot.getAttribute('aria-pressed') === 'true' || this.phase === 'loading') return;
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    this.unpull();
    this.setPhase('loading');
    const ok = await this.loadEpisode(url);
    this.setPhase(ok ? 'idle' : 'unsupported');
    const p = new URLSearchParams(location.search); p.set('ep', slot.dataset.key ?? '');
    history.replaceState(null, '', `${location.pathname}?${p}`);
    this.requestFrame();
  }

  // ---------- 输入 ----------
  private bindInput(): void {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => { this.drag = { x: e.clientX, y: e.clientY }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointerup', () => { this.drag = null; });
    c.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      if (MOBILE) {
        // 移动端「只看」态（草案 §7）：单指横滑 = 沿时间刮，不旋转、不斜切
        this.blade(this.target.cut + (e.clientX - this.drag.x) / Math.max(200, c.clientWidth));
      } else {
        this.target.ry += (e.clientX - this.drag.x) * 0.006;
        this.target.rx = clamp(this.target.rx + (e.clientY - this.drag.y) * 0.006, -1.2, 1.2);
      }
      this.drag = { x: e.clientX, y: e.clientY };
      this.requestFrame();
    });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.blade(this.target.cut + e.deltaY * 0.00025);
    }, { passive: false });
    // 键盘挂 document：全屏后焦点落到 body（W3 实测），挂宿主会失灵。只在宿主含焦点、全屏中或播放态时接管
    document.addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (!this.host.contains(document.activeElement) && !document.fullscreenElement && this.phase !== 'pulled' && this.phase !== 'flipped') return;
      const step = e.shiftKey ? this.manifest.volume.fps / this.frames() : 1 / this.frames();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const dir = e.key === 'ArrowLeft' ? -1 : 1;
        if (e.altKey) this.tilt(this.target.tilt + dir * 0.03);
        else this.blade(this.target.cut + dir * step);
      }
      if (e.key === '0') this.tilt(0);
      if (e.key === 'e' || e.key === 'E') { e.preventDefault(); this.explode(this.phase !== 'exploded'); }
      if (e.key === 'Enter' && this.phase !== 'pulled') { e.preventDefault(); void this.pull(); }
      if (e.key === 'Escape' && this.phase === 'pulled' && !document.fullscreenElement) this.unpull();
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); if (this.phase === 'pulled') void this.fullscreen(); else this.flip(this.phase !== 'flipped'); }
    });
    c.addEventListener('dblclick', () => void this.pull());
    const video = this.video();
    this.host.querySelector('[data-vault-fullscreen]')?.addEventListener('click', () => void this.fullscreen());
    if (video) {
      video.addEventListener('click', () => this.unpull());
      video.addEventListener('ended', () => this.unpull());
      // 播放中把视频时刻回写到刀锋：切面与金色时间线跟着成片走（rVFC 有则逐帧，无则 timeupdate）
      const follow = (): void => {
        if (this.phase !== 'pulled') return;
        const cut = clamp(video.currentTime / this.manifest.duration_s, 0, 1);
        this.target.cut = cut; this.target.line = cut; this.requestFrame();
      };
      const rvfc = (video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
      if (typeof rvfc === 'function') {
        const loop = (): void => { follow(); if (this.phase === 'pulled') rvfc.call(video, loop); };
        video.addEventListener('playing', loop);
      } else video.addEventListener('timeupdate', follow);
    }
    this.host.querySelector('[data-vault-poster]')?.addEventListener('click', () => void this.poster());
    this.host.querySelector('[data-vault-explode]')?.addEventListener('click', () => this.explode(this.phase !== 'exploded'));
    const slots = Array.from(this.host.querySelectorAll<HTMLElement>('[data-vault-slot]'));
    slots.forEach((s) => s.addEventListener('click', () => void this.switchEp(s)));
    document.addEventListener('keydown', (e) => {
      if (!this.host.contains(document.activeElement) && !document.fullscreenElement && this.phase !== 'pulled') return;
      const i = Number(e.key) - 1;
      if (Number.isInteger(i) && i >= 0 && i < slots.length && !e.altKey && !e.metaKey) void this.switchEp(slots[i]);
    });
  }

  private frames(): number { return this.engine?.frames ?? 1; }

  /** 一次性引导：idle 1.2 s 后浮出，首次输入或 7 s 后收起；只发一次 */
  private nudge(): void {
    if (MOBILE || sessionStorage.getItem('vault-nudged')) return;
    const off = (): void => { delete this.host.dataset.vaultNudge; try { sessionStorage.setItem('vault-nudged', '1'); } catch { /* 隐私模式 */ } };
    setTimeout(() => { if (this.phase === 'idle') this.host.dataset.vaultNudge = '1'; }, 1200);
    setTimeout(off, 8200);
    for (const ev of ['pointerdown', 'wheel', 'keydown'] as const) this.host.addEventListener(ev, off, { once: true });
  }
  private video(): HTMLVideoElement | null { return this.host.querySelector<HTMLVideoElement>('[data-vault-video]'); }

  // ---------- 抽帧成片 ----------
  /** 切面抽出来变成真视频：从当前刀锋时刻续播，带音频（用户手势触发） */
  private async pull(): Promise<void> {
    const video = this.video();
    if (!video || !this.manifest.video?.src || this.phase === 'pulled' || this.phase === 'loading') return;
    if (!video.src) video.src = this.manifest.video.src;
    video.preload = 'auto';
    this.setPhase('pulled');
    const t = this.view.cut * this.manifest.duration_s;
    try {
      // W24 实测：seek 与 play 必须在手势同一同步段内发出——等 loadedmetadata/seeked 再 play 会耗尽用户激活，NotAllowedError。
      // 元数据未到时 currentTime 赋值按规范记为默认起播位置，浏览器自己排队，不需要等。
      video.currentTime = t;
      await video.play();
    } catch {
      // 自动播放被拒（无手势）→ 静音重试；仍失败就放回
      video.muted = true;
      try { await video.play(); } catch { this.unpull(); }
    }
  }

  /** 全屏整块「抽出的帧」（含角标）；再按一次退出全屏但不退出播放 */
  private async fullscreen(): Promise<void> {
    const fig = this.host.querySelector<HTMLElement>('[data-vault-pull]');
    if (!fig) return;
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); this.host.focus({ preventScroll: true }); }
      else await fig.requestFullscreen();
    } catch { /* 浏览器拒绝全屏（iframe/策略）→ 保持内嵌播放 */ }
  }

  // ---------- 翻面读稿 ----------
  private buildScript(m: VaultManifest): void {
    const ol = this.host.querySelector<HTMLElement>('[data-vault-cues]');
    const meta = this.host.querySelector<HTMLElement>('[data-vault-script-meta]');
    if (!ol) return;
    ol.replaceChildren();
    const cues = m.script?.cues ?? [];
    if (meta) meta.textContent = m.script ? `${m.script.segments} 句 · ${m.script.source.toUpperCase()} 对齐 · ${m.script.model.replace(/^.*\//, '')}` : '本集无时间对齐台本';
    cues.forEach((c, i) => {
      const li = document.createElement('li');
      li.className = 'vault__cue'; li.dataset.i = String(i);
      const t = document.createElement('time'); t.textContent = mmss(c.start);
      const sp = document.createElement('span'); sp.textContent = c.text;
      li.append(t, sp);
      li.addEventListener('click', () => { this.blade(c.start / m.duration_s); this.host.focus({ preventScroll: true }); });
      ol.appendChild(li);
    });
  }

  /** F：转到背面，台本板浮出；当前刀锋时刻那句高亮并滚到可见 */
  private flip(on: boolean): void {
    const panel = this.host.querySelector<HTMLElement>('[data-vault-script]');
    if (on) {
      this.unpull();
      this.setPhase('flipped');
      this.target.ry += Math.PI;
      if (panel) panel.hidden = false;
      this.syncCue(true);
    } else {
      this.setPhase(this.target.tilt !== 0 ? 'tilted' : 'idle');
      this.target.ry -= Math.PI;
      if (panel) setTimeout(() => { if (this.phase !== 'flipped') panel.hidden = true; }, 500);
    }
    this.requestFrame();
  }

  private syncCue(scroll = false): void {
    const cues = this.manifest.script?.cues;
    const ol = this.host.querySelector<HTMLElement>('[data-vault-cues]');
    if (!cues || !ol || this.phase !== 'flipped') return;
    const t = this.view.cut * this.manifest.duration_s;
    let lo = 0, hi = cues.length - 1, idx = -1;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (cues[mid].start <= t) { idx = mid; lo = mid + 1; } else hi = mid - 1; }
    const prev = ol.querySelector('.is-now');
    const next = idx >= 0 ? ol.children[idx] as HTMLElement : null;
    if (prev === next) return;
    prev?.classList.remove('is-now');
    if (next) {
      next.classList.add('is-now');
      // 只滚台本容器，不滚页面（scrollIntoView 会把整页也带走）
      const top = next.offsetTop - ol.clientHeight / 2 + next.offsetHeight / 2;
      if (scroll || REDUCED) ol.scrollTop = top; else ol.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // ---------- 爆炸分层（S1 → S2 过场） ----------
  /** E：立方体退到远处并压暗，S2 各集的锁行按层滑入；再按 E / 回到顶部还原 */
  private explode(on: boolean): void {
    const loop = document.querySelector<HTMLElement>('[data-vault-loop]');
    if (on) {
      this.unpull();
      this.setPhase('exploded');
      this.target.rx = 0.9; this.target.ry = this.target.ry - 0.6; this.target.cutOn = false;
      loop?.classList.add('is-exploded');
      loop?.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    } else {
      this.setPhase('idle');
      this.target.rx = 0.32; this.target.ry = -0.55; this.target.cutOn = true;
      loop?.classList.remove('is-exploded');
      this.host.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    }
    this.requestFrame();
  }

  private unpull(): void {
    const video = this.video();
    if (video) video.pause();
    if (this.phase === 'pulled') { this.setPhase(this.target.tilt !== 0 ? 'tilted' : 'blade'); this.requestFrame(); }
  }

  private blade(cut: number): void {
    const v = this.video();
    if (v && v.preload !== 'auto') v.preload = 'auto';   // 开始刮 = 大概率会抽帧，整段预载
    this.target.cut = clamp(cut, 0, 1);
    this.target.line = this.target.cut;
    this.target.edge = 1;
    // 翻面 / 播放态下刀锋只动时间，不改相位（否则台本高亮停更、F 收不回）
    if (this.phase !== 'flipped' && this.phase !== 'pulled') this.setPhase(this.target.tilt !== 0 ? 'tilted' : 'blade');
    clearTimeout(this.bladeTimer);
    this.bladeTimer = window.setTimeout(() => { this.target.edge = 0; this.requestFrame(); }, 800);
    this.requestFrame();
  }

  private tilt(t: number): void {
    this.target.tilt = clamp(t, -0.9, 0.9);
    if (this.phase !== 'flipped' && this.phase !== 'pulled') this.setPhase(this.target.tilt !== 0 ? 'tilted' : 'blade');
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
    this.syncCue();
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

  private setPhase(p: Phase): void {
    this.phase = p; this.host.dataset.vaultState = p;
    // 城→楼首帧黑帘（VaultArriveHead）在快门打开那一刻让位；卸类延后到快门白闪之后（.12s）
    if (p !== 'loading' && document.documentElement.classList.contains('vault-transit')) {
      const html = document.documentElement;
      setTimeout(() => { html.classList.add('vault-transit--open'); setTimeout(() => html.classList.remove('vault-transit', 'vault-transit--open'), 300); }, 120);
    }
  }
}

function clamp(v: number, lo: number, hi: number): number { return Math.min(hi, Math.max(lo, v)); }
function mmss(t: number): string { return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; }
function esc(s: unknown): string { return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c); }
function setText(root: ParentNode, sel: string, text: string): void {
  const el = root.querySelector(sel); if (el && el.textContent !== text) el.textContent = text;
}
