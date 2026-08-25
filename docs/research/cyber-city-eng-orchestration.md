# 工程编排看板：Full Entry 科技城 · Phase 0 波次制

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不写业务代码） |
| 执行模型 | **`claude-fable-5-thinking-xhigh`**（列表无 max） |
| 规格基线 | PRD v2.0 + SRD v2.0 + `cyber-city-implementation-plan.md` |
| 设计基线分支 | `cursor/cyber-city-hero-design-1d6f` |
| 纪律 | 每 Task 开工前必读 PRD/SRD；文件域互斥；波末强制审计 |

## 波 1 状态 — ✅ 齐套（2026-08-25）

| ID | 分支 | PR | 状态 | Agent |
|----|------|-----|------|-------|
| CC-E1 | `cursor/cc-e1-physics-vehicle-1d6f` | #16 | ✅ | [E1](bc-30db345e-5bf7-5461-ae70-e3d17156072b) |
| CC-E3 | `cursor/cc-e3-city-procedural-1d6f` | #14 | ✅ | [E3](bc-22457f98-f1cb-5a4a-ba37-7705aaf339e7) |
| CC-E5 | `cursor/cc-e5-hero-robot-1d6f` | #17 | ✅ | [E5](bc-6b35dde6-1fee-59f7-b5b8-f093f3b4a82c) |
| CC-E10 | `cursor/cc-e10-e2e-skeleton-1d6f` | #15 | ✅ | [E10](bc-f4696da3-72d6-5848-883b-275ad65207e6) |
| CC-A1 | `cursor/cc-a1-wave1-audit-1d6f` | — | 🚀 派发中 | — |

## 波次总览

```text
波 1（并行 ×4）✅ → 审计 A1 🚀
波 2（并行 ×3）⏳ E2∥E4∥E6（A1 通过后）
波 3（并行 ×2）⏳ E8∥E9
波 4（原子）   ⏳ E7 路由切换
```

*更新于波 1 齐套。*
