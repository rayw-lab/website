// 墨迹 · Ink Ledger —— W3/W4 组件的部署态验收。
// 现阶段验的是 world-spike 工程页（正式路由在 W5 接线）。不改 playwright.config.ts。
//
// 🔴 本文件的判据全部**对着 ledger 真值**断言，不写死数字：
// 展厅的立论是「数字由 ledger 渲染、不手写」，测试若自己手写数字就是把立论废掉。
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { u } from './helpers';

const YIN = '/world-spike/nexus-yin/';
const FLOW = '/world-spike/nexus-flow/';
const HALL = '/world-spike/nexus-hall/';

// Node 22 ESM import 断言坑（AGENTS.md §4.3）：JSON 用 readFileSync 读，不用 import
const ledger = JSON.parse(readFileSync(new URL('../src/data/nexus-ledger.json', import.meta.url), 'utf8'));

test.describe('S0 洇', () => {
  test('200 · canvas 就位 · 题款两行不折行 · 无降级', async ({ page }) => {
    const res = await page.goto(u(YIN));
    expect(res?.status()).toBe(200);
    const canvas = page.locator('[data-yin-canvas]');
    await expect(canvas).toHaveCount(1);
    // canvas 的 backing store 必须跟上 CSS 尺寸（曾因样式失效退回默认 300×150）
    const size = await canvas.evaluate((c: HTMLCanvasElement) => ({ w: c.width, h: c.height }));
    expect(size.w).toBeGreaterThan(320);
    expect(size.h).toBeGreaterThan(200);
    // 纸色背景必须来自组件而非浏览器默认白
    const bg = await page.locator('.yin').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).toBe('rgb(239, 233, 220)');
    // 两行题款各自单行：折行会让高度翻倍
    const hs = await page.locator('.yin__l').evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().height)),
    );
    expect(hs).toHaveLength(2);
    expect(Math.max(...hs) / Math.min(...hs)).toBeLessThan(1.6);
    await expect(page.locator('[data-nexus-yin]')).not.toHaveAttribute('data-yin-fallback', /.+/);
  });
});

test.describe('S1 墨流', () => {
  test('注入条数与 ledger 明细一致，且不手写数字', async ({ page }) => {
    await page.goto(u(FLOW));
    const injected = await page.evaluate(
      () => JSON.parse(document.querySelector('[data-flow-data]')?.textContent ?? '{}').items?.length ?? 0,
    );
    expect(injected).toBe(ledger.sessions.length);
  });

  test('canvas 有等价文本（无障碍）', async ({ page }) => {
    await page.goto(u(FLOW));
    const label = await page.locator('[data-flow-canvas]').getAttribute('aria-label');
    expect(label).toBeTruthy();
    // 等价文本也必须由数据派生：含真实会话数
    expect(label).toContain(String(ledger.sessions.length));
  });
});

test.describe('印 · 三态严格对应机器收据', () => {
  test('总计数与 ledger 的 identityOk 分布一致', async ({ page }) => {
    await page.goto(u(HALL));
    const rs = ledger.receipts as Array<{ identityOk: boolean | null }>;
    const go = rs.filter((r) => r.identityOk === true).length;
    const nogo = rs.filter((r) => r.identityOk === false).length;
    const unknown = rs.length - go - nogo;
    const text = (await page.locator('.seals__n').innerText()).replace(/\s+/g, ' ');
    expect(text).toContain(`朱文 ${go}`);
    expect(text).toContain(`白文 ${nogo}`);
    expect(text).toContain(`灰印 ${unknown}`);
  });

  test('🔴 identity_ok 缺失必须是灰印，禁止被渲染成 GO', async ({ page }) => {
    await page.goto(u(HALL));
    const states = await page.locator('[data-seal]').evaluateAll((els) =>
      els.map((e) => ({ state: (e as HTMLElement).dataset.state, f: (e as HTMLElement).dataset.fields ?? '' })),
    );
    for (const s of states) {
      const ok = /"identity_ok","(\w+)"/.exec(s.f)?.[1];
      if (ok === 'null') expect(s.state).toBe('unknown');
      if (ok === 'true') expect(s.state).toBe('go');
      if (ok === 'false') expect(s.state).toBe('nogo');
    }
  });

  test('抽屉：初始关闭 → 点击开一屉 → 再点关闭', async ({ page }) => {
    await page.goto(u(HALL));
    const drawer = page.locator('[data-drawer]');
    await expect(drawer).toBeHidden();
    const first = page.locator('[data-seal]').first();
    await first.click();
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('dt')).toHaveCount(5);
    await first.click();
    await expect(drawer).toBeHidden();
  });

  test('印阵不能整片来自同一席（排序会让稀有态整类消失）', async ({ page }) => {
    await page.goto(u(HALL));
    const names = await page.locator('.seal__l1').evaluateAll((els) =>
      [...new Set(els.map((e) => e.textContent ?? ''))],
    );
    expect(names.length).toBeGreaterThan(1);
  });
});

test.describe('降级', () => {
  test('reduced-motion：不起引擎，题款仍然可读', async ({ page }) => {
    // 🔴 用 emulateMedia 而不是 test.use({reducedMotion})：后者要与 project 的 use 合并，
    // 实测在本仓的 desktop-chromium project 下未生效（引擎照常挂载、fallback 属性为 null，
    // 断言收到的是 null 而不是别的 fallback 值 —— 这是"根本没走降级分支"的指纹）。
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(YIN));
    // 正控：先确认媒体查询真的生效，否则下面的断言在测一个没发生的条件
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await expect(page.locator('[data-nexus-yin]')).toHaveAttribute('data-yin-fallback', 'reduced-motion');
    await expect(page.locator('.yin__l').first()).toBeVisible();
    const op = await page.locator('.yin__l').first().evaluate((e) => getComputedStyle(e).opacity);
    expect(Number(op)).toBeGreaterThan(0.9);
  });
});
