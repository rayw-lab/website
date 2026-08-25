# hero-robot 资产留痕（CC-E5）

合规依据：`docs/research/cyber-city-github-assets-research.md` §3（D2 终稿）与 §5 第 2 条
（CC0 资产留痕规范）。台账正本见 `docs/spec/asset-ledger-cyber-city.md`。

## HeroRobot.glb

| 项 | 内容 |
|----|------|
| 基底来源 | Quaternius **Animated Mech Pack**（4 台机甲中选「Stan」——块面宽胸、五指手、直立人形，最贴 CITY-04「块面机甲·英雄站姿」） |
| 下载渠道 | <https://quaternius.com/packs/animatedmech.html> → 官方 Google Drive 文件夹（`Flat Colors/glTF/Stan.gltf`） |
| 下载日期 | 2026-08-25 |
| 许可 | **CC0 1.0 Universal**（包内 `License.txt` 原文声明 + 官网全站声明；零署名义务，可改可商用） |
| 体积 | **345,360 B（≈338 KB）** ≤ 800KB Draco 预算（SRD §12.7.2 / §12.7.4） |
| 几何 | 5,972 tris，单 skinned mesh × 6 具名材质原语 |
| 动画 | 保留 `Idle`（4.17s）+ `Walk` 两剪辑（配额 ≤2，assets research §3.3）；原包其余 16 剪辑已剔除 |
| 模型原生高度 | ≈6.4 m（运行时由 `HeroRobot.ts` 按 `targetHeight`（默认 9m，8–12m 级）等比缩放） |

## 改造清单（与任何现成模型拉开辨识距离，D2 反 IP 论证第 3/4 条）

1. **动画裁剪**：20 剪辑 → `Idle` + `Walk`；`resample` + `dedup` + `prune`（剔除无贴图引用的 TEXCOORD_0）。
2. **配色换装（烘焙进资产）**：原包红/灰涂装全弃，按全站 token 重制——
   `Main` 钛灰 `#5c6472`、`Accent` 工业橙 `#ff6b35`、`Grey` `#3a404c`、`LightGrey` `#b3bac6`、
   `Black` `#1a1d24`、`Eye` 青 `#49c5b6`（含同色 emissive，运行时呼吸灯载体）。
   金属度整体压低（0.2–0.65）：灰盒世界无 IBL，高 metallic 发黑；CC-E4 霓虹/IBL 就位后可按材质名热调。
3. **Draco 压缩**：`KHR_draco_mesh_compression`（edgebreaker），1,667KB → 338KB。
4. 零 Transformers 商标元素：无红蓝涂装、无胸口卡车窗、无徽章、无火焰纹；命名仅 `HeroRobot`。

## 复现管线（一次性脚本，不入依赖树）

```
npm i @gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4 draco3dgltf
node build.mjs   # 脚本全文归档于 docs/spec/asset-ledger-cyber-city.md 附录
```

## 热替换路径（Premortem R4 / Phase 1 高模升级）

- 运行时唯一引用点：`src/lab/world/city/HeroRobot.ts` 的 `HERO_ROBOT_RESOURCES` 清单
  （URL `models/hero-robot/HeroRobot.glb`）。**同名覆盖本文件即完成热替换**，代码零改动；
  约定不变量：≤800KB、含 `Idle` 循环剪辑、材质名沿用 `Main/Accent/Grey/LightGrey/Black/Eye`
  （`Eye` 为呼吸灯载体）、原生朝向 +Z 为正面。
- GLB 缺失/加载失败时 `HeroRobot.ts` 自动回退程序化块面机甲（同接口，R4 止损），不阻塞首屏。
