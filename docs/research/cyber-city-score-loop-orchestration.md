# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 渲染架构 | `cyber-city-rendering-architecture-audit.md` |
| 渲染缺口裁决 | `cyber-city-rendering-gaps-consult.md`（Sol 2026-08-26） |
| 生产 tip | `main` @ `d2b04c5`（综合 **92.0**，视觉 **68**） |

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
| CC-L5-C1 | `cursor/cc-l5-tierc-interior-windows-1d6f` @ `6e48f1a` | [L5-C1](bc-2a06873e-daa2-5ab0-8806-06c78da0f5de) | 🚀 RUNNING（已 push，e2e/取证中） |
| CC-AL5 | `cursor/cc-al5-loop5-audit-1d6f` | Sol | 待 L5 收口 |

## Loop 6 前瞻（AL5 后条件触发）

| 条件 | Task |
|------|------|
| 独立 69±、V4 有净增益、缺口=V2/V3 高光 | `CC-L6-tone-mapping`（ACES + 台账重校） |
| AL5 冷启动硬门失败 | `CC-L5-fix-precompile`（定向预热，非 CubeCamera 一刀切） |
| 任意时刻 | `CC-maint-ticker-uniforms`（③ 清悬空接口） |

## Loop 4 — ✅ · 专项 — ✅

Loop 4 B5+AL4（视觉 68）；Rendering-Audit [PR #39](https://github.com/rayw-lab/website/pull/39)。

## 定时器

`loop-cyber-city-orchestrate` · `sub_cb9b142d-6b8a-4ed1-acfb-4c74e29128a3` · 600s
