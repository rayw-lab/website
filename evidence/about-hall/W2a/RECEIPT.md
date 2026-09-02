# AH-W2a RECEIPT · 展厅壳

- date: 2026-09-02
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- branch: `codex/about-hall-20260902`
- write root: 仅本单列出的文件；未 commit / 未 push / 未占 4321
- preview: 4611 已起已杀，事后端口空闲

## 交付

| 路径 | 动作 |
|---|---|
| `src/data/world-halls.json` | 新建；slug 白名单仅 `about-pavilion`，`scenes: []` |
| `src/layouts/WorldHallLayout.astro` | 新建；包 BaseLayout；暗底 token；`data-hall`；slots `ritual` / default / `cta` |
| `src/components/city/HallChrome.astro` | 新建；到达条；构建期查 buildings JSON 楼名/楼色 |
| `src/pages/world/[slug].astro` | 新建；`getStaticPaths` 来自 world-halls.json；Hall-0 首屏 |
| `src/lab/world/city/CityMap.ts` | `Building.hallPath?: string` + 注释；零逻辑改 |
| `src/data/cyber-city-buildings.json` | 仅 `about-pavilion` 加 `"hallPath": "/world/about-pavilion/"`；`schemaVersion` 仍 `"0.1.0"`；`deepLink` 仍 `/about/` |
| `docs/spec/SRD.md` | ADR-2 §5 原文：`/world/` 行下加 `/world/{slug}/` 一行 + 表下一句 |
| `scripts/check-links.mjs` | `hallPath` 有值则同 `deepLink` 核 dist |

**no-touch 核过**：未改 `src/lab/world/areas/Areas.ts`、`src/pages/index.astro`、`lighthouserc.json`、`playwright.config.ts`、任何 e2e。

## 契约要点（ADR-2）

- query 只认 `from=city` + `poi` 白名单；`poi` 还必须等于本厅 `buildingId`，否则到达条保持 `hidden`
- `sessionStorage['world-arrival-v1']` 若存在且 `poi` 与 query 不一致 → 到达条不出现（W5 才写真实驾驶卡）
- 回城 `/?poi=about-pavilion`（带 `base`）
- 探索 n/N：`localStorage['world-explore-v1']` 合法 id 个数 / `buildings.length`（现 12，不写死字面量进脚本常量）
- 无 JS：`hidden` + `[hidden]{display:none !important}`，到达条不占布局
- 展厅 HTML **零** `src/lab/world/**` import；`<script src>` = 0（Hall-0 无额外 chunk）

## 验收命令输出

### `pnpm exec astro check`

```
Result (160 files):
- 0 errors
- 0 warnings
- 58 hints
```

exit 0。hints 均为既有 `content.config.ts` zod deprecation / BaseLayout json-ld `is:inline` hint，本单文件 0 诊断。

### `pnpm build`

```
generating static routes
  ├─ /world/about-pavilion/index.html (+2ms)
  ...
[build] 20 page(s) built
[build] Complete!
```

exit 0。未知 slug 未生成。

### `ls dist/world/about-pavilion/index.html`

```
.rw-r--r--@ 15k  dist/world/about-pavilion/index.html
```

存在。sitemap-0.xml 含 `https://rayw-lab.github.io/website/world/about-pavilion/`。

### G-Hall 字面（必须 0 命中）

```
rg -n "lab/world|initAllLabFacades|mountWorld|@dimforge|three/webgpu|WebGPURenderer|models/" dist/world/about-pavilion/index.html
RG_HITS=0
```

附加：该 HTML `script src` = `[]`；preload 仅两款字体 woff2。无 `_astro/*.js`、无 `public/models/**`。

### `node scripts/check-links.mjs dist/`

```
check-links：扫描 20 个 HTML 页面，核对 364 条内部引用（base=/website）
  manifest 一致性：已核对 3 个注册模块 × 2 个被链接 slug
  科技城深链：核对 12 栋在册大楼 deepLink、1 条 hallPath × dist 内 1 条 ?poi= 引用（E7 已切换，缺链为阻断级）
  deepLinkStatus=fallback 登记 2 条：
    · agent-nexus → /ai-lab/
    · autodrive-lab → /work/
✔ 内部链接与锚点全部有效
```

exit 0。`hallPath` 1 条已核到 dist 页。

### preview 4611

```
4611 free
astro preview --port 4611 --host 127.0.0.1
curl /website/world/about-pavilion/  → 200
curl /website/world/nope/            → 404
4611 free after kill
```

### `git -C . diff --stat`（已跟踪文件）

```
 docs/spec/SRD.md                   |  3 +++
 scripts/check-links.mjs            | 13 ++++++++++++-
 src/data/cyber-city-buildings.json |  1 +
 src/lab/world/city/CityMap.ts      |  5 +++++
 4 files changed, 21 insertions(+), 1 deletion(-)
```

本单新建（untracked）：

```
src/data/world-halls.json
src/layouts/WorldHallLayout.astro
src/components/city/HallChrome.astro
src/pages/world/[slug].astro
evidence/about-hall/W2a/RECEIPT.md
```

## 静态回读（dist HTML）

- `data-hall="about-pavilion"`
- `data-hall-chrome` + `hidden` + `data-poi="about-pavilion"` + 12 个在册 id
- H1「在技术与落地之间架桥」
- `data-scene="s0"` + `data-bind="tagline;proof:/about/"`
- poster `src` → `/website/posters/cyber-city-poster.webp`（Hall-0 占位；本 write root 不能写 `public/`）
- CTA `/website/about/`
- 回城 `/website/?poi=about-pavilion`

## 未做 / 残留

- 到达条交互未在 headed 浏览器点按（本包禁 e2e、禁占 4321）。逻辑在内联脚本，无 query 保持 hidden。
- 真实驾驶卡由 W5 写 `world-arrival-v1`；W2a 无 storage 时只凭合法 query 显示。
- poster 用现成 `cyber-city-poster.webp`，不是 `public/posters/about-hall-poster.webp`（该路径本单不能新建）。
- G-Hall 脚本 / e2e 不在本 write root。
- 未碰 `evidence/about-hall/W2b/`（他单产物）。
