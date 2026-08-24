// 移植自 folio-2025 sources/Game/Inputs/Inputs.js（334 行）。
// 动作路由层：物理按键/指针 → 语义动作（forward/boost/respawn…），
// filters（ObservableSet）= 输入上下文闸门——★ 初始 filter 必须 ['intro']
// （Game 启动坑①：防加载期按键漏进不存在的车，source-teardown §4）。
// 砍除（§9.1 第 11 项裁决）：Gamepad / Wheel / InteractiveButtons。
// 改动：去 Game 单例耦合；监听接 AbortSignal；<html> class 同步保留（CSS 感知输入模式）。
import { Events } from '../core/Events';
import { ObservableSet } from '../utils/ObservableSet';
import { Keyboard } from './Keyboard';
import { Pointer } from './Pointer';
import { Nipple } from './Nipple';
import type { Game } from '../core/Game';

export type InputActionValue = number | Record<string, number>;

export interface InputActionDescription {
  name: string;
  /** 允许触发的输入上下文（intro/wandering/racing…）；空数组 = 任何上下文均可 */
  categories: string[];
  /** 物理键：'Keyboard.KeyW' / 'Keyboard.ArrowUp' / 'Pointer.any' */
  keys: string[];
}

export interface InputAction extends InputActionDescription {
  active: boolean;
  value: InputActionValue;
  trigger: 'start' | 'end' | 'change' | null;
  activeKeys: Set<string>;
}

export class Inputs {
  static readonly MODE_MOUSEKEYBOARD = 1;
  static readonly MODE_TOUCH = 2;

  private readonly game: Game;
  readonly events = new Events();
  readonly actions = new Map<string, InputAction>();
  readonly filters: ObservableSet<string>;
  mode: number = Inputs.MODE_MOUSEKEYBOARD;

  keyboard!: Keyboard;
  pointer!: Pointer;
  nipple!: Nipple;

  constructor(
    game: Game,
    actions: InputActionDescription[] = [],
    filters: string[] = [],
    signal: AbortSignal = new AbortController().signal,
  ) {
    this.game = game;

    // filter 变化同步到 <html> class（folio 原样：CSS 可感知当前输入上下文）
    this.filters = new ObservableSet<string>((event) => {
      if (event.type === 'add') {
        document.documentElement.classList.add(`input-filter-${event.value}`);
      } else if (event.type === 'delete') {
        document.documentElement.classList.remove(`input-filter-${event.value}`);
      } else {
        for (const previousValue of event.previousValues)
          document.documentElement.classList.remove(`input-filter-${previousValue}`);
      }
    });

    this.setKeyboard(signal);
    this.setPointer(signal);
    this.setNipple();

    this.addActions(actions);

    for (const filter of filters) this.filters.add(filter);

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      0, // order 0：输入结算永远最先（§12 tick order 全表）
    );

    document.documentElement.classList.add('is-mode-mouse-keyboard');
  }

  private setKeyboard(signal: AbortSignal): void {
    this.keyboard = new Keyboard(signal);

    // 本站 Keyboard 触发参数为 (code, key)，code/key 双注册与 folio 语义一致
    this.keyboard.events.on('down', (code: string, key: string) => {
      this.updateMode(Inputs.MODE_MOUSEKEYBOARD);
      this.start(`Keyboard.${code}`);
      this.start(`Keyboard.${key}`);
    });

    this.keyboard.events.on('up', (code: string, key: string) => {
      this.updateMode(Inputs.MODE_MOUSEKEYBOARD);
      this.end(`Keyboard.${code}`);
      this.end(`Keyboard.${key}`);
    });
  }

  private setPointer(signal: AbortSignal): void {
    this.pointer = new Pointer(this.game.canvasElement, signal);

    this.pointer.events.on('down', () => {
      this.updateMode(
        this.pointer.mode === Pointer.MODE_MOUSE ? Inputs.MODE_MOUSEKEYBOARD : Inputs.MODE_TOUCH,
      );
      this.start('Pointer.any', { x: this.pointer.current.x, y: this.pointer.current.y });
    });

    this.pointer.events.on('up', () => {
      this.updateMode(
        this.pointer.mode === Pointer.MODE_MOUSE ? Inputs.MODE_MOUSEKEYBOARD : Inputs.MODE_TOUCH,
      );
      this.end('Pointer.any', { x: this.pointer.current.x, y: this.pointer.current.y });
    });

    this.pointer.events.on('move', () => {
      this.change('Pointer.any', { x: this.pointer.current.x, y: this.pointer.current.y });
    });
  }

  private setNipple(): void {
    this.nipple = new Nipple(this.game);
    this.addActions([
      { name: 'nipplePointer', categories: ['wandering', 'racing'], keys: ['Pointer.any'] },
    ]);

    this.events.on('nipplePointer', (action: InputAction) => {
      if (this.mode !== Inputs.MODE_TOUCH) return;

      this.nipple.updateFromPointer(this.pointer, action);
    });
  }

  addActions(actions: InputActionDescription[]): void {
    for (const action of actions) {
      const formattedAction: InputAction = {
        ...action,
        active: false,
        value: 0,
        trigger: null,
        activeKeys: new Set(),
      };

      this.actions.set(action.name, formattedAction);
    }
  }

  private checkCategory(action: InputAction): boolean {
    // 无 filter => 全放行
    if (this.filters.size === 0) return true;

    // 动作未声明 category => 不受 filter 约束
    if (action.categories.length === 0) return true;

    for (const category of action.categories) {
      if (this.filters.has(category)) return true;
    }

    return false;
  }

  start(key: string, value: InputActionValue = 1, isToggle = true): void {
    const filteredActions = [...this.actions.values()].filter(
      (action) => action.keys.indexOf(key) !== -1,
    );

    for (const action of filteredActions) {
      if (this.checkCategory(action)) {
        action.value = value;
        action.activeKeys.add(key);
        action.trigger = 'start';

        if (isToggle) {
          // 可开可关的动作 => 只在状态翻转时发事件
          if (!action.active) {
            action.active = true;

            this.events.trigger('actionStart', [action]);
            this.events.trigger(action.name, [action]);
          }
        } else {
          // 一次性动作（无 end）=> 每次 start 都发
          this.events.trigger('actionStart', [action]);
          this.events.trigger(action.name, [action]);
        }
      }
    }
  }

  end(key: string, value: InputActionValue = 0): void {
    const filteredActions = [...this.actions.values()].filter(
      (action) => action.keys.indexOf(key) !== -1,
    );

    for (const action of filteredActions) {
      if (action.active) {
        action.activeKeys.delete(key);

        if (action.activeKeys.size === 0) {
          action.active = false;
          action.value = value;
          action.trigger = 'end';

          this.events.trigger('actionEnd', [action]);
          this.events.trigger(action.name, [action]);
        }
      }
    }
  }

  change(key: string, value: InputActionValue = 1): void {
    const filteredActions = [...this.actions.values()].filter(
      (action) => action.keys.indexOf(key) !== -1,
    );

    for (const action of filteredActions) {
      if (this.checkCategory(action)) {
        // 值比较：number 直接比，object 逐属性比
        let hasChanged = false;

        if (typeof value === 'number') {
          if (action.value !== value) hasChanged = true;
        } else {
          const previous = action.value;
          for (const propertyKey of Object.keys(value)) {
            if (
              typeof previous !== 'object' ||
              previous[propertyKey] !== value[propertyKey]
            )
              hasChanged = true;
          }
        }

        if (hasChanged) {
          action.value = value;
          action.trigger = 'change';

          this.events.trigger('actionChange', [action]);
          this.events.trigger(action.name, [action]);
        }
      }
    }
  }

  private updateMode(mode: number): void {
    if (mode === this.mode) return;

    const modeClasses: Record<number, string> = {
      [Inputs.MODE_MOUSEKEYBOARD]: 'mouse-keyboard',
      [Inputs.MODE_TOUCH]: 'touch',
    };

    document.documentElement.classList.remove(`is-mode-${modeClasses[this.mode]}`);
    this.mode = mode;
    document.documentElement.classList.add(`is-mode-${modeClasses[this.mode]}`);

    this.events.trigger('modeChange', [this.mode]);
  }

  private update(): void {
    this.pointer.update();
    this.nipple.update();
  }

  /** dispose：清 <html> class（AbortSignal 只解绑监听，class 需手动还原） */
  dispose(): void {
    this.filters.clear();
    document.documentElement.classList.remove(
      'is-mode-mouse-keyboard',
      'is-mode-touch',
    );
  }
}
