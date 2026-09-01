# #185 CC-PERF-SPEC R1 local-Mac runtime receipt

## Scope conclusion

This receipt reports runtime facts only. It does **not** make a PR-ready or merge-ready decision.

- Candidate: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Parents, in order: `c43cd7273399c5abbae8d5901abd8924684ea69e e0829b81e24a306793e4349e564187554144959f`
- Candidate tree: `11130788c277541c802feb897c09c8c692cca12a`
- PR #185 branch: `cursor/cc-perf-impl-a-0fc2`
- Subject: `Merge remote-tracking branch 'origin/main' into HEAD`
- Commit time: `2026-08-31T01:20:21+08:00`
- Final remote main readback: `e0829b81e24a306793e4349e564187554144959f`
- Final remote #185 readback: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Runtime host: local Mac, not a cloud VM
- Worktree: `/private/tmp/perf185-r1`
- Formal PID: `52085`
- Port: `4571`
- Qualification outcome: **`NO_GO` / `RESULT_PASS_BUT_QUALIFICATION_FAIL`** (Playwright test run: `86 passed`, `RUN_EXIT=0`; continuous host monitor: `40` unique external automation processes detected during formal window, `MONITOR_EXIT=4`, `FORMAL_SCRIPT_EXIT=1`).

No test retry/rerun, second attempt, push to candidate, repository edit on main, trace/video generation, or `node_modules`/`dist` copy was performed.

## Host fingerprint and environment

Source: `host-fingerprint.log`.

- macOS `26.6.2`, build `25G82`
- Darwin `25.6.0`, arm64
- Node `v25.9.0`
- pnpm `10.33.3`
- Playwright `1.62.1`
- Disk: `247GiB` available (`/dev/disk3s5` on `/System/Volumes/Data`)
- Candidate worktree was clean before all checks
- `git diff --check` against main parent: exit `0`, empty output

## Build and enumeration facts

1. `pnpm install --frozen-lockfile` (source: `install.log`)
   - `2026-08-30T17:21:04Z` to `17:21:07Z` (CST `01:21:04`–`01:21:07`)
   - exit `0` (`INSTALL_EXIT=0`)
2. `pnpm exec astro check` (source: `astro-check.log`)
   - `2026-08-30T17:21:21Z` to `17:21:28Z`
   - exit `0` (`ASTRO_CHECK_EXIT=0`)
   - Authoritative summary: `156 files`, `0 errors`, `0 warnings`, `58 hints`
3. `pnpm build` (source: `build.log`)
   - `2026-08-30T17:21:32Z`
   - exit `0` (`BUILD_EXIT=0`)
   - `19 page(s) built`; build complete
   - Non-blocking Vite chunk-size advisory on bundles > 500 kB
4. Fresh `pnpm exec playwright test --list` (source: `list.log`)
   - `2026-08-30T17:21:42Z`
   - exit `0` (`LIST_EXIT=0`)
   - Exact enumeration: `Total: 86 tests in 19 files`

## Formal-window qualification

### Preflight host vacuum immediately before run

Source: `preflight-vacuum.log`, `preflight-port.log`.

```sh
python3 /private/tmp/perf185-r1-website-host-vacuum.py snapshot --all-output /private/tmp/perf185-r1-preflight-ps.full > /private/tmp/perf185-r1-preflight-vacuum.log 2>&1
```

- Snapshot UTC: `2026-08-30T17:25:33+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Preflight socket bind to `127.0.0.1:4571`: exit `0` (`PORT=4571 BIND=SUCCESS`)
- Full host `ps` snapshot SHA256: `e23aaecde056a3f9ab756b2f0156082bc7b946913f59de4ee5f6179acd44a63a`

### Formal script execution

Source: `formal-run.zsh`, `shell-state.log`.

The only formal execution was:

```sh
/private/tmp/perf185-r1-formal-run.zsh
```

- Formal start: `2026-08-30T17:25:33Z` / `2026-08-31T01:25:33+0800`
- Formal end: `2026-08-30T18:33:22Z` / `2026-08-31T02:33:22+0800`
- Candidate HEAD inside formal script: exact `0222b3f15603847ebda47b0346f3eddbafc84772`
- `E2E_PORT=4571`
- `ASTRO_PREVIEW_BACKGROUND=1`
- `PIPEFAIL_BEFORE=on`
- `PIPEFAIL_AFTER=on`
- Playwright run exit: `0` (`RUN_EXIT=0`)
- Monitor exit: `4` (`MONITOR_EXIT=4`)
- Formal script exit: `1` (`FORMAL_SCRIPT_EXIT=1`)
- List reporter: `86 passed (1.1h)`
- Test count: `86` passed, `0` failed, `0` skipped, `0` flaky

### Continuous host monitor and qualification break

Source: `host-monitor.log`.

- Monitor window: `2026-08-30T17:25:33+00:00` to `18:33:25+00:00`
- Interval: `5.0s`
- Total samples: `807`
- External automation process detection:
  - Samples `264–266`, `313–317`, `328–330`, `469–473`, `483–499`, `510–516`, `635–678`, `685–694` recorded `EXTERNAL_MATCH_COUNT > 0`
  - `MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT=40`
  - `MONITOR_EXIT=4`
- Qualification verdict: **`RESULT_FAIL` / `NO_GO` / `RESULT_PASS_BUT_QUALIFICATION_FAIL`**
  - Per #182 and host isolation discipline, external automation matches cannot be exempted by ownership.
  - The formal test execution achieved `86/86 PASS` (`RUN_EXIT=0`), but host vacuum isolation was broken during the run.

## JSON and evidence readback

Node parsed `e2e-results.json` and `.last-run.json` using `fs.readFileSync`; summary is `json-summary.txt`.

- `expected=86`
- `unexpected=0`
- `skipped=0`
- `flaky=0`
- Top-level errors: `0`
- `last-run.json`: status `passed`, failed tests `0`
- 86 tests total, every test status `passed`, every test result count `1`, retry `0`
- `JSON_GATE=PASS`

### Performance assertions

- `WS-PERF-01`: passed
- `CITY-PERF-01`: passed
  - `meter.fps.avg`: `2.135748152577848` (> 0)
  - `meter.fps.low1`: `0.0674458915334359` (> 0)
  - `hud.fpsText`: `null`
  - `hud.cityShellNoHudFps`: `true`
  - `sampling`: `frames=15, durationMs=5197, p95Ms=400, stallRatio=0.933` (SwiftShader expected telemetry)
- `CITY-PERF-02`: passed
  - `env.quality`: `2`
  - Funnel: `robotIdle=22424, carReady=42610, driveStart=43726, firstPoiIn=78561, firstPoiInteract=85711`
- Associated files on record: `session-dump-city-perf.json`, `world-spike-metrics.jsonl`, `city-perf-evidence.jsonl`.

## Desktop Chrome exemption basis

Authority: `docs/research/cc-loop-handoff-2026-08-29-eod.md:61`:

> 全量窗一律 `--workers=1`（R2 双 3D 挤兑→preview 崩溃连坐 21 例实证）；开跑前 ps 独占核验（用户桌面 Chrome 常驻属常态，登记勿杀）

The monitor matches automation-specific patterns: `playwright`, `chrome-headless-shell`, `ms-playwright`, `chromedriver`, `vite preview/dev`, `astro preview/dev`. Ordinary user desktop Chrome does not match these patterns and was not counted or touched.

## Postflight facts

Source: `postflight-vacuum.log`, `postflight-port.log`, `postflight-git.log`, `tracked-restore.json`.

- Postflight snapshot UTC: `2026-09-01T06:40:56+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Postflight socket bind to `127.0.0.1:4571`: exit `0` (`PORT=4571 BIND=SUCCESS`)
- Postflight full `ps` SHA256: `6d5b54d977e28a79a0e6feb0bedf7b57668de3c1491858ec0c5cb1fbbbea46b3`
- Tracked screenshot restoration:
  - 24 tracked PNG screenshots under `docs/spec/assets/` were overwritten during the test run.
  - All 24 paths and their pre/post SHA256 hashes are recorded in `tracked-restore.json`.
  - `git restore` was executed only for these 24 exact paths.
  - Final worktree status: `DIRTY_COUNT=0` (clean), HEAD remains `0222b3f15603847ebda47b0346f3eddbafc84772`.

## Trailing whitespace exceptions

- `astro-check.log`: 1 line with trailing whitespace (`Result (156 files): ` emitted by Astro CLI)
- `build.log`: 22 lines with trailing whitespace (route generation status lines emitted by Astro CLI)
- Both files are preserved byte-for-byte as generated.
- All other logs have 0 trailing whitespace lines.
- Non-log scoped `git diff --check`: exit `0`.

## Cloud CI status

- Commit: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Run: [33325010912](https://github.com/rayw-lab/website/actions/runs/33325010912)
- Conclusion: `success`
- Duration: 4m58s
