# 社区调研：最佳个人网站 / Portfolio 应该什么样（Reddit / HN / Dev.to / V2EX）

> **文档性质**：社区舆情与共识调研，只读不改业务代码
> **服务对象**：王磊个人网站（Astro + TypeScript + MDX + GitHub Pages，总纲见 `docs/website-plan/master-plan.md`）
> **调研范围**：Hacker News（Ask HN / Show HN 原帖）、Reddit（r/webdev、r/UX_Design 等，含镜像与复盘文章中的一手引述）、Dev.to、V2EX、知乎/中文技术社区二手信源
> **调研方式**：Web 搜索 + HN Algolia API 抓取原帖评论 + 镜像站抽取 Reddit 讨论（Reddit 官方 API 对爬虫封锁，部分引述来自可信复盘文章的原文摘录）
> **版本**：v1.0（2026-08）

---

## 目录

- [0. 调研方法与信源可信度说明](#0-调研方法与信源可信度说明)
- [1. 社区共识 Top 10：反复被提到的「好网站」特征](#1-社区共识-top-10反复被提到的好网站特征)
- [2. 反模式清单：社区普遍批评的做法](#2-反模式清单社区普遍批评的做法)
- [3. Reddit / HN 高频推荐的具体网站](#3-reddit--hn-高频推荐的具体网站)
- [4. 职业类型差异：工程师 vs 设计师 vs PM/解决方案经理](#4-职业类型差异工程师-vs-设计师-vs-pm解决方案经理)
- [5. 对「解决方案经理 + 汽车智能座舱 + AI」定位的具体建议](#5-对解决方案经理--汽车智能座舱--ai定位的具体建议)
- [6. 讨论帖索引：原帖 URL + 关键 quote 摘要](#6-讨论帖索引原帖-url--关键-quote-摘要)

---

## 0. 调研方法与信源可信度说明

| 信源类型 | 获取方式 | 可信度 |
|---------|---------|--------|
| HN 原帖（Ask HN / Show HN / 热帖） | HN Algolia API 直接抓取评论原文 | 高：一手原文，可回溯 |
| Reddit 讨论 | 官方 API 封锁；通过镜像站（synth.download / sentinel-team.org）与复盘文章（freeCodeCamp、Hashnode）中的原话摘录 | 中高：引述可交叉验证，原帖 URL 已标注 |
| V2EX 帖子 | 搜索直达原帖 | 高：一手原文 |
| Dev.to / 行业指南 | 搜索直达 | 中：作者个人观点，用于补充职业差异视角 |
| 知乎 | 直接检索未命中高质量原帖，以中文技术媒体二手信源替代 | 中：仅作中文语境佐证，不作为核心论据 |

所有引用均为真实社区讨论，关键 quote 附原文（英文保留原文 + 中文概译）。未经验证的传闻不收录。

---

## 1. 社区共识 Top 10：反复被提到的「好网站」特征

以下十条按「跨社区提及频率 × 与雇主/合作方决策的相关度」排序。每条都注明出处。

### 1.1 首屏 10 秒内说清「你是谁、做什么、找你能干嘛」

这是 Reddit 和 HN 双社区最高频的共识。r/webdev 的 roast（互评）文化里，最常见的差评就是「看了 30 秒还不知道你是干嘛的」。

> "I still don't know what you do after looking at this for 30 seconds"（看了 30 秒我还是不知道你是做什么的）
> —— r/webdev roast 评论，引自 [Reddit Roasted My Portfolio](https://lakshayoberoi.hashnode.dev/i-shared-my-portfolio-on-reddit-and-got-roasted-here-s-what-i-changed) 复盘

招聘方视角的量化版本：招聘经理平均浏览节奏是「首页扫 10 秒 → 点一个项目 20 秒 → 扫代码 20 秒 → 看 GitHub 10 秒」（[Dev.to：Developer Portfolio Checklist](https://dev.to/_d7eb1c1703182e3ce1782/developer-portfolio-checklist-20-things-hiring-managers-look-for-388p)）。首屏没接住，后面全白搭。

### 1.2 案例 > 列表：讲「问题 → 方案 → 结果」的故事，而不是堆技术名词

r/UX_Design 一位一周做了 10+ 场 portfolio review 的从业者总结的「第一大错误」：

> "Showing beautiful screens — but zero thinking process. No problem statement. No research. No 'why'. Just mockups. Recruiters don't want to see what you designed. They want to see HOW you think."（只展示漂亮界面、零思考过程。没有问题定义、没有调研、没有「为什么」。招聘方想看的不是你设计了什么，而是你怎么思考。）
> —— [r/UX_Design 原帖](https://www.reddit.com/r/UX_Design/comments/1v02mz2/had_10_portfolio_review_sessions_this_week_heres/)

对应到项目描述的写法差异（r/webdev roast 复盘中的 before/after）：

- Before：「用 React + Node 做了一个通知系统」
- After：「Owned the end-to-end notification system for a hiring platform — designed, built, and shipped to production serving thousands」（端到端负责一个招聘平台的通知系统——设计、开发并上线，服务数千用户）

### 1.3 少而精：3–5 个高质量案例，胜过 10 个练手项目

freeCodeCamp 上那篇著名的《我在 Reddit 上 3 天评审了 50 个 portfolio》（作者在 r/webdev 做免费评审后总结）和中文社区结论一致：求职用放 3–5 个最能打的项目；每个讲透，比 10 个「没头没尾的练手项目」强得多。HN 补充视角：高交互「炫技型」站点通常只放最新最强的 3–5 个项目，极简型站点才适合放 15–25 个条目（[Substack: Crafting compelling portfolios](https://sergeyieffe.substack.com/p/crafting-compelling-portfolios-web-developers-and-ux-designers)）。

### 1.4 性能就是人品：加载速度是社区验货的第一道关

HN 用户对速度的要求极其苛刻：

> "Secondarily, and required to make it a great site, would be speed (I should be able to start reading in at most 0.2 seconds from load in an ideal case)"（要成为好网站的第二个必要条件是速度——理想情况下我应该在加载后 0.2 秒内开始阅读）
> —— tomjen3，[Ask HN: What makes a great personal website?](https://news.ycombinator.com/item?id=23694414)

对前端/技术相关岗位，招聘方会真的跑 Lighthouse：

> "Technical hiring managers at frontend-forward companies will run Lighthouse. They will open DevTools. A portfolio claiming 'performance-focused engineering' that scores 62 on Performance is an immediate credibility problem."（重前端的公司里，技术招聘经理真的会跑 Lighthouse、开 DevTools。自称「注重性能」但 Performance 只有 62 分，可信度当场崩塌。）
> —— [showproof.io: Frontend Developer Portfolio](https://showproof.io/guides/frontend-developer-portfolio/)

本仓库 master-plan 7.5 定的「Lighthouse 四项 ≥ 95、首页传输 < 200KB」门槛与社区共识完全一致。

### 1.5 移动端不是可选项：招聘方就是在手机上打开你的链接

> "Recruiters open links on phones. Hiring managers forward portfolios to their phones. A layout that works on your MacBook and breaks on an iPhone SE (375px viewport) tells the evaluator exactly what your production mobile quality will be."（招聘方就是在手机上打开链接的。在你的 MacBook 上正常、在 iPhone SE 上碎掉的布局，直接告诉评估者你的量产移动端质量。）
> —— showproof.io（同上）

freeCodeCamp 那篇 Reddit 评审总结进一步要求 mobile-first 的 CSS 写法：只写 `max-width` 媒体查询会被解读为「移动端是事后补的」。

### 1.6 个性与记忆点：人们记住的是「有性格」的网站，不是「不犯错」的网站

> "Make it yours. Don't copy others, in style or content. Be passionate about it. If you left one thing behind on this earth make it your website. It's your digital personality."（做成你自己的。风格和内容都别抄别人。它是你的数字人格。）
> —— Jaruzel，Ask HN 23694414

> "People won't remember a personal site because the home page ticked all the boxes. They will remember the site that had character and a point of view."（没人会因为首页「每项都做对了」而记住一个网站；被记住的是有性格、有观点的网站。）
> —— [Own Your Web newsletter Issue 15](https://newsletter.ownyourweb.site/archive/issue-15/)（汇总 Mastodon/HN 圈层对个人主页的看法）

Reddit 评审方的对应说法：在一片模板化 portfolio 里，「小而克制的定制」最抓眼球——非常规导航、CSS 细节功力、针对目标公司的定向内容（freeCodeCamp 50 portfolio 总结："Step away from the norm… make small changes that do not harm the design"）。

### 1.7 明确受众：给招聘方、客户、同行做的网站是三个不同的网站

> "It mostly depends on who you're aiming the website at. Recruiters? Researchers? Conference organizers? People who use your software? Those will all be looking for different things so make sure to show exactly what they want to see."（关键看你的目标受众是谁。招聘方？研究者？会议组织者？软件用户？他们要看的东西完全不同。）
> —— 0xBE5A，Ask HN 23694414

r/webdev roast 里同款批评："Who is this portfolio for? A recruiter? A client? A hiring manager? Pick one."（这网站到底给谁看的？挑一个。）freeCodeCamp 总结甚至建议：求职和接单（freelance）应该做两个独立的 portfolio。

### 1.8 活的网站 > 死的网站：持续更新本身就是信号

HN 对「好个人网站」的定义里反复出现 "gets updated regularly"（type0，Ask HN 23694414）。V2EX 的中文讨论同构：个人网站是长期资产，价值在于持续沉淀（拍照作品集逐年更新的 [xzd.me 分享帖](https://www.v2ex.com/t/1039465)、以及[《当代码不再稀缺》](https://www.v2ex.com/t/1227624)里「把碎片化思考沉淀为资产」的共识）。本仓库 master-plan 的 Now 模块（首页区块 5）正对应这一条。

### 1.9 可验证的证据链：Live Demo + 代码/产出可查 + 讲清你个人的贡献

> "Show me the code and the live site… Tell me what you've actually contributed to. Github repos can provide a clear history for me to review your work and understand this group dynamic."（给我看代码和线上站点……讲清楚哪部分是你本人做的。仓库提交历史能让我验证团队项目中你的实际贡献。）
> —— freeCodeCamp《我评审了 50 个 Reddit portfolio》

招聘方侧的印证：「看不到运行效果就不会 clone 仓库」「案例要能撑住追问：为什么选这个方案、备选是什么、什么翻车了」（[solid-web.com 招聘经理视角](https://solid-web.com/developer-portfolio-gets-interviews/)、[Dev.to: Stop Building Developer Portfolios Like Designer Portfolios](https://dev.to/brianyoung/stop-building-developer-portfolios-like-designer-portfolios-2nij)）。

### 1.10 可访问性与细节洁癖：错字、断链、对比度都会被当作专业度信号

freeCodeCamp Reddit 评审总结的第一条就是无障碍："members of your target audience will have disabilities… before writing any styling, make sure it is accessible."（你的目标受众里一定有残障用户；写样式之前先保证可访问性——键盘导航、对比度。）结尾一条是细节："We're constantly scanning the website instead of reading it top-to-bottom. So make sure you have your layout styling perfected, each sentence proofread, and no broken links."（评审者是扫读的，版式、错字、断链全都会被看到。）社区还普遍点名 `prefers-reduced-motion` 支持——被推荐的标杆站（brittanychiang.com、nolmedo.dev 等）都实现了动画降级。

---

## 2. 反模式清单：社区普遍批评的做法

按社区批评烈度排序。左列是做法，右列是社区原话或出处。

| # | 反模式 | 社区证据 |
|---|--------|---------|
| 1 | **强制观看的开场动画 / 超长 loading** | r/webdev roast："The intro animation is 4+ seconds. I closed it before it finished."（开场动画 4 秒+，没播完我就关了）。HN 评 Bruno Simon："Is it really 'extremely well executed' if it takes so long to load that I've closed the tab before seeing anything?" |
| 2 | **过度动画 / 滚动劫持** | 设计招聘方："Scroll animations that are too long"、"It's really distracting to evaluate portfolios if animations are constantly looping"（循环动画干扰评估，滚动动画太长是红旗）—— [LinkedIn: Red flags on portfolios from a design recruiter](https://www.linkedin.com/posts/avacarroll_red-flags-on-portfolios-from-a-design-recruiter-activity-7478103884041789441-Qt2K) |
| 3 | **纯简历搬运 / PDF 思维** | r/webdev 共识："A portfolio isn't a resume. A resume lists what you know. A portfolio shows what you've done with it — and what you can do for someone else."（简历列你会什么，portfolio 展示你用它做成了什么、能为别人做什么。）把 A4 简历原样铺到网页上是最常见差评。 |
| 4 | **技能条 / 百分比自评** | freeCodeCamp Reddit 评审总结明确点名：不要放主观技能条（"skill bars"），它既不可验证也无信息量，用真实项目代替。 |
| 5 | **只有截图没有思考过程（设计岗）/ 只列技术栈没有结果（工程岗）** | r/UX_Design："Just mockups… They want to see HOW you think."；r/webdev roast："Your projects list tech but show no real outcomes"（项目只列技术，看不到实际成果）。 |
| 6 | **Lighthouse 差 / 巨图不压缩** | HN："Optimize your images. If you're gonna go down the tedious 'hero image' road, DON'T make visitors download 10-meg background images."（slater，Ask HN 23694414）；showproof：性能分 62 = 当场信用破产。 |
| 7 | **移动端碎裂** | showproof："A portfolio with a broken mobile layout is among the worst possible signals."；中文社区同款：「务必确保移动端适配良好，大量简历是通过手机查看的」。 |
| 8 | **「AI 味」模板脸：干净但无主** | V2EX vibe coding 帖高赞评论：「AI 味比较重」「满满的 AI 味」——[原帖](https://www.v2ex.com/t/1218922)；设计社区对应说法："Polished, but generic. Clean, but default. It looks like the tool made the aesthetic decisions instead of the designer."（LinkedIn 设计招聘方评论区） |
| 9 | **炫技绑架内容：3D/WebGL 成为获取信息的障碍** | HN 评 Bruno Simon 3D portfolio："This is very impressive as an art project, but terrible as an actual home page. It's slow as molasses and difficult to navigate. Microsoft Bob failed for a reason."；"it consumes as many or more resources than games like cyberpunk or baldur's gate 3 on my macbook."（比 3A 游戏还吃资源） |
| 10 | **没有降级出口** | HN 评 Henry Heffernan 的 Win98 模拟器站："Cool, but maybe have a way to view the site without all the simulation fanfare."（很酷，但请给一条不看模拟器直接看内容的路）——即：玩具可以有，但必须有跳过按钮/纯文本版。 |
| 11 | **失焦：一个站同时想服务求职 + 接单 + 博客 + 摄影** | freeCodeCamp Reddit 评审："A lot of portfolios are used both for job applications and freelance clients. Don't do this."；HN：内容与目标岗位不相关的项目反而稀释信号（"your main focus seems a whole different industry"）。 |
| 12 | **断链、未完成区块、「Coming soon」** | 设计招聘方红旗清单："Broken experiences, unfinished work… a template section that wasn't finished"；Reddit 评审「every little detail matters」。 |
| 13 | **教程克隆项目（工程岗）** | Dev.to / 招聘方共识：todo-list、天气 App、教程跟练项目是负资产；「avoid tutorial clones」几乎出现在每篇 hiring-manager 视角文章里。 |
| 14 | **重型站点无 loading 反馈** | HN 评 Bruno Simon："It has no load progress indicator."——重资源演示可以接受加载，但必须有进度指示。 |
| 15 | **为炫而炫的交互，与你的岗位无关** | HN："I think it's not a website you make to get hired to make business websites… but if you want someone to make a game on the web then this is a perfect portfolio site."（炫技站只对「岗位 = 做这类东西」的人是加分项。）通用原则：演示必须证明你岗位相关的能力。 |

---

## 3. Reddit / HN 高频推荐的具体网站

以下站点在多个社区讨论帖中被反复推荐（每个都附推荐理由与出处线索）。分三类：专业克制型、创意炫技型、内容驱动型。

### 3.1 专业克制型（招聘友好）

| 网站 | 主人/身份 | 社区推荐理由 |
|------|----------|-------------|
| [brittanychiang.com](https://brittanychiang.com) | Brittany Chiang，前端工程师 | 全网被引用最多的开发者 portfolio；v4 开源仓库 14k+ star、fork 数第一。被推崇的点：深色极简 + 单一强调色；**以工作履历（而非 side project 堆砌）作 hero**；About 只有四句话；键盘导航 / ARIA / reduced-motion 全套无障碍。r/webdev、r/reactjs 常年推荐。 |
| [stephango.com](https://stephango.com) | Steph Ango，Obsidian CEO | HN「最美个人博客」帖（[47302553](https://news.ycombinator.com/item?id=47302553)）多次点名；极简、快、观点密度高。 |
| [macwright.com](https://macwright.com)（Tom Macwright） | 开源开发者 | HN 评价：「somewhat famously loads insanely fast thanks to a sort of web equivalent of brutalist design while still looking nice」（以近乎粗野主义的极简闻名，快得出奇但依然好看）。 |
| [gwern.net](https://gwern.net) | Gwern，独立研究者 | HN 专帖讨论其设计（[30928081](https://news.ycombinator.com/item?id=30928081)，254 评论）：排版、旁注、慢网络下 3 秒内可读；被当作「技术极简 + 内容深度」的标杆。 |
| [solar.lowtechmagazine.com](https://solar.lowtechmagazine.com) | Low-Tech Magazine | 太阳能供电的静态网站，HN 双帖点名；「设计即立场」的极端案例。 |
| [szymonkaliski.com](https://szymonkaliski.com) | Szymon Kaliski，独立工程师/研究者 | HN「最美个人博客」帖："I like minimal UI so this is my absolute favorite." |

### 3.2 创意炫技型（社区又爱又吵）

| 网站 | 主人/身份 | 社区推荐理由与争议 |
|------|----------|-------------------|
| [bruno-simon.com](https://bruno-simon.com) | Bruno Simon，Three.js Journey 作者 | 开卡车逛 3D 世界的 portfolio，多次登上 HN 首页（最近一次 [46206531](https://news.ycombinator.com/item?id=46206531)）。正方："extremely well-executed portfolio site"、艺术风格统一、彩蛋密度高；反方：加载 30 秒+、CPU 100%、"terrible as an actual home page"。**社区结论：因为他的职业就是「教人做 WebGL」，所以网站即产品，成立；换成别的岗位就是灾难。**他本人写过[案例复盘](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)。 |
| [henryheffernan.com](https://henryheffernan.com) | Henry Heffernan，现 Vercel 高级设计工程师 | Win98/2000 风格的 3D 电脑模拟器 portfolio（内置可玩 DOOM），[Show HN 31313187](https://news.ycombinator.com/item?id=31313187)；应届生作品直接帮他进了 Vercel。批评同样存在："maybe have a way to view the site without all the simulation fanfare." |
| [jessezhou.com](https://jessezhou.com) | Jesse Zhou，管理咨询转软件工程 | 赛博朋克拉面店 3D portfolio，Awwwards Honorable Mention，HN Bruno Simon 帖中被再次推荐；作者写有[制作复盘](https://jesse-zhou.medium.com/jesses-ramen-case-study-77bae77ab5f0)。**对非工程背景（咨询/方案岗）想「证明技术品味」的人是最相关的先例**：一个作品带他完成了职业转型。 |
| [acko.net](https://acko.net)（Steven Wittens） | 图形工程师 | HN 老牌推荐：3D 管状 logo header + 讲清实现原理的博文；「炫技 + 讲原理」并举的典范。 |
| [messenger.abeto.co](https://messenger.abeto.co) | 创意工作室作品 | HN 评论里作为「比 Bruno Simon 更酷的 3D 网站」被引用。 |
| [lynnandtonic.com](https://lynnandtonic.com) | Lynn Fisher，设计师 | HN："really well-built and has a distinctive style"；以每年整站重设计（含著名的 resize 彩蛋）闻名。 |
| [eva.town](https://eva.town) | Eva Decker，设计工程师 | Own Your Web / HN 圈推荐：可弹奏的小键盘、贴纸收藏、留言板——「playful details」的代表。 |

### 3.3 内容驱动型（数字花园 / 交互式文章）

| 网站 | 主人/身份 | 社区推荐理由 |
|------|----------|-------------|
| [maggieappleton.com](https://maggieappleton.com) | Maggie Appleton，设计师/作者 | HN 双帖推荐：「digital garden」范式代表，插画 + 知识体系公开生长。 |
| [ciechanow.ski](https://ciechanow.ski) | Bartosz Ciechanowski | HN「S-TIER」级推荐：交互式物理/机械原理长文；「animated, visual, interactive and absolutely blow your mind off」。**互动可视化提升理解力（而非装饰）的最高标杆**，对做「能力地图/座舱演示」类内容最有参考价值。 |
| [tonsky.me](https://tonsky.me) | Nikita Prokopov，工程师 | HN 双帖推荐：荧光黄底的强个性设计 + 高质量技术长文，证明「个性」与「可读性」可兼得。 |
| [krasjet.com](https://krasjet.com/rnd.wlk/julia/) | Krasjet | HN gwern 设计帖中被评为「极简、功能、美学、排版、无障碍、移动端的完美平衡」。 |
| 目录站：[personalsit.es](https://personalsit.es)、[are.na 个人站合集](https://www.are.na/tmm/personal-sites-iouu5rp4cra) | — | HN 评论中反复出现的灵感目录（后者收录 300+ 个人站）。 |

---

## 4. 职业类型差异：工程师 vs 设计师 vs PM/解决方案经理

社区讨论中一个清晰但常被忽略的结论：**「个人网站该什么样」没有通用答案，取决于「网站本身是不是你的作品」**。

### 4.1 工程师：网站是「索引」，作品是「证据」

- **前端/设计向工程师**：网站本身就是作品，值得重投入。社区默认你的站会被开 DevTools、跑 Lighthouse 检验（showproof）；20–40 小时的设计与构建投入被认为合理（techinterview.org）。
- **后端/基建/数据工程师**：社区共识是别过度投入。"For most backend, infrastructure, and data engineers, it's a time sink that doesn't pay off… A clean LinkedIn and GitHub usually does the same job."（[techinterview.org](https://www.techinterview.org/post/3233474627/personal-website-portfolio-engineers/)）V2EX 同款结论：「走技术专家的路线，尤其是后端，自己的作品难度上和公司相差太多……谁会拿个人作品说话」（[t/564913](https://www.v2ex.com/t/564913)）。
- **资深工程师**：portfolio 的读者从「批量筛选的 recruiter」变成「评估判断力的 CTO/VP/同级工程师」，重点从 side project 换成「架构决策 + 权衡 + 可度量结果」，代码不可公开时讲清挑战与选型即可（showproof senior guide、Dev.to brianyoung）。
- 通用底线：会部署一个快的静态站本身就是信号；用 Notion 当工程师 portfolio 会被解读为「连基本 Web 应用都不愿/不能部署」（[slategit.com](https://slategit.com/blog/notion-developer-portfolio-vs-website)）。

### 4.2 设计师：网站是「第一件作品」，流程是「核心内容」

- Portfolio 是硬性门槛："A portfolio is non-negotiable. Most hiring managers will not interview without one."（heyavery.ai）
- 网站自身的 UX 就是考题：「许多 UX 设计师的 portfolio 本身就是糟糕体验和过度堆砌的界面——这与他们声称精通的原则直接矛盾，是重大红旗」（pixpa 综述 + Reddit 讨论）。
- 内容重心是 case study 的思考过程（问题定义 → 调研 → 决策 → 结果），但 r/UX_Design 讨论也揭示了张力：recruiter 想快速看视觉，面试官想看深度——所以要「先给结果、再给过程」双层展开，让两类读者各取所需。
- 动画/motion 允许比工程师站多，但设计招聘方的红线一致：循环动画、超长滚动动画、加载慢都是红旗。

### 4.3 PM / 解决方案经理：网站是「决策档案」，指标是「货币」

- PM portfolio 不是必需品，但在同质化竞争中是 top 1% 分层器："a well-crafted portfolio immediately separates the top 1% of candidates from the rest"（[aakashg.com，前 Google/Meta PM 招聘者](https://www.aakashg.com/product-manager-portfolio-examples/)）。
- 三要素：**指标驱动**（"shipped X which increased activation by Y%"）、**战略思考**（每个决策的 why）、**针对目标公司裁剪**。
- 解决方案/售前岗（SE/Solutions）的现存优秀案例都把「技术深度 × 商业结果」做成主线：[jonaddams.dev](https://jonaddams.dev/) 首屏直接给出「#1 SE on team — closed $2.1M+ ACV across 63 deals」；[shane-szarapka.com](https://shane-szarapka.com/) 用「AI chatbot + RAG 检索自己的真实履历」把网站本身做成能力演示；[zachstraley.com](https://zachstraley.com/) 主打「把复杂软件讲成买家听得懂的故事」。
- 与工程师的关键差异：**没人要求你贴代码，但所有人要求你贴判断**——为什么这个方案、放弃了什么、值多少钱。PM/方案岗用 Notion 类工具反而可接受（slategit），但一个快而克制的自建站是超预期加分。

### 4.4 一张速查表

| 维度 | 工程师（前端） | 工程师（后端/资深） | 设计师 | PM/解决方案经理 |
|------|--------------|-------------------|--------|----------------|
| 网站必要性 | 高（网站=作品） | 低-中（索引即可） | 硬门槛 | 中-高（分层器） |
| 首要内容 | 可跑的 demo + 代码 | 架构决策 + 权衡 | case study 思考过程 | 指标化的决策档案 |
| 允许的炫技度 | 高（但要能通过 Lighthouse） | 低 | 中（motion 服务叙事） | 中（演示服务论证） |
| 评估者会做什么 | 开 DevTools、clone 仓库 | 追问 trade-off | 审你站本身的 UX | 追问 why 和数字 |
| 最致命反模式 | 教程克隆 + 性能差 | 过度投入装修 | 只有截图无过程 | 只有职责无结果 |

---

## 5. 对「解决方案经理 + 汽车智能座舱 + AI」定位的具体建议

结合上面所有社区证据，针对本站（王磊：解决方案经理，领域=汽车智能座舱 × 多语种 × AI，站点已规划 TTS 座舱演示与 3D 车辆配置器两个旗舰 demo）给出可执行建议。

### 5.1 定位公式：像 PM 一样叙事，像工程师一样交付，像设计师一样克制

社区证据映射：

1. **叙事层（PM 式）**：首页与案例全部采用「问题 → 判断 → 方案 → 量化结果」结构。解决方案岗的货币是判断与数字（§4.3）：语种覆盖数、量产项目数、交付周期、成本/体验改善幅度，能公开多少写多少（脱敏规范见 `docs/website-plan/material-security-grading.md`）。像 jonaddams.dev 那样把最硬的一两个数字放进首屏副标题。
2. **交付层（工程师式）**：两个互动 demo 是「证据」而非「装饰」——这是本站相对纯 PM portfolio 的最大差异化。社区对「非工程背景做出高质量技术演示」的先例评价极高（Jesse Zhou：管理咨询 → 凭拉面店 portfolio 转型成功）。demo 的存在证明「解决方案经理 + AI」不是 PPT 词汇。
3. **克制层（设计师式）**：所有炫技必须通过 Bruno Simon 帖的「三连问」检验——加载要多久？移动端会不会碎？信息获取是否被交互绑架？

### 5.2 「专业又炫技，不变成玩具」的七条落地规则

每条都对应一个社区反模式（§2 编号）：

1. **首页秒开，demo 内页化**（反模式 1/9）：首屏保持 master-plan 的静态五区块结构，Lighthouse ≥ 95；重型演示（WebGL 配置器）放独立路由，首页只放轻量预览卡片（截图/短视频 + 「进入演示」按钮）。HN 对 Bruno Simon 的核心批评就是「整个网站被 3D 绑架」——本站不能犯。
2. **演示必须领域强相关**（反模式 15）：社区认可炫技的唯一条件是「炫的正是你卖的能力」。TTS 座舱演示炫的是「多语种座舱交付能力」，3D 配置器炫的是「对座舱 HMI/车辆数字化的理解」——两者都通过检验。**不要**加与定位无关的粒子背景、3D 头像、赛博朋克主题——那会触发「AI 味/模板脸」批评（反模式 8）。
3. **每个 demo 配「30 秒结论 + 跳过出口」**（反模式 10）：借鉴 Henry Heffernan 帖的批评，demo 页顶部先用两三句话 + 一张能力地图讲清「这个演示证明什么」，不想交互的招聘方 30 秒拿走结论；想玩的同行再往下进入交互区。加载超过 1 秒的资源必须有进度指示（反模式 14）。
4. **demo 页附「工程复盘」小节**（共识 1.9）：像 acko.net / Jesse Zhou 那样，演示旁边讲实现思路与取舍（为什么预生成 TTS 音频而不是实时调 API、为什么用 Draco 压缩、时间戳同步怎么做）。这把「玩具」升格为「带判断力的作品」，同时喂给两类读者：HR 看结论，技术评估者看深度（solid-web 的双受众原则）。
5. **量化一切可量化的**（§4.3）：案例页每个模块至少一个数字。没有商业数字时用工程数字替代：支持语种数、演示资源体积、Lighthouse 分数本身也可以是内容（「本站首页 < 200KB」就是解决方案能力的一次自证）。
6. **移动端优先验证 demo**（反模式 7）：3D 配置器在中端手机上必须可用（降级到低模/静态视角也算可用）；TTS 演示天然轻量，应做到手机体验与桌面一致。招聘方大概率在手机上第一次打开本站。
7. **保持「技术编辑部 × 工业设计」基调，用细节代替特效制造记忆点**（共识 1.6）：社区推崇的记忆点大多是低成本高品味的小细节（Brittany Chiang 的单一强调色、Eva Decker 的小键盘、Lynn Fisher 的 resize 彩蛋），而不是全屏 shader。本站可用的等价物：座舱风格的微交互（如深浅色切换做成「白天/夜间驾驶模式」）、多语种问候语轮播——小、准、和领域相关。

### 5.3 内容优先级排序（社区证据加权）

结合共识 1.1–1.3 与 §4.3，建议的内容强度排序（≠ 开发顺序）：

1. 首屏定位陈述（一句话 + 两个硬数字）——决定 10 秒去留
2. 三旗舰案例的「问题→判断→结果」文字版——PM 岗的核心货币
3. TTS 座舱演示（轻量、领域强相关、差异化最大）
4. 精选观点/Insights（证明持续思考，支撑「活的网站」信号）
5. 3D 配置器（重型炫技，价值高但必须等 1–4 稳了再上，且永远不做首页默认体验）

---

## 6. 讨论帖索引：原帖 URL + 关键 quote 摘要

### 6.1 Hacker News（一手原帖，评论经 Algolia API 抓取核实）

| 帖子 | URL | 关键 quote（原文） | 摘要 |
|------|-----|-------------------|------|
| Ask HN: What makes a great personal website?（2020-06） | https://news.ycombinator.com/item?id=23694414 | "Optimize your images… DON'T make visitors download 10-meg background images."（slater）；"think about what you want your personal site to do or demonstrate"（CM30）；"It mostly depends on who you're aiming the website at. Recruiters? Researchers?…"（0xBE5A）；"speed (I should be able to start reading in at most 0.2 seconds)"（tomjen3）；"Make it yours. Don't copy others… It's your digital personality."（Jaruzel） | 好个人网站的四要素：目的明确、受众明确、快、有自我。 |
| Ask HN: What are the best-designed personal blogs you've come across?（2022-08，89 分 39 评） | https://news.ycombinator.com/item?id=32571343 | "unless you're a designer flexing your skills… focus less on the design and more on the actual writing! The internet is littered with the emaciated husks of nice good looking sites hosting nary an entry beyond 'How I Made My New Blog With X'" | 推荐 maggieappleton.com、gwern.net、tonsky.me 等；警告「只有装修没有内容」的空壳站。 |
| Ask HN: Most beautiful personal blog UI you have ever seen? | https://news.ycombinator.com/item?id=47302553 | "S-TIER blogs are those that are animated, visual, interactive and absolutely blow your mind off"；"Tom Macwright's blog… loads insanely fast thanks to… brutalist design while still looking nice" | S 级 = 交互提升理解力（ciechanow.ski 类）；速度本身被当作美学。 |
| Bruno Simon – 3D Portfolio（热帖，700+ 评论） | https://news.ycombinator.com/item?id=46206531 | "It's an extremely-well-executed portfolio site; no more, no less."；"terrible as an actual home page. It's slow as molasses… Microsoft Bob failed for a reason."；"if you want someone to make a game on the web then this is a perfect portfolio site."；"it consumes as many or more resources than games like cyberpunk or baldur's gate 3" | 3D 炫技站的完整正反方辩论；结论=炫技只在「炫的就是你卖的」时成立。 |
| Design of This Website（gwern.net，269 分 254 评） | https://news.ycombinator.com/item?id=30928081 | "minimalist design is as little design as possible (Dieter Rams). All design elements need to serve and enhance usability."；对 krasjet.com："a perfect blend of minimalism, functionality, aesthetic, typography, accessibility, and mobile-friendly design" | 极简 ≠ 功能少；技术极简（加载性能）与视觉极简并重。 |
| Show HN: 3D Portfolio website with late 90s aesthetic（henryheffernan.com，29 分） | https://news.ycombinator.com/item?id=31313187 | "Cool, but maybe have a way to view the site without all the simulation fanfare. Make it a proper 90s site." | 应届生炫技站获好评 + 「给跳过出口」的经典建议；作者后入职 Vercel。 |

### 6.2 Reddit（原帖 URL + 经复盘文章/镜像核实的引述）

| 帖子/来源 | URL | 关键 quote | 摘要 |
|----------|-----|-----------|------|
| r/webdev 50 份 portfolio 评审总结（freeCodeCamp 发布，作者即 Reddit 评审人） | https://www.freecodecamp.org/news/i-reviewed-fifty-portfolios-on-reddit-and-this-is-what-i-learned-e5d2b43150bc/ | "before writing any styling, make sure it is accessible"；"Writing mobile-first styling tells us that you like writing the smallest amount of code needed"；"Show me the code and the live site"；"design separate portfolios for each of those audiences"；"each sentence proofread, and no broken links" | 本次调研中信息密度最高的 Reddit 一手总结：无障碍、mobile-first、证据链、受众分离、细节洁癖。 |
| r/UX_Design：一周 10+ 场 portfolio review 的第一大错误 | https://www.reddit.com/r/UX_Design/comments/1v02mz2/had_10_portfolio_review_sessions_this_week_heres/ | "Showing beautiful screens — but zero thinking process… Recruiters don't want to see what you designed. They want to see HOW you think."；评论区反例："i have been told… how the process and metrics made me appear 'too strategic'" | 过程叙事是共识，但 recruiter 与面试 panel 口味分裂 → 双层结构（先结果后过程）是解法。 |
| r/webdev roast 复盘：Reddit Roasted My Portfolio（Hashnode，含 roast 原话） | https://lakshayoberoi.hashnode.dev/i-shared-my-portfolio-on-reddit-and-got-roasted-here-s-what-i-changed | "The intro animation is 4+ seconds. I closed it before it finished."；"I still don't know what you do after looking at this for 30 seconds"；"Your projects list tech but show no real outcomes"；"Who is this portfolio for?… Pick one." | 一个 React+Three.js+GSAP 重装修站被 r/webdev 集体指出的四宗罪：慢、失焦、无结果、无受众。 |
| Reddit：portfolio 信息流/结构讨论（教学设计岗，镜像抓取） | https://www.reddit.com/comments/1v23x0s/ | "Less is more. Get them looking at your stuff asap. Hiring managers want to be able to get in and out, less fluff."；"wouldn't recommend a straight scroll or a course… I do categories so they can select what is most relevant" | 结构共识：尽快见货、分类导航优于强制线性叙事。 |

### 6.3 V2EX / 中文社区

| 帖子 | URL | 关键观点 | 摘要 |
|------|-----|---------|------|
| 我也来分享下个人网站 | https://www.v2ex.com/t/1039465 | 前端工程师用 Nuxt3+TS+Tailwind+Sanity 建站，「日后找工作可以作为一个 portfolio」；评论区连锁晒站 | 中文社区个人站文化样本：晒站帖是「日经帖」，长期维护被视为美德。 |
| 问程序员要作品集合理吗？ | https://www.v2ex.com/t/789391 | 「问前端程序员要作品集貌似问题不大。问传统行业（多数是内部项目）要作品集就不太合理」；「设计师出效果图，文案出稿件，程序员……做出来一个 demo 来的实在」 | 与英文社区 §4.1 完全同构：作品集必要性因岗位而异；demo 是最硬的能力证明。 |
| 做程序员最重要的还是一定要有自己的作品 | https://www.v2ex.com/t/564913 | 引阮一峰「可扩展性」论；反方：「公司项目讲不出东西的人，我不会再花时间问你业余做的事情」「腾讯 T4、阿里 P9 说的都是亿级月活……谁会拿个人作品说话」 | 个人作品是 60→100 分的加分项，不是 0→60 分的基本盘；本职工作叙事优先。 |
| 我花费 2 小时 Vibe coding 出的个人作品展示页面 | https://www.v2ex.com/t/1218922 | 高赞批评：「AI 味比较重」「满满的 AI 味」；理性派：「个人主页能够清晰明了地传达信息就可以了」「网站一般，但里面的 APP 作品强得可怕！」 | AI 时代新反模式「AI 味模板脸」的中文一手证据；同时印证「作品硬则网站可平」。 |
| 《当代码不再稀缺：程序员真正稀缺的是判断力》 | https://www.v2ex.com/t/1227624 | 「纯『写代码』被替代了，验证能力才是新护城河」「不能被 prompt 的判断、品味、架构直觉」 | AI 时代个人站的价值锚点从「会做」转向「判断力展示」——对解决方案岗尤其有利。 |

### 6.4 Dev.to / 行业指南（职业差异与招聘方视角补充）

| 文章 | URL | 核心论点 |
|------|-----|---------|
| Stop Building Developer Portfolios Like Designer Portfolios | https://dev.to/brianyoung/stop-building-developer-portfolios-like-designer-portfolios-2nij | 「最好的开发者 portfolio 不是前 5 秒惊艳，而是理解工作内容后令人佩服」；portfolio = 证据与上下文，验证靠技术对谈。 |
| Stop Over-Engineering Your Personal Website | https://dev.to/ismail_hossain/stop-over-engineering-your-personal-website-do-this-instead-2njj | 「如果你的技能不是『做个人网站』，网站就是基础设施，不是产出——boring, reliable, done.」 |
| How to Build a Standout Portfolio in Tech (2025) | https://dev.to/dareyio/how-to-build-a-standout-portfolio-in-tech-that-attracts-recruiters-in-2025-2p07 | 2025 语境：portfolio 需同时服务人类 recruiter 与 AI 筛选器；影响力叙事取代项目罗列。 |
| Personal Website and Portfolio for Engineers: When to Build One, When to Skip | https://www.techinterview.org/post/3233474627/personal-website-portfolio-engineers/ | 岗位差异的最系统论述：前端受益大、后端低回报；「4–8 小时做完，超过 40 小时就是过度工程」（前端例外）。 |
| Senior Developer Portfolio: Less Code, More Impact | https://showproof.io/guides/senior-developer-portfolio/ | 资深岗读者是 CTO/VP：「They are not impressed by commit volume. They are looking for evidence of judgment.」 |
| Frontend Developer Portfolio: What to Show in 2026 | https://showproof.io/guides/frontend-developer-portfolio/ | 招聘方会跑 Lighthouse / 开 DevTools；移动端碎裂 = 最坏信号。 |
| Product Manager Portfolio Examples That Win FAANG+ Offers | https://www.aakashg.com/product-manager-portfolio-examples/ | PM portfolio 三要素：指标驱动、战略 why、按公司裁剪；「your portfolio is the most critical product you will ever ship」。 |
| Developer Portfolios That Get Interviews: A Hiring Manager's Take | https://solid-web.com/developer-portfolio-gets-interviews/ | 双受众模型：页面说服 HR（可扫读、有数字），仓库说服工程师（README、commit、trade-off）。 |
| Own Your Web Issue 15: Home Sweet Home | https://newsletter.ownyourweb.site/archive/issue-15/ | 「被记住的是有性格和观点的网站」；Eva Decker 站的 playful details 案例。 |

### 6.5 解决方案/售前岗现存样本（用于 §5 对标）

| 网站 | URL | 可借鉴点 |
|------|-----|---------|
| Jon Addams（Senior Presales SE） | https://jonaddams.dev/ | 首屏即硬数字（$2.1M ACV / 63 deals）；「写产品级代码的 SE」双重身份叙事。 |
| Shane Szarapka（Solutions Engineer） | https://shane-szarapka.com/ | 网站内嵌 RAG chatbot 回答关于本人的问题——网站本身即 AI 能力演示。 |
| Zach Straley（SE + Demo Producer） | https://zachstraley.com/ | 「把复杂软件讲成买家故事」的定位陈述写法。 |
| Dwayne Dreakford（SE portfolio 仓库） | https://github.com/ddreakford/sales-engineering-portfolio | 每个技术项目都回答三问：是否促进销售对话/缩短周期/提高赢单率。 |

---

## 附：本调研对 master-plan 的三点校验结论

1. **性能门槛（7.5 节 Lighthouse ≥ 95、首页 < 200KB）**：与社区共识完全一致，且可以反向用作内容素材（自证解决方案能力）。
2. **首页五区块（第 3 章）**：结构符合「10 秒定位 + 案例优先 + 活网站信号（Now 模块）」三大共识；建议区块 1 的 Hero 文案吸收 §5.3 的「一句话 + 两个硬数字」写法。
3. **两个旗舰 demo**：方向正确（领域强相关的炫技是社区唯一认可的炫技），但落地时必须执行 §5.2 的七条规则——尤其是「demo 内页化 + 30 秒结论 + 跳过出口 + 加载指示」，避免重蹈 Bruno Simon 帖中被批评的覆辙。
