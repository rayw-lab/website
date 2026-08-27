# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现 | `claude-fable-5-thinking-xhigh` · 审计 `gpt-5.6-sol-xhigh-fast`（**禁止降级**） |
| 范式 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 生产 tip | `main` @ `f1646f2` |
| 更新 | 2026-08-27 · 瘦身版（历史 Loop 见 §归档） |

### 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 说明 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | LHCI+e2e+视觉+smoke；**不含**功能/性能 |
| **视觉** | **98** | **71** | +27 | AL-CAM · `cyber-city-visual-rubric-score.json` |
| **功能** | **90** | **—** | +90 | 待 **CC-AL-FXN** 独立审计登记 |
| **性能** | **85** | **—** | +85 | 待 **CC-AL-PERF** + human-gate §5.4 真机 |

> 登记只认审计独立分。**禁止**用 LHCI / e2e / smoke 冒充功能或性能。旧口径 92.0/68 已作废。

---

## 当前焦点（Loop 8 · 功能 90 / 性能 85）

**入口**：`docs/research/cyber-city-function-gameplay-loop.md` · e2e 基线 **64 用例 / 12 文件**

| 轨 | 阶段 | 状态 | 正本 |
|----|------|------|------|
| 功能 | RS→BR→ADV→DES→TEST→IMPL | C1/C2 + OBS ✅ · **C3 待派** · C4 未派 | `docs/spec/cyber-city-function-rubric.md` · `cyber-city-function-test-plan.md` |
| 性能 | RS→BR→DES→TEST→IMPL | DES ✅ · **PERF-C1 待派** | `docs/spec/cyber-city-perf-rubric.md` · `cyber-city-perf-test-plan.md` · `cyber-city-perf-impl-plan.md` |
| 驾驶 | VEH-C2 整改 | ✅ [#63](https://github.com/rayw-lab/website/pull/63) 已合 · **AL-VEH-R2 待审** | `docs/research/loop-veh-audit.md` |
| 审计 | AL-FXN / AL-PERF | ⏳ IMPL 批次后 | 独立 Sol · 唯一登记出口 |

### 在途子 Task

| ID | 分支 | 状态 |
|----|------|------|
| CC-AL-VEH-R2 | `cursor/cc-al-veh-r2-audit-1d6f` | 🔄 Sol · VEH-C2 [#63](https://github.com/rayw-lab/website/pull/63) 后重审 |
| CC-PERF-C1 | `cursor/cc-perf-c1-e2e-1d6f` | 🔄 Fable5 · CITY-PERF-01/02 e2e（照 `perf-test-plan` §1.3 三处 config diff） |
| CC-FXN-C3 | `cursor/cc-fxn-c3-poi-arrival-1d6f` | 🔄 Fable5 · POI 进站前奏 · CITY-PA-01…04 |
| CC-AL-FXN | — | ⏳ C3 合流后或父代理拍板提前 |
| CC-AL-PERF | — | ⏳ PERF-C1 + 真机六腿回填后 |

### 下一拍序

1. **AL-VEH-R2** → 驾驶 UX 诊断分更新（非功能登记）
2. **PERF-C1** [#PR 待开] → CI 五步链产 `city-perf-evidence.jsonl`
3. **FXN-C3** → `shot-apply`/`shot-interrupt` 埋点转正
4. **AL-FXN** / **AL-PERF** → 登记 JSON 落盘

---

## 阻塞

| 项 | 裁决 |
|----|------|
| **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** | ❌ AL-BL2 复审 NO-GO **71/92.8**（V4 专项门失败）· **禁止合流** · 待机至 BL2-CAM 重审 |
| tone mapping | defer · Blender 路径验证后再开 |
| poster 三面 | **永远最后** |

---

## 归档（已完成 · 细节见各 loop 报告）

| Loop | 要点 | 登记/PR |
|------|------|---------|
| L5 | 有条件放行 | AL5 68/92.0 · `loop5-audit.md` |
| L6 CAM | 镜头/POI 单源 | AL-CAM **GO 71** · [#45](https://github.com/rayw-lab/website/pull/45) |
| L7 VEH+FX | V 键 FPV + 变形粒子 | TRANS-FX GO 74 · VEH NO-GO→C2 已合 [#63](https://github.com/rayw-lab/website/pull/63) |
| BL1 | Blender hero | AL-BL1 70/92.5 · [#42](https://github.com/rayw-lab/website/pull/42) |
| MNT | Ticker TSL | [#41](https://github.com/rayw-lab/website/pull/41) |
| L8 doc | 功能/性能规格 | [#47](https://github.com/rayw-lab/website/pull/47)–[#64](https://github.com/rayw-lab/website/pull/64) |
| L8 impl | OBS + FXN + VEH | [#53](https://github.com/rayw-lab/website/pull/53)[#57](https://github.com/rayw-lab/website/pull/57) · [#56](https://github.com/rayw-lab/website/pull/56)[#62](https://github.com/rayw-lab/website/pull/62) · [#63](https://github.com/rayw-lab/website/pull/63) |

**Loop 8 已合 PR 速查**：OBS [#51](https://github.com/rayw-lab/website/pull/51)[#53](https://github.com/rayw-lab/website/pull/53)[#57](https://github.com/rayw-lab/website/pull/57) · FXN [#47](https://github.com/rayw-lab/website/pull/47)[#48](https://github.com/rayw-lab/website/pull/48)[#49](https://github.com/rayw-lab/website/pull/49)[#56](https://github.com/rayw-lab/website/pull/56)[#61](https://github.com/rayw-lab/website/pull/61)[#62](https://github.com/rayw-lab/website/pull/62) · PERF [#59](https://github.com/rayw-lab/website/pull/59)[#60](https://github.com/rayw-lab/website/pull/60)[#64](https://github.com/rayw-lab/website/pull/64)

---

## 纪律

- 登记只认审计独立分；每次 Delta 复述四维度
- 单 PR 单主题；并行任务用 **独立 worktree**
- 功能/性能：**可观测先行**（SessionTimeline · dump 合同）

## 定时器

`loop-cyber-city-orchestrate` · **600s** · 首段必输出登记矩阵 + 本窗口 Delta

**播报模板**（状态随 tip 更新，勿抄旧 tick）：

```markdown
| 维度 | 北极星 | 生产登记 | Δ | 在途 |
| 综合 | 98 | 80 | +18 | score-loop |
| 视觉 | 98 | 71 | +27 | AL-CAM |
| 功能 | 90 | — | +90 | C3/PERF-C1/AL-FXN |
| 性能 | 85 | — | +85 | PERF-C1/AL-PERF |
```
