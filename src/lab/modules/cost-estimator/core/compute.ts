import type { Agent, Kind, NreKey, Params, Result, RowResult, Selection } from './types.ts';
import { unionLangs } from './langs.ts';

export function total(values: Iterable<number | null>): number | null {
  const a = [...values];
  return a.some((v) => v === null) ? null : sum(a as number[]);
}
// Python 3.12+ sum uses compensated floating addition; preserve half-cent boundaries.
function sum(values: number[]): number {
  let value = 0, correction = 0;
  for (const x of values) {
    const next = value + x;
    correction += Math.abs(value) >= Math.abs(x) ? (value - next) + x : (x - next) + value;
    value = next;
  }
  return value + correction;
}
// Python's :g formats six significant digits. Formula prose is also part of the golden contract.
const g = (n: number) => Number(n.toPrecision(6)).toString();
type Mode = 'first' | 'ext';
type RowKey = 'research' | 'product' | 'delivery' | 'direct';
const KEYS: RowKey[] = ['research', 'product', 'delivery', 'direct'];
function decimalParts(value: number): { integer: bigint; power: number } {
  const [mantissa, exponent = '0'] = value.toString().toLowerCase().split('e');
  const fraction = mantissa.split('.')[1] ?? '';
  return { integer: BigInt(mantissa.replace('.', '')), power: Number(exponent) - fraction.length };
}
/** Same source-decimal product as Python Decimal(str(...)); no display rounding. */
export function decimalProduct(...values: number[]): number {
  let integer = 1n, power = 0;
  for (const value of values) {
    const part = decimalParts(value); integer *= part.integer; power += part.power;
  }
  return Number(`${integer}e${power}`);
}
export function decimalSum(values: number[]): number {
  if (!values.length) return 0;
  const parts = values.map(decimalParts), power = Math.min(...parts.map((p) => p.power));
  const integer = parts.reduce((v, p) => v + p.integer * 10n ** BigInt(p.power - power), 0n);
  return Number(`${integer}e${power}`);
}
export function classify(p: Params, s: Selection, a: Agent): [Kind, Mode] {
  const caps = [...new Set(a.caps)];
  const all = new Set(p.cars.flatMap((c) => c.delivered.flatMap((d) => d.caps)));
  const own = p.cars.find((c) => c.id === s.car)?.delivered ?? [];
  if (caps.length && s.regions.length && s.regions.every((r) => own.some((d) => d.region === r && caps.every((c) => d.caps.includes(c))))) return ['delivered', 'ext'];
  const mode = caps.length && caps.every((c) => all.has(c)) ? 'ext' : 'first';
  return [caps.length > 1 ? 'fused' : mode, mode];
}

/** Pure reference port; function boundaries and accumulation order follow cost_model.py. */
export function compute(p: Params, sel: Selection): Result {
  const s = { ...sel, regions: [...new Set(sel.regions)] };
  const language = unionLangs(p, s), eq = language.eq, rates = p.rates;
  const rows: RowResult[] = [], chosen: [Agent, RowResult, Mode][] = [];
  const counts = { first: 0, ext: 0, fused: 0, no: 0, tbd: 0 };
  const known: Record<string, Record<RowKey, number>> = {};
  const missing: Record<string, Partial<Record<RowKey, string[]>>> = {};
  for (const a of p.packages[s.pkg].agents) {
    let [kind, mode] = classify(p, s, a);
    const manual = Object.hasOwn(s.overrides, a.id);
    if (manual) {
      mode = s.overrides[a.id];
      if (mode !== 'first' && mode !== 'ext') throw new Error('非法手改口径');
      kind = a.caps.length > 1 ? 'fused' : mode;
    }
    const row: RowResult = { id: a.id, kind, manual, counted: false, pm: 0, research: 0, product: 0, delivery: 0, direct: 0, sum: 0, formula: [], notes: [], pending: [] };
    rows.push(row); known[a.id] = { research: 0, product: 0, delivery: 0, direct: 0 }; missing[a.id] = {};
    const pending = (key: RowKey, message: string) => (missing[a.id][key] ??= []).push(`${p.packages[s.pkg].name}·${a.name}：${message}`);
    if (!s.agents.includes(a.id)) continue;
    const cov = a.coverage[s.tier];
    if (cov === '不承接' || cov === '待评估') { counts[cov === '不承接' ? 'no' : 'tbd']++; row.notes.push(cov + '：本档不计入'); continue; }
    chosen.push([a, row, mode]);
    if (kind === 'delivered') { row.formula.push('所选车型及区域已交付该能力，本行不重复计费'); continue; }
    if (mode === 'first') {
      const first = a.first;
      if (first === null) {
        row.notes.push('待评估：缺首发职能人月与直接费用');
        for (const [key, label] of [['research', '研究院首发人月'], ['product', '产研首发人月'], ['delivery', '五职能首发人月'], ['direct', '直接费用']] as const) pending(key, label + '待补');
      } else {
        const shared = first.preShared;
        row.pm = sum([first.research, first.product, first.delivery].filter((v): v is number => v !== null));
        for (const [key, rate, share, label] of [
          ['research', rates.research, shared ? 1 : rates.researchShare, '研究院'],
          ['product', rates.product, shared ? 1 : rates.productShare, '产研'],
          ['delivery', rates.delivery, 1, '五职能'],
        ] as const) {
          const pm = first[key];
          row[key] = pm === null ? 0 : decimalProduct(pm, rate, share);
          if (pm === null) { pending(key, label + '首发人月待补'); row.notes.push('待评估：缺' + label + '首发人月'); }
          else known[a.id][key] = row[key]!;
          row.formula.push(label + ' ' + (pm === null ? '待评估' : `${g(pm)} 人月 × ${g(rate)} 万 × ${g(share)} = ${g(row[key]!)} 万` + (shared ? '（已分摊底数不再分摊）' : '')));
        }
        row.direct = first.direct ?? 0;
        if (first.direct === null) { row.notes.push('待补：缺直接费用'); pending('direct', '直接费用待补'); }
        else known[a.id].direct = row.direct;
        row.formula.push('直接费用全额计入，不分摊');
      }
    } else {
      const ext = a.extByTier && Object.hasOwn(a.extByTier, s.tier) ? a.extByTier[s.tier]! : a.ext;
      if (ext === null) { row.notes.push('待评估：缺横展工作项定额'); pending('delivery', '横展工作项定额待补'); }
      else {
        const marketN = Math.max(0, s.regions.length - 1), langN = Math.max(0, eq - 1);
        const parts: (number | null)[] = [ext.base];
        if (ext.base === null) pending('delivery', '横展基线待补');
        for (const [key, n, label] of [['perMarket', marketN, '后续市场增量'], ['perLang', langN, '每等效语种增量']] as const) {
          if (n) { const v = ext[key]; parts.push(v === null ? null : v * n); if (v === null) { row.notes.push('待评估：缺' + label + '定额'); pending('delivery', label + '待补'); } }
        }
        if (s.systemSwitch) { if (ext.systemSwitch === null) row.notes.push('系统方切换无定额'); else parts.push(ext.systemSwitch); }
        row.pm = sum(parts.filter((v): v is number => v !== null)); row.delivery = row.pm * rates.delivery;
        known[a.id].delivery = row.delivery;
        const display = (v: number | null) => v === null ? '待补' : g(v);
        row.formula.push(`五职能人月 = 基线${display(ext.base)} + 后续市场${display(ext.perMarket)} × ${marketN} + 每等效语种${display(ext.perLang)} × ${g(langN)}；五职能费用 = 人月 × ${g(rates.delivery)}`);
      }
    }
    if (kind === 'fused') row.formula.unshift('融合智能体：组成能力' + (mode === 'ext' ? '均已交付，取整行横展' : '尚未全部交付，取整行首发'));
  }
  for (const pool of p.researchPools ?? []) {
    const members = chosen.filter(([a, r, mode]) => mode === 'first' && r.kind !== 'delivered' && a.caps.some((c) => pool.caps.includes(c)));
    if (!members.length) continue;
    const amount = pool.research === null ? null : pool.research * rates.research * rates.researchShare / members.length;
    for (const [a, row] of members) {
      row.research = amount ?? 0;
      known[a.id].research = amount === null ? 0 : amount; delete missing[a.id].research;
      if (amount === null) missing[a.id].research = [`${p.packages[s.pkg].name}·${a.name}：研究院共用工作包待补`];
      row.formula.push(`研究院工作包${pool.id}共用、已平分，${members.length}行分摊一次投入`);
    }
  }
  // A capability in onceCaps is charged once: the later first-launch row sharing it keeps the given ratio.
  for (const [cap, keep] of Object.entries(p.onceCaps ?? {})) {
    const members = chosen.filter(([a, r, mode]) => mode === 'first' && r.kind !== 'delivered' && a.caps.includes(cap));
    for (const [a, row] of members.slice(1)) {
      row.pm *= keep;
      for (const key of ['research', 'product', 'delivery', 'direct'] as const) { row[key] = row[key]! * keep; known[a.id][key] *= keep; }
      row.formula.push(`${p.capNames?.[cap] ?? cap}已由${members[0][0].name}计入，只算一次：本行 × ${g(keep)}`);
    }
  }
  const contributing = chosen.map(([, r]) => r).filter((r) => r.kind !== 'delivered');
  const nre: Result['nre'] = { research: 0, product: 0, delivery: 0, direct: 0, langFirst: 0, voiceLang: 0, known: 0, total: 0, pending: {} };
  for (const key of KEYS) nre[key] = sum(contributing.map((r) => known[r.id][key]));
  const nrePending: Result['nre']['pending'] = {};
  for (const row of contributing) {
    row.pending = Object.values(missing[row.id]).flat();
    row.sum = row.pending.length ? null : sum(KEYS.map((k) => row[k])); row.counted = row.sum !== null;
    counts[row.counted ? row.kind as 'first' | 'ext' | 'fused' : 'tbd']++;
    for (const [key, messages] of Object.entries(missing[row.id])) (nrePending[key as NreKey] ??= []).push(...messages);
  }
  const active = language.langs.filter((l) => !l.off).map((l) => l.id), notes: string[] = [];
  if (contributing.length && s.perMarket) {
    nre.delivery += rates.perMarketPm * rates.delivery * Math.max(0, s.regions.length - 1);
    notes.push(`分市场验收：${Math.max(0, s.regions.length - 1)} × ${g(rates.perMarketPm)}人月 × ${g(rates.delivery)}万元/人月`);
  }
  const selectedCaps = [...new Set(chosen.filter(([, r]) => r.kind !== 'delivered').flatMap(([a]) => a.caps))];
  nre.langFirst = 0;
  if (contributing.length && language.newLangs.length) {
    for (const lid of language.newLangs) {
      const firstW = language.langs.find((l) => l.id === lid)!.firstW!;
      const costs = selectedCaps.map((c) => p.langFirst?.[c]?.overall ?? null);
      if (!costs.length || costs.some((v) => v === null)) (nrePending.langFirst ??= []).push(p.langs[lid].name + '：扩展语种整体成本待补' + (costs.length ? '（' + selectedCaps.filter((_, i) => costs[i] === null).map((c) => p.capNames[c]).join('、') + '）' : ''));
      const base = sum(costs.filter((v): v is number => v !== null));
      const amount = decimalProduct(base, rates.researchShare, firstW);
      nre.langFirst += amount;
      const role = firstW === 1 ? '锚点 1.0' : '同族 0.5';
      notes.push(`${p.langs[lid].name}（${p.langs[lid].family}·${role}）：扩展语种整体成本 ${g(base)} 万 × 1/5 × ${firstW.toFixed(1)} = ${g(amount)} 万`);
    }
    notes.push('按公版投入五大区分摊，未拆研究院占比');
    notes.push('语系权重沿用 T18FL4 横展：锚点 1.0、同族 0.5');
  }
  nre.voiceLang = 0;
  if (chosen.some(([a]) => a.isVoice)) {
    const ownLangs = new Set(p.cars.find((c) => c.id === s.car)?.delivered.flatMap((d) => d.langs) ?? []);
    for (const lid of active) {
      if (ownLangs.has(lid)) continue;
      const done = p.langs[lid].voiceDone;
      if (done === null) (nrePending.voiceLang ??= []).push(p.langs[lid].name + '：基础语音是否在奇瑞做过待补');
      else nre.voiceLang += done ? rates.voiceLangReuse : rates.voiceLangFirst;
    }
  }
  nre.known = decimalSum([...KEYS, 'langFirst', 'voiceLang'].map((k) => nre[k as NreKey]));
  nre.total = Object.keys(nrePending).length ? null : nre.known; nre.pending = nrePending;
  const licp = p.lic, scale = s.activeRate * s.dailyCalls / (licp.baseActive * licp.baseCalls);
  const voice = s.voice === 'offline' ? licp.voiceOffline : licp.voiceOnline;
  const source = s.regions.map((r) => p.regions[r].sourcePerCar), server = s.regions.map((r) => p.regions[r].serverPerCar);
  const token: number[] = [], pendingAgents: string[] = [];
  for (const [a, row] of chosen) {
    if (row.kind === 'delivered') continue;
    const lic = a.lic, value = lic === null ? null : lic[lic.mode === 'bottomUp' ? 'tokenPerCar' : 'scaledBase'];
    if (value === null) pendingAgents.push(a.id);
    else token.push(lic!.mode === 'bottomUp' ? value * s.activeRate * s.dailyCalls / (licp.activeRate * licp.dailyCalls) : value * scale);
  }
  const knownSource = sum(source.filter((v): v is number => v !== null)), knownServer = sum(server.filter((v): v is number => v !== null)), knownToken = sum(token);
  return { ...language, rows, nre, counts, notes, lic: { voice, source: knownSource, server: knownServer, token: knownToken,
    known: voice + knownToken + knownSource + knownServer,
    pendingRegions: s.regions.filter((r) => p.regions[r].sourcePerCar === null || p.regions[r].serverPerCar === null),
    pendingSource: s.regions.filter((r) => p.regions[r].sourcePerCar === null),
    pendingServer: s.regions.filter((r) => p.regions[r].serverPerCar === null), pendingAgents } };
}
