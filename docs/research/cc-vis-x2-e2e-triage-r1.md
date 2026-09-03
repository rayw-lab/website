# CC-VIS-X2 e2e 失败归因报告 r1（CC-VIS-X2-TRIAGE-WRAP）

- **对象**：#104 分支 `cursor/cc-vis-x2-facade-r2-1d6f` @ `c24c7f3` 的 X2 全量 e2e（SIGINT 中断，retries=0）
- **证据现场**：`/tmp/x2-wt/test-results/`（trace/error-context/截图/session-dump 逐一取证）+
  `/tmp/main-wt/test-results/`（merge-base `88097f9` 对照跑）+ `playwright.config.ts` 配置审读
- **结论速览**：#32 = **真回归**（R2 桥腿碰撞体截断已核对动线，确定性几何冲突）；
  #33 / #35 = **挤兑 flake**（`world-chromium` project 漏配 `fullyParallel:false`，双 3D 上下文并发挤兑）。
  另有 3 条**潜伏雷**（EXP-02 / OBS-01 / PERF-Q2 动线正穿桥腿箱体，本轮 SIGINT 前未排到）已一并拆除。

## 1. 运行时间线重建（产物 mtime + trace 取证）

| 时刻 (UTC 08-28) | 事件 |
|---|---|
| ~03:30–03:57 | worker A：CITY-EXP-01 挂载→驾驶，03:57 **FAIL**（泊车位不可达，实测 x=19.4 z=-32.7，17km/h 仍在动） |
| 03:44–03:47 | worker B：CITY-QST-01 深链步进（零驾驶腿）**PASS**（session-dump-quest.json 10 事件） |
| 03:47–04:10:55 | worker B：CITY-QST-02，1,200s idle-nudge 轮询整窗耗尽 **FAIL**（trace 跨度 1,384.8s 完整走完，非截断） |
| ~03:57–04:12:19 | worker A：CITY-FB-01…09，~740s 已达测速区并截图（feedback-speedtrap.png 04:09），最后 ~135s 在轮询 `world-speedtrap` 埋点时被 900s 总超时截断 **FAIL** |
| 04:12–04:13 | HINT-01（`Test ended`）/ HINT-02（`session closed`）——**SIGINT 中断残影**，非真实失败 |
| 04:13:05 | 复跑尝试即刻被 SIGINT：e2e-results.json 被覆盖为 80 skipped / duration 348ms |
| 04:14–04:26 | `/tmp/main-wt`（main @ 88097f9，无 R2 改动）对照跑 EXP-01：**同样 FAIL**，但签名不同——车 ~500s 仅挪 1.4m（x=25.2 z=-25.7，纯爬行） |

**关键事实**：EXP-01（03:47–03:57 driveTo 窗）、QST-02（03:47–04:10）、FB 链（03:57–04:12）互相**全程并发**。
`playwright.config.ts` 根配置 `fullyParallel: true` + `workers: 2`，而 `world-chromium` project 注释宣称
「独占机器执行」却**漏配 `fullyParallel: false`**（car-chromium / city-perf / visual 三个 project 均已显式配置）——
跨文件/跨 describe 的重 3D 用例被派往两个 worker 并发，SwiftShader wall-fps 减半。

## 2. 逐用例判定

### #32 CITY-EXP-01「泊车位 (-28,-28) 应可达（实测 x=19.4 z=-32.7）」——真回归

- R2 `ForegroundFraming.ts` 新增桥腿碰撞体：fixed cuboid 半长宽高 [0.62, 6.7, 0.62]，世界位 **(±15.7, −26)**。
- EXP-01 动线 = 倒车端 (24.5,−24.5) → agent-nexus 泊位 (−28,−28) 直线，在 x=16.32（右腿箱东缘）处
  z=−25.05，距箱体北缘 −25.38 仅 **0.29m < 车半宽 0.9m**（底盘 cuboid [1.3,0.4,0.85] + 推土铲 [1.5,0.5,0.9]）——**确定性剐蹭**。
- 失败签名吻合：车终点 (19.4,−32.7) 在右腿东南侧、失败时 17km/h 仍在机动——撞腿→bang-bang 自救→向南偏折循环，
  600s 内始终未越过 x=15.7。
- 同一失败里的第二处撞点：去重驶出点 `(target.x+14, target.z+2)` = **(−14,−26)**，距左腿中心仅 1.7m（正对撞柱）。
- ForegroundFraming 头注的「站位避让核对」只核了静态站位（灯杆/广告板/泊位圆），**未核 e2e 驾驶动线**——审计盲区。
- main 对照跑虽也挂，但那是 04:14 起、与其他负载并发的纯爬行签名（500s 挪 1.4m），不构成对几何归因的反证；
  几何冲突是解析可证的（线段-箱体距离 < 车半宽）。

### 潜伏雷（本轮未排到执行，下一轮全量必炸）

| 用例 | 动线 | 冲突 |
|---|---|---|
| CITY-EXP-02 | (0,−24)→(−28,−28) | x=−15.7 处 z=−26.24，**正穿左腿箱体**（z∈[−26.62,−25.38]） |
| CITY-OBS-01 | (0,−24)→(28,−28) | x=15.7 处 z=−26.24，**正穿右腿箱体** |
| CITY-PERF-02 (Q2) | (0,−24)→(28,−28) | 同 OBS-01（city-perf project 殿后，本轮未开跑） |

### #33 CITY-QST-02「idle-nudge 未触发」——挤兑 flake（非代码回归）【r2 修正：见下方勘误】

- 机制：`idle-30s` 用 `game.ticker.delta`（设计秒，`maxDelta=1/30` 封顶）累计 → 30 设计秒 = **≥900 渲染帧**；
  1,200s 轮询窗要求持续 **≥0.75 wall-fps**。
- 本轮 QST-02 全程与 EXP-01 driveTo、FB 链并发（时间线 §1），双/三 3D 上下文挤兑下 wall-fps 跌破阈值，
  20 分钟窗积不满 30 设计秒。trace 显示轮询完整走满（1,384.8s 跨度），无中断、无 idleClock 重置类逻辑异常。
- R2 diff 零涉及 idle/quest 逻辑（改动仅 city 视觉层 + 碰撞体）；渲染负载增量（≤11 个 InstancedMesh draw call + 80KB GLB）
  是次要放大项，主因是并发挤兑。

> **[r2 勘误——归因升级，证据见 §7]** 串行化（workers=1）后 QST-02 **solo 复跑仍失败**（05:03–05:25，
> 22.2m，零挤兑），挤兑不是充分归因。A/B 探针实测本 VM Q0 driving 态 rAF：main `88097f9` =
> **0.778 fps**（30 设计秒 = 1,154s 墙钟，1,200s 预算余量仅 **46s**——本来就是掷硬币）、X2 系构建 =
> **0.699 fps**（= 1,288s，**必超线 88s**）。真实结构：**预算贴地（main 遗留）+ R2 ~11% 慢化压线
> （最后一根稻草）+ 挤兑加重（当轮 0.4 fps）** 三层叠加。修复 = 预算按实测重标定（d4bcf66，
> 轮询 1,200s→1,800s；预算是上限非定长等待，健康环境事件到即返回零成本）。

### #35 CITY-FB-01…09「反馈链 900s 超时」——挤兑 flake（非代码回归）

- 链条功能性完整：boost/brake/jump/toast/flip/speedtrap 六张截图全部落盘，~740s 已深入测速区（x>45）；
  失败点是最后的 `world-speedtrap` 埋点轮询（240s 预算只剩 ~160s 时被 900s 总超时收割）。
- FB-09 路线 (30,−6)→x≈101 沿东西大街，与全部 R2 新碰撞体（桥腿 z=−26、道具簇 (±19.5,±19.5)/(124,25)/(−124,−25)）零交集。
- 同为并发挤兑受害者：FB 链与 QST-02 全程并行。

### HINT-01 / HINT-02——SIGINT 残影，无需处理

`Test ended` / `Protocol error… session closed`（04:13 中断时刻），非真实失败。

## 3. 最小修复方案（栈① base=c24c7f3，单 PR，本报告随同一分支交付）

**判定原则**：桥体 = 设计确认 D7 前景景框（视觉北极星交付物），且 ritual_idle poster 恒等门在 c24c7f3
已含桥入帧——**动世界几何 = 强制 poster 重拍 + VIS-01/02 重签连锁**，非最小修复。仓库先例
（OBS-01「避开路口隔离墩」走位、EXP-01 倒车脱困）确立：**几何变更 → 测试动线途径点随迁**。

| # | 文件 | 改动 | 修什么 |
|---|---|---|---|
| 1 | `playwright.config.ts` | `world-chromium` 补 `fullyParallel: false` | #33/#35 根因：恢复该 project 注释宣称的 3D 独占纪律 |
| 2 | `e2e/cyber-city-explore.spec.ts` | EXP-01 改三腿绕行 A(19,−33)→B(−19,−30)→泊位；去重驶出点改 (−28,−42)；setTimeout 2.4M→2.7M | #32 双撞点 |
| 3 | 同上 | EXP-02 插入途径点 (−19,−31.5)，腿预算 480/360/360 | 潜伏雷① |
| 4 | `e2e/cyber-city-observability.spec.ts` | OBS-01 插入途径点 (19,−31.5)；setTimeout 1.5M→1.8M | 潜伏雷② |
| 5 | `e2e/cyber-city-perf.spec.ts` | PERF-Q2 插入途径点 (19,−31.5)；setTimeout 1.2M→1.5M | 潜伏雷③ |
| 6 | `src/lab/world/city/ForegroundFraming.ts` | 注释补「摆位避让必须核 e2e 动线」教训（零代码改动） | 防复发 |

**绕行带几何复核**（车最坏对角半径 1.75m 口径）：桥腿箱南缘 z=−26.62 与西侧灯杆 (−13.5,−34) 之间
3.5m 槽带走 z≈−30；东侧最近灯杆在 z=−58 无约束；楼排 z≤−34、街角道具簇 (±19.5,±19.5)、隔离墩阵
全程边距 ≥1.15m（最劣停车圆位形），典型 ≥1.6m。

**不动的部分**：桥体/腿柱碰撞体、poster、视觉基线全部零改动——poster 恒等门与 VIS 基线在本批不受扰动。
QST-02 / FB 链预算亦不放宽（串行化后按本轮 trace 折算墙钟约 ~750s / ~650s，均在既有预算内）。
【r2 勘误：该折算高估了 solo fps——QST-02 solo 实测仍 0.5–0.7 fps，预算已按探针实测重标定
（d4bcf66，§2-#33 勘误）；FB 预算维持原判（solo 10.2m 实测通过，§6）。】

## 4. 还原登记

T8 通杀改写的 e2e-batch1 截图 14 张（`docs/spec/assets/e2e-batch1/*.png`，未提交的工作树 M 状态）已
`git checkout --` 还原（/workspace 与 /tmp/x2-wt 两处工作树均已清理），分支零截图污染。

## 5. 验证与放行条件

- 本 Task 内**仅复跑三条锁死失败用例**（EXP-01 / QST-02 / FB-01…09，`--project=world-chromium --no-deps -g` 过滤），
  结果见 §6 验证附录。
- **#104 禁止 ready**：直至修复后下一轮全量 e2e 0 failed / 0 skipped / 0 flaky（80 用例现口径）全绿。
  下一轮注意：`world-chromium` 串行化后全量墙钟将显著拉长（长用例不再并发摊薄），排期按 ≥2 轮预算。
- 遗留登记：`docs/research/cyber-city-test-framework.md` 的「52 例 / ~18.5 min」口径已过时（现 80 例 +
  长驾驶用例 + 本批串行化），下一轮全量实测后回填。

## 6. 验证附录（复跑结果，r2 回填）

串行验证轮（04:51–05:35，workers=1，`-g "CITY-EXP-01|CITY-QST-02|CITY-FB-01"`，旧桥位 dist@4599）：

| 用例 | 结果 | 判读 |
|---|---|---|
| CITY-FB-01 | **✅ PASS（10.2m，预算 15m）** | #35 挤兑 flake 归因**坐实**——solo 下六段交互全链一次通过，预算无需改动 |
| CITY-QST-02 | ❌ FAIL（22.2m） | solo 仍挂 → 触发 §7 A/B 探针，归因升级为「预算贴地 + R2 慢化压线」（§2-#33 勘误），修复 d4bcf66 |
| CITY-EXP-01 | ❌ FAIL（11.9m） | 该轮仍跑轮 1 路线（839b6fe 提交于 QST-02 进行中），撞点 x=19.5 反证充电桩排归因；轮 2 大道路线另行复跑 |

EXP-01 轮 2 路线复跑（05:38 起）：进行 15 分钟后浏览器被**外部 SIGKILL**（`Channel closed`，
非断言失败，§7-3 环境风险）；再次复跑（06:25 起，EXP-01+QST-02 双用例，python 静态服务 4507）
结果见后续提交回填。

## 7. r2 轮补充：A/B 探针、分支并发与环境风险

### 7-1. FPS A/B 探针（QST-02 归因定谳）

方法：`/tmp/fps-probe.mjs`——playwright chromium（与 e2e 同 SwiftShader 参数、RM reduce、1440×900），
挂载 → 变形 → driving 后 rAF 计帧 + `ticker.elapsedScaled` 设计秒累积率，solo 无挤兑窗口实测：

| 构建 | Q0 driving rAF fps | 设计秒累积率 | 30 设计秒所需墙钟 | vs 原 1,200s 轮询预算 |
|---|---|---|---|---|
| main `88097f9`（X1b 含三 hero 实模） | **0.778** | 0.0260 s/s | **1,154s** | 余量 46s（3.8%，掷硬币） |
| X2 系构建（c24c7f3 几何，4507） | **0.699** | 0.0233 s/s | **1,288s** | **超线 88s（必挂）** |

推论：R2 慢化 ~11%（0.078 fps）非主因；主因是「30 设计秒 ⇔ 1,200s 预算」这对参数在本 VM
（4 核共享、SwiftShader 软渲染）本来就贴地。QST-02 事件读数互证：原 X2 全量跑 quality-auto-drop
avg=0.4（挤兑），solo 复跑 avg=0.5–0.6，探针 0.70——三源一致。另证 Q0→Q2 自动降档在 0.5 fps 下
救不回来（滞回 3 设计秒 ≈ 180s 墙钟起步 + 20 设计秒冷却 ≈ 1,200s 墙钟，solo 轮实测两次降档
跨 18 分钟、降至 Q2 后 fps 仍 0.5）。

### 7-2. 分支并发登记（时序）

本分支在 r1 四提交（8e441ef/8507aa3/368b4d4/839b6fe）之后、r2 验证期间，被 **CC-VIS-X2-PLUG**
（独立 Task）叠了世界侧修复 `2c1d4ab`（桥位 z −26→−19.5 + 东北簇内退 (17.8,−17.8)）+ 报告
`e03271f`。互证关系：其修复以本报告归因为输入（充电桩排 = 主障、桥腿 = 收窄因素），其探针 §④
审计表覆盖本轮全部改线腿（最小净距 ≥3.62m 全 PASS）；本地重复的 ForegroundFraming 注释修订
已弃（其版本更完整）。**本轮 r2 验证跑在旧桥位 dist 上执行**——对改线腿而言旧几何是更严苛
位形（东北簇原位 PropBin (20.8,−20.8) 距南下车道仅 ~3.3m），旧位形通过 ⇒ 新位形只更宽裕。

### 7-3. 环境风险登记（ENV 专项输入）

- **外部进程清杀**：05:53 起本 VM 反复出现 chrome/node 被 SIGTERM/SIGKILL（EXP-01 轮 2 复跑
  15 分钟被杀、astro preview 4610 exit 143、探针 node 两次被杀）。系共享 VM 上其他 Task 的
  清场行为，**任何 >15 分钟的 e2e 窗口都可能被误伤**——全量验证轮必须独占窗口 + 收轮三证
  （plug 报告 §5 口径），且失败尸检先分辨「断言失败 vs Channel closed 外杀」。
- **VM 算力口径**：本 VM 4 核共享，Q0 driving 态 0.7–0.8 fps；历史「52 例 ~18.5 min」全量口径
  对应的环境算力显著高于本 VM（QST-02 solo 一条即 22m+）。全量排期与预算校准须以**当前 VM
  实测 fps** 为准，不能沿用历史墙钟。
