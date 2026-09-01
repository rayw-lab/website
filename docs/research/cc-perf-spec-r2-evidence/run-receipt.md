# #185 CC-PERF-SPEC R2 local-Mac runtime receipt

## Scope conclusion

This receipt reports runtime facts only. It does **not** make a PR-ready or merge-ready decision.

- Candidate: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Parents, in order: `c43cd7273399c5abbae8d5901abd8924684ea69e e0829b81e24a306793e4349e564187554144959f`
- Candidate tree: `11130788c277541c802feb897c09c8c692cca12a`
- PR #185 branch: `cursor/cc-perf-impl-a-0fc2`
- Subject: `Merge remote-tracking branch 'origin/main' into HEAD`
- Commit time: `2026-08-31T01:20:21+08:00`
- Final remote main readback: `af7fb6fa9fadb763fd27bd37425610c1ea79c19a`
- Final remote #185 readback: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Runtime host: local Mac, not a cloud VM
- Worktree: `/private/tmp/perf185-r2`
- Formal PID: `50209`
- Port: `4581`
- Qualification outcome: **`RESULT_FAIL` / `NO_GO`** (Playwright test run: `11 passed, 12 failed, 63 did not run`, `RUN_EXIT=1`; continuous host monitor: `5` unique external automation processes detected during formal window in samples 31–35, `MONITOR_EXIT=4`, `FORMAL_SCRIPT_EXIT=1`).

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
   - exit `0` (`INSTALL_EXIT=0`)
2. `pnpm exec astro check` (source: `astro-check.log`)
   - exit `0` (`ASTRO_CHECK_EXIT=0`)
   - Authoritative summary: `156 files`, `0 errors`, `0 warnings`, `58 hints`
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
python3 /private/tmp/perf185-r2-website-host-vacuum.py snapshot --all-output /private/tmp/perf185-r2-preflight-ps.full > /private/tmp/perf185-r2-preflight-vacuum.log 2>&1
```

- Snapshot UTC: `2026-09-01T07:29:52+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Preflight socket bind to `127.0.0.1:4581`: exit `0` (`PORT=4581 BIND=SUCCESS`)
- Full host `ps` snapshot SHA256: `955038ec70aa5a4841a1a2b0e95ca03e00ee4b8686d11f930e46b96e5795cb07`

### Formal script execution

Source: `formal-run.zsh`, `shell-state.log`.

The only formal execution was:

```sh
/private/tmp/perf185-r2-formal-run.zsh
```

- Formal start: `2026-09-01T07:29:55Z` / `2026-09-01T15:29:55+0800`
- Formal end: `2026-09-01T07:46:02Z` / `2026-09-01T15:46:02+0800`
- Candidate HEAD inside formal script: exact `0222b3f15603847ebda47b0346f3eddbafc84772`
- `E2E_PORT=4581`
- `ASTRO_PREVIEW_BACKGROUND=1`
- `PIPEFAIL_BEFORE=on`
- `PIPEFAIL_AFTER=on`
- Playwright run exit: `1` (`RUN_EXIT=1`)
- Monitor exit: `4` (`MONITOR_EXIT=4`)
- Formal script exit: `1` (`FORMAL_SCRIPT_EXIT=1`)
- List reporter: `11 passed, 12 failed, 63 did not run (16.1m)`
- Test count: `11` passed, `12` failed, `63` did not run

### Continuous host monitor and qualification break

Source: `host-monitor.log`.

- Monitor window: `2026-09-01T07:29:55+00:00` to `07:46:06+00:00`
- Interval: `5.0s`
- Total samples: `193`
- External automation process detection:
  - Samples `31–35` recorded `EXTERNAL_MATCH_COUNT=5` (PID 58049 external chrome-headless-shell and 4 child processes)
  - `MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT=5`
  - `MONITOR_EXIT=4`
- Qualification verdict: **`RESULT_FAIL` / `NO_GO`**
  - Host vacuum isolation was broken during the run (external headless chrome processes detected).
  - Playwright test run failed with 12 failures in `desktop-chromium` causing project dependencies for downstream 3D/perf suites to be skipped.

## JSON and evidence readback

Node parsed `e2e-results.json` and `.last-run.json` using `fs.readFileSync`; summary is `json-summary.txt`.

- `expected=11`
- `unexpected=12`
- `skipped=63`
- `flaky=0`
- Top-level errors: `0`
- `last-run.json`: status `failed`, failed tests `12`
- `JSON_GATE=FAIL`

### Performance assertions

- Due to project dependencies in `playwright.config.ts`, `world-perf-chromium` and `city-perf-chromium` projects did not execute because prerequisite `desktop-chromium` failed.
- Files `city-perf-evidence.jsonl`, `session-dump-city-perf.json`, `world-spike-metrics.jsonl` were not generated in this attempt.

## Desktop Chrome exemption basis

Authority: `docs/research/cc-loop-handoff-2026-08-29-eod.md:61`:

> 全量窗一律 `--workers=1`（R2 双 3D 挤兑→preview 崩溃连坐 21 例实证）；开跑前 ps 独占核验（用户桌面 Chrome 常驻属常态，登记勿杀）

The monitor matches automation-specific patterns: `playwright`, `chrome-headless-shell`, `ms-playwright`, `chromedriver`, `vite preview/dev`, `astro preview/dev`. Ordinary user desktop Chrome does not match these patterns and was not counted or touched.

## Postflight facts

Source: `postflight-vacuum.log`, `postflight-port.log`, `postflight-git.log`, `tracked-restore.json`.

- Postflight snapshot UTC: `2026-09-01T07:46:40+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Postflight socket bind to `127.0.0.1:4581`: exit `0` (`PORT=4581 BIND=SUCCESS`)
- Postflight full `ps` SHA256: `3b8d9633c7faad1fa44f3d2f97cfaf000bb70979cbdb6da2f8546b3f7f858807`
- Tracked screenshot restoration:
  - 5 tracked PNG screenshots under `docs/spec/assets/e2e-batch1/` were overwritten during the test run (`lab_index_cards.png`, `mobile_car_blocked_pointer.png`, `mobile_car_ready_375.png`, `mobile_home_375.png`, `mobile_tts_ready_375.png`).
  - All 5 paths and their pre/post SHA256 hashes are recorded in `tracked-restore.json`.
  - `git restore` was executed only for these 5 exact paths.
  - Final worktree status: `DIRTY_COUNT=0` (clean), HEAD remains `0222b3f15603847ebda47b0346f3eddbafc84772`.

## Trailing whitespace exceptions

- `astro-check.log`: 1 line with trailing whitespace (`Result (156 files): ` emitted by Astro CLI)
- `build.log`: 22 lines with trailing whitespace (route generation status lines emitted by Astro CLI)
- `full.log`: 24 lines with trailing whitespace (emitted by Playwright test runner)
- All log files are preserved byte-for-byte as generated.
- Non-log scoped `git diff --check`: exit `0`.

## Cloud CI status

- Commit: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Run: [33325010912](https://github.com/rayw-lab/website/actions/runs/33325010912)
- Conclusion: `success`
- Duration: 4m58s
