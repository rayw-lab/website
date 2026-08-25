# 工程编排看板：Full Entry 科技城 · Phase 0 波次制

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不写业务代码） |
| 执行模型 | **`claude-fable-5-thinking-xhigh`**（列表无 max，明示降级至此档） |
| 规格基线 | PRD v2.0 + SRD v2.0 + `cyber-city-implementation-plan.md` |
| 设计基线分支 | `cursor/cyber-city-hero-design-1d6f`（工程 Task 从此 tip 开分支） |
| 纪律 | 每 Task 开工前必读 PRD §2.6/§6.1 CITY + SRD §12.7；文件域互斥；波末强制审计 Task |

## 波次总览

```text
波 1（并行 ×4）→ 审计 A1
  CC-E1 车 ∥ CC-E3 城 ∥ CC-E5 机器人 ∥ CC-E10 用例骨架
波 2（并行 ×3）→ 审计 A2
  CC-E2 合流 ∥ CC-E4 霓虹 ∥ CC-E6 变形
波 3（并行 ×2）→ 审计 A3
  CC-E8 门禁 ∥ CC-E9 POI
波 4（原子）→ 审计 A4
  CC-E7 路由切换
```

## 波 1 状态

| ID | 分支 | 文件域 | 状态 | Agent |
|----|------|--------|------|-------|
| CC-E1 | `cursor/cc-e1-physics-vehicle-1d6f` | physics/VisualVehicle/Player/KinematicFallback | 🚀 running | [E1](bc-30db345e-5bf7-5461-ae70-e3d17156072b) |
| CC-E3 | `cursor/cc-e3-city-procedural-1d6f` | `city/*` + buildings JSON | 🚀 running | [E3](bc-22457f98-f1cb-5a4a-ba37-7705aaf339e7) |
| CC-E5 | `cursor/cc-e5-hero-robot-1d6f` | `public/models/hero-robot/` + HeroRobot.ts | 🚀 running | [E5](bc-6b35dde6-1fee-59f7-b5b8-f093f3b4a82c) |
| CC-E10 | `cursor/cc-e10-e2e-skeleton-1d6f` | e2e 世界剧本骨架 + checklist | 🚀 running | [E10](bc-f4696da3-72d6-5848-883b-275ad65207e6) |
| CC-A1 | （波 1 齐套后） | 只读审计四分支 diff vs PRD/SRD | ⏳ 待波 1 | — |

## 公共强制条款（写入每个 Task prompt）

1. 回复首行：`model: claude-fable-5-thinking-xhigh`
2. 开工前 Read：`docs/spec/PRD.md`（§2.6、§6.1 CITY、§7.4 Phase 0）+ `docs/spec/SRD.md`（§12.7 全章）+ 本 Task 相关 research 文档
3. 红线：禁 React/R3F/gsap/howler；vanilla three + TSL + Rapier
4. 资产不够 → 深度联网调研（GitHub/Quaternius/Kenney/Poly Haven），CC0/MIT 优先，登记台账
5. 独立分支、commit 含 Task ID、push、开 draft PR（base=`cursor/cyber-city-hero-design-1d6f` 或 `main` 以编排说明为准）
6. 不碰其他 Task 文件域；不提交无关 png/signoff 脏文件
7. 完成后在 `docs/research/cyber-city-eng-wave1-notes.md` 追加本 Task 一小节（验收命令输出摘要）

*波 1 启动于 2026-08-25。*
