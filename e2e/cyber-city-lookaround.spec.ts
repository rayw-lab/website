// 科技城驾驶态 Q/E 视角侧转验收（AH-QE）—— 提案 docs/local-cmd/proposals/AH-QE-lookaround.md §D。
//
// 被测面 = View.updateLookaround（相机方位角加法通道）+ Player 动作表 lookLeft/lookRight：
//   Q = 视线左转（+theta）、E = 视线右转（−theta），按住按 dt 累积至 ±135°，
//   松手一阶指数回正；fpv 与 POI 进站前奏期间硬门封锁。转的是相机，车不转。
//
// 纪律（与 cyber-city-poi-arrival.spec.ts / observability 同源）：
//   - SwiftShader 慢动作：Ticker.delta 钳在 1/30s，1fps 下 500ms 墙钟只推进约一帧
//     游戏时间。因此一律「按住 + 轮询到阈值」，禁把提案里的 500ms/600ms 当墙钟阈值
//     用——断的是「按住必到位、松手必回零」的状态语义，不是时长（§2-4 纪律）；
//   - 取证句柄 = #debug 的 __worldSpikeGame.view.lookYaw（View 只读出口，
//     CITY-OBS-05 白名单路径；不新增全局）；
//   - 圈内腿复用 poi-arrival 的 route abort 手法拦下真跳转，保住 JS 上下文取证；
//     ritual 腿的圈内位形用 #debug 句柄摆位（FB-09 测速牌驶越先例：软渲染下开进
//     触发圈不可确定性复现，而圈判定本身是逐帧距离比较，置位即真值、无旁路）。
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { u } from './helpers';

const PAGE_URL = u('/');

/** 挂载等待（cyber-city.spec.ts 文件头⑤ SwiftShader 校准口径） */
const MOUNT_TIMEOUT = 210_000;
/** 环视累积/回正轮询窗：慢动作下 0.3-0.8 游戏秒可放大到数十秒墙钟 */
const YAW_TIMEOUT = 150_000;

/** 圈内腿目标 = about-pavilion（?poi= 深链出生即在 parkingBay 圆心，E 立即可交互） */
const POI_SLUG = 'about-pavilion';
const SHOT_ID = `poi_showcase-${POI_SLUG}`;

const SEL = {
  host: '[data-world-host]',
  transform: '[data-world-transform]',
} as const;

const DEG = Math.PI / 180;

/* ———— 数据单源（Node ESM 下 JSON 用 fs 读——AGENTS 已知坑；CITY-VEH-07 先例） ———— */

const buildingsJson = JSON.parse(
  readFileSync(new URL('../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
) as {
  buildings: Array<{
    id: string;
    deepLink: string;
    hallPath?: string;
    parkingBay: { x: number; z: number };
  }>;
};

const targetBuilding = buildingsJson.buildings.find((b) => b.id === POI_SLUG);
if (!targetBuilding) throw new Error(`buildings JSON 缺少 ${POI_SLUG}`);

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 全楼 navigate 兜底路由：Areas.onInteract 的落点单源 = `hallPath ?? deepLink`
 * （ADR-2 起 about-pavilion 等楼走展厅路径，带 ?from=city&poi=）——只按 deepLink
 * 组正则会漏拦展厅路径，进站真跳转会销毁取证上下文。圈外腿期望零命中。
 */
const ANY_NAV_ROUTE = new RegExp(
  '/website(' +
    buildingsJson.buildings.map((b) => escapeRe(b.hallPath ?? b.deepLink)).join('|') +
    ')(\\?.*)?$',
);

interface SessionDump {
  events: Array<{ seq: number; type: string; data?: Record<string, string | number | boolean> }>;
  funnel: { firstPoiIn: number | null };
}

/** UA 级已知异常白名单（world-spike.spec.ts 先例）：跨文档 View Transition 跳过 */
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

/** [AH-QE] 环视偏航只读出口（弧度；View.lookYaw 单源，需 #debug 句柄） */
async function readLookYaw(page: Page): Promise<number> {
  return page.evaluate(() => {
    const game = (window as unknown as { __worldSpikeGame?: { view: { lookYaw: number } } })
      .__worldSpikeGame;
    if (!game) throw new Error('__worldSpikeGame 未挂载（需 #debug）');
    return game.view.lookYaw;
  });
}

/** 输出相机世界方位（atan2 反解）：「相机真转了」的取景真值，非只有内部读数 */
async function readCameraHeading(page: Page): Promise<number> {
  return page.evaluate(() => {
    const game = (window as unknown as {
      __worldSpikeGame?: { view: { camera: { position: { x: number; z: number } } } };
    }).__worldSpikeGame;
    if (!game) throw new Error('__worldSpikeGame 未挂载（需 #debug）');
    const p = game.view.camera.position;
    return Math.atan2(p.x, p.z);
  });
}

/** #debug 句柄摆位（FB-09 先例）：把车体放到指定地面坐标，离地净高同 moveTo 口径 */
async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate(
    ({ x: tx, z: tz }) => {
      const game = (window as unknown as {
        __worldSpikeGame?: {
          physicalVehicle: {
            chassis: {
              physical: {
                body: {
                  setTranslation(v: { x: number; y: number; z: number }, wake: boolean): void;
                  setRotation(
                    q: { x: number; y: number; z: number; w: number },
                    wake: boolean,
                  ): void;
                };
              };
            };
          } | null;
        };
      }).__worldSpikeGame;
      const body = game?.physicalVehicle?.chassis.physical.body;
      if (!body) throw new Error('#debug 句柄或物理车缺席');
      body.setTranslation({ x: tx, y: 1.1, z: tz }, true);
      body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    },
    { x, z },
  );
}

test.describe('科技城驾驶态 Q/E 视角侧转（AH-QE · world-chromium 串行 project）', () => {
  // 3D 挂载单例互斥（cyber-city.spec.ts 同纪律）
  test.describe.configure({ mode: 'serial', timeout: 900_000 });

  // ---------------------------------------------------------------------------
  // CITY-QE-01 环视全链（单次 ritual 挂载串完所有驾驶态腿，挂载成本纪律同 CITY-FB
  // 全链先例）：
  //   ⓪ robot_idle 恒等门：Q 被 Inputs filters（intro）物理拦截；
  //   ⓪′ [r2] car_ready（还没碰过 WASD）：Q 已生效且不把状态顶成 driving；
  //   ① 按住 Q → lookYaw 累积过 40°，且输出相机方位同步转动（取景真值）；
  //   ② 继续按住 → 进入最后 10° 减速带并严格不越 +135°；
  //   ③ 松手 → 回正至 |yaw| < 3° 并确定性归零（无过冲残余）；
  //   ④ 圈外按住 E → 反向过 −40°，零 world-poi / 零 navigate（圈外分支自证）；
  //   ⑤ V 进 FPV → 按住 E 多拍采样 lookYaw 恒 0，切回 third 不带残角；
  //   ⑥ 圈内（#debug 摆位到 about-pavilion 泊位）按 E → 既有进站前奏照常，环视恒 0。
  // ---------------------------------------------------------------------------
  test('CITY-QE-01 环视全链：Q 累积 → 抵近上限 → 松手回正 → E 反向 → FPV 封锁 → 圈内 E 互斥', async ({
    page,
  }) => {
    test.setTimeout(900_000);
    const errors = trackErrors(page);

    // 任何楼的 navigate 一律拦下（route abort 保住 JS 上下文；圈外腿期望零命中）
    let navHits = 0;
    await page.route(ANY_NAV_ROUTE, (route) => {
      navHits += 1;
      void route.abort('aborted');
    });

    await page.goto(`${PAGE_URL}#debug`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // —— ⓪ 恒等门：robot_idle 期 Q 被 filters（intro）物理拦截
    await page.keyboard.down('q');
    await page.waitForTimeout(1_500);
    await page.keyboard.up('q');
    expect(await readLookYaw(page), 'robot_idle 期环视必须物理拦截（恒等门）').toBe(0);

    // —— 变形 → car_ready：[r2 补洞] 环视门与 V 键对齐（gate ∈ {car_ready, driving}），
    //    「变形成车后、没按 V 的任何时刻都能环视」——此刻还没碰过 WASD，Q 必须已生效；
    //    且环视 ≠ 驾驶意图：按 Q 全程状态不得被顶成 driving（不进 DRIVE_ACTIONS 的机器证）
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });
    await page.keyboard.down('q');
    try {
      await expect.poll(() => readLookYaw(page), { timeout: YAW_TIMEOUT }).toBeGreaterThan(40 * DEG);
      await expect(host, '环视不得把 car_ready 顶成 driving').toHaveAttribute(
        'data-world-state',
        'car_ready',
      );
    } finally {
      await page.keyboard.up('q').catch(() => {});
    }
    await expect.poll(() => readLookYaw(page), { timeout: YAW_TIMEOUT }).toBe(0);
    await expect(host).toHaveAttribute('data-world-state', 'car_ready');

    // —— 首个驾驶输入接管 driving（其余各腿沿用驾驶态）
    await page.keyboard.down('w');
    try {
      await expect(host).toHaveAttribute('data-world-state', 'driving', { timeout: 120_000 });
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }

    // 圈外自证：首幕出生锚点（十字路口）不在任何 POI 触发圈内——④ 腿的前提
    const beforeLook = await readDump(page);
    expect(beforeLook.funnel.firstPoiIn, '首幕出生点应在所有 POI 触发圈外（E 腿前提）').toBeNull();

    const headingBefore = await readCameraHeading(page);

    // —— ① Q 累积（提案 §D 断言 1；轮询非时长阈值）
    await page.keyboard.down('q');
    try {
      await expect.poll(() => readLookYaw(page), { timeout: YAW_TIMEOUT }).toBeGreaterThan(40 * DEG);

      const headingTurned = await readCameraHeading(page);
      expect(
        Math.abs(headingTurned - headingBefore),
        '相机世界方位应随 lookYaw 同步转动（取景真值，非只有内部读数）',
      ).toBeGreaterThan(30 * DEG);

      // —— ② 抵近上限：进入最后 10° 减速带，且严格不越 +135°
      await expect
        .poll(() => readLookYaw(page), { timeout: YAW_TIMEOUT })
        .toBeGreaterThan(125 * DEG);
      await page.waitForTimeout(3_000);
      expect(await readLookYaw(page), '偏航上限 +135° 不得越界').toBeLessThanOrEqual(135 * DEG);
      await page.screenshot({ path: 'evidence/about-hall/QE/qe-hold-q-limit.png' });
    } finally {
      await page.keyboard.up('q').catch(() => {});
    }

    // —— ③ 松手回正（提案 §D 断言 2）
    await expect
      .poll(async () => Math.abs(await readLookYaw(page)), { timeout: YAW_TIMEOUT })
      .toBeLessThan(3 * DEG);
    await expect.poll(() => readLookYaw(page), { timeout: 60_000 }).toBe(0);
    await page.screenshot({ path: 'evidence/about-hall/QE/qe-release-recentered.png' });

    // —— ④ 圈外 E 反向 + 零进站
    await page.keyboard.down('e');
    try {
      await expect.poll(() => readLookYaw(page), { timeout: YAW_TIMEOUT }).toBeLessThan(-40 * DEG);
    } finally {
      await page.keyboard.up('e').catch(() => {});
    }
    const afterE = await readDump(page);
    expect(
      afterE.events.some((e) => e.type === 'world-poi'),
      '圈外按 E 不得触发进站（状态机优先级接管的圈外分支）',
    ).toBe(false);
    expect(navHits, '圈外环视腿零 navigate').toBe(0);
    await expect.poll(() => readLookYaw(page), { timeout: YAW_TIMEOUT }).toBe(0);

    // —— ⑤ FPV 封锁（需求口径「没按 V 的情况下」+ spec D2/D4 防晕防穿帮）
    await page.keyboard.press('v');
    await expect(host).toHaveAttribute('data-drive-view', 'fpv', { timeout: 60_000 });
    await page.keyboard.down('e');
    try {
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(1_000);
        expect(await readLookYaw(page), 'FPV 下 Q/E 必须硬门封锁（yaw 恒 0）').toBe(0);
      }
    } finally {
      await page.keyboard.up('e').catch(() => {});
    }
    await page.keyboard.press('v');
    await expect(host).toHaveAttribute('data-drive-view', 'third', { timeout: 60_000 });
    expect(await readLookYaw(page), '切回 third 不得带入 fpv 期残角').toBe(0);

    // —— ⑥ 圈内 E 互斥（提案 §D 断言 3）：摆位到 about-pavilion 泊位圆心后按 E，
    //     既有进站前奏（world-poi → shot-apply）照常触发，环视全程冻结在 0
    await teleport(page, targetBuilding.parkingBay.x, targetBuilding.parkingBay.z);
    await expect
      .poll(() => readDump(page).then((d) => d.funnel.firstPoiIn), { timeout: 180_000 })
      .not.toBeNull();

    const deadline = Date.now() + 240_000;
    let dump = await readDump(page);
    while (!dump.events.some((e) => e.type === 'world-poi') && Date.now() < deadline) {
      await page.keyboard.press('e');
      await page.waitForTimeout(2_000);
      dump = await readDump(page);
      expect(await readLookYaw(page), '圈内按 E 期间环视必须恒 0').toBe(0);
    }

    const poiEvent = dump.events.find((e) => e.type === 'world-poi');
    const applyEvent = dump.events.find((e) => e.type === 'shot-apply');
    expect(poiEvent?.data?.id, '圈内 E 应触发既有进站前奏').toBe(POI_SLUG);
    expect(applyEvent?.data?.id, '进站前奏应接管相机（shot-apply）').toBe(SHOT_ID);
    expect(applyEvent!.seq, 'shot-apply 应晚于 world-poi（seq 序）').toBeGreaterThan(poiEvent!.seq);

    // 前奏 tween/hold 全窗环视冻结（按住 E 也不例外：输入静默丢弃）
    await page.keyboard.down('e');
    try {
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(1_000);
        expect(await readLookYaw(page), '进站前奏期间环视必须冻结在 0').toBe(0);
      }
    } finally {
      await page.keyboard.up('e').catch(() => {});
    }

    expect(errors.filter((m) => !isKnownUaError(m)), '环视全链零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-QE-02 深链泊位腿（提案 §D 断言 3 的字面口径）：?poi=about-pavilion 出生
  // 即在泊位圆心，按 E → world-poi / shot-apply 照常 + navigate 被 route abort 拦下，
  // 全程 lookYaw ≡ 0。非 ritual 深链无 TransformSystem（gate='none'、filters
  // 停在 'wandering'），Q/E 动作本就不放行——本腿证的是「既有进站链路零回归」。
  // ---------------------------------------------------------------------------
  test('CITY-QE-02 深链泊位：?poi= 出生按 E → 进站前奏照常 + 环视恒 0（零回归）', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = trackErrors(page);

    let navHits = 0;
    await page.route(ANY_NAV_ROUTE, (route) => {
      navHits += 1;
      void route.abort('aborted');
    });

    await page.goto(`${PAGE_URL}?poi=${POI_SLUG}#debug`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    await expect
      .poll(() => readDump(page).then((d) => d.funnel.firstPoiIn), { timeout: 120_000 })
      .not.toBeNull();

    const deadline = Date.now() + 180_000;
    let dump = await readDump(page);
    while (!dump.events.some((e) => e.type === 'world-poi') && Date.now() < deadline) {
      await page.keyboard.press('e');
      await page.waitForTimeout(2_000);
      dump = await readDump(page);
      expect(await readLookYaw(page), '深链泊位按 E 期间环视必须恒 0').toBe(0);
    }

    expect(dump.events.find((e) => e.type === 'world-poi')?.data?.id).toBe(POI_SLUG);
    expect(dump.events.find((e) => e.type === 'shot-apply')?.data?.id).toBe(SHOT_ID);

    await expect.poll(() => navHits, { timeout: 240_000 }).toBeGreaterThanOrEqual(1);
    expect(await readLookYaw(page), '定帧后环视仍恒 0').toBe(0);

    expect(errors.filter((m) => !isKnownUaError(m)), '深链泊位腿零未捕获异常').toEqual([]);
  });
});
