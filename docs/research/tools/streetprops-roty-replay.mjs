// [R-1-2/R-2-2] StreetProps rotY 确定性重放脚本（静态复刻必须附可执行重放——整改任务书 R-2-2）
// 用法：node docs/research/tools/streetprops-roty-replay.mjs
// 自包含内联（防 src 传递依赖）；两函数逐行镜像 src/lab/world/city/CityMap.ts:145-163（mulberry32 + FNV-1a），
// 调用序镜像 StreetProps.ts:189-213（createSeededRandom 在簇循环外创建一次，按簇序×[Vending,Cabinet,Bin] 消费）。
// 源码变更时本脚本输出必须随之重算并 diff（预期输出见 docs/research/cc-vis-x2-collider-aabb-20260902.md 顶部勘误）。

/** CityMap.ts:145-152 逐行镜像 */
function hashStringToSeed(input) {
  let hashValue = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hashValue ^= input.charCodeAt(i);
    hashValue = Math.imul(hashValue, 0x01000193);
  }
  return hashValue >>> 0;
}
/** CityMap.ts:155-163 逐行镜像 */
function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROP_CLUSTERS = [
  { x: 17.8, z: -17.8, face: (-3 * Math.PI) / 4 },
  { x: -19.5, z: -19.5, face: (3 * Math.PI) / 4 },
  { x: 19.5, z: 19.5, face: -Math.PI / 4 },
  { x: -19.5, z: 19.5, face: Math.PI / 4 },
  { x: 124, z: 25, face: Math.PI },
  { x: -124, z: -25, face: 0 },
];
const PROP_HALF = { PropVending: [0.65, 1.14, 0.48], PropCabinet: [0.8, 0.85, 0.4], PropBin: [0.85, 0.53, 0.4] };
const random = createSeededRandom(hashStringToSeed('x2-street-props'));

console.log('seed =', hashStringToSeed('x2-street-props'));
for (const cluster of PROP_CLUSTERS) {
  const rx = Math.cos(cluster.face), rz = -Math.sin(cluster.face);
  for (const [name, along] of [['PropVending', 0], ['PropCabinet', 1.9], ['PropBin', -1.8]]) {
    const rotY = cluster.face + (random() - 0.5) * 0.5;
    const x = cluster.x + rx * along, z = cluster.z + rz * along;
    const [hx, , hz] = PROP_HALF[name];
    const halfX = hx * Math.abs(Math.cos(rotY)) + hz * Math.abs(Math.sin(rotY));
    const halfZ = hx * Math.abs(Math.sin(rotY)) + hz * Math.abs(Math.cos(rotY));
    console.log(
      `${name.padEnd(12)} rotY=${(rotY * 180 / Math.PI).toFixed(2)}° center=(${x.toFixed(4)},${z.toFixed(4)}) ` +
      `AABB=[${(x - halfX).toFixed(2)},${(x + halfX).toFixed(2)}]×[${(z - halfZ).toFixed(2)},${(z + halfZ).toFixed(2)}]`,
    );
  }
}
