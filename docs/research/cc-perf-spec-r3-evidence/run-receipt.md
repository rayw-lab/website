# #185 CC-PERF-SPEC R3 local-Mac runtime receipt

## Scope conclusion

This receipt reports runtime facts only. It does **not** make a PR-ready or merge-ready decision.

- Candidate: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Parents, in order: `c43cd7273399c5abbae8d5901abd8924684ea69e e0829b81e24a306793e4349e564187554144959f`
- Candidate tree: `11130788c277541c802feb897c09c8c692cca12a`
- PR #185 branch: `cursor/cc-perf-impl-a-0fc2`
- Subject: `Merge remote-tracking branch 'origin/main' into HEAD`
- Commit time: `2026-08-31T01:20:21+08:00`
- Final remote main readback: `79134840d2ad96c08a4c543f1ec11a0f0febe21c`
- Intervening delta between #185 integrated main parent `e0829b81...` and current main `7913484...`: docs-only (verified 0 code/config/asset differences)
- Final remote #185 readback: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Runtime host: local Mac, not a cloud VM
- Worktree: `/private/tmp/perf185-r3`
- Formal PID: `19168`
- Port: `4582`
- Qualification outcome: **`RESULT_FAIL` / `NO_GO`** (Playwright test run: `16 passed, 7 failed, 63 did not run`, `RUN_EXIT=1`; continuous host monitor: `0` external automation processes detected during formal window in 92 samples, `MONITOR_EXIT=0`, `FORMAL_SCRIPT_EXIT=1`).

No test retry/rerun, second attempt, push to candidate, repository edit on main, trace/video generation, or `node_modules`/`dist` copy was performed.

## Host fingerprint and environment

Source: `host-fingerprint.log`.

- macOS `26.6.2`, build `25G82`
- Darwin `25.6.0`, arm64
- Node `v25.9.0`
- pnpm `10.33.3`
- Playwright `1.62.1`
- Disk: `248GiB` available (`/dev/disk3s5` on `/System/Volumes/Data`)
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
python3 /private/tmp/perf185-r3-website-host-vacuum.py snapshot --all-output /private/tmp/perf185-r3-preflight-ps.full > /private/tmp/perf185-r3-preflight-vacuum.log 2>&1
```

- Snapshot UTC: `2026-09-01T08:18:14+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Preflight socket bind to `127.0.0.1:4582`: exit `0` (`PORT=4582 BIND=SUCCESS`)
- Full host `ps` snapshot SHA256: `9a1800b182d3be956be252a3010210e19288596c27eb99a0e97be03d91d1ab43`

### Formal script execution

Source: `formal-run.zsh`, `shell-state.log`.

The only formal execution was:

```sh
/private/tmp/perf185-r3-formal-run.zsh
```

- Formal start: `2026-09-01T08:18:22Z` / `2026-09-01T16:18:22+0800`
- Formal end: `2026-09-01T08:25:58Z` / `2026-09-01T16:25:58+0800`
- Candidate HEAD inside formal script: exact `0222b3f15603847ebda47b0346f3eddbafc84772`
- `E2E_PORT=4582`
- `ASTRO_PREVIEW_BACKGROUND=1`
- `PIPEFAIL_BEFORE=on`
- `PIPEFAIL_AFTER=on`
- Playwright run exit: `1` (`RUN_EXIT=1`)
- Monitor exit: `0` (`MONITOR_EXIT=0`)
- Formal script exit: `1` (`FORMAL_SCRIPT_EXIT=1`)
- List reporter: `16 passed, 7 failed, 63 did not run (7.6m)`
- Test count: `16` passed, `7` failed, `63` did not run

### Continuous host monitor and qualification verdict

Source: `host-monitor.log`.

- Monitor window: `2026-09-01T08:18:22+00:00` to `08:26:02+00:00`
- Interval: `5.0s`
- Total samples: `92`
- External automation process detection:
  - Samples 1–92: `EXTERNAL_MATCH_COUNT=0`
  - `MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT=0`
  - `MONITOR_EXIT=0`
- Qualification verdict: **`RESULT_FAIL` / `NO_GO`**
  - Host monitor recorded 0 external automation processes.
  - Playwright test run failed with 7 failures in `desktop-chromium` (navigation and page timeouts), causing downstream project dependencies for car, world, perf, and visual suites to be skipped.

## JSON and evidence readback

Node parsed `e2e-results.json` and `.last-run.json` using `fs.readFileSync`; summary is `json-summary.txt`.

- `expected=16`
- `unexpected=7`
- `skipped=63`
- `flaky=0`
- Top-level errors: `0`
- `last-run.json`: status `failed`, failed tests `7`
- `JSON_GATE=FAIL`

Failed test details (7 in `desktop-chromium`):
1. `home.spec.ts` — `HOME-E2E-01 骨架与 SEO 基础：title / h1 / skip-link / canonical` (page.goto timeout)
2. `home.spec.ts` — `HOME-E2E-02 顶部导航：品牌 + 五栏目链接均带 base 前缀` (page.goto timeout)
3. `home.spec.ts` — `HOME-E2E-03 主题切换：html.dark 写入 + localStorage 持久化 + 刷新不回退` (page.goto timeout)
4. `home.spec.ts` — `HOME-E2E-04 Lab 证据区：两张 Demo 卡指向 /lab/ 详情页且海报可加载` (page.goto timeout)
5. `lab-index.spec.ts` — `LAB-E2E-02 海报可加载且 view-transition-name 与详情页舞台配对（§9.3 morph 注册表）` (view-transition-name match timeout)
6. `site-health.spec.ts` — `SITE-E2E-01 内链爬取：已交付路由全部 200；待交付路由精确命中白名单且必须仍为 404` (page.goto timeout)
7. `tts-cockpit.spec.ts` — `TTS-E2E-01 facade 生命周期：poster → 自动挂载 ready → 覆盖层淡出 → 控制面解除 inert` (page.goto timeout)

### Performance assertions

- Due to project dependencies in `playwright.config.ts`, `world-perf-chromium` and `city-perf-chromium` projects did not execute because prerequisite `desktop-chromium` failed.
- Files `city-perf-evidence.jsonl`, `session-dump-city-perf.json`, `world-spike-metrics.jsonl` were not generated in this attempt.
- `CITY-PERF-01`, `CITY-PERF-02`, and `WS-PERF-01` did not execute in this attempt.

## User Concurrency Override and Desktop Chrome Exemption

Authority: User R3 task directive and `docs/research/cc-loop-handoff-2026-08-29-eod.md:61`:

> 全量窗一律 `--workers=1`（R2 双 3D 挤兑→preview 崩溃连坐 21 例实证）；开跑前 ps 独占核验（用户桌面 Chrome 常驻属常态，登记勿杀）

Per the user's explicit override for R3:
- External automation processes are logged continuously for full host transparency but are strictly informational and do not disqualify the run or cause the formal script to exit nonzero.
- The release gate is evaluated strictly on the candidate's Playwright test execution results.
- In this R3 attempt, 0 external automation processes were detected (`MONITOR_EXIT=0`), and the run verdict is `RESULT_FAIL` solely due to Playwright test failures (`RUN_EXIT=1`).

## Postflight facts

Source: `postflight-vacuum.log`, `postflight-port.log`, `postflight-git.log`, `tracked-restore.json`.

- Postflight snapshot UTC: `2026-09-01T08:26:45+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Postflight socket bind to `127.0.0.1:4582`: exit `0` (`PORT=4582 BIND=SUCCESS`)
- Postflight full `ps` SHA256: `184f7fffc8cd8c59759500e6db5467c31008f4c791c73a270e921c1301546194`
- Tracked screenshot restoration:
  - 8 tracked PNG screenshots under `docs/spec/assets/e2e-batch1/` were overwritten during the test run (`lab_index_cards.png`, `mobile_car_blocked_pointer.png`, `mobile_car_ready_375.png`, `mobile_home_375.png`, `mobile_tts_ready_375.png`, `tts_blocked_reduced_motion.png`, `tts_deeplink_ar_rtl_park.png`, `tts_playing_zh_nav.png`).
  - All 8 paths and their pre/post SHA256 hashes are recorded in `tracked-restore.json`.
  - `git restore` was executed only for these 8 exact paths.
  - Final worktree status: `DIRTY_COUNT=0` (clean), HEAD remains `0222b3f15603847ebda47b0346f3eddbafc84772`.

## Trailing whitespace exceptions

- `astro-check.log`: 1 line with trailing whitespace (`Result (156 files): ` emitted by Astro CLI)
- `build.log`: 22 lines with trailing whitespace (route generation status lines emitted by Astro CLI)
- `full.log`: 15 lines with trailing whitespace (emitted by Playwright test runner)
- All log files are preserved byte-for-byte as generated.
- Non-log scoped `git diff --check`: exit `0`.

## Cloud CI status

- Commit: `0222b3f15603847ebda47b0346f3eddbafc84772`
- Run: [33325010912](https://github.com/rayw-lab/website/actions/runs/33325010912)
- Conclusion: `success`
- Duration: 4m58s
