# AH-QE-lookaround 收稿 · 首页赛博城 Q/E 视角侧转

| 项 | 内容 |
|---|---|
| 票 | AH-QE-lookaround（PUBG 式载具环视：Q 左 / E 右，长按扩大转角，松手弹性回正） |
| 规格单源 | `docs/local-cmd/proposals/AH-QE-lookaround.md`（方案 4 + §B 参数 + §C 落点 + §D 验收） |
| 工作目录 | `/Users/wanglei/studio-data-root/worktrees/website-about-hall`（未 commit / 未 push / 未占 4321） |
| 日期 | 2026-09-03 |

## 1. diff --stat

```
 src/lab/world/player/Player.ts |  8 ++++
 src/lab/world/view/View.ts     | 99 +++++++++++++++++++++++++++++++++++++++++-
 src/lab/world/world/Reveal.ts  |  4 +-
 3 files changed, 109 insertions(+), 2 deletions(-)
 e2e/cyber-city-lookaround.spec.ts | 333 +（新建）
```

文件域未越界：`Areas.ts` / `PoiArrival.ts` / `CameraShots.ts` / `camera-shots.json` /
`cyber-city-buildings.json` / `CityBlocks.ts` / `world-pois.json` / `HallChrome.astro` 全部零改动。
`docs/spec/assets/e2e-batch1/*.png`（跑全量时被历史用例重写）已 `git checkout` 还原。

## 2. 动作表与参数

动作表（`Player.setInputs`，加在 `toggleDriveView` 之后）：

| name | categories | keys |
|---|---|---|
| `lookLeft` | `['driving']` | `Keyboard.KeyQ` |
| `lookRight` | `['driving']` | `Keyboard.KeyE` |

不进 `TransformSystem.DRIVE_ACTIONS`、不进 `View.focusActionsNames`、不进
`CameraShots.RELEASE_ACTIONS`——环视不是驾驶意图：不把 `car_ready` 顶成 `driving`、
不夺焦点跟踪、不中断进站运镜。

动力学（`View.ts` 常量 `LOOKAROUND` 单源）：

| 参数 | 值 | 说明 |
|---|---|---|
| 累积角速度 | 120°/s | 提案 §B.1 |
| 偏航上限 | ±135° | `clamp` 硬钳，e2e 断言不越界 |
| 抵近减速带 | 最后 10°，`smoothstep(headroom, 0, 10°)` | 到限位是「靠稳」不是「撞停」；反向推回时满速（headroom 按方向算） |
| 回正 | 一阶指数 `1−e^(−8·dt)`，0.35s 收敛 95% | 无过冲、无弹簧振荡；\|yaw\|<1e-4 吸附到精确 0 |
| 车速阻尼 | `1 − 0.3·smoothstep(v, 12, 24)` | >12 m/s 降至 84°/s |
| reduced-motion | 按住仍可环视；松手单帧硬切归零 | 提案 §B.5 |

门（三条全开才收输入，任一不满足即写回**精确 0**）：
`driveView.gate === 'driving'` × `driveView.mode === 'third'` × `shotBaseline === null`。
切 V 的同帧另有一次显式归零（进 FPV 锁前向、回 third 不带残角）。

构图叠加：`theta = spherical.theta + thetaDrift·sin(...) + yawOffset`，机位球坐标与
`lateralOffset` 偏轴平移**消费同一个 theta**——侧转时平移向量与视线保持共面，车体锁在
屏幕 1/3 竖线（回正截图与上限截图对照可见车体横向位置基本不动，只有背景城市在转）。

调试出口：`View.lookYaw`（只读 getter，弧度）。经既有 `#debug` 句柄
`__worldSpikeGame.view.lookYaw` 取证，**未新增任何全局**、未改 `index.ts`。

HUD：`Reveal.HINT_TEXT` 串尾加 `· Q/E 视角侧转`（VEH spec §8.2 冻结序不动，纯加法）。
无新 HUD 元素 / 无图标 / 无音效 / 无新增循环动画。

## 3. e2e 数字

跑法：`pnpm exec astro check`（0 errors / 0 warnings）→ `pnpm build` → 4635 端口
detached preview（先证空闲，pid 落 `~/.codex/state/about-hall/preview-4635.pid`，收尾已杀、
端口只剩 TIME_WAIT）→
`env -u CI E2E_PORT=4635 pnpm exec playwright test e2e/cyber-city-lookaround.spec.ts e2e/cyber-city-poi-arrival.spec.ts --no-deps --workers=1 --retries=0 --reporter=list`

结果：**6 passed / 1 failed（11.8m）**

| # | 用例 | 结果 | 时长 |
|---|---|---|---|
| 1 | CITY-QE-01 环视全链 | ✓ | 4.2m |
| 2 | CITY-QE-02 深链泊位 | ✓ | 1.1m |
| 3 | CITY-PA-01 前奏时序 | ✓ | 1.4m |
| 4 | CITY-PA-02 驾驶中断 | ✓ | 1.2m |
| 5 | CITY-PA-03 reduced-motion | ✓ | 57.1s |
| 6 | CITY-PA-04 恒等门 | ✓ | 1.4m |
| 7 | AH-T1b hold overlay | ✘ | 1.5m |

CITY-QE-01 六腿（单次 ritual 挂载串完）：
⓪ `robot_idle` 期按 Q 被 filters(intro) 物理拦截，`lookYaw === 0`；
① 按住 Q → `lookYaw > 40°`，且输出相机世界方位（`atan2(x,z)`）同步转过 >30°（取景真值，
非只有内部读数）；② 继续按住 → `> 125°` 进减速带，再等 3s 仍 `≤ 135°`（不越界）；
③ 松手 → `|yaw| < 3°` 且最终确定性 `=== 0`；④ 圈外按住 E → `< −40°`，`world-poi` 零事件、
navigate 零命中；⑤ 按 V 进 FPV → 按住 E 连采 6 拍 `lookYaw === 0`，切回 third 无残角；
⑥ `#debug` 摆位到 about-pavilion 泊位圆心按 E → `world-poi` → `shot-apply{poi_showcase-about-pavilion}`
（seq 序），前奏 tween/hold 全窗按住 E 连采 5 拍 `lookYaw === 0`。

CITY-QE-02 = 票面字面口径的 `?poi=about-pavilion` 深链腿：出生即在泊位，按 E 进站前奏照常、
navigate 被 route abort 拦下、全程 `lookYaw === 0`。

**时长纪律**：提案 §D 写的 500ms/600ms 是设计秒。SwiftShader 下 `Ticker.delta` 钳在 1/30s，
1fps 时 500ms 墙钟只推进约一帧游戏时间，把它当墙钟阈值必然假阴性。因此断言一律走
「按住 + 轮询到阈值」，断的是状态语义（按住必到位、松手必回零、门内恒 0），不是时长——
与 `cyber-city-poi-arrival.spec.ts` §2-4 既有纪律同源。

### 唯一红灯：AH-T1b（**非本票，基线复现**）

`e2e/cyber-city-poi-arrival.spec.ts:372` 的 AH-T1b hold overlay 是**另一票在改的在途用例**
（该 spec 与 `PoiArrival.ts` 在本 worktree 里都处于他人未提交状态）。它断的是墙钟
「overlay 存活 ≤1200ms」，本机实测 2280ms。

已做基线证伪：`git stash` 掉本票三个源文件 → 重新 `pnpm build` → 单跑 `-g "AH-T1b"`，
**同样失败**（`Timeout 2500ms exceeded while waiting on the predicate`）。结论 = 宿主负载下的
墙钟阈值用例，与 AH-QE 无因果（本票只在 `View.update` 里多了十来次算术，不可能给 400ms
的 DOM 计时器加上 1.9s）。未刷绿、未放宽、未碰该文件。

另注：第二轮按票面原样带 `--no-deps` 之外的依赖链跑时，`desktop-chromium` 的
`tts-cockpit` 用例失败导致 world-chromium 被 Playwright 整组跳过；第三轮加 `--no-deps`
只跑本票相关两文件取得干净信号。该 tts 用例同样与本票无关。

## 4. 截图

- 按住 Q 到上限：`evidence/about-hall/QE/qe-hold-q-limit.png`
- 松手回正后：`evidence/about-hall/QE/qe-release-recentered.png`

对照点：上限帧背景城市已转过约 3/4 圈、车体仍钉在屏幕左 1/3 竖线；回正帧恢复标准前向构图，
车体横向位置与上限帧基本一致——证明 `lateralOffset` 消费 `effectiveTheta` 的裁决生效。

## 5. 设计取舍（指挥官需知）

1. **Nipple 射线 / optimalArea / focusPointSpeed 全部不受影响。** 本票只改 `theta` 这一路
   加法通道，而 `theta` 喂的是 `spherical.offset` → `defaultCamera` 位姿。三个消费面里：
   `optimalArea.update()` 是自己另起 `offset.setFromSphericalCoords(radiusMax, phi, this.spherical.theta)`
   算的（读的是**基准 theta 字段**，不读逐帧 `theta` 局部量），环视零影响；Nipple 射线与
   `focusPointSpeed` 分别走 `defaultCamera` 求交与平滑焦点位移——焦点位置这一路完全没动，
   环视只转机位不移焦点。唯一「变了」的是环视期间 Nipple 摇杆的方向解算基准会随相机转
   （触屏 + 键盘同用的极小交集；V1 触屏本就不给 Q/E，键盘用户不走 Nipple）。
2. **门口径按提案取 `gate === 'driving'`（与 lookahead 同门），不是 V 键的 `car_ready|driving`。**
   代价：刚变形完、还没碰过 WASD 时按 Q/E 无反应（按一下 W 之后永久可用）。收益：与
   lookahead 同门同论证，`robot_idle` 首幕帧的 poster 逐字节恒等合同零新增论证负担。
   若指挥官更看重「停车即可环视」，把门放宽到 `car_ready` 是一行改动，但要重跑恒等门腿。
3. **键位冲突用状态机优先级接管（方案 4），没动进站键。** 圈内按 E 同帧 `PoiArrival.begin()`
   采 `shotBaseline`，本通道立刻闭门并归零——`Areas.ts`/`PoiArrival.ts`/`world-pois.json` 零改动，
   既有 5 个进站用例零回归（本轮 PA-01..04 全绿实证）。副作用：停在圈内时 Q 能左转、E 只进站，
   存在微弱不对称——这是方案 4 与方案 3 共有的代价，提案已登记。
4. **上限用 smoothstep 减速带而非硬 clamp**，所以按住 Q 是渐近逼近 135° 而不是「啪」地贴死；
   e2e 上限腿的阈值取 125°（进减速带）+ ≤135°（不越界）两条，避免对渐近过程设不可达阈值。
5. **HUD 文案走串尾加法**（`… · M 地图 · Q/E 视角侧转`），没插进 VEH spec §8.2 的冻结序，
   `cyber-city-feedback.spec.ts` 的 `toContainText` 清单零改动。措辞只述键义、不承诺场景
   （FPV 下无效这件事键位卡不分模式，不写进卡里免得文案膨胀）。
6. **`?poi=` 深链路径（非 ritual）本就没有 `driving` 上下文**（无 TransformSystem，filters 停在
   `wandering`），Q/E/V 全都不放行。所以 CITY-QE-02 那条腿在语义上是「零回归证明」而非
   「圈内互斥证明」；真正的圈内互斥证明在 CITY-QE-01 ⑥ 腿（ritual 驾驶态 + `#debug` 摆位）。

---

## r2 · 门放宽到 car_ready（指挥官终审补洞，2026-09-03）

**裁决**：磊哥预期 = 变形成车后、没按 V 的任何时刻都能环视。原 r1 门口径
`gate === 'driving'` 让「刚变形完、还没碰 WASD」这一段哑火，予以放宽。

**改法（只动 `View.updateLookaround` 的门判定，其余逻辑一行未改）**

```diff
-      this.driveView.gate !== 'driving' ||
+      (gate !== 'car_ready' && gate !== 'driving') ||
         this.driveView.mode !== 'third' ||
         this.shotBaseline !== null
```

口径落定：环视门 = **V 键（`toggleDriveView`）同门**（`gate ∈ {car_ready, driving}`），
比 lookahead 宽一档。分界理由写进头注：lookahead 是行进构图件，无速度即无意义，
继续守 `'driving'`；环视是静止也成立的观察行为，跟「已成车 + 第三人称」绑定即可。
`robot_idle` / `transforming` 仍在门外——**首幕恒等合同零变动**（poster 帧
`gate === 'robot_idle'`，门关写回精确 0 的路径与 r1 逐字节一致）。
FPV 封锁、前奏冻结（`shotBaseline !== null`）、门外精确写 0 三条全部原样保留。

**e2e 补腿**：CITY-QE-01 新增 ⓪′ 腿——变形到 `car_ready` 后**先不碰 WASD**直接按住 Q，
断 `lookYaw > 40°`，同时断 `data-world-state` 全程仍是 `car_ready`（环视不进
`DRIVE_ACTIONS` 的机器证：不会把状态顶成 driving），松手回精确 0 后才压 W 进驾驶态跑其余腿。

**diff --stat（r2 累计）**

```
 src/lab/world/player/Player.ts |   8 ++++
 src/lab/world/view/View.ts     | 105 ++++++++++++++++++++++++++++++++++++++++-
 src/lab/world/world/Reveal.ts  |   4 +-
 3 files changed, 115 insertions(+), 2 deletions(-)
 e2e/cyber-city-lookaround.spec.ts | 349 +（新建）
```

**跑法与结果**：`pgrep -f 'playwright test'` 无在跑 → `pnpm exec astro check`（0 错 0 警，187 文件）
→ `pnpm build` → 4637 python socket 证空闲 + `start_new_session` detached preview
（pid 落 `~/.codex/state/about-hall/preview-4637.pid`，收尾按 pid 已杀、端口无 listener）
→ `env -u CI E2E_PORT=4637 pnpm exec playwright test e2e/cyber-city-lookaround.spec.ts --no-deps --workers=1 --retries=0 --reporter=list`

**2 passed / 0 failed（5.4m）**

| # | 用例 | 结果 | 时长 |
|---|---|---|---|
| 1 | CITY-QE-01 环视全链（含 ⓪′ car_ready 腿） | ✓ | 4.5m |
| 2 | CITY-QE-02 深链泊位 | ✓ | 58.6s |

截图已按 r2 构建重拍（同路径覆盖）：`qe-hold-q-limit.png` / `qe-release-recentered.png`。
未 commit、未 push、未占 4321。

**r1 §5 取舍第 2 条作废**（「刚变形完按 Q 无反应」的代价随本次放宽消失）；其余取舍不变，
其中「Nipple / optimalArea / focusPointSpeed 零影响」的论证与门口径无关，继续成立。
