# 首屏 3D 动态设计方案：赛博座舱科技城 × 擎天柱入场 × 一键变形

| 项 | 内容 |
|----|------|
| 文档性质 | **原型 + UI/UE 设计输入**（首屏 Phase 0，非施工图） |
| 版本 | v0.1 |
| 日期 | 2026-08-25 |
| 触发 | 用户新愿景：打开即赛博城市；中央擎天柱机器人；点击变形为汽车；多栋主题大楼（多语种 / TTS / Master Agent / 智驾）；WASD 驶入大楼停车场后进展示页——**本稿只锁首屏** |
| 上游 | `portfolio-inspiration-community.md`（Jesse Zhou / Bruno / Night City）、`bruno-simon-teardown-adaptation.md`（morph 叙事）、`folio-gap-and-reuse-report.md`（引擎腿）、`PRD.md` §2.4/§2.6 |
| 决策状态 | **2026-08-25 王磊已拍板 D1–D6**（见 §6）；建筑扩展为 **10–20 栋可扩展地图**；变形后落在十字路口可操作；Fable5 执行实施/PRD/SRD |

---

## 0. 摘要（先读这 8 行）

1. **产品一句话**：访客进入网站，落在霓虹赛博「智能座舱科技城」上空——中央一尊**站岗的座舱 AI 机器人**（擎天柱气质，非 IP 复刻），背后四栋发光地标楼；点一次「变形」→ 同一角色变为**同一辆 CarConcept 概念车**，城市灯光与 UI 同步切换「巡航态」。
2. **首屏只做「第一幕」**：静态/微动城市 + 机器人英雄 + 变形仪式 + 四楼标牌可读——**不在首屏交付**全图 WASD 漫游与进楼（那是 Phase 1 世界壳，接 folio 引擎腿）。
3. **与 PRD 对齐**：炫技服务「智能座舱 × 多语种 × 端云 AI」——赛博是**座舱研发城的视觉隐喻**，不是通用粒子模板脸；机器人=座舱 Master Agent 人格化，车=量产交付载体（沿用 LAB-17 叙事）。
4. **技术路线**：延续本站 **Astro + vanilla three/TSL + WebGPU 优先**（禁 R3F/React 第二套架构）；首屏独立 `HeroCyberCity` 模块，变形逻辑预置 `TransformSystem` 接口，Phase 1 与世界合体。
5. **竞品启示**：Jesse Zhou 拉面店 = 单场景高完成度；Bruno = 驾驶探索；Night City / Cyber Megapolis = 城市尺度 + WASD——我们取 **Jesse 的首屏冲击 + Bruno 的变形叙事 + 城市楼即导航** 的杂交，但**首屏克制为「英雄时刻」**。
6. **UI 原则**：3D 是舞台，信息在 **DOM 霓虹 HUD**（可读、可 SEO、可跳过）；猎头 0 秒可见定位语 + 「跳过 3D」。
7. **首屏性能预算**：交互前壳 ≤90KB gzip；首屏 3D 首包（城+机器人低模）≤2MB；机器人可见 ≤2.5s；变形动画 1.0–1.2s。
8. **下一步**：王磊确认本稿 §6 决策表 → Fable5 执行 8 个并行 Task（调研/Premortem/线框/资产）→ 输出 Figma 级静态原型 + 可点 HTML 灰盒。

---

## 1. 用户愿景拆解（思绪 → 可施工需求）

| 用户原话 | 设计翻译 | 首屏范围 |
|----------|----------|----------|
| 赛博风格城市 | 霓虹天际线 + 湿地面反射 + 体积雾 + 楼宇发光窗格；色调：深蓝底 + 青/品红霓虹 + 工业橙点缀（全站 token） | ✅ 远景城市剪影 + 近景平台 |
| 进入就是擎天柱机器人 | 中央 8–12m 级人形机器人，站姿警戒；**造型原创**（块面机甲 + 座舱 HUD 胸甲），避免 Transformers 商标元素 | ✅ 英雄主体 |
| 点击变身变汽车 | 主 CTA「变形 · 巡航态」；V1 **遮蔽式变形**（光幕 + 0.9s 模型热交换），机器人 GLB ↔ CarConcept | ✅ 核心交互 |
| 多语种大楼 / TTS / Master Agent / 智驾大楼 | 四座主题塔楼环形排布，楼顶全息招牌 + DOM 侧栏列表 | ✅ 标牌与光效；❌ 暂不可驶入 |
| WASD 进停车场再进展示页 | 第二幕：车形态下第三人称驾驶 → 楼前停车触发 → View Transition 进 `/lab/*` 或 overlay | ❌ Phase 1（世界壳） |
| 先做首屏 | 本提案边界 | ✅ |

---

## 2. 首屏体验剧本（30 秒时间轴）

```text
T+0.0s   黑场 → 霓虹天际线渐亮（CSS+canvas 同步），湿地面网格微光脉动
T+0.3s   镜头：低空斜俯 25°，机器人从光柱中显现（scale 0.92→1，落地轻震）
T+0.0s   DOM：左上角定位语淡入；右上角「跳过 3D → /work/」；底部 HUD 栏
T+1.5s   机器人待机：胸甲 HUD 呼吸灯、头部轻微环顾（idle，≤2 循环动画配额）
T+2.0s   四栋大楼招牌依次亮起（stagger 150ms）：多语种 · TTS · Master Agent · 智驾
T+任意   用户点击「变形 · 巡航态」或按 Space（首屏唯一主操作）
T+变形   0.15s 充能环（地面）→ 0.35s 光幕包裹 → 0.4s 热交换 → 车落地弹跳（folio 2019 语法）
T+变形后 HUD 切换：显示「WASD 准备就绪」+ 禁用态提示「驶入城市 · Phase 1」
T+30s    若未操作：DOM 次 CTA「60 秒了解王磊」脉冲一次（不抢 3D 主戏）
```

**reduced-motion**：跳过全部动画，直接呈现机器人终态 + 静态城市；变形变为 instant swap + 文字状态切换。

---

## 3. 3D 场景构图（单帧可读性）

### 3.1 相机与构图

| 参数 | 值 | 理由 |
|------|-----|------|
| 镜头类型 | 固定轨相机（首屏不自由漫游） | 保证每帧构图可控、Lighthouse 稳定 |
| 位置 | 距机器人 18m，高度 6m，俯角 22° | 机器人全身 + 四座楼入画 |
| FOV | 42° | 略窄，电影感 |
| 微动 | 0.02°/s 缓慢 yaw + 0.3m 振幅 bob（可关） | 避免「截图感」 |

### 3.2 场景分层（由远到近）

```text
┌─────────────────────────────────────────────────────────────┐
│  Z=-200  天际线剪影层：12–20 栋程序化楼块 + 随机窗格 emissive │
│  Z=-80   中景雾层 + 飞行光轨粒子（≤800 点）                    │
│  Z=-40   四座主题塔（实例化 mesh，各 1 套 GLB 或纯代码楼）       │
│  Z=0     英雄平台：六边形金属台 + MeshGrid 地面（folio 同款）   │
│  Z=0     机器人 / 车（同一锚点，y=0）                          │
│  Z=+5    近景雨丝/尘粒（屏幕空间，低配关）                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 四座主题大楼（首屏仅「远看+招牌」）

| 楼 | 屏幕位置 | 楼顶全息字 | 色标 | 未来深链 |
|----|----------|------------|------|----------|
| **Lingua Tower** | 左前 | 多语种方案 | 青 `#49c5b6` | `/work/` 多语种案例 + TTS Lab |
| **Voice Pod** | 右前 | 座舱 TTS | 品红 `#ff2d6f` | `/lab/tts-cockpit/` |
| **Agent Nexus** | 左后 | Master Agent | 紫 `#a855f7` | 未来 master-agent Lab |
| **AutoDrive Lab** | 右后 | 智能驾驶 | 橙 `#ff6b35` | `/work/` 智驾案例 |

楼体首屏：**低模 + emissive 窗格纹理**（单张 512 atlas），不追求近景细节；点击楼顶 DOM 标签可跳转（首屏不做 3D raycast 点楼）。

---

## 4. 机器人 ↔ 汽车变形（LAB-17 首屏落地）

### 4.1 叙事（与 PRD 一致）

- **机器人态**：座舱 AI / Master Agent 人格化——站岗、讲解、交互。
- **车态**：量产交付载体——巡航、试驾、工程能力。
- 首屏变形 = **用户主动模式切换**，不是自动触发（降低惊吓；符合 opt-in 精神）。

### 4.2 V1 技术：遮蔽式变形（不骨骼 IK）

```text
1. 用户触发 transform
2. 地面充能环（TSL，复用 Intro 圆环 shader 思路）半径 0→4m，0.35s
3. 全屏截面光幕（additive 平面，opacity 0→1→0，0.4s）
4. 光幕峰值时：robot.visible=false; car.visible=true（同 transform 锚点）
5. 车 y 从 +2m 落至 0，easeOutBack 弹跳（folio 2019 reveal）
6. 播放变形音效（Phase C；首屏可静音占位）
```

**资产**：机器人首版目标 ≤800KB Draco GLB（低模原创）；车 = 现有 `car-concept`（可首屏先用低模占位盒 + 车顶壳，变形后再挂高清）。

### 4.3 状态机

| 状态 | 输入 | 3D | DOM HUD |
|------|------|-----|---------|
| `robot_idle` | 初始 | 机器人 idle | CTA「变形 · 巡航态」 |
| `transforming` | — | 变形中 | 按钮 disabled + 进度 |
| `car_idle` | 变形完 | 车 idle 自转 | 「WASD 即将开放」+ 楼列表可点 |
| `car_ready` | Phase 1 | 可驾驶 | 迷你地图占位 |

---

## 5. UI / UE overlay 规范（DOM 层，非 canvas 内字）

### 5.1 布局（1440 × 900 基准）

```text
┌──────────────────────────────────────────────────────────┐
│ [王磊｜汽车智能座舱与 AI 解决方案经理]     [跳过 3D] [音] │
│                                                          │
│                    （全屏 WebGL canvas）                  │
│                                                          │
│  ┌─楼宇快览────────┐                                      │
│  │ ◉ 多语种方案    │                                      │
│  │ ◉ 座舱 TTS      │                                      │
│  │ ◉ Master Agent  │                                      │
│  │ ◉ 智能驾驶      │                                      │
│  └─────────────────┘                                      │
│                                                          │
│ [ 变形 · 巡航态 ]  [ 60 秒了解王磊 → ]                    │
│ WASD · 变形 · 进入大楼（Phase 1）                         │
└──────────────────────────────────────────────────────────┘
```

### 5.2 视觉语言

| 元素 | 规范 |
|------|------|
| 字体 | 标题：Orbitron 或现有 Inter 加宽距；正文：Inter；代码感标签：JetBrains Mono |
| HUD 面板 | 1px 霓虹描边 + 8% 透明度填色；`backdrop-filter` 仅导航/HUD 两处（master-plan 允许） |
| 主 CTA | 工业橙填充；hover 霓虹外发光（box-shadow，非 canvas） |
| 焦点 | 跳过 3D 为页内第一个 tabindex；键盘 Tab 顺序：跳过 → 主 CTA → 四楼链接 → 次 CTA |

### 5.3 移动端（375px）

- 画布全屏；DOM 楼列表收成底部横向 chip。
- 主 CTA 全宽；机器人略缩小（相机 FOV +5°）。
- 变形保留；**不承诺**首屏移动端 WASD（Phase 1 再分流 2D 地图）。

---

## 6. 决策锁定（2026-08-25 王磊拍板）

| # | 问题 | **终裁** |
|---|------|----------|
| D1 | `/` 是否全屏科技城 | **是**——Full Entry；DOM 壳保 SEO/跳过出口 |
| D2 | 机器人气质与资产 | **Fable5 联网搜公共素材自决**（GitHub / CC0 / MIT）；零 Transformers 商标；站巨人肩膀 |
| D3 | 城市精度 | **不降级 · 高端炫技**——程序化 + 高模实例并存，不以「剪影占位」冒充交付 |
| D4 | 变形后体验 | **落在科技城十字路口 + 操作提示 + 可操作（WASD）**——首屏即含驾驶第一拍 |
| D5 | PRD「赛博朋克」禁令 | **同意修订**——白名单「智能座舱科技城」领域强相关 |
| D6 | Lighthouse | **接受**——`/` Perf 分层；内容页/`/home/` 维持四项 ≥95 |

**建筑扩展（新增硬需求）**：主题大楼从 4 栋扩展为 **10–20 栋**，地图 schema 可扩展（JSON 单源），首版交付 ≥10 栋可见地标，预留槽位到 20。

---

## 7. 竞品与先例矩阵（交叉调研摘要）

| 参考 | 学什么 | 不学什么 |
|------|--------|----------|
| [Jesse Zhou 拉面店](https://jessezhou.com) | 单场景霓虹完成度、bloom 节制、非工程背景转型叙事 | 单室内景；我们需城市尺度 |
| [Bruno Simon](https://bruno-simon.com) | 车落地弹跳、同一辆车贯穿、驾驶即导航 | 全屏接管首页；灰盒试验场审美 |
| [Night City](https://github.com/cyrus2281/night-city) | Rapier+城市 Easter egg、狐狸/载具探索 | React 栈；我们 vanilla |
| [Cyber Megapolis](https://www.linkedin.com/posts/farhad-ali-029857283/) | 楼=章节、WASD+E 交互、霓虹路灯 | 零构建步、体量过大 |
| [HekTek City v4](https://discourse.threejs.org/t/showcase-hektek-city-v4/) | 楼=section、自动导览 Imoto | R3F 架构 |
| [mecha-portfolio](https://github.com/chiubaca/mecha-portofolio) | 机甲部位=技能映射 | 线框 Gundam 审美 |
| 本站 `car-configurator` | CarConcept 管线、WebGPU 徽章 | — |
| 本站 `folio-2025` Reveal | 圆环 loader、遮蔽揭示 | 整包 folio 世界 |

---

## 8. Premortem：首屏失败模式（调研 Task 须逐条验证）

| # | 失败模式 | 早期信号 | 缓解 |
|---|----------|----------|------|
| P1 | 「AI 模板赛博脸」 | 青紫粒子+网格地板无叙事 | 绑四座「座舱」主题楼 + 王磊定位语常显 |
| P2 | 机器人资产版权/恐怖谷 | 像某 IP | 原创块面机甲 Brief + 法务图库审查 Task |
| P3 | 首屏 >5s 黑屏 | LCP 失败 | poster 先显、GLB 渐进、Draco |
| P4 | 变形像 PPT 切页 | 用户吐槽「假」 | 光幕+落地弹跳+同一阴影锚点 |
| P5 | 猎头 10 秒抓不到人 | 定位测试失败 | DOM 定位语不可被 canvas 挡；跳过出口 |
| P6 | 移动端烫手 | 中端机 <24fps | DPR 封顶、粒子关、rain 关 |
| P7 | 与 Hybrid PRD 冲突 | 审计打回 | D5 修订 + §6.1 小批次 |
| P8 | 范围膨胀成开放世界 | 工期失控 | 本稿红线：首屏不交付 WASD 进楼 |
| P9 | 双引擎分裂 | spike + hero 两套代码 | Hero 模块预置 `TransformSystem` 与世界合体 |
| P10 | 霓虹过曝看不清字 | a11y 失败 | HUD 全 DOM；对比度 ≥4.5:1 |

---

## 9. 技术挂载点（给工程 Task 的接口预览）

```text
src/lab/modules/hero-cyber-city/
  index.ts              # mount() 契约，对接 facade
  CyberCityScene.ts     # 场景图
  CitySilhouette.ts     # 远景程序化
  ThemeTowers.ts        # 四座楼实例
  HeroRobot.ts          # 机器人 GLB + idle
  HeroCar.ts            # CarConcept 薄封装
  TransformRitual.ts    # 遮蔽变形（→ 未来迁入 world/TransformSystem）
  NeonRain.ts           # 可选粒子
src/pages/index.astro   # 世界入口壳 + poster LCP
public/models/hero-robot/  # ≤800KB 首版
```

**不动**：内容页 URL、`car-configurator` / `tts-cockpit` 深链；**复用**：`MeshGridMaterial`、`PreRenderer`、facade 拦截链。

---

## 10. 交付物清单（设计 Phase 完成定义）

| 交付物 | 负责人 | 产出路径 |
|--------|--------|----------|
| 静态关键帧 3 张（机器人态/变形中/车态） | Fable5 T2 | `docs/spec/assets/design/cyber-hero/` |
| 交互线框（桌面+移动） | Fable5 T3 | 本文 §5 + wireframe PNG |
| 变形分镜（6 格） | Fable5 T4 | `docs/research/cyber-city-transform-storyboard.md` |
| 竞品调研表（≥15 条） | Fable5 T1 | `docs/research/cyber-city-competitive-research.md` |
| Premortem 打勾表 | Fable5 T1 | §8 每条有证据链接 |
| 机器人造型 Brief | Fable5 T5 | `docs/research/cyber-hero-robot-art-brief.md` |
| HTML 灰盒可点原型 | Fable5 T7 | `/prototypes/cyber-hero/`（可选分支） |
| 性能粗算表 | Fable5 T6 | ≤2MB 首包分解 |

---

## 附：与旧提案关系

- 推翻 `full-entry-world-proposal-ux.md` 的「路线 C 单车舞台」视觉，但**保留**：同 canvas、同车、遮蔽变形、DOM 跳过出口。
- 取代 `world-spike` 灰盒审美，但**保留** folio 引擎腿与 spike 驾驶参数作 Phase 1 底座。
- 用户新愿景 = **城市导航隐喻**，比「试验场环形道」更贴近「多产品线大楼」。

*本文 v0.1 供评审；代码零改动。*
