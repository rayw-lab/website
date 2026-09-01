# CC-NAV-C1-F3R2-EVIDENCE · F3 R2 本地跑道全量 e2e 取证（#166 过门）

- **执行**：F3 R2 过门跑道（#178 审计 F3 + 董事会 #182；R1 证据见 `cc-nav-c1-f3-evidence.md`）
- **纪律**：零 `src/` 改动；禁 ready/merge #166；证据数字不美化
- **取证窗**：2026-08-29 14:00–15:33 CST（UTC+8）；主窗墙钟全量约 33.1 min

---

## 1. 跑道环境

| 项 | 实测 |
|---|---|
| 机器 | `Darwin wangleideMacBook-Pro-3.local 25.6.0 arm64`（Apple Silicon） |
| 主仓路径 | `/Users/wanglei/mywebsite` |
| worktree | `/tmp/nav-f3r2-wt`（`git worktree add --detach`，跑后清理） |
| 候选 tip | `b4694cf`（`origin/cursor/cc-nav-c1-minimap-8ca4`） |
| 集成树 tip | `50b89d4`（`Merge remote-tracking branch 'origin/main' into HEAD`；merge **CLEAN**） |
| main 基线 | `ed07c0a`（#186 OBS-03 H2 侧信道，`test(obs): CC-OBS-H2 OBS-03 dispose 取证改持久侧信道`） |
| 依赖 | `pnpm install --frozen-lockfile` ✓ |
| 构建 | `pnpm build` ✓ |
| E2E 端口 | `E2E_PORT=4461`（`playwright.config.ts` L10；webServer `pnpm preview --host 127.0.0.1 --port ${PORT}`） |
| 端口探针 | python3 socket bind `127.0.0.1:4461` → **`PROBE_OK: port 4461 is free`** |
| 全量日志 | `/tmp/nav-f3r2.log` |
| Playwright workers | **2**（`playwright.config.ts` L22 默认；主窗未覆写） |

---

## 2. 分母核验（`--list`）

```text
Total: 84 tests in 18 files
```

命令：`cd /tmp/nav-f3r2-wt && export E2E_PORT=4461 && pnpm exec playwright test --list | tail -2`

---

## 3. 全量执行命令

```bash
cd /tmp/nav-f3r2-wt
export E2E_PORT=4461
set -o pipefail
pnpm exec playwright test 2>&1 | tee /tmp/nav-f3r2.log
EXIT=$?
echo "EXIT=$EXIT" | tee -a /tmp/nav-f3r2.log
```

---

## 4. 汇总（Playwright list reporter 尾行）

```text
  22 failed
  25 did not run
  37 passed (33.1m)
EXIT=1
```

**过门口径（#178 / #182）**：分母 84 − 恒红 PERF `CITY-PERF-01`/`CITY-PERF-02` = **82 例**；要求 0 failed / 0 skipped（PERF 除外）/ 0 flaky。

| 桶 | 数量 | 说明 |
|---|---:|---|
| 全量分母 | 84 | `--list` 实数 |
| 恒红排除（不入 82 账） | 2 | `CITY-PERF-01`、`CITY-PERF-02`（殿后 project 未跑到） |
| **82 例账** | 82 | 见下表 |
| passed（在 82 内） | 37 | |
| failed（在 82 内） | **22** | 1 根因 + 21 preview 连坐 |
| skipped / did not run（在 82 内） | **23** | 串行连坐 16 + 殿后链 7（WS-PERF-01 + VIS×4） |

**82 例判定：破门**（非 PERF 失败 22；另有 23 例未执行/跳过）。

---

## 5. 与 R1 对照差异

| 项 | R1（`cc-nav-c1-f3-evidence.md`） | R2（本窗） |
|---|---|---|
| 集成树 | `2bba00a`（merge 至 pre-#186 main） | `50b89d4`（merge 含 **#186 `ed07c0a`** OBS-03 H2） |
| E2E 端口 | 4441 | 4461 |
| 墙钟 | 45.1 min | 33.1 min |
| EXIT= | 1 | 1 |
| passed | 73 | **37** |
| failed | **1**（`CITY-OBS-03`） | **22** |
| did not run | 10 | **25** |
| 82 例判定 | 破门（OBS-03） | **破门**（并发挤兑 + preview 崩溃连坐） |
| CC-NAV-C1 minimap | **三例全绿** | **零例执行**（`CITY-NAV-01`/`03` CONNECTION_REFUSED；`NAV-02` 连坐 skip） |
| OBS-03 | failed（console.table CDP 零送达） | **未跑到**（`OBS-01` 连坐前 preview 已死；#186 H2 未获证） |
| 根因类型 | 单点产品/取证方法 | **环境性**：`workers=2` 并行 3D 挤兑 → WebGL 初始化失败 → preview `:4461` 崩溃 |

---

## 6. 失败清单与归因（主窗）

### 6.1 根因（1 例）

| 用例 | project | 归因 |
|---|---|---|
| **CITY-HINT-01** 键位卡全链 | world-chromium | `data-state` 卡在 `error`（210s 超时）；页内文案 **「3D 引擎初始化失败：当前浏览器可能不支持 WebGPU / WebGL 2」**。与 worker 2 并行跑 `CITY-FB-01…09`（test #36，6.9m）同窗挤兑 SwiftShader。附件：`test-results/cyber-city-feedback-科技城键位卡-ba45a--*/` |

### 6.2 preview 连坐（21 例 · `ERR_CONNECTION_REFUSED :4461`）

`CITY-HINT-01` 失败后 preview 进程退出，后续 world-chromium 用例全部 `page.goto` / `apiRequestContext.get` 拒连：

| 用例 | 备注 |
|---|---|
| CITY-HINT-02 | CONNECTION_REFUSED |
| CITY-NAV-01 / CITY-NAV-03 | CONNECTION_REFUSED（**NAV 专项未获证**） |
| CITY-OBS-01 | CONNECTION_REFUSED |
| CITY-PA-01 | CONNECTION_REFUSED |
| CITY-SIGN-01 / 02 / 03 | CONNECTION_REFUSED |
| CITY-E2E-01 | CONNECTION_REFUSED |
| CITY-FB-05 | CONNECTION_REFUSED（与 #36 FB-01 并行收尾撞死服） |
| WS-E2E-01 … WS-E2E-10 | CONNECTION_REFUSED ×11 |

### 6.3 串行连坐 skip（16 例 · 未计入 failed）

| spec 块 | 跳过用例 |
|---|---|
| minimap | CITY-NAV-02 |
| observability | CITY-OBS-01b … CITY-OBS-06（含 **OBS-03**） |
| poi-arrival | CITY-PA-02 … CITY-PA-04 |
| cyber-city | CITY-E2E-02 … CITY-VEH-05 |
| feedback | CITY-FB-06 |

### 6.4 殿后依赖链未触发（7 例 · 计入 82 账 did not run）

| project | 用例 |
|---|---|
| world-perf-chromium | WS-PERF-01 |
| city-perf-chromium | CITY-PERF-01 / CITY-PERF-02（**恒红排除**） |
| visual-chromium | VIS-01 … VIS-04 |

---

## 7. 归因重跑（一次 · 分开记录）

**命令**（`workers=1` 串行 · 仅 `cyber-city-feedback.spec.ts`）：

```bash
cd /tmp/nav-f3r2-wt
export E2E_PORT=4461
set -o pipefail
pnpm exec playwright test e2e/cyber-city-feedback.spec.ts \
  --project=world-chromium --workers=1 2>&1 | tee /tmp/nav-f3r2-attrib-feedback.log
EXIT=$?
echo "EXIT=$EXIT" | tee -a /tmp/nav-f3r2-attrib-feedback.log
```

**结果**：

```text
  35 passed (16.1m)
EXIT=0
```

含 world-chromium 腿 5 例全绿：**`CITY-FB-01…09`、`CITY-FB-05`、`CITY-FB-06`、`CITY-HINT-01`、`CITY-HINT-02`**。主窗 `CITY-HINT-01` 失败判为 **并行 3D 挤兑假阴性**，非 NAV/OBS 产品回归。

---

## 8. 裁决

| 项 | 结果 |
|---|---|
| EXIT= | **1** |
| 82 例过门 | **破门** |
| 首要 blocker | 主窗 `workers=2` 并行 world-chromium → `CITY-HINT-01` WebGL 初始化失败 → preview 崩溃 → 21 例 CONNECTION_REFUSED 连坐 |
| 与 R1 差异 | R1 单点 `CITY-OBS-03`（#186 前）；R2 已 merge #186 但 **OBS-03 未跑到**；NAV 三例 R1 全绿、R2 零执行 |
| 归因窗 | feedback spec `workers=1` 全绿（**不冲销主窗破门**） |
| CC-NAV-C1 专项 | 本窗 **未获证**（preview 连坐）；需独占窗 `workers=1` 全量复跑 |

---

## 9. 关联

- 候选 PR：#166（`cursor/cc-nav-c1-minimap-8ca4`）
- R1 证据：`docs/research/cc-nav-c1-f3-evidence.md`
- #186 OBS-03 H2：`ed07c0a`
- 隔离剧本：`docs/research/cc-loop-104-ready-preclear.md` §3 步骤 5
