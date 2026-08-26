# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 渲染架构 | `docs/research/cyber-city-rendering-architecture-audit.md` |
| 生产 tip | `main` @ Loop 4 合入后（综合 **92.0**，视觉独立 **68**） |
| 目标 | 综合 ≥85 ✅ · 视觉独立 ≥68 ✅ |

## Loop 4 — ✅ B5 运镜 + AL4 放行

| ID | 分支 | 状态 |
|----|------|------|
| CC-L4-B5 | `cursor/cc-l4-b5-transform-camera-1d6f` | ✅ 自评 68 |
| CC-AL4 | `cursor/cc-al4-loop4-audit-1d6f` | ✅ 独立 **68**；三门全过；见 `loop4-audit.md` |

## 专项审视

| ID | 分支 | 状态 |
|----|------|------|
| CC-Rendering-Audit | `cursor/cc-rendering-arch-audit-1d6f` · [PR #39](https://github.com/rayw-lab/website/pull/39) | ✅ 后处理+bloom+TSL 全量清单 |

## Loop 5+ 前瞻

| 主题 | 说明 |
|------|------|
| V4 密度 / Tier C | 程序化上限复评后裁决 |
| Tone mapping | ACES/AgX 须整表重校 emissive 台账 |
| Blender 实模 | 独立专项，不进常规 Loop |

## Loop 编排定时器

`loop-cyber-city-orchestrate` · `sub_cb9b142d-6b8a-4ed1-acfb-4c74e29128a3` · 600s
