#!/usr/bin/env node
/**
 * 墨迹 · Ink Ledger —— 数据正确性门
 *
 * 职责边界（写死）：本门只判定 ledger 的**结构与数字是否自洽**，以及
 * type 覆盖是否对普查全集闭合。发布安全（密钥/绝对路径/邮箱）归
 * `nexus-ledger-gate.mjs`，两门互不代替，都要跑。
 *
 * 退出码：0=通过；1=违规；2=用法/前置缺失。任何一条不过都打印全部违规，不止第一条。
 * 无论红绿都先打印分母——没有分母的门不可信。
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LEDGER = fileURLToPath(new URL('../src/data/nexus-ledger.json', import.meta.url));
const CENSUS = fileURLToPath(new URL('../evidence/nexus-hall/w2/type-census.json', import.meta.url));

const bad = [];
const fail = (rule, msg) => bad.push(`[${rule}] ${msg}`);

if (!existsSync(CENSUS)) {
  console.error('前置缺失：type 普查未生成，先跑 .nexus-typecensus.py');
  process.exit(2);
}
if (!existsSync(LEDGER)) {
  console.error(`前置缺失：${LEDGER} 不存在 —— reducer 尚未产出。`);
  console.error('🔴 这不是"通过"，是"没得验"。');
  process.exit(2);
}

const census = JSON.parse(readFileSync(CENSUS, 'utf8'));
const L = JSON.parse(readFileSync(LEDGER, 'utf8'));
const censusTypes = Object.keys(census.types);

// ① schema 版本
if (L.schemaVersion !== 'ink-ledger/v1') fail('SCHEMA', `schemaVersion=${L.schemaVersion}，应为 ink-ledger/v1`);

// ② 🔴 type 覆盖契约闭合：普查的每一种 type 都必须被显式表态
//    （本机有「整类 queue-operation 被静默丢弃致 62.5% 用户指令蒸发」的先例）
const cov = L.typeCoverage ?? {};
const covKeys = Object.keys(cov);
const missing = censusTypes.filter((t) => !(t in cov));
const extra = covKeys.filter((t) => !censusTypes.includes(t));
if (missing.length) fail('COVERAGE', `${missing.length} 种 type 未表态：${missing.join(', ')}`);
if (extra.length) fail('COVERAGE', `${extra.length} 种 type 不在普查全集里（普查过期？）：${extra.join(', ')}`);
for (const [t, v] of Object.entries(cov)) {
  if (typeof v !== 'string' || !/^(mapped|ignored:.+)$/.test(v)) {
    fail('COVERAGE', `type "${t}" 的表态 "${v}" 非法，只接受 "mapped" 或 "ignored:<理由>"`);
  }
}

// ③ 费用不得出现（磊哥六点第 5 条）
// 🔴 这两个子树的 key 是**顶层 type 的名字**，不是数据字段名。
// `typeCoverage['cost-state'] = 'ignored:费用状态——已拍板不展示'` 恰恰是在
// 声明「不展示费用」，语义与本门要防的正好相反。字面门对这种语义反转天然失明，
// 所以按子树豁免，而不是把 'cost' 从词表里删掉（删了会漏掉真的费用字段）。
const COST_EXEMPT = new Set(['typeCoverage', 'typeCounts']);
const walk = (n, p = '$', top = null) => {
  if (n && typeof n === 'object') {
    for (const [k, v] of Object.entries(n)) {
      const inExempt = top !== null ? COST_EXEMPT.has(top) : COST_EXEMPT.has(k);
      if (!inExempt && /cost|usd|price|spend/i.test(k)) fail('NO-COST', `${p}.${k} 出现费用字段`);
      walk(v, `${p}.${k}`, top ?? k);
    }
  }
};
walk(L);
// 豁免不是免检：豁免子树里只允许出现"表态字符串"与计数，不允许出现金额
for (const sub of COST_EXEMPT) {
  for (const [k, v] of Object.entries(L[sub] ?? {})) {
    if (typeof v === 'number') continue;                    // 计数
    if (typeof v === 'string' && /^(mapped|ignored:)/.test(v)) continue; // 表态
    fail('NO-COST', `${sub}.${k} 的值 "${v}" 不是表态或计数，豁免不适用`);
  }
}

// ④ 数字自洽：totals 必须能由 sessions 重算出来，不许手写
const sessions = Array.isArray(L.sessions) ? L.sessions : null;
if (!sessions) fail('SHAPE', 'sessions 不是数组');
else if (L.totals) {
  // sessions 是**明细**（--top 截断），totals 是**全量** —— 两者本就不相等。
  // 但截断必须被显式声明，否则"有意截断"与"统计漏了"症状完全相同。
  const d = L.sessionsDetail;
  if (!d) {
    fail('TRUNCATION', 'sessions 是明细子集却没有 sessionsDetail 声明，无法区分"有意截断"与"统计漏了"');
  } else {
    if (d.included !== sessions.length) fail('TRUNCATION', `sessionsDetail.included=${d.included}，实际数组 ${sessions.length}`);
    if (L.totals?.sessions !== undefined && d.total !== L.totals.sessions) {
      fail('RECOUNT', `sessionsDetail.total=${d.total} 与 totals.sessions=${L.totals.sessions} 不符`);
    }
    if (sessions.length > d.total) fail('RECOUNT', `明细 ${sessions.length} 条多于全量 ${d.total} 条`);
  }
  // 明细内部仍须自洽：明细里出现的 project / seat 必须都在各自的名册里
  const pids = new Set((L.projects ?? []).map((x) => x.id));
  const sids = new Set((L.seats ?? []).map((x) => x.id ?? x));
  const badP = [...new Set(sessions.map((s) => s.project))].filter((x) => x && !pids.has(x));
  const badS = [...new Set(sessions.map((s) => s.seat))].filter((x) => x && !sids.has(x));
  if (badP.length) fail('ROSTER', `${badP.length} 个 project 不在 projects 名册：${badP.slice(0, 5).join(', ')}`);
  if (badS.length) fail('ROSTER', `${badS.length} 个 seat 不在 seats 名册：${badS.slice(0, 5).join(', ')}`);
}

// ⑤ 隐私粒度门（异源调研 agy 报出、对照 ledger 亲核属实的两条 + 同理推得的第三条）
// 秒级时间戳可与公开 GitHub commit 逐条对齐；精确 token 数对已知文档是确定性指纹。
// 识别到的风险必须进门，否则下次改 reducer 会静默回归。
if (sessions) {
  const badT = sessions.filter((s) => typeof s.t0 === 'number' && s.t0 % 3600 !== 0).length;
  if (badT) fail('PRIVACY', `${badT} 条 session 的 t0 未粗化到小时（秒级时间戳可与公开 commit 对齐）`);
  const badD = sessions.filter((s) => 'dur' in s).length;
  if (badD) fail('PRIVACY', `${badD} 条 session 仍带精确 dur（应为量级桶 db）`);
  const badDB = sessions.filter((s) => !Number.isInteger(s.db) || s.db < 0 || s.db > 5).length;
  if (badDB) fail('PRIVACY', `${badDB} 条 session 的 db 桶索引非法`);
  const exact = sessions.filter((s) => 'tokens' in s).length;
  if (exact) fail('PRIVACY', `${exact} 条 session 仍带精确 tokens 字段（应为量级桶 tk）`);
  const badB = sessions.filter((s) => !Number.isInteger(s.tk) || s.tk < 0 || s.tk > 6).length;
  if (badB) fail('PRIVACY', `${badB} 条 session 的 tk 桶索引非法`);
}

// 🔴 同一事实会换口袋：会话级 tokens 早已分箱，但精确总量原来还留在 totals 和 days 里，
// 而本门只扫 sessions[] —— 门全绿而指纹仍在公开 JSON 中（异源会话审计 P0-3 实证）。
// 判据必须覆盖「这个事实可能出现的所有层」，不只覆盖当初发现它的那一层。
if (L.totals && 'tokens' in L.totals) {
  fail('PRIVACY', 'totals 仍带精确 tokens 总量（精确 token 数对已知文档是确定性指纹）');
}
const daysWithTokens = Array.isArray(L.days) ? L.days.filter((d) => 'tokens' in d).length : 0;
if (daysWithTokens) {
  fail('PRIVACY', `${daysWithTokens} 天仍带精确 tokens（同上，按日粒度可加总还原）`);
}
// 收据摘要只作唯一键，不做可对外校验的完整性指纹（R1 拍板：只存前 12 位）
const badSha = Array.isArray(L.receipts)
  ? L.receipts.filter((r) => typeof r.sha256 === 'string' && !/^[0-9a-f]{12}$/.test(r.sha256)).length
  : 0;
if (badSha) {
  fail('PRIVACY', `${badSha} 枚收据的 sha256 不是 12 位摘要（全量 sha256 = 可校验指纹）`);
}

// ⑥ 溯源：ledger 必须能说出自己是从多少输入产生的，且与普查对得上
const g = L.generatedFrom ?? {};
if (g.lines !== undefined && g.lines !== census.lines) {
  fail('PROVENANCE', `generatedFrom.lines=${g.lines} 与普查 ${census.lines} 不符`);
}

// —— 分母永远先打印 ——
console.log('分母：');
console.log(`  普查    ${census.files} 文件 / ${census.lines} 行 / ${censusTypes.length} 种 type`);
console.log(`  ledger  ${sessions ? sessions.length : '—'} 条 session / ${covKeys.length} 条 type 表态`);
console.log(`  已表态  mapped ${Object.values(cov).filter((v) => v === 'mapped').length} · ignored ${Object.values(cov).filter((v) => String(v).startsWith('ignored')).length}`);
if (bad.length === 0) {
  console.log('\n✅ 数据正确性门通过');
  process.exit(0);
}
console.log(`\n🔴 ${bad.length} 条违规：`);
for (const b of bad) console.log('  ' + b);
process.exit(1);
