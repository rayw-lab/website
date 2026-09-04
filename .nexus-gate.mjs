import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
const U = 'http://localhost:4321/website/world-spike/nexus-ink/?demo=yin&t=4';
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
// 唯一变量原则：mask 与「落不落笔」正交成 2x2，每一对只比同 mask 下的落笔差异。
// （全屏干纸会把整幅画的湿度清零、冻结已有的墨 —— 它与默认 mask 的差异跟落笔无关。）
const run = async (fullDry, drop) => {
  await pg.goto(U, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.inkDemo != null, null, { timeout: 60000 });
  await pg.evaluate(([f, d]) => {
    const s = globalThis.__inkSurface;
    if (f) s.engine.setDryMask([{ x: 0.5, y: 0.5, radius: 5 }]);
    if (d) s.engine.drop(0.42, 0.55, 0.06, [1.6, 2.0, 1.3], 3);
    s.seek(1.5);
  }, [fullDry, drop]);
  const b = await pg.locator('canvas').screenshot();
  return createHash('sha256').update(b).digest('hex').slice(0, 12);
};
const n0 = await run(false, false), n1 = await run(false, true);
const d0 = await run(true, false),  d1 = await run(true, true);
await br.close();
console.log(`默认 mask：不落笔 ${n0} / 落笔 ${n1}`);
console.log(`  → 正控（落笔必须有效）        :`, n1 !== n0 ? '✅ PASS' : '🔴 FAIL：drop 本身没生效');
console.log(`全屏干纸：不落笔 ${d0} / 落笔 ${d1}`);
console.log(`  → 负控（干纸必须一笔也进不去）:`, d1 === d0 ? '✅ PASS' : '🔴 FAIL：墨仍进了干纸');
