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
const walk = (n, p = '$') => {
  if (n && typeof n === 'object') {
    for (const [k, v] of Object.entries(n)) {
      if (/cost|usd|price|spend/i.test(k)) fail('NO-COST', `${p}.${k} 出现费用字段`);
      walk(v, `${p}.${k}`);
    }
  }
};
walk(L);

// ④ 数字自洽：totals 必须能由 sessions 重算出来，不许手写
const sessions = Array.isArray(L.sessions) ? L.sessions : null;
if (!sessions) fail('SHAPE', 'sessions 不是数组');
else if (L.totals) {
  const recount = {
    sessions: sessions.length,
    projects: new Set(sessions.map((s) => s.project)).size,
    seats: new Set(sessions.map((s) => s.seat)).size,
  };
  for (const [k, v] of Object.entries(recount)) {
    if (L.totals[k] !== undefined && L.totals[k] !== v) {
      fail('RECOUNT', `totals.${k}=${L.totals[k]}，由 sessions 重算得 ${v}`);
    }
  }
}

// ⑤ 溯源：ledger 必须能说出自己是从多少输入产生的，且与普查对得上
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
