#!/usr/bin/env python3
"""ABOUT-HALL static-frame machine gate (WBS-01 §3 hard gates 1–3).

usage: about-hall-frame-gate.py <first.png> <last.png> [--neg-frac 0.33] [--subject-min-x 0.60] [--out GATE.json]

Gate 1  text-bed darkness (v2, ADR-1 §5 allows the bridge to recede into the left third): within x < neg_frac*W,
        mean luminance <= 70 and 95th-percentile luminance <= 170 (DOM copy stays legible with a light scrim).
Gate 2  person extent (v2): leftmost column of the skin-tone mask (YCbCr skin range, morphological min-area) must be >= subject_min_x*W.
        Bridge/cables are allowed left of the person; only the person is constrained.
Gate 3  same-world: mean RGB difference per channel in the left negative region between first and last <= 6.
Outputs JSON with measured values and PASS/FAIL per gate. Exit 0 only when all pass.
"""
import argparse
import json
import sys

import numpy as np
from PIL import Image


def load(p):
    return np.asarray(Image.open(p).convert("RGB"), dtype=np.float32)


def luminance(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def saturation(a):
    mx = a.max(axis=-1)
    mn = a.min(axis=-1)
    return np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)


def gate(first, last, neg_frac, subject_min_x):
    H, W, _ = first.shape
    nx = int(W * neg_frac)
    out = {"W": W, "H": H, "neg_frac": neg_frac, "subject_min_x": subject_min_x}

    lum = luminance(first)
    left = lum[:, :nx]
    mean_l, p95 = float(left.mean()), float(np.percentile(left, 95))
    out["g1_negative_space"] = {"mean_lum": mean_l, "p95_lum": p95, "pass": mean_l <= 70 and p95 <= 170}

    r, g, b = first[..., 0], first[..., 1], first[..., 2]
    y = 0.299 * r + 0.587 * g + 0.114 * b
    cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
    skin = (cb > 77) & (cb < 127) & (cr > 133) & (cr < 173) & (y > 60)
    # drop sparse columns (< 0.5% of H) to ignore stray warm pixels in the skyline
    colcount = skin.sum(axis=0)
    cols = np.where(colcount > H * 0.005)[0]
    leftmost = int(cols.min()) if cols.size else W
    out["g2_subject_extent"] = {"leftmost_x": leftmost, "leftmost_frac": leftmost / W, "skin_px": int(skin.sum()), "pass": leftmost >= subject_min_x * W}

    d = np.abs(first[:, :nx].mean(axis=(0, 1)) - last[:, :nx].mean(axis=(0, 1)))
    out["g3_same_world"] = {"delta_rgb": [float(x) for x in d], "pass": bool((d <= 6).all())}

    out["all_pass"] = all(out[k]["pass"] for k in ("g1_negative_space", "g2_subject_extent", "g3_same_world"))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("first")
    ap.add_argument("last")
    ap.add_argument("--neg-frac", type=float, default=0.33)
    ap.add_argument("--subject-min-x", type=float, default=0.60)
    ap.add_argument("--out")
    a = ap.parse_args()
    res = gate(load(a.first), load(a.last), a.neg_frac, a.subject_min_x)
    res["first"], res["last"] = a.first, a.last
    js = json.dumps(res, indent=2, ensure_ascii=False)
    print(js)
    if a.out:
        open(a.out, "w").write(js)
    sys.exit(0 if res["all_pass"] else 1)


if __name__ == "__main__":
    main()
