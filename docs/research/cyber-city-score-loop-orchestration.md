# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh`（**禁止降级**） |
| 审计模型 | `gpt-5.6-sol-xhigh-fast`（**禁止降级**） |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 自动驾驶 | 指挥官授权：Fable5 顾问咨询后父代理拍板，**全马力推进**，不考虑子代理执行预算 |
| 生产 tip | `main` @ 见 git tip |

### 登记矩阵（**每次编排 Delta / 定时器回复必输出此表**）

| 维度 | 北极星 | 生产登记 | Δ | 说明 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | 五维计分器（LHCI+e2e+视觉+smoke）；**不含**功能/性能维 |
| **视觉** | **98** | **71** | +27 | AL-CAM 独立 · `cyber-city-visual-rubric-score.json` |
| **功能** | **90** | **—** | +90 | **未登记** · 正本 `cyber-city-function-rubric.md` · **OBS-C1 合 main 后**方可 AL-FXN 登记 · F7 埋点硬门 |
| **性能** | **85** | **—** | +85 | **未登记** · 运行时 FPS/帧时权威 = 真机 human-gate §5.4 · **与 LHCI 分立** · 正本见功能 rubric §7 |

> **口径**：北极星四数 **98 / 98 / 90 / 85** 并列；生产登记只认审计独立分。**禁止**用 LHCI 或综合分冒充功能/性能。旧文案「登记 92.0/68」「综合 92.8」已作废。

| **指挥官约束** | CC-CAM 已合 main；功能/性能须独立 rubric + 可观测证据登记 |

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
2. **Loop 7 CC-VEH + CC-TRANS-FX**（驾驶 FPV + 变形粒子炫技）
3. **Loop 8 CC-FXN + CC-OBS**（功能 90 / 性能 85 / 可观测）— **指挥官追加 · 与视觉并行**
4. BL2 栈 + CAM → **CC-BL2-CAM 重审**（PR #43 待机）
5. tone mapping（实模+机位到位后）
6. poster 三面收口（**永远最后**）

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
| CC-CAM-RS | 已合 main | [CAM-RS](bc-115e402d-4831-5b34-9afd-3b050370bfd2) | ✅ PR [#44](https://github.com/rayw-lab/website/pull/44) 已合 |
| CC-CAM-DES | 已合 main | [CAM-DES](bc-05fd2270-ca68-58c7-a2d1-51e136e167e2) | ✅ PR [#46](https://github.com/rayw-lab/website/pull/46) 已合 |
| CC-CAM-DATA | `cursor/cc-cam-shot-data-probe-1d6f` @ `f8c46cb` | [CAM-DATA](bc-030bfcdd-043c-56ed-b2ca-9376e06b1615) | ✅ IDLE · 已并入 [#45](https://github.com/rayw-lab/website/pull/45) |
| CC-CAM-VIEW | `cursor/cc-cam-view-poi-framing-1d6f` @ **`78ff9b7`** | [CAM-VIEW](bc-48fe6c93-f96f-595b-85bc-0da189dfdff0) | ✅ IDLE · 已并入 [#45](https://github.com/rayw-lab/website/pull/45) · visual e2e 4/4 |

### 合流主线序（父代理执行 · RS/DES 可先 doc-only 合 main）

| 步 | PR | base | 内容 |
|----|-----|------|------|
| ① | doc | `main` | ✅ [#44](https://github.com/rayw-lab/website/pull/44)+[#46](https://github.com/rayw-lab/website/pull/46) 已合 |
| ② | **CC-CAM-C1** | `main` | ✅ PR [#45](https://github.com/rayw-lab/website/pull/45) 已合 · e2e 52/52 · NDC 7/7 |
| ③ | **CC-AL-CAM** | — | ✅ [AL-CAM](bc-a940fd9e-7869-57be-b1d9-990196d405c1) **GO** 独立视觉 **71** / 综合 **92.8** · 报告待合 |
| ④ | 登记 | `main` | ✅ **71/92.8** 已写入 `cyber-city-visual-rubric-score.json` |
| ⑤ | CC-BL2-CAM | `cursor/cc-bl2-street-extension-1d6f` | CAM 镜头 + BL2 栈重审；过门后父代理合 PR #43 |

### 硬门（CC-CAM-C1）

- e2e **52/52**；LHCI `/`+`/home/` 不降
- 未指定 `?shot=` 时 ritual_idle **逐字节恒等**（poster 合同）
- concept-garage showcase shot：NDC 审计 **主体入帧**
- 禁 free 漫游（G5）；禁动 poster（另批）

## Loop 7 — 驾驶 FPV + 变形粒子炫技（🔄 指挥官追加 · 与 Loop 6 并行）

| 项 | 内容 |
|----|------|
| 触发 | ① PUBG 式载具：**V 键** 第三人称 ↔ 车内第一人称 + 移动时焦点策略；② 机器人→车变形缺 **过程化粒子炫技**（现仅充能环+光幕） |
| 入口 | `docs/research/cyber-city-vehicle-transform-experience.md` |
| 模型 | **Fable5 xhigh** ×6（RS→DES→VIEW/IMPL→测试）→ 集成 **CC-VEH-C1** / **CC-TRANS-FX-C1** → 审计 Sol |
| 依赖 | 驾驶 shot 与 Loop 6 `camera-shots.json` 对齐（`drive_third` / `drive_fpv`）；CAM-C1 合 main 后 VEH 集成减冲突 |
| 登记 | 体验项；视觉登记仍须 **AL-CAM** 过 70 门；本 Loop 主攻 **V5 动效** + 驾驶 UX |

### 子 Task（并行 · Fable5 xhigh）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-VEH-RS | 已合 main | [VEH-RS](bc-9d7c442e-24b0-5f6d-b962-578f8fc4069e) | ✅ IDLE · [#46](https://github.com/rayw-lab/website/pull/46) 已合 |
| CC-VEH-DES | 已合 main | [VEH-DES](bc-3a9962de-2214-5fc5-bc7d-48858b2bba98) | ✅ [#46](https://github.com/rayw-lab/website/pull/46) 已合 |
| CC-VEH-VIEW | `cursor/cc-veh-fpv-view-1d6f` @ **`d1565e6`** | [VEH-VIEW](bc-0f2b223e-fe77-56a6-b276-d4c92371d2ad) | 🔄 RUNNING · **FPV 代码+e2e 已 push** |
| CC-TRANS-FX-RS | 已合 main | [TRANS-RS](bc-27662958-c425-5337-99fb-173b1bafbaf5) | ✅ [#46](https://github.com/rayw-lab/website/pull/46) 已合 |
| CC-TRANS-FX-DES | 已合 main | [TRANS-DES](bc-ac0c5a7d-056f-527a-8180-b00a4d9e4bc3) | ✅ [#46](https://github.com/rayw-lab/website/pull/46) 已合 |
| CC-TRANS-FX-IMPL | 待合 PR | [TRANS-IMPL](bc-c24bb880-b5a7-513d-8c17-343a86ea9e84) | ✅ IDLE · e2e 52/52 · `TransformParticles.ts` |

### 合流主线序

| 步 | PR | 内容 |
|----|-----|------|
| ① | doc | `main` | ✅ [#46](https://github.com/rayw-lab/website/pull/46) 已合（含 VEH-RS） |
| ② | **CC-TRANS-FX-C1** | 变形窗粒子层（`TransformSystem` 节拍不变） |
| ③ | **CC-VEH-C1** | V 键 FPV + focus 策略（`View.ts` + `Inputs` + `Player`） |
| ④ | **CC-AL-TRANS-FX** / **CC-AL-VEH** | Sol 独立审计 + 时间维证据 |
| ⑤ | 登记 | V5 专项门过门后更新诊断分（非生产视觉登记主路径） |

### 硬门

- e2e 52/52；LHCI 不降
- 变形四拍 **1.0–1.2s** 墙钟不变；reduced-motion instant swap
- `robot_idle` ritual 恒等；禁 free 漫游
- CITY-03 配额：变形粒子须书面登记席位

## Loop 8 — 功能/游戏化/可观测（🔄 指挥官追加 · 功能 90 / 性能 85）

| 项 | 内容 |
|----|------|
| 触发 | 实玩 ~2min：交互/人性化/游戏特性不足；要多在 **功能** 下功夫 |
| 入口 | `docs/research/cyber-city-function-gameplay-loop.md` |
| 北极星 | **功能 90** · **性能 85**（独立于视觉 98） |
| 模型 | **Fable5 xhigh** 顾问 + RS/BR/DES/OBS/IMPL → **CC-AL-FXN**（Sol） |
| 关键 | **可观测先行**——无埋点/会话时间线不得登记功能分 |

### 子 Task（并行派发）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-FXN-ADV | 已合 main | [FXN-ADV](bc-063957b8-f8d7-57f2-a1de-0486b94ff78e) | ✅ PR [#47](https://github.com/rayw-lab/website/pull/47) 已合 |
| CC-FXN-RS | 已合 main | [FXN-RS](bc-c76a8773-232a-5259-9be1-b443c8b670f5) | ✅ PR [#48](https://github.com/rayw-lab/website/pull/48) 已合 |
| CC-FXN-BR | 已合 main | [FXN-BR](bc-3484cd88-8f28-5a98-80a9-4ddcedaef026) | ✅ PR [#48](https://github.com/rayw-lab/website/pull/48) 已合 |
| CC-FXN-DES | 已合 main | [FXN-DES](bc-436336c8-9fc8-5833-ae57-064e5eab2fc9) | ✅ PR [#49](https://github.com/rayw-lab/website/pull/49) 已合 |
| CC-OBS-DES | 已合 main | [OBS-DES](bc-fecc56ff-7db5-577f-b0a8-0f9e4aab6b02) | ✅ PR [#51](https://github.com/rayw-lab/website/pull/51) 已合 |

### 合流序

| 步 | 内容 |
|----|------|
| ① | ✅ ADV [#47](https://github.com/rayw-lab/website/pull/47) + RS/BR [#48](https://github.com/rayw-lab/website/pull/48) 已合 |
| ② | ✅ rubric [#49](https://github.com/rayw-lab/website/pull/49) + OBS [#51](https://github.com/rayw-lab/website/pull/51) 已合 |
| ③ | **CC-OBS-C1** — [OBS-C1](bc-e4a0b429-3131-5993-a53e-a69eb0e4bce4) 🔄 RUNNING · 已 push `1a79fee` |
| ④ | CC-FXN-C1…（P0 交互，单 PR 单主题） |
| ⑤ | CC-AL-FXN + 性能 human-gate 回填 |

## BL2 — ❌ AL-BL2 复审仍 NO-GO（PR #43 禁止合流 · 待机至 Loop 6 后重审）

| ID | 分支 | PR | Agent | 状态 |
|----|------|-----|-------|------|
| CC-BL2 | 已合入 PLUS 栈 | [#43](https://github.com/rayw-lab/website/pull/43) draft | [BL2](bc-3f4061c8-bf7c-58f5-b540-5e1a932d60ae) | ✅ 交付完成 |
| CC-BL2-PLUS | `cursor/cc-bl2-street-extension-1d6f` @ **`dbc47c3`** | — | [BL2-PLUS](bc-a8ca6d06-9f46-5728-86df-7ab43cd8a630) | ✅ **交付完成**（e2e 52/52 · LHCI 全绿） |
| CC-AL-BL2 首次 | `cursor/cc-al-bl2-audit-1d6f` @ `7a5dffa`（已合 main） | — | [AL-BL2](bc-102414b6-9132-5de4-8de5-83580124910d) | ✅ NO-GO 71/92.8 |
| CC-AL-BL2 复审 | `cursor/cc-al-bl2-audit-1d6f` @ **`8d8b604`** | — | [AL-BL2-R2](bc-57c16013-d459-513b-a2dc-7b622c1d00bc) | ✅ **NO-GO** 仍 **71/92.8**（V4=71<72） |

| 登记 | 生产 **80/71**（综合/视觉）；功能/性能 **—** 待 OBS-C1 + AL-FXN；PR #43 **仍禁止合流** |

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

- 登记只认审计独立分（见上表 **登记矩阵**，每次 Delta 必复述四维度）
- **禁止降级模型**；缺依赖先调研再实现
- tone mapping **等 Blender 路径验证后再开**
- poster 永远排批次最后

## 定时器

`loop-cyber-city-orchestrate` · 300s · 自动驾驶全马力

### 定时器播报口径（**禁止再用「登记 92.0/68」**）

编排代理每次回复须**首段**输出登记矩阵四行（综合/视觉/功能/性能：北极星 vs 生产登记 vs Δ），再写本窗口 Delta。

**推荐 automation 文案**（与上表对齐）：

```text
自动驾驶全马力编排（禁止降级：实现 Fable5 xhigh，审计 Sol xhigh-fast）。
北极星：综合 98 · 视觉 98 · 功能 90 · 性能 85。
生产登记：综合 80 · 视觉 71 · 功能 — · 性能 —（以 cyber-city-score-loop-orchestration.md 登记矩阵为准）。
按看板：1) git fetch；2) 监控在途子代理与分支；3) 过门/合流/登记；4) 缺依赖先调研 docs/spec；5) 输出 Delta（必含四维度表）。
```

### Delta 输出模板（父代理强制）

```markdown
## 登记矩阵
| 维度 | 北极星 | 生产登记 | Δ |
| 综合 | 98 | （当前） | … |
| 视觉 | 98 | （当前） | … |
| 功能 | 90 | （当前或 —） | … |
| 性能 | 85 | （当前或 —） | … |

## 本窗口 Delta
（合流 / 子代理 / 下一拍）
```
