// [NX-W17 回城协议] 楼 → 城接缝 2×2（world-chromium 串行 project，cyber-city-nexus-transit.spec 同纪律）
//   正控：/?poi=agent-nexus&from=hall → 跳过机器人仪式，host[data-world-state] 直达 car_ready；
//         yaw ≈ 车头朝街（exitHeading ?? heading+180，与 Areas.exitHeadingOf 同式）；filters driving：
//         V 切 fpv（__worldSpike.state().view）；session.log 有 world-resume{poi}；回城幕布挂类且车就位后卸。
//   负控：/?poi=agent-nexus（无 from=hall）→ 无 data-world-state、无 world-resume、V 不生效（wandering 灰盒腿不变）。
//   375：from=hall 免 viewport 门（自动挂载，无「进入科技城」封面）；无 from=hall 仍拦（data-blocked=viewport）。
//   楼侧：返回链接 href 含 from=hall；点击后 <html> 挂 hall-leaving + fx 属性再跳转；到达城侧 URL 带 from=hall。
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const PAGE_URL = '/website/';
const MOUNT_TIMEOUT = 210_000;

const buildingsJson = JSON.parse(
  readFileSync(new URL('../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
) as { buildings: Array<{ id: string; arrivalFx?: string; parkingBay: { heading: number; exitHeading?: number } }> };

interface Dump { events: Array<{ seq: number; type: string; data?: Record<string, unknown> }> }
interface SpikeState { yaw: number; view: 'third' | 'fpv' }
const readDump = (page: Page): Promise<Dump> =>
  page.evaluate(() => (window as unknown as { __worldSession: { dump(): unknown } }).__worldSession.dump() as Dump);
const readState = (page: Page): Promise<SpikeState> =>
  page.evaluate(() => (window as unknown as { __worldSpike: { state(): unknown } }).__worldSpike.state() as SpikeState);
const worldState = (page: Page): Promise<string | null> =>
  page.locator('[data-world-host]').getAttribute('data-world-state');
/** 与 Areas.exitHeadingOf / index.ts 同一换算：rotationY = π/2 − heading·π/180 */
const rotationOf = (headingDeg: number): number => Math.PI / 2 - (headingDeg * Math.PI) / 180;
const angleDiff = (a: number, b: number): number => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

test.describe('楼 → 城 · 回城协议（NX-W17 · world-chromium 串行）', () => {
  test.describe.configure({ mode: 'serial', timeout: 480_000 });

  test('正控：?poi=agent-nexus&from=hall → 跳过仪式直达 car_ready，车头朝街，V 可切视角，幕布卸下', async ({ page }) => {
    test.setTimeout(600_000);
    await page.goto(`${PAGE_URL}?poi=agent-nexus&from=hall`);
    // 首帧幕布：head 脚本挂类（body 脚本接管后 --dom 类也在）
    await expect(page.locator('html')).toHaveClass(/world-return/);
    await expect(page.locator('html')).toHaveAttribute('data-return-fx', 'ink');
    await expect(page.locator('[data-world-host]')).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    // 状态机：不经 robot_idle/transforming，直达 car_ready（Reveal 镜像）
    await expect.poll(() => worldState(page), { timeout: 60_000 }).toBe('car_ready');
    const dump = await readDump(page);
    expect(dump.events.some((e) => e.type === 'world-resume' && e.data?.poi === 'agent-nexus'), 'world-resume{poi} 入账').toBe(true);
    expect(dump.events.some((e) => e.type === 'robot-idle' || e.type === 'transform-start'), '不得走首幕漏斗').toBe(false);
    // 车头朝街：exitHeading ?? heading+180
    const nexus = buildingsJson.buildings.find((b) => b.id === 'agent-nexus')!;
    const expected = rotationOf(nexus.parkingBay.exitHeading ?? (nexus.parkingBay.heading + 180) % 360);
    const state = await readState(page);
    expect(angleDiff(state.yaw, expected), `yaw ${state.yaw} 应≈ ${expected}（朝街）`).toBeLessThan(0.05);
    // 幕布让位：车就位后 0.95s 内 visibility hidden
    await expect.poll(
      () => page.evaluate(() => getComputedStyle(document.querySelector('[data-world-return]')!).visibility),
      { timeout: 10_000 },
    ).toBe('hidden');
    // filters driving：V 生效（driveView.gate=car_ready 放行）
    expect(state.view).toBe('third');
    await page.keyboard.press('v');
    await expect.poll(async () => (await readState(page)).view, { timeout: 10_000 }).toBe('fpv');
    await expect(page.locator('[data-world-host]')).toHaveAttribute('data-drive-view', 'fpv');
  });

  test('负控：?poi=agent-nexus（无 from=hall）→ 灰盒深链腿不变：无 data-world-state、无 world-resume、V 不生效', async ({ page }) => {
    test.setTimeout(600_000);
    await page.goto(`${PAGE_URL}?poi=agent-nexus`);
    await expect(page.locator('html')).not.toHaveClass(/world-return/);
    await expect(page.locator('[data-world-host]')).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await page.waitForTimeout(3000);
    expect(await worldState(page)).toBeNull();
    const dump = await readDump(page);
    expect(dump.events.some((e) => e.type === 'world-resume')).toBe(false);
    await page.keyboard.press('v');
    await page.waitForTimeout(1500);
    expect((await readState(page)).view).toBe('third');
    // 朝楼门（原深链语义）
    const nexus = buildingsJson.buildings.find((b) => b.id === 'agent-nexus')!;
    expect(angleDiff((await readState(page)).yaw, rotationOf(nexus.parkingBay.heading))).toBeLessThan(0.05);
  });

  test('375 · 2×2：from=hall 免 viewport 门自动挂载；无 from=hall 仍拦「进入科技城」', async ({ browser }) => {
    test.setTimeout(600_000);
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(`${PAGE_URL}?poi=agent-nexus`);
    await expect(page.locator('[data-world-host]')).toHaveAttribute('data-blocked', 'viewport', { timeout: 30_000 });
    await expect(page.locator('[data-world-enter]')).toBeVisible();

    await page.goto(`${PAGE_URL}?poi=agent-nexus&from=hall`);
    await expect(page.locator('html')).toHaveClass(/world-return/);
    await expect(page.locator('[data-world-enter]')).toBeHidden();
    await expect(page.locator('[data-world-host]')).not.toHaveAttribute('data-blocked', 'viewport');
    await expect(page.locator('[data-world-host]')).toHaveAttribute('data-state', /loading|ready/, { timeout: 30_000 });
    await ctx.close();
  });

  test('楼侧：返回链接带 from=hall，点击先挂退场类（ink）再跳转；about 厅缺省 fade', async ({ page }) => {
    // 拦下 world 分包不必真挂载：只断 URL 与 <html> 类
    await page.goto(`${PAGE_URL}world/agent-nexus/?from=city&poi=agent-nexus`);
    const back = page.locator('.hall-chrome-back');
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute('href', /\?poi=agent-nexus&from=hall$/);
    await page.route(/\/website\/(\?.*)?$/, (route) => void route.fulfill({ status: 200, body: '<html><body>city</body></html>' }));
    await back.click();
    await expect(page.locator('html')).toHaveClass(/hall-leaving/);
    await expect(page.locator('html')).toHaveAttribute('data-hall-leaving-fx', 'ink');
    await page.waitForURL(/\/website\/\?poi=agent-nexus&from=hall$/, { timeout: 10_000 });

    await page.goto(`${PAGE_URL}world/about-pavilion/?from=city&poi=about-pavilion`);
    const back2 = page.locator('.hall-chrome-back');
    await expect(back2).toHaveAttribute('href', /\?poi=about-pavilion&from=hall$/);
    await back2.click();
    await expect(page.locator('html')).toHaveAttribute('data-hall-leaving-fx', 'fade');
    await page.waitForURL(/\/website\/\?poi=about-pavilion&from=hall$/, { timeout: 10_000 });
  });

  test('后退兜底：合法到达厅写 sessionStorage[world-return-v1]；城侧无参数时据此续驶并清键', async ({ page }) => {
    test.setTimeout(600_000);
    await page.goto(`${PAGE_URL}world/agent-nexus/?from=city&poi=agent-nexus`);
    await expect(page.locator('.hall-chrome-back')).toBeVisible();
    const stored = await page.evaluate(() => sessionStorage.getItem('world-return-v1'));
    expect(stored && (JSON.parse(stored) as { poi: string }).poi).toBe('agent-nexus');
    // 直接落地（无 from=city）不写
    await page.goto(`${PAGE_URL}world/about-pavilion/`);
    expect((await page.evaluate(() => JSON.parse(sessionStorage.getItem('world-return-v1') || 'null')) as { poi: string } | null)?.poi).toBe('agent-nexus');

    await page.goto(PAGE_URL);
    await expect(page.locator('html')).toHaveClass(/world-return/);
    await expect(page.locator('html')).toHaveAttribute('data-return-poi', 'agent-nexus');
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('world-return-v1')), { timeout: 10_000 }).toBeNull();
    await expect(page.locator('[data-world-host]')).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect.poll(() => worldState(page), { timeout: 60_000 }).toBe('car_ready');
  });
});
