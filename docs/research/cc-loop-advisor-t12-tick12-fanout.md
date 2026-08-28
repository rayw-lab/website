# CC-LOOP-ADVISOR-T12 · Tick#12 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T12（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 04:30–04:36 UTC，全部一手取证（ps / tmux capture-pane / 文件 mtime 全 ISO / gh API / ls-remote / cloud-agent 面板 API）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t12-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：简报四问中两问已被事件超越——TRIAGE-WRAP 对照跑 **04:26 已自然收轮（1 failed，判读 B）**，T11 顾问 **04:33 已交付（PR #124）**；另实锤 **JSON 覆写坑第三次兑现（04:33:00 收轮后覆写）**，为新变体

---

## 0. 事实核查——五条推翻/超越 Tick#12 简报的 fresh 事实

| # | 简报口径 | 实测（04:30–04:36 UTC） | 证据 |
|---|---------|------------------------|------|
| F1 | 「TRIAGE-WRAP 仍 RUNNING（定向测长跑）」 | **定向测已于 04:26 自然收轮，1 failed**：进程表 04:31/04:34 两次复核零 playwright/astro-build 进程；`/tmp/main-exp01.log` 末行 `1 failed`（12.3m）；失败目录 + `trace.zip` 04:26:23 落盘。main 树同断言失败：`泊车位 (-28,-28) 应可达（实测 x=25.2 z=-25.7）`——T9 §6.3 判读表 **B 分支**，与 T11 F4/F5 互证一致 | ps + log 末行 + `ls --time-style=full-iso` |
| F2 | 「T11 顾问仍 RUNNING」 | **T11 已交付**：commit `ac003ef`（04:33:31Z）已推送，PR [#124](https://github.com/rayw-lab/website/pull/124) draft 已开。终稿已吸收对照跑收轮结局，完成机制级判读 B 对号（main = 出泊 0–1 km/h 爬行超时；X2 = 17 km/h 楔死楼排墙角；**双因并立，X2 碰撞归因不翻案**）。面板 RUNNING = 收尾余量，非 stale | `git -C /tmp/t11-wt log` + gh pr list |
| F3 | （简报未及） | **JSON 覆写坑第三次兑现，新变体（收轮后覆写）**：`/tmp/main-wt/test-results/e2e-results.json` 于 **04:33:00.775** 被一次 ~0.6s 的 playwright 清点动作覆写为 `{expected:0, skipped:80, unexpected:0, duration:560ms}`（80 例全 skipped、零执行——`--list`/清点签名）。**T11 F4 引用的权威 stats `{unexpected:1, duration:743954ms}` 在盘面上已不存在**，唯一存续快照 = T11 文档正文。覆写者为 TRIAGE-WRAP wrap 清点或 T11 校验 80 例口径（04:33:00 与 T11 commit 04:33:31 仅隔 31s，无法定谳，也无需定谳——教训相同） | mtime 04:33:00.775 vs 失败目录 04:26:23 + JSON stats 实读 |
| F4 | （简报未及） | **秘书 P7 已在途**：`/tmp/wt-sec-p7` 分支 `cursor/cc-loop-sec-p7-5b71`，**栈在 P6 tip `b7dc652` 上**（未从 main 重开），看板文件已有未提交修改；对应面板代理「Tick#12 秘书看板刷新」RUNNING（04:30:27 起） | worktree status + 面板 API |
| F5 | 「#104 tip 仍 c24c7f3 draft；#103/#121 未合」 | 复核不变：#104 tip `c24c7f3` draft（tip CI 绿）；#103 OPEN/非 draft/MERGEABLE（`1a4296f`）；#121 OPEN/draft（`b7dc652`）；**plug / ENV 专项分支均未开**（ls-remote 实测）；main @ `88097f9` 无新合入 | gh + ls-remote |

**勘误精确化（供秘书 P7 一并登记）**：push 实测 remote 提示「This repository moved → `rayw-lab/website.git`」——**仓库已由 `mywebsite` 改名为 `website`**，本 VM origin 仍指旧名靠 GitHub 301 重定向工作。T11 等文档内的 `mywebsite` 链接经重定向**可达、非死链**，但登记应统一用 `gh` 输出的规范名 `rayw-lab/website`（手册 §3.5 坑表可补此因：非「错写」而是改名遗留）。

---

## 1. TRIAGE-WRAP 长跑阈值裁决 + 父代理动作（任务 ①）

### 1.1 「>10min 派定向测」阈值判定：**不成立**，且已被收轮事实 moot

简报之问是「TRIAGE-WRAP 长跑超 10min 是否要另派定向测」。裁决：**10min 不是本用例的有效判死线，本轮也无需任何新定向测**。

| 阈值 | 口径 | 依据 |
|------|------|------|
| 10min | **单腿预算下限，非判死线**：`driveTo` 单腿 `timeoutMs=600_000`（10min），失败腿会烧满才返回 | `e2e/cyber-city-explore.spec.ts:295`（对照跑 log 引用行实读） |
| 12–15min | 定向测 CITY-EXP-01 实测经验带：X2 树 14.8m（T10 取证）、main 树 12.3m（本轮 log） | 两轮一手数据 |
| 40min | spec 硬顶 `test.setTimeout(2_400_000)`，playwright 到点自杀收场，**无需外部干预** | T10 §1.2 / T11 deadline 算术 |
| 40min + ~5min | 仅当「进程仍存活 + 日志/产物零增长」同时成立才升级僵死；处置 = 具体 PID 精确 kill，严禁按名杀 | T11 §1.3 协议沿用 |

结论：对 CITY-EXP-01 一类含 10min 级单腿预算的定向测，**任何 <40min 的墙钟都在设计内**；父代理判活只看「日志/产物 mtime 是否推进」，不看绝对时长。本轮定向测 12.3m 自然收轮（F1），阈值之问失效。

### 1.2 收轮三证与证据链现状（含 F3 警示）

三证合一已达成：① 进程自然退出（04:27 起两次复核消失）② log 末行 `1 failed` ③ error-context + trace.zip 04:26:23 落盘。**但注意 F3**：三证中的 JSON stats 腿已在 04:33 被事后覆写摧毁——当前盘面上 `/tmp/main-wt/test-results/e2e-results.json` 是 `{skipped:80}` 垃圾值，**任何下游（ENV 专项、秘书、后续审计）不得再引用该文件**，权威 = `/tmp/main-exp01.log` 末行 + T11 F4 正文快照 + trace/error-context 原件。

### 1.3 父代理动作清单（本 tick 内，按序）

1. **证据归档（第一动作，零成本防再覆写）**：`mkdir -p /tmp/evidence-exp01 && cp -a /tmp/main-exp01.log "/tmp/main-wt/test-results/cyber-city-explore-科技城探索计数-5ab23--重复进圈去重-→-reload-持久还原（埋点互证）-world-chromium" /tmp/evidence-exp01/`，连同 `/tmp/x2-wt/test-results` 的 EXP-01 trace 一并归档。F3 证明「留在原地的产物会被后续动作覆写」，此前 run2 已覆写过一次、本轮收轮后又覆写一次——**归档纪律必须前置到收轮当刻**，不能等派单交接。
2. **等 TRIAGE-WRAP wrap 报告，deadline = Tick#13 开局（~04:50）**：其 shell 块产物齐备，Task 04:33 前后仍有活动迹象（F3 覆写者候选之一），预期正在写判读。勿催、勿代写、勿中止。
3. **Tick#13 开局若报告仍未落且零进程/零推送**：按「RUNNING 标签不作活性证据」协议处置——中止 TRIAGE-WRAP，台账记「定向测产物已收割（归档目录 + T11 F4 快照）」；ENV 专项任务卡改引 T11 §0 F4/F5 + 本文档 §0 F3 直接开工，**不为缺一份 wrap 报告空转一个 tick**。
4. **JSON 覆写警示广播**：凡后续在 `/tmp/main-wt` 或 `/tmp/x2-wt` 起任何 playwright 动作（含 `--list`）的任务卡，一律加一行「动作前先归档 test-results，动作后禁止引用被覆写的 e2e-results.json」。

---

## 2. Tick#12 秘书 P7 要点（任务 ②，给在途 `cursor/cc-loop-sec-p7-5b71`）

P7 已在途（F4），栈序正确（base = P6 tip `b7dc652`，PR 栈场景②沿用秘书链惯例）。上板要点按优先级：

1. **登记矩阵四行照抄不变**：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能）；性能显式写 **—**，解锁条件 = 真机 human-gate 六腿 → AL-PERF。
2. **tick 计数补登 #10–#12**（3n 界点）：T10 → [#123](https://github.com/rayw-lab/website/pull/123)；T11 → [#124](https://github.com/rayw-lab/website/pull/124)；T12 → 本文档 PR。
3. **X2 行措辞采 T11 §4.4 建议稿**，并追加一句 F3 增量：「main 侧 e2e-results.json 04:33 被收轮后清点覆写（{skipped:80} 无效值），权威计数 = list 日志末行 + T11 F4 快照；证据已归档（§1.3-1 目录）」。
4. **T9 纠偏行**：撤「未交付废弃」，改记「已交付 [#122](https://github.com/rayw-lab/website/pull/122)，采其 §1+§6 为 X2 triage 权威」。
5. **TRIAGE-WRAP 行**：「定向测 04:26 自然收轮 1 failed（判读 B 兑现，双因并立）；wrap 报告在途，deadline Tick#13 开局，缺位按产物已收割中止」。
6. **#103/#121 复读**（T10 §4 模板不变形）：#103 ready/MERGEABLE 待指挥官点合；#121 不合则看板单源持续漂移，且 **P7 叠其上，栈深已 2**——#121 拖得越久，秘书链栈越深，建议指挥官本轮一并处理（顺序 #103 → #121 → P7）；视觉 71/73 双源分歧随 #121 合流定谳。
7. **stale 台账**：按本文档 §4 表登记（原 X2 代理 stale 坐实待中止、TRIAGE-WRAP 观察至 deadline、T9/T10/T11 已交付非 stale）。
8. **勘误行**：仓库已改名 `mywebsite` → `website`（301 重定向），T11 等文档的旧名链接可达但非规范；不改已推送文档本体，看板登记统一规范名 `rayw-lab/website` 即可。
9. **纪律复读**：顾问文档（#122–#124 + 本 PR）均不写看板，单源在秘书链；P7 一次 commit 收口，勿多处登记。

---

## 3. Tick#13 预排：plug 分支 vs 续 #104（任务 ③）

### 3.1 核心裁决：**开独立 plug 栈分支 GO，续写 #104 分支 NO**

| 方案 | 裁决 | 理由 |
|------|------|------|
| **A. 独立 plug 分支** `cursor/cc-vis-x2-plug-5b71`，base = `c24c7f3`（#104 tip，栈场景①） | **GO** | ① 原 X2 代理 stale 失联（§4），直接续推其分支会与「代理若复活继续推 tip」产生所有权竞态；新分支零竞态。② `c24c7f3` 是 tip CI 绿的固定基线——plug 归因验收需要「前后帧对照 + 固定 base」，冻结它。③ 符合 AGENTS.md PR 栈场景①（门控补洞段叠未合前段），审计时自建「候选 ⊕ main」集成树即可。④ 登记成本一行：栈序 #104(`c24c7f3`) → plug，base SHA 上板 |
| B. 直接在 `cursor/cc-vis-x2-facade-r2-1d6f` 上续 commit（"续 #104"） | **NO** | 破坏归因基线（tip 漂移后 T9/T10/T11 全部坐标级证据失去锚点）；与 stale 代理竞态；且 #104 禁 ready 期间在其分支堆修复 commit，会诱发「顺手 undraft」误操作 |

**#104 处置**：维持 draft 冻结在 `c24c7f3`，**禁 ready 复读**——X2 树 3 例确证 FAIL（EXP-01 / QST-02 / FB-01…09）锁死，复活门 = ENV 定谳 + plug 双清 + 验收轮全量全绿（80 用例 0 failed / 0 skipped / 0 flaky，T11 §2.4-4 口径，门不降）。plug 段收口后由父代理按审计指定方式合回/叠加，届时再动 #104 状态。

### 3.2 Tick#13 编排（前提分支化）

| 前提（Tick#13 开局实况） | 编排 |
|--------------------------|------|
| 父代理已在 Tick#12 内派出 ENV 专项 + plug 实现段（T11 §3 T12-A/B） | **T13-A** 双路监跑（判活只看产物 mtime，见 §1.1 阈值表精神）；**T13-B** TRIAGE-WRAP 截止裁决（§1.3-3）；**T13-C** 原 X2 代理中止执行（plug Task 确认接管取证指针后，T11 §4.2 时序步 2）；**T13-D** 秘书 P7 若未收口则催收口。新派 0–1 路 |
| Tick#12 未派（父代理等 T11/T12 裁决落地） | Tick#13 开局**即发两卡**：ENV 专项（T11 §2.3 原文 + 本文档 §1.3-1 归档为第一动作 + §1.2 JSON 警示 + wrap 报告缺位时引 T11 F4/F5 开工）、plug 实现段（T11 §2.4 原文 + §3.1-A 分支口径）。两路并行，文件域正交（ENV 只写 docs，plug 改 X2 栈分支引擎面）；plug 验收全量 e2e HOLD 待 ENV §2.3-④ 签字。加秘书/复读共 3 路，符合 2–6 约束 |
| 任一前提下均适用 | **不派任何「修复前全量 e2e」**（X2 树 EXP-01 必挂、main 树 EXP-01 也挂，双废轮，T11 §2.2 维持）；QST-02/FB 族「异根 vs 挤兑」裁决挂 plug 验收轮；T7-A 视觉审计维持**事件门**（ENV 定谳 + plug 双清 + 验收轮全绿 + #104 undraft 门禁 fresh 绿 + X2 线 IDLE），Tick#13 不派 |

---

## 4. stale 代理清单（任务 ④，04:30–04:35 面板 API + 进程/产物 fresh 取证）

| 代理（面板名） | 状态 | fresh 取证 | 判定 | 处置 |
|----------------|------|-----------|------|------|
| P1 X2 rebase e2e ready（bc-0364bcc9，02:50:33 起） | RUNNING | `x2-e2e` pane 04:13 `^C` 后至 04:34 复核仍停 `x2-wt $` 提示符，**>80min 零输出零新进程** | **stale 坐实**（唯一） | 沿 T11 §4.2 两步时序：本 tick 不动（`/tmp/x2-wt/test-results` 是 ENV/plug 取证输入）；plug Task 确认接管取证指针后中止，台账记「run2 自杀收尾未回报，产物由 ENV/plug 收割」；`x2-e2e` tmux 会话留到 plug 归档后 kill-session |
| X2 e2e 失败归因收尾 = TRIAGE-WRAP（bc-ace126a4，04:18:23 起） | RUNNING | 定向测 04:26 自然收轮；04:33 main-wt 有 ~0.6s playwright 清点写盘（活动迹象，归属候选） | **非 stale，观察窗** | 等 wrap 报告至 Tick#13 开局（§1.3-2/3）；缺位即中止并登记「产物已收割」 |
| Tick#11 顾问 X2 triage（bc-f925f524，04:20:28 起） | RUNNING | 已交付 `ac003ef` + [#124](https://github.com/rayw-lab/website/pull/124)（04:33–04:34） | **非 stale**（收尾余量） | 自然结束；勿中止勿重派；面板噪声不可忍时可安全中止（零副作用） |
| Tick#12 秘书看板刷新（bc-7c51749c，04:30:27 起） | RUNNING | `/tmp/wt-sec-p7` 看板文件已有未提交修改（在途干活） | 非 stale | 按 §2 要点收口 |
| Tick#12 顾问 triage 跟进（bc-5cbc4594，04:30:26 起） | RUNNING | 即本顾问 | — | 本文档交付即自然结束 |
| T2–T10 顾问、P3–P6 秘书、#103 落库审计、Codex 清账等 ~15 个 | IDLE | 交付物均已入库（#109–#123 链可查） | 非 stale（已收轮） | 无需处置；面板降噪可批量归档 |
| （非代理）`astro preview` PID 12642 端口 4475，cwd `/tmp/wt-fxn-audit-771b1e4`，>1.5h | 进程 | #120 落库审计遗留预览服务，审计已交付 | 资源残留 | 非必须；父代理确认无人复用后按 PID 精确 kill 回收（严禁按名杀）。同源核查 `fxn-codex-preview` tmux 会话 |

**范式沉淀增量（一条，续 T11 三条之后，建议随 ENV/plug 报告入手册 §3.5）**：**产物就地即险**——e2e 产物目录是共享可变状态，同 cwd 的任何后续 playwright 动作（含 `--list` 清点）都会覆写 `e2e-results.json`；收轮当刻归档（时间戳目录 + 只读引用）应成为收轮三证之后的强制第四步。本轮教训链：run2 中断覆写（第一次）→ T9 预警 → T11 写入任务卡硬门 → **收轮后清点再覆写（第三次，新变体）**，证明「写进任务卡」不够，要「收轮即归档」。

---

## 5. 裁决一览（父代理直接执行）

1. **阈值之问**：>10min 不是定向测判死线（单腿预算即 10min）；判活看产物 mtime 推进，40min spec 硬顶自杀收场，40min+5min 零增长才升级僵死（PID 精确 kill）。本轮已 12.3m 自然收轮，问题 moot。
2. **第一动作**：按 §1.3-1 归档 main/X2 两侧 EXP-01 证据（JSON 覆写坑三度兑现，盘面 stats 已是垃圾值，勿再引用）。
3. **TRIAGE-WRAP**：等 wrap 报告至 Tick#13 开局；缺位即中止收割，ENV 专项引 T11 F4/F5 + 本文 §0-F3 开工。
4. **秘书 P7**：按 §2 九条要点收口，一次 commit，栈序 P6(`b7dc652`) → P7 上板；矩阵四行照抄（98/98/90/85 vs 80/71/84/—）。
5. **Tick#13**：plug 独立栈分支 `cursor/cc-vis-x2-plug-5b71`（base `c24c7f3`）GO，续写 #104 分支 NO；#104 维持 draft 禁 ready（3 FAIL 锁死）；ENV + plug 并行、plug 验收 e2e HOLD 待 ENV 签字；不派修复前全量 e2e；T7-A 维持事件门。
6. **stale**：唯一坐实 = 原 X2 代理（>80min 静默），plug 接管取证后中止；TRIAGE-WRAP/T11 非 stale；IDLE 存量无需处置；顺手回收 4475 端口遗留 preview（PID 精确操作）。
7. **#103/#121**：复读不变形——#103 ready 待指挥官点合，#121 不合看板漂移且秘书栈加深（建议顺序 #103 → #121 → P7）；视觉 71/73 分歧随 #121 定谳。

---

*本文档为 CC-LOOP-ADVISOR-T12 Tick#12 交付物；登记看板不在本文更新，由秘书线单源维护。*
