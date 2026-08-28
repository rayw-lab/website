# 编排交接单 · 2026-08-28

状态：**交接推进中**（父代理不写业务代码；`/loop` 已退，不 fan-out 新 VM 子代理）。

最后更新：2026-08-28T02:20 UTC（`handoff-check-merge-r9` tick）

## 1. 父代理本轮动作

| 动作 | 结果 |
|------|------|
| 取消 `loop-cyber-city-orchestrate` 定时器 | ✅ 已 unsubscribe |
| 调研 async VM 上限 | ✅ `cursor-async-vm-subagent-limit-investigation.md` |
| 指挥官要求「3→10」 | ❌ **平台 runtime 不可改**；见 §4 |
| S2 kit draft PR | ✅ [#108](https://github.com/rayw-lab/website/pull/108) |
| 本交接单 | draft [#107](https://github.com/rayw-lab/website/pull/107) |
| 新派 Task | ❌ 待命；MERGE-WAVE 剩 **#101**；#103 有 Codex P1 待补 |

## 2. main 与 MERGE-WAVE

| 时点 | main tip | 已合 PR |
|------|----------|---------|
| 合流前 | `771b1e4` | — |
| **当前** | **`e84e77b`** | #95–#100 #97 #96 **#102** |

合流日志（MERGE-WAVE [bc-964f16a5](https://cursor.com/agents/bc-964f16a5-adb2-503b-a3fd-4d6b11862b9e)，进行中）：

| 序 | PR | 状态 | merge → main |
|----|-----|------|----------------|
| 1 | #95 秘书全量刷新 | ✅ MERGED | `e10d7d7` |
| 2 | #98 VIS 73→78 顾问 | ✅ MERGED | `e4aa7e4` |
| 3 | #99 TM AgX/Neutral 预研 | ✅ MERGED | `f63f779` |
| 4 | #100 G3/X5 书面裁决 | ✅ MERGED | `d738f31` |
| 5 | #97 FXN 冲90 决策树 | ✅ MERGED | `c609946` |
| 6 | #96 PERF 指挥官六腿桌面单 | ✅ MERGED | `d73784b` |
| 7 | #102 VEH-R3 interim | ✅ MERGED | `e84e77b` |
| 8 | **#101 X1b voice-pod** | ⏳ OPEN | W2 解锁键，**必须最后合** |

**禁合**：#43 BL2；#104/#105/#106 draft WIP；**#103 ready 但 Codex P1 未清禁合**（见 §9）

## 3. 在途子代理

| 代理 | 链接 | 状态 | 最新已知 |
|------|------|------|----------|
| MERGE-WAVE | [bc-964f16a5](https://cursor.com/agents/bc-964f16a5-adb2-503b-a3fd-4d6b11862b9e) | RUNNING | **7/8** 已合；**仅剩 #101** |
| R9 L7 登记 | [bc-558d537c](https://cursor.com/agents/bc-558d537c-022c-5eaf-bb8c-f79dbf7cc395) | ✅ **IDLE 完成** | [#103](https://github.com/rayw-lab/website/pull/103) **ready** @ `c4e844c`；登记 **87**（Pass B，云端封顶合规） |
| S2 指挥官 kit | [bc-4e331c92](https://cursor.com/agents/bc-4e331c92-5ce4-5035-aa50-8619f9d4c4ee) | ✅ DONE | [#108](https://github.com/rayw-lab/website/pull/108) @ `4d5f9d6` |
| Desktop 编排 | [bc-6134eb35](https://cursor.com/agents/bc-6134eb35-a319-4d11-96ee-cd6adff3e859) | RUNNING | 不占 async new-VM 槽 |

## 4. VM 并发（指挥官必读）

- **单父代理 async new-VM 子代理**：平台 runtime 硬护栏 **3**（`Async new-VM subagent limit of 3 reached`），**无法在本仓库或 Dashboard 改为 10**。
- **接近 10 路**：多开**顶层 Cloud Agent**（plan 顶层并发，Pro ~8）+ 单父代理内 **≤3 滚动窗口** + 同 VM 只读子代理。
- 详表：`cursor-async-vm-subagent-limit-investigation.md`

## 5. 登记矩阵

| 维度 | 登记 | 北极星 | 备注 |
|------|------|--------|------|
| 综合 | 80 | 98 | doc 堆合流后秘书需刷新 |
| 视觉 | 73 | 98 | #98 顾问已进 main，登记 JSON 未重签 |
| 功能 | **87**（#103 分支，未合 main） | 90 | R9 登记；main 仍 84 直至 #103 合流 |
| 性能 | — | 85 | 真机六腿 → AL-PERF |

## 6. 指挥官真机（零 VM）

并行跑（照 #96 + #108）：

1. **S-2 v1.0** — `cyber-city-fxn-s2-commander-v1.md`（#108 分支）
2. **六腿 Lighthouse** — #96 桌面单

artifacts 落 `docs/spec/assets/human-gate/` 后 → 派 **AL-R10** / **AL-PERF**。

## 7. 下一棒待办（按优先级）

### A. MERGE-WAVE 收口后（#101 合 main）

1. 记录最终 main tip SHA
2. 派 **X2 #104**：rebase onto main（含 X1b）→ e2e → `gh pr ready`
3. 合 doc 堆余下若未完成：#100 #97 #96 #102（MERGE-WAVE 应已处理）
4. **秘书 post-merge 刷新**看板 `cyber-city-score-loop-orchestration.md`

### B. R9 #103 — ready，**Codex 阻断合流前须补洞**

1. ~~L7 + 登记 JSON~~ → done @ `c4e844c`，score **87**
2. **Codex review（02:19）** — 合流前须定向补洞 Task（Fable5 审计续写，零 src）：
   - **P1** 刷新单源看板 `cyber-city-score-loop-orchestration.md`（功能 84→87、C5/C6 状态）
   - **P1** L6 录屏/dump 旧 VM 消亡 → 重采或落库 `docs/spec/assets/human-gate/` 可复验路径
   - **P2** F5 hint-recall 锚：R5 L3 defer 项是否在 L6 补证，否则 F5 不得 90
3. MERGE-WAVE **#101 合后** + Codex 清账 → 再合 #103

### C. 槽空滚动派单（≤3 async new-VM）

| 优先级 | Task | 条件 |
|--------|------|------|
| P1 | X2 rebase 收口 | #101 已合 |
| P2 | PERF 六腿 kit | 可与指挥官真机并行 |
| P3 | M0-R4 #106 实算 | draft 续跑 |
| P4 | VEH-R3-R3 续审 | #102 已合 main，槽空可派 |
| P5 | G1 预登记 | X1b 合后 |
| 延后 | X5-R4 | X2 收口后再开 |

## 8. §7 收口回填（子代理完成后补）

| 子代理 | 完成？ | 回填 |
|--------|--------|------|
| MERGE-WAVE | ⏳ RUNNING **7/8** | main `e84e77b`；#102 ✅；**仅剩 #101** |
| R9 | ✅ IDLE | #103 ready；**Codex P1×2 P2×1 待补** |
| S2 | ✅ IDLE | [#108](https://github.com/rayw-lab/website/pull/108) @ `4d5f9d6` |

**tick（02:20）**：R9 IDLE；MERGE-WAVE RUNNING 7/8（#101 OPEN）；#103 Codex 仍阻断；**不派 X2**。

## 9. Codex review 摘要（#103 @ `c4e844c`）

| 级 | 要点 | 下一棒 |
|----|------|--------|
| P1 | 看板仍写功能 84 / C5·C6 在途 | 同 PR 或秘书 tick 刷新 `cyber-city-score-loop-orchestration.md` |
| P1 | L6 artifact 随旧 VM 消失，登记仍引用 | 重采 webm+dump 或 human-gate 持久化 |
| P2 | F5=90 缺 hint-recall 补证 | L6 补跑或登记降 F5 |

---

*单源看板：`cyber-city-score-loop-orchestration.md`（post-merge 须刷新）。*
