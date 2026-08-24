// 移植自 folio-2025 sources/Game/Quality.js（48 行）。
// level 0 = 桌面最高画质；level 1 = 移动端降档（folio 语义原样保留：
// 车辆控制器 dt、相机 phi、bloom mips 等全部读它）。改动：去 Game 单例/Debug 面板。
import { Events } from './Events';

export class Quality {
  readonly events = new Events();
  /** 0 = 最高画质（桌面）；1 = 降档（移动端） */
  level: 0 | 1;

  constructor() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.level = isMobile ? 1 : 0;
  }

  changeLevel(level: 0 | 1 = 0): void {
    if (level === this.level) return;

    this.level = level;
    this.events.trigger('change', [this.level]);
  }
}
