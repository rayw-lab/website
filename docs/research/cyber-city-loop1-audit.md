# Cyber City Loop 1 审计（CC-AL1）

| 项 | 内容 |
|----|------|
| 审计对象 | PR [#32](https://github.com/rayw-lab/website/pull/32) `cursor/cc-l1-visual-tier-a-1d6f` |
| 比较基线 | `main@6e2ad63` |
| 审计树 | `1f0d19e`（merge-base = `6e2ad63`） |
| 审计分支 | `cursor/cc-al1-loop1-audit-1d6f` |
| 日期 | 2026-08-25（UTC） |
| 状态 | **审计完成 · 放行 · 建议受控启动 Loop 2** |

## 0. 最终裁决

**放行。**

1. L1 声称的五项 Tier A 变更均有最终树代码落点，且均能在入库帧或本审计 fresh
   取证帧中看到；结论为 **5/5 落地**。其中机器人 rim light 虽然接线真实，但帧内主要
   读成脚下品红溢光，轮廓提升弱于接地青环，属于效果未满而不是虚假交付。
2. L1 自评视觉 **59/100**；CC-AL1 按同一 rubric 独立打分 **57/100**，
   `|57-59|=2≤5`，59 合理并通过双评纪律。
3. exact tree 本地全量 e2e **52/52**，0 failed / 0 skipped / 0 flaky；三项
   `@smoke3d` 全过。PR #32 CI 的 check/build/links/budget/Lighthouse 全绿，LHCI
   `/` 与 `/home/` 四项中位数和 L0 基线逐项相同，零回归成立。
4. 用当轮 CI LHR + 当轮 e2e JSON 复跑统一计分器：
   **登记分 `COMPOSITE_SCORE=89.2`**；若强制代入审计独立视觉分 57，
   **保守分 `COMPOSITE_SCORE=88.7`**。两种口径均稳定高于 85。
5. **建议启动 Loop 2，但不建议直接打包全部 Tier B。** 先收尾 A7-A10，再以 V4
   场景密度为主开 B1/B2/B4；B3 飞行光轨和 B5 变形运镜须经新一轮帧、动效与预算门禁。

## 1. 审计范围与证据链

`6e2ad63..1f0d19e` 共 4 个 commit，最终差异为 13 个文件：8 个运行时代码文件、
3 个 WebP 帧、工程记录与视觉 score JSON 各 1 个。`e2e/`、`playwright.config.ts`、
`lighthouserc.json`、`scripts/`、`package.json`、锁文件和 CI workflow **零差异**，
不存在通过改测试或降门槛制造“零回归”。

证据集：

- L0 对照帧：`assets/visual-rubric/world-ready-1440.webp`、
  `world-car-1440.webp`；
- L1 入库帧：`l1-world-robot-1440.webp`（63,650 bytes，
  SHA-256 `a1fcc81c…9081bf5`）、`l1-world-veil-1440.webp`（52,078 bytes，
  `79b10493…ec58a8`）、`l1-world-car-1440.webp`（54,866 bytes，
  `2f045885…59f883`）；
- CC-AL1 fresh 帧：全量测试重新生成的
  `test-results/visual/world-robot-idle.png` 与
  `world-poi-concept-garage.png`；
- 代码核对：最终树 `1f0d19e`，不把已在后继 commit 删除的临时取证脚本计入交付。

## 2. 五项 Tier A 落地核验

| Tier A 项 | 最终树代码证据 | 帧证据与独立判断 | 裁决 |
|-----------|----------------|------------------|:---:|
| 天空渐变、地平线辉光与雾色同步 | `city/Sky.ts` 新增反面球穹顶、纵向渐变和方位双色辉光；`city/index.ts` 挂载 Sky，并把 Fog/背景切至 `SKY_FOG_COLOR`/`SKY_ZENITH_COLOR` | L0 上方是被楼体吃满的暗幕；L1 首幕上方出现蓝灰低空与明亮天际线开口，远楼不再融入纯黑。青→品红方向变化较克制，收益真实但未到体积大气 | ✅ |
| 撤 16 个锥桶并补城市道具 | `World.step(1)` 仅在 `cameraFraming==='greybox'` 调 `setCones()`；`StreetProps.ts` 增 8 个双色隔离墩、4 个 instanced draw call 与 fixed collider | L1 三帧首幕锥桶为 0；路口边缘能看到青/品红小型隔离墩。fresh `WS-E2E-04` 仍通过，说明 `/world-spike/` 灰盒锥桶闭环未被误删 | ✅ |
| 窗色收敛三族 | `NeonMaterials.ts` 的 `WINDOW_PALETTE` 固定青/品红/暖白，楼宇 `neonColor` 不再直出窗格；剪影窗同步压到青/品红轴 | L0 同帧有绿/紫/红/白散色；L1 首幕与 POI fresh 帧只见青、品红和暖白窗格。楼宇身份信标仍保留个别强调色，符合变更边界 | ✅ |
| 偏轴构图 + rim/接地环 | `View.ts` 城市档 theta 45°→25°、phi 68°→75°、斜距 18→20m、横移 4.2m，并加 reduced-motion 可关闭的慢 yaw；`HeroRobot.ts` 构造器真实调用 `setRimLight()`/`setGroundRing()` | L1/fresh 首幕机器人落左 1/3，道路消失点占右侧，天空与峡谷形成纵深；双青环清晰。品红 SpotLight 帧内更多落在地面，机器人边缘只有局部品红，故 V2 不按“完整 rim”满计 | ✅（有折扣） |
| 光幕白爆抑制 | `TransformSystem.setVeil()` 从近白 ×1.9 改为青→品红 ×1.3，腰线降至 0.42，opacity 峰值 ×0.7；状态机时序未改 | veil 中帧仍能读出楼体、道路和已交换出的车辆，且左右双色明确；car_ready 帧不再保留 L0 的灰绿全屏余辉。三帧只能证明关键帧，不足以单独证明缓动节奏 | ✅ |

代码与帧相互闭合，没有发现“代码存在、帧内不可见”的整项虚报。可见性最弱的是 rim，
因此只在视觉分中扣分，不推翻五项落地结论。

## 3. 视觉独立复评

量尺、权重和锚点完全沿用 `cyber-city-visual-rubric.md` v1.1，不因本轮改秤。

| 维 | L1 自评 | AL1 独立分 | 复评依据 |
|----|:---:|:---:|------|
| V1 首幕构图 | 56 | **57** | 偏轴主体、右侧道路消失点、天空开口与撤锥桶均明显；远层仍是大色块、右半画面偏空，落 50–65 段中位 |
| V2 光照材质 | 60 | **58** | 天空/雾、接地环和湿反射均可见；rim 多数读成地面溢光，材质仍平、无 IBL/AO，未取上沿 |
| V3 色彩氛围 | 68 | **66** | 窗格三族纪律成立，L0 绿紫噪音消失；品红窗在软渲染下接近正红，重点色面积和明暗节奏仍缺经营 |
| V4 场景密度 | 44 | **40** | 锥桶叙事冲突消除，但 8 个隔离墩在主帧仅是小点；仍无楼顶可读文字、灯箱、车流或粒子，不能把“撤杂物”当成高密度 |
| V5 动效转场 | 65 | **62** | 双色 veil 与 car_ready 对比度改善成立，状态机 e2e 全绿；仍无变形运镜，本轮只有三张关键帧而非 5–10 秒时间证据 |
| V6 UI/HUD | 55 | **57** | 本轮零改；延续 AL0 对干净静态壳的小幅上修，挂载后 HUD 稀薄与旧 poster 问题不变 |
| V7 原创叙事 | 72 | **70** | 驾校锥桶移除、能量落点更贴合机甲叙事；楼=产品线仍主要靠 DOM/POI 文字，城市主体仍接近通用程序化赛博城 |

`57×.20 + 58×.20 + 66×.15 + 40×.15 + 62×.15 + 57×.10 + 70×.05`
`= 57.4 → 57/100`。

**总分差 `|57-59|=2≤5`，59 分通过复核。** 最大单维差为 V4 的 -4，原因是 rubric
要求按帧内可见密度打分：隔离墩解决叙事冲突，但尚未建立一层可读街道内容。59 不是明显
通胀；它仍应理解为“工程和画面方向成立、精修密度未过 60 档”的边界分。

## 4. e2e、LHCI 与工程门禁

### 4.1 exact tree 本地全链

依赖安装后在 `1f0d19e` 上执行 `pnpm quality:loop:full`：

| 项 | 实测结果 |
|----|----------|
| build | PASS，19 pages |
| e2e | **52 passed / 0 failed / 0 skipped / 0 flaky**，18.3m，exit 0 |
| 3D smoke | VIS-02/03/04 **3/3**；VIS-01/02 入库像素基线匹配 |
| 首幕 fresh 像素证据 | 439 个量化色，非众数 82.9%（38,912 samples） |
| POI fresh 像素证据 | 327 个量化色，非众数 74.9%；parkingBay 断言通过 |
| 灰盒隔离 | `WS-E2E-04` 锥桶碰撞/复位通过，证明城市撤锥桶未回归 spike 被测面 |
| LHCI 本地 | 7 URL ×3 collect 完成；容器 SwiftShader 使 performance/BP 为 `NaN`，assert 信息性 exit 1 |
| full 链总退出码 | **0**；本地 score 只覆盖 60%，不作为发布分 |

本地 LHCI 的 `NaN` 与 AL0 已记录的环境限制相同，既不是分数下降，也不能被包装成 PASS；
发布裁决读取下面同 SHA 的 GitHub-hosted runner LHR。

### 4.2 PR #32 CI 与 LHCI

GitHub Actions run
[32892438036](https://github.com/rayw-lab/website/actions/runs/32892438036)：

- head SHA `1f0d19e8cbe35aad1bba31f44934f86176954501`，结论 **success**；
- astro check、build、links、budget、Lighthouse 全部 success；
- artifact `lighthouse-results`：22 JSON（21 LHR + assertion result）+ 21 HTML，
  API 大小 6,668,394 bytes，digest
  `sha256:834ac74b71f2d958f6cd8f43deb01f212d18b5b0cbf88f4146ca328292186844`，
  到期 2026-11-23T19:56:31Z。

| URL | Perf | A11y | BP | SEO | 四项均值 | vs L0 |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|
| `/website/` | 100 | 95 | 96 | 100 | **97.75** | 相同 |
| `/website/home/` | 100 | 100 | 100 | 100 | **100** | 相同 |

每个分类三轮值均等于表中中位数；与 L0 快照逐项一致。结合全量 e2e，
**“e2e/LHCI 零回归”成立。**

## 5. score-loop 复算

统一计分器读取当轮 CI LHR、当轮 e2e JSON 和登记视觉分 59：

| 维度 | 分数 | 权重 | 加权 |
|------|---:|---:|---:|
| LHCI `/` | 97.75 | 0.25 | 24.4375 |
| LHCI `/home/` | 100 | 0.15 | 15.0000 |
| e2e | 100 | 0.20 | 20.0000 |
| 视觉 rubric | 59 | 0.25 | 14.7500 |
| 3D 冒烟 | 100 | 0.15 | 15.0000 |
| **合计** |  | **1.00** | **89.1875** |

脚本输出：

```text
COMPOSITE_SCORE=89.2
```

与 L0 登记值 87.1875 相比，唯一计分变化是视觉 `51→59`，所以综合原始值精确
`+2.0000`。若代入 AL1 独立视觉分 57，则：

```text
74.4375 + 57×0.25 = 88.6875
COMPOSITE_SCORE=88.7
```

因此 89.2 的数学与来源链均成立，且放行不依赖 ±5 容差上沿。

## 6. Loop 2（Tier B）建议

**建议开 Loop 2，采用“A 尾件 → 复评门 → 精简 Tier B”三段式：**

1. **先收 A7-A10**：HUD 面板化 + 5 栋 mini 快览、H1/标签纯 CSS 排版、湿反射主机位
   可见性、最后重拍 desktop/mobile poster。当前 V6=57 且 poster 仍是 L0 画面，不应带着
   旧壳证据直接宣告 Tier A 完成。
2. **复评门**：目标视觉审计分 ≥62；补一段 5–10 秒固定脚本录屏，覆盖 robot_idle →
   veil → car_ready，避免继续只靠关键帧评价 V5；e2e 52/52、LHCI 两 URL 和
   `availableWeight===1` 继续作硬条件。
3. **Tier B 主批只开 B1/B2/B4**：5 栋 hero 楼可读招牌、6–10 件沿街灯箱/灯杆、
   剪影层密度/高度方差。原因是 V4=40 是当前最低且最确定的瓶颈，先建立可读街道层，
   收益高于继续堆后处理。
4. **B3/B5 后置**：飞行光轨先裁决 CITY-03 动画配额和 GPU 预算；变形运镜须同时验证
   reduced-motion 直出与驾驶镜头不漂。二者不与 B1/B2 同批，避免视觉增益与性能回归
   无法归因。

不建议在 Loop 2 引入 Tier C 或 Blender 实模管线；它们会改变资产、性能和原创性三条
风险轴，应在 Tier B 独立复评后另立专项。
