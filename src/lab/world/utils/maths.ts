// 数学工具（移植自 folio-2025 sources/Game/utilities/maths.js，取 /world/ 用到的子集）。
// 行号基线：folio-2025 @ 41046b5（source-teardown §1.1）。

export function clamp(input: number, min: number, max: number): number {
  return Math.max(min, Math.min(input, max));
}

export function remap(
  input: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number,
): number {
  return ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow;
}

export function remapClamp(
  input: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number,
): number {
  return clamp(
    ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow,
    outLow < outHigh ? outLow : outHigh,
    outLow > outHigh ? outLow : outHigh,
  );
}

export function lerp(start: number, end: number, ratio: number): number {
  return (1 - ratio) * start + ratio * end;
}

export function smoothstep(value: number, min: number, max: number): number {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

const TAU = 2 * Math.PI;

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

/** 归一化到 [-π, +π] */
function equivalent(a: number): number {
  return mod(a + Math.PI, TAU) - Math.PI;
}

/** 两角最短差（翻转累计角/摇杆方向判定都靠它，防 2π 跳变） */
export function smallestAngle(current: number, target: number): number {
  return equivalent(target - current);
}
