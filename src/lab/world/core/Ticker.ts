// 移植自 folio-2025 sources/Game/Ticker.js（71 行）。
// ★★ scale = 2 必须保留：folio 全部手感参数（引擎力/悬挂/刹车/相机）都按 2 倍速标定
//    （source-teardown §5.4 隐藏参数）——改成 1 会让所有抄来的参数「不对劲」。
// 改动：去 Game 单例耦合；gsap.delayedCall 以 delay() 替代（依赖红线 G5：不引入 gsap）；
//       folio 的 4 个 TSL 时间 uniform（elapsed/delta 及 scaled 变体）已裁——全仓零消费方，
//       shader 动画统一走 TSL `time` 节点（rendering-gaps-consult §1.3）。未来若有材质
//       必须与 scale/暂停严格同步，按「先有消费方，再建单一显式 uniform」回补。
import { Events } from './Events';

interface DelayHandle {
  kill(): void;
}

interface DelayItem {
  remaining: number;
  callback: () => void;
  killed: boolean;
}

export class Ticker {
  elapsed = 0;
  delta = 1 / 60;
  maxDelta = 1 / 30;
  /** ★ 全局倍速（folio 隐藏参数，全部物理/手感参数按此标定） */
  scale = 2;
  deltaScaled = this.delta * this.scale;
  elapsedScaled = 0;
  /** 30 帧滑动平均（车辆控制器专用 dt，防帧尖峰打乱悬挂积分，§5.3） */
  deltaAverage = this.delta;

  readonly events = new Events();

  private waits: Array<[number, () => void]> = [];
  private delays: DelayItem[] = [];
  private lastDeltas: number[] = [];

  /** 由 Rendering.setAnimationLoop 驱动（elapsed 单位 ms，同 rAF 时间戳） */
  update(elapsed: number): void {
    const elapsedSeconds = elapsed / 1000;
    this.delta = Math.min(elapsedSeconds - this.elapsed, this.maxDelta);
    this.elapsed = elapsedSeconds;
    this.deltaScaled = this.delta * this.scale;
    this.elapsedScaled += this.deltaScaled;

    this.lastDeltas.unshift(this.delta);
    const arrayLength = this.lastDeltas.length;
    const count = 30;
    if (arrayLength > count) this.lastDeltas.splice(count, arrayLength - count);
    this.deltaAverage =
      this.lastDeltas.reduce((total, value) => total + value) / this.lastDeltas.length;

    for (let i = 0; i < this.waits.length; i++) {
      const wait = this.waits[i];
      wait[0]--;

      if (wait[0] === 0) {
        wait[1]();
        this.waits.splice(i, 1);
        i--;
      }
    }

    for (let i = 0; i < this.delays.length; i++) {
      const item = this.delays[i];
      if (!item.killed) item.remaining -= this.delta;

      if (item.killed || item.remaining <= 0) {
        this.delays.splice(i, 1);
        i--;
        if (!item.killed) item.callback();
      }
    }

    this.events.trigger('tick');
  }

  /** 等 N 帧后回调（Game 启动坑④：等 shader 编译再 reveal 全靠它） */
  wait(frames: number, callback: () => void): void {
    this.waits.push([frames, callback]);
  }

  /** 等真实秒数后回调（替代 folio 的 gsap.delayedCall；随 tick 走，暂停即冻结） */
  delay(seconds: number, callback: () => void): DelayHandle {
    const item: DelayItem = { remaining: seconds, callback, killed: false };
    this.delays.push(item);
    return {
      kill: () => {
        item.killed = true;
      },
    };
  }
}
