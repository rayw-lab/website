# 工程编排看板：Full Entry 科技城 · Phase 0 波次制

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排） |
| 模型 | `claude-fable-5-thinking-xhigh`（无 max） |
| 集成 tip | `f514a85`（波 1 四分支 + A1 已合入设计基线） |
| 审计裁决 | **放行**（`cyber-city-wave1-audit.md`） |

## 波 1 — ✅ 已合流

| ID | PR | 状态 |
|----|-----|------|
| E1 / E3 / E5 / E10 | #16 / #14 / #17 / #15 | ✅ merged → 设计基线 |
| A1 | #18 | ✅ 放行 |

## 波 2 — 🚀 派发中（A1 前提已满足）

合流执行项写入各 Task（审计 M1–M4）：
- M1 共享 `index.ts` / notes 按小节维护
- M2 VisualVehicle 落位以 E1 为准（`player/VisualVehicle.ts`）
- M3 出生锚点统一到 buildings JSON spawn (0,0)
- M4 `?vehicle=`/`?city=`/`?robot=` 临时接线转正（E2 壳页白名单）

| ID | 分支 | 状态 | Agent |
|----|------|------|-------|
| CC-E2 | `cursor/cc-e2-spike-merge-1d6f` | 🚀 | [E2](bc-6b4bd201-0d3c-5790-9df4-e3626b18a5da) |
| CC-E4 | `cursor/cc-e4-neon-visual-1d6f` | ✅ | [E4](bc-7d272a74-a4c6-56cb-bcd0-835ef0d67f44) |
| CC-E6 | `cursor/cc-e6-transform-reveal-1d6f` | ✅ | [E6](bc-8f8aa756-44ba-5809-a6b1-b0cdeaabe150) |
| CC-A2 | 波 2 齐套后审计 | ⏳ | — |

*波 2 启动于波 1 合流完成后。*
