import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
// 🔴 重拍：上一版 9 宫格是在 smoothstep 修好【之前】拍的，那时迁移率窗口仍是硬编码
// (0.02,0.45) 且 uMobHi 断线 —— 基础形态与现役不同，旧图的锁值结论作废。
const OUT = 'evidence/nexus-hall/anchors/w1b-grid2'; mkdirSync(OUT, { recursive: true });
const B = 'http://localhost:4321/website/world-spike/nexus-ink/?demo=yin&t=7';
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
const shot = async (name, q) => {
  await pg.goto(B + q, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
  const b = await pg.locator('canvas').screenshot({ path: `${OUT}/${name}.png` });
  return createHash('sha256').update(b).digest('hex').slice(0, 12);
};
const rows = [];
for (const f of [0.35, 0.62, 0.85]) for (const bl of [0.35, 0.5, 0.7])
  rows.push({ cell: `f${f}-b${bl}`, sha: await shot(`f${f}-b${bl}`, `&fibre=${f}&bleed=${bl}`) });
for (const m of [0.45, 0.65, 0.85])
  rows.push({ cell: `mobhi${m}`, sha: await shot(`mobhi${m}`, `&mobhi=${m}`) });
await br.close();
console.table(rows);
console.log('唯一出图数:', new Set(rows.map(r => r.sha)).size, '/', rows.length);
