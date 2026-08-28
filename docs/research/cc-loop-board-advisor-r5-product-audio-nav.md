# CC-LOOP-BOARD-ADVISOR-R5-PRODUCT · 董事会终裁（产品包：视角旋转 / 小地图 / 缩略图导航 / 声音 + 性能 85 声明处置）

- **角色**：CC-LOOP-BOARD-ADVISOR-R5-PRODUCT（董事会），指挥官 2026-08-28 明示咨询触发；书面裁决 = 父代理与所有子代理必须执行的董事会决议（权威口径沿 R1 [#143](https://github.com/rayw-lab/website/pull/143) 固化条款）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/board-wt-r5`；base = main@`483b942`；文件域 = 仅本文档。
- **取证窗口**：2026-08-28 09:24–09:35 UTC，`gh` 实测 + 仓库一手文档 + `git` 世系核验。

---

## 0. 本单 fresh 事实（全部 `gh`/`git` 实测）

| # | 事实 | 证据 |
|---|------|------|
| **F1** | main@`483b942`（SEC-FXN87 收口件 [#146](https://github.com/rayw-lab/website/pull/146) 已合）；登记矩阵单源 = 综合 80 / 视觉 73 / 功能 87 / 性能 — | `git log` + 看板 |
| **F2** | **run8 证据已上链**：#129 tip `f5e8adb`「run8 同机决定趟证据上链——`RUN8_EXIT=0` ~18.2m；×2 leg2 **待独立复核**」；即指挥官口径「run8 刚 PASS」的精确态 = 证据在链、AUDITOR-RUN8 复核**未派** | `gh pr view 129` commits |
| **F3** | run7 复核 GO 在案：[#154](https://github.com/rayw-lab/website/pull/154)（AUDITOR-RUN7，×2 0/2→1/2，IGNITION-run8 先签后飞四条件放行）；[#153](https://github.com/rayw-lab/website/pull/153)（run5 审计）被 #154 **整份作废** | `gh pr view 154` |
| **F4** | R4-PERF 终裁在链：[#155](https://github.com/rayw-lab/website/pull/155)（draft·MERGEABLE）——性能首分唯一合法路径 = 指挥官真机六腿 → CC-AL-PERF 双门登记；**捷径八禁含「自评预登记」**；六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已在 main | `gh pr view 155` |
| **F5** | 产品四诉求的仓内既有定谳：① 声音——`cyber-city-gameplay-features.md` G3（P0，WebAudio 纯合成，全站音频字节 = 0，`PhysicsVehicle.ts` 移植时砍除 onCollision 音效钩子自认在档）；② 小地图——`cyber-city-gameplay-gap-audit.md` GAP-12（POI 发现性 P0：无罗盘/距离/小地图）+ folio `Game/Map.js` 192 行 canvas 小地图 teardown 在档（V2 裁定）+ adaptation 篇已预案「M 键/小地图点击传送」；③ 视角——`github-vehicle-camera-survey.md`（CC-VEH-RS，16 仓库）**明文裁定鼠标自由环视为 CAM 红线禁用面**（PUBG Alt 不抄）；④ 自动降帧已落地运营 | 一手文档 |
| **F6** | 文件域现状：`src/lab/world/` 下 view/（View.ts+CameraShots.ts）、inputs/（Keyboard/Pointer/Nipple/RayCursor）、world/（Reveal.ts DOM-HUD 先例、DriveFeedback.ts）、areas/（QuestLine/PoiArrival/ExploreProgress）；**无 audio/ 目录**（绿地）；M 键、鼠标拖拽通道均未被占用 | `ls src/lab/world/*` |
| **F7** | 全量 e2e 现行口径 = 看板「全量 0 failed/0 skipped/0 flaky」（80 例口径，单源 `cyber-city-test-framework.md`）；跑道互斥永久硬令（R1 §3.5）在册 | 看板阻塞区 |

---

## A. 终裁：性能 85 指挥官自评——**不入生产登记第四行，第四行维持 `—`**

**裁决**：指挥官口头/聊天自评 **85 不得写入生产登记**；开**「指挥官声明档」**（情报账），northStar 85 不动。与 [#155](https://github.com/rayw-lab/website/pull/155) **无冲突**——分账即解。

1. **法理三条**：① #155 捷径八禁第七禁「自评预登记」明文在案，且该终裁本身经指挥官授权立法；废止须**书面明示废止令**，聊天中的分数陈述不构成废止文书；② 看板单源纪律「登记只认审计独立分」四维一体——功能 87 也是审计 JSON 单源落账，性能开自评特例 = 制度整体失效；③ 85 恰等于性能北极星：自评直登 = 性能轨**零证据即时收官**，此后任何真机回归无基线可比。
2. **情报账 vs 资格账（采纳并定形）**：**情报账全额入账**——这是全项目第一个真机性能主观数据点，价值极高：(a) 作为 AL-PERF 先验假设 H0「真机综合体验 ≈85」；(b) 证明指挥官真机在手且已实玩 = **六腿采集边际成本最低的窗口正在敞开**（父代理动作 E-4）；(c) 资源配置信号：性能轨重心从「优化实现」转向「取证登记」。**资格账零入账**。
3. **落地机制**：看板新开「指挥官声明档」小节，一行一声明（日期 / 原文 / 维度 / 情报账用途 / 资格账状态=未登记）；登记矩阵第四行维持 `—`，允许加注「（指挥官声明 85 · 情报账 · 非登记分）」；AL-PERF 交付后声明行标注「已被审计分取代/印证」。
4. **若指挥官意图为钦定直登**：唯一合规路径 = 指挥官书面明示「废止 #155 八禁之七，性能第四行以指挥官钦定分登记」，且登记值必须带口径注记「钦定·非审计分」永久随行。董事会**不建议**：真机六腿（#96 桌面单）约 30 分钟即得干净资格分，成本远低于口径污染。

## B. 终裁：产品包优先级、波次、串并行与文件域

**优先级定序**（价值 × 依赖 × 风险）：**① AUD 音效五事件 v0（合成先行）＞ ② NAV-M 小地图+点击进楼 ＞ ③ CAM-ROT 左键旋转 ＞ ④ BGM 资产落地 ＞ ⑤ 缩略图导航（并入 NAV v1.5，不独立立项）**。

- ①② 均为已审计定谳的 P0 缺口（G3 / GAP-12）直接清偿，文件域正交、零红线冲突；③ 触 CAM 红线（F5-③）需**红线修订案 + 指挥官签字 + DES 先行**；④ 依赖许可/体积调研（C-1）；⑤ 与小地图目标重合（都是「找楼→进楼」），裁定为小地图面板内的**楼卡缩略条**（12 楼横滑卡片，点击=同小地图进楼语义），避免两套导航 UI 分裂心智。

**波次（三波，门控串行 + 波内并行）**：

| 波 | 内容 | 开工条件 | 形态 |
|----|------|----------|------|
| **W-R5-0 调研波** | CC-AUD-RS ∥ CC-VEH-RS-R2 ∥ CC-NAV-RS ∥ CC-CAM-ROT-DES（§C 四单） | **立即**——docs-only 零跑道，与 run8 复核完全并行 | 四 Task 并行，各自单 PR（docs 文件域四分） |
| **W-R5-1 实现波** | AUD-C1（五事件合成音 + 静音钮）∥ NAV-C1（M 小地图 + 点击进楼 + M 键） | **#129 合流后**（run8 复核 GO → 签字门 → 合流），base = post-#129 main | **两 PR 并行**（文件域正交，见下表）；段末试合并 + 合流树冒烟必做（同一运行时链路并行例外条款） |
| **W-R5-2 增强波** | CAM-ROT-C1（旋转）· BGM-C1（资产 BGM）· NAV-C1.5（缩略条） | CAM-ROT：DES 签字 + **X2 链（#134→#104）收口后**；BGM：CC-AUD-RS 许可/体积裁决后；NAV-C1.5：NAV-C1 合流后 | **三件各自单 PR，禁并**（归因隔离） |

**与三轨串并行裁决**：

1. **vs #129 ×2 门**：实现波一律门后（避免 rebase 灾难 + 全量 e2e 窗互斥）；调研波即刻并行，零冲突。
2. **vs 视觉轨（#134→#104 门后件 + AL-VIS 复评）**：NAV/AUD 与 city 几何零文件交集，可并行；**CAM-ROT 必须串行在 X2 链收口 + AL-VIS 复评之后**——视觉复评依赖固定机位前后帧对照，旋转通道先落会污染取证面（提分批次永远单 PR 的同一法理）。
3. **vs 性能真机窗**：真机六腿零 VM，与 VM 侧一切活动物理零冲突；唯一交点 = 实现波全量 e2e 窗仍受互斥硬令约束（登记空档执行）；BGM 体积证据必须在 LHCI 门前置审。

**同 PR / 分 PR 与文件域隔离**：

| 件 | PR 形态 | 文件域（新增/触碰） | 禁入区 |
|----|---------|--------------------|--------|
| NAV-C1（M 小地图+点击进楼） | 单 PR（同一子系统闭环：M 键+面板+点击语义） | 新 `src/lab/world/ui/`（或 world/Minimap.ts）+ `inputs/Keyboard.ts`（M 动作 +1）+ areas 数据只读 | `view/View.ts`、city 几何、physics |
| AUD-C1（五事件音 v0） | 单 PR | 新 `src/lab/world/audio/`（绿地）+ Player/TransformSystem/PhysicsVehicle 各 ≤5 行事件挂钩 + 静音钮 DOM | `view/`、城市数据、e2e 既有断言语义 |
| CAM-ROT-C1（左键旋转） | 单 PR，**永远独立** | `view/View.ts`（受控偏移通道）+ `inputs/Pointer.ts` | 机位常量/`CameraShots.ts` 默认值逐位不动（0 恒等叠加通道） |
| BGM-C1 | 单 PR（资产+许可+体积独立归因） | `public/` 音频资产 + audio/ 播放器扩展 + credits 落点 | 首页关键路径、首包 |
| NAV-C1.5（缩略条） | 单 PR 追加 | ui/ 面板内部 + 楼卡缩略资产 | 同 NAV-C1 |

**自动降帧**：指挥官认可，**保留背书登记一行**（看板），零动作项、不开单、不扩批。

## C. 终裁：调研先行清单（W-R5-0 四单，全 docs-only）

| Task | 范围 | 产出物路径 |
|------|------|-----------|
| **CC-AUD-RS**（声音库/音源选型） | **选型标准四条**：① 许可——库代码 MIT/Apache/BSD（禁 GPL/LGPL）；音源 CC0 首选、CC-BY 须 credits 页落地、**禁 NC/ND/SA 传染与无许可音源**（Mario-Kart 无 LICENSE 案的同一法理）；② 体积——单效 ≤50KB、BGM 循环 ≤1.5MB，opus/ogg + m4a 兜底，全部懒加载，首页传输 <200KB 红线外；③ 赛博气质——darksynth/synthwave 系，且可与既有 WebAudio 合成层（G3 v0）混合分层：**合成管事件音、资产管 BGM**；④ 引擎——默认零依赖原生 WebAudio（G5 依赖红线），Howler.js 类仅在跨浏览器解锁复杂度实证不可控时走 SRD 审批。候选源实测：Kenney（CC0 sci-fi 包）、freesound（CC0 过滤）、OpenGameArt、Pixabay Audio、itch.io CC0 包；每曲/每包逐条登记 SPDX + 体积 + 试听结论。五事件映射表：加速/行驶（引擎振荡器速度映射）/刹车/撞楼（impulse 分档）/变形（whoosh 对齐四拍）+ BGM 默认赛博 loop | `docs/research/cyber-city-audio-survey.md` |
| **CC-VEH-RS-R2**（PUBG 网页来源版本回顾+补研，指挥官点名续篇） | 回顾正本 = `github-vehicle-camera-survey.md`（16 仓库、V 键/FPV 已定谳，零重复调研）；**补研四面**：① PUBG 载具**音效分层**观察口径（引擎转速档/胎噪/撞击/上下车提示音）→ 五事件映射表校准；② 网页端大逃杀/io 系开源实现（surviv.io 开源分叉、krunker 类）的**小地图/标记/音频**工程模式；③ PUBG M 键全屏地图 UX（开合/标记/边缘指示）→ 本站 M 小地图交互对照表；④ 开源引擎声合成样本（procedural engine sound）可借参数。全仓库 `gh api` 实测许可/星数/活跃，沿 CC-VEH-RS 方法学 | `docs/research/pubg-web-vehicle-audio-nav-r2.md` |
| **CC-NAV-RS**（小地图/缩略图导航） | folio `Map.js`（192 行 canvas + 玩家标记）复用性核验；**三裁决点给 DES**：① 点击进楼语义——传送到 parkingBay + 走既有进站流（保 `world-poi` 漏斗）vs 直跳楼页（快但断裂），董事会倾向前者；② 缩略图来源——楼卡截图（固定机位批拍，poster 工艺复用）vs 矢量图标；③ poster/恒等约束——robot_idle 态一切导航 UI hidden。含键盘可达性方案（§D） | `docs/research/cyber-city-minimap-nav-survey.md` |
| **CC-CAM-ROT-DES**（旋转视角规格 + 红线修订案） | CAM 红线 v2 修订案文本：自由漫游维持禁止，新增**「受控临时环视」**合法类目——左键按住 = 现行机位球坐标上的**有界偏移**（yaw ±≤60° / pitch ±≤20° 量级，DES 定稿），**松手回中**（reduced-motion 直切）、驾驶输入即回中、非驾驶态/ritual/robot_idle 恒等无效、零 pointer-lock、offset=0 IEEE 逐位恒等（ritualCam 同范式）。修订案送**指挥官一次性签字**后 CAM-ROT-C1 才可开工 | `docs/spec/cyber-city-camera-orbit.md`（草案先落 research 亦可） |

## D. 终裁：实现门禁（W-R5-1/2 每 PR 放行必查）+ 禁项

**硬门六条**：

1. **e2e**：全量 0 failed / 0 skipped / 0 flaky（现行全量口径，单源 `cyber-city-test-framework.md`）+ 每 PR 新增断言最低集——NAV：M 开/Esc 关、键盘选楼、点击进楼路由断言、robot_idle 态 hidden；AUD：首手势前**零 AudioContext 实例**、静音钮持久、事件音触发计数；CAM-ROT：拖拽偏移生效 + 松手回中 + 非驾驶态零效果 + offset=0 恒等回归；全量窗按互斥硬令登记空档执行。
2. **无障碍**：小地图 `role`/`aria-label` + 键盘全等价（M 开、Tab/方向键选楼、Enter 进入、焦点陷阱与还原）；静音钮可聚焦 + `aria-pressed`；拖拽旋转有键盘等价或显式声明为桌面指针增强（不承载必经功能）。
3. **reduced-motion**：旋转惯性/回弹、地图开合动画、任何音频联动视觉脉动——全部直切或禁用；音频本体与 reduced-motion 口径独立，但 mute 常驻可达。
4. **自动播放政策**：Chrome/Safari autoplay policy 下有声播放必须用户手势解锁——AudioContext 懒创建 + 首手势 `resume()`；**BGM 默认不自动有声**（默认 off 或 muted-until-gesture，显式开关 + localStorage 记忆）；iOS 需在手势 handler 内同步解锁。禁任何「加载即响」。
5. **poster/恒等**：robot_idle poster 逐字节恒等——新 UI 在 robot_idle/transforming 一律 hidden；旋转/音频不改首幕渲染路径；缩略图批拍资产不动既有像素基线。
6. **LHCI + 体积**：`/` 与 `/home/` 四项不降；音频资产禁入首包与首页关键路径；BGM PR 附传输体积实测证据。

**禁项八条**：① 禁 GPL/LGPL 音频库与无许可/NC/ND 音源；② 禁 pointer-lock 与自由漫游相机（旋转 = 有界偏移带回中，修订案外形态一律非法）；③ 禁 BGM 自动有声播放；④ 禁 CAM-ROT 改动 `drive_third`/CameraShots 默认机位常量（叠加通道，0 恒等）；⑤ 禁与 ENV 决定趟/全量 e2e 窗并发任何 chrome 级活动（R1 §3.5 永久硬令沿用）；⑥ 禁自评分入登记（§A）；⑦ CITY-03 循环动画配额 ≤3 席不破（音频可视化如有，一律事件驱动一次性）；⑧ 实现波执行中禁扩批（一段一 PR，范围 = 任务书清单）。

## E. 终裁：父代理立即动作（≤8 条，命令式）

1. **即派 CC-LOOP-AUDITOR-RUN8**（Fable5 xhigh，异机独立复核 run8 leg2 `f5e8adb`，#154 §4 四条件为硬门）——**#129 合流与一切跑道动作等复核结论**，禁抢跑；
2. **同窗并行派 W-R5-0 三调研 Task**（Fable5 xhigh，docs-only 零跑道）：CC-AUD-RS / CC-VEH-RS-R2 / CC-NAV-RS（§C 任务书 + 产出物路径照抄）；
3. **派 CC-CAM-ROT-DES**（规格 + CAM 红线修订案文本，交付后送指挥官一次性签字；零实现）；
4. **性能 85 按 §A 落账**：看板开「指挥官声明档」入情报账，第四行维持 `—`；同一回复向指挥官**置顶重发 [#96](https://github.com/rayw-lab/website/pull/96) 六腿桌面单**（真机在手 = 采集窗口最优时刻）；
5. run8 复核 GO → 签字门 → **合 #129**，随即开 W-R5-1（AUD-C1 ∥ NAV-C1，base = post-#129 main，任务书含 §B 文件域表与 §D 门禁全文）；
6. **禁 fps-probe/一切 chrome 级探针**直至 run8 复核收口；此后仅按登记空档 + 真空三查 + 硬闭点执行（永久硬令复读）；
7. **存档波续跑**：本单 + #154/#155/#151/#152 等 docs-only 每波 ≤5 批量合并；[#153](https://github.com/rayw-lab/website/pull/153) 已被 #154 整份作废——close 并登记 superseded；
8. **自动降帧背书登记一行**（指挥官认可，保留现状），零新单；看板本轮同步 §A/§B 波次表（秘书下一界点单并入，禁临时单）。

---

## 登记矩阵四行（看板单源口径）

北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 73 / 87 / —**（综合/视觉/功能/性能）。性能显式 **—**，解锁条件 = 指挥官真机六腿 → AL-PERF（[#155](https://github.com/rayw-lab/website/pull/155) 唯一合法路径；本单 §A：指挥官声明 85 已入情报账，非登记分）。视觉 73 为看板单源（AGENTS.md 71 已裁 stale）。

## 附：WBS 短表（产品包全景）

| 代号 | 交付物 | 波 | base | 门 |
|------|--------|----|------|-----|
| CC-AUD-RS | audio-survey 调研 | W-R5-0 | main | 交付即用 |
| CC-VEH-RS-R2 | pubg-web r2 调研 | W-R5-0 | main | 交付即用 |
| CC-NAV-RS | minimap-nav 调研 | W-R5-0 | main | 交付即用 |
| CC-CAM-ROT-DES | 旋转规格 + 红线修订案 | W-R5-0 | main | **指挥官签字** |
| AUD-C1 | 五事件合成音 + 静音钮 | W-R5-1 | post-#129 | §D 六门 |
| NAV-C1 | M 小地图 + 点击进楼 | W-R5-1 | post-#129 | §D 六门 |
| CAM-ROT-C1 | 左键受控环视 | W-R5-2 | X2 链收口后 | 签字 + §D 六门 + AL-VIS 后 |
| BGM-C1 | 赛博 BGM 资产 | W-R5-2 | AUD-C1 后 | 许可/体积审计 + §D 六门 |
| NAV-C1.5 | 楼卡缩略条 | W-R5-2 | NAV-C1 后 | §D 六门 |

---

*本文档为 CC-LOOP-BOARD-ADVISOR-R5-PRODUCT 交付物（董事会终裁）；A–E 全答，链接经 `gh` 实测；看板增量由秘书下一界点单并入，禁多处重复登记。*
