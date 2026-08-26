# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 渲染架构 | `cyber-city-rendering-architecture-audit.md` |
| 渲染缺口裁决 | `cyber-city-rendering-gaps-consult.md`（Sol 2026-08-26） |
| 北极星 | 综合 **98**（当前 **92.0**，Δ **−6.0**） |
| 生产 tip | `main` @ `bfd8c92`（登记 **92.0/68**；L5 自评 92.3/69 **未过 AL5 不得登记生产**） |

## 渲染三条发现 — Sol 裁决（不立即开 Task）

| # | 发现 | 裁决 | 插入时机 |
|---|------|------|----------|
| ① | 无 tone mapping | **建议补** | AL5 后 **Loop 6** 单批校准（ACES+emissive 整表重校）；**不进 L5** |
| ② | PreRenderer 仅 Q0+WebGPU | **可 defer** | AL5 补冷启动**观测**；有硬门失败再定向修复 |
| ③ | Ticker TSL uniform 悬空 | **建议补** | AL5 后**维护小 PR**（删或注释指路）；不占视觉关键路径 |

当前顺序不变：**L5-C1 → AL5 →** 再按决策树开 Loop 6 / 维护 PR / Blender 专项。

## Loop 5 — 🚀 Tier C（V4 主攻）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-L5-C1 | `cursor/cc-l5-tierc-interior-windows-1d6f` @ `8c7da76` · [PR #40](https://github.com/rayw-lab/website/pull/40) | [L5-C1](bc-2a06873e-daa2-5ab0-8806-06c78da0f5de) | ✅ DONE（自评 69，综合 92.3） |
| CC-AL5 | `cursor/cc-al5-loop5-audit-1d6f` | [AL5](bc-828f4da0-f935-55b1-bc0d-0cfbb8538202) | 🚀 RUNNING（等审计收口） |

## Loop 6 前瞻（AL5 后条件触发）

| 条件 | Task |
|------|------|
| 独立 69±、V4 有净增益、缺口=V2/V3 高光 | `CC-L6-tone-mapping`（ACES + 台账重校） |
| AL5 冷启动硬门失败 | `CC-L5-fix-precompile`（定向预热，非 CubeCamera 一刀切） |
| 任意时刻 | `CC-maint-ticker-uniforms`（③ 清悬空接口） |

## Loop 4 — ✅ · 专项 — ✅

Loop 4 B5+AL4（视觉 68）；Rendering-Audit [PR #39](https://github.com/rayw-lab/website/pull/39)。

## Loop 5 corner case 纪律（本轮盯）

| # | 风险 | 处置 |
|---|------|------|
| 1 | L5 自评 92.3/69 ≠ 生产分 | **AL5 独立分**过门才登记 tip；不合流前禁止用自评推进 Loop 6 |
| 2 | PR #40 栈 diff 假象 | AL5 须 exact tree：`8c7da76 ⊕ main@bfd8c92` |
| 3 | WS-E2E-03 ±π flake | L5 首轮 1 fail 已留档；AL5 须隔离复核，不得静默吞 |
| 4 | raw +1.0 停批条款 | 若独立 raw 增益 <1.0 → 裁决 Blender，不自动开 Loop 6 |
| 5 | 渲染三条插队 | tone mapping / PreRenderer / Ticker **不进 AL5 前** |
| 6 | AL5 分支滞后 main | `cc-al5-loop5-audit` 当前无 ahead commit，等 Agent push 审计报告 |

## 定时器

`loop-cyber-city-orchestrate` · **300s（5m）** · 北极星 98 · CI 订阅 PR #40 分支
