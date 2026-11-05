// 施工计划任务 9：桌面 CE-E2E-02…14、08b；无手机、无暗色用例。
// 所有界面入口以 data-ce 定位；金额期望读取 Python 生成的 golden.json。
import { test as base, expect, chromium, type Page, type Locator } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import type { Params, Selection, Result } from '../src/lab/modules/cost-estimator/core/types';

const params: Params = JSON.parse(readFileSync('src/data/cost-estimator/params.json', 'utf8'));
const golden: { name: string; selection: Selection; result: Result }[] = JSON.parse(
  readFileSync('src/data/cost-estimator/golden.json', 'utf8'),
);
const gold = (name: string) => {
  const scenario = golden.find((g) => g.name === name);
  if (!scenario) throw new Error(`缺少金标 ${name}`);
  return scenario;
};
const PATH = '/website/lab/cost-estimator/';
const LOCAL_CHROME = '/Users/wanglei/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const executablePath = process.env.CE_CHROMIUM_EXECUTABLE_PATH
  ?? (!existsSync(chromium.executablePath()) && existsSync(LOCAL_CHROME) ? LOCAL_CHROME : undefined);
const RECALC = '/Users/wanglei/workspace/raw/03-Output/规划/2026-11-04-报价计算器/pipeline/check_xlsx_recalc.py';

base.use({ headless: true, launchOptions: { executablePath } });

// 每个用例的整个生命周期（包括分享新页面）均收集 console.error 与未捕获异常。
const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [async ({ context }, use, testInfo) => {
    const errors: string[] = [];
    const watch = (page: Page) => {
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`${page.url()} console.error: ${msg.text()}`); });
      page.on('pageerror', (err) => errors.push(`${page.url()} pageerror: ${err.message}`));
    };
    context.pages().forEach(watch);
    context.on('page', watch);
    await use();
    if (errors.length) await testInfo.attach('console-errors', { body: errors.join('\n'), contentType: 'text/plain' });
    expect(errors, 'CE-E2E-14：全程不得出现 console.error / pageerror').toEqual([]);
  }, { auto: true }],
});

const ce = (page: Page, name: string) => page.locator(`[data-ce="${name}"]`);
const card = (page: Page, id: string) => page.locator(`[data-ce="card"][data-id="${id}"]`);
const region = (page: Page, id: string) => page.locator(`[data-ce="region"][data-id="${id}"]`);
const preset = (page: Page, index: number) => page.locator(`[data-ce="preset"][data-j="${index}"]`);
const step = (page: Page, key: string) => page.locator(`[data-ce="wf-col"][data-k="${key}"]`);
const pkgIds = ['c3-euanz', 'c3-sea', 'c15-eu', 'c15-ru'] as const;
const allowed = new Set(['承接', '部分承接', 'AIBOX 承载']);
const steps = ['research', 'product', 'delivery', 'langFirst', 'voiceLang', 'direct'] as const;

// 独立拼接验收输入，不用被测 encode() 生成其自身的期望。
function query(s: Selection): string {
  return new URLSearchParams({ p: s.pkg, t: s.tier, c: s.car, r: s.regions.join(','),
    x: s.offLangs.join(','), a: s.agents.join(','),
    o: Object.entries(s.overrides).map(([id, v]) => `${id}:${v === 'first' ? 'f' : 'e'}`).join(','),
    v: s.voice === 'online' ? 'on' : 'off', ar: String(s.activeRate), dc: String(s.dailyCalls),
    pm: s.perMarket ? '1' : '0', ss: s.systemSwitch ? '1' : '0', ver: params.version }).toString();
}
async function open(page: Page, selection?: Selection) {
  const response = await page.goto(PATH + (selection ? `?${query(selection)}` : ''));
  expect(response?.status(), '粗估页应返回 200').toBe(200);
  // 仅等待自动挂载；没有调用 mount、点击 facade 或注入业务状态。
  await expect(ce(page, 'root')).toBeAttached();
  await ce(page, 'car').scrollIntoViewIfNeeded();
  await expect(ce(page, 'car')).toBeVisible();
}
async function setCar(page: Page, value: string) {
  await ce(page, 'car').fill(value);
  await ce(page, 'car').press('Tab');
}
async function choosePackage(page: Page, pkg: Selection['pkg']) {
  await ce(page, 'pkg').locator('button').nth(pkgIds.indexOf(pkg)).click();
}
async function ready(page: Page, pkg: Selection['pkg'] = 'c3-euanz', carName = 'T13C', regionId = 'eu') {
  await open(page);
  await choosePackage(page, pkg);
  await setCar(page, carName);
  await region(page, regionId).click();
}
async function checkedIds(page: Page) {
  return ce(page, 'card').evaluateAll((els) => els.filter((el) => el.getAttribute('aria-checked') === 'true').map((el) => (el as HTMLElement).dataset.id!).sort());
}
async function expectChecked(page: Page, ids: string[]) {
  await expect.poll(() => checkedIds(page), { message: '货架实际勾选集合应等于期望' }).toEqual([...ids].sort());
}
async function expectResult(page: Page, r: Result) {
  const known = r.nre.known.toFixed(2);
  await expect(ce(page, 'total'), `NRE 已知部分应为 ${known} 万`).toHaveAttribute('data-value', known);
  await expect(ce(page, 'total')).toHaveAttribute('aria-label', `${known} 万元`);
  if (r.nre.total === null) {
    await expect(ce(page, 'pending')).toBeVisible();
    await expect(ce(page, 'pending')).toContainText('+ 待补');
  } else await expect(ce(page, 'pending')).toBeHidden();
  const pending = r.lic.pendingRegions.length > 0 || r.lic.pendingAgents.length > 0;
  await expect(ce(page, 'lic-v')).toHaveText(`${r.lic.known.toFixed(1)}${pending ? ' + 待补' : ''}`);
}
async function snapshot(page: Page) {
  return ce(page, 'root').evaluate((root) => {
    const els = (name: string) => [...root.querySelectorAll<HTMLElement>(`[data-ce="${name}"]`)];
    const one = (name: string) => els(name)[0];
    return {
      segments: ['pkg', 'tier', 'lic-voice'].map((name) => [...one(name).querySelectorAll('button')].map((b) => b.getAttribute('aria-pressed'))),
      car: (one('car') as HTMLInputElement).value,
      regions: els('region').map((el) => [el.dataset.id, el.getAttribute('aria-pressed')]),
      langs: els('lang').map((el) => [el.dataset.id, el.getAttribute('aria-pressed'), el.textContent]),
      cards: els('card').map((el) => [el.dataset.id, el.dataset.kind, el.getAttribute('aria-checked')]),
      switches: ['per-market', 'sys-switch'].map((k) => (one(k) as HTMLInputElement).checked),
      licInputs: ['lic-active', 'lic-calls'].map((k) => (one(k) as HTMLInputElement).value),
      nre: one('total').dataset.value, pending: one('pending').textContent,
      lic: one('lic-v').textContent,
    };
  });
}
async function closeDrawer(page: Page) {
  // 内容校验统一用设计支持的 Esc；鼠标关闭按钮在 CE-E2E-09 单独检查。
  await page.keyboard.press('Escape');
  await expect(ce(page, 'drawer')).toHaveAttribute('aria-hidden', 'true');
}
async function setSlider(locator: Locator, value: string) {
  await locator.fill(value);
  await locator.dispatchEvent('input');
  await locator.dispatchEvent('change');
}

test('CE-E2E-02 首次引导 → 三步配置 → G-EU-MAX 已知金额及待补', async ({ page }) => {
  await open(page);
  await expect(ce(page, 'guide')).toBeVisible();
  await expectChecked(page, []);
  await expect(ce(page, 'total')).toHaveAttribute('data-value', '');
  await expect(ce(page, 'download')).toBeDisabled();
  await choosePackage(page, 'c3-euanz');
  await expect(ce(page, 'total')).toHaveAttribute('data-value', '');
  await setCar(page, 'T13C');
  await expect(ce(page, 'total')).toHaveAttribute('data-value', '');
  await region(page, 'eu').click();
  await expect(ce(page, 'guide')).toBeHidden();
  await expectResult(page, gold('G-EMPTY').result);
  await preset(page, 0).click();
  await expectResult(page, gold('G-EU-MAX').result);
});

test('CE-E2E-03 刷新恢复全部选择及 LIC 假设', async ({ page }) => {
  await ready(page);
  await preset(page, 0).click();
  await region(page, 'anz').click();
  await ce(page, 'lang').filter({ hasText: '德语' }).click();
  await card(page, 'edge-core').locator('[data-ce="card-tag"]').click();
  await ce(page, 'lic-voice').locator('button').nth(1).click();
  await setSlider(ce(page, 'lic-active'), '60');
  await setSlider(ce(page, 'lic-calls'), '22');
  await ce(page, 'per-market').check();
  await ce(page, 'sys-switch').check();
  const before = await snapshot(page);
  await page.reload();
  await expect(ce(page, 'root')).toBeAttached();
  await expect.poll(() => snapshot(page)).toEqual(before);
});

test('CE-E2E-04 localStorage 访问抛错仍可配置、计算及撤销', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', {
    configurable: true, get() { throw new DOMException('Storage disabled for CE-E2E-04', 'SecurityError'); },
  }));
  await ready(page);
  await preset(page, 0).click();
  await expectResult(page, gold('G-EU-MAX').result);
  await preset(page, 3).click();
  await expectResult(page, gold('G-EMPTY').result);
  await ce(page, 'undo').click();
  await expectResult(page, gold('G-EU-MAX').result);
});

test('CE-E2E-05 勾取消、四个预设、逐步撤销到初始及 ⌘Z', async ({ page }) => {
  await ready(page);
  const initial = await snapshot(page);
  await card(page, 'edge-core').press('Space');
  await expectChecked(page, ['edge-core']);
  await card(page, 'edge-core').press('Space');
  await expectChecked(page, []);
  const scenario = gold('G-EU-MAX');
  const eligible = params.packages[scenario.selection.pkg].agents.filter((a) => allowed.has(a.coverage.MAX));
  for (const [index, expected] of [
    [0, eligible.filter((a) => scenario.result.rows.find((r) => r.id === a.id)?.kind !== 'delivered').map((a) => a.id)],
    [1, eligible.filter((a) => scenario.result.rows.find((r) => r.id === a.id)?.kind === 'first').map((a) => a.id)],
    [2, eligible.filter((a) => a.caps.length > 0 && scenario.result.rows.find((r) => r.id === a.id)?.kind !== 'delivered').map((a) => a.id)],
    [3, []],
  ] as [number, string[]][]) {
    await preset(page, index).click();
    await expectChecked(page, expected);
  }
  // 两次单卡 + 四次预设共六步，撤销后应回到三步配置完、尚未勾选的状态。
  for (let i = 0; i < 6; i++) await ce(page, 'undo').click();
  expect(await snapshot(page)).toEqual(initial);
  await card(page, 'edge-core').press('Space');
  await expectChecked(page, ['edge-core']);
  await ce(page, 'motion').locator('button').first().focus(); // 只移焦点，不额外触发预设。
  await page.keyboard.press('Meta+z');
  await expectChecked(page, []);
  await card(page, 'edge-core').press('Space');
  await expectChecked(page, ['edge-core']);
});

test('CE-E2E-06 降档移出、回档恢复、手动取消保留；换车型清除手改', async ({ page }) => {
  await ready(page);
  await card(page, 'edge-core').press('Space');
  await card(page, 'perception').press('Space');
  await ce(page, 'tier').locator('button').nth(2).click();
  await expectChecked(page, []);
  await expect(card(page, 'edge-core')).toHaveAttribute('data-cov', '不承接');
  await ce(page, 'tier').locator('button').nth(0).click();
  await expectChecked(page, ['edge-core', 'perception']);
  await card(page, 'edge-core').press('Space');
  await ce(page, 'tier').locator('button').nth(2).click();
  await card(page, 'voice-control').press('Space'); // 低档修改不能抹掉隐藏卡记忆。
  await ce(page, 'tier').locator('button').nth(0).click();
  await expectChecked(page, ['perception', 'voice-control']);
  await card(page, 'perception').locator('[data-ce="card-tag"]').click();
  await expect(card(page, 'perception')).toHaveAttribute('data-kind', 'ext');
  await setCar(page, 'X99');
  await expect(card(page, 'perception')).toHaveAttribute('data-kind', 'first');
  await expect(ce(page, 'hud-msg')).toContainText('手改已清除');
});

test('CE-E2E-07 多区域语种去重、最后语种保护、澳新 LIC 待补', async ({ page }) => {
  await ready(page, 'c3-euanz', 'NEW');
  await preset(page, 0).click();
  await region(page, 'anz').click();
  await expectResult(page, gold('G-EU+ANZ').result);
  const union = [...new Set([...params.regions.eu.langs, ...params.regions.anz.langs])].sort();
  expect(await ce(page, 'lang').evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.id!).sort())).toEqual(union);
  await expect(page.locator('[data-ce="lang"][data-id="en"]')).toHaveCount(1);
  await expect(ce(page, 'lic-v')).toContainText('+ 待补');
  await expect(ce(page, 'lic-parts')).toContainText('澳新');
  for (const id of union.filter((id) => id !== 'en')) await page.locator(`[data-ce="lang"][data-id="${id}"]`).click();
  const last = page.locator('[data-ce="lang"][data-id="en"]');
  await last.click();
  await expect(last).toHaveAttribute('aria-pressed', 'true');
  await expect(ce(page, 'toast')).toContainText('至少保留一个语种');
  await region(page, 'anz').click();
  await expect(last).toHaveAttribute('aria-pressed', 'true');
  await region(page, 'anz').click();
  await expect(last).toHaveCount(1);
});

test('CE-E2E-08 T13C 欧盟一期已交付不计费、二期首发、新车型横展', async ({ page }) => {
  await ready(page, 'c15-eu');
  await preset(page, 0).click();
  await expectResult(page, gold('G-T13C-SELF').result);
  const phase1 = params.packages['c15-eu'].agents.filter((a) => a.layer === '一期');
  const phase2 = params.packages['c15-eu'].agents.filter((a) => a.layer === '二期');
  expect(phase1.length).toBeGreaterThan(0); expect(phase2.length).toBeGreaterThan(0);
  for (const a of phase1) {
    await expect(card(page, a.id)).toHaveAttribute('data-kind', 'delivered');
    await expect(card(page, a.id)).toContainText('已交付');
    await expect(card(page, a.id)).toHaveAttribute('aria-checked', 'false');
    await card(page, a.id).locator('[data-ce="card-pm"]').click();
    await expect(ce(page, 'd-body')).toContainText('0.00 万');
    await expect(ce(page, 'd-body')).toContainText('不重复计费');
    await closeDrawer(page);
  }
  for (const a of phase2) {
    await expect(card(page, a.id)).toHaveAttribute('data-kind', 'first');
    await expect(card(page, a.id)).toHaveAttribute('aria-checked', 'true');
  }
  await setCar(page, 'X99');
  await expect(ce(page, 'car')).toHaveValue('X99');
  for (const a of phase1) await expect(card(page, a.id)).toHaveAttribute('data-kind', 'ext');
});

test('CE-E2E-08b 包外东盟提示；Carmind1.5 中东使用欧盟货架', async ({ page }) => {
  await ready(page, 'c3-euanz', 'T13C', 'sea');
  await expect(ce(page, 'hint')).toBeVisible();
  await expect(ce(page, 'hint')).toContainText(/该包的 SOR 针对\s*欧盟、澳新/);
  await choosePackage(page, 'c15-eu');
  await region(page, 'sea').click();
  await region(page, 'me').click();
  await expect(ce(page, 'pkg').locator('button').nth(2)).toHaveAttribute('aria-pressed', 'true');
  const ids = await ce(page, 'card').evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.id!).sort());
  expect(ids).toEqual(params.packages['c15-eu'].agents.map((a) => a.id).sort());
  await expect(ce(page, 'tier')).toBeHidden();
});

test('CE-E2E-09 三类算式抽屉、分级金额、研究院悬停集合', async ({ page }) => {
  const g = gold('G-EU-MAX');
  await open(page, g.selection);
  await expectResult(page, g.result);
  // 卡片、瀑布图、语种折算三个入口均验证数值。
  const row = g.result.rows.find((r) => r.id === 'edge-core')!;
  await card(page, row.id).locator('[data-ce="card-pm"]').click();
  for (const key of ['research', 'product', 'delivery', 'direct', 'sum'] as const)
    await expect(ce(page, 'd-body')).toContainText(`${row[key]!.toFixed(2)} 万`);
  await ce(page, 'd-close').click();
  await expect(ce(page, 'drawer')).toHaveAttribute('aria-hidden', 'true');
  for (const key of [...steps, 'total'] as const) {
    await step(page, key).press('Enter');
    await expect(ce(page, 'drawer')).toHaveAttribute('aria-hidden', 'false');
    await expect(ce(page, 'd-body')).toContainText(`${(key === 'total' ? g.result.nre.known : g.result.nre[key]).toFixed(2)} 万`);
    await closeDrawer(page);
  }
  await ce(page, 'why-lang').click();
  await expect(ce(page, 'd-body')).toContainText(g.result.eq.toFixed(1));
  for (const lang of g.result.langs) await expect(ce(page, 'd-body')).toContainText(lang.name);
  await page.keyboard.press('Escape');
  await expect(ce(page, 'drawer')).toHaveAttribute('aria-hidden', 'true');
  await step(page, 'research').hover();
  // 检查实际高亮呈现：未参与者饱和度被压低；不读取或断言 CSS 类名。
  const highlighted = () => ce(page, 'card').evaluateAll((els) => els.filter((el) => getComputedStyle(el).filter === 'none').map((el) => (el as HTMLElement).dataset.id!).sort());
  await expect.poll(highlighted).toEqual(g.result.rows.filter((r) => (r.research ?? 0) > 0).map((r) => r.id).sort());
});

test('CE-E2E-10 方案 A/B 每级差额 = B − A，载回全部选择', async ({ page }) => {
  await open(page, gold('G-EU-MAX').selection);
  const a = await snapshot(page);
  await ce(page, 'save-a').click();
  await ce(page, 'tier').locator('button').nth(2).click();
  await ce(page, 'lic-voice').locator('button').nth(1).click();
  const b = await snapshot(page);
  await ce(page, 'save-b').click();
  const gA = gold('G-EU-MAX').result, gB = gold('G-EU-LITE').result;
  const rows = ce(page, 'cmp-table').locator('tr');
  // 含待补的级在金额与差额后标「+待补」（已知部分 + pending 口径）
  const pend = (g: typeof gA, key: string) => (key === 'known' ? g.nre.total == null : ((g.nre.pending as Record<string, string[] | undefined> | undefined)?.[key]?.length ?? 0) > 0);
  for (const [i, key] of [...steps, 'known' as const].entries()) {
    const cells = rows.nth(i + 1).locator('td');
    const pa = pend(gA, key), pb = pend(gB, key);
    await expect(cells.nth(1)).toHaveText(gA.nre[key].toFixed(1) + (pa ? '+待补' : ''));
    await expect(cells.nth(2)).toHaveText(gB.nre[key].toFixed(1) + (pb ? '+待补' : ''));
    const delta = gB.nre[key] - gA.nre[key];
    await expect(cells.nth(3)).toHaveText(`${delta > 0 ? '+' : ''}${delta.toFixed(1)}${pa || pb ? '+待补' : ''}`);
  }
  const load = (name: string) => ce(page, 'cmp-t').locator(`button[data-k="${name}"]`);
  await load('A').click(); expect(await snapshot(page)).toEqual(a);
  await load('B').click(); expect(await snapshot(page)).toEqual(b);
});

test('CE-E2E-11 复制链接完整复现、篡改回退、旧版本重算提示', async ({ page, context }) => {
  await ready(page, 'c3-euanz', 'X99');
  await preset(page, 0).click();
  await region(page, 'anz').click();
  await page.locator('[data-ce="lang"][data-id="de"]').click();
  await card(page, 'edge-core').locator('[data-ce="card-tag"]').click();
  await ce(page, 'lic-voice').locator('button').nth(1).click();
  await setSlider(ce(page, 'lic-active'), '60');
  await setSlider(ce(page, 'lic-calls'), '22');
  await ce(page, 'per-market').check(); await ce(page, 'sys-switch').check();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin });
  await ce(page, 'copy-link').click();
  await expect(ce(page, 'toast')).toContainText('链接已复制');
  const link = await page.evaluate(() => navigator.clipboard.readText());
  const source = await snapshot(page);
  const next = await context.newPage();
  try {
    await next.goto(link);
    await expect(ce(next, 'root')).toBeAttached();
    expect(await snapshot(next)).toEqual(source);
    const tampered = new URL(link);
    for (const [k, v] of Object.entries({ p: 'bad-package', t: 'bad-tier', r: 'eu,bad-region', a: 'edge-core,bad-agent', o: 'edge-core:bad', ar: '-1', dc: 'NaN' })) tampered.searchParams.set(k, v);
    await next.goto(tampered.href);
    await expect(ce(next, 'toast')).toContainText('无效');
    await expect(ce(next, 'total')).toHaveAttribute('data-value', /^\d+\.\d{2}$/);
    await expect(ce(next, 'pkg').locator('button').nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(ce(next, 'tier').locator('button').nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(ce(next, 'lic-active')).toHaveValue(String(params.lic.activeRate * 100));
    await expect(ce(next, 'lic-calls')).toHaveValue(String(params.lic.dailyCalls));
    const stale = new URL(link); stale.searchParams.set('ver', '1900-01-01');
    await next.goto(stale.href);
    await expect(ce(next, 'toast')).toContainText('已按当前参数重算');
    expect(await snapshot(next)).toEqual(source);
  } finally { await next.close(); }
});

test('CE-E2E-12 实际下载文件名、三张表、中文语种与无头重算', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const g = gold('G-EU-MAX');
  await open(page, g.selection);
  await expectResult(page, g.result);
  const downloading = page.waitForEvent('download');
  await ce(page, 'download').click();
  const download = await downloading;
  const expectedName = `成本粗估-Carmind3.0 欧盟澳新包-T13C-${params.version}.xlsx`;
  const filename = download.suggestedFilename();
  const path = testInfo.outputPath(filename);
  await download.saveAs(path);
  console.log(`CE-E2E-12 下载保存：${path}`);
  // soft 允许文件名错时仍解析与重算真实下载物，回执保留两类证据。
  expect.soft(filename).toBe(expectedName);
  const inspect = spawnSync('python3', ['-c', `
import json,sys
from openpyxl import load_workbook
w=load_workbook(sys.argv[1],read_only=True,data_only=False)
s=w['你选了什么']; rows=list(s.iter_rows(values_only=True))
start=next(i for i,r in enumerate(rows) if r and r[0]=='语种')+1
langs=[]
for r in rows[start:]:
    if not r or r[0] is None: break
    langs.append(r[0])
print(json.dumps({'sheets':w.sheetnames,'langs':langs},ensure_ascii=False))
w.close()
`, path], { encoding: 'utf8', timeout: 30_000 });
  expect(inspect.error, inspect.stderr).toBeUndefined();
  expect(inspect.status, inspect.stderr).toBe(0);
  const workbook = JSON.parse(inspect.stdout);
  expect(workbook.sheets).toEqual(['你选了什么', 'NRE 明细', 'LIC 明细']);
  expect(workbook.langs).toEqual(g.result.langs.map((l) => l.name));
  for (const name of workbook.langs) expect(name).toMatch(/[\u3400-\u9fff]/);
  const expectedPath = testInfo.outputPath('G-EU-MAX.expected.json');
  writeFileSync(expectedPath, JSON.stringify({ result: g.result }, null, 2));
  // 脚本自建隔离 UserInstallation、TemporaryDirectory；只以 --headless 运行 soffice。
  // 自己的独立进程组便于超时后只清理本次 Python / soffice 子进程。
  const recalc = await new Promise<{ stdout: string; stderr: string; error?: Error; status: number | null }>((done) => {
    const child = spawn('python3', [RECALC, path, expectedPath], { timeout: 120_000, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', error: Error | undefined;
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk; });
    child.once('error', (err) => { error = err; });
    // exit 时清组，避免超时后的 soffice 残留继续持有管道、阻止 close。
    child.once('exit', () => {
      if (child.pid !== undefined && child.pid > 0) {
        try { process.kill(-child.pid, 'SIGTERM'); } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ESRCH') error = err as Error;
        }
      }
    });
    child.once('close', (status) => done({ stdout, stderr, error, status }));
  });
  const output = `${recalc.stdout ?? ''}${recalc.stderr ?? ''}${recalc.error ? `\n${recalc.error.message}\n` : ''}exit=${recalc.status}\n`;
  writeFileSync(testInfo.outputPath('recalc-output.txt'), output);
  await testInfo.attach('xlsx-recalc', { body: output, contentType: 'text/plain' });
  console.log(`CE-E2E-12 重算输出：\n${output}`);
  expect(recalc.error, output).toBeUndefined();
  expect(recalc.status, output).toBe(0);
});

test('CE-E2E-13 动效三档与 reducedMotion 自动挂载并关闭', async ({ page }) => {
  await open(page);
  const buttons = ce(page, 'motion').locator('button');
  await expect(buttons).toHaveCount(3);
  for (const i of [0, 1, 2, 0]) {
    await buttons.nth(i).click();
    for (let j = 0; j < 3; j++) await expect(buttons.nth(j)).toHaveAttribute('aria-pressed', String(i === j));
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page); // 不点 facade，不读取记忆中的 motion，检验重新自动挂载。
  await expect(ce(page, 'motion').locator('button').nth(2)).toHaveAttribute('aria-pressed', 'true');
  const animations = await ce(page, 'root').evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length);
  expect(animations, '系统减弱动态下不应残留运行中的界面动效').toBe(0);
});

test('CE-E2E-14 操作全流程无控制台 error / pageerror', async ({ page }) => {
  await ready(page);
  await preset(page, 0).click();
  await ce(page, 'tier').locator('button').nth(1).click();
  await ce(page, 'tier').locator('button').nth(0).click();
  await region(page, 'anz').click();
  await ce(page, 'why-lang').click(); await closeDrawer(page);
  await step(page, 'research').press('Enter'); await closeDrawer(page);
  await ce(page, 'save-a').click();
  await preset(page, 3).click(); await ce(page, 'save-b').click();
  await ce(page, 'undo').click();
  await ce(page, 'lic-voice').locator('button').nth(1).click();
  await setSlider(ce(page, 'lic-active'), '60');
  await ce(page, 'lic-reset').click();
  await page.reload();
  await expect(ce(page, 'root')).toBeAttached();
  await expect(ce(page, 'total')).toHaveAttribute('data-value', /^\d+\.\d{2}$/);
  // 自动 consoleGuard 在此用例及其余 13 例退出时统一检查全部事件。
});

test('CE-E2E-15 工具模式顶栏：快捷入口带入场景、使用说明网页与 Markdown 原文', async ({ page }) => {
  await page.goto(PATH);
  await expect(ce(page, 'root')).toBeAttached();
  // 开门见山：无 Lab 页眉 / 30 秒结论 / 页脚回链 / 站点页脚 / 主题切换
  await expect(page.locator('.lab-masthead, .lab-tldr, .lab-foot, .site-footer')).toHaveCount(0);
  const nav = page.locator('.site-header .site-nav a');
  await expect(nav).toHaveText(['EHV 欧盟澳新', 'EHV 东盟', '欧盟二期', '俄罗斯二期', '使用说明']);

  await nav.filter({ hasText: '欧盟二期' }).click();
  await expect(page).toHaveURL(/p=c15-eu/);
  await expect(page.locator('[data-ce="car"]')).toHaveValue('T13C');
  await expect(ce(page, 'total')).toHaveAttribute('data-value', /^\d+\.\d{2}$/);
  await expect(page.locator('.ce-card[aria-checked="true"]')).toHaveCount(5);

  await page.locator('.site-header .site-nav a', { hasText: '使用说明' }).click();
  await expect(page).toHaveURL(/\/lab\/cost-estimator\/guide\/$/);
  await expect(page.locator('.ceg-doc h1')).toContainText('使用说明');
  const md = await page.request.get(PATH + 'guide.md');
  expect(md.status()).toBe(200);
  expect(await md.text()).toContain('# 多语种座舱大模型 · 成本粗估 使用说明');
});
