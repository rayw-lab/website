# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| 渲染架构 | `cyber-city-rendering-architecture-audit.md` |
| 渲染缺口裁决 | `cyber-city-rendering-gaps-consult.md`（Sol 2026-08-26） |
| 北极星 | 综合 **98**（当前 **92.0**，Δ **−6.0**） |
| 生产 tip | 合流后更新（登记 **92.0/68**） |

## Loop 5 — ✅ 有条件放行（AL5）

| ID | 分支 | Agent | 状态 |
|----|------|-------|------|
| CC-L5-C1 | `cursor/cc-l5-tierc-interior-windows-1d6f` @ `8c7da76` · [PR #40](https://github.com/rayw-lab/website/pull/40) | [L5-C1](bc-2a06873e-daa2-5ab0-8806-06c78da0f5de) | ✅ 已合 main |
| CC-AL5 | `cursor/cc-al5-loop5-audit-1d6f` @ `9d829e4` | [AL5](bc-828f4da0-f935-55b1-bc0d-0cfbb8538202) | ✅ 有条件放行 |

**登记分（审计独立口径）**：视觉 **68**（raw 68.00，AL4 +0.50）· 综合 **92.0** · e2e 52/52 · LHCI 不降  
**未达成**：Loop 5 专项门独立视觉 ≥70；L5 自评 69 **不得登记生产**  
**报告**：`docs/research/loop5-audit.md`

### AL5 放行条件（父代理须遵守）

1. 看板只登记 **68/92.0**，不宣称 Loop 5 ≥70  
2. **停止普通程序化 Tier C 叠件**（禁 tone mapping/雨丝/HUD 等赌分）  
3. 下一视觉动作：**单 hero 楼 + 街角 Blender spike**（须产品立项）；不批准则视觉停在 68 收口  
4. poster 三面等 runtime/资产路线冻结后单独批  
5. `CC-MNT-TICKER-TSL` 可维护 PR，不占视觉 Loop  

## 下一拍（待产品/父代理裁决）

| 路径 | Task | 条件 |
|------|------|------|
| **A Blender spike** | `CC-BL1-hero-corner` | 产品批准；单栋 hero + 街角；V4 主攻 |
| **B 收口** | — | 不批准 Blender → 视觉停 68，北极星 98 需另策 |
| **维护** | `CC-MNT-TICKER-TSL` | ✅ 实现完毕（见下节），待审/待合 |

**不开**：Loop 6 tone mapping（AL5 裁决：残余非 V2/V3 主导）

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

## Loop 4 — ✅ · 专项 — ✅

Loop 4 B5+AL4（视觉 68）；Rendering-Audit [PR #39](https://github.com/rayw-lab/website/pull/39)。

## 定时器

`loop-cyber-city-orchestrate` · **300s（5m）** · 北极星 98 · 等 Blender 立项或收口裁决
