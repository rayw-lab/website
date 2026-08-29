// [CC-NAV-C1] M 键小地图 / 点击进楼（两段式传送）验收 —— NAV 调研
// docs/research/cyber-city-minimap-nav-survey.md §5.2 九断言（A1–A8 本文件覆盖，
// A9 = 既有全量 e2e 零变化，由全量轮承担）；语义终裁 = 董事会 R5-impl-gate §B
// （DP-1 传送式两段式 / DP-3 robot_idle+transforming 双态 hidden）。
// world-chromium 串行 project（playwright.config testMatch cyber-city.*\.spec\.ts
// 自动收编，config 零改动——impl-gate F6 口径）。
//
// 被测面 = ui/Minimap.ts：M/「地图」钮开合（非模态）→ pin 点击/键盘激活 →
// teleportTo() 传送 parkingBay（不动 Respawns）→ 关面板 → boundingIn 天然入账 →
// E 确认进站（PoiArrival 前奏照常）；Esc capture 段吞键（壳 ESC 菜单零双响）。
//
// 纪律（cyber-city-observability/poi-arrival spec 同源）：
//   - SwiftShader 慢动作：只断存在性/顺序性（seq 序、终态），禁时长阈值；
//   - route abort 跳转前取证（errorCode 显式 'aborted'——OBS-01/PA-01 先例）；
//   - 单例全链：3D 挂载成本高，一次挂载串多断言（CITY-HINT-01 先例）。
//
// 用例分布：
//   CITY-NAV-01 deep-link 腿全链（A1 开合 + A2 Esc 双响锁 + A3 键盘选楼 +
//               A4 传送→E 进楼路由链 + A8 埋点白名单/seq 序）
//   CITY-NAV-02 ritual 恒等门 + driving 腿（A5 robot_idle 零反应/零面板 DOM +
//               A1 driving 态开合 + 键位卡「M 地图」串尾断言）
//   CITY-NAV-03 reduced-motion + 触屏（A6 开合直切 + A7 HUD 钮/pin 点按传送）
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { u } from './helpers';

const PAGE_URL = u('/');

/** 挂载等待（cyber-city.spec.ts 文件头⑤ SwiftShader 校准口径） */
const MOUNT_TIMEOUT = 210_000;

/** 出生锚 POI：?poi= 出生即落触发圈内（PA spec 同款） */
const SPAWN_SLUG = 'autodrive-lab';
/** 传送靶楼：voice-pod（南口语言区第二栋——与出生楼不同城区，距离可感） */
const TELEPORT_SLUG = 'voice-pod';

const SEL = {
  host: '[data-world-host]',
  enter: '[data-world-enter]',
  transform: '[data-world-transform]',
  hint: '[data-world-hint]',
  escMenu: '[data-world-esc-menu]',
  audio: '[data-world-audio]',
  panel: '[data-world-minimap]',
  btn: '[data-world-minimap-btn]',
  closeBtn: '[data-world-minimap-close]',
  marker: '[data-world-minimap-player]',
  pin: (id: string): string => `[data-world-minimap-pin="${id}"]`,
} as const;

/* ———— 数据单源（Node ESM 下 JSON 用 fs 读——AGENTS 已知坑；PA spec 先例） ———— */

const cityMap = JSON.parse(
  readFileSync(new URL('../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
) as {
  districts: Array<{ id: string; buildings: string[] }>;
  buildings: Array<{
    id: string;
    deepLink: string;
    parkingBay: { x: number; z: number; heading: number; radius: number };
  }>;
};

const teleportTarget = cityMap.buildings.find((b) => b.id === TELEPORT_SLUG);
if (!teleportTarget) throw new Error(`buildings JSON 缺少 ${TELEPORT_SLUG}`);
const BAY = teleportTarget.parkingBay;
/** E 确认进站的 navigate 目标（route abort 模式；base=/website 同 PA-01） */
const NAV_ROUTE = `**/website${teleportTarget.deepLink}`;
/** 首 pin = districts 序第一栋（Tab 顺序合同：JSON districts 序，调研 §3.4） */
const FIRST_PIN_ID = cityMap.districts[0]!.buildings[0]!;

/* ———— dump schema 消费侧最小面（PA/OBS spec 同构） ———— */

interface SessionEventEntry {
  seq: number;
  t: number;
  type: string;
  data?: Record<string, string | number | boolean>;
}

interface SessionDump {
  env: { reducedMotion: boolean; touch: boolean };
  events: SessionEventEntry[];
}

/** UA 级已知异常白名单（world-spike.spec.ts 先例） */
const isKnownUaError = (msg: string): boolean => /Transition was skipped/.test(msg);

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function readDump(page: Page): Promise<SessionDump> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSession?: { dump(): unknown } }).__worldSession;
    if (!ws) throw new Error('__worldSession 未挂载');
    return ws.dump() as SessionDump;
  });
}

/** 引擎侧位置遥测（__worldSpike.state()——传送落点断言口径） */
async function readPos(page: Page): Promise<{ x: number; z: number }> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike?: { state(): { x: number; z: number } } })
      .__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    const state = ws.state();
    return { x: state.x, z: state.z };
  });
}

/** 轮询 dump 直至谓词满足（OBS spec 同款） */
async function pollDump(
  page: Page,
  pred: (d: SessionDump) => boolean,
  timeoutMs: number,
  intervalMs = 1_000,
): Promise<{ ok: boolean; dump: SessionDump }> {
  const deadline = Date.now() + timeoutMs;
  let dump = await readDump(page);
  while (!pred(dump)) {
    if (Date.now() > deadline) return { ok: false, dump };
    await page.waitForTimeout(intervalMs);
    dump = await readDump(page);
  }
  return { ok: true, dump };
}

/** E 键重试直至 dump 谓词满足（OBS-01 E 循环先例：标点开合节拍冗余） */
async function pressEUntil(
  page: Page,
  pred: (d: SessionDump) => boolean,
  timeoutMs: number,
): Promise<{ ok: boolean; dump: SessionDump }> {
  const deadline = Date.now() + timeoutMs;
  let dump = await readDump(page);
  if (pred(dump)) return { ok: true, dump };
  while (Date.now() < deadline) {
    await page.keyboard.press('e');
    const hit = await pollDump(page, pred, 5_000);
    dump = hit.dump;
    if (hit.ok) return { ok: true, dump };
  }
  return { ok: false, dump };
}

const firstOf = (
  dump: SessionDump,
  type: string,
  pred?: (e: SessionEventEntry) => boolean,
): SessionEventEntry | undefined =>
  dump.events.find((e) => e.type === type && (pred?.(e) ?? true));

/** boundingBox 轴对齐矩形不相交（CITY-AUD-01 hit-target 合同） */
const boxesDisjoint = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean =>
  a.x + a.width <= b.x ||
  b.x + b.width <= a.x ||
  a.y + a.height <= b.y ||
  b.y + b.height <= a.y;

test.describe('科技城 M 键小地图（CC-NAV-C1 · world-chromium 串行 project）', () => {
  // 3D 挂载单例互斥（cyber-city.spec.ts 同纪律）；长用例单独 setTimeout 放宽
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  // ---------------------------------------------------------------------------
  // CITY-NAV-01 deep-link 腿全链（A1/A2/A3/A4/A8）
  // 条款：调研 §5.2——M 开合 + Esc 关面板且壳菜单未开（双响回归锁）+ Tab/Enter
  //       键盘选楼 = 点击同语义 + 传送落 parkingBay（≤radius）→ boundingIn →
  //       E → world-poi → navigate 被 route abort 拦下（跳转前取证）+
  //       minimap-open/close/teleport 入 dump 白名单且 seq 有序。
  // ---------------------------------------------------------------------------
  test('CITY-NAV-01 全链：M/Esc 开合（壳菜单零双响）→ Tab+Enter 选楼传送 → E 确认进站路由链 + 埋点 seq 序', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);

    let navHits = 0;
    await page.route(NAV_ROUTE, (route) => {
      navHits += 1;
      void route.abort('aborted');
    });

    await page.goto(`${PAGE_URL}?poi=${SPAWN_SLUG}`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    const panel = page.locator(SEL.panel);
    const escMenu = page.locator(SEL.escMenu);

    // —— A1 开合（deep-link 腿 filters='wandering'——poiInteract 同权口径）
    await expect(panel).toHaveCount(0); // 懒初始化：首开前零面板 DOM（folio P6）
    await page.keyboard.press('m');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('aria-modal', 'false'); // 非模态合同
    await expect(page.locator(SEL.marker)).toBeVisible(); // 玩家标记在板
    await page.keyboard.press('m');
    await expect(panel).toBeHidden();

    // —— A2 Esc 双响回归锁：面板关 且 壳 ESC 菜单未开（capture 段吞键）
    await page.keyboard.press('m');
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(escMenu).not.toBeVisible();
    expect(
      await escMenu.evaluate((el) => (el as HTMLDialogElement).open),
      'Esc 关面板时壳 ESC 菜单不得被同键打开（双响拆弹，调研 R1）',
    ).toBe(false);

    // —— A8（前半）：开合埋点入 dump 白名单（在账即证白名单放行）+ via 语义
    let dump = await readDump(page);
    expect(firstOf(dump, 'minimap-open', (e) => e.data?.via === 'key')).toBeTruthy();
    expect(firstOf(dump, 'minimap-close', (e) => e.data?.via === 'key')).toBeTruthy();
    expect(firstOf(dump, 'minimap-close', (e) => e.data?.via === 'esc')).toBeTruthy();

    // —— A3 键盘选楼：HUD 钮开 → 焦点落首 pin（districts 序）→ Tab 走查至靶楼
    //    → Enter 激活 = 点击同语义（原生 button）
    await page.locator(SEL.btn).click();
    await expect(panel).toBeVisible();
    await expect(page.locator(SEL.pin(FIRST_PIN_ID)), '开面板焦点应落首 pin').toBeFocused();
    const targetPin = page.locator(SEL.pin(TELEPORT_SLUG));
    let pinFocused = false;
    for (let i = 0; i < 14 && !pinFocused; i++) {
      pinFocused = await targetPin.evaluate((el) => el === document.activeElement);
      if (!pinFocused) await page.keyboard.press('Tab');
    }
    expect(pinFocused, `Tab 序应可达 ${TELEPORT_SLUG} pin（districts 序遍历）`).toBe(true);
    await page.screenshot({ path: 'test-results/minimap-open-pin-focused.png' });
    await page.keyboard.press('Enter');

    // —— A4 传送第一段：面板关（via teleport）+ 落点 ≤ 触发圈半径 + 埋点在账
    await expect(panel).toBeHidden();
    await expect
      .poll(
        async () => {
          const pos = await readPos(page);
          return Math.hypot(pos.x - BAY.x, pos.z - BAY.z);
        },
        { timeout: 60_000 },
      )
      .toBeLessThanOrEqual(BAY.radius + 1); // 物理落位余量 1m；入圈真值由 boundingIn 证
    dump = await readDump(page);
    const teleportEvent = firstOf(dump, 'minimap-teleport');
    expect(teleportEvent?.data?.id).toBe(TELEPORT_SLUG);
    expect(teleportEvent?.data?.distanceM, '传送距离应为正整数（观测口径）').toBeGreaterThan(0);
    expect(firstOf(dump, 'minimap-close', (e) => e.data?.via === 'teleport')).toBeTruthy();

    // 落点即触发圈内：boundingIn 全链天然入账（explore/quest 零旁路的入口证据）
    const entered = await pollDump(
      page,
      (d) => firstOf(d, 'poi-bounding-in', (e) => e.data?.id === TELEPORT_SLUG) !== undefined,
      120_000,
    );
    expect(entered.ok, '传送落点应自然触发 poi-bounding-in（Zones 距离检测）').toBe(true);

    // —— A4 第二段：E 确认进站 → world-poi → navigate 被拦（跳转前取证）
    const interacted = await pressEUntil(
      page,
      (d) => firstOf(d, 'world-poi', (e) => e.data?.id === TELEPORT_SLUG) !== undefined,
      120_000,
    );
    expect(interacted.ok, '圈内 E 应触发 world-poi（两段式第二段）').toBe(true);
    await expect.poll(() => navHits, { timeout: 240_000 }).toBeGreaterThanOrEqual(1);

    // —— A8（后半）：seq 序——minimap-teleport 先于 world-poi（两段式因果序）
    const finalDump = await readDump(page);
    const teleportSeq = firstOf(finalDump, 'minimap-teleport')!.seq;
    const poiSeq = firstOf(finalDump, 'world-poi', (e) => e.data?.id === TELEPORT_SLUG)!.seq;
    expect(poiSeq, 'world-poi 应晚于 minimap-teleport（传送 → E 确认因果序）').toBeGreaterThan(
      teleportSeq,
    );
    await page.screenshot({ path: 'test-results/minimap-teleport-arrived.png' });

    expect(errors.filter((m) => !isKnownUaError(m)), 'deep-link 腿零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-NAV-02 ritual 恒等门 + driving 腿（A5 + A1-driving + 键位卡串尾）
  // 条款：robot_idle 期按 M 零反应（categories 被 intro 闸门物理拦截）+ HUD 钮
  //       hidden（CSS 两态样式门）+ 零面板 DOM（懒初始化）；car_ready 键位卡
  //       串尾含「M 地图」；driving 态 M 开合可用（面板开态世界不暂停——非模态）。
  // ---------------------------------------------------------------------------
  test('CITY-NAV-02 恒等门：robot_idle 按 M 零反应/零面板 DOM/钮 hidden → 键位卡含 M 地图 → driving 态 M 开合', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);

    await page.goto(PAGE_URL); // 默认剧本 = ritual 首幕（终裁 D4）
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    const panel = page.locator(SEL.panel);
    const btn = page.locator(SEL.btn);

    // —— A5 恒等门：钮 hidden（DP-3 CSS 两态样式门）+ M 连按零反应（intro 闸门）
    //    + 零面板 DOM（懒初始化——robot_idle 帧 poster 恒等零风险面）
    await expect(btn).toBeHidden();
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('m');
      await page.waitForTimeout(1_000);
    }
    await expect(panel).toHaveCount(0);
    let dump = await readDump(page);
    expect(
      dump.events.some((e) => e.type === 'minimap-open'),
      'robot_idle 期不得出现 minimap-open（categories 闸门）',
    ).toBe(false);
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle');

    // —— 变形至 car_ready：钮可见 + 键位卡串尾「M 地图」（Reveal 同 PR 加法）
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });
    await expect(btn).toBeVisible();
    await expect(page.locator(SEL.hint)).toContainText('M 地图');

    // —— CITY-AUD-01：HUD 右上小地图钮与静音钮 hit-target 不得相交（#166 盖 #164 补洞）
    const audioBtn = page.locator(SEL.audio);
    await expect(audioBtn).toBeVisible();
    const minimapBox = await btn.boundingBox();
    const audioBox = await audioBtn.boundingBox();
    expect(minimapBox, '小地图钮应有 boundingBox').not.toBeNull();
    expect(audioBox, '静音钮应有 boundingBox').not.toBeNull();
    expect(
      boxesDisjoint(minimapBox!, audioBox!),
      '小地图钮与静音钮 hit-target 不得相交（HUD 右上叠盖拦截）',
    ).toBe(true);

    // —— A1 driving 态开合：W 接管后 M 开面板（非模态——世界不暂停、状态机原地）
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 60_000 });
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }
    await page.keyboard.press('m');
    await expect(panel).toBeVisible();
    await expect(host).toHaveAttribute('data-world-state', 'driving'); // 开图不改驾驶态
    dump = await readDump(page);
    expect(firstOf(dump, 'minimap-open', (e) => e.data?.via === 'key')).toBeTruthy();
    await page.screenshot({ path: 'test-results/minimap-driving-open.png' });
    await page.keyboard.press('m');
    await expect(panel).toBeHidden();

    expect(errors.filter((m) => !isKnownUaError(m)), 'ritual 腿零未捕获异常').toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CITY-NAV-03 reduced-motion + 触屏（A6/A7）：hasTouch → (pointer: coarse) 命中
// （CITY-HINT-02 先例：宽视口不触发壳 viewport<768 拦截）；reduced-motion 走壳
// 显式进入（CITY-PA-03 先例）。开合直切（.01ms 一次性动画，断言 = 即达终态）；
// HUD「地图」钮点按开合 + pin 点按传送（触屏唯一入口等价链）。
// ---------------------------------------------------------------------------
test.describe('科技城小地图触屏/reduced-motion（CC-NAV-C1 · world-chromium 串行 project）', () => {
  test.describe.configure({ mode: 'serial', timeout: 420_000 });
  test.use({ hasTouch: true });

  test('CITY-NAV-03 触屏+直切：HUD 钮点按开合（reduced-motion 即达终态）→ pin 点按传送落 parkingBay', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(`${PAGE_URL}?poi=${SPAWN_SLUG}`);
    const host = page.locator(SEL.host);
    // 壳四条件拦截：reduced-motion 走显式进入（CITY-PA-03 同口径）
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await host.locator(SEL.enter).click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 检测口径互证：env.touch / env.reducedMotion 与 UI 分文案同源
    const dump0 = await readDump(page);
    expect(dump0.env.touch, 'pointer: coarse 应命中（hasTouch 上下文）').toBe(true);
    expect(dump0.env.reducedMotion).toBe(true);

    const panel = page.locator(SEL.panel);
    const btn = page.locator(SEL.btn);

    // —— A6/A7 开合直切：钮点按 → 面板即达可见终态（开合动画 .01ms 直切）；
    //    关闭钮点按 → 即达隐藏终态
    await btn.click();
    await expect(panel).toBeVisible();
    await page.screenshot({ path: 'test-results/minimap-touch-open.png' });
    await page.locator(SEL.closeBtn).click();
    await expect(panel).toBeHidden();
    let dump = await readDump(page);
    expect(firstOf(dump, 'minimap-open', (e) => e.data?.via === 'button')).toBeTruthy();
    expect(firstOf(dump, 'minimap-close', (e) => e.data?.via === 'button')).toBeTruthy();

    // —— A7 pin 点按传送：再开 → 点按靶楼 pin（44px 热区）→ 关面板 + 落点入圈
    await btn.click();
    await expect(panel).toBeVisible();
    await page.locator(SEL.pin(TELEPORT_SLUG)).click();
    await expect(panel).toBeHidden();
    await expect
      .poll(
        async () => {
          const pos = await readPos(page);
          return Math.hypot(pos.x - BAY.x, pos.z - BAY.z);
        },
        { timeout: 60_000 },
      )
      .toBeLessThanOrEqual(BAY.radius + 1);
    dump = await readDump(page);
    expect(firstOf(dump, 'minimap-teleport', (e) => e.data?.id === TELEPORT_SLUG)).toBeTruthy();
    expect(firstOf(dump, 'minimap-close', (e) => e.data?.via === 'teleport')).toBeTruthy();
    await page.screenshot({ path: 'test-results/minimap-touch-teleported.png' });

    expect(errors.filter((m) => !isKnownUaError(m)), '触屏腿零未捕获异常').toEqual([]);
  });
});
