# CC-LOOP-ADVISOR-T11 · Tick#11 扇出裁决（fanout）

- **顾问**：CC-LOOP-ADVISOR-T11（model slug: `claude-fable-5-thinking-xhigh`）
- **取证窗口**：2026-08-28 04:20–04:32 UTC，全部一手取证（ps 进程链 / tmux pane / tee 日志 / trace 帧实读 / gh API / ls-remote）
- **基线**：main @ `88097f9`（fetch 实测无新合入）
- **纪律**：零 `src/` 改动；独立 worktree `/tmp/t11-wt`（base = origin/main）；本文档不写看板，登记由秘书线单源（`docs/research/cyber-city-score-loop-orchestration.md`）
- **本 tick 大事**：TRIAGE-WRAP 对照跑于取证窗内（04:26）自然收轮——**main 树也挂 CITY-EXP-01**，T9 判读表 B 分支兑现，本文档已按 fresh 结局完成对号（§2）

---

## 0. 事实核查——三条推翻/超越 Tick#11 简报的 fresh 事实

| # | 简报口径 | 实测（04:20–04:32 UTC） | 证据 |
|---|---------|------------------------|------|
| F1 | 「T9 顾问零产出仍标 RUNNING——按 T10 视为未交付废弃」 | **T9 已交付**：分支 tip `03f226b` 已推送，PR [#122](https://github.com/rayw-lab/mywebsite/pull/122) 创建于 **04:13:04Z**，两 commit：`941f37c`（§0–§5 triage 主文）+ `03f226b`（§6 增补：run2 中断定性 + 失败清单定稿 + **main 对照跑判读表**） | `ls-remote` + `gh pr view 122` |
| F2 | 「原 X2 代理仍标 RUNNING（可能 stale）」 | x2-e2e tmux pane 自 04:13 `^C` 后停在提示符 `x2-wt $`，>15min 零输出零新进程；对照跑归属 TRIAGE-WRAP 沙箱块而非 X2 tmux（F3）→ **stale 判定成立** | `capture-pane` + ps 进程链 |
| F3 | 「TRIAGE-WRAP RUNNING：正跑 CITY-EXP-01 定向测」 | 归属定谳：PID 32026（04:13:57 起，exec-daemon 沙箱前台块直启，非 tmux）→ `pnpm exec playwright test cyber-city-explore.spec.ts --project=world-chromium --no-deps --grep CITY-EXP-01`，cwd `/tmp/main-wt`（**main@88097f9 detached，纯 main 树**），日志 tee `/tmp/main-exp01.log` | ps -o lstart + cmdline 实读 |
| **F4** | （简报未及） | **对照跑已于 04:26 自然收轮，1 failed**——收轮判定三证合一：① 进程自然退出（04:27 实测主进程消失）② log 末行 `1 failed` 汇总 ③ JSON stats `{expected:0, skipped:0, unexpected:1, flaky:0, duration:743954ms}`（12.4min）。**main 树同断言失败**：`泊车位 (-28,-28) 应可达（实测 x=25.2 z=-25.7）` | `/tmp/main-exp01.log` + `e2e-results.json` 实读 |
| **F5** | — | **机制级签名比对（trace 帧实读，46MB trace.zip 解包）**：main 卡点 (25.2,-25.7) 在出泊区旁；中段帧（04:17–04:22）车速 **0–1 km/h 在泊圈西侧灯杆线旁爬行数分钟**（spec 自注「倒车实测 ~0.04m/s 墙钟（SwiftShader 慢动作）」的机动爬行形态）；末帧（04:26）车回到橙色泊车圈上 40 km/h、导航「概念车库 117m 1/5」零推进。**与 X2 签名不同**：X2 卡点 (19.4,-32.7) 楼排禁区、17 km/h 油门顶死墙角（T9 证据 A）。同断言、异机制 | trace resources 557 帧抽验（首/180/360/末） |
| F6 | 「#103/#121 未合」 | 复核不变：#103 OPEN/ready/MERGEABLE（`1a4296f`）、#121 OPEN/draft（`b7dc652`）；T10 落 PR [#123](https://github.com/rayw-lab/mywebsite/pull/123)；plug 分支未开（ls-remote 空）；#104 tip `c24c7f3` draft | gh + ls-remote |

**F1 时间线复盘**：T10「T9 未推送」取证于 04:11，T9 首推在 04:13——T10 在其取证窗内无误，但已被超越。按 T10 §2.2 自设合并规则（「T9 归因更深采 T9」+「Tick#11 时仍未推送才作未交付」），**T9 §1+§6 自动转正为 X2 triage 权威输入**（trace 层归因：`ForegroundFraming` 桥腿柱 (±15.7,-26) 正压走廊带 + `StreetProps` 东北簇；判读表 §6.3）。

---

## 1. 本 tick 父代理动作（任务 ①）——对照跑已收轮，「等 IDLE」只剩收尾半程

1. **等 TRIAGE-WRAP 交 wrap 报告后转 IDLE**：定向测进程已自然收场（F4），Task 本体应正在写判读报告。给它一个自然收尾窗；**勿中止、勿代写**——定向测判读是其任务书内交付物，本文档 §2 为父代理侧独立对号，两者互证。若 Tick#12 时 TRIAGE-WRAP 仍无报告且零进程活动，按 T9/X2 同款「标签不作活性证据」协议处置（§4.3）。
2. **零新重载维持到本 tick 结束**：对照跑释放的重载配额留给 Tick#12 编排（§3），本 tick 不抢跑派单——ENV 专项任务书需要吸收 TRIAGE-WRAP wrap 报告的结论再定稿。
3. **T9 纠偏入台账**：「T9 已交付（#122）」替代「未交付废弃」，采 T9 §1+§6 为权威；提醒秘书线下一 P6 增量登记（X2 行措辞见 §4.4）。
4. **#103/#121 复读**（照 T10 §4 模板，04:2x 复核仍 OPEN）：
   > 待指挥官合流：#103（功能 87–88 登记，MERGEABLE ready）、#121（看板刷新，合后单源恢复）。建议顺序 #103 先合、#121 后合。与 X2/对照跑零耦合，可独立放行。另：视觉行 71（指挥官口径）/73（看板 #94 世系）双源分歧仍未定谳，建议随 #121 合流一并裁决。
5. **轻载预备（文本工作，零 VM 负载）**：按 §2.3/§2.4 预填 ENV 专项与 plug 段两张任务卡草稿，Tick#12 开局即发。

---

## 2. TRIAGE-WRAP 完成后下一棒（任务 ②）：判读 B 兑现——ENV 专项先行，plug 实现并行、其验收全量 e2e 押后

### 2.1 判读表对号结果（T9 §6.3 的 B 分支，带机制级细化）

原表二分支「main 绿→plug 即派 / main 挂→归因翻案」过粗，fresh 证据（F4/F5）落在中间态：

- **main 也挂，同断言**（泊车位不可达）→ 排除「X2 单因」；**但**
- **异机制**（main = 出泊机动 0–1km/h 爬行超时；X2 = 17km/h 楔死楼排墙角）+ T9 证据 B（桥腿柱正压走廊中线是 main 树上不存在的确定性几何）→ **X2 走廊碰撞归因不翻案**，降级为「叠加因素之一」；main 树自身另有一个环境/控制器问题。
- 结论：**双因并立**。X2 碰撞面必须修（腿柱物理挡道，与车速快慢无关）；main 树出泊机动在本 VM SwiftShader 下推进不足，需独立归因。

### 2.2 核心裁决：不派「修复前全量 e2e」（维持 T11 初判，理由更强）

- X2 树全量重跑：EXP-01 必挂（碰撞体未修，几何确定）——纯废轮；
- **main 树全量重跑：现在也是废轮**——EXP-01 在 main 就挂，全量必破「0 failed」，跑 35–90min 只重复对照跑已给的信息；
- QST-02 / FB 族「异根 vs 挤兑」裁决顺延挂到 **ENV 定谳 + plug 修复后的那一轮全量**（该轮无论如何要跑，信息免费）；main 也挂 EXP-01 的事实使 QST-02/FB 的环境嫌疑同步升高（T9 §6.2 原判方向获增证）。

### 2.3 下一棒第一优先：ENV/控制器专项（轻载，只归因不修复）

```
任务：CC-ENV-EXP01-TRIAGE——CITY-EXP-01 main 树失败主因专项（判读 B 兑现）
分支：cursor/cc-env-exp01-triage-5b71，base = main。零 src/，只交报告。
输入：/tmp/main-wt/test-results（trace.zip 46MB + error-context + e2e-results.json）、
     /tmp/x2-wt/test-results（X2 侧 EXP-01 trace 31MB）、/tmp/main-exp01.log、
     TRIAGE-WRAP wrap 报告、T9 §1/§6、本文档 §0 F4/F5。
职责：
 ① 定 main 停滞机制：trace 逐帧回放 04:17–04:24 爬行窗（0–1km/h、泊圈西侧灯杆线旁），
    判「出泊 reverseBy/转向机动爬行超时（spec L209 注释 0.04m/s 线）」vs「灯杆/路缘楔死」；
    末帧 40km/h 回圈 + 导航 1/5 零推进的控制器行为一并解释；
 ② 追溯最后一次 CITY-EXP-01 绿证（CI artifact / 历史 JSON / 看板记录），标定回归窗口；
    窗口内 main 唯一 src 合入 = X1B #101（88097f9）→ 若需 bisect，对照对象 = e84e77b（pre-X1B）
    定向复跑，先查 X1B diff 有无出泊区/走廊新增碰撞体再决定是否烧这一轮；
 ③ 裁决「本 VM SwiftShader 可跑性」：若属环境慢线（VM 负载态 vs 历史绿证时点），出
    CI 侧跑/独占窗口纪律建议；不得擅改 spec 超时与断言（测试面 = 审计面）；
 ④ 联动结论：#104 复活门 = ENV 定谳 + plug 修复双清；给 plug 段验收轮的开跑条件签字。
硬门：结论三证（帧证 + 绿证窗口 + 负载对照）齐才算归因完成；报告落 docs/research/。
```

### 2.4 plug 段：实现 GO、验收 HOLD（对 T9 §6.3-B「plug 暂缓」的证据级修正）

T9 预设「main 也挂 → plug 暂缓」的前提是归因翻案；F5 机制比对证明未翻案（§2.1），故修正为：

- **实现段即可派**（可与 ENV 专项并行，文件域正交：plug 改 X2 分支引擎面，ENV 只写 docs）：
  `cursor/cc-vis-x2-plug-5b71`，base = `cursor/cc-vis-x2-facade-r2-1d6f` tip `c24c7f3`（栈场景①，
  登记栈序 + base SHA）。任务卡 = T9 §1.3 原文（修复域：桥腿柱让出走廊带 z∈[-24,-28]∩
  x∈[-28,24.5] 含转向余量 ≥1.5m + 东北簇复核；NDC 探针 `tools/camera/audit-x2-visibility.mjs`
  复跑构图碰撞双达标；不动 e2e/隔离墩；最小修复）+ 以下 delta：
  1. **验收全量 e2e 复跑 HOLD**——待 ENV 专项 §2.3-④ 签字后才开跑（否则大概率因 main 侧
     同款环境问题再挂 EXP-01，白烧 35–90min 独占窗口）;
  2. 收轮判定三证合一入硬门（进程自然退出 + list 日志末行 + JSON stats，缺一不认——
     run2 中断曾把 JSON 覆写成 `{skipped:80}` 无效计数）;
  3. 全量跑必须 tmux 后台化 + 自然收轮（run2 之死 = 前台块被掐）;
  4. 硬门表述刷新：「52/52」为套件增长前旧口径，现值 **80 用例 / 7 projects**（X2 分支
     `--list` 实测）——硬门语义 = **全量 0 failed / 0 skipped / 0 flaky，总数以自然收轮 JSON
     为准**，门的强度不变不降;
  5. QST-02/FB 族裁决挂验收轮（§2.2），plug 范围锁走廊碰撞面**不扩批**。

---

## 3. Tick#12 预排（任务 ③）

| 路 | 任务 | 触发/依赖 | 负载 |
|----|------|----------|------|
| T12-A | **ENV 专项**（§2.3 卡即发） | TRIAGE-WRAP wrap 报告落地（吸收后定稿任务书；若 Tick#12 开局仍无报告，卡内改引本文档 §0 F4/F5 直接开工） | 轻载（trace 读帧 + 档案追溯）；②的 bisect 复跑是唯一潜在重载，需 ENV 卡内自行申请窗口 |
| T12-B | **plug 实现段**（§2.4 卡即发） | 与 T12-A 并行，文件域正交；验收 e2e HOLD 待 A 签字 | 轻中载（Blender/引擎面改 + NDC 探针，无全量 e2e） |
| T12-C | 秘书 P6 增量收口 | X2 行 + T9 纠偏行 + 对照跑判读 B 行 + （若指挥官已合 #103）功能 87 上板，一次 commit 进 #121 | 轻载 |
| T12-D | #103/#121 复读 + stale 代理清理执行（§4.2 时序步 2） | plug Task 确认接管 x2-wt 取证指针后 | 零 |

派单预算：2–3 路（A+B 必发，C 视秘书线在途状态），符合 2–6 路约束；峰值新增重载 = 0（bisect 若获批另计）。

**T7-A 视觉审计：维持门控，本 tick 与 Tick#12 均不派**。五条件（T9 §3 原文）不降门，仅两处口径刷新：

1. 条件 2「52/52」按 §2.4-4 刷新为**全量 80 用例 0 failed / 0 skipped / 0 flaky**（语义等价，门不降）；
2. 时点从「Tick#13+」改挂**事件门**：ENV 定谳 + plug 双清 + 验收轮全绿 + #104 undraft 门禁 fresh 绿 + X2 线 IDLE，全过才派——main 侧环境问题未定谳前，任何 tick 数承诺都是空头支票。

---

## 4. stale T9 / 原 X2 / TRIAGE-WRAP 代理处置（任务 ④）

### 4.1 T9：撤销「未交付废弃」，改记「已交付（#122）」

证据 F1。Task 若仍标 RUNNING：交付物已入库、`/tmp/t9-wt` 干净、无在飞子进程——**让其自然结束，不必中止、不得重派同题**；面板噪声不可忍时可安全中止（零副作用）。采信序：X2 triage 以 T9 §1+§6 为权威；T10 与之冲突的「让它跑完/判活协议」条款已由 T10 §5 Postscript 自行作废，无存量冲突。

### 4.2 原 X2 代理（CC-VIS-X2-FACADE-R2）：stale 坐实，分两步收

- **判定**：F2（^C 后 >15min 静默）+ F3（对照跑归属 TRIAGE-WRAP）→ run2 中断后未回报即失联。
- **时序**（勿颠倒）：
  1. **本 tick 不中止**：`/tmp/x2-wt/test-results`（EXP-01 trace 31MB + error-context）与 `/tmp/x2-e2e-run{1,2}.log` 是 ENV 专项与 plug 段的取证输入，派单交接窗内不引入清理类不确定性；
  2. **plug Task 确认接管取证指针后**（预计 Tick#12 内）：中止原 X2 Task，台账记「run2 自杀收尾未回报，产物由 ENV/plug 段收割」；`x2-e2e` tmux 会话暂留（滚动缓冲存 run1/run2 现场），plug 报告归档后 kill-session。
- plug 分支 base（`c24c7f3`）已在 remote，中止不影响开栈。

### 4.3 TRIAGE-WRAP：定向测已收轮，给自然收尾窗

其 shell 块产物齐备（log + JSON + trace），Task 本体预期正在写 wrap 报告。**本 tick 勿催勿中止**；Tick#12 开局若报告未落且零进程活动，按同款协议处置：报告由 ENV 专项引用本文档 §0 F4/F5 补位，Task 中止登记「产物已收割」。

### 4.4 秘书 P6 登记措辞（替代 T9 §6.4 建议稿，含本 tick 增量）

> X2 run2 04:13 中断收场（JSON 无效，以中断前 list 日志计数）：确证失败 3（EXP-01 / QST-02 / FB-01…09）+ 中断误伤嫌疑 2 + 殿后 3 project 未跑。main 对照跑 04:26 自然收轮 **1 failed**——EXP-01 main 树同断言失败（卡点 (25.2,-25.7) 出泊爬行，异于 X2 楔死机制），判读 B 兑现：双因并立，ENV 专项 + plug 实现段并行开、plug 验收轮 HOLD 待 ENV 签字；#104 维持 draft。T9 纠偏：已交付（#122），采其 triage 权威。

**范式沉淀**（建议随 ENV/plug 报告入手册 §3.5 坑表，与 T9 两条并列）：
1. **Task 收尾契约**——凡中断自有长跑，必须回报「中断原因 + 产物指针」后才准退出；
2. **RUNNING 标签不作活性证据**——一律以进程/产物 fresh 取证为准（本轮三例：T9 标 RUNNING 实已交付、X2 标 RUNNING 实已失联、TRIAGE-WRAP 标 RUNNING 实已收轮，方向各异，教训相同）；
3. **判读表要带机制维度**——「main 绿/挂」二值表在双因场景下会误裁（本例若机械执行 T9 §6.3-B 会错缓 plug）；签名比对（卡点坐标 + 车速形态 + 帧证）才是对号的最小充分集。

---

## 5. 裁决一览（父代理直接执行）

1. **本 tick**：等 TRIAGE-WRAP wrap 报告转 IDLE（勿催勿代写）；零新重载；预填 ENV/plug 两张任务卡（§2.3/§2.4）；T9 纠偏入台账。
2. **判读 B 兑现（机制级）**：双因并立——X2 走廊碰撞归因**不翻案**（腿柱几何确定性挡道），main 树另有出泊机动爬行问题（环境/控制器嫌疑）。
3. **Tick#12 派单**：ENV 专项 + plug 实现段并行（文件域正交）；plug 验收全量 e2e HOLD 待 ENV 签字；不派任何「修复前全量 e2e」。
4. **T9**：已交付 #122，采其权威，Task 自然结束不重派。
5. **原 X2 代理**：stale 坐实，plug 接管取证指针后中止；tmux 会话留到 plug 归档。
6. **T7-A**：门控从 tick 数改挂事件门（ENV 定谳 + plug 双清 + 验收轮全绿 + #104 undraft + X2 线 IDLE）；「52/52」口径刷新为全量 80 用例全绿，门不降。
7. **#103/#121**：照 §1.4 模板复读，可独立放行；视觉 71/73 双源分歧提请指挥官随 #121 定谳。

---

*本文档为 CC-LOOP-ADVISOR-T11 Tick#11 交付物；登记看板不在本文更新，由秘书线单源维护。*
