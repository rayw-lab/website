# Cyber City 渲染架构全量审视（后处理 / 着色器）

> CC-Rendering-Audit · 2026-08-26 · 分支 `cursor/cc-rendering-arch-audit-1d6f`
>
> 审视对象：`src/lab/world/` 全树（51 个 `.ts`）+ 入口 `src/lab/world/index.ts` +
> 薄入口 `src/lab/modules/world/index.ts` + 壳 `src/pages/index.astro` 的 world 契约段。
> 方法：全量 grep（`three/tsl` / `NodeMaterial` / `bloom|RenderPipeline|PostProcessing` /
> `RawShaderMaterial|ShaderMaterial|glsl|vertexShader|fragmentShader|onBeforeCompile` /
> `toneMapping|outputColorSpace` / `reflector` / `fogNode`）+ 渲染相关文件逐文件阅读。
> 依赖版本：`three ^0.185.1`、`@types/three ^0.185.4`（`package.json`）。
> folio 移植基线：`vendor/README.md` 记录 folio-2025 commit `41046b5`。

---

## 1. Executive Summary

**用户问题「目前全部代码架构是否使用了后处理和着色器？」——两问答案都是"是"，且各自只有一条路径：**

- **后处理：使用**。全站唯一一条后处理管线在 `src/lab/world/rendering/Rendering.ts`：
  `THREE.RenderPipeline`（three r183 起 `PostProcessing` 类的正名）+ **单一 bloom 通路**
  （`three/addons/tsl/display/BloomNode.js` 的 `bloom()`，threshold=1）。除 bloom 外
  **没有任何其他 pass**（无 tone mapping pass、无 AA pass、无 SSAO/DOF/晕影）。
  Quality 2 档整段旁路（`renderer.render` 直连，零 pass 开销）。
- **着色器：使用，且是全站材质系统的主体——但零手写 GLSL/WGSL**。全部自定义着色
  走 **TSL（Three.js Shading Language）节点材质**：`src/lab/world/` 下 35 个文件
  import `three/webgpu`、14 个文件 import `three/tsl`；全仓 **0 处**
  `RawShaderMaterial` / `ShaderMaterial` / `onBeforeCompile` / GLSL 字符串
  （grep 交叉验证，`three` 核心包仅 2 处 type-only import，为 KTX2Loader
  `detectSupport` 的类型签名摩擦，见 `core/ResourcesLoader.ts`、`shared/gltf-loaders.ts`）。
- **技术栈一句话**：`WebGPURenderer`（WebGPU 优先、不支持时 three 自动回退 WebGL 2，
  `?gl=1` 强制回退复测）+ TSL NodeMaterial 族
  （`MeshStandardNodeMaterial` / `MeshBasicNodeMaterial` / `SpriteNodeMaterial` /
  裸 `NodeMaterial`）+ `RenderPipeline` 单 bloom 后处理——**不是**传统
  `WebGLRenderer` + GLSL `ShaderMaterial` + EffectComposer 的老三件。

其余关键结论：城市视觉 100% 程序化 TSL（零贴图资产，Canvas2D 文字纹理除外）；
三档 Quality 全链联动（bloom/DPR/阴影/反射/雾/剪影密度/霓虹动画/光轨）；切档纪律 =
「模块级共享 uniform 写入优先，节点图重建兜底」，逐帧热路径上零材质操作。

---

## 2. 后处理管线图

```
Game.init()
  └─ Rendering.setRenderer()                       // WebGPURenderer（forceWebGL 可选）
       renderer.setAnimationLoop → ticker.update   // ★ 渲染循环即游戏循环（folio 纪律）
  └─ Rendering.start()                             // tick order 998 挂渲染
       └─ setPostProcessing()                      // 组建一次，跨档常驻
            scenePass       = pass(scene, view.camera)          // three/tsl
            scenePassColor  = scenePass.getTextureNode('output')
            bloomPass       = bloom(scenePassColor,
                                    strength=0.55, radius=0, threshold=1)
            bloomPass.smoothWidth = 1
            pipeline        = new THREE.RenderPipeline(renderer)
            pipeline.outputNode = scenePassColor.add(bloomPass)
                                  // 尾端 RenderPipeline 默认 output 变换收口；
                                  // 全站未设置 toneMapping（NoToneMapping 直通）

每帧 render()（tick order 998）：
                    ┌────────────────────────────────────────────────┐
   [仅 Q0]          │  Grid reflector 镜像渲染（updateBefore：        │
   reflector 节点   │  resolutionScale 0.35 低清一遍场景；Q1/Q2 时    │
   在 emissive 图中 │  节点不在图中 → 不触发，零开销）                │
                    └────────────────────────────────────────────────┘
                                       │
              ┌────────────────────────┴─────────────────────────┐
   Quality 0/1（postEnabled=true）                        Quality 2
              │                                                  │
   pipeline.render()                                renderer.render(scene, camera)
   scene → scenePass → bloom(threshold=1) → add → 出屏     // 后处理整段旁路，零 pass

Quality 档位分支（Rendering.applyQuality，事件级切换）：
   Q0  bloom strength 0.55 ｜ 阴影开（切换时全场景 material.needsUpdate 重编译）｜ DPR≤2
   Q1  bloom strength 0.30 ｜ 阴影关                                        ｜ DPR≤1.5
   Q2  postEnabled=false（bloom 连 pass 一起旁路）｜ 阴影关                   ｜ DPR≤1

一次性预热（仅 Q0 + WebGPU 后端，city 挂载末拍）：
   PreRenderer.render() —— 32px CubeCamera 全场景（含隐藏件）离屏渲一遍，
   逼全部 TSL 材质完成管线编译（folio Game.js L203 同门；防首帧/揭幕卡顿）
```

folio 对照（`Rendering.ts` 头注 + `vendor/folio-2025 sources/Game/Rendering.js`）：
bloom 主干「零改名直迁」（`pass`/`bloom` 具名导出面 r183→0.185 一致）；folio 私有的
`_nMips` 按档 5/2 调优未迁（取默认 5 mips，以 Q2 整档关停代替）；`cheapDOF` 被
§9.1 第 7 项裁决砍除（详见 §4）。

---

## 3. 着色器 / TSL 清单表

约定：「材质类型」为 NodeMaterial 具体类；「逐帧 update」区分 **shader `time` 节点**
（GPU 侧自走、零 JS 逐帧成本）与 **JS 侧逐帧写 uniform/属性**；「Quality 联动」注明
机制（uniform 写入 / 节点图重建 / count 裁剪）。

| 文件路径 | 材质类型 | TSL 节点用途 | 逐帧 update | Quality 联动 |
|---|---|---|---|---|
| `rendering/Rendering.ts` | —（管线） | `pass` + `bloom` 后处理节点图 | 否（管线常驻） | strength 0.55/0.3、Q2 旁路；阴影切档触发全场景重编译 |
| `rendering/NeonMaterials.ts` · `createFacadeMaterial` | MeshStandardNodeMaterial | 窗格栅格（`positionGeometry` 米制 cell + `hash` 亮灭/色相/相位）、三族窗色 palette、亮屏窗升格、大堂光带；`colorNode`+`emissiveNode` | shader `time`（`neonTime`） | `neonUniforms`（timeScale/flickerScale/phaseSpread）三档 uniform 写入 |
| 同上 · `createSilhouetteMaterial` | MeshStandardNodeMaterial | 世界坐标窗格栅格（`positionWorld`，InstancedMesh 单位盒专用）低饱和青/品红 | shader `time` | 同 `neonUniforms` |
| 同上 · `createNeonGlowMaterial` | MeshStandardNodeMaterial | 纯 emissive 呼吸脉动（招牌带/檐口/信标/POI 光圈） | shader `time` | 同上（Q2 冻结常亮） |
| 同上 · `createSignPanelMaterial` | MeshStandardNodeMaterial | TextCanvas 纹理 `texture()` mask 霓虹字 + Chebyshev 描边框 | 否（常亮无时间项） | 无 |
| 同上 · `createHoloSignMaterial` | MeshBasicNodeMaterial（additive 半透明） | 文字 mask + 静态扫描纹 + 慢呼吸；`opacityNode` 分层 | shader `time` | flickerScale（Q2 冻结） |
| 同上 · `createStreetLampMaterial` | MeshStandardNodeMaterial | 局部坐标带切 emissive（灯头/灯箱）+ `instanceIndex` 选 atlas 行竖排广告字 + 反相灯位 | 否（常亮） | 无 |
| 同上 · `createHologramBarrierMaterial` | MeshBasicNodeMaterial（additive） | 高度向滚动扫描条纹 + 呼吸 | shader `time` | timeScale/flickerScale（Q2 定格） |
| `rendering/MeshGridMaterial.ts` | 裸 NodeMaterial（unlit，`outputNode` 直出）+ 4 个导出 TSL 函数 | Ben Golus 抗锯齿网格（`fwidth` 导数夹持+羽化+覆盖率淡出）、triplanar UV、多线层 uniform 组 | 否 | 无（uniform 面留给 debug/档位） |
| `rendering/PreRenderer.ts` | —（工具） | CubeCamera 离屏预编译全部管线 | 一次性 | 调用门 = Q0 + WebGPU |
| `world/Grid.ts` | MeshStandardNodeMaterial | `toAntialiasedGrid` 双层网格 emissive + `reflector` 实时平面反射 / `valueNoise` 水洼掩码（`cityPuddleMask` 单源）/ sheen 假反射 | 否（reflector 镜像渲染由管线 updateBefore 驱动） | 三档**节点图重建** + needsUpdate（事件级重编译） |
| `city/Roads.ts` | MeshStandardNodeMaterial ×2（plaza + 路面） | 世界坐标程序化路面标线（虚线/边线/斑马线）、霓虹路缘光、出生光圈箭标；plaza 街区栅格 | 否 | `applyWetQuality` 三档节点图重建（Q0 共享 Grid reflector） |
| `city/Sky.ts` | MeshBasicNodeMaterial（BackSide 穹顶） | 垂直渐变 + 方位辉光带 + `mx_noise_float` 两倍频低云带；**`scene.fogNode` 分层雾**（见 §7） | 否（静态穹顶/雾场） | `atmosphereUniforms`（layerMix/cloudDetail/master）uniform 写入 |
| `city/FlightTrails.ts` | SpriteNodeMaterial（additive InstancedMesh） | **`positionNode` 顶点级航线解析**（椭圆环+起伏+`time`）、`scaleNode` 点径、`colorNode` 拖尾衰减+距离衰减 | shader `time`（零 JS/零 CPU 写缓冲） | `trailUniforms` + `mesh.count` 裁尾 + Q2 `visible=false` |
| `city/StreetProps.ts` | MeshStandardNodeMaterial ×3 | 隔离墩顶环 emissive 高度渐变 | 否（常亮） | 无 |
| `city/HeroRobot.ts` | MeshBasicNodeMaterial（接地环） | 径向环带 + 中心辉光（uv 距离场） | 否 | 无 |
| `player/TransformSystem.ts` | MeshBasicNodeMaterial ×2（充能环 + 光幕，additive） | `atan` 角度场刻度扫掠、双色横向渐变、扫描线；opacity/spin 走 TSL uniform | **JS 逐帧写 uniform**（仅变形 1.05s 期间） | 无（reduced-motion 走 instant swap） |
| `inputs/Nipple.ts` | MeshBasicNodeMaterial（`outputNode` 直出） | 环形 SDF 摇杆（forward 扇区/进度扇区/双描边，`If`/`toVar` 命令式节点） | **JS 写 uniform**（触屏激活时） | 无 |
| `areas/InteractivePoints.ts` | MeshBasicNodeMaterial ×3（键帽/标签/菱形圈） | `texture()` mask + `discard`、Chebyshev 菱形距离场、标签滑入 offset | **JS tween 写 uniform**（开合动画期间） | 无 |
| `world/World.ts` | MeshStandardNodeMaterial ×2（灰盒地面 + 锥桶） | `fwidth` 抗锯齿网格简化版 + 程序化环道；锥桶反光带高度切带 | 否 | 无（锥桶仅 greybox 档出场） |
| `world/Zones.ts` | MeshBasicNodeMaterial（wireframe 预览） | 纯 color（无自定义节点） | 否 | 无 |
| `core/Ticker.ts` | —（uniform 源） | `elapsed/delta` 四件套 TSL uniform 逐帧写入 | JS 逐帧写 | **当前无材质消费方**（动画主源是 `time` 节点；预留接口，见 §9） |

非 TSL 材质（经典 three 材质，详见 §8）：`city/HeroRobot.ts`（回退机甲
`MeshStandardMaterial` ×5、光柱 `MeshBasicMaterial` ×2、GLB 自带材质）、
`player/VisualVehicle.ts`（CarConcept GLB 材质原样 + HDR `scene.environment`）。

---

## 4. 未使用的后处理

**folio-2025 有、本站砍掉的**（`Rendering.ts` 头注 §9.1 第 7 项裁决留档）：

- **cheapDOF**（folio `setPostprocessing` 里的廉价景深）——Spike 阶段裁决「不需要」；
  蓝本仍在 `vendor/folio-2025 sources/Game/Rendering.js` 可回补。
- Inspector / stats（调试面）——同批砍除，本站以 `FpsMeter` + `renderer.info` 遥测替代。
- bloom `_nMips` 按档 5/2 私有字段调优——未迁（默认 5 mips，Q2 以整档关停代替）。

**本站现在没有的常见后处理**（全量 grep `toneMapping|SSAO|fxaa|DOF|…` 确认零命中）：

| 缺席项 | 现状与代偿 |
|---|---|
| **Tone mapping** | 全站未设 `renderer.toneMapping`（默认 NoToneMapping）。emissive>1 + bloom add 的白爆靠**手工纪律**代偿：光幕 tint×1.3+opacity×0.7（A6「白爆抑制」）、反射峰值系数压 0.98/0.82、天空/雾/网格全部 <1。对照：同仓 `car-configurator/engine.ts` 用了 `ACESFilmicToneMapping`——技术上同栈可直接启用 |
| **AA pass（FXAA/TAA/SMAA）** | 仅建器时 `antialias: pixelRatio < 2`（MSAA 交给后端）；后处理路径无 AA pass。网格线用 shader 内 `fwidth` 抗锯齿自理 |
| **SSAO / GTAO** | 无。夜景+emissive 主导的画面 AO 收益低，几何暗部靠幕墙近黑基色压 |
| **DOF / Motion blur / 晕影 / 色差 / LUT 调色** | 全无。色彩统一靠 `src/data/neon-tokens.ts` 单源色相纪律在材质侧完成 |

---

## 5. Bloom 阈值纪律（threshold=1 与 emissive 设计的耦合）

`Rendering.ts` L98：`bloom(scenePassColor, 0.55, 0, 1)`——**radius 0、threshold 1**：
只有线性色值 >1 的像素起辉。这不是孤立参数，而是全城 emissive 台账的**分界线契约**，
各材质的强度值都在有意识地站队（代码注释多处显式引用「bloom threshold=1 纪律」）：

**阈上（bloom 锚点，>1）**——辉光名额的持有者：

| 件 | 线性强度 | 出处 |
|---|---|---|
| 楼顶呼吸信标 | 3.0（脉动） | `ThemeTowers` → `createNeonGlowMaterial` |
| 楼顶全息板文字 | 2.4 | `createHoloSignMaterial` 默认 |
| 灯杆灯头 | 2.3 | `createStreetLampMaterial` |
| 充能环 | ×2.2 | `TransformSystem.setRing` |
| 招牌带/POI 光圈默认 | 2.0（高亮 POI 3.4） | `createNeonGlowMaterial` / `Areas` |
| 立面灯箱文字 / 灯箱广告字 / 亮屏窗 | 1.9 | `createSignPanelMaterial` / lamp ads / facade screenBoost |
| 幕墙亮窗 | 1.4–1.5×flicker | `createFacadeMaterial` intensity（hero 1.5 / standard 1.1） |
| 楼顶檐口 | 1.3 | `CityBlocks` |
| 光轨机头叠加峰 | ≈1.3（additive 叠加过阈） | `FlightTrails` 头注纪律 |
| 隔离墩顶环 | ≈1.33 / ≈1.5 峰值分量 | `StreetProps`（cyan×1.7 / magenta×1.5） |

**阈下（刻意 <1，不得起辉）**——注释里逐件写明的「不抢名额」方：

- 天空穹顶全域 <1（峰值 ≈0.6 含云带，头注「天空是环境不是光源」）；
- 地面网格线 ×0.3 / ×0.45（A9「网格是底纹不是光源」）；
- 湿反射项峰值系数 0.98（Grid）/ 0.82（Roads）——「倒影只在光源本身超阈处随源辉光」；
- 反相广告灯箱面板底 0.95——「不入泛光，暗字保读」；
- 光轨拖尾 ~0.3 快速跌落阈下；雾色/辉光染雾全程 <1。

Quality 联动只动 **strength**（0.55/0.3），**threshold 恒为 1**——台账跨档不重排。
这套纪律的脆弱点：一旦引入 tone mapping 或改 threshold，全部强度值须整表重校（见 §9）。

---

## 6. 反射子系统（Grid reflector + Roads 共享）

实现在 `world/Grid.ts` + `city/Roads.ts`，接线序在 `city/index.ts`（Grid 先切档，
再把 `grid.reflectionNode` 喂给 `roads.applyWetQuality`）：

| 档 | Grid 地坪（y=0.02） | Roads 路面（y=0.1） |
|---|---|---|
| **Q0** | `reflector({ resolutionScale: 0.35, bounces: false })` 实时平面反射：每帧一次低清镜像渲染（模糊倒影感来自低分辨率本身）；`reflection.rgb × (puddle×0.8+0.18)` 入 emissive；湿区 roughness 0.85→0.22 | **共享同一 reflector 节点**（同一次镜像渲染，零二次开销；反射平面高差 8cm 在 20m 斜距下可忽略）；系数压一档 0.72+0.1=0.82；roughness 0.82→0.24 |
| **Q1** | 假反射：`citySheenColor()`（青/品红低频噪声混色）× 水洼掩码 ×0.2，零二次渲染 | 同款 sheen ×0.18 |
| **Q2** | 哑光：emissive 只留网格线 | 哑光：emissive 只留霓虹路缘/出生标记 |

关键机制细节：

- **水洼掩码单源** `cityPuddleMask()`：hash 双线性价噪声（~10 指令零贴图）全城分布 +
  首幕前景「英雄水洼」椭圆软区（中心 (3,8)、半轴 (13,11.5)，保证主体脚下必湿）——
  Grid/Roads 世界坐标取样，跨网格图案无缝。
- **切档 = 节点图重建**（非 uniform）：emissive/roughness 节点图整体换 + `needsUpdate`
  ——事件级 2 个材质重编译。reflector 节点懒建、跨档保留：不在节点图中时其
  `updateBefore` 不触发 → Q1/Q2 镜像渲染自然停跑，回 Q0 零重建。
- **dispose 收口**：reflector 的 renderTarget 不被 Game 场景遍历覆盖，`Grid.dispose()`
  单独释放（`city/index.ts` 生命周期随 Game 的唯一例外面）。
- 反射源语义：Q0 是真镜像渲染，灯杆/灯箱/楼窗/机器人 rim 自动入水，零额外接线
  （AL2-a-plus 裁决第 1 条的依据）。

---

## 7. 雾 / 大气（Sky.ts fogNode vs 旧 Fog）

CC-L1 时代为 `city/index.ts` 装单层线性 `THREE.Fog('#101c26', 140, 850)`；
CC-L3-ATM 起由 `city/Sky.ts` 构造时改挂 **`scene.fogNode`（TSL 雾节点）** 整体接管：

```
fogNode = fog( mix(legacyColor, layeredColor, layers),
               mix(legacyFactor, layeredFactor, layers) )
layers  = atmosphereUniforms.layerMix × master     // 档位 × 取证开关

layeredFactor = clamp( midHaze  : smoothstep(50→520m)  ×0.42     // 中景缓坡
                     + farVeil  : smoothstep(260→640m) ×0.40     // 远景陡坡纱帘
                     + groundHaze: (高度<30m 增密)×(50→380m)×0.38 // 近地雾床
                     , 0, 0.86 )                                  // 封顶：远剪影保暗形
layeredColor  = mix( 抬亮蓝灰, 方位辉光染色(青⇄品红 ×0.55), smoothstep(160→620m) )
legacyFactor  = (d−140)/(850−140)                                 // 旧线性 Fog 等价式
```

- **三档**：Q0 layerMix=1 全效 / Q1 0.8+云细节 0.35 / Q2 0——雾**严格退化为
  CC-L1 线性 Fog(140,850) 等价式**（Q2 兜底与「关雾」取证对照共用同一退化路径）。
- **纵向层次**：近地雾床让远楼「底先隐、顶后隐」；方位染雾与穹顶辉光带同一
  `HORIZON_GLOW` 混色轴（单一事实源）。
- **fog=false 豁免件**：Sky 穹顶自身（雾由它经营，不吃自己）与 FlightTrails
  （additive 片元吃雾会「加出雾灰」，改手工 200–620m 距离衰减 ×0.5 对齐远景纱帘带）。
- 全程无逐帧 update：雾场是无状态 TSL 表达式 + 模块级 uniform；低云带静态无时间项
  （CITY-03 循环动画配额纪律）。

---

## 8. 非 TSL 路径（混用清单）

全站**没有** RawShaderMaterial / ShaderMaterial / WebGLProgram 级 GLSL 注入；
存在以下四类非 TSL 渲染要素，均有明确契约：

1. **Canvas2D 文字纹理（TextCanvas 管线）**：`world/TextCanvas.ts`（folio 移植）
   Canvas 2D 黑底白字 → `THREE.Texture`（`flipY=false`、Nearest、SRGB）。消费方
   在 TSL 侧以 `texture(map, vec2(u, v.oneMinus())).r` 取 mask——`BuildingSigns`
   楼名（全息板+灯箱）、`StreetLamps` 10 行标语 atlas（`instanceIndex` 选行）、
   `InteractivePoints` 标签；键帽图标另有一处内联 canvas 手绘（同款采样口径）。
   纹理是 Canvas2D 产物，采样与着色仍是 TSL。
2. **经典材质（HeroRobot）**：回退块面机甲 5 种 `MeshStandardMaterial` + GLB 自带
   材质（Quaternius CC0）；呼吸灯走 **JS 逐帧写 `emissiveIntensity`**（非 TSL
   uniform）；光柱 2 层 `MeshBasicMaterial`（JS 逐帧写 `opacity`）。经典材质在
   WebGPURenderer 下由 three 内部转 NodeMaterial 等价物编译，功能无碍——但它是全城
   唯一不吃 `neonUniforms` 冻结纪律的发光体（配额上以 Reveal 停驱 update 兜底）。
3. **GLB / IBL（VisualVehicle）**：CarConcept GLB 材质原样（Draco+KTX2 管线，
   `core/ResourcesLoader.ts`）；`studio_small_08_1k.hdr` 异步装进
   `scene.environment`（intensity 0.55）——全站唯一 IBL，车漆反射专用，非阻塞可失败。
4. **经典灯光/阴影**：`World.setLights` Hemisphere + Directional（1024 shadow map，
   仅 Q0）；HeroRobot PointLight（呼吸）+ SpotLight（品红 rim）。无 IBL 之外的
   环境光方案。

另有一处**冗余接口**：`core/Ticker.ts` 逐帧维护 4 个 TSL 时间 uniform
（注释称 Nipple/未来材质消费），但 grep 证实当前**零消费方**——所有 shader 动画
实际走 TSL `time` 节点（渲染器内建时间源），Nipple 用自有 uniform。属可留可清的
预留面（见 §9 建议 5）。

---

## 9. 风险与建议（Loop 4+：加后处理 vs 继续 TSL 材质）

1. **最高性价比的后处理增量是 tone mapping，不是新 pass**。当前 NoToneMapping 直通
   + emissive `add` bloom，白爆全靠手工系数纪律压制（A6 光幕 ×0.7、反射 0.98 封顶）。
   启用 ACES/AgX（同仓 `car-configurator` 已有 ACES 先例，同 `three/webgpu` 栈零
   适配成本）可一次性换来高光滚降与色彩统一——**但必须连带重校 §5 整张 emissive
   台账**（threshold=1 的分界在 tone map 前后语义不同），属「一改全改」的批次级工程，
   不是零散调参。建议作为独立聚焦 PR，附同机位前后对照帧。
2. **SSAO/DOF 暂缓**。夜景 + emissive 主导画面 AO 收益低、成本高（法线/深度 MRT）；
   DOF 有 folio cheapDOF 蓝本可回补，但首幕是静止机位+中远景城市，景深叙事收益有限，
   且移动端（Q1）预算已被 bloom 占用。若 Loop 4 视觉审计点名「近景质感」再议。
3. **继续 TSL 材质仍是主提分通道**。现有纪律（uniform 切档零重编译、单一材质工厂、
   色相单源）健康；增量方向：幕墙 roughness/metalness 空间变化（窗框 vs 玻璃）、
   路面 normal 扰动（水洼边缘）、剪影层高度雾内衰减——全部零 pass 零资产。
4. **编译成本护栏**：当前三处事件级重编译面——阴影切档（全场景 needsUpdate）、
   Grid/Roads 反射切档（2 材质节点图重建）、材质首用编译（Q0+WebGPU 有 PreRenderer
   预热，**Q1/Q2 与 WebGL 后端没有**——低配档首次入画新材质可能卡顿，Loop 4 若加
   新常驻材质，注意其首帧编译落在挂载段而非驾驶中）。切档纪律「能 uniform 不重建」
   必须延续。
5. **draw call 台账现状**（挂城全量级）：剪影 1 + 光轨 1 + 灯杆 2 + 隔离墩 4 +
   招牌 10 + 楼宇（每栋 2–4）+ 路面/地坪/穹顶/Grid 各 1——量级健康；bloom 自身
   多一组 mips pass（默认 5 层降采样 + 合成），Q2 旁路是正确的止损面。清理项：
   Ticker 四个无消费方的 TSL uniform（每帧 4 次 value 写入，成本趋零但语义悬空）
   ——留作接口须补注释指路 `time` 节点为主源，或径直移除。

---

## 10. 文件索引（`src/lab/world/` 全树 51 文件 · 渲染职责一行说明）

### rendering/（4）
| 文件 | 职责 |
|---|---|
| `rendering/Rendering.ts` | WebGPURenderer 建器/回退、RenderPipeline+bloom 唯一后处理、Quality 三档（DPR/bloom/阴影）、renderOrder 排序纪律、dispose canvas 置换 |
| `rendering/NeonMaterials.ts` | 全城唯一 TSL 霓虹材质工厂（幕墙/剪影/发光件/灯箱/全息板/灯杆/路障 7 工厂）+ `neonUniforms` 三档共享 uniform |
| `rendering/MeshGridMaterial.ts` | folio 网格材质移植：Ben Golus 抗锯齿网格 TSL 函数出口 + unlit NodeMaterial 类（备用） |
| `rendering/PreRenderer.ts` | CubeCamera 32px 离屏全场景 shader 预编译（仅 Q0+WebGPU） |

### city/（13）
| 文件 | 职责 |
|---|---|
| `city/index.ts` | 城市装配入口：十系统挂载、Quality 联动接线（neon/大气/反射/剪影/光轨）、相机 far 1000、PreRenderer 调用门 |
| `city/CityMap.ts` | buildings JSON schema/加载/种子工具（数据面，无渲染） |
| `city/Roads.ts` | 路面/地坪程序化 TSL 材质（标线/路缘光/出生标记）+ 湿反射三档 + 路障/地面物理 |
| `city/ThemeTowers.ts` | hero 五栋：收分体量 + 幕墙/信标材质消费方 |
| `city/CityBlocks.ts` | standard 七栋：体块 + 幕墙/檐口材质消费方 |
| `city/CitySilhouette.ts` | 剪影层 InstancedMesh（1 draw call）+ Quality count 裁剪 |
| `city/Sky.ts` | 穹顶渐变/辉光/低云带 TSL + `scene.fogNode` 分层雾 + `atmosphereUniforms` 三档 |
| `city/NeonFacade.ts` | 薄壳 re-export（材质实现体已迁 NeonMaterials，防双材质系统） |
| `city/StreetProps.ts` | 霓虹隔离墩 InstancedMesh×4 + 顶环 emissive TSL |
| `city/BuildingSigns.ts` | 楼名招牌：TextCanvas 纹理 → 全息板 + 立面灯箱（mergeGeometries） |
| `city/StreetLamps.ts` | 灯杆 InstancedMesh×2 + 标语 atlas + 灯杆材质消费方 + 物理 |
| `city/FlightTrails.ts` | 飞行光轨：SpriteNodeMaterial `positionNode` 顶点级航线解析（1 draw call）+ 三档 |
| `city/HeroRobot.ts` | 机器人：GLB/回退机甲（经典材质）+ 接地环 TSL + 光柱/呼吸灯/rim 光 |

### world/（7）
| 文件 | 职责 |
|---|---|
| `world/World.ts` | 灰盒底座：灯光/阴影配置 + 程序化网格地面/锥桶 TSL 材质 + 物理地面 |
| `world/Grid.ts` | 城市地面：抗锯齿网格 emissive + reflector 实时反射三档 + `cityPuddleMask` 单源 |
| `world/TextCanvas.ts` | Canvas2D → THREE.Texture 文字纹理管线（flipY=false 契约） |
| `world/Reveal.ts` | 首幕剧本/DOM 编排（无自有材质；驱动机器人 update） |
| `world/Zones.ts` | 触发圈（wireframe 预览 mesh 一处，默认隐藏） |
| `world/References.ts` / `world/Respawns.ts` | Blender 引用注册表 / 重生点表（无渲染） |

### player/（4）· view/（1）
| 文件 | 职责 |
|---|---|
| `player/TransformSystem.ts` | 变形仪式：充能环/光幕 TSL 材质（JS uniform 补间）+ 热交换 |
| `player/VisualVehicle.ts` | CarConcept GLB rig + HDR `scene.environment`（全站唯一 IBL） |
| `player/Player.ts` / `player/KinematicFallback.ts` | 车辆契约/运动学档（无渲染） |
| `view/View.ts` | 相机系统：FOV/球坐标/focus/zoom/构图平移（渲染消费方，无材质） |

### core/（7）· inputs/（5）· physics/（2）· utils/（3）· areas/（4）· 入口
| 文件 | 职责 |
|---|---|
| `core/Game.ts` | 两阶段 init：scene/rendering/资源/物理装配序（坑①–④） |
| `core/Ticker.ts` | 渲染循环驱动的 tick 总线 + 4 个 TSL 时间 uniform（当前无消费方） |
| `core/Quality.ts` | 0/1/2 三档事实源 + change 事件 |
| `core/Viewport.ts` | 尺寸/DPR 量测（pixelRatioMax 档位闸） |
| `core/Objects.ts` | 视觉+物理注册表（Materials 系统未移植，updateMaterials no-op） |
| `core/ResourcesLoader.ts` | GLTF/Draco/KTX2 加载（`detectSupport` 处 type-only import 'three'） |
| `core/Events.ts` | 事件总线（无渲染） |
| `inputs/Nipple.ts` | 3D 摇杆环 SDF TSL 材质（inputs 中唯一渲染件） |
| `inputs/Inputs.ts` / `Keyboard.ts` / `Pointer.ts` / `RayCursor.ts` | 输入系统（无材质；RayCursor 仅射线求交） |
| `physics/Physics.ts` / `PhysicsVehicle.ts` | Rapier 物理（无渲染） |
| `utils/maths.ts` / `FpsMeter.ts` / `ObservableSet.ts` | 工具（无渲染） |
| `areas/Areas.ts` | POI 光圈（`createNeonGlowMaterial` 消费方）+ 触发圈接线 |
| `areas/InteractivePoints.ts` | POI 标点三件套 TSL 材质（键帽/标签/菱形圈） |
| `areas/Area.ts` / `areas/index.ts` | 区域基类/装配（无自有材质） |
| `index.ts`（world 根） | mount 契约：深链参数 → Game 装配 → city/robot/ritual/poi 动态分包 |

### 入口链（world 之外）
| 文件 | 职责 |
|---|---|
| `src/lab/modules/world/index.ts` | 薄入口：重依赖零静态 import，mount() 内动态 import 引擎分包 |
| `src/pages/index.astro` | 世界壳：挂载前零 world 字节（poster+引导脚本），`[data-world-canvas]` 画布 + HUD/cover DOM 契约 |
