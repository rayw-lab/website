# 性能首分路径顾问报告 R2：northStar.perf 从 `—` 到数字（CC-PERF-ADV-SCORE-R2）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-ADV-SCORE-R2**（顾问 Task · doc-only）——回答指挥官提问：「性能第一个生产登记分怎么打出来？」R1 = `cyber-city-first-score-advisor.md`（功能/性能双轨版，性能轨部分过时）；本报告为性能轨专版更新，功能轨已收口（首登 84） |
| 分支 | `cursor/cc-perf-adv-score-r2-1d6f`（base：`main` @ `ea968a4`） |
| 日期 | 2026-08-27 |
| 性质 | 顾问报告：**不改秤、不改门、不改脚本**——秤正本恒为 `docs/spec/cyber-city-perf-rubric.md` v1.0，回填正本恒为 `docs/spec/human-gate-checklist.md` §5.4，执行手册恒为 `docs/research/cyber-city-perf-human-gate-runbook.md`；本文件只更新「最短合法路径」的当轮事实与派单建议，`src/`、e2e、config 零改动 |
| 输入 | R1 顾问报告 · perf rubric v1.0 · human-gate §5.4 · 真机六腿 runbook · perf-impl-plan · 功能登记 JSON（84 首登范例）· 当轮一手核验（§1：git log / `--list` 实跑 / gh run / `src` 源码逐行） |
| 消费方 | 父代理（派单）· 指挥官（真机六腿执行人 + 签字）· CC-AL-PERF（登记人）· CC-VEH-R3（S5 证据共享候选） |
| 红线 | 本报告 §5 的「预计首分区间」为**诊断参考**，禁止以任何形式写入登记 JSON 或 §5.4 真机表（rubric 禁止清单 8）；禁止用 CI 证据包/SwiftShader 读数冒充判定（禁止清单 2/4） |

---

## 0. 结论先行

1. **R1 的性能轨三条前置腿已全部销账**（本报告一手核验，§1）：CC-PERF-HG-PREP（runbook + §5.4 行 5/6 追加）、PERF-C2 **B0**（O10 分段帧时剖析 + `counters.longFrames`）、PERF-C2 **B1**（O1 FPS 自动降档 + toast + `quality-auto-drop` 埋点）均已合 main。R1 §3.2 的「剩余步 1（HG-PREP doc）」不复存在——**首分路径只剩两步：指挥官真机六腿 → CC-AL-PERF 双门登记**。
2. **B1 合流 ≠ P5 解锁**（R2 核心裁定，§2.1）：`?quality=` 显式深链**禁用**自动档（`src/lab/world/index.ts` `autoQualityDrop = quality === undefined`，一手核验），降档 toast 只随自动降档触发——腿 5（显式 `?quality=2`）下玩家仍无档位确认层。**v1.0 口径下 P5 仍恒 70**（「完成但反馈缺失」锚），rubric §2.2 P5 注记的 v1.1 升版复核是**登记后的改秤动作，不阻塞首分**。
3. **B1 改变腿 3/4 的被测语义**（§2.2）：安卓默认腿现在含自动降档真值——降档触发时 toast 入镜、`quality-auto-drop` 埋点落 dump；这是产品默认行为不是「救场」，记录行须注明降档事件与时点。P1 的灾难尾部（<24fps 三板斧区）概率被 B1 兜底显著压低。
4. **头号现实风险不变 = 登记同 commit 全量 e2e 绿（S5/S3）**：合同已扩至 **75 用例 / 15 文件**（本报告 `--list` 实测），**至今无任何 clean 75/75 记录**（VEH-R3-PREP `7eddd7a` 盘点一手引用）；且 GitHub CI 五门禁**不含 e2e**（`ci.yml` 一手核验）——全量绿只能由 AL-PERF 当轮实跑产出，一次跑同时产 S3（`city-perf-evidence.jsonl` 同 commit 行）与 S5 证据，并可与 VEH-R3 核心腿双销账。
5. **新增执行纪律：六腿同版本**（§3.2）：main 每 push 自动部署 Pages，生产被测面随 tip 漂移——指挥官窗口内父代理须**冻结 main 合流**（或显式记录部署 commit），AL-PERF 以该 commit 为 subject 钉全链证据。
6. **登记人模型按现行约定改为 Fable5 xhigh**（§3.4）：R1 写 Sol（gpt-5.6-sol-xhigh-fast），已被 AGENTS.md 现行模型表（复审/审计线 = claude-fable-5-thinking-xhigh）取代；S1 独立性以 **Task 实例边界**为准（登记 Task ≠ 实现 Task、审计不改被测面），模型同系不击穿 S1。
7. **预计首分区间（诊断）≈ 75–95，中枢 ~85–88**（§5）：较 R1（72–95，中枢 ~84）地板与中枢均抬升，来源 = B1 安卓兜底 + B0 归因工具；数学封顶 95.5（P5 恒 70）。85 双门首轮通过概率中低——P5 恒占一处缺口，P1/P2/P3 必须全 ≥85 才可能过门。

---

## 1. 当轮事实底座（一手核验，2026-08-27）

| 事实 | 读数 | 核验方式 |
|------|------|----------|
| main tip | `ea968a4`（docs(audit): CC-AL-FXN Loop 8 功能首分登记）；CI + Deploy 双绿（run 33087852168 / 33087852239） | `git log origin/main` + `gh run list` |
| **功能首登** | `cyber-city-function-rubric-score.json` **score=84**（subject `main@66ed0fe`，AL-FXN = Sol，报告 `loop8-fxn-audit.md`）→ northStar.function 已出数 | 登记 JSON 逐字段核读 |
| **HG-PREP** | ✅ 已合 main（`2ffd31d` + `4d35d7e`）：runbook `cyber-city-perf-human-gate-runbook.md` 在档；human-gate §5.4 **六行齐**（行 5 Q2 腿 / 行 6 Fast 4G 腿已追加，含增补注记块） | git log + 两文件全文核读 |
| **PERF-C2 B0** | ✅ 已合 main（`a1353dc` + `21b20d1`）：FrameProfiler 分段帧时剖析（`#debug` 门控，7 段 avg/max ms 行）+ `counters.longFrames`——P2 归因通道就位 | git log + `DebugPanel.ts` 源码 |
| **PERF-C2 B1** | ✅ 已合 main（`52fafca` + `7871bbb`）：O1 自动降档（滞回 3 设计秒 avg<30 或 low1<20 + 只降不升 + 20s 冷却，仅 ritual driving 态）→ `changeLevel` 阶梯 + `DriveFeedback.qualityDropToast`（`[data-world-quality]` chip）+ `quality-auto-drop` 埋点；**`?quality=` 显式深链禁用自动档** | git log + `index.ts`/`Quality.ts`/`DriveFeedback.ts` 源码逐行 |
| B2 / B3 | ❌ 未合：O2 初判校准（升档）与 O3 CarConcept 延迟加载（P3 主杠杆）均无 main 痕迹 | git log 全量检索 |
| 性能登记位 | `docs/research/cyber-city-perf-rubric-score.json` **不存在** → northStar.perf = `—` | `ls docs/research/` |
| northStar 接线 | `scripts/score-loop.mjs` 恒读该登记位（缺失显 `—` 禁估值）——登记一落数自动出数，零接线欠账 | 源码 `NORTH_STAR_SOURCES` 核读 |
| **§5.4 行状态** | **六行全【待填】**（行 1–4 既有 + 行 5/6 增补）——真机零读数 | human-gate §5.4 全文核读 |
| e2e 合同 | **75 用例 / 15 文件 / 7 projects**（CITY-PERF-01/02 在岗 city-perf-chromium 殿后） | `ea968a4` worktree `pnpm exec playwright test --list` 实跑 |
| 全量绿状态 | **无 clean 75/75 记录**：R2 审计两轮失败均落 CAR-E2E-01/05 180s 超时；修复（car-chromium 独占 `4c1e37f` + CITY-EXP 脱困 `7eddd7a`/`0ffe5d8`）已合但未有全量复验；AL-FXN 当轮全量被 SIGINT 中断后按 project 分段重跑 | `loop-veh-r3-audit-prep.md` §2.3/§5 + `loop8-fxn-audit.md` §5.1 |
| **CI 不跑 e2e** | `ci.yml` 五步 = astro check / build / check-links / audit-budget / LHCI——e2e 全量绿**只能由代理当轮实跑产出**，tip 的 CI 绿 ≠ S5 达成 | `.github/workflows/ci.yml` 全文核读 |
| P4 维 | 当前即可判 100：tip CI run audit-budget 零 ❌ | gh run + ci.yml |
| 部署链 | main 每 push 由 `deploy.yml` 自动发布 Pages——生产被测面随 tip 漂移（§3.2 纪律的依据） | ci.yml 文件头分工注记 |

### 1.1 R1 报告过时项清单（消费 R1 时须叠加本表）

| R1 位置 | R1 陈述 | R2 事实 |
|---------|---------|---------|
| §3.1 前置 6/§3.2 步 1 | §5.4 增补两行未追加；CC-PERF-HG-PREP 待派 | **已销账**：六行齐 + runbook 在档 |
| §3.1 前置 10 | PERF-B1 未落，P5 无确认层、P1 无兜底 | **B0/B1 已合**；但 P5 v1.0 口径仍恒 70（§2.1，确认层不覆盖显式深链腿） |
| §3.2 登记时点裁量 | 「A→C 直跑 vs 等 B1」二选一 | **裁量已被事实关闭**：B1 已合，当前即为「B1 后跑 C」的推荐态 |
| §3.3 / §5-3 | AL-PERF 执行者 = Sol | **改 Fable5 xhigh**（AGENTS.md 现行模型表，§3.4） |
| §1 事实底座 | e2e 合同 73/14；CAR-E2E-01/05 超时未修 | **75/15**；超时根因修已合（car-chromium 独占），但 clean 75/75 仍未取得 |
| §5 派单表 | 三单：AL-FXN ∥ FIX-CARE2E ∥ PERF-HG-PREP | 三单全部完成合流；下一拍见本报告 §6 |

---

## 2. B0/B1 合流对秤面的裁定（R2 新增）

### 2.1 B1 合流 ≠ P5 解锁：首分照旧按 v1.0 打，P5 恒 70

一手证据链（源码逐行）：

1. `src/lab/world/index.ts`：`const autoQualityDrop = quality === undefined`——**显式 `?quality=` 深链禁用自动档**（取证与 e2e 可复现性优先，文件头参数注记）；
2. toast（`DriveFeedback.qualityDropToast`）**只在自动降档分支内调用**——显式深链路径永不触发；
3. 腿 5 的被测面 = 显式 `?quality=2` 深链（rubric §4.1 行 5 / runbook §3.5）——该路径下玩家仍无任何档位确认层（`#debug` 面板执行者可读不算玩家可感知，runbook §3.5-5 既有纪律）。

**裁定**：v1.0 口径下 P5 锚点判定不因 B1 改变——核心路径完成 + 无功能性缺失 + **反馈缺失** = 恒 70。rubric §2.2 P5 注记「O1 合流后 toast 进被测面，按 §7 升 v1.1 复核锚点」是**改秤动作**（判定腿/被测面变更 → 版本 +1 + human-gate 表同 PR 同步），本报告建议**放在首分登记之后**执行（随 B2 批次一并复核「降档确认 + 升档」全链）：① 首分等 v1.1 = 用改秤阻塞出数，违背「早一轮真值」的编排价值；② v1.1 复核需要自动降档在真机上的实际触发样本——首轮腿 3/4 的降档留档（§2.2）正是它的输入。

### 2.2 腿 3/4 语义更新：自动降档是默认档真值的一部分

B1 后，安卓默认腿（行 3/4，无 `?quality=` 参数）在 60s 驾驶窗内可能实际触发自动降档（安卓 UA 分档起步 Q1 → 低帧滞回 3s 后降 Q2 + toast）。执行纪律裁定：

1. **这不是「救场」**：runbook §3.3-5「腿 3/4 不许用 `?quality=` 救场」禁的是**执行者显式加参**；自动降档是产品默认行为，属被测真值——照跑照记，不算 S4 脚本裁剪；
2. **记录行留痕义务（新增）**：降档触发时 toast 入镜（录屏自然取证）+ 「EXPORT session JSON」导出的 dump 含 `quality-auto-drop` 事件（from/to/avg/low1）——记录行「场景/时长」列注明「自动降档 Q1→Q2 @ 约 Xs」；未触发则无需注明；
3. **对 P1 判定的含义**：降档触发本身证明窗内存在 <30fps 低帧段——即使降档后读数回稳，「持续 ≥30fps」高段锚大概率不满足，AL-PERF 按 70–85 段（单腿轻缺口）裁量；但 <24fps 三板斧灾难区被 Q2 兜底显著压低——这正是 R1 推荐「B1 后跑 C」的收益兑现；
4. 桌面腿 1/2 同理（Q0 起步、自动档在岗）：桌面若触发降档（avg<30）本身已是重缺口信号，如实记录即可。

### 2.3 runbook 勘误两处（措辞过时，结论不变——建议随 AL-PERF 登记 PR 顺手落地）

| 位置 | 现文 | 勘误 |
|------|------|------|
| runbook §3.5-5 | 「当前无降档确认层（自动降档 O1 未合流），玩家无从感知自己处于 Q2 档」 | O1 已合流（B1），但**显式 `?quality=` 深链禁用自动档、toast 不触发**——腿 5 下「玩家无从感知」结论不变，落 70 段依据由「未合流」改为「确认层不覆盖显式深链路径（v1.0 口径）」 |
| runbook §3.3（腿 3）/ §2.2 | 无自动降档相关指引 | 追加一句：自动降档属默认档真值，触发时（toast 入镜）在记录行注明档位迁移与时点，dump 的 `quality-auto-drop` 事件为机读证据（§2.2 本报告口径） |

勘误为执行手册措辞更新（doc-only、不改秤不改门值），符合「三处冲突以 rubric 为准并回报勘误」的 runbook 文件头纪律。

---

## 3. 最短合法路径（剩余两步）

### 3.1 路径表（R1 §3.2 的当轮刷新）

| 阶段 | 状态 / 动作 |
|------|-------------|
| 顾问/调研/脑暴/文档（含 rubric v1.0 + 测试方案 + impl-plan） | ✅ 全部已合 |
| PR-A（PERF-C1，CI 证据包产出者） | ✅ #66 已合，CITY-PERF-01/02 在岗 |
| PR-B 系列 B0（O10 观测件）/ B1（O1 自动降档） | ✅ 已合（本报告一手核验）；B2/B3 非首分前置 |
| 文档补（HG-PREP：runbook + §5.4 行 5/6） | ✅ 已合——R1 的「剩余步 1」销账 |
| **真机（剩余步 1）** | **指挥官六腿**（唯一硬 human-gate）：照 runbook §3 执行行 1–6，读数回填 §5.4 + 三件套归档（`cityperf_*` 命名）+ 签字；窗口纪律见 §3.2 |
| **审计 + 登记（剩余步 2）** | **CC-AL-PERF**（Fable5 xhigh，§3.4）：钉 subject commit → `pnpm build && pnpm preview` 复核 → **全量 75/75 e2e 实跑**（S3+S5 一次双证据，§3.3）→ 数值门 + 结构门 S1–S5 逐条判定 → 写 `docs/research/cyber-city-perf-rubric-score.json`（rubric §5.2 schema）+ 审计报告 `loop8-perf-audit.md` → **northStar.perf 自动出数**；随行 runbook 勘误两行（§2.3） |

### 3.2 六腿同版本纪律（R2 新增执行约束）

main 每 push 即由 `deploy.yml` 自动部署 Pages，而正式签署轮次一律测生产（runbook §1.2）——若指挥官六腿执行中途 main 有新合流，六腿将**跨版本取证**，S3「CI 证据包同 commit」与 subject 钉定被击穿。执行口径：

1. 指挥官排窗前，父代理**排空合并队列并冻结 main 合流**至六腿完成 + §5.4 回填 push；
2. 窗口开始时记录当时 main tip（= 生产部署 commit，可由 `gh run list` Deploy 行核对）——该 commit 即 AL-PERF 的 subject；
3. 六腿中断续跑合法（runbook §0 既有），但**续跑前须核对 main tip 未动**；tip 已动则整轮重排（腿间读数不可跨版本拼接，与「单腿不许拼接」同理）；
4. 视觉轨 X 系列实现批次（正在途）**改 world 渲染负载即改性能被测面**——冻结窗口对其一并生效；窗口外合流不受限（下一轮登记自然以新 tip 为 subject）。

### 3.3 S3+S5 一次跑双证据：clean 75/75 是头号风险，也是最大杠杆

- **现状**：合同 75/15，无 clean 全绿记录；两轮历史失败均为 CAR-E2E-01/05 180s 超时（共享 VM 竞争噪声，非 world 链），根因修（car-chromium 独占 project）已合但未全量复验；
- **口径**（沿 VEH-R3-PREP §4.3）：`retries=0`、`test-results/.last-run.json` `status=passed`、`expected=75 / skipped=0 / unexpected=0 / flaky=0`；空载 VM 单独跑（R2 失败根因即竞争噪声——AL-PERF 全量窗内禁止并行派其他 e2e 实跑 Task）;
- **一次跑三收益**：① S5 回归面不塌证据；② 全量含 CITY-PERF-01/02 → 同 commit `city-perf-evidence.jsonl` + `session-dump-city-perf.json` 落盘 = S3 在档物；③ 同 commit 全量绿可供 **CC-VEH-R3** 硬门 #2 引用（其唯一阻断即此）——是否共享由父代理终拍（§6-3）；
- **失败预案**：全量若再挂在非 world 链（e2e 基建），AL-PERF 按功能轨先例分段归因重跑并如实留痕；**登记落笔前必须取得当轮 clean 全绿**，取不得则本轮不登记（S5 是结构门，不可豁免）。

### 3.4 登记人模型：Sol → Fable5 xhigh（变更依据与 S1 合规说明）

- R1 §3.3 指定 AL-PERF = Sol（当时看板审计线约定）；**AGENTS.md 现行模型表已将复审/审计场景统一为 `claude-fable-5-thinking-xhigh`**，本单指令亦明确「CC-AL-PERF（Fable5 xhigh 登记人）」——以现行约定为准；
- **S1 独立性口径**：结构门 S1 禁的是**实现方署名登记**（`scoredBy` 出现实现 Task 即无效）——判定单位是 Task 实例（独立会话、独立分支、零被测面改动），不是模型 slug。B0/B1 实现方与 AL-PERF 同为 Fable5 xhigh 模型系不构成击穿；登记 JSON `scoredBy` 照 rubric 写「CC-AL-PERF 独立审计（claude-fable-5-thinking-xhigh；报告 loop8-perf-audit.md）——实现方自评永不登记」；
- 若派单时 xhigh 不可用，按 AGENTS.md 明示降级规则用同系列 high 并在报告自报，禁止静默降级。

---

## 4. 云端 vs 指挥官分工 + 并行派单建议

### 4.1 分工矩阵（当轮版）

| 腿 | 执行者 | 云端可否 | 状态 |
|----|--------|:---:|------|
| runbook + §5.4 行 5/6（HG-PREP） | 云端 doc | ✅ | **已完成** |
| B0/B1 实现（观测件 + 自动降档兜底） | 云端实现 | ✅ | **已完成** |
| CI 证据包产出者（CITY-PERF-01/02） | 云端 e2e | ✅ | **在岗** |
| **六腿读数 + §5.4 回填 + 签字** | **指挥官** | ❌（判定与签字不可委托；SwiftShader 读数禁充判定） | **待排窗——首分唯一临界路径** |
| 全量 75/75 + 双门判定 + 登记 JSON | CC-AL-PERF（云端） | ✅（受 §5.1 状态机约束：六腿回填前落笔必须 `score: null`） | §5.4 回填后即派 |
| runbook B1 勘误两行 | 云端 doc | ✅ | 随 AL-PERF 登记 PR（§2.3） |

**指挥官侧不变的两个硬事实**（R1 §4.2 全文有效）：① 豁免留痕（§5.5）救不出数字——豁免腿对应维仍 `null`，顶层 `score` 仍 `null`；② 第一临界资源 = **2019 后中端安卓设备**（Adreno 61x / Mali-G5x 级）——无设备则行 3/4/5 全缺 → P1、P5 `null`；桌面三腿（1/2/6）可先跑先回填，欠账缩至安卓三腿。

### 4.2 并行派单约束（与 R1 的关键差异）

R1 时点三单文件域零交集可全并行；R2 时点的约束反转为**时序与静默约束**：

1. **AL-PERF 严格后置于 §5.4 回填**——回填前派出只能产出 `score: null` 的结构面草稿，浪费一轮（rubric §5.1 禁止预登记填数）；
2. **真机窗口 = main 冻结窗口**（§3.2）——视觉轨 X 系列、B2/B3 等一切改 `src/` 的合流暂停；doc-only PR 亦建议排队（避免 tip 漂移干扰 subject 核对）；
3. **AL-PERF 全量窗口 = VM 静默窗口**——禁止并行派其他 e2e 实跑 Task（R2 审计两轮失败根因即共享 VM 竞争）；
4. **B2/B3 可并行开工、禁止窗口内合流**：开发分支不受冻结影响；合流排在登记 PR 之后——B 系列收益宣称本就需要「首轮真机基线」做前后对照（测试方案 §4 流程约束），先登记后合流是证据纪律正序。

---

## 5. 预计首分区间（诊断参考——**禁止写入登记 JSON 或 §5.4 表**）

| 维 | 权重 | 预计段位 | R2 依据（较 R1 变化） |
|----|:---:|:---:|------|
| P1 帧率体感 | .30 | **70–100**（尾部 50–65 概率已被 B1 压低） | 桌面双后端现代 GPU 大概率 ≥60；安卓 Q1 起步 + 自动降档兜底 Q2——<24fps 三板斧区概率显著下降；但降档触发即证明低帧段存在，「持续 ≥30」高段锚难满足 → 触发降档的腿按 70–85 裁量（§2.2-3） |
| P2 1% low | .20 | 70–100 | 变形落地窗/首驶 shader 编译尖峰仍是已知风险；**B0 的 `counters.longFrames` + `#debug` 分段帧时行使归因从猜测变读数**——孤立可归因尖峰落 70–85 的判定置信度提高 |
| P3 加载可玩 | .20 | 100 或 70（三段制无插值） | 无变化：B3（CarConcept 延迟加载）未合，world 体积无新杠杆；壳 P100 + world ≤900KB gzip 预算内，≤8s 概率偏高但唯真机说了算 |
| P4 预算 | .15 | **100** | tip CI run audit-budget 零 ❌（一手核验），二值维 |
| P5 降档可感知 | .15 | **70（恒定）** | §2.1 裁定：v1.0 口径腿 5 = 显式深链，确认层不覆盖 → 「完成但反馈缺失」恒 70；升 v1.1 前无解，且不应为此推迟首分 |
| **合成** | 1.00 | **≈ 75–95（中枢 ~85–88）** | 保守案（P1/P2/P3 全 70）= 74.5 → 75；中枢案（P1/P2=85、P3=100）= 88；数学封顶 = 95.5（P5 恒 70）；灾难尾部（安卓双腿大缺口 P1=50–65）仍可能压至 ~70，但 B1 后为小概率 |

**85 双门预判**（诊断）：P5=70 恒占一处真实缺口 → 过门条件 = P1、P2、P3 **全部 ≥85**（即安卓双腿持续 ≥30 无明显低帧段 + 桌面 1% low 达标 + Fast 4G ≤8s 三线全胜）。首轮通过概率中低；**「合法登记 + 数值门/缺口计数不过」是预期内的诚实状态**——首分是诊断真值不是达标宣言，缺口由 B2/B3 + v1.1 复核批次按登记后真值收敛（P5 升版复核后有 70→100 的确定性空间，见 rubric §2.2 注记）。

---

## 6. 父代理下一拍派单建议（3 单）

| # | 单 | 执行者 | 主题 | 依赖 / 约束 |
|---|----|--------|------|-------------|
| 1 | **指挥官真机六腿窗口** | **指挥官（王磊）**——人肉腿，非子代理单 | 照 runbook §3 跑行 1–6 → §5.4 六行回填 + 三件套归档（`cityperf_*`）+ 签字 → 回填 commit push（或读数交 AL-PERF 随登记 PR 落库，数字与判定列必须出自指挥官） | **首分唯一临界路径，本拍即排窗**。窗口纪律：父代理冻结 main 合流 + 记录部署 commit（§3.2）；设备硬需求 = 中端安卓（无设备则先跑桌面三腿，欠账缩至安卓三腿） |
| 2 | **CC-AL-PERF 登记轮** | Fable5 xhigh（§3.4；降级按 AGENTS.md 明示规则） | 钉 subject（= 六腿部署 commit）→ build/preview 复核 → **全量 75/75 实跑**（S3+S5 一次双证据，空载 VM 静默窗）→ 数值门 + S1–S5 逐条判定 → 写 `cyber-city-perf-rubric-score.json` + `loop8-perf-audit.md` → northStar.perf 出数；随行 runbook §3.3/§3.5 勘误两行（§2.3） | **严格后置于 §5.4 回填 push**；全量取不得 clean 绿则本轮不登记（S5 不可豁免）并按失败预案归因留痕（§3.3） |
| 3 | **CC-VEH-R3 审计轮** | Fable5 xhigh | VEH 三轮重审（`loop-veh-r3-audit-prep.md` 执行手册已备）——核心腿 = 全量 75/75，与单 2 的 S5 证据**同一证据面** | 与单 2 **错峰跑**（共享 VM 竞争是 R2 失败根因）；若与单 2 钉同 commit，一次 clean 75/75 双销账（VEH-R2 唯一阻断 + perf S5）——共享还是各跑由父代理终拍 |

**非本拍项**（登记后批次，勿抢首分窗口）：B2（O2 初判校准/升档）、B3（O3 CarConcept 延迟加载，P3 主杠杆）、perf rubric v1.1 升版复核（P5 被测面纳入自动降档 toast，输入 = 首轮腿 3/4 降档留档）——三者均以首轮登记真值为前后对照基线。

---

## 7. 登记纪律重申（对被派 Task 的约束，R1 §6 全文有效 + 两条 R2 增补）

1. R1 §6 五条全文有效：禁 CI 读数冒充、禁诊断区间入 JSON、禁实现方自评、`null` 语义诚实状态机、首分不要求过 85 门。
2. **R2 增补一（同版本）**：六腿 + §5.4 回填 + AL-PERF 全链证据必须钉同一部署 commit；tip 漂移则重排，不许跨版本拼证据（§3.2）。
3. **R2 增补二（降档留痕）**：腿 1–4 自动降档触发时记录行必须注明档位迁移（toast 录屏 + dump `quality-auto-drop` 事件互证）；不注明视同记录不完整，AL-PERF 有权要求整腿重跑（§2.2）。

---

*CC-PERF-ADV-SCORE-R2 · 2026-08-27 — 性能首分路径 R2 结论：R1 三条前置腿（HG-PREP / B0 / B1）已全部合 main，剩余步收敛为两步 = 指挥官真机六腿（§5.4 六行全【待填】，唯一临界路径）→ CC-AL-PERF（Fable5 xhigh）双门登记。核心裁定：B1 合流不解锁 P5——显式 `?quality=2` 深链禁用自动档、toast 不触发，v1.0 口径 P5 恒 70，v1.1 升版复核放登记后；腿 3/4 语义更新为「自动降档属默认真值，触发须留痕」。头号风险不变 = 登记同 commit clean 75/75 全量绿（至今无记录，CI 不跑 e2e，AL-PERF 当轮实跑一次产 S3+S5 双证据并可与 VEH-R3 双销账）。新增执行纪律 = 六腿同版本（真机窗口冻结 main 合流）。预计首分 ≈75–95（中枢 ~85–88，封顶 95.5），85 双门大概率被 P5 恒定缺口 + 任一维再缺口结构拒——照登不误。doc-only，`src/`、e2e、config 零改动。*
