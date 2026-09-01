# #104 CC-VIS-X2-FACADE-R2 ready-gate full e2e R1 runtime receipt

## Scope conclusion

This receipt reports runtime facts only. It does **not** make a PR-ready or merge-ready decision. Controller/commander owns ready and merge decisions.

- Candidate HEAD: `834f1e7e84d1b0e2cd48372f0d556a1c0d5e8ccb`
- Parents, in order: `bbba5a5f389c3c7c29969417af87cc18fb2d326f 39318dc7923a503df4beb71d75c2e0cdfc38e0e1`
- Candidate tree: `32c1edccdd09e5aa6b02d28163fc4ad26f5e415a`
- PR #104 branch: `cursor/cc-vis-x2-facade-r2-1d6f`
- Subject: `Merge remote-tracking branch 'origin/main' into cursor/cc-vis-x2-facade-r2-1d6f`
- Remote main: `39318dc7923a503df4beb71d75c2e0cdfc38e0e1`
- 16 candidate files in diff against main
- Exact-head CI run: `33502395779`
- Runtime host: local Mac, Darwin 25.6.0 arm64, macOS 26.6.2 (25G82)
- Worktree: `/private/tmp/x2-104-full-r1`
- Formal PID: `73514`
- Port: `4585`
- Qualification outcome: **`RESULT_FAIL` / `NO_GO`** (Playwright test run: `76 passed, 2 failed, 8 did not run`, `RUN_EXIT=1`; continuous host monitor: `0` external automation processes detected during formal window in 953 samples, `MONITOR_EXIT=0`, `FORMAL_SCRIPT_EXIT=1`).

No test retry/rerun, second attempt, push to candidate, repository edit on main, trace/video generation, or `node_modules`/`dist` copy was performed.

## Host fingerprint and environment

Source: `host-fingerprint.log`.

- macOS `26.6.2`, build `25G82`
- Darwin `25.6.0`, arm64
- Node `v25.9.0`
- pnpm `10.33.3`
- Playwright `1.62.1`
- Disk: `227GiB` available (`/dev/disk3s5` on `/System/Volumes/Data`)
- Candidate worktree was clean before all checks
- `git status --porcelain`: clean

## Build and enumeration facts

1. `pnpm install --frozen-lockfile` (source: `install.log`)
   - exit `0` (`INSTALL_EXIT=0`)
2. `pnpm exec astro check` (source: `astro-check.log`)
   - exit `0` (`ASTRO_CHECK_EXIT=0`)
   - Summary: `159 files`, `0 errors`, `0 warnings`, `58 hints`
3. `pnpm build` (source: `build.log`)
   - exit `0` (`BUILD_EXIT=0`)
   - `19 page(s) built`; build complete
   - Non-blocking Vite chunk-size advisory on bundles > 500 kB
4. Fresh `pnpm exec playwright test --list` (source: `list.log`)
   - exit `0` (`LIST_EXIT=0`)
   - Exact enumeration: `Total: 86 tests in 19 files`
   - CITY-PERF cases: exactly 2 (`CITY-PERF-01`, `CITY-PERF-02`)

## Formal-window qualification

### Preflight host vacuum immediately before run

Source: `preflight-vacuum.log`, `preflight-port.log`.

```sh
python3 /private/tmp/x2-104-full-r1-website-host-vacuum.py snapshot --all-output /private/tmp/x2-104-full-r1-preflight-ps.full > /private/tmp/x2-104-full-r1-preflight-vacuum.log 2>&1
```

- Snapshot UTC: `2026-09-01T11:31:32+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Preflight socket bind to `127.0.0.1:4585`: exit `0` (`PORT=4585 BIND=SUCCESS`)
- Full host `ps` snapshot SHA256 in `preflight-ps.sha256`

### Formal script execution

Source: `formal-run.zsh`, `shell-state.log`.

The only formal execution was:

```sh
/private/tmp/x2-104-full-r1-formal-run.zsh
```

- Formal start: `2026-09-01T11:31:35Z` / `2026-09-01T19:31:35+0800`
- Formal end: `2026-09-01T13:15:04Z` / `2026-09-01T21:15:04+0800`
- Candidate HEAD inside formal script: exact `834f1e7e84d1b0e2cd48372f0d556a1c0d5e8ccb`
- `E2E_PORT=4585`
- `ASTRO_PREVIEW_BACKGROUND=1`
- `PIPEFAIL_BEFORE=on`
- `PIPEFAIL_AFTER=on`
- Playwright run exit: `1` (`RUN_EXIT=1`)
- Monitor exit: `0` (`MONITOR_EXIT=0`)
- Formal script exit: `1` (`FORMAL_SCRIPT_EXIT=1`)
- Test count: `76` passed, `2` failed, `8` did not run (1.7h / 6,208,408.612 ms)

### Continuous host monitor and qualification verdict

Source: `host-monitor.log`.

- Monitor window: `2026-09-01T11:31:35+00:00` to `13:15:08+00:00`
- Interval: `5.0s`
- Total samples: `953`
- External automation process detection:
  - Samples 1–953: `EXTERNAL_MATCH_COUNT=0`
  - `MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT=0`
- Qualification verdict: **`RESULT_FAIL / NO_GO`** based on candidate test failures (`CITY-VEH-01/02/03/04/06` mount timeout and `WS-E2E-02` mount timeout), while host monitoring was clean (0 external automation conflicts).

## Detailed test results breakdown

### Failures (2 unexpected)

1. `[world-chromium] › e2e/cyber-city.spec.ts:347:3 › 科技城 @phase0 世界剧本（CC-E7 绿灯 · world-chromium 串行 project） › CITY-VEH-01/02/03/04/06 驾驶双视角：robot_idle 门禁 → car_ready 切 FPV 不触发 driving → FPV 驾驶 → V 往返`
   - Duration: `1,161,746 ms`
   - Failure: `Test timeout of 600000ms exceeded.` / `expect(locator).toHaveAttribute('data-state', 'ready') failed (received: "loading", timeout: 210000ms)`
2. `[world-chromium] › e2e/world-spike.spec.ts:165:3 › world Spike 灰盒试验场 › WS-E2E-02 进入试验场：显式启动 → ready，HUD/徽标/遥测揭示，资产仅在点击后拉取`
   - Duration: `209,136 ms`
   - Failure: `expect(locator).toHaveAttribute('data-state', 'ready') failed (received: "loading", timeout: 150000ms)`

### Skipped / Did not run (8 cases)

Due to fail-stop / project dependencies after failures in `world-chromium`:
1. `[world-chromium] › e2e/cyber-city.spec.ts:434:3 › CITY-VEH-05 reduced-motion`
2. `[world-perf-chromium] › e2e/world-spike-perf.spec.ts:100:3 › WS-PERF-01`
3. `[city-perf-chromium] › e2e/cyber-city-perf.spec.ts:304:3 › CITY-PERF-01`
4. `[city-perf-chromium] › e2e/cyber-city-perf.spec.ts:575:3 › CITY-PERF-02`
5. `[visual-chromium] › e2e/visual/world-visual.spec.ts:53:3 › VIS-01`
6. `[visual-chromium] › e2e/visual/world-visual.spec.ts:74:3 › VIS-02`
7. `[visual-chromium] › e2e/visual/world-visual.spec.ts:101:3 › VIS-03`
8. `[visual-chromium] › e2e/visual/world-visual.spec.ts:121:3 › VIS-04`

### Key Passing Legs (76 expected)

- `CITY-EXP-01` (PASS, 19.9m file time)
- `CITY-EXP-02` (PASS)
- `CITY-QST-01` (PASS)
- `CITY-QST-02` (PASS)
- `CITY-OBS-01` through `CITY-OBS-06` (all 6 PASS, 13.1m file time)
- `CITY-NAV-01` / `CITY-NAV-02` / `CITY-NAV-03` (all 3 PASS, 6.4m file time)
- `CITY-BGM-01` (both 2 cases PASS)
- `CITY-AUD-01` (PASS)
- `CITY-FB-01` through `CITY-FB-09` (PASS, 12.0m file time)
- `CITY-PA-01` through `CITY-PA-04` (PASS, 5.3m file time)
- `CITY-SIGN-01` through `CITY-SIGN-03` (PASS)
- `CITY-E2E-01` through `CITY-E2E-06` (PASS)
- `WS-E2E-01`, `WS-E2E-03` through `WS-E2E-11` (all PASS except WS-E2E-02)

## Postflight facts

Source: `postflight-vacuum.log`, `postflight-port.log`, `postflight-git.log`, `tracked-restore.json`.

1. Exactly 22 tracked test-generated PNG screenshots were modified during the run under `docs/spec/assets/`.
2. All 22 files were restored via `git restore -- <path>` and their post-restore SHA256 hashes matched pre-run hashes (source: `tracked-restore.json`).
3. Candidate worktree status verified completely clean (`postflight-git.log` empty).
4. Postflight socket bind on `127.0.0.1:4585`: `PORT=4585 BIND=SUCCESS`.
5. Postflight vacuum snapshot: `HOST_RELEVANT_MATCH_COUNT=0`.

## Final verdict

**`RESULT_FAIL` / `NO_GO`**
Ready-gate denominator: 86. Expected passed: 76. Unexpected failures: 2. Skipped / unexecuted: 8. Flaky: 0. Retries: 0. `RUN_EXIT=1`. `FORMAL_SCRIPT_EXIT=1`.
