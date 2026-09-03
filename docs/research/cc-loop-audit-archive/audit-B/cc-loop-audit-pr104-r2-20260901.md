# ⚖️ 提分 Loop 独立审计裁决书

> 审计对象：`rayw-lab/website` PR #104（CC-VIS-X2-FACADE-R2）  
> 审计模式：独立第三方、只读、零 GitHub 写操作  
> 审计收口：`2026-09-01T15:50:27Z`（`2026-09-01 23:50:27 CST`）  
> Proof Class：`REMOTE_EVIDENCE_AUDIT + EXACT_ARTIFACT_RECOMPUTE`  
> 状态：**DONE（审计裁决完成；工程门未通过）**

## 1. Conclusion

**PR #104 最终裁决：`NO_GO / HOLD_DRAFT`。**

这不是“只差一个 CI”或“再跑一次可能就绿”的状态，而是已经出现两轮正式红证：

- R1：`76 passed / 2 failed / 8 did not run / 0 flaky / 0 retry`，`RUN_EXIT=1`；
- R2：`72 passed / 1 failed / 13 did not run / 0 flaky / 0 retry`，`RUN_EXIT=1`；
- R2 唯一失败 `CITY-OBS-01` 发生在干净宿主、单 worker、零 retry 条件下，不能归因于外部并发；
- R2 失败导致 `WS-PERF-01`、`CITY-PERF-01/02` 与 `VIS-01..04` 未执行，性能、3D 冒烟、视觉终审没有闭环；
- PR #104 head 仍停在 `598764172250f3a0d6e5a29c36aa564dbd44e009`，已落后当前 `main@8d6efb0ed9c0a523aed1a9523eee46135cc0b405` 五个提交，尚不是候选 ⊕ current main 的最终合流头；
- 没有 X2 独立视觉双评结果，没有 `availableWeight=1.0 / missing=[]` 的合法五维计分产物。

因此：**禁止 Draft→Ready、禁止合入、禁止登记提分，生产矩阵必须维持 `80 / 73 / 87 / —`。**

## 2. 基线漂移纠正

审计开始时用户给定基线为 `main@939056d`。审计窗口内主干发生合法前进：

| 时点 | main SHA | 事件 |
|---|---|---|
| 审计开始 | `939056d728218b68cc3e914840ab9f5ddcb2d82b` | #211：R1 failure evidence 已合入 |
| 中途锚点 | `ff6d00ea9192094bb34030cc11c9e064c1be53ef` | #212：R2 full-gate `NO_GO` evidence 已合入 |
| 审计收口 | `8d6efb0ed9c0a523aed1a9523eee46135cc0b405` | #213：过期“阶段停止”看板块并发合入 |

故最终裁决以 `main@8d6efb0ed9c0a523aed1a9523eee46135cc0b405` 为新单源，而不是沿用 `939056d` 或中途锚点 `ff6d00ea9192094bb34030cc11c9e064c1be53ef`。

## 3. 五维与资格硬门核验

| 硬门 | 事实 | 判定 |
|---|---|---|
| 候选同步 current main | PR head `598764172250f3a0d6e5a29c36aa564dbd44e009` 与 `main@8d6efb0ed9c0a523aed1a9523eee46135cc0b405` 已 diverged；PR 落后主干 5 个提交 | **FAIL** |
| E2E fresh denominator | R2 fresh `--list` = 86 tests / 19 files | **PASS（分母）** |
| E2E 结果 | 72 passed / 1 failed / 13 did not run / 0 flaky / retries=0，`RUN_EXIT=1` | **FAIL** |
| 独占环境 | R2 1111 次、5 秒采样，外部 automation unique match = 0；4587 pre/post bind 成功 | **PASS** |
| exact-head 普通 CI | Run `33514114971` 对 `598764172250f3a0d6e5a29c36aa564dbd44e009` SUCCESS；仅覆盖 check/build/links/budget/lighthouse | **PASS，但不替代 E2E** |
| LHCI | Artifact `9803026775`，7 个桌面 URL × 3 轮；四项中位数全部 100 | **PASS** |
| Diff / 临时产物 | #104 16 个文件，无 `.pr-body.md`、trace 临时文件或 tracked `__screenshots__` 混入 | **PASS** |
| tracked 截图恢复 | R2 23/23 tracked PNG 已 explicit restore，index blob 23/23 匹配，工作树 clean | **PASS** |
| 视觉终审 | `VIS-01..04` 未执行；X2 无固定机位独立双评与 `|Δ|≤5` 证据 | **FAIL** |
| 3D smoke | 所有 `@smoke3d` 在 R2 中未执行 | **FAIL / MISSING** |
| 权重有效性 | 按脚本镜像：`availableWeight=0.85`、缺 `3D smoke`；且视觉 73 是旧登记分，不是 X2 新评 | **FAIL** |
| 综合分发布资格 | 镜像诊断分约 91.74，但资格红、权重不满、视觉输入陈旧 | **INVALID FOR RELEASE** |
| 看板收账 | #213 已把过期“阶段停止/无 R3”块合入 current main；#214 正尝试纠偏，final-head CI 已成功，但另建“权威 handoff”造成单源分裂 | **FAIL / CORRECTION REQUIRED** |

## 4. 关键缺陷：高分并不等于过门

仓库 `score-loop.mjs` 的 E2E 算法只把 `passed + failed` 作为通过率分母，未执行项不进入 E2E 分母；缺维再按可用权重归一化。因此，把 R2 JSON、LHCI 工件与旧视觉 73 机械送入脚本，会得到：

```json
{
  "lhciRoot": 100,
  "lhciHome": 100,
  "e2ePassRate": 98.6301369863,
  "visual": 73,
  "smoke3d": null,
  "availableWeight": 0.85,
  "missing": ["3D 交互冒烟（首幕+POI+ESC）"],
  "diagnosticComposite": 91.7365028203
}
```

该 `91.74` 只能是**失败趟的内部诊断分**，不能上链为发布分，原因有三层：

1. 原始 E2E `EXIT=1`，硬门已失败；
2. 13 项未执行，包含全部 PERF 与 VIS；
3. 视觉 73 是旧主干登记，不是 X2 独立复评。

把它称为“综合分已达标”会构成典型的归一化掩盖失败。

## 5. R2 失败的根因边界

### 5.1 已证明

- `CITY-OBS-01` 第一腿 `(20,-8)` 成功，第二腿 `(28,-28)` 失败；终态接近出生点 `(1.3,-2.1)`；
- `driveTo` 在 12 秒无进展后先执行两次倒车脱困，再按 `R` 重生；重生后继续追当前目标，不会重放已丢失的前置 waypoint；
- 因而第二腿触发重生后，车辆会从原点直追 `(28,-28)`，重新进入东北道具簇、桥腿与既有碰撞体邻域；
- 当前 `audit-x2-visibility.mjs` 只计算选定障碍到理想线段的静态净距，没有覆盖全部 fixed collider、车辆转弯包络与真实动态轨迹，不能单独证明路线可达；
- R2 宿主连续监控干净，外部资源抢占不是本轮失败解释。

### 5.2 尚未证明

不能直接下结论说“X2 产品几何必然有 bug”，也不能直接下结论说“只是测试写坏了”。当前可信分类是：

> **路径规划、测试控制器恢复逻辑、终点触发圈与静态碰撞体之间存在确定性交互缺陷；产品 collider 缺陷、测试控制器缺陷或混合原因，需要真实轨迹与 AABB 枚举定谳。**

### 5.3 反方观点检验

- **“R1 两个 loading timeout 在 R2 过了，说明已修复。”** 不成立。R1 用 Node 25.9.0，R2 用 Node 22.23.0，业务字节并未修复，运行时版本是未消除的混杂变量。
- **“LHCI 100 分，说明可以合。”** 不成立。LHCI 证明静态页面分类分优秀，不证明 3D 驾驶、性能、视觉与烟测通过。
- **“静态净距都 PASS，路线应当可达。”** 不成立。静态中心线净距没有包含转向半径、车辆外接包络、碰撞响应与 `R` 恢复分支。
- **“再跑一次可能全绿。”** 不允许。当前失败签名可解释且正式红证有效，原样重跑会变成 retry 刷绿。

## 6. 看板账本与并发合流裁决

### 6.1 PR #213：已误合，`POST_MERGE_CORRECTION_REQUIRED`

#213 的文件域和 append-only 形式本身合规：只改看板一个文件、`+10/-0`、顶部纯追加、CI 成功。但它在 15:39:36Z 被合入 `8d6efb0ed9c0a523aed1a9523eee46135cc0b405` 时，正文已经落后于 15:36:50Z/15:36:53Z 的更新 Controller 指令，仍写着“没有第三跑、阶段停止、只有指挥官另行重启”。当前 main 因此存在**事实账正确、运行态过期**的顶部控制块。

更严重的是：#213 的标题在最终读取时已经标记 `[CHANGES REQUIRED]`，但仓库主干无 branch protection / required checks，仍完成了 merge。这证明 docs-only + CI green 不能替代内容审批。

结论：历史字节不应回改，但必须在看板顶部追加更晚的纠偏块，明确：

> `SEC-R11 CLOSED` 仅表示 R1/R2 证据收账完成；#104 仍 `NO_GO / HOLD_DRAFT`；当前合法下一步是 OBS/PERF 定向归因与最小补洞；R3 full 尚未授权，满足定向门后才可新具名授权。

### 6.2 PR #214：方向正确，但当前仍 `HOLD`

#214 现状：open、1 commit、1 个新增文档、`+202/-0`，head `847b9287241f3e43ef82e44a5880ee8f7c8b63e8`；final-head CI run `33527483465` 已 `SUCCESS`；但 CI 只证明构建门，不解决单源与授权边界问题。

其纠正内容大体正确，但设计上有两个新问题：

1. **单源分裂**：Master Prompt 指定 `docs/research/cyber-city-score-loop-orchestration.md` 为权威单源；#214 却另建 `cc-loop-handoff-*` 并自称“当前交接正本/authority”。这会产生“看板 vs handoff”双权威。
2. **越权新增治理门**：#214 新增 `APPROVED_FOR_SQUASH` 评论作为未来 docs-only 合流硬门。该机制可以作为治理建议，但未经指挥官明确批准，不应直接写成权威规则。

因此 #214 即使 CI 已绿也不能直接合。更稳妥的修法是：

- 把核心纠偏压缩为看板顶部 append-only 新块；
- 如保留 handoff 文件，将其降级为“证据/交接附件”，不得宣称高于看板；
- 不回改 #213 历史字节；
- 用新的 MERGE-WAVE 续表登记 #213；
- 将新增审批机制标为建议，等待指挥官确认。

## 7. 缺陷与阻断项

### P0

1. R2 exact head 正式全量门失败：`72P / 1F / 13未运行 / EXIT=1`。
2. `CITY-OBS-01` 暴露路线与恢复逻辑的确定性交互问题，尚无动态轨迹闭环。
3. PERF 与 VIS 因 fail-stop 未执行，不能据此发布性能、视觉或综合分。
4. PR #104 未吸收 `main@8d6efb0ed9c0a523aed1a9523eee46135cc0b405`，且已落后 5 个提交，不存在可合流 final head。
5. X2 独立视觉双评与满权重计分均缺失。
6. #213 已将被更晚 Controller 指令推翻的“无 R3/阶段停止”正文合入 main，权威看板当前自相矛盾。
7. #214 CI 已绿，但另建“权威 handoff”造成单源分裂，并新增未经确认的治理硬门，不能直接合入。

### P1

1. PR #104 body 仍保留“待 X1b 后 rebase”等旧 WIP 文字，已与实际历史不一致。
2. `audit-x2-visibility.mjs` 名称与文档容易被误读为“可达性证明”，实际仅是选定几何净距 advisory。
3. R1 Node 25 与 R2 Node 22 混跑，R1 mount 失败机制仍未被确定解释。
4. R1 evidence 文字声称未生成 trace，但 Playwright JSON 对失败项列出 `trace.zip` attachment，证据措辞需校正。
5. `main` 未启用 branch protection / required checks，门禁依赖人工纪律，存在误合风险。

## 8. 精准补洞与放行顺序

```mermaid
graph TD
    A[同步 current main 8d6efb0 到 #104] --> B[固定 Node 22 + pnpm 10.33.3]
    B --> C[CITY-OBS-01 route probe
逐拍轨迹 + escape/R + collider AABB]
    C --> D{根因分类}
    D -->|控制器恢复缺陷| E[共享 waypoint helper
恢复时重放完整链或移除盲目 R]
    D -->|产品 collider 缺陷| F[最小几何/碰撞体修复
复核视觉基线]
    D -->|混合原因| G[分别做最小修复]
    E --> H[OBS-01 + PERF-02 单 attempt]
    F --> H
    G --> H
    H --> I[Node22 CONTROL/CANDIDATE mount canary]
    I --> J[exact final-head CI + fresh list=86]
    J --> K[唯一一次 CC-VIS-X2-FULL-R3]
    K -->|86P 0F 0S 0Flaky| L[证据 docs-only PR 先合 main]
    K -->|任一失败| M[NO_GO 停止]
    L --> N[同步 main + 视觉双评 Δ≤5]
    N --> O[score-loop: weight=1 missing=[] composite≥85]
    O --> P[Controller 才可 Ready / Merge]
```

执行文件域按最新 Controller 边界收窄：

- 默认可写：`e2e/cyber-city-observability.spec.ts`、`e2e/cyber-city-perf.spec.ts`、`tools/camera/audit-x2-visibility.mjs`、`docs/research/cc-vis-x2-r3-*`；
- 只有轨迹与 collider 证据明确指向产品几何，才扩到 `StreetProps.ts` / `ForegroundFraming.ts`；
- 禁止提高 timeout、retry、skip、软化断言、原标签重跑、先挪视觉资产后补理由。

## 9. Changed Files

### 仓库

**无。** 本次未创建评论、未修改分支、未提交、未 push、未建 PR、未删除审计分支。

### 本地审计交付

- `cc-loop-audit-pr104-r2-20260901.md`
- `cc-pr104-r2-evidence.md`
- `cc-loop-board-sec-r11-delta.md`
- `cc-pr104-evidence-index-20260901.json`
- `source-artifacts/x2-final-head-lighthouse-results.zip`

## 10. Validation

- 读取 current main、PR #104/#211/#212/#213/#214、commit compare、changed files、评论与 workflow/check 状态；
- 读取 R1/R2 原始 receipt、Playwright JSON、host monitor、asset restore 证据；
- 下载 exact-head LHCI artifact，独立解包并复算 21 份 LHR；
- 按仓库 `score-loop.mjs` 源码做镜像诊断复算；
- 未在本地重新运行产品 E2E，故不把本次证明等级夸大为 `FRESH_RUNTIME_REPRODUCTION`。

## 11. Residual Risks

- GitHub 仍在持续变化；本裁决只锚定 `main@8d6efb0ed9c0a523aed1a9523eee46135cc0b405`、#104 `598764172250f3a0d6e5a29c36aa564dbd44e009`、#214 `847b9287241f3e43ef82e44a5880ee8f7c8b63e8` 与上述收口时间；
- 尚无完整 route trace 与 collider AABB 枚举，根因分类仍需 R3-FIX 诊断；
- X2 实际视觉增益尚未经过独立固定机位双评；
- 主干无保护，存在绕过人工门禁的治理风险。
