# 目标进度看板（Goal Progress）

> **目标**：Phase 1 MVP 门禁 + Phase A Spike 交付（鸟瞰图 + PRD/SRD v1.1.1）
> **更新**：2026-08-24 · integration tip `96c1314`

## 总判定

| 子目标 | 状态 | 证据 |
|--------|------|------|
| Phase A Spike（B1） | **已交付（Go with 真机帧率待补）** | `/world-spike/`、E2E 42/42（含 WS-PERF-01）、`world-spike-log.md` |
| Phase 1 MVP（A+D+C） | **本机五门禁 + 本地 LHCI 全绿；CI D3 待终态** | 见「MVP 门禁核对」+ [`mvp-gate-signoff.md`](mvp-gate-signoff.md) |
| 目标整体 | **未完成** | 人工 Gate ×2（待王磊）+ D3 CI 终态确认 |

> **「目标整体」未完成的全部原因（1 项 CI 确认 + 2 项人工）**：
>
> 1. **CI 确认 ×1**：D3 Lighthouse 在 `9451def` 已本地六 URL 全绿并修复 CI 曾红的 a11y/perf 项；`96c1314` push 后 CI run [#32777109888](https://github.com/rayw-lab/website/actions/runs/32777109888) 进行中，待转绿后自动化侧可最终签署。
> 2. **人工 ×2**：10 秒定位测试 ≥80%、真机帧率（桌面 60fps / 安卓中端 30fps）——按 [`human-gate-checklist.md`](human-gate-checklist.md) 执行，待王磊回填。

## 分支合并状态

| 项 | 状态 |
|----|------|
| 集成基线 | `cursor/bruno-implementation-plan-1d6f` @ `96c1314` |
| 推送 | ✅ `origin/cursor/bruno-implementation-plan-1d6f` |
| PR | [#12](https://github.com/rayw-lab/website/pull/12)（草稿） |

`bruno-implementation-plan` 为唯一集成基线：engine+vehicle 双实现、审计 F-1 整改、E2E 42/42、A3/A4/D5、D3 Lighthouse 六 URL、Lighthouse 对比度/perf 修复，全部在内。

## Phase 1 MVP 门禁核对（tip `96c1314` 实测）

### 自动化门禁（本机复跑，2026-08-24）

- [x] `pnpm astro check` —— 96 文件，0 errors / 0 warnings
- [x] `pnpm build` —— 18 页全部构建成功
- [x] `node scripts/check-links.mjs dist/` —— 307 条内部引用全部有效，PENDING_ROUTES 白名单已清空
- [x] `node scripts/audit-budget.mjs dist/` —— 首屏 33.4KB；阻断级全过
- [x] `pnpm test:e2e` —— 42/42 全绿（world-spike 11 例 + WS-PERF-01）
- [x] **本地 LHCI** —— 六 URL 四项 ≥0.95（见 [`lighthouse-mvp-gate-report.md`](lighthouse-mvp-gate-report.md)）
- [ ] **CI D3** —— `96c1314` run 进行中；历史红项（car-config a11y 0.93 / tts perf 0.86）已在 `9451def` 修复

### 交付项核对

- [x] A3：四集合 + 案例 A/B/C + Insights×2 + AI Lab×2
- [x] A4：About/Now/Contact + RSS + JSON-LD + GoatCounter
- [x] D3：Lighthouse CI 基建 + 六 URL 配置 + 达标修复
- [x] D5：Lab BaseLayout + 30 秒结论区
- [ ] **人工**：10 秒定位测试 ≥80% —— `human-gate-checklist.md` §1
- [ ] **人工**：真机帧率 —— `human-gate-checklist.md` §2

### D3 Lighthouse 轨迹

| 阶段 | commit | 结果 |
|---|---|---|
| 首轮 CI（扩展 URL 前） | `28b8ea2` 前后 | ❌ car-config a11y 0.93、tts perf 0.86 |
| 本地修复 + autorun | `9451def` | ✅ 六 URL 全绿 |
| 报告入库 | `96c1314` | [`lighthouse-mvp-gate-report.md`](lighthouse-mvp-gate-report.md) |
| CI 回归 | `96c1314` | ⏳ run [#32777109888](https://github.com/rayw-lab/website/actions/runs/32777109888) |

## Phase A Spike 门禁核对

- [x] 路由 `/world-spike/` noindex
- [x] 可驾驶 CarConcept + WASD/触屏
- [x] 预算门禁（JS gzip、资产、E2E）
- [ ] **人工**：桌面 60fps / 安卓 30fps —— `human-gate-checklist.md` §2

## Gate 结论

**MVP Gate：自动化侧本机 Go + 签署档已建（[`mvp-gate-signoff.md`](mvp-gate-signoff.md)），待 CI D3 终态确认；人工侧差 2 项。**

本机五门禁 + 本地 LHCI 在 `96c1314` 全部通过；D3 CI 待最新 push 转绿后补签自动化终态。两项人工验证由王磊组织后回填签署档 §人工签署区。

### 证据索引

- Lighthouse：[`lighthouse-mvp-gate-report.md`](lighthouse-mvp-gate-report.md)
- 签署档：[`mvp-gate-signoff.md`](mvp-gate-signoff.md)
- 人工 Gate：[`human-gate-checklist.md`](human-gate-checklist.md)
- 帧率辅助：WS-PERF-01 · `world-spike-log.md` §3.1

## 已完成（冻结基线）

- P0 文档 v1.1.1、Batch1 审计、folio 差距报告
- Track D/A/C2 + A3/A4/D5 全交付
- world-spike 双实现合流 + E2E 体系
- Lighthouse 六 URL 达标修复

## 下一批任务

1. ⏳ 确认 CI D3 转绿 → 更新 `mvp-gate-signoff.md` D3 行为 ✅
2. 人工 Gate H1–H3（王磊）
3. 全部回填后「目标整体」翻绿；可选合并 main → Phase B
