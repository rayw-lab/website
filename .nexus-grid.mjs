import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
const OUT = 'evidence/nexus-hall/anchors/w1b-grid'; mkdirSync(OUT, { recursive: true });
const B = 'http://localhost:4321/website/world-spike/nexus-ink/?demo=yin&t=7';
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
const shot = async (name, q) => {
  await pg.goto(B + q, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
  const b = await pg.locator('canvas').screenshot({ path: `${OUT}/${name}.png` });
  return createHash('sha256').update(b).digest('hex').slice(0, 12);
};
// ① 定谳负控：mobHi=5.0 远大于任何湿度 → 迁移率应几乎恒 0，墨几乎不动。
//    若仍与 base 同 sha，则 uMobHi uniform 根本没接进管线（而非"旋钮无效"）。
const base = await shot('_base', '');
const ext  = await shot('_mobhi5', '&mobhi=5.0');
console.log('[uniform 定谳] mobHi=5.0 vs base:', ext !== base ? 'uniform 已接通，mobHi 只是在当前湿度下无效' : '🔴 uMobHi 未接进管线');
// ② 视觉锁值网格
const rows = [];
for (const f of [0.35, 0.62, 0.85]) for (const bl of [0.35, 0.5, 0.7])
  rows.push({ cell: `f${f}-b${bl}`, sha: await shot(`f${f}-b${bl}`, `&fibre=${f}&bleed=${bl}`) });
await br.close();
console.table(rows);
console.log('唯一出图数:', new Set(rows.map(r => r.sha)).size, '/ 9');
