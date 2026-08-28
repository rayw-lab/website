# CC-LOOP-ADVISOR-T4 Tick#4 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T4（model slug: `claude-fable-5-thinking-xhigh`）
- **时间**：2026-08-28 03:10–03:15 UTC（Tick#4）
- **基线**：main @ `88097f9`（自 Tick#2 无新合入）
- **纪律**：零 src/ 改动，本文档为唯一交付物；产出于独立 worktree `/tmp/t4-wt`
  （base = origin/main），未触碰 `/workspace` 共享检出。登记看板单源仍为
  `docs/research/cyber-city-score-loop-orchestration.md`，本文不重复登记分数。

---

## 0. 事实核查（fresh 取证，全部本 tick 实测）

| 对象 | 实测状态 | 取证方式 |
|------|---------|---------|
| main | `88097f9`，无新合入 | `git fetch` + `git log origin/main` |
| #104 X2 | draft，`MERGEABLE`，tip `c24c7f3`（02:55:28 push，此后静止）；门禁在现 tip **SUCCESS**（run 02:55:52，fresh） | `gh pr view 104` + `gh run list --branch` |
| X2 代理 | RUNNING（bc-0364bcc9，02:50:33 创建，~20 min）；**进程级活性证据**：`pnpm test:e2e` 02:56 起跑（PID 8039，`astro build && playwright test`），playwright worker + headless chromium 03:00 起活跃，preview :4499 在服务，`/tmp/x2-wt/test-results/` 正在持续写入 | `ps aux` + `find -newermt` 实测 |
| #103 FXN-R7 | ready（非 draft），`MERGEABLE`，门禁绿，远程 tip 仍 `c4e844c`（02:15）；Codex 3 条 review（2×P1+1×P2）后无新评论；补洞分支 `cursor/cc-fxn-r7-plug-*` 远程仍不存在 | `gh pr view 103` + `gh api pulls/103/comments` + `git ls-remote` |
| Codex 清账代理 | RUNNING（bc-84cf6ccc，02:57:16 创建，~14 min）；**本地新进度未 push**：`/tmp/wt-fxn-r7-codex` 已有 merge commit `862ab26`（03:04:31，main@`88097f9` 合入 #103 分支，保世系不 rebase）；03:05 起 preview :4475 在服务，**03:14 实测 `capture-l6r.mjs` 正在跑 L6 重取证** | `git log 862ab26` + `git merge-base --is-ancestor` + `ps aux` |
| #112 SEC-P4 | draft，`MERGEABLE`，门禁 SUCCESS；**实测含 #109 全量**（`sec-p3` tip 为 `sec-p4` tip 祖先） | `git merge-base --is-ancestor` = YES |
| #109 SEC-P3 | draft，`MERGEABLE`，门禁 SUCCESS；被 #112 完全覆盖 | 同上 |
| #110 R1 / #111 T2 / #113 T3 | 均 draft + `MERGEABLE` + 门禁 SUCCESS（#113 本 tick 实测已由 UNSTABLE 转绿）；三件均为纯新增单文件 | `gh pr view` + `git diff --stat` |
| VM 硬护栏 | X2 + Codex 在飞 = 2/3；**计入本顾问 Task 则 3/3**，本件收口即释放 | `list-cloud-agents` |
| /workspace 残留 | 仍挂污染 ref `cursor/cc-loop-advisor-t2-5b71` @ `b85bf85`（≠ 远程 `7d5827b`），T3 §4.2 处置尚未执行 | `git rev-parse` 实测 |

---

## 1. X2 / Codex 僵死判定：**双双存活，零僵死，本 tick 不动它们**

### 1.1 判定结论（进程级证据，非推测）

| 路 | 判定 | 决定性证据 |
|----|------|-----------|
| X2 | **存活，正处 R4 收口自检的全量 e2e 段** | e2e 进程链 02:56 起跑（紧接 02:55:28 kickoff push），playwright + chromium 03:00 起活跃，test-results 持续写入。全量 e2e 墙钟 ~17–23 min → 预计 ~03:17–03:23 跑完，之后还有 exact-port LHCI + VIS-01/02 基线重签 + poster/ritual_idle 恒等（R4 kickoff commit 声明范围） |
| Codex | **存活，正处 L6 重取证段** | 本地已产出 merge commit `862ab26`（03:04:31，未 push——「无新 push」≠「无进展」）；03:14 实测取证脚本 `capture-l6r.mjs` 正在运行，preview :4475 在服务 |

「tip 无 push」在两路上都是**假阴性信号**：X2 在跑测试（跑完才会有下一个 commit），
Codex 在本地攒 commit + 采证据（采完才会一次性 push）。

### 1.2 僵死判定阈值（供父代理后续 tick 复用，均从最后一次可观测活性起算）

| 时点 | X2（kickoff push 02:55） | Codex（本地 commit 03:04） | 父代理动作 |
|------|--------------------------|---------------------------|-----------|
| T+35 min（X2≈03:30 / Codex≈03:39） | 若仍无 push | 若仍无 push | **软检**：`ps` 查进程链 + worktree 本地 commit/mtime；有活性 → 继续等，零打扰 |
| T+50 min（X2≈03:45 / Codex≈03:54） | 无 push 且无进程活性 | 同左 | **resume/追问**：向该代理发 follow-up 要求报告阶段与阻塞点；禁止此时并行重派 |
| T+65 min（X2≈04:00 / Codex≈04:09） | 追问后仍无 push/无响应 | 同左 | **判僵死 → 重派**（比照 AL-VEH-R3 R2→R3 先例）：X2 重派 R5 收口段；Codex 按 T2 §2 P2 三件范围重派补洞（base=`cursor/cc-al-fxn-r7-1d6f`），不降门 |
| 任意时刻 | 代理转 ERROR，或转 IDLE 但 PR 仍 draft/无收口报告 | 同左 | **立即软检→重派**，不等计时 |

**阈值依据**：全量 e2e 上限 23 min + AGENTS.md 每段 ≥2 轮 e2e 预算 + LHCI/重签开销，
35 min 内静默属正常工况；50 min 起才值得打扰（过早 nudge 会打断跑测中的代理，制造
上下文切换浪费）。

### 1.3 对 T3 预排 T4-B 的修订：**触发条件表面满足，但被活性证据推翻**

T3 §3.1 给 T4-B 的触发器是「Tick#4 时补洞分支不存在且 #103 tip 仍 `c4e844c`」——
两条本 tick 均为真。但该触发器缺一个前置：**先做活性检查再判僵死**。本 tick 活性
检查结果为 Codex 明确在干活（§1.1），故 **T4-B 重派不执行**。此时重派会与在途代理
在同一门控链上双飞、同分支撞 push，属硬闯门。修订后的触发器（供 Tick#5+ 使用）：
`补洞分支不存在 ∧ tip 静止 ∧ 进程无活性 ∧ 本地 worktree 无新 commit ∧ 过 §1.2 阈值`。

---

## 2. T4-A 视觉审计：**本 tick 不开**（前提三缺二）

| T4-A 入场前提（T3 §3.1） | 本 tick 实测 | 判定 |
|--------------------------|-------------|------|
| X2 代理 IDLE | RUNNING（e2e 进行中） | ❌ |
| #104 ready（undraft） | 仍 draft | ❌ |
| tip 静止 ≥1 tick 且门禁 fresh 绿 | `c24c7f3` 静止 ~19 min，门禁 fresh 绿 | ✅（但将失效：R4 范围含基线重签 + poster 恒等，大概率还有新 commit） |

在移动 tip 上开审 = 白烧一个 VM 槽 + 审计结论作废。且本 tick VM 已 3/3（含本顾问），
无空槽给 T4-A。**预计 X2 ready 窗口 ~03:25–03:45**（e2e ~03:20 完 + LHCI/重签/undraft），
即 **T4-A 最早 Tick#5 末或 Tick#6 开拍**。入场检查沿用 T3 §3.3 全文，增补一条：
开拍前重跑 §1.2 活性软检，确认 X2 代理已 IDLE 而非「还在推 commit 的 RUNNING」。

---

## 3. #112 / #109 / #110 / #111 合流优先级建议（仅建议；**父代理禁擅自 merge**，全部为指挥官人工动作）

| 序 | PR | 动作建议 | 依据 |
|----|----|---------|------|
| 1 | [#112](https://github.com/rayw-lab/website/pull/112) SEC-P4 | **首合**（undraft + merge） | 看板单源最新态（Tick#3 刷新），实测**严格包含 #109 全量**；先合它使看板 stale 窗口最短。CI 绿 + MERGEABLE + 单文件（看板），与在飞两路文件域零交集 |
| 2 | [#109](https://github.com/rayw-lab/website/pull/109) SEC-P3 | **合 #112 后直接 close（superseded），不单独合** | 内容已被 #112 覆盖（祖先关系实测）；本仓惯例 squash 合并，#112 squash 后 GitHub **不会**自动把 #109 标记为 merged，需手动 close 并注明 superseded by #112。若指挥官坚持先合 #109 再合 #112 也无冲突（#112 是其快进超集），只是多一轮 CI，不推荐 |
| 3 | [#110](https://github.com/rayw-lab/website/pull/110) 顾问 R1 | 同窗口顺手合 | 纯新增单文件，零冲突面；增益件非阻塞件 |
| 4 | [#111](https://github.com/rayw-lab/website/pull/111) 顾问 T2 | 同窗口顺手合（与 #110 任意序） | 同上；注意**只能合远程 tip `7d5827b`**，`/workspace` 本地污染 ref `b85bf85` 禁止推送（§4） |
| 5 | [#113](https://github.com/rayw-lab/website/pull/113) 顾问 T3 | 可并入同一人工窗口（本 tick 实测门禁已转绿） | 不在指令清单内，仅提示：同为纯新增单文件，早收减少 open-PR 存量 |

合流后连锁提醒：#112 合入即改看板文件，**秘书 P5 必须从合流后 main 重新拉分支**，
不得基于旧 P4 分支续写；#110/#111/#113 均不触碰看板文件，任意序零冲突。
`c4e844c`（#103 tip）在 Codex 本地 `862ab26` 之后如何 push 与本节无依赖。

---

## 4. /workspace 残留风险复核（顺带，零改动留痕）

T3 §4.2 登记的处置**尚未执行**：`/workspace` 本 tick 实测仍挂在污染 ref
`cursor/cc-loop-advisor-t2-5b71` @ `b85bf85`（叠有 4 个 X2 实现 commit，≠ 远程
`7d5827b`）。风险维持原判：任何代理在 `/workspace` 直接 push 该分支会污染 #111。
两条纪律继续有效：① 新 Task 一律 `git worktree add` 独立目录（本顾问 `/tmp/t4-wt`
已照办）；② 禁止从 `/workspace` push 任何 `-5b71` 顾问分支。低优先 housekeeping：
下一个占用 `/workspace` 的维护动作顺手 `git checkout main && git branch -f
cursor/cc-loop-advisor-t2-5b71 origin/cursor/cc-loop-advisor-t2-5b71`。

---

## 5. Tick#5 预排（2–4 路，全部 `claude-fable-5-thinking-xhigh`，峰值 ≤3 VM）

| # | 任务 | 类型 | 触发条件 | 分支 | 串并行 |
|---|------|------|---------|------|--------|
| T5-A | X2 段末视觉审计（= T3 预排 T4-A 顺延）：合流树冒烟 + 固定机位帧对照独立评分 + 双评 \|Δ\|≤5，口径全按 T3 §3.3 + 本文 §2 增补 | 审计（零业务代码） | X2 代理 IDLE ∧ #104 ready ∧ tip 静止 ∧ 门禁 fresh 绿；预计 Tick#5 末–Tick#6 达成 | `cursor/cc-al-vis-x2-mid-5b71` | 与 T5-B 并行（文件域零交集） |
| T5-B | Codex 收口跟进：Codex push 后核 CI → 指挥官合 #103 → 功能登记 87 走秘书线；若 Tick#5 仍无 push，按 §1.2 阈值执行软检（03:39 前零打扰，不重派） | 跟进（软检零 VM；重派仅过 §1.2 全阈值后） | 常驻 | （重派才开 `cursor/cc-fxn-r7-plug-5b71`，base=`cursor/cc-al-fxn-r7-1d6f`，栈①） | 与 T5-A 并行 |
| T5-C | 秘书 P5：#112 合入确认 + #103/#104 状态变化 + T5-A 审计分统一刷板；**从合流后 main 新拉分支** | 秘书 | §3 人工窗口执行后，且 T5-A/B 出结果 | `cursor/cc-loop-sec-p5-5b71` | 串行压后 |
| T5-D | 槽空滚动：M0-R4 综合分实算续跑（#106）或 PERF 六腿 kit（看板待派表原 P3） | 实现/文档 | 仅当 T5-A 未达触发条件且有空槽；可被 T5-A 抢占 | 沿用 #106 分支或新开 | 填空位，最低优先 |

VM 预算核对：峰值 = T5-A（0–1，条件触发）+ T5-B（0，软检不占 VM；重派才 1）+
T5-D（0–1，填空）≤2，T5-C 串行压后 → 守住 ≤3 硬护栏。逻辑队列 = X2 收口、Codex
收口、§3 人工合流窗口、T5-A、T5-C ≈ 5 项，带内（2–6），无积压。

---

*本文档为 CC-LOOP-ADVISOR-T4 Tick#4 交付物；登记看板不在本文更新，由秘书线单源维护。*
