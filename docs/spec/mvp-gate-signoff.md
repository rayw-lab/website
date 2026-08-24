# Phase 1 MVP Gate 签署（自动化侧）

> **分支**：`cursor/bruno-implementation-plan-1d6f` · integration tip `54a8450`
> **规格**：`docs/spec/implementation-roadmap-birdseye.md` Phase 1 MVP Gate · PRD/SRD v1.1.1
> **签署日期**：2026-08-24（自动化侧；人工签署区待王磊）

## 总判定

| 侧 | 判定 | 说明 |
|---|---|---|
| **自动化门禁** | **Go** | 本机五门禁 + 本地/CI LHCI 六 URL 全绿（CI run #32777408128） |
| **人工门禁** | **未签署** | 10 秒定位测试 ≥80%、真机帧率（桌面 60fps / 安卓中端 30fps） |
| **MVP Gate 整体** | **未完成** | 人工两项未回填前不得合并 main |

## 自动化门禁签署（逐项）

| # | 门禁 | 阈值 / 口径 | 证据 | 结果 |
|---|---|---|---|---|
| 1 | `pnpm astro check` | 0 errors / 0 warnings | 本机复跑 2026-08-24，96 文件 | ✅ |
| 2 | `pnpm build` | 全页构建成功 | 18 页（含 `/rss.xml`、`sitemap-index.xml`） | ✅ |
| 3 | `check-links` | 内部引用有效；PENDING_ROUTES 白名单清空 | 307 条引用；manifest 2 模块一致 | ✅ |
| 4 | `audit-budget` | 首屏 <200KB；零 world 字节；Lab 预算 | 首屏 33.4KB；阻断级全过 | ✅ |
| 5 | `pnpm test:e2e` | 全绿；world-spike 不 skip | **42/42**（`9200112` 复跑 13.9m，含 WS-PERF-01） | ✅ |
| 6 | D3 Lighthouse CI | 六 URL × 四项 ≥0.95；移动端；3 轮中位 | 本地 + CI 全绿（见 `lighthouse-mvp-gate-report.md`） | ✅ |

### D3 Lighthouse

- **配置单源**：`lighthouserc.json`（6 URL，无豁免、无 continue-on-error）
- **本地 autorun**（`9451def` 修复后）：六 URL 四项全过；报告见 [`lighthouse-mvp-gate-report.md`](lighthouse-mvp-gate-report.md)
- **CI 历史**：`28b8ea2` 时红（car-config a11y 0.93、tts perf 0.86）；`9451def` 修复后本地全绿
- **CI 回归**：✅ [#32777408128](https://github.com/rayw-lab/website/actions/runs/32777408128)（`d34e6e5`）、[#32777899280](https://github.com/rayw-lab/website/actions/runs/32777899280)（`9200112`）

## 交付项签署（A3 / A4 / D5）

| 项 | 结果 |
|---|---|
| A3 四集合 + 案例 A/B/C + Insights×2 + AI Lab×2 | ✅ |
| A4 About/Now/Contact + RSS + JSON-LD + GoatCounter | ✅ |
| D5 Lab 页 BaseLayout + 30 秒结论区 | ✅ |
| Track C2 manifest/facade + 两 Demo 迁入 | ✅ |
| Track D ci.yml + check-links + audit-budget | ✅ |

## Phase A Spike 签署（B1）

| 项 | 结果 |
|---|---|
| `/world-spike/` noindex、可驾驶 CarConcept | ✅ |
| 懒加载 JS ≤400KB gzip；Spike 资产 ≤1MB | ✅ |
| E2E world-spike 11 例 + WS-PERF-01 | ✅ |
| 真机 60/30fps | ⏳ 人工（`human-gate-checklist.md` §2） |

## 人工签署区（王磊）

> 按 [`human-gate-checklist.md`](human-gate-checklist.md) 执行并在此回填。

| # | 项目 | 门禁 | 执行日期 | 结果 | 签字 |
|---|---|---|---|---|---|
| H1 | 10 秒定位测试 | ≥80% 被试达标 | — | 未执行 | — |
| H2 | 桌面真机帧率 | 20s 驾驶 ≥60fps 体感 | — | 未执行 | — |
| H3 | 安卓中端帧率 | 60s 驾驶 ≥30fps 体感 | — | 未执行 | — |

## 签署声明

- **自动化签署人**：Cursor Cloud Agent（Fable5 编排）
- **声明**：除人工 Gate H1–H3 外，Phase 1 MVP 自动化交付项与本机五门禁均已达标；未对 PRD/SRD 阈值做任何降级或豁免扩张。
- **阻塞合并**：H1–H3 未完成前，MVP Gate 整体不得标为 Complete。
