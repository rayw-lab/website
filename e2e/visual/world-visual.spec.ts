// `/`（Full Entry 科技城）视觉/3D 冒烟取证 —— CC-L0-setup 交付。
//
// 角色分工（与 e2e/cyber-city.spec.ts 的关系）：
//   cyber-city.spec.ts  = 世界剧本行为合同（零字节/状态机/计时/降级），断 DOM 信号；
//   本文件              = 视觉取证层：canvas 真的画了东西吗（像素级）+ 壳静态视觉基线
//                         （toHaveScreenshot）+ 取证截图落盘（test-results/visual/）。
//
// 计分接线（docs/research/cyber-city-score-loop-orchestration.md 综合分口径）：
//   标题带 @smoke3d 的用例 = 「3D 交互冒烟（首幕+POI+ESC）」维度（权重 15%），
//   scripts/score-loop.mjs 按该标签在 e2e JSON 结果中统计 PASS 项。
//
// 运行编排：visual-chromium project（playwright.config.ts）——fullyParallel=false
// 单 worker 顺序执行（SwiftShader 下并发 3D 上下文互相挤兑，先例见 world-chromium 注）；
// 快速单跑：pnpm test:visual（--no-deps 跳过前置 project 链）。
//
// 基线图纪律（toHaveScreenshot）：
//   基线入库 e2e/visual/__screenshots__/<spec>/<project>/<name>.png（snapshotPathTemplate）；
//   基线只在本 VM（SwiftShader/系统字体一致）生成与更新：
//   pnpm exec playwright test --project=visual-chromium --no-deps --update-snapshots
import { test, expect } from '@playwright/test';
import { u } from '../helpers';
import { captureEvidence, expectCanvasPainted } from '../helpers/visual';
import cityMap from '../../src/data/cyber-city-buildings.json' with { type: 'json' };

const PAGE_URL = u('/');

/** 挂载等待（cyber-city.spec.ts 文件头⑤ SwiftShader 校准口径）：全链实测 ~75-110s */
const MOUNT_TIMEOUT = 210_000;

/** POI 深链靶楼：概念车库（buildings JSON 在册，parkingBay=(140,-18)，默认出生点=原点） */
const POI_SLUG = 'concept-garage';

const SEL = {
  host: '[data-world-host]',
  canvas: '[data-world-canvas]',
  escMenu: '[data-world-esc-menu]',
} as const;

test.describe('科技城视觉/3D 冒烟取证（visual-chromium 单 worker 顺序执行）', () => {
  // 3D 用例（VIS-03/04）全链最长 ~210s 挂载 + 取证轮询；DOM 用例远快于此
  test.describe.configure({ timeout: 360_000 });

  // ---------------------------------------------------------------------------
  // VIS-01 壳静态视觉基线（toHaveScreenshot 目录纪律示范）
  // reduced-motion 钉死拦截态（data-blocked，零 world 字节、零动画）→ 壳纯静态可复现：
  // poster + H1 定位语 + 三支柱 + 楼宇快览 12 楼 + 顶栏六导航。
  // ---------------------------------------------------------------------------
  test('VIS-01 @visual 壳静态基线：reduced-motion 拦截态整壳截图与入库基线一致', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    // 拦截态落定 = 壳不再变化（load 后 evaluate() 写入 data-blocked）
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await expect(page.locator('h1')).toBeVisible();
    // poster（LCP 元素）已实际解码——避免半加载态截图假阴性
    const posterWidth = await page
      .locator('img[data-world-poster]')
      .evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(posterWidth, 'poster 应解码成功').toBeGreaterThan(0);

    await expect(page).toHaveScreenshot('world-shell-static.png');
  });

  // ---------------------------------------------------------------------------
  // VIS-02 ESC 菜单开合（综合分维度⑤「ESC」项）
  // SRD §12.7.8 出口④：Escape 开合的最小 DOM <dialog>，挂载前后均可用——
  // 本用例取挂载前（reduced-motion 静态壳）验证 DOM 出口本体 + 视觉基线。
  // ---------------------------------------------------------------------------
  test('VIS-02 @smoke3d ESC 菜单：Escape 开 → 双出口链接可见 → 截图基线 → Escape 关', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGE_URL);
    await expect(page.locator(SEL.host)).toHaveAttribute('data-blocked', 'reduced-motion');

    const menu = page.locator(SEL.escMenu);
    await expect(menu).not.toBeVisible(); // 初始闭合（<dialog> 未 open 不渲染）

    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();
    // 双出口真实 URL（内容永不进 3D）：Work 速览（autofocus）+ 内容首页
    const workLink = menu.locator('[data-world-esc-work]');
    await expect(workLink).toHaveAttribute('href', u('/work/'));
    await expect(workLink).toBeFocused(); // showModal + autofocus = 键盘可达第一焦点
    await expect(menu.locator(`a[href="${u('/home/')}"]`)).toBeVisible();

    await expect(page).toHaveScreenshot('world-esc-menu.png');

    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // VIS-03 首幕挂载取证（综合分维度⑤「首幕」项 + 验收「canvas 非空 + robot_idle」）
  // 自动挂载 → ready → robot_idle（Reveal 光柱落定，data-world-state 镜像），
  // 然后像素级断言 canvas 中心区已实际着色（非空/非纯色），整页取证图落盘。
  // ---------------------------------------------------------------------------
  test('VIS-03 @smoke3d 首幕取证：挂载 ready + robot_idle 后 canvas 非空（像素统计）+ 取证图落盘', async ({ page }, testInfo) => {
    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    const stats = await expectCanvasPainted(page.locator(SEL.canvas));
    testInfo.annotations.push({
      type: 'canvas-paint',
      description: `robot_idle：${stats.quantizedColors} 色 / 非众数占比 ${(stats.nonModalRatio * 100).toFixed(1)}%（采样 ${stats.sampled}px）`,
    });
    await captureEvidence(page, testInfo, 'world-robot-idle');
  });

  // ---------------------------------------------------------------------------
  // VIS-04 ?poi= 深链取证（综合分维度⑤「POI」项）
  // SRD §12.7.8 出口⑧：?poi=<slug> 出生点改写至对应楼 parkingBay（非 ritual 腿，
  // 无 data-world-state 信号——挂载完成信号 = data-state:ready）。断言：
  // ① 挂载成功 ② canvas 非空 ③ __worldSpike 遥测出生点在 parkingBay 邻域、远离默认原点。
  // ---------------------------------------------------------------------------
  test('VIS-04 @smoke3d POI 深链取证：?poi= 挂载 ready + canvas 非空 + 出生点落 parkingBay', async ({ page }, testInfo) => {
    const bay = cityMap.buildings.find((b) => b.id === POI_SLUG)?.parkingBay;
    if (!bay) throw new Error(`buildings JSON 缺少 ${POI_SLUG}.parkingBay`);

    await page.goto(`${PAGE_URL}?poi=${POI_SLUG}`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    const stats = await expectCanvasPainted(page.locator(SEL.canvas));
    testInfo.annotations.push({
      type: 'canvas-paint',
      description: `poi=${POI_SLUG}：${stats.quantizedColors} 色 / 非众数占比 ${(stats.nonModalRatio * 100).toFixed(1)}%`,
    });

    // 遥测取证：出生点改写生效（parkingBay 邻域 = radius(8) + 物理落位余量）
    const pos = await page.evaluate(() => {
      const ws = (window as unknown as { __worldSpike?: { state(): { x: number; z: number } } })
        .__worldSpike;
      if (!ws) throw new Error('__worldSpike 遥测未挂载');
      return ws.state();
    });
    const toBay = Math.hypot(pos.x - bay.x, pos.z - bay.z);
    const toOrigin = Math.hypot(pos.x, pos.z);
    expect(toBay, `出生点应落 ${POI_SLUG} parkingBay 邻域（实测距 ${toBay.toFixed(1)}m）`).toBeLessThan(25);
    expect(toOrigin, '出生点应已离开默认原点出生位').toBeGreaterThan(50);

    await captureEvidence(page, testInfo, `world-poi-${POI_SLUG}`);
  });
});
