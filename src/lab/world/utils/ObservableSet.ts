// 移植自 folio-2025 sources/Game/utilities/ObservableSet.js（零逻辑改动，加类型）。
// Inputs.filters 用它把「输入上下文」变化同步到 <html> class（CSS 可感知当前模式）。

export type ObservableSetEvent<T> =
  | { type: 'add'; value: T }
  | { type: 'delete'; value: T }
  | { type: 'clear'; previousValues: T[] };

export class ObservableSet<T> extends Set<T> {
  private readonly callback: (event: ObservableSetEvent<T>) => void;

  constructor(callback: (event: ObservableSetEvent<T>) => void, values?: readonly T[]) {
    super(values);
    this.callback = callback;
  }

  override add(value: T): this {
    const existed = this.has(value);
    super.add(value);
    if (!existed) this.callback({ type: 'add', value });
    return this;
  }

  override delete(value: T): boolean {
    const existed = this.has(value);
    const result = super.delete(value);
    if (existed) this.callback({ type: 'delete', value });
    return result;
  }

  override clear(): void {
    const hadItems = this.size > 0;
    const previousValues = [...this];
    super.clear();
    if (hadItems) this.callback({ type: 'clear', previousValues });
  }
}
