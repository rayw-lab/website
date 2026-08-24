// /lab/tts-cockpit/ —— facade 生命周期、播放全链路、深链、RTL、reduced-motion、无 JS。
// 覆盖：e2e-test-plan §5.3（TTS-E2E-01 ~ 07）。
import { test, expect, type Page } from '@playwright/test';
import { u, shot, waitLabReady, expectImageLoaded } from './helpers';

const PAGE_URL = u('/lab/tts-cockpit/');

test.describe('TTS 座舱可视化', () => {
  test('TTS-E2E-01 facade 生命周期：poster → 自动挂载 ready → 覆盖层淡出 → 控制面解除 inert', async ({ page, request }) => {
    // SSR 合同（不受客户端挂载时序影响）：初始 idle、控制面 inert、poster 与启动按钮就位
    const html = await (await request.get(PAGE_URL)).text();
    expect(html).toContain('data-state="idle"');
    expect(html).toMatch(/data-lab-gated[^>]*\binert\b/);
    expect(html).toContain('data-lab-start');
    expect(html).toContain('tts-cockpit-poster.webp');

    await page.goto(PAGE_URL);

    const facade = page.locator('[data-lab-facade]');
    const controls = page.locator('[data-lab-gated]');
    await expectImageLoaded(facade.locator('.lab-poster'));

    // 滚动进入视口 + idle → 自动挂载（无需点击，pointerFine=false 不受触屏拦截）
    await waitLabReady(page);

    // ready：覆盖层 400ms 交叉淡出（opacity 0 + 不再拦截指针），控制面解锁
    await expect(facade).toHaveCSS('opacity', '0');
    await expect(facade).toHaveCSS('pointer-events', 'none');
    await expect(controls).not.toHaveAttribute('inert');
  });

  test('TTS-E2E-02 播放全链路：speaking → done、逐词字幕点亮、时钟/进度/统计联动', async ({ page }) => {
    await page.goto(PAGE_URL);
    await waitLabReady(page);

    const screen = page.locator('#screen');
    const playBtn = page.locator('#play-btn');
    await expect(screen).toHaveAttribute('data-state', 'idle');

    await playBtn.click();
    // 本地音频 + 时间轴拉取后进入 speaking（loading 极短暂，不强行断言）
    await expect(screen).toHaveAttribute('data-state', 'speaking', { timeout: 10_000 });
    await expect(playBtn).toHaveAttribute('data-playing', 'true');

    // 逐词字幕：span.w 渲染且陆续点亮 .said
    const words = page.locator('#caption .w');
    expect(await words.count()).toBeGreaterThan(3);
    await expect(page.locator('#caption .w.said').first()).toBeVisible({ timeout: 10_000 });

    // 时钟离开零位、进度条前进、统计卡揭示
    await expect(page.locator('#clock')).not.toHaveText(/^00\.0 \/ 00\.0 s$/);
    await expect(page.locator('#stats')).toBeVisible();
    await shot(page, 'tts_playing_zh_nav');

    // 播完：done 态（zh-CN nav 语料约 10s）
    await expect(screen).toHaveAttribute('data-state', 'done', { timeout: 30_000 });
    // 播完后全词点亮
    expect(await page.locator('#caption .w.said').count()).toBe(await words.count());
  });

  test('TTS-E2E-03 交互切换：语言/场景按钮 aria-pressed 联动 + URL replaceState 深链回写', async ({ page }) => {
    await page.goto(PAGE_URL);
    await waitLabReady(page);

    // 默认态：zh-CN × nav，URL 无参数
    // 注意：#screen 也带 data-scene 属性，场景按钮必须用 .scene-btn 收窄
    await expect(page.locator('[data-locale="zh-CN"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.scene-btn[data-scene="nav"]')).toHaveAttribute('aria-pressed', 'true');

    // 切语言 → aria-pressed 迁移 + HMI 徽标 + URL ?locale=
    await page.locator('[data-locale="ko-KR"]').click();
    await expect(page.locator('.locale-btn[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('[data-locale="ko-KR"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#hmi-locale')).toHaveText('ko-KR');
    await expect(page).toHaveURL(/locale=ko-KR/);

    // 切场景 → 屏幕场景卡切换（data-scene）+ URL ?scene=
    await page.locator('.scene-btn[data-scene="park"]').click();
    await expect(page.locator('.scene-btn[data-scene="park"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#screen')).toHaveAttribute('data-scene', 'park');
    await expect(page).toHaveURL(/scene=park/);

    // 切回默认 → URL 参数清理（不产生历史条目的 replaceState 契约）
    await page.locator('[data-locale="zh-CN"]').click();
    await page.locator('.scene-btn[data-scene="nav"]').click();
    await expect(page).not.toHaveURL(/locale=|scene=/);
  });

  test('TTS-E2E-04 深链 ?locale=ar-SA&scene=park：阿拉伯语 RTL 镜像 + 场景直达', async ({ page }) => {
    await page.goto(`${PAGE_URL}?locale=ar-SA&scene=park`);
    await waitLabReady(page);

    // 深链选中态
    await expect(page.locator('[data-locale="ar-SA"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.scene-btn[data-scene="park"]')).toHaveAttribute('aria-pressed', 'true');

    // RTL：HMI 徽标 / 屏幕 data-dir / 对话区 dir 属性三处镜像
    await expect(page.locator('#hmi-locale')).toHaveText('ar-SA');
    await expect(page.locator('#hmi-dir')).toHaveText('RTL');
    await expect(page.locator('#screen')).toHaveAttribute('data-dir', 'rtl');
    await expect(page.locator('#console')).toHaveAttribute('dir', 'rtl');

    // 语言按钮上的 RTL 角标（ar-SA / he-IL 两处，spec「RTL ×2」）
    await expect(page.locator('[data-locale="ar-SA"] .rtl-tag')).toHaveText('RTL');
    await expect(page.locator('[data-locale="he-IL"] .rtl-tag')).toHaveText('RTL');

    // RTL 下播放一次：字幕 dir=rtl 且正常走完时间轴
    await page.locator('#play-btn').click();
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'speaking', { timeout: 10_000 });
    await expect(page.locator('#caption')).toHaveAttribute('dir', 'rtl');
    await shot(page, 'tts_deeplink_ar_rtl_park');
  });

  test('TTS-E2E-05 非法深链 ?locale=xx-XX&scene=bogus：回退默认 zh-CN × nav 不崩溃', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(`${PAGE_URL}?locale=xx-XX&scene=bogus`);
    await waitLabReady(page);

    await expect(page.locator('[data-locale="zh-CN"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.scene-btn[data-scene="nav"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#screen')).toHaveAttribute('data-scene', 'nav');
    expect(errors, '非法参数不应产生未捕获异常').toEqual([]);
  });

  test('TTS-E2E-06 reduced-motion：自动挂载被拦（data-blocked）、零新增 JS chunk、显式点击仍可启动', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const jsRequests: string[] = [];
    page.on('request', (r) => {
      if (r.url().endsWith('.js')) jsRequests.push(r.url());
    });

    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');
    const initialJsCount = jsRequests.length;

    const host = page.locator('[data-lab-host]');
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await expect(host).toHaveAttribute('data-state', 'idle');
    await expect(page.locator('[data-lab-gated]')).toHaveAttribute('inert', '');
    await expect(
      page.locator('.lab-blocked-note[data-blocked-reason="reduced-motion"]'),
    ).toBeVisible();

    // 滚动到舞台 + 超过 requestIdleCallback 2s 兜底窗口：不得触发任何 chunk 拉取
    await host.locator('[data-lab-stage]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2_500);
    expect(jsRequests.length, 'reduced-motion 下滚动不得触发模块 chunk 请求').toBe(initialJsCount);
    await expect(host).toHaveAttribute('data-state', 'idle');
    await shot(page, 'tts_blocked_reduced_motion');

    // §12.4 显式逃生门：点启动按钮跳过全部自动挡拦截
    await page.locator('[data-lab-start]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: 30_000 });
    expect(jsRequests.length, '显式启动后才允许拉取引擎 chunk').toBeGreaterThan(initialJsCount);
  });
});

test.describe('TTS 座舱可视化（无 JS）', () => {
  test.use({ javaScriptEnabled: false });

  test('TTS-E2E-07 禁用 JS：noscript 提示就位，页眉说明与脚注仍可读', async ({ page }) => {
    await page.goto(PAGE_URL);

    // noscript 文案合同：CDP 禁 JS 不改变解析器 scripting flag，noscript 子树
    // 不会被解析成可见 DOM——以 textContent 断言文案（真机无 JS 时浏览器会渲染它）
    const noscript = page.locator('[data-lab-facade] noscript');
    await expect(noscript).toHaveCount(1);
    expect(await noscript.textContent()).toContain('本演示需要启用 JavaScript');

    // 静态内容不依赖脚本：页眉 lede 与页脚脚注照常渲染
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#fn')).toBeVisible();
    // poster 仍在且 facade 保持 idle 覆盖（无脚本推进状态机）
    await expectImageLoaded(page.locator('.lab-poster'));
    await expect(page.locator('[data-lab-host]')).toHaveAttribute('data-state', 'idle');
  });
});
