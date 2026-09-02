# AH-W3c RECEIPT · 六站幕静帧 + 视差揭示 + 晶体键盘 + 收官打磨

- date: 2026-09-03
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- branch: `codex/about-hall-20260902`
- write root: `Stations.astro` / `Crystal.astro` / `Epilogue.astro` / `hall.css` / `evidence/about-hall/W3c/`
- 未 commit / 未 push / 未占 4321
- preview: 4617 静态服务（`shot.mjs` → `_static-server.mjs`，`detached` + `start_new_session` 进程组），测完已杀，4617 空闲

## 设计读

展厅暗底 scrollytelling 的六站幕：左文右图两栏，静帧按媒体清单 id 接入；用裁切/缩放/出场方向把五张同姿态静帧拉开，不新加循环动画。

## 交付

| 路径 | 动作 |
|---|---|
| `src/components/city/halls/about/Stations.astro` | 六幕 sticky：S1 工作台（新 `data-scene=s1`）+ 既有 s2–s6。S1–S5 `<img loading=lazy decoding=async>` 按 `station-s1..s5` 查清单；S6 回家占位框（中景人→光子→钛灰机甲，片源待 i2v）。IntersectionObserver + rAF 写 `--hall-reveal`（禁 `scroll` 监听、不引新库） |
| `src/styles/hall.css` | 左文右图；五幕 clip-path（右滑入 / 自下 / 左→右 wipe / 圆扩 / 上下对开）+ `translate` ≤24px；object-position/scale/aspect 各不同；`prefers-reduced-motion` 终态、`clip-path: none` |
| `src/components/city/halls/about/Crystal.astro` | 六顶点 hover/focus-visible/`is-active` 高亮；`aria-pressed`；一句能力描述 `aria-live`；键盘可达 |
| `src/components/city/halls/about/Epilogue.astro` | 复制反馈 1.5s + `aria-live`；四出口 + 回城 `/?poi=about-pavilion`；页尾「所有画面为程序化生成的化身，非真人照片」 |
| `evidence/about-hall/W3c/` | 本回执、截图、`reduced-motion-animations.json`、`shot.mjs` |

**no-touch 核过**：未改 `Hero.astro`、`[slug].astro`、`WorldHallLayout.astro`、`HallChrome.astro`、`ScrubVideo.ts`、`about-hall-media.json`、`public/**`、`src/pages/about/**`。

文案：六站无年份；`[[占位]]` 保留（S1 新增一条工位占位 + 原 s2–s6 六条）。`data-bind` 保持；S1 = `stage:none;pillar:none;proof:/about/`。

## 循环动画盘点（全页 ≤5）

| # | 位置 | 类型 | 本单 |
|---|---|---|---|
| 1 | `.hall-hero-scroll span` `hall-scroll-nudge` 1.8s infinite | CSS 呼吸（↓） | 既有；`no-preference` 才跑 |
| 2 | `HallChrome` 到达条脉冲 | CSS infinite | no-touch，自管；reduce 关闭 |

本单 **0** 处新增循环动画。clip-path / translate 由 `--hall-reveal` 驱动，不是 `@keyframes`。

## 五幕出场 / 裁切

| 幕 | 媒体 id | clip-path | 裁切 |
|---|---|---|---|
| S1 工作台 | `station-s1` | 自右揭示 + translateX ≤20px | 4/3 · `82% 38%` · scale 1.12 |
| S2 地基 | `station-s2` | 自下揭示 + translateY ≤24px | 1/1 · `70% 82%` · scale 1.18 |
| S3 光锥 | `station-s3` | 左→右 wipe | 5/4 · `58% 46%` · scale 1.08 |
| S4 十六环 | `station-s4` | 圆心扩张 | 1/1 · `58% 42%` · scale 1.22 |
| S5 天平 | `station-s5` | 上下对开 | 4/5 · `60% 34%` · scale 1.15 |
| S6 回家 | 无静帧 | 占位框 | 文案对齐 S6-T first-v3-3 中景 |

移动 390：五幕画框统一 `16/10`，避免竖图把主体推到折线以下。

## 验收命令

### `pnpm exec astro check`

exit 0。`Result (173 files): 0 errors / 0 warnings / 59 hints`。本单业务文件无 error。

### `pnpm build`

exit 0。20 page(s)。`/world/about-pavilion/index.html` 生成。

### `node scripts/about-hall-gate.mjs dist/`

全绿。G-Hall-8：7 条媒体 sha/bytes 对账，总载荷 286284B ≤ 2.5MB。G-Hall-9：9 个 `data-scene`（s0 + s1–s6 + s7 + s8）均有 `data-bind`，URL 在 dist 可解析。

### e2e

```
env -u CI E2E_PORT=4617 pnpm exec playwright test e2e/about-hall.spec.ts --project=desktop-chromium --workers=1 --retries=0
```

**7 passed**（0 failed / 0 skipped / 0 flaky）。含 reduced-motion 无 running animation、无 JS 首屏 poster、到达条四态、未知 slug 404。

### `getAnimations()` · reduced-motion

`evidence/about-hall/W3c/reduced-motion-animations.json`：

```json
{ "total": 0, "running": 0, "states": [], "names": [] }
```

断言：`total === 0` 且 `running === 0`。

## 截图（4617，测完已杀）

| 文件 | 机位 |
|---|---|
| `shot-s1-desktop.png` | 1440×900 · S1 工作台 左文右图 |
| `shot-s3-desktop.png` | 1440×900 · S3 光锥 |
| `shot-s5-desktop.png` | 1440×900 · S5 天平 |
| `shot-crystal-desktop.png` | 1440×900 · 六向晶体 + 能力一句 |
| `shot-epilogue-desktop.png` | 1440×900 · 复制按钮 + 四出口 + 回城 + 化身声明 |
| `shot-s3-mobile-390.png` | 390×844 · S3 单列 |

## 未做 / 残留

- S6 过渡 mp4 未到：占位框，不放静帧（设计如此）。
- 截图滚到 sticky 中段（`--hall-reveal≈1`）取终态构图；入场 clip 是滚动过程，静帧截不到 0→1 全过程。
- `evidence/about-hall/GATE.json` 被门脚本覆写为本轮结果（脚本固定落点，非 W3c write root）。
