#!/usr/bin/env node
/**
 * check-links.mjs —— 构建后内部链接与锚点检查（SRD §11.2 ③，Track D · D2）
 *
 * 用法：node scripts/check-links.mjs [dist/]
 *
 * 检查项（全部为 CI 阻断级）：
 *   1. dist 内全部 HTML 的内部引用（href/src/srcset/poster/preload）必须解析到
 *      dist 内真实存在的文件（URL 以 astro.config 的 base 为前缀，站点绝对 URL 同样视为内部）；
 *   2. 指向内部页面的 #锚点 必须命中目标页面中存在的 id；
 *   3. DemoLink↔manifest 一致性：若 src/lab/manifest.json 已存在（Track C · C2 交付物），
 *      则 dist 中所有指向 /lab/{slug}/ 的链接的 slug 必须在 manifest 注册，
 *      且 manifest 中每个 status='live' 模块的路由页必须存在于 dist。
 *      manifest 尚未建立时该项跳过并明示（脚本先于内容存在，roadmap §4.4 D2 备注）。
 *   4. 待交付路由白名单（PENDING_ROUTES）：Batch 1 首页/导航（Track A）先于
 *      内容页（Track B/C）合入产生的预期缺页，精确枚举、只收缩不增长——
 *      条目对应路由一旦真实存在于 dist，本脚本反而报错，强制删除过期条目。
 *   5. 科技城大楼 deepLink 与 ?poi= 深链（CC-E8 预留，SRD §11.2 ③ v2.0 / §12.7.3 守则①，
 *      feature-detect：src/data/cyber-city-buildings.json 存在才生效）：
 *      - 每栋在册大楼的 deepLink 必须解析到 dist 内真实页面；deepLinkStatus='fallback'
 *        条目（目标详情页未建、暂落上级索引）打印登记行不阻断（须在 PR 登记转正计划）；
 *        deepLink 解析失败在 E7 切换前（dist/home/index.html 不存在）降为警告——
 *        过渡期不因缺链变红（实施方案 §4.4 过渡纪律），E7 切换后转阻断级。
 *      - dist 内全部 `?poi={id}` 深链引用的 id 必须在 buildings JSON 在册（阻断级；
 *        当前 dist 无 ?poi= 链接，空集自然通过——CC-E7/E9 落地深链后自动生效）。
 *      - 壳六导航（`/` 科技城壳指向 /home/ /work/ /insights/ /ai-lab/ /about/ /contact/
 *        的 <a> 导航）无需专项入口：它们是普通内部链接，CC-E7 壳上线即被检查 1 自动覆盖。
 *
 * 零依赖（Node 内建模块 + 正则提取），适配 Astro 静态产物。
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, posix } from 'node:path';
import process from 'node:process';

const DIST = resolve(process.argv[2] ?? 'dist');
const ROOT = resolve(new URL('..', import.meta.url).pathname);

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(`✖ 产物目录不存在：${DIST}（先执行 pnpm build）`);
  process.exit(1);
}

/* ---------- 站点配置：base 与 site 从 astro.config.mjs 读取 ---------- */

function readAstroConfig() {
  let base = '/';
  let site = '';
  try {
    const cfg = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8');
    const baseMatch = cfg.match(/\bbase:\s*['"]([^'"]+)['"]/);
    const siteMatch = cfg.match(/\bsite:\s*['"]([^'"]+)['"]/);
    if (baseMatch) base = baseMatch[1];
    if (siteMatch) site = siteMatch[1].replace(/\/+$/, '');
  } catch {
    /* 无配置文件时按根路径站点处理 */
  }
  if (!base.startsWith('/')) base = `/${base}`;
  base = base.replace(/\/+$/, '');
  return { base, site };
}

const { base: BASE, site: SITE } = readAstroConfig();

/* ---------- 收集 dist 内全部文件与 HTML 页面 ---------- */

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

/* ---------- HTML 属性提取（正则足以覆盖 Astro 静态产物） ---------- */

const URL_ATTR_RE = /\b(?:href|src|poster|content)\s*=\s*("([^"]*)"|'([^']*)')/gi;
const SRCSET_RE = /\bsrcset\s*=\s*("([^"]*)"|'([^']*)')/gi;
const ID_RE = /\bid\s*=\s*("([^"]*)"|'([^']*)')/gi;
const OG_META_RE = /<meta[^>]+property\s*=\s*["']og:(?:image|url)["'][^>]*>/gi;

function extractRefs(html) {
  const refs = new Set();
  // href/src/poster；content 仅收 og: meta 标签内的（避免误收普通 meta）
  const ogTags = new Set();
  for (const m of html.matchAll(OG_META_RE)) ogTags.add(m[0]);
  for (const m of html.matchAll(URL_ATTR_RE)) {
    const raw = m[2] ?? m[3] ?? '';
    if (m[0].startsWith('content')) {
      const isOg = [...ogTags].some((t) => t.includes(m[0]));
      if (!isOg) continue;
    }
    if (raw) refs.add(raw);
  }
  for (const m of html.matchAll(SRCSET_RE)) {
    const raw = m[2] ?? m[3] ?? '';
    for (const part of raw.split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) refs.add(url);
    }
  }
  return [...refs];
}

function extractIds(html) {
  const ids = new Set();
  for (const m of html.matchAll(ID_RE)) {
    const v = m[2] ?? m[3] ?? '';
    if (v) ids.add(v);
  }
  return ids;
}

/* ---------- URL → dist 文件解析 ---------- */

const EXTERNAL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i; // 含 mailto:/tel:/data:/https: 与协议相对
const idCache = new Map();

function isInternal(url) {
  if (url.startsWith('#')) return true;
  if (SITE && (url.startsWith(`${SITE}/`) || url === SITE)) return true;
  if (EXTERNAL_RE.test(url)) return false;
  return true;
}

/** 把内部 URL 规范化为相对 dist 根的路径（不含 query/hash），返回 { path, hash } */
function normalize(url, fromHtmlPath) {
  let u = url;
  if (SITE && u.startsWith(SITE)) u = u.slice(SITE.length) || '/';
  const hashIdx = u.indexOf('#');
  const hash = hashIdx >= 0 ? u.slice(hashIdx + 1) : '';
  if (hashIdx >= 0) u = u.slice(0, hashIdx);
  const qIdx = u.indexOf('?');
  if (qIdx >= 0) u = u.slice(0, qIdx);
  if (u === '') return { path: null, samePage: true, hash }; // 纯锚点/纯 query
  let abs;
  if (u.startsWith('/')) {
    if (BASE !== '' && BASE !== '/') {
      if (u === BASE || u.startsWith(`${BASE}/`)) {
        abs = u.slice(BASE.length) || '/';
      } else {
        return { path: u, hash, outsideBase: true };
      }
    } else {
      abs = u;
    }
  } else {
    // 相对路径：相对当前 HTML 所在 URL 目录解析
    const fromUrlDir = posix.dirname(`/${posix.relative(DIST, fromHtmlPath).split(posix.sep).join('/')}`);
    abs = posix.normalize(posix.join(fromUrlDir, u));
  }
  return { path: abs, hash };
}

/** URL 路径解析到 dist 实际文件；返回文件绝对路径或 null */
function resolveToFile(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const candidates = [];
  const p = decoded.replace(/^\/+/, '');
  if (decoded.endsWith('/')) {
    candidates.push(join(DIST, p, 'index.html'));
  } else {
    candidates.push(join(DIST, p));
    candidates.push(join(DIST, `${p}.html`));
    candidates.push(join(DIST, p, 'index.html'));
  }
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

function idsOf(htmlPath) {
  if (!idCache.has(htmlPath)) {
    idCache.set(htmlPath, extractIds(readFileSync(htmlPath, 'utf8')));
  }
  return idCache.get(htmlPath);
}

/* ---------- 待交付路由白名单（临时，自动过期） ---------- */
// 集成顺序产物：Track A 首页/导航先于 Track B/C 内容页合入（roadmap 四轨并行）。
// 仅允许精确路由（base 剥离后的站内路径）；路由交付后条目自动过期并阻断 CI，
// 由交付该页面的 PR 负责删除对应条目——白名单只能收缩，门禁不降级。
// Phase 1 A3 批次已交付并清退：/work/ 及三案例详情、/insights/、/ai-lab/。
// Phase 1 A4 批次已交付并清退：/about/、/contact/、/rss.xml（About/Now/Contact + RSS 上线）。
// 白名单现为空——新增待交付路由时按「路径 → 说明」精确登记。
const PENDING_ROUTES = new Map([]);

/* ---------- 主检查循环 ---------- */

const errors = [];
const cityWarnings = []; // 检查 5 过渡期警告（E7 前不阻断，见文件头）
let checkedLinks = 0;
let pendingSkipped = 0;
const pendingRoutesHit = new Set();
const labSlugsLinked = new Set();
const poiRefs = []; // 检查 5：dist 内全部 ?poi= 深链引用（{ page, url, id }）

for (const htmlPath of htmlFiles) {
  const rel = posix.relative(DIST, htmlPath);
  const html = readFileSync(htmlPath, 'utf8');
  for (const url of extractRefs(html)) {
    if (!isInternal(url)) continue;
    checkedLinks++;

    // 检查 5：收集 ?poi= 深链（值合法性在尾段对照 buildings JSON 在册清单）
    const poiMatch = url.match(/[?&]poi=([^&#]*)/);
    if (poiMatch) poiRefs.push({ page: rel, url, id: decodeURIComponent(poiMatch[1]) });

    // 纯锚点：检查本页 id
    if (url.startsWith('#')) {
      const frag = decodeURIComponent(url.slice(1));
      if (frag && !idsOf(htmlPath).has(frag)) {
        errors.push(`${rel} → "${url}"：本页不存在 id="${frag}"`);
      }
      continue;
    }

    const { path: urlPath, hash, samePage, outsideBase } = normalize(url, htmlPath);
    if (samePage) continue;
    if (outsideBase) {
      errors.push(`${rel} → "${url}"：根路径链接未带 base 前缀「${BASE}」（GitHub Pages 项目页将 404）`);
      continue;
    }

    const target = resolveToFile(urlPath);
    if (!target) {
      if (PENDING_ROUTES.has(urlPath)) {
        pendingSkipped++;
        pendingRoutesHit.add(urlPath);
        continue;
      }
      errors.push(`${rel} → "${url}"：dist 内无对应文件`);
      continue;
    }

    // 记录指向 /lab/{slug} 的链接，供 manifest 一致性检查
    const labMatch = urlPath.match(/^\/lab\/([^/]+)\/?$/);
    if (labMatch) labSlugsLinked.add(labMatch[1]);

    // 跨页锚点
    if (hash && target.endsWith('.html')) {
      const frag = decodeURIComponent(hash);
      if (!idsOf(target).has(frag)) {
        errors.push(`${rel} → "${url}"：目标页 ${posix.relative(DIST, target)} 不存在 id="${frag}"`);
      }
    }
  }
}

/* ---------- DemoLink ↔ manifest 一致性（C2 交付后自动生效） ---------- */

const manifestPath = join(ROOT, 'src/lab/manifest.json');
let manifestNote;
if (existsSync(manifestPath)) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    errors.push(`src/lab/manifest.json 不是合法 JSON：${e.message}`);
    manifest = null;
  }
  if (manifest) {
    const modules = Array.isArray(manifest) ? manifest : (manifest.modules ?? []);
    const registered = new Set(modules.map((m) => m.slug));
    for (const slug of labSlugsLinked) {
      if (!registered.has(slug)) {
        errors.push(`DemoLink 一致性：dist 中存在指向 /lab/${slug}/ 的链接，但 manifest 未注册该 slug`);
      }
    }
    for (const mod of modules) {
      // world 单例模块（kind='world'）路由 = `/` 入口壳而非 /lab/{slug}/（SRD §12.7.1）——
      // CC-E7 同 PR 激活 manifest 注册补丁（eng-wave1-notes CC-E8 小节）时本豁免直接生效。
      if (mod.kind === 'world') continue;
      if (mod.status === 'live' && !resolveToFile(`/lab/${mod.slug}/`)) {
        errors.push(`DemoLink 一致性：manifest 注册的 live 模块「${mod.slug}」在 dist 中没有路由页 /lab/${mod.slug}/`);
      }
    }
    manifestNote = `manifest 一致性：已核对 ${registered.size} 个注册模块 × ${labSlugsLinked.size} 个被链接 slug`;
  }
} else {
  manifestNote = 'manifest 一致性：src/lab/manifest.json 尚未建立（Track C · C2 未交付），跳过——C2 合并后本检查自动生效';
}

/* ---------- 科技城大楼 deepLink 与 ?poi= 深链（检查 5，CC-E8 预留，feature-detect） ---------- */

const buildingsPath = join(ROOT, 'src/data/cyber-city-buildings.json');
let cityNote;
const cityFallbackRows = [];
if (existsSync(buildingsPath)) {
  let cityMap = null;
  try {
    cityMap = JSON.parse(readFileSync(buildingsPath, 'utf8'));
  } catch (e) {
    errors.push(`src/data/cyber-city-buildings.json 不是合法 JSON：${e.message}`);
  }
  if (cityMap) {
    const buildings = cityMap.buildings ?? [];
    const buildingIds = new Set(buildings.map((b) => b.id));
    // E7 切换探测器（与 audit-budget.mjs 同款）：/home/ 产物存在 = 路由已切，deepLink 缺链转阻断级
    const e7Switched = !!resolveToFile('/home/');

    for (const b of buildings) {
      if (!b.deepLink) continue;
      const ok = !!resolveToFile(b.deepLink);
      if (b.deepLinkStatus === 'fallback') {
        // fallback = 目标详情页未建、暂落上级索引（SRD §12.7.3 守则①：CI 放行但须登记）
        cityFallbackRows.push(`${b.id} → ${b.deepLink}${ok ? '' : '（⚠️ 连上级索引也不存在）'}`);
        if (!ok) {
          const msg = `buildings deepLink（fallback）：「${b.id}」→ ${b.deepLink} 在 dist 无对应页面（fallback 应至少落在已存在的上级索引）`;
          if (e7Switched) errors.push(msg);
          else cityWarnings.push(msg);
        }
        continue;
      }
      if (!ok) {
        const msg = `buildings deepLink：「${b.id}」→ ${b.deepLink} 在 dist 无对应页面（§12.7.3 守则①）`;
        if (e7Switched) errors.push(msg);
        else cityWarnings.push(`${msg}——E7 切换前降为警告，切换后阻断`);
      }
    }
    // ?poi= 深链合法性：引用 id 必须在册（阻断级；空集自然通过）
    for (const ref of poiRefs) {
      if (!buildingIds.has(ref.id)) {
        errors.push(`?poi= 深链失配：${ref.page} → "${ref.url}"：poi「${ref.id}」不在 buildings JSON 在册清单（12 栋）`);
      }
    }
    cityNote = `科技城深链：核对 ${buildings.length} 栋在册大楼 deepLink × dist 内 ${poiRefs.length} 条 ?poi= 引用（E7 ${e7Switched ? '已切换，缺链为阻断级' : '未切换，缺链降为警告'}）`;
  }
} else {
  cityNote = '科技城深链：src/data/cyber-city-buildings.json 不存在，跳过（落库后本检查自动生效）';
}

/* ---------- 白名单过期检查：路由已交付则强制清退条目 ---------- */

for (const [route, owner] of PENDING_ROUTES) {
  if (resolveToFile(route)) {
    errors.push(
      `PENDING_ROUTES 条目已过期：「${route}」（${owner}）已存在于 dist，须从白名单删除该条目`,
    );
  }
}

/* ---------- 报告 ---------- */

console.log(`check-links：扫描 ${htmlFiles.length} 个 HTML 页面，核对 ${checkedLinks} 条内部引用（base=${BASE || '/'}）`);
console.log(`  ${manifestNote}`);
console.log(`  ${cityNote}`);
if (cityFallbackRows.length > 0) {
  console.log(`  deepLinkStatus=fallback 登记 ${cityFallbackRows.length} 条（暂落上级索引，转正计划须在 PR 登记——§12.7.3 守则①）：`);
  for (const row of cityFallbackRows) console.log(`    · ${row}`);
}
if (pendingSkipped > 0) {
  console.log(
    `  待交付路由白名单：放行 ${pendingSkipped} 条链接（${pendingRoutesHit.size} 个路由；页面交付后条目自动过期并阻断 CI）：`,
  );
  for (const route of [...pendingRoutesHit].sort()) {
    console.log(`    · ${route}（${PENDING_ROUTES.get(route)}）`);
  }
}
if (cityWarnings.length > 0) {
  console.log(`\n⚠ 科技城深链过渡期警告 ${cityWarnings.length} 条（E7 切换后转阻断级）：`);
  for (const w of cityWarnings) console.log(`  - ${w}`);
}

if (errors.length > 0) {
  console.error(`\n✖ 发现 ${errors.length} 处断链/失配（CI 阻断）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✔ 内部链接与锚点全部有效');
