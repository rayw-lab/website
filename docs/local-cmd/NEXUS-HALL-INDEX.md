# NEXUS-HALL-INDEX · CURRENT AUTHORITY · 2026-09-04

> 本文是本楼唯一 ACTIVE TODO。冲突时：**live Git / 隔离栈 / 日志 > 本文 > 任何旧看板**。
> 目标：`/world/agent-nexus/`「墨迹 · Ink Ledger」——水墨物理承载真实 agent 会话元数据。
> 设计 SSOT = `NEXUS-HALL-DRAFT-2026-09-03.md`；施工 SSOT = `NEXUS-HALL-CHARTER-2026-09-04.md`。
> 更新 2026-09-04 14:45 · 分支 `codex/nexus-hall-20260903` · worktree `~/studio-data-root/worktrees/website-nexus-hall` · base `codex/about-hall-20260902@f942a22` · 上次合流 — · 人测窗口 none

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
| NX-W4r | W4 | 手卷横向叙事 + 中文排版 + 印章设计调研 | agy | 同上 | — | 移动端退化方案明确 | **AUDITED**（W4r-agy-handscroll.md 收稿，整套数值改法采纳，R28-3；其画心 31rem 与面 27rem 顶牛由 R29-2 修正为 36/27） |
| NX-W4 | W4 | 手卷 + 五跋 + 试墨 + 收官 | 执行方 | `halls/nexus/{Scroll,Colophon,Trial,Epilogue}.*` | W3, W4r | C 维 100% 绑定；干纸拒墨可见 | **LIVE_OBSERVED**（R27：手卷 sticky 驱动三态门实测 + 五跋骨架[题候选明标、印严格来自台账、绑定标题级] + 收官四出口与简介复制；试墨 R22；印 Seal R20。**唯一余项：五跋正文与迹[NEEDS_LEIGE]**。R29：agy B 段验修 11 条裁决落地，降级文案真因=CSS 盖 [hidden]（非 WebGL）；R30：盲评 C 13 条整改 + 席位口径门 + 吸收量软肩 2×2，e2e 24/24，`e8587c0`） |
| NX-W5r | W5 | Astro hall 路由/主题作用域 + 构建期 WebGL 截图坑调研 | agy | `out/W5r-agy-wiring.md` | — | SSIM 门做法明确 | **AUDITED**（接线清单四处与实装完全重合；驳回其 CSS 特异度判断[实测证否]；5 条「明确没证的」坐实 4 条、1 条采纳其建议不做，R21-6/7） |
| NX-W5 | W5 | 接线 + 三个门脚本 + e2e + 海报 + sitemap | 执行方 | §3.3 热点文件 + `scripts/` + `e2e/` | W4, W5r | 城里 E 进楼；about-hall e2e 不回归 | **LIVE_OBSERVED**（`/world/agent-nexus/` 200；`world-halls.json` 登记 + 楼宇 `hallPath` 已补[`Areas.ts` 据此进楼]；纸色主题 2×2 正负控进 e2e；`check-links` rc=0、`about-hall-gate` rc=0 无回归；29/29 e2e[墨迹 13 + about 16]；sitemap 含新页；build 25 页） |
| NX-W7 | W7 | 城→厅转场（开车进楼动效/画面/跳转）+ 本楼 showcase 机位 | agy 调研 + 执行方实装 | `src/lab/world/areas/PoiArrival.ts`、`src/data/camera-shots.json`、`halls/nexus/*`、`HallChrome` 到达钩 | W5 | 城里按 E 进楼有前奏与转场，2×2（from=city 有/无） | **LIVE_OBSERVED**（R32 落地 → R34 按 agy W11 审计整改三个 P0（落点实测 46.8%、起笔绑楼投影、墨拓高反差）→ R35 移动端自查修三处假绿（落点随画布解算、变量写元素 inline、filter/mask 分层）。桌面+移动端双视口自看对齐 S0；本厅 e2e 25/25、城侧转场 3/3、预算门绿，`424ebef`。residual：城侧墨吞中段慢放帧未进片、移动端毛刺 scale 未按视口缩放） |
| NX-W17 | W17 | **回城协议**（楼→城接缝：续驶 + 375 免门 + 后退兜底 + 幕布「墨退霓虹」+ 楼侧退场遮罩）——磊哥授权拍板 2026-09-04 | 执行方亲做 + agy×2（hub-world 调研/挑刺）+ glm53flash（代码方案交叉） | `src/lab/world/index.ts`（resume 腿）、`player/TransformSystem.ts`（resumeAsCar）、`world/Reveal.ts`（resume）、`areas/{Areas,QuestLine,ExploreProgress}.ts`（朝街/种子）、`city/CityMap.ts`（exitHeading）、`core/SessionTimeline.ts`（world-resume）、`src/pages/index.astro`（from 白名单/幕布/免门/兜底）、`HallChrome.astro`（from=hall + 退场遮罩 + world-return-v1） | W7 | `?poi=&from=hall` 直达 car_ready 车头朝街 V 可用；无 from=hall 零回归；375 from=hall 不拦；e2e `cyber-city-return.spec.ts` 5 例 + 城侧回归 | **LIVE_OBSERVED**（R39-3/4：回城 e2e 5/5、城侧回归 35/35、五门+check-links 全绿、自看两处修毕；真 GPU 收幕已验 R40-1，冷启动滞留观察一次未复现 R40-2） |
| NX-W6 | W6 | 全量 e2e + 盲审双评 + PR + 合流首页 + handoff | 执行方 + agy/seed 批评者 | `evidence/nexus-hall/W6/` | 全部 + W7 | 双评 ≥7；PR 合入 main（像 #234） | **GATE_PASS-IN-FLIGHT**（双评 agy 7 / seed 8，R30-1/R31-3；已 merge origin/main 落后 65→0，七门全绿 R33；合并后全量 e2e 在跑 105/137 零失败；**PR 与合流待磊哥授权**） |

## 在途 worker（每轮 tick 必核）

| 单 | 席 | 发起 | 产物落点 | 身份核验 | 状态 |
|---|---|---|---|---|---|
| W1-agy-ink-engine-teardown | agy flash | 2026-09-04 | `~/.codex/state/nexus-hall/out/W1-ink-engine-teardown.md` | receipt `identity_ok` + `served_label` | **已收稿并亲核**（R2） |
| W0-xhsapi-draft-adversarial | xhsapi | 2026-09-04 | `~/.codex/state/nexus-hall/out/W0-draft-audit.md` | `APIDIRECT_RECEIPT` `identity_ok` | **已收稿**（11 采纳 / 3 驳回，R1） |
| W6-agy-three-scene-visual | agy flash | 2026-09-04 07:36 | `out/W6-agy-three-v2.md` | receipt rc=0 | **已收稿并亲核**（采纳 5 / 暂缓 2，R20-1） |
| W6-xhsapi-crosscheck | xhsapi | 2026-09-04 07:38 | `out/W6-xhsapi-crosscheck.md` | receipt | **已收稿并裁决**（3 采纳 / 1 驳回，R20-4） |
| W5r-agy-wiring | agy flash | 2026-09-04 08:23 | `out/W5r-agy-wiring.md` | receipt | **已收稿并亲核**（R21-6/7） |
| W7-agy-blind-A / W8-agy-verify-B | agy flash | 2026-09-04 10:5x / 11:14 | `out/W7-agy-blind-A.md`、`/tmp/agy-w8-verify.log`（receipt agy-rescue-20260904-111428-ad946b91） | receipt rc=0 | **已收稿并裁决**（R28-1 / R29-2）；下一单=定稿后盲审 C 段（只给分不给修单） |
| W9-agy-blind-C / W9-glm-crosscheck | agy flash / glm53flash | 2026-09-04 11:5x | `out/W9-agy-blind-C.md`、`out/W9-glm-crosscheck.md` | receipt | **已收稿并裁决**（R30-1 / R30-2：13 条采纳 10、部分 2、驳回 1；反核坐实 4 不可核 1） |
| W9-lessons | xhsapi→glm53flash（端点 RST 自动换席） | 2026-09-04 12:0x | `docs/local-cmd/NEXUS-HALL-LESSONS-2026-09-04.md` | receipt identity_ok | **已收编**（R30-3） |
| W7-glm-crosscheck | glm53flash | 2026-09-04 | `out/W7-glm-crosscheck.md` | APIDIRECT_RECEIPT | **已收稿并裁决**（R28-2） |

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
| Grok 席无落点，「淡」色缺席 | **已查清（R26）**：`~/.grok/sessions` 有 8.7GB 会话可归约，接入实测 854 会话/23 天落点，但幂等待修 | **磊哥 2026-09-04 令：不管 Grok，聚焦主线。** 四色先发布；补丁存档 `proposals/grok-seat-reducer.patch` |

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
