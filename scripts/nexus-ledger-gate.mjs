#!/usr/bin/env node
// ── 墨迹 · Ink Ledger · 发布安全门 ──────────────────────────────────────────────
// 职责边界（写死）：本门只做「公开发布前的泄露扫描」（凭证/私钥/PII/本机路径/内网拓扑），
// 不校验数据正确性、字段模式或业务完整性；JSON 解析失败按「无法验证→不放行」处理，不等于判数据有错。
// 退出码：0=通过；1=存在违规（或 --selftest 断言失败）；2=无法运行/无法验证（文件缺失、解析失败、门自身异常）。
// 教训（一手实证）：上一版用 ark- 前缀扫全仓命中 16 处 park-path/park-chip/park-car/park-slot，
// 全部零安全含义。本门因此 a) 不设任何 ark- 词根规则；b) 全部规则要求高特异性结构；
// c) 把 park-* 16 条与 `ark-[a-z]*` 字面探针写进 --selftest 绿样本作回归。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_FILE = new URL('../src/data/nexus-ledger.json', import.meta.url);

/* ── 原文规则：对每个字符串值（及数字的字符串形式）逐条 matchAll ── */
const RAW_RULES = [
  { id: 'vendor-token',
    // 拦：已知厂商凭证前缀。不拦：sk- 后含连字符的 slug（sk-illustration-2024，因要求 ≥20 连续字母数字）、
    //      park-*（无 ark- 词根规则）、URL/uuid/semver。
    re: /sk-[A-Za-z0-9]{20,}|sk-proj-[A-Za-z0-9_-]{40,}|sk-ant-[A-Za-z0-9_-]{30,}|(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|glpat-[A-Za-z0-9_-]{20,}|npm_[A-Za-z0-9]{36}/g },
  { id: 'private-key-block',
    // 拦：PEM 私钥头（RSA/EC/OPENSSH/PGP/ENCRYPTED）。不拦：BEGIN CERTIFICATE / PUBLIC KEY（公开物料可发布）。
    re: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----/g },
  { id: 'jwt',
    // 拦：三段式 JWT（前两段以 eyJ 开头，即 base64 后的 "{"）。不拦：普通 base64、uuid、semver。
    re: /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
  { id: 'email',
    // 拦：真实域邮箱（PII）。不拦：@scope/pkg、pkg@1.2.3（@ 后非字母 TLD）、example.com/.test/.invalid/.localhost 保留域。
    re: /[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g,
    allow: (m) => /@(?:example\.(?:com|org|net|edu)|example|test|invalid|localhost)$/i.test(m) },
  { id: 'fs-path-windows',
    // 拦：盘符绝对路径 X:\… 或 X:/…。不拦：URL（https 的 s: 前有字母，被 lookbehind 排除）、相对路径。
    re: /(?<![\w/])[A-Za-z]:[\\/][^\s"'<>|]{2,}/g },
  { id: 'fs-path-unix',
    // 拦：/home /Users /root /etc /var /tmp /opt /srv /mnt /media /Volumes /Library 开头的本机绝对路径。
    // 不拦：相对路径 src/data/…、URL 内 path（前一字符为字母、:、/、- 时排除）、/various 类单词（目录名后须跟 / 或词边界）。
    re: /(?<![\w:/.-])\/(?:home|root|Users|etc|var|tmp|opt|srv|mnt|media|Volumes|Library)(?:\/[^\s"']{1,80})?(?![\w-])/g },
  { id: 'cn-mobile',
    // 拦：大陆手机号 1[3-9]+9 位（可选 +86）。不拦：13 位毫秒时间戳、长数字串内嵌段（前后数字边界排除）。
    re: /(?<![\d-])(?:\+?86)?1[3-9]\d{9}(?!\d)/g },
  { id: 'private-ipv4',
    // 拦：RFC1918 内网地址（10/8、192.168/16、172.16–31）。不拦：公网 IP、三段 semver（10.1.2）、更长点分串。
    re: /(?<![\d.])(?:10\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3})\.\d{1,3}(?![\d.])/g },
];

/* ── 结构化规则 sensitive-key：键名像凭证 且 值像「活体」才判违规 ── */
const SENSITIVE_KEY_RE = /(?:api[-_]?key|apikey|client[-_]?secret|secret|pass(?:word|wd)|pwd|private[-_]?key|access[-_]?key|auth[-_]?token|bearer|credential|token)/i;
// 键名白名单减除：分页游标与统计字段（nextPageToken / max_tokens / tokenCount …）不是秘密。
const BENIGN_KEY_RE = /(?:page[-_]?token|next[-_]?token|continuation[-_]?token|cursor[-_]?token|token[-_]?(?:count|limit|total|budget|izer|type|name|symbol|kind)|max[-_]?tokens?)/i;
// 值占位符：空壳、REDACTED、${API_KEY}、process.env.X、<your-key-here>、change-me 等一律不拦。
const PLACEHOLDER_VALUE_RE = /^(?:<[^>]*>|\$\{[^}]*\}|\$[A-Z0-9_]+|process\.env\.[A-Za-z0-9_]+|env::?[A-Za-z0-9_]+|(?:change[-_]?me|changeme|placeholder|example|sample|dummy|fake|redact(?:ed)?|mask(?:ed)?|none|null|undefined|todo|tbd|not[-_]?set|your[-_]?key|n\/a|xxx+|-+|_+|\.+|\*)(?:[-_.][a-z0-9]{1,8}){0,3})$/i;

/* ── 核心扫描 ── */
function scanRawString(s, out, jpath) {
  for (const rule of RAW_RULES) {
    for (const m of s.matchAll(rule.re)) {
      if (rule.allow && rule.allow(m[0])) continue;
      out.push({ rule: rule.id, path: jpath, match: m[0] });
    }
  }
}

function looksLiveSecret(v) {
  const t = v.trim();
  return t.length >= 16 && /\d/.test(t) && !PLACEHOLDER_VALUE_RE.test(t);
}

function scanNode(node, jpath, ctx) {
  if (Array.isArray(node)) {
    ctx.counters.arrays++;
    node.forEach((v, i) => scanNode(v, `${jpath}[${i}]`, ctx));
    return;
  }
  if (node !== null && typeof node === 'object') {
    ctx.counters.objects++;
    for (const [k, v] of Object.entries(node)) {
      const child = `${jpath}.${k}`;
      if (typeof v === 'string' && SENSITIVE_KEY_RE.test(k) && !BENIGN_KEY_RE.test(k) && looksLiveSecret(v)) {
        ctx.violations.push({ rule: 'sensitive-key', path: child, match: v });
      }
      scanNode(v, child, ctx);
    }
    return;
  }
  ctx.counters.fields++; // 标量叶子：string/number/boolean/null 都计入分母
  if (typeof node === 'string') ctx.counters.strings++;
  scanRawString(String(node), ctx.violations, jpath);
}

function gateText(text) {
  let root;
  try { root = JSON.parse(text); }
  catch (e) { return { fatal: `JSON 解析失败（无法验证 → 不放行）：${e.message}` }; }
  const counters = { objects: 0, arrays: 0, fields: 0, strings: 0 };
  const violations = [];
  scanNode(root, '$', { counters, violations });
  const records = Array.isArray(root) ? root.length
    : (root !== null && typeof root === 'object') ? Object.keys(root).length : 1;
  return { bytes: Buffer.byteLength(text, 'utf8'), records, counters, violations };
}

function gateFile(file) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); }
  catch (e) { return { fatal: `无法读取 ${file}：${e.message}` }; }
  return gateText(raw);
}

/* ── 报告 ── */
function mask(m) {
  const s = String(m);
  return s.length <= 8 ? `***(${s.length} 字符)` : `${s.slice(0, 6)}***(${s.length} 字符)`;
}

function printResult(file, res) {
  if (res.fatal) { console.error(`⛔ ${file}：无法验证 —— ${res.fatal}`); return 2; }
  const n = res.violations.length;
  console.log(`分母：1 个文件 / ${res.bytes} 字节 / ${res.records} 条顶层记录 / ${res.counters.objects} 个对象 + ${res.counters.arrays} 个数组 / ${res.counters.fields} 个字段值（其中字符串 ${res.counters.strings} 个）`);
  console.log(`规则：${RAW_RULES.length} 条原文规则 + 1 条结构化键名规则，对全部字符串值与数字全量扫描`);
  if (n === 0) { console.log(`✅ ${file}：通过（0 违规）`); return 0; }
  console.log(`❌ ${file}：${n} 条违规`);
  res.violations.forEach((v, i) => {
    console.log(`  [${i + 1}/${n}] 规则=${v.rule} 路径=${v.path} 命中=${mask(v.match)}`);
  });
  return 1;
}

/* ── selftest：正控（会红）+ 负控（会放）双闭合 ── */
const PARK_16 = [
  'park-path', 'park-path-enter', 'park-path-exit', 'park-path-curve',
  'park-chip', 'park-chip-active', 'park-chip-hover', 'park-chip-drag',
  'park-car', 'park-car-idle', 'park-car-turn', 'park-car-park',
  'park-slot', 'park-slot-empty', 'park-slot-full', 'park-slot-select',
];

const FIXTURES = [
  { name: '红：假 key（vendor-token）', expect: 'red', rule: 'vendor-token',
    obj: { memo: '使用的 key: sk-FAKE1234567890ABCDEFfake1234' } },
  { name: '红：敏感键名+活体值（sensitive-key）', expect: 'red', rule: 'sensitive-key',
    obj: { api_key: 'abcdefgh1234567890' } },
  { name: '红：绝对路径 Windows（fs-path-windows）', expect: 'red', rule: 'fs-path-windows',
    obj: { trace: 'dump at C:\\Users\\alice\\secrets.txt' } },
  { name: '红：绝对路径 Unix（fs-path-unix）', expect: 'red', rule: 'fs-path-unix',
    obj: { trace: 'crash at /home/alice/core-2024.log' } },
  { name: '红：邮箱（email）', expect: 'red', rule: 'email',
    obj: { contact: 'zhang.san@corp-mail.com' } },
  { name: '红：PEM 私钥头（private-key-block）', expect: 'red', rule: 'private-key-block',
    obj: { pem: '-----BEGIN OPENSSH PRIVATE KEY-----\nb25lIHdvcmQ6IGRvbnQ=\n-----END OPENSSH PRIVATE KEY-----' } },
  { name: '红：JWT（jwt）', expect: 'red', rule: 'jwt',
    obj: { session: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c' } },
  { name: '红：手机号（cn-mobile）', expect: 'red', rule: 'cn-mobile',
    obj: { phone: '13812345678' } },
  { name: '红：内网 IPv4（private-ipv4）', expect: 'red', rule: 'private-ipv4',
    obj: { node: '10.0.0.7' } },
  { name: '绿：park-* 回归 + 近似词 + 占位符（负控：证明会放）', expect: 'green',
    obj: {
      park: PARK_16, // 16 条回归，对应 src/lab/modules/tts-cockpit/ 的真实命中
      probe: "rg 'ark-[a-z]*' 只应命中 park-* 系列词",
      slug: 'sk-illustration-2024', // sk- 后带连字符 → 不是 key
      api: { apiKey: '<your-key-here>', api_key: '${API_KEY}', secret: 'REDACTED' },
      paging: { nextPageToken: 'pg_0042_nextchunk', tokenCount: 512, max_tokens: 4096 },
      contact: 'doc-owner@example.com', // 保留文档域
      repo: 'npm install @types/node', // @scope/pkg
      url: 'https://ink.example.org/v1/records',
      version: 'v1.2.3-rc.1',
      ts_ms: 1700000000000, // 13 位毫秒时间戳
      note: '相对路径 src/data/nexus-ledger.json 不属于本机绝对路径',
    } },
];

function runSelftest() {
  let failed = 0;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ink-gate-'));
  try {
    FIXTURES.forEach((fx, i) => {
      const f = path.join(dir, `fx-${i}-${fx.expect}.json`);
      fs.writeFileSync(f, JSON.stringify(fx.obj, null, 2), 'utf8');
      const res = gateFile(f);
      if (res.fatal) { failed++; console.log(`❌ selftest [${fx.name}]：无法验证 —— ${res.fatal}`); return; }
      const red = res.violations.length > 0;
      if (fx.expect === 'red') {
        const hit = res.violations.some((v) => v.rule === fx.rule);
        if (red && hit) {
          console.log(`✅ 会红 [${fx.name}] → 规则 ${[...new Set(res.violations.map((v) => v.rule))].join(',')}`);
        } else {
          failed++;
          console.log(`❌ selftest [${fx.name}]：期望红（规则 ${fx.rule}），实际 ${red ? '红但规则不符' : '绿'} → ${JSON.stringify(res.violations.map((v) => v.rule))}`);
        }
      } else {
        if (!red && res.counters.strings >= PARK_16.length) {
          console.log(`✅ 会绿 [${fx.name}] → strings=${res.counters.strings}（含 park-* 回归 ${PARK_16.length} 条），violations=0`);
        } else {
          failed++;
          console.log(`❌ selftest [${fx.name}]：期望绿，实际红 → ${JSON.stringify(res.violations.map((v) => ({ rule: v.rule, path: v.path })))}`);
        }
      }
    });
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* 清理失败不影响结论 */ }
  }
  const reds = FIXTURES.filter((f) => f.expect === 'red').length;
  console.log(failed
    ? `❌ selftest 失败 ${failed} 项（共 ${FIXTURES.length} 样本：红 ${reds} / 绿 ${FIXTURES.length - reds}）`
    : `✅ selftest 全部通过：${FIXTURES.length} 样本（红 ${reds} / 绿 ${FIXTURES.length - reds}），门确实会拦也确实会放`);
  return failed ? 1 : 0;
}

/* ── 入口 ── */
function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) process.exit(runSelftest());
  const fileArg = argv.find((a) => !a.startsWith('--'));
  const target = fileArg ? path.resolve(fileArg) : fileURLToPath(DEFAULT_FILE);
  process.exit(printResult(target, gateFile(target)));
}

try { main(); } catch (e) {
  console.error(`⛔ 门自身异常（视为无法验证 → 不放行）：${e && e.stack ? e.stack : e}`);
  process.exit(2);
}
