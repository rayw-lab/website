# 赛博科技城镜头/POI Shot 注册表规范（CC-CAM-DES）

| 项 | 内容 |
|----|------|
| Task | **CC-CAM-DES**（CC-CAM 批次四路之一，入口 `docs/research/cyber-city-camera-poi-research.md` §4） |
| 分支 | `cursor/cc-cam-shot-registry-design-1d6f`（base：`main`） |
| 日期 | 2026-08-27 |
| 性质 | **只设计，不实现**——本 Task 零 `src/lab`、零 `src/data`、零 `e2e/` 改动 |
| 上游输入 | 相机批次入口调研 · rubric v1.1 §4 协议 A/B（robot_idle 主帧合同）· `cyber-city-buildings.json`（parkingBay/position 单源）· `Areas.ts`（?poi= 仅改出生的现状）· `loop-bl2-reaudit.md`（whole-frame 裁决） |
| 下游消费 | **CC-CAM-DATA**（落 `src/data/camera-shots.json` + `tools/camera/` 投影探针）· **CC-CAM-VIEW**（View/areas 接线）· **CC-AL-CAM**（Sol 审计门） |
| 姊妹文档 | `docs/research/cyber-city-camera-design.md`（游戏化功能脑暴 + rubric 映射，本 Task 同批交付） |

---

## 0. 结论先行

1. **单源注册表** `src/data/camera-shots.json`（schemaVersion `0.1.0`）：每个 shot = `anchor`（spawn/parkingBay/building/corridor 四型）+ `spherical`（θ/φ/r）+ `lookAt`（height/lateral）+ `fov` + `drift`，全部字段与 `View.ts` 城市档现有消费位一一对应（§2.6）——**零新相机模型**，VIEW 只做参数应用器。
2. **模式四分**：`ritual`（首幕恒等 poster 合同，唯一）｜`poi`（深链到站预设，Phase B 模板）｜`drive`（驾驶跟随，View 动态通道所有者）｜`showcase`（展示帧，含 `building_showcase` / `street_corridor` 两个 kind）。
3. **接线原则**：`?poi=` 语义**零改动**（仍只改出生）；新增 `?shot=` 参数 **opt-in** 消费注册表；`world-pois.json` v0 **零字节改动**（§3.3）。
4. **六个数值草案**（concept-garage / autodrive-lab / work-gallery 各 1 showcase + 1 corridor）已按 View 同款公式做**解析投影自检**：目标楼包络 8 角点全部入帧且逐 shot contract 断言全 PASS（1440×900 / FOV 42°），宽度占帧 40%–78%，BL2 西肩塔 32m headroom 探针 y_ndc ≤ 0.79（§4）——直接承接 AL-BL2 复审「whole-frame 可读轮廓」最小补洞。
5. **poster 红线**（§6）：`ritual_idle` 注册值必须与 `View.ts` 常量**逐位相等**（CI 恒等探针）；一切新 shot 仅 `?shot=` 显式可达；触发 poster 三面重拍的行只有 P-1/P-7/P-8，且**永远排所在批次最后**（CC-POSTER-RESHOT 单列任务书）。

## 1. 现状与设计约束（代码事实）

| 事实 | 定位 | 设计后果 |
|------|------|---------|
| 城市档相机 = FOV 42° / 极角 φ75°（俯角 15°）/ θ25° / 静止斜距 20m（edges {16,26} × baseRatio 0.6）/ lateral 4.2 / lookAtHeight 3.4 / 慢 yaw ±1.1° | `src/lab/world/view/View.ts`（CC-E7 + CC-L1 A4 + CC-L4 B5 注释链） | 这组常量即 `ritual_idle` shot 的合同值；schema 每个字段都有现成消费位 |
| `?poi=` 仅改写出生点到 parkingBay，**不改镜头**；ritual 模式深链出生让位首幕锚点 | `src/lab/world/areas/Areas.ts` `applyDeepLink()` · `src/lab/world/index.ts` | `?shot=` 独立成参，与 `?poi=` 正交组合（§3.2） |
| robot_idle 水平视锥 ±31.6°（1440×900），x≥110 东向楼**几何不可入帧**；抬高楼顶无解 | AL-BL2 复审 §2.1（投影实测 + 几何论证） | 不在 ritual 帧上追逐东向楼；东向楼收益全部走专用 showcase/corridor shot |
| `?poi=work-gallery` 固定沿街帧被裁定为**可接受的 whole-frame 替代场地**，但当前构图冠环被顶缘裁切 → NO-GO | AL-BL2 复审 §2.2/§2.3 | corridor shot 即该场地的注册表化 + 构图改良（视线上抬、锚点进街）；showcase shot 承担「整楼轮廓 8 角点入帧」硬门 |
| poster 三面（桌面 webp ≤40KB / 移动 9:16 / OG 同 URL）绑定 robot_idle 主帧，「一拍三吃」 | `src/pages/index.astro`（[CC-L2 A10] 注释）· rubric §4 协议 B | ritual_idle 恒等 = poster 免重拍前提（§6 矩阵） |
| G5 红线禁 free 相机；`camera-controls` 用户接管被裁决排除 | 相机批次入口 §5 · View.ts 头注释（free 相机已砍） | 一切 shot 均为**数据驱动预设**；任何驾驶意图输入 → 回 drive 跟随（既有 focusActions 机制） |
| 变形运镜通道 dollyIn/shakeY 以「0 时逐位恒等」保 poster 零漂移 | View.ts `RITUAL_DOLLY_MAX` 注释 | 恒等纪律的既有先例，注册表恒等探针照此口径 |

## 2. 注册表 schema（`src/data/camera-shots.json`，交 CC-CAM-DATA 落地）

### 2.1 顶层结构

| 字段 | 类型 | 语义 |
|------|------|------|
| `schemaVersion` | string | `"0.1.0"` 起步。**加字段（向后兼容）= minor +1；破坏性变更 = major +1**（与 `world-pois.json` 「破坏性变更 schemaVersion +1」同纪律） |
| `task` | string | 落地批次 id（`"CC-CAM-DATA"`） |
| `updatedAt` | string | ISO 日期 |
| `docs` | string | 指回本规范路径 |
| `buildingsSource` | string | `"src/data/cyber-city-buildings.json"`（anchor 外键的唯一事实源） |
| `deepLink` | object | `{ "param": "shot", "aliasSeparator": "." }`——`?shot=` 参数契约声明（与 world-pois.json `deepLink` 块同风格） |
| `defaults` | object | 全局缺省：`{ fov: 42, phiDeg: 75, lookAtHeight: 3.4, lateral: 0, drift: null, nonIdealRatioOffset: 9 }`。shot 未写字段回落 defaults |
| `shots[]` | array | shot 条目（§2.2） |

**打包纪律**：camera-shots.json 归 city/areas 懒分包域（`?shot=`/`?poi=`/`?city=1` 路径才加载）——默认灰盒路径**零新增字节**；预估 +3KB gzip 级，world JS 预算 86/900KB 富余充足。

### 2.2 shot 条目字段

| 字段 | 类型 | 必填 | 语义 |
|------|------|:---:|------|
| `id` | string | ✓ | 全局唯一，`^[a-z]+[a-z0-9_]*(\.[a-z0-9-]+)?$`；命名约定 `<族>.<锚引用>`（如 `showcase.concept-garage`）；`ritual_idle` / `drive_follow` 两个单例免后缀。**id 一经发布不变**（深链稳定性，与 POI id 同纪律） |
| `kind` | enum | ✓ | 模板族：`ritual_idle` \| `drive_follow` \| `poi_arrival` \| `building_showcase` \| `street_corridor` |
| `mode` | enum | ✓ | 消费上下文：`ritual` \| `poi` \| `drive` \| `showcase`（§2.5 状态机） |
| `alias` | string | — | 深链短名（`"showcase"` / `"corridor"`）：`?poi=X&shot=<alias>` 解析为 `<alias>.X`（§3.1） |
| `anchor` | object | ✓ | 焦点锚（§2.4）：`{ type, ref?, roadId?, s? }` |
| `buildingRef` | string | — | 证据目标楼外键（探针 contract 的被测对象；corridor shot 的 anchor 在路上，靠本字段声明目标楼） |
| `spherical` | object | ✓ | `{ thetaDeg, phiDeg, radius }`；`radius` 为**数值**（静态机位）或 `{ min, max, baseRatio }`（跟随档收放带，仅 ritual/drive 用） |
| `lookAt` | object | ✓ | `{ height, lateral }`：视线目标离地高（米）+ 相机右向平移（米，构图偏轴件） |
| `fov` | number | — | 垂直 FOV（度），缺省 42。**镜头纪律：v0 全部 shot 统一 42°**，字段为 Phase B 留位（长焦压缩等），避免逐 shot 变焦破坏「同一世界」观感 |
| `drift` | object \| null | — | 慢 yaw 呼吸 `{ amplitudeDeg, angularSpeed }`（θ += amplitude·sin(elapsed×speed)）；`reduced-motion` 用户强制归零（View 既有纪律）。静态取证帧探针按 drift=0 计算 |
| `transition` | object | — | Phase B 留位：`{ durationMs, easing }`（E 键进站缓动、shot 间切换）；v0 不消费 |
| `contract` | object | ✓ | 探针断言（§5）：`identityWithView` 或投影断言组 |
| `notes` | string | — | 构图意图一句话（人读） |

### 2.3 坐标/角度约定与相机解算公式（与 View.ts 恒等）

世界坐标沿用 buildings JSON：**+X=东，+Z=南，+Y=上**；地面 y=0。角度约定沿用 three.js 球坐标（`setFromSphericalCoords`），**与楼数据的 heading（0=北顺时针）是两套约定，注册表只用前者**：

- `thetaDeg`（方位角）：从 +Z（南）起算——**θ=0° 机位在锚点正南、视线朝北；θ>0 机位向东偏，θ<0 向西偏**。现 ritual θ=25° = 机位南偏东、视线朝北压中轴大道（View.ts 注释口径一致）。
- `phiDeg`（极角）：90° 为水平；**俯角 = 90 − φ**。现 ritual φ=75°（俯角 15°）。
- 解算（静态 shot，drift 略）：

```text
A        = 锚点解析 (x, 0, z)                       # §2.4
offset   = (r·sinφ·sinθ,  r·cosφ,  r·sinφ·cosθ)
right(θ) = (cosθ, 0, −sinθ)                          # 相机右向
camera   = A + offset + lateral·right(θ)
lookAt   = A + lateral·right(θ) + (0, height, 0)
r        = radius + ratioOverflow × nonIdealRatioOffset   # 窄视口补偿，见下
```

与 `View.update()` 的 focusPoint→spherical→lateral→lookAt 流水线逐项对应（§2.6）。**窄视口补偿**：静态 shot 沿用 View 既有 `nonIdealRatioOffset`（9）通道——1440×900（ratio 1.6 < 16:9）下 overflow ≈ 0.111 → r +1.0m；本文 §4 草案数值按 ideal 16:9 口径给出，断言 margin 已覆盖该量级差异，DATA 探针须双口径复核。

### 2.4 anchor 解析规则（四型）

| type | 附加字段 | 解析为 | 消费者 |
|------|---------|--------|--------|
| `spawn` | — | `world.spawn.position`（buildings JSON，现 (0,0) 十字路口） | `ritual_idle` / `drive_follow` |
| `parkingBay` | `ref`（building id） | `buildings[ref].parkingBay` 的 (x,z) | `poi_arrival` 模板（Phase B） |
| `building` | `ref`（building id） | `buildings[ref].position` 的 (x,z)（楼体足迹中心） | `building_showcase` |
| `corridor` | `roadId` + `s` | 路轴上一点：east-west 路 → (x=s, z=0)；north-south 路 → (x=0, z=s)。`roadId` 外键 `world.roads[].id`，\|s\| ≤ range 且避让楼体足迹 | `street_corridor` |

**锚是世界固定点，不随玩家**——镜头取景与出生点解耦（`?poi=` 改出生、`?shot=` 改取景，正交）。玩家是否入帧由 shot 构图自己负责（如 `showcase.autodrive-lab` 泊车位天然在帧内近景，进站叙事连续）。

### 2.5 mode 语义与状态机优先级

| mode | 语义 | 进入 | 退出 |
|------|------|------|------|
| `ritual` | 首幕合同帧（唯一 `ritual_idle`）。**恒等合同：不是可调参数，是登记面** | `?ritual=1` | TransformSystem car_ready → `drive` |
| `drive` | 驾驶跟随（zoom 速度拉远 / dollyIn / shakeY / roll 动态通道全部 **View 所有**，不入注册表数值面） | 任何驾驶意图输入（既有 focusActions 清单） | — |
| `poi` | 深链到站预设（Phase B：进触发圈停稳的半程取景模板，按 parkingBay heading 派生） | 触发圈事件（Phase B） | 驾驶意图输入 → `drive` |
| `showcase` | 展示帧：`building_showcase`（整楼轮廓证据帧）+ `street_corridor`（沿街整帧场地） | `?shot=` 深链 / E 键进站前奏 / 巡礼编排（设计见姊妹文档） | 驾驶意图输入 → `drive`；`Esc` 同 |

**静态 shot 的 View 姿态**（交 VIEW 实现）：应用 shot = `focusPoint.isTracking=false` + `magnet.active=false` + 焦点置锚点 + 参数组切换；任何 focusAction → 恢复 `drive_follow` 参数组 + isTracking=true（现有机制原样）。切换建议 0.6–0.8s 缓动（V5 收益），`reduced-motion` 直切——v0 硬切可接受，由 VIEW 裁量。

### 2.6 字段 ↔ View.ts 消费位映射（零新相机模型的证明）

| schema 字段 | View.ts 消费位 | ritual 现值 |
|-------------|----------------|------------|
| `anchor` 解析点 | `focusPoint.trackedPosition / position / smoothedPosition` | spawn (0,0) |
| `spherical.thetaDeg` | `spherical.theta` | 25° |
| `spherical.phiDeg` | `spherical.phi` | 75° |
| `spherical.radius`（对象） | `spherical.radius.edges` + `zoom.baseRatio` | {16,26} + 0.6 → 静止 20m |
| `spherical.radius`（数值） | 收拢 edges 为 {r,r}（静态焦点下速度变焦通道天然惰性） | — |
| `lookAt.height` | `lookAtHeight`（现 readonly，VIEW 改为 shot 应用器可写） | 3.4 |
| `lookAt.lateral` | `framing.lateral` | 4.2 |
| `fov` | `camera.fov` + `updateProjectionMatrix()` | 42 |
| `drift` | `framing.thetaDrift`（reduced-motion 归零既有纪律） | ±1.1° / 0.13 rad·s⁻¹ |
| —（不入 schema） | `ritualCam.dollyIn/shakeY`、zoom 速度拉远、`roll`、`nonIdealRatioOffset` 补偿 | View 运行时动态通道，叠加在注册值之上 |

### 2.7 校验规则（构建期 + 探针）

- id 唯一、正则合法；`alias.buildingRef` 组合唯一（深链解析无歧义）。
- 外键完整：`anchor.ref`/`buildingRef` ∈ buildings JSON id；`roadId` ∈ `world.roads[].id` 且 \|s\| ≤ range。
- 数值域：`phiDeg ∈ [55, 88]`（禁贴地/禁顶视）；`thetaDeg ∈ (−180, 180]`；静态 `radius ∈ [10, 130]`（far clip 200 留天际线余量）；`fov ∈ [25, 60]`；`lookAt.height ∈ [0, 45]`；`|lateral| ≤ 12`。
- `mode=ritual` 的 shot 必须 `contract.assert === "identityWithView"` 且全 JSON 仅一条。
- 落地方式：先随 DATA 探针脚本硬校验（CI 非零退出），zod 构建期校验与 world-pois.json 外键校验一起归 CC-E8 管线既有待办。

## 3. 与 `?poi=` / `?shot=` / world-pois.json 的接线（交 CC-CAM-VIEW）

### 3.1 参数流

1. **壳层**：`/`（index.astro）与 `/world-spike/` 两处 `PARAM_ALLOWLIST` 七参数 → 八参数（增 `'shot'`）。M4/M6 纪律不变：壳只透传白名单，引擎吃 `opts.params`，无 `location.search` 旁路。
2. **引擎入口**（`src/lab/world/index.ts`）：`shot` 参数存在 → 隐含挂城（与 `?poi=` 同纪律）→ city 就位后把 slug 交给 shot 应用器（随 areas/city 懒分包）。
3. **解析**：`?shot=` 值先按**全 id** 查注册表；查不到且存在 `?poi=X` 时按 **alias** 拼 `<alias>` + `.` + `X` 再查（`showcase` → `showcase.concept-garage`）。无效值 `console.warn` + 候选清单 + 回落现行为——**不阻断**，与 `?poi=` 无效 slug 同纪律。

### 3.2 组合优先级矩阵

| URL 组合 | 出生点 | 初始镜头 | 与现状的差 |
|----------|--------|----------|:---:|
| （无参 / `?city=1`） | 各自现状 | 灰盒 folio 档 / drive_follow | **零** |
| `?ritual=1`（含 `&shot=…`） | world.spawn | `ritual_idle` 恒等；**`?shot` 忽略 + warn**（v0，poster 风险最低；car_ready 后延迟应用归 Phase B 裁决） | **零** |
| `?poi=X` | X.parkingBay | drive_follow（现行为） | **零** |
| `?poi=X&shot=showcase` | X.parkingBay | `showcase.X` 静态帧；驾驶意图 → drive | 新增 |
| `?poi=X&shot=corridor` | X.parkingBay | `corridor.X` 静态帧；同上 | 新增 |
| `?shot=<全 id>`（无 poi） | world.spawn（隐含挂城缺省出生） | 指定 shot 静态帧 | 新增 |
| `?shot=<无效>` | 按其余参数 | 现行为 | 仅 warn |

### 3.3 world-pois.json 关系

- **v0 零字节改动**：POI 注册表继续只管触发圈/标点/进站 URL；镜头归 camera-shots.json，两表经 `buildingId`/`buildingRef` 共享 buildings JSON 外键——三表单源闭环：`cyber-city-buildings.json`（几何事实）← `world-pois.json`（交互语义）← `camera-shots.json`（取景语义）。
- **Phase B（minor bump）**：`pois[].defaultShotId` 可选字段——E 键进站前奏 / 触发圈停稳半程取景指到具体 shot；缺省行为不变。
- 探针须校验 camera-shots 的 `buildingRef` 同时在 world-pois 有登记（保证「有镜头必有可进站 POI」，反向不要求）。

### 3.4 e2e / VIS 影响

- 本批次（DES/DATA）零 e2e 面；`tools/camera/` 探针是独立 node 脚本，不进 Playwright 链。
- VIEW 落地门（AL-CAM 硬门，入口调研 §4 已登记）：默认路径帧行为零变化（VIS-01/02 像素基线不解锁）、VIS-03 robot_idle 恒等、e2e 52/52、指定楼 NDC 入帧探针绿。
- 新 shot 的取证帧走 `?shot=` 显式路径截图，**不新增像素基线**（先例：VIS-03/04 即非基线取证帧）。

## 4. 六个 shot 参数草案（数值级，供 CC-CAM-DATA 探针验证）

### 4.0 推导口径与自检方法

- 楼体输入（buildings JSON）：concept-garage (140,−44) 60×36×h18 · autodrive-lab (52,−52) 44×36×h60（BL1 hero GLB 包络与 footprint 同笼）· work-gallery (140,44) 56×32×h36。
- 本节数值已用 **§2.3 公式 + three r185 `PerspectiveCamera.project()`** 做解析自检（1440×900、FOV 42、drift=0、ideal-radius 口径）：下表「解算机位 / NDC」即脚本输出。该脚本即 DATA 探针的最小内核，DATA 落地时须补窄视口补偿、LoS、cameraFree 与 CI 断言化。
- **构图族谱**：showcase 承担「整楼包络 8 角点入帧」硬门（AL-BL2 最小补洞 1 的注册表化）；corridor 承担「固定沿街整帧场地」（复审认可的 work-gallery 帧同族，锚点进街 + 视线上抬改良）。corridor 对高楼只保立面带全读（塔顶裁切**有意**，整楼归 showcase——分工写进 contract，审计不再出现「一帧既要街谷又要全塔」的双重期待）。

### 4.1 `showcase.concept-garage`（building_showcase）

- **意图**：机位站上霓虹大街南侧（南偏西 35°）朝东北读整幅 60m 南立面 + 西肩；专治 BL2 两轮 NO-GO 的「塔身/屋顶阶差整帧不可读」——若 PR #43 合流，西肩螺旋塔在本帧以 headroom 探针点预留（32m 处 y_ndc 0.79，不裁顶）。
- **风险**：机位 z=17.99 在路缘外 6m 广场带（无碰撞语义，可接受）；东侧背景为 work-gallery 侧影（层次收益）。

### 4.2 `corridor.concept-garage`（street_corridor）

- **意图**：AL-BL2 复审认可场地的改良版——从 bay 帧（相机 (152.3, 6.0, 36.4)）改为走廊锚 s=104 对街斜视：更近 15m、θ=−25°（与 ritual 同族「南偏东西、视线朝北」构图语言）、lookAtHeight 9 抬视线让屋顶线离开画面顶缘。同帧读 concept 南立面 + 街谷纵深 + 东天际线。BL2 headroom 探针 y_ndc 0.60——**螺旋塔全高入帧**，复审「不借放大裁切可辨认」标准在此帧可达。

### 4.3 `showcase.autodrive-lab`（building_showcase）

- **意图**：低机位（y 8.4m）跨街仰拍 60m 双阶塔**全高 8/8 入帧**；机位在中轴大道西侧广场（十字路口西南象限），西/南立面朝镜头——BL1 GLB 的招牌背板合同面（README「西/南立面 24m 宽背板」）正对帧；泊车位 (28,−28) 在帧内近景，进站叙事连续。
- **风险**：机位 x=−21.1 在路外广场（距 lingua-tower 东立面 13m，LoS 净空已验）；仰拍透视收敛属有意语言（对标 Orion 进站帧）。

### 4.4 `corridor.autodrive-lab`（street_corridor）

- **意图**：霓虹大街西段对街读裙房带（band 24m：橱窗展车/卷帘门/挂高 20.4m 灯箱全入）+ 交叉口道具簇前景；塔全高有意出顶（合同只保 band，整楼归 4.3）。

### 4.5 `showcase.work-gallery`（building_showcase）

- **意图**：从东北开阔地读北立面整幅 + 西侧体量，背景向十字路口天际线（autodrive 塔 / agent-nexus 96m 远景层次）；36m 全高 8/8 入帧。
- **风险**：机位 (195.5, −28.3) 在 concept-garage 东侧 25m 开阔带，LoS 已验不穿楼。

### 4.6 `corridor.work-gallery`（street_corridor）

- **意图**：与 4.2 同锚成对（s=104 双侧走廊快门）：从走廊点北侧望东南读 work-gallery 北立面全幅（36m 全高入帧，含既有 `CARCONCEPT GARAGE` 式楼名牌位）+ 街谷；与 4.2 合成「同一走廊点、双向双楼」的沿街扫视素材对。

### 4.7 汇总表（探针输入即本表）

| shot id | anchor | θ° | φ° | r(m) | lookAt.h | lateral | 解算机位 (x,y,z) | NDC x 区间 / 宽度占帧 | NDC y 区间 | 包络入帧 |
|---------|--------|---:|---:|---:|---:|---:|------------------|----------------------|-----------|:---:|
| `showcase.concept-garage` | building `concept-garage` | −35 | 80 | 74 | 13 | +4 | (101.48, 12.85, 17.99) | [−0.900, 0.668] · 78% | [−0.824, 0.322] | 8/8 ✓ |
| `corridor.concept-garage` | corridor `neon-boulevard` s=104 | −25 | 80 | 38 | 9 | 0 | (88.18, 6.60, 33.92) | [−0.354, 0.901] · 63% | [−0.441, 0.297] | 8/8 ✓ |
| `showcase.autodrive-lab` | building `autodrive-lab` | −40 | 86 | 120 | 32 | +5 | (−21.12, 8.37, 42.92) | [−0.471, 0.328] · 40% | [−0.766, 0.856] | 8/8 ✓ |
| `corridor.autodrive-lab` | corridor `neon-boulevard` s=72 | +25 | 80 | 38 | 9 | 0 | (87.82, 6.60, 33.92) | band24m [−0.452, 0.514] · 48% | [−0.425, 0.497] | 8/8 ✓（band） |
| `showcase.work-gallery` | building `work-gallery` | +145 | 82 | 92 | 16 | −4 | (195.53, 12.80, −28.33) | [−0.522, 0.629] · 58% | [−0.635, 0.873] | 8/8 ✓ |
| `corridor.work-gallery` | corridor `neon-boulevard` s=104 | −155 | 80 | 40 | 11 | 0 | (87.35, 6.95, −35.70) | [−0.830, 0.307] · 57% | [−0.539, 0.807] | 8/8 ✓ |

BL2 headroom 探针（(122, 32, −44)，西肩螺旋塔 32m 位）：`showcase.concept-garage` → (−0.49, **0.79**)；`corridor.concept-garage` → (−0.04, **0.60**)。两帧都为 PR #43 合流后的新轮廓预留了不裁顶的垂直余量。

全部 shot：`fov` 42（统一镜头纪律）· showcase 档 `drift` ±0.8°/0.13（reduced-motion 归零）· corridor 档 drift=null（取证帧稳定优先）。

### 4.8 注册表 JSON 草案（DATA 可直接起步）

```json
{
  "schemaVersion": "0.1.0",
  "task": "CC-CAM-DATA",
  "updatedAt": "2026-08-27",
  "docs": "docs/spec/cyber-city-camera-shots.md",
  "buildingsSource": "src/data/cyber-city-buildings.json",
  "deepLink": { "param": "shot", "aliasSeparator": "." },
  "defaults": { "fov": 42, "phiDeg": 75, "lookAtHeight": 3.4, "lateral": 0, "drift": null, "nonIdealRatioOffset": 9 },
  "shots": [
    {
      "id": "ritual_idle", "kind": "ritual_idle", "mode": "ritual",
      "anchor": { "type": "spawn" },
      "spherical": { "thetaDeg": 25, "phiDeg": 75, "radius": { "min": 16, "max": 26, "baseRatio": 0.6 } },
      "lookAt": { "height": 3.4, "lateral": 4.2 },
      "fov": 42, "drift": { "amplitudeDeg": 1.1, "angularSpeed": 0.13 },
      "contract": { "assert": "identityWithView" },
      "notes": "首幕恒等合同（poster 三面 + VIS-03）；数值只准从 View.ts 抄写，不准在此调参"
    },
    {
      "id": "drive_follow", "kind": "drive_follow", "mode": "drive",
      "anchor": { "type": "spawn" },
      "spherical": { "thetaDeg": 25, "phiDeg": 75, "radius": { "min": 16, "max": 26, "baseRatio": 0.6 } },
      "lookAt": { "height": 3.4, "lateral": 4.2 },
      "fov": 42, "drift": { "amplitudeDeg": 1.1, "angularSpeed": 0.13 },
      "contract": { "assert": "identityWithView" },
      "notes": "城市驾驶跟随档＝ritual 同参数组（现状单源登记）；zoom/dollyIn/shakeY/roll 动态通道归 View"
    },
    {
      "id": "showcase.concept-garage", "kind": "building_showcase", "mode": "showcase",
      "alias": "showcase", "buildingRef": "concept-garage",
      "anchor": { "type": "building", "ref": "concept-garage" },
      "spherical": { "thetaDeg": -35, "phiDeg": 80, "radius": 74 },
      "lookAt": { "height": 13, "lateral": 4 },
      "fov": 42, "drift": { "amplitudeDeg": 0.8, "angularSpeed": 0.13 },
      "contract": {
        "viewport": { "width": 1440, "height": 900 },
        "envelopeInFrame": { "ref": "concept-garage", "maxAbsX": 0.95, "maxY": 0.92, "minWidthSpan": 0.7 },
        "headroom": [{ "point": { "x": 122, "y": 32, "z": -44 }, "maxY": 0.9, "note": "BL2 西肩螺旋塔预留（PR #43 合流即生效）" }],
        "cameraFree": true, "lineOfSight": true
      }
    },
    {
      "id": "corridor.concept-garage", "kind": "street_corridor", "mode": "showcase",
      "alias": "corridor", "buildingRef": "concept-garage",
      "anchor": { "type": "corridor", "roadId": "neon-boulevard", "s": 104 },
      "spherical": { "thetaDeg": -25, "phiDeg": 80, "radius": 38 },
      "lookAt": { "height": 9, "lateral": 0 },
      "fov": 42, "drift": null,
      "contract": {
        "viewport": { "width": 1440, "height": 900 },
        "envelopeInFrame": { "ref": "concept-garage", "maxAbsX": 0.95, "maxY": 0.92, "minWidthSpan": 0.55 },
        "headroom": [{ "point": { "x": 122, "y": 32, "z": -44 }, "maxY": 0.75 }],
        "cameraFree": true, "lineOfSight": true
      }
    },
    {
      "id": "showcase.autodrive-lab", "kind": "building_showcase", "mode": "showcase",
      "alias": "showcase", "buildingRef": "autodrive-lab",
      "anchor": { "type": "building", "ref": "autodrive-lab" },
      "spherical": { "thetaDeg": -40, "phiDeg": 86, "radius": 120 },
      "lookAt": { "height": 32, "lateral": 5 },
      "fov": 42, "drift": { "amplitudeDeg": 0.8, "angularSpeed": 0.13 },
      "contract": {
        "viewport": { "width": 1440, "height": 900 },
        "envelopeInFrame": { "ref": "autodrive-lab", "maxAbsX": 0.95, "maxY": 0.92, "minWidthSpan": 0.6 },
        "cameraFree": true, "lineOfSight": true
      }
    },
    {
      "id": "corridor.autodrive-lab", "kind": "street_corridor", "mode": "showcase",
      "alias": "corridor", "buildingRef": "autodrive-lab",
      "anchor": { "type": "corridor", "roadId": "neon-boulevard", "s": 72 },
      "spherical": { "thetaDeg": 25, "phiDeg": 80, "radius": 38 },
      "lookAt": { "height": 9, "lateral": 0 },
      "fov": 42, "drift": null,
      "contract": {
        "viewport": { "width": 1440, "height": 900 },
        "facadeBandInFrame": { "ref": "autodrive-lab", "bandTop": 24, "maxAbsX": 0.95, "maxY": 0.92, "minWidthSpan": 0.7 },
        "cameraFree": true, "lineOfSight": true
      },
      "notes": "裙房/灯箱带取证帧；塔顶有意出画，整楼归 showcase.autodrive-lab"
    },
    {
      "id": "showcase.work-gallery", "kind": "building_showcase", "mode": "showcase",
      "alias": "showcase", "buildingRef": "work-gallery",
      "anchor": { "type": "building", "ref": "work-gallery" },
      "spherical": { "thetaDeg": 145, "phiDeg": 82, "radius": 92 },
      "lookAt": { "height": 16, "lateral": -4 },
      "fov": 42, "drift": { "amplitudeDeg": 0.8, "angularSpeed": 0.13 },
      "contract": {
        "viewport": { "width": 1440, "height": 900 },
        "envelopeInFrame": { "ref": "work-gallery", "maxAbsX": 0.95, "maxY": 0.92, "minWidthSpan": 0.7 },
        "cameraFree": true, "lineOfSight": true
      }
    },
    {
      "id": "corridor.work-gallery", "kind": "street_corridor", "mode": "showcase",
      "alias": "corridor", "buildingRef": "work-gallery",
      "anchor": { "type": "corridor", "roadId": "neon-boulevard", "s": 104 },
      "spherical": { "thetaDeg": -155, "phiDeg": 80, "radius": 40 },
      "lookAt": { "height": 11, "lateral": 0 },
      "fov": 42, "drift": null,
      "contract": {
        "viewport": { "width": 1440, "height": 900 },
        "envelopeInFrame": { "ref": "work-gallery", "maxAbsX": 0.95, "maxY": 0.92, "minWidthSpan": 0.7 },
        "cameraFree": true, "lineOfSight": true
      }
    }
  ]
}
```

## 5. projectionAudit 探针合同（交 CC-CAM-DATA，`tools/camera/`）

- **输入**：camera-shots.json + cyber-city-buildings.json；viewport 1440×900（rubric §4 协议口径）为主，375×812 竖版为辅（移动端构图预警，不设硬门）。
- **相机重建**：§2.3 公式（drift=0、ratio 补偿双口径），three（node 侧 `three/src` 或纯数学）逐 shot 构建 `PerspectiveCamera(fov, w/h, 0.1, 200)`。
- **探针点集**：
  - `envelopeInFrame`：目标楼 footprint 8 角点（y ∈ {0, h}）；h≥70 楼追加桅杆/信标点（h×1.16+0.5）——本批三楼不触发；
  - `facadeBandInFrame`：临街立面 4 角点 × y ∈ {0, bandTop}；
  - `headroom`：显式世界点（BL2 等未合流几何的预留探针）；
  - `cameraFree`：机位不落入任何楼 footprint AABB（含 podium ×1.14 外扩）+ 2m margin；
  - `lineOfSight`：机位→锚点线段与全部非目标楼 footprint AABB 的 2D 相交测试（高度维取线段插值 y 与楼 h 比较）。
- **断言字典**：`maxAbsX`（角点 |x_ndc| 上限）、`maxY`（顶缘余量，0.92 = 不贴边可读）、`minWidthSpan`（x_ndc 跨度下限，0.7 ≈ 帧宽 35%——whole-frame「不借裁切可辨认」的量化下限）、全部角点 `z_ndc < 1`。
- **输出**：逐 shot PASS/FAIL 表（markdown + JSON），失败非零退出供 CI；报告归档 `docs/spec/assets/`（DATA 裁量）。
- **恒等探针**（poster 红线的机器化）：`ritual_idle`/`drive_follow` 的注册值 与 View.ts 常量做**数值逐位比对**（View 侧可导出常量表或探针内联合同值）——漂移即 FAIL。

## 6. poster 影响矩阵（永远排最后）

**合同事实**：poster 三面 = `public/posters/cyber-city-poster.webp`（桌面 16:9，≤40KB，LCP）+ `cyber-city-poster-mobile.webp`（9:16 竖裁）+ OG（`index.astro` 复用桌面帧同 URL）——「一拍三吃」，全部取自 robot_idle 主帧（rubric §4 协议 B，真机 GPU 重截）。VIS-03 为同帧当轮取证图（非像素基线）。

| # | 改动面 | poster 桌面 | poster 移动 | OG | VIS-03 | VIS-04 | 说明 |
|---|--------|:---:|:---:|:---:|:---:|:---:|------|
| P-1 | `ritual_idle` 任一数值字段（θ/φ/r/fov/lookAt.height/lateral） | **重拍** | **重拍** | **重拍** | 重取证 | — | 恒等合同破坏；须单列 **CC-POSTER-RESHOT** 任务书 |
| P-2 | `ritual_idle` drift 振幅/角速度 | 条件重拍 | 条件重拍 | 条件重拍 | 重取证 | — | ±1.1° 内属既有帧变异带；超带须 A/B 帧裁决，缺证按重拍处理 |
| P-3 | 变形运镜通道常量（dollyIn/shakeY 上限） | 0 | 0 | 0 | 0 | — | robot_idle 帧两通道恒 0（View.ts 逐位恒等先例），poster 不感知 |
| P-4 | **新增任何 shot（仅 `?shot=` 可达）** | **0** | **0** | **0** | 0 | 0 | opt-in 纪律：本批次 DATA/VIEW 的全部新增面落在此行 |
| P-5 | `?poi=` 默认接 poi_arrival/showcase（改深链默认帧，Phase B） | 0 | 0 | 0 | 0 | 更新 | poster 不走 poi 路径；VIS-04 取证帧变化须 AL 复评 V4 证据链 |
| P-6 | `drive_follow` 与 ritual 分离后单独调参 | 0* | 0* | 0* | 0 | — | *前提：ritual 档常量字节不动 + car_ready 交接连续性帧证据（TransformSystem 热切帧） |
| P-7 | 全局 FOV / tone mapping / 后处理链 | **重拍** | **重拍** | **重拍** | 重取证 | 更新 | **本批次禁碰**（编排看板：tone mapping 等 Blender 路径验证后另策） |
| P-8 | 双主角分轨 ritual（入口调研 §3.2 争议项） | **重拍** | **重拍** | **重拍** | 重取证 | — | 本批次隔离；若立项须专项任务书，重拍随批次收尾 |

**红线三条**：

1. **恒等探针**：camera-shots.json 的 `ritual_idle` 数值与 View.ts 常量逐位相等由 DATA 探针断言（CI FAIL 即拦截）——poster 三面免重拍的机器保证，不靠口头纪律。
2. **opt-in**：v0 一切新 shot 仅 `?shot=` 显式可达；默认路径（含 `?poi=` 单参）帧行为零变化。CAM-DATA/CAM-VIEW 对 poster 的承诺 = **零字节 diff**（`public/posters/` 三文件 SHA 不变）。
3. **排期**：任何触发 P-1/P-7/P-8 的行动，重拍作业**永远排所在批次最后**（rubric §6 A10 与编排看板既定纪律）：真机 GPU 按协议 B 重截 → 三面同源重切 → ≤40KB 复核 → OG/移动同 PR 收口。

## 7. 开放问题与交接

| 编号 | 问题 | 建议 | 归属 |
|------|------|------|------|
| Q-1 | `?ritual=1&shot=` v0 忽略 vs car_ready 后延迟应用 | v0 忽略（poster 风险最低）；延迟应用随 E 键进站编排一起 Phase B 裁决 | CAM-VIEW / 父代理 |
| Q-2 | 静态 shot 是否吃 `nonIdealRatioOffset` 窄视口补偿 | 吃（与既有窄视口纪律一致）；DATA 探针双口径复核 margin | CAM-DATA |
| Q-3 | shot 切换缓动 v0 是否实装 | 建议 0.6–0.8s power2 + reduced-motion 直切；若砍则 V5 无收益但无回归 | CAM-VIEW |
| Q-4 | `world-pois.json` `defaultShotId` | Phase B minor bump；v0 不动 | 父代理 |
| Q-5 | BL2 合流后 headroom 探针点转正式包络 | PR #43 合流时把 (122,32,−44) 探针升级为 GLB 包络角点（README 新包络联动） | CAM-DATA / BL2 重审 |
| Q-6 | E 键进站 tween 期间的 navigate 时序 | overlay/View Transition 归 CC-P1；v0 维持直跳，tween 只做取景 | CC-P1 |

**交接清单**：CC-CAM-DATA 按 §4.8 JSON 起步 + §5 探针合同交付；CC-CAM-VIEW 按 §2.5/§2.6/§3 接线（PARAM_ALLOWLIST ×2、shot 应用器、focusPoint 静态化、恢复机制）；CC-AL-CAM 硬门 = 指定楼 NDC 入帧探针绿 + e2e 52/52 + VIS-03 恒等 + `public/posters/` 零字节 diff。

---

*CC-CAM-DES · 2026-08-27 — 只设计不实现：本分支交付本规范与姊妹脑暴文档两篇，零 src/、零 e2e/、零基线改动；§4 数值已做解析投影自检（three r185，脚本口径见 §4.0，探针正本归 CC-CAM-DATA）。*
