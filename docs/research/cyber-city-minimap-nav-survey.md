# CC-NAV-RS · M 键小地图 / 城市导航调研（folio Map.js 复用性核验 + NAV-C1 交付底稿）

- **角色**：CC-NAV-RS（W-R5-0 调研波，R5 终裁 §C 第三单；docs-only，交付即用）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **纪律**：零 `src/` 改动；独立 worktree `/home/ubuntu/worktrees/nav-survey`；base = main@`467d148`（#159 已合）；文件域 = 仅本文档。
- **取证窗口**：2026-08-28 09:50–10:10 UTC。证据全部一手：仓内源码逐文件读取 + `rg` 键位占用复证 + folio `Map.js` 按 vendor/README 登记 commit `41046b5` 从 GitHub 原文重取（192 行逐行核验，vendor/ 本地未 clone 不影响）。
- **上游定谳（不重复裁决）**：优先级 音效 > **M 小地图** > 旋转 > BGM > 缩略条（R5 §B）；小地图立项依据 = GAP-12 POI 发现性 P0（`cyber-city-gameplay-gap-audit.md`）；实现窗 = W-R5-1 NAV-C1（base = post-#129 main，与 AUD-C1 并行）。

---

## 1. 现仓库城市导航 / 进楼 / 楼宇选择既有实现盘点

### 1.1 进楼动线（已闭环，但全部近距离触达）

| 环节 | 现状 | 源码锚点 |
|------|------|---------|
| 触达判定 | 12 楼各有 parkingBay 触发圈（半径 6m，concept-garage 8m；`game.zones` 圆柱纯距离检测，零物理资源）+ 泊车霓虹光圈（楼色、常亮不占循环配额）+ 标点（楼名双语 + E 键帽） | `Areas.ts` 装配段 · `cyber-city-buildings.json` parkingBay |
| 进站三通道 | ① **E/Enter** 键（`poiInteract` 动作，keys 由 `world-pois.json` interaction 注入，categories `wandering/driving`）；② **点按标点**（RayCursor 球形命中半径 1.1×1.7m，触屏的「进入」等价键）；③ 悬停标点展开 + 点按 | `InteractivePoints.ts` setInputs/addIntersect |
| 进站前奏 | E/点按 → `world-poi` 埋点（交互帧即打）→ PoiArrival：0.8s tween 至 `poi_showcase-*` 机位 + 0.4s 定帧 → `location.assign(deepLink)` 硬跳；**驾驶输入同帧中断**（RELEASE_ACTIONS 单源）；reduced-motion 直切定帧；无 showcase 条目楼直跳 | `PoiArrival.ts` · `CameraShots.ts` L95 |
| 深链 | `?poi=slug` 出生点改写至对应楼 parkingBay + 光圈提亮；`?shot=id` 机位深链（仅与 poi 组合） | `Areas.applyDeepLink` · `index.ts` |

**回答任务问句「点击进楼？」**：有，但只有**点标点**这一种点击语义——楼体本身（ThemeTowers/HeroBlenderMesh）不挂 RayCursor 命中体，不可点；标点出画即 frustum 隐藏、远距离为 CONCEALED 小菱形。即**不存在任何远程「选楼」手段**，这正是 GAP-12 P0 的实体：无罗盘/距离/小地图，最近 bay 距出生约 30m，玩家 2 分钟内可能一个触发圈都撞不进。

### 1.2 楼宇选择 / 导航辅助面（现有五件）

1. **QuestLine「下一站」chip**（五站城区序主链：目标站光柱 + 光圈提亮 + idle-30s nudge；非强制可折叠）——`areas/QuestLine.ts`；
2. **ExploreProgress n/12 chip**（boundingIn 首次发现计数，localStorage 跨会话）——`areas/ExploreProgress.ts`；
3. **壳页 DOM 导航**：`hud-city` 5 楼快览 + `city-nav` 12 楼列表（真实 URL 硬跳，永不进 3D）——`src/pages/index.astro`；
4. **Esc 菜单**：壳级原生 `<dialog>`（showModal 焦点陷阱），`window keydown Escape` 开合 + `preventDefault`——`index.astro` L379-391；
5. **R 复位**：Respawns 注册表**仅 1 点**（'landing' 十字路口），`getClosest` 退化单点（GAP-15 在案）。

### 1.3 V 键与键位占用（一手 `rg` 复证）

- **V 键已占用**：`toggleDriveView`（third ↔ fpv 硬切，categories 仅 `driving`；`Player.ts` L161），CC-VEH-VIEW/C2 已落地——含 `data-drive-view` DOM 镜像、fov 遥测、respawn 视角记忆、reduced-motion 下保留硬切。PUBG 语义中 V=视角、**M=地图**，两键分工与本站规划完全同构；
- **M 键未占用**：`rg 'KeyM'` 全 src 零命中（R5 F6 复证成立）。既有键位面 = W/A/S/D/方向键、Shift、Space/B/Ctrl（刹车）、V、F（悬挂跳）、R、E/Enter、H/?（键位卡）、Esc（壳菜单）。M 入位无冲突；
- **动作注册机制**：本站 Inputs 为 folio 同架构移植，运行期 `inputs.addActions([{name, categories, keys}])` 即接入，`Keyboard.ts` 本身零改动——**比 R5 §B 文件域表预估（inputs/Keyboard.ts +1）更正交**，M 动作注册落在 Minimap 模块内即可。

### 1.4 质量降帧（R5 已裁「保留背书、零动作项」，此处只盘交互面）

- Quality 三档 0|1|2（`?quality=` 显式深链 + UA 分档缺省）；[CC-PERF-C2-B1] O1 自动降档：driving 态 avg<30 或 low1<20 持续 3 设计秒 → 降一档，20s 冷却、只降不升，`qualityDropToast` 确认 + `quality-auto-drop` 埋点（`index.ts` L299-423）；
- **对小地图的含义**：DOM/canvas 2D 面板不进 WebGPU 管线，与降档零联动；需遵守的是①玩家标记更新走 0.25s HUD 节拍或整米去抖（勿逐帧写 DOM）、②开合动画一次性事件驱动（CITY-03 循环配额 ≤3 席不破）。

---

## 2. folio `Game/Map.js` 复用性核验（一手源码 @`41046b5`，192 行）

结构速写：M 键/触发钮 → Modals 打开全屏地图 → 位图底图（day/night webp）+ 12 个硬编码 location pin（DOM 绝对定位）→ pin 点击 = `player.respawn(respawnName)` 传送 + 关面板；玩家标记 tick order 14 逐帧更新（整米去抖 + 面板关闭即 return）。

### 2.1 可复用点（模式级重写为 TS，共 6 条）

| # | folio 原文 | 本站落法 |
|---|-----------|---------|
| P1 | M 键动作 `inputs.addActions([{name:'map', categories:[...], keys:['Keyboard.m','Keyboard.KeyM']}])`（L139-141） | 语法照搬（Inputs 同架构）；categories 收敛为 `['driving']`——robot_idle/transforming 被 intro 闸门物理拦截，与 hintToggle/toggleDriveView 同纪律 |
| P2 | `worldToMap` 线性投影：`world/size + 0.5, clamp(0,1)`（L154-169，~15 行） | 直接照搬；size 取 buildings JSON roads range（±260m）+ 边距的世界边长常量 |
| P3 | pin 点击 = 传送 + 关面板（L80-87） | 同语义；落点换算复用 `Areas.applyDeepLink` 的 parkingBay→position/rotation 式（heading 换算已单源） |
| P4 | pin 数据驱动（folio 用硬编码数组 + respawns.getByName） | 升级为纯数据派生：`cyber-city-buildings.json` 一站给齐 id/双语楼名/neonColor/parkingBay/district——`CityMap.ts` 头注明言「2D 降级地图」本就是该 JSON 的派生目标，**数据面零新增** |
| P5 | 玩家标记更新纪律：`Math.round` 整米去抖 + `if(!modal.isOpen) return` + tick order 14（L171-192） | 照搬三条；朝向用 `player.rotationY`（folio 用 physicalVehicle.yRotation，本站 Player 已抽象） |
| P6 | 懒初始化：首次 open 才 `init()` 建 pin（L17-23） | 照搬——面板闭着零成本，且天然满足 poster 恒等（robot_idle 期零 DOM 构建） |

### 2.2 不可复用点（共 7 条，其中 3 条必须新写）

| # | folio 原文 | 不可复用原因 → 本站替代 |
|---|-----------|------------------------|
| N1 | 位图底图 `map-day/night.webp`（1.4–1.6MB/张；teardown §8 点名体积反面教材） | **程序化底图**：canvas 2D（或内联 SVG）由 buildings JSON 绘两条道路带 + 12 楼 footprint 矩形（neonColor 描边）——零资产字节，加楼 = 改 JSON 自动上图（AP-8 单源纪律） |
| N2 | `game.modals` 依赖（Modals.js 204 行未移植，🔶 骨架件） | DOM 注入面板（Reveal/DriveFeedback/ExploreProgress `injectStyles` 先例）；**建议非模态**（§3.2），不引入 Modals 整件 |
| N3 | `dayCycles` 昼夜双图切换（L111） | 本站无昼夜循环，整段删 |
| N4 | `terrain.size` 依赖 | 换 roads range 派生常量（P2） |
| N5 | `.js-map-trigger` 壳 DOM 钮 + keydown preventDefault quirk | 触发钮由引擎注入 stage（recallBtn 同层同窗），不依赖壳静态 DOM |
| N6 | 传送后 `view.focusPoint.isTracking = true` 相机接管（L84） | 本站 respawn 即恢复跟随，无需相机补丁；但需处理 shot 在途竞态（§5.3-R3） |
| N7 | **零无障碍/零 reduced-motion**：pin 是 div+click，无 focus/aria/键盘通道 | 必须新写（§D 硬门 2/3）：键盘可达性方案见 §3.4——这是对 folio 的净增量，不是移植 |

**结论**：folio Map.js 的**交互骨架（M 键/传送语义/标记更新/懒初始化）全部可复用**，约 60% 逻辑照搬式重写；**呈现层（底图/模态容器）全部换程序化方案**；无障碍层从零新写。NAV-C1 体量估计 = Minimap 模块 ~250–350 行 + 装配接线 ~20 行 + e2e 新 spec，与 ExploreProgress/DriveFeedback 同量级。

---

## 3. M 键小地图交互草案（NAV-C1 底稿，DES 定稿前的推荐默认值）

### 3.1 开关

- **M 键 toggle**（动作 `minimap`，categories `['driving']`，keys `['Keyboard.KeyM','Keyboard.m']`）+ **HUD「地图」钮**（stage 注入，car_ready 起可见——recallBtn 同窗先例；触屏唯一入口）+ **Esc 只关不开**；
- **Esc 冲突处理（实现必须项）**：壳页 `window keydown Escape` 开合 ESC 菜单且 `preventDefault`（`index.astro` L385）。面板开态按 Esc 会双响（面板关 + 壳菜单开）。推荐解法 = 引擎在 window **capture 阶段**注册 Esc 监听，面板开态 `stopPropagation + preventDefault` 吞掉后再关面板——引擎自洽零壳改；备选 = 壳 handler 前置一行让位检查。e2e 断言锁死（§5.2-A2）。

### 3.2 面板形态：非模态半屏（推荐）

- 开态**不吞驾驶键**、不暂停 Ticker——「驾驶意图至上」红线（PoiArrival 同法理：世界永远能开）；PUBG M 全屏地图同样不暂停；
- 布局：居中或右侧 ~60vmin 正方形（等距城市 ±260m 一屏全览，「全图一屏可达」adaptation 既定规则）；pin = 楼色小钉 + 双语楼名（district 五色分组沿 `DistrictCategory`）；玩家标记 = 朝向箭头（`rotationY` 驱动）；
- 面板本体 `pointer-events: auto` 接管指针（区别于 chip 的全穿透），天然阻断向 canvas 标点的误点穿透；toast/chip 之上、debug 面板之下。

### 3.3 点击进楼（推荐两段式，呼应裁决点 DP-1）

pin 点击 → **传送**至该楼 parkingBay（复用 applyDeepLink 位姿换算；落点即触发圈内）→ 关面板 → `boundingIn` 全链天然入账（poi-bounding-in / explore / quest 零旁路）→ 标点 pinned 展开 → 玩家按 **E 确认进站**（PoiArrival 前奏照常）。误点代价 ≈ 0（再开图点回），对比直跳楼页误点 = 重挂载 ~8s（GAP-13 教训）。

**埋点**（观测规格 §3.4 随行加法，hint-recall/suspension-jump 先例）：`minimap-open {via: key|button}` / `minimap-close {via: key|esc|button|teleport}` / `minimap-teleport {id, distanceM}`；SessionTimeline 白名单同 PR 加行。

### 3.4 键盘可达性方案（§D 硬门 2 展开）

| 项 | 方案 |
|----|------|
| 容器 | `role="dialog"` + `aria-modal="false"`（非模态）+ `aria-label="城市地图"` |
| 进入焦点 | M 开 → 焦点移入面板（首 pin 或标题）；关 → 焦点还原触发前元素（壳 Esc 菜单 close 同纪律） |
| 遍历 | 12 pin = 原生 `<button>` 列表，Tab 顺序 = JSON districts 序；方向键 roving tabindex 可选增强 |
| 激活 | Enter/Space = 点击同语义（原生 button 免费获得）；pin `aria-label` = `楼名 · role 一句话职能`（buildings JSON 现成字段） |
| 触屏 | pin 命中热区 ≥44px（视觉钉可小、热区外扩） |
| 键位卡 | HINT_TEXT 串尾加「M 地图」（VEH spec §8.2 串尾加法同纪律，动既有 e2e 文案断言需同 PR 修正） |

### 3.5 reduced-motion 与恒等约束

- 开合动画（fade/scale）`prefers-reduced-motion` 直切 0.01ms（ExploreProgress 先例）；传送本身瞬移零动画（respawn 现状即无过渡）；玩家标记朝向旋转保留（操作性信息不剥夺）；
- **robot_idle/transforming 双保险**：① M 动作 categories `['driving']` 被 intro 闸门物理拦截；② CSS 样式门 `[data-world-state='robot_idle'] …, [data-world-state='transforming'] …{display:none!important}`（ExploreProgress/DriveFeedback 同款；非 ritual 路径无该属性恒放行，FB-06 同构）；③ 懒初始化（P6）保证 robot_idle 帧零面板 DOM。poster 逐字节恒等零风险面。

---

## 4. 与缩略图导航的关系（R5 已裁：并入 NAV v1.5，不独立立项）

- **定位**：缩略条 = 小地图面板内底部横滑楼卡区（12 卡），点击 = **与 pin 完全同一进楼语义**——两套导航 UI 不分裂心智（R5 §B 原文）；
- **NAV-C1 预留三件**（v1 落结构、v1.5 只加呈现）：① 面板布局留底部槽位；② 进楼语义单源函数 `teleportTo(buildingId)`——pin 与楼卡共用同一入口；③ 楼卡 v1 先行版可**零缩略资产**直接上（neonColor 色块 + 双语楼名 + district 标签，全部 JSON 现成字段）——若 v1 楼卡体验已够，v1.5 甚至可裁定零新资产收官；
- **反向约束**：缩略条不做独立 HUD 常驻件；NAV-C1.5 永远单 PR（W-R5-2 禁并，归因隔离）；若裁截图缩略，批拍资产不得动既有像素基线（§D 门 5），且 poster 类重拍永远排批次最后（已知坑总表）。

---

## 5. 文件域建议（AUD-C1 ∥ NAV-C1 正交拆分）+ 验收断言 + 风险

### 5.1 文件域（R5 §B 表落到具体文件，两处比原表更正交）

| 件 | 新增 | 触碰 | 禁入 |
|----|------|------|------|
| **NAV-C1** | `src/lab/world/ui/Minimap.ts`（面板+pin+标记+样式注入+M 动作注册）· `e2e/cyber-city-minimap.spec.ts` | `src/lab/world/index.ts` 装配段接线 ~10 行 · `core/SessionTimeline.ts` 白名单 +3 行 · `world/Reveal.ts` HINT_TEXT 串尾 +「M 地图」· areas/buildings JSON **只读** | `view/View.ts`、city 几何、physics、`inputs/Keyboard.ts`（修正 R5 预估：M 动作运行期 addActions 注册，Keyboard 零改）、`world/Respawns.ts`（见 R2） |
| **AUD-C1**（对照） | `src/lab/world/audio/`（绿地） | Player/TransformSystem/PhysicsVehicle 各 ≤5 行挂钩 + 静音钮 DOM + SessionTimeline 白名单 | `view/`、城市数据、既有 e2e 断言语义 |

**交集与合流预判**：唯一文本交叠 = `SessionTimeline.ts` 事件白名单表与 `index.ts` 装配段（两 PR 各加独立块）。措施：① 白名单行按字母序插入收敛冲突面；② DOM 注入各自独立 root + injectStyles（ExploreProgress/DriveFeedback/Reveal 三件并存已实证零冲突）；③ 段末**试合并 + 合流树冒烟必做**（R5 §B 并行例外条款原文，文本零冲突 ≠ 语义零冲突）。

### 5.2 验收断言清单（§D 硬门 1 NAV 最低集展开为可落 spec 粒度）

| # | 断言 | 口径 |
|---|------|------|
| A1 | driving 态按 M → `[data-world-minimap]` 开态可见；再按 M → 关 | DOM 属性 + 可见性 |
| A2 | 面板开态按 Esc → 面板关 **且** 壳 `[data-world-esc-menu]` 未开 | Esc 双响回归锁 |
| A3 | 键盘选楼：Tab 至 pin → Enter 激活 = 点击同语义 | 焦点断言 + 传送结果 |
| A4 | 点击进楼路由链：pin 点击 → `__worldSpike.state()` x/z 距目标 parkingBay ≤ radius → `minimap-teleport` 入 dump → E → `world-poi:{id}` → navigate 目标 = deepLink（route abort 拦截取证，PoiArrival spec 先例） | 遥测 + 埋点 seq 序 |
| A5 | robot_idle 态：面板与 M 钮不可见 + 按 M 零反应（categories 闸门）+ `e2e/visual` 既有 4 例基线不动 | 恒等门 |
| A6 | reduced-motion：开合直切（零 transition 等待即达终态） | emulateMedia |
| A7 | 触屏（mobile project）：HUD 钮点按开合、pin 点按传送 | 触屏等价 |
| A8 | `minimap-open/close/teleport` 在 `__worldSession.dump()` 白名单内且 seq 有序 | OBS 合同 |
| A9 | 不开地图路径：既有全量 e2e 零变化（现行全量 0 failed/0 skipped/0 flaky，80 例口径单源 `cyber-city-test-framework.md`/看板） | 恒等回归 |

### 5.3 风险表

| # | 风险 | 缓解 |
|---|------|------|
| R1 | Esc 双响开壳菜单 | capture+stopPropagation（§3.1）；A2 锁死 |
| R2 | 若把 12 bay 注册进全局 Respawns（GAP-15 案）→ **R 键语义从「回到路口」变「回最近 bay」**，键位卡/status 文案与既有断言连锁变更 | NAV-C1 **不动 Respawns**：传送用独立 `teleportTo()` 直写 landing 位姿（applyDeepLink 模式）；GAP-15 留独立裁量单 |
| R3 | 传送与 PoiArrival/shot 在途竞态：`game.player.respawn()` 直调不发 `actionStart`，不会像按 R 那样触发 RELEASE_ACTIONS 释放在途 shot | teleport 入口显式调 `arrival` 中断/`view.releaseShot()` 同语义；断言 A4 顺带覆盖 shot 字段 |
| R4 | 面板误点穿透至 canvas 标点 onClick | 面板 pointer-events 接管天然阻断（Pointer 挂 canvasElement）；低风险 |
| R5 | 全量 e2e 窗与跑道互斥硬令冲突 | NAV-C1 全量窗按登记空档执行（R1 §3.5 永久硬令照抄） |
| R6 | HINT_TEXT 改文案破坏既有 e2e 文案断言 | 同 PR 内同步修正断言（串尾加法，VEH §8.2 先例） |
| R7 | 移动端小屏面板遮挡摇杆热区 | 面板开态半屏 + 底部让位 Nipple 区；A7 覆盖 |

---

## 6. 三裁决点（R5 §C 已列，此处展开建议；均标待裁）

### DP-1 点击进楼语义 —— 传送 + 既有进站流 vs 直跳楼页 【待董事会确认】

**本调研一手核验后支持董事会倾向（传送式）**，并细化为 §3.3 两段式。理由三条：① 漏斗完整——`world-poi`/`poi-bounding-in`/explore/quest 全链零旁路（直跳则四件全瞎）；② 误操作代价不对称——直跳误点 = 离开世界 + 重挂载 ~8s（GAP-13 定级 P0 的同一伤口），传送误点 ≈ 0；③ 实现面最小——落点换算/respawn/触发圈全部现成，直跳反而要为「远程 navigate」新开一条旁路。可选折中（v1.5 评估）：pin 详情面提供显式「直接进站」次级动作。**建议默认值：传送式**。

### DP-2 缩略图来源 —— 楼卡截图 vs 矢量图标 【待指挥官定质感取向】

建议分两步：**v1 零缩略资产**（neonColor 色块 + 双语楼名 + district 标签，JSON 现成字段，§4）；v1.5 若需图，**矢量图标优先**——数 KB 级、主题色随 JSON 单源、零批拍排期、零像素基线联动；楼卡截图仅当指挥官明确要「真实楼景」质感才走：12×webp 体积入账 + 固定机位批拍（poster 工艺复用）+ 必须 NAV-C1.5 单 PR 独立归因 + 重拍排批次最后（已知坑）。

### DP-3 poster/恒等约束 —— robot_idle 态一切导航 UI hidden 【形式确认，建议随 DES 定稿盖章】

技术上无争议：三重保险全部有成熟先例（§3.5——categories 闸门 + CSS 两态样式门 + 懒初始化），建议直接采纳为 NAV-C1 §D 门 5 执行细则。唯一裁量位 = transforming 态是否同 hidden——**建议是**（ExploreProgress/DriveFeedback 均为两态门，口径统一）。

---

*本文档为 CC-NAV-RS 交付物（W-R5-0 调研波，R5 §C 任务书全项覆盖）；folio Map.js 结论以 commit `41046b5` 原文一手核验为准；NAV-C1 开工门 = #129 合流（W-R5-1），任务书应引用本篇 §3/§5 + R5 §D 六门全文。*
