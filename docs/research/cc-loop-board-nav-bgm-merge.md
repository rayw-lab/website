# CC-LOOP-BOARD-NAV-BGM-MERGE · 董事会急裁（#166 NAV-C1 + #177 BGM-C1 双 src 件合入条件与合流序终裁）

- **角色**：CC-LOOP-BOARD-NAV-BGM-MERGE（事后顾问／董事会，事件驱动）；触发 = 指挥官点名（[范式](cyber-city-orchestration-paradigm.md) §1.3 触发条件③）+ 站立授权 [#159](https://github.com/rayw-lab/website/pull/159)「**含 src 的 PR 须董事会急裁**」程序要件。书面裁决 = 董事会决议，父代理与所有子代理必须执行，冲突时**优先于编排顾问 T\* 与一切实现／审计／调研／脑暴单**。
- **model slug**：`claude-opus-5-thinking-medium`（本席非 Fable5 xhigh 系列，属指挥官当次指定，AGENTS.md §3 末条适用；纪律照董事会件全量执行）。
- **纪律**：零 `src/` 改动；docs-only；一单一 PR；文件域 = 仅本文档；base = `origin/main`@`52887e5`。
- **取证窗口**：2026-08-29 04:15–04:35 UTC，全部经 `gh pr view` / `gh pr checks` / `git merge-tree` / `git diff` 一手实测，**零转述采信**。

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
| **F1** | **main tip = `52887e5`**（[#180](https://github.com/rayw-lab/website/pull/180) CC-LOOP 交接档，2026-08-28 23:06:52 UTC 合入）。看板顶块自述锚 `4a58789` **已 stale 四代**（`4a58789` → `9e7c560`（#179）→ `52887e5`（#180）路径上另含 #178），SEC-R8 须重锚 | `git fetch --prune` + `git log -1 origin/main` |
| **F2** | **[#166](https://github.com/rayw-lab/website/pull/166) tip 仍 = `5faab5f`**（2026-08-28 15:01:38 UTC 解冲突 merge commit）——**审计点名的 fix commit（F1 CSS 让位 + F2 双钮不相交断言）截至本窗尚未落分支**。state=OPEN · isDraft=**true** · mergeable=MERGEABLE · mergeStateStatus=CLEAN · updatedAt 2026-08-28T15:01:41Z | `gh pr view 166 --json headRefOid,isDraft,mergeable,mergeStateStatus` |
| **F3** | #166 CI 门禁（check / build / links / budget / lighthouse）**pass 5m0s**，run [33183113406](https://github.com/rayw-lab/website/actions/runs/33183113406)——**该绿证锚在 `5faab5f`，对 fix 后 tip 无效** | `gh pr checks 166` |
| **F4** | **[#177](https://github.com/rayw-lab/website/pull/177) tip = `2b00c31`**（同步 main@`4a58789` 的 merge commit，2026-08-28 17:06:44 UTC）。OPEN · draft=true · MERGEABLE · CLEAN；CI 门禁 **pass 4m57s**，run [33193285568](https://github.com/rayw-lab/website/actions/runs/33193285568) | `gh pr view 177` + `gh pr checks 177` |
| **F5** | **两 PR 各自对 main 零冲突**：`merge-tree origin/main × #166` → 树 `8105e8b`，零 CONFLICT；`merge-tree origin/main × #177` → 树 `7d7b807`，零 CONFLICT | `git merge-tree --write-tree --name-only` ×2 |
| **F6** | **#166 × #177 CONFLICTING 复核成立，冲突面恰为二**：`docs/spec/cyber-city-observability.md`（content）+ `src/lab/world/core/SessionTimeline.ts`（content）；无第三文件、无 rename／delete 类冲突 | `git merge-tree --write-tree --name-only <166> <177>` → 树 `498a861` + 两条 CONFLICT (content) |
| **F7** | **冲突实体已逐块读明**（§C 解法据此）：两侧同时改 `WHITELIST.ux` **同一行**、同时在**同一注释锚点**（`[CC-AUD-C1]` 段尾）插入随行段；observability 两侧同时改 §0 第 3 点**同一长句**并同时在 §3.4 表 `world-audio` 行后插入新行 | `git diff origin/main...<each> -- <两文件>` |
| **F8** | **计数自述互斥（naive union 必踩的 stale 陷阱）**：main 基线 = 38 type／10 族；#166 自述 **41 type**（+minimap ×3）、#177 自述 **39 type**（+world-bgm ×1）——两侧合流后真值 = **42 type／10 族**，任何「保留双方文字」的机械并集都会在同一文件留下 39 与 41 两处错数 | 两侧 diff 文本 + 白名单实体计数 |
| **F9** | **e2e 分母（静态复算，与 `--list` 单源口径同源）**：main = **81 tests／17 files**（逐 spec `test(` 计数求和 = 81，spec 文件 17 枚，与 [#171](https://github.com/rayw-lab/website/pull/171) 预清登记的 81/17 一致）；#166 新增 `e2e/cyber-city-minimap.spec.ts` **+3** → **84/18**（另改 `cyber-city-feedback.spec.ts` 为**原地断言加词**「M 地图」，用例数零变化）；#177 新增 `e2e/cyber-city-bgm.spec.ts` **+2** → **83/18**；**两者全落 = 86 tests／19 files** | `git ls-tree` + 逐文件 `rg -c '^\s*test\('` |
| **F10** | **登记单源欠账**：#177 已在 `docs/research/cyber-city-test-framework.md` 登记「81/17 → 83/18」；**#166 全 diff 零触该文件**（file list 八项无之）——#166 的 81→84 登记缺失，且 #177 已登的 83/18 在 #166 落地后即变 stale | `git diff --name-only origin/main...<each>` |
| **F11** | 文件域实测：#166 = 8 文件（obs spec + 2 e2e + `PoiArrival.ts`／`SessionTimeline.ts`／`index.ts`／`ui/Minimap.ts`／`world/Reveal.ts`，908+/9−）；#177 = 6 文件（test-framework + obs spec + 1 e2e + `audio/BgmLoop.ts`／`audio/WorldAudio.ts`／`SessionTimeline.ts`，719+/6−）——`public/` 零触、`package.json`／`pnpm-lock.yaml` 零触（#177 §D 证一机器面成立） | `git diff --stat --name-only` ×2 |
| **F12** | 前置裁决在案：[#178](https://github.com/rayw-lab/website/pull/178) MERGED（NAV 审计 fix-forward，唯一欠账 = 右上角 NAV×AUD 双钮重叠，F1–F3 过门**预授 GO**，F3 口径 84−2 规格恒红 = 82 例）· [#179](https://github.com/rayw-lab/website/pull/179) MERGED（AUD R3 有条件 GO，#164 零回归）· [#172](https://github.com/rayw-lab/website/pull/172) = BGM v0 附条件批准（HG-B1／HG-B2／§D 三证／六门八禁） | `gh pr view 178/179` + main 一手文档 |
| **F13** | 开放 PR 全景（12 枚，含冻结件）：工程三主件 [#177](https://github.com/rayw-lab/website/pull/177)／[#166](https://github.com/rayw-lab/website/pull/166)／[#104](https://github.com/rayw-lab/website/pull/104) 全 draft；#104 tip `bbba5a5` 禁 ready 维持 | `gh pr list --state open` |

---

## 1. 一行裁决表（A–E）

| 议题 | 一行终裁 |
|------|---------|
| **A · #166 合入条件** | **附条件 GO**——fix 后 tip 上「F1 CSS 让位 + F2 双钮不相交断言 + F3 云机复跑 82 例（84−2 规格恒红）+ CI 门禁重跑绿 + test-framework 登记 81→84」五条齐备，方可 draft→ready→**squash**；F3 **只认 CI／云机**，本机跑数一律不算数 |
| **B · #177 合入条件** | **附条件 GO**——§D 三证机器复核 + HG-B1 双 param 互斥源码级复核 + HG-B2 双用例**在合流树上重跑**（非分支自跑）+ 默认 OFF 单常量位复验 + 六门八禁六项抽查，全齐方可 ready→squash |
| **C · 合流序** | **维持 #166 先（fix 后）→ #177 后**，后合者 #177 负全部解冲突；解法 = SessionTimeline 白名单 ux 族 11 type 双全 + **两处计数自述统一改写 42 type／10 族**（禁机械并集留 39／41）+ observability §0-3 合并为单条 42 子句 + §3.4 四行全保（world-bgm 紧随 world-audio，minimap 三连续后）+ 后合者补登 86/19 |
| **D · 合入后义务** | SEC-R8（#166 落地）／SEC-R9（#177 落地）两收账行字段固定；**#104 ready 门分母 81 → 86 fresh 重算**（禁沿用 83／84），开窗口径 = 86−2 规格恒红 = **84 例 0/0/0**；e2e 基线重建以 86/19 为唯一分母，并开 CC-PERF 规格工单清 CITY-PERF-01/02 恒红 |
| **E · 父代理清单** | 十条执行清单见 §E；禁项复读四条：**禁合 #104**、**CAM 视角旋转永不代决**、**真机六腿永不代决**、**安卓／北极星调整永不代决** |

---

## A. 终裁一：#166 NAV-C1 合入条件（附条件 GO，五条硬门）

### A-1 程序定位

#178 已作出「fix-forward + 补洞过门后**预授 GO**」的审计裁决，故本席**不重开 #166 的技术审**（避免二次审计化）；本单只做站立授权 #159 要求的**含 src 合入急裁**，即把「预授 GO」翻译成父代理可机械核验的合入前置条件，并补齐审计未覆盖的**登记单源与绿证时效**两处程序缺口。

### A-2 五条硬门（缺一即打回，条件式书写——**以 fix 后 tip 为准**）

| 门 | 口径 | 机器可核方式 |
|---|------|------------|
| **A-①（fix 落地）** | 分支 tip **≠ `5faab5f`**，且 `git diff 5faab5f..<新 tip>` **只含**：`src/lab/world/ui/Minimap.ts` 的钮定位 CSS 一处（F1）+ e2e 断言（F2）+ 可选 `docs/research/cyber-city-test-framework.md` 登记（A-⑤）。出现任何第四类文件 = **越域，打回**，不得以「顺手」名义扩批 | `git log 5faab5f..HEAD` + `git diff --name-only` |
| **A-②（F1 实质）** | 小地图钮不再压占 `.world-audio-toggle`（top:.85rem／right:.95rem）命中区；**让位方向由实现自裁**（下移／左移／同栏排布皆可），但禁改音频钮既有坐标（AUD-C1 已落 main，改它 = 动既有验收面） | diff 阅读 + F2 断言代跑 |
| **A-③（F2 实质）** | 新增回归断言：两钮 `boundingBox()` **不相交**（非「都可见」——可见但重叠正是本次破门形态）；断言须落在**常驻 spec**（`cyber-city-minimap.spec.ts` 或 `cyber-city-audio.spec.ts`），禁落一次性脚本；断言若新增 `test()` 则分母同步 +N（见 A-⑤ 公式） | `rg 'boundingBox' e2e/` + 断言文本 |
| **A-④（F3 复跑 + 绿证）** | ①**全量复跑口径 = 84 − 2 规格恒红（CITY-PERF-01／02）= 82 例，0 failed／0 skipped／0 flaky**；②**执行环境只认 CI／标准 e2e 云机**——见 A-3 口径终裁；③CI 门禁（check/build/links/budget/lighthouse）**必须在 fix 后 tip 上重跑绿**，`5faab5f` 上的 run 33183113406（F3）**不得复用**（绿证随 tip 失效，非随 PR） | `gh pr checks 166` fresh + 云机全量报告 |
| **A-⑤（登记单源）** | 补 `docs/research/cyber-city-test-framework.md` 用例数登记表一行：main@`52887e5` 81/17 → **CC-NAV-C1 合入后 84/18**（若 F2 断言新增 k 个 `test()`，则登记 **(84+k)/18**，F3 分母同步为 **82+k**）。#166 全 diff 零触该文件（F10）= 单源纪律欠账，**本条为本席新增硬门**，非 #178 遗漏之复读 | `git diff --name-only` 含该文件 + 表内新行 |

### A-3 F3 复跑口径终裁：**本机不算数，CI／云机算数**

**裁定**：#166 的 F3 全量复跑，**只有标准 e2e 云机（或 CI runner）产出的报告可作过门证据**；本 VM（4 核，`/tmp/*-wt` 多 worktree 共享）跑数**降格为诊断信息，不得作放行依据**。

理由三条（均为在案实测，非推断）：

1. **本机跑道已被实证污染**：#178 审计避坑条明载「共享 checkout 跑道三连抢占实录」；#177 §验证证据独立记录同一现象——CITY-AUD-01 首轮 420s 超时的 trace 逐动作计时为**纯时钟耗尽、零断言失败**（挂载 127s／CTA 30.6s／静音钮 51.6s），同窗 `ps` 实测存在 NAV 侧代理两个并发 chrome gpu-process 各 >100% CPU。两个互不相干的子代理在同一 VM 撞出同款指纹 = 环境结论，不是巧合。
2. **口径已有先例**：LHCI 本机 SwiftShader null → 用同 SHA green CI artifact 回填（范式 §3.5 高频坑），#178 的 LHCI 过门正是这么办的。时长敏感门走 CI 是既定做法，本条只是把 e2e 时长门并入同一原则。
3. **反向风险不对称**：本机误绿（挤兑下 flaky 被当真绿）会把 src 缺陷放进 main；本机误红只是多跑一轮。故门只朝一个方向收紧。

**推论（父代理须执行）**：F3 若已在本机跑出结果，**登记为诊断附录**并在 SEC-R8 注明「非过门证据」；过门另需一份云机／CI 报告。若云机窗与 #104 全量窗冲突，**互斥令适用，#166 F3 优先**（#104 ready 门本身依赖 #166 先合，见 §D-2）。

### A-4 程序：draft → ready → squash

1. A-①…A-⑤ 五门齐 → 父代理在 PR 评论贴**五门对号清单**（每门一行证据链接／SHA）；
2. `gh pr ready 166` —— **本单不代 ready、不代合**（禁项）；ready 的执行权在父代理，但**只在五门齐后**；
3. 合入方式 = **squash**（与 #164 先例一致，保 main 线性）；commit message 须含 `CC-NAV-C1` 与 fix 后 tip 短 SHA；
4. 合入后立即执行 §D-1 的 SEC-R8 登记，**不得跨 tick 拖欠**。

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

跑数环境口径同 A-3（云机／CI 优先；本机结果作诊断）。**「文本零冲突 ≠ 语义零冲突」**（范式 W2 已知坑）在此适用——本次是文本**有**冲突，语义风险只会更高。

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
3. **取证锚稳定性**：#178 的全套取证（DP-1／DP-3／VIS-01–04／LHCI 回填）锚在「#166 tip ⊕ main」集成树。让 #166 后合 = 其取证树失锚，F3 须整轮重跑，浪费一轮云机窗。
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

#### C-2-3 后合者附加两项义务

1. **登记单源补行**：`docs/research/cyber-city-test-framework.md` 用例数登记表新增一行 —— `#166 + #177 全落 → **86 tests / 19 files**`（若 #166 F2 断言新增 k 个 `test()`，则为 `(86+k)/19`）；同时把已登的「CC-BGM-C1 合入后 83/18」一行标注为「**#166 未合时点值，已由 86/19 行接替**」（不改史、只加时点标注）。
2. **合流树冒烟**：§B-3 六例 + `astro check`／`build`，报告贴 PR。

### C-3 反序备选（仅一种触发条件，判定为次优）

若 **#166 fix commit 自本裁决合入起 24h 内仍未落分支**（`ls-remote` 实测 tip 恒为 `5faab5f`），允许启用反序（#177 先 → #166 后合解冲突），代价三条须同时接受并登记：① 书面修订 #171「#166 先合重建规则」；② #166 变后合者，承担同一两文件冲突（解法对称照 C-2 执行，计数仍为 42）；③ #178 取证树失锚，#166 的 F3 须整轮重跑。**除该触发条件外，任何理由的反序均属违裁。**

---

## D. 终裁四：合入后义务（三项，逐项字段化）

### D-1 SEC-R8 / SEC-R9 看板登记行（`cyber-city-score-loop-orchestration.md` 单源）

**SEC-R8（#166 落地后立即，同 tick 不得拖欠）**必含字段：

1. **重锚**：顶块 main 锚从 stale 的 `4a58789` 更新至 `52887e5` → #166 squash 后新 tip（F1 指出的四代 stale 一并清）；
2. #166 → mergeCommit SHA + mergedAt（`gh pr view 166 --json mergeCommit,mergedAt` 实测，禁手拼）；
3. **五门对号**：A-①…A-⑤ 逐门证据（fix SHA／F2 断言位置／F3 云机报告 82（或 82+k）例 0/0/0／CI run URL／test-framework 登记行）；
4. 本裁决件（本 PR）合入 SHA + 「含 src 合入急裁程序合规」一句（#159 要件留痕）；
5. 在途表：#166 移出在途 → MERGE-WAVE 新表一行；#177 在途行更新为「后合者，冲突解法照 board-nav-bgm-merge §C-2」；
6. **登记矩阵维持 80 / 73 / 87 / —**（#166 为体验增项，不触登记分；性能行维持 `—`，解锁条件 = 真机六腿 → AL-PERF）。

**SEC-R9（#177 落地后）**必含字段：

1. #177 → mergeCommit + mergedAt 实测；
2. **§D 三证 + HG-B1 六项 + HG-B2 合流树六例 + 默认 OFF 四项 + 六门八禁六项**逐项对号；
3. 解冲突结果留痕：白名单 ux 族 **11 type / 42 total / 10 族**、observability §0-3 合并子句、§3.4 四行序、`shot-interrupt` `'teleport'` 存活；
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
4. **基线图纪律**：两单均未改 poster／像素基线（#177 断言 J 走既有回归面）——SEC-R9 须明示「基线图零改动」，若出现基线更新则须单列并复核动机。

---

## E. 父代理 Tick 立即执行清单（十条，按序）

1. **合本裁决件**（本 PR，docs-only）——站立授权 #159 docs 直合，squash；合入 SHA 记入 SEC-R8 字段 4。
2. **fresh 复核 #166 tip**（`gh pr view 166 --json headRefOid` + `git ls-remote`）：若仍 `5faab5f` → 派 fix 单（域 = Minimap.ts CSS 一处 + e2e 断言，任务书内嵌 A-①…A-⑤ 全文）；若已推进 → 直接跑 A-② / A-③ 逐门核验（**以 fix 后 tip 为准**）。
3. **排 #166 的 F3 云机窗**（82 或 82+k 例 0/0/0）+ **CI 门禁在 fix 后 tip 上重跑**；本机既有跑数只作诊断附录（A-3）。
4. **补 #166 的 test-framework 登记行**（81→84 或 84+k，A-⑤）——可随 fix 单同 PR，禁另开 PR。
5. **五门齐 → `gh pr ready 166` → squash 合入**，随即写 **SEC-R8**（含顶块四代 stale 重锚，D-1）。
6. **#177 解冲突**（派实现单或由 #177 原代理续跑）：照 **§C-2 逐块解法**执行，重点核 **42 type 双处改写**与 `shot-interrupt` `'teleport'` 存活；机械并集打回。
7. **#177 合流树冒烟六例 + astro check/build**（B-3），并复核 §D 三证 / HG-B1 六项 / 默认 OFF 四项 / 六门八禁六项，逐项贴证。
8. **全齐 → `gh pr ready 177` → squash 合入**，随即写 **SEC-R9**（含 86/19 分母与解冲突留痕，D-1）。
9. **fresh `--list` 重算 #104 分母**（期望 86/19），把 ready 门改写为「86 − 2 恒红 = 84 例 0/0/0」，并**开 CC-PERF 规格工单**（D-2 止损条款）。
10. **#104 全量窗排在双落之后**开窗，按 #171 前置 checklist 九项 + #166 先合重建规则执行；互斥令适用，与任何在途审计错峰。

### E-禁项复读（父代理无豁免权）

- **禁合 [#104](https://github.com/rayw-lab/website/pull/104)**：draft 禁 ready 维持，单门 = 86−2 = 84 例 0/0/0 开窗（口径按 D-2 更新后执行）；
- **CAM 视角旋转永不代决**：红线送签稿 [#161](https://github.com/rayw-lab/website/pull/161) 合入 ≠ 指挥官签字，**实现仍禁**；
- **真机 human-gate 六腿永不代决**：性能登记行维持 `—`，口头 85 = 声明档／情报账，**不可登生产**；
- **安卓 / 北极星调整永不代决**（#159 明列指挥官专属）；
- **本单自禁**：本席不合任何 PR、不 ready #166/#177、零 `src/` 改动、不代决上述任何指挥官专属项。

---

## F. 口径小结（三句话交接）

1. **#166 卡在五门**：fix 未落（F2 实测）是当前唯一实质阻塞；绿证随 tip 失效，本机跑数不算数；登记单源欠一行。
2. **#177 卡在「后合者义务」**：技术自证齐备，但双用例 PASS 锚在解冲突前的树上，须在合流树重跑；HG-B1 要源码级复核而非声明采信。
3. **两单相撞只有两文件、一个真陷阱**：白名单计数 39 vs 41 → 真值 42。机械并集会静默留下两处错数，且 CI 不会红——这是本次合流唯一「文本能过、语义已错」的点，父代理逐字核。

---

**Refs**：[#178](https://github.com/rayw-lab/website/pull/178)（NAV 段末审计 / fix-forward / F1–F3 预授 GO）· [#179](https://github.com/rayw-lab/website/pull/179)（AUD R3 有条件 GO）· [#172](https://github.com/rayw-lab/website/pull/172)（BGM v0 附条件批准 / HG-B1 / HG-B2 / §D 三证）· [#171](https://github.com/rayw-lab/website/pull/171)（#104 预清 / #166 先合重建规则 / 81-17 剧本）· [#159](https://github.com/rayw-lab/website/pull/159)（站立授权：docs 直合 / 含 src 须董事会急裁 / 三项永不代决）· [#163](https://github.com/rayw-lab/website/pull/163)（DP-1 传送式终裁）· [#158](https://github.com/rayw-lab/website/pull/158)（R5 六门八禁）· [#164](https://github.com/rayw-lab/website/pull/164)／[#165](https://github.com/rayw-lab/website/pull/165)（AUD-C1 与其合入急裁先例）· [#180](https://github.com/rayw-lab/website/pull/180)（停 loop 交接档 / 续任清单）· 体例参照 [`cc-loop-board-aud-r2-e7-dead.md`](cc-loop-board-aud-r2-e7-dead.md)、[`cc-loop-board-bgm-synth-scope.md`](cc-loop-board-bgm-synth-scope.md)
