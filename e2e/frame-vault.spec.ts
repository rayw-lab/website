// 帧库 · Frame Vault —— S0/S1 组件（src/components/city/halls/vault/{Vault.astro,Vault.ts}）
// 部署态验收，路由 /website/world/frame-vault/（src/data/world-halls.json 已登记 slug
// frame-vault，src/pages/world/[slug].astro 已接线渲染 <Vault />）。
//
// 🔴 写法照抄 e2e/nexus-hall.spec.ts：serial 描述块防跨 describe 抢主线程 3D 上下文、
// u() 拼 base 前缀、正控/负控成对、状态用真实 DOM/window 挂钩读回不手写数字。
//
// 🔴 project 归属核对（读 playwright.config.ts 实测，不采信派单文本）：世界剧本
// world-chromium 的 testMatch 只认字面含 `world-spike.spec.ts` 或 `cyber-city*.spec.ts`
// 的文件名，`frame-vault.spec.ts` 不命中；desktop-chromium 的 testIgnore 同样不命中
// 本文件名——`npx playwright test --list e2e/nexus-hall.spec.ts` 实测确认 nexus-hall
// 也是落在 desktop-chromium（而非派单文本所说的 world-chromium）。desktop-chromium 无
// dependencies，跑本文件不需要 --no-deps：
//   npx playwright test --project=desktop-chromium e2e/frame-vault.spec.ts
import { test, expect } from '@playwright/test';
import { u } from './helpers';

const HALL = '/world/frame-vault/';

/** window.__vault.state() 的形状（Vault.ts mount() 里挂的调试钩子，读回不手写数字） */
interface VaultState {
  phase: string;
  rx: number; ry: number; cut: number; tilt: number;
  cutOn: boolean; line: number; edge: number;
  n: number; stride: number; ep: string;
}

const readState = (page: import('@playwright/test').Page): Promise<VaultState> =>
  page.evaluate(() => (window as unknown as { __vault: { state(): VaultState } }).__vault.state());

test.describe.configure({ mode: 'serial' });

test.describe('S0/S1 帧库 · 正控', () => {
  test('loading→idle · state().n 与宿主 data-vault-slices 对齐 · HUD 时码格式', async ({ page }) => {
    await page.goto(u(HALL));
    const host = page.locator('[data-vault]');
    // 防：SwiftShader 软渲染下 WebGL2 初始化 + 图集解码可能偏慢；60s 内必须离开
    // loading 进 idle（不接受卡死在 loading，也不接受静默掉进 unsupported——那是负控该测的分支）
    await expect(host).toHaveAttribute('data-vault-state', 'idle', { timeout: 60_000 });

    const state = await readState(page);
    // 防：n 必须是「真的装了多张切片」而不是空壳/单帧占位
    expect(state.n).toBeGreaterThanOrEqual(2);
    // 防：window.__vault 暴露的 n 与宿主 dataset（模板/CSS 选择器会读的那份）必须是
    // 同一个数字——不能一处显示 1701、另一处显示别的值（verify-the-way-it-is-consumed）
    const slicesAttr = await host.getAttribute('data-vault-slices');
    expect(slicesAttr).toBe(String(state.n));

    // 防：HUD 时码格式漂移（例如少一位毫秒、分钟不补零）不会被「看着像时间」这种弱断言抓到
    const tc = await page.locator('[data-vault-tc]').innerText();
    expect(tc).toMatch(/^\d{2}:\d{2}\.\d{3}$/);
  });
});

test.describe('S1 交互 · 刀锋/斜切/归正', () => {
  test('ArrowRight ×5 逐片递增(blade) · Alt+ArrowRight ×3 斜切(tilted) · 0 归正', async ({ page }) => {
    // 慢机 SwiftShader 下装载 + 多轮 rAF 收敛可能偏久，给这条交互链更宽松的整体预算
    test.setTimeout(120_000);
    await page.goto(u(HALL));
    const host = page.locator('[data-vault]');
    await expect(host).toHaveAttribute('data-vault-state', 'idle', { timeout: 60_000 });

    await host.focus();

    // ── ArrowRight ×5：cut 严格递增，phase 落在 blade ──────────────────────
    // 防：逐次采样而不是只看首尾——damping（阻尼逼近）如果被写反或卡死，
    // 首尾对比可能因为「最终还是到了」而掩盖中途停滞/回退的 bug。
    let prevCut = (await readState(page)).cut;
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      await expect
        .poll(async () => (await readState(page)).cut, {
          timeout: 8_000,
          message: `第 ${i + 1} 次 ArrowRight 后 cut 应严格大于上一次 (${prevCut})`,
        })
        .toBeGreaterThan(prevCut);
      prevCut = (await readState(page)).cut;
    }
    expect((await readState(page)).phase).toBe('blade');

    // ── Alt+ArrowRight ×3：tilt>0，phase 落在 tilted，宿主打上 data-vault-tilted ──
    let prevTilt = (await readState(page)).tilt;
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Alt+ArrowRight');
      await expect
        .poll(async () => (await readState(page)).tilt, {
          timeout: 8_000,
          message: `第 ${i + 1} 次 Alt+ArrowRight 后 tilt 应严格大于上一次 (${prevTilt})`,
        })
        .toBeGreaterThan(prevTilt);
      prevTilt = (await readState(page)).tilt;
    }
    const afterTilt = await readState(page);
    // 防：斜切必须真的 > 0（不是维持在 0 却误判态）
    expect(afterTilt.tilt).toBeGreaterThan(0);
    expect(afterTilt.phase).toBe('tilted');
    // 防：CSS 联动挂钩 data-vault-tilted（.vault__btn 高亮靠它）必须与 JS 状态同步，
    // 不能只有 window.__vault 知道斜切了、DOM 上却看不出来
    await expect(host).toHaveAttribute('data-vault-tilted', '1');

    // ── 按 0：tilt 归正 ─────────────────────────────────────────────────
    await page.keyboard.press('0');
    await expect.poll(async () => (await readState(page)).tilt, { timeout: 8_000 }).toBe(0);
  });
});

test.describe('S1 URL 确定性', () => {
  test('?cut&tilt&rx&ry 读进初始视图，state() 与参数一一对应（容差 1e-6）', async ({ page }) => {
    const params = { cut: 0.25, tilt: 0.2, rx: 0.1, ry: -0.3 };
    await page.goto(u(`${HALL}?cut=${params.cut}&tilt=${params.tilt}&rx=${params.rx}&ry=${params.ry}`));
    const host = page.locator('[data-vault]');
    // 防：readUrl() 在 mount() 内先于 setPhase('idle') 执行，idle 出现即代表
    // URL 参数已经写进 target 且 view 已同步（Vault.ts mount：view={...target} 早于 idle）
    await expect(host).toHaveAttribute('data-vault-state', 'idle', { timeout: 60_000 });
    const state = await readState(page);
    // 防：只测「大致对」测不出 clamp 边界写错/单位换算错——逐字段紧公差比对
    expect(state.cut).toBeCloseTo(params.cut, 6);
    expect(state.tilt).toBeCloseTo(params.tilt, 6);
    expect(state.rx).toBeCloseTo(params.rx, 6);
    expect(state.ry).toBeCloseTo(params.ry, 6);
  });
});

test.describe('S1 门环', () => {
  test('点第一枚门环，cut 收敛到它的 data-t（容差 1e-3）', async ({ page }) => {
    // 默认 F 锁集 ep2 的 rings=[]；这里显式选有 LOCATABLE 人审退回的 ep3，
    // 才能验到门环的真实点击链路，而不是把该例跳过。
    await page.goto(u(`${HALL}?ep=ep3`));
    const host = page.locator('[data-vault]');
    // SwiftShader 下图集解码会慢；idle 且门环已重建才是可点击的终态。
    await page.waitForFunction(
      () => {
        const vault = document.querySelector('[data-vault]');
        return vault?.getAttribute('data-vault-state') === 'idle'
          && vault.querySelectorAll('[data-vault-ring]').length > 0;
      },
      { timeout: 60_000 },
    );
    await expect(host).toHaveAttribute('data-vault-ep', 'EP3');

    const rings = page.locator('[data-vault-ring]');
    const first = rings.first();
    const t = Number(await first.getAttribute('data-t'));
    expect(Number.isFinite(t)).toBe(true);
    await first.click();
    // 防：阻尼收敛需要若干帧才能落定，给足 2s；容差 1e-3 对应 toBeCloseTo(t, 3)
    await expect
      .poll(async () => (await readState(page)).cut, { timeout: 2_000 })
      .toBeCloseTo(t, 3);
  });
});

test.describe('降级 · 无 WebGL2', () => {
  test('getContext(webgl2) 返回 null → unsupported 态 + 可见文案 + 指向成片的链接', async ({ page }) => {
    // 负控：伪装浏览器不支持 WebGL2（Vault.ts mount()：VolumeEngine.create() 返回
    // null 时立刻 setPhase('unsupported') 并 return，不再 fetch manifest）
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      // @ts-ignore —— 测试期故意收窄签名，只拦 webgl2
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
        if (type === 'webgl2') return null;
        // @ts-ignore
        return orig.call(this, type, ...rest);
      };
    });
    await page.goto(u(HALL));
    const host = page.locator('[data-vault]');
    await expect(host).toHaveAttribute('data-vault-state', 'unsupported', { timeout: 60_000 });
    const fallback = page.locator('.vault__unsupported');
    // 防：Vault.astro 的 .vault__unsupported 默认 display:none，只有
    // [data-vault-state='unsupported'] 才 display:grid——属性对了不代表画面上真的看得见
    await expect(fallback).toBeVisible();
    await expect(fallback).toContainText('不支持体纹理');
    const href = await fallback.locator('a').getAttribute('href');
    // 防：manifest 里的 video.src 是构建期算好的地址（src/data/frame-vault/ep2.json
    // 的 video.src），必须真的落在 /website/video/frame-vault/ 下才是「直接看成片」
    expect(href).toMatch(/^\/website\/video\/frame-vault\//);
  });
});

test.describe('2×2 · 375 视口 + reduced-motion', () => {
  test('小屏 + 降动效到达仍是 idle 或 unsupported（SwiftShader 两态皆可），不得卡在 loading', async ({ page }) => {
    // 🔴 用 emulateMedia 而非 test.use({reducedMotion})：nexus-hall.spec.ts 实测后者
    // 在本仓 desktop-chromium project 下未生效，emulateMedia 是唯一确认生效的写法
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto(u(HALL));
    // 正控：先确认媒体查询真的生效，否则下面的判据在测一个没发生的条件
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

    await page.locator('[data-vault]').waitFor({ state: 'attached' });
    const handle = await page.waitForFunction(
      () => {
        const s = document.querySelector('[data-vault]')?.getAttribute('data-vault-state');
        return s === 'idle' || s === 'unsupported' ? s : null;
      },
      { timeout: 60_000 },
    );
    const state = await handle.jsonValue();
    expect(state).toMatch(/^(idle|unsupported)$/);

    // 防：横向不该因为窄屏 + 关动效而溢出（复用 nexus-hall 移动端同款判据）
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
