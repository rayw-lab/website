# Cyber City Blender 路径首段独立审计（CC-AL-BL1）

| 项 | 内容 |
|---|---|
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 审计对象 | PR [#42](https://github.com/rayw-lab/website/pull/42) `cursor/cc-bl1-hero-corner-blender-1d6f@81a85e2` |
| 比较基线 | `main@71f89a6`（登记视觉 68 / 综合 92.0） |
| merge-base | `71f89a6` |
| exact 被测集成提交 | `30b950d`（detached `main@71f89a6` ⊕ candidate） |
| exact tree | `b5ce8bc95541484db0f93be0a07a2ba098facc69` |
| 审计分支 | `cursor/cc-al-bl1-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 独立视觉 | **70/100（raw 70.20；AL5 raw 68.00 → +2.20）** |
| V4 专项 | **70/100：到 70 门线；没有 71+ 的帧证据** |
| 独立综合 | **92.5/100**（`availableWeight=1`、`missing=[]`） |
| 裁决 | **有条件放行（当前禁止合流）**：视觉与资产 spike 成立；受保护 `scripts/` 非零差异、资产台账缺项清账后才可合流 |

## 0. 结论先行

BL1 不是“把程序化楼换成另一个盒子”的空接线。`autodrive-lab` 在 Q0/Q1 真实消费
Draco+KTX2 GLB，POI fresh 帧中可见逐窗幕墙、层间梁、收分塔身、展厅暖光、门廊与
街角设备；加载失败与 Q2 又都回到同一栋程序化 `ThemeTowers`，不会把世界启动绑死在
新资产上。

独立向量为
`V1 65 / V2 74 / V3 69 / V4 70 / V5 70 / V6 73 / V7 75`：

```text
65×.20 + 74×.20 + 69×.15 + 70×.15 + 70×.15 + 73×.10 + 75×.05
= 70.20 → 70/100
```

关键裁决：

- **V4=70**：落入 rubric 70–85 段下沿，达到“关键 POI 有实模细节 + 叙事道具成层、
  覆盖仍不全”；若“过 70”按 `>=70` 判定则通过，若按严格 `>70` 判定则不通过；
- 首幕收益远小于 POI：robot-idle 对照里实模只在画面右缘形成局部新轮廓，不能给 V1
  或全城密度预支分；POI 对照才是本段主收益证据；
- 提交方只登记目标带 V4 68–72 / 整体 71–74，没有把自评分写入生产 JSON。独立 V4
  位于目标带内；独立整体 70 与目标带的差为 1–4，保守最大差 4，满足 `|Δ|≤5`；
- GLB 合同实测通过：157,444 B、4,622 tris、13 primitive 全部 Draco，3 张图全部
  KTX2；world 资产池 5.3/12MB；
- **当前仍不可合流**：任务书要求受保护 `scripts/` 零差异，而候选新增
  `scripts/blender/generate-autodrive-lab.py` 832 行；README 又声称台账正本在
  `asset-ledger-cyber-city.md`，该正本实际没有 `AutodriveLab.glb` 条目。

合流条件见 §8。条件清账只允许搬移生成器和补文档/台账；不得趁机改 GLB、运行时或
相机。GLB 若变字节，须重做本审计的资产解析、fresh 帧与 fallback probe。

## 1. 边界与 exact integration tree

### 1.1 合流四元组

- candidate：`81a85e26b42aa84d0ec38f3b9ea7bee6823be48d`；
- `main`：`71f89a67e315b7862269bb10f664a11c83c7bc88`；
- merge-base：`71f89a67e315b7862269bb10f664a11c83c7bc88`；
- detached exact integration：`30b950df512d0104f31df059c7e5e7ae862f8592`，
  tree `b5ce8bc95541484db0f93be0a07a2ba098facc69`。

候选是锁定基线的直接子提交；仍按 AL5 范式在 `/tmp/cc-al-bl1-exact` 生成 `--no-ff`
detached merge commit。试合并未推送，`ort` 零冲突。

审计启动时本地移动分支 `main` 已被并发看板提交推进到 `1463d4e`。被测 worktree 没有
跟随移动分支，而是显式钉死任务书 SHA `71f89a6`；并发看板提交不进入视觉归因。

### 1.2 exact tree 相对锁定 `main` 的文件清单

| 状态 | 文件 | 性质 |
|---|---|---|
| A | `public/models/autodrive-lab/AutodriveLab.glb` | 157,444 B Blender 产物 |
| A | `public/models/autodrive-lab/README.md` | 资产/生成/回退合同 |
| A | `scripts/blender/generate-autodrive-lab.py` | Blender 程序化源（受保护面违规，见下） |
| M | `src/data/cyber-city-buildings.json` | `autodrive-lab.heroGlb` 单源接线 |
| M | `src/lab/world/city/CityMap.ts` | `heroGlb?: string` schema |
| A | `src/lab/world/city/HeroBlenderMesh.ts` | 加载、切档、回退、道具碰撞体 |
| M | `src/lab/world/city/ThemeTowers.ts` | 按 id 取程序化塔视觉 |
| M | `src/lab/world/city/index.ts` | 实模层装配与对外句柄 |

没有 tone mapping、相机、poster、HUD、后处理、光轨或其它楼资产扩批。

### 1.3 受保护面

逐项结果：

| 受保护面 | 相对 `71f89a6..exact` | 判定 |
|---|---:|:---:|
| `e2e/` | 0 | ✅ |
| `playwright.config.ts` | 0 | ✅ |
| `lighthouserc.json` | 0 | ✅ |
| `.github/workflows/` | 0 | ✅ |
| 既有计分/门槛脚本 | 0 | ✅ |
| `scripts/` 整体 | 新增 1 文件 / 832 行 | ❌ |

任务书写的是 `scripts` 零差异，不是“除 `scripts/blender` 外零差异”。生成器本身是合理的
资产源，但路径违反本次明确保护面；审计不能替任务书静默加 carve-out。清账解法是把它
原样搬到非保护目录（建议 `tools/blender/`），同步 README 命令，并用 GLB SHA-256
证明产物未改。

全量测试期间临时把 detached worktree 的七个 LHCI URL 改到隔离端口，测试后还原；
临时 probe spec 也已删除。它们都不进入 exact commit 或审计分支。

## 2. 落地双证

| 项 | 最终树代码证据 | fresh 帧/运行时证据 | 裁定 |
|---|---|---|---|
| `autodrive-lab` 实模替换 | JSON `heroGlb` → `HeroBlenderMesh.loadOne()` → 共用 `ResourcesLoader` 的 GLTF/Draco/KTX2 loaders；成功后把 `city-hero-glb-autodrive-lab` 加场景并只隐藏 `ThemeTowers` visual | 独立 Q0 WebGL probe：hero 存在且 visible，程序化塔存在但 invisible；POI 帧相对 main 从平面盒楼变为逐窗幕墙、层间梁、亮展厅和结构化裙房 | ✅ |
| 东北街角道具簇 | GLB 内含充电桩×4/光伏棚/试车台+概念车/门架/totem/标定板/设备杂件/门廊；`PROP_COLLIDERS` 注册 20 个 fixed cuboid，泊车圈与对角通道留空 | POI 帧可见实模近景、门廊/场坪层次；但相机与 HUD 遮住部分小道具，首幕更只见画面右缘局部，因此不把代码清单等价成全帧可见密度 | ✅ 有折扣 |
| Q2 fallback | 构造器在 `quality.level===2` 时直接 resolve，既不建 loader 也不注册实模 entry | 独立网络 probe：`glbRequests=[]`；hero 不存在，程序化塔存在且 visible | ✅ |
| 加载失败 fallback | `loadOne()` catch 后保留 `ThemeTowers`，输出明确 warning；不阻塞 city ready | Playwright route 主动 abort GLB：warning 命中；hero 不存在，程序化塔存在且 visible，世界仍 ready | ✅ |
| 热切档 | 已加载 entry 在 quality change 时切 hero/fallback visible，并同步 enable/disable 道具 body | 静态核对成立；本段专项要求是挂载 Q2 与失败回退，两条均已 fresh probe | ✅ |

首幕不能被 POI 收益“代打”：candidate 与 main robot-idle 的主体、机位、左侧楼群、HUD
一致，变化集中在右缘 `autodrive-lab`/街角。POI 同机位对照才显示显著升级，因此 V1
持平，V2/V4/V7 分别按材质、密度、智驾叙事归位，不重复计分。

## 3. GLB、预算与资产治理

### 3.1 独立解析

直接解析 GLB JSON chunk：

| 项 | 实测 | 合同 | 判定 |
|---|---:|---:|:---:|
| 文件体积 | 157,444 B（153.8 KiB） | ≤10MB | ✅ |
| indexed triangles | 4,622 | ≤100,000 | ✅ |
| mesh / primitive / material | 13 / 13 / 13 | — | ✅ |
| Draco | 13/13 primitive 含 `KHR_draco_mesh_compression`，且 required | 必须 | ✅ |
| KTX2 | 3/3 image MIME=`image/ktx2`，`KHR_texture_basisu` required | 必须 | ✅ |
| 贴图数量 | 3（窗内景/幕墙/工具 atlas） | ≤2K/张 | ✅（源脚本 1024/1024/256） |
| GLB SHA-256 | `1a96e517e114bb76d4995fac03afd78d9b47f5bba668a85f7c6a71d45be46a17` | 留档 | ✅ |

`extensionsUsed` 同时含 `KHR_materials_emissive_strength`；材质名 13 个与 README 合同一致。
体积小不能单独证明压缩成立，本审计以容器 extension + MIME + accessor 计数为准。

审计机同时具备 Blender 4.0.2 与 `toktx`。按 README 三段命令从脚本 fresh 生成 raw GLB，
再跑 ETC1S → Draco，得到 **157,444 B 且 SHA-256 与入库 GLB 字节级完全相同**；生成器
是可复现源，不是只写了命令但无法还原的说明文件。

### 3.2 工程预算

`node scripts/audit-budget.mjs`（exact tree）：

- world JS：**85.8/900KB gzip**；
- world 资产池：**5.3/12MB**；
- public 总量：**8.9/40MB**；
- `/` 壳：**86.5/90KB**；
- poster：**39.7/40KB**；
- `.blend/.wav/.band/*encoder*` 黑名单：0。

预算全部通过，且 Q2 probe 证明不是“磁盘预算通过、止损档仍偷拉 GLB”。

### 3.3 台账缺口

`public/models/autodrive-lab/README.md` 写明“台账正本见
`docs/spec/asset-ledger-cyber-city.md`”，但该正本没有 `AutodriveLab.glb`、体积、
原创来源、生成脚本或 SHA 条目。资产是仓内原创、没有第三方许可风险；问题是治理事实与
README 声明不一致。合流前必须补一行正本台账，不能只靠模型目录 README 代替。

## 4. Rubric v1.1 独立视觉复评

沿用原权重与锚点，不因 70 门线改秤；先看 candidate/main fresh 帧，再用代码解释。

| 维 | AL5 | BL1 目标/预期 | AL-BL1 独立 | 依据 |
|---|---:|---:|---:|---|
| V1 首幕构图 | 65 | — | **65** | 相机、主体、poster、HUD 零改；首幕新增只占右缘局部，不能当新 definitive shot |
| V2 光照材质 | 71 | — | **74** | KTX2 幕墙/窗内景/工具 atlas、PBR 金属与暖光展厅在 POI 明显摆脱平涂；但只覆盖一栋，亮展厅仍有大面积均匀白块，全局 IBL/tone mapping 未做 |
| V3 色彩氛围 | 69 | — | **69** | 橙/青/暖白遵守既有色轴；没有改变全城明暗节奏或综合色相 |
| V4 场景密度 | 60 | 68–72 | **70** | 一个关键 POI 已有实模楼体细节 + 充电/测试/设备叙事层，满足 70–85 段下沿；但首幕可见收益有限、仅一角覆盖，不能给 71+ |
| V5 动效转场 | 70 | — | **70** | 无新动画、运镜或转场节拍 |
| V6 UI/HUD | 73 | — | **73** | DOM/HUD/poster 零改 |
| V7 原创叙事 | 73 | — | **75** | 试车台、充电设施、标定板与展车把“智驾实验楼”从楼名推进到可见物件；仍是单点，城市总体叙事不变 |

V4 相对 AL5 为 `+10`，触发反通胀差异说明：AL5 的 60 来自程序化楼只有收分体量、
招牌和少量假室内；BL1 的 POI 帧第一次同时出现手工轮廓、逐窗几何、入口/展厅、试验车、
充电/标定类街道物件，跨过 70 段下沿有双证。没有给更高分，是因为 robot-idle 全帧改动
仍小、沿街覆盖只有一角、道具在默认 POI 构图中被遮住一部分。

自评合理性：

- V4 目标带 68–72 vs 独立 70：独立值在带内，端点最大差 2；
- 整体目标带 71–74 vs 独立 70：端点差 1–4，保守最大差 4；
- 因此按区间声明计算仍满足 `|Δ|≤5`。候选没有提交一个最终单值自评，故报告不伪造
  “自评=某个数”；生产 JSON 只登记本审计独立 70。

## 5. exact tree 验证

### 5.1 `astro check` / build / budget

- `astro check`：129 files，**0 errors / 0 warnings / 58 hints**；
- build：19 pages；
- budget：见 §3.2，全部阻断门通过。

### 5.2 全量 e2e 与测试隔离纠错

第一次本地全链指定 4327，但 `run-quality-loop.mjs` 的“有服务即复用”策略命中了 AL5
遗留 preview。该轮虽为 52/52，fresh hero probe 随后明确找不到
`city-hero-glb-autodrive-lab`，证明它不是 BL1 被测树；本审计不把该绿灯冒充候选结果。

随后在独占端口 4341 从 `/tmp/cc-al-bl1-exact/dist` 显式启动 preview，并将 e2e 与 LHCI
都指向 4341，才作为 exact-tree 结果。最终结果：

- 全量 e2e：**52 passed / 0 failed / 0 skipped / 0 flaky**；
- Playwright `retries=0`；
- `VIS-02/03/04 @smoke3d`：**3/3**；
- fresh 专项 probe：1/1，覆盖 Q0 hero、main 对照、autodrive POI、Q2 zero-request、
  GLB abort fallback。

### 5.3 LHCI

本地独占端口 full collect：7 URL ×3 = 21 LHR，collect/assert 均 exit 0：

- `/website/`：Performance / Accessibility / Best Practices / SEO =
  **100 / 100 / 100 / 100**；
- `/website/home/`：**100 / 100 / 100 / 100**；
- 相对 AL5 的两 URL全 100：零下降。

同 SHA CI run
[33019188266](https://github.com/rayw-lab/website/actions/runs/33019188266) 也为 green；
`lighthouse-results` artifact id `9625901076`，digest
`sha256:8ccf309d03ce6b462638636034232d57959eb70e4a1985091b05c92e52e73077`。
CI artifact 为 21 LHR，`/` 与 `/home/` 四项中位数同为全 100；本地不是 null，
所以最终计分采用本地 exact-tree LHR，CI artifact 作为同 SHA 交叉证据。

## 6. 统一计分器复算

| 维度 | exact 分数 | 权重 | 加权 |
|---|---:|---:|---:|
| LHCI `/` | 100 | .25 | 25.00 |
| LHCI `/home/` | 100 | .15 | 15.00 |
| e2e | 100 | .20 | 20.00 |
| 独立视觉 | **70** | .25 | 17.50 |
| 3D smoke | 100 | .15 | 15.00 |
| **合计** |  | **1.00** | **92.50** |

单源命令以独立视觉复算：

```text
node scripts/score-loop.mjs --visual-score 70
COMPOSITE_SCORE=92.5
availableWeight=1
missing=[]
```

生产登记采用独立 **70 / 92.5**；不登记目标带上沿 72 或提交方整体预期 71–74。

## 7. 硬门逐行

| 硬门 | 实测 | 判定 |
|---|---|:---:|
| exact tree e2e 52/52 | 独占 4341 preview；52 passed，0 retry/failed/skipped/flaky | ✅ |
| smoke3d | VIS-02/03/04 = 3/3 | ✅ |
| LHCI `/`、`/home/` 不降 | 本地 exact 两 URL四项全 100；同 SHA CI artifact 交叉一致 | ✅ |
| `availableWeight===1`、`missing=[]` | `1`、`[]` | ✅ |
| 视觉双评 `|Δ|≤5` | V4 带最大差 2；整体带最大差 4 | ✅（区间口径） |
| 综合 ≥85 | 独立 92.5 | ✅ |
| V4 是否过 70 | 独立 70 | ✅ 若门为 `>=70`；❌ 若要求严格 `>70` |
| GLB ≤10MB / ≤100k tri | 157,444 B / 4,622 tris | ✅ |
| Draco + KTX2 | 13/13 Draco；3/3 KTX2；required extensions 齐 | ✅ |
| Q2 zero-request | GLB requests `[]`，程序化塔 visible | ✅ |
| 加载失败 fallback | abort GLB 后程序化塔 visible、世界 ready | ✅ |
| 受保护面零差异 | `scripts/blender/generate-autodrive-lab.py` +832 行 | ❌ |
| 资产台账事实一致 | README 指向正本，但正本无条目 | ❌ |

## 8. 裁决与合流条件

裁决：**有条件放行（当前禁止合流）**。

视觉专项与运行时 fallback 均成立，不需要推倒重做；但两项确定缺口必须在 PR #42 清账：

1. 把 `scripts/blender/generate-autodrive-lab.py` **原样**搬到非保护目录
   `tools/blender/generate-autodrive-lab.py`（或父任务书先显式修改保护面；本审计推荐搬移），
   同步 README 复现命令；
2. 在 `docs/spec/asset-ledger-cyber-city.md` 增补 `AutodriveLab.glb` 正本条目：原创来源、
   生成脚本、157,444 B、4,622 tris、Draco+KTX2、SHA-256；
3. 清账提交必须证明 GLB SHA-256 仍为
   `1a96e517e114bb76d4995fac03afd78d9b47f5bba668a85f7c6a71d45be46a17`，
   且 `git diff <清账基线>..<新 tip> -- e2e playwright.config.ts lighthouserc.json scripts
   .github/workflows` 为零；
4. 新 tip 跑 `astro check` 与 CI；若只搬生成器/补台账且 GLB、`src/` 字节不变，可复用本审计
   的视觉/e2e/LHCI 结论。任何 GLB 或运行时字节变化都必须重做 fresh 帧、52/52 与 fallback。

父代理满足四项后方可合流；不要把“有条件放行”当天然 merge。

## 9. 下轮建议

条件清账后，BL2 只沿已验证资产语言扩一个相邻沿街段，不立即全城铺 GLB：

1. 目标锁定 **V4 72–75**，仍用独立分判门；BL1 的 V4=70 是管线成立，不是全城密度完成；
2. 证据继续用同一 robot-idle + `?poi=autodrive-lab` + 驾驶推进三视角。当前首幕收益只在
   右缘，BL2 必须让新增轮廓在 whole-frame 可读，不能只靠近摄像机 POI；
3. 保留每栋独立 `heroGlb`、Q2 零请求、加载失败 `ThemeTowers`，并为每栋逐笔登记
   GLB/tri/Draco/KTX2/资产池；
4. tone mapping 等实模沿街密度达到稳定档后再开；poster 仍排 runtime 最后一段。

## 10. 证据路径与 digest

| 证据 | 路径 | SHA-256 |
|---|---|---|
| exact Q0 robot-idle | `/opt/cursor/artifacts/cc-al-bl1-candidate-robot-idle.png` | `b536415272c0bc74c265fb23299649d47f8aff2e1c57fcf88a79b5d78cc3b519` |
| main Q0 robot-idle | `/opt/cursor/artifacts/cc-al-bl1-main-robot-idle.png` | `45436ec81a3e1c0915bc394342ae703d5a70bdeacf2f434d63ab8852043edbd3` |
| exact autodrive POI | `/opt/cursor/artifacts/cc-al-bl1-candidate-autodrive-poi.png` | `c1dfb9dbb2485481d46ff5e37c339e152358e82097c6187a4422f906cfa3fec4` |
| main autodrive POI | `/opt/cursor/artifacts/cc-al-bl1-main-autodrive-poi.png` | `e7aae1f539833f6a69356c8875547732af0c670f168d5622c70d6bf68a10913f` |
| GLB | `public/models/autodrive-lab/AutodriveLab.glb` | `1a96e517e114bb76d4995fac03afd78d9b47f5bba668a85f7c6a71d45be46a17` |
| CI LHCI artifact | run 33019188266 / artifact 9625901076 | `8ccf309d03ce6b462638636034232d57959eb70e4a1985091b05c92e52e73077` |

---

*CC-AL-BL1 · 审计分支只提交本报告与独立 score JSON；零业务代码、测试逻辑、阈值、
workflow 或像素基线改动。*
