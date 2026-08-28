# CC-LOOP-ADVISOR-T3 Tick#3 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T3（model slug: `claude-fable-5-thinking-xhigh`）
- **时间**：2026-08-28 03:05 UTC（Tick#3）
- **基线**：main @ `88097f9`（与 Tick#2 相同，无新合入）
- **纪律**：零 src/ 改动，本文档为唯一交付物；本顾问产出于独立 worktree
  `/tmp/t3-wt`（分支 base = origin/main），未触碰 `/workspace` 共享检出。
  登记看板单源仍为 `docs/research/cyber-city-score-loop-orchestration.md`，本文不重复登记分数。

---

## 0. 事实核查（fresh 取证，全部本 tick 实测）

| 对象 | 实测状态 | 与 Tick#2 简报的差异 | 取证方式 |
|------|---------|---------------------|---------|
| main | `88097f9`，无新合入 | 无 | `git log origin/main` |
| #104 X2 | draft，`MERGEABLE`，tip `c24c7f3`；**rebase 已完成**（7 commit 干净叠在 main@`88097f9` 上，`git log origin/main..` 实测无 merge-base 漂移）；门禁在现 tip 上 **SUCCESS**（run 完成于 02:55:52 UTC） | 简报称「CI 可能重跑中」——实测**已重跑且绿**，非 stale 绿 | `gh pr view 104` + `gh run list --branch` + `git log origin/main..origin/cursor/cc-vis-x2-facade-r2-1d6f` |
| X2 代理 | RUNNING（父代理简报口径）；tip commit = 「R4 kickoff 收口接管：全量 e2e + exact-port LHCI + VIS-01/02 显式基线重签 + poster/ritual_idle 恒等 + 端口/chunk hash」→ 正处**收口自检段**，tip 仍可能推进 | — | commit message 实读 |
| #103 FXN-R7 | ready（非 draft），`MERGEABLE`，门禁绿，tip 仍 `c4e844c`（无新 push）；Codex 2×P1 + 1×P2 卡点后无新评论（最后一条 02:18 UTC）；补洞分支 `cursor/cc-fxn-r7-plug-*` **远程尚未出现** | 无变化 | `gh pr view 103` + `gh api pulls/103/comments` + `git ls-remote` |
| #109 SEC-P3 | draft，`MERGEABLE`，门禁 **SUCCESS** | CI 由 IN_PROGRESS 转绿 | `gh pr view 109` |
| #110 R1 / #111 T2 | 均 draft + MERGEABLE；#110 门禁绿，#111 门禁 IN_PROGRESS | — | `gh pr view` |
| worktree 隔离 | `git worktree list` 实测 5 个独立检出：`/tmp/x2-wt`（X2 @ `c24c7f3`）、`/tmp/wt-fxn-r7-codex`（Codex @ `c4e844c`）、`/tmp/advisor-wt`（R1）、`/tmp/t2-wt`（T2, detached）、本顾问新增 `/tmp/t3-wt` | 事故后各路已迁独立 worktree | `git worktree list` + reflog |

---

## 1. 本 tick 是否加开新实现路：**否**（维持默认）

四条理由，任一条独立成立：

1. **VM 硬护栏已满**：async VM ≤3 在飞，当前 = X2 实现代理（RUNNING）+ Codex #103
   代理（RUNNING）+ 本顾问 Task = **3/3**。本顾问收口前无空槽；收口后空出的槽
   应留给 §3 的 T4-A（X2 段末审计），不给新实现路。
2. **视觉线单 PR 纪律**：X2 正处 R4 收口自检（全量 e2e 墙钟 ~17–23 min + LHCI +
   基线重签），提分批次永远单 PR（AGENTS.md §4.2）——归因依赖固定机位前后帧对照，
   旁开第二条视觉实现路会直接破坏归因链。
3. **功能线门控串行**：#103 属「有条件放行、禁天然合并」（T2 裁决），补洞段是
   门控链，严格串行；Codex 在途未 push，此时旁开第二功能路 = 硬闯门。
4. **下游动作全部依赖静止 tip**：T4-A 审计、秘书 P4 刷板都要求 X2/Codex 先 IDLE
   且 tip 静止。提前开路只制造积压，不产生放行进度。

**本 tick 唯一可立即推进的动作不占 VM**：指挥官合入 #109（见 §3.2）。

---

## 2. Tick#3 秘书看板更新要点

#109 本身就是秘书 P3 的看板刷新（对象 = main@`88097f9` 收口态），**先合 #109 再谈
增量**；以下要点供 #109 合入后的下一次秘书刷新（P4）或指挥官口头同步使用：

1. **X2 状态行升级**：`CONFLICTING → MERGEABLE 已解除`；rebase 至 main@`88097f9`
   完成，门禁在 `c24c7f3` 绿（02:55 UTC，fresh 非 stale）；当前处 R4 收口自检，
   代理 RUNNING，**tip 未静止，禁止在移动 tip 上开审计**。
2. **#103 状态行**：ready + 门禁绿，但裁决口径 = 禁天然合并；补洞（L6 fresh 重取证 +
   F5 hint-recall 实测）在途、远程尚无补洞分支；看板功能分**维持 84**（main 口径），
   87–88 只是候选值、待补洞过门，禁止提前上板。
3. **顾问链**：#110 R1、#111 T2 已交付（#111 门禁转绿后待指挥官收）、本文 T3；
   顾问件均为增益件非阻塞件，不进任何段的放行依赖。
4. **事故条目收尾**：/workspace 共享检出事故**已缓解**（详见 §4），残留 =
   `/workspace` 本地 ref `cursor/cc-loop-advisor-t2-5b71` 污染态（叠有 X2 实现
   commit，本地 `b85bf85` ≠ 远程 `7d5827b`），标记**禁止从 /workspace 推送该分支**。
5. **登记矩阵四行照常**：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**
   （综合/视觉/功能/性能）；性能显式写 **—**，解锁条件不变（真机 human-gate 六腿 →
   AL-PERF）。本 tick 无任何登记分变化（无新合入）。

---

## 3. Tick#4 预排（全部 `claude-fable-5-thinking-xhigh`，峰值 ≤3 VM）

### 3.1 任务表

| # | 任务 | 类型 | 触发条件 | 分支 | 串并行 |
|---|------|------|---------|------|--------|
| T4-A | X2 段末视觉审计：合流树冒烟复核 + 固定机位帧对照独立视觉评分（帧优先协议，rubric 单源） | 审计（零业务代码） | X2 代理 IDLE **且** tip 静止 ≥1 tick **且** 门禁绿 | `cursor/cc-al-vis-x2-mid-5b71` | 与 T4-B 并行（文件域零交集） |
| T4-B | Codex 补洞跟进：若 Tick#4 时仍无 push → 先查僵死（比照 AL-VEH-R3 #102 抢救先例）；僵死则按 T2 §2 P2 三件范围**重派**补洞 Task，不降门 | 实现/测试 | Tick#4 时 `cursor/cc-fxn-r7-plug-*` 仍不存在且 #103 tip 仍 `c4e844c` | `cursor/cc-fxn-r7-plug-5b71`（base = `cursor/cc-al-fxn-r7-1d6f`，栈①） | 与 T4-A 并行 |
| T4-C | 秘书 P4：X2 审计分 + 功能终值 + #109 合入确认统一刷板 | 秘书 | T4-A/B 出结果后 | `cursor/cc-loop-sec-p4-5b71` | 串行压后 |

### 3.2 #109 合入时机：**本 tick 即合，不等 Tick#4**

- 硬条件已齐：CI SUCCESS + MERGEABLE + 单文件（看板单源）+ 文件域与 X2/Codex
  两路零交集（域纪律：实现/审计路不碰看板）。
- 越早合入，看板 stale 窗口越短；#109 刷的是 main@`88097f9` 收口态，在该 SHA 下
  功能写 84 是正确口径，与 Codex P1-1 不矛盾（T2 §2 P3 已裁决，本 tick 维持）。
- 操作：指挥官 undraft + merge（父代理禁擅自 merge，此为人工动作，不占 VM）。
- 顺带项：#110、#111（顾问件）也已 MERGEABLE（#111 等门禁绿），指挥官可在同一批
  人工窗口收掉，减少 open-PR 存量；顾问件合入顺序无依赖，任意序皆可。

### 3.3 X2 ready 后的视觉审计口径（预写给 T4-A 任务书）

- **入场检查**：tip 静止（对比本文登记的 `c24c7f3`，若已推进则以新 tip 为准并确认
  代理 IDLE）；门禁绿为 fresh（run 时间戳 > tip push 时间戳）。
- **审计内容**：① 合流树冒烟（虽然 rebase 后 base=main，仍按「文本零冲突 ≠ 语义
  零冲突」跑 build + 全量 e2e 52/52 复核）；② 固定机位帧对照（X1B 合流前后 +
  X2 开关前后），独立视觉打分走 `cyber-city-visual-rubric.md` 帧优先协议；
  ③ 双评 |Δ|≤5 检验 X2 自评（历史偏乐观 ~2 分）。
- **产物**：审计报告 + 登记 JSON，零业务代码；poster 若需重拍，排批次最后（已知坑）。
- **若 X2 自检失败继续推 commit**：T4-A 顺延一个 tick，绝不在移动 tip 上开审。

### 3.4 VM 预算核对

峰值 = T4-A（1）+ T4-B（0 或 1，条件触发）+ T4-C（1，串行压后不与前两者同飞）
→ 任意时点 ≤2–3，守住 ≤3 硬护栏；逻辑队列 = X2 收口、Codex 补洞、T4-A、T4-C、
#109/#110/#111 人工收口 ≈ 5 项，在 2–6 带内。

---

## 4. 积压 / 共享 workspace 事故：**已缓解，留一条残余风险**

### 4.1 缓解证据（实测）

1. **worktree 隔离已成惯例**：`git worktree list` 显示 X2（`/tmp/x2-wt`）、Codex
   （`/tmp/wt-fxn-r7-codex`）、R1（`/tmp/advisor-wt`）、T2（`/tmp/t2-wt`）、T3
   （`/tmp/t3-wt`，本顾问）各占独立目录，HEAD 互不干扰。
2. **事故后无复发**：`/workspace` reflog 自 02:53:49（T2 §6 记录的互踩终点）后
   **无任何新的跨代理操作**；X2 事故后已从 `/tmp/x2-wt` 正常推进（rebase 后又推
   `f998c2b`/`d8b871b`/`c24c7f3` 三个 commit）且门禁绿——工作流恢复健康。
3. **污染未外泄**：被误叠 X2 commit 的本地 ref `cursor/cc-loop-advisor-t2-5b71`
   （`b85bf85`）从未推送，远程 #111 tip 为干净的 `7d5827b`（出自 `/tmp/t2-wt`
   detached 检出）。

### 4.2 残余风险与处置建议

- **风险**：`/workspace` 本地仍挂在污染 ref 上。任何后续代理若在 `/workspace`
  直接 `git push`，会把 4 个 X2 实现 commit 错误推上 T2 顾问分支，污染 #111。
- **处置**（父代理派单纪律，二选一，均为低优先 housekeeping）：
  1. 下一个需要占用 `/workspace` 的维护动作顺手执行
     `git checkout main && git branch -f cursor/cc-loop-advisor-t2-5b71 origin/cursor/cc-loop-advisor-t2-5b71`；
  2. 或维持现状但在任务书模板固化两条：**新 Task 一律 `git worktree add` 独立目录**
     + **禁止从 `/workspace` push 任何 `-5b71` 顾问分支**。
- 本顾问依零改动纪律不动共享检出，仅留痕。

### 4.3 积压核对

当前逻辑队列 = X2 收口（在飞）、Codex 补洞（在飞）、#109 待人工合入、T3 顾问
（本件，即刻收口）→ 4 项，带内（2–6）；无任务积压，无 tick 债务。唯一「等待态」
是 #109/#110/#111 的人工合入窗口，属指挥官动作，不计入 VM 占用。

---

*本文档为 CC-LOOP-ADVISOR-T3 Tick#3 交付物，登记看板不在本文更新，由秘书线单源维护。*
