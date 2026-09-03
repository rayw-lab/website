# NEXUS-HALL · 审计流水账（append-only）

> 台账（当前状态）= `NEXUS-HALL-INDEX.md`；本文是流水账，只追加不重写。
> 记录：每条 finding 的**当时依据 + 亲核证据 + 裁决**。台账被整体替换后，这里的理由仍在。

---

## R1 · W0b 草案对抗审（xhsapi dots3-note-prev，2026-09-04）

- 派单：`~/.codex/state/nexus-hall/prompts/W0-xhsapi-draft-adversarial.md`
- 产物：`~/.codex/state/nexus-hall/out/W0-draft-audit.md`（33,996 bytes）
- identity：`served_model=dots3-note-prev` / `identity_ok=true` / `identity_match=exact` / `thinking_sent=true`（receipt `api-direct-20260904-002739-e3825fda`）
- 收稿口径：执行方逐条亲核后裁决，**不盲修**（审计员 ~1/4 误报率）。

### 采纳（ACCEPT）

| # | finding | 亲核证据（执行方一手） | 落点 |
|---|---|---|---|
| **P0-1** | S0「8× 压缩」与 10 秒窗口数学上不成立 | 草案 §1.2 给三路 247/763/2140s，S0 窗口 0.6–10s。**2140 ÷ 8 = 267.5s ≫ 9.4s**，算术硬矛盾 | charter §4.0-a：改为**双级映射**（8× 只是墨扩散速度的物理比例，另设独立的"回放时基"把最长路压进 9.4s），schema 加 `dispatches[].branches[]` |
| **P0-2** | `nexus-hall-scenes.json` 波次倒置 | `grep -n` 实测：草案 `:229` 说 W3 的 progress 映射依赖它，`:292` 把它列为 **W4** 交付物 | charter §4.0-b：文件归 **W3** 创建，W4 只追加区间 |
| **P0-3** | MVP 人日算术不平 | 草案 `:289-291` W1=2 / W2=1 / W3=1.5，和 = 4.5；`:296` 写「MVP（W1+W2+W3+最小 W5）≈ 4.5」→ **最小 W5 = 0 人日**，而无 W5 页面不可达 | charter §4.0-c：全表重估，合计 8 → **11 人日**，MVP 4.5 → **7** |
| **P1-1** | 子预算无独立闸门（引擎 ≤30KB 藏在 chunk ≤50KB 里）、帧率无门 | 草案 §4.4 列 30/12/4 三项子预算，§4.5 门只查合计 ≤50KB | charter §4.0-d：门加**子预算独立断言** + e2e 加 rAF 帧间隔采样 |
| **P1-2** | 无 JS 态缺 S1 海报；RM ∩ 无 JS 交集未覆盖 | 草案 §1.5「无 JS」行只写「首屏标题 + S0 海报 + 五跋全文」 | charter §4.0-e：四态 × 两张海报的**完整映射表** |
| **P1-3** | 刷新落中段：滚动恢复而 canvas 从 t=0 重放（纸旧墨新） | 草案 §1.5 只写「按当前滚动恢复」，§4.2 未定义 canvas seek | charter §4.0-f：`replay(script,{startTime})` 由 progress 反算 |
| **P1-4** | 门要 stat `~/.claude/rules/*.md`，但该路径是磊哥本机私有、不在仓也不在 CI | 草案 §2.1 `data-bind` 含 `rule:~/.claude/rules/x.md`；§4.5 门查「rule 文件存在」；§3.2 明确 rule 正文不进 ledger | charter §4.0-g：新增 `rule-manifest.json`（ops 机生成，只含**相对标识 + bytes + sha256**），门改查 manifest |
| **P1-5** | `rg -i 'ark-'` 正则过宽 | **已现形**：`rg -i -o 'ark-[a-z]*' src/` 实测 **16 处**命中（`park-path` / `park-chip` / `park-car` / `park-slot` 等泊车标识符，在 `src/lab/modules/tts-cockpit/engine.ts` 与 `src/pages/lab/tts-cockpit.astro`）。门一上线必红且与安全无关 | charter §4.0-h：正则收紧为 `ark-(plan\|coding\|token)\b`，并**先在 HEAD 上跑一次证明基线为 0** |
| **P2-1** | S0 只列印的 `true`/`null` 两态，漏 `false`（白文 NO_GO） | 草案 §1.2 vs §1.3 自相矛盾（§1.3 明定三态） | charter §4.0-i：三态齐 |
| **P2-4** | 「15s 无交互暂停」归属移动端还是通用，三处口径不一 | 草案 §1.5 移动端行 / §4.1 lifecycle / §4.4 GPU 行 | charter §4.0-j：定为**通用生命周期**，移动端行只留移动端特有项 |
| **2.3** | 门的自伤面：gate 异常被吞则表现为全绿；`sum(days[].n)` 自洽检查在 reducer 双计时两边同错 | 属实，是本仓已多次踩过的形态 | charter §4.0-k：三门一律 **fail-closed + 打印分母 + `--selftest` 注入自证** |

### 驳回（REJECT，附理由）

| # | finding | 驳回理由 |
|---|---|---|
| **P1-6** | 建议把 `/world/agent-nexus/` 加进 `lighthouserc.json` | **重开已拍死项**：草案 §4.3 明写「第一刀不加」，charter §6 硬禁区第 8 条同。审计员指出的「性能 claims 无独立验证」属实，但改由既有 `scripts/audit-budget.mjs` + 门的载荷断言覆盖，不动 LHCI 在册 URL 集合 |
| **2.6-6** | 疑 `x-paidax-research` 为客户项目 | **事实不成立**：一手核过 `docs/research/x-paidax-hero-research-2026-09-02/README.md:1-8`——是磊哥拆解 X 上一条**公开帖**（@xin_pai88825）的调研，非客户/雇主项目。标签可公开 |
| **2.6-1/2**（部分） | 建议 `t0` 精确到天、单日会话数模糊化 | **与本厅核心冲突**：S0 洇与 S1 墨流的全部表现力来自**时序**（滴按时间落下、环被后来的滴推薄）。t0 降到天粒度等于砍掉第二站。保留秒级；「单项目单会话可识别」记 DEFERRED 由磊哥在白名单终审时一并定 |

### 上抛磊哥（NEEDS_LEIGE，新增）

| 项 | 来源 | 问题 |
|---|---|---|
| `receipts[].sha256` 全值是否入 ledger | 审计 2.6-8 | 印文只显前 7 位，但全值在公开 JSON 里。建议只存前 12 位（够做唯一键，不构成可校验指纹）——**默认按建议做，磊哥反对再改** |
| `artifacts[].path` 粒度 | 审计 2.6-4 | 保留目录层级会暴露内部结构。建议只留文件名 + 扩展名——**默认按建议做** |
