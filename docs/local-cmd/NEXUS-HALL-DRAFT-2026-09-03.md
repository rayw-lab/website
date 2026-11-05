---
title: website · 第二栋楼「Agent Nexus」墨迹厅 Ink Ledger · 实施草案（NEXUS-HALL-DRAFT）
type: charter-draft
status: draft-for-leige
date: 2026-09-03
owner: 磊哥（董事会代理 = Grok 4.6 xhigh 常态一路，重大决策才咨询）
executor: Cursor 父代理（只编排 + 复审，不写业务代码）
parent: docs/research/agent-nexus-research-2026-09-02/（N1–N4）· docs/research/cc-halls-brainstorm-2026-09-02/ · ABOUT-HALL-CHARTER-2026-09-02.md（席位/写根/门形态母版）
---

# 0. 一页纸

**远期目标**：赛博城市第二栋楼 `agent-nexus`（紫 `#a855f7`，北城 AI 中枢区）变成一页**用水墨物理承载真实 agent 会话数据**的经验分享厅。访客 10 秒"哇"（一滴墨分三路），30 秒读懂"这是一个人与多智能体共事一百天的真实台账，不是聊天窗口"，3 分钟读完五篇题跋（harness / skill 管控 / subagent 与 tmux / 模型评测 / 心得技巧）。验收只认 Live 最终消费者（真浏览器 + fresh 批评者），不认 build 绿。

**已拍板（磊哥 2026-09-03）**：

| 项 | 决定 |
|---|---|
| 视觉基调 | **A · 暖白宣纸 + 紫墨**（墨的吸收谱向楼色 `#a855f7` 倾斜：淡处泛紫、浓处趋黑）。全站唯一亮底页面，进楼反差即记忆点 |
| 首屏 | **S0 洇**（一次真实派单 → 三道晕按 receipt 时长分离）开门；**S1 墨流**（一百天会话的 suminagashi 指纹）第二站 |
| 内容载体 | 手卷 + 五篇题跋：① harness 认知 ② skill 管控认知（co-agent） ③ subagent / agent team / tmux 认知 ④ 模型评测与认知 ⑤ 心得小技巧 |
| 数据范围 | 跟随五跋主题：只纳入与五跋相关的项目/派单目录（白名单见 §3.2），跨 Codex / Claude Code / Cursor / Grok / agy / api_direct 全席位；客户项目一律不进 |
| 试墨区 | **要**。访客可画；指挥官区域是干纸拒墨；「定」按钮演示合入 |

**核心立论（为什么是水墨不是流体）**：2026 年霓虹流体光标已是作品集标配（Codrops 2026-03 Arnaud Rocca、giats.me、manus-portfolio、Blackbook.dk SOTD 2026-07），正是 N1 反面清单第 4 条"Awwwards 滚动史诗"。水墨引擎的底层**就是**流体（Stam 速度场），但多了"纸的湿度当权限系统 + Beer–Lambert 显示层"，与本仓编排纪律一一同构（§1.3）。技术样本 inkwash（单 HTML < 1000 行、零依赖、WebGL2、12 pass、手机 60fps）证明预算可达；且 inkwash 本身是作者用 Claude Fable 5 对话造出的——**用 agent 造的水墨引擎画 agent 自己的一百天**，是本厅元叙事。

**理念**：功能为主；墨只画数据，印是唯一装饰；零装饰性国风符号（无山、无竹、无鹤、无毛笔光标）；失败是一等公民（NO_GO 用白墨真擦除）；默认零 key、零后端、零实时假装；worker 自报不算，宿主回读才算；**每一条经验必须溯源到一个真实文件**（rule / receipt / ADR / log），未知就不写。

**写根**：分支 `codex/nexus-hall-20260903` 从 `main` 切出，独立 worktree `/Users/wanglei/studio-data-root/worktrees/website-nexus-hall`；about-hall 分支合入 `main` 前，本楼先在 about-hall 分支之上 rebase 取壳（`WorldHallLayout` / `HallChrome` / `[slug].astro` / `world-halls.json`），合流顺序由董事会拍。数据原盘（会话 JSONL、receipt）**永不入库**；进仓只放 reducer 产出的 `ink-ledger.json` 与海报 WebP。

# 0.5 与既有调研的继承 / 改写 / 丢弃

| 来源 | adopt | adapt | drop |
|---|---|---|---|
| N1 showcase | 7 种哇机制里的 ②全过程可回放 ③并行可见 ④失败一等公民 ⑤产物即证据 ⑦身份是"我在生产里跑的系统"；反面清单 12 条全收 | 方向 A「指挥塔回放」的泳道 → 改成**墨的洇散**（同一数据，不同皮肤）；方向 B「案卷」→ 题跋 | 方向 C 会话录像不进首屏，只作题跋"背面" |
| N2 webide | 不做 IDE / Monaco / WebContainers / Pyodide；Hall-S ≤50KB；`/world/agent-nexus/` 不进 Lab manifest；trace schema v1（`kind: session/agent/llm/tool/gate`、`identityOk` 三态、`null` 不填 `true`）；转换器确定性、禁 LLM 改时间戳 | schema 加 `kind: session` 的会话聚合字段与 `ink` 渲染提示字段（§3.1） | xterm / asciinema 第一刀不做 |
| N3 assets | 真实素材清单口径（213+ PR / 20 波次 / e2e 48→86 / 多次 NO_GO） | 数字只从看板单源渲染 | — |
| N4 narrative | 三类受众；8 条炫技不失信军规；「展示治理比展示代码贵」 | tagline 重写为墨迹口径（§1.1） | ROI 金额 / 62→88 / "12 次死锁"等未溯源数字**禁止上页** |
| ABOUT-HALL charter / TECH-ARCH | 席位表、派单纪律、写根与 Git、机器门 + 人门双轨、G-Hall 零 world chunk、禁 wheel+preventDefault、reduced-motion 终态、`data-bind` 机器校验 | 尺子权重按本楼改（§1.6）；媒体预算改为 JS/数据预算（本楼**零视频**） | 视频 scrub 播放器不复用（本楼是 canvas） |

# 1. 体验设计

## 1.1 楼名、厅名、tagline

- 楼：`agent-nexus`「主智能体中枢 / Agent Nexus」（buildings JSON 不改名）。
- 厅：**「墨迹 · Ink Ledger」**——"迹"= 墨迹 = agent trace；Ledger 呼应本仓台账/登记文化。
- tagline 候选（磊哥挑一或改）：
  1. 「会话即笔迹，收据即印。一个人与多智能体共事的一百天。」
  2. 「不写算法，只定交规——墨落在哪、干在哪、定在哪。」
  3. 「两千一百次会话，一张墨流纸。」（数字由 ledger 渲染，不手写）

## 1.2 站序与秒表（桌面；移动端见 §1.5）

| 站 | 秒 | 访客看到 | 数据来源 | 交互 |
|---|---|---|---|---|
| **进楼** | 0–0.6 | 暗底 + 楼色紫线（承接城市），手卷自左向右展开成暖白纸 | — | 无（RM：直接落纸） |
| **S0 洇** | 0.6–10 | 一滴紫黑墨落在湿纸中央，分离成三道晕，按真实 receipt 时长比例扩散（8× 压缩，撞收口自动减速到 1×）；每道晕干住那一刻落一枚印：`identity_ok=true` 朱文 / `null` 灰印（"该通道无机器收据"） | `cc-buildings-brainstorm` 三路派单：vis 247s / tech 763s / content 2140s（N2 §5.3 实测）；后续可换任一派单 | 点晕 → 右侧抽出 receipt 片段（served_model / identity_match / exit_code / 产物路径 + bytes）；拖 scrubber |
| **S1 墨流** | 10–40 | 过去 ~100 天的 suminagashi：每滴 = 一次会话，按时间落下；半径 ∝ log(tokens 或时长)；墨色按席位取「墨分五色」（§1.3）；环纹被后来的滴推薄——这张纸是磊哥这一百天的真实指纹 | `ink-ledger.json` sessions（Codex / Claude Code / Cursor / Grok / agy / api_direct，白名单项目） | 拖月份轴；悬停/点一环 → 会话卡（日期、席位、时长、轮数、是否 compacted / aborted、项目标签） |
| **S2–S6 题跋 ×5** | 40–180 | 手卷向右续展；每跋 = 题 / 文 / 迹 / 印 / 背面（§2 结构）；跋与跋之间用对应墨法过渡（§1.3） | 五跋各自素材（§2） | 点印 → receipt / rule 摘录抽屉；点"背面" → 深挖链接 |
| **S7 试墨** | 自由 | 一块留白纸：访客可用指/鼠画；纸上标出"指挥官区"为干纸，墨到边界即止；「定」按钮把访客的墨沉入纸，再画不动；「清」重来 | 无数据（唯一非数据驱动区，故放最后且尺寸受限 ≤ 40vh） | 画 / 定 / 清；不提供保存 PNG |
| **S8 收官** | — | 一句收束 + 四出口（`/ai-lab/` 文章、`/lab/` demo、`/about/`、回城 `/?poi=agent-nexus`）+ 讲者简介一键复制（复用 about 组件） | `site.ts` | — |

**10 秒脚本**：墨落 → 三晕分离 → 第一枚印落下时标题浮现「墨迹 · Ink Ledger」。
**30 秒脚本**：S1 墨流铺满，左上角数字由 ledger 渲染："N 次会话 · M 个席位 · 自 2026-06"。旁白（静态字）："默认零 key。每一滴都是一次真实会话的元数据，不含任何提示词正文。"
**RM 脚本**：无自动播放；S0/S1 显示构建期确定性海报 WebP；题跋照常；试墨区显示"已按系统减动效设置停用"。

## 1.3 视觉语法：墨法 ↔ 编排事件（同构表，非比喻堆砌）

| 墨法 / 物理 | inkwash 机制 | 本仓编排事实 | 触发数据 |
|---|---|---|---|
| **纸的湿度 = 权限** | 速度只存在于湿处；干纸上墨不动 | 文件域 / write root / no-touch | 试墨区指挥官干纸；题跋三"文件域正交" |
| **洇 / 色谱分离** | 黑墨是染料鸡尾酒，湿纸上按不同速度分离 | 一份共享 prompt → 三路不同席位、不同耗时 | 派单 receipt `t0/t1` |
| **泼墨** | 多点同时 splat | 并行派单 fan-out（`launch.py` 三路 detach） | 同一 dispatch 目录内 ≥2 lane 起手间隔 ≤60s |
| **积墨** | 密度相加（Beer–Lambert），永不糊死黑 | 多轮迭代叠色（提分 Loop L0→L2、同 cwd 反复会话） | `context_compacted` ≥1 或同 cwd 同日 ≥3 会话 |
| **破墨** | 湿上加湿，破开前一笔 | 审计打回实现 / 董事会终裁改路线 | `cc-*-evidence` NO_GO、ADR 记录 |
| **飞白** | 枯笔断续 | 中断 / 超时 / 退出码非零 / identity fallback / UNAVAILABLE | `turn_aborted`、`exit_code≠0`、`fallback≠null` |
| **留白** | 不落墨 | 父代理不写业务代码 | originator=Cursor 父代理且 `patch_apply_end`=0 的会话 → **空心环** |
| **干 = 门** | 每次渲染都是正在关闭的窗口 | e2e / LHCI 跑完即定 | gate span `t1` |
| **定（fix）** | 颜料沉入纸，后笔不扰 | 合入 `main` | PR merged |
| **白墨** | 破坏性覆盖，抹掉底下密度 | NO_GO / revert | 真实 NO_GO 记录 |
| **印** | 整幅单色画唯一的颜色 | 收据：`identity_ok` / SHA256 / 门灯 | receipt 字段 |

**印章规范**：方形，等宽字（不引篆书字体，避免 kitsch 与体积），**朱文（红字白底）= GO / 白文（白字红底）= NO_GO / 灰印 = 无机器收据（`identityOk:null`）**；印色：GO 用楼紫 `#a855f7`，NO_GO 用朱砂 `#b8321a`（红灯比绿灯亮）。印文只放机器字段（`identity_ok` / `NO_GO` / 模型短名 / SHA 前 7 位）。

**墨分五色（席位 → 浓淡）**：焦 = Codex、浓 = Claude Code、重 = Cursor、淡 = Grok、清 = agy/api_direct（Gemini/GLM）。同一紫墨、五档密度——不上五种颜色，保持单色编辑部气质。此映射为"已定设计选择"，批评者不重评。

## 1.4 基调 A 规范

- 纸：`#efe9dc` 基底 + 两层程序化纤维噪声（大尺度 fbm + 像素级细噪），不贴图。
- 墨：光学密度存储，显示 `paper * exp(-density * strength)`；吸收谱 `vec3(1.0, 0.86, 1.10)` 量级微调使淡处泛紫、浓处近黑（W1 spike 定数值，进 `LOCKED` 记录）。
- 边缘沉积（`1 + k·|∇density|`）与湿润光泽保留——这是"看起来是水墨"的两处关键。
- 字体：不引 CJK webfont；`font-family: "Songti SC","Noto Serif CJK SC",serif` 正文，等宽用于收据；标题字重 ≤600。
- 禁：山水/竹/鹤/云纹/毛笔光标/宣纸贴图/书法字体/古琴 BGM/打字机效果/彩虹流体。
- 站头页脚：`hall.css` 现为暗底 token 作用于 `html:has([data-hall])`；本楼加 `data-hall-theme="paper"` 覆盖为纸色 token（热点文件单 writer，见 §5）。

## 1.5 降级与端

| 态 | 表现 |
|---|---|
| reduced-motion | 不起 rAF；S0/S1 用构建期确定性海报 WebP（各 ≤60KB）；题跋静态；试墨停用并说明 |
| 无 WebGL2 或无 `EXT_color_buffer_float` | 同 RM |
| 无 JS | 首屏标题 + S0 海报 + 五跋全文可读（题跋是 DOM，本来就在 HTML 里） |
| 移动端 | 单列竖滚；canvas 取 9:16 裁切；速度场 96–128 粗网格、墨场 ≤768；15s 无交互暂停；试墨区触控可用 |
| `save-data` | 与 RM 同 |

手卷"横向展开"由竖向滚动 progress 驱动 `translateX`（sticky 区间），**禁 `wheel + preventDefault`**（TECH-ARCH §3 原话）；刷新落在中段按当前滚动恢复。

## 1.6 尺子（本楼专用）

| 维 | 权重 | 谁判 | 口径 |
|---|---|---|---|
| A 哇感（10 秒） | 25 | fresh 批评者 ×2 看首屏截帧 + 3s 录屏 | 是否想继续看；是否像"国风模板"或"流体玩具" |
| B 复述（30–60 秒） | 20 | 批评者只看录屏 | 能否写出"真实会话数据 / 多席位 / 有失败 / 有收据"四点中 ≥3 |
| C 真实性绑定 | 20 | 机器门 + 人门 | S0/S1 每个可见元素能追到 ledger 字段；每跋 `data-bind` 指向真实 rule / receipt / URL；无绑定 = FAIL |
| D 工程门 | 20 | 机器门 | build / check / G-Hall / JS ≤50KB gzip / ledger redact / 海报体积 / e2e 绿 / 无 secret |
| E 降级完整 | 15 | 机器门 + 人门 | RM / 无 WebGL2 / 无 JS / 移动四态各有体面终态 |

面板分 = min；人分磊哥独有，批评者分是机分，禁混写。

# 2. 内容：五跋

## 2.1 每跋结构（固定，机器可校验）

```
<section data-scene="s{n}" data-colophon="{id}"
         data-bind="rule:<~/.claude/rules/x.md 或仓内路径>;receipt:<ledger.artifacts[].id>;url:</ai-lab/...>">
  题  ≤14 字（一句认知）
  文  ≤200 字（磊哥口述/手写；worker 只可从 rule/receipt 起草，不得添加未溯源事实）
  迹  1 条真实事件：日期 + 发生了什么 + 当时怎么处理（可脱敏）
  印  ≥1 枚：朱文 GO / 白文 NO_GO / 灰印 无机器收据；点开 = 字段摘录
  背面 可选深挖：站内文章 / 导出的脱敏 claude-replay HTML / 规则全文
</section>
```

**内容硬规**：每一句断言可追到文件；不编年份、不编数字；rule 文件属磊哥私有思考，**公开尺度（仅标题 / 摘录 / 全文）逐条由磊哥批**；客户名、同事名、绝对路径中的用户名不出现（路径统一以 `~/` 或项目标签呈现）。

## 2.2 五跋立意候选 + 素材锚点（候选 ≠ 定稿；磊哥确认后才进任务书）

| 跋 | 立意候选（一句） | 真实素材锚点（本机已核存在，仅列路径不读正文） | 墨法 | 候选"迹"（需磊哥点名） |
|---|---|---|---|---|
| **① harness 认知** | 模型是墨，harness 是纸——同一支模型换一张纸，洇出来不一样 | `~/.codex/state/{cursor-agent-cli-codex, grok-cli-codex, kimi-cli-codex, cline-cli-codex, agy-cli-codex, qwen38-codex, hermes-router, cursor-external-subagents, codex-modern-subagents, fable-cloud-agent}`（harness 探针 jobs / canaries / audits）；`~/.claude/rules/cc-harness-probe-discipline.md`、`dispatch-actual-channel-forensics.md`、`channel-cognition-flywheel.md`、`rescue-fleet-routing.md`、`hermes-rescue-routing.md`；skills `*-rescue` ×7 | 洇：同一滴墨落在 N 张不同湿度的纸 | 某次 harness 静默换模 → 促成 identity 硬门（与跋④互链） |
| **② skill 管控认知（co-agent）** | 技能不是越多越好：几百个 skill 之后，我给它们设了体积门、退役区和注册表 | `~/.claude/skills`（259）/ `~/.codex/skills`（347）/ `skills-retired-20260816` / `skills-archive`；`~/.claude/rules/`（80 条）+ hooks 体积门（"新 rule ≤2K 硬门，实证外置 archive"——本会话 hooks 输出即实证）；`~/Projects/co-agent/`（`docs/09-coagent-convergence-charter.md`、`10-binding-leg-playbook.md`、`packages/{contracts,proof,registry,observed-state}`） | 积墨：层层叠到纸饱和；定 = 注册表；白墨 = 退役 | rules 体积膨胀触发体积门（今日 5 条 >3.2K 被点名） |
| **③ subagent / agent team / tmux** | 并行不是多开窗口：文件域正交 + 单 writer + 实现与审计分 lane；tmux 是让子代理有实体的地板 | `~/Projects/smux`、`~/Projects/tmux-bridge-mcp`、`~/.claude/projects/-Users-wanglei-Projects-agent-tmux-stack-research-runs-2026-07-29-subagent-runtime-upgrade`（及 07-27 v12）；`~/.codex/state/codex-modern-subagents/{promotions,prompts,runs}`、`cursor-external-subagents/`；`AGENTS.md §4` 四权分立；rules `parallel-safety.md`、`parallel-instruction-second-half-dropped.md`、`concurrent-audit-time-race.md`、`foreground-batch-not-background-drip.md`；ABOUT-HALL §11 "nohup & 会被连带杀 → start_new_session" | 泼墨：三晕不相交 = 文件域正交；相交处糊 = 踩踏 | 并行指令后半段被丢（rule 名即事件）；审计与实现时间竞态 |
| **④ 模型评测与认知** | 评测先问"谁在答"：served_model / identity_ok / fallback 是第一题，分数是第二题 | `~/Projects/co-agent/docs/{11-model-coverage-inventory,12-robustness-matrix,13-d2-matrix,14-claude-native-d2-benchmark}.md`；`~/.codex/state/hermes-router/{p3a-deepseek-v4-flash,p3a-live-validation,canaries}`、`cursor-agent-cli-codex/p3a-deepseek-v4-flash-diagnostic.json`（及 `diagnostics/`）；本仓 `origin/alvis-crossmodel-grok-20260903`（`docs/research/cc-alvis-r3-eval/grok-eval.json`）；视觉双评 \|Δ\|≤5、"自评偏乐观 ~2 分"（AGENTS.md §4.3）；rules `capability-honesty-tiering`（skill）、`ai-fabrication-taxonomy.md`、`claim-vs-reality-gap.md`、`opus-fable-parity.md`、`fable5-adaptation.md`、`cross-vendor-final-audit.md`、`external-model-usage-quickref.md` | 印：每席位一枚，三态 | 任一 `identity_ok` 失败 / fallback / UNAVAILABLE 真记录（N1：比全绿更有鉴别力） |
| **⑤ 心得小技巧** | 小技巧的本体是反射：完成声明先分诊、缺席先探针、派单前先 pre-mortem | rules `completion-claim-triage.md`、`absence-claim-probe-first.md`、`pre-mortem-reflex.md`、`worker-output-adversarial-pairing.md`、`unverified-premise-hardening.md`、`derivation-layer-discipline.md`、`grok-rescue-cli-quirks.md`、`claude-code-tips.md`；skill `codex-cli-three-gotchas-bypass`；AGENTS.md §4.3 高频坑速查（Node 22 ESM 断言坑、SwiftShader LHCI null、poster 重拍排最后）；ABOUT-HALL §11 | 飞白：每道枯笔 = 一次翻车变成一条规则 | 10–12 条一行技巧做小印，翻面显示起源事件 |

**跋的顺序**按磊哥给定 ①→⑤；跋⑤"小技巧"以 10–12 枚小印阵列呈现（非长文）。

# 3. 数据契约

## 3.1 `ink-ledger.json`（`public/demo/agent-nexus/ink-ledger.json`，≤60KB gzip 前 ≤200KB）

在 N2 §5.2 `agent-nexus-trace/v1` 上**加法**：

```jsonc
{
  "schemaVersion": "ink-ledger/v1",
  "generatedAt": "2026-09-xxTxx:xx:xxZ",
  "range": { "from": "2026-06-xx", "to": "2026-09-xx" },
  "seats": [ { "id": "codex", "label": "Codex", "tone": "焦" }, { "id": "claude-code", "tone": "浓" }, { "id": "cursor", "tone": "重" }, { "id": "grok", "tone": "淡" }, { "id": "agy", "tone": "清" }, { "id": "api-direct", "tone": "清" } ],
  "projects": [ { "id": "p01", "label": "co-agent", "topic": "skill" } ],   // 白名单标签，无绝对路径
  "days": [ { "d": "2026-08-14", "n": 41, "bySeat": { "codex": 33, "claude-code": 5 }, "tokens": 0, "aborted": 2, "compacted": 6 } ],
  "sessions": [                                    // Top-N 明细（默认 N≤600，按 tokens/时长/事件性取样）
    { "id": "s0412", "seat": "codex", "t0": 1755150000, "dur": 1830, "turns": 5, "tools": 41, "patches": 5,
      "tokens": 182000, "model": "gpt-5.5", "effort": "xhigh", "project": "p01",
      "flags": ["compacted"], "ink": { "r": 0.62, "tone": "焦", "hollow": false } }
  ],
  "dispatches": [                                  // S0 洇：沿用 N2 spans（kind agent/llm/tool/gate）
    { "id": "cc-buildings-2026-09-02", "displayName": "12 楼脑暴三路派单", "startedAt": "...", "durationMs": 2140000,
      "spans": [ /* N2 §5.2 */ ], "artifacts": [ /* path(相对/标签) + bytes + sha256 + role */ ] }
  ],
  "colophons": [                                   // 五跋的机器面：印与绑定，正文在 Astro 里
    { "id": "harness", "seals": [ { "kind": "GO|NO_GO|NULL", "text": "identity_ok", "receipt": "r017" } ], "binds": ["rule:cc-harness-probe-discipline.md"] }
  ],
  "receipts": [ { "id": "r017", "seat": "api-direct", "servedModel": "glm-5-3-flash", "identityOk": true, "identityMatch": "exact", "fallback": null, "exitCode": 0, "sha256": "…" } ]
}
```

规则：`t0` 用 unix 秒；`identityOk` 缺失 → `null`，**禁止填 `true`**；0 字节日志保留为 `bytes:0`（absence-claim）；`sessions[].ink` 是渲染提示（半径/浓淡/空心），由 reducer 确定性计算，前端不再做统计。

## 3.2 reducer 来源表（按五跋范围；ops 机运行，不进 CI）

| 席位 | 源 | 抽取字段（仅元数据） | 白名单 / 排除 |
|---|---|---|---|
| Codex | `~/.codex/sessions/YYYY/MM/DD/*.jsonl`（2137 个，2026-06→09）：`session_meta{timestamp,cwd,originator,cli_version,source,model_provider}`、`turn_context{model,effort}`、`event_msg{token_count,task_started,task_complete,turn_aborted,context_compacted,patch_apply_end}`、`response_item{function_call,custom_tool_call,web_search_call}` 计数 | t0/t1、turns、tools、patches、tokens、model、effort、flags | `cwd` 命中白名单项目才入；否则整条丢弃（不匿名化，直接不进） |
| Codex 派单 | `~/.codex/state/{cc-buildings-brainstorm, agent-nexus-research, about-showcase-research, about-hall, x-paidax-research, codex-modern-subagents, cursor-external-subagents, hermes-router, *-cli-codex}`：`prompts/*.md` mtime+bytes、`out/**` bytes+sha、`logs/*.log` bytes、`receipt.json|md` | dispatch spans / receipts | prompt 只取 bytes + 首句 ≤40 字（可关）；`out/` 只取 bytes/sha |
| Claude Code | `~/.claude/projects/<slug>/*.jsonl` | 同 Codex 口径（字段名按 Claude 格式映射） | 仅 `-Users-wanglei-Projects-co-agent`、`-Users-wanglei-Projects-agent-tmux-stack-research*`、`-Users-wanglei-workspace-raw`（loop-commander 相关）等五跋项目；`-private-tmp-*` 探针目录**排除** |
| Cursor | `~/.cursor/projects/Users-wanglei-mywebsite/agent-transcripts/*.jsonl`（25） | 同上；originator=cursor；`patches=0` → 空心环 | 本仓项目全入 |
| Grok | `~/.grok/state/**`（agy-rescue jobs receipt）、`grok -p` json 输出中的 `modelUsage`、`num_turns`、`total_cost_usd` | served label、identity、轮数；**费用默认不展示** | 仅五跋相关 job |
| api_direct | `receipt.json`（`api-direct-background.receipt/v1`） | 逐字段映射（N2 §5.3 表） | 同上 |
| 规则 / 技能 | `~/.claude/rules/*.md`（80）、`~/.claude/skills`、`~/.codex/skills`、`skills-retired-*`、`skills-archive` | **只取文件名、bytes、mtime、条数**；正文不进 ledger（跋文由磊哥定尺度后写进 Astro） | 全部只计数 |

**白名单项目（候选，NEEDS_LEIGE 确认）**：`mywebsite`、`co-agent`、`co-agent-cline-unification`、`agent-tmux-stack-research*`、`smux`、`tmux-bridge-mcp`、`oh-my-codex`、`hermes-agent-upstream-*`、`grok-build`、`workspace/raw`（仅 loop-commander / skills-distilled 子树）、`~/.codex/state/` 上表目录。**排除**：`MAformac`、`lark-*`、`huasheng-*`、`scout-r0`、`Documents/Codex-*`、`-private-tmp-*`、任何客户/雇主目录。

## 3.3 redact 门（`scripts/nexus-ledger-gate.mjs`，构建期必跑）

- ledger 内不得出现：`/Users/`、`wanglei`、`sk-`、`ark-`、`api_key`、`access_token`、邮箱、非白名单项目名、任何 ≥120 字连续自然语言（防 prompt 正文漏入）。
- `projects[].label` 必须在白名单；`sessions[].project` 必须引用 `projects[]`。
- 每个 `receipts[].sha256` 形如 `^[0-9a-f]{64}$`；`identityOk` ∈ {true,false,null}。
- 统计自洽：`sum(days[].n)` = reducer 报告总数；`sessions.length ≤ N`；文件 ≤60KB gzip。
- 生成端另出 `evidence/nexus-hall/LEDGER-RECEIPT.md`：源目录清单、每源条数、丢弃条数与原因、reducer 版本 SHA。

# 4. 技术架构

## 4.1 引擎 `InkEngine`（`src/components/city/halls/nexus/ink/`，TS，零依赖，WebGL2）

```
fields   velocity RG16F (coarse: short side 128–192; 移动 96–128)
         pressure R16F, divergence R16F, curl R16F   (coarse)
         wet      R16F (ink res)
         ink      RGBA16F (ink res: min(1024, css px × DPR≤1.5); 移动 ≤768)   // RGB = 光学密度, A = 白墨
         fixed    RGBA16F (ink res)
passes   splat(ink | water+impulse | white)  → advect(vel) → curl → vorticity → divergence
         → jacobi ×16(移动 ×12) → gradientSubtract → wet(advect 0.6× + blur + decay)
         → ink(advect·mob + bleed·mob·chroma) → display(Beer–Lambert · 纤维噪声 · 边缘沉积 · 湿润光泽)
modes    replay(script)   S0/S1：从 ledger 生成 splat 时间表；seeded 噪声；确定性
         interactive      S7 试墨：pointer → 墨/水 splat；干纸 mask 纹理拒墨；fix() 把 ink→fixed
lifecycle IntersectionObserver 进视口才 step；15s 无交互暂停；`document.hidden` 暂停；dispose 释放 FBO
fallback  无 WebGL2 / 无 EXT_color_buffer_float / RM / save-data → 不实例化，显示海报
```

**确定性与海报**：`?demo=yin&t=8000` / `?demo=flow&t=all` 同步跑脚本并停帧（inkwash 的 `?demo` 技巧）；构建期在 ops mac 用 Playwright 截图 → `public/posters/nexus-hall-{yin,flow}.webp`（≤60KB）。CI 只校验海报存在与体积；像素一致性门（SSIM ≥0.97）只在 ops 机跑（SwiftShader 与 Apple GPU 有差）。

**不用 WebGPU**（Safari 26 仍 partial、Firefox Android 默认关；WebGL2 才是全覆盖）。**不引 three / OGL**（全屏 quad 不需场景图；展厅不 import `src/lab/world/**`）。**不直接拷 inkwash 代码**（许可未核；技术本身是公开的 Stam 1999 + GPU Gems ch.38 + Beer–Lambert；PavelDoGreat 为 MIT 可参考结构）。

## 4.2 手卷与场景驱动（`ScrollScroll.ts`，≤6KB）

- sticky 长区间（S0–S6 总高 ≈ 600–800vh）→ `progress = clamp(-rect.top/(scrollHeight-innerHeight),0,1)` → 分段映射到：S0 模拟时间、S1 月份轴、手卷 `translateX`、题跋进场。
- 同一 progress 驱动 DOM 文字与 canvas；区间表集中配置 `src/data/nexus-hall-scenes.json`。
- 无 `wheel`/`touchmove` 劫持；键盘可达（scrubber 是 `<input type=range>`；印是 `<button>`）。

## 4.3 接线（加法，不动既有语义）

| 契约 | 改动 |
|---|---|
| `src/data/world-halls.json` | 加 `{ "slug": "agent-nexus", "buildingId": "agent-nexus", "trick": "ink-ledger", "scenes": [...] }` |
| `src/data/cyber-city-buildings.json` | `agent-nexus` 加 `"hallPath": "/world/agent-nexus/"`；`deepLink` 仍 `/ai-lab/`（文章入口不丢） |
| `src/pages/world/[slug].astro` | 现为 `hall.slug === 'about-pavilion'` 硬分支 → 改为 slug → 组件表（`halls/about/*`、`halls/nexus/*`），热点文件单 writer |
| `src/layouts/WorldHallLayout.astro` + `src/styles/hall.css` | 加 `data-hall-theme` 属性；`[data-hall-theme="paper"]` 覆盖为纸色 token；默认暗底不变 |
| `HallChrome` | 复用；到达条/回城/探索 n/12 零改动 |
| `docs/spec/SRD.md` | `/world/{slug}/` 一行已由 about-hall 补；本楼不再动 |
| `lighthouserc.json` | **不加** `/world/agent-nexus/`（第一刀） |
| sitemap | 新厅进 sitemap（`astro.config.mjs` 只排 `/world-spike/`） |

## 4.4 预算表

| 项 | 上限 | 备注 |
|---|---|---|
| 展厅额外 JS | **Hall-S ≤50KB gzip**（引擎 ≤30 + 滚动/手卷/印抽屉 ≤12 + 数据装载 ≤4） | 与 Lab S 数字对齐，但不是 Lab 模块 |
| `ink-ledger.json` | ≤60KB gzip | 按需 fetch，不进首包 |
| 海报 WebP ×2 | 各 ≤60KB | LCP 候选 |
| 印章 SVG | 内联，每枚 ≤1.5KB | 无字体 |
| 字体 | 0（系统栈） | |
| 视频 | **0** | 本楼零视频 |
| 页面总载荷 | ≤600KB | 远低于 about-hall 3.22MB |
| 同屏循环动画 | ≤2 处（S0/S1 canvas 各 1） | RM 下 0 |
| GPU | 桌面 60fps；中端手机 ≥30fps（自适应降 jacobi 次数与墨场分辨率） | 15s 空闲暂停 |

## 4.5 门与脚本

| 脚本 | 用途 |
|---|---|
| `scripts/nexus-ledger-reduce.mjs`（ops 机） | §3.2 reducer；确定性；输出 ledger + `LEDGER-RECEIPT.md` |
| `scripts/nexus-ledger-gate.mjs` | §3.3 redact 与自洽门 |
| `scripts/nexus-hall-gate.mjs` | build/check 通过；`dist/world/agent-nexus/index.html` 零 `_astro/world.` / `models/` / rapier；hall chunk gzip ≤50KB；海报存在且 ≤60KB；每 `<section data-scene>` 有 `data-bind` 且 `rule:` 文件存在于清单、`receipt:` id 存在于 ledger、`url:` 在 dist 200；`rg -i 'api_key\|access_token\|sk-\|ark-'`=0；输出 `evidence/nexus-hall/GATE.json` |
| `scripts/nexus-hall-posters.mjs`（ops 机） | Playwright 打开 `?demo=…` 截图 → cwebp → 校验体积 → SSIM 对比上版 |
| `e2e/nexus-hall.spec.ts` | ledger 200 且 schema 版本对；S0 canvas 出现且 `?demo=yin` 停帧像素非纸色；scrubber 改变 `data-t`；点印开抽屉且含 `identity_ok`；RM 下无 rAF（打桩计数）无 CSS animation；`?from=city&poi=agent-nexus` 到达条出现、非法 poi 不出现；375 宽单列；无 world chunk 请求 |
| 既有 | `audit-budget.mjs`、`check-links.mjs`（`hallPath` 在 dist 有页）、`site-health.spec.ts`、`about-hall-gate.mjs`（不回归） |

## 4.6 依赖（授权 worker 自装并登记）

已有：Node 22 + pnpm、Playwright、ffmpeg、cwebp（about-hall 已装）、Python 3.13。可能新增：`sharp` 或 `cwebp` 用于海报；`ssim.js`（或 Python `scikit-image`）用于海报一致性门；无运行时新依赖（引擎零依赖）。

# 5. 席位与派单

席位表、直跑命令、身份核验、故障重发**全部沿用** `ABOUT-HALL-CHARTER §2.1`（指挥官 Cursor；董事会 Grok 4.6 xhigh；开发 worker glm-5-3-flash@ark-plan；多面 worker gemini-3.7-flash；生成 worker Grok Build——本楼**几乎不需要生图**，海报由引擎自渲染；秘书 / 批评者 / 沉淀席同）。

派单纪律沿用 §2.2，本楼加项：
- prompt 文件放 `~/.codex/state/nexus-hall/prompts/<ticket>.md` 0600。
- **reducer 只能在 ops 机由指挥官或磊哥运行**；任何 worker 不得读取 `~/.codex/sessions` / `~/.claude/projects` 正文；worker 只拿 ledger 产物。
- 热点文件单 writer：`src/pages/world/[slug].astro`、`src/layouts/WorldHallLayout.astro`、`src/styles/hall.css`、`src/data/world-halls.json`、`src/data/cyber-city-buildings.json`。
- 题跋正文 = `NEEDS_LEIGE`；worker 起草稿必须逐句标注来源文件，未溯源句删除。

# 6. 波次

| 波 | 目标 | Giants | write root | 最小 Live 验收 | 人日 |
|---|---|---|---|---|---|
| **W0 Step 0** | 本草案 → charter；索引 `NEXUS-HALL-INDEX.md`；董事会 ADR ×3：① 数据白名单与公开尺度 ② 手卷横向平移 vs 纯竖滚 ③ 是否与 about-hall 合流前并行开工 | N1–N4 digest（adopt/adapt/drop 已在 §0.5） | `docs/local-cmd/` | ADR 落地；索引建好 | 0.5 |
| **W1 引擎 spike** | `InkEngine` 六场 + 十二 pass + display；`?demo` 确定性模式；桌面/iPhone/中端 Android 帧率；gzip 体积；纸色/墨谱 LOCKED 数值 | inkwash 机制拆解（湿度门、mob、chroma、Beer–Lambert、边缘沉积）；PavelDoGreat 结构（MIT）；marbling-experiment 的 idle 暂停 | `src/components/city/halls/nexus/ink/`、`public/posters/` | 隔离栈打开 spike 页：一滴墨洇开 + 试画；引擎 ≤30KB gzip；RM 不起 rAF | 2 |
| **W2 数据 reducer** | `nexus-ledger-reduce.mjs` + `nexus-ledger-gate.mjs` + `LEDGER-RECEIPT.md`；schema 文件 | N2 §5 schema/转换器伪代码；claude-replay / agentviz 的多格式解析思路（只借字段映射） | `scripts/`、`public/demo/agent-nexus/`、`evidence/nexus-hall/` | ledger 过 redact 门；条数与源清单对账 | 1 |
| **W3 S0 洇 + S1 墨流** | 派单 spans → 洇脚本（8× 压缩、收口减速、三印）；sessions → suminagashi 滴序（保面积变换，环推薄）；scrubber；悬停卡；印抽屉 | Amanda Ghassaei suminagashi 单滴变换；N1 "撞红灯自动 1×" | `halls/nexus/{Yin,Flow,Seal,Drawer}.astro` + ts | 10 秒脚本成立；S1 数字由 ledger 渲染；点印出 receipt | 1.5 |
| **W4 手卷 + 五跋 + 试墨 + 收官** | 手卷 sticky 驱动；五跋 DOM（正文待磊哥）+ `data-bind`；跋⑤小印阵列；试墨（干纸 mask / 定 / 清）；四出口 | about-hall `Epilogue` 复用 | `halls/nexus/{Scroll,Colophon,Trial,Epilogue}.astro`、`src/data/nexus-hall-scenes.json` | C 维 100% 绑定；试墨干纸拒墨可见 | 1.5 |
| **W5 接线 + 门** | `world-halls.json` / `hallPath` / `[slug].astro` 组件表 / `data-hall-theme` / `nexus-hall-gate.mjs` / e2e / 海报脚本 / sitemap | about-hall W2/W5 实现 | §4.3 文件 + `scripts/` + `e2e/` | 城里 E 进楼 → 纸厅到达条；机器门全绿 | 1 |
| **W6 收口** | 全量 e2e 一次、批评者双评、PR、handoff | — | — | 人门三维 ≥7；e2e 全绿 | 0.5 |

合计 ≈ **8 人日**；MVP（W1 + W2 + W3 + 最小 W5，题跋先放两篇）≈ **4.5 人日**。

# 7. 风险与反面清单

| 风险 | 对策 |
|---|---|
| 滑向"国风模板"（山水/书法/古琴） | §1.4 禁单；批评者清单里明写"像国风模板 = A 维 ≤4" |
| 滑向"流体玩具"（访客画画成主哇） | 试墨区排最后、≤40vh、不可保存；首屏与第二站全数据驱动 |
| 半浮点纹理不支持（旧 Android WebView） | 能力探测 → 海报路径；e2e 用 flag 强制走一次降级 |
| 会话 cwd 泄漏客户/雇主信息 | 白名单准入（非匿名化）；redact 门正则；`LEDGER-RECEIPT.md` 列丢弃条数 |
| worker 起草题跋时编造事实 | 逐句溯源；未溯源删除；磊哥终审；rule 公开尺度逐条批 |
| GPU 差异导致海报与 live 不一致 | 海报只在 ops 机生成；SSIM 门在 ops 机；CI 只查存在与体积 |
| 手机发热/耗电 | 视口外不 step；15s 空闲暂停；`document.hidden` 暂停；自适应降 jacobi 与分辨率 |
| 手卷横向在移动端别扭 | 移动端纯竖滚，不做横向平移（ADR-②） |
| `hall.css` 暗底 token 与纸色冲突影响 about-hall | `data-hall-theme` 作用域覆盖；about-hall e2e 回归必跑 |
| 与 about-hall 分支合流顺序 | ADR-③；本楼壳文件以 about-hall 为 base，不平行改同一热点 |
| N1 反面清单 12 条 | 全收：无假实时、无输入框、无 3D 吉祥物、无 logo 墙、无全绿、无未脱敏会话、无 BYO key 默认 |

# 8. 需磊哥拍（NEEDS_LEIGE）

1. **五跋正文**：立意候选（§2.2）对不对；每跋点名哪一次真实"迹"（翻车）；rule 文件公开尺度（仅标题 / 摘录 / 全文）。
2. **数据白名单**：§3.2 候选项目名单确认增删；`~/.codex/state/*-cli-codex` 探针目录是否算"harness 认知"素材公开。
3. **tagline** 三选一或改写。
4. **墨分五色 → 席位映射**（焦 Codex / 浓 Claude Code / 重 Cursor / 淡 Grok / 清 agy·api_direct）是否接受。
5. **费用字段**（`total_cost_usd`）是否展示——默认不展示。
6. **试墨区**是否允许保存 PNG——草案默认不允许。
7. **合流顺序**：等 about-hall 合入 `main` 再切本楼，还是以 about-hall 分支为 base 并行（董事会 ADR-③）。

# 附录 A · 外部参考（本次调研，2026-09-03）

| 参考 | 用途 | 链接 |
|---|---|---|
| inkwash · how it works | 水墨引擎六场十二 pass、湿度门、色谱分离、Beer–Lambert、`?demo` 确定性截图 | https://johnowhitaker.github.io/inkwash/about |
| PavelDoGreat WebGL-Fluid-Simulation（MIT） | Stable Fluids 结构参考 | https://github.com/PavelDoGreat/WebGL-Fluid-Simulation/ |
| Amanda Ghassaei · Digital Marbling / marbling-experiment | suminagashi 单滴保面积变换；idle 暂停 | https://blog.amandaghassaei.com/2022/10/25/digital-marbling/ · https://github.com/amandaghassaei/marbling-experiment |
| InkField 技术文档 | 六种洇散模式分类（MIX/SHARP/FLYING/WET/SALT/HAIR）作为墨法参考 | https://ileivoivm.github.io/inkField/tech/en/index.html |
| Arnaud Rocca 作品集（Codrops 2026-03） | 反例：2026 流体标配；可借 `FluidSimulation` 类的参数化 | https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/ |
| giats.me / manus-portfolio / Blackbook.dk | 反例：流体叠层与 Riso 流体 | https://github.com/abdulhussain156/giats-portfolio · https://github.com/manu-brighter/manus-portfolio |
| claude-replay | 题跋"背面"：多格式会话 → 单文件脱敏 HTML | https://github.com/es617/claude-replay |
| agentviz / jsonl-debug | reducer 字段映射参考；复盘工具 | https://github.com/jayparikh/agentviz · https://github.com/crafter-station/jsonl-debug |
| WebGPU 支持度 | 决定 WebGL2 | https://caniuse.com/webgpu · https://github.com/gpuweb/gpuweb/wiki/Implementation-Status |
| OGL | 未采用（22KB 但无必要） | https://oframe.github.io/ogl/ |

# 附录 B · 本机真实素材索引（只列位置与规模，未读正文；2026-09-03 `ls`/`find` 核过）

| 类 | 位置 | 规模 |
|---|---|---|
| Codex 会话 | `~/.codex/sessions/2026/{06,07,08,09}/` | 2 / 456 / 1624 / 55 个 JSONL（共 2137，12GB） |
| Codex 派单目录 | `~/.codex/state/` | 23 个（含 `cc-buildings-brainstorm`、`agent-nexus-research`、`about-hall`、6 个 `*-cli-codex` 探针、`hermes-router`、`codex-modern-subagents`、`cursor-external-subagents`、`fable-cloud-agent`） |
| Claude Code 项目 | `~/.claude/projects/` | 21 个（含 co-agent、agent-tmux-stack-research ×3、workspace/raw；`-private-tmp-*` 探针 9 个） |
| Cursor 转录 | `~/.cursor/projects/Users-wanglei-mywebsite/agent-transcripts/` | 25 个 |
| 规则 | `~/.claude/rules/` | 80 个 md |
| 技能 | `~/.claude/skills` / `~/.codex/skills` / `skills-retired-20260816` / `skills-archive` | 259 / 347 / — / — |
| co-agent | `~/Projects/co-agent/`（docs 01–14、packages contracts/proof/registry/observed-state/testkit、apps control-api/web） | — |
| tmux 栈 | `~/Projects/smux`、`~/Projects/tmux-bridge-mcp`、`~/Projects/oh-my-codex` | — |
| 本仓证据 | `docs/research/cc-*-evidence/`、`docs/research/cyber-city-score-loop-orchestration.md`、`origin/alvis-crossmodel-grok-20260903`（`cc-alvis-r3-eval/grok-eval.json`） | — |
| 展厅壳（about-hall 分支） | `src/pages/world/[slug].astro`、`src/layouts/WorldHallLayout.astro`、`src/components/city/HallChrome.astro`、`src/data/world-halls.json`、`scripts/about-hall-gate.mjs`、`e2e/about-hall.spec.ts` | worktree `website-about-hall` @ `f942a22` |
