#!/usr/bin/env node
// 提分 Loop 一键检验链（CC-L0-setup）：build → e2e → LHCI → 综合分。
// 跑法与耗时见 docs/research/cyber-city-test-framework.md；计分口径见
// docs/research/cyber-city-score-loop-orchestration.md（scripts/score-loop.mjs 实现）。
//
// 两档模式：
//   --quick（默认）：e2e 只跑 visual-chromium 冒烟（--no-deps）；LHCI 只测 `/` 与
//                    `/home/`（综合分①②所需）各 1 轮——单轮 Loop 常规档（~10min）。
//   --full          ：e2e 全 project 链 + lighthouserc.json 全七 URL × 3 轮中位
//                    （CI 同口径）——基线登记 / 审计复算档（~45-70min）。
//
// 退出码语义（Loop 编排契约）：测试失败 / LHCI 断言不达标 = 数据（压低综合分），
// 不改变退出码；仅基础设施故障（build 失败 / 服务器起不来 / collect 崩溃）退出 1。
// 需要门槛阻断时用 --min N（透传 score-loop：综合分 < N 退出 1）。
//
// 服务器纪律：复用 127.0.0.1:4321（E2E_PORT 可覆盖）已有 preview；没有则自行拉起
// 并在脚本退出后保持运行（后续轮 / 人工复查直接复用，不重复冷启）。
import { spawn, spawnSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { chromium } from '@playwright/test';

// ---------- CLI ----------
const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? fallback : v;
};

const FULL = has('full');
const PORT = Number(process.env.E2E_PORT ?? 4321);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const BASE = '/website'; // astro.config.mjs base（GitHub Pages 项目页）
const LHCI_RUNS = opt('lhci-runs', FULL ? null : '1'); // full = 用 lighthouserc.json 的 3 轮

const stages = [];
const fatal = (msg) => {
  console.error(`\n✖ [quality-loop] ${msg}`);
  process.exit(1);
};

/** 前台跑一个命令（stdio 直通），返回退出码 */
const run = (title, cmd, cmdArgs, env = {}) => {
  console.log(`\n━━━ [quality-loop] ${title} ━━━\n  $ ${cmd} ${cmdArgs.join(' ')}`);
  const t0 = Date.now();
  const res = spawnSync(cmd, cmdArgs, { stdio: 'inherit', env: { ...process.env, ...env } });
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`━━━ [quality-loop] ${title} 退出码 ${res.status}（${secs}s） ━━━`);
  return res.status ?? 1;
};

const ping = async (url) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return res.ok;
  } catch {
    return false;
  }
};

/** 确保 preview 服务器在伺服 dist/（已有则复用；拉起的保持后台运行不回收） */
async function ensureServer() {
  const probe = `${ORIGIN}${BASE}/`;
  if (await ping(probe)) {
    console.log(`[quality-loop] 复用已有 preview 服务器 ${probe}`);
    return;
  }
  if (!existsSync('dist')) fatal('dist/ 不存在且未跑 build——先 pnpm build 或去掉 --skip-build');
  console.log(`[quality-loop] 拉起 preview 服务器（端口 ${PORT}，脚本退出后保持运行）`);
  const child = spawn('pnpm', ['preview', '--host', '127.0.0.1', '--port', String(PORT)], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  for (let i = 0; i < 30; i += 1) {
    await new Promise((r) => setTimeout(r, 1_000));
    if (await ping(probe)) return;
  }
  fatal(`preview 服务器 30s 内未就绪（${probe}）`);
}

// ---------- ① build ----------
if (!has('skip-build')) {
  if (run('build（astro build → dist/）', 'pnpm', ['build']) !== 0) fatal('构建失败');
  stages.push(['build', 'OK']);
} else stages.push(['build', 'SKIP']);

await ensureServer();

// ---------- ② e2e ----------
if (!has('skip-e2e')) {
  const pwArgs = FULL
    ? ['exec', 'playwright', 'test']
    : ['exec', 'playwright', 'test', '--project=visual-chromium', '--no-deps'];
  const code = run(FULL ? 'e2e 全量（五 project 链）' : 'e2e 冒烟（visual-chromium）', 'pnpm', pwArgs);
  stages.push(['e2e', code === 0 ? 'PASS' : `FAIL(exit ${code})——已计入综合分`]);
} else stages.push(['e2e', 'SKIP']);

// ---------- ③ LHCI ----------
if (!has('skip-lhci')) {
  rmSync('.lighthouseci', { recursive: true, force: true }); // 清旧轮，防跨轮混算
  const chromePath = chromium.executablePath();
  const collectArgs = [
    'exec',
    'lhci',
    'collect',
    '--config=lighthouserc.json',
    // Playwright chromium 无沙箱容器跑 Lighthouse 的既定 flags（AGENTS.md Lighthouse 一节同口径）
    '--settings.chromeFlags=--headless=new --no-sandbox --enable-unsafe-swiftshader',
  ];
  if (!FULL) {
    // quick 档只采综合分①②所需两 URL（--url 覆盖 rc 的七 URL 清单）
    collectArgs.push(`--url=${ORIGIN}${BASE}/`, `--url=${ORIGIN}${BASE}/home/`);
  }
  if (LHCI_RUNS) collectArgs.push(`--numberOfRuns=${LHCI_RUNS}`);
  const code = run('LHCI collect', 'pnpm', collectArgs, { CHROME_PATH: chromePath });
  if (code !== 0) fatal('lhci collect 失败（基础设施故障，非低分）');

  // 门禁断言仅报告不阻断（阻断裁决归 CI ci.yml；本地看缺口）
  const assertCode = run('LHCI assert（信息性，不阻断）', 'pnpm', [
    'exec',
    'lhci',
    'assert',
    '--config=lighthouserc.json',
  ]);
  stages.push(['lhci', assertCode === 0 ? 'collect OK · 门禁 PASS' : 'collect OK · 门禁有缺口（见上方明细）']);
} else stages.push(['lhci', 'SKIP']);

// ---------- ④ 综合分 ----------
if (!has('skip-score')) {
  const scoreArgs = ['scripts/score-loop.mjs'];
  for (const key of ['visual-score', 'min']) {
    const v = opt(key);
    if (v !== null) scoreArgs.push(`--${key}`, v);
  }
  const code = run('综合分（score-loop.mjs）', 'node', scoreArgs);
  if (code === 2) fatal('综合分无可计维度（输入工件缺失）');
  stages.push(['score', code === 0 ? 'OK' : `低于 --min 门槛(exit ${code})`]);
  if (code !== 0) {
    printSummary();
    process.exit(code);
  }
} else stages.push(['score', 'SKIP']);

printSummary();

function printSummary() {
  console.log('\n══════ quality-loop 摘要 ══════');
  for (const [stage, status] of stages) console.log(`  ${stage.padEnd(6)} ${status}`);
  console.log(`  模式   ${FULL ? 'full（CI 同口径）' : 'quick（Loop 常规轮）'}`);
}
