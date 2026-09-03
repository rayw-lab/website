// ADR-2 §2：进楼驾驶卡。Areas.navigate 同步先写后 assign。
// 键 sessionStorage['world-arrival-v1']；禁止 localStorage；禁止 null 键。
// 零 npm 依赖、零 DOM 框架。存储不可用静默。

/** 与 HallChrome 同键（ADR-2 §2） */
export const ARRIVAL_KEY = 'world-arrival-v1';

/** 与 ExploreProgress 同键；本模块只读、不写 */
const EXPLORE_KEY = 'world-explore-v1';

export interface ArrivalCard {
  v: 1;
  poi: string;
  sessionId: string;
  t: number;
  exploreN: number;
  exploreTotal: number;
  wroteAt: number;
  maxKmh?: number;
  coneHits?: number;
  respawns?: number;
  poiEnters?: number;
}

export interface ArrivalDump {
  sessionId: string;
  events: ReadonlyArray<{
    t: number;
    type: string;
    data?: Readonly<Record<string, string | number | boolean>>;
  }>;
  counters?: {
    coneHits?: number;
    respawns?: number;
    poiEnters?: number;
  };
}

export interface ArrivalSnapshotDeps {
  dump: ArrivalDump;
  /** 在册楼 id：exploreTotal = length；exploreN 白名单（不要写死 12） */
  poiIds: readonly string[];
}

export function snapshotArrival(building: { id: string }, deps: ArrivalSnapshotDeps): void {
  try {
    sessionStorage.setItem(ARRIVAL_KEY, JSON.stringify(buildArrivalCard(building, deps)));
  } catch {
    /* 隐私模式 / 配额 / 无 window：静默 */
  }
}

function buildArrivalCard(building: { id: string }, deps: ArrivalSnapshotDeps): ArrivalCard {
  const events = Array.isArray(deps.dump.events) ? deps.dump.events : [];
  const card: ArrivalCard = {
    v: 1,
    poi: building.id,
    sessionId: deps.dump.sessionId,
    t: lastEventT(events),
    exploreN: readExploreN(new Set(deps.poiIds)),
    exploreTotal: deps.poiIds.length,
    wroteAt: Date.now(),
  };
  putOptional(card, 'maxKmh', maxKmhFromEvents(events));
  const counters = deps.dump.counters;
  if (counters) {
    putOptional(card, 'coneHits', counters.coneHits);
    putOptional(card, 'respawns', counters.respawns);
    putOptional(card, 'poiEnters', counters.poiEnters);
  }
  return card;
}

function lastEventT(events: ArrivalDump['events']): number {
  if (events.length === 0) return 0;
  const t = events[events.length - 1]?.t;
  return typeof t === 'number' && Number.isFinite(t) ? t : 0;
}

function maxKmhFromEvents(events: ArrivalDump['events']): number | undefined {
  let max: number | undefined;
  for (const entry of events) {
    if (entry.type !== 'world-speedtrap') continue;
    const kmh = entry.data?.kmh;
    if (typeof kmh === 'number' && Number.isFinite(kmh)) {
      max = max === undefined ? kmh : Math.max(max, kmh);
    }
  }
  return max;
}

function readExploreN(validIds: ReadonlySet<string>): number {
  try {
    const raw = localStorage.getItem(EXPLORE_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    const seen = new Set<string>();
    for (const id of parsed) {
      if (typeof id === 'string' && validIds.has(id)) seen.add(id);
    }
    return seen.size;
  } catch {
    return 0;
  }
}

function putOptional(
  card: ArrivalCard,
  key: 'maxKmh' | 'coneHits' | 'respawns' | 'poiEnters',
  value: number | undefined,
): void {
  if (typeof value === 'number' && Number.isFinite(value)) card[key] = value;
}
