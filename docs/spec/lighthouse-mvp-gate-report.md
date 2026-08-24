# Lighthouse MVP Gate 报告 · 六 URL 基线（Phase 1）

> 门槛来源：`docs/spec/implementation-roadmap-birdseye.md` Phase 1 MVP Gate / master-plan §7.5 —— Lighthouse 四项（Performance / Accessibility / Best Practices / SEO）**≥ 95**，移动端预设。
> 分支 `cursor/bruno-implementation-plan-1d6f` · 2026-08-24
> 工具链：`@lhci/cli` 0.15.1（`pnpm dlx` 固定版本）→ Lighthouse **12.6.1** · Chrome for Testing **151.0.7922.34**（Playwright Chromium，经 `CHROME_PATH` 指定）
> 口径：`lighthouserc.json` 单源——移动端预设（Moto G 模拟 + 4x CPU throttle + Slow 4G 模拟节流，`formFactor: mobile` 显式钉死），每 URL **3 轮取中位轮**，四项 `minScore 0.95` **error 级断言（未降级）**。
> 靶站：`pnpm build` 产物由 `pnpm preview` 伺服（base `/website`，端口 4321，与 GitHub Pages 同构）。

## 1. 结论

| 判定 | 结果 |
|---|---|
| URL 覆盖 | 3 → **6**：新增 `/work/`（案例索引）、`/work/multilingual-cockpit/`（案例 A 内容页）、`/about/` |
| 断言 | **6 URL × 4 类目全部通过**（`lhci autorun` 退出码 0，`All results processed!`） |
| 阈值 | `minScore 0.95` error 级断言逐字未动；未加任何 URL 级豁免、无 continue-on-error |
| CI 同源 | `ci.yml` ⑤（treosh/lighthouse-ci-action@v12）直接读 `lighthouserc.json`，六 URL 基线自动生效 |

> 注：任务原文写作「`/work/multilingual-cockpit-global-launch/`」；仓库中案例 A（`flagship: A`，`src/content/work/multilingual-cockpit.mdx`）的实际路由为 **`/work/multilingual-cockpit/`**（slug = 文件名，`[slug].astro` 按 entry.id 出静态路径），配置按真实路由收录。

## 2. 各页分数（修复后 · 3 轮中位）

| URL | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/website/` | **100** | **100** | **100** | **100** | 0.9 s | 1.8 s | 0 ms | 0 |
| `/website/work/` | **100** | **100** | **100** | **100** | 0.8 s | 1.4 s | 0 ms | 0 |
| `/website/work/multilingual-cockpit/` | **100** | **100** | **100** | **100** | 0.8 s | 1.5 s | 0 ms | 0 |
| `/website/about/` | **100** | **100** | **100** | **100** | 0.8 s | 1.5 s | 38 ms | 0 |
| `/website/lab/car-configurator/` | **99** | **100** | **100** | **100** | 1.1 s | 1.8 s | 0 ms | 0 |
| `/website/lab/tts-cockpit/` | **99** | **100** | **100** | **100** | 1.1 s | 1.8 s | 0 ms | 0 |

逐轮稳定性：两个 Lab 页 Performance 三轮均为 99（余量 4 分），其余 66 个「URL × 类目 × 轮次」读数全部 100。

## 3. 基线（扩展 URL 后首轮，修复前）

| URL | Perf | A11y | BP | SEO | 判定 |
|---|---|---|---|---|---|
| `/website/` | 100 | 97 | 100 | 100 | ✅（但同源问题被其他页放大） |
| `/website/work/` | 100 | 96 | 100 | 100 | ✅ |
| `/website/work/multilingual-cockpit/` | 100 | 96 | 100 | 100 | ✅ |
| `/website/about/` | 100 | **91** | 100 | 100 | ❌ A11y |
| `/website/lab/car-configurator/` | 100 | **93** | 100 | 100 | ❌ A11y |
| `/website/lab/tts-cockpit/` | **86** | 96 | 100 | 100 | ❌ Perf（FCP 2.9 s / LCP 3.5 s） |

## 4. 修复清单（全部为达标修复，零阈值退让）

### 4.1 A11y · 对比度（axe `color-contrast`，权重 7）

| 问题 | 根因 | 修复 | 文件 |
|---|---|---|---|
| 全站 meta/时间戳灰字 3.31:1（`#8a8a85` on `#fafaf8`）——页脚 RSS/Sitemap/GitHub 链、面包屑、`dt.data`、TOC 标签等六页全中 | 亮色 token `--ink-3` 定值偏浅 | `--ink-3: #8a8a85 → #6e6e68`（4.9:1 on `--bg`，5.1:1 on `--bg-raised`；暗色 token 未动） | `src/styles/tokens.css` |
| Lab paper 主题强调色 4.1:1（`#cf4a17` on `#f5f4ef`）——`lab-code`/`lab-tldr-tag`/`lab-flow-node.hl`/结论区 `<b>` 等 | `--lab-accent`（paper）与 `.ttsc --accent` 同值偏浅 | 两处同步 `#cf4a17 → #b8420f`（≈5.0:1 on `#f5f4ef`），`--accent-soft` 底纹随动 | `src/layouts/LabLayout.astro` · `src/pages/lab/tts-cockpit.astro` |
| LIVE 状态徽章 1.86:1（`#59c99a` on 纸面） | 浅绿为暗色主题设计，paper 主题直接复用 | 新增 paper 覆写 `.lab-theme-paper .lab-status-live { color: #176946 }`（≈6.1:1；暗色主题原值保留） | `src/layouts/LabLayout.astro` |
| `/about/` 首卡 proof 链接 4.25:1（`#c7592b`——axe 按混合色计量） | `.reveal` scroll-driven 动画连 opacity 一起 scrub，视口边缘卡片被 axe 抽中半透明态（非确定性失败源） | `reveal-rise` 关键帧去掉 opacity，仅保留 translateY 入场；满分色值不再被动画稀释 | `src/styles/global.css` |

### 4.2 A11y · 链接可辨识（axe `link-in-text-block`，权重 7）

正文文字中混排的链接只靠颜色区分（与周边文字对比 1.04–1.55:1 < 3:1 且无下划线），统一补常显下划线（沿用 `.prose a` 的 40% 强调色下划线样式语言）：

| 位置 | 文件 |
|---|---|
| `/about/` 讲者简介注（`/now/`、`Contact` 内链） | `src/pages/about/index.astro`（`.bio-note a`） |
| Lab 页脚注/说明区外链 + 「跳过演示」双链 | `src/layouts/LabLayout.astro`（`.lab-foot a`、`.lab-skip a`） |
| 首页 Now 卡时间戳行「完整近况 →」 | `src/components/home/NowCta.astro`（`.stamp-link`） |

### 4.3 Perf · tts-cockpit 0.86 → 99

- **根因**：四个 Noto 子集 `@font-face`（Arabic 162KB + Devanagari 119KB + Thai 27KB + Hebrew 12KB ≈ 320KB）经页面 `<head>` 注入，控制面 16 语种原生语名一渲染即命中 unicode-range 触发下载（实测 168ms 全部在首帧前发起）。Lighthouse 移动端 Slow 4G 模拟把首屏前发起的字体请求计入 FCP/LCP 悲观依赖图 → FCP 2.9 s（0.54）/ LCP 3.5 s（0.65）。
- **修复**：`@font-face` 移出 `<head>`，改由演示 `mount()` 时注入（新增 `src/lab/modules/tts-cockpit/fonts.ts`，幂等；`index.ts` mount 入口调用）。注入前原生语名走系统字体回退，注入后 unicode-range 命中文字自动换 Noto（`font-display: swap` 不变）。零第三方请求、自托管、懒加载三条脚注承诺全部保持（脚注 4 措辞已同步）。
- **效果**：FCP 2.9 s → **1.1 s**、LCP 3.5 s → **1.8 s**，Perf 0.86 → **0.99**（三轮一致）。

## 5. 回归核对（修复涉及全站 token / 布局 / 模块入口）

| 门禁 | 结果 |
|---|---|
| `pnpm astro check` | 0 errors / 0 warnings |
| `pnpm build` | 18 页构建成功 |
| `node scripts/check-links.mjs dist/` | 307 条内部引用全部有效 ✅ |
| `node scripts/audit-budget.mjs dist/` | 全部阻断级门禁通过（tts 流式豁免口径不变）✅ |
| `pnpm test:e2e` | **42/42 通过**（10.4 min；WS-PERF-01 软门禁 OBS 读数照旧不阻断） |

## 6. 复现命令

```bash
pnpm build
pnpm preview --host 0.0.0.0 &        # 或复用 astro-dev 终端，端口 4321
CHROME_PATH=$(node -e "console.log(require('@playwright/test').chromium.executablePath())") \
  pnpm dlx @lhci/cli@0.15.1 autorun --collect.settings.chromeFlags='--no-sandbox --headless=new'
```

CI 侧无需任何改动：`ci.yml` ⑤ 的 treosh action 读同一份 `lighthouserc.json`，PR 检查线即 main 合并线，断言失败直接阻断合并。
