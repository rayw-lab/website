# AH-W5 RECEIPT · 城市联动（arrival-snapshot + Areas 单 writer）

- date: 2026-09-02
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- branch: `codex/about-hall-20260902` @ `fc87fa2`（本单未 commit / 未 push）
- write root: 仅本单列出的文件；未占 4321

## 交付

| 路径 | 动作 |
|---|---|
| `src/lab/world/arrival-snapshot.ts` | 新建。`snapshotArrival(building, deps)` 同步写 `sessionStorage['world-arrival-v1']` |
| `src/lab/world/areas/Areas.ts` | 仅 `navigate` 闭包：先 snapshot 后 `assign(base + (hallPath ?? deepLink) + '?from=city&poi=' + id)` |
| `e2e/about-hall.spec.ts` | 追加 1 例：有卡（`addInitScript` 注入快照 + 直开展厅 query） |
| `evidence/about-hall/W5/RECEIPT.md` | 本文件 |

**no-touch 核过**：未改 `PoiArrival.ts`、`HallChrome.astro`、`BaseLayout.astro`、`playwright.config.ts`、其余 e2e。`src/pages/**` 本单零改（盘上 `about/index.astro` 有他单在途 diff，mtime 晚于本单，非本 writer）。

## 契约要点（ADR-2 §1–§3 / §8）

- 必填：`v=1`、`poi`、`sessionId`、`t`（dump 末条事件 t，否则 0）、`exploreN`（`localStorage['world-explore-v1']` 合法 id 去重计数）、`exploreTotal`（`poiIds.length`，不写死 12）、`wroteAt=Date.now()`
- 可选有则写、无则省略键、禁止 null：`maxKmh`（`world-speedtrap.kmh` 取 max）、`coneHits` / `respawns` / `poiEnters`（来自 dump.counters）
- 禁止进快照：楼名、`neonColor`、`events[]`、`env`、`speedDemon`
- 存储不可用 `try/catch` 静默；禁止 localStorage 抄驾驶卡
- `world-poi` 事件仍在 `arrival.begin` 之前；前奏中断不写快照（snapshot 在 `navigate` 闭包内）
- DOM 楼宇快览 / noscript 仍用 `deepLink`（本单未碰）

## `git diff --stat`（本单文件）

```
 e2e/about-hall.spec.ts                    |  28 ++++++++++++++++++++++++++++
 src/lab/world/areas/Areas.ts              |  13 ++++++++++++-
 src/lab/world/arrival-snapshot.ts         | 114 +++++++++++++++++++++++++（untracked 新建）
 3 files changed, 154 insertions(+), 1 deletion(-)
```

`evidence/about-hall/GATE.json` 被 `about-hall-gate.mjs` 重写（脚本既定副作用，generatedAt `2026-09-02T16:38:58.173Z`）。

## `pnpm exec astro check`

```
Result (171 files):
- 0 errors
- 0 warnings
- 59 hints
```

exit 0。hints 为既有 `content.config.ts` zod deprecation / `is:inline` / `execCommand`；本单三个文件 0 诊断。

## `pnpm build`

```
generating static routes
  ├─ /world/about-pavilion/index.html (+1ms)
  ...
[build] 20 page(s) built in 852ms
[build] Complete!
```

exit 0。未知 slug 未生成。

## `node scripts/about-hall-gate.mjs dist/`

```
G-Hall 门（ADR-2 §7，about-hall-gate.mjs）
ID          STATUS            DETAIL
----------------------------------------------------------------------------------------
G-Hall-1    PASS              dist/world/about-pavilion/index.html 存在；sitemap sitemap-0.xml；未知 slug 无产物（built=about-pavilion）
G-Hall-2    PASS              扫描 1 个文件（HTML + 静态 JS），零 lab/world / initAllLabFacades / mountWorld（未用 _astro/world. 文件名）
G-Hall-3    PASS              零 rapier / @dimforge / .wasm
G-Hall-4    PASS              零 three/webgpu / WebGPURenderer / MeshStandardNodeMaterial
G-Hall-5    PASS              零 <script> / preload 指向 public/models/** 或 hero-robot / concept-garage / autodrive
G-Hall-6    PASS              Hall-0 额外 JS = 0（无 <script src> / modulepreload；只用 BaseLayout 已有内联）
G-Hall-7    PASS              1 条 hallPath 均对应 dist 页（deepLink 仍由 check-links 核）
G-Hall-8    PASS              1 条媒体对账通过（sha256/字节/fps/无音轨/时长）；总载荷 41678B ≤ 2.5MB
G-Hall-9    PASS              8 个 data-scene 均有 data-bind，其中 URL 在 dist 可解析
----------------------------------------------------------------------------------------
FAIL 0 · WARN 0 · SKIPPED_NO_MEDIA 0 · 写出 evidence/about-hall/GATE.json
✔ G-Hall-1..9 无 FAIL
```

exit 0。G-Hall-2 仍绿：展厅 HTML 不 import `src/lab/world/**`；`arrival-snapshot.ts` 只进世界引擎 Areas 分包。

## e2e

任务命令：

```
env -u CI E2E_PORT=4615 pnpm exec playwright test e2e/about-hall.spec.ts --project=desktop-chromium --workers=1 --retries=0
```

Astro 7 preview 单例已被 PID 93051 占在 **4612**（本 worktree 他单）。直接 `pnpm preview --port 4615` 报 `Another astro preview server is already running` 后退出。按 W3a 先例在 **4615** 起 dist 静态服务（`/website` 前缀，与 preview 同构）；Playwright `reuseExistingServer` 吃到 4615。测完已杀，4615 空闲。未占 4321。未杀 4612。

```
Running 7 tests using 1 worker

  ✓  1 [desktop-chromium] › e2e/about-hall.spec.ts:10:3 › About Hall 到达条 › 无 query：200，H1 含「架桥」，到达条 hidden (346ms)
  ✓  2 [desktop-chromium] › e2e/about-hall.spec.ts:20:3 › About Hall 到达条 › ?from=city&poi=about-pavilion：到达条可见且含「个人档案馆」与「返回科技城」 (215ms)
  ✓  3 [desktop-chromium] › e2e/about-hall.spec.ts:31:3 › About Hall 到达条 › 有卡：world-arrival-v1 的 poi 匹配 → 到达条含「探索」与楼名 (210ms)
  ✓  4 [desktop-chromium] › e2e/about-hall.spec.ts:59:3 › About Hall 到达条 › ?from=city&poi=not-a-building：到达条 hidden (211ms)
  ✓  5 [desktop-chromium] › e2e/about-hall.spec.ts:68:3 › About Hall reduced-motion › prefers-reduced-motion：无正在运行的 CSS animation (196ms)
  ✓  6 [desktop-chromium] › e2e/about-hall.spec.ts:97:3 › About Hall 无 JS › 禁用 JS：首屏 H1 与 poster <img> 可见 (222ms)
  ✓  7 [desktop-chromium] › e2e/about-hall.spec.ts:110:3 › About Hall 未知 slug › 未知 slug 404 (48ms)

  7 passed (1.9s)
```

exit 0。有卡例走 `page.addInitScript` 注入匹配 `poi=about-pavilion` 的 `world-arrival-v1`（world-chromium 进楼 helper 是 3D 独占挂载，不复用进 desktop-chromium）。

## 未做 / 他单在途

- 未 commit / 未 push
- 未改 `HallChrome`（消费端字段名已与 ADR-2 一致，只核对）
- 盘上同时出现、**非本单**：`src/pages/about/index.astro`、`src/data/about-hall-media.json`、`src/styles/about.css`、`evidence/about-hall/W4/`、`public/media/about-hall/about-illustration-s0h.webp`（mtime 00:39:37，晚于本单 gate）
