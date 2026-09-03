# 真实 Agent 素材盘点：什么能变成展品（Assets Inventory）

> **盘点基准**：基于 `/Users/wanglei/mywebsite` 真实工程历史（Phase 0 波次 W1–W4 + 提分 Loop L0–L2 + MERGE-WAVE 1–20 + 200+ PR 编排史）及本地多模型 Worker 调度体系，坚持「真比炫更炫」原则，所有数据与事件均可溯源至具体文件与 SHA。

---

## §1 素材清单表

| 素材名称 | 物理路径 | 类型 | 体量 | 信息密度 | 脱敏风险评估 | 展品潜力 |
|---------|---------|------|------|----------|------------|:-------:|
| **编排范式总纲** | `AGENTS.md` (§4) | 范式规范 | ~120 行 | **极高**（角色边界、五维硬门、门控链、降级规则） | 低（无敏感信息，公开代码库已发布） | **高** |
| **七段实战归纳手册** | `docs/research/cyber-city-orchestration-paradigm.md` | 范式手册 | 277 行 / 26KB | **极高**（W1–W4/L0–L2 八字段落盘、12 条已知坑、Task 任务书骨架） | 低（技术契约，无密钥） | **高** |
| **提分 Loop 唯一单源看板** | `docs/research/cyber-city-score-loop-orchestration.md` | 看板单源 | 443 行 / 130KB | **超极高**（20 轮 MERGE-WAVE、登记矩阵、断路记录、董事会终裁） | 中（含 PR 号、历史 commit SHA，需脱敏本机绝对路径 `/Users/wanglei/`） | **极高** |
| **云端交接与收工手记** | `docs/research/cc-loop-handoff-2026-08-28-stop.md`<br>`docs/research/cc-loop-handoff-2026-08-29-eod.md`<br>`docs/research/cc-loop-handoff-2026-09-01-2340-r2-controller-correction.md` | 交接手记 | 3 份 / 共 410+ 行 | **高**（停机根因 USAGE_BLOCKED、跑道纪律、R2 纠偏、未决指挥官件） | 中（含本地路径、会话 ID，需去除用户名与本地绝对路径） | **高** |
| **独立只读审计报告群** | `docs/research/cyber-city-loop2-a-audit.md`<br>`docs/research/cc-loop-audit-nav-c1.md`<br>`docs/research/loop8-fxn-r7-audit.md` 等 35 份 | 审计报告 | 35 份 / 每份 100–250 行 | **超极高**（逐项双证、独立复评、卡门理由、双向对照实验、破门归因） | 低-中（严谨的工程审计语言，仅需统一路径与 Git URL） | **极高** |
| **严格门禁证据目录** | `docs/research/cc-vis-x2-full-r2-evidence/`<br>`docs/research/exp01-evidence/`<br>`docs/research/cc-perf-spec-r1-evidence/` | 证据工件 | 28 文件 / 含 log、json、SHA256、截图 | **超极高**（1111 次 host 采样、exact tree 校验、e2e-summary.json、postflight vacuum） | 中（含 host fingerprint、PID，需规范化展示，去除私有环境变量） | **极高** |
| **真实 Worker 身份核验回执** | `~/.grok/state/api-direct-background/jobs/69b364c1-1cd2-4413-96db-7a79630fff03/receipt.json` | Worker 回执 | 37 行 JSON | **极高**（`served_model`, `identity_ok`, `fallback: null`, `process_group_reaped`） | 低（去掉 job_dir 本地用户名后完全可公开，模型与核验逻辑硬核） | **极高** |
| **多模型三路派单系统** | `~/.codex/state/cc-buildings-brainstorm/`<br>（`launch.py` + `prompts/` + `out/*/receipt.md` + `logs/`） | 派单实例 | 3 席位产物 / ~80KB | **极高**（Grok-4.6, GLM-5-3-flash, Gemini 3.1 Pro 真实混编与查阅回执） | 低-中（去除本地脚本路径，保留模型标识、阅读文件列表与交付回执） | **高** |
| **AI Lab 实战 Spike 文章** | `src/content/ai-lab/world-spike-parallel-agents.mdx` | 案例长文 | 94 行 MDX | **高**（灰盒纪律、参数表单一事实源、失败记录） | 零（已正式公开发布） | **中** |
| **视觉评分量表与基准图库** | `docs/research/cyber-city-visual-rubric.md`<br>`docs/research/assets/visual-rubric/*.webp` | 视觉基准 | 30+ 张固定机位图 / 视频 | **高**（七维锚点、帧优先打分、226 帧 MD5 录屏、L0–L8 同机位比对） | 零（纯视觉资产与规范） | **高** |

---

## §2 可量化的“战绩数字”（全部真实可核）

以下数据均从上述材料中精确提取，杜绝虚构：

1. **PR 编排吞吐量**：**213+ 个 PR**，演化出 **20 轮 MERGE-WAVE**（合并波次）。
   - *出处*：`cyber-city-score-loop-orchestration.md` L3（#211、#212、#213 连续收账记录及 MERGE-WAVE 20 表）。
2. **端到端自动化测试分母演进**：用例从 **48 例 → 52 例 → 81 例 → 82 例 → 84 例 → 86 例**（覆盖 19 个 spec 文件）。
   - *出处*：`cyber-city-orchestration-paradigm.md` L74 (48例)、L113 (52例)；`cc-loop-handoff-2026-08-28-stop.md` L71 (83例)；`cc-loop-audit-nav-c1.md` L27 (84例)；`cc-vis-x2-full-r2-evidence/run-receipt.md` L50 (`Total: 86 tests in 19 files`)。
3. **独立审计与仲裁文档数**：仓库现存 **35 份独立审计报告**（`*audit*.md`），覆盖架构、视觉、功能、音频、导航与性能。
   - *出处*：`docs/research/` 目录下实际存在的 35 个 `*audit*.md` 文件。
4. **硬门驳回（NO_GO / BROKEN_GATE / 卡门）实证记录**：
   - **Loop 2 AL2-a 视觉卡门**：自评 62 分，审计独立打分 60 分，以 `60 < 62` 判定硬门未达，**坚决不放行 Tier B**，开辟 a-plus 定向补洞段。
     - *出处*：`cyber-city-loop2-a-audit.md` L11–L22。
   - **#177 BGM-C1 R2 资格破门**：测试结果 6/6 全绿，但因运行期外部 headless 进程重叠 3m57s、未留存 pipefail 原始字节，独立审计裁决 **`NO_GO / BROKEN_GATE / RESULT_PASS_BUT_QUALIFICATION_FAIL`**（结果绿 ≠ 资格绿，禁止放行）。
     - *出处*：`cyber-city-score-loop-orchestration.md` L61。
   - **#185 PERF-SPEC R1 资格破门**：86/86 全量通过，但 host monitor 检出 40 个外部 Playwright headless 进程，裁决 `NO_GO / RESULT_PASS_BUT_QUALIFICATION_FAIL`，禁止重跑刷绿。
     - *出处*：`cyber-city-score-loop-orchestration.md` L30。
   - **#166 NAV-C1 HUD 按钮重叠破门**：小地图按钮（top:1rem, right:1.15rem）与静音按钮（top:0.85rem, right:0.95rem）重叠，Playwright hit-target 拦截报错，审计判定真回归，下达 `fix-forward` 禁天然合并令。
     - *出处*：`cc-loop-audit-nav-c1.md` L16。
   - **#104 CC-VIS-X2 R2 泊车腿破门**：72 passed / 1 failed / 13 did not run，CITY-OBS-01 泊车位超时（坐标停在 1.3, -2.1），裁决 `RESULT_FAIL / NO_GO / HOLD_DRAFT`，**没有第三跑，不合入**。
     - *出处*：`cc-vis-x2-full-r2-evidence/e2e-summary.json` L8–L13、`cyber-city-score-loop-orchestration.md` L3。
5. **异构模型调度席位**：
   - 生产编排与子代理体系涵盖：**Claude Fable 5 (xhigh)**、**GPT-5.6 Sol (xhigh-fast)**、**Composer 2.5**、**Opus 5 medium**；
   - 本地直跑与专项 worker 涵盖：**Grok-4.6**、**GLM-5-3-flash**、**Gemini 3.1 Pro (High)**、**Gemini 3.7 Flash**。
   - *出处*：`AGENTS.md` §2/§4.1；`cc-buildings-brainstorm/out/*/receipt.md`；`receipt.json`。
6. **Worker 身份硬核验条目**：每份 receipt 包含 **8 项确定性字段**：`served_model`、`identity_ok: true`、`identity_match: exact`、`fallback: null`、`process_group_reaped: true`、`http_code: 200`、`exit_code: 0`、`max_tokens_sent: 131072`。
   - *出处*：`~/.grok/state/api-direct-background/jobs/69b364c1-1cd2-4413-96db-7a79630fff03/receipt.json`。
7. **多模型派单实测吞吐（2026-09-02 三路实例）**：
   - GLM-5-3-flash (Content)：耗时 **642.8s (~10.7 min)**，输入上下文挂载 12 个核心文档，产出 20,980 字节。
   - Grok-4.6 (Tech)：阅读 45+16 个源码/契约文件，产出 33,463 字节可行性论证。
   - Gemini 3.1 Pro (Vis)：查阅 7 份规划与渲染海报，产出 20,181 字节视觉提案。
   - *出处*：`cc-buildings-brainstorm/launch.py`、`out/content/receipt.json`、`out/tech/receipt.md`、`out/vis/receipt.md`。
8. **自动化跑道环境治理指标**：
   - 连续单轮 **1111 次主机采样**（5.0s 间隔，全过程 5663.48 秒 ~1.6 小时），检出外部自动化进程 `EXTERNAL_MATCH_COUNT=0`。
   - 专用隔离端口序列：`4441 → 4451 → 4481 → 4491 → 4561 → 4571 → 4581 → 4585 → 4587`（严禁复用 4321）。
   - 磁盘垃圾回收：`6.1GB → 2.3GB`（释放 62% 空间）。
   - *出处*：`cc-vis-x2-full-r2-evidence/run-receipt.md`、`cyber-city-score-loop-orchestration.md` L123。
9. **五维登记矩阵终值**：
   - 北极星指标：**98 / 98 / 90 / 85**
   - 生产实际登记：**80 / 73 / 87 / —**（综合 80 / 视觉 73 / 功能 87 / 性能未上真机严守 `—`，严禁口头声明分冒登）。
   - *出处*：`cyber-city-score-loop-orchestration.md` L133–L141。

---

## §3 三个基于真实数据的展项概念

### 展项 1：【NO_GO 黑匣子 · 真实断路与严酷法庭】（The NO_GO Blackbox & Sovereign Audit）

- **一句话概念**：
  > 告别虚假完美的 AI Demo，沉浸式回放 200+ PR 中 AI 如何被 0/0/0 硬门拦截、因 1 个外部进程被取消成绩、因 10px 按钮重叠被铁面打回的真实工程法庭。
- **为什么“真”比“炫”更炫**：
  市面所有展示都在吹嘘“一句话生成完整系统”，而工业界最痛的是“AI 写的代码没人敢合入”。本展项亮出最硬核的底牌：**结果全绿但资格破门（`RESULT_PASS_BUT_QUALIFICATION_FAIL`）**、**自评 62 独立打分 60 拒绝放行**。这种对质量门禁的敬畏与严酷机制，比任何浮夸的特效更能赢得技术决策者与工程总监的信任。
- **首屏 10 秒体验**：
  暗紫霓虹与警示红交织的“飞行数据黑匣子”界面。中央是一枚跳动着真实 SHA 的 **鲜红 `NO_GO` 实体印章**，周围环绕着 `86/86 PASS BUT DISQUALIFIED`、`FAIL: (28,-28) unreachable`、`INTERCEPTED: Minimap overlaps Mute` 等高危事件流。
- **30 秒交互路径**：
  1. **0–10s 选事故**：访客在时间轴上点击三大著名惨案之一（例如 `#177 外部进程污染资格破门`、`#166 HUD 双钮重叠`、`#104 泊车腿超时`）。
  2. **10–20s 看证据**：展开真实的 `e2e-summary.json`、1111 次 host monitor 采样波形图，以及失败瞬间的现场截图与 trace。
  3. **20–30s 查裁决与纠偏**：点击查看审计员驳回报告原文（如 `cyber-city-loop2-a-audit.md` 中的“复评门未达，不因门线改秤”），并可一键对比后续定向补洞 PR（Fix-Forward）最终全绿过门的对比 Diff。
- **使用的具体素材文件与转换方式**：
  - `cc-vis-x2-full-r2-evidence/`（`e2e-summary.json`, `run-receipt.md`, `host-monitor-summary.json`）→ 转换为交互式黑匣子仪表盘 JSON 数据。
  - `cyber-city-loop2-a-audit.md`、`cc-loop-audit-nav-c1.md` → 转换为高亮法庭判词与审计裁决卡。
  - `test-failed-1.png` → 转换为事故现场截图查看器。
- **脱敏处理清单**：
  - 路径中 `/Users/wanglei/` 统一转换为标准虚拟路径 `/workspace/` 或 `~/`。
  - 主机指纹中隐藏具体内网 IP 与物理序列号，保留 `Darwin arm64` 与 macOS 规范版本。
- **静态实现复杂度**：**M（中）**（静态 JSON 驱动的组件状态切换，SVG 波形图，纯客户端零请求）。

---

### 展项 2：【异构模型指挥调度台 · 验签与流水线】（The Multi-Model Orchestration Console）

- **一句话概念**：
  > 真实还原基于 Grok-4.6、GLM-5-3-flash、Gemini 3.1 Pro、Claude Fable 5 等多模型席位的混编直跑流水线与不可伪造的身份核验回执卡。
- **为什么“真”比“炫”更炫**：
  拒绝单模型套壳，展示真正的**异构多模型混编实战**——不同模型根据擅长领域分别承包「技术可行性论证（Grok）」、「内容方案与规划（GLM）」、「视觉海报推演（Gemini）」与「独立审计放行（Fable/Sol）」。每份输出附带 SHA-256、Token 数与 `identity_match: exact` 验签，展示极致的工程确定性。
- **首屏 10 秒体验**：
  技术编辑部风格的 3D/2.5D 拓扑调度台。一道命令发出后，三条并行光路分别注入 3 个模型席位节点，节点即时吐出各自的实时处理状态、Token 计数器与耗时计时器（如 `GLM: 642s / Grok: 45 files / Gemini: Pro High`）。
- **30 秒交互路径**：
  1. **0–10s 选批次**：访客切换「2026-09-02 今日三路派单」或历史波次。
  2. **10–20s 验回执**：点击任一席位卡片，翻转展示该 Worker 的 `receipt.json`，高亮校验项（`identity_ok: true`, `fallback: null`, `process_group_reaped: true`）。
  3. **20–30s 对比成果**：三栏分屏查看三模型针对同一目标的差异化成果（Content 方案 20KB vs Tech 深度代码研判 33KB vs Vis 视觉 20KB），并展示任务书（Prompt）与产物的契约对齐。
- **使用的具体素材文件与转换方式**：
  - `~/.grok/state/api-direct-background/jobs/.../receipt.json` → 转换为标准化「Worker 身份验签徽章」。
  - `~/.codex/state/cc-buildings-brainstorm/`（`launch.py`, `prompts/`, `out/*/receipt.md`）→ 转换为多模型任务书与交付物联动视图。
- **脱敏处理清单**：
  - 隐藏本地 API 调度脚本的绝对路径及账号内部 ID（如 `--acct coding` 转化为标准席位标签）。
  - 脱敏具体 token 计费金额（保留 Token 数量与耗时）。
- **静态实现复杂度**：**S（小）**（纯静态卡片、Diff 视图与 JSON 高亮器，轻量快速）。

---

### 展项 3：【五维提分天梯 · 200+ PR 赛博全息演进史】（The 200-PR Ledger & Score Ascent）

- **一句话概念**：
  > 基于看板单源（Score Loop Orchestration）的 20 轮 MERGE-WAVE，重现一座 3D 赛博朋克城市从 48 分粗糙骨架迈向 87 分生产级的可交互全息演进瀑布流。
- **为什么“真”比“炫”更炫**：
  很多 3D 网页只展示最终静态结果，访客不知道背后的工程厚度。本展项把 **200+ 个 PR、20 轮合流波次、5 次分母跃迁（48→86）** 以及 **五维打分矩阵（80/73/87/—）** 完整铺开。每一分都有固定机位前后帧对照（Before/After），性能未测就诚实写 `—`，把严谨工程做成史诗级视觉叙事。
- **首屏 10 秒体验**：
  屏幕左侧是纵向贯通的 20 轮 MERGE-WAVE 时间瀑布，右侧是五维雷达图与「北极星 98 vs 生产 80/73/87/—」动态刻度表。中央是城市 3D/WebP 视窗，随着时间流动自动播放从 L0 灰盒到 L8 霓虹的蜕变。
- **30 秒交互路径**：
  1. **0–10s 拖动时间轴**：访客拖动滑块从 W1（2026-08-25）滑向 W20（2026-09-01），看到 PR 计数器从 #1 飙升至 #213，e2e 分母从 48 跃升至 86。
  2. **10–20s 点击关键战役**：点击特定波次（如 `W1 物理选型`、`L2 变形动效录屏`、`W18 BGM 纯合成落地`），视窗即刻展示该波次的代码落点、固定机位对比图（如 `l1-world-robot` vs `l2-world-robot`）。
  3. **20–30s 查验单源打分**：点击右上角分数，展开 `scripts/score-loop.mjs` 的五维权重公式（25/15/20/25/15）以及每一维度的独立审计扣分判据（如“湿反射仅右缘增强扣2分”、“性能缺真机数据维持破折号”）。
- **使用的具体素材文件与转换方式**：
  - `cyber-city-score-loop-orchestration.md`（顶部收账块、MERGE-WAVE 1–20 表、登记矩阵）→ 结构化解析为时间轴 JSON。
  - `docs/research/assets/visual-rubric/*.webp` 与 `l2-transform-seq.mp4` → 提取为各阶段的前后对比画廊。
  - `cyber-city-orchestration-paradigm.md` → 转换为各阶段的八字段卡片。
- **脱敏处理清单**：
  - PR 链接与 Commit SHA 全部保持真实（公开 GitHub 仓库 `rayw-lab/website` 真实可查）。
  - 去除仅限作者本地环境的私有环境变量命名。
- **静态实现复杂度**：**M（中）**（Canvas/SVG 走势图 + 前后帧对比滑块，资源走 WebP 压缩控制在 200KB 预算内）。

---

## §4 五幕叙事骨架（The 5-Act Orchestration Saga）

把「多智能体工程化协作」提炼为 5 幕具有戏剧张力、且**幕幕有真实文件对应**的叙事体系：

```mermaid
journey
    title Multi-Agent 5-Act Orchestration Journey
    section Act 1: 编排
      父代理划定文件域与硬门: 5: 父代理
    section Act 2: 并行
      多子代理按契约并发开发: 4: 子代理集群
    section Act 3: 审计门
      独立审计员 fresh 取证裁决: 5: 独立审计员
    section Act 4: 纠偏
      撞车/破门 -> 定向补洞 PR 栈: 2: 审计员 / 修复子代理
    section Act 5: 终裁
      董事会介入终裁与跑道立法: 5: 董事会 / 指挥官
```

### 第一幕：父代理执棒 · 任务书与边界划分（The Orchestrator's Baton）
- **叙事核心**：**父代理只编排，不写业务代码**。一切始于严密的任务书——划定文件域、指定比较基线、声明禁止事项、定死 0/0/0 硬门。
- **真实事件**：Phase 0 波 1（W1）编排，父代理将整个 3D 城市切分为互斥的 4 个工程 Task（E1 物理车、E3 程序化城市、E5 机器人、E10 e2e 测试骨架）并行派发。
- **对应真实文件**：`docs/research/cyber-city-orchestration-paradigm.md`（§0 总则与 §4.2 任务书骨架）。

### 第二幕：群蜂出巢 · 契约锁死与灰盒并行（Swarm & Single-Source Contract）
- **叙事核心**：并行开发不失控的关键是**单一事实源契约**。只要参数表与类型接口锁死，子代理在各自隔离的分支中可以最大化自由发挥，自动化回归代替人工试玩。
- **真实事件**：双代理 WebGPU 试验场 Spike 验证——两代理分别承包物理引擎与车辆控制，手写 270 行运动学控制器，省去 Wasm 代价，验证周期缩减 ~70%；以及今日三模型（GLM / Grok / Gemini）并行产出 74KB 架构论证。
- **对应真实文件**：`src/content/ai-lab/world-spike-parallel-agents.mdx`、`~/.codex/state/cc-buildings-brainstorm/launch.py`。

### 第三幕：铁面法官 · 独立审计与鲜活取证（The Sovereign Gatekeeper）
- **叙事核心**：**实现与审计严格分离**。审计子代理必须零业务代码、独立分支、自建集成树、fresh 重跑全量测试，双评容差只验自评合理性，过门永远用审计独立分。
- **真实事件**：Loop 2 AL2-a 审计中，实现方自评 62 分，审计员 Sol 沿用 Rubric 打出 60 分，面对“差 2 分即可放行”的诱惑，坚决下达 `不放行 Tier B` 裁决，守住质量底线。
- **对应真实文件**：`docs/research/cyber-city-loop2-a-audit.md`。

### 第四幕：撞车与熔断 · 文本零冲突 ≠ 语义零冲突（NO_GO & Precision Triage）
- **叙事核心**：Git 的 Merge Clean 往往掩盖了运行时的致命冲突。门被击碎时，不降门、不硬闯、不推倒重来，而是开辟定向补洞 PR 栈（Fix-Forward）。
- **真实事件**：#166 小地图分支合入 main 时 Git 文本零冲突，但在 84 例全量 e2e 运行时，因 HUD 按钮在右上方与静音按钮重叠 10px 导致真实点击拦截超时；以及 #177 结果 6/6 全过但因 3m57s 外部进程重叠被判资格破门。
- **对应真实文件**：`docs/research/cc-loop-audit-nav-c1.md`、`docs/research/cc-vis-x2-full-r2-evidence/`、`cyber-city-score-loop-orchestration.md`（L61）。

### 第五幕：终裁与立法 · 董事会急裁与跑道治理（Board Verdict & Runway Governance）
- **叙事核心**：当出现跨 VM 制度性断路或多角色争抢跑道时，触发「董事会事后顾问」，下达具有最高权威的书面终裁，推进跑道互斥令、心跳生命征象立法与站立授权规程。
- **真实事件**：董事会 R1/R3 终裁（CC-LOOP-BOARD-ADVISOR-R1/R3）——解决双 ENV 物理断路、终止死循环 TRIAGE、建立同机强制令（`IGNITION-runN.txt` 原件唯一性）、确立 docs-only 站立授权与 1111 次连续采样真空跑道规程。
- **对应真实文件**：`docs/research/cc-loop-board-advisor-r1.md`、`docs/research/cyber-city-score-loop-orchestration.md`（L109–L194）。

---

## §5 缺什么：为了做展品还需要补录/补采的数据

为了将上述素材完美转化为 GitHub Pages 上的高性能互动展品，需要提前补齐以下数据与工件准备：

1. **结构化 JSON 数据集抽取（Data Serialization）**：
   - *现状*：看板、交接档与审计报告均为 Markdown 文本。
   - *需补采*：编写一个轻量离线抽取脚本，将 `cyber-city-score-loop-orchestration.md` 中的 MERGE-WAVE 1–20 表、213 个 PR 的状态变迁、以及 5 阶段分母变化（48→86）提取为单份紧凑的 `orchestration-history.json`（<30KB），作为展项 1 与展项 3 的底层驱动数据。
2. **多模型 Worker 身份核验样例库（Receipt Fixtures）**：
   - *现状*：当前 `receipt.json` 散落在 `~/.grok/` 和 `~/.codex/` 等本地隐藏路径。
   - *需补采*：提取并脱敏 3~5 份代表性真实回执（涵盖 Grok、GLM、Gemini、Claude），固化为静态展品测试夹具 `src/data/agent-receipts-fixtures.json`。
3. **视觉前后对比切片轻量化（Visual Asset Optimization）**：
   - *现状*：`assets/visual-rubric/` 中的原始截图与 9.4s MP4 视频体积较大（单个几百 KB 到数 MB）。
   - *需补采*：为展项 3 生成一套固定机位的 800px 紧凑型 WebP 对比缩略图（单图 <30KB）及 3 秒 WebM 动效切片，确保在不违背 Lighthouse 性能预算（首页传输体积 <200KB / 重交互模块预算）的前提下秒开。
4. **关键失败事件的 Trace 与录屏切片（Failure Artifact Clips）**：
   - *现状*：`test-failed-1.png` 与日志已在 `cc-vis-x2-full-r2-evidence/`，但缺少交互动画高亮框。
   - *需补采*：针对“按钮重叠”和“泊车位未达”生成带坐标标注框的 SVG 叠加层数据，直观展示失败原因。
