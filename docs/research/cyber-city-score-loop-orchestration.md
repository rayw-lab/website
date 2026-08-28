# Phase 0 提分 Loop 编排看板

`main` @ `771b1e4` · 2026-08-27 22:05 UTC · 范式 `cyber-city-orchestration-paradigm.md`

**模型（L8+）**：全部子代理 Task = `claude-fable-5-thinking-xhigh`；在途 Sol 可跑完（§1.2 宽限）。

## 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 在途 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | COMP-M0 |
| **视觉** | **98** | **73** | +25 | X1b · VIS-ADV-73 |
| **功能** | **90** | **84** | +6 | AL-FXN-R5 · FXN-NEXT |
| **性能** | **85** | **—** | +85 | TM-PREP · PERF-DESK |

> 登记只认审计独立分。禁止 LHCI/e2e/smoke 冒充功能或性能。

## 当前焦点（Loop 8）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 功能 | **84** ✅ [#84](https://github.com/rayw-lab/website/pull/84) · C5-R3/C6 已合 [#90](https://github.com/rayw-lab/website/pull/90)[#91](https://github.com/rayw-lab/website/pull/91) | AL-FXN-R5 复评 → FXN-NEXT |
| 视觉 | **73** ✅ [#94](https://github.com/rayw-lab/website/pull/94) · X1a-R4/X3-R4 已合 [#92](https://github.com/rayw-lab/website/pull/92)[#93](https://github.com/rayw-lab/website/pull/93) | X1b · VIS-ADV-73 |
| 性能 | 顾问 R2 ✅ [#88](https://github.com/rayw-lab/website/pull/88) | TM-PREP → 真机六腿 · PERF-DESK |
| 综合 | 80 | COMP-M0 → 五维重算 |

## 在途子 Task（≤10 并行）

| ID | 模型 | 状态 |
|----|------|------|
| CC-AL-FXN-R5 | Fable5 xhigh | 🔄 功能复评（C5-R3/C6 合后） |
| CC-VIS-L8-W1-X1b | Fable5 xhigh | 🔄 视觉腿（接续 X1a-R4） |
| CC-AL-VEH-R3 | Fable5 xhigh | 🔄 车辆 e2e 审计（独占 VM 单跑） |
| CC-VIS-ADV-73 | Fable5 xhigh | 🔄 视觉顾问（73→90+ 路径） |
| CC-COMP-M0 | Fable5 xhigh | 🔄 综合重算准备 |
| CC-TM-PREP | Fable5 xhigh | 🔄 真机测试准备 |
| CC-PERF-DESK | Fable5 xhigh | 🔄 性能桌面腿 |
| CC-FXN-NEXT | Fable5 xhigh | 🔄 功能 84→90 下一批（承 [#87](https://github.com/rayw-lab/website/pull/87)） |

## 本 tick 合流（→ `771b1e4`）

| PR | 内容 |
|----|------|
| [#90](https://github.com/rayw-lab/website/pull/90) | C5-R3 G4 目标线 v0 + idle-30s 引导 |
| [#91](https://github.com/rayw-lab/website/pull/91) | C6 F/Space-B 确认层 + G9 测速牌 |
| [#92](https://github.com/rayw-lab/website/pull/92) | X1a-R4 BL2-R2 几何增量（鼓塔） |
| [#93](https://github.com/rayw-lab/website/pull/93) | X3-R4 招牌叙事 v2 e2e 验收面 CITY-SIGN-01…03 |
| [#94](https://github.com/rayw-lab/website/pull/94) | AL-VIS-R3 视觉复评登记 **71→73** |

## 下一拍序

1. 八路在途并行（独立 worktree，禁共享 `/workspace`）；VEH-R3 独占 VM 单跑 e2e
2. AL-FXN-R5 / VIS-ADV-73 回报后重排功能、视觉腿
3. TM-PREP 就绪 → 指挥官真机六腿 → AL-PERF → COMP-M0 五维重算

## 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**

## 角色表（定义单源 = `cc-loop-role-catalog.md`，本表只做索引，禁止在此扩写条款）

| 层 | 角色 | 要点 |
|----|------|------|
| 治理 | 指挥官 → **事后顾问（董事会）** → 父代理 | **事后顾问（新增）**：连续 ≥2 tick 无有效新增，或 subagent 角色冲突/卡点时触发；`claude-fable-5-thinking-xhigh`；权威最高，裁决对父代理与所有 Task 具约束力，可要求持续推进（条款见百科 §3） |
| 编排辅助 | 编排顾问（T 系列）· 秘书（SEC P 系列） | 日常串并行/派单/预排仍归编排顾问；**卡门/冲突升级事后顾问**；看板 3n 界点由秘书刷新 |
| 交付 | 调研 · 脑暴 · WBS/设计 · 开发 · 测试 · 视觉 · 功能 · 性能 · 交互/用户故事 · 产品 · 质量 · 审计 | 全员 `claude-fable-5-thinking-xhigh`；审计零业务代码 + fresh 取证，专项分只认审计独立分；逐角色五字段条款见百科 §2 |

## 归档（一行）

顾问 [#87](https://github.com/rayw-lab/website/pull/87)[#88](https://github.com/rayw-lab/website/pull/88) · AL-FXN **84** [#84](https://github.com/rayw-lab/website/pull/84) · 范式 [#85](https://github.com/rayw-lab/website/pull/85) · board [#86](https://github.com/rayw-lab/website/pull/86) · 清理 [#89](https://github.com/rayw-lab/website/pull/89) · C5-R3 [#90](https://github.com/rayw-lab/website/pull/90) · C6 [#91](https://github.com/rayw-lab/website/pull/91) · X1a-R4 [#92](https://github.com/rayw-lab/website/pull/92) · X3-R4 [#93](https://github.com/rayw-lab/website/pull/93) · AL-VIS **73** [#94](https://github.com/rayw-lab/website/pull/94)
