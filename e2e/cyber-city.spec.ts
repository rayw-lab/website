// /（Full Entry 科技城）—— 世界剧本 e2e 骨架（CC-E10，波 1 红灯态先写）。
//
// 上位条款（每用例头部另注对应条目）：
//   - PRD §2.6 新三层承诺（`/` 即世界 / 跳过出口第 0 秒可用 / 楼即产品线）
//   - PRD §6.1 CITY-01/02/05/06/09（Full Entry 壳、DOM HUD、变形、驾驶第一拍、跳过与降级）
//   - PRD §7.4 Phase 0 验收门禁 + Persona 2 门禁（猎头剧本：定位语 0 秒可读 → 跳过 → /home/）
//   - SRD §12.7.2 运行时预算（变形 1.0–1.2s、加载→可驾驶 ≤8s、机器人可见 ≤2.5s）
//   - SRD §11.2 ⑥ 交互前零 world 字节冒烟（`_astro/world*` / `models/` / `hdri/` 零请求）
//   - SRD §12.7.4 TransformSystem 状态机（robot_idle → transforming → car_ready）
//   - SRD §12.7.8 降级链与八跳过出口（任一失效 = P0 bug）
//   - 实施方案 `cyber-city-implementation-plan.md` §1 六幕旅程（埋点名 world-enter /
//     world-skip / world-reveal / world-transform / world-drive-start / world-poi:<id> /
//     world-exit-to:<route>）、§4.2 壳结构、§4.3 四条件自动挂载、§7 CC-E10 任务行
//
// ⛔ 红灯态说明（为何全部 test.skip）：
//   本文件先于实现落地（波 1 与 CC-E1/E3/E5 并行）。当前 `/` 仍是宪法 HTML 首页，
//   世界壳（CC-E7，波 4）、TransformSystem + Reveal 首幕（CC-E6，波 2）、`/home/` 平移
//   均未交付——下方选择器契约尚无宿主 DOM，任何用例现在执行都必然失败且不构成回归信号。
//   按实施方案波次表（§7「CC-E10 用例骨架先写，红灯态」）与本 Task 验收口径
//   （「既有 42 用例仍绿，新用例默认 skip 直到选择器就位」），全部用例以 test.skip 声明。
//
// ✅ 绿灯条件（逐条满足后把 test.skip 改回 test）：
//   ① CC-E6 合流：TransformSystem 状态机 + Reveal 首幕可测（变形/终态/计时用例解锁）——
//      ✔ 已交付（波 2，隐藏路径 `/lab/world-spike/?impl=engine&ritual=1` 全流程可测，
//      DOM 契约见下方 SEL 区注释；正式解锁仍等 ② 的 `/` 壳落地把仪式接到根路由）；
//   ①′ CC-E9 合流（波 3）：POI 十二楼触发圈 + `?poi=<slug>` 深链 + `world-poi:<id>` 埋点
//      ✔ 已交付——隐藏路径 `/lab/world-spike/?poi=lingua-tower` 可测（深链出生泊位、
//      光圈提亮、圈内 E/Enter/点按 → world-poi 事件 + 进站 URL 直跳；slug 字典与进站
//      URL 字段契约见 `src/data/world-pois.json` deepLink 块 + eng-wave1-notes CC-E9 节）。
//      POI 专项用例（触发圈进出/深链/无效 slug）待 ② `/` 壳落地随绿灯 PR 一并起草，
//      届时 `/` 壳 PARAM_ALLOWLIST 需增补 `poi`（CC-E7 待办）；
//   ② CC-E7 合流：`/` 世界壳 + `/home/` 上线（零字节冒烟/跳过出口/回退用例解锁）；
//   ③ 选择器契约核对：下方 SEL 常量区与实装 DOM 对齐（约定为唯一改动点，禁止散改用例体）；
//   ④ 项目编排：世界挂载用例移入串行 project（参照 playwright.config.ts world-chromium
//      注释——SwiftShader 下并发 3D 上下文互相挤兑；本次不动配置，那是绿灯时的一并调整）；
//   ⑤ 计时断言校准：SwiftShader ~1fps 慢动作环境下墙钟阈值按 world-spike 先例
//      （e2e-test-plan §5.7 环境口径）标定；真机计时门禁走 human-gate-checklist §5 走查表。
import { test, expect, type Page } from '@playwright/test';
import { u } from './helpers';

/** 被测路由：`/` 即世界（PRD 终裁 D1）；跳过出口目的地 `/home/`（新承诺一） */
const PAGE_URL = u('/');
const HOME_URL = u('/home/');

/**
 * world 字节名单（SRD §11.2 ⑥ + §12.7.2 G-D/G-A′ 语义）：
 * world JS chunk（按 slug 命名 `_astro/world*`）、模型（machines/hero-robot/CarConcept）、
 * HDRI、城市窗格 atlas（`textures/city/`，SRD §7 目录树）。
 * 交互/自动挂载触发前，`/` 不得对以上任何一项发起网络请求。
 */
const WORLD_BYTES_RE = /\/_astro\/world|\/models\/|\/hdri\/|\/textures\/city\//;

/**
 * 选择器契约（CC-E10 预置提案，CC-E6/CC-E7 实装时在此核对对齐——唯一改动点）：
 *   host        壳宿主：复用 facade 状态机（SRD §12.7.9「同一状态机」），
 *               `data-state`: idle|observing|loading|ready|error、`data-blocked` 拦截原因；
 *   worldState  TransformSystem 状态镜像（实施方案 §4.2「状态机驱动 data-world-state」）：
 *               robot_idle|transforming|car_ready|driving 四态（幕④ driving = car_ready 后
 *               首个驾驶输入接管）——✔ CC-E6 已实装：`world/Reveal.ts` 把状态镜像到传入
 *               host 的 `data-world-state`（隐藏路径演示中 = 壳页 `[data-ws-host]`；
 *               CC-E7 把 `[data-world-host]` 传给 Reveal 即与本契约对齐，用例体零改动）；
 *   skip        「跳过 3D」出口（CITY-02：DOM 首个可聚焦元素、第 0 秒可点 → /home/）；
 *   transform   唯一主 CTA「变形 · 巡航态」（CITY-05：点击或 Space 触发，变形期间
 *               disabled + 进度条可见）——✔ CC-E6 已实装：Reveal 生成
 *               `button[data-world-transform]`，选择器与此处一字不差；
 *   backend     后端徽标（WebGPU / WebGL 2，降级链 §12.7.8；spike 先例 data-ws-backend）。
 * CC-E6 附带交付的辅助信号（用例体注释引用，正式收紧归绿灯 PR）：
 *   [data-world-status]  role="status" aria-live 文字状态（CITY-E2E-04 文字提示断言落点）；
 *   [data-world-hint]    键位提示（car_ready 浮现、driving/超时淡出）。
 */
const SEL = {
  host: '[data-world-host]',
  skip: '[data-world-skip]',
  transform: '[data-world-transform]',
  backend: '[data-world-backend]',
} as const;

/** 状态机等待（含 SwiftShader 放宽；绿灯时按 world-spike MOUNT_TIMEOUT 先例校准） */
const MOUNT_TIMEOUT = 150_000;

/** 监听 world 字节请求（零字节断言的公共探针） */
function trackWorldBytes(page: Page): string[] {
  const hits: string[] = [];
  page.on('request', (r) => {
    if (WORLD_BYTES_RE.test(r.url())) hits.push(r.url());
  });
  return hits;
}

test.describe('科技城 @phase0 世界剧本（CC-E10 骨架 · 红灯态待 CC-E6/E7）', () => {
  // 世界挂载单例互斥 + 计时用例需独占（绿灯时移入串行 project，见文件头④）
  test.describe.configure({ mode: 'serial', timeout: 300_000 });

  // ---------------------------------------------------------------------------
  // CITY-E2E-01 壳交互前零 world 字节冒烟
  // 条款：SRD §11.2 ⑥（新增 Playwright 冒烟：`/` 打开后、自动挂载触发前，无任何
  //       `_astro/world*`/`models/`/`hdri/` 请求）；SRD §12.7.2 壳静态段 ≤90KB（G-A′，
  //       字节额度归 CC-E8 门禁，本用例只守「零 world 请求」运行时语义）；
  //       PRD CITY-01（3D 资产全部异步懒加载、不阻塞信息层）；实施方案 §4.2
  //       （world 分包在 HTML 中零 <script src>/<link preload>）。
  // skip 原因：`/` 世界壳未交付（CC-E7 波 4），当前根路由为宪法 HTML 首页。
  // ---------------------------------------------------------------------------
  test.skip('CITY-E2E-01 壳静态段合同：load 事件前零 world 字节 + HTML 零 world 静态标签 + 定位语/poster/noscript 就位', async ({ page, request }) => {
    // SSR 合同：壳预渲染完整文案（SRD §12.7.2 保 SEO 段——定位语 + 楼宇导航 + JSON-LD）
    const res = await request.get(PAGE_URL);
    expect(res.status()).toBe(200);
    const html = await res.text();
    // HTML 静态标签零重资产（G-C′ 语义）：world 分包只许经引导脚本动态 import
    expect(html).not.toMatch(/<(script[^>]+src|link[^>]+rel="(?:pre)?load")[^>]*(_astro\/world|\/models\/|\/hdri\/)/);
    expect(html).toContain('王磊'); // H1 定位语先于 canvas 首帧（CITY-02，占位断言待壳文案定稿）

    // 运行时合同：自动挂载最早发生于 window.load 之后（实施方案 §4.3），
    // 故「导航 → load 事件」窗口内必须零 world 请求
    const hits = trackWorldBytes(page);
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    expect(hits, '自动挂载触发前不得拉取任何 world 字节（SRD §11.2 ⑥）').toEqual([]);

    // 壳三件套：定位语可见（0 秒可读）、poster 为 LCP 元素、noscript 文字导航
    await expect(page.locator('h1')).toBeVisible();
    expect(html).toContain('<noscript'); // noscript 六导航（CITY-01/09⑥，文案待 CC-E7 定稿）
  });

  // ---------------------------------------------------------------------------
  // CITY-E2E-02 跳过出口：第 0 秒可点、Tab 第一焦点、直达 /home/ 且 /home/ 零 world 字节
  // 条款：PRD §2.6 新承诺二（跳过出口第 0 秒可用，Tab 第一焦点，直达 /home/ 或 /work/）；
  //       PRD CITY-02/09①；PRD §7.4 Persona 2 门禁（相对纯 HTML 首页唯一允许的增量
  //       = 一次跳过点击）；SRD §12.7.8 出口①（`/home/` 对 world 零字节依赖）。
  // skip 原因：`/home/` 路由与壳上「跳过 3D」出口均未交付（CC-E7 波 4）。
  // ---------------------------------------------------------------------------
  test.skip('CITY-E2E-02 跳过出口：domcontentloaded 即可点 + Tab 第一焦点 → /home/ 落地零 world 字节', async ({ page }) => {
    const hits = trackWorldBytes(page);

    // 「第 0 秒」口径：不等 load/挂载，DOM 就绪即断言出口存在且可点（新承诺二）
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const skip = page.locator(SEL.skip);
    await expect(skip).toBeVisible();
    await expect(skip).toHaveAttribute('href', HOME_URL);

    // 键盘 Tab 第一焦点 = 跳过出口（SRD §12.7.2 焦点顺序：跳过 → 变形 CTA → 楼宇链接）
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();

    // 猎头 30 秒路径：一击直达 /home/，全程零 world 字节（含 /home/ 落地后，出口①）
    await skip.click();
    await page.waitForURL(new RegExp(`${HOME_URL}$`));
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(hits, '跳过路径全程（含 /home/ 落地）零 world 字节').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-E2E-03 变形 → 可开计时（占位断言）
  // 条款：PRD CITY-05（变形 0.9–1.2s；变形期间按钮 disabled + 进度可见）；
  //       PRD CITY-06 / 终裁 D4（变形后 ≤1s 提示可见、输入可响应——「变形→可开零等待」，
  //       实施方案 §5.2 预算行「变形 → 可开：0 等待」）；SRD §12.7.2（变形动画 1.0–1.2s、
  //       加载→可驾驶 ≤8s @Fast 4G 为 e2e 计时断言）；SRD §12.7.4 状态机三态。
  // skip 原因（CC-E6 交付后更新）：TransformSystem/Reveal ✔ 已交付（波 2）——状态序
  //       robot_idle→transforming（CTA disabled + 进度条）→car_ready→driving 与
  //       「car_ready 同帧 filters intro→driving」（D4 零等待）已在隐藏路径
  //       `/lab/world-spike/?impl=engine&ritual=1` 全流程实测通过（含按住 W 穿越变形窗、
  //       依赖系统连发在 car_ready 后自动接管的边缘）。仍 skip：`/` 壳 + 自动挂载
  //       （data-state=ready）归 CC-E7；墙钟阈值待 SwiftShader 慢动作系数标定（文件头⑤，
  //       实测参考：1.05s 设计窗在 ~1fps 软渲染下走 ~40s 墙钟）。
  // ---------------------------------------------------------------------------
  test.skip('CITY-E2E-03 变形仪式：robot_idle → transforming（CTA disabled）→ car_ready，落地即刻 WASD 可开', async ({ page }) => {
    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);

    // 自动挂载（§4.3 四条件在桌面 headless 全过）→ 首幕就绪；计时点 t0 = 导航发起
    const t0 = Date.now();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle');
    const mountMs = Date.now() - t0;
    // 占位：真机门禁「加载→可变形 ≤8s @Fast 4G」（SRD §12.7.2）；CI 软渲染仅采集留档，
    // 阈值断言待绿灯校准（walkthrough 表 human-gate-checklist §5 承接真机判定）
    test.info().annotations.push({ type: 'metric', description: `load→robot_idle ${mountMs}ms（真机门禁 ≤8s，CI 采集不阻断）` });

    // 变形：唯一主 CTA；transforming 期间 disabled + 进度可见（CITY-05 验收标准）
    const cta = page.locator(SEL.transform);
    await expect(cta).toBeEnabled();
    const t1 = Date.now();
    await cta.click();
    await expect(host).toHaveAttribute('data-world-state', 'transforming');
    await expect(cta).toBeDisabled();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 60_000 });
    const transformMs = Date.now() - t1;
    test.info().annotations.push({ type: 'metric', description: `transform ${transformMs}ms（设计窗 1.0–1.2s，软渲染慢动作下按系数换算后断言，待校准）` });

    // D4 硬语义：car_ready 即刻可开——变形完成后立即压 W，不允许二次点击/等待
    await page.keyboard.down('w');
    try {
      // 占位断言：驾驶接管（data-world-state → driving，实施方案 §1.1 幕④）。
      // 绿灯时升级为遥测轮询（速度/位移，参照 world-spike pollState 先例）。
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }
  });

  // ---------------------------------------------------------------------------
  // CITY-E2E-04 reduced-motion 终态
  // 条款：PRD CITY-05 验收（reduced-motion 下为即时切换 + 文字状态提示）；
  //       PRD CITY-09⑤（reduced-motion 直达降级路径）；实施方案 §1.2（不自动挂载，
  //       facade 既有拦截 data-blocked="reduced-motion"；显式进入后跳过全部动画——
  //       静态城市 + 机器人终态直接呈现，变形为 instant swap）；SRD §12.7.2 保 a11y 段。
  // skip 原因（CC-E6 交付后更新）：TransformSystem instant swap ✔ 已交付——
  //       reduced-motion 下零动画窗直落 car_ready + `[data-world-status]`
  //       （role="status" aria-live）文字状态提示已实测（隐藏路径 &ritual=1 +
  //       emulateMedia reducedMotion）。仍 skip：不自动挂载（data-blocked）与显式
  //       `[data-world-enter]` 按钮属 `/` 壳（CC-E7）。
  // ---------------------------------------------------------------------------
  test.skip('CITY-E2E-04 reduced-motion：不自动挂载零 world 字节；显式进入 → 终态直出；变形为即时切换 + 文字状态提示', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const hits = trackWorldBytes(page);

    // 拦截合同：§4.3 条件① 不满足 → 壳静态呈现 + 显式「进入」按钮，零 world 字节
    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await page.waitForTimeout(2_500);
    expect(hits, 'reduced-motion 下未显式进入不得拉取 world 字节').toEqual([]);

    // 显式逃生门（§12.4 语义沿用）：进入后终态直出，无 Reveal 动画序列
    await host.locator('[data-world-enter]').click(); // 显式「进入科技城」按钮（契约待 CC-E7 对齐）
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle');
    expect(hits.length, '显式进入后才允许拉取 world 字节').toBeGreaterThan(0);

    // 变形 = instant swap + 文字状态提示（无 1.0–1.2s 动画窗；直接落 car_ready）
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 15_000 });
    // 文字状态提示（CC-E6 定稿：`[data-world-status]` role="status" aria-live，
    // car_ready 文案「巡航态 · CarConcept 已落地十字路口——WASD 即刻可开」；
    // 绿灯 PR 可收紧为精确选择器 + 文案匹配）
    await expect(host.locator('[role="status"], [aria-live]').first()).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // CITY-E2E-05 ?gl=1 强制 WebGL 2 回退
  // 条款：SRD §12.7.8 降级链第二档（WebGL 2 科技城 = 同一世界）；PRD LAB-17 迁移条款
  //       （变形在 WebGL 2 回退路径同样可播——TSL 双后端）；spike 先例 WS-E2E-05
  //       （`?gl=1` 契约结转，e2e-test-plan §5.7）。
  // skip 原因：世界壳未交付；`?gl=` 读参逻辑随 CC-E7 壳引导脚本落地。
  // ---------------------------------------------------------------------------
  test.skip('CITY-E2E-05 ?gl=1 回退：后端徽标 WebGL 2，变形仪式在回退腿同样可播，零未捕获异常', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(`${PAGE_URL}?gl=1`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 后端徽标：强制回退腿恒为 WebGL 2（headless 无 navigator.gpu 时默认腿同为 WebGL 2，
    // 本用例的信息量在于 ?gl=1 显式短路 WebGPU 探测——契约与 spike WS-E2E-05 同构）
    await expect(page.locator(SEL.backend)).toHaveText('WebGL 2');

    // 变形在回退腿可播（TSL 双后端承诺）：状态序完整走通
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 60_000 });
    expect(errors, '?gl=1 回退腿全程零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-E2E-06 机器人可见计时（占位采集）
  // 条款：PRD CITY-04 验收（机器人可见 ≤2.5s Fast 4G 桌面）；SRD §12.7.2 预算行
  //       （机器人可见 ≤2.5s，poster 先显、LCP 不等 GLB——考核方式「e2e 冒烟计时」）；
  //       实施方案 §5.2（机器人可见 ≤3s @Fast 4G，首批 1.3MB 就绪即开演）。
  // skip 原因（CC-E5/E6 交付后更新）：HeroRobot（E5）与 Reveal（E6）✔ 已交付——
  //       「机器人可见」可测信号已定契约：Reveal 起光柱时 trigger('world-reveal')，
  //       DOM 侧信号 = host `data-world-state` 落 'robot_idle'（光柱落定 ≈1.15s 后，
  //       本用例既有断言即此契约，无需改动）。仍 skip：`img[data-world-poster]` 与
  //       `/` 壳自动挂载归 CC-E7。
  // ---------------------------------------------------------------------------
  test.skip('CITY-E2E-06 机器人可见计时：poster 先显（LCP 不等 GLB），world-reveal 计时采集留档', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(PAGE_URL);

    // poster 先显：机器人 GLB 就绪前 LCP 元素已可见（预算表「poster 先显」行）
    await expect(page.locator('img[data-world-poster]')).toBeVisible();

    // 首幕开演信号：world-reveal（实施方案 §1.1 幕②埋点；DOM 侧信号契约已随 CC-E6
    // 对齐 = host `data-world-state` 落 'robot_idle'，光柱落定后由 Reveal 镜像）
    await expect(page.locator(SEL.host)).toHaveAttribute('data-world-state', 'robot_idle', {
      timeout: MOUNT_TIMEOUT,
    });
    const revealMs = Date.now() - t0;
    // 占位：真机门禁 ≤2.5s（Fast 4G 桌面）由 human-gate-checklist §5 承接；
    // CI 软渲染读数仅采集留档为下界参考，不做阈值阻断（口径同 WS-PERF-01）
    test.info().annotations.push({ type: 'metric', description: `load→robot 可见 ${revealMs}ms（真机门禁 ≤2.5s，CI 采集不阻断）` });
  });
});
