# Cyber City Loop 8 驾驶 UX 二轮独立审计（CC-AL-VEH-R2）

| 项 | 内容 |
|---|---|
| 审计角色 | CC-AL-VEH-R2 · GPT-5.6 Sol 独立复审 |
| 审计对象 | `main@bad4f546ef402807c9ed18cdab5337a8830b9b76` |
| 定向整改 | PR [#63](https://github.com/rayw-lab/website/pull/63) · head `554f119ac9ee566de341d6b486decd1faabecc85` · merge `28287e213042e5d660832c63805e1cb0132b3b81` |
| 上轮裁决 | PR [#58](https://github.com/rayw-lab/website/pull/58) · `docs/research/loop-veh-audit.md` · NO-GO（5/7） |
| 日期 | 2026-08-27（UTC） |
| 裁决 | **NO-GO（6/7；两项原阻断已关闭，当前唯一阻断为 exact 全量 e2e 未取得全绿）** |

## 0. 裁决

**NO-GO。** VEH-C2 对上轮两项点名缺口的实现方向与机器断言均正确：

1. `drive_third` / `drive_fpv` 已进入 `camera-shots.json`，`View.ts` 直接消费两组
   注册值，内联双源与 `TODO(CC-CAM...)` 已删除；
2. `third→fpv` 在切换函数内立即把输出相机写到注册表基础 FOV 58°，后续仅
   `0..6°` speed kick 分量低通；reduced-motion 下 kick 目标与驻留均为 0，
   因而 FPV 逐帧恰为 58°；
3. exact 定向用例 `CITY-VEH-05` + `CITY-VEH-07` 实跑 **2/2**，包含
   reduced-motion 的切入 58°、2s 稳定 58°、切回 42°以及注册表消费合同；
4. PR #63 exact CI 的 check/build/links/budget/Lighthouse 全绿，`/` 与 `/home/`
   三轮中位数均为 **100/100/100/100**。

但硬门 #2 要求的是当前合同数的**完整 suite 全绿**，不是定向用例全绿。VEH-C2 exact
全量实跑列出 65 项，结果为 `44 passed / 3 failed / 18 did not run`；失败发生在
FXN/OBS/既有 CITY 链且呈软渲染超时/行车路线不达，并非两个 VEH-C2 补洞的直接回归，
但“与本补洞无关”不能替代全量绿证据。故两项原始阻断销账，发布门仍保持关闭。

重新取得 `retries=0`、`failed=0`、`skipped=0` 的 65/65 后，本报告可原地升为 GO；
升灯前不写 `cyber-city-vehicle-diag-score.json`，也不写生产 visual/function score。

## 1. 七项专项硬门

| # | 硬门 | 二轮独立证据 | 判定 |
|---:|---|---|:---:|
| 1 | driving 态 V 键 third↔FPV（VEH-01） | 动作仍仅绑定 `Keyboard.KeyV` + `categories:['driving']`；View 冗余门仍只放行 `car_ready/driving`。VEH-C2 未改输入/状态机，只在既有 `setDriveViewMode` 补 FOV；联合旅程保留 `robot_idle` 门禁、`car_ready` 不触发 driving、FPV 驾驶与 driving 往返断言 | ✅ |
| 2 | e2e 全 suite 绿 | VEH-C2 exact `pnpm test:e2e`：列出 65 项，`44 passed / 3 failed / 18 did not run`。失败为 `CITY-FB-01…04` 600s 超时、`CITY-OBS-01` 驾驶未达泊车位、`CITY-E2E-03` transforming→car_ready 120s 超时；无 clean 65/65 | **❌** |
| 3 | `ritual_idle` 恒等 | VEH-C2 前后 `public/posters/` tree id 同为 `09a04c0b8ee1e5d6e1a56e856bb9a1ba02d7f9fd`；JSON 的 `ritual_idle` 子树逐字段不变。新增 drive entries 为尾部加法；View 的 robot_idle 门、third 直通与 lookahead `+0` 路径未改 | ✅ |
| 4 | G5 无 free 漫游 | VEH-C2 未新增相机输入或依赖。`CameraShots.ts` 对 `mode==='drive'` 深链请求直接告警早退；动态 vehicle anchor 不进入 `applyShot`，没有 pointer/wheel→相机姿态映射 | ✅ |
| 5 | `drive_third` / `drive_fpv` 与注册表对齐 | 两 key 与 §7.1 冻结值已登记；`View.ts` 的 `DRIVE_LOOKAHEAD` / `DRIVE_FPV` 分别直接引用 `cameraShots.shots.drive_third.dynamics.lookahead` 与 `.drive_fpv.rig`。`CITY-VEH-07` 对 key、关键值、消费入口、TODO 清除及 ritual frozen 守卫实跑通过 | ✅ |
| 6 | LHCI `/` + `/home/` 不降 | PR #63 exact CI [33051490475](https://github.com/rayw-lab/website/actions/runs/33051490475) 成功；artifact 21 份 LHR（7 URL×3）。`/` 与 `/home/` 的 P/A/BP/SEO 三轮及中位数均为 100/100/100/100，相对上轮满分 delta 全 0 | ✅ |
| 7 | reduced-motion 路径不受影响 | `setDriveViewMode('fpv')` 先写注册表 `fovDeg` 并更新投影；`updateFpv` 只低通 `fpvState.fovKick`，rm 下目标 0。`CITY-VEH-05` exact 通过：切入 58、2s 后仍 58、切回 42；V 往返与 instant transform 同例通过 | ✅ |

## 2. 上轮两项阻断销账

### 2.1 阻断 A：drive shot 注册表单源

`camera-shots.json` 保持 `schemaVersion: 1`，新增：

- `drive_third`：`mode=drive`、vehicle anchor、third 静态快照以及完整
  `dynamics.lookahead`；`speedSource=focusPointSpeed`；
- `drive_fpv`：vehicle anchor、offset `(0.35,0.55,0)`、基础 FOV 58、kick
  `6° @ 8..24m/s / 3s⁻¹`、姿态传递与前向锁定。

运行时链已闭合：

```text
camera-shots.json
  ├─ drive_third.dynamics.lookahead ─→ View.DRIVE_LOOKAHEAD
  └─ drive_fpv.rig                  ─→ View.DRIVE_FPV
```

`CameraShots.ts` 的 drive union 与 `tools/camera/audit-shot-ndc.mjs` 的 drive 早退
也正确区分了“驾驶动态参数”与“静态深链 shot”，没有为了登记 drive key 而误开放
`?shot=drive_*`。上轮阻断 A **关闭**。

### 2.2 阻断 B：reduced-motion FPV FOV 硬切

切换与逐帧更新现在分责：

```text
third → fpv：camera.fov = 58；立即 updateProjectionMatrix()
正常驾驶：camera.fov = 58 + lowpass(speedKick, 0..6)
reduced-motion：speedKick target = 0；camera.fov = 58 + 0
fpv → third：camera.fov = 42；立即 updateProjectionMatrix()
```

这消除了上轮 `42→43.52→…→58` 的基础档渐近；位置、姿态与透视都在同一个 V
切换节拍完成，符合 spec D3“硬切天然同形”与 §10“FOV kick 关（恒 58°）”。
`CITY-VEH-05` 的首采样、稳定窗及返回腿均取引擎 `__worldSpike.state().fov`
真值，不是只看 DOM mode。上轮阻断 B **关闭**。

## 3. V5 / 驾驶 UX 独立诊断分

| 诊断项 | 上轮 | 二轮 | 变化 | 独立依据 |
|---|---:|---:|---:|---|
| **V5 驾驶动效 / 镜头转场** | 66 | **74/100** | +8 | V 硬切、yaw 直通、pitch/roll 衰减、lookahead 限速与 speed-kick 低通本就构成完整驾驶镜头骨架；本轮把基础 FOV 档差从错误低通中剥离，正常与 rm 都恢复单一、可解释的切换节拍，达到 V5 70–85 段下部。仍缺次级镜头打磨与更强车体参照，不上探 80 |
| **驾驶 UX** | 77 | **82/100** | +5 | V 提示、状态门禁、往返、FPV 持续驾驶、复位、无 free-roam 与 rm 操作保留均清楚；58° 即时档差恢复视角切换反馈及静止偏好可信度。挡风/引擎盖前缘参照仍不够明确，触屏 FPV 仍按 V1 明确不做 |

以上是 VEH 专项**诊断量**，不替代 `cyber-city-visual-rubric-score.json`，不进入
`scripts/score-loop.mjs`，也不冒充功能生产登记。因当前裁决非 GO，本轮不新增独立
诊断 JSON；升灯时再登记二轮分与证据。

## 4. 非阻断观察

1. `drive_fpv.status` 仍为 `proposal`，但 notes 已声明 offset 与实装校准值一致；这不影响
   参数单源或运行时合同。若后续形成资产级机位验收，可把 status 单独转正，勿借机调参。
2. 上轮帧里道路/反射约占半帧、引擎盖前缘参照较弱。本轮没有改机位或资产，故该视觉
   打磨欠账仍在；它限制诊断分上限，但不反向否定已通过的功能/静止偏好合同。
3. 触屏保持 third 是 spec D5 的 V1 明示非目标，不应以“缺触屏 FPV”判本轮失败。

## 5. 命令与证据摘要

| 命令 / 证据 | 结果 |
|---|---|
| `git rev-parse bad4f54` | `bad4f546ef402807c9ed18cdab5337a8830b9b76` |
| `git diff 8236d5e..554f119 -- src/data/camera-shots.json src/lab/world/view/View.ts ...` | drive registry 单源 + FOV 分量修复；无输入/free-look 增量 |
| `git diff --exit-code 8236d5e 554f119 -- public/posters` | exit 0；tree id 两侧均 `09a04c…f9fd` |
| `pnpm exec playwright test ... --grep 'CITY-VEH-05\|CITY-VEH-07'`（VEH-C2 exact） | **2 passed**，5.5m |
| `pnpm test:e2e`（VEH-C2 exact） | **44 passed / 3 failed / 18 did not run**，45.0m；硬门 #2 未闭合 |
| PR #63 exact CI | check/build/links/budget/Lighthouse 全绿 |
| Lighthouse artifact | `/`、`/home/` 三轮 P/A/BP/SEO 全为 100；中位数全 100 |

---

*CC-AL-VEH-R2 · 本分支只提交审计报告；零 `src/`、e2e、生产 score、poster 与像素基线改动。
两项原始 VEH 阻断均已关闭；当前 NO-GO 仅由 exact 完整 suite 未全绿触发。*
