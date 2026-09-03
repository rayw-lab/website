# AH-W2c RECEIPT · 机器门 + e2e 首批 + 媒体清单

- date: 2026-09-03
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- branch: `codex/about-hall-20260902`
- write root: 仅本单列出的文件；未 commit / 未 push / 未占 4321

## 交付

| 路径 | 动作 |
|---|---|
| `scripts/about-hall-gate.mjs` | 新建。G-Hall-1..9；写出 `evidence/about-hall/GATE.json`；任一 FAIL → 退出码 1 |
| `src/data/about-hall-media.json` | 新建。只登记 `hero-s0-poster.webp` |
| `e2e/about-hall.spec.ts` | 新建。6 例；G-Hall-10。挂在现有 `desktop-chromium` |
| `evidence/about-hall/GATE.json` | 门脚本写出（`ok: true`，9/9 PASS） |
| `evidence/about-hall/W2c/RECEIPT.md` | 本文件 |

**no-touch 核过**：未改 `playwright.config.ts`、`e2e/helpers.ts`、`e2e/site-health.spec.ts`、`scripts/audit-budget.mjs`、`scripts/check-links.mjs`。未 commit / 未 push。

盘上另有 W3a 在改 `src/pages/world/[slug].astro` / `WorldHallLayout.astro` / `src/styles/hall.css`（非本单）。门与 e2e 是对着 rebuild 后的现页跑的。

## 媒体真值

```
$ shasum -a 256 public/media/about-hall/hero-s0-poster.webp
98ae70f373815dfda951c8c2d31cb6beec0fea5ddcb0e062eed8f3caee1e603e

$ stat -f%z public/media/about-hall/hero-s0-poster.webp
41678
```

`public/media/about-hall/` 当时仍只有这一张（1280×720 webp）。JSON：`src16x9=""`（尚无片）、`fps=0`、`durationS=0`、`audio=false`、`lockedRef=docs/local-cmd/locked/S0-T-LOCKED-v2.md#first-v2-3`。G-Hall-8 对无视频条目跳过 ffprobe，只核 sha256/字节/总载荷（41678B ≤ 2.5MB）。

## `pnpm build`

exit 0。`20 page(s) built`。含 `/world/about-pavilion/index.html`。未知 slug 未生成。`dist/media/about-hall/hero-s0-poster.webp` 已复制。

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

exit=0。G-Hall-2..5 扫的是 HTML/JS **内容**，不用 `_astro/world.` 文件名。G-Hall-9 会剥 `data-bind` 里的 `#fragment` 再核 dist 200，并核目标页 id（现页 `proof:/about/#timeline-title` 在 `/about/` 有 `id="timeline-title"`）。

G-Hall-10 不在本脚本（见 GATE.json `notes`）。

## Playwright project

`pnpm exec playwright test --list` 实际 project：

`desktop-chromium` · `mobile-375` · `car-chromium` · `world-chromium` · `world-perf-chromium` · `city-perf-chromium` · `visual-chromium`

**没有 `chromium`。** 本 spec 已被 `desktop-chromium` 收录（`testIgnore` 未排除 `about-hall.spec.ts`），**不需要**改 `playwright.config.ts`。

派单里的 `--project=chromium` 实测：

```
Error: Project(s) "chromium" not found. Available projects: "desktop-chromium", "mobile-375", "car-chromium", "world-chromium", "world-perf-chromium", "city-perf-chromium", "visual-chromium"
```

若指挥官坚持要同名 project，最小加一行（**未加，由指挥官决定**）：

```ts
{ name: 'chromium', testMatch: /about-hall\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
```

`PW_BASE_URL` 本仓 `playwright.config.ts` **不读**。端口旋钮是 `E2E_PORT`（默认 4321）。本 harness `CI=true`，会把 `webServer.reuseExistingServer` 打成 false；复用已有 preview 必须 `env -u CI`。

## preview / e2e

Astro 7 preview **单例**：PID 93051 已占 `127.0.0.1:4612`（`.astro/preview.json`）。`pnpm preview --port 4613` 被拒（「Another astro preview server is already running」）。未 `--force`（会杀掉 4612）。未占 4321。

对着现成 4612（同一份 `dist/`）跑：

```
curl /website/world/about-pavilion/              → 200
curl /website/world/definitely-not-a-hall/       → 404

env -u CI E2E_PORT=4612 pnpm exec playwright test e2e/about-hall.spec.ts \
  --project=desktop-chromium --workers=1 --retries=0
```

```
Running 6 tests using 1 worker
  ✓  无 query：200，H1 含「架桥」，到达条 hidden
  ✓  ?from=city&poi=about-pavilion：到达条可见且含「个人档案馆」与「返回科技城」
  ✓  ?from=city&poi=not-a-building：到达条 hidden
  ✓  prefers-reduced-motion：无正在运行的 CSS animation
  ✓  禁用 JS：首屏 H1 与 poster <img> 可见
  ✓  未知 slug 404
  6 passed (1.6s)
```

e2e_exit=0。reduced-motion 用 `page.emulateMedia({ reducedMotion: 'reduce' })`（与 `world-spike` / `tts-cockpit` 同款）。

跑完 4321 仍空闲；4612 原进程未杀。

## 未做 / 残留

- 现页 `<video>` 写了 `/media/about-hall/hero-s0-720p.mp4`，**磁盘上没有这个文件**（W3a 骨架）。本单按任务只登记 poster，G-Hall-8 不过问未入账路径。check-links 若扫 `<source src>` 会红——不在本 write root。
- 未把播放器 island 打进 hall HTML（G-Hall-6 仍为 0 字节；W2b `ScrubVideo.ts` gzip 1041B 的硬顶未在本页接线）。
- 未改 `playwright.config.ts`。
