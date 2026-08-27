// [CC-VIS-L8-W1-X3-R3] 招牌叙事 v2 —— e2e 验收合同（CITY-SIGN-01…03）。
//
// 被测实现：CC-VIS-X3 四件一批（design-confirm §4.2，main c0bb67a 已合流）：
//   ① 多层招牌体系（SignageAtlas 竖排/双语/图标合成 + 图集合并控 draw call）；
//   ② 产品线帧内自明（街层灯箱直写产品线名 + 符号图形，V7 扣分点销账）；
//   ③ 全息广告板 4 块（静帧零配额，AdBoards 合 1 draw call）；
//   ④ stagger 150ms 逐楼点亮（一次性瞬态零配额；reduced-motion / 非首幕路径
//      直出终态——SignageIgnition 接线闸门）。
// 本文件补该批的机器验收面（合流时仅有人工取证帧，e2e 零覆盖）：
//   CITY-SIGN-01  首幕 ritual 路径：stagger 武装 + 点亮序完成自摘（台账行为证）；
//   CITY-SIGN-02  非首幕路径（?city=1）：直出终态零瞬态 + 场景装配台账
//                 （三层招牌网格 + 广告板合并网格逐名清点，#debug 句柄遍历）；
//   CITY-SIGN-03  reduced-motion × ritual：stagger 不武装、直出终态
//                 （design-confirm §4.2 第四件「reduced-motion 直出终态」原文）。
//
// 断言口径（SwiftShader 纪律，cyber-city-observability.spec.ts 同款）：
//   只断存在性/顺序性/计数，禁止对墙钟 t 值设阈值——stagger 时基 = Ticker 设计秒
//   （1.2 设计秒全序在 ~1-5fps 软渲染下放大为 ~40-60s 墙钟，等待窗按此校准）；
//   台账行 = 实现侧唯一自证信号源（mountCity 装配台账 + SignageIgnition 完成行），
//   文案与 src/lab/world/city/{index,SignageIgnition}.ts 一字不差。
//
// 编排：文件名 cyber-city-*.spec.ts → world-chromium 串行 project（并发 3D 上下文
// 挤兑纪律，playwright.config.ts 文件头④）。
import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { u } from './helpers';

const PAGE_URL = u('/');
const SPIKE_URL = u('/world-spike/');

/** 挂载等待（cyber-city.spec.ts 文件头⑤ SwiftShader 校准）：全链实测 ~75-110s */
const MOUNT_TIMEOUT = 210_000;
/** reveal → stagger 全序（1.2 设计秒）+ robot_idle 落定的墙钟放大余量 */
const STAGGER_TIMEOUT = 120_000;

const SEL = {
  host: '[data-world-host]',
  spikeHost: '[data-ws-host]',
  spikeStart: '[data-ws-start]',
} as const;

/** hero 楼数单源（buildings JSON lodProfile；BuildingSigns 只给 hero 挂三层） */
const cityMap = JSON.parse(
  readFileSync(new URL('../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
) as { buildings: { id: string; lodProfile?: string }[] };
const HERO_COUNT = cityMap.buildings.filter((b) => b.lodProfile === 'hero').length;

/** stagger 通道数 = hero 楼逐栋 + AdBoards 整组尾拍一支（SignageIgnition 装配合同） */
const CHANNEL_COUNT = HERO_COUNT + 1;

/** 广告板块数（design-confirm §4.2 第三件「3-5 块」，AdBoards SPOTS 台账定值 4） */
const AD_BOARD_COUNT = 4;

/** mountCity 装配台账（src/lab/world/city/index.ts 一字不差的锚点片段） */
const LEDGER_SIGNS_RE = new RegExp(
  `\\[CC-VIS-X3\\] hero 招牌叙事 v2：${HERO_COUNT} 栋三层体系`,
);
const LEDGER_ADBOARDS_RE = new RegExp(`全息广告板 ${AD_BOARD_COUNT} 块（静帧零配额，1 draw call）`);
const LEDGER_STAGGER_ARMED = 'stagger 点亮=reveal 后 150ms 逐楼';
const LEDGER_STAGGER_STATIC = 'stagger 点亮=直出终态';
/** SignageIgnition 全序完成自摘台账（150ms 定值 = design-confirm §4.2 第四件） */
const IGNITION_DONE_RE = new RegExp(
  `\\[CC-VIS-X3\\] 招牌 stagger 点亮完成：${CHANNEL_COUNT} 通道 × 150ms 间隔`,
);

/** console 收集器（goto 前挂，跨挂载全程留痕） */
function collectConsole(page: Page): string[] {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(msg.text()));
  return logs;
}

/** 台账行等待（存在性轮询，禁墙钟阈值） */
async function waitForLog(logs: string[], re: RegExp, timeout: number): Promise<void> {
  await expect
    .poll(() => logs.some((line) => re.test(line)), {
      timeout,
      message: `期待台账行 ${re}`,
    })
    .toBe(true);
}

test.describe('招牌叙事 v2 验收（CC-VIS-X3；world-chromium 串行）', () => {
  // 3D 全链挂载 ~210s + stagger 墙钟放大窗，逐例放宽（observability spec 同款）
  test.describe.configure({ timeout: 360_000 });

  // ---------------------------------------------------------------------------
  // CITY-SIGN-01 首幕 ritual 路径：stagger 武装 + 点亮序完成后自摘
  // 条款：design-confirm §4.2 第四件（reveal 后 150ms 逐楼点亮，一次性瞬态零配额）；
  //       BR X3 ④（V5 首幕节拍）；CITY-03 循环动画配额（完成自摘 = 运行期零常驻，
  //       完成台账行即自摘同帧证据——src/lab/world/city/SignageIgnition.ts）。
  // 信号链：mountCity 台账「stagger 点亮=reveal 后 150ms 逐楼」（武装证明）→
  //         world-reveal（Reveal 光柱开演）→ 全序 1.2 设计秒 →
  //         「招牌 stagger 点亮完成：6 通道 × 150ms 间隔」（终态 + 自摘证明）。
  // ---------------------------------------------------------------------------
  test('CITY-SIGN-01 首幕 stagger：装配台账武装 + 全序点亮完成自摘（6 通道 × 150ms）', async ({ page }) => {
    const logs = collectConsole(page);
    await page.goto(PAGE_URL);

    // 自动挂载（§4.3 四条件桌面 headless 全过）→ 首幕就绪
    const host = page.locator(SEL.host);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 装配台账：三层招牌 + 广告板就位，stagger 已武装（非直出终态）
    await waitForLog(logs, LEDGER_SIGNS_RE, 10_000);
    await waitForLog(logs, LEDGER_ADBOARDS_RE, 10_000);
    expect(
      logs.some((line) => line.includes(LEDGER_STAGGER_ARMED)),
      '首幕（非 reduced-motion）路径 stagger 必须武装（revealStagger=true 台账）',
    ).toBe(true);

    // 光柱落定（reveal 已开演的 DOM 镜像）→ stagger 全序完成自摘台账。
    // 窗宽 180s（CITY-E2E-03 的 120s 精调放宽）：ready→robot_idle 为 1.15 设计秒
    // delay，R4 实测慢 VM 放大 ~91×（≈105s 墙钟）再叠 trace/video 开销即贴线——
    // 存在性断言不变，只校准等待上限（文件头「禁墙钟阈值」纪律不涉及超时上限）
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 180_000 });
    await waitForLog(logs, IGNITION_DONE_RE, STAGGER_TIMEOUT);
  });

  // ---------------------------------------------------------------------------
  // CITY-SIGN-02 非首幕路径（?city=1）：直出终态零瞬态 + 场景装配清点
  // 条款：SignageIgnition 接线闸门（「其余路径（?city=1 / ?poi= / reduced-motion）
  //       lit 恒 1 直出终态」）；BuildingSigns/AdBoards 网格命名合同
  //       （city-sign-holo-<id> / city-sign-panels-<id> / city-ad-boards）；
  //       O4 哨兵台账（每栋 2 draw call + 广告板合 1 = 招牌域 11）。
  // #debug 句柄 = 既有取证协议（__worldSpikeGame，CITY-OBS-05 白名单路径）。
  // ---------------------------------------------------------------------------
  test('CITY-SIGN-02 ?city=1 直出终态：零 stagger 瞬态 + 三层招牌/广告板网格逐名清点', async ({ page }) => {
    const logs = collectConsole(page);
    await page.goto(`${SPIKE_URL}?city=1#debug`);
    await page.locator(SEL.spikeStart).click();
    await expect(page.locator(SEL.spikeHost)).toHaveAttribute('data-state', 'ready', {
      timeout: MOUNT_TIMEOUT,
    });

    // 台账：直出终态（stagger 未武装）；广告板照常就位
    await waitForLog(logs, LEDGER_SIGNS_RE, 10_000);
    expect(
      logs.some((line) => line.includes(LEDGER_STAGGER_STATIC)),
      '非首幕路径必须直出终态（revealStagger 缺省台账）',
    ).toBe(true);
    expect(
      logs.some((line) => IGNITION_DONE_RE.test(line)),
      '直出终态路径不得出现 stagger 瞬态完成台账（零瞬态）',
    ).toBe(false);

    // 场景装配清点（#debug 句柄遍历；命名 = BuildingSigns/AdBoards 网格合同）：
    // 楼顶主匾 hero 每栋 1 + 立面合并几何（灯箱+竖幅）每栋 1 + 广告板合并网格 1
    const counts = await page.evaluate(() => {
      const game = (window as unknown as { __worldSpikeGame?: { scene: { traverse(cb: (o: { name: string }) => void): void } } }).__worldSpikeGame;
      if (!game) throw new Error('#debug 句柄缺席（__worldSpikeGame）——取证协议前提不成立');
      const acc = { holo: 0, panels: 0, adBoards: 0 };
      game.scene.traverse((obj) => {
        if (obj.name.startsWith('city-sign-holo-')) acc.holo += 1;
        if (obj.name.startsWith('city-sign-panels-')) acc.panels += 1;
        if (obj.name === 'city-ad-boards') acc.adBoards += 1;
      });
      return acc;
    });
    expect(counts.holo, `楼顶主匾全息板 = hero 楼数（${HERO_COUNT}）`).toBe(HERO_COUNT);
    expect(counts.panels, `立面合并网格（灯箱+竖幅图集合一 draw）= hero 楼数（${HERO_COUNT}）`).toBe(
      HERO_COUNT,
    );
    expect(counts.adBoards, '全息广告板合并网格恒 1（4 块合 1 draw call）').toBe(1);
  });

  // ---------------------------------------------------------------------------
  // CITY-SIGN-03 reduced-motion × ritual：stagger 不武装、招牌直出终态
  // 条款：design-confirm §4.2 第四件「reduced-motion 直出终态」；BR 红线 R6
  //       （优雅降级不留死路）。`/` 壳对 reduced-motion 整体拦截（VIS-01 已覆盖），
  //       引擎侧分支唯一可达路径 = /world-spike/?ritual=1 + emulateMedia
  //       （CITY-E2E-04 同款先例）。
  // ---------------------------------------------------------------------------
  test('CITY-SIGN-03 reduced-motion 首幕：stagger 不武装、直出终态零瞬态', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const logs = collectConsole(page);
    await page.goto(`${SPIKE_URL}?ritual=1`);
    await page.locator(SEL.spikeStart).click();
    const host = page.locator(SEL.spikeHost);
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: MOUNT_TIMEOUT });

    // 台账：ritual 路径 + reduced-motion → revealStagger=false 直出终态
    await waitForLog(logs, LEDGER_SIGNS_RE, 10_000);
    expect(
      logs.some((line) => line.includes(LEDGER_STAGGER_STATIC)),
      'reduced-motion 首幕必须直出终态（design-confirm §4.2 第四件）',
    ).toBe(true);

    // reduced-motion 零动画窗：robot_idle 速落（CITY-E2E-04 校准）后仍零瞬态台账
    await expect(host).toHaveAttribute('data-world-state', 'robot_idle', { timeout: 30_000 });
    expect(
      logs.some((line) => IGNITION_DONE_RE.test(line)),
      'reduced-motion 路径不得出现 stagger 瞬态（零点亮序）',
    ).toBe(false);
  });
});
