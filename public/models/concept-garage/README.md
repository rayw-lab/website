# concept-garage 资产留痕（CC-BL2）

合规依据：`docs/research/cyber-city-github-assets-research.md` §3/§5（资产留痕规范）。
台账正本见 `docs/spec/asset-ledger-cyber-city.md`。BL1 管线模板见
`public/models/autodrive-lab/README.md`（本楼为同管线第二栋，仅差异项另述）。

## ConceptGarage.glb

| 项 | 内容 |
|----|------|
| 来源 | **100% 原创程序化生成**——Blender 4.0 headless 脚本 `tools/blender/generate-concept-garage.py`（本仓单源，零外部资产、零许可负担、无 .blend 二进制入库） |
| 生成日期 | 2026-08-27（CC-BL2-PLUS 补洞重生成：新增西端天际线段） |
| 许可 | 随仓库（自有资产；几何/贴图/材质全部脚本生成，确定性 seed=0x2207，与 BL1 0x1206 区分 → 窗格纹样独立） |
| 体积 | **148,240 B（≈145 KB）** ≤ 10MB spike 合同；SHA-256 `2f529589070bd239149116eaf6a5b0e761c36af1c4efca5a3bd0483314058303`（复现管线全跑两遍字节级一致） |
| 几何 | 2,928 tris（合同 ≤100k）· 13 具名材质 primitive = 13 draw call |
| 贴图 | 3 张程序化 atlas 全部 KTX2/ETC1S（≤1024²，合同 ≤2K）：窗内景 8×8 emissive atlas / 幕墙金属板可平铺 / 工具四象限（警示纹·棋盘·纯蓝·卷帘肋） |
| 压缩 | `gltf-transform etc1s --quality 255`（toktx/KTX-Software 4.3）→ `gltf-transform draco`；extensionsRequired = `KHR_draco_mesh_compression` + `KHR_texture_basisu`，emissive >1 走 `KHR_materials_emissive_strength` |
| 内容 | concept-garage 沿街 hero 楼实模（3 间暖光展厅橱窗+概念展车 / 门厅无柱悬挑雨棚 / 双卷帘门+服务窗 / 中段逐窗幕墙 / 设备顶带 / 屋顶 HVAC）+ **西端天际线段**（CC-BL2-PLUS：西肩块 21.6 → 螺旋塔 26.05 + 蓝 LED 螺旋带「立体停车坡道」图腾 → 塔顶桅杆蓝信标 31.55 + 东端书挡 21.1——沿街整帧 60-100m 一眼认楼件）+ 南前场道具簇（室外展车台、配置器 kiosk、横幅旗杆×2、备件箱堆、轮胎堆、服务推车、地面导视光条） |

## 坐标与合同（消费端 `src/lab/world/city/HeroBlenderMesh.ts`）

- 原点 = 楼体足迹中心地面点；运行时平移到 buildings JSON `position` (140,−44) 并按
  `rotationY` 旋转。视觉包络 [CC-BL2-PLUS]：主体 = footprint w60×d36×h18 同笼；
  西端天际线段经 AL-BL2 §8.1 批准上探——西肩块 bx∈[−30,−12.2] 至 21.6、螺旋塔
  bx∈[−27.5,−12.5]×by∈[−1.5,13.5] 至 26.05、塔顶桅杆信标至 31.55、东端书挡
  bx∈[24,29.5] 至 21.1（物理碰撞体沿用 ThemeTowers footprint cuboid h18 不变——
  18m 以上无可达路径无碰撞需求，FlightTrails 三航线包络离本楼 ≥5m 已核；前场道具
  碰撞体在 `HeroBlenderMesh.PROP_COLLIDERS['concept-garage']` 注册 9 件，零改动）。
- BuildingSigns 南立面灯箱挂点（by=−(18+0.35)、挂高 min(25,max(9,0.34h))=9）已在
  模型侧留「招牌避让背板区」bx∈[−10.2,10.2] z∈[7.0,11.0]（FacadeDark 背板 0.05 凸，
  竖梃/层间梁截断让位）。
- 楼顶全息板走廊 bx∈[−10.5,10.5] × by∈[−1.8,1.8] 已让空（HVAC/桥架/排风筒全部
  偏轴；天际线段肩块东缘 −12.2/压顶 −12.1、螺旋塔东缘 −12.5 均在走廊外，全息板
  背景天空不受遮挡；信标随桅杆迁塔顶——辉光锚仍为「屋顶信标 + 卷帘门警灯」两处）。
- 泊车圈 parkingBay (140,−18) r8 → 本地 bx∈[−8,8] by∈[−34,−18] 让空（POI 深链
  泊车位）；StreetLamps 灯杆世界 (150,−13.5) → 本地 (10,−30.5) 邻域 ≥2m 让空；
  卷帘门正面（bx 3.75~18.75 的 by −18~−24 带）留出入通道——门厅雨棚为此做
  **无柱悬挑**（立柱会落进泊车圈，底部横撑杆回锚立面）。
- 材质名合同（运行时按名微调可用）：`Facade / FacadeDark / Window / MetalDark /
  Metal / AccentBlue / BeaconBlue / ScreenCyan / InteriorWarm / Concrete /
  Utility / CarShell / GlassDark`（与 BL1 仅差身份色两名：Orange→Blue）。
- 色纪律（rubric A3）：窗格暖白/青/暗三族 atlas；楼宇身份色 #3b82f6 只进 LED
  檐口线/横幅/螺旋带/信标；工业警示件保持通用橙黑（不随楼染色）；emissive 全部 ≤1
  阈下（螺旋带 `AccentBlue` 0.85 不占辉光名额），唯一辉光锚 = 屋顶信标 + 卷帘门
  警灯（`BeaconBlue` strength 2.2 > bloom threshold 1）。

## 复现管线

```bash
blender -b --factory-startup -P tools/blender/generate-concept-garage.py -- --out /tmp/bl2-asset
pnpm dlx @gltf-transform/cli etc1s /tmp/bl2-asset/ConceptGarage-raw.glb /tmp/bl2-asset/ConceptGarage-etc1s.glb --quality 255
pnpm dlx @gltf-transform/cli draco /tmp/bl2-asset/ConceptGarage-etc1s.glb public/models/concept-garage/ConceptGarage.glb
```

（etc1s 需系统装 KTX-Software `toktx`：<https://github.com/KhronosGroup/KTX-Software/releases>）

## 回退合同（Premortem R4 同款止损）

- 运行时唯一引用点：buildings JSON `concept-garage.heroGlb` → `HeroBlenderMesh.ts`。
  **同名覆盖本文件即完成热替换**，代码零改动。
- Q2 挂载不发起加载（止损档零 GLB 字节）；Q0/Q1 加载失败 console.warn 后
  静默回退程序化 ThemeTowers 体块——世界照常起，招牌/物理/POI 全部不受影响。
