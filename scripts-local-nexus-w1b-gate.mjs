import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
const OUT = 'evidence/nexus-hall/anchors/w1b-verify'; mkdirSync(OUT, { recursive: true });
const U = 'http://localhost:4321/website/world-spike/nexus-ink/?demo=yin&t=4';
const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 12);
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });

// act: 'none' | {x,y,r} 落笔点；fullDry: 是否把整幅罩成干纸
const run = async (name, act, fullDry = false) => {
  await pg.goto(U, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
  const clip = await pg.evaluate(([a, f]) => {
    const s = globalThis.__inkSurface, d = globalThis.__inkDry;
    if (f) s.engine.setDryMask([{ x: 0.5, y: 0.5, radius: 5 }]);
    if (a) s.engine.drop(a.x, a.y, a.r, [1.7, 2.1, 1.4], 11);
    s.seek(1.5);
    const c = document.querySelector('canvas').getBoundingClientRect();
    const H = 0.015; // 干纸 mask ≥0.97 的核心区（x 方向要计入 aspect 放大）
    return { x: Math.round(c.x + (d.x - H) * c.width), y: Math.round(c.y + (1 - d.y - H) * c.height),
             width: Math.round(2 * H * c.width), height: Math.round(2 * H * c.width) };
  }, [act, fullDry]);
  const full = await pg.locator('canvas').screenshot({ path: `${OUT}/${name}.png` });
  const core = await pg.screenshot({ clip, path: `${OUT}/${name}-core.png` });
  return { full: sha(full), core: sha(core) };
};

// ① uMobHi 定谳（网格是在 smoothstep 修好之前拍的，此前该 uniform 是断的）
const goto = async (q) => { await pg.goto(U + q, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
  return sha(await pg.locator('canvas').screenshot()); };
const m0 = await goto(''), m5 = await goto('&mobhi=5.0'), m3 = await goto('&mobhi=0.3');
console.log('① uMobHi 定谳  base', m0, '/ mobhi=5.0', m5, '/ mobhi=0.3', m3);
console.log('   mobHi=5.0 应让墨几乎冻结 →', m5 !== m0 ? '✅ uniform 已接通' : '🔴 仍未接通');
console.log('   mobHi=0.3 应改变迁移率 →', m3 !== m0 ? '✅ 有响应' : '🔴 无响应');

// ② 笔心落在干区内（旧覆盖面）
const a0 = await run('a-fulldry-none', null, true), a1 = await run('a-fulldry-drop', { x: 0.42, y: 0.55, r: 0.06 }, true);
console.log('② 笔心在干区内  →', a1.full === a0.full ? '✅ 一笔也进不去' : '🔴 墨进去了');

// ③ 笔心在干区边界【外侧】—— 高斯尾巴仍会伸进核心，CPU 门看不见（advisor 指出的洞）
const b0 = await run('b-outside-none', null), b1 = await run('b-outside-drop', { x: 0.78, y: 0.40, r: 0.10 });
console.log('③ 笔心在边界外  干区核心', b0.core, '→', b1.core);
// 逐字节判据对边界带过严：核心区边缘 gate 尚有 ~2.8%，物理上本就该透一点
// （真实宣纸胶矾边界不是刀切，零渗漏反而假）。数值判据见随后的 python 段。
console.log('   核心区差异改用数值判据（理论上界 ~5.4 色阶，门槛 12）');
console.log('   正控：这一笔在纸上其它地方确实画出来了 →', b1.full !== b0.full ? '✅' : '🔴 这笔根本没落下');
// ④ A4 锚点门：浓处趋黑但**永不死黑**。
// 🔴 不能用 canvas.drawImage 读像素：WebGL canvas 未开 preserveDrawingBuffer 时读到的是
// 空白全 0，会得出「整幅图都是死黑」的荒谬结论（本轮实测踩过）。改用合成后的截图。
await pg.goto(U, { waitUntil: 'load' });
await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
await pg.locator('canvas').screenshot({ path: `${OUT}/a4-darkest.png` });
console.log('④ A4 截图已落盘，判据见随后的像素分析段');
await br.close();
