# 科技城 2 分钟体验缺口审计（CC-FXN-RS）

| 项 | 内容 |
|----|------|
| Task | **CC-FXN-RS**（Loop 8 三路调研之一，`cyber-city-function-gameplay-loop.md` §5 任务行） |
| 分支 | `cursor/cc-fxn-gameplay-gap-audit-1d6f`（base：`main` @ `df166b5`） |
| 日期 | 2026-08-27 |
| 触发 | 指挥官实玩 ~2 分钟：「交互/人性化/游戏特性不足」——本篇从**代码 + 文档**复原这 2 分钟，逐拍列出功能/交互/人性化缺口（**不是视觉分**，视觉归 Loop 6 CC-CAM） |
| 审计面 | `Reveal.ts` · `TransformSystem.ts` · `Player.ts` · `InteractivePoints.ts` · `Areas.ts` · `View.ts` · `Inputs/Nipple/Zones/Respawns/World/Roads` · `/` 壳（`src/pages/index.astro`）· `human-gate-checklist.md` §5 · `cyber-city-camera-design.md` F1–F9 · `e2e/cyber-city.spec.ts` |
| 口径 | **只调研零实现**：零 `src/`、零 `e2e/` 改动；每项缺口标 P0/P1 + 建议埋点事件名 + 对接归属（Loop 6 / Loop 7 在途件 or Loop 8 新增） |

---

## 0. 结论先行

- 复原首幕 2 分钟时间线后共列 **20 项缺口**：**P0 × 8 / P1 × 12**。P0 聚类三块：①**发现性/目标感**（POI 找不到、找到了也没有「玩完」的概念）②**反馈**（碰撞/驾驶全程无声无震——Audio 系统整体砍除、`roll.kick` 未接碰撞）③**键位召回与进站误触**（提示 4s 淡出后 E/刹车/Esc 永久失明；按 E = `location.assign` 硬跳出 3D，回来重挂载全流程）。
- **可观测是零订阅者状态**：4 个既有事件（`world-reveal` / `world-transform:{to}` / `world-drive-start` / `world-poi:{id}`）触发进内存 `Events` 后无人消费；实施方案 §1.1 命名的 `world-enter` / `world-skip` / `world-exit-to` **未实现**。「用户卡在哪、哪步流失」当前不可回答——印证 Loop 8「可观测先行」纪律，全部建议事件名汇总于 §4。
- **e2e 证明状态机可跑，不证明 2 分钟体验合格**（Loop 8 章程原话在代码里逐条坐实）：`cyber-city.spec.ts` 六用例覆盖壳合同/跳过/变形状态序/reduced-motion/`?gl=1`/计时采集，但 **POI 全链、实际位移、R 复位、碰撞、翻车/坠落恢复、触屏驾驶、提示消隐** 全部零覆盖（§3）。
- 与在途 Loop 的切分干净：Loop 7 VEH（V 键 FPV）/ TRANS-FX（变形粒子）各解本清单 2 项的一部分；Loop 6 F1/F5（进站镜头/泊入定帧）是「到点之后」的奖励——**「怎么找到点」「找到几个点」「撞了有没有反馈」全部无人认领，是 Loop 8 CC-FXN-C1 的主战场**。

## 1. 代码事实基线（审计取证）

2 分钟内玩家可触达的**全部**交互面与反馈面，按代码逐条核对：

| 面 | 现状（代码事实） | 出处 |
|----|------|------|
| 输入动作表 | intro：`transform`(Space)；driving：WASD/方向键、Shift boost、Space/B/Ctrl 刹车、R respawn、F 悬挂跳、E/Enter poiInteract | `Reveal.ts` L98-100 · `Player.setInputs` · `world-pois.json` interaction.keys |
| 上下文闸门 | `filters` intro→driving 由 TransformSystem car_ready 帧热切；intro 下 WASD 被静默吞掉 | `Inputs.ts` filters · `TransformSystem.finish` |
| 键位提示 | Reveal hint（car_ready 浮现）`HINT_FADE_DELAY=4s` 自动淡出、driving 即隐、**无召回**；壳自带 hint（含「E 进站 · Esc 菜单」）在 ritual 路径挂载即 `data-dismissed=true` 永不显示 | `Reveal.ts` L29/L169-179 · `index.ts` L159 |
| 常驻文字 | status 药丸恒显，driving 文案只报「WASD/方向键转向，Shift 加速，R 回到路口」——**刹车/F/E 进站/Esc 不在其中** | `Reveal.ts` STATUS_TEXT |
| 反馈通道 | 音效系统整体砍除（`Game.ts` 头注「Audio 全砍」）；`view.roll.kick` 仅变形落地调用一次，**碰撞不触发**；boost 无专属视觉（folio speedLines 移植时砍除） | `Game.ts` L8 · `TransformSystem.completeRun` · `View.ts` §砍除清单 |
| 可撞物 | 城市档零动态可撞物：锥桶仅灰盒档（`cameraFraming==='greybox'`），StreetProps/路障/楼全 fixed collider | `World.step` L67 · `StreetProps.ts` · `Roads.ts` |
| POI 触达 | 12 楼触发圈半径 6m；最近 bay（voice-pod (12,28)）距出生约 30m；标点默认 CONCEALED 小菱形 + frustum 出画隐藏；**无罗盘/路标/距离指示/小地图** | `Areas.ts` · `cyber-city-buildings.json` parkingBay · `Area` frustum |
| 进站动线 | E/Enter/点按 → `world-poi` 事件 + `location.assign` **硬跳**（overlay/View Transition 归 CC-P1）；壳 hud-city/city-nav 链接同为硬跳 | `Areas.ts` L137-147 · `index.astro` |
| 复位/自救 | Respawns 注册表**仅 1 点**（'landing' = 十字路口），`getClosest` 退化；respawn = 无过渡瞬移 + `objects.resetAll()`（folio Overlay 遮罩未移植）；翻车 3s 静默延时后 `flipJump`；`stuck` 事件触发后**零消费**（folio unstuck 按钮未移植） | `Game.ts` L141-144 · `Player.respawn/setUnstuck` · `index.ts` L168-170 · `PhysicsVehicle.ts` L475 |
| 世界边界 | 全息路障只封 4 条路尽头（宽 24m）；地面碰撞体 ±340m，越界斜穿可坠落 → `killElevation=-8` → 无提示瞬移回出生 | `Roads.ts` setBarriers/L220 · `Player.updatePostPhysics` |
| 变形可逆 | `transform('robot')` 已实现（共用遮蔽序列），**零输入接线**；CTA car_ready 后隐藏 | `TransformSystem.transform` · `Reveal.applyState` |
| 触屏 | Nipple 摇杆（油门/转向/内环 tap=跳）+ HUD「回到路口」按钮 + 点按标点=interact；**无 boost/刹车触点、无 V(FPV) 等价键**（VEH notes §3 自认）；hint/aria-label 全键盘口径 | `Nipple.ts` · `index.astro` respawnBtn · `cyber-city-vehicle-fpv-notes.md` §3 |
| Esc 菜单 | 仅 `Escape` 键开合（出口④）；**触屏无任何入口**；菜单内容 = 出口链接，无键位表 | `index.astro` L378-393 |
| 既有埋点 | `world-reveal` / `world-transform:{to}` / `world-drive-start` / `world-poi:{id}` 四事件 → 内存 Events，**零订阅者**；`console.info` 散落无结构 | §4 汇总 |

## 2. 首幕 2 分钟时间线缺口清单

时间轴按真机口径（SRD §12.7.2：加载→可变形 ≤8s、变形 1.0–1.2s）复原；每项 = `GAP-xx · 类别 · P0/P1 · 建议埋点 · 对接`。

### T0 · 0–10s：壳 → 自动挂载 → loading

| # | 缺口 | 类别 | 级 | 建议埋点 | 对接 |
|---|------|------|:--:|----------|------|
| GAP-01 | **挂载漏斗不可观测**：auto/explicit 挂载来源、时长、失败原因无事件；实施方案 §1.1 已命名的 `world-enter`/`world-skip` 未实现——「多少人没等到 robot_idle 就走了」不可回答 | 观测 | **P0** | `world-mount-start {trigger:auto\|explicit}` · `world-mount-ready {ms, backend}` · `world-skip {atMs}` | **Loop 8 CC-OBS-C1**（Loop 6/7 均不涉壳） |
| GAP-02 | loading 期 cover 上「进入科技城」按钮消失后只剩进度条，无「加载中仍可跳过/直达导航」的引导文案（跳过丸在右上角，与进度条视线不同区） | 人性化 | P1 | 复用 GAP-01 事件（`world-skip.atMs` 可判「loading 期流失」） | Loop 8 FXN-C1（壳文案一行） |

### T1 · ~10–20s：光柱开演 → robot_idle（CTA 待命）

| # | 缺口 | 类别 | 级 | 建议埋点 | 对接 |
|---|------|------|:--:|----------|------|
| GAP-03 | **intro 上下文按键静默吞掉**：玩家第一直觉压 WASD（游戏惯性），filters 闸门无声拦截，无「先变形（Space）」的即时纠偏反馈——status 药丸有引导但在屏幕底部小字，按键瞬间无任何回应 | 反馈/键位 | P1 | `world-input-blocked {action, filter}`（去抖聚合，同 action 每态只报一次） | Loop 8 FXN-C1（status 行闪烁/文案脉冲即可，零新 UI） |
| GAP-04 | **机器人零交互面**：点击/悬停 9m 主角无任何反应（RayCursor 只挂 POI 标点）；首幕唯一可交互物 = 一颗 CTA。「主角在场却摸不得」是 2 分钟内最早的「不像游戏」信号 | 发现性 | P1 | `world-hero-hover` · `world-hero-click` | Loop 8 FXN-BR（脑暴：点击机器人 = 触发变形/待机动作彩蛋） |
| GAP-05 | **「楼即产品线」叙事随 cover 淡出而消失**：世界内无持续导视——hud-city（右下 5 楼）是 DOM 直跳链接（点了= 离开 3D），与「开车进站」动线自相矛盾；驾驶者视角里没有任何元素说明「这些楼可以进」 | 目标感/发现性 | **P0** | `world-hudcity-click:{id}`（与 `world-poi` 区分「DOM 跳」vs「开车进站」两条转化路径） | 导视本体 **Loop 8**；Loop 6 F1/F2 只管到点后的镜头奖励 |

### T2 · ~20s：变形窗（1.0–1.2s）

| # | 缺口 | 类别 | 级 | 建议埋点 | 对接 |
|---|------|------|:--:|----------|------|
| GAP-06 | **变形不可逆**：`transform('robot')` 引擎面已实现，但无键位/CTA 接线——「双向可逆」（CC-P1 承诺）在 2 分钟内不可体验，车形态回不去讲解态 | 键位/玩法 | P1 | 复用既有 `world-transform:{robot}`（接线后自动产生） | Loop 8 FXN-C1（键位归 FXN-DES 裁，如 T/长按 Space）；Loop 7 TRANS-FX 只加粒子不加入口 |
| GAP-07 | 变形炫技单薄（环+光幕偏「系统 UI」）——**已立项在途**，本审计仅登记不重复主张 | 反馈 | P1 | `world-transform-fx {tier}`（质量档记录，归 OBS schema） | **Loop 7 CC-TRANS-FX-IMPL 在途**（`4320297` 已 push） |

### T3 · ~20–40s：car_ready → 首驶

| # | 缺口 | 类别 | 级 | 建议埋点 | 对接 |
|---|------|------|:--:|----------|------|
| GAP-08 | **键位提示 4s 淡出且不可召回**：Reveal hint（含刹车/F）driving 即隐；壳 hint（唯一提到「E 进站 · Esc 菜单」的地方）在 ritual 路径**从未显示过**（挂载即 dismissed）；status 常驻行只报 WASD/Shift/R——**E/刹车/F/Esc 四键在首驶 5 秒后对玩家永久失明**，Esc 菜单里也没有键位表 | 键位 | **P0** | `world-hint-shown {keys}` · `world-hint-recall {via}`（召回入口：H/? 键或 HUD 按钮） | Loop 8 FXN-C1 |
| GAP-09 | **碰撞零反馈**：撞楼/撞路障 = 静默减速。无音效（Audio 全砍）、无 `roll.kick`（只接了变形落地）、无粒子/闪光、无 HUD 抖动。folio 原版每次碰撞有镜头 kick + 音效，是「玩具感」的底座 | 反馈 | **P0** | `world-collision {speedKmh, against}`（≥阈值才报，去抖） | Loop 8 FXN-C1（`roll.kick` 接碰撞是一行消费既有件；音效属新依赖须单独裁量）；Loop 7 VEH 只管视角不管反馈 |
| GAP-10 | **boost 无可感反馈**：Shift 按下只有速度变焦隐性拉远；无 FOV kick（第三人称）、无尾焰/速度线。「推背感」仅在 Loop 7 FPV 档有 FOV+9° | 反馈 | P1 | `world-boost {durationMs}` | 第三人称补强归 Loop 8；FPV 档 **Loop 7 CC-VEH-VIEW 在途** |
| GAP-11 | **城市零可撞可玩物**：锥桶只在灰盒档出场（CC-L1 A2 撤出城市，视觉正确但没补替代物）；街道道具全 fixed。无任何「撞了会动」的东西 = 驾驶沙盒失去 folio 保龄球/槌球的核心乐趣来源 | 反馈/玩法 | P1 | `world-prop-hit:{kind}` | Loop 8 FXN-BR（赛博语义可撞物：悬浮广告牌/能量桶；CITY-03 配额与 V4 场景密度须与 Loop 6 对表） |

### T4 · ~40–120s：探索 / POI / 收尾

| # | 缺口 | 类别 | 级 | 建议埋点 | 对接 |
|---|------|------|:--:|----------|------|
| GAP-12 | **POI 发现性不足**：触发圈 6m、最近 bay 距出生 30m、标点默认小菱形且出画即隐——无罗盘/箭头/距离牌/小地图，玩家 2 分钟内可能一个触发圈都没撞进。boundingIn 的引导只写进了 console.info | 发现性 | **P0** | `world-poi-prompt:{id}`（boundingIn 升事件）· `world-poi-first-seen {sinceDriveMs}`（首个触发圈命中耗时 = 发现性核心指标） | 「找到点」导视本体 **Loop 8**；Loop 6 F1（进站镜头）/F5（泊入定帧）是到点后的奖励，F3 走廊扫视间接助攻 |
| GAP-13 | **进站 = 硬跳出 3D**：E/Enter/点按 → `location.assign`，无确认、无过渡；误触 E（恰在触发圈内想刹车按错）即离开世界，浏览器后退 = 重挂载全流程（真机 ~8s）。2 分钟里最贵的一次误操作 | 失败恢复/人性化 | **P0** | 既有 `world-poi:{id}` + 补 `world-exit-to:{route}`（实施方案已命名未实现；含 `via: poi\|nav\|skip\|esc`） | Loop 6 F1 的 0.8s 前奏 tween 天然是「可取消窗口」（驾驶输入中断即回）——**确认语义建议搭 F1 实现**；overlay 正解归 CC-P1 |
| GAP-14 | **目标感为零**：无任务/进度/成就/计数。12 楼没有 visited 状态，HUD 只有速度。「逛了 = 逛了」，无「玩完了 3/12」的成就回路——指挥官「不像游戏」的最大单因 | 目标感 | **P0** | `world-poi-visited:{id}` · `world-progress {visited, total}` | Loop 8 FXN-C1（最小闭环：HUD 访问计数 + 标点 visited 态变色）+ FXN-BR（任务线/收集玩法脑暴）；rubric F6 维直接对应 |
| GAP-15 | **R 复位全城瞬移**：重生注册表仅十字路口 1 点（`getClosest` 退化单点）；远端按 R = 无渐隐瞬移 + 全部动态体 resetAll。把 12 楼 parkingBay 注册进 Respawns 即是「最近点复位」（消费面 `getClosest` 现成） | 失败恢复 | P1 | `world-respawn {distanceM, via:key\|button\|fall}` | Loop 8 FXN-C1（数据接线一件事；渐隐遮罩可另裁） |
| GAP-16 | **世界边缘静默跌落**：路障只封 4 路口，±340m 地面外斜穿可坠落 → 无提示瞬移回出生。玩家感知 =「掉出地图了还闪回，像 bug」 | 失败恢复 | P1 | `world-fall-out {x, z}` | Loop 8（边界提示/减速带；复用 GAP-15 respawn 事件闭环） |
| GAP-17 | **翻车/卡死自救不可见**：翻车后 3s 静默（无「翻车了，正在翻回…」提示）才 flipJump；`stuck` 事件零消费（folio 屏上 unstuck 按钮未移植）。用户前 3 秒会以为死机 | 失败恢复/反馈 | P1 | `world-flip {recoverMs}` · `world-stuck {resolvedVia}` | Loop 8 FXN-C1（status aria-live 行复用即可，零新 UI） |

### 横切 · 移动端（<768px 不自动挂载，显式进入后）

| # | 缺口 | 类别 | 级 | 建议埋点 | 对接 |
|---|------|------|:--:|----------|------|
| GAP-18 | **触屏文案/触点错配**：Reveal hint 与 canvas aria-label 全键盘口径（「W/A/S/D…」对触屏用户是噪声）；无 boost/刹车触点（Nipple 只有油门/转向/tap 跳）；V(FPV) 无触屏等价（VEH notes §3 自认「后续 HUD 按钮」） | 移动端 | **P0** | `world-input-mode {mode}`（modeChange 既有事件升埋点）· 触点事件并入各动作事件的 `via` 字段 | Loop 8 FXN-C1（hint 分模式文案 + HUD 触点）；V 触点钩子 **Loop 7 VEH 已预留**（复用同一 `toggleView` 动作） |
| GAP-19 | **Esc 菜单触屏不可达**：出口④ dialog 仅 Escape 键开合，触屏无按钮入口；窄屏 hud-city 又 display:none——挂载后触屏玩家的 DOM 出口只剩顶栏小字导航 | 移动端/失败恢复 | P1 | `world-esc-open {via:key\|button}` | Loop 8 FXN-C1（HUD ≡ 按钮开同一 dialog） |
| GAP-20 | **窄屏挂载后体验未标定**：竖版构图/摇杆遮挡/HUD 密度无走查记录（human-gate §5.4 真机表全空），e2e 亦零覆盖（mobile.spec 只测 /home/ 与两 lab 页） | 移动端 | P1 | 复用 GAP-18 `world-input-mode` + `world-mount-ready.viewport` | Loop 6 **F8**（竖版 shot 适配探针）+ human-gate §5.4 真机回填；触屏 e2e 归 Loop 8 测试批 |

### 横切 · 可观测

| # | 缺口 | 类别 | 级 | 建议埋点 | 对接 |
|---|------|------|:--:|----------|------|
| GAP-21 | **事件总线零订阅者**：4 个既有事件触发后无人消费；无 sessionId、无阶段时间戳、无漏斗（mount→reveal→transform→drive→poi）；`#debug` 只挂了 game 实例引用，无状态/埋点 tail 面板 | 观测 | **P0** | SessionTimeline：上述全部事件 + `ts/sessionId/phase` 包封（schema 归 CC-OBS-DES） | **Loop 8 CC-OBS-C1**（章程「无埋点不得登记功能分」的机器前提） |

## 3. e2e `cyber-city.spec.ts` 覆盖面（测了什么 / 没测什么）

### 3.1 已覆盖（6 用例，world-chromium 串行）

| 用例 | 断言面 | 与 2min 体验的关系 |
|------|--------|------|
| CITY-E2E-01 | 壳零 world 字节 + SSR 文案/noscript/零静态标签 | 壳合同，非体验 |
| CITY-E2E-02 | 跳过出口 0 秒可点 / Tab 第一焦点 / `/home/` 零字节 | 逃生路径 ✔（体验缺口不在此） |
| CITY-E2E-03 | robot_idle→transforming（CTA disabled）→car_ready→压 W 落 `driving` 态 | **只断言状态位**，不断言位移（spec 自注「绿灯时升级为遥测轮询」未做） |
| CITY-E2E-04 | reduced-motion：不自动挂载 / instant swap / aria-live 可见 | a11y 合同 ✔ |
| CITY-E2E-05 | `?gl=1` 后端徽标 + 变形可播 + 零 pageerror | 回退合同 ✔ |
| CITY-E2E-06 | poster 先显 + robot_idle 计时采集（不阻断） | 计时留档，真机门禁归 human-gate §5 |

### 3.2 零覆盖（本清单缺口的自动化对应面）

| 未测面 | 对应缺口 | 备注 |
|--------|---------|------|
| POI 全链：触发圈进出 / E 进站 / `world-poi` 事件 / `?poi=` 深链出生 / 无效 slug | GAP-12/13 | spec 头自注「POI 专项用例另起草，归 Phase 1 首个 e2e 批次」——**至今未起草**；A4 冒烟（深链出生+E 直跳）是一次性脚本非回归 |
| 实际驾驶：位移/转向/刹车/boost/`__worldSpike.state()` 遥测 | GAP-09/10 | driving 只验状态位；world-spike.spec 有位移断言但对象是灰盒 `/world-spike/`，非 `/` 城市 |
| R 复位 / HUD「回到路口」按钮 / respawn 事件 | GAP-15 | — |
| 碰撞行为 / 翻车自救 / stuck / 越界坠落回收 | GAP-09/16/17 | — |
| Esc 菜单开合与落地 | GAP-19 | M11 Playwright 冒烟为一次性证据（human-gate §5.2 出口④），未进 e2e 套件 |
| 键位提示浮现/4s 淡出/driving 即隐 | GAP-08 | Reveal hint 的 DOM 契约 `[data-world-hint]` 在 SEL 注释中列为「辅助信号」，无断言 |
| 触屏驾驶（Nipple/tap 跳/点按标点） | GAP-18/20 | mobile.spec 3 用例全部不涉 `/` 世界 |
| 帧率/性能采样于 `/` | 性能 85 北极星 | world-spike-perf.spec 只测 `/world-spike/`；`/` 城市档零采样 |
| 车→机器人回变 | GAP-06 | 引擎面存在，无入口自然无用例 |

**含义**：功能 rubric（CC-FXN-DES）落地前，上表第二列即取证协议的候选断言面；e2e = 回归门、功能 rubric = 体验门的分工（章程 §4）在此有了逐条对应。

## 4. 埋点事件名汇总（现状 + 建议）

### 4.1 既有（已触发，零订阅者）

| 事件 | 触发点 | 载荷现状 |
|------|--------|---------|
| `world-reveal` | Reveal 光柱开演 | 无 |
| `world-transform` | TransformSystem.finish | `[to: 'car'\|'robot']` |
| `world-drive-start` | car_ready 后首个驾驶输入 | 无 |
| `world-poi` | POI interact | `[buildingId]` |

### 4.2 已命名未实现（实施方案 §1.1 / SRD §9.5 欠账）

`world-enter` · `world-skip` · `world-exit-to:{route}`

### 4.3 本审计新增建议（20 项缺口对应，schema 细化归 CC-OBS-DES）

| 域 | 事件 |
|----|------|
| 挂载漏斗 | `world-mount-start` · `world-mount-ready` · `world-skip` |
| 输入/键位 | `world-input-blocked` · `world-input-mode` · `world-hint-shown` · `world-hint-recall` · `world-boost` |
| 反馈/物理 | `world-collision` · `world-prop-hit:{kind}` · `world-flip` · `world-stuck` · `world-fall-out` · `world-respawn` |
| POI/目标 | `world-poi-prompt:{id}` · `world-poi-first-seen` · `world-poi-visited:{id}` · `world-progress` · `world-hudcity-click:{id}` · `world-exit-to:{route}` |
| 探索交互 | `world-hero-hover` · `world-hero-click` · `world-esc-open` |
| 核心漏斗（OBS 首验收） | `mount-start → mount-ready → reveal → transform → drive-start → poi-first-seen → poi-visited → exit-to`，逐段耗时 + 流失点 |

## 5. 优先级汇总与 Loop 对接矩阵

### 5.1 P0 八项（2 分钟体验的「不行」直因，建议 CC-FXN-C1/OBS-C1 首批）

| # | 一句话 | 承接 |
|---|--------|------|
| GAP-21 | 可观测零订阅（一切登记的前提） | **CC-OBS-C1**（先行） |
| GAP-01 | 挂载/跳过漏斗无事件 | CC-OBS-C1 |
| GAP-14 | 目标感为零（无 visited/进度） | CC-FXN-C1 |
| GAP-12 | POI 发现性（找不到玩法入口） | CC-FXN-C1 |
| GAP-08 | 键位提示不可召回（E/刹车/Esc 失明） | CC-FXN-C1 |
| GAP-09 | 碰撞零反馈 | CC-FXN-C1 |
| GAP-13 | 进站硬跳出 3D 无确认 | CC-FXN-C1（确认语义建议搭 Loop 6 F1 tween 实现） |
| GAP-05 | 世界内无「楼即产品线」导视 | CC-FXN-C1 |
| GAP-18 | 触屏文案/触点错配 | CC-FXN-C1（V 触点复用 Loop 7 钩子） |

（P0 计 8 项按缺口编号：01/05/08/09/12/13/14/18/21 中 GAP-05 与 GAP-12 同属导视件可合并施工，故施工单位 8。）

### 5.2 在途 Loop 覆盖认领（本清单不重复立项）

| 缺口 | 在途件 | 覆盖度 |
|------|--------|--------|
| GAP-07 变形炫技 | Loop 7 CC-TRANS-FX-IMPL（已 push） | 全 |
| GAP-10 boost 推背 | Loop 7 CC-VEH-VIEW FPV FOV+9° | 仅 FPV 档；第三人称仍缺 |
| GAP-13 进站过渡 | Loop 6 F1 进站镜头（0.8s tween + 定帧） | 部分（可取消窗口）；确认语义仍归 Loop 8 |
| GAP-12 发现性 | Loop 6 F3 走廊扫视 / F5 泊入定帧 | 间接（到点后奖励）；导视本体未认领 |
| GAP-20 竖版适配 | Loop 6 F8 探针 | 数据化部分；触屏 e2e 未认领 |

### 5.3 rubric 维度映射（供 CC-FXN-DES 冻结权重时对表）

| 提议维（章程 §3.1） | 本清单对应缺口 |
|----|----|
| F1 首幕可懂 15% | GAP-02/03/04/05 |
| F2 操作反馈 15% | GAP-09/10/11/17 |
| F3 驾驶乐趣 15% | GAP-10/11/15/16 + Loop 7 VEH |
| F4 POI 游戏化 15% | GAP-12/13/14 |
| F5 人性化 15% | GAP-02/08/13/18/19 |
| F6 目标/进度 10% | GAP-14（+05） |
| F7 可观测完备 10% | GAP-01/21 + §4 全表 |

---

*CC-FXN-RS · 2026-08-27 — 代码+文档复原首幕 2 分钟：20 缺口（P0×8）/ e2e 零覆盖面 9 项 / 建议埋点 23 事件。零实现改动；施工切分归 CC-FXN-ADV/DES，可观测先行归 CC-OBS-C1。*
