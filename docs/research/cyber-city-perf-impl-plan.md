# 性能 85 实现方案：PR 序与依赖图（CC-PERF-DES · doc-only）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-DES**（Loop 8 性能扩展）——从「rubric 冻结」到「85 登记」的实现 PR 序：CITY-PERF-01 e2e · Quality 优化 · 真机表回填 |
| 分支 | `cursor/cc-perf-des-spec-1d6f`（base：`main` @ `cf76d35`） |
| 日期 | 2026-08-27 |
| 正本 | 秤 = `docs/spec/cyber-city-perf-rubric.md`（同批姊妹件）· 测试 = `docs/spec/cyber-city-perf-test-plan.md`（同批姊妹件）· 优化特性清单 = PERF-BR `cyber-city-perf-optimization-features.md`（O1–O14 + §6 十步 PR 切分，已合 PR #60）· 本文件只管**三段主线的实现切分与顺序**，不改秤不改门、不复制 BR 分项细节 |
| 消费方 | 父代理（派单）· CC-PERF-C1 起（实现）· CC-AL-PERF（审计）· 指挥官（真机执行人） |

---

## 0. 结论先行

1. **三段主线 + 一次真机回填**：**PR-A** CITY-PERF-01/02 e2e（纯测试侧，零依赖立即可做）→ **PR-B 序** Quality 优化（`src/` 侧，特性与顺序已由 PERF-BR §6 冻结为十步，本文件只锁边界）→ **PR-C** 真机表回填 + AL-PERF 登记（真人真机，云端产不出——欠账显式列前置）。A 与 B 序首件文件域仅在「BR ① 是否合并 O10」一处交叠（§2 PR-A 拆分裁决）；C 依赖 A（CI 对照物）强依赖、B 的 P0 件（收益入读数）弱依赖。
2. **登记链路零接线欠账**：score-loop northStar.perf 已恒读 `docs/research/cyber-city-perf-rubric-score.json`（OBS-C2 PR #57 已合），登记文件一落 northStar 自动出数——性能 85 的全部剩余工作 = A/B/C 本身。
3. **顺序哲学**：先证据（A）后优化（B）再判定（C）——没有 A 的下界归档，B 的每个优化 PR 无法出示「前后对照」（BR §0 原则①「无对照读数不得宣称收益」）；没有 B 的 P0 四件，C 的真机读数大概率过不了门白跑一轮（当前中端安卓 30fps 无兜底：自动降档未接线、初判仅 UA、车资产阻塞加载）。

---

## 1. 现状事实（tip `cf76d35` 盘点）

| 面 | 状态 | 缺口 |
|----|------|------|
| 秤与门 | perf rubric v1.0 冻结（同批姊妹件）；85 门 = 数值门 + 五条结构门 | 无 |
| 调研/脑暴 | **PERF-RS #59 / PERF-BR #60 均已合 main**：优化面「存量健康、缺口唯一（自动降档）」+ O1–O14 特性清单与十步 PR 切分已冻结 | 无（本 plan 直接消费） |
| CI 证据 | WS-PERF-01 常驻（`/world-spike/` 灰盒档）；`__worldSession.dump()` / `__worldSpike.fps()` 在 `/` 城市档已挂（OBS-C1 #53） | **`/` 城市档零性能证据**——`city-perf-evidence.jsonl` 尚无产出者（CITY-PERF-01 待实现，测试方案已冻结） |
| Q2 覆盖 | `?quality=0\|1\|2` 深链已转正（M9/CC-E7）；三档梯退执行体全就位（bloom/DPR/阴影/反射/粒子 count） | **零 e2e 腿**（CITY-PERF-02 补位）；档位判定仅 UA、自动降档未接线（BR O1/O2 主攻） |
| 登记消费 | northStar.perf 接线已合（score-loop 读登记位，缺失显 `—`） | 登记文件不存在（正确状态：留空非伪造） |
| 真机 | human-gate §5.4 城市档四行全【待填】；§5.5 豁免留痕先例在 | 四行 + 增补两行（rubric §3.2）全欠；云端代理产不出 |
| 回归底盘 | 全量 e2e 64 例绿 · LHCI `/` P100 · audit-budget 零 ❌ | 无（P4 维当前即 100） |
| 在途批次 | FXN-C1（#62 draft）· VEH-C2（#63 draft）——文件域（Reveal 文案 / View 相机）与本序零交集 | 无冲突排队需求 |

## 2. PR 序

### PR-A：**CC-PERF-C1** — CITY-PERF-01/02 e2e 证据包（立即可做）

| 项 | 内容 |
|----|------|
| 主题 | 单一：`/` 城市档 CI 性能证据面从 0 到 1 |
| 文件域 | 新 `e2e/cyber-city-perf.spec.ts` · `playwright.config.ts`（三处：world-chromium 负向前瞻 + world-perf-chromium testMatch/`fullyParallel: false`，测试方案 §1.2 冻结值照抄）· 随行 doc：`docs/spec/e2e-test-plan.md` §5 追加条目、观测规格 §6.1 工件行措辞更新、功能 rubric §5/§6.2 加「正本已迁 `cyber-city-perf-rubric.md`」指针注记（加法不改秤） |
| 依赖 | 无——OBS-C1/C2、FXN-C2、VEH-C1 均已合 main，所需钩子（`__worldSession`/`__worldSpike`/HUD/`?quality=`）全部在岗 |
| 实现依据 | 测试方案 §2/§3 逐条照单（流程/断言/600s 超时/证据 schema 全部冻结，无自由裁量位） |
| **拆分裁决（对 BR §6 ①的修订）** | BR ① 提议 O4 与 O10（`#debug` 分段剖析 + `counters.longFrames`，**src 侧**）同 PR——本 plan 裁决**拆开**：PR-A 保持纯测试侧零 `src/` diff（最低风险先行、审计面干净），O10 降入 B 序首件或随 O1 同批（其 OBS 白名单/counters 修订本就要走观测规格随行）。「哨兵 v1 只留档不设门」已在测试方案 §7 冻结，O4 的 BR 增量（回归护栏阈值）归 v1.1 |
| 硬门 | 全量 e2e 0 failed（64 → 66 例）· WS-PERF-01 零改动 · `src/` 零 diff · LHCI/audit-budget 零变化 · 软门失败路径实测（annotation 出现且用例绿）· 测试方案 §6 验收清单全过 |
| 风险 | ①殿后 project 尾巴 +10~16 分钟（两用例各 ≤600s 预算）——可接受，perf 族本就殿后；②CITY-PERF-02 进站动线在 SwiftShader 下的稳定性——镜像 CITY-OBS-01 已实战跑绿的动线打法，风险已被 OBS-C2 消化过一轮 |

### PR-B 序：**CC-PERF-C2 起** — Quality 优化（特性与顺序正本 = BR §6，本 plan 只锁边界）

BR §6 已冻结十步单主题序（②O1 自动降档 → ③O2 初判校准 → ④O3 车资产延迟 → ⑤O5 预热扩档 → ⑥O9+O8 像素/建器 → ⑦O7 HDR → ⑧O6 bloom → ⑨O13 预算单源 → ⑩O11/O12/O14 先证据后动工），依赖拓扑与同文件串行纪律见其 §6 首段。本 plan 补充四条边界（与 BR 不冲突，为 DES 侧执法口径）：

1. **每个 B 序 PR 的证据义务**：PR 描述必附同 commit `city-perf-evidence.jsonl` 前后对照（PR-A 合流前禁开 B 序——BR「① 合流前用 WS-PERF-01 + 手采代偿」的让步条款**作废**，A 已零依赖可先行，无理由代偿）；
2. **P0 四件（O1/O2/O3 + 已拆出的 O4）是 PR-C 的推荐前置**：安卓腿兜底（O1）、开局正确档位（O2）、P3 减 2–3s（O3）落地前跑真机大概率白跑一轮；
3. **红线继承**：变形 1.0–1.2s 墙钟、`ritual_idle`/poster 恒等、reduced-motion 双轨、CITY-PERF-02 恒绿（Q2 功能面零缺失）、埋点随行（`quality-auto-drop`/`quality-calibrated` 等新事件同 PR 修订观测规格 §3.4 白名单，加法不升版）、视觉签收门条目（O6/O11/O12/O14）过 AL 同机位对照；
4. **争议项执法**：BR O8 已诚实登记「自动降档路径吃不到 MSAA 收益」——登记 JSON 的 P5/P1 证据引用时不得夸大该项；O1 的「显式 `?quality=` 永不被自动档覆盖」是 CITY-PERF-02 可复现性的前提，回归面由该用例常驻看守。

### PR-C：**真机表回填 + AL-PERF 登记**（真人真机 · 登记终局）

| 项 | 内容 |
|----|------|
| 主题 | human-gate §5.4 四行 + rubric §3.2 增补两行（Q2 安卓腿 / Fast 4G 计时腿）执行回填 → CC-AL-PERF（Sol）独立核验 → `docs/research/cyber-city-perf-rubric-score.json` 首次登记 |
| 执行人 | 真机腿 = 指挥官（王磊；判定与签字不可委托，human-gate 文件头纪律）；登记 = CC-AL-PERF 独立审计（实现方自评永不登记） |
| 依赖 | PR-A 合流（强：CI 对照物与 dump 机读位）· B 序 P0 件（弱：无 B 也可执行，但安卓腿大概率不过门 → 留 `null` 或低分，浪费一轮真机）——**推荐 B 序 P0 后再跑 C** |
| 产出 | human-gate §5.4 记录行 + 三件套归档（`docs/spec/assets/human-gate/cityperf_*`）· 登记 JSON（rubric §4 schema，结构门五条逐条判定）· northStar.perf 自动出数 |
| 欠账纪律 | 云端代理产不出真机读数——在 C 执行前，登记位保持**不存在**（northStar 显 `—`）为唯一诚实状态；禁止预登记草稿填数（rubric §4.1） |

## 3. 依赖与并行图

```
PERF-RS #59 ✅ ─┐
PERF-BR #60 ✅ ─┴→（已拍板输入就位）
                          ┌→ PR-B 序（BR §6 ②→⑩：O1 首件，串行纪律见 BR）─┐
PR-A CITY-PERF-01/02 ─────┤（B 序每 PR 依赖 A 的证据对照义务）              ├→ PR-C 真机回填 + AL-PERF 登记 → northStar.perf 出数
（零依赖，本 tick 可派）   └──────────────────（A 强依赖：CI 对照物）────────┘
```

- **本 tick 可派**：PR-A（零依赖）；
- **A 合流后即可开**：B 序首件（O1 自动降档；O10 剖析随行或紧随）；
- **推荐序**：A → B(P0：O1/O2/O3) → C；A → C 亦合法但浪费真机轮次的概率高。

## 4. 风险与欠账总表

| # | 风险/欠账 | 处置 |
|---|-----------|------|
| 1 | 真机读数云端产不出（P1/P2/P3/P5 四维） | 显式欠账 = PR-C；期间 northStar.perf 恒 `—`，不伪造 |
| 2 | 中端安卓 30fps 无兜底手段 | B 序 P0（O1 自动降档 + O2 初判校准）主攻；<24fps 触发三板斧/止损沿 human-gate §2.2 既有裁决路径 |
| 3 | perf project 尾巴时长增长 | 已按测试方案预算封顶（两用例 ≤20 分钟）；再增用例/分档矩阵须回测试方案 §7 走 v1.1 裁决 |
| 4 | SwiftShader 读数波动导致 jsonl 趋势误读 | 证据含环境指纹；趋势对照只看同环境（`ci: true`）行；单行异常不触发任何门 |
| 5 | O1 自动降档的 UX 语义（toast/优先级/抖动） | BR O1 已冻结形态（滞回 + 只降不升 + 冷却 + 显式参数豁免）；rubric P5 口径与其解耦（rubric §2.2 P5 注记），落地不触发 rubric 升版 |
| 6 | Blender GLB 类资产合流改变负载基线 | drawCalls/triangles 基线重定标（BR §7 既有约定；测试方案 §5 对照表末行同记） |

## 5. 修订记录（RS/BR 对接位闭环）

- **2026-08-27**：初稿按「RS/BR 在途」预留候选池与修订位起草；同日 PERF-RS（PR #59）/ PERF-BR（PR #60）合 main，本文件与两姊妹件按其结论定稿——候选池段替换为「PR-B 序 = BR §6 正本 + 四条边界」，RS 的 CI 单腿/600s 标定/案 A 文件名修正进测试方案，rubric §7 对接位闭环。**无待修订遗留**；后续 BR §6 序若因剖析读数（O10）调整 ⑩ 组顺序，属 BR 文档自治，本文件不随动。

---

*CC-PERF-DES · 2026-08-27 — 性能 85 实现三段序冻结：PR-A CITY-PERF-01/02 e2e（零依赖先行，CI 证据从 0 到 1，纯测试侧——对 BR §6 ① 的 O4/O10 合包做出拆分裁决）→ PR-B 序 Quality 优化（正本 = BR §6 十步，本 plan 补证据义务/红线/争议项执法四条边界）→ PR-C 真机回填 + AL-PERF 登记（northStar 自动出数，接线零欠账）。欠账与风险显式列表；RS/BR 对接位已闭环。仅文档交付，`src/` 零改动。*
