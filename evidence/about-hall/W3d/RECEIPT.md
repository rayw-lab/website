# W3d receipt — 馆长三动作 + 六站地轨

worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`  
date: 2026-09-03  
dev: `http://127.0.0.1:4630/website/world/about-pavilion/`

## 改动文件

| 文件 | 行数 | 角色 |
|---|---:|---|
| `src/components/city/halls/about/curator.ts` | 351 | 新建。three WebGL：Idle 底层循环 + 注视/托举/致意 |
| `src/components/city/halls/about/Curator.astro` | 111 | 新建。空位始终在 DOM；宽屏且 `no-preference` 才 `import('./curator')` |
| `src/components/city/halls/about/StationRail.astro` | 210 | 新建。六站 SVG/CSS 地轨，无年份；Tab + Enter |
| `src/pages/world/[slug].astro` | 71（+2） | 挂 `<Curator />` |
| `src/components/city/halls/about/Stations.astro` | 196（+2） | 仅插入 `<StationRail />` |
| `evidence/about-hall/W3d/shot.mjs` | 122 | Playwright 截图（不入库也可） |

未改：`Hero.astro` / `Crystal.astro` / `Epilogue.astro` 文案、`src/pages/about/**`、`src/data/about-hall-media.json`、`WorldHallLayout.astro`。未 import `src/lab/world/**`，无 rapier，无 `three/webgpu`。

## 已定设计选择（落地）

- 暗底 `#041020` + 单色霓虹；楼色米 `#fef3c7` 辅；眼青 `#49c5b6` 签名色。
- 机器人是侧栏馆长，不是载具；馆内不变形、不加新剪辑。
- 六站无年份。不做加载条 / 鼠标跟随大球 / 打字机 / 技能条 / 奖杯墙。
- `prefers-reduced-motion`：不加载 three，空台保留；`document.getAnimations()` total=0 / running=0。
- 无 WebGL / 无 JS：空 `data-curator-stage`，不留破图。
- 无限 CSS animation：本切片未新增；页上既有 `hall-scroll-nudge` + `hall-chrome-pulse`（≤5）。

## gzip 体积（无 `pnpm build`，e2e 占用 dist）

Hall HTML 计入 G-Hall-6 的是 `<script src>` / `modulepreload`。馆长 three 走动态 `import('./curator')` + IntersectionObserver，预期**不进**展厅 HTML 的 script/preload 列表（Hall-0 额外 JS 仍可为 0）。待指挥官在 e2e 结束后 `pnpm build && node scripts/about-hall-gate.mjs` 核 G-Hall-2..6。

未打包粗估（源文件各自 gzip，**不是** Vite chunk；three 仅视口内加载）：

| 块 | gzip |
|---|---:|
| Curator.astro boot script | 557 B |
| StationRail.astro script | 976 B |
| curator.ts 源 | 3 894 B |
| three.module.min.js | 86 549 B（按需 chunk，不计入 Hall HTML） |
| GLTFLoader.js 源 | 25 129 B |
| DRACOLoader.js 源 | 5 858 B |

GLB：`public/models/hero-robot/HeroRobot.glb` 既有资产，运行时 `data-model` 拉取，不进 `<script>`/`preload`（G-Hall-5）。

## 截图

| 机位 | 路径 |
|---|---|
| 首屏 | `/Users/wanglei/studio-data-root/worktrees/website-about-hall/evidence/about-hall/W3d/shot-hero.png` |
| 六站中段（s4 / 04） | `/Users/wanglei/studio-data-root/worktrees/website-about-hall/evidence/about-hall/W3d/shot-stations.png` |
| 尾声 | `/Users/wanglei/studio-data-root/worktrees/website-about-hall/evidence/about-hall/W3d/shot-epilogue.png` |
| reduced-motion | `/Users/wanglei/studio-data-root/worktrees/website-about-hall/evidence/about-hall/W3d/shot-reduced-motion.png` |
| 馆长特写 s4 / s8 | `shot-curator-s4.png` / `shot-curator-s8.png` |

## 机器证据

- `pnpm exec astro check`：0 errors（既有 hints）。
- Playwright `consoleErrors`: `[]`（`console.json`）。
- reduced-motion `document.getAnimations()`：`{ "total": 0, "running": 0 }`（`reduced-motion-animations.json`）。
- 六站中段 `data-curator-lift=1.00` `data-curator-scene=s4`。
- 端口 4630 空闲检测后占用；未动 4321 / 4625。

## 门（指挥官）

`pgrep -f 'playwright test'` 仍有全量 e2e（W6）。**禁止 `pnpm build`。**  
**build 门待 e2e 后由指挥官跑：**

```
pnpm build && node scripts/about-hall-gate.mjs
pnpm preview --host 127.0.0.1 --port 4631
env -u CI E2E_PORT=4631 pnpm exec playwright test e2e/about-hall.spec.ts
```

## 初审

见同目录 `REVIEW-gemini.md`。编码 worker 不打审美分。

原文第一行：

`VERDICT: PASS-WITH-NOTES — 馆长三态与六站地轨精准落地无slop，仅尾声底栏间距与画框稍局促。`

agy helper `--model gemini-3.7-flash` 实际 served label 以该次 `AGY_RECEIPT` 为准（现行 helper 将 3.7-flash 别名指到 Gemini 3.8 Flash High）。

## 补洞 r2（2026-09-03）

指挥官终审两条，只改 `Curator.astro` / `curator.ts` / `StationRail.astro`。

| 项 | 落地 |
|---|---|
| 画框 | `@media (min-width: 1200px)` 220×300；900–1199 160×220。实测 1440：`stageW/H 220×300` |
| 站位 | `right: clamp(16px, 3vw, 48px); bottom: clamp(24px, 6vh, 72px)` |
| 去卡片 | 无边框、canvas `alpha`、无 three 地面；CSS `radial-gradient` 椭圆脚底影 |
| 标签 | `.hall-kicker`，青色 `#49c5b6` |
| 相机 | fov 28，z=4.55，机器人约 70% 画框高；致意 Z 1.05，举手不出框 |
| S0 | 首屏 `is-on=false`、无 canvas（ADR-3）；离开 s0 后 300ms 淡入（reduced-motion 无 transition） |
| 尾声 | s8 地轨 `.is-away` opacity 0 + inert；footer 进视口馆长同步淡出 |

截图覆盖：`shot-stations.png` / `shot-epilogue.png` / `shot-curator-s4.png` / `shot-curator-s8.png`。

机器证据：`atHero.canvas=false`；`atFooter` curator/rail opacity 0；reduced-motion `getAnimations()` total 0 / running 0；`consoleErrors []`。未 `pnpm build`（e2e 仍在）。

文件行数：curator.ts 342 · Curator.astro 179 · StationRail.astro 231。

### r2 Gemini 初审

prompt：`~/.codex/state/about-hall/prompts/AH-W3d-review.md`（0600）。  
两次 `agy_rescue_cli.py --model gemini-3.7-flash` 均在 ~15–20s 以 `FAILED_PRECONDITION (code 400): User location is not supported for the API use.` 失败（receipt `agy-rescue-20260903-134811-0ac670d2`、`agy-rescue-20260903-134910-69d8b1c1`）。`REVIEW-gemini.md` 仍为 r1 文本，未覆盖。请指挥官稍后重跑同命令。

## 补洞 r3（2026-09-03）

馆长腿踩静帧卡：不缩小馆长。`Curator.astro` 在 `(min-width: 1200px) and (prefers-reduced-motion: no-preference)` 且可挂 WebGL 时给 `<html data-hall-curator="on">`。实际 class（无 `.hall-stations` / `.hall-station-media`）：

`html[data-hall-curator="on"] .hall-station-visual, .hall-crystal-board { margin-right: var(--hall-curator-lane, 260px); }`

另给 `.hall-station-visual` `max-width: calc(100% - 260px)`，避免 `width: 100%` + 右边距撑破格子。1200 以下不预留。标签改画框正上方居中。`bottom` 抬到 `clamp(5.5rem, 8vh, 7rem)` 与卡底/地轨上方对齐。

| 机位 | 馆长 x | 卡右 | 间隙 |
|---|---:|---:|---:|
| 1440×900 `shot-stations.png` | 1177 | 1036 | **141px** |
| 1280×800 `shot-stations-1280.png` | 1022 | 956 | **66px** |

`htmlOn=on`；馆长仍 220×300。未跑 Gemini（地区受限）。**初审待指挥官。** 未 `pnpm build`。`Curator.astro` 现 205 行。




