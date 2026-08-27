# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现 | `claude-fable-5-thinking-xhigh` · 审计 `gpt-5.6-sol-xhigh-fast`（**禁止降级**） |
| 范式 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 生产 tip | `main` @ `fca5bab` |
| 更新 | 2026-08-27 |

### 登记矩阵（**每 tick 首段必输出**）

| 维度 | 北极星 | 生产登记 | Δ | 说明 |
|------|--------|----------|---|------|
| **综合** | **98** | **80** | +18 | LHCI+e2e+视觉+smoke；不含功能/性能 |
| **视觉** | **98** | **71** | +27 | AL-CAM · `cyber-city-visual-rubric-score.json` |
| **功能** | **90** | **—** | +90 | 待 **CC-AL-FXN** |
| **性能** | **85** | **—** | +85 | 待 **CC-AL-PERF** + human-gate |

> 登记只认审计独立分。禁止用 LHCI/e2e/smoke 冒充功能或性能。

---

## 当前焦点（Loop 8）

e2e 合同 **~69+ 用例**（C1/C3/PERF-C1 已合 [#62](https://github.com/rayw-lab/website/pull/62)[#65](https://github.com/rayw-lab/website/pull/65)[#66](https://github.com/rayw-lab/website/pull/66)）

| 轨 | 状态 | 下一拍 |
|----|------|--------|
| 功能 IMPL | C1/C2/C3 + OBS ✅ · **C4 未派** | AL-FXN 或 C4 |
| 性能 IMPL | PERF-C1 ✅ [#66](https://github.com/rayw-lab/website/pull/66) | 真机六腿 → AL-PERF |
| 驾驶 | VEH-C2 ✅ · R2 **NO-GO 6/7** [#67](https://github.com/rayw-lab/website/pull/67) | 67/67 e2e 全绿 |
| 审计 | — | **CC-AL-FXN** · **CC-AL-PERF** |

### 在途

| ID | 状态 |
|----|------|
| CC-AL-FXN | ⏳ 可派（C1/C2/C3 已合） |
| CC-AL-PERF | ⏳ PERF-C1 已合 + 真机待回填 |
| CC-FXN-C4 | ⏳ 目标/进度轻任务（待拍板） |
| CAR-E2E-01/05 | ⏳ 超时修 → VEH-R2 升 GO |

### 阻塞

- **PR [#43](https://github.com/rayw-lab/website/pull/43) BL2** · NO-GO · **禁止合流**
- tone mapping defer · poster 最后

---

## 归档（一行速查）

L5 68 · L6 CAM **71** [#45](https://github.com/rayw-lab/website/pull/45) · L7 VEH-C2 [#63](https://github.com/rayw-lab/website/pull/63) · L8 doc [#47](https://github.com/rayw-lab/website/pull/47)–[#64](https://github.com/rayw-lab/website/pull/64) · L8 impl [#53](https://github.com/rayw-lab/website/pull/53)[#57](https://github.com/rayw-lab/website/pull/57)[#56](https://github.com/rayw-lab/website/pull/56)[#62](https://github.com/rayw-lab/website/pull/62)[#63](https://github.com/rayw-lab/website/pull/63)[#65](https://github.com/rayw-lab/website/pull/65)[#66](https://github.com/rayw-lab/website/pull/66)[#67](https://github.com/rayw-lab/website/pull/67)

---

## 纪律

- 单 PR 单主题 · 并行用独立 worktree
- tick **只输出矩阵 + Delta**，不复述历史

## 定时器

**唯一订阅** `loop-cyber-city-orchestrate` · **600s** · 精简 prompt（矩阵 → fetch/看板 → 合流/派单 → ≤5 行 Delta）
