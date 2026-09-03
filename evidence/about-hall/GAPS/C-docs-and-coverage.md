# AH-GAPS-C · 文档一致性与 e2e 覆盖查缺报告

- **报告人**：多面 worker（Gemini 3.8 Flash）
- **时间**：2026-09-03 17:10
- **工作区**：`/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- **当前 HEAD**：`909a209`（先行于远端 1 个 commit，上接 `1963f7b`、`827308f`、`bbdf4ee`、`df497c4`、`5c7087f`、`5e3c4b6`、`53c2e6e`、`c463c36`）
- **唯一产出物**：`evidence/about-hall/GAPS/C-docs-and-coverage.md`（只读核对，未改动任何业务/测试代码，未 commit）

---

## 一、文档单源一致性对照

### 1. 对照总表

| 序号 | 检查项 | 文档现状（文件:行） | 代码/事实事实（文件:行 / Git） | 一致性裁定 | 修复建议与影响级别 |
|---|---|---|---|---|---|
| 1.1 | `INDEX.md` 票状态 | `docs/local-cmd/ABOUT-HALL-INDEX.md:20` 写 `AH-D4: DISPATCHED`<br>`INDEX.md:23` 写 `AH-W1b: DISPATCHED(W1f slim → i2v#2)` | Git log `5c7087f` 已提交 ADR-4 文件 `docs/local-cmd/adr/ADR-4-first-building-and-transition.md`<br>Git log `909a209` 已提交 S0 视频 `public/media/about-hall/hero-s0-720p.mp4` | **不一致（状态滞后）** | **P0**：立即将 AH-D4 置为 `MERGED`，AH-W1b 置为 `MERGED`。 |
| 1.2 | `INDEX.md` 状态语义混乱 | `INDEX.md:27-29, 33-34` 将 W1e/W2a/W2b/W2c/W4/W5 标为 `MERGED`<br>`INDEX.md:19, 30-32, 35` 将 D3/W3/W3d/W7a/W6 标为 `HOST_READBACK_PASS` | Git log `53c2e6e`、`c463c36` 事实：D3、W3d、W7a、W6 均已 commit 进当前分支。PR #234 尚未合入 main。 | **不一致（语义双标）** | **P1**：统一定义 `MERGED` 是指合入本 topic 分支还是合入 main；同在一个分支的已提交票状态口径必须统一。 |
| 1.3 | `INDEX.md` 缺票行 | `INDEX.md:16-35` 票册中仅列出 20 张票，完全无 W1f / W1g / W1h / T1a / T1b / QE / VIS-1 / M0 这 8 张票的表格行 | Git log `5c7087f` (T1a), `5e3c4b6` (M0), `df497c4` (T1b), `bbdf4ee` (QE), `827308f` (W1g), `909a209` (W1h)，及工作区 `evidence/about-hall/VIS-1/` | **严重缺失（漏记 8 票）** | **P0**：在 INDEX.md 票册中完整增补 8 票的波次、席位、write root 与最新状态。 |
| 1.4 | `INDEX.md` 锁与待办滞后 | `INDEX.md:42` 仍写 `about/index.astro` 由 `AH-W4` 持有<br>`INDEX.md:43` 仍写 `Areas.ts` 由 `AH-W5` 持有<br>`INDEX.md:53` NEEDS_LEIGE 仍写六站占位等磊哥灌输 | W4/W5 早在 L5 已收稿释放，后续被 W7a、M0、VIS-1 多次编辑<br>AH-M0（`5e3c4b6`）已按 ADR-4 决策 C 彻底删除占位 | **不一致（锁与待办未清）** | **P0**：清空已释放文件锁；将六站占位从 NEEDS_LEIGE 中移除并结项。 |
| 2.1 | `LOOP-LOG.md` 缺 L11 段 | `docs/local-cmd/ABOUT-HALL-LOOP-LOG.md:75-82` 止步于 `### L10 · 2026-09-03 12:55–14:20` | 14:20 之后发生：ADR-4 终裁、T1a 北槽换位、M0 删占位、T1b 展厅 showcase/脉冲/到达卡、QE 环视、W1f/W1g 瘦身替换、S0/S6 视频落盘 (W1h)、VIS-1 Opus 视觉实装 | **严重缺失（断代）** | **P0**：增补 L11 段（14:20–17:00），系统化记录 8 项交付与 commit 哈希。 |
| 3.1 | `TECH-ARCH.md` 载荷预算 | `docs/local-cmd/ABOUT-HALL-TECH-ARCH.md:47` 门脚本行仍写 `总载荷 ≤2.5MB`<br>`TECH-ARCH.md:87` 仍写 `移动 9:16 ≤500KB/段` | `scripts/about-hall-gate.mjs:26` 规定 `MEDIA_CAP_BYTES = 6 * MB;`<br>`TECH-ARCH.md:89` 规定 `≤6MB`<br>W1h `commit 909a209`（`RECEIPT.md:15, 29`）已彻底废弃 9:16 视频 | **不一致（旧常量残留）** | **P1**：更正 TECH-ARCH.md:47 为 6.0MB；将 87 行 9:16 标注为“已废弃，移动端走 poster 静帧”。 |
| 3.2 | `TECH-ARCH.md` 媒体 schema | `TECH-ARCH.md:37` 规定媒体清单字段含 `src9x16` | `src/data/about-hall-media.json:1-106` 9 条条目中已完全剔除 `src9x16`，并规范了 `fps`、`audio`、`width`、`height` | **不一致** | **P1**：同步 TECH-ARCH.md:37 的 JSON 字段说明。 |
| 3.3 | `TECH-ARCH.md` 依赖表回填 | `TECH-ARCH.md:67-77` 规定 worker 装依赖后写回 §5.2 表格 | L4/L5 安装了 `imageio-ffmpeg`、`Pillow` 至 state venv，未登记回表；`package.json:26-47` 中除 `@lhci/cli` 外均未引入外包依赖 | **遗漏注记** | **P2**：在 TECH-ARCH §5.2 补注依赖安装与实际收拢策略。 |
| 3.4 | `ScrubVideo` 滚动模式能力 | `TECH-ARCH.md:39-41` 规划了长滚动区间 scrub 规范（禁 `wheel+preventDefault`、读 `rect.top`、区间集中） | `src/components/city/halls/ScrubVideo.ts:171-228` 已在 W1h（`909a209`）中实现 `createScrollScrub`，完全具备滚动模式与近距预加载能力 | **一致（能力已兑现）** | 无需改动代码，文档可标记为已兑现。 |
| 4.1 | `WBS-01` 场景与动作定案 | `docs/local-cmd/ABOUT-HALL-WBS-01-HERO-ASSETS.md:31` S0 场景写 `头部随镜头微转 ±15°`<br>`WBS-01:37` S6 场景未注瘦身首帧<br>`WBS-01:127-128` 仍列 `hero-s0-portrait.mp4 9:16` | `docs/local-cmd/locked/S0-T-LOCKED-v4.md:3, 9` 明确变更为**零头部动作**（两次 REJECT 后定选零头动）<br>`S6-T-LOCKED-v4.md:3` 确定使用瘦身首帧<br>W1h（`RECEIPT.md:15`）已删竖版视频 | **不一致（未同步最新定案）** | **P1**：更新 WBS-01 表格中的 motion 说明为 LOCKED v4 真实定稿，废除 9:16 交付项。 |
| 4.2 | `WBS-01` S0-R 状态 | `WBS-01:19, 23, 96-101` 仍将 S0-R 写为 `v0 等照片` 赛马候选 | 磊哥 13:47 指令：**R 真人路线终止（ARCHIVED）**，素材存档不进仓；`S0-R-LOCKED-v1.md` 归档 | **不一致（未同步归档）** | **P1**：在 WBS-01 §1 和 §3.3 标记 S0-R 为 ARCHIVED（真人路线终止）。 |
| 4.3 | `WBS-01` LOCKED 版本号 | `WBS-01:55, 102, 132` 仍写 `S0-T v1`、`S6-T v1` | 实际纸版本已演进到 `S0-T-LOCKED-v4.md` 与 `S6-T-LOCKED-v4.md` | **不一致（版本号脱节）** | **P2**：更新 WBS-01 纸版本引用至 v4。 |
| 5.1 | `HANDOFF.md` 全局有效性 | `docs/local-cmd/ABOUT-HALL-HANDOFF-2026-09-03.md:1-40`（写于 L7 08:40-10:30）标为当前交接 | 事实：PR #234 已开（L8）；attempt5/7 已 0 失败（L8/L10）；ZDR 已在 13:05 解除；视频已进仓（W1h）；R 路线已终止；北槽位/QE 环视均已完成 | **全面严重失效（已作废）** | **P1**：在 HANDOFF.md 顶部增加“已于 L10/L11 失效”警示横幅，或重写为 L11 交接档。 |
| 6.1 | `SRD.md` `Building` 接口 | `docs/spec/SRD.md:1141-1157` §12.7.3 `interface Building` 缺少 `hallPath?: string;` | `src/lab/world/city/CityMap.ts:97`、`src/data/cyber-city-buildings.json:202`、`scripts/about-hall-gate.mjs:463` 均已依赖 `b.hallPath` | **字段遗漏** | **P1**：在 SRD.md §12.7.3 的 TypeScript interface 中增补 `hallPath?: string;` 行。 |
| 6.2 | `SRD.md` 展厅路由补行 | `docs/spec/SRD.md:1033` 已补入 `\| /world/{slug}/ \| 楼内展厅 HTML（动效豁免区）...` | 与当前实现及 ADR-2 约定吻合 | **一致** | 维持。 |
| 6.3 | 建筑坐标与街区南北倒挂 | `src/data/cyber-city-buildings.json:71-73, 197-198`：`about-pavilion` 坐标为北 `(-44, -150)`，但 `category` 为 `civic`，所属街区为 `civic`（“西南个人区”）<br>`cyber-city-buildings.json:58, 262-263`：`now-signal` 坐标为南 `(-44, 150)`，但属于 `ai-core`（“北城 AI 中枢区”） | ADR-4 §核过的几何与测试事实（`ADR-4-first-building-and-transition.md:48-56`）明知两楼 category / 街区不同，但代码仅互换了坐标和泊位，未调整街区定义；`SRD.md:1121` 依赖的 `cyber-city-buildings-map.md:78, 135` 仍记载旧坐标 | **严重倒挂（坐标在北，街区写西南）** | **P0**：核定 ADR-4 对街区归属的定谳，统一 `cyber-city-buildings.json` 中的 `districts` 与 `category` 定义，并修订 buildings-map 文档。 |
| 7.1 | `README.md` 仓根功能描述 | `README.md:1-74` 仍为 Phase 1 早期版本，只记录了 `/lab/tts-cockpit` 与 `/lab/car-configurator`，完全未提及 3D 赛博科技城、展厅、Q/E 环视、进楼流程 | 当前主分支已完成科技城入口、变形、WASD 驾驶、Q/E 环视、进楼前奏、About 展厅与纸面双胞胎 | **全面缺失** | **P2**：列出应补标题（见下文 1.2 节）。 |
| 8.1 | `AGENTS.md` 席位表 | `AGENTS.md:103` 席位表仍写 `gemini-3.7-flash（agy）`<br>`AGENTS.md:100-106` 缺少 Composer 席位说明 | L3（`LOOP-LOG.md:32`）与 L10 磊哥指令：agy 全部用 **Gemini 3.8 Flash**（底层 CLI 已映射）<br>L10（`LOOP-LOG.md:76`）明确使用“Composer 收账”执行全量 93/93 校验与收口 | **信息不全/别名未标明** | **P1**：席位表更新为 `gemini-3.8-flash`（注：别名兼容 3.7）；增设 Composer 收账席。 |

---

### 1.2 `README.md` 应补段落标题清单（不写内容）

根据第 7 项要求，仓根 `README.md` 应补齐以下段落骨架：

```markdown
## 赛博智能座舱科技城（Cyber City）
### 驾驶操控与交互（WASD / 巡航变形 / Q/E 自由视角环视 / M 小地图）
### 建筑进站与城厅流转（专属泊车位 / 进站前奏 / 霓虹脉冲）
## 个人档案馆展厅（About Pavilion）
### /world/about-pavilion/ 沉浸展厅（指针/滚动双视频 Scrub、六站地轨、馆长程序化动作）
### /about/ 纸面双胞胎（高触感折叠摘要、六向因果晶体、LHCI 四项满分）
```

---

## 二、e2e 覆盖查缺清单

本节逐项审查 `e2e/about-hall.spec.ts`、`e2e/cyber-city-poi-arrival.spec.ts`、`e2e/cyber-city-lookaround.spec.ts`、`e2e/cyber-city-minimap.spec.ts`，并对照本轮交付功能，给出覆盖行号或缺项建议。

### 2.1 覆盖对照表

| 域 | 功能点 | 覆盖现状 | 现状证据（文件:行） / 建议用例名与断言 |
|---|---|---|---|
| **城市** | about 移至北槽位后，`?poi=about-pavilion` 出生落点坐标断言 | **缺失** | **缺失**。<br>`poi-arrival.spec.ts:433` 与 `lookaround.spec.ts:329` 仅断言 `funnel.firstPoiIn !== null`。由于旧槽位 `(-20, 150)` 与北槽位 `(-20, -150)` 均能入触发圈，当前没有用例断言真实世界坐标。<br>→ 建议用例名：`CITY-POI-ABOUT-NORTH-COORDS`<br>→ 建议断言：`const pos = await page.evaluate(() => (window as any).__worldSpike.state()); expect(Math.hypot(pos.x - (-20), pos.z - (-150))).toBeLessThan(1);` |
| **城市** | 任务链首站 HUD 文案（ADR-4 A 首站改为 about） | **缺失** | **缺失**。<br>`src/data/world-pois.json:23` 已将 `quest.chain[0]` 改为 `about-pavilion`，但上述 4 个 spec 中零断言。<br>→ 建议用例名：`CITY-QUEST-FIRST-STOP-ABOUT`<br>→ 建议断言：`await expect(page.locator('[data-world-quest-name]')).toContainText('个人档案馆');` |
| **城市** | hold 脉冲在 `prefers-reduced-motion` 下不触发 | **已覆盖** | **已覆盖**。<br>`e2e/cyber-city-poi-arrival.spec.ts:477-478`：<br>`expect((await readLatch(rm)).seen, 'reduced-motion 不得挂 hold overlay 类').toBe(false);`<br>`expect(await overlayOn(rm)).toBe(false);` |
| **城市** | Q/E 视角侧转在 FPV（第一人称）下硬门封锁 | **已覆盖** | **已覆盖**。<br>`e2e/cyber-city-lookaround.spec.ts:264, 271`：<br>`expect(await readLookYaw(page), 'FPV 下 Q/E 必须硬门封锁（yaw 恒 0）').toBe(0);`<br>`expect(await readLookYaw(page), '切回 third 不得带入 fpv 期残角').toBe(0);` |
| **城市** | Q/E 视角侧转与进站前奏互斥（圈内前奏期间 yaw 恒 0） | **已覆盖** | **已覆盖**。<br>`e2e/cyber-city-lookaround.spec.ts:286, 300, 339, 346`：<br>L286: `expect(await readLookYaw(page), '圈内按 E 期间环视必须恒 0').toBe(0);`<br>L300: `expect(await readLookYaw(page), '进站前奏期间环视必须冻结在 0').toBe(0);`<br>L339/346: 深链泊位与定帧后 `lookYaw ≡ 0`。 |
| **展厅** | 馆长三态 `data-curator-pose`（ADR-3 B.6 契约） | **缺失（代码与测试双缺）** | **缺失**。<br>`e2e/about-hall.spec.ts` 全篇零 `curator`。且代码 `Curator.astro:60` 与 `curator.ts:269-270` 仅设置 `data-curator-on`、`data-curator-lift`、`data-curator-scene`，根本未向 DOM 输出 `data-curator-pose`。<br>→ 建议用例名：`HALL-CURATOR-POSE-LIFECYCLE`<br>→ 建议断言：`await expect(page.locator('[data-curator]')).toHaveAttribute('data-curator-pose', /gaze\|present\|salute/);` |
| **展厅** | 地轨键盘 Tab 聚焦与 Enter 跳站 | **缺失** | **缺失**。<br>`e2e/about-hall.spec.ts` 未对 `StationRail.astro` 中的六站地轨按钮进行任何 Tab/Enter 交互测试。<br>→ 建议用例名：`HALL-RAIL-KEYBOARD-NAV`<br>→ 建议断言：`await page.locator('.hall-rail-stop').nth(1).focus(); await page.keyboard.press('Enter'); await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);` |
| **展厅** | 到达条三种驾驶卡文案分支（maxKmh / coneHits / 保底探索） | **部分覆盖（缺 coneHits）** | **部分覆盖**。<br>`e2e/about-hall.spec.ts:222` 覆盖 `maxKmh`（`最高巡航 96 km/h`）；<br>`e2e/about-hall.spec.ts:232-234` 覆盖保底（`探索 n/N`）；<br>**缺失 `coneHits` 分支**（`途中碰倒 N 个锥桶`）。<br>→ 建议用例名：`HALL-CHROME-DRIVE-CONEHITS`<br>→ 建议断言：`await expect(page.locator('[data-hall-drive]')).toHaveText('途中碰倒 4 个锥桶');` |
| **展厅** | Hero 视频指针 scrub（currentTime 随指针更新） | **已覆盖** | **已覆盖**。<br>`e2e/about-hall.spec.ts:68-87`：<br>指针移至右侧 3/4 处，`expect.poll(() => video.currentTime).toBeGreaterThan(1);`。 |
| **展厅** | S6 过渡视频滚动 scrub（currentTime 在 3~8s） | **已覆盖** | **已覆盖**。<br>`e2e/about-hall.spec.ts:89-119`：<br>滚到 S6 中段，`expect(t).toBeGreaterThan(3); expect(t).toBeLessThan(8);`。 |
| **展厅** | reduced-motion 下视频全部 paused / 无 running animation | **已覆盖** | **已覆盖**。<br>`e2e/about-hall.spec.ts:121-171`：<br>分别对默认与带参进站测试 `allPaused === true` 且 `running === 0`。 |
| **展厅** | 无 JS 下首屏 H1 与 poster 图片可见（`javaScriptEnabled: false`） | **已覆盖** | **已覆盖**。<br>`e2e/about-hall.spec.ts:174-187`：<br>`test.use({ javaScriptEnabled: false });` 断言 `h1` 可见且 `expectImageLoaded(poster);`。 |
| **展厅** | 移动端 375px 视口无横向页面级溢出 | **缺失** | **缺失**。<br>`e2e/about-hall.spec.ts` 全篇未设置 375 视口；`e2e/mobile.spec.ts:9-67` 仅覆盖 `/home/`、`/lab/tts-cockpit/`、`/lab/car-configurator/`，遗漏了展厅页。<br>→ 建议用例名：`HALL-MOBILE-375-NO-OVERFLOW`<br>→ 建议断言：`test.use({ viewport: { width: 375, height: 667 } }); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); expect(overflow).toBeLessThanOrEqual(0);` |
| **纸面** | `/about/` 问题卡折叠摘要存在（`about-qcard-teaser`） | **缺失** | **缺失**。<br>`e2e/site-health.spec.ts:15` 仅验证 `/about/` HTTP 200，全仓没有关于 `/about/` 结构与内容的专用测试。<br>→ 建议用例名：`ABOUT-PAPER-TEASERS-PRESENT`<br>→ 建议断言：`await expect(page.locator('.about-qcard-teaser')).toHaveCount(3); await expect(page.locator('.about-qcard-teaser').first()).toBeVisible();` |
| **纸面** | `/about/` 问题卡 hover / 聚焦展开 | **缺失** | **缺失**。<br>全仓零用例测试问题卡背面内容翻转或可见性。<br>→ 建议用例名：`ABOUT-PAPER-CARD-FLIP`<br>→ 建议断言：`await page.locator('.about-qcard').first().hover(); await expect(page.locator('.about-qcard-back').first()).toBeVisible();` |
| **纸面** | `/about/` 页面渲染树中不得出现占位符 `[[` | **缺失** | **缺失**。<br>虽然 AH-M0（`5e3c4b6`）从源码中剔除了占位符，但无自动化回归防线防死灰复燃。<br>→ 建议用例名：`ABOUT-PAPER-NO-PLACEHOLDER-LEAK`<br>→ 建议断言：`const bodyText = await page.locator('main').innerText(); expect(bodyText).not.toContain('[[');` |

---

## 三、缺口分级汇总（P0 / P1 / P2）

### P0 · 严重缺口（阻碍合流主线认知、存在重大事实矛盾）
1. **`ABOUT-HALL-INDEX.md` 票册严重脱水**：W1f / W1g / W1h / T1a / T1b / QE / VIS-1 / M0 共 8 张已提交或在途的关键票完全缺失；D4、W1b 仍写 `DISPATCHED`。
2. **`ABOUT-HALL-LOOP-LOG.md` 缺失 L11 记录**：14:20 之后的重大决策与产出（ADR-4、北槽换位、Q/E 环视、视频进仓、Opus 视觉）全部处于日志空白状态。
3. **城市大楼数据南北倒挂**：`cyber-city-buildings.json` 中 `about-pavilion` 坐标已移至北槽（$Z=-150$），但街区信息仍写 `civic`（西南个人区）；`now-signal` 坐标移至南槽（$Z=150$），但街区仍写 `ai-core`（北城 AI 中枢区）。元数据与空间事实不符。
4. **城市深链北槽坐标无自动化断言**：`?poi=about-pavilion` 缺乏 `(x ≈ -20, z ≈ -150)` 的绝对位置坐标校验，无法防范误退回旧南槽位。

### P1 · 主要缺口（文档严重陈旧、核心规范未同步、测试防护存在死角）
1. **`ABOUT-HALL-HANDOFF-2026-09-03.md` 全篇失效**：写于 L7 晨，所称“未 push、无片、ZDR 阻断、R 路线赛马”在 L8–L11 已全部翻盘，必须重写或显式标记作废。
2. **`WBS-01-HERO-ASSETS.md` 未同步 LOCKED v4 定案**：S0 动作仍写微转头 15°（实为零头动）；S0-R 仍写待照片（实已终止归档）；仍留有已废弃的 9:16 竖版视频交付项。
3. **`TECH-ARCH.md` 载荷预算残留旧值**：门脚本行仍写旧版 2.5MB（实为 6.0MB）；仍留有 9:16 视频预算条目。
4. **`SRD.md` 架构契约遗漏**：§12.7.3 `interface Building` 漏写 `hallPath?: string;` 字段定义。
5. **展厅与纸面测试防护盲区**：
   - 到达条驾驶卡缺失 `coneHits`（碰锥）分支独立用例；
   - 展厅缺少移动端 375px 无水平溢出用例；
   - 纸面 `/about/` 缺少问题卡折叠摘要存在性、hover 翻转与 `[[` 占位符防泄漏断言。
6. **`AGENTS.md` 席位说明滞后**：未明确注明 agy 实质已切换至 Gemini 3.8 Flash；缺失 Composer 收账席说明。

### P2 · 次要缺口（体验与辅助机制完善）
1. **仓根 `README.md` 整体落后**：未提及 3D 赛博城市、展厅、Q/E 环视与进楼流程，需增补 4 个章节标题。
2. **馆长动作属性代码未兑现契约**：`Curator.astro` 与 `curator.ts` 未输出 ADR-3 规定的 `data-curator-pose="gaze|present|salute"` 状态属性。
3. **地轨键盘跳站测试缺失**：`StationRail.astro` 具备 Tab/Enter 跳转能力，但未建立 e2e 自动化保护。

---

## 四、一句话结论（Verdict）

> **工程实现与媒体资产已超前落地并全绿验证（北槽迁址、Q/E 环视、S0/S6 视频落盘与 Scrub 测通），但编排文档在 14:20 L10 处发生严重时间冻结与断层（漏记 8 票、缺 L11 记录、交接档全面翻盘、南北街区倒挂），且在北槽落点坐标、移动端 375、碰锥文案及纸面 `/about/` 存在五处测试盲区，亟需在合流前完成「记账对齐 + 盲点补票」。**

---

## 文末：实际查阅与取证的文件清单

1. **编排与管理文档**
   - `docs/local-cmd/ABOUT-HALL-INDEX.md`
   - `docs/local-cmd/ABOUT-HALL-LOOP-LOG.md`
   - `docs/local-cmd/ABOUT-HALL-HANDOFF-2026-09-03.md`
   - `docs/local-cmd/ABOUT-HALL-TECH-ARCH.md`
   - `docs/local-cmd/ABOUT-HALL-WBS-01-HERO-ASSETS.md`
   - `AGENTS.md`
   - `README.md`
2. **决策与规格文档**
   - `docs/local-cmd/adr/ADR-4-first-building-and-transition.md`
   - `docs/local-cmd/adr/ADR-3-dual-form-and-wave-gaps.md`
   - `docs/local-cmd/adr/ADR-2-hall-routing-contract.md`
   - `docs/local-cmd/adr/ADR-1-avatar-route.md`
   - `docs/spec/SRD.md`
   - `docs/research/cyber-city-buildings-map.md`
3. **LOCKED 提示词与定选纸**
   - `docs/local-cmd/locked/S0-T-LOCKED-v4.md`
   - `docs/local-cmd/locked/S6-T-LOCKED-v4.md`
   - `docs/local-cmd/locked/S0-R-LOCKED-v1.md`
   - `docs/local-cmd/locked/S0-H-LOCKED-v1.md`
4. **数据与网关脚本**
   - `src/data/cyber-city-buildings.json`
   - `src/data/about-hall-media.json`
   - `src/data/world-pois.json`
   - `src/data/world-halls.json`
   - `src/data/camera-shots.json`
   - `scripts/about-hall-gate.mjs`
   - `package.json`
5. **前端组件与脚本源码**
   - `src/components/city/halls/ScrubVideo.ts`
   - `src/components/city/halls/about/Curator.astro`
   - `src/components/city/halls/about/curator.ts`
   - `src/components/city/halls/about/StationRail.astro`
   - `src/components/city/HallChrome.astro`
   - `src/components/city/halls/about/Hero.astro`
   - `src/components/city/halls/about/Stations.astro`
   - `src/components/city/halls/about/Transition.astro`
   - `src/pages/about/index.astro`
   - `src/pages/index.astro`
   - `src/pages/world/[slug].astro`
   - `src/lab/world/areas/PoiArrival.ts`
   - `src/lab/world/city/CityBlocks.ts`
   - `src/lab/world/city/CityMap.ts`
6. **E2E 测试用例**
   - `e2e/about-hall.spec.ts`
   - `e2e/cyber-city-poi-arrival.spec.ts`
   - `e2e/cyber-city-lookaround.spec.ts`
   - `e2e/cyber-city-minimap.spec.ts`
   - `e2e/cyber-city-explore.spec.ts`
   - `e2e/mobile.spec.ts`
   - `e2e/site-health.spec.ts`
7. **交付凭据与回执**
   - `evidence/about-hall/W1h/RECEIPT.md`
   - `evidence/about-hall/T1b/RECEIPT.md`
   - `evidence/about-hall/QE/RECEIPT.md`
   - `evidence/about-hall/GATE.json`
