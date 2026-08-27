# Loop 8 — 功能/游戏化/可观测（指挥官追加 · 2026-08-27）

| 项 | 内容 |
|----|------|
| 触发 | 指挥官实玩 **~2 分钟**：交互/人性化/游戏特性不足；要求 **多在功能上下功夫** |
| 北极星（多维） | **视觉 98** · **功能 90** · **性能 85** · 综合仍追 **98** |
| 登记 | 功能/性能分须 **独立 rubric + 可观测证据**；禁止用 e2e 绿 alone 冒充功能 90 |
| 实现 | Fable5 xhigh 全链路；审计 Sol xhigh-fast |
| 范式 | 调研 → 脑暴 → 设计（rubric+可观测）→ 开发 → 测试 → 审计 → 登记 |

## 1. 痛点（指挥官口径）

- 视觉管线（CAM/BL/粒子）在跑，但 **可玩层** 薄：键位提示、反馈、目标感、进站玩法、驾驶乐趣、失败/复位友好度等 **未达「游戏」预期**
- 现有 e2e 证明 **状态机可跑**，不证明 **2 分钟体验合格**
- 缺 **可观测**：无法从日志/埋点/会话时间线回答「用户卡在哪、哪步流失、哪交互未被发现」

## 2. 与现有 Loop 关系

| Loop | 关系 |
|------|------|
| Loop 6 CC-CAM | 展示帧/POI shot — **功能 F1/F2** 的取景地基 |
| Loop 7 VEH/TRANS-FX | 驾驶 FPV + 变形炫技 — **功能子集**，非全盘 |
| Loop 8 **本批** | **横切体验**：交互、人性化、游戏化玩法、可观测、性能体感 |

**纪律**：Loop 8 不暂停 CAM/VEH/TRANS 实现 PR；功能批次按 **文件域** 切 PR（单 PR 聚焦一类交互，便于归因）。

## 3. 功能 90 / 性能 85 口径（待 CC-FXN-ADV 定稿）

### 3.1 功能分（提议七维 · 待顾问冻结）

| 维 | 权重提议 | 测什么 |
|----|----------|--------|
| F1 首幕可懂 | 15% | 2 分钟内理解「我是谁、能干什么、下一步」 |
| F2 操作反馈 | 15% | 按键/碰撞/变形/驾驶 **即时反馈**（视听+UI） |
| F3 驾驶乐趣 | 15% | 速度感、视角、复位、障碍/目标（非纯沙盒） |
| F4 POI 游戏化 | 15% | 进站、深链、楼=导航 **可发现可完成** |
| F5 人性化 | 15% | 提示消隐、误触、reduced-motion、移动端 |
| F6 目标/进度 | 10% | 可选任务线、成就感、探索动机（非强制主线） |
| F7 可观测完备 | 10% | 关键路径埋点 + 会话可回放诊断 |

### 3.2 性能分（提议 · 与 LHCI 分立）

| 维 | 目标 | 测什么 |
|----|------|--------|
| P1 帧率体感 | 桌面 60 / 移动 ≥30 | 真机 + CI 帧采样（human-gate §5.4） |
| P2 1% low | ≥45 桌面 | 驾驶+变形 20s 脚本 |
| P3 加载可玩 | ≤8s Fast 4G | SRD §12.7.2 |
| P4 预算 | world JS/资产不爆 | audit-budget |
| P5 降档可感知 | Q2 不崩玩法 | Quality 梯退仍可完成核心路径 |

**注意**：LHCI performance 分类 ≠ 运行时 FPS；性能 85 须 **双轨**（LHCI + 运行时采样）。

## 4. 可观测（待 CC-FXN-ADV 方案）

**现状埋点**（已有，未产品化）：

- `world-reveal` · `world-transform:{car|robot}` · `world-drive-start`
- `data-world-state` DOM 镜像 · Reveal status/hint
- `console.info` 散落 · 无统一会话时间线

**缺口**（顾问须回答）：

- 会话 ID / 阶段时间戳 / 流失点聚合
- `#debug` 或内部 overlay：状态、机位、FPS、埋点 tail
- CI 可消费的 **功能冒烟分**（扩 score-loop 或 sibling `function-score.mjs`）
- 与 e2e 关系：e2e = 回归门；功能 rubric = 体验门

## 5. 并行 Task 路标（Fable5 xhigh）

| ID | 交付 | 说明 |
|----|------|------|
| **CC-FXN-ADV** | 顾问报告 | 可观测架构 + 功能/性能 rubric 冻结 + Loop 8 PR 切分 |
| CC-FXN-RS | `docs/research/cyber-city-gameplay-gap-audit.md` | 代码+文档 2 分钟体验缺口清单 |
| CC-FXN-BR | `docs/research/cyber-city-gameplay-features.md` | P0 游戏化功能脑暴（对接 camera-design F1–F9） |
| CC-FXN-DES | `docs/spec/cyber-city-function-rubric.md` | 功能 rubric v1 + 取证协议 |
| CC-OBS-DES | `docs/spec/cyber-city-observability.md` | 埋点表、事件 schema、debug 合同 |
| CC-OBS-C1 | 实现 | SessionTimeline + 埋点接线 + debug 面板（`#debug`） |
| CC-FXN-C1 | 实现 | P0 交互包（按顾问序，单 PR） |
| CC-AL-FXN | Sol 审计 | 独立功能分 + 2min 脚本视频证据 |

## 6. 硬门

- e2e 52/52 不降
- 功能登记：**playtest 脚本** 5–10 min + 独立审计分
- 性能登记：human-gate 帧率表或 CI 帧 artifact **不可伪造**
- poster / ritual_idle 恒等不变

## 7. 纪律

- 禁止用视觉分覆盖功能门
- 禁止无埋点的「功能改进」（不可观测 = 不可登记）
- Fable5 实现 · Sol 审计 · 父代理只编排
