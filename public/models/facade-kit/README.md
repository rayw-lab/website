# facade-kit 资产留痕（CC-VIS-X2-FACADE-R2）

合规依据：`docs/research/cyber-city-github-assets-research.md` §3/§5（资产留痕规范）。
台账正本见 `docs/spec/asset-ledger-cyber-city.md`。BL1/BL2 管线模板见
`public/models/autodrive-lab/README.md` / `public/models/concept-garage/README.md`
（本套件为同管线第四件，形态差异 = **模块化构件库**而非单楼实模，仅差异项另述）。

## FacadeKit.glb

| 项 | 内容 |
|----|------|
| 来源 | **100% 原创程序化生成**——Blender 4.0 headless 脚本 `tools/blender/generate-facade-kit.py`（本仓单源，零外部资产、零许可负担、无 .blend 二进制入库） |
| 生成日期 | 2026-08-27（CC-VIS-X2-FACADE-R2） |
| 许可 | 随仓库（自有资产；几何/贴图/材质全部脚本生成，确定性 seed=0x2FAC，与 BL1 0x1206 / BL2 0x2207 / X1b 0x2D6F 区分） |
| 体积 | **80,024 B（≈78 KB）** ≤ 10MB spike 合同；SHA-256 `f5e25ef8549d6f4823fde078fa4711d1ed039a770cbaa5d8ca352a4edcf6276c`（复现管线全跑两遍字节级一致） |
| 几何 | 1,474 tris（合同 ≤100k）· 10 具名 mesh 共用 1 材质（运行时每类 1 InstancedMesh = 1 draw call，全套 ≤10 draw call） |
| 贴图 | 2 张程序化 atlas 全部 KTX2/ETC1S（base 1024² + emissive 512²，合同 ≤2K）：8 分区语义图集（金属板/暗板/警示纹/百叶/暖光/青光/屏幕/管壁） |
| 压缩 | `gltf-transform etc1s --quality 255`（toktx/KTX-Software 4.3）→ `gltf-transform draco`；extensionsRequired = `KHR_draco_mesh_compression` + `KHR_texture_basisu`；emissive 全部 ≤1 阈下（无 `KHR_materials_emissive_strength` 需求） |
| 内容 | **立面件 ×6**（KitCanopy 入口雨棚 / KitAcCluster 空调外机组 / KitPipeRun 竖向管线组（y 可缩放）/ KitBalcony 检修走台 / KitLouver 百叶板 / KitRoofVent 屋顶设备组）+ **街角道具 ×3**（PropVending 售货亭 / PropCabinet 配电箱 / PropBin 垃圾箱组）+ **前景景框 ×1**（FramePipeBridge 跨路管线桥 34m） |

## §NDC：可见楼清单先行（X2 硬合同——立面投资只进可见面）

复现：`node tools/camera/audit-x2-visibility.mjs`（读 `src/data/camera-shots.json`
ritual_idle 机位 + `src/data/cyber-city-buildings.json` 足迹，1440×900 八角点投影）。
清单消费方 = `CityBlocks.FACADE_PLAN`（背街/不可见面零投入）。

- **首幕入帧（tier 1，追加 firstFrame 面 + roof 屋顶件）**：now-signal（4/8 角点
  inFrustum）、workflow-foundry（4/8）、edge-cloud-hub（1/8）——standard 楼中仅此
  三栋进 ritual_idle 帧；agent-nexus（3/8）为程序化主题塔，不在本套件贴附域。
- **主干道临街面（street，驾驶动线近读，全套构件）**：work-gallery 北面→NeonBlvd、
  insights-archive 西面→AxisAve、about-pavilion 东面→AxisAve、contact-beacon
  北面→NeonBlvd、edge-cloud-hub 南面→NeonBlvd、workflow-foundry 西面→AxisAve、
  now-signal 东面→AxisAve（楼近缘-路缘 12–22m，近读距离）。
- **前景桥 NDC 预演**（[CC-VIS-X2-PLUG] 桥位 z −26 → −19.5，让出 e2e 驾驶走廊带
  z∈[−24,−28]——腿柱碰撞面走廊余量核对见探针 §④）：桥体 (0,0,−19.5) 沿 X 跨中轴
  大道——桥面带投影帧顶（deck ndc.y +0.74…+0.97，管束顶 +0.87…+1.18 溢出帧顶），
  东腿 ndc.x +0.96 压右缘，机器人（ndc −0.34, −0.44…−0.16）零遮挡；北向驾驶从
  桥下穿（净高 13.4m）。

## 坐标与合同（消费端 `src/lab/world/city/FacadeKit.ts`）

- 构件本地系：立面件原点 = 贴墙点（构件向 three +Z 凸出，运行时 rotY 对齐立面
  法向）；独立件（KitRoofVent/Prop*/FramePipeBridge）原点 = 底面中心。
- 消费方三处：`CityBlocks.attachFacades`（FACADE_PLAN 逐楼逐面摆位）/
  `StreetProps.placeCornerProps`（PROP_CLUSTERS 六簇三件套）/
  `ForegroundFraming`（桥 (0,0,−19.5) 单实例，[CC-VIS-X2-PLUG] 南移让出走廊）。
- 材质名合同：`KitSurface`（唯一材质；运行时按名微调可用）。
- 色纪律（rubric A3）：只用既有三族色（暖白/青/暗）+ 通用工业橙黑警示纹；
  **不引入新色相、不使用楼宇身份色**（套件跨楼共享，身份色归 BuildingSigns 域）；
  emissive 全部 ≤1 阈下（KitSurface strength 0.95）——**零新增辉光锚**（R2 不动
  bloom threshold=1 与既有 strength）。
- 动效纪律：全部静态件（D7「前景景框静态、零循环配额」；桥上警灯为阈下 emissive
  静态点阵非动画）；零新增事件（道具碰撞体不挂 onCollision，OBS 白名单零改动）。

## §碰撞（Q2 防隐形墙合同）

| 构件 | 碰撞体 | 依据 |
|------|--------|------|
| PropVending | cuboid 半长宽高 [0.65, 1.14, 0.48] | 街面可达，车/机器人可撞（六簇合 1 个 fixed 刚体） |
| PropCabinet | cuboid [0.8, 0.85, 0.4] | 同上 |
| PropBin | cuboid [0.85, 0.53, 0.4] | 同上 |
| FramePipeBridge 腿柱 ×2 | cuboid [0.62, 6.7, 0.62]（±15.7 路缘外） | plaza 可达；桥面 13.4m 高于一切可达路径零碰撞 |
| 立面件 ×6 | **无** | 雨棚底 3.6m/走台 h·0.52 高于车顶；贴墙件凸出 ≤0.28m 在楼体碰撞盒容差内 |

全部碰撞体经 `FacadeKit.registerBody` 登记：Q2 与视觉同步 disable（隐藏构件时
无隐形墙），升/降档热切同步 enable/disable。

## 复现管线

```bash
blender -b --factory-startup -P tools/blender/generate-facade-kit.py -- --out /tmp/x2-asset
pnpm dlx @gltf-transform/cli etc1s /tmp/x2-asset/FacadeKit-raw.glb /tmp/x2-asset/FacadeKit-etc1s.glb --quality 255
pnpm dlx @gltf-transform/cli draco /tmp/x2-asset/FacadeKit-etc1s.glb public/models/facade-kit/FacadeKit.glb
```

（etc1s 需系统装 KTX-Software `toktx`：<https://github.com/KhronosGroup/KTX-Software/releases>）

## 回退合同（Premortem R4 同款止损）

- 运行时唯一引用点：`src/lab/world/city/FacadeKit.ts`（`models/facade-kit/FacadeKit.glb`）。
  **同名覆盖本文件即完成热替换**，代码零改动。
- Q2 挂载不发起加载（止损档零 GLB 字节零解码）；Q0/Q1 加载失败 console.warn 后
  静默回退——楼体/道具碰撞/物理/POI 全部照常（构件是纯细节层，无功能依赖）。
- Q2 挂载后升档不补加载（零字节承诺以挂载时档位为准，CitySilhouette 密度档同纪律）。
