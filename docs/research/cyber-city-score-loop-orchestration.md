# Phase 0 提分 Loop 编排看板

`main` @ `88097f9` · 2026-08-28 02:45 UTC · **MERGE-WAVE 8/8 已收口** · 范式 `cyber-city-orchestration-paradigm.md`

**模型（L8+）**：全部子代理 Task = `claude-fable-5-thinking-xhigh`；在途 Sol 可跑完（§1.2 宽限）。

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | COMP-M0 重算（#105 留痕 / #106 WIP） |
| **视觉** | **98** | **73** | +25 | 顾问路径 →~78（[#98](https://github.com/rayw-lab/website/pull/98) 已合）· X1b [#101](https://github.com/rayw-lab/website/pull/101) 已合待复评 |
| **功能** | **90** | **84** | +6 | [#103](https://github.com/rayw-lab/website/pull/103) 分支登记 **87** 未合（Codex P1 卡） |
| **性能** | **85** | **—** | +85 | 六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已在 main；首分待指挥官真机 → AL-PERF |

> 登记只认审计独立分（JSON 单源：视觉 main@88097f9 = 73，功能 main = 84）。禁止 LHCI/e2e/smoke 冒充功能或性能；#103 的 87 合流前不登记。

## 当前焦点（Loop 8 · post-MERGE-WAVE）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 视觉 | **73** ✅ [#94](https://github.com/rayw-lab/website/pull/94) · X1b voice-pod 已合 [#101](https://github.com/rayw-lab/website/pull/101)（W2③）· 顾问 [#98](https://github.com/rayw-lab/website/pull/98) / TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) / G3+X5 授权 [#100](https://github.com/rayw-lab/website/pull/100) 已合 | **P1** X2 [#104](https://github.com/rayw-lab/website/pull/104) rebase（W2④ 已解锁）→ G1 预登记 |
| 功能 | **84** ✅ main · 决策树 [#97](https://github.com/rayw-lab/website/pull/97) 已合 · [#103](https://github.com/rayw-lab/website/pull/103) ready 登记 87 | **P2** Codex 补洞后合流 → 登记 87 |
| 性能 | 六腿桌面单 [#96](https://github.com/rayw-lab/website/pull/96) 已合 | 指挥官真机（零 VM）→ AL-PERF |
| 综合 | 80 | COMP-M0 五维重算（#105/#106 续派） |

## MERGE-WAVE 8/8 合流记录（`771b1e4` → `88097f9`，每步 CI+Deploy 双绿）

| 序 | PR | merge SHA | 内容 |
|----|-----|-----------|------|
| 1 | [#95](https://github.com/rayw-lab/website/pull/95) | `e10d7d7` | 秘书 tick（tip 771b1e4，视觉登记 73） |
| 2 | [#98](https://github.com/rayw-lab/website/pull/98) | `e4aa7e4` | VIS-ADV-73 顾问（73→~78 路径，W2 X1b∥X2） |
| 3 | [#99](https://github.com/rayw-lab/website/pull/99) | `f63f779` | TM-PREP X4 tone mapping 解除 defer 预备 |
| 4 | [#100](https://github.com/rayw-lab/website/pull/100) | `d738f31` | G3 书面裁决 + X5 并行开工授权 |
| 5 | [#97](https://github.com/rayw-lab/website/pull/97) | `c609946` | FXN-NEXT-90 冲 90 第二波决策树 |
| 6 | [#96](https://github.com/rayw-lab/website/pull/96) | `d73784b` | PERF-DESK 性能首分六腿桌面执行单 |
| 7 | [#102](https://github.com/rayw-lab/website/pull/102) | `e84e77b` | AL-VEH-R3 interim 留痕（僵死抢救） |
| 8 | [#101](https://github.com/rayw-lab/website/pull/101) | **`88097f9`** | **X1b voice-pod 第三栋 hero 实模（W2③）→ X2 解锁** |

## 在途子 Task（VM 硬护栏 3，见 #107 调研）

**当前零在途**：MERGE-WAVE / R9(#103) / S2(#108) 子代理均已 IDLE 收口；X1b、VIS-ADV-73、TM-PREP、PERF-DESK、FXN-NEXT、C5-C6 各腿已随合流清账。父代理待命，待指挥官批准 fan-out。

| 待派 | 内容 | 条件 |
|------|------|------|
| P1 · CC-VIS-X2-REBASE-FINISH | [#104](https://github.com/rayw-lab/website/pull/104) rebase → main@`88097f9` → e2e → ready | ✅ X1b 已合 |
| P2 · #103 Codex 补洞 | 定向审计续写（零 src）：看板刷新（本单 ✅）+ L6 证据重采落库 + F5 hint-recall 补证 → 合 [#103](https://github.com/rayw-lab/website/pull/103) | 合流前必清 |
| P3 · 槽空滚动 | PERF 六腿 kit · M0-R4 [#106](https://github.com/rayw-lab/website/pull/106) · VEH-R3-R3（#102 已合 ✅）· G1 预登记（#101 已合 ✅） | 槽空即派 |
| P4 · X5-R4 | X5 招牌续拍（[#100](https://github.com/rayw-lab/website/pull/100) 已授权） | X2 收口后串行 |

## 指挥官真机（零 VM，独立于 P1–P4）

1. **S-2 v1** — [#108](https://github.com/rayw-lab/website/pull/108) kit（S-2 执行单 + AL-R10 空壳）
2. **性能六腿** — [#96](https://github.com/rayw-lab/website/pull/96) 桌面单已在 main

→ artifacts 回传 → **AL-R10**（功能真机复核）/ **AL-PERF**（性能首分登记）→ COMP-M0 五维重算

## OPEN PR

| PR | 状态 | 说明 |
|----|------|------|
| [#103](https://github.com/rayw-lab/website/pull/103) | **ready**（CI 绿） | AL-FXN-R7 登记 87 · **Codex P1 卡**（L6 重采 / F5 补证）未清禁合 |
| [#104](https://github.com/rayw-lab/website/pull/104) | draft | X2 立面套件（W2④）· **P1** 待 rebase → main@`88097f9` |
| [#108](https://github.com/rayw-lab/website/pull/108) | draft | S2 指挥官真机 kit（S-2 v1 + AL-R10 空壳） |
| [#107](https://github.com/rayw-lab/website/pull/107) | draft | 编排交接单 2026-08-28 + VM 并发上限调研（硬护栏 3） |
| [#106](https://github.com/rayw-lab/website/pull/106) | draft | COMP-M0-R4 综合实算 WIP（P3 续派） |
| [#105](https://github.com/rayw-lab/website/pull/105) | draft | COMP-M0-R3 kickoff 留痕 |

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- **[#103](https://github.com/rayw-lab/website/pull/103)** · Codex P1 未清前禁合（P2 补洞段负责清账）

## 归档（一行）

顾问 [#87](https://github.com/rayw-lab/website/pull/87)[#88](https://github.com/rayw-lab/website/pull/88)[#98](https://github.com/rayw-lab/website/pull/98) · AL-FXN **84** [#84](https://github.com/rayw-lab/website/pull/84) · AL-VIS **73** [#94](https://github.com/rayw-lab/website/pull/94) · C5-R3 [#90](https://github.com/rayw-lab/website/pull/90) · C6 [#91](https://github.com/rayw-lab/website/pull/91) · X1a-R4 [#92](https://github.com/rayw-lab/website/pull/92) · X3-R4 [#93](https://github.com/rayw-lab/website/pull/93) · 秘书 [#86](https://github.com/rayw-lab/website/pull/86)[#95](https://github.com/rayw-lab/website/pull/95) · 范式 [#85](https://github.com/rayw-lab/website/pull/85) · 清理 [#89](https://github.com/rayw-lab/website/pull/89) · TM-PREP [#99](https://github.com/rayw-lab/website/pull/99) · G3+X5 [#100](https://github.com/rayw-lab/website/pull/100) · FXN-NEXT [#97](https://github.com/rayw-lab/website/pull/97) · PERF-DESK [#96](https://github.com/rayw-lab/website/pull/96) · VEH-R3 留痕 [#102](https://github.com/rayw-lab/website/pull/102) · X1b [#101](https://github.com/rayw-lab/website/pull/101)
