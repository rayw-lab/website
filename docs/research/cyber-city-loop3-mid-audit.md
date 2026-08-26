# Cyber City Loop 3 集成树中审（CC-AL3-MID）

| 项 | 内容 |
|----|------|
| 审计对象 | PR [#37](https://github.com/rayw-lab/website/pull/37) `cursor/cc-l3-layered-atmosphere-1d6f@d258e23` |
| 指定基线 | `main@16c713b` |
| merge-base | `2e6126c`（AL3-B2C 已放行的 B2C 集成点） |
| exact GitHub 集成树 | `252fc73`，tree `11b9c3e` |
| 本地被测树 | `408a55f`，tree 同为 `11b9c3e` |
| 审计分支 | `cursor/cc-al3-mid-audit-1d6f` |
| 日期 | 2026-08-26（UTC） |
| 状态 | **中审完成 · 独立视觉 66 · 未达 68 · 下一 Task 建议 B3** |

## 0. 最终裁决

**CC-L3-ATM 有可见净收益，但当前集成树独立视觉为
`65.80 → 66/100`，未达到 Loop 3 的 `≥68` 终审硬门。下一运行时 Task 选择
CC-L3-B3，不选 B5；POSTER 必须等 B3 审计后、运行时冻结再做。**

1. ATM 的代码接线、Q0/Q1/Q2 分档和程序化资产纪律成立；首幕 fresh 帧能看到道路尽头
   haze、右侧地平线低云和更亮的湿地大气反射，主体、招牌、灯箱与 HUD 未被吞没。
2. 帧证据不足以把 V2 稳定记入 70–85 段：首幕左侧前/中楼体仍接近同一清晰度，
   主要收益集中在右侧天空与道路消失点；garage POI 的开/关大气帧几乎同观感。
   因此 V2 从 AL3-B2C 的 65 提至 **69**，不接受自评 70 的跨段。
3. runtime 已改变首幕，而 desktop/mobile/OG poster 仍是 ATM 前帧；这属于门控链预设的
   中间态，不阻断 MID，但当前树不能继续享受“三面完全同源”的满额，V6 由 73 记 **72**。
4. 七维独立原始分 **65.80**，四舍五入 **66**；提交方自评 66，
   `|66-66|=0≤5`，一致性门通过；历史安全底线 `≥62` 通过；Loop 3 `≥68` **失败**。
5. exact-tree 全量 Playwright **52 passed / 0 failed / 0 skipped / 0 flaky**，
   `@smoke3d` **3/3**；build、Astro check、链接、预算均通过。
6. PR exact merge 与 `main@16c713b` 的 CI Lighthouse 均为 7 URL ×3 轮；
   `/website/`、`/website/home/` 四项中位数均为 **100**，零下降。
7. 代入独立视觉 66 后五维齐套，`COMPOSITE_SCORE=91.5`、
   `availableWeight: 1`、`missing: []`；综合分不能代替视觉 68 专项门。

## 1. 审计边界与 exact tree

目标分支不是从指定 `main@16c713b` 线性领先：

- candidate 与 main 的 merge-base 是 `2e6126c`；
- candidate 在该点上增加 ATM 三提交，main 另增加一笔编排登记提交；
- 直接看双点 diff 会混入分叉噪音，不能当作最终可合入树。

本审计使用 GitHub PR merge `252fc73`（父提交依次为 `16c713b`、`d258e23`）。
远端审计分支已有 clean merge `bb7f6ac`；本地协调后的 `408a55f` 与二者 tree 均为
`11b9c3eb29069006cfb5d24e6f2d0cdcb00a7b07`。因此本地测试、PR CI 与报告针对同一文件树，
不存在“分支各绿、集成树未测”的工件错配。

`16c713b..exact-tree` 共 11 个文件、`+250/-33`：

- 运行时：`src/lab/world/city/Sky.ts`、`src/lab/world/city/index.ts`；
- 视觉证据：有/关大气同机位 4 帧、低云特写、Q1/Q2 分档 2 帧；
- 登记：工程 notes 与视觉 score JSON。

候选没有修改 `e2e/`、Playwright 配置、LHCI 配置、计分器、预算/链接脚本、workflow、
依赖清单或锁文件，也没有新增贴图、模型或外部网络资产。

## 2. ATM 实现核验

| 验收面 | exact-tree 证据 | 裁决 |
|--------|-----------------|:---:|
| 分层距离雾 | `scene.fogNode` 由中景缓坡、远景陡坡、近地雾床三项组成，总量封顶 0.86；远雾按视线方位混入青/品红地平线辉光 | ✅ |
| 低云带 | 复用既有天空穹顶，在 shader 内以两倍频 `mx_noise_float` 生成静态条带；无新 mesh、贴图、draw call 或时间项 | ✅ |
| Q0/Q1/Q2 | 模块级 uniform：Q0=`1/1`，Q1=`0.8/0.35`，Q2=`0/0`；Q2 回退旧线性雾并关闭云带，切档不重建材质 | ✅ |
| 主体与文字保护 | fresh 首幕机器人、`AGENT NEXUS` 与沿街灯箱仍可辨；garage fresh 帧 `TUNE-UP` 与 POI 交互层保持可读 | ✅ |
| 性能边界 | fogNode 是材质输出混合，不做第二次场景渲染；静态云无 RAF/update；world JS 82.8/900KB，外部资产增量 0 | ✅ |

### 2.1 “分层成立”与“70 段成立”不是同一个结论

代码结构确实不再是单一线性雾，主机位开/关帧也有显著像素差异；但 rubric 要按最终帧
可见性评分，而不是按 fog 函数数量评分：

- 首幕开帧的右侧道路尽头和天空有可辨 haze/云层，湿地反射也被整体抬亮；
- 左侧近楼、机器人后的中景楼和更后排楼体仍多以近似锐度叠在一起，缺少稳定的三段
  空气透视；
- garage 机位被近景楼面占满，开/关帧 SSIM 为 0.967，ATM 对该关键视角的视觉贡献很小；
- 首幕开/关帧 SSIM 为 0.845，证明改动不是“代码有、画面无”，但该数值只量化变化量，
  不代表变化质量或自动获得 70 分；
- 低云特写能看到横向云带，但形态仍偏宽软条纹，尚未达到体积光或手工云层的完成度。

所以本审计确认 V2 有 **+4** 净收益，却把它留在 70 段门外的 **69**；这不是否认 ATM，
而是防止用单侧天空收益扩大宣称“两个关键视角都有清楚近/中/远三层”。

### 2.2 poster 当前为预期债务，但必须计入当前视觉面

现有 `cyber-city-poster.webp` 包含 B2C 灯箱与招牌，但没有当前低云带和分层 haze；
mobile 与 OG 同样停在 ATM 前帧。顾问稿明确允许 MID 在“poster 尚未重拍”状态中审，
所以不把它列为工程阻断；但 rubric V1/V6 测的是当前完整用户面，不能把尚未发生的
POSTER 收益提前计分。

## 3. 独立视觉复评

继续使用 `cyber-city-visual-rubric.md` v1.1 与 AL3-B2C 独立向量
`63/65/69/57/63/73/73`，严格执行“帧内看不见不加分”。

| 维 | ATM 自评 | AL3-MID 独立 | 复评依据 |
|----|:---:|:---:|------|
| V1 首幕构图 | 65 | **64** | 道路消失点与右侧天空多出大气层，纵深较基线有一档收益；机位、主体比例、左侧楼体叠层未改，且 poster 已与 runtime 漂移，不取段顶 65 |
| V2 光照材质 | 70 | **69** | 分层 fogNode、低云带、反射和 bloom 阈值纪律都成立；但三层空气透视未在两个关键机位稳定可读，garage 近乎无增益，无 IBL/AO/体积光，暂不跨 70 段 |
| V3 色彩氛围 | 69 | **69** | 雾与云沿用青/品红地平线色轴，没有引入杂色；Roads/Grid 派生线性常量债务未修，不重复加分 |
| V4 场景密度 | 57 | **57** | ATM 不新增文字、道具或环境生命感；云/雾收益已计 V1/V2，不在 V4 双计 |
| V5 动效转场 | 63 | **63** | 云层静态，变形与镜头零改；既有 9.4s 证据继续有效但无新增收益 |
| V6 UI/HUD | 73 | **72** | HUD 在 fresh 帧保持可读；但 desktop/mobile/OG 尚未包含 ATM，B2C 刚恢复的三面同源再次成为待清债务 |
| V7 原创叙事 | 73 | **73** | 大气强化雨夜城市氛围，但没有新增可被转述的叙事载体 |

`64×.20 + 69×.20 + 69×.15 + 57×.15 + 63×.15 + 72×.10 + 73×.05`
`= 65.80 → 66/100`。

相对 AL3-B2C 原始 `64.90`，ATM 的独立净增量为 **+0.90**；整数分 `65→66`。
提交方原始 `66.30` 与本审计相差 0.50，整数双评差为 0。

| 门 | 结果 |
|----|:---:|
| `|自评-独立|≤5` | ✅ `|66-66|=0` |
| 独立视觉 `≥62` | ✅ 66 |
| Loop 3 独立视觉 `≥68` | **❌ 66** |

## 4. 工程门禁与五维复算

### 4.1 exact-tree fresh e2e

依赖与 Playwright Chromium 按锁文件恢复后，在 tree `11b9c3e` 执行
`pnpm test:e2e`：

| 项 | 结果 |
|----|------|
| build | PASS，19 pages |
| Playwright | **52 passed / 0 failed / 0 skipped / 0 flaky**，17.8m |
| CITY 世界剧本 | CITY-E2E-01…06 全过 |
| 3D smoke | VIS-02/03/04 **3/3** |
| fresh 首幕 | canvas 非空；robot_idle、主体、道路、低云与 HUD 可见 |
| fresh POI | canvas 非空；parkingBay 出生断言与 `TUNE-UP` 可读性通过 |
| 软件光栅性能 | 约 2.0fps，仍是 OBS 软门禁；不包装成真机性能 PASS |

全量测试重写的 23 张历史说明截图已恢复，不进入审计提交。

### 4.2 静态、链接与预算

- `pnpm astro check`：127 files，**0 errors / 0 warnings / 58 hints**；
- `check-links`：19 页、347 条内部引用有效，12 栋 deepLink 核对通过；
- budget：poster 38.6/40KB、壳静态段 82.2/90KB、world JS 82.8/900KB、
  world 资产池 5.2/12MB、受保护 14 页 world 命中 0，全部阻断门通过。

### 4.3 exact main/candidate Lighthouse

| 树 | GitHub Actions | URL | Perf | A11y | BP | SEO |
|----|----------------|-----|:---:|:---:|:---:|:---:|
| `main@16c713b` | [32941811653](https://github.com/rayw-lab/website/actions/runs/32941811653) | `/website/` | 100 | 100 | 100 | 100 |
| `main@16c713b` | 同上 | `/website/home/` | 100 | 100 | 100 | 100 |
| exact PR merge `252fc73` | [32941816553](https://github.com/rayw-lab/website/actions/runs/32941816553) | `/website/` | 100 | 100 | 100 | 100 |
| exact PR merge `252fc73` | 同上 | `/website/home/` | 100 | 100 | 100 | 100 |

两侧均为 7 URL ×3 = 21 LHR，assert exit 0。candidate artifact ID `9596899525`，
SHA-256 `7545766c25a6934f4b502f1a27a715335215146c34190435081ac63684de5fcc`。
本 VM 的 pnpm LHCI 对 Performance/Best Practices 产出 `NaN`，不记为 PASS；上表采用
同 tree 的 green CI artifact 回填，与仓库既有 SwiftShader 回填纪律一致。

### 4.4 五维齐套

| 维度 | 分数 | 权重 | 加权 |
|------|---:|---:|---:|
| LHCI `/` | 100 | 0.25 | 25.00 |
| LHCI `/home/` | 100 | 0.15 | 15.00 |
| e2e | 100 | 0.20 | 20.00 |
| 独立视觉 | 66 | 0.25 | 16.50 |
| 3D smoke | 100 | 0.15 | 15.00 |
| **合计** |  | **1.00** | **91.50** |

计分器 fresh 输出：`COMPOSITE_SCORE=91.5`、`availableWeight: 1`、`missing: []`。

## 5. 下一 Task：B3，不是 B5 或立即 POSTER

### 5.1 裁决

| 候选 | 裁决 | 理由 |
|------|:---:|------|
| **CC-L3-B3 飞行光轨** | **GO** | V4=57 是最低维，比 V5 低 6 分；中远景生命感也是当前静态城市最明显的帧内缺口，并能与已完成的大气层形成前后层关系 |
| CC-L3-B5 变形运镜 | HOLD | V5=63 不是最低维；收益只集中在 9.4s 变形窗口，不能解决首幕/POI 的静态世界可信度 |
| CC-L3-POSTER | HOLD，B3 后必做 | runtime 尚未冻结；现在重拍会在 B3 后再次漂移。B3 独立审计结束后立即做三面收口，不得再夹运行时改动 |

### 5.2 B3 派发硬边界

1. 只做中远景 **2–3 条**飞行航线，点数总计 `≤800`；不得顺带改雾、相机、楼体、
   HUD、变形或 poster。
2. 派发前书面统一循环动画口径：列出现有 world 同屏循环项，把 B3 记作一项，并证明
   总数仍满足 canonical world `≤5`；不能继续只写含义不清的“CITY-03 ≤2 处”。
3. Q0 全效、Q1 减量、Q2 **完全关闭**；档位切换与 dispose 必须闭合，禁止遗留 ticker、
   geometry、material 或监听器。
4. fixed 首幕与 garage POI 都要提交静帧，证明光轨在中远层可见但不穿主体、不盖
   `AGENT NEXUS`/`AI CORE`/`TUNE-UP`；另交短动态证据，证明是真实运动而非静态亮线。
5. B3 的 V4 加分只按帧内可读覆盖与环境生命感计；“代码中有 800 点”不自动加分。
6. B3 后立即独立审计。若仍 `<68`，本 Loop 停止追加运行时效果，B5 顺延，禁止
   B3+B5 连续赌分；随后按门控链完成 POSTER 三面与 AL3 终审，如实登记未达目标。

### 5.3 POSTER 收口条件

B3 审计冻结 runtime SHA 后，POSTER 只做：

- desktop 1280×720、mobile 720×1280 独立构图、OG 复用 desktop；
- 帧内同时包含 B2 TextCanvas、最终 ATM 与最终 B3；
- 两张 poster 各自 `≤40KB`，更新经审阅的 VIS-01 基线；
- reduced-motion、无 WebGL、移动壳与社交 OG 四条消费链同源；
- POSTER 之后不再改 3D 参数，否则重新开债。

## 6. 中审结论

ATM 是一次有效但不足以单独过 68 的窄增益：实现质量和工程底盘合格，独立视觉从
AL3-B2C 的 65 升到 **66**；自评可信，但 V2 的帧内层次没有稳定跨入 70 段。

**门控链下一步：`CC-L3-B3 → CC-AL3-B3 → CC-L3-POSTER → CC-AL3`。**
B5 顺延，不与 B3 同 Loop 追加。
