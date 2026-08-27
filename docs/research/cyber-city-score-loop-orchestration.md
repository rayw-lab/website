# Phase 0 提分 Loop 编排看板

`main` @ `66ed0fe` · 2026-08-27 13:38 UTC · 范式 `cyber-city-orchestration-paradigm.md`

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | score-loop |
| **视觉** | **98** | **71** | +27 | VIS-L8-RS/BR/DES |
| **功能** | **90** | **—** | +90 | AL-FXN-R2 |
| **性能** | **85** | **—** | +85 | HG-PREP · PERF-C2 B0/B1 |

> 登记只认审计独立分。禁止 LHCI/e2e/smoke 冒充功能或性能。

## 当前焦点（Loop 8 · 首分冲刺）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 功能 | C1–C4 + OBS + VEH-FIX ✅ [#69](https://github.com/rayw-lab/website/pull/69)[#70](https://github.com/rayw-lab/website/pull/70) | **AL-FXN-R2** 登记首分 |
| 性能 | PERF-C1 ✅ · C2 B0/B1 在途 | HG-PREP → 真机六腿 → AL-PERF |
| 视觉 | 71 登记 · L8 RS/BR 在途 | DES → 实现批次（#43 BL2 禁合） |
| 综合 | 80 | 功能/性能登记后五维重算 |

## 在途子 Task（≤10 并行）

| ID | 模型 | 状态 |
|----|------|------|
| CC-AL-FXN-R2 | Sol | 🔄 playtest + 登记 JSON |
| CC-PERF-HG-PREP | Fable5 xhigh | 🔄 真机手册 |
| CC-PERF-C2-B0 | Fable5 xhigh | 🔄 O10 longFrames |
| CC-PERF-C2-B1 | Fable5 xhigh | 🔄 O1 自动降档 |
| CC-VIS-L8-RS | Fable5 xhigh | 🔄 gap 调研 |
| CC-VIS-L8-BR | Fable5 xhigh | 🔄 P0/P1 脑暴 |
| CC-VIS-L8-DES | Fable5 xhigh | 🔄 设计确认 |
| CC-VEH-R3-PREP | Fable5 xhigh | 🔄 R3 重审预备 |
| CC-COMPOSITE-98-RS | Fable5 xhigh | 🔄 综合 98 路径 |

## 下一拍序

1. AL-FXN-R2 PR → 功能 northStar 出数
2. doc/实现五路 push → PR → CI 绿合流
3. HG-PREP 合流 → 指挥官真机窗口
4. PERF-C2 B0 先合 → B1 rebase 合

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- tone mapping defer · poster 最后

## 归档（一行）

L6 CAM **71** [#45](https://github.com/rayw-lab/website/pull/45) · L8 doc [#47](https://github.com/rayw-lab/website/pull/47)–[#68](https://github.com/rayw-lab/website/pull/68) · L8 impl [#53](https://github.com/rayw-lab/website/pull/53)–[#70](https://github.com/rayw-lab/website/pull/70) · board [#71](https://github.com/rayw-lab/website/pull/71)
