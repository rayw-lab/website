// 点击火花 + 粒子汇入总价（Canvas 2D）。同屏粒子硬顶 40；空闲不跑帧；pause() 立即停帧。
const PMAX = 40;

interface Spark { x: number; y: number; a: number; t: number; c: string }
interface Particle { sx: number; sy: number; tx: number; ty: number; mx: number; my: number; t: number; c: string; r: number }

export interface Fx {
  spark(x: number, y: number, color: string): void;
  burst(from: DOMRect, to: DOMRect, color: string): void;
  count(): number;
  pause(): void;
  resume(): void;
  dispose(): void;
}

export function createFx(parent: HTMLElement): Fx {
  const cv = document.createElement('canvas');
  cv.className = 'ce-fx';
  cv.setAttribute('aria-hidden', 'true');
  parent.appendChild(cv);
  const cx = cv.getContext('2d');
  let sparks: Spark[] = [];
  let parts: Particle[] = [];
  let raf = 0;
  let paused = false;

  const size = () => {
    const d = window.devicePixelRatio || 1;
    cv.width = Math.round(innerWidth * d);
    cv.height = Math.round(innerHeight * d);
    cx?.setTransform(d, 0, 0, d, 0, 0);
  };
  size();
  addEventListener('resize', size);

  const step = (now: number) => {
    raf = 0;
    if (!cx) return;
    cx.clearRect(0, 0, innerWidth, innerHeight);
    sparks = sparks.filter((s) => now - s.t < 420);
    for (const s of sparks) {
      const p = (now - s.t) / 420, e = p * (2 - p), d = e * 18, len = 8 * (1 - e);
      cx.strokeStyle = s.c; cx.globalAlpha = 1 - p; cx.lineWidth = 2;
      cx.beginPath();
      cx.moveTo(s.x + d * Math.cos(s.a), s.y + d * Math.sin(s.a));
      cx.lineTo(s.x + (d + len) * Math.cos(s.a), s.y + (d + len) * Math.sin(s.a));
      cx.stroke();
    }
    parts = parts.filter((p) => p.t < 1);
    for (const p of parts) {
      p.t += 0.02;
      if (p.t < 0) continue;
      const t = Math.min(1, p.t), e = t * t * (3 - 2 * t), u = 1 - e;
      const x = u * u * p.sx + 2 * u * e * p.mx + e * e * p.tx;
      const y = u * u * p.sy + 2 * u * e * p.my + e * e * p.ty;
      cx.globalAlpha = 0.9 - t * 0.3; cx.fillStyle = p.c; cx.shadowColor = p.c; cx.shadowBlur = 8;
      cx.beginPath(); cx.arc(x, y, p.r * (1 - t * 0.4), 0, 7); cx.fill(); cx.shadowBlur = 0;
    }
    cx.globalAlpha = 1;
    if ((sparks.length || parts.length) && !paused) raf = requestAnimationFrame(step);
    else cx.clearRect(0, 0, innerWidth, innerHeight);
  };
  const kick = () => { if (!raf && !paused) raf = requestAnimationFrame(step); };

  return {
    spark(x, y, c) {
      const t = performance.now();
      for (let i = 0; i < 8; i++) sparks.push({ x, y, a: (i / 8) * Math.PI * 2, t, c });
      kick();
    },
    burst(a, b, c) {
      const tx = b.left + b.width * 0.5, ty = b.top + b.height / 2;
      const room = Math.max(0, PMAX - parts.length);
      for (let i = 0; i < room; i++) {
        const sx = a.left + Math.random() * a.width, sy = a.top + Math.random() * a.height;
        parts.push({ sx, sy, tx: tx + (Math.random() - 0.5) * 60, ty: ty + (Math.random() - 0.5) * 16,
          mx: (sx + tx) / 2 + (Math.random() - 0.5) * 200, my: Math.min(sy, ty) - 60 - Math.random() * 160,
          t: -i * 0.016, c, r: 1.6 + Math.random() * 1.8 });
      }
      kick();
    },
    count: () => parts.length,
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; },
    resume() { paused = false; kick(); },
    dispose() { this.pause(); removeEventListener('resize', size); cv.remove(); },
  };
}
