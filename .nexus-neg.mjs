import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';

const OUT = 'evidence/nexus-hall/anchors/w1b-neg';
mkdirSync(OUT, { recursive: true });
const B = 'http://localhost:4321/website/world-spike/nexus-ink/?demo=yin&t=7';

// 判读标准（advisor 校准）：
//  L1 链路定谳 = __inkParams 读回值（与像素无关，唯一能区分"参数不敏感" vs "传参断了"）
//  L2 一阶像素探针 = bleed / spread / mobhi —— 它们才是"墨能走多远"的一阶量；
//     fibre/dry 是湿区剪影内的二阶量，出图相近属预期，不作链路证据。
const CASES = [
  ['base',     ''],
  ['base2',    ''],                 // 同 URL 二次 —— 确定性自证
  ['bleed002', '&bleed=0.02'],      // 一阶：几乎不洇
  ['spread04', '&spread=0.4'],      // 一阶：湿区自身扩得远
  ['mobhi03',  '&mobhi=0.3'],       // 一阶：迁移率窗口
  ['fibre0',   '&fibre=0'],         // 二阶：只去毛刺，湿斑几何仍在（不回高斯圆属正常）
];

const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
const rows = [];
for (const [name, q] of CASES) {
  await pg.goto(B + q, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
  const p = await pg.evaluate(() => globalThis.__inkParams ?? null);
  const buf = await pg.locator('canvas').screenshot({ path: `${OUT}/${name}.png` });
  rows.push({ name, sha: createHash('sha256').update(buf).digest('hex').slice(0, 12),
    bleed: p?.bleed, spread: p?.spread, mobHi: p?.mobHi, fibre: p?.fibre, sim: p?.simResolution });
}
await br.close();
console.table(rows);
const [a, b] = rows;
console.log('\n[确定性自证] base vs base2 同 sha:', a.sha === b.sha ? 'PASS' : `FAIL ${a.sha} != ${b.sha}`);
console.log('[桌面分支自证] simResolution===256:', rows.every(r => r.sim === 256) ? 'PASS' : 'FAIL');
const diff = rows.slice(2).filter(r => r.sha !== a.sha).map(r => r.name);
console.log('[像素响应] 与 base 出图不同的 case:', diff.join(', ') || '（无 —— 传参链路可疑）');
