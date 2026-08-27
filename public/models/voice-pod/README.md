# voice-pod 资产留痕（CC-VIS-X1B）

合规依据：`docs/research/cyber-city-github-assets-research.md` §3/§5（资产留痕规范）。
台账正本见 `docs/spec/asset-ledger-cyber-city.md`。BL1 管线模板见
`public/models/autodrive-lab/README.md`（本楼为同管线第三栋，仅差异项另述）。

## VoicePod.glb

| 项 | 内容 |
|----|------|
| 来源 | **100% 原创程序化生成**——Blender 4.0 headless 脚本 `tools/blender/generate-voice-pod.py`（本仓单源，零外部资产、零许可负担、无 .blend 二进制入库） |
| 生成日期 | 2026-08-27（CC-VIS-X1B 第三栋 hero，设计确认 §3 W2③） |
| 许可 | 随仓库（自有资产；几何/贴图/材质全部脚本生成，确定性 seed=0x2D6F——身份色 #ff2d6f 尾值，与 BL1 0x1206 / BL2 0x2207 区分 → 窗格纹样独立） |
| 体积 | **170,068 B（≈166 KB）** ≤ 10MB spike 合同、≤300KB/栋 批预算（BR X1 风险条）；SHA-256 `56c96b24583c2d10d7eb469d2a1689fbf3261c25267a70896db46a9abce3ea30`（复现管线全跑两遍字节级一致） |
| 几何 | 3,054 tris（合同 ≤100k）· 13 具名材质 primitive = 13 draw call |
| 贴图 | 3 张程序化 atlas 全部 KTX2/ETC1S（≤1024²，合同 ≤2K）：窗内景 8×8 emissive atlas / **穿孔声学幕墙板**可平铺（点阵孔=声学舱材质证据，区分 BL1 铆钉板）/ 工具四象限（警示纹·**消声劈尖**·纯粉·卷帘肋） |
| 压缩 | `gltf-transform etc1s --quality 255`（toktx/KTX-Software）→ `gltf-transform draco`；extensionsRequired = `KHR_draco_mesh_compression` + `KHR_texture_basisu`，emissive >1 走 `KHR_materials_emissive_strength` |
| 内容 | voice-pod「座舱语音舱」hero 楼实模：裙房（西门厅**消声劈尖内壁** + 北立面**座舱试听橱窗**——展台+试听座舱车+环绕声阵列 ×5 + TTS 波形直播屏）+ 主塔身逐窗幕墙 + **扬声环鳍 ×3**（纸盆叠层体量图腾）+ 均衡器 LED 光条带（声音可视化立面）+ **波形天冠**（四面声波柱参差剪影，整帧远读第一识别件，与 BL1 双阶收分 / BL2 鼓塔区分）+ 屋面设备/桅杆信标 |

## 选楼裁定（CC-VIS-L8-DES §3 W2③ 标准转录）

候选 work-gallery / tts-cockpit（=voice-pod）楼，「robot_idle 视锥或主干道驾驶动线
可见」优先：

- robot_idle（ritual_idle 机位）视锥：双候选皆不可入帧——work-gallery outOfFrame
  为 `src/data/camera-shots.json` 在案机器门（东向 x≥110 物理不可入帧，AL-BL2 §2.1）；
  voice-pod (52,52) 位于机位（视线 NNW）后方 SE 象限，同样不可达。
- 主干道驾驶动线：**voice-pod 双临街**（中轴大道 × 霓虹大街交叉口东南角，出生
  路口四塔之一，变形起步/任意方向驶离路口均沿途可见）胜出 work-gallery 单临街
  （霓虹大街东段）→ 取 voice-pod。
- 归因纯净加权：voice-pod 已是 ThemeTowers hero 在册（`lodProfile: hero`），补
  `heroGlb` 字段即挂载——**引擎零改动**（`CityMap.ts` 合同原文）；work-gallery 需
  `standard→hero` 翻转，连带 CityBlocks→ThemeTowers 回退视觉变化，污染 V4 净增益
  归因。V7 捎带：deepLink live `/lab/tts-cockpit/`，BuildingSigns 产品线
  `IN-CAR TTS` 已在册（楼=产品线帧内自明）。

## 坐标与合同（消费端 `src/lab/world/city/HeroBlenderMesh.ts`）

- 原点 = 楼体足迹中心地面点；运行时平移到 buildings JSON `position` (52,52) 并按
  `rotationY` 旋转。视觉包络 = footprint w32×d32×h42 **严格同笼**（脚本内置包络
  自检 assert：实测 |x|≤16.33 / |y|≤16.34 / z≤41.75——桅杆信标顶 41.75，含竖梃/
  环鳍 ≤0.35 工艺容差；物理碰撞体沿用 ThemeTowers footprint cuboid，**零基座外挑、
  零随楼道具、零新增碰撞体**——`HeroBlenderMesh.PROP_COLLIDERS` 无本楼条目，
  引擎文件零逻辑改动）。
- BuildingSigns 挂点避让（模型侧已留）：西/北立面街层灯箱（挂高 ≈7.6、面板高
  ≈2.3）→ 两墙 along 楼心 ±8 × z∈[6.2,9.0] 竖梃截断 + 0.05 凸暗背板（灯箱 proud
  0.35 → 净距 0.30，BL1 同款）；西立面楼身竖幅（沿立面 +z(three) 偏 9.6 → 本地
  by=−9.6，顶 0.9h=37.8）→ **竖幅背板脊**（FacadeDark by∈[−12,−7.2] 升至 38.3
  全程承接，幕墙区 clear_rects 同步让位，波形天冠/均衡器条带该区间跳空）。
- 楼顶全息板（挂高 43.1–46.3、朝路口对角 → 本地 bx=by 对角带）：屋面机房/风机/
  桅杆全部押反对角（bx=−by 侧），对角带让空；声波柱顶 ≤38.3 低于板底 43.1 无遮挡。
- 泊车圈 parkingBay 世界 (12,28) r6 → 本地 (−40,24)，在 footprint 笼外 24m，模型
  无出笼件即天然让空；StreetLamps/FlightTrails 均在笼外，零冲突。
- 材质名合同（运行时按名微调可用）：`Facade / FacadeDark / Window / MetalDark /
  Metal / AccentPink / BeaconPink / ScreenCyan / InteriorWarm / Concrete /
  Utility / CarShell / GlassDark`（与 BL1 仅差身份色两名：Orange→Pink）。
- 色纪律（rubric A3）：窗格暖白/青/暗三族 atlas；楼宇身份色 #ff2d6f 只进 LED
  檐口线/均衡器光条/环鳍细线/天冠环带/竖幅描边/信标；工业警示件保持通用橙黑
  （不随楼染色）；emissive 全部 ≤1 阈下（`AccentPink` 0.85 / `Window` `ScreenCyan`
  0.95 / `InteriorWarm` 0.9 不占辉光名额），**唯一辉光锚 = 屋顶信标**（`BeaconPink`
  strength 2.2 > bloom threshold 1，BL1/BL2 同款先例；零新增循环动画，配额不动）。

## 复现管线

```bash
blender -b --factory-startup -P tools/blender/generate-voice-pod.py -- --out /tmp/x1b-asset
pnpm dlx @gltf-transform/cli etc1s /tmp/x1b-asset/VoicePod-raw.glb /tmp/x1b-asset/VoicePod-etc1s.glb --quality 255
pnpm dlx @gltf-transform/cli draco /tmp/x1b-asset/VoicePod-etc1s.glb public/models/voice-pod/VoicePod.glb
```

（etc1s 需系统装 KTX-Software `toktx`：<https://github.com/KhronosGroup/KTX-Software/releases>）

## 回退合同（Premortem R4 同款止损）

- 运行时唯一引用点：buildings JSON `voice-pod.heroGlb` → `HeroBlenderMesh.ts`。
  **同名覆盖本文件即完成热替换**，代码零改动。
- Q2 挂载不发起加载（止损档零 GLB 字节）；Q0/Q1 加载失败 console.warn 后
  静默回退程序化 ThemeTowers 体块——世界照常起，招牌/物理/POI 全部不受影响。
