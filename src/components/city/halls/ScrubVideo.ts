/**
 * About Hall 视频 scrub：指针横向进度 / sticky 长滚动进度。
 * 零依赖；rAF 驱动 currentTime，seek ≤30/s，video.seeking 时不重复 seek。
 */

const SEEK_HZ = 30;
const SEEK_GAP_MS = 1000 / SEEK_HZ;
/** loadedmetadata 后落到 0.02s，避开部分浏览器 t=0 首帧黑屏。 */
const BOOT_TIME_S = 0.02;
const REDUCE_MQ = '(prefers-reduced-motion: reduce)';

export type ScrubHandle = {
  destroy(): void;
};

export type ScrubVideoOpts = {
  onProgress?: (progress: number) => void;
  poster?: string;
  /** 默认 auto。滚动段先 none，进视口前再升 auto。 */
  preload?: 'none' | 'metadata' | 'auto';
  /** 距视口此像素内才把 preload 升为 auto 并 load()。 */
  preloadWhenNearPx?: number;
};

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

function durationOf(video: HTMLVideoElement): number | null {
  const d = video.duration;
  if (typeof d !== 'number' || !Number.isFinite(d) || d <= 0) return null;
  return d;
}

function prefersReducedMotion(): boolean {
  return matchMedia(REDUCE_MQ).matches;
}

function applyVideoShell(
  video: HTMLVideoElement,
  poster: string | undefined,
  preload: NonNullable<ScrubVideoOpts['preload']> = 'auto',
): void {
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = false;
  video.controls = false;
  video.loop = false;
  video.preload = preload;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('muted', '');
  video.removeAttribute('controls');
  if (poster) video.poster = poster;
  video.style.objectFit = 'cover';
  video.pause();
}

type Clock = {
  setProgress(progress: number): void;
  primeFromMetadata(): void;
  destroy(): void;
};

function createClock(video: HTMLVideoElement, onProgress: ScrubVideoOpts['onProgress']): Clock {
  let progress = 0;
  let raf = 0;
  let lastSeekAt = Number.NEGATIVE_INFINITY;
  let dead = false;

  const seekToTarget = (now: number, force: boolean): void => {
    if (dead) return;
    const duration = durationOf(video);
    if (duration === null) return;
    if (!force) {
      if (video.seeking) return;
      if (now - lastSeekAt < SEEK_GAP_MS) return;
    }
    let time = progress * duration;
    if (time < BOOT_TIME_S) time = Math.min(BOOT_TIME_S, duration);
    time = clamp(time, 0, duration);
    if (!force && Math.abs(video.currentTime - time) < 0.008) return;
    lastSeekAt = now;
    video.currentTime = time;
  };

  const tick = (now: number): void => {
    seekToTarget(now, false);
    if (!dead) raf = requestAnimationFrame(tick);
  };

  const ensureLoop = (): void => {
    if (dead || raf !== 0) return;
    raf = requestAnimationFrame(tick);
  };

  return {
    setProgress(next: number): void {
      progress = clamp(next, 0, 1);
      onProgress?.(progress);
      ensureLoop();
    },
    primeFromMetadata(): void {
      seekToTarget(performance.now(), true);
      onProgress?.(progress);
      ensureLoop();
    },
    destroy(): void {
      dead = true;
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
  };
}

function onMetadata(video: HTMLVideoElement, signal: AbortSignal, fn: () => void): void {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    fn();
    return;
  }
  video.addEventListener('loadedmetadata', fn, { once: true, signal });
}

export function createPointerScrub(
  container: HTMLElement,
  video: HTMLVideoElement,
  opts: ScrubVideoOpts = {},
): ScrubHandle {
  applyVideoShell(video, opts.poster, opts.preload ?? 'auto');
  if (prefersReducedMotion()) return { destroy() {} };

  const clock = createClock(video, opts.onProgress);
  const ac = new AbortController();
  const { signal } = ac;

  const read = (clientX: number): void => {
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    clock.setProgress(clamp((clientX - rect.left) / rect.width, 0, 1));
  };

  const reset = (): void => {
    clock.setProgress(0);
  };

  container.addEventListener(
    'pointerdown',
    (event) => {
      container.setPointerCapture(event.pointerId);
      read(event.clientX);
    },
    { signal },
  );
  container.addEventListener('pointermove', (event) => read(event.clientX), { signal });
  container.addEventListener('pointerleave', reset, { signal });
  container.addEventListener('pointercancel', reset, { signal });

  onMetadata(video, signal, () => clock.primeFromMetadata());

  return {
    destroy(): void {
      ac.abort();
      clock.destroy();
    },
  };
}

export function createScrollScrub(
  section: HTMLElement,
  video: HTMLVideoElement,
  opts: ScrubVideoOpts = {},
): ScrubHandle {
  const nearPx = opts.preloadWhenNearPx;
  const initialPreload = opts.preload ?? (nearPx != null ? 'none' : 'auto');
  applyVideoShell(video, opts.poster, initialPreload);
  if (prefersReducedMotion()) return { destroy() {} };

  const clock = createClock(video, opts.onProgress);
  const ac = new AbortController();
  const { signal } = ac;

  const read = (): void => {
    const denom = section.scrollHeight - window.innerHeight;
    if (denom <= 0) {
      clock.setProgress(0);
      return;
    }
    clock.setProgress(clamp(-section.getBoundingClientRect().top / denom, 0, 1));
  };

  // 禁 wheel+preventDefault：只读真实滚动位置。
  window.addEventListener('scroll', read, { passive: true, signal });
  window.addEventListener('resize', read, { passive: true, signal });
  window.visualViewport?.addEventListener('resize', read, { passive: true, signal });

  read();
  onMetadata(video, signal, () => {
    read();
    clock.primeFromMetadata();
  });

  if (nearPx != null) {
    const arm = (): void => {
      video.preload = 'auto';
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) video.load();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        arm();
        io.disconnect();
      },
      { root: null, rootMargin: `${nearPx}px 0px`, threshold: 0 },
    );
    io.observe(section);
    signal.addEventListener('abort', () => io.disconnect(), { once: true });
  }

  return {
    destroy(): void {
      ac.abort();
      clock.destroy();
    },
  };
}
