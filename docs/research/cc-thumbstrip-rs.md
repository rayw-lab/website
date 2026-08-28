# CC-THUMBSTRIP-RS · 楼卡缩略条（NAV-C1.5）调研——目标体验 / HUD 共存 / 默认 OFF / 文件域 / 断言 / 禁区

- **角色**：CC-THUMBSTRIP-RS（R5 调研末位单，纯 docs）。缩略条已由董事会 R5 裁定 = **NAV-C1.5，并入 NAV v1.5、不独立立项**（[#158](https://github.com/rayw-lab/website/pull/158) §B）；本单为其实现前的收尾调研，**实现后置 W-R5-2**。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **纪律**：零 `src/` 改动、零实现代码、零视角旋转内容；文件域 = 仅本文档；base = main@`3fe7c5f`。
- **取证窗口**：2026-08-28 15:32–15:55 UTC。证据全部一手：仓内源码逐文件读取 + `git show origin/cursor/cc-nav-c1-minimap-8ca4`（NAV-C1 在途 [#166](https://github.com/rayw-lab/website/pull/166)，tip `5faab5f`）+ `gh` 实测（仓库规范 slug = `rayw-lab/website`，`gh repo view` 输出）。
- **修订（2026-08-28，Codex 事后评 P2×3 落板，NAV-C1.5 实现前生效）**：① r3881991523 方向键选楼断言 → §5-S5 / §6.1-门2；② r3881991516 触控断言路由（world-chromium 无触点、mobile-375 不匹配本 spec）→ §5-S8 / §4 文件域；③ r3881991528 默认态「逐像素一致」与 header 切换钮可见的矛盾消解（改口径：恒等主张收窄 + 可见增量登记在案）→ §3.2 / §5-S6 / §6.1-门5。
- **修订（2026-08-28，Codex 合前审 P2 落板）**：r3882091609——S8 默认路线补 `baseURL` 保真：`browser.newContext()` 手建 context **不继承** Playwright Test 的 `use.baseURL`，而 world specs 用 `u('/')` 导航、只产出根相对路径 `/website/`（`e2e/helpers.ts` 实测，baseURL 仅含 origin），缺 baseURL 时相对导航会**先于任何触控断言**报错。新口径：newContext 必须显式传入与 `playwright.config.ts` `use.baseURL` 同源的 `baseURL`（现成 `baseURL` fixture 直通，禁另写死），或改绝对 URL 导航，或走触控 project 备选（配置继承天然带 baseURL）。落点 = §5-S8 + §4 文件域 e2e 行。

---

## 0. 上游定谳链（不重复裁决，只登记依据）

| # | 定谳 | 出处 |
|---|------|------|
| U1 | 缩略条优先级末位（音效＞小地图＞旋转＞BGM＞缩略条）；**并入 NAV v1.5 不独立立项**——「小地图面板内的楼卡缩略条（12 楼横滑卡片，点击 = 同小地图进楼语义），避免两套导航 UI 分裂心智」 | R5 终裁 §B（`cc-loop-board-advisor-r5-product-audio-nav.md`，[#158](https://github.com/rayw-lab/website/pull/158)） |
| U2 | 波次：**W-R5-2 增强波，base = NAV-C1 合流后，单 PR 追加，禁并**（与 CAM-ROT-C1 / BGM-C1 各自单 PR、归因隔离）；文件域 = 「ui/ 面板内部 + 楼卡缩略资产」，禁入区同 NAV-C1 | R5 §B 波次表 + 文件域表 |
| U3 | **DP-2 默认值已定**（非阻塞裁量）：v1 零缩略资产；**v1.5 若需图矢量图标优先**；楼卡截图仅指挥官明确要「真实楼景」质感才走（体积入账 + 单 PR 归因 + 重拍排批次最后）；指挥官可事后改判，改判走 NAV-C1.5 单 PR | R5-impl-gate B-4 / F-4（`cc-loop-board-advisor-r5-impl-gate.md`，[#163](https://github.com/rayw-lab/website/pull/163)） |
| U4 | NAV-C1 预留三件（v1 落结构、v1.5 只加呈现）：① 面板底部槽位；② 进楼语义单源 `teleportTo(buildingId)`；③ 楼卡 v1 可零缩略资产（neonColor 色块 + 双语楼名 + district 标签）。反向约束：**不做独立 HUD 常驻件**；截图缩略批拍不得动既有像素基线 | NAV 调研 §4（`cyber-city-minimap-nav-survey.md`，[#162](https://github.com/rayw-lab/website/pull/162)） |
| U5 | **NAV-C1 在途实况**（[#166](https://github.com/rayw-lab/website/pull/166) draft，tip `5faab5f`，本单开工时未合流）：`[data-world-minimap-dock]` 空槽已落（`ensurePanel()` 懒初始化内、`dock.hidden = true`、样式仅 `min-height:0`）；`teleportTo()` 为公开方法且注释明言「NAV-C1.5 楼卡缩略条与 pin 共用本入口」；埋点白名单 41 type / 10 族（已并入 #164 AUD-C1 的 `world-audio`）；e2e = `cyber-city-minimap.spec.ts` CITY-NAV-01/02/03 | `git show origin/cursor/cc-nav-c1-minimap-8ca4` 逐文件核验 |

**本单边界**：以 #166 当前形态为事实基线；NAV-C1 段末审计若改 dock/`teleportTo` 形态，本单 §4/§5 按 §8 开工前复核清单校订，不在本单预判。

---

## 1. 目标体验

### 1.1 一句话定义

小地图面板（`[data-world-minimap]`）底部的**可开关横滑楼卡区**：12 张楼卡（在册楼 = buildings JSON `parkingBay` 计数 12，districts 序展平——与 pin Tab 序同源），点击/Enter = **与 pin 完全同一进楼语义**（`teleportTo()` 单源：传送至该楼 parkingBay → 关面板 → boundingIn 天然入账 → E 确认进站，两段式 DP-1 照常）。

### 1.2 为什么在 pin 之外还要卡（体验缺口一手核验）

| 缺口 | 现状证据（#166 源码） | 楼卡的补法 |
|------|----------------------|-----------|
| pin 可读性受限 | pin 楼名 zh 0.58rem / en 0.48rem；62vmin 面板上四角楼群（±28m 网格）pin 相邻拥挤 | 卡片为等宽列表排布，楼名/职能字级不受地图空间约束 |
| 职能信息不可见 | pin 的 `role` 一句话职能只进 `aria-label`（读屏可达、明视不可见） | 卡面直接呈现 role 摘要——「这楼是干什么的」变成可浏览信息 |
| 线性浏览缺失 | pin 按空间散布，找特定楼需全图扫描 | 横滑卡列 = districts 分组的线性目录，触屏滑动友好 |

**分工口径**：pin 管「在哪」（空间定位），楼卡管「是什么」（语义浏览）；两者激活语义严格同一（U1「不分裂心智」的实现面表达）。

### 1.3 呈现三形态（对应 DP-2，默认值已定 U3）

| 形态 | 卡面构成 | 资产字节 | 裁决状态 |
|------|---------|---------|---------|
| **v1.5a 零资产卡（默认路径）** | neonColor 色块条/描边 + 双语楼名 + district 标签 + role 一句话——全部 buildings JSON 现成字段 | **0** | 即刻可做，无需任何新裁决 |
| v1.5b 矢量图标卡 | v1.5a + 每楼一枚内联 SVG 图标（数 KB 级、主题色随 JSON 单源） | ~0（内联） | DP-2 明示「若需图矢量优先」，可与 v1.5a 并档评估 |
| v1.5c 楼卡截图 | 12×webp 真实楼景缩略 | 双位数 KB×12 起 | **仅指挥官点名「真实楼景」质感才走**；连锁义务见 §6 风险 R3 |

本单建议实现波按 **v1.5a 起步**：交付最小、体积零入账、且卡面字段全为 JSON 单源（加楼 = 改 JSON 自动上卡，AP-8 纪律同构）。

---

## 2. 与驾驶 HUD 共存

**总原则**：缩略条**永远活在小地图面板内部**（U4 反向约束「不做独立 HUD 常驻件」），因此与驾驶 HUD 的共存关系几乎全部**继承 NAV-C1 已裁定的非模态面板合同**，v1.5 只引入一个新变量：面板垂直高度。

### 2.1 继承面（NAV-C1 合同，零新裁决）

| 共存对象 | 既有合同（#166 实况） | 缩略条增量 |
|---------|----------------------|-----------|
| 驾驶键盘输入 | 面板非模态：开态不吞驾驶键、不暂停 Ticker（「驾驶意图至上」红线）；Esc capture 段吞键防壳菜单双响 | 零——卡为原生 button，Enter 激活已被面板 capture 段 stopPropagation 护住（不触发 poiInteract 双响） |
| DriveFeedback 反馈条（z5：顶部 chip 列 / 底部 BOOST·BRAKE 徽标行 bottom 6.4rem / 全屏暗角） | minimap root z6 压在其上；面板 `pointer-events:auto` 接管，反馈层 `pointer-events:none` 全穿透 | 零——dock 在面板内，不新增屏上常驻元素 |
| WorldAudio 静音钮 / minimap「地图」钮（右上角） | 两钮同窗并存已由 #164/#166 各自落位 | 零 |
| QuestLine / ExploreProgress chip | chip 全穿透层，面板压其上 | 零 |
| 触屏 Nipple 摇杆热区 | NAV 调研 R7 已裁：面板半屏 + 底部让位摇杆区 | **有增量**：dock 使面板变高，小屏垂直预算见 §2.2 |
| debug 面板（z40） | 面板之上，不受影响 | 零 |

### 2.2 v1.5 唯一新共存变量：面板高度

- #166 面板 `max-height:min(78vh, 42rem)`、board 为 `aspect-ratio:1` 的主位块；dock 现为 `min-height:0` 空槽。
- 缩略条落地后 dock 约 +5–6rem（单行横滑卡高）。**约束**：dock 高度进入 78vh 预算后，**不得把 board 压缩出可用域**——横向优先（`overflow-x:auto` 单行横滑、垂直固定高），禁纵向多行网格；短屏/小屏（≤820px 已有断点）如仍溢出，备选 = 小屏默认强制 OFF（§3 默认 OFF 语义天然兜底）。
- 移动端摇杆让位：面板 `top:40%`（小屏断点）现状已为底部留区；dock 属面板内部，不越出面板框，摇杆热区结论不变。

---

## 3. 默认 OFF（本单已定口径，非裁量位）

### 3.1 规格草案

- **缺省态 = OFF**：dock 维持 `hidden`（#166 现状即 OFF，v1.5 只是让它「可开」）；
- **开关入口**：面板 header 内「楼卡」切换钮（`aria-pressed` 语义；紧邻「关闭」钮），触屏/键盘/指针三通道同权；**不新增键位**（M/Esc 键位面不动，键位卡 HINT_TEXT 零改——避开 R6 文案断言连锁）；
- **偏好记忆**：localStorage 跨会话（键名草案 `world-minimap-dock-v1`，`'1'` = 开、缺省/其他 = 关）——QuestLine `world-quest-collapsed-v1` / WorldAudio `world-audio-muted` 同款先例；localStorage 不可用时静默降级为会话内记忆（ExploreProgress 先例）；
- **埋点随行**：ux 族 +1 `minimap-dock-toggle {on}`（观测规格 §3.4 随行加法，41→42 type / 10 族）；楼卡点击**复用** `minimap-teleport`（零新传送 type，§6 风险 R2）。

### 3.2 为什么默认 OFF（三条法理）

1. **归因隔离（恒等主张精确化，Codex r3881991528 消解）**：旧表述「面板默认外观与 v1 逐像素一致」**撤回**——面板开态 header 新增「楼卡」切换钮（`aria-pressed=false`，§3.3 矩阵）在默认偏好下**必然可见**，开态面板做不到逐像素恒等，二者矛盾以**改口径**消解（保留 header 钮呈现；「默认态零新可见控件」备选被否——钮藏进 dock 内会造成「关着的东西装着自己的开关」死锁）。恒等主张收窄为：**poster / robot_idle / 面板关闭态逐像素恒等**（钮活在面板内部，面板 hidden 即零可见增量）；**面板开态 header 切换钮 = 登记在案的唯一可见增量**。零基线联动之所以仍成立：现行 visual 基线仅 VIS-01/02 两帧 reduced-motion 拦截态壳截图（`e2e/visual/world-visual.spec.ts` 唯二 `toHaveScreenshot`，本单实测），**不含任何面板开态帧**；CITY-NAV-01/02/03 为行为断言不截图，期望零改。**连锁义务**：若实现窗前基线族新增「面板开态」帧，该基线随 NAV-C1.5 PR 更新并单独归因（diff 应限 header 区域），§5-S6 同步改写。若 v1.5 破门回退，删钮即净、零迁移成本（W-R5-2「归因隔离」的实现面表达）。
2. **面板信息密度与小屏预算**：62vmin 地图 board 是面板主位，默认再挂 12 卡会推面板逼近 78vh 上限（§2.2）；默认 OFF 让增强项只对主动选择者付高度成本。
3. **「不分裂心智」的延伸**（U1）：默认形态维持 pin 单一导航面；楼卡是浏览增强，不是第二套默认导航。

### 3.3 状态矩阵（呈现合同草案）

| 态 | 切换钮 | dock | 依据 |
|----|--------|------|------|
| robot_idle / transforming | hidden（整层） | hidden（整层） | DP-3 三重保险全继承：categories 闸门 + `[data-world-state]` 样式门 + 懒初始化（dock 构建仍在 `ensurePanel()` 内，robot_idle 帧零 DOM） |
| driving · 面板关 | 不存在于屏上（面板 hidden） | 同左 | 面板既有合同 |
| driving · 面板开 · 偏好缺省 | 可见，`aria-pressed=false` | **hidden（默认 OFF）** | 本单 §3.1 |
| driving · 面板开 · 用户开启 | `aria-pressed=true` | 12 卡可见、横滑可达 | 同上 |
| reload 后 | 还原上次偏好 | 同左 | localStorage 记忆 |
| reduced-motion | 同上 | 展开/收起直切 0.01ms | §D 硬门 3 |

---

## 4. 文件域草案（NAV-C1.5 单 PR）

**PR 形态**：单 PR，base = **NAV-C1 合流后的 main**（U2；#166 未合流前禁开工）；W-R5-2 三件（CAM-ROT-C1 / BGM-C1 / NAV-C1.5）**禁并**。

| 类别 | 文件 | 改动性质 |
|------|------|---------|
| 触碰 | `src/lab/world/ui/Minimap.ts` | dock 填充（卡列构建入 `ensurePanel()`）+ header 切换钮 + 偏好读写 + 样式追加；`teleportTo()` **零改动纯复用**。预估 +100–150 行（DriveFeedback 单件同量级下限） |
| 触碰 | `src/lab/world/core/SessionTimeline.ts` | ux 族白名单 +1（`minimap-dock-toggle`），41→42 type / 10 族 |
| 触碰 | `docs/spec/cyber-city-observability.md` | §3.4 随行加法一行 + 总数修订 |
| 触碰 | `e2e/cyber-city-minimap.spec.ts` | 追加 CITY-NAV-04（§5 断言集）；S8 触控断言按 §5-S8 路由口径**在 spec 内显式建 touch context 且必传 `baseURL`**（默认路线，零 config 改动；手建 context 不继承 `use.baseURL`，`baseURL` fixture 直通——r3882091609）；既有 01/02/03 期望零改 |
| 仅 S8 走「触控 project」备选路线才有 | `playwright.config.ts` | 新增触控 world project 并接入串行 dependencies 链（§5-S8 备选；默认路线不触碰本文件） |
| 仅 v1.5c 才有 | `public/` 楼卡缩略 webp ×12 + 批拍工序 | **默认不做**（U3；触发即背 §6-R3 全部连锁义务） |
| **禁入** | `src/lab/world/view/View.ts`、`view/CameraShots.ts`、`src/data/camera-shots.json`、`inputs/`（Pointer/Keyboard/Nipple/RayCursor）、city 几何、`physics/`、`world/Respawns.ts`、`areas/PoiArrival.ts`（`cancel()` 已在 #166 落好，零再改）、壳 `src/pages/index.astro`、`world/Reveal.ts`（不新增键位则 HINT_TEXT 零改） | 出现任何此列 diff = 越权，审计即卡门 |

**CAM 红线专项声明**：缩略条与相机零关系——传送后镜头 = respawn 既有跟随，零 view 改动；任何「传送后环视/机位展示」念头都属 CAM-ROT 域（红线修订案 `CC-CAM-ROT-DES` 未签字前该域整体冻结），本件**绝对禁触**。

---

## 5. 验收断言草案（沿 NAV 调研 A 系语感，编号 S 系；落 spec 时并入 CITY-NAV-04）

| # | 断言 | 口径 |
|---|------|------|
| S1 | 默认 OFF：driving 态开面板 → `[data-world-minimap-dock]` hidden、切换钮 `aria-pressed="false"` | DOM 属性 + 可见性 |
| S2 | 开关闭环：点切换钮 → dock 可见且楼卡数 = buildings JSON 楼数（12，读 JSON 断言勿写死亦可）→ 再点关；`minimap-dock-toggle {on}` 入 `__worldSession.dump()` 白名单且 seq 有序 | 交互 + OBS 合同 |
| S3 | 偏好持久：开 dock → reload + 重进 driving → 开面板 dock 即开；清 localStorage 回落 OFF | 跨会话记忆 |
| S4 | 楼卡 = pin 同语义：卡点击 → `__worldSpike.state()` x/z 距目标 parkingBay ≤ radius + `minimap-teleport {id}` 入 dump + 面板关 + E → `world-poi:{id}` 路由链照常（CITY-NAV-01 A4 同构，零新传送事件） | 遥测 + 埋点 seq 序 |
| S5 | 键盘可达 = **Tab + 方向键双通道**（R5 §D 门 2 明文「Tab/方向键选楼」，Codex r3881991523 补洞）：Tab 可达切换钮与卡列、Enter 激活 = 点击同语义；**方向键选楼**——焦点在卡上时 ←/→ 在 12 卡间移焦、Home/End 首尾直达（断言实按 ArrowRight/ArrowLeft 后 `toBeFocused` 落相邻卡）。实现口径：建议 roving tabindex（卡列整体单 Tab 停靠点，免 12 连 Tab 稀释）；**←/→ 同时是驾驶转向键**（`Player.ts` 实测 `Keyboard.ArrowLeft/Right` 入 driving 绑定）——焦点在卡列内时方向键须由面板 capture 段吞掉（#166 对焦点在面板内 Enter 的 stopPropagation 先例同构，§6.3-R7），焦点在面板外驾驶照常；方向键为控件内焦点移动、非全局新键位，M/Esc 键位面与 HINT_TEXT 仍零改（§3.1 口径不破）；卡 `aria-label` = 楼名 · role | 焦点断言（含方向键实按） |
| S6 | 恒等门（§3.2 精确化口径）：robot_idle 按 M 零反应/零面板 DOM（A5 继承）+ 现行 `e2e/visual` 基线不动（VIS-01/02 拦截态壳帧，不含面板开态）+ poster 逐字节恒等；**面板开态不主张逐像素恒等**——header 切换钮 = 登记在案的唯一可见增量（若届时基线族已含面板开态帧，则按 §3.2 连锁义务随 PR 更新该基线并单独归因） | 恒等回归 |
| S7 | reduced-motion：dock 展开/收起直切（零 transition 等待即达终态） | emulateMedia |
| S8 | 触屏：dock 横滑可滚、卡点按传送、卡热区 ≥44px。**路由口径（Codex r3881991516 补洞，禁假定既有 project 覆盖）**：`playwright.config.ts` 实测 world-chromium = Desktop Chrome 无触点（96–103 行）、mobile-375 只匹配 `mobile.spec.ts`（66–72 行），本 spec 天然跑不进任何触控项目。**默认路线** = 在 `cyber-city-minimap.spec.ts` 内显式 `browser.newContext({ hasTouch: true, isMobile: true, viewport: 375×667, baseURL })` 建触控 context 跑 S8，其中 **`baseURL` 必传**（Codex r3882091609 补洞：手建 context **不继承** `use.baseURL`，world specs 的 `u('/')` 只产出根相对路径 `/website/`，缺 baseURL 时相对导航先于任何触控断言报错；取值直通测试入参 fixture——`async ({ browser, baseURL }) =>`——与 `playwright.config.ts` `use.baseURL`（`http://127.0.0.1:$E2E_PORT`）同源单源，禁另写死端口；不便传 fixture 时改绝对 URL 导航等价）（留在 world-chromium 串行链内、零 config 改动、不破 3D 独占纪律）；**备选** = 新增触控 world project 接入串行 dependencies 链（project 走配置继承、天然带 `use.baseURL`；须把 `playwright.config.ts` 纳入 §4 文件域） | 触屏等价（显式 touch context） |
| S9 | 既有回归：CITY-NAV-01/02/03 期望零改；全量 0 failed / 0 skipped / 0 flaky（现行全量口径单源 `cyber-city-test-framework.md`；全量窗按登记空档执行） | 恒等门 |

---

## 6. 六门八禁对齐 + 风险禁区

### 6.1 硬门六条逐门落点（R5 §D）

| 门 | 缩略条落点 |
|----|-----------|
| 1 e2e 全量 0/0/0 + 新增最低集 | §5 S1–S9 即为本件最低集；全量窗互斥硬令照抄（R1 §3.5） |
| 2 无障碍 | 切换钮 `aria-pressed` + 可聚焦；卡 = 原生 button（Enter/Space 免费）+ `aria-label`；焦点还原继承面板既有合同；键盘全等价 = **Tab + 方向键选楼双通道**（S5：←/→ 卡间移焦 + Home/End，roving tabindex；R5 原文口径） |
| 3 reduced-motion | dock 展开直切（S7）；**禁横滑自动轮播/scroll-behavior:smooth 类持续动效** |
| 4 autoplay 政策 | 不涉及——本件零音频面，零 AudioContext 交互（声明即合规） |
| 5 poster / 恒等 | 懒初始化 + 双态 hidden 全继承（§3.3）；v1.5a/b 零像素资产；恒等边界 = §3.2 精确化口径（poster/关态恒等；**开态 header 增钮为登记在案可见增量、不主张开态逐像素恒等**）；v1.5c 才有批拍且**禁动既有像素基线**（U4） |
| 6 LHCI + 体积 | v1.5a/b 零资产零新请求（样式随 world 分包内联注入，壳静态段零字节）；`/`、`/home/` 渲染路径零涉及；v1.5c 12×webp 体积入账**前置审** |

### 6.2 禁项八条逐条声明

| 禁 | 本件状态 |
|----|---------|
| ① GPL/无许可音源 | 不涉及（零音频） |
| ② pointer-lock / 自由漫游相机 | 不涉及且**明示禁入**（§4 CAM 声明；本调研亦零旋转内容） |
| ③ BGM 自动有声 | 不涉及 |
| ④ 改默认机位常量 | `view/`、`CameraShots.ts`、camera-shots.json 全在禁入列 |
| ⑤ 跑道并发 | 全量 e2e 窗按登记空档执行；W-R5-2 三件禁并（U2） |
| ⑥ 自评入登记 | 本单 docs-only 零分数产出；实现波如附视觉自评仅作诊断（已知坑：自评系统性偏乐观 ~2 分） |
| ⑦ CITY-03 循环配额 ≤3 席 | dock 零 infinite 关键帧；开合为一次性事件驱动（面板 pop 同款）；禁卡片 marquee/呼吸灯 |
| ⑧ 执行中扩批 | 实现范围 = §4 清单封顶；pin 详情面、「直接进站」次级动作、v1.5c 截图等一律不顺手带 |

### 6.3 风险禁区表

| # | 风险 | 缓解 / 禁令 |
|---|------|------------|
| R1 | **CAM 红线渗透**：为楼卡加「预览机位」「传送后环视」类点子 | 绝对禁区——CAM-ROT 域冻结中（签字门 + X2 链 + AL-VIS 后才开）；本件与相机零耦合，出现 view/ diff 即卡门 |
| R2 | **埋点语义漂移**：为楼卡另开传送 type，或改 `minimap-teleport` 既有 payload | 复用 `minimap-teleport` 零改；开关另开 `minimap-dock-toggle`。如实现波确需来源区分，走「可选字段 via:'pin'|'card'」+ 观测规格随行修订（本单建议**不加**，保持事件面最小——§8-D3） |
| R3 | **v1.5c 截图连锁**：体积入账 + 固定机位批拍 + 像素基线联动 + 重拍排期 | 默认不触发；触发条件 = 指挥官点名（U3），且必须单 PR 独立归因 + 重拍永远排批次最后（已知坑总表） |
| R4 | 小屏面板高度溢出：dock + board + 78vh 预算冲突 | 单行横滑固定高、禁纵向网格；仍溢出则小屏默认强制 OFF（§2.2） |
| R5 | **NAV-C1 形态漂移**：#166 未合流，段末审计可能改 dock/`teleportTo`/白名单形态 | 本单 §4/§5 以 tip `5faab5f` 为准；开工前按 §8 清单 5 分钟复核，漂移则先校订任务书再开工 |
| R6 | SessionTimeline 白名单 / observability §3.4 三 PR 连环加法冲突（AUD-C1 时已实证——#166 tip 本身就是解 #164 冲突的 merge） | 后合者承担试合并 + 合流树冒烟；白名单串按既有序插入 |
| R7 | 面板开态 Enter 双响（poiInteract 同键） | #166 capture 段 stopPropagation 已护住焦点在面板内的 Enter；楼卡为面板内 button 天然被覆盖，S4/S5 断言锁死 |

---

## 7. 避坑短节（实现波必读）

1. **dock 构建时机**：卡列构建必须留在 `ensurePanel()`（懒初始化）内——挪到构造期 = robot_idle 帧出面板 DOM，poster 逐字节恒等直接破门（DP-3 三重保险第③条的存在理由）。
2. **`hidden` 语义保真**：#166 的 dock 用 HTML `hidden` 属性控显隐；v1.5 若改用 class 切换，必须保留 `hidden` 属性语义（e2e `toBeHidden()` 口径 + `[hidden]{display:none}` 既有样式约定）。
3. **白名单热点文件**：`SessionTimeline.ts` 白名单串与 `cyber-city-observability.md` §3.4 是连环加法热点，NAV-C1.5 落地时后合者试合并 + 冒烟必做（文本零冲突 ≠ 语义零冲突）。
4. **e2e 内读 JSON 用 `readFileSync`**（Node 22 ESM import 断言坑，范式手册 §3.5）——S2 若读 buildings JSON 断卡数照此。
5. **PR/run 链接以 `gh` 实际输出为准**：本仓 remote 显示旧名 `rayw-lab/mywebsite`（重定向），规范 slug = `rayw-lab/website`（`gh repo view` 实测）——文档链接一律用后者。
6. **禁自动滚动**：dock 横滑容器 `overflow-x:auto` 与输入面零冲突（wheel 全仓未占用、Pointer 挂 canvasElement、面板 `pointer-events:auto` 已接管），但禁加 smooth 自动滚位/轮播——reduced-motion 例外面 + CITY-03 精神。
7. **视觉自评校准**：如实现波附自评，按已知坑 -2 分校准预期；专项门以审计独立分为准。
8. **poster 类重拍永远排批次最后**（仅 v1.5c 触发时适用）。

---

## 8. 开工前复核清单（NAV-C1.5 任务书附件）+ 裁量位

**开工前 5 分钟复核**（对 NAV-C1 合流终态）：① 合流 SHA 与 `5faab5f` 的 `Minimap.ts` diff（dock/`teleportTo` 形态）；② 白名单 type 总数（本单按 41→42 预估）；③ CITY-NAV-01/02/03 断言文案是否有审计改动；④ W-R5-2 序位——CAM-ROT-C1 / BGM-C1 是否在途（禁并窗）。

**遗留裁量位（供实现波任务书定稿，均有本单建议默认值）**：

| # | 裁量 | 本单建议 |
|---|------|---------|
| D1 | 呈现形态 v1.5a（零资产卡）/ v1.5b（矢量图标）/ v1.5c（截图） | **v1.5a 起步**；v1.5b 可同 PR 并档评估；v1.5c 仅指挥官点名（U3 原文） |
| D2 | 偏好记忆粒度：会话内 vs localStorage 跨会话 | **跨会话**（QuestLine/WorldAudio 先例；不可用静默降级） |
| D3 | `minimap-teleport` 是否加 `via:'pin'|'card'` 来源字段 | **不加**（事件面最小；来源可由 dock-toggle 态间接推断）；如加则观测规格随行修订 |

---

*本文档为 CC-THUMBSTRIP-RS 交付物（R5 调研末位，docs-only）；实现后置 = W-R5-2 NAV-C1.5（单 PR、base = NAV-C1 合流后、禁并）；上游定谳以 [#158](https://github.com/rayw-lab/website/pull/158) §B/§C/§D 与 [#163](https://github.com/rayw-lab/website/pull/163) B-4/F-4 为准，#166 形态以合流终态复核为准。*
