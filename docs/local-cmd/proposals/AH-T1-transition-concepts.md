# AH-T1 · 城市→About 展厅 转场创意与「第一栋楼」布局分析提案

- **角色**：About Hall 多面 worker（Gemini 3.8 Flash）
- **日期**：2026-09-03
- **定位**：只读调研与决策提案（供董事会 Grok 4.6 撰写 ADR-4）
- **唯一落盘**：`docs/local-cmd/proposals/AH-T1-transition-concepts.md`

---

## 磊哥指令解析
> 「合流到我们主页赛博朋克的赛车，然后确保进入第一栋楼就是现在的 about，中间的转场、页面跳转或者什么动画你自己思考创新添加，确保连贯性。」

**核心诉求分解**：
1. **第一目标定谳**：从首页科技城（`/`）变形出发后，用户探索或进入的第一栋楼必须是已具备展厅能力的「个人档案馆」（`about-pavilion`，目前 12 楼中唯一具备 `hallPath: "/world/about-pavilion/"` 的建筑，见 `src/data/cyber-city-buildings.json` L202）。
2. **转场与跳转连贯性**：消除从 3D 城市 WebGL/WebGPU 驾驶到 2D/2.5D 展厅 HTML 之间的割裂感，结合现有泊车 showcase 定帧、驾驶卡快照、光缆桥首屏，形成丝滑电影级转场与无缝回城动线。

---

## A. 「第一栋楼 = About」布局分析

### 1. 12 栋楼空间拓扑与距离表

根据 `src/data/cyber-city-buildings.json`：
- **坐标系**：Three.js 右手系（+X=东，+Z=南，+Y=上；地面 y=0，L8）。
- **朝向约定**：0°=北（-Z 方向），顺时针递增（90°=东/+X，180°=南/+Z，270°=西/-X，L9；换算见 `src/lab/world/city/CityMap.ts` L141–147）。
- **出生点**：十字路口正中 `(0, 0)`，`heading: 0`（车头朝北，即朝向 -Z 方向，L11–15）。

从出生点 `(0, 0)` 出发，计算全量 12 栋楼的欧氏距离 $d = \sqrt{x^2 + z^2}$ 与相对车头（正北 0°）的方位角 $\theta = \text{atan2}(x, -z)$：

| 楼宇 ID (`id`) | 楼名 | 中心坐标 $(x, z)$ | 欧氏距离 | 方位角 (0°=北) | 相对车头方位 | 等级/流式 (JSON 行号) |
|---|---|---|---|---|---|---|
| `agent-nexus` | 主智能体中枢 | (-52, -52) | **73.54m** | 315.0° (-45°) | **左前方 (西北)** | P0 / hero / spawnHd (L110–125) |
| `autodrive-lab` | 智驾实验楼 | (52, -52) | **73.54m** | 45.0° (+45°) | **右前方 (东北)** | P0 / hero / spawnHd (L126–142) |
| `lingua-tower` | 多语种方案塔 | (-52, 52) | **73.54m** | 225.0° (-135°) | 左后方 (西南) | P0 / hero / spawnHd (L77–92) |
| `voice-pod` | 座舱语音舱 | (52, 52) | **73.54m** | 135.0° (+135°) | 右后方 (东南) | P0 / hero / spawnHd (L93–109) |
| `now-signal` | 当前状态塔 | (-44, -150) | 156.32m | 343.66° (-16.3°) | **正前方微偏左 (沿中轴大道)** | P2 / standard (L257–272) |
| `workflow-foundry` | AI工作流工厂 | (48, -150) | 157.49m | 17.74° (+17.7°) | **正前方微偏右 (沿中轴大道)** | P2 / standard (L241–256) |
| `concept-garage` | 概念车库 | (140, -44) | 146.75m | 72.56° (+72.6°) | 右前方 (沿霓虹大街) | P0 / hero / spawnHd (L143–159) |
| `edge-cloud-hub` | 端云算力枢纽 | (-140, -44) | 146.75m | 287.44° (-72.6°) | 左前方 (沿霓虹大街) | P1 / standard (L225–240) |
| `work-gallery` | 交付案例馆 | (140, 44) | 146.75m | 107.44° (+107.4°) | 右后方 (沿霓虹大街) | P1 / standard (L160–175) |
| `contact-beacon` | 联络信标塔 | (-140, 44) | 146.75m | 252.56° (-107.4°) | 左后方 (沿霓虹大街) | P1 / standard (L209–224) |
| `about-pavilion` | **个人档案馆** | **(-44, 150)** | **156.32m** | **196.34° (+196.3°)** | **正后方微偏左 (正南方向)** | **P1 / standard / hallPath (L192–208)** |
| `insights-archive` | 洞察档案塔 | (44, 150) | 156.32m | 163.66° (+163.7°) | 正后方微偏右 (正南方向) | P1 / standard (L176–191) |

**现状事实归纳**：
1. **最近且在前方视野的楼**：内环的 `agent-nexus`（西北 45°）与 `autodrive-lab`（东北 45°），距离仅 73.54m；
2. **正前方中轴延伸线上的楼**：`now-signal` 与 `workflow-foundry`，沿大道向北距离约 156m；
3. **`about-pavilion` 的实际位置**：坐标 `(-44, 150)`，**恰好位于车头正后方（正南偏西 16.3°，距离 156.32m）**！若玩家直行驾驶，会彻底背离 About 展厅！

---

### 2. 方案对比与推荐

#### 方案 (a)：交换 `about-pavilion` 与正前方建筑位置
- **做法**：在 `src/data/cyber-city-buildings.json` 中交换 `about-pavilion` 与正前方最近楼（如 `agent-nexus`）的 `position` 与 `parkingBay`。
- **代价与受损清单**：
  1. **破坏主视口定帧契约**：`src/data/camera-shots.json` L30–58 的 `ritual_idle` 机位标注 `"posterContract": "frozen"`（L33），其 `projectionAudit`（L45）显式校验了 `agent-nexus` 在 NDC 视锥内的投影。移走 `agent-nexus` 直接导致首页 Poster 快照基线报废，破坏全站 LCP 背景！
  2. **击穿流式预算与 LOD 架构**：`agent-nexus` 是 `streaming.spawnHd`（L45）核心成员，拥有专属 Hero 体块与出生高清预算；而 `about-pavilion` 为 standard 档（L206）。交换将导致南口与北城 LOD 显存预算倒错。
  3. **街区地理语义割裂**：`about-pavilion` 属于西南 `civic` 个人区（L71–74），若强行移到西北，导致 Civic 孤悬于 AI Core 街区内部。
  4. **e2e 与机位重构**：`e2e/cyber-city.spec.ts` 与 `e2e/cyber-city-poi-arrival.spec.ts` POI 巡检基线全部需要更新。

#### 方案 (b)：不动楼位，修改玩家出生点 `spawn` 到 `about-pavilion` 门前
- **做法**：改 `cyber-city-buildings.json` L11–15 的 `spawn.position` 为 `(0, 150)` 或 `(-20, 150)`，`spawn.heading` 改为 270°（朝西正对展厅大门）。
- **代价与受损清单**：
  1. **直接摧毁变身开场机制**：`src/data/camera-shots.json` L34 中 `ritual_idle` 的锚点是 `"anchor": { "type": "spawn" }`。一旦改变 `spawn`，开屏机器人待命、变形过程全部移至南边支路，十字路口四向延展的宏大赛博地标视角荡然无存。
  2. **破坏核心架构宪法**：违背 `CityMap.ts` L29–44 与 SRD §12.7.5「出生点 = 十字路口正中 (0,0)、车头朝北」的锁定条款。

#### 方案 (c)：不动几何布局，引入「主线任务置首 + 地面光轨引导 + 出生提示」
- **做法**：
  1. **调整任务链首站**：修改 `src/data/world-pois.json` L20–24 的 `quest.chain`，将 `about-pavilion` 提至第一站（原为 `["concept-garage", "voice-pod", "agent-nexus", "work-gallery", "about-pavilion"]`，L23 改为 `["about-pavilion", ...]`）。`Areas.ts` L238–255 的 `QuestLine` 系统原生支持，自动在 HUD 标定「下一站：个人档案馆」；
  2. **地面全息导航光轨**：车辆变身后（`car_ready` 状态），在路面渲染一条从十字路口通向南侧 `about-pavilion` 的霓虹引导光带（地面半透明 emissive 材质线，或贴地箭头微动画）；
  3. **HUD 倒车/掉头微提示**：变形就绪帧（`Reveal.ts`），HUD 提示行浮现「按 S 掉头或南行，前往第一站：个人档案馆」。
- **代价**：0 几何改动，0 资产新增，0 冻结契约破坏。

#### 结论与推荐：**坚定推荐 方案 (c)**
- **核心理由**：方案 (a) 和 (b) 均会打碎 `posterContract: "frozen"` 这一已锁定基线，引发 LHCI、视觉回归测试及 e2e 的链式雪崩。方案 (c) 顺应游戏化与动线引导规律，利用既有的 `QuestLine` 机制，既能让「进入第一栋楼就是 About」以 100% 确定性落地，又能保持十字路口全景宏大感与各街区几何完整性。

---

## B. 转场创意方案（3 套方案）

### 硬约束对齐底线
1. **禁用自定义 View Transition**：`docs/research/cc-halls-brainstorm-2026-09-02/lane-tech-grok-4.6.md` L108–123 及 `ADR-2` L115 明确定谳，SwiftShader 软渲染下 named VT 是不可抗 flake 源，必须沿用全站已有的声明式 `@view-transition { navigation: auto; }`（`global.css` L301–304）；
2. **城市侧动画事件驱动**：一次性播放，随跳转卸载，严禁挤占 `CITY-03` 循环动画配额（`PoiArrival.ts` L17）；
3. **展厅首屏禁 three**：`ADR-2` G-Hall-2/4 及 `ADR-3` 决策 B（L101）硬性规定，首屏 Hero 仅允许静态 poster + pointer scrub 视频（`Hero.astro` L22–34），`Hall-R` 机甲三维模型严格延迟至 S6 视口才动态 `import()`；
4. **无障碍与降级**：`prefers-reduced-motion` 具有等效无动画直切态（`PoiArrival.ts` L118–123）；无 JS 时展厅依然完整可读（SSR 静态 HTML，`Hero.astro` poster 可见）；
5. **回城契约**：回城一律使用现有 `/?poi=about-pavilion`，`Areas.ts` L281–288 自动解析并在停车位 `parkingBay` 恢复玩家车辆，严禁发明第二种出生协议。

---

### 方案 1：【机位同构与光幕透视接力（Horizon & Portal Relay）】—— ★ 首选方案

- **一句概念**：泊车定帧将大楼门柱精确对齐至展厅光缆桥透视点，通过一次性边缘光晕脉冲无缝淡入暗夜展厅首屏。
- **城市侧做什么**：
  1. 在 `src/data/camera-shots.json` 补录缺席的 `poi_showcase-about-pavilion`：将机位架设在泊车圈外沿 `(-20, 150)` 东南侧斜后方，高位偏轴构图（`lateral: 3.8`），大楼发光门廊精确落在画面右侧 1/3，左侧留出赛博天空；
  2. 触发进站（E 键）：`PoiArrival.ts` 走 0.8s 缓动至该机位定帧（L65–70），在 0.4s hold 阶段通过 DOM 挂载一次性全屏边缘霓虹脉冲（`--hall-neon: #fef3c7`，400ms CSS 呼吸淡出，事件驱动，零 loop tick），定帧期满调用 `navigate()`（L178–184）。
- **展厅侧做什么**：
  1. 经由声明式 auto fade 进入 `/world/about-pavilion/`，全站暗底 `#05070d`（`index.astro` L83）与城市无缝衔接；
  2. `Hero.astro` 首屏构图天然对齐：左侧 1/3 为 DOM 文案（`hall-hero-copy`，L36–41），右侧 2/3 恰为人物伫立在光缆桥上的大景深（`hero-s0-poster.webp`，L23）；大楼入口几何形变直接在视觉上被替代为「迈上光缆桥」；
  3. `HallChrome.astro`（L33–43）顶部点亮金色呼吸光标，并读取 `sessionStorage['world-arrival-v1']` 中的 `maxKmh` 与 `coneHits`，在到达条微量浮现：「巡航极速 ${maxKmh} km/h · 顺利入库登桥」。
- **回城做什么**：
  - 点击「返回科技城」（`HallChrome.astro` L42）：跳转 `/?poi=about-pavilion`；
  - `Areas.ts` L281–288 将车无缝出生在 `about-pavilion.parkingBay` `(-20, 150)`，车头朝向 270° 正对大门，泊车环高亮脉冲 1 次；玩家按下 WASD，`PoiArrival.interrupt('drive')` 在 0.1s 内丝滑切回第三人称跟随。
- **技术落点与文件**：
  - `src/data/camera-shots.json`（补齐 `poi_showcase-about-pavilion` 镜头参数）；
  - `src/lab/world/areas/PoiArrival.ts`（hold 期间注入一次性微脉冲类名）；
  - `src/components/city/HallChrome.astro`（增强快照读取展示个性化驾驶卡）；
  - `src/components/city/halls/about/Hero.astro`（首屏光缆桥构图标定）。
- **预算与降级**：
  - 增量 JS 0 字节，CSS < 0.8KB；
  - `prefers-reduced-motion`：跳过 tween 与脉冲，直接切定帧并导航（`PoiArrival.ts` L118）；
  - 无 JS：静态直出，页面无缝可读。
- **风险**：弱网跳转白屏。对策：保留暗夜背景色，避免纯白瞬闪。
- **连贯性评分**：**9.5 / 10**（依靠构图互补与物理透视接力，工程零 flake，艺术连贯性极高）。

---

### 方案 2：【全息通行证档案展开（Holographic Pass Expansion）】—— ☆ 次选方案

- **一句概念**：进圈后全息 HUD 锁定车辆并飞出一张半透明档案通行证，跨页后在展厅左侧直接延展为履历与叙事面板。
- **城市侧做什么**：
  - 进圈定帧时，城市 HUD（DOM 层）以 CSS 平滑弹出一张赛博毛玻璃「个人档案通行证」浮层（挂在屏幕左侧 1/3，展示车辆涂装、`sessionId` 缩写、探索进度 `exploreN/exploreTotal`）；
  - 随后完成 `location.assign`。
- **展厅侧做什么**：
  - 展厅首屏加载，`Hero.astro` 的左侧文案卡（`hall-hero-copy`）以完全同构的毛玻璃边框与宽度就位；
  - 视觉意象：城市中签发的临时通行证在展厅被正式翻开为「王磊的职业档案馆」，左侧 DOM 文字从通行证元数据展开为定位语与六站导引；
  - 到达条直接展示通行印记。
- **回城做什么**：
  - 点击返回科技城，车位光圈呈收缩扫描态，伴随“通行凭证已释放”的一过性状态文本。
- **技术落点与文件**：
  - `src/lab/world/areas/PoiArrival.ts`（进站时挂载临时通行证浮层）；
  - `src/components/city/halls/about/Hero.astro`（左侧排版卡片样式对齐）；
  - `src/components/city/HallChrome.astro`。
- **预算与降级**：
  - 增量 CSS/DOM 约 1.5KB，无运行时开销；
  - `prefers-reduced-motion`：静态浮层无位移；移动端自适应折叠。
- **风险**：若跨页加载偶发卡顿，浮层存在视觉断档感。
- **连贯性评分**：**8.2 / 10**。

---

### 方案 3：【座舱数据链路插拔转场（Cockpit Data-Link Docking）】

- **一句概念**：泊车入位后相机瞬间推入挡风前沿 FPV 视角冲破光纤门，展厅首屏直接承接第一视角迈向光缆桥。
- **城市侧做什么**：
  - 利用已登记的 `drive_fpv` 机位（`src/data/camera-shots.json` L156–180）；
  - 圈内按 E 后，相机快速推至发动机盖前上方（`offsetLocal: (0.35, 0.55, 0)`），视线正对大楼入口光缆插槽，屏幕产生一次性径向光流线模糊（Radial Blur Overlay），随后导航。
- **展厅侧做什么**：
  - 展厅首屏利用 6s scrub 视频（`hero-s0`，`Hero.astro` L24–33），首帧正对光缆桥延伸方向，形成由座舱冲破光缆到桥面站立的视角升维。
- **回城做什么**：
  - 回城出生时相机由 FPV 视角向后平滑拉出为第三人称驾驶视角。
- **技术落点与文件**：
  - `src/data/camera-shots.json`（激活并桥接 `drive_fpv`）；
  - `src/lab/world/areas/PoiArrival.ts`；
  - `src/components/city/halls/about/Hero.astro`。
- **预算与降级**：
  - 需要调度 FPV 镜头切换，逻辑复杂度较高；
  - `prefers-reduced-motion` 下若取消径向拉伸容易产生硬切感。
- **风险**：第一视角推入在部分低刷屏上有眩晕风险。
- **连贯性评分**：**7.4 / 10**。

---

### 驾驶卡（`world-arrival-v1`）现有字段与个性化串联清单

在 `src/lab/world/arrival-snapshot.ts` L11–23 中，`ArrivalCard` 契约已包含以下事实字段：
- **必填字段**：
  - `v: 1`（快照版本）
  - `poi: string`（大楼 ID，此处恒为 `"about-pavilion"`）
  - `sessionId: string`（会话识别码）
  - `t: number`（驾驶耗时/末条事件时间戳）
  - `exploreN: number`（已探索建筑数）
  - `exploreTotal: number`（总建筑数，现为 12）
  - `wroteAt: number`（写入时间戳）
- **可选字段**（事件推导，有则录入）：
  - `maxKmh?: number`（城市漫游最高时速，L80–90 从测速事件提取）
  - `coneHits?: number`（撞击交通锥桶总数，L67）
  - `respawns?: number`（翻车/掉落重生次数，L68）
  - `poiEnters?: number`（触发圈进出次数，L69）

**展厅端个性化文案落地（`HallChrome.astro` / `Hero.astro`）**：
当检测到 `world-arrival-v1` 时，可在到达条右侧或 Hero 副标题动态生成真实个性化短句：
- 若 `coneHits > 0`：“避障巡航：规避障碍，撞落 ${coneHits} 个锥桶”；
- 若有 `maxKmh`：“疾速到达：最高巡航时速 ${Math.round(maxKmh)} km/h”；
- 默认保底：“完成探索第 ${exploreN}/${exploreTotal} 站 · 个人档案馆已解锁”。

---

## C. 给董事会的决策包（≤10 行，供 Grok 撰写 ADR-4）

```markdown
1. 【布局定谳】采纳方案(c)（任务置首+地面光轨），否决(a)换楼与(b)改spawn，严守十字路口宪法与 frozen poster契约。
2. 【主线首站】修订 world-pois.json 的 quest.chain 首站为 "about-pavilion"，开局由 Areas.QuestLine 原生标定第一目标。
3. 【转场定谳】采纳方案1（机位同构构图接力+大楼发光脉冲），次选方案2（全息档案卡展开），彻底放弃 named VT 扫描线。
4. 【镜头补齐】在 camera-shots.json 补录 poi_showcase-about-pavilion，对齐 Hero 首屏右偏轴光缆桥透视点。
5. 【驾驶卡复用】展厅 HallChrome 消费 world-arrival-v1 现有 maxKmh / coneHits / t 字段，展示个性化巡航到达印记。
6. 【首屏硬红线】恪守 ADR-2/ADR-3：Hero 首屏禁 three、禁自动播音、无 JS/移动端无降级黑屏，Hall-R 维持 S6 懒加载。
7. 【回城闭环】严格沿用 /?poi=about-pavilion 回城协议，落点 parkingBay (-20, 150)，支持驾驶键 0.1s 无缝接管。
8. 【不可逆点】buildings 几何与 spawn 坐标不可动；View Transition 禁自定义；deepLink 仍指 /about/ 纸面权威页。
```

---

## 实际核对与只读引用的文件清单
1. `src/data/cyber-city-buildings.json`（L8–15 坐标与朝向、L45 spawnHd、L76–272 12楼位置与属性）
2. `src/lab/world/city/CityMap.ts`（L16–46 道路与世界配置、L77–115 Building 契约、L141–147 朝向弧度换算、L171–218 碰撞越界轻量断言）
3. `src/lab/world/areas/Areas.ts`（L160–192 E键进站与前奏调度、L183–189 快照与跳转、L231–255 探索与任务主链、L270–293 ?poi= 深链出生定位）
4. `src/lab/world/areas/PoiArrival.ts`（L24–28 时序常量、L39–45 状态机、L99–136 showcase 机位检测与直跳降级、L178–184 结束跳转、L186–205 驾驶输入同帧中断）
5. `src/data/camera-shots.json`（L11–28 相机参数与视口、L30–58 ritual_idle 冻结快照与 NDC 审计、L60–91 已有 showcase 机位、L121–180 驾驶机位）
6. `src/data/world-pois.json`（L20–24 quest.chain 城区主链、L25–38 12 楼 POI 登记条目）
7. `src/lab/world/arrival-snapshot.ts`（L6 ARRIVAL_KEY、L11–23 ArrivalCard 字段字典、L45–72 快照组装写入、L80–90 极速提取）
8. `src/components/city/HallChrome.astro`（L14–22 楼宇数据核对与回城链接、L45–88 query 与 sessionStorage 校验解析、L91–153 样式与脉冲点）
9. `src/layouts/WorldHallLayout.astro`（L23–45 布局封装、neonColor 传递、暗底生效机制）
10. `src/pages/world/[slug].astro`（L25–35 静态路由生成、L54–71 展厅组装）
11. `src/components/city/halls/about/Hero.astro`（L8–14 媒体单源获取、L22–42 首屏左文右景结构、L44–86 桌面端指针 scrub 挂载）
12. `src/components/city/halls/ScrubVideo.ts`（L119–161 指针驱动视频 scrub 实现机制）
13. `docs/local-cmd/adr/ADR-2-hall-routing-contract.md`（L27–37 hallPath 规则、L39–60 快照规范、L84–105 G-Hall 门、L115 禁用自定义 VT）
14. `docs/local-cmd/adr/ADR-3-dual-form-and-wave-gaps.md`（L35–70 路线 C 双形态、L73–131 W3 馆长三动作与 Hall-R 懒加载、L134–175 体积预算与门禁）
15. `docs/research/cc-halls-brainstorm-2026-09-02/lane-tech-grok-4.6.md`（L108–123 SwiftShader 下自定义 View Transition 的 flake 归因与教训）
16. `e2e/cyber-city-poi-arrival.spec.ts`（L30–58 POI 进站前奏 e2e 断言规则与 route abort 机制）
