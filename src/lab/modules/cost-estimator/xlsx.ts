import type { Agent, NreKey, Params, Result, Selection } from './core/types.ts';
import { classify } from './core/compute.ts';

const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const xml = (value: string) => value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
const kindName = { first: '首发', ext: '横展', fused: '融合', delivered: '已交付' };
type Cell = { value?: string | number; formula?: string; style: number };
type Sheet = { name: string; cells: Map<string, Cell>; last: number; widths: number[]; merges: string[] };
const sheet = (name: string, widths: number[]): Sheet => ({ name, widths, cells: new Map(), last: 1, merges: [] });
function put(s: Sheet, addr: string, value: string | number | null, style = 0): string {
  s.cells.set(addr, { ...(value === null ? {} : { value }), style }); s.last = Math.max(s.last, +addr.replace(/[A-Z]/g, '')); return addr;
}
function formula(s: Sheet, addr: string, f: string, style = 2): string { s.cells.set(addr, { formula: f, style }); s.last = Math.max(s.last, +addr.replace(/[A-Z]/g, '')); return addr; }
const absolute = (ref: string) => ref.replace(/^([A-Z]+)(\d+)$/, '$$$1$$$2');
const sum = (refs: string[]) => refs.length ? `SUM(${refs.join(',')})` : 'SUM(0)';
function input(s: Sheet, label: string, value: number | null, note = '', style = 1): string {
  const row = s.last + 1; put(s, `A${row}`, label); put(s, `B${row}`, value, style); if (note) put(s, `C${row}`, note); return absolute(`B${row}`);
}
function renderSheet(s: Sheet): string {
  const rows = new Map<number, [string, Cell][]>();
  for (const [addr, cell] of s.cells) { const row = +addr.replace(/[A-Z]/g, ''); if (!rows.has(row)) rows.set(row, []); rows.get(row)!.push([addr, cell]); }
  const col = (ref: string) => [...ref.replace(/\d/g, '')].reduce((v, ch) => v * 26 + ch.charCodeAt(0) - 64, 0);
  const content = [...rows].sort(([a], [b]) => a - b).map(([r, cells]) => `<row r="${r}" ht="30" customHeight="1">${cells.sort(([a], [b]) => col(a) - col(b)).map(([addr, c]) => {
    const attrs = `r="${addr}" s="${c.style}"`;
    if (c.formula !== undefined) return `<c ${attrs}><f>${xml(c.formula)}</f></c>`;
    if (c.value === undefined) return `<c ${attrs}/>`;
    return typeof c.value === 'number' ? `<c ${attrs}><v>${c.value}</v></c>` : `<c ${attrs} t="inlineStr"><is><t xml:space="preserve">${xml(c.value)}</t></is></c>`;
  }).join('')}</row>`).join('');
  return XML + `<worksheet xmlns="${NS}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="2" topLeftCell="A3" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="30"/><cols>${s.widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${content}</sheetData>${s.merges.length ? `<mergeCells count="${s.merges.length}">${s.merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('')}</mergeCells>` : ''}</worksheet>`;
}

/** Stored ZIP, UTF-8 names, CRC32, central directory; no compression/library/runtime dependency. */
function zip(files: Record<string, string>): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder(), chunks: Uint8Array[] = [], directory: Uint8Array[] = []; let offset = 0;
  const header = (size: number) => { const bytes = new Uint8Array(size); return { bytes, v: new DataView(bytes.buffer) }; };
  const crc32 = (bytes: Uint8Array) => {
    let crc = 0xffffffff;
    for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    return (crc ^ 0xffffffff) >>> 0;
  };
  for (const [name, value] of Object.entries(files)) {
    const n = encoder.encode(name), data = encoder.encode(value), crc = crc32(data);
    const local = header(30); local.v.setUint32(0, 0x04034b50, true); local.v.setUint16(4, 20, true); local.v.setUint16(6, 0x800, true);
    local.v.setUint16(12, 33, true); local.v.setUint32(14, crc, true); local.v.setUint32(18, data.length, true); local.v.setUint32(22, data.length, true); local.v.setUint16(26, n.length, true);
    chunks.push(local.bytes, n, data);
    const central = header(46); central.v.setUint32(0, 0x02014b50, true); central.v.setUint16(4, 20, true); central.v.setUint16(6, 20, true); central.v.setUint16(8, 0x800, true);
    central.v.setUint16(14, 33, true); central.v.setUint32(16, crc, true); central.v.setUint32(20, data.length, true); central.v.setUint32(24, data.length, true); central.v.setUint16(28, n.length, true); central.v.setUint32(42, offset, true);
    directory.push(central.bytes, n); offset += 30 + n.length + data.length;
  }
  const dirSize = directory.reduce((a, b) => a + b.length, 0), end = header(22), count = Object.keys(files).length;
  end.v.setUint32(0, 0x06054b50, true); end.v.setUint16(8, count, true); end.v.setUint16(10, count, true); end.v.setUint32(12, dirSize, true); end.v.setUint32(16, offset, true);
  const output = new Uint8Array(offset + dirSize + 22); let at = 0;
  for (const chunk of [...chunks, ...directory, end.bytes]) { output.set(chunk, at); at += chunk.length; }
  return output;
}

const STYLES = XML + `<styleSheet xmlns="${NS}"><numFmts count="3"><numFmt numFmtId="164" formatCode="0.00"/><numFmt numFmtId="165" formatCode="0.0"/><numFmt numFmtId="166" formatCode="0.0%"/></numFmts><fonts count="2"><font><sz val="11"/><name val="等线"/></font><font><b/><sz val="11"/><name val="等线"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAE7DF"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7">${[
  [0, 0, 0], [164, 0, 2], [164, 0, 0], [165, 0, 0], [0, 1, 3], [0, 0, 2], [166, 0, 2],
].map(([fmt, font, fill]) => `<xf numFmtId="${fmt}" fontId="${font}" fillId="${fill}" borderId="0" xfId="0" applyNumberFormat="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>`).join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

export function fileName(p: Params, s: Selection): string {
  const safe = (v: string) => v.replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g, '_');
  return `成本粗估-${safe(p.packages[s.pkg].name)}-${safe(s.car || '未选车型')}-${safe(p.version)}.xlsx`;
}

export function buildWorkbook(p: Params, sel: Selection, r: Result): Uint8Array<ArrayBuffer> {
  const s = { ...sel, regions: [...new Set(sel.regions)] }, agents = p.packages[s.pkg].agents;
  const sheets = [sheet('你选了什么', [34, 24, 40, 18, 18, 18]), sheet('NRE 明细', [42, 18, 34, 18, 18, 18, 18, 18, 65]), sheet('LIC 明细', [40, 22, 70])];
  const [pick, nre, lic] = sheets;
  const names: string[] = [];
  const define = (path: string, sh: Sheet, ref: string) => { names.push(`<definedName name="CE__${path.replace(/\./g, '__')}">'${sh.name}'!${absolute(ref)}</definedName>`); };
  const capName = (c: string) => agents.find((a) => a.caps.includes(c))?.name ?? '所选能力';
  const readable = (text: string) => Object.keys(p.langFirst ?? {}).reduce((txt, cap) => txt.replaceAll(cap, capName(cap)), text);
  for (const sh of sheets) { put(sh, 'A1', '成本粗估，不是报价', 4); sh.merges.push('A1:C1'); put(sh, 'A2', `参数 ${p.version} 版；来源：成本粗估参数总表`); sh.merges.push('A2:C2'); }
  const config: [string, string][] = [['参数版本', p.version], ['包', p.packages[s.pkg].name], ['档位', s.tier], ['车型', s.car || '未选'],
    ['区域', s.regions.map((id) => p.regions[id].name).join('、')], ['基础语音', s.voice === 'online' ? '在线' : '离线'], ['分市场验收', s.perMarket ? '开' : '关'], ['系统方切换适配', s.systemSwitch ? '开' : '关']];
  config.forEach(([a, b], i) => { put(pick, `A${i + 3}`, a); put(pick, `B${i + 3}`, b); });
  let j = 12; put(pick, `A${j}`, '语种', 4); put(pick, `B${j}`, '等效权重', 4); put(pick, `C${j++}`, '说明', 4);
  for (const l of r.langs) { put(pick, `A${j}`, l.name); put(pick, `B${j}`, l.off ? '已剔除' : l.isNew ? '新' : l.weight, 3); put(pick, `C${j++}`, l.why); }
  j++; ['智能体', '是否勾选', '口径', '是否手改', '承接状态'].forEach((v, i) => put(pick, `${String.fromCharCode(65 + i)}${j}`, v, 4)); j++;
  for (const a of agents) { const row = r.rows.find((rr) => rr.id === a.id)!; [a.name, s.agents.includes(a.id) ? '是' : '否', kindName[row.kind], row.manual ? '是' : '否', a.coverage[s.tier]].forEach((v, i) => put(pick, `${String.fromCharCode(65 + i)}${j}`, v)); j++; }

  // Yellow rate cells are the sole owners of editable shared assumptions.
  for (const [row, label, value, percent] of [
    [3, '研究院单价（万元/人月）', p.rates.research, false], [4, '研究院分摊', p.rates.researchShare, true],
    [5, '产研单价（万元/人月）', p.rates.product, false], [6, '产研分摊', p.rates.productShare, true],
    [7, '五职能单价（万元/人月）', p.rates.delivery, false], [8, '分市场验收（人月/后续市场）', p.rates.perMarketPm, false],
    [9, '基础语音首次（万元/语种）', p.rates.voiceLangFirst, false], [10, '基础语音复用（万元/语种）', p.rates.voiceLangReuse, false],
  ] as const) { put(nre, `A${row}`, label); put(nre, `B${row}`, value, percent ? 6 : 1); }
  put(nre, 'A11', '金额：万元；人月一位，金额两位，仅显示舍入。待补底数留空，计算格暂计已知部分；填数后自动联动。'); nre.merges.push('A11:I11');
  const nreRows: Record<NreKey, number> = { research: 13, product: 14, delivery: 15, direct: 16, langFirst: 17, voiceLang: 18 };
  const labels: Record<NreKey, string> = { research: '研究院', product: '产研', delivery: '五职能', direct: '直接费用', langFirst: '语种首发', voiceLang: '基础语音语种费' };
  for (const key of Object.keys(nreRows) as NreKey[]) { put(nre, `A${nreRows[key]}`, labels[key] + '（已知部分）', 4); define(`nre.${key}`, nre, `B${nreRows[key]}`); put(nre, `C${nreRows[key]}`, (r.nre.pending[key] ?? []).map(readable).join('；')); }
  put(nre, 'A19', '已知合计', 4); formula(nre, 'B19', 'SUM(B13:B18)'); define('nre.known', nre, 'B19');
  put(nre, 'A20', '完整合计', 4); if (r.nre.total === null) { put(nre, 'B20', null, 1); put(nre, 'C20', '待补：见各级待补说明；已知部分见上一行'); } else formula(nre, 'B20', 'SUM(B13:B18)'); define('nre.total', nre, 'B20');
  const start = 24;
  ['智能体', '口径 / 手改', '人月', '研究院', '产研', '五职能', '直接费用', '小计', '待补 / 说明'].forEach((v, i) => put(nre, `${String.fromCharCode(65 + i)}${start - 1}`, v, 4));
  nre.last = start + r.rows.length;
  const contributions: Record<NreKey, string[]> = { research: [], product: [], delivery: [], direct: [], langFirst: [], voiceLang: [] };
  const selected = agents.filter((a) => s.agents.includes(a.id) && !['不承接', '待评估'].includes(a.coverage[s.tier]));
  const relevant = selected.filter((a) => r.rows.find((rr) => rr.id === a.id)!.kind !== 'delivered');
  const mode = (a: Agent) => s.overrides[a.id] ?? classify(p, s, a)[1];
  const poolInputs = new Map((p.researchPools ?? []).flatMap((pool) => {
    const members = relevant.filter((a) => mode(a) === 'first' && a.caps.some((c) => pool.caps.includes(c)));
    if (!members.length) return [];
    const ref = input(nre, '共用研究院工作包人月', pool.research, members.map((a) => a.name).join('、') + '共用，替代各行研究院底数');
    const divisor = input(nre, '共用工作包分摊行数', members.length);
    return [[pool, { ref, divisor }] as const];
  }));
  // Shared capabilities charged once: later first-launch rows get an editable keep ratio (mirrors core).
  const onceFor = new Map<string, { cap: string; keep: number; by: string }[]>();
  for (const [cap, keep] of Object.entries(p.onceCaps ?? {})) {
    const members = relevant.filter((a) => mode(a) === 'first' && a.caps.includes(cap));
    for (const a of members.slice(1)) (onceFor.get(a.id) ?? onceFor.set(a.id, []).get(a.id)!).push({ cap, keep, by: members[0].name });
  }
  const amount = (row: number, key: 'research' | 'product' | 'delivery' | 'direct', partial: boolean, f: string | null) => {
    const ref = `${{ research: 'D', product: 'E', delivery: 'F', direct: 'G' }[key]}${row}`;
    if (f) formula(nre, ref, f, partial ? 1 : 2); else put(nre, ref, 0, 2);
    contributions[key].push(ref);
    return ref;
  };
  for (const [index, row] of r.rows.entries()) {
    const a = agents.find((a) => a.id === row.id)!, rr = start + index;
    put(nre, `A${rr}`, a.name); put(nre, `B${rr}`, kindName[row.kind] + (row.manual ? ' · 手改' : '')); put(nre, `I${rr}`, [...row.pending, ...row.notes].map(readable).join('；'));
    define(`rows.${index}.pm`, nre, `C${rr}`); define(`rows.${index}.sum`, nre, `H${rr}`);
    for (const [key, col] of [['research', 'D'], ['product', 'E'], ['delivery', 'F'], ['direct', 'G']] as const) define(`rows.${index}.${key}`, nre, `${col}${rr}`);
    if (!relevant.includes(a)) { for (const col of ['C', 'D', 'E', 'F', 'G', 'H']) put(nre, `${col}${rr}`, 0, col === 'C' ? 3 : 2); continue; }
    put(nre, `A${nre.last + 1}`, `${a.name} · 底数`, 4);
    let pmFormula: string | null = null, deliveryFormula: string | null = null;
    const first = a.first;
    let researchFormula: string | null = null, productFormula: string | null = null, directFormula: string | null = null;
    if (mode(a) === 'first') {
      const refs: string[] = [];
      for (const [key, label] of [['research', '研究院人月'], ['product', '产研人月'], ['delivery', '五职能人月'], ['direct', '直接费用（万元）']] as const) {
        const v = first?.[key] ?? null, ref = input(nre, `${a.name} · ${label}`, v, v === null ? `待补：${label}` : '来源：总表「人月底数」');
        if (key !== 'direct') refs.push(ref);
        if (key === 'research') researchFormula = `${ref}*$B$3` + (first?.preShared ? '' : '*$B$4');
        if (key === 'product') productFormula = `${ref}*$B$5` + (first?.preShared ? '' : '*$B$6');
        if (key === 'delivery') deliveryFormula = `${ref}*$B$7`;
        if (key === 'direct') directFormula = ref;
      }
      pmFormula = sum(refs);
      for (const pool of p.researchPools ?? []) {
        if (!a.caps.some((c) => pool.caps.includes(c))) continue;
        const { ref, divisor } = poolInputs.get(pool)!;
        researchFormula = `${ref}*$B$3*$B$4/${divisor}`;
      }
      for (const o of onceFor.get(a.id) ?? []) {
        const k = input(nre, `${a.name} · 共用能力保留比例`, o.keep, `${p.capNames[o.cap] ?? o.cap}已由${o.by}计入，只算一次`);
        [pmFormula, researchFormula, productFormula, deliveryFormula, directFormula] = [pmFormula, researchFormula, productFormula, deliveryFormula, directFormula].map((f) => f && `(${f})*${k}`);
      }
    } else {
      const ext = a.extByTier && Object.hasOwn(a.extByTier, s.tier) ? a.extByTier[s.tier] : a.ext;
      {
        const parts: string[] = [];
        for (const [key, label, multiplier] of [
          ['base', '横展基线人月', 1], ['perMarket', '后续市场增量人月', Math.max(0, s.regions.length - 1)],
          ['perLang', '每等效语种增量人月', Math.max(0, r.eq - 1)], ['systemSwitch', '系统方切换人月', s.systemSwitch ? 1 : 0],
        ] as const) {
          const v = ext?.[key] ?? null, ref = input(nre, `${a.name} · ${label}`, v, v === null ? `待补：${label}${key === 'systemSwitch' ? '（无定额时不加钱）' : ''}` : '来源：总表「人月底数」');
          if (multiplier) { const n = input(nre, `${a.name} · ${label}计取份数`, multiplier); parts.push(`${ref}*${n}`); }
        }
        pmFormula = sum(parts);
        deliveryFormula = `${sum(parts)}*$B$7`;
      }
    }
    const partial = row.pending.length > 0;
    formula(nre, `C${rr}`, pmFormula ?? 'SUM(0)', partial ? 1 : 3);
    amount(rr, 'research', partial, researchFormula); amount(rr, 'product', partial, productFormula);
    amount(rr, 'delivery', partial, deliveryFormula); amount(rr, 'direct', partial, directFormula);
    formula(nre, `H${rr}`, `SUM(D${rr}:G${rr})`, row.sum === null ? 1 : 2);
  }
  if (relevant.length && s.perMarket) {
    const n = input(nre, '分市场验收 · 后续市场数', Math.max(0, s.regions.length - 1));
    const rr = nre.last + 1; put(nre, `A${rr}`, '分市场验收 · 费用'); formula(nre, `B${rr}`, `${n}*$B$8*$B$7`); contributions.delivery.push(`B${rr}`);
  }
  const caps = [...new Set(relevant.flatMap((a) => a.caps))];
  if (relevant.length && r.newLangs.length) {
    const costs = caps.map((c) => input(nre, `${capName(c)} · 扩展语种整体成本（万元/语种）`, p.langFirst?.[c]?.overall ?? null, '来源：产品线表；按公版投入五大区分摊，未拆研究院占比'));
    for (const lid of r.newLangs) {
      const language = r.langs.find((l) => l.id === lid)!, firstW = language.firstW!;
      const role = firstW === 1 ? '锚点 1.0' : '同族 0.5';
      const label = `${p.langs[lid].name}（${p.langs[lid].family}·${role}）`;
      const weight = input(nre, `${label} · 语种首发权重`, firstW, language.why + '；语系权重沿用 T18FL4 横展：锚点 1.0、同族 0.5');
      const rr = nre.last + 1; put(nre, `A${rr}`, `${label} · 语种首发`);
      formula(nre, `B${rr}`, `${sum(costs)}*$B$4*${weight}`);
      put(nre, `C${rr}`, `扩展语种整体成本 × 1/5 × 首发权重（初值 ${firstW.toFixed(1)}，上方黄格可改）；同一能力每语种仅计一次`);
      contributions.langFirst.push(`B${rr}`);
    }
  }
  if (selected.some((a) => a.isVoice)) {
    const own = new Set(p.cars.find((c) => c.id === s.car)?.delivered.flatMap((d) => d.langs) ?? []);
    for (const l of r.langs.filter((l) => !l.off && !own.has(l.id))) {
      const rr = nre.last + 1, done = p.langs[l.id].voiceDone; put(nre, `A${rr}`, `${l.name} · 基础语音语种费`);
      if (done === null) { put(nre, `B${rr}`, null, 1); put(nre, `C${rr}`, '待补：基础语音是否在奇瑞做过'); }
      else formula(nre, `B${rr}`, done ? '$B$10' : '$B$9');
      contributions.voiceLang.push(`B${rr}`);
    }
  }
  for (const key of Object.keys(nreRows) as NreKey[]) formula(nre, `B${nreRows[key]}`, sum(contributions[key]));

  // LIC keeps unknown inputs blank; known uses the available detail, including partial token.
  for (const [row, label, value, style] of [
    [3, '在线基础语音（元/车/三年）', p.lic.voiceOnline, 1], [4, '离线基础语音（元/车/三年）', p.lic.voiceOffline, 1],
    [5, '日活跃率', s.activeRate, 6], [6, '每天调用次数', s.dailyCalls, 1], [7, '产品线换算基准活跃率', p.lic.baseActive, 6],
    [8, '产品线换算基准次数', p.lic.baseCalls, 1], [9, '逐项测算基准活跃率', p.lic.activeRate, 6], [10, '逐项测算基准次数', p.lic.dailyCalls, 1],
  ] as const) { put(lic, `A${row}`, label); put(lic, `B${row}`, value, style); }
  const licRefs = { voice: 12, source: 13, server: 14, token: 15, known: 16 };
  for (const [key, rr] of Object.entries(licRefs)) { put(lic, `A${rr}`, { voice: `基础语音（${s.voice === 'online' ? '在线' : '离线'}）`, source: '信源', server: '服务器', token: '智能体调用', known: '已知合计（元/车/三年）' }[key]!, 4); define(`lic.${key}`, lic, `B${rr}`); }
  formula(lic, 'B12', s.voice === 'online' ? '$B$3' : '$B$4', 3);
  const source: string[] = [], server: string[] = [], tokens: string[] = [];
  lic.last = 18;
  for (const rid of s.regions) {
    const region = p.regions[rid];
    source.push(input(lic, `${region.name} · 信源单价`, region.sourcePerCar, region.sourcePerCar === null ? `待补：${region.name}信源单价` : '来源：总表「区域」'));
    server.push(input(lic, `${region.name} · 服务器单价`, region.serverPerCar, region.serverPerCar === null ? `待补：${region.name}服务器单价` : '来源：总表「区域」'));
  }
  for (const a of relevant) {
    const value = a.lic?.[a.lic.mode === 'bottomUp' ? 'tokenPerCar' : 'scaledBase'] ?? null;
    const base = input(lic, `${a.name} · 调用费用底数`, value, value === null ? `待补：${a.name}调用费用底数` : a.lic!.mode === 'bottomUp' ? '逐项测算，按默认活跃率和次数为基准' : '产品线表三年费用，按产品线基准换算');
    const rr = lic.last + 1; put(lic, `A${rr}`, `${a.name} · 调用费用`);
    formula(lic, `B${rr}`, a.lic === null ? base : a.lic.mode === 'bottomUp' ? `${base}*$B$5*$B$6/($B$9*$B$10)` : `${base}*($B$5*$B$6/($B$7*$B$8))`, value === null ? 1 : 3);
    if (a.lic === null) put(lic, `C${rr}`, '待补：调用费用来源与模式；上方黄格可填当前假设下最终调用费用');
    tokens.push(`B${rr}`);
  }
  for (const [key, refs] of [['source', source], ['server', server], ['token', tokens]] as const) {
    const rr = licRefs[key];
    const pending = key === 'token' ? r.lic.pendingAgents : r.lic[key === 'source' ? 'pendingSource' : 'pendingServer'];
    formula(lic, `B${rr}`, sum([...refs]), pending.length ? 1 : 3);
    if (pending.length) {
      const labels = key === 'token' ? r.lic.pendingAgents.map((id) => agents.find((a) => a.id === id)!.name).join('、') + '调用费用'
        : r.lic[key === 'source' ? 'pendingSource' : 'pendingServer'].map((rid) => p.regions[rid].name + (key === 'source' ? '信源单价' : '服务器单价')).join('、');
      put(lic, `C${rr}`, '待补：' + labels);
    }
  }
  formula(lic, 'B16', `B12+${sum([...source, ...server, ...tokens])}`, 3);
  if (r.lic.pendingRegions.length || r.lic.pendingAgents.length) put(lic, 'C16', '已知部分 + 待补；空底数暂按 0 计，补数后自动联动。待补说明为导出时状态。');

  const files: Record<string, string> = {
    '[Content_Types].xml': XML + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>',
    '_rels/.rels': XML + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': XML + `<workbook xmlns="${NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((sh, i) => `<sheet name="${sh.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><definedNames>${names.join('')}</definedNames><calcPr fullCalcOnLoad="1" forceFullCalc="1" calcMode="auto"/></workbook>`,
    'xl/_rels/workbook.xml.rels': XML + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') + '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': STYLES,
  };
  sheets.forEach((sh, i) => { files[`xl/worksheets/sheet${i + 1}.xml`] = renderSheet(sh); });
  return zip(files);
}
