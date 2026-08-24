// 移植自 folio-2025 sources/Game/Inputs/Keyboard.js（49 行）。
// 保留：code 与 key 双注册（动作表可写 Keyboard.KeyW 或 Keyboard.w）、
// blur 时全键抬起（防切窗后按键卡死）、输入框聚焦时吞键（Escape 除外）。
// 改动：监听接 AbortSignal（dispose 解绑，SRD §9.2）。
import { Events } from '../core/Events';

export class Keyboard {
  readonly events = new Events();
  private pressed: string[] = [];

  constructor(signal: AbortSignal) {
    // 失焦 → 全部按下的键触发 up（folio：防加载切窗后车辆自己跑）
    window.addEventListener(
      'blur',
      () => {
        for (const key of this.pressed) this.events.trigger('up', [key]);
        this.pressed = [];
      },
      { signal },
    );

    addEventListener(
      'keydown',
      (event) => {
        // 输入框内不吞键（Escape 除外）
        if (
          document.activeElement?.matches('input, textarea, [contenteditable]') &&
          event.code !== 'Escape'
        )
          return;

        this.pressed.push(event.code, event.key);
        this.events.trigger('down', [event.code, event.key]);
      },
      { signal },
    );

    addEventListener(
      'keyup',
      (event) => {
        const indexCode = this.pressed.indexOf(event.code);
        if (indexCode !== -1) this.pressed.splice(indexCode, 1);

        const indexKey = this.pressed.indexOf(event.key);
        if (indexKey !== -1) this.pressed.splice(indexKey, 1);

        this.events.trigger('up', [event.code, event.key]);
      },
      { signal },
    );
  }
}
