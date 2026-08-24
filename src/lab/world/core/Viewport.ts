// 移植自 folio-2025 sources/Game/Viewport.js（48 行）。
// 改动：去 Game 单例耦合；resize 监听接 AbortSignal（mount 契约要求 dispose 必须解绑，SRD §9.2）；
// pixelRatioMax 可配置（移动端 DPR 封顶 1.5，SRD §12.4 配套纪律——folio 固定 2）。
import { Events } from './Events';

export class Viewport {
  readonly domElement: HTMLElement;
  readonly events = new Events();

  width = 1;
  height = 1;
  ratio = 1;
  pixelRatioPure = 1;
  pixelRatioMax: number;
  pixelRatio = 1;

  constructor(domElement: HTMLElement, options: { pixelRatioMax?: number; signal: AbortSignal }) {
    this.domElement = domElement;
    this.pixelRatioMax = options.pixelRatioMax ?? 2;

    this.measure();
    this.setResize(options.signal);
  }

  measure(): void {
    const bounding = this.domElement.getBoundingClientRect();

    this.width = bounding.width;
    this.height = bounding.height;
    this.ratio = this.width / this.height;

    this.pixelRatioPure = window.devicePixelRatio;
    this.pixelRatio = Math.min(this.pixelRatioPure, this.pixelRatioMax);
  }

  private setResize(signal: AbortSignal): void {
    const throttleDuration = 400;
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

    addEventListener(
      'resize',
      () => {
        this.measure();
        this.events.trigger('change');

        if (throttleTimeout) clearTimeout(throttleTimeout);

        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          // throttleChange 供重计算型消费者（View.optimalArea）使用
          this.events.trigger('throttleChange');
        }, throttleDuration);
      },
      { signal },
    );
  }
}
