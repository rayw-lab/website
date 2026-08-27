# Phase 0 提分 Loop 编排看板

`main` @ `43d20ee` · 2026-08-27 13:30 UTC · [#65](https://github.com/rayw-lab/website/pull/65)[#66](https://github.com/rayw-lab/website/pull/66)[#67](https://github.com/rayw-lab/website/pull/67)[#68](https://github.com/rayw-lab/website/pull/68) 已合 · 范式 `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 说明 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | LHCI+e2e+视觉+smoke；不含功能/性能 |
| **视觉** | **98** | **71** | +27 | AL-CAM · `cyber-city-visual-rubric-score.json` |
| **功能** | **90** | **—** | +90 | 待 **CC-AL-FXN**（在途） |
| **性能** | **85** | **—** | +85 | 待 **CC-AL-PERF** + human-gate |

> 登记只认审计独立分。禁止用 LHCI/e2e/smoke 冒充功能或性能。

## 当前焦点（Loop 8）

功能/性能 northStar 从 — 到数字（首分路径见 [#68](https://github.com/rayw-lab/website/pull/68) 顾问报告）：功能走 AL-FXN 独立审计报首分；性能走 HG-PREP 真机六腿 + C2-B0/B1 落地 → AL-PERF。

## 在途子 Task

| ID | 状态 |
|----|------|
| CC-AL-FXN (Sol) | ⏳ 功能独立审计 → 报功能首分 |
| CC-FXN-C4 | ⏳ 目标/进度轻任务（探索计数） |
| CC-VEH-E2E-FIX | ⏳ CAR-E2E-01/05 超时修 → 67/67 全绿 |
| CC-PERF-HG-PREP | ⏳ human-gate 真机六腿预备 |
| CC-PERF-C2-B0/B1 | ⏳ 性能 C2 批次 B0/B1 落地 |

## 下一拍

1. CC-AL-FXN 报分 → 登记矩阵功能列首次进数字
2. CC-PERF-HG-PREP 六腿回填 + C2-B0/B1 合流 → 派 **CC-AL-PERF**
3. CC-VEH-E2E-FIX 全绿 → VEH-R2 复审升 GO
4. CC-FXN-C4 合流

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- tone mapping defer · poster 最后

## 归档（一行速查）

L5 68 · L6 CAM **71** [#45](https://github.com/rayw-lab/website/pull/45) · L7 VEH-C2 [#63](https://github.com/rayw-lab/website/pull/63) · L8 doc [#47](https://github.com/rayw-lab/website/pull/47)–[#64](https://github.com/rayw-lab/website/pull/64)+[#68](https://github.com/rayw-lab/website/pull/68) · L8 impl [#53](https://github.com/rayw-lab/website/pull/53)[#57](https://github.com/rayw-lab/website/pull/57)[#56](https://github.com/rayw-lab/website/pull/56)[#62](https://github.com/rayw-lab/website/pull/62)[#63](https://github.com/rayw-lab/website/pull/63)[#65](https://github.com/rayw-lab/website/pull/65)[#66](https://github.com/rayw-lab/website/pull/66)[#67](https://github.com/rayw-lab/website/pull/67)
