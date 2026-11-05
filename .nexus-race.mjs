import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
// 三组对照，唯一变量 = 加载与 build 的时间关系
// A 不 build（基线）· B build 后立即 · C build 后等 8 秒
const U = 'http://localhost:4321/website/world-spike/nexus-yin/?poster=1';
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const shot = async () => {
  const c = await br.newContext({ viewport: { width: 1000, height: 640 } });
  const p = await c.newPage();
  await p.goto(U, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(11000);
  const buf = await p.screenshot();
  await c.close();
  return buf;
};
const rows = [];
for (const grp of ['A-nobuild', 'B-build-immediate', 'C-build-wait8s']) {
  for (let i = 0; i < 4; i++) {
    if (grp !== 'A-nobuild') {
      execSync('pnpm build', { stdio: 'ignore' });
      if (grp === 'C-build-wait8s') await new Promise((r) => setTimeout(r, 8000));
    }
    const b = await shot();
    writeFileSync(`/tmp/race-${grp}-${i}.png`, b);
    rows.push(`${grp} ${i} ${b.length}`);
    console.log(rows[rows.length - 1]);
  }
}
await br.close();
