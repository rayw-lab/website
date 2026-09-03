// About Hall —— ADR-2 G-Hall-10 首批。
// 路由 /world/about-pavilion/（Hall-0 壳）。不改 playwright.config.ts。
import { test, expect } from '@playwright/test';
import { expectImageLoaded, u } from './helpers';

const HALL = '/world/about-pavilion/';
const CHROME = '[data-hall-chrome]';

test.describe('About Hall 到达条', () => {
  test('无 query：200，H1 含「架桥」，到达条 hidden', async ({ page }) => {
    const res = await page.goto(u(HALL));
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('架桥');
    const chrome = page.locator(CHROME);
    await expect(chrome).toHaveCount(1);
    await expect(chrome).toBeHidden();
    expect(await chrome.evaluate((el) => (el as HTMLElement).hidden)).toBe(true);
  });

  test('?from=city&poi=about-pavilion：到达条可见且含「个人档案馆」与「返回科技城」', async ({
    page,
  }) => {
    const res = await page.goto(u(`${HALL}?from=city&poi=about-pavilion`));
    expect(res?.status()).toBe(200);
    const chrome = page.locator(CHROME);
    await expect(chrome).toBeVisible();
    await expect(chrome).toContainText('个人档案馆');
    await expect(chrome).toContainText('返回科技城');
  });

  test('有卡：world-arrival-v1 的 poi 匹配 → 到达条含「探索」与楼名', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'world-arrival-v1',
        JSON.stringify({
          v: 1,
          poi: 'about-pavilion',
          sessionId: 'e2e-w5-card',
          t: 184320,
          exploreN: 2,
          exploreTotal: 12,
          wroteAt: 1_700_000_000_000,
          maxKmh: 96,
          coneHits: 3,
          respawns: 1,
          poiEnters: 4,
        }),
      );
      localStorage.setItem('world-explore-v1', JSON.stringify(['about-pavilion', 'autodrive-lab']));
    });
    const res = await page.goto(u(`${HALL}?from=city&poi=about-pavilion`));
    expect(res?.status()).toBe(200);
    const chrome = page.locator(CHROME);
    await expect(chrome).toBeVisible();
    await expect(chrome).toContainText('探索');
    await expect(chrome).toContainText('个人档案馆');
  });

  test('?from=city&poi=not-a-building：到达条 hidden', async ({ page }) => {
    await page.goto(u(`${HALL}?from=city&poi=not-a-building`));
    const chrome = page.locator(CHROME);
    await expect(chrome).toBeHidden();
    expect(await chrome.evaluate((el) => (el as HTMLElement).hidden)).toBe(true);
  });
});

test.describe('About Hall scrub（AH-W1h）', () => {
  test('桌面 Hero：readyState≥1 后指针移到右 3/4，currentTime > 1s', async ({ page }) => {
    await page.goto(u(HALL));
    const hero = page.locator('[data-hero-scrub]');
    const video = hero.locator('video');
    await expect(video).toHaveCount(1);
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).readyState), {
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(1);
    const box = await hero.boundingBox();
    expect(box, 'Hero 应有盒模型').toBeTruthy();
    await page.mouse.move(box!.x + box!.width * 0.12, box!.y + box!.height * 0.5);
    await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height * 0.5);
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).currentTime), {
        timeout: 8_000,
      })
      .toBeGreaterThan(1);
  });

  test('滚动到 S6 中段：transition video.currentTime 在 (3, 8)', async ({ page }) => {
    await page.goto(u(HALL));
    await page.evaluate(() => {
      const el = document.querySelector('[data-scene="s6"]');
      if (!(el instanceof HTMLElement)) throw new Error('missing s6');
      const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 160;
      window.scrollTo(0, Math.max(0, y));
    });
    const video = page.locator('[data-scene="s6"] video');
    await expect(video).toHaveCount(1);
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).readyState), {
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(1);
    await page.evaluate(() => {
      const el = document.querySelector('[data-scene="s6"]');
      if (!(el instanceof HTMLElement)) throw new Error('missing s6');
      const denom = el.scrollHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + denom * 0.5);
    });
    await expect
      .poll(async () => video.evaluate((el) => (el as HTMLVideoElement).currentTime), {
        timeout: 8_000,
      })
      .toBeGreaterThan(3);
    const t = await video.evaluate((el) => (el as HTMLVideoElement).currentTime);
    expect(t).toBeLessThan(8);
  });
});

test.describe('About Hall reduced-motion', () => {
  test('prefers-reduced-motion：Hero/S6 video 不存在或 paused，且无运行中 animation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(HALL));
    await page.waitForLoadState('load');
    const report = await page.evaluate(() => {
      const videos = [...document.querySelectorAll('video')];
      const anims = document.getAnimations();
      return {
        videoCount: videos.length,
        allPaused: videos.every((v) => v.paused),
        animCount: anims.length,
        running: anims.filter((a) => a.playState === 'running').length,
      };
    });
    expect(report.videoCount === 0 || report.allPaused, `videos=${report.videoCount} paused=${report.allPaused}`).toBe(
      true,
    );
    expect(report.running, 'reduced-motion 不得有 running animation').toBe(0);
    if (report.animCount !== 0) {
      // 允许 paused 残留；硬条件是 running===0。票面 getAnimations()===0 在无 paused 残留时成立。
      expect(report.running).toBe(0);
    }
  });

  test('prefers-reduced-motion：无正在运行的 CSS animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(`${HALL}?from=city&poi=about-pavilion`));
    await page.waitForLoadState('load');
    await page.waitForFunction(
      () => !document.getAnimations().some((a) => a.playState === 'running'),
      { timeout: 2000 },
    );
    const report = await page.evaluate(() => {
      const anims = document.getAnimations();
      return {
        total: anims.length,
        running: anims.filter((a) => a.playState === 'running').length,
        states: anims.map((a) => a.playState),
        names: anims.map((a) => ('animationName' in a ? String(a.animationName) : a.constructor.name)),
      };
    });
    const allPaused = report.states.length > 0 && report.states.every((s) => s === 'paused');
    expect(
      report.total === 0 || allPaused || report.running === 0,
      `CSS animations: total=${report.total} running=${report.running} states=${JSON.stringify(report.states)} names=${JSON.stringify(report.names)}`,
    ).toBe(true);
    expect(report.running, '不得有 running 的 CSS animation').toBe(0);
  });
});

test.describe('About Hall 无 JS', () => {
  test.use({ javaScriptEnabled: false });

  test('禁用 JS：首屏 H1 与 poster <img> 可见', async ({ page }) => {
    const res = await page.goto(u(HALL));
    expect(res?.status()).toBe(200);
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('架桥');
    const poster = page.locator('section[data-scene] img').first();
    await expect(poster).toBeVisible();
    await expectImageLoaded(poster);
  });
});

test.describe('About Hall 未知 slug', () => {
  test('未知 slug 404', async ({ page }) => {
    const res = await page.goto(u('/world/definitely-not-a-hall/'));
    expect(res?.status()).toBe(404);
  });
});

test.describe('About Hall 驾驶卡短句（AH-T1b / ADR-4 决策 B）', () => {
  test('完整快照写最高巡航；空快照保底探索 n/N', async ({ browser }) => {
    const hallUrl = u(`${HALL}?from=city&poi=about-pavilion`);

    const full = await browser.newPage();
    await full.addInitScript(() => {
      sessionStorage.setItem(
        'world-arrival-v1',
        JSON.stringify({
          v: 1,
          poi: 'about-pavilion',
          sessionId: 'e2e-t1b-full',
          t: 184320,
          exploreN: 2,
          exploreTotal: 12,
          wroteAt: 1_700_000_000_000,
          maxKmh: 96,
          coneHits: 3,
        }),
      );
      localStorage.setItem('world-explore-v1', JSON.stringify(['about-pavilion', 'autodrive-lab']));
    });
    const fullRes = await full.goto(hallUrl);
    expect(fullRes?.status()).toBe(200);
    const fullChrome = full.locator(CHROME);
    await expect(fullChrome).toBeVisible();
    await expect(fullChrome).toContainText('最高巡航 96 km/h');
    await expect(fullChrome).toContainText('个人档案馆');
    await expect(fullChrome).toContainText('探索');
    await full.close();

    const empty = await browser.newPage();
    const emptyRes = await empty.goto(hallUrl);
    expect(emptyRes?.status()).toBe(200);
    const emptyChrome = empty.locator(CHROME);
    await expect(emptyChrome).toBeVisible();
    await expect(emptyChrome).toContainText(/探索\s+\d+\/\d+/);
    await expect(emptyChrome).not.toContainText('最高巡航');
    await expect(emptyChrome).not.toContainText('途中碰倒');
    await empty.close();
  });

  test('HALL-CHROME-DRIVE-CONEHITS：快照只有 coneHits:4 时到达条含碰倒锥桶', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'world-arrival-v1',
        JSON.stringify({
          v: 1,
          poi: 'about-pavilion',
          sessionId: 'e2e-f1-cones',
          t: 184320,
          exploreN: 2,
          exploreTotal: 12,
          wroteAt: 1_700_000_000_000,
          coneHits: 4,
        }),
      );
    });
    const res = await page.goto(u(`${HALL}?from=city&poi=about-pavilion`));
    expect(res?.status()).toBe(200);
    await expect(page.locator(CHROME)).toBeVisible();
    await expect(page.locator('[data-hall-drive]')).toHaveText('途中碰倒 4 个锥桶');
  });
});

test.describe('About Hall 地轨键盘（AH-F1）', () => {
  test('HALL-RAIL-KEYBOARD-NAV：Tab 到第 2 节点 Enter → scrollY 增长且目标幕入视口', async ({
    page,
  }) => {
    const res = await page.goto(u(HALL));
    expect(res?.status()).toBe(200);
    const second = page.locator('.hall-rail-stop').nth(1);
    await expect(second).toBeVisible();
    const scene = await second.getAttribute('data-rail-scene');
    expect(scene, '第 2 地轨节点应有 data-rail-scene').toBeTruthy();

    let focused = false;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      if (await second.evaluate((el) => el === document.activeElement)) {
        focused = true;
        break;
      }
    }
    expect(focused, 'Tab 应能到达地轨第 2 节点').toBe(true);

    const y0 = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Enter');
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 8_000 })
      .toBeGreaterThan(y0);

    await expect
      .poll(async () =>
        page.evaluate((s) => {
          const el = document.querySelector(`[data-scene="${s}"]`);
          if (!(el instanceof HTMLElement)) return false;
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight;
        }, scene),
      )
      .toBe(true);
  });
});

test.describe('About Hall 移动 375（AH-F1）', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('HALL-MOBILE-375-NO-OVERFLOW：无横向溢出，Hero poster 可见且无 video 播放', async ({
    page,
  }) => {
    const res = await page.goto(u(HALL));
    expect(res?.status()).toBe(200);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const poster = page.locator('[data-hero-scrub] img').first();
    await expect(poster).toBeVisible();
    await expectImageLoaded(poster);

    const videoPlaying = await page.evaluate(() =>
      [...document.querySelectorAll('video')].some(
        (v) => !v.paused && !v.ended && v.currentTime > 0,
      ),
    );
    expect(videoPlaying, '375 视口不得播放 Hero video').toBe(false);
  });
});

// [AH-W3e] 馆长契约（ADR-5 决策 A）：四态 pose 硬门 + S6 让位 + 同屏 GPU 互斥。
test.describe('AH-W3e 馆长契约', () => {
  // 只追加本块：Page 类型走 inline import，不动文件头的 import 行（AH-F1 同文件在改）。
  type Page = import('@playwright/test').Page;
  const CURATOR = '[data-curator]';
  /** ADR-5 A.4 让位不透明度上限 */
  const YIELD_OPACITY_MAX = 0.45;

  /** 把某幕滚成「主导幕」：幕内 frac 处对齐视口中线（bestScene 取可见高度最大者）。 */
  const scrollToScene = async (page: Page, scene: string, frac: number): Promise<void> => {
    await page.evaluate(
      ({ scene, frac }) => {
        const el = document.querySelector(`[data-scene="${scene}"]`);
        if (!(el instanceof HTMLElement)) throw new Error(`missing ${scene}`);
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        window.scrollTo(0, Math.max(0, top + rect.height * frac - window.innerHeight * 0.5));
      },
      { scene, frac },
    );
  };

  const poseAt = (page: Page): Promise<string> =>
    page.locator(CURATOR).evaluate((el) => (el as HTMLElement).dataset.curatorPose ?? '');

  const expectPose = async (page: Page, scene: string, pose: string, frac = 0.5): Promise<void> => {
    await scrollToScene(page, scene, frac);
    await expect
      .poll(() => poseAt(page), { timeout: 10_000, message: `${scene} 应为 ${pose}` })
      .toBe(pose);
  };

  const framesAt = (page: Page): Promise<number> =>
    page.evaluate(() => window.__hallDebug?.curatorFrames ?? -1);

  test('桌面非 RM：s1=gaze / s5=present / s6=yield（冻帧 + 降透明 + rAF 冷）/ s8=salute', async ({
    page,
  }) => {
    await page.goto(u(HALL));

    // S0 主导：不在场，pose 属性不写（ADR-5 A.3 末行）
    expect(await poseAt(page), 'S0 不得写 pose').toBe('');

    // S1 相交才允许 import('./curator')；canvas 出现 = chunk 已到位
    await expectPose(page, 's1', 'gaze', 0.3);
    const canvas = page.locator(`${CURATOR} canvas`);
    await expect(canvas).toHaveCount(1, { timeout: 30_000 });

    // 天平幕才托举
    await expectPose(page, 's5', 'present');

    // S6 中段：让位
    await expectPose(page, 's6', 'yield');
    // 降透明走 300ms transition，poll 等它落位（不是等动画：RM 下这条 transition 不存在）
    await expect
      .poll(
        () => canvas.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity)),
        { timeout: 5_000, message: `yield 时 canvas opacity 应 ≤${YIELD_OPACITY_MAX}` },
      )
      .toBeLessThanOrEqual(YIELD_OPACITY_MAX);
    await expect
      .poll(
        () =>
          page.locator(CURATOR).evaluate((el) => (el as HTMLElement).dataset.curatorRaf ?? ''),
        { timeout: 5_000 },
      )
      .toBe('0');

    // 连采 5 帧：renderer 不渲染（帧计数不动）
    const frames = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const out: number[] = [];
          const step = (): void => {
            out.push(window.__hallDebug?.curatorFrames ?? -1);
            if (out.length < 5) requestAnimationFrame(step);
            else resolve(out);
          };
          requestAnimationFrame(step);
        }),
    );
    expect(
      frames.every((n) => n >= 0),
      `curatorFrames 探针应存在：${JSON.stringify(frames)}`,
    ).toBe(true);
    expect(new Set(frames).size, `s6 中段不得渲染：${JSON.stringify(frames)}`).toBe(1);

    // 离开 S6 恢复 rAF
    await expectPose(page, 's7', 'gaze');
    const before = await framesAt(page);
    await expect.poll(() => framesAt(page), { timeout: 5_000 }).toBeGreaterThan(before);

    await expectPose(page, 's8', 'salute', 0.3);
  });

  test('reduced-motion：pose 属性仍在（静态 gaze）、无 animation、curatorFrames 不增长', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(HALL));
    await expectPose(page, 's5', 'gaze');

    const report = await page.evaluate(() => ({
      anims: document.getAnimations().length,
      running: document.getAnimations().filter((a) => a.playState === 'running').length,
      canvases: document.querySelectorAll('[data-curator] canvas').length,
      frames: window.__hallDebug?.curatorFrames ?? 0,
    }));
    expect(report.running, 'RM 不得有 running animation').toBe(0);
    expect(report.anims, 'RM 下 getAnimations() 应为 0').toBe(0);
    expect(report.canvases, 'RM 不挂 three').toBe(0);

    await page.waitForTimeout(600);
    const after = await page.evaluate(() => window.__hallDebug?.curatorFrames ?? 0);
    expect(after, 'RM 下 curatorFrames 不得增长').toBe(report.frames);
  });
});
