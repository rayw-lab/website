# Phase 0 提分 Loop 编排看板

`main` @ `502fb2b` · 2026-08-27 16:47 UTC · 范式 `cyber-city-orchestration-paradigm.md`

**模型（L8+）**：全部子代理 Task = `claude-fable-5-thinking-xhigh`；在途 Sol 可跑完（§1.2 宽限）。

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | 五维重算 |
| **视觉** | **98** | **71** | +27 | W1-X1a-R2 · W1-X3-R2 |
| **功能** | **90** | **84** | +6 | C5-R2 · C6-R2 |
| **性能** | **85** | **—** | +85 | 真机六腿 · AL-PERF |

> 登记只认审计独立分。禁止 LHCI/e2e/smoke 冒充功能或性能。

## 当前焦点（Loop 8）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 功能 | **84** ✅ [#84](https://github.com/rayw-lab/website/pull/84) | C5∥C6 → 真机 S-2 + AL-FXN-R3 |
| 性能 | 顾问 R2 ✅ [#88](https://github.com/rayw-lab/website/pull/88) | 指挥官真机六腿 → AL-PERF |
| 视觉 | 71 · 顾问/任务书 ✅ | W1-X1a-R2（接续 `33214e7`）· W1-X3-R2 |
| 综合 | 80 | 功能/性能登记后重算 |

## 在途子 Task（≤10 并行）

| ID | 模型 | 状态 |
|----|------|------|
| CC-FXN-C5-R2 | Fable5 xhigh | 🔄 重派（旧 C5 僵尸已弃） |
| CC-FXN-C6-R2 | Fable5 xhigh | 🔄 重派（旧 C6 僵尸已弃） |
| CC-VIS-L8-W1-X1a-R2 | Fable5 xhigh | 🔄 重派（接续 Step0 `33214e7`） |
| CC-VIS-L8-W1-X3-R2 | Fable5 xhigh | 🔄 重派（旧 X3 僵尸已弃） |
| CC-AL-VEH-R3-R2 | Fable5 xhigh | ⏳ 待 X1a/X3 让出 VM 后单跑 e2e |

## 僵尸清理（2026-08-27 16:47 UTC）

| 旧 Task | 代理 | 裁决 | 证据 |
|---------|------|------|------|
| CC-FXN-C5 | bc-97ed786b | ❌ 僵尸 | 30min+ 无分支无 push |
| CC-FXN-C6 | bc-21826795 | ❌ 僵尸 | 工作区污染、无 push |
| CC-VIS-L8-W1-X3 | bc-aefe3a8f | ❌ 僵尸 | 分支无实现提交 |
| CC-VIS-L8-W1-X1a | bc-d506b324 | ⚠️ 半完成 | `33214e7` Step0 已 push，主体僵死 |
| CC-AL-VEH-R3 | bc-dc78b460 | ❌ 疑似僵死 | 30min+ 无审计 PR |
| CC-FXN-ADV-90 / PERF-R2 | — | ✅ 已交付 | [#87](https://github.com/rayw-lab/website/pull/87)[#88](https://github.com/rayw-lab/website/pull/88) 已合 |

> UI 中仍显示 RUNNING 的旧代理请在 Cursor 侧手动 Stop；父代理不再等待其回报。

## 下一拍序

1. C5-R2 ∥ C6-R2 ∥ W1-X1a-R2 ∥ W1-X3-R2（独立 worktree，禁共享 `/workspace`）
2. 四路收敛后单派 VEH-R3-R2（75/75 e2e 独占 VM）
3. 指挥官真机六腿 → AL-PERF

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**

## 归档（一行）

顾问 [#87](https://github.com/rayw-lab/website/pull/87)[#88](https://github.com/rayw-lab/website/pull/88) · AL-FXN **84** [#84](https://github.com/rayw-lab/website/pull/84) · 范式 [#85](https://github.com/rayw-lab/website/pull/85) · board [#86](https://github.com/rayw-lab/website/pull/86)
