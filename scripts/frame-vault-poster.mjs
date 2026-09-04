#!/usr/bin/env node
/**
 * 帧库 · Frame Vault —— 构建期海报生成。
 *
 * 做法整体移植自 scripts/nexus-poster.mjs（同一套「预热 + 真实就绪信号等待 +
 * preserveDrawingBuffer 强制 + 截 canvas 元素本身 + webp 转码 + 非底色像素占比内容门」
 * 的构建期截图流水线），落点改到帧库（src/components/city/halls/vault/{Vault.astro,Vault.ts}）。
 *
 * 与 nexus 那条路径的关键差异（读过 Vault.ts/VolumeEngine.ts 才知道，不是凭记忆搬）：
 * - nexus 的 Yin.astro/Flow.astro 走 `?poster=1` 查询参数把 `preserveDrawingBuffer` 打开
 *   （见 Flow.astro:169-173、Yin.astro:193-197）；Vault.ts:42 的 `VolumeEngine.create(this.canvas)`
 *   没有对应开关（VolumeEngine.ts:48 `preserve = false` 是硬编码默认值），本脚本不许改 Vault.ts，
 *   于是改用 `page.addInitScript()` 在 Vault 自己的模块脚本跑之前，把
 *   `HTMLCanvasElement.prototype.getContext` 换成一层强制 `preserveDrawingBuffer: true` 的壳——
 *   效果等价于 `?poster=1`，落点从「页面自己读 query」搬到「构建期截图脚本自己的浏览器上下文」。
 * - 帧库有明确的「装载完成」信号：`section[data-vault]` 的 `data-vault-state` 从
 *   loading → idle（真机 < 1s，SwiftShader 软渲染可能 20–60s），不用像 nexus 那样猜墙钟等待时长。
 * - 斜切海报要经 `window.__vault.set({cut,tilt,rx,ry})` 改目标视角，Vault.ts:tick() 里的阻尼
 *   （非 reduced-motion 时 k=0.18/帧）会自驱收敛，本脚本用 `__vault.state()` 轮询读实际数值，
 *   不猜帧数。
 *
 * 前置：先 `pnpm astro build`，再另开终端 `npx astro preview --host 127.0.0.1 --port <port>`
 * （preview 是常驻进程，本脚本不负责起停它，跑完记得手动关掉）。
 *
 *   node scripts/frame-vault-poster.mjs --origin http://127.0.0.1:4351
 *
 * 退出码：0 两张海报全部生成且过内容门；1 任一失败或非底色占比不达标（不产出半套海报）；
 * 2 前置缺失（origin 不可达）。无论红绿先打印分母（目标数、实际数、字节、占比、耗时）。
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const ORIGIN = flag('--origin') ?? process.env.POSTER_ORIGIN ?? 'http://127.0.0.1:4351';
const OUT = fileURLToPath(new URL('../public/posters/', import.meta.url));
const BASE = '/website';
const HALL = `${BASE}/world/frame-vault/`;

/** 底色 #05070d 附近的像素判「底色」；容差按通道，海报必须真的切开了帧体，不能只截到黑底 */
const BG = [0x05, 0x07, 0x0d];
const BG_TOLERANCE = 10;
const MIN_NON_BG_RATIO = 0.20;

// 每张海报：目标视角（null = 用 Vault 装载完成后的默认视角，不用额外 set）+ 目标文件名
const SHOTS = [
  { name: 'frame-vault-idle', view: null },
  { name: 'frame-vault-tilted', view: { cut: 0.55, tilt: 0.35, rx: 0.32, ry: -0.55 } },
];

// 🔴 视口宽度实测过：帧体盒子在画面里的像素尺寸由 shader 相机固定（VolumeEngine.ts render()
// uEye/HALF 常量），近似只随 canvas 高度缩放、不随宽度缩放——1440×640 左右（磊哥原话给的参考
// 尺寸）实测非底色占比只有 ~12.2%（idle）/~12.4%（tilted），过不了 ≥20% 的内容门。逐档实测
// （900/1000/1100/1200/1440 宽度）确认占比随宽度收窄单调上升，850 宽度已到临界的 20.9%，
// 780 宽度量到 idle 23.1% / tilted 22.8%，留出安全边际不贴门槛。canvas 高度仍按 stage 的
// clamp(420px,64svh,760px) 走，780×1000 视口下量到 780×680——比参考尺寸窄，是内容门（硬约束）
// 与尺寸参考（软指引）冲突时取的优先级，非任意选择。
const VIEWPORT = { width: 780, height: 1000 };

const ping = await fetch(`${ORIGIN}${BASE}/`).then((r) => r.ok).catch(() => false);
if (!ping) {
  console.error(`前置缺失：${ORIGIN}${BASE}/ 不可达。先 pnpm astro build 再 npx astro preview --host 127.0.0.1 --port <port>`);
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });

const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const done = [];
const failed = [];

const MAX_ATTEMPTS = 2; // SwiftShare 软渲染下偶发单次 context/首帧异常（踏勘记录见文末），重试一次再判失败

for (const s of SHOTS) {
  const t0 = Date.now();
  let lastErr = null;
  let ok = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !ok; attempt++) {
    let ctx;
    try {
      ctx = await br.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
      // 强制 preserveDrawingBuffer（见文件头注释）：必须在 Vault 的模块脚本第一次
      // `canvas.getContext('webgl2', …)` 之前打进去，addInitScript 保证跑在页面自身脚本之前。
      await ctx.addInitScript(() => {
        const orig = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, opts) {
          if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') {
            opts = { ...(opts || {}), preserveDrawingBuffer: true };
          }
          return orig.call(this, type, opts);
        };
      });
      const page = await ctx.newPage();
      // 预热一次再正式截 —— 纯保险，移植自 nexus-poster.mjs（该仓台账 R14 曾观测到白屏，
      // 受控条件下复现不出；后续 NEXUS-HALL-AUDIT-LEDGER R13-5 定谳真因更可能是 build 写 dist
      // 与 preview 读文件之间的竞态，预热能规避，保留无害，成本很小）。
      await page.goto(ORIGIN + HALL, { waitUntil: 'load', timeout: 120000 });
      await page.waitForTimeout(1000);
      await page.goto(ORIGIN + HALL, { waitUntil: 'load', timeout: 120000 });

      // 真实就绪信号：data-vault-state 从 loading → idle；unsupported 是明确的失败分支
      // （WebGL2 初始化失败），不当成「还没到」继续等，直接报错。
      await page.waitForFunction(() => {
        const st = document.querySelector('[data-vault]')?.dataset.vaultState;
        return st === 'idle' || st === 'unsupported';
      }, null, { timeout: 65000 });
      const state = await page.evaluate(() => document.querySelector('[data-vault]')?.dataset.vaultState);
      if (state !== 'idle') throw new Error(`帧库未能进入 idle（当前 ${state}）—— 多半是 WebGL2 初始化失败`);

      if (s.view) {
        await page.evaluate((v) => {
          (window).__vault.set(v);
        }, s.view);
        // 阻尼逼近（Vault.ts tick() k=0.18/帧，reduced-motion 才是 1）直到收敛，
        // __vault.state() 读回判定，不猜需要等几帧。
        await page.waitForFunction((target) => {
          const st = (window).__vault.state();
          return ['cut', 'tilt', 'rx', 'ry'].every((k) => Math.abs(st[k] - target[k]) < 1e-3);
        }, s.view, { timeout: 20000, polling: 100 });
        // 收敛判定读的是 view 数值本身；再等一帧确保 render() 已经把这个数值画上 canvas。
        await page.waitForTimeout(120);
      } else {
        // 默认视角：mount() 里 view = {...target} 后就 requestFrame() 了，给一帧余量确保已绘制。
        await page.waitForTimeout(120);
      }

      const dims = await page.evaluate(() => {
        const c = document.querySelector('[data-vault-canvas]');
        return c ? { w: c.width, h: c.height } : null;
      });

      // 🔴 截的是 canvas 元素本身，不是整页：canvas 视觉上被 .vault__id / .vault__rail /
      // HUD 等绝对定位层压在上面，但那些层不参与 WebGL 合成语义判断——真正的风险是「整页截图
      // 因为 WebGL 缓冲被清空而读到底色」，locator.screenshot() 精确裁到 canvas 的合成后像素，
      // 移植自 nexus-poster.mjs 同一处理（该脚本对 nexus-yin/nexus-flow 两张海报用的是同一招）。
      const raw = await page.locator('[data-vault-canvas]').screenshot({ type: 'png' });
      if (raw.length < 20_000) throw new Error(`原始帧疑似空白（${raw.length} B）`);

      const ratio = nonBgRatio(raw);
      if (ratio < MIN_NON_BG_RATIO) {
        throw new Error(`非底色像素占比 ${(ratio * 100).toFixed(1)}% < ${(MIN_NON_BG_RATIO * 100).toFixed(0)}%（疑似只截到底色，没真的切开帧体）`);
      }

      const tmp = `${OUT}${s.name}.tmp.png`;
      writeFileSync(tmp, raw);
      execFileSync('cwebp', ['-quiet', '-q', '82', tmp, '-o', `${OUT}${s.name}.webp`]);
      unlinkSync(tmp);
      const buf = readFileSync(`${OUT}${s.name}.webp`);
      done.push({ name: s.name, bytes: buf.length, from: raw.length, ratio, dims, ms: Date.now() - t0, attempt });
      ok = true;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) console.log(`  ⚠️ ${s.name} 第 ${attempt} 次尝试失败，重试：${String(err).slice(0, 160)}`);
    } finally {
      await ctx?.close().catch(() => undefined);
    }
  }
  if (!ok) failed.push({ name: s.name, err: String(lastErr).slice(0, 220), ms: Date.now() - t0 });
}
await br.close();

console.log('分母：目标海报', SHOTS.length, '· 生成', done.length, '· 失败', failed.length);
for (const d of done) {
  const dimStr = d.dims ? `${d.dims.w}×${d.dims.h}` : '?×?';
  console.log(`  ✅ ${d.name}.webp  ${d.bytes} B（原始帧 ${d.from} B，${dimStr}，非底色 ${(d.ratio * 100).toFixed(1)}%，${d.ms} ms）`);
}
for (const f of failed) console.log(`  🔴 ${f.name}  ${f.err}（${f.ms} ms）`);
if (failed.length > 0) process.exit(1);
// 闭合账：声称生成的必须真的在盘上
const missing = done.filter((d) => !existsSync(`${OUT}${d.name}.webp`));
if (missing.length > 0) {
  console.error('🔴 声称生成但盘上不存在：', missing.map((m) => m.name).join(', '));
  process.exit(1);
}
console.log('✅ 海报全部就位');

/**
 * 零依赖 PNG 解码 + 非底色像素占比。只服务本脚本的内容门，只认 8-bit 深度、
 * 非隔行扫描（Chromium 截图产出的形状），color type 2（RGB）/ 6（RGBA）/ 0（灰度）/ 4（灰度+alpha）。
 * 是 scripts/lib/png-gray.mjs 编码器的逆操作（同样用 node:zlib，那边 deflateSync，这边 inflateSync）。
 */
function nonBgRatio(pngBuf) {
  if (pngBuf.length < 8 || pngBuf.readUInt32BE(0) !== 0x89504e47) throw new Error('非底色占比：不是合法 PNG（签名不符）');
  let off = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idatChunks = [];
  while (off < pngBuf.length) {
    const len = pngBuf.readUInt32BE(off);
    const type = pngBuf.toString('ascii', off + 4, off + 8);
    const data = pngBuf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    off += 8 + len + 4; // length + type + data + crc
  }
  if (!width || !height) throw new Error('非底色占比：PNG 缺 IHDR');
  if (bitDepth !== 8) throw new Error(`非底色占比：只支持 8-bit 深度，实际 ${bitDepth}`);
  if (interlace !== 0) throw new Error('非底色占比：不支持隔行扫描 PNG');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`非底色占比：不支持的 color type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idatChunks));
  const bpp = channels; // 8-bit 深度下 bytes-per-pixel == channels
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  let ri = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[ri++];
    const rowStart = y * stride;
    const priorStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const raw_x = raw[ri++];
      const a = x >= bpp ? out[rowStart + x - bpp] : 0;
      const b = y > 0 ? out[priorStart + x] : 0;
      const c = y > 0 && x >= bpp ? out[priorStart + x - bpp] : 0;
      let v;
      switch (filter) {
        case 0: v = raw_x; break;
        case 1: v = raw_x + a; break;
        case 2: v = raw_x + b; break;
        case 3: v = raw_x + ((a + b) >> 1); break;
        case 4: v = raw_x + paeth(a, b, c); break;
        default: throw new Error(`非底色占比：未知 filter 类型 ${filter}`);
      }
      out[rowStart + x] = v & 0xff;
    }
  }

  let nonBg = 0;
  const total = width * height;
  for (let p = 0; p < total; p++) {
    const base = p * bpp;
    let r, g, b;
    if (channels === 1 || channels === 2) { r = g = b = out[base]; }
    else { r = out[base]; g = out[base + 1]; b = out[base + 2]; }
    const isBg = Math.abs(r - BG[0]) <= BG_TOLERANCE && Math.abs(g - BG[1]) <= BG_TOLERANCE && Math.abs(b - BG[2]) <= BG_TOLERANCE;
    if (!isBg) nonBg++;
  }
  return nonBg / total;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}
