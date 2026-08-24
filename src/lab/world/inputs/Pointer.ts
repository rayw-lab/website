// 移植自 folio-2025 sources/Game/Inputs/Pointer.js（196 行）。
// 保留：upcoming/current 双缓冲（事件不直接改状态，tick 时统一结算——
// 与固定时序的引擎循环解耦）、多指平均坐标、pinch 比例、down/up/move 事件。
// 改动：监听接 AbortSignal（dispose 解绑）。
import { Events } from '../core/Events';

export class Pointer {
  static readonly MODE_MOUSE = 1;
  static readonly MODE_TOUCH = 2;

  readonly events = new Events();
  readonly current = { x: 0, y: 0 };
  readonly delta = { x: 0, y: 0 };
  private readonly upcoming = { x: 0, y: 0 };
  isDown = false;
  mode: number = Pointer.MODE_MOUSE;
  private upcomingDown = false;
  hasMoved = false;
  private upcomingTouches: Touch[] = [];
  touches: Touch[] = [];
  readonly pinch = {
    ratio: 1,
    ratioDelta: 0,
    baseDistance: 0,
    distance: 0,
    distanceDelta: 0,
  };

  constructor(element: HTMLElement, signal: AbortSignal) {
    element.addEventListener(
      'mousemove',
      (event) => {
        event.preventDefault();

        this.mode = Pointer.MODE_MOUSE;

        this.upcoming.x = event.clientX;
        this.upcoming.y = event.clientY;
      },
      { signal },
    );

    element.addEventListener(
      'mousedown',
      (event) => {
        event.preventDefault();

        this.mode = Pointer.MODE_MOUSE;
        this.upcomingDown = true;

        this.current.x = event.clientX;
        this.current.y = event.clientY;
        this.upcoming.x = event.clientX;
        this.upcoming.y = event.clientY;
      },
      { signal },
    );

    addEventListener(
      'mouseup',
      (event) => {
        event.preventDefault();
        this.upcomingDown = false;
      },
      { signal },
    );

    element.addEventListener(
      'touchmove',
      (event) => {
        this.mode = Pointer.MODE_TOUCH;
        this.upcomingTouches = [...event.touches];

        let x = 0;
        let y = 0;
        for (const touch of this.upcomingTouches) {
          x += touch.clientX;
          y += touch.clientY;
        }
        x /= this.upcomingTouches.length;
        y /= this.upcomingTouches.length;

        this.upcoming.x = x;
        this.upcoming.y = y;
      },
      { passive: true, signal },
    );

    element.addEventListener(
      'touchstart',
      (event) => {
        this.mode = Pointer.MODE_TOUCH;
        this.upcomingDown = true;
        this.upcomingTouches = [...event.touches];

        let x = 0;
        let y = 0;
        for (const touch of this.upcomingTouches) {
          x += touch.clientX;
          y += touch.clientY;
        }
        x /= this.upcomingTouches.length;
        y /= this.upcomingTouches.length;

        this.current.x = x;
        this.current.y = y;
        this.upcoming.x = x;
        this.upcoming.y = y;
      },
      { passive: true, signal },
    );

    element.addEventListener(
      'touchend',
      (event) => {
        event.preventDefault();

        this.upcomingTouches = [...event.touches];

        if (this.upcomingTouches.length === 0 || this.upcomingTouches.length === 1)
          this.upcomingDown = false;
      },
      { signal },
    );

    element.addEventListener(
      'contextmenu',
      (event) => {
        event.preventDefault();
      },
      { signal },
    );
  }

  /** 由 Inputs 在 tick order 0 统一结算 */
  update(): void {
    this.delta.x = this.upcoming.x - this.current.x;
    this.delta.y = this.upcoming.y - this.current.y;

    this.current.x = this.upcoming.x;
    this.current.y = this.upcoming.y;

    // Pinch（多指最大间距）
    if (this.upcomingTouches.length >= 2) {
      let maxDistance = 0;
      for (let i = 0; i < this.upcomingTouches.length; i++) {
        for (let j = i + 1; j < this.upcomingTouches.length; j++) {
          const dX = this.upcomingTouches[i].clientX - this.upcomingTouches[j].clientX;
          const dY = this.upcomingTouches[i].clientY - this.upcomingTouches[j].clientY;
          const distance = Math.hypot(dX, dY);

          if (distance > maxDistance) maxDistance = distance;
        }
      }

      this.pinch.distanceDelta = maxDistance - this.pinch.distance;
      this.pinch.distance = maxDistance;

      if (this.upcomingTouches.length > this.touches.length) {
        this.pinch.distanceDelta = 0;
        this.pinch.baseDistance = this.pinch.distance;
      }

      const pinchRatio = this.pinch.distance / this.pinch.baseDistance;

      if (pinchRatio !== this.pinch.ratio) {
        this.pinch.ratioDelta = pinchRatio - this.pinch.ratio;
        this.pinch.ratio = pinchRatio;
        this.events.trigger('pinch');
      }
    } else {
      this.pinch.baseDistance = 0;
      this.pinch.distance = 0;
      this.pinch.distanceDelta = 0;
    }

    this.touches = [...this.upcomingTouches];

    this.hasMoved = this.delta.x !== 0 || this.delta.y !== 0;

    if (this.upcomingDown !== this.isDown) {
      this.isDown = this.upcomingDown;

      if (this.isDown) this.events.trigger('down');
      else this.events.trigger('up');
    }

    if (this.hasMoved) this.events.trigger('move');
  }
}
