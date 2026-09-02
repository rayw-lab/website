# CC-LOOP 看板纠偏增量草案（未应用）

> 目标单源：`docs/research/cyber-city-score-loop-orchestration.md`  
> 当前 main：`8d6efb0ed9c0a523aed1a9523eee46135cc0b405`  
> 性质：**独立审计建议；未向 GitHub 写入**  
> 约束：只在顶部追加；#213 历史字节冻结；不得另立同级权威单源。

## 1. Current State

- #213 已于 `2026-09-01T15:39:36Z` 合入 `8d6efb0ed9c0a523aed1a9523eee46135cc0b405`；
- 其 R1/R2 数字、merge SHA、#104 HOLD 与矩阵事实有效；
- 其“没有第三跑 / 阶段停止 / 仅等待重新授权”运行态已被更晚 Controller 指令 supersede；
- #214 正尝试另建 `cc-loop-handoff-*` 纠偏，head `847b9287241f3e43ef82e44a5880ee8f7c8b63e8`，final-head CI 已 SUCCESS；
- 按 Audit Master Prompt，看板仍是唯一权威单源，不应让 handoff 文件自称更高 authority。

## 2. 建议顶部纠偏块

> **#104 R2 红证后续控制纠偏（SEC-R11 FACTS CLOSED / ENGINEERING HOLD · 2026-09-01 Asia/Shanghai；main `8d6efb0ed9c0a523aed1a9523eee46135cc0b405`；#104 OPEN/DRAFT/HOLD_DRAFT）**：本块 supersede #213 顶部块中关于“永久阶段停止/无 R3”的运行态描述，但不回改其历史字节。`SEC-R11 FACTS CLOSED` 仅表示 R1/R2 失败证据与 MERGE-WAVE 20 已收账，不表示 #104 工程关闭或通过。#104 exact head `598764172250f3a0d6e5a29c36aa564dbd44e009`，相对 current main diverged、behind 5；普通 exact-head CI run `33514114971` SUCCESS，但 full E2E R2 为 72 passed / 1 failed / 13 did not run / flaky0 / retry0、`RUN_EXIT=1`，唯一失败 `CITY-OBS-01`：`(20,-8)` 到达、`(28,-28)` 未达、终态 `(1.3,-2.1)`；monitor 1111 samples external=0。当前裁决仍为 `NO_GO / HOLD_DRAFT`，禁止 ready / merge / 提分。当前合法下一步是 Node 22 下的 `CITY-OBS-01 + CITY-PERF-02` 定向 route probe、真实轨迹与 collider AABB 归因及最小补洞；**R3 full 当前未授权**，只有定向门、final-head CI 与 fresh list 全部通过后，Controller 才能新具名授权一次 R3。生产矩阵维持 **80 / 73 / 87 / —**，北极星维持 **98 / 98 / 90 / 85**。CAM、真机六腿、Android S-2 序 A·B、审计分支删除均未触，永不代决。

## MERGE-WAVE 21 合流记录（2026-09-01 UTC）

| 序 | PR | merge SHA | mergedAt | 内容 |
|---:|---:|---|---|---|
| 1 | #213 | `8d6efb0ed9c0a523aed1a9523eee46135cc0b405` | `2026-09-01T15:39:36Z` | R1/R2 阶段账；append-only 合规，但运行态需本块纠偏 |

## 3. 对 PR #214 的精确修改建议

1. final-head CI 已 SUCCESS，但仍须完成单源与授权边界修正后才可合；
2. 将“本 handoff 是当前权威正本”改为“非权威交接附件；控制口径以看板顶部最新块为准”；
3. 同 PR 增加上述看板顶部纠偏块，或将 PR 改为只更新看板；
4. `APPROVED_FOR_SQUASH` 新规则降级为建议，待指挥官明确批准后再制度化；
5. 不回改 #213 历史字节；
6. final-head CI SUCCESS 后逐字回读 exact patch；
7. 合入后验证第一父链与 MERGE-WAVE 21 闭合；
8. 该 docs-only 纠偏仍不构成 #104 工程放行证据。
