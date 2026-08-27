# 赛博科技城功能测试方案 v1.0（CC-FXN-TEST-DES 正本）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-FXN-TEST-DES**（Loop 8 功能线 doc-only）——把 playtest、e2e、function-smoke、AL-FXN 审计取证四层整合为**一份执行正本**：谁在哪一层跑什么、产什么工件、过什么门 |
| 分支 | `cursor/cc-fxn-test-plan-1d6f`（base：`main`） |
| 日期 | 2026-08-27 |
| 定位 | **执行正本，不是改秤**：功能 rubric 权重/锚点/S-2·S-5 脚本归 `docs/spec/cyber-city-function-rubric.md`（v1.0 冻结），smoke 算法/事件白名单/dump schema 归 `docs/spec/cyber-city-observability.md`（冻结）——本文件对两正本的冻结面**零改动**，只锁四层协作面与 CC-FXN-C1…C4 的断言合同 |
| 冻结时点事实 | main `f2c6f99`：OBS-C1/C2（#57）· FXN-C2 驾驶反馈包（#56）· VEH-VIEW V 键（#54）· CAM-VIEW `?shot=` 深链 · TRANS-FX 粒子均已合流；e2e 全量 **64 用例 / 12 文件 / 五 project**（`playwright test --list` 实测）；function-smoke 在 OBS-01/01b 双 dump 下满分 100、knownGaps 空表；两登记 JSON 均未登记（northStar function/perf = null）；在途：CC-FXN-C1（键位/引导人性化包，RUNNING）· CC-VEH-C2（AL-VEH NO-GO #58 整改：camera registry 单源 + reduced-motion FPV 硬切）；FXN-C3/C4 未派 |
| 上游 | 功能 rubric §4（S-2/S-5 脚本）/§6（登记 JSON）/§7（四层分工冻结镜像）· 可观测规格 §3（dump schema + 白名单）/§6（CI 工件 + smoke 算法 + northStar）/§7（CITY-OBS 用例）· `e2e/cyber-city-observability.spec.ts` · `e2e/cyber-city-feedback.spec.ts` · `scripts/function-smoke.mjs` · `scripts/score-loop.mjs`（northStar 已落地）· 顾问报告 §4.2（C1…C4 PR 序）· FXN-BR `docs/research/cyber-city-gameplay-features.md`（C1/C4 形态底稿） |
| 消费方 | CC-FXN-C1…C4 实现代理（§3 断言合同 = 合并门增量）· CC-AL-FXN（§1 第四层职责 + §5 登记前回归核对单）· 父代理看板（§4 northStar 四数读法）· CC-OBS 批次（§4 quality-loop 加法建议） |

---

## 0. 结论先行

1. **四层各守各门，谁也不许替谁签字**（§1）：e2e 挡合并、function-smoke 当哨兵（软门）、rubric playtest 挡登记、AL-FXN 是唯一登记人与证据链执法者。四层消费同一条埋点管道（SessionTimeline dump），但**判定权威互不传递**——e2e 64/64 绿与 smoke 100 分加起来也不构成功能 90 的任何一分（rubric §7 / 禁止清单第 2 条）。
2. **C1…C4 断言合同**（§3）：每个功能批次的合并门 = 既有回归硬门（§5）+ 本文件对应批次「新增断言清单」全绿 + 埋点随行（白名单 §3.4 表同 PR 更新）。FXN-C2 已合流，其 CITY-FB-01…06 即是本合同的落地示范（呈现 ⇔ 埋点互证先例）。
3. **smoke 分母冻结不随批次漂移**：coverage 四项（cone-hit / respawn / world-poi / world-drive-view）与漏斗七步是趋势哨兵的**恒定分母**（OBS §6.2「分母跨轮恒定」）。C3 的 `shot-apply` / C4 的目标事件**不进** coverage——它们的存在性断言职责在 e2e 层（§3.3/§3.4）；要扩分母必须走 OBS 规格 §6.2 修订，本正本默认不动。
4. **CI 集成是五步单向链**（§4）：build → e2e（world-chromium 产 session-dump）→ function-smoke（读 dump 出 `FUNCTION_SMOKE=` 哨兵）→ score-loop（读两登记 JSON 汇总 northStar 四数）→ 看板消费。northStar 的 function/perf **只认** `docs/research/cyber-city-{function,perf}-rubric-score.json` 的 `score` 字段，缺失置 null 明示——冒烟分永不流入 northStar。
5. **回归硬门清单**（§5）十条：e2e 全量不降（冻结时点 64/64）· LHCI 不降 · audit-budget 零 ❌ · `ritual_idle`/poster 恒等 · reduced-motion 双轨 · CITY-03 循环动画配额 · 埋点随行 · pageerror 断零 · smoke 无退化（软门趋势）· 登记轮回归面不塌（rubric §6.3-4 的执行面）。rubric 正本中的「52/52」是其冻结时点数字，硬门语义一律取「**全量不降**」，以当轮 `playwright test --list` 计数为准（§5 注 1）。

---

## 1. 四层分工正本（冻结镜像的执行展开）

rubric §7 与 OBS §6.5 已冻结四层门语义；本节把它展开为**可执行的责任矩阵**。性能双轨（CI 证据包下界 + 真机 human-gate 判定）与本四层并列，归 rubric §5，本文件不重复。

### 1.1 责任矩阵

| 层 | 判定什么 | 显式**不**判定什么 | 执行者 · 时机 | 工件 | 门语义 |
|----|----------|--------------------|---------------|------|--------|
| **① e2e**（`world-chromium` 串行 project 为主） | 状态机可达、DOM 契约（`data-world-state` / `data-drive-view` / 反馈层 SEL）、八出口不破、dump schema/导出面/dispose 合同（CITY-OBS-01…05）、**呈现 ⇔ 埋点互证**（CITY-FB 先例） | 体验好不好（速度感/乐趣/可懂）、任何时长阈值（SwiftShader 禁令，OBS §7 尾注） | 实现代理每 PR · 合并前全量 | `test-results/e2e-results.json` · `session-dump-funnel.json` / `session-dump-cones.json`（OBS-01/01b 产出）· 失败 trace | **挡合并**（硬门，不降） |
| **② function-smoke**（`scripts/function-smoke.mjs`） | 漏斗七步完整性 70% + 交互面覆盖 30%（读 dump，纯存在性/顺序性） | 时长/帧率（算法禁令）、体验分（哨兵不是登记分） | CITY-OBS-06 随 e2e 自动跑；quality-loop `--full` 档独立复算（§4.2 步 ③） | `test-results/function-smoke.json` + stdout 末行 `FUNCTION_SMOKE=<0-100>` + OBS annotation | **软门**（哨兵：看跨轮趋势；转硬时机归父代理拍板，OBS §9-4） |
| **③ rubric playtest**（S-2 v1.0 + S-5 v1.0） | 「2 分钟体验合不合格」：七维锚点打分（F1…F7），脚本优先/反馈闭环/F7 强制配套三铁律 | 视觉工艺（视觉 rubric 承载）、壳加载（LHCI 承载）、状态机可达性（e2e 承载） | AL-FXN 亲自执行 · C1–C4 合流后的登记轮（预演可随时，**登记必须真跑**） | 全程录屏 + 每腿 `session-dump-<s2\|s5-腿名>-<yyyymmdd>.json` + 三问原文（rubric §3.2 取证环境规程） | **挡登记**（分数只能由本层产生） |
| **④ AL-FXN 审计取证** | 双 Pass 合议（Pass A 脚本观察 / Pass B 锚点量表，分歧 >10 逐维合议）、逐维证据链核验（≥1 dump 事件 seq/t + ≥1 录屏时间码）、登记 JSON 写入与 §6.3 有效性校验、禁止清单八条执法 | 实现细节评审（归 PR review）、性能真机行（human-gate 通道，产不出留空） | Sol（CC-AL-FXN，唯一登记人）· 登记轮 | `docs/research/cyber-city-function-rubric-score.json`（+ perf 同构位）· 审计报告 | **唯一登记出口**（实现方自评永不登记） |

### 1.2 层间数据流（单向）

```
SessionTimeline（game.session，白名单 27 type）
  │
  ├─ ① e2e：page.evaluate(__worldSession.dump()) ──→ session-dump-*.json（证据非门）
  │        └─ 呈现⇔埋点互证断言（CITY-FB 先例：toast ⇔ respawn{reason}）
  ├─ ② smoke：只读 ① 的 dump 并集 ──→ function-smoke.json + FUNCTION_SMOKE=
  ├─ ③ playtest：每腿手工 dump 落盘 ──→ 逐维证据（seq/t + 录屏时间码）
  └─ ④ AL-FXN：消费 ③ 的证据 + 核对 ①② 回归面 ──→ 登记 JSON（score 唯一机读位）
                                                      │
scripts/score-loop.mjs ── northStar 只读汇总 ←────────┘
  └─→ test-results/quality-score.json（visual / function / perf / composite 四数）
```

**铁律**：数据只向下游流。④ 可以引用 ①② 作**必要条件**（回归面不塌），①② 永远不能向上冒充 ③④ 的分（禁止清单第 2 条）；③ 的分只能经 ④ 落入登记 JSON，任何直接改 JSON 的路径都是登记无效（rubric §6.3-5）。

### 1.3 冻结时点执行底座盘点

| 底座 | 事实 |
|------|------|
| e2e 布局 | 64 用例 = desktop-chromium（site-health 4 · home 5 · lab-index 4 · car-configurator 7 · tts-cockpit 7）+ mobile-375（3）+ **world-chromium**（world-spike 11 · cyber-city 8 · cyber-city-feedback 3 · cyber-city-observability 7）+ world-perf-chromium（1）+ visual-chromium（4）；`cyber-city.*\.spec\.ts` 整族自动归 world-chromium 串行（playwright.config testMatch 泛化，新增 spec 零配置改动） |
| dump 产出点 | CITY-OBS-01（生产 `/` 漏斗全走 → `session-dump-funnel.json`）+ CITY-OBS-01b（灰盒锥桶 → `session-dump-cones.json`）；CITY-OBS-06 消费双 dump 跑 smoke，当前满分 100（漏斗 7/7 + 覆盖 4/4） |
| 脚本条件腿转正状态 | S-2 V 键项 ✅（VEH-VIEW #54 已合）· S-5 L1 `?shot=` 项 ✅（CAM-VIEW 已合，`deep-link{poi,shot}` 已入流）· F4 进站前奏观察项 ❌（FXN-C3 未落，登记时记 `scripts.legsSkipped`） |
| 登记面 | 两登记 JSON 不存在 → score-loop northStar `function: null / perf: null` + sources「（缺失）」；OBS-C1 合流已解除 rubric §0-6 的登记前置（dump 证据物理可产），登记只等 AL-FXN 执行 |
| 在途批次 | CC-FXN-C1 RUNNING（§3.2 断言合同待其 PR 落地对号）· CC-VEH-C2 整改中（NO-GO #58：registry 单源 + reduced-motion FPV 硬切——其修复不改本文件断言面，CITY-VEH-05 语义不变） |

---

## 2. 断言合同的公共纪律（适用 §3 全部批次）

1. **新 spec 文件按批次切**：命名 `e2e/cyber-city-<主题>.spec.ts`（feedback 先例），自动落 world-chromium 串行 project；**既有 64 用例文本零改动**——确需适配（如 C3 改变进站时序影响 CITY-OBS-01）走「适配留痕」：PR 描述登记 + 本文件 §3 对应行同 PR 更新（§5 注 2）。
2. **呈现 ⇔ 埋点互证是每批必做题**（CITY-FB 先例）：任何新增用户可感反馈的断言必须成对——DOM/视觉面断言 + `__worldSession.dump()` 对应白名单事件存在性断言。只断 DOM 不断埋点 = 埋点随行门不过；只断埋点不断 DOM = 反馈闭环缺确认层（rubric 铁律 2 的 e2e 化）。
3. **四条恒等腿每批必带**：`ritual_idle`/poster 恒等（robot_idle 与 transforming 期新增 UI 整层不可见，FB-01 样式门先例）· reduced-motion（操作性信息不剥夺，仅动画压 0，FB-05 先例）· 无交互待机态（零事件时新增件全部隐藏）· pageerror 断零（UA View Transition 白名单唯一放行）。
4. **SwiftShader 禁令**：新增断言只许存在性/顺序性/计数，禁止对 t 值、帧率、动画时长设阈值（OBS §7 尾注；C3 的「0.1s 中断」断因果序不断时长，见 §3.3）。
5. **smoke 与 ring 纪律**：批次新增事件会增大 OBS-01 动线的 events 体量——用例内 `dropped === 0` 断言依赖「动线事件量 ≪ ring 500」，各批 PR 须在描述中确认新增事件的动线量级（估算 <50 条/批，四批合计仍远离上限；逼近时按 OBS §3.3 用 counters/funnel 聚合断言替代 ring 计数断言）。

---

## 3. CC-FXN-C1…C4 新增断言清单

批次定义与 PR 序沿顾问报告 §4.2 冻结：C2（已合流）→ C1（RUNNING）→ C3（依赖 CAM shot 注册表，已合 main，依赖解除）→ C4（形态待 FXN-BR G4/G5 + 父代理拍板）。每批表格 = 四层各自的增量；「事件名」列凡标注 *占位* 者以该批 PR 落 OBS §3.4 表为准（加法不升版），本文件同 PR 对号回填。

### 3.1 CC-FXN-C2 驾驶反馈包（已合流 #56 —— 断言基线，回归资产）

交付面：`world/DriveFeedback.ts` 四件反馈（碰撞脉冲 / respawn toast / boost 徽标+辉光 / 翻车自救倒计时）。

| 层 | 已落地断言（本合同的示范实现） |
|----|-------------------------------|
| e2e | `e2e/cyber-city-feedback.spec.ts` 3 用例：CITY-FB-01/02/03/04 单例全链（恒等门 → boost 双沿 → respawn toast ⇔ `respawn{reason:'key'}` 互证 → `#debug` 句柄置翻 → 倒计时 ⇔ `upside-down` 互证）· CITY-FB-05 reduced-motion（恒等门生效 + boost/toast 静态呈现不剥夺）· CITY-FB-06 灰盒碰撞脉冲（与 HUD `[data-ws-cones]` 同拍） |
| smoke | 零改动（cone-hit/respawn 覆盖项原本就在四项分母内，C2 只是把「事件」补上「呈现」层） |
| playtest | S-2 0:30–1:30 驾驶段与 S-5 L2 失败恢复腿的 F2 确认层由「半价」转「全额」候选——是否全额由 AL-FXN 按锚点判，e2e 绿只证明呈现存在 |
| AL-FXN | F2 取证增量：录屏逐帧对齐四件反馈与 dump 事件（rubric §2.2 F2 90-100 锚「dump 事件与录屏帧逐一对齐」的素材面已齐备） |

### 3.2 CC-FXN-C1 键位/引导人性化包（RUNNING —— 合并门增量）

交付面（顾问 §4.2 行 2）：键位卡可再唤出（候选键 H，以 PR 冻结为准）· hint 与 drive-view 提示统一（`Reveal.ts` 热点，VEH-VIEW 已合流故排队解除）· 首驶引导文案。

| 层 | 新增断言 |
|----|----------|
| e2e | 新 spec `e2e/cyber-city-guide.spec.ts`，建议用例：**CITY-GD-01 键位卡再唤出**——car_ready/driving 态 hint 淡出（`HINT_FADE_DELAY` 到期，dump 现 `hint-dismissed{by:'timeout'}`）后按再唤出键 → `[data-world-hint]`（或新 SEL，PR 冻结）重现，dump 新增一条 `hint-shown`（复用既有 type，或 data 加 `by:'resummon'` *占位*——加法不升版）；**CITY-GD-02 提示统一**——car_ready 后 hint 文案含驾驶键位全集与「V 切换视角」（CITY-VEH-06 既有断言不动，本用例断「统一后无双胞胎提示条」：hint 类 DOM 节点唯一）；**CITY-GD-03 首驶引导**——首次 `world-drive-start` 后引导文案呈现、再次驾驶不重复（一次性沿），dump 互证 `hint-shown`/`hint-dismissed` 事件序；**CITY-GD-04 恒等门**——robot_idle/transforming 期新增引导 UI 整层不可见（§2-3）；**CITY-GD-05 reduced-motion**——文字提示照常呈现（操作性信息不剥夺） |
| smoke | 分母零改动；OBS-01 动线自然多出的 hint 族事件不影响漏斗/覆盖计分（ux 族不在分母内） |
| playtest | S-5 **L3 提示系统腿**由「现状缺口」（rubric F5 70-85 锚点括注：hint 淡出后无唤回）转为必过项；S-2 0:15–0:30/0:30–1:30 段 F1 提示接力链取证点 +1 |
| AL-FXN | F1/F5 取证增量：L3 腿录屏须含「淡出 → 再唤出 → 再淡出」完整往返 + dump `hint-dismissed{by}` 两种来路（timeout/input）各 ≥1 条 |
| 埋点随行核对 | 若新增 type（如再唤出专用事件）：OBS §3.4 表同 PR 落行（ux 族）+ 本文件本行回填；只复用 hint-shown/hint-dismissed 则零表改 |

### 3.3 CC-FXN-C3 POI 进站前奏（CAM F1 —— 实现 + e2e 随行 PR 交付）

交付面（顾问 §4.2 行 4）：E 键 → 前奏 tween → showcase 定帧 → navigate；驾驶输入 0.1s 中断回 drive；`shot-apply{id}` / `shot-interrupt{by}` 埋点（OBS §3.4 camera 族预留行转正）。

实现回填（本 PR 冻结口径）：控制器 = `src/lab/world/areas/PoiArrival.ts`（tween 0.8 / 定帧 0.4 游戏秒，design F1 值照抄；`Areas.onInteract` 接线）；**数据驱动开关** = 注册表存在 `poi_showcase-<buildingId>` 条目才有前奏，无条目楼保持 Phase 1 直跳（camera-shots.json 加条目即自动获得前奏，src 零改动）；换算/中断清单复用 `CameraShots.resolveShotPose`/`RELEASE_ACTIONS` 单源；**reduced-motion 冻结为「直切 showcase 定帧」**（tween 跳过，定帧驻留与 navigate 照常）；遥测 = `View.shotId` → `__worldSpike.state().shot` + `#debug` 面板 shot 行。

| 层 | 新增断言 |
|----|----------|
| e2e | 新 spec `e2e/cyber-city-poi-arrival.spec.ts`：**CITY-PA-01 前奏时序**——触发圈内按 E → dump 依序出现 `world-poi{id}` 与 `shot-apply{id}`（seq 序断言，禁时长阈值）→ route abort 拦下 navigate 请求（CITY-OBS-01 先例）→ 拦截点前 dump 已含上述两事件（「跳转前取证」合同延续）+ `#debug` 腿定帧机位高度取证（showcase ≈34.6m ≫ 跟随档）；**CITY-PA-02 驾驶中断**——前奏播放窗内压 W → dump 出现 `shot-interrupt{by:'drive'}` 且其 seq > 对应 `shot-apply`、相机恢复驾驶跟随、**不发生** navigate（route 断言零命中）——断因果序与终态，不断 0.1s 时长（§2-4）。*建议稿偏差回填*：deep-link 非 ritual 腿无 Reveal 状态机（`data-drive-view` 属性缺席），相机恢复口径改用引擎遥测 `state().shot === null`；**CITY-PA-03 reduced-motion**——直切定帧（`shot-apply` 首次观测拍相机已在 showcase 高位 = 零 tween 状态证据），核心进站路径可完成、`world-poi` 照常入 dump；**CITY-PA-04 恒等门**——robot_idle 期 E/前奏路径完全不可达（既有门禁复证：零 `world-poi`/`shot-apply`/`shot-interrupt` + `state().shot` 恒 null） |
| smoke | 分母零改动：`shot-apply`/`shot-interrupt` **不进** coverage 四项（§0-3）；漏斗 `firstPoiInteract` 语义不变（仍锚 `world-poi`） |
| e2e 适配留痕 | CITY-OBS-01 的「E 进站 → 5s 内轮询 firstPoiInteract」段**零适配**（回填）：`world-poi` 仍在交互帧即打（前奏只推迟 navigate，不推迟取证），轮询窗语义不变；navigate 延后 1.2 游戏秒发出，OBS-01 的 route abort 不 await 该请求，时序无感 |
| playtest | rubric §4.4 条件腿「F4 进站前奏观察项」转正为 S-2 1:30–2:00 必测项；S-5 L1 深链腿增「`?shot=` 展示帧与进站前奏共用 shot 注册表」的一致性观察点 |
| AL-FXN | F4 取证增量：进站段录屏须含前奏全程 + 中断一次（Pass A 观察「到达感」，Pass B 对 F4 90-100 锚「进站有前奏与到达感且落点正确」）；dump 引用 `shot-apply`/`shot-interrupt` seq |
| 埋点随行核对 | OBS §3.4 camera 族两预留行转正（`shot-apply`/`shot-interrupt`），接线点随 C3 PR 落地——预留行机制下零版本变更 |

### 3.4 CC-FXN-C4 目标/进度轻任务（形态待拍板 —— 合同先行）

交付面（顾问 §4.2 行 5 + FXN-BR G4/G5 底稿）：可选目标线（「下一站」chip + 探索计数 n/12 类）、完成反馈、空闲引导消费 `idle-30s`。**非强制主线**：阻断自由探索的设计按 rubric F6 扣分。事件名全部 *占位*（候选 `quest-shown` / `quest-reached` / `quest-completed`，族名与 data 以 C4 PR 落 OBS §3.4 表为准——新增族属加法）。

| 层 | 新增断言 |
|----|----------|
| e2e | 新 spec `e2e/cyber-city-goal.spec.ts`，建议用例：**CITY-GL-01 目标呈现**——car_ready 后目标 chip 可见 + dump 含目标呈现事件（*占位*）；**CITY-GL-02 完成闭环**——按 chip 指引进站（driveTo 遥测闭环复用 OBS-01 先例）→ 进度 +1 呈现 + 完成事件入 dump（呈现 ⇔ 埋点互证）；**CITY-GL-03 非强制**——无视目标自由驾驶/进站其他 POI 全程零阻断（负断言：无模态、无输入劫持、`world-poi` 任意 id 可达）；**CITY-GL-04 空闲引导**——driving 态静置至 `idle-30s` 入 dump 后世界给出引导呈现（hint 再现/attract 候选，形态以 PR 为准），有输入即收；**CITY-GL-05 恒等门 + reduced-motion**（§2-3 全套） |
| smoke | 分母零改动（目标事件不进 coverage）；若 C4 把 `idle-30s` 从「仅记录」升级为「有消费」，OBS §9-3 的观察注记随 PR 清账 |
| playtest | S-5 **L7 空闲腿**由「记录性观察」转为「引导行为必测」；S-2 0:30–1:30 驾驶段增「目标感」观察点（F3 锚点括注「开着开着不知道干嘛」的对治项） |
| AL-FXN | F6 取证增量：这是当前唯一从「30-45 段（纯沙盒零目标）」起步的维——登记轮必须有 chip 发现/完成反馈/空闲引导三段录屏时间码 + 对应 dump 事件，否则 F6 仍按现状段位打 |
| 埋点随行核对 | 新增 type/族 → OBS §3.4 表同 PR 落行 + 本文件本行回填事件名；`quality-score.json`/smoke 零改动 |

### 3.5 批次 × rubric 维 × 脚本腿 对照总表

| 批次 | 状态 | 主计分维 | e2e 增量 | 脚本腿变化 |
|------|------|----------|----------|------------|
| FXN-C2 | ✅ 已合（#56） | F2 F3 | CITY-FB-01…06（3 用例，已入 64 基线） | S-2 驾驶段 / S-5 L2 确认层转全额候选 |
| FXN-C1 | RUNNING | F1 F5 | CITY-GD-01…05（建议） | S-5 L3 转必过 |
| FXN-C3 | 实现 + e2e 随行 PR 交付 | F4 | CITY-PA-01…04（已落 spec；OBS-01 零适配，§3.3 留痕行回填） | §4.4 前奏条件腿转正 |
| FXN-C4 | 待拍板 | F6 | CITY-GL-01…05（建议） | S-5 L7 转必测 |

---

## 4. CI 集成步骤（score-loop 读 northStar）

### 4.1 门禁分工现状（不改）

- **GitHub Actions `ci.yml`**：壳门禁（astro check / build / link gate / audit-budget / LHCI 七 URL），PR + main push 阻断线。e2e 与计分**不在** GH Actions（SwiftShader 全量 ~小时级 + world-chromium 串行独占，Actions 时长与算力不适配）——归 Cloud Agent quality-loop。
- **Cloud Agent quality-loop**（`scripts/run-quality-loop.mjs`）：Loop 编排的检验链，`--quick`（visual 冒烟 + 两 URL LHCI）/ `--full`（五 project 全量 + 七 URL×3，CI 同口径）。

### 4.2 功能维五步链（`--full` 档口径，登记轮/审计复算必走）

| 步 | 命令 | 产出 | 门 |
|----|------|------|-----|
| ① build | `pnpm build` | `dist/`（生产产物，四层共用被测对象） | 失败 = 基础设施故障，链路中止 |
| ② e2e 全量 | `pnpm exec playwright test` | `e2e-results.json` + **`session-dump-funnel.json` / `session-dump-cones.json`**（world-chromium OBS-01/01b 产）+ CITY-OBS-06 内嵌 smoke 首跑 + annotation | 硬门：任何失败挡合并/压综合分 |
| ③ smoke 复算 | `node scripts/function-smoke.mjs --dump test-results/session-dump-funnel.json --dump test-results/session-dump-cones.json` | `function-smoke.json` + 末行 `FUNCTION_SMOKE=<0-100>` | **软门**：不加 `--min`（转硬前恒 annotation/趋势）；退出码 2 = dump 缺失（说明步 ② 未跑全或 OBS-01 失败）按基础设施故障处理，**不得**当低分记 |
| ④ 综合分 + northStar | `node scripts/score-loop.mjs` | `test-results/quality-score.json`：五维综合分（权重 25/15/20/25/15 零改动）+ `northStar { visual, function, perf, composite, sources }` 只读块 | 综合分门沿既有 `--min`；northStar 无门（汇总非判定） |
| ⑤ 看板消费 | 父代理读 `quality-score.json.northStar` | 北极星四数一行：visual / function / perf / composite | 缺失显式 `—`，禁止估值 |

**northStar 读数合同**（OBS §6.4 冻结，`score-loop.mjs` 已落地）：`function`/`perf` 分别读 `docs/research/cyber-city-function-rubric-score.json` / `cyber-city-perf-rubric-score.json` 的顶层 `score`；文件缺失或 `score` 非数值 → `null` + `sources` 注记「（缺失）」；`composite` 为五维综合分镜像；**`FUNCTION_SMOKE` 冒烟分不出现在 northStar**（哨兵不入登记面）。当前轮预期读数：`visual` 有值、`function`/`perf` = null（AL-FXN 未登记）——四数从「二缺二」到齐备的唯一路径是 §1 第 ③④ 层跑完。

### 4.3 quality-loop 加法建议（归 OBS-C 批次或独立小 PR，非本文件交付）

`run-quality-loop.mjs` `--full` 档在 e2e 与 score 之间插步 ③（smoke 复算，摘要行记 `FUNCTION_SMOKE=`）；`--quick` 档（仅 visual-chromium，不产 dump）smoke 记 `SKIP` 不伪造。改动为加法，退出码语义沿 OBS §6.2（0/1/2）。

### 4.4 smoke 转硬路线（预登记，执行归父代理）

观察 ≥1 个完整 Loop 的稳定性（SwiftShader 波动、POI 进站时序、C3 合流后 OBS-01 适配）→ 父代理拍板转硬 → 步 ③ 加 `--min N`（建议起点 N=90：漏斗 70 全额 + 覆盖至多缺 1 项）并将其从 §5-9 软门行升入硬门行。转硬前任何人不得以 smoke 分数阻断合并（OBS §9-4）。

---

## 5. 回归硬门清单（每 PR 全过；登记轮 = AL-FXN 按本清单核对回归面）

| # | 门 | 判定方式 / 证据 | 级别 |
|---|-----|------------------|------|
| 1 | e2e 全量不降 | `pnpm exec playwright test` 五 project 全绿；冻结时点 **64/64**，各批只加不减；既有用例文本零改动（适配走注 2 留痕） | 硬 |
| 2 | LHCI 不降 | `lighthouserc.json` 断言：`/` P ≥80 error / ≥90 warn + A11y/BP/SEO ≥95；其余六 URL 四项 ≥95 | 硬（ci.yml 阻断） |
| 3 | audit-budget 零 ❌ | `node scripts/audit-budget.mjs dist/`：world JS ≤900KB gzip、壳零 world 字节、public ≤40MB | 硬（ci.yml 阻断） |
| 4 | `ritual_idle` / poster 恒等 | CITY-E2E-01/06 + 各批恒等腿（FB-01 样式门先例）：robot_idle 与 transforming 期一切功能 UI 不可见 | 硬 |
| 5 | reduced-motion 双轨 | CITY-E2E-04 + CITY-VEH-05 + FB-05 + 各批 RM 腿：终态直出、instant swap、操作性信息不剥夺、核心路径可完成 | 硬 |
| 6 | CITY-03 循环动画配额 | 新增视觉件事件驱动一次性；常驻循环动画须登记席位 | 硬 |
| 7 | 埋点随行 | 新增用户可感交互 ⇔ OBS §3.4 白名单行 + 接线 + e2e 互证断言三件同 PR；白名单外事件由 CITY-OBS-04 拒收断言兜底 | 硬（打回线） |
| 8 | pageerror 断零 | 各 spec `trackErrors` 惯例；UA「Transition was skipped」为唯一白名单 | 硬 |
| 9 | function-smoke 无退化 | 步 ③ 复算：score、漏斗 hit 集、coverage 集均不小于上轮（`function-smoke.json` 跨轮对照）；knownGaps 只增删于依赖事实变化 | **软**（§4.4 转硬前） |
| 10 | 登记轮回归面不塌 | rubric §6.3-4：登记同 commit 上门 1/2/3 全绿 + 门 9 无退化——**必要条件非充分条件**，任何一门红则登记无效 | 登记门 |

**注 1（计数口径）**：rubric v1.0 / OBS 规格中的「e2e 52/52」为各自冻结时点数字；本正本冻结时点为 64（§1.3 分布表）。硬门语义 = 全量绿且**只增不减**，跨文档引用一律读语义不读数字；rubric 下次升版时同步数字。

**注 2（适配留痕）**：「既有用例零改动」的唯一例外是行为契约被上游批次合法变更（如 C3 改进站时序）——适配 PR 必须：① 描述中列被改用例与原因；② 同 PR 更新本文件 §3 对应行；③ 不得降低断言强度（删断言/放宽为软断言均属降级，走打回）。

---

## 6. 版本纪律与开放问题

**版本纪律**：本文件改四层职责/断言合同/硬门清单 → 版本 +1 并在 PR 留痕；rubric 权重/脚本、OBS 白名单/算法的变更由各自正本升版，本文件同 PR 跟随更新引用（不先行、不代改）。§3 各批「*占位*」事件名在对应 PR 合流时回填，属勘误不升版。

**开放问题**：

1. **smoke 转硬时点**（§4.4）：待 ≥1 Loop 观察，父代理拍板；转硬起点 `--min 90` 是建议值非冻结值。
2. **C4 形态**：待 FXN-BR G4/G5 + 父代理拍板；CITY-GL-01…05 为合同骨架，事件名/SEL 随 PR 冻结。
3. **CITY-OBS-01 与 C3 的时序适配**：前奏引入后「跳转前取证」窗口拉长，route abort 机制预计兼容（navigate 仍是终点），实测超窗则按注 2 适配。
4. **quality-loop smoke 步加法**（§4.3）：归 OBS-C 批次落地，落地前步 ③ 由执行者手工跑（命令已冻结）。
5. **性能双轨的 CI 证据包**（CITY-PERF-01）：归 OBS/perf 批次，与本四层并列——落地后 §4.2 链上在步 ② 后追加证据包步，属加法。

---

*CC-FXN-TEST-DES v1.0 · 2026-08-27 — 四层分工责任矩阵（e2e 挡合并 / smoke 软门哨兵 / playtest 挡登记 / AL-FXN 唯一登记人）+ CC-FXN-C1…C4 逐批断言合同（C2 已落地为基线，C1/C3/C4 给出用例骨架与埋点随行核对行）+ CI 五步链（function-smoke 复算 + score-loop northStar 读数合同）+ 回归硬门十条。doc-only，rubric/OBS 冻结面零改动，`src/` 零改动。*
