# 赛博科技城镜头/POI 游戏化设计脑暴（CC-CAM-DES）

| 项 | 内容 |
|----|------|
| Task | **CC-CAM-DES**（CC-CAM 批次四路之一）——本篇为脑暴/设计裁量文档，规范正本见 `docs/spec/cyber-city-camera-shots.md` |
| 分支 | `cursor/cc-cam-shot-registry-design-1d6f`（base：`main`） |
| 日期 | 2026-08-27 |
| 输入 | 入口调研 `cyber-city-camera-poi-research.md` · rubric v1.1（V1 45 / V4 独立 71 为最弱轴与专项门）· `loop-bl2-reaudit.md` 裁决 · buildings/pois 双 JSON · `View.ts`/`Areas.ts` 代码事实 |
| 口径 | 全部功能以 **shot 注册表（数据驱动预设）** 为地基；G5 红线禁 free 相机；帧优先（rubric 口径铁律 1）——「功能在代码里但帧里看不见」不计收益 |

---

## 0. 结论先行

- 脑暴 **10 项**游戏化镜头/POI 功能（§2），每项映射 rubric 维度与消费 shot；P0 三件（F1 POI 进站镜头、F2 深链直达展示帧、F3 走廊沿街扫视）全部只消费 spec §4 的六个 showcase/corridor shot，**零 poster 风险**（opt-in 纪律）。
- 设计主轴 = 把 AL-BL2 复审确立的两个事实变成产品能力：①robot_idle 几何上永远读不到东向楼 → **每栋 hero 楼配 definitive shot**（V1 的「任一帧可当海报」锚点从首幕单帧扩展为逐楼帧族）；②固定沿街整帧是合格证据场地 → **corridor shot 注册表化**，V4 密度收益（招牌/街道层/实模轮廓）第一次有了稳定的可审计取景面。
- **poster 红线摘要**（正本 spec §6）：本批次一切功能不碰 `ritual_idle` 恒等合同；触发重拍的只有分轨 ritual（F11，已隔离）与全局 tone/FOV（本批次禁碰）；重拍永远排批次最后。

## 1. 设计原则

1. **预设即镜头语言**：借 three-story-controls `StoryPointsControls` 的 POI 数组思路（position+quaternion 数据驱动）与 folio-2025 camerakit 的「区域进站 tween」，但**不引入任何用户接管**——玩家的相机自由度 = 0，叙事的相机自由度 = 注册表条目数。
2. **帧优先立项**：每项功能必须指得出「哪个 shot 的哪个取证帧、动了 rubric 哪个维」；说不出的进 P3 冷板凳。
3. **驾驶意图至上**：任何 forward/steer/boost/respawn 输入 0.1s 内交还 drive 跟随（View 既有 focusActions 机制）——镜头编排永远不能让车「不听话」（SRD「世界永远能开」）。
4. **reduced-motion 双轨**：一切 tween/drift 在 `prefers-reduced-motion` 下直切/归零（View 既有纪律外推到 shot 切换）。
5. **动画配额**：镜头 tween 是**事件驱动一次性动画**，不占 CITY-03 循环动画配额（≤3 席口径见 eng notes「CC-L3-B3」小节）；shot 的 `drift` 慢 yaw 与 ritual 同型（呼吸微动，已有先例不另计席）。

## 2. 游戏化功能脑暴（10 项）

### 总表

| # | 功能 | 消费 shot | rubric 主映射 | 次映射 | 成本 | 优先级 |
|---|------|-----------|:---:|:---:|------|:---:|
| F1 | POI 进站镜头（E 键前奏） | `showcase.*` | **V4**（密度证据帧） | V5 运镜 / V7 楼=产品线 | 引擎-低（tween + 时序） | **P0** |
| F2 | 深链直达展示帧 | `showcase.*` / `corridor.*` | **V1**（逐楼 definitive shot） | V4 | 引擎-低（?shot= 接线） | **P0** |
| F3 | 走廊沿街扫视 | `corridor.*` | **V4**（沿街整帧场地） | V5 | 引擎-低 | **P0**（静态）/ P1（驶入触发） |
| F4 | car_ready 首驶引导镜头 | `corridor.autodrive-lab` 变体 | **V5**（转场编舞） | V1 / 导航可见性 | 引擎-中 | P1 |
| F5 | 泊入定帧（触发圈停稳半程取景） | `poi_arrival.*`（Phase B 模板） | **V4** | V6（标点同帧） | 引擎-中 | P1 |
| F6 | showcase 巡礼 / attract 模式 | 全部 `showcase.*` 链播 | **V1** | V4 / V5 | 引擎-中 | P2 |
| F7 | `#debug` 机位导出 | 全注册表 | 工具（间接全维） | — | 引擎-低（debug-only） | P2 |
| F8 | 移动端 shot 竖版适配 | 全注册表 `contract` 375×812 口径 | **V1**（移动构图） | V6 | 数据-低 | P2 |
| F9 | photo mode 分享帧 | `showcase.*` | V7（传播叙事） | V1 | 引擎-中 + 隐私/体积审 | P3 |
| F10 | 观景台全城 establishing shot | 新 shot（slot-18 anchor） | V1 / V4 | — | 依赖 Phase 2 槽位解锁 | P3 |
| F11 | 双主角分轨 ritual | `ritual_idle` **改动** | V1 | — | **poster 重拍**（P-8 行） | **隔离** |

### F1 · POI 进站镜头（E 键前奏）——P0

- **玩法**：车在触发圈内按 E/Enter/点标点 → 0.8s 缓动至该楼 `showcase.*` 机位 → 定帧 0.4s（楼名牌 + 触发圈光环同帧）→ navigate 进站（v0 直跳，overlay 归 CC-P1）。对标 Orion 的进站俯拍 tween 与 Virtual Car Showroom 的换场运镜（rubric §2.2 施工参照）。
- **rubric 论证**：V4 独立 71 卡在「新轮廓在正常整帧不可读」——进站前奏把 showcase 帧塞进**主交互动线**（不是可选深链），密度证据从「审计员专门去拍」变成「玩家人人路过」；V5 加运镜层（合议 58 的扣分项「镜头静态」）。
- **红线**：tween 期间任何驾驶输入立即中断回 drive；reduced-motion 直切 showcase 定帧；不碰 ritual。

### F2 · 深链直达展示帧——P0

- **玩法**：`?poi=concept-garage&shot=showcase` 落地即 definitive shot（出生仍在 parkingBay，摄像机与出生解耦）；`?shot=corridor.concept-garage` 无 poi 也可用。分享/简历/审计链接从「出生在楼下自己找角度」升级为「打开即海报帧」。
- **rubric 论证**：V1 锚点 90-100 段要求「任一帧可当海报」——本站首幕帧因几何限制只能覆盖十字路口两楼，深链 showcase 把「海报帧」外推到东向 hero 楼；同时是 AL-BL2 最小补洞 1 的直接实现（固定、可复现、whole-frame、非目标近景四条件在 spec §4 已数值预验）。
- **红线**：`?shot=` 纯 opt-in，VIS-01/02/03 全部不感知；无效值回落现行为。

### F3 · 走廊沿街扫视——P0（静态）/ P1（驶入触发）

- **玩法**：v0 = `corridor.*` 三帧可深链（沿街整帧证据场地注册表化，s=104 双侧成对 + s=72 西段）；Phase B = 驾驶进入走廊 Area（复用 `Areas.ts` zones 圆柱→矩形带扩展）时 drive 档 theta 加 ±3–5° 缓动偏轴，让沿街立面/招牌扫过帧面——**偏轴不是接管**，方向盘输入优先级不变。
- **rubric 论证**：V4 的「沿街可读」正是 BL2 两轮 NO-GO 的争议场地；固定 corridor shot 让「街谷层次（近道具/中立面/远天际线）」有稳定取证帧；驶入偏轴给 V5「镜头经营」加第二层（首层是 F1 tween）。
- **红线**：偏轴幅度 ≤5° 且随速度衰减（高速回正，防眩晕）；reduced-motion 关闭。

### F4 · car_ready 首驶引导镜头——P1

- **玩法**：变形仪式 car_ready 交接后，相机不立即贴车，而是沿 `corridor.autodrive-lab` 族的过渡变体停 1.2s（帧内：车 + 霓虹大街东向 + 最近 POI 光圈），再缓动收回 drive 跟随——「先运镜展示 3 秒再交方向盘」（PorscheLab/drive-my-portfolio 首屏节奏，rubric §2.2）。
- **rubric 论证**：V5 合议 58 的两大扣分 =「镜头静态」+「car 帧洗帧」；本件给变形仪式补「第四拍收尾运镜」，同时把 POI 系统在首驶 3 秒内可视化（V6 导视收益）。
- **红线**：**动 ritual 时序链**（TransformSystem→View 交接），必须做 car_ready 交接连续性帧证据（spec §6 P-6 行口径）；poster 不感知（robot_idle 帧在 car_ready 之前已定格）。reduced-motion 直接交方向盘。

### F5 · 泊入定帧——P1（Phase B `poi_arrival` 模板）

- **玩法**：驶入触发圈且速度 < 2m/s 持续 0.6s → 相机缓动至 `poi_arrival.<building>`（由 parkingBay heading 派生的半程取景：车尾 3/4 + 楼门脸 + 标点键帽同帧）；任何驾驶输入退出。
- **rubric 论证**：V4（楼门脸细节第一次有专属帧）+ V6（InteractivePoints 标签/键帽从「贴在世界里的 UI」变成「被构图的 UI」——rubric V6 90 段「UI 即世界的一部分」方向）。
- **数据**：`poi_arrival` 模板按 `θ = bay.heading 换算 + 定偏移`推导 12 楼通用参数，个别楼 override——归 CAM-DATA Phase B，v0 不落。

### F6 · showcase 巡礼 / attract 模式——P2

- **玩法**：静止无输入 60s（或 `?tour=1` 显式）→ 依次缓动播放 `showcase.*` 链（每帧 4s，drift 微动），任意输入即退回 drive。对标 three-story-controls `StoryPointsControls` 的 nextPoint 链播。
- **rubric 论证**：V1（三帧海报轮播 = 「definitive shot 打磨」的展示位）+ V4（全城密度纵览）+ V5（长镜头编舞）。风险：闲置 RAF 功耗与 WS-PERF 口径——须在 Quality 2 禁用。

### F7 · `#debug` 机位导出——P2

- **玩法**：`#debug` 下（既有 `window.__worldSpikeGame` 通道）暴露当前 spherical/lookAt/lateral 读数 + 一键导出 shot JSON 片段（含 anchor 反解提示）——对齐 three-story-controls `CameraHelper` 的「可视化摆机位→导出 JSON」工作流与 folio `#debug` camerakit。
- **rubric 论证**：不直接计分；是后续所有 shot 调参任务（含 poster 重拍批次预演）的工装。红线：严格 debug-only，不进生产 bundle 可达路径（tree-shake 或 hash 判断在 debug 分支内 import）。

### F8 · 移动端 shot 竖版适配——P2

- **玩法**：全部 showcase/corridor shot 的 `contract` 增补 375×812 口径探针（不设硬门，先出预警报表）；竖版下 `nonIdealRatioOffset` 通道自动拉远（View 既有），必要时逐 shot 加 `portraitOverride { radius, lookAtHeight }`（schema minor bump）。
- **rubric 论证**：V1 的「移动 poster 无构图」观察（L0 观察遗留）与 V6 移动壳观感——先数据化（探针报表），再决定是否逐 shot 修。

### F9 · photo mode 分享帧——P3

- **玩法**：showcase 帧下按 P 截 canvas 帧下载（叠加楼名/站点水印）。V7 传播收益，但涉及 toDataURL 性能、双后端一致性与「分享出去的帧=另一张 poster」的质量责任——**冷板凳**，等 showcase 帧质量过 AL 审计再议。

### F10 · 观景台全城 establishing shot——P3

- **玩法**：`slot-18 Skyline Observatory`（reservedSlots，Phase 2）落成后注册 `showcase.skyline-observatory`：全城天际线 establishing shot（anchor building + r≈160 需重审 far clip 200 余量）。V1/V4 全城层次的终极取证帧；依赖 Phase 2 槽位解锁，仅登记不排期。

### F11 · 双主角分轨 ritual——**隔离**

入口调研 §3.2 的「ritual_idle 分轨（西向/东向收益）」：**触发 spec §6 P-8 行 poster 三面重拍**，且与「东向楼走专用 shot」的本批主轴冲突（收益重叠、风险不对称）。裁量：**本批次不立项**；若 CAM 批次落地后 V1 仍卡 <60，再以 CC-POSTER-RESHOT 联合任务书重议。

## 3. rubric 对齐总表

| rubric 维 | 现分（AL-BL2 独立） | 本批可触达的功能 | 触达机制 |
|-----------|:---:|:---:|---------|
| V1 首幕构图 | 65 | F2 F6 F8 | 「海报帧」从首幕单帧扩展为逐楼 definitive shot 族；首幕本身**零改动**（恒等合同） |
| V4 场景密度 | 71（专项门 72–75） | **F1 F2 F3 F5** | showcase/corridor 帧把实模轮廓、招牌、街道层塞进稳定可审计的取景面——BL2 重审（CC-BL2-CAM）的证据场地由此供给 |
| V5 动效转场 | 70 | F1 F3 F4 F6 | 进站 tween / 偏轴 / 首驶引导——「镜头静态」扣分项的正面解 |
| V6 UI/HUD | 73 | F5 | 标点/键帽被构图（diegetic UI 方向） |
| V7 原创叙事 | 76 | F1 F9 | 「楼=产品线」从文案自明升级为镜头语言自明 |
| V2/V3 | 75 / 69 | — | 本批不主张（光照/色彩另有批次）；corridor 低机位帧顺带提升湿反射可见性（V2 帧优先口径的免费收益，不预支计分） |

## 4. 优先级与批次切分建议

1. **本批（CAM-DATA + CAM-VIEW）**：F2 + F3 静态段（`?shot=` 接线 + 六 shot 落数据 + 探针）——纯 opt-in，poster 零风险，AL-CAM 即可审「指定楼 NDC 入帧」专项门。
2. **CAM 批次 GO 后**：F1（E 键前奏）+ F4（首驶引导）——动交互时序，各需一份帧证据（tween 中断、car_ready 连续性）。
3. **Phase B**：F5（poi_arrival 模板）+ F3 驶入触发段 + F6/F7/F8。
4. **不排期**：F9/F10/F11（条件见各节）。
5. BL2 联动：CAM 落地后 `corridor.concept-garage` / `showcase.concept-garage` 即 **CC-BL2-CAM 重审**的指定证据场地（spec §4 headroom 探针已为螺旋塔预留），PR #43 无需再迁就 bay 帧构图。

## 5. 竞品技法映射（施工时按件对照）

| 技法 | 来源 | 本站落点 | 改造 |
|------|------|---------|------|
| POI 数组 position+quaternion 数据驱动 | three-story-controls `StoryPointsControls` | camera-shots.json（anchor+spherical 参数化优于裸 quaternion：人可读可校验） | 不引库，View 参数应用器自实现 |
| 区域进站 tween | folio-2025 camerakit / Orion 入城转场 | F1 E 键前奏 0.8s | gsap→手写缓动（InteractivePoints 先例） |
| CameraHelper 摆位→导出 JSON | three-story-controls | F7 debug 导出 | debug-only，零生产字节 |
| 先运镜再交方向盘 | PorscheLab / drive-my-portfolio | F4 car_ready 1.2s | reduced-motion 直切 |
| attract loop | 街机惯例 / Bruno 2019 idle | F6 巡礼 | Q2 禁用，输入即退 |

## 6. poster 红线摘要（正本 spec §6）

- 本篇全部 P0/P1/P2 功能落在 poster 矩阵 **P-4/P-5/P-6 行（零重拍）**；唯一重拍源 F11 已隔离。
- 恒等探针（ritual_idle ↔ View.ts 逐位相等）是所有镜头功能的**前置 CI 门**——先有探针，再动 View。
- 若未来任何功能升级触发 P-1/P-7/P-8：重拍单列 CC-POSTER-RESHOT、真机 GPU 协议 B、≤40KB 三面复核、**永远排所在批次最后**。

---

*CC-CAM-DES · 2026-08-27 — 脑暴 10 项 + rubric 映射 + 批次切分；数值级 shot 草案与 schema 正本见 `docs/spec/cyber-city-camera-shots.md`。本 Task 零实现改动。*
