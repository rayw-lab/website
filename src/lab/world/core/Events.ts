// 移植自 folio-2025 sources/Game/Events.js（64 行，零逻辑改动，加类型）。
// order 参数 = 稀疏数组下标：trigger 时按 order 升序依次执行——
// 这是全引擎 tick 时序（source-teardown §12 order 全表）的底层机制，不可替换为普通 EventTarget。

type EventCallback = (...args: never[]) => void;

export class Events {
  private callbacks: Record<string, Array<EventCallback[] | undefined>> = {};

  on(name: string, callback: EventCallback, order = 1): this {
    if (!(this.callbacks[name] instanceof Array)) this.callbacks[name] = [];

    const orders = this.callbacks[name];
    if (!(orders[order] instanceof Array)) orders[order] = [];

    orders[order].push(callback);

    return this;
  }

  off(name: string, callback: EventCallback | null = null): this {
    if (typeof callback === 'function') {
      const orders = this.callbacks[name] ?? [];
      for (const order in orders) {
        const callbacks = orders[order];
        if (!callbacks) continue;
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      }
    } else if (this.callbacks[name] instanceof Array) {
      delete this.callbacks[name];
    }

    return this;
  }

  trigger(name: string, args: unknown[] = []): this {
    if (this.callbacks[name] instanceof Array) {
      // for...in 对整数键按升序遍历 = order 时序保证（与 folio 原版一致）
      for (const order in this.callbacks[name]) {
        const callbacks = this.callbacks[name][order];
        if (!callbacks) continue;
        for (const callbackFunction of callbacks) {
          (callbackFunction as (...a: unknown[]) => void)(...args);
        }
      }
    }

    return this;
  }
}
