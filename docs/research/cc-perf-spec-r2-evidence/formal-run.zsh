#!/bin/zsh

set -u
set -o pipefail
umask 077

WORKTREE=/private/tmp/perf185-r2
EXPECTED_HEAD=0222b3f15603847ebda47b0346f3eddbafc84772
RUN_LOG=/private/tmp/perf185-r2-full.log
SHELL_LOG=/private/tmp/perf185-r2-shell-state.log
MONITOR_LOG=/private/tmp/perf185-r2-host-monitor.log
STOP_FILE=/private/tmp/perf185-r2-monitor.stop
MONITOR=/private/tmp/perf185-r2-website-host-vacuum.py

if [[ ! -d "$WORKTREE" ]]; then
  print -u2 'PERF185_WORKTREE_MISSING'
  exit 90
fi

for target in \
  "$RUN_LOG" \
  "$SHELL_LOG" \
  "$MONITOR_LOG" \
  "$STOP_FILE" \
  "$WORKTREE/test-results/e2e-results.json" \
  "$WORKTREE/test-results/.last-run.json" \
  "$WORKTREE/test-results/city-perf-evidence.jsonl" \
  "$WORKTREE/test-results/session-dump-city-perf.json" \
  "$WORKTREE/test-results/world-spike-metrics.jsonl"; do
  if [[ -e "$target" ]]; then
    print -u2 "PERF185_EVIDENCE_PATH_ALREADY_EXISTS=$target"
    exit 91
  fi
done

cd "$WORKTREE" || exit 92
if [[ "$(git rev-parse HEAD)" != "$EXPECTED_HEAD" ]]; then
  print -u2 "PERF185_HEAD_MISMATCH=$(git rev-parse HEAD)"
  exit 93
fi

unset CI
export E2E_PORT=4581
export ASTRO_PREVIEW_BACKGROUND=1

{
  print "FORMAL_START_UTC=$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  print "FORMAL_START_CST=$(date '+%Y-%m-%dT%H:%M:%S%z')"
  print "FORMAL_ROOT_PID=$$"
  print "PWD=$PWD"
  print "HEAD=$(git rev-parse HEAD)"
  print "E2E_PORT=$E2E_PORT"
  print "ASTRO_PREVIEW_BACKGROUND=$ASTRO_PREVIEW_BACKGROUND"
  print 'CI=UNSET'
  print 'WORKERS=1'
  print 'RETRIES=0'
  if [[ -o pipefail ]]; then
    print 'PIPEFAIL_BEFORE=on'
  else
    print 'PIPEFAIL_BEFORE=off'
    exit 94
  fi
} > "$SHELL_LOG"

python3 "$MONITOR" monitor \
  --allowed-root $$ \
  --stop-file "$STOP_FILE" \
  --interval 5 \
  > "$MONITOR_LOG" 2>&1 &
monitor_pid=$!

pnpm exec playwright test --workers=1 --retries=0 2>&1 | tee "$RUN_LOG"
run_exit=$?
print "EXIT=$run_exit" | tee -a "$RUN_LOG"

{
  print "FORMAL_END_UTC=$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  print "FORMAL_END_CST=$(date '+%Y-%m-%dT%H:%M:%S%z')"
  if [[ -o pipefail ]]; then
    print 'PIPEFAIL_AFTER=on'
  else
    print 'PIPEFAIL_AFTER=off'
  fi
  print "RUN_EXIT=$run_exit"
} >> "$SHELL_LOG"

: > "$STOP_FILE"
wait "$monitor_pid"
monitor_exit=$?

{
  print "MONITOR_PID=$monitor_pid"
  print "MONITOR_EXIT=$monitor_exit"
  print "FORMAL_SCRIPT_EXIT=$(( run_exit == 0 && monitor_exit == 0 ? 0 : 1 ))"
} >> "$SHELL_LOG"

if (( run_exit == 0 && monitor_exit == 0 )); then
  exit 0
fi
exit 1
