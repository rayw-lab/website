# Cyber City Loop 3 B2C 内容一致性审计（CC-AL3-B2C）

| 项 | 内容 |
|----|------|
| 审计对象 | PR [#36](https://github.com/rayw-lab/website/pull/36) `cursor/cc-l3-content-poster-1d6f@2803f4d` |
| 实际比较基线 | `main@76950e7`（merge-base 同为 `76950e7`） |
| 任务所给 SHA | `b81e8a1`：本地完整 refs 与 GitHub Commit API 均无法解析；本报告不把它伪记为已审对象 |
| 审计分支 | `cursor/cc-al3-b2c-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 状态 | **审计完成 · AL2 §7 #1/#2 销账 · 独立视觉 65 · 放行 CC-L3-ATM** |

## 0. 最终裁决

**AL2 §7 非阻塞保留项 #1（poster 三面漂移）与 #2（B2 灯箱无 TextCanvas
内容）均可销账；放行 CC-L3-ATM 分层雾/低云带单主题批。**

1. B2 的 10 件挂旗灯箱已从通用条纹板升级为单张 `TextCanvas` atlas 驱动的
   10 条差异化广告文案。fresh 首幕可直接读到近位 `AI CORE`，`DRIVE`/远位亮板
   形成次级广告层；fresh garage POI 可读 `TUNE-UP`。不是“10 件在任一首幕帧全部
   可读”，但已经满足主视角和 POI 各有帧内可读内容的收口口径。
2. 广告内容没有新增 mesh：共享几何、共享 atlas，按道路色族仍只有两个
   `InstancedMesh`。因此 B2 主场景几何台账仍为 **2 draw calls / render pass**；
   阴影、反射等多 pass 会重复提交，但与 AL2 前实现相比没有新增 draw-call 单元。
3. desktop 1280×720、mobile 720×1280 已在同一最后提交重拍；`og:image` 继续复用
   desktop 文件。两图分别 39,632 / 35,776 bytes，均过 40KB 门，reduced-motion、
   无 3D、移动壳与 OG 三面恢复到当前 Tier B 城市。
4. exact candidate fresh 全量 Playwright **52 passed / 0 failed / 0 skipped**，
   17.2 分钟；`VIS-02/03/04 @smoke3d` **3/3**。测试逻辑、配置和阈值未改，`e2e/`
   唯一候选差异是经审阅更新的 VIS-01 静态壳像素基线。
5. candidate 与 exact `main@76950e7` 的 CI Lighthouse 均为 7 URL ×3 轮；
   `/website/` 与 `/website/home/` 四项中位均值均为 **100**，零下降，assert exit 0。
6. 提交方自评 66；本审计按 rubric v1.1 独立复评
   **64.90 → 65/100**，`|65-66|=1≤5`，且 65 高于独立视觉底线 62。
7. 用独立视觉 65 复算 `COMPOSITE_SCORE=91.3`；
   `availableWeight: 1`、`missing: []`。自评 66 口径为 91.5。

## 1. 审计边界与 SHA 校正

任务写明“vs `main` @ `b81e8a1`”，但该短 SHA 在本地全部 refs、指定仓库的 GitHub
Commit API 中均不存在。审计时远端规范仓库（`rayw-lab/mywebsite` 已重命名并重定向到
`rayw-lab/website`）的实际指针为：

- `main@76950e78502fe932ee9bf85f6b6ca960a12f5b2e`；
- `cursor/cc-l3-content-poster-1d6f@2803f4dd37ed8e968814cc0a899e027c57267a81`；
- merge-base `76950e7`，候选线性领先 4 commit、无基线侧分叉。

因此本报告只对上述可复现 exact pair 出结论。若 `b81e8a1` 原意是另一个未发布对象，
本裁决不能自动外推到那棵树。

`76950e7..2803f4d` 共 11 个文件、`+205/-28`：

- 运行时：`StreetLamps.ts`、`NeonMaterials.ts`；
- poster：desktop、mobile、VIS-01 壳基线；
- 视觉证据：首幕、POI、青/品红灯箱特写 4 帧；
- 登记：工程 notes 与视觉 score JSON。

候选没有修改 Playwright 用例、`playwright.config.ts`、`lighthouserc.json`、
计分器、预算/链接脚本、workflow、依赖清单或锁文件。

## 2. AL2 §7 #1/#2 销账核验

| 保留项 | 最终树代码/资产证据 | fresh 帧判断 | 裁决 |
|--------|--------------------|----------------|:---:|
| #2 B2 灯箱 TextCanvas 内容 | `SLOGANS` 10 条与 10 灯位同序；`buildAdsAtlas()` 用 308×1280 单画布分 10 行；材质以 `instanceIndex + rowStart` 选行并按 ±Z 面镜像正读；没有外部字体或图片 | 首幕近位 `AI CORE` 可直接读，`DRIVE` 与远位反相亮板提供第二层；garage POI 近位 `TUNE-UP` 可读；双色特写确认青/品红两族和正读方向 | ✅ |
| #1 desktop/mobile/OG poster 三面 | desktop/mobile 同在 `843a4c9` 重拍；`<picture>` 以 767.98px 切 720×1280 mobile；desktop 为 1280×720；`og:image` 与 desktop 同 URL | VIS-01 fresh 像素基线包含当前招牌、灯杆内容和增密天际线；desktop 与 mobile 都不再是 A-plus 前帧，移动端为独立竖构图 | ✅ |

### 2.1 帧内可读性的边界

“内容存在”与“任意距离都能读”需分开。主机位中 `AI CORE` 是稳定可辨的近位锚点；
右侧 `DRIVE` 和远位反相板字号更小，作为广告层成立，但在 1440×900 全帧 1:1 下不应
包装成三块同等强度的正文。POI 帧的 `TUNE-UP` 距离近、轮廓和字形清楚，补足第二关键
视角。

据此，本审计确认 AL2 的“灯箱仍是通用发光板”判词已销账，但不接受“10 条文案在
首幕同时可读”的扩大宣称。后续分层雾不得让目前有限的可读余量再次丢失。

### 2.2 draw-call 纪律

`StreetLamps.setVisuals()` 仍只遍历 `north-south` / `east-west` 两个色族，每族创建
一个 `InstancedMesh`；杆、臂、灯头、灯箱继续合并为一份几何。新增内容只发生在同一
材质节点内：

1. 两族共用一张 TextCanvas atlas；
2. `instanceIndex` 在 shader 内选 atlas 行；
3. 描边、反相和双面正读都是材质表达式，没有增加几何、材质组或独立文字 mesh。

因此 rubric B2 的“InstancedMesh 1–2 draw call”按主场景几何台账继续为 **2**。
这是对象级、每 render pass 的口径，不等同于 `renderer.info` 的全场总调用数；阴影图
与 Q0 反射 pass 本来就会重绘可见对象，但本批没有增加 B2 的提交单元。

### 2.3 poster 三面与预算

| 面 | 文件/接线 | 实测 |
|----|-----------|------|
| desktop 壳 / Lab 卡 | `cyber-city-poster.webp` | 1280×720，39,632 bytes，≤40KB |
| mobile 壳 | `cyber-city-poster-mobile.webp` | 720×1280，35,776 bytes，≤40KB |
| Open Graph | `og:image` 复用 desktop 文件 | 1280×720，同源无第四份漂移资产 |

预算脚本 fresh 结果：G-A′ poster 38.6/40KB、壳静态段 82.2/90KB、world JS
82.2/900KB、world 资产池 5.2/12MB、受保护 14 页 world 命中 0，全部阻断门通过。

## 3. 独立视觉复评

沿用 `cyber-city-visual-rubric.md` v1.1、CC-AL2 的独立逐维分为校准基线，并严格执行
“帧内看不见不加分”。

| 维 | AL2 独立 | L3 自评 | AL3-B2C 独立 | 复评依据 |
|----|:---:|:---:|:---:|------|
| V1 首幕构图 | 61 | 64 | **63** | poster 漂移销账，首幕也新增一个稳定文字锚；但机位、主体比例、道路消失点均未变，楼顶字上沿仍裁切，不把资产同步等同构图重做 |
| V2 光照材质 | 65 | 65 | **65** | 光照、雾、IBL/AO 零改；广告沿用既有 emissive，维持 50–65 段顶，不预支分层雾收益 |
| V3 色彩氛围 | 69 | 69 | **69** | atlas 是无色 mask，两路仍取 NEON 青/品红；未引入杂色，也未修 Roads/Grid 派生线性常量 |
| V4 场景密度 | 53 | 59 | **57** | 灯箱从条纹板变成真实广告基础设施，主帧和 POI 均有可读实例，收益成立；但全帧稳定直读数量有限，5 栋 hero 覆盖、零车流/雨丝/光轨等扣分仍在 |
| V5 动效转场 | 63 | 63 | **63** | 零动画/镜头变化，9.4s 既有证据继续有效，不重复加分 |
| V6 UI/HUD | 72 | 74 | **73** | reduced-motion、mobile、OG 与 runtime 视觉重新同源，壳连续性有一档收益；DOM/HUD 本体零改，故只加 1 |
| V7 原创叙事 | 72 | 73 | **73** | 产品线语义从楼名延伸到街道广告，garage/TUNE-UP 同帧自洽；核心世界观未重构 |

`63×.20 + 65×.20 + 69×.15 + 57×.15 + 63×.15 + 73×.10 + 73×.05`
`= 64.90 → 65/100`。

**双评纪律通过：** `|65-66|=1≤5`。与 AL2 独立 64 相比只上升 1 分，符合本批“内容
一致性收口而非主视觉重做”的边界；65 同时稳定高于 62 底线。

## 4. e2e、LHCI、`availableWeight`

### 4.1 fresh exact-tree e2e

在 `2803f4d` 上恢复冻结锁文件依赖与仓库对应 Chromium 后执行 `pnpm test:e2e`：

| 项 | 结果 |
|----|------|
| build | PASS，19 pages |
| Playwright | **52 passed / 0 failed / 0 skipped / 0 flaky**，17.2m |
| CITY 世界剧本 | CITY-E2E-01…06 全过 |
| 3D smoke | VIS-02/03/04 **3/3** |
| VIS-01 | 新 poster 的审阅基线匹配 |
| fresh 首幕 | canvas 非空，robot_idle 落定；`AI CORE` 可读 |
| fresh POI | canvas 非空，parkingBay 出生断言通过；`TUNE-UP` 可读 |
| 软件光栅性能 | 约 2.0fps，为既有 OBS 软门禁；不包装成真机性能 PASS |

全量测试重写的历史说明截图已恢复，未进入审计提交。

### 4.2 exact main 与 candidate LHCI

| 树 | GitHub Actions | URL | Perf | A11y | BP | SEO | 四项均值 |
|----|----------------|-----|:---:|:---:|:---:|:---:|:---:|
| `main@76950e7` | [32928227294](https://github.com/rayw-lab/website/actions/runs/32928227294) | `/website/` | 100 | 100 | 100 | 100 | **100** |
| `main@76950e7` | 同上 | `/website/home/` | 100 | 100 | 100 | 100 | **100** |
| `2803f4d` | [32934162688](https://github.com/rayw-lab/website/actions/runs/32934162688) | `/website/` | 100 | 100 | 100 | 100 | **100** |
| `2803f4d` | 同上 | `/website/home/` | 100 | 100 | 100 | 100 | **100** |

两边都是 7 URL ×3 = 21 份 LHR；candidate 日志为
`Checking assertions against 7 URL(s), 21 total run(s)` →
`All results processed!`，exit 0。两个计分 URL 相对 main **零下降**。

### 4.3 五维齐套复算

| 维度 | 分数 | 权重 | 独立加权 |
|------|---:|---:|---:|
| LHCI `/` | 100 | 0.25 | 25.00 |
| LHCI `/home/` | 100 | 0.15 | 15.00 |
| e2e | 100 | 0.20 | 20.00 |
| 独立视觉 | 65 | 0.25 | 16.25 |
| 3D smoke | 100 | 0.15 | 15.00 |
| **合计** |  | **1.00** | **91.25 → 91.3** |

计分器产物为 `availableWeight: 1`、`missing: []`。代入提交方视觉 66 时为 91.5；
两种口径均稳定高于 85。

## 5. CC-L3-ATM 放行边界

**裁决：GO，放行 CC-L3-ATM 分层雾/低云带；只放行一个大气主题。**

放行理由：

1. ATM 的前置债务已销账，独立视觉 65 ≥62，双评差 1；
2. e2e、smoke、LHCI、预算、五维覆盖全部绿；
3. V2 仍停在 65 段顶，分层雾正是 AL2 已裁定的下一项高收益主题，归因清晰。

实施与下一审计硬边界：

1. 本批不得夹带 B3 飞行光轨、B5 运镜、招牌扩楼、车流或新资产管线；
2. 必须提交 robot_idle 与 garage POI 同机位前后帧，证明远近雾层可分、机器人剪影、
   道路消失点、北向天空开口和当前 `AI CORE` / `TUNE-UP` 可读性不回退；
3. V2 只有在帧内出现可辨的近/中/远大气层次时才能越过 65，代码中多一个 fog 对象
   不自动加分；
4. 明确 Q0/Q1/Q2 与 WebGL 2 的降档行为；不得把第二次全景渲染或无界透明 overdraw
   包装成“雾层”；
5. ATM 改变 runtime 画面后，desktop/mobile/OG poster 必须在该批最后再次重拍，
   否则本次刚销账的 #1 会立即重新打开；
6. 合并前继续保持 e2e 52/52、LHCI 两计分 URL 不降、`availableWeight===1`、
   独立视觉 ≥62 与 `|自评-独立|≤5`。

本次 **不预授 ATM 的视觉增量分**；放行只代表可以施工，不代表 V2 已进入 70–85 段。
