# AH-W3a RECEIPT · Hero 接入 + 8 幕骨架 + 暗色 chrome

- date: 2026-09-02
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- branch: `codex/about-hall-20260902`
- write root: 本单列出的文件；未 commit / 未 push / 未占 4321
- preview: 4614 已起已杀（Astro preview 被本仓 4612 单例占用，改用 dist 静态服务映射 `/website` → `dist/`）

## 交付

| 路径 | 动作 |
|---|---|
| `src/styles/hall.css` | 新建。`html:has([data-hall])` 覆盖站头/页脚为暗底 + 单一霓虹 `#49c5b6`；Hero / 六站 / 晶体 / 收官；移动单列；`prefers-reduced-motion` 关动画 |
| `src/layouts/WorldHallLayout.astro` | 引入 `hall.css`；主区全幅；暗底改由 hall.css 作用到站头页脚，不再只涂 `.hall-scope` |
| `src/pages/world/[slug].astro` | 接入 Hero / Stations / Crystal / Epilogue |
| `src/components/city/halls/about/Hero.astro` | `data-scene=s0` `data-bind="tagline;proof:/about/"`；poster `hero-s0-poster.webp`；`<source>` 指向未来 `hero-s0-720p.mp4`；无片源/error/移动/reduced-motion 不绑 scrub |
| `src/components/city/halls/about/Stations.astro` | s2–s6 sticky 300vh；文字 + SVG 占位；`[[占位]]` 六条 |
| `src/components/city/halls/about/Crystal.astro` | s7 六边形 SVG + 六标签 hover 高亮 |
| `src/components/city/halls/about/Epilogue.astro` | s8 三问题翻转 / 讲者简介复制 / 四出口 / `/?poi=about-pavilion` |
| `src/data/about-copy.ts` | 问题、六站、讲者简介单源 |
| `src/pages/about/index.astro` | 改 import `about-copy.ts`（不再复制第二份） |
| `evidence/about-hall/W3a/` | 本回执 + 截图 + `shot.mjs` |

**no-touch 核过**：未改 `BaseLayout.astro`、`HallChrome.astro`、`ScrubVideo.ts`、`src/lab/**`、`public/media/**`。

## 验收命令

### `pnpm exec astro check`

exit 0。`Result (175 files): 0 errors / 0 warnings / 252 hints`。hints 为既有 zod deprecation / `execCommand` / `is:inline`，本单业务文件无 error。

### `pnpm build`

exit 0。`/world/about-pavilion/index.html` 生成。20 page(s)。

### G-Hall

```
rg -c "lab/world|@dimforge|three/webgpu|models/" dist/world/about-pavilion/index.html
RG_HITS=0
```

HTML 内 `data-scene` = s0,s2,s3,s4,s5,s6,s7,s8（8 幕）；`data-bind` = 8。

### 展厅额外 JS gzip

ScrubVideo 内联进页（`<script type="module">`）+ 收官复制/翻转内联：

- raw 3686 B
- gzip **1508 B**（≤ 20KB）

### preview 4614

Astro 7 preview 单例已被 PID 93051 占在 **4612**。本单按任务端口 **4614** 起 dist 静态服务（`shot.mjs` → `_static-server.mjs`，`detached` 进程组），测完 `process.kill(-pid)`，4614 空闲。未占 4321。

站头计算色 `color(srgb 0.016 0.063 0.125 / 0.88)` ≈ `#041020` 88% 透明，不再是浅色条。

到达条 `?from=city&poi=about-pavilion`：`hidden=false`，文案「个人档案馆 / 探索 0/12 / 返回科技城」；headerBottom=69 / chromeTop=69，**overlap=false**。

### 截图

| 文件 | 机位 |
|---|---|
| `shot-hero-desktop.png` | 1440×900 首屏 |
| `shot-scene3-desktop.png` | 滚到 `[data-scene=s3]`（光影 · 演进 03） |
| `shot-hero-mobile.png` | 390×844 单列：上 poster、下文案 |
| `shot-arrival-desktop.png` | 额外：到达条 + 暗色站头（任务三张之外） |

## 静态回读

- H1「在技术与落地之间架桥」；副标题 = 定位一页纸；角色行 = `PERSON.jobTitle`
- poster `/website/media/about-hall/hero-s0-poster.webp`；`<source>` 指向尚未入仓的 `hero-s0-720p.mp4`（404 时 video 不 `data-ready`，底下 img 承担画面）
- `[[占位]]` × 6，无编造年份/示意分数；s6 登记矩阵写「综合 80 · 视觉 73 · 功能 87 · 性能 — · e2e 86/86」
- 回城 `/website/?poi=about-pavilion`
- 零 `mix-blend-mode`

## 未做 / 残留

- `hero-s0-720p.mp4` 未到：scrub 绑不上（设计如此）。片源入仓后同一 `<source>` 即可。
- 六站仍是 SVG 占位，无滚动 scrub 视频（W1b/W3 后段）。
- 真机 headed 指针手感未核（headless 截图 + 计算色）。
- 未 commit / 未 push。
