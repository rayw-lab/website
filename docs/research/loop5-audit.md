# Cyber City Loop 5 独立审计（CC-AL5）

| 项 | 内容 |
|---|---|
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 审计对象 | PR [#40](https://github.com/rayw-lab/website/pull/40) `cursor/cc-l5-tierc-interior-windows-1d6f@8c7da76` |
| 比较基线 | `main@fb48221` |
| merge-base | `1ae993a` |
| exact 被测集成提交 | `ccc3ddb`（detached candidate ⊕ `main`） |
| exact tree | `7449fe83190d111a35fcd731ee4d3ada0e8c7619` |
| 审计分支 | `cursor/cc-al5-loop5-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 独立视觉 | **68/100（raw 68.00；AL4 raw 67.50 → +0.50）** |
| 独立综合 | **92.0/100**（`availableWeight=1`、`missing=[]`） |
| 裁决 | **有条件放行：工程改动可作为程序化路径收口基底；Loop 5 的视觉 ≥70 目标不通过，禁止登记 70+ 或继续普通 Tier C 叠件** |

## 0. 结论先行

两项实现均为真实接线，且 fresh 帧中都能找到对应视觉变化；但变化集中在局部表面，整帧
第一眼与 `main` 仍非常接近：

- 假室内映射真实完成视线与虚拟房盒求交，五栋 hero 楼按 `interiorRatio=0.10` 开启；
  fresh 帧可见少量窗格出现暖/冷房间层次，但不足以把近中景从程序化盒楼提升到
  rubric V4 的 70–85 段；
- 机器人 GLB 与 fallback 都完成材质分区；橙色警示件、青色关节和胸甲高光可辨，但
  whole-frame 对照变化克制，不能按“主体材质显著换代”计分。

独立向量为
`V1 65 / V2 71 / V3 69 / V4 60 / V5 70 / V6 73 / V7 73`：

`65×.20 + 71×.20 + 69×.15 + 60×.15 + 70×.15 + 73×.10 + 73×.05`
`= 68.00 → 68/100`。

提交方为 69（raw 68.50），因此 `|69-68|=1≤5`，自评合理性门通过；但独立视觉
`68<70`，Loop 5 绝对目标门不通过。独立 raw 相对 AL4 只增 **+0.50**，综合分仍为
**92.0**；不能用综合分覆盖视觉专项缺口。

裁决为**有条件放行**，条件是：

1. 看板只登记独立 **68（raw 68.00）/ 综合 92.0**，不得登记视觉 69/70+ 或宣称
   Loop 5 达成 ≥70；
2. PR #40 只可作为程序化路径的最终基底收口；不再开 tone mapping、雨丝、云/月、
   stagger、HUD 或其它普通 Tier C 叠件来赌四舍五入；
3. 按 `cyber-city-rendering-gaps-consult.md` 的 AL5 分支裁决，剩余主缺口归 V4 的
   实模轮廓、近景道具与手工材质密度，下一视觉动作改为**单 hero 楼 + 相邻街角
   Blender spike 的显式产品立项**；若产品不批准专项，则视觉停在 68 收口；
4. runtime 最终冻结后另做 poster 三面收口；poster 不得反向混进本 PR。

## 1. 边界与 exact integration tree

### 1.1 合流四元组

- candidate：`8c7da7670f0b271ed7300ed26c0bff551c219cf6`；
- `main`：`fb482217a270abd16121beec8f89b7522b33a8d0`；
- merge-base：`1ae993a26c5234879fb2c5483412dc11216fdda6`；
- detached exact integration：`ccc3ddb01e2e639d2daf01a48de847c92ccf2dfb`，
  tree `7449fe83190d111a35fcd731ee4d3ada0e8c7619`。

试合并只发生在 `/tmp/cc-al5-exact` detached worktree；未推送该合流提交。PR 页面显示
`MERGEABLE/CLEAN`，本地 `ort` 合流无冲突。

### 1.2 exact tree 相对 `main` 的文件清单

| 状态 | 文件 | 性质 |
|---|---|---|
| M | `docs/research/cyber-city-eng-wave1-notes.md` | 提交方交付/测试/自评登记 |
| M | `docs/research/cyber-city-rendering-architecture-audit.md` | emissive 阈下台账补录 |
| M | `docs/research/cyber-city-visual-rubric-score.json` | 提交方 69 分登记 |
| M | `src/lab/world/city/HeroRobot.ts` | 机器人 GLB/fallback 材质分区 |
| M | `src/lab/world/city/ThemeTowers.ts` | hero 楼 `interiorRatio=0.10` 接线 |
| M | `src/lab/world/rendering/NeonMaterials.ts` | 假室内映射节点图 |

### 1.3 受保护面与扩批禁令

`git diff --exit-code origin/main..ccc3ddb -- e2e playwright.config.ts lighthouserc.json scripts
.github/workflows` 为 exit 0：

- e2e 逻辑：零差异；
- `playwright.config.ts`：零差异；
- `lighthouserc.json`：零差异；
- `scripts/`、分数权重、阈值：零差异；
- workflow：零差异；
- 入库像素基线：零差异、无需解释或更新。

文件清单同时证明以下禁做项均未混入：tone mapping / 新 postprocessing pass /
`Rendering.ts` / 运镜 `View.ts` / `TransformSystem.ts` / `Sky.ts` / `FlightTrails.ts` /
poster / 其它 Tier C 内容。扩批禁令通过。

本地隔离端口测试时曾把 exact worktree 的 LHCI URL 从 `4321` 临时改为 `4327`
（仅七个 URL 的端口，集合/次数/阈值不变），原因是 `4321` 正由 `/workspace` 基线
preview 占用。测试后已还原。全量测试重写的历史说明截图也已全部还原；最终 detached
worktree `git diff --exit-code` 为 0。

## 2. 两项落地双证

| 项 | 最终树代码证据 | fresh 帧独立判断 | 裁定 |
|---|---|---|---|
| 假室内映射窗格 | `NeonMaterials.ts` 新增 `interiorRatio`/`rotationY`；用 `positionWorld-cameraPosition` 得视线，变换到楼体本地后对宽/高/深 2.2m 单位房盒求最近命中，区分后墙/侧墙/天花/地板并加家具剪影；`ThemeTowers.ts` 仅 hero 五楼开 `0.10`，standard 缺省 0 | exact WebGL Q0 首幕与 fresh `main` Q0 对照中，部分暖白/冷蓝窗不再是纯平涂；但只有少量 hero 窗格发生变化，整帧密度和楼体轮廓基本不变 | ✅ 有折扣：接线真实、视差工艺成立；V4 只加 2，不接受自评 +4 |
| 机器人 GLB 分区 | `HeroRobot.ts` 按 `Main` 调 0.62/0.38、`LightGrey` 加品牌青关节 emissive、`Accent` 加工业橙阈下 emissive；`jointMaterials` 复用既有呼吸时间轴；fallback 的 titanium/joint/accent 同口径 | fresh robot-idle 中橙色肩/手/胫、青色关节/胸传感器和胸甲高光可辨；但 `main` 已有橙/青基础色，whole-frame 前后差异主要是亮度与高光锐度，不是新轮廓或新材质资产 | ✅ 有折扣：V2 加 1；不借同一变化重复抬 V1/V3/V4/V7 |

额外交叉核对：

- 独立解析 `public/models/hero-robot/HeroRobot.glb` JSON chunk，材质名实为
  `Main, Accent, Grey, LightGrey, Black, Eye`；GLB 路径的名称分派不是空接线；
- fresh 帧为圆角/骨骼 GLB 机甲，不是块面 fallback，证明正常资产消费路径已命中；
- 室内无时间节点，关节脉动复用既有 breath 值；没有新增 CITY-03 动画席位；
- 新增室内、关节、警示条都在 threshold 1 以下；bloom 名额与后处理配置未改；
- `astro check`：128 files，0 errors / 0 warnings / 58 hints；
- budget：world JS **84.8/900KB**，world 资产池 **5.2/12MB**，壳静态段
  **86.5/90KB**，poster **39.7/40KB**，全部阻断门通过；
- links：19 页 / 347 条内部引用通过。

## 3. Rubric v1.1 独立视觉复评

不改 v1.1 权重，不因 70 门线改秤；以 fresh exact-tree 帧优先，代码只用于解释帧。

| 维 | AL4 | 提交方 | AL5 独立 | 依据 |
|---|---:|---:|---:|---|
| V1 首幕构图 | 65 | 65 | **65** | 相机、景框、poster、天空与主体比例零改；局部材质收益不重复计构图 |
| V2 光照材质 | 70 | 72 | **71** | 室内视差与机器人 PBR 分区是真增量，满足 70–85 段底“个别材质仍见程序感”的小幅销账；但 whole-frame 对照差异克制、tone mapping/IBL/手工材质均未新增 |
| V3 色彩氛围 | 69 | 69 | **69** | 暖白/冷蓝/品牌青/工业橙仍在既有色轴，未改变综合色彩经营 |
| V4 场景密度 | 58 | 62 | **60** | 五栋 hero 楼约 10% 窗格增加 lived-in 微细节，故 +2；但近景道具、实模轮廓、窗框几何、烘焙层与街道生活仍缺，关键整帧与 main 接近，未到 50–65 段顶 |
| V5 动效转场 | 70 | 70 | **70** | 无新节拍；关节同拍只属材质消费，不重复加动效分 |
| V6 UI/HUD | 73 | 73 | **73** | DOM/HUD/poster 零改，VIS-01/02 基线不变 |
| V7 原创叙事 | 73 | 73 | **73** | interior mapping 与材质分区是通用工艺，没有新增可转述叙事载体 |

计算：

```text
65×.20 + 71×.20 + 69×.15 + 60×.15 + 70×.15 + 73×.10 + 73×.05
= 68.00 → 68/100
```

判定：

- 自评 69 vs 独立 68：`|Δ|=1≤5` ✅；
- Loop 5 独立视觉目标：`68<70` ❌；
- AL4 raw 67.50 → AL5 raw 68.00：**+0.50**；
- 本轮没有与上轮相差 ≥10 的维度，无需触发逐维大幅差异复议。

## 4. 冷启动 / 首用观测

### 4.1 方法

exact tree 在每格都启动全新 Chromium 进程和 context，固定 1440×900，记录：

1. navigation → host `ready`；
2. navigation → `robot_idle`；
3. 首次 `robot_idle → transforming → car_ready`；
4. 先切 Q2，再首用切回 Q0，记录五个 rAF 与 Long Task；
5. page error / console warning / 实际 renderer backend；
6. robot-idle fresh 帧。

矩阵只观测，不修改现有 ≤2.5s / ≤8s 真机门槛。WebGPU 软件对照使用同一组
`--enable-unsafe-webgpu --enable-features=Vulkan --use-angle=vulkan` 参数；
`?gl=1` 明确强制 WebGL 2。

### 4.2 exact candidate 结果

| 后端 | 档 | ready | robot_idle | 首次 transform | Q2→Q0 五帧窗 | 最大 switch Long Task | 结论 |
|---|---:|---:|---:|---:|---:|---:|---|
| WebGPU（软件 Vulkan） | Q0 | >240s timeout | 未到 | 未测 | 未测 | — | ❌ 未 ready；11 page errors |
| WebGPU（软件 Vulkan） | Q1 | 3.00s | 4.25s | 1.19s | 0.09s | 0 | 状态完成但 canvas 黑 |
| WebGPU（软件 Vulkan） | Q2 | 2.94s | 4.16s | 1.11s | 0.10s | 0 | 状态完成但 canvas 黑 |
| `?gl=1` WebGL 2 / SwiftShader | Q0 | 30.09s | 87.59s | 77.24s | 15.74s | 2.29s | 状态全通，0 page error |
| `?gl=1` WebGL 2 / SwiftShader | Q1 | 25.02s | 67.20s | 63.39s | 21.54s | 6.90s | 状态全通，0 page error |
| `?gl=1` WebGL 2 / SwiftShader | Q2 | 18.67s | 53.58s | 52.83s | 19.99s | 6.77s | 状态全通，0 page error |

### 4.3 归因对照与硬门判断

软件 WebGPU 的异常不能归因 L5：

- 同参数 fresh `main@fb48221`：Q0 同样 >240s 未 ready；Q1/Q2 同样为 WebGPU
  backend + 黑 canvas，并产生同族 `GPUDevice.createBuffer(10056)` validation errors；
- candidate 与 main 的 WebGPU Q1/Q2 黑帧 SHA-256 完全相同：
  `f5471c5539b024de5809598490d7224f1c3e68eda3ba044c6ef5dd7308c345ee`；
- main WebGPU Q1 为 ready 2.88s / robot 4.15s，candidate 为 3.00s / 4.25s；
  差异仅约 0.1s；Q0 两者同失败。

因此这是本 VM 强制软件 Vulkan adapter 的既存不可用面，不是 L5 新材质引发的新增回归。
它仍应留档为平台覆盖缺口，但不触发本 PR 的 prewarm 修复。

WebGL 2 是本 VM 的可信软件渲染观测面。candidate Q0 与 fresh main Q0
（ready 33.18s / robot 85.85s / transform 75.12s / Q2→Q0 15.57s）同量级，
没有可归因退化。Q0/Q1/Q2 的 Q2→Q0 首用在 SwiftShader 上确有 15.7–21.5s 窗和
2.3–6.9s Long Task，说明预热敞口是真实风险；但它没有击穿最终 e2e 状态门，且该 VM
约 1fps 的读数按既有合同只作软观测，不能伪装成真机 ≤2.5s/≤8s 失败。

结论：**没有“由 L5 编译明确导致”的既有硬门失败**，`PreRenderer` 策略继续 defer；
不得据此新造毫秒硬门，也不得把软件 WebGPU 黑帧包装为 PASS。

## 5. exact tree 全量复跑

### 5.1 `pnpm quality:loop:full`

在隔离端口 4327 跑一键链：

- build：PASS，19 pages；
- 首轮 e2e：`46 passed / 1 failed / 5 did not run`，失败为未改动的
  `WS-E2E-03` 左转采样，`Δyaw=-1.143rad`；
- LHCI：7 URL ×3 = 21 LHR，collect 0 / assert 0；
- 首轮 score 因 downstream visual project 未运行而缺 smoke，只是诊断值，不用于放行。

没有隐去首轮失败。后续复核记录：

1. `WS-E2E-03` 首次隔离仍以 `Δyaw=-2.917rad` 失败；
2. 同用例第二次隔离 1/1 通过，证明 ±π/软渲染采样型不稳定；
3. 首次完整重跑在未改动的 `CAR-E2E-05` loading 上 VM 超时；
4. 再次完整、无 Playwright retry 的 clean run 最终得到
   **52 passed / 0 failed / 0 skipped / 0 flaky，25.7m**；
5. final JSON 明确 `retries=0`；`VIS-02/03/04 @smoke3d` **3/3**。

硬门采用最终完整单轮 52/52；前序两类跨域资源波动同时作为测试稳定性债保留，不以“最终
绿”抹掉。

### 5.2 LHCI

本地 exact tree 21 个 LHR：

- `/website/`：Performance / Accessibility / Best Practices / SEO =
  **100 / 100 / 100 / 100**；
- `/website/home/`：**100 / 100 / 100 / 100**；
- 两 URL 各 3 轮，21 LHR 的四分类 `null` 总数 = 0；
- 相对 AL4 的 100/100/100/100 零下降；
- LHR hash-manifest digest：
  `sha256:462aa3c37797b1de3a33152a32467da9d66378bd2d779eae83085a5359dc0b27`。

补充：PR 的 runtime 提交 `6e48f1a` 有 green CI run
[32983702139](https://github.com/rayw-lab/website/actions/runs/32983702139)，其
`lighthouse-results` artifact digest 为
`sha256:bb154df11c75dd4c1d909bc69ebcaf4eec1ba9d2e7b7f4e424a8186d0959d6ef`。
最终 `8c7da76` 仅追加 docs/score 登记且没有新的 status check；本审计放行 LHCI 采用
本地 exact-tree 重采结果，不把相邻 SHA artifact 冒充同 SHA。

## 6. 统一计分器复算

| 维度 | exact 分数 | 权重 | 加权 |
|---|---:|---:|---:|
| LHCI `/` | 100 | .25 | 25.00 |
| LHCI `/home/` | 100 | .15 | 15.00 |
| e2e | 100 | .20 | 20.00 |
| 独立视觉 | **68** | .25 | 17.00 |
| 3D smoke | 100 | .15 | 15.00 |
| **合计** |  | **1.00** | **92.00** |

统一计分器两次复算：

```text
--visual-score 69 → COMPOSITE_SCORE=92.3
--visual-score 68 → COMPOSITE_SCORE=92.0
```

最终机读结果：`availableWeight: 1`、`missing: []`。登记口径应采用独立分
**COMPOSITE_SCORE=92.0**。

## 7. 硬门逐行

| 硬门 | 实测 | 判定 |
|---|---|:---:|
| exact tree e2e 52/52 | 最终完整无 retry 单轮 52/52；前序 flake 透明留档 | ✅ |
| smoke3d | VIS-02/03/04 = 3/3 | ✅ |
| LHCI `/` 与 `/home/` 不降 | 两 URL四项均 100，AL4 也是全 100 | ✅ |
| `availableWeight===1`、`missing=[]` | `1`、`[]` | ✅ |
| 自评/独立 `|Δ|≤5` | `|69-68|=1` | ✅ |
| 综合 ≥85 | 独立口径 92.0 | ✅ |
| 扩批禁令 | 无 tone mapping/运镜/poster/光轨/雾/其它 Tier C | ✅ |
| 冷启动没有 L5 可归因硬门击穿 | WebGL 全状态通过；软件 WebGPU 异常在 main 等同复现 | ✅（观测） |
| Loop 5 独立视觉 ≥70 | 68 | ❌ |
| 程序化上限必须明确裁决 | 见 §8 | ✅ |

## 8. 程序化上限裁决

提交方 score JSON 的“若本轮 raw `<1.0` 即触发连续两轮 `<1.0`”推论不成立：

- AL4 相对 AL3 raw 为 `66.45 → 67.50 = +1.05`，并不小于 1.0；
- 本轮为 `67.50 → 68.00 = +0.50`；
- 因此按 `cyber-city-loop3-planning-consult.md` C.2 第 2 条的字面，
  **“连续两次独立审计都 <1.0”尚未成立**。

但最新且专门面向 AL5 的 `cyber-city-rendering-gaps-consult.md` 决策树另有更直接规则：
若 AL5 仍约 68、V4 被几何/实模密度卡住，则不以 tone mapping 救总分，转 Blender
hero 楼/街角 spike 裁决。本轮证据正落在该分支：

- 视觉仍为 68；
- V4 虽从 58 到 60 有净增益，但仍是最低维；
- whole-frame 的关键差距不是高光滚降，而是盒楼轮廓、近景道具、窗框/室内几何和
  烘焙材质层；
- tone mapping 主要抬 V2/V3，不能补 V4；
- 本轮程序化小件 raw 只换来 +0.50。

所以实际裁决是：

1. **不以“连续两轮 <1.0”这一错误理由触发停止；**
2. **依据更新的 AL5 专项决策树与“剩余差距=实模密度”判定，停止普通程序化视觉
   Loop，转单点 Blender spike 的产品立项；**
3. Blender 不是自动扩批：先做一栋 hero 楼 + 一个相邻街角，独立核算源文件与许可、
   Draco/KTX2、LOD、Q2/移动 fallback、12MB 资产池、加载失败 fallback 与最终 poster；
4. 若产品目标仍只要求 68 而不批准资产专项，则直接收口，不再为了四舍五入开 Loop 6
   tone mapping。

## 9. 下轮建议

### 9.1 若批准 Blender spike

单 PR、单场景、单归因：

- 只替换一个主机位可见 hero 楼及其街角，不做全城实模；
- 目标证据先锁：与本审计同一 1440×900 Q0 机位、POI 近景、Q2 fallback、移动端壳；
- 进入门：方案必须明确 V4 预期增益，不能靠 V2/V3 抵消；
- 保留当前程序化楼作为加载失败与 Q2 fallback；
- 资产许可、源文件、压缩产物、LOD 与预算在同 PR 入账；
- 独立审计仍按 raw 增益、V4、e2e 52/52、LHCI 不降和真机帧率裁决；
- spike 若固定主机位没有显著抬 V4，立即终止扩面。

### 9.2 不应进入下一视觉批的项目

- tone mapping：本轮残余不是 V2/V3 主导，不满足唯一推荐插槽；
- PreRenderer 扩面：只有软件观测风险，没有 L5 可归因硬门失败；
- Ticker 四个死 uniform：可另开维护 PR，不占视觉 Loop；
- poster：等 runtime/资产路线最终冻结后单独收口，始终排最后。

## 10. 证据路径与 digest

| 证据 | 路径 | SHA-256 |
|---|---|---|
| exact Q0 WebGL fresh 首幕 | `/opt/cursor/artifacts/cc-al5-cold/webgl-q0-robot-idle.png` | `d9887c5eb251fba137b3bd27d3c2e98735da8699f7c87f7b43a4453e9a672e4a` |
| main Q0 WebGL fresh 对照 | `/opt/cursor/artifacts/cc-al5-cold-main-webgl/webgl-q0-robot-idle.png` | `1d7a890322ed2df669b664602218a583e450646d06b29d4c75d377ae01f82afd` |
| exact Q1 WebGL fresh 首幕 | `/opt/cursor/artifacts/cc-al5-cold/webgl-q1-robot-idle.png` | `bbcd34c04e27952e268da879e3c4e96267ca175837edd6277e084da325a11cd0` |
| exact Q2 WebGL fresh 首幕 | `/opt/cursor/artifacts/cc-al5-cold/webgl-q2-robot-idle.png` | `26dd7b0b4ce547dfe82c108484d15a5a756b7e2a4703e6910c06a12499479533` |
| exact 六格冷启动原始数据 | `/opt/cursor/artifacts/cc-al5-cold/cold-start-matrix.json` | `61a6e1219f50305f09fcc980c96338214800643d9d8dd9de80e54431f919b481` |
| main WebGPU 对照原始数据 | `/opt/cursor/artifacts/cc-al5-cold-main/cold-start-matrix.json` | `80307df31393172647baabd8c884572fbd663d74c4e5b7d590ba1722c2839932` |
| main WebGL Q0 对照原始数据 | `/opt/cursor/artifacts/cc-al5-cold-main-webgl/cold-start-matrix.json` | `0b38190943bcaec039eba6b5d5fe0e00bacf4d0eadd2b5513c3982752494261e` |
| Playwright fresh VIS-03 | exact worktree `test-results/visual/world-robot-idle.png` | `6d387910a8df1e592db61f63e7561dd38336e7532c1fc5edf1b12894bc5301bf` |
| Playwright fresh VIS-04 | exact worktree `test-results/visual/world-poi-concept-garage.png` | `46e5d63e35c0c5cfcd659af91b8f89e2081146341d3a6d3f00017b981f06a466` |
| 本地 21 LHR hash manifest | exact worktree `.lighthouseci/lhr-*.json` | `462aa3c37797b1de3a33152a32467da9d66378bd2d779eae83085a5359dc0b27` |

---

*CC-AL5 · 只提交本审计报告，零业务代码、测试逻辑、阈值、workflow 或像素基线改动。*
