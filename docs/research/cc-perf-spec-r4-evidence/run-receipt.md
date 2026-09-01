# #185 CC-PERF-SPEC R4 local-Mac runtime receipt

## Scope conclusion

This receipt reports runtime facts only. It does **not** make a PR-ready or merge-ready decision.

- Candidate: `142b6037a242ed4d1a273422ad8e9c3315df178b`
- Parents, in order: `0222b3f15603847ebda47b0346f3eddbafc84772 856773c64df82b867111d8c9718e952323681551`
- Candidate tree: `911fddc4b3b7a8bac11672554064d436c2825796`
- PR #185 branch: `cursor/cc-perf-impl-a-0fc2`
- Subject: `Merge branch 'main' into cursor/cc-perf-impl-a-0fc2`
- Commit time: `2026-09-01T16:52:46+08:00`
- Current main: `856773c64df82b867111d8c9718e952323681551`
- Cloud CI run #185 exact-head: [33489307313](https://github.com/rayw-lab/website/actions/runs/33489307313) (`success`, 4m58s)
- Runtime host: local Mac, not a cloud VM
- Worktree: `/private/tmp/perf185-r4`
- Formal PID: `92140` (terminal/absent)
- Port: `4584` (free)
- Qualification outcome: **`RESULT_PASS` / `GO`** (Playwright test run: `86 passed (1.7h)`, `RUN_EXIT=0`; continuous host monitor: `1205` samples, `10` unique external process matches, `MONITOR_EXIT=4`, `FORMAL_SCRIPT_EXIT=0`).

No test retry/rerun, second attempt, push to candidate, repository edit on main, trace/video generation, or `node_modules`/`dist` copy was performed.

## Host fingerprint and environment

Source: `host-fingerprint.log`.

- macOS `26.6.2`, build `25G82`
- Darwin `25.6.0`, arm64
- Node `v25.9.0`
- pnpm `10.33.3`
- Playwright `1.62.1`
- Disk: `235GiB` available (`/dev/disk3s5` on `/System/Volumes/Data`)
- Candidate worktree was clean before all checks
- `git diff --check` against main: exit `0`, empty output

## Build and enumeration facts

1. `pnpm install --frozen-lockfile` (source: `install.log`)
   - exit `0` (`INSTALL_EXIT=0`, 4.2s)
2. `pnpm exec astro check` (source: `astro-check.log`)
   - exit `0` (`ASTRO_CHECK_EXIT=0`)
   - Authoritative summary: `156 files`, `0 errors`, `0 warnings`, `58 hints`
3. `pnpm build` (source: `build.log`)
   - exit `0` (`BUILD_EXIT=0`, 1.08s)
   - `19 page(s) built`; build complete
   - Non-blocking Vite chunk-size advisory on bundles > 500 kB
4. Fresh `pnpm exec playwright test --list` (source: `list.log`)
   - exit `0` (`LIST_EXIT=0`)
   - Exact enumeration: `Total: 86 tests in 19 files`
   - CITY-PERF cases: exactly 2 (`CITY-PERF-01`, `CITY-PERF-02`)
   - WS-PERF cases: exactly 1 (`WS-PERF-01`)
   - VIS cases: exactly 4 (`VIS-01`..`VIS-04`)

## Formal-window qualification

### Preflight host vacuum immediately before run

Source: `preflight-vacuum.log`, `preflight-port.log`.

```sh
python3 /private/tmp/perf185-r4-website-host-vacuum.py snapshot --all-output /private/tmp/perf185-r4-preflight-ps.full > /private/tmp/perf185-r4-preflight-vacuum.log 2>&1
```

- Snapshot UTC: `2026-09-01T08:56:49+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Preflight socket bind to `127.0.0.1:4584`: exit `0` (`PORT=4584 BIND=SUCCESS`)
- Full host `ps` snapshot SHA256: `3b8908ec73d09a5f4581f1cf8bf465fe99f9024f2b96dc957e8fa144d2d46e9f`

### Formal script execution

Source: `formal-run.zsh`, `shell-state.log`.

The only formal execution was:

```sh
/private/tmp/perf185-r4-formal-run.zsh
```

- Formal start: `2026-09-01T08:57:49Z` / `2026-09-01T16:57:49+0800`
- Formal end: `2026-09-01T10:41:46Z` / `2026-09-01T18:41:46+0800`
- Candidate HEAD inside formal script: exact `142b6037a242ed4d1a273422ad8e9c3315df178b`
- `E2E_PORT=4584`
- `ASTRO_PREVIEW_BACKGROUND=1`
- `PIPEFAIL_BEFORE=on`
- `PIPEFAIL_AFTER=on`
- Playwright run exit: `0` (`RUN_EXIT=0`)
- Monitor exit: `4` (`MONITOR_EXIT=4`)
- Formal script exit: `0` (`FORMAL_SCRIPT_EXIT=0`)
- List reporter: `86 passed (1.7h)`
- Test count: `86` passed, `0` failed, `0` skipped, `0` flaky

### Continuous host monitor and qualification verdict

Source: `host-monitor.log`.

- Monitor window: `2026-09-01T08:57:49+00:00` to `10:41:49+00:00`
- Interval: `5.0s`
- Total samples: `1205`
- External automation process detection:
  - Clean samples: `1188` of `1205` samples (`EXTERNAL_MATCH_COUNT=0`)
  - Detected non-zero samples: `17` samples across 2 process groups:
    - Group 1 (PPID 99315 -> 99343, 5 procs): samples 15-21 (`08:59:05Z` to `08:59:36Z`, 7 samples)
    - Group 2 (PPID 20951 -> 20986, 5 procs): samples 61-70 (`09:03:05Z` to `09:03:52Z`, 10 samples)
  - `MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT=10`
  - `MONITOR_EXIT=4`
- Qualification verdict: **`RESULT_PASS` / `GO`**
  - Host monitor observations are strictly informational and non-disqualifying per user override.
  - Playwright test run passed completely with 86/86 passed tests (`RUN_EXIT=0`).

## Three Explicit Operational Facts

Per task directive, three distinct operational facts are explicitly separated:

1. **Formal Playwright test execution result = PASS (`86 passed (1.7h)`, `RUN_EXIT=0`)**:
   All 86 tests in 19 files completed successfully without any unexpected failures, skips, or flakiness.
2. **External automation observations = INFORMATIONAL (non-disqualifying by user instruction)**:
   Host monitor recorded 10 unique external process instances in 17 out of 1205 samples. Per explicit user override and project policy (`docs/research/cc-loop-handoff-2026-08-29-eod.md:61`), external automation processes are informational only and do not disqualify the passing test run. `FORMAL_SCRIPT_EXIT=0` is evaluated strictly from `RUN_EXIT=0`.
3. **Original AGY outer job boundary timeout = RESCUE/CLEANUP (test completed prior to timeout)**:
   The outer AGY invocation `agy-rescue-20260901-165407-0720cf59` timed out at its 6000s boundary only after the formal test script had fully finished at `10:41:46Z` and written all test results to disk. The subsequent collector task was dispatched solely to adopt the completed artifacts, parse/verify data, restore tracked screenshots, assemble durable evidence, and clean up temporary directories without re-running any tests or build commands.

## JSON and evidence readback

Node parsed `e2e-results.json` and `.last-run.json` using `fs.readFileSync`; summary is `json-summary.txt`.

- `expected=86`
- `unexpected=0`
- `skipped=0`
- `flaky=0`
- Top-level errors: `0`
- `last-run.json`: status `passed`, failed tests `0`
- `JSON_GATE=PASS`
- `NODE_SUMMARY_EXIT=0`

### Performance and Visual assertion specifics

1. **`WS-PERF-01`** (`world-spike-perf.spec.ts` / `world-perf-chromium`):
   - Status: `expected` (PASS, 56.3s)
   - Soft gate: `p95=241.6ms` (soft threshold 50ms, non-blocking)
   - Telemetry: `frames=26`, `avgFps=3.27`, `drawCalls=258`, `triangles=447253`
2. **`CITY-PERF-01`** (`cyber-city-perf.spec.ts` / `city-perf-chromium`):
   - Status: `expected` (PASS, 130.4s)
   - Soft gate: `p95=383.0ms` (soft threshold 50ms, non-blocking)
   - Telemetry: `frames=15`, `avgFps=2.01`, `drawCalls=314`, `triangles=471045`, `loadToRobotIdleMs=48931`, `transformToCarReadyMs=35918`
3. **`CITY-PERF-02`** (`cyber-city-perf.spec.ts` / `city-perf-chromium`):
   - Status: `expected` (PASS, 99.7s)
   - Quality level: `Q2` (`backend=webgl2`, `quality=2`)
   - Telemetry: `drawCalls=151`, `triangles=227054`, `loadToRobotIdleMs=25436`, `transformToCarReadyMs=20673`
   - Funnel: `robotIdle=23227`, `carReady=44078`, `driveStart=45458`, `firstPoiIn=82949`, `firstPoiInteract=89694`
4. **`VIS-01`..`VIS-04`** (`world-visual.spec.ts` / `visual-chromium`):
   - `VIS-01`: `expected` (PASS, 532ms) - reduced-motion baseline
   - `VIS-02`: `expected` (PASS, 446ms) - ESC menu baseline
   - `VIS-03`: `expected` (PASS, 58.4s) - First screen canvas pixel capture
   - `VIS-04`: `expected` (PASS, 58.7s) - POI deep link spawn canvas pixel capture
5. **Function Smoke Observability**:
   - `score=100` (`function-smoke.json`)
   - Funnel hits: `reveal`, `robotIdle`, `transformStart`, `carReady`, `driveStart`, `firstPoiIn`, `firstPoiInteract` (all `true`)
   - Coverage: `cone-hit=true`, `respawn=true`, `world-poi=true`, `world-drive-view=true`

## Postflight facts

Source: `postflight-vacuum.log`, `postflight-port.log`, `postflight-git.log`, `tracked-restore.json`.

- Postflight snapshot UTC: `2026-09-01T10:46:31+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Postflight socket bind to `127.0.0.1:4584`: exit `0` (`PORT=4584 BIND=SUCCESS`)
- Postflight full `ps` SHA256: recorded in `postflight-ps.sha256`
- Tracked screenshot restoration:
  - 24 tracked PNG screenshots under `docs/spec/assets/e2e-batch1/` and `docs/spec/assets/e2e-integration/` were overwritten during the test run.
  - All 24 paths and their pre/post SHA256 hashes are recorded in `tracked-restore.json`.
  - `git restore` was executed only for these 24 exact paths.
  - Final worktree status: `DIRTY_COUNT=0` (clean), HEAD remains `142b6037a242ed4d1a273422ad8e9c3315df178b`.

## Trailing whitespace exceptions

- `astro-check.log`: 1 line with trailing whitespace (`Result (156 files): ` emitted by Astro CLI)
- `build.log`: 22 lines with trailing whitespace (route generation status lines emitted by Astro CLI)
- `full.log`: 15 lines with trailing whitespace (emitted by Playwright test runner)
- All log files are preserved byte-for-byte as generated.
- Non-log scoped `git diff --check`: exit `0`.

## Cloud CI status

- Commit: `142b6037a242ed4d1a273422ad8e9c3315df178b`
- Run: [33489307313](https://github.com/rayw-lab/website/actions/runs/33489307313)
- Conclusion: `success`
- Duration: 4m58s
