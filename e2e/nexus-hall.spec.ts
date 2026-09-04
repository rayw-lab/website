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
    // 两行题款各自单列不折行。🔴 题款改真竖排后判据必须换量纲：
    // 竖排下折行表现为**列数增加**（宽度翻倍），高度反而是内容长度，比高度会误判。
    // 判据 = 每一列宽度 ≈ 一个行高（竖排时 line-height 就是列宽），
    // 折成第二列会让它翻倍。🔴 分母是 line-height 不是 font-size：
    // 实测列宽 70px = 字号 38 × 行高 1.85，拿字号当分母会把正常单列判成折行。
    const cols = await page.locator('.yin__l').evaluateAll((els) =>
      els.map((e) => ({
        w: e.getBoundingClientRect().width,
        lh: parseFloat(getComputedStyle(e).lineHeight),
      })),
    );
    expect(cols).toHaveLength(2);
    for (const c of cols) expect(c.w / c.lh).toBeLessThan(1.4);
    // 正控：确实处在竖排模式（否则上面的判据在水平排版下恒真，等于没测）
    const wm = await page.locator('.yin__h').evaluate((e) => getComputedStyle(e).writingMode);
    expect(wm).toMatch(/vertical/);
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

  // 🔴 单独放宽超时，原因写在这里而不是调全局：本条与一个正在跑的重型 WebGL
  // 构图**同页竞争主线程**。CI 用 SwiftShader，实测约 0.7 帧/秒，600 滴的构图要
  // 跑约 75 秒，期间点击响应被饿慢 —— 放宽后稳定通过（实测 1.3 分钟）。
  // 断言一个字没松：仍然要求点开、5 个字段、再点关闭。放宽的是环境余量，不是判据。
  // 这条同时是**已知弱设备限制**的登记点：无 GPU 环境下展厅交互会变迟钝。
  test.describe.configure({ timeout: 240_000 });
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

  test('降级海报真的加载出来（不只是属性设了）', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(YIN));
    const poster = page.locator('.yin__poster');
    await expect(poster).toBeVisible();
    // 🔴 正控到「像素层」：hidden=false 只说明我们把它显示了，
    // naturalWidth>0 才说明浏览器**真的取到了图**。海报 404 时前者照样通过。
    const loaded = await poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0);
    expect(loaded).toBe(true);
  });
});

// ── 正式路由 /world/agent-nexus/（NX-W5 接线）────────────────────────────────
// 此前展厅只活在 /world-spike/ 下，进不了城。这一组断言的是「真的接进去了」，
// 不是「组件能渲染」——后者 spike 页早就绿了，而绿了两天城里仍然没有这栋楼。
test.describe('接线 · /world/agent-nexus/', () => {
  const HALL = '/world/agent-nexus/';

  test('200 · 楼壳就位 · 台账数字进 <title>/描述', async ({ page }) => {
    const res = await page.goto(u(HALL));
    expect(res?.status()).toBe(200);
    // 展厅壳（data-hall）与到达条都必须在，否则只是「一个页面」不是「一间厅」
    await expect(page.locator('[data-hall="agent-nexus"]')).toHaveCount(1);
    await expect(page.locator('[data-hall-chrome]')).toHaveCount(1);
    await expect(page).toHaveTitle(/墨迹 · Ink Ledger/);
    // 描述里的数字必须与 ledger 相符（不写死，从数据读）
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(desc).toContain(String(ledger.totals.sessions));
    expect(desc).toContain(String(ledger.totals.days));
  });

  test('三幕都在同一页上：两块 canvas + 印阵', async ({ page }) => {
    await page.goto(u(HALL));
    await expect(page.locator('[data-yin-canvas]')).toHaveCount(1);
    await expect(page.locator('[data-flow-canvas]')).toHaveCount(1);
    expect(await page.locator('[data-nexus-seals] .seal').count()).toBeGreaterThan(0);
  });

  // 🔴 主题 2×2。正控证明纸色生效，负控证明它没漏到别的厅去。
  // 只做正控时，一条写漏的全局选择器会让 about 厅一起变成纸色而无人发现。
  test('主题正控：本厅是纸色', async ({ page }) => {
    await page.goto(u(HALL));
    const bg = await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).toBe('rgb(239, 233, 220)');
  });

  test('主题负控：about 厅必须仍是暗底（覆盖不许外漏）', async ({ page }) => {
    await page.goto(u('/world/about-pavilion/'));
    const bg = await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).toBe('rgb(4, 16, 32)');
  });
});
