# CC-PR104-R2 独立运行与环境证据档

> Repo：`rayw-lab/website`  
> Candidate：PR #104 @ `598764172250f3a0d6e5a29c36aa564dbd44e009`  
> Current main：`8d6efb0ed9c0a523aed1a9523eee46135cc0b405`  
> Audit timestamp：`2026-09-01T15:50:27Z`  
> 本档只汇总已读取字节与独立复算，不替代原始 GitHub evidence。

## 1. 凭据索引

| 类别 | 标识 | 关键事实 |
|---|---|---|
| R1 candidate | `834f1e7e84d1b0e2cd48372f0d556a1c0d5e8ccb` | 76P / 2F / 8未运行 / flaky0 / retry0 / EXIT1 |
| R1 evidence PR | #211 | merge SHA `939056d728218b68cc3e914840ab9f5ddcb2d82b` |
| R2 candidate / PR #104 head | `598764172250f3a0d6e5a29c36aa564dbd44e009` | 72P / 1F / 13未运行 / flaky0 / retry0 / EXIT1 |
| R2 evidence PR | #212 | merge SHA `ff6d00ea9192094bb34030cc11c9e064c1be53ef` |
| final-head CI | run `33514114971` | SUCCESS；check/build/links/budget/lighthouse |
| final-head LHCI artifact | ID `9803026775` | 6,920,608 bytes；SHA-256 `841204db88afe09f095b85ed5a3328402af7b1cd7e16999304ec7483a1ca722f` |
| R2 formal port | 4587 | pre/post socket bind success |
| R2 monitor | 1111 samples | unique external automation = 0 |
| PR #213 | head `792b78a61ac583cd2659add5f6f42b88cf343c55` / merge `8d6efb0ed9c0a523aed1a9523eee46135cc0b405` | 已于 15:39:36Z 合入；append-only 形式 PASS，运行态语义过期 |
| PR #214 | head `847b9287241f3e43ef82e44a5880ee8f7c8b63e8` | open；新增 handoff 1 文件 +202；CI `33527483465` SUCCESS；仍因单源设计冲突审计 HOLD |

## 2. R1 正式窗

- Exact candidate：`834f1e7e84d1b0e2cd48372f0d556a1c0d5e8ccb`；
- Node：25.9.0；Playwright：1.62.1；
- Workers：1；retries：0；
- 结果：76 passed / 2 failed / 8 did not run / flaky0；
- 失败：
  1. `CITY-VEH-01/02/03/04/06`：host 未在 210s 内进入 `ready`；
  2. `WS-E2E-02`：host 未在 150s 内进入 `ready`；
- host monitor：953 samples，external=0；
- `RUN_EXIT=1`。

证据边界：失败用例 JSON 列出 `trace.zip` attachment，故“未生成 trace”类文字不能按字面采信；应区分“Playwright 自动生成失败 trace”与“是否上链 trace 二进制”。

## 3. R2 正式窗

- Exact candidate：`598764172250f3a0d6e5a29c36aa564dbd44e009`；
- Node：22.23.0；pnpm：10.33.3；Playwright：1.62.1；
- Worktree：`/private/tmp/x2-104-full-r2`；
- Formal UTC：2026-09-01T13:40:31Z–15:14:56Z；
- Workers：1；retries：0；CI unset；
- Fresh list：86 tests / 19 files；
- 结果：72 passed / 1 failed / 13 did not run / flaky0；
- 失败：`CITY-OBS-01`，leg1 `(20,-8)` PASS，leg2 `(28,-28)` FAIL，终态 `(1.3,-2.1)`；
- R1 两失败面在 R2 中通过：CITY-VEH 约 3.2m、WS-E2E-02 约 22.4s；
- 1111 samples / 5s interval / unique external=0；
- `RUN_EXIT=1`、`FORMAL_SCRIPT_EXIT=1`。

### 3.1 未执行项

R2 fail-stop 后共 13 项未运行：

- `CITY-OBS-01b`、`CITY-OBS-02..06`；
- `WS-PERF-01`；
- `CITY-PERF-01`、`CITY-PERF-02`；
- `VIS-01`、`VIS-02`、`VIS-03`、`VIS-04`。

因此：R2 不能证明 perf、visual、smoke3d。

### 3.2 资产恢复

- 23 个 tracked PNG 被 Playwright 覆写；
- 全部通过 explicit `git restore -- <paths>` 恢复；
- index blob match 23/23；
- postflight working tree clean；
- postflight port 4587 bind success。

## 4. LHCI 独立复算

下载来源：Actions run `33514114971` artifact `9803026775`。

- ZIP SHA-256：`841204db88afe09f095b85ed5a3328402af7b1cd7e16999304ec7483a1ca722f`；
- 21 份 LHR JSON；
- 7 个 URL，每个 3 轮；
- `assertion-results.json = []`。

| URL path | Runs | Performance median | Accessibility median | Best Practices median | SEO median |
|---|---:|---:|---:|---:|---:|
| `/website/` | 3 | 100 | 100 | 100 | 100 |
| `/website/home/` | 3 | 100 | 100 | 100 | 100 |
| `/website/work/` | 3 | 100 | 100 | 100 | 100 |
| `/website/work/multilingual-cockpit/` | 3 | 100 | 100 | 100 | 100 |
| `/website/about/` | 3 | 100 | 100 | 100 | 100 |
| `/website/lab/car-configurator/` | 3 | 100 | 100 | 100 | 100 |
| `/website/lab/tts-cockpit/` | 3 | 100 | 100 | 100 | 100 |

判定：**LHCI PASS**。

## 5. score-loop 镜像复算

仓库权重：

- root LHCI 25%；
- home LHCI 15%；
- E2E 20%；
- visual 25%；
- smoke3d 15%。

镜像输入：

- root=100；home=100；
- E2E=`72/(72+1)×100=98.6301369863`；
- visual=73（旧登记，仅用于展示脚本行为，不代表 X2 合法视觉分）；
- smoke3d=null（VIS 未执行）。

镜像输出：

```json
{
  "composite": 91.7365028203,
  "availableWeight": 0.85,
  "missing": ["3D 交互冒烟（首幕+POI+ESC）"]
}
```

审计解释：脚本计算完成不等于发布资格；该结果因 E2E EXIT1、13 项未运行、旧视觉输入而无效。

## 6. Diff 纯洁度

PR #104 相对 merge-base 的 16 个文件：

```text
docs/research/cc-vis-x2-e2e-triage-r1.md
docs/research/cc-vis-x2-plug-report.md
docs/spec/asset-ledger-cyber-city.md
e2e/cyber-city-explore.spec.ts
e2e/cyber-city-observability.spec.ts
e2e/cyber-city-perf.spec.ts
playwright.config.ts
public/models/facade-kit/FacadeKit.glb
public/models/facade-kit/README.md
src/lab/world/city/CityBlocks.ts
src/lab/world/city/FacadeKit.ts
src/lab/world/city/ForegroundFraming.ts
src/lab/world/city/StreetProps.ts
src/lab/world/city/index.ts
tools/blender/generate-facade-kit.py
tools/camera/audit-x2-visibility.mjs
```

未发现 `.pr-body.md`、临时 trace、测试结果目录或 tracked `__screenshots__` 被纳入 PR。

## 7. 证据矛盾与解释

| 现象 | 审计解释 |
|---|---|
| R1 mount timeout、R2 同面通过 | Node 25 vs Node 22 混杂，不能称为代码修复 |
| R2 LHCI 100、E2E 红 | 两者证明对象不同；LHCI 不覆盖 3D 动态资格 |
| 静态净距 PASS、动态路线失败 | 静态理想线未覆盖转向包络与恢复分支 |
| 诊断 composite >85 | availableWeight 不满、输入陈旧且原始 EXIT1，禁止发布 |
| PR #213 append-only | 形式合规，但过期运行态已被合入 main，需顶部纠偏 |
| PR #214 correction | 内容方向基本正确；CI 已完成，但“handoff authority”与看板单源冲突 |

## 8. Evidence JSON

机器可读索引见同包：`cc-pr104-evidence-index-20260901.json`。
