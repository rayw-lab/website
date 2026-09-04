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
  // 🔴 口径门：标题栏「N 席位」= totals.seats（有会话的席位数）；墨带若照名册画会 5 对 6 打架（agy W9 P0-1 属实）。
  test('墨带数 == totals.seats（口径门），且每条带都在明细里出现过', async ({ page }) => {
    await page.goto(u(HALL));
    const bands = await page.locator('.nexus-flow__band').count();
    expect(bands).toBe(ledger.totals.seats);
    const present = new Set((ledger.sessions as Array<{ seat: string }>).map((s) => s.seat));
    expect(present.size).toBe(bands);
  });

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

  // 城→厅链路：楼宇 hallPath 只是数据，真正要验的是「从城里带着 poi 进来，
  // 到达条认得这栋楼」。只断言 [data-hall-chrome] 存在证明不了这件事——
  // 它在任何厅都存在，认错楼也照样存在。
  // ── NX-W7 到达墨幕 2×2 ───────────────────────────────────────────────────
  // 城里按 E 进楼时 PoiArrival 的墨幕（#1c1f26）带过跳转，本页首帧同色接力后向 S0 落点 (36%,40%) 收缩。
  // 断言的是运行痕迹（window.__nxArrive：起止 + 帧数）而不是逐时点截图——SwiftShader 下主线程被
  // 引擎初始化占满，动画 ~900ms 内跑完，时点截图既不稳也不可证。
  test('🔴 到达墨幕 2×2：?from=city&poi=agent-nexus 首帧满屏墨→收向 S0 落点→清干净（正控）；直链不挂（负控）', async ({ page }) => {
    // 🔴 断言的是**逐帧采样的遮罩半径**，不是截图：Playwright 的 screenshot 会等渲染稳定，
    // 捕获时刻早已越过 820ms 的动画（v12 探针实证：t=40ms 请求的截图拍到的是纸色收尾帧）。
    await page.addInitScript(() => {
      (window as any).__samples = [];
      const s = (): void => {
        const r = document.documentElement;
        (window as any).__samples.push({
          t: performance.now(), cls: r.className,
          r: (document.querySelector('[data-nx-arrive]') as HTMLElement | null)?.style.getPropertyValue('--nx-r') ?? '',
          // 🔴 「首帧满屏墨」有两个可能的承担者：head 的 ::before 纯色帘，或接管后的两层 DOM。
          // 只读 ::before 的 backgroundColor 会被 display:none 骗过（computed 值照样在，
          // grok 会话审计 P1-4 属实），只认 ::before 又会被「DOM 已接管」误判成红。
          // 判据改成：**这一帧里存在一个铺满视口的墨层**，谁承担都算。
          headInk: (() => {
            const cs = getComputedStyle(r, '::before');
            return cs.display !== 'none' && Number(cs.opacity) > 0.99 && cs.backgroundColor === 'rgb(28, 31, 38)';
          })(),
          domInk: (() => {
            const el = document.querySelector('[data-nx-arrive]') as HTMLElement | null;
            if (!el || el.hidden) return false;
            const ink = el.firstElementChild as HTMLElement | null;
            if (!ink) return false;
            const cs = getComputedStyle(ink);
            if (cs.backgroundColor !== 'rgb(28, 31, 38)') return false;
            // 遮罩半径必须还盖得住整个视口（否则是「已经收缩过」，不算首帧满屏）
            const rr = parseFloat(el.style.getPropertyValue('--nx-r'));
            return Number.isFinite(rr) && rr >= Math.hypot(innerWidth, innerHeight) / 2;
          })(),
        });
        if ((window as any).__samples.length < 14) requestAnimationFrame(s);
      };
      requestAnimationFrame(s);
    });

    // 🔴 三次导航的 URL 必须两两不只差 hash：只差 hash 时 Playwright 走片段导航，页面不重载、
    // 脚本不重跑（本轮重排测试时又踩了一次）。顺序：hold 版 → 直链负控 → 正控。
    // hold 钩子：停在 35% 时半径必须已远小于起始（真在收缩，不是挂着不动）
    await page.goto(u(`${HALL}?from=city&poi=agent-nexus#nx-arrive-hold`));
    await expect(page.locator('html')).toHaveAttribute('data-nx-arrive-state', 'hold', { timeout: 9000 });
    const held = await page.evaluate(() => parseFloat((document.querySelector('[data-nx-arrive]') as HTMLElement).style.getPropertyValue('--nx-r')));
    expect(held).toBeGreaterThan(0);
    expect(held).toBeLessThan(170 * 14.4 * 0.5);

    // 负控：无来源参数 → 类不挂、无痕迹
    await page.goto(u(HALL));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.className)).not.toMatch(/nx-transit/);
    expect(await page.evaluate(() => (window as any).__nxArrive ?? null)).toBeNull();

    // 正控：首帧就得是满屏墨（跨文档接驳的白闪期由它顶着），末帧清干净
    await page.goto(u(`${HALL}?from=city&poi=agent-nexus`), { waitUntil: 'commit' });
    await expect
      .poll(() => page.evaluate(() => (window as any).__nxArrive?.endedAt ?? 0), { timeout: 9000 })
      .toBeGreaterThan(0);
    const samples = await page.evaluate(() => (window as any).__samples as Array<{ t: number; cls: string; r: string; bg: string }>);
    const first = samples[0];
    expect(first.cls, '首帧 <html> 必须已带 nx-transit（head 内联脚本抢在首绘前）').toMatch(/nx-transit/);
    expect(
      first.headInk || first.domInk,
      '首帧必须存在铺满视口的墨层（head 纯色帘或未收缩的两层 DOM，二者其一）',
    ).toBe(true);
    // 末尾几帧必须都不再有满屏墨（证明它确实退场了，不是一直挂着）
    const last = samples[samples.length - 1];
    expect(last.headInk || last.domInk, '末帧不应再有满屏墨').toBe(false);
    // 首帧墨帘是 head 里的纯色 ::before（无 mask/filter，0 计算即在）；两层 DOM 稍后接管。
    // 所以首帧只断言「墨色满屏」，收缩半径的断言留给 hold 钩子那一段。
    const trace = await page.evaluate(() => (window as any).__nxArrive);
    expect(trace.frames, '至少两帧（起帧 + 终帧）才算收缩过').toBeGreaterThanOrEqual(2);
    expect(trace.endedAt - trace.startedAt).toBeGreaterThan(300);
    // 🔴 上界按**慢环境实测**定，不按设计时长定：动画设计 820ms，但 SwiftShader 软渲下
    // 整条动线实走实测 2357ms（10 帧 / 2.3s）。写 2200 会在慢机上偶发红——门自己 flaky
    // 比不设门更坏（使用者学会忽略它）。这里只拦「压根没退场」，不拦慢。
    expect(trace.endedAt - trace.startedAt).toBeLessThan(6000);
    expect(await page.evaluate(() => document.documentElement.className)).not.toMatch(/nx-transit/);
  });

  // 🔴 A 楼出来进 B 楼：sessionStorage 里可能还留着 A 的到达卡（新卡写入失败时——
  // 隐私模式 / 配额满）。旧实现 poi 不匹配就整条 return，楼名、探索、「返回科技城」
  // 一起消失，用户失去回城入口。判据：query 合法即显示身份条，只丢驾驶短句。
  test('🔴 跨楼快照 2×2：残留 A 卡进 B 厅仍显示身份条（只丢驾驶短句）；匹配卡则短句在', async ({ page }) => {
    // 负控：注入 about 的旧卡，打开 nexus 厅
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'world-arrival-v1',
        JSON.stringify({ v: 1, poi: 'about-pavilion', sessionId: 'e2e-stale', t: 1000, maxKmh: 88 }),
      );
    });
    await page.goto(u(`${HALL}?from=city&poi=agent-nexus`));
    const strip = page.locator('[data-hall-chrome]');
    await expect(strip, '身份条必须仍然可见').toBeVisible();
    await expect(strip).toContainText('主智能体中枢');
    await expect(strip.locator('.hall-chrome-back'), '回城入口不许随旧卡一起消失').toBeVisible();
    await expect(page.locator('[data-hall-drive]'), '别人楼的驾驶短句不该显示').toBeHidden();
    // 陈旧卡应被清掉，不再污染下一栋
    expect(await page.evaluate(() => sessionStorage.getItem('world-arrival-v1'))).toBeNull();

    // 正控：本楼自己的卡 → 身份条 + 驾驶短句都在
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'world-arrival-v1',
        JSON.stringify({ v: 1, poi: 'agent-nexus', sessionId: 'e2e-own', t: 1000, maxKmh: 66 }),
      );
    });
    await page.goto(u(`${HALL}?from=city&poi=agent-nexus&own=1`));
    await expect(page.locator('[data-hall-chrome]')).toBeVisible();
    await expect(page.locator('[data-hall-drive]')).toHaveText('最高巡航 66 km/h');
  });

  test('从城里进楼：到达条认出「主智能体中枢」', async ({ page }) => {
    await page.goto(u(`${HALL}?from=city&poi=agent-nexus`));
    const chrome = page.locator('[data-hall-chrome]');
    await expect(chrome).toBeVisible();
    await expect(chrome).toHaveAttribute('data-poi', 'agent-nexus');
    await expect(chrome).toContainText('主智能体中枢');
    await expect(chrome).toContainText('返回科技城');
  });

  test('移动端 375：到达条不压首屏，且不横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(u(`${HALL}?from=city&poi=agent-nexus`));
    const m = await page.evaluate(() => {
      const c = document.querySelector('[data-hall-chrome]')!.getBoundingClientRect();
      const y = document.querySelector('[data-nexus-yin]')!.getBoundingClientRect();
      return {
        overlap: Math.max(0, Math.min(c.bottom, y.bottom) - Math.max(c.top, y.top)),
        docW: document.documentElement.scrollWidth,
        winW: window.innerWidth,
      };
    });
    expect(m.overlap).toBe(0);
    expect(m.docW).toBeLessThanOrEqual(m.winW);
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

// ── S3 试墨：干纸拒墨的**行为门**（不是参数读回门）─────────────────────────
// 这一幕的立论是「湿纸受墨、干纸拒墨」。验它只能验画面：
// 参数读回正确 ≠ 管线接通（uMobHi 实证过一次读回对而管线没接上）。
// 结构是 2×2：正控证明"落墨这个动作确实会让画面变黑"，
// 负控证明"同一个动作落在干纸上不会"。少了正控，一个根本没画上的 bug
// 会伪装成"拒墨成功"；少了负控，干纸门失效也看不出来。
test.describe('S3 试墨 · 干纸拒墨', () => {
  const HALL = '/world/agent-nexus/';

  test('干纸区看得见，且键盘可达', async ({ page }) => {
    await page.goto(u(HALL));
    await expect(page.locator('[data-nexus-trial]')).toHaveCount(1);
    await expect(page.locator('.trial__dry')).toBeVisible();
    await expect(page.locator('.trial__dry')).toContainText('纸已干');
    const canvas = page.locator('[data-trial-canvas]');
    await expect(canvas).toHaveAttribute('tabindex', '0');
    await canvas.focus();
    await expect(page.locator('[data-trial-caret]')).toBeVisible();
    await canvas.press(' ');
    await expect(page.locator('[data-trial-live]')).not.toBeEmpty();
  });

  // 🔴 显隐 2×2：首版 .trial__fallback{display:grid} 盖过 UA 的 [hidden]{display:none}，
  // 降级文案在 WebGL 正常时也一直露着；属性层（data-trial-ready=1）全绿，只有截图看得见。
  // 所以这里断言的是 computed 可见性，不是属性。
  test('🔴 降级文案显隐 2×2：WebGL 正常时不可见（正控），WebGL2 拿不到时可见且画布让位（负控）', async ({ page }) => {
    await page.goto(u(HALL));
    const root = page.locator('[data-nexus-trial]');
    await expect(root).toHaveAttribute('data-trial-ready', '1', { timeout: 15000 });
    await expect(page.locator('p[data-trial-fallback]')).toBeHidden();
    await expect(page.locator('[data-trial-canvas]')).toBeVisible();

    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      // @ts-ignore
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: any[]) {
        if (type === 'webgl2') return null;
        // @ts-ignore
        return orig.call(this, type, ...rest);
      };
    });
    await page.goto(u(HALL));
    await expect(root).toHaveAttribute('data-trial-fallback', /.+/, { timeout: 15000 });
    await expect(page.locator('p[data-trial-fallback]')).toBeVisible();
    await expect(page.locator('[data-trial-canvas]')).toBeHidden();
  });

  test('🔴 2×2 行为门：湿处落墨画面变黑（正控），干处不变（负控）', async ({ page }) => {
    await page.goto(u(HALL));
    const root = page.locator('[data-nexus-trial]');
    await expect(root).toHaveAttribute('data-trial-ready', '1');

    // 直接驱动引擎 API：按它真实被消费的方式验，而不是模拟一串 pointer 事件去猜。
    const sample = async (x: number, y: number) =>
      page.evaluate(
        ([px, py]) => {
          const s = (window as any).__nexusTrial;
          const c = document.querySelector('[data-trial-canvas]') as HTMLCanvasElement;
          // 落墨 → 推进若干步让墨真的洇开 → 读回该点亮度
          s.ink.setBrush(px, py, 0.05);
          s.ink.splatWater(px, py, 0.055, 0.5, [0, 0]);
          s.ink.splatInk(px, py, 0.02, [0.4, 0.4, 0.4]);
          s.ink.setBrush(0, 0, -1);
          s.seek(0.6, 1 / 60);
          const o = document.createElement('canvas');
          o.width = c.width;
          o.height = c.height;
          const g = o.getContext('2d')!;
          g.drawImage(c, 0, 0);
          const sx = Math.round(px * c.width);
          const sy = Math.round((1 - py) * c.height);
          const d = g.getImageData(Math.max(0, sx - 4), Math.max(0, sy - 4), 9, 9).data;
          let lum = 0;
          for (let i = 0; i < d.length; i += 4) lum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          return lum / (d.length / 4);
        },
        [x, y],
      );

    const dry = await page.evaluate(() => (window as any).__nexusTrialDry);
    // 正控：湿处（远离干纸圈）
    const wet = await sample(0.22, 0.5);
    // 负控：干纸圈心
    const dryLum = await sample(dry.x, dry.y);

    // 纸色亮度约 230；落上墨应显著变暗。
    expect(wet).toBeLessThan(170);          // 正控：动作确实有效
    expect(dryLum).toBeGreaterThan(200);    // 负控：同一动作在干纸上被拒
    expect(dryLum - wet).toBeGreaterThan(40);
  });
});

// ── S2–S6 手卷：竖滚驱动横移的三态门（ADR-7）────────────────────────────────
// 正控：桌面滚到区间末尾，progress→1 且 strip 负向平移到 -(stripWidth - viewport)；
// 负控 A：375 视口不平移（纯竖滚）；负控 B：reduced-motion 不平移。
// 少了负控，一条写漏的媒体查询会让手机端也横移而无人发现。
test.describe('S2–S6 手卷', () => {
  const HALL = '/world/agent-nexus/';
  const readEnd = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const r = document.querySelector('[data-nexus-scroll]') as HTMLElement;
      const s = r.querySelector('[data-strip]') as HTMLElement;
      const st = r.querySelector('.scroll__sticky') as HTMLElement;
      // 🔴 "到底"= 让 section 底沿与 sticky 底沿对齐（sticky 高度可小于视口），
      // 直接滚到文档末尾最稳：p 必须到 1.000，不接受 0.978 这种"差 2%"。
      window.scrollTo(0, document.documentElement.scrollHeight);
      return new Promise<{ prog: number; tx: number; expect: number }>((res) =>
        setTimeout(() => {
          const m = new DOMMatrixReadOnly(getComputedStyle(s).transform === 'none' ? '' : getComputedStyle(s).transform);
          res({ prog: Number(r.dataset.progress), tx: m.m41, expect: -(s.scrollWidth - st.clientWidth) });
        }, 400),
      );
    });

  test('正控：桌面滚到底，progress=1 且 computed matrix 的 tx 等于独立量得的 -(strip-视口)', async ({ page }) => {
    await page.goto(u(HALL));
    const e = await readEnd(page);
    expect(e.prog).toBe(1);                                  // 不接受 0.978
    expect(e.expect).toBeLessThan(-200);                     // 确实有可平移的宽度
    // 🔴 非循环验证：tx 读自 getComputedStyle 的矩阵，expect 由 scrollWidth/clientWidth 独立量得；
    // 两者相等才证明"平移到位"，"tx = p·dx"只是重算公式，证明不了任何东西（glm 反核指出）。
    expect(Math.abs(e.tx - e.expect)).toBeLessThan(1.5);
  });

  test('负控 A：375 视口纯竖滚，不平移', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(u(HALL));
    const e = await readEnd(page);
    expect(e.tx).toBe(0);
    expect(e.prog).toBe(0);
  });

  test('负控 B：reduced-motion 不平移，五跋走文档流', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await page.goto(u(HALL));
    const e = await readEnd(page);
    expect(e.tx).toBe(0);
    const pos = await page.locator('.scroll__sticky').evaluate((el) => getComputedStyle(el).position);
    expect(pos).toBe('static');
  });

  test('五跋骨架：s2–s6 各一篇，绑定的 receipt 全在台账，正文明标待定稿', async ({ page }) => {
    await page.goto(u(HALL));
    const cs = await page.locator('[data-colophon]').evaluateAll((els) =>
      els.map((e) => ({ scene: e.getAttribute('data-scene'), bind: e.getAttribute('data-bind') ?? '', status: e.getAttribute('data-status') })),
    );
    expect(cs.map((c) => c.scene)).toEqual(['s2', 's3', 's4', 's5', 's6']);
    const rids = new Set((ledger.receipts as Array<{ id: string }>).map((r) => r.id));
    for (const c of cs) {
      expect(c.bind.length).toBeGreaterThan(0);
      for (const b of c.bind.split(';').filter((x) => x.startsWith('receipt:'))) expect(rids.has(b.slice(8))).toBe(true);
      expect(c.status).toBe('needs-leige'); // 正文待磊哥：机器面必须如实标注，不冒充定稿
    }
    // 人面：「候选 · 待定稿」标签五跋各一且可见（不是 DOM 里有个字符串）
    await expect(page.locator('[data-colophon] .cf__cand')).toHaveCount(5);
    for (const el of await page.locator('[data-colophon] .cf__cand').all()) await expect(el).toBeVisible();
    // 印严格来自台账：渲染出来的每一枚朱文/白文印文都是台账里的 receipt id（渲染集合 ⊆ 台账集合）
    const rendered = await page.locator('[data-colophon] .cf__seal--go, [data-colophon] .cf__seal--nogo').allTextContents();
    expect(rendered.length).toBeGreaterThan(0);
    for (const t of rendered) expect(rids.has(t.trim())).toBe(true);
  });

  test('收官：四出口 + 讲者简介复制钮', async ({ page }) => {
    await page.goto(u(HALL));
    const hrefs = await page.locator('[data-nexus-epilogue] .hall-exit').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs).toHaveLength(4);
    expect(hrefs.some((h) => h?.includes('?poi=agent-nexus'))).toBe(true);
    await expect(page.locator('[data-nexus-epilogue] [data-copy-target]')).toBeVisible();
  });
});
