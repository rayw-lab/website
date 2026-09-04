#!/usr/bin/env node
/**
 * 墨迹 · Ink Ledger —— 构建期海报生成。
 *
 * 降级路径（reduced-motion / save-data / 无 WebGL2 / 初始化失败）下 canvas 会被隐藏，
 * 此时展厅不能变成一张空白纸 —— 用本脚本在构建期把「墨已经洇开」的那一帧截下来当海报。
 *
 * 前置：`pnpm build` 且 preview 已在 127.0.0.1:4321 运行（astro preview 是守护进程，
 * 命令本身会立即返回，别指望它在前台阻塞）。
 *
 * 退出码：0 全部生成；1 任一失败（不产出半套海报）；2 前置缺失。
 * 无论红绿先打印分母（目标数、实际数、字节）。
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { unlinkSync } from 'node:fs';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ORIGIN = process.env.POSTER_ORIGIN ?? 'http://127.0.0.1:4321';
const OUT = fileURLToPath(new URL('../public/posters/', import.meta.url));
/** 草案给 poster 的体积预算 */
const BUDGET = 60 * 1024;

// 每张海报：源页面 + 停帧时刻 + 目标文件。停帧走 `?poster=1`（开 preserveDrawingBuffer）。
const SHOTS = [
  { name: 'nexus-yin', path: '/website/world-spike/nexus-yin/?poster=1', wait: 12000, sel: '[data-yin-canvas]' },
  // flow 用完成信号而不是等墙钟：软件渲染只有约 0.7 帧/秒，等 22 秒截到的是半成品，
  // 而半成品「看着像留白」，最容易被当成设计。ready 由分片 seek 跑完后立旗。
  { name: 'nexus-flow', path: '/website/world-spike/nexus-flow/?poster=1', wait: 2000, sel: '[data-flow-canvas]', ready: true },
];

const ping = await fetch(`${ORIGIN}/website/`).then((r) => r.ok).catch(() => false);
if (!ping) {
  console.error(`前置缺失：${ORIGIN}/website/ 不可达。先 pnpm build 再 pnpm preview --host 127.0.0.1 --port 4321`);
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });

const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const done = [];
const failed = [];
for (const s of SHOTS) {
  try {
    const ctx = await br.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    // 预热一次再正式截 —— 纯保险（曾多次观测到白屏但受控条件下复现不出，见台账 R14）
    await page.goto(ORIGIN + s.path, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(Math.min(s.wait, 8000));
    await page.goto(ORIGIN + s.path, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(s.wait);
    if (s.ready) {
      await page.waitForFunction(() => document.documentElement.dataset.inkPoster === 'ready', null, {
        timeout: 300000,
      });
    }
    const raw = await page.locator(s.sel).screenshot({ type: 'png' });
    // 🔴 内容门：海报必须真的有墨。空白海报比没有海报更糟 —— 它让降级路径看起来正常。
    if (raw.length < 40_000) throw new Error(`原始帧疑似空白（${raw.length} B）`);
    // 转 webp 并压到预算内。PNG 直出 1.04MB / 673KB，而草案给 poster 的预算是 ≤60KB ——
    // 降级路径本就是给弱环境用的，海报比原图更该省。水墨是大面积平滑渐变，webp 有损压缩
    // 在这类内容上几乎看不出损失；jpeg 会在墨与纸的交界带出块效应，不用。
    // 用系统 cwebp 而非 sharp：worktree 的 node_modules 是 pnpm strict 布局，
    // 主仓能 require 到的包在这里未必装了（探针跑在主仓、脚本跑在 worktree 就会误判）。
    const tmp = `${OUT}${s.name}.tmp.png`;
    writeFileSync(tmp, raw);
    execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', '1280', '0', tmp, '-o', `${OUT}${s.name}.webp`]);
    unlinkSync(tmp);
    const buf = readFileSync(`${OUT}${s.name}.webp`);
    if (buf.length > BUDGET) throw new Error(`超预算 ${buf.length} B > ${BUDGET} B`);
    done.push({ name: s.name, bytes: buf.length, from: raw.length });
    await ctx.close();
  } catch (err) {
    failed.push({ name: s.name, err: String(err).slice(0, 160) });
  }
}
await br.close();

console.log('分母：目标海报', SHOTS.length, '· 生成', done.length, '· 失败', failed.length);
for (const d of done) console.log(`  ✅ ${d.name}.webp  ${d.bytes} B（原始帧 ${d.from} B，预算 ${BUDGET} B）`);
for (const f of failed) console.log(`  🔴 ${f.name}  ${f.err}`);
if (failed.length > 0) process.exit(1);
// 闭合账：声称生成的必须真的在盘上
const missing = done.filter((d) => !existsSync(`${OUT}${d.name}.webp`));
if (missing.length > 0) {
  console.error('🔴 声称生成但盘上不存在：', missing.map((m) => m.name).join(', '));
  process.exit(1);
}
console.log('✅ 海报全部就位');
