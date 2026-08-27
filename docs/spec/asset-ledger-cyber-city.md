# 科技城资产台账（Cyber City Asset Ledger）

| 项 | 内容 |
|----|------|
| 建账 Task | **CC-E5**（机器人英雄接入，2026-08-25） |
| 职责 | SRD §12.7.2「资产首包预算 + 资产台账」的落地载体：科技城专项资产**逐笔登记**来源 / 许可 / 体积 / 入库路径；CC-E3/E4/MAP1 等后续 Task 的新增资产在本表追加 |
| 合规框架 | `docs/research/cyber-city-github-assets-research.md` §1.2 许可分级 + §5 操作规范 |
| 集中声明 | 仓库根 `THIRD-PARTY-NOTICES.md`（本台账为科技城明细账，notices 为全站总账） |

## 1. 在册资产

| # | 资产 | 入库路径 | 来源（URL + 获取日期） | 许可 | 体积（字节实测） | 首包归属 | 预算对照 |
|---|------|---------|----------------------|------|----------------|---------|---------|
| 1 | 机器人英雄 GLB（Quaternius Animated Mech Pack「Stan」换装钛灰/青/橙 + Draco） | `public/models/hero-robot/HeroRobot.glb` | <https://quaternius.com/packs/animatedmech.html>（官方 Google Drive，`Flat Colors/glTF/Stan.gltf`，2026-08-25） | **CC0 1.0**（包内 `License.txt` + 官网全站声明；改造后仍零署名义务） | **345,360 B（≈338 KB）** | 科技城首包（机器人条目） | ≤ 800KB ✅（SRD §12.7.2 / CITY-04；余量 462KB） |
| 2 | AutoDrive Lab hero 楼实模 + 东北角道具簇 GLB（Blender 4.0 headless 全程序化生成 + Draco + KTX2/ETC1S，CC-BL1） | `public/models/autodrive-lab/AutodriveLab.glb` | 本仓脚本 `tools/blender/generate-autodrive-lab.py`（确定性 seed，2026-08-26 生成；零外部网格/贴图，无 .blend 二进制入库） | **原创**（随仓库许可；零第三方义务） | **157,444 B（≈154 KB）** | 非首包（Q0/Q1 城市挂载后异步流式拉取；Q2 挂载零字节零请求） | 单 GLB ≤10MB spike 合同 ✅（4,622 tris ≤100k、贴图 3 张 KTX2 ≤1024²≤2K）；world 流式池 ≤12MB（`audit-budget` G-G(world) 直测目录）✅ |
| 3 | CarConcept Garage 沿街 hero 楼实模 + 西端天际线段 + 南前场道具簇 GLB（Blender 4.0 headless 全程序化生成 + Draco + KTX2/ETC1S，CC-BL2 / CC-BL2-PLUS 补洞重生成） | `public/models/concept-garage/ConceptGarage.glb` | 本仓脚本 `tools/blender/generate-concept-garage.py`（确定性 seed=0x2207，2026-08-27 重生成；零外部网格/贴图，无 .blend 二进制入库；SHA-256 `2f529589070bd239149116eaf6a5b0e761c36af1c4efca5a3bd0483314058303`，审计复现 = 同脚本 + `gltf-transform etc1s --quality 255` + `gltf-transform draco` 字节级一致） | **原创**（随仓库许可；零第三方义务） | **148,240 B（≈145 KB）** | 非首包（Q0/Q1 城市挂载后异步流式拉取；Q2 挂载零字节零请求） | 单 GLB ≤10MB spike 合同 ✅（2,928 tris ≤100k、贴图 3 张 KTX2 ≤1024²≤2K）；world 流式池 ≤12MB（`audit-budget` G-G(world) 直测目录）✅；视觉包络：主体 h18 同笼 + 西端天际线段上探（肩块 21.6/螺旋塔 26.05/信标顶 31.55，AL-BL2 §8.1 批准；物理碰撞 h18 合同不变） |

改造与复现细节：`public/models/hero-robot/README.md`（改造清单、热替换约定、失败回退）；管线脚本全文见附录 A。autodrive-lab / concept-garage 生成/压缩管线、材质名合同与回退合同见各自 `public/models/*/README.md`（复现命令三行：blender headless → `gltf-transform etc1s` → `gltf-transform draco`；两楼同管线，BL2 差异项 = 身份色 `AccentBlue/BeaconBlue`、seed 0x2207、无柱悬挑雨棚泊车圈让空）。

## 2. 复用资产（已在库，科技城引用、不计新增）

| 资产 | 路径 | 许可 | 科技城用途 |
|------|------|------|-----------|
| CarConcept 概念车 | `public/models/car-concept/`（≈3.5MB） | CC BY 4.0（Khronos Group + DGG，已在页脚/Demo 页署名） | 变形后玩家车（SRD §12.7.2 豁免复用件，不进首包、idle 预取） |
| Studio Small 08 HDRI | `public/hdri/studio_small_08_1k.hdr` | CC0（Poly Haven） | Spike/配置器 IBL；科技城夜景 HDRI 另行立项时在本表追加 |

## 3. 首包预算滚动核算（SRD §12.7.2：科技城净新增 ≤ 2MB）

| 分项 | 预算 | 已登记实测 | 状态 |
|------|------|-----------|------|
| 机器人 Draco GLB | ≤ 800KB | 338KB | ✅（CC-E5） |
| 出生圈 H 档 5 栋 | ≤ 900KB | —（待 CC-E3/MAP1 落资产后登记） | 未启用 |
| 窗格 atlas / 杂项 | ≤ 300KB | —（待 CC-E4） | 未启用 |
| **净新增合计** | **≤ 2MB** | **338KB** | ✅ 余量 1.71MB |

## 附录 A：hero-robot 一次性构建管线（不入依赖树，复现即重跑）

依赖：`@gltf-transform/core@4` `@gltf-transform/functions@4` `@gltf-transform/extensions@4` `draco3dgltf`

```js
// build.mjs —— 输入 Stan.gltf（CC0），输出 HeroRobot.glb
// ① 动画 20 → 2（Idle+Walk）② 材质换装（sRGB hex → hexToFactor 线性，勿再叠 convertSRGBToLinear）
// ③ resample/dedup/prune ④ Draco(edgebreaker)
import { ColorUtils, NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { dedup, draco, prune, resample } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const lin = (hex) => ColorUtils.hexToFactor(hex, []);
// 金属度整体压低：灰盒世界无 IBL，高 metallic 发黑；CC-E4 IBL 就位后按材质名热调
const PALETTE = {
  Main:      { color: lin(0x5c6472), metallic: 0.55, roughness: 0.45 }, // 钛灰主装甲
  Accent:    { color: lin(0xff6b35), metallic: 0.2,  roughness: 0.5  }, // 工业橙警示条
  Grey:      { color: lin(0x3a404c), metallic: 0.5,  roughness: 0.5  },
  LightGrey: { color: lin(0xb3bac6), metallic: 0.65, roughness: 0.32 },
  Black:     { color: lin(0x1a1d24), metallic: 0.3,  roughness: 0.6  },
  Eye:       { color: lin(0x49c5b6), metallic: 0,    roughness: 0.3, emissive: lin(0x49c5b6) },
};
const KEEP_CLIPS = new Set(['Idle', 'Walk']);

const io = new NodeIO().registerExtensions([KHRDracoMeshCompression]).registerDependencies({
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
const document = await io.read('Stan.gltf');
const root = document.getRoot();
for (const anim of root.listAnimations()) if (!KEEP_CLIPS.has(anim.getName())) anim.dispose();
for (const material of root.listMaterials()) {
  const spec = PALETTE[material.getName()];
  if (!spec) continue;
  material.setBaseColorFactor([...spec.color, 1]);
  material.setMetallicFactor(spec.metallic);
  material.setRoughnessFactor(spec.roughness);
  if (spec.emissive) material.setEmissiveFactor(spec.emissive);
}
await document.transform(resample(), dedup(), prune({ keepAttributes: false, keepLeaves: false }));
await document.transform(draco({ method: 'edgebreaker' }));
await io.write('HeroRobot.glb', document);
```
