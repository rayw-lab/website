# CC-LOOP-ADVISOR-T15 · Tick#15 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T15（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 05:00–05:08 UTC，全部一手取证（面板 API RUNNING 过滤 / gh API / 全量 ls-remote / worktree birth 时间戳 / ps / tmux capture-pane / error-context 实读 / 文件 mtime 全 ISO）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t15-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① **验证轮首例出结果——EXP-01 ✘（11.9m），且失败签名与 X2 原始卡点重合**（§0 F2）：B 案动线改道没有清除第一触点，T14 §2.1「<3/3」分支兑现；② **ENV 首足迹 05:00:43 落地**（worktree + 分支建立），T14 §2.2 的 05:02 stale deadline 险胜达标，中止重派威胁解除（§0 F1）；③ 简报所提「T14 RUNNING」「四路 RUNNING」已被超越——**T14 已交付 [#128](https://github.com/rayw-lab/website/pull/128)、秘书 P8 已交付 [#130](https://github.com/rayw-lab/website/pull/130)**（简报四问之三从「P8 要点」转为「P8 补登清单」，§3）；④ **resume 拒使 plug 线全部 follow-up 杠杆失效**——T13「紧急纠偏补令」与 T14「收轮后 nudge」都不可达，处置树必须改写为「等收轮接管 / 中止」二元（§1）。

---

## 0. 事实核查——七条推翻/超越 Tick#15 简报的 fresh 事实

| # | 简报口径 | 实测（05:00–05:08 UTC） | 证据 |
|---|---------|------------------------|------|
| **F1** | 「ENV 分支远端或未 push」 | **ENV 首足迹已落**：`/tmp/env-wt` worktree birth **05:00:43.507**，分支 `cursor/cc-fxn-exp01-env-5b71` @ main `88097f9`，工作区干净（先前 status 短查的 e2e/src 两个 M 标记为 **stat-dirty 假象**，index 刷新后 diff 为空——无纪律违规）。分支确未推远端（全量 ls-remote 复核），但「报告型零足迹 → stale」链条自 worktree 落地起重置：T14 §2.2 的 05:02 deadline **险胜达标**，Tick#16 中止重派预案解除，转常规里程碑监控（§2.1） | stat birth + git status/diff 双查 + ls-remote 全列 |
| **F2** | （简报未及，本 tick 最重事实） | **验证轮 EXP-01 ✘（11.9m）**：`/tmp/x2-triage-verify.log` 实测 `✘ 1 [world-chromium] › cyber-city-explore.spec.ts:252 CITY-EXP-01 (11.9m)`；error-context 实读失败签名 = **`途径点 (-19,-30) 应可达（实测 x=19.5 z=-32.9）`**，页面快照速度 **1 km/h**。**卡点 (19.5,-32.9) 与 X2 原始卡点 (19.4,-32.7)（T9：17km/h 楔死楼排墙角）几乎重合**——plug r1 的 B 案动线改道（`8e441ef` 四条动线绕桥腿）**没有清除第一触点**，车辆以爬行态再次楔死同一墙角。T14 §2.1「<3/3」行兑现，且「禁止继续改动线（防路线编辑螺旋）」条款激活 | log + error-context + page snapshot 实读 |
| F3 | 「四路 RUNNING（ENV+plug+T14+TRIAGE）」 | 面板 RUNNING 过滤实测 = **本顾问 + plug（bc-686622df）+ ENV（bc-53ac6339）+ TRIAGE 僵尸（bc-ace126a4）**。**T14 已交付**：PR [#128](https://github.com/rayw-lab/website/pull/128) draft（doc commit `d2e1578` 05:02:01）；其 §2.1 已把 plug A/B 处置从 T13「飞行中紧急纠偏」修正为「**审计门定谳、飞行中不反转**」——本简报仍按 T13 口径描述「纠偏未送达」，两代顾问口径差需按 §1 收敛 | 面板 API + gh + t14-wt 实读 |
| F4 | 「SEC-P8 要点（待供稿）」 | **P8 已交付**：PR [#130](https://github.com/rayw-lab/website/pull/130) draft（`f3bc6c2` 05:05:49，base = #125 head `77a8c2d`，栈深 3：#121⊂#125⊂#130，符合 T14 §3.2 预排）。登记覆盖 T13 系事实（TRIAGE stale 裁决 / plug r1 撞纪律 / 先行分支出土），但**成稿早于 F1/F2**，且写「T14 暂无 PR」——四项已过时，转 §3 补登清单 | gh pr view 130 + commit 时序 |
| F5 | 「TRIAGE(stale) RUNNING」 | 复核成立且**中止仍未执行**：bc-ace126a4 面板 RUNNING（04:18:23 起，三腿零活性）。T13 裁「中止」、T14 裁「中止 GO 带 2 分钟保险」，P8 看板已按「已判 stale 中止」登记——**裁决已三度落纸，执行零次**。看板措辞与面板实况出现「已裁未执」缝隙 | 面板 API + #130 diff 实读 |
| F6 | （简报未及） | **归档代办第四次逾期**：`/tmp/evidence-exp01` 仍不存在（T12 裁决 → T13 动作清单 → T14「事不过三」→ 本 tick 第四次）。被覆写 `e2e-results.json` 垃圾值与 trace 原件仍在 `/tmp/main-wt/test-results/` 裸奔 | ls 实测 |
| F7 | 「#103/#125 未合；#104 draft 禁 ready」 | 复核不变：#103 OPEN/ready（`1a4296f`）；#104 draft 冻结 `c24c7f3`；#125 OPEN/draft；main 无新合入。plug 工作区仅两个未提交 scratch 探针（`tools/camera/_scratch-*`，未入库），tip 仍 `368b4d4` | gh + git status 实测 |

---

## 1. plug 纠偏重派裁决（任务 ①）：**重派 GO，但严格时点门控——收轮后接管，不是现在**

### 1.1 杠杆现实：resume 拒后只剩两个杠杆

原 plug 代理（bc-686622df）resume 拒 → T13「紧急纠偏补令」与 T14「收轮后 30min 无回填 → nudge」**全部物理不可达**。剩余杠杆只有：**（a）等自然 IDLE 后新派接管 Task；（b）中止**。任何「现在就派新 Task 写同一分支」的方案都制造双写手（plug 分支正被原代理的验证轮 tmux 驱动占用）——**禁止**。

### 1.2 为什么不是现在中止

验证轮（04:51 起，`--project=world-chromium --no-deps -g "CITY-EXP-01|CITY-QST-02|CITY-FB-01"`）正在产出本段最值钱的三个数据点：EXP-01 已出（✘，F2），QST-02 在跑（05:05 `quest-car-ready.png` 落盘），FB 排队。#33/#35「异根 vs 挤兑」裁决数据就在后两例里——现在中止 = 白烧已投入 ~15min SwiftShader 渲染 + 丢挤兑判读数据 + T14 §1.2 中止保险（TRIAGE 误伤复核）失去参照物。**让它跑完**。

### 1.3 T13 vs T14 口径收敛 + F2 后的新形势

T13 §3.0（紧急纠偏：冻 B 补 A）与 T14 §2.1（审计门定谳、飞行中不反转）表面冲突，实际被 resume 拒统一：**飞行中反转已不可行，等收轮是唯一路径**——T14 口径胜出且不再依赖「父代理自律」。F2 又给了增量：EXP-01 以「同卡点爬行/楔死」签名再挂，意味着 **B 案连工程有效性都未证明**（不只是纪律问题），T14「禁止继续改动线」条款激活。据此原代理收轮后若自发起 r2 继续改动线，性质从「方向分歧」升级为「违反已激活的禁改令」。

### 1.4 接管协议（父代理执行）

| 触发条件 | 动作 |
|---------|------|
| 验证轮收轮（三例结果全出 / `VERIFY_EXIT` 哨兵落 `/tmp/x2-triage-verify.log`）+ 原代理自然 IDLE | **派 PLUG-R2 接管 Task**（卡见 §1.5），同分支单写手恢复 |
| 收轮后原代理仍 RUNNING 且 +30min 无 §6 回填 commit | 中止（nudge 杠杆已失效，无第三选项）→ 派 R2 |
| 原代理出现**继续改动线的新 commit** 或 **全量 e2e 进程**（破 HOLD） | 立即中止 → 派 R2（F2 已激活禁改令 + HOLD 硬门在册） |
| 原代理收轮后正常回填 §6 并 IDLE | 直接派 R2（回填照收作输入） |

### 1.5 PLUG-R2 接管卡要点（五条，缺一不可）

1. **同分支** `cursor/cc-vis-x2-plug-5b71`（栈场景① base `c24c7f3` 不变），接管前先 fetch 确认 tip（防原代理最后一推）；
2. **e2e/playwright.config 全冻结**：`8e441ef`/`368b4d4` 不 revert（B 案存证）也不扩——F2 已证 B 案在同卡点无效，任何动线再编辑 = 路线编辑螺旋；
3. **第一动作 = fresh EXP-01 trace 第一触点定谳**：`/tmp/plug-wt/test-results/cyber-city-explore-*world-chromium/trace.zip`（05:03）逐帧定 (19.5,-32.9) 墙角归属——**X2 新增几何（楼排/景框件）→ 本卡落 A 案**（几何让位 + `tools/camera/audit-x2-visibility.mjs` NDC 探针构图碰撞双达标）；**main 存量 → 回报父代理移交 ENV**，本分支不修 main 侧几何（T13 §3.1-③ 边界规则原文）；
4. **验收全量 e2e 维持 HOLD** 至 ENV ⑤ 签字（80 例 0 failed/0 skipped/0 flaky 门不降；workers 2→1 未签字不作数）；
5. 若原代理未回填 §6 验证附录，由 R2 代回填（EXP-01 ✘ 数据点 + QST-02/FB 结果照登，含失败签名原文）。

### 1.6 编排教训（供范式手册 §3.5 + 秘书上板）

**「可 resume 性」不是可靠假设**：本次纠偏窗口（04:55 T13 裁决 → 05:00 resume 拒确认）内父代理对在途代理零杠杆。后续凡派「可能需要飞行中纠偏」的实现 Task，任务卡内应预埋**自检查点条款**（如「每 N commit 后 fetch 指定路径的指令文件」）或接受「纠偏一律收轮后接管」的时延成本——二选一在派单时显式决定，不再事后即兴。

---

## 2. ENV/plug 进度阈值 Tick#16（任务 ②）

### 2.1 ENV（bc-53ac6339）——stale 预案解除，转里程碑监控

| 时点 | 阈值 | 到点动作 |
|------|------|---------|
| **Tick#16（~05:10）** | ① 归档第一动作 `/tmp/evidence-exp01` 应已建（其卡第一条；05:05 实测仍无）；② `/tmp/env-wt` 应有文档腿足迹（报告草稿 / 实验矩阵新 mtime） | ①未建 → **父代理即刻自跑代办命令**（第四次逾期，事不过四；命令见 T14 §4 附，幂等 ~1min）；②全无且无进程 → follow-up 询问（**不中止**——worktree 足迹已证活性，ENV 线 resume 未被证明失效，询问杠杆仍可用） |
| Tick#17（~05:20） | 首 commit（报告骨架）落工作区 | 无 → 报告型三腿 stale 流程重启（进程/推送/产物 mtime；面板腿已删，T14 F5） |
| Tick#18（~05:30） | 首推远端 | 无 → stale 候选坐实，Tick#19 复核后中止重派（新卡四条款沿 T14 §2.2） |
| 即刻生效（复读） | **runway 排队令**：ENV 运行腿 HOLD 至验证轮收轮（~05:27–05:40，§2.2）；文档腿不受限 | 若 ENV 起 3D 进程与验证轮并行 → follow-up 叫停（单跑道令，4 核 SwiftShader 337% CPU 实测在册） |
| 即刻推送（增量输入） | **F2 失败签名喂给 ENV**：`途径点 (-19,-30) 不可达，卡 (19.5,-32.9) @1km/h`——与其三候选裁决直接相关：坐标既不在出泊圈（候选 a 的爬行位），也可对照桩排世界系占位（候选 b 几何换算）与 X2 原卡点 (19.4,-32.7)。**这是改线后仍复现的失败**，对「桩排封直线走廊 vs 控制器爬行」的区分力比历史数据更强 | follow-up 附签名原文 + trace 路径 |

### 2.2 plug（bc-686622df）——收轮窗收窄，纯监控

- **收轮窗更新**：EXP-01 已耗 11.9m（04:51→05:03）；QST-02 05:03 起（折算 ~750s → ~05:16 收）；FB ~650s（→ **~05:27** 收）。预测收轮 **05:27±5min**，落 T14 的 05:25–05:40 窗内，Tick#17–18 之间。
- **判活不变**：`/tmp/plug-wt/test-results/` mtime 推进 + chrome 渲染 PID CPU；**双零增长 ≥25min → 候选；≥35min → 僵死升级**（精确 PID kill，严禁按名杀）；绝对 kill-line **06:15** 不变。
- **收轮后阈值（resume 拒改写版，替换 T14 §2.1 nudge 行）**：见 §1.4 接管协议表——所有「nudge/催回填」字样作废，二元化为「等 IDLE 派 R2 / 中止派 R2」。
- **Tick#16 时点定性**：预计 QST-02 刚收、FB 在跑——**纯监控 tick，零干预**；父代理利用该 tick 把 R2 接管卡（§1.5）备好，收轮即派不空转。

---

## 3. SEC-P8 对表 + 补登清单（任务 ③）——P8 已交付 [#130](https://github.com/rayw-lab/website/pull/130)，本节转补登件

P8 成稿 05:05:49，覆盖 T13 系事实合格（TRIAGE stale 裁决、plug r1 撞纪律、先行分支出土、#103→#125 塌栈序、登记矩阵四行）。以下 **7 条为其成稿后新事实 / 缺项**，下轮秘书刷新（P9 @ Tick#18，或事件触发的增量 commit）必须补登：

1. **ENV 首足迹 05:00:43**（F1）：看板「分支本地 @ 88097f9 未推」行更新为「worktree + 分支已建，里程碑监控中（阈值链 §2.1）」；
2. **验证轮 EXP-01 ✘ 数据点**（F2）：失败签名原文 + 卡点与 X2 原卡点重合的定性 +「B 案工程有效性未证明」结论；QST-02/FB 结果收轮后随附；
3. **resume 拒事故**：plug 线 follow-up 杠杆全灭 → 接管协议（§1.4）上板；范式增量候选「可 resume 性不是可靠假设」（§1.6）；
4. **T14 交付补号**：[#128](https://github.com/rayw-lab/website/pull/128)（P8 写「暂无 PR」已过时）+ T14 三条范式增量随板（面板 updatedAt 删腿 / tmux environ 归因陷阱 / 单跑道令）；
5. **TRIAGE「已裁未执」缝隙**（F5）：面板 bc-ace126a4 仍 RUNNING——看板「已判 stale 中止」应加注「执行待父代理落地（+2min 保险复核）」，直至面板消失才可写「已中止」；
6. **归档代办第四次逾期**（F6）：升级为看板显式待办行，注明「T12 起连续四轮未执行」；
7. **本顾问 T15 交付登记**（PR 号落地后补）+ tick 计数表 #15 行收口。

登记矩阵四行照抄（看板单源，本文不改板）：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能未登记显式 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。

---

## 4. `cc-exp01-corridor-fix-0254` 并入 ENV 建议（任务 ④）：**不并代码，只并证据链**

### 4.1 三条硬理由

1. **ENV 卡自身纪律** = 零 src/ + 零 e2e、只交报告——把 94+/25- 的 e2e diff 并进 ENV 分支 = ENV 破自己的卡；
2. **base 陈旧**：分支 base = 旧 main `77ac482`（T13 裁决 5「严禁直 cherry-pick」在册）；
3. **裁决权预支**：该分支是 B 案家族原型（对角走廊 + pure-pursuit 巡线），而 B 案转正与否 = ENV §2-② 定谳 + 指挥官签字（测试面解冻一次性签字）——先并 = 未签先兑。

### 4.2 正确姿势：ENV 报告设「三源对表」专节

ENV fetch 后**只读引用**，把三份独立证据对表收敛：

| 源 | 时点 | 核心贡献 |
|----|------|---------|
| corridor-fix（`33ab9e2`/`a59d1ea`） | 08-27 | 「直线走廊被 BL1 桩排封死」定性 + 50min 轮漂实测（漂进备件箱堆 (26.6,-19)）+ pure-pursuit 修法原型 |
| plug r1 triage 报告（`8507aa3`） | 08-28 04:47 | #32 真回归桥腿几何解析 + #33/#35 挤兑 flake + 3 潜伏雷 |
| **fresh 验证轮 EXP-01 ✘**（F2） | 08-28 05:03 | **改线后仍挂**：`途径点 (-19,-30) 不可达，卡 (19.5,-32.9) @1km/h` ≈ X2 原卡点——对三候选的区分力最强（trace 现成：`/tmp/plug-wt/test-results/.../trace.zip`） |

三源几何换算（桩排世界系占位 ⊕ 各卡点坐标 ⊕ spec 走廊带）= 三候选裁决的判据闭环。

### 4.3 若 B 案最终签字转正

也**不合此分支**：届时存在两个 B 实现（corridor-fix 对角走廊 vs plug r1 四动线绕行——后者已被 F2 证明至少在本 VM 无效），需以 fresh base 调和重实现为**单 PR**，随附测试面解冻签字与测试跑法单源文档同步修订。corridor-fix 分支**保留不删**（证据 + 原型价值），看板登记 SHA `a59d1ea`。

---

## 5. 裁决一览（父代理直接执行，按序)

1. **plug 重派 GO、时点门控**（§1）：现在不动（验证轮在产 #33/#35 数据）；收轮 + IDLE → 派 PLUG-R2 接管卡（§1.5 五条）；出现改动线新 commit / 全量 e2e / 收轮后 30min 无回填 → 中止再派。nudge 字样全部作废（resume 拒）。
2. **F2 签名即刻喂 ENV**（follow-up）：`途径点 (-19,-30) 不可达，卡 (19.5,-32.9) @1km/h` + trace 路径 + 与 X2 原卡点重合的定性——ENV 三候选裁决最强新判据。
3. **ENV stale 预案解除**（F1），转里程碑链：Tick#16 归档 + 文档足迹 → Tick#17 首 commit → Tick#18 首推；runway 排队令复读。
4. **TRIAGE 中止执行落地**（第三度提醒执行 gap）：裁决已三落纸，面板仍 RUNNING；执行后 2–3min 复核验证轮存活（T14 §1.2 保险）。
5. **归档代办第四次逾期**：父代理即刻自跑（幂等命令在 T14 §4 附），勿再等 ENV。
6. **秘书补登 7 条**（§3）：P9 @ Tick#18 或事件触发增量 commit；「已裁未执」缝隙措辞修正。
7. **corridor-fix 不并代码只并证据**（§4）：ENV 报告设三源对表专节；B 案若转正也以 fresh base 单 PR 重实现；分支保留登记 `a59d1ea`。
8. **#103/#125 合流提醒**（连续第四 tick 复读）：#103 即合 → #125 随后（自动收编 #121）→ #130 塌栈；merge commit 优先防悬挂。

---

*本文档为 CC-LOOP-ADVISOR-T15 Tick#15 交付物；登记看板不在本文更新，由秘书线单源维护。*
