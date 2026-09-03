import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
const OUT = 'evidence/nexus-hall/anchors/w1b-dry'; mkdirSync(OUT, { recursive: true });
const U = 'http://localhost:4321/website/world-spike/nexus-ink/?demo=yin&t=4';
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
const run = async (name, where) => {
  await pg.goto(U, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
  const box = await pg.evaluate((w) => {
    const s = globalThis.__inkSurface, d = globalThis.__inkDry;
    const pt = w === 'dry' ? { x: d.x, y: d.y } : w === 'wet' ? { x: 0.42, y: 0.55 } : null;
    if (pt) { s.engine.drop(pt.x, pt.y, 0.05, [1.5, 1.9, 1.2], 7); s.seek(1.5); }
    const c = document.querySelector('canvas').getBoundingClientRect();
    // uv 原点在左下 → 屏幕 y 翻转
    const H = 0.035;
    return { x: Math.round(c.x + (d.x - H) * c.width), y: Math.round(c.y + (1 - d.y - H) * c.height),
             width: Math.round(2 * H * c.width), height: Math.round(2 * H * c.width) };
  }, where);
  const b = await pg.screenshot({ path: `${OUT}/${name}.png`, clip: box });
  return createHash('sha256').update(b).digest('hex').slice(0, 12);
};
const none = await run('a-nothing', 'none');
const dry  = await run('b-drop-in-dry', 'dry');
const wet  = await run('c-drop-in-wet', 'wet');
await br.close();
console.log('干区裁切 sha —— 什么都不落:', none);
console.log('                在干区落一滴:', dry, dry === none ? '✅ 干纸拒墨（负控 PASS）' : '🔴 墨进去了');
console.log('           在湿区落一滴(正控):', wet, wet !== none ? '✅ drop API 确实有效' : '🔴 drop 根本没生效，上面的"拒墨"不成立');
