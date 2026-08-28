# CC-LOOP-ADVISOR-T13 · Tick#13 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T13（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 04:40–04:56 UTC，全部一手取证（ps 两次复核 / tmux capture-pane / ls-remote 三轮 / gh API / 面板 API / 文件 mtime 全 ISO / 分支 commit 日期实读）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t13-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：① 简报四问之首（是否 fan-out）已被事件超越——**父代理已于 04:41:54/55Z 派出 ENV 专项 + X2 plug 双路**，本文 §2/§3 骨架据此转为「对表 + 补发 delta」定位；② **先行技术资产出土**——08-27 遗留分支 `cursor/cc-exp01-corridor-fix-0254` 早已把 EXP-01 直线走廊定性为「被 BL1 充电桩排封死」，且原型了两个测试面改法，历轮取证从未发现（§0 F4）；③ **plug r1 已推且方向撞纪律**——plug 分支 04:47–04:51Z 落 3 commit，主体是**改 e2e 动线绕桥腿 + workers 2→1**（测试面 = 审计面冻结纪律正面冲突，§0 F8），对表补发从「幂等安全」升级为**紧急必发**

---

## 0. 事实核查——八条推翻/超越 Tick#13 简报的 fresh 事实

| # | 简报口径 | 实测（04:40–04:55 UTC） | 证据 |
|---|---------|------------------------|------|
| F1 | 「是否 fan-out ENV+plug？」（待裁决） | **fan-out 已发生**：面板实测「EXP-01 走廊 ENV 专项」（bc-53ac6339，04:41:54Z 起）+「X2 隐患 plug 栈分支」（bc-686622df，04:41:55Z 起）双路 RUNNING。**plug 分支已推**（F8）；ENV 分支取证窗内未推（起步 ~10min，属正常首推窗） | 面板 API createdAtMs + ls-remote 三轮 |
| F2 | 「T12 仍 RUNNING（长跑 >20min）」 | **T12 已交付**：PR [#126](https://github.com/rayw-lab/website/pull/126) draft 04:40:50Z 开出，面板转 IDLE。简报口径在其取证时点无误，已被超越 | gh pr list + 面板 API |
| F3 | （简报未及） | **秘书 P7 已交付**：PR [#125](https://github.com/rayw-lab/website/pull/125)（tip `77a8c2d`，base=main），面板 IDLE；实测 P6 tip `b7dc652` 是 P7 tip 的祖先（`merge-base --is-ancestor` 通过）→ **合 #125 即收编 #121 全部增量** | gh pr view + merge-base |
| **F4** | 「BL1 桩排为主因」（转述原 X2 代理收尾报告） | **该论有昨日独立先行证据，且带原型修法**：远端分支 `cursor/cc-exp01-corridor-fix-0254`（base = 旧 main `77ac482`，未合入）含两 commit——`33ab9e2`（**08-27 15:08 UTC**）「fix(e2e): CITY-EXP-01 改走对角走廊——直线走廊被 hero GLB 充电桩排封死」+ `a59d1ea`（08-27 15:55 UTC）「test(e2e): 驾驶腿升级巡线控制——远目标瞄准在 ~1fps 慢动作下漂出走廊」（commit 正文含实测：50min 轮漂进备件箱堆 (26.6,-19)、pure-pursuit 巡线 + 自救升级方案，diff 全落 `e2e/cyber-city-explore.spec.ts` 94+/25-）。**历轮（T8–T12）ls-remote 取证全部漏检**——各轮 grep 词表（plug/env/triage/x2 等）不含该分支名。桩排主因说自此为「双源」：昨日 corridor-fix 代理 + 今日 X2 代理收尾报告 | 分支 fetch + `git log --format=%ci` + diff 实读 |
| F5 | （简报未及） | **T12 §1.3-1 归档第一动作未执行**：`/tmp/evidence-exp01` 不存在；被覆写的垃圾 `e2e-results.json`（`{skipped:80}`，mtime 04:33:00.775）仍在 `/tmp/main-wt/test-results/` 原地；trace/error-context 原件（04:26:23）仍在未受损。归档纪律必须转为 ENV 卡第一动作或父代理即刻代办（§1.3-③） | ls --time-style=full-iso |
| F6 | 「原 X2 代理 IDLE ✅」 | 复核成立：面板 04:35:28 转 IDLE（自然收轮，**无需再走 T11 §4.2 的中止步**）；`x2-e2e` tmux 会话仍存（滚动缓冲存 run1/run2 现场，留至 plug 归档回报后 kill-session）。**桩排实体定位**：`HeroBlenderMesh.ts` PROP_COLLIDERS `autodrive-lab`「充电桩排（4 桩带状）」local (-35, 1.0, 19.25) half [0.8, 1.0, 7.5]——**BL1 已合入 main，main/X2 双树同在**，属存量几何非 X2 diff；同文件布局纪律注释自记「autodrive-lab (28,−28) r6 **对角走廊**」，而 spec L284 走的是「**直线走廊** z∈[-24,-28]」——设计意图与测试走廊纪律存在错位嫌疑，正是 F4 先行分支「改走对角走廊」的立论 | 源码实读（只读）+ tmux ls |
| F7 | 「#103/#125 未合；main 88097f9；VM 无 e2e 进程」 | 复核不变：#103 OPEN/ready/MERGEABLE（`1a4296f`）；#104 draft 冻结 `c24c7f3`；main 无新合入；ps 两次复核零 playwright/e2e 进程；4475 端口 astro preview（PID 12642）残留依旧 | gh + ps |
| **F8** | （简报未及，取证窗内新发生） | **plug r1 已推、方向撞纪律**：`cursor/cc-vis-x2-plug-5b71` tip `368b4d4`，3 commit（04:47:46–04:51:19Z），**base = `c24c7f3` 实测（merge-base 通过，栈场景①纪律守住）**。但内容主体是测试面：`8e441ef`「world-chromium 串行化 + 四条驾驶动线**绕开**景框桥腿」（e2e 三 spec + playwright.config 共 ~70 行）、`368b4d4`「全局 workers 2→1」、`8507aa3` 归因报告 r1（#32 真回归/桥腿动线冲突 + #33/#35 挤兑 flake + 3 潜伏雷登记）；src 面仅 `ForegroundFraming.ts` +4。**与任务卡「不动 e2e（测试面 = 审计面）」冻结纪律正面冲突**；且 workers 2→1 是全套件跑法变更（墙钟近倍增 + 与测试跑法单源文档冲突），影响面远超本段范围 | 分支 fetch + merge-base + diff --stat 实测 |

---

## 1. TRIAGE-WRAP stale 裁决（任务 ①）：**判 stale 成立，即刻中止收割**；fan-out 不受其阻塞（已发生）

### 1.1 判定：四证俱齐，T12 deadline 已到

TRIAGE-WRAP（bc-ace126a4，04:18:23Z 起）e2e 腿已于 04:26 自然收轮（T12 F1），其后进入**报告期**。报告期判活四证实测：

| 证 | 实测 | 结论 |
|----|------|------|
| 面板活性 | updatedAtMs = createdAtMs（04:18:23），**>30min 零面板更新**（对照：T11/T12 交付时 updatedAt 均有推进） | 死 |
| 进程 | 04:4x 两次复核零 playwright/node 相关进程 | 死 |
| 推送 | ls-remote 两轮无其名下分支 | 死 |
| 报告落盘 | /tmp 全扫 + 各 worktree `docs/research/` 均无 wrap/triage 新文档 | 死 |

T12 §1.3-3 预设 deadline =「Tick#13 开局」，现已到点且四证齐 →「RUNNING 标签不作活性证据」协议兑现，**stale 坐实**。

### 1.2 阈值口径沉淀（报告型 ≠ e2e 型，两表分开挂）

- **e2e 长跑型**：沿 T12 §1.1 表不变——单腿预算 10min、经验带 12–15min、spec 硬顶 40min 自杀收场、40min+5min 零增长才升级僵死；判活只看日志/产物 mtime 推进。
- **报告型（无长跑掩护窗）**：面板零更新 + 零推送 + 零产物 mtime 推进 **≥20min → stale 候选**；跨到下一 tick 开局复核仍四证齐 → **坐实中止**。TRIAGE-WRAP 报告期 04:26→04:52 已 26min 四证齐，两条口径都满足。
- 同一 Task 先后跨两型时（如 TRIAGE-WRAP：定向测 → 写报告），**收轮时刻切换判活口径**，不得拿 e2e 型的 40min 宽限掩护报告期。

### 1.3 父代理动作（按序，本 tick 内）

1. **中止 bc-ace126a4**，台账登记：「定向测产物已收割（`/tmp/main-exp01.log` 末行 `1 failed` + T11 §0 F4 stats 快照 + trace/error-context 原件 04:26:23）；wrap 判读由 T11 §0 F4/F5 + T12 §0 F3 补位，不重派同题」。
2. **勿因 TRIAGE-WRAP 缺位阻塞任何在途路**：ENV/plug 双路已起（F1），其任务卡输入本就不依赖 wrap 报告正本。
3. **归档即刻代办（若 ENV 卡未含第一动作）**：`mkdir -p /tmp/evidence-exp01 && cp -a /tmp/main-exp01.log /tmp/main-wt/test-results/cyber-city-explore-*world-chromium /tmp/evidence-exp01/`，并归档 `/tmp/x2-wt/test-results` 的 EXP-01 trace（31MB）与 `/tmp/x2-e2e-run{1,2}.log`。F5 证明「写进裁决文档」仍不够，**要么卡内第一动作、要么父代理自己跑**，二选一必须落地。
4. **对表补发（plug 路升级为紧急必发，见 F8 + §3.0）**：向 ENV/plug 两路各补发一条 follow-up，内容 = 本文 §2/§3 骨架中其原始任务卡缺失的条款（尤其 F4 先行分支指针、JSON 禁引警示、桩排裁决权边界）。对 ENV 是幂等安全动作；对 plug 是**方向纠偏**——其 r1 已在测试面改线路线上投入，父代理越晚干预沉没成本越大。

---

## 2. ENV 专项 Task prompt 骨架（任务 ②）——已派（bc-53ac6339），本骨架作对表/补发件

分支名以已派卡实际值为准（指挥官命名 `cursor/cc-fxn-exp01-env-5b71` 或其他），看板登记实名、禁双名。骨架全文：

```
任务：CC-FXN-EXP01-ENV——CITY-EXP-01 main 树失败主因专项（判读 B 兑现 · 三候选裁决）
分支：cursor/cc-fxn-exp01-env-5b71，base = main。零 src/ + 零 e2e 改动，只交报告
     docs/research/cc-fxn-exp01-env-report.md。
第一动作（先于一切分析，防再覆写）：
  mkdir -p /tmp/evidence-exp01 && cp -a /tmp/main-exp01.log \
    /tmp/main-wt/test-results/cyber-city-explore-*world-chromium /tmp/evidence-exp01/
  同时归档 /tmp/x2-wt/test-results 的 EXP-01 trace（31MB）+ /tmp/x2-e2e-run{1,2}.log。
  警示：/tmp/main-wt/test-results/e2e-results.json 已于 04:33 被清点覆写为 {skipped:80}
  垃圾值，禁止引用；权威 = /tmp/main-exp01.log 末行 + T11 #124 §0 F4 快照。
  凡起任何 playwright 动作（含 --list）：动作前先归档 test-results。
输入：归档目录、T9 #122 §1/§6、T11 #124 §0 F4/F5 + §2、T12 #126 §0 F3、原 X2 代理
  收尾报告（BL1 桩排主因说）、先行分支 cursor/cc-exp01-corridor-fix-0254（fetch 后
  只读引用——base 是旧 main 77ac482，严禁 cherry-pick 直用）。
职责：
 ① main 停滞机制三候选裁决（帧证优先，trace 逐帧 04:17–04:24 爬行窗定第一触点）：
    (a) 出泊机动爬行超时（T11 F5：0–1 km/h 泊圈西侧，spec 0.04m/s 注释线——环境/控制器）；
    (b) BL1 充电桩排封死直线走廊（双源：X2 代理收尾报告 + 08-27 先行分支 33ab9e2）——
       须做几何换算定谳：autodrive-lab 世界位 ⊕ 桩排 local(-35,1.0,19.25) half[0.8,1.0,7.5]
       → 世界系占位，对照 spec 直线走廊 z∈[-24,-28] 与 main 卡点 (25.2,-25.7)；
    (c) 灯杆/路缘楔死。
 ② 设计意图 vs 测试纪律错位定谳：HeroBlenderMesh 布局注释自记「autodrive-lab (28,−28)
    r6 对角走廊」而 spec L284 走直线走廊——若桩排封直线走廊属设计本意（只留对角走廊），
    正解可能是改测试路线（先行分支方案）而非动几何；若属避让清单漏项（同 T9 桥腿柱
    失误模式），正解是几何让位。两案均触碰冻结纪律「测试面 = 审计面」→ 本任务只出
    证据与建议 + 指挥官签字项，不落任何 e2e/src 改动。
 ③ 绿证窗口标定：追溯最后一次 CITY-EXP-01 绿证（CI artifact / 历史 JSON / 看板）。
    若 BL1 合入后 CI 从有绿证 → 桩排主因说须解释此前为何能绿（CI 快渲染 bang-bang
    贴线 vs 本 VM ~1fps 漂移，可引 a59d1ea commit 正文实测）；若 BL1 合入后无绿证 →
    「X2 回归」与「main 存量断裂」边界重画，EXP-01 失败责任部分移出 #104。
    窗口内 main 唯一 src 合入 = X1B #101 → 若需 bisect（对照 e84e77b），先查 X1B diff
    出泊区/走廊有无新增碰撞体，再决定是否烧定向复跑（重载须另行申请窗口）。
 ④ SwiftShader 可跑性裁决：环境慢线成立则出 CI 侧跑/独占窗口纪律建议；
    不得擅改 spec 超时与断言。
 ⑤ 联动签字：给 plug 验收轮开跑条件签字（#104 复活门 = ENV 定谳 + plug 双清）；
    若 ①(b) 坐实主因 → main 侧修复（几何让位或改线）另开单走指挥官裁决，plug 不扩批。
硬门：结论三证（帧证 + 绿证窗口 + 几何/负载对照）齐才算归因完成；报告落 docs/research/。
```

对表要点（若已派卡缺以下任一项，按 §1.3-4 补发）：第一动作归档、JSON 垃圾值禁引、F4 先行分支指针与「只读引用」限定、②设计意图错位定谳职责、⑤签字职责。

## 3. X2 plug Task prompt 骨架（任务 ③）——已派（bc-686622df）且 r1 已推，本骨架作**紧急对表/纠偏件**

### 3.0 r1 方向裁决（先于骨架，父代理本 tick 必做）

F8 实测：plug r1 主体 = **改 e2e 动线绕桥腿 + workers 2→1**，而非任务卡预设的「几何让位（桥沿 z≥-21 或腿柱 x≥30）」。至此**三个独立代理殊途同归**指向测试面改线：08-27 corridor-fix 原型（F4）、原 X2 代理收尾报告（桩排主因说）、plug r1。这说明「**改线 vs 几何让位**」不是执行细节而是本段的枢纽设计裁决，且证据分量已足以正式升级处理：

1. **本 tick 即向 plug 补发 follow-up**：r1 的 e2e/playwright.config 改动**冻结不再扩**（已 push 的 commit 不必 revert，留作方案 B 存证）；在同分支先补「方案 A = 几何让位」对照实现（修 `ForegroundFraming` 腿柱/桥沿本体，撤销动线改道），两案并存等裁决——**禁止在裁决前继续沿方案 B 加码**（尤其 workers 2→1 这类全套件跑法变更，与 `docs/research/cyber-city-test-framework.md` 测试跑法单源冲突，单方面改 = 破坏审计口径）。
2. **裁决权归属**：走廊纪律（直线 vs 对角）与测试面解冻 = ENV 专项 §2-② 定谳 + **指挥官签字**，plug 无权单方面定；ENV 结论若为「桩排封直线走廊属设计本意」→ 方案 B（改线）转正，e2e 改动作为设计修正登记（测试面解冻一次性签字）；若为「避让清单漏项」→ 方案 A 转正，r1 测试面改动全数还原。
3. **#33/#35（QST-02/FB 族）「挤兑 flake」判读**照收作 plug 侧假设登记，但终局裁决仍挂验收轮（T11 §2.2 口径不变）；workers 2→1 若最终采纳，必须同步改测试跑法单源文档并重标 e2e 墙钟预算（~17–23min 口径作废），此为独立登记项。

### 3.1 骨架全文

```
任务：CC-VIS-X2-PLUG——探索走廊碰撞面定向补洞（T9 §1.3 修复域锁定，不扩批）
分支：cursor/cc-vis-x2-plug-5b71，base = c24c7f3（#104 tip，已含 main 88097f9；
     PR 栈场景①——看板登记栈序 #104(c24c7f3) → plug 与 base SHA）。
第一动作：确认接管 /tmp/x2-wt/test-results 取证指针并归档（EXP-01 trace 31MB +
  error-context + /tmp/x2-e2e-run{1,2}.log → 时间戳目录），完成后回报父代理
  （触发 x2-e2e tmux 会话 kill-session 时序；原 X2 代理已 IDLE，无中止动作）。
排查/修复域（归因方向已锁：T9 证据 A/B + T11 §2.1 不翻案）：
 ① trace 回放定第一触点（X2 卡点 (19.4,-32.7)，17 km/h 楔死楼排墙角）；
 ② 修复域 = ForegroundFraming 桥腿柱 (±15.7,-26) 让出走廊带 z∈[-24,-28]∩x∈[-28,24.5]
    （车半宽 ~1m + 转向余量 ≥1.5m）+ StreetProps 东北簇 (19.5,-19.5) 出泊左转弧线复核；
 ③ 边界规则（新增）：BL1 充电桩排属 main 存量几何（非 X2 diff），其裁决权归 ENV 专项
    ——若 trace 第一触点实测落在桩排等非 X2 新增几何上，立即回报父代理转 ENV，
    不在本分支修 main 侧几何、不改测试路线。桩排主因说 ≠ plug 扩批理由。
修复约束：不动 e2e（测试面 = 审计面）；不动隔离墩（hitCount 语义在册）；桥沿 z 北移
  （z≥-21）或腿柱世界 x 外扩（≥30）后必复跑 tools/camera/audit-x2-visibility.mjs
  NDC 探针，构图 + 碰撞双达标才算修完；最小修复，禁顺手调参/重构。
验收（HOLD 硬门）：
 · 全量 e2e 复跑 HOLD——待 ENV 专项 ⑤ 签字后才开跑（防 main 侧同款问题白烧
   35–90min 独占窗口）；
 · 开跑纪律：tmux 后台化 + 自然收轮（前台块被掐 = run2 之死）；收轮三证（进程自然退出
   + list 日志末行 + JSON stats）+ 第四步收轮即归档（JSON 覆写坑已三度兑现）；
 · 硬门 = 全量 80 用例 0 failed / 0 skipped / 0 flaky（52/52 旧口径已刷新，门不降）；
   QST-02/FB 族「异根 vs 挤兑」裁决挂本验收轮；
 · 提交前还原 docs/spec/assets/e2e-batch1/*.png 全部 14 张；poster 类重拍永远排批次
   最后；门禁 fresh 绿。
#104 处置：维持 draft 禁 ready；复活门 = ENV 定谳 + plug 双清 + 验收轮全绿。
```

对表要点（按 §3.0 以 follow-up 紧急补发）：**方案 A/B 并存 + 裁决前禁沿 B 加码**（r1 已在 B 上）、③桩排边界规则（本 tick 新增，原 T9/T11 卡无此条——F4/F6 出土后必须补）、第一动作归档回报、HOLD 硬门（r1 若自行起全量 e2e 即破门）、80 用例口径、workers 2→1 单源冲突警示。

---

## 4. Tick#14 预排 + #103/#125 合流提醒（任务 ④）

### 4.1 Tick#14 编排

| 路 | 任务 | 口径 |
|----|------|------|
| T14-A | **ENV + plug 双路监跑**（不新派） | plug 已推（F8），监跑重点转为 **§3.0 纠偏 follow-up 的执行情况**（方案 A 对照实现是否落地、是否停止沿 B 加码、是否擅自起全量 e2e 破 HOLD）；ENV 仍在首推窗——Tick#15 开局仍 branchName null 且零推送零面板更新，才按 §1.2 报告型口径升级 stale 复核 |
| T14-B | TRIAGE-WRAP 中止确认 + `x2-e2e` tmux 会话收尾 | 中止（§1.3-1）应已在 Tick#13 内执行；tmux 会话留至 plug 第一动作归档回报后 kill-session；顺手核 4475 端口残留 preview（PID 12642 精确回收，严禁按名杀） |
| T14-C | 秘书 P8 **不派**（下一 3n 界点 = Tick#15） | 例外：#103/#121/#125 任一合流事件发生 → 即派 post-merge 单点刷新。P8/合流刷新应登记项：功能 87–88 上板、F4 先行分支、TRIAGE-WRAP 中止台账、**plug r1 方案 A/B 裁决状态**、（若采）workers 口径变更 |
| T14-D | T7-A 视觉审计维持**事件门**不派 | ENV 定谳 + plug 双清 + 验收轮全绿 + #104 undraft 门禁 fresh 绿 + X2 线 IDLE，全过才派（T11 §3 原文） |

派单预算：在途 ENV + plug + 顾问 T14 = 3 路，新派 0–1（仅 T14-C 触发时），符合 2–6 约束；新增重载 = 0（plug 验收轮 HOLD 中，ENV bisect 须另行申请）。

### 4.2 #103 / #125 合流提醒（复读模板 + 世系更新）

> 待指挥官合流：**#103**（功能 87–88 登记，ready/MERGEABLE `1a4296f`，落库审计 GO #120，纯 docs 与 ENV/plug 零交集，可即合）；**#125**（秘书 P7 看板刷新，实测已收编 #121/P6 全部增量——`b7dc652` 为 `77a8c2d` 祖先）。**顺序 #103 → #125**；用 merge commit 合 #125 时 #121 会自动转 merged，若 squash 则需手工关 #121 并注明 superseded（防看板双源）。视觉 71/73 双源分歧随秘书板合流一并定谳。#121 拖越久秘书栈越深的提醒自 T12 §2-6 起连续第三 tick 复读。

登记矩阵复读（看板单源，本文不改板）：北极星 **98 / 98 / 90 / 85** vs 生产登记 **80 / 71 / 84 / —**（综合/视觉/功能/性能；性能解锁条件 = 真机 human-gate 六腿 → AL-PERF）。

---

## 5. 裁决一览（父代理直接执行）

1. **TRIAGE-WRAP 判 stale 成立**（报告期 26min 四证齐 + T12 deadline 到点）：中止、产物已收割登记、不重派；wrap 判读由 T11 F4/F5 + T12 F3 补位。
2. **fan-out 已发生（04:41Z 双路 RUNNING）**：本文 §2/§3 转为对表件——ENV 幂等补发（重点：归档第一动作、JSON 禁引、F4 先行分支指针、桩排裁决权边界、签字职责）；**plug 紧急纠偏补发（§3.0）**。
3. **plug r1 方向裁决（本 tick 枢纽动作）**：r1 = 测试面改线 + workers 2→1，撞「测试面 = 审计面」冻结纪律——B 案冻结不扩、同分支补 A 案（几何让位）对照、裁决权 = ENV §2-② 定谳 + 指挥官签字；workers 2→1 与测试跑法单源冲突，未签字前不得作数。
4. **归档即刻落地**：`/tmp/evidence-exp01` 仍不存在（T12 第一动作未执行），ENV 卡缺此条则父代理自己跑（§1.3-3 命令现成）。
5. **F4 先行资产入证据链**：`cursor/cc-exp01-corridor-fix-0254`（08-27）= 桩排封走廊论先行双源之一 + 测试面改法原型；只读引用严禁直 cherry-pick（base 是旧 main）。**取证词表教训**：历轮 ls-remote grep 漏检该分支——后续取证一律先全量 ls-remote 再过滤，勿用预设词表裁剪视野。
6. **plug 边界**：修复域锁 X2 新增碰撞面（桥腿柱 + 东北簇）；桩排属 main 存量转 ENV；第一触点非 X2 新增即回报不修；验收全量 e2e HOLD 待 ENV 签字（r1 擅自开跑即破门）。
7. **Tick#14**：plug 监纠偏执行、ENV 首推窗给足 2 tick；秘书 P8 排 Tick#15（3n），合流事件才提前；T7-A 维持事件门；新增重载 0。
8. **#103/#125**：#103 即合、#125 随后（世系已收编 #121）；merge commit 优先防 #121 悬挂；视觉 71/73 分歧随合流定谳。

---

*本文档为 CC-LOOP-ADVISOR-T13 Tick#13 交付物；登记看板不在本文更新，由秘书线单源维护。*
