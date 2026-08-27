// `/`（Full Entry 科技城）驾驶反馈包 e2e —— CC-FXN-C2 交付随行断言。
//
// 被测面 = world/DriveFeedback.ts 四件反馈（功能 rubric F2「反馈闭环」确认层）：
//   ① 碰撞脉冲（锥桶/隔离墩统一 total，HUD 节拍沿检测同源同拍）；
//   ② respawn toast（reason 随 player 'respawn' 事件透传：key/fall）；
//   ③ boost 徽标 + 速度数字辉光（'boost' 动作双沿即按即亮）；
//   ④ 翻车自救可视化倒计时（Player.rescueCountdown 镜像，R 立即复位提示）。
//
// 纪律断言（与 cyber-city.spec.ts 同一套硬门）：
//   - ritual_idle 恒等：robot_idle / transforming 期反馈层整层 display:none（样式门）；
//   - 埋点随行互证：toast/倒计时呈现时 __worldSession.dump() 必有对应
//     respawn{reason}/upside-down 事件（OBS-C1 白名单零新增，本层只是呈现面）；
//   - reduced-motion：操作性信息（boost 徽标/toast）不因偏好剥夺（仅动画压 0）。
//
// 运行编排：world-chromium 串行 project（playwright.config testMatch 泛化
// cyber-city.*\.spec\.ts 同 PR 落账）；SwiftShader 慢动作校准口径同
// cyber-city.spec.ts 文件头⑤（挂载 ~75-110s、0.25s HUD 节拍 ≈ 数秒墙钟）。
//
// FB-04 翻车触发走 `#debug` 测试句柄（__worldSpikeGame 既有导出面）直接置车体
// 四脚朝天：物理驾驶翻车在软渲染下不可确定性复现，而 upsideDown 判定本身是
// 逐帧姿态点积（PhysicsVehicle.testUpsideDown 滞回），置位即真值、无旁路。
import { test, expect, type Page } from '@playwright/test';
import { u } from './helpers';

const PAGE_URL = u('/');
const SPIKE_URL = u('/world-spike/');

/** 挂载等待（cyber-city.spec.ts 文件头⑤ SwiftShader 校准口径） */
const MOUNT_TIMEOUT = 210_000;
/** 灰盒挂载（world-spike.spec.ts 同值：场景比 `/` 轻，150s 足够） */
const SPIKE_MOUNT_TIMEOUT = 150_000;

const SEL = {
  host: '[data-world-host]',
  transform: '[data-world-transform]',
  feedback: '[data-world-feedback]',
  collision: '[data-world-collision]',
  toast: '[data-world-toast]',
  boost: '[data-world-boost]',
  flip: '[data-world-flip]',
  flipCount: '[data-world-flip-count]',
} as const;

/** __worldSession.dump()（观测规格 §4.1 只读单方法；e2e 埋点互证入口） */
async function dumpSession(page: Page): Promise<{
  events: Array<{ type: string; data?: Record<string, string | number | boolean> }>;
  counters: Record<string, number>;
}> {
  return page.evaluate(() => {
    const session = (window as unknown as { __worldSession?: { dump(): unknown } })
      .__worldSession;
    if (!session) throw new Error('__worldSession 未挂载');
    return session.dump() as never;
  });
}

test.describe('科技城驾驶反馈包（CC-FXN-C2 · world-chromium 串行 project）', () => {
  // 挂载成本纪律同 cyber-city.spec.ts：串行 + 文件级超时给足余量
  test.describe.configure({ mode: 'serial', timeout: 420_000 });

  // ---------------------------------------------------------------------------
  // CITY-FB-01/02/03/04 单例全链（一次 ritual 挂载串四件断言，挂载成本纪律
  // 同 CITY-VEH-01..06 先例）：
  //   FB-01 ritual_idle 恒等门：反馈层挂载即存在，但 robot_idle / transforming
  //         全程 display:none（样式门机器兜底）；car_ready 放行后四件待机隐藏；
  //   FB-03 boost：Shift 即按即亮（徽标可见 + [data-ws-speed] 辉光通道挂
  //         data-boost），松开即灭（双沿事件驱动，非节拍轮询）；
  //   FB-02 respawn toast：R 复位 → 「已复位」toast 呈现 + dump 里 respawn
  //         事件带 reason='key'（埋点随行互证）；
  //   FB-04 翻车倒计时：#debug 句柄置车体四脚朝天 → upsideDown 沿 → 倒计时件
  //         呈现（数字 ∈ [0,3] 一位小数）+ dump 里 upside-down 事件；R 复位
  //         翻正 → 收窗即藏。
  // ---------------------------------------------------------------------------
  test('CITY-FB-01/02/03/04 反馈全链：恒等门 → boost 双沿 → respawn toast → 翻车倒计时', async ({ page }) => {
    // 全链 = 挂载 + 变形 + 三段交互 + 翻车窗（3 设计秒 ≈ 90-120s 墙钟）；
    // 比 CITY-VEH 全链多一段自救窗等待，放宽至 900s（首轮实测 600s 贴边超时）
    test.setTimeout(900_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // #debug：既有测试句柄面（__worldSpikeGame），FB-04 翻车置位用
    await page.goto(`${PAGE_URL}#debug`);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 120_000 });

    // —— FB-01a ritual_idle 恒等：反馈层已挂载（DOM 存在）但整层不可见（样式门）
    const feedback = page.locator(SEL.feedback);
    await expect(feedback).toBeAttached();
    await expect(feedback).toBeHidden();

    // 变形窗（transforming）同样恒等
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'transforming');
    await expect(feedback).toBeHidden();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 120_000 });

    // —— FB-01b car_ready 放行：样式门打开，但零事件时四件反馈全部待机隐藏
    await expect(feedback).toBeVisible();
    for (const sel of [SEL.collision, SEL.toast, SEL.boost, SEL.flip]) {
      await expect(page.locator(sel)).toBeHidden();
    }

    // —— FB-03 boost 双沿：即按即亮（事件驱动，无 0.25s 节拍延迟面）
    const boost = page.locator(SEL.boost);
    await page.keyboard.down('Shift');
    try {
      await expect(boost).toBeVisible({ timeout: 15_000 });
      await expect(boost).toHaveText('BOOST');
      // 速度数字辉光通道（View.ts 域外，速度感强化全走 DOM）
      await expect(page.locator('[data-ws-speed]')).toHaveAttribute('data-boost', '1');
      await page.screenshot({ path: 'test-results/feedback-boost.png' });
    } finally {
      await page.keyboard.up('Shift').catch(() => {});
    }
    await expect(boost).toBeHidden();
    await expect(page.locator('[data-ws-speed]')).not.toHaveAttribute('data-boost', '1');

    // —— FB-02 respawn toast：R 复位（key 来路）→ toast 呈现 + 埋点互证
    await page.keyboard.press('r');
    const toast = page.locator(SEL.toast);
    await expect(toast).toBeVisible({ timeout: 15_000 });
    await expect(toast).toContainText('已复位');
    await page.screenshot({ path: 'test-results/feedback-toast.png' });
    const dumpAfterRespawn = await dumpSession(page);
    expect(
      dumpAfterRespawn.events.some((e) => e.type === 'respawn' && e.data?.reason === 'key'),
      'toast 呈现必须与 respawn{reason:key} 埋点同证（呈现面零私有事件）',
    ).toBe(true);

    // —— FB-04 翻车倒计时：#debug 句柄把车体置为四脚朝天（文件头注：置位即真值）
    await page.evaluate(() => {
      const game = (window as unknown as {
        __worldSpikeGame?: {
          physicalVehicle: {
            chassis: {
              physical: {
                body: {
                  translation(): { x: number; y: number; z: number };
                  setTranslation(t: { x: number; y: number; z: number }, wake: boolean): void;
                  setRotation(q: { x: number; y: number; z: number; w: number }, wake: boolean): void;
                  setLinvel(v: { x: number; y: number; z: number }, wake: boolean): void;
                  setAngvel(v: { x: number; y: number; z: number }, wake: boolean): void;
                };
              };
            };
          } | null;
        };
      }).__worldSpikeGame;
      const body = game?.physicalVehicle?.chassis.physical.body;
      if (!body) throw new Error('#debug 句柄或物理车缺席');
      const t = body.translation();
      // 抬 1.6m 防翻转穿地，绕 X 轴 180°（四元数 (1,0,0,0)）= 车顶朝下
      body.setTranslation({ x: t.x, y: t.y + 1.6, z: t.z }, true);
      body.setRotation({ x: 1, y: 0, z: 0, w: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    });

    // 自救窗 = 3 设计秒 ≈ 90-120s 墙钟（flipJump 翻正后面板即收）——面板一可见
    // 立即完成全部窗内断言（首轮实测：断言排后会撞上收窗，innerText 已空）
    const flip = page.locator(SEL.flip);
    await expect(flip).toBeVisible({ timeout: 60_000 });
    await page.screenshot({ path: 'test-results/feedback-flip.png' });
    // 倒计时数字：RESCUE_DELAY=3 起一位小数递减（SwiftShader 慢动作下仍 ∈ [0,3]）
    await expect(page.locator(SEL.flipCount)).toHaveText(/^[0-3]\.\d$/, { timeout: 5_000 });
    await expect(flip).toContainText('R 立即回到路口', { timeout: 5_000 });

    // 埋点互证：倒计时呈现 ⇔ upside-down 事件已入 timeline（OBS-C1 既有行）
    const dumpAfterFlip = await dumpSession(page);
    expect(
      dumpAfterFlip.events.some((e) => e.type === 'upside-down'),
      '倒计时呈现必须与 upside-down 埋点同证',
    ).toBe(true);

    // R 复位翻正 → rightSideUp 收窗 → 倒计时即藏（提示文案「R 立即回到路口」闭环）
    await page.keyboard.press('r');
    await expect(flip).toBeHidden({ timeout: 60_000 });

    expect(errors, '反馈全链零未捕获异常').toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // CITY-FB-05 reduced-motion：操作性反馈不因偏好剥夺（DriveFeedback 纪律：
  // 动画/过渡压 0.01ms，但 boost 徽标 / toast 是操作信息而非动效，照常呈现）；
  // 恒等门在 reduced-motion 腿同样生效。走显式进入快路径（instant swap，
  // CITY-E2E-04 同口径——本用例兼作反馈层在降级腿的可用性证明）。
  // ---------------------------------------------------------------------------
  test('CITY-FB-05 reduced-motion：恒等门生效 + boost/toast 静态呈现不剥夺', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(PAGE_URL);
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-blocked', 'reduced-motion');
    await host.locator('[data-world-enter]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 30_000 });

    // 恒等门（robot_idle）在 reduced-motion 腿同样 display:none
    await expect(page.locator(SEL.feedback)).toBeHidden();

    // instant swap → car_ready（CITY-E2E-04 同口径）
    await page.locator(SEL.transform).click();
    await expect(host).toHaveAttribute('data-world-state', 'car_ready', { timeout: 15_000 });

    // boost 徽标照常呈现（操作性信息保留）
    const boost = page.locator(SEL.boost);
    await page.keyboard.down('Shift');
    try {
      await expect(boost).toBeVisible({ timeout: 15_000 });
    } finally {
      await page.keyboard.up('Shift').catch(() => {});
    }
    await expect(boost).toBeHidden();

    // toast 照常呈现
    await page.keyboard.press('r');
    const toast = page.locator(SEL.toast);
    await expect(toast).toBeVisible({ timeout: 15_000 });
    await expect(toast).toContainText('已复位');
  });

  // ---------------------------------------------------------------------------
  // CITY-FB-06 灰盒碰撞脉冲：`/world-spike/` W 直行撞确定性锚点桩（出生正前方
  // (0,-4.5)/(0,-9)，WS-E2E-04 同口径）→ 「碰撞 ×N」脉冲呈现，与 HUD
  // [data-ws-cones] 同一节拍沿同源（城市档隔离墩口径共用同一沿检测，物理
  // 驾驶撞墩在软渲染下不可确定性复现，真值路径由灰盒锥桶腿代表证明）。
  // ---------------------------------------------------------------------------
  test('CITY-FB-06 灰盒碰撞脉冲：W 直行撞锥桶 → 碰撞 ×N 脉冲与 HUD 计数同拍呈现', async ({ page }) => {
    test.setTimeout(600_000);

    // 灰盒入场：显式点击启动（world-spike.spec.ts enterWorld 同口径）
    await page.goto(SPIKE_URL);
    const host = page.locator('[data-ws-host]');
    await expect(host).toHaveAttribute('data-state', 'idle');
    await page.locator('[data-ws-start]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: SPIKE_MOUNT_TIMEOUT });

    // 灰盒无 ritual 状态机（无 data-world-state）→ 样式门恒放行，待机全隐藏
    await expect(page.locator(SEL.feedback)).toBeVisible();
    await expect(page.locator(SEL.collision)).toBeHidden();

    await page.keyboard.down('w');
    try {
      // 直线驾驶必撞锚点桩（SwiftShader 慢动作校准同 WS-E2E-04：30s→放宽 120s 余量）
      await expect(page.locator('[data-ws-cones]')).toHaveText(/[1-9]/, { timeout: 120_000 });
      // 同一沿同一拍：HUD 计数增大的那一拍脉冲即呈现（驻留 1.6 设计秒，慢动作
      // 下呈现窗更长；持续驾驶连撞会刷新驻留）
      const chip = page.locator(SEL.collision);
      await expect(chip).toBeVisible({ timeout: 60_000 });
      await expect(chip).toContainText('碰撞 ×');
      await page.screenshot({ path: 'test-results/feedback-collision.png' });
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }
  });
});
