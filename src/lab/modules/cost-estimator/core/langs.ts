import type { LangView, Params, Selection } from './types.ts';

/** Same ordering and maximum-weight tie break as Python union_langs. */
export function unionLangs(p: Params, s: Selection): { langs: LangView[]; eq: number; newLangs: string[] } {
  const ids = [...new Set(s.regions.flatMap((r) => p.regions[r].langs))];
  const delivered = new Set(p.cars.flatMap((c) => c.delivered.flatMap((d) => d.langs)));
  const known = new Set(Object.keys(p.langs).filter((id) => p.langs[id].verified || delivered.has(id)));
  const langs = ids.map((id): LangView => {
    const language = p.langs[id], variant = language.variantOf;
    const isNew = !known.has(id) && !variant;
    const weights = s.regions.filter((r) => p.regions[r].langs.includes(id)).map((r) => {
      let weight: number, why: string;
      if (isNew) { weight = 0; why = '未在已交付表验证，另计语种首发'; }
      else if (variant) { weight = .5; why = '同语种变体，按0.5回归，不算新语种'; }
      else if (Object.hasOwn(p.weights[r] ?? {}, id)) { weight = p.weights[r]![id]; why = '采用T18FL4显式语种权重'; }
      else if (id === 'en') { weight = p.regions[r].langs.length === 1 ? 1 : .5; why = '英语单语种1.0，多语种区域0.5'; }
      else { weight = .5; why = '已验证语种，区域无锚点定额，按回归0.5'; }
      return { weight, why };
    });
    const best = weights.reduce((a, b) => b.weight > a.weight ? b : a);
    const off = s.offLangs.includes(id);
    return { id, name: language.name, weight: off ? 0 : best.weight, isNew: !!isNew, off, why: (off ? '已剔除；' : '') + best.why };
  });
  const active = langs.filter((l) => !l.off);
  const anchors = new Map<string, string>();
  for (const l of active.filter((l) => l.isNew).sort((a, b) => p.langs[a.id].anchorRank - p.langs[b.id].anchorRank || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const family = p.langs[l.id].family;
    if (!anchors.has(family)) anchors.set(family, l.id);
  }
  for (const l of langs) {
    if (!l.isNew) continue;
    const family = p.langs[l.id].family;
    const relatives = Object.entries(p.langs).filter(([id, language]) => known.has(id) && language.family === family).map(([, language]) => language.name);
    const anchor = anchors.get(family) ?? l.id;
    l.firstW = relatives.length || anchor !== l.id ? .5 : 1;
    const role = l.firstW === 1 ? '锚点 1.0' : '同族 0.5';
    l.why += '；' + (relatives.length ? `${family}·同族 0.5，依据已交付/已验证语种：${relatives.join('、')}` : `${family}·${role}，依据本次所选锚点：${p.langs[anchor].name}`);
  }
  return { langs, eq: active.reduce((v, l) => v + l.weight, 0), newLangs: active.filter((l) => l.isNew).map((l) => l.id) };
}
