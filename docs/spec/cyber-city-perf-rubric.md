# 赛博科技城性能 Rubric v1.0（CC-PERF-DES · 冻结版 · 正本）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-PERF-DES**（Loop 8 性能扩展三路之一）——性能 rubric 正本：把功能 rubric §5–§6.2 的「顾问 §3 冻结镜像」提取独立化，逐维锚点、85 门语义与登记 JSON 契约首次全量落地 |
| 分支 | `cursor/cc-perf-des-spec-1d6f`（base：`main` @ `cf76d35`） |
| 日期 | 2026-08-27 |
| 版本 | **v1.0 冻结**：五维权重（P1 30 / P2 20 / P3 20 / P4 15 / P5 15）逐字继承顾问报告 `cyber-city-fxn-advisor-consult.md` §3.2 与功能 rubric `cyber-city-function-rubric.md` §5 已冻结值，**零改秤**；逐维 0-100 锚点段位、85 门结构条款、登记 JSON 完整 schema 由本文件首次落地。改权重/维度/锚点段位必须升版本号（§6） |
| 评分对象 | 生产 `/`（或 `pnpm build && pnpm preview` 产物）的 **world 运行时体验**：挂载 → robot_idle → 变形 → 驾驶 → POI 进站核心路径的帧率/帧稳/加载可玩/预算/降档五面。**不测壳加载分**（LHCI 承载，§1） |
| 上游 | 顾问报告 §3（双轨口径+采样方案）· 功能 rubric §5/§6.2（冻结镜像源，本文件为其独立化正本）· **PERF-RS 调研 `cyber-city-runtime-perf-survey.md` §3.3/§3.5（已合 PR #59：SwiftShader 物理事实 + CITY-PERF-01 设计输入）**· **PERF-BR 脑暴 `cyber-city-perf-optimization-features.md`（已合 PR #60：O1–O14 特性清单）**· 可观测规格 `cyber-city-observability.md` §3.2（`funnel.robotIdle` 机读位）/ §6.1（`city-perf-evidence.jsonl` 工件行）· human-gate `human-gate-checklist.md` §5.4（真机表）/ §5.5（豁免留痕先例）· WS-PERF-01 `e2e/world-spike-perf.spec.ts`（CI 证据包模式先例）· 姊妹件 `cyber-city-perf-test-plan.md`（CITY-PERF-01/02 测试方案，同批交付） |
| 消费方 | **CC-AL-PERF**（Sol 审计 + human-gate 回填核验，唯一登记人）· CC-PERF-C1（CITY-PERF-01 实现）· CC-PERF-C2 起（Quality 优化序，BR §6）· 父代理看板（northStar 四数）· `scripts/score-loop.mjs`（northStar.perf 已接线读 `docs/research/cyber-city-perf-rubric-score.json`） |
| 判定权威 | 性能分 = **真机 human-gate §5.4 录测 + 锚点对号**；CI（CITY-PERF-01 / audit-budget）只做下界哨兵与 P4 权威，**SwiftShader 时长/帧率读数永不充当 P1/P2/P3 判定**（§1 铁律 2） |

---

## 0. 结论先行（冻结清单）

1. **五维权重冻结**：P1 帧率体感 30 / P2 1% low 20 / P3 加载可玩 20 / P4 预算 15 / P5 降档可感知 15 = **100%**（§2.1）。逐字继承功能 rubric §5 已冻结值，本文件零改秤、只补锚点段位与登记契约。
2. **三条口径铁律**（§1）：**与 LHCI 彻底分立**（壳加载分不入本 rubric 分母）、**真机权威 / CI 下界**（SwiftShader 读数只作下界参考与趋势哨兵——生态佐证：three.js 官方 CI 自己也不判帧率，PERF-RS §3.2）、**留空不伪造**（真机行产不出时对应维 `score` 置 `null`，禁止预计值填充；任一维 `null` ⇒ 总分 `null`，登记未完成）。
3. **85 门 = 数值门 + 结构门**（§2.3）：Σ(维分×权重) ≥85 之外另设五条结构前置——P4 必须 100、P1 桌面双后端满门、P5 ≥70、P1/P2/P3 无 `null`、真实缺口至多一处（P1 安卓腿**或** P5 反馈缺失，二者不得并存）。纯加权和存在「双缺口仍 ≥85」的数值空洞，结构门就是堵这个洞的（防凑分条款）。
4. **登记 JSON 契约冻结**（§4）：`docs/research/cyber-city-perf-rubric-score.json`，骨架与视觉/功能 score JSON 同构（schemaVersion / score / target / subject / rubric / scoredAt / scoredBy / evidence / dimensions / notes）；perf 专属差异 = **无双 Pass 块**（仪器读数对门，非主观量表，代之以 `verification` 双源互证块）+ `evidence.humanGate` / `evidence.ciEvidence` 溯源字段 + 逐维 `null` 语义。
5. **消费链已就位**：score-loop northStar 块（OBS-C2，PR #57 已合）恒读本登记位 `score` 字段，缺失/非法 = `null` + sources 注记「（缺失）」——本文件落地后登记面零接线欠账，只欠真机读数与审计。
6. **正本迁移**：功能 rubric §5/§6.2 自本文件合流起降级为**历史镜像**，两处指针化注记（指向本文件）由 CC-PERF-C1 随行 doc 补丁落账（实现 PR 序见 `docs/research/cyber-city-perf-impl-plan.md`）；镜像与正本冲突时**以本文件为准**。

---

## 1. 目的与口径铁律

**只测「world 运行时体验合不合格」**：帧率够不够顺、帧稳不掉坑、多快能开玩、体积不超编、降档保底可玩。**不测**壳加载指标（LCP/TBT/CLS 归 LHCI，`/` 已 P100——poster-first 架构下 world 掉到 10fps LHCI 分毫不动，拿它当性能分必然假高，顾问 §3.1 结论直接继承）、不测视觉工艺（视觉 rubric 承载）、不测交互体验（功能 rubric 承载，防双计）。

**口径铁律**（v1.0 起为本 rubric 法条）：

1. **与 LHCI 彻底分立**：LHCI 四类分继续留在综合分五维里，两边互不折算；性能分分母恒为 world 运行时。
2. **真机权威 / CI 下界**：P1/P2/P3 判定权威 = 真机 human-gate §5.4 录测（桌面 Chrome + 中端安卓，双后端）；CI（CITY-PERF-01）SwiftShader 软渲染 ~1fps（本站实测 avg 1.11fps 存档），任何数值硬门要么恒假阳性要么恒假阴性（WS-PERF-01 文件头结论 + three.js 官方 CI 先例，PERF-RS §3.2/§3.3）——CI 读数仅作①软件光栅化硬下界归档、②跨 commit 趋势对照、③p95<50ms 软门哨兵。P4 例外：**预算维 CI 即权威**（audit-budget 是机器可判定的字节账）。
3. **留空不伪造**：云端代理产不出真机读数——对应维 `score` 置 `null` 留空并把欠账列为登记前置（human-gate §5.5 豁免留痕先例）；禁止以预计值、CI 读数换算值、旗舰机读数填充中端安卓行。

**分值标定（全局锚）**：

- **90-100** = 「任何目标设备上拿起来就是顺的」——桌面双后端 60 满门、安卓 30 达标、8s 内可玩、预算零超编、降档保底完整；
- **70-85** = 核心档位（桌面）满门，边缘腿（中端安卓 / 降档反馈）有可数缺口；
- **50-65** = 桌面可玩但帧稳有感知问题，或加载明显拖沓（>10s）；
- **30-45** = 主战场（桌面）也不达标，或降档路径不可完成；
- **0-25** = 不可玩（持续卡停 / 加载不可达 / 预算失控连带一切）。

**反通胀**：逐维必须引用当轮证据（真机记录表行 + 录屏/HUD 截图，或 P4 的 CI run 链接）+ 锚点段落；与上轮分差 ≥±10 的维必须写差异说明（视觉/功能 rubric 同构铁律）。

## 2. 五维权重与 0-100 锚点（冻结）

### 2.1 权重表

各维 0-100 独立打分（5 的倍数，允许段内插值；P4 二值例外），**总分 = Σ(维分 × 权重)，四舍五入取整**；任一维 `null` 时总分 `null`（§4.1）。

| 维 | 权重 | 口径 | 判定权威 | CI 哨兵 |
|----|:---:|------|----------|---------|
| P1 帧率体感 | 30% | 桌面双后端（WebGPU + `?gl=1`）变形+驾驶 20s 均值 ≥60 **且** 中端安卓双后端 60s 持续 ≥30（human-gate §5.4 四行） | **真机录测** | CITY-PERF-01 下界读数（不判定） |
| P2 1% low | 20% | 桌面双后端 1% low ≥45（变形+驾驶 20s；FpsMeter `low1` 既有口径，HUD「均值 / 1% low」第二数） | 真机 HUD + DevTools Performance 互证 | 同上 |
| P3 加载可玩 | 20% | Fast 4G「导航→robot_idle CTA 可用」≤8s（真机秒表判定；机读位 `funnel.robotIdle` 互证，含系统差见 §3.3） | 真机 throttle 秒表 + funnel 互证 | funnel 存在性 only |
| P4 预算 | 15% | audit-budget 零 ❌（world JS 全量 ≤900KB gzip · 壳零 world 字节等全套既有门） | **CI（本维 CI 即权威）** | 同左 |
| P5 降档可感知 | 15% | `?quality=2` 完成核心路径（变形→驾驶→进站）且无功能性缺失 | S-5 L6 腿（真人，功能 rubric §4.3）+ 真机 Q2 安卓腿（§3.2 增补行） | e2e Q2 存在腿（CITY-PERF-02，测试方案 §3） |

> 权重推导（顾问 §3.2 采纳理由留痕）：P1 是体感第一因子独占 30；P2/P3 是「顺不顺」与「多快能玩」两大可感知支柱各 20；P4/P5 是纪律维与保底维各 15。合计 100%。

### 2.2 逐维锚点

#### P1 帧率体感（30%）

被测四腿（human-gate §5.4 行 1-4）：桌面 WebGPU 20s、桌面 WebGL2（`?gl=1`）20s、中端安卓默认 60s、中端安卓 WebGL2 60s；动作脚本统一（变形 → 十字路口驾驶：2 次急转 + 1 次撞道具 + 1 次 Shift boost 直线，§3.1）。门值：桌面均值 ≥60、安卓持续 ≥30；**80% 门值线**（桌面 48 / 安卓 24）为落段分界——安卓 24 即 PRD 止损判据线，两把尺子天然对齐。

| 分段 | 锚点 |
|:---:|------|
| 100 | 四腿全达标（桌面双后端 ≥60 且 安卓双后端 ≥30） |
| 85 | 恰一腿未达标，且缺口腿 ≥80% 门值（桌面 ≥48 / 安卓 ≥24）——「85 门允许的那一处 P1 缺口」上限段 |
| 70 | 恰一腿 <80% 门值；或两腿未达标但均 ≥80% 门值 |
| 50 | 两腿未达标且至少一腿 <80% 门值（体感普遍不顺） |
| 30 | 桌面任一腿 <48（主战场失守） |
| 0-25 | 安卓 <24 且三板斧无效（触发止损裁决面，rubric 分数已非主要矛盾） |
| `null` | 任一腿真机读数产不出且无豁免留痕替代——**不得**用已有腿外推缺失腿 |

#### P2 1% low（20%）

被测：桌面双后端 20s 脚本的 1% low（FpsMeter `low1`，HUD 第二数为主、DevTools Performance 轨道互证；归因分叉可用 DevTools + `#debug` 面板，GPU ms 行为 PERF-BR O10/RS §3.2 裁决点合流后生效）；门值 ≥45，80% 线 = 36。安卓 1% low 仅记录不入门（v1.0 显式裁决：中端安卓帧稳并入 P1 的「持续 ≥30」语义，防同一缺口双扣）。

| 分段 | 锚点 |
|:---:|------|
| 100 | 双后端 1% low ≥45，且 DevTools 轨道无红色长任务连片 |
| 85 | 单后端 <45 但 ≥36；另一后端达标 |
| 70 | 双后端 <45 但均 ≥36；或单后端 <36 |
| 50 | 双后端 <36（掉帧可感知：转向/变形瞬间肉眼卡顿） |
| 30 | 长帧尖峰连片（DevTools 红块成串）或周期性卡停 ≥0.5s |
| 0-25 | 持续卡停不可玩 |
| `null` | 真机行产不出（同 P1 纪律） |

#### P3 加载可玩（20%）

被测：桌面 Chrome DevTools Fast 4G throttle、清存储首访，从导航开始秒表计时到 **robot_idle CTA 可用**（「变形 · 巡航态 Space」可点）；`funnel.robotIdle`（dump 机读位）截图入档互证。锚点段位为功能 rubric §5 冻结值（≤8s=100 · 8–10s=70 · >10s=40）的展开：

| 分段 | 锚点 |
|:---:|------|
| 100 | ≤8s（SRD §12.7.2「加载→可变形 ≤8s」预算达成） |
| 70 | 8–10s |
| 40 | >10s（且最终可达） |
| 0 | CTA 不可达（robot_idle 永不 armed / 加载死锁） |
| `null` | 真机 throttle 计时产不出（CI 慢动作读数不得替代，铁律 2） |

#### P4 预算（15%）

被测：audit-budget 既有 CI 硬门全套（world JS 全量 ≤900KB gzip、壳零 world 字节、G-A′ 壳预算、G-D 受保护页零命中等）。**二值维：零 ❌ = 100，任何 ❌ = 0**——预算是红线不是滑窗（顾问 §3.2 原文），且本维 **CI 即权威**、永不留 `null`（每个 commit 都能诚实产出）。

#### P5 降档可感知（15%）

被测：`?quality=2` 最低档完成核心路径（变形 → 驾驶 → POI 进站），全程无功能性缺失（输入可用、状态机可达、HUD 可读）；「可感知」= 降档后反馈层（碰撞脉冲 / respawn toast / boost 呈现等 FXN-C2 反馈面）仍在岗。判定 = S-5 L6 真人腿 + 真机 Q2 安卓腿（§3.2 增补行 5）；CI 哨兵 = CITY-PERF-02 存在腿（测试方案 §3）。

| 分段 | 锚点 |
|:---:|------|
| 100 | 核心路径完成且反馈层完整（Q2 下与 Q0 功能面零差异，仅视觉降档） |
| 70 | 核心路径完成，但反馈层存在可数缺失（如碰撞脉冲在 Q2 被裁掉、toast 不显示） |
| 0 | 核心路径不可完成（任一步卡死 / 输入失效 / 状态机断链） |
| `null` | 真人腿与真机腿均未执行（CI 存在腿绿**不得**单独充当 100 依据——哨兵非判定） |

> 与 PERF-BR O1（FPS 自动降档）的关系：自动降档落地后其 toast 确认层即本维「可感知」的实现面（BR §5「完成但反馈缺失=70 → 完成=100」路径）；**显式 `?quality=` 深链永不被自动档覆盖**（BR O1 冻结约束），故本维取证路径与自动降档解耦、口径不变。

### 2.3 85 门语义（数值门 + 结构门，防凑分）

**数值门**：Σ(维分×权重) ≥85。

**结构门**（缺一即不过 85，与数值无关）：

1. **P4 = 100**——预算红线不许拿其他维冲抵；
2. **P1 桌面双后端满门**（桌面 ≥60 两腿全过）——主战场没有让渡空间；
3. **P5 ≥70**——降档核心路径必须可完成（0 分 P5 = 保底承诺失效）；
4. **P1/P2/P3 无 `null`**——真机欠账未清不登记（留痕文件可先存，`score` 顶层为 `null`，§4.1）；
5. **真实缺口至多一处**：允许 P1 安卓腿缺口（P1 落 85 段）**或** P5 反馈缺失（P5 = 70），**二者并存即不过门**。

> 为什么需要结构门（数值空洞演示）：P1=85（安卓单腿缺口）+ P5=70（反馈缺失）+ 其余满分 ⇒ Σ = 25.5+20+20+15+10.5 = **91 ≥ 85**——纯加权和挡不住双缺口。顾问 §3.2「允许一处、不允许两处」因此必须是独立结构条款，不是加权和的推论。审计时对任何 ≥85 的登记单先跑五条结构门再验算式。

**典型合成参考**（顾问 §3.2 示例留痕）：四腿满门 P1=100（30）+ P2 达标（20）+ P3 ≤8s（20）+ P4 零❌（15）+ P5 完成带小缺口 70（10.5）= **95.5 → 96**；P1 安卓腿缺口落 85 段、其余满分 = 25.5+20+20+15+15 = **95.5 → 96**。

## 3. 取证规程（复现协议）

### 3.1 真机侧（判定权威 · 每次登记前必做）

1. 对象 = 生产 `/` 或 `pnpm build && pnpm preview` 产物（**不测 dev server**，与 e2e/human-gate 口径一致）；
2. 表 = human-gate §5.4 四行（桌面 WebGPU / 桌面 `?gl=1` × 变形+驾驶 20s；安卓中端默认 / `?gl=1` × 60s）+ §3.2 增补两行；设备选型、DevTools 方法论、三板斧与止损处置沿用 human-gate §2.0–§2.2 全文（动作脚本换城市档：**变形 → 十字路口驾驶，2 次急转 + 1 次撞道具（隔离墩）+ 1 次 Shift boost 直线**——城市档锥桶已撤场，「撞道具」以 `StreetProps.hitCount` 承接，观测规格 §3.4 cone-hit 行随行修订口径）；
3. 三件套纪律：①全程录屏 ②驾驶尾段 HUD 截图（「FPS 均值 / 1% low」+ 后端徽标入镜）③记录表一行；归档 `docs/spec/assets/human-gate/`，命名 `cityperf_<desktop|android>_<webgpu|gl2|q2|fast4g>_<yyyymmdd>.<mp4|png>`；
4. P3 腿另加：DevTools Network Fast 4G + 清存储，录屏含秒表；结束执行 `JSON.stringify(window.__worldSession.dump())` 落盘，`funnel.robotIdle` 数值截图入档；
5. 旗舰机读数不作安卓门禁依据（可另记参考行，判定列画「—」，human-gate §2.2 既有纪律）；安卓 <30fps 时的系统级归因可选 Perfetto 深挖（PERF-RS §3.6 工具箱，零采购）。

### 3.2 human-gate §5.4 增补两行（本文件冻结，回填时复制追加至该表）

| # | 设备 | 后端/参数 | 场景/时长 | 读数 | 服务维 |
|---|------|-----------|-----------|------|:---:|
| 5 | 安卓中端 | 默认 + `?quality=2` | 变形→驾驶→进站核心路径完整跑通 | 完成/缺失项清单 + FPS 均值（参考） | P5 |
| 6 | 桌面 | 默认 + DevTools Fast 4G + 清存储 | 导航→robot_idle CTA 可用 | 秒表秒数 + `funnel.robotIdle` 截图 | P3 |

### 3.3 CI 侧（下界哨兵 · 每 PR）

CITY-PERF-01 证据包（正本 = 姊妹件 `cyber-city-perf-test-plan.md`）：`test-results/city-perf-evidence.jsonl` 逐 commit 归档帧间隔分布 + 环境指纹 + dump 附档；p95<50ms 软门（OBS annotation 不阻断）。**CI 单腿裁决**（PERF-RS §3.3 物理事实采纳）：CI 不做 `?gl=1` 双后端腿——SwiftShader 的 WebGPU 腿存在 `createBuffer` 缺陷且实测自动回退 webgl2（`webgpuAvailable: true` 而 `backend: "webgl2"`），双后端差异恒归真机，CI 靠 `__worldSpike.backend` 指纹归因实际后端。**取证注记（P3 含系统差）**：`funnel.robotIdle` 时基是 SessionTimeline 构造帧（= world 分包已加载、Game 已构造），**不含**导航到 world chunk 就绪的壳加载段——真机秒表（从导航起算）恒 ≥ funnel 值，故 funnel 只作下界互证、秒表为判定；CI 证据另记 `timing.loadToRobotIdleMs`（Playwright 侧导航起算墙钟）补齐对照，同为下界 only。

### 3.4 audit-budget（P4 权威）

沿用既有 CI 硬门，登记时引用同 commit 的 CI run（`ciEvidence` 的 `budgetRun`）；本维无真机腿。

## 4. 登记 JSON 契约（冻结）

登记位 `docs/research/cyber-city-perf-rubric-score.json`（与视觉/功能 score JSON 同目录同构）；`score` 字段为唯一机读位（score-loop northStar.perf 已接线恒读它）。**重打分只改分值与证据，不改 schema；改维度/权重/锚点段位须升版本号并同步本文件。**

```jsonc
{
  "schemaVersion": "1.0.0",
  "score": null,                    // 0-100 整数 = Σ(维分×权重) 取整；任一维 null ⇒ 恒为 null（唯一机读位）
  "target": 85,
  "subject": "被评对象：分支/PR/commit + 一句话交付面描述（含可复现 commit）",
  "rubric": "docs/spec/cyber-city-perf-rubric.md",
  "rubricVersion": "1.0",
  "scoredAt": "YYYY-MM-DD",
  "scoredBy": "CC-AL-PERF 独立审计 + human-gate 真机回填（模型/执行人自报）——实现方自评永不登记",
  "verification": {                 // perf 专属：无双 Pass（仪器读数对门非主观量表，v1.0 显式裁决）；代之以双源互证
    "hudVsDevtools": "P1/P2 每腿 HUD 读数与 DevTools Performance 轨道互证结论（分歧 >10% 须复测）",
    "stopwatchVsFunnel": "P3 秒表读数与 funnel.robotIdle 对照（秒表 ≥ funnel 为合法形态，反向即数据可疑）",
    "ciCrossCheck": "同 commit city-perf-evidence.jsonl 下界读数不与真机读数矛盾（下界 > 真机 = 环境标注错误）"
  },
  "evidence": {
    "humanGate": "human-gate §5.4 记录行引用（行号/日期）或豁免留痕 + 欠账清单（§5.5 先例）",
    "ciEvidence": "test-results/city-perf-evidence.jsonl 同 commit 行引用——标注「下界哨兵非判定」",
    "recordings": ["docs/spec/assets/human-gate/cityperf_…（命名含腿别与日期）"],
    "sessionDumps": ["P3/P5 腿 dump 落盘路径"],
    "budgetRun": "P4 的 CI run 链接（同 commit audit-budget 零 ❌）",
    "environment": "生产 / preview + 设备型号/SoC + 浏览器版本 + 清存储确认"
  },
  "dimensions": {
    "p1FrameRate":      { "label": "帧率体感",   "weight": 0.30, "score": null, "evidence": "四腿读数逐行引用（缺腿 = null + 欠账注记）" },
    "p2OnePercentLow":  { "label": "1% low",     "weight": 0.20, "score": null, "evidence": "" },
    "p3LoadToPlayable": { "label": "加载可玩",   "weight": 0.20, "score": null, "evidence": "" },
    "p4Budget":         { "label": "预算",       "weight": 0.15, "score": null, "evidence": "CI run 引用（本维可只引 CI）" },
    "p5QualityFallback":{ "label": "降档可感知", "weight": 0.15, "score": null, "evidence": "" }
  },
  "structuralGate": {               // §2.3 五条结构门逐条判定（85 门审计位；未到 85 门轮次填 n/a）
    "p4Full": null, "p1DesktopFull": null, "p5AtLeast70": null, "noNullDims": null, "atMostOneGap": null
  },
  "notes": "一段话结论 + 合成算式（Σ 维分×权重 → 取整）+ 结构门结论"
}
```

### 4.1 `null` 语义（冻结）

- 维级 `score: null` = 该维证据产不出（真机欠账），**不是 0 分**；`evidence` 必须写明缺哪条腿与欠账去向；
- 顶层 `score` 在任一维为 `null` 时**必须**为 `null`——禁止「跳过缺失维归一化重算」（那等于偷偷改权重）；
- northStar 消费面（score-loop 既有实现）：`score` 非法/`null`/文件缺失 → 看板显示 `—`，符合「缺失明示，禁止估值」纪律；
- P4 永不 `null`（CI 每 commit 可产出）；P4 拿不到读数 = 基础设施故障，修 CI 而不是留空。

### 4.2 登记有效性校验（缺一登记无效）

1. `dimensions[*].weight` 合计 = 1 且与 §2.1 一致；`score` = Σ(维分×权重) 取整（允许 ±1 归整差）或按 §4.1 为 `null`；
2. 每个非 `null` 维 `evidence` 非空：P1/P2/P3/P5 含真机记录行引用 + 录屏/截图归档路径（P4 可只引 CI run）；每个 `null` 维含欠账注记；
3. `subject` 含可复现 commit；`evidence.ciEvidence` 与 `evidence.budgetRun` 为**同 commit** 产物；
4. 同 commit 回归面不塌：全量 e2e 0 failed + LHCI 不降 + audit-budget 零 ❌（必要条件非充分条件）；
5. `scoredBy` = 独立审计（CC-AL-PERF）+ 真机执行人；出现实现方署名即无效；
6. 登记 ≥85 时 `structuralGate` 五条全 `true`（§2.3）。

## 5. 与 score-loop / LHCI / e2e 的关系

**综合分五维权重不动**（LHCI `/` 25 · LHCI `/home/` 15 · e2e 20 · 视觉 25 · smoke3d 15）；性能分**不折算**进五维，是与综合分并列的北极星维度（北极星四数：视觉 98 · 功能 90 · **性能 85** · 综合 98）。northStar 只读汇总块已由 OBS-C2 落地（score-loop.mjs 读本登记位，缺失显 `—`）——本 rubric 只锁契约，零新接线。

**四层分工（性能列，谁也不许替谁签字）**：

| 层 | 测什么 | 门 |
|----|--------|-----|
| audit-budget | 字节预算（P4 分母） | **挡合并**（既有硬门；且 P4 的判定权威） |
| CITY-PERF-01 证据包 | CI 下界读数 + 帧间隔分布 + p95<50ms 软门 | **软门**（OBS annotation 不阻断；哨兵非判定） |
| CITY-PERF-02 Q2 存在腿 | 降档核心路径可达性（P5 哨兵） | **挡合并**（存在性/顺序性断言，SwiftShader 可诚实判定） |
| 性能 rubric（本文件） | 真机运行时体验合不合格 | **挡登记** |

## 6. 版本纪律与禁止清单

**版本纪律**：改维度/权重/锚点段位/结构门 → rubric 主版本或次版本 +1 并同步 §2.1 与登记 JSON `rubricVersion`；登记 JSON schema 破坏性变更 → `schemaVersion` 主版本 +1；加法字段（如新增 evidence 子键）不升版。任何改秤必须走本文件 PR 留痕，**不许口头改秤**（视觉/功能 rubric 同构条款）。

**禁止清单**（顾问 §5.2 八条约束力全文继承，此处列性能直接绑定项）：

| # | 禁止 | 本文件锚 |
|---|------|----------|
| 1 | 实现代理自评登记性能分 | §4.2-5 |
| 2 | 用 LHCI performance 分（或综合分）冒充性能分 | §1 铁律 1 / §5 |
| 3 | CI SwiftShader 时长/帧率读数充当 P1/P2/P3 判定 | §1 铁律 2 / §3.3 |
| 4 | 真机表伪造或以预计值/换算值/旗舰机读数填充；产不出就 `null` 留空列欠账 | §1 铁律 3 / §4.1 |
| 5 | 任一维 `null` 时合成顶层分（含「归一化重算」变体） | §4.1 |
| 6 | 用 CITY-PERF-02 存在腿绿单独充当 P5 = 100 依据 | §2.2 P5 / §5 |
| 7 | 双缺口（P1 安卓腿 + P5 反馈缺失并存）登记 ≥85 | §2.3 结构门 5 |
| 8 | 改权重/锚点不升版本号、登记溯源字段缺失 | §6 / §4.2 |
| 9 | 为凑 CI 读数改采样窗/降负载/换轻量动作脚本（脚本同源铁律） | §3.1-2 / RS §3.3 |

## 7. 开放问题（RS/BR 已吸收项 + 遗留裁决点）

1. **RS/BR 对接位——已闭环**：CC-PERF-RS（PR #59）与 CC-PERF-BR（PR #60）在本文件冻结前已合 main，其结论直接吸收：CI 单腿裁决（§3.3）、脚本同源铁律（禁止清单 9）、three.js 官方 CI 先例作「软门不转硬」依据（§1 铁律 2）、O1 自动降档与 P5 口径的解耦条款（§2.2 P5 注记）。**无待修订遗留**。
2. **安卓 1% low 是否入门**：v1.0 显式并入 P1「持续 ≥30」语义（§2.2 P2 注记）；若真机回填后发现安卓帧稳与均值显著解耦（均值达标但 low 崩），v1.1 议题重开。
3. **WebGPU device.lost 对 P2 的污染**：`context-lost` 事件（观测规格 §3.4）出现在取证窗口内时该腿读数作废重测——先记为审计注意项，不入 schema。
4. **`#debug` GPU ms 行**（RS §3.2 / BR O10 裁决点）：three 0.185 内建 `trackTimestamp` 的 GPU 计时落地后，P2 归因分叉（CPU 帧循环慢 vs GPU 渲染慢）获得零依赖工具——影响取证效率不影响秤，落地归 BR §6 序。

---

*CC-PERF-DES v1.0 · 2026-08-27 — 性能 rubric 正本独立化冻结：五维权重（P1 30 / P2 20 / P3 20 / P4 15 / P5 15，继承零改秤）+ 逐维 0-100 锚点 + 85 门「数值门 + 结构门」双层语义 + 登记 JSON 完整 schema（`null` 留空纪律 + structuralGate 审计位）+ 四层分工；PERF-RS/BR 结论（CI 单腿、脚本同源、自动降档解耦）已吸收闭环。仅文档交付，`src/` 零改动；姊妹件 `cyber-city-perf-test-plan.md`（CITY-PERF-01/02 测试方案）与 `cyber-city-perf-impl-plan.md`（实现 PR 序）同批。*
