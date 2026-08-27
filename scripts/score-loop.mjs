#!/usr/bin/env node
// 综合分计算（CC-L0-setup）—— 提分 Loop 统一计分器。
// 权重口径单源：docs/research/cyber-city-score-loop-orchestration.md「综合分口径」表：
//   ① LHCI `/` 四项均值 25% ② LHCI `/home/` 四项均值 15% ③ e2e 通过率 20%
//   ④ 视觉 rubric（竞品对标）25% ⑤ 3D 交互冒烟（首幕+POI+ESC）15%
//
// 输入（全部为既有工件，本脚本只读不跑）：
//   ①② .lighthouseci/lhr-*.json     （lhci collect 产物；每 URL 多轮取分类中位数）
//   ③⑤ test-results/e2e-results.json（playwright json reporter；⑤ = 标题带 @smoke3d 的用例）
//   ④   docs/research/cyber-city-visual-rubric-score.json（CC-L0-visual 登记 {"score": 0-100}）
//        或 --visual-score N 覆盖
//
// 缺维处理：缺失维度不计 0 分——按可用权重归一化出综合分，并明示缺失项与覆盖率
// （Loop 0 视觉 rubric 未登记前即为 75% 覆盖口径；CC-AL* 审计复算时四/五维齐套）。
//
// 输出：人读明细表 + 末行机读 `COMPOSITE_SCORE=<0-100>`；
//       JSON 工件 test-results/quality-score.json（跨轮留档对比）。
// 退出码：0 = 计算完成（分数高低不影响）；--min N 时综合分 < N 退出 1；输入缺失致
//         无任何可计维度时退出 2（基础设施问题，区别于低分）。
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

// ---------- CLI ----------
const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? fallback : v;
};
const LHCI_DIR = opt('lhci-dir', '.lighthouseci');
const E2E_JSON = opt('e2e-json', 'test-results/e2e-results.json');
const VISUAL_JSON = opt('visual-json', 'docs/research/cyber-city-visual-rubric-score.json');
const VISUAL_OVERRIDE = opt('visual-score');
const OUT = opt('out', 'test-results/quality-score.json');
const MIN = opt('min');

// ---------- 权重（编排文档单源镜像；改口径两处同步） ----------
const WEIGHTS = {
  lhciRoot: { weight: 0.25, label: 'LHCI `/` 四项均值' },
  lhciHome: { weight: 0.15, label: 'LHCI `/home/` 四项均值' },
  e2e: { weight: 0.2, label: 'e2e 通过率' },
  visual: { weight: 0.25, label: '视觉 rubric（竞品对标）' },
  smoke3d: { weight: 0.15, label: '3D 交互冒烟（首幕+POI+ESC）' },
};

const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

const median = (nums) => {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

// ---------- ①② LHCI ----------
/** @returns {{root: number|null, home: number|null, runs: Record<string, number>}} */
function readLhci(dir) {
  if (!existsSync(dir)) return { root: null, home: null, runs: {} };
  const byPath = new Map(); // pathname -> { cat -> scores[] }
  for (const file of readdirSync(dir)) {
    if (!/^lhr-.*\.json$/.test(file)) continue;
    const lhr = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const url = lhr.requestedUrl ?? lhr.finalDisplayedUrl;
    if (!url || !lhr.categories) continue;
    const path = new URL(url).pathname;
    const bucket = byPath.get(path) ?? {};
    for (const cat of CATEGORIES) {
      const score = lhr.categories[cat]?.score;
      if (typeof score === 'number') (bucket[cat] ??= []).push(score);
    }
    byPath.set(path, bucket);
  }
  const meanOf = (path) => {
    const bucket = byPath.get(path);
    if (!bucket) return null;
    const medians = CATEGORIES.map((cat) => (bucket[cat]?.length ? median(bucket[cat]) : null));
    if (medians.some((m) => m === null)) return null;
    return (medians.reduce((a, b) => a + b, 0) / CATEGORIES.length) * 100;
  };
  const runs = Object.fromEntries(
    [...byPath.entries()].map(([p, b]) => [p, b.performance?.length ?? 0]),
  );
  // GitHub Pages 项目页 base=/website（astro.config.mjs）
  return { root: meanOf('/website/'), home: meanOf('/website/home/'), runs };
}

// ---------- ③⑤ Playwright JSON ----------
/** 递归收集 spec（playwright json reporter：suites 嵌套，spec.ok = 该用例最终通过） */
function collectSpecs(suites, acc = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) acc.push(spec);
    collectSpecs(suite.suites, acc);
  }
  return acc;
}

/** @returns {{passRate: number|null, smoke3d: number|null, detail: object}} */
function readE2e(file) {
  if (!existsSync(file)) return { passRate: null, smoke3d: null, detail: null };
  const report = JSON.parse(readFileSync(file, 'utf8'));
  const stats = report.stats ?? {};
  const passed = (stats.expected ?? 0) + (stats.flaky ?? 0);
  const total = passed + (stats.unexpected ?? 0); // skipped 不计入分母（未执行≠失败）
  const passRate = total > 0 ? (passed / total) * 100 : null;

  const specs = collectSpecs(report.suites);
  // 仅统计实际执行过的 @smoke3d 用例：全 skipped 的 spec 也带 ok:true
  //（如 --list / test.skip 产物），不剔除会虚报满分
  const smoke = specs
    .filter((s) => s.title.includes('@smoke3d'))
    .filter((s) =>
      (s.tests ?? []).some((t) => (t.results ?? []).some((r) => r.status && r.status !== 'skipped')),
    );
  const smokePassed = smoke.filter((s) => s.ok).length;
  const smoke3d = smoke.length > 0 ? (smokePassed / smoke.length) * 100 : null;
  return {
    passRate,
    smoke3d,
    detail: {
      passed,
      failed: stats.unexpected ?? 0,
      skipped: stats.skipped ?? 0,
      smoke3d: smoke.map((s) => ({ title: s.title, ok: s.ok })),
    },
  };
}

// ---------- ④ 视觉 rubric ----------
function readVisual() {
  if (VISUAL_OVERRIDE !== null) {
    const n = Number(VISUAL_OVERRIDE);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      console.error(`--visual-score 需为 0-100 数字，收到：${VISUAL_OVERRIDE}`);
      process.exit(2);
    }
    return { score: n, source: '--visual-score CLI' };
  }
  if (existsSync(VISUAL_JSON)) {
    const parsed = JSON.parse(readFileSync(VISUAL_JSON, 'utf8'));
    if (typeof parsed.score === 'number') return { score: parsed.score, source: VISUAL_JSON };
  }
  return { score: null, source: null };
}

// ---------- 汇总 ----------
const lhci = readLhci(LHCI_DIR);
const e2e = readE2e(E2E_JSON);
const visual = readVisual();

const dims = {
  lhciRoot: lhci.root,
  lhciHome: lhci.home,
  e2e: e2e.passRate,
  visual: visual.score,
  smoke3d: e2e.smoke3d,
};

let weighted = 0;
let available = 0;
const missing = [];
for (const [key, { weight, label }] of Object.entries(WEIGHTS)) {
  const score = dims[key];
  if (score === null || score === undefined) {
    missing.push(label);
    continue;
  }
  weighted += weight * score;
  available += weight;
}

if (available === 0) {
  console.error('无任何可计维度：请先跑 e2e（json 报告）与 lhci collect，再计算综合分。');
  process.exit(2);
}
const composite = weighted / available;

// ---------- northStar 只读汇总（CC-OBS-C2，可观测规格 §6.4 冻结） ----------
// 功能/性能是与综合分**并列**的北极星维度，不折算进五维（权重 25/15/20/25/15 零改动）；
// 各读对应登记 JSON 的 score，缺失 = null + sources 注记「（缺失）」——缺失明示、
// 禁止填估值；FUNCTION_SMOKE 冒烟分不出现在本块（哨兵不入登记面，§6.5）。
const NORTH_STAR_SOURCES = {
  visual: 'docs/research/cyber-city-visual-rubric-score.json',
  function: 'docs/research/cyber-city-function-rubric-score.json',
  perf: 'docs/research/cyber-city-perf-rubric-score.json',
};

/** 登记 JSON 的 score 读取（缺失/非法 = null；northStar 恒读登记面，不受 CLI 覆盖影响） */
function readRegisteredScore(path) {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return typeof parsed.score === 'number' ? parsed.score : null;
  } catch {
    return null;
  }
}

const northStar = { visual: null, function: null, perf: null, composite: null, sources: {} };
for (const [dim, source] of Object.entries(NORTH_STAR_SOURCES)) {
  northStar[dim] = readRegisteredScore(source);
  northStar.sources[dim] = northStar[dim] === null ? `${source}（缺失）` : source;
}
// composite = 本文件 composite 字段镜像（单块自足，供父代理一眼四数）
northStar.composite = Number(composite.toFixed(2));

// ---------- 输出 ----------
console.log('══════ 综合分（cyber-city-score-loop-orchestration.md 口径） ══════');
for (const [key, { weight, label }] of Object.entries(WEIGHTS)) {
  const score = dims[key];
  const cell = score === null || score === undefined ? '  缺失' : score.toFixed(1).padStart(6);
  console.log(`  ${cell}  × ${(weight * 100).toFixed(0).padStart(2)}%  ${label}`);
}
console.log('───────────────────────────────────────────────');
console.log(
  `  综合分 ${composite.toFixed(1)}/100（按可用权重 ${(available * 100).toFixed(0)}% 归一化` +
    (missing.length ? `；缺失：${missing.join('、')}` : '；五维齐套') +
    ')',
);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      computedAt: new Date().toISOString(),
      composite: Number(composite.toFixed(2)),
      availableWeight: available,
      missing,
      dimensions: Object.fromEntries(
        Object.entries(WEIGHTS).map(([key, { weight, label }]) => [
          key,
          { label, weight, score: dims[key] ?? null },
        ]),
      ),
      northStar,
      inputs: { lhciRuns: lhci.runs, e2e: e2e.detail, visualSource: visual.source },
    },
    null,
    2,
  ) + '\n',
);
console.log(`  明细 JSON → ${OUT}`);
// northStar 四数一行（视觉/功能/性能登记分 + 综合分镜像；缺失显式 —，禁止估值）
const northStarCell = (v) => (v === null ? '—' : String(v));
console.log(
  `  northStar：visual ${northStarCell(northStar.visual)} / function ${northStarCell(northStar.function)}` +
    ` / perf ${northStarCell(northStar.perf)} / composite ${northStar.composite}`,
);
console.log(`COMPOSITE_SCORE=${composite.toFixed(1)}`);

if (MIN !== null && composite < Number(MIN)) {
  console.error(`综合分 ${composite.toFixed(1)} < 门槛 ${MIN}`);
  process.exit(1);
}
