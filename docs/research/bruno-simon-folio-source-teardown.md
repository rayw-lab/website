# bruno-simon.com 源码级拆解补充报告（folio-2025 / folio-2019）

> **定位**：本文是 [bruno-simon-teardown-tech.md](./bruno-simon-teardown-tech.md) 的**源码级下钻补充**。tech.md 回答"架构长什么样"，本文回答"每个文件里写了什么、行号在哪、抄哪些、怎么抄"。
> **源码基线**：两仓库已 clone 至本仓库 `vendor/`（被 gitignore，重新获取见 [vendor/README.md](../../vendor/README.md)）。文中所有行号引用均以下表 commit 为准。
> **读者**：将要实施 `/world/` 智能座舱试验场（PRD LAB-16）的工程师。读完本文应能不打开原仓库直接开工。

---

## 1. 双仓库 commit 基线与体积统计

### 1.1 Clone 元数据

| 项 | folio-2025 | folio-2019 |
|----|-----------|-----------|
| 仓库 | github.com/brunosimon/folio-2025 | github.com/brunosimon/folio-2019 |
| Commit SHA | `41046b57eeed8d156d9c3fd7fa259900baef7816` | `540f13573a6da282eae942a4c67335b97cd18970` |
| Commit 日期 | 2026-04-07（":fire: Remove 2026 Easter"） | 2024-05-06（":bento: Projects > Update"） |
| Clone 日期 | 2026-08-24（`--depth 1`） | 2026-08-24（`--depth 1`） |
| 本地路径 | `vendor/folio-2025` | `vendor/folio-2019` |
| 许可 | MIT（服务端未开源） | MIT |

### 1.2 体积拆分（`du` 实测）

| 目录 | folio-2025 | folio-2019 | 说明 |
|------|-----------|-----------|------|
| 仓库总计（含 .git） | **623MB** | **139MB** | |
| 代码 | `sources/` **1.5MB**（126 个 JS，29,666 行） | `src/` **716KB**（46 个 JS，8,689 行） | 代码占仓库不到 0.3% |
| 运行时资产 | `static/` **197MB** | `static/` **18MB** | 2025 版膨胀 11 倍，几乎全是音乐（见第 8 节） |
| 创作源文件 | `resources/` **150MB**（.blend/.band/设计稿） | 无 | 不参与构建，纯参考价值 |

**第一个工程结论**：Bruno 用 3 万行 JS 驱动一个 197MB 的内容包。**代码是可控成本，内容是真成本**——这决定了第 9 节"最小移植集"的取舍策略：全抄引擎层（便宜），零抄内容层（自建灰盒起步）。

---

## 2. folio-2025 完整模块清单表

`sources/` 下全部 JS 文件（126 个）的职责—依赖—tick order—可移植性判定。tick order 为源码逐文件提取（`ticker.events.on('tick', cb, N)` 的 N；空 = 该系统不上 tick 总线）。

**可移植性图例**：✅ = 可近乎原样移植进本站 `/world/`；🔶 = 移植模式/骨架，内容重写；❌ = 不移植（folio 专属内容或本站不需要）。

### 2.1 入口与根对象

| 文件 | 行数 | 职责 | 依赖 | order | 移植 |
|------|-----|------|------|-------|------|
| `index.js` | 12 | `new Game()`；`VITE_GAME_PUBLIC` 控制是否挂 `window.game` | Game | — | ✅ |
| `threejs-override.js` | 48 | 对 three 的猴子补丁（Line2 相关） | three | — | ❌ 按需 |
| `Game/Game.js` | 276 | 单例根对象；两阶段异步 init（第 4 节逐行注释）；`reset()` 全场景复位 | 全部系统 | — | 🔶 骨架照抄，系统列表换成本站的 |
| `Game/Events.js` | 64 | 带 order 参数的事件总线（数字键 for...in 天然升序） | 无 | — | ✅ **零修改移植** |
| `Game/Ticker.js` | 71 | delta 截断（max 1/30）+ `scale=2` 全局倍速 + 30 帧滑动平均 + TSL 时间 uniform ×4 + `wait(frames,cb)` | Events, three/tsl | — | ✅ |
| `Game/Time.js` | 84 | 挂钟时间（时分秒），驱动昼夜循环起点 | Ticker | 0 | 🔶 本站可砍 |
| `Game/Viewport.js` | 48 | 视口尺寸/像素比/节流 resize 事件 | Events | — | ✅ |
| `Game/Quality.js` | 48 | UA 移动端判定 → level 0/1，`change` 事件热切画质 | Events | — | ✅ |
| `Game/Debug.js` | 90 | `#debug` hash → Tweakpane 面板工厂 | tweakpane | — | ✅ |
| `Game/Monitoring.js` | 38 | stats-gl（当前被注释停用） | stats-gl | 999 | ❌ |

### 2.2 渲染层

| 文件 | 行数 | 职责 | 依赖 | order | 移植 |
|------|-----|------|------|-------|------|
| `Game/Rendering.js` | 184 | WebGPURenderer（自动回退）；`sortObjects=false` + renderOrder 排序；渲染器驱动 Ticker（L68）；RenderPipeline 后处理（bloom + cheapDOF，按画质热切 outputNode L90-104） | three/webgpu, BloomNode | 998 | ✅ |
| `Game/PreRenderer.js` | 34 | 32px CubeCamera 强制渲染全场景，intro 期间预编译所有管线（仅 WebGPU + 高画质） | Rendering | — | ✅ |
| `Game/Passes/cheapDOF.js` | 57 | 自研 TSL 廉价景深（重复采样偏移模拟） | three/tsl | — | 🔶 可选 |
| `Game/Materials.js` | 366 | 材质注册表：`createPalette()`（NearestFilter 调色板）、`createGradient/EmissiveGradient`、`updateObject()` 按材质名替换 | MeshDefaultMaterial | — | 🔶 模式照抄，palette 换本站的 |
| `Game/Materials/MeshDefaultMaterial.js` | 135 | 全场景主材质：阴影捕捉重着色、coreShadow 双色调、地表反弹光、水/雾/reveal 节点开关 | three/tsl, Terrain | — | 🔶 风格化才需要 |
| `Game/Materials/MeshGridMaterial.js` | 156 | 出生点网格地板材质（Intro 用） | three/tsl | — | 🔶 |
| `Game/Noises.js` | 292 | 程序化噪声纹理工厂（voronoi/perlin，DataTexture 缓存） | three | — | ✅ |
| `Game/Geometries/PortalSlabsGeometry.js` | 172 | 传送门石板几何 | three | — | ❌ |
| `Game/Geometries/LineGeometry.js` | 69 | 线条几何封装 | three | — | ❌ |
| `Game/Geometries/WindLineGeometry.js` | 36 | 风线几何 | three | — | ❌ |

### 2.3 物理层

| 文件 | 行数 | 职责 | 依赖 | order | 移植 |
|------|-----|------|------|-------|------|
| `Game/Physics/Physics.js` | 313 | Rapier World 封装：碰撞 3 分组（all/object/bumper，L30-39）、描述式刚体工厂 `getPhysical()`（L84-238）、水下阻尼、CONTACT_FORCE 碰撞音效分发（L281-312） | RAPIER(wasm) | 3 | ✅ **核心移植件** |
| `Game/Physics/PhysicsVehicle.js` | 590 | raycast vehicle 全实现（第 5 节逐段拆解） | Physics, Player | 2, 5 | ✅ **核心移植件** |
| `Game/Physics/PhysicsWireframe.js` | 58 | `world.debugRender()` 调试线框 | Physics | 4 | ✅ |
| `Game/Objects.js` | 362 | 视觉+物理对象工厂；Blender 命名约定解析 `getFromModel`（L114-219）；物理→视觉位姿同步 + 远距离休眠（L304-361） | Physics, Materials | 4 | ✅ **核心移植件** |
| `Game/Zones.js` | 81 | 球/圆柱触发区，纯距离检测（非物理 sensor），enter/leave 事件 | Player | 8 | ✅ **零修改移植** |
| `Game/Respawns.js` | 67 | 从 `respawnsReferences.glb` 解析重生点（命名 `respawnXxx`），`getClosest()` | ResourcesLoader | — | ✅ |
| `Game/Terrain.js` | 132 | 地形高度/颜色纹理采样（供材质反弹光与物理 heightfield） | ResourcesLoader | 10 | 🔶 |

### 2.4 输入层

| 文件 | 行数 | 职责 | 依赖 | order | 移植 |
|------|-----|------|------|-------|------|
| `Game/Inputs/Inputs.js` | 333 | 动作层：多键绑定、categories 过滤（ObservableSet → CSS class，L23-40）、三模式抢占切换 | 下列设备类 | 0 | ✅ **核心移植件** |
| `Game/Inputs/Keyboard.js` | 48 | key/code 双通道 down/up | Events | — | ✅ |
| `Game/Inputs/Gamepad.js` | 437 | 手柄轮询、xbox/ps 类型识别、摇杆死区、按钮模拟量 | Events | — | 🔶 可后置 |
| `Game/Inputs/Pointer.js` | 195 | 鼠标/触摸统一 pointer | Events | — | ✅ |
| `Game/Inputs/Wheel.js` | 16 | normalize-wheel 封装 | Events | — | ✅ |
| `Game/Inputs/Nipple.js` | 278 | 触摸虚拟摇杆（自绘，含 forward 扇区判定） | Pointer | — | ✅ 移动端必需 |
| `Game/Inputs/InteractiveButtons.js` | 114 | 触屏 HTML 按钮组（unstuck/interact 等按需显隐） | Events | — | ✅ |
| `Game/InputFlag.js` | 216 | 输入模式图标提示（键盘/手柄/触摸 UI 徽标） | Inputs | — | 🔶 |
| `Game/RayCursor.js` | 219 | 屏幕射线拾取：球形 intersect 注册表 + onClick/onEnter/onLeave（Intro 声音按钮、Start 圆环用它） | Pointer, View | — | ✅ |
| `Game/KonamiCode.js` | 77 | 上上下下左右左右BA 彩蛋监听 | Inputs | — | ❌ 娱乐可选 |

### 2.5 玩家与相机

| 文件 | 行数 | 职责 | 依赖 | order | 移植 |
|------|-----|------|------|-------|------|
| `Game/Player.js` | 676 | 玩家意图层：18 个动作定义（L220-239）、输入→油门/转向/悬挂、10+ 车辆音效绑定（L55-216）、复活/卡死自救（L345-410）、里程与成就统计 | Inputs, PhysicsVehicle, Audio | 1, 6 | 🔶 骨架照抄，砍音效/成就 |
| `Game/View.js` | 788 | 跟随相机：focusPoint 磁吸追踪、zoom 三级、spherical 角度、optimalArea 视锥四边形（供 Area 剔除）、speedLines、MODE_DEFAULT/FREE（camera-controls 自由飞） | Ticker, Player | 7 | ✅ **核心移植件** |

### 2.6 资源与音频

| 文件 | 行数 | 职责 | 依赖 | order | 移植 |
|------|-----|------|------|-------|------|
| `Game/ResourcesLoader.js` | 123 | GLTF+Draco+KTX2 loader 三件套、四元组资源声明、Map 缓存、进度回调 | three loaders | — | ✅ |
| `Game/Audio.js` | 769 | Howler 封装：注册表、分组、位置衰减、antiSpam 冷却、mute 持久化、`init()` 延迟到用户手势后 | howler | 14 | ✅ |
| `Game/References.js` | 50 | Blender 命名 `ref(erence)Xxx##` 正则解析 → Map（L18 正则），POI 注册的底座 | 无 | — | ✅ **零修改移植** |
| `Game/TextCanvas.js` | 112 | Canvas 文字纹理生成（世界内标签） | 无 | — | ✅ |

### 2.7 世界系统（环境/天气/循环）

| 文件 | 行数 | 职责 | order | 移植 |
|------|-----|------|-------|------|
| `Game/Cycles/Cycles.js` | 311 | 循环基类：progress 驱动属性插值表 | 8 | 🔶 |
| `Game/Cycles/DayCycles.js` | 70 | 昼夜循环（光色/雾色/reveal 色查表） | — | 🔶 |
| `Game/Cycles/YearCycles.js` | 29 | 四季循环（树叶颜色/雪） | — | ❌ |
| `Game/Weather.js` | 229 | 天气状态机（晴/雨/雪/风暴概率转移） | 8 | ❌ V2 再说 |
| `Game/Wind.js` | 77 | 全局风向/风强 uniform | 9 | 🔶 |
| `Game/Ligthing.js`（原文拼写） | 214 | 平行光 + 阴影相机跟随玩家 | 9 | ✅ |
| `Game/Fog.js` | 49 | 雾 uniform 管理 | 10 | ✅ |
| `Game/Water.js` | 26 | 水面高度常量 + 水下判定 | — | 🔶 |
| `Game/Tornado.js` | 255 | 龙卷风事件（路径巡游 + 吸起物体） | 9 | ❌ |
| `Game/Explosions.js` | 81 | 爆炸冲击波（物理冲量 + 视效触发） | — | ❌ 彩蛋 |
| `Game/Trails.js` | 183 | 氮气拖尾线 | 10 | ❌ |
| `Game/Tracks.js` | 250 | 轮胎痕迹（环形缓冲贴花） | 9 | 🔶 质感加分项 |

### 2.8 世界内容（`World/`）

| 文件 | 行数 | 职责 | order | 移植 |
|------|-----|------|-------|------|
| `World/World.js` | 244 | 三步构建：step0=Grid+Intro；step1=全部内容；step2=Whispers（第 4 节） | — | 🔶 骨架照抄 |
| `World/Grid.js` | 101 | 出生点发光网格地板（intro 期间的"舞台"） | — | ✅ |
| `World/Intro.js` | 342 | 开场：进度圆环（TSL 角度 discard，L64-73）+ 操作提示标签 + 声音按钮（第 7 节） | 8 | ✅ **Start here 核心** |
| `World/VisualVehicle.js` | 546 | 车辆视觉：命名部件收集（L61-127）、车轮悬挂视觉、转向灯/刹车灯、天线物理摆、氮气尾迹、5 种涂装材质（L129+） | 8 | 🔶 **morph 插入点**（第 10 节） |
| `World/Scenery.js` | 118 | 整岛装饰层（单 GLB 合并网格 + palette） | 1(默认) | 🔶 |
| `World/Floor.js` | 209 | 程序化地面着色（terrain 纹理采样） | 10 | 🔶 |
| `World/WaterSurface.js` | 467 | 水面 + 冬季结冰（iceRatio 驱动摩擦系数） | 10 | ❌ |
| `World/Grass.js` | 210 | 实例化草地（视野内环形网格重投影） | 10 | 🔶 性能样板 |
| `World/Foliage.js` | 220 | 树叶 SDF 广告牌 | 10 | ❌ |
| `World/Trees.js` | 120 | 三种树的 InstancedGroup 组装 | — | 🔶 |
| `World/Bushes.js` | 27 | 灌木实例化 | — | ❌ |
| `World/Flowers.js` | 177 | 花实例化 + 风摆 | — | ❌ |
| `World/Leaves.js` | 305 | 落叶粒子 | 10 | ❌ |
| `World/Snow.js` | 475 | 雪粒子 + 积雪 | 10 | ❌ |
| `World/RainLines.js` | 257 | 雨线粒子 | 10 | ❌ |
| `World/WindLines.js` | 191 | 风线 | 10 | ❌ |
| `World/Lightnings.js` | 492 | 闪电（分形折线 + 发光） | 10 | ❌ |
| `World/Confetti.js` | 183 | 彩带粒子（成就庆祝） | — | ❌ |
| `World/Fireballs.js` | 107 | 火球 | — | ❌ |
| `World/Bubble.js` | 283 | 对话气泡（NPC 提示） | — | 🔶 |
| `World/Benches.js` / `Bricks.js` / `Fences.js` / `Lanterns.js` | 63/64/66/69 | 同构模式：referencesGLB → InstancedGroup + 逐实例物理体，碰撞后标脏 | 10 | 🔶 抄一个当模板 |
| `World/ExplosiveCrates.js` | 189 | 可炸木箱（碰撞力阈值 → 爆炸 + 重生） | 10 | ❌ 娱乐 |
| `World/PoleLights.js` | 141 | 路灯（发光材质 + 昼夜开关） | — | 🔶 |
| `World/Whispers.js` | 528 | 在线留言火苗（服务端可选，离线假数据） | 10 | ❌ |
| `World/VisualTornado.js` | 170 | 龙卷风视觉 | 10 | ❌ |

### 2.9 内容分区（`World/Areas/`，16 文件）

| 文件 | 行数 | 内容 | 移植 |
|------|-----|------|------|
| `Areas/Areas.js` | 81 | 分区注册表：名字前缀 → Area 类实例化（第 6 节） | ✅ 骨架 |
| `Areas/Area.js` | 177 | 分区基类：自动加物理对象 + bounding 触发区 + frustum 显隐剔除（第 6 节） | ✅ **核心移植件** |
| `Areas/LandingArea.js` | 272 | 出生区：名字字母物理体、地图亭、操作说明、篝火重置 | 🔶 对应本站"出发广场" |
| `Areas/ProjectsArea.js` | 1555 | 作品集：项目板 + 翻页 + 外链跳转 | 🔶 对应"案例岛"，逻辑参考 |
| `Areas/LabArea.js` | 1458 | 实验室：Lab 项目展廊 | 🔶 对应"实验区" |
| `Areas/CareerArea.js` | 375 | 职业经历时间线（贴图墙） | 🔶 对应"控制塔" |
| `Areas/SocialArea.js` | 317 | 社交链接雕像 | 🔶 对应"联络站" |
| `Areas/BowlingArea.js` | 644 | 保龄球小游戏（计分/重排瓶） | ❌ |
| `Areas/CircuitArea.js` | 1690 | 赛道计时赛（检查点 + 幽灵车 + 排行榜） | ❌ V2 灵感 |
| `Areas/CookieArea.js` | 528 | Cookie 点击器戏仿 | ❌ |
| `Areas/AltarArea.js` | 516 | 祭坛彩蛋（Konami 联动） | ❌ |
| `Areas/AchievementsArea.js` | 348 | 成就展示墙 | ❌ |
| `Areas/TimeMachineArea.js` | 117 | 旧版 folio 传送门（CRT 屏） | ❌ 但"作品即历史"思路可借鉴 |
| `Areas/BehindTheSceneArea.js` | 167 | 幕后区（星空材质） | ❌ |
| `Areas/ToiletArea.js` | 54 | 厕所彩蛋 | ❌ |
| `Areas/EasterArea.js` | 37 | 复活节彩蛋 | ❌ |

### 2.10 HTML UI 与运营层

| 文件 | 行数 | 职责 | order | 移植 |
|------|-----|------|-------|------|
| `Game/Menu.js` | 284 | 汉堡菜单（controls/options/credits 面板） | — | 🔶 Astro 组件重写 |
| `Game/Modals.js` | 204 | HTML 模态框状态机（`.js-modal` DOM 驱动，open/close 过渡队列） | — | 🔶 同上 |
| `Game/Overlay.js` | 142 | 全屏过渡遮罩（respawn 时遮一下） | — | ✅ |
| `Game/Tabs.js` | 105 | 模态框内 tab 切换 | — | 🔶 |
| `Game/Options.js` | 117 | 设置持久化（音量/画质 localStorage） | — | ✅ |
| `Game/Notifications.js` | 175 | 右下角 toast 队列 | 14 | 🔶 |
| `Game/Achievements.js` | 630 | 成就系统（进度累计/localStorage/通知联动） | — | ❌ V2 |
| `Game/Map.js` | 192 | 小地图（canvas 合成 + 玩家标记） | 14 | 🔶 V2 |
| `Game/Title.js` | 104 | 网页标题动画（车速驱动 🚗 跑动） | 14 | ❌ 趣味可选 |
| `Game/InteractivePoints.js` | 663 | 世界内交互点：Canvas 文字标签 + 按键图标 + 距离显隐 + interact 分发（第 6 节） | 9 | ✅ **核心移植件** |
| `Game/Reveal.js` | 236 | 开场三步状态机（第 7 节逐行拆解） | 10 | ✅ **Start here 核心** |
| `Game/Server.js` | 132 | WebSocket 客户端（msgpack），`VITE_SERVER_URL` 空则不连 | — | ❌ |
| `Game/ClosingManager.js` | 109 | 页面关闭前状态保存 | — | 🔶 |
| `Game/Easter.js` | 169 | 节日彩蛋调度 | — | ❌ |
| `Game/BlackFriday/*.js` | 251+94 | 黑五促销彩蛋（碎裂动画） | 10 | ❌ |
| `Game/utilities/maths.js` | 184 | lerp/remap/smallestAngle/circleIntersectsPolygon | — | ✅ **零修改移植** |
| `Game/utilities/ObservableSet.js` / `ObservableMap.js` / `time.js` | 41/27/28 | 带回调的容器 / 时间格式化 | — | ✅ |
| `data/*.js`（5 个文件） | ~750 | 成就定义/项目数据/国家列表/console 彩蛋文案 | — | ❌ 换本站数据 |
| `style/`（Stylus 若干） | — | HTML overlay 样式 | — | ❌ 本站有自己的设计系统 |

**清单统计**：✅ 全量可移植 26 个文件（约 4,300 行）；🔶 移植骨架 30 个；❌ 不移植 70 个。**引擎层与内容层的比例约 1:2**——这是"最小移植集 ≤15 模块"（第 9 节）可行的原因。

---

## 3. folio-2019 关键差异：Cannon.js 车辆与 Start 流程

### 3.1 全局架构差异（源码坐标）

| 维度 | folio-2019 | folio-2025 |
|------|-----------|-----------|
| 根对象 | `src/javascript/Application.js` L22-40：构造函数**同步**串行 `setConfig → setDebug → setRenderer → setCamera → setPasses → setWorld → setTitle` | `sources/Game/Game.js` L70-216：**异步两阶段**（第 4 节） |
| 依赖传递 | 构造参数手工注入：`new World({config, debug, resources, time, sizes, camera, scene, renderer, passes})`（Application.js L223-234） | `Game.getInstance()` 全局枢纽 |
| 事件时序 | `Utils/EventEmitter.js`（220 行，支持命名空间但**无 order**），各系统 `time.on('tick')` 注册顺序即执行顺序 | `Events.js` 带 order 参数 |
| 世界坐标 | **Z-up**（贴合 Blender）：`World/Physics.js` L37 `gravity.set(0, 0, -3.25*4)` | Y-up（three 惯例） |
| 帧驱动 | `Utils/Time.js` 自持 rAF | 渲染器 `setAnimationLoop` 驱动 |

### 3.2 Cannon.js RaycastVehicle 源码要点（`src/javascript/World/Physics.js`）

2019 版车辆全部写在 `Physics.js` 的 `setCar()`（L104-627，一个 520 行的方法），与 2025 版的类拆分对照：

**底盘与轮子构造（L172-243）**：

```js
// L179-186：单 Box 底盘，mass 40（2025 版仅 2.5——Rapier 与 Cannon 的力尺度完全不同）
chassis.shape = new CANNON.Box(new CANNON.Vec3(depth*0.5, width*0.5, height*0.5))
chassis.body = new CANNON.Body({ mass: 40 })
chassis.body.position.set(0, 0, 12)       // 从 12 米高空落下入场
chassis.body.sleep()                       // 先睡，等 reveal 唤醒

// L203-205：Cannon 内置 RaycastVehicle（与 Rapier VehicleController 同族算法）
this.car.vehicle = new CANNON.RaycastVehicle({ chassisBody: this.car.chassis.body })

// L211-227：轮子参数（对照第 5.4 节参数换算表）
wheelOptions = {
    radius: 0.25, suspensionStiffness: 50, suspensionRestLength: 0.1,
    frictionSlip: 10, dampingRelaxation: 1.8, dampingCompression: 1.5,
    maxSuspensionForce: 100000, rollInfluence: 0.01, maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30, useCustomSlidingRotationalSpeed: true,
    directionLocal: (0,0,-1), axleLocal: (0,1,0)    // Z-up 世界
}
```

**驱动模型（`postStep` L349-430 + `tick` L435-586）**：

- 速度测量（L352-357）：`positionDelta.length() / time.delta`——**与 2025 版一致的"位置差分测速"**，不信物理引擎报告的速度。
- 转向（L481-511）：键盘按住时按 `steerStrength = delta * 0.015` **渐进增转**，松开渐进回正——2019 的"转向惯性"手感；2025 版改为直接 `steering * 0.5` 立即响应（手柄模拟量时代不需要键盘渐进）。
- 加速（L526-558）：超过 `controlsAcceleratinMaxSpeed` 直接切 0 力（硬限速）；2025 版改为 `force / (1 + overflowSpeed)` 软衰减。
- 减速（L417-429）：松油门时在 `postStep` 里施加**反向速度比例阻力冲量**（`velocity.length() * 0.1`）——2025 版改为 `idleBrake` 常量刹车，更简单。
- 翻车自救（L368-396）：`worldUp.dot(localUp) < 0.5` 持续 1 秒 → `jump(true)`（L162-167：向上冲量 150 + 偏心 0.1m 制造翻转扭矩）。2025 版进化为按姿态计算扭矩方向的 `flip.jump()`（第 5.3 节）。
- 轮子视觉（L399-414）：`vehicle.updateWheelTransform(i)` 后把 `worldTransform` 拷给 4 个 KINEMATIC 轮子 body——轮子在 2019 版有实体（纯视觉/音效用），2025 版轮子完全无实体。

**2019 独有：车辆热重建（L295-309）**。`car.destroy() + car.create()` 支持 dat.GUI 改参数即重建整车——调参工作流值得抄，2025 版用 Tweakpane setter 直写替代。

### 3.3 与 2025 版物理的决定性差异

| 项 | 2019 (Cannon) | 2025 (Rapier) | 对移植的启示 |
|----|--------------|---------------|-------------|
| 引擎载体 | 纯 JS，单线程解释执行 | Rust→wasm | 大量刚体时差 5-10 倍；本站直接选 Rapier |
| 接触材质 | `ContactMaterial` 全局配对表（L77-87：floor×wheel friction 0.3 等） | 每 collider 自带 friction/restitution + CoefficientCombineRule | Rapier 模型更直观 |
| 碰撞过滤 | 无（全碰） | 3-bit 分组 + bumper 推铲 | bumper 是 2025 手感关键，必抄 |
| 车头碰撞音 | `chassis.body.addEventListener('collide')`（L191-198） | CONTACT_FORCE_EVENTS + 力度归一化 | 2025 版可按力度调音量，体验更好 |
| 世界步进 | `world.step(delta/1000)` 固定接 rAF delta | `world.timestep = deltaScaled` 可变步长 + maxDelta 截断 | 照抄 2025 |

---

## 4. Game.js 启动序列逐步注释

`vendor/folio-2025/sources/Game/Game.js`（276 行）完整启动时序。伪代码级注释，行号为真实源码行号：

```text
┌─ index.js L1-12
│    new Game()                          // 单例守卫在构造函数（L62-63）
│
├─ Game.init() 【阶段一：intro 前，同步链 + 2 个 await】────────────────
│
│  L73-75   domElement/canvasElement 抓取；<html> 加 .is-started
│  L78      scene = new THREE.Scene()
│  L79      debug = new Debug()               // #debug hash → Tweakpane
│  L80      resourcesLoader = new ResourcesLoader()  // 只建 loader 不加载
│  L81      quality = new Quality()           // UA → level 0/1（后续所有系统读它）
│  L82      server = new Server()             // 只读配置不连接
│  L83      ticker = new Ticker()             // 建 tick 总线（此时无人驱动）
│  L84      time = new Time()                 // 挂钟（order 0）
│  L85-86   dayCycles / yearCycles            // 昼夜与四季查表
│  L87      inputs = new Inputs([], ['intro']) // ★ 初始 filter 只有 'intro'
│                                              //   ——驾驶动作此时全部无效
│  L88      audio = new Audio()               // Howler 注册表（不发声，等手势）
│  L89      notifications = new Notifications()
│  L90      rayCursor = new RayCursor()       // 射线拾取（Start 圆环点击靠它）
│  L91      viewport = new Viewport(dom)
│  L92-93   modals / menu                     // HTML UI（DOM 已在 index.html 里）
│  L94-95   rendering = new Rendering()
│            await rendering.setRenderer()     // ★ 第一个 await：
│                                              //   Rendering.js L40-45 WebGPURenderer
│                                              //   L68 setAnimationLoop → ticker.update
│                                              //   —— 从这行起 tick 总线开始跳动
│
│  L97-109  await resourcesLoader.load([...])  // ★ 第二个 await：首批 4 个资源
│              respawnsReferencesModel          // 重生点（Intro 需要知道出生在哪）
│              behindTheSceneStarsTexture       // 星空（车漆 Abyssal 用）
│              soundTexture                     // 声音开关图标
│              paletteTexture                   // ★ 全场景调色板（材质系统前置）
│            // VITE_COMPRESSED 决定 .glb/.png 还是 -compressed.glb/.ktx（L97-100）
│
│  L110     options = new Options()            // localStorage 设置
│  L111     respawns = new Respawns(VITE_PLAYER_SPAWN || 'landing')
│  L112     view = new View()                  // 相机（focusPoint = 默认重生点）
│  L113-114 rendering.setPostprocessing(); rendering.start()
│                                              // order 998 render 挂上总线，开始出画面
│  L115     reveal = new Reveal()              // 开场状态机 standby（step=-1）
│  L116-125 noises/weather/wind/tracks/lighting/fog/water/materials/objects/explosions
│  L126     world = new World()                // ★ World.js L38 构造即 step(0)：
│                                              //   只建 Grid（发光地板）+ Intro（进度圆环）
│
├─ 【阶段二：并行加载，intro 圆环当进度条】──────────────────────────
│
│  L129     rapierPromise = import('@dimforge/rapier3d')     // wasm ~1.5MB
│  L132-179 resourcesPromise = resourcesLoader.load([...31 项...],
│              (toLoad, total) => world.intro.updateProgress(1 - toLoad/total))
│              // ★ 加载进度直接写 Intro 圆环 shader 的 uniform（第 7.2 节）
│  L181     const [newResources, RAPIER] = await Promise.all([...])
│              // wasm 编译与 GLB 下载完全并行
│
├─ 【阶段三：物理与玩法系统 —— 全部依赖 RAPIER 就绪】────────────────
│
│  L185     terrain = new Terrain()
│  L186     physics = new Physics()            // RAPIER.World + eventQueue（order 3）
│  L187     wireframe = new PhysicsWireframe() // order 4
│  L188     physicalVehicle = new PhysicsVehicle()  // 底盘+4 轮+状态检测（order 2,5）
│  L189     zones = new Zones()                // order 8
│  L190     player = new Player()              // ★ Player.js L39-42：
│                                              //   把车 moveTo 到默认重生点
│  L191-197 closingManager/interactivePoints/konamiCode/achievements/tornado/map/title
│  L199     world.step(1)                      // ★ 构建全部世界内容：
│                                              //   车辆视觉/地面/水/树/道具/16 个 Area
│  L200     overlay = new Overlay()
│
│  L203-204 if(quality==0 && isWebGPUBackend) PreRenderer.render()
│              // 32px CubeCamera 强制全场景渲一遍，逼 shader 全部编译
│
│  L206-209 ticker.wait(3, () => reveal.updateStep(0))
│              // ★ 等 3 帧（shader 编译落地）再启动开场动画
│              //   ——此后流程交给 Reveal 状态机（第 7.2 节）
└──────────────────────────────────────────────────────────────
```

**移植时最容易踩的 4 个坑**（都编码在这个序列里）：

1. **`Inputs` 初始 filter 必须是 `['intro']`**（L87）——否则加载期间玩家按键会漏进驾驶系统（车还不存在，直接空指针）。
2. **`rendering.start()`（L114）先于世界构建**——intro 圆环需要渲染循环已跑起来才能显示加载进度；渲染一个只有 Grid+Intro 的场景成本可忽略。
3. **`world.step(1)` 必须晚于 `physics`/`objects`**——Area 构造时会调 `objects.addFromModel` 建碰撞体。
4. **`ticker.wait(3, ...)` 不是装饰**——WebGPU 管线编译是异步的，提前 reveal 会看到白帧闪烁。

`Game.reset()`（L218-274）：世界软复位——respawn 玩家后遍历重置所有 dynamic 物理体到 `initialState`，再逐系统恢复（保龄球重摆、雕像立起、InstancedGroup 全量标脏）。本站 `/world/` 的"重置试验场"按钮可以照抄该模式。

---

## 5. PhysicsVehicle / raycast vehicle 算法要点（复现手册）

`sources/Game/Physics/PhysicsVehicle.js`（590 行）。raycast vehicle 的本质：**轮子不是刚体，是从底盘向下打的 4 条射线**；悬挂力 = 弹簧-阻尼公式作用于底盘；驱动力/转向 = 沿射线接触点切向施力。Rapier 的 `DynamicRayCastVehicleController` 内置了全部数值积分，业务代码只做参数与状态管理。

### 5.1 底盘：三 collider 组合（L87-109）

```js
colliders: [
  // 主体：唯一有质量的部分。centerOfMass y=-0.5 手动压低质心 ← 防翻车第一要素
  { shape:'cuboid', mass:2.5, parameters:[1.3, 0.4, 0.85], position:{y:-0.1},
    centerOfMass:{x:0, y:-0.5, z:0} },
  // 车顶：零质量纯碰撞（翻车时车顶着地不穿模）
  { shape:'cuboid', mass:0, parameters:[0.5, 0.15, 0.65], position:{y:0.4} },
  // 推土铲：category 'bumper'，只推 object 组、不碰 floor 组
  //   ——车头能撞飞道具但永远不会被小物件绊住
  { shape:'cuboid', mass:0, parameters:[1.5, 0.5, 0.9], position:{x:0.1,y:-0.2},
    category:'bumper' },
],
canSleep: false,                  // 玩家的车永不休眠
waterGravityMultiplier: 0,        // 车不受水下浮力（掉水里直接 respawn）
onCollision: (force, position) => audio.groups.get('hitDefault').playRandomNext(...)
```

碰撞分组编码（`Physics.js` L30-39）：`floor = all<<16 | all`、`object = (all|object)<<16 | (all|bumper)`、`bumper = bumper<<16 | object`。Rapier 的 32 位分组语义：高 16 位=我属于谁，低 16 位=我碰谁。

### 5.2 轮子参数表（L140-152，全部映射到 Rapier setter）

| 参数 | 值 | Rapier setter | 手感语义 |
|------|----|---------------|---------|
| `offset` | x±0.90, z±0.75 | `setWheelChassisConnectionPointCs` | 轴距/轮距（决定转弯半径） |
| `radius` | 0.4 | `setWheelRadius` | 射线长度基数 |
| `directionCs` | (0,-1,0) | `setWheelDirectionCs` | 悬挂方向（垂直向下） |
| `axleCs` | (0,0,1) | `setWheelAxleCs` | 轮轴向（侧向） |
| `frictionSlip` | **0.9** | `setWheelFrictionSlip` | 纵向抓地。冰面动态降到 0.04（L498-507） |
| `sideFrictionStiffness` | **3** | `setWheelSideFrictionStiffness` | ★ 横向抓地=漂移手感的核心旋钮。调低→漂，调高→轨道车 |
| `suspensionCompression` | 10 | `setWheelSuspensionCompression` | 压缩阻尼 |
| `suspensionRelaxation` | 2.7 | `setWheelSuspensionRelaxation` | 回弹阻尼 |
| `maxSuspensionForce` | 150 | `setWheelMaxSuspensionForce` | 悬挂力上限（撞地不弹飞） |
| `maxSuspensionTravel` | 2 | `setWheelMaxSuspensionTravel` | 行程上限 |
| restLength | 0.88/1.23/1.63 三档 | `setWheelSuspensionRestLength` | ★ 可玩悬挂：low=常态 mid=低趴 high=跳跃 |
| stiffness | 20/30/40 三档 | `setWheelSuspensionStiffness` | 与三档 restLength 配对 |

**可玩悬挂机制**：`Player.js` L260-307 把小键盘 1-9 映射到 4 个轮子的独立档位（`suspensions[i] ∈ low/mid/high`），`updatePrePhysics` L495-496 每帧写 restLength+stiffness。四轮同时 high = 跳跃；同侧 high = 侧倾；前轮 high = 翘头。**跳跃不是施加冲量，是悬挂弹簧瞬间加长把车"弹"起来**——这是 folio 车辆"活"的关键设计。

### 5.3 每帧算法（两段式，order 2 与 5）

**pre-physics（L457-513，order 2，在 world.step 之前）**：

```text
1. 引擎力（L460-462）：
   topSpeed   = lerp(5, 40, boosting)                    # boost 时限速提 8 倍
   overflow   = max(0, speed - topSpeed)
   engineForce = accel * (1 + boost*2) * 300 / (1 + overflow) * deltaScaled
   # 无硬限速：超速后力按 1/(1+overflow) 软衰减 → 下坡能自然超过 topSpeed

2. 刹车三分支（L465-482）：
   a. 主动刹车：brake = player.braking (0/1)
   b. 怠速阻力：松油门时 brake = 0.06                     # 车会慢慢滑停
   c. 换向刹停：速度>0.5 且输入方向与行驶方向相反
      → brake = 0.4, engineForce = 0                     # 先刹停再倒车（真车手感）
   brake *= 35 * deltaScaled

3. 转向（L485-489）：前两轮 setWheelSteering(steering * 0.5)，无渐进无插值
4. 逐轮写入 brake/engineForce/悬挂档位（L491-496）+ 冰面摩擦插值（L498-507）
5. controller.updateVehicle(dt)（L510-512）
   dt = quality==1 ? 1/60 : min(1/60, ticker.deltaAverage)
   # ★ 车辆控制器用 30 帧滑动平均 dt，与 world.step 的瞬时 dt 分离
   #   ——帧尖峰只影响世界，不打乱悬挂积分
```

**post-physics（L515-578，order 5，在 world.step 之后）**：

```text
1. 读回位姿：position/quaternion ← body；三个基向量 forward/upward/sideward
   ← 单位向量 applyQuaternion（L523-525）
2. 测速（L527-531）：speed = |Δposition| / deltaScaled     # 位置差分，不用引擎报告值
   forwardRatio = direction·forward；goingForward = ratio > 0.5
3. 轮子接触统计（L540-571）：inContactCount、justTouchedCount（0.2s 窗口内新触地数
   → 落地弹簧音效音量）
4. 状态检测器（全部滞回设计，防抖动）：
   stop（L203-230）：   speed < 0.04 → 'stop'；> 0.7 → 'start'    # 双阈值滞回
   upsideDown（L232-260）：upward·(0,-1,0) 归一化 > 0.3 → 'upsideDown'
   stuck（L262-314）：  3 秒滑动窗口累计位移 < 0.5m 且在踩油门 → 'stuck'
                        # 环形缓冲存 [位移,时间] 对，L272-293
   flip（L344-402）：   四轮离地期间累计 Z 轴转角（smallestAngle 累加防 2π 跳变）
                        # 落地时 |X 累计|<1 且 |Z 累计|>5 rad → 'flip'（前空翻/后空翻成就）
```

**翻车自救 `flip.jump()`（L404-438）**：向上冲量 `5 * mass`，再按姿态分支——四脚朝天给固定 X 扭矩（L422-428）；侧翻按 `sideward`/`forward` 与世界 up 的点积算扭矩方向（L430-437），把车"拧"回正面。触发链在 `Player.js` L345-393：`upsideDown` 事件 → 3 秒 gsap 延时 → 仍翻着就 jump，没成功递归重试。

### 5.4 参数换算备忘（Cannon 2019 → Rapier 2025 → 本站）

| 语义 | 2019 值 | 2025 值 | 说明 |
|------|--------|--------|------|
| 底盘质量 | 40 | 2.5（density 体系） | 两引擎质量尺度不同，**照抄 2025 全套**，别混搭 |
| 引擎力 | 17×8≈136 | 300×deltaScaled | 2025 力乘了 dt（帧率无关化） |
| frictionSlip | 10 | 0.9 | Cannon 与 Rapier 定义差一个量级，不可互换 |
| 悬挂 restLength | 0.1 | 0.88-1.63 | 2025 的长悬挂=卡通弹跳感的来源 |
| 重力 | (0,0,-13) Z-up | (0,-9.81,0) Y-up | |
| 全局时间 | ×1 | **×2（Ticker.scale）** | ★ 隐藏参数：2025 整个世界 2 倍速运行，抄参数必须连 Ticker 一起抄 |

---

## 6. Areas 分区系统：POI 注册、触发器、内容展示

### 6.1 注册管线：Blender 命名 → 类实例（`Areas/Areas.js` L23-48）

```js
const list = [ ['landing', LandingArea], ['projects', ProjectsArea], ... ]  // 13 项
for(const child of areasModel.scene.children)        // areas.glb 顶层节点
    for(const [name, AreaClass] of list)
        if(child.name.startsWith(name))               // ★ 名字前缀匹配
            this[name] = new AreaClass(child)
```

**关卡即数据**：美术在 Blender 里把一个分区的所有物体挂在 `landingXxx` 空物体下，导出 `areas.glb`；代码侧只需要类名映射表。增删分区不改引擎代码。

### 6.2 Area 基类三件套（`Areas/Area.js`，177 行）

每个 Area 构造时自动获得：

**① 物体自动注册（L32-70）**：遍历模型直接子节点 → `objects.addFromModel(child)`（命名含 `physical/dynamic` 自动建刚体，子节点 `cuboid*/trimesh*/hull*/tube*/ball*` 变 collider，`Objects.js` L114-219）。`userData.preventAutoAdd` 可跳过。同时 `references.parse(child)`——凡命名匹配 `^ref(erence)?Xxx##$` 的空物体进 References Map（`References.js` L18），**这就是 POI 注册机制**：美术放一个 `refKioskInteractivePoint` 空物体，代码 `this.references.items.get('kioskInteractivePoint')[0].position` 拿到坐标。

**② bounding 触发区（L72-102）**：找 `refZoneBounding` 空物体（position=圆心，scale.x=半径）→ `zones.create('cylinder', ...)` → enter/leave 转发为 `boundingIn/boundingOut` 事件。Zones 是纯距离检测（`Zones.js` L50-81，每帧对玩家位置做 `distanceTo`），**不占物理资源**。用途：进区成就（`LandingArea.js` L257-267）、进区换 BGM、进区显示 UI。

**③ frustum 显隐剔除（L104-177）**：找 `refZoneFrustum` → 每帧 `circleIntersectsPolygon(区圆, view.optimalArea.quad2)`（View 维护的地面视野四边形）判断分区是否可见 → 整组 `object3D.visible` 批量开关 + `frustumIn/Out` 事件。**Area.update() 只在可见时执行**（L27-28）——16 个分区的动画逻辑同屏最多跑 2-3 个。

### 6.3 内容展示：InteractivePoints（`InteractivePoints.js`，663 行）

世界内所有"可交互点"的统一实现，`create()` 签名（L180-189）：

```js
game.interactivePoints.create(
    position,                       // 通常来自 references
    'Map',                          // 标签文字 → Canvas 纹理（Amatic SC 手写体，L211-247）
    InteractivePoints.ALIGN_RIGHT,  // 标签在锚点左/右
    InteractivePoints.STATE_CONCEALED,  // 初始态：hidden/open/concealed
    onInteract, onReveal, onConceal, onHide   // 四个回调
)
```

运行机制（order 9 的 update）：按玩家距离自动 reveal/conceal（带纸张音效 L46-63）；**同时只有一个 activeItem**；键盘 Enter/E/F、手柄 Cross、触屏 HTML 按钮统一走 `interact` 动作（L161-178）。按键图标是 3D 网格（非 HTML），随输入模式换贴图（L95-159）。

**内容展示的分层原则**（从 `LandingArea.setKiosk` L40-72 可见）：交互点本身只做"入口"，深内容全部交给 HTML——`modals.open('map')` / `menu.open('controls')` / 项目区直接 `window.open(url)`。**3D 负责发现与氛围，HTML 负责阅读与转化**。这与本站 PRD 的"证据等级/案例详情必须 HTML"完全同构，可直接映射：案例岛标牌 = InteractivePoint，点击 → Astro 页面路由或 modal。

### 6.4 对比 2019 版 Area（`World/Area.js`，308 行）

2019 的 Area 是**矩形交互区**（非分区管理）：AABB 测试（L284）玩家进出 → 围栏升降动画（gsap，L202-267）+ Enter 键图标浮起（L113-158）+ `keydown` 直接监听（L300-306）。2025 把"触发区"（Zones）、"交互点"（InteractivePoints）、"分区管理"（Area）拆成三个正交系统——**移植时直接采用 2025 的三分法**，2019 的围栏交互区视觉（发光边框 + 虚线栅栏升起）可作为 POI 视觉参考。

---

## 7. Intro / Start here 实现：2019 vs 2025 源码对比

用户明确要求 Start here 体验，这节给全两代的完整事件链。

### 7.1 folio-2019：显式 "Start" 按钮（`World/index.js` L171-249）

```text
页面加载
  → World 构造（L28-58）：只建 sounds/controls/floor/areas + setStartingScreen
    ├─ startingScreen.area = areas.add({ halfExtents:(2.35,1.5), active:false })
    │     # 出生点脚下一块矩形交互区（L176-182），先禁用
    ├─ loadingLabel：base64 内嵌 PNG "Loading"（L186-196）★ 零请求，秒显
    └─ startLabel：base64 内嵌 PNG "Start"，opacity 0（L199-211）
  → resources 'progress' 事件（L214-219）：
        area.floorBorder.uLoadProgress = progress   # 地面边框当进度条
  → resources 'ready' 事件（L222-232）：
        area.activate()
        gsap: loadingLabel 淡出 → startLabel 淡入    # "Loading" 换 "Start"
  → 玩家把车开进区域 or 点击 or 按 Enter → area.trigger('interact')（L235-248）
        area.deactivate()
        this.start()                                # ★ L60-79：此刻才构建
        │   setReveal/setMaterials/setShadows/setPhysics/setZones/setObjects
        │   setCar/setTiles/setWalls/setSections/setEasterEggs
        └─ 600ms 后 reveal.go()（L90-129）：
              matcaps 揭示动画 3s + 地板阴影 0.5s 延迟
              car.chassis.body.position.set(0,0,12) → 300ms 后 wakeUp  # 车从天而降
              engine 音量 0→0.7                      # ★ Start 点击 = 音频解锁手势
```

**2019 设计意图**：Start 按钮的第一功能是**满足浏览器自动播放策略**（用户手势后才能出声），第二功能是把重系统构建（物理/车/全部 Section）推迟到用户确认之后——加载页只有地板和两张 base64 图。

### 7.2 folio-2025：无按钮，"任意输入即开始"（`Reveal.js` 三步状态机）

```text
Game.init 完成 → ticker.wait(3) → reveal.updateStep(0)（Reveal.js L51-148）
  step 0：
    intro.circle.hide()          # 加载圆环缩没（Intro.js L88-113，power4.in 1.5s）
    grid.show()                  # 出生点网格地板亮起
    gsap distance 0→3.5          # ★ reveal 半径撑开 3.5m：材质里
                                 #   distanceToCenter > distance 的像素被 discard
                                 #   （MeshDefaultMaterial 的 hasReveal 节点）
                                 #   —— 世界只"存在"出生点一圈
    view.zoom 0.6→0.3            # 相机缓推
    intro.setText()              # 按输入模式显示 "WASD to drive" 贴图标签
    intro.setSoundButton()       # 声音开关（rayCursor 球形拾取，Intro.js L236-251）
    注册 introStart 动作（L139-141）:
       keys = [Gamepad.cross, Enter, ↑, ↓, W, D]   # ★ 驾驶键本身就是开始键
    rayCursor.addIntersect(Sphere(出生点, 3.5))     # 鼠标点地面圆圈也能开始
  ↓ 任意输入/点击（或 URL #skip 直跳）
  step 1（L149-210）：
    audio.init() + reveal 音效    # 此时才有用户手势，合法解锁 Howler
    gsap distance 3.5→30 (back.in) → onComplete: distance = 99999   # 全世界揭示
    intro.hideLabel()
    inputs.filters.clear(); filters.add('wandering')   # ★ 输入上下文切换：
                                                       #   intro 动作失效，驾驶动作生效
    view.zoom → 0（正常跟车）
  step 2（L211-227）：
    interactivePoints.recover()   # 交互点开始按距离显隐
    world.step(2)                 # 最后一批内容（Whispers 在线火苗）
    grid.destroy(); intro.destroy()   # ★ 开场对象彻底析构（几何/材质/纹理 dispose）
    server.start()                # WebSocket 此刻才连
    menu.preopen()
```

进度圆环的实现值得单独记（`Intro.js` L51-114）：RingGeometry + `atan(position.y, position.x)` 算像素角度 → `angleProgress > smoothedProgress` 的像素 discard——**加载进度条本身是个极坐标 shader**，`smoothedProgress` 每帧向真实进度指数缓动（L311-314），进度跳变也显得丝滑。

### 7.3 两代对比与本站结论

| 维度 | 2019 | 2025 | 本站 `/world/` 采用 |
|------|------|------|-------------------|
| 开始手势 | 开车进区/点击/Enter，显式 "Start" 标签 | 任意驾驶键/点击圆圈，无按钮 | **HTML 首页的 "Start here · 进入试验场" 按钮**承担 2019 式显式入口；进入 `/world/` 后用 2025 式"任意输入揭示世界" |
| 音频解锁 | Start 点击 | 第一次输入（step 0→1） | 同 2025：进场手势即解锁 |
| 重系统构建时机 | Start 之后（`start()` L60-79） | 加载期间全建好，Start 只做揭示 | 同 2025（wasm 与 GLB 并行预载），但保留 2019 的"HTML 层先交互"精神：`/world/` 路由本身按需加载 |
| 进度条 | 地面边框 uLoadProgress | 地面圆环极坐标 shader | 圆环方案（成本 60 行） |
| 教学 | 物理实体方向键（撞得动，IntroSection.js L69-108） | 贴图标签 + 键盘图标 | V1 贴图标签；V2 可上物理方向键彩蛋 |
| 揭示视效 | matcap uRevealProgress 全局渐显 | reveal 半径圆形擦除 + discard | 圆形擦除（更有"世界生长"感） |

---

## 8. 资产清单：体积 Top 20 与删减策略

### 8.1 folio-2025 `static/`（197MB）目录排行

| 目录 | 体积 | 内容 | 本站需要？ |
|------|------|------|-----------|
| `sounds/` | **152MB** | 其中 `musics/` 148MB | ❌ 音乐自备（见 8.3） |
| `projects/` | 15MB | 项目截图 PNG | ❌ 换本站案例图 |
| `ui/` | 9.2MB | 地图 PNG、按键图标 | ❌ |
| `lab/` | 8.4MB | Lab 项目截图 | ❌ |
| `areas/` | 3.8MB | 分区模型 areas.glb 等 | ❌ 自建 |
| `draco/` | 3.6MB | Draco 编解码器（含 encoder，运行时只需 decoder） | 🔶 本站已有 |
| `terrain/` | 1.4MB | 地形模型+数据纹理 | ❌ 自建 |
| `fonts/` | 796KB | Amatic SC 等 | ❌ |
| `vehicle/` | 596KB | ★ 车模型 default.glb | ❌ 本站用 CarConcept |
| `basis/` | 584KB | KTX2 transcoder | 🔶 本站已有 |
| `scenery/` | 312KB | 整岛装饰层合并网格 | ❌ |

### 8.2 单文件体积 Top 20（`du -b` 实测）

| # | 文件 | 体积 | 判定 |
|---|------|------|------|
| 1 | `sounds/musics/Boy.wav` | 44.7MB | ★ 三个 .wav 共 129.7MB=仓库 66%。**同目录已有同名 .mp3（6MB 级），wav 疑似忘删的母带**——教训：压缩管线要有"禁 wav 出库"检查 |
| 2 | `sounds/musics/Baguira.wav` | 42.6MB | 同上 |
| 3 | `sounds/musics/Sudo.wav` | 42.4MB | 同上 |
| 4 | `sounds/musics/Boy.mp3` | 6.2MB | 实际加载的是这批 mp3 |
| 5 | `sounds/musics/Baguira.mp3` | 5.9MB | |
| 6 | `sounds/musics/Sudo.mp3` | 5.9MB | |
| 7 | `areas/areas.glb` | 3.1MB | 16 分区全部结构（压缩后另有 -compressed 版） |
| 8 | `ui/map/map-day.png` | 1.6MB | 小地图底图 |
| 9 | `ui/map/map-night.png` | 1.4MB | |
| 10 | `projects/images/chartogne-taillet-3.png` | 0.9MB | 项目截图 |
| 11 | `draco/gltf/draco_encoder.js` | 0.9MB | ★ encoder 不该出现在运行时目录 |
| 12 | `draco/draco_encoder.js` | 0.9MB | 同上（重复！） |
| 13 | `projects/images/orano-3.png` | 0.9MB | |
| 14 | `lab/images/attractors.png` | 0.8MB | |
| 15 | `projects/images/chartogne-taillet-2.png` | 0.8MB | |
| 16 | `lab/images/black-hole.png` | 0.7MB | |
| 17 | `projects/images/prior-3.png` | 0.7MB | |
| 18 | `projects/images/orano-2.png` | 0.7MB | |
| 19 | `terrain/terrain.glb` | 0.7MB | 全岛地形（惊人地小——低多边形+Draco 的威力） |
| 20 | `draco/draco_decoder.js` | 0.7MB | 真正需要的 decoder（wasm 版更小） |

**核心洞察**：去掉 wav 母带、encoder、原始 png（运行时用 .ktx/-compressed.glb），**实际网络传输的世界本体 <15MB**：地形 0.7MB + 分区 3MB + 车 0.6MB + 装饰 0.3MB + 若干 KTX。**一个 14 分区开放世界的 3D 负载与一张高清海报同数量级**——这就是 palette+合并网格+Draco+KTX2 管线的终点形态，也是本站 Lighthouse 门禁下做 `/world/` 的可行性证明。

### 8.3 对比 folio-2019 static/（18MB）与本站预算

2019：sounds 7.3MB + models 5.6MB + draco 3.6MB + social 1.1MB。**没有音乐只有音效**，总量是 2025 的 1/11。
本站 `/world/` V1 预算建议：模型 ≤5MB + 音效 ≤2MB（**不上 BGM**，或流媒体外链）+ 解码器 4MB（已有）≈ **首入 ≤8MB**，与现有 TTS Demo（约 6MB）同级。

---

## 9. 移植到 Astro `/world/` 的最小文件集

### 9.1 必抄清单（14 个模块，≤15 约束内）

从 folio-2025 借鉴、按依赖顺序排列。"改写量"指转 TypeScript + 去 Game 单例耦合之外的逻辑改动：

| # | 目标文件（本站） | folio-2025 源 | 行数 | 改写量 |
|---|----------------|--------------|------|--------|
| 1 | `world/core/Events.ts` | `Game/Events.js` | 64 | **零**（加类型） |
| 2 | `world/core/Ticker.ts` | `Game/Ticker.js` | 71 | 低：TSL uniform 四件套保留；`scale` 默认 2 |
| 3 | `world/core/Game.ts` | `Game/Game.js` | 276→~120 | 中：系统列表换成本清单 4-14 项，两阶段结构照抄 |
| 4 | `world/core/Viewport.ts` | `Game/Viewport.js` | 48 | 零 |
| 5 | `world/core/Quality.ts` | `Game/Quality.js` | 48 | 零 |
| 6 | `world/core/ResourcesLoader.ts` | `Game/ResourcesLoader.js` | 123 | 低：loader 路径接本站 `public/` |
| 7 | `world/rendering/Rendering.ts` | `Game/Rendering.js` | 184 | 低：postprocessing 可先只留 bloom 或全砍 |
| 8 | `world/physics/Physics.ts` | `Game/Physics/Physics.js` | 313 | 低：分组/工厂/碰撞事件全保留 |
| 9 | `world/physics/PhysicsVehicle.ts` | `Game/Physics/PhysicsVehicle.js` | 590 | 低：参数表原封不动起步，再调 |
| 10 | `world/core/Objects.ts` | `Game/Objects.js` | 362 | 低：Blender 命名约定原样保留 |
| 11 | `world/inputs/`（4 文件算 1 模块） | `Inputs/Inputs.js`+`Keyboard`+`Pointer`+`Nipple` | ~850 | 中：V1 砍 Gamepad/Wheel/InteractiveButtons |
| 12 | `world/player/Player.ts` | `Game/Player.js` | 676→~200 | 中：砍音效注册/成就/里程，留意图层+respawn+自救 |
| 13 | `world/view/View.ts` | `Game/View.js` | 788→~350 | 中：留 focusPoint/zoom/spherical/optimalArea，砍 speedLines/cinematic/mapControls |
| 14 | `world/world/Zones.ts` + `Respawns.ts` + `References.ts`（三小件算 1 模块） | 对应三文件 | 198 | 零 |

**合计约 3,900 行源码 → 预计 2,800 行 TS。**

配套但不算"借鉴模块"的自建件：`world/world/World.ts`（灰盒场景，自写）、`world/world/Intro.ts`（按第 7.2 节重写，~150 行）、Astro 端 `src/pages/world.astro` + `client:only` 挂载壳。

### 9.2 明确不抄、必须重写/自建的部分

| 部分 | 原因 | 本站方案 |
|------|------|---------|
| 全部 `World/Areas/*` 内容类 | Bruno 的人生内容 | 自建六分区（出发广场/案例岛/实验区/档案馆/控制塔/联络站） |
| `static/` 全部资产 | 版权虽 MIT 但复用=抄袭观感 | 灰盒 → Kenney/Quaternius CC0 → 自建 Blender |
| `MeshDefaultMaterial` 风格化 | 深度绑定 Bruno 美术方向 | V1 标准 PBR + 本站 HDRI；V2 再定义自己的风格化 |
| `Audio.js` 的 152MB 音乐生态 | 体积 | 本站 TTS mp3 做环境声 + freesound 音效 ≤2MB |
| `Server.js`/`Whispers`/`Achievements` | 依赖闭源服务端/V1 范围外 | 砍 |
| Stylus 样式层 | 本站有设计系统 | Astro 组件 + 现有 tokens |
| `Menu/Modals/Tabs` DOM 框架 | 与 index.html 结构耦合 | Astro island 重写，语义一致 |

### 9.3 Vite/Astro 配置(astro.config.mjs 需加)

```js
// folio-2025/vite.config.js L28-30 的等价物：
vite: {
  plugins: [wasm(), topLevelAwait()],   // @dimforge/rapier3d 必需
  // three/webgpu 与解码器本站已就绪，无需其他改动
}
```

---

## 10. 车 → 机器人 morph：基于 folio 架构的插入点设计

folio 两代都**没有变形玩法**（2025 只有换涂装，`VisualVehicle.setPaints` L129+）。但其架构为 morph 预留了天然缝隙——以下每个插入点都对应源码中已存在的模式。

### 10.1 形态即"视觉+物理+输入+相机"四元组的原子切换

folio 已把这四层解耦到可独立热切：

| 层 | folio 已有机制（源码证据） | morph 复用方式 |
|----|--------------------------|---------------|
| 物理 | `PhysicsVehicle.activate()/deactivate()`（L580-590）：`setEnabled(false)` 即冻结底盘 | 车形态 disable → 机器人胶囊体 enable（Rapier `KinematicCharacterController`，folio 无此件需新写 ~200 行） |
| 视觉 | `VisualVehicle.destroy()`（L37-59）干净反注册；构造函数接收任意 model（L13） | 不销毁，仅 `visible` 互换 + 变形过渡动画 |
| 输入 | `Inputs.filters` ObservableSet（`Inputs.js` L23-40）：`wandering/racing/cinematic` 上下文；`Reveal.js` L174-175 已示范整组切换 | 新增 `driving`/`walking` 两个 category；morph 时 `filters.clear(); filters.add('walking')` ——**驾驶键自动失效、步行键自动生效，零 if 判断** |
| 相机 | `View.MODE_DEFAULT/FREE` 模式机（`View.js` L19-20, L105-114）+ zoom 三级 | 新增 `MODE_SHOULDER`（肩后近距）；morph 时 gsap 补间 spherical 参数 |

### 10.2 建议新增模块：`TransformSystem`（唯一的核心新代码）

```text
world/player/TransformSystem.ts   （新写，~250 行）

状态机：CAR ⇄ TRANSFORMING_TO_ROBOT / TRANSFORMING_TO_CAR ⇄ ROBOT
（状态常量模式仿 Player.js L10-11 的 STATE_DEFAULT/STATE_LOCKED）

tick order 插入位置：order 1.5（Player 意图层之后、物理之前）
  —— folio 的 order 是浮点可插空的（Events.js L54 for...in 数字键升序）

事件链（全部走既有总线）：
  inputs 'morph' 动作（绑 Keyboard.KeyT / Gamepad.triangle）
    → transformSystem.request()
    → 前置检查：physicsVehicle.speed < 0.7（复用 stop 检测器的阈值语义，
       PhysicsVehicle.js L207-208）且四轮着地（wheels.inContactCount == 4）
    → state = TRANSFORMING：
         player.state = STATE_LOCKED        # 复用既有锁（Player.js L529-530 会自动
                                            #   清零 accelerating/steering）
         inputs.filters 切到 'cinematic'    # 过渡期间任何操控无效
         视觉过渡（V1 遮蔽式）：
           gsap 时间线 1.2s：
             0.0s  能量光环粒子 + 相机 zoom 推近（复用 Reveal 的 distance 圆环节点
                   做"变形波纹"，Reveal.js L15-19 的 uniform 组直接复用）
             0.4s  vehicle.visible=false; robot.visible=true（遮蔽峰值时瞬切）
             0.4s  physicsVehicle.deactivate(); characterController.activate(
                       physicsVehicle.position)     # 位姿无缝交接
             1.2s  onComplete → state = ROBOT
         inputs.filters 切到 'walking'；view 切 MODE_SHOULDER
    → events.trigger('morphed', ['robot'])   # 供音效/成就/教学提示订阅
```

**为什么插在 order 1.5 而不是别处**：morph 决策要读 Player 意图（order 1 产出）、要在物理 step（order 3）前冻结/启用刚体，且 postPhysics 状态读回（order 5）必须已经指向新形态的 body——1.5 是唯一无竞态的槽位。

### 10.3 机器人形态所需配套（folio 无参考，标注实现来源)

| 件 | 来源 | 规模 |
|----|------|------|
| `PhysicsCharacter.ts`：胶囊体 + Rapier KCC（`world.createCharacterController`，官方 API：autostep/maxSlope/snapToGround） | Rapier 官方文档 | ~200 行 |
| 步行输入映射：`walking` 类目下 forward/strafe/jump | 仿 `Player.js` L220-239 动作表 | ~60 行 |
| 机器人模型与走跑动画 | three `AnimationMixer` crossFade（folio 全程未用骨骼动画，无参考） | 美术为主 |
| V2 真变形动画（零件飞行重组） | Blender 分块 action + 约束烘焙 | 全链路最大风险项，V1 不做 |

### 10.4 叙事挂点

morph 不是炫技孤岛：机器人形态触发 `morphed` 事件后，案例岛的 InteractivePoints 文案可切换视角（车=交付载体讲"跑起来的工程"，机器人=座舱 AI 人格讲"会说话的智能"）——事件订阅方只需要 `game.transformSystem.events.on('morphed', cb)`，与 folio 成就系统订阅 `flip` 事件（`Player.js` L444-453）完全同一模式。

---

## 11. 与本仓库 `src/scripts/car-configurator/` 的 diff 矩阵

本站现有 3D 资产：`app.ts`（479 行）+ `presets.ts`（119 行），静态展示型配置器。逐能力对照 folio-2025，标注复用/升级/新建：

| 能力 | car-configurator 现状（行号） | folio-2025 对应（行号） | 差距 | `/world/` 动作 |
|------|------------------------------|------------------------|------|---------------|
| 渲染器 | `WebGPURenderer` + `forceWebGL` query 开关 + `renderer.init()`（app.ts L67-79） | 同款 + `sortObjects=false` + renderOrder 排序（Rendering.js L40-60） | 无本质差距 | **复用**；补 sortObjects 优化 |
| 帧循环 | 自管 rAF + `needsRender` 脏标记按需渲染（L193-219） | 渲染器驱动 Ticker + 常驻循环（Rendering.js L68） | **理念相反**：配置器省电 vs 游戏恒跑 | **新建** Ticker；配置器保持现状不动 |
| 时序架构 | 无系统分层，闭包内联 | order 0-999 事件总线 | 质变点 | **新建**（Events+Ticker，135 行） |
| 资产加载 | GLTF+Draco+KTX2+HDR，LoadingManager 进度（L82-99） | 同三件套 + 两批加载 + 缓存 Map（ResourcesLoader.js） | 小 | **升级**为 ResourcesLoader 模式 |
| 物理 | 无 | Rapier + vehicle + KCC | 从零 | **新建**（第 9 节 #8-9） |
| 输入 | OrbitControls 拖拽 + DOM 按钮事件（L410-438） | 三模式动作层 | 从零 | **新建**（第 9 节 #11） |
| 相机 | OrbitControls + `flyTo` 补间运镜（L228-242）+ 分区视角表 VIEWS（L165-169） | View 跟随相机 + optimalArea | 用途不同 | **新建** View；`flyTo`/`orbitPos` 工具函数**可迁移**进 View 的 cinematic 模式 |
| 补间 | 自写 addTween 队列（L172-191，60 行） | GSAP 全家桶 | folio 重度依赖 gsap timeline | **决策点**：`/world/` 引入 gsap（Reveal/morph 的 timeline 复杂度自写不划算）；配置器保持零依赖 |
| 材质切换 | KHR_materials_variants 解析 + 材质参数 lerp（L296-382） | Materials 注册表 + palette | 思路同源（按名字索引材质） | 配置器方案**反哺** `/world/`：机器人/车的涂装系统直接用 variants 模式 |
| 阴影 | Canvas 径向渐变接触阴影（L37-48，零 GPU 开销） | 真实 shadow map + TSL 重着色 | 静态 vs 动态 | `/world/` 需真阴影（车会动）；接触阴影保留给 Hero 舞台 |
| 环境光 | HDRI equirect（L103-106） | 无 IBL，风格化直光 | 美术路线分叉 | V1 沿用 HDRI（省一套光照调参）；V2 若走风格化再换 |
| 降级/无障碍 | `prefers-reduced-motion`（L59）+ 离屏暂停 IntersectionObserver（L469-474）+ DPR 封顶（L75） | Quality 二级 + pixelRatio 控制 | 各有所长 | **双向合并**：Quality 系统吸收 reduced-motion 与离屏暂停——folio 没做的本站强项 |
| URL 状态 | `?livery=&paint=&wheels=` 分享（L285-294, L400-408） | `#debug/#stats/#skip` hash 开关 | 同类 | `/world/` 采用两者：`#debug` 调试 + `?spawn=` 直达分区（对应 `VITE_PLAYER_SPAWN`，Game.js L111） |
| 挂载方式 | `mountCarConfigurator(root)` 动态 import，three 不进首屏 bundle（L1-4 注释） | 单页应用整包 | 本站强项 | `/world/` 沿用 mount 模式：`world.astro` 壳 + 交互后 import |

**汇总**：配置器与 folio-2025 在"渲染与资产层"完全同源（three/webgpu + 三件套 loader），可平移的还有 flyTo 运镜、variants 涂装、降级三件套；缺口集中在"引擎层"（loop/物理/输入/相机，约 2,800 行 TS，全部有 folio 逐行参考）与"内容层"（分区/POI/灰盒场景，自建）。**配置器本身不动**——它与 `/world/` 是两个 mount 入口，共享 `public/` 解码器与未来的 `world/core/` 工具层。

---

## 12. 附：folio-2025 实测 tick order 全表

用 `rg` 对 `sources/` 全量提取 `ticker.events.on('tick', cb, N)` 的实测结果（区别于 tech.md 3.4 节的人工归纳表，本表为机器提取、逐文件核对）：

| order | 文件（多注册用 ; 分隔） |
|-------|----------------------|
| 0 | `Time.js`；`Inputs/Inputs.js` |
| 1 | `Player.js`（updatePrePhysics）；`World/Scenery.js`（默认 order 1） |
| 2 | `Physics/PhysicsVehicle.js`（updatePrePhysics） |
| 3 | `Physics/Physics.js`（world.step + 碰撞事件） |
| 4 | `Physics/PhysicsWireframe.js`；`Objects.js`（物理→视觉同步） |
| 5 | `Physics/PhysicsVehicle.js`（updatePostPhysics） |
| 6 | `Player.js`（updatePostPhysics） |
| 7 | `View.js`（跟随相机） |
| 8 | `World/Intro.js`；`Cycles/Cycles.js`；`Weather.js`；`Zones.js`；`World/VisualVehicle.js` |
| 9 | `Wind.js`；`Ligthing.js`；`Tornado.js`；`InteractivePoints.js`；`Tracks.js` |
| 10 | `Fog.js`；`Reveal.js`；`Terrain.js`；`Trails.js`；`World/Areas/Area.js`；`World/` 下全部环境元素（Grass/Leaves/Snow/RainLines/WaterSurface/Foliage/Floor/Whispers/Lightnings/VisualTornado/ExplosiveCrates/Bricks/Fences/Lanterns/Benches）；`BlackFriday/*` |
| 13 | `InstancedGroup.js`（统一提交 instanceMatrix） |
| 14 | `Audio.js`；`Notifications.js`；`Map.js`；`Title.js` |
| 998 | `Rendering.js`（postProcessing.render） |
| 999 | `Monitoring.js`（已注释停用） |

本站 `/world/` 的 order 约定直接继承此表，并在 1.5 插入 `TransformSystem`（第 10.2 节）、在 2 与车辆控制器并列插入 `PhysicsCharacter`（机器人形态时二选一激活）。

---

## 13. 附：本文档核对清单（写给未来维护者）

- 行号基线 = 第 1.1 节两个 SHA。上游若更新，先 `git -C vendor/folio-2025 log -1` 对照再改文。
- folio-2025 的 `Ligthing.js` 是**原文拼写错误**（应为 Lighting），引用时保持原名。
- `Ticker.scale = 2` 出现在第 3/5/9 节的所有参数语境里——任何"folio 参数抄过来不对劲"的问题先查这里。
- 2019 版是 Z-up 世界，任何从 2019 抄的向量代码都要做轴变换；建议一律以 2025 为准。
- 本文与 tech.md 的分工：tech.md 第 3-8 节讲系统原理，本文第 2/4/5 节给到行号与参数值；重复处以本文（更新的 commit 基线）为准。
