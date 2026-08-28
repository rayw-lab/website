# 受控临时环视（左键按住旋转视角）——G5 相机红线 v2 修订送签稿

| 项 | 说明 |
|------|------|
| Task | **CC-CAM-ROT-DES**（R5 终裁 [#158](https://github.com/rayw-lab/website/pull/158) §C W-R5-0 四单之一）——规格 + 红线修订案文本，**零实现** |
| 分支 | `cursor/cc-cam-orbit-des-cfb0`（base：`main@467d148`） |
| 日期 | 2026-08-28 |
| 需求源 | 指挥官：「鼠标左键按住旋转视角」（PUBG 载具 Alt 环视的观感对标） |
| 上游 | R5 终裁 §B/§C/§D（约束草案 + 门禁）· `cyber-city-vehicle-camera.md`（VEH-DES，D2 原判）· `cyber-city-camera-shots.md`（shot 注册表 + 恒等纪律）· `View.ts`/`Pointer.ts` 代码事实 |
| 性质 | **红线豁免送签稿**——签字前本稿为草案，G5 相机纪律 v1 口径继续全额有效；指挥官签「同意」后，本稿 §3 条文即 G5 相机纪律 **v2 正本**，其余文档交叉链到此 |
| 签署 | **指挥官一次性签字，永不代决类**（红线/北极星口径变更不入站立授权代决面，见 `cc-loop-board-merge-standing-auth.md` 规程表第 4 行；R5 §C 明文「修订案送指挥官一次性签字后 CAM-ROT-C1 才可开工」） |
| 消费方 | **CAM-ROT-C1**（W-R5-2 增强波，单 PR 永远独立）；审计按 R5 §D 硬门六条 |

---

## 0. 一页纸摘要（供扫签）

- **要什么**：驾驶语境下，桌面鼠标**左键按住拖动 = 在现行第三人称跟随机位的球坐标上加一个有界偏移**（yaw ±60° / pitch ±20° 封顶），**松手自动回中**，任何驾驶输入立即回中。看一眼，放手，镜头回家。
- **不是什么**：不是自由相机。零 pointer-lock、零惯性、零缩放、无持久状态；FPV 视线维持锁前向（VEH-DES D2 原判零修改）；机器人/变形/首幕态物理不可达；偏移为 0 时输出路径 IEEE 逐位恒等（`ritualCam` 同范式）——poster 三面零重拍、VIS-03 像素基线零更新。
- **为什么要签字**：该交互 = 指针→相机姿态映射，落在 G5 相机纪律「用户不可接管相机」的字面禁用面上（两轮审计已把「Pointer 未写相机 yaw/pitch」当作放行证据执法，见 §1.3）。不修红线直接实现即违宪，故按 R5 终裁走豁免修订案。
- **什么时候实现**：签字 ≠ 开工。CAM-ROT-C1 另有硬前置——X2 链收口（#129 已合 ✅ → #134 段末审计 → #104 复活合入）+ AL-VIS 固定机位复评交付之后（§5）。
- **拒绝怎么办**：备选 = 仅右键版（同一豁免文本换触发键）/ 不做（兜底走 D2-C 弯心自动偏置，无输入接管）/ 触控双指版不推荐（§7）。

---

## 1. 现状红线引用（原文定位）

### 1.1 G5 相机纪律（「用户不可接管相机」）立法链

| # | 出处 | 原文（摘录） |
|---|------|-------------|
| L1 | `docs/spec/implementation-roadmap-birdseye.md` 门禁 G5（本源，依赖红线） | 「G5：依赖红线：不引入 React/R3F、Lenis、Tailwind；GSAP 仅专项审批」 |
| L2 | `src/lab/world/view/View.ts` 头注释（移植裁决，G5 依赖红线的相机面落地） | 「砍除：free 相机（camera-controls 依赖，G5 红线）、cinematic、speedLines、mapControls、gamepad 摇杆平移、debug 面板」 |
| L3 | `docs/research/cyber-city-camera-poi-research.md` §5 纪律（**相机批次入口，CAM 纪律立法正本**） | 「禁止 `camera-controls` 用户 free 漫游（G5）」 |
| L4 | `docs/research/github-camera-poi-survey.md` §1 | 「`camera-controls` 的核心价值是用户输入接管（本站 G5 相机纪律明令禁止的那一半）」 |
| L5 | `docs/spec/cyber-city-camera-shots.md` §1 事实表 | 「G5 红线禁 free 相机；`camera-controls` 用户接管被裁决排除……一切 shot 均为**数据驱动预设**；任何驾驶意图输入 → 回 drive 跟随（既有 focusActions 机制）」 |
| L6 | `docs/spec/cyber-city-vehicle-camera.md` 红线行 | 「**禁 free 漫游**（G5 相机纪律：用户不可接管相机）」 |
| L7 | `docs/spec/cyber-city-observability.md` §5.3-1 | 「无相机接管——free 相机 G5 红线不从 debug 后门破窗」 |

### 1.2 VEH-DES D2（FPV 视线裁决）原文

`docs/spec/cyber-city-vehicle-camera.md` §4 裁决表 D2（全文照录）：

> D2 | FPV 视线 | A. 锁前向；B. 鼠标 free look（PUBG 原样）；C. 转向时向弯心自动偏置 ≤4° | **A**（V1）。B 撞 G5「用户不可接管相机」死线；C 是无输入接管的「看弯心」替代，观感加分但引入新晕动变量，**列 V2 可选（默认关）**，不进本批验收

配套条文：同 spec §1 非目标「❌ FPV 鼠标 free look（G5 用户不可接管；与 PUBG 的显式差异，裁决 D2）」；§7.1 rig 表「视线：锁前向（stabilized forward），无 free look（G5）｜D2」。

### 1.3 审计执法先例（红线不是纸面条款）

- `docs/research/loop6-cam-audit.md`「G5 / release」行：**放行证据 = 禁用面搜索无 `camera-controls`/Orbit/`freeCamera`**。
- `docs/research/loop-veh-audit.md` 硬门 #4：「G5 无 free 漫游……唯一新相机输入是离散 V 二态切换；**`Pointer` 只供 RayCursor/Nipple 交互，未写相机 yaw/pitch**」✅。

### 1.4 冲突认定

「左键按住旋转视角」= 连续的指针→相机姿态映射。它精确落在 L3–L7 的禁用面与 1.3 的执法口径上（审计将「Pointer 零相机写入」作为 PASS 证据——本功能一落地该证据即翻红）。**结论：必须先修红线，方可实现**；这正是 R5 终裁 §B「③ 触 CAM 红线，需红线修订案 + 指挥官签字 + DES 先行」的执行件。

对 VEH-DES D2 的处理是**范围切割而非改判**：本修订只在**第三人称跟随档**开「受控临时环视」类目；`drive_fpv` 视线锁前向的 D2 原判**零修改**（FPV 环视若未来立项须另发修订案）。

---

## 2. 设计原则：为什么是「受控临时环视」而不是 free look

G5 相机纪律保护的是四件资产：① poster/首幕帧逐字节恒等（协议 B）；② 固定机位取证协议（视觉审计的前后帧对照全部假设机位确定性）；③ `optimalArea`/Nipple/`focusPointSpeed` 等世界逻辑对**固定方位角**跟随相机的消费假设（VEH-DES D1 否决追尾相机的同一理由）；④ 防晕纪律。

「受控临时环视」的构造让四件资产全部无损：偏移是**瞬态、有界、自回中、输出层叠加**的——用户从不「持有」相机，只是暂时**借看一眼**；无输入时系统与 v1 逐位等价。

## 3. 提议修订条文（G5 相机纪律 v2）——签署对象

> **G5 相机纪律 v2**：用户自由漫游/自由环视相机维持**禁止**（free 相机、pointer-lock、`camera-controls` 类接管、追尾/自由 orbit 均在禁用面）。新增唯一合法类目「**受控临时环视**」：驾驶语境（TransformSystem 上下文 ∈ {car_ready, driving} 且视角为 `third`）下，桌面鼠标左键按住拖动，可在现行跟随机位球坐标上施加**有界、瞬态、输出层叠加**的姿态偏移；**松手即回中**（reduced-motion 直切归零）、**任何驾驶意图输入立即回中**、非驾驶态/ritual/robot_idle/transforming/shot 取证态**机器不可达**、**零 pointer-lock**、偏移为 0 时输出路径 **IEEE 逐位恒等**（`ritualCam` 同范式）。边界、禁项与验收以 `docs/spec/cyber-city-camera-orbit.md` §4 为合同；本类目之外的一切用户相机接管形态仍非法。

签「同意」即上述条文生效；签「附条件」以批注条件覆盖对应字段；签「拒绝」则 G5 v1 维持，处置走 §7。

## 4. 精确行为、边界与禁项（CAM-ROT-C1 合同）

### 4.1 状态与门（机器保证，非约定）

| 项 | 合同 |
|------|------|
| 生效门 | `TransformSystem` 上下文 ∈ {`car_ready`, `driving`}（与 V 键同门）**且** `driveView === 'third'` **且** 无 shot 应用态（`shotBaseline === null`，`?shot=` 取证机位期间禁用）**且** `Pointer.mode === MODE_MOUSE`（触屏不触发，双指通道归 Nipple/pinch 既有语义） |
| 触发 | 左键（`event.button === 0`，`Pointer.ts` 现状不分键位，实装须补按钮位判别）按住 + 累计位移越过死区 **4px**——死区内松手仍是 RayCursor 点按（进站语义零冲突） |
| 会话 | 越过死区 → orbit 会话开启：RayCursor 悬停/点按**挂起**至松手（防拖拽误触发进站）；松手 → 会话结束 → 回中 |
| 驾驶输入即回中 | WASD/箭头/Shift/刹车/Nipple 任一驾驶意图输入 → **立即结束会话并回中**（即便左键仍按住）——`camera-shots.md` §1「任何驾驶意图输入 → 回 drive 跟随」的既有 focusActions 法理直接沿用 |
| 强制回中 | 变形（driving→robot 回变）、respawn、V 切 FPV、shot 应用、失焦/`pointercancel` —— 一切离开生效门的路径均即时释放偏移 |

### 4.2 偏移通道（输出层叠加，双相机管线同构）

| 项 | 合同 |
|------|------|
| 作用层 | 偏移仅施加在**输出相机**（`View.camera`）姿态解算上；`defaultCamera` 第三人称解算**逐行零改动**——`optimalArea`（Objects 休眠 + 装饰密度）、Nipple 射线、`focusPointSpeed` 消费面零回归（CC-VEH-VIEW FPV 双相机管线的同构复用） |
| 边界（合同值） | `yawOffset ∈ [−60°, +60°]`；`pitchOffset ∈ [−20°, +20°]`，**且**解算后极角 φ 硬钳 `[50°, 88°]`（防越地平线入地/过顶翻转，双保险） |
| 灵敏度（提案值，A/B 校准） | yaw ≈0.25°/px、pitch ≈0.18°/px；触底/触顶硬钳，无「橡皮筋」过冲 |
| 回中（合同值） | 帧率无关低通 `1 − e^(−rate·dt)`，rate **6 s⁻¹**（≈0.5s 内收敛 95%）+ 变化率硬钳 ≤**180°/s**；**reduced-motion：回中直切归零（单帧）**，拖拽期间的直接映射保留（用户手驱动、非自动动画），无任何惯性/回弹补间（R5 §D-3） |
| 恒等 | `orbitOffset` 初值 {0, 0}；门外目标恒 0；施加形态为 `theta + yawOffset` / `phi + pitchOffset` 的 **+0 加法通道**——偏移为 0 时 IEEE 逐位恒等（`ritualCam.dollyIn/shakeY`、lookahead「门外恒 +0」的第三个同范式实例） |
| 参数落点 | V1 以 `View.ts` 内 `DRIVE_ORBIT` 常量落地（`DRIVE_LOOKAHEAD` 同格式引注本 spec 条号）；若走注册表须为**新增子块**（`drive_third.dynamics.orbit`），既有字段字节零动——两案择一，禁双源 |
| 可观测（可选） | 单事件 `world-cam-orbit`（`{action: 'engage'|'release', peakYawDeg, holdMs}`）；无埋点不登记纪律沿用 |

### 4.3 禁项（修订案外形态一律非法，R5 §D 禁项②④沿用）

1. **零 pointer-lock**：不调用 `requestPointerLock`，光标不隐藏不锁定。
2. **零持久接管**：无「自由相机模式」开关；偏移不入 URL、不入 localStorage、不跨会话。
3. **FPV 不适用**：`drive_fpv` 视线锁前向维持 D2 原判；orbit 会话在 V 切换时强制释放。
4. **禁改默认机位**：`drive_third`/`CameraShots.ts`/`camera-shots.json` 既有机位常量逐位不动（0 恒等叠加通道）；禁动 theta 跟随/追尾语义（D1 原判不动）。
5. **零新依赖**：`camera-controls`/three-story-controls 等仍在禁引清单（`github-camera-poi-survey.md` §0 结论 1）。
6. **无惯性/无 flick**：松手瞬间偏移只回中不继续漂移；无正弦 sway（晕动纪律）。
7. **无缩放/平移**：wheel zoom、拖拽平移不随本案解锁（各须独立修订案）。
8. **触屏零改动**：触控双指旋转不进 V1（§7 Alt-B）；Nipple/pinch 语义不动。
9. **不新增 HUD 提示**：发现性走 hint 系统既有面，不进本批（禁扩批）。

### 4.4 键盘等价声明（R5 §D-2 无障碍门）

本功能**显式声明为桌面指针增强**：不承载任何必经功能——一切必经信息（POI、导视、进站）在默认取景内完整可达，环视仅提供冗余视野。该声明按 R5 §D-2「拖拽旋转有键盘等价**或**显式声明为桌面指针增强」条款满足无障碍门；若审计不采纳此声明，补键盘等价（如 Q/E 按住离散环视）为定向补洞面。

## 5. 实现前置条件清单（签字 ≠ 开工）

| # | 前置 | 状态（2026-08-28 09:50Z `gh` 实测） |
|---|------|------|
| P0 | **本稿指挥官签字**（§8；永不代决类） | ☐ 待签 |
| P1 | **X2 链收口**：① [#129](https://github.com/rayw-lab/website/pull/129) 修复段合入 → ② [#134](https://github.com/rayw-lab/website/pull/134)（plug 定向补洞，栈① base=facade-r2）段末审计放行后先入 #104 分支 → ③ [#104](https://github.com/rayw-lab/website/pull/104)（X2 立面套件）过复活门三条（#129 双门 + R2 双清 + 全量 e2e 0/0/0 集成树口径）→ ready → 合入 | ① **✅ 已合**（`4f445e4`，09:34:45Z，×2=2/2 站立授权 GO）；②③ **未收口**（双双 draft） |
| P2 | **AL-VIS 固定机位复评交付**（X1b/X2 后的视觉登记分落账，复评取证基线冻结）——R5 §B-2 明文：CAM-ROT 先落会污染固定机位前后帧对照取证面 | ☐ 未派（X2 收口后） |
| P3 | 波次与形态：W-R5-2 增强波，**单 PR 永远独立、禁并**（归因隔离）；base = X2 收口 + AL-VIS 复评后的 main | — |
| P4 | 文件域：`view/View.ts`（受控偏移通道）+ `inputs/Pointer.ts`（按钮位判别，现状 `mousedown` 不分键）；禁入区 = 机位常量/`CameraShots.ts` 默认值/`e2e` 既有断言语义/像素基线 | — |
| P5 | 验收 = R5 §D 硬门六条全过 + e2e 新增断言最低集：**拖拽偏移生效 / 松手回中 / 非驾驶态零效果 / offset=0 恒等回归**（VIS-03 像素基线零更新随第四条覆盖） | — |
| P6 | 全量 e2e 窗按跑道互斥硬令登记空档执行（R1 §3.5 永久硬令） | — |

依赖关系一句话：**签字（P0）与 X2 链（P1）/AL-VIS（P2）正交并行，三者全绿才开 CAM-ROT-C1**；签字先到不解锁跑道，X2 先收口不豁免签字。

## 6. 与 AL-VIS / poster / 固定机位取证的兼容条款

1. **poster 协议 B（robot_idle 逐字节恒等）**：三重机器保证——① 生效门要求 car_ready/driving，robot_idle/transforming/intro 物理不可达；② `orbitOffset` 初值 0 + 门外目标恒 0 + 输出层 +0 IEEE 逐位恒等；③ `defaultCamera` 解算路径逐行零改动。poster 三面**零重拍**。
2. **VIS-03 像素基线**：零更新验收（e2e 断言集第四条即恒等回归探针）；基线文件禁触碰，历史截图禁重写。
3. **固定机位取证协议（rubric §4 帧优先）**：orbit 是瞬态人驱通道，**无指针输入即零偏移**——一切取证帧继续以无输入会话拍摄，前后帧对照零污染；`?shot=` 取证机位应用期间 orbit 门关死（§4.1）；NDC 探针（`tools/camera/`）消费 shot 解算面，orbit 不进 shot 管线。CAM-ROT-C1 PR 附**零输入取证声明**（取证会话无 pointer 事件）。
4. **AL-VIS 复评时序**：本案实现严格排在复评交付之后（P2）；复评期间 main 上不存在 orbit 通道，取证面与 v1 完全同构。复评后的后续视觉批次在 orbit 在场的 main 上取证时，沿用「无输入会话」口径即可，无额外成本。
5. **世界逻辑消费面**：`optimalArea`/Nipple 射线/`focusPointSpeed` 全部读 `defaultCamera`——orbit 只动输出相机，消费假设零回归（FPV 双相机管线已验证过同一接缝，`loop-veh-audit.md` 硬门 #1/#3 先例）。

## 7. 拒绝时的替代方案

| 案 | 内容 | 判定 |
|----|------|------|
| Alt-A 仅右键按住环视 | 同一豁免文本，触发键改 `button === 2`（`contextmenu` 已被 `Pointer.ts` preventDefault，工程零障碍） | 若拒绝理由是「左键与 RayCursor 点按/进站冲突」→ **可行**，其余条款照抄本稿（死区/挂起条款可简化）；若拒绝理由是「禁一切指针接管」→ 右键同禁，无意义。缺点：右键拖拽可发现性差、触控板体验差 |
| Alt-B 仅触控双指旋转 | 触屏双指拖拽环视 | **不推荐**：双指通道已被 Pointer pinch + Nipple 多指平均坐标占用，重标定面大；触屏相机语义变更已被 VEH-DES D5 裁为独立任务书面。若立项须另发修订案 |
| Alt-C 不做（G5 v1 维持） | 零成本零风险；动态感由既有 lookahead/速度拉远/thetaDrift 承担 | **兜底推荐**：环视诉求部分转 **D2-C 弯心自动偏置 ≤4°**（无输入接管、不触红线，VEH spec 已列 V2 可选默认关）——「转弯时看向想看的方向」的合宪替身，但无法覆盖「停车四处看」场景 |

推荐序：**主案 ＞ Alt-A ＞ Alt-C ＞ Alt-B**。

## 8. 指挥官签字栏

| 字段 | 填写 |
|------|------|
| 裁决 | ☐ **同意**（§3 条文即日生效为 G5 相机纪律 v2） ／ ☐ **附条件同意**（条件写下行，条件即合同） ／ ☐ **拒绝**（勾选替代案：☐ Alt-A ☐ Alt-B ☐ Alt-C ☐ 另议） |
| 附加条件 | （空） |
| 签署人 | （空） |
| 日期 | （空） |

签署方式（任选其一，落档即生效）：① 直接编辑本文件填表后合入；② 在本 PR 会话/评论中书面明示裁决，由父代理回填本表并注明出处。签署前本稿不产生任何实现授权；**CAM-ROT-C1 开工另需 §5 P1/P2 全绿**。

---

*本文档为 CC-CAM-ROT-DES 交付物（W-R5-0，R5 终裁 [#158](https://github.com/rayw-lab/website/pull/158) §C 第四单）；引文均为原文定位可复核；零 `src/` 改动。*
