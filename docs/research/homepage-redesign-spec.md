# 首页改版执行方案（Homepage Redesign Spec）

> **文档性质**：可直接交给开发落地的设计规格书（不是调研）。所有条目均为已定决策；执行中如需变更，先改本文档再动工。
> **上游输入**：`docs/research/portfolio-inspiration-github.md`、`docs/research/portfolio-inspiration-community.md`、`docs/research/portfolio-inspiration-tech-showcase.md`、`docs/website-plan/master-plan.md` 第 3 章（首页五区块）与第 6 章（视觉风格）
> **约束红线**：GitHub Pages 纯静态（`base: '/website'`）；Lighthouse 四项 ≥ 95；首页传输 < 200KB（不含字体）；「技术编辑部 × 工业设计」定调不动摇
> **版本**：v1.0（2026-08-24）

---

## 目录

- [1. 设计概念与情绪板](#1-设计概念与情绪板)
- [2. 首页信息架构线框](#2-首页信息架构线框)
- [3. 视觉系统规格](#3-视觉系统规格)
- [4. Hero 区最终选型](#4-hero-区最终选型)
- [5. 组件清单](#5-组件清单)
- [6. 技术依赖清单](#6-技术依赖清单)
- [7. 分阶段实施计划](#7-分阶段实施计划)
- [8. 验收标准](#8-验收标准)
- [附录：需同步修订 master-plan 的两处豁免](#附录需同步修订-master-plan-的两处豁免)

---

## 1. 设计概念与情绪板

### 1.1 设计概念一句话

**「一本运行中的座舱技术刊物」**——用技术编辑部的排版秩序承载内容与判断，用夜间仪表的 HUD 语言承载可交互的能力证据（两个 Live Demo）；刊物负责让人读懂，仪表负责让人信服。

这句话同时回答了三份调研的核心结论：

- 社区共识「首屏 10 秒说清你是谁」→ 刊物式排版优先，Hero 文案 3 秒可读完（community §1.1）；
- 社区唯一认可的炫技是「炫的正是你卖的」→ 仪表/车模元素全部与「智能座舱」岗位强相关，不做通用粒子/紫色星空（community §2 反模式 8/15，github §5.3 红线）；
- 「记忆点来自低成本高品味的细节」→ 单一信号色、等宽数字、日间/夜间驾驶模式切换，而非全屏特效（community §5.2 第 7 条）。

### 1.2 情绪板关键词（4 个）

| 关键词 | 含义 | 视觉落点 |
|--------|------|---------|
| **技术刊物（Editorial）** | 严肃技术出版物的排版秩序：网格、留白、层级 | 编号章节标题、68–72ch 阅读主轴、hairline 分隔线 |
| **夜间座舱（Night Cockpit）** | 暗底高对比、单一信号色、信息密度即美学 | 暗色模式一等公民、HUD 式徽章、等宽数字 |
| **工程图纸（Blueprint）** | 线框、标注、参数外显，「懂行的人看得出深浅」 | 线框风架构图、技术参数角标（`KTX2 · Draco · HDRI`） |
| **量产精密（Production-grade）** | 克制、对齐、无一处未完成感 | 4px 间距基数、无 Coming soon、无断链 |

---

## 2. 首页信息架构线框

五个可见区块，与 master-plan 第 3 章五区块的映射关系：Hero（区块 1）→ 能力三支柱（区块 2）→ AI Lab 入口（区块 2.5，证据前置，tech-showcase §5.3 建议位）→ 旗舰案例预览（区块 3）+ 精选观点（区块 4，Phase 3 填充）→ Now + CTA（区块 5）。信任递进不变：**定位 → 能力 → 证据 → 观点 → 近况**。

```text
┌────────────────────────────────────────────────────────────────────┐
│ SiteHeader： 王磊 W.L.    Work  Insights  AI Lab  About  Contact ◐ │ ← ◐ = 日间/夜间驾驶模式切换
╞════════════════════════════════════════════════════════════════════╡
│ [1] HERO（100svh 以内，文字 3 秒可读完）                              │
│ ┌──────────────────────────────┬─────────────────────────────────┐ │
│ │ SOLUTIONS · AUTOMOTIVE AI    │                                 │ │ ← 英文 eyebrow 标签（Inter 大写）
│ │ 王磊｜汽车智能座舱与           │      CarConcept 车模舞台         │ │
│ │ AI 解决方案经理（H1）          │   Phase 1: poster 静态图         │ │
│ │ 把复杂技术转化为可决策、        │   Phase 2: WebGPU 慢速自转       │ │
│ │ 可交付、可复用的解决方案        │   （facade：poster→canvas 淡入） │ │
│ │                              │  ┌───────────────────────────┐  │ │
│ │ 聚焦 汽车×座舱×多语种×大模型   │  │ ● WebGPU · 60fps   [徽章] │  │ │ ← 实时后端徽章（Phase 2）
│ │ ×AI 工作流 的交叉地带          │  └───────────────────────────┘  │ │
│ │ [查看旗舰案例 →] [联系合作]    │   ○ ○ ○ ○ ○ ← 车漆色块深链      │ │
│ └──────────────────────────────┴─────────────────────────────────┘ │
╞════════════════════════════════════════════════════════════════════╡
│ [2] 能力三支柱     01 / CAPABILITIES ─────────────────────────────  │ ← SectionHeading：编号+英文标签+hairline
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           │
│ │ 智能座舱多语种   │ │ 端云大模型      │ │ AI 原生工作流    │           │
│ │ 一句能力描述     │ │ 一句能力描述    │ │ 一句能力描述     │           │
│ │ N 语种 · N 市场 │ │ 端云分层 · 选型 │ │ 提效约 X%       │           │ ← 量化锚点（等宽数字）
│ │ → 旗舰案例 A    │ │ → 旗舰案例 B   │ │ → 旗舰案例 C    │           │
│ └────────────────┘ └────────────────┘ └────────────────┘           │
╞════════════════════════════════════════════════════════════════════╡
│ [3] AI Lab 入口   02 / LIVE DEMOS ────────────────────────────────  │
│ ┌───────────────────────────────┬──────────────────────────┐       │
│ │ 3D 汽车配置器（大卡，7 列）      │ TTS 智能座舱（中卡，5 列）  │       │
│ │ poster + hover 车漆色块         │ 假波形条（hover 播放）      │       │
│ │ [WebGPU][KTX2][Draco][HDRI]    │ 语种轮播 zh→ar→ja→…       │       │ ← 技术参数角标
│ │ 进入配置器 →（VT morph）        │ [16语种][逐词][RTL]        │       │
│ └───────────────────────────────┴──────────────────────────┘       │
╞════════════════════════════════════════════════════════════════════╡
│ [4] 旗舰案例预览   03 / SELECTED WORK ─────────────────────────────  │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           │
│ │ 案例 A [L2]     │ │ 案例 B [L3]    │ │ 案例 C [L3]     │           │ ← 证据等级徽章
│ │ 问题：……        │ │ 问题：……       │ │ 问题：……        │           │
│ │ 动作：……        │ │ 动作：……       │ │ 动作：……        │           │
│ │ 结果：……        │ │ 结果：……       │ │ 结果：……        │           │
│ │ 配套 Demo →     │ │                │ │                │           │ ← 案例↔Demo 证据链挂钩
│ └────────────────┘ └────────────────┘ └────────────────┘           │
│ ── 04 / VIEWPOINTS（精选观点 4–6 条，Phase 3 填充，featured 驱动）──  │
│ · 标题 —— 一句话结论 · 日期        · 标题 —— 一句话结论 · 日期        │
╞════════════════════════════════════════════════════════════════════╡
│ [5] NOW + CTA     05 / NOW ───────────────────────────────────────  │
│ 正在研究 ……｜正在写 ……｜开放合作类型 ……     最后更新 2026-08         │ ← 等宽时间戳，「活网站」信号
│ ┌──────────────────────────────────────────────────────┐           │
│ │  有类似问题要解决？  [邮件联系]  [LinkedIn] [GitHub]     │           │
│ └──────────────────────────────────────────────────────┘           │
│ SiteFooter：© · RSS · Sitemap · 本站首页 < 200KB（性能自证行）       │
└────────────────────────────────────────────────────────────────────┘
```

**移动端（< 640px）**：全部单列堆叠，顺序不变。Hero 车模舞台退化为 poster + 「进入 3D 配置器」按钮（永不自动挂载 three，`pointer: coarse` 判定）；Lab 两卡上下排列；三支柱与案例卡纵向排列。首屏保证 H1 + 副标题 + 双 CTA 完整可见。

---

## 3. 视觉系统规格

以 CSS 自定义属性落在 `src/styles/tokens.css`，全站唯一 token 源。

### 3.1 色彩

强调色决策：**工业橙**（master-plan 第 6 章「工业橙或信号蓝」二选一）。理由：a) 汽车语境天然（警示色/卡钳/内饰氛围灯）；b) 与蓝紫渐变的「AI 味模板脸」批量竞品彻底区分（community 反模式 8）；c) 暗底夜间仪表上对比冲击最好。全站唯一强调色，Lab/Demo 页 HUD 元素同样使用橙色阶，**不引入第二强调色**。

| Token | Light（日间） | Dark（夜间，一等公民） | 用途 |
|-------|--------------|----------------------|------|
| `--bg` | `#FAFAF8` 纸白 | `#0C0D0F` 近黑冷调 | 页面底色 |
| `--bg-raised` | `#FFFFFF` | `#16181B` | 卡片/浮层 |
| `--ink` | `#111111` | `#ECEBE6` | 标题/正文 |
| `--ink-2` | `#55554F` | `#A8A8A0` | 次级文字 |
| `--ink-3` | `#8A8A85` | `#6E6E68` | meta/时间戳 |
| `--line` | `#E4E4DE` | `#26282C` | hairline 分隔线/卡片描边 |
| `--accent` | `#BF3F0A` | `#FF8A4A` | 强调色·文本级（对白/黑底对比 ≥ 4.5:1） |
| `--accent-strong` | `#E8590C` | `#FF6B1A` | 强调色·图形级（大字号/徽章/进度条） |
| `--accent-soft` | `rgba(232,89,12,.10)` | `rgba(255,122,26,.14)` | 强调底纹/hover 背景 |

规则：

- 主题切换：默认跟随系统（`prefers-color-scheme`），Header 提供手动切换（微文案「日间/夜间驾驶模式」），`localStorage` 持久化 + `<head>` 内联脚本防闪烁（FOUC）；
- 文字对比度一律 ≥ 4.5:1（大标题 ≥ 3:1）；`--accent` 专供可读文本，图形装饰才用 `--accent-strong`；
- 禁用重度 glassmorphism；仅固定导航条允许一处 `backdrop-filter: blur()`（tech-showcase §3.2）。

### 3.2 字体层级

字体栈（延续现有 `public/fonts/` 手放子集模式，中文不加载 web font）：

```css
--font-sans: 'Inter Variable', Inter, 'Source Han Sans SC', 'Noto Sans SC',
             'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
--font-mono: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace,
             'SF Mono', Consolas, monospace;
```

| 层级 | 字体/字重 | 尺寸 | 行高 | 用途 |
|------|----------|------|------|------|
| Display | 中文黑体栈 700 | `clamp(2.125rem, 1.5rem + 3vw, 3.25rem)` | 1.15 | Hero H1（仅一处） |
| H2 | 黑体栈 600 | `clamp(1.5rem, 1.2rem + 1.5vw, 2rem)` | 1.25 | 区块标题 |
| H3 | 黑体栈 600 | `1.1875rem` | 1.45 | 卡片标题 |
| Body | 黑体栈 400 | `1.0625rem`（17px） | 1.8 | 中文正文，主轴 68–72ch |
| Small | 400 | `0.875rem` | 1.6 | 辅助说明 |
| Label（eyebrow） | Inter 500 | `0.75rem` | 1 | 英文小标签，`text-transform: uppercase; letter-spacing: 0.08em` |
| Data | JetBrains Mono 500 | `0.8125rem` | 1.4 | 量化锚点/徽章/时间戳，`font-variant-numeric: tabular-nums` |
| Code | JetBrains Mono 400 | `0.875rem` | 1.7 | 代码块（内容页） |

规则：Inter 与 JetBrains Mono 均 self-host 可变字体 latin 子集（各约 30–50KB，woff2，`font-display: swap`，不计入 200KB 预算但计入体验）；所有数字场景（量化锚点、日期、fps 徽章）强制等宽 + tabular-nums——这是「仪表感」的最低成本来源。

### 3.3 间距与栅格

| 项 | 规格 |
|----|------|
| 间距基数 | 4px；token 序列 `--space-1..10` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px |
| 页面容器 | `max-width: 72rem`（1152px）；左右安全边距 `clamp(1.25rem, 4vw, 2.5rem)` |
| 栅格 | 12 列 CSS Grid，gutter 24px；三支柱 4+4+4；Lab bento 大卡 7 列 + 中卡 5 列；案例 4+4+4 |
| 阅读主轴 | 正文 `max-inline-size: 70ch`（详情页；首页卡片文案不受限） |
| 区块垂直节奏 | `padding-block: clamp(4rem, 10vh, 8rem)`；区块标题与内容间距 `--space-7`（48px） |
| 断点 | 640px（单列→多列）/ 960px（bento 启用）/ 1200px（满栅格） |
| 卡片 | 圆角 8px、1px `--line` 描边、`--bg-raised` 底；不用投影堆叠，层级靠描边与底色 |

### 3.4 动效原则

总原则：**平台原生优先（0KB JS），一次性优于循环，克制优于炫技**。全站基线即 tech-showcase 方案五（View Transitions + scroll-driven CSS + 微交互），Hero 再叠加选型方案。

| 场景 | 规格 |
|------|------|
| **入场** | 每区块首次进入视口播一次：`opacity 0→1` + `translateY(12px)→0`，400–600ms，卡片组 stagger 60ms；用 CSS `animation-timeline: view()` 包 `@supports` 守卫，不支持的浏览器直接呈现终态。**Hero 文案永不做入场延迟**（LCP/3 秒可读红线），仅允许 poster→canvas 400ms 交叉淡入 |
| **滚动** | v1 禁 pin/scrub/滚轮劫持/平滑滚动库（Lenis 不引入）；视差全站禁用，唯一豁免：Hero 区内 < 8% 层间速差；内容详情页阅读进度条用 `animation-timeline: scroll()` |
| **悬停** | 只动 `transform`/`opacity`；卡片 `translateY(-2px)` + 描边转 `--accent-strong`；CTA 位移 ≤ 4px；150–200ms ease-out；信息不得只在 hover 出现（触屏等效可达） |
| **转场** | 全站 `@view-transition { navigation: auto }`（Firefox 自动整页跳转，零风险）；Lab 卡片图 ↔ Lab 页头图共享 `view-transition-name: demo-car / demo-cockpit`，点击卡片 morph 放大为 Demo 页头图 |
| **循环动画配额** | 全站同时可见的循环动画 ≤ 2 处：Hero 车模慢速自转（Phase 2）与 TTS 卡语种轮播；两者必须视口外暂停（IntersectionObserver）+ 标签页隐藏暂停；TTS 假波形默认静态，hover/focus 才播放（规避 community 反模式 2「循环动画干扰评估」） |
| **降级三层** | CSS 层 `@media (prefers-reduced-motion: reduce)` 关全部动画；JS 层不初始化 3D/轮播；资产层不下载 three chunk（省 256KB） |
| **绝对禁止** | preloader 开屏动画、自定义光标/磁吸光标、滚轮劫持、循环背景动画、音频自动播放（community 反模式 1/2；tech-showcase §3.3） |

---

## 4. Hero 区最终选型

从 tech-showcase 第 2 章 5 套方案中选定：

### 4.1 主方案：方案一「实车即首屏」（配置器资产升格 Hero）

左侧定位文案（3 秒读完），右侧 CarConcept 车模舞台：Phase 1 为 28KB poster 静态图；Phase 2 视口进入 + idle 后动态 `import()` 现有 three/webgpu chunk，poster 交叉淡入为慢速自转的实时车模，右下角实时后端徽章（`WebGPU · 60fps` / `WebGL 2`），下方车漆色块点击带 `?paint=` 深链进入完整配置器。

**推荐理由**：

1. **领域强相关是社区认可炫技的唯一前提**（community §5.2 规则 2）：真车 + 实时渲染直接印证「汽车智能座舱」定位，访客 3 秒内同时完成「他是做座舱的」+「这站技术含量高」两个判断；
2. **增量成本最低的高冲击方案**：WebGPU 渲染管线、KTX2/Draco 资产、poster（`public/posters/car-configurator-poster.webp`）、URL 状态深链全部现成，新工作只有 viewer 精简入口抽取 + facade 编排（tech-showcase 评为工作量 M）；
3. **性能天然可控**：three chunk（256KB gzip）不进首屏关键路径，首屏增量仅 poster 28KB + 编排脚本 < 5KB，200KB 预算轻松成立（tech-showcase §4.1 实测基线）；
4. **降级链内建**：reduced-motion / 无 WebGL / 移动端 / 数据节省模式一律停在 poster——poster 本身就是合格的 Hero 视觉，「加载失败页面完全成立」（github §4.3 craftzdog 模式）。

### 4.2 降级方案：方案二「座舱开机序列」（HMI Boot Sequence）

零 WebGL：SVG 环形仪表 `conic-gradient` + `@property` 扫描归位、状态图标逐个点亮、多语种问候逐词打出（复用 `src/data/tts-manifest.json` 语料与 RTL 逻辑），≤ 900ms 播完且 `sessionStorage` 标记只播一次，定格为定位文案。

**选它做降级的理由**：

1. 五套方案中唯一**零 WebGL 仍高冲击**的方案，彻底绕开 three chunk 与 GPU 依赖，任何设备可用；
2. **岗位更对口**：解决方案经理的日常对象是 HMI 而非渲染管线，「首屏即一块 HMI」的叙事独立成立，不是主方案的残缺版；
3. 与主方案**资产互补不冲突**：其仪表元素本来就规划下放到 TTS 入口卡（tech-showcase 推荐组合），先做降级方案不浪费任何工作量。

**触发条件**（满足任一即整体切换为方案二）：Phase 2 中 viewer 抽取受阻或中端手机（4x CPU throttle）上主方案掉出 Lighthouse Performance 95；或运营期数据表明 3D 挂载率过低。

### 4.3 落选方案处置

- 方案三（shader 渐变 + 动力学排版）：不扣汽车主题，有「AI 味渐变」风险，弃；ScrambleText 多语种彩蛋思路可在 Phase 2 作为 TTS 卡微交互复用；
- 方案四（滚动叙事）：工作量 L 且触碰「无滚动劫持」红线边缘，列 v2 迭代，不进本次范围；
- 方案五（编辑部克制 + 原生动效满配）：不是 Hero 方案而是**全站动效基线**，已吸收进 §3.4，与主/降级方案叠加使用。

---

## 5. 组件清单

需新建的文件（现状：仓库无 layouts/、components 仅有 Demo 内部脚本）。命名与 master-plan 7.2 目录规划对齐。

### 5.1 样式与布局

| 文件 | 职责 | 阶段 |
|------|------|------|
| `src/styles/tokens.css` | §3 全部设计 token（色彩/字体/间距/动效时长），全站唯一来源 | P1 |
| `src/styles/global.css` | reset、正文排版、`@view-transition`、`@supports` 入场动画、reduced-motion 守卫 | P1 |
| `src/layouts/BaseLayout.astro` | HTML 骨架、SEO meta/JSON-LD 插槽、字体预加载、主题防闪烁内联脚本、Header/Footer 组装 | P1 |

### 5.2 全站组件

| 文件 | 职责 | 阶段 |
|------|------|------|
| `src/components/SiteHeader.astro` | 顶部导航（六栏目）+ ThemeToggle；移动端折叠 | P1 |
| `src/components/SiteFooter.astro` | 版权、RSS/Sitemap、性能自证行（「本站首页 < 200KB」） | P1 |
| `src/components/ThemeToggle.astro` | 日间/夜间驾驶模式切换（含 localStorage 逻辑，≤ 1KB 内联） | P1 |
| `src/components/SectionHeading.astro` | 编号章节标题（`01 / CAPABILITIES` + hairline），brittanychiang 式层级锚点 | P1 |
| `src/components/ui/CtaButton.astro` | 主/次两态 CTA 按钮 | P1 |
| `src/components/ui/EvidenceBadge.astro` | 证据等级徽章 L1–L4（等宽字体，master-plan 附录 B） | P1 |
| `src/components/ui/TechChip.astro` | 技术参数角标（`KTX2`、`RTL`、`WebGPU`…），芯片状等宽小标签 | P1 |

### 5.3 首页区块组件

| 文件 | 职责 | 阶段 |
|------|------|------|
| `src/components/home/HomeHero.astro` | 区块 1：eyebrow + H1 + 副标题 + 一句话展开 + 双 CTA，右侧舞台插槽 | P1 |
| `src/components/home/HeroCarStage.astro` | Hero 车模舞台：P1 输出 poster（`fetchpriority="high"` + 显式宽高）；P2 挂 facade 脚本、后端徽章、车漆色块深链 | P1 壳 / P2 满血 |
| `src/components/home/PillarCard.astro` | 区块 2：支柱名 + 能力描述 + 等宽量化锚点 + 案例链接 | P1 |
| `src/components/home/LabBento.astro` | 区块 3 容器：12 列内 7+5 bento 布局 | P1 |
| `src/components/home/LabCardCar.astro` | 3D 配置器入口卡：poster + hover 车漆色块（构建期预渲染 paint 变体 WebP）+ `view-transition-name: demo-car` | P1 静态 / P2 hover 换色 |
| `src/components/home/LabCardTts.astro` | TTS 座舱入口卡：CSS 假波形（hover 播放）+ 语种字符轮播（读 tts-manifest，RTL 时容器翻转）+ `view-transition-name: demo-cockpit` | P1 静态 / P2 轮播 |
| `src/components/home/CaseCard.astro` | 区块 4：问题→动作→结果三行 + EvidenceBadge + 「配套 Demo →」挂钩 | P1（占位文案）/ P3（真内容） |
| `src/components/home/InsightList.astro` | 区块 4 下半：featured 观点条目（标题 + 一句话结论 + 日期） | P3 |
| `src/components/home/NowCta.astro` | 区块 5：Now 摘要 + 等宽「最后更新」时间戳 + 收尾 CTA 带 | P1 壳 / P3 数据接入 |

### 5.4 脚本（非组件交付物）

| 文件 | 职责 | 阶段 |
|------|------|------|
| `src/scripts/hero-car.ts` | 从 `src/scripts/car-configurator/app.ts` 抽取 `mountViewer()` 精简入口：去 OrbitControls/UI 面板，保留自转 + HDRI + 接触阴影；供 HeroCarStage 动态 import | P2 |
| `src/scripts/lab-cards.ts` | 语种轮播 + 波形 hover 播放 + 视口暂停（≤ 2KB，vanilla） | P2 |

现有 `src/pages/lab/*.astro` 两页仅需接入 BaseLayout 与 `view-transition-name`，不重写。

---

## 6. 技术依赖清单

**核心结论：Phase 1 零新增运行时依赖。** 全站基线（View Transitions、scroll-driven CSS、bento、主题切换）全部平台原生，这本身就是给懂行访客的技术信号（tech-showcase 方案五）。

| 包 | 版本 | 阶段 | 为何选它 |
|----|------|------|---------|
| —（无新增） | — | P1 | 原生 CSS + `@view-transition` + `@supports` 覆盖 P1 全部动效；不引 Tailwind（沿用现有 CSS 变量 + scoped style 体系，master-plan 7.2 已定 styles/ 目录制） |
| `motion` | ^12 | P2（可选） | vanilla `animate()` 仅 ~3.8KB gzip，覆盖数字滚动、Hero poster→canvas 编排等 WAAPI 写起来啰嗦的场景；**仅当手写 WAAPI 超过 ~100 行时才引入**，否则继续零依赖 |
| `gsap` | ^3.13 | P2（可选） | 2025-04 起全插件免费；仅当选做 SplitText 标题入场或 ScrambleText 多语种解码彩蛋时引入（core + 插件约 70–80KB gzip，占预算大，默认不装） |

**明确不引入**（与调研结论一致，写入依赖红线）：

- `react` / `@astrojs/react` / R3F —— 一个 island = +45KB React runtime，vanilla three 已验证可行（github §5.3）；
- `lenis` —— 平滑滚动本质是轻度滚动劫持，与总纲红线冲突（tech-showcase §3.2）；
- `tailwindcss` —— 现有体系为 token CSS 变量 + Astro scoped style，引入反而破坏一致性；
- `@paper-design/shaders` / `tsparticles` / 流体模拟 —— 主/降级 Hero 方案均不需要，通用粒子/渐变触发「AI 味模板脸」反模式；
- 字体不走 npm（fontsource）—— 延续 `public/fonts/` 手放子集 woff2 的现有模式（新增 `inter-var-latin.woff2`、`jetbrains-mono-var-latin.woff2` 两个文件即可）。

---

## 7. 分阶段实施计划

每个 Phase 是独立可合并、可上线的交付单元；Phase N 未过验收门禁不得开始 Phase N+1 的合并。

### Phase 1：MVP 视觉升级（一次集中冲刺可交付）

**范围**：占位首页 → 完整五区块静态首页 + 全站视觉系统。

| # | 任务 | 产出 |
|---|------|------|
| 1 | `tokens.css` + `global.css` + `BaseLayout.astro`（含主题切换、防闪烁、字体子集接入） | 视觉系统落地 |
| 2 | SiteHeader / SiteFooter / SectionHeading / CtaButton / EvidenceBadge / TechChip | 全站组件库 |
| 3 | 首页五区块组装：HomeHero（poster 静态舞台）+ PillarCard ×3 + LabBento（两张静态卡）+ CaseCard ×3（占位文案按「问题→动作→结果」格式写实）+ NowCta 壳 | `src/pages/index.astro` 重写 |
| 4 | `@view-transition` 全站接入；Lab 卡 ↔ Lab 页 `view-transition-name` 打通；scroll-driven 入场 reveal | 转场与动效基线 |
| 5 | 两个 Lab 页接入 BaseLayout（视觉统一，不改功能） | 全站一致性 |

**门禁**：§8 全部指标通过（此阶段 JS 增量应为 ~1KB 主题脚本，Lighthouse 四项 98+ 无悬念）。

### Phase 2：炫技层

**范围**：静态 Hero → 实时 Hero；静态卡 → 活卡。

| # | 任务 | 产出 |
|---|------|------|
| 1 | 抽取 `hero-car.ts`（`mountViewer()` 精简入口） | 车模复用管线 |
| 2 | HeroCarStage facade 编排：视口 + `requestIdleCallback` 后动态 import，poster 400ms 交叉淡入，实时后端徽章，移动端/reduced-motion/无 WebGL 停 poster | 主方案 Hero 满血 |
| 3 | 车漆色块 hover 换 poster 变体（构建期每 paint 预渲染 ~20KB WebP）+ `?paint=` 深链 | 「未进 Demo 已在配置」 |
| 4 | LabCardTts 语种轮播 + RTL 翻转 + 假波形 hover 播放（`lab-cards.ts`，视口外暂停） | TTS 卡微动画 |
| 5 | 量化锚点数字滚动入场（WAAPI 或 motion，视 #6 决策） | 仪表感细节 |
| 6 | 中端机实测：4x CPU throttle 下 Performance ≥ 95，不达标触发 §4.2 降级切换 | 性能回归报告 |

**门禁**：§8 全指标 + 循环动画配额（≤ 2 处、视口外暂停）核验 + 三层降级路径逐条人工验证。

### Phase 3：内容填充

**范围**：占位文案 → 真实内容与数据驱动。

| # | 任务 | 产出 |
|---|------|------|
| 1 | Content Collections（`work` / `insights` / `ai-lab` 三 collection + zod schema，master-plan 7.3） | 内容基建 |
| 2 | 旗舰案例 A 十二模块成文（八问题模板自访谈先行），B/C 精简版；CaseCard 接真数据与证据等级 | 区块 4 上半真内容 |
| 3 | InsightList 接入 `featured: true` 精选观点（4–6 篇） | 区块 4 下半上线 |
| 4 | `/now/` 页面 + NowCta 数据接入（最后更新时间戳自动化） | 区块 5 活化 |
| 5 | SEO 收尾：JSON-LD（Person/WebSite/Article）、每页手写 description、OG 图 | 分发就绪 |

**门禁**：§8 全指标 + 首页无任何占位文案/断链/「Coming soon」（community 反模式 12）+ 脱敏 Checklist（master-plan 13.2）逐条通过。

---

## 8. 验收标准

每个 Phase 合并前全部通过；任何一条不过即阻断合并。

### 8.1 Lighthouse 四项 ≥ 95

```bash
pnpm build && pnpm preview --host 0.0.0.0 &
npx lighthouse http://localhost:4321/website/ \
  --output=json --output=html --chrome-flags='--headless --no-sandbox'
```

Performance / Accessibility / Best Practices / SEO 四项 ≥ 95（移动端预设）。Phase 2 追加：Chrome DevTools 4x CPU throttle + Fast 4G 下复测 Performance ≥ 95。

### 8.2 首屏传输 < 200KB（不含字体）

预算分配（gzip 后，`pnpm build` 产物核算）：

| 项 | 预算 | 说明 |
|----|------|------|
| HTML + CSS | ≤ 35KB | token + 全局 + 首页 scoped |
| Hero poster | ≤ 40KB | 现有 poster 28KB，`fetchpriority="high"` + 显式宽高 |
| JS（主题 + 编排 + 卡片微交互） | ≤ 15KB（若引 GSAP 放宽至 80KB，需专项审批） | P1 实际 ~1KB |
| 图标/其他首屏图 | ≤ 30KB | SVG 优先 |
| three chunk / 模型 / HDRI | **0** | 永不进首屏关键路径，交互后按需 |
| **合计** | **≤ 120KB 常态，200KB 硬上限** | 每个 PR 在描述中附「预算行」：新增 KB / LCP 影响 / 降级路径 |

### 8.3 10 秒定位测试

- 方法：招募 3–5 名测试者（至少 1 名 HR/猎头视角 + 1 名行业同行），**手机**打开首页，10 秒后收起设备，回答三问：①他是谁？②他做什么？③找他能干嘛？
- 通过线：≥ 80% 测试者答对至少两问；
- 追加 30 秒测试：能否说出至少一个可点击的「证据」（Demo 或案例）——验证证据前置有效。

### 8.4 移动端可用

- 375px 视口（iPhone SE）：无横向滚动、无 CLS（Lighthouse CLS < 0.1）、首屏 H1 + 副标题 + 双 CTA 完整可见；
- 3D 永不自动挂载（`pointer: coarse` + 窄视口判定），poster + 显式按钮替代；
- 触控目标 ≥ 44×44px；信息不依赖 hover 呈现；
- 中端机（4x CPU throttle）TTI < 3.5s。

### 8.5 无障碍与降级（随每 Phase 回归）

- `prefers-reduced-motion: reduce` 三层降级逐条人工验证（CSS 动画全关 / 3D 与轮播不初始化 / three chunk 无网络请求）；
- 键盘可完整导航五区块与全部 CTA，焦点样式可见；
- 文字对比度 ≥ 4.5:1（axe DevTools 或 Lighthouse a11y 审计无 contrast 报错）；
- Firefox（无跨文档 View Transitions）与无 WebGL 环境下页面功能完整、无报错。

---

## 附录：需同步修订 master-plan 的两处豁免

按 master-plan 尾注「与后续单项设计文档冲突时以总纲为准」，以下两条在动工前需先补进总纲第 6 章（均已在 tech-showcase 附录 A 论证）：

1. **Hero 实时渲染层豁免**：第 3 章「无轮播、无大图 banner」针对营销式 banner；Hero 区允许一个与 Demo 同源的实时渲染层（poster facade 模式），前提是 3 秒文案可读性与 200KB 首屏预算不受损。
2. **循环动画配额**：第 6 章「仅保留必要的 hover 与页面渐入」补注——全站允许 ≤ 2 处呼吸级循环动画（Hero 车模自转、TTS 语种轮播），必须视口外暂停且受 reduced-motion 约束。

视差禁令维持不变（Hero 区内 < 8% 层间速差豁免已在 tech-showcase 附录 A 记录）。
