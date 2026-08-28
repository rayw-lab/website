# CC-LOOP-ADVISOR-T5 Tick#5 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T5（model slug: `claude-fable-5-thinking-xhigh`）
- **时间**：2026-08-28 03:20–03:27 UTC（Tick#5）
- **基线**：main @ `88097f9`（本 tick `git fetch` 实测，自 Tick#2 无新合入）
- **纪律**：零 src/ 改动，本文档为唯一交付物；产出于独立 worktree `/tmp/t5-wt`
  （base = origin/main），未触碰 `/workspace` 共享检出。登记看板单源仍为
  `docs/research/cyber-city-score-loop-orchestration.md`，本文不重复登记分数。

---

## 0. 事实核查（fresh 取证，全部本 tick 实测；进程证据优先于 tip 静止假阴性）

| 对象 | 实测状态 | 取证方式 |
|------|---------|---------|
| main | `88097f9`，无新合入 | `git fetch` + `rev-parse origin/main` |
| #104 X2 | draft，tip `c24c7f3`（02:55:28 push 后静止）；门禁在现 tip **SUCCESS**（run 完成 03:00:44，fresh） | `gh pr view 104` statusCheckRollup |
| X2 进程 | **实时活跃**：`pnpm test:e2e`（PID 8039）02:56:30 起跑，双 playwright worker + chromium 在飞，preview :4499 在服务；trace 资源文件 03:21:07 仍在秒级写入 | `ps` + `find -newermt` 实测 |
| X2 e2e 中途战况 | **当前轮已有 1 例失败留痕**：`CITY-EXP-01 探索计数闭环`（`e2e/cyber-city-explore.spec.ts:252`）03:14 断言失败「泊车位 (-28,-28) 应可达（实测 x=23.5 z=-32.9）」；`trace.zip` + `error-context.md` 被保留（config 实测 `trace: 'retain-on-failure'`、本地 `retries: 0` → 留痕即失败，非重试噪声） | 读 config + test-results 目录实测 |
| #103 FXN-R7 | ready（非 draft），远程 tip 仍 `c4e844c`（02:15），门禁绿；补洞分支 `cursor/cc-fxn-r7-plug-*` 远程仍不存在 | `gh pr view 103` + `git ls-remote` |
| Codex 进程 | **实时活跃**：本地 merge commit `862ab26`（03:04:31，merge main@`88097f9` 入 #103 分支，保世系不 rebase，本地 ahead 9 未 push）；L6R 取证脚本三连跑——run1 03:10 失败（timeout world-quest）、run2 03:14 失败（recall 按钮点击后等导航 30s 超时，已采 4 PNG + webm）、**run3 03:22:20 在跑**（PID 16395，preview :4475 在服务） | `git log/status` + `ps` + 逐份 run\*.log 实读 |
| #112 SEC-P4 | draft，门禁 SUCCESS（03:09:59），待指挥官人工合入 | `gh pr view 112` |
| VM 硬护栏 | X2 + Codex + 本顾问 = **3/3**；本件收口即释放 1 槽 | 进程实测 |
| /workspace 残留 | 仍挂污染 ref `cursor/cc-loop-advisor-t2-5b71` @ `b85bf85`（ahead 4），T3 §4.2 处置仍未执行；风险与纪律维持 T4 §4 原判 | `git status -sb` 实测 |
| 同 VM 竞争（新注记） | X2 双 worker e2e 与 Codex chromium+ffmpeg capture **共存于同一 VM**，相互放大墙钟：X2 e2e 已 ~28 min（超 17–23 min 典型带），Codex capture 两连挂疑似部分为资源竞争 + SwiftShader 时序所致 | `ps` 全景实测 |

---

## 1. T4 阈值对照：两路均未达任何档，父代理动作 = 零打扰

T4 §1.2 口径：**均从最后一次可观测活性起算**。本 tick 取证刷新了两路的活性锚点：

| 路 | T4 原锚 | 本 tick 时点 | fresh 活性（刷新锚） | 刷新后阈值 | 档位判定 | 父代理动作 |
|----|---------|-------------|---------------------|-----------|---------|-----------|
| X2 | kickoff push 02:55 | T+26~31 min | trace 03:21 仍在写 → 锚刷新至 **03:21** | 软检 03:56 / resume 04:11 / 重派 04:26 | **未达 T+35 软检档**；且软检已随本 tick 取证提前完成，结论=存活（正处 e2e round1 尾段） | **零打扰**，继续等 |
| Codex | 本地 commit 03:04 | T+17~22 min | run3 03:22:20 起跑 → 锚刷新至 **03:22** | 软检 03:57 / resume 04:12 / 重派 04:27 | **未达任何档**；三连跑本身即最强活性信号（挂了 1 分钟内自动重跑） | **零打扰**，不 resume、不重派 |

T4 §1.3 修订触发器（`补洞分支不存在 ∧ tip 静止 ∧ 进程无活性 ∧ 本地无新 commit ∧ 过阈值`）
本 tick 全链**不成立**：两路进程均有活性、Codex 本地有新 commit。「tip 静止」在两路上
继续是假阴性，任何基于它的重派/催促都属误伤。

**新增排程约束（供父代理）**：同 VM 三重重载会进一步拖垮两路在飞任务——Tick#6 若开新
Task，重载型（build/全量 e2e）应缓开或压后，直至 X2 e2e / Codex capture 至少一路收口。

---

## 2. X2 ready 窗口：**未到达，且预估后移；T5-A 本 tick 不开**

T4 §2 预估 ready ~03:25–03:45，本 tick 实测三条依据将其推翻后移：

1. e2e round1 03:24+ 仍在跑（~28 min，同 VM 竞争拖慢，未完待续）；
2. **round1 已确定非 52/52**：CITY-EXP-01 失败留痕（§0）。X2 收口前必须 triage——
   若判 flake（竞争/SwiftShader 时序导致驾驶未达泊车位）需干净复跑一轮（17–23+ min）；
   若判真回归（R2 新增立面套件/前景景框的碰撞体挡道？失败语义正是「车没开到位」）
   则还要改码 + 新 commit + 门禁重跑；
3. R4 声明范围还剩 exact-port LHCI + VIS-01/02 基线重签 + poster/ritual_idle 恒等。

**修正 ready 预估**：flake 路径 ≥04:05；真回归路径 ≥04:30。即 **T5-A 顺延为 T6-A，
最早 Tick#7 前后达成**（若 X2 判 flake 且复跑一把过）。

T5-A 入场前提（T3 §3.3 + T4 §2 增补）本 tick 三缺二不变：X2 代理 RUNNING ❌、#104
仍 draft ❌、tip 静止+门禁 fresh 绿 ✅（但必将失效——失败处置至少产生复跑证据或新
commit）。且本 tick VM 3/3 无空槽，物理上也开不了。

**审计清单增补（T6-A 必查，本文新增）**：核对 X2 收口报告对 CITY-EXP-01 失败的处置
——要么给出 flake 定性 + 干净复跑 52/52 证据，要么给出修复 commit + 绿门禁。若 X2
undraft 时声称 52/52 却未解释该留痕（trace.zip 03:14 时间戳在本轮窗口内），**打回**。

---

## 3. Codex 本地 `862ab26`：应由 Codex 自己 push；父代理本 tick 不催、更不代 push

**该不该 push？——最终应该。** `862ab26` 是合规 merge（保世系不 rebase，正面执行 R6
hash 重写判例的反面教训；目的=与 #109 刷新后看板零冲突化），是 #103 收口序列的必要
部分。但 push 时点属于 Codex 的收口编排：其正以 run3 补 L6R 证据，证据齐才一次性
push——T4 §1.1 已识别并背书该「本地攒 commit + 采证据」模式。

**父代理是否 resume 催 push？——否。** 三条依据：

1. **阈值未达**：刷新锚 03:22，resume 档在 T+50 = 04:12，现在催早了 ~50 min；
2. **run3 在飞**：此刻 follow-up 会打断取证循环（T4 §1.2 的上下文切换浪费论原文适用）；
3. **代 push 是纪律违规**：父代理从 `/tmp/wt-fxn-r7-codex` 直接 push 会抢代理工作区
   所有权、把未完成验证的 merge 推上 **ready 状态的 #103**（非 draft，push 即触发新
   CI 并改变指挥官可合状态）、并与代理自身随后的 push 竞态。父代理只编排，不动别人
   工作区。

**升级路径（供 Tick#6+）**：若 run3/run4 连挂且 04:12（刷新锚 T+50）仍无 push →
resume 追问「报告 capture 卡点与预计 push 时间」，而非单纯催 push。注意因果耦合：
capture 失败若系同 VM 资源竞争，X2 e2e 收口释放负载后 run 成功率应回升——resume 前
先看 X2 是否已收口，避免把环境问题误判为代理问题。

**push 后连锁（T6-B 执行内容）**：新 tip 触发门禁 → 复核 SUCCESS → 报指挥官合
#103 → 功能登记 87 走秘书线（沿 T4 §5 T5-B 原文）。

---

## 4. Tick#6 预排（2–4 路，全部 `claude-fable-5-thinking-xhigh`，峰值 ≤3 VM）

| # | 任务 | 类型 | 触发条件 | 分支 | 串并行 |
|---|------|------|---------|------|--------|
| T6-A | X2 段末视觉审计（T5-A 顺延）：合流树冒烟 + 固定机位帧对照独立评分 + 双评 \|Δ\|≤5；入场检查 = T3 §3.3 + T4 §2 活性软检 + **本文 §2 CITY-EXP-01 处置核验** | 审计（零业务代码） | X2 代理 IDLE ∧ #104 ready ∧ tip 静止 ∧ 门禁 fresh 绿；预计最早 Tick#7 达成 | `cursor/cc-al-vis-x2-mid-5b71` | 与 T6-B 并行（文件域零交集） |
| T6-B | Codex 收口跟进：push 出现 → 核新 tip CI → 报指挥官合 #103 → 功能登记走秘书线；无 push → 按刷新锚执行 03:57 软检（零 VM）；04:12 仍无 push 且 capture 连挂 → 按 §3 升级路径 resume 追问 | 跟进（软检零 VM） | 常驻 | （重派仅过全阈值后才开 `cursor/cc-fxn-r7-plug-5b71`，base=`cursor/cc-al-fxn-r7-1d6f`，栈①） | 与 T6-A 并行 |
| T6-C | 秘书 P5：#112 合入确认 + #103/#104 状态变化 + 审计分统一刷板；**从合流后 main 新拉分支** | 秘书 | T4 §3 人工窗口（#112 首合 → #109 close superseded → #110/#111/#113 顺手合，本 T5 件同型可并入同窗）执行后 | `cursor/cc-loop-sec-p5-5b71` | 串行压后 |
| T6-D | 槽空滚动：M0-R4 综合分实算续跑（#106）或 PERF 六腿 kit | 实现/文档 | 仅当有空槽；**新增约束：X2 e2e / Codex capture 任一仍在跑时，重载型任务缓开**（§1 排程约束） | 沿用 #106 分支或新开 | 填空位，最低优先，可被 T6-A 抢占 |

VM 预算核对：本顾问收口即释放 → Tick#6 峰值 = X2（在途，预计收口）+ Codex（在途）+
T6-A（条件触发，大概率顺延）≤3，守住硬护栏。逻辑队列 = X2 收口（含 CITY-EXP-01
triage）、Codex 收口、T4 §3 人工合流窗口、T6-A、T6-C ≈ 5 项，带内（2–6），无积压。

---

*本文档为 CC-LOOP-ADVISOR-T5 Tick#5 交付物；登记看板不在本文更新，由秘书线单源维护。*
