// CC-OBS-C1：SessionTimeline —— 会话事件时间线（可观测规格
// docs/spec/cyber-city-observability.md §3 冻结契约的实现正本）。
// 定位：world 分包内零依赖小件（≤2KB gzip 预算；不 import three/系统模块，
// Events 仅 type-only）——回答「用户卡在哪」：ring buffer 500 条机读事件序 +
// 漏斗七步首达壁钟毫秒 + 交互计数聚合，经 window.__worldSession.dump()（index.ts
// 装配段挂载）/ dispose console 摘要 / #debug 面板（OBS-C2）三通道导出。
//
// 运行语义（§3.3，实现必须逐条对齐）：
//   1. ring 溢出丢最旧、dropped 递增、seq 不回收（events[0].seq > 1 即发生过丢弃）；
//   2. funnel/counters 在 log() 入口更新，独立于 ring——溢出后聚合依旧精确；
//   3. funnel 只记首达；carReady 只认 world-transform 且 data.to === 'car'；
//   4. dump() 纯快照（全新 JSON-safe 平面对象，任意时刻可反复调）；
//   5. 公开 API 最小面：log / attach / dump / dispose（tail 仅 world 分包内
//      #debug 面板消费，不上 window；[CC-PERF-C2-B0] 随行加法 countLongFrame——
//      counters.longFrames 专用递增口，非事件不入 ring）；
//   6. log() 永不抛错——白名单外丢弃 + console.warn 一次/type，data 非法值剔除，
//      埋点故障不得影响游戏路径。
// 时基：t = Math.round(performance.now() − t0) 壁钟（§3.1）——game.pause() 不冻结，
// 与 Ticker 游戏时间显式区分。
import type { Events } from './Events';

/** ring buffer 上限（§3.2 冻结：超限丢最旧、dropped 递增） */
const RING_LIMIT = 500;
/** pageerror message 截断长度（§3.4 error 族行） */
const ERROR_MESSAGE_LIMIT = 200;

type EventFamily =
  | 'lifecycle'
  | 'ritual'
  | 'drive'
  | 'poi'
  | 'camera'
  | 'goal'
  | 'challenge'
  | 'perf'
  | 'ux'
  | 'error';

/**
 * 事件白名单 v1（§3.4 冻结，37 type / 10 族；空格分隔紧凑编码控体积。
 * [CC-FXN-C1] ux 族随行加法：hint-recall {via: 'key' | 'button'}——键位卡再唤出。
 * [CC-FXN-C4] goal 族随行加法（F6 探索计数 n/12）：explore-restore {n, total}
 * （localStorage 跨会话进度还原）· explore-progress {id, n, total}（首次发现某
 * POI 触发圈）· explore-complete {total}（全部探索点集齐）。
 * [CC-PERF-C2-B1] perf 族随行加法（PERF-BR O1 自动降档取证）：quality-auto-drop
 * {from, to, avg, low1}——装配段滞回窗触发点显式 log（仅 driving 态评估、
 * 只降不升；`?quality=` 显式深链禁用自动档，事件不可能出现）。
 * [CC-FXN-C5] 随行加法（G4 目标线 v0 + idle-30s 消费，34 type / 9 族）：goal 族
 * world-quest {action: 'shown'|'reached'|'chain-complete'|'collapsed'|'expanded',
 * step, targetId, elapsedMs}（主链首两分钟流失点漏斗）· ux 族 idle-nudge
 * {targetId}（idle-30s 消费——空闲主动引导的可观测面，QuestLine.idleNudge()）。
 * [CC-FXN-C6] 随行加法（loop8-fxn-audit §6-4 F2 确认层 + G9 测速牌，37 type / 10 族）：
 * drive 族 brake-first（首次 braking===1，boost-first 同构一次性）· suspension-jump
 * （F/摇杆点按激活沿，装配段节流 ≥1 设计秒）；新增 challenge 族 world-speedtrap
 * {kmh, isRecord}（测速区驶离沿，每次通过至多 1 条 + 5 设计秒冷却）。
 * [CC-NAV-C1] ux 族随行加法（M 键小地图/GAP-12，40 type / 10 族）：minimap-open
 * {via: 'key'|'button'} · minimap-close {via: 'key'|'esc'|'button'|'teleport'} ·
 * minimap-teleport {id, distanceM}——两段式第一段（pin 点击传送 parkingBay），
 * 第二段 E 确认走既有 world-poi、漏斗零旁路（ui/Minimap.ts 接线）。
 * 改动纪律（§3.6）：加法（新增 type / data 字段）同 PR 修订规格表、
 * schemaVersion 不动；破坏性（改名/删除/改语义）schemaVersion +1 且消费方同 PR 适配。
 */
const WHITELIST: Readonly<Record<EventFamily, string>> = {
  lifecycle: 'mount ready world-reveal robot-idle dispose',
  ritual: 'transform-start transform-hold world-transform',
  drive: 'world-drive-start respawn cone-hit boost-first brake-first suspension-jump upside-down flip-jump',
  poi: 'poi-bounding-in poi-bounding-out world-poi deep-link',
  camera: 'world-drive-view shot-apply shot-interrupt',
  goal: 'explore-restore explore-progress explore-complete world-quest',
  challenge: 'world-speedtrap',
  perf: 'quality-auto-drop',
  ux: 'hint-shown hint-dismissed hint-recall esc-menu-open idle-30s idle-nudge minimap-close minimap-open minimap-teleport',
  error: 'pageerror context-lost',
};

/** type → 族反查表（log 白名单判定 + 壳桥族过滤共用） */
const FAMILY: Record<string, EventFamily> = {};
for (const family of Object.keys(WHITELIST) as EventFamily[])
  for (const type of WHITELIST[family].split(' ')) FAMILY[type] = family;

/**
 * game.events 总线镜像订阅表（§3.4「镜像」行冻结）：[总线事件, timeline type, data 键?]，
 * args 首位 → data 单键映射。world-drive-view 为预留行：本表即登记，VEH-VIEW
 * （toggleDriveView/KeyV）合流后事件自然入流、零补丁。
 */
const MIRRORS: ReadonlyArray<readonly [event: string, type: string, dataKey?: string]> = [
  ['revealed', 'ready'],
  ['world-reveal', 'world-reveal'],
  ['world-transform', 'world-transform', 'to'],
  ['world-drive-start', 'world-drive-start'],
  ['world-poi', 'world-poi', 'id'],
  ['world-drive-view', 'world-drive-view', 'mode'],
];

/** funnel 首达键映射（§3.2；carReady 需 data.to='car' 特判，单列在 aggregate 内） */
const FUNNEL_KEY: Readonly<Record<string, keyof SessionFunnel>> = {
  'world-reveal': 'reveal',
  'robot-idle': 'robotIdle',
  'transform-start': 'transformStart',
  'world-drive-start': 'driveStart',
  'poi-bounding-in': 'firstPoiIn',
  'world-poi': 'firstPoiInteract',
};

/** counters 递增键映射（coneHits 是「最新 total」语义，单列在 aggregate 内） */
const COUNTER_KEY: Readonly<Record<string, keyof SessionCounters>> = {
  respawn: 'respawns',
  'poi-bounding-in': 'poiEnters',
  'world-poi': 'poiInteracts',
  'world-transform': 'transforms',
  'world-drive-view': 'driveViewToggles',
};

export interface SessionEventEntry {
  /** 1 起全局单调递增；ring 溢出丢弃不回收（events[0].seq > 1 = 发生过丢弃） */
  seq: number;
  /** 整数 ms，performance.now() − t0（壁钟） */
  t: number;
  type: string;
  data?: Record<string, string | number | boolean>;
}

export interface SessionFunnel {
  reveal: number | null;
  robotIdle: number | null;
  transformStart: number | null;
  carReady: number | null;
  driveStart: number | null;
  firstPoiIn: number | null;
  firstPoiInteract: number | null;
}

export interface SessionCounters {
  respawns: number;
  /** 最新 cone-hit.total（与 HUD [data-ws-cones] 同源，非事件条数） */
  coneHits: number;
  poiEnters: number;
  poiInteracts: number;
  transforms: number;
  /** world-drive-view 次数（VEH-VIEW 合流前恒 0） */
  driveViewToggles: number;
  /**
   * [CC-PERF-C2-B0] O10 常驻长帧计数：墙钟帧间隔 >50ms 的帧数（阈值与
   * WS-PERF-01/CITY-PERF-01 采样 STALL_MS 同源）。非事件——不占白名单 type、
   * 不入 ring，由装配段 tick 经 countLongFrame() 直接递增（一次比较零分配）；
   * 判定与阈值在计数点（index.ts LONG_FRAME_S），跨暂停间隔经 FpsMeter.reset()
   * 天然不计。schemaVersion 不动（§3.6 加法纪律）。
   */
  longFrames: number;
}

/** dump schema v1（§3.2 冻结；破坏性变更 schemaVersion +1，加法不升版） */
export interface SessionDump {
  schemaVersion: 1;
  sessionId: string;
  startedAt: string;
  env: {
    /** 活值：Game.init 落定前 = 'pending' */
    backend: 'webgpu' | 'webgl2' | 'pending';
    vehicle: 'physics' | 'kinematic' | 'pending';
    quality: 0 | 1 | 2;
    reducedMotion: boolean;
    dpr: number;
    viewport: { w: number; h: number };
    touch: boolean;
  };
  events: SessionEventEntry[];
  /** 溢出丢弃条数（0 = 未溢出） */
  dropped: number;
  counters: SessionCounters;
  funnel: SessionFunnel;
}

/** env 活值回读闭包（Game 构造器注入；SessionTimeline 零 import 系统模块的接缝） */
export type SessionEnvSource = () => {
  backend: 'webgpu' | 'webgl2' | 'pending';
  vehicle: 'physics' | 'kinematic' | 'pending';
  quality: 0 | 1 | 2;
};

const makeSessionId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    // 不可用（非安全上下文等）回退（§3.1 冻结格式）
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
};

export class SessionTimeline {
  readonly sessionId = makeSessionId();
  readonly startedAt = new Date().toISOString();

  private readonly t0 = performance.now();
  private readonly envSource: SessionEnvSource;
  /** 构造时快照（§3.2 env 注释：dpr/viewport/touch/reducedMotion 不追更新） */
  private readonly envSnap = {
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    dpr: devicePixelRatio,
    touch: matchMedia('(pointer: coarse)').matches,
  };
  private readonly viewport = { w: innerWidth, h: innerHeight };

  private readonly ring: SessionEventEntry[] = [];
  private seq = 0;
  private dropped = 0;
  private readonly counters: SessionCounters = {
    respawns: 0,
    coneHits: 0,
    poiEnters: 0,
    poiInteracts: 0,
    transforms: 0,
    driveViewToggles: 0,
    longFrames: 0,
  };
  private readonly funnel: SessionFunnel = {
    reveal: null,
    robotIdle: null,
    transformStart: null,
    carReady: null,
    driveStart: null,
    firstPoiIn: null,
    firstPoiInteract: null,
  };

  private readonly warned = new Set<string>();
  private busEvents: Events | null = null;
  private readonly mirrorSubs: Array<readonly [name: string, handler: () => void]> = [];
  private canvas: HTMLCanvasElement | null = null;
  private disposed = false;

  /** window error → pageerror（message 截 200 字符；dispose 摘除） */
  private readonly errorHandler = (event: ErrorEvent): void => {
    this.logError(event.message || event.error);
  };

  private readonly rejectionHandler = (event: PromiseRejectionEvent): void => {
    const reason = event.reason as { message?: unknown } | null | undefined;
    this.logError(reason?.message ?? reason);
  };

  /**
   * 壳桥（§3.5）：壳侧（index.astro 等）零 import world，经
   * `window.dispatchEvent(new CustomEvent('world-obs', { detail: { type, data? } }))`
   * 入 timeline。只放行 ux / error 两族白名单 type，其余丢弃 + console.warn
   * （防桥被当万能注入面）；detail.data 走 log() 同一扁平清洗。
   */
  private readonly obsBridgeHandler = (event: Event): void => {
    try {
      const detail = (event as CustomEvent<{ type?: unknown; data?: unknown }>).detail;
      const type = typeof detail?.type === 'string' ? detail.type : '';
      const family = FAMILY[type];
      if (family !== 'ux' && family !== 'error') {
        this.warnOnce(`obs:${type}`, `[session] world-obs 桥拒收（仅 ux/error 族）：${type}`);
        return;
      }
      this.log(type, detail?.data as Record<string, unknown> | undefined);
    } catch {
      /* 桥故障不得影响游戏路径（§3.3 健壮性同构） */
    }
  };

  private readonly contextLostHandler = (): void => {
    this.log('context-lost');
  };

  /** 自挂 window 监听（§3.4 error 族 + §3.5 壳桥）：构造挂载、dispose 合同 c 步摘除 */
  private readonly winListeners: ReadonlyArray<readonly [string, EventListener]> = [
    ['error', this.errorHandler as EventListener],
    ['unhandledrejection', this.rejectionHandler as EventListener],
    ['world-obs', this.obsBridgeHandler],
  ];

  constructor(envSource: SessionEnvSource) {
    this.envSource = envSource;
    // WebGPU device.lost 接线归规格 §9 开放问题（渲染层接缝，P0 只接 webglcontextlost）
    for (const [name, handler] of this.winListeners) window.addEventListener(name, handler);
    // 构造即自打 mount（t≈0，§3.1 会话起点）
    this.log('mount');
  }

  /** 镜像订阅（Game 构造器调用；§3.4 镜像表）+ canvas context-lost 接线 */
  attach(events: Events, canvas?: HTMLCanvasElement): void {
    if (this.disposed) return;
    this.busEvents = events;
    for (const [event, type, dataKey] of MIRRORS) {
      const handler = (...args: unknown[]): void => {
        this.log(type, dataKey !== undefined ? { [dataKey]: String(args[0]) } : undefined);
      };
      events.on(event, handler as never);
      this.mirrorSubs.push([event, handler]);
    }
    if (canvas) {
      this.canvas = canvas;
      canvas.addEventListener('webglcontextlost', this.contextLostHandler);
    }
  }

  /**
   * 记一条事件（各系统一行接线，无空判断）。永不抛错：白名单外丢弃 +
   * console.warn 一次/type；data 非法值键剔除；聚合（funnel/counters）在入口
   * 更新、独立于 ring。
   */
  log(type: string, data?: Record<string, unknown>): void {
    try {
      if (this.disposed) return;
      if (FAMILY[type] === undefined) {
        this.warnOnce(type, `[session] 白名单外事件丢弃：${type}`);
        return;
      }
      const t = Math.round(performance.now() - this.t0);
      const clean = this.sanitize(data);
      const entry: SessionEventEntry = { seq: ++this.seq, t, type };
      if (clean !== undefined) entry.data = clean;
      if (this.ring.length >= RING_LIMIT) {
        this.ring.shift();
        this.dropped += 1;
      }
      this.ring.push(entry);
      this.aggregate(type, t, clean);
    } catch {
      /* 埋点故障不得影响游戏路径（§3.3 第 6 条） */
    }
  }

  /** 纯快照：全新 JSON-safe 平面对象，任意时刻可反复调；dispose 后返回终态 */
  dump(): SessionDump {
    return {
      schemaVersion: 1,
      sessionId: this.sessionId,
      startedAt: this.startedAt,
      env: { ...this.envSource(), ...this.envSnap, viewport: { ...this.viewport } },
      events: this.ring.map((entry) => this.copyEntry(entry)),
      dropped: this.dropped,
      counters: { ...this.counters },
      funnel: { ...this.funnel },
    };
  }

  /** 最近 n 条只读游标（§3.3 第 5 条：仅 world 分包内 #debug 面板消费，不上 window） */
  tail(n: number): SessionEventEntry[] {
    return this.ring.slice(-Math.max(n, 0)).map((entry) => this.copyEntry(entry));
  }

  /**
   * [CC-PERF-C2-B0] counters.longFrames 递增口（O10 常驻轻量层）：长帧不发事件
   * ——逐帧 log 会灌爆 ring（SwiftShader 下每帧都是长帧），只走聚合计数。
   * 阈值判定归调用点（装配段 tick 一次比较），本方法无条件 +1。
   */
  countLongFrame(): void {
    if (this.disposed) return;
    this.counters.longFrames += 1;
  }

  /**
   * dispose 合同（§4.2）：Game.dispose() 首段调用（各系统仍在、读数完整）。
   * 幂等三步：dispose 事件入 ring → console 摘要一次 → 摘除全部监听；
   * 二次调用零输出零副作用。
   */
  dispose(): void {
    if (this.disposed) return;
    this.log('dispose');
    console.table(this.funnel);
    console.table(this.counters);
    console.info(`[session] ${this.sessionId} 事件 ${this.seq} 条（丢弃 ${this.dropped}）`);
    for (const [name, handler] of this.winListeners) window.removeEventListener(name, handler);
    this.canvas?.removeEventListener('webglcontextlost', this.contextLostHandler);
    this.canvas = null;
    for (const [name, handler] of this.mirrorSubs) this.busEvents?.off(name, handler as never);
    this.mirrorSubs.length = 0;
    this.busEvents = null;
    this.disposed = true;
  }

  /* ———————————————————— 内部 ———————————————————— */

  /** 事件条目浅拷贝（dump/tail 共用：ring 内部对象不外泄） */
  private copyEntry(entry: SessionEventEntry): SessionEventEntry {
    return entry.data !== undefined ? { ...entry, data: { ...entry.data } } : { ...entry };
  }

  /** 扁平清洗（§3.2 data 规则）：仅 string/boolean/有限 number 通过，非法值键剔除 */
  private sanitize(
    data?: Record<string, unknown>,
  ): Record<string, string | number | boolean> | undefined {
    if (data === null || typeof data !== 'object') return undefined;
    let clean: Record<string, string | number | boolean> | undefined;
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (
        typeof value === 'string' ||
        typeof value === 'boolean' ||
        (typeof value === 'number' && Number.isFinite(value))
      ) {
        (clean ??= {})[key] = value;
      }
    }
    return clean;
  }

  /** funnel（只记首达）+ counters 聚合——独立于 ring，溢出不失真（§3.3 第 2 条） */
  private aggregate(
    type: string,
    t: number,
    data?: Record<string, string | number | boolean>,
  ): void {
    const funnelKey = FUNNEL_KEY[type];
    if (funnelKey !== undefined) this.funnel[funnelKey] ??= t;
    // carReady 只认 to='car'（回变机器人不写，§3.3 第 3 条）
    if (type === 'world-transform' && data?.to === 'car') this.funnel.carReady ??= t;

    const counterKey = COUNTER_KEY[type];
    if (counterKey !== undefined) this.counters[counterKey] += 1;
    if (type === 'cone-hit' && typeof data?.total === 'number') this.counters.coneHits = data.total;
  }

  /** pageerror 统一入口（window error / unhandledrejection 两监听共用） */
  private logError(reason: unknown): void {
    this.log('pageerror', { message: String(reason ?? 'unknown').slice(0, ERROR_MESSAGE_LIMIT) });
  }

  private warnOnce(key: string, message: string): void {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    console.warn(message);
  }
}
