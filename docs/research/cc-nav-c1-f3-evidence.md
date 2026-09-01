# CC-NAV-C1-F3-EVIDENCE · F3 本地跑道全量 e2e 取证（#166 过门）

- **执行**：F3 取证跑道（#178 审计 F3 + 董事会 #182：F3 = 本地跑道全量，CI 五门不覆盖 e2e）
- **纪律**：零 `src/` 改动；禁 ready/merge #166；证据数字不美化
- **取证窗**：2026-08-29 12:38–13:23 CST（UTC+8）；墙钟全量约 45.1 min

---

## 1. 跑道环境

| 项 | 实测 |
|---|---|
| 机器 | `Darwin wangleideMacBook-Pro-3.local 25.6.0 arm64`（Apple Silicon） |
| 主仓路径 | `/Users/wanglei/mywebsite` |
| worktree | `/tmp/nav-f3-wt`（`git worktree add --detach`，已清理） |
| 候选 tip | `b4694cf`（`origin/cursor/cc-nav-c1-minimap-8ca4`） |
| 集成树 tip | `2bba00a`（`Merge remote-tracking branch 'origin/main' into HEAD`；merge **CLEAN**） |
| 依赖 | `pnpm install --frozen-lockfile` ✓ |
| 构建 | `pnpm build` ✓ |
| E2E 端口 | `E2E_PORT=4441`（`playwright.config.ts` L10：`process.env.E2E_PORT ?? 4321`；webServer `pnpm preview --host 127.0.0.1 --port ${PORT}`） |
| 端口探针 | python3 socket bind `127.0.0.1:4441` → **`PROBE_OK: port 4441 is free`**（bind 成功；未使用 4321） |
| 全量日志 | `/tmp/nav-f3-full.log`（worktree 内执行；本机保留至清理前） |

---

## 2. 分母核验（`--list`）

```text
Total: 84 tests in 18 files
```

命令：`cd /tmp/nav-f3-wt && export E2E_PORT=4441 && pnpm exec playwright test --list | tail -2`

---

## 3. 全量执行命令

```bash
cd /tmp/nav-f3-wt
export E2E_PORT=4441
set -o pipefail
pnpm exec playwright test 2>&1 | tee /tmp/nav-f3-full.log
EXIT=$?
echo "EXIT=$EXIT" | tee -a /tmp/nav-f3-full.log
```

---

## 4. 汇总（Playwright list reporter 尾行）

```text
  1 failed
  10 did not run
  73 passed (45.1m)
EXIT=1
```

**过门口径（#178 / #182）**：分母 84 − 恒红 PERF `CITY-PERF-01`/`CITY-PERF-02` = **82 例**；要求 0 failed / 0 skipped（PERF 除外）/ 0 flaky。

| 桶 | 数量 | 说明 |
|---|---:|---|
| 全量分母 | 84 | `--list` 实数 |
| 恒红排除（不入 82 账） | 2 | `CITY-PERF-01`、`CITY-PERF-02`（殿后 project 未跑到） |
| **82 例账** | 82 | 见下表 |
| passed（在 82 内） | 73 | |
| failed（在 82 内） | 1 | `CITY-OBS-03` |
| skipped / did not run（在 82 内） | 8 | 串行连坐 3 + 依赖链未跑 5 |

**82 例判定：破门**（`CITY-OBS-03` failed；另有 8 例未执行/跳过，非 PERF 恒红项）。

---

## 5. 逐 spec 结果表（已执行 project）

| project | spec | pass | fail | skip |
|---|---|---:|---:|---:|
| desktop-chromium | home.spec.ts | 5 | 0 | 0 |
| desktop-chromium | lab-index.spec.ts | 4 | 0 | 0 |
| desktop-chromium | site-health.spec.ts | 4 | 0 | 0 |
| desktop-chromium | tts-cockpit.spec.ts | 7 | 0 | 0 |
| mobile-375 | mobile.spec.ts | 3 | 0 | 0 |
| car-chromium | car-configurator.spec.ts | 7 | 0 | 0 |
| world-chromium | cyber-city-audio.spec.ts | 1 | 0 | 0 |
| world-chromium | cyber-city-explore.spec.ts | 4 | 0 | 0 |
| world-chromium | cyber-city-feedback.spec.ts | 5 | 0 | 0 |
| world-chromium | cyber-city-minimap.spec.ts | 3 | 0 | 0 |
| world-chromium | cyber-city-poi-arrival.spec.ts | 4 | 0 | 0 |
| world-chromium | cyber-city-observability.spec.ts | 3 | 1 | 3 |
| world-chromium | cyber-city-signage.spec.ts | 3 | 0 | 0 |
| world-chromium | cyber-city.spec.ts | 9 | 0 | 0 |
| world-chromium | world-spike.spec.ts | 11 | 0 | 0 |

**CC-NAV-C1 小地图三例（minimap.spec.ts）**：`CITY-NAV-01`/`02`/`03` 全部 **pass**。

---

## 6. 未执行 / 跳过清单（10 did not run）

### 6.1 串行连坐（`cyber-city-observability.spec.ts` · `CITY-OBS-03` 失败后）

| 用例 | 状态 |
|---|---|
| CITY-OBS-04 ring 溢出 | skipped（did not run） |
| CITY-OBS-05 #debug 面板 | skipped（did not run） |
| CITY-OBS-06 冒烟脚本 | skipped（did not run） |

### 6.2 殿后 project 依赖链未触发（`world-chromium` 非零 exit）

| project | 用例 | 状态 | 82 账 |
|---|---|---|---|
| world-perf-chromium | WS-PERF-01 | did not run | **计入 82** |
| city-perf-chromium | CITY-PERF-01 | did not run | **恒红排除** |
| city-perf-chromium | CITY-PERF-02 | did not run | **恒红排除** |
| visual-chromium | VIS-01 | did not run | **计入 82** |
| visual-chromium | VIS-02 | did not run | **计入 82** |
| visual-chromium | VIS-03 | did not run | **计入 82** |
| visual-chromium | VIS-04 | did not run | **计入 82** |

---

## 7. 失败清单与归因

| 用例 | project | 归因 |
|---|---|---|
| **CITY-OBS-03** dispose 合同：卸载前可取证 + 卸载时 console 摘要一次（table×2 + [session] 一行） | world-chromium | `expect.poll(() => tables.length).toBeGreaterThanOrEqual(2)` 15s 超时：**Received: 0**（dispose 后未收到 `console.table` CDP 事件）。文件：`e2e/cyber-city-observability.spec.ts:469`。附件：`test-results/cyber-city-observability-科-87310-le-摘要一次（table×2-session-一行）-world-chromium/`（screenshot + trace.zip）。 |

**非 PERF 失败**：仅此 1 例。未做刷绿重试。

---

## 8. e2e-results / json 摘要

- Playwright json reporter 配置：`test-results/e2e-results.json`（`playwright.config.ts` L38）
- 全量跑毕后 `.last-run.json`：`{"status":"failed","failedTests":["735ba2c1994210031cfc-03837c325850d2b6c896"]}`
- 注：跑后若在同一 worktree 执行 `playwright test --list`，会覆盖 json reporter 输出为 list 模式 stats；**全量跑分母以 §4 list reporter 尾行 + 本日志为准**。

---

## 9. 裁决

| 项 | 结果 |
|---|---|
| EXIT= | **1** |
| 82 例过门 | **破门** |
| 首要 blocker | `CITY-OBS-03` failed（观测 dispose console 摘要未收到） |
| 次级 | 依赖链 5 例未跑（WS-PERF-01 + VIS-01…04）+ OBS 串行连坐 3 例 skipped |
| CC-NAV-C1 专项 | minimap 三例全绿；F3 破门原因不在 NAV 腿 |

---

## 10. 关联

- 候选 PR：#166（`cursor/cc-nav-c1-minimap-8ca4`）
- 审计：#178 F3 口径；董事会 #182 A-⑤（84/18 分母）
- 隔离剧本：`docs/research/cc-loop-104-ready-preclear.md` §3 步骤 5
