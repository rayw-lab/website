# CC-LOOP-BOARD-ADVISOR-R4-PERF · 董事会终裁（性能首分专项：northStar.perf 从 `—` 到生产分的最短合法路径）

- **角色**：CC-LOOP-BOARD-ADVISOR-R4-PERF（事后顾问 / 董事会 · 性能首分专项）。触发 = 指挥官最高优先咨询「把性能生产分数尽快打出来」。**本裁决最高优先，父代理必须执行**；与顾问链或任何实现/审计单冲突时以本单为准（R1/R2/R3 头部授权条款沿用）。
- **model slug**：`claude-fable-5-thinking-xhigh`
- **取证窗口**：2026-08-28 08:57–09:20 UTC。全部一手：`git fetch` + `gh pr view/run list` 实测 + 正本全文核读（perf rubric v1.0 / human-gate §5.4 / runbook / 桌面单 / R2 顾问 / 看板 main 版与 #152 r2 版）。
- **纪律**：零 `src/`、零 `e2e/`、零秤面改动；独立 worktree `/tmp/board-wt-r4-perf`；base = main `483b942`；本单不杀进程、不起 chrome、不代跑任何腿——真机读数、判定与签字唯指挥官（human-gate 文件头纪律）。
- **正本指针（本单零改秤，冲突以正本为准）**：秤 = `docs/spec/cyber-city-perf-rubric.md` v1.0；回填正本与签字位 = `docs/spec/human-gate-checklist.md` §5.4；逐步手册 = `docs/research/cyber-city-perf-human-gate-runbook.md`；桌面执行单（话术 A/B/C + AL-PERF 任务书骨架）= `docs/research/cyber-city-perf-commander-desk.md`；当轮事实与裁定 = `docs/research/cyber-city-perf-first-score-advisor-r2.md`。

## 登记矩阵（看板单源口径，本单一手复核）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | COMP-M0 重算（功能输入 87 已就位）；性能分**不折算**进综合（rubric §6） |
| **视觉** | **98** | **73** | +25 | #129 ×2 改锚 run7/run8@基线 v2；**run7 复核 GO（[#154](https://github.com/rayw-lab/website/pull/154)，×2 = 1/2）**，run8 先签后飞 |
| **功能** | **90** | **87** | +3 | #146 已合 `483b942` 落账；90 禁登（云端封顶 87–88，待真机 S-2 → AL-R10） |
| **性能** | **85** | **—** | +85 | **本单议题**：登记位 `cyber-city-perf-rubric-score.json` 不存在（一手复核）→ 解锁 = 指挥官真机六腿 → AL-PERF；未登记显 **—** = 显式缺席（诚实状态，非失败状态） |

---

## 0. 事实底座（全一手，2026-08-28 09:00Z 时点）

| # | 事实 | 证据 |
|---|------|------|
| E1 | main tip = `483b942`（#146），CI + Deploy 双绿 → **生产 Pages 被测面 = `483b942`** | `git log origin/main` + `gh run list`（Deploy 行 headSha 实测） |
| E2 | 性能登记位 `docs/research/cyber-city-perf-rubric-score.json` **不存在**；northStar 接线零欠账（`scripts/score-loop.mjs` `NORTH_STAR_SOURCES.perf` 恒读该文件，缺失显 `—`） | `ls docs/research/` + 源码 L181–199 核读 |
| E3 | human-gate §5.4 **六行全【待填】**；归档目录 `docs/spec/assets/human-gate/` 仅 README，零 `cityperf_*` 件——真机零读数 | 两处一手核读 |
| E4 | 首分文档前置**全部已合 main**：rubric v1.0（#65 系）· runbook + §5.4 行 5/6（HG-PREP）· B0/B1（观测件 + 自动降档）· 桌面单 [#96](https://github.com/rayw-lab/website/pull/96)（话术 A/B/C + AL-PERF 骨架）——R2 顾问 §1 逐项核验在案，本单抽查复核一致 | R2 §1 + 本单文件核读 |
| E5 | **run7 leg1 独立复核 GO**：run7 同机两键 @基线 v2 `00fd832` → `RUN7_EXIT=0` passed 17.6m → 三证上链 #129 分支（`fecf595`）→ 复核件 [#154](https://github.com/rayw-lab/website/pull/154)（×2 = **1/2**）+ IGNITION-run8 先签后飞四条件放行；#153 run5 GO 不作数（R3 §F 口径） | `gh pr list/run list` + `git ls-tree` #129 分支 |
| E6 | 存档波队列在册：#149 → #150 → #148 → #151（+#152/#153/#154 候选）；#129 draft 挂双门（×2 ✓✓ + 签字门）；#104/#134 门后件 | 看板 #152 r2 版 + `gh pr list` |
| E7 | CI 五门禁**不含 e2e**（`ci.yml`）；e2e 合同 R2 时点 75 用例 / 15 文件、**至今无 clean 全量绿记录**——S5 只能由 AL-PERF 当轮实跑产出 | R2 §1/§3.3（一手核验记录）+ e2e 目录 15 spec 实测 |
| E8 | P4（预算）当前即可判 100：tip CI run audit-budget 零 ❌（二值维，CI 即权威） | `gh run list` + rubric §2.2-P4 |

---

## A. 终裁：能否「尽快」出生产分——**能，且只有一条合法路径；一切捷径全禁**

**最短合法路径**（R2 §3 当轮续期，本单确认无新增前置）：**指挥官真机六腿（§5.4 回填 + 签字 + push）→ CC-AL-PERF 双门登记**。两步、无第三步；文档/实现/接线前置全部已销账（E4），路径上不存在任何可由 VM 完成的替代或预付环节——「尽快」的唯一压缩空间是**指挥官排窗时点**与**备料零返工**（§C/§D），不是口径。

**加速捷径逐项终裁（全部禁止，均为既有法条重申 + 本单加封）**：

| # | 捷径 | 裁决 | 法条 |
|---|------|------|------|
| 1 | CI CITY-PERF-01/02 读数充判定 | **禁**。CI 证据包 = 下界哨兵，唯一合法用途是 S3 在档性 + 跨轮趋势 + 负载基线 | rubric §4.3 / 禁止清单 2 |
| 2 | SwiftShader / VM 软渲染读数冒充真机 | **禁**（实测 ~1fps，假 ✓ 机制已实证在册㉛） | rubric §0-5 / 禁止清单 4 |
| 3 | 缺腿归一化出「部分分」（仿综合分 availableWeight 折算） | **禁**。perf JSON 无归一化语义：任一维 `null` → 顶层 `score` 必 `null` → northStar 显 `—` | rubric §5.1 状态机 |
| 4 | 旧读数（world-spike §2.3 `fps_*` 四腿 / 任何历史轮）充当城市档当轮 | **禁**。§5.4 城市档六行是独立表；旧轮读数冒充当轮 = 禁止清单 8 | rubric §1 铁律 3 |
| 5 | R2 §5 预计区间（75–95）写入 §5.4 表或登记 JSON | **禁**（诊断参考专用） | R2 红线 / 禁止清单 8 |
| 6 | 为凑读数裁剪动作脚本/采样窗/绕开负载 | **禁** = S4 击穿，登记整体无效 | rubric §1 铁律 2 / §3-S4 |
| 7 | 实现方自评登记、AL-PERF 回填前预登记填数 | **禁** | rubric §5.1 / §3-S1 |
| 8 | 降门（如「先按四腿打分」「P5 免测」）换首分速度 | **禁**。判定腿全集 = 六行；改腿集合 = 改秤，须升版本走 rubric §7，与首分解耦 | rubric §4.1 / §7 |

**一条合法的「提前落袋」**：P4 证据（subject CI run audit-budget 零 ❌）登记时直接引用即可（E8）——但单维 100 救不出顶层分，不构成捷径。

## B. 关键路径与责任人（逐步门控 + 墙钟量级；唯一不可 VM 替代步 = 步 3）

| 步 | 动作 | 责任人 | 门控（过门条件） | 墙钟量级 |
|----|------|--------|----------------|----------|
| 1 | 收到话术 A → 排空合并队列 + **冻结 main**（含 docs-only 存档波）+ `gh run list` Deploy 行核对生产部署 commit 并回报 subject | 父代理 | 队列空 + 冻结生效 + subject SHA 回报 | 分钟级（命令级操作） |
| 2 | 开窗前核对（桌面单 §1 全勾 + 本单 §D 30 分钟核对表） | 指挥官 | 全勾才开跑；无安卓 → 显式宣布「桌面三腿窗」 | ~30 min |
| 3 | **六腿执行**：桌面 1→2→6（20s 脚本 ×2 + Fast 4G 计时），安卓 3→4→5（60s 触屏脚本 ×3）；每腿三件套；B1 降档触发照记 | **指挥官（唯一不可 VM 替代）** | 每腿三件套齐；中断续跑先发话术 B 核对 tip 未动 | 桌面三腿 ~30–45 min + 安卓三腿 ~45–60 min（含连线/归档） |
| 4 | §5.4 六行回填 + 三件套入 `docs/spec/assets/human-gate/` + 门禁判定列 + 签字 → **回填 commit push** | 指挥官（数字与判定列不可委托） | 回填 push 落库（或读数交 AL-PERF 随登记 PR 落库，数字仍出自指挥官） | ~30 min |
| 5 | 发话术 C → **解冻** → 即派 **CC-AL-PERF**（桌面单 §4 骨架填空即发，钉 subject = 步 1 回报的部署 commit） | 父代理 | 严格后置于回填 push（rubric §5.1 禁预登记）；错峰纪律随派 | 分钟级 |
| 6 | AL-PERF：独立 worktree 钉 subject → `pnpm build && pnpm preview` 复核 → **全量 e2e 实跑 clean**（retries=0、0 failed/0 skipped/0 flaky，当轮 `--list` 实测全集口径；一次跑产 S3+S5 双证据） | CC-AL-PERF（Fable5 xhigh） | **VM 静默窗**：与 run8 决定趟/段末审计全量窗错峰；取不得 clean 全绿则本轮**不登记**、归因留痕（R2 §3.3 预案） | build/preview ~5 min + 全量单轮 17–23 min ×≥2 轮预算 |
| 7 | 数值门 + S1–S5 结构门逐条判定 → 写 `cyber-city-perf-rubric-score.json`（§5.2 schema）+ `loop8-perf-audit.md` + runbook 勘误两行（R2 §2.3）→ 登记 PR | CC-AL-PERF | §5.3 五条校验齐；任一维 null → 顶层 null | 小时级（判定 + 撰写） |
| 8 | 登记 PR 合入 → northStar.perf 自动出数 → 秘书界点单上板第四行 | 父代理/秘书 | 登记只认 JSON 单源顶层 score；禁看板先写后补 JSON | 分钟级 |

**头号风险不变**（R2 §3.3 续期）：步 6 的 clean 全量绿至今无记录（E7）——排期按 ≥2 轮预算；失败预案 = 归因留痕不登记，S5 不可豁免。**排期不确定源唯一 = 指挥官真机档期**（步 3）；其余步全部命令级/Task 级，无日历依赖。

## C. 与当前赛道排程（run7/run8 · #129 东线 · 存档波 · #152 看板）

**物理事实先行**：真机六腿跑在指挥官桌面/手机 Chrome 上、被测 = 生产 Pages——**不是 VM chrome 活动**，与 run8 决定趟不构成互斥令冲突（R1 §3.5 / R3 互斥按机适用）。两轨唯二交点：① 六腿冻结窗 vs 一切 main push（存档波、#129 合流）；② AL-PERF 全量 e2e 窗 vs 一切 VM chrome 级活动（run8、探针、LHCI、preview）。

| 现在可备料（与 run7/run8 零冲突） | 必须等 | 绝对禁并行 |
|----------------------------------|--------|------------|
| 指挥官设备核对：中端安卓可得性（Adreno 61x / Mali-G5x 级）+ USB 调试 + `chrome://inspect` 可见 + 桌面 Chrome 版本/WebGPU 徽标预检 + 录屏/秒表——零 VM 动作 | **AL-PERF 派单**：等 §5.4 回填 push（禁预登记） | **六腿冻结窗内任何 main push**（含 docs-only 存档波——tip 漂移即击穿 S3 与 subject 钉定，整轮重排） |
| 桌面单 §1 + 本单 §D 核对表预走（不开跑）；话术 A 文本备好 | **AL-PERF 全量 e2e 窗**：等 run8 收轮且无决定趟在飞（VM 静默窗）；与段末审计全量窗（#104 复活门）串行 | **AL-PERF 全量窗 vs 任何 VM chrome 级活动**（run8 决定趟 / fps-probe / LHCI / 临时 preview——永久令） |
| 父代理：存档波清队预案（波 ≤5，开窗前清完或整体排队二选一）；AL-PERF 任务书骨架已在桌面单 §4，**无需新派备料 Task** | **#129 合流 / 存档波若撞冻结窗**：排队至解冻（合流窗与冻结窗互斥，谁先开谁先走完） | CI/SwiftShader/旧读数/预计区间进表或 JSON（§A 表，任何时刻永久禁） |
| P4 证据定位：subject CI run 链接（`gh` 只读，随时可取） | 秘书第四行落数：等登记 PR 合入 | 六腿窗内换版本续跑（tip 已动 = 整轮重排，读数不可跨版本拼接） |

**开窗时序终裁（序 A/序 B 二择，判定准则 = 指挥官真机档期是全局最稀缺资源，谁先 ready 谁先走，两窗禁重叠）**：

- **序 A（run8 可在指挥官下一档期前收口时，推荐）**：先收 ×2 链（run8 → ✓✓ → 签字门 → #129 合流）+ 存档波清队 → 再开性能冻结窗，subject = 含 #129 的新 tip。收益：首分被测面包含 EXP-01 改线 + BL1 碰撞减深（`src/` 改动 = world 被测面变更），且冻结窗不挡合流窗；run7 已 1/2（E5），此序现实可及。
- **序 B（指挥官真机档期先到时）**：立即开窗，subject = 届时 tip；#129 合流与存档波排队至解冻。完全合法——首分登记钉 subject，#129 后合不追溯、不强制重测（下一轮复测按 loop 常规）。
- **两序共同纪律**：窗内 run8 若在飞照跑不误（按机互斥、物理无冲突），但其收轮触发的合流请求一律排队至话术 C 解冻后。

## D. AL-PERF 派单前置完备性 + 开窗前 30 分钟核对表

**材料盘点（对照桌面单 + human-gate §5.4 + rubric v1.0）——文档面零缺件**：秤（rubric v1.0 冻结）✅ · 回填表六行 + 签字位 ✅ · runbook 全流程 ✅ · 桌面单（三段话术 + 骨架）✅ · 登记 JSON schema（§5.2）✅ · northStar 接线（E2）✅ · CI 证据链在岗（CITY-PERF-01/02 + audit-budget）✅ · runbook 勘误两行已备稿（R2 §2.3，随登记 PR 落）✅。**唯二波动项**：① 中端安卓设备可得性（首分第一临界资源，缺则 P1/P5 `null` → 顶层 `—`）；② 开窗时点 main tip / run8 状态（步 1 现场核对）。另一收账建议（非本单文件域，交秘书随界点单）：AGENTS.md §4.3 速查表「e2e 52/52」系历史合同快照，与当轮全集（R2 时点 75/15，仍在演进）不一致——按白名单直改为「当轮 `--list` 实测全集 0/0/0」措辞，勿改秤。

**开窗前 30 分钟核对表（全勾才发话术 A）**：

- [ ] 中端安卓在手（2019 后，Adreno 61x / Mali-G5x 级）+ USB 调试 + `chrome://inspect` 可见；**无安卓 → 显式宣布本窗为「桌面三腿窗」**（腿 1/2/6，欠账缩至安卓三腿）
- [ ] 桌面 Chrome 最新稳定版，版本号记录（`chrome://version`）；生产页预检 `[data-world-backend]` 徽标（本机无 WebGPU 则记录在案，按实际后端计）
- [ ] 录屏（桌面系统录屏/OBS + 安卓自带）与秒表就位；每腿无痕窗/Clear site data 流程记熟
- [ ] 动作脚本记熟：变形 → 驾驶，2 急转 + 1 撞道具 + 1 boost（桌面 20s / 安卓 60s；触屏替代照 runbook §2.3 并注明）
- [ ] B1 降档留痕义务记熟：腿 1–4 自动降档触发 = toast 入镜 + EXPORT dump `quality-auto-drop` 事件，「场景/时长」列注明档位迁移与时点（不注明 = 记录不完整，AL-PERF 可令整腿重跑）
- [ ] 腿 6 口径记熟：URL 不加 `#debug`、Fast 4G + Disable cache、回车开表、CTA 可点停表；`funnel.robotIdle` 互证取较大值，≤8s/8–10s/>10s 三段无插值
- [ ] 三件套命名 `cityperf_<desktop|android>_<webgpu|gl2|q2|fast4g>_<yyyymmdd>.<mp4|png>` + 归档 `docs/spec/assets/human-gate/`（当前零历史件，E3）
- [ ] run8 状态核对：决定趟不在收轮临界点（避免合流请求与冻结窗互撞；在飞照跑，见 §C）
- [ ] 发话术 A → 收到父代理「队列已排空 + 冻结生效 + 部署 commit subject = `____`」确认，记录开窗时间
- [ ] 中断续跑预案记熟：先发话术 B 核对 tip 未动；tip 已动 = 整轮重排

## E. 登记纪律：首分怎么上板、六腿未齐怎么写

1. **落数链单向且唯一**：AL-PERF 写 `docs/research/cyber-city-perf-rubric-score.json`（顶层 `score`，唯一机读位）→ `scripts/score-loop.mjs` northStar.perf 自动出数 → 秘书界点单把看板矩阵第四行「生产登记」从 `—` 改为该数 + subject/登记 PR 链接。**登记只认 JSON 单源审计独立分**；禁看板先写后补 JSON、禁父代理/秘书替审计出数、禁重复冒登（功能 87 收账先例）。
2. **perf 轨的「availableWeight===1」等价物** = rubric §5.3 校验五条：`dimensions[*].weight` 合计 = 1 且与 §2.1 一致、`score` 非 null 当且仅当五维全非 null、gates 数值门 + S1–S5 逐条有判定与证据、subject 可复现、scoredBy 独立。综合分（25/15/20/25/15，`availableWeight===1` 且 `missing=[]`）**不含性能维**——性能首分落地不改变综合口径，COMP-M0 重算禁把 perf 分折入综合（rubric §6：北极星四数独立取证）。
3. **六腿未齐 = 允许且必须保持 `—` + 显式缺席，禁假分**：rubric §5.1 状态机明文允许首轮 null 登记（缺维 `score: null` + `debts` 逐腿留痕 + 顶层 `score: null` → northStar 照显 `—`）。看板第四行写法：维持 `—`，在途列注「显式缺席：已回填腿 X/6，debts = 安卓三腿（设备可得性）」。**董事会裁量**：桌面三腿先跑时，读数回填 §5.4 即为 durable 留痕，**null 登记轮可并入六腿补齐后的正式登记轮，不必单独烧一轮 AL Task**（省一轮；§5.4 表已是签字位正本）。豁免（§5.5 先例）救不出数字——豁免腿对应维仍 null。
4. **首分不要求过 85 门**：预计中枢 ~85–88、P5 v1.0 口径恒 70 占一处缺口（R2 §5 诊断，禁入表）——「合法登记 + 数值门/缺口计数不过」是预期内诚实状态，照登不误；缺口由 B2/B3 + rubric v1.1 升版复核（登记后改秤动作）按真值收敛。

## F. 父代理立即执行清单（≤7 条，命令级）

1. **向指挥官发开窗邀请**（本 tick）：确认中端安卓可得性 + 下一真机档期；随附桌面单 §1 + 本单 §D 核对表链接。同时按 §C 判定准则拍序：run8 可先收则序 A（先 ×2 收口 + 存档波清队再开窗），档期先到则序 B（立即开窗，合流排队）。
2. **收到话术 A 即执行冻结**：排空合并队列（存档波暂停）+ `gh run list` Deploy 行核对部署 commit + subject SHA 回报指挥官；窗内零 main push、零新增 VM chrome 活动。
3. **回填 push 落库后**：核对 §5.4 六行 + 三件套 + 签字齐 → 发解冻确认 → **即派 CC-AL-PERF**（桌面单 §4 骨架填空即发：Fable5 xhigh、独立 worktree、钉 subject、全量 clean 口径、S1–S5 双门、JSON + `loop8-perf-audit.md` + runbook 勘误两行）；随派两条窗口纪律：AL-PERF 全量窗 = VM 静默窗（与 run8/段末审计错峰）、登记 PR 之前 `src/` 改动合流排队。
4. **登记 PR 到手**：核对 rubric §5.3 五条 + 顶层 score 语义 → 合入 → 秘书界点单上板第四行（§E-1 链路；null 则按 §E-3 写显式缺席）。
5. **禁止项执行责任**（§A 表八条）：任何 Task/工单中出现 CI 读数上表、预计区间入 JSON、缺腿归一化、旧读数冒充、降门提速——当场驳回 + 入执行力账；工单措辞遵守 R3 §F4 保留字管制。
6. **无安卓预案**：指挥官宣布桌面三腿窗时照常冻结开窗（腿 1/2/6 回填落袋），第四行维持 `—` + 显式缺席注记；安卓设备可得性（借/购/云真机）列为指挥官决策项跟踪，**不派 VM Task 替代**（禁令 §A-2）。
7. **本单归档**：交付即 IDLE；draft PR 入存档波候选（波 ≤5，空档执行，不占 run 窗、不占冻结窗）。

---

## 附录：执行 checklist 指针（勿复制正本，一处一行）

| 需要什么 | 去哪 |
|----------|------|
| 开窗前全量核对 + 六腿逐腿勾选 | `docs/research/cyber-city-perf-commander-desk.md` §1–§2 |
| 冻结/续跑/解冻三段话术（复制即用） | 同上 §3（话术 A / B / C） |
| AL-PERF 一句话任务书骨架（填空即发） | 同上 §4 |
| 逐腿操作细节（URL/读数通道/触屏口径/腿 6 计时） | `docs/research/cyber-city-perf-human-gate-runbook.md` §1–§3 |
| 回填表 + 签字位（正本） | `docs/spec/human-gate-checklist.md` §5.4 |
| 秤 + 登记 JSON schema + null 语义 | `docs/spec/cyber-city-perf-rubric.md` §2–§5 |
| 缺腿 → 维映射 + debts 格式 | runbook §5 |
| 本单 30 分钟核对表 / 排程三栏 / 禁止项八条 | 本文件 §D / §C / §A |

---

*本文档为 CC-LOOP-BOARD-ADVISOR-R4-PERF 交付物（董事会终裁 · 性能首分专项）。核心结论：最短合法路径两步不可再压——指挥官真机六腿（唯一不可 VM 替代）→ CC-AL-PERF 双门登记；一切加速捷径（CI/SwiftShader/缺腿归一化/旧读数/预计值/降门）全禁；与 run7/run8 的唯二交点 = 冻结窗 vs main push、AL-PERF 全量窗 vs VM chrome 活动，按 §C 序 A/序 B 择一即可零互撞；六腿未齐则第四行维持 `—` + 显式缺席，禁假分。文件域仅本文件，零业务代码、零秤面改动。*
