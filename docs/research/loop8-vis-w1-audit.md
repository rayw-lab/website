# Loop 8 W1 视觉独立审计（CC-AL-VIS-L8-W1-R3）

> 执行模型自报：**claude-fable-5-thinking-xhigh**（R1/R2 零产出 stop，本轮 R3 重派）

| 项 | 审计事实 |
|---|---|
| 审计对象 | `main@dc3f56b`（L8 W1 全合后 tip；worktree fresh 构建，审计分支 `cursor/cc-al-vis-l8-w1-r3-1d6f`） |
| 比较基线 | 上次生产登记 `main@b2a59e4`（CC-AL-CAM 独立 71，raw 70.50；score JSON 自 `c5b80e6` 后无中间登记，git log 实核） |
| 冻结秤 | `docs/research/cyber-city-visual-rubric.md` v1.1（七维锚点 + 帧优先铁律 + 反通胀条款，原秤未动） |
| 环境 | Node v22.14.0、pnpm 10.33.3、Chromium(SwiftShader/WebGL2 后端)、1440×900；`pnpm install --frozen-lockfile` → `pnpm build`（19 pages，EXIT=0）→ 隔离 preview **:4335** |
| 独立视觉分 | **73 / 100**（raw 72.60；上轮 71，Δ+2.10）——`cyber-city-visual-rubric-score.json` 已同步，`node scripts/score-loop.mjs` 实跑确认 visual 轴 73 入账 |
| 裁决 | **GO**：X1a V4 专项门 72–75 判 **74**（H1 整帧直读成立）；D10 潜分收账（V5→74）本轮唯一执行；生产登记 71→73 |

## 1. 审计范围与可归因增量

`b2a59e4..dc3f56b` 视觉面增量（其余 FXN/PERF 合流仅计 HUD/道具随行效应）：

| 批 | 合流 | 视觉面 |
|---|---|---|
| CC-TRANS-FX | `c2301a7`+`dc1740d` | 变形窗过程化粒子层（充能喷发/环向碎屑/光幕光尘/落地余烬）——AL-TRANS-FX 已 GO 并建议 V5=74，生产分当时未登记 |
| CC-VEH-VIEW / VEH-C2 | `4daa723`/`554f119` | 驾驶 third↔FPV 双视角 V 键硬切 + drive shots 注册表单源 |
| CC-VIS-X3 招牌叙事 v2 | `c0bb67a` | 三层招牌体系（楼顶 EN 主匾 + 楼身 zh 竖幅 + 街层产品线灯箱）5 栋 + 全息广告板 4 块 + stagger 150ms 逐楼点亮 |
| CC-VIS-X1A-R4（BL2-R2） | `dea7c1e`（#92） | concept-garage hero GLB 入 main（148,696B/2,996tris，SHA `0b3717d4…35fb`）+ 螺旋塔体量再分布为南立面西段鼓塔 |
| CC-FXN C1–C6 随行 | 多枚 | 键位卡/进站前奏 tween/探索 chip n/12/G4 下一站 quest chip/G9 测速牌/确认层 |

X4（调色/tone mapping/bloom）与 poster 域本窗口零改动——V2/V3 不得凭空上修，只计帧内新增可见性。

## 2. 取证事故与更正（先例登记，防复发）

R3 草稿 commit（`a295aa2`）的首帧取证存在**跨会话串台**：本 VM 多代理并存，4331–4334 端口均被其他会话 preview 占用，`pnpm preview --port 4331` 实际回落到 **4335**，而草稿帧误从 4331（他人 stale 构建 = X3 已合、X1A 未合的中间态）取证。表征：页面 chunk `world.EB-mb3zd.js` 不在本轮 dist；`ConceptGarage.glb` 零请求；city 挂载日志自报「hero 实模 GLB 1 件在册」。

**更正**：草稿两帧全部作废重截。终稿全部帧取自 :4335，并逐项核对（a）页面 chunk hash ∈ 本轮 `dist/_astro/`（`world.of_r3jhK.js` 等实测命中）；（b）F2 会话 Q0 **双 hero GLB 请求**（`AutodriveLab.glb` + `ConceptGarage.glb`）——X1a fresh 探针合同在真实 main 上成立。**先例条款**：共享 VM 上取证前必须核对 preview 日志实际端口 + chunk hash 对账，此为后续视觉审计硬前置。

## 3. Fresh 帧入库登记（取证 B 协议）

| # | 帧 | 入库路径 | 取证参数 |
|---|---|---|---|
| F1 | robot_idle 首幕 | `docs/research/assets/visual-rubric/l8w1-world-robot-1440.webp`（82,072B） | `/website/` 默认路径；`data-state=ready` → `data-world-state=robot_idle` 落定后派发 `visibilitychange(hidden)` 暂停渲染再截；1440×900 CSS px；HeroRobot+两 hero GLB 请求在案 |
| F2 | `?poi=work-gallery` settled 整帧 | `docs/research/assets/visual-rubric/l8w1-poi-work-gallery-1440.webp`（126,414B） | 深链 settled（timeline：`deep-link#2 → ready#3 → world-quest#4 → poi-bounding-in#5 → explore-progress#6`）；Q0、1440×900；与 R4 取证同深链同 viewport（相机数值读出受 SwiftShader 主线程争用未截获，判定以 whole-frame 直读为准——与 X1a「整帧裸眼可读」唯一标尺一致） |
| F2a | F2 上部放大裁切（**仅辅助**） | `docs/research/assets/visual-rubric/l8w1-poi-work-gallery-crop-upper.webp`（50,348B） | F2 (400,0)+1040×500 原像素裁切，辅助佐证 H1，不作主证 |

## 4. 七维终稿（帧优先，逐维引用证据帧 + 锚点段落）

| 维 | 权重 | 上轮 | 终稿 | 锚点裁决与证据 |
|---|:---:|:---:|:---:|---|
| V1 首幕构图 | .20 | 65 | **68** | F1：机器人焦点 + 招牌中景（MASTER AGENT 主匾/楼身 zh 竖幅帧内直读）+ 剪影/雾/地平线辉光远景 ≥3 层纵深 + 飞行光轨天空微动——踩进 70-85 段「焦点明确 + ≥3 层纵深」下沿；poster 未重拍（A10 欠账）、definitive shot 打磨缺席，压回 68 |
| V2 光照材质 | .20 | 74 | **75** | 光照/后处理域零改动（X4 未动，bloom threshold/strength 原值）；可归因增量仅 F2 第二栋 hero GLB 的 KTX2/PBR 展厅玻璃 + 鼓身发光带入 POI 帧、湿地面反射蓝圈/光柱清晰（帧优先 +1）；70-85 段「反射/阴影在主要机位可见」维持 |
| V3 色彩氛围 | .15 | 69 | **70** | 招牌/广告板色族走 neon tokens 单源、逐楼语义色一致（F1 紫匾=Agent Nexus、F2 蓝幅=概念车库）；但同帧仍青+红+暖白+紫+橙多族并置（F1 窗色三族 + 招牌族 + 机器人橙），50-65↔70-85 边界取 70 |
| V4 场景密度 | .15 | 72 | **74** | **X1a H1 判定：过**——F2 整帧直读「弧形鼓身 + 横向光带（螺旋带）+ 屋顶阶差」组合轮廓（F2a 裁切仅辅助），不依赖顶缘裁切弧；**H5 专项门 72–75 内取 74**（下沿口径，第三栋收益归 X1b 不预支）。X3：三层招牌 5 栋 + 广告板令 3D 认楼不再靠 DOM（F1 MASTER AGENT / F2 CAR CONFIGURATOR·概念车库·AUTODRIVE 全帧内可读）；70-85 段「关键视角密度达标、覆盖不全」 |
| V5 动效转场 | .15 | 70 | **74** | **D10 潜分收账（唯一执行，两处不重复）**：AL-TRANS-FX GO 建议 74 落账（变形粒子四拍完整）；叠加本窗口合流的 C3 进站 tween、X3 stagger 150ms 逐楼点亮、FPV V 键双视角——70-85 段「关键节拍完成度高」下部；镜头运动打磨（B5 运镜）仍缺，静帧审计不越 74 |
| V6 UI/HUD 整合 | .10 | 73 | **74** | F1/F2：HERO TOWERS 常驻霓虹面板 + 探索 chip 1/12 + 「下一站 概念车库 36m 1/5」quest chip + 速度表 + POI 立体标牌（E 键图标 + 双语）同族视觉语言（+1）；系统字体栈零个性化维持扣分 |
| V7 主题原创 | .05 | 75 | **78** | 「楼=产品线」由 X3 产品线图标灯箱 + EN/zh 双语招牌帧内自明（F2 CAR CONFIGURATOR + 概念车库竖幅 + 车图标），鼓塔图腾整帧可读——上轮 70-85 段「仍靠文案自明」扣分点部分销账 |

**合成**：68×.20 + 75×.20 + 70×.15 + 74×.15 + 74×.15 + 74×.10 + 78×.05 = **raw 72.60 → 73/100**（上轮 71，Δ+2.10）。

反通胀核对：全部维分与上轮分差 <10，无需强制差异说明；仍逐维给出可归因增量。与 R3 草稿（V1 72）的差异：终稿按帧优先压回 68——草稿帧来自 stale 构建且未扣 poster/definitive shot 欠账。

## 5. 硬门自查

1. 独立审计署名，未采用实现方自评（X1a 实现记录自评不入本表）：**守住**。
2. 帧优先铁律：V2/V3/V5 未凭代码存在上修，只计帧内可见/已审 GO 收益：**守住**。
3. SwiftShader 折扣有界：构图/色彩/密度判断与渲染器无关；MSAA/色调偏差未作扣分理由：**守住**。
4. X1a H1「不借放大即可整帧读出组合轮廓」以 F2 主证、F2a 仅辅助：**守住**。
5. D10 潜分收账唯一执行（X3/X1a 两处不重复计）：**守住**——本审计为 W1 全合后首次生产登记。
6. 秤未动：rubric v1.1 权重/锚点零改动，score JSON schema 不变（weightSum=1 实测）：**守住**。
7. 零业务代码：本分支相对 main 仅 `docs/research/`（本报告 + score JSON + 3 帧 webp）：**守住**。
8. 取证串台已更正并登记先例条款（§2）：**守住**。

## 6. 裁决与下一轮

**GO，73/100 生产登记（71→73）。** 综合分敏感度：视觉仍是五轴最低位，每 +4 ≈ 综合 +1。到 85° 的欠账按 ROI 排序：

1. **A10 poster 重拍**（V1 最大单件欠账；X1a/X3 已合，重拍条件成熟，真机 GPU 按 §4 协议 ≤40KB）；
2. **X1b 第三栋 hero**（V4 74→77± 的下一台阶，独立 PR 独立归因）；
3. **B5 变形运镜 + 镜头微动**（V5 74 → 78± 需镜头层证据，静帧审计无法解锁）；
4. **V3 同帧色相纪律精修**（招牌/窗色/道具三族收敛的全城 pass，X4 域裁决后动）。

本审计只新增本报告、`cyber-city-visual-rubric-score.json` 重登与 3 帧取证 webp；`src/`、`e2e/`、配置与规格正文零改动。
