# 赛博科技城实施方案：`/` 全屏科技城从首幕炫技到进楼展示（CC-IMPL1）

> **一句话定位**：D1–D6 已拍板——`/` 就是全屏赛博座舱科技城。本文回答「怎么施工」：目标态用户旅程怎么走、四个 Phase 各交付什么、`hero-cyber-city` 设想与 `src/lab/world/` 引擎腿怎么合成一套代码、路由与门禁怎么原子切换、高端不降级的性能预算怎么定、下一轮 ≥8 个工程 Task 怎么并行开工、每个风险在哪里止损。

## 0. 文档信息

| 项 | 值 |
|---|---|
| 版本 | v1.0（实施方案，Gate G3 后的工程蓝图） |
| 日期 | 2026-08-25 |
| 作者 | Fable5（云端子代理，`claude-fable-5-thinking-xhigh`） |
| 决策基线 | `cyber-city-hero-design-proposal.md` §6（**D1–D6 王磊已拍板** + 大楼 10–20 可扩展硬需求） |
| 上游输入 | `folio-gap-and-reuse-report.md`（复用总账与待搬清单）、`full-entry-world-proposal-tech.md`（W1 路由架构 / 门禁改造 / 合体映射）、`full-entry-world-proposal-roadmap.md`（Gate 制交付先例）、`world-spike-log.md`（Spike 判「通过」+ 四模块合流约定） |
| 代码基线 | 引擎腿 `src/lab/world/`（22 文件 3,211 行 TS，folio 架构）＋ 驾驶腿 `src/lab/modules/world/`（8 文件 1,441 行 TS，可驾驶闭环）＋ `src/lab/facade.ts`（251 行懒挂载底座）＋ `src/lab/manifest.json`（world 未注册，Phase 0 补） |
| 冲突声明 | 本文执行 D1/D5/D6，与现行 SRD §12.7.1（`/world/` 独立壳）、PRD 赛博禁令、Lighthouse 首页四项 ≥95 存在**已裁决的有意冲突**；规格修订清单见 §9，修订合并前施工在隐藏路径进行，不违反现行 CI |

### 0.1 执行摘要（六句话）

1. **一套引擎、一个世界、一个入口**：不新建 `hero-cyber-city` 独立模块（Premortem P9 双引擎分裂），赛博城作为**内容层** `src/lab/world/city/` 长在 folio 架构引擎腿上；spike 驾驶腿按既定约定并入后退役；facade 唯一入口 `src/lab/modules/world/index.ts` 保留。
2. **首幕即三拍**：Phase 0 交付「城市夜景亮起 → 机器人英雄 → 变形落十字路口 → WASD 可开」完整闭环（D4），不是静态海报——变形充能环兼作车资产加载进度，两阶段加载让机器人 ≤3s 可见、变形时车已就绪。
3. **楼即导航**：大楼地图单源 `src/data/cyber-city-buildings.json`（20 槽位 schema），Phase 0 可见 ≥10 栋地标，Phase 1 点亮 12 栋 POI 楼（触发圈 + 招牌 + 深链），Phase 2 停车进楼直达 `/lab/*`、`/work/*` 展示页。
4. **路由原子切换**：`/` 重写为世界壳（90KB 静态壳 + 条件自动挂载），HTML 五区块整体平移 `/home/`，`/world-spike/` 归档——全部在一个 PR 内完成，切换前所有工程在隐藏路径迭代、可整体回滚。
5. **高端不降级 ≠ 无止损**：D3 指视觉品质目标不打折（Quality 0 桌面档 bloom/湿地反射/体积雾/雨全开、60fps），但 Quality 分档扩为 0/1/2 三档，移动端与低能力设备按档收敛，永远有「能开」的底。
6. **红线不动**：React/R3F/gsap/howler 永不引入，运行时依赖维持 three + rapier 两个；Lighthouse 按 D6 分层（`/` Perf ≥90 目标 / ≥80 阻断，`/home/` 与内容页四项 ≥95 不变）。

---

## 1. 目标态用户旅程（打开 → 机器人 → 变形 → 十字路口驾驶 → 驶向大楼 → 进展示页）

> 旅程 = 状态机 + 时间轴 + 埋点，三者字段在本节锁定，后续 Task 不得私改命名。

### 1.1 六幕旅程总表

| 幕 | 用户所见 | 技术状态 | 埋点事件 | Phase |
|---|---|---|---|---|
| ① 打开 | poster 天际线 + 定位语 + 「跳过 3D」（DOM 壳，0 秒可读） | 壳静态呈现；`load` 后条件自动挂载 | `world-enter` / `world-skip` | 0 |
| ② 机器人 | 城市霓虹渐亮、机器人从光柱显现、≥10 栋楼招牌 stagger 点亮、胸甲 HUD 呼吸 | `robot_idle`；两阶段加载：首批（城市程序化 + 机器人）就绪即开演，车与重资产后台并行 | `world-reveal` | 0 |
| ③ 变形 | 点「变形 · 巡航态」/ 按 Space → 充能环 → 光幕 → 车落地弹跳 | `transforming` → `car_ready`；充能环兼作车资产进度（未就绪则环多转一圈） | `world-transform` | 0 |
| ④ 十字路口驾驶 | 车落在主十字路口正中，HUD 亮出「WASD/方向键 · Shift · 空格 · R」操作提示，路口四向霓虹路牌指向四主题楼 | `driving`；Inputs filters 由 `['intro']` 切 `['driving']`；PhysicsVehicle 接管 | `world-drive-start` | 0 |
| ⑤ 驶向大楼 | 沿主街驾驶，楼顶全息招牌远距可读，接近时楼前停车区地贴发光 + POI 标点开合 | Zones 触发圈 enter → POI 提示「E / Enter 进入」 | `world-poi:<id>` | 1 |
| ⑥ 进展示页 | 停车按 E → 相机推向楼门 + 光幕收拢 → View Transition 整页进 `/lab/tts-cockpit/`、`/work/multilingual-cockpit/` 等 | 位置 + 形态序列化进 sessionStorage；展示页「返回世界」→ `/?poi=<id>` 原地恢复 | `world-exit-to:<route>` | 2 |

### 1.2 首幕 30 秒时间轴（Phase 0 验收基准，承接设计提案 §2 并按 D4 修订）

```text
T+0.0s   壳可读：定位语 / 跳过 3D / 楼宇快览侧栏（DOM，LCP=poster ≤2.5s）
T+load   条件自动挂载（§4.3 四条件）→ 首批资产（城市程序化 + 机器人 ≤1.2MB）开始拉取
T+≤3s    城市渐亮 + 机器人光柱显现（首批就绪即开演；车 3.5MB 后台并行拉取）
T+≤4s    ≥10 栋楼招牌 stagger 点亮（150ms 间隔）；四主题楼全息字可读
T+任意    用户触发变形（唯一主 CTA；30s 未操作则次 CTA「60 秒了解王磊」脉冲一次）
T+1.2s   变形完成：充能环 0.35s → 光幕 0.4s → 热交换 → 落地弹跳 0.45s
T+落地    车在十字路口，操作提示浮现 3s 后淡出（再次按键即隐）；WASD 立即可开 ★D4
T+驾驶    追尾相机接管（View focusPoint），可绕城自由行驶，R 复位回路口
```

**reduced-motion**：跳过全部动画——静态城市 + 机器人终态直接呈现；变形为 instant swap + 文字状态切换；不自动挂载（facade 既有拦截，`data-blocked="reduced-motion"`）。

### 1.3 三类访客路径（Persona 验收线）

| Persona | 路径 | 硬指标 |
|---|---|---|
| 猎头（10 秒） | 打开 → 定位语 0 秒可读 → 「跳过 3D」一击到 `/home/` 或 `/work/` | 跳过链接 = DOM 首个可聚焦元素；壳文案不被 canvas 遮挡 |
| 技术同行（3 分钟） | 打开 → 看完首幕 → 变形 → 开车绕城 → 进 1 座楼看 Demo | 加载→可变形 ≤8s @Fast 4G；变形→可开零等待 |
| 回访者 | 从内容页「返回世界」→ `?poi=` 原地恢复（形态 + 位置） | sessionStorage 恢复零闪断；深链可分享 |

---

## 2. 分阶段 Gate（阶段间是门禁关系，上一 Gate 未过不得合并下一阶段）

> 沿用 roadmap 提案的 Gate 制纪律：每阶段独立可上线、独立可止损；验收命令沿用既有脚本（`astro check` / `audit-budget.mjs` / `check-links.mjs` / `test:e2e` / LHCI）。

### 2.1 Phase 0 —— 首屏炫技 · 可变形 · 可开（本方案核心交付）

**使命**：`/` 上线六幕旅程的前四幕（打开 → 机器人 → 变形 → 十字路口 WASD 可开）。城市视觉达设计关键帧水准（D3 不降级），驾驶手感达 folio 级（PhysicsVehicle 动力学）。

**交付物**：

1. 两腿合体转正：PhysicsVehicle 上车 + spike 四模块并入 + `?impl=` 退役（§3.3 施工顺序 ①–②）；
2. 赛博城内容层：`cyber-city-buildings.json`（20 槽 schema）+ 可见 ≥10 栋地标楼 + 天际线剪影层 + 主十字路口路网 + 湿地面 + 霓虹材质系统（§3.2 city/ 目录）;
3. 机器人英雄：hero-robot GLB（≤800KB，D2 资产决议产出）+ idle 动画 + 光柱显现；
4. TransformSystem 遮蔽式变形（充能环 / 光幕 / 热交换 / 落地弹跳，1.0–1.2s）+ `robot_idle → transforming → car_ready → driving` 状态机；
5. 路由原子切换：`/` 世界壳 + `/home/` 平移 + `/world-spike/` 归档 + CI 门禁改造（§4）；
6. 真机帧率录测（Spike 遗留条件项）：桌面 + 中端安卓读数回填 `docs/spec/human-gate-checklist.md` §2。

**Gate P0 验收**：

```bash
pnpm astro check && pnpm build
node scripts/audit-budget.mjs dist/    # G-A' 壳专项 ≤90KB；G-A/B/C 已重定向 /home/；G-D 排除表含根 index.html
node scripts/check-links.mjs dist/     # 壳内六导航 + 跳过出口零断链
pnpm test:e2e                          # 既有 42 用例零回归 + 新增世界剧本用例（§7 CC-E10）
# LHCI：/ Perf ≥90 目标（≥80 阻断）+ A11y/BP/SEO ≥95；/home/ 四项 ≥95
# 人工：首幕全流程走查（含 reduced-motion 终态 / ?gl=1 WebGL2 回退 / 变形→可开零等待）；
#      桌面 60fps + 1% low ≥45（#debug FpsMeter 读数）；关键帧对照设计稿（D3 品质线）
```

**阻断条件**：桌面达不到 60fps 常态 → 不得切路由（先调 Quality 0 档预算再验）；变形后 WASD 不可开或需二次点击 → 违反 D4 打回；壳 Lighthouse A11y/SEO 任一 <95 → 阻断（D6 只放 Perf）。

### 2.2 Phase 1 —— 12 楼 POI（楼即导航）

**使命**：城市从「布景」变「地图」——12 栋楼挂 POI（4 主题楼 + 8 扩展槽点亮），驾驶可达、招牌可读、触发圈可用，2D 地图与深链就位。

**交付物**：POI 五件套补齐（引擎腿已有 Zones/References/Respawns，补 `Area/Areas/InteractivePoints/TextCanvas` 移植）；POI 数据单源 `src/data/world-pois.json`（与 `cyber-city-buildings.json` 以楼 id 外键关联）；12 栋 POI 楼触发圈 + 楼前停车区地贴 + 键位提示；2D 等距地图 overlay（`Map.ts` 中改）；`?poi=` 深链恢复；移动端屏上「进入」按钮（InteractiveButtons）。

**Gate P1 验收**：12/12 楼触发圈进出事件走查表留档；`?poi=` 全部深链零断链（check-links 扩展）；流式资产合计 ≤12MB（G-G）；帧率零回归（POI 全亮时 1% low 不低于 Phase 0 读数的 90%）。

**阻断条件**：POI 全开后桌面帧率跌破 55fps → InteractivePoints 按 frustum 剔除修复后再验；12 楼未配齐内容映射 → 允许「reserved」态楼上线（招牌亮但 POI 灰显「建设中」），不得假链接。

### 2.3 Phase 2 —— 进楼展示（世界 → 内容动线闭环）

**使命**：第六幕落地——停车进楼直达展示页，返回世界原地恢复，「驾驶即导航」全链路可用。

**交付物**：进楼仪式（相机推进楼门 + 光幕收拢，≤0.8s）；**主路线 = View Transition 整页跳转**（URL 变化、可分享、浏览器返回自然）至 `/lab/tts-cockpit/`、`/lab/car-configurator/`、`/work/*` 案例页；备选 = SRD §12.7.1 iframe overlay（若 VT 跨页体验实测撕裂再启用）；位置 + 形态序列化（sessionStorage + `?poi=`）；内容页「返回世界」按钮全站接入；四事件埋点收口（`world-enter/transform/poi/exit-to`）。

**Gate P2 验收**：六幕旅程端到端 e2e 用例通过（进楼 → 展示页 → 返回 → 原地恢复）；Persona 2 门禁——猎头 30 秒路径相对 `/home/` 版本零劣化；30 天数据阀门开始计数（世界 → 内容转化率）。

**阻断条件**：进楼后返回丢失位置/形态 → P0 级修复；展示页 LCP 因 VT 退化 >20% → 回退 overlay 备选路线。

### 2.4 Phase 3 —— morph 精修 + 音效（体验完成度）

**使命**：变形从「遮蔽式 V1」升级为部件级 morph V2（可止损降回 V1）；音效体系接入；城市氛围完成度（昼夜 / 彩蛋可选）。

**交付物**：TransformSystem V2（骨骼/部件位移编排，机器人拆件收拢为车轮廓——仍禁 IK 求解库，纯 ticker 缓动编排）；WebAudio 音效（Audio 结构照抄 + 手写播放层 ~150 行：变形音、引擎音随速度、POI 环境音；全部可关且 reduced-motion 默认关）；DayCycles 昼夜联动（可选）；彩蛋 ≤3（可选）；世界工程复盘长文（ai-lab 旗舰文章）。

**Gate P3 验收**：Phase 0–2 全指标回归；morph V2 在 `?gl=1` 回退路径可播；音效开关全走查；同屏循环动画 ≤5；`du -sh public/` ≤40MB。

**阻断条件**：数据阀门未过（转化率 <25% 或 30 秒退出率 >50%）→ Phase 3 冻结，先修信息动线；morph V2 成本失控 → 永久停在 V1（V1 已是可交付品质，非占位）。

---

## 3. 模块目录与合体顺序（hero-cyber-city 与 lab/world 如何合一）

### 3.1 合体总裁决：不建第二引擎，城是内容层

设计提案 §9 曾预览 `src/lab/modules/hero-cyber-city/` 独立模块——那是「首屏只做第一幕」前提下的产物。**D4 拍板后前提失效**：变形后落十字路口且 WASD 可开，意味着 Phase 0 就需要物理、输入、追尾相机、车辆控制器——这些恰是引擎腿 + 驾驶腿的全部存量。另立 hero 模块 = 复刻一遍 Game 循环 = Premortem P9「双引擎分裂」原样发生。

**裁决**：`src/lab/world/` 是唯一引擎与唯一世界；赛博城以内容子目录 `city/` 落进去；设计提案 §9 的七个文件逐一映射如下——

| 设计提案 §9 设想 | 实施目标位置 | 说明 |
|---|---|---|
| `hero-cyber-city/index.ts`（mount） | `src/lab/modules/world/index.ts`（既有薄入口） | 不新建；manifest 注册走它 |
| `CyberCityScene.ts`（场景图） | `src/lab/world/world/World.ts` step 编排 + `city/` 内容件 | 场景图职责归 World，不另立编排器 |
| `CitySilhouette.ts`（远景程序化） | `src/lab/world/city/CitySilhouette.ts` | 保留原设想 |
| `ThemeTowers.ts`（主题楼） | `src/lab/world/city/ThemeTowers.ts` | 改为数据驱动（读 `cyber-city-buildings.json`，10–20 槽） |
| `HeroRobot.ts` | `src/lab/world/city/HeroRobot.ts` | GLB 经 ResourcesLoader 两阶段清单首批加载 |
| `HeroCar.ts`（CarConcept 薄封装） | `src/lab/world/world/VisualVehicle.ts` | 与 spike carRig 合并，不另建封装 |
| `TransformRitual.ts` | `src/lab/world/player/TransformSystem.ts` | 直接落正式位置，免去「未来迁入」二次搬家 |
| `NeonRain.ts` | `src/lab/world/city/NeonRain.ts` | Quality 0 专属（§5.3 分档表） |

### 3.2 目标态目录（Phase 0 完成时）

```text
src/lab/world/                      ← 唯一引擎 + 世界内容（folio 架构）
  core/      Game / Ticker / Events / Viewport / Quality(扩 0|1|2) / ResourcesLoader / Objects
  inputs/    Inputs(并入 spike 键位映射) / Keyboard / Pointer / Nipple / Wheel(新搬)
  physics/   Physics / PhysicsVehicle(新搬 ~450 行，folio 参数表原封起步)
  player/    Player(挂点接 PhysicsVehicle) / KinematicFallback(spike vehicle 降级遗产)
             / TransformSystem(新写 ~250 行，遮蔽式 V1)
  rendering/ Rendering / MeshGridMaterial(新搬) / PreRenderer(新搬)
             / NeonMaterials(新写：emissive 窗格 atlas + 湿地面反射 + 雾/bloom 档位)
  view/      View(吸收 spike ChaseCamera 参数)
  world/     World(step 编排) / Grid(新搬) / Reveal(Intro+Reveal 合并移植)
             / VisualVehicle(新搬轮同步段 + carRig 并入) / Zones / References / Respawns
  city/      CityBlocks(程序化楼体) / CitySilhouette(远景剪影) / ThemeTowers(数据驱动地标)
             / Roads(路网 + 主十字路口) / HeroRobot / NeonRain(可选粒子)
  utils/     maths(补函数) / ObservableSet / FpsMeter(spike 遗产摘出)
src/data/cyber-city-buildings.json        ← 楼宇单源（20 槽 schema：id/主题/坐标/体量/招牌/色标/POI 外键/lod/槽位状态）
src/data/world-pois.json            ← POI 单源（Phase 1）
src/lab/modules/world/index.ts      ← mount() 薄入口（唯一 facade 入口，不变）
src/pages/index.astro               ← 世界壳（重写）
src/pages/home/index.astro          ← HTML 五区块平移
public/models/hero-robot/           ← ≤800KB（D2 决议产出）
```

**退役清单**：`src/lab/modules/world/spike/` 七文件全部退役（vehicle → `player/KinematicFallback.ts`；carRig → 并入 VisualVehicle；camera → 参数换算进 View 配置；inputs → 键位表并入 Inputs actions；scene 锥桶段 → World 动态体清单（试验彩蛋区可留）；engine → Game 即其正式版；params → 车辆参数留档 `world-spike-log.md`、锥桶参数随锥桶走）；`/world-spike/` 壳页 + `?impl=` 分叉归档。

### 3.3 合体施工顺序（六步，每步独立可验证、独立可止损）

| 步 | 内容 | 验证场 | 止损 |
|---|---|---|---|
| ① 上车 | PhysicsVehicle + VisualVehicle（carRig 并入）落地，Player 挂点接通 | `/world-spike/?impl=engine` 原地验证手感（对照 spike 运动学档 A/B） | 时间盒 3 会话未达标 → KinematicFallback 顶上（同 `PlayerVehicle` 接口），动力学转后台调参 |
| ② 合流 | spike inputs/camera/scene 并入，`?impl=` 退役，单实现 | `/world-spike/` 全量回归（整圈/锥桶/复位/摇杆四行为） | 任一 Spike 已验证行为回归 → 不得合并 |
| ③ 城市 | city-map schema + CityBlocks/Silhouette/Roads/ThemeTowers + NeonMaterials + Grid/MeshGridMaterial/PreRenderer | `/world-spike/`（隐藏路径）走查关键帧对照 | 程序化楼体颜值不达 D3 → 主题楼改 GLB 高模（预算 §5.2 留了口），环境楼维持程序化 |
| ④ 英雄 | HeroRobot 接入 + TransformSystem V1 + Reveal 首幕剧本（两阶段加载编排） | 隐藏路径首幕全流程 + reduced-motion 终态 | 机器人资产延期（D2 依赖）→ 程序化块面机甲占位（盒体 + emissive 胸甲，接口不变）先行联调 |
| ⑤ 壳与门禁 | `/` 壳重写 + `/home/` 平移 + CI 三件改造（§4.4）在分支上全绿 | 分支 CI 全量 + LHCI 双口径断言 | Perf <80 → 壳挂载策略常量 `AUTO_MOUNT=false` 切显式进入，路由架构不回滚 |
| ⑥ 切换 | 路由原子 PR（唯一动用户可见面的一步） | 生产冒烟 + Search Console 基线记录 | 整 PR 回滚（内页零改动，回滚只涉两页面文件 + CI 配置） |

①–④ 全部在 `/world-spike/` 隐藏路径迭代，现网 `/` 始终是完好的宪法首页——最坏情况 = 全部工作留在隐藏路径演进，用户可见面零损伤。

---

## 4. 路由：`/` 世界壳 · 五区块迁 `/home/` · `/world-spike/` 归档

### 4.1 目标态路由总表（承接 tech 提案 W1，D1 已拍板）

| 路由 | 内容 | SEO 口径 |
|---|---|---|
| `/` | 世界壳 + 条件自动挂载科技城。壳含：H1 定位语、三支柱硬数字、六导航 `<a>`、「跳过 3D」（DOM 首个可聚焦元素）、poster（LCP 元素）、noscript 全导航 | canonical 自指；`WebSite` + `Person` JSON-LD 留在 `/`；index,follow |
| `/home/` | 现宪法首页五区块（Hero/三支柱/Lab Bento/案例/近况）**整体平移**，`LabCardWorldSpike` 卡片改指 `/`（或退役） | index,follow；与 `/` 职责分离（体验入口 vs 内容总览），进 sitemap |
| `/work/` `/insights/` `/lab/` `/about/` 等内页 | 完全不动（C-5 约束） | 不变 |
| `/world-spike/` | **归档**：合体完成即改 ≤1KB 静态占位页（说明 + 链接 `/`，canonical 指 `/`），一个版本周期后删路由 | noindex；sitemap 剔除 |
| `/world/` | **不建**。世界只有一个入口 `/`，避免双路由双份考核 | — |

**站内链接调整**：全站页头 logo/「首页」→ `/`；页脚补「站点总览」→ `/home/`；内容页「返回世界」→ `/?poi=<id>`；`homepage-redesign-spec` 首页规格的考核对象改述为 `/home/`。

### 4.2 `/` 壳页结构（重写 `src/pages/index.astro`）

- **静态壳即加载屏即速览页**：poster（压缩天际线关键帧 ≤40KB webp）+ 定位语 + 三支柱 + 六导航 + 楼宇快览侧栏（DOM 版四主题楼列表，爬虫可读、挂载前可点）；
- **引导脚本 ≤15KB gzip**：只做条件判定与动态 import 触发，复用 facade 拦截链（reduced-motion / Save-Data / 视口 / 后端探测）——world 分包与资产在 HTML 中零 `<script src>`/`<link preload>`（保 G-C' 与 LCP 干净）；
- **HUD 全 DOM**：状态机驱动 `data-world-state` 属性，CSS 切换 CTA/操作提示/POI 面板；canvas 带 `aria-label` + 键位说明常驻。

### 4.3 挂载策略（「进去就是」与门禁的平衡，tech 提案 §1.3 原样执行）

```text
window.load 后（关键路径已清空）满足全部四条件才自动挂载：
  ① 非 prefers-reduced-motion   ② 非 Save-Data
  ③ 视口宽 ≥768px 或用户已显式点过「进入」   ④ WebGPU 或 WebGL2 可用
任一不满足 → 壳静态呈现（poster + 显式「进入科技城」按钮 + 完整 HTML 内容）
挂载后 → Reveal 首幕剧本接管（§1.2 时间轴）
```

### 4.4 CI 门禁改造清单（与路由切换同 PR 原子完成）

| 门禁 | 改造 |
|---|---|
| `lighthouserc.json` | assertMatrix 双断言组：`/website/`（Perf ≥90 目标 / 80 阻断 + 三项 ≥95）；新增 `/website/home/`（继承原首页四项 ≥95） |
| `audit-budget.mjs` G-A/B/C | 考核对象重定向 `dist/home/index.html`；`/` 增设壳专项 G-A'（HTML+CSS ≤35KB / 引导 JS ≤15KB / poster ≤40KB） |
| G-D 零 world 字节 | 排除表加根 `index.html` 一行；`/home/` 与全部内容页继续受保护 |
| G-G 模块预算 | world 以 `budgetClass:'world'` 注册进 `src/lab/manifest.json`（JS ≤900KB / 资产 ≤12MB 上限脚本已就位），chunk 按 slug 命名 |
| 新增 e2e 冒烟 | `/` 打开后、自动挂载触发前，断言零 `_astro/world*`/`models/`/`hdri/` 网络请求 |
| `check-links.mjs` | 壳六导航 + `/home/` 全链接 + `?poi=` 深链（Phase 1 起）纳入扫描 |

---

## 5. 性能预算表（D3 高端目标 + Quality 分档止损）

### 5.1 口径声明

**D3「不降级」的边界**：不降级指**视觉品质目标**——Quality 0（桌面档）按设计关键帧交付 bloom、湿地面反射、体积雾、霓虹雨、全楼 emissive 窗格，不以「剪影占位」冒充；它不豁免性能预算，桌面 60fps 是 Gate P0 阻断项。移动端与低能力设备按 Quality 分档收敛视觉（§5.3），这是止损不是降级——每一档都是完成品，不是残次品。

### 5.2 预算总表（采纳后写进 SRD §12.7.2 修订版与 `audit-budget.mjs`）

| 预算项 | 上限 | 考核 |
|---|---|---|
| `/` 壳静态传输（挂载前，不含字体） | ≤90KB gzip（HTML+CSS ≤35 / 引导 JS ≤15 / poster ≤40） | G-A' |
| 世界首屏可玩 JS | ≤500KB gzip | G-G |
| 世界 JS 全量（含按需 chunk） | ≤900KB gzip | G-G |
| **首批资产**（首幕开演所需：城市程序化 + 窗格 atlas + 机器人） | ≤1.3MB（atlas ≤300KB + robot ≤800KB + 杂项 ≤200KB） | 资产台账 + e2e 计时 |
| **首包合计**（首幕 + 车 + HDRI，变形前全部就位） | ≤5MB（现测算：robot 0.8 + car-concept 3.5 + HDRI 0.35 + 程序化其余 ≈4.75MB，余量 0.25MB——**主题楼若改 GLB 高模，须先给车模减重或申请调包**） | G-G + 台账 |
| 分区流式合计（Phase 1 起：12–20 楼扩展、POI 图标、装饰件） | ≤12MB | G-G |
| poster 可见（LCP） | ≤2.5s | LHCI |
| 机器人可见 | ≤3s @Fast 4G（首批 1.3MB 就绪即开演） | e2e 计时断言 |
| 加载 → 可变形 | ≤8s @Fast 4G（车 3.5MB 后台并行；变形充能环兜底吸收尾差） | e2e 计时断言 |
| 变形 → 可开 | 0 等待（D4；变形动画 1.0–1.2s 本身即缓冲） | e2e 断言 |
| 帧率（Quality 0 桌面） | 60fps 常态，1% low ≥45 | FpsMeter `#debug` + 真机录测 |
| 帧率（Quality 1 移动） | ≥30fps；连续 2s 低于 → 自动降 Quality 2 + toast | 同上 |
| `/home/` 首屏 | <200KB gzip（常态 ≤120KB）+ 四项 ≥95 | G-A/B/C/D 平移 + LHCI |
| 内容页 world 增量 | 0 字节 | G-D |
| `public/` 总量 | ≤40MB | G-E |
| 同屏循环动画 | ≤5（机器人 idle / 招牌闪烁 / 雨 / 光轨合并计数） | 人工走查 |

### 5.3 Quality 三档表（`core/Quality.ts` 由 0|1 扩为 0|1|2）

| 项 | Quality 0（桌面高端，D3 全效） | Quality 1（移动 / 中端） | Quality 2（止损档，自动触发） |
|---|---|---|---|
| DPR 封顶 | 2.0 | 1.5 | 1.0 |
| bloom | 开（档位表按 CC-T2 视觉规范） | 弱档 | 关 |
| 湿地面反射 | 实时反射探针 | 假反射（emissive 贴图翻转） | 关（哑光地面） |
| 体积雾 | 开 | 简化（距离雾） | 距离雾 |
| 霓虹雨 / 光轨粒子 | 开（≤800 点） | 关 | 关 |
| 天际线剪影层楼数 | 全量（≤20 程序化） | 减半 | 静态天空盒纹理 |
| 窗格 emissive 动画 | 逐楼随机闪烁 | 全局统一相位 | 静态 |
| 阴影 | 开 | 关 | 关 |
| 触发条件 | 桌面默认 | UA 移动默认 / 手动 | 连续 2s <30fps 自动降 + toast |

**移动端止损链**：触屏窄屏默认不自动挂载（§4.3 条件③）→ 显式进入得 Quality 1 → 实测 <30fps 持续 2s 自动降 Quality 2 → 仍不达标记入设备黑名单参数，该设备下次访问默认静态壳。「世界永远能开」的底线由 KinematicFallback（Rapier wasm 失败/超时 >10s 顶上）+ Quality 2 共同保证。

---

## 6. 依赖红线（禁 React / R3F / gsap / howler）

| 依赖 | 裁决 | 替代（全部有站内先例） |
|---|---|---|
| React / react-three-fiber / drei | ❌ 永不引入 | 全站 Astro 零框架；引擎腿即 vanilla three + 自写 Events/Ticker，R3F 是「第二套架构」 |
| gsap | ❌ 永不引入 | `Ticker.delay()` + 手写缓动（Ticker/Nipple 先例）；TransformSystem/Reveal 的补间用 `remapClamp` + back/cubic/expo 缓动表（~30 行） |
| howler | ❌ 永不引入 | Phase 3 手写 WebAudio（`AudioBufferSourceNode` + `GainNode` ~150 行；超 150 行再评审引库） |
| Lenis / 滚动库 | ❌ 用不上 | `/` 是全屏 canvas 无滚动；`/home/` 与内容页原生滚动纪律不变 |
| msgpack-lite / uuid / tweakpane | ❌ 随 Server/Debug 永不做 | 调试 = URL 参数 + `#debug` 全局句柄（spike 先例） |
| 后处理库（postprocessing 等） | ❌ 默认不引 | bloom 走 three/webgpu 自带 TSL bloom 节点；不足以达 D3 时先手写 pass，引库须专项评审 |
| three | ✅ 保留 ^0.185.1 | TSL 件移植对照迁移指南逐版核对（风险 R3） |
| @dimforge/rapier3d | ✅ 保留，锁 0.20.x | PhysicsVehicle 参数表的语义基准 |

**资产红线同列**：零 Transformers 可识别商标元素（D2 纪律）；搬运资产逐笔登记台账（源/许可/体积/入库路径）；BGM 与来源存疑音效禁入（CC0 兜底）；机器人资产许可须为 CC0/MIT/自制三路线之一（D2 Task 决议为准）。

---

## 7. Fable5 下一轮工程 Task 拆分（≥8 个可并行施工 Task）

> 每 Task 自带文件域（写冲突隔离的依据）；分支模板 `cursor/cc-e<N>-<slug>-1deb`；commit 前缀含 Task ID；全部 Task 首行自报 model slug。文件域重叠的 Task 不得同波并行。

| ID | 标题 | 文件域 | 依赖 | 验收要点 |
|---|---|---|---|---|
| **CC-E1** | PhysicsVehicle 上车 + VisualVehicle 合体 | `src/lab/world/physics/PhysicsVehicle.ts`（新）、`world/VisualVehicle.ts`（新，并入 spike carRig）、`player/Player.ts`（挂点）、`player/KinematicFallback.ts`（spike vehicle 迁入） | 无（首波） | `/world-spike/?impl=engine` 可开、轮转、翻车自救；folio 参数表原封起步；A/B 对照运动学档留档 |
| **CC-E2** | spike 合流退役（单实现） | `src/lab/world/inputs/Inputs.ts`、`view/View.ts`、`world/World.ts`、`utils/FpsMeter.ts`（新）、`src/lab/modules/world/index.ts`、删除 `spike/` 七文件、`src/pages/world-spike/index.astro`（去 `?impl=`） | CC-E1 | 整圈/锥桶/复位/摇杆四行为零回归；spike 参数留档 `world-spike-log.md` |
| **CC-E3** | 城市地图 schema + 程序化城区 | `src/data/cyber-city-buildings.json`（新，20 槽 schema）、`src/lab/world/city/CityBlocks.ts`、`city/CitySilhouette.ts`、`city/Roads.ts`（主十字路口）、`city/ThemeTowers.ts` | 无（首波，可与 CC-E1 并行） | ≥10 栋可见地标 + 4 主题楼数据驱动；十字路口路网碰撞体（Objects 命名约定）；schema 文档注释齐全 |
| **CC-E4** | 霓虹视觉系统（D3 品质线） | `src/lab/world/rendering/NeonMaterials.ts`（新）、`rendering/MeshGridMaterial.ts`（搬）、`rendering/PreRenderer.ts`（搬）、`world/Grid.ts`（搬）、`core/Quality.ts`（扩 0/1/2 三档） | CC-E3（材质挂到楼体） | 窗格 atlas ≤300KB；关键帧对照 CC-T2 情绪板；三档切换实测截图；TSL 对照 three 0.185 迁移核对记录 |
| **CC-E5** | 机器人英雄接入 | `public/models/hero-robot/`（新）、`src/lab/world/city/HeroRobot.ts`（新）、`core/ResourcesLoader` 两阶段清单 | D2 资产决议（阻塞时用程序化占位机甲先行，接口不变） | ≤800KB Draco GLB；idle ≤2 循环动画；光柱显现；台账登记许可 |
| **CC-E6** | TransformSystem + Reveal 首幕剧本 | `src/lab/world/player/TransformSystem.ts`（新）、`world/Reveal.ts`（新，Intro+Reveal 合并移植）、`inputs/Inputs.ts`（filters `intro/driving` 切换段） | CC-E1 + CC-E5（占位可先行） | 状态机四态齐全；变形 1.0–1.2s；变形→WASD 零等待（D4）；充能环兼车资产进度；reduced-motion instant swap |
| **CC-E7** | `/` 世界壳 + `/home/` 平移 + 路由原子切换 | `src/pages/index.astro`（重写）、`src/pages/home/index.astro`（新）、`src/components/home/*`（引用路径调整）、`src/pages/world-spike/index.astro`（归档占位）、站内链接与 sitemap | CC-E1–E6 全部（终波） | 壳 ≤90KB；跳过链接首焦点；noscript 六导航；`/home/` 像素级平移零回归 |
| **CC-E8** | CI 门禁改造 | `scripts/audit-budget.mjs`、`lighthouserc.json`、`src/lab/manifest.json`（world 注册）、`.github/workflows/ci.yml`（如需） | 可与 CC-E7 同波（同 PR 合并） | §4.4 六项全落地；分支 CI 全绿后才许 CC-E7 切换 |
| **CC-E9** | POI 十二楼（Phase 1 先遣） | `src/lab/world/areas/Area.ts`/`Areas.ts`/`InteractivePoints.ts`/`TextCanvas.ts`（搬）、`src/data/world-pois.json`（新）、`inputs/RayCursor.ts`（搬） | CC-E3（楼数据）+ CC-E2（Zones 在引擎内已就位） | 12 楼触发圈 + 键位提示 + `?poi=` 深链；POI 数据零硬编码 |
| **CC-E10** | e2e 世界剧本 + 走查表 | `tests/e2e/`（新增用例）、`docs/spec/human-gate-checklist.md`（§2 追加世界走查表） | CC-E6（剧本可测后） | 壳零 world 字节冒烟、变形→可开计时、reduced-motion 终态、`?gl=1` 回退、跳过出口——全自动化；真机录测表就位 |

**波次编排**（文件域互斥即可并行）：

```text
波 1（并行 ×4）：CC-E1（车） ∥ CC-E3（城） ∥ CC-E5（机器人，占位先行） ∥ CC-E10（用例骨架先写，红灯态）
波 2（并行 ×3）：CC-E2（合流，接 E1） ∥ CC-E4（霓虹，接 E3） ∥ CC-E6（变形+首幕，接 E1/E5）
波 3（并行 ×2）：CC-E8（门禁） ∥ CC-E9（POI 先遣，接 E2/E3）
波 4（原子）  ：CC-E7（路由切换 PR，含 E8 产物，唯一动用户可见面）
```

---

## 8. 风险与止损

| # | 风险 | 概率×影响 | 先行缓解 | 止损（可执行、可回滚） |
|---|---|---|---|---|
| R1 | **桌面 60fps 不达标**（D3 全效档：反射 + bloom + 雾 + 20 楼 emissive 同帧） | 中×高 | CC-E4 每加一效果录一次 FpsMeter 基线；剪影层 InstancedMesh；窗格动画走 TSL uniform 不走逐楼 material | 效果优先级砍序（雨→光轨→实时反射→雾），砍到 60fps 为止；反射降假反射不算违反 D3（品质关键帧仍达标即可）；仍不达 → Gate P0 阻断不切路由 |
| R2 | **首包超 5MB**（主题楼改 GLB 高模 / 机器人超 800KB） | 中×中 | 预算余量仅 0.25MB，CC-E3/E5 逐笔登记台账；主题楼默认程序化 + atlas | 车模 KTX2 再压缩（现 3.5MB 有 ~15% 余地）；机器人减面；仍超 → 首包上限专项申请调至 6MB（须重验 8s 线） |
| R3 | **PhysicsVehicle 手感失真**（three 0.185 vs folio 0.183 TSL 漂移；rapier ^0.20 语义差；`Object3D.copy` 补丁未搬） | 中×中 | 参数表原封起步；folio 车模（36KB，不入库）A/B 对照；rapier 锁 0.20.x；克隆异常首查 copy 语义 | 时间盒 3 会话 → KinematicFallback 主路径上线（同接口热切），动力学转后台调参，不阻塞 Phase 0 其余交付 |
| R4 | **机器人资产不可用**（D2 决议延期 / 许可瑕疵 / 恐怖谷） | 中×高 | CC-E5 设计为「占位可先行」：程序化块面机甲同接口联调；D2 Task 三路线（CC0/自制/采购）并行推进 | 占位机甲直接上 Phase 0（块面 + 胸甲 HUD emissive 有完成度下限），高模资产 Phase 1 热替换；许可存疑一票否决换路线 |
| R5 | **`/` Lighthouse Perf 跌破 80 阻断线**（wasm 编译 + 分包解析压 TBT） | 中×高 | 挂载压 `load` 后；PreRenderer 预热在挂载段内；LCP=poster 与 CLS 保满分口径 | 一键开关 `AUTO_MOUNT=false` 切显式进入（壳恢复四项 ≥95），产品口径退半步「首页一键进入科技城」，路由架构不回滚 |
| R6 | **首页 SEO 受损**（内容变薄 + 权重分流 `/home/`） | 中×高 | 壳保留完整定位文案 + JSON-LD；`/home/` 即时进 sitemap；切换日记录 Search Console 基线 | 连续两月核心词曝光降 >30% → `/` 与 `/home/` 内容互换回滚（世界退 `/world/` 独立路由）；内页零改动使回滚只涉两页面 + CI 配置 |
| R7 | **移动端体验塌方**（Quality 1 仍 <30fps / 触屏变形误触） | 高×中 | 触屏窄屏默认不自动挂载；DPR 1.5 封顶；Quality 2 自动降档链（§5.3） | 降档后仍不达标 → 设备黑名单参数，下次访问默认静态壳；移动端驾驶不承诺（Phase 1 分流 2D 地图导航） |
| R8 | **变形穿帮**（光幕遮不住热交换 / 落点与十字路口碰撞体冲突） | 低×中 | 同一 transform 锚点 + 同一阴影投射体；落点物理预检（respawn 点即路口中心，半径 3m 动态体清场） | 光幕时长 +0.2s 容错；落点冲突 → 落地前 kinematic 三帧再切动力学 |
| R9 | **工期黑洞 / 范围膨胀**（20 楼全高模、开放世界化） | 中×高 | 楼数硬上限 20 槽写进 schema；Phase 0 只验 ≥10 可见 + 4 主题；装饰件全家桶默认不搬（gap 报告既定） | 每波次结束对照 Gate 交付物砍溢出项；「reserved」槽位态让扩楼永远是数据行为而非代码行为 |
| R10 | **数据阀门不过**（世界→内容转化率 <25% / 30 秒退出率 >50%） | 中×高 | 四事件埋点 Phase 0 就位（不是 Phase 2 才补）；跳过出口全程一击可达 | Phase 3 冻结先修动线（既定条款）；持续恶化 → R6 路线降 `/world/` 独立路由，`/home/` 回 `/` |

**总止损原则**（与 tech 提案一致）：波 4 路由切换是唯一动用户可见面的原子 PR；此前任何风险触发时现网 `/` 始终完好；任何降级路径都收敛到「完成品的更小集合」，不产生半成品可见面。

---

## 9. 规格修订清单（本文不执行，随 Phase 0 首个 PR 提交）

1. **PRD**：赛博朋克禁令改为白名单「智能座舱科技城」（D5）；LAB-16/17/18 与 HOME-07/08/10 按 `/` 世界化改述；新增六幕旅程验收条目；
2. **SRD §12.7.1**：路由方案修订为「`/` 入口壳 + 条件自动挂载」，`/home/` 入路由表，`/world/` 条目删除；
3. **SRD §12.7.2**：预算表按本文 §5.2 替换（含 G-A' 壳专项与首批/首包双资产口径）；Quality 三档语义入档；
4. **`docs/spec/mvp-gate-signoff.md` / `human-gate-checklist.md`**：追加世界走查表与真机录测回填位（CC-E10 文件域）；
5. **`homepage-redesign-spec.md`**：考核对象改述 `/home/`；
6. **`world-spike-log.md`**：追记合体决策、spike 参数留档、`?impl=` 退役记录。

---

## 10. 附：与既有提案的关系（读者定位）

- 本文是 `cyber-city-hero-design-proposal.md`（设计什么）与 `full-entry-world-proposal-tech.md`（技术上怎么切换）的**工程合订执行版**：设计提案的 §9 挂载点被 §3.1 映射表取代（hero 模块不建）；tech 提案的 W1 路由、门禁改造、合体映射全部继承并落进 Task 文件域；
- `folio-gap-and-reuse-report.md` §8.2 待搬清单仍是逐文件施工依据（本文 §3.2 目录中标「搬」的文件均出自该表，改写量与行数口径以它为准）；
- `full-entry-world-proposal-roadmap.md` 的 B'/B/C 三 Gate 被本文 Phase 0–3 四 Gate 取代（差异：B' 的「灰盒升级」目标升格为「赛博城 + 变形 + 十字路口」，POI 从 6 分区改 12 楼，morph 从 Phase C 提前到 Phase 0 以 V1 形态交付、Phase 3 只做精修）；冲突时以本文为准，规格修订后以 SRD/PRD 为准。

*CC-IMPL1 · v1.0 — 施工从波 1 三个并行 Task 开始，代码零改动截至本文提交。*
