# Cyber City Loop 2 A-plus 复评审计（CC-AL2-a-plus）

| 项 | 内容 |
|----|------|
| 审计对象 | PR [#34](https://github.com/rayw-lab/website/pull/34) `cursor/cc-l2-visual-a-plus-1d6f` |
| 叠加基线 | `cursor/cc-l2-visual-a-tail-1d6f@711339c` |
| 候选树 | `bdcd29d8cf95819cc93217b06f7bd5fefa067795` |
| 前序裁决 | `cyber-city-loop2-a-audit.md`：独立视觉 60，Tier B 暂停 |
| 审计分支 | `cursor/cc-al2-a-plus-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 状态 | **审计完成 · 独立视觉 62 · 放行受控启动 Tier B** |

## 0. 最终裁决

**放行 Tier B 的 B1/B2/B4。**

1. 按 `cyber-city-visual-rubric.md` v1.1 原秤独立复评，A-plus 得分
   **61.50 → 62/100**，达到 AL1/AL2-a 规定的“视觉审计分 ≥62”硬门。提交方自评
   为 62（原始加权 62.15），整数分差 `|62-62|=0≤5`；本结论不是用自评分替代审计分。
2. AL2-a §6 两个定向缺口均闭合：湿反射已从右缘广场进入机器人脚下、南斑马线和
   近机位路面；HUD/mini 快览的字级、留白、画面占比及移动端顶栏重叠均有代码与
   fresh 帧双证。反射目前略偏“大面积镜面”，故 V2 只取 50–65 段顶 65，不预支
   分层雾、IBL/AO 或手工材质分。
3. exact tree 本地全量 Playwright **52 passed / 0 failed / 0 skipped**（17.0m），
   三项 `@smoke3d` 全过；PR #34 同 SHA CI 的 check/build/links/budget/Lighthouse
   全部成功。
4. CI Lighthouse 7 URL ×3 轮共 21 份 LHR，四分类全部 100；结合本轮 e2e JSON 与
   独立视觉 62，统一计分器复算 **COMPOSITE_SCORE=90.5**，
   `availableWeight===1`、`missing=[]`。
5. 放行边界不变：只启动 B1（5 栋 hero 可读招牌）、B2（6–10 件沿街灯箱/灯杆）、
   B4（剪影密度/高度方差）。**B3 飞行光轨、B5 变形运镜继续后置**，不得借本次过门
   一并扩批。

## 1. 审计边界与证据链

`711339c..bdcd29d` 共 4 个 commit，最终差异 15 个文件、`+248/-83`：

- 运行时 7 文件：`neon-tokens.ts`、`Roads.ts`、`city/index.ts`、
  `NeonMaterials.ts`、`Grid.ts`、`Reveal.ts`、`pages/index.astro`；
- 视觉资产 6 文件：A-plus 三张审计 WebP、desktop/mobile poster、VIS-01 壳像素基线；
- 登记文档 2 文件：工程 notes 与视觉 score JSON。

`e2e/` 测试逻辑、`playwright.config.ts`、`lighthouserc.json`、`scripts/`、
`package.json`、锁文件和 workflow 均零改动；`e2e/` 唯一变化是经审阅更新的 VIS-01
截图基线，不存在改测试或降阈值制造通过。

视觉证据：

- 同机位前帧：`l2-world-robot-1440.webp`（A-tail）；
- 同机位后帧：`l2a-world-robot-1440.webp`（A-plus 入库证据）；
- 本审计 fresh 帧：全量 e2e 重新生成的
  `test-results/visual/world-robot-idle.png` 与
  `world-poi-concept-garage.png`；
- 壳证据：`l2a-shell-static-1440.webp`、`l2a-shell-mobile-375.webp` 与
  desktop/mobile poster；
- 时间证据：前序审计已逐帧验证的 `l2-transform-seq.mp4`
  （H.264 1280×800、24fps、226 帧、9.416667s）。A-plus 未修改变形状态机或时序，
  本轮 exact-tree `CITY-E2E-03/04/05` 又覆盖默认、reduced-motion 与 WebGL 2 三腿，
  因而该 5–10 秒 V5 证据继续有效，无需把未改编舞重复包装成新增收益。

## 2. AL2-a §6 缺口闭合核验

| 缺口 | 最终树证据 | fresh 帧独立判断 | 裁决 |
|------|------------|------------------|:---:|
| §6-1 湿反射进入主体前景 | `Roads.applyWetQuality()` 给路面接 Q0/Q1/Q2 三档；Q0 共享 `Grid.reflectionNode`，没有第二次镜像渲染；`cityPuddleMask()` 抽成 Grid/Roads 共用世界坐标掩码，并加覆盖主体脚下→南斑马线→近机位的英雄湿区 | 前帧主体脚下为暗红干地、反射主要在右缘；fresh 后帧机器人双腿、出生光圈、近楼窗格和品红 rim 都在下半幅形成连续倒影，右侧道路也不再空。缺口按字面与视觉均闭合 | ✅ |
| §6-2 HUD/mini 字级、留白、占比 | 顶栏 12→13.6px，速度表 28.8→38.4px，mini 行 12.8→14.4px、面板 15.5→17.5rem；hint/respawn/backend 同步放大；窄屏顶栏 `padding-top:3rem` 给 fixed 跳过丸让位 | fresh robot 帧中左下速度表、中央 CTA、右侧 mini 面板形成可读三角；mobile 壳帧中 brand/nav 已完整落到跳过丸下方，无 A-tail 的边缘重叠 | ✅ |

### 2.1 反射闭合但不按 70 段计分

后帧的反射增量非常明确，也已解决“只停在右缘”的原判词；但英雄湿区在主帧覆盖较大，
倒影锐度和连续性更接近玻璃镜面，水洼边界/粗糙度层次仍弱。rubric V2 的 70–85 段还
要求分层雾与更成熟的材质经营；候选仍是单层雾、无 IBL/AO、楼面程序感明显。因此本审计
把 V2 从 61 提至 **65**，不接受自评 66 对段界的乐观跨越。

### 2.2 neon token 收窄条款只部分闭合

新增 `src/data/neon-tokens.ts` 确实让壳 CSS、`NeonMaterials` 与 `Reveal` 共用
`NEON` 常量，比 A-tail 的双份 hex 字面量更接近单源；但 `Roads.ts` 的实际 TSL
emissive 仍保留 `vec3(0.06, 0.5, 0.44)` / `vec3(0.62, 0.02, 0.14)` 线性近似，
`Grid.ts` 的 sheen 也保留同组硬编码。故“改 token 模块即可更新全部道路/地面霓虹”
仍不成立。

这不是 AL2-a §6 的 Tier B 硬条件，也没有造成帧内色偏；本审计将 V3 从 68 小幅提至
**69**，不按提交方的 70 满额计入。后续可用由 hex 生成线性常量的共享 helper 收口，
但不阻断 B1/B2/B4。

## 3. 视觉独立复评

量尺、权重和锚点继续沿用 `cyber-city-visual-rubric.md` v1.1；不因 62 门线改秤。

| 维 | A-plus 自评 | AL2-a-plus 独立分 | 复评依据 |
|----|:---:|:---:|------|
| V1 首幕构图 | 61 | **60** | 前景镜像补出实体/倒影双层并填充右半幅，较前序 59 有一档真实收益；主体、消失点和远景结构未改，远楼仍是大色块，留在 50–65 段 |
| V2 光照材质 | 66 | **65** | 主要机位反射可见性缺口完全销账；但镜面面积偏大、雾单层、无 IBL/AO、楼面材质程序感强，只取 50–65 段顶 |
| V3 色彩氛围 | 70 | **69** | DOM/3D/poster 色系连续，hex 单源范围扩大；Roads/Grid 活跃 TSL 颜色仍是派生硬编码，明暗节奏与重点色面积经营也未变 |
| V4 场景密度 | 40 | **40** | 本轮零场景内容增量；仍无 3D 可读招牌、沿街灯箱、车流/粒子，是 Tier B 主战场 |
| V5 动效转场 | 63 | **63** | 动效代码零改；继承 9.416667s 连续证据，exact-tree 三腿状态机 e2e 全绿；镜头仍静止 |
| V6 UI/HUD | 73 | **72** | 字级、留白、面板占比和移动重叠均实质改善，跨入 70–85 段下沿；仍是覆盖式 DOM、系统字体、非 diegetic 面板 |
| V7 原创叙事 | 70 | **70** | 机器人↔车核心与“楼=产品线”DOM 载体不变；3D 内叙事内容须由 B1 才产生 |

`60×.20 + 65×.20 + 69×.15 + 40×.15 + 63×.15 + 72×.10 + 70×.05`
`= 61.50 → 62/100`。

**复评门通过，但只有门线余量。** 与前序独立原始分 60.05 相比，本轮原始增量
`+1.45`；整数分 `60→62`。三个未变维度 V4/V5/V7 未被预支，增量仅来自 fresh 帧可见
的前景反射、HUD 精修与有限 token 收口。

## 4. 工程门禁与统一计分

### 4.1 exact-tree 本地全量 e2e

在 `bdcd29d` 上重新安装锁定依赖与仓库对应 Chromium 后执行 `pnpm test:e2e`：

| 项 | 本审计结果 |
|----|------------|
| build | PASS，19 pages |
| Playwright 全量 | **52 passed / 0 failed / 0 skipped**，17.0m |
| 世界剧本 | CITY-E2E-01…06 全过 |
| 3D smoke | VIS-02/03/04 **3/3** |
| fresh 首幕 | VIS-03 robot_idle 非空像素断言通过，主体前景反射与 HUD 均可见 |
| fresh POI | VIS-04 parkingBay/非空像素断言通过，路面反射接线未破坏深链出生 |
| 软件光栅性能 | WS-PERF-01 约 2fps，仍是仓库既定 OBS 软门禁；不包装成真机性能 PASS |

全量测试会重写历史说明截图；审计结束前已全部还原，审计分支只提交本报告。

### 4.2 PR #34 CI 与 LHCI

GitHub Actions run
[32919400301](https://github.com/rayw-lab/website/actions/runs/32919400301)：

- head SHA `bdcd29d8cf95819cc93217b06f7bd5fefa067795`，conclusion `success`；
- install / astro check / build / links / budget / Lighthouse 全部 success；
- artifact `lighthouse-results`：21 JSON + 21 HTML + assertion result，大小
  6,912,624 bytes，digest
  `sha256:8751041570ec80995def745048cda4453a00467e9b676c0476ea544b193fb420`。

本审计下载 21 份 LHR 后逐份读取：7 个 URL 的 Performance / Accessibility /
Best Practices / SEO 三轮值全部为 100，因此两个计分 URL 为：

| URL | Perf | A11y | BP | SEO | 四项均值 |
|-----|:---:|:---:|:---:|:---:|:---:|
| `/website/` | 100 | 100 | 100 | 100 | **100** |
| `/website/home/` | 100 | 100 | 100 | 100 | **100** |

### 4.3 `availableWeight` 与综合分

统一计分器读取上述 CI LHR、本审计 full e2e JSON，并用独立视觉 62 覆盖登记分：

| 维度 | 分数 | 权重 | 加权 |
|------|---:|---:|---:|
| LHCI `/` | 100 | 0.25 | 25.0 |
| LHCI `/home/` | 100 | 0.15 | 15.0 |
| e2e | 100 | 0.20 | 20.0 |
| 独立视觉 | 62 | 0.25 | 15.5 |
| 3D smoke | 100 | 0.15 | 15.0 |
| **合计** |  | **1.00** | **90.5** |

脚本输出：

```text
综合分 90.5/100（按可用权重 100% 归一化；五维齐套）
COMPOSITE_SCORE=90.5
```

生成 JSON 为 `availableWeight: 1`、`missing: []`。综合门稳定高于 85，且本次 Tier B
放行同时满足独立视觉专项门，不依赖综合分掩盖视觉缺口。

## 5. Tier B 放行边界

| 硬条件 | 结果 |
|--------|:---:|
| AL2-a §6-1 主体前景湿反射 | ✅ |
| AL2-a §6-2 HUD/mini 字级·留白·占比 | ✅ |
| **独立视觉 ≥62** | **✅ 62（原始 61.50）** |
| 自评与独立分差 ≤5 | ✅ Δ0（整数） |
| 5–10s `robot_idle→veil→car_ready` 时间证据 | ✅ 9.416667s（未改 V5，继承有效） |
| e2e 52/52 | ✅ |
| LHCI `/`、`/home/` 不降 | ✅ 两者四项全 100 |
| `availableWeight===1` | ✅ |

**执行裁决：**

1. 解锁 B1/B2/B4；优先 B1+B2，因为 V4=40 仍是唯一低于 50 的维度，且灯箱也能给
   当前湿地面提供更有语义的反射源。
2. B4 与 B1/B2 同批时继续用固定主机位帧控制归因，避免剪影填充重新吃掉天空开口。
3. B3/B5 保持后置；CITY-03 动画配额、GPU 预算、reduced-motion 与驾驶镜头漂移尚未
   获得新裁决。
4. 本次 62 是窄门通过，不应解读为视觉精修完成；Tier B 完成后仍须由 CC-AL2 重新按
   同一 rubric 独立打分。
