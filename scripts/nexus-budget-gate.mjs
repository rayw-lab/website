#!/usr/bin/env node
/**
 * 墨迹 · Ink Ledger —— 展厅脚本子预算门（charter W-d：三道子预算**分别**断言，禁只查合计）。
 *   引擎 ink/**            ≤ 30KB gzip
 *   滚动/手卷/印抽屉/试墨   ≤ 12KB gzip   = 展厅自有内联段 + 非引擎外链 chunk
 *   数据装载（JS）          ≤  4KB gzip   = 解析/装载数据的脚本——本厅没有独立装载器（Flow 脚本内联解析，已计入上一行），记 0
 *   数据岛（JSON 载荷）      ≤ 60KB gzip   = 页内 data-flow-data 等 JSON 岛；口径来自草案 §3.1（ledger ≤60KB gzip），
 *                                            🔴 不是 §4 的 4KB——那是 JS 分项。首版把 JSON 岛塞进 4KB 门当场误红（同口径纪律）。
 * 🔴 量法两条硬规（异源反核 glm W7 指出的盲区）：
 *   1) 外链必须沿 import 图追到底——引擎 chunk 只被 Trial/Flow/Yin import，不在 <script src> 里，
 *      只数 src/modulepreload 会把 9KB 引擎整个漏掉；
 *   2) 内联段必须按特征串隔离出"展厅自己的"，全站的主题切换/统计脚本不算本厅预算。
 * 退出码：0 全过；1 任一子预算超标或产物缺失。无论红绿先打印分母。
 */
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HTML = join(ROOT, 'dist/world/agent-nexus/index.html');
const CAP = { engine: 30 * 1024, motion: 12 * 1024, loader: 4 * 1024, island: 60 * 1024 };
const OWN_KEYS = [['手卷 Scroll', ['data-strip', 'data-scroll-']], ['印阵 Seal', ['data-nexus-seals', 'data-drawer']], ['收官 Epilogue', ['data-copy-target', 'nx-speaker']], ['试墨 Trial', ['__nexusTrialDry']]];

if (!existsSync(HTML)) { console.error(`✖ 产物缺失：${HTML}（先 pnpm build）`); process.exit(1); }
const gz = (s) => gzipSync(Buffer.isBuffer(s) ? s : Buffer.from(s)).length;
const html = readFileSync(HTML, 'utf8');

// ① 内联段
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
let own = 0;
for (const [name, keys] of OWN_KEYS) {
  const segs = inline.filter((x) => keys.some((k) => x.includes(k)));
  const b = segs.reduce((a, x) => a + gz(x), 0);
  own += b;
  console.log(`  内联 ${name.padEnd(12)} ${segs.length} 段 ${String(b).padStart(6)} B`);
}
// ② 数据岛
const dataIslands = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const data = dataIslands.reduce((a, x) => a + gz(x), 0);
// ③ 外链沿 import 图
const start = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g), ...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
const seen = new Map();
const todo = start.map((u) => join(ROOT, 'dist', u.replace(/^\/website/, '')));
while (todo.length) {
  const f = todo.pop();
  if (seen.has(f) || !existsSync(f)) continue;
  const src = readFileSync(f, 'utf8');
  seen.set(f, gz(src));
  for (const m of src.matchAll(/(?:from|import\()\s*["'](\.\/[^"']+\.js)["']/g)) todo.push(join(dirname(f), m[1]));
}
let engine = 0, ext = 0;
for (const [f, b] of seen) { console.log(`  外链 ${basename(f).padEnd(58)} ${String(b).padStart(6)} B`); if (/^Ink/.test(basename(f))) engine += b; else ext += b; }
const motion = own + ext;
console.log(`分母：内联 ${inline.length} 段（本厅 ${own} B）· 外链 ${seen.size} 个 · 数据岛 ${dataIslands.length} 个`);
const loader = 0; // 无独立装载脚本；见头注
const rows = [['引擎 ink/**', engine, CAP.engine], ['滚动/手卷/印抽屉/试墨', motion, CAP.motion], ['数据装载（JS）', loader, CAP.loader], ['数据岛（JSON，§3.1 口径）', data, CAP.island]];
let bad = 0;
for (const [n, v, c] of rows) { const ok = v <= c; if (!ok) bad++; console.log(`  ${ok ? '✅' : '🔴'} ${n.padEnd(22)} ${String(v).padStart(6)} B / ${c} B`); }
if (seen.size === 0) { console.error('🔴 一个外链 chunk 都没追到——量法本身失效，不能判绿'); process.exit(1); }
process.exit(bad ? 1 : 0);
