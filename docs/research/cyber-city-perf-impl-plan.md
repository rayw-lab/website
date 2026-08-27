# 性能 85 实现方案：PR 序与依赖图（CC-PERF-DES · doc-only）

> 执行模型自报：**claude-fable-5**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-DES**（Loop 8 性能扩展）——从「rubric 冻结」到「85 登记」的实现 PR 序：CITY-PERF-01/02 e2e · Quality 优化 · 真机表回填 |
| 分支 | `cursor/cc-perf-des-spec-1d6f`（base：`main` @ `cf76d35`） |
| 日期 | 2026-08-27 |
| 正本 | 秤 = `docs/spec/cyber-city-perf-rubric.md`（同批姊妹件）· 测试 = `docs/spec/cyber-city-perf-test-plan.md`（同批姊妹件）· 本文件只管**实现切分与顺序**，不改秤不改门 |
| 输入 | PERF-RS `cyber-city-runtime-perf-survey.md`（#59 已合）· PERF-BR `cyber-city-perf-optimization-features.md`（#60 已合，O1–O14）· 姊妹件两正本 |
| 消费方 | 父代理（派单）· CC-PERF-C1/C2（实现）· CC-AL-PERF（审计）· 指挥官（真机执行人） |

---

## 0. 结论先行

1. **三个 PR + 一次真机回填**：**PR-A** CITY-PERF-01/02 e2e（纯测试侧，零依赖立即可派）→ **PR-B** Quality 优化（`src/` 侧，主刀 = BR **O1 自动降档接线**；RS/BR 均已合 main，候选清单已收敛 §5，父代理派单时终拍）→ **PR-C** 真机表回填 + AL-PERF 登记（真人真机，云端产不出——欠账显式列前置）。A 与 B 文件域零交集**可并行**；C 强依赖 A（CI 对照物）、弱依赖 B（优化收益入读数）。
2. **登记链路零接线欠账**：`scripts/score-loop.mjs` northStar.perf 已恒读 `docs/research/cyber-city-perf-rubric-score.json`（OBS-C2 #57 已合，本批一手核验）——登记文件一落数 northStar 自动出数。性能 85 的全部剩余工作 = PR-A/B/C 本身。
3. **顺序哲学**：先证据（A）后优化（B）再判定（C）——没有 A 的下界与负载基线归档，B 的优化收益无法跨 commit 对照（测试方案 §4 流程约束「无对照不宣称收益」）；没有 B 的兜底，C 的安卓腿大概率过不了门白跑一轮真机（现状 Quality 梯退「参数在、司机缺席」，BR §0-3）。
4. **一处拆单改判**：BR §6 建议 O4+O10 同 PR——本方案拆开：O4 的 e2e 面 = PR-A（**`src/` 零 diff** 纪律，测试方案 §5 PR-A 专属硬门）；O10（#debug 分段剖析 + `longFrames`）是 `src/` 侧观测件，归 B 序先行件（B0，可与 A 并行）。

---

## 1. 现状事实（tip `cf76d35` 盘点）

| 面 | 状态 | 缺口 |
|----|------|------|
| 秤与门 | perf rubric v1.0 冻结（姊妹件）：85 门 = 数值门 + 五条结构门 S1–S5；判定腿六行（human-gate §5.4 四行 + Q2/Fast 4G 增补两行占位） | 无 |
| 测试正本 | 测试方案 v1.0 冻结（姊妹件）：CITY-PERF-01 七步协议 + H1–H7 · CITY-PERF-02 · project 拓扑案 B（config diff 三处）· 验收十条 | 无 |
| 调研/脑暴 | PERF-RS #59 · PERF-BR #60（O1–O14，P0×4）均已合 main | 无（候选收敛见 §5） |
| CI 证据 | WS-PERF-01 常驻（灰盒档）；`__worldSession.dump()` / `__worldSpike.*` / `?quality=` 深链在 `/` 全部就位 | **`/` 城市档零性能证据**——`city-perf-evidence.jsonl` 无产出者（= PR-A） |
| Q2 覆盖 | `?quality=` 深链已转正；Quality 梯退执行体全在 | **e2e 零覆盖**（= PR-A 的 CITY-PERF-02）；**自动降档未接线**（= PR-B 的 O1）——P1 安卓腿无兜底、P5 无确认层 |
| 登记消费 | northStar.perf 接线已合（缺失显 `—`） | 登记文件不存在（正确状态：留空非伪造，rubric §5.1 状态机） |
| 真机 | human-gate §5.4 城市档四行全【待填】；增补两行（rubric §4.1 行 5/6）待追加；§5.5 豁免留痕先例在 | 六腿全欠；云端代理产不出（= PR-C） |
| 回归底盘 | e2e 全量 64 绿 · LHCI `/` P100 · audit-budget 零 ❌；在途 FXN-C1 #62 / VEH-C2 #63（draft，先合则计数上移，全量不降语义） | 无（P4 维当前即 100） |

## 2. PR 序

### PR-A：**CC-PERF-C1** — CITY-PERF-01/02 e2e 证据包（立即可派）

| 项 | 内容 |
|----|------|
| 主题 | 单一：`/` 城市档 CI 性能证据面从 0 到 1 + P5 Q2 存在腿从 0 到 1 |
| 文件域 | 新 `e2e/cyber-city-perf.spec.ts`（两用例）· `playwright.config.ts`（测试方案 §1.3 冻结 diff 恰三处：world-chromium testIgnore + 新 city-perf-chromium project + visual 依赖改写）· 随行 doc 三件（`e2e-test-plan.md` §5 条目 + 功能 rubric §5/§6.2 指针注记 + 观测规格 §6.1 行状态，测试方案 §6-9） |
| 依赖 | 无——OBS-C1/C2、FXN-C2、VEH-C1、CC-E7 均已合 main，钩子全在岗（测试方案 §1.4 底座盘点） |
| 实现依据 | 测试方案 §2/§3 逐条照单（七步协议 / H1–H7 / 软门 / 600s 超时 / evidence schema 全部冻结，无自由裁量位） |
| 硬门 | 测试方案 §6 验收十条全过（含：全量 e2e 0 failed、WS-PERF-01 零改动零污染、**`src/` 零 diff**、config diff 恰三处、软门失败路径实测——annotation 出现且用例绿） |
| 风险 | ① 殿后尾巴 +8~14 分钟（两用例 600s 封顶合 20 min，测试方案 §2.4）——可接受，perf 族本就殿后；② CITY-PERF-02 进站动线 SwiftShader 稳定性——镜像 CITY-OBS-01 已实战跑绿的 driveTo 打法，风险已被 OBS-C2 消化过一轮 |

### PR-B：**CC-PERF-C2** — Quality 优化（运行时兜底包；候选已收敛，派单终拍归父代理）

| 项 | 内容 |
|----|------|
| 主题 | 单一：把 Quality 档位从「参数在、司机缺席」做成 P1 安卓腿 / P5 的真实兜底——**主刀 = BR O1**（FPS 自动降档接线：FpsMeter 滑窗 → 滞回 + 只降不升 + 20s 冷却 → `changeLevel(2)` + DriveFeedback toast + `quality-auto-drop` 事件；`?quality=` 显式深链禁用自动档——RS/BR 已收敛，非争议项） |
| 文件域 | `src/lab/world/` Quality 消费侧（装配段 + Quality/Rendering 按 BR O1 方案）——**不碰** Reveal 文案、poster、TransformSystem 时序 |
| 依赖 | PR-A 合流（证据对照物：PR 描述必附同 commit `city-perf-evidence.jsonl` 前后对照，测试方案 §4 流程约束）；无 RS/BR 欠账（两件已合） |
| 系列展开 | **B0**（可与 A 并行）：O10 分段帧时剖析 + `counters.longFrames`（观测先行，为 O5/O11+ 立项供读数；OBS 白名单 counters 修订随行）· **B1** = 本 PR（O1）· **B2** = O2 初判校准（依赖 B1 共享滞回/读数工具）· **B3** = O3 CarConcept 延迟加载（独立可先行，P3 主杠杆）——BR §6 序 ①–④ 的映射，单 PR 单主题纪律不变 |
| 硬门 | 变形四拍 1.0–1.2s 墙钟不变 · `ritual_idle` 恒等 · reduced-motion 双轨 · 视觉 rubric 分不降（Q0 路径恒等）· CITY-PERF-01/02 仍绿 · **埋点随行**（`quality-auto-drop` 等新 type 同 PR 落 OBS §3.4 表行，加法不升版）· evidence 前后对照入 PR 描述（下界趋势与 drawCalls/triangles 不得恶化） |
| 风险 | Q0→Q1 降档瞬间全场景阴影重编译尖峰——BR O1 缓解案（缓期到遮蔽窗或接受一次性尖峰 + toast 归因）由实现 PR 实测定夺；rubric P5 v1.1 复核条款在案（自动降档合流后「降档确认层」进 P5 被测面，rubric §2.2 注记） |

### PR-C：**真机表回填 + AL-PERF 登记**（真人真机 · 登记终局）

| 项 | 内容 |
|----|------|
| 主题 | rubric §4.1 六腿执行（human-gate §5.4 四行回填 + 增补两行追加至该表）→ CC-AL-PERF 独立核验（数值门 + 结构门 S1–S5）→ `docs/research/cyber-city-perf-rubric-score.json` 首次登记 |
| 执行人 | 真机腿 = 指挥官（王磊；判定与签字不可委托，human-gate 文件头纪律）；登记 = CC-AL-PERF（实现方自评永不登记，S1） |
| 依赖 | PR-A 合流（**强**：CI 对照物与 dump 机读位，S3 结构门在档性）· PR-B 合流（**弱**：无 B 也可执行，但安卓腿大概率不过门 → 留 `null` 或低分，浪费一轮真机）——**推荐 B1 后再跑 C** |
| 产出 | human-gate §5.4 记录行（含增补两行）+ 三件套归档（`docs/spec/assets/human-gate/cityperf_*`）· 登记 JSON（rubric §5.2 schema，gates 结构门逐条判定 + debts 欠账清单）· northStar.perf 自动出数 |
| 欠账纪律 | 云端代理产不出真机读数——C 执行前登记位保持不存在（northStar 显 `—`）为默认诚实状态；若 AL-PERF 先落结构面审计亦必须 `score: null`（rubric §5.1 状态机）；禁止预登记填数 |

## 3. 依赖与并行图

```
PERF-RS #59 ✅ ─┐
PERF-BR #60 ✅ ─┼→ 候选清单已收敛（§5）→ 父代理派单终拍
                │
DES 三件套（本批）──┬→ PR-A CITY-PERF-01/02（零依赖，立即可派）──┐
                    ├→ B0 O10 观测件（可与 A 并行）             ├→ PR-C 真机回填 + AL-PERF 登记
                    └→ PR-B(B1) O1 自动降档（A 合流后，证据对照）─┘      → northStar.perf 出数
                         └→ B2 O2 校准 · B3 O3 延迟加载（B3 独立可先行）
```

- **本 tick 可派**：PR-A（零依赖）· B0/B3（与 A 文件域零交集，按父代理并行度裁量）；
- **A 合流后**：B1（O1 主刀，evidence 对照物就绪）→ B2；
- **推荐登记序**：A → B1 → C（A → C 亦合法但安卓腿白跑概率高）。

## 4. 风险与欠账总表

| # | 风险/欠账 | 处置 |
|---|-----------|------|
| 1 | 真机读数云端产不出（P1/P2/P3/P5 四维） | 显式欠账 = PR-C；期间 northStar.perf 恒 `—`，不伪造（rubric §5.1） |
| 2 | 中端安卓 30fps 无兜底手段 | PR-B(B1) 主攻面；<24fps 沿 human-gate §2.2 三板斧/止损既有裁决路径 |
| 3 | perf 尾巴时长增长 | 测试方案 §2.4 封顶 20 min；再增用例须回测试方案改 §1.3 布局 |
| 4 | SwiftShader 读数波动致 jsonl 趋势误读 | 证据含环境指纹；趋势只比同环境（`ci: true`）行；单行异常不触发任何门（测试方案 §4） |
| 5 | 案 A→案 B 拓扑改判未被实现方注意 | 测试方案 §1.3 已列 Playwright 语义依据 + 「`--list` 验证 spec 只出现在 city-perf-chromium」验收条（§6-7）兜底 |
| 6 | FXN-C1 #62 / VEH-C2 #63 先合流致 e2e 计数漂移 | 全量不降语义（测试方案 §7-5），数字不回改 |
| 7 | O1 降档尖峰（Q0→Q1 阴影重编译） | BR O1 缓解案二选一由实现 PR 实测定夺；toast 同帧呈现供用户归因 |

## 5. RS/BR 收敛记录与残余裁决点

**已收敛（本批 DES 吸收，两输入均已合 main）**：

1. **PR-B 候选清单**：BR P0 四件中，O4 = PR-A 本体（e2e 面）+ 哨兵增量（负载基线入 §2.5 schema、漂移软门 v1.1 启用——RS「先积累基线」与 BR「+20% 定标」的折中已冻结进测试方案 §2.3）；O1 = B1 主刀；O2/O3 = B2/B3。档内降本 O5–O14 一律「先证据后动工」（B0 的 O10 读数立项），不入本序。
2. **自动降档语义**（RS §3.1 曾标注须单独拍板）：RS/BR 已同向收敛——显式 `?quality=` 深链永不被自动档覆盖、只降不升、toast 确认层、`quality-auto-drop` 白名单事件；rubric 已按此预置 P5 v1.1 复核条款。**不再是争议项**。
3. **采样拓扑**：RS 案 A → 测试方案改判案 B（Playwright 跨文件调度语义，测试方案 §1.3 留痕）。

**残余裁决点（归父代理派单时终拍，不阻塞 PR-A）**：

1. B 序并行度：B0/B3 与 A 并行开工还是串行排队（文件域零交集，纯并行度裁量）；
2. B2（O2 初判校准）是否并入 B1——BR §6 建议串行分 PR（共享工具但主题不同），本方案维持分立；
3. C 的执行时点：等 B1 合流（推荐）还是 A 后即跑首轮真机摸底（接受安卓腿低分/null 留痕换早期读数）。

---

*CC-PERF-DES · 2026-08-27 — 性能 85 实现三段序冻结：PR-A CITY-PERF-01/02 e2e（零依赖先行，CI 证据从 0 到 1，`src/` 零 diff）→ PR-B Quality 优化（主刀 O1 自动降档，RS/BR 已合候选收敛，B0–B3 系列展开）→ PR-C 真机六腿回填 + AL-PERF 双门登记（northStar 接线零欠账，自动出数）。A/B 可并行、C 殿后；BR ①「O4+O10 同 PR」拆单改判与案 A→案 B 拓扑改判均留痕。仅文档交付，`src/` 与 e2e 零改动。*
