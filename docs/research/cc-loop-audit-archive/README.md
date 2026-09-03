# cc-loop 审计原文归档（R-5-6 · 任务书 v3 §3）

| 目 | 审计者 | 会话/模式 | 原始裁决 | 归档内容 |
|---|---|---|---|---|
| audit-A | 首轮审计 A（第一轮双外部审计之一） | 浏览器只读五件套 | NO_GO（C9/C10 REFUTED；第三轮复核定谳：append-only 成立→P1；C10 范围错置部分成立） | audit-report / evidence-index / findings / score-recompute.html / verdict |
| audit-B | 首轮审计 B | 浏览器只读五件套 | NO_GO（C2/C10 REFUTED；第三轮复核定谳：rotY 算术成立但影响半径 0 → P2） | 同五件套 |
| audit-C | 第三轮审计 C | 浏览器只读 + API，五件套 + 18 件 rotY 全量重放 | NO_GO（5 REFUTED：#224 confession/#222-223 收据/C7/历史 append-only/C10 精确归因；P0=0，94/76 复算一致） | 同五件套 + SHA256SUMS |
| audit-D | 第三轮审计 D | 浏览器只读五件套 | NO_GO（P1=3：C7/C1 历史字面/闭环声明；P0=0，94/76 复算一致） | 同五件套 |

- 归档目的：闭合第三轮审计 C-F-P2-005 / D-F-U-001（「前两轮审计原文不可复审」）——自此四轮审计原文均可 raw 抓取，对前审裁定的复审升级为终局。
- 排除项：audit-B 的 source-artifacts 二进制（LHCI zip 6.8MB，artifact GitHub ID 9831423112 在档可取）。
- 本归档为不可变证据件：后续修正一律以追加勘误实现，禁改写。
