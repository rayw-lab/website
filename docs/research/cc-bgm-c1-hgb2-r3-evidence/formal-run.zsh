#!/bin/zsh

set -u
set -o pipefail
umask 077

WORKTREE=/private/tmp/bgm177-r3
RUN_LOG=/tmp/bgm177-r3-hgb2.log
SHELL_LOG=/tmp/bgm177-r3-shell-state.log
MONITOR_LOG=/tmp/bgm177-r3-host-monitor.log
STOP_FILE=/tmp/bgm177-r3-monitor.stop
MONITOR=/tmp/website-host-vacuum.py

if [[ ! -d "$WORKTREE" ]]; then
  print -u2 'R3_WORKTREE_MISSING'
  exit 90
fi

for target in "$RUN_LOG" "$SHELL_LOG" "$MONITOR_LOG" "$STOP_FILE"; do
  if [[ -e "$target" ]]; then
    print -u2 "R3_EVIDENCE_PATH_ALREADY_EXISTS=$target"
    exit 91
  fi
done

cd "$WORKTREE" || exit 92
export E2E_PORT=4561
export ASTRO_PREVIEW_BACKGROUND=1

{
  print "FORMAL_START_UTC=$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  print "FORMAL_START_CST=$(date '+%Y-%m-%dT%H:%M:%S%z')"
  print "FORMAL_ROOT_PID=$$"
  print "PWD=$PWD"
  print "HEAD=$(git rev-parse HEAD)"
  print "E2E_PORT=$E2E_PORT"
  print "ASTRO_PREVIEW_BACKGROUND=$ASTRO_PREVIEW_BACKGROUND"
  if [[ -o pipefail ]]; then
    print 'PIPEFAIL_BEFORE=on'
  else
    print 'PIPEFAIL_BEFORE=off'
    exit 93
  fi
} > "$SHELL_LOG"

python3 "$MONITOR" monitor \
  --allowed-root $$ \
  --stop-file "$STOP_FILE" \
  --interval 5 \
  > "$MONITOR_LOG" 2>&1 &
monitor_pid=$!

pnpm exec playwright test \
  e2e/cyber-city-bgm.spec.ts \
  e2e/cyber-city-audio.spec.ts \
  e2e/cyber-city-minimap.spec.ts \
  --project=world-chromium \
  --no-deps \
  --workers=1 2>&1 | tee "$RUN_LOG"
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
