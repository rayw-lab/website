// /world-spike/ —— Phase A Spike 隐藏路由的完整交互回归（integration 批次）。
// 覆盖：e2e-test-plan §5.7（WS-E2E-01 ~ 10）。
//
// 与 lab facade 页的关键差异（断言口径随之不同）：
//   - 无自动挂载：规格要求「确认进入后才加载」——点击 [data-ws-start] 前零 world 字节；
//   - 无 URL 回写：壳页只读入参（?gl=），不做 history.replaceState；
//   - 测试钩子：window.__worldSpike（state/fps/info/backend，Spike 专用，dispose 时删除）。
//
// 环境口径（承接 batch 1 §3 环境事实）：
//   - headless Chromium 无 navigator.gpu → 默认腿即「WebGPU→WebGL 2 自动回退」链路；
//   - SwiftShader 软渲染本场景 ~1fps（决策记录 §3 实测），物理 dt clamp 1/20 →
//     世界时间以 ~5% 速率推进（慢动作而非隧穿）。驾驶用例的等待时长按此标定，
//     真实按键事件（CDP）+ 遥测轮询闭环，任何用例不因环境慢而降级为 skip。
import { test, expect, devices, type Page } from '@playwright/test';
import { appendFileSync, mkdirSync } from 'node:fs';
import { u, expectImageLoaded, shotIntegration } from './helpers';

const PAGE_URL = u('/world-spike/');
/** 3D 挂载（CarConcept 3.4MB + HDRI + SwiftShader 初始化）；world 场景比配置器重，放宽到 150s */
const MOUNT_TIMEOUT = 150_000;

// 每例完整挂载 + 长时驾驶积分：文件内单 worker 按序执行（world-chromium project 已保证
// 与其余 project 不并发），文件级超时放宽
test.describe.configure({ mode: 'default', timeout: 300_000 });

// 驾驶过程视频全程留档（integration 报告引用）
test.use({ video: 'on' });

/* ---------- 遥测与驾驶工具 ---------- */

interface WorldState {
  x: number;
  y: number;
  z: number;
  yaw: number;
  speedKmh: number;
  grounded: boolean;
  cones: number;
}

/** 读取 __worldSpike.state()（挂载后才可用） */
async function readState(page: Page): Promise<WorldState> {
  return page.evaluate(() => {
    const ws = (window as unknown as { __worldSpike?: { state(): unknown } }).__worldSpike;
    if (!ws) throw new Error('__worldSpike 未挂载');
    return ws.state() as WorldState;
  });
}

/** 轮询遥测直至谓词满足；超时返回最后一次状态并置 ok=false（由调用方断言给出诊断） */
async function pollState(
  page: Page,
  pred: (s: WorldState) => boolean,
  timeoutMs: number,
  intervalMs = 400,
): Promise<{ ok: boolean; state: WorldState }> {
  const deadline = Date.now() + timeoutMs;
  let state = await readState(page);
  while (!pred(state)) {
    if (Date.now() > deadline) return { ok: false, state };
    await page.waitForTimeout(intervalMs);
    state = await readState(page);
  }
  return { ok: true, state };
}

const wrapAngle = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * 已知 UA 级异常白名单（整合批次实测归因，报告 §BUG 列表登记）：
 * 站点启用声明式跨文档 View Transitions（global.css `@view-transition`，零 JS）。
 * SwiftShader ~1fps 下离开 3D 页时 UA 无法按时产出转场帧 → 转场被跳过，
 * Chromium 将 UA 内部 ViewTransition promise 的拒绝上抛为页面级
 * 「Transition was skipped」。纯声明式用法下站点侧不存在可附着的 catch 点，
 * 真机语义 = 自动退化为普通整页跳转（无功能影响）。仅此一条精确放行。
 */
const isKnownUaError = (msg: string): boolean => /Transition was skipped/.test(msg);

/** 进入试验场：显式点击启动 → ready（world 规格的唯一入场路径） */
async function enterWorld(page: Page, query = ''): Promise<void> {
  await page.goto(`${PAGE_URL}${query}`);
  const host = page.locator('[data-ws-host]');
  await expect(host).toHaveAttribute('data-state', 'idle');
  await page.locator('[data-ws-start]').click();
  await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
}

/** 驾驶/帧率遥测落盘（integration 报告的数据源） */
function logMetrics(label: string, data: Record<string, unknown>): void {
  mkdirSync('test-results', { recursive: true });
  appendFileSync(
    'test-results/world-spike-metrics.jsonl',
    `${JSON.stringify({ label, ...data })}\n`,
  );
}

test.describe('world Spike 灰盒试验场', () => {
  test('WS-E2E-01 壳页静态合同：noindex、标题、逃生链接、poster、点击前零 world 字节', async ({ page, request }) => {
    // SSR 合同（不受客户端时序影响）
    const res = await request.get(PAGE_URL);
    expect(res.status(), 'world-spike 路由必须已交付（integration 合流后不允许 404）').toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"\s*\/?>/);
    expect(html).toContain('data-ws-host');
    expect(html).toContain('data-state="idle"');
    expect(html).toContain('进入试验场');

    // 点击前零 world 字节：全程监听 3D 资产与 JS chunk 请求
    const assetRequests: string[] = [];
    const jsRequests: string[] = [];
    page.on('request', (r) => {
      if (/\/models\/|\/hdri\//.test(r.url())) assetRequests.push(r.url());
      if (r.url().endsWith('.js')) jsRequests.push(r.url());
    });

    await page.goto(PAGE_URL);
    await expect(page).toHaveTitle(/world Spike/);
    await expect(page.locator('h1')).toHaveText(/灰盒试验场/);

    // 逃生链接（降级链的静态壳级出口）：跳过 3D 返回首页，href 带 base
    await expect(page.locator('.ws-lede a')).toHaveAttribute('href', `${u('/')}`);

    // 覆盖层合同：poster 实际解码、启动按钮可见、HUD 淡出隐藏（opacity 0）
    await expectImageLoaded(page.locator('.ws-poster'));
    await expect(page.locator('[data-ws-start]')).toBeVisible();
    await expect(page.locator('.ws-hud')).toHaveCSS('opacity', '0');
    await expect(page.locator('[data-ws-canvas]')).toBeAttached();

    // noscript 文案合同（CDP 禁 JS 语义同 batch 1：以 textContent 断言）
    expect(await page.locator('.ws-cover noscript').textContent()).toContain(
      '本页驾驶验证需要启用 JavaScript',
    );

    // 静态壳纪律：加载完成 + 2.5s 空闲，不得拉任何 3D 资产或额外 chunk
    await page.waitForLoadState('networkidle');
    const idleJsCount = jsRequests.length;
    await page.locator('[data-ws-stage]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2_500);
    expect(assetRequests, '点击「进入试验场」前不得拉取任何 3D 资产').toEqual([]);
    expect(jsRequests.length, '滚动/空闲不得触发 world 引擎 chunk 请求').toBe(idleJsCount);
    await shotIntegration(page, 'world_shell_idle');
  });

  test('WS-E2E-02 进入试验场：显式启动 → ready，HUD/徽标/遥测揭示，资产仅在点击后拉取', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const assetRequests: string[] = [];
    page.on('request', (r) => {
      if (/\/models\/|\/hdri\//.test(r.url())) assetRequests.push(r.url());
    });

    await enterWorld(page);

    // 资产在点击后才拉取：CarConcept gltf + HDRI 均已命中
    expect(assetRequests.some((r) => r.includes('/models/car-concept/'))).toBe(true);
    expect(assetRequests.some((r) => r.includes('/hdri/'))).toBe(true);

    // 覆盖层淡出且不再拦截指针；HUD 与操作提示揭示
    const cover = page.locator('[data-ws-cover]');
    await expect(cover).toHaveCSS('opacity', '0');
    await expect(cover).toHaveCSS('pointer-events', 'none');
    await expect(page.locator('.ws-hud')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-ws-hint]')).toHaveCSS('opacity', '1');

    // 后端徽标：WebGPU（带 GPU 环境）或 WebGL 2（headless 回退链路）
    await expect(page.locator('[data-ws-backend]')).toHaveText(/^(WebGPU|WebGL 2)$/);

    // canvas 实绘尺寸
    const size = await page.locator('[data-ws-canvas]').evaluate((el) => {
      const c = el as HTMLCanvasElement;
      return { w: c.width, h: c.height };
    });
    expect(size.w).toBeGreaterThan(0);
    expect(size.h).toBeGreaterThan(0);

    // 遥测钩子合同：state/fps/info 全部可读，出生点与场景复杂度合理
    const telemetry = await page.evaluate(() => {
      const ws = (window as any).__worldSpike;
      return { backend: ws.backend, state: ws.state(), fps: ws.fps(), info: ws.info() };
    });
    expect(Math.abs(telemetry.state.x)).toBeLessThan(1);
    expect(Math.abs(telemetry.state.z - 55)).toBeLessThan(1);
    expect(telemetry.state.cones).toBe(0);
    expect(telemetry.info.drawCalls).toBeGreaterThan(10);
    expect(telemetry.info.triangles).toBeGreaterThan(10_000);
    logMetrics('WS-E2E-02 ready', telemetry);

    expect(errors, '挂载全程零未捕获异常').toEqual([]);
    await shotIntegration(page, 'world_ready_hud');
  });

  test('WS-E2E-03 WASD 可驾驶：W 加速、空格刹停、R 复位、Shift boost、A 左转、提示消隐', async ({ page }) => {
    test.setTimeout(600_000);
    await enterWorld(page);
    const spawn = await readState(page);

    try {
      // ① W 前进：速度爬升 + 持续位移（真实 CDP keydown，非合成事件）
      await page.keyboard.down('w');
      const accel = await pollState(page, (s) => s.speedKmh > 25, 90_000);
      expect(accel.ok, `W 持续按住后应超过 25km/h（实测 ${accel.state.speedKmh.toFixed(1)}km/h）`).toBe(true);
      const moved = await pollState(
        page,
        (s) => Math.hypot(s.x - spawn.x, s.z - spawn.z) > 5,
        60_000,
      );
      expect(moved.ok, '持续按 W 应产生 >5m 真实位移').toBe(true);

      // ② 空格刹车：刹停（decel 30m/s²）
      await page.keyboard.up('w');
      await page.keyboard.down(' ');
      const braked = await pollState(page, (s) => s.speedKmh < 5, 60_000);
      expect(braked.ok, `空格应能刹停（实测 ${braked.state.speedKmh.toFixed(1)}km/h）`).toBe(true);
      await page.keyboard.up(' ');

      // ③ R 复位：回出生点（下一用例的锥桶闭环会做完整复位断言，此处验证键位语义）
      await page.keyboard.press('r');
      const reset = await pollState(
        page,
        (s) => Math.abs(s.x) < 1.5 && Math.abs(s.z - 55) < 1.5 && s.speedKmh < 2,
        45_000,
      );
      expect(reset.ok, `R 应复位到出生点（实测 x=${reset.state.x.toFixed(1)} z=${reset.state.z.toFixed(1)}）`).toBe(true);

      // ④ Shift boost：软限速抬到 28m/s，速度应破 70km/h（常态软限速 65km/h 之上）
      await page.keyboard.down('w');
      await page.keyboard.down('Shift');
      const boosted = await pollState(page, (s) => s.speedKmh > 70, 120_000);
      expect(boosted.ok, `Shift boost 应破 70km/h（实测 ${boosted.state.speedKmh.toFixed(1)}km/h）`).toBe(true);
      await page.keyboard.up('Shift');

      // ⑤ A 左转：yaw 正向增长（自行车模型 +steer → +yawRate）
      const before = await readState(page);
      await page.keyboard.down('a');
      const turned = await pollState(
        page,
        (s) => wrapAngle(s.yaw - before.yaw) > 0.12,
        60_000,
      );
      expect(
        turned.ok,
        `A 应产生左转（Δyaw 实测 ${wrapAngle(turned.state.yaw - before.yaw).toFixed(3)}rad）`,
      ).toBe(true);
      await page.keyboard.up('a');

      // ⑥ 驾驶后教学提示消隐（HUD 周期 0.25 世界秒，软渲染下等待放宽）
      await expect(page.locator('[data-ws-hint]')).toHaveAttribute('data-dismissed', 'true', {
        timeout: 30_000,
      });

      // 帧率仪表在持续驾驶后有读数（报告数据源）
      const fps = await page.evaluate(() => (window as any).__worldSpike.fps());
      expect(fps.avg).toBeGreaterThan(0);
      logMetrics('WS-E2E-03 drive', { fps, top: boosted.state.speedKmh });
      await shotIntegration(page, 'world_drive_after_boost');
    } finally {
      for (const k of ['w', 'a', ' ', 'Shift']) await page.keyboard.up(k).catch(() => {});
    }
  });

  test('WS-E2E-04 锥桶碰撞 + R 复位闭环：受控驾驶撞桩 → 计数/HUD 联动 → 复位清零', async ({ page }) => {
    test.setTimeout(780_000);
    await enterWorld(page);

    // 循迹控制器（决策记录 §6 同款打法）：沿「内侧慢弯桩线」行驶——期望航向 =
    // 环形道切线（φ+π/2）+ 半径误差比例修正，目标半径 = 52.4m（scene.ts 阵位公式
    // 55-2.6，i 偶数桩正落在该线上，φ∈{0.25,0.51,0.76,1.02}——单趟扫过 4 桩）。
    // W 恒按 + A/D 开关式打舵（真实 CDP 按键）；cones>0 即成功；扫完桩区（φ>1.15）
    // 未命中则 R 复位重试，最多 3 轮——决不 skip。
    const CONE_LINE_R = 52.4;
    let steerKey: 'a' | 'd' | null = null;
    const setSteer = async (want: 'a' | 'd' | null) => {
      if (want === steerKey) return;
      if (steerKey) await page.keyboard.up(steerKey);
      if (want) await page.keyboard.down(want);
      steerKey = want;
    };

    let knocked = 0;
    try {
      for (let attempt = 1; attempt <= 3 && knocked === 0; attempt++) {
        await page.keyboard.down('w');
        const deadline = Date.now() + 150_000;
        let lastState: WorldState | null = null;
        while (Date.now() < deadline) {
          const s = await readState(page);
          lastState = s;
          if (s.cones > 0) {
            knocked = s.cones;
            break;
          }
          const phi = Math.atan2(s.x, s.z); // 环形道方位角（出生点 φ=0，前进方向 φ 增大）
          if (phi > 1.15 || phi < -0.15) break; // 扫过全部内线桩仍未命中：本轮失败
          const r = Math.hypot(s.x, s.z);
          const corr = Math.max(-0.5, Math.min(0.5, (r - CONE_LINE_R) * 0.08));
          const err = wrapAngle(phi + Math.PI / 2 + corr - s.yaw);
          await setSteer(err > 0.06 ? 'a' : err < -0.06 ? 'd' : null);
          await page.waitForTimeout(200);
        }
        await page.keyboard.up('w');
        await setSteer(null);
        logMetrics('WS-E2E-04 attempt', { attempt, knocked, lastState });
        if (knocked === 0) {
          await page.keyboard.press('r');
          await pollState(page, (s) => Math.abs(s.x) < 1.5 && s.cones === 0, 45_000);
        }
      }

      expect(knocked, '受控驾驶必须实际撞倒锥桶（不允许 skip）').toBeGreaterThan(0);

      // HUD 锥桶计数联动
      await expect(page.locator('[data-ws-cones]')).toHaveText(/[1-9]/, { timeout: 30_000 });
      logMetrics('WS-E2E-04 cones', { knocked });
      await shotIntegration(page, 'world_cone_knocked');

      // R 复位闭环：位置回出生点、速度清零、锥桶阵列恢复、HUD 归零
      await page.keyboard.press('r');
      const reset = await pollState(
        page,
        (s) => Math.abs(s.x) < 1.5 && Math.abs(s.z - 55) < 1.5 && s.speedKmh < 2 && s.cones === 0,
        45_000,
      );
      expect(
        reset.ok,
        `R 复位应恢复出生点与锥桶阵列（实测 x=${reset.state.x.toFixed(1)} z=${reset.state.z.toFixed(1)} cones=${reset.state.cones}）`,
      ).toBe(true);
      await expect(page.locator('[data-ws-cones]')).toHaveText('0', { timeout: 30_000 });
      await shotIntegration(page, 'world_after_reset');
    } finally {
      for (const k of ['w', 'a', 'd']) await page.keyboard.up(k).catch(() => {});
    }
  });

  test('WS-E2E-05 深链：?gl=1 强制 WebGL 2；白名单外参数忽略且 URL 不被改写', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // gl=1 之外混入白名单外参数（壳页只透传 gl，其余必须被忽略且无异常）
    await enterWorld(page, '?gl=1&paint=hotpink&bogus=1');

    await expect(page.locator('[data-ws-backend]')).toHaveText('WebGL 2');
    expect(await page.evaluate(() => (window as any).__worldSpike.backend)).toBe('webgl2');

    // world 壳页无 URL 回写契约：地址栏保持原样（与 lab 模块 replaceState 行为区分）
    await expect(page).toHaveURL(/gl=1&paint=hotpink&bogus=1/);
    expect(errors, '非法参数不应产生未捕获异常').toEqual([]);
    await shotIntegration(page, 'world_gl1_backend');
  });

  test('WS-E2E-11 ?impl=engine 引擎层灰盒腿：Rapier 引擎挂载 ready、车辆 HUD 读数隐藏、零异常', async ({ page }) => {
    // integration 合流后的第二入口（folio 架构 Game loop + Rapier 物理，无车）：
    // 只做烟测级断言——挂载可达、壳文案切换、车辆读数整组隐藏、零未捕获异常。
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(`${PAGE_URL}?impl=engine`);
    const host = page.locator('[data-ws-host]');
    await expect(host).toHaveAttribute('data-impl', 'engine');
    await expect(page.locator('[data-ws-cover-note]')).toContainText('引擎层灰盒');

    await page.locator('[data-ws-start]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 车辆读数（速度/FPS/锥桶）无源 → 整组隐藏；后端徽标仍上报
    await expect(page.locator('.ws-hud-cell').first()).toBeHidden();
    await expect(page.locator('[data-ws-backend]')).toHaveText(/^(WebGPU|WebGL 2)$/);
    expect(errors, '引擎层灰盒挂载零未捕获异常').toEqual([]);
    await shotIntegration(page, 'world_engine_impl_ready');
  });

  test('WS-E2E-06 reduced-motion：静态壳保持零加载，显式「进入」逃生门照常工作', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const assetRequests: string[] = [];
    page.on('request', (r) => {
      if (/\/models\/|\/hdri\//.test(r.url())) assetRequests.push(r.url());
    });

    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');

    // world 本就是显式启动制（比 facade 自动挂载更严）：reduced-motion 下同样零 3D 字节
    const host = page.locator('[data-ws-host]');
    await expect(host).toHaveAttribute('data-state', 'idle');
    await page.locator('[data-ws-stage]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2_500);
    expect(assetRequests, 'reduced-motion 下未点击不得拉取 3D 资产').toEqual([]);

    // §12.4 显式逃生门语义对齐：reduced-motion 不得阻断用户显式进入
    await page.locator('[data-ws-start]').click();
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    expect(assetRequests.length, '显式进入后才允许拉取 3D 资产').toBeGreaterThan(0);
  });

  test('WS-E2E-07 dispose 再挂载：离页释放零异常，返回后可再次进入并驾驶', async ({ page }) => {
    test.setTimeout(600_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await enterWorld(page);
    await page.keyboard.down('w');
    await pollState(page, (s) => s.speedKmh > 5, 60_000);
    await page.keyboard.up('w');

    // 站内跳转 → pagehide(!persisted) → instance.dispose()（GPU 资源/监听/遥测钩子全释放）
    // SwiftShader 满载下 locator.click 收尾等待可能长挂（batch 1 §3 环境事实 3）→ dispatchEvent
    const homeLink = page.locator('.ws-lede a');
    await expect(homeLink).toBeVisible();
    await homeLink.dispatchEvent('click');
    await page.waitForURL(new RegExp(`${u('/')}$`), { timeout: 30_000 });
    expect(errors.filter((m) => !isKnownUaError(m)), 'dispose 路径不得抛未捕获异常').toEqual([]);

    // 返回 → 再挂载（bfcache 命中则场景仍在；未命中则回 idle 壳，重新显式进入）
    await page.goBack({ waitUntil: 'domcontentloaded' });
    const host = page.locator('[data-ws-host]');
    const state = await host.getAttribute('data-state');
    if (state !== 'ready') {
      await expect(host).toHaveAttribute('data-state', 'idle');
      await page.locator('[data-ws-start]').click();
      await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });
    }

    // 再挂载后必须仍可驾驶（dispose 的 canvas 置换克隆 → 新 GL 上下文可用）
    try {
      await page.keyboard.down('w');
      const drive = await pollState(page, (s) => s.speedKmh > 5, 60_000);
      expect(drive.ok, `再挂载后应可驾驶（实测 ${drive.state.speedKmh.toFixed(1)}km/h）`).toBe(true);
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }
    expect(
      errors.filter((m) => !isKnownUaError(m)),
      '完整 dispose→再挂载链路零未捕获异常（UA 级 View Transition 跳过除外，见白名单注释）',
    ).toEqual([]);
    await shotIntegration(page, 'world_remount_ready');
  });

  test('WS-E2E-08 快速切页：加载中弃页 + 全站五路由快切，零未捕获异常，终局仍可进入', async ({ page }) => {
    test.setTimeout(600_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // ① 资产加载中途弃页（点击进入 → 1.5s 后立刻离开）
    await page.goto(PAGE_URL);
    await page.locator('[data-ws-start]').click();
    await page.waitForTimeout(1_500);
    await page.goto(u('/'), { waitUntil: 'commit' });

    // ② 全站快速切页（commit 级，不等加载完成——模拟用户狂点导航）
    for (const path of ['/lab/', '/lab/tts-cockpit/', '/lab/car-configurator/', '/', '/lab/']) {
      await page.goto(u(path), { waitUntil: 'commit' });
    }

    // ③ 终局：world-spike 仍能完整进入并驾驶（切页风暴不留脏状态）
    await enterWorld(page);
    try {
      await page.keyboard.down('w');
      const drive = await pollState(page, (s) => s.speedKmh > 5, 60_000);
      expect(drive.ok, '快速切页后再进入仍可驾驶').toBe(true);
    } finally {
      await page.keyboard.up('w').catch(() => {});
    }
    expect(
      errors.filter((m) => !isKnownUaError(m)),
      '快速切页全程零未捕获异常（UA 级 View Transition 跳过除外，见白名单注释）',
    ).toEqual([]);
  });
});

test.describe('world Spike（移动端 375px 触屏）', () => {
  // 与 mobile-375 project 同参（Pixel 5 描述符的字段展开——describe 级 use 不允许
  // 携带 defaultBrowserType，故不直接 spread devices）
  test.use({
    userAgent: devices['Pixel 5'].userAgent,
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('WS-E2E-09 触屏摇杆驾驶：动态原点摇杆、真触摸驱动、复位按钮、无水平溢出', async ({ page }) => {
    test.setTimeout(600_000);
    await page.goto(PAGE_URL);

    // 375px 无页面级水平溢出
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, '375px 下不得出现页面级水平滚动').toBeLessThanOrEqual(0);

    // 显式进入（触屏语境下 world 同样不自动加载）
    await page.locator('[data-ws-start]').click();
    await expect(page.locator('[data-ws-host]')).toHaveAttribute('data-state', 'ready', {
      timeout: MOUNT_TIMEOUT,
    });

    // CDP 真触摸（Input.dispatchTouchEvent，pointerType=touch）：按下生成动态原点摇杆，
    // 上推持杆 → y 轴油门（inputs.ts 摇杆契约）
    const box = (await page.locator('[data-ws-stage]').boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height * 0.65;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: cx, y: cy, id: 1 }],
    });
    for (const dy of [30, 60, 90]) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: cx, y: cy - dy, id: 1 }],
      });
      await page.waitForTimeout(120);
    }

    // 摇杆视觉锚就位（动态原点基座显示）
    await expect(page.locator('.ws-nipple-base')).toBeVisible();

    // 持杆驱动：速度爬升（真触摸 → 意图 → 物理 → 遥测全链路）
    const driven = await pollState(page, (s) => s.speedKmh > 10, 90_000);
    expect(driven.ok, `摇杆持杆应驱动车辆（实测 ${driven.state.speedKmh.toFixed(1)}km/h）`).toBe(true);
    await shotIntegration(page, 'world_mobile_joystick');
    logMetrics('WS-E2E-09 joystick', { speedKmh: driven.state.speedKmh });

    // 松杆：摇杆基座隐藏、油门归零（怠速滑行）
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('.ws-nipple-base')).toBeHidden();

    // 触屏复位按钮（HUD「复位 (R)」——键盘 R 的触屏等价物）
    await page.locator('[data-ws-respawn]').dispatchEvent('click');
    const reset = await pollState(
      page,
      (s) => Math.abs(s.x) < 1.5 && Math.abs(s.z - 55) < 1.5 && s.speedKmh < 2,
      45_000,
    );
    expect(reset.ok, '复位按钮应与键盘 R 同语义').toBe(true);
  });
});

test.describe('world Spike（无 JS）', () => {
  test.use({ javaScriptEnabled: false });

  test('WS-E2E-10 禁用 JS：noscript 提示就位，操作说明与署名静态可读，壳保持 idle', async ({ page }) => {
    await page.goto(PAGE_URL);

    const noscript = page.locator('.ws-cover noscript');
    await expect(noscript).toHaveCount(1);
    expect(await noscript.textContent()).toContain('本页驾驶验证需要启用 JavaScript');

    // 静态说明区不依赖脚本：操作口径 + CC 署名
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { name: '操作与验证口径' })).toBeVisible();
    await expect(page.locator('.ws-credit')).toContainText('Khronos CarConcept');
    await expectImageLoaded(page.locator('.ws-poster'));
    await expect(page.locator('[data-ws-host]')).toHaveAttribute('data-state', 'idle');
  });
});
