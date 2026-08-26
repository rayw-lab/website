# Cyber City 编排范式手册（父代理决策范式 · 七段实战归纳）

| 项 | 内容 |
|----|------|
| 消费方 | **父代理（编排者）**——后续 Loop 开拍前必读；实现/审计子代理按 §4 模板接收任务书 |
| 归纳对象 | Phase 0 波次 W1–W4 + 提分 Loop L0–L2 共七段实战（2026-08-25 ~ 08-26，`main@76950e7` 时点） |
| 精华版 | `AGENTS.md`「提分 Loop 编排范式（Cyber City Score Loop）」小节（≤80 行，供子代理快速对齐） |
| 单源看板 | 提分 Loop 状态唯一登记处 = `cyber-city-score-loop-orchestration.md`；Phase 0 波次历史看板 = `cyber-city-eng-orchestration.md` |
| 依据材料 | `cyber-city-wave1/2/3-audit.md` · `cyber-city-phase0-full-audit.md` · `cyber-city-loop0/1/2-audit.md` · `cyber-city-loop2-a-audit.md` · `cyber-city-loop2-a-plus-audit.md` · `cyber-city-test-framework.md` · `cyber-city-visual-rubric.md` §4 |

---

## 0. 总则（一句话范式）

**父代理只编排：写任务书、划文件域、裁决串并行与 PR 形态、派发实现与审计、按审计裁决合并、维护单源看板；一切业务代码由实现子代理产出，一切放行由独立审计子代理裁决，父代理不自评分数、不替审计打分、不在门未过时扩批。**

## 1. 角色与模型

### 1.1 父代理做什么 / 不做什么

| 做 | 不做 |
|----|------|
| 写 Task prompt（含必读材料、文件域、硬门、取证清单、禁止事项） | 写业务代码（直改白名单仅限文档/注释/≤10 行非业务改动，见 AGENTS.md §2.1） |
| 裁决批次边界：哪些项进本段、哪些显式后置（如 B3/B5 后置） | 执行中扩批、把「后置项」偷偷并入当前 PR |
| 裁决串并行与 PR 形态（单 PR / PR 栈 / 并行 Task 数） | 替审计员打分、用自评分代替审计分过专项门 |
| 按审计放行结论 + 指定顺序/解法执行合并（波次期须按 M* 解法，禁止天然合并） | 在审计未放行时合并；静默降级模型 |
| 维护单源看板（分支/PR/Agent 链接/状态/分数），每段收口即更新 | 在多处重复登记状态（看板漂移） |
| 把 AL*/A* 审计的「下轮建议」§ 登记为下一段的进入条件 | 忽略审计交棒项、下轮任务书不引用上轮审计 |

### 1.2 模型 slug 表

| 角色 | model slug | 备注 |
|------|-----------|------|
| 父代理（编排） | 产品/账号设置决定 | 不受本表限制（AGENTS.md §1） |
| 实现子代理（Fable5） | `claude-fable-5-thinking-xhigh` | W1–W7 全部实现 Task 实战验证 |
| 审计子代理（Sol） | `gpt-5.6-sol-xhigh-fast` | **L0 起为审计标准配置**（异族模型，避免同族自证偏差） |
| （历史）波次审计 | `claude-fable-5-thinking-xhigh` | W1–W4 的 CC-A1~A4 由 Fable5 独立 Task 承担；L0 起已切换为 Sol，新 Loop 不再沿用 |

降级遵循 AGENTS.md §3 明示降级规则；子代理回复第一行自报实际 slug。

## 2. 七段实战范式（W1–W4 + L0–L2）

每段按固定八字段落盘：**父代理动作 / 实现 / 审计 / 串并行 / 分支·PR / 测试取证 / 放行门 / 已知坑**。

### W1 — Phase 0 波 1：并行工程 Task + 波末审计

| 字段 | 实战内容 |
|------|---------|
| 父代理动作 | 拆 4 个文件域互斥的工程 Task（E1 物理车 / E3 程序化城 / E5 机器人 / E10 e2e 骨架）并行派发；波末派审计；按审计建议顺序（E1→E3→E5→E10）合入设计基线；把 M1–M4 交接项写进波 2 任务书 |
| 实现 | Fable5 ×4，各自 draft PR（#16/#14/#17/#15），base = 设计基线 `cursor/cyber-city-hero-design-1d6f` |
| 审计 | CC-A1（`cyber-city-wave1-audit.md`）：逐分支 diff、逐分支 check/build 独立复现、**detached HEAD 试合并预演**（不污染任何分支）、合流树全量门禁 + 运行时冒烟、联网核对资产许可。裁决：放行 + M1–M4 合流执行项 |
| 串并行 | 波内 4 Task 全并行（文件域可划分）；审计串行在波末 |
| 分支·PR | 分支 `cursor/cc-e*-1d6f`；波次期 base = 设计基线分支而非 main（集成分支模式）；PR 均 draft，合并由父代理按序执行 |
| 测试取证 | 每分支 `astro check`/`build` 复现；合流树预算/链接/e2e/冒烟；许可证联网核证 |
| 放行门 | 工程门禁（红线依赖零命中、预算全在限、e2e 存量零回归、验收可复现）；此期无综合分 |
| 已知坑 | **文件域漏划共享挂载入口**（`src/lab/world/index.ts` 未划给任何 Task → 三分支同改一文件；编排疏漏而非执行违规）。教训：共享入口文件必须显式划归某一 Task 或声明「多方最小接线」 |

### W2 — Phase 0 波 2：spike 退役 / 霓虹 / 变形

| 字段 | 实战内容 |
|------|---------|
| 父代理动作 | 3 Task 并行（E2 spike 退役 ∥ E4 霓虹 Quality ∥ E6 Transform+Reveal）；审计判「有条件放行」后**严格按 M5–M8 解法合并，禁止天然合并** |
| 实现 | Fable5 ×3，draft PR #21/#20/#19，base = 波 1 合流后的设计基线 |
| 审计 | CC-A2：`git merge-tree` + 独立 worktree 试合并，**发现两类文本零冲突的语义破坏**——死锁对（E2 mount 等 `revealed` × E6 `autoReveal=false` 永不触发）与静默掐断（E2 参数白名单无声吞掉 E6 的 `?ritual=1`）；逐一预演解出后合流树全绿 |
| 串并行 | 3 并行；两 Task 竞写同文件（`index.ts`/`Player.ts`）已被编排层预判并在审计中解出 |
| 分支·PR | 同 W1；合并顺序 E2→E4→E6 由审计指定 |
| 测试取证 | 合流树全量 e2e 48 用例 + 运行时冒烟（`?ritual=1` 全流程 / 三档画质 / reduced-motion / 默认路径零字节） |
| 放行门 | 有条件放行 = 条件必须可执行、可验证（M5–M8 附解法全文）；满足后下波才开工 |
| 已知坑 | **文本零冲突 ≠ 语义零冲突**。并行 Task 涉及同一运行时链路时，波末审计必须做试合并 + 合流树运行时冒烟，不能只看 diff |

### W3 — Phase 0 波 3：CI 门禁 + POI 十二楼

| 字段 | 实战内容 |
|------|---------|
| 父代理动作 | 2 Task 并行（E8 CI 门禁日切 ∥ E9 POI 先遣）；E9 依赖波 2 合入后解锁，E8 无硬依赖先行——**依赖关系在派发前显式裁决** |
| 实现 | Fable5 ×2，draft PR #23/#24 |
| 审计 | CC-A3：diff 双向核对 + **可疑视觉现象做几何独立复核 + 运行时截图对照**（voice-pod 黑菱形根因）+ LHCI assertMatrix 空匹配双向复验 + 试合并全量回归。放行 + §6 八项必带交棒 E7 |
| 串并行 | 2 并行；E8 的 manifest 注册项被裁决「须与 E7 同 PR 生效」——跨波耦合点提前锁定 |
| 分支·PR | 同波次纪律 |
| 测试取证 | `?poi=` 深链出生 / E 键进站直跳 / 无效 slug 兜底 / 默认路径零 areas 字节 |
| 放行门 | 同 W1 工程门禁；审计交棒项编号化（八项必带），下波任务书逐条销账 |
| 已知坑 | **PR 链接写错仓库名**：wave3 审计文档把 PR 链到 `rayw-lab/mywebsite`（正确 `rayw-lab/website`）。链接必须用 `gh pr view --json url` 实际输出，禁止手拼 |

### W4 — Phase 0 波 4：E7 世界壳 + /home 平移 + A4 终审

| 字段 | 实战内容 |
|------|---------|
| 父代理动作 | **动用户可见面的路由切换 = 单 Task 原子化**（E7 独占，不与他事并批）；随后派全量终审 A4；终审出的 M11/M12 缺口再派专项 gates Task 清账；全部兑现后以**单 merge PR** 原子合入 main（79 提交一个回滚单元） |
| 实现 | Fable5（E7、M11/M12 gates 各一 Task） |
| 审计 | CC-A4（`cyber-city-phase0-full-audit.md`）：从零到 tip 全量十维审计——全部门禁独立复跑 + 历史裁决（M1–M10、观察①–⑧）逐条在 tip 复核 + 交棒项逐条销账 + 冒烟截图工件。裁决：有条件放行，条件 M11（ESC 出口缺失）/M12（人工走查表空）**不可静默缺席**，允许「实现补齐」或「产品负责人显式豁免留痕」二选一 |
| 串并行 | 单 Task 串行；终审串行；gates 清账串行 |
| 分支·PR | E7 base = 设计基线；M11/M12 gates base = E7 分支（栈式，因为清的是 E7 终审条件）；合 main 用单 merge PR |
| 测试取证 | e2e 48 全量 + LHCI 7 URL×3 全量断言 + 四场景运行时冒烟 + 红线正则扫描 + 资产台账三层核对 |
| 放行门 | 全量门禁绿 + 历史裁决全部成立 + 条件显式清账（实现或豁免留痕，禁止空表合并） |
| 已知坑 | 冒烟计时读数是 SwiftShader 慢动作墙钟（robot_idle 55.6s 等），**真机计时门禁归 human-gate 走查表，CI 侧只做状态序 + 采集留档** |

### L0 — 提分 Loop 0：三 Task 并行（setup / baseline / visual）+ AL0

| 字段 | 实战内容 |
|------|---------|
| 父代理动作 | 开提分 Loop 前先补齐**三件基建**并行：测试框架（CC-L0-setup）、基线分登记（CC-L0-baseline）、视觉 rubric（CC-L0-visual）；三者交付物正交（脚本/分数/量表），是**并行例外的合法场景**；随后首次派 Sol 审计 |
| 实现 | Fable5 ×3；setup base = main，baseline 与 visual base = setup 分支（半栈：两者都消费测试框架） |
| 审计 | **CC-AL0（Sol，`gpt-5.6-sol-xhigh-fast`）首次登场**：复核五维口径三处一致、基线可复现（fresh install 实跑全链）、rubric 锚点合理性核查（联网核对 Awwwards 口径）、**视觉独立复评**（49 vs 合议 51，Δ2 ≤5 通过）。有条件放行（条件不改分数：合并树选择、原始工件长期留存） |
| 串并行 | 3 并行（Loop 中唯一的多 Task 并行先例）；审计串行 |
| 分支·PR | `cursor/cc-l0-*-1d6f`；PR #29（base main）+ #30（base setup 分支）；**PR #30 曾 `mergeStateStatus=DIRTY`**，审计指定采用 baseline 分支已验证的合并树落地 |
| 测试取证 | `pnpm quality:loop:full` 全链（build + e2e 52 + LHCI + score）；视觉双评合议（Pass A 帧优先 13 项 × Pass B 七维锚点）；证据帧入库 `assets/visual-rubric/` |
| 放行门 | 综合分口径首次生效：五维权重 25/15/20/25/15；基线 87.2 登记；`availableWeight===1` 且 `missing=[]` 自此为发布硬条件 |
| 已知坑 | ① **SwiftShader LHCI null**：本 VM 无 GPU 时 performance/BP 分类可能全轮 null → 改用同运行树 green CI 的 `lighthouse-results` artifact 回填（`gh run download` + `--lhci-dir`），登记「LHCI 来源：CI artifact @ commit <sha>」；② **JSON import Node22**：Node 22 ESM 下 `import ... from '*.json'` 必须带 `with { type: 'json' }` 否则 Playwright 报「No tests found」；合并冲突时统一保留 `readFileSync` 方案；③ CI artifact 有 90 天保留期，基线登记须固化 digest 并计划转存 |

### L1 — 提分 Loop 1：单聚焦 Tier A improve + AL1

| 字段 | 实战内容 |
|------|---------|
| 父代理动作 | **提分批次默认形态 = 单 PR 聚焦**：只开一个视觉 improve Task，范围 = 上轮审计 §6 Tier A 清单（五项），不并入 Tier B/C；完成后派 Sol 审计 |
| 实现 | Fable5，PR #32，base = main；五项每项「代码落点 + 帧证据」双证登记 |
| 审计 | CC-AL1（Sol）：逐项落地核验（允许「✅ 有折扣」——接线真实但帧内效果未满时只扣视觉分，不判虚报）、独立视觉复评（57 vs 自评 59，Δ2 通过）、exact tree 全量 e2e + 当轮 CI LHR 复算综合分（89.2；代入独立分 88.7 双口径都过 85）。放行 + Loop 2 三段式建议 + 进入条件 |
| 串并行 | 全程串行 |
| 分支·PR | 单分支单 PR；e2e/测试配置/门槛/workflow **零差异**是审计首查项（防「改测试凑绿」） |
| 测试取证 | 固定机位前后帧对照（L0 帧 vs L1 帧 vs 审计 fresh 帧）；帧优先打分 |
| 放行门 | e2e 52/52、LHCI 两 URL 逐项不降、`availableWeight===1`、双评 \|Δ\|≤5、综合 ≥85 |
| 已知坑 | 视觉自评容易乐观 2 分左右（59 vs 57、62 vs 60、65 vs 64 三轮皆然）——父代理排期时按「独立分 ≈ 自评 −2」估计水位，**不要按自评分承诺目标** |

### L2 — 提分 Loop 2：分段门控链（a-tail → 卡门 → a-plus → Tier B → 终审）

| 字段 | 实战内容 |
|------|---------|
| 父代理动作 | 执行 AL1 的三段式：先收 A 尾件（a-tail）→ 复评门 → Tier B。**AL2-a 卡门（独立 60 < 门 62）时不推倒重来、不降门、不硬闯**：开一个**定向补洞段**（a-plus，只做审计点名的两个缺口），过门后才解锁 Tier B；Tier B 完成后派全量终审 AL2 |
| 实现 | Fable5 ×3：a-tail（PR #33，base main）→ a-plus（PR #34，**base = a-tail 分支，PR 栈**）→ Tier B（PR #35，base = a-plus tip） |
| 审计 | Sol ×3：AL2-a（不放行，`loop2-a-audit.md`）→ AL2-a-plus（62 过门，放行受控 Tier B，`loop2-a-plus-audit.md`）→ AL2 终审（独立 64、综合 91.0，放行但**拒收「~70 档」宣称**，`loop2-audit.md`） |
| 串并行 | 严格串行门控链：每段一实现一审计，门不过不进下段 |
| 分支·PR | **PR 栈合法场景 = 补洞段必须叠在未合入前段之上**；代价见已知坑。扩批禁令：B3/B5 全程后置，审计逐轮确认「未越界混入」 |
| 测试取证 | 新增 **5–10s 固定脚本录屏**作 V5 动态证据（226 帧逐帧哈希验连续性，SHA-256 登记）；同机位前后帧对照；审计 fresh 帧复核 |
| 放行门 | 综合门（≥85）之外首次出现**专项门（视觉审计分 ≥62）**：双评 \|Δ\|≤5 只检验自评合理性，**过门用审计分**——60 与 62 之差就是卡门与放行之差；综合分 90.5 不能覆盖专项门缺口 |
| 已知坑 | ① **PR 栈 diff 假象**：main 推进（含审计报告合入）后，栈上 PR 相对 main 的原始 diff 会显示「删除」不存在的回退——AL2 须先自建「候选 ⊕ main」集成树（`b01ebf6`）再审真实合入面；② **e2e 墙钟成本**：全量 52 例 ~17–23 分钟/轮，门控链每段实现+审计各跑一轮 → 派发时长与 VM 预算按此排；③ 9.4s 录屏是 118.8s SwiftShader 墙钟的变长加速版，只证编舞连续性，不证真机时序/帧率；④ **poster 三面同源漂移**：Tier B 后未重拍 poster → 静态壳/移动端/OG 落后于运行时画面（AL2 保留项），铁律「poster 重拍永远排所在批次最后」必须真的排进批次 |

## 3. 横切纪律（七段提炼）

### 3.1 串并行决策

- **默认串行**。并行当且仅当：交付物正交（文件域可划分/互不依赖），且属「工程铺面」（波次多 Epic）或「基建三件套」（L0 型）场景。
- **提分（视觉调参）永远单 PR 串行**：归因依赖固定机位前后帧对照，多 PR 并行会破坏归因。
- 审计永远串行在段末；审计未出结论前不派下段实现。
- 并行 Task 涉及同一运行时链路时，波末审计必须含试合并 + 合流树运行时冒烟（W2 教训）。

### 3.2 分支与 PR 纪律

- 分支名 `cursor/cc-<段id>-1d6f`；实现分支 base 在看板显式登记。
- **单 PR 聚焦（默认）**：base = main（或波次期的设计基线分支），一段一 PR，范围 = 任务书清单，禁止扩批。
- **PR 栈（例外）**：仅当后段必须叠在未合入前段之上——门控补洞段（a-plus）、终审条件清账段（M11/M12 gates）。开栈须同时登记：栈序、各段 base SHA、预期合并顺序；审计对栈上 PR 必须自建「候选 ⊕ main」集成树评估真实合入面。
- 审计分支独立（`cursor/cc-a*-1d6f`），**零业务代码改动**、只交审计文档；全量测试重写的历史截图必须在提交前还原；试合并只在 detached HEAD/独立 worktree 做，不推送。
- 动用户可见面的切换 = 单 Task 原子 PR；合 main 用单 merge PR 作原子回滚单元。
- 合并由父代理执行：按审计指定顺序/解法（有条件放行时禁止天然合并）。

### 3.3 测试取证

- 统一入口：`pnpm quality:loop:full`（build + 全量 e2e + LHCI + score）；跑法细节单源 `cyber-city-test-framework.md`。
- **帧优先**（rubric §4 口径铁律）：功能在代码里但帧里看不见，按帧打分；软渲染折扣有界；分差 ≥±10 必须写差异说明。
- 每段登记「代码落点 + 帧证据」双证表；审计必须 fresh 取证（重跑生成自己的帧），不只看入库帧。
- 关键证据登记 SHA-256（帧、录屏、CI artifact digest）；V5 动效需 5–10s 固定脚本录屏（关键帧不够）。
- LHCI 在本 VM null 时走 CI artifact 回填并登记来源 commit（L0 坑①）；本地缺维归一化分（如 79.6、85.4）**只作诊断，禁止用作发布/登记分**。
- 计时类断言 CI 侧只做状态序 + annotation 采集；真机计时归 human-gate 走查表。

### 3.4 计分与放行门

- 五维口径单源：看板「综合分口径」表 = `scripts/score-loop.mjs` 实现 = 登记文档，三处必须一致（AL0 首查项）。
- **硬条件（每段放行必查）**：e2e 52/52（0 failed/skipped/flaky）· LHCI `/` 与 `/home/` 四项逐项不降 · `availableWeight===1` 且 `missing=[]` · 视觉双评 |Δ总分|≤5 · 综合 ≥85。
- **专项门用审计分**：双评容差只检验自评合理性；门线判定（如视觉 ≥62）以审计独立分为准，综合分不能覆盖专项门。
- 反通胀：禁止预支未落地效果分；「✅ 有折扣」机制区分「接线真实但效果未满」与虚报；审计拒收超出证据的档位宣称（AL2 拒收 ~70 档）。
- 审计裁决三态：放行 / 有条件放行（条件必须可执行可验证、显式清账）/ 卡门（开定向补洞段，不降门不硬闯）。

### 3.5 已知坑总表

| # | 坑 | 处置 |
|---|----|------|
| 1 | SwiftShader LHCI null（perf/BP 全轮 null） | 同树 green CI artifact 回填 + 登记来源 commit；每轮以 lhr JSON 实际值判定（现象非确定性） |
| 2 | JSON import Node22（ESM 无断言报 No tests found） | e2e 内统一 `readFileSync` 读 JSON；或 `with { type: 'json' }`；合并冲突保留 fs 方案 |
| 3 | e2e 墙钟（全量 ~17–23 min；SwiftShader 时间膨胀 ×30–40） | 排期按每段 ≥2 轮全量预算；计时断言只做状态序；挂载等待上限已校准 210s |
| 4 | PR 栈 diff 假象 / merge state DIRTY | 审计自建「候选 ⊕ main」集成树；开栈登记栈序与 base SHA；落地采用已验证合并树 |
| 5 | 错误 repo `rayw-lab/mywebsite` | 文档里 PR/run 链接用 `gh` 实际输出 URL，禁止手拼仓库名 |
| 6 | poster 三面同源漂移 | 「poster 重拍排批次最后」必须真排进批次收尾项，否则静态壳/OG 落后运行时画面 |
| 7 | 缺维归一化假分 | 发布/登记必查 `availableWeight===1`；缺维归一分只作诊断 |
| 8 | 文本零冲突的语义破坏 | 并行波末审计必做试合并 + 合流树运行时冒烟 |
| 9 | 共享入口文件漏划文件域 | 任务书显式划归或声明「多方最小接线」 |
| 10 | 视觉自评系统性偏乐观 ~2 分 | 父代理按「独立分 ≈ 自评 −2」估水位排期 |
| 11 | 审计跑测试重写历史截图 | 审计提交前还原，审计分支只保留文档 |
| 12 | CI artifact 90 天保留期 | 登记 digest + 逐 URL 摘要；到期前转存原始 LHR |

## 4. 模板

### 4.1 新 Loop 开拍 checklist（父代理逐项过）

1. [ ] 读上轮 AL* 审计的「下轮建议」§，把其中的进入条件与批次边界抄进本 Loop 看板小节（目标分、进入条件、显式后置项）。
2. [ ] 核对生产 tip：main tip = 看板登记 tip；上轮分数（登记口径 + 审计独立口径）在案。
3. [ ] 裁决批次边界并写死：本 Loop 做什么、明确不做什么（后置项点名）；执行中禁止扩批。
4. [ ] 裁决串并行与 PR 形态：默认单 PR 串行；三件套式正交基建才并行；补洞/清账才开栈（登记栈序与 base）。
5. [ ] 按 §4.2 骨架写实现 Task prompt，派 `claude-fable-5-thinking-xhigh`。
6. [ ] 实现完成 → 看板登记（分支/PR/自评分/综合分）→ 按 §4.3 骨架派审计 Task（`gpt-5.6-sol-xhigh-fast`）。
7. [ ] 审计放行 → 父代理按指定顺序/解法合并 → 更新看板与生产 tip；有条件放行 → 条件清账后合并。
8. [ ] 审计卡门 → 按审计点名缺口开定向补洞段（回到 5），不降门、不硬闯、不推倒重来。
9. [ ] Loop 收口：AL* 的下轮建议登记为下个 Loop 进入条件；核对 poster 等「批次最后」项已真正执行。

### 4.2 实现 Task prompt 骨架

```text
Full Repository Path: /workspace (https://github.com/rayw-lab/website)

你是 CC-<段ID> Task。任务：<一句话目标，含目标分/门线>。

## 必读材料
- <上轮审计报告及其 §建议节>、<rubric/测试框架/看板等单源文档>

## 基线与分支
- base：<分支@SHA>；分支：cursor/cc-<段id>-1d6f；PR 形态：<单 PR base main / 栈上段（登记栈序）>

## 范围（批次边界，禁止扩批）
- 做：<逐项清单，来自审计 §建议>
- 明确不做：<后置项点名，如 B3/B5>

## 文件域
- 可改：<路径清单>；禁改：e2e 测试逻辑 / playwright.config / lighthouserc / scripts 计分器 / 门槛 / workflow（如需改动必须单独说明并留痕）

## 硬门（全部满足才算完成）
- e2e 52/52（0 failed/skipped/flaky）；LHCI `/` 与 `/home/` 四项逐项不降；
- `availableWeight===1` 且 `missing=[]`；预算红线（壳 ≤90KB / world JS ≤900KB gzip / 资产池 ≤12MB）；依赖红线零新增。

## 取证交付（与代码同 PR 登记）
- 逐项「代码落点 + 帧证据」双证表；固定机位前后帧（同机位对照）；
- <如涉 V5：5–10s 固定脚本录屏>；视觉自评按 rubric v1.1 七维逐维引用锚点，写入 score JSON；
- 全链 `pnpm quality:loop:full` 输出与 COMPOSITE_SCORE；LHCI null 时按测试框架文档走 CI artifact 回填并登记来源。

## 纪律
- 回复第一行自报 model slug；commit + push；poster 重拍（如在本批）排最后；
- 完成后更新 `cyber-city-score-loop-orchestration.md` 本段状态行。

返回：分支/PR、自评分与综合分、证据清单路径。
```

### 4.3 AL* 审计 Task prompt / 清单骨架

```text
Full Repository Path: /workspace (https://github.com/rayw-lab/website)

你是 CC-AL<N> 审计。审计对象：PR #<n> `cursor/cc-<段id>-1d6f@<SHA>`；
比较基线：`main@<SHA>`；审计分支：cursor/cc-al<n>-…-1d6f。零业务代码改动，只交审计报告。

## 审计清单
1. 边界核对：diff 文件清单；e2e 逻辑/playwright.config/lighthouserc/scripts/门槛/workflow 相对基线零差异
  （像素基线更新须逐个说明合理性）；栈上 PR 先自建「候选 ⊕ main」集成树再审。
2. 逐项落地核验：任务书每项「最终树代码证据 + fresh 帧独立判断」双证表；
   允许「✅ 有折扣」（接线真实、帧内效果未满 → 只扣视觉分）。
3. 视觉独立复评：沿用 rubric v1.1 原秤（不因门线改秤）；逐维引用证据帧 + 锚点段落；
   |Δ总分|≤5 检验自评合理性，>5 逐维复议；专项门（如 ≥62）以你的独立分判定。
4. exact tree 全量复跑：fresh install → `pnpm quality:loop:full`（e2e 52 全量 + smoke3d）；
   LHCI 读同 SHA green CI artifact（登记 digest），本地 null 按已知限制处理，不包装成 PASS。
5. 统一计分器复算：登记视觉分与独立视觉分双口径 COMPOSITE_SCORE；
   核对 `availableWeight===1`、`missing=[]`。
6. 硬门表（✅/❌ 逐行）：e2e 52/52 · LHCI 两 URL 不降 · availableWeight===1 · |Δ|≤5 ·
   专项门（如有）· 扩批禁令（后置项未越界混入）。
7. 裁决：放行 / 有条件放行（条件可执行可验证）/ 卡门（点名缺口，给定向补洞清单）；
   附下轮建议 §（Tier 排序 + 进入条件）。

## 纪律
- 第一行自报 model slug；测试重写的历史截图提交前还原；试合并只在 detached worktree，不推送；
- 报告落 `docs/research/cyber-city-<loop>-audit.md`，commit + push；关键证据登记 SHA-256。
```

---

*CC-orchestration-paradigm · 2026-08-26 — 只读归纳 + 文档交付，零业务代码改动；精华版见 `AGENTS.md`「提分 Loop 编排范式」小节。*
