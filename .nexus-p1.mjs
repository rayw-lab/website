import { chromium } from '@playwright/test';
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
const U = 'http://localhost:4321/website/world-spike/nexus-ink/';

// ① resize：旋转/缩放后 backing store 与 FBO 必须一起跟上
await pg.goto(U, { waitUntil: 'load' });
await pg.waitForFunction(() => document.documentElement.dataset.inkReady != null, null, { timeout: 60000 });
const before = await pg.evaluate(() => {
  const c = document.querySelector('canvas');
  const r = globalThis.__inkSurface.engine.resolution;
  return { w: c.width, dye: r.dye.join('x') };
});
await pg.setViewportSize({ width: 640, height: 900 });   // 竖屏，模拟旋转
await pg.waitForTimeout(600);                             // debounce 180ms
const after = await pg.evaluate(() => {
  const c = document.querySelector('canvas');
  const r = globalThis.__inkSurface.engine.resolution;
  // 正控：resize 之后引擎仍能接受新笔
  globalThis.__inkSurface.engine.drop(0.5, 0.5, 0.05, [1.2, 1.2, 1.2], 5);
  globalThis.__inkSurface.engine.render();
  return { w: c.width, h: c.height, dye: r.dye.join('x'), css: Math.round(c.getBoundingClientRect().width) };
});
console.log('① resize  前', JSON.stringify(before), '→ 后', JSON.stringify(after));
console.log('   backing store 跟随 →', after.w !== before.w ? '✅' : '🔴 没跟上');
// dye 由 fit(shortSide=1280) 决定，只随【宽高比】变而非随尺寸变 —— 所以判据是比值不是数值
const rat = (s) => { const [w, h] = s.split('x').map(Number); return w / h; };
console.log('   dye 宽高比跟随 canvas →',
  Math.abs(rat(after.dye) - after.w / (after.h || after.w / rat(after.dye))) < 0.05 ? '✅' : '⚠️ 需核');
console.log('   宽高比未被拉伸 →', Math.abs(after.w / (after.css || 1) - 1) < 2 ? '✅' : '🔴');

// ② idle 停转：回放场景（onFrame 恒存在）此前永不停转
await pg.goto(U, { waitUntil: 'load' });
await pg.waitForFunction(() => document.documentElement.dataset.inkReady != null, null, { timeout: 60000 });
const readT = () => pg.evaluate(() => {
  const m = /t=([\d.]+)s/.exec(document.querySelector('#hud')?.textContent ?? '');
  return m ? Number(m[1]) : null;
});
await pg.waitForTimeout(14500);
const t1 = await readT();
await pg.waitForTimeout(3500);
const t2 = await readT();
console.log(`② idle 停转  t=12s 阈值后读两次：${t1} → ${t2}`);
console.log('   模拟已停转 →', t1 !== null && t1 === t2 ? '✅' : `🔴 仍在推进（省电承诺是空的）`);
await br.close();
