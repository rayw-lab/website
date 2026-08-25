# 目标进度看板（Goal Progress）

> **目标**：Phase 1 MVP 门禁 + Phase A Spike 交付
> **更新**：2026-08-25 · `main` @ `17d5a0d`

## 总判定

| 子目标 | 状态 | 证据 |
|--------|------|------|
| Phase 1 MVP（A+D+C） | **Go** | CI 全绿、Pages 上线、签署档自动化 |
| Phase A Spike（B1） | **Go** | `/world-spike/` 公开可驾驶、E2E 42/42 |
| **目标整体** | **Go** | 见下「人工 Gate 裁决」 |

## 生产站点

| URL | 说明 |
|---|---|
| https://rayw-lab.github.io/website/ | 首页（Hero「进入 3D 试验场」+ Lab 三卡） |
| https://rayw-lab.github.io/website/world-spike/ | 3D 试验场（index,follow，可驾驶） |
| https://rayw-lab.github.io/website/lab/ | Lab 索引（含试验场入口） |

## 人工 Gate 裁决（2026-08-25）

产品负责人指令：**不执行人工 Gate 流程**（10 秒定位 / 真机 60/30fps 录测）。

| 项 | 裁决 |
|---|---|
| H1–H3 人工签署 | **豁免**（产品决策，非门禁降级） |
| Spike 帧率 | E2E WS-PERF-01 自动化辅助证据 + 真机可自测于生产 URL |
| 后续 | Phase B 前可按需补测，不阻塞当前 Goal |

## 关键交付

- [x] PR #12 合并 `main`，Hybrid MVP 全量上线
- [x] `17d5a0d`：world-spike 公开入口（Hero + Lab 卡 + sitemap）
- [x] 自动化五门禁 + D3 Lighthouse + E2E 42/42
- [x] Spike：CarConcept 可驾驶、双后端、触屏摇杆

## 下一阶段（非本 Goal）

Phase B：`/world/` 转正、六分区 POI、folio Areas 移植（见 `folio-gap-and-reuse-report.md`）
