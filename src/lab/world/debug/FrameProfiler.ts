// [CC-PERF-C2-B0] O10 分段帧时剖析（#debug 门控层）——性能脑暴
// docs/research/cyber-city-perf-optimization-features.md O10 方案①的实现正本。
// 定位：卡顿归因工具。FpsMeter 只有全帧 avg/1% low，长帧无法归因到 physics
// （order 3）/render（998，含 Q0 reflector 镜像与 bloom 同帧成本）/POI 检测
// （8–10）各段——本件按 Ticker tick 总线 order 段打 performance.mark/measure
// （DevTools Performance 面板 User Timing 可视），并聚合 avg/max 供 DebugPanel
// 分段耗时行消费。
//
// 纪律（O10 风险行）：mark 不得泄进无 #debug 的生产热路径——本件只被 DebugPanel
// 静态 import（同一 debug 动态分包），构造期一次判定 = index.ts 既有 #debug 分支；
// 生产路径零字节零成本。每帧发完 measure 即 clearMarks/clearMeasures，User Timing
// 缓冲不增长（DevTools 录制的 trace 事件不受 clear 影响）。
//
// 检查点机制：Events order = 稀疏数组下标、同 order 后注册者后执行——本件在系统
// 全部就位后（#debug 分支殿后）向既有 order 追加检查点 handler，恒落在该 order
// 段尾；帧基准 = order 0 检查点（Inputs 结算后，rAF 派发队列延迟不入段读数）。
// 段表（source-teardown §12 tick order 全表的剖析投影）：
//   anim    c0→c2   玩家意图(1) + 机器人动画(1) + 车辆 pre(2)
//   physics c2→c3   Rapier world.step(3)
//   sync    c3→c6   物理→视觉同步(4) + 变形(4) + 车辆 post(5) + 玩家回读/进站前奏(6)
//   camera  c6→c7   View 相机(7)
//   areas   c7→c10  Zones(8) + 标点动画(9) + 区域/POI 检测(10)
//   render  c10→c998 RenderPipeline/bloom（Q0 含 reflector 镜像）(998)
//   hud     c998→c999 HUD 节拍 + 长帧计数 + DebugPanel 刷新(999)
// order 0 的 Inputs.update 本体（微量）落在帧基准之前，不计入任何段（显式取舍）。
import type { Game } from '../core/Game';

/** 检查点 order（升序；c0 = 帧基准，c999 = 帧终点/结算帧） */
const CHECKPOINT_ORDERS = [0, 2, 3, 6, 7, 10, 998, 999] as const;

/** 段定义：[名, 起点检查点下标, 终点检查点下标]（下标对 CHECKPOINT_ORDERS） */
const SEGMENTS: ReadonlyArray<readonly [name: string, from: number, to: number]> = [
  ['anim', 0, 1],
  ['physics', 1, 2],
  ['sync', 2, 3],
  ['camera', 3, 4],
  ['areas', 4, 5],
  ['render', 5, 6],
  ['hud', 6, 7],
];

const MARK_PREFIX = 'world:c';
const MEASURE_PREFIX = 'world:';

export interface SegmentReading {
  name: string;
  avgMs: number;
  maxMs: number;
}

export interface ProfilerReading {
  /** 窗口内结算帧数（0 = 暂停/无帧，面板显示 —） */
  frames: number;
  /** 全帧（c0→c999）avg/max */
  total: SegmentReading;
  segments: SegmentReading[];
}

export class FrameProfiler {
  private readonly game: Game;
  /** 本帧各检查点墙钟 ms（下标对 CHECKPOINT_ORDERS） */
  private readonly stamps = new Float64Array(CHECKPOINT_ORDERS.length);
  /** 段累加器（+1 槽位存全帧 total）：[sum, max] × (段数+1)，take() 清零 */
  private readonly sums = new Float64Array(SEGMENTS.length + 1);
  private readonly maxes = new Float64Array(SEGMENTS.length + 1);
  private frames = 0;
  private readonly handlers: Array<readonly [order: number, handler: () => void]> = [];
  private disposed = false;

  constructor(game: Game) {
    this.game = game;
    for (let i = 0; i < CHECKPOINT_ORDERS.length; i++) {
      const isLast = i === CHECKPOINT_ORDERS.length - 1;
      const handler = isLast
        ? (): void => {
            this.stamps[CHECKPOINT_ORDERS.length - 1] = performance.now();
            performance.mark(MARK_PREFIX + CHECKPOINT_ORDERS[CHECKPOINT_ORDERS.length - 1]);
            this.settleFrame();
          }
        : (): void => {
            this.stamps[i] = performance.now();
            performance.mark(MARK_PREFIX + CHECKPOINT_ORDERS[i]);
          };
      game.ticker.events.on('tick', handler, CHECKPOINT_ORDERS[i]);
      this.handlers.push([CHECKPOINT_ORDERS[i], handler]);
    }
  }

  /**
   * 取一窗读数并清零累加器（DebugPanel 0.25s 刷新拍调用）：
   * 返回窗口内各段 avg/max ms + 全帧 total。
   */
  take(): ProfilerReading {
    const n = this.frames;
    const read = (slot: number, name: string): SegmentReading => ({
      name,
      avgMs: n > 0 ? this.sums[slot] / n : 0,
      maxMs: this.maxes[slot],
    });
    const reading: ProfilerReading = {
      frames: n,
      total: read(SEGMENTS.length, 'frame'),
      segments: SEGMENTS.map((seg, i) => read(i, seg[0])),
    };
    this.sums.fill(0);
    this.maxes.fill(0);
    this.frames = 0;
    return reading;
  }

  /** DebugPanel.dispose() 调用：摘除全部检查点 + 清 User Timing 残留（幂等） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const [, handler] of this.handlers) this.game.ticker.events.off('tick', handler);
    this.handlers.length = 0;
    this.clearTimings();
  }

  /* ———————————————————— 内部 ———————————————————— */

  /** 帧终点结算（c999 检查点内）：段时长累加 + measure 发射 + 缓冲清理 */
  private settleFrame(): void {
    for (let i = 0; i < SEGMENTS.length; i++) {
      const [, from, to] = SEGMENTS[i];
      const duration = Math.max(this.stamps[to] - this.stamps[from], 0);
      this.sums[i] += duration;
      if (duration > this.maxes[i]) this.maxes[i] = duration;
    }
    const total = Math.max(this.stamps[CHECKPOINT_ORDERS.length - 1] - this.stamps[0], 0);
    this.sums[SEGMENTS.length] += total;
    if (total > this.maxes[SEGMENTS.length]) this.maxes[SEGMENTS.length] = total;
    this.frames += 1;

    // DevTools User Timing 段条（mark 对已在各检查点打好）；发完即清缓冲——
    // Performance 录制的 trace 不受 clear 影响，缓冲零增长
    try {
      for (const [name, from, to] of SEGMENTS) {
        performance.measure(
          MEASURE_PREFIX + name,
          MARK_PREFIX + CHECKPOINT_ORDERS[from],
          MARK_PREFIX + CHECKPOINT_ORDERS[to],
        );
      }
    } catch {
      /* mark 缺席（异常帧）跳过本帧 measure，聚合读数不受影响 */
    }
    this.clearTimings();
  }

  private clearTimings(): void {
    for (const order of CHECKPOINT_ORDERS) performance.clearMarks(MARK_PREFIX + order);
    for (const [name] of SEGMENTS) performance.clearMeasures(MEASURE_PREFIX + name);
  }
}
