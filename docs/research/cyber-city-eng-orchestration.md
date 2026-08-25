# 工程编排看板：Full Entry 科技城 · Phase 0 波次制

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排） |
| 模型 | `claude-fable-5-thinking-xhigh` |
| 设计基线 tip | `9f0a923`（波2 已合流；M5–M8 冒烟绿） |
| 审计 | 波1 A1 **放行**；波2 A2 **有条件放行**（条件已在合流织合兑现） |

## 波 1 — ✅ 已合流

E1(#16) E3(#14) E5(#17) E10(#15) A1(#18)

## 波 2 — ✅ 已合流（E2→E4→E6 + A2）

| ID | 分支 | PR | Agent |
|----|------|-----|-------|
| CC-E2 | `cursor/cc-e2-spike-merge-1d6f` | #21 | [E2](bc-6b4bd201-0d3c-5790-9df4-e3626b18a5da) |
| CC-E4 | `cursor/cc-e4-neon-visual-1d6f` | #20 | [E4](bc-7d272a74-a4c6-56cb-bcd0-835ef0d67f44) |
| CC-E6 | `cursor/cc-e6-transform-reveal-1d6f` | #19 | [E6](bc-8f8aa756-44ba-5809-a6b1-b0cdeaabe150) |
| CC-A2 | `cursor/cc-a2-wave2-audit-1d6f` | #22 | [A2](bc-29b1f726-d13f-504e-a6b7-99c49fea7927) |

合流硬条件（A2 M5–M8）已在 E6 织合 commit 落地：ritual 跳过 `await revealed`、白名单 `ritual`/`quality`、Player Space=刹车∪`driving`、Reveal「Space/B 刹车 · F 悬挂跳」。

## 波 3 — 🟡 E8 完成 · 等 E9

| ID | 分支 | PR | Agent |
|----|------|-----|-------|
| CC-E8 | `cursor/cc-e8-ci-gates-1d6f` | — | [E8](bc-d91376b0-98e2-5977-9113-2f6f99fb158a) ✅ |
| CC-E9 | `cursor/cc-e9-poi-areas-1d6f` | — | [E9](bc-a5acf7bd-6424-5c2c-b54e-4ce4ab292ab1) |

文件域互斥：E8=`scripts/`+CI 配置+`manifest`（见任务书过渡纪律）；E9=`world/areas/`+`world-pois.json`+RayCursor。

## 下一拍

波 3 齐套 → CC-A3 审计 → 按序合流 → 波 4 CC-E7（`/` 世界壳 + `/home/` 平移；携带 M9 / targetHeight 回 9m）。

*更新于波3派发。*
