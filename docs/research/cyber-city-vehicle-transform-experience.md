# 驾驶体验 + 变形炫技（Loop 7 入口 · 指挥官追加）

| 项 | 内容 |
|----|------|
| 触发 | 指挥官：① PUBG 式车辆驾驶 + **V 键第一人称** + 移动时焦点策略；② 机器人→汽车变形缺 **过程化粒子炫技**展示 |
| 北极星 | 综合 **98**；登记 **92.5/70**（视觉须 Loop 6 CC-CAM 过门后才可 >70） |
| 实现 | **Fable5 xhigh** 全链路（调研→脑暴→设计→开发→测试） |
| 审计 | **CC-AL-VEH** / **CC-AL-TRANS-FX**（Sol xhigh-fast，集成后） |

## 1. 现状（代码事实）

### 1.1 驾驶镜头（CC-VEH）

| 机制 | 现状 | 缺口 |
|------|------|------|
| 驾驶默认 | `View.ts` folio 等距第三人称：spherical + focusPoint 磁吸 + 速度拉远 | 无 FPV / 无视角切换 |
| 输入 | `Player.ts` WASD/Shift/R/F；**无 V 键** | 无 `toggleDriveView` 动作 |
| 焦点 | `focusPoint` 跟踪 + `speedEdge {4,24}` 速度变焦 | 无 FPV lookahead、无 PUBG 式车身稳定策略 |
| 竞品对标 | folio-2025 第三人称跟车；PUBG 载具 FPV + 平滑焦点 | 指挥官明确要求 PUBG 式 |

### 1.2 变形仪式（CC-TRANS-FX）

| 节拍 | 现状（`TransformSystem.ts`） | 缺口 |
|------|-------------------------------|------|
| 充能 0.35s | TSL 地面充能环（环带+刻度扫掠） | 无粒子喷发 / 无能量碎屑 |
| 光幕峰值 | Billboard 竖幕 + 扫描线（遮蔽热交换） | 无体积感粒子幕 / 无金属解构感 |
| 运镜 | CC-L4-B5 推镜 + 落地微震（`ritualCam`） | 运镜已有；**粒子层未叠** |
| 环境光轨 | `FlightTrails.ts` 中远景 630 点（Loop 3 B3） | **变形窗专用**炫技粒子 = 0 |
| reduced-motion | instant swap，零粒子 | 须保留直出路径 |

## 2. 产品意图（指挥官原话对齐）

1. **驾驶**：类似绝地求生载具——按 **V** 在第三人称 ↔ **车内第一人称** 间切换；车辆移动时 **焦点/lookahead** 要稳（转弯不晕、加速有推背感、不丢目标）。
2. **变形**：机器人变汽车过程中要有 **过程化、粒子向的炫技展示**——当前只有环+光幕，观感偏「系统 UI」而非「赛博仪式大片」。

## 3. 与 Loop 6 CC-CAM 关系

- **CC-CAM**：ritual_idle / POI showcase / `?shot=` 数据驱动 **展示帧**（破 70 门控）。
- **CC-VEH**：**驾驶态**动态镜头（第三人称 + FPV），消费 `View.ts` + 可选扩展 `camera-shots.json` 的 `drive_third` / `drive_fpv` shot。
- **合流顺序**：CAM-C1 合 main 后，VEH-VIEW 基于同一 shot 注册表接线，避免双源机位常量。

## 4. 并行 Task 路标（Fable5 xhigh）

| ID | 分支 | 交付 |
|----|------|------|
| CC-VEH-RS | `cursor/cc-veh-github-survey-1d6f` | `docs/research/github-vehicle-camera-survey.md` |
| CC-VEH-DES | `cursor/cc-veh-camera-design-1d6f` | `docs/spec/cyber-city-vehicle-camera.md` |
| CC-VEH-VIEW | `cursor/cc-veh-fpv-view-1d6f` | V 键 + FPV + focus 策略 + e2e |
| CC-TRANS-FX-RS | `cursor/cc-trans-fx-research-1d6f` | `docs/research/transform-particle-fx-survey.md` |
| CC-TRANS-FX-DES | `cursor/cc-trans-fx-design-1d6f` | `docs/spec/cyber-city-transform-fx.md` |
| CC-TRANS-FX-IMPL | `cursor/cc-trans-fx-impl-1d6f` | 变形窗粒子层 + 测试证据 |

审计（父代理集成后派 Sol）：

| ID | 专项门 |
|----|--------|
| CC-AL-VEH | driving 态 V 切换、e2e 52/52、ritual_idle 恒等、无 free 漫游 |
| CC-AL-TRANS-FX | 变形四拍时序不变、reduced-motion 直出、变形帧不白爆、V5 时间证据 |

## 5. 硬门（集成 PR）

- e2e **52/52**；LHCI `/`+`/home/` 不降
- `robot_idle` 未驾驶时 **逐字节恒等**（poster 合同）
- 禁用户 free 漫游（G5）；变形状态机四拍墙钟 **1.0–1.2s** 不变
- CITY-03 动画配额：变形粒子须登记席位，不得挤占 HeroRobot idle 配额失控

## 6. 纪律

- 禁止降级模型；登记只认审计独立分
- poster 三面仍排批次最后
- tone mapping 本批次不碰
