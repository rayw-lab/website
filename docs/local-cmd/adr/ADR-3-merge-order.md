---
id: ADR-3
title: 合流序 —— 是否等 about-hall 合入再开工
status: accepted
date: 2026-09-04
decided_by: 磊哥（六点第 6 条「其他分支直接干先」）
---

# 决定

**不等 about-hall 合流**。`codex/nexus-hall-20260903` 自 about-hall 分支切出并独立推进；两厅在 main 上的合流序由 about-hall 先、nexus-hall 后。

# 冲突面与处置

| 面 | 冲突风险 | 处置 |
|---|---|---|
| `src/pages/world/[slug].astro` / `WorldHallLayout` | about-hall 正在建同一套壳 | nexus 复用其产物，**不在本分支重写**；若 about-hall 尚未落地则本分支临时自带最小壳，合流时以 about-hall 版为准 |
| `src/data/cyber-city-buildings.json` | 两厅都要加 `hallPath` | 加法字段、不同 building id，文本冲突可机械解 |
| `src/lab/world/areas/Areas.ts` | about-hall 的 W5 是单 writer | **本分支不碰**，nexus 进楼接线排在 about-hall 合入之后 |
| `docs/spec/SRD.md` | 各加一行 | 加法，合流时并列 |
| `e2e/` | 两套 spec 文件 | 文件名不同，无冲突 |

# 前置认知（防「merge ≠ 进现役」）

合流当天必须核：哪些常驻进程启动于合流之前（`ps -p <pid> -o lstart=` 对比合流 commit 时刻）。
本仓是静态站，主要风险在 **preview / dev server 服务旧 `dist/`** —— 本轮已实测踩过：
改了源码不 rebuild，探针读到的是旧产物；且 `astro preview` 检测到已有实例会 **SKIP 不起新端口**、只打 info 级日志。
合流后的验收一律：`pnpm build` → 重启 preview → 核**产物**里的新代码标记（注意页面 `<script>` 被打包成外部 `_astro/*.js`，grep 单个 `index.html` 必然 0 命中）。
