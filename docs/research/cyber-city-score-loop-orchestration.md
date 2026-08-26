# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh`（**禁止降级**） |
| 审计模型 | `gpt-5.6-sol-xhigh-fast`（**禁止降级**） |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 自动驾驶 | 指挥官授权：Fable5 顾问咨询后父代理拍板，**全马力推进**，不考虑子代理执行预算 |
| 北极星 | 综合 **98**（登记 **92.0/68**，Δ **−6.0**） |
| 生产 tip | `main` @ `9262cbc`（登记 **92.0/68**） |

## Loop 5 — ✅ 有条件放行

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-L5-C1 | 已合 main | [L5-C1](bc-2a06873e-daa2-5ab0-8806-06c78da0f5de) | ✅ |
| CC-AL5 | 已合 main | [AL5](bc-828f4da0-f935-55b1-bc0d-0cfbb8538202) | ✅ 有条件放行 68/92.0 |

报告：`docs/research/loop5-audit.md`

## Blender 路径 — 🚀 全马力（Fable5 顾问拍板）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-BL1 | `cursor/cc-bl1-hero-corner-blender-1d6f` | [BL1](bc-c774aeb8-6935-51db-b871-45578b1c64eb) | 🚀 RUNNING |
| CC-AL-BL1 | `cursor/cc-al-bl1-audit-1d6f` | Sol | 待 BL1 |
| CC-MNT-TICKER | `cursor/cc-maint-ticker-tsl-uniforms-1d6f` @ `336095e` | [MNT](bc-bf3ea1a2-5bfd-569c-9426-f51f841ac5ef) | 🚀 RUNNING |

### BL1 拍板（[Fable5 顾问](bc-da728b97-e892-5b2a-a4f8-dbc8b7449177)）

<<<<<<< HEAD
- **目标**：`autodrive-lab` + 十字路口东北角（x 8–52 / z −52–−8）
- **双帧收益**：VIS-03 首幕 + VIS-04 深链
- **预算**：单 GLB ≤10MB（Draco+KTX2、≤100k tri）；失败回退程序化 `ThemeTowers`
- **自评目标**：V4 68–72，整体 71–74（须 AL-BL1 独立复评）
- **依赖调研单**（实现方必读）：
  - `ResourcesLoader.ts` — GLTF/Draco/KTX2 现成管线
  - `asset-ledger-cyber-city.md` — 单楼 ≤220KB 流式口径
  - `cyber-city-github-assets-research.md` §4 — Kenney City Kit Roads（CC0 街角道具）
  - `hero-robot/README.md` + asset-ledger 附录 A — `@gltf-transform/*` 一次性构建（`npx` 不入依赖树亦可）
  - 无 Blender CLI → Kenney CC0 拼装 + 程序化壳 hybrid 合法
=======
| 路径 | Task | 条件 |
|------|------|------|
| **A Blender spike** | `CC-BL1-hero-corner` | 产品批准；单栋 hero + 街角；V4 主攻 |
| **B 收口** | — | 不批准 Blender → 视觉停 68，北极星 98 需另策 |
| **维护** | `CC-MNT-TICKER-TSL` | ✅ 实现完毕（见下节），待审/待合 |
>>>>>>> origin/cursor/cc-maint-ticker-tsl-uniforms-1d6f

### 通往 98（顾问估 3–4 轮）

<<<<<<< HEAD
BL1 → BL2 沿街扩展 → tone mapping（实模密度到位后）→ poster 三面收口

## 纪律
=======
## 维护 — CC-MNT-TICKER-TSL ✅ 实现完毕（待审/待合）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-MNT-TICKER-TSL | `cursor/cc-maint-ticker-tsl-uniforms-1d6f` @ `336095e`（base `main@9262cbc`） | CC-MNT-TICKER-TSL | ✅ 已推送；draft PR 由父代理/环境创建（本 VM gh token 只读） |

**范围（gaps-consult §1.3/§2 边界）**：删 `Ticker.ts` 四个零消费 TSL uniform + `three/tsl` import +
四次逐帧写入 + 失真注释；直接文档同步（rendering-architecture-audit / gaps-consult §1.3）。
不动 `time` 节点、tick/delay/wait、`scale=2`。零行为变化，不计视觉增量。
**硬门**：astro check 0 err/0 warn · e2e 全量 50 过 2 基建失败（跑批中共享 VM 并发任务清了
worktree node_modules，VIS-03/04 崩）→ 重装依赖后 visual-chromium 补跑 4/4 绿，52 例唯一用例
在 `336095e` 树上全通过 · 与 CC-BL1 文件域互斥

## 渲染三条发现 — Sol 裁决

| # | 发现 | 裁决 | 插入时机 |
|---|------|------|----------|
| ① | 无 tone mapping | **建议补** | **本轮不开**；Blender 后或产品另策 |
| ② | PreRenderer 仅 Q0+WebGPU | **可 defer** | AL5 观测：无 L5 可归因硬门击穿 |
| ③ | Ticker TSL uniform 悬空 | **建议补** | ✅ 已执行：维护 PR `CC-MNT-TICKER-TSL` |
>>>>>>> origin/cursor/cc-maint-ticker-tsl-uniforms-1d6f

- AL5 登记 **68/92.0**，禁止用 L5 自评 69 登记生产
- **禁止降级模型**；缺依赖先调研再实现
- tone mapping **等 Blender 路径验证后再开**
- poster 永远排批次最后

## 定时器

`loop-cyber-city-orchestrate` · 300s · 自动驾驶全马力 · CI 订阅 MNT 分支
