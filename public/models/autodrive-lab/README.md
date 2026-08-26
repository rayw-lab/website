# autodrive-lab 资产留痕（CC-BL1）

合规依据：`docs/research/cyber-city-github-assets-research.md` §3/§5（资产留痕规范）。
台账正本见 `docs/spec/asset-ledger-cyber-city.md`。

## AutodriveLab.glb

| 项 | 内容 |
|----|------|
| 来源 | **100% 原创程序化生成**——Blender 4.0 headless 脚本 `scripts/blender/generate-autodrive-lab.py`（本仓单源，零外部资产、零许可负担、无 .blend 二进制入库） |
| 生成日期 | 2026-08-26 |
| 许可 | 随仓库（自有资产；几何/贴图/材质全部脚本生成，确定性 seed=0x1206） |
| 体积 | **157,444 B（≈154 KB）** ≤ 10MB spike 合同；12MB 资产池入账后合计 ≈4.0MB |
| 几何 | 4,622 tris（合同 ≤100k）· 13 具名材质 primitive = 13 draw call |
| 贴图 | 3 张程序化 atlas 全部 KTX2/ETC1S（≤1024²，合同 ≤2K）：窗内景 8×8 emissive atlas / 幕墙金属板可平铺 / 工具四象限（警示纹·棋盘·纯橙·卷帘肋） |
| 压缩 | `gltf-transform etc1s --quality 255`（toktx/KTX-Software 4.3）→ `gltf-transform draco`；extensionsRequired = `KHR_draco_mesh_compression` + `KHR_texture_basisu`，emissive >1 走 `KHR_materials_emissive_strength` |
| 内容 | autodrive-lab hero 楼实模（裙房橱窗展车/门厅/试车卷帘门 + 双阶塔身逐窗幕墙 + 屋顶设备/信标）+ 十字路口东北角道具簇（充电桩×4+光伏雨棚、试车升降台、全息 totem、标定板、杂件、门廊） |

## 坐标与合同（消费端 `src/lab/world/city/HeroBlenderMesh.ts`）

- 原点 = 楼体足迹中心地面点；运行时平移到 buildings JSON `position` (52,−52) 并按
  `rotationY` 旋转。视觉包络 = footprint w44×d36×h60 同笼（物理碰撞体沿用
  ThemeTowers footprint cuboid，不随实模改动）。
- BuildingSigns 立面灯箱挂点（±(w/2+0.35)/±(d/2+0.35)、挂高 20.4）已在模型侧
  留「招牌避让背板区」（西/南立面 24m 宽 dark 背板，竖梃/层间梁截断让位）。
- 楼顶全息板对角线 x+z=0 邻域已让空（机房/风机/桅杆全部偏轴）。
- 泊车圈 parkingBay (28,−28) r6 + 隔离墩缺口→泊车位对角行车走廊：道具全部让空。
- 材质名合同（运行时按名微调可用）：`Facade / FacadeDark / Window / MetalDark /
  Metal / AccentOrange / BeaconOrange / ScreenCyan / InteriorWarm / Concrete /
  Utility / CarShell / GlassDark`。
- 色纪律（rubric A3）：窗格暖白/青/暗三族 atlas；楼宇身份色 #ff6b35 只进 LED
  竖带/檐口线/信标/警示件；emissive 全部 ≤1 阈下，唯一辉光锚 = 屋顶信标 +
  门架警灯（`BeaconOrange` strength 2.2 > bloom threshold 1）。

## 复现管线

```bash
blender -b --factory-startup -P scripts/blender/generate-autodrive-lab.py -- --out /tmp/bl1-asset
pnpm dlx @gltf-transform/cli etc1s /tmp/bl1-asset/AutodriveLab-raw.glb /tmp/bl1-asset/AutodriveLab-etc1s.glb --quality 255
pnpm dlx @gltf-transform/cli draco /tmp/bl1-asset/AutodriveLab-etc1s.glb public/models/autodrive-lab/AutodriveLab.glb
```

（etc1s 需系统装 KTX-Software `toktx`：<https://github.com/KhronosGroup/KTX-Software/releases>）

## 回退合同（Premortem R4 同款止损）

- 运行时唯一引用点：buildings JSON `autodrive-lab.heroGlb` → `HeroBlenderMesh.ts`。
  **同名覆盖本文件即完成热替换**，代码零改动。
- Q2 挂载不发起加载（止损档零 GLB 字节）；Q0/Q1 加载失败 console.warn 后
  静默回退程序化 ThemeTowers 体块——世界照常起，招牌/物理/POI 全部不受影响。
