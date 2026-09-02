# N1-SHOWCASE｜业界「炫技型 AI Agent 展示」调研

日期：2026-09-02  
范围：产品落地页 / 开源回放器 / 非工程师个人站  
约束：GitHub Pages 纯静态、零后端、默认零 key；Agent Nexus 楼色 `#a855f7`；动画必须挂真实数据。  
上一轮脑暴已警告：展厅禁止假装实时集群（`docs/research/cc-halls-brainstorm-2026-09-02/lane-tech-grok-4.6.md`）。本调研认同并把它当成硬门。

---

## §1 案例表（22 条）

形态缩写：录制回放 / 脚本化产品 UI / 交互沙盒 / 静态图文。  
「静态可复刻」= 在 GitHub Pages、无服务端密钥前提下，能否做出**同一种哇感**（不是像素复刻产品）。

| # | 名称 | URL | 形态 | 炫在哪（一句） | 技术栈猜测 | 静态可复刻 | 对我们的启发 |
|---|---|---|---|---|---|---|---|
| 1 | Cursor 官网 | https://cursor.com/ | 脚本化产品 UI | 首屏不是宣传片，是一台正在干活的 IDE：并行任务、CLI、Slack、云端 Agent 产出「走查录像」同屏出现 | Next.js + 预录交互时间线 + 视频/截图资产 | 中 | **产品壳本身就是 demo**。可做「指挥台 UI 壳」，但数据必须是我们的真实 receipt，不能编 Acme Dashboard |
| 2 | Claude Code 产品页 | https://claude.com/product/claude-code | 脚本化产品 UI | 左：用户任务；中：逐文件 diff 逐字出现；右：localhost 预览真的跟着变 | 预编排时间线 + 代码高亮 + 假浏览器框 | 中 | 10 秒内必须同时看到「指令 / 过程 / 产物」三栏。我们的三栏应是「派单 / 子代理泳道 / 门禁灯」 |
| 3 | Manus 可分享回放 | https://manus.im/ 及 `?replay=1` 分享链（例：https://manus.im/share/lp8kaZ7rxAz96YWF8s71D6?replay=1） | 录制回放 | Agent 有自己的电脑：浏览器点击、文件、部署链接都能事后整段回放 | 云端会话录像 + 分享页播放器 | 中（播放器高，云端电脑低） | **wow 来自「全过程可审计」**，不是来自口号。我们没有云电脑，但有 JSONL / receipt / e2e JSON，足够做「全过程」 |
| 4 | Warp Factories | https://www.warp.dev/ | 脚本化产品 UI + 静态图文 | `factory.yaml` 当代码、eval 表当成绩单、Agent 自己截图/录像当验收 | 终端美学落地页 + 代码块动画 + 质量环数字 | 高（形态） | **「证明干活」比「假装在干活」更炫**。质量环（pass/fail/cost）可直接映射五维硬门 |
| 5 | Bolt | https://bolt.new/ | 交互沙盒 | 首页就是输入框：一句话生成可点的站 | WebContainers / 云沙盒 + 聊天 | 低 | 交互沙盒是他们的产品，不是我们的身份。可借「首屏就能动手」，但动手对象应是回放/案卷，不是生成新站 |
| 6 | v0 | https://v0.app/ | 交互沙盒 | 对话左侧、实时预览右侧，PM 也能交出可点原型 | Vercel 预览 + 生成代码 | 低（真生成）/ 中（嵌一份我们已有 Lab demo） | 右侧预览可复用站内已有 Lab（TTS 座舱、3D 配置器），不要再造一个生成器 |
| 7 | Lovable | https://lovable.dev/ | 交互沙盒 | 与 Bolt 同族：聊天即产品 | 云端生成 + 预览（本次首页被 Cloudflare 拦，视觉细节待核） | 低 | 反面教材：首屏「你想做什么」会把访客送进 vibe-coding 产品，偏离「解决方案经理」 |
| 8 | Replit Agent | https://replit.com/ 文档 https://docs.replit.com/features/agent/overview | 交互沙盒 | Agent 在同一环境里写、跑、测、发；自测抓「波将金界面」 | 云 IDE + 浏览器自测 | 低 | 「能跑」才算展示。静态站应用 **预置可点产物**（已 build 的 Lab / 证据 JSON），不要假装正在 compile |
| 9 | Devin / Cognition | 公司 https://cognition.com/ ；产品 https://devin.ai/（本次被 Vercel 人机验证挡住） | 录制回放（历史主形态） | 虚拟桌面里自己开浏览器、写测试、交 PR——「软件工程师在工作」 | 云桌面录像 | 低 | 虚拟桌面不可静态复刻。可复刻的是 **「产物走查」**：Cursor 云端 Agent 的 dashboard walkthrough 比 Devin 桌面更接近我们 |
| 10 | LangSmith Observability | https://www.langchain.com/langsmith | 静态图文 + 登录后真 trace | 把 Agent 内部嵌套调用画成可点的树：延迟、费用、失败一目了然 | SaaS trace UI（OTel） | 中（UI 形态高，SaaS 低） | 树/瀑布是工程师 wow。我们对外应降维成 **角色泳道**（父/子/审计/董事会），不要抄 LangChain 节点名 |
| 11 | LangGraph Studio | https://docs.langchain.com/oss/javascript/langchain/studio 及 https://www.langchain.com/blog/langgraph-studio-the-first-agent-ide | 交互沙盒（需本地 Agent） | 图在跑、状态在变、可从任意 checkpoint 分叉 | 连本地 runtime 的可视化 IDE | 低（真连）/ 高（预烘焙图回放） | 预烘焙一张「提分 Loop 拓扑图」，节点用真实 campaign 着色，点击出 receipt |
| 12 | OpenAI Agents SDK / 追踪 | https://developers.openai.com/api/docs/guides/agents | 文档 + 平台 trace | 编排、handoff、guardrail、人审暂停被写成一等公民 | SDK + 平台 tracing | 中 | 我们已有「董事会触发式终裁」——这就是 guardrail/human review。展示时点名 **谁有权 NO_GO**，比画流程图更像解决方案 |
| 13 | Open Agent View | https://open-agent-view.github.io/ | 录制回放 | 落地页用 **真实 asciinema/tmux 录像**，不是合成 UI；15 个 harness 一个仪表盘 | 静态站 + 终端录像播放器 | **高** | 最接近我们技术栈的 wow：**真终端录像嵌进静态页**。适合做「今天刚跑完的三路派单」入口 |
| 14 | vibe-replay | 产品 https://vibe-replay.com/ 源 https://github.com/tuo-lei/vibe-replay 实例子 https://vibe-replay.com/view/?gist=c40137e4c224dc883fe2eaa668e2d8ba | 录制回放 | 把 Claude/Cursor/Codex/Hermes 会话变成可分享的单文件 HTML：prompt、thinking、工具、diff | 本地 JSONL → 自包含 HTML | **高** | 单文件回放可直接丢进 GitHub Pages。必须先脱敏。身份风险：看起来像「我会 vibe coding」，要用旁注强调 **编排/门禁** 而不是敲代码 |
| 15 | Traceboard | 源 https://github.com/Zijian-Ni/traceboard 演示 https://zijian-ni.github.io/traceboard/ | 交互沙盒（纯前端） | 「Agent 轨迹的 VLC」：拖 JSONL 即播，泳道、过滤器、URL 即分享、零后端 | Vite SPA + canvas 泳道 + lz-string 分享 | **高** | **本楼首选形态参考**。把 `cc-loop-*` / 派单 JSONL 转成泳道；失败事件默认高亮 |
| 16 | Agent Replay | 源 https://github.com/shusingh/agent-replay 演示 https://agent-replay.onrender.com | 交互沙盒 | Chrome Performance 面板 × 视频时间轴：5 万 span / 60fps，可 scrub token | Canvas 瀑布 + Worker 解析 | 中（工程量大） | 学交互：播放头、倍速、双 run diff。不要上 5 万 span——我们的 wow 在 **决策点**，不在 span 数量 |
| 17 | PAIR agent-trace-vis | 源 https://github.com/PAIR-code/agent-trace-vis 演示 https://agent-trace-vis.netlify.app/#/agentic-traces | 交互沙盒 | 多列时间线对齐 user / thinking / tool / observation | Angular + OpenTraces JSON | 高 | 列对齐适合讲「父代理指令 vs 子代理动作 vs 审计意见」三条并行带 |
| 18 | AgentPrism | 演示 https://agent-prism.evilmartians.io/ 库 https://github.com/evilmartians/agent-prism | 交互沙盒 | 把 OTel span 树变成可展开的执行树 | React 组件库 | 中 | 可借鉴树 UI，但对外文案不要 `ChatCompletion` / `RunnableSequence`——访客是人，不是 LangChain |
| 19 | asciinema | https://asciinema.org/ | 录制回放 | 终端是文本不是视频：可暂停复制、体积小、可嵌入 | `.cast` + JS player | **高** | 最低成本 wow。配 `prefers-reduced-motion` 就显示终态 transcript。Open Agent View 已证明这套在静态站成立 |
| 20 | Design in Product / Piper Morgan | https://designinproduct.com/projects/ 及 https://pipermorgan.ai | 静态图文 + 可点产物 | PM 不展示简历，展示 **自己每天开着的多智能体工具** + 280+ 篇公开建造日志 | 案例网格 + 真项目链接 | 高 | **叙事级标杆**：能力 = 我在生产里跑的系统，不是我用过的模型名。数字（57 模块 / 6300 测试 / 63 ADR）要能点进去 |
| 21 | Linus Lee / thesephist | https://thesephist.com/ | 静态图文 + 研究原型 | 研究笔记 + 100+ 可点原型，接口实验本身就是作品 | 自研小站 + 文章 | 高 | 气质对：编辑部、可点、不营销。我们缺的是「一篇讲编排纪律的视觉论文」，不是再做一个聊天框 |
| 22 | Heron AI（Awwwards 提名） | 站点 https://heronaiapp.com/ 提名页 https://www.awwwards.com/sites/heron-ai | 营销动效站 | 建筑级滚动叙事、预加载、Canvas；Agent 嵌在设计工具里 | Webflow + GSAP + Canvas | 中（动效）/ 低（作为身份） | 视觉可以学「暗底单色、滚动章节」。**不要学成 Awwwards 作品集**——那是代理商气质，和「技术编辑部」冲突 |

补充（未进主表，作对照）：

- Epiminds Lucy 3D 站（https://www.awwwards.com/sites/epiminds-ai）：3D 虚拟人聊天。wow 廉价，且与座舱 TTS 楼抢戏。
- AXIOM 概念界面（https://www.awwwards.com/sites/axiom-concept-ai-interface）：氛围片，无证据。
- OpenAI Codex 营销页本次抓取为空（https://openai.com/codex/），以 Agents SDK 文档为准。

---

## §2 「哇」从哪来（7 种机制）

每种机制给 2 个已访问例。对我们：只保留能挂上真实素材的机制。

### 1. 三栏同时动：指令 / 过程 / 产物

访客不用读文案，10 秒内看见「有人在做事，并且做出了东西」。

- Claude Code 产品页：任务 → diff → localhost 预览。
- Cursor 云端 Agent 段：任务列表 + 工作摘要 + 「Here's a walkthrough of the dashboard」录像。

我们的映射：左派单原文（可脱敏）、中泳道、右门禁灯 + 证据摘录。

### 2. 全过程可回放（比实时更可信）

「现在正在跑」在静态站几乎一定是假的。**能拖进度条的过去**反而更真。

- Manus `?replay=1` 分享页。
- vibe-replay 单文件 HTML / Open Agent View 的真实终端录像。

我们的映射：一段真实提分 Loop 或今日三路派单，做成可 scrub 的时间轴；默认 8–12× 倍速，关键决策点自动减速。

### 3. 并行可见（多线程不是口号）

单聊天泡泡 = 聊天机器人。多泳道同时亮 = 编排。

- Cursor 首页「In Progress 2 / Ready for Review 3」+ 多 Agent 列表。
- Traceboard 按 agent 分泳道；Claude Code 博文写过数十到上百并行 subagent（https://claude.com/blog/introducing-dynamic-workflows-in-claude-code）。

我们的映射：父代理一行、实现/审计分行、董事会只在触发时出现。并行是 **视觉事实**，不是「多智能体」四个字。

### 4. 失败是一等公民

全绿时间线像广告。红灯 + 纠偏才像工程。

- Warp 质量环：pass / fail / cost 并排，observer agent 会对 factory 配置提 PR。
- LangSmith：错误、延迟、轨迹监控是产品核心，不是附录。

我们的映射：硬门里必须有一次 **真实 NO_GO**（e2e 红、LHCI 降、identity_ok 失败、视觉 |Δ|>5）。点进去是 receipt，不是「我们也会失败哦」的文案。

### 5. 产物即证据（截图 / 哈希 / 门禁，不是形容词）

- Warp：「agents prove their work with computer use」——修完销售页自己截图。
- Cursor 云端 Agent：处理屏幕录像后给出 walkthrough。

我们的映射：SHA256SUMS、e2e JSON、LHCI 四项、served_model / identity_ok。数字可点、可复制、可对照看板单源。

### 6. 终端是合法的舞台（文本回放 > 模糊视频）

- asciinema：可复制的终端。
- Open Agent View：安装过程、harness 选择都是真录像。

我们的映射：指挥官 CLI / 派单日志用 `.cast` 或 JSONL 播放；`prefers-reduced-motion` 下给终态日志。不要 MP4 录屏当主 wow（糊、不可搜、体积炸 LHCI）。

### 7. 身份是「我在生产里跑的系统」，不是「我用过 ChatGPT」

- Design in Product：Piper Morgan 是每天在用的 PM 多智能体，附测试数和 ADR。
- thesephist：原型可点，文章讲表示法与协作，不讲 10x。

我们的映射：卖点写死为「把复杂技术变成可决策、可交付、可复用的编排」。模型名单只作为席位层，不上首屏。

---

## §3 面向 Agent Nexus 的 3 个方向草案

共同前提：纯静态；默认零 key；动画挂真实数据；紫霓虹、编辑部气质；移动端可看；减动效有终态。

推荐组合：**方向 A 做首屏 wow，方向 B 做身份与 30 秒理解，方向 C 做可深挖的一层。** 不要三套各做一页。

### 方向 A｜指挥塔回放（Command Tower Replay）⭐ 默认推荐

**一句话概念**：把一段真实的多智能体工程战役，做成可拖动的角色泳道——父代理编排、子代理实现/审计、董事会偶发终裁。红灯比绿灯更亮。

**首屏 10 秒看到什么**

1. 暗底紫线，四条泳道几乎同时点亮（指挥官 / 实现 / 审计 / 门禁）。
2. 一条审计带变红，浮出词：`NO_GO · e2e 52/52 未过`（或真实那次失败的门名）。
3. 右上角一枚身份章：`identity_ok=true` 或一次真实 fallback。访客还没读正文，已经看见「这不是聊天」。

**30 秒交互路径**

1. 自动播放 8× → 撞红灯自动 1×。
2. 点击红事件 → 右侧抽出 receipt 片段（SHA、失败数、缺失维）。
3. 点击指挥官下一拍 → 看见「定向补洞」而不是重来。
4. 拖到收口 → 五维灯全绿或诚实的「性能维未登记 —」。

**需要哪些真实素材（已有，勿编）**

- `docs/research/cyber-city-score-loop-orchestration.md` 看板
- `cc-loop-*` / `loop*-audit.md` + `cc-*-evidence/`（run-receipt、SHA256SUMS、e2e JSON）
- `AGENTS.md` §4 角色与硬门
- 今日实例：`~/.codex/state/cc-buildings-brainstorm/`（prompts / out / logs）——进站前必须脱敏

**静态可行性**：高。JSONL/JSON → 前端播放器（Traceboard / PAIR 时间线思路）。体积走 Lab M 档（≤300KB gzip JS）或 `/world/` 豁免；数据文件按需 fetch。无后端。

**风险**

- 做成「运维大屏随机跳数字」= 上一轮已否决的假集群。
- 术语过工程师（span、token、Runnable）→ PM 访客 10 秒离开。泳道名用中文角色。
- 证据脱敏不够 → 密钥/路径泄漏。分享默认 redact。

### 方向 B｜战役案卷（Decision Docket）

**一句话概念**：访客不是围观码农，而是来审一份战役档案。一页一个真实战役：问题 → 派单 → 硬门 → NO_GO → 纠偏 → 登记分。

**首屏 10 秒看到什么**

一张案卷封面：战役名、起止、北极星 98/98/90/85 vs 登记分、五枚门灯（一红四绿或按真相）。副标题一句人话：「两周、200+ PR、父代理不写业务代码。」

**30 秒交互路径**

1. 点红灯门 → 展开失败证据（不是段落，是 JSON 里抠出的 8–12 行）。
2. 点「董事会」→ 只在触发条件满足时出现，强调终裁书面优先。
3. 点「下一战役」→ 同一壳换数据，证明这是系统不是单次表演。

**需要哪些真实素材**

- 同 A，外加站内 AI Lab 文章《双代理并行 Spike》《16 语种语料流水线》做「这套编排产出过什么」的出口。
- 看板登记矩阵必须与指挥官最新口径一致，禁止手写第二份分数。

**静态可行性**：高。MDX + 少量交互。LHCI 正文页 ≥95 更容易过。wow 弱于 A，理解强于 A。

**风险**

- 做成普通作品集/博客。必须保留至少一处 **时间轴或门灯交互**，否则 10 秒不哇。
- 分数口径漂移（声称层 vs 看板单源）。数字只从看板渲染。

### 方向 C｜会话录像 × 产物对照（Replay × Artifact）

**一句话概念**：左屏真会话（终端或 vibe-replay），右屏同一时刻长出来的产物（PR、截图、identity receipt）。学 Cursor「walkthrough」和 Warp「截图自证」，但素材是我们的派单。

**首屏 10 秒看到什么**

终端在打字（asciinema），右侧一张证据卡同步出现：`served_model`、`identity_ok`、输出路径。访客立刻懂：左边是过程，右边是可核对的结果。

**30 秒交互路径**

1. 播放到某次席位校验失败 / fallback。
2. 右侧卡变红，展示「requested vs actual」——这是通道认知，不是模型广告。
3. 点「打开产物」→ 跳到已脱敏的 out/ 摘要或 Lab 页。

**需要哪些真实素材**

- 今日三路派单 logs（最鲜）
- 任一 `identity_ok` 失败或诚实 UNAVAILABLE 记录（比全绿更有鉴别力）
- 可选：vibe-replay 从 Claude/Codex/Grok 会话生成的单 HTML（需 redact）

**静态可行性**：高（`.cast` + 时间戳对齐的证据 JSON）。vibe-replay HTML 可能偏大，需量体积后再决定是否进主路径。

**风险**

- 身份滑向「看我怎么用 Cursor」。右栏必须永远是 **门禁/产物/角色**，不是代码审美。
- 录像含内部路径、token、同事名。没有 redact 门 = 不能上。

### 三方向怎么叠（建议，非开工）

| 秒 | 访客动作 | 用哪一层 |
|---|---|---|
| 0–10 | 进楼，自动播 A 的压缩战役 | A |
| 10–30 | 点红灯，读 B 的案卷摘要 | B |
| 30+ | 「看当时终端」才打开 C | C |

C 不做首屏循环播放（动效与体积都伤门禁）。A 的减动效降级 = B 的静态案卷。

---

## §4 反面清单（会显得廉价 / 营销 / 过时）

1. **假实时集群**：随机闪的节点、伪造 QPS、WebGL ops 大屏。上一轮 TECH 已否；看起来忙，经不起点。
2. **首屏大输入框「描述你想做的」**：那是 Bolt/v0/Lovable 的产品，不是解决方案经理的作品站。访客会以为这是又一个生成器。
3. **3D AI 虚拟人 / 会说话的机器人头**：Epiminds Lucy 一类。和 Voice Pod 抢戏，且 2023–2024 营销站已滥。
4. **Awwwards 滚动史诗无证据**：预加载 4 秒、GSAP 章节、无一个可核对数字。Heron 的工艺可学，作为**本楼的主体**会像代理商 demo。
5. **「10x / AGI / 你的 AI 同事」文案**：Cursor/Manus 可以，个人站一写就假。改成可点的门、可点的 NO_GO。
6. **ChatGPT 聊天气泡当整页**：单线程对话 = 助手，不是编排。至少两条并行带，否则视觉上就是 chatbot。
7. **MP4 全屏录屏当主展示**：糊、不能搜、不能复制、体积打 LHCI。终端用 asciinema，UI 用脚本化时间线或 JSON 播放器。
8. **模型 logo 墙当能力**：Gemini/Grok/Kimi 并列不等于能力。席位可以进 C 的 identity 卡，不要进首屏品牌带。
9. **全绿无失败**：比不过 Warp 质量环和 LangSmith 错误视图。全绿 = 广告。
10. **把 Lab 生成器（TTS、配置器）塞进本楼当主 wow**：那是别的楼的产品线。本楼只链出去，不抢。
11. **未脱敏的真实会话**：看起来最真，事故也最大。没有 redact 就没有 C。
12. **「BYO key 现场跑 Agent」当默认路径**：静态约束允许可选 BYO key，但默认必须零 key 可玩。否则手机访客首屏是死表单。

---

## 收束（给后续开工用，不是方案拍板）

业界真正让人哇的，已经从「会聊天」变成「能回放、能并行、能失败、能举证」。  
我们手里的提分 Loop 编排史，比多数个人站的虚构 demo 更接近 LangSmith × Warp × Traceboard 的交集。

**不要做**：直播假集群、生成器输入框、3D 吉祥物。  
**要做**：一段真战役的泳道回放 + 可点的 NO_GO 案卷；终端录像只作深挖。

静态可复刻度最高、且与主人身份对齐的参考，按优先级：

1. Traceboard / PAIR 时间线（形态）
2. Open Agent View / asciinema / vibe-replay（真过程）
3. Warp 质量环 + Design in Product 案卷（身份与失败）
4. Claude Code / Cursor 三栏（信息架构，不抄皮肤）
