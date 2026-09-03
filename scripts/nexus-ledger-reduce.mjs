#!/usr/bin/env node
/**
 * nexus-ledger-reduce.mjs — 「墨迹 · Ink Ledger」离线归约器（仅运维机运行，绝不进前端 bundle）
 *
 * 数据流：本机 agent 会话 JSONL（逐行流式读，单文件可达数百 MB，绝不整文件/整目录进内存）
 *   → 白名单项目准入（不匿名化，直接不进）→ 逐会话聚合为元数据 → 天级聚合 → Top-N 明细
 *   → 派单目录（可选，--dispatch）→ spans / artifacts / receipts → 序列化
 *   → 全文脱敏 → 脱敏自检（fail-closed，不过不落盘）→ 写 JSON + LEDGER-RECEIPT.md
 *
 * 产物：src/data/nexus-ledger.json（schema: ink-ledger/v1，契约见草案 §3.1）
 *      evidence/nexus-hall/LEDGER-RECEIPT.md（源清单 / 条数 / 丢弃原因 / 版本 SHA）
 *
 * 草案没写死、由本脚本拍定的点（注释即 ADR，gate 可对照）：
 * 1) 输出落盘路径按任务硬约束取 src/data/nexus-ledger.json；草案 §3.1 的 public/demo/... 落点
 *    由接线波次用同一份文件对齐，本脚本不双写（单一事实源）。
 * 2) generatedAt：幂等硬约束（同输入→同字节）禁止墙钟与随机。取所有入账源文件与派单文件的
 *    最大 mtime（UTC、秒精度）。输入不变 ⇒ 输出逐字节不变。
 * 3) Claude Code 行格式口径（字段名按实测防御式读取）：
 *    turns = 含非空 text 块的 assistant 消息数；tools = tool_use 块数；
 *    patches ∈ {Edit, Write, MultiEdit, NotebookEdit}；
 *    tokens = Σ(input_tokens + output_tokens)。cache_* 不计：跨轮重复累计会放大数倍，
 *    而墨量半径只取对数近似， 宁小勿假。
 *    compacted = isCompactSummary === true 计数；
 *    aborted = 文本含 "Request interrupted" 计数（Claude 格式无结构化中断事件，此为近似口径，
 *    已在 LEDGER-RECEIPT 声明）。
 * 4) Codex 行格式口径：turns = event_msg:task_started 计数；patches = patch_apply_end 计数；
 *    aborted = turn_aborted；compacted = context_compacted；
 *    tokens = token_count 事件数值累加（近似，仅用于 log 半径）；model/effort 取最后一个 turn_context；
 *    项目准入用 session_meta.cwd 命中白名单，cwd 缺失或白名单外 → 整会话丢弃。
 * 5) hollow（空心环/留白）：草案只对「Cursor 父代理且 patch_apply_end=0」定义；此处泛化为
 *    patches === 0（未落任何文件改动即空心）。Cursor 纯编排会话全部命中，语义不损，规则可解释。
 * 6) 天桶用 UTC：本地时区会让同一输入在不同 TZ 机器产出不同天界，破坏幂等。
 * 7) Top-N 取样分 score = tokens + dur*100 + tools*200 + (compacted+aborted)*5000
 *    （保事件性会话进明细）；一切排序带哈希平票决断，绝不依赖 Map 迭代序或文件系统序。
 * 8) total_cost_usd：不读取、不输出（磊哥拍板）。Grok/agy 的 job 以 --dispatch 的 receipt.json
 *    三态映射收编；`grok -p` modelUsage 直读不在本版输入范围（任务书默认输入为会话 jsonl 目录）。
 * 9) projects 白名单 = 草案 §3.2 候选（NEEDS_LEIGE 确认前生效）；正则同时作用于 slug
 *    （-Users-*-Projects-x）与 cwd（/Users/<user>/Projects/x），分隔符用 [\/-] 兼容两种形态；
 *    先长后短，防前缀误吞。workspace/raw 的「仅 loop-commander / skills-distilled 子树」
 *    约束 slug 级无法判定，先整目录放行，磊哥确认白名单时收紧。
 * 10) prompts 正文一律不取（草案说"可关"，本版拍死为永久关）：redact 门红线是 ≥120 字自然语言，
 *     只留 bytes + mtime 最稳。
 * 11) 新增 totals 加法字段：前端"只渲染不计算"硬约束需要 sessions/seats/days/tokens 等现成数字，
 *     draft schema 未含，属允许的加法（§3.1 在 N2 trace 上加法）。
 * 12) Cursor 目录含用户名，默认不启用，需显式 --cursor 传入（见 --help 示例）。
 *
 * 运行示例：
 *   node scripts/nexus-ledger-reduce.mjs
 *   node scripts/nexus-ledger-reduce.mjs \
 *     --claude ~/.claude/projects \
 *     --codex  ~/.codex/sessions \
 *     --cursor ~/.cursor/projects/Users-wanglei-mywebsite/agent-transcripts \
 *     --dispatch cc-buildings-2026-09-02=~/.codex/state/cc-buildings-brainstorm
 */
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

/* ---------------- 常量：席位 / 白名单 / 脱敏 ---------------- */

// 墨分五色映射为「已定设计选择」，批评者不重评（草案 §1.3）。
const SEATS = [
  { id: 'codex', label: 'Codex', tone: '焦' },
  { id: 'claude-code', label: 'Claude Code', tone: '浓' },
  { id: 'cursor', label: 'Cursor', tone: '重' },
  { id: 'grok', label: 'Grok', tone: '淡' },
  { id: 'agy', label: 'agy', tone: '清' },
  { id: 'api-direct', label: 'api_direct', tone: '清' },
];
const VALID_SEATS = new Set(SEATS.map((s) => s.id));
const TONE_BY_SEAT = new Map(SEATS.map((s) => [s.id, s.tone]));

// 白名单（NEEDS_LEIGE）：顺序即匹配序，先长后短。
// p00 = 跨项目派单席（agy / api-direct 的 job 不归属单一仓库）。
// 草案 §「墨分五色」把 grok/agy/api-direct 明列为**席位**（已定设计选择），
// 所以它们必须产出墨滴，不能只作 dispatch 记录 —— 否则五色永远只出三色。
const DISPATCH_PROJECT = { id: 'p00', label: '派单', topic: 'dispatch' };
const PROJECT_RULES = [
  { id: 'p01', label: 'co-agent-cline-unification', topic: 'skill', re: /[\/-]Projects[\/-]co-agent-cline-unification(?:[\/-]|$)/ },
  { id: 'p02', label: 'co-agent', topic: 'skill', re: /[\/-]Projects[\/-]co-agent(?:[\/-]|$)/ },
  { id: 'p03', label: 'agent-tmux-stack-research', topic: 'subagent', re: /[\/-]Projects[\/-]agent-tmux-stack-research/ },
  { id: 'p04', label: 'smux', topic: 'subagent', re: /[\/-]Projects[\/-]smux(?:[\/-]|$)/ },
  { id: 'p05', label: 'tmux-bridge-mcp', topic: 'subagent', re: /[\/-]Projects[\/-]tmux-bridge-mcp(?:[\/-]|$)/ },
  { id: 'p06', label: 'oh-my-codex', topic: 'harness', re: /[\/-]oh-my-codex(?:[\/-]|$)/ },
  { id: 'p07', label: 'hermes-agent-upstream', topic: 'harness', re: /[\/-]hermes-agent-upstream/ },
  { id: 'p08', label: 'grok-build', topic: 'models', re: /[\/-]grok-build(?:[\/-]|$)/ },
  { id: 'p09', label: 'workspace-raw', topic: 'tips', re: /[\/-]workspace[\/-]raw(?:[\/-]|$)/ },
  { id: 'p10', label: 'mywebsite', topic: 'harness', re: /[\/-]mywebsite(?:[\/-]|$)/ },
];
// 显式排除（即便未来误入白名单也拦下）；其余一律视为白名单外直接丢弃。
const DENY_RULES = [
  { re: /(?:^|[-/])private-tmp-/, why: '探针目录' },
  { re: /[\/-]Documents[\/-]Codex-/, why: '文档目录' },
  { re: /[\/-]MAformac(?:[\/-]|$)/, why: '客户目录' },
  { re: /[\/-]lark-/, why: '客户目录' },
  { re: /[\/-]huasheng-/, why: '客户目录' },
  { re: /[\/-]scout-r0(?:[\/-]|$)/, why: '客户目录' },
];

const PATCH_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

const REDACTED = '[REDACTED]';
// key/token 形态（整体连前缀一起替换，避免 gate grep 'sk-' 残留）。sha256 为 64 位 hex，
// 不含这些前缀，不受影响——gate 要求 receipts[].sha256 保持 ^[0-9a-f]{64}$。
const TOKEN_PATTERNS = [
  /sk-[A-Za-z0-9_-]{6,}/g,
  /ark-[A-Za-z0-9._-]{4,}/g,
  /ghp_[A-Za-z0-9]{16,}/g,
  /github_pat_[A-Za-z0-9_]{16,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,
  /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/gi,
  /(api[_-]?key|access[_-]?token|secret|password|authorization)["']?\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{8,}/gi,
];
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9]{2,}/g;
const PATH_RE = /\/(?:Users|home|root)\/[A-Za-z0-9._-]+/g; // /Users/<name>、/home/<name> → ~
// 落盘前自检（fail-closed）：任何命中 = 中止，不写任何文件。脱敏是本脚本的责任。
const GATE_FORBIDDEN = [
  { re: /\/Users\//, why: '绝对路径 /Users/' },
  { re: /\/home\/[A-Za-z0-9]/, why: '绝对路径 /home/' },
  { re: /\bsk-[A-Za-z0-9]/, why: 'sk- 形态 key' },
  { re: /\bark-[A-Za-z0-9]{4}/, why: 'ark- 形态 key' },
  { re: /api[_-]?key/i, why: 'api_key 字样' },
  { re: /access[_-]?token/i, why: 'access_token 字样' },
  { re: EMAIL_RE.source, why: '邮箱' },
];

let SCRUB_NAMES = []; // 运行期由 home basename / userInfo / --scrub 填充

/* ---------------- 全局可变状态（单进程 CLI，模块级即可） ---------------- */

const STATS = { src: [], filesTotal: 0, filesEmpty: 0, parseErrors: 0, droppedRoots: 0, droppedRootFiles: 0, droppedSessions: 0 };
const RAW_SESSIONS = [];
const NOTES = [];
let maxMtimeMs = 0; // generatedAt 的确定性来源

/* ---------------- 小工具 ---------------- */

function fail(msg) {
  console.error(`nexus-ledger-reduce: ${msg}`);
  process.exit(1);
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function expandHome(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}
function tildify(p) {
  const h = os.homedir();
  return p.startsWith(h) ? '~' + p.slice(h.length) : p;
}
function isoSeconds(ms) {
  return new Date(Math.floor(ms / 1000) * 1000).toISOString().replace(/\.000Z$/, 'Z');
}
function posInt(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
}
function tsOf(obj) {
  const t = typeof obj.timestamp === 'string' ? Date.parse(obj.timestamp) : NaN;
  return Number.isFinite(t) ? t : null;
}
function noteTime(ms) {
  if (ms > maxMtimeMs) maxMtimeMs = ms;
}
function matchProject(str) {
  if (typeof str !== 'string' || !str) return null;
  for (const d of DENY_RULES) if (d.re.test(str)) return null; // 显式排除优先
  for (const r of PROJECT_RULES) if (r.re.test(str)) return r;
  return null;
}
async function safeReaddirDirents(root) {
  try { return await fs.readdir(root, { withFileTypes: true }); } catch { return []; }
}
async function listJsonl(root) {
  try {
    const rels = await fs.readdir(root, { recursive: true });
    return rels.filter((p) => p.endsWith('.jsonl')).sort().map((rel) => path.join(root, rel));
  } catch { return []; }
}
async function listAllFiles(root) {
  try {
    const rels = (await fs.readdir(root, { recursive: true })).sort();
    const out = [];
    for (const rel of rels) {
      const abs = path.join(root, rel);
      const st = await fs.stat(abs); // 失败则整个 walk 抛错走 catch，行为一致
      if (st.isFile()) out.push({ rel, abs, st });
    }
    return out;
  } catch { return null; }
}
function sha256File(abs) {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    const rs = createReadStream(abs);
    rs.on('data', (d) => h.update(d));
    rs.on('error', reject);
    rs.on('end', () => resolve(h.digest('hex')));
  });
}

/* ---------------- 行级解析（Claude Code / Codex 两种格式） ---------------- */

/**
 * 顶层 type 的处置策略 —— 契约全集必须逐项显式表态。
 *
 * 🔴 为什么必须有这张表：本机有「整类 queue-operation 被静默丢弃、
 * 导致 62.5% 用户指令蒸发而四路下游无一察觉」的先例。没有这张表时，
 * 一个类型是"处理了"还是"掉进默认分支"从产物上完全看不出来。
 *
 * mapped   = 该类型的字段真的进了统计
 * ignored: = 有意不取，冒号后必须写理由（写不出理由 = 你还没想清楚）
 *
 * 依据 claudeLine 的实际消费面：带 `message` 的行（assistant/user）进统计，
 * assistant 额外特判 turns；其余类型无 message 字段，读到即早退。
 */
const TYPE_POLICY = {
  assistant: 'mapped',
  user: 'mapped',
  attachment: 'ignored:含文件内容与 hook 输出快照，只构成上下文不构成协作形状，且是最大的敏感面',
  'queue-operation': 'ignored:排队指令的入队/出队事件，不是会话轮次',
  'last-prompt': 'ignored:提示词原文，白名单之外一律不取内容',
  mode: 'ignored:UI 模式切换，与协作形状无关',
  'permission-mode': 'ignored:权限模式切换，同上',
  'ai-title': 'ignored:自动生成的会话标题，可能含项目内容',
  system: 'ignored:系统提示注入，含 harness 内部信息',
  'atis-latch': 'ignored:harness 内部状态锁',
  'bridge-session': 'ignored:桥接会话标识，无展示价值',
  'agent-name': 'ignored:子代理名，W3 席位维度改由 seat 字段承载',
  'custom-title': 'ignored:用户自定义标题，可能含项目内容',
  'file-history-snapshot': 'ignored:文件内容快照，敏感面',
  'file-history-delta': 'ignored:文件差异，敏感面',
  'pr-link': 'ignored:外链，W4 题跋另行手工挑选',
  'frame-link': 'ignored:外链，同上',
  'cost-state': 'ignored:费用状态 —— 磊哥已拍板不展示',
  started: 'ignored:低频启动事件',
  result: 'ignored:低频结果事件',
  'fork-context-ref': 'ignored:上下文分叉引用',
  'artifact-autoreact-ledger': 'ignored:artifact 自动回复台账',
  'artifact-comment-monitor': 'ignored:artifact 评论监听',
  // 🔴 2026-09-04 04:5x 由 fail-closed 门当场拦下：它在同日 03:5x 的普查里还不存在，
  // 是这一小时内新产生的类型。正是「写死的清单不会自己长大，只在新类型出现那天才爆」。
  turn_ended: 'ignored:轮次结束事件；turns 已由 assistant 消息计数，重复计会翻倍',
  // —— Codex 侧（codexLine 的 switch 实际消费前四种）——
  session_meta: 'mapped',
  turn_context: 'mapped',
  event_msg: 'mapped',
  response_item: 'mapped',
  world_state: 'ignored:世界状态快照，含工作区路径与文件树',
  inter_agent_communication_metadata: 'ignored:agent 间通信元数据，与协作形状无关',
  compacted: 'ignored:压缩标记；compacted 计数已由 event_msg 的 context_compacted 承担',
  token_usage_record: 'ignored:用量明细；tokens 已由 event_msg 的 token_count 累计，重复计会翻倍',
};
/** 扫描过程中真实遇到的顶层 type（用于产出 typeCoverage 并做 fail-closed 校验） */
const SEEN_TYPES = new Map();

function claudeLine(s, obj) {
  if (typeof obj.type === 'string') SEEN_TYPES.set(obj.type, (SEEN_TYPES.get(obj.type) ?? 0) + 1);
  const ts = tsOf(obj);
  if (ts !== null) {
    if (s.t0 === null || ts < s.t0) s.t0 = ts;
    if (s.t1 === null || ts > s.t1) s.t1 = ts;
  }
  if (obj.isSidechain === true) s.sidechain = true;
  if (obj.isCompactSummary === true) s.compacted += 1;
  const msg = obj.message;
  if (!msg || typeof msg !== 'object') return;
  // '<synthetic>' 是错误合成消息的占位模型名，不能当真实 served model 记账。
  if (typeof msg.model === 'string' && msg.model && msg.model !== '<synthetic>') s.model = msg.model;
  const u = msg.usage;
  if (u && typeof u === 'object') s.tokens += posInt(u.input_tokens) + posInt(u.output_tokens);
  if (!Array.isArray(msg.content)) return;
  let hasText = false;
  for (const c of msg.content) {
    if (!c || typeof c !== 'object') continue;
    if (c.type === 'text' && typeof c.text === 'string' && c.text.trim()) {
      hasText = true;
      if (c.text.includes('Request interrupted')) s.aborted += 1; // 近似口径，见头部注释 3)
    } else if (c.type === 'tool_use' && typeof c.name === 'string') {
      s.tools += 1;
      if (PATCH_TOOLS.has(c.name)) s.patches += 1;
    }
  }
  if (obj.type === 'assistant' && hasText) s.turns += 1;
}

/**
 * Cursor transcript 的时间戳**不是标准字段**，而是嵌在用户消息正文里的标签：
 *   <timestamp>Monday, Aug 24, 2026, 11:27 AM (UTC+8)</timestamp>
 * 人类可读串，`Date.parse` 不认括号里的时区，必须先规范化。
 * 取不到时间戳的文件会被 aggregateFile 整条丢弃（静默），所以此处解析成功率
 * 必须随料交付 —— 见 --selftest-cursor 的正控。
 */
const CURSOR_TS_RE =
  /<timestamp>\s*(?:[A-Za-z]+day,\s*)?([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4},\s*\d{1,2}:\d{2}\s*(?:AM|PM))\s*\(UTC([+-]\d{1,2})(?::?(\d{2}))?\)/i;
function cursorTs(text) {
  const m = CURSOR_TS_RE.exec(text);
  if (!m) return null;
  const sign = m[2].startsWith('-') ? '-' : '+';
  const hh = String(Math.abs(Number(m[2]))).padStart(2, '0');
  const mm = m[3] ?? '00';
  const t = Date.parse(`${m[1]} GMT${sign}${hh}${mm}`);
  return Number.isFinite(t) ? t : null;
}

function cursorLine(s, obj) {
  // 每个 line 函数都必须记 SEEN_TYPES，否则改分派逻辑会让某类 type 悄悄从
  // typeCoverage 里消失（本轮实证：cursor 由 claudeLine 改走 cursorLine 后，
  // turn_ended 立刻从覆盖表蒸发，被正确性门当场抓住）。
  if (typeof obj.type === 'string') SEEN_TYPES.set(obj.type, (SEEN_TYPES.get(obj.type) ?? 0) + 1);
  const msg = obj.message;
  const content = msg && Array.isArray(msg.content) ? msg.content : null;
  if (!content) return;
  let hasText = false;
  for (const c of content) {
    if (!c || typeof c !== 'object') continue;
    if (c.type === 'text' && typeof c.text === 'string') {
      if (c.text.trim()) hasText = true;
      const ts = cursorTs(c.text);
      if (ts !== null) {
        if (s.t0 === null || ts < s.t0) s.t0 = ts;
        if (s.t1 === null || ts > s.t1) s.t1 = ts;
      }
    } else if (c.type === 'tool_use') {
      s.tools += 1;
      // 只计数、不记工具名：自定义工具名本身可能含客户/项目代号（agy 漏洞②）
      if (typeof c.name === 'string' && PATCH_TOOLS.has(c.name)) s.patches += 1;
    }
  }
  if (obj.role === 'assistant' && hasText) s.turns += 1;
}

function codexLine(s, obj) {
  if (typeof obj.type === 'string') SEEN_TYPES.set(obj.type, (SEEN_TYPES.get(obj.type) ?? 0) + 1);
  const ts = tsOf(obj);
  if (ts !== null) {
    if (s.t0 === null || ts < s.t0) s.t0 = ts;
    if (s.t1 === null || ts > s.t1) s.t1 = ts;
  }
  const p = obj.payload && typeof obj.payload === 'object' ? obj.payload : {};
  switch (obj.type) {
    case 'session_meta':
      if (typeof p.cwd === 'string') s.cwd = p.cwd;
      if (typeof p.originator === 'string') s.originator = p.originator;
      break;
    case 'turn_context':
      if (typeof p.model === 'string' && p.model) s.model = p.model.slice(0, 80);
      if (typeof p.effort === 'string' && p.effort) s.effort = p.effort.slice(0, 16);
      break;
    case 'event_msg':
      if (p.type === 'task_started') s.turns += 1;
      else if (p.type === 'turn_aborted') s.aborted += 1;
      else if (p.type === 'context_compacted') s.compacted += 1;
      else if (p.type === 'patch_apply_end') s.patches += 1;
      else if (p.type === 'token_count') s.tokens += tokenCountOf(p);
      break;
    case 'response_item': {
      const rt = p.type;
      if (rt === 'function_call' || rt === 'custom_tool_call' || rt === 'web_search_call' || rt === 'local_shell_call') s.tools += 1;
      break;
    }
    default:
      break;
  }
}

function tokenCountOf(p) {
  const i = p.info && typeof p.info === 'object' ? p.info : {};
  for (const v of [i.total_token_count, p.total_token_count, p.token_count, p.count]) {
    const n = posInt(v);
    if (n > 0) return n;
  }
  return 0;
}

/* ---------------- 逐文件流式聚合 ---------------- */

async function aggregateFile(abs, seat, projKey) {
  STATS.filesTotal += 1;
  let st;
  try { st = await fs.stat(abs); } catch { STATS.filesEmpty += 1; return 0; }
  noteTime(st.mtimeMs);
  const s = {
    seat, project: projKey, t0: null, t1: null,
    turns: 0, tools: 0, patches: 0, tokens: 0,
    model: null, effort: null, compacted: 0, aborted: 0, sidechain: false, cwd: null,
    // 平票决断用哈希（源路径含用户名，只留哈希绝不外泄）
    hash: createHash('sha256').update(seat + '\u0000' + abs).digest('hex').slice(0, 16),
  };
  const mapLine = seat === 'codex' ? codexLine : seat === 'cursor' ? cursorLine : claudeLine;
  const rl = readline.createInterface({
    input: createReadStream(abs, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const t = line.trim();
    if (!t) continue;
    let obj;
    try { obj = JSON.parse(t); } catch { STATS.parseErrors += 1; continue; }
    if (obj && typeof obj === 'object') mapLine(s, obj);
  }
  if (s.t0 === null) { STATS.filesEmpty += 1; return 0; } // 无任何时间戳：空/坏文件，不入账
  if (seat === 'codex') {
    // Codex 的项目准入只能来自内容里的 session_meta.cwd
    const rule = s.cwd ? matchProject(s.cwd) : null;
    if (!rule) { STATS.droppedSessions += 1; return 0; }
    s.project = rule.id;
  }
  RAW_SESSIONS.push(s);
  return 1;
}

/* ---------------- 派单目录（S0 洇 / receipts） ---------------- */

const DISPATCH_ACC = { dispatches: [], receiptsRaw: [] };

/** 从 job_id 里的 `-YYYYMMDD-HHMMSS-` 解析本机本地时刻（这些 job 由本机生成） */
function jobIdTime(id) {
  const m = /-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})-/.exec(id);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number);
  const t = new Date(y, mo - 1, d, h, mi, s).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * 把派单席的每个 job 建模成一次会话（= 一滴墨）。
 * 每个 `jobs/<id>/receipt.json` 一滴：时长取 elapsed_s，轮数取 response_ids_seen（无则 1），
 * token 取 usage.total_tokens（无则 0），身份未通过或非零退出计 aborted。
 */
async function aggregateJobs(dir, seat) {
  let jobsRoot = path.join(dir, 'jobs');
  try { await fs.access(jobsRoot); } catch { jobsRoot = dir; }
  let ents;
  try { ents = await fs.readdir(jobsRoot, { withFileTypes: true }); } catch { return 0; }
  let kept = 0;
  for (const e of ents) {
    if (!e.isDirectory()) continue;
    const rf = path.join(jobsRoot, e.name, 'receipt.json');
    let r, st;
    try {
      st = await fs.stat(rf);
      r = JSON.parse(await fs.readFile(rf, 'utf8'));
    } catch { continue; }
    noteTime(st.mtimeMs);
    const t0 = jobIdTime(r.job_id ?? e.name) ?? st.mtimeMs;
    const durMs = Math.max(0, Math.round((Number(r.elapsed_s) || 0) * 1000));
    const tok = Number(r?.usage?.total_tokens) || 0;
    const bad = r.identity_ok === false || (r.exit_code != null && r.exit_code !== 0) || Boolean(r.error);
    RAW_SESSIONS.push({
      seat, project: DISPATCH_PROJECT.id, t0, t1: t0 + durMs,
      turns: Math.max(1, Number(r.response_ids_seen) || 1),
      tools: 0, patches: 0, tokens: tok,
      model: r.served_model ?? r.served_label ?? r.requested_model ?? null,
      effort: r.reasoning_effort_sent ?? null,
      compacted: 0, aborted: bad ? 1 : 0, sidechain: false, cwd: null,
      hash: createHash('sha256').update(seat + '\u0000' + rf).digest('hex').slice(0, 16),
    });
    kept += 1;
  }
  return kept;
}

async function buildDispatch(entry) {
  const files = await listAllFiles(entry.dir);
  if (!files || files.length === 0) {
    NOTES.push(`dispatch ${entry.id}: 目录不存在或为空，已跳过`);
    return;
  }
  const artifacts = [];
  const prompts = [];
  let minM = Infinity;
  let maxM = 0;
  let truncated = 0;
  for (const f of files) {
    noteTime(f.st.mtimeMs);
    minM = Math.min(minM, f.st.mtimeMs);
    maxM = Math.max(maxM, f.st.mtimeMs);
    const role = f.rel.startsWith('out/') ? 'out'
      : f.rel.startsWith('logs/') ? 'log'
      : f.rel.startsWith('prompts/') ? 'prompt'
      : 'file';
    if (role === 'prompt') { prompts.push({ rel: f.rel, mtimeMs: f.st.mtimeMs, bytes: f.st.size }); continue; }
    if (artifacts.length >= 400) { truncated += 1; continue; } // 体积预算：按 rel 排序截断，确定性
    const art = { path: f.rel, bytes: f.st.size, role, sha256: null };
    if (role === 'out') art.sha256 = await sha256File(f.abs); // gate 要求 ^[0-9a-f]{64}$
    artifacts.push(art);
  }
  prompts.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  // spans：本版以文件 mtime 推导相对毫秒（保底可渲染）；真实 lane 阶梯字段出现后按 N2 §5.3 替换。
  const spans = prompts.map((p) => ({
    kind: 'agent',
    name: path.basename(p.rel),
    t0: Math.max(0, Math.round(p.mtimeMs - minM)),
    durationMs: 0,
  }));
  spans.push({ kind: 'gate', name: 'dispatch-close', t0: Math.max(0, Math.round(maxM - minM)), durationMs: 0 });
  DISPATCH_ACC.dispatches.push({
    id: entry.id,
    displayName: entry.id,
    startedAt: isoSeconds(minM),
    durationMs: Math.max(0, Math.round(maxM - minM)),
    spans,
    artifacts,
  });
  const receiptFiles = files.filter((f) => f.rel === 'receipt.json' || /^receipts\/[^/]+\.json$/.test(f.rel));
  for (const rf of receiptFiles) {
    let buf;
    try { buf = await fs.readFile(rf.abs); } catch { continue; }
    let raw;
    try { raw = JSON.parse(buf.toString('utf8')); } catch {
      NOTES.push(`dispatch ${entry.id}: ${rf.rel} 解析失败，忽略`);
      continue;
    }
    const list = Array.isArray(raw) ? raw : [raw];
    for (const r of list) {
      const seatGuess = r && typeof r === 'object' && typeof r.seat === 'string' && VALID_SEATS.has(r.seat) ? r.seat : 'api-direct';
      DISPATCH_ACC.receiptsRaw.push({ seatGuess, raw: r, shaHex: createHash('sha256').update(buf).digest('hex') });
    }
  }
  if (truncated > 0) NOTES.push(`dispatch ${entry.id}: artifacts 超出 400 上限，截断 ${truncated} 个`);
}

function mapReceipt(id, entry) {
  const p = entry.raw && typeof entry.raw === 'object' ? entry.raw : {};
  const pick = (...keys) => {
    for (const k of keys) if (p[k] !== undefined && p[k] !== null && p[k] !== '') return p[k];
    return null;
  };
  const okRaw = pick('identity_ok', 'identityOk');
  // 三态铁律：缺失 → null，禁止推断为 true（N1/N2 红线）。
  const identityOk = okRaw === true ? true : okRaw === false ? false : null;
  const ecRaw = pick('exit_code', 'exitCode');
  const smRaw = pick('served_model', 'servedModel', 'model');
  const fbRaw = pick('fallback', 'fallback_model', 'fallbackModel');
  const imRaw = pick('identity_match', 'identityMatch');
  return {
    id,
    seat: entry.seatGuess,
    servedModel: typeof smRaw === 'string' ? smRaw.slice(0, 80) : null,
    identityOk,
    identityMatch: typeof imRaw === 'string' ? imRaw.slice(0, 32) : null,
    fallback: typeof fbRaw === 'string' && fbRaw.length <= 64 ? fbRaw : null,
    exitCode: typeof ecRaw === 'number' && Number.isFinite(ecRaw) ? Math.trunc(ecRaw) : null,
    sha256: entry.shaHex, // 对 receipt 文件本体的哈希，确定性
  };
}

/* ---------------- CLI ---------------- */

function printHelp() {
  console.log(`用法：node scripts/nexus-ledger-reduce.mjs [选项]

  --claude <dir>        Claude Code 项目根（可重复；默认 ~/.claude/projects）
  --codex <dir>         Codex sessions 根（可重复，如 ~/.codex/sessions）
  --cursor <dir>        Cursor transcripts 目录（可重复；示例：
                        ~/.cursor/projects/Users-wanglei-mywebsite/agent-transcripts）
  --dispatch <id>=<dir> 派单目录（可重复；扫 receipt.json、receipts/*.json、prompts/、out/、logs/）
  --out <path>          ledger 输出路径（默认 src/data/nexus-ledger.json）
  --receipt <path>      证据文件输出路径（默认 evidence/nexus-hall/LEDGER-RECEIPT.md）
  --top <n>             sessions 明细上限（默认 600，1..5000）
  --scrub <name>        额外强制脱敏词（可重复）
  --help`);
}

function parseArgs(argv) {
  const cfg = { claude: [], codex: [], cursor: [], dispatch: [], scrub: [], out: 'src/data/nexus-ledger.json', receipt: 'evidence/nexus-hall/LEDGER-RECEIPT.md', top: 600 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) fail(`flag ${a} 需要一个值`);
      return v;
    };
    if (a === '--help') { printHelp(); process.exit(0); }
    else if (a === '--claude') cfg.claude.push(expandHome(next()));
    else if (a === '--codex') cfg.codex.push(expandHome(next()));
    else if (a === '--cursor') cfg.cursor.push(expandHome(next()));
    else if (a === '--dispatch') {
      const kv = next();
      const eq = kv.indexOf('=');
      if (eq < 1) fail('--dispatch 需要 <id>=<dir> 形式');
      cfg.dispatch.push({ id: kv.slice(0, eq), dir: expandHome(kv.slice(eq + 1)) });
    } else if (a === '--out') cfg.out = expandHome(next());
    else if (a === '--receipt') cfg.receipt = expandHome(next());
    else if (a === '--top') {
      const n = Number(next());
      if (!Number.isInteger(n) || n < 1 || n > 5000) fail('--top 需为 1..5000 整数');
      cfg.top = n;
    } else if (a === '--scrub') cfg.scrub.push(next());
    else fail(`未知参数 ${a}（--help 查看用法）`);
  }
  if (cfg.claude.length + cfg.codex.length + cfg.cursor.length === 0) {
    cfg.claude.push(path.join(os.homedir(), '.claude', 'projects'));
  }
  return cfg;
}

/* ---------------- 脱敏（落盘前的最后责任人） ---------------- */

function redactAll(text) {
  let out = text.replace(PATH_RE, '~'); // 绝对路径 → ~（先做，顺带移除路径里的用户名）
  for (const re of TOKEN_PATTERNS) out = out.replace(re, REDACTED);
  out = out.replace(EMAIL_RE, REDACTED);
  for (const name of SCRUB_NAMES) out = out.replace(new RegExp(escapeRegExp(name), 'g'), '[USER]');
  return out;
}

function assertClean(text) {
  for (const g of GATE_FORBIDDEN) {
    if (new RegExp(g.re).test(text)) fail(`脱敏自检未通过（${g.why}）——已中止，未写任何文件`);
  }
  for (const name of SCRUB_NAMES) {
    if (text.includes(name)) fail('脱敏自检未通过（用户名残留）——已中止，未写任何文件');
  }
  // 防 prompt 正文漏入（gate 红线：≥120 字连续自然语言；400 字符单行兜底）
  if (/[\u4e00-\u9fff]{120,}/.test(text) || /[^\n]{400,}/.test(text)) {
    fail('脱敏自检未通过（疑似长正文漏入）——已中止，未写任何文件');
  }
}

/* ---------------- 主流程 ---------------- */

async function main() {
  const cfg = parseArgs(process.argv.slice(2));

  // 脱敏词：home 目录名 + 系统用户名（≥4 字符才做字面替换，避免误伤短词）
  const names = new Set(cfg.scrub);
  const homeBase = path.basename(os.homedir());
  if (homeBase && homeBase.length >= 4) names.add(homeBase);
  try {
    const u = os.userInfo().username;
    if (u && u.length >= 4) names.add(u);
  } catch { /* 无 passwd 条目环境，忽略 */ }
  SCRUB_NAMES = [...names].sort();

  /* -- Claude Code：projects/<slug>/**.jsonl，按 slug 判白名单 -- */
  for (const root of cfg.claude) {
    const dirents = await safeReaddirDirents(root);
    if (dirents.length === 0) {
      STATS.src.push({ seat: 'claude-code', root: tildify(root), files: 0, kept: 0, note: '目录不存在或不可读' });
      continue;
    }
    const slugs = dirents.filter((d) => d.isDirectory()).map((d) => d.name).sort();
    if (slugs.length === 0) {
      // 用户直接把某个 slug 目录当根传入：整体按一个项目处理
      const rule = matchProject(root);
      const files = await listJsonl(root);
      let kept = 0;
      if (rule) for (const abs of files) kept += await aggregateFile(abs, 'claude-code', rule.id);
      else { STATS.droppedRoots += 1; STATS.droppedRootFiles += files.length; }
      STATS.src.push({ seat: 'claude-code', root: tildify(root), files: files.length, kept, note: rule ? rule.label : '白名单外，整目录丢弃' });
      continue;
    }
    for (const slug of slugs) {
      const dir = path.join(root, slug);
      const rule = matchProject(slug);
      const files = await listJsonl(dir);
      if (!rule) {
        if (files.length > 0) { STATS.droppedRoots += 1; STATS.droppedRootFiles += files.length; }
        STATS.src.push({ seat: 'claude-code', root: tildify(dir), files: files.length, kept: 0, note: '白名单外，整目录丢弃' });
        continue;
      }
      let kept = 0;
      for (const abs of files) kept += await aggregateFile(abs, 'claude-code', rule.id);
      STATS.src.push({ seat: 'claude-code', root: tildify(dir), files: files.length, kept, note: rule.label });
    }
  }

  /* -- Codex：sessions/**.jsonl，cwd 白名单逐会话判定 -- */
  for (const root of cfg.codex) {
    const files = await listJsonl(root);
    if (files.length === 0) {
      STATS.src.push({ seat: 'codex', root: tildify(root), files: 0, kept: 0, note: '目录不存在或无 jsonl' });
      continue;
    }
    let kept = 0;
    for (const abs of files) kept += await aggregateFile(abs, 'codex', null);
    STATS.src.push({ seat: 'codex', root: tildify(root), files: files.length, kept, note: 'cwd 白名单逐会话判定' });
  }

  /* -- Cursor：transcripts 目录整体作为一个项目（按路径判白名单） -- */
  for (const root of cfg.cursor) {
    const rule = matchProject(root);
    const files = await listJsonl(root);
    let kept = 0;
    if (rule) for (const abs of files) kept += await aggregateFile(abs, 'cursor', rule.id);
    else { STATS.droppedRoots += 1; STATS.droppedRootFiles += files.length; }
    STATS.src.push({ seat: 'cursor', root: tildify(root), files: files.length, kept, note: rule ? rule.label : '白名单外，整目录丢弃' });
  }

  /* -- 派单目录 -- */
  for (const d of cfg.dispatch) {
    await buildDispatch(d);
    // 派单席同时产出墨滴（席位 → 墨分五色），不只是派单记录
    const n = await aggregateJobs(d.dir, d.id);
    STATS.src.push({ seat: d.id, root: tildify(d.dir), files: n, kept: n, note: '派单 job → 会话' });
  }

  if (RAW_SESSIONS.length === 0) {
    fail('没有白名单内的会话数据——检查 --claude/--codex/--cursor 路径与 PROJECT_RULES 白名单。');
  }
  if (maxMtimeMs <= 0) fail('源文件缺少可用 mtime，无法生成确定性 generatedAt。');

  /* -- 聚合与取样（全排序带平票决断，保证幂等） -- */
  const kept = RAW_SESSIONS.map((s) => ({ ...s, dur: Math.max(0, Math.round(((s.t1 ?? s.t0) - s.t0) / 1000)) }));
  const byT0Hash = (a, b) => (a.t0 - b.t0) || (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0);
  kept.sort(byT0Hash);
  const scoreOf = (s) => s.tokens + s.dur * 100 + s.tools * 200 + (s.compacted + s.aborted) * 5000;
  const selected = [...kept]
    .sort((a, b) => (scoreOf(b) - scoreOf(a)) || (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0))
    .slice(0, cfg.top)
    .sort(byT0Hash);

  /** token 量级分箱：返回桶索引（0..6）。展厅只展示量级，不展示精确值。 */
  const TOKEN_EDGES = [1, 5e3, 2e4, 5e4, 2e5, 1e6, Infinity];
  const tokenBucket = (n) => {
    const i = TOKEN_EDGES.findIndex((e) => n < e);
    return i < 0 ? TOKEN_EDGES.length - 1 : i;
  };
  /** 桶中值：半径由它派生，于是半径也随之阶梯化（视觉上反而更贴「墨分五色」） */
  const bucketMid = (b) => {
    const lo = b === 0 ? 0 : TOKEN_EDGES[b - 1];
    const hi = TOKEN_EDGES[b] === Infinity ? 2e6 : TOKEN_EDGES[b];
    return (lo + hi) / 2;
  };
  const inkR = (s) => {
    // 墨量半径：tokens 与时长取对数；2,000,000 tokens 级 ≈ 最浓 1.0。渲染提示，前端不算。
    const size = Math.max(1, bucketMid(tokenBucket(s.tokens)), Math.round(s.dur / 60));
    const r = Math.log10(1 + size) / Math.log10(1 + 2000000);
    return Math.round(Math.min(1, Math.max(0.1, r)) * 1000) / 1000;
  };
  const flagsOf = (s) => {
    const f = [];
    if (s.compacted > 0) f.push('compacted');
    if (s.aborted > 0) f.push('aborted');
    if (s.sidechain) f.push('sidechain');
    if (s.patches === 0) f.push('hollow'); // 留白：泛化口径见头部注释 5)
    return f;
  };

  /* -- 天级聚合（UTC 桶） -- */
  const daysMap = new Map();
  for (const s of kept) {
    const d = new Date(s.t0).toISOString().slice(0, 10);
    let e = daysMap.get(d);
    if (!e) { e = { d, n: 0, bySeat: {}, tokens: 0, aborted: 0, compacted: 0 }; daysMap.set(d, e); }
    e.n += 1;
    e.bySeat[s.seat] = (e.bySeat[s.seat] || 0) + 1;
    e.tokens += s.tokens;
    if (s.aborted > 0) e.aborted += 1;
    if (s.compacted > 0) e.compacted += 1;
  }
  const days = [...daysMap.values()]
    .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0))
    .map((e) => ({
      d: e.d,
      n: e.n,
      bySeat: SEATS.reduce((o, seat) => { // 规范席位序插入，杜绝 Map 序泄漏
        if (e.bySeat[seat.id] !== undefined) o[seat.id] = e.bySeat[seat.id];
        return o;
      }, {}),
      tokens: e.tokens,
      aborted: e.aborted,
      compacted: e.compacted,
    }));

  /* -- receipts / colophons -- */
  const receipts = DISPATCH_ACC.receiptsRaw.map((entry, i) => mapReceipt('r' + String(i + 1).padStart(3, '0'), entry));
  const seals = receipts.map((rc) => {
    const kind = rc.identityOk === null ? 'NULL' : (rc.identityOk === true && rc.exitCode === 0 ? 'GO' : 'NO_GO');
    return { kind, text: kind === 'GO' ? 'identity_ok' : kind === 'NO_GO' ? 'NO_GO' : '无机器收据', receipt: rc.id };
  });
  // 印只挂 models 跋（跋④「谁在答」）；其余四跋的印需磊哥点名真实事件后登记（NEEDS_LEIGE），留空不编造。
  const colophons = ['harness', 'skill', 'subagent', 'models', 'tips'].map((id) => ({
    id,
    seals: id === 'models' ? seals : [],
    binds: [], // rule 公开尺度逐条由磊哥批（草案 §2 硬规），未批前不写绑定
  }));

  /* -- 组装 ledger（固定键序；只输出实际有会话的项目） -- */
  const usedProjects = new Set(kept.map((s) => s.project));
  const idWidth = Math.max(4, String(selected.length).length);
  const totals = {
    sessions: kept.length,
    seats: new Set(kept.map((s) => s.seat)).size,
    days: days.length,
    tokens: kept.reduce((a, s) => a + s.tokens, 0),
    aborted: kept.filter((s) => s.aborted > 0).length,
    compacted: kept.filter((s) => s.compacted > 0).length,
    dispatches: DISPATCH_ACC.dispatches.length,
    receipts: receipts.length,
  };
  const ledger = {
    schemaVersion: 'ink-ledger/v1',
    // 覆盖表态：每个真实出现过的 type 都必须有说法，供 nexus-ledger-verify.mjs 做契约闭合
    typeCoverage: Object.fromEntries([...SEEN_TYPES.keys()].sort().map((t) => [t, TYPE_POLICY[t] ?? 'UNDECLARED'])),
    typeCounts: Object.fromEntries([...SEEN_TYPES.entries()].sort((a, b) => b[1] - a[1])),
    // 明细是截断的（--top）。显式声明，否则下游看到 sessions.length ≠ totals.sessions
    // 分不清是"有意截断"还是"统计漏了"——两者症状完全相同。
    sessionsDetail: { limit: cfg.top, included: selected.length, total: kept.length },
    generatedAt: isoSeconds(maxMtimeMs),
    range: { from: days[0].d, to: days[days.length - 1].d },
    seats: SEATS.map((s) => ({ id: s.id, label: s.label, tone: s.tone })),
    projects: [
      ...PROJECT_RULES.filter((r) => usedProjects.has(r.id)).map((r) => ({ id: r.id, label: r.label, topic: r.topic })),
      // p00 不在 PROJECT_RULES（它不是仓库规则而是跨项目派单席），用到才登记 —— 否则名册门会红
      ...(usedProjects.has(DISPATCH_PROJECT.id) ? [DISPATCH_PROJECT] : []),
    ],
    totals,
    days,
    sessions: selected.map((s, i) => ({
      id: 's' + String(i + 1).padStart(idWidth, '0'),
      seat: s.seat,
      // 🔴 时间戳粗化到小时（异源调研 agy 报出、本席对照 ledger 亲核属实）：
      // 秒级 t0 可与磊哥公开的 GitHub commit 时间逐条对齐，一旦对上，
      // 该「匿名」会话关联的真实仓库与改动即被逆向揭穿。展厅只需要顺序与节奏，
      // 不需要秒 —— 粗化到小时不损失任何视觉信息。
      t0: Math.floor(s.t0 / 1000 / 3600) * 3600,
      // 时长同理粗化到分钟：精确秒数与 token 数一样可用于外部事件对齐。
      dur: 60 * Math.round(s.dur / 60),
      turns: s.turns,
      tools: s.tools,
      patches: s.patches,
      // 🔴 token 分箱（同上，亲核属实）：精确 token 数对已知文档是确定性指纹 ——
      // 用同款 tokenizer 对公开文件本地分词即可碰撞，证明「某日读过这份具体文档」。
      // 展厅表达的是体量量级，个位数精度没有任何展示价值。
      tk: tokenBucket(s.tokens),
      model: s.model,
      effort: s.effort,
      project: s.project,
      flags: flagsOf(s),
      ink: { r: inkR(s), tone: TONE_BY_SEAT.get(s.seat) ?? '浓', hollow: s.patches === 0 },
    })),
    dispatches: DISPATCH_ACC.dispatches,
    colophons,
    receipts,
  };

  /* -- 序列化 → 脱敏 → 自检 → 落盘 -- */
  const selfPath = fileURLToPath(import.meta.url);
  const selfSha = createHash('sha256').update(await fs.readFile(selfPath)).digest('hex').slice(0, 12);
  const json = redactAll(JSON.stringify(ledger, null, 2));
  assertClean(json); // 不过即中止，什么都不写
  const buf = Buffer.from(json + '\n', 'utf8');
  const gz = gzipSync(buf, { level: 9 });
  // 🔴 fail-closed：写死的策略表不会自己长大，新 type 只在它出现的那天才暴露。
  const undeclared = [...SEEN_TYPES.keys()].filter((t) => !(t in TYPE_POLICY));
  if (undeclared.length > 0) {
    console.error(`[nexus-ledger-reduce] 🔴 ${undeclared.length} 种 type 未在 TYPE_POLICY 表态：${undeclared.join(', ')}`);
    console.error('  每种都要显式写成 mapped 或 ignored:<理由>，不许落进默认分支。');
    process.exit(1);
  }
  const ledgerSha = createHash('sha256').update(buf).digest('hex');

  await fs.mkdir(path.dirname(cfg.out), { recursive: true });
  await fs.writeFile(cfg.out, buf);

  /* -- LEDGER-RECEIPT.md（运维证据；源目录 ~ 化，不含正文） -- */
  const L = [];
  L.push('# LEDGER-RECEIPT · nexus-ledger-reduce', '');
  L.push(`- reducer: scripts/nexus-ledger-reduce.mjs @ sha256:${selfSha}`);
  L.push(`- 确定性: generatedAt = 源最大 mtime（${ledger.generatedAt}），无墙钟、无随机，同输入重跑逐字节一致`);
  L.push(`- ledger: ${cfg.out} · ${buf.length} bytes · gzip ${gz.length} bytes · sha256 ${ledgerSha}`);
  L.push(`- 会话: 入账 ${totals.sessions} · 明细 ${ledger.sessions.length}（top ${cfg.top}）· 席位 ${totals.seats} · 天 ${totals.days}`);
  L.push('', '## 源清单', '', '| 席位 | 源目录 | jsonl | 入账 | 备注 |', '|---|---|---:|---:|---|');
  for (const s of STATS.src) L.push(`| ${s.seat} | ${s.root} | ${s.files} | ${s.kept} | ${s.note} |`);
  L.push('', '## 丢弃与原因', '');
  L.push(`- 白名单外整目录: ${STATS.droppedRoots}（涉及文件 ${STATS.droppedRootFiles}）`);
  L.push(`- 白名单外单会话（codex cwd 判定）: ${STATS.droppedSessions}`);
  L.push(`- 空会话/不可读文件: ${STATS.filesEmpty}`);
  L.push(`- 行级 JSON 解析失败（跳过该行）: ${STATS.parseErrors}`);
  L.push('', '## 派单与备注', '');
  if (NOTES.length === 0) L.push('- 无');
  for (const n of NOTES) L.push(`- ${n}`);
  L.push('', '## 口径要点', '', '- turns/tools/patches/tokens 口径见脚本头部注释；total_cost_usd 不读取、不输出。');
  L.push('- identityOk 三态：缺失即 null，从不推断 true；prompts 正文永不入 ledger。', '');
  await fs.mkdir(path.dirname(cfg.receipt), { recursive: true });
  await fs.writeFile(cfg.receipt, L.join('\n'), 'utf8');

  console.log(`[nexus-ledger-reduce] 会话 ${totals.sessions} 条（明细 ${ledger.sessions.length}）· 天 ${totals.days} · 席位 ${totals.seats}`);
  console.log(`[nexus-ledger-reduce] ledger → ${cfg.out}（${buf.length}B / gzip ${gz.length}B）`);
  console.log(`[nexus-ledger-reduce] receipt → ${cfg.receipt}`);
  if (gz.length > 60 * 1024) {
    console.warn('[nexus-ledger-reduce] 警告：gzip 超出 60KB 预算——收紧 --top 或白名单后重跑');
  }
}

main().catch((e) => fail(e && e.stack ? e.stack : String(e)));
