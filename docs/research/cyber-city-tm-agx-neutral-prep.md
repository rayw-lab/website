# X4 tone mapping 预备件：AgX vs Neutral 双案对比取证协议 + G1 解除 defer 检查清单（CC-VIS-TM-PREP）

| 项 | 内容 |
|----|------|
| Task | **CC-VIS-TM-PREP**（doc-only 预备件——不解除 G1、不派 X4、零 `src/`/e2e/基线/poster 改动；G1 到点时本件即取即用） |
| 分支 | `cursor/cc-vis-tm-prep-1d6f`（base `main@771b1e4`，独立 worktree） |
| 日期 | 2026-08-27 |
| 必读输入 | `cyber-city-rendering-gaps-consult.md` §1.1/§2/§4（CC-L6-TM 施工合同正本）· `cyber-city-visual-l8-design-confirm.md` D1/D2/D8 + §3 批⑤ + §5 G1（选型与时点裁定正本） |
| 复核输入 | RS `cyber-city-visual-l8-gap-survey.md` §2.3（AgX/Neutral 证据链）· BR `cyber-city-visual-l8-optimization-features.md` X4/X7/X17/R1/R2 · `cyber-city-perf-first-score-advisor-r2.md` §3.2（六腿冻结窗）· AL `loop8-vis-w1-audit.md`（73 登记 + 取证串台先例）· main 代码事实（`Rendering.ts`/`Quality.ts`/`NeonMaterials.ts`/PARAM_ALLOWLIST，§3 逐条注明） |
| 消费方 | 父代理：§5 为 G1 书面解除模板；§2–§4 直接转 X4 任务书三章（取证协议、文件域、串行点） |

---

## 0. 结论先行

1. **G1 前置三件套现状**（main@`771b1e4` 实核，§1）：W1 合流 ✅ 已销、PERF-C2 B1 合流 ✅ 已销、**W2 合流 ❌ 未销（唯一剩余前置）**——X1b（第三栋 hero）与 X2（立面套件批）均无分支无 PR。design-confirm 写「B1 在途 `ecf30a1`」已过时：B1 实合 main merge `7871bbb`（分支提交 `52fafca`），本件更新登记。
2. **选型按 D1**：AgX vs Neutral 同机位双案对比 → 单方案落地，ACES 出局。依赖零升级：仓内 three `^0.185.1` 实测含 `AgXToneMapping`（枚举 6，r160+ 内建）与 `NeutralToneMapping`（枚举 7，r165+ 内建）。
3. **取证机制 =「两 commit 法」**（§2.2）：同分支连续两 commit，唯一 diff = TM 枚举 + 各自配平 exposure；**禁止**为对比往壳 `PARAM_ALLOWLIST` 加参数或往生产码埋运行时开关。
4. **B1 合流后的新取证陷阱**（§4-2）：SwiftShader 低帧率会触发自动降档（avg<30 滞回 3 设计秒）+ toast 入镜——X4 **全部**取证帧（含 pre 对照帧）必须 `?quality=` 显式钉档，深链禁自动档恰为协议所需。
5. **文件域**（§3）：核心改动面一件（`Rendering.ts`）；台账重校候选面以 §3.2 清点计数为起点，**全城 emissive 逐件清点表为 X4 第一交付物**；禁碰面九类（§3.3）。
6. **串行点四条**（§4）：base ≥ `7871bbb`（现已自然满足）／取证钉档／TM×切档事件一致性合同／真机六腿冻结窗互斥。

## 1. 现状登记（G1 前置盘点，main@`771b1e4`）

| 前置（design-confirm §3 批⑤ + §5 G1） | 状态 | 证据 |
|---|---|---|
| W1 全合流（X1a + X3，各自 AL GO） | ✅ **已销** | X1a R4 `dea7c1e`（#92，concept-garage GLB + 鼓塔）；X3 `c0bb67a` + R4 机器验收面 CITY-SIGN-01…03 `dc3f56b`（#93）；AL-VIS-L8-W1-R3 **GO**，生产登记 71→**73**（raw 72.60），X1a V4 专项门判 **74**，D10 潜分收账 V5=74（#94） |
| W2 全合流（X1b + X2，各自 AL GO） | ❌ **未销** | X1b（`cursor/cc-vis-x1b-hero3-*`）、X2（`cursor/cc-vis-x2-facade-kit-*`，显式基线重签批）均未开工：远端无分支、无 PR。**这是 G1 唯一剩余前置** |
| PERF-C2 B1 合流（`Quality.ts` 域串行） | ✅ **已销** | main merge `7871bbb`（分支 `52fafca`）：`Quality.ts`/`index.ts`/`SessionTimeline.ts`/`DriveFeedback.ts`/OBS §3.4；`?quality=` 显式深链禁自动档（v1.0 口径） |
| 材质集合稳定（D2 依据） | ⏳ 随 W2 | X2 立面套件引入新材质是 D2「晚开少返工」的原因本体；W2 合流后至 X4 取证前不得再插入改发光面/材质的批次 |

X4 主受益维现值：**V2=75、V3=70**（W1-R3 终稿）；BR 水位预期 M2（X4+X7 全合）≈ **78**。X4 在批序表为 **W3 批⑤**，分支模板 `cursor/cc-vis-x4-tone-mapping-*`；X7 天空大气紧后（批⑥，天空是 TM 第一重校对象）；X17 MRT 选择性 bloom 序更后且**不与 X4 同 PR**。

## 2. 双案对比取证协议（D1 执行细则）

### 2.1 候选矩阵与出局项

| 候选 | 枚举（three r185 实测） | 优势（RS §2.3） | 风险预登记 |
|---|---|---|---|
| **AgX** | `THREE.AgXToneMapping` = 6 | 高光滚降平滑、色相偏移小、保饱和；夜景霓虹首选候选 | 中灰响应偏暗，exposure 不配平会把「白爆」换成「暗部糊死」（consult 风险 3） |
| **Khronos PBR Neutral** | `THREE.NeutralToneMapping` = 7 | 色彩保真优先、几乎不偏色；品牌青 `#49c5b6` 逐帧一致性最好 | 高光肩部弱于 AgX，强 emissive（信标 3、招牌 ≥2）截断改善可能不足 |
| ~~ACES~~ | 出局（D1 裁定） | — | 霓虹饱和度压损，不再作为参照系；`car-configurator/engine.ts` 的 ACES 不迁移、不作先例 |

### 2.2 取证机制：两 commit 法

1. X4 实现分支上按序落 **commit-A（AgX + 配平 exposure）→ commit-B（切 Neutral + 配平 exposure）→ commit-C（定案：切回胜者，随后进入台账重校）**；每个对比 commit 唯一渲染 diff = TM 枚举 + exposure，两次构建分别取证。历史保留双案痕迹，终树只有一案——满足 consult「只做一种 tone mapping 方案」的单方案落地合同。
2. **禁止**：往 `src/pages/*` 的 `PARAM_ALLOWLIST` 加 `tm=` 之类取证参数（M4 壳白名单纪律，现有 `gl/quality/poi/shot` 已够用）；往生产码埋 TM 切换开关或档位分支（选型期）。`#debug` 句柄运行时热切只许本地辅助观察，**不作取证正本**（TM 变更涉及输出管线重编译，热切态不可信）。
3. 取证前置核对（W1-R3 §2 串台先例条款，硬前置）：核对 preview 日志**实际端口** + 页面 chunk hash ∈ 本轮 `dist/_astro/`；对比帧成对核对构建身份，防 A/B 帧来自不同构建。
4. 对比包入库 `docs/research/assets/visual-rubric/`，命名 `tm-<agx|neutral>-<机位>-q<档>-<gl|webgpu>.webp`，随附对照表登记各帧 exposure 值与取证参数。

### 2.3 机位集 × 档位 × 后端矩阵

机位六件（全部「四同」：player/camera/FOV/viewport 同参，settled 后截帧；首幕帧沿 W1-R3 F1 口径 `visibilitychange(hidden)` 暂停渲染再截，1440×900）：

| # | 机位 | 深链 | 主判定 |
|---|---|---|---|
| M-A | robot_idle 首幕 | `/?quality=<q>`（无 `shot`，与 poster/VIS-03 合同同帧位） | 全局观感 + 机器人橙 emissive + 招牌中景 |
| M-B | work-gallery settled 整帧 | `/?poi=work-gallery&quality=<q>`（F2 同参） | 鼓塔光带 + 湿地面反射蓝圈/光柱肩部 |
| M-C | concept-garage showcase | `/?poi=concept-garage&shot=poi_showcase-concept-garage&quality=<q>` | hero GLB KTX2/PBR 展厅玻璃高光、AL-CAM 在案机位 |
| M-D | 招牌特写 | X3 取证同参机位 | **霓虹饱和度主判定帧**：三族窗色 + 招牌族 + 品牌青 `#49c5b6` 色相漂移 |
| M-E | CTA 变形窗中段 | 默认入城 CTA，变形帧序列（3–5 帧） | 光幕/充能喷发白爆 → 肩部滚降 |
| M-F | 天空/地平线 | 驾驶至城缘回望机位（登记具体坐标为 X4 实现批义务） | 渐变穹顶 banding、光污染分层、暗巷暗部不糊死 |

矩阵与裁剪：**云端集** = 2 案 ×（六机位 × Q0 + M-A/M-B/M-D × Q1 + M-A/M-B/M-D × Q2）= 24 帧，全部 SwiftShader（即 WebGL 2 回退后端，与 `?gl=1` 同义——本 VM Chromium 无 WebGPU）。**WebGPU 帧**为真机/指挥官本地腿：至少 M-A/M-D × 双案 × Q0；云端产不出的读数**留空登记不伪造**（豁免留痕先例）。Q2 帧承担「直出路径与管线路径 TM 一致性」判定（§3.1-③）。

### 2.4 exposure 配平纪律（反选型偏置）

- 两案**各自**配平 `toneMappingExposure`：以 M-A 帧路面中间调（Grid 阈下件，线性 ≤0.9 段）直方图中位数为锚，两案中位差 ≤±5% 才算可比帧；配平值逐帧登记。
- 禁止「一案默认 1.0、另一案精调」的不对称对比；禁止用 exposure 掩盖某案高光肩部缺陷（J1 判定看肩部形态，不看绝对亮度）。
- 选型期**只动 exposure，不动任何 emissive 台账值**——台账重校（commit-C 之后）必须在定案曲线上做且只做一次，防「双案各校一遍」的返工（BR 原则②同逻辑）。

### 2.5 判定维度与定夺流程

| # | 判定维 | 看什么 |
|---|---|---|
| J1 | 高光滚降 | 招牌核心（≥2）/信标（3）/光幕：硬截断 → 平滑肩部，且无整体灰雾化 |
| J2 | 霓虹饱和度与色相 | 三族窗色 + 品牌青 `#49c5b6`：对照 `neon-tokens` 源值吸管采样，色相漂移小者胜 |
| J3 | 暗部可读性 | 暗巷/楼间/路面网格底纹不糊死（consult 风险 3 的另一半） |
| J4 | 白爆销账 | M-E 变形光幕/充能喷发的过曝面积收敛且不失能量感 |
| J5 | bloom 合成观感 | 阈上件起辉资格不变（threshold=1 在线性域分流，TM 作用于合成后端）、辉光色相不脏 |
| J6 | 全档/双路一致 | Q2 直出与 Q0/Q1 管线帧同族色调（允许 bloom 缺席差异，不允许色调分叉） |

流程：X4 实现批产出双案对比包 + J1–J6 逐项打点 + 自荐一案 → **父代理拍板**（PR 或看板书面登记，与 D1「双案对比取证 → 单方案落地」闭环）→ commit-C 定案后进入台账重校与基线重签 → **AL-X4 专项复评只审终案**（V2/V3 归因门），不复审选型过程。

## 3. 文件域

### 3.1 核心改动面（白名单第一件）

`src/lab/world/rendering/Rendering.ts`——现状实核：全文件未设 `toneMapping`（默认 `NoToneMapping`=0）；Q0/Q1 走 `RenderPipeline`，`outputNode = scenePassColor.add(bloom(scenePassColor, 0.55, 0, 1))`（`smoothWidth=1`，strength 档值 0.55/0.3）；Q2 整段旁路直连 `renderer.render()`；`?gl=1` 强制 WebGL 2。改动三义务：

- ① `renderer.toneMapping = <胜者>` + `toneMappingExposure` 一次性设置（**全档一致为首选方案**，见 §4-3）；
- ② 实证 RenderPipeline 自定义 `outputNode` 下 TM 的应用位置：r183+ 手册口径 TM/色彩空间在管线末端自动补（`renderOutput()` 可手动接管）——必须确认 TM 作用于 `scene+bloom` **合成之后**，bloom 阈值分流仍在线性域（consult 风险 2 的复核义务，J5 帧为证据）；
- ③ Q2 直出路径与 `?gl=1` 后端同枚举同 exposure 复核（四条路：Q0/Q1 管线、Q2 直出 × WebGPU/WebGL，J6 帧为证据）。

### 3.2 台账重校候选面（emissive 清点表 = X4 第一交付物）

以下为 grep 实测计数（emissive 相关命中，**候选清点起点、非终表**）；X4 开工首个动作是产出全城逐件清点表（件名/文件/当前线性强度/阈上下/双案观感/重校后强度/责任帧），凡强度改动逐件过秤：

| 面 | 文件 | 命中 | 注记 |
|---|---|---|---|
| 霓虹材质工厂（主台账） | `rendering/NeonMaterials.ts` | 19 | 全城唯一材质工厂 + 三档共享 uniform；亮屏窗 1.9×、窗格三族色 |
| 机器人 | `city/HeroRobot.ts` | 17 | 关节/眼部橙 emissive，M-A/M-E 责任件 |
| 道路光带 | `city/Roads.ts` | 8 | 双主轴霓虹，neon-tokens 消费方 |
| 路面网格 | `world/Grid.ts` | 7 | **阈下 ≤0.9 纪律件——优先只验不动**，是 J3/exposure 锚 |
| 街道道具 | `city/StreetProps.ts` | 2 | 路障扫描条纹等 |
| 楼宇/地图 | `city/CityBlocks.ts` · `city/CityMap.ts` | 1+1 | 亮窗 ≈1.3、大堂光带 |
| X3 新增发光面 | `city/BuildingSigns.ts` · `SignageAtlas.ts` · `SignageIgnition.ts` · `AdBoards.ts` | 经工厂 | X3 已承诺全阈上或阈下（R2 自查），本批复核不重排 |
| neon-tokens 消费方 | `StreetLamps.ts` · `FlightTrails.ts` · `player/TransformParticles.ts` · `world/Reveal.ts` | 经 tokens | 色相单源禁动，只允许强度系数过秤 |
| hero GLB 资产侧 | `city/HeroBlenderMesh.ts` + `public/models/`（ConceptGarage/AutodriveLab） | 资产 | emissive 通道重校**优先走材质端系数**；动 GLB 字节即触发 X1a §9 全链取证，成本极高，非必要不动 |
| 天空 | `city/Sky.ts` | — | **X7 主域**：本批只允许保底微调并在看板登记移交 X7（批⑥紧后重校） |

### 3.3 禁碰面

1. `core/Quality.ts` 与 `index.ts` 装配段自动降档节拍（B1 刚落，X4 不改档位状态机与滞回参数）；
2. `rendering/PreRenderer.ts`（O5 域，consult 裁决②仍 defer）；
3. bloom **架构**：threshold=1 语义、管线结构、MRT 迁移（X17 域）——strength/smoothWidth 的**数值**属 X4 台账重校面（BR R2：X4 是唯一重校窗口），架构不属；
4. `data/neon-tokens.ts` 色相值（A3 单源）：X4 只动强度系数；确需动色相即越界，另立裁决；
5. DOF/SSAO/LUT/新材质/新内容（consult §1.1 边界原文）；
6. poster 三件（`public/posters/`）与 `?shot=`/`ritual_idle` 注册值：X4 改帧 → poster **失效登记单行、不重拍**（D3 裁定重拍恒归 X6/G5；W1-R3 建议①「poster 重拍条件成熟」不改变 D3，X4 不得顺手重拍）；
7. OBS spec 事件白名单：TM 是静态输出变换，零新事件/零循环动画——实现中若发现需动 OBS 即越界信号；
8. e2e 用例分母、重试口径、阈值、reporter（consult §4.1 硬门原文）；
9. DOM/壳与 `PARAM_ALLOWLIST`（§2.2-2）。

### 3.4 取证与基线面

- `e2e/visual/__screenshots__/`：VIS-01 壳静态基线（reduced-motion 拦截态、零 world 字节）**预期零漂移**——若 X4 令其漂移即越界回归信号；世界帧基线如有变化走显式「基线重签」标记批逐张审阅（X4 本就是全量基线重签批）。
- `@smoke3d` 3/3、VIS-03 poster 帧合同、`tools/camera/audit-shot-ndc.mjs` 7/7（几何合同，TM 零影响预期）。
- 对比包与终案取证入 `docs/research/assets/visual-rubric/`（§2.2-4 命名）。

## 4. 与 PERF-C2 B1 串行点

1. **文件域串行已销，base 合同保留**：design-confirm §6「`Quality.ts` × B1 串行、B1 在途 `ecf30a1`」已过时——B1 实合 main `7871bbb`。X4 分支 base 必须 ≥ 该 SHA（从最新 main 切分支自然满足）；X4 不再触 `Quality.ts`（§3.3-1），文件域冲突消除。
2. **取证钉档协议（B1 合流后的新陷阱）**：B1 v1.0 口径 =「`?quality=` 显式深链禁用自动档、toast 不触发」。SwiftShader 帧率长期 <30，默认路径取证随时可能命中滞回窗（3 设计秒）被降档 + `DriveFeedback` toast 入镜——**X4 全部取证帧（含双案对比与 pre/post 对照的 pre 帧）一律 `?quality=0|1|2` 显式钉档**；W1-R3 F1 那类默认路径帧不再作为 X4 对照口径，复刻 M-A 时改用 `/?quality=0` 并在对照表注明口径差异。
3. **TM × 切档事件一致性合同**：首选「全档同一 TM 枚举 + 同一 exposure」（renderer 级一次设置，切档零 TM 迁移，B1 自动降档天然一致）。仅当台账证据要求分档差异时才允许档位分支，且必须挂 `quality.events`/`applyQuality` 路径，并加验收断言：`__worldSpikeGame.quality.changeLevel(n)` 热切后 TM 枚举/exposure 与同档冷启动逐值一致（防「深链冷启动正确、自动降档后错档」分叉）。
4. **真机六腿冻结窗互斥**：PERF 轨剩余两步 = 指挥官真机六腿 → AL-PERF；六腿窗口**冻结 main 合流且明文点名视觉 X 批**（perf advisor R2 §3.2 条 4：改 world 渲染负载即改性能被测面）。X4 合流必须落在窗口外；窗口外正常合流后，下一轮性能登记自然以新 tip 为 subject，无需重跑当轮。
5. **后续同文件串行登记（备查）**：`Rendering.ts` 未来共触件 O5（`cc-perf-c4-precompile-*`）/O6（`cc-perf-c7-bloom-tiers-*`）/O8（并入 `cc-perf-c5-pixel-budget-*`）均未派且各有实证门——X4 先行，三者让路；X17 序 X4 后独立批；X7 紧后。O6 若在 X4 后立项，其 Q1 bloom 降本对照帧须基于 X4 定案曲线重取。

## 5. 解除 defer 检查清单（G1 书面解除模板）

父代理解除 G1 时逐项勾验并在看板/PR 书面登记（design-confirm G1 要求书面解除）：

- [x] **W1 全合流 + AL GO**：X1a `dea7c1e`（V4 门 74）+ X3 `c0bb67a`/`dc3f56b`；生产登记 73（#94）。
- [x] **PERF-C2 B1 合流**：main `7871bbb`；X4 base ≥ 该 SHA。
- [ ] **W2 全合流 + AL GO**：X1b（第三栋 hero，独立 PR 独立归因）与 X2（立面套件 + 街角道具带 + 前景景框层，显式基线重签批）均合流且各自 AL 复评 GO。**当前唯一未销项。**
- [ ] **材质集合稳定申明**：W2 合流后至 X4 取证窗内，无其他改 world 发光面/材质的批次在途或插队（若有插批，X4 取证顺延至其合流后）。
- [ ] **施工合同签收**：consult §1.1 边界原文（单方案落地、exposure/emissive 台账联动重校、三档双后端同机位证据、不加 DOF/SSAO/LUT/新材质/新内容、不碰预热与 Ticker）+ D1 选型矩阵改 AgX vs Neutral（ACES 出局）+ 本件 §2–§4 三协议写入 X4 任务书。
- [ ] **排期互斥确认**：与指挥官真机六腿窗口不重叠（§4-4）；若六腿已排窗，X4 合流让位。
- [ ] **任务书就绪**：分支 `cursor/cc-vis-x4-tone-mapping-*`；标记「全量基线重签批」；AL-X4 专项复评合同（V2/V3 归因门 + 双评门 |Δ|≤5 + 同机位 settled pre/post 四同对照）；X7 紧后排队登记（批⑥）。
- [ ] **书面解除落笔**：看板 G1 行改「已解除」，引用本清单逐项证据 SHA。

## 6. 硬门重申（consult §4 承接，X4 合流门）

1. exact candidate tree 全量 e2e 绿：`retries=0`、`.last-run.json` `status=passed`、0 skipped / 0 unexpected / 0 flaky；分母以当轮实测为准（X3-R4 后含 CITY-SIGN-01…03），不得改分母/阈值/重试口径换绿。
2. LHCI 7 URL × 3 collect/assert 逐项不低于基线（当前 100/100/100/100）；本机 null 只能用同一候选 SHA 的 green CI artifact 回填并登记来源。
3. `pnpm score` 输出 `availableWeight===1` 且 `missing=[]`；e2e/LHCI/视觉/`@smoke3d` 工件同一候选 SHA 可追溯。
4. `@smoke3d` 3/3；基线重签逐张审阅，禁批量重拍掩盖回归；poster 三件 blob 零 diff + `ritual_idle` 注册值逐值恒等（失效登记单行，重拍归 X6）。

## 7. 引用

**裁决正本**：`cyber-city-rendering-gaps-consult.md`（§1.1 施工合同、§2 单 PR 边界、§4 硬门）· `cyber-city-visual-l8-design-confirm.md`（D1/D2/D3/D8、§3 批⑤⑥、§5 G1、§6 串行清单）。

**证据与口径**：`cyber-city-visual-l8-gap-survey.md` §2.3（选型矩阵）· `cyber-city-visual-l8-optimization-features.md`（X4/X7/X17、R1/R2、依赖拓扑）· `cyber-city-perf-first-score-advisor-r2.md` §3.2（六腿冻结窗）· `loop8-vis-w1-audit.md`（73 登记、F1/F2 取证口径、串台先例条款）。

**main 代码事实**（@`771b1e4`）：`src/lab/world/rendering/Rendering.ts`（NoToneMapping 现状、双路输出）· `src/lab/world/core/Quality.ts`（B1 深链禁自动档注记）· `src/lab/world/rendering/NeonMaterials.ts`（工厂 + 三档 uniform + 线性色纪律）· `src/pages/world-spike/index.astro`（PARAM_ALLOWLIST）· `package.json` three `^0.185.1`（AgX=6 / Neutral=7 枚举实测在册）。

---

*CC-VIS-TM-PREP · 2026-08-27 — doc-only 预备件：G1 前置盘点（唯一剩余 = W2 合流）+ AgX vs Neutral 双案对比取证协议（两 commit 法、六机位 24 帧云端集、exposure 配平反偏置、J1–J6 判定）+ X4 文件域三分（核心/台账候选/禁碰九类）+ B1 串行点五条（取证钉档为新增陷阱）+ G1 书面解除八项模板。不解除 G1、不派单、零实现改动。*
