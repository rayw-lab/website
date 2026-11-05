// [NX-W7] 城→厅转场「墨吞霓虹」城侧 2×2（world-chromium 串行 project，cyber-city-poi-arrival.spec 同纪律）
//   正控：?poi=agent-nexus 圈内 E → shot-apply{poi_showcase-agent-nexus} → hold 段 <html> 挂
//         `world-poi-hold-ink` + `data-poi-arrival-fx="ink"`（不挂霓虹脉冲类）→ navigate 被 route abort
//         拦下后墨幕最长驻留 1.5s 即卸（类与属性同卸，世界仍可开）。取证面走 DOM：session.log 有
//         观测规格白名单，不为一个转场扩 type。
//   负控：?poi=about-pavilion（无 arrivalFx）同一流程 → 永不出现 ink 类 / 属性。
//   断因果与终态，不断时长阈值；SwiftShader 慢动作下 hold 0.4 游戏秒可能是数秒墙钟。
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const PAGE_URL = '/website/';
const MOUNT_TIMEOUT = 210_000;
const INK_CLASS = 'world-poi-hold-ink';

const buildingsJson = JSON.parse(
  readFileSync(new URL('../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
) as { buildings: Array<{ id: string; hallPath?: string; arrivalFx?: string }> };

interface Dump { events: Array<{ seq: number; type: string; data?: Record<string, unknown> }>; funnel: { firstPoiIn: number | null } }
const readDump = (page: Page): Promise<Dump> =>
  page.evaluate(() => (window as unknown as { __worldSession: { dump(): unknown } }).__worldSession.dump() as Dump);
const rootClass = (page: Page): Promise<string> => page.evaluate(() => document.documentElement.className);
const rootFx = (page: Page): Promise<string | null> =>
  page.evaluate(() => document.documentElement.dataset.poiArrivalFx ?? null);

async function driveIntoPrelude(page: Page, poi: string): Promise<Dump> {
  await page.goto(`${PAGE_URL}?poi=${poi}#debug`);
  await expect(page.locator('[data-world-host]')).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
  await expect.poll(async () => (await readDump(page)).funnel.firstPoiIn !== null, { timeout: 90_000 }).toBe(true);
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await page.keyboard.press('e');
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      const d = await readDump(page);
      if (d.events.some((e) => e.type === 'shot-apply')) return d;
    }
  }
  throw new Error(`E 未触发 shot-apply（${poi}）`);
}

test.describe('城→厅转场 · 墨吞霓虹（NX-W7 · world-chromium 串行）', () => {
  test.describe.configure({ mode: 'serial', timeout: 480_000 });

  test('数据面：agent-nexus 登记 arrivalFx=ink 且有 hallPath；about-pavilion 无 arrivalFx', () => {
    const nexus = buildingsJson.buildings.find((b) => b.id === 'agent-nexus');
    const about = buildingsJson.buildings.find((b) => b.id === 'about-pavilion');
    expect(nexus?.arrivalFx).toBe('ink');
    expect(nexus?.hallPath).toBe('/world/agent-nexus/');
    expect(about?.arrivalFx).toBeUndefined();
  });

  test('正控：agent-nexus 圈内 E → hold 段挂墨幕类 + arrival-fx 入账 → 拦下跳转后墨幕自卸', async ({ page }) => {
    test.setTimeout(600_000);
    let navHits = 0;
    await page.route(/\/website\/world\/agent-nexus\/(\?.*)?$/, (route) => { navHits += 1; void route.abort('aborted'); });
    await driveIntoPrelude(page, 'agent-nexus');
    // hold 段：ink 类出现（tween 0.8 游戏秒后）；霓虹脉冲类不得同挂
    await expect.poll(() => rootClass(page), { timeout: 120_000 }).toMatch(new RegExp(INK_CLASS));
    expect(await rootClass(page)).not.toMatch(/world-poi-hold-pulse/);
    expect(await rootFx(page)).toBe('ink');
    const dump = await readDump(page);
    const apply = dump.events.find((e) => e.type === 'shot-apply');
    expect(apply?.data?.id).toBe('poi_showcase-agent-nexus');
    // 定帧期满 → navigate（被拦）→ 墨幕在 INK_LINGER 后自卸（类与属性同卸），世界可开
    await expect.poll(() => navHits, { timeout: 240_000 }).toBeGreaterThanOrEqual(1);
    await expect.poll(() => rootClass(page), { timeout: 10_000 }).not.toMatch(new RegExp(INK_CLASS));
    expect(await rootFx(page)).toBeNull();
  });

  test('负控：about-pavilion 同一流程永不出现墨幕类、无 arrival-fx', async ({ page }) => {
    test.setTimeout(600_000);
    let navHits = 0;
    await page.route(/\/website\/world\/about-pavilion\/(\?.*)?$/, (route) => { navHits += 1; void route.abort('aborted'); });
    await driveIntoPrelude(page, 'about-pavilion');
    let inkSeen = 0;
    const deadline = Date.now() + 240_000;
    while (navHits === 0 && Date.now() < deadline) {
      if (new RegExp(INK_CLASS).test(await rootClass(page))) inkSeen += 1;
      await page.waitForTimeout(250);
    }
    expect(navHits).toBeGreaterThanOrEqual(1);
    expect(inkSeen).toBe(0);
    expect(await rootFx(page)).toBeNull();
  });
});
