# AH-QE · 首页赛博城驾驭：Q/E 视角侧转（PUBG 式）调研与实施提案

| 项 | 内容 |
|---|---|
| 任务标识 | **AH-QE-LOOKAROUND**（首页赛博跑车 Q/E 环视增强） |
| 调研角色 | 多面 worker（Gemini 3.8 Flash） |
| 适用范围 | `/` 赛博城驾驶态（`driving` 上下文 + `third` 第三人称跟随） |
| 关联规范 | `docs/spec/cyber-city-vehicle-camera.md`（VEH-DES）· `docs/spec/cyber-city-camera-orbit.md`（CAM-ROT）· `src/lab/world/view/View.ts` |

---

## 0. 需求背景与 PUBG 对标核实

### 0.1 需求原文与理解
> 「首页赛博朋克赛车，在没有按 V 的情况下，实现按 Q 或 E 调整视角，类似绝地求生的驾驭一样：Q 车头向左转（视角），E 车头向右转，长按就一直扩大转角。」
- **核心交互**：第三人称视角下，Q/E 驱动**相机**绕车身水平偏航（Yaw）侧转，车体与底盘行进方向不变；长按转角持续增大至上限，松手平滑弹性回正。

### 0.2 PUBG 载具视角行为核实
| 维度 | PUBG 真实机制 | 本站对标落地口径 | 判定理由 |
|---|---|---|---|
| **转向触发** | 自由视角/按键侧转 | Q 偏航左转、E 偏航右转 | 匹配双手 WASD 驾驶指法 |
| **转角上限** | 载具视角限位 ±120°～±135° | **上限固定 ±135°**（`±0.75π rad`） | 超过 135° 产生后视逆向错觉并导致偏轴平移反向拉扯 |
| **松手行为** | **必自动回正（Snap-back）** | **指数衰减回正**（0.35s 收敛 95%） | 避免长久侧偏引发撞墙与空间失定向 |
| **回正速度** | 显著快于累积速率 | 累积 120°/s，回正等效初速 ≥300°/s | 松手即刻夺回行进主视野 |
| **车速阻尼** | 高速自由观察适度阻尼 | 超高速（>12 m/s）角速度衰减至 84°/s | 抑制高速旋转引发眩晕 |

---

## A. 键位冲突方案对比（≥3 案）

### 冲突根因定位
1. `src/data/world-pois.json` L12–15 将 `Keyboard.KeyE` 与 `Enter` 绑定为进站键，标点文案固定为 `E 进站`；
2. `src/lab/world/areas/InteractivePoints.ts` L181–186 注册 `poiInteract` 动作（categories: `['wandering', 'driving']`），标点展开时按 E 进站；
3. `src/lab/world/world/Reveal.ts` L51–52 键位卡冻结文案包含 `· E 进站`；
4. `e2e/cyber-city-feedback.spec.ts` L435–437 断言必含 `E 进站`；`e2e/cyber-city-poi-arrival.spec.ts` 等 5 个测试文件均以 `page.keyboard.press('e')` 验收进站。

### 方案 1：进站改键全局解耦（E 改 F 或 Enter，E 专职环视）
- **机制**：修改 `world-pois.json`，进站改为 `Enter` 或 `F`，Q/E 专职对称环视。
- **直觉**：驾驶/视角完全对称；但剥夺玩家主流「E=交互」本能。
- **改动面**：改 `world-pois.json`、`InteractivePoints.ts` 键帽、`Reveal.ts` HINT_TEXT。
- **e2e 影响**：**极高**。直接破坏 `feedback.spec.ts` 等 5 个测试文件的既有断言。
- **推荐度**：❌ 不推荐。

### 方案 2：按键时长滞回分流（圈内 E 短按进站，长按 ≥150ms 环视）
- **机制**：圈内按下 E 启动 150ms 计时器：150ms 内松开为短按进站；长按 ≥150ms 为向右环视并取消进站。圈外 0ms 立即环视。
- **直觉**：契合长按定义；但圈内进站延迟至 keyup 触发，手感稍黏。
- **改动面**：`InteractivePoints.ts` 改造 `poiInteract` 为释放沿判定。
- **e2e 影响**：低。Playwright `press('e')` 耗时极短（~20ms）大概率判定为短按。
- **推荐度**：⚠️ 备选。

### 方案 3：空间上下文互斥（圈内 E 进站，圈外 E 环视）
- **机制**：POI 圈内标点展开时，E 键仅响应进站，抑制向右环视；出圈后 E 恢复环视。Q 键恒为左环视。
- **直觉**：优良。公路上巡航自由环视，进站泊车停车后按 E 进站。
- **改动面**：`View.ts` 在 POI 展开时屏蔽 E 环视增量。
- **e2e 影响**：**零影响**。既有测试均在圈内按下，行为 100% 保持现状。
- **缺点**：停在圈内时 Q 可左转但 E 无法右转，存在微弱不对称。
- **推荐度**：✅ 推荐备选。

### 方案 4（最优推荐）：状态机天然优先级接管（圈外自由环视，圈内进站 Shot 冻结环视）
- **机制**：
  1. `Player.ts` 动作表增设 `lookRight`（绑 `KeyE`，categories: `['driving']`），与 `poiInteract` 物理键并存；
  2. **圈外**：按 E 时 `poiInteract` 无标点响应，`lookRight` 正常累加向右偏航；
  3. **圈内**：按 E 同帧，`InteractivePoints` L183–185 触发 `PoiArrival.begin()` 进入进站前奏；
  4. `PoiArrival.ts` L75 逐帧调用 `View.applyShot()` 接管相机位姿；
  5. `View.ts` 规定：**处于 Shot 预设或前奏生效态（`this.shotBaseline !== null`）时，`yawOffset` 强制归零且禁止写入**。
- **直觉**：巡航时 Q/E 对称环视；圈内按 E 即刻平滑切入进站前奏，逻辑天然自洽。
- **改动面**：纯 `View.ts` 内部状态守卫，无跨模块定时器。
- **e2e 影响**：**绝对零回归**。既有所有测试完整通行。
- **推荐度**：🌟 **最优推荐（内聚性最高、零副作用）**。

---

## B. 相机行为规格与防晕设计

### 1. 核心动力学参数
| 参数 | 推荐值 | 说明 |
|---|---|---|
| **角速度累积速率** | `120 deg/s`（`≈2.094 rad/s`） | 兼顾灵敏度与防晕要求 |
| **偏航角上限** | `±135°`（`±0.75π rad`） | 守住前向方位感知 |
| **回正阻尼速率** | `8.0 s⁻¹`（`1 - e^(-8·dt)`） | 约 0.35s 内收敛 95%，弹性利落 |
| **角速度硬钳** | `360 deg/s` | 防大 dt 突变产生视网膜撕裂 |
| **车速动态阻尼** | `1.0 - 0.3 * smoothstep(v, 12, 24)` | 车速 >12 m/s 时降至 84°/s |

### 2. 与 thetaDrift 微动及 lateral 偏轴构图的叠加
在 `src/lab/world/view/View.ts` L751–765 中：
1. **角度叠加**：
   ```ts
   const baseTheta = this.spherical.theta + this.framing.thetaDrift * Math.sin(this.game.ticker.elapsed * 0.13);
   const effectiveTheta = baseTheta + this.lookaround.yawOffset;
   ```
2. **构图平移（lateralOffset）判定**：
   - 城市首幕采用 **1/3 偏轴构图**（`framing.lateral = 4.2m`）。
   - **裁决**：`this.lateralOffset` **必须消费 `effectiveTheta` 投影**：
     ```ts
     this.lateralOffset
       .set(Math.cos(effectiveTheta), 0, -Math.sin(effectiveTheta))
       .multiplyScalar(this.framing.lateral);
     ```
   - **理由**：若消费 `baseTheta`，侧转 90° 时平移向量将垂直于视线，车体在屏幕中剧烈横移穿帮；消费 `effectiveTheta` 可确保车体**恒定锁定在屏幕 1/3 竖线上**，旋转仅表现为背景城市转动。

### 3. FPV (V 键) 模式为何默认不做
1. **需求口径约束**：磊哥原话「在没有按 V 的情况下」；
2. **资产约束**：`docs/spec/cyber-city-vehicle-camera.md` L71–74（D4 裁决）指出 CarConcept **无座舱内饰模型**，FPV 为挡风前沿机位，侧转会直接背面剔除穿帮；
3. **防晕法理**：同规范 D2 裁决「FPV 视线锁前向，延迟与偏航侧倾是第一人称头号晕源」。
- **结论**：`driveView.mode === 'fpv'` 时硬门封锁 Q/E 环视。

### 4. 移动端（触屏）策略
- **V1 明确不做，保持键盘专属**：依据 `cyber-city-vehicle-camera.md` D5 裁决，触屏双指已被 Nipple 摇杆与 RayCursor 占用；V2 可在 HUD 右下角设微型侧视按钮。

### 5. `prefers-reduced-motion` 处理
- `src/lab/world/view/View.ts` L224–226 已注入 `this.reducedMotion`；
- 当为 `true` 时，松手回正**禁用指数缓动，单帧直接硬切归零（`yawOffset = 0`）**，消除持续滑动对前庭系统的刺激。

### 6. 防晕规范（引用 Visual Rubric 与 Vehicle Spec）
- 依据 `docs/research/cyber-city-visual-rubric.md` V5 及 `docs/spec/cyber-city-vehicle-camera.md` R6：
  1. **极角（Phi 75°）与滚动角（Roll 0°）绝对冻结**，地平线恒定平直；
  2. **一阶指数低通回正，杜绝弹簧过冲（No overshoot）振荡**；
  3. **门外恒 +0（IEEE 逐位恒等）**，静止与首幕零漂移。

---

## C. 架构落点与实现接线（file:line）

### 1. `src/lab/world/player/Player.ts`
- 在 [L161](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/src/lab/world/player/Player.ts#L161) `toggleDriveView` 后追加：
  ```ts
  { name: 'lookLeft',  categories: ['driving'], keys: ['Keyboard.KeyQ'] },
  { name: 'lookRight', categories: ['driving'], keys: ['Keyboard.KeyE'] },
  ```
- **闸门纪律**：仅 `['driving']`，首幕 `robot_idle`/`transforming`（`intro` filter）物理拦截。

### 2. `src/lab/world/view/View.ts`
- **状态维护**：增设私有子状态 `lookaround = { yawOffset: 0 }`；
- **更新插点**：在 [L741](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/src/lab/world/view/View.ts#L741) `updateLookahead()` 之后、[L749](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/src/lab/world/view/View.ts#L749) 半径计算之前插入 `this.updateLookaround(focusPointSpeed);`；
- **逻辑实现**：
  ```ts
  private updateLookaround(speed: number): void {
    const dt = this.game.ticker.delta;
    const gateOpen =
      this.driveView.gate === 'driving' &&
      this.driveView.mode === 'third' &&
      this.shotBaseline === null;

    if (!gateOpen) {
      this.lookaround.yawOffset = 0;
      return;
    }

    const isLeft = this.game.inputs.actions.get('lookLeft')?.active ?? false;
    const isRight = this.game.inputs.actions.get('lookRight')?.active ?? false;
    const inputDir = (isLeft ? 1 : 0) - (isRight ? 1 : 0);

    if (inputDir !== 0) {
      const speedFactor = 1.0 - 0.3 * smoothstep(speed, 12, 24);
      const rate = (120 * Math.PI / 180) * speedFactor;
      const maxYaw = 135 * Math.PI / 180;
      this.lookaround.yawOffset = clamp(this.lookaround.yawOffset + inputDir * rate * dt, -maxYaw, maxYaw);
    } else {
      if (this.reducedMotion) {
        this.lookaround.yawOffset = 0;
      } else {
        this.lookaround.yawOffset += (0 - this.lookaround.yawOffset) * (1 - Math.exp(-8.0 * dt));
        if (Math.abs(this.lookaround.yawOffset) < 1e-4) this.lookaround.yawOffset = 0;
      }
    }
  }
  ```
- 将 `effectiveTheta = theta + this.lookaround.yawOffset;` 喂给 [L754](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/src/lab/world/view/View.ts#L754) 及 [L763](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/src/lab/world/view/View.ts#L763)。

### 3. `src/lab/world/view/CameraShots.ts`
- [L95](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/src/lab/world/view/CameraShots.ts#L95) `RELEASE_ACTIONS`：**明确不加入**。环视不是车辆位移驾驶意图；Shot 期间直接由 `shotBaseline !== null` 门禁封锁环视。

### 4. 观测规格（SessionTimeline）
- 高频 tick 零打点；可选在 `SessionTimeline.ts` 登记边缘事件 `'cam-lookaround'`。V1 建议不登记以守住白名单。

### 5. HUD 键位提示
- `src/lab/world/world/Reveal.ts` [L51-52](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/src/lab/world/world/Reveal.ts#L51-L52)：
  - 修改为：`'W/A/S/D 或方向键驾驶 · Shift 加速 · Space/B 刹车 · V 切换视角 · Q/E 视角侧转 · F 悬挂跳 · R 回到路口 · E 进站 · Esc 菜单 · M 地图'`；
  - 向后兼容 `cyber-city-feedback.spec.ts` [L435-437](file:///Users/wanglei/studio-data-root/worktrees/website-about-hall/e2e/cyber-city-feedback.spec.ts#L435-L437) 的 `toContainText` 断言。

---

## D. 验收标准与自动化 e2e 断言设计

可直接落入 `e2e/cyber-city-view-lookaround.spec.ts`：

```ts
test.describe('科技城驾驶态 Q/E 视角侧转验收（AH-QE）', () => {
  // 断言 1：偏转与回正
  test('CITY-QE-01: 按住 Q 500ms 相机偏航 >30°，松手 600ms 内回正至 <2°', async ({ page }) => {
    await enterDrivingMode(page);
    const initialTheta = await getCameraTheta(page);

    await page.keyboard.down('q');
    await page.waitForTimeout(500);
    const turnedTheta = await getCameraTheta(page);
    expect(turnedTheta - initialTheta).toBeGreaterThan(30 * Math.PI / 180);

    await page.keyboard.up('q');
    await page.waitForTimeout(600);
    const restoredTheta = await getCameraTheta(page);
    expect(Math.abs(restoredTheta - initialTheta)).toBeLessThan(2 * Math.PI / 180);
  });

  // 断言 2：FPV 模式屏蔽
  test('CITY-QE-02: 按 V 进入 FPV 模式后，按住 Q 视角保持锁前向零偏转', async ({ page }) => {
    await enterDrivingMode(page);
    await page.keyboard.press('v');
    await expect(page.locator('[data-world-host]')).toHaveAttribute('data-drive-view', 'fpv');

    await page.keyboard.down('q');
    await page.waitForTimeout(500);
    await page.keyboard.up('q');

    expect(await getLookaroundOffset(page)).toBe(0);
  });

  // 断言 3：POI 圈内互斥与进站前奏
  test('CITY-QE-03: 圈内按 E 触发进站前奏且冻结环视；圈外按 E 触发向右环视', async ({ page }) => {
    await enterDrivingMode(page);
    // ① 圈外
    await page.keyboard.down('e');
    await page.waitForTimeout(500);
    expect(await getCameraTheta(page)).toBeLessThan(0);
    await page.keyboard.up('e');

    // ② 圈内
    await teleportToPoiBay(page, 'about-pavilion');
    await page.keyboard.press('e');
    const dump = await dumpSession(page);
    expect(dump.events.some(e => e.type === 'world-poi')).toBe(true);
    expect(dump.events.some(e => e.type === 'shot-apply')).toBe(true);
    expect(await getLookaroundOffset(page)).toBe(0);
  });

  // 断言 4：首幕恒等门
  test('CITY-QE-04: robot_idle 期间长按 Q/E 物理拦截，相机位姿逐字节恒等', async ({ page }) => {
    await waitForReadyState(page, 'robot_idle');
    const poseBefore = await captureCameraShotPose(page);
    await page.keyboard.down('q');
    await page.waitForTimeout(500);
    await page.keyboard.up('q');
    const poseAfter = await captureCameraShotPose(page);
    expect(poseAfter).toEqual(poseBefore);
  });
});
```

---

## E. 董事会/指挥官 8 行决策包

```markdown
1. 交互形态：第三人称驾驶下 Q 左转 / E 右转视角，角速度 120°/s，上限 ±135°，松手 0.35s 弹性回正。
2. 键位解冲突（核心）：采纳「状态机优先级接管案」——圈外 E 自由环视，圈内 E 触发进站运镜前奏；前奏同帧冻结环视，既有 52/52 e2e 零改动、零回归。
3. FPV 处理：严格遵守磊哥需求口径与 D2 裁决，按 V 后 Q/E 物理封锁，守住无内饰防穿帮与第一人称防晕红线。
4. 构图协调：View.ts lateralOffset 偏轴平移同步消费 effectiveTheta，车体永远锁死在屏幕 1/3 黄金分割线，杜绝晃动。
5. 动效降级：prefers-reduced-motion 下松手回正单帧硬切直出归零，杜绝低频滑动眩晕。
6. 中断纪律：Q/E 明确不进 RELEASE_ACTIONS（环视≠驾驶意图），前奏运镜期间 Q/E 输入静默丢弃。
7. HUD 文案：Reveal.ts 键位卡串尾加法插入「· Q/E 视角侧转」，向后兼容现有 feedback 文案断言。
8. 施工预算：预计 1 个前端视觉/逻辑 worker，改动 View.ts（~40 行）+ Player.ts（2 行）+ Reveal.ts（1 行），单 PR 聚焦可收口。
```

---

## 实际查阅文件清单
- `src/lab/world/player/Player.ts` L130–180（动作表注册与 tick 节拍）
- `src/data/world-pois.json` L1–40（POI 进站 E/Enter 键位定义）
- `src/lab/world/view/View.ts` L1–817（双相机管线、球坐标计算、thetaDrift、lateralOffset、lookahead、updateFpv）
- `src/lab/world/view/CameraShots.ts` L1–100（RELEASE_ACTIONS 清单与 shot 预设定义）
- `src/lab/world/areas/PoiArrival.ts` L1–120（进站前奏 tween/hold 与驾驶意图中断）
- `src/lab/world/areas/Areas.ts` L100–200（泊车位光圈、标点挂载与 onInteract 调用）
- `src/lab/world/areas/InteractivePoints.ts` L90–220（`poiInteract` 动作注册与状态响应）
- `src/lab/world/inputs/Inputs.ts` L1–283（动作路由、categories 过滤与 trigger 语义）
- `src/lab/world/world/Reveal.ts` L40–100（HINT_TEXT 与 STATUS_TEXT 常驻文案）
- `e2e/cyber-city-feedback.spec.ts` L430–480（键位卡文案硬断言）
- `e2e/cyber-city-poi-arrival.spec.ts` L120–160, L330–380（E 进站断言与恒等门）
- `docs/spec/cyber-city-vehicle-camera.md` L1–300（D1–D5 裁决、V 键硬切、防晕预算、双相机管线）
- `docs/spec/cyber-city-camera-orbit.md` L1–100（G5 相机纪律历史、受控临时环视、指数衰减回正）
- `docs/research/cyber-city-visual-rubric.md` L1–150（V5 动效与转场、防晕降级标准）
