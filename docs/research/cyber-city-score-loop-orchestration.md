# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh`（**禁止降级**） |
| 审计模型 | `gpt-5.6-sol-xhigh-fast`（**禁止降级**） |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 自动驾驶 | 指挥官授权：Fable5 顾问咨询后父代理拍板，**全马力推进**，不考虑子代理执行预算 |
| 北极星 | 综合 **98**（登记 **92.5/70**，Δ **−5.5**） |
| 生产 tip | `main` @ `b9a6edb`（登记 **92.5/70**） |

## Loop 5 — ✅ 有条件放行

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-L5-C1 | 已合 main | [L5-C1](bc-2a06873e-daa2-5ab0-8806-06c78da0f5de) | ✅ |
| CC-AL5 | 已合 main | [AL5](bc-828f4da0-f935-55b1-bc0d-0cfbb8538202) | ✅ 有条件放行 68/92.0 |

报告：`docs/research/loop5-audit.md`

## 维护 — CC-MNT-TICKER-TSL ✅ 已合 main

| ID | 分支 | PR | 状态 |
|----|------|-----|------|
| CC-MNT-TICKER-TSL | `cursor/cc-maint-ticker-tsl-uniforms-1d6f` @ `71bd8bf` | [#41](https://github.com/rayw-lab/website/pull/41) | ✅ 已合 main |

Agent：[MNT](bc-bf3ea1a2-5bfd-569c-9426-f51f841ac5ef) · e2e 52/52（补跑归绿）· 渲染发现③ 已清

## Blender 路径 — BL1 ✅ 已合 main

| ID | 分支 | PR | Agent | 状态 |
|----|------|-----|-------|------|
| CC-BL1 | 已合 main | [#42](https://github.com/rayw-lab/website/pull/42) | [BL1](bc-c774aeb8-6935-51db-b871-45578b1c64eb) | ✅ |
| CC-AL-BL1 | `cursor/cc-al-bl1-audit-1d6f` @ `76713e0` | — | [AL-BL1](bc-27254995-4b15-55d8-b0e2-fc9edeb9696d) | ✅ 有条件放行 **70/92.5** |

报告：`docs/research/loop-bl1-audit.md` · 清账 `@0f5d461`（`tools/blender/` + 台账）

### BL1 拍板（[Fable5 顾问](bc-da728b97-e892-5b2a-a4f8-dbc8b7449177)）

- **目标**：`autodrive-lab` + 十字路口东北角（x 8–52 / z −52–−8）
- **双帧收益**：VIS-03 首幕 + VIS-04 深链
- **预算**：单 GLB ≤10MB（Draco+KTX2、≤100k tri）；失败回退程序化 `ThemeTowers`
- **登记**：AL-BL1 独立 **70/92.5**（禁止用 BL1 自评登记）
- **依赖调研单**：`ResourcesLoader.ts` · asset-ledger · `github-assets-research` Kenney CC0 · `gltf-transform` 一次性构建

### 通往 98（顾问估 3–4 轮）

BL2 沿街扩展 → tone mapping（实模密度到位后）→ poster 三面收口

## BL2 — 🚀 已派发（AL-BL1 §9）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-BL2 | `cursor/cc-bl2-street-extension-1d6f` | Fable5 | 🚀 RUNNING |
| CC-AL-BL2 | `cursor/cc-al-bl2-audit-1d6f` | Sol | 待 BL2 |

- **目标**：`concept-garage` 相邻沿街实模（SW 象限，与 autodrive-lab 同框可读）
- **门**：V4 独立 **72–75**；保留 heroGlb / Q2 零请求 / ThemeTowers 回退
- **禁**：tone mapping · poster · 扩批其它楼

## 渲染三条发现 — Sol 裁决

| # | 发现 | 裁决 | 状态 |
|---|------|------|------|
| ① | 无 tone mapping | Blender 后或另策 | 未开 |
| ② | PreRenderer 仅 Q0+WebGPU | AL5 观测无硬门击穿 | defer |
| ③ | Ticker TSL uniform 悬空 | 维护 PR | ✅ 已合 |

## 纪律

- 登记只认审计独立分（当前 **70/92.5**）
- **禁止降级模型**；缺依赖先调研再实现
- tone mapping **等 Blender 路径验证后再开**
- poster 永远排批次最后

## 定时器

`loop-cyber-city-orchestrate` · 300s · 自动驾驶全马力
