# AH-W1h RECEIPT · S0 进仓 + Hero 指针 scrub + S6 滚动 scrub

- date: 2026-09-03
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- write root: `public/media/about-hall/hero-s0-*`、`src/data/about-hall-media.json`、`Hero.astro`、`Stations.astro`（仅去掉 S6）、`Transition.astro`、`src/pages/world/[slug].astro`（挂一行）、`ScrubVideo.ts`（滚动段近距 preload）、`e2e/about-hall.spec.ts`
- 未 commit / 未 push / 未占 4321
- preview: 4639 已起已杀（pid `~/.codex/state/about-hall/preview-4639.pid`）
- 未碰：`Curator.astro`、`StationRail.astro`、`HallChrome.astro`、`src/styles/hall.css`、`src/pages/about/index.astro`、城市 HUD

## 交付

| 路径 | 动作 |
|---|---|
| `public/media/about-hall/hero-s0-720p.mp4` | 拷 `gen/S0-T/hero-s0-v3-720p.mp4`（1054456 B） |
| `public/media/about-hall/hero-s0-portrait.mp4` | ~~拷 `hero-s0-v3-portrait.mp4`（726488 B）~~ → **已删**（移动端只显示 poster，竖版永不请求；gen 原件保留） |
| `public/media/about-hall/hero-s0-poster.webp` | **未覆盖**（37876 B，sha `b69af660…`） |
| `src/data/about-hall-media.json` | 新增 `hero-s0`（字段对齐 `transition-s6`）；~~含 `src9x16`~~ → **hero-s0 / transition-s6 已去掉 `src9x16`** |
| `Hero.astro` | ~~清单 `src16x9`/`src9x16` `<source media>`~~ → 仅 `src16x9`；桌面 pointer scrub；img/video 绝对叠层 |
| `Transition.astro` | 新建。`data-scene=s6` sticky 220vh；滚动 scrub；近距 200px 才 preload |
| `Stations.astro` | 不再渲染 s6（改由 Transition） |
| `[slug].astro` | `<Transition />` 一行 |
| `ScrubVideo.ts` | `preload` / `preloadWhenNearPx` |
| `e2e/about-hall.spec.ts` | Hero 指针、S6 中段、reduced-motion 视频 |

## 移动端策略（文档未定 → 选静态首帧）

- TECH-ARCH / ADR-3 决策 C / ADR-4 决策 B：poster 开页、无 JS 可读、移动端不绑 scrub。
- **选择**：≤899px 或 `hover: none` **不**指针 scrub、**不** `autoplay`。`hall.css` ≤767 已 `video{display:none}`，本票不抢。画面 = poster `<img>`（即静帧）。
- ~~9:16 `<source media="(max-width: 899px), (hover: none)">` 仍写在 DOM（iPhone 实测 `currentSrc` 为 portrait，但 `display:none`）。~~ → **已去掉 9:16 `<source>`**；移动端只留 poster `<img>`。
- `prefers-reduced-motion`：只显示 poster，video 隐藏。
- 375 宽：Hero 媒体改 32vh，copy `flex-start`，藏「滚动进入六站」，职务行与地轨 gap 74px。

~~已知：`hero-s0-portrait.mp4` 726488 B > ADR-3 移动 9:16 ≤500KB。本票按指挥官指定文件进仓；G-Hall-8 不按段检查 500KB。超限另开 ADR。~~ → **竖版已从 `public/media/about-hall/` 删除**（`hero-s0-portrait.mp4`、`transition-s6-portrait.mp4`），gen 目录原件保留。

## 验收

### `pnpm exec astro check`

0 errors / 0 warnings / 59 hints（既有 zod / `execCommand` / `is:inline`）。

### `pnpm build && node scripts/about-hall-gate.mjs`

20 page(s)。G-Hall-1..9 **FAIL 0 · WARN 0**。

| 门 | 数字 |
|---|---|
| G-Hall-6 初始 JS gzip | **1725 B** ≤ 20KB 目标 / 50KB 硬顶 |
| G-Hall-8 总载荷 | ~~**5619084 B（5.36 MB）**~~ → **3379813 B（3.22 MB）** ≤ 6.0 MB（删竖版后重跑） |
| G-Hall-8 条数 | 9 条对账通过（sha / bytes / 30fps / 无音轨 / 时长） |

`hero-s0`：durationS 6.033、bytes 1054456、sha256 `e33946e2888b00702ab9319c350ba5f36794ed5caebfc138ac5bca84a2855112`、fps 30、audio false、1280×720。

### e2e

`env -u CI E2E_PORT=4639 pnpm exec playwright test e2e/about-hall.spec.ts --no-deps --workers=1 --retries=0 --reporter=list`

**11 passed / 0 failed / 0 skipped**（含新增 2 例 scrub + 1 例 reduced-motion 视频）。~~约 7.4s~~ → 删竖版后重跑 **11/11 · 4.3s**。

并行注意：当时 4638 上另有 VIS-1 playwright；本票只打 4639。

截图取证：Hero 左 `currentTime≈0.36` / 右 `≈5.31`（~~右帧头转向桥远端~~ → **头部静止，scrub 反馈为光缆光流 + 粒子**）；S6 中段 `≈3.61`（∈(3,8)）/ 末 `≈9.93`。

## 截图

`evidence/about-hall/W1h/`

- `01-hero-scrub-left.png`
- `02-hero-scrub-right.png`
- `03-s6-mid.png`
- `04-s6-end.png`
- `05-hero-mobile-375.png`

## 阶段初审

- prompt：`~/.codex/state/about-hall/prompts/AH-W1h-review.md`（0600）
- `python3 ~/.claude/scripts/agy_rescue_cli.py --model gemini-3.8-flash --cwd …/W1h --write --timeout 600`
- `REVIEW-gemini.md`：**VERDICT: FAIL**（Q1 1/10 · Q2 7/10 · Q3 9/10）

~~宿主注：Q1 为模型看图误判。`01` 正对镜头、`02` 头转向桥远端（左）；源帧 ffmpeg `t=0.24` vs `t=5.55` mean ΔRGB ≈ 4.9；e2e 右 3/4 `currentTime>1`。Q2/Q3 与像素一致。不因 Q1 误判改片源。~~

更正：进仓片是 S0 v3（LOCKED v4 **零头部动作**）。`01`/`02` 两帧头部像素级一致；scrub 的可见反馈是光缆光流与粒子，不是转头。Gemini Q1 看到的是事实。

Gemini Q1 预期口径（转头）与 LOCKED v4 设计（零头动）不一致，**该维评分不作采信**——不是实现没接上 scrub，是评审按旧 motion 纸打的。e2e 右 3/4 `currentTime>1` 仍成立。Q2/Q3 与像素一致。

## diff --stat（本票文件域）

```
 e2e/about-hall.spec.ts                         | 80 ++++++++++++++++++++++++
 src/components/city/halls/ScrubVideo.ts        | 35 +++++++++--
 src/components/city/halls/about/Hero.astro     | 86 ++++++++++++++++++++------
 src/components/city/halls/about/Stations.astro |  9 ++-
 src/data/about-hall-media.json                 | 26 ++++++++
 src/pages/world/[slug].astro                   |  2 +
 6 files changed, 210 insertions(+), 28 deletions(-)
```

~~原先 216 insertions / Hero 90 / json 28~~（含竖版字段）。

未跟踪：`Transition.astro`、`hero-s0-720p.mp4`、`evidence/about-hall/W1h/`。~~`hero-s0-portrait.mp4`~~ 已删。`transition-s6-*` 进仓前已在工作区；~~`transition-s6-portrait.mp4`~~ 已删。
