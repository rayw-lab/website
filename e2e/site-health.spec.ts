// 全站健康度 —— 内链爬取（含待交付路由白名单镜像）、404、sitemap/noindex、world-spike 条件烟测。
// 覆盖：e2e-test-plan §5.5（SITE-E2E-01 ~ 04）。
import { test, expect } from '@playwright/test';
import { BASE, u, PENDING_ROUTES } from './helpers';

/** 爬取起点：当前已交付的全部路由（A4 批次追加 About / Now / Contact） */
const CRAWL_PAGES = [
  '/',
  '/lab/',
  '/lab/tts-cockpit/',
  '/lab/car-configurator/',
  '/about/',
  '/now/',
  '/contact/',
];

/** href/src → base 剥离后的站内路径；站外/协议链接返回 null */
function toInternalPath(ref: string, fromPath: string): string | null {
  if (/^(https?:|mailto:|tel:|data:|#)/.test(ref)) return null;
  const abs = new URL(ref, `http://x${BASE}${fromPath}`).pathname;
  if (!abs.startsWith(BASE)) return null; // base 外的绝对路径（如 "/foo"）视为站外
  return abs.slice(BASE.length) || '/';
}

test.describe('全站健康度', () => {
  test('SITE-E2E-01 内链爬取：已交付路由全部 200；待交付路由精确命中白名单且必须仍为 404', async ({ page, request }) => {
    // 1) 从全部已交付页面收集内部 <a href> 与 <img src>
    const found = new Map<string, string>(); // path -> 首个来源页
    for (const from of CRAWL_PAGES) {
      await page.goto(u(from));
      const refs = await page.evaluate(() => [
        ...[...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!),
        ...[...document.querySelectorAll('img[src]')].map((i) => i.getAttribute('src')!),
      ]);
      for (const ref of refs) {
        const path = toInternalPath(ref.split('#')[0]!.split('?')[0]!, from);
        if (path && !found.has(path)) found.set(path, from);
      }
    }
    expect(found.size).toBeGreaterThan(10);

    // 2) 逐一请求：200 或（白名单内待交付路由的）404，其余一律失败
    const broken: string[] = [];
    const staleWhitelist: string[] = [];
    for (const [path, from] of found) {
      const status = (await request.get(u(path))).status();
      if (PENDING_ROUTES.has(path)) {
        // 白名单过期检查（镜像 check-links 门禁）：路由交付后必须删除白名单条目
        if (status === 200) staleWhitelist.push(path);
        else if (status !== 404) broken.push(`${path}（来源 ${from}）→ ${status}`);
      } else if (status !== 200) {
        broken.push(`${path}（来源 ${from}）→ ${status}`);
      }
    }
    expect(broken, '站内断链（不在待交付白名单内）').toEqual([]);
    expect(
      staleWhitelist,
      'PENDING_ROUTES 白名单过期：路由已交付，须从 e2e/helpers.ts 与 scripts/check-links.mjs 同步删除条目',
    ).toEqual([]);
  });

  test('SITE-E2E-02 未知路由返回 404（GitHub Pages 语义）', async ({ page }) => {
    const res = await page.goto(u('/definitely-not-a-page/'));
    expect(res?.status()).toBe(404);

    // 深层未知路由与非 HTML 资源同样 404
    for (const path of ['/lab/not-a-module/', '/assets/nope.js']) {
      const r = await page.request.get(u(path));
      expect(r.status(), `${path} 应为 404`).toBe(404);
    }
  });

  test('SITE-E2E-03 sitemap：索引可达，包含 lab 路由、排除 world-spike（noindex 隐藏路由）', async ({ request }) => {
    const index = await request.get(u('/sitemap-index.xml'));
    expect(index.status()).toBe(200);

    const sitemap = await request.get(u('/sitemap-0.xml'));
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain(`${BASE}/lab/tts-cockpit/`);
    expect(xml).toContain(`${BASE}/lab/car-configurator/`);
    // 精确匹配隐藏路由本体（A3 起 /ai-lab/world-spike-parallel-agents/ 实验记录
    // 合法进入 sitemap，裸子串断言会误伤内容 slug）
    expect(xml, 'world-spike 为 noindex 隐藏路由，不得进 sitemap').not.toContain(`${BASE}/world-spike/`);

    // favicon 与自托管字体可达（BaseLayout 预加载引用）
    for (const asset of ['/favicon.svg', '/fonts/inter-var-latin.woff2']) {
      expect((await request.get(u(asset))).status(), `${asset} 应为 200`).toBe(200);
    }
  });

  test('SITE-E2E-04 world-spike 隐藏路由（若存在）：烟测可加载且无未捕获异常', async ({ page, request }) => {
    const status = (await request.get(u('/world-spike/'))).status();
    test.skip(
      status === 404,
      'world-spike 路由尚未交付（check-links PENDING_ROUTES 白名单内）——交付后本测试自动生效',
    );

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto(u('/world-spike/'));
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});
