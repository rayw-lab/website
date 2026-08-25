# CC-GH1：GitHub 高端 3D H5 / 游戏类开源调研 + 公共素材决议

| 项 | 内容 |
|----|------|
| Task ID | **CC-GH1** |
| 版本 | v1.0 |
| 日期 | 2026-08-25 |
| 执行 | Fable5（claude-fable-5-thinking-xhigh） |
| 上游决策 | 王磊拍板 D1–D4（见 `cyber-city-hero-design-proposal.md` §6）：`/` 全屏赛博座舱科技城；机器人资产由本 Task 联网自决；高端不降级；变形后十字路口 WASD 可操作；大楼 10–20 栋可扩展 |
| 方法 | Web 搜索 + GitHub REST API 精确核数（stars / SPDX 许可 / 文件体积）+ Sketchfab API 许可抽样 |
| 引用约定 | **本文所有 URL 访问日期均为 2026-08-25**；stars 与许可证均为当日 GitHub API 实测值 |
| 红线 | 本站 vanilla three + TSL，禁 R3F/React 进运行时；可借算法与思路重写；本文只产文档、不改 `src` |

---

## 0. 三大决议速览（先读这里）

1. **城市程序化代码主引擎 = three.js 官方 `CityGenerator` 家族（MIT）**。r185 新增的 `examples/jsm/generators/CityGenerator.js` + `city/SkyscraperGenerator.js`（60.9KB）+ `city/SidewalkGenerator.js`（9.2KB）+ `createRoadMaterial`（TSL 湿沥青含车道线/斑马线），与本站 `three ^0.185.1` **同版本零升级直用**，且全部是 TSL 节点材质——正中本站技术路线。摩天楼风格从「新哥特陶土」改写为「赛博玻璃幕墙 + emissive 窗格」即可。
2. **机器人最终推荐 = Quaternius CC0 机甲为基底 + kitbash + 本站 TSL 重制材质**。主选 [Quaternius Animated Mech Pack](https://quaternius.com/packs/animatedmech.html)（4 台人形机甲、带动画、CC0），部件增补自 [Cyberpunk Game Kit](https://quaternius.com/packs/cyberpunkgamekit.html)（71 模型、CC0）；开发期占位用 three.js 官方 `RobotExpressive.glb`（CC0、实测 453KB、14 动画剪辑）。CC0 = 零署名义务、可改可商用、无 Transformers IP 链条（详见 §3）。
3. **纹理与环境素材全部走 CC0 三大源**：Kenney（City Kit Roads/Commercial/Car Kit，单包 zip 2.3–4.8MB）、Quaternius（Downtown City MegaKit 300+ 件）、Poly Haven / ambientCG（夜景 HDRI 与 PBR 纹理）。霓虹/窗格/湿地面优先程序化（TSL），纹理只作补充，首屏纹理预算 ≤1MB（KTX2 压缩后，见 §4.3）。

---

## 1. 调研范围与许可分级框架

### 1.1 检索面

- GitHub：Three.js / WebGPU / TSL 城市生成、浏览器驾驶游戏、赛博朋克场景、作品集世界类仓库（王磊点名 6 个 + 交叉发现 26 个）。
- 素材站：Sketchfab（API 按许可过滤抽样）、Kenney、Quaternius、Poly Pizza、Poly Haven、ambientCG、OpenGameArt。
- 本仓已有：`vendor/folio-2025`（MIT，已 teardown）、`vendor/folio-2019`（MIT）。

### 1.2 许可分级（本站执行标准）

| 级别 | 许可 | 本站可做什么 | 义务 |
|------|------|--------------|------|
| **绿·代码** | MIT / BSD-3 / Apache-2.0 / Zlib | 直接 vendor、改写、进 bundle | 保留版权声明（集中放 `docs/spec/third-party-notices.md` 或构建注释） |
| **绿·资产** | CC0 | 下载、改色、重拓扑、进 `public/models/` | 无（自愿致谢） |
| **黄** | CC-BY 4.0 | 可商用可改 | **必须署名**（页脚 credits + NOTICE） |
| **橙** | LGPL-3.0 | 只用其**离线工具产出的数据**（如路网 JSON），代码不进 bundle | 避免静态链接争议 |
| **红·思路** | 无 LICENSE（默认保留所有权利）/ NOASSERTION | 只借架构思路、参数手感、交互设计，**零代码复制** | 文档留痕即可 |
| **红·禁用** | CC-BY-NC（含文件级）、游戏拆包冒充 CC、商标 IP | 不碰 | — |

> 关键陷阱实证：① HexGL 根目录是 MIT，但运行时与 Cityscape 赛道文件头逐文件标注 CC BY-NC 3.0——**根 LICENSE ≠ 全仓可用**，必须查文件头（[github.com/BKcore/HexGL](https://github.com/BKcore/HexGL)，访问 2026-08-25）。② Sketchfab 热门「CC-BY」结果里混有 FNAF 等游戏拆包模型（上传者无权授权，署名也无效），Sketchfab 许可标签**不可尽信**，需核验作者原创性（Sketchfab API 抽样，2026-08-25）。

---

## 2. 仓库盘点（32 个，stars/许可为 2026-08-25 GitHub API 实测）

### 2.0 总表

| # | 仓库 | Stars | 许可 | 一句话 | 级别 |
|---|------|-------|------|--------|------|
| 1 | [mrdoob/three.js](https://github.com/mrdoob/three.js) | 114,766 | MIT | `CityGenerator` 官方城市生成器 + 全部 TSL 示例 | 绿 |
| 2 | [ryanfitzpatrickio/threejs-playground](https://github.com/ryanfitzpatrickio/threejs-playground) | 85 | MIT | WebGPU/TSL 游戏机制百科：城市 chunk、雨湿材质、POM | 绿 |
| 3 | [jeffbeene/synthcity](https://github.com/jeffbeene/synthcity) | 195 | MIT | 无限程序化赛博城市（滚动分块 + 霓虹） | 绿 |
| 4 | [ryanfitzpatrickio/san_verde](https://github.com/ryanfitzpatrickio/san_verde) | 1 | **无 LICENSE** | WebGPU 开放世界开车（三 0.183 TSL） | 红·思路 |
| 5 | [cyrus2281/night-city](https://github.com/cyrus2281/night-city) | 9 | BSD-3 | 赛博城探索 + 彩蛋定位系统（React 栈） | 绿（代码）/思路 |
| 6 | [SeloSlav/cyberpunk-apartment](https://github.com/SeloSlav/cyberpunk-apartment) | 3 | **无 LICENSE** | 第一人称赛博公寓，WebGPURenderer 双后端 | 红·思路 |
| 7 | [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025) | 1,761 | MIT | 本站引擎腿来源（vendor 已入仓） | 绿 |
| 8 | [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) | 4,734 | MIT | 车落地弹跳 / 驾驶导航鼻祖 | 绿 |
| 9 | [brunosimon/infinite-world](https://github.com/brunosimon/infinite-world) | 628 | **无 LICENSE** | Bruno 无限程序化世界实验 | 红·思路 |
| 10 | [swift502/Sketchbook](https://github.com/swift502/Sketchbook) | 1,748 | MIT | 第三人称角色 + RaycastVehicle 悬挂手感（已归档） | 绿 |
| 11 | [pmndrs/racing-game](https://github.com/pmndrs/racing-game) | 2,211 | MIT | R3F 赛车：手感参数与关卡结构 | 绿（禁 R3F 运行时，借参数） |
| 12 | [BKcore/HexGL](https://github.com/BKcore/HexGL) | 1,736 | MIT + 文件级 CC BY-NC | 未来感竞速：速度感/HUD 设计 | 黄→红（资产禁用） |
| 13 | [ProbableTrain/MapGenerator](https://github.com/ProbableTrain/MapGenerator) | 1,414 | LGPL-3.0 | 张量场美式城市路网生成 | 橙（离线产数据） |
| 14 | [0beqz/realism-effects](https://github.com/0beqz/realism-effects) | 1,710 | MIT | SSGI/TRAA/运动模糊 | 绿（思路→TSL 重写） |
| 15 | [0beqz/screen-space-reflections](https://github.com/0beqz/screen-space-reflections) | 589 | MIT | 湿地面 SSR 屏幕空间反射 | 绿（思路→TSL 重写） |
| 16 | [protectwise/troika](https://github.com/protectwise/troika) | 1,965 | MIT | troika-three-text SDF 文字（支持 vanilla three） | 绿 |
| 17 | [lo-th/phy](https://github.com/lo-th/phy) | 736 | MIT | 多物理后端封装 + 载具 demo | 绿 |
| 18 | [dimforge/rapier.js](https://github.com/dimforge/rapier.js) | 696 | Apache-2.0 | Rapier 官方 JS 绑定（已迁至 [dimforge/rapier](https://github.com/dimforge/rapier/tree/master/typescript) monorepo） | 绿 |
| 19 | [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | 3,460 | MIT | BVH 射线/碰撞加速（synthcity 同款） | 绿 |
| 20 | [gkjohnson/three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) | 942 | MIT | CSG 布尔运算（san_verde 同款） | 绿 |
| 21 | [achrefelouafi/RainSystemThreeJS](https://github.com/achrefelouafi/RainSystemThreeJS) | 27 | MIT | 雨系统（playground 雨湿节点的上游） | 绿 |
| 22 | [SkyeShark/SeedThree](https://github.com/SkyeShark/SeedThree) | 86 | MIT | WebGPU 程序化树木/植被 | 绿（可选绿化） |
| 23 | [SkyeShark/threejs-silhouette-pom](https://github.com/SkyeShark/threejs-silhouette-pom) | 37 | MIT | WebGPU/TSL 轮廓视差遮挡贴图 | 绿 |
| 24 | [mmikk/hextile-demo](https://github.com/mmikk/hextile-demo) | 1,029 | MIT | 六角平铺防纹理重复 | 绿 |
| 25 | [mauriciopoppe/Three.js-City](https://github.com/mauriciopoppe/Three.js-City) | 233 | NOASSERTION | 2013 老牌城市开车 demo | 红·思路 |
| 26 | [poojagosika/drive-my-portfolio](https://github.com/poojagosika/drive-my-portfolio) | 0 | **无 LICENSE** | F1 开车逛作品集（E 键进区） | 红·思路 |
| 27 | [chiubaca/mecha-portofolio](https://github.com/chiubaca/mecha-portofolio) | 0 | **无 LICENSE** | 线框机甲部位=技能映射 | 红·思路 |
| 28 | [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | 2,835 | Zlib | WebGL 后处理参考（本站走 TSL PostProcessing） | 绿（参考） |
| 29 | [simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera](https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera) | 65 | MIT | 第三人称跟车相机 lerp 教学 | 绿 |
| 30 | [donmccurdy/three-pathfinding](https://github.com/donmccurdy/three-pathfinding) | 1,368 | MIT | 导航网格（Phase 2 NPC 车流可用） | 绿 |
| 31 | [pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu) | 1,210 | MIT | GPU 分档降级决策 | 绿 |
| 32 | [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) | 1,052 | 逐模型（多 CC0/CC-BY） | 标准测试模型库 | 逐模型判 |

### 2.1 城市 / 世界生成组（详评）

**#1 mrdoob/three.js — `CityGenerator` 家族（MIT，114,766★）**
r185 经 [PR #33817](https://github.com/mrdoob/three.js/pull/33817)（已合并）引入，在线示例 [webgpu_generator_city](https://threejs.org/examples/webgpu_generator_city.html)。实测仓库文件：`examples/jsm/generators/CityGenerator.js`、`city/SkyscraperGenerator.js`（60,913B）、`city/SidewalkGenerator.js`（9,247B），另有 `TerrainGenerator` / `TreeGenerator` / `ForestGenerator`。
- **可借**：整套街区网格布局（`city.layout` 暴露给路面标线对齐）；单楼「footprint→faces→base/shaft/crown 分层→楼层/开间」的建模流水线；**每栋楼烘焙成单个非索引 BufferGeometry + 逐顶点 `partId`，一个 `MeshStandardNodeMaterial` 按 partId 分支——整楼一次 draw call**；TSL 程序化砖墙/风化/玻璃「假室内映射」/窗机；`createRoadMaterial` 湿沥青+车道线+斑马线全程序化；距离/顶点分辨细节降档。
- **不可借/需改**：默认「新哥特陶土 + 日落物理天空」审美需整体换皮为赛博夜景（换 palette、emissive 窗格、霓虹 trim）；示例的 `FirstPersonControls` 与 Inspector 不进生产。跟踪：[PR #33906「Improved city example」](https://github.com/mrdoob/three.js/pull/33906) 截至 2026-08-25 仍 open，合并后可增量吸收。
- **兼容性**：本站 `package.json` 已是 `three ^0.185.1`，**零升级成本**。

**#3 jeffbeene/synthcity（MIT，195★）**
[github.com/jeffbeene/synthcity](https://github.com/jeffbeene/synthcity)，作者自述见 [jeff-beene.com/portfolio/synthcity](https://jeff-beene.com/portfolio/synthcity/) 与 [three.js 论坛帖](https://discourse.threejs.org/t/synthcity-an-infinite-procedural-cyberpunk-city/59887)。2022 年起的无限程序化赛博城市：自动巡航/驾驶/自由漫游三模式、three-mesh-bvh 碰撞、合成波电台。
- **可借**：Perlin 噪声驱动的资产布置算法；无限世界的**分块生成/回收**节奏；霓虹楼宇的 emissive 密度控制（远看成海、近看有窗）；「autopilot 电影运镜」= 我们 T+0 入场镜头的现成参考；加载终端风 loading 屏。
- **不可借**：WebGL 一代管线（我们直接 TSL 化）；其音乐来自 Uppbeat 曲库（**许可不随仓库走**，音频不可搬）；整体飞行车视角与我们地面驾驶不同，物理需另起。

**#4 ryanfitzpatrickio/san_verde（无 LICENSE，1★）**
[github.com/ryanfitzpatrickio/san_verde](https://github.com/ryanfitzpatrickio/san_verde)，在线 demo [ryanfitzpatrickio.github.io/san_verde](https://ryanfitzpatrickio.github.io/san_verde/)。Three.js 0.183.2 WebGPU + TSL 节点材质 + Solid UI + `@perplexdotgg/bounce` 物理 + three-bvh-csg。特性：OSM 数据城市、悬挂/牵引/后驱扭矩曲线、6 层采样引擎音、AI 车流行人路网寻路、下车步行、车库换车、胎痕/扬尘/屏幕空间 GI。
- **可借（仅思路）**：「2D 关卡编辑器画路网 → 程序化建筑填充」的**数据驱动城市管线**（对我们 10–20 栋 JSON 单源地图极具参考价值）；WASD 驾驶 + 下车双模态的状态机划分；引擎音按 RPM/负载混层的方案。
- **不可借**：**无 LICENSE = 默认保留所有权利，任何代码/资产不得复制**；物理库 `@perplexdotgg/bounce` 为小众依赖不建议引入。

**#2 ryanfitzpatrickio/threejs-playground（MIT，85★）——本次调研最大意外收获**
[github.com/ryanfitzpatrickio/threejs-playground](https://github.com/ryanfitzpatrickio/threejs-playground)。san_verde 同作者的 MIT 实验场：three r185 WebGPU/TSL + Rapier + 城市无限 freerun（`cityChunkWorker.js` 分块 worker）、雨/湿/闪电天气节点（改自 RainSystemThreeJS）、POM、hex tiling、three.js CityGenerator 系 vendor 改造。README 明确记录了每个子系统的上游 lineage（可顺藤摸瓜）。
- **可借**：**雨湿共享 uniform 打法**（一个 wetness uniform 同时驱动沥青/楼面材质——正是我们「变形仪式城市灯光切换」需要的全局材质总线思路）；WebGPU **每片元 16 采样器预算**的 `DataArrayTexture` 规避法；skinned GLB 交错顶点属性在 WebGPU 破裂的 `flattenObjectForWebGPU` 反交错方案（**我们机器人 GLB 必踩的坑，提前免疫**）；远景天际线「廉价发光盒 + 窗条」LOD。
- **不可借**：Solid UI 层；未完成的玩法系统（钩爪/翼装）。

**#5 cyrus2281/night-city（BSD-3-Clause，9★）**
[github.com/cyrus2281/night-city](https://github.com/cyrus2281/night-city)，demo [night-city.netlify.app/world](https://night-city.netlify.app/world)。three + Rapier + React + TS + Git LFS，Blender 自建城。
- **可借**：BSD-3 允许带声明复制——其**位置定位系统（LocationSystem）**与彩蛋收集→解锁特性的设计可参考进我们「进楼触发」；Rapier 与 three 的同步写法。
- **不可借**：React 组件层（红线）；作者自建美术走 LFS，体积与风格均不适配。

**#6 SeloSlav/cyberpunk-apartment（无 LICENSE，3★）**
[github.com/SeloSlav/cyberpunk-apartment](https://github.com/SeloSlav/cyberpunk-apartment)。Vite 7 + React 19 + Three.js `WebGPURenderer`（WebGPU 优先、WebGL 自动回退）+ simplex-noise 程序化城市布局 + SpacetimeDB。
- **可借（仅思路）**：与本站相同的「WebGPURenderer 统一入口双后端」策略的实战验证（其 README 指出回退后 bundle 仍偏重——印证我们 facade 按需加载的必要）；窗外城市用 simplex-noise 布局的近似做法。
- **不可借**：无 LICENSE；React；SpacetimeDB 多人栈过重。

**#9 brunosimon/infinite-world（无 LICENSE，628★）**
[github.com/brunosimon/infinite-world](https://github.com/brunosimon/infinite-world)。Bruno 的无限程序化地形实验。仅借「视距分块 + 四叉树细分」思路；无 LICENSE 不可复制。

**#13 ProbableTrain/MapGenerator（LGPL-3.0，1,414★）**
[github.com/ProbableTrain/MapGenerator](https://github.com/ProbableTrain/MapGenerator)。张量场生成美式城市路网，可导出。**用法裁决**：作为**离线工具**生成我们十字路口/主干道的路网 JSON（工具产出数据不受 LGPL 传染），代码不进 bundle。

**#25 mauriciopoppe/Three.js-City（NOASSERTION，233★）**
[github.com/mauriciopoppe/Three.js-City](https://github.com/mauriciopoppe/Three.js-City)。2013 年城市开车经典，许可不明——只作历史参考。

### 2.2 驾驶 / 游戏引擎组（详评）

**#10 swift502/Sketchbook（MIT，1,748★，已归档）**
[github.com/swift502/Sketchbook](https://github.com/swift502/Sketchbook)，demo [jblaha.art/sketchbook/latest](https://jblaha.art/sketchbook/latest)。three + cannon.js 第三人称沙盒：RaycastVehicle 悬挂、角色胶囊控制器、状态机、可变时间步。
- **可借**：**悬挂调参手感**（作者在[论坛帖](https://discourse.threejs.org/t/sketchbook-v0-4-three-js-cannon-js-playground/18432)明确说 raycast vehicle 参数微调是自然车感关键）；「scenario 出生点组」的关卡描述法（对应我们十字路口出生 + 楼前触发区）；上下车模式切换状态机。
- **不可借**：cannon.js（我们用 Rapier）；其对 trimesh 的性能抱怨反向提示我们**楼体碰撞用 hull/box 简化体**。

**#11 pmndrs/racing-game（MIT，2,211★）**
[github.com/pmndrs/racing-game](https://github.com/pmndrs/racing-game)。R3F + use-cannon 社区赛车。**只借数值与结构**：车辆 config（引擎力/转向/滑移）、镜头追随参数、计时圈结构；R3F 组件一行都不进运行时（红线）。

**#12 BKcore/HexGL（MIT + 文件级 CC BY-NC 3.0，1,736★）**
[github.com/BKcore/HexGL](https://github.com/BKcore/HexGL)，官网 [hexgl.bkcore.com](https://hexgl.bkcore.com/)。README 声称 MIT，但运行时与 Cityscape 赛道多文件头保留 CC BY-NC 3.0（非商用）。
- **可借**：速度感设计（FOV 拉伸、速度线、HUD 倾斜）思路层面。
- **不可借**：**全部资产（贴图/模型/音频）与带 NC 文件头的代码**——我们站含商业求职属性，NC 一律禁用。

**#17 lo-th/phy（MIT，736★）** [github.com/lo-th/phy](https://github.com/lo-th/phy)：多物理引擎统一封装含载具 demo，Rapier 调参对照表用。
**#18 dimforge/rapier.js（Apache-2.0，696★）** [github.com/dimforge/rapier.js](https://github.com/dimforge/rapier.js)：官方 JS 绑定，注意**已迁移**至 [dimforge/rapier monorepo 的 typescript 目录](https://github.com/dimforge/rapier/tree/master/typescript)，锁版本时以新仓为准。
**#29 simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera（MIT，65★）** [仓库](https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera)：第三人称相机理想位/理想视点双 lerp 教学，直接改写为我们跟车相机。
**#30 donmccurdy/three-pathfinding（MIT，1,368★）**：Phase 2 NPC 车流寻路备用。

### 2.3 渲染增强组（霓虹/雨/反射/文字）

**#14/#15 0beqz/realism-effects（MIT，1,710★）与 screen-space-reflections（MIT，589★）**
[realism-effects](https://github.com/0beqz/realism-effects)、[screen-space-reflections](https://github.com/0beqz/screen-space-reflections)。WebGL 后处理时代的 SSR/SSGI 标杆。**裁决**：不引包（基于 pmndrs/postprocessing 的 WebGL 管线），但其「降分辨率 SSR + 时域累积」策略指导我们的 TSL 湿地面：首选 three 官方 TSL `bloom` + 反射探针/SSR 节点，失败回退 emissive-only（对齐提案 §Premortem P10）。
**#16 protectwise/troika（MIT，1,965★）**：`troika-three-text` SDF 文字**支持 vanilla three**，是楼顶全息招牌 3D 文字的首选（中文字形需子集化，见 §4.3 预算）。
**#21 RainSystemThreeJS（MIT，27★）** [仓库](https://github.com/achrefelouafi/RainSystemThreeJS)：雨粒子 + 湿表面的 MIT 上游，playground 已验证其 TSL 化可行。
**#23 threejs-silhouette-pom（MIT，37★）** 与 **#24 mmikk/hextile-demo（MIT，1,029★）**：近景路面细节与防平铺重复，中配以上启用。
**#19 three-mesh-bvh（MIT，3,460★）**：楼体点击/车轮射线/进楼触发区的碰撞查询加速，synthcity 同款实战背书。
**#31 pmndrs/detect-gpu（MIT，1,210★）**：GPU 分档 → 我们 DPR/粒子/bloom 降级开关的判据来源。

### 2.4 参考站组（作品集先例，均详见 `cyber-city-competitive-research.md`）

**#7 folio-2025（MIT，1,761★）/ #8 folio-2019（MIT，4,734★）**：本站引擎腿与「车落地弹跳」语法来源，vendor 已入仓（`vendor/folio-2025`，teardown 见 `bruno-simon-folio-source-teardown.md`）。folio-2019 的 [license.md](https://github.com/brunosimon/folio-2019/blob/master/license.md) 为标准 MIT。
**#26 drive-my-portfolio（无 LICENSE，0★）/ #27 mecha-portofolio（无 LICENSE，0★）**：交互设计参考（E 键进区 / 机甲部位=技能），零代码复制。

---

## 3. 机器人资产决议（D2 终稿）

### 3.1 候选矩阵

| 候选 | 来源/下载 | 许可 | 形态契合（擎天柱气质） | 体积/面数 | 动画 | 裁决 |
|------|-----------|------|------------------------|-----------|------|------|
| **Quaternius Animated Mech Pack**（4 台机甲） | [quaternius.com/packs/animatedmech.html](https://quaternius.com/packs/animatedmech.html)（FBX/OBJ/Blend）；单件 GLB 走 [poly.pizza/m/o3Ps8z8ByP](https://poly.pizza/m/o3Ps8z8ByP)（Mech，CC0，FBX/GLTF 直下，约 2.7k tris） | **CC0**（[itch 官方确认](https://itch.io/profile/quaternius)：全部资产 CC0 可商用） | ★★★★ 块面人形机甲、宽肩重躯干，重制材质后可达「站岗警戒」气质 | 低模，单机甲 GLB 预计 150–500KB（Draco 后 ≤300KB） | ✅ 自带 idle/walk 等 | **主选基底** |
| **Quaternius Cyberpunk Game Kit**（71 模型，2022-07） | [quaternius.com/packs/cyberpunkgamekit.html](https://quaternius.com/packs/cyberpunkgamekit.html)（FBX/OBJ/glTF/Blend） | CC0 | ★★★（角色/敌人/炮塔部件，供 kitbash 肩甲、胸甲、天线） | 逐件 KB 级 | 部分带 | **部件库** |
| **Quaternius Sci-Fi Essentials Kit**（60+ 件，含动画机器人敌人） | [quaternius.com/packs/scifiessentialskit.html](https://quaternius.com/packs/scifiessentialskit.html)；[itch 镜像](https://quaternius.itch.io/sci-fi-essentials-kit) Standard zip 159MB | CC0 | ★★★ | 逐件 KB 级 | ✅ | 部件库备选 |
| **RobotExpressive.glb**（Tomás Laulhé，Don McCurdy 改） | three.js 仓库 `examples/models/gltf/RobotExpressive/`（[模型页](https://threejs.org/examples/models/gltf/RobotExpressive/)） | **CC0 1.0**（官方 README 声明） | ★★ 卡通圆润，非机甲 | **实测 463,988B（453KB）** | ✅ 14 个命名剪辑（含表情 morph） | **开发期占位**（状态机/变形联调） |
| **Mech Drone**（Willy Decarpentrie @skudgee） | [sketchfab.com/3d-models/mech-drone-8d06874aac5246c59edb4adbe3606e0e](https://sketchfab.com/3d-models/mech-drone-8d06874aac5246c59edb4adbe3606e0e) | **CC-BY 4.0**（API 实测 label「CC Attribution」，可下载） | ★★★ 双足机甲但偏无人机气质 | 9,131 面 | 1 剪辑 | 备选 B（署名义务 + 气质偏差） |
| **Biped robot**（同作者） | [sketchfab.com/skudgee](https://sketchfab.com/skudgee) 作品页 | CC-BY 4.0 | ★★★ | 16,618 面 | 1 剪辑 | 备选 B |
| Sketchfab「CC0 机甲」 | API 过滤 `licenses=cc0&q=mech&downloadable=true` | — | — | — | — | **实测第一页 0 结果**——Sketchfab CC0 机甲近乎不存在，免费高模主流是 CC-BY |
| Mixamo 机器人（X Bot 等） | mixamo.com | Adobe 免费但**禁止资产再分发** | ★★ | — | ✅ | ❌ 弃：本仓公开，GLB 入 `public/` 即构成再分发灰区 |
| FNAF / 现成 IP 角色「CC-BY」拆包 | Sketchfab 搜索混入 | 无效授权 | — | — | — | ❌ 严禁 |

### 3.2 最终推荐（执行版）

**主方案：「Quaternius CC0 机甲基底 + kitbash + 本站 TSL 重制材质」**

1. **基底**：Animated Mech Pack 中选一台肩宽腿长比最接近「英雄站姿」的机甲（4 选 1，Blender 里比对）；骨骼与动画保留（idle 必须、walk 备用）。
2. **kitbash 增补**：从 Cyberpunk Game Kit / Sci-Fi Essentials 取胸甲板、肩部装甲、头部传感器条，替换原头部（进一步拉开与任何现成模型的辨识距离）；胸口开一块「座舱 HUD 屏幕」平面（后接 TSL 动态纹理，呼应 Master Agent 人格化）。
3. **材质全弃原贴图，TSL 重制**：深钛灰金属漆（`metalness 0.85 / roughness 0.35`）+ 青色 `#49c5b6` emissive 关节/胸屏 + 工业橙 `#ff6b35` 警示条（全站 token 直引）；风化层借 three.js `SkyscraperGenerator` 的 TSL 风化噪声写法。
4. **管线**：Blender 合并 → 减面校验 → glTF 导出 → `gltf-transform`（Draco/meshopt + KTX2）→ 目标 **≤800KB**（提案 §4.2 预算内；基底低模 + 无大贴图，预计实际 300–500KB）→ 落盘 `public/models/hero-robot/`。**WebGPU 注意**：skinned GLB 交错顶点属性需反交错（playground `flattenObjectForWebGPU` 教训，§2.1）。
5. **开发期**：先用 RobotExpressive.glb（453KB、CC0、14 剪辑）打通「robot_idle → transforming → car_idle」状态机与变形光幕，美术资产并行不阻塞。
6. **合规落盘**：`public/models/hero-robot/README.md` 记录基底来源、CC0 链接、改造清单（虽无署名义务，留证据链）。

**为何不撞 Transformers IP（法务论证四条）**

1. **来源链干净**：基底为 Quaternius 原创 CC0 低多边形（作者[公开确认 CC0 可商用](https://itch.io/profile/quaternius)），非任何影视/玩具 IP 的扫描、拆包或仿制；CC0 放弃全部著作权主张。
2. **零商标元素**：不使用 Transformers / Optimus Prime / Autobot / 擎天柱等词于代码、资产名、UI 文案与 SEO（站内叙事统一为「座舱 AI 机器人 / Master Agent」）；不复刻 Hasbro 受保护的标志性视觉：红蓝卡车涂装、胸口卡车驾驶室窗、Autobot 脸形徽章、火焰纹。
3. **变形叙事不同源**：我们的变形对象是本站原创 CarConcept 概念车（`/lab/car-configurator/` 自有资产），且为「光幕遮蔽热交换」而非还原玩具的机构变形——「机器人变车」作为抽象概念本身不受版权保护，受保护的是具体角色形象，而我们的形象由 CC0 基底 + kitbash + 全新配色三重改造而来。
4. **配色即品牌**：钛灰/青/橙是本站既有设计 token，与擎天柱红蓝配色形成明确视觉区隔；「擎天柱气质」只落在**体态语言**（站姿、比例、胸甲），这是不受保护的风格层。

### 3.3 机器人体积预算

| 项 | 预算 | 依据 |
|----|------|------|
| 机甲 GLB（Draco+KTX2） | ≤800KB（预计 300–500KB） | 基底 ~2.7k tris + kitbash 件均 KB 级（poly.pizza 实测量级） |
| 占位 RobotExpressive | 453KB（实测 463,988B） | GitHub API `contents` 接口 |
| 动画剪辑 | 含于 GLB，idle+walk ≤2 条 | 提案 §2 动画配额 |

---

## 4. 城市 / 道路 / 霓虹：程序化代码 vs 纹理资产清单

### 4.1 程序化代码清单（MIT/BSD，可 vendor 改写为 TSL）

| 能力 | 首选来源 | 许可 | 集成方式 | 体积影响 |
|------|----------|------|----------|----------|
| 街区布局 + 摩天楼生成（10–20 栋） | three.js `CityGenerator` + `SkyscraperGenerator`（§2.1） | MIT | 官方 addon 直引或 vendor 改皮（palette→赛博、窗格→emissive） | 代码 ~70KB 源码（gzip 后远小），**零纹理** |
| 道路/车道线/斑马线/湿沥青 | three.js `createRoadMaterial` | MIT | TSL 节点直用，路网对齐 `city.layout` | 零纹理可跑 |
| 十字路口路网数据 | ProbableTrain/MapGenerator **离线**导出 | LGPL（仅数据） | 路网 JSON 进 `public/data/city-map.json`（单源 schema，扩展到 20 栋槽位） | JSON ≤30KB |
| 无限/分块城市（Phase 1 扩图） | synthcity 分块算法 + playground `cityChunkWorker` | MIT | 思路重写进世界壳 | — |
| 全局雨湿状态总线 | playground 雨湿共享 uniform + RainSystemThreeJS | MIT | 单 wetness uniform 驱动路面/楼面/霓虹倒影强度（变形仪式联动） | — |
| 湿地面反射 | three TSL 官方节点优先；0beqz SSR 策略参考 | MIT | 半分辨率 + 失败回退 emissive-only | — |
| 霓虹 bloom | three.js `BloomNode`（`webgpu_generator_city` 同款用法） | MIT | TSL PostProcessing，半分辨率 | — |
| 楼顶全息招牌文字 | troika-three-text | MIT | vanilla 兼容 SDF 文字 + DOM 标签双轨（HUD 仍全 DOM，提案 §5） | 中文子集字体见 4.3 |
| 近景路面细节 | silhouette-pom + hextile-demo | MIT | 中高配开启 | — |
| 碰撞/触发区 | three-mesh-bvh + Rapier（Apache-2.0） | MIT/Apache | 楼体 hull 简化体（Sketchbook trimesh 教训） | — |
| GPU 分档 | detect-gpu | MIT | 决定 DPR/粒子/bloom 开关 | +~10KB |
| 跟车相机 | simondev 第三人称相机 | MIT | 双 lerp 改写 | — |

### 4.2 纹理/模型资产清单（CC0）

| 资产 | 来源/下载 | 许可 | 用途 | 包体积（下载态） |
|------|-----------|------|------|------------------|
| City Kit (Roads) v2.1 | [kenney.nl/assets/city-kit-roads](https://kenney.nl/assets/city-kit-roads)（[itch 镜像](https://kenney-assets.itch.io/city-kit-roads) zip 2.3MB，90 件，OBJ/FBX/glTF） | CC0 | 十字路口护栏、路灯、信号灯、施工围挡点缀 | 单件 GLB 数十 KB，选用 ≤8 件 |
| City Kit (Commercial) v2.1 | [kenney.nl 页](https://kenney.nl/assets/city-kit-roads)同族，[OpenGameArt 镜像](https://opengameart.org/content/city-kit-commercial) zip 4.1MB，50+ 件 | CC0 | 沿街低层商业体（近景楼裙），与程序化高楼混排 | 选用 ≤6 件 |
| Car Kit v3.1 | [kenney.nl/assets/car-kit](https://kenney.nl/assets/car-kit)（[itch](https://kenney-assets.itch.io/car-kit) zip 3.4–4.8MB，45+ 车 + 8 轮 + 碎片） | CC0 | Phase 1 NPC 车流占位（主角车仍是 CarConcept） | 选用 2–3 台 |
| Downtown City MegaKit | [quaternius.com/packs/downtowncitymegakit.html](https://quaternius.com/packs/downtowncitymegakit.html)（[itch](https://quaternius.itch.io/downtown-city-megakit) Standard zip 223MB，300+ 模块件，含假窗内景 shader 思路） | CC0 | 四主题楼 kitbash 素体 + 街道细件；其「fake window interior」思路直接 TSL 化 | **只挑 ≤10 件**，单件 50–300KB |
| Cyberpunk Game Kit | [quaternius.com/packs/cyberpunkgamekit.html](https://quaternius.com/packs/cyberpunkgamekit.html)（71 模型） | CC0 | 霓虹街道具（全息柱、炮塔改装为「充电桩」）、机器人 kitbash 件 | 逐件 KB 级 |
| 夜景 HDRI | Poly Haven [Modern Evening Street](https://polyhaven.com/a/modern_evening_street)（黄昏街区，1K–16K 档）；[许可页](https://polyhaven.com/license)全站 CC0 | CC0 | IBL 环境光底色（叠加自发光霓虹） | 1K HDR 压缩后 ≤500KB；或纯程序化天空 0KB |
| 沥青 PBR | Poly Haven [Asphalt 04](https://polyhaven.com/a/asphalt_04)（1K–16K，glTF 打包可下）；[ambientCG](https://ambientcg.com/) 同类 | CC0 | 仅近景补细节（`createRoadMaterial` 程序化为主） | 1K KTX2 ≤300KB，可选 |
| 立面/金属 PBR | ambientCG Facade/Metal 系列（全站 CC0） | CC0 | 四主题楼近景材质混合层 | 512 KTX2 atlas ≤150KB |
| 单件 GLB 快查 | [poly.pizza](https://poly.pizza)（CC0 过滤 + GLB 直下，聚合 Quaternius/Google Poly 存档） | 逐件标注 | 补件通道 | — |
| 标准测试模型 | [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)（逐模型许可） | 逐模型 | 管线冒烟测试，不进生产 | — |

### 4.3 首屏体积预算合成（对齐提案 §7「3D 首包 ≤2MB」）

| 分项 | 预算 | 策略 |
|------|------|------|
| 机器人 GLB | ≤800KB（预计 300–500KB） | §3.3 |
| 城市几何 | **≈0KB 资产**（程序化生成）+ 生成器代码 | CityGenerator 单楼单 draw call；远景 12–20 栋剪影用「发光盒+窗条」LOD |
| 主题楼 kitbash（4 栋近景） | 4 × ≤200KB = ≤800KB → 首屏先上 2 栋近景 + 2 栋程序化，压至 ≤400KB | Downtown MegaKit 选件 + Draco |
| 道路/地面 | 0–300KB | TSL 程序化优先，近景 1K asphalt KTX2 可选 |
| 环境光 | 0–500KB | 程序化夜空优先，HDRI 作高配增强 |
| 招牌中文字体子集 | ≤120KB | troika + `subset-font` 只留 4 楼名 + HUD 字符 |
| 点缀 GLB（路灯/护栏/全息柱） | ≤200KB | Kenney/Quaternius 选件合并 atlas |
| **合计** | **≤2MB 严格可达**（程序化路线冗余充足） | 分块流式：首帧只要机器人 + 平台 + 天际线剪影 |

### 4.4 霓虹专项裁决

- **窗格发光**：不买贴图——`SkyscraperGenerator` 的窗格 TSL 分支改成「随机窗亮 + 青/品红/紫 palette + 呼吸闪烁」，参数走楼宇 JSON（10–20 栋每栋一个 seed 与主题色）。
- **招牌**：3D SDF 文字（troika）只给四主题楼楼顶全息字；其余楼用 emissive 色块（synthcity 密度控制经验：远看成海、近看有形）。
- **倒影**：湿沥青 = `createRoadMaterial` 粗糙度压低 + wetness uniform；高配开 TSL SSR 半分辨率，低配回退 emissive 直闪（Premortem P6/P10 双保险）。

---

## 5. 许可合规操作规范（进工程前必读）

1. **NOTICE 集中化**：新建 `docs/spec/third-party-notices.md`（工程 Task 一并交付），逐条记录：three.js examples（MIT）、synthcity 借鉴算法（MIT）、playground 借鉴节点（MIT）、troika（MIT）、Rapier（Apache-2.0，须附 License 原文链接）、night-city（若复制代码则附 BSD-3 声明）。
2. **CC0 资产留痕**：每个资产目录放 README 记录来源 URL + 下载日期 + 改造说明（无法律义务，防未来审计翻车）。
3. **CC-BY 若启用**（备选 B 机甲）：页脚 credits + `humans.txt` 署名「Mech base by Willy Decarpentrie (CC-BY 4.0)」。
4. **禁用清单**：HexGL 全部资产与 NC 文件头代码；synthcity 附带音乐（Uppbeat 曲库许可不转移）；一切无 LICENSE 仓库的代码与资产（san_verde / cyberpunk-apartment / infinite-world / drive-my-portfolio / mecha-portofolio）；Mixamo 资产入公开仓；Sketchfab 上任何游戏拆包/IP 角色（无论标什么 CC）。
5. **LGPL 隔离**：MapGenerator 只在本地跑，产物 JSON 入仓，工具本身不进依赖树。

---

## 6. 对八 Task 的输出接口

| 下游 Task | 本文供给 |
|-----------|----------|
| CC-T5 机器人造型 Brief | §3.2 主方案（基底选型 + kitbash 清单 + TSL 材质规格）可直接展开为美术 Brief |
| CC-T6 性能粗算 | §4.3 预算表为基线；CityGenerator 单楼单 draw call 为 draw call 预算锚点 |
| 工程 Hero 模块 | §4.1 代码清单 = `HeroCyberCity` 依赖判定；`flattenObjectForWebGPU` 反交错坑提前入 checklist |
| Phase 1 世界壳 | san_verde「编辑器路网→程序化填充」思路 + MapGenerator 数据管线 + synthcity 分块 |
| PRD/SRD 修订 | §5 合规规范并入 SRD 资产章节；D5 白名单措辞不受本文影响 |

### 未决项（不阻塞）

- three.js [PR #33906](https://github.com/mrdoob/three.js/pull/33906)（improved city example）截至 2026-08-25 未合并，合并后复查增量。
- Animated Mech Pack 4 台机甲的最终选型需 Blender 实测比对（工程 Task first commit 前完成）。
- Poly Haven 夜景 HDRI 若气质不够「赛博」，回退纯程序化天空 + 城市光晕渐变（零成本方案已在 §4.3 预留）。

---

*CC-GH1 v1.0 完 — 全部引用访问日期 2026-08-25；stars/许可为当日 GitHub API 实测。只产文档，未改任何生产代码。*
