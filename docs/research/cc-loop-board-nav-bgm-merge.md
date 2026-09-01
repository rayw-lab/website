# CC-LOOP-BOARD-NAV-BGM-MERGE · 董事会急裁（#166 NAV-C1 + #177 BGM-C1 双 src 件合入条件与合流序终裁）

- **角色**：CC-LOOP-BOARD-NAV-BGM-MERGE（事后顾问／董事会，事件驱动）；触发 = 指挥官点名（[范式](cyber-city-orchestration-paradigm.md) §1.3 触发条件③）+ 站立授权 [#159](https://github.com/rayw-lab/website/pull/159)「**含 src 的 PR 须董事会急裁**」程序要件。书面裁决 = 董事会决议，父代理与所有子代理必须执行，冲突时**优先于编排顾问 T\* 与一切实现／审计／调研／脑暴单**。
- **model slug**：`claude-opus-5-thinking-medium`（本席非 Fable5 xhigh 系列，属指挥官当次指定，AGENTS.md §3 末条适用；纪律照董事会件全量执行）。
- **纪律**：零 `src/` 改动；docs-only；一单一 PR；文件域 = 仅本文档；base = `origin/main`@`52887e5`（**r2 加注：main 已进一代至 `a6942bb`，本 PR base 落后一代，无害且无须 rebase，见 F1**）。
- **取证窗口**：r1 = 2026-08-29 04:15–04:35 UTC；**r2 = 04:36–04:50 UTC**（全部经 `gh pr view` / `gh pr checks` / `git merge-tree` / `git diff` 一手实测，**零转述采信**）。

### 修订记录

| 版次 | 时点 | 出处 | 销案内容 |
|------|------|------|---------|
| r1 | 2026-08-29 04:35Z | 本席首裁（PR [#182](https://github.com/rayw-lab/website/pull/182) commit `2b4d734`） | A–E 五件初裁 |
| **r2** | **2026-08-29 04:50Z** | **第一轮反核（PASS-with-P1，打回 4 条 P1 + 3 条 P2）** | **P1-1／P1-4 新鲜度**：#166 fix 已落（tip 链 `5faab5f`→`fd6cd5c`→`b4694cf`），F2／F3／A-②／A-④／A-⑤／§E-2 全面重写为「以最终 tip 为准」条件式 · **P1-2 证据 SHA**：F6 树 ID 复算 = `8230d3d8`，并出土「树 ID 随参数拼写变」根因（见 F6-b） · **P1-3 F3 执行链闭环**：CI 门禁**不跑全量 e2e**，故 F3 改挂**本地跑道**，A-3 全节重写（执行主体／#174 剧本／三证格式／上链要件） · **P2**：计数锚点钉死 `^\s*test\(`（F9）· base 落后一代加注（F1）· §C-3 反序备选标注失效 · **另新增两项 fresh 发现**：#166 A-⑤ 登记 commit 使冲突面 2→**3 文件**（新增 §C-2-3）· **SEC-R8 编号已被 [#181](https://github.com/rayw-lab/website/pull/181) 占用** → 收账行改编 SEC-R9／R10（§D-1） |

## 登记矩阵（看板单源 [`cyber-city-score-loop-orchestration.md`](cyber-city-score-loop-orchestration.md)，本单零触登记分）

| 维度 | 北极星 | 生产登记 |
|------|--------|---------|
| 综合 | 98 | **80** |
| 视觉 | 98 | **73**（看板单源定谳，董事会 R1 §6） |
| 功能 | 90 | **87** |
| 性能 | 85 | **—**（未登记；解锁条件 = 指挥官真机 human-gate 六腿 → AL-PERF，永不代决） |

本单为程序裁决件（docs-only），不产出、不修订任何登记分；#166／#177 亦均为体验增项 + 工程铺面，合入后**不触登记分**（登记分变更只走审计登记单）。

---

## 0. 本单 fresh 事实表（全部 `gh` / `git` 一手实测）

| # | 事实 | 证据（命令 / 输出） |
|---|------|--------------------|
| **F1** | **r1 时点 main tip = `52887e5`**（[#180](https://github.com/rayw-lab/website/pull/180)）；**r2 复核 main 已进一代 = `a6942bb`**（[#181](https://github.com/rayw-lab/website/pull/181) CC-LOOP-SEC-R8-LEDGER，2026-08-29 04:31:19Z 合入）。**本 PR base 因此落后一代**（P2 加注）——docs-only 单文件、与 #181 零文件交集，`mergeable` 不受影响，**父代理合入时按 GitHub squash 自动取 main 现 tip 即可，无须 rebase**；#181 已对看板顶块重锚，r1 的 F1「stale 四代」结论**已由 #181 销案** | `git log -1 origin/main` + `gh pr view 181 --json mergedAt,mergeCommit` |
| **F2** | **#166 fix 已落，tip 链三段（r2 实测）**：`5faab5f`（解冲突基线）→ **`fd6cd5c`**（2026-08-29 04:27:38Z，`fix(world): CC-NAV-C1 F1/F2`）→ **`b4694cf`**（04:35:57Z，`docs(test): CC-NAV-C1 test-framework 登记 81/17→84/18（#182 A-⑤）`）= **本窗最终 tip**。draft=true · MERGEABLE · CLEAN 维持。**F1 CSS 让位实体**：`.world-minimap-btn` `top:1rem;right:1.15rem` → **`top:2.85rem;right:.95rem`**（下移一栏、右缘对齐音频钮，**音频钮坐标零改动** → A-② 成立）；**F2 实体**：`boxesDisjoint()` helper + 断言**嵌入既有 `CITY-NAV-02`**（非新建用例）。fix 段 diff **仅二文件**（`src/lab/world/ui/Minimap.ts` 1 行 + `e2e/cyber-city-minimap.spec.ts` +23）→ A-① 越域检查通过；**未新增 `test()`** → k=0，分母恒 **84/18**、F3 恒 **82 例** | `gh pr view 166` + `git log`/`git diff --stat 5faab5f..b4694cf` + `rg -c '^\s*test\('` |
| **F3** | **绿证随 tip 迁移实测**：run [33233876558](https://github.com/rayw-lab/website/actions/runs/33233876558) **pass 5m15s 锚在 `fd6cd5c`**；`b4694cf` 推上后新 run [33234213554](https://github.com/rayw-lab/website/actions/runs/33234213554) 于本窗 **pending**。r1 引用的 run 33183113406（锚 `5faab5f`）**已双重失效**。**结论：A-④ 的 CI 绿证须锚在最终 tip（本窗 = `b4694cf`；若 A-⑤ 后再有 commit 则顺延）** | `gh pr checks 166` 两次 fresh |
| **F4** | **[#177](https://github.com/rayw-lab/website/pull/177) tip = `2b00c31`**（同步 main@`4a58789` 的 merge commit，2026-08-28 17:06:44 UTC）。OPEN · draft=true · MERGEABLE · CLEAN；CI 门禁 **pass 4m57s**，run [33193285568](https://github.com/rayw-lab/website/actions/runs/33193285568) | `gh pr view 177` + `gh pr checks 177` |
| **F5** | **两 PR 各自对 main 零冲突（r2 以现 main `a6942bb` + 最终 tip 重算，短 SHA 形态，exit 0）**：`a6942bb × b4694cf` → 树 `7f54399`，零 CONFLICT；`a6942bb × 2b00c31` → 树 `6d779da`，零 CONFLICT。（r1 所记 `8105e8b`／`7d7b807` 系 `52887e5` + ref 名形态的旧值，按 F6-b 立法作废） | `git merge-tree --write-tree --name-only a6942bb b4694cf` / `… a6942bb 2b00c31` |
| **F6-a** | **#166 × #177 CONFLICTING 成立。冲突面随 #166 tip 推进由 2 → 3 文件（r2 关键更新）**：`5faab5f × 2b00c31` → 二文件（`docs/spec/cyber-city-observability.md` + `src/lab/world/core/SessionTimeline.ts`），树 **`8230d3d8`**（= 反核复算值，本席 fresh 重跑复现，幂等两次同值；**采为该命令形态的单源**，r1 所记 `498a861` 作废，根因见 F6-b）；**`b4694cf × 2b00c31` → 三文件**，增 **`docs/research/cyber-city-test-framework.md`**（两侧各自新增同名章节「用例数登记（全量分母单源）」于同一锚点），树 `37d11f0`。无 rename／delete 类冲突 | `git merge-tree --write-tree --name-only 5faab5f 2b00c31` / `… b4694cf 2b00c31` |
| **F6-b** | **方法学出土（防未来 SHA 假警报）**：`git merge-tree --write-tree` 的**输出树 ID 依赖参数拼写**——冲突标记行会嵌入调用者给出的 revision 字符串，故同一对 commit 的三种写法得三个树 ID：短 SHA `b4694cf 2b00c31` → `37d11f0`、全 40 位 SHA → `4de6939`、ref 名 `origin/cursor/…` → `40ad7b0`（同写法重复调用**幂等**）。r1 用 ref 名形态、反核用短 SHA 形态，故差异**非事实错误而是命令形态差**；但**单源以反核形态为准**。**立法**：本仓库今后引用 merge-tree 树 ID **必须连同命令原文一并登记**，且统一用**短 SHA 形态** | 五形态对照实测（A1/A2/B/C/D） |
| **F7** | **冲突实体已逐块读明**（§C 解法据此）：两侧同时改 `WHITELIST.ux` **同一行**、同时在**同一注释锚点**（`[CC-AUD-C1]` 段尾）插入随行段；observability 两侧同时改 §0 第 3 点**同一长句**并同时在 §3.4 表 `world-audio` 行后插入新行 | `git diff origin/main...<each> -- <两文件>` |
| **F8** | **计数自述互斥（naive union 必踩的 stale 陷阱）**：main 基线 = 38 type／10 族；#166 自述 **41 type**（+minimap ×3）、#177 自述 **39 type**（+world-bgm ×1）——两侧合流后真值 = **42 type／10 族**，任何「保留双方文字」的机械并集都会在同一文件留下 39 与 41 两处错数 | 两侧 diff 文本 + 白名单实体计数 |
| **F9** | **e2e 分母（静态复算，与 `--list` 单源口径同源）**：main = **81 tests／17 files**；#166（**含 fix 段 `b4694cf`**）= **84/18**（新增 `e2e/cyber-city-minimap.spec.ts` +3；`cyber-city-feedback.spec.ts` 原地断言加词「M 地图」、fix 段 F2 断言**嵌入既有 CITY-NAV-02**，两者用例数零变化）；#177 = **83/18**（新增 `e2e/cyber-city-bgm.spec.ts` +2）；**两者全落 = 86 tests／19 files**。**计数锚点钉死（P2）**：静态复算 = `rg -c '^\s*test\('` 逐 spec 求和 —— 只计**行首缩进后紧接 `test(`** 的顶层用例，**不含** `test.describe(`／`test.skip(`／`test.step(`／注释行；`--list` 为最终单源，静态值只作交叉校验 | `git ls-tree -r --name-only <rev> -- e2e` + 逐文件 `rg -c '^\s*test\('` |
| **F10** | **A-⑤ 登记欠账 r2 已销案**：#166 的 `b4694cf` 已补 `docs/research/cyber-city-test-framework.md`「用例数登记（全量分母单源）」章节 —— 基线行 `main@52887e5` 81/17 + **`CC-NAV-C1（#166 合入后）` 84/18**（并注「合流后以 fresh `--list` 复核」）→ **A-⑤ 过门**。两处副作用：① 该文件成为**第三冲突文件**（F6-a）；② #177 已登「83/18」在 #166 落地后即 stale → 合并解法见 **§C-2-3** | `git diff fd6cd5c..b4694cf` |
| **F11** | 文件域实测（r2 以 `b4694cf` 重算）：#166 = **9 文件**（obs spec + **test-framework** + 2 e2e + `PoiArrival.ts`／`SessionTimeline.ts`／`index.ts`／`ui/Minimap.ts`／`world/Reveal.ts`，**941+/9−**；较 r1 的 8 文件 908+ 增的即 fix 段 + A-⑤ 登记）；#177 = 6 文件（test-framework + obs spec + 1 e2e + `audio/BgmLoop.ts`／`audio/WorldAudio.ts`／`SessionTimeline.ts`，719+/6−）——`public/` 零触、`package.json`／`pnpm-lock.yaml` 零触（#177 §D 证一机器面成立） | `git diff --stat --name-only` ×2 |
| **F12** | 前置裁决在案：[#178](https://github.com/rayw-lab/website/pull/178) MERGED（NAV 审计 fix-forward，唯一欠账 = 右上角 NAV×AUD 双钮重叠，F1–F3 过门**预授 GO**，F3 口径 84−2 规格恒红 = 82 例）· [#179](https://github.com/rayw-lab/website/pull/179) MERGED（AUD R3 有条件 GO，#164 零回归）· [#172](https://github.com/rayw-lab/website/pull/172) = BGM v0 附条件批准（HG-B1／HG-B2／§D 三证／六门八禁） | `gh pr view 178/179` + main 一手文档 |
| **F13** | 开放 PR 全景（12 枚，含冻结件）：工程三主件 [#177](https://github.com/rayw-lab/website/pull/177)／[#166](https://github.com/rayw-lab/website/pull/166)／[#104](https://github.com/rayw-lab/website/pull/104) 全 draft；#104 tip `bbba5a5` 禁 ready 维持 | `gh pr list --state open` |

---

## 1. 一行裁决表（A–E）

| 议题 | 一行终裁 |
|------|---------|
| **A · #166 合入条件** | **附条件 GO**——五门中 **A-①/②/③/⑤ r2 实测已过门**（fix `fd6cd5c` + 登记 `b4694cf`，零越域、k=0）；余 **A-④ 双面绿证**：**CI 五门（构建面）在最终 tip `b4694cf` 转绿** + **本地跑道全量 82 例（84−2 恒红）0/0/0 并三证上链**（e2e 面，CI 不跑全量故不挂 CI，见 §A-3）→ 齐备方可 draft→ready→**squash** |
| **B · #177 合入条件** | **附条件 GO**——§D 三证机器复核 + HG-B1 双 param 互斥源码级复核 + HG-B2 双用例**在合流树上重跑**（非分支自跑）+ 默认 OFF 单常量位复验 + 六门八禁六项抽查，全齐方可 ready→squash |
| **C · 合流序** | **维持 #166 先 → #177 后**（r2：反序备选**触发条件已灭失，整节失效**）；后合者 #177 负全部解冲突，**冲突面现为三文件**：SessionTimeline 白名单 ux 族 11 type 双全 + **两处计数自述统一改写 42 type／10 族**（禁机械并集留 39／41）· observability §0-3 合并为单条 42 子句 + §3.4 四行全保 · **`cyber-city-test-framework.md` 两侧同名章节合为单章节三行表**（81/17 → 84/18 → **86/19**，§C-2-3） |
| **D · 合入后义务** | **SEC-R9（#166 落地）／SEC-R10（#177 落地）**两收账行字段固定（r2 改配：SEC-R8 编号已被 [#181](https://github.com/rayw-lab/website/pull/181) 占用）；**#104 ready 门分母 81 → 86 fresh 重算**（禁沿用 83／84），开窗口径 = 86−2 规格恒红 = **84 例 0/0/0**；e2e 基线重建以 86/19 为唯一分母，并开 CC-PERF 规格工单清 CITY-PERF-01/02 恒红 |
| **E · 父代理清单** | 十条执行清单见 §E；禁项复读四条：**禁合 #104**、**CAM 视角旋转永不代决**、**真机六腿永不代决**、**安卓／北极星调整永不代决** |

---

## A. 终裁一：#166 NAV-C1 合入条件（附条件 GO，五条硬门）

### A-1 程序定位

#178 已作出「fix-forward + 补洞过门后**预授 GO**」的审计裁决，故本席**不重开 #166 的技术审**（避免二次审计化）；本单只做站立授权 #159 要求的**含 src 合入急裁**，即把「预授 GO」翻译成父代理可机械核验的合入前置条件，并补齐审计未覆盖的**登记单源与绿证时效**两处程序缺口。

### A-2 五条硬门（缺一即打回，条件式书写——**以最终 tip 为准**；r2 已按实测销案两门）

**tip 条件式（r2 更新）**：本窗最终 tip = **`b4694cf`**（fix `fd6cd5c` + A-⑤ 登记 `b4694cf`）。若父代理接手时分支再有新 commit，**所有门一律以最终 tip 重核**（A-① 越域检查的基线仍为 `5faab5f`，A-④ 的 CI 绿证锚点顺延至最终 tip）。

| 门 | 口径 | r2 实测状态 | 机器可核方式 |
|---|------|-----------|------------|
| **A-①（fix 落地 + 越域）** | 分支 tip **≠ `5faab5f`**，且 `git diff 5faab5f..<最终 tip>` **只含**三类：`src/lab/world/ui/Minimap.ts` 钮定位 CSS（F1）+ e2e 断言（F2）+ `docs/research/cyber-city-test-framework.md` 登记（A-⑤）。第四类文件 = **越域，打回** | **✅ 过门**：三文件恰为三类（Minimap.ts 1 行／minimap.spec.ts +23／test-framework 新章节），零越域 | `git log 5faab5f..HEAD` + `git diff --name-only` |
| **A-②（F1 实质）** | 小地图钮不再压占 `.world-audio-toggle`（top:.85rem／right:.95rem）命中区；让位方向自裁，但**禁改音频钮既有坐标** | **✅ 过门**：`.world-minimap-btn` `top:1rem;right:1.15rem` → `top:2.85rem;right:.95rem`（下移一栏、右缘对齐）；`src/lab/world/audio/` 零触 = 音频钮坐标零改动 | `git diff 5faab5f..b4694cf -- src/` 逐行 |
| **A-③（F2 实质）** | 回归断言：两钮 `boundingBox()` **不相交**（非「都可见」——可见但重叠正是本次破门形态）；须落**常驻 spec**，禁一次性脚本；若新增 `test()` 则分母 +k、F3 分母 82+k | **✅ 过门**：`boxesDisjoint()` helper + 断言**嵌入既有 `CITY-NAV-02`**，**未新增 `test()` → k=0**，分母恒 84/18、F3 恒 **82 例** | `rg -n 'boxesDisjoint' e2e/cyber-city-minimap.spec.ts` + `rg -c '^\s*test\('` |
| **A-④（双面绿证：CI 五门 + 本地跑道全量）** | **两者分立、缺一不可**（r2 按 P1-3 重写，详见 A-3）：<br>**(i) 构建面** = CI 门禁（check / build / links / budget / lighthouse）**在最终 tip 上绿**；<br>**(ii) e2e 面** = 全量 **82 例（84−2 规格恒红）0 failed／0 skipped／0 flaky**，由**本地跑道**执行并按 A-3 三证上链 | **⏳ 待**：CI (i) 在 `fd6cd5c` pass 5m15s（run 33233876558），**`b4694cf` 上 run 33234213554 本窗 pending** → 须等绿；(ii) **未开跑**，为当前唯一实质阻塞 | `gh pr checks 166` fresh + A-3 三证 |
| **A-⑤（登记单源）** | 补 test-framework 用例数登记：main@`52887e5` 81/17 → **CC-NAV-C1 合入后 84/18**（k>0 时为 (84+k)/18） | **✅ 过门**（`b4694cf`，见 F10）；副作用 = 第三冲突文件，解法 §C-2-3 | 表内新行 + `git diff` |

**结论（r2）**：五门中 **A-①／②／③／⑤ 已实测过门**，余 **A-④ 双面绿证**——CI 面等 `b4694cf` 的 run 转绿，e2e 面须按下节执行链开跑。

### A-3 F3 执行链终裁（r2 全节重写，销 P1-3）：**CI 五门（构建面）+ 本地跑道全量 82 例（e2e 面）两者分立、缺一不可**

#### A-3-1 r1 措辞纠偏

r1 写「F3 只认 CI／云机」在**执行链上不可兑现**：本仓库 CI 门禁的五个 job 是 check / build / links / budget / lighthouse，**不含全量 e2e**（52/82 例级别的 Playwright 全量从未挂 CI；#178 的 F3 亦是按「标准 e2e 执行」而非 CI job 表述）。把 F3 挂到 CI = 挂到一个不存在的 job 上，会造成「等一个永不出现的绿」。**故 r2 把两面拆开**：

| 面 | 执行主体 | 产出 | 缺失后果 |
|---|---------|------|---------|
| **构建面** | GitHub Actions「门禁」workflow（五 job） | run URL + `pass` | 合入即破 main 门禁 |
| **e2e 面（F3）** | **本地跑道**：父代理授权的 Task runner，本机隔离 worktree 单跑 | 82 例 0/0/0 + 三证上链 | 破门缺陷（如本次双钮重叠）进 main |

r1 §A-3 论证的「本机跑道被挤兑污染」**事实不变、结论改写**：污染的处置办法**不是把门搬到 CI**（CI 没这个能力），而是**跑道隔离 + 互斥令 + 三证留痕**——即 [#174](https://github.com/rayw-lab/website/pull/174) 剧本。

#### A-3-2 执行链（照 #174 剧本，逐条为硬要求）

1. **跑道独占**：开跑前 `ps` 实测全 VM **零 chrome／零 chrome-headless／零他方 preview**（互斥令；#178 避坑「共享 checkout 跑道三连抢占」+ #177 §验证证据「三重 chrome gpu-process 各 >100% CPU」双证在案）；跑期间父代理**同样受约束**，禁起任何 chrome 级活动（T21 §2.2 立法）。
2. **端口隔离**：`E2E_PORT=<非 4321 空闲端口>` 显式指定（避免复用他方 preview 靶站，`docs/research/cyber-city-test-framework.md` §靶站表载「有则复用」= 默认口径下会静默借用别人的服务器）。
3. **socket bind 探针**：起跑前对该端口做 bind 探测确认真空闲（探针失败即中止，不得「先跑再说」）。
4. **`set -o pipefail`**：`tee` 管道**会吞退出码**（T22 §F1 实锤：`RUN2_EXIT=0` 系 tee 吞码，实际 1 failed）—— 无 pipefail 的 `EXIT=` 尾行**无效**。
5. **`EXIT=` 尾行实落日志**：命令尾部 `echo "NAV_F3_EXIT=$?"` 落 tee 日志末行（历史沿用 `RUNn_EXIT=` 体例）。
6. **产物先归档再清理**：`test-results/` 与 `e2e-results.json` **先拷入独立证据目录**再做任何清理（证据灭失事件已发生过两次，T21 §① 在册：`rm -rf test-results` 灭失 run1 三证）。

#### A-3-3 三证格式（缺一即视为未跑）

| 证 | 内容 | 判据 |
|---|------|------|
| **证一** | 终端／tee 日志含 **`NAV_F3_EXIT=0`** 尾行（pipefail 生效前提下） | 日志末行文本 |
| **证二** | `e2e-results.json` **stats**：`expected=82`（或 82+k）· `unexpected=0` · `skipped=0` · `flaky=0`；**以 `readFileSync` 读**（Node 22 ESM import 断言坑，范式 §3.5） | JSON 实读，禁转述 |
| **证三** | 上二证 **以 commit 上链**至审计／登记分支（本单口径：可随 SEC 收账件或 #166 分支的证据提交） | commit SHA |

**「未上链 ✓ 不构成过门」**（沿用既有立法：#129 ×2 链、run7／run8 leg 审计均按此判；口头／聊天窗里的「跑绿了」一律不采信）。同时**列表行**（`82 passed (Xm)`）作为证二的辅助交叉项一并留痕。

#### A-3-4 失败分账（跑出红时的唯一合法处置）

按 #178 终账三分法：**真回归**（候选账，零容忍，回 fix）／**环境性**（须同窗 `ps` + main 对照树同款失败同时长指纹**双证**方可挂 VM 账）／**规格恒红**（CITY-PERF-01／02 两例，仓库账，已在分母中扣除）。**禁止**以「大概是环境」单证降级；亦禁止把 82 例改成「跑得动的那些例」。

### A-4 程序：draft → ready → squash

1. A-①…A-⑤ 五门齐 → 父代理在 PR 评论贴**五门对号清单**（每门一行证据链接／SHA）；
2. `gh pr ready 166` —— **本单不代 ready、不代合**（禁项）；ready 的执行权在父代理，但**只在五门齐后**；
3. 合入方式 = **squash**（与 #164 先例一致，保 main 线性）；commit message 须含 `CC-NAV-C1` 与 fix 后 tip 短 SHA；
4. 合入后立即执行 §D-1 的 **SEC-R9** 登记（编号见 D-1 改配），**不得跨 tick 拖欠**。

---

## B. 终裁二：#177 BGM-C1 合入条件（附条件 GO）

### B-1 §D 零资产三证复核清单（机器面，逐条命令化）

| 证 | 复核口径 | 命令级判据 |
|---|---------|-----------|
| **D-1 diff 面** | `public/` 零触 + 零音频二进制 + 零 `data:audio`／base64 内嵌 + `package.json`／`pnpm-lock.yaml` 零触 | `git diff --name-only origin/main...<177 tip>` 六项白名单外零命中（F11 已复核成立）；`git diff origin/main...<tip> \| rg -i 'data:audio\|base64,\|\.mp3\|\.ogg\|\.opus\|howler\|tone\.js'` 零命中 |
| **D-2 e2e 取证面** | 双用例全程 `page.on('request')` 过滤音频扩展断言零命中 | 断言存在性 `rg 'page.on\(.request' e2e/cyber-city-bgm.spec.ts` + 用例 PASS（须为**合流树上**的 PASS，见 B-3） |
| **D-3 无预录 PCM／音频库** | `BgmLoop.ts` 全程运行时程序化生成；零 `decodeAudioData`／零 PCM 驻留／零新依赖 | `rg 'decodeAudioData\|fetch\(\|new Audio\(' src/lab/world/audio/BgmLoop.ts` 零命中 |
| **失效条款复读** | 上三条任一破 → #172 §D 失效条款触发，**v0 批准即刻失效、整单回落 v1 资产门**（许可台账 + credits + ≤500KB／1.5MB 双口径）。父代理**无权**在此情形下自行放行 | #172 §D-3 |

### B-2 HG-B1 复核清单（源码级，非声明级）

#172 把 Codex P2「ducking 双通道争同一 AudioParam」升为**实现硬门**。#177 声明采用方案 (i) 串联双 GainNode。复核不采信 PR body 声明，须逐项在源码上验：

1. **存在两只独立 GainNode**：`duckEngineGain` 与 `duckPulseGain` 各自 `createGain()`，串联在同一链路上；
2. **连续侧链专线纪律**：`duckEngineGain.gain` 上**只有 `.value` 直写**，`rg 'duckEngineGain'` 邻域**零** `setTargetAtTime`／`linearRampToValueAtTime`／`setValueAtTime`；
3. **脉冲专线纪律**：`duckPulseGain.gain` 上**只有自动化**，邻域**零** `.value =` 直写；
4. **第三只 param 不混用**：`busGain`（开关×活跃窗）只走边沿自动化（开 τ0.6／关 τ0.15），同样无混写；
5. **探针一致性**：`bgm.duck` 输出 = `1 − duckEngine × duckPulse` 的合成有效值（断言 G 取证面对得上）；
6. **cc-bgm-rs §4.2 四行逐行成立**（目标值／τ／恢复沿），差异须在 PR 说明并经父代理登记，不得静默偏离。

任一项不成立 = HG-B1 未过门 = **打回，禁合**（此门是 #172 明文硬门，父代理无豁免权）。

### B-3 HG-B2 复核：双用例须在**合流树**上重跑

#177 body 记录的双用例 PASS（12.0m + ~5.8m）是**分支自跑**，且明确处于本机三重 chrome 挤兑窗。按 §C 合流序，#177 是后合者，其 `SessionTimeline.ts` 与 observability 会被解冲突改写 —— **改写后的树未被任何 PASS 覆盖**。

**裁定**：#177 ready 前须在「#166 已落 main 后的 #177 解冲突树」上重跑并 PASS：

- `CITY-BGM-01 用例1`（无种子：A–D／F／G／I／J + H-user + 零 restore 事件）
- `CITY-BGM-01 用例2`（种子 `world-bgm-on=1`：E + H-restore，恢复恒晚于解锁双口径）
- **合流树冒烟六例**：上述 2 例 + `CITY-AUD-01`（音频层交叠面，#178 破门发生地）+ `CITY-NAV-01/02/03`（minimap 三例，验白名单合并未掐断 minimap 埋点）
- `pnpm exec astro check`（0 error／0 warning）+ `pnpm build` 绿

跑数环境口径同 §A-3-2（**本地跑道 + 独占 + 端口隔离 + pipefail + `EXIT=` 尾行 + 三证上链**；#177 body 自述的双用例 PASS 明确处于三重 chrome 挤兑窗，不满足独占要件，故不可直接沿用）。**「文本零冲突 ≠ 语义零冲突」**（范式 W2 已知坑）在此适用——本次是文本**有**冲突（三文件），语义风险只会更高。

### B-4 默认 OFF 复验（禁项③，DP-B2 未确认前恒定）

1. 源码面：`STORAGE_KEY` 读取**唯一一处常量位**，无第二处默认值来源；无 `autoplay`／无「解锁即起播」路径（起播只在「钮点击」或「记忆值 = '1' 的 restore 沿」两条）；
2. 断言面：用例1（无种子）断言 BGM 静默 + **零 `world-bgm` 事件**（默认 OFF 无事件）；
3. 记忆面：用例2 证 restore 沿存在且**恒晚于解锁**；
4. **听感不作合入硬门**（#172 §F）：验收人 = 指挥官真机；父代理**不得**以「听着一般」为由阻合，亦不得以「听着不错」替代 B-1…B-3 任一门。

### B-5 六门八禁抽查（六项，父代理逐项贴证）

| 抽查项 | 判据 |
|-------|------|
| 禁入区零触 | `view/`、city 几何、`src/data/`、physics、`public/`、`astro.config.mjs`、`playwright.config.ts`、首页壳与 `/home/` 全零触；`index.ts` 零改动（F11 已复核成立） |
| WorldAudio 加法预算 | ≤40 行硬预算（body 自述 38+/4−，须 `git diff --stat` 复核） |
| schemaVersion 不动 | 白名单为纯加法，`schemaVersion` 常量零 diff |
| 零音量滑杆（DP-B3） | 无 range input／无音量 UI |
| 钮零动画（禁项⑦） | 钮样式无 transition／animation |
| 分数产出零 | 本单不产出任何登记分（body 自述，父代理复核 `quality-score*` 零触） |

---

## C. 终裁三：合流序 = **#166 先（fix 后）→ #177 后**，附逐块冲突解法

### C-1 序的独立判断（本席复核后维持父代理建议，理由四条）

1. **过门成熟度不对称**：#166 已有段末独立审计（#178）+ 预授 GO，欠账定域为单点（双钮重叠）；#177 尚无独立段末审计，只有实现自证 + #172 的开工附条件。先合成熟度高者，可把「解冲突产生的新风险」压在**尚需复跑**的那一单身上——它反正要重跑。
2. **既有规则成本**：[#171](https://github.com/rayw-lab/website/pull/171) 已在册「**#166 先合重建规则**」并据此写了 #104 集成树命令级剧本。反序需先书面修订 #171 规则，再重算剧本，程序成本纯增。
3. **取证锚稳定性**：#178 的全套取证（DP-1／DP-3／VIS-01–04／LHCI 回填）锚在「#166 tip ⊕ main」集成树。让 #166 后合 = 其取证树失锚，F3 须整轮重跑，浪费一轮本地跑道独占窗（本机全量约 17–23 min 墙钟起，且需全 VM 静默）。
4. **冲突解法归属清晰**：两文件冲突的**语义主体是白名单计数**，而 #166 的加法（3 type）比 #177（1 type）更侵入注释文本；由体量小的一侧承担并集改写，diff 更小、审阅面更窄。

### C-2 冲突解法明细（给后合者 #177，逐文件逐块，**照此执行不得自裁变体**）

#### C-2-1 `src/lab/world/core/SessionTimeline.ts`（三块）

**块①：`EventFamily` 上方 doc-comment 随行段** —— 两侧均在 `[CC-AUD-C1]` 段尾插入。裁定：**双段全保，序为 `[CC-AUD-C1]` → `[CC-BGM-C1]` → `[CC-NAV-C1]`**（按 type 落 main 的时间序，非 PR 号序）。

**块②：`WHITELIST.ux` 行** —— 裁定为**唯一合法解**（11 type，world-bgm 紧随 world-audio 保音频族邻接，minimap 三连保字典序，与 #166 原提交内部序一致）：

```
  ux: 'hint-shown hint-dismissed hint-recall esc-menu-open idle-30s idle-nudge world-audio world-bgm minimap-close minimap-open minimap-teleport',
```

**块③（本席新增硬项，F8 陷阱）：计数自述统一改写为 42** —— #166 段自述「41 type／10 族」、#177 段自述「39 type／10 族」，两者在合流后**全部为假**。裁定：块①两段随行注释里的 type 计数**统一改写为 `42 type / 10 族`**（族数不变，两侧均未新增族）。**机械并集（保留 39 与 41 原文）视为解冲突失败，须打回重解。**

`schemaVersion` **不动**（两侧均为加法，#166／#177 各自纪律一致）。

#### C-2-2 `docs/spec/cyber-city-observability.md`（三块）

**块①：§0 第 3 点「事件白名单 v1 冻结」长句** —— 两侧各自在句尾续一条随行子句（38→41 vs 38→39），直接并集会产生「39 之后又 41」的自相矛盾链。裁定：**两条压缩为单条合并子句**，接在 `[CC-AUD-C1]` 子句之后，文本口径如下（措辞可微调，**数字与括注内容不得变**）：

> ；[CC-BGM-C1] + [CC-NAV-C1] 随行加法后 **42 个 type、10 族**——ux 族 `world-bgm`（BGM 合成氛围垫 v0：BGM 钮切换／记忆恢复沿）+ `minimap-open` / `minimap-close` / `minimap-teleport`（M 键小地图，GAP-12 清偿，两段式传送第一段）

**块②：§3.4 事件表 `world-audio` 行之后** —— 两侧各插入行。裁定：**四行全保，序 = `world-bgm` → `minimap-open` → `minimap-close` → `minimap-teleport`**（world-bgm 紧随 world-audio 保音频邻接，与白名单串序一致），各行**原文照搬两侧提交**（描述列一字不改，含各自的 `[CC-BGM-C1]`／`[CC-NAV-C1]` 归属标注）。

**块③：`camera` 族 `shot-interrupt` 行** —— 仅 #166 改（`by` 枚举 data 值加法 `'teleport'`，`PoiArrival.interrupt(by)`），#177 零触。裁定：**取 #166 版**；若 merge 未把该行判为冲突则天然保留，无须动作，但后合者须**目视确认该行 `'teleport'` 在合流树上存在**（防解冲突时整段回退丢行）。

#### C-2-3 `docs/research/cyber-city-test-framework.md`（r2 新增——第三冲突文件）

**成因**：#166 的 A-⑤ 登记 commit（`b4694cf`）与 #177 各自新增**同名章节**「## 用例数登记（全量分母单源）」于**同一锚点**（`COMPOSITE_SCORE=90.5` 代码块之后、「## 视觉取证与基线图纪律」之前），导致 merge-tree 冲突面由 2 → 3（F6-a）。

**裁定：合并为单章节 + 三行表**（章节标题、口径段落两侧文字一致，取任一即可；表体按下表三行，**禁保留两张表**）：

| 时点 | `--list` 分母 | 变更 |
|------|--------------|------|
| main@`52887e5`（2026-08-29 fresh 实测） | 81 tests / 17 files | 基线（#171 预清登记同值） |
| CC-NAV-C1（#166 合入后） | **84 tests / 18 files** | +3：`e2e/cyber-city-minimap.spec.ts` CITY-NAV-01/02/03（F2 双钮不相交断言嵌入 CITY-NAV-02，不增用例） |
| CC-BGM-C1（#177 合入后，**双落终值**） | **86 tests / 19 files** | +2：`e2e/cyber-city-bgm.spec.ts` CITY-BGM-01 双用例串行（HG-B2 双挂载口径）；#177 分支自登「83/18」为 **#166 未合时点值，已由本行接替** |

k>0 时（F2 断言若改为独立用例）三行分母顺延为 81/17 → (84+k)/18 → (86+k)/19。

#### C-2-4 后合者附加两项义务

1. **登记单源以 §C-2-3 三行表为终态**（不改史、只加时点标注；禁在同文件留两个同名章节）。
2. **合流树冒烟**：§B-3 六例 + `astro check`／`build`，报告贴 PR。

### C-3 反序备选：**r2 起标注失效（触发条件已灭失）**

r1 设的唯一触发条件是「#166 fix commit 24h 内未落分支」。**r2 实测 fix 已于 2026-08-29 04:27:38Z 落 `fd6cd5c`、A-⑤ 登记落 `b4694cf`**（F2）——触发条件**永久灭失**，故本节**整节失效，不得再作反序依据**。

**现行唯一合法序 = #166 先 → #177 后**（§C-1 四条理由不变）。若父代理今后仍认为需反序，**须另开董事会急裁**，不得引用本节。（保留本节文字仅为留痕，划线口径：**已失效**。）

---

## D. 终裁四：合入后义务（三项，逐项字段化）

### D-1 看板登记行（`cyber-city-score-loop-orchestration.md` 单源）——**r2 编号改配**

**编号冲突已实测**：r1 把 #166 落地收账称 SEC-R8，但 **SEC-R8 编号已被 [#181](https://github.com/rayw-lab/website/pull/181)「CC-LOOP-SEC-R8-LEDGER」占用**（2026-08-29 04:31:19Z 合入 → main `a6942bb`，含 MERGE-WAVE 14 + 顶块重锚）。**裁定改配**：#166 落地收账 = **SEC-R9**，#177 落地收账 = **SEC-R10**（下文原 SEC-R8／R9 字段清单整体顺延，内容不变）。

**SEC-R9（#166 落地后立即，同 tick 不得拖欠）**必含字段：

1. **重锚**：顶块 main 锚更新至 #166 squash 后新 tip（r1 所述「stale 四代」已由 #181 清账，本条只需接续一代）；
2. #166 → mergeCommit SHA + mergedAt（`gh pr view 166 --json mergeCommit,mergedAt` 实测，禁手拼）；
3. **五门对号**：A-①…A-⑤ 逐门证据 —— A-①/②/③/⑤ 引本裁决 r2 实测结论（fix `fd6cd5c` + 登记 `b4694cf`，零越域、k=0）；**A-④ 双证分列**：CI run URL（最终 tip 上 pass）+ **本地跑道 F3 三证上链 commit**（`NAV_F3_EXIT=0` / JSON stats 82-0-0-0 / 上链 SHA，§A-3-3）；
4. 本裁决件（本 PR）合入 SHA + 「含 src 合入急裁程序合规」一句（#159 要件留痕）；
5. 在途表：#166 移出在途 → MERGE-WAVE 新表一行；#177 在途行更新为「后合者，冲突解法照 board-nav-bgm-merge §C-2」；
6. **登记矩阵维持 80 / 73 / 87 / —**（#166 为体验增项，不触登记分；性能行维持 `—`，解锁条件 = 真机六腿 → AL-PERF）。

**SEC-R10（#177 落地后）**必含字段：

1. #177 → mergeCommit + mergedAt 实测；
2. **§D 三证 + HG-B1 六项 + HG-B2 合流树六例 + 默认 OFF 四项 + 六门八禁六项**逐项对号；
3. 解冲突结果留痕：白名单 ux 族 **11 type / 42 total / 10 族**、observability §0-3 合并子句、§3.4 四行序、`shot-interrupt` `'teleport'` 存活、**test-framework 单章节三行表**（§C-2-3）；
4. e2e 分母 **86/19**（fresh `--list` 实测值，与静态复算对号；不一致时以 `--list` 为单源并登记差异归因）；
5. #172 §D 失效条款**未触发**的明示结论（或触发则记回落 v1）；
6. 登记矩阵维持 80 / 73 / 87 / —；**听感验收挂指挥官真机账，不入本行**。

### D-2 #104 ready 门分母重算

- 现行登记「全量 81 例 0/0/0」为 **#166／#177 未落时点值，落地后即失效**；
- **新分母 = 86**（F9 复算；须以 `pnpm exec playwright test --list` fresh 实测复核后登记，**禁沿用 83（#177 单侧）或 84（#166 单侧）**）；
- **开窗口径 = 86 − 2 规格恒红（CITY-PERF-01／02）= 84 例 0 failed／0 skipped／0 flaky**。恒红扣减与 #178 F3 的「84−2=82」同一法理（#178 §新发现三重互证：`[data-ws-fps]` 只在 `/world-spike/` 页壳，城市页全史零该元素，属仓库规格账非候选账）；
- **配套强制**：扣减恒红的同时须开 **CC-PERF 规格工单**（修 CITY-PERF-01/02 断言选择器或迁 spec 归属）。恒红只准扣两轮——本裁决 + #104 开窗；**第三轮起不再准扣**，届时未修即视为门未过。此为防「永久豁免化」的止损条款；
- 顺序依赖：**#104 全量窗排在 #166、#177 双落之后**（否则集成树基线一改再改，白跑）；互斥令适用，同窗禁并跑。

### D-3 e2e 基线重建

1. **分母单源**：`docs/research/cyber-city-test-framework.md` 登记表按 C-2-3 补 86/19 行后，该行为后续一切分母引用的唯一来源；
2. **失败面重分账**（沿 #178 终账三分法）：真回归（候选账，零容忍）／环境性（本 VM 挤兑账，须同窗 `ps` + main 对照树同指纹双证）／规格恒红（仓库账，2 例，见 D-2 止损条款）；
3. **跑法纪律复读**：`OBS-06` 禁单跑（跑法工件依赖，#178 定谳）；e2e 内读 JSON 用 `readFileSync`（Node 22 ESM 断言坑）；LHCI 本机 null → 同 SHA green CI artifact 回填并登记来源；poster 重拍永远排批次最后；
4. **基线图纪律**：两单均未改 poster／像素基线（#177 断言 J 走既有回归面）——**SEC-R10** 须明示「基线图零改动」，若出现基线更新则须单列并复核动机。

---

## E. 父代理 Tick 立即执行清单（十条，按序）

1. **合本裁决件**（本 PR，docs-only，r2 版）——站立授权 #159 docs 直合，squash；合入 SHA 记入 SEC-R9 字段 4。base 落后 main 一代（`52887e5` vs `a6942bb`）属无害，squash 时自动取 main 现 tip，**无须 rebase**。
2. **A-①/②/③/⑤ 已由 r2 实测过门，无须重跑**（fix `fd6cd5c` + 登记 `b4694cf`，零越域、k=0、音频钮坐标零改动）；父代理只需 **fresh 确认最终 tip 未再变**（`gh pr view 166 --json headRefOid`）——若又有新 commit，则按 §A-2 tip 条件式**只重核 A-① 越域与 A-④ 绿证锚点**。
3. **开 F3 本地跑道窗**（**这是当前唯一实质阻塞**）：照 §A-3-2 六条剧本执行（跑道独占 `ps` 零 chrome → `E2E_PORT` 隔离 → socket bind 探针 → `set -o pipefail` → `NAV_F3_EXIT=` 尾行 → 产物先归档）；目标 **82 例 0/0/0**；同时**等 `b4694cf` 上的 CI run 33234213554 转绿**（构建面，与 e2e 面分立并行等）。
4. **收 F3 三证并上链**（§A-3-3：`NAV_F3_EXIT=0` 尾行 + `e2e-results.json` stats `readFileSync` 实读 + commit 上链）——**未上链的 ✓ 不构成过门**；跑红则按 §A-3-4 三分账处置，禁单证降级为「环境」。
5. **A-④ 双面齐 → `gh pr ready 166` → squash 合入**，随即写 **SEC-R9**（编号已改配，SEC-R8 被 #181 占用；D-1）。
6. **#177 解冲突**（派实现单或由 #177 原代理续跑）：照 **§C-2 逐块解法**执行 —— 冲突面**已是三文件**（含 `cyber-city-test-framework.md`，§C-2-3），重点核 **42 type 双处改写**、`shot-interrupt` `'teleport'` 存活、**test-framework 合为单章节三行表**；机械并集或留两个同名章节一律打回。
7. **#177 合流树冒烟六例 + astro check/build**（B-3），并复核 §D 三证 / HG-B1 六项 / 默认 OFF 四项 / 六门八禁六项，逐项贴证。
8. **全齐 → `gh pr ready 177` → squash 合入**，随即写 **SEC-R10**（含 86/19 分母与解冲突留痕，D-1）。
9. **fresh `--list` 重算 #104 分母**（期望 86/19），把 ready 门改写为「86 − 2 恒红 = 84 例 0/0/0」，并**开 CC-PERF 规格工单**（D-2 止损条款）。
10. **#104 全量窗排在双落之后**开窗，按 #171 前置 checklist 九项 + #166 先合重建规则执行；互斥令适用，与任何在途审计错峰。

### E-禁项复读（父代理无豁免权）

- **禁合 [#104](https://github.com/rayw-lab/website/pull/104)**：draft 禁 ready 维持，单门 = 86−2 = 84 例 0/0/0 开窗（口径按 D-2 更新后执行）；
- **CAM 视角旋转永不代决**：红线送签稿 [#161](https://github.com/rayw-lab/website/pull/161) 合入 ≠ 指挥官签字，**实现仍禁**；
- **真机 human-gate 六腿永不代决**：性能登记行维持 `—`，口头 85 = 声明档／情报账，**不可登生产**；
- **安卓 / 北极星调整永不代决**（#159 明列指挥官专属）；
- **本单自禁**：本席不合任何 PR、不 ready #166/#177、零 `src/` 改动、不代决上述任何指挥官专属项。

---

## F. 口径小结（r2 重写，三句话交接）

1. **#166 只剩 A-④ 一门**：A-①/②/③/⑤ 已实测过门（fix `fd6cd5c` + 登记 `b4694cf`，k=0 故分母恒 84/18、F3 恒 82 例）；余「CI 五门在最终 tip 转绿」+「**本地跑道** 82 例 0/0/0 三证上链」—— **F3 不挂 CI**（CI 门禁不跑全量 e2e），这是 r1 措辞的实质纠偏。
2. **#177 卡在「后合者义务」**：技术自证齐备，但双用例 PASS 锚在解冲突前的树上，须在合流树重跑；HG-B1 要源码级复核而非声明采信。
3. **两单相撞现为三文件、两个陷阱**：① 白名单计数 39 vs 41 → 真值 **42**；② `cyber-city-test-framework.md` 两侧同名章节同锚点 → 须合成**单章节三行表**（81/17 → 84/18 → 86/19）。两者**CI 都不会红**——这是本次合流「文本能过、语义已错」的全部落点，父代理逐字核。

---

**Refs**：[#178](https://github.com/rayw-lab/website/pull/178)（NAV 段末审计 / fix-forward / F1–F3 预授 GO）· [#179](https://github.com/rayw-lab/website/pull/179)（AUD R3 有条件 GO）· [#172](https://github.com/rayw-lab/website/pull/172)（BGM v0 附条件批准 / HG-B1 / HG-B2 / §D 三证）· [#171](https://github.com/rayw-lab/website/pull/171)（#104 预清 / #166 先合重建规则 / 81-17 剧本）· [#159](https://github.com/rayw-lab/website/pull/159)（站立授权：docs 直合 / 含 src 须董事会急裁 / 三项永不代决）· [#163](https://github.com/rayw-lab/website/pull/163)（DP-1 传送式终裁）· [#158](https://github.com/rayw-lab/website/pull/158)（R5 六门八禁）· [#164](https://github.com/rayw-lab/website/pull/164)／[#165](https://github.com/rayw-lab/website/pull/165)（AUD-C1 与其合入急裁先例）· [#180](https://github.com/rayw-lab/website/pull/180)（停 loop 交接档 / 续任清单）· 体例参照 [`cc-loop-board-aud-r2-e7-dead.md`](cc-loop-board-aud-r2-e7-dead.md)、[`cc-loop-board-bgm-synth-scope.md`](cc-loop-board-bgm-synth-scope.md)
