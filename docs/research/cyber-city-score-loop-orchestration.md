# Phase 0 提分 Loop 编排看板

| 项 | 内容 |
|----|------|
| 编排者 | 父代理（只编排，不实现） |
| 实现模型 | `claude-fable-5-thinking-xhigh` |
| 审计模型 | `gpt-5.6-sol-xhigh-fast` |
| 范式手册 | `docs/research/cyber-city-orchestration-paradigm.md` · `AGENTS.md` §4 |
| Loop 3+ 顾问稿 | `docs/research/cyber-city-loop3-planning-consult.md` |
| 生产 tip | `main` @ `2e6126c`（L3 B2+poster 已合入；独立视觉 **65**） |
| Loop 3 目标 | 视觉独立 **≥68**（终审硬门）；综合 ≥85 已达成 |

## 综合分口径（Loop 统一）

| 维度 | 权重 | 数据源 |
|------|------|--------|
| LHCI `/` 四项均值 | 25% | P/A11y/BP/SEO |
| LHCI `/home/` 四项均值 | 15% | 宪法首页回归 |
| e2e 通过率 | 20% | passed/total |
| 视觉 rubric（竞品对标） | 25% | CC-L0-visual 产出量表 |
| 3D 交互冒烟（首幕+POI+ESC） | 15% | 自动化脚本 PASS 项 |

基线由 CC-L0-baseline 首跑登记；每轮 Loop 结束由 CC-AL* 审计复算。

## 三道门（Loop 3+ AND 关系）

| 门 | 含义 |
|----|------|
| \|Δ\|≤5 | 自评与独立分一致性 |
| ≥62 | 历史安全底线（防倒退） |
| **≥68** | Loop 3 终审硬门（仅独立审计分） |

## Loop 0–2 摘要

| Loop | 综合 | 视觉独立 | 裁决 |
|------|------|----------|------|
| L0 | 87.2 | 49–51 | AL0 有条件放行 |
| L1 | 89.2 | 57 | AL1 放行 |
| L2 | 91.0 | 64 | AL2 放行 |

详表见各 `cyber-city-loop*-audit.md`。

## Loop 3 — 🚀 按顾问稿门控链推进

拓扑：`B2C+poster` → `AL3-B2C` → `ATM` → `AL3-MID` →（条件 B3 或 B5）→ `POSTER`（若未合批）→ `AL3`

| ID | 分支 | 任务 | Agent | 状态 |
|----|------|------|-------|------|
| CC-L3-content | `cursor/cc-l3-content-poster-1d6f` | B2 TextCanvas + poster 三面（合批） | [L3-content](bc-629d6692-8f11-5885-bdcd-3296e634b2c9) | ✅ 自评 66；综合 91.5 |
| CC-AL3-B2C | `cursor/cc-al3-b2c-audit-1d6f` | 审 B2C+poster exact tree | gpt-5.6-sol-xhigh-fast | 🚀 已派发 |
| CC-L3-ATM | `cursor/cc-l3-layered-atmosphere-1d6f` | 分层雾/低云带（V2 主攻） | Fable5 xhigh | 待 AL3-B2C 过门 |
| CC-AL3-MID | `cursor/cc-al3-mid-audit-1d6f` | 集成树中审；裁决 B3/B5 | gpt-5.6-sol-xhigh-fast | ✅ 独立 66；裁决 B3+POSTER |
| CC-L3-B3 | `cursor/cc-l3-b3-flight-trails-1d6f` | 飞行光轨（条件） | Fable5 xhigh | 🚀 下一实现（V4 瓶颈） |
| CC-L3-B5 | `cursor/cc-l3-b5-transform-camera-1d6f` | 变形运镜（条件） | Fable5 xhigh | ⏸ 本轮不派（V5 非最低维） |
| CC-L3-POSTER | `cursor/cc-l3-poster-three-surface-1d6f` | poster 三面重拍 | Fable5 xhigh | 待 B3 审计后串行 |
| CC-AL3 | `cursor/cc-al3-loop3-audit-1d6f` | Loop 3 终审 ≥68 | gpt-5.6-sol-xhigh-fast | ⏸ HOLD（66/68） |

## Loop 4–5 前瞻（顾问稿 B 节）

| Loop | 主题 | 前提 |
|------|------|------|
| L4 | Tier C 程序化打磨（材质/IBL 轻量、剪影细节） | L3 ≥68 或程序化上限复评 |
| L5 | Blender/实模特专项裁决 | 独立复评确认程序化天花板 |
| 停 Loop | 独立视觉连续两轮 <+2 且 V2/V4 双瓶颈 | 转实模或降目标 |

## Loop 编排定时器

| 项 | 内容 |
|----|------|
| 订阅名 | `loop-cyber-city-orchestrate` |
| 节奏 | 动态 ~10min（子 Task 墙钟 17–23min，tick 查状态/派发/合流） |
| 父代理 tick | 读看板 → fetch 分支 → 过门则派下一 Task → 更新本文件 |
