# Phase 0 提分 Loop 编排看板

`main` @ `18263b7` · 2026-08-27 16:20 UTC · 范式 `cyber-city-orchestration-paradigm.md`

**模型（L8+）**：全部子代理 Task = `claude-fable-5-thinking-xhigh`；在途 Sol 可跑完（§1.2 宽限）。

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | score-loop 五维重算 |
| **视觉** | **98** | **71** | +27 | VIS-L8 · W1-X1a/X3 |
| **功能** | **90** | **84** | +6 | —（AL-FXN ✅ [#84](https://github.com/rayw-lab/website/pull/84)） |
| **性能** | **85** | **—** | +85 | HG-PREP · PERF-C2 · AL-PERF |

> 登记只认审计独立分。禁止 LHCI/e2e/smoke 冒充功能或性能。

## 当前焦点（Loop 8）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 功能 | **84** 首登 ✅ `loop8-fxn-audit.md` | L6/L7 缺口补洞（可选） |
| 性能 | PERF-C1 ✅ · C2 B0/B1 ✅ · HG-PREP ✅ | 指挥官真机六腿 → **AL-PERF**（Fable5） |
| 视觉 | 71 · L8 doc 合流 | W1-X1a 实现 · W1-X3 实现 · #43 BL2 禁合 |
| 综合 | 80 | 功能/性能登记后五维重算 |

## 在途子 Task（≤10 并行 · 新派一律 Fable5 xhigh）

| ID | 模型 | 状态 |
|----|------|------|
| CC-FXN-ADV-90 | Fable5 xhigh | 🔄 RUNNING · 功能 84→90 顾问 |
| CC-PERF-ADV-SCORE-R2 | Fable5 xhigh | 🔄 RUNNING · 性能评分顾问 R2 |
| CC-VIS-L8-W1-X1a | Fable5 xhigh | 🔄 RUNNING · 实现 |
| CC-VIS-L8-W1-X3 | Fable5 xhigh | 🔄 RUNNING · 实现 |
| CC-AL-VEH-R3 | Fable5 xhigh | 🔄 RUNNING · 75/75 e2e 审计 |

## 下一拍序

1. 收 W1-X1a / W1-X3 实现 · AL-VEH-R3 审计 · 双顾问（FXN-ADV-90 / PERF-ADV-SCORE-R2）结论
2. 指挥官排真机窗口 → human-gate 六腿
3. AL-PERF 登记性能首分（Fable5）
4. 功能/性能齐套后重算综合分

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- tone mapping defer · poster 最后

## 归档（一行）

L6 CAM **71** [#45](https://github.com/rayw-lab/website/pull/45) · L8 doc [#47](https://github.com/rayw-lab/website/pull/47)–[#83](https://github.com/rayw-lab/website/pull/83) · L8 impl [#53](https://github.com/rayw-lab/website/pull/53)–[#70](https://github.com/rayw-lab/website/pull/70) · **AL-FXN 84** [#84](https://github.com/rayw-lab/website/pull/84) · board [#71](https://github.com/rayw-lab/website/pull/71)
