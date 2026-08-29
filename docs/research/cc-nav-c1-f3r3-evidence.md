# CC-NAV-C1-F3R3-EVIDENCE · F3 R3 本地跑道全量 e2e 取证（#166 过门）

- **执行**：F3 R3 过门跑道（#178 审计 F3 + 董事会 #182；R1/R2 见 `cc-nav-c1-f3-evidence.md` / `cc-nav-c1-f3r2-evidence.md`）
- **纪律**：零 `src/` 改动；禁 ready/merge #166；证据数字不美化；**强制 `workers=1` 独占**
- **取证窗**：2026-08-29 15:33–17:46 CST（UTC+8）；主窗墙钟全量约 73.2 min（1.2h）

---

## 1. 跑道环境

| 项 | 实测 |
|---|---|
| 机器 | `Darwin wangleideMacBook-Pro-3.local 25.6.0 arm64`（Apple Silicon） |
| 主仓路径 | `/Users/wanglei/mywebsite` |
| worktree | `/tmp/nav-f3r3-wt`（`git worktree add --detach`，跑后清理） |
| 候选 tip | `b4694cf`（`origin/cursor/cc-nav-c1-minimap-8ca4`） |
| 集成树 tip | `999c90b`（`Merge remote-tracking branch 'origin/main' into HEAD`；merge **CLEAN**） |
| main 基线 | `ed07c0a`（merge 时 tip；#186 OBS-03 H2 侧信道） |
| 证据分支 base | `488eaa8`（`origin/main` @ 证据 PR 开枝时） |
| 依赖 | `pnpm install --frozen-lockfile` ✓ |
| 构建 | `pnpm build` ✓（19 pages） |
| E2E 端口 | `E2E_PORT=4471`（`playwright.config.ts` L10；webServer `pnpm preview --host 127.0.0.1 --port ${PORT}`） |
| 端口探针 | python3 socket bind `127.0.0.1:4471` → **`PROBE_OK: port 4471 is free`** |
| 全量日志 | `/tmp/nav-f3r3.log` |
| Playwright workers | **`--workers=1`**（CLI 强制；禁 config 默认 2） |

### 1.1 独占核验（开跑前）

**命令**：`ps aux | rg -i 'chrome|playwright|astro' | rg -v rg`

```text
命中 43 行（桌面 Chrome 常驻 + playwright-mcp MCP 服务；无 astro preview / playwright test / headless 靶站）
```

**e2e 阻塞子集**：`ps aux | rg -i 'headless|swiftshader|playwright test|astro preview|pnpm preview' | rg -v rg`

```text
NO_E2E_BLOCKERS
```

端口 4471 bind 探针：**PROBE_OK**。纪律：未杀他人进程；本窗自管 preview 独占 4471。

---

## 2. 分母核验（`--list`）

```text
Total: 84 tests in 18 files
```

命令：`cd /tmp/nav-f3r3-wt && export E2E_PORT=4471 && pnpm exec playwright test --list | tail -2`

---

## 3. 全量执行命令

```bash
cd /tmp/nav-f3r3-wt
export E2E_PORT=4471
set -o pipefail
pnpm exec playwright test --workers=1 2>&1 | tee /tmp/nav-f3r3.log
EXIT=$?
echo "EXIT=$EXIT" | tee -a /tmp/nav-f3r3.log
```

---

## 4. 汇总（Playwright list reporter 尾行）

```text
  1 failed
  13 did not run
  70 passed (1.2h)
EXIT=1
```

**过门口径（#178 / #182）**：分母 84 − 恒红 PERF `CITY-PERF-01`/`CITY-PERF-02` = **82 例**；要求 0 failed / 0 skipped（PERF 除外）/ 0 flaky。

| 桶 | 数量 | 说明 |
|---|---:|---|
| 全量分母 | 84 | `--list` 实数 |
| 恒红排除（不入 82 账） | 2 | `CITY-PERF-01`、`CITY-PERF-02`（殿后 project 未跑到） |
| **82 例账** | 82 | 见下表 |
| passed（在 82 内） | 70 | |
| failed（在 82 内） | **1** | `CITY-OBS-01`（泊车位驾驶超时） |
| skipped / did not run（在 82 内） | **11** | OBS 串行连坐 6 + 殿后链 5（WS-PERF-01 + VIS×4） |

**82 例判定：破门**（非 PERF 失败 1；另有 11 例未执行/跳过）。

---

## 5. R1 / R2 / R3 三轮对照

| 项 | R1（`cc-nav-c1-f3-evidence.md`） | R2（`cc-nav-c1-f3r2-evidence.md`） | R3（本窗） |
|---|---|---|---|
| 集成树 | `2bba00a` | `50b89d4` | `999c90b` |
| main 含 #186 | 否 | 是（`ed07c0a`） | 是（`ed07c0a`） |
| E2E 端口 | 4441 | 4461 | **4471** |
| workers | 2（config 默认） | 2 | **1（强制）** |
| 墙钟 | 45.1 min | 33.1 min | **73.2 min** |
| EXIT= | 1 | 1 | **1** |
| passed | 73 | 37 | **70** |
| failed | 1 | 22 | **1** |
| did not run | 10 | 25 | **13** |
| 82 例判定 | 破门 | 破门 | **破门** |
| 首要 blocker | `CITY-OBS-03`（console.table CDP） | `workers=2` 挤兑 → preview 崩溃连坐 | **`CITY-OBS-01`（泊车位不可达）** |
| CC-NAV-C1 minimap | **三例全绿** | 零例执行（连坐） | **三例全绿** |
| OBS-03（#186 H2） | failed（CDP 零送达） | 未跑到 | **未跑到**（OBS-01 连坐 skip） |

---

## 6. 逐 spec 结果表（已执行 project）

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
| world-chromium | cyber-city-minimap.spec.ts | **3** | 0 | 0 |
| world-chromium | cyber-city-observability.spec.ts | 0 | **1** | **6** |
| world-chromium | cyber-city-poi-arrival.spec.ts | 4 | 0 | 0 |
| world-chromium | cyber-city-signage.spec.ts | 3 | 0 | 0 |
| world-chromium | cyber-city.spec.ts | 9 | 0 | 0 |
| world-chromium | world-spike.spec.ts | 11 | 0 | 0 |

**CC-NAV-C1 小地图三例（minimap.spec.ts）**：

| 用例 | 结果 | 墙钟 |
|---|---|---|
| CITY-NAV-01 全链 M/Esc/Tab/Enter/E | **pass** | 1.8m |
| CITY-NAV-02 恒等门 robot_idle | **pass** | 2.1m |
| CITY-NAV-03 触屏+reduced-motion | **pass** | 1.4m |

---

## 7. 未执行 / 跳过清单（13 did not run）

### 7.1 串行连坐（`cyber-city-observability.spec.ts` · `CITY-OBS-01` 失败后）

| 用例 | 状态 | 备注 |
|---|---|---|
| CITY-OBS-01b 锥桶补充取证 | skipped | |
| CITY-OBS-02 导出面契约 | skipped | |
| **CITY-OBS-03** dispose 合同（#186 H2 侧信道） | skipped | **H2 后首次全量未获证** |
| CITY-OBS-04 ring 溢出 | skipped | |
| CITY-OBS-05 #debug 面板 | skipped | |
| CITY-OBS-06 冒烟脚本 | skipped | |

### 7.2 殿后 project 依赖链未触发（`world-chromium` 非零 exit）

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

## 8. 失败清单与归因（主窗）

| 用例 | project | 归因 |
|---|---|---|
| **CITY-OBS-01** 漏斗全走 @funnel | world-chromium | `driveTo(28,-28)` 360s 超时：`泊车位 (28,-28) 应可达（实测 x=13.8 z=-15.3）`。文件：`e2e/cyber-city-observability.spec.ts:331`。非 preview 崩溃连坐（R2 根因已排除）；后续 PA/SIGN/E2E/WS 均正常执行。 |

---

## 9. 归因重跑（一次 · 分开记录）

**命令**（`workers=1` 串行 · 仅 `cyber-city-observability.spec.ts` + world-chromium 依赖链）：

```bash
cd /tmp/nav-f3r3-wt
export E2E_PORT=4471
set -o pipefail
pnpm exec playwright test e2e/cyber-city-observability.spec.ts \
  --project=world-chromium --workers=1 2>&1 | tee /tmp/nav-f3r3-attrib-obs.log
EXIT=$?
echo "EXIT=$EXIT" | tee -a /tmp/nav-f3r3-attrib-obs.log
```

**结果**：

```text
  1 failed
  6 did not run
  30 passed (12.4m)
EXIT=1
```

| 项 | 主窗 | 归因窗 |
|---|---|---|
| CITY-OBS-01 | fail（x=13.8 z=-15.3） | fail（x=8.3 z=-10.2） |
| CITY-OBS-03 | skip | skip |
| 判定 | 同签名复现 | **非 R2 挤兑假阴性**；驾驶路径/泊车位可达性不稳定 |

归因窗 **不冲销主窗破门**。

---

## 10. OBS-03（#186 H2）专项

| 轮次 | OBS-03 状态 | 说明 |
|---|---|---|
| R1 | **failed** | `console.table` CDP 零送达（#186 前） |
| R2 | 未跑到 | preview 崩溃连坐 |
| R3 主窗 | **未跑到** | OBS-01 失败 → 串行 skip |
| R3 归因窗 | **未跑到** | 同上 |

**#186 H2 持久侧信道改法在本窗全量中未获独立取证**；需 OBS-01 先绿或 `--grep CITY-OBS-03` 定向窗补证。

---

## 11. 裁决

| 项 | 结果 |
|---|---|
| EXIT= | **1** |
| 82 例过门 | **破门** |
| R2→R3 改善 | workers=1 消除 preview 崩溃连坐；NAV 三例由零执行恢复全绿；failed 由 22 降至 1 |
| 当前 blocker | `CITY-OBS-01` 泊车位驾驶不可达 + 殿后 5 例未跑 + OBS 链 6 例 skip |
| CC-NAV-C1 专项 | **minimap 三例全绿**；F3 破门原因不在 NAV 腿 |

---

## 12. 关联

- 候选 PR：#166（`cursor/cc-nav-c1-minimap-8ca4`）
- R1 证据：`docs/research/cc-nav-c1-f3-evidence.md`
- R2 证据：`docs/research/cc-nav-c1-f3r2-evidence.md`
- #186 OBS-03 H2：`ed07c0a`
- 隔离剧本：`docs/research/cc-loop-104-ready-preclear.md` §3 步骤 5
