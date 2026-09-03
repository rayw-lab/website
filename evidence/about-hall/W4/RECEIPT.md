# AH-W4 RECEIPT · `/about/` 纸面双胞胎触感升级

- date: 2026-09-03
- worktree: `/Users/wanglei/studio-data-root/worktrees/website-about-hall`
- branch: `codex/about-hall-20260902`
- write root: 本单列出的文件；未 commit / 未 push / 未占 4321
- preview: 4616 已起已杀（dist 静态服务映射 `/website` → `dist/`）

## 设计读

Reading this as: 技术编辑部风格的 About 纸面页（方向 C：Eduard 触感 + Brittany 密度 + 过程即身份），给招聘/合作访客，零 3D / 零滚动劫持 / 零视差。Dials：VARIANCE 6 / MOTION 3 / DENSITY 5。沿用全站工业橙 token，不新开色盘。

## 交付

| 路径 | 动作 |
|---|---|
| `src/pages/about/index.astro` | 页头左文右图；三问题 CSS 翻转卡；六站 `:target` + IO 聚焦；复制 1.5s；页尾 3D 附加链 |
| `src/styles/about.css` | 新建。选择器挂 `[data-about-page]` / `.about-page` |
| `public/media/about-hall/about-illustration-s0h.webp` | S0-H `first-v1-1.png` Pillow 转 webp |
| `src/data/about-hall-media.json` | 追加 `about-illustration-s0h`（sha/bytes 真值） |
| `evidence/about-hall/W4/` | 本回执 + 四态截图 + `lh-about.json` + `shot.mjs` |

**no-touch 核过**：未改 `BaseLayout.astro`、`global.css`、`src/pages/world/**`、既有 e2e。同 worktree 上 W3b/W5 另有 `station-s*.webp` / `Areas.ts` / `e2e/about-hall.spec.ts` 改动，非本单。

## 插图

- 源：`/Users/wanglei/studio-data-root/about-hall/gen/S0-H/first-v1-1.png`（1280×720）
- 编辑裁切：去掉 LOCKED 提示词里留给叠字的左约 38% 空白纸，使 40% 页头槽位露出桥与人
- 输出：794×720 webp quality=90
- bytes **107916**（≤120KB）
- sha256 `c72ef1545edb306187675f629724b77620db70650d38f90ac50dfa801a9bc634`
- `<img loading=lazy decoding=async fetchpriority=low>`
- 桌面栅格列 `minmax(0, 40%)`；移动端胸针级 `11.5rem`，排在标题+导语下方

## 触感

1. 三问题卡：CSS `hover` / `:focus-within` 翻转；`prefers-reduced-motion`、`hover:none`、`max-width: 639.98px` 三态直接展开背面（做法 + 佐证链）。无 JS。
2. 六站：`#station-*` + `:target`；IntersectionObserver IIFE **≤2KB**；默认第一站 `is-current`；无年份。
3. 讲者简介：复制成功 1500ms「已复制 ✓」；`noscript` 保留选中复制。
4. 页尾附加链「想看 3D 版：进入个人档案馆」→ `/world/about-pavilion/`。主 CTA 仍是 Demo / Now / Contact（deepLink 语义）。

## 验收命令

### `pnpm exec astro check`

exit 0。`Result (172 files): 0 errors / 0 warnings / 59 hints`。本页 `document.execCommand` 为既有复制回退 hint，与 W3a 同型。

### `pnpm build`

exit 0。`/about/index.html` 生成。20 page(s)。

### LHCI 本地

`pnpm lhci:local` 会拉全量在册 URL 且默认 4321，本单不占 4321。改走仓内 `lighthouse@12.6.1`：

```
node_modules/.pnpm/node_modules/.bin/lighthouse \
  http://127.0.0.1:4616/website/about/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-path="<playwright chromium>" \
  --chrome-flags='--headless --no-sandbox' \
  --output=json --output-path=evidence/about-hall/W4/lh-about.json
```

`/about/` 四项（Lighthouse 12.6.1，fetchTime `2026-09-02T16:46:52.897Z`，墙钟 2026-09-03）：

| 分类 | 分 |
|---|---|
| Performance | **100** |
| Accessibility | **96** |
| Best Practices | **100** |
| SEO | **100** |

均 ≥95，不降门。

LCP 元素 = `.lede` 段落（不是插图）。插图 `loading=lazy` + 移动端胸针级。

Accessibility 96 的残余全在 **SiteHeader / SiteFooter**（`--ink-3` #6e6e68 对暗底 3.78:1；品牌 `aria-label` 与可见字不完全包含）。本单 write root 不含这两处，未改。页内 crumb 已改 `--ink-2`，不再进 color-contrast 名单。

### 四态截图

preview 4616（`evidence/about-hall/W4/_static-server.mjs`，detached 进程组），测完 SIGTERM。未占 4321。

| 文件 | 态 |
|---|---|
| `shot-default.png` | 1440×900，问题卡正面，第一站聚焦 |
| `shot-reduced-motion.png` | `emulateMedia({ reducedMotion: 'reduce' })`，三卡展开背面 |
| `shot-nojs.png` | `javaScriptEnabled: false`，简介可选中，noscript 提示可见 |
| `shot-390.png` | 390×844，插图在标题+导语下，三卡展开 |

## 静态回读

- H1「我解决的是『复杂技术 → 可决策方案』这段路」；插图 alt 手绘炭笔肖像
- 佐证链：`/lab/tts-cockpit/`、`/work/llm-capability-layering/`、`/work/ai-native-workflow/`
- 六站 id：`station-iot` … `station-workflow`，无编造年份
- 3D 链 `/website/world/about-pavilion/`
- 零 `mix-blend-mode`、零滚动劫持、零视差、零 Three import

## 未做 / 残留

- 站点头/脚 `--ink-3` 暗底对比与品牌 `aria-label` 不匹配：既有，不在 write root。
- `pnpm lhci:local` 未跑（4321 / 全量 collect）；本单以 `/about/` 单 URL Lighthouse JSON 为证。
- 同盘 `about-hall-media.json` 另有 W3b `station-s1`…`s5` 条目，本单只追加 `about-illustration-s0h`。
