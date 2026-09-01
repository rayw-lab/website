# CC-LOOP 交接档 · 停 /loop（2026-08-28）

- **角色**：云端总指挥交接（父代理编排收口）
- **停机时刻**：2026-08-28 **23:00 UTC**（指挥官明示：停掉 loop 循环并写交接）
- **main tip**：`9e7c560`（[#179](https://github.com/rayw-lab/website/pull/179) AUD-C1 段末审计 R3 有条件 GO）
- **订阅**：`loop-cyber-city-orchestrate`（10m）及残余 PR/CI/心跳订阅已全部 **unsubscribe**；本档生效后**禁止再武装**同名 10m loop，除非指挥官书面重启。

---

## 0. 登记矩阵（看板单源口径）

| 维度 | 北极星 | 生产登记 |
|------|--------|----------|
| 综合 | **98** | **80** |
| 视觉 | **98** | **73** |
| 功能 | **90** | **87** |
| 性能 | **85** | **—** |

性能 **—** 解锁条件不变：指挥官真机 human-gate 六腿 → AL-PERF（[#155](https://github.com/rayw-lab/website/pull/155)）。永不代决。

看板单源：`docs/research/cyber-city-score-loop-orchestration.md`（SEC-R7 [#176](https://github.com/rayw-lab/website/pull/176) 已合；其后 #178/#179 合入后看板尚未再收一拍——续任 SEC 应用 R8 补登）。

---

## 1. 为何停机

1. 指挥官指令：停 `/loop 10m`。
2. **Cloud Agent 用量耗尽**（`USAGE_BLOCKED`）：Task 扇出（#166 fix-forward、#166+#177 合流急裁、顾问）连续失败 → 空转无法打破；董事会也无法派单。
3. 积压 timer 曾造成数十条迟到通知（旧快照复读）；心跳与 loop 已拆干净，避免继续噪声。

---

## 2. 已合入主干（本波关键收口，按 tip 演进）

| 序 | PR | merge ≈ | 内容 |
|----|-----|---------|------|
| — | … | … | 更早 R5/R6 见看板 MERGE-WAVE 11/12 |
| 1 | [#172](https://github.com/rayw-lab/website/pull/172) | `7865a84` | 董事会 BGM-SYNTH-SCOPE：合成氛围垫 v0 附条件批准；BGM-C1 **开工授权**；HG-B1/HG-B2；合入≠实现授权先例切割 |
| 2 | [#174](https://github.com/rayw-lab/website/pull/174) | `84f23ea` | Codex 合后/合前补洞：#171 preclear（隔离端口 socket bind、pipefail/EXIT=）+ #170 thumbstrip（方向键/触控 baseURL/恒等口径） |
| 3 | [#173](https://github.com/rayw-lab/website/pull/173) | `bcc5b8c` | SEC-R6 看板 + rebase 解 #172 冲突 |
| 4 | [#175](https://github.com/rayw-lab/website/pull/175) | `4a58789` | 董事会 AUD-R2-E7-DEAD：R2 判死 + R3 附条件 GO（HB-1..5）+ SIG-E7 + R1/R2 分账 |
| 5 | [#176](https://github.com/rayw-lab/website/pull/176) | `681057f` | SEC-R7 MERGE-WAVE 13 收账 |
| 6 | [#178](https://github.com/rayw-lab/website/pull/178) | `2ae5e7c` | NAV-C1 段末审计：**fix-forward**（禁天然合 #166） |
| 7 | [#179](https://github.com/rayw-lab/website/pull/179) | **`9e7c560`** | AUD-C1 段末审计 R3：**有条件 GO**（#164 零回归；全量欠账非 #164） |

站立授权（[#159](https://github.com/rayw-lab/website/pull/159)）：docs 直合；**含 src 须董事会急裁**。

---

## 3. 开放工程 PR（禁合，除非下文条件齐）

### 3.1 [#166](https://github.com/rayw-lab/website/pull/166) NAV-C1（draft · MERGEABLE · tip `5faab5f`）

- **审计**：`docs/research/cc-loop-audit-nav-c1.md` / [#178](https://github.com/rayw-lab/website/pull/178)
- **裁决**：fix-forward，**禁天然合并**
- **唯一 #166 产品欠账**：CITY-AUD-01——小地图钮盖住 #164 静音钮（HUD 右上角重叠）
- **补洞闭口**：F1 CSS/布局不相交；F2 两钮 `boundingBox` 不相交断言；过 F1–F3 后预授 GO
- **不入本单**：PERF-01/02 规格恒红 → CC-PERF；部分环境性失败挂 VM 账
- **状态**：fix Task **未派出**（USAGE_BLOCKED）

### 3.2 [#177](https://github.com/rayw-lab/website/pull/177) BGM-C1（draft · CI 绿 · tip `2b00c31`）

- **开工依据**：[#172](https://github.com/rayw-lab/website/pull/172) 已合；任务书 §F-3 + HG-B1/HG-B2 + §D 三证
- **自证**：串联双 GainNode；CITY-BGM-01 双用例 PASS；零资产三证；默认 OFF
- **合入**：含 src → **必须另案董事会急裁**（禁站立授权直合）
- **冲突**：与 #166 在 `SessionTimeline.ts` + `docs/spec/cyber-city-observability.md` **CONFLICTING**（cc-bgm-rs §10-8 预告点）
- **合流急裁 PR**：未开（USAGE_BLOCKED）

### 3.3 [#104](https://github.com/rayw-lab/website/pull/104) X2 立面（draft · tip `bbba5a5`）

- ready 单门 = 全量 e2e（fresh `--list` 分母；#177 落地后预计 **83/18**，以当时实测为准）0/0/0
- 非 e2e 预清已合（[#171](https://github.com/rayw-lab/website/pull/171) + [#174](https://github.com/rayw-lab/website/pull/174) 剧本）
- **#166 先合重建规则**仍适用；互斥令：全量窗与在途 chrome 级错峰
- AUD R3 转出的 H1b/H2/H3 定向补洞挂 #104 ready 链（见 `cc-loop-audit-aud-c1.md` §6/§8）

---

## 4. 审计与生命征象（已结）

| 线 | 结论 | 文档 |
|----|------|------|
| AUD R2 | **E7 DEAD**（#175）；禁 resume；分支 `cursor/cc-loop-audit-aud-c1-r2-f37e` 保留（含 `b5542ac`） | `cc-loop-board-aud-r2-e7-dead.md` |
| AUD R3 | 完工；HB 兑现；§6 **有条件 GO**；报告已合 #179 | `cc-loop-audit-aud-c1.md` |
| R2「幽灵完账」 | 情报账；资格账归 R3/#175 | 同报告 §8 |
| NAV 段末 | 完工；fix-forward；#178 已合 | `cc-loop-audit-nav-c1.md` |
| SIG-E7 | 面板 RUNNING ≠ 存活；长跑单须心跳条款 | #175 §C |

---

## 5. 续任立即执行清单（建议序）

1. **开 Cloud Agent on-demand**（或本机 / 非耗尽账号）——否则无法 Task。
2. 派 **#166 fix-forward**（F1+F2；draft 追加同分支；禁合）。
3. 派 **董事会急裁** `CC-LOOP-BOARD-NAV-BGM-MERGE`：#166/#177 合入条件 + **合流序** + 冲突解法（观测白名单双全）。
4. 按急裁序：先合修复后的 #166（经急裁）→ 再解冲突合 #177（经急裁）→ 或急裁另定序。
5. SEC-R8：看板补登 #178/#179 + 本交接 + 开放 PR 表。
6. #104：按 R3 有条件 GO 排全量 e2e 开窗（隔离端口剧本见 `cc-loop-104-ready-preclear.md`，**禁 ss、禁复用 4321**）。
7. 可选：CC-PERF 规格工单（`data-ws-fps` 城市页先天恒红）。
8. **不要**重新武装 `loop-cyber-city-orchestrate`，除非指挥官书面重启。

---

## 6. 指挥官三阻塞（永不代决）

1. **CAM 红线 v2** §8 签字（`docs/spec/cyber-city-camera-orbit.md`）——未签则视角旋转实现禁开。
2. **真机性能六腿** → AL-PERF（生产第四行唯一解锁）。
3. **安卓 + 序 A·B**（S-2 / human-gate）。

请明确回复：**同意 / 附条件 / 拒绝**（至少针对 CAM）。

---

## 7. 关键路径与纪律速查

| 用途 | 路径 |
|------|------|
| 编排看板 | `docs/research/cyber-city-score-loop-orchestration.md` |
| 编排范式 | `docs/research/cyber-city-orchestration-paradigm.md` |
| 站立授权 | `docs/research/cc-loop-board-merge-standing-auth.md` / #159 |
| BGM 开闸 | `docs/research/cc-loop-board-bgm-synth-scope.md` / #172 |
| BGM 调研 | `docs/research/cc-bgm-rs.md` |
| #104 预清剧本 | `docs/research/cc-loop-104-ready-preclear.md` |
| 测试框架分母 | `docs/research/cyber-city-test-framework.md` |
| 视觉 rubric | `docs/research/cyber-city-visual-rubric.md` |

**模型**：子代理默认 `claude-fable-5-thinking-xhigh`（AGENTS.md §2）。  
**父代理**：只编排；docs 直合 / src 董事会；CAM/六腿/安卓永不代决。

---

## 8. 本档效力

- `/loop 10m` **已停**；交接以本文件 + main@`9e7c560` 为准。
- 重启 loop 须指挥官明示 + 新快照写入 timer prompt + 确认用量可用。

*交接撰写：云端总指挥停机拍 · 2026-08-28 23:00 UTC。*
