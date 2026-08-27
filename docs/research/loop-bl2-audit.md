# Cyber City Blender 沿街扩展独立审计（CC-AL-BL2）

| 项 | 内容 |
|---|---|
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 审计对象 | PR [#43](https://github.com/rayw-lab/website/pull/43) `cursor/cc-bl2-street-extension-1d6f@0c66684` |
| 登记基线 | `main@1274dad`，独立视觉 70 / 综合 92.5（CC-AL-BL1） |
| merge-base | `b9a6edb` |
| exact 被测集成提交 | `063cbd0`（detached `main@1274dad` ⊕ candidate） |
| exact tree | `17b6974e4e84a8c09b60be60b116d3f31bafb4cc` |
| 审计分支 | `cursor/cc-al-bl2-audit-1d6f` |
| 日期 | 2026-08-27（UTC） |
| 独立视觉 | **71/100（raw 70.60；AL-BL1 raw 70.20 → +0.40）** |
| V4 专项 | **71/100，低于 72–75 门** |
| 独立综合 | **92.8/100**（raw 92.75；`availableWeight=1`、`missing=[]`） |
| 裁决 | **NO-GO**：V4 未到 72，whole-frame 没有可读新轮廓；总分自评缺失，双评门不能判通过 |

## 0. 结论先行

BL2 的 `concept-garage` 是真实落地的第二栋 hero 实模，不是空接线。正常 Q0 fresh probe
同时请求并显示 `AutodriveLab.glb` 与 `ConceptGarage.glb`；`concept-garage` 程序化塔被
隐藏。POI 帧相对 BL1 清楚增加逐窗幕墙、三间暖光展厅及展车、门厅雨棚、双卷帘门、
服务窗、屋顶设备、室外展车台、配置器 kiosk、横幅与维修杂件。GLB 压缩、预算、Q2
零 heroGlb 请求和加载失败回退也都成立。

但本轮专项门不是“POI 近景做出来即可”。robot-idle whole-frame 前后帧里，
`concept-garage` 仍在画面极右缘，且实模刻意保持原程序化楼的 `60×36×18` 包络；
新建筑的屋顶线、体量切分或街墙节奏都不能在整帧中被辨认。可见收益几乎全部出现在
`?poi=concept-garage` 近景，正中 AL-BL1 §9 明示禁止的情形。

独立向量为：

```text
V1 65 / V2 75 / V3 69 / V4 71 / V5 70 / V6 73 / V7 76

65×.20 + 75×.20 + 69×.15 + 71×.15 + 70×.15 + 73×.10 + 76×.05
= 70.60 → 71/100
```

关键裁决：

- **V4=71 < 72**：第二个高细节 POI 让覆盖从“一点”扩为“两点”，故相对 BL1 加 1；
  但 whole-frame 没有新轮廓，不能跨进本轮 72–75 门；
- **whole-frame 门失败**：固定 robot-idle 对照无法不看代码就辨认 BL2 新楼；
- PR body 只写“目标 V4 72–75”，没有提交总分单值或七维自评。若只把目标带当作 V4
  声明，独立 71 与区间相差 1–4，仍在 ±5；但任务要求的总分
  `|自评-独立|≤5` 缺输入，审计不能伪造自评分；
- e2e **52/52**、smoke3d **3/3**、LHCI `/` 与 `/home/` 四项全 100、
  `availableWeight=1`、`missing=[]` 全通过；综合 92.8 不能覆盖视觉专项门；
- 候选源码两处声称资产说明位于 `public/models/concept-garage/README.md`，该文件实际
  不存在；资产正本 `docs/spec/asset-ledger-cyber-city.md` 也没有
  `ConceptGarage.glb` 条目。

因此裁决是 **NO-GO**，不是“综合够高所以有条件天然合流”。定向补洞见 §8。

## 1. 边界与 exact integration tree

### 1.1 合流四元组与唯一冲突

- candidate：`0c6668432d5d26def1c82c6def341a5510946b06`；
- 锁定 `main`：`1274dad83ecec2cc7d5e9a212e9bcaf733f0f901`；
- merge-base：`b9a6edb3bbfbe167461635f13d316f4a4cbcd0a7`；
- detached exact integration：`063cbd0e4e58ba686086237f7d0af4f0d8ce0c52`，
  tree `17b6974e4e84a8c09b60be60b116d3f31bafb4cc`。

PR 分支含两提交：旧看板提交 `f6dd3ad` 与实现提交 `0c66684`。任务书锁定的
`main@1274dad` 已独立推进同一看板，因此 `git merge --no-ff --no-commit 0c66684`
在 `docs/research/cyber-city-score-loop-orchestration.md` 产生唯一内容冲突。解法是保留
`main@1274dad` 的较新看板全文；候选四个业务文件由 `ort` 原样合入。该 detached merge
commit 不推送。

### 1.2 exact tree 相对锁定 `main` 的文件清单

| 状态 | 文件 | 性质 |
|---|---|---|
| A | `public/models/concept-garage/ConceptGarage.glb` | 146,464 B Blender 产物 |
| M | `src/data/cyber-city-buildings.json` | `concept-garage.heroGlb` 单源接线 |
| M | `src/lab/world/city/HeroBlenderMesh.ts` | 第二栋碰撞体、注释与通用日志 |
| A | `tools/blender/generate-concept-garage.py` | 786 行确定性 Blender 源 |

exact tree 没有相机、tone mapping、poster、HUD、其它楼资产或基线图变更。

### 1.3 受保护面

| 受保护面 | 相对 `1274dad..exact` | 判定 |
|---|---:|:---:|
| `e2e/` | 0 | ✅ |
| `playwright.config.ts` | 0 | ✅ |
| `lighthouserc.json` | 0 | ✅ |
| `.github/workflows/` | 0 | ✅ |
| `scripts/` / 既有计分门槛脚本 | 0 | ✅ |

生成器位于已由 BL1 清账确立的 `tools/blender/`，没有重犯 BL1 的受保护 `scripts/`
路径问题。全量 e2e 重写的历史取证截图已在 detached worktree 还原，不进入 exact commit
或审计分支。

## 2. 落地双证与 whole-frame 裁定

| 项 | 最终树代码证据 | fresh 运行时/帧证据 | 裁定 |
|---|---|---|:---:|
| `concept-garage` 实模接线 | JSON `heroGlb` 进入既有 `HeroBlenderMesh.loadOne()`；成功后添加 `city-hero-glb-concept-garage` 并只隐藏对应程序化 visual | Q0：两栋 hero 均 present+visible；两栋 `city-tower-*` 均 present 但 invisible；两条 hero GLB 请求均出现 | ✅ |
| 第二栋 hero 内容 | 生成器创建展厅/展车、入口雨棚、卷帘门、服务窗、逐窗幕墙、设备顶带、屋顶设备与前场道具；9 个 fixed collider 随质量档开关 | concept POI 相对 BL1 程序化平墙升级明显；BL1 autodrive POI 与 BL2 concept POI 都达到“实模近景可读” | ✅ |
| whole-frame 新轮廓 | 模型约束为与旧楼同笼的 `60×36×18` 包络，且不改相机/楼位 | robot-idle 对照中变化仍压在极右缘；没有可读的新屋顶线、体量切分或街墙轮廓 | ❌ |
| Q2 fallback | 构造器在 `quality.level===2` 时不建 loader、不注册 hero entry | 两栋 hero GLB 请求 `[]`；两栋 hero 均 absent，程序化塔均 present+visible | ✅ |
| 加载失败 fallback | `loadOne()` catch 后不隐藏对应 tower；其它楼独立继续加载 | 主动 abort `ConceptGarage.glb`：concept hero absent / tower visible；autodrive hero visible / tower invisible；世界 ready，warning 命中 | ✅ |
| Q1 / 热切档 | `applyQuality(level)` 以 `level<2` 统一切两栋 hero/tower 与 prop body | 静态路径与 BL1 已验证机制同构；本轮 fresh 重点覆盖新增楼 Q0、Q2、失败回退 | ✅ |

POI 上方 `CARCONCEPT GARAGE` 全息牌与交互提示属于既有 `BuildingSigns` / HUD，
不是新 GLB 贡献；本审计没有把既有文字重复计入 BL2。BL2 的新增分来自牌后真实立面、
展厅、入口、卷帘门与前场物件。

whole-frame 对照中机器人 idle 相位与飞行光轨的瞬时位置有差异，这些是既有时间项；
它们不构成新建筑轮廓证据。把视线移到右缘仍只能看到与 BL1 相近的低矮包络。

## 3. GLB、复现与预算

### 3.1 独立解析

| 项 | 实测 | 合同 | 判定 |
|---|---:|---:|:---:|
| 文件体积 | 146,464 B（143.0 KiB） | ≤10MB | ✅ |
| indexed triangles | 2,586 | ≤100,000 | ✅ |
| mesh / primitive / material | 13 / 13 / 13 | — | ✅ |
| Draco | 13/13 primitive 含 `KHR_draco_mesh_compression`，且 required | 必须 | ✅ |
| KTX2 | 3/3 image MIME=`image/ktx2`，且 `KHR_texture_basisu` required | 必须 | ✅ |
| 贴图尺寸 | 1024² / 256² / 1024² | 每张 ≤2K | ✅ |
| GLB SHA-256 | `d181147311f2af432706edd2c695de503f8d7281e4a762fa5a8d9072160988aa` | 留档 | ✅ |

`extensionsUsed` 另含 `KHR_materials_emissive_strength`。13 个材质名为
`AccentBlue / BeaconBlue / CarShell / Concrete / Facade / FacadeDark / GlassDark /
InteriorWarm / Metal / MetalDark / ScreenCyan / Utility / Window`。

审计机用 Blender 4.0.2 fresh 执行生成器，再按 BL1 同构命令执行
`gltf-transform etc1s --quality 255` 与 `gltf-transform draco`。重建结果仍为
146,464 B，SHA-256 与入库 GLB 完全相同；因此脚本是可复现源。

### 3.2 工程预算

`node scripts/audit-budget.mjs`（exact tree）：

- world JS：**86.0/900KB gzip**；
- world 资产池：**5.5/12MB**；
- public 总量：**9.0/40MB**；
- `/` 壳：**86.5/90KB**；
- poster：**39.7/40KB**；
- `.blend/.wav/.band/*encoder*` 黑名单：0。

全部阻断预算通过。

### 3.3 资产治理缺口

候选有两处可验证的不一致：

1. `tools/blender/generate-concept-garage.py` 写“压缩管线见
   `public/models/concept-garage/README.md`”；
2. `HeroBlenderMesh.ts` 写台账见“各自 `public/models/*/README.md` + asset-ledger”。

但 exact tree 没有 `public/models/concept-garage/README.md`，正本台账也只有
`HeroRobot.glb` 与 `AutodriveLab.glb` 两项。资产本身由仓内脚本原创，未发现第三方许可
风险；缺口是来源、体积、tri、压缩、SHA、坐标和复现命令没有按既有 BL1 规范入账。

## 4. Rubric v1.1 独立视觉复评

沿用原权重与锚点，先看固定 robot-idle、concept POI、autodrive POI，再核代码；不因
72 门线改秤。

| 维 | AL-BL1 | AL-BL2 独立 | 依据 |
|---|---:|---:|---|
| V1 首幕构图 | 65 | **65** | 相机、主体、poster、HUD 零改；新楼在右缘且轮廓不可读，不能冒充新 definitive shot |
| V2 光照材质 | 74 | **75** | 第二栋把 KTX2 幕墙/窗内景、金属、暖光展厅扩到 concept POI；但整帧覆盖仍小，tone mapping/IBL 未做 |
| V3 色彩氛围 | 69 | **69** | 蓝只进入身份线/信标，暖白/青/暗窗格遵守既有色轴；没有改变全城明暗节奏 |
| V4 场景密度 | 70 | **71** | 第二个关键 POI 有实模细节与道具层，覆盖净增；但 whole-frame 仍不可读，只给 +1，不能到 72 |
| V5 动效转场 | 70 | **70** | 无新动画、运镜或转场节拍 |
| V6 UI/HUD | 73 | **73** | DOM/HUD/poster 零改，既有招牌不重复计分 |
| V7 原创叙事 | 75 | **76** | 展厅展车、配置器 kiosk、维修门与杂件把“3D 汽车配置器车库”变为第二个可见产品 POI；仍是近景单点 |

V4 的 `+1` 触发反通胀说明：BL1 已用 autodrive 单 POI 跨到 70 段下沿；BL2 的 concept
POI 确实增加第二个完整叙事点，不能记 0。但 rubric 70–85 段要求“关键视角密度达标，
覆盖仍不全”，而本轮又加了更严格的 whole-frame 新轮廓门。固定首幕仍无法辨认新楼，
所以 71 是“第二点成立、沿街整帧未成立”，没有 72 的帧证据。

自评合理性：

- PR body 的 V4 目标带 72–75 与独立 71 相差 1–4，若将目标带视作 V4 区间声明，
  `|ΔV4|≤5`；
- 候选没有总分单值、raw 算式或七维自评，故总分 `|自评-独立|≤5` **不可计算**；
- 生产 JSON 只登记本审计独立 71，不把目标带下沿 72 当作自评或独立分。

## 5. exact tree 验证

### 5.1 check / build / links / budget

- `astro check`：129 files，**0 errors / 0 warnings / 58 hints**；
- build：19 pages；
- links：19 HTML、347 条内部引用，全通过；
- budget：见 §3.2，全部通过。

### 5.2 全量 e2e 与专项 probes

隔离端口 4363 对 detached exact tree 运行完整五 project 链：

- **52 passed / 0 failed / 0 skipped / 0 flaky**；
- 本地 `retries=0`；
- 墙钟 **24.5m**；
- `VIS-02/03/04 @smoke3d`：**3/3**；
- 另有 fresh Q0/Q2/abort probe 覆盖两栋 hero 可见性、Q2 零 heroGlb 请求和单栋失败回退。

### 5.3 LHCI

隔离端口 4364 full collect：7 URL ×3 = 21 LHR，collect/assert 均 exit 0：

- `/website/`：Performance / Accessibility / Best Practices / SEO =
  **100 / 100 / 100 / 100**；
- `/website/home/`：**100 / 100 / 100 / 100**；
- 相对 AL-BL1 两 URL全 100：零下降。

候选同 SHA CI run
[33027068118](https://github.com/rayw-lab/website/actions/runs/33027068118) 也为 green；
`lighthouse-results` artifact id `9628896746`，digest
`sha256:4d8e1d209a0d2d892ff5a2b1c53a8f5f2dbdad4c1e8a765220066236d09912a7`。
CI artifact 的 21 LHR 中 `/`、`/home/` 四项中位数同为全 100。最终计分采用本地
exact-tree LHR，CI 只作交叉证据。

## 6. 统一计分器复算

| 维度 | exact 分数 | 权重 | 加权 |
|---|---:|---:|---:|
| LHCI `/` | 100 | .25 | 25.00 |
| LHCI `/home/` | 100 | .15 | 15.00 |
| e2e | 100 | .20 | 20.00 |
| 独立视觉 | **71** | .25 | 17.75 |
| 3D smoke | 100 | .15 | 15.00 |
| **合计** |  | **1.00** | **92.75 → 92.8** |

```text
node scripts/score-loop.mjs --visual-score 71
COMPOSITE_SCORE=92.8
availableWeight=1
missing=[]
```

生产登记采用独立 **71 / 92.8**。

## 7. 硬门逐行

| 硬门 | 实测 | 判定 |
|---|---|:---:|
| exact tree e2e 52/52 | 52 passed，0 retry/failed/skipped/flaky | ✅ |
| smoke3d | VIS-02/03/04 = 3/3 | ✅ |
| LHCI `/`、`/home/` 不降 | 两 URL四项全 100，AL-BL1 也是全 100 | ✅ |
| `availableWeight===1`、`missing=[]` | `1`、`[]` | ✅ |
| 综合 ≥85 | 92.8 | ✅ |
| V4 独立 72–75 | **71** | ❌ |
| whole-frame 新轮廓可读 | robot-idle 新楼仍在极右缘、同包络，无法辨认 | ❌ |
| 视觉双评 `|Δ|≤5` | V4 目标带差 1–4；**总分自评缺失** | ❌ 总分门不可验证 |
| GLB ≤10MB / ≤100k tri | 146,464 B / 2,586 tris | ✅ |
| Draco + KTX2 | 13/13 Draco；3/3 KTX2；required extensions 齐 | ✅ |
| Q2 heroGlb zero-request | 两栋 hero GLB 请求 `[]`，两栋程序化塔 visible | ✅ |
| 新楼加载失败 fallback | concept tower visible、autodrive hero 仍 visible、世界 ready | ✅ |
| 受保护面零差异 | e2e/config/LHCI/workflow/scripts 均 0 | ✅ |
| 资产说明与正本台账 | concept README 缺失，asset ledger 无条目 | ❌ |

## 8. 裁决与定向补洞

裁决：**NO-GO**。

补洞只围绕已点名缺口，不扩 tone mapping、poster、HUD 或第三栋楼：

1. 在固定 whole-frame 证据中让 `concept-garage` 产生无需 POI 近景即可辨认的新轮廓；
   可改楼体上部/屋顶线、沿街可见面或经明确任务书批准的构图，但不能拿近景截图代替；
2. 用同一 robot-idle + concept POI + autodrive POI 重拍对照，V4 独立复审必须达到
   **72–75**；
3. 在 PR body 或实现记录提交一个总分单值、raw 算式和七维自评，供
   `|自评-独立|≤5` 实算；不得写入生产独立分 JSON 冒充审计结果；
4. 新增 `public/models/concept-garage/README.md`，并在
   `docs/spec/asset-ledger-cyber-city.md` 登记原创来源、复现命令、146,464 B、
   2,586 tris、Draco+KTX2 与 SHA-256；
5. 若 GLB 或 `src/` 任一字节变化，重做资产解析、fresh 帧、Q2/abort、52/52 与 LHCI；
   只有纯文档清账且 GLB SHA 保持不变时才可复用资产复现结论。

修复后须再次独立审计；父代理不得把本 NO-GO 当作“补文档后自动放行”。

## 9. 证据路径与 digest

| 证据 | 路径 | SHA-256 |
|---|---|---|
| whole-frame 对照合成 | `/opt/cursor/artifacts/cc-al-bl2-whole-frame-comparison.png` | `eaac1895e6fbd18348fa17e05c053e2bac57d7638cbe1c2e1a67ab91df425df7` |
| concept POI 对照合成 | `/opt/cursor/artifacts/cc-al-bl2-concept-poi-comparison.png` | `f1fde29428fdd9010fe19705b5d36da34e0d017ba76172cfe4b26ffeab7812c1` |
| exact Q0 robot-idle | `/opt/cursor/artifacts/cc-al-bl2-exact-robot-idle.png` | `c17dad88a7fad462a6ecb4f76702bb323ace126d2eb79ab98656c59869b08d2d` |
| main Q0 robot-idle | `/opt/cursor/artifacts/cc-al-bl2-main-robot-idle.png` | `3ee8ef91ce9533f5639c858e622cf06a35de788b4025f6b2fe41bb9333065c32` |
| exact concept POI | `/opt/cursor/artifacts/cc-al-bl2-exact-concept-poi.png` | `1aab700c42627cf0484386f073caa4ce231dc15f47438e9f7fcf6b5c9720e6ce` |
| main concept POI | `/opt/cursor/artifacts/cc-al-bl2-main-concept-poi.png` | `260ea2d344ddaa9e43384622f0a82c260348e795a0cc164ec92046d4ba2e135f` |
| exact autodrive POI | `/opt/cursor/artifacts/cc-al-bl2-exact-autodrive-poi.png` | `5f18be7672a736e02f55e4ae69ee7aa4fb9bd3c4bb16b6bc2e9ea96503b7a792` |
| Q2 fallback | `/opt/cursor/artifacts/cc-al-bl2-q2-fallback.png` | `ae2bc4b7239313c96982f038f11987560dcaa28994da214123af6abd8f9cc5f0` |
| abort fallback | `/opt/cursor/artifacts/cc-al-bl2-load-failure-fallback.png` | `0e1708ace82e68285aa11bd547f3e15d42a5523ef737a497571321670256a53a` |
| GLB | `public/models/concept-garage/ConceptGarage.glb` | `d181147311f2af432706edd2c695de503f8d7281e4a762fa5a8d9072160988aa` |
| CI LHCI artifact | run 33027068118 / artifact 9628896746 | `4d8e1d209a0d2d892ff5a2b1c53a8f5f2dbdad4c1e8a765220066236d09912a7` |

---

*CC-AL-BL2 · 审计分支只提交本报告与独立 score JSON；零业务代码、测试逻辑、阈值、
workflow 或像素基线改动。*
