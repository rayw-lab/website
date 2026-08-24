# 个人网站「炫技」前沿前端技术调研（2024–2026）

> **调研日期**：2026-08-24（所有 star 数、浏览器版本、库版本均核实于当日）
> **目标读者**：senior frontend；本仓库维护者
> **调研范围**：View Transitions、CSS scroll-driven animations、WebGPU/Three.js/TSL、GSAP、Motion、Lenis、R3F、shader 背景、座舱 HMI 设计语言
> **约束前提**：GitHub Pages 纯静态托管（`base: '/website'`）、Lighthouse 四项 ≥ 95、首页传输 < 200KB（不含字体），见 `docs/website-plan/master-plan.md` 7.5

---

## 目录

- [0. 结论摘要（TL;DR）](#0-结论摘要tldr)
- [1. 炫技技术矩阵](#1-炫技技术矩阵)
- [2. 首页 Hero 方案 5 套](#2-首页-hero-方案-5-套)
- [3. 动画与交互层：值得做 vs 过时](#3-动画与交互层值得做-vs-过时)
- [4. 性能预算：Lighthouse ≥95 前提下做 wow 效果](#4-性能预算lighthouse-95-前提下做-wow-效果)
- [5. 与本仓库现有 Demo 的整合方案](#5-与本仓库现有-demo-的整合方案)
- [6. 代码级参考：可 fork/adapt 的开源仓库](#6-代码级参考可-forkadapt-的开源仓库)
- [附录 A：与总纲视觉规范的张力及处理建议](#附录-a与总纲视觉规范的张力及处理建议)
- [附录 B：参考资料](#附录-b参考资料)

---

## 0. 结论摘要（TL;DR）

2024–2026 三年里，「炫技」的成本结构发生了根本变化，四个事实决定了本站的技术选择：

1. **GSAP 全家桶免费了**。Webflow 于 2024-10 收购 GreenSock，2025-04 起 GSAP 3.13+ 及全部原付费插件（ScrollTrigger、SplitText、ScrambleText、MorphSVG、DrawSVG…）对所有人免费、含商用（[Codrops 官宣联动](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/)）。曾经「Club 会员专属」的 SplitText 文字动画现在是零成本选项。
2. **Framer Motion 与 Motion One 合并为 `motion`**（2024-11 独立、随后合并代码库，[motion.dev](https://motion.dev)）。对无 React 的 Astro 站点，其 vanilla `animate()` 仅 ~3.8KB gzip，是「小剂量微交互」的最佳性价比。
3. **Three.js WebGPURenderer 自 r171 起 production-ready**，TSL（Three.js Shading Language）一次编写、编译到 WGSL（WebGPU）与 GLSL（WebGL 2 自动回退）双后端；r183+ 用节点式 RenderPipeline 取代 EffectComposer。**本仓库 3D 配置器已在用这条管线（three 0.185 + `three/webgpu`）**，等于已经站在 2026 年「炫技」第一梯队的地基上。
4. **浏览器原生能力吃掉了一批 JS 库的地盘**：CSS scroll-driven animations（`animation-timeline: scroll()/view()`）已达 Chrome 115+ / Firefox 132+ / Safari 18+，全球 ~84% 支持率，滚动进度条、reveal、视差这类效果可以零 JS、跑在合成器线程上；跨文档 View Transitions（`@view-transition`）在 Chrome/Edge 126+、Safari 18.2+ 可用，MPA 站点零 JS 实现「SPA 级」转场。

**对本站的一句话建议**：不引 React、不引 Lenis，走「**平台原生（View Transitions + scroll-driven CSS）为骨架，GSAP 做首屏编排，现有 WebGPU 配置器资产升格为首页 Hero**」的路线。这条路线的 wow 效果集中在首屏与 Lab 页，内容页保持总纲第 6 章的编辑部克制，两者不冲突（详见附录 A）。

---

## 1. 炫技技术矩阵

评分口径：难度/冲击力/性能成本均为 1–5（5 最高）。「Pages 兼容」指纯静态 GitHub Pages（无 SSR、无 Edge Function）下能否完整工作。

### 1.1 平台原生层（零依赖、零 bundle）

| 技术 | 难度 | 视觉冲击 | 性能成本 | Pages 兼容 | 推荐实现 | 2026 状态 |
|------|:--:|:--:|:--:|:--:|------|------|
| 跨文档 View Transitions（`@view-transition`） | 2 | 4 | 1 | ✅ 完美（MPA 天然适配） | 原生 CSS；或 Astro `<ClientRouter />` 补全 Firefox | Chrome/Edge 126+、Safari 18.2+；Firefox 尚未支持跨文档（同文档 `startViewTransition` 已随 Firefox 144 于 2025-10 达 Baseline） |
| CSS scroll-driven animations（`scroll()`/`view()`） | 2 | 3–4 | 1（合成器线程，不占主线程） | ✅ | 纯 CSS + `@supports (animation-timeline: scroll())` 守卫 | Chrome 115+ / Firefox 132+ / Safari 18+，~84% 全球支持，渐进增强首选 |
| `view-transition-name` 元素 morph（首页卡片 → 详情页大图） | 3 | 5 | 1 | ✅ | 两页同名 `view-transition-name` | 个人站最被低估的「高级感」来源，成本极低 |
| `@property` + CSS 变量动画（渐变角度、数值滚动） | 2 | 3 | 1 | ✅ | 原生 CSS | 全绿；配合 `conic-gradient` 可做仪表盘扫描 |
| Popover / `<dialog>` / anchor positioning | 2 | 2 | 1 | ✅ | 原生 HTML/CSS | 交互细节的「工程品味」信号 |

### 1.2 JS 动画层

| 技术 | 难度 | 视觉冲击 | 性能成本 | Pages 兼容 | 推荐库 | 备注 |
|------|:--:|:--:|:--:|:--:|------|------|
| 滚动编排（pin/scrub/timeline） | 3 | 5 | 2–3 | ✅ | **GSAP 3.13+ ScrollTrigger**（27.9k★，免费） | 行业标准，无可替代的精度；移动端禁用 `pin: true` |
| 文字逐字/逐词 reveal | 2 | 4 | 2 | ✅ | GSAP SplitText（免费后首选）；带 a11y 处理（保留可读 DOM） | Hero 标题一次性入场用，不要全站滥用 |
| 文字 scramble/解码效果 | 2 | 3 | 1 | ✅ | GSAP ScrambleTextPlugin | 与「多语种」主题天然契合（字符池可混 CJK/阿拉伯字符） |
| 轻量微交互（hover、数字滚动、入场） | 1 | 2–3 | 1 | ✅ | **motion（`motion.dev`，33.3k★）** vanilla `animate()` ~3.8KB | 无 React 也能用；比引 GSAP 全量更省 |
| 平滑滚动 | 2 | 2 | 2–3 | ✅ | Lenis（15.5k★） | **不推荐本站使用**：与总纲「无滚动劫持」冲突，且对内容型站点收益低（详见 3.4） |

### 1.3 WebGL / WebGPU 层

| 技术 | 难度 | 视觉冲击 | 性能成本 | Pages 兼容 | 推荐库 | 备注 |
|------|:--:|:--:|:--:|:--:|------|------|
| 3D 实时车模（PBR + HDRI + KTX2） | 4 | 5 | 4（懒加载后可控） | ✅ | **three 0.185 `three/webgpu`（114.7k★）**——本仓库已落地 | 唯一注意点：GLSL `ShaderMaterial` 在 WebGPURenderer 下不可用，自定义材质必须走 TSL |
| TSL 自定义 shader（车漆 flake、扫描线、渐变） | 4 | 5 | 3 | ✅ | three TSL（`Fn()`/`colorNode`/`positionNode`） | 一份代码双后端（WGSL+GLSL），是 2026 最值得投入的「新肌肉」；参考 [Maxime Heckel 的 TSL Field Guide](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/) |
| WebGPU compute（百万级粒子） | 5 | 5 | 4 | ✅（WebGL 回退时需降档粒子数） | three TSL compute | WebGL2 实用上限 ~5 万实例，WebGPU 可到百万级；炫技天花板，但对本站叙事贡献有限，列为可选 |
| shader 渐变背景（Stripe 风格 mesh gradient） | 2 | 4 | 2 | ✅ | **paper-design/shaders（3.4k★，零依赖，React+vanilla 双发行）**；或 @mesh-gradient/core（~8KB gzip） | Hero 背景性价比之王；`prefers-reduced-motion` 时静态化 |
| 流体模拟背景 | 3 | 5 | 4 | ✅ | PavelDoGreat/WebGL-Fluid-Simulation（16.6k★） | 冲击力大但与「工业克制」气质不符，不建议 |
| R3F（React Three Fiber，31.8k★ + drei 9.8k★） | 3 | — | 3 | ✅ | — | **本站不采用**：Astro 站为一个 hero 引入 React runtime 不划算；vanilla three 已验证可行。R3F 仅作为参考生态阅读 |

### 1.4 快速结论

- **必做**：跨文档 View Transitions、`view-transition-name` morph、scroll-driven CSS reveal、GSAP 首屏编排、现有 WebGPU 车模升格 Hero。
- **选做**：TSL 自定义车漆/扫描线 shader、ScrambleText 多语种字符效果、shader 渐变背景（如果不用 3D Hero）。
- **不做**：React/R3F、Lenis 平滑滚动、流体模拟、自定义光标、重度 glassmorphism。

---

## 2. 首页 Hero 方案 5 套

每套按「概念 → 技术栈 → 实现要点 → 主题契合 → 工作量」展开。工作量 S/M/L 以「组件/子系统改动范围」计。

### 方案一：「实车即首屏」——配置器资产升格 Hero（⭐ 推荐主方案）

**概念**：首屏左侧是定位文案（3 秒可读完，满足总纲区块 1），右侧/背景是那台真实可交互的 CarConcept 车模——不是装饰图，就是 `/lab/car-configurator` 同一套 WebGPU 场景的「展示模式」：慢速自转、车漆呼吸高光、底部一行实时后端徽章（`WebGPU · 60fps` 或 `WebGL 2`）。点击任意配置色块，直接带参跳入完整配置器。

**技术栈**：现有 `src/scripts/car-configurator/app.ts` 抽出可复用的 `mountViewer()` 精简入口 + Astro 静态 HTML + poster 门面。

**实现要点**：

- 门面模式（facade）：首屏先渲染 28KB 的 `car-configurator-poster.webp`（已有资产），`requestIdleCallback` + IntersectionObserver 后动态 `import()` three chunk（实测 256KB gzip），替换 poster 时做 0.4s 交叉淡入；
- Hero 模式裁剪：去掉 OrbitControls/UI 面板，只保留自转 + 单一 HDRI + 接触阴影（本仓库已实现程序化接触阴影，零实时阴影开销）；
- `prefers-reduced-motion: reduce` → 永远停留在 poster，不加载 three；
- 移动端（`pointer: coarse` + 窄视口）→ 默认 poster + 「进入 3D 配置器」按钮，不自动挂载（省电与流量）；
- 车漆色块与 `/lab/car-configurator?paint=xxx` 打通（现有 `URLSearchParams` 状态已支持）。

**主题契合**：直接把「汽车 × 3D × 实时渲染」焊在第一屏，访客 3 秒内同时完成「他是做座舱/汽车的」+「这站技术含量高」两个判断。Live Demo 从隐藏链接变成第一视觉焦点。

**工作量**：**M**（资产、渲染管线、回退逻辑全部现成，主要工作是抽取 viewer 入口、hero 布局、poster 切换编排）。

### 方案二：「座舱开机序列」——HMI Boot Sequence

**概念**：首屏是一块「数字座舱」：页面加载后 0.9 秒内完成一次仪表盘开机自检——转速/电量环形仪表扫描归位（`conic-gradient` + `@property` 动画）、状态图标逐个点亮、多语种问候语逐词打出（复用 TTS Demo 的 16 语种文案与逐词时间轴数据），最后定格为「王磊｜汽车智能座舱与 AI 解决方案经理」。下方常驻一条「telemetry」细带：当前在读文章数、最近更新时间（Now 数据）。

**技术栈**：SVG + CSS `@property` + WAAPI（或 GSAP timeline 编排开机序列），零 WebGL。灵感对标 BMW Panoramic iDrive（CES 2025 的 A 柱到 A 柱投影、shy-tech 隐显控件）与 Chery HMI Next 的「零层级交互」。

**实现要点**：

- 开机序列必须 ≤ 900ms 且只播一次（`sessionStorage` 标记），不能变成每次导航都要等的片头；
- 仪表扫描用 `@property --gauge-angle` + `conic-gradient`，合成器友好；
- 多语种问候直接读 `src/data/tts-manifest.json` 已有语料，RTL 语言走已有镜像逻辑——「炫技」同时暗示 TTS Demo 的存在；
- 深浅色模式对应「夜间/日间仪表」，与总纲「暗色模式一等公民」呼应。

**主题契合**：座舱 HMI 本体化——网站首屏就是一块 HMI。相比 3D 车模更「岗位对口」（解决方案经理的日常对象是 HMI 而非渲染管线），且是五套方案里唯一零 WebGL 依然高冲击的。

**工作量**：**M**（SVG 仪表绘制 + 序列编排是主要成本；数据与多语种资产全现成）。

### 方案三：「TSL 曲面渐变 + 动力学排版」

**概念**：全屏 shader 渐变背景（近黑底色上流动的工业橙/信号蓝极光，Stripe 质感但压暗到「夜间座舱氛围灯」的克制度），前景是大号 kinetic typography：主标题 SplitText 逐字入场，副标题 ScrambleText 从乱码字符（混入多语种字形）解码为定位语。

**技术栈**：paper-design/shaders 的 vanilla 入口（或自写 ~60 行 TSL/GLSL 全屏三角形 shader，控制在 <10KB）；GSAP SplitText + ScrambleText（均已免费）。

**实现要点**：

- 渐变要「慢」：位移周期 ≥ 20s，饱和度压低，否则秒变营销站；
- Canvas 尺寸绑定容器 + DPR 封顶 1.5，离屏 `IntersectionObserver` 暂停 RAF；
- `prefers-reduced-motion` → 输出一帧静态 WebP（构建期导出，~50–100KB）；
- ScrambleText 字符池混入「你好/مرحبا/こんにちは」等字形，扣「多语种」主题。

**主题契合**：AI/科技氛围 + 多语种彩蛋；不直接扣汽车主题，适合作为「不想让 3D 抢内容风头」时的备选。

**工作量**：**S–M**（库直接可用为 S；自写 TSL shader 为 M）。

### 方案四：「滚动叙事：从线框到量产」

**概念**：Hero 下接一段 pinned 滚动叙事（约 200vh）：滚动驱动车模从工程线框（wireframe + 蓝图网格背景）渐变为完整 PBR 材质，三个滚动锚点分别浮现三支柱文案——「需求（线框）→ 工程（材质半成）→ 量产（完整渲染）」。隐喻即定位语：「把复杂技术转化为可交付的方案」。

**技术栈**：three/webgpu（现有管线）+ GSAP ScrollTrigger scrub 驱动材质参数与相机；文案层用 CSS scroll-driven animations 做 reveal（双保险：JS 失败时文案仍原生浮现）。

**实现要点**：

- 线框→实体用 TSL 节点做材质插值（`mix(wireframeColor, pbrOutput, progress)`），比切换两套 mesh 便宜；
- `scrub: 1`（带 1s 平滑）适合叙事段；相机路径预烘焙为 3 个关键帧 + Catmull-Rom；
- 移动端不 pin：退化为三张静态帧图 + 纵向排版（iOS 动态视口高度会打碎 pin）；
- 这是五套中唯一触碰总纲「无滚动劫持」红线边缘的方案——注意 scrub 模式用户始终掌控滚动、可随时划走，不属于劫持，但需在总纲第 6 章补一条例外条款（见附录 A）。

**主题契合**：把「从需求歧义到量产交付」的核心叙事变成可滚动的体验，是内容与炫技咬合最深的一套。

**工作量**：**L**（相机/材质编排、移动端退化、性能调优都要真功夫；建议作为 v2 迭代而非首发）。

### 方案五：「编辑部克制版 + 原生动效满配」

**概念**：严格执行总纲第 6 章：排版优先、无大图 banner。炫技全部藏在「原生平台能力的极致运用」里：跨文档 View Transitions 让全站导航如 SPA 般丝滑、首页案例卡片 morph 进详情页、滚动 reveal 全部用 `animation-timeline: view()`、阅读进度条用 `scroll()`、数字用 `@property` 滚动、hover 微交互用 motion 的 3.8KB `animate()`。JS 总量 < 10KB。

**技术栈**：纯 CSS + `@view-transition` + motion vanilla。可选 Astro `<ClientRouter />` 补 Firefox 转场一致性。

**实现要点**：

- `@view-transition { navigation: auto; }` 放全站 layout，两端页面都要有；
- 案例卡片缩略图与详情页头图共享 `view-transition-name`（每页唯一）；
- 所有 `animation-timeline` 包 `@supports` 守卫，老浏览器直接看到最终态；
- Lighthouse 四项 99+ 几乎无悬念，是唯一「零性能焦虑」方案。

**主题契合**：冲击力最低，但「懂行的人」（senior 前端、技术面试官）看 DevTools 会给最高分——零框架、零动画库、全平台原生。适合作为**全站基线**：内容页一律用这套，Hero 区再叠加方案一或二。

**工作量**：**S**。

### 推荐组合

**首发（30 天 MVP 内）**：方案五做全站基线 + 方案一做 Hero（M+S）。
**v2 迭代**：Hero 下追加方案四的滚动叙事段（L），并把方案二的仪表元素下放到 TTS Demo 入口卡片。

---

## 3. 动画与交互层：值得做 vs 过时

综合 2026 年多份趋势复盘（Awwwards 评审口径、生产环境回访），按「做/慎做/不做」分级：

### 3.1 值得做

| 效果 | 理由 | 实现 |
|------|------|------|
| **Scroll narrative（滚动叙事）** | 2026 仍是 Awwwards 主流叙事手段；关键是「scrollytelling 用户保有控制权」——scrub 跟随滚动而非接管滚轮 | GSAP ScrollTrigger（scrub 段）+ CSS `view()`（reveal 段）双层 |
| **View Transition 元素 morph** | 成本/冲击比全场最高；MPA 站点做出「原生 App」质感 | `view-transition-name`，零 JS |
| **Kinetic typography（限 Hero）** | 2026 复盘结论：demo 里泛滥、生产里稀缺——恰恰说明克制使用时是差异化信号。只上 hero 标题与章节过渡，不全站铺 | GSAP SplitText（注意保留原始 DOM 给屏幕阅读器与爬虫，SplitText 3.13 内建 aria 处理） |
| **Text scramble（小剂量）** | 通常偏 hacker 味，但本站有「多语种」正当性：字符池用真实多语种字形，效果即内容 | GSAP ScrambleText |
| **微交互（hover 位移、数字滚动、进度条）** | 2026 共识：「well-crafted micro-interactions 让站点更易懂」，是刊物质感的来源 | motion `animate()` / 纯 CSS |
| **Bento grid** | 已从潮流沉淀为标准（Apple/Google/Linear/Vercel 全线采用；对比均匀网格有实证的停留时长优势）。适合首页「三支柱 + 两 Demo + Now」的异构信息 | CSS Grid，注意块级大小必须反映信息层级 |

### 3.2 慎做（有条件地做）

| 效果 | 条件 |
|------|------|
| **Parallax 视差** | 原生 `animation-timeline` 让视差成本趋近于零，但总纲明令「无视差」。折中：仅允许 Hero 区内低幅度（<8%）的层间速差，内容区禁用。装饰性多层视差已过时 |
| **3D tilt cards** | 桌面 hover 下 ±6° 以内 + `transform` only 可用（Demo 入口卡适合）；配合陀螺仪的移动端 tilt 已泛滥，不做 |
| **Glassmorphism** | 2026 复盘：重度使用在 Android 中端机上掉帧 15–30%，且对比度不达标；已从「主视觉手法」退化为「导航栏/弹层的局部质感」。仅允许：固定导航条一处 `backdrop-filter: blur()`，其余禁用 |
| **Lenis 平滑滚动** | 创意站标配但争议大：改写滚动物理曲线本质上是轻度滚动劫持，a11y 社区长期质疑。本站内容为主，收益低于风险，**不用**。若未来某个 Lab 页要做 WebGL 滚动同步再局部引入（集成套路固定：`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add((t) => lenis.raf(t * 1000), false, true)` + `lagSmoothing(0)`，单 RAF 循环避免双循环抖动） |

### 3.3 不做（已过时或负资产）

| 效果 | 判定依据 |
|------|------|
| **Magnetic cursor / 自定义光标 / 光标拖尾** | 2026 趋势复盘直接点名：「aggressive cursor takeover 已成品类弱点信号（designer self-indulgence）」；移动端零覆盖、干扰阅读。磁吸按钮若想留一点趣味，可保留 CTA 按钮 ≤4px 的 hover 位移，光标本体绝不接管 |
| **滚轮劫持（wheel-jacking / 强制整屏翻页）** | 破坏用户最基本预期，总纲红线，趋势复盘同判 |
| **Neumorphism、重度噪点纹理、环境音** | 全部过气，且与刊物气质无关 |
| **首页开屏 Loading 动画（preloader）** | 创意站遗风；内容站首屏应 <1s 可读，任何 preloader 都是负资产。3D 资产的加载进度只出现在 Hero 画布局部（本仓库配置器已是这个做法） |

---

## 4. 性能预算：Lighthouse ≥95 前提下做 wow 效果

### 4.1 本仓库实测基线（2026-08-24，`pnpm build` 产物 gzip）

| 资产 | 体积（gzip） | 加载时机 |
|------|------|------|
| 首页 HTML | <1KB | 首屏 |
| three/webgpu 全量 chunk（`app.*.js`） | **256KB**（raw 913KB） | 动态 `import()`，仅 Lab 页/Hero 挂载时 |
| Draco decoder（JS 回退） | 146KB（wasm 路径更小） | 模型解码时按需 |
| Basis/KTX2 transcoder | 14KB + wasm | 同上 |
| TTS 座舱页脚本 | 8KB | Lab 页 |
| 车模 + HDRI 资产 | 3.5MB + 1.5MB（磁盘） | 画布挂载后流式 |
| 配置器 poster | 28KB WebP | 首屏（门面） |

**结论**：256KB 的 three chunk 只要不进首屏关键路径，200KB 首页预算完全成立——首页静态部分目前 <10KB，留给「炫技层」的空间约 150–180KB，而方案一的首屏增量只有 poster（28KB）+ 编排脚本（<5KB）。

### 4.2 首页 200KB 预算分配（建议）

| 项 | 预算 |
|------|------|
| HTML + 关键 CSS | ≤ 30KB |
| Hero poster（WebP/AVIF） | ≤ 40KB |
| 编排 JS（GSAP core + ScrollTrigger 约 70KB gzip；或 motion `animate()` 仅 3.8KB） | ≤ 80KB |
| 图标/OG 必需图 | ≤ 30KB |
| **three chunk、模型、HDRI** | **0（不进首屏，交互后按需）** |

注：GSAP core + ScrollTrigger + SplitText 合计约 80KB gzip，是首页预算里最大的可选项。若首发只用方案五 + 方案一（Hero 编排简单），可以完全不引 GSAP，用 WAAPI/motion 顶替，把预算还给内容。

### 4.3 关键策略清单

1. **Facade/poster 门面**：一切 WebGL 画布先渲染静态海报，交互意图（视口进入 + idle，或显式点击）后再 `import()`。本仓库配置器已实现「client:visible 语义」的动态 import，直接复用。
2. **`prefers-reduced-motion` 三层响应**：CSS 层（`@media` 关动画）、JS 层（不初始化 WebGL/编排，本仓库已有 `matchMedia` 检查）、资产层（reduced 用户不下载 three chunk——省的不只是动效，是 256KB）。
3. **合成器纪律**：只动 `transform`/`opacity`；scroll-driven CSS 动画天然跑在合成器线程；GSAP 回调内禁止 `getBoundingClientRect()`（布局抖动），测量提前做。
4. **DPR 封顶**：桌面 2、移动 1.5（本仓库已实现）；离屏 `IntersectionObserver` 暂停 RAF；`document.visibilitychange` 暂停。
5. **LCP 保卫**：Hero poster 加 `fetchpriority="high"` + 显式宽高（防 CLS）；LCP 元素永远是 poster/标题而非 canvas（canvas 首帧不可预测）。
6. **INP 保卫**：three chunk 的 parse/compile 是主线程大任务，`import()` 放在 `requestIdleCallback` 或用户明确交互后；WebGPU `renderer.init()` 本身是 async，天然友好。
7. **字体纪律**：中文子集化（本仓库 Noto 子集已实践）、`font-display: swap`、hero 标题优先系统栈避免 FOUT 抖动。
8. **验证流程**：`pnpm build && pnpm preview` 后跑 `npx lighthouse http://localhost:4321/website/ --chrome-flags='--headless --no-sandbox'`（AGENTS.md 已固化）；四项 ≥95 是发布门槛而非事后指标。

### 4.4 浏览器支持底线表

| 能力 | 无支持时的体验 |
|------|------|
| `@view-transition` | Firefox：普通整页跳转（可接受）；若要求一致性，换 Astro `<ClientRouter />`（Firefox 144+ 也能获得真跨文档过渡，代价是引入 JS 路由） |
| `animation-timeline` | `@supports` 守卫外的浏览器直接呈现最终态，无闪烁 |
| WebGPU | three 自动回退 WebGL 2（本仓库已实现，`?gl=1` 可强制验证） |
| WebGL 都没有 | poster 常驻 + 文案链接（配置器页已有 noscript/降级路径，Hero 沿用） |

---

## 5. 与本仓库现有 Demo 的整合方案

### 5.1 现状诊断

首页目前是占位页：两个 Demo 只有一行文字链接（TTS 甚至没链 3D 配置器）。两个 Demo 的工程含金量（WebGPU 渲染管线、16 语种逐词时间轴、KTX2/Draco 资产管线、RTL 镜像）在首页**零外显**——这正是任务所说的「隐藏链接」问题。

### 5.2 整合原则

1. **Demo 不是「实验室藏品」，是首页的能力证据**：总纲区块 3 讲「问题→动作→结果」，两个 Demo 是唯一 L1/L2 级（可公开验证/有形产出）的证据资产，应占据首屏与区块 2/3 之间的黄金位置。
2. **「活的」优于「截图的」**：卡片必须传达「这是正在运行的程序」——实时徽章、微动画、可直接交互的入口，而非静态缩略图。
3. **转场即品质**：从首页卡片进入 Lab 页要有 `view-transition-name` morph，让「点进 Demo」本身成为一次炫技。

### 5.3 具体落地设计

**A. Hero 层（方案一）**：CarConcept 车模即首屏（见第 2 节）。Hero 右下角常驻两枚芯片状徽章：`WebGPU · 实时渲染` 与 `16 语种 · TTS 座舱`，分别锚到两个 Demo。

**B. 首页 Bento 区（区块 2.5，位于三支柱与旗舰案例之间）**：

```text
┌──────────────────────────┬─────────────────┐
│  3D 汽车配置器（大格）        │  TTS 智能座舱（中格）│
│  poster + hover 时车漆色块   │  迷你波形 canvas +  │
│  轮播微动画；实时 backend    │  语种字符轮播        │
│  徽章（WebGPU/WebGL2）      │  （zh→ar→ja→…）    │
├──────────┬───────────────┴─────────────────┤
│ 技术栈标签 │  「如何构建」→ 对应 Work 案例/文章    │
└──────────┴─────────────────────────────────┘
```

- 3D 卡片 hover：poster 上叠加 5 个车漆色块，hover 色块即换 poster 变体（构建期为每个 paint 预渲染一张 20KB WebP，零运行时 3D 成本），点击带 `?paint=` 深链进配置器——「还没进 Demo 就已经在配置」；
- TTS 卡片：一条 24px 高的 CSS `@keyframes` 假波形（真 canvas 波形留给 Lab 页）+ 多语种问候字符每 2s 轮换（读 tts-manifest 语种表），RTL 语种时容器 `direction` 翻转 300ms——把 Demo 的两个技术卖点（波形同步、RTL 镜像）压缩成卡片微动画；
- 两张卡片图与 Lab 页首屏大图共享 `view-transition-name: demo-cockpit` / `demo-car`，点击后卡片图平滑放大为 Demo 页头图。

**C. 叙事挂钩（区块 3 联动）**：旗舰案例 A（多语种座舱）卡片尾部加「配套 Live Demo →」指向 TTS 座舱；未来案例 B 同理挂配置器。Demo 从「独立玩具」变成「案例证据链的 L2 展项」，与总纲证据等级体系闭环。

**D. 工程外显**：两个 Lab 页各加一个可折叠的「工程说明」抽屉（已有部分实现），并在首页卡片角标呈现硬核参数：`KTX2 压缩纹理 · Draco · HDRI IBL` / `逐词时间轴 · RTL · 字体子集`。senior 访客扫一眼就知道深浅。

**E. 共享设计 token**：Demo 页现有的暗色 HMI 视觉（信号色、等宽数字、扫描线）提炼为全站 CSS 变量，让首页 Hero、Bento 卡、Lab 页是同一套「座舱设计语言」——参考 2025–2026 车企 HMI 的共识方向（BMW Panoramic iDrive 的全幅信息带、Chery HMI Next 的零层级 + 3D 车况可视化）：暗底、高对比、单一信号色、信息密度即美学。这恰好与总纲第 6 章「工业设计」定调同源。

### 5.4 分阶段执行

| 阶段 | 内容 | 工作量 |
|------|------|------|
| P1（随 MVP） | 方案五基线 + Bento 卡片（静态 poster + 微动画 + VT morph）+ 案例挂钩 | S |
| P2 | 方案一 Hero（viewer 抽取 + facade 编排 + paint 深链） | M |
| P3（v2） | 方案四滚动叙事段 + TSL 车漆自定义 shader | L |

---

## 6. 代码级参考：可 fork/adapt 的开源仓库

star 数与活跃度核实于 2026-08-24（GitHub API）。按「与本站的相关度」排序：

### 6.1 主要参考（5 个）

1. **[craftzdog/craftzdog-homepage](https://github.com/craftzdog/craftzdog-homepage)** — ★ 2,457，持续维护
   Takuya Matsuyama（Inkdrop 作者）的个人主页。**最值得抄的是「懒加载 3D Hero」的完整模式**：体素小狗模型独立 chunk、加载 spinner、`useEffect` 挂载/卸载纪律、移动端降级。虽是 Next.js + Chakra，但 facade 思路 1:1 平移到 Astro island。适配点：把它的 GLB 换成我们的 CarConcept 管线。

2. **[bchiang7/v4](https://github.com/bchiang7/v4)** — ★ 8,272
   Brittany Chiang 的第四代个人站，多年占据「工程师作品集」审美锚点。**抄结构不抄技术栈**（Gatsby 已过时）：编号章节、克制的 stagger reveal、单一强调色、内容即界面——与总纲第 6 章几乎同一审美谱系。注意其 README 要求署名，adapt 时保留 attribution。

3. **[paper-design/shaders](https://github.com/paper-design/shaders)** — ★ 3,368，本周仍有提交
   零依赖 canvas shader 库（mesh gradient、dot grid、metaballs 等十余种），**React 与 vanilla 双发行**——vanilla 入口可直接塞进 Astro `client:visible` island，是方案三 shader 背景的首选落地件。每个 shader 单文件可读，也是学习「生产级 shader 参数化」的范本。

4. **[adrianhajdin/3d-portfolio](https://github.com/adrianhajdin/3d-portfolio)** — ★ 632
   JS Mastery 出品的 R3F + GSAP 作品集全程教学 repo。**不 fork 其栈（React），fork 其编排剧本**：hero 入场时间轴、滚动触发的 section 编排、3D/DOM 分层同步的镜头脚本，全部可以翻译成 vanilla three + GSAP。教学向代码注释密度高，适合当「动效编排 cookbook」。

5. **[markhorn-dev/astro-sphere](https://github.com/markhorn-dev/astro-sphere)** — ★ 684
   Astro 原生的作品集+博客模板，静态输出、零框架依赖、Lighthouse 满分向。**与本站技术栈完全同构**，其 content collections 组织、暗色模式切换、RSS/sitemap 配置可以直接对照检查我们的实现盲区。

### 6.2 库与专项参考（补充）

| 仓库 | ★ | 用途 |
|------|------|------|
| [motiondivision/motion](https://github.com/motiondivision/motion) | 33,339 | 微交互层；vanilla `animate()` 3.8KB |
| [greensock/GSAP](https://github.com/greensock/GSAP) | 27,957 | 首屏编排 + ScrollTrigger（3.13+ 全插件免费） |
| [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | 15,537 | 平滑滚动（本站结论：不用，但其 README 的 GSAP 集成模式是行业标准写法，值得读） |
| [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) | 16,587 | 流体背景（气质不符，仅技术参考：单文件 WebGL 管线组织极佳） |
| [pmndrs/racing-game](https://github.com/pmndrs/racing-game) | 2,210 | R3F 开源赛车游戏；车辆资产/物理/镜头调度的汽车向参考 |
| [mikhailmogilnikov/mesh-gradient](https://github.com/mikhailmogilnikov/mesh-gradient) | 58 | Stripe 系渐变的 TS 重写（~8KB gzip，自动离屏暂停、HiDPI），方案三备选 |
| [arthelokyo/astrowind](https://github.com/arthelokyo/astrowind) | 5,908 | Astro 7 + Tailwind 4 模板；Astro 版本升级时的对照参考 |

---

## 附录 A：与总纲视觉规范的张力及处理建议

总纲第 6 章写明：「动效仅保留必要的 hover 与页面渐入；无滚动劫持、无视差」。本调研的多数建议与之兼容，但三处需要显式决策：

| 冲突点 | 建议处理 |
|------|------|
| Hero 用 3D/shader（方案一/三） | 总纲第 3 章「无轮播、无大图 banner」针对的是营销式 banner；实时渲染的 Demo 资产属于「能力证据前置」，与「内容即界面」精神一致。建议在总纲 6 章补注：**Hero 区允许一个与 Demo 同源的实时渲染层，前提是 3 秒文案可读性与 200KB 首屏预算不受损** |
| 滚动叙事（方案四）vs「无滚动劫持」 | scrub 模式不接管滚轮、用户可随时划走，不构成劫持；但建议 v2 再做，并把「scrub 允许、wheel-jacking 禁止」写进总纲 |
| 视差 | 维持禁令；仅 Hero 区内 <8% 层间速差豁免 |

按总纲尾注要求，采纳上述任一豁免前应先修订 master-plan 第 6 章再动工。

## 附录 B：参考资料

- Astro 官方：[View Transitions 指南](https://docs.astro.build/en/guides/view-transitions/)、[Zero-JavaScript View Transitions](https://astro.build/blog/future-of-astro-zero-js-view-transitions/)、[Islands 架构](https://docs.astro.build/en/concepts/islands/)
- [Replacing Astro ClientRouter with native view transitions（joost.blog）](https://joost.blog/replacing-astro-clientrouter/)——ClientRouter vs 原生 `@view-transition` 的取舍实录
- [Bag of Tricks: View Transitions in all major browsers](https://events-3bg.pages.dev/jotter/in-all-major-browsers/)——Firefox 144 支持细节与 Astro 实践建议
- Chrome for Developers：[Scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)；MDN：[CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations/Timelines)
- [CSS Scroll-Driven Animations 完整指南（csstools.io，2026-07 支持率数据）](https://csstools.io/blog/css-scroll-driven-animations)
- [Codrops × GSAP：全插件免费后的 5 个创意 demo（2025-05）](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/)
- [Motion 官方：Framer Motion 独立并更名 Motion（2024-11）](https://motion.dev/magazine/should-i-use-framer-motion-or-motion-one)、[React bundle size 优化指南](https://motion.dev/docs/react-reduce-bundle-size)
- [Maxime Heckel: Field Guide to TSL and WebGPU](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)
- [Three.js WebGPURenderer production-ready 迁移清单（KTX2/EffectComposer 坑位）](https://bitsoulhosting.com/marketplace/blog/threejs-webgpurenderer-production-ready-what-breaks)
- [Lenis 官方 GSAP 集成](https://github.com/darkroomengineering/lenis)、[gsap.ticker 双循环修复分析](https://jrvsystems.app/blog/lenis-scrolltrigger-gsap-ticker-fix)
- 趋势复盘：[Web Design Trends 2026: What's Actually Working（toimi.pro）](https://toimi.pro/blog/web-design-trends-what-works/)、[2026 半年复盘（studiomeyer.io）](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)、[How to Build an Award-Winning Portfolio Site（hontran.dev）](https://www.hontran.dev/blog/how-to-build-an-award-winning-portfolio-site)
- HMI 设计：[BMW Panoramic iDrive（CES 2025，designboom）](https://www.designboom.com/technology/bmw-panoramic-idrive-experience-ces-interview-01-07-2025/)、[Chery HMI Next（Global Design News）](https://globaldesignnews.com/chery-hmi-next-redefining-intelligent-human-machine-interaction-for-future-mobility-by-chery/)、[Star Global: Automotive HMI design challenges](https://star.global/posts/automotive-hmi-design/)、[AAOS Display Safety（DriverUI/HAR）](https://source.android.google.cn/docs/automotive/sdv/display-safety)
- 本仓库实测数据：`pnpm build`（Astro 7.2.4 / three 0.185）产物 gzip 体积，2026-08-24
