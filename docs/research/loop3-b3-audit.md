# Cyber City Loop 3 B3 独立审计（CC-AL3-B3）

| 项 | 内容 |
|----|------|
| 审计对象 | `cursor/cc-l3-b3-flight-trails-1d6f@8d523b7` |
| B3 基线 | `cursor/cc-l3-layered-atmosphere-1d6f@d258e23` |
| merge-base | `d258e23`，候选线性领先 4 commits |
| 审计分支 | `cursor/cc-al3-b3-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 状态 | **独立视觉 66 · 未达 68 · e2e 52/52 · LHCI 本机缺维 · B5 HOLD · 下一步 POSTER** |

## 0. 最终裁决

**B3 实现与帧内生命感增益成立，但独立视觉只有
`66.25 → 66/100`，没有达到 Loop 3 的 `≥68` 终门。按既定门控链停止追加运行时效果，
不继续 B5；冻结 `8d523b7` runtime，下一 Task 只做 POSTER 三面收口。**

1. B3 的 3 条中远景航线、630 点、单 `InstancedMesh`、Q0/Q1/Q2、reduced-motion
   冻结和 22 秒运动证据均成立；这是一次合格的单主题实现。
2. 首幕能看到青/品红飞行拖尾真实移动，且不遮机器人、道路、招牌或 HUD；但覆盖窄、
   多数时刻只有右侧天空一两条短轨，garage POI 帧内没有形成第二个可读生命感层。
   V4 可从中审的 57 提至 **60**，不能越出 50–65 段。
3. 提交方自评为 67；本审计为 66，`|67-66|=1≤5`，一致性门通过；独立 `≥62`
   安全底线通过；独立 `≥68` **失败**。
4. 自评的主要口径错误不是 B3 加分幅度，而是把 ATM 提交方逐维向量
   `65/70/69/57/63/73/73` 当作“AL3-MID 独立基线”。真正的 AL3-MID 独立向量是
   `64/69/69/57/63/72/73`、原始分 65.80；二者都四舍五入为 66，但不能因此互换。
5. `CITY-03` 运行台账 3/3 与 Phase 3 `≤5` 天花板没有超额；但 canonical PRD 仍写
   Phase 0 `≤2`。父任务书授权和工程 notes 可以解释本批为何开第 3 席，却没有消除
   规范文本矛盾。该项不阻断 POSTER，必须在 AL3 终审前同步 canonical 口径或登记正式豁免。
6. 无论 POSTER 是否把完整用户面再抬一档，都不能倒推本次 B3 已过 68；最终目标是否
   达成只能由 POSTER 后的 CC-AL3 exact-tree 独立复评裁决。
7. fresh exact-tree build、静态门、预算、链接与 Playwright **52/52** 均通过；
   `@smoke3d` **3/3**。LHCI 在 workspace、隔离 CLI、Playwright Chromium 与系统
   Chrome 三种组合下都对 Performance/Best Practices 产出 `NaN`，且候选分支没有
   可回填的 CI run；本审计不伪记五维齐套，AL3 前必须补同树 green CI artifact。

## 1. 审计边界

`d258e23..8d523b7` 共 12 个文件、`+417/-17`：

- 运行时：新增 `src/lab/world/city/FlightTrails.ts`，并在 `city/index.ts` 装配；
- 证据：首幕开/关光轨、第二时刻、Q1、Q2、garage POI 六帧和 22 秒运动录像；
- 登记：工程 notes、rubric B3 配额注记、视觉 score JSON。

候选没有修改 `Sky.ts`、`View.ts`、`TransformSystem.ts`、poster、DOM/HUD、Playwright
用例、LHCI 配置、计分器、依赖或 workflow。B3 基线就是分支 merge-base，审计对象没有
main 分叉或“假删除”噪音。

本报告只对 `8d523b7` 作结论；后续任何 runtime 参数改动都会使帧证据与冻结判断失效。

## 2. B3 实现核验

| 验收面 | exact-tree 证据 | 裁决 |
|--------|-----------------|:---:|
| 航线与点数 | `ROUTES` 为 M/F/H 三条；150 + 240 + 240 = **630**，低于 800 上限；最近航线约 111m | ✅ |
| 提交纪律 | 630 个 billboard 点合并为一个 `InstancedMesh`；位置由 TSL `time` 在 shader 中计算，零逐帧 JS buffer 写入 | ✅ |
| 空间关系 | `depthTest` 保留、`depthWrite=false`；楼体可遮挡光轨；主帧中轨迹位于中远景/天空带，不穿机器人与 HUD | ✅ |
| Q0/Q1/Q2 | Q0 630 点/3 路；Q1 `mesh.count=390`/2 路且强度 0.8；Q2 `visible=false`、`count=0`、强度与时间轴归零 | ✅ |
| reduced-motion | `prefers-reduced-motion` 时 `timeScale=0`，保留静态光带而不持续运动 | ✅ |
| 资源与生命周期 | 零贴图/模型/网络资产、零 Ticker/DOM listener；mesh 进入 scene，沿用 Game 场景遍历 dispose | ✅ |
| 动画配额 | 工程台账把整套光轨算 1 席，当前 3/3；没有用 shader 驱动规避计席 | ✅（canonical 文本待同步） |
| 聚焦边界 | 雾、运镜、B5、poster 与 DOM 均未触碰 | ✅ |

### 2.1 配额口径的保留项

`docs/spec/PRD.md` 的 CITY-03 验收仍是“循环动画配额 ≤2 处（idle 呼吸 + 招牌脉动）”；
本分支只在工程 notes 和 rubric 施工注记中把 Phase 0 上限扩成 3。中审要求的是“先由
父代理书面统一”，所以本审计接受这次实施授权和 3/3 运行台账，不以旧 `≤2` 回滚已经
完成的 B3；但 rubric 是评分量尺、工程 notes 是执行记录，都不应暗中取代 PRD 的
canonical 验收文本。

AL3 前应二选一：

1. 同步 CITY-03 为 Phase 0 `≤3`，并保留 Phase 3 `≤5`；
2. 保持 PRD `≤2`，另在 canonical 看板登记经所有者批准的 B3 单项豁免。

## 3. 帧证据独立判断

### 3.1 增益成立

- 22 秒 H.264 证据为 1440×900、25fps、550 帧；固定机位下青色机头和品红拖尾有连续
  位移，足以排除“静态 emissive 亮线”。
- 首幕开帧右侧天空有青色短轨，品红轨在部分时刻从楼隙或画框边缘穿过；第二时刻位置
  改变，真实运动成立。
- Q1 帧仍保留两路且强度降低；Q2 帧完全看不到光轨。降档不是仅改文字台账。
- garage POI 仍能读 `CARCONCEPT GARAGE`，交互环与 HUD 未被光轨遮挡。

### 3.2 增益上限

- 主帧的光轨只占画面很小面积，常见状态是一条青色短轨；品红轨受路线相位和楼体遮挡，
  可见性不稳定。
- 22 秒抽帧能证明运动，却也显示大多数时刻没有形成“空中交通层”；它更像两三个偶发
  飞行器，而不是持续可读的城市生命网络。
- garage POI 静帧没有可见光轨，只能证明不回退，不能为第二关键视角的环境生命感加分。
- 提交的“开/关”两帧拍摄时刻不同，机器人 idle、相机微漂和其他持续时间项也在变化；
  因而全帧 SSIM 不能单独归因给 B3。参数开关与运动录像仍足以确认功能，但评分以肉眼
  可见覆盖为准，不把全帧像素差包装成光轨收益。

结论：AL3-MID 的“零车流/雨丝/光轨”中，**光轨一项可以销账**；“关键视角有成层的
环境生命感”仍未销账。V4 取 60 是 50–65 段内的保守上调。

## 4. 独立视觉复评

基线必须沿用 CC-AL3-MID 的独立向量，而不是 ATM 自评向量：

| 维 | AL3-MID 独立 | B3 自评 | AL3-B3 独立 | 复评依据 |
|----|:---:|:---:|:---:|------|
| V1 首幕构图 | 64 | 65 | **64** | 机位、主体比例、道路消失点和 poster 均未改；远景短轨是生命感，不重复记构图 |
| V2 光照材质 | 69 | 70 | **69** | ATM、材质与后处理零改；additive 纪律守住但不构成新的光照系统 |
| V3 色彩氛围 | 69 | 69 | **69** | 光轨沿用青/品红 token，没有新增杂色，也没有修掉既有派生色债 |
| V4 场景密度 | 57 | 60 | **60** | 真实运动、空间遮挡和中远景亮轨让“光轨缺席”销账；覆盖窄、POI 无可见轨迹、车流/雨丝与更广招牌覆盖仍缺 |
| V5 动效转场 | 63 | 63 | **63** | 光轨运动只记 V4 环境生命感；变形节拍、相机和 B5 均未改 |
| V6 UI/HUD | 72 | 73 | **72** | HUD 不回退；但 desktop/mobile/OG 仍是 ATM/B3 前帧，不能恢复中审已经扣掉的三面漂移分 |
| V7 原创叙事 | 73 | 73 | **73** | 飞行光轨是赛博城通用母题，不新增本站专属叙事载体 |

`64×.20 + 69×.20 + 69×.15 + 60×.15 + 63×.15 + 72×.10 + 73×.05`
`= 66.25 → 66/100`。

相对 AL3-MID 原始 `65.80`，B3 独立净增量为 **+0.45**；整数分仍为 66。

| 门 | 结果 |
|----|:---:|
| `|自评-独立|≤5` | ✅ `|67-66|=1` |
| 独立视觉 `≥62` | ✅ 66 |
| Loop 3 独立视觉 `≥68` | **❌ 66** |

### 4.1 自评为什么算成了 67

B3 score JSON 说“校准基线 = CC-AL3-MID 独立总分 66 + ATM 批逐维向量，并且与中审
零偏差”。这里把“整数总分相同”误当成“逐维基线相同”：

- ATM 自评：`65/70/69/57/63/73/73 = 66.30 → 66`；
- AL3-MID 独立：`64/69/69/57/63/72/73 = 65.80 → 66`。

B3 在前一向量上把 V4 加到 60，得到 `66.75 → 67`；在真正独立向量上同样把 V4 加到
60，只得到 `66.25 → 66`。本审计不接受用相同的四舍五入整数覆盖 0.50 原始分和三个
单维差异。

## 5. 工程门禁

### 5.1 fresh exact-tree 结果

| 项 | 结果 |
|----|------|
| 首次 build | 基础设施失败：冻结锁文件依赖未完整安装，缺 `vite-plugin-wasm`；`pnpm install --frozen-lockfile` 恢复后重跑通过，不记产品回归 |
| production build | **PASS**，19 pages |
| `pnpm astro check` | **0 errors / 0 warnings / 58 hints** |
| budget | **PASS**；poster 38.6/40KB、壳 82.2/90KB、world JS 83.9/900KB、world 资产池 5.2/12MB、受保护 14 页命中 0 |
| links | **PASS**；19 页、347 条内部引用，12 栋 deepLink 核对完成 |
| Playwright | **52 passed / 0 failed / 0 skipped / 0 flaky**，17.2m |
| `@smoke3d` | **3/3**（VIS-02/03/04） |
| 软件光栅性能 | 约 2.0fps，仍是 OBS 软门禁；不包装成真机性能 PASS |

全量测试重写的 23 张历史说明截图已恢复，审计分支保持零测试资产漂移。

### 5.2 LHCI 不能独立登记 PASS

候选分支和审计分支都没有 GitHub Actions run。为避免用相邻 SHA 冒充 exact-tree，
本审计在 `8d523b7` 运行了三组 7 URL ×3 轮：

1. workspace `@lhci/cli@0.15.1` + Playwright Chromium；
2. npm 隔离 `@lhci/cli@0.15.1` + Playwright Chromium；
3. npm 隔离 `@lhci/cli@0.15.1` + 系统 Google Chrome。

三组 collect 都完成 21 LHR，但 Performance 与 Best Practices 全轮为 `null`，
`lhci assert` 均报 `Audit did not produce a value at all`。这与仓库登记的 Cloud VM
SwiftShader 已知限制同类；它不能证明候选下降，也不能被记作 PASS。提交方工程 notes
宣称的“隔离布局后四项全 100”在当前 exact tree/VM 无法复现，且没有随分支提交 raw
LHR 或 CI artifact 可核验。

用独立视觉 66 和 fresh e2e 工件复算只能得到诊断值：

| 维度 | 分数 | 权重 | 可用性 |
|------|---:|---:|:---:|
| LHCI `/` | — | 0.25 | 缺失 |
| LHCI `/home/` | — | 0.15 | 缺失 |
| e2e | 100 | 0.20 | ✅ |
| 独立视觉 | 66 | 0.25 | ✅ |
| 3D smoke | 100 | 0.15 | ✅ |

计分器输出 `COMPOSITE_SCORE=85.8`，但这是按 **60% 可用权重归一化**的诊断分，
`availableWeight=0.6`、`missing` 含两个 LHCI 维度，**禁止登记为发布综合分**。

工程裁决：

- build/e2e/smoke/预算/链接：✅；
- LHCI 与五维齐套：⚠️ 无 exact-tree 可用值，未放行；
- POSTER 可按冻结 runtime 继续，因为它是门控链规定的收口批，不再追加运行时风险；
- CC-AL3 最终合并前必须取得 POSTER exact tree 的 green CI LHCI artifact，并确认
  `availableWeight===1`、`missing=[]`。

## 6. B5 或 POSTER

| 候选 | 裁决 | 理由 |
|------|:---:|------|
| **CC-L3-POSTER** | **GO，下一 Task** | 门控链明文规定 B3 审计后即使 `<68` 也停止追加 runtime；当前 desktop/mobile/OG 不含最终 ATM+B3，三面债务必须清账 |
| CC-L3-B5 | **HOLD，顺延 Loop 4** | B3 与 B5 在 Loop 3 互斥；此时再做 B5 是连续赌分，违反“若 B3 后仍 `<68` 则停止追加运行时效果” |

POSTER 批只能做：

1. desktop 1280×720、mobile 720×1280 独立构图，OG 复用 desktop；
2. 帧内包含 B2 TextCanvas、最终 ATM 与最终 B3；
3. 每张 `≤40KB`，并更新经审阅的 VIS-01 静态壳基线；
4. 记录冻结 runtime SHA `8d523b7`、尺寸与 hash；
5. 不再修改任何 3D、相机、CSS 构图或 rubric 分数。

POSTER 后进入 CC-AL3 终审。若 exact-tree 独立视觉仍 `<68`，如实登记 Loop 3 目标未达；
不得回头在同一 Loop 追加 B5。

