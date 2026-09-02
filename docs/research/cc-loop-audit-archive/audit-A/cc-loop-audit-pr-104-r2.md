---
document: cc-loop-audit-pr-104-r2
status: FINAL_READ_ONLY_AUDIT
repository: rayw-lab/website
primary_audit_object: PR #104
candidate_head: 598764172250f3a0d6e5a29c36aa564dbd44e009
live_main_at_close: 8d6efb0ed9c0a523aed1a9523eee46135cc0b405
primary_verdict: NO_GO
ledger_incident: PR_213_MERGED_WITH_OPEN_CORRECTION_DEBT
corrective_candidate: PR #214
corrective_candidate_verdict: NO_GO_AS_SINGLE_SOURCE_AUTHORITY
proof_class: REMOTE_GITHUB_BYTES_PLUS_COMMITTED_RUNTIME_RECEIPTS
repo_write: NONE
commit_status: NOT_COMMITTED_LOCAL_DRAFT
date: 2026-09-01
---

# ⚖️ 提分 Loop 独立审计裁决书

> **只读声明**：本文件仅复核 GitHub 当前字节、PR 元数据、Actions 状态、PR 评论时间线与已提交运行证据。未修改仓库、未创建分支、未提交、未 push、未建 PR、未删除任何审计分支。

## 1. 总裁决

| 审计对象 | 裁决 | 核心理由 |
|---|---|---|
| PR #104 @ `5987641` | **`NO_GO / HOLD_DRAFT`** | 正式 R2 为 72P / 1F / 13 未运行 / exit 1 |
| 已合 PR #213 | **`MERGED_BUT_NOT_CLOSED / CORRECTION_REQUIRED`** | 在明确 `CHANGES_REQUIRED / DO_NOT_MERGE` 评论后约 14 秒仍被合入，且 5 项内容阻断未修 |
| 待合 PR #214 @ `847b928` | **`NO_GO_AS_CURRENT_AUTHORITY / REWORK_REQUIRED`** | 试图以旁路 handoff “正本”覆盖主看板，违反看板唯一单源；CI 绿也不能消除该冲突 |

- **审计截点 live main**：`8d6efb0ed9c0a523aed1a9523eee46135cc0b405`
- **生产矩阵**：继续冻结为 **`80 / 73 / 87 / —`**
- **北极星**：维持 **`98 / 98 / 90 / 85`**
- **工程合流意见**：#104 不得转 Ready、不得合入、不得提分。
- **账本纠偏意见**：不回写、不删除 #213 历史字节；必须在同一权威看板顶部追加新的纠偏块。

## 2. #104 身份与锚点

| 项目 | 现读事实 | 判定 |
|---|---|---|
| live main | `8d6efb0ed9c0a523aed1a9523eee46135cc0b405`，#213 merge commit | 已锚定 |
| PR #104 | OPEN、Draft、未合并 | HOLD |
| #104 head | `598764172250f3a0d6e5a29c36aa564dbd44e009` | 已锚定 |
| 规模 | 18 commits，16 changed files，+1631 / -29 | 已核 |
| 正式 R2 base | `939056d728218b68cc3e914840ab9f5ddcb2d82b` | 已过时 |
| exact-head CI | Run `33514114971`，SUCCESS | 仅普通 CI 门通过 |
| 当前新鲜度 | #104 尚未吸收 #212、#213 后的 live main | 不具备新一轮 GO 资格 |

**关键解释**：Run 33514114971 覆盖 `astro check / build / links / budget / Lighthouse`，没有执行正式 86 例 Playwright 全量资格窗。CI 绿灯不能覆盖正式 `RUN_EXIT=1`。

## 3. #104 硬门核验

| 门禁 | 证据 | 结果 | 裁决 |
|---|---|---:|---|
| E2E 资格面 | Fresh list 86 tests / 19 files；72P / 1F / 13 未运行 / 0 flaky；exit 1 | **FAIL** | 直接 NO_GO |
| 单 worker / 零 retry | workers=1；retries=0；单 attempt | **PASS** | 未见重跑刷绿 |
| 独占环境 | port 4587 pre/post bind success；1111 samples；external=0 | **PASS** | 环境资格成立 |
| final-head CI | Run 33514114971，head `5987641`，SUCCESS | **PASS** | 不等于 E2E 通过 |
| Diff 路径卫生 | 16 文件；无临时 PR body / trace / 提交态截图产物 | **PASS（路径级）** | 测试语义仍需正常审查 |
| tracked 资产恢复 | 23 张 PNG restore；23/23 匹配 index；worktree clean | **PASS** | 无截图污染 |
| 候选基线新鲜度 | 正式 R2 仅覆盖 `939056d`，live main 已到 `8d6efb0` | **FAIL** | 后续必须吸收 main |
| LHCI 四分类不回退 | CI 仅证明四项 ≥95，未见逐项相对上轮原始值收据 | **HOLD / NOT PROVEN** | 不能以阈值替代不回退 |
| 视觉固定机位 + 双评 | VIS-01…04 未运行 | **FAIL / NOT RUN** | 不得登记视觉分 |
| 权重完整性 | 未形成 `availableWeight=1.0`、`missing=[]` 收据 | **FAIL / INELIGIBLE** | 缺维 |
| 五维综合分 | 未形成完整输入与本轮自动算分收据 | **FAIL / NOT PUBLISHABLE** | 禁止手工补分 |
| 生产矩阵 | `80 / 73 / 87 / —` | **PASS（冻结）** | 不得提前提分 |

## 4. #104 P0 破门事实

### P0-1｜CITY-OBS-01 正式失败

- 第一段 waypoint `(20,-8)` 到达。
- 第二段目标停车位 `(28,-28)` 在正式窗口内未达。
- 结束采样：`x=1.3, z=-2.1`。
- 断言：`e2e/cyber-city-observability.spec.ts:412`。
- 后续 13 例因依赖链未运行，包括：
  - `CITY-OBS-01b…06`
  - `WS-PERF-01`
  - `CITY-PERF-01 / 02`
  - `VIS-01 / 02 / 03 / 04`

这不仅是“一例红灯”，还截断了 PERF、VIS、权重与综合分证据链。

### P0-2｜候选已落后 live main

R2 的正式证据 base 是 `939056d...`；当前 main 已经过 #212、#213 到 `8d6efb0...`。后续即便形成修复，也必须先吸收当时 live main，再针对新 exact head 重新开资格窗。旧证据不得平移。

### P0-3｜五维发布资格未形成

PERF 与 VIS 尾段未执行，无法得到完整五维输入，不能证明 `availableWeight=1.0`，也不能发布任何归一化或插值后的综合分。

## 5. R2 证据 P1

### P1-1｜`e2e-summary.json` 把文件数写成测试数

当前摘要：

```json
{
  "expectedPassed": 72,
  "unexpectedFailed": 1,
  "skippedDidNotRun": 13,
  "flaky": 0,
  "totalTests": 19
}
```

但 fresh list 为 **86 tests / 19 files**，且 `72 + 1 + 13 = 86`。正确 schema 应为：

```json
{
  "totalTests": 86,
  "totalFiles": 19
}
```

该错误不改变 `NO_GO`，但会污染机器核算。

### P1-2｜LHCI 只有阈值门，没有“不回退”收据

当前只证实 Lighthouse CI 四项均达到配置阈值 `≥95`，未形成“上轮原始四项—本轮原始四项—逐项差值—artifact 来源”的耐久凭据。

### P1-3｜权重与自动算分不可复核

当前连接检索未定位到本轮 `score-loop.mjs` 执行输出或 `availableWeight / missing` 机器收据。审计结论不是武断宣称脚本绝对不存在，而是：本轮交付不能证明脚本已执行，更不能证明完整权重和综合分。

## 6. #213 并发合流事故复盘

### 6.1 时间线

| UTC 时间 | 事实 |
|---|---|
| `15:39:21` | Controller 在 #213 发布 `CHANGES_REQUIRED / DO_NOT_MERGE`，列出 5 个阻断项 |
| `15:39:35` | #213 被 merge，main 前进到 `8d6efb0...` |
| `15:40:21` | PR 标题更新为 `[CHANGES REQUIRED] ...` |

即：#213 在明确禁止合流评论出现后约 **14 秒**仍被另一并发会话合入。

### 6.2 已合字节中的 5 个未闭阻断

1. **过期运行态**  
   看板写“后续只有指挥官另行明确重启才恢复工程门”，但 #104 最新 Controller 任务书已明确授权继续定向诊断。

2. **整洁离场口径冲突**  
   写入“R2 worktree 非强制移除”，与当前要求的 worktree/task package 清理门冲突。现有证据只证明 git clean、端口可 bind、进程 vacuum=0，不证明临时 worktree 已释放。

3. **R3 表述过度**  
   “没有第三跑”应改为“当前未授权 R3”；只有 `CITY-OBS-01 + CITY-PERF-02` 定向门和补洞门全绿后，Controller 才能另行授权 R3。

4. **遗漏同源 PERF 排雷**  
   `CITY-PERF-02` 与 OBS 复用同类东向进站路线，R2 未运行，必须与 `CITY-OBS-01` 同轮定向诊断。

5. **磁盘瞬时值无 durable source**  
   看板写 `249,958,158,336` bytes，但 #212 正式 receipt 的 postflight 是 `253,771,276,288` bytes。无仓内同值来源的瞬时数字不应进入权威看板。

### 6.3 #213 当前状态

- Append-only 结构本身：**PASS**
- docs-only：**PASS**
- exact-head CI：**PASS**
- 内容裁决门：**FAIL**
- 合流时序门：**FAIL**
- 归档结论：**`MERGED_BUT_NOT_CLOSED / CORRECTION_REQUIRED`**

禁止通过 revert、force-push 或改写 #213 历史解决；正确方式是权威看板顶部追加纠偏块。

## 7. #214 独立审计

### 7.1 已过面

- 单文件 docs-only；
- 新增 `docs/research/cc-loop-handoff-2026-09-01-2340-r2-controller-correction.md`；
- 不修改 #213 历史字节；
- 正确识别 OBS/PERF 定向诊断、cleanup debt、矩阵冻结和 #213 并发事故。

### 7.2 P0 阻断｜创建平行“正本”

#214 自称：

```text
本文件是当前时间戳最新的 cc-loop-handoff-* 交接正本
```

并宣称以该文件纠正 #213 顶部看板的当前运行态。

但本审计任务明确规定：

```text
docs/research/cyber-city-score-loop-orchestration.md
是唯一裁决依据
```

因此单独新增 handoff 文件，不能覆盖主看板顶部仍然错误的当前口径。它会形成：

```text
权威看板 A：阶段停止
旁路正本 B：已授权继续
```

这是典型双单源冲突。即使 #214 exact-head CI 成功，也不能按当前形态合入。

### 7.3 P1 阻断｜未经授权新增普遍治理规则

#214 规定今后所有 docs-only PR 必须出现 exact-head `APPROVED_FOR_SQUASH` 评论。该措施可以作为并发防错**建议**，但当前用户硬门并未授权把它直接上升为全局永久规则。应改为：

- 本次 #214 在合流前必须获得显式 Controller 放行；
- 是否固化为仓库级通用规则，另由指挥官决策；
- 审计文档不得自行扩权创设制度。

### 7.4 P1 表述问题｜弱化已发生的禁止合流事实

#214 应明确写：

```text
#213 在 Controller DO_NOT_MERGE 评论发布约 14 秒后仍被合入
```

而不是只写“阻断标题生效前被另一会话合入”。PR 标题晚于评论，不影响评论已公开存在这一事实。

### 7.5 #214 裁决

**`NO_GO_AS_CURRENT_AUTHORITY / REWORK_REQUIRED`**

精准改法：

1. 保留 handoff 文件时，将“正本/权威”改为“补充证据/执行交接”，不得声称覆盖看板。
2. 同一个 docs-only PR 必须同时修改：
   - `docs/research/cyber-city-score-loop-orchestration.md`
3. 看板修改只能在顶部新增一块 `SEC-R11-CORR-1`（或由 Controller 确认的编号），不得改写 #213 块。
4. 新顶部块明确：
   - live main；
   - #213 历史块被“当前运行态纠偏”所 supersede，但历史字节保留；
   - #104 仍 NO_GO/HOLD_DRAFT；
   - 下一动作是 `CITY-OBS-01 + CITY-PERF-02` 定向归因和最小补洞；
   - R3 当前未授权；
   - cleanup debt OPEN；
   - 瞬时磁盘数不作为控制依据；
   - 矩阵不变。
5. 删除或降级未经授权的全局 `APPROVED_FOR_SQUASH` 制度，只保留为建议或本 PR 的具名门。
6. final-head CI 成功后，重新读取 exact patch，再决定是否放行。

## 8. #104 合法下一动作

以最新 Controller 任务书为准，禁止直接 R3：

1. 在 R2 exact head `5987641` 上只读复现失败现场。
2. 对 `CITY-OBS-01 + CITY-PERF-02` 做同源路线定向归因。
3. 记录轨迹、no-progress、倒车脱困、respawn 前后坐标；验证安全入圈点与碰撞余量。
4. 默认冻结 `src/**`、`public/**`、视觉基线、`playwright.config.ts`、全局 timeout/retry。
5. 若证明测试路线问题，最小修改仅限授权 e2e 文件与诊断报告。
6. 若证明产品碰撞体问题，立即停手升级任务书，不得用测试绕行掩盖。
7. 定向门单 attempt、workers=1、retries=0，`CITY-OBS-01 + CITY-PERF-02` 全绿。
8. 吸收 live main，exact-head CI 全绿，cleanup debt 闭合后，方可由 Controller 另行授权具名 R3。
9. R3 才执行 fresh denominator 全量 0 fail / 0 skip / 0 flaky / exit 0。
10. 五维终审和 docs-only 证据上链完成后，才可能转 Ready。

## 9. 指挥官边界

本次未触碰、未代决：

- CAM 视角旋转；
- 真机六腿运动学；
- Android S-2 与序 A·B；
- `cursor/cc-loop-audit-*` 分支删除；
- 生产发布、分支删除、强推或历史回写。

## 10. Closeout

| 项目 | 结果 |
|---|---|
| Conclusion | #104 **NO_GO**；#213 **已合但未闭账**；#214 **需重做单源纠偏** |
| Changed Files | 仓库 **0**；仅生成本地三件套 |
| Validation | live main、PR #104/#213/#214、Actions、R2 收据/JSON/哈希、评论时间线、当前看板字节 |
| Proof Class | `REMOTE_GITHUB_BYTES_PLUS_COMMITTED_RUNTIME_RECEIPTS` |
| Residual Risks | main 无分支保护；并发会话可能再次抢合；#213 错误当前仍在权威看板顶部 |
| Next Action | 阻止 #214 按当前形态合入；改为“看板顶部追加纠偏 + 可选补充 handoff”后重新审 |
