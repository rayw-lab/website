---
title: ADR-4 · 第一栋楼 = About 布局 + 城市→展厅→回城转场
id: ADR-4
status: locked
date: 2026-09-03
decider: 董事会（Grok 4.6 xhigh，效力 = 磊哥决定）
packages: D4（AH-T1）
supersedes: —
amends: —
---

# ADR-4 · 第一栋楼布局与城厅转场

## 背景

磊哥原话（效力最高）：

> 合流到我们主页赛博朋克的赛车，然后确保进入第一栋楼就是现在的 about，中间的转场、页面跳转或者什么动画你自己思考创新添加，确保连贯性。

产品口径拆成两句，必须同时成立：

1. **进入的第一栋楼就是 about**（主线目标确定性：变形后的第一站、城里唯一 `hallPath` 楼）。
2. **开局第一眼就看见它**（`ritual_idle` 视锥里 about 是可读的中轴远楼，不是车尾后方的盲区）。

Gemini 3.8 提案 `docs/local-cmd/proposals/AH-T1-transition-concepts.md` 评了 (a) 换内环 hero、(b) 改 spawn、(c) 任务置首 + 地面光带 + HUD，**没评指挥官补充的 (d)**：`about-pavilion` ↔ `now-signal` 互换 `position` + `parkingBay`（两楼同为 `|z|=150`、`x=-44` 镜像）。本包补评 (d)，并裁转场与 #234 合流序。

本包不重开：ADR-2 的 `hallPath` / `deepLink` / `world-arrival-v1` 字段 / 回城 `/?poi=` / 禁自定义 View Transition / 展厅不 import `src/lab/world/**`；ADR-3 的路线 C、首屏禁 three、Hall-R 懒加载、体积门、六站无年份。不编履历、不编年份。

---

## 核过的几何与测试事实（提案纠偏）

机位 `ritual_idle`（`src/data/camera-shots.json` L30–58）：`posterContract: "frozen"`，锚点 spawn `(0,0)`，`projectionAudit.buildings` = `agent-nexus` / `autodrive-lab` / `concept-garage` / `work-gallery`，**不含** `now-signal` 或 `about-pavilion`。相机约 `(12.13, 5.28, 16.08)` 看向西北。

本席亲跑 `node tools/camera/audit-x2-visibility.mjs`（1440×900 八角点）：

| 楼 | 坐标 | inFrustum | front | 开屏角色 |
|---|---|---|---|---|
| `now-signal` | (−44, −150) | **4/8** | 8/8 | 中轴北楼，ndc.x `[0.06, 0.31]`，ndc.y `[0.16, 1.38]`（塔顶出画） |
| `workflow-foundry` | (48, −150) | 4/8 | 8/8 | 北轴东侧配对 |
| `about-pavilion` | (−44, 150) | **0/8** | 0/8 | 机位后方，开屏不可见 |
| `agent-nexus` | (−52, −52) | 3/8 | 8/8 | 左前 hero，审计在册 |

`CityBlocks.ts` L22–31：`now-signal` 标 `firstFrame:'south', roof:true`（入帧楼 4/8）；`about-pavilion` 只有 `street:'east'`。立面投资跟的是**北槽位朝相机的南立面**，不是楼的叙事身份。

两楼不是视觉双胞胎，禁止「整包互换坐标」当零代价：

| | `about-pavilion` | `now-signal` |
|---|---|---|
| footprint | 36×36×**40** | 20×20×**72** |
| neon | `#fef3c7` | `#fb7185` |
| parkingBay | (−20, 150) heading 270 | (−26, −150) heading 270 |
| lod / spawnHd | standard，不在 `spawnHd` | 同左 |
| category / 街区表 | `civic` / 西南个人区 | `ai-core` / 北城 AI 中枢区 |
| unlockPhase | 1 | 2 |

盲换 `parkingBay`：about 宽 36m，东墙在 `x=-26`；接到 now-signal 的 `x=-26` 等于触发圈贴墙/穿模。必须按足迹重算泊位，不能抄坐标。

`FlightTrails.ts` L111 是注释里的避楼核对（M 环穿 now-signal / autodrive-lab 楼隙），不是数据绑定。about 更宽（36 vs 20）进北槽后，实现票必须复跑航线净距；不预支改航线。

e2e：

- `e2e/cyber-city*.spec.ts` **没有**对 now-signal / about 写死坐标或开屏像素断言。
- `e2e/cyber-city-explore.spec.ts` 主链读 `world-pois.json` 的 `quest.chain`（`CHAIN[0]`），换链首不改 spec。
- `e2e/visual/world-visual.spec.ts`：VIS-01/02 是静态壳 / ESC 的 `toHaveScreenshot`；VIS-03 是 canvas **非空统计**，3D 首幕**不建像素基线**（`cyber-city-test-framework.md` 视觉纪律）。
- `e2e/about-hall.spec.ts` 只锁展厅 URL / 到达条 / 降级，不锁城市场景坐标。

城市 LCP poster：rubric A10「重拍永远排所在批次最后」；登记视觉分缺口仍含 A10。改北槽运行时剪影会加大「静态壳 / 3D / OG」三面漂移，**但不自动打红** VIS-01（比的是 poster 图文件）或 `projectionAudit`（不审 now-signal）。

已有引导，提案 (c) 的「新地面光带」是重复建设：`QuestLine` 在 `car_ready` 才亮 64m 静态光柱 + HUD「下一站」（`robot_idle` 期强制隐藏，poster 恒等合同）。`camera-shots.json` 里**没有** `poi_showcase-about-pavilion`，当前 E 进 about 是直跳，没有 0.8s+0.4s 前奏。

---

## 决策 A · 第一栋楼布局：(c) 任务置首 ⊕ (d) 北槽换位

### Decision

**叠加采用。**

- **(d)**：`about-pavilion` 与 `now-signal` **只换世界槽位**（北槽 `z=-150` 给 about，南槽 `z=150` 给 now-signal）。`id` / `slug` / `deepLink` / `hallPath` / `category` / `districts[].buildings` **不换**。`parkingBay` **按新足迹重算**，禁止整包抄对方坐标。`CityBlocks.FACADE_PLAN` 的 `firstFrame:'south', roof:true` **随北槽走**：写到 `about-pavilion`，从 `now-signal` 撤掉；两楼 `street:'east'` 不变。
- **(c) 收窄**：`world-pois.json` `quest.chain` 首站改为 `about-pavilion`。HUD / 64m 光柱沿用 `QuestLine` 既有件。变形后车头朝北，光柱落在正前方约 156m 的 about 泊位。
- **否决 (c) 原文里的新地面引导光带**，以及「按 S 掉头」文案（换位后掉头是错指引）。
- **否决 (a)（换 `agent-nexus`）与 (b)（改 spawn）**，维持提案判断。
- **本 PR 不重拍城市 LCP poster**（A10 排合入后的视觉批次最后）。禁止把 poster 重拍塞进 #234。

### Rationale

磊哥要的是「进去的第一栋 = about」，指挥官补的验收是「第一眼也要看见」。单 (c) 只能给确定性：开屏 about 仍是 0/8，车头朝北却把人往南拽，第一栋很容易变成 nexus / now-signal。单 (d) 只能给第一眼：主链仍从 `concept-garage` 起，近处 hero 仍会截胡。两件叠在一起，车头、中轴远楼、光柱、任务芯片指向同一栋。

(d) 不是 (a)。(a) 拆 `spawnHd` hero、拆 `projectionAudit` 在册楼、拆 frozen 机位主体。(d) 换的是两栋 **standard**、同 `|z|`、审计未点名的外环楼；`ritual_idle` 机位与 spawn 不动。代价是北槽剪影从 72m 玫红细塔变成 40m 米色方馆——开屏**会变**，但变的是「远处那栋你正对着的楼变成 about」，这正是第一眼条款要买的。

新地面光带：若进 `robot_idle` 视锥，破 QuestLine 已锁的 poster 恒等；若推迟到 `car_ready`，与 64m 光柱重复，还要新路面 mesh、有循环配额风险。不加。

城市 poster 本波次不重拍：提分 Loop 的教训是 A10 永远排视觉批最后，且 LHCI `/` 的 LCP 就是这张图。#234 是展厅合流，不是 AL-VIS 批次；运行时与静态壳的漂移本来就挂在 A10 债上，本包把债写清楚，不假装没发生，也不在合流 PR 里消化。

街区表不换 id：`districts` 与 `category` 是身份（个人馆 vs 状态塔），不是坐标。换表会把 about 写进「北城 AI 中枢区」，语义比「迷你地图 civic 组里有一枚北钉」更假。Minimap 按 id 分组、钉点读 `position`，换位后钉会跳到北城，记为已知小裂，不阻塞。

确定性的上限：`QuestLine` 已锁「非强制、不锁楼」。本包不劫持 WASD、不关其它 11 个触发圈。确定性 = 链首 + 视锥 + 车头同向，不是唯一可进之门。

### Consequences

**要改的文件（实现票，本 ADR 不施工）**

| 文件 | 做什么 |
|---|---|
| `src/data/cyber-city-buildings.json` | about → `position (−44, −150)`，`parkingBay (−20, −150) heading 270 r=6`（东墙 `x=-26`，圈心再东 6m）；now-signal → `position (−44, 150)`，`parkingBay (−26, 150) heading 270 r=6`（保持相对东墙 ~8m） |
| `src/lab/world/city/CityBlocks.ts` | `FACADE_PLAN['about-pavilion'] = { street:'east', firstFrame:'south', roof:true }`；`now-signal` 只留 `street:'east'`；头注 4/8 入帧楼改 about |
| `src/data/world-pois.json` | `quest.chain` 首元改为 `about-pavilion`；其余四站相对顺序可保持 |
| `public/models/facade-kit/README.md` | 入帧楼名单随 FACADE_PLAN 改一句（文档，可跟 CityBlocks 同票） |

**不要改（本条）**：`districts[]`、`category`、`spawn`、`ritual_idle` 机位与 `posterContract`、`streaming.spawnHd`、城市 poster 图文件、`FlightTrails` 航线数据（先复跑，有穿模再另票）、`deepLink` / `hallPath`。

**e2e**

- 探索 / 任务 spec 跟 JSON，链首变更应绿；全量仍要跑一次，防驾驶走廊与北槽加宽耦合。
- 视觉 VIS-01/02 基线不因 3D 换楼而红；VIS-03 仍只断言 canvas 非空。
- about-hall spec 不因换位而改 URL。
- 实现票加一条：`audit-x2-visibility.mjs` 下 about `inFrustum ≥ 1` 且 `front = 8/8`（北槽可读）。
- 进站前奏 e2e 仍以有 `poi_showcase-*` 的楼为准；about 的前奏见决策 B。

**回城落点**：`/?poi=about-pavilion` 不变（ADR-2）。落点随 `parkingBay` 迁到 `(−20, −150)`，车头 270° 正对东立面。禁止第二种出生协议。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| 只 (c)，含新地面光带 | 零几何、南向光轨 + 掉头 HUD | 开屏 about 0/8，不满足第一眼；光带与 QuestLine 光柱重复或破 poster 恒等 |
| 只 (d)，不改 quest | 换位但链首仍是车库 | 近处 hero 仍截胡；确定性落空 |
| (a) 换 `agent-nexus` | 内环 hero 对调 | 打碎 `projectionAudit` 与 `spawnHd`；提案已否，本席维持 |
| (b) 改 spawn | 出生点搬到馆门 | 变形开场与十字路口宪法；提案已否 |
| 盲换 parkingBay | 连坐标一起抄 | about 36m 宽，抄 `x=-26` 穿模 |
| 顺手换 `districts` / `category` | 让北城表含 about | 把个人馆写成 AI 中枢，比钉点跳组更假 |
| #234 内重拍城市 poster | 消化 A10 | 排期铁律；LHCI `/` LCP 风险；与展厅合流归因缠在一起 |

### 不可逆点

- 楼 `id` 一经发布不可改（`CityMap.ts` 契约）。本条只搬家，不改 id。
- spawn 与 `ritual_idle` 机位本包仍冻。
- 换位本身可回滚；合入 main 后访客肌肉记忆从「南边那栋」变成「车头大道那栋」，回滚会二次打认知。
- 城市 poster 文件本包不动；A10 未跑完之前，静态壳与 3D 北槽不一致是**已知、接受**的债。

---

## 决策 B · 转场：方案 1 机位同构 + 光缆桥透视接力（含签名细节）

### Decision

**首选方案 1**（提案 B 方案 1）。方案 2 为书面次选，仅当方案 1 的 hold  overlay 在 SwiftShader 下证实 flake 才降级，不双轨并行。方案 3（FPV 径向模糊）否决。

签名细节（只准这一处 120%）：**城市 hold 期全屏边缘脉冲与展厅到达条圆点同色**，hex 单源 = `about-pavilion.neonColor` = `#fef3c7`（`--hall-neon`）。禁止第二套签名色，禁止车灯余晖 3D 通道，禁止音频。

### 连贯性验收口径（可写进任务书）

**城市侧（有 JS、圈内 E、且注册表有 `poi_showcase-about-pavilion`）**

| 项 | 锁死值 |
|---|---|
| 缓动 | 0.8s 至 showcase 机位（`PoiArrival` 既有 `TWEEN_DURATION`，不改数字） |
| hold | 0.4s（既有 `HOLD_DURATION`，不改数字） |
| overlay 触发 | **hold 起帧**（tween 结束、`phase='hold'` 的同一帧）挂一次性 DOM 类 |
| overlay 时长 | **400ms** 呼吸淡出，然后卸类；不得 infinite；不得进 CITY-03 循环配额 |
| overlay 颜色 | `#fef3c7`，从 buildings JSON 读，禁止硬编码第二份 |
| overlay 形态 | 全屏边缘霓虹（inset box-shadow / mask），暗底 `#05070d` 不变；禁止扫描线、禁止 named View Transition |
| 跳转 | hold 期满 `navigate()`：先写 `world-arrival-v1` 再 `assign(hallPath + ?from=city&poi=about-pavilion)`（ADR-2，不重开） |

showcase 机位（换位后的北槽）：锚 `buildingId: about-pavilion`，构图把**发光门廊 / 东立面**放在画面**右约 1/3**，左侧留夜空。禁止改 `ritual_idle`。无此条目时保持今日直跳（降级合法），但本票必须补条目——否则方案 1 不成立。

**展厅侧首屏**

- 构图：维持 ADR-1 左约 40% DOM 负空间 + 右侧光缆桥人物（`Hero.astro` 既有结构）。城市右 1/3 门廊 → 展厅右 2/3 桥面，是透视接力，不改 S0 场景、不改工作台。
- poster / 视频首帧：沿用已定选 S0-T；无 `src16x9` 时只出 poster（ADR-3）。
- 到达条：`HallChrome` 在既有楼名 / 探索 n/N / 回城链之外，**最多一行**驾驶卡短句。字段白名单 = `world-arrival-v1` 已有键。禁止新字段、禁止把 `neonColor` 写入 snapshot（ADR-2）。

文案模板（只许用这些；有则写，无则落到下一行，最后保底）：

1. 有 `maxKmh`：`最高巡航 ${Math.round(maxKmh)} km/h`
2. 否则 `coneHits > 0`：`途中碰倒 ${coneHits} 个锥桶`
3. **保底**（无快照或可选键全缺，但仍有合法 query）：`探索 ${exploreN}/${exploreTotal}`
4. 无 query / `poi` 不匹配：到达条不出现（ADR-2 G-Hall-10，不重开）

禁止写「顺利入库登桥」之类无字段句子。`t` 不是驾驶时长，禁止拿来编秒数。

**回城**

- 链：`HallChrome` 已有 `/?poi=about-pavilion`。
- 落点：`Areas.applyDeepLink` → 换位后的 `parkingBay (−20, −150)`，heading 270。
- 首帧：非 ritual 腿，挂载即车在泊位、触发圈高亮；**禁止**回城再播变形。驾驶键 0.1s 内 `PoiArrival.interrupt('drive')` 交还跟随（既有）。
- 泊位光圈：保持 CITY-03 纪律（常亮、零时间项）。允许 **一次** 与进站同色的 CSS/材质脉冲（事件驱动，<400ms），不得新开循环。

**三态**

| 态 | 城市 | 展厅 |
|---|---|---|
| `prefers-reduced-motion` | 跳过 tween **与** overlay；仍切 showcase 定帧，hold 0.4s 后 navigate（与今日 PoiArrival 降级同构，只是无脉冲） | 到达条可出现；`getAnimations()===0` 维持；chrome-dot 已 `animation:none` |
| 无 JS | 城里不跑引擎；楼宇快览仍 `deepLink=/about/`（ADR-2） | SSR：H1 + poster 可见；到达条 `hidden` |
| 移动端 | overlay 可走 CSS，不依赖指针 | 既有：不绑 scrub；poster 可见 |

**预算红线**：增量 JS 目标 0（PoiArrival 加一类名即可）；CSS < 1KB；不占 CITY-03；展厅循环动画仍 ≤5（到达条圆点已在配额内，overlay 一次性不算循环）；**不加音频**。

### Rationale

方案 1 吃的是已冻时序（0.8+0.4）和已冻路由，只补缺席机位 + 一次 DOM 脉冲 + 到达条读已有快照。SwiftShader 上 named VT 已是 flake 源（ADR-2）；方案 3 的 FPV 推镜加眩晕，且 `drive_fpv` 不是进站合同。方案 2 的通行证跨页，弱网会断档，DOM 更重。

签名用楼色而不用车灯：到达条圆点**已经**是 `#fef3c7`（`HallChrome.astro` L33–36）。hold 边缘同色，是零新资产的跨页记忆点，且不进 snapshot（楼色构建期查表，ADR-2 已禁写入）。

### Consequences

**要改的文件**

| 文件 | 做什么 |
|---|---|
| `src/data/camera-shots.json` | 增 `poi_showcase-about-pavilion`（锚 about，右 1/3 门廊；换位后坐标） |
| `src/lab/world/areas/PoiArrival.ts` | hold 起帧挂/卸一次性 overlay 类；reduced-motion 不挂；驾驶中断时卸 |
| `src/components/city/HallChrome.astro` | 读快照可选键，按上面模板写一行；无键保底 `探索 n/N` |
| 世界壳一次性 CSS | overlay 样式；优先挂在现有 world 注入样式，禁止新 named VT |

**不要改**：`Hero.astro` 首屏结构（除非机位标定发现左负空间不够——默认不够也不许扩 three）；`arrival-snapshot.ts` 字段集；`global.css` 的 `@view-transition { navigation: auto; }`。

**e2e**：about-hall 既有「合法 query 出到达条 / 非法不出 / 无 JS 见 poster」保持。新增或扩：城里 E about → 请求 URL 含 `from=city&poi=about-pavilion`；reduced-motion 路径无 overlay 动画。不要求像素级门廊对齐。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| 方案 2 首选 | 全息通行证跨页展开 | 弱网断档；增量 DOM 更大；与光缆桥首屏构图无关 |
| 方案 3 | FPV + 径向模糊 | 眩晕；时序合同外的镜头；reduced-motion 硬切更脏 |
| 自定义 View Transition / 扫描线 | named VT | ADR-2 已锁；SwiftShader flake |
| 车灯余晖 3D | 另一签名 | 配额与引擎面；签名只准 DOM 同色 |
| 音频 | 进站音效 | 章程人门已禁自动播音；本包明示零音频 |
| 用 `t` 写「驾驶 Ns」 | 快照误用 | `t` 是末条事件时间戳，不是时长 |

### 不可逆点

- 进站 URL 与快照键名继续冻（ADR-2）。
- 0.8s / 0.4s 是 CAM F1 合同，本包只消费不改数字。
- 方案 1 一旦合入，缺 `poi_showcase-about-pavilion` 的直跳成为测试失败，不再是默认。

---

## 决策 C · PR #234 合流序

### Decision

磊哥已令合流 `main`。合入前清单**按这个顺序**，前一步未过不得开下一步。i2v 瘦身版**能赶上就进仓，赶不上不挡合流**。

**合入前（阻塞）**

1. **渲染页清掉 `[[占位:…]]`**（见下方处置）。W3d / W7a 门绿提交已在分支上则勾掉，不必重做。
2. **布局票 AH-T1a**（决策 A）落地 + 定向 e2e（explore 任务链、visibility about 入帧、泊位不穿模）。
3. **转场票 AH-T1b**（决策 B）落地 + 定向 e2e（进站 query、到达条文案、reduced-motion 无 overlay 动画、回城 `/?poi=about-pavilion`）。
4. **i2v 瘦身版**：本轮已开的瘦身批若机器门绿（体积 / 30fps / 无音轨 / 时长 / sha）则写入 `public/media/about-hall/` + `about-hall-media.json`。3 连 REJECT 或批次未收口 → **跳过**，静帧开页仍合法（ADR-3 决策 C）。禁止为等片把合流令挂起。
5. **干净端口全量 e2e 一次**（0 failed / 0 skipped / 0 flaky）。历史截图若被测试改写，提交前还原（L10 已有教训）。
6. merge #234。

**合入后 W8（不阻塞 #234）**

- 六站履历 `NEEDS_LEIGE`：磊哥给真句子再填回 `gap`；没给就维持删行。
- S0-R 存档：人拣已定 T 转正，R 不进本 PR。
- 城市 LCP poster A10：决策 A 换位后的视觉 Loop，排该批最后；LHCI `/` 与 `/home/` 四项不降。
- `FlightTrails` 若 T1a 复跑发现穿模，单独修航线。
- `/world/about-pavilion/` 进 LHCI collect：仍 DEFERRED（ADR-2）。

### `[[占位]]` 处置：删行，不用通用句

渲染页（`Stations.astro` 输出的 `hall-gap` / `gapSolo`，数据在 `src/data/about-copy.ts`）合入前 **不得出现** `[[占位：…]]` 字面。

- **删** `stages[].gap` 的渲染与字段内容（或字段留空且模板不输出空 `<p>`）。
- **删** 工作台 `gapSolo`。
- **留** 各站已有 `note`（「设备连接与数据链路的工程地基」这类已是真描述，不是假里程碑）。
- **禁止** 用另一句「代表性工程」去填缺口：那是编经历。ADR-3 NEEDS_LEIGE 原文：「没有就删该行，不填假项目」。

S6「片源待接入」**不是** `[[占位：磊哥]]` 模式：无 mp4 时允许诚实降级文案；有片则按 ADR-3 接上并删该占位块。

### Rationale

合流令高于「把 W1 视频做完」。W3d / W7a 已 HOST_READBACK_PASS，不必当新阻塞。占位括号一旦进 GitHub Pages 就是公开履历缺口，必须在 merge 前从渲染树拿掉。A10 与展厅 LHCI 是另一条视觉/性能战役，塞进 #234 会把「第一栋楼」归因搅进 poster 体积。

### Consequences

- 合入前 `rg '\[\[占位' src/` 必须为 0（或只剩注释 / 非渲染文档；渲染组件不得输出该字面）。
- INDEX 的履历项保持 `NEEDS_LEIGE`，W8 再填。
- 全量 e2e 分母以当时 `--list` 为准，不拿历史 86/93 当门。

### Rejected alternatives

| 选项 | 内容 | 否决理由 |
|---|---|---|
| 等 i2v 必进仓再 merge | 视频当合流门 | 磊哥已令合流；ADR-3 已认静帧降级 |
| 通用句填 gap | 「代表性攻坚」一类 | 编经历 |
| 占位留着合入、W8 再删 | 公开页带内部括号 | 任务书已禁 |
| #234 顺手 A10 重拍 | 城市 poster 与展厅同 PR | 排期铁律 + LHCI 归因 |

### 不可逆点

- merge 后 `origin/main` 带换位与转场；回滚换位等于第二次搬家。
- 占位一旦从渲染树删除，未填履历不会「暂时显示缺口」——公开页就是没有那一行。

---

## 与 ADR-1 / 2 / 3 的分工

| 问题 | 以谁为准 |
|---|---|
| S0=桥、左负空间、S6 唯一变身、T 转正 | ADR-1（人拣结果不在本包重开） |
| `hallPath` / `deepLink` / 快照字段 / 回城 `/?poi=` / 禁自定义 VT / G-Hall 引擎针 | ADR-2 |
| 首屏禁 three、Hall-R 懒加载、体积数字、无视频可开页 | ADR-3 |
| 哪栋楼是第一站、城厅怎么接、#234 先做什么 | **本包** |

---

## NEEDS_LEIGE

| 项 | 为什么必须磊哥 | 建议 |
|---|---|---|
| 六站真实事迹 | 履历；董事会不编 | 合入后各站一句工程类型或里程碑；没有就继续不写 gap |
| PR #234 点 merge | 发布权 | 决策 C 清单勾完后点 |

其余（换位、方案 1、删占位、A10 不进本 PR、i2v 不挡合流）本席已裁，不再问。
