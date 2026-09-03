---
document: cc-loop-score-roadmap-2026-09-02
status: LOCAL_DRAFT_GUIDANCE（本地起草，未提交、未 push、未建 PR）
repository: rayw-lab/website
live_main_at_draft: c585df92421135c957219be636be34604eaa4120（#214 merge）
candidate: PR #104 @ 598764172250f3a0d6e5a29c36aa564dbd44e009（OPEN / Draft / HOLD_DRAFT）
inputs:
  - cyber-city-loop-audit-pr104-readonly-package.zip（审计 A：裁决书 + 看板纠偏草稿 + R2 证据复核）
  - cc-loop-audit-pr104-package-20260901.zip（审计 B：裁决书 + 证据档 + 看板 delta + LHCI artifact 复算）
  - 本仓库 live 字节（看板、handoff、R2 evidence、score-loop.mjs、#104 分支 e2e 源码）
production_matrix: 综合 80 / 视觉 73 / 功能 87 / 性能 —
north_star: 98 / 98 / 90 / 85
date: 2026-09-02
---

# 提分 Loop 后续实施路径｜从 #104 R2 NO_GO 到「OK 节点」

> **本文性质**：后续执行指引，不是裁决、不是看板、不是 handoff 正本。唯一权威单源仍是 `docs/research/cyber-city-score-loop-orchestration.md`。本文所有"应做"均需经既有门禁（Controller 授权 / 站立授权 / 董事会急裁 / 指挥官专属）后执行。

---

## 0. 三十秒读法

| 问题 | 回答 |
|---|---|
| 现在卡在哪 | #104 R2 正式窗 `72P / 1F / 13 未运行 / exit 1`，唯一失败 `CITY-OBS-01` leg2 `(28,-28)` 未达；fail-stop 截断了 PERF / VIS / 权重 / 综合分整条证据链 |
| 两份审计一致结论 | `NO_GO / HOLD_DRAFT`；下一步是 **`CITY-OBS-01 + CITY-PERF-02` 定向归因与最小补洞**，**不是直接 R3**；看板需顶部追加纠偏；不得登记视觉分或综合分 |
| 审计之后新发生的事 | **#214 已于 15:50:35Z 按原样合入 `c585df9`**（仅新增 handoff，未改看板）。审计预警的"看板顶部仍写阶段停止 / handoff 写已授权继续"双单源冲突 **现已成为 live main 事实**，必须首先纠偏 |
| 我认为的 OK 节点 | **OK-1（工程闭环）**：#104 R3 全量 86/86 exit 0 → evidence 上链 → Ready/合入。**OK-2（登记提分）**：AL-VIS 双评 `\|Δ\|≤5` 登记视觉 ≥78；`score-loop` 五维齐套 `availableWeight=1.0 / missing=[]`，综合 ≥85 登记。功能 87 维持；性能行维持 `—`（真机六腿为指挥官专属，不在本路径内） |
| 不追什么 | 不在本路径追 98 / 98 / 90 / 85；不追性能登记；不做 CAM 视角旋转、真机六腿、Android S-2 |

---

## 1. 现状综合判读（两份审计 × live 字节）

### 1.1 两份审计的重合面（可直接采信）

| 结论 | 审计 A | 审计 B | live 复核 |
|---|---|---|---|
| #104 `NO_GO / HOLD_DRAFT` | ✅ | ✅ | #104 仍 OPEN / Draft，head `5987641` 未变 |
| R2 = 72P / 1F / 13 未运行 / 0 flaky / workers=1 / retries=0 / exit 1 | ✅ | ✅ | `docs/research/cc-vis-x2-full-r2-evidence/` 在 main，SHA 齐 |
| 唯一失败 `CITY-OBS-01` leg2；终态 `(1.3,-2.1)`；断言 `spec.ts:412` | ✅ | ✅ | #104 分支源码核对一致 |
| 终态接近出生点 = **respawn 后终态的高概率解释**，不是已证撞点 | ✅ | ✅ | `driveTo`：12s 无进展 → 2 次倒车 → `R` 重生 → `escapes=0` 循环；重生后**不重放 leg1**，从原点直追 `(28,-28)` |
| exact-head CI `33514114971` SUCCESS ≠ E2E 通过 | ✅ | ✅ | CI 仅 check/build/links/budget/LHCI |
| LHCI 四项 ≥95 只是阈值门；缺"上轮原始值 vs 本轮原始值"不回退收据 | ✅（P1-2） | ✅（复算 21 份 LHR 中位数全 100） | 审计 B 包内含 artifact `9803026775` 原件（6.9MB） |
| `e2e-summary.json` 把文件数 19 写成 `totalTests` | ✅ | — | 应追加勘误，不改原字节 |
| 镜像算分 91.74 是**失败趟诊断分**，不可发布 | — | ✅ | `score-loop.mjs` 分母 = passed+failed，未运行不计；smoke3d 缺 → `availableWeight=0.85` |
| #213 在 `DO_NOT_MERGE` 评论后约 14s 被合入；需顶部追加纠偏而非回写 | ✅ | ✅ | `8d6efb0` 在 main |
| #214 不得以 handoff 取代看板；`APPROVED_FOR_SQUASH` 不得自封为全局制度 | ✅ | ✅ | **#214 已原样合入**（见 1.2） |
| 候选落后 main，必须吸收后重开资格窗 | ✅ | ✅（落后 5 → 现落后 6） | merge-base `939056d` |
| 视觉 73 为旧登记，X2 无独立双评 | ✅ | ✅ | `cyber-city-visual-rubric-score.json` 仍为 `dc3f56b` 时代 73 |
| main 无 branch protection | ✅ | ✅ | 治理风险持续 |

### 1.2 审计收口后的增量事实（本文新增）

1. **#214 已合入 `c585df9`（2026-09-01T15:50:35Z）**，diff 仅 `+202` 新增 `cc-loop-handoff-2026-09-01-2340-r2-controller-correction.md`。看板 `cyber-city-score-loop-orchestration.md` 顶部块仍是 #213 的「⑨ 阶段停止 / 没有第三跑 / 只有指挥官另行重启」。**双单源冲突已落地**，且 handoff §7 的 `APPROVED_FOR_SQUASH` 全局硬门也随之进入 main（未经指挥官决策）。
2. **cleanup debt 可部分闭合**：`/private/tmp/x2-104-full-r2` worktree 目录已不存在，`git worktree list` 仅剩主工作树；但 `/private/tmp/x2-104-full-r2-*`（formal-run.zsh / full.log / host-monitor.log / vacuum.py / evidence 副本）与 `agy-*` / `ark-*` 任务包仍在。需正式收据后清理。
3. **Node 版本**：CI 钉 Node 22；R1 用 Node 25.9.0、R2 用 Node 22.23.0。后续所有本地窗必须 Node 22 + pnpm 10.33.3，消除混杂变量。
4. **fail-stop 结构**：`CITY-OBS-01` 所在 describe 为 `mode: 'serial'`，且 project 依赖链 `world-chromium → world-perf → city-perf → visual`。一例红即截断 13 例。此为设计约束（`playwright.config.ts` 冻结），路径中不改，但要求 R3 前定向门必须"真绿"。

### 1.3 根因当前可信分类（引自审计，尚未定谳）

> 路径规划 × 测试控制器恢复逻辑 × 终点触发圈 × 静态碰撞体之间存在确定性交互缺陷。产品 collider 缺陷 / 测试控制器缺陷 / 混合原因，需**真实逐拍轨迹 + collider AABB 枚举**定谳。

待验证假说（供 Lane 2/3 使用，禁止未取证即改）：

| # | 假说 | 若成立的证据形态 | 若成立的最小修法归属 |
|---|---|---|---|
| H1 | leg2 某处楔死 → 2 次倒车无效 → `R` 重生 → 从原点直追 `(28,-28)` 再次进入障碍邻域 → 循环直至 360s 耗尽 | 轨迹出现 ≥1 次 respawn；respawn 后 bearing 直指 (28,-28)；首次楔死点重复 | 测试侧：恢复后重放完整 waypoint 链（leg1→leg2），或改 `R` 为"回到上一已达 waypoint" |
| H2 | respawn 落点不是原点而是"最近路口"，`driveTo` 以原点假设继续，yaw/位置错配导致原地打转 | 轨迹 respawn 后 speed>0 但 dist 不降；yaw 抖振 | 测试侧：respawn 后重新读 state 并重算 bearing（现已读，但需核对 yaw 约定） |
| H3 | 停车位中心 `(28,-28)` 与 radius 4.5 触发圈被楼体裙房 / 道具簇挡住可达入口 | Minkowski clearance（车辆外接半径）在入圈路径上 <0 | 测试侧：改瞄"安全入圈点"（几何算出，位于 r6 内）；**若必须动几何 → 升级任务书** |
| H4 | 产品碰撞体（X2 立面 / 前景景框 / StreetProps）在 #104 新增几何上与路带重叠 | AABB 枚举显示 collider 压在 leg2 走廊内 | **产品侧**：立即停手升级，禁止测试绕行 |

---

## 2. 「OK 节点」定义与验收数字

### OK-1｜工程闭环（#104 落地）

| 项 | 验收 |
|---|---|
| 定向门 | `CITY-OBS-01 + CITY-PERF-02` 单 attempt、workers=1、retries=0、全绿；根因报告可复核 |
| 候选新鲜度 | #104 吸收 current main（≥ `c585df9`）；exact final-head CI SUCCESS |
| R3 full gate | 新具名、新端口、fresh `--list` 分母（当前 86 / 19）、单 attempt、`0 failed / 0 skipped / 0 flaky / exit 0` |
| evidence | docs-only PR 先合 main；hash 索引齐；`e2e-summary.json` schema 正确（`totalTests` = 测试数，`totalFiles` = 文件数） |
| 合流 | evidence 合入后再同步 #104 → CI 再绿 → Controller 显式放行 → Ready → squash |

### OK-2｜登记提分（矩阵变动）

| 维度 | 现登记 | OK-2 目标 | 依据 |
|---|---|---|---|
| 视觉 | 73 | **≥78**（双评 `\|Δ\|≤5`） | 看板在途栏"顾问路径 →~78"；rubric v1.1 §4 双评规程；rubric JSON `target: 85` 为下一阶段 |
| 综合 | 80 | **≥85**，且 `availableWeight=1.0 / missing=[]` | `score-loop.mjs` 五维齐套；`--min 85` 退出 0 |
| 功能 | 87 | 87（不动） | 90 需真机 S-2，指挥官专属 |
| 性能 | — | —（不动） | 真机六腿 → AL-PERF，指挥官专属 |

综合分可达性预估（OK-1 达成后）：LHCI root/home 各 100（R2 CI 已实测），E2E 100（86/86），smoke3d 100（VIS-02/03/04 全过），视觉 78 → `0.25×100 + 0.15×100 + 0.2×100 + 0.25×78 + 0.15×100 = 94.5`。即使视觉维持 73 也是 93.25。**综合 ≥85 的瓶颈不在分数，在资格**（exit 0 + 满权重 + 独立双评）。

### OK-3｜可选延伸（本路径不承诺）

视觉 78 → 85：按 rubric 最低两维补——`v1FirstFrame 68`（poster 未重拍、definitive shot 缺）与 `v3PaletteAtmosphere 70`（多色族并置、色相纪律）。需新工程 PR + 新 AL-VIS 轮，走完整 Loop，不与 #104 混做。

---

## 3. 阶段路线（严格串行的主干）

```mermaid
graph TD
    P0[P0 看板顶部纠偏<br/>docs-only · 消除双单源] --> P1[P1 定向归因<br/>轨迹记录 + 复现 + AABB 复核]
    P1 --> D{根因分类}
    D -->|测试控制器/路线| P2a[P2a 最小补洞<br/>仅授权 e2e 文件]
    D -->|产品 collider| STOP[停手 · 升级任务书<br/>董事会急裁]
    D -->|混合| P2b[P2b 分别最小修复]
    P2a --> P3[P3 定向门<br/>OBS-01 + PERF-02 单 attempt 全绿]
    P2b --> P3
    P3 --> P4[P4 吸收 main + exact-head CI<br/>+ cleanup debt 闭合收据]
    P4 --> AUTH{Controller 具名授权 R3}
    AUTH --> P5[P5 R3 full gate<br/>86/86 · 0F 0S 0flaky · exit 0]
    P5 -->|任一红| NOGO[NO_GO · 回 P1]
    P5 -->|全绿| P6[P6 evidence docs-only PR 先合]
    P6 --> P7[P7 同步 main → CI → 放行 → Ready → squash<br/>= OK-1]
    P7 --> P8[P8 AL-VIS 固定机位双评<br/>Δ≤5 → 登记视觉]
    P8 --> P9[P9 score-loop 五维<br/>weight=1 missing=[] ≥85 → 登记综合<br/>= OK-2]
```

### P0｜看板顶部纠偏（docs-only，立即可做）

- **目标**：在 `cyber-city-score-loop-orchestration.md` 顶部纯新增 `SEC-R11-CORR-1` 块，supersede #213 "阶段停止 / 无 R3"运行态；登记 MERGE-WAVE 21（#213、#214）。
- **文本来源**：审计 A `cc-score-loop-board-delta-pr-104-r2.md` 与审计 B `cc-loop-board-sec-r11-delta.md` 已给出草稿，需合并为一块并更新为 live main `c585df9`、补 #214 合入事实。
- **必须写明**：#104 仍 NO_GO/HOLD_DRAFT；下一动作 = OBS-01 + PERF-02 定向；R3 当前未授权（非永久停止）；cleanup debt 状态（worktree 已释放待收据、任务包未清）；瞬时磁盘数不作控制依据；矩阵不变；**handoff（#214）降级为补充执行交接，不是权威**；**`APPROVED_FOR_SQUASH` 全局制度 = 建议，待指挥官决策**。
- **硬约束**：去掉新增前缀后，历史 suffix 与 `main@c585df9` 字节级一致（SHA-256 校验）；不改 #213 / #214 任何历史字节。
- **合流**：站立授权 docs 直合仍有效，但鉴于 #213/#214 两次抢合，本单建议自律执行"exact head SHA + Controller 明示评论"后再合（作为本单具名门，不上升为制度）。

### P1｜定向归因（只读 + 诊断脚本，不改产品）

- **锚点**：在 `/private/tmp/<新名>` worktree checkout **R2 exact head `5987641`** 复现（不可用合过 main 的新 SHA 冒充）。
- **环境**：Node 22.23.0 + pnpm 10.33.3；新端口（禁 4321 / 4585 / 4587）；Python socket bind 正证据；preflight vacuum=0；`--workers=1 --retries=0`；单 attempt。
- **必取字段**（每拍）：`t / x / z / yaw / speedKmh / targetDist / steering / throttle / interval / bestDist / noProgress 触发 / escape# / 倒车前后坐标 / R 前坐标 / respawn 后坐标`。
- **实现方式**：仅在 `e2e/cyber-city-observability.spec.ts` 的 `driveTo` 内加轨迹采集（写 `testInfo.attach` 或 `test-results/`），**不改控制参数**。诊断分支仅本地，不进 #104。
- **对照**：现行直瞄 `(28,-28)` vs 几何计算的"安全入圈点"（位于 r6 内、远离楼体基座、Minkowski clearance ≥ 车辆外接半径 + 余量）。
- **同源**：`CITY-PERF-02` 复用同一 leg1→leg2 路线，须同轮取证。
- **产出**：`docs/research/cc-vis-x2-obs-r2-diagnosis.md`（轨迹表、首次失速/碰撞位置、AABB 枚举、假说 H1–H4 逐条证据等级、根因分类结论）。

### P2｜最小补洞

- **默认 writable**：`e2e/cyber-city-observability.spec.ts`、`e2e/cyber-city-perf.spec.ts`、诊断报告。
- **默认冻结**：`src/**`、`public/**`、视觉基线、`playwright.config.ts`、全局 timeout、retry/repeat/skip、parkingBay radius 与业务触发语义。
- **禁止修法**：提高 timeout；放宽 radius；soft assertion；`test.skip`；改视觉基线；只跑失败例到一次绿即放行。
- **若 H4 成立**：立即停手，升级任务书（含 src 的 PR 须董事会急裁）；只有轨迹与 AABB 证据明确指向产品几何才可扩到 `StreetProps.ts` / `ForegroundFraming.ts`。

### P3｜定向门

- `CITY-OBS-01` + `CITY-PERF-02` 单 attempt、workers=1、retries=0、全绿；`pnpm install --frozen-lockfile` / `astro check` / `build` 成功；fresh `--list` 分母以实数为准。
- 记录为 docs-only 证据（不上链 trace 二进制；但措辞须区分"Playwright 自动生成了 trace"与"是否上链"）。

### P4｜吸收 main + CI + cleanup

- #104 merge current main（≥ `c585df9`），确认最终 diff 仍严格落在授权文件域；exact final-head CI SUCCESS。
- **cleanup debt 闭合收据**：`git worktree list` 输出；`/private/tmp` 中 `x2-104-full-r2-*`、`agy-x2-104-*`、`ark-x2-104-*` 清理前后 `ls` 字节；端口探针；进程 vacuum=0。
- 此后 Controller 才可另行**具名**授权 R3。

### P5｜R3 full gate

- 新具名（不得把 R1/R2 重命名）、新端口、单 attempt、workers=1、retries=0、fresh denominator 全执行；`0 failed / 0 skipped / 0 flaky / RUN_EXIT=0 / FORMAL_SCRIPT_EXIT=0`；host monitor 连续采样（外部 headless 按最新指令仅 informational，但须如实登记、不得写"干净"）。
- 任一红 = NO_GO，回 P1，不重跑。

### P6｜evidence 上链

- docs-only PR：`docs/research/cc-vis-x2-full-r3-evidence/`，含 `SHA256SUMS`、`run-receipt.md`、`e2e-results.json`、`e2e-summary.json`（**正确 schema**）、`list.log`、host monitor、pre/postflight 四件、tracked PNG restore 清单。
- **LHCI 不回退收据**：附"上轮原始四项（artifact `9803026775`，7 URL 中位数全 100）vs 本轮原始四项 / 逐项 Δ / artifact ID"表；不得只写"≥95 通过"。

### P7｜合流 = OK-1

- evidence 合入 main → #104 再同步 main → CI 再绿 → Controller 显式放行 → Draft→Ready → squash。看板顶部追加合流块与 MERGE-WAVE 续表。

### P8｜AL-VIS 固定机位双评

- 对象：合入后的 main exact SHA；按 rubric v1.1 §4 取证协议（fresh worktree build + 隔离 preview；F1 robot_idle 首幕帧、F2 `?poi=` settled 帧、1440×900、`visibilitychange(hidden)` 暂停后截帧；chunk hash 与 dist 逐一核对防串台）。
- 两名独立评审（不同模型/会话）各出 7 维分；`|Δ总分|≤5` 通过，否则逐维复议。
- 登记：更新 `cyber-city-visual-rubric-score.json`（subject / delta / evidence 全写）；看板视觉行 73 → 新分。**只登审计独立分，实现方自评永不登记。**

### P9｜score-loop 五维 = OK-2

- 输入：R3 `e2e-results.json`（86/86，含 `@smoke3d` VIS-02/03/04 实跑）、合入后 main 的 LHCI `lhr-*.json`（`.lighthouseci/`）、P8 新视觉 JSON。
- 执行 `node scripts/score-loop.mjs --min 85`；要求输出 `availableWeight: 1`、`missing: []`、exit 0；`test-results/quality-score.json` 作为 docs-only 收据上链。
- 看板综合行 80 → 新分（登记块附命令、输入 SHA、输出 JSON）。

---

## 4. 并行车道（供 Composer 2.5 原生 1–4 路派单）

> 本会话未挂载子代理派单工具，以下为**可直接复制的任务书骨架**。四路可同时起，依赖关系见 §4.5。所有车道：**零 GitHub 写操作默认关闭**，除 Lane 1 的 docs-only PR 外一律本地产出；禁止触碰 `src/**`、`public/**`、视觉基线、`playwright.config.ts`。

### Lane 1｜看板纠偏单（docs-only）

- **目标**：完成 §3 P0。
- **输入**：审计 A `cc-score-loop-board-delta-pr-104-r2.md`、审计 B `cc-loop-board-sec-r11-delta.md`、live `c585df9` 看板与 handoff。
- **writable**：`docs/research/cyber-city-score-loop-orchestration.md`（仅顶部新增）。
- **产出**：分支 `codex/sec-r11-corr-1-<date>`；PR body 含"历史 suffix SHA-256 一致"校验命令与结果。
- **验收清单**：审计 A「应用前硬检查」13 项逐条打勾；额外 3 项——#214 合入事实入表、handoff 降级声明、`APPROVED_FOR_SQUASH` 降级为建议。
- **禁止**：改 #213/#214 字节；写"CI SUCCESS = E2E 通过"；写 R3 已授权；登记任何分数。

### Lane 2｜OBS/PERF 定向归因（诊断执行）

- **目标**：完成 §3 P1，产出 `cc-vis-x2-obs-r2-diagnosis.md` 草稿 + 轨迹 CSV/JSON。
- **前置**：Node 22 / pnpm 10.33.3；新 worktree checkout `5987641`；新端口 bind 正证据；vacuum=0。
- **writable**：诊断 worktree 内 `e2e/cyber-city-observability.spec.ts`（仅加采集，不改参数）、`e2e/cyber-city-perf.spec.ts`（同源同步）、本地报告。
- **必答**：H1–H4 逐条证据等级（PROVEN / DISPROVEN / NOT PROVEN）；首次失速坐标；respawn 次数与落点；现行目标点 vs 安全入圈点的 clearance 对比表。
- **禁止**：改 timeout/radius；跑全量；把诊断分支 push 到 #104。

### Lane 3｜独立几何复核（只读，与 Lane 2 双盲）

- **目标**：不依赖 Lane 2 结论，从源码静态枚举 leg2 走廊的全部 fixed collider AABB（bridge leg、充电桩带、autodrive-lab 楼体基座、街角道具簇、SpeedTrap 隔板）与 parkingBay radius，计算车辆最坏外接半径下的 Minkowski clearance。
- **输入**：#104 分支 `src/lab/world/city/*.ts`、`tools/camera/audit-x2-visibility.mjs`（注意：该脚本只算选定障碍到理想线段的静态净距，**不是可达性证明**）。
- **产出**：`cc-vis-x2-collider-aabb-<date>.md`（表 + 推荐安全入圈点候选 ≥2 个及其 clearance）。
- **与 Lane 2 汇合**：两份独立结论对表后才允许写根因分类；不一致时以真实轨迹为准、几何为辅。

### Lane 4｜证据卫生 + 收据补齐（docs-only 准备）

- **目标**：为 P4/P6 预置模板与勘误。
- **任务**：① `e2e-summary.json` 勘误说明（追加文件，不改原字节，写明 `totalTests: 86 / totalFiles: 19`）；② LHCI 不回退收据模板（以 artifact `9803026775` 7 URL × 4 类中位数为"上轮原始值"列）；③ cleanup debt 收据脚本（`git worktree list`、`/private/tmp` 清单、端口探针、vacuum）与清理前后字节留档；④ R3 evidence 目录骨架与 `SHA256SUMS` 生成脚本；⑤ 校对 R1 evidence 中"未生成 trace"措辞（JSON 列有 `trace.zip` attachment）。
- **产出**：本地目录 `docs/research/cc-vis-x2-r3-prep/`（不提交），待 P6 时合并。

### 4.5 依赖与汇合

```text
Lane 1 ──────────────────────────────► P0 合入（独立，最先完成）
Lane 2 ──┐
         ├─► 对表 → 根因分类 → P2 决策（测试侧 / 产品侧 / 混合）
Lane 3 ──┘
Lane 4 ──────────────────────────────► P4 / P6 时消费
```

派单顺序建议：Lane 1 与 Lane 3 先起（纯读 + docs），Lane 2 待主机自动化真空窗确认后起（需独占浏览器 ~10–20 分钟/次），Lane 4 随时。

---

## 5. 门禁总表（每步"过门"必须有的收据）

| 门 | 收据形态 | 单源位置 |
|---|---|---|
| 看板纠偏 | suffix SHA-256 一致 + exact-head CI + Controller 评论 | 看板顶部块 |
| 定向归因 | 轨迹表 + AABB 表 + H1–H4 证据等级 | `cc-vis-x2-obs-r2-diagnosis.md` |
| 最小补洞 | diff 仅授权文件；机制差异说明 | #104 commit + 报告 |
| 定向门 | 2/2 pass、workers=1、retries=0、attempt=1 日志 | docs-only 证据 |
| 候选新鲜度 | `git merge-base` = current main；final-head CI run ID | 看板 |
| cleanup | worktree/tmp/port/process 四件前后字节 | 看板 + evidence |
| R3 授权 | Controller 具名评论（含 exact head SHA） | PR #104 Conversation |
| R3 结果 | `e2e-results.json` stats + `RUN_EXIT=0` + monitor | `cc-vis-x2-full-r3-evidence/` |
| LHCI 不回退 | 上轮 vs 本轮逐项表 + artifact ID | evidence |
| 视觉登记 | 两评审 JSON + Δ + 取证帧 hash | `cyber-city-visual-rubric-score.json` |
| 综合登记 | `quality-score.json`（weight=1, missing=[]）+ 命令行 | evidence + 看板矩阵行 |

---

## 6. 禁止项（合并两审计 + handoff §6）

- 禁止把 R1/R2 重命名为新轮次；禁止同标签重跑刷绿；禁止直接点火 R3。
- 禁止提高 timeout、放宽 radius、retry/repeat/skip、soft assertion 作为"修复"。
- 禁止未取轨迹即移动 X2 几何；禁止改视觉基线消化失败。
- 禁止把 CI SUCCESS 写成 E2E 通过；禁止把 `SEC-R11 CLOSED` 写成工程 GO 或永久停止。
- 禁止登记视觉分、综合分或缺维归一化分；禁止用失败趟诊断分冒充发布分。
- 禁止以 handoff 覆盖看板；禁止修改/删除 #213、#214 历史字节；禁止 revert/force-push 修账。
- 禁止未经指挥官决策创设全局治理规则（含 `APPROVED_FOR_SQUASH` 制度化）。
- 禁止删除 `cursor/cc-loop-audit-*` 分支或任何历史证据。
- 禁止代决：CAM 视角旋转、真机六腿、Android S-2 序 A·B、北极星调整、生产发布。

---

## 7. 风险与需指挥官决策的事项

| 事项 | 性质 | 建议 |
|---|---|---|
| main 无 branch protection，已发生两次抢合（#213 评论后 14s；#214 审计收口后 8s） | 治理 | 由指挥官决定是否开启 required checks / review；本文不代决 |
| `APPROVED_FOR_SQUASH` 已随 #214 进入 main 文本 | 制度越权 | Lane 1 纠偏块中降级为建议；是否制度化留指挥官 |
| 根因若落在产品 collider | 范围扩张 | 停手升级；含 src 的 PR 走董事会急裁 |
| 主机外部自动化并发（R1/R2 of #185 曾破门） | 资格风险 | 每次正式窗前书面确认真空；monitor 全程；如实登记 |
| 功能 90 / 性能 85 | 指挥官专属 | 不在本路径；矩阵行维持 87 / — |

---

## 8. 关键锚点速查

| 项 | 值 |
|---|---|
| live main（起草时） | `c585df92421135c957219be636be34604eaa4120` |
| #104 head | `598764172250f3a0d6e5a29c36aa564dbd44e009`（分支 `cursor/cc-vis-x2-facade-r2-1d6f`） |
| #104 merge-base | `939056d728218b68cc3e914840ab9f5ddcb2d82b` |
| R1 candidate / evidence | `834f1e7…` / #211 → `939056d` |
| R2 candidate / evidence | `5987641…` / #212 → `ff6d00e` |
| #213 / #214 merge | `8d6efb0`（15:39:35Z）/ `c585df9`（15:50:35Z） |
| exact-head CI / LHCI artifact | run `33514114971` / artifact `9803026775`（SHA-256 `841204db…a722f`） |
| R2 分母 / 结果 | 86 tests / 19 files；72P / 1F / 13 未运行 / 0 flaky / exit 1 |
| 失败断言 | `e2e/cyber-city-observability.spec.ts:412`（#104 分支行号） |
| driveTo 关键常量 | `NO_PROGRESS_MS=12000`、`PROGRESS_EPS_M=0.5`、倒车 2 次 × 2.5s、`R` 后 3s、`escapes` 归零 |
| 权重 | root LHCI 25 / home LHCI 15 / E2E 20 / visual 25 / smoke3d 15 |
| 视觉登记 | 73（`dc3f56b`，2026-08-27，AL-VIS-L8-W1）；最低维 v1 68 / v3 70 |
| 功能登记 | 87（云端封顶 87–88，90 需真机） |
| 审计包 | `~/Downloads/cyber-city-loop-audit-pr104-readonly-package.zip`、`~/Downloads/cc-loop-audit-pr104-package-20260901.zip` |
