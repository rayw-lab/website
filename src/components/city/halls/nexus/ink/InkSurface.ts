/**
 * 墨迹厅 · 运行时驱动
 *
 * 负责引擎之外的一切：画布尺寸、rAF 节律、生命周期暂停、降级判定。
 *
 * 🔴 生命周期是**通用**规则不是移动端专属（CHARTER §4.0-j）：
 *  - 不在视口 → 不 step
 *  - `document.hidden` → 不 step
 *  - 无交互超过 idleSeconds → 停转（省电；再有交互自动续）
 *  - 进视口后 2s 仍未 step 过一帧 → 判定为「canvas 已建但空白」的第五态，
 *    主动回调 onFallback 让调用方换海报（CHARTER §4.0-e）
 */

import { InkEngine, type InkEngineOptions } from './InkEngine';

export type FallbackReason =
  | 'reduced-motion'
  | 'save-data'
  | 'no-webgl2'
  | 'init-failed'
  | 'never-stepped';

export interface InkSurfaceOptions extends InkEngineOptions {
  /** 每帧回调：在这里落墨（replay 脚本或交互） */
  onFrame?: (engine: InkEngine, elapsed: number, dt: number) => void;
  onFallback?: (reason: FallbackReason) => void;
  /** replay 模式固定步长，构建期截图可复现 */
  fixedStep?: number;
  /** 设备像素比上限，控显存 */
  maxDpr?: number;
  /**
   * 是否自动起 rAF 循环。默认 true。
   * 🔴 `?demo` 停帧模式必须传 false：否则 seek() 之后 IntersectionObserver
   * 仍会启动循环，截图期间模拟继续推进，**截图内容取决于等待了多少毫秒**，
   * 「确定性海报」就是假的（W1b 由 advisor 指出，已用双截图 diff 自证修复）。
   */
  autoLoop?: boolean;
}

const MAX_DT = 1 / 30;

export class InkSurface {
  private engine: InkEngine;
  private raf = 0;
  private lastTime = 0;
  private elapsed = 0;
  private idleSince = 0;
  private inView = false;
  private stepped = false;
  private disposed = false;
  private observer?: IntersectionObserver;
  private readonly onVisibility = () => this.sync();

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    engine: InkEngine,
    private readonly opts: InkSurfaceOptions,
  ) {
    this.engine = engine;
    this.observer = new IntersectionObserver(
      (entries) => {
        this.inView = entries.some((e) => e.isIntersecting);
        this.sync();
      },
      { threshold: 0.01 },
    );
    this.observer.observe(canvas);
    document.addEventListener('visibilitychange', this.onVisibility);

    // 第五态守卫：进视口 2s 还没跑过一帧，说明环境有问题，主动降级
    window.setTimeout(() => {
      if (!this.disposed && !this.stepped && this.inView && this.opts.autoLoop !== false) {
        this.opts.onFallback?.('never-stepped');
      }
    }, 2000);
  }

  /**
   * 唯一入口。返回 null 时调用方必须显示海报——
   * 四种降级理由都会先经 onFallback 通知，方便埋点与 e2e 断言。
   */
  static mount(canvas: HTMLCanvasElement, opts: InkSurfaceOptions = {}): InkSurface | null {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) {
      opts.onFallback?.('reduced-motion');
      return null;
    }
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) {
      opts.onFallback?.('save-data');
      return null;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr ?? 1.5);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(rect.width * dpr));
    canvas.height = Math.max(2, Math.round(rect.height * dpr));

    const engine = InkEngine.create(canvas, opts);
    if (!engine) {
      opts.onFallback?.('no-webgl2');
      return null;
    }
    return new InkSurface(canvas, engine, opts);
  }

  get ink(): InkEngine {
    return this.engine;
  }

  /** 有交互就续命；试墨区每次 pointer 事件调一次 */
  poke(): void {
    this.idleSince = 0;
    this.sync();
  }

  private sync(): void {
    if (this.disposed) return;
    if (this.opts.autoLoop === false) return;
    const shouldRun = this.inView && !document.hidden;
    if (shouldRun && !this.raf) {
      this.lastTime = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private readonly tick = (now: number): void => {
    if (this.disposed) return;
    const real = Math.min((now - this.lastTime) / 1000, MAX_DT);
    this.lastTime = now;
    const dt = this.opts.fixedStep ?? real;

    this.elapsed += dt;
    this.idleSince += real;

    this.opts.onFrame?.(this.engine, this.elapsed, dt);
    this.engine.step(dt);
    this.engine.render();
    this.stepped = true;

    const idleLimit = this.opts.mobile ? 12 : 12;
    if (this.idleSince > idleLimit && !this.opts.onFrame) {
      this.raf = 0; // 停转，等 poke() 唤醒
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  /** 供构建期截图：跑到指定模拟时刻后停住 */
  seek(targetSeconds: number, stepSize = 1 / 60): void {
    const steps = Math.max(0, Math.round(targetSeconds / stepSize));
    for (let i = 0; i < steps; i++) {
      this.elapsed += stepSize;
      this.opts.onFrame?.(this.engine, this.elapsed, stepSize);
      this.engine.step(stepSize);
    }
    this.engine.render();
    this.stepped = true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.engine.dispose();
  }
}
