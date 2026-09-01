#!/usr/bin/env python3
"""Host-wide browser/runtime vacuum probe for website integration lanes."""

from __future__ import annotations

import argparse
import datetime as dt
import os
from pathlib import Path
import re
import subprocess
import sys
import time


PATTERNS = (
    re.compile(r"\bplaywright\b", re.I),
    re.compile(r"chrome-headless-shell", re.I),
    re.compile(r"ms-playwright", re.I),
    re.compile(r"\bchromedriver\b", re.I),
    re.compile(r"\bvite(?:\.m?js)?\b.*\b(?:preview|dev)\b", re.I),
    re.compile(r"\bastro(?:\.m?js)?\b.*\b(?:preview|dev)\b", re.I),
)


def now_utc() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def read_table() -> tuple[str, dict[int, tuple[int, str, str]]]:
    proc = subprocess.run(
        ["ps", "-axo", "pid=,ppid=,etime=,command="],
        check=True,
        text=True,
        capture_output=True,
    )
    table: dict[int, tuple[int, str, str]] = {}
    for raw in proc.stdout.splitlines():
        parts = raw.strip().split(None, 3)
        if len(parts) != 4:
            continue
        pid_s, ppid_s, etime, command = parts
        try:
            table[int(pid_s)] = (int(ppid_s), etime, command)
        except ValueError:
            continue
    return proc.stdout, table


def lineage(pid: int, table: dict[int, tuple[int, str, str]]) -> set[int]:
    result: set[int] = set()
    current = pid
    while current and current not in result:
        result.add(current)
        row = table.get(current)
        if row is None:
            break
        current = row[0]
    return result


def descendants(root: int, table: dict[int, tuple[int, str, str]]) -> set[int]:
    result = {root}
    changed = True
    while changed:
        changed = False
        for pid, (ppid, _etime, _command) in table.items():
            if ppid in result and pid not in result:
                result.add(pid)
                changed = True
    return result


def relevant(command: str) -> bool:
    return any(pattern.search(command) for pattern in PATTERNS)


def external_matches(
    table: dict[int, tuple[int, str, str]], allowed: set[int]
) -> list[tuple[int, int, str, str]]:
    matches: list[tuple[int, int, str, str]] = []
    for pid, (ppid, etime, command) in sorted(table.items()):
        if pid in allowed:
            continue
        if relevant(command):
            matches.append((pid, ppid, etime, command))
    return matches


def print_matches(matches: list[tuple[int, int, str, str]]) -> None:
    for pid, ppid, etime, command in matches:
        print(f"PID={pid} PPID={ppid} ETIME={etime} COMMAND={command}")


def snapshot(args: argparse.Namespace) -> int:
    raw, table = read_table()
    allowed = lineage(os.getpid(), table)
    matches = external_matches(table, allowed)
    if args.all_output:
        target = Path(args.all_output)
        target.write_text(raw, encoding="utf-8")
        target.chmod(0o600)
    print(f"SNAPSHOT_UTC={now_utc()}")
    print(f"HOST_RELEVANT_MATCH_COUNT={len(matches)}")
    print_matches(matches)
    return 0 if not matches else 3


def monitor(args: argparse.Namespace) -> int:
    stop_file = Path(args.stop_file)
    samples = 0
    seen: dict[tuple[int, str], tuple[int, str]] = {}
    print(f"MONITOR_START_UTC={now_utc()}", flush=True)
    print(f"ALLOWED_ROOT_PID={args.allowed_root}", flush=True)
    print(f"INTERVAL_SECONDS={args.interval}", flush=True)
    while True:
        _raw, table = read_table()
        allowed = descendants(args.allowed_root, table)
        allowed.update(lineage(os.getpid(), table))
        matches = external_matches(table, allowed)
        samples += 1
        print(
            f"SAMPLE={samples} UTC={now_utc()} EXTERNAL_MATCH_COUNT={len(matches)}",
            flush=True,
        )
        for pid, ppid, etime, command in matches:
            seen[(pid, command)] = (ppid, etime)
            print(
                f"EXTERNAL PID={pid} PPID={ppid} ETIME={etime} COMMAND={command}",
                flush=True,
            )
        if stop_file.exists():
            break
        time.sleep(args.interval)
    print(f"MONITOR_END_UTC={now_utc()}", flush=True)
    print(f"MONITOR_SAMPLE_COUNT={samples}", flush=True)
    print(f"MONITOR_UNIQUE_EXTERNAL_MATCH_COUNT={len(seen)}", flush=True)
    return 0 if not seen else 4


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="mode", required=True)

    snap = subparsers.add_parser("snapshot")
    snap.add_argument("--all-output")
    snap.set_defaults(handler=snapshot)

    mon = subparsers.add_parser("monitor")
    mon.add_argument("--allowed-root", type=int, required=True)
    mon.add_argument("--stop-file", required=True)
    mon.add_argument("--interval", type=float, default=5.0)
    mon.set_defaults(handler=monitor)
    return parser


def main() -> int:
    os.umask(0o077)
    args = build_parser().parse_args()
    return args.handler(args)


if __name__ == "__main__":
    sys.exit(main())
