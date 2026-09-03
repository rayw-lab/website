# AH-F1 receipt — 街区方位词 + e2e 七例

worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`  
date: 2026-09-03  
preview: `http://127.0.0.1:4642/website/`（`pnpm preview` listen pid **19125**；收工已按 pid 杀掉；4321 全程空闲）  
未 commit / 未 push。未改 `Curator.astro` / `curator.ts` / `data-curator-pose`（ADR-5 另票）。

## 数据改动

`src/data/cyber-city-buildings.json` 仅 `districts[].title.zh`（`en` 不变；id / category / buildings 归属不换，ADR-4 决策 A）：

```diff
- "zh": "北城 AI 中枢区"
+ "zh": "AI 中枢区"
- "zh": "西南个人区"
+ "zh": "个人区"
```

行：`ai-core` L57；`civic` L72。

### 消费方清单（`rg` `src` / `e2e` / `docs/spec`）

| 路径 | 消费什么 | 本票 |
|---|---|---|
| `src/data/cyber-city-buildings.json` | 街区 title 单源 | 改 zh |
| `src/lab/world/ui/Minimap.ts` | `districts` **id 序**展平 pin；钉文案 = `building.title.zh`，**不读** `district.title` | 不改 |
| `src/pages/index.astro` 楼宇快览 | `building.title.zh` | 不改 |
| `src/lab/world/areas/QuestLine.ts` / HallChrome / Signage | 楼名 `building.title.zh` | 不改 |
| `e2e/` | **零**断言「西南个人区 / 北城 AI 中枢区 / Civic District / AI Core District」 | 不改既有判据 |
| `docs/spec/` | 无这两条字串 | — |
| `docs/research/cyber-city-buildings-map.md` | 街区表 + 坐标表 | 坐标行 08/12 **已是** `about (−44,−150)` / `now-signal (−44,150)`（AH-D1 `c9d5745`）；街区表 title 已去方位词。`docs/spec/cyber-city-buildings-map.md` **不存在** |
| `docs/local-cmd/adr/ADR-4-*.md` | 锁定原文仍写旧方位词 | 不改 ADR |

## e2e 七例

钩子核实：`window.__worldSpike.state()` 返回 `{x,y,z,…}`（`src/lab/world/index.ts` L455–478）；`#debug` 才挂 `__worldSpikeGame`。Quest HUD = `[data-world-quest-name]`（`QuestLine.ts` `dataset.worldQuestName`）。地轨 = `.hall-rail-stop` + Enter → `jump()`。到达条 = `[data-hall-drive]`。纸面 = `.about-qcard-teaser` / `.about-qcard-back`。

| # | 用例 | 文件:行 | 断言原文 | 结果 |
|---|---|---|---|---|
| 1 | `CITY-POI-ABOUT-NORTH-COORDS` | `e2e/cyber-city-poi-arrival.spec.ts:489` | `expect(Math.hypot(pos.x - -20, pos.z - -150)).toBeLessThan(1.5)` | **PASS** 46.1s（world-chromium，&lt;210s） |
| 2 | `CITY-QUEST-FIRST-STOP-ABOUT` | `e2e/cyber-city-explore.spec.ts:708` | `await expect(page.locator(SEL.questName)).toContainText('个人档案馆')`（`SEL.questName='[data-world-quest-name]'`；非深链 + RM `car_ready`） | **PASS** 1.5m（world-chromium，&lt;210s） |
| 3 | `HALL-RAIL-KEYBOARD-NAV` | `e2e/about-hall.spec.ts:262` | Tab 至 `.hall-rail-stop` nth(1)；Enter 后 `scrollY` `toBeGreaterThan(y0)` 且 `[data-scene=…]` 与视口相交 | **PASS** 782ms |
| 4 | `HALL-CHROME-DRIVE-CONEHITS` | `e2e/about-hall.spec.ts:238` | `await expect(page.locator('[data-hall-drive]')).toHaveText('途中碰倒 4 个锥桶')`（快照**无** `maxKmh`，仅 `coneHits: 4`） | **PASS** 259ms |
| 5 | `HALL-MOBILE-375-NO-OVERFLOW` | `e2e/about-hall.spec.ts:304` | `document.documentElement.scrollWidth - window.innerWidth` `toBeLessThanOrEqual(0)`；`[data-hero-scrub] img` 可见；无 video 播放 | **PASS** 132ms |
| 6 | `ABOUT-PAPER-TEASERS-AND-FLIP` | `e2e/about-paper.spec.ts:8` | `.about-qcard-teaser` `toHaveCount(3)` 且 first `toBeVisible()`；hover 后 `.about-qcard-back` first `toBeVisible()`；`main.innerText` `not.toContain('[[')` | **PASS** 1.1s |
| 7 | `ABOUT-PAPER-RM` | `e2e/about-paper.spec.ts:31` | `document.getAnimations().filter(a=>a.playState==='running').length` `toBe(0)` | **PASS** 157ms（**判据未改**；RM 下 running=0） |

project：1–2 → `world-chromium`（`cyber-city.*\.spec.ts`）；3–7 → `desktop-chromium`（`about-hall` / 新建 `about-paper` 不在 testIgnore）。

## 验证

| 步 | 结果 |
|---|---|
| `pnpm exec astro check` | 0 errors / 0 warnings / 59 hints（中途 ADR-5 改 `curator.ts` 曾瞬时 2 error，重跑已绿；本票未改该文件） |
| `pgrep -f 'playwright test'` | 开跑前无人 |
| `pnpm build` | 20 page(s) Complete |
| python socket `127.0.0.1:4642` | 空闲后起 preview；pid `~/.codex/state/about-hall/preview-4642.pid` = 19125 |
| hall+paper `--no-deps` | **16 passed (6.8s)**（当时文件尚未被 ADR-5 追加 W3e 馆长块） |
| `--grep` 两城条例 `--no-deps` | **2 passed (2.2m)** |
| `--list` | 本票跑时 **107 / 22 files**（100+7）；收工时 **109 / 22**（另票 AH-W3e 在 `about-hall.spec.ts` 尾追加 2 例馆长契约，非本票） |

命令：

```
env -u CI E2E_PORT=4642 pnpm exec playwright test \
  e2e/about-hall.spec.ts e2e/about-paper.spec.ts \
  --no-deps --workers=1 --retries=0 --reporter=list

env -u CI E2E_PORT=4642 pnpm exec playwright test \
  --grep 'CITY-POI-ABOUT-NORTH-COORDS|CITY-QUEST-FIRST-STOP-ABOUT' \
  --no-deps --workers=1 --retries=0 --reporter=list
```

## RM 动画来源（B 报告正常态 3 路；本票 RM 已测 = 0）

正常态 `/about/` 三路 = 三枚 `SectionHeading` 的 `class="reveal"`（`src/components/SectionHeading.astro:19`），动画名 `reveal-rise`：

- `src/styles/global.css:312-327` `@keyframes reveal-rise` + `.reveal { animation: reveal-rise … animation-timeline: view(); }`
- 包在 `@media (prefers-reduced-motion: no-preference)` 内，故 RM 下不挂
- 另有 RM 兜底 `global.css:333-341` `animation-duration: 0.01ms`

**ABOUT-PAPER-RM 实测 running===0，无需报 FAIL 来源、未放宽判据。**

## diff --stat（本票 write root）

```
 e2e/about-hall.spec.ts             |  +F1 三例（同文件尾另有 ADR-5 W3e 块，非本票）
 e2e/about-paper.spec.ts            |  59 （新建）
 e2e/cyber-city-explore.spec.ts     |  20 +
 e2e/cyber-city-poi-arrival.spec.ts |  26 +
 src/data/cyber-city-buildings.json |   4 +-
```
