# 赛博科技城视觉 G3 书面裁决 + X5 并行开工授权（CC-VIS-G3-X5-GATE）

> 执行模型自报：**claude-fable-5-thinking-xhigh**

| 项 | 内容 |
|----|------|
| Task | **CC-VIS-G3-X5-GATE**（G3 计时口径书面裁决 + X5 入场编舞并行开工授权 · doc-only——裁决即本文，落秤/落 spec 动作按 §1.2 生效条件分批后置） |
| 分支 | `cursor/cc-vis-g3-x5-gate-1d6f`（base `main@771b1e4` = PR [#94](https://github.com/rayw-lab/website/pull/94) 合流 tip，独立 worktree） |
| 日期 | 2026-08-27 |
| 必读输入 | `cyber-city-vis-73-next-advisor.md`（顾问，分支 `cursor/cc-vis-adv-73-1d6f` @ `1573ad1`，§2.3 主路线 / §3 表 ⑤ / §5 A2）· `cyber-city-visual-l8-design-confirm.md`（设计确认 ⑦ / §5 G3 / D5）· `cyber-city-visual-l8-optimization-features.md`（BR X5 §4 原文）· PERF 轨：`cyber-city-perf-optimization-features.md`（O3）· `docs/spec/cyber-city-perf-test-plan.md`（CITY-PERF-01 冻结规格）· `docs/spec/cyber-city-perf-rubric.md` v1.0 · `cyber-city-perf-first-score-advisor-r2.md`（PR [#88](https://github.com/rayw-lab/website/pull/88)，B3 未合核验 + 首分窗口纪律） |
| 消费方 | 父代理（G3 销账登记 + CC-VIS-X5-ENTRANCE 转单，§4 触发一句）· X5 实现单（§2 授权范围 + §3.1 随批修订清单）· PERF 轨 B3 任务书（§3.3 联动三条）· CC-AL-VIS-L8-W3 复评单（§2.3 水位口径） |
| 纪律 | doc-only：零 `src/`、零 e2e、零 score、零 poster、零基线改动；本文**不直接改** rubric / test-plan / human-gate 正本（修订按 §3 权属与时序分批提请）；PR [#43](https://github.com/rayw-lab/website/pull/43) 禁合流不变；评分正本恒归独立审计 |

---

## 0. 结论先行

1. **G3 裁定：「skip 即达」口径成立**（§1.1）——P3「加载→可玩 ≤8s」门在含入场编舞的默认路径上，计时终点 = **skip 可用时刻**；编舞时长（2.5–3.5s）不计入门。两条护栏使口径诚实不可凑：**护栏 A** skip 触发后立即收束到 robot_idle（e2e 断言）；**护栏 B** skip 可用时刻必须晚于可玩资源全部就绪、skip 后零新增等待。≤8s 门值、P3 权重 20%、三段制、真机唯一判定权威、CI「采集不判定」禁令全部不动——本裁决只定判定终点语义。
2. **X5 并行开工授权即刻生效**：本备忘 push 在案即销 G3（设计确认 ⑦ 对 X5 的唯一前置），CC-VIS-X5-ENTRANCE 可与 W3 的 X4/X7 **并行开工**（文件域正交，§2.1/§2.2）；**串行合流恒排 X7 合流 + 其基线重签完成之后**（X5 触帧取证必须在定案 TM + 天空 v2 上一次到位，三条理由 §2.2）。X14 镜头扩展不预支，留 W4 原位。
3. **与 PERF O3/CITY-PERF-01 联合修订 = 三个落点、两个时序**（§3）：CITY-PERF-01 加法修订（`loadToSkippableMs` 等采集字段 + 协议注记）**随 X5 实现批同 PR 提请**；perf rubric §4.1 行 6 + human-gate §5.4 行 6 的「skip 即达」终点注记属改秤动作，**并入已排定的 v1.1 升版复核一次升版**（与 P5 注记双注记省一次版本号）；O3（PERF B3，未合）任务书承接联动三条（预取窗合并 / 对账字段编舞无关化 / 同文件串行）。冲突优先级四条见 §3.4——PERF 首分真机冻结窗最高，X5 禁在窗内合流。
4. **水位判读**：X5 收进 W3 复评窗口（CC-AL-VIS-L8-W3 触发条件「W3 含 X5 若已合全合」）即补 V5 缺口（74→76~77 下沿口径，raw +0.30→+0.65）——~78 在该窗口**上沿可达**；诚实落点维持顾问 §2.3 的 **76±1**，差额兜底恒归 W4 X17，不在本轮预支。

## 1. G3 裁决

### 1.1 裁决主文与口径定义（冻结措辞）

G3 原文（设计确认 §5）：「P3 计时口径（入场编舞 vs 加载→可玩 ≤8s 门）| 前置于 ⑦ X5 | 建议『skip 即达』口径，与 PERF 轨（O3/CITY-PERF-01）联合修订，实现前定案」。**本文即该书面裁决：建议原文全部采纳，「实现前定案」的动作在此完成。**

| 条 | 冻结措辞 |
|----|----------|
| 终点定义 | 默认路径（非 reduced-motion、用户未主动 skip）下，P3「加载→可玩」计时终点 = **skip 可用时刻**（入场编舞首帧起 skip 立即可用）；机读锚 = X5 批新增一个 dump/funnel 时间戳位（拟名 `entranceSkippable`，命名随实现批冻结），真机腿 6 与 CI 证据**同源引用**（perf rubric S4 同源纪律的 P3 延伸） |
| 护栏 A（立即收束） | skip 触发（任意键 / Skip 钮，BR X5 原文）后**立即收束**到 robot_idle——X5 批 e2e 断言 skip → robot_idle 短窗达成，收束门值随实现批标定写入 spec |
| 护栏 B（诚实计时） | skip 可用时刻必须**晚于 robot_idle 可玩所需资源全部就绪**：skip 后零新增网络/编译等待；编舞期间任何后台预取（含 O3 车资产，§3.3-1）不得阻塞收束。**违反任一护栏则「skip 即达」对该轮不成立**，腿 6 按 robot_idle 自然达成计时 |
| reduced-motion 路径 | 直出 robot_idle（CITY-E2E-04 口径不变，BR R6），计时终点即 robot_idle——与现行为逐字一致，零修订 |
| 自然路径留档 | 未 skip 的 robot_idle 自然达成时间照采不判（`loadToRobotIdleMs` 语义保持「采集不判定」，加「X5 后含编舞时长」注记，§3.1-1） |
| 边界申明 | 本裁决**只定 P3 判定终点语义**：≤8s 门值、P3 权重 .20、三段制（100/70 无插值）、腿 6 真机唯一判定权威、CI 禁 ≤8s 判定（SwiftShader 禁令）全部零改动 |

### 1.2 生效条件（三条 + 零追溯）

| # | 条件 | 时点 | 说明 |
|---|------|------|------|
| 1 | **裁决在档** | 本备忘 push 在案 | G3 即销账——设计确认 ⑦ 对 X5 的唯一前置解除，X5 并行开工即刻合法（§4 触发一句的依据） |
| 2 | **秤面注记落地** | v1.1 升版批（或 X5 批先行，见硬约束） | rubric §4.1 行 6 + human-gate §5.4 行 6 的「skip 即达」终点注记按 rubric §7 升版程序落地（判定腿被测语义细化 = 改秤动作，PERF 顾问 R2 §2.1 P5 先例同构）；建议与已排定的 P5 v1.1 复核**合并一次升版**。**时序硬约束**：X5 合流后、任何腿 6 执行前，该注记必须已在档——否则腿 6 读数无效重跑 |
| 3 | **机器面落地** | 随 X5 实现批同 PR | CITY-PERF-01 加法修订（§3.1 清单）——限采集字段与协议注记，判定语义变更禁入（修订权属 §3.4-3） |
| — | **零追溯条款** | 恒 | X5 合流前的任何腿 6 读数（被测面无编舞）按 rubric v1.0 现文（终点 robot_idle）恒有效，本裁决不追溯既往 |

### 1.3 与设计确认 ⑦ 及上游文件的对齐引用

- **设计确认 ⑦（W4 行）原文**：「X5 入场编舞 + X14 镜头扩展 | 前置 = G3 计时口径裁决；**与 ⑤⑥ 文件域正交可并行开工、串行合流**」——本裁决销其前置；「并行开工、串行合流」的授权语义原文承接，本文 §2.2 只把串行合流点钉死为「X7 后」（顾问 §3 表 ⑤ 同款）。X14 不随 X5 提前（§2.1 边界）。
- **设计确认 §5 G3 行**：建议（skip 即达 + 与 PERF O3/CITY-PERF-01 联合修订 + 实现前定案）逐字采纳；**D5 裁定**（X5 为独立 P0 承重件，V5 90 段锚点「入场-转场-微动-镜头四层皆有设计」唯一缺入场层）为本授权的价值依据。
- **BR X5（§4）**：方案原文（loading → 高空 flyby 2.5–3.5s 掠过 hero 楼招牌 → 收束出生点 → 衔接光柱 reveal；skippable；reduced-motion 直出；VIS-03 拍点后移）为 X5 任务书蓝本；其「P3 计时口径先裁决……实现前定案」即本文完成的动作。
- **顾问（CC-VIS-ADV-73）**：§2.3「主路线 = G3 本拍裁决解锁 X5 并行收 V5 账」、§3 表 ⑤（文件域 + 串并行 + 触发条件）、§5 A2「G3 书面裁决……~78 主路线的唯一前置」——三处逐条兑现，本文即 A2 动作项的交付物。

## 2. X5 授权范围（转单即用）

### 2.1 文件域（白名单 / 禁碰 / 边界）

**白名单**（顾问 §3 表 ⑤ 原文展开，路径已对 main 树核实）：

| 域 | 文件 | 用途 |
|----|------|------|
| 相机/运镜 | `src/lab/world/view/View.ts` · `src/lab/world/view/CameraShots.ts` · `src/data/camera-shots.json` | 入场 flyby 样条运镜与收束——**入场运镜属 X5 本体，不算 X14 预支** |
| 装配段 | `src/lab/world/index.ts` | 入场态接线；× PERF O1/O4 同段——两者已合 main（B1 `52fafca`、C0 #66），X5 rebase 即含，无在途冲突 |
| skip/覆盖层 | Reveal 现有 DOM 覆盖层合并管理（BR X5 风险条原文） | Skip 钮 + 运镜期 HUD 隐藏/浮现层级 |
| e2e/观测 | skip 与 reduced-motion 双路径用例 + CITY-PERF-01 加法修订（§3.1）+ OBS spec 事件白名单同步（如 entrance-skip 拟名） | 本批零新增循环动画席位（编舞属一次性瞬态，R3 免配额） |

**禁碰**：`Rendering.ts` / `NeonMaterials.ts` / `Sky.ts`（X4/X7 域）· 城市几何/招牌/立面域（X1b/X2/X3 域）· `Quality.ts` · poster（`public/posters/` zero-diff）· bloom threshold=1/strength · 相机既有注册值语义（`?shot=` 零漂移合同）。

**X14 边界**：镜头语言扩展整体留设计确认 W4 ⑦ 原位，本授权仅入场编舞成套；若实现中发现必须动 X14 域（超出 flyby 必需），停批回报，不静默扩 scope。

### 2.2 串并行（本授权核心排程）

- **并行开工点 = 本备忘 push 在案**。与 W3 X4/X7 文件域正交（X4 触 `Rendering.ts`/`NeonMaterials.ts`，X7 触 `Sky.ts` ± `CitySilhouette.ts`，X5 触 view/装配段）；与 W2 X1b/X2 亦正交——**不等 W2/W3 合流即可开工**。
- **串行合流点 = X7 合流 + 其基线重签完成之后**，rebase 后取证再合。三条理由：
  1. **取证一次到位**：X4 全帧重置 + X7 天空重校都改帧——X5 的触帧取证（编舞全程帧序列 + 入场末帧 = V1 definitive shot 预演位）必须在定案 TM + 天空 v2 上拍，先合则 X4/X7 各白拍一轮；
  2. **基线重签窗口管理**：X4 全量重签、X7 重签在前，X5 插中间徒增一轮重签与逐张审阅成本；
  3. **装配段串行不变式**（设计确认 §6「装配段（X5 × O1/O4）」）：O1/O4 已合，X5 后合 rebase 即收敛；X5 开工至合流期间 PERF 轨**禁派触装配段/`Game.ts` 的实现批**（B2/B3 恒后置，§3.3-3）。
- **与 PERF 首分窗口互斥**：指挥官真机六腿冻结窗内 X5 禁止合流（R2 §3.2 纪律，优先级 §3.4-1）。

### 2.3 硬门、取证与水位口径

- **硬门自查**：R6 reduced-motion 直出 robot_idle 不留死路；R7 变形四拍 1.0–1.2s 墙钟与 G5 出口体系不破；R3 零新增循环席位（3/3 满席不变）；VIS-03 拍点后移至编舞结束后（settled 帧合同不变，poster 零涉及）——settled 帧预期恒等，若像素漂移按显式重签程序逐张审阅；`ritual_idle` 注册值逐值恒等照常。
- **风险预检**：flyby 样条点 NDC 探针 + 包围盒穿模预检（BR 风险条原文）。
- **取证**：编舞全程帧序列 + skip/reduced-motion 双路径 e2e + funnel 计时前后对照（BR 原文三件）；取证前核对 preview 实际端口 + 页面 chunk hash ∈ 本轮 `dist/_astro/`（#94 §2 先例条款，硬前置）；合流硬门 = 全量 e2e 绿 + exact-port LHCI。
- **水位口径**：合流前 AL 复评 V5 净增益归因——**V5 74→76~77 + V1 +0~1（下沿累加口径，raw +0.30→+0.65，顾问 §2.3 算术）**；CC-AL-VIS-L8-W3 复评以「W3（含 X5 若已合）全合」为触发，X5 收进该窗口即 ~78 上沿可达；诚实落点 76±1 不变，若落 76–77 差额由 W4 首批 X17 确定性补齐，禁预支。

## 3. 与 PERF O3 / CITY-PERF-01 联合修订（措辞层，零业务代码）

### 3.1 CITY-PERF-01 修订清单（随 X5 实现批同 PR 提请；全部为「加法采集 + 注记」）

| # | 位置 | 现文 | 修订措辞 |
|---|------|------|----------|
| 1 | test-plan §2.1 步 1 | 自动挂载 → `ready`（210s）→ `robot_idle`（120s）；`loadToRobotIdleMs` 采集不判定 | 注记：X5 合流后默认路径含入场编舞；`loadToRobotIdleMs` 语义不变但**含编舞时长**；增采 `timing.loadToSkippableMs`（skip 可用时刻，**采集不判定**）——腿 6 判定终点的机读同源锚 |
| 2 | test-plan §2.2 H1 | `ready → robot_idle → car_ready → driving` 依序 | 若 X5 新增入场态，状态序注记扩为 `ready → [入场态] → robot_idle`；CI 等待策略（自然收束——robot_idle 120s 超时对 2.5–3.5s 编舞余量充足——或走 skip 路径）由 X5 批冻结其一写入 spec，禁两可 |
| 3 | test-plan §2.5 schema | `funnel: robotIdle/carReady/driveStart` | dump/funnel 增 `entranceSkippable` 时间戳位（命名随实现批冻结）——真机腿 6 与 CI 证据同源引用（S4 同源纪律的 P3 延伸） |
| 4 | CI 判定禁令 | CI 禁任何 ≤8s 时长判定 | **不动**——本清单新增字段全部「采集不判定」，判定恒归真机腿 6 |

### 3.2 perf rubric / human-gate 注记（升版程序，非本文直改）

- 落点两处：rubric §4.1 行 6（Fast 4G 计时腿）+ human-gate §5.4 行 6（回填正本）——终点注记 = 「skip 即达」（默认路径终点 = skip 可用时刻，护栏 A/B 引本文 §1.1；reduced-motion 路径终点 = robot_idle 不变）。
- 性质判定：判定腿被测语义细化 = **改秤动作**（R2 §2.1 P5 注记先例同构）→ 按 rubric §7 升版程序执行；建议与已排定的 P5 v1.1 复核**合并一次升版**（P5 被测面 + P3 计时终点双注记，一次版本 +1，human-gate 表同 PR 同步）。
- 时序：v1.1 升版恒在 perf 首分登记之后（R2 既定「登记后批次」）；**例外**——若 X5 先于首分真机窗口合流，P3 注记须提前随 X5 批落地（§1.2 条件 2 硬约束），P5 注记仍可留 v1.1 正批。

### 3.3 O3（PERF B3，R2 §1 一手核验**未合**）联动措辞三条（写入 B3 任务书）

1. **预取窗合并**：O3 预取起点措辞从「robot_idle 静置窗后台预取」修订为「**入场编舞开始即后台预取**（编舞窗 + 静置窗合并为预取窗）」——编舞期 HeroRobot 已就绪、带宽空闲，纯增益零代价；护栏 B 约束随之写入（车资产预取不得阻塞 skip 收束，car_ready 前「CTA disabled + 进度」语义照旧，R4 变形墙钟从资源就位后起算不变）。
2. **对账字段编舞无关化**：O3 的 P3 收益前后对照（测试方案 §4「每优化 PR 附前后 evidence」约束）改以 `loadToSkippableMs` 或同口径编舞无关计时点对账——防 X5 的 +2.5~3.5s 编舞时长淹没 O3 的 -2~3s 收益造成归因污染；O3 与 X5 相邻合流须分批归因，禁同批。
3. **同文件跨轨串行**：B3 触 `Game.ts` init（PERF-BR §6 拓扑「`Game.ts` init 被 O2/O3 触碰」），X5 触装配段——B3 恒后置于 perf 首分登记（R2 §6 非本拍项裁定不变）**且开工时 rebase X5 合流后 tip**；X5 在途期间 PERF 轨不派触装配段/`Game.ts` 实现批。

### 3.4 冲突优先级（从高到低，逐条可执行）

| 优先级 | 规则 | 依据 |
|:---:|------|------|
| 1 | **PERF 首分临界路径最高**：指挥官真机六腿冻结窗内 X5 禁止合流（视觉轨改 world 负载即改被测面，冻结一并生效）；首分若先于 X5 合流，按 rubric v1.0 现文登记，本裁决零追溯 | R2 §3.2 六腿同版本纪律 |
| 2 | **秤正本恒先**：X5 合流前腿 6 按 rubric v1.0 现文（终点 robot_idle）；X5 合流后按本口径**且注记须先行或同 PR 在档**——禁止出现「X5 已合而腿 6 仍含编舞计时」的执行窗口，出现则该腿读数无效重跑 | rubric §7 + §1.2 条件 2 |
| 3 | **修订权属**：CITY-PERF-01/02 正本归 PERF 轨（PERF-DES 冻结）——X5 批对其修订限「加法采集 + 注记」（§3.1 四条），判定语义变更禁入；秤面（rubric/human-gate）变更只走 §3.2 升版程序 | test-plan 正本纪律 |
| 4 | **同文件跨轨串行**：装配段/`Game.ts`（X5 × B2/B3）恒串行——视觉轨本批先行、PERF B 系列后置 rebase；`Rendering.ts`/`Quality.ts`/`NeonMaterials.ts` 冻结窗（X4 取证期）与本批无交集但同表适用 | 设计确认 §6 不变式 |

## 4. 父代理转单触发条件（一句）

**本备忘 push 在案（G3 书面裁决生效）即触发——父代理可即刻转发 CC-VIS-X5-ENTRANCE（claude-fable-5-thinking-xhigh，独立 worktree，与 X4/X7 并行开工；合流恒排 X7 合流 + 其基线重签完成之后），任务书要点 = 本文 §2 全文 + §3.1 随批修订清单 + BR X5 §4 方案原文。**

## 5. 不变式重申

- PR [#43](https://github.com/rayw-lab/website/pull/43) BL2 NO-GO **禁止合流**；X1a 后继路径已走完，#43 维持关闭。
- poster：除 X6 外全批 `public/posters/` blob/tree zero-diff + `ritual_idle` 注册值逐值恒等；poster 重拍恒归 X6（W6），X4 起的失效窗口看板单行登记，禁提前重拍。
- 视觉 rubric v1.1 秤不动、`availableWeight=1`；性能 rubric v1.0 恒为正本（升 v1.1 走 §7 程序，本文 §3.2 建议合并升版）；评分恒归独立审计、帧优先、反通胀（下沿累加、禁预支、|Δ|≥10 必写差异说明）。
- 循环动画 3/3 满席不变——X5 编舞属一次性瞬态零席位；扩席裁决（G2）属 W5 窗口，不提前。
- M6 尾段（X16 spike + P2 红线重谈）不触发（G6 三联条件未齐）。

## 6. 引用

**站内**：`cyber-city-visual-l8-design-confirm.md`（⑦ / §5 G3 / D5 / §6 不变式）· `cyber-city-visual-l8-optimization-features.md`（BR X5 §4 / R1 R3 R6 R7 / §6 拓扑）· `cyber-city-vis-73-next-advisor.md`（`origin/cursor/cc-vis-adv-73-1d6f` @ `1573ad1`：§2.3 / §3 表 ⑤ / §5 A2）· `cyber-city-perf-optimization-features.md`（O3 / §6 拓扑）· `docs/spec/cyber-city-perf-test-plan.md`（§2.1 七步 / §2.2 H1 / §2.5 schema）· `docs/spec/cyber-city-perf-rubric.md` v1.0（§4.1 行 6 / S4 / §7 升版）· `docs/spec/human-gate-checklist.md` §5.4 行 6 · `cyber-city-perf-first-score-advisor-r2.md`（PR [#88](https://github.com/rayw-lab/website/pull/88)：§1 B3 未合 / §2.1 改秤先例 / §3.2 冻结纪律 / §6 非本拍项）· `loop8-vis-w1-audit.md`（#94 §2 取证串台先例条款）。

**main 实核**（base `771b1e4`）：B1 `52fafca`（O1 装配段已合）· PERF-C0/PR-A [#66](https://github.com/rayw-lab/website/pull/66)（O4/CITY-PERF-01 在岗）· 73 登记 `771b1e4`（[#94](https://github.com/rayw-lab/website/pull/94)）· X5 文件域路径对 main 树核实（`src/lab/world/view/View.ts` / `CameraShots.ts` / `src/data/camera-shots.json` / `src/lab/world/index.ts` 均在档）。

---

*CC-VIS-G3-X5-GATE · 2026-08-27 — G3 书面裁决：「skip 即达」口径成立（终点 = skip 可用时刻 + 护栏 A 立即收束 / 护栏 B 诚实计时；门值/权重/判定权威零改动），本备忘 push 在案即销 G3、解锁 CC-VIS-X5-ENTRANCE 与 X4/X7 并行开工、串行合流恒排 X7 后——V5 74→76~77 收进 W3 复评窗口，~78 上沿可达、诚实落点 76±1 不变。联合修订三落点：CITY-PERF-01 加法采集随 X5 批、rubric/human-gate 腿 6 注记并入 v1.1 一次升版、O3(B3) 任务书承接联动三条；冲突优先级以 PERF 首分真机冻结窗为最高。doc-only 零实现改动；#43 禁合流、poster 纪律、评分归独立审计不变。*
