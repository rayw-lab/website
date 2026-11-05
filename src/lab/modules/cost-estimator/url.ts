import type { PackageId, Params, RegionId, Selection, Tier } from './core/types.ts';
export function encode(s: Selection, version: string): string {
  return new URLSearchParams({ p: s.pkg, t: s.tier, c: s.car, r: s.regions.join(','), x: s.offLangs.join(','), a: s.agents.join(','),
    o: Object.entries(s.overrides).map(([id, mode]) => `${id}:${mode === 'first' ? 'f' : 'e'}`).join(','),
    v: s.voice === 'online' ? 'on' : 'off', ar: String(s.activeRate), dc: String(s.dailyCalls), pm: s.perMarket ? '1' : '0', ss: s.systemSwitch ? '1' : '0', ver: version,
    ...(s.hidden === undefined ? {} : { h: s.hidden.join(',') }) }).toString();
}
export function decode(q: string, p: Params): { sel: Partial<Selection>; dropped: string[]; staleVersion: boolean } {
  const query = new URLSearchParams(q), sel: Partial<Selection> = {}, dropped: string[] = [];
  // Accept the descriptive keys used in the original acceptance example as well.
  const aliases: Record<string, string> = { p: 'pkg', t: 'tier', c: 'car', r: 'regions', x: 'offLangs', a: 'agents', o: 'overrides', v: 'voice', ar: 'active', dc: 'dailyCalls', pm: 'perMarket', ss: 'systemSwitch' };
  const get = (k: string) => query.get(k) ?? (aliases[k] ? query.get(aliases[k]) : null);
  const drop = (k: string, value: string) => { dropped.push(`${k}=${value}`); };
  const pkg = get('p');
  if (pkg !== null) { if (Object.hasOwn(p.packages, pkg)) sel.pkg = pkg as PackageId; else drop('p', pkg); }
  const tier = get('t');
  if (tier !== null) { if (['MAX', 'PRO', 'Lite'].includes(tier)) sel.tier = tier as Tier; else drop('t', tier); }
  const car = get('c');
  if (car !== null) { if (car.length <= 120 && !/[\x00-\x1f\x7f]/.test(car)) sel.car = car; else drop('c', car); }
  const list = (key: string, allowed: (v: string) => boolean): string[] | undefined => {
    const value = get(key); if (value === null) return undefined;
    return [...new Set((value ? value.split(',') : []).filter((v) => { if (allowed(v)) return true; drop(key, v); return false; }))];
  };
  const regions = list('r', (id) => Object.hasOwn(p.regions, id)); if (regions) sel.regions = regions as RegionId[];
  const offLangs = list('x', (id) => Object.hasOwn(p.langs, id)); if (offLangs) sel.offLangs = offLangs;
  if (sel.regions?.length && sel.offLangs && sel.regions.flatMap((r) => p.regions[r].langs).every((l) => sel.offLangs!.includes(l))) { drop('x', get('x')!); delete sel.offLangs; }
  const validIds = new Set(p.packages[sel.pkg ?? 'c3-euanz'].agents.map((a) => a.id));
  const agents = list('a', (id) => validIds.has(id)); if (agents) sel.agents = agents;
  const hidden = list('h', (id) => validIds.has(id)); if (hidden) sel.hidden = hidden;
  const overrides = get('o');
  if (overrides !== null) {
    const entries: [string, 'first' | 'ext'][] = [];
    for (const item of overrides ? overrides.split(',') : []) {
      const parts = item.split(':');
      if (parts.length === 2 && validIds.has(parts[0]) && ['f', 'e'].includes(parts[1])) entries.push([parts[0], parts[1] === 'f' ? 'first' : 'ext']);
      else drop('o', item);
    }
    sel.overrides = Object.fromEntries(entries);
  }
  const voice = get('v');
  if (voice !== null) { if (voice === 'on' || voice === 'off') sel.voice = voice === 'on' ? 'online' : 'offline'; else drop('v', voice); }
  for (const [k, field, min, max] of [['ar', 'activeRate', .15, .8], ['dc', 'dailyCalls', 5, 30]] as const) {
    const value = get(k); if (value === null) continue;
    const n = Number(value);
    if (value.trim() !== '' && Number.isFinite(n) && n >= min && n <= max && (k !== 'dc' || Number.isInteger(n))) sel[field] = n;
    else drop(k, value);
  }
  for (const [k, field] of [['pm', 'perMarket'], ['ss', 'systemSwitch']] as const) {
    const value = get(k); if (value === null) continue;
    if (value === '0' || value === '1') sel[field] = value === '1'; else drop(k, value);
  }
  return { sel, dropped, staleVersion: query.has('ver') && query.get('ver') !== p.version };
}

const STORAGE_KEY = 'cost-estimator:selection';
export function remember(s: Selection): void {
  try { globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* Storage can be disabled. */ }
}
export function recall(): Partial<Selection> | null {
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY); if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object' || Array.isArray(s)) return null;
    if (Object.keys(s).some((k) => !['pkg', 'tier', 'car', 'regions', 'offLangs', 'agents', 'hidden', 'overrides', 'voice', 'activeRate', 'dailyCalls', 'perMarket', 'systemSwitch'].includes(k))) return null;
    if (s.pkg !== undefined && !['c3-euanz', 'c3-sea', 'c15-eu', 'c15-ru'].includes(s.pkg)) return null;
    if (s.tier !== undefined && !['MAX', 'PRO', 'Lite'].includes(s.tier)) return null;
    if (s.car !== undefined && typeof s.car !== 'string') return null;
    for (const k of ['regions', 'offLangs', 'agents', 'hidden']) if (s[k] !== undefined && (!Array.isArray(s[k]) || !s[k].every((x: unknown) => typeof x === 'string'))) return null;
    if (s.regions?.some((r: string) => !['eu', 'anz', 'ru', 'sea', 'me', 'za', 'latam', 'ca', 'eul'].includes(r))) return null;
    if (s.overrides !== undefined && (!s.overrides || typeof s.overrides !== 'object' || Array.isArray(s.overrides) || Object.values(s.overrides).some((v) => v !== 'first' && v !== 'ext'))) return null;
    if (s.voice !== undefined && !['online', 'offline'].includes(s.voice)) return null;
    if (s.activeRate !== undefined && (typeof s.activeRate !== 'number' || !Number.isFinite(s.activeRate) || s.activeRate < .15 || s.activeRate > .8)) return null;
    if (s.dailyCalls !== undefined && (!Number.isInteger(s.dailyCalls) || s.dailyCalls < 5 || s.dailyCalls > 30)) return null;
    for (const k of ['perMarket', 'systemSwitch']) if (s[k] !== undefined && typeof s[k] !== 'boolean') return null;
    return s;
  } catch { return null; }
}
