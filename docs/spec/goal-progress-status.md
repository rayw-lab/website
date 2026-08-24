# 目标进度看板（Goal Progress）

> **目标**：Phase 1 MVP 门禁 + Phase A Spike 交付（鸟瞰图 + PRD/SRD v1.1.1）
> **更新**：2026-08-24（integration tip `28b8ea2` 全门禁复跑后）

## 总判定

| 子目标 | 状态 | 证据 |
|--------|------|------|
| Phase A Spike（B1） | **已交付（Go with 真机帧率待补）** | `/world-spike/`、E2E 41/41、`world-spike-log.md` |
| Phase 1 MVP（A+D+C） | **自动化门禁全绿** | 见「MVP 门禁核对」逐项 |
| 目标整体 | **MVP Gate 自动化：Go；人工 Gate：待王磊**（10 秒定位测试 + 真机帧率两项人工验证） |

## 分支合并状态

| 项 | 状态 |
|----|------|
| `e2e-integration-report`（D3 Lighthouse） → `bruno-implementation-plan`（A3+A4+D5） | ✅ 已合并为单一 integration tip（merge commit `28b8ea2`，零冲突——两侧自 merge base `7032673` 后改动文件集完全不相交） |
| 合并后全门禁复跑 | ✅ 五道自动化门禁全绿（见下「MVP 门禁核对」实测列） |
| 推送 | ✅ `origin/cursor/bruno-implementation-plan-1d6f` @ `28b8ea2` |

`bruno-implementation-plan` 现为唯一集成基线：engine+vehicle 双实现、审计 F-1 整改、E2E 体系（30 站点用例 + 11 world-spike 用例）、A3 内容基建、A4 站点页面/RSS/JSON-LD/GoatCounter、D3 Lighthouse CI 真实门禁、D5 Lab 页 BaseLayout 接入，全部在内。

## Phase 1 MVP 门禁核对（integration tip `28b8ea2` 实测）

### 自动化门禁（本机复跑，2026-08-24）

- [x] `pnpm astro check` —— 94 文件，0 errors / 0 warnings
- [x] `pnpm build` —— 18 页全部构建成功（含 `/rss.xml`、`sitemap-index.xml`）
- [x] `node scripts/check-links.mjs dist/` —— 307 条内部引用全部有效，PENDING_ROUTES 白名单已清空（只收缩不降级），manifest 一致性 2 模块核对通过
- [x] `node scripts/audit-budget.mjs dist/` —— 首屏合计 33.4KB < 200KB 硬门禁；零 world 字节断言 14 页 0 命中；public/ 8.3MB / 40MB；资产格式黑名单 0 命中；Lab 模块预算（tts 流式豁免单文件 ≤60KB、懒加载 JS 实测≤声明）全过
- [x] `pnpm test:e2e` —— 41/41 全绿（8.6m；world-spike 11 例实跑不 skip）

### 交付项核对（原 MVP 缺口逐项清账）

- [x] A3：`src/content.config.ts` 四集合 schema（SRD §8.1 逐字段，securityGrade P2 门禁）
- [x] A3：案例 A 全 12 模块 canonical + B/C 精简版（`/work/` 及三详情页）
- [x] A3：Insights×2（`/insights/`）、AI Lab×2 含 world-spike 实验记录（`/ai-lab/`）
- [x] A4：About / Now / Contact 三页（ProfilePage JSON-LD、entries.json 单源、mailto 模板 + 防爬）
- [x] A4：RSS（insights ∪ ai-lab）/ sitemap / JSON-LD 全站（Person+WebSite+Breadcrumb+Article，`src/data/site.ts` 单源）
- [x] D3：Lighthouse CI 真实断言（`treosh/lighthouse-ci-action@v12`，首页+双 Lab 壳页移动端四项 ≥95 中位轮 error 断言，阈值/URL 单源 `lighthouserc.json`，无 continue-on-error；在 PR 检查线执行，即 main 合并线阻断）
- [x] D5：GoatCounter 接入（生产构建注入 count.js + SRD §9.5 事件委托）+ Lab 两 Demo 页接入 BaseLayout
- [ ] **人工**：10 秒定位测试 ≥80% —— 未组织，待王磊安排被试执行
- [ ] **人工**：真机帧率（桌面 60fps / 安卓中端 30fps）—— CI 仅 SwiftShader 软件渲染，需真机录测

## Phase A Spike 门禁核对

- [x] 路由：`/world-spike/` noindex（sitemap 排除、meta robots，E2E 断言）
- [x] 可驾驶：CarConcept + WASD/触屏摇杆（E2E + 录屏证据）
- [x] 懒加载 JS ≤400KB gzip（实测 ~283–301KB）
- [x] Spike 新增资产 `public/world/` ≤1MB（实测 0）
- [x] CarConcept 复用豁免 3.5MB（显式登记）
- [x] E2E 不 skip world（41/41，world-spike 11 例实跑）
- [ ] **人工**：桌面 60fps / 安卓 30fps 真机录测 —— CI 环境仅 SwiftShader，Phase B 前补

## Gate 结论

**MVP Gate 自动化：Go；人工 Gate：待王磊。**

自动化五门禁（astro check / build / check-links / audit-budget / e2e）在 integration tip `28b8ea2` 上全部通过，白名单全清空、无任何降级。剩余两项人工验证（10 秒定位测试 ≥80%、真机帧率）不阻塞自动化线合入，由王磊组织后回填本看板。

## 已完成（冻结为 Batch 1+2+3 基线）

- P0 文档 v1.1.1、Batch1 审计
- Track D：jekyll 删、ci.yml、check-links、audit-budget（含流式豁免）、D3 Lighthouse 真实门禁
- Track C2：Lab manifest/facade/modules；D5 Lab 页 BaseLayout 接入
- Track A：tokens、五区块首页、BaseLayout、A3 内容基建、A4 About/Now/Contact + RSS + JSON-LD + GoatCounter
- world-spike engine + vehicle 双实现合流
- Playwright E2E 体系 + integration 报告
- 合并收口：`e2e-integration-report` ∪ `bruno-implementation-plan` → 单一 integration tip `28b8ea2`

## 下一批任务（编排中）

1. 人工 Gate：10 秒定位测试（≥80%）组织与记录
2. 人工 Gate：真机帧率录测（桌面 60fps / 安卓中端 30fps）
3. 两项人工验证回填后，本看板「目标整体」翻绿为完整 Go
