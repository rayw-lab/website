# CC-VEH-VIEW eng note：V 键双视角 + 驾驶焦点策略（实装）

| 项 | 内容 |
|----|------|
| 分支 | `cursor/cc-veh-fpv-view-1d6f`（base main `3ef208d`） |
| 上位规格 | `docs/spec/cyber-city-vehicle-camera.md`（CC-VEH-DES，PR #46 已合）——参数/裁决 D1-D5/恒等清单/e2e 验收点全部照抄，无自由发挥 |
| 改动面 | `View.ts`（driveView 子状态机 + lookahead + FPV rig，≈+180 行）· `Player.ts`（动作表 +1 行）· `TransformSystem.ts`（gate 镜像 + 强制回 third）· `Reveal.ts`（data-drive-view 镜像 + hint 冻结文案）· `index.ts`（遥测 view）· `e2e/cyber-city.spec.ts`（新增 2 用例覆盖 CITY-VEH-01..06，既有用例零改动） |

## 实现要点（spec 条款 → 代码落点）

1. **双相机管线（§0）**：fpv 只覆盖输出相机 `View.camera`；`defaultCamera` 恒为第三人称解算——Nipple 射线、optimalArea、focusPointSpeed 零回归。third 态 `updateFpv` 分支不执行，直通拷贝逐行与现状一致。
2. **硬切（D3）**：`setDriveViewMode` 即时翻转，无补间——无穿车体飞行、无晕动窗、reduced-motion 天然同形；fpv→third 切回帧 `focusPoint.isTracking=true` + `fov=fovBase` + `updateProjectionMatrix()`。
3. **lookahead 加法通道（§6.1/§9.1）**：方向 = 平滑焦点位移方向低通 6s⁻¹（非车头——倒车/甩尾自动正确）；幅值 = 4.5m × smoothstep(v,3,20) × (1−0.45·舵量低通)，幅值低通 4s⁻¹ + 变化率硬钳 8m/s；机位与视线目标同加（lateralOffset 同构）。门 = `gate==='driving' && !reducedMotion`——robot_idle 从未进过 driving ⇒ len 恒精确 0 ⇒ 下游 `+0` 逐位恒等（非渐近近似）。
4. **FPV rig（§6.2/§9.2）**：offsetLocal (0.35, 0.55, 0) 经完整底盘四元数（机位随悬挂走）；yaw 直通零延迟，pitch ×0.7 低通 10s⁻¹、roll ×0.35 低通 8s⁻¹（reduced-motion 两者恒 0 = 地平线锁定）；FOV 58 + kick ≤6°（smoothstep(v,8,24)，3s⁻¹ 缓变，reduced-motion 恒 58）；无头部 bob、无 free look（G5）。
5. **gate 镜像**：View 无 TransformSystem 引用——TransformSystem 构造/`setState` 把状态推送到 `view.driveView.gate`（'none' 缺省 = 灰盒恒闭）；等价实现 spec §9.3「transformSystem.state 冗余门」，先推镜像再广播 stateChange 保证 Reveal 读到同帧一致值。
6. **CAM-C1 未合降级（§7.2）**：`DRIVE_LOOKAHEAD`/`DRIVE_FPV` 常量内联 + `TODO(CC-CAM 合流)` 标记，字段名与 §7.1 冻结条目一字不差——合流 PR 删除双源零重命名成本。**不**在本分支创建 `camera-shots.json`（文件所有权在 CAM 侧，PR #45 在途，避免加法文件冲突）。
7. **roll 符号**：`atan2(cross(upward, ref)·forward, ref·upward)`（ref = 世界 up 在 ⊥forward 平面投影）——解析推导为「相机与车体同侧倾」；量级 ×0.35 + 低通后感知细微，若真机 A/B 观感反向只需翻一处符号（代码注释已登记）。
8. **e2e 编排**：CITY-VEH-01/02/03/04/06 共享一次 3D 挂载串成旅程（world-chromium 串行 project 下每次 ritual 挂载 ~75-110s 墙钟，逐 ID 独立挂载徒增 ~10min）；CITY-VEH-05 reduced-motion 单列（emulateMedia 须在导航前）。DOM 契约 `data-drive-view` + 遥测 `__worldSpike.state().view` 双口径互证。

## 残项（spec 开放问题，不在本批）

- O1 触屏 FPV（D5 独立任务书）· O2 看弯心偏置（V2 默认关）· O3 座舱内机位（依赖内饰资产）· O4 offsetLocal 终值真机 A/B 校准（两条硬门：引擎盖前缘入画 / nearClearance ≥0.15m——SwiftShader 软渲染帧已截图留档，真机走 human-gate-checklist）。

## 测试证据（同一 dist 构建，Cloud Agent VM · SwiftShader 软渲染 · 多代理并发负载）

| 轮次 | 范围 | 结果 |
|------|------|------|
| ① 全量 | 五 project 链 54 例 | 47 过 / 1 败 / 6 连坐跳——唯一失败 = 新增 CITY-VEH 联合旅程撞 describe 级 420s 超时（实测 7.1m，视角断言全部已过，死于最后一条断言的 teardown 竞态）。修复 = 单测 `test.setTimeout(600_000)`（对齐 WS-E2E-03/07 重型用例惯例，commit `05596dd`） |
| ② world 重跑 | world-chromium 19 + world-perf 1 + visual 4 | 23 过 / 1 败——**CITY-VEH-01..06 两用例全绿**（联合旅程 8.3m，印证 600s 预算必要）；唯一失败 = 既有 WS-E2E-03 负载伪影（慢动作校准下 A 键左转积分超 π，Δyaw naive 差值回绕成 −1.143 rad；同构建①轮已过，与本分支改动无关——灰盒场 gate 恒 'none'） |
| ③ WS-E2E-03 单跑 | 1 例 | 过（2.9m）——伪影结论坐实 |

三轮并集 = **54/54 全绿**（52 基线零改动 + 2 新增）。另：`astro check` 0 errors / 0 warnings；LHCI（`/` + `/home/` 各 1 轮，quick 档口径）四类分数全 1.0、assert 门禁 PASS。FPV/third 驾驶帧证据：`test-results/veh-fpv-driving.png`、`test-results/veh-third-driving.png`。
