# CC-MAP1：赛博科技城大楼目录（12 栋首版 + 预留至 20）与可扩展地图 Schema

| 项 | 内容 |
|----|------|
| 文档性质 | **地图数据设计稿**（大楼目录 + 出生点布局 + JSON schema 草案 + 流式加载策略） |
| 版本 | v0.1 |
| 日期 | 2026-08-25 |
| 任务号 | CC-MAP1 |
| 上游 | `cyber-city-hero-design-proposal.md`（§3.3 四塔色标锁定、§6 D4「变形后落十字路口可操作」、§6 建筑扩展硬需求 10–20 栋） |
| 数据单源 | `src/data/cyber-city-buildings.json`（本稿附带草案，引擎/HUD/迷你地图唯一事实源） |
| 红线 | 只产文档 + JSON；**不改 world 引擎代码**；四塔中英名与色标沿用提案，不得漂移 |

---

## 0. 摘要（先读这 6 行）

1. **首版 12 栋，槽位封顶 20**：提案原 4 塔升级为十字路口内环四角锚点；新增 8 栋把 Work / Insights / About / Contact / AI-Lab / Now / 端云 / 车库全部空间化；外环预留 8 个编号槽位（13–20），JSON 中占位可解析。
2. **出生点 = 十字路口正中 (0, 0)**：变形完成后车头朝北，第一眼看到内环四塔 + 东侧概念车库（5 栋高清）。
3. **五大城区**：南口语言双子（多语种/TTS）、北城 AI 中枢（Agent/端云/工作流/状态塔）、东城出行（智驾/车库）、东南作品区（Work/Insights）、西南个人区（About/Contact）——城区共享霓虹色族，迷你地图按区渲染。
4. **JSON 单源可扩展**：`id / slug / title(中英) / position / footprint / neonColor / deepLink / category / unlockPhase / parkingBay` 十个核心字段 + 流式配置；加一栋楼 = 加一条 JSON，引擎零改动。
5. **流式加载三档**：出生 5 栋高清（合计 ≤900KB，给机器人留 800KB 预算）→ 260m 内中模实例 → 更远程序化剪影零网络请求；接近 120m 异步升模、±20m 迟滞防抖。
6. **深链全部落在真实路由**：12 栋中 10 栋 `live`、2 栋 `fallback`（智驾与 Master Agent 专页未上线前分别落 `/work/`、`/ai-lab/`，JSON 用 `deepLinkStatus` 标记，上线即改一个字段）。

---

## 1. 首版 12 栋大楼目录

优先级定义：**P0** = 首屏第一幕即可见可交互（出生高清）；**P1** = Phase 1 世界壳 WASD 开放时点亮；**P2** = Phase 2 扩展点亮。

| # | id | 中文名 | 英文名 | 职能（一句话） | 色标 | 深链 | 状态 | 优先级 |
|---|----|--------|--------|----------------|------|------|------|--------|
| 01 | `lingua-tower` | 多语种方案塔 | Lingua Tower | 39 语种座舱本地化交付展馆（提案锁定塔） | 青 `#49c5b6` | `/work/multilingual-cockpit/` | live | P0 |
| 02 | `voice-pod` | 座舱语音舱 | Voice Pod | 车载 TTS 声学舱，直通 TTS Cockpit Lab（提案锁定塔） | 品红 `#ff2d6f` | `/lab/tts-cockpit/` | live | P0 |
| 03 | `agent-nexus` | 主智能体中枢 | Agent Nexus | Master Agent 总部，机器人「回家」的楼（提案锁定塔） | 紫 `#a855f7` | `/ai-lab/` | fallback → 未来 `/lab/master-agent/` | P0 |
| 04 | `autodrive-lab` | 智驾实验楼 | AutoDrive Lab | 智能驾驶案例实验楼（提案锁定塔） | 橙 `#ff6b35` | `/work/` | fallback → 未来智驾案例专页 | P0 |
| 05 | `concept-garage` | 概念车库 | CarConcept Garage | 变形后第一驾驶目标：3D 汽车配置器车库 | 电光蓝 `#3b82f6` | `/lab/car-configurator/` | live | P0 |
| 06 | `work-gallery` | 交付案例馆 | Works Gallery | Work 索引空间化：全部量产交付案例陈列 | 琥珀金 `#f59e0b` | `/work/` | live | P1 |
| 07 | `insights-archive` | 洞察档案塔 | Insights Archive | Insights 索引空间化：方法论与评审清单档案 | 冰蓝 `#7dd3fc` | `/insights/` | live | P1 |
| 08 | `about-pavilion` | 个人档案馆 | About Pavilion | 关于王磊：职业叙事与能力图谱 | 暖白 `#fef3c7` | `/about/` | live | P1 |
| 09 | `contact-beacon` | 联络信标塔 | Contact Beacon | 细高信标塔，顶部脉冲天线 = 联系入口 | 激光青柠 `#a3e635` | `/contact/` | live | P1 |
| 10 | `edge-cloud-hub` | 端云算力枢纽 | Edge-Cloud Hub | 横向机房体量：端云大模型能力分层案例 | 矩阵绿 `#22c55e` | `/work/llm-capability-layering/` | live | P1 |
| 11 | `workflow-foundry` | AI 工作流工厂 | Workflow Foundry | AI 原生工作流铸造车间 | 钢银 `#94a3b8` | `/work/ai-native-workflow/` | live | P2 |
| 12 | `now-signal` | 当前状态塔 | Now Signal | 天线塔实时广播「王磊现在在做什么」 | 玫瑰 `#fb7185` | `/now/` | live | P2 |

**色标说明**：01–04 沿用提案 §3.3 锁定值不得改；新增 8 栋取互异色相；`now-signal`（玫瑰）与 `voice-pod`（品红）同为粉族但分处北端/南口，空间上不相邻，且明度差 ≥1 档；同城区楼共享色族属有意设计（见 §3）。

**deepLinkStatus 约定**：`fallback` 表示目标专页未上线、临时落上级索引；专页上线后只改 JSON 中 `deepLink` 与 `deepLinkStatus` 两个字段，3D 场景与 HUD 零改动。

---

## 2. 预留槽位 13–20（外环，Phase 2 激活）

槽位在 JSON `reservedSlots` 中占位（有 id、位置、朝向），无内容字段；激活 = 把槽位提升为 `buildings` 条目。候选主题为**非约束建议**，按领域强相关排序。

| 槽位 | 外环方位 | 世界坐标 (x, z) | 候选主题（建议） | 归属城区（建议） |
|------|----------|------------------|-------------------|-------------------|
| `slot-13` | 北偏东 | (96, -216) | OTA 升级站（整车软件交付） | 东城出行区 |
| `slot-14` | 东偏北 | (216, -96) | 导航地图中心（座舱地图/POI） | 东城出行区 |
| `slot-15` | 东偏南 | (216, 96) | HMI 设计工坊（座舱交互设计） | 东南作品区 |
| `slot-16` | 南偏东 | (96, 216) | 声学消音实验室（TTS 评测/音色库） | 南口语言区 |
| `slot-17` | 南偏西 | (-96, 216) | 职业机会之门（猎头/招聘专用入口） | 西南个人区 |
| `slot-18` | 西偏南 | (-216, 96) | 天际观景台（全站地图/俯瞰导览） | 西南个人区 |
| `slot-19` | 西偏北 | (-216, -96) | 多模态感知塔（视觉+语音融合） | 北城 AI 区 |
| `slot-20` | 北偏西 | (-96, -216) | 功能安全中心（AI 安全冗余） | 北城 AI 区 |

未激活的槽位在场景中渲染为**程序化剪影 + 熄灯窗格**（零网络请求），维持城市密度，不产生可交互标牌。

---

## 3. 五大城区（category 取值域）

| category | 城区 | 成员 | 色族 | 叙事 |
|----------|------|------|------|------|
| `language` | 南口语言双子 | 01 lingua-tower · 02 voice-pod | 青 × 品红 | 出生回头第一眼：多语种 × 语音是王磊主战场 |
| `ai-core` | 北城 AI 中枢区 | 03 agent-nexus · 10 edge-cloud-hub · 11 workflow-foundry · 12 now-signal | 紫/绿/银 | 机器人「老家」，Master Agent 与端云算力聚集 |
| `mobility` | 东城出行区 | 04 autodrive-lab · 05 concept-garage | 橙 × 电蓝 | 车形态的主动线：智驾 + 试驾车库 |
| `gallery` | 东南作品区 | 06 work-gallery · 07 insights-archive | 琥珀 × 冰蓝 | 内容型页面的展馆带 |
| `civic` | 西南个人区 | 08 about-pavilion · 09 contact-beacon | 暖白 × 青柠 | 「找人」动线：了解王磊 → 取得联系 |

城区用途：迷你地图图例分组、街区路灯色调、HUD 楼宇快览分栏；引擎按 `category` 聚合，不硬编码楼名。

---

## 4. 十字路口出生点布局

### 4.1 坐标系与道路

- **坐标系**：three.js 右手系，`+X = 东`，`+Z = 南`，`+Y = 上`；地面 y=0，单位米。
- **朝向**：heading 单位度，`0 = 北(−Z)`，顺时针递增（90 = 东）。
- **道路**：南北向「中轴大道」（x ∈ [−12, 12]）× 东西向「霓虹大街」（z ∈ [−12, 12]），路宽 24m，交汇即出生十字路口。
- **出生点**：`(0, 0)`，heading 0（车头朝北）——变形光幕散去，正面是 Agent Nexus 与 AutoDrive Lab 的峡谷缺口，符合提案 D4。

### 4.2 俯视 ASCII（示意，非等比）

```text
                              北 (−Z)
     ◇20                        ║                        ◇13
                 ┌─────────┐    ║    ┌─────────┐
                 │12 状态塔 │    ║    │11 工作流 │
                 │Now Signal│   ║    │ Foundry │
                 └─────────┘    ║    └─────────┘
 ◇19  ┌───────────┐             ║             ┌───────────┐  ◇14
      │10 端云枢纽 │   ┌───────┐ ║ ┌───────┐   │05 概念车库 │
      │ Edge-Cloud│   │03 Agent│ ║ │04 智驾 │   │  Garage   │
      └───────────┘   │ Nexus │ ║ │  Lab  │   └───────────┘
西 ═══════════════════└───────┘ ✚ └───────┘═══════════════════ 东
（霓虹大街）           ┌───────┐ ║ ┌───────┐        （Neon Blvd）
      ┌───────────┐   │01 多语种│ ║ │02 TTS │   ┌───────────┐
      │09 联络信标 │   │ Lingua │ ║ │ Voice │   │06 案例馆   │
      │  Beacon   │   └───────┘ ║ │  Pod  │   │  Gallery  │
      └───────────┘             ║ └───────┘   └───────────┘
                 ┌─────────┐    ║    ┌─────────┐
                 │08 档案馆 │    ║    │07 洞察塔 │
 ◇18             │  About  │    ║    │Insights │             ◇15
                 └─────────┘    ║    └─────────┘
     ◇17                        ║                        ◇16
                              南 (+Z)

  ✚ = 出生点(0,0)  ║/═ = 中轴大道/霓虹大街  ◇ = 预留槽位(外环剪影)
```

### 4.3 世界坐标表（含泊车位）

`position` 为楼体足迹中心；`footprint` 为 宽w(x) × 深d(z) × 高h；`parkingBay` 为进楼触发泊车位（车驶入半径内减速停稳 → View Transition 进深链页），bay 一律朝向楼门、背靠街道。

| # | id | position (x, z) | footprint w×d×h (m) | parkingBay (x, z / heading / r) | 距出生点 |
|---|----|------------------|----------------------|----------------------------------|----------|
| 01 | lingua-tower | (-52, 52) | 36×36×78 | (-28, 28) / 225° / 6 | ≈74m |
| 02 | voice-pod | (52, 52) | 32×32×42 | (28, 28) / 135° / 6 | ≈74m |
| 03 | agent-nexus | (-52, -52) | 40×40×96 | (-28, -28) / 315° / 6 | ≈74m |
| 04 | autodrive-lab | (52, -52) | 44×36×60 | (28, -28) / 45° / 6 | ≈74m |
| 05 | concept-garage | (140, -44) | 60×36×18 | (140, -18) / 0° / 8 | ≈147m |
| 06 | work-gallery | (140, 44) | 56×32×36 | (140, 18) / 180° / 6 | ≈147m |
| 07 | insights-archive | (44, 150) | 32×48×66 | (20, 150) / 90° / 6 | ≈156m |
| 08 | about-pavilion | (-44, 150) | 36×36×40 | (-20, 150) / 270° / 6 | ≈156m |
| 09 | contact-beacon | (-140, 44) | 24×24×88 | (-140, 24) / 180° / 6 | ≈147m |
| 10 | edge-cloud-hub | (-140, -44) | 64×40×32 | (-140, -18) / 0° / 6 | ≈147m |
| 11 | workflow-foundry | (48, -150) | 48×32×28 | (18, -150) / 90° / 6 | ≈157m |
| 12 | now-signal | (-44, -150) | 20×20×72 | (-26, -150) / 270° / 6 | ≈156m |

排布校验：楼体近街边缘距路缘 ≥8m（留人行道 + 泊车位）；内环四角楼间峡谷口宽 64m，车速 ≤40km/h 可安全通过；天际高度差（18m 车库 ↔ 96m 中枢）保证剪影层轮廓不呆板。

---

## 5. 数据 Schema 字段字典（`src/data/cyber-city-buildings.json`）

顶层结构：`world`（坐标系/道路/出生点）+ `streaming`（加载策略参数）+ `districts`（城区）+ `buildings[]`（12 栋）+ `reservedSlots[]`（8 槽）。

### 5.1 building 条目字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 稳定机器键（kebab-case），引擎/存档/深链锚全部用它，**创建后不可改** |
| `slug` | string | ✅ | URL/资产目录友好名，通常与 id 同值；GLB 路径约定 `public/models/city/{slug}.glb` |
| `title` | `{zh, en}` | ✅ | 中英双语楼名；楼顶全息招牌显示 `en`，DOM 楼宇快览显示 `zh` |
| `role` | string | ✅ | 一句话职能，供 HUD tooltip 与 aria-label |
| `category` | enum | ✅ | 城区归属：`language / ai-core / mobility / gallery / civic`（见 §3） |
| `position` | `{x, z, rotationY}` | ✅ | 足迹中心世界坐标（米）+ 楼体绕 Y 旋转（度）；y 恒 0 不入库 |
| `footprint` | `{w, d, h}` | ✅ | 宽（x 向）× 深（z 向）× 高，米；剪影层直接由此拉伸生成 |
| `neonColor` | string | ✅ | 主霓虹色 hex；招牌、窗格 emissive、泊车位光圈、迷你地图图钉共用 |
| `deepLink` | string | ✅ | 站内路由（尾斜杠齐全）；泊车触发后跳转目标 |
| `deepLinkStatus` | enum | ✅ | `live`（真实页面）/ `fallback`（临时落上级索引，专页上线后更新） |
| `priority` | enum | ✅ | `P0 / P1 / P2`，资产制作与点亮排期 |
| `unlockPhase` | int | ✅ | `0` 首屏第一幕点亮；`1` 世界壳 WASD 开放点亮；`2` Phase 2 扩展点亮 |
| `lodProfile` | enum | ✅ | `hero`（出生高清五栋）/ `standard`（可升高清）/ `skyline`（最高只到中模） |
| `parkingBay` | `{x, z, heading, radius}` | ✅ | 泊车触发区：圆心、车头朝向（停稳态）、触发半径（米） |

### 5.2 扩展规则（保证「加楼零改代码」）

1. **加一栋楼** = 在 `buildings[]` 追加一条完整条目，或把某个 `reservedSlots` 条目升级（沿用其 position）；引擎按数组渲染，无硬编码楼名。
2. **封顶 20**：`world.maxBuildingSlots = 20`；`buildings.length + reservedSlots.length ≤ 20` 为构建期校验断言（后续可加 JSON Schema 文件与 CI 校验，本稿不做）。
3. **禁改字段**：`id` 创建后不可变；01–04 号楼 `neonColor` 与 `title` 为提案锁定值。
4. **道路即约束**：新楼足迹不得侵入道路带（`|x|<12` 或 `|z|<12` 的条带），泊车位必须在路缘与楼门之间。
5. **未来兼容**：新增可选字段（如 `signageTexture`、`interiorScene`、`audioAmbience`）直接加在条目上，旧引擎忽略未知字段即可，`schemaVersion` 按 semver 递增。

---

## 6. 流式加载策略（出生 5 栋高清 + 其余 LOD/剪影）

### 6.1 三档 LOD

| 档 | 名称 | 内容 | 网络成本 | 适用 |
|----|------|------|----------|------|
| **H** | 高清 | Draco GLB + 招牌网格 + 程序化窗格 emissive shader（TSL，省贴图） | ≤220KB/栋 | `lodProfile: hero` 出生即载；`standard` 接近时升 |
| **M** | 中模 | 实例化盒体组合 + 共享 512 emissive atlas（全城 1 张） | 全城摊销 ≤150KB | 120–260m 环带内所有楼 |
| **S** | 剪影 | 由 `footprint` 拉伸的程序化体块 + 窗格噪声 shader | **0 请求** | >260m、预留槽位、reduced-motion 兜底 |

### 6.2 升降模规则

```text
每帧（节流 4Hz）对每栋楼计算 dist = |car.xz - building.xz|：
  dist < 120m 且 lodProfile ≠ skyline → 请求 H（异步，crossfade 250ms）
  120m ≤ dist < 260m                  → M
  dist ≥ 260m                         → S
迟滞：升模阈值 120m、降模阈值 140m（±20m），防止路口徘徊抖动
预取：车速向量指向某楼且 dist < 160m → 提前入队
并发：HD 加载并发 ≤2；常驻 HD ≤8 栋，超出按 LRU 卸载（P0 五栋豁免不卸）
```

### 6.3 首包预算（对齐提案 ≤2MB）

| 项 | 预算 |
|----|------|
| 出生 5 栋 HD（01–05，共享材质/几何压缩后） | ≤900KB |
| 机器人低模 GLB | ≤800KB（提案锁定） |
| 车低模（CarConcept 占位壳） | ≤200KB |
| 中模 atlas + 杂项 | ≤100KB |
| **合计** | **≤2.0MB** ✅ |

P1 五栋（06–10）HD 在首次交互后 `requestIdleCallback` 静默预取；P2 两栋与槽位只在接近时按 §6.2 拉取。迷你地图、楼宇快览 DOM 列表与 3D 场景读同一份 JSON，保证「地图即数据」。

---

## 7. 与上游提案的对齐清单

| 提案条款 | 本稿落实 |
|----------|----------|
| §3.3 四塔中英名/色标/方位（左前多语种、右前 TTS、左后 Agent、右后智驾） | 内环四角 1:1 保留（相机自南向北看，左前=西南）；色标逐字节一致 |
| §6 D4 变形后落十字路口 + WASD 可操作 | 出生点 (0,0) 即十字路口正中，泊车位/道路宽度按驾驶动线校验 |
| §6 建筑扩展 10–20 栋、JSON 单源、首版 ≥10 可见 | 首版 12 栋（>10 ✅）+ 8 预留槽位 = 封顶 20；单一 JSON |
| §0-7 首屏性能预算 ≤2MB | §6.3 分解表合计 2.0MB，机器人 800KB 预算原样保留 |
| §9 技术挂载点 `ThemeTowers.ts` | 该模块未来改为读本 JSON 渲染 N 栋（本稿不改代码，仅约定数据形状） |
| P1 失败模式「AI 模板赛博脸」 | 12 栋全部绑定真实站内路由与座舱领域职能，无装饰性空楼 |

---

## 8. 开放问题（下一 Task 处理）

1. 智驾案例专页与 Master Agent Lab 上线后，更新 `autodrive-lab` / `agent-nexus` 的 `deepLink` 与 `deepLinkStatus`（各改两个字段）。
2. JSON Schema 校验文件（`cyber-city-buildings.schema.json`）+ CI 断言（槽位 ≤20、道路侵入检测、色标锁定），待工程 Task 落地。
3. 移动端 2D 迷你地图分流（提案 §5.3）复用同一 JSON 的 `position/neonColor/category`，交互稿另出。
4. 泊车触发的 View Transition 与 `/lab/*` facade 拦截链对接细节，归 Phase 1 世界壳 Task。

*本文 v0.1；代码零改动，JSON 草案见 `src/data/cyber-city-buildings.json`。*
