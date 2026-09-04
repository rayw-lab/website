# NEXUS-HALL-INDEX · CURRENT AUTHORITY · 2026-09-04

> 本文是本楼唯一 ACTIVE TODO。冲突时：**live Git / 隔离栈 / 日志 > 本文 > 任何旧看板**。
> 目标：`/world/agent-nexus/`「墨迹 · Ink Ledger」——水墨物理承载真实 agent 会话元数据。
> 设计 SSOT = `NEXUS-HALL-DRAFT-2026-09-03.md`；施工 SSOT = `NEXUS-HALL-CHARTER-2026-09-04.md`。
> 更新 2026-09-04 09:05 · 分支 `codex/nexus-hall-20260903` · worktree `~/studio-data-root/worktrees/website-nexus-hall` · base `codex/about-hall-20260902@f942a22` · 上次合流 — · 人测窗口 none

## 状态机

`PLANNED → RESEARCHED（agy 稿已收并亲核）→ BUILT（执行方实装完）→ AUDITED（xhsapi 反核过）→ GATE_PASS（机器门绿）→ LIVE_OBSERVED（隔离栈真开过页面）`
**只有 `LIVE_OBSERVED` 作验收。** worker 自报、build 绿、门绿都不是验收。

## 票册

| 票 | 波 | 目标（一句） | 席位 | write root（唯一） | 依赖 | 最小 Live 验收 | 状态 |
|---|---|---|---|---|---|---|---|
| NX-W0a | W0 | charter + INDEX + 草案入库 | 执行方 | `docs/local-cmd/` | — | 三文件在分支上 | **BUILT** |
| NX-W0b | W0 | 草案对抗审（P0/P1/P2 register） | xhsapi | `~/.codex/state/nexus-hall/out/W0-draft-audit.md` | — | findings 逐条亲核裁决 | **AUDITED**（11 采纳 / 3 驳回，见流水 R1） |
| NX-W0c | W0 | 董事会 ADR ×3（白名单尺度 / 手卷横向 vs 竖滚 / 合流序） | Grok 董事会 | `docs/local-cmd/adr/` | W0b | ADR 落地 | **BUILT**（ADR-6/7/8 固化落地） |
| NX-W1r | W1 | 三家水墨/流体引擎 teardown + 20 条高级感视觉参考 | agy | `~/.codex/state/nexus-hall/out/W1-ink-engine-teardown.md`、`~/studio-data-root/refs/nexus-hall/` | — | 报告有 file:line 锚点 + 许可裁定 + E 节「明确没证的」 | **AUDITED**（两处数字与源码不符已纠，见 R2） |
| NX-W1a | W1 | `InkEngine` 六场十二 pass + display + `?demo` 确定性 | 执行方 | `src/components/city/halls/nexus/ink/` | W1r | spike 页一滴墨洇开；8.2KB gzip[实测]；RM 不起 rAF[实测] | **AUDITED**（xhsapi 引擎审 1×P0 4×P1 6×P2） |
| NX-W1b | W1 | LOCKED 纸色墨谱 + 干纸拒墨行为门 + 锚点门固化 | 执行方 | 同上 + `evidence/nexus-hall/anchors/` | W1a | 锚点门 5/5 PASS[实测]；LOCKED 出图落盘 | **GATE_PASS**（`scripts-local-nexus-w1b-gate.mjs`） |
| NX-W2r | W2 | 多格式会话日志字段映射 + 脱敏做法调研 | agy | 同上 out 目录 | — | 五种格式各给字段表 | **AUDITED**（W2-session-schema.md 已落盘，逐条亲核中） |
| NX-W2 | W2 | reducer + redact 门 + LEDGER-RECEIPT | 执行方（**仅本机**） | `scripts/`、`public/demo/agent-nexus/`、`evidence/nexus-hall/` | W2r, W0c | ledger 过门；条数对账 | **GATE_PASS**（现值 **3025 会话 / 40 天 / 5 席位 / 80 收据**；安全门 rc=0、正确性门 rc=0、幂等 sha 相同。旧记「1067/31」是扩源前的读数，已 supersede） |
| NX-W3r | W3 | suminagashi 数学 + 时间序列艺术化 + scrubber 交互调研 | agy | 同上 | — | 单滴变换公式可实现 | **CLOSED-AS-VERIFIED**（W3 已先行且 R19 把落点改成台账坐标；调研若再派只能是事后背书，无增量，故关闭而非空挂 PLANNED） |
| NX-W3 | W3 | S0 洇 + S1 墨流 + 印抽屉 | 执行方 | `halls/nexus/{Yin,Flow,Seal,Drawer}.*` | W1, W2, W3r | 10s 脚本成立；数字全 ledger 渲染 | **LIVE_OBSERVED**（R19/R20：墨流改台账坐标[横=时间/纵=席位带]+轴标；S0 改真竖排题款+朱砂款印+天数从台账派生。真路由实开自证：2 块 canvas、24 枚印。五跋正文待磊哥） |
| NX-W4r | W4 | 手卷横向叙事 + 中文排版 + 印章设计调研 | agy | 同上 | — | 移动端退化方案明确 | PLANNED |
| NX-W4 | W4 | 手卷 + 五跋 + 试墨 + 收官 | 执行方 | `halls/nexus/{Scroll,Colophon,Trial,Epilogue}.*` | W3, W4r | C 维 100% 绑定；干纸拒墨可见 | **GATE_PASS**（印 Seal 三态 + 共享抽屉 + 跨席交错取样，R20 去 badge-grid 味；**S3 试墨 R22 落地**：干纸区可见并标「纸已干」、键盘可达、不存 PNG，干纸拒墨做成行为门并经故障注入自证会红。**余：手卷 sticky 驱动、五跋正文[待磊哥]、收官四出口**） |
| NX-W5r | W5 | Astro hall 路由/主题作用域 + 构建期 WebGL 截图坑调研 | agy | `out/W5r-agy-wiring.md` | — | SSIM 门做法明确 | **AUDITED**（接线清单四处与实装完全重合；驳回其 CSS 特异度判断[实测证否]；5 条「明确没证的」坐实 4 条、1 条采纳其建议不做，R21-6/7） |
| NX-W5 | W5 | 接线 + 三个门脚本 + e2e + 海报 + sitemap | 执行方 | §3.3 热点文件 + `scripts/` + `e2e/` | W4, W5r | 城里 E 进楼；about-hall e2e 不回归 | **LIVE_OBSERVED**（`/world/agent-nexus/` 200；`world-halls.json` 登记 + 楼宇 `hallPath` 已补[`Areas.ts` 据此进楼]；纸色主题 2×2 正负控进 e2e；`check-links` rc=0、`about-hall-gate` rc=0 无回归；29/29 e2e[墨迹 13 + about 16]；sitemap 含新页；build 25 页） |
| NX-W6 | W6 | 全量 e2e + 盲审双评 + PR + handoff | 执行方 + agy/xhsapi 批评者 | `evidence/nexus-hall/W6/` | 全部 | 人门三维 ≥7 | PLANNED |

## 在途 worker（每轮 tick 必核）

| 单 | 席 | 发起 | 产物落点 | 身份核验 | 状态 |
|---|---|---|---|---|---|
| W1-agy-ink-engine-teardown | agy flash | 2026-09-04 | `~/.codex/state/nexus-hall/out/W1-ink-engine-teardown.md` | receipt `identity_ok` + `served_label` | **已收稿并亲核**（R2） |
| W0-xhsapi-draft-adversarial | xhsapi | 2026-09-04 | `~/.codex/state/nexus-hall/out/W0-draft-audit.md` | `APIDIRECT_RECEIPT` `identity_ok` | **已收稿**（11 采纳 / 3 驳回，R1） |
| W6-agy-three-scene-visual | agy flash | 2026-09-04 07:36 | `out/W6-agy-three-v2.md` | receipt rc=0 | **已收稿并亲核**（采纳 5 / 暂缓 2，R20-1） |
| W6-xhsapi-crosscheck | xhsapi | 2026-09-04 07:38 | `out/W6-xhsapi-crosscheck.md` | receipt | **已收稿并裁决**（3 采纳 / 1 驳回，R20-4） |
| W5r-agy-wiring | agy flash | 2026-09-04 08:23 | `out/W5r-agy-wiring.md` | receipt | 在跑（接线已先行，收稿转为验证性对照） |

## 热点文件持有表（单 writer）

| 文件 | 当前持有票 | 释放条件 |
|---|---|---|
| `src/pages/world/[slug].astro` | — | W5 收稿 |
| `src/layouts/WorldHallLayout.astro` | — | W5 收稿 |
| `src/styles/hall.css` | — | W5 收稿 |
| `src/data/world-halls.json` | — | W5 收稿 |
| `src/data/cyber-city-buildings.json` | — | W5 收稿 |

## NEEDS_LEIGE

| 项 | 为什么必须磊哥 | 建议 |
|---|---|---|
| Grok 席无落点，「淡」色缺席 | grok CLI 不写 job receipt，草案说取 `grok -p` 的 json 返回，但不落盘就无从归约 | ⭐ 接受四色（焦/浓/重/清）先发布；或给 grok 调用加 receipt 落盘后补第五色 |

| 项 | 状态 |
|---|---|
| 五跋正文与每跋「迹」（真实翻车） | 待 |
| rule 文件公开尺度（标题/摘录/全文，逐条） | 待 |
| 数据白名单终审（`*-cli-codex` 探针目录是否可公开） | 待 |
| PR 合入 main | W6 |
| 与 about-hall 合流序 | ADR-③ |

## DEFERRED

| 项 | 解除条件 |
|---|---|
| `/world/agent-nexus/` 进 LHCI collect | Hall 稳定后第二刀 |
| 题跋「背面」的 claude-replay 脱敏 HTML 导出 | 五跋正文定稿后 |
| xterm / asciinema 会话回放 | 不在第一刀 |
