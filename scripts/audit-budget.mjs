#!/usr/bin/env node
/**
 * audit-budget.mjs —— 产物体积预算审计（SRD §11.2 ④，Track D · D2 + D4；
 *                     v2.0 Full Entry 改造：CC-E8，SRD §12.7.2 / 实施方案 §4.4）
 *
 * 用法：node scripts/audit-budget.mjs [dist/]
 *
 * 门禁（★ = CI 阻断级，SRD/roadmap 原文阈值，不降级）：
 *   ★ G-A 宪法首页首屏传输 < 200KB gzip（不含字体，C-3/NFR-P2）；> 120KB 仅警告（常态目标）。
 *          v2.0 考核对象：dist/home/index.html（CC-E7 路由切换后）；切换前继续考核 dist/index.html
 *          ——切换探测器 = dist/home/index.html 是否存在（E7_SWITCHED），日志明示当前口径。
 *   ★ G-B 宪法首页分项预算（NFR-P2 核算表）：HTML+CSS ≤ 35KB、Hero poster ≤ 40KB、
 *          JS ≤ 15KB（GSAP 专项审批通过后放宽至 80KB——修改 JS_CAP_KB 需附审批记录）、图标 ≤ 30KB
 *   ★ G-C 宪法首页关键路径零重资产：three chunk / 模型(.glb/.gltf) / HDRI(.hdr) / KTX2 = 0（NFR-P2）
 *   ☆ G-A′ `/` 科技城入口壳专项（SRD §12.7.2 / NFR-P6，CC-E8 新增）：
 *          壳静态段（交互/自动挂载前）HTML+CSS ≤ 35KB / 引导 JS ≤ 15KB / poster ≤ 40KB /
 *          合计 ≤ 90KB gzip；壳 HTML 静态标签零重资产 + 零 world 字节——world 分包只许经
 *          引导脚本动态 import，禁止 three/GLB/HDRI/world chunk 的 <script src>/<link rel=preload>。
 *          过渡纪律（实施方案 §4.4 / A2 §6）：E7 切换前 `/` 仍是宪法 HTML 首页，体积分项按
 *          SOFT 档执行（超限仅 WARN 分类打印，不阻断）；零重资产/零 world 静态标签恒为硬断言
 *          （现行首页天然满足，不构成误伤）。E7 切换后（E7_SWITCHED=true）体积分项转硬阻断。
 *   ★ G-D 宪法首页与全部内容页对 world 零字节依赖（NFR-P6/AP-9，D4 断言预埋；
 *          <a href> 导航链接豁免——Start here 按钮 = 一个 <a> + 一段 CSS）。
 *          v2.0 排除表：E7 切换后根 index.html（`/` 科技城壳）移出保护表——壳引导脚本
 *          合法引用 world 分包，由 G-A′ 接管考核；切换前根 index.html 仍受 G-D 全额保护
 *          （SRD §12.7.2「排除表只加根 index.html 一行」，条件生效防过渡期裸奔）。
 *   ★ G-E public/ 总量 ≤ 40MB（SRD §12.6，v1.1 上调，含 world 12MB 预留）
 *   ★ G-F 资产格式黑名单：public/ 与 dist/ 中禁止 .wav / .blend / .band / *encoder*
 *          （folio-2025 的 129MB wav 母带教训，roadmap §8.2 纪律 1）
 *     G-G Lab 模块预算对照 manifest budget 声明（NFR-P4）：实测超声明 +10% 告警；
 *          超预算级上限（S≤50KB/1MB、M≤300KB/6MB、world≤900KB/12MB，§12.7.2）阻断。
 *          流式豁免（SRD §10.1 预算表注*）：模块声明 budget.streaming{dir,singleFetchKbMax}
 *          时，磁盘资产不按全量一刀切，改为实测 public/{dir} 内每个文件 ≤ 单次拉取上限——
 *          实测不达标则豁免不成立、照常阻断（豁免声明本身不构成放行）。
 *          manifest 未建（C2 未交付）时跳过并明示。
 *   ★ G-G(world) world 预算直测（CC-E8，A2 审计 §6 过渡纪律 (b)）：对 dist/_astro/ 内
 *          world 命名 chunk 直接量测 gzip 合计 ≤ 900KB（JS 全量上限），对 world 资产池
 *          （public/models + public/hdri + public/textures/city）量测合计 ≤ 12MB（流式总额）
 *          ——不依赖 manifest 注册（避免 manifest 先行在 Lab 索引渲染死卡片），world 模块
 *          注册块作为占位补丁留档于 eng-wave1-notes CC-E8 小节，与 CC-E7 同 PR 激活；
 *          激活后本直测与 manifest 声明校验双轨并行、互为对照。
 *
 * 预算表输出到 stdout；CI 中同时写入 $GITHUB_STEP_SUMMARY（PR 可见，SRD「预算表进 PR 注释」的落地形式）。
 * 零依赖（Node 内建 zlib/fs）。KB = 1024 字节；gzip 用 zlib 默认压缩级（贴近托管端实际传输）。
 */

import { readFileSync, existsSync, statSync, readdirSync, appendFileSync } from 'node:fs';
import { join, resolve, posix, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import process from 'node:process';

const DIST = resolve(process.argv[2] ?? 'dist');
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const PUBLIC_DIR = join(ROOT, 'public');

const KB = 1024;
const MB = 1024 * KB;

/* ———— 阈值（SRD/roadmap 原文；改动任何一行必须在 PR 中附规格出处） ———— */
const TOTAL_CAP_KB = 200;    // C-3 硬门禁：首页首屏 < 200KB gzip（不含字体）
const TOTAL_NORM_KB = 120;   // C-3 常态目标：≤ 120KB（超出仅警告）
const HTMLCSS_CAP_KB = 35;   // NFR-P2
const POSTER_CAP_KB = 40;    // NFR-P2
const JS_CAP_KB = 15;        // NFR-P2（GSAP 专项审批后放宽至 80——见文件头注释）
const ICON_CAP_KB = 30;      // NFR-P2
const PUBLIC_CAP_MB = 40;    // SRD §12.6
const SHELL_TOTAL_CAP_KB = 90;   // SRD §12.7.2：`/` 壳静态段 ≤ 90KB gzip（G-A′）
const SHELL_HTMLCSS_CAP_KB = 35; // SRD §12.7.2：壳 HTML+CSS ≤ 35KB
const SHELL_JS_CAP_KB = 15;      // SRD §12.7.2：壳引导 JS ≤ 15KB
const SHELL_POSTER_CAP_KB = 40;  // SRD §12.7.2：壳 poster ≤ 40KB
const BLACKLIST = [/\.wav$/i, /\.blend\d*$/i, /\.band$/i, /encoder/i]; // roadmap §8.2
const BUDGET_CLASS_CAPS = {  // SRD §12.6 / §12.7.2
  S: { jsKb: 50, assetsMb: 1 },
  M: { jsKb: 300, assetsMb: 6 },
  world: { jsKb: 900, assetsMb: 12 }, // JS 全量 ≤900KB gzip；分区流式合计 ≤12MB
};
/** world 资产池目录（相对 public/；G-G(world) 直测口径，SRD §12.7.2 流式 12MB 总额） */
const WORLD_ASSET_DIRS = ['models', 'hdri', 'textures/city'];

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(`✖ 产物目录不存在：${DIST}（先执行 pnpm build）`);
  process.exit(1);
}

/* ---------- 通用工具 ---------- */

function readAstroConfig() {
  let base = '/';
  try {
    const cfg = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8');
    const m = cfg.match(/\bbase:\s*['"]([^'"]+)['"]/);
    if (m) base = m[1];
  } catch { /* 根路径站点 */ }
  if (!base.startsWith('/')) base = `/${base}`;
  return base.replace(/\/+$/, '');
}
const BASE = readAstroConfig();

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function gzipKb(filePath) {
  return gzipSync(readFileSync(filePath)).length / KB;
}

const fmtKb = (n) => `${n.toFixed(1)}KB`;

/** 解析 HTML 标签属性（Astro 静态产物足够规整，正则可靠） */
function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? '';
  }
  // 布尔属性（如 <img loading=lazy> 之外的 defer/async 等此处用不到）
  return attrs;
}

/** 从 HTML 提取「资源类」引用（不含 <a href> 导航链接） */
function extractResources(html) {
  const out = [];
  const TAG_RE = /<(link|script|img|source|video|audio|iframe)\b[^>]*>/gi;
  for (const m of html.matchAll(TAG_RE)) {
    const tagName = m[1].toLowerCase();
    const attrs = parseAttrs(m[0]);
    if (tagName === 'link') {
      const rel = (attrs.rel ?? '').toLowerCase();
      if (!attrs.href) continue;
      // stylesheet / icon / preload / modulepreload / manifest 是资源；canonical/alternate 等不是
      if (/(stylesheet|icon|preload|modulepreload|manifest|apple-touch-icon)/.test(rel)) {
        out.push({ url: attrs.href, tagName, rel, as: (attrs.as ?? '').toLowerCase() });
      }
      continue;
    }
    if (tagName === 'script' && attrs.src) {
      out.push({ url: attrs.src, tagName });
      continue;
    }
    if (attrs.src) out.push({ url: attrs.src, tagName, loading: (attrs.loading ?? '').toLowerCase(), fetchpriority: (attrs.fetchpriority ?? '').toLowerCase() });
    if (attrs.poster) out.push({ url: attrs.poster, tagName: 'video-poster' });
    if (attrs.srcset) {
      for (const part of attrs.srcset.split(',')) {
        const url = part.trim().split(/\s+/)[0];
        if (url) out.push({ url, tagName, loading: (attrs.loading ?? '').toLowerCase() });
      }
    }
  }
  return out;
}

const EXTERNAL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** 内部资源 URL → dist 内文件路径（返回 null = 外部或无法解析） */
function toDistFile(url, fromHtmlPath) {
  let u = url;
  if (EXTERNAL_RE.test(u)) return null;
  const cut = (s, ch) => (s.includes(ch) ? s.slice(0, s.indexOf(ch)) : s);
  u = cut(cut(u, '#'), '?');
  if (u === '') return null;
  let abs;
  if (u.startsWith('/')) {
    if (BASE && BASE !== '/' && (u === BASE || u.startsWith(`${BASE}/`))) abs = u.slice(BASE.length) || '/';
    else if (BASE && BASE !== '/') return null; // 未带 base 的根路径引用由 check-links 报错
    else abs = u;
  } else {
    const dir = posix.dirname(`/${posix.relative(DIST, fromHtmlPath).split(posix.sep).join('/')}`);
    abs = posix.normalize(posix.join(dir, u));
  }
  const p = join(DIST, decodeURIComponent(abs).replace(/^\/+/, ''));
  return existsSync(p) && statSync(p).isFile() ? p : null;
}

/* ---------- 结果登记 ---------- */

const failures = [];
const warnings = [];
const summaryLines = [];
const say = (line) => { console.log(line); summaryLines.push(line); };

/* ---------- v2.0 路由切换探测器（CC-E8 过渡纪律，实施方案 §4.4） ---------- */
// dist/home/index.html 存在 = CC-E7 路由原子切换已发生（`/` = 科技城壳，`/home/` = 宪法首页）。
// 切换前后考核对象自动跟随，无需二次改脚本——G-A/B/C 重定向、G-A′ 定档、G-D 排除表共用本探测器。
const HOME_HTML = join(DIST, 'home', 'index.html');
const E7_SWITCHED = existsSync(HOME_HTML);

/* ═══════ G-A/G-B/G-C 宪法首页首屏核算 ═══════ */

const FONT_RE = /\.(woff2?|ttf|otf|eot)$/i;
const HEAVY_RE = /\.(glb|gltf|hdr|ktx2|bin|draco)$/i;
// 「world」作为完整词段（以路径分隔符 / . _ - 或串首尾为界）即命中：
// 覆盖 /world/ 目录、world.HASH.js chunk、world-spike、*-world-* 资产命名。
const WORLD_RE = /(^|[/._-])world([/._-]|$)/i;

/**
 * 单页首屏资源核算（G-A/B/C 与 G-A′ 共用）：
 * 返回逐资源行、分类小计、合计、外部域清单与重资产/world 静态标签命中。
 */
function collectFirstView(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  const htmlKb = gzipSync(Buffer.from(html)).length / KB;
  const relSelf = posix.relative(DIST, htmlPath);

  const rows = [{ res: `${relSelf}（含内联 CSS/JS）`, cat: 'html+css', kb: htmlKb }];
  const externals = [];
  const heavyHits = [];
  const worldHits = [];
  const seen = new Set();

  for (const r of extractResources(html)) {
    if (EXTERNAL_RE.test(r.url)) { externals.push(r.url); continue; }
    const file = toDistFile(r.url, htmlPath);
    const relName = file ? posix.relative(DIST, file) : r.url;
    if (seen.has(relName)) continue;
    seen.add(relName);
    // world 静态标签命中不依赖文件存在与否（引导前禁止任何 world 资源标签）
    if (WORLD_RE.test(relName) || WORLD_RE.test(r.url)) worldHits.push(r.url);
    if (!file) continue; // 断链由 check-links 阻断，此处不重复报

    // 字体不计入（C-3「不含字体」）
    if (FONT_RE.test(file) || relName.startsWith('fonts/')) continue;
    // 懒加载图片不计入首屏（loading="lazy" 显式声明在折叠线下）
    if (r.loading === 'lazy') continue;

    const ext = extname(file).toLowerCase();
    let cat = 'other';
    if (r.rel && /stylesheet/.test(r.rel)) cat = 'html+css';
    else if (ext === '.css') cat = 'html+css';
    else if (ext === '.js' || ext === '.mjs') cat = 'js';
    else if (r.rel && /(icon|manifest)/.test(r.rel)) cat = 'icons';
    else if (r.fetchpriority === 'high' || (r.rel === 'preload' && r.as === 'image')) cat = 'poster';
    else if (ext === '.svg' || ext === '.ico') cat = 'icons';
    else if (/\.(webp|avif|png|jpe?g|gif)$/.test(ext)) cat = 'images';

    rows.push({ res: relName, cat, kb: gzipKb(file) });

    // 零重资产命中（G-C / G-A′ 共用）
    if (HEAVY_RE.test(file) || /^(models|hdri)\//.test(relName)) heavyHits.push(relName);
  }

  const sum = (cat) => rows.filter((x) => x.cat === cat).reduce((a, x) => a + x.kb, 0);
  const catTotals = {
    'html+css': sum('html+css'),
    js: sum('js'),
    poster: sum('poster'),
    icons: sum('icons'),
    images: sum('images'),
    other: sum('other'),
  };
  const total = Object.values(catTotals).reduce((a, b) => a + b, 0);
  return { rows, catTotals, total, externals, heavyHits, worldHits };
}

// v2.0 考核对象重定向（SRD NFR-P2 / §11.2 ④）：E7 切换后 = dist/home/index.html；切换前 = dist/index.html
const constitutionPath = E7_SWITCHED ? HOME_HTML : join(DIST, 'index.html');
const constitutionRel = posix.relative(DIST, constitutionPath);

say('');
if (E7_SWITCHED) {
  say('> 口径：CC-E7 路由已切换（dist/home/index.html 存在）——G-A/B/C 考核对象 = `dist/home/index.html`（宪法首页，NFR-P2 v2.0）；`/` 科技城壳由 G-A′ 专项考核。');
} else {
  say('> 口径：过渡期（dist/home/index.html 不存在，CC-E7 未切换）——G-A/B/C 继续考核现行首页 `dist/index.html`；**E7 路由切换后本审计自动改盯 `dist/home/index.html`**（探测器 = home 产物存在性，无需改脚本）。');
}

if (!existsSync(constitutionPath)) {
  failures.push(`${constitutionRel} 不存在——无宪法首页可审计`);
} else {
  const { rows, catTotals, total, externals, heavyHits } = collectFirstView(constitutionPath);

  say('');
  say(`## 宪法首页首屏传输核算（\`${constitutionRel}\`，gzip，不含字体，NFR-P2/C-3）`);
  say('');
  say('| 资源 | 分类 | gzip |');
  say('|------|------|------|');
  for (const rw of rows) say(`| \`${rw.res}\` | ${rw.cat} | ${fmtKb(rw.kb)} |`);
  say(`| **合计** | — | **${fmtKb(total)}** |`);
  say('');
  say(`| 预算项 | 实测 | 上限 | 判定 |`);
  say(`|--------|------|------|------|`);

  const gate = (label, actual, cap, hard = true) => {
    const pass = actual <= cap;
    say(`| ${label} | ${fmtKb(actual)} | ≤ ${cap}KB | ${pass ? '✅' : '❌'} |`);
    if (!pass && hard) failures.push(`G-B ${label} 超预算：${fmtKb(actual)} > ${cap}KB`);
  };
  gate('HTML+CSS', catTotals['html+css'], HTMLCSS_CAP_KB);
  gate('JS', catTotals.js, JS_CAP_KB);
  gate('Hero poster', catTotals.poster, POSTER_CAP_KB);
  gate('图标', catTotals.icons, ICON_CAP_KB);

  const totalPass = total < TOTAL_CAP_KB;
  say(`| **首屏合计（硬门禁）** | **${fmtKb(total)}** | < ${TOTAL_CAP_KB}KB | ${totalPass ? '✅' : '❌'} |`);
  if (!totalPass) failures.push(`G-A 宪法首页首屏合计 ${fmtKb(total)} ≥ ${TOTAL_CAP_KB}KB（C-3 硬门禁，考核对象 ${constitutionRel}）`);
  if (totalPass && total > TOTAL_NORM_KB) {
    warnings.push(`宪法首页首屏合计 ${fmtKb(total)} 超过常态目标 ${TOTAL_NORM_KB}KB（C-3 常态口径，未到 ${TOTAL_CAP_KB}KB 阻断线）`);
  }
  for (const h of heavyHits) {
    failures.push(`G-C 宪法首页关键路径出现重资产：${h}（NFR-P2 要求 three chunk/模型/HDRI = 0，考核对象 ${constitutionRel}）`);
  }
  if (externals.length > 0) {
    say('');
    say(`外部域资源 ${externals.length} 项未计入核算（需人工确认体积，如 GoatCounter count.js < 4KB）：${externals.join('、')}`);
  }
}

/* ═══════ G-A′ `/` 科技城入口壳专项（SRD §12.7.2，CC-E8 新增） ═══════ */

const shellPath = join(DIST, 'index.html');
say('');
say('## `/` 入口壳专项 G-A′（SRD §12.7.2：HTML+CSS ≤35 / 引导 JS ≤15 / poster ≤40 / 合计 ≤90KB gzip）');
say('');
if (!existsSync(shellPath)) {
  failures.push('G-A′ dist/index.html 不存在——`/` 无壳可审计');
} else {
  // 过渡定档（实施方案 §4.4 / A2 §6）：E7 前 `/` = 宪法 HTML 首页，壳体积分项走 SOFT 档
  // （超限仅 WARN，壳预算在 E7 才硬阻断）；E7 后转硬。零重资产/零 world 静态标签两条恒硬。
  const shellHard = E7_SWITCHED;
  say(shellHard
    ? '> 定档：E7 已切换——壳体积分项为**阻断级**；零重资产/零 world 静态标签恒为阻断级。'
    : '> 定档：过渡期 SOFT 档（E7 前 `/` 仍是宪法 HTML 首页，同页已受 G-A/B/C 全额考核）——壳体积分项超限仅 WARN 分类打印，**E7 路由切换后自动转阻断级**；零重资产/零 world 静态标签两条恒为阻断级。');
  say('');

  const shell = collectFirstView(shellPath);
  say(`| 预算项 | 实测 | 上限 | 判定 |`);
  say(`|--------|------|------|------|`);
  const shellGate = (label, actual, cap) => {
    const pass = actual <= cap;
    say(`| ${label} | ${fmtKb(actual)} | ≤ ${cap}KB | ${pass ? '✅' : shellHard ? '❌' : '⚠️ SOFT'} |`);
    if (!pass) {
      if (shellHard) failures.push(`G-A′ 壳${label} 超预算：${fmtKb(actual)} > ${cap}KB（SRD §12.7.2）`);
      else warnings.push(`G-A′[SOFT] 壳${label} ${fmtKb(actual)} > ${cap}KB（过渡期不阻断；E7 切换后转硬）`);
    }
  };
  shellGate('HTML+CSS', shell.catTotals['html+css'], SHELL_HTMLCSS_CAP_KB);
  shellGate('引导 JS', shell.catTotals.js, SHELL_JS_CAP_KB);
  shellGate('poster', shell.catTotals.poster, SHELL_POSTER_CAP_KB);
  shellGate('壳静态段合计', shell.total, SHELL_TOTAL_CAP_KB);

  // 恒硬两条：壳 HTML 静态标签零重资产 + 零 world 字节（world 分包只许经引导脚本动态 import）
  for (const h of shell.heavyHits) {
    failures.push(`G-A′ 壳 HTML 静态标签出现重资产：${h}（SRD §11.2 ④——禁止 three/GLB/HDRI 的 <script src>/<link rel=preload>）`);
  }
  for (const h of shell.worldHits) {
    failures.push(`G-A′ 壳 HTML 静态标签引用 world 字节：${h}（world 分包只允许经引导脚本动态 import，SRD §11.2 ④）`);
  }
  say(`| 静态标签零重资产/零 world | 命中 ${shell.heavyHits.length + shell.worldHits.length} 处 | = 0 | ${shell.heavyHits.length + shell.worldHits.length === 0 ? '✅' : '❌'} |`);
}

/* ═══════ G-D 宪法首页/内容页零 world 字节断言（D4 预埋，NFR-P6/AP-9） ═══════ */

const allHtml = walk(DIST).filter((f) => f.endsWith('.html'));
const protectedPages = allHtml.filter((f) => {
  const rel = posix.relative(DIST, f);
  if (rel.startsWith('lab/') || rel.startsWith('world/') || rel.startsWith('world-spike/')) return false;
  // v2.0 排除表（SRD §12.7.2「排除表只加根 index.html 一行」）：E7 切换后 `/` 为科技城壳，
  // 壳引导脚本合法引用 world 分包，改由 G-A′ 接管；切换前根 index.html 仍是宪法首页、继续受保护。
  if (E7_SWITCHED && rel === 'index.html') return false;
  return true;
});

let worldHits = 0;
for (const page of protectedPages) {
  const html = readFileSync(page, 'utf8');
  for (const r of extractResources(html)) {
    if (EXTERNAL_RE.test(r.url)) continue;
    const file = toDistFile(r.url, page);
    const relName = file ? posix.relative(DIST, file) : r.url;
    if (WORLD_RE.test(relName) || WORLD_RE.test(r.url)) {
      worldHits++;
      failures.push(`G-D 零 world 字节断言失败：${posix.relative(DIST, page)} 关键路径引用了 ${r.url}（<a> 导航豁免不适用于资源标签）`);
    }
  }
}
say('');
say(`## 零 world 字节断言（NFR-P6/AP-9）`);
say('');
say(E7_SWITCHED
  ? `排除表：lab/、world/、world-spike/ + 根 index.html（E7 已切换，\`/\` 科技城壳由 G-A′ 接管）；\`/home/\` 与全部内容页继续受保护。`
  : `排除表：lab/、world/、world-spike/（过渡期根 index.html 仍受保护——E7 切换后自动移入排除表）。`);
say(`受保护页共 ${protectedPages.length} 页，world chunk/资产命中 ${worldHits} 处 —— ${worldHits === 0 ? '✅ PASS' : '❌ FAIL'}`);

/* ═══════ G-E public/ 总量配额 ═══════ */

let publicMb = 0;
if (existsSync(PUBLIC_DIR)) {
  publicMb = walk(PUBLIC_DIR).reduce((a, f) => a + statSync(f).size, 0) / MB;
}
const publicPass = publicMb <= PUBLIC_CAP_MB;
say('');
say(`## public/ 配额（SRD §12.6）`);
say('');
say(`实测 ${publicMb.toFixed(1)}MB / 上限 ${PUBLIC_CAP_MB}MB —— ${publicPass ? '✅ PASS' : '❌ FAIL'}`);
if (!publicPass) failures.push(`G-E public/ 总量 ${publicMb.toFixed(1)}MB 超过 ${PUBLIC_CAP_MB}MB 配额`);

/* ═══════ G-F 资产格式黑名单（public/ 与 dist/） ═══════ */

const blacklistHits = [];
for (const dir of [PUBLIC_DIR, DIST]) {
  if (!existsSync(dir)) continue;
  for (const f of walk(dir)) {
    const name = posix.basename(f);
    if (BLACKLIST.some((re) => re.test(name))) {
      blacklistHits.push(`${posix.relative(ROOT, f)}`);
    }
  }
}
say('');
say(`## 资产格式黑名单（.wav/.blend/.band/*encoder*，roadmap §8.2）`);
say('');
say(`命中 ${blacklistHits.length} 处 —— ${blacklistHits.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
for (const h of blacklistHits) failures.push(`G-F 黑名单资产出库：${h}`);

/* ═══════ G-G Lab 模块预算对照 manifest（NFR-P4） ═══════ */

say('');
say('## Lab 模块预算对照（NFR-P4）');
say('');
const manifestPath = join(ROOT, 'src/lab/manifest.json');
const astroDir = join(DIST, '_astro');
const chunks = existsSync(astroDir) ? readdirSync(astroDir).filter((f) => /\.(js|mjs)$/.test(f)) : [];
let manifestHasWorld = false;
if (existsSync(manifestPath)) {
  let modules = [];
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    modules = Array.isArray(manifest) ? manifest : (manifest.modules ?? []);
  } catch (e) {
    failures.push(`G-G src/lab/manifest.json 不是合法 JSON：${e.message}`);
  }
  manifestHasWorld = modules.some((m) => m.budgetClass === 'world');
  for (const mod of modules) {
    const caps = BUDGET_CLASS_CAPS[mod.budgetClass];
    const declared = mod.budget ?? {};
    if (caps && typeof declared.lazyJsKbGzip === 'number' && declared.lazyJsKbGzip > caps.jsKb) {
      failures.push(`G-G 模块「${mod.slug}」声明 JS ${declared.lazyJsKbGzip}KB 超出预算级 ${mod.budgetClass} 上限 ${caps.jsKb}KB`);
    }
    if (caps && typeof declared.assetsMb === 'number' && declared.assetsMb > caps.assetsMb) {
      // 流式豁免（SRD §10.1 预算表注*）：assetsMb 计入语料全量、运行时单文件按需拉取。
      // 豁免不是声明即放行——实测流式目录内每个文件 ≤ singleFetchKbMax 才成立，否则照常阻断。
      const streaming = declared.streaming;
      if (streaming && typeof streaming.dir === 'string' && typeof streaming.singleFetchKbMax === 'number') {
        const streamDir = join(PUBLIC_DIR, streaming.dir);
        const files = existsSync(streamDir) ? walk(streamDir) : [];
        if (files.length === 0) {
          failures.push(`G-G 模块「${mod.slug}」流式豁免不成立：public/${streaming.dir} 不存在或为空`);
        } else {
          const overs = files.filter((f) => statSync(f).size / 1024 > streaming.singleFetchKbMax);
          if (overs.length > 0) {
            failures.push(
              `G-G 模块「${mod.slug}」流式豁免不成立：public/${streaming.dir} 内 ${overs.length} 个文件超单次拉取上限 ${streaming.singleFetchKbMax}KB（如 ${posix.relative(ROOT, overs[0])}）——资产 ${declared.assetsMb}MB 按预算级 ${mod.budgetClass} 上限 ${caps.assetsMb}MB 阻断`,
            );
          } else {
            const maxKb = Math.max(...files.map((f) => statSync(f).size / 1024));
            say(
              `- 「${mod.slug}」资产 ${declared.assetsMb}MB > ${mod.budgetClass} 级上限 ${caps.assetsMb}MB，流式豁免成立（SRD §10.1 注*）：public/${streaming.dir} 共 ${files.length} 个文件，实测最大单文件 ${maxKb.toFixed(1)}KB ≤ 单次拉取上限 ${streaming.singleFetchKbMax}KB —— ✅`,
            );
          }
        }
      } else {
        failures.push(`G-G 模块「${mod.slug}」声明资产 ${declared.assetsMb}MB 超出预算级 ${mod.budgetClass} 上限 ${caps.assetsMb}MB`);
      }
    }
    // 实测：按 slug 命名约定定位懒加载 chunk（无法定位时提示，不阻断）
    const owned = chunks.filter((c) => c.includes(mod.slug));
    if (owned.length > 0 && typeof declared.lazyJsKbGzip === 'number') {
      const measured = owned.reduce((a, c) => a + gzipKb(join(astroDir, c)), 0);
      const over10 = measured > declared.lazyJsKbGzip * 1.1;
      say(`- 「${mod.slug}」实测懒加载 JS ${fmtKb(measured)} / 声明 ${declared.lazyJsKbGzip}KB${over10 ? ' —— ⚠️ 超声明 +10%（告警）' : ' —— ✅'}`);
      if (over10) warnings.push(`模块「${mod.slug}」实测 JS ${fmtKb(measured)} 超 manifest 声明 ${declared.lazyJsKbGzip}KB 的 +10%（§12.6 告警线）`);
      if (caps && measured > caps.jsKb) failures.push(`G-G 模块「${mod.slug}」实测 JS ${fmtKb(measured)} 超预算级 ${mod.budgetClass} 上限 ${caps.jsKb}KB`);
    } else {
      say(`- 「${mod.slug}」未在 dist/_astro/ 定位到同名 chunk，仅校验声明值（收编后按 slug 命名 chunk 即自动实测）`);
    }
  }
  if (modules.length === 0) say('manifest 存在但无模块记录。');
} else {
  say('src/lab/manifest.json 尚未建立（Track C · C2 未交付），跳过——C2 合并后本检查自动生效。');
}

/* ═══════ G-G(world) world 预算直测（CC-E8，A2 §6 过渡纪律 (b)） ═══════ */
// 不依赖 manifest 注册：直接量测 dist/_astro/ 内 world 命名 chunk 的 gzip 合计（JS 全量 ≤900KB）
// 与 world 资产池（public/models + public/hdri + public/textures/city）合计（流式总额 ≤12MB）。
// world 模块的 manifest 注册块与 CC-E7 同 PR 激活（占位补丁见 eng-wave1-notes CC-E8 小节）——
// 激活前本直测是 world 预算的唯一考核通道；激活后与 manifest 声明校验双轨并行、互为对照。

say('');
say('## world 预算直测 G-G(world)（SRD §12.7.2，不依赖 manifest 注册）');
say('');
if (manifestHasWorld) {
  say('> manifest 已注册 budgetClass=world 模块——本直测与上方声明校验双轨并行、互为对照。');
} else {
  say('> manifest 未注册 world 模块（A2 §6 过渡纪律 (b)：注册块与 CC-E7 同 PR 激活，防 Lab 索引死卡片）——本直测为 world 预算唯一考核通道。');
}
say('');
const worldCaps = BUDGET_CLASS_CAPS.world;
const worldChunks = chunks.filter((c) => WORLD_RE.test(c));
if (worldChunks.length > 0) {
  const perChunk = worldChunks.map((c) => ({ name: c, kb: gzipKb(join(astroDir, c)) }));
  const worldJsKb = perChunk.reduce((a, x) => a + x.kb, 0);
  const jsPass = worldJsKb <= worldCaps.jsKb;
  say(`- world chunk ×${worldChunks.length}（${perChunk.map((x) => `\`${x.name}\` ${fmtKb(x.kb)}`).join('、')}）`);
  say(`- JS 全量合计 ${fmtKb(worldJsKb)} / 上限 ${worldCaps.jsKb}KB gzip —— ${jsPass ? '✅ PASS' : '❌ FAIL'}`);
  if (!jsPass) failures.push(`G-G(world) world chunk JS 全量 ${fmtKb(worldJsKb)} 超上限 ${worldCaps.jsKb}KB（SRD §12.7.2）`);
} else {
  say('- 未在 dist/_astro/ 定位到 world 命名 chunk——chunk 按 slug 命名后本直测自动生效（当前不阻断）。');
}
let worldAssetsMb = 0;
const presentDirs = [];
for (const d of WORLD_ASSET_DIRS) {
  const dir = join(PUBLIC_DIR, d);
  if (!existsSync(dir)) continue;
  presentDirs.push(d);
  worldAssetsMb += walk(dir).reduce((a, f) => a + statSync(f).size, 0) / MB;
}
const worldAssetsPass = worldAssetsMb <= worldCaps.assetsMb;
say(`- world 资产池（${presentDirs.length > 0 ? presentDirs.map((d) => `public/${d}`).join(' + ') : '目录均未建立'}）合计 ${worldAssetsMb.toFixed(1)}MB / 流式总额 ${worldCaps.assetsMb}MB —— ${worldAssetsPass ? '✅ PASS' : '❌ FAIL'}`);
if (!worldAssetsPass) failures.push(`G-G(world) world 资产池合计 ${worldAssetsMb.toFixed(1)}MB 超流式总额 ${worldCaps.assetsMb}MB（SRD §12.7.2）`);

/* ═══════ 汇总与出口 ═══════ */

say('');
say('## 审计结论');
say('');
if (warnings.length > 0) {
  say(`⚠️ 告警 ${warnings.length} 条：`);
  for (const w of warnings) say(`- ⚠️ ${w}`);
}
if (failures.length > 0) {
  say(`❌ 阻断 ${failures.length} 条：`);
  for (const f of failures) say(`- ❌ ${f}`);
} else {
  say('✅ 全部阻断级门禁通过。');
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `# 预算审计（audit-budget.mjs）\n${summaryLines.join('\n')}\n`);
}

process.exit(failures.length > 0 ? 1 : 0);
