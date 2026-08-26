# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 生产 tip | `main` @ `70396eb`（Loop 3 全链已合入；综合 **91.5**，视觉独立 **66**） |
| Loop 3 目标 | 视觉独立 ≥68 — **NO-GO**（见 `cyber-city-loop3-audit.md`） |
| Loop 4 目标 | B5 变形运镜单主题 → 复评是否过 68 |

## 综合分口径

见 `scripts/score-loop.mjs` 与下文权重 25/15/20/25/15。三道门：|Δ|≤5、≥62、≥68（终审硬门）。

## Loop 0–2 摘要

| Loop | 综合 | 视觉独立 | 裁决 |
|------|------|----------|------|
| L0 | 87.2 | 49–51 | AL0 有条件放行 |
| L1 | 89.2 | 57 | AL1 放行 |
| L2 | 91.0 | 64 | AL2 放行 |

## Loop 3 — ⛔ 终审 NO-GO（综合 91.5 不能盖视觉门）

| ID | 状态 |
|----|------|
| B2C+poster → AL3-B2C | ✅ 独立 65 |
| ATM → AL3-MID | ✅ 独立 66；开 B3 |
| B3 → AL3-B3 | ✅ 独立仍 66；B5 HOLD |
| POSTER → AL3 | ⛔ 独立 **66**；三门 Δ1✅ ≥62✅ **≥68❌** |

## Loop 4 — 🚀 B5 运镜单主题（AL3 建议）

| ID | 分支 | 任务 | Agent | 状态 |
|----|------|------|-------|------|
| CC-L4-B5 | `cursor/cc-l4-b5-transform-camera-1d6f` | 充能推镜+落地微震+5–10s录屏 | Fable5 xhigh | 🚀 下一 tick 派发 |
| CC-AL4 | `cursor/cc-al4-loop4-audit-1d6f` | 复评 ≥68 | gpt-5.6-sol-xhigh-fast | 待 L4 |

## Loop 编排定时器

| 项 | 内容 |
|----|------|
| 订阅名 | `loop-cyber-city-orchestrate` |
| subscriptionId | `sub_cb9b142d-6b8a-4ed1-acfb-4c74e29128a3` |
| 间隔 | **600s（10min）** |
| tick 职责 | fetch 分支/PR → 过门派 Task → 合流 main → 更新本看板 |
