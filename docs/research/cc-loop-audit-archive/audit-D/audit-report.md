# 独立对抗审计报告 v2 实战

## rayw-lab/website｜R-1/R-2 整改复核 + 审计 A/B NO_GO 复审

| 字段 | 值 |
|---|---|
| 审计角色 | 利益无关第三轮对抗性审计员 |
| 仓库 | `rayw-lab/website` |
| 冻结快照 | `main@4ef7ed4cc9db9bde92180b8498bac7104951dd1d` |
| 审计日期 | 2026-09-02 |
| 模式 | **只读**；未修改仓库、未触发 workflow、未运行 Playwright/Node |
| 总裁决 | **NO_GO / FAIL** |
| P0 | **0** |
| 关键边界 | 登记数值 `94 / 76 / 87 / —` 的算术未被推翻；失败发生在整改闭环与证据治理层 |

---

# 1. Executive Verdict

> **R-1 有实质整改，R-2 只完成了一部分。执行代理关于“两份 NO_GO 的可消项已全部闭环”的总 claim 被反证。**

按仓库自己提交的 v2 放行规则，任一 `REFUTED` 即 `FAIL`。当前至少存在两条独立阻断链：

1. **C7 双评独立性未闭环**：R-2-1 任务书要求两个不同模型族；同模型 fallback 也要求两份完整签名收据。实际 A/B 均为 `gpt-5.6-terra`，A 没有有效 UTC，B 没有 UTC 和工具调用序列，新增帧也没有完整新图像/全 SHA 链。
2. **C1/C9' 规则字面上无法回溯通过**：#220 的 `+2/-1` 原位编辑是已发生事实。R-1 可以建立未来 invariant，但不能把历史删除变成零。当前 v2 没有把“历史例外”与“未来 invariant”做成可执行分层。

因此：

```text
P0 = 0
REFUTED > 0
=> GO_OR_NO_GO = NO_GO
```

这不是对分数的重新否定。独立复算结果：

```text
视觉登记 = 76   ✅
综合登记 = 94   ✅
功能登记 = 87   本审计不代决
性能登记 = —    本审计不代决
```

---

# 2. 能力边界与证明等级

## 2.1 可独立验证

- GitHub PR、commit、compare、branch、Actions run、artifact 元数据；
- 文本字节、JSON 结构、文件清单、追加/删除统计；
- 权重算术、AABB、直线几何、PRNG 的逐行对译；
- 收据之间的 SHA/head/统计一致性。

## 2.2 只能基于收据

- R3 86 个 Playwright 用例是否真的在声明环境执行；
- LHCI artifact 内 21 份 LHR 的逐项原始分数；
- 六张视觉帧的真实视觉内容与会话内工具调用真实性。

这些统一标为 `TRUST_BASED(receipt)`，不冒充独立运行。

## 2.3 无法验证

仓库中未检出审计 A/B 两份原报告以及 v1 原任务书。因此，本报告对 A/B 的复审以整改路线图中的逐条引述为对象；原文级 scope 结论标为 `UNVERIFIED`。

---

# 3. C1–C10 检查总表

| 检查 | 裁定 | 结论 |
|---|---|---|
| C1 ledger append-only | **REFUTED（历史）/ PASS（前瞻）** | #220 确有删除；R-1 后新增式治理截至快照未再破坏 |
| C2 根因/几何链 | **PARTIAL PASS** | 重放脚本与源码吻合，H11/H12 分层正确；仍残留 `≤0.05m`、`6°` 和 spec 旧注释 |
| C3 修复增量域 | **PASS with wording defect** | R-1/R-2 本身为 docs/research；ad93 未放宽既有终点门，但“timeout/radius 零触”为假 |
| C4 全量窗 stats | **INDEPENDENTLY_VERIFIED structure + TRUST_BASED runtime** | JSON 结构为 expected=86、unexpected=0、86 个 retry=0；未重跑 |
| C5 summary schema | **PASS** | R2 `totalTests:19` 已追加式勘误为 86 tests / 19 files，原 blob 未改 |
| C6 LHCI/CI | **PASS metadata / TRUST_BASED payload** | run success、artifact 存在且 head 对齐；未解包 LHR |
| C7 双评独立性 | **REFUTED** | 同模型；收据字段不完整；新帧全量不可变链缺失 |
| C8 综合分复算 | **PASS** | 视觉76、综合94均复算一致 |
| C9' append-only 机检 | **REFUTED（同C1）** | 当前规则没有历史例外，字面执行必命中 #220 |
| C10 分 scope 演化 | **PARTIAL / 原审scope UNVERIFIED** | 历史放宽真实；ad93 未改既有门，但新增了 radius/timeout 参数；A/B原文scope不可取 |

---

# 4. Claim → Proof Matrix

| ID | Claim | 裁定 | Evidence | 审计结论 |
|---|---|---|---|---|
| CL-01 | 审计冻结于 main@4ef7ed4cc9db | **INDEPENDENTLY_VERIFIED** | E01 | 成立；终检未漂移。 |
| CL-02 | #220 对已合并 ledger 原位 +2/-1 | **INDEPENDENTLY_VERIFIED** | E02 | 成立。 |
| CL-03 | R-1 已建立未来 append-only 追加式治理 | **INDEPENDENTLY_VERIFIED** | E09/E36 | 截至快照，前瞻控制成立。 |
| CL-04 | 按 v2 C1/C9' 可认定历史 append-only 全通过 | **REFUTED** | E02/E11 | #220 是历史反例；只能做 prospective PASS。 |
| CL-05 | 重放脚本逐行对应 R2 源码 | **INDEPENDENTLY_VERIFIED** | E12/E13/E14 | FNV、PRNG、调用序、半尺寸与 AABB 公式一致。 |
| CL-06 | NE rotY = -131.66/-141.70/-139.71 | **INDEPENDENTLY_VERIFIED** | E12–E15 | 独立 32-bit 算术复算吻合。 |
| CL-07 | 修正 AABB 相对旧表位移≤0.05m | **REFUTED** | E15/E36 | 最大端点差为0.06m；影响半径为零。 |
| CL-08 | 人工 rotY 推导误差最大约6° | **REFUTED** | E15/E37 | Cabinet 最大差约10.80°；影响半径为零。 |
| CL-09 | 静态直瞄中心线穿 H11、不穿 H12 | **INDEPENDENTLY_VERIFIED** | E15/E16 | 独立直线方程复算成立。 |
| CL-10 | 诊断文档已区分静态 H11 与动力学 H12/S2 | **INDEPENDENTLY_VERIFIED** | E16 | 顶部追加式勘误成立。 |
| CL-11 | H12 错误措辞已在全仓完全消项 | **REFUTED** | E17/E18 | 两个可执行 spec 注释仍保留旧表述。 |
| CL-12 | ad93ed1 未放宽既有 setTimeout/终点 radius/timeout | **INDEPENDENTLY_VERIFIED** | E21 | 仅新增绕行腿；原终点 r4.5/360s 保留。 |
| CL-13 | ad93ed1 对 timeout/radius 零触 | **REFUTED** | E21 | 新增 leg2a 明确写 radius=2.5、timeoutMs=240000。 |
| CL-14 | c912b49/97223b8 历史上确有预算放宽 | **INDEPENDENTLY_VERIFIED** | E19/E20 | 成立，且发生于 R1/R2 窗前。 |
| CL-15 | 审计 A/B 的 C10 一定属于范围错置 | **UNVERIFIED** | E38/E39 | 引述支持，但原报告/任务书不可取。 |
| CL-16 | R3 JSON 结构为86例、每例单结果、retry0 | **INDEPENDENTLY_VERIFIED** | E22–E24 | 文本结构与 stats 自洽。 |
| CL-17 | R3 86例实际在环境中执行通过 | **TRUST_BASED(receipt)** | E22/E23 | 未运行 Playwright，只能信收据。 |
| CL-18 | R2 totalTests=19 已追加式纠正且原字节未改 | **INDEPENDENTLY_VERIFIED** | E25–E27 | 成立。 |
| CL-19 | CI success 与 artifact head 对齐 | **INDEPENDENTLY_VERIFIED** | E28/E29 | GitHub API 元数据成立。 |
| CL-20 | LHCI 21份报告逐项均100 | **TRUST_BASED(receipt)** | E29/E30 | artifact 存在，但未解包复算。 |
| CL-21 | R-2-1 已完成两个不同模型族重评 | **REFUTED** | E10/E31/E32 | 两份均为 gpt-5.6-terra。 |
| CL-22 | 同模型 fallback 的两份签名收据均完整 | **REFUTED** | E11/E31/E32 | A 无有效 UTC；B 无 UTC、无工具序列。 |
| CL-23 | 两份 rationale 存在明显逐字抄袭 | **INDEPENDENTLY_VERIFIED** | E31/E32 | 文本重叠低，但不能证明独立会话。 |
| CL-24 | R2 评审B加权总分83 | **REFUTED** | E32/E33 | 独立复算82.00；最终76不变。 |
| CL-25 | 登记视觉76算术成立 | **INDEPENDENTLY_VERIFIED** | E33 | 原双评74/78均值76；维度加权76.30→76。 |
| CL-26 | 综合94算术成立 | **INDEPENDENTLY_VERIFIED** | E34 | 25+15+20+19+15=94。 |
| CL-27 | R2 重取6帧具有完整新图像+全SHA链 | **UNVERIFIED** | E31/E32/E35 | 新 E3/E4/B2 仅16位回显。 |
| CL-28 | #222 R-1 实际为3文件+13/-0 | **REFUTED** | E04/E09 | main-to-main 实际4文件+65/-0。 |
| CL-29 | #223 未提交 v2，故#224补交 v2 | **REFUTED** | E05–E08 | #223已含v2；#224仅追加范式4行。 |
| CL-30 | #224 最终状态仍补齐了 v2+范式 | **INDEPENDENTLY_VERIFIED** | E06/E08/E11/E37 | 最终 main 两者均存在。 |
| CL-31 | 可对审计A/B原文逐句终审 | **UNVERIFIED** | E38/E39 | 只能复审路线图引述。 |
| CL-32 | main 有平台强制保护整改证据 | **REFUTED** | E01 | main未保护、required checks off。 |
| CL-33 | 94/76/87/— 因上述瑕疵而算术作废 | **REFUTED** | E25/E33/E34 | 视觉76与综合94仍成立。 |
| CL-34 | R-1/R-2 两轮NO_GO可消项已全部闭环 | **REFUTED** | E02/E10/E11/E31/E32 | C7未达验收，C1只能前瞻修复。 |

---

# 5. 独立算术复算

## 5.1 原登记双评

权重：

```text
V1 .20 / V2 .20 / V3 .15 / V4 .15 / V5 .15 / V6 .10 / V7 .05
```

评审 A：

```text
78×.20 + 72×.20 + 80×.15 + 75×.15 + 66×.15 + 76×.10 + 72×.05
= 74.35
→ 74
```

评审 B：

```text
80×.20 + 80×.20 + 80×.15 + 75×.15 + 75×.15 + 75×.10 + 80×.05
= 78.00
→ 78
```

双评均值：

```text
round((74 + 78) / 2) = 76
```

登记维度合议：

```text
79×.20 + 76×.20 + 80×.15 + 75×.15 + 71×.15 + 76×.10 + 76×.05
= 76.30
→ 76
```

**影响半径**：无。视觉 76 成立。

## 5.2 R-2 重评

A：

```text
80×.20 + 80×.20 + 75×.15 + 70×.15 + 70×.15 + 70×.10 + 70×.05
= 74.75
→ 75
```

B：

```text
85×.20 + 80×.20 + 80×.15 + 85×.15 + 80×.15 + 80×.10 + 85×.05
= 82.00
→ 82
```

所以 `total_self_reported=83` 错，正确为 **82**。

```text
|75 - 82| = 7 > 5
```

仍触发逐维仲裁。仲裁：

```text
80×.20 + 80×.20 + 75×.15 + 75×.15 + 70×.15 + 75×.10 + 75×.05
= 76.25
→ 76
```

**影响半径**：B 从83纠正到82后，门仍失败、仍仲裁、最终仍76，综合仍94。因此此错误为 P2，不是 P0。

## 5.3 综合分

```text
/ LHCI       100 × .25 = 25
/home/ LHCI  100 × .15 = 15
E2E          100 × .20 = 20
视觉          76 × .25 = 19
smoke3d      100 × .15 = 15
--------------------------------
综合                         = 94
```

`availableWeight=1`、`missing=[]` 与登记一致。

---

# 6. 几何与影响半径复算

## 6.1 rotY

正确 NE 簇：

```text
Vending  = -131.66°
Cabinet  = -141.70°
Bin      = -139.71°
```

旧值与新值差：

```text
5.44° / 10.80° / 5.89°
最大 = 10.80°
```

因此“误差最大约6°”不准确。

## 6.2 AABB

| 对象 | 旧表 | 修正表 | 最大端点差 |
|---|---|---|---:|
| S1 | `[17.00,18.60]×[-18.59,-17.01]` | `[17.01,18.59]×[-18.60,-17.00]` | 0.01m |
| S2 | `[15.63,17.28]×[-17.32,-15.59]` | `[15.58,17.33]×[-17.27,-15.65]` | 0.06m |
| S3 | `[18.15,20.00]×[-19.88,-18.26]` | `[18.17,19.98]×[-19.93,-18.22]` | 0.05m |

全局最大端点差为 **0.06m**，不是 ≤0.05m。

nose `(15.77,-15.78)`：

```text
inside corrected S2 = true
nearest boundary margin ≈ 0.133m
```

**影响半径**：S2 楔死归因不变，H1–H4 判断不变，不改变 NO_GO/GO 或 94/76。

## 6.3 H11/H12 直线

从 `(20,-8)` 到 `(28,-28)`：

```text
x(z) = 16.8 - 0.4z
```

H12 z 带 `[-15.94,-15.06]` 上：

```text
x ∈ [22.824, 23.176]
```

不进入 H12 x 带 `[25.02,26.98]`。

H11 z 带 `[-16.19,-14.81]` 上：

```text
x ∈ [22.724, 23.276]
```

进入 H11 x 带 `[21.55,23.45]`。

因此审计 B 关于“静态中心线不是穿 H12，而是穿 H11”的算术内核成立；但这不排除控制器右偏后的 nose 运行时嵌入 H12/S2。

---

# 7. 对前两轮 NO_GO 的复审

## 7.1 审计 A

### 成立部分

- #220 的原位 `+2/-1` 是事实；
- 在当时尚未追加 R-1 声明前，把它定为 append-only 工艺违规是合理的；
- 若 A 的 NO_GO 有该项作为独立充分条件，则 **A 的当时 NO_GO 仍可成立**。

### 需要收窄部分

- “收据链/登记分因此崩塌”不成立：#220 修改的是措辞，94/76 算术未变化；
- C10 若把 c912/972 的 PR 历史演化直接当成 ad93 本 Loop 的新增放宽，则 scope 混测；
- 由于 A 原报告不可取，C10 精确措辞只能标 `UNVERIFIED`。

## 7.2 审计 B

### 成立部分

- 原 rotY 人工复刻算错；
- 静态直瞄中心线穿 H11、不穿 H12；
- 执行代理原叙述混淆了静态几何与动力学轨迹。

### 不成立部分

- 把 rotY 算错升级为“根因结论崩塌/P0”不成立；
- 正确 AABB 下 nose 仍在 S2，最小余量约 0.133m；
- 按 v2 的影响半径规则，此项应降为 **P2**。

若 B 的 NO_GO 仅依赖“rotY 导致结论崩塌”与 scope 混用的 C10，则该 NO_GO **不能被当前证据维持**。但因 B 原报告不可取，最终表述为：

> **按整改路线图对 B 的引述复审，B 的结论性 P0 不成立；B 原报告整体 NO_GO 为条件性撤销，而非原文级终局撤销。**

---

# 8. Findings

### F-P1-001 · P1

**Claim**：R-2-1 视觉独立性整改已闭环

**Finding**：任务书要求异模型；fallback 也要求完整签名收据。实际 A/B 同为 gpt-5.6-terra；A 无有效 UTC，B 无 UTC 和工具序列，新帧仅短哈希回显。

**影响半径 / Counterfactual**：若提供两个不同模型族，或同模型但两个完整不可变收据加新六帧全 SHA/图像，则 C7 可转 PASS；当前直接阻断 GO。

**Evidence**：https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-a.json | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-b.json

### F-P1-002 · P1

**Claim**：R-1 后 v2 C1/C9' append-only 自检已通过

**Finding**：#220 对已合并 SEC-R13 原位 +2/-1 是历史事实；后加声明不能令“所有后续 commit 删除=0”的字面检查回溯通过。

**影响半径 / Counterfactual**：将规则拆为 historical exception 与 prospective invariant，并让机检显式白名单 #220，才可能客观 PASS；不影响 94/76。

**Evidence**：https://api.github.com/repos/rayw-lab/website/pulls/220 | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md

### F-P1-003 · P1

**Claim**：两轮 NO_GO 所有可消项已闭环

**Finding**：至少 C7 与字面 C1/C9' 仍 REFUTED；按 v2“任一 REFUTED 即 FAIL”，总体闭环声明不成立。

**影响半径 / Counterfactual**：完成 C7 真收据，并把 C1 规则改成可执行的历史/未来分层后，可重新评估 GO。

**Evidence**：https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-loop-audit-prompt-v2.md

### F-P2-001 · P2

**Claim**：修正 AABB 相对旧表位移≤0.05m

**Finding**：独立复算最大端点差=0.06m（S2 z 下界），不是 0.05m。

**影响半径 / Counterfactual**：nose 仍在 S2，最小内边距约 0.133m；根因、视觉76、综合94均不变，影响半径为零。

**Evidence**：https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-vis-x2-collider-aabb-20260902.md | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-score-loop-orchestration.md

### F-P2-002 · P2

**Claim**：rotY 人工推导误差最大约6°

**Finding**：三项差分别为 5.44°/10.80°/5.89°，最大=10.80°。

**影响半径 / Counterfactual**：AABB 变动仍≤0.06m，nose 仍在 S2；结论不变，不构成 P0。

**Evidence**：https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cyber-city-orchestration-paradigm.md | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/tools/streetprops-roty-replay.mjs

### F-P2-003 · P2

**Claim**：H12 旧措辞已完全修正

**Finding**：诊断文档已勘误，但 OBS/PERF 两个可执行 spec 注释仍写“bearing 正穿 H12/S2”。

**影响半径 / Counterfactual**：修正注释即可消项；不改变测试逻辑和分数。

**Evidence**：https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/e2e/cyber-city-observability.spec.ts | https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/e2e/cyber-city-perf.spec.ts

### F-P2-004 · P2

**Claim**：ad93ed1 timeout/radius 零触

**Finding**：没有放宽既有终点门，但新增 leg2a 明确包含 radius=2.5 与 timeoutMs=240000，绝对化“零触”不成立。

**影响半径 / Counterfactual**：改为“未放宽既有门，只新增绕行腿参数”即可；不改变 R3 通过或 94/76。

**Evidence**：https://api.github.com/repos/rayw-lab/website/commits/ad93ed1

### F-P2-005 · P2

**Claim**：R2 评审 B 总分83

**Finding**：85×.20+80×.20+80×.15+85×.15+80×.15+80×.10+85×.05=82.00，应为82。

**影响半径 / Counterfactual**：A75/B82 仍 |Δ|=7>5，仍触发仲裁；仲裁76、综合94不变。

**Evidence**：https://raw.githubusercontent.com/rayw-lab/website/4ef7ed4cc9db9bde92180b8498bac7104951dd1d/docs/research/cc-alvis-r3-eval/r2-eval-b.json

### F-P2-006 · P2

**Claim**：#222 R-1 为3文件+13/-0

**Finding**：按合并前后 main 比较，实际4文件+65/-0；PR叙述统计失真。

**影响半径 / Counterfactual**：改正文统计即可；R-1 实质勘误/脚本仍存在，不改变总裁决。

**Evidence**：https://api.github.com/repos/rayw-lab/website/pulls/222 | https://api.github.com/repos/rayw-lab/website/compare/3cf1552c4468a10dab16e4e9118e1fc1f56a24d4...23b7032af8a8914c5860c2804d0de1f4ae98d621

### F-P2-007 · P2

**Claim**：#223 未提交 v2，#224 补交 v2 且两文件

**Finding**：#223 文件 API 已含 v2；#224 实际仅1文件+4/-0，补的是范式坑13–16。

**影响半径 / Counterfactual**：最终 main 确实同时拥有 v2 和范式，故最终功能状态不变；仅叙事可信度受损。

**Evidence**：https://api.github.com/repos/rayw-lab/website/pulls/223/files?per_page=100 | https://api.github.com/repos/rayw-lab/website/pulls/224/files?per_page=100

### F-P2-008 · P2

**Claim**：main 已具备外部审计所需强制治理

**Finding**：main protected=false，required status checks=off。

**影响半径 / Counterfactual**：这是路线图 R-3-4 未完成项；不使现有 94/76 算术失效，但降低后续账本可信度。

**Evidence**：https://api.github.com/repos/rayw-lab/website/branches/main

### F-U-001 · UNVERIFIED

**Claim**：可确认审计 A/B 每条原裁决的精确 scope 与措辞

**Finding**：仓库未检出两份原报告与 v1 任务书；仅能审路线图引述。

**影响半径 / Counterfactual**：提供原报告不可变 URL 后，可把 A/B 复审从条件性结论升级为终局结论。

**Evidence**：https://api.github.com/repos/rayw-lab/website/search/code?q=cc-score-loop-board-delta-pr-104-r2.md


---

# 9. 最小反证链

```text
R-2-1 验收：
  两个不同模型族
  OR 同模型降级 + 两份完整签名收据 + 新帧完整哈希链
          │
          ▼
实际：
  A = gpt-5.6-terra；timestampUtc=UNAVAILABLE
  B = gpt-5.6-terra；无UTC；无toolSequence
  新 E3/E4/B2 仅短hash回显，无图片/新全SHA清单
          │
          ▼
C7 = REFUTED
          │
          ▼
v2 放行规则：任一 REFUTED → FAIL
          │
          ▼
总体 = NO_GO
```

---

# 10. 证明计数与自评

## 10.1 Claim 分类计数

```json
{
  "INDEPENDENTLY_VERIFIED": 16,
  "REFUTED": 13,
  "UNVERIFIED": 3,
  "TRUST_BASED(receipt)": 2
}
```

其中 `REFUTED` 结论均建立在已抓取字节或独立算术上；不把 `TRUST_BASED(receipt)` 冒充实跑。

## 10.2 被误导次数自评

- **已形成错误结论后才纠正：0 次**
- **识别并拒绝的叙事陷阱：4 类**
  1. #222 “3文件+13”；
  2. #224 “#223漏交v2、此次2文件”；
  3. “S2位移≤0.05m / rotY差6°”；
  4. “异模型/完整签名双评已闭环”。

---

# 11. Final Decision

```text
GO_OR_NO_GO = NO_GO
P0 = 0
P1 = 3
登记视觉76 = VALID
登记综合94 = VALID
R-1 = SUBSTANTIVE_BUT_NOT_RETROACTIVE
R-2 = PARTIAL
前两轮NO_GO可消项全部闭环 = REFUTED
```

## 最小下一动作

仅需新建一个不改产品代码的整改 PR：

1. 真正完成 C7：异模型两评；若仍同模型，必须各自具备有效 UTC、完整模型 slug、完整帧 SHA256、工具调用序列、会话/运行标识，并提交新六帧或可取的不可变对象；
2. 将 C1 改成 `historical exceptions` 与 `prospective invariant` 两栏，机检显式输出 #220 例外，不再宣称历史从未删除；
3. 修正看板的 `≤0.05m` 为 `≤0.06m`、范式的 `6°` 为 `10.80°`，同步两个 spec 注释；
4. 把“零 timeout/radius 触碰”改成“未放宽既有门；新增绕行腿 r2.5/240s”。

完成后只需重审 C1/C7/C10；不需要重算94/76。
