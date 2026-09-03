# P1-BENCHMARK｜2025–2026 个人站 / 自我介绍页标杆拆解

日期：2026-09-02  
范围：个人作品集与关于页（不是公司产品站）；奖项台 + Three.js 圈 + Codrops/WebGPU demo + 非工程师高水准站。  
约束：GitHub Pages 纯静态、零后端、无 Cookie；现有首屏已是赛博城市 + `HeroRobot.glb`；`/about/` 纸面骨架已有三问题 / 六站演进 / 讲者简介。  
口径：静态可复刻度 = 在现有栈上能否做出**同一种哇感**（不是像素复刻）。高 = 纸面/CSS/预录即可；中 = 复用 city WebGPU 管线可做；低 = 要新开世界、视频 CDN、多人或后端。

与上一轮 `docs/research/portfolio-inspiration-index.md`（2026-08-24）的差：那份服务首页改版，本份只服务「我是谁」楼。Bruno folio-2025、Brittany、craftz.dog 会再出现，但只抽**自我介绍机制**。

---

## §1 案例表（22 条）

「首屏 10 秒」以本次打开活站或奖项页 element 视频说明为准；WebGL 画布抓取为空时，标〔HTML/奖项页〕，不假装看见了 GPU 画面。

| # | 站名 | URL | 年份 | 首屏 10 秒看到什么 | 核心技法 | 叙事结构（怎么讲「我是谁」） | 技术栈猜测 | 静态可复刻 | 对我们的启发 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Bruno Simon Folio 2025 | https://bruno-simon.com ；源 https://github.com/brunosimon/folio-2025 ；案例 https://www.awwwards.com/brunos-portfolio-case-study.html | 2025-12 上线；案例文 2026-03 | 开一辆车进岛。欢迎词：「drive around to learn more about me」。菜单：地图 / 成就 / 赛道 / 低语。WebGPU 默认。 | 3D 开放世界、Rapier 物理、TSL、昼夜季节、空间音频、成就、3D UI 代替 HTML | **世界即简历**。项目做成岛上可撞的物体；About 藏在驾驶过程，不单开一页自我介绍。 | Three.js r18x + TSL + Rapier + Howler；Blender 命名约定导出物理体 | **低**（整岛）；**中**（驾驶手感/成就，我们城里已有） | 不要再造第二座城。About 楼应是**城里已经认识的那台机器人的老家**，不是再开一辆车。可借：成就、低语、Behind the scene 诚实拆栈。 |
| 2 | Henry Heffernan | https://henryheffernan.com ；OS 内页 https://os.henryheffernan.com/projects/software | 2022（仍是 Three.js Journey 标杆，2025 论坛仍在仿） | BIOS 式加载 → 90 年代 CRT 桌面。显示器里是真能点的 OS。 | CSS3D iframe 嵌 2D 站进 3D 显示器；三渲染器（WebGL + CSS3D + overlay shader）；打字机 HUD | **房间即人**。先看见他的桌子，再通过显示器读作品。身份 = 环境道具。 | Three.js + React OS（独立部署） | **中**（我们已有机器人，不必做整间卧室）；BIOS 加载 **低价值** | 化身需要**生活场景**才有性格。About 馆可做一张「方案经理的工作台」：案卷、语种地图、门禁灯，点进去才是纸面 `/about/`。BIOS/打字机已过时，不要学。 |
| 3 | Jesse Zhou · Ramen Shop | https://www.jessezhou.com/ ；案例 https://jesse-zhou.medium.com/jesses-ramen-case-study-77bae77ab5f0 | 2022–2023（2026 仍被引用） | 「Cooking Your Ramen... %」→ START。进赛博拉面店。 | 场景化 3D、烘焙灯光、点击热点、氛围音 | **兴趣场景当容器**。咨询背景的人用拉面店讲「我会做交互」。作品贴在店内物体上。 | vanilla Three.js | **中**（场景化高，整店低） | 场景必须贴身份。拉面店贴「我爱赛博朋克」；我们的场景应贴**档案馆 / 方案编辑部**，不要无故做餐厅。加载厨子文案可爱，但 5 秒预加载不要照搬。 |
| 4 | David Heckhoff | https://david-hckh.com | 持续维护的 WebGL 个人站 | 标题即身份：Web Developer (WebGL & Node.js)。主体是可玩 WebGL 肖像/变形。 | 粒子/点云肖像、指针扰动、形态在「脸 ↔ 字」间切换 | **技法本身是名片**。几乎不写长自我介绍，作品即自我介绍。 | Three.js / 自定义 shader | **中**（单物体粒子高；真人脸 **默认不做**） | 可把粒子聚散用在**六向能力图 / 标语**，不要做真人脸。主人未授权真人扫描。 |
| 5 | Maxime Heckel | https://maximeheckel.com ；博客 https://blog.maximeheckel.com ；实验 https://r3f.maximeheckel.com/ | 2024 站体重写；2025-11 加当年作品；2026 仍在更 | 倒计时式进度条 0.00→1.00，然后第一人称自我介绍：NYC frontend，十年创业公司，现钻 3D/WebGL/shader。下面是分类作品墙（折射、焦散、WebGPU 玻璃、GPGPU 粒子）。 | 后处理当创作媒介、WebGPU/TSL 小品、R3F + 物理 UX（拖窗口、响应式刚体）、交互论文 | **工艺陈列柜 + 第一人称自我介绍**。About 就是首页上半；作品按「我在学什么」而不是「客户 logo」。 | Next.js + R3F + 自研 design system | **高**（编辑部排版）；**中**（一两件 TSL 小品） | 最接近「技术编辑部」气质。我们应学：**先一句话是谁，再陈列可点证据**。不要学成 Awwwards 香水站。 |
| 6 | Aristide Benoist | https://aristidebenoist.com | 长期；奖项墙仍是身份核心 | 全屏项目卡（House of Gucci 等），编号 01/02，角色写 FULLSTACK DEV & MOTION。页脚自述 + 客户名单 + Awwwards/FWA 计数。 | 电影级转场、全屏排版、运动设计当签名 | **作品全屏，人在页脚**。用客户名单和奖杯计数代替简历。 | 自研运动站（设计 JW.S） | **中**（转场）；奖杯墙 **不适合我们** | 学「项目全屏、说明极短」。不要堆 SOTD 计数——解决方案经理的信用是**可点案例与门禁**，不是奖杯。 |
| 7 | Nicola Romei · the artboard™ | https://www.nicolaromei.com/ | 2026-02 SOTD | 「WHAT APPEARS HERE IS NOT A SHOWCASE, BUT THE TRACE OF A PRACTICE」。要求横屏。Artboard 可滚/拖，点格子进档案。 | 画板导航、WebGL 浅景深、过程稿当内容 | **过程即身份**。明文拒绝 showcase，改成研究台账。 | Webflow + WebGL 深度层 | **高**（网格档案）；WebGL 景深 **中** | 对解决方案经理极有用：About 可以是**实践痕迹**（能力地图、验收口径、六站），不是作品秀。横屏强制不要学。 |
| 8 | Léo Parpeix Portfolio 2026 | https://www.leoparpeix.com/ | 2026（Awwwards 个人集收录） | 「Art director, Interactive designer」。Click to enable sound。蜜蜂可喂。Bonjour + 简单/疯狂/像素级动画三信条。 | 声音开关、微交互宠物、案例编号列表 | **人设小动物 + 短宣言**。作品用编号表，不靠 3D 开场。 | 运动设计站（Immersive Garden 背景） | **中**（声音/宠物要克制） | 化身要有**可喂/可逗的一句性格**（机器人呼吸灯、点眼睛）。不要无声自动 BGM。 |
| 9 | Eduard Bodak | https://www.eduardbodak.com/ ；奖项 https://www.awwwards.com/sites/eduard-bodak-portfolio | 2025-06 SOTD + Dev Award；FWA/CSSDA 同期 | 德文「Einfache Websites」大标题，Strategy / Design / Build 三卡，像素岛，黄黑两色。作者公开说：**还没有项目，站点自己必须能说话**。 | Webflow + GSAP + Locomotive + Swup 转场 + Osmo 鼠标跟随；像素过渡、滚动翻牌、小地图进度 | **手艺示范即作品集**。服务流程、触感、无障碍写进页面，代替案例网格。 | Webflow / GSAP / Swup | **高**（微交互、转场、复制邮箱） | 2025 年评委开始奖「克制的触感」而不只奖 3D。我们纸面 `/about/` 缺的就是**点击有感觉**（复制讲者简介、问题卡翻转），不必等 WebGPU。鼠标跟随大球不要学。 |
| 10 | Etienne Planeix | https://www.etienne.studio/ | 2026-01 SOTD | 极简三栏：Work / Archive / Info，实时时钟。首页几乎只有导航与版权年。 | 编辑部信息架构、档案与作品分轨 | **少即是定位**。用结构说「我是做数字工艺的」，不用 shader。 | 自研极简站 | **高** | About 路由可学三分：作品 / 档案 / 信息。我们已有 `/work/` `/about/` `/now/`，馆内不要再塞第三套导航。 |
| 11 | Glenn Catteeuw 2026 | https://glenncatteeuw.com/ ；奖项 https://www.awwwards.com/sites/glenn-catteeuw-portfolio-1 | 2026-01-01 SOTD | 加载 0/100 → 全名大字 → Enter / Enter without sound。副标 Interactive Art Director，可接 2026-10 档期。列表全是品牌名。 | Astro + vanilla JS + Three/WebGL + Alien.js；有独立 Game 页、doomscroll About、声音门 | **档期 + 品牌名单 = 身份**。声音可选。 | Astro（与我们同栈）+ WebGL | **高**（Astro 结构）；Game 页 **中** | 同栈可抄：加载不要挡内容、声音默认关、About 可做成「反 doomscroll」的短叙事。品牌墙我们没有，改成**三问题 + 站内佐证链接**。 |
| 12 | Abhishek Jha Folio '25 | https://abhishekjha.me/ ；奖项 https://www.awwwards.com/sites/abhishek-jha-folio-25 | 2025-09 SOTD + Dev；CSSDA WOTD | 多图加载器 0% → 「Visual Designer & Coder」椭圆标题 → 粉紫暗底、3D 花、Tetris 彩蛋、Playbook 探索墙。 | Three.js + GSAP、滚动章节、3D footer、游戏彩蛋 | **设计师年度仪式**：作品精选 + Playbook 草稿 + 哲学段。自我介绍是「I craft websites which will elevate your brand」。 | Three + GSAP | **中**（动效）；花/Tetris **低相关** | 学 Playbook（草稿墙）可映射「六站演进的中间态」。3D 花、预加载拼图、品牌 elevating 话术 = 代理商味，与技术编辑部冲突。 |
| 13 | Stefan Vitasović Portfolio25 | https://stefanvitasovic.dev/ ；FWA 访谈 https://thefwa.com/article/insights-stefan-vitasovic-portfolio25 | 2025-09 SOTD + Dev 8.04；FWA | Loading → 名字/职称字轨无限重复 → 一段定位：motion + interactivity，现 14islands Lead，Awwwards 评委。桌面 WebGL，移动端剥皮。 | R3F + Drei + Framer Motion + Zustand；自定义 virtual scroll；种子随机 DOM 抽象画；About 无限布局 | **作品即运动 reel**。About 是滚动的字与布局，不是简历。双体验（桌面 WebGL / 移动轻量）写进 FWA 访谈。 | Next.js + R3F，视频走 R2 | **中**（双体验钩子高）；视频 CDN **低** | **移动端剥 3D** 是 2025 个人站新标准，不是偷懒。我们 About 馆必须有同一钩子。种子随机背景可做「能力地图每次刷新不同排布」，但不要挡字。 |
| 14 | Artem Shcherban | https://artemshcherban.com ；奖项 https://www.awwwards.com/sites/artem-shcherban-portfolio | 2026-04 SOTD | 黑白干净系统：Showreel 首屏、作品过滤、独立 About/CV/Blog。奖项页自称「clean personal portfolio system」。 | Webflow + GSAP，深度层、过滤、Next Work 衔接 | **系统感**。设计师用产品化 IA 讲自己，3D 不是主角。 | Webflow / GSAP / Figma | **高** | 学 IA：About / CV / 作品过滤分轨。我们已有纸面 About，馆内不要再发明第四套。 |
| 15 | Gianluca Gradogna | https://gianlucagradogna.com/ ；奖项 https://www.awwwards.com/sites/gianluca-gradogna-portfolio | 2025-01 SOTD + Portfolio Honors | 暗底横滑无限画廊，摄影+设计+代码。加载转场、悬停图、clip 动画。 | 横向无限滚动、页面转场、图 hover | **多学科用媒介说话**。佛罗伦萨设计师，摄影当主叙事。 | 运动站（标签含 horizontal / infinite scroll） | **中** | 横向画廊适合作品，不适合「我是谁」。六站演进应是**时间轴纵向**，不要横滑把职业变成时尚 lookbook。 |
| 16 | Corentin Bernadou | https://corentinbernadou.com/ ；奖项 https://www.awwwards.com/sites/corentin-bernadou-portfolio | 2026-03 SOTD | 橙(#FF4401)×近黑。动画驱动的开发者作品集，无限滚动。 | WebGL + GSAP，排版即运动 | **颜色签名**。人还没出现，配色已经是名片。 | JS + WebGL + GSAP | **中** | 我们已有霓虹 token 与机器人青 `#49c5b6`。About 馆可把青色当「他的眼睛/签名」，不要再引入代理商橙。 |
| 17 | Tomasz Szmajda · 可走入的纸房间 | Codrops https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/ ；Awwwards HM https://www.awwwards.com/sites/tomasz-itom-szmajda-folio | 2025-12 开工，2026 获奖 | 2D 纸撕开变成可走的 3D 房间：Gallery / Studio / About / Contact。没有 Blender 模型，平面挤出 + 着色器绘制显现。 | R3F + GSAP 镜头飞、门、绘制显现 shader；AI 贴图；故意不好找 Contact | **走过去，而不是滚过去**。About 是一间房。作者说：想合作的人会找到 Contact。 | React 19 + R3F + Three 0.182 + GSAP | **中**（房间数少、无骨骼角色时） | 与我们「进楼切微距」脑暴同构。About 馆 = 一间米色档案室，纸面撕开展现六站。Contact 藏太深不适合招聘场景。 |
| 18 | Brittany Chiang | https://brittanychiang.com | 持续；2026 仍有新文章 | 跳过链接后直接 About：我是谁、在 Klaviyo 做什么、经历时间线、项目、写作。无 3D。 | 排版、锚点、a11y、时间旅行彩蛋 | **10 秒可读完的第一人称**。经历用职责+技术标签，项目用结果。 | Next.js | **高** | 非炫技金标准。纸面 `/about/` 已接近这个结构（问题→怎么做→佐证）。馆内 3D 不能把这段话吃掉。 |
| 19 | Takuya Matsuyama | https://www.craftz.dog/ | 长期；2026 版权页仍在 | voxel 小 3D 点缀 + 「Digital Craftsman」+ 真人照片 + Bio 年表 + 产品 Inkdrop。 | 轻量 3D 点缀、内容优先 | **手艺人年表**。3D 是胸针不是舞台。 | Next.js + 小 3D | **高** | 城市已经很重，About 馆的 3D 只能是**胸针级**。真人照片：主人未决，默认不用。 |
| 20 | Linus Lee / thesephist | https://thesephist.com/ | 2014 起写作；2026 仍更新演讲 | 「My name is Linus.」第一段就是研究问题。100+ 可点原型，演讲清单。 | 文字站 + 自研工具链 | **问题陈述即身份**。不展示技能条，展示他在追的问题。 | 自研静态站 | **高** | 解决方案经理版 = 三个问题（已在 `/about/`）。3D 馆应把这三个问题做成可走的展位，而不是换成更炫的形容词。 |
| 21 | Design in Product / Piper Morgan | https://designinproduct.com/projects/ ；https://pipermorgan.ai | 2025–2026 持续公开建造 | PM 不放简历：把每天在跑的多智能体工具、280+ 建造日志、57 模块 / 6300 测试 / 63 ADR 摊开。光谱从 AI-native → 传统产品。 | 案例网格 + 真链接 + 数字可点 | **能力 = 我在生产里跑的系统**。非工程师靠产物密度炫技。 | 静态站 + 外链真项目 | **高** | 非工程师标杆。我们有提分 Loop、receipt、e2e JSON——About 可以引用，但**主叙事仍是座舱×方案**，不要把本页做成 Agent 楼的重复。数字必须能点进站内页。 |
| 22 | Codrops 自我介绍类 demo 三件 | 粒子肖像 https://tympanus.net/codrops/2025/12/10/simulating-life-in-the-browser-creating-a-living-particle-system-for-the-untillabs-website/ ；WebGPU 流体字 https://tympanus.net/codrops/2025/01/29/particles-progress-and-perseverance-a-journey-into-webgpu-fluids/ ；滚动 3D 画廊 https://tympanus.net/codrops/hub/all/codrops/（2026-07 Scroll-Driven 3D Gallery Along Blender Path） | 2025–2026 | UntilLabs：真人照片拆成活的粒子。流体：字母变成可玩液体（作者自承非生产、MacBook Air 会跪）。滚动画廊：滚轮 = 镜头沿 Blender 路径走。 | GPGPU 粒子、WebGPU PBD 流体、scroll-driven 3D camera | Demo 本身很少讲「我是谁」，但技法常被个人站当 Hero。 | Three / WebGPU / R3F / GSAP | 粒子字 **中**；流体 **低**（移动端）；滚动镜头 **中**（我们已有相机系统） | **滚动即镜头**可把六站做成路径上的六个机位。流体字、无意义粒子、真人点云默认不做。Yuri Artiukh（https://tympanus.net/codrops/author/akella/ 、YouTube `@akella_`）2026 仍在播 TSL/ASCII，但是教程型，不是自我介绍页。 |

补充（不进主表，防误吸）：

- **Lusion** https://lusion.co ：工作室，不是个人站。有 Devin AI / Synthetic Human 等 3D 叙事，气质是品牌片。About 楼不要学成工作室 reel。R&D：https://labs.lusion.co 。
- **Paul Henschel / pmndrs**：个人站不是 2025–2026 自我介绍标杆；价值在 R3F 生态。我们已用 three/webgpu，不必为个人页再包一层 R3F。
- **Godly**：本次 `godly.website` 重定向到 `recent.design`，不能当活目录引用。
- **Dark Mode Design** https://www.darkmodedesign.com ：目录站。个人向条目如 https://smirnov-artur.github.io/webgl 、https://www.pablomiguez.dev ，暗底与我们同族，但多数是作品秀不是「我是谁」。
- **Bruno Arizio** http://brunoarizio.com ：Awwwards 记 2025-02 SOTD，WebGL+GSAP 极简导航。时尚设计师气质，和座舱方案交叉弱。
- **Henri Heymans '25 / Roman Jean-Elie Portfolio '25**：奖项页确认存在（2025-02 / 2025-11 SOTD），本次未深打开活站，不编首屏细节。

---

## §2 「个人站 wow」机制（8 种）

每种 2 例。标注 2026 是否已过时：**过时** = 再做会显模板；**未过时** = 机制仍有效，但要换皮贴我们的身份。

### 1. 3D 化身有性格，且性格来自场景

访客 10 秒内觉得「这不是通用机器人/通用小人，是这个人的世界」。

- Bruno：车会跳、按喇叭、有皮肤奖励。
- Jesse：拉面店里的你是食客。

2026：**未过时，但「再做一个可开车的世界」已过时**——Bruno 自己把 2019 的车世界做了十年终版。我们城里已经有车和机器人。About 要给机器人**老家性格**（Idle 呼吸灯、Walk 进档案室），不要再给一辆车。

### 2. 房间 / 物体可进，内容贴在空间里

不是滚动文章，是走入空间后才读到字。

- Henry：CRT 显示器里的 OS。
- Tomasz：纸房间 About Room。

2026：**未过时**。成本可控的版本是「一间房 + 热点」，不是开放岛。这是 About 馆最该借的机制。

### 3. 滚动即镜头

滚轮变成摄像机轨道，章节 = 机位。

- Stefan：自定义 virtual scroll 驱动 WebGL 与 About 无限布局。
- Codrops 2026-07：沿 Blender 路径的滚动 3D 画廊。

2026：**未过时**，且比开放世界更适合 GitHub Pages。风险是「滚了 30 秒还不知道他是谁」——每个机位必须落一句定位或一个证据。

### 4. 手艺即作品（站点自己会说话）

没有案例也敢上线，因为微交互就是作品。

- Eduard：公开无项目，572 小时把触感做成作品。
- Glenn：Astro 站本身是交互艺术指导的名片。

2026：**未过时，且正在奖**。对非工程师尤其重要：解决方案经理的「手艺」应是**问题卡、复制简介、时间轴、佐证链接的触感**，不是无意义粒子。

### 5. 过程台账，而不是 Showcase

明文拒绝作品秀，改成研究/实践痕迹。

- Nicola：artboard 是实践痕迹。
- Design in Product：建造日志 + ADR + 测试数。

2026：**未过时，且更贴我们的人设**。六站演进、三问题、讲者简介已经是台账。3D 只负责让台账可走、可点。

### 6. 真数据雕塑 / 粒子来自真实图像或真实结构

粒子不是装饰，是照片、能力图或文字的物理化。

- UntilLabs：真照片重建成活粒子（Codrops 2025-12）。
- David Hckh：肖像 ↔ 文字的点云。

2026：**装饰性粒子已过时；数据驱动粒子未过时**。我们没有授权真脸。应用六向交叉能力或「复杂技术 → 可决策方案」八字做聚散，数据源必须是定位文案或站内链接，不能随机噪波。

### 7. 声音作为性格，但默认可关

- Léo：Click to enable sound；蜜蜂。
- Glenn：Enter without sound。
- Bruno：全岛空间音频 + 三首 CC0 配乐。

2026：**强制 BGM 已过时**。可选空间音（档案室纸页、机器人舵机）可以有；默认静音。主人是否有签名/手写素材未知，不要预留假音频。

### 8. 出人意料的导航（画板、横滑、游戏、彩蛋）

- Nicola：画板格子。
- Gianluca：横向无限。
- Abhishek：Tetris。
- Bruno：成就与低语。

2026：**为意外而意外已过时**。彩蛋只能奖励「已经懂他是谁」的人（例如六站走完才开讲者简介复制）。招聘场景的主路径必须 10 秒可读。

---

## §3 三个方向草案

均默认：**不用真人脸**；路由未决时，纸面 `/about/` 保留，馆走 `/world/about-pavilion/` 或 `?from=city`。化身资产现成：`public/models/hero-robot/HeroRobot.glb`（CC0，338KB，Idle/Walk，眼青 `#49c5b6`）。馆色：米色 `#fef3c7`。文案单源：定位一页纸 + 现有三问题 / 六站 / 讲者简介。

### 方向 A｜机器人的老家：六站档案室

**一句话概念**：城里那台青色眼睛的机器人把你领进自己的档案室；六间侧室 = 六站职业演进，每间只讲「那一站解决了什么」。

**首屏 10 秒**  
访客（或从城市 deepLink）进入米色房间。机器人 Idle，眼灯呼吸。墙上八个大字：「把复杂技术转化为可决策、可交付、可复用的解决方案」。门楣一行：「汽车智能座舱与 AI 解决方案经理」。10 秒内不必开车、不必加载进度条。

**30–60 秒叙事路径**  
1. 点机器人或按「跟我走」→ Walk 到房间中央。  
2. 六扇档案柜按时间排列：物联网 → 整车前瞻 → AR-HUD → 多语种座舱 → 端云大模型 → AI 工作流。  
3. 打开一扇，只出现现有 `timeline.note` 那一句 + 对应佐证链（TTS 座舱 / 端云分层 / AI 工作流）。  
4. 三张主问题卡挂在主桌，对应 `/about/` 已写的三个「我解决什么」。  
5. 桌角「讲者简介」一键复制（已有 US-16）。  

**如何用 hero-robot**  
他是馆长，不是载具。Idle = 在家；Walk = 带路。不要在馆内再变形成车（变形是城市场景的签名，馆内重复会抢戏）。

**需要的资产**  
现成 GLB；六张柜门/标签（可用 CSS 或低模盒，不必新扫描）；三张问题卡用现有文案；无需新声音。可选：纸张法线贴图一张。

**静态可行性**  
高。无 JS / 无 WebGPU = 现有 `/about/` 纸面。有 JS 无 WebGPU = CSS 房间 + 机器人海报。有 WebGPU = 真 Idle/Walk。

**移动端与降级**  
Stefan 式剥皮：移动端不做 Walk，改纵向时间轴 + 机器人静帧。`prefers-reduced-motion`：停呼吸灯，柜门直接展开。

**风险**  
做成迷你 Bruno（又一个可玩世界）；六室空无一物（文案不够就不要硬做 3D）；进馆丢城市会话（TECH 脑暴已警告要 `world-arrival-v1`）。

### 方向 B｜滚动即镜头：六向能力沿一条轨道

**一句话概念**：滚轮变成摄像机。一条轨道穿过「汽车 × 座舱 × 多语种 × 大模型 × AI 工作流 × 交付」六个交叉点；机器人站在轨道起点当比例尺。

**首屏 10 秒**  
暗底。一个 TSL 物体（玻璃/霓虹晶体，不是粒子球）上刻着定位短句。机器人站在晶体旁，体量小于晶体。滚动第一屏，晶体转到「座舱」面。

**30–60 秒叙事路径**  
机位 1 定位 → 2–4 三个问题（各停 8 秒，旁注站内佐证）→ 5 六站时间轴沿轨道展开 → 6 两个岗位入口（汽车 AI 座舱 / AI 提效 Agent）分左右两条支路 → 停在「Now」草稿（定位一页纸里那三行）。全程可跳过到纸面。

**如何用 hero-robot**  
他是比例尺和指针：晶体转到哪一面，他看向哪一面。不要让他表演整段 Walk 循环抢镜头。

**需要的资产**  
一条相机路径（可用现有 city 相机，不必 Blender 新岛）；晶体材质走 TSL（Maxime 路，体量 S）；六面文案来自定位 mindmap，不新写履历。

**静态可行性**  
中。滚动镜头可降成 CSS scroll-driven 章节。晶体可降成静态 SVG 六面图。GitHub Pages 吃得下。

**移动端与降级**  
移动端禁用相机插值，改锚点章节。WebGPU 失败用 WebGL 或静态图。性能走 Lab/world 预算，不当正文 LHCI 页。

**风险**  
「滚了很炫仍不知道他是谁」；晶体变成无意义折射秀；与城市首屏抢同一套 TSL 语言导致审美疲劳。

### 方向 C｜过程即身份：证据编辑部（非工程师炫技）

**一句话概念**：不靠开放世界证明会写代码，靠「把复杂问题摊开成可决策结构」证明他是解决方案经理。机器人只作为栏目标记。

**首屏 10 秒**  
大标题沿用纸面：「我解决的是『复杂技术 → 可决策方案』这段路」。副标题一行。右侧一枚小机器人（胸针级，craftz.dog 密度）。没有加载器。

**30–60 秒叙事路径**  
Eduard 式触感 + Brittany 式信息密度 + Nicola 式「这不是 showcase」：三问题卡可翻转（正面问题、背面做法+佐证）；六站是一条可聚焦的时间轴，不是技能条；页尾复制讲者简介；一条小字指向城市「若要看他怎么编排 AI，去 Agent 楼，这里只讲人」。Design in Product 的数字纪律：凡出现「16 语种」必须链到 TTS Lab，不写空数字。

**如何用 hero-robot**  
栏目标记 / 复制成功时点头一次（Walk 一帧或动画事件）。禁止全屏 3D。

**需要的资产**  
零新模型。View Transitions、按钮触感、焦点态。可选：一张能力交叉 SVG。

**静态可行性**  
高。这就是把现有 `/about/` 做到 2026 触感水位，馆可以是同一套 DOM 的 3D 壳。

**移动端与降级**  
天然移动优先。无 JS 时三问题仍可读。

**风险**  
相对「极其炫技」的任务书偏静。若主人要的是 Awwwards 级首屏，C 不能单独当馆的唯一体验，应作为 A/B 的降级层与 SEO 层。

### 建议怎么选（不替主人决定）

- 要「哇」且不与城市重复 → **A 为主，C 为纸面与降级**。  
- 要 WebGPU 新技法且可复用相机 → **B，但晶体必须挂定位文案**。  
- 要招聘 30 秒复述、LHCI 正文页 → **C 必须存在**，无论 A/B 是否做。  

未决：真人照片、声音、手写签名、馆的路由。三方向都不依赖这些素材。

---

## §4 反面清单（2026 已显廉价或过时）

做 About 楼时看见下列冲动，停。

| 做法 | 为什么 2026 廉价 | 我们若误用会怎样 |
|---|---|---|
| 预加载 5 秒（Cooking / BIOS / 0–100 必须看完） | Glenn/Jesse 可以是风格；评委已开始奖「立刻能读」。Eduard 自己也在反省加载过重。 | 招聘方手机 WhatsApp 打开即走。 |
| 无意义粒子 / 鼠标跟随大球 / 流体背景 | Codrops 流体作者自承非生产；Eduard 奖项页的 mouse follower 是细跟随不是大球。UntilLabs 粒子有真照片才成立。 | 看起来像 2022 模板，且与座舱/方案无关。 |
| 模板 Hero 打字机（Hi I'm a passionate...） | Henry 的打字机是 2022 CRT 世界观的一部分；抽出来就是 AI 味。 | 与现有「不罗列职责」定位相反。 |
| 再做一个可开车/可走路的开放世界 | Bruno 2025 已经把这条路走到开源终版。我们城里已经有。 | 访客分不清城和 About；预算炸 LHCI。 |
| Awwwards 代理商花、椭圆标题、elevating your brand | Abhishek Folio'25 对设计师成立，对方案经理是串台。 | 技术编辑部基调被香水站覆盖。 |
| 强制横屏 / 强制开声音 / Contact 藏起来 | Nicola 横屏、Tomasz 藏 Contact、部分站 Click to enable 却自动播。 | 招聘场景失败。 |
| 技能百分比条、纯 PDF 简历搬运 | 2010s 反模式，社区共识仍在。 | 现有三问题结构倒退。 |
| 奖杯计数墙、SOTD 徽章墙 | Aristide 可以，因为他卖运动开发。 | 我们卖可决策方案，徽章是错的证明物。 |
| 假实时「正在跑 Agent」 | 上一轮 N1-SHOWCASE 已否。 | 与 Agent 楼抢戏，且静态站必然假。 |
| 横向时尚 lookbook 讲职业演进 | Gianluca 对摄影成立。 | 六站变成作品调性，丢失时间因果。 |
| 真人脸点云 / 未授权扫描 | 主人未决；默认不用。 | 合规与气质双风险。 |
| 无障碍为零的 WebGL 唯一路径 | 多份 SOTD 的 a11y 分偏低。 | 正文页 LHCI ≥95 硬门；馆必须有纸面双胞胎。 |

---

## 给后续三路的接口（不扩批）

- Avatar 路：优先 A 的馆长设定 + 胸针级降级；Idle/Walk 已够，不要新剪辑除非主人要一句性格动作。  
- Storyboard 路：A 的 10 秒/60 秒可直接分镜；C 是每个分镜的无 JS 字幕轨。  
- Stack 路：不要为 About 引入 R3F/Webflow/Lenis；复用 three/webgpu + TSL + 现有到达快照。视频 CDN 与多人低语不做。
