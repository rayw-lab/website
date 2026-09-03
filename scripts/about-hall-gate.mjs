#!/usr/bin/env node
/**
 * about-hall-gate.mjs —— 展厅 G-Hall-1..9（ADR-2 §7）。G-Hall-10 由 e2e/about-hall.spec.ts 承担。
 *
 * 用法：node scripts/about-hall-gate.mjs [dist/]
 *
 * 输入 dist/；读 src/data/about-hall-media.json（缺文件或空数组 → G-Hall-8 SKIPPED_NO_MEDIA，非 FAIL）。
 * 写出 evidence/about-hall/GATE.json + 控制台表。任一 FAIL → 退出码 1。
 *
 * G-Hall-2..5 用**内容**判定：字面 `_astro/world.` 不作引擎证据（ADR-2 §7）。
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, posix, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import process from 'node:process';

const DIST = resolve(process.argv[2] ?? 'dist');
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const KB = 1024;
const MB = 1024 * KB;
const PLAYER_TARGET_BYTES = 20 * KB;
const PLAYER_CAP_BYTES = 50 * KB;
const MEDIA_CAP_BYTES = 6 * MB; // ADR-3 决策 C：2.5MB→6.0MB，非首屏必须懒加载
const HALL_SLUG = 'about-pavilion';
const MEDIA_JSON = join(ROOT, 'src/data/about-hall-media.json');
const HALLS_JSON = join(ROOT, 'src/data/world-halls.json');
const BUILDINGS_JSON = join(ROOT, 'src/data/cyber-city-buildings.json');
const GATE_OUT = join(ROOT, 'evidence/about-hall/GATE.json');

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(`✖ 产物目录不存在：${DIST}（先执行 pnpm build）`);
  process.exit(1);
}

function readAstroConfig() {
  let base = '/';
  try {
    const cfg = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8');
    const m = cfg.match(/\bbase:\s*['"]([^'"]+)['"]/);
    if (m) base = m[1];
  } catch {
    /* 根路径站点 */
  }
  if (!base.startsWith('/')) base = `/${base}`;
  return base.replace(/\/+$/, '');
}
const BASE = readAstroConfig();

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? '';
  }
  return attrs;
}

const EXTERNAL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function toDistFile(url, fromHtmlPath) {
  let u = url;
  if (EXTERNAL_RE.test(u)) return null;
  const cut = (s, ch) => (s.includes(ch) ? s.slice(0, s.indexOf(ch)) : s);
  u = cut(cut(u, '#'), '?');
  if (u === '') return null;
  let abs;
  if (u.startsWith('/')) {
    if (BASE && BASE !== '/' && (u === BASE || u.startsWith(`${BASE}/`))) abs = u.slice(BASE.length) || '/';
    else if (BASE && BASE !== '/') {
      abs = u; // 数据契约路径（hallPath / data-bind）不带 base
    } else abs = u;
  } else {
    const dir = posix.dirname(`/${posix.relative(DIST, fromHtmlPath).split(posix.sep).join('/')}`);
    abs = posix.normalize(posix.join(dir, u));
  }
  return resolveToFile(abs);
}

function resolveToFile(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const p = decoded.replace(/^\/+/, '');
  const candidates = [];
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

function extractScriptAndModulepreload(html) {
  const out = [];
  const TAG_RE = /<(link|script)\b[^>]*>/gi;
  for (const m of html.matchAll(TAG_RE)) {
    const tagName = m[1].toLowerCase();
    const attrs = parseAttrs(m[0]);
    if (tagName === 'script' && attrs.src) {
      out.push({ kind: 'script', url: attrs.src });
    } else if (tagName === 'link') {
      const rel = (attrs.rel ?? '').toLowerCase();
      if (rel === 'modulepreload' && attrs.href) out.push({ kind: 'modulepreload', url: attrs.href });
    }
  }
  return out;
}

function extractPreloadAndScriptUrls(html) {
  const out = [];
  const TAG_RE = /<(link|script)\b[^>]*>/gi;
  for (const m of html.matchAll(TAG_RE)) {
    const tagName = m[1].toLowerCase();
    const attrs = parseAttrs(m[0]);
    if (tagName === 'script' && attrs.src) out.push(attrs.src);
    else if (tagName === 'link') {
      const rel = (attrs.rel ?? '').toLowerCase();
      if ((rel === 'preload' || rel === 'modulepreload') && attrs.href) out.push(attrs.href);
    }
  }
  return out;
}

function hallHtmlPath(slug) {
  return join(DIST, 'world', slug, 'index.html');
}

function registeredSlugs() {
  if (!existsSync(HALLS_JSON)) return [];
  const doc = JSON.parse(readFileSync(HALLS_JSON, 'utf8'));
  const halls = Array.isArray(doc) ? doc : (doc.halls ?? []);
  return halls.map((h) => h.slug).filter(Boolean);
}

function builtHallSlugs() {
  const world = join(DIST, 'world');
  if (!existsSync(world)) return [];
  return readdirSync(world, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(world, e.name, 'index.html')))
    .map((e) => e.name);
}

function sitemapHits(needle) {
  const files = walk(DIST).filter((f) => /sitemap.*\.xml$/i.test(f));
  const hits = [];
  for (const f of files) {
    const xml = readFileSync(f, 'utf8');
    if (xml.includes(needle)) hits.push(posix.relative(DIST, f));
  }
  return hits;
}

function collectJsCorpus(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  const files = [{ rel: posix.relative(DIST, htmlPath), text: html }];
  const seen = new Set([files[0].rel]);
  for (const r of extractScriptAndModulepreload(html)) {
    const file = toDistFile(r.url, htmlPath);
    if (!file) continue;
    const rel = posix.relative(DIST, file);
    if (seen.has(rel)) continue;
    seen.add(rel);
    files.push({ rel, text: readFileSync(file, 'utf8') });
  }
  return files;
}

function findNeedles(corpus, needles) {
  const hits = [];
  for (const { rel, text } of corpus) {
    for (const needle of needles) {
      if (text.includes(needle)) hits.push({ file: rel, needle });
    }
  }
  return hits;
}

function bindUrls(bind) {
  const urls = [];
  for (const part of String(bind).split(';')) {
    const p = part.trim();
    if (!p) continue;
    const colon = p.indexOf(':');
    const value = colon >= 0 ? p.slice(colon + 1).trim() : p;
    if (value.startsWith('/') && !value.startsWith('//')) urls.push(value);
  }
  return urls;
}

/** data-bind 里的 /about/#id → 路径与 fragment。fragment 不进 HTTP，200 看路径；id 另核。 */
function splitPathHash(url) {
  let path = url;
  let hash = '';
  const hashIdx = path.indexOf('#');
  if (hashIdx >= 0) {
    hash = decodeURIComponent(path.slice(hashIdx + 1));
    path = path.slice(0, hashIdx);
  }
  const qIdx = path.indexOf('?');
  if (qIdx >= 0) path = path.slice(0, qIdx);
  return { path, hash };
}

function extractIds(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\bid\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    const v = m[2] ?? m[3] ?? '';
    if (v) ids.add(v);
  }
  return ids;
}

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function isVideoPath(p) {
  return /\.(mp4|webm|mov)$/i.test(p);
}

function ffprobeVideo(filePath) {
  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filePath],
    { encoding: 'utf8' },
  );
  if (probe.error) return { ok: false, error: probe.error.message };
  if (probe.status !== 0) return { ok: false, error: probe.stderr.trim() || `ffprobe exit ${probe.status}` };
  let data;
  try {
    data = JSON.parse(probe.stdout);
  } catch (e) {
    return { ok: false, error: `ffprobe JSON：${e.message}` };
  }
  const streams = data.streams ?? [];
  const video = streams.find((s) => s.codec_type === 'video');
  const audioCount = streams.filter((s) => s.codec_type === 'audio').length;
  let fps = 0;
  if (video?.r_frame_rate && video.r_frame_rate !== '0/0') {
    const [a, b] = video.r_frame_rate.split('/').map(Number);
    if (b) fps = a / b;
  }
  const duration = Number(video?.duration ?? data.format?.duration ?? NaN);
  return { ok: true, fps, duration, audioCount };
}

const gates = [];

function record(id, status, detail, extra = {}) {
  gates.push({ id, status, detail, ...extra });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/* ═══════ G-Hall-1 产物 + 未知 slug 无产物 + sitemap ═══════ */

{
  const htmlPath = hallHtmlPath(HALL_SLUG);
  const exists = existsSync(htmlPath) && statSync(htmlPath).isFile();
  const registered = registeredSlugs();
  const built = builtHallSlugs();
  const extra = built.filter((s) => !registered.includes(s));
  const missing = registered.filter((s) => !built.includes(s));
  const sm = sitemapHits(`/world/${HALL_SLUG}/`);
  const problems = [];
  if (!exists) problems.push(`dist/world/${HALL_SLUG}/index.html 不存在`);
  if (!registered.includes(HALL_SLUG)) problems.push(`world-halls.json 未登记 slug ${HALL_SLUG}`);
  if (extra.length) problems.push(`dist/world/ 多出未登记 slug：${extra.join(', ')}`);
  if (missing.length) problems.push(`已登记但 dist 无页：${missing.join(', ')}`);
  if (sm.length === 0) problems.push(`sitemap 不含 /world/${HALL_SLUG}/`);
  record(
    'G-Hall-1',
    problems.length ? 'FAIL' : 'PASS',
    problems.length
      ? problems.join('；')
      : `dist/world/${HALL_SLUG}/index.html 存在；sitemap ${sm.join(', ')}；未知 slug 无产物（built=${built.join(',') || '∅'}）`,
    { evidence: { exists, registered, built, extra, sitemap: sm } },
  );
}

/* ═══════ G-Hall-2..5 内容判定（禁止用 _astro/world. 文件名） ═══════ */

{
  const htmlPath = hallHtmlPath(HALL_SLUG);
  if (!existsSync(htmlPath)) {
    for (const id of ['G-Hall-2', 'G-Hall-3', 'G-Hall-4', 'G-Hall-5', 'G-Hall-6', 'G-Hall-9']) {
      record(id, 'FAIL', `展厅 HTML 不存在，无法扫描：${posix.relative(DIST, htmlPath)}`);
    }
  } else {
    const html = readFileSync(htmlPath, 'utf8');
    const corpus = collectJsCorpus(htmlPath);

    const engineHits = findNeedles(corpus, [
      'lab/world',
      'lab/modules/world',
      'initAllLabFacades',
      'mountWorld',
    ]);
    record(
      'G-Hall-2',
      engineHits.length ? 'FAIL' : 'PASS',
      engineHits.length
        ? `引擎内容命中 ${engineHits.length}：${engineHits.map((h) => `${h.file} ← ${h.needle}`).join('；')}`
        : `扫描 ${corpus.length} 个文件（HTML + 静态 JS），零 lab/world / initAllLabFacades / mountWorld（未用 _astro/world. 文件名）`,
      { evidence: { files: corpus.map((c) => c.rel), hits: engineHits } },
    );

    const physicsNeedles = ['@dimforge', 'rapier'];
    const physicsHits = findNeedles(corpus, physicsNeedles);
    const wasmHits = [];
    for (const { rel, text } of corpus) {
      if (/\.wasm\b/i.test(text)) wasmHits.push({ file: rel, needle: '.wasm' });
    }
    for (const url of extractPreloadAndScriptUrls(html)) {
      if (/\.wasm(\?|$)/i.test(url)) wasmHits.push({ file: posix.relative(DIST, htmlPath), needle: url });
    }
    const p3 = [...physicsHits, ...wasmHits];
    record(
      'G-Hall-3',
      p3.length ? 'FAIL' : 'PASS',
      p3.length
        ? `物理栈命中：${p3.map((h) => `${h.file} ← ${h.needle}`).join('；')}`
        : '零 rapier / @dimforge / .wasm',
      { evidence: { hits: p3 } },
    );

    const gpuHits = findNeedles(corpus, ['three/webgpu', 'WebGPURenderer', 'MeshStandardNodeMaterial']);
    record(
      'G-Hall-4',
      gpuHits.length ? 'FAIL' : 'PASS',
      gpuHits.length
        ? `WebGPU/TSL 城市场材质命中：${gpuHits.map((h) => `${h.file} ← ${h.needle}`).join('；')}`
        : '零 three/webgpu / WebGPURenderer / MeshStandardNodeMaterial',
      { evidence: { hits: gpuHits } },
    );

    const modelHits = [];
    const MODEL_RE = /(?:^|\/)models\/|hero-robot|concept-garage|autodrive|\.(?:glb|gltf)(?:\?|$)/i;
    for (const url of extractPreloadAndScriptUrls(html)) {
      if (MODEL_RE.test(url)) modelHits.push(url);
    }
    record(
      'G-Hall-5',
      modelHits.length ? 'FAIL' : 'PASS',
      modelHits.length
        ? `<script>/preload 引用模型：${modelHits.join('；')}`
        : '零 <script> / preload 指向 public/models/** 或 hero-robot / concept-garage / autodrive',
      { evidence: { hits: modelHits } },
    );

    /* ═══════ G-Hall-6 额外 JS gzip ═══════ */
    const refs = extractScriptAndModulepreload(html);
    const seen = new Set();
    let gzipBytes = 0;
    const rows = [];
    const missing = [];
    for (const r of refs) {
      const file = toDistFile(r.url, htmlPath);
      if (!file) {
        missing.push(r.url);
        continue;
      }
      const rel = posix.relative(DIST, file);
      if (seen.has(rel)) continue;
      seen.add(rel);
      const gz = gzipSync(readFileSync(file)).length;
      gzipBytes += gz;
      rows.push({ url: r.url, kind: r.kind, rel, gzipBytes: gz });
    }
    let status = 'PASS';
    let detail;
    if (missing.length) {
      status = 'FAIL';
      detail = `引用的 script/modulepreload 在 dist 无文件：${missing.join('；')}`;
    } else if (gzipBytes === 0) {
      detail = 'Hall-0 额外 JS = 0（无 <script src> / modulepreload；只用 BaseLayout 已有内联）';
    } else if (gzipBytes > PLAYER_CAP_BYTES) {
      status = 'FAIL';
      detail = `播放器/island gzip ${gzipBytes}B > 硬顶 ${PLAYER_CAP_BYTES}B`;
    } else if (gzipBytes > PLAYER_TARGET_BYTES) {
      status = 'WARN';
      detail = `额外 JS gzip ${gzipBytes}B 超过 20KB 目标、未过 50KB 硬顶`;
    } else {
      detail = `额外 JS gzip ${gzipBytes}B ≤ 20KB 目标（Hall-S）`;
    }
    record('G-Hall-6', status, detail, {
      evidence: { gzipBytes, targetBytes: PLAYER_TARGET_BYTES, capBytes: PLAYER_CAP_BYTES, rows, missing },
    });

    /* ═══════ G-Hall-9 data-scene / data-bind ═══════ */
    const sectionRe = /<section\b([^>]*)>/gi;
    const sections = [];
    for (const m of html.matchAll(sectionRe)) {
      const attrs = parseAttrs(m[0]);
      if (attrs['data-scene'] === undefined) continue;
      sections.push({ scene: attrs['data-scene'], bind: attrs['data-bind'], raw: m[0] });
    }
    const g9 = [];
    if (sections.length === 0) g9.push('展厅 HTML 没有任何 <section data-scene>');
    for (const s of sections) {
      if (s.bind === undefined || String(s.bind).trim() === '') {
        g9.push(`data-scene="${s.scene}" 缺少 data-bind`);
        continue;
      }
      for (const url of bindUrls(s.bind)) {
        const { path, hash } = splitPathHash(url);
        const file = resolveToFile(path);
        if (!file) {
          g9.push(`data-scene="${s.scene}" data-bind URL ${url} 在 dist 无对应页`);
          continue;
        }
        if (hash && file.endsWith('.html') && !extractIds(readFileSync(file, 'utf8')).has(hash)) {
          g9.push(`data-scene="${s.scene}" data-bind ${url} 目标页无 id="${hash}"`);
        }
      }
    }
    record(
      'G-Hall-9',
      g9.length ? 'FAIL' : 'PASS',
      g9.length
        ? g9.join('；')
        : `${sections.length} 个 data-scene 均有 data-bind，其中 URL 在 dist 可解析`,
      { evidence: { sections } },
    );
  }
}

/* ═══════ G-Hall-7 hallPath → dist ═══════ */

{
  if (!existsSync(BUILDINGS_JSON)) {
    record('G-Hall-7', 'FAIL', 'src/data/cyber-city-buildings.json 不存在');
  } else {
    let city;
    try {
      city = readJson(BUILDINGS_JSON);
    } catch (e) {
      record('G-Hall-7', 'FAIL', `buildings JSON 非法：${e.message}`);
      city = null;
    }
    if (city) {
      const buildings = city.buildings ?? [];
      const rows = [];
      const fails = [];
      for (const b of buildings) {
        if (!b.hallPath) continue;
        const ok = !!resolveToFile(b.hallPath);
        rows.push({ id: b.id, hallPath: b.hallPath, ok });
        if (!ok) fails.push(`${b.id} → ${b.hallPath}`);
      }
      record(
        'G-Hall-7',
        fails.length ? 'FAIL' : 'PASS',
        fails.length
          ? `hallPath 在 dist 无页：${fails.join('；')}`
          : `${rows.length} 条 hallPath 均对应 dist 页（deepLink 仍由 check-links 核）`,
        { evidence: { rows } },
      );
    }
  }
}

/* ═══════ G-Hall-8 媒体 JSON 对账 ═══════ */

{
  if (!existsSync(MEDIA_JSON)) {
    record('G-Hall-8', 'SKIPPED_NO_MEDIA', 'src/data/about-hall-media.json 不存在', {
      evidence: { reason: 'missing-file' },
    });
  } else {
    let media;
    try {
      media = readJson(MEDIA_JSON);
    } catch (e) {
      record('G-Hall-8', 'FAIL', `about-hall-media.json 不是合法 JSON：${e.message}`);
      media = null;
    }
    if (media !== null) {
      if (!Array.isArray(media)) {
        record('G-Hall-8', 'FAIL', 'about-hall-media.json 必须是数组');
      } else if (media.length === 0) {
        record('G-Hall-8', 'SKIPPED_NO_MEDIA', 'about-hall-media.json 为空数组', {
          evidence: { reason: 'empty-array' },
        });
      } else {
        const problems = [];
        const items = [];
        const uniqueFiles = new Map();
        for (const item of media) {
          const id = item?.id ?? '(no-id)';
          const required = ['id', 'poster', 'durationS', 'bytes', 'sha256', 'fps', 'audio', 'lockedRef'];
          for (const k of required) {
            if (item[k] === undefined || item[k] === null) problems.push(`${id} 缺字段 ${k}`);
          }
          if (item.audio !== false) problems.push(`${id} audio 必须为 false，实为 ${JSON.stringify(item.audio)}`);
          const src16 = typeof item.src16x9 === 'string' ? item.src16x9.trim() : '';
          const src9 = typeof item.src9x16 === 'string' ? item.src9x16.trim() : '';
          const poster = typeof item.poster === 'string' ? item.poster.trim() : '';
          const paths = [];
          if (src16) paths.push({ role: 'src16x9', url: src16 });
          if (src9) paths.push({ role: 'src9x16', url: src9 });
          if (poster) paths.push({ role: 'poster', url: poster });
          else problems.push(`${id} poster 为空`);

          const resolved = [];
          for (const p of paths) {
            const file = resolveToFile(p.url);
            if (!file) {
              problems.push(`${id} ${p.role} ${p.url} 在 dist 无文件`);
              continue;
            }
            resolved.push({ ...p, file, size: statSync(file).size, sha: sha256File(file) });
            uniqueFiles.set(file, statSync(file).size);
          }

          const primary =
            resolved.find((r) => r.role === 'src16x9') ?? resolved.find((r) => r.role === 'poster');
          if (primary) {
            if (Number(item.bytes) !== primary.size) {
              problems.push(`${id} bytes ${item.bytes} ≠ 磁盘 ${primary.size}（${primary.role}）`);
            }
            if (String(item.sha256).toLowerCase() !== primary.sha) {
              problems.push(`${id} sha256 与 ${primary.role} 不符`);
            }
          }

          const video = resolved.find((r) => isVideoPath(r.url));
          if (video) {
            const probe = ffprobeVideo(video.file);
            if (!probe.ok) {
              problems.push(`${id} ffprobe 失败：${probe.error}`);
            } else {
              if (Math.abs(probe.fps - 30) > 0.1) {
                problems.push(`${id} fps=${probe.fps}，要求 30`);
              }
              if (probe.audioCount > 0) {
                problems.push(`${id} 有 ${probe.audioCount} 条音轨，要求无音轨`);
              }
              if (Number.isFinite(probe.duration) && Math.abs(probe.duration - Number(item.durationS)) > 0.08) {
                problems.push(`${id} duration ${probe.duration}s ≠ JSON ${item.durationS}`);
              }
            }
          } else {
            if (Number(item.fps) !== 0) problems.push(`${id} 无视频时 fps 应为 0，实为 ${item.fps}`);
            if (Number(item.durationS) !== 0) {
              problems.push(`${id} 无视频时 durationS 应为 0，实为 ${item.durationS}`);
            }
          }
          items.push({ id, src16x9: src16 || null, poster, resolved: resolved.map((r) => r.role) });
        }
        const totalBytes = [...uniqueFiles.values()].reduce((a, b) => a + b, 0);
        if (totalBytes > MEDIA_CAP_BYTES) {
          problems.push(`总载荷 ${totalBytes}B > ${MEDIA_CAP_BYTES}B（6.0MB，ADR-3）`);
        }
        record(
          'G-Hall-8',
          problems.length ? 'FAIL' : 'PASS',
          problems.length
            ? problems.join('；')
            : `${media.length} 条媒体对账通过（sha256/字节/fps/无音轨/时长）；总载荷 ${totalBytes}B ≤ 6.0MB`,
          { evidence: { items, totalBytes, capBytes: MEDIA_CAP_BYTES } },
        );
      }
    }
  }
}

/* ═══════ 写出 GATE.json + 控制台表 ═══════ */

gates.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
const failCount = gates.filter((g) => g.status === 'FAIL').length;
const warnCount = gates.filter((g) => g.status === 'WARN').length;
const skipCount = gates.filter((g) => g.status === 'SKIPPED_NO_MEDIA').length;
const ok = failCount === 0;

const report = {
  schema: 'about-hall-gate/v1',
  ok,
  generatedAt: new Date().toISOString(),
  dist: DIST,
  notes: [
    'G-Hall-10 由 e2e/about-hall.spec.ts 承担，本脚本不判。',
    'G-Hall-2..5 扫描 HTML 与 <script src>/<link rel=modulepreload> 的**内容**；`_astro/world.` 文件名不是证据。',
  ],
  gates,
  summary: { fail: failCount, warn: warnCount, skipped: skipCount, pass: gates.filter((g) => g.status === 'PASS').length },
};

mkdirSync(join(ROOT, 'evidence/about-hall'), { recursive: true });
writeFileSync(GATE_OUT, `${JSON.stringify(report, null, 2)}\n`);

const pad = (s, n) => String(s).padEnd(n);
console.log('');
console.log('G-Hall 门（ADR-2 §7，about-hall-gate.mjs）');
console.log(`${pad('ID', 12)}${pad('STATUS', 18)}DETAIL`);
console.log('-'.repeat(88));
for (const g of gates) {
  console.log(`${pad(g.id, 12)}${pad(g.status, 18)}${g.detail}`);
}
console.log('-'.repeat(88));
console.log(`FAIL ${failCount} · WARN ${warnCount} · SKIPPED_NO_MEDIA ${skipCount} · 写出 ${posix.relative(ROOT, GATE_OUT)}`);
console.log(ok ? '✔ G-Hall-1..9 无 FAIL' : '✖ 存在 FAIL（退出码 1）');

process.exit(ok ? 0 : 1);
