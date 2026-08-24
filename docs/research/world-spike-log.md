# Phase A Spike 决策记录：CarConcept 上车 + WASD 驾驶

> **文档性质**：roadmap §7.2 Step 5-6 / §7.3 Step 10 的 Spike 决策记录——**SRD 第 6 章「物理/车辆控制」行的淘汰条件裁决材料**。五项必填齐备：① 物理选型 + 参数表快照；② 双后端帧率读数；③ JS/资产实测体积 vs 门禁；④ 移动端摇杆可用性评语；⑤ 通过/止损结论。
> **代码落点**：`src/lab/modules/world/`（engine/vehicle/carRig/scene/inputs/camera/params 七件）+ 隐藏壳页 `/world-spike/`（noindex、不进 sitemap）+ 共享加载器 `src/lab/shared/gltf-loaders.ts`（configurator 与 world 公用）。
> **验证态**：环形道整圈驾驶 / 锥桶击飞 / R 复位 / boost+刹车 / 触摸摇杆，WebGPU 与 WebGL2（`?gl=1`）双后端自动化全绿；测试方法见 §6。

---

## 1. 物理选型结论（Step 5 决策点）

**裁决：路线 1「手写运动学控制器」通过，Spike 期内不切 Rapier。**

- 实现规模 ≈270 行（`vehicle.ts`）：自行车模型转向几何 + 纵/侧速度分解 + 四轮 raycast 贴地拟合（y/pitch/roll 阻尼跟随）+ 悬空抛体 + 软限速；零物理引擎依赖、零 wasm 字节。
- 半日手感评估（roadmap 判据）逐项：
  - **加速跟手度**：油门即走，0→50km/h ≈ 2s；松油门怠速指数滑行（folio `idleBrake` 连续化）✅
  - **转向阻尼**：输入→前轮角 11 s⁻¹ 阻尼插值 + 高速转角收紧（`1/(1+|v|·0.055)`），78km/h 巡航环形道不甩尾 ✅
  - **过锥桶反馈**：击飞初速与车速线性挂钩 + 车速按 0.965^hits 扣减——有代价不打断 ✅
  - **boost 漂移感**：Shift 下侧向抓地 ×0.55，高速过弯带可控滑移 ✅
  - **坡道**：raycast 丢地即进抛体（9.81 m/s²），冲坡有真实腾空 ✅
- **不切 Rapier 的理由**：上述判据全过，且运动学模型给了逐参数的手感控制权（Spike 的调参速度 > 刚体仿真的真实度收益）。Rapier `DynamicRayCastVehicleController` + folio 参数表（source-teardown §5.2）保留为 Phase B 的升级路径：翻车/碰撞体互推/悬挂三档 restLength 这三样运动学模型给不了，届时按 §5.2 参数表原封不动起步，并连带恢复 `Ticker.scale=2`（两套参数不可混搭，见 `params.ts` 头注）。

### 运动学模型必须显式补的两课（folio 靠引擎白拿的）

1. **超速回落**：folio 的软限速靠 Rapier 轮胎摩擦天然耗散超出部分；纯运动学积分下持续踩油门速度无界攀升（实测 126km/h 才发现）。补 `overspeedDecay=0.9 s⁻¹`：超过当前档软限速后按指数向限速回落。
2. **扫掠碰撞**：20fps × 35m/s 单步位移 1.75m，点对点距离检测会隧穿锥桶。碰撞参考点改「本帧运动线段上离锥桶最近的点」（胶囊扫掠的平面简化）。

## 2. 参数表快照（`params.ts` 单一事实源）

单位 SI（米/秒），不引入 folio 全局 2 倍速；标注 folio 对应物便于日后切换对照。

| 组 | 参数 | 值 | folio 对应/备注 |
|----|------|-----|----------------|
| 驱动 | `engineAccel` | 24 m/s² | `accel×300/(1+overflow)` 同型 |
| | `boostAccelFactor` | 1.7 | folio `1+boost×2` 收敛版 |
| | `topSpeed / topSpeedBoost / topSpeedReverse` | 18 / 28 / 7 m/s | ≈65 / 101 / 25 km/h |
| | `overflowSlope` | 1.6 | 软限速衰减斜率，无硬限速 |
| | `overspeedDecay` | 0.9 s⁻¹ | 运动学专属（见上第 1 课） |
| 制动 | `brakeDecel / reverseBrakeDecel` | 30 / 22 m/s² | folio brake=1 / 换向 0.4（×35 尺度） |
| | `reverseBrakeMinSpeed` | 0.6 m/s | folio 0.5 |
| | `idleDrag / rollingDecel` | 0.55 s⁻¹ / 1.1 m/s² | folio idleBrake 0.06 连续化 |
| 转向 | `maxSteer` | 0.6 rad | folio steering×0.5 直写；本站加阻尼 |
| | `steerSpeedDrop` | 0.055 | 高速收紧斜率 |
| | `steerLerpRate` | 11 s⁻¹ | 跟手度核心旋钮 |
| 抓地 | `gripRate` | 7.0 s⁻¹ | `sideFrictionStiffness=3` 运动学等价 |
| | `boostGripFactor` | 0.55 | boost 漂移感 |
| 贴地 | `rayLift / rayLength` | 1.6 / 4.0 m | 四轮 raycast |
| | `poseLerpRate` | 9 s⁻¹ | 悬挂柔度观感 |
| | `gravity` | 9.81 m/s² | 悬空抛体 |
| 视觉 | `visualRollK / visualPitchK / visualTiltMax` | 0.011 / 0.009 / 0.09 | 纯视觉戏剧化，不进物理积分 |
| 锥桶 | `kickSpeedFactor/Base` | 0.95 / 1.6 | 击飞初速挂车速 |
| | `kickUpFactor/Base · tumbleFactor · groundDrag · bounce` | 0.28/0.8 · 1.4 · 2.6 · 0.28 | 抛体+翻滚+落地摩擦 |
| | `carSpeedKeep` | 0.965/hit | 撞锥代价 |
| 场地 | `ringRadius / ringWidth / boundaryRadius` | 55 / 13 / 92 m | 环形道 + 轮胎墙软夹持 |

dt 纪律照抄 folio §5.3：车辆积分用 **30 帧滑动平均 dt**（与渲染瞬时 dt 分离），物理 dt clamp 1/20（低于 20fps 世界进慢动作而非隧穿）；帧率仪表读未 clamp 的墙钟真值。

## 3. 帧率读数（Step 9 门禁）

**测试环境没有 GPU**（云 VM、headless Chromium、SwiftShader 软件渲染），下列读数是**软件光栅化的硬下界**，不是真机读数；真机人工录测（§7.3 Step 9 口径：桌面 DevTools Performance 4x throttle 录 20s 连续驾驶；移动 chrome://inspect 连中端安卓 60s）列为 **Phase B 合并前动作**。

| 后端 × 视口 | avg fps | 1% low | 状态 |
|------------|---------|--------|------|
| WebGPU 1280×800 | 23.0 | 4.0 | 游戏循环/物理/遥测全程正常；画面白屏（见下） |
| WebGL2 1280×800 | 1.2 | 0.6 | 渲染正确，整圈/锥桶/复位全绿 |
| WebGL2 640×400 | 1.0 | 0.3 | 同上（小视口腿） |
| WebGL2 390×700（移动仿真） | ≈1 | — | 触摸摇杆全程可玩 |

- 仪表方法：rAF 墙钟 dt 环形窗 360 样本，avg + 1% low；HUD 常显 + `__worldSpike.fps()` 遥测。
- **硬件无关的帧率论证**（真机读数缺位期的依据）：场景复杂度实测 **121 draw calls / 225,236 triangles**、无实时阴影（车底接触阴影贴片）、锥桶/轮胎墙全 InstancedMesh、DPR 封顶移动 1.5 / 桌面 2。该复杂度低于同站 car-configurator（同一车模 + 影棚光）一个量级的场景开销预算，对 2019+ 中端安卓（Adreno 61x 级）30fps 是宽余量负载；不达标时 RR-04 三板斧（DPR→1、关装饰实例减半）仍备用。
- **SwiftShader WebGPU 环境缺陷记录**：`createBuffer(size=288, mappedAtCreation=true)` 反复 RangeError 导致白屏；隔离探针里同参数创建成功 → 判定为 SwiftShader Vulkan 资源上限问题而非应用 bug（真机 WebGPU 无此路径）。功能层（物理/输入/遥测/HUD）在 WebGPU 腿全绿。

## 4. 体积实测 vs 门禁（Step 9）

| 门禁 | 实测 | 判定 |
|------|------|------|
| 懒加载 JS ≤ 400KB gzip（Spike 从严） | **283.0KB**：world 入口 0.4 + engine 7.2 + 共享 three/loaders 248.4 + draco wrapper 11.5 + basis 14.7 + preload 0.7 | ✅ |
| `public/world/` 新增 ≤ 1MB | **0 字节**（目录不存在：地面/环形道 = 2048px 程序化画布纹理，锥桶/坡道/轮胎墙 = primitive 实例化） | ✅ |
| CarConcept 豁免口径 | 3.4MB 实测，位于 `public/models/car-concept/`，复用显式豁免（审计 P0-2）；HDRI 复用配置器现有 `studio_small_08_1k.hdr`，0 新增 | ✅ |
| 首页零 world 字节断言 | `audit-budget` ✅ PASS（world chunk/资产命中 0 处） | ✅ |
| noindex / sitemap | 壳页 `<meta name="robots" content="noindex">`；sitemap filter 排除 `/world-spike/`；`check-links` 0 条新增断链 | ✅ |

三 .js 中 248.4KB 是 `three/webgpu` 核心，与 car-configurator **共享同一 chunk**（本 Spike 顺手把两处 loader 栈合并为 `lab/shared/gltf-loaders.ts`）——配置器访问过的用户缓存命中后，world 增量只有 **≈7.6KB**。

## 5. 移动端摇杆可用性评语（Step 8）

自绘动态原点摇杆（`inputs.ts` 内 ~90 行，folio Nipple.ts 精简版，零第三方依赖）：按下生成原点、死区 18%、y 油门 x 转向、只认 touch/pen 指针不干扰鼠标。CDP 真触摸注入实测（390×700 移动仿真 + GL2 腿）：上推持杆 5s 达 40km/h、10s 达 72.9km/h，斜推航向偏转 0.28rad，松杆怠速滑行 73→23km/h，全链路（触点→意图→物理→HUD）无粘滞。**评语：可用性达标**；两处 Phase B 改进项——转向满舵映射偏灵（建议非线性曲线），摇杆基座无常显视觉锚点（首次上手要试探）。

## 6. 测试方法记录

- **自动化驾驶**：独立 Chromium（与共享 MCP 浏览器隔离）+ playwright-core，键盘事件闭环控制：期望航向 = 环形道切线 + 半径误差比例修正（`(r-55)×0.06`），A/D 开关式打舵，绕 55m 环形道**整圈**（累计弧度 > 2π 断言）；随后故意骑内/外线扫锥桶（击倒数断言 > 0）、R 复位（位置回出生点 + 锥桶清零轮询断言）、boost 峰值→空格刹停、12s 连续驾驶读帧率。WebGPU 与 `?gl=1` 两腿分别全绿（锥桶 7/6 只、复位 OK、boost 106km/h→刹停）。
- **触摸腿**：`Input.dispatchTouchEvent`（CDP 真触摸，非合成事件）驱动摇杆，遥测断言见 §5。
- **演示视频**：Playwright 录屏；软件渲染 ~1fps 下物理 dt clamp 使世界呈慢动作，视频 10× 时间压缩还原近实时观感。

## 7. 资产工程发现：CarConcept 轮组 rig 红线（Phase B 直接受用）

自动化截图审查揪出「悬浮轮胎」缺陷，排查结论（已修复于 `carRig.ts`，勿凭直觉重构）：

- 资产实况：场景唯一根 `BodyUnderside` 带 matrix=-90°X（Z-up 导出）；四个轮组节点用 **matrix** 承载「轮心平移 + 导出时随手转过的任意姿态旋转」（前轮甚至带着转向角）；轮组子网格（Rim/胎/卡钳/刹车盘）几何**原点居中**。
- 错误做法（曾上车）：拿包围盒中心当轮心——GLTFLoader 的 `boundingBox` 来自 accessor 声明、原点居中 → 轮心测成 0，四轮静止时全部叠在车体中心（恰被车身轮拱遮住，肉眼几乎看不出），一打方向/滚转就绕 ~1.8m 半径公转飞出车顶。
- 正确做法：**轮节点平移（父本地空间）即轮心**；烘死的姿态旋转刻意丢弃（不丢前轮呈内八字）；转向/滚转轴必须 `qParentInv` 换算进父节点 Z-up 本地空间（滚转轴 +X 恰好在 -90°X 下不变，纯属侥幸——这就是滚转「看起来一直对」而转向立刻穿帮的原因）。
- 验证：静止/满舵/行驶三态轮心世界坐标定量断言（满舵位移 0.000m）+ 倒车打轮截图复核。

## 8. 结论（Step 10 ⑤）

**通过。** Phase B（最小可玩）可排期：本 Spike 的 vehicle/carRig/inputs/camera 四模块按 `engine.ts` 头注的 tick 契约插进正式 Game 循环即可转正。条件项：**真机帧率录测（桌面 + 中端安卓）须在 Phase B 合并前补齐**——本记录的帧率证据链是「软件渲染下界 + 场景复杂度预算」，非真机读数；若中端安卓实测持续 <24fps 且三板斧无效，仍按 roadmap 止损路径执行（Spike 归档为 ai-lab 实验记录，世界降级 HOME-07/08 保守方案）。
