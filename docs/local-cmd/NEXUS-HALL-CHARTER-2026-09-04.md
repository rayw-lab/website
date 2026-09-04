---
title: NEXUS-HALL · 第二栋楼「墨迹 · Ink Ledger」施工任务书（CHARTER）
type: charter
status: active
date: 2026-09-04
owner: 磊哥
executor: Claude Code 主线程（本次授权亲自实装，见 §0.2）
parent: docs/local-cmd/NEXUS-HALL-DRAFT-2026-09-03.md（352 行脑暴草案 = 设计 SSOT）
seat-template: docs/local-cmd/ABOUT-HALL-CHARTER-2026-09-02.md（席位/写根/门形态母版）
---

# 0. 一页纸

**目标**：赛博城市第二栋楼 `agent-nexus`（紫 `#a855f7`）落成一页**用水墨物理承载真实 agent 会话元数据**的经验分享厅 `/world/agent-nexus/`。访客 10 秒「哇」（一滴墨分三路），30 秒读懂「这是一个人与多智能体共事一百天的真实台账」，3 分钟读完五篇题跋。**验收只认 Live**（真浏览器 + fresh 批评者），不认 build 绿。

**设计 SSOT = 草案**（`NEXUS-HALL-DRAFT-2026-09-03.md`）。本任务书**不重述**草案的体验/数据/技术设计，只固化：磊哥裁决、编排口径、波次任务书、门与验收。草案与本文冲突时：**设计口径以草案为准，施工口径以本文为准**。

## 0.1 磊哥裁决（2026-09-03 六项 + 2026-09-04 编排令，全部已拍死，不重开）

| # | 项 | 裁决 |
|---|---|---|
| 1 | 五跋立意 | **同意草案 §2.2 候选方向**为定稿方向：① harness 认知 ② skill 管控（co-agent） ③ subagent/agent team/tmux ④ 模型评测与认知 ⑤ 心得小技巧。正文与「迹」逐篇仍 `NEEDS_LEIGE` |
| 2 | 数据白名单 | **同意草案 §3.2 候选名单**；内容层允许联网找材料填充；「这些内容后续都能改」——白名单可增删，改动记 ADR |
| 3 | tagline | 执行方选定 → **候选 1：「会话即笔迹，收据即印。一个人与多智能体共事的一百天。」** 理由：唯一承载本厅独有硬门（印 = `identity_ok` 三态）的一条，别处抄不走；候选 3 含硬编码数字（实测三天漂移三处：会话 2137→2150、rules 80→79、Cursor 转录 25→27），排除 |
| 4 | 墨分五色 → 席位 | **同意**：焦 = Codex / 浓 = Claude Code / 重 = Cursor / 淡 = Grok / 清 = agy·api_direct。属已定设计选择，批评者不重评 |
| 5 | 费用与试墨 | `total_cost_usd` **不展示**；试墨区**不提供保存 PNG** |
| 6 | 合流顺序 | **不等 about-hall 合入 main，并行开干**：本楼分支 base = `codex/about-hall-20260902`（壳复用），合流序留 `NEEDS_LEIGE` |
| 7 | 编排（2026-09-04） | **每一波（W0–W6）必派一路 agy（Gemini 3.8 Flash High）直跑调研**相关技术栈/前端 demo，允许 clone 并 teardown 到本地分析，出分析报告后执行方再结合参考落地；**常态化 xhsapi（dots3-note-prev）直跑做秘书与反核**；**其余全部由执行方亲自完成** |
| 8 | 质量口径（2026-09-04） | 「我要的是**极品炫技**网站」「一定要**高级感**，视觉审美要在线」——A 维（哇感）与视觉审美是本楼第一优先，不是附属 |

## 0.2 本次编排 delta（相对 AGENTS.md §4.1 与 about-hall）

| 项 | about-hall 口径 | 本楼口径（磊哥 2026-09-04 令） |
|---|---|---|
| 父代理是否写业务代码 | 只编排，不写业务代码（≤10 行文档/配置直改除外） | **执行方亲自实装全部代码**（「其他都是你完成」）。AGENTS.md §4.1 的「父代理只编排」在本楼**显式豁免**，豁免范围仅限本楼 write root（§3） |
| worker 用途 | glm 写组件、gemini 调研/批评、grok 生成 | **worker 不写业务代码**：agy = 每波调研 + teardown + 视觉参考；xhsapi = 秘书 + 反核 + 对抗审；董事会 Grok = 重大决策。生成席本楼几乎不用（零视频，海报由引擎自渲染） |
| 调研强度 | Giants 每 loop 一次 | **每波强制一路 agy**，允许 clone 第三方 repo 到仓外只读区逐文件 teardown |

**为什么这个 delta 是安全的**：本楼零后端、零 key、零视频，代码面是自包含的 `halls/nexus/**` + 三个脚本 + 一个 e2e，热点共享文件只有五个（§3.3）且全部是加法改动；风险集中在**视觉审美与真实性绑定**两处，而这两处恰恰是不能外包的（worker 看不到像素、不该读会话正文）。

# 1. 尺子（本楼专用；面板分 = min，人分磊哥独有）

| 维 | 权重 | 谁判 | 口径 |
|---|---|---|---|
| **A 哇感（10 秒）** | 25 | fresh 批评者 ×2 看首屏截帧 + 3s 录屏 | 是否想继续看；**是否像「国风模板」或「流体玩具」→ ≤4 分**；高级感（层级/留白/材质）在线 |
| **B 复述（30–60 秒）** | 20 | 批评者只看录屏 | 能否写出「真实会话数据 / 多席位 / 有失败 / 有收据」四点中 ≥3 |
| **C 真实性绑定** | 20 | 机器门 + 人门 | S0/S1 每个可见元素能追到 ledger 字段；每跋 `data-bind` 指向真实 rule/receipt/URL；**无绑定 = FAIL** |
| **D 工程门** | 20 | 机器门 | build / astro check / G-Hall 零 world chunk / hall chunk ≤50KB gzip / ledger redact / 海报体积 / e2e 绿 / 无 secret |
| **E 降级完整** | 15 | 机器门 + 人门 | reduced-motion / 无 WebGL2 / 无 JS / 移动端四态各有体面终态 |

# 2. 席位与派单

## 2.1 席位表（本楼，磊哥 2026-09-04 指定）

| 席 | 载体 | 职责 | 直跑命令（**全部直跑，不派壳**） | 身份核验 | 已知故障与重发 |
|---|---|---|---|---|---|
| **执行方** | Claude Code 主线程 | 建索引/派单/收稿回读/**亲自实装全部代码**/跑门/合流/写 CURRENT AUTHORITY | — | — | — |
| **调研席（每波必派）** | agy · Gemini 3.8 Flash High | 技术栈调研、第三方 repo clone + teardown、**2026 高级感视觉参考**、盲区补搜词 | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 python3 ~/.claude/scripts/agy_rescue_cli.py --model flash --prompt-file <0600 brief> --cwd <refs 目录> --timeout 6000` | receipt：`exit_code==0`、`identity_ok==true`、`served_label==requested_label`、`permission_profile==full-capability`；缺失记 `UNPROVEN` | **本机同时只开一路 agy**（串行排队）；`AGY_NETWORK_TRANSIENT` ≠ 退出登录，错峰重发一次；看见登录页先读本次 `agy.log` 不要重登；不得 kill 他人 AGY PID |
| **秘书 / 反核席（常态）** | xhsapi · dots3-note-prev（512K ctx，思考 max） | 反核「已完成」vs 文件/Git 事实、对抗审、LOOP-LOG、findings register | `python3 ~/.claude/scripts/stream_wrap.py --tag xhsapi-<job> -- python3 ~/.claude/scripts/api-direct/api_direct.py --model 'dots3-note-prev@dots-xhsapi' --prompt-file <brief> --attach <料> --stream --max-tokens 48000 --out <落盘>` | `APIDIRECT_RECEIPT=` 的 `served_model=dots3-note-prev`、`identity_ok=true`、`thinking_sent=true`、rc=0 | RPM 20 / TPM 500K；429 或断连如实 `BLOCKED`，**禁 fallback 改走别席** |
| **董事会** | Grok 4.6 xhigh（`grok -p` 纯推理） | 重大决策裁决（§7），落 `adr/ADR-n.md`；只裁不施工 | `stream_wrap.py --tag nx-board -- grok -p "$(cat $P)" -m grok-4.6 --reasoning-effort xhigh --no-subagents --verbatim --output-format json` | `modelUsage`、rc=0 | 壳报 completed ≠ grok 结束：先按真二进制名核进程；`out_size=0` 连续多轮是 json+xhigh 常态；55 min 无产出改派 agy 出临时意见并登记 |
| **批评者**（W6） | agy ×1 + xhsapi ×1 | 只拿录屏/截帧 + rubric 切片 + 已定设计清单；**看不到像素写 BLOCKED** | 同上 | 同上 | 不看代码、不看建造者总结；brief 里**不预列「本版修了什么」**（盲审两段式） |

## 2.2 派单纪律（本楼）

- 每单一个 **0600** prompt 文件放 `~/.codex/state/nexus-hall/prompts/<ticket>.md`（不用 `/tmp`）：目标、输入绝对路径、**唯一 write root**、no-touch 清单、交付物、验收命令、stop-line；**不放 secret**。
- **内联 SSOT 不给指针**：派单正文写清具体规则与数值，不写「见草案 §x」——执行方不会翻，会凭眼前的猜。内联事实标证据等级 `[实测]`/`[推断]`/`[未坐实-待验]`。
- **worker 写根隔离**：agy 写根 = `~/studio-data-root/refs/nexus-hall/` + `~/.codex/state/nexus-hall/out/`；xhsapi 写根 = `~/.codex/state/nexus-hall/out/`。**任何 worker 不得修改项目仓（含本 worktree）任何文件**，不得跑 mutating git，不得 commit/push，不得占 4321/4585/4587/5173。
- 🔴 **数据源红线**：`~/.codex/sessions`、`~/.claude/projects`、`~/.cursor/projects/**/agent-transcripts` 的**会话正文任何 worker 不得读取**（含 agy）。reducer 只由执行方或磊哥在本机跑；worker 只拿 reducer 产出的 `ink-ledger.json`。
- 收稿：**worker 自报不算**。执行方回读产物本身（不读它的摘要）、核 receipt identity、跑机器门、隔离栈真开一次页面。产物 <2KB 疑空稿必看开头原文。
- 长单用后台 Bash 托管 + 单条后台监控自转；**禁 `nohup` 后提前交稿**；`rc=124` 先比产物 mtime 与超时时刻再判死。

# 3. 写根与 Git

```bash
# 已建（2026-09-04）
git worktree add -b codex/nexus-hall-20260903 \
  /Users/wanglei/studio-data-root/worktrees/website-nexus-hall codex/about-hall-20260902
```

- **worktree**：`/Users/wanglei/studio-data-root/worktrees/website-nexus-hall`，分支 `codex/nexus-hall-20260903`，base `codex/about-hall-20260902@f942a22`。
- **仓外只读参考区**：`/Users/wanglei/studio-data-root/refs/nexus-hall/`（clone 的第三方 repo 放这里，**永不进仓**）。
- **数据原盘永不入库**：会话 JSONL、receipt 原文只留在本机；进仓只放 `ink-ledger.json` 与海报 WebP。
- 不许：force push、amend 已推、`git stash`/`add -A`/`reset --hard`/`clean` 于共享树、`git add .`（只 add 具体文件）。
- 提交身份用 `GIT_AUTHOR_*`/`GIT_COMMITTER_*` 环境变量，不改 git config。`origin/main`、tag 永不直推。
- 合流节点：`git status` clean → fetch → merge base 分支 → `pnpm build && pnpm exec astro check && node scripts/nexus-hall-gate.mjs` → push 本楼分支 → `git ls-remote --heads` == HEAD 才写 LOOP-LOG。**PR 合入 main = `NEEDS_LEIGE`**。

## 3.3 热点文件单 writer（每波只允许一票持有）

| 文件 | 说明 |
|---|---|
| `src/pages/world/[slug].astro` | 现为 `hall.slug === 'about-pavilion'` 硬分支（:63）→ 改 slug → 组件表 |
| `src/layouts/WorldHallLayout.astro` | 加 `data-hall-theme` 透传 |
| `src/styles/hall.css` | 加 `[data-hall-theme="paper"]` 纸色 token 覆盖；**默认暗底不变**，about-hall e2e 必回归 |
| `src/data/world-halls.json` | 加 `agent-nexus` 条目 |
| `src/data/cyber-city-buildings.json` | `agent-nexus` 加 `hallPath`；`deepLink` 保持 `/ai-lab/` |
| `src/data/nexus-hall-scenes.json` | **W3 创建**，W4 只追加（勘误 b） |
| `src/data/nexus-rule-manifest.json` | W2 由 reducer 生成（勘误 g） |

# 4. 波次任务书

## 4.0 草案勘误（W0b 对抗审裁决，2026-09-04）

草案是设计 SSOT，**原文不改**（保一手溯源）；以下十一条是施工口径的覆盖，**冲突时以本节为准**。逐条依据与亲核证据见 `NEXUS-HALL-AUDIT-LEDGER.md` R1。

| # | 覆盖项 | 施工口径 |
|---|---|---|
| **a** | S0 时基（草案 §1.2「8× 压缩」算术不成立：2140s ÷ 8 = 267.5s ≫ 9.4s 窗口） | **双级映射**：`8×` 只描述**墨在纸上扩散的物理速度比**（三路相对快慢 247:763:2140 保真）；另设**回放时基** `playbackScale = 窗口秒数 / max(branch.durationMs)`，把最长一路压进 9.4s。撞收口（第一枚印落下）时 `playbackScale` 平滑降到 1× 停住。schema 加 `dispatches[].branches[]: {name, durationMs, receiptId}` |
| **b** | `src/data/nexus-hall-scenes.json` 归属 | 由 **W3 创建**（S0 模拟时间 + S1 月份轴区间），**W4 只追加**（题跋进场 / 试墨区区间）。热点文件持有表加此行 |
| **c** | 人日重估 | 见下表；合计 8 → **11**，MVP 4.5 → **7**（原 MVP 隐含「最小 W5 = 0 人日」，而无 W5 页面根本不可达） |
| **d** | 子预算独立闸门 | 门必须**分别**断言：`ink/**` 引擎模块 ≤30KB gzip、滚动/手卷/抽屉 ≤12KB、数据装载 ≤4KB——不许只查合计 ≤50KB（省下的额度会互相掩护）。e2e 加 rAF 帧间隔采样 3s，桌面断言 p50 ≤20ms |
| **e** | 降级海报完整映射 | 四态 × 两张海报全覆盖：RM→{yin,flow}、无 WebGL2/无 float 扩展→{yin,flow}、**无 JS→{yin,flow}（`<noscript><img>`，草案原文漏了 flow）**、save-data→{yin,flow}。移动端 fallback 用 9:16 裁切版。IntersectionObserver 进视口后 2s 未触发 step → 降海报（防「canvas 已建但空白」的第五态） |
| **f** | 刷新中段恢复 | `replay(script, { startTime })`：由恢复出的 scroll progress **反算**模拟时间直接 seek，禁从 t=0 重放（否则纸旧墨新） |
| **g** | `rule:` 绑定校验 | 新增 `src/data/nexus-rule-manifest.json`（ops 机由 reducer 生成、进仓）：`[{ id, label, bytes, sha256 }]`，**不含绝对路径、不含正文**。门改为查 `data-bind` 的 `rule:` id 存在于 manifest，**不 stat 文件系统**（`~/.claude/rules/` 是磊哥本机私有，CI 上根本不存在） |
| **h** | redact 正则收紧 | `ark-` → `ark-(plan\|coding\|token)\b`。**理由是实测**：`rg -i -o 'ark-[a-z]*' src/` 当前命中 **16 处**（`park-path`/`park-chip`/`park-car`/`park-slot`，在 `src/lab/modules/tts-cockpit/`），宽正则一上线必红且与安全无关。**门写完第一件事：在 HEAD 上跑一次证明基线 rc=0**，再注入一个假 key 证明它会红 |
| **i** | 印的三态 | S0 落印按 `identityOk` 三态齐：`true`→朱文 GO / `false`→**白文 NO_GO**（草案 §1.2 漏了这一态，与 §1.3 规范自相矛盾）/ `null`→灰印 |
| **j** | 生命周期作用域 | 「15s 无交互暂停 + `document.hidden` 暂停 + IntersectionObserver 才 step」是**通用**规则（桌面同样生效），不是移动端专属。移动端行只留：9:16 裁切、96–128 粗网格、墨场 ≤768、触控 |
| **k** | 门的可信度自证 | 三个门一律 **fail-closed**（读不到输入 = FAIL 并打印路径，不静默 continue）；报告**必须打印分母**（「扫了 N 个，违规 M 个」）；每门配 `--selftest` 子命令做注入自证（注入已知坏样本必须 rc≠0 且报对文件名）；门的退出码**禁经管道**取 |

每波固定四段：**① agy 调研单（必派，先行）② 执行方实装 ③ xhsapi 反核 ④ 机器门 + Live 回读**。

| 波 | 目标 | agy 调研单主题 | 执行方写根 | 最小 Live 验收 | 人日 |
|---|---|---|---|---|---|
| **W0** | 本 charter + `NEXUS-HALL-INDEX.md` + 草案入库；董事会 ADR ×3（① 数据白名单与公开尺度 ② 手卷横向 vs 纯竖滚 ③ 合流序） | — （用 xhsapi 对抗审草案代替） | `docs/local-cmd/` | charter + INDEX 落地；草案 audit findings 逐条裁决 | 0.5 |
| **W1** | `InkEngine` spike：六场十二 pass + display（Beer–Lambert / 纸纤维 / 边缘沉积 / 湿润光泽）；`?demo` 确定性模式；纸色墨谱 LOCKED 数值；帧率与 gzip 实测 | **W1-agy**：PavelDoGreat + marbling-experiment + inkwash 三家 teardown（场表/pass 表/湿度门/色谱分离/Beer–Lambert/边缘沉积/许可裁定）+ 20 条 2026 高级感视觉参考（纸墨单色/手卷横向/印章/数据艺术化）+ 反面清单 | `src/components/city/halls/nexus/ink/`、`public/posters/` | 隔离栈打开 spike 页：一滴墨洇开 + 可试画；引擎 ≤30KB gzip；RM 不起 rAF | **3**（拆 W1a 核心 pass 链 + replay 1.5 / W1b interactive + 干纸 mask + 多端帧率 + LOCKED 数值 1.5） |
| **W2** | `nexus-ledger-reduce.mjs`（ops 机）+ `nexus-ledger-gate.mjs` redact 门 + `LEDGER-RECEIPT.md` + schema 文件 | **W2-agy**：多格式 agent 会话日志字段映射（Codex / Claude Code / Cursor / Grok / api_direct 各自 JSONL 形状）；claude-replay / agentviz / jsonl-debug 的解析与脱敏做法 teardown；确定性 reducer 与统计自洽门的工程做法 | `scripts/`、`public/demo/agent-nexus/`、`evidence/nexus-hall/` | ledger 过 redact 门；条数与源清单对账；`LEDGER-RECEIPT.md` 列丢弃条数与原因 | **1.5**（五种席位格式各自解析 + 白名单 + 确定性 ink 计算 + 两个门 + receipt 报告） |
| **W3** | S0 洇（派单 spans → 三晕 + 三印 + scrubber）+ S1 墨流（sessions → suminagashi 滴序、环推薄、月份轴、悬停卡、印抽屉） | **W3-agy**：suminagashi 保面积变换数学与实现；时间序列→艺术化映射的一流案例；scrubber/时间轴交互的高级做法；悬停卡与抽屉的动效分寸（不廉价） | `halls/nexus/{Yin,Flow,Seal,Drawer}.*`、**`src/data/nexus-hall-scenes.json`（勘误 b）** | 10 秒脚本成立；S1 数字全部由 ledger 渲染；点印出 receipt 三态 | **2** |
| **W4** | 手卷 sticky 驱动 + 五跋 DOM（正文待磊哥）+ `data-bind` + 跋⑤小印阵列 + 试墨（干纸 mask / 定 / 清）+ 收官四出口 | **W4-agy**：手卷/横向叙事一流实现（竖滚驱动横移、移动端退化、不劫持滚轮）；长文排版的高级感（中文正文 + 等宽收据混排）；印章类小元素设计 | `halls/nexus/{Scroll,Colophon,Trial,Epilogue}.*`（scenes.json 只追加） | C 维 100% 绑定；试墨干纸拒墨可见；键盘可达 | **2**（且五跋正文是 `NEEDS_LEIGE`，未到位则本波只交骨架 + 占位） |
| **W5** | 接线：`world-halls.json` / `hallPath` / `[slug].astro` 组件表 / `data-hall-theme` / `nexus-hall-gate.mjs` / `e2e/nexus-hall.spec.ts` / 海报脚本 / sitemap | **W5-agy**：Astro 静态站的 hall 路由与主题 token 作用域最佳实践；构建期确定性截图（Playwright + WebGL）的坑；SSIM 一致性门做法 | §3.3 文件 + `scripts/` + `e2e/` | 城里 E 进楼 → 纸厅到达条；机器门全绿；about-hall e2e 不回归 | 1 |
| **W6** | 全量 e2e 一次、批评者双评（盲审两段式）、PR、handoff | **W6-agy**：作为批评者之一（只看截帧/录屏） | `evidence/nexus-hall/W6/` | 人门三维 ≥7；e2e 全绿；A 维不被判「国风模板/流体玩具」 | **1** |

合计 ≈ **11 人日**（0.5+3+1.5+2+2+1+1）；MVP（W1a+W1b+W2+W3+**完整 W5**，题跋先放两篇）≈ **7 人日**。

🔴 原草案「MVP 4.5」是算术错误（W1+W2+W3 本身就是 4.5，隐含「最小 W5 = 0 人日」），而 W5 是接线与门——没有它页面不可达、门不跑、e2e 不执行，MVP 不成立。**W5 不可压缩。**

# 5. 节律与停门

- **节律**：读态 → agy 调研单（先派，它最慢）→ 执行方实装（不等 agy 空转，先做不依赖调研结论的骨架）→ 收 agy 稿并结合参考修 → xhsapi 反核 → 机器门 + Live 回读 → 更新 INDEX + LOOP-LOG。
- **有界停门**（不是节律）：连续 **3** 个 tick「最低分维度不变且该维无新一手实证」→ 该维停施工，只评分/审计，上抛磊哥拍板。
- **不空转**：派完 worker 立即继续下一步（起草下一单 / 亲自实装 / 跑门），**禁 poll output**。
- **采集腿与被测对象不共出口**：门/探针不健康时该项判「不可证」而**不是**判「失败」。

# 6. 硬禁区

1. **禁装饰性国风符号**：山水、竹、鹤、云纹、毛笔光标、宣纸贴图、书法字体、古琴 BGM、打字机效果、彩虹流体。墨只画数据，印是唯一装饰。
2. **禁不实**：不编年份、不编数字、不编 URL；每一句断言可追到文件；未溯源句删除。数字只从 ledger 渲染，**禁手写**。
3. **禁 `wheel + preventDefault`**、禁 `touchmove` 劫持。
4. **禁 import `src/lab/world/**`**、禁进 Lab manifest、禁 WebGPU、禁引 three/OGL、禁自定义 View Transition。
5. **参考口径（磊哥 2026-09-04 裁定，覆盖草案「许可未核」）**：inkwash 实查**无 LICENSE 文件**（agy W1r 一手核）。版权保护的是表达不是算法与物理——**可 clone、可逐文件读、可照其架构与参数初值自行实现**（Stam 1999 / GPU Gems ch.38 / Beer–Lambert 本就是公开数学）；只避免整段源码字面复制，用自己的组织形式写。PavelDoGreat 为 MIT，可直接借结构。
6. **禁客户/雇主信息入 ledger**：白名单准入（非匿名化），非白名单整条丢弃。
7. **禁假实时 / 输入框 / BYO key / 3D 吉祥物 / logo 墙 / 全绿门面 / 未脱敏会话**（N1 反面清单 12 条全收）。
8. 不加 `/world/agent-nexus/` 进 LHCI collect（第一刀）。

# 7. 重大决策（→ 董事会 ADR）

重大 = 改数据白名单或公开尺度 / 改 schema 版本语义 / 上调 JS 或载荷预算 / 触碰 `src/lab/world/**` / 进 LHCI collect / 改合流序 / 引入任何运行时第三方依赖。
**已拍死不重开**：暖白纸 + 紫墨；洇开门、墨流第二；五跋主题与顺序；墨分五色映射；试墨区要且不存 PNG；费用不展示；并行开干不等 about-hall。

# 8. NEEDS_LEIGE

| 项 | 为什么必须磊哥 | 建议 |
|---|---|---|
| **五跋正文与「迹」** | 是他的私有思考与真实翻车记录 | 每跋：题 ≤14 字 + 文 ≤200 字 + 1 条真实事件；worker 只可从 rule/receipt 起草并逐句标源 |
| **rule 文件公开尺度** | 私有思考 | 逐条批：仅标题 / 摘录 / 全文 |
| **数据白名单终审** | 涉客户/雇主 | 草案 §3.2 候选名单确认增删；`*-cli-codex` 探针目录是否算可公开素材 |
| **PR 合入 main** | 发布 | W6 |
| **合流序** | 与 about-hall 冲突面 | ADR-③ |

# 9. 停止与交接

停止条件：波次收口且机器门全绿 → 写 `evidence/nexus-hall/W<n>/` + 更新 INDEX + LOOP-LOG。交接走 `handoff` skill，落 `docs/handoffs/`。


## 附则 A（2026-09-04 加，glm 反核 W7 第 5 条落地）· 视觉派审前置字段
凡向 agy/任何席位派**视觉审计**，派单 brief 与流水账 R 条目**必须**带下面一行，缺项即退回不派：
`自看：<幕> · <截图绝对路径> · <一句判断：序号/留白/字压图/裁切 四选一或"无">`
理由：门验的是行为与数据，不验构图；「自己先看一遍」没有载体就是空话，下次必不触发。
