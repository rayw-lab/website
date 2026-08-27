# CC-BL2-PLUS 定向补洞实现记录（concept-garage 西端天际线段）

| 项 | 内容 |
|---|---|
| Task | **CC-BL2-PLUS**（AL-BL2 NO-GO §8 定向补洞段；报告 `docs/research/loop-bl2-audit.md`） |
| 分支 | `cursor/cc-bl2-street-extension-1d6f`（叠加在 BL2 实现 `0c66684` 与资产清账 `0b54513` 之上） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 日期 | 2026-08-27（UTC） |
| 变更文件 | `tools/blender/generate-concept-garage.py` · `public/models/concept-garage/ConceptGarage.glb`（重生成） · `public/models/concept-garage/README.md` · `docs/spec/asset-ledger-cyber-city.md` · `src/lab/world/city/HeroBlenderMesh.ts`（注释读数） · 本记录 |
| 红线遵守 | tone mapping ✗未动 · poster ✗未动 · 第三栋楼 ✗未建 · 相机/运镜 ✗未动 · 受保护面（`e2e/`、`playwright.config.ts`、`lighthouserc.json`、`.github/workflows/`、`scripts/`）零字节 |
| 生产分敬告 | `docs/research/cyber-city-visual-rubric-score.json` **零改动**——本记录的自评仅供双评门 `\|自评-独立\|≤5` 实算，不冒充审计独立分 |

## 0. 结论先行

AL-BL2 §8.1 要求「让 robot-idle whole-frame 产生可辨认新轮廓」。**实测投影几何证明该帧
物理上不可能包含 concept-garage 的任何几何**（§2 附录：楼体最近前向角点落在右裁剪面外
5.8 个半幅，视轴外 ≈66°；抬高任意高度只会更偏右）。可动此帧的两根杠杆——相机构图与
楼位——分别被本任务书明令禁止与超出授权范围。

因此本补洞段把「无需 POI 近景即可辨认」落到**几何上可达的固定沿街整帧**：
`?poi=work-gallery` 固定深链帧（既有出口⑧机制，零代码改动，审计可一键复现；楼距
61–75m，非近景）+ AL-BL1 §9 原三视角中的「驾驶推进」帧。为此给 concept-garage 重塑
天际线：**西肩块 21.6 → 螺旋塔 26.05（蓝 LED 螺旋带 =「立体停车坡道」车库图腾）→
塔顶桅杆信标 31.55 + 东端书挡 21.1**——「塔-低-挡」三拍屋顶线 + 体量切分，60–100m
沿街整帧一眼认楼，与 BL1 autodrive-lab 的双阶收分塔轮廓族区分明确。

robot-idle 首幕帧因此**零像素预期变化**（§2 数学 + §5 对照帧），POI 近景与沿街整帧
获得可辨认新轮廓。GLB 字节已变 → 按 §8.5 重做资产解析、fresh 帧、全量 e2e 52/52 与
LHCI（§7）。

## 1. 对 AL-BL2 §8 清单逐条回应

| §8 条目 | 本段处置 |
|---|---|
| 1. whole-frame 可辨认新轮廓 | 屋顶线/体量切分已做（西肩块/螺旋塔/信标桅杆/东书挡，包络上探经任务书批准）；robot-idle 帧经投影实测**不可能**包含本楼（§2），新轮廓的 whole-frame 证据落在固定 `?poi=work-gallery` 沿街整帧与驾驶推进帧（§5） |
| 2. 同帧重拍 + V4 72–75 | robot-idle / concept POI / autodrive POI 已重拍（§5）；另附沿街整帧前后对照；V4 独立复审归审计 |
| 3. 总分单值 + raw 算式 + 七维自评 | §6（总分 **71**，raw 70.80；生产 JSON 未动） |
| 4. README + asset-ledger 登记 | `0b54513` 已建档；本段随重生成更新体积/tri/SHA/包络行（148,240 B · 2,928 tris · SHA `2f5295…8303`） |
| 5. GLB 字节变化 → 全量复验 | 资产解析/复现双跑、fresh 帧、全量 e2e 52/52、LHCI 全部重做（§4/§5/§7） |

## 2. 附录：robot-idle whole-frame 投影几何审计

复现方式（任意审计机，零代码改动）：`/?quality=0#debug` 挂载至
`data-world-state="robot_idle"` 后在 console 执行：

```js
const cam = window.__worldSpikeGame.view.camera;
let glb; window.__worldSpikeGame.scene.traverse(o => {
  if (o.name === 'city-hero-glb-concept-garage') glb = o;
});
// 楼体世界包围盒八角点 → NDC（|x|≤1 才可能入帧）
```

本机实测（1440×900，FOV 42°，aspect 1.6；相机实测位 (11.88, 5.22, 16.00)，
视轴北偏西 24.4°，水平半视场 31.6°）：

| 世界角点 | NDC x | 判定 |
|---|---:|---|
| (109, 0, −62.9)（西北底） | **+5.80** | 右裁剪面外 5.8 半幅 |
| (109, 22.6, −62.9)（西北顶） | **+6.21** | 抬高更偏右（俯仰使右裁剪面内倾） |
| (170.9, 22.6, −62.9)（东北顶） | **+61.4** | 深度贴近相机平面，发散 |
| (109, 0, −17.6)（西南底/前场） | z_ndc>1 | 在相机成像平面之后 |

结论：
- 楼体最近前向角点方位 = 视轴右 **66.5°**，帧右缘 = 视轴右 31.6°——差 ≈35°，
  任何屋顶线/高度/沿街面处理都改变不了水平方位；抬高反而增大 NDC x（俯角相机的
  右裁剪面向内倾斜）；
- BL1 的「首幕右缘收益」（AL-BL1 §9）来自 autodrive-lab 西裙房伸至 x≈14.8——毗邻
  中轴大道走廊才入帧；concept-garage 地块（x∈[110,170]）比它偏东 ≈95m，物理不可达；
- 能让本楼进入 robot-idle 帧的仅有两杠杆：①改相机构图（本任务书「禁止：相机运镜
  扩批」；AL-BL2 §8.1 亦要求「经明确任务书批准的构图」——未获批）；②改楼位
  （JSON `position`，超出本任务书授权的「GLB/生成脚本」文件域，且牵动 POI 深链/
  街灯/街区程序化填充/叙事分区）。两者均不在授权范围，故不动；
- 推论：robot-idle 前后帧应零可归因差异（时间项光轨/机器人 idle 相位除外，
  与 AL-BL2 §2 口径一致）——这是**几何必然**，不是实现偷懒；「无需 POI 近景即可
  辨认」的达成场地只能是沿街整帧（§5 E-C/E-D）。

## 3. 天际线段设计与合同核对

新增几何（Blender 本地系，bx 东/by 北/z 上；全部复用既有 13 材质名，draw call 不变）：

| 件 | 位置/尺寸 | 材质 | 轮廓职能 |
|---|---|---|---|
| 西肩块 | bx∈[−30,−12.2]×by∈[−17,17]，z 17.9→21.6（压顶 22.0） | Facade/FacadeDark + AccentBlue 檐 LED（南/西） | 体量切分第一阶 |
| 螺旋塔 | 圆柱 r7.5 @(−20,6)，z→26.05（基座环/顶冠环 Metal） | FacadeDark | 天际线主锚（车库塔） |
| 螺旋光带 | r7.56，z 19.2→25.55，2.25 圈，带高 0.55 | AccentBlue（emissive 0.85 阈下） | 「立体停车螺旋坡道」图腾——远距认楼件 |
| 桅杆+信标 | 塔顶 z 26.05→31.05，信标 0.5³ @31.05–31.55 | Metal + BeaconBlue 2.2 | 天际线收头（辉光锚迁位） |
| 东端书挡 | bx∈[24,29.5]×by∈[−16,16]，z 17.9→21.1 | Facade/MetalDark + AccentBlue 檐 LED | 「塔-低-挡」三拍东端 |
| 排风筒迁位 | 西区三筒 → 中区北带 (4,12.5)/(9,14)/(−6,13) | Metal/MetalDark | 让位肩块；顶 19.7 低于女儿墙街面遮蔽线 |

合同核对（逐条）：

- **楼顶全息板走廊** bx∈[−10.5,10.5]×|by|<1.8×z∈[19.1,21.7]：肩块东缘 −12.2
  （压顶 −12.1）、塔东缘 −12.5、书挡西缘 +24——全部走廊外；街面帧全息板背景仍是
  天空（§5 帧证据可核）；
- **南立面灯箱背板区** bx∈[−10.2,10.2]×z∈[7,11]：天际线段全部 z≥17.9，不相交；
- **物理合同**：footprint cuboid h18 零改动；上探段为悬空视觉件（18m 以上无可达
  路径）；`PROP_COLLIDERS['concept-garage']` 9 件零改动；
- **辉光锚数量不变**：原前西角桅杆信标（顶 22.4）撤销，信标迁塔顶——仍为「屋顶
  信标 + 卷帘门警灯」两处 BeaconBlue 2.2；螺旋带 AccentBlue 0.85 ≤1 阈下不占名额；
- **色纪律**（rubric A3）：新增件只用既有 FacadeDark/Facade/Metal/MetalDark/
  AccentBlue/BeaconBlue；身份蓝仍限 LED/信标件，零新色相、零新材质名；
- **FlightTrails 净空**：三航线包络 x≤105（M 环）/z≤−170（H 环）/z≤−260（F 环），
  离本楼（x≥109，顶 31.55）水平 ≥5m，无穿模；
- **包络上探授权**：任务书「可略超原 60×36×18 包络若任务需要 whole-frame 可读」——
  上探量（主体 h18 不变，西端塔 26.05/信标 31.55）已在 README/asset-ledger 登记。

## 4. 资产重生成与复现

| 项 | BL2（`0c66684`） | BL2-PLUS（本段） |
|---|---|---|
| 体积 | 146,464 B | **148,240 B**（≤10MB ✅） |
| indexed tris | 2,586 | **2,928**（≤100k ✅） |
| mesh/primitive/material | 13/13/13 | **13/13/13**（零新增） |
| Draco / KTX2 | required ✅ | required ✅（`KHR_draco_mesh_compression` + `KHR_texture_basisu`，emissive>1 走 `KHR_materials_emissive_strength`） |
| 贴图 | 1024²/256²/1024² KTX2 ×3 | 同左（贴图零改动） |
| SHA-256 | `d181147311f2af43…60988aa` | **`2f529589070bd239149116eaf6a5b0e761c36af1c4efca5a3bd0483314058303`** |
| 复现 | 审计双跑一致 | 本机全管线双跑（Blender 4.0.2 + `etc1s --quality 255` + `draco`）**字节级一致** |

复现命令不变（README 同款三行）：

```bash
blender -b --factory-startup -P tools/blender/generate-concept-garage.py -- --out /tmp/bl2-asset
pnpm dlx @gltf-transform/cli etc1s /tmp/bl2-asset/ConceptGarage-raw.glb /tmp/bl2-asset/ConceptGarage-etc1s.glb --quality 255
pnpm dlx @gltf-transform/cli draco /tmp/bl2-asset/ConceptGarage-etc1s.glb public/models/concept-garage/ConceptGarage.glb
```

## 5. 取证帧（固定机位前后对照）

前帧 = 分支 `0b54513`（旧 GLB）；后帧 = 本段重生成 GLB；同 VM、1440×900、Q0。

| 证据 | 路径（/opt/cursor/artifacts/） | SHA-256 |
|---|---|---|
| E-A0 robot-idle 前 | `cc-bl2-plus-before-robot-idle.png` | `93f0dc6c30ebc3771a304291a2ba58d3edbeb8fe3604587e259db5c55c70248d` |
| E-A1 robot-idle 后 | `cc-bl2-plus-after-robot-idle.png` | `1096218329ae1979e8e9769ea4a2a954c800f112fab040662f27e4a708b7eb48` |
| E-B0 concept POI 前 | `cc-bl2-plus-before-concept-poi.png` | `78f48641bc78b353cb42a49a545f6f77d48661e7413fab2f8c1c4030cf8ea7f7` |
| E-B1 concept POI 后 | `cc-bl2-plus-after-concept-poi.png` | `2d927a1cb8da025302bda959937a909b95a2db75d48af66efc0021b2b121ec26` |
| E-C0 沿街整帧前（`?poi=work-gallery` 固定深链） | `cc-bl2-plus-before-street-frame.png` | `8a4b8e4b6ec630cf0b58285a3bd799ecae25c4a1e8675e926c83e681817f208b` |
| E-C1 沿街整帧后（同深链同机位） | `cc-bl2-plus-after-street-frame.png` | `07089885d370644071c19c98c26396d1c69a47c4eec429da23bb9f55479454f2` |
| E-C∆ 天际线放大对照（E-C0/E-C1 屋顶带裁切 ×2） | `cc-bl2-plus-street-skyline-compare.png` | `59beecf6280e3c1db9ee9b941bdcd877811429939fd093f2a1a4f79a9f19ed00` |
| E-C2 同走廊驾驶帧（自泊车位沿街后撤 8.5m 刹停，纯键盘驾驶零代码） | `cc-bl2-plus-after-street-pullback.png` | `bb2381b3d63a414f7d2cb45f3fd94403bc432d0f0b47ede37a2beeed29c7e3ec` |

实拍读法（逐帧核对后的实际结论，非预期）：

- **E-A0/E-A1**：除时间项（光轨相位/机器人 idle 微姿态/橱窗灯闪）外零可归因差异，
  与 §2 几何必然一致——robot-idle 帧不含本楼任何像素；
- **E-C0 → E-C1**（本段核心证据）：E-C0 西端女儿墙之上仅一根细桅杆+点状信标；
  E-C1 同机位出现**螺旋塔冠环 + 发光螺旋带 + 塔顶桅杆横臂**探出西女儿墙——
  新轮廓族一眼可辨。live 相机投影核（相机实测位 (151.8, 5.2, 34.1)）：
  塔顶 26.05 → NDC y **+0.867 入帧**、螺旋带中段 → +0.765 入帧、肩块顶 21.6 →
  +0.761 入帧、原 h18 檐口 → +0.692 入帧；信标顶 31.55 → +1.036（略出上缘）、
  东书挡顶 → NDC x +1.098（略出右缘）。即该固定深链帧稳定可读「三拍」中的
  塔拍+低拍；
- **E-C2**（同走廊驾驶帧，补全信标）：从泊车位纯键盘 W+空格 沿街后撤 8.5m 刹停
  （车位 (140, 17.9) → (140, 26.4)，楼距 ~70m），信标顶 NDC y **+0.973 入帧**——
  全帧同时读出「西肩 LED 檐线 → 螺旋塔冠环+发光螺旋带 → 桅杆横臂+信标」完整
  西端轮廓组 + 南立面灯箱 + 卷帘门带，即驾驶视角下的整楼认读帧；
- **E-B1 vs E-B0（诚实修正）**：概念车库 POI 近景帧**无可归因差异**——20m 近距下
  18m+ 上探段全部在帧顶之外。这与初稿预期（"近景左上新增塔身"）不符，按帧实拍
  修正；副作用为正向：近场身份合同（灯箱/卷帘门/暖光内景）经帧证据核实零扰动。

## 6. 七维自评 + raw 算式（双评门材料）

基线 = AL-BL2 独立向量（V1 65 / V2 75 / V3 69 / V4 71 / V5 70 / V6 73 / V7 76 = 71）。
逐维只动有帧证据支撑的维，反通胀按 rubric 口径铁律：

| 维 | 自评 | 对 AL-BL2 差 | 依据 |
|---|---:|---:|---|
| V1 首幕构图 | 65 | 0 | robot-idle 帧零可归因变化（§2 几何必然），不冒领 |
| V2 光照材质 | 75 | 0 | 零新材质/光照系统；螺旋带只是既有 AccentBlue 复用 |
| V3 色彩氛围 | 69 | 0 | 色纪律不变，蓝仍限身份件 |
| V4 场景密度 | **72** | +1 | 「沿街整帧未成立」是 AL-BL2 卡 71 的唯一扣项：现固定 `?poi=work-gallery` 整帧（61–75m，非近景）可不看代码辨认第二栋楼的独立轮廓族（E-C1 vs E-C0）；驾驶推进沿街同收益。robot-idle 帧物理不可达（§2），故只加 1 不多领 |
| V5 动效转场 | 70 | 0 | 零新动画/运镜 |
| V6 UI/HUD | 73 | 0 | DOM/HUD/poster 零改 |
| V7 原创叙事 | **77** | +1 | 螺旋坡道光带 = 车库类型学图腾，把「3D 汽车配置器车库」身份从近景道具层提升到天际线层（E-C1/E-B1） |

```text
65×.20 + 75×.20 + 69×.15 + 72×.15 + 70×.15 + 73×.10 + 77×.05
= 13.00 + 15.00 + 10.35 + 10.80 + 10.50 + 7.30 + 3.85
= 70.80 → 总分单值 71/100
```

- **总分自评 = 71（raw 70.80）**；若独立复审 ∈ [66,76] 则 `|自评-独立|≤5` 通过；
- V4 自评 72 = 目标带下沿：达成条件是审计认可「固定沿街整帧」为 whole-frame 证据
  场地（§2 已证 robot-idle 不可达）。若审计坚持以 robot-idle 为唯一场地，V4 恒 71
  且该门在不动相机/楼位的前提下**永久不可满足**——此裁决归审计/父代理，本段不越权；
- 综合分口径（visual=71 时）：`node scripts/score-loop.mjs --visual-score 71` →
  92.8（e2e/LHCI/smoke 实测见 §7）。

## 7. 复验结果（GLB 字节已变 → 全量门，全部实跑于本 VM）

| 门 | 命令 | 结果 |
|---|---|---|
| 类型检查 | `pnpm astro check` | **0 errors / 0 warnings**（132 文件，58 hints 均历史遗留） |
| 构建 | `pnpm build`（quality-loop full 内） | OK |
| 预算 | `node scripts/audit-budget.mjs` | **全部阻断级门禁 PASS**——public 9.1MB/40MB、world 资产池 5.5MB/12MB（含新 GLB 148,240B）、JS 86.0KB/900KB、受保护 14 页零 world 泄漏 |
| e2e 全量 | `pnpm quality:loop:full`（五 project 链） | **52 passed / 0 failed（18.5m）**——含 VIS-01–04 视觉基线全绿：robot-idle 与 POI 近景基线零像素回归，与 §2/§5 的「零可归因变化」互证 |
| LHCI | 同上（7 URL × 3 轮 collect + assert） | collect OK，assert **全过**；`/` 与 `/home/` 四项均值各 **100.0** |
| 综合分 | `node scripts/score-loop.mjs`（读生产 visual=70，未改动） | **92.5/100**（LHCI 100×40% + e2e 100×20% + 视觉 70×25% + 冒烟 100×15%）；工件仅落 `test-results/quality-score.json`，生产 rubric JSON 零改动 |

软门禁备注：WS-PERF-01 headless swiftshader p95 帧间隔 616.7ms ≥50ms 照例告警不阻断
（本 VM 无 GPU，真机帧率归 human-gate 人工录测，与 AL-BL2 口径一致）。
全程日志：`/opt/cursor/artifacts/bl2-plus-quality-loop-full.log`。

---

*CC-BL2-PLUS · 实现段只交付本记录 + §1 表列文件；生产独立分 JSON、e2e、阈值、
workflow、像素基线零改动。*
