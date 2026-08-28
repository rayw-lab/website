# CC-LOOP-ADVISOR-T2 Tick#2 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T2（model slug: `claude-fable-5-thinking-xhigh`）
- **时间**：2026-08-28 02:50 UTC（Tick#2）
- **基线**：main @ `88097f9`（MERGE-WAVE 8/8 收口）
- **纪律**：零 src/ 改动，本文档为唯一交付物；登记看板单源仍为
  `docs/research/cyber-city-score-loop-orchestration.md`，本文不重复登记分数。

---

## 1. 事实核查（fresh 取证，全部本 tick 实测）

| 对象 | 实测状态 | 取证方式 |
|------|---------|---------|
| main | `88097f9`（#101 X1B voice-pod 已合入） | `git log origin/main` |
| #104 X2 | draft，`mergeable=CONFLICTING`，头分支 `cursor/cc-vis-x2-facade-r2-1d6f`；门禁绿但为**旧 head 的 stale 绿** | `gh pr view 104` |
| #103 FXN-R7 | ready（非 draft），`MERGEABLE`，门禁绿；Codex 挂 **2×P1 + 1×P2** | `gh pr view 103` + `gh api pulls/103/comments` |
| #109 SEC-P3 | draft，`MERGEABLE`，门禁 IN_PROGRESS；仅动看板一个文件 | `gh pr view 109` |
| R1 顾问 | 分支 `cursor/cc-loop-advisor-r1-5b71` 相对 origin/main **0 commit ahead**，origin 无同名远程分支产出 | `git log origin/main..` 实测为空 |

### 1.1 #104 冲突面实测（merge-tree）

`git merge-tree` 实测冲突**仅 1 个文件**：`docs/spec/asset-ledger-cyber-city.md`
（X1B #101 与 X2 #104 各自追加了资产台账条目，"changed in both"）。

src/ 层零文本冲突：X1B 动的是 `src/lab/world/city/HeroBlenderMesh.ts` +
`src/data/cyber-city-buildings.json`；X2 动的是 `CityBlocks.ts / FacadeKit.ts /
ForegroundFraming.ts / StreetProps.ts / index.ts`，两组文件无交集。

### 1.2 #103 Codex 卡点原文要点

| 级别 | 卡点 | 落点文件 |
|------|------|---------|
| P1-1 | 看板同步：PR 把功能登记从 84 改到 87，但看板单源仍写 84 / +6 delta / C5–C6 in progress，后续 tick 按单源纪律会读到过期值 | `cyber-city-function-rubric-score.json` |
| P1-2 | L6 证据消失：审计文自己记录 R9 L6 产物（`fxn_r9_l6_quality2_20260828.webm` 及 dump）随旧 VM 丢失，但 §2.3 与分数登记仍引用它作为 L6 收口 + F5 提分依据 | `loop8-fxn-r7-audit.md` |
| P2 | F5 hint-recall 未实测：90 锚点要求五条人性化腿全过（含召回已关掉的 hint），R5 L3 写明 H recall「不适用、待 L6 重测」，新 L6 证据里无 hint-recall 动作 | `cyber-city-function-rubric-score.json` |

---

## 2. 本 tick 串并行裁决

**总裁决：P1 / P2 / P3 三路并行开工（文件域正交，见 §3），R1 不等待。**

### P1 — #104 X2 rebase（实现 Task，最高优先）

- 派实现子代理（`claude-fable-5-thinking-xhigh`）在原分支
  `cursor/cc-vis-x2-facade-r2-1d6f` 上 rebase → main@`88097f9`。
- **冲突解法预判**：仅 `docs/spec/asset-ledger-cyber-city.md` 一处，解法 =
  **union**（保留 X1B voice-pod 与 X2 facade-kit 两组台账条目，按台账既有排序规则排列）。
- **强制事项**：
  1. 旧 head 的门禁绿是 stale 绿，rebase 后必须重跑门禁 + 全量 e2e 52/52；
  2. 文本零冲突 ≠ 语义零冲突——X1B hero 实模与 X2 前景景框同属 city 运行时链路，
     rebase 后必做合流树冒烟（build + e2e + 固定机位帧对照）；
  3. 范围锁死为 rebase + 冒烟，禁止顺手调参扩批。

### P2 — #103 FXN-R7（裁决：**不天然合并，开定向补洞段**）

- 依 AGENTS.md §4.2/§4.3：有条件放行时禁止天然合并；卡门时开定向补洞、不降门、不硬闯。
- Codex P1-2（引用已消失的证据做登记依据）直接违反 fresh 取证纪律，P2（hint-recall
  未实测却按 90 锚点计分）动摇 F5 分数本身——**不是措辞问题，是证据链问题**，
  不能由父代理直改或秘书刷看板消化掉。
- **补洞段范围（只做 Codex 点名缺口，三件）**：
  1. L6 重取证：fresh 重跑 L6 quality2 场景，产物（webm/dump）以可持久方式登记
     （提交至 repo 证据目录或 green CI artifact + 登记来源，比照 LHCI 回填口径）；
  2. F5 hint-recall 实测：补 H 腿证据；过 → 87–88 成立；不过 → F5 落回下一锚点并重算；
  3. 看板同步行：补洞过门后由秘书把最终功能分刷上看板（见 P4 预排）。
- **PR 形态**：门控补洞属 PR 栈合法场景①，补洞分支 base = `cursor/cc-al-fxn-r7-1d6f`
  叠在 #103 上；合并顺序 #103 → 补洞 PR，由父代理按此顺序执行。

### P3 — #109 SEC-P3 merge（等 CI 绿即收）

- 仅动看板一个文件，刷新对象是 main@`88097f9` 的收口态——在该 SHA 下功能写 84
  是**正确的**（#103 尚未合入），与 Codex P1-1 不矛盾。
- 裁决：门禁转绿即 undraft + merge，不等 #103。#103 补洞过门后的功能分由下一轮
  秘书 P4 刷新，把看板 stale 窗口压缩到一个 tick 内。

### R1 — 等待策略

- 实测 0 产出（§1 表）。裁决：**主链路不再等待 R1**；在途 Task 不中止（照 AGENTS.md
  可跑完），但其交付降级为参考件，不作为任何段的放行依赖。超时 fallback 见 §5。

---

## 3. 文件域冲突检查：X2 vs #103（vs #109）

| PR | 文件域 | 与其他两路交集 |
|----|--------|--------------|
| #104 X2 | `docs/spec/asset-ledger-cyber-city.md`、`public/models/facade-kit/*`、`src/lab/world/city/*`、`tools/blender|camera/*` | 无 |
| #103 FXN-R7 | `docs/research/cyber-city-function-rubric-score.json`、`loop8-fxn-r5/r7-audit.md` | 无 |
| #109 SEC-P3 | `docs/research/cyber-city-score-loop-orchestration.md`（看板单源） | 无 |

**结论：三路文件域两两零交集，可并行。** 附加约束两条：

1. X2 与 #103 的并行安全性成立的前提是双方都不碰看板——看板只由秘书线（#109 / P4）写，
   本 tick 三路各自守域即无合并序依赖；
2. 唯一的语义耦合在 X2 与**已合入的** X1B 之间（同 city 场景链路），不在 X2 与 #103
   之间——该风险由 P1 的合流树冒烟覆盖，不构成并行阻塞。

---

## 4. Tick#3 预排（2–4 路，全部 `claude-fable-5-thinking-xhigh`）

| # | 任务 | 类型 | 分支 | 串并行 |
|---|------|------|------|--------|
| T3-A | X2 rebase 后段末审计：合流树冒烟复核 + 固定机位帧对照独立视觉评分 | 审计（零业务代码） | `cursor/cc-al-vis-x2-mid-5b71` | 与 T3-B 并行 |
| T3-B | FXN-R7 定向补洞：L6 fresh 重取证 + F5 hint-recall 实测（§2 P2 三件） | 实现/测试 | `cursor/cc-fxn-r7-plug-5b71`（base = `cursor/cc-al-fxn-r7-1d6f`，栈①） | 与 T3-A 并行 |
| T3-C | 秘书 P4：#109/#103/补洞合流后全量刷看板（功能分终值 + X2 状态行） | 秘书 | `cursor/cc-loop-sec-p4-5b71` | 串行，T3-A/B 收口后 |
| T3-D | （条件触发）ADVISOR-R2 重派：范围缩为 48h 战术方案，1 tick 交付 | 顾问 | `cursor/cc-loop-advisor-r2-5b71` | 仅当 §5 触发条件成立 |

预排口径：默认起 T3-A + T3-B 两路并行（满足最少 2 路），T3-C 压后串行；T3-D 按
触发条件决定是否加派，总数不超过 4 路，留并发余量给 X2 主线突发补洞。

---

## 5. 积压防堵：R1 超时 fallback（父代理默认路径）

**触发条件**：Tick#3 开始时 R1 仍满足「无 PR、分支相对 main 0 commit」→ 立即按
默认路径走，同时派 T3-D 重派（新顾问，不续旧 Task）。

**无 R1 文档时的父代理默认路径（按线）**：

| 线 | 默认路径 |
|----|---------|
| 视觉 | W2 既定顺序推进：X2 收口 → 下一栋实模；poster 重拍永远排批次最后（手册已知坑） |
| 功能 | #103 补洞过门后按审计终值登记收口，随后转 F5 hint-recall 之外的下一个审计点名缺口；无新缺口则功能线转维持 |
| 性能 | 维持登记 **—**，不催不代跑；解锁条件不变：真机 human-gate 六腿 → AL-PERF |
| 综合 | 以 `scripts/score-loop.mjs` 单源实算为准（#106 COMP-M0 WIP 继续走自己的节奏），`availableWeight===1` 前禁止登记 |
| 编排 | 每 tick 照常输出登记矩阵四行（北极星 98/98/90/85 vs 生产登记，以指挥官最新口径为准），不因 R1 缺席停更 |

**防堵原则**：顾问件（R1/R2）永远是增益件不是阻塞件——任何段的放行只依赖 §4.3
硬门（e2e 52/52、LHCI 不降、availableWeight===1、视觉双评、综合 ≥85），不依赖顾问文档。

---

## 6. 事故留痕（新增已知坑）：同 VM 双代理互踩 /workspace git 态

本 tick 实测发现（reflog 取证，02:51–02:54 UTC）：X2 rebase 实现子代理与本顾问
共用同一台 VM 的 `/workspace` 检出。时序：X2 代理 02:53:02 在 `/workspace` 完成
`cursor/cc-vis-x2-facade-r2-1d6f` 的 rebase（tip `037bd1d`）；本顾问 02:53:19 的
`checkout -b` 把 `/workspace` HEAD 切到 t2 分支；X2 代理 02:53:49 的第二次 rebase
随即作用在**顾问分支**上，给 `cursor/cc-loop-advisor-t2-5b71` 本地 ref 错误叠上
4 个 X2 实现 commit。

**处置**：本顾问改用隔离 worktree（detached HEAD @ origin/main）产出并直接
push 到远程分支 ref，被污染的本地 ref 未推送；X2 代理自己的分支（`037bd1d`）未受影响。

**给手册的坑条目建议**：同 VM 并行 Task 严禁共用 `/workspace` 检出——各自
`git worktree add` 独立目录，或编排时保证每路 Task 独占 VM；父代理派单时在任务书
写明工作目录约定。X2 代理收口前应自查其分支 tip 是否为 `037bd1d` 系（含 kickoff
清理后的正确栈），防止误推。

---

*本文档为 CC-LOOP-ADVISOR-T2 Tick#2 交付物，登记看板不在本文更新，由秘书线单源维护。*
