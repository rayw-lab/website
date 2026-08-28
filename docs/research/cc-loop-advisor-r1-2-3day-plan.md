# CC-LOOP-ADVISOR-R1 · 2–3 天 VM Loop 自动推进顾问（tick 决策树 + 依赖图 + 派单预算）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-LOOP-ADVISOR-R1**（`/loop` 10m tick 自动编排的 2–3 天推进方案 · doc-only 顾问件） |
| 分支 | `cursor/cc-loop-advisor-r1-5b71`（base：`main@88097f9` = MERGE-WAVE 8/8 收口 + #101 X1b 合流 tip） |
| 日期 | 2026-08-28 |
| 性质 | **顾问报告，不是秤、不是看板**：零 `src/` 业务代码；批序正本仍归设计确认 §3 / G3 裁决 / handoff 单，本文只做 tick 级编排折叠与派单预算；单源看板恒为 `cyber-city-score-loop-orchestration.md`（当前 @771b1e4 待刷新，刷新动作见 §4 槽 3） |
| 必读输入 | `AGENTS.md` §4 · `cyber-city-orchestration-paradigm.md`（范式手册）· `cyber-city-score-loop-orchestration.md`（板 @771b1e4）· `cyber-city-test-framework.md` · `master-plan.md` §7 · 现场核实：`gh pr list`（#43/#103–#108 开放面）· #107 分支 `cyber-city-orchestration-handoff-2026-08-28.md` + `cursor-async-vm-subagent-limit-investigation.md` · #108 分支 `cyber-city-fxn-s2-commander-v1.md` · main 上 `cyber-city-vis-g3-x5-gate.md` / `cyber-city-vis-73-next-advisor.md` / `cyber-city-tm-agx-neutral-prep.md` |
| 消费方 | 父代理（`loop-cyber-city-orchestrate` 每 10m tick 的决策树与派单模板）· 秘书 Task（看板刷新口径）· 各实现/审计 Task（§3 骨架） |
| 纪律 | #43 BL2 永久禁合；e2e 52/52 硬门不动；模型一律 `claude-fable-5-thinking-xhigh` 禁降级；每批并发前单独派 1 路顾问（本文即首批顾问件） |

---

## 0. 结论先行

1. **现场与任务书一致**：main @ `88097f9`，登记矩阵 综合 **80**/98 · 视觉 **73**/98 · 功能 **84**/90（#103 分支登记 87，Codex P1 未清禁合）· 性能 **—**/85。开放面 = #104（X2 待 rebase）、#103（Codex 清账）、#105/#106（M0 WIP）、#107/#108（**base 落在 771b1e4，存在 stale-base diff 假象，合流前必须 rebase**，见 §5.2）、#43（永久禁合）。
2. **并发口径要拆两层**：指挥官授权「2–6 路」是**逻辑轨道数**；平台硬护栏是**同一父代理 async new-VM 子代理 ≤3 在飞**（#107 调研，运行时硬拒绝、不可调）。执行解法 = 六槽优先级队列 + **≤3 物理滚动窗**：完成一个补一个，10m tick 恰好是补位节拍（§4）。
3. **未来 2–3 天的主战场是三条互不阻塞的链**：视觉门控链（X2→G1→X4→X7→X5 合流→AL-VIS 复评，落点 76±1、上沿 ~78）、功能清账链（#103 Codex 清→87 登记→S-2 真机→AL-R10 判 90）、性能解锁链（真机六腿→AL-PERF 首分）。**后两条的关键腿是指挥官真机窗（零 VM）**——VM loop 能做的是把材料备齐、把 main 冻结窗协议摆好、然后进「等人列」而不是空转（§2.2）。
4. **tick 决策树的第一性原则：先收割、再解锁、最后才 fan-out**。每 tick 顺序 = 收割 IDLE 子代理 → 执行审计裁决/合并 → 检查门控解锁（G1 等书面动作零成本立即做）→ 空槽且五条件齐才派新 Task（§1.2）；CI 等待一律走 subscription，禁 tick 轮询（§7）。
5. **Tick#2 即派三路**（物理窗满）：P1 `CC-VIS-X2-REBASE-FINISH`（#104 续作）∥ P2 `CC-FXN-R7-CODEX-CLEAR`（#103 定向补洞，零 src）∥ P3 `CC-SEC-TICK-REFRESH`（看板刷新 + G1 预登记 + 归档行）。秘书最快收口，槽空后滚动补 P4 `CC-VIS-X5-ENTRANCE`（G3 已授权并行开工、串行合流恒排 X7 后）→ P5 M0-R4 续作 → P6 VEH-R3-R3（§4/§8）。
6. **两项治理增量建议**（不改秤不改门）：① **看板单写者规则**——并发 ≥3 后，实现 Task 不再直接写看板状态行，改由秘书 tick 统一落账，防多 Task 竞写单源文件（§5.2）；② **视频审美证据链**从「L2 录屏先例」升级为三阶段体系，X5 合流批起录屏成为 V5/V1 强制证据，rubric v1.2 升版时一次性入秤（§6）。

## 1. 2–3 天 VM loop 自动推进方案（每 10m tick 决策树）

### 1.1 tick 状态机（每 tick 必走，全程 ≤5 min 父代理墙钟）

```text
T0 盘点（只读，≤2min）
   ├─ gh pr list / gh run list（合并面 + CI 面）
   ├─ 在途子代理状态（IDLE / RUNNING / 超预算，对照 §7 墙钟表）
   ├─ tick 计数 +1（写 tick 日志，handoff 单 §9 先例）
   └─ 输出登记矩阵四行（北极星 98/98/90/85 vs 生产 80/73/84/—，性能未登记写 — 并注明解锁条件 = 真机六腿 → AL-PERF）
T1 收割（有 IDLE 完成即处理，优先级最高）
   ├─ 实现完成 → 该段有审计门？派审计 Task；无门（doc-only）→ 直接进合并队列
   ├─ 审计放行 → 按指定顺序/解法执行合并（有条件放行禁天然合并）；合后等 CI+Deploy 双绿再合下一个（MERGE-WAVE 先例）
   └─ 审计卡门 → 开定向补洞段（只做点名缺口，不降门不硬闯）
T2 解锁（书面/零成本动作立即做，不占槽）
   ├─ X2 合流在案 → G1 书面解除即刻生效 → X4 转单零等待
   └─ 真机件材料齐（#108+#96 在 main）→ 挂「等人列」+ 给指挥官发窗口就绪通知
T3 fan-out 判据（五条全过才派新 Task）
   ①空槽（async new-VM 在飞 <3） ②目标段前置门已过 ③文件域与在途零交叠
   ④不在真机冻结窗 ⑤待派队列深度 ≤6
T4 秘书节拍：tick% 3 == 0 → 看板刷新（若无秘书在途）
T5 防堵检查（§7 表）：超预算催报 / interim 留痕 / 收尸重派
T6 输出 Delta：矩阵四行 + 在途表 + 本 tick 动作 + 下 tick 预告 → tick 结束
```

### 1.2 关键裁决点（何时 fan-out / 何时等）

| 情形 | 裁决 | 依据 |
|------|------|------|
| 有空槽 + 队列有单 + 五条件齐 | fan-out（一次补一槽，不攒批） | 滚动窗即节拍，10m tick 天然防抖 |
| 段末审计未出结论 | **不派该链下段实现**，槽让给其他链 | 范式 §3.1 门控铁律 |
| 合并前置 CI 在跑 | `subscribe_github_ci` 订阅后本 tick 结束，**禁下 tick 轮询重查** | §7 规则 3 |
| 实现 Task 在跑全量 e2e（~18–23min ≈ 2 tick） | 视为正常 RUNNING，不催不重派 | 测试框架实测耗时表 |
| 真机冻结窗开启 | **全线禁合流、禁基线重签、禁 poster**；tick 只做 T0/T6 | G3 §3.4 冲突优先级第一条 |
| 指挥官真机件就绪但未开窗 | 进「等人列」，每 ~18 tick（3h）提醒一次，不占槽不空转 | §2.2 |
| 同文件域已有在途 Task | 排队不并发（文件域锁） | W1 坑 9（共享入口漏划） |
| 队列深度 >6 | 砍最低优先级或合单，禁积压 | §7 规则 1 |

### 1.3 分日推进剧本（按门控解锁顺序，非日历承诺）

| 阶段 | 主线动作 | 出口判据 |
|------|----------|----------|
| **D0（tick#2 起）** | Wave A 三路即派（§8）；秘书先收口 → 槽空滚入 X5 开工、M0-R4 续作 | X2 ready + e2e 52/52；#103 Codex P1 三项清账；看板刷到 88097f9 |
| **D0 尾–D1** | X2 合流 → **G1 书面解除（T2 零成本）** → X4 TM 转单（TM-PREP 协议已在 main）；#103 合流 → 功能 **87** 登记；#107/#108 rebase 后合流 → 真机窗材料齐，通知指挥官（S-2 + 六腿可合窗，S-2 kit §1 合窗条款） | G1 在案；功能行 87；「等人列」挂牌 |
| **D1–D2** | W3 门控串行：X4 → 审计/合流 → X7 天空 v2 → 合流 + VIS-01/02 基线重签；X5 收尾等 X7（合流恒排其后）；指挥官开窗则冻结 main、窗后收三件套 → 派 AL-R10（完整轮，src 已漂移 #101）+ AL-PERF | X4/X7 各自 e2e 52/52 + LHCI 不降；真机 artifacts 归档 |
| **D2–D3** | X5 合流 → **AL-VIS-L8-W3 复评**（触发条件「W3 含 X5 全合」）→ 视觉登记 76±1（上沿 ~78）；AL-R10 判功能 90 / AL-PERF 出性能首分；随后 **COMP-M0 五维重算**（`availableWeight===1` 硬查，LHCI 走 CI artifact 回填）→ 综合刷新；尾槽滚 VEH-R3-R3 与治理清账（§5.1） | 复评登记 JSON 重签；矩阵四行全部有新值或有明确阻塞注记 |

> 真机腿是唯一人肉依赖：若指挥官 2–3 天内未开窗，功能封顶 87–88、性能维持 —，loop 不空转、不降门、不用 CI 读数冒充真机（S-2 kit 红线④）。

## 2. 串并行依赖图

### 2.1 四轨依赖图（tick#2 时点）

```text
视觉轨（门控串行主链；X5 并行开工、串行合流）
  [P1 X2 #104 rebase→e2e→ready] ──合──► [G1 书面解除(零成本)] ──► [X4 TM] ──审/合──► [X7 天空v2] ──合+重签──►
       │                                                                                    │
       └─(X5 并行开工即刻合法, G3 已裁; 文件域正交)──────────► [X5 合流(恒排X7后, 冻结窗内禁合)] ──► [AL-VIS-W3 复评] ─► 登记 76±1
  恒后置: poster/X6 (W6)；X14 不预支

功能轨
  [P2 #103 Codex清账(零src)] ──合──► 登记 87 ──┐
  [#108 S-2 kit rebase→合] ──► [真机 S-2 窗(指挥官, 零VM)] ──► [AL-R10 完整轮] ─► 90 判定
                                                └─ 可与六腿合窗(一次冻结)

性能轨
  [#96 六腿桌面单✅在main] ──► [真机六腿窗(指挥官, 零VM)] ──► [AL-PERF] ─► 性能首分 → 矩阵第四行转实分

综合轨
  [功能87 ∧ 视觉复评 ∧ (性能首分或显式缺席注记)] ──► [P4 COMP-M0 五维重算(#106 续, CI artifact 回填)] ─► 综合登记刷新

秘书轨（P3）: 每 3 tick 刷新看板（单写者）; 本 tick 立即补落后两拍的 post-merge 刷新
杂项轨（P4 尾）: VEH-R3-R3（#102 interim 已合, 槽空滚动）; 治理清账（§5.1）
禁区: #43 永久禁合；真机冻结窗内全线禁合流
```

### 2.2 P1–P4 与真机件的协调规则

| 项 | 串并行裁决 | 协调要点 |
|----|-----------|----------|
| P1 X2 rebase（#104） | 与 P2/P3 **并行**（文件域正交：src/city vs docs/research vs 看板单文件） | 续用原分支 `cursor/cc-vis-x2-facade-r2-1d6f`；rebase → `88097f9` 后全量 e2e + VIS-01/02 显式基线重签（PR body 自认欠账）；合流后立即触发 G1 |
| P2 #103 Codex 补洞 | 与 P1/P3 **并行**；**与秘书刷新分工**：看板功能行刷新归秘书（单写者），本 Task 只清 L6 证据重采 + F5 hint-recall 补锚，落自己的审计文档与证据柜 | 零 src 纪律不变；清完转 ready，父代理合流后功能行由秘书改 87 |
| P3 秘书刷新 | **即派**（落后两拍：板仍 @771b1e4） | 刷 tip/矩阵/在途表/归档 #95–#102；**预登记 G1 解除条件**（ADV-73 §5 A2 建议：写死「X2 合流在案即解除」，X2 合流当日零等待放行 X4）；#103 未合前功能行写「84（#103 待清账→87）」 |
| P4 PERF / M0 / VEH | **槽空滚动**，永不挤占 P1–P3 | PERF 侧 VM 无新活（#96 已在 main），只维护「等人列」；M0-R4 先跑通 CI artifact 回填链路、**登记必须五维齐套**（缺维归一分只作诊断）；VEH-R3-R3 独立 VM 单跑，最低优先级 |
| 真机 S-2 + 六腿（零 VM） | 与全部 VM 轨**异步**；唯一交叉点 = **冻结窗** | 窗开前：合并队列排空、话术 A 一次发（注明含两单）；窗内：loop 只盘点；窗后：三件套归档 → AL-R10 与 AL-PERF 可**并行派**（消费不同证据、写不同文档）。S-2 轻量轮资格已失效（#101 合入 src）→ **R10 按完整轮派单**（S-2 kit §1 升级条款） |

### 2.3 跨轨冲突裁决序（高→ 低）

1. **真机冻结窗**（G3 §3.4 第一条）：窗内禁一切合流，X5 尤其禁在窗内合流。
2. **门控链完整性**：审计未放行不进下段；卡门开补洞段。
3. **合并队列串行**：一次合一个，CI+Deploy 双绿再合下一个。
4. **fan-out**：以上全部让路后才轮到派新单。

## 3. 每 tick 路由模板（角色 Task prompt 骨架）

统一底座 = 范式手册 §4.2（实现）/ §4.3（审计）骨架，**本节只登记各角色相对底座的 delta**。所有角色公共约束：model `claude-fable-5-thinking-xhigh` 禁降级；首行自报 slug；独立 worktree/独立 VM，禁共享 `/workspace` 可写态；PR/run 链接用 `gh` 实际输出；**不直接写看板**（改在返回件里报状态行草稿，由秘书落账）。

| 角色 | 相对底座的 delta | 交付物 |
|------|------------------|--------|
| **顾问** | 只读 + `docs/research/` 单文件；必含「结论先行 + 派单表 + 下一 tick 建议」；每批并发前单独派 1 路（指挥官授权条款） | 顾问报告 + fan-out 清单 |
| **调研** | 只读；联网/跨库取证须留 URL 与 commit 级引用；**涉座舱知识的调研先 clone raw-vault（§5.4 接入步骤照抄）** | 调研报告（证据可复查） |
| **脑暴** | 允许发散但交付必须收敛为「候选方案 ×N + 推荐 1 + 淘汰理由」；禁直接改任何正本 | 方案对比单 |
| **设计/WBS** | 输出批次边界（做/明确不做）、文件域白名单（**共享入口文件显式划归**，W1 坑 9）、串并行与 PR 形态裁决、每件的验收门 | 可直接转实现任务书的 WBS |
| **实现** | 底座全文照用；追加：base 必须 = 当前 main tip（或登记的栈 base）；全量 e2e ≥2 轮预算入排期；涉视觉件必交固定机位前后帧 + §6 录屏；**涉内容/文案件先读 raw-vault 座舱知识**（§5.4） | 代码 + 双证表 + draft PR |
| **测试** | 禁改 e2e 逻辑/playwright.config/lighthouserc/scripts/门槛/workflow（改动须单独说明留痕）；SwiftShader 限制照测试框架文档处置（LHCI null → CI artifact 回填并登记来源 commit） | 测试报告 + 工件 SHA-256 |
| **审计** | 底座 §4.3 全文照用；追加：stale-base PR 先自建「候选 ⊕ main」集成树再审（坑 4 变体，§5.2）；专项门以独立分判定；测试重写的历史截图提交前还原 | 审计报告 + 硬门表 + 裁决 |

## 4. 2–6 路并发预算表（tick#2 即用）

**物理口径**：平台硬护栏 = async new-VM 子代理 **≤3 在飞**（#107 调研，运行时硬拒绝，Dashboard 无开关）。指挥官「最多 6 路」落地为 **6 槽逻辑队列 + 3 路物理滚动窗**：槽 1–3 即派，槽 4–6 按完成顺序滚入；最少 2 路下限在整个窗口期恒满足。

| 槽 | Task | 角色 | model slug | 分支（base） | 文件域（互斥核对过） | 派发时机 |
|----|------|------|-----------|--------------|----------------------|----------|
| 1 | **CC-VIS-X2-REBASE-FINISH** | 实现 | claude-fable-5-thinking-xhigh | 续用 `cursor/cc-vis-x2-facade-r2-1d6f`（rebase → `main@88097f9`） | `src/lab/world/city/`（CityBlocks/StreetProps/ForegroundFraming）· facade-kit 资产 · `e2e/visual/__screenshots__/` 重签 | **即派（P1）** |
| 2 | **CC-FXN-R7-CODEX-CLEAR** | 定向补洞（审计续写，零 src） | claude-fable-5-thinking-xhigh | 续用 `cursor/cc-al-fxn-r7-1d6f`（#103 head） | `docs/research/loop8-fxn-r7*` · `docs/spec/assets/human-gate/`（L6 证据重采落库 + F5 hint-recall 补锚） | **即派（P2）** |
| 3 | **CC-SEC-TICK-REFRESH** | 秘书/文档 | claude-fable-5-thinking-xhigh | 新分支（父代理会话模板后缀），base main | 仅 `cyber-city-score-loop-orchestration.md`（+G1 预登记行） | **即派（P3）** |
| 4 | **CC-VIS-X5-ENTRANCE** | 实现（并行开工、串行合流） | claude-fable-5-thinking-xhigh | 新分支，base `main@88097f9` | G3 §2.1 白名单（入场编舞域：View/Transform 入场链 + `entranceSkippable` 采集位 + CITY-PERF-01 加法修订随批） | 首个槽空滚入（预计秘书收口后） |
| 5 | **CC-COMP-M0-R4-RESUME** | 实现/测试 | claude-fable-5-thinking-xhigh | 续用 `cursor/cc-comp-m0-r4-1d6f`（rebase main） | `docs/research/` M0 文档 + score 读侧（零门槛/零计分器逻辑改动） | 次个槽空滚入 |
| 6 | **CC-AL-VEH-R3-R3** | 审计 | claude-fable-5-thinking-xhigh | 新分支，base main | `docs/research/loop-veh-r3*`（零业务） | 尾槽滚入（最低优先级，可让位给 X4 转单） |
| 预留 | CC-VIS-X4-TM（条件触发单） | 实现 | claude-fable-5-thinking-xhigh | 新分支，base = X2 合流后 main | TM-PREP §文件域（`Rendering.ts` 双案取证协议） | **X2 合流 + G1 解除即发**，届时优先级压过槽 5/6 |

> 冲突自查：槽 1（src/city + 视觉基线）、槽 2（fxn 审计文档 + human-gate 证据柜）、槽 3（看板单文件）、槽 4（入场编舞域）、槽 5（M0 文档）、槽 6（veh 审计文档）——两两零交叠。唯一潜在竞写点「看板」已由单写者规则消除（§5.2）。

## 5. 治理 / 架构 / 测试 / 设计提效清单

### 5.1 GitHub 文件树与 PR 卫生

| 项 | 现状 | 动作（可并入秘书或尾槽治理单） |
|----|------|-------------------------------|
| 陈旧 PR | #1/#8/#27/#28/#30/#31/#34/#38 全部历史态（栈 base 分支已被单 merge PR 取代或早已合流） | 逐个关闭留痕（一句裁决 + 指向取代 commit）；#43 保持 open+禁合（永久 NO-GO 登记在案） |
| 远端分支堆积 | 60+ 条 `cursor/cc-*` | 合流即删实现分支；审计分支保留（报告世系）；秘书每次刷新附「可删分支」行 |
| `docs/research/` 膨胀 | 60+ 文件，检索成本上升 | 建 `docs/research/INDEX.md` 单页索引（按轨道分组 + 单源指针）；历史审计移 `docs/research/archive/` 的动作须单独裁决（链接稳定性风险），先只做索引不搬家 |
| PR 链接卫生 | 坑 5 复发风险（仓库实际 remote = `mywebsite`，PR URL = `website` 重定向） | 恒用 `gh pr view --json url` 实际输出，禁手拼 |

### 5.2 隔离树纪律（三条坑登记，第 3 条为本 Task 执行中实锤）

1. **stale-base diff 假象（坑 4 变体）**：#107/#108 base 在 `771b1e4`（MERGE-WAVE 前），对 main 的 diff 显示「删除 voice-pod GLB/脚本」等不存在的回退。**处置**：两分支合流前必须 rebase 到 `88097f9`；审计此类 PR 先自建「候选 ⊕ main」集成树。今后 doc 单也登记 base SHA，秘书刷新时核对「在途分支 base 是否落后 main 一个合并波」。
2. **看板单写者**：并发 ≥3 后，看板 `cyber-city-score-loop-orchestration.md` 只允许秘书 Task（或父代理白名单直改）写入；实现/审计 Task 在返回件里交「状态行草稿」。消除单源文件竞写冲突，也让「每 3 tick 更新看板」有唯一责任人。
3. **共享 `/workspace` 竞写实锤（2026-08-28 02:52 UTC，本 Task 执行中）**：本顾问、秘书（`cc-loop-sec-p3-5b71`）与 X2 rebase 代理共用同一 checkout；顾问暂存中的本文件被 X2 的 `git rebase --continue` 卷进其冲突收口提交 **`8ab019c`**（reflog 全程在案）。当时远端 X2 分支仍在旧世系 `a88a139`，污染未出本机。**处置**：X2 收口者 push 前 `git rm docs/research/cc-loop-advisor-r1-2-3day-plan.md` 摘除（或 rebase 摘该文件）；**今后并发 Task 一律独立 worktree/独立 VM，父代理派单时禁止两单落同一 checkout**（板上「禁共享 /workspace」从建议升格为硬纪律）。本顾问件已改在独立 worktree 提交，与 X2 现场零接触。

### 5.3 skill 缺口（建议沉淀到 `rayw-lab/agent-skills`）

| 缺口 | 内容 | 首个受益方 |
|------|------|-----------|
| loop-tick 编排 skill | 本文 §1 决策树 + §7 防堵规则固化为 SOP（tick 状态机、fan-out 五条件、等人列节拍） | 父代理每 tick |
| AL 审计 skill | 范式 §4.3 骨架 + 硬门表模板 + stale-base 集成树操作步骤 | AL-R10 / AL-PERF / AL-VIS-W3 |
| human-gate 走查 skill | S-2 kit + 六腿桌面单的通用化（冻结话术、三件套归档、回填纪律） | 指挥官真机窗 |
| 视频取证 skill | §6 机位脚本 + 录屏哈希 + SHA-256 台账操作化 | X5 批及以后所有视觉件 |
| raw-vault 知识接入 skill | §5.4 接入步骤 + 红线（私库不外流） | 内容/叙事/调研类 Task |

### 5.4 raw-vault 座舱知识接入点

| 项 | 内容 |
|----|------|
| 库 | `rayw-lab/raw-vault`（private，本 VM `gh` token 可 clone；2026-08-28 有更新）；关联库 `rayw-lab/cockpit-agent-memory`（座舱 MasterAgent 与记忆系统原始材料/编译知识）、`rayw-lab/scout-r0`（public，另一工程，勿与本站混淆——human-gate checklist §前置已有防呆） |
| 接入步骤（写进任务书） | `gh repo clone rayw-lab/raw-vault /tmp/raw-vault -- --depth 1` → 读根目录索引/README 定位座舱大模型知识分区 → 引用时登记「raw-vault @ <sha> · <路径>」 |
| 消费场景 | ① voice-pod（#101 已合）楼体叙事与 POI 文案（楼=产品线，cockpit-i18n pillar）；② `work/insights` MDX 内容件（master-plan §4/§5 证据等级）；③ S-2 三问话术与「定位语可读」判据的领域校准；④ 视觉 V7 主题原创维的叙事贴合取证 |
| 红线 | 私库内容**不得复制**进公开库 website；只作知识输入，产出必须原创转写并过公开红线自查；引用只落「库@sha·路径」指针不落原文 |

## 6. 视觉视频审美体系建立路径（与 rubric v1.1 对齐）

现有基础：rubric §4 帧优先协议（打分规程正本）+ L2 先例（5–10s 固定脚本录屏、226 帧逐帧哈希验连续性、SHA-256 登记）+ S-2/六腿真机录屏件。三阶段路径，**前两阶段零改秤**：

| 阶段 | 动作 | 时机与纪律 |
|------|------|-----------|
| **V-1 机位脚本单源化（即刻，doc-only）** | 冻结三镜头固定脚本：①首幕 orbit 5s ②变形全拍 8s ③驾驶跟拍 8s；落 rubric 附录或 `docs/spec/`；每批视觉实现交「前后对照录屏」（同脚本同机位），审计 fresh 录屏复核 | 可并入 X4 任务书作首个执行批；不改分值口径，录屏只作 V5/V1 证据增强 |
| **V-2 证据台账（X5 合流批）** | 入场编舞全链 10s 录屏成为 V5/V1 **强制**证据；建 `assets/visual-rubric/video/` 台账（命名 + SHA-256 + 机位脚本版本 + commit）；SwiftShader 录屏与真机录屏**双档登记禁互替**（L2 坑③：变长加速录屏只证编舞连续性不证时序/帧率） | X5 本就需 skip 护栏 e2e 断言，录屏与其同批交付边际成本最低 |
| **V-3 rubric v1.2 入秤（升版程序）** | V5 增「运镜/节奏连续性」子锚、V1 增「入场定帧」子锚；竞品视频锚补录（Orion 预加载→入城转场、Bruno 车落地开场的公开录屏对照）；与已排定的 P5/G3 注记**合并一次升版**（省版本号，改秤留痕铁律） | 恒排 AL-VIS-W3 复评**之后**——复评用 v1.1 原秤，禁本轮改秤（「不因门线改秤」法条） |

## 7. tick 积压防堵规则

**墙钟预算表**（超 1.5× 催报、超 2× 收尸，SwiftShader 时间膨胀已计入）：

| Task 类型 | 预算（墙钟） | 折 tick |
|-----------|--------------|---------|
| 顾问/秘书/文档 | 30–60 min | 3–6 |
| 实现（含全量 e2e ≥2 轮） | 60–120 min | 6–12 |
| 审计（fresh install + full 链 + 复评） | 90–150 min | 9–15 |
| 真机窗（人肉） | 不设预算，走等人列 | — |

七条规则：

1. **队列深度 ≤6**：待派队列超限即砍最低优先级或合单；禁「先登记后积压」。
2. **超时阶梯**：超 1.5× 预算 → tick 内催报一次；超 2× → 要求 interim 留痕（AL-VEH-R3 #102「僵死抢救」先例）→ 收尸并按**缩小范围**重派定向小单，禁原样重派。
3. **CI 等待零轮询**：合并前置 CI 一律 `subscribe_github_ci` 订阅唤醒；tick 内只读已知状态，不重复 `gh run watch`。
4. **tick 幂等**：派单前查「在途 registry」（分支名 + Task 名）；同名/同文件域在途即跳过，禁重复派单（10m tick 最大积压源就是重复派发）。
5. **一次一合**：合并队列严格串行，CI+Deploy 双绿再合下一个；audit 未放行的 PR 不进队列。
6. **冻结窗熔断**：真机窗开启 → T3/合并全停，tick 退化为纯盘点；窗后第一个 tick 先收三件套再恢复 fan-out。
7. **每 3 tick 看板落账**：秘书单写者按节拍刷新；若秘书在途则顺延一拍，禁两路秘书并发。

## 8. Tick#2 建议 fan-out 清单（父代理直接执行）

见文末回复同款清单；正本以本节为准：

| 序 | Task | 串并行 | 优先级 | 一句话任务书 |
|----|------|--------|--------|--------------|
| 1 | **CC-VIS-X2-REBASE-FINISH** | 与 2/3 并行 | 🔴 P1 | 续 #104：rebase → `main@88097f9`，补 VIS-01/02 显式基线重签，全量 e2e 52/52 + LHCI 不降 + poster/`ritual_idle` 恒等取证，转 ready 待合 |
| 2 | **CC-FXN-R7-CODEX-CLEAR** | 与 1/3 并行 | 🟠 P2 | 续 #103（零 src）：L6 `?quality=2` 证据重采并持久化落库 + F5 hint-recall 补锚；看板刷新不归本单（秘书单写者）；清完转 ready |
| 3 | **CC-SEC-TICK-REFRESH** | 与 1/2 并行 | 🟠 P2 | 看板刷至 `88097f9`：矩阵/在途表/归档 #95–#102；**预登记 G1 解除条件**；功能行注记「84（#103 清账后→87）」；登记本顾问件与六槽队列 |
| 4 | **CC-VIS-X5-ENTRANCE** | 槽空滚入（并行开工、串行合流恒排 X7 后） | 🟡 P3 | 按 G3 §2 授权范围开工入场编舞（skip 即达双护栏 + `entranceSkippable` 采集位 + CITY-PERF-01 加法修订随批），禁在真机冻结窗内合流 |
| 5 | **CC-COMP-M0-R4-RESUME** | 槽空滚入 | 🟡 P3 | 续 #106：rebase main，跑通 CI artifact LHCI 回填链路；登记分必须 `availableWeight===1` 五维齐套，缺维只出诊断行 |
| 6 | **CC-AL-VEH-R3-R3** | 尾槽滚入，可让位给 X4 条件触发单 | 🟢 P4 | 车辆 e2e 审计第三轮收口（#102 interim 续），独立 VM 单跑，零业务代码 |

条件触发预留：**CC-VIS-X4-TM** 在「X2 合流 + G1 解除」当 tick 即发，优先级升 🔴，压过槽 5/6。

> **现场更新（本文提交时点核实）**：P1 与 P3 已被兄弟代理抢跑——① X2 rebase 机械段已在本 VM 完成（本地 tip `037bd1d`，**远端仍 `a88a139` 未推**；全量 e2e/基线重签未跑；含 §5.2-3 污染文件待摘）；② 秘书刷新已提交并推送（`cursor/cc-loop-sec-p3-5b71` @ `3e863e0`，待开 PR 合流）。故 Tick#2 实际新派 = **槽 2（P2 Codex 清账）即派 + 槽 4（X5）/槽 5（M0-R4）滚入**；X2 只需「收口单」（摘污染文件 → e2e/重签 → push → ready），不要重复派全量 rebase 单。

---

*CC-LOOP-ADVISOR-R1 · 2026-08-28 — doc-only 顾问件，零 `src/` 改动；批序正本恒归设计确认/G3/handoff 单，看板单源恒归 `cyber-city-score-loop-orchestration.md`。*
