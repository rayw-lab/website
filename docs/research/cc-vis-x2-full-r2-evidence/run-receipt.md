# #104 CC-VIS-X2-FACADE-R2 ready-gate full e2e R2 runtime receipt

## Scope conclusion

This receipt reports runtime facts only. It does **not** make a PR-ready or merge-ready decision. Controller/commander owns ready and merge decisions.

- Candidate HEAD: `598764172250f3a0d6e5a29c36aa564dbd44e009`
- Parents, in order: `834f1e7e84d1b0e2cd48372f0d556a1c0d5e8ccb 939056d728218b68cc3e914840ab9f5ddcb2d82b`
- Candidate tree: `e82664187a29b5c62773b25193fde228ff497117`
- PR #104 branch: `cursor/cc-vis-x2-facade-r2-1d6f`
- Subject: `Merge remote-tracking branch 'origin/main' into cursor/cc-vis-x2-facade-r2-1d6f`
- Remote main: `939056d728218b68cc3e914840ab9f5ddcb2d82b`
- Exact-head CI run: `33514114971` (Status: `success`, 4m49s green, check/build/links/budget/lighthouse)
- Runtime host: local Mac, Darwin 25.6.0 arm64, macOS 26.6.2 (25G82)
- Worktree: `/private/tmp/x2-104-full-r2`
- Formal Root PID: `21409`
- Port: `4587` (`E2E_PORT=4587`)
- Qualification outcome: **`RESULT_FAIL` / `NO_GO`** (Playwright test run: `72 passed, 1 failed, 13 did not run, 0 flaky, retries=0`, `RUN_EXIT=1`; continuous host monitor: `0` external automation processes detected during formal window in 1111 samples, `MONITOR_EXIT=0`, `FORMAL_SCRIPT_EXIT=1`).

No test retry/rerun, second attempt, push to candidate, repository edit on main, trace/video upload, or `node_modules`/`dist` copy was performed.

## Host fingerprint and environment

Source: `host-fingerprint.log`.

- macOS: `26.6.2`, build `25G82`
- Darwin: `25.6.0`, arm64
- Node: `v22.23.0`
- pnpm: `10.33.3`
- Playwright: `1.62.1`
- Disk before run: `239,912,652,800 bytes` available (~223.44 GiB)
- Disk after run: `253,771,276,288 bytes` available (~236.34 GiB)
- Candidate worktree was clean before all checks (`preflight-git.log`: clean)

## Build and enumeration facts

1. `pnpm install --frozen-lockfile` (source: `install.log`)
   - exit `0` (`INSTALL_EXIT=0`)
   - `Lockfile is up to date, resolution step is skipped; Packages: +702`
2. `pnpm exec astro check` (source: `astro-check.log`)
   - exit `0` (`ASTRO_CHECK_EXIT=0`)
   - `Getting diagnostics for Astro files in /private/tmp/x2-104-full-r2...`
   - Content synced in 285ms, diagnostics clean (1 unused import warning in `e2e/tts-cockpit.spec.ts`)
3. `pnpm build` (source: `build.log`)
   - exit `0` (`BUILD_EXIT=0`)
   - `output: "static"`, mode: `"static"`, directory: `/private/tmp/x2-104-full-r2/dist/`
   - `✓ Completed in 234ms. Building static entrypoints... 19 page(s) built`
4. Fresh `pnpm exec playwright test --list` (source: `list.log`, `list-e2e-results.json`)
   - exit `0` (`LIST_EXIT=0`)
   - Exact enumeration: `Total: 86 tests in 19 files`

## Formal-window qualification

### Preflight host vacuum immediately before run

Source: `preflight-vacuum.log`, `preflight-port.log`.

```sh
python3 /private/tmp/x2-104-full-r2-website-host-vacuum.py snapshot > /private/tmp/x2-104-full-r2-evidence/preflight-vacuum.log 2>&1
```

- Snapshot UTC: `2026-09-01T13:40:10+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Preflight socket bind to `127.0.0.1:4587`: exit `0` (`PORT=4587 BIND=SUCCESS`)

### Formal script execution

Source: `formal-run.zsh`, `shell-state.log`.

The only formal execution was:

```sh
/private/tmp/x2-104-full-r2-formal-run.zsh
```

- Formal start: `2026-09-01T13:40:31Z` / `2026-09-01T21:40:31+0800`
- Formal end: `2026-09-01T15:14:56Z` / `2026-09-01T23:14:56+0800`
- Candidate HEAD inside formal script: exact `598764172250f3a0d6e5a29c36aa564dbd44e009`
- `E2E_PORT=4587`
- `ASTRO_PREVIEW_BACKGROUND=1`
- `WORKERS=1`
- `RETRIES=0`
- `CI=UNSET`
- `PIPEFAIL_BEFORE=on`
- `PIPEFAIL_AFTER=on`
- Playwright run exit: `1` (`RUN_EXIT=1`)
- Monitor exit: `0` (`MONITOR_EXIT=0`)
- Formal script exit: `1` (`FORMAL_SCRIPT_EXIT=1`)
- Test count from JSON reporter (`e2e-results.json`): `72 expected (passed), 1 unexpected (failed), 13 skipped (did not run), 0 flaky, 0 retries` (wall clock ~1.6h / 5,663,483.402 ms).

### Continuous host monitor and qualification verdict

Source: `host-monitor.log`, `host-monitor-summary.json`.

- Monitor window: `2026-09-01T13:40:31+00:00` to `15:14:59+00:00`
- Interval: `5.0s`
- Total samples: `1111`
- External automation process detection:
  - Samples 1–1111: `EXTERNAL_MATCH_COUNT=0`
  - `MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT=0`
- Qualification verdict: **`RESULT_FAIL / NO_GO`** based on candidate test failure (`CITY-OBS-01` parking bay reachability failure), while host monitoring was clean (0 external automation conflicts).

## Detailed test results breakdown

### Failures (1 unexpected)

1. `[world-chromium] › e2e/cyber-city-observability.spec.ts:362:3 › 科技城可观测性 @phase0（CC-OBS-C2 · world-chromium 串行 project） › CITY-OBS-01 漏斗全走 @funnel：ritual 动线 + V 往返 + R 重生 + 驾驶进 POI + E 进站取证`
   - Spec file and line: `e2e/cyber-city-observability.spec.ts:412:103`
   - Duration: `578,574 ms` (~9.6m)
   - Failure assertion:
     ```text
     Error: 泊车位 (28,-28) 应可达（实测 x=1.3 z=-2.1）

     expect(received).toBe(expected) // Object.is equality

     Expected: true
     Received: false

       410 |     expect(leg1.ok, `途径点 (20,-8) 应可达（实测 x=${leg1.state.x.toFixed(1)} z=${leg1.state.z.toFixed(1)}）`).toBe(true);
       411 |     const leg2 = await driveTo(page, { x: 28, z: -28 }, { radius: 4.5, timeoutMs: 360_000 });
     > 412 |     expect(leg2.ok, `泊车位 (28,-28) 应可达（实测 x=${leg2.state.x.toFixed(1)} z=${leg2.state.z.toFixed(1)}）`).toBe(true);
           |                                                                                                       ^
       413 |
       414 |     // 触发圈进入（poi-bounding-in → firstPoiIn 首达）
       415 |     const entered = await pollDump(page, (d) => d.funnel.firstPoiIn !== null, 60_000);
         at /private/tmp/x2-104-full-r2/e2e/cyber-city-observability.spec.ts:412:103
     ```
   - Context: Waypoint `(20,-8)` was reached (`leg1.ok === true`), but driving to parking bay `(28,-28)` failed within timeout (measured final position `x=1.3, z=-2.1`).

### Skipped / Did not run (13 cases)

Due to serial project execution fail-fast stopping remaining tests in `world-chromium`, `world-perf-chromium`, `city-perf-chromium`, and `visual-chromium`:
1. `[world-chromium] › e2e/cyber-city-observability.spec.ts:484:3 › CITY-OBS-01b 锥桶补充取证：灰盒直线撞桩 → cone-hit 事件 + coneHits 计数互证`
2. `[world-chromium] › e2e/cyber-city-observability.spec.ts:536:3 › CITY-OBS-02 导出面契约：__worldSession 仅 dump 一键 + env 落定 + 纯快照语义`
3. `[world-chromium] › e2e/cyber-city-observability.spec.ts:591:3 › CITY-OBS-03 dispose 合同：卸载前可取证 + 卸载时 console 摘要一次（table×2 + [session] 一行）`
4. `[world-chromium] › e2e/cyber-city-observability.spec.ts:638:3 › CITY-OBS-04 ring 溢出：520 条桥事件 → 丢最旧不失真；白名单外拒收 + 告警`
5. `[world-chromium] › e2e/cyber-city-observability.spec.ts:691:3 › CITY-OBS-05 #debug 面板：无 hash 零 debug 请求；有 hash 面板只读 + tail + 导出下载`
6. `[world-chromium] › e2e/cyber-city-observability.spec.ts:745:3 › CITY-OBS-06 冒烟脚本：function-smoke 消费 OBS-01/01b dump → 漏斗满额 + 覆盖齐 + 末行机读`
7. `[world-perf-chromium] › e2e/world-spike-perf.spec.ts:100:3 › WS-PERF-01 30s 驾驶后采集 HUD/遥测帧率 + rAF 帧间隔采样；p95<50ms 软门禁（OBS 不阻断）`
8. `[city-perf-chromium] › e2e/cyber-city-perf.spec.ts:304:3 › CITY-PERF-01 城市档证据包：状态机全走 + 20s 同源驾驶脚本 + rAF 采样 + 漏斗互证；p95<50ms 软门（OBS 不阻断）`
9. `[city-perf-chromium] › e2e/cyber-city-perf.spec.ts:575:3 › CITY-PERF-02 Q2 存在腿：?quality=2 深链生效 + 变形驾驶进站核心路径全走 + 漏斗七步 + Q2 负载基线`
10. `[visual-chromium] › e2e/visual/world-visual.spec.ts:53:3 › VIS-01 @visual 壳静态基线：reduced-motion 拦截态整壳截图与入库基线一致`
11. `[visual-chromium] › e2e/visual/world-visual.spec.ts:74:3 › VIS-02 @smoke3d ESC 菜单：Escape 开 → 双出口链接可见 → 截图基线 → Escape 关`
12. `[visual-chromium] › e2e/visual/world-visual.spec.ts:101:3 › VIS-03 @smoke3d 首幕取证：挂载 ready + robot_idle 后 canvas 非空（像素统计）+ 取证图落盘`
13. `[visual-chromium] › e2e/visual/world-visual.spec.ts:121:3 › VIS-04 @smoke3d POI 深链取证：?poi= 挂载 ready + canvas 非空 + 出生点落 parkingBay`

### Key Passing Legs (72 expected) & R1 Comparison

Both failures from R1 have now passed in R2:
- **R1 Failure 1 fix verified**: `CITY-VEH-01/02/03/04/06` (in `e2e/cyber-city.spec.ts:347`) -> **PASS** in R2 (`190,834 ms` / ~3.2m).
- **R1 Failure 2 fix verified**: `WS-E2E-02` (in `e2e/world-spike.spec.ts:165`) -> **PASS** in R2 (`22,366 ms` / ~22.4s).

*Note: Although both R1 failures are resolved, the R2 run remains `NO_GO` due to the `CITY-OBS-01` reachability failure.*

Other key passing legs:
- `CITY-EXP-01` (PASS, 589,797 ms)
- `CITY-EXP-02` (PASS, 253,458 ms)
- `CITY-QST-01` (PASS, 105,247 ms)
- `CITY-QST-02` (PASS, 616,244 ms)
- `CITY-FB-01…09` (PASS, 321,655 ms)
- `CITY-FB-05` (PASS, 113,218 ms)
- `CITY-FB-06` (PASS, 26,680 ms)
- `CITY-HINT-01` (PASS, 253,156 ms)
- `CITY-HINT-02` (PASS, 180,654 ms)
- `CITY-NAV-01` (PASS, 136,781 ms)
- `CITY-NAV-02` (PASS, 175,094 ms)
- `CITY-NAV-03` (PASS, 107,481 ms)
- `CITY-PA-01` (PASS, 109,734 ms)
- `CITY-PA-02` (PASS, 87,506 ms)
- `CITY-PA-03` (PASS, 68,317 ms)
- `CITY-PA-04` (PASS, 84,680 ms)
- `CITY-SIGN-01` (PASS, 90,477 ms)
- `CITY-SIGN-02` (PASS, 42,977 ms)
- `CITY-SIGN-03` (PASS, 47,669 ms)
- `CITY-VEH-05` (PASS, 107,503 ms)
- `CITY-VEH-07` (PASS, 7 ms)
- `CITY-AUD-01` (PASS, 159,695 ms)
- `CITY-BGM-01` (Case 1 PASS 199,963 ms; Case 2 PASS 179,796 ms)
- `CITY-E2E-01` through `CITY-E2E-06` (all PASS)
- `WS-E2E-01` through `WS-E2E-11` (all 11 tests PASS)
- `HOME-E2E-01` through `HOME-E2E-06` (all PASS)
- `CAR-E2E-01` through `CAR-E2E-07` (all PASS)
- `TTS-E2E-01` through `TTS-E2E-07` (all PASS)
- `LAB-E2E-01` through `LAB-E2E-04` (all PASS)

## Postflight facts and cleanup

Source: `postflight-vacuum.log`, `postflight-port.log`, `postflight-git.log`, `postflight-disk.log`, `tracked-restore.json`.

1. Exactly 23 tracked test-generated PNG screenshots under `docs/spec/assets/**.png` were modified during the run.
2. All 23 files were restored via explicit `git restore -- <path...>` and verified:
   - Index blob match: 23 / 23 (100% matched)
   - Working copy status: completely clean (`nothing to commit, working tree clean`)
3. Postflight socket bind to `127.0.0.1:4587`: `PORT=4587 BIND=SUCCESS`.
4. Postflight vacuum snapshot: `HOST_RELEVANT_MATCH_COUNT=0`.
5. Disk space available:
   - Before run: `239,912,652,800 bytes` (~223.44 GiB)
   - After run: `253,771,276,288 bytes` (~236.34 GiB)

## Final verdict

**`RESULT_FAIL` / `NO_GO`**
Ready-gate denominator: 86. Expected passed: 72. Unexpected failures: 1. Skipped / unexecuted: 13. Flaky: 0. Retries: 0. `RUN_EXIT=1`. `FORMAL_SCRIPT_EXIT=1`.
