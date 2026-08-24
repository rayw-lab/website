# 目标进度看板（Goal Progress）

> **目标**：Phase 1 MVP 门禁 + Phase A Spike 交付（鸟瞰图 + PRD/SRD v1.1.1）
> **更新**：2026-08-24（增补 PR #12 检查线 D3 Lighthouse 实跑结果）

## 总判定

| 子目标 | 状态 | 证据 |
|--------|------|------|
| Phase A Spike（B1） | **已交付（Go with 真机帧率待补）** | `/world-spike/`、E2E 42/42（含 WS-PERF-01 帧率证据包）、`world-spike-log.md` |
| Phase 1 MVP（A+D+C） | **本机五门禁绿；CI D3 Lighthouse 红 2 项** | 见「MVP 门禁核对」逐项 + 「D3 Lighthouse CI 实跑」 |
| 目标整体 | **未完成** | 自动化缺口 ×1（D3 整改中）+ 人工 Gate ×2（待王磊） |

> **「目标整体」未完成的全部原因（1 项自动化 + 2 项人工）**：
>
> 1. **自动化 ×1**：D3 Lighthouse 在 PR #12 检查线实跑未过——`/lab/car-configurator/` a11y **0.93**（两轮一致）、`/lab/tts-cockpit/` perf **0.86**（波动项），阈值 0.95。本机五门禁（astro check / build / check-links / audit-budget / e2e）全绿。
> 2. **人工 ×2**：10 秒定位测试 ≥80%、真机帧率（桌面 60fps / 安卓中端 30fps）——不依赖代码改动，待王磊组织后回填。
>
> 此前版本记「MVP Gate 自动化：Go」系基于本机五门禁；D3 仅在 CI 执行，integration tip 推送后才获真实读数，本次据实回写。

## 分支合并状态

| 项 | 状态 |
|----|------|
| `e2e-integration-report`（D3 Lighthouse） → `bruno-implementation-plan`（A3+A4+D5） | ✅ 已合并为单一 integration tip（merge commit `28b8ea2`，零冲突——两侧自 merge base `7032673` 后改动文件集完全不相交） |
| 合并后全门禁复跑 | ✅ 五道自动化门禁全绿（见下「MVP 门禁核对」实测列） |
| 推送 | ✅ `origin/cursor/bruno-implementation-plan-1d6f` @ `28b8ea2` |

`bruno-implementation-plan` 现为唯一集成基线：engine+vehicle 双实现、审计 F-1 整改、E2E 体系（30 站点用例 + 11 world-spike 用例 + 1 帧率证据包用例）、A3 内容基建、A4 站点页面/RSS/JSON-LD/GoatCounter、D3 Lighthouse CI 真实门禁、D5 Lab 页 BaseLayout 接入，全部在内。

## Phase 1 MVP 门禁核对（integration tip `28b8ea2` 实测）

### 自动化门禁（本机复跑，2026-08-24）

- [x] `pnpm astro check` —— 94 文件，0 errors / 0 warnings
- [x] `pnpm build` —— 18 页全部构建成功（含 `/rss.xml`、`sitemap-index.xml`）
- [x] `node scripts/check-links.mjs dist/` —— 307 条内部引用全部有效，PENDING_ROUTES 白名单已清空（只收缩不降级），manifest 一致性 2 模块核对通过
- [x] `node scripts/audit-budget.mjs dist/` —— 首屏合计 33.4KB < 200KB 硬门禁；零 world 字节断言 14 页 0 命中；public/ 8.3MB / 40MB；资产格式黑名单 0 命中；Lab 模块预算（tts 流式豁免单文件 ≤60KB、懒加载 JS 实测≤声明）全过
- [x] `pnpm test:e2e` —— 42/42 全绿（12.4m；world-spike 11 例实跑不 skip + WS-PERF-01 帧率证据包，采样读数见 `world-spike-log.md` §3.1 首轮实测行）

### 交付项核对（原 MVP 缺口逐项清账）

- [x] A3：`src/content.config.ts` 四集合 schema（SRD §8.1 逐字段，securityGrade P2 门禁）
- [x] A3：案例 A 全 12 模块 canonical + B/C 精简版（`/work/` 及三详情页）
- [x] A3：Insights×2（`/insights/`）、AI Lab×2 含 world-spike 实验记录（`/ai-lab/`）
- [x] A4：About / Now / Contact 三页（ProfilePage JSON-LD、entries.json 单源、mailto 模板 + 防爬）
- [x] A4：RSS（insights ∪ ai-lab）/ sitemap / JSON-LD 全站（Person+WebSite+Breadcrumb+Article，`src/data/site.ts` 单源）
- [x] D3：Lighthouse CI 真实断言（`treosh/lighthouse-ci-action@v12`，首页+双 Lab 壳页移动端四项 ≥95 中位轮 error 断言，阈值/URL 单源 `lighthouserc.json`，无 continue-on-error；在 PR 检查线执行，即 main 合并线阻断）——门禁基建已交付；**实跑当前红**，见下「D3 Lighthouse CI 实跑」
- [x] D5：GoatCounter 接入（生产构建注入 count.js + SRD §9.5 事件委托）+ Lab 两 Demo 页接入 BaseLayout
- [ ] **人工**：10 秒定位测试 ≥80% —— 未组织，待王磊安排被试执行；执行脚本与记录表：`docs/spec/human-gate-checklist.md` §1
- [ ] **人工**：真机帧率（桌面 60fps / 安卓中端 30fps）—— CI 仅 SwiftShader 软件渲染，需真机录测；录测步骤与记录表：`docs/spec/human-gate-checklist.md` §2（CI 侧 WS-PERF-01 帧率证据包为辅助下界读数，`world-spike-log.md` §3.1）

### D3 Lighthouse CI 实跑（PR #12 检查线，2026-08-24）

「自动化门禁」一节为本机复跑；D3 Lighthouse 仅在 CI 检查线执行（每 URL 3 轮取中位、移动端预设、四项 ≥95 error 断言），integration tip 推送后实测：

| URL | 结果 | 报告 |
|---|---|---|
| `/`（首页） | ✅ 四项全过 | [中位轮报告](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1787603105846-51272.report.html) |
| `/lab/car-configurator/` | ❌ accessibility **0.93** < 0.95（两次运行一致，确定性失败） | [中位轮报告](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1787603106285-47552.report.html) |
| `/lab/tts-cockpit/` | ❌ performance **0.86** < 0.95（前一轮通过，波动敏感项） | [中位轮报告](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1787603106685-73688.report.html) |

- 运行记录：[CI run 32773520246](https://github.com/rayw-lab/website/actions/runs/32773520246)（job「门禁（check / build / links / budget / lighthouse）」，前四步全过、Lighthouse 步失败）；前一轮 [32772491665](https://github.com/rayw-lab/website/actions/runs/32772491665) 仅 car-configurator a11y 失败。
- 报告留存：上表为 action 临时公开存储链接（约 7 天有效）；长期以 run 页面的 workflow artifact（`lighthouse-results`）为准。仓库内无入库报告文件，阈值/URL 单源 [`lighthouserc.json`](../../lighthouserc.json)。
- **结论：D3 门禁当前为红，MVP Gate 自动化侧暂不能签署**（`mvp-gate-signoff.md` 待 D3 转绿后建档补签）。整改两项列入「下一批任务」。

## Phase A Spike 门禁核对

- [x] 路由：`/world-spike/` noindex（sitemap 排除、meta robots，E2E 断言）
- [x] 可驾驶：CarConcept + WASD/触屏摇杆（E2E + 录屏证据）
- [x] 懒加载 JS ≤400KB gzip（实测 ~283–301KB）
- [x] Spike 新增资产 `public/world/` ≤1MB（实测 0）
- [x] CarConcept 复用豁免 3.5MB（显式登记）
- [x] E2E 不 skip world（42/42，world-spike 11 例实跑 + WS-PERF-01 帧率证据包殿后独占采样）
- [ ] **人工**：桌面 60fps / 安卓 30fps 真机录测 —— CI 环境仅 SwiftShader，Phase B 前补（执行脚本：`human-gate-checklist.md` §2；CI 常驻辅助证据：WS-PERF-01）

## Gate 结论

**MVP Gate：暂不签署——自动化侧差 D3 Lighthouse 一项（CI 实跑红），人工侧差 2 项（待王磊）。**

本机五门禁（astro check / build / check-links / audit-budget / e2e）在 integration tip `28b8ea2` 上全部通过，白名单全清空、无任何降级；但 D3 Lighthouse 在 PR #12 检查线实跑未过（car-configurator a11y 0.93、tts-cockpit perf 0.86），自动化侧签署待 D3 整改转绿后补写 `mvp-gate-signoff.md`。两项人工验证（10 秒定位测试 ≥80%、真机帧率）与代码整改互不阻塞，由王磊组织后回填本看板。

### 证据索引

- Lighthouse 报告：见「D3 Lighthouse CI 实跑」表内链接（CI 产物；仓库内无入库报告文件）。
- 人工 Gate 清单：[`docs/spec/human-gate-checklist.md`](human-gate-checklist.md) 已建档——10 秒定位测试脚本与记录表（§1）、真机帧率录测步骤与记录表（§2）、王磊签字与回填动作清单（§3/§4）；两项人工验证按该清单执行并回填本看板。
- 帧率自动化辅助证据：WS-PERF-01（`e2e/world-spike-perf.spec.ts`，测试计划 §5.8）——每次全量 e2e 留档 SwiftShader 下界读数 + 帧间隔分布，软门禁失败记 OBS 不阻断；设计与证据落点见 `world-spike-log.md` §3.1。

## 已完成（冻结为 Batch 1+2+3 基线）

- P0 文档 v1.1.1、Batch1 审计
- Track D：jekyll 删、ci.yml、check-links、audit-budget（含流式豁免）、D3 Lighthouse 真实门禁
- Track C2：Lab manifest/facade/modules；D5 Lab 页 BaseLayout 接入
- Track A：tokens、五区块首页、BaseLayout、A3 内容基建、A4 About/Now/Contact + RSS + JSON-LD + GoatCounter
- world-spike engine + vehicle 双实现合流
- Playwright E2E 体系 + integration 报告
- 合并收口：`e2e-integration-report` ∪ `bruno-implementation-plan` → 单一 integration tip `28b8ea2`

## 下一批任务（编排中）

1. D3 整改：`/lab/car-configurator/` accessibility 0.93 → ≥0.95（确定性失败，按报告逐项修）
2. D3 整改：`/lab/tts-cockpit/` performance 0.86 → ≥0.95（波动敏感，修后需连续两轮 CI 绿确认）
3. D3 转绿后：建 `docs/spec/mvp-gate-signoff.md`，补自动化侧签署（人工签署区留空待王磊）
4. 人工 Gate：10 秒定位测试（≥80%）组织与记录——按 `human-gate-checklist.md` §1 执行
5. 人工 Gate：真机帧率录测（桌面 60fps / 安卓中端 30fps）——按 `human-gate-checklist.md` §2 执行
6. 上述全部回填后，本看板「目标整体」翻绿为完整 Go
