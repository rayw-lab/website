# #177 HG-B2 R3 local-Mac runtime receipt

## Scope conclusion

This receipt reports runtime facts only. It does **not** make a PR-ready or merge-ready decision.

- Candidate: `fe46a4f604791e7bf71275efdf3e33e2d3011edf`
- Parents, in order: `d0189262e623a9f67fea5d275db922b818844292 9948bc1f222bbb080e0d03b259f89ebf2c9a970c`
- Tree: `109837e4394bafb2172337787167c24d04e84663`
- Subject: `Merge main R2 evidence ledger into CC-BGM-C1`
- Commit time: `2026-08-30T23:00:38+08:00`
- Final remote main readback: `9948bc1f222bbb080e0d03b259f89ebf2c9a970c`
- Final remote #177 readback: `fe46a4f604791e7bf71275efdf3e33e2d3011edf`
- Runtime host: local Mac, not a cloud VM
- Worktree: `/private/tmp/bgm177-r3`, retained for controller evidence upload/cleanup

No test retry/rerun, second worktree, push, PR/comment action, repository edit, trace/video generation, or `node_modules`/`dist` copy was performed.

## Host fingerprint and disk gate

Source: `/tmp/bgm177-r3-host-fingerprint.log`.

- macOS `26.6.2`, build `25G82`
- Darwin `25.6.0`, arm64
- Node `v25.9.0`
- pnpm `10.33.3`
- Playwright `1.62.1`
- Setup-time disk: `240GiB` available (`251811900 KiB`)
- Evidence-build-time disk: `246GiB` available
- Candidate worktree was clean before all checks
- `git diff --check` against first parent: exit `0`, empty output
- `git diff --check` against main parent: exit `0`, empty output

## Build and enumeration facts

1. `pnpm install --frozen-lockfile`
   - `2026-08-30T15:27:21Z` to `15:28:46Z`
   - exit `0`
2. `pnpm exec astro check`
   - `2026-08-30T15:28:52Z` to `15:28:59Z`
   - exit `0`
   - authoritative summary: `156 files`, `0 errors`, `0 warnings`, `58 hints`
3. `pnpm build`
   - `2026-08-30T15:29:21Z` to `15:29:23Z`
   - exit `0`
   - `19 page(s) built`; build complete
   - build output also contains the non-blocking Vite chunk-size advisory
4. Fresh `pnpm exec playwright test --list`
   - `2026-08-30T15:29:32Z` to `15:29:33Z`
   - exit `0`
   - exact enumeration: `Total: 86 tests in 19 files`

## Static P0 and three-contract facts

Source: `/tmp/bgm177-r3-static-proof.log`.

- `39 type|41 type` in the three current contract files: `0` hits
  - `src/lab/world/core/SessionTimeline.ts`
  - `docs/spec/cyber-city-observability.md`
  - `docs/research/cyber-city-test-framework.md`
- `this.busGain.gain.value =`: `0` hits
- `busGain` automation writes:
  - `setValueAtTime`: exactly `1`
  - `setTargetAtTime`: exactly `1`
- `transition:` / `animation:` declarations in `BgmLoop.ts`: `0` hits
- Static proof exit: `0`

## Formal-window qualification

### Host vacuum immediately before run

The exact required snapshot command was run:

```sh
python3 /tmp/website-host-vacuum.py snapshot --all-output /tmp/bgm177-r3-preflight-ps-all.log > /tmp/bgm177-r3-preflight-vacuum.log 2>&1
```

- Snapshot UTC: `2026-08-30T15:30:13+00:00`
- Snapshot exit: `0`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Full host `ps` snapshot SHA256: `a186a269cc290c02309aca5af39fd4d27ac18da658ebe2503a8acdb80503ab9e`
- Full `ps` file remains at `/tmp/bgm177-r3-preflight-ps-all.log`; it was not copied into the compact evidence package

### Port and immutable helpers

- Preflight bind to `127.0.0.1:4561`: exit `0`
- Formal script SHA256: `44dc75e00d2178c94f42c8a206380aae322ac406839cafe9acf1be7fe03f192f`
- Monitor script `/tmp/website-host-vacuum.py` SHA256: `4fe72478c9a7e594dac4f75a7561c6664687dd6a22f047a5370d0fa2ce6c50cc`
- `zsh -n /tmp/bgm177-r3-formal-run.zsh`: exit `0`

## Single formal run facts

The only formal execution was:

```sh
/tmp/bgm177-r3-formal-run.zsh
```

No outer tee or wrapper was used.

- Formal start: `2026-08-30T15:30:44Z` / `2026-08-30T23:30:44+08:00`
- Formal end: `2026-08-30T15:43:11Z` / `2026-08-30T23:43:11+08:00`
- Candidate HEAD inside formal script: exact `fe46a4f604791e7bf71275efdf3e33e2d3011edf`
- `E2E_PORT=4561`
- `ASTRO_PREVIEW_BACKGROUND=1`
- `PIPEFAIL_BEFORE=on`
- `PIPEFAIL_AFTER=on`
- Playwright run exit: `0`
- Monitor exit: `0`
- Formal script exit: `0`
- List reporter: `6 passed (12.4m)`
- Composition: AUD `1`, BGM `2`, NAV `3`

### Five-second host monitor

Source: `/tmp/bgm177-r3-host-monitor.log`.

- Monitor window: `2026-08-30T15:30:44+00:00` to `15:43:12+00:00`
- Interval: `5.0s`
- Samples: `148`
- Every sample: `EXTERNAL_MATCH_COUNT=0`
- `MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT=0`

This monitor is the qualification source for external automation during the formal run.

## JSON and last-run readback

Node parsed both files using `fs.readFileSync`; output is `/tmp/bgm177-r3-json-summary.txt`.

- `expected=6`
- `unexpected=0`
- `skipped=0`
- `flaky=0`
- top-level errors `0`
- last-run status `passed`
- last-run failed tests `0`
- six tests total
- every test status `passed`
- every test result count `1`
- `JSON_GATE=PASS`

The six complete titles, projects, files, statuses, and result counts are in `json-summary.txt` in the compact evidence package.

## Desktop Chrome exemption and automation matching basis

Authority: `docs/research/cc-loop-handoff-2026-08-29-eod.md:61`:

> 全量窗一律 `--workers=1`（R2 双 3D 挤兑→preview 崩溃连坐 21 例实证）；开跑前 ps 独占核验（用户桌面 Chrome 常驻属常态，登记勿杀）

The immutable monitor's relevant-process patterns are:

- `playwright`
- `chrome-headless-shell`
- `ms-playwright`
- `chromedriver`
- Vite command lines containing `preview` or `dev`
- Astro command lines containing `preview` or `dev`

Snapshot mode excludes the probe's own lineage. Monitor mode excludes descendants of the allowed formal root plus the monitor's own lineage. Ordinary desktop Chrome does not match these automation-specific patterns and was neither counted nor touched. Antigravity, WPS, ordinary Chrome, and all unrelated user processes were no-touch.

## Postflight

- Snapshot UTC: `2026-08-30T15:44:16+00:00`
- `HOST_RELEVANT_MATCH_COUNT=0`
- Snapshot exit: `0`
- Full postflight `ps` SHA256: `f81303d9fe6b19f9844f646e4522bdee45dfdb715128297be01cac05869229ea`
- Full postflight `ps` remains at `/tmp/bgm177-r3-postflight-ps-all.log`; it was not copied into the compact evidence package
- Final bind to `127.0.0.1:4561`: exit `0`
- Worktree porcelain count: `0`
- Tracked overwrite count: `0`
- Restore action: none required
- No process was killed

## Compact evidence package

Path: `/tmp/bgm177-r3-evidence/`.

Included:

- immutable formal and monitor scripts
- setup/install/Astro/build/list/static logs
- preflight summaries and port evidence, but not full `ps`
- shell state, 148-sample host monitor, formal HGB2 log
- JSON reporter, last-run, Node JSON summary
- postflight summaries, port and porcelain evidence, but not full `ps`
- source/log SHA256 manifests
- EOD line 61 and host fingerprint
- five NAV screenshots actually generated by the passing tests
- this receipt

Excluded:

- `node_modules`
- `dist`
- HTML report duplication
- full preflight/postflight `ps` copies
- trace/video files

## Hash manifests

- Source/input manifest: `/tmp/bgm177-r3-source-sha256.txt`
- Original log manifest: `/tmp/bgm177-r3-log-sha256.txt`
- Compact evidence manifest: `/tmp/bgm177-r3-evidence/SHA256SUMS.txt`

## Proof class and residual facts

- Proof class: fresh local-Mac candidate production build plus Playwright Chromium runtime integration under a continuous host-wide automation monitor.
- Not production deployment, public publication, human-device acceptance, or a ready/merge verdict.
- Residual output: Astro reports 58 hints while its authoritative error/warning summary is `0/0`; build emits a non-blocking Vite chunk-size advisory.
