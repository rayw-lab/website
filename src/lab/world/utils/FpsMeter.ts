// 帧率仪表（CC-E2：spike engine.ts 的 FpsMeter 摘出为引擎共享工具）：
// 滑动窗口平均 + 1% low（roadmap §7.3 Step 9 门禁读数；HUD 与 __worldSpike.fps() 消费）。
// 自计时口径：喂墙钟时间戳（performance.now），不能用 Ticker.delta——
// 它被 maxDelta=1/30 钳制且随暂停冻结，读不出真实帧间隔（帧率仪表必须读真值，
// spike 的 wallDt / rawDt 双轨纪律）。
export class FpsMeter {
  private samples: number[] = [];
  private last: number | null = null;

  /**
   * 每帧喂墙钟时间戳 ms（tick 回调里传 performance.now()），内部自算帧间隔。
   * [CC-PERF-C2-B0] 返回本帧墙钟间隔秒（首帧/reset 后无间隔 = 0）：长帧计数
   * （counters.longFrames）在装配段复用本读数做一次比较，不另建计时簿记；
   * 跨暂停超长间隔经 reset() 清 last，天然不外泄。
   */
  tick(nowMs: number): number {
    const dt = this.last !== null ? (nowMs - this.last) / 1000 : 0;
    if (this.last !== null) this.push(dt);
    this.last = nowMs;
    return dt;
  }

  /** 直接喂帧间隔秒（外部已有 dt 时用；spike 原接口） */
  push(dt: number): void {
    if (dt <= 0) return;
    this.samples.push(dt);
    if (this.samples.length > 360) this.samples.shift(); // ~6s @60fps
  }

  /** 暂停/恢复边界调用：跨暂停的超长间隔不得计入样本（会假性拉爆 1% low） */
  reset(): void {
    this.last = null;
  }

  read(): { avg: number; low1: number } {
    if (this.samples.length < 10) return { avg: 0, low1: 0 };
    const sum = this.samples.reduce((a, b) => a + b, 0);
    const sorted = [...this.samples].sort((a, b) => b - a);
    const worstN = Math.max(1, Math.floor(sorted.length * 0.01));
    const worst = sorted.slice(0, worstN).reduce((a, b) => a + b, 0) / worstN;
    return { avg: this.samples.length / sum, low1: 1 / worst };
  }
}
