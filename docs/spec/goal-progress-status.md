# 目标进度看板（Goal Progress）

> **目标**：Phase 1 MVP 门禁 + Phase A Spike 交付（鸟瞰图 + PRD/SRD v1.1.1）
> **更新**：2026-08-24

## 总判定

| 子目标 | 状态 | 证据 |
|--------|------|------|
| Phase A Spike（B1） | **已交付（Go with 真机帧率待补）** | `/world-spike/`、E2E 41/41、`world-spike-log.md` |
| Phase 1 MVP（A+D+C） | **进行中（约 55%）** | 见下表 |
| 目标整体 | **未完成** — Spike 已过，MVP 内容基建未过 Gate |

## 分支合并状态

| 项 | 状态 |
|----|------|
| `e2e-integration-report` → `bruno-implementation-plan` | ✅ 已合并（merge commit `93d1546`，零冲突——e2e 分支此前已换轨合并 `6e3ccd3` 基线，合并树与 e2e tip `7032673` 完全一致，无降级） |
| 合并后回归 | ✅ `pnpm test:e2e` 41/41 全绿（13.7m，world-spike 11 例实跑不 skip） |
| 推送 | ✅ `origin/cursor/bruno-implementation-plan-1d6f` @ `93d1546` |

`bruno-implementation-plan` 现为唯一集成基线：engine+vehicle 双实现、审计 F-1 整改、E2E 体系（30 站点用例 + 11 world-spike 用例）+ integration 报告全部在内。

## Phase A Spike 门禁核对

| 门禁项 | 要求 | 实测 | 判定 |
|--------|------|------|------|
| 路由 | `/world-spike/` noindex | sitemap 排除、meta robots | ✅ |
| 可驾驶 | CarConcept + WASD/摇杆 | E2E + 录屏 | ✅ |
| 懒加载 JS | ≤400KB gzip | ~283–301KB | ✅ |
| Spike 新增资产 | `public/world/` ≤1MB | 0 | ✅ |
| CarConcept | 复用豁免 3.5MB | 显式登记 | ✅ |
| 桌面 60fps / 安卓 30fps | 真机录测 | **仅 SwiftShader 软件渲染；真机待 Phase B 前补** | ⚠️ 条件通过 |
| E2E | 不 skip world | 41/41 | ✅ |

## Phase 1 MVP 缺口（阻塞 MVP Gate）

| 轨 | 项 | 状态 |
|----|-----|------|
| A3 | `src/content.config.ts` + 四集合 | ❌ 未建 |
| A3 | 案例 A 全文 + B/C 精简 | ❌ |
| A3 | Insights×2、ai-lab×2 | ❌ |
| A4 | About / Now / Contact | ❌ |
| A4 | RSS / sitemap / JSON-LD 全站 | 部分 |
| D3 | Lighthouse CI 真实断言 | ❌ 占位 |
| D5 | GoatCounter 接入 | ❌ 骨架仅有 facade 钩子 |
| 人工 | 10 秒定位测试 ≥80% | ❌ 未组织 |

## 已完成（可冻结为 Batch 1+2 基线）

- P0 文档 v1.1.1、Batch1 审计
- Track D：jekyll 删、ci.yml、check-links、audit-budget（含流式豁免）
- Track C2：Lab manifest/facade/modules
- Track A 部分：tokens、五区块首页、BaseLayout
- world-spike engine + vehicle 双实现合流
- Playwright E2E 体系 + integration 报告
- ~~合并 `e2e-integration-report` → `bruno-implementation-plan`~~ ✅ 完成（见「分支合并状态」）

## 下一批 Fable5 任务（编排中）

1. Content Collections + MVP 首批内容骨架
2. About/Now/Contact + RSS + GoatCounter
3. D3 Lighthouse CI 实装
4. MVP Gate 复测 + 更新本看板
