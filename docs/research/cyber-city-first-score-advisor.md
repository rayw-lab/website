# 首分路径顾问报告：功能/性能 northStar 从 `—` 到数字（CC-FXN-ADV-SCORE）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-FXN-ADV-SCORE**（顾问 Task · doc-only）——回答指挥官提问：「功能和性能的第一个生产登记分（northStar 从 `—` 变成数字）怎么打出来？」产出可执行首分路径 |
| 分支 | `cursor/cc-fxn-adv-first-score-1d6f`（base：`main` @ `52c955e`） |
| 日期 | 2026-08-27 |
| 性质 | 顾问报告：**不改秤、不改门、不改脚本**——功能秤正本恒为 `docs/spec/cyber-city-function-rubric.md` v1.0，性能秤正本恒为 `docs/spec/cyber-city-perf-rubric.md` v1.0，本文件只回答「最短合法路径」与派单建议；`src/`、e2e、config 零改动 |
| 输入 | 功能 rubric v1.0 · 性能 rubric v1.0 · 功能测试方案 v1.0 · 性能测试方案 v1.0 · 观测规格（OBS-DES）· 视觉登记 JSON（同构范例）· `loop-veh-r2-audit.md`（#67 已合）· 性能实现方案 `cyber-city-perf-impl-plan.md`（PR-A/B/C 序）· 看板 `cyber-city-score-loop-orchestration.md` · 当轮一手核验（§1） |
| 消费方 | 父代理（派单）· 指挥官（真机执行人 + human-gate 决策）· CC-AL-FXN / CC-AL-PERF（登记人）· CC-FIX-CARE2E / CC-PERF-HG-PREP（本报告建议的支撑腿） |
| 红线 | 本报告 §2.5/§3.5 的「预计首分区间」为**诊断参考**，禁止以任何形式写入两个登记 JSON（禁止清单第 8 条「以预计值填充」）；禁止用 e2e 通过率 / function-smoke / LHCI 冒充登记分（禁止清单第 2 条） |

---

## 0. 结论先行

1. **功能首分离出数只差一个 Task**：顾问→调研→脑暴→文档→开发→测试六个阶段全部已合 main（OBS-C1/C2 + FXN-C1/C2/C3 + 三条条件腿全转正，`legsSkipped` 可为空表），登记前置（rubric §0-6）已解除。最短合法路径 = **立即派 CC-AL-FXN 登记轮**（Sol），外加一条保回归面的支撑腿 **CC-FIX-CARE2E**（CAR-E2E-01/05 超时修，双收益：登记有效性门 + VEH-R2 原地升 GO）。**云端代理可独立完成功能首分登记**（有条件，§4.1），无硬 human-gate。
2. **性能首分有一条不可替代的人肉腿**：P1/P2/P3/P5 判定权威 = 真机录测，human-gate §5.4 当前四行全【待填】、增补两行未追加；诚实状态机（perf rubric §5.1）下**任一维读数产不出 → 顶层 `score` 必须 `null` → northStar 仍显 `—`**。最短路径 = **CC-PERF-HG-PREP**（云端 doc：追加 §5.4 行 5/6 + 指挥官执行手册）→ **指挥官真机六腿**（硬 human-gate）→ **CC-AL-PERF** 双门判定登记。云端代理**不能**独立完成性能首分。
3. **两轨共同硬前置 = 登记同 commit 全量 e2e 绿**（功能 rubric §6.3-4 / perf 结构门 S5）：当前合同 **73 用例 / 14 文件**（本报告 `--list` 一手核验），而 R2 审计两轮全量实跑均以 `status=failed` 收口（CAR-E2E-01/05 各 180s 超时，非 world 链）。这是首分登记的头号现实风险，必须先修或先证明当轮全绿。
4. **首分是诊断真值，不是达标宣言**：登记有效性只要求证据链与结构门齐备，不要求过 90/85 数值门。诊断区间：功能约 **64–80**（F6 结构性短板 30–45 段压制），性能约 **72–95**（P1 安卓腿是最大方差源，P5 确认层缺失恒定 70）——**照登不误**，缺口由后续批次（FXN-C4 / PERF-B1）按登记后的真值收敛。
5. **下一拍 3 单可全并行**（§5）：CC-AL-FXN（Sol）∥ CC-FIX-CARE2E（Fable5）∥ CC-PERF-HG-PREP（Fable5）——三者文件域零交集；AL-FXN 取证钉 commit、登记落笔前用「runtime tree diff = 0」交叉核验收口（AL-CAM 先例），并行合法。

---

## 1. 当轮事实底座（一手核验，2026-08-27）

| 事实 | 读数 | 核验方式 |
|------|------|----------|
| main tip | `52c955e`（#65 FXN-C3 / #66 PERF-C1 / #67 AL-VEH-R2 已合） | `git log` |
| e2e 合同 | **73 用例 / 14 文件**（R2 时点 67/12 + CITY-PA-01…04 + CITY-PERF-01/02） | `pnpm exec playwright test --list` 实跑 |
| 全量绿状态 | **无 clean 全绿在档**：VEH-C2 exact 44 passed / 3 failed / 18 did not run；R2 base 重跑 `status=failed`（CAR-E2E-01/05 180s 超时） | `loop-veh-r2-audit.md` §0/§5 |
| 功能登记位 | `docs/research/cyber-city-function-rubric-score.json` **不存在** → northStar.function = `—` | `ls docs/research/` |
| 性能登记位 | `docs/research/cyber-city-perf-rubric-score.json` **不存在** → northStar.perf = `—` | 同上 |
| northStar 接线 | `scripts/score-loop.mjs` 已恒读两登记位（OBS-C2 #57）——**登记文件一落数，northStar 自动出数，零接线欠账** | perf-impl-plan §0-2 一手核验留痕 |
| 功能条件腿 | S-2 V 键项 ✅（#54）· S-5 L1 `?shot=` ✅（#45）· F4 进站前奏 ✅（#65）——**三条全转正，`scripts.legsSkipped` 可为空表** | rubric §4.4 对照合流史 |
| function-smoke | OBS-01/01b 双 dump 下满分 100、knownGaps 空表（哨兵基线，非登记分） | 功能测试方案 §1.3 |
| human-gate §5.4 | 城市档四行全【待填】；rubric §4.1 行 5（Q2 降档腿）/ 行 6（Fast 4G 计时腿）**尚未追加至该表** | `human-gate-checklist.md` §5.4 |
| CI 性能证据 | CITY-PERF-01/02 在岗（#66）：`city-perf-evidence.jsonl` + `session-dump-city-perf.json` 产出者就位（结构门 S3 在档物） | 性能测试方案 §6 验收 |
| P4 维 | audit-budget 零 ❌（CI 即权威）——当前即可判 100 | ci.yml 硬门现状 |
| VEH-R2 | NO-GO 6/7，**唯一阻断 = exact 全量 e2e 未全绿**（与登记回归面同一欠账） | `loop-veh-r2-audit.md` §0 |

---

## 2. 功能首分轨

### 2.1 前置条件清单

| # | 前置 | 状态 | 依据 |
|---|------|:---:|------|
| 1 | 秤冻结：七维权重 + 锚点 + S-2/S-5 v1.0 + 登记 JSON 契约 | ✅ | 功能 rubric v1.0（CC-FXN-DES） |
| 2 | 四层执行正本（e2e 挡合并 / smoke 哨兵 / playtest 挡登记 / AL 唯一登记人） | ✅ | 功能测试方案 v1.0（CC-FXN-TEST-DES） |
| 3 | 可观测底座：SessionTimeline dump 三通道 + 白名单 28 type + `#debug` + smoke——rubric §0-6 登记前置解除 | ✅ | OBS-C1 #53 / OBS-C2 #57 |
| 4 | 交付面：驾驶反馈四件（C2）· 键位/引导人性化（C1，hint 再唤出）· POI 进站前奏（C3） | ✅ | #56 / #62 / #65 |
| 5 | 脚本条件腿转正（V 键 / `?shot=` / 进站前奏） | ✅ | §1 事实底座——`legsSkipped` 可为空表 |
| 6 | northStar 消费链（score-loop 恒读登记位） | ✅ | OBS-C2 #57 |
| 7 | **登记同 commit 全量 e2e 绿**（§6.3-4 / 十条门 1） | ⏳ | CAR-E2E-01/05 180s 超时两轮复现，无 clean 全绿在档 |
| 8 | **登记人**：CC-AL-FXN 未派 | ⏳ | 看板「⏳ 可派（C1/C2/C3 已合）」 |
| 9 | （非前置）FXN-C4 目标/进度——**不阻断首分**，只压 F6 段位 | ⏳ | F6 按现状 30–45 段照打，rubric 铁律 1 |

### 2.2 最短合法路径（顾问→调研→脑暴→文档→开发→测试→审计→登记）

| 阶段 | Task ID | 状态 / 首分动作 |
|------|---------|----------------|
| 顾问 | CC-FXN-ADV（`cyber-city-fxn-advisor-consult.md`） | ✅ 已合 |
| 调研 | Loop 8 入口 + gap 审计（`cyber-city-function-gameplay-loop.md` / `cyber-city-gameplay-gap-audit.md`） | ✅ 已合 |
| 脑暴 | CC-FXN-BR（`cyber-city-gameplay-features.md`） | ✅ 已合 |
| 文档 | CC-FXN-DES（rubric v1.0）+ CC-FXN-TEST-DES（测试方案 v1.0）+ CC-OBS-DES | ✅ 已合 |
| 开发 | OBS-C1 #53 · OBS-C2 #57 · FXN-C2 #56 · FXN-C1 #62 · FXN-C3 #65（+ VEH-VIEW #54 / CAM #45 条件依赖） | ✅ 已合——**首分不等 C4** |
| 测试 | e2e 合同 73 用例落地 ✅；⏳ 全量绿欠账 → **CC-FIX-CARE2E**（新派，e2e-only diff：CAR-E2E-01/05 超时重标定，先例 = `d6b1141` CITY-PERF 900s/1200s 重标定） | 剩余步 1 |
| 审计 | **CC-AL-FXN**（新派）：钉 subject commit → `pnpm build && pnpm preview` → Pass A 真浏览器执行 S-2 v1.0 + S-5 v1.0 七腿（全程录屏 + 每腿 dump 落盘 + 三问原文）→ Pass B 锚点量表 → 分歧 >10 逐维合议（脚本优先铁律仲裁）→ 回归面同 commit 核对（五步链 §4.2：build → e2e 全量 → smoke 复算 → score-loop） | 剩余步 2 |
| 登记 | AL-FXN 同轮写 `cyber-city-function-rubric-score.json`（§6.3 五条有效性校验）+ 审计报告 → **northStar.function 自动出数** | 剩余步 3（与步 2 同 Task 同 PR） |

**时序自由度**：步 1 与步 2 可并行开工——AL-FXN 取证钉 commit X；若修复腿在 Y 合流，登记落笔前做 `git diff X..Y -- src public` 为 0 的交叉核验（视觉登记 JSON `crossChecks` 先例：AL-CAM 以 `e94159a..b2a59e4` runtime tree diff = 0 收口），e2e-only 修复不改被测产物，取证不作废。

### 2.3 谁执行

| 腿 | 执行者 | 说明 |
|----|--------|------|
| CC-FIX-CARE2E | **Fable5**（claude-fable-5-thinking-xhigh） | 实现类小修，e2e-only diff |
| CC-AL-FXN 双 Pass + 登记 | **Sol**（gpt-5.6-sol-xhigh-fast，看板审计线禁止降级） | 唯一登记人；实现方自评永不登记（S1 同构） |
| 指挥官真机 | **非硬前置**（§4.1） | 可选增强腿：真机 S-2 复测录屏 + dump 作为 F2/F3 计时类证据增补（S-2 本就是「指挥官复测口径」）；不阻断首分 |

### 2.4 产出工件路径

| 工件 | 路径 |
|------|------|
| **登记 JSON（唯一机读位）** | `docs/research/cyber-city-function-rubric-score.json`（schema = rubric §6.1；`scripts.legsSkipped: []` 与事实相符；`scoredBy` = CC-AL-FXN 模型自报） |
| 审计报告 | `docs/research/loop8-fxn-audit.md`（建议名，沿 `loop6-cam-audit.md` / `loop-veh-r2-audit.md` 命名族） |
| 录屏 / 截图 | `docs/spec/assets/`（命名含日期与腿别，human-gate 三件套纪律同构） |
| 每腿 dump | `session-dump-<s2\|s5-腿名>-<yyyymmdd>.json`（rubric §3.2-2 命名，归档路径入登记 JSON `evidence.sessionDumps`） |
| northStar 出数 | `test-results/quality-score.json` → `northStar.function`（score-loop 自动，零接线动作） |

### 2.5 预计首分区间（诊断参考——**禁止写入登记 JSON**）

| 维 | 权重 | 预计段位 | 依据 |
|----|:---:|:---:|------|
| F1 首幕可懂 | .15 | 70–85 | C1 引导链落地（CTA→状态文案→键位提示→再唤出）；「0:15 前说出下一步」高段锚为计时类判定，云端取证受限（§4.1） |
| F2 操作反馈 | .20 | 70–85 | C2 四件反馈使核心输入闭环齐、半价项预计 ≤2；90+ 锚（≤100ms 可感知延迟）云端无法合法取证 |
| F3 驾驶乐趣 | .15 | 50–70 | 速度感/复位/双视角在，但目标感弱（「开着开着不知道干嘛」）——C4 未落的联动扣分面；SwiftShader 体感失真取保守段 |
| F4 POI 游戏化 | .15 | 70–85 | C3 前奏 + 到达感 + 深链直达全在；「每栋楼是一类作品」可转述性待实测 |
| F5 人性化 | .15 | 70–85 | 失败恢复三腿 + hint 再唤出（C1 转必过项）+ reduced-motion + 触屏摇杆全有产品面 |
| F6 目标/进度 | .10 | **30–45** | 纯沙盒零显式目标（C4 未派）；`idle-30s` 仅记录无消费——空闲腿 60s 世界无响应即落此段 |
| F7 可观测完备 | .10 | 85–100 | 白名单 28 type 接通、dump 三通道、`#debug`、CI 工件、smoke 100 基线 |
| **合成** | 1.00 | **≈ 64–80（中枢 ~72）** | Σ(维分×权重) 取整 |

### 2.6 与北极星 90 的 gap 拆解

rubric §2.3 合成含义：90 需七维几乎全 ≥85 且至少四维 ≥90；**任一维 ≤70 时其余六维全 95 也只得 ~90.0 边缘值，两维 ≤70 数学上不可达**。现状 F6（30–45）+ F3（50–70）双低 → 90 在首分轮**结构性不可达**，这是事实不是失败：

| gap 源 | 预计损耗 | 对治批次 |
|--------|:---:|----------|
| F6 无显式目标/进度/空闲引导 | 单维 -5 ~ -7（加权） | **CC-FXN-C4**（G4/G5 形态拍板 + CITY-GL-01…05 合同已备好） |
| F3 目标感弱（纯沙盒） | -3 ~ -6 | C4 联动（「下一站」chip 直接给 F3 的对治项）+ 驾驶玩点 |
| F2/F1 高段计时锚点云端取证受限 | -2 ~ -4 | 真机复测轮（指挥官 S-2 录屏 + dump 作计时证据增补） |
| F4 高段（叙事可转述性、落点打磨） | -1 ~ -2 | 视觉/内容批次外溢收益 |

**到 90 的批次序**（非日历承诺）：首分（~72）→ C4 合流 + 第二轮登记（F6/F3 解锁，~80–85）→ 真机复测 + 反馈打磨第三轮（→90）。每轮重打分只改分值与证据，不改 schema（§6 契约）。

---

## 3. 性能首分轨

### 3.1 前置条件清单

| # | 前置 | 状态 | 依据 |
|---|------|:---:|------|
| 1 | 秤冻结：五维权重 + 锚点 + 85 双门（数值 + 结构 S1–S5）+ 登记 JSON schema + 判定腿六行 | ✅ | perf rubric v1.0（#64） |
| 2 | 测试执行正本：CITY-PERF-01/02 冻结规格 + 拓扑案 B + CI 五步链 | ✅ | perf 测试方案 v1.0（#64） |
| 3 | CI 证据包在岗（S3 结构门在档物）：`city-perf-evidence.jsonl` + `session-dump-city-perf.json` 产出者 | ✅ | PERF-C1 #66（PR-A） |
| 4 | northStar.perf 接线（恒读登记位，缺失显 `—`） | ✅ | OBS-C2 #57 |
| 5 | P4 维读数（audit-budget 零 ❌，CI 即权威） | ✅ | 当前即可判 100 |
| 6 | **human-gate §5.4 真机表**：四行回填 + 行 5/6 追加 | ⏳ | 四行全【待填】，增补两行未追加（PR-C 执行项） |
| 7 | **真机六腿读数**：桌面 Chrome ×3 腿 + 中端安卓 ×3 腿 | ⏳ | 云端产不出（铁律 3 留空不伪造）——唯一硬 human-gate |
| 8 | 登记人：CC-AL-PERF 未派 | ⏳ | 看板「⏳ PERF-C1 已合 + 真机待回填」 |
| 9 | 登记同 commit 全量 e2e 绿（结构门 S5） | ⏳ | 与功能轨共用 CC-FIX-CARE2E 欠账 |
| 10 | （非前置）PERF-B1（O1 自动降档）——**弱依赖**：无 B1 也可登记，但 P1 安卓腿低分/贴线风险高 | ⏳ | perf-impl-plan §2 PR-C 依赖注记 |

### 3.2 最短合法路径

| 阶段 | Task ID | 状态 / 首分动作 |
|------|---------|----------------|
| 顾问 | 顾问报告 §3（性能双轨冻结） | ✅ 已合 |
| 调研 | CC-PERF-RS #59 | ✅ 已合 |
| 脑暴 | CC-PERF-BR #60（O1–O14） | ✅ 已合 |
| 文档 | CC-PERF-DES 三件套 #64（rubric + 测试方案 + impl-plan） | ✅ 已合 |
| 开发 | PERF-C1 #66（PR-A，CI 证据包从 0 到 1）；PR-B（O1）**非首分硬前置** | ✅（B 系列另行裁量） |
| 测试 | CITY-PERF-01/02 常驻殿后 ✅；全量绿欠账与功能轨共用 CC-FIX-CARE2E | 剩余步 0（共用腿） |
| 文档补 | **CC-PERF-HG-PREP**（新派，doc-only）：① human-gate §5.4 追加行 5（Q2 降档腿）/ 行 6（Fast 4G 计时腿）——rubric §4.1 占位纪律的执行；② 指挥官真机执行手册：六腿逐步动作脚本（与 CITY-PERF-01 同源，S4 结构门）、读数口径（HUD `[data-ws-fps]` avg/1% low + DevTools 互证 + 秒表/funnel 互证）、三件套命名 `cityperf_<desktop\|android>_<webgpu\|gl2\|q2\|fast4g>_<yyyymmdd>.<mp4\|png>`、回填格式 | 剩余步 1 |
| **真机** | **指挥官六腿**（唯一硬 human-gate）：行 1 桌面 WebGPU 20s → 行 2 桌面 `?gl=1` 20s → 行 3 安卓默认 60s → 行 4 安卓 `?gl=1` 60s → 行 5 安卓 `?quality=2` 60s + E 进站 → 行 6 桌面 Fast 4G 清缓存计时；读数回填 §5.4 + 三件套归档 | 剩余步 2 |
| 审计 | **CC-AL-PERF**（新派）：数值门（score ≥85 且缺口维 ≤1——首分不要求过）+ 结构门 S1–S5 逐条判定（S2 引用 §5.4 记录行；S3 同 commit jsonl 在档；S4 脚本同源核对；S5 回归面全绿）→ §5.3 五条有效性校验 | 剩余步 3 |
| 登记 | AL-PERF 写 `cyber-city-perf-rubric-score.json`（五维读数齐 + 结构门判定完才允许 `score` 出数，§5.1 状态机）→ **northStar.perf 自动出数** | 剩余步 4（与步 3 同 Task 同 PR） |

**登记时点裁量**（impl-plan §5 残余裁决点 3，归父代理终拍）：首分目标是「出数」不是「过 85」——**A→C 直跑合法且最短**（接受安卓腿真实低分入账）；若指挥官真机窗口稀缺、想一轮拿到贴近 85 的读数，则等 B1（O1 自动降档）合流后再跑 C。顾问建议：**首分走 A→C 直跑**——早一轮真值比晚一轮好看值更有编排价值，且 B1 的收益需要「前后对照」才可宣称（测试方案 §4 流程约束），先有首轮真机基线反而是 B1 的证据前提。

### 3.3 谁执行

| 腿 | 执行者 | 说明 |
|----|--------|------|
| CC-PERF-HG-PREP | **Fable5** | doc-only（human-gate 表追加 + 手册） |
| 真机六腿 + §5.4 签字 | **指挥官**（判定与签字不可委托，human-gate 文件头纪律） | 设备硬需求：桌面 Chrome 最新稳定版 + **2019 后中端安卓（Adreno 61x / Mali-G5x 级）**；`chrome://inspect` 远程调试 + 录屏 |
| CC-AL-PERF 双门判定 + 登记 | **Sol**（gpt-5.6-sol-xhigh-fast） | 唯一登记出口；实现方署名即无效（S1） |

### 3.4 产出工件路径

| 工件 | 路径 |
|------|------|
| **登记 JSON（唯一机读位）** | `docs/research/cyber-city-perf-rubric-score.json`（schema = perf rubric §5.2：`gates` 双门逐条判定 + `debts` 欠账清单 + null 语义） |
| 真机记录正本 | `docs/spec/human-gate-checklist.md` §5.4（四行回填 + 行 5/6 追加；登记 JSON `evidence.humanGate` 引用记录行） |
| 三件套归档 | `docs/spec/assets/human-gate/cityperf_*`（录屏 mp4 + HUD 截图 png，命名含腿别与日期） |
| CI 证据引用 | `test-results/city-perf-evidence.jsonl` 同 commit 行（`evidence.ciEvidence`，标注「下界哨兵非判定」）+ `world-spike-metrics.jsonl` |
| 审计报告 | `docs/research/loop8-perf-audit.md`（建议名） |
| northStar 出数 | `test-results/quality-score.json` → `northStar.perf`（score-loop 自动） |

### 3.5 预计首分区间（诊断参考——**禁止写入登记 JSON**，禁止充当真机读数预判）

| 维 | 权重 | 预计段位 | 依据 |
|----|:---:|:---:|------|
| P1 帧率体感 | .30 | 60–100 | 桌面双后端现代 GPU 大概率 ≥60（预算受控场景）；**中端安卓 30fps 是最大不确定源**——无自动降档兜底（O1 未落），单腿轻缺口落 70–85、双腿缺口落 50–65 |
| P2 1% low | .20 | 70–100 | 变形落地窗与首驶 shader 编译尖峰是已知风险（PERF-BR O5 立项面）；孤立可归因尖峰仍可 70–85 |
| P3 加载可玩 | .20 | 70–100 | 壳 LHCI P100 + world ≤900KB gzip；Fast 4G ≤8s 达标与否落 100 或 70（三段制无插值） |
| P4 预算 | .15 | **100** | CI 零 ❌ 现状，二值维 |
| P5 降档可感知 | .15 | **70** | L6 核心路径大概率可完成，但 `?quality=2` 下无玩家可感的档位确认层（`#debug` 不算）——锚点「完成但反馈缺失」恒定 70，O1 toast 合流前无解 |
| **合成** | 1.00 | **≈ 72–95（中枢 ~84）** | Σ(维分×权重) 取整 |

**85 双门预判**（诊断）：即使数值 ≥85，P5=70 已恒占一处真实缺口——P1 安卓腿再有任何缺口即两处，**结构拒**（§2.3 算例「P1=70 且 P5=70 → 86.5 数值过、85 门 ✗」）。首分大概率是「合法登记 + 数值门/缺口计数不过」的诚实状态，符合预期。

### 3.6 与北极星 85 的 gap 拆解

| gap 源 | 预计损耗 | 对治批次 |
|--------|:---:|----------|
| P5 降档确认层缺失（恒定 70） | -4.5（加权） | **PERF-B1**（O1 自动降档 + toast + `quality-auto-drop` 埋点）；合流后按 rubric §7.1/P5 注记升 v1.1 复核锚点 |
| P1 安卓腿无兜底 | 0 ~ -12 | B1 主攻面（<24fps 走 human-gate §2.2 三板斧/止损既有裁决路径）+ 档内降本 O5–O14（先证据后动工，B0 O10 读数立项） |
| P2 变形/首驶尖峰 | 0 ~ -4 | O5（shader 预热）等，待首轮真机读数归因（`#debug` GPU ms 行 = v1.1 第一归因分叉） |
| P3 若 8–10s | -6 | O3（CarConcept 延迟加载，B3 独立可先行） |

**到 85 的批次序**：首分真机基线（A→C 直跑）→ B1 合流 + 第二轮真机复测（P5 → 100、P1 兜底）→ 数值门 + 缺口 ≤1 达成。首轮真机读数本身就是 B 序优化的「前后对照」基线——先登记后优化是证据纪律的正序。

---

## 4. 云端代理能否独立完成首分登记？

### 4.1 功能轨：**能（有条件）**

**契约依据**：rubric §4.1 明文「AL-FXN 自跑时按首访者心智模拟」——秤在冻结时就设计为登记人亲自执行；§3.2 取证协议（build/preview 产物、清存储、录屏、每腿 dump、三问原文）云端全部可产（真浏览器交互 + 屏幕录制 + `JSON.stringify(window.__worldSession.dump())` 落盘）。三条件腿全转正后 `legsSkipped` 为空，无豁免留痕需求。

**条件与限制（必须在审计报告中显式留痕）**：

1. **SwiftShader 计时类判定禁令**（rubric §3.2-5）：云端软渲染下，F1「0:15 前说出下一步」、F2「≤100ms 可感知延迟」等**计时类锚点高段无法合法取证**——存在性/顺序性判定（dump seq ↔ 录屏时间码对齐）不受限。执行面处理：计时类观察一律按保守段位打并注记「云端环境失真，真机复测轮修正」；**不得**因云端慢而反向扣「输入丢失/无响应」类分（环境失真 ≠ 产品缺陷，归因必须写清）。
2. **回归面同 commit 全量绿**是登记落笔的硬前置（§6.3-4）——见 CC-FIX-CARE2E 腿。
3. **可选增强（非 gate）**：指挥官真机 S-2 复测录屏 + dump 作为 F2/F3 计时类证据增补——S-2 本就是「指挥官复测口径」，增补证据不改双 Pass 规程、不需要升 rubric 版本。

**结论：功能首分无硬 human-gate 腿，云端可独立打出 northStar.function 的第一个数字。**

### 4.2 性能轨：**不能**

| 腿 | 云端可否 | 说明 |
|----|:---:|------|
| CI 证据包（S3 在档物） | ✅ 已自动 | CITY-PERF-01/02 每轮全量产出 |
| P4 判定 | ✅ | 本维 CI 即权威（铁律 4） |
| HG-PREP doc（§5.4 追加行 + 手册） | ✅ | doc-only |
| **P1/P2/P3/P5 判定读数** | ❌ | 判定权威 = 真机录测；云端 SwiftShader 读数**禁止**充当判定（禁止清单 4）；留空不伪造（铁律 3） |
| 登记 JSON 写入 | ✅（但受状态机约束） | 真机表回填前，AL-PERF 即使先落结构面审计也必须 `score: null` → northStar 仍 `—`（§5.1 禁止预登记填数） |

**指挥官 human-gate 硬腿 = §5.4 六行全部**（桌面 Chrome 行 1/2/6 + 中端安卓行 3/4/5）+ 记录行签字。注意：**豁免留痕（§5.5）不能救出数字**——豁免腿对应维仍为 `null`，顶层 `score` 仍必须 `null`。northStar.perf 要变数字，六腿读数缺一不可；若指挥官无中端安卓设备，需先解决设备可得性（借/购/云真机由指挥官决策），这是性能首分的第一临界资源。

---

## 5. 父代理下一拍派单建议（3 条，可全并行）

| # | Task ID | 执行者 | 主题 | 依赖 / 并行性 |
|---|---------|--------|------|---------------|
| 1 | **CC-AL-FXN** | Sol（gpt-5.6-sol-xhigh-fast） | 功能首分登记轮：S-2+S-5 双 Pass 真跑 + 回归面核对 + `cyber-city-function-rubric-score.json` 首登 + 审计报告（§2.2 步 2/3） | **立即可派**。取证钉 commit；登记落笔前若 #2 已合流，做 runtime tree diff = 0 交叉核验收口（AL-CAM 先例）；若当轮全量实跑本就全绿则不等 #2 |
| 2 | **CC-FIX-CARE2E** | Fable5 | CAR-E2E-01/05 180s 超时修（e2e-only diff，超时重标定先例 `d6b1141`）→ 73/73 clean 全绿 | 零依赖。**双收益**：功能/性能登记回归面（§6.3-4 / S5）+ VEH-R2 报告原地升 GO（其唯一阻断即此） |
| 3 | **CC-PERF-HG-PREP** | Fable5 | doc-only：human-gate §5.4 追加行 5/6 + 指挥官真机六腿执行手册（动作脚本/读数口径/三件套命名/回填格式，§3.2 步 1） | 零依赖。产出后**请指挥官排真机窗口**（性能首分唯一临界资源）；CC-AL-PERF 在 §5.4 回填后下一拍派 |

**CC-AL-FXN 可以并行派**（对本问的直接回答）：可以，且建议本拍就派。理由：① 登记对象钉 commit，与在途修复/其他 PR 互不污染；② 三单文件域零交集（登记 JSON + 审计报告 ∥ e2e spec ∥ human-gate doc）；③ 唯一时序约束是「登记落笔前回归面同 commit 全绿」——放在 AL-FXN 任务书内作为收口条件即可，不构成派单顺序依赖。

**第 4 备选（本拍或下拍）**：CC-FXN-C4（目标/进度轻任务，G4/G5 形态拍板）——F6/F3 的 gap 主对治，合同骨架（CITY-GL-01…05）已在测试方案备好。与首分登记并行合法（subject 已钉 commit），落地后进**第二轮**登记；不建议为等 C4 推迟首分——首分的编排价值正在于给 C4 一个可对照的登记基线。

---

## 6. 登记纪律重申（对所有被派 Task 的约束）

1. **禁止**用 e2e 通过率、function-smoke 分、LHCI 分、CI 证据包读数冒充功能/性能登记分（两 rubric 禁止清单第 2/4 条；四层分工「谁也不许替谁签字」）。
2. **禁止**将本报告 §2.5/§3.5 诊断区间以任何形式写入登记 JSON 或真机表（禁止清单第 8 条）；登记 JSON 中的每个数字必须有当轮证据链（dump seq/t + 录屏时间码 / §5.4 记录行）。
3. **禁止**实现方自评登记（S1）；AL-FXN / AL-PERF 是唯一登记出口，`scoredBy` 模型自报。
4. 性能任一维读数产不出 → 该维 `null` + `debts` 留痕 → 顶层 `score` 必须 `null`——northStar 显 `—` 是诚实状态，不是失败状态。
5. 首分登记**不要求**过 90/85 数值门——有效登记 = 证据链 + 结构门齐备；数值缺口如实入账，由后续批次收敛。

---

*CC-FXN-ADV-SCORE · 2026-08-27 — 首分路径顾问结论：功能轨前置全清（条件腿三项全转正、legsSkipped 空表），最短路径 = CC-AL-FXN 一单直达登记（云端可独立完成，SwiftShader 计时类判定保守留痕），预计首分 64–80；性能轨硬卡指挥官真机六腿（豁免救不出数字），最短路径 = HG-PREP doc → 指挥官六腿 → CC-AL-PERF，预计首分 72–95 且 85 双门大概率被 P5+P1 两处缺口结构拒。两轨共同硬前置 = 登记同 commit 全量 e2e 绿（CAR-E2E-01/05 超时修）。下一拍三单全并行：AL-FXN ∥ FIX-CARE2E ∥ PERF-HG-PREP。doc-only，零业务代码改动。*
