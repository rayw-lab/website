# GitHub 顶级个人网站 / Portfolio 调研（灵感与技术方案）

> 调研日期：2026-08-24。Star 数为调研当日近似值。
> 调研方法：WebSearch + WebFetch 遍历 awesome 列表（emmabostian/developer-portfolios、Evavic44/portfolio-ideas、Kiran1689/Awesome-Dev-Portfolios）、GitHub topics（`portfolio-website` 2.8 万+ 仓库、`developer-portfolio`、`personal-website`、`creative-portfolio`）、具体名站源码（bruno-simon.com、craftz.dog、brittanychiang.com、leerob.io、joshwcomeau.com、antfu.me、raphaelameaume.com 等）以及 Codrops / css-tricks / webstatus.dev 等技术趋势来源。
>
> 本文档服务对象：**王磊｜汽车智能座舱与 AI 解决方案经理**的个人网站（Astro + GitHub Pages，已上线 TTS 智能座舱 Demo 与 Three.js 3D 汽车配置器）。第 5 章为针对本项目的落地建议。

---

## 1. Top 15 参考站点 / Repo 总表

| # | 名称 | URL | GitHub（Star） | 技术栈 | 亮点 | 炫技点 | 适用场景 |
|---|------|-----|----------------|--------|------|--------|----------|
| 1 | Bruno Simon Folio 2019 | https://bruno-simon.com（旧版） | [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019)（4.7k） | Three.js + Cannon.js 物理 + Blender + GLSL | 「开车探索」式 portfolio，3D 交互 portfolio 的开山之作 | 全场景 WebGL、物理引擎驾驶、烘焙贴图性能优化 | 学习 3D 场景组织 / Blender→Web 管线 |
| 2 | Bruno Simon Folio 2025 | https://bruno-simon.com | [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025)（1.7k） | Three.js **WebGPU + TSL**（WebGL 双跑）、Blender 源文件全开源 | 2025 重制版，代表 3D 个人站最前沿水位 | TSL 节点材质一套代码同时编译 WebGL/WebGPU | 追踪 WebGPU 时代 3D 个人站的最佳教材 |
| 3 | Brittany Chiang v4 | https://v4.brittanychiang.com | [bchiang7/v4](https://github.com/bchiang7/v4)（8.3k） | Gatsby + styled-components | 工程师简洁风的事实标准，被 fork 4.2k 次 | 编号章节标题、featured 项目交错布局、克制动效 | 信息架构 / 视觉层级范本（技术栈已过时，学结构不学栈） |
| 4 | Takuya Matsuyama（craftz.dog） | https://www.craftz.dog | [craftzdog/craftzdog-homepage](https://github.com/craftzdog/craftzdog-homepage)（2.5k） | Next.js + Chakra UI + Three.js + Framer Motion | 首屏 3D voxel 柴犬 + 极干净的排版，配套 YouTube 教程 | 懒加载 GLB + 进场旋转动画、页面切换 Framer Motion | 「轻 3D 点缀 + 内容为主」的平衡范本，最接近本项目定位 |
| 5 | Lee Robinson | https://leerob.com | [leerob/next-mdx-blog](https://github.com/leerob/next-mdx-blog)（7.6k） | Next.js App Router + MDX + Tailwind | Vercel 系 writing-first 极简站的标杆 | 极致性能与 SEO、自动 OG 图、零装饰 | 以文章/观点建立行业影响力的管理者型个人站 |
| 6 | Tailwind Nextjs Starter Blog | https://tailwind-nextjs-starter-blog.vercel.app | [timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog)（10.4k） | Next.js + TypeScript + MDX + Tailwind | 最高星的博客型个人站模板，180 位贡献者持续维护 | 服务端 Shiki 高亮、KaTeX、RSS/站点地图/评论系统全内置 | 需要成熟博客基建时的功能清单参照 |
| 7 | JS Mastery 3D Portfolio | https://jsmastery.pro | [adrianhajdin/project_3D_developer_portfolio](https://github.com/adrianhajdin/project_3D_developer_portfolio)（7.1k） | React + Vite + R3F + drei + Tailwind | 最高星 3D portfolio 教程模板 | 3D 星空背景、悬浮技能球、EmailJS 联系表单 | 快速理解 R3F portfolio 的常见套路（也是同质化重灾区，慎抄样式） |
| 8 | Henry Heffernan | https://henryheffernan.com | [henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website)（2.3k） | TypeScript + Three.js + GLSL（另有 2D OS 仓库） | 3D 场景里一台 90 年代电脑，屏幕内运行可交互的模拟操作系统 | CRT shader、场景内嵌 iframe OS、声音设计 | 「叙事式沉浸」路线的极致案例；曾登 HN 热榜 |
| 9 | Anthony Fu | https://antfu.me | [antfu/antfu.me](https://github.com/antfu/antfu.me)（1.1k） | Vue 3 + Vite（Vitesse）+ UnoCSS | 顶级开源作者的极简站；首页「plum」梅枝生成艺术 | canvas 递归分形一次成画、暗色模式 View Transition 涟漪切换 | 「克制的生成艺术 + 内容优先」路线；性能极佳 |
| 10 | Josh W. Comeau | https://www.joshwcomeau.com | 未开源，但有两篇完整架构自述（[v1](https://www.joshwcomeau.com/blog/how-i-built-my-blog/)、[v2](https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/)） | Next.js App Router + MDX（next-mdx-remote）+ Linaria + Shiki + React Spring/Framer Motion | 交互式博客的天花板：文章内嵌可玩的物理/动画 widget | MDX 内嵌自定义 React 组件、音效（use-sound）、彩蛋文化 | 「用交互讲解专业知识」——对讲座舱/AI 方案最有借鉴价值 |
| 11 | Maxime Heckel | https://blog.maximeheckel.com | [MaximeHeckel/blog.maximeheckel.com](https://github.com/MaximeHeckel/blog.maximeheckel.com)（0.7k） | Next.js + R3F + 自研设计系统 | shader/粒子/光线追踪深度长文，文内全是实时 WebGL 演示 | 折射/色散/焦散 shader、FBO 百万级粒子、Moebius 后处理 | 「技术高深」路线的内容范本；shader 学习资料库 |
| 12 | Bruno Simon My Room in 3D | https://my-room-in-3d.vercel.app | [brunosimon/my-room-in-3d](https://github.com/brunosimon/my-room-in-3d)（4.5k） | Three.js + Blender 烘焙 | 单场景「我的房间」，小而美 | 全烘焙光照一张贴图跑满 60fps、屏幕视频贴图 | 低成本做一个高质感 3D 名片场景 |
| 13 | Magic Portfolio（Once UI） | https://magic-portfolio.com | [once-ui-system/magic-portfolio](https://github.com/once-ui-system/magic-portfolio)（1.4k） | Next.js + Once UI + MDX | 2024-2026 增长最快的 portfolio 模板之一 | 自动 OG 图/schema 生成、内容驱动渲染、URL 密码保护 | work/blog/gallery/about 四区信息架构参照 |
| 14 | midudev Porfolio | https://porfolio.dev | [midudev/porfolio.dev](https://github.com/midudev/porfolio.dev)（1.5k） | **Astro** + Tailwind | 西语圈最大技术主播的 Astro portfolio 示例 | 零 JS 首屏、badge 化技能标签、时间线经历区 | 与本项目同栈（Astro）的结构参照 |
| 15 | Astrofy / AstroPaper | https://astrofy-template.netlify.app | [manuelernestog/astrofy](https://github.com/manuelernestog/astrofy)（1.4k）、[satnaing/astro-paper](https://github.com/satnaing/astro-paper)（4.2k） | **Astro** + Tailwind（+ DaisyUI） | Astro 生态最高星的 portfolio/博客双模板 | 内容集合驱动、CV/项目/商店/RSS 一体 | Astro 站功能拼图（搜索、草稿、分页、动态 OG）参照 |

**灵感索引类仓库**（不作为技术参照，作为「看别人怎么做」的目录）：

- [emmabostian/developer-portfolios](https://github.com/emmabostian/developer-portfolios)（26.1k star）：数百个真人 portfolio 链接清单，按字母排列。
- [Evavic44/portfolio-ideas](https://github.com/Evavic44/portfolio-ideas)：带截图和点评的 portfolio 创意策展。
- [Kiran1689/Awesome-Dev-Portfolios](https://github.com/Kiran1689/Awesome-Dev-Portfolios)：站点 + 源码仓库成对收录，方便「看到喜欢的直接读源码」。
- 创意开发者个站（未开源但值得研究交互）：[raphaelameaume.com](https://raphaelameaume.com)（notes「连点解锁」交互、生成视觉；其开源创意编码工具 [fragment](https://github.com/raphaelameaume/fragment) 0.9k star）。

---

## 2. 技术栈趋势分析（2024-2026）

### 2.1 框架：内容站收敛到 Astro，应用型收敛到 Next.js

| 框架 | 在个人站领域的位置（2026） | 证据 |
|------|---------------------------|------|
| **Astro** | 内容驱动个人站的默认选择。零 JS 基线 + Islands 按需水合 + Content Layer，天然契合 GitHub Pages 全静态 | AstroPaper 4.2k、Astrofy 1.4k、midudev 1.5k；craftzdog 新项目 `craftzdog-uses` 也转投 Astro |
| **Next.js** | 依旧是最大存量（leerob 7.6k、timlrx 10.4k、magic-portfolio），但价值集中在 RSC/ISR/动态 OG 等**需要服务端**的能力；纯静态输出时相对 Astro 无优势 | 上表 5/6/10/11/13 均为 Next |
| **SvelteKit** | 创意开发者的轻量新宠（如 [phusy2001/my-3d-resume](https://github.com/phusy2001/my-3d-resume) 用 SvelteKit 2 + Svelte 5 runes 做 3D 房间简历，Three.js 全部 `onMount` 懒加载、静态 fallback 页保 SEO） | Fragment 工具本身也用 Svelte |
| **Remix / Gatsby** | 个人站领域基本退场。Gatsby（brittanychiang v4）只剩历史标本价值；Remix 并入 React Router 后无个人站生态 | bchiang7/v4 自 2024 年起停更 |

**结论**：本项目坚持 Astro 是对的，与 2024-2026 趋势一致；不建议迁移。

### 2.2 3D：Three.js 一家独大，WebGPU/TSL 是新分水岭

- **React Three Fiber（R3F）+ drei** 仍是 React 生态标配（adrianhajdin 系模板全家桶、Maxime Heckel）。R3F v9 配合 React 19。
- **WebGPU + TSL（Three.js Shading Language）是 2025-2026 的头部玩家标志**：bruno-simon.com 2025 版全站 TSL 节点材质，一套代码编译到 WebGL 与 WebGPU 双后端；Codrops 2026 年多篇案例（shader.se 的滚动驱动 WebGPU 管线、HAOQI.DESIGN 的 DOM+WebGL 同框）都走 R3F + TSL。
- **vanilla Three.js**（不带 React）在 Astro 静态站里更划算——本项目 3D 配置器已是这个路线，无需引入 React 运行时。
- 轻量替代：**OGL**（几十 KB 级 WebGL 库）、**Spline**（设计工具导出、体积大慎用）。
- 性能共识：Blender 烘焙贴图（my-room-in-3d）、KTX2/Draco 压缩（本项目已用）、`prefers-reduced-motion` 与移动端降级、海报门面 + 点击加载。

### 2.3 动画：GSAP 免费化改变格局

| 库 | 2024-2026 关键变化 | 适用 |
|----|--------------------|------|
| **GSAP** | 2024-10 被 Webflow 收购；**2025-04 v3.13 起 100% 免费（含商用），SplitText、MorphSVG、ScrollTrigger 等原 Club 付费插件全部开放** | 滚动叙事（ScrollTrigger）、字符级文字动画（SplitText 重写后体积 -50%）、复杂时间轴 |
| **Motion**（原 Framer Motion） | 2024-11 从 Framer 独立更名 Motion（motion.dev），合并 Motion One，新增 vanilla JS / Vue API；React 侧从 `motion/react` 导入 | React islands 内的 UI 状态动画、layout 动画、`AnimatePresence` |
| **Lenis** | 15.5k star，creative web 的事实标准平滑滚动；跑在原生滚动之上（sticky/锚点/无障碍不破坏），官方强调与 WebGL 滚动同步（单一 raf 循环驱动 DOM + canvas，避免一帧延迟） | 滚动驱动的 3D/scrollytelling 页面 |
| **CSS 原生** | scroll-driven animations（`animation-timeline: scroll()/view()`）：Chrome/Edge 115+（2023-07）、Safari 26（2025-09），Firefox 截至调研仍需 flag，须 `@supports` 守卫。0 KB JS、合成器线程执行 | 进场淡入、视差、阅读进度条——静态站首选 |
| React Spring / use-sound | joshwcomeau 路线：弹簧物理 + 微音效营造 whimsy | 交互 widget 的「手感」 |

**决策框架**（引自 2026 年社区共识）：滚动进场/进度条/轻视差 → 纯 CSS；复杂时间轴、字符动画、播放控制 → GSAP；React 组件状态动画 → Motion；页面间转场 → View Transitions API。

### 2.4 样式：Tailwind v4 为主流，CSS 原生能力上位

- **Tailwind CSS v4** 是新模板绝对主流（上表 6/7/13/14/15 全部使用）；shadcn/ui 风格 token 体系向 Astro 渗透（starfolio 等）。
- **CSS-in-JS 退潮**：styled-components（brittanychiang v4）进入维护模式；joshwcomeau 迁到零运行时的 Linaria。新项目直接用 Tailwind 或 CSS 变量 + 原生 CSS。
- **原生 CSS 新能力成为「炫技点」本身**：`:has()`、容器查询、`@property` 注册自定义属性做渐变动画、View Transitions 伪元素定制。个人站是展示这些能力的最佳试验场。
- 字体趋势：可变字体 + 本地子集化（本项目 Noto 子集已符合）；等宽字体标题风（terminal 美学）在开发者站流行。

---

## 3. 架构模式

### 3.1 Islands（Astro 核心模式）

页面主体输出纯静态 HTML，交互组件按 `client:load / client:idle / client:visible` 分优先级水合；每个 island 独立打包。**本项目两个 Demo 本质上已经是手写的 islands**（海报门面 + 点击加载 Three.js）。值得补齐的是用 `client:visible` 统一管理，而不是自己写 IntersectionObserver。

Astro 5 追加 **Server Islands**（`server:defer`，静态页中嵌请求时渲染的组件）——需要服务端运行时，**GitHub Pages 用不上**，仅做认知储备。

### 3.2 View Transitions API：MPA 拿到 SPA 的转场

- 同文档转场（`document.startViewTransition`）：Chrome 111+、Safari 18+、Firefox 131+。
- 跨文档转场（`@view-transition` at 规则）：Chrome/Edge 126+（2024-06）、Safari 18.2+（2024-12）；Firefox 未支持，但 at 规则不识别时自动整体跳过，**天然渐进增强、零风险**。
- Astro 内置 `<ClientRouter />`（v5 起的名字，即原 `<ViewTransitions />` 组件）：提供 `transition:name`（跨页元素 morph）、`transition:persist`（island 跨页保活）、不支持的浏览器自动 fallback。
- 典型用法：列表页缩略图 morph 成详情页 hero；暗色切换涟漪（antfu.me 即此效果）。

### 3.3 内容层：MDX + git-based 完胜 headless CMS（对个人站而言）

- **Astro 5 Content Layer API**：loader 即集合，Markdown/MDX/JSON/远端 CMS 统一 schema（zod 类型安全），构建时拉取。文件系统集合是个人站默认答案。
- **MDX 的杀手锏是内嵌交互组件**（joshwcomeau 模式）：文章里直接 `<SpringMechanism />`、`<WaveformPlayer />` 这类自定义 island，把「读文章」变成「玩演示」。这是内容型炫技的核心机制。
- headless CMS（Sanity/Contentful/Storyblok）只在「非技术人员协作编辑、内容量大、需要预览环境」时才划算；个人站引入 CMS 意味着构建依赖外部服务 + 密钥管理，**对 GitHub Pages 纯静态部署是负资产**。
- 对比结论：git-based（内容进仓库、PR 即审稿、Cloud Agent 可直接写内容）是本项目正解，现状无需改变。

### 3.4 「Astro + React islands」混合模式

需要 R3F/Motion 生态时，Astro 页面内可只对单个组件挂 React（`@astrojs/react` + `client:visible`），静态部分零 React 运行时。适合：某一篇案例页要用 R3F 做交互演示，而全站其余页面保持零 JS。注意：一旦挂了一个 React island，该页要付 React runtime（~45KB gz）——vanilla Three.js 能做的就不要上 R3F。

---

## 4. GitHub Pages 可落地的炫技方案（全静态、零服务端）

约束前提：本项目部署于 GitHub Pages（`base: /website`），无服务端、无 Edge Function；master-plan 门槛 Lighthouse 四项 ≥ 95、首页传输 < 200KB（不含字体）。以下方案全部兼容。

### 4.1 Shader 背景（首推，性价比最高）

- **[paper-design/shaders](https://github.com/paper-design/shaders)**（3.4k star，Apache-2.0）：28 个 WebGL2 shader（MeshGradient、NeuroNoise、Voronoi、GodRays、LiquidMetal、Dithering…），**有 vanilla JS 包 `@paper-design/shaders`，不依赖 React/Three.js，零依赖**，npm 周下载 48 万。用法：hero 容器挂一个 canvas，typed 参数调色。
- 自写单文件 fragment shader：一个 `<canvas>` + 60 行 WebGL boilerplate + 一个 noise 函数即可做出高级感背景；参考 Maxime Heckel 的 shader 系列长文。
- 降级策略：`prefers-reduced-motion` / 无 WebGL 时替换为静态 CSS 渐变；shader 画布用 `IntersectionObserver` 离屏暂停。

### 4.2 CSS Scroll-Driven Animations（0 KB JS）

- `animation-timeline: view()` 做卡片进场淡入/上移、图片视差；`animation-timeline: scroll()` 做阅读进度条。
- 全部包在 `@supports (animation-timeline: scroll())` 内，Firefox 自动退化为静态呈现——不用 JS 兜底也不破坏体验。
- 这是「静态站也能有 awwwards 感」的最低成本手段，对 Lighthouse 零影响。

### 4.3 WebGL Hero / 3D 名片场景

- 小体积路线：**OGL 或 raw WebGL** 渲染粒子场/线框网格（几 KB～几十 KB）。
- Three.js 路线：低模 + Blender 烘焙一张贴图（my-room-in-3d 模式），或复用本项目已有车模资产做 hero 彩蛋；务必延续现有「海报门面 + 点击/滚动到位再加载」模式守住 200KB 首屏预算。
- craftzdog 模式最值得抄：**hero 3D 是点缀不是主体**，加载失败/移动端弱机时页面完全成立。

### 4.4 ASCII / Canvas 2D 效果

- Three.js 自带 `AsciiEffect`：把任意 3D 场景渲染成 ASCII 字符——用在 3D 车模上做「工程图纸/终端」彩蛋模式，与座舱 HUD 人设高度契合。
- Canvas 2D 生成艺术：antfu plum（递归梅枝，一次成画后静止，几乎零功耗）；本项目 TTS 波形画布已是同类实践。
- 字符雨/扫描线/CRT 噪点：纯 CSS（`repeating-linear-gradient` + `mix-blend-mode`）即可，体积为零。

### 4.5 粒子系统

- 轻量：raw WebGL points / OGL，几 KB。
- R3F 路线：drei `<Points>` + 自定义 shaderMaterial；进阶 FBO 粒子（百万级、GPU 计算），完整教程见 Maxime Heckel《The magical world of Particles with R3F and Shaders》。
- 现成库 tsParticles 功能全但体积偏大（core + preset 常 >60KB），静态站建议手写或用 paper-shaders 的 DotOrbit/Metaballs 替代。

### 4.6 View Transitions（跨页 morph）

- Astro `<ClientRouter />` 一行接入；给 Demo 卡片图和详情页 hero 图设同名 `transition:name`，即可得到「缩略图放大成头图」的原生转场。
- 纯 MPA 也可用 `@view-transition { navigation: auto; }` 两行 CSS 实现跨文档淡入淡出，JS 为零。

### 4.7 其他静态可用的 wow 细节

- **SplitText 文字动画**（GSAP 已全免费）：hero 标题按字符错峰进场。
- **自动 OG 图**：Astro 端点 + satori/resvg 构建期生成每页分享图（devsebastian44 案例已验证 Astro 5 + satori 可行）。
- **音效微交互**：use-sound 思路（点击/切换 8-bit 短音），TTS Demo 站点加这个非常自然。
- **命令面板**：ninja-keys（midudev minimalist-portfolio 用的纯 JS Web Component）做 `⌘K` 导航，无框架依赖。

---

## 5. 对本项目的具体建议

背景：王磊｜汽车智能座舱与 AI 解决方案经理。受众是**招聘方/合作方/行业同行**，不是前端雇主——炫技必须服务于「懂技术的产品/方案专家」人设，而非堆前端特效。已有资产：Astro 全静态站、TTS 座舱 Demo（16 语种、逐词字幕、波形画布、RTL）、3D 车配置器（车漆/轮毂/HDRI/KTX2）。

### 5.1 定位对标（谁是同类最优）

- **信息架构学 brittanychiang v4 + magic-portfolio**：首页 = 一句话定位 → 精选案例（交错大图）→ 经历时间线 → 联系；案例页独立成文。
- **内容策略学 leerob + joshwcomeau**：方案经理的护城河是「观点 + 讲解」，把座舱/AI 领域知识写成带交互演示的深文（MDX + 内嵌 island），一篇高质量交互文的传播力大于十个纯特效页。
- **3D 使用方式学 craftzdog，不学 adrianhajdin**：3D 是名片点缀与领域证明（车！），不是全屏游乐场；避免 JS Mastery 模板同质化风格（紫色渐变 + 悬浮球 = 模板既视感）。

### 5.2 分优先级的落地清单

**P0（低成本高回报，1-2 个改动即见效）**

1. 接入 `<ClientRouter />`：首页 Demo 卡片海报 `transition:name` morph 到 `/lab/*` 详情页 hero；Firefox 自动 fallback。
2. 案例/文章全面 MDX 化（content collections），把已有 TTS 波形播放器抽成可复用 island 组件，未来文章里可直接 `<TtsWaveDemo lang="ar" />` 内嵌演示——这是 joshwcomeau 模式在座舱领域的直接复刻。
3. 首页 hero 加 shader 背景：用 `@paper-design/shaders` vanilla 包（建议 NeuroNoise 或 MeshGradient，调成仪表蓝/HUD 青色系），`prefers-reduced-motion` 降级为静态渐变；预算 ~15KB。

**P1（差异化人设：「座舱 HUD」设计语言）**

4. 把全站 UI 主题化为克制的座舱 HUD 风：等宽数字字体、细线框仪表元素、扫描线 hover 态（纯 CSS）；这比任何通用 3D 特效都更强化「汽车智能座舱专家」记忆点。
5. 3D 配置器加 **ASCII/线框「工程模式」彩蛋**（Three.js AsciiEffect 或 wireframe 切换）：一键从渲染图切到「工程图纸」，技术趣味 + 领域感兼得，增量代码极小。
6. 案例页用 CSS scroll-driven animations 做「方案推进时间线」进场与阅读进度条（0 JS）。

**P2（长线炫技，展示技术深度）**

7. 3D 配置器 scrollytelling 版：Lenis + GSAP ScrollTrigger（均免费）做「滚动讲车」——滚动推进相机位、分段讲解车漆/传感器/座舱布局；单一 raf 循环同步 DOM 与 canvas（参考 Codrops HAOQI 案例的 ScrollBus 方案）。
8. 试验 Three.js WebGPURenderer + TSL（folio-2025 为教材）：车漆 flake/clearcoat 材质用 TSL 写一版，页面注明「WebGPU 优先、WebGL 回退」——对懂行的人这是明确的技术信号。
9. 写 1-2 篇「Demo 拆解」深文（学 Maxime Heckel）：《16 语种 TTS 逐词时间轴是怎么造出来的》《KTX2 让车模贴图缩小 6 倍》，文内嵌可交互对比 widget。

### 5.3 红线（不要做）

- 不要整站迁移框架；Astro islands + GitHub Pages 是当前最优解。
- 不要在首页常驻重 WebGL（守住 <200KB / Lighthouse ≥95 门槛）；一切 3D 走「海报门面 + 懒加载」既有模式。
- 不要用 React island 做 vanilla JS 能做的事（一个 island = +45KB React runtime）。
- 不要抄 3D portfolio 模板的视觉（紫色星空/悬浮技能球已被数千个 fork 用滥）。
- 每个新特效上线前列「预算行」：新增 KB / LCP 影响 / reduced-motion 降级 / 无 WebGL 降级。

---

## 6. 参考链接清单

### 站点与源码

- Bruno Simon Folio 2019 — https://github.com/brunosimon/folio-2019
- Bruno Simon Folio 2025（WebGPU/TSL，含 Blender 源文件）— https://github.com/brunosimon/folio-2025 ｜ https://bruno-simon.com
- Bruno Simon My Room in 3D — https://github.com/brunosimon/my-room-in-3d
- Brittany Chiang v4 — https://github.com/bchiang7/v4 ｜ https://v4.brittanychiang.com
- Takuya Matsuyama 主页 — https://github.com/craftzdog/craftzdog-homepage ｜ https://www.craftz.dog
- Lee Robinson — https://github.com/leerob/next-mdx-blog ｜ https://leerob.com
- Tailwind Nextjs Starter Blog — https://github.com/timlrx/tailwind-nextjs-starter-blog
- JS Mastery 3D Portfolio — https://github.com/adrianhajdin/project_3D_developer_portfolio
- Henry Heffernan（3D 站 + 2D OS）— https://github.com/henryjeff/portfolio-website ｜ https://github.com/henryjeff/portfolio-inner-site ｜ https://henryheffernan.com
- Anthony Fu — https://github.com/antfu/antfu.me ｜ https://antfu.me
- Josh W. Comeau 架构自述 — https://www.joshwcomeau.com/blog/how-i-built-my-blog/ ｜ https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/
- Maxime Heckel 博客源码 — https://github.com/MaximeHeckel/blog.maximeheckel.com ｜ https://blog.maximeheckel.com
- Raphaël Améaume — https://raphaelameaume.com ｜ Fragment：https://github.com/raphaelameaume/fragment
- Magic Portfolio（Once UI）— https://github.com/once-ui-system/magic-portfolio
- midudev Porfolio（Astro）— https://github.com/midudev/porfolio.dev ｜ minimalist-portfolio-json：https://github.com/midudev/minimalist-portfolio-json
- Astrofy — https://github.com/manuelernestog/astrofy ｜ AstroPaper — https://github.com/satnaing/astro-paper
- SvelteKit 3D 房间简历 — https://github.com/phusy2001/my-3d-resume

### 灵感列表与 Topics

- emmabostian/developer-portfolios — https://github.com/emmabostian/developer-portfolios
- Evavic44/portfolio-ideas — https://github.com/Evavic44/portfolio-ideas
- Kiran1689/Awesome-Dev-Portfolios — https://github.com/Kiran1689/Awesome-Dev-Portfolios
- GitHub Topics — https://github.com/topics/portfolio-website ｜ https://github.com/topics/developer-portfolio ｜ https://github.com/topics/personal-website ｜ https://github.com/topics/creative-portfolio

### 库与技术趋势

- GSAP 全免费公告（v3.13，2025-04）— https://gsap.com/blog/3-13/ ｜ https://webflow.com/blog/gsap-becomes-free
- Motion（原 Framer Motion）独立公告 — https://motion.dev/magazine/framer-motion-is-now-independent-introducing-motion
- Lenis 平滑滚动 — https://github.com/darkroomengineering/lenis ｜ https://lenis.dev
- Paper Shaders（零依赖 WebGL2 背景库）— https://github.com/paper-design/shaders ｜ https://shaders.paper.design
- CSS scroll-driven animations 支持现状 — https://webstatus.dev/features/scroll-driven-animations
- Astro View Transitions / ClientRouter 文档 — https://docs.astro.build/en/guides/view-transitions/
- Astro Islands 架构 — https://docs.astro.build/en/concepts/islands/
- Codrops：shader.se 滚动驱动 WebGPU 管线（2026-05）— https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/
- Codrops：HAOQI.DESIGN DOM+WebGL 同帧同步（2026-08）— https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/
- Maxime Heckel：R3F 粒子系统全解 — https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/
- Three.js AsciiEffect 示例 — https://threejs.org/examples/#webgl_effects_ascii
