# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh`（**禁止降级**） |
| 审计模型 | `gpt-5.6-sol-xhigh-fast`（**禁止降级**） |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 自动驾驶 | 指挥官授权：Fable5 顾问咨询后父代理拍板，**全马力推进**，不考虑子代理执行预算 |
| 北极星 | 综合 **98**（登记 **92.5/70**，Δ **−5.5**） |
| **指挥官约束** | **无 CC-CAM 接入主线 → 视觉登记封顶 70**；CAM 为突破 70 的**必经门控** |
| 生产 tip | `main` @ `ce5e280`（登记 **92.5/70**） |

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

### 通往 98（主线序 · 已拍板）

1. **Loop 6 CC-CAM**（镜头/POI 单源 → **合 main**）— **当前主线**；无此步视觉 **≤70**
2. BL2 栈 + CAM 镜头 → **CC-BL2-CAM 重审**（PR #43 待机，禁止先合）
3. tone mapping（实模+机位到位后）
4. poster 三面收口（**永远最后**；动 ritual_idle 须单独批次）

## Loop 6 — CC-CAM 镜头/POI 机位（🔄 主线 · 多路并行）

| 项 | 内容 |
|----|------|
| 目标 | 数据驱动 `camera-shots` + `?poi`/`?shot` 消费；解锁 V4 whole-frame / POI 展示帧 |
| 根因 | ritual_idle 十字路口机位东向 hero 不可入帧；`?poi=` 仅改出生 |
| 入口 | `docs/research/cyber-city-camera-poi-research.md` |
| 模型 | **Fable5 xhigh** ×4 并行 → 集成 **CC-CAM-C1** → 审计 **CC-AL-CAM**（Sol） |
| 登记解锁 | AL-CAM GO/有条件放行后更新独立视觉分；**禁止用实现自评登记** |

### 子 Task（并行）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-CAM-RS | `cursor/cc-cam-github-survey-1d6f` @ **`87ad700`** | [CAM-RS](bc-115e402d-4831-5b34-9afd-3b050370bfd2) | ✅ IDLE · doc PR [#44](https://github.com/rayw-lab/website/pull/44) draft |
| CC-CAM-DES | `cursor/cc-cam-shot-registry-design-1d6f` | [CAM-DES](bc-05fd2270-ca68-58c7-a2d1-51e136e167e2) | 🔄 RUNNING（`docs/spec/cyber-city-camera-shots.md` 待 push） |
| CC-CAM-DATA | `cursor/cc-cam-shot-data-probe-1d6f` @ **`f8c46cb`** | [CAM-DATA](bc-030bfcdd-043c-56ed-b2ca-9376e06b1615) | 🔄 RUNNING · **JSON+NDC 探针已 push**（分支可集成） |
| CC-CAM-VIEW | `cursor/cc-cam-view-poi-framing-1d6f` | [CAM-VIEW](bc-48fe6c93-f96f-595b-85bc-0da189dfdff0) | 🔄 RUNNING（`CameraShots.ts` + View/Areas 待 push） |

### 合流主线序（父代理执行 · RS/DES 可先 doc-only 合 main）

| 步 | PR | base | 内容 |
|----|-----|------|------|
| ① | doc | `main` | RS 调研 [#44](https://github.com/rayw-lab/website/pull/44) draft + DES schema（零 `src/`） |
| ② | **CC-CAM-C1** | `main` | DATA `camera-shots.json` + NDC 探针 + VIEW 接线 + `?shot=` |
| ③ | **CC-AL-CAM** | — | Sol 独立审计：NDC 入帧、e2e 52/52、ritual 恒等合同 |
| ④ | 登记 | `main` | 审计独立分写入登记（仅 GO/有条件放行） |
| ⑤ | CC-BL2-CAM | `cursor/cc-bl2-street-extension-1d6f` | CAM 镜头 + BL2 栈重审；过门后父代理合 PR #43 |

### 硬门（CC-CAM-C1）

- e2e **52/52**；LHCI `/`+`/home/` 不降
- 未指定 `?shot=` 时 ritual_idle **逐字节恒等**（poster 合同）
- concept-garage showcase shot：NDC 审计 **主体入帧**
- 禁 free 漫游（G5）；禁动 poster（另批）

## BL2 — ❌ AL-BL2 复审仍 NO-GO（PR #43 禁止合流 · 待机至 Loop 6 后重审）

| ID | 分支 | PR | Agent | 状态 |
|----|------|-----|-------|------|
| CC-BL2 | 已合入 PLUS 栈 | [#43](https://github.com/rayw-lab/website/pull/43) draft | [BL2](bc-3f4061c8-bf7c-58f5-b540-5e1a932d60ae) | ✅ 交付完成 |
| CC-BL2-PLUS | `cursor/cc-bl2-street-extension-1d6f` @ **`dbc47c3`** | — | [BL2-PLUS](bc-a8ca6d06-9f46-5728-86df-7ab43cd8a630) | ✅ **交付完成**（e2e 52/52 · LHCI 全绿） |
| CC-AL-BL2 首次 | `cursor/cc-al-bl2-audit-1d6f` @ `7a5dffa`（已合 main） | — | [AL-BL2](bc-102414b6-9132-5de4-8de5-83580124910d) | ✅ NO-GO 71/92.8 |
| CC-AL-BL2 复审 | `cursor/cc-al-bl2-audit-1d6f` @ **`8d8b604`** | — | [AL-BL2-R2](bc-57c16013-d459-513b-a2dc-7b622c1d00bc) | ✅ **NO-GO** 仍 **71/92.8**（V4=71<72） |

| 登记 | 仍 **70/92.5**；**须 Loop 6 CC-CAM 合 main 后才可突破 70** |

### AL-BL2 复审结论（`fcdfcb5` 候选）
- 天际线/沿街整帧有像素变化，但 **work-gallery 固定帧仍无法读出完整新轮廓**（冠环被裁切）
- robot-idle 几何不可达（PLUS §2 与首次审计一致）
- e2e 52/52 · LHCI `/`+`/home/` 四项全 100 · 双评门 `|71−71|=0` — 均过，**V4 专项门仍失败**
- **禁止登记复审 71** · PR #43 **禁止合流**

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
