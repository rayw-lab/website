#!/usr/bin/env node
// CC-VIS-X2-FACADE-R2 — 可见楼清单 NDC 取证（设计确认 ④ 前置：只给首幕与主动线可见的楼做立面）。
// 口径 = tools/camera/audit-shot-ndc.mjs（同一解算式，viewport 1440×900），扩展为全楼遍历：
//   ① ritual_idle 首幕机位：全部 12 栋 bbox 八角点投影 → 入帧计数 + ndc 范围
//      （消费方 = CityBlocks.FACADE_PLAN 首幕远读面 + 屋顶剪影投资判定）；
//   ② 主干道驾驶动线（两条主轴路）：逐楼判定临街面（面向最近道路的立面）与楼-路缘距离
//      （消费方 = FACADE_PLAN 临街面全套构件判定）；
//   ③ 前景管线桥 NDC 预演（ForegroundFraming 桥位/桥面带/腿柱 + 机器人零遮挡自查）。
// 复跑：node tools/camera/audit-x2-visibility.mjs（只读 src/data，两个 JSON 均零改动）。
import { readFileSync } from 'node:fs';
import { PerspectiveCamera, Vector3 } from 'three';

const shotsDoc = JSON.parse(
  readFileSync(new URL('../../src/data/camera-shots.json', import.meta.url), 'utf8'),
);
const buildingsDoc = JSON.parse(
  readFileSync(new URL('../../src/data/cyber-city-buildings.json', import.meta.url), 'utf8'),
);

const viewport = { width: 1440, height: 900 };
const aspect = viewport.width / viewport.height;
const ratioOverflow = Math.max(1, shotsDoc.camera.idealRatio / aspect) - 1;
const DEG = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;

function buildCamera(shot, anchor) {
  const phi = shot.spherical.phiDeg * DEG;
  const theta = shot.spherical.thetaDeg * DEG;
  const r = shot.spherical.radius;
  const radius =
    typeof r === 'number'
      ? r
      : lerp(r.edges.min, r.edges.max + ratioOverflow * r.nonIdealRatioOffset, 1 - r.baseRatio);
  const lateral = shot.lateral ?? 0;
  const offset = new Vector3().setFromSphericalCoords(radius, phi, theta);
  const lateralOffset = new Vector3(Math.cos(theta), 0, -Math.sin(theta)).multiplyScalar(lateral);
  const position = new Vector3(anchor.x, 0, anchor.z).add(offset).add(lateralOffset);
  const target = new Vector3(anchor.x, shot.lookAtHeight ?? 0, anchor.z).add(lateralOffset);
  const camera = new PerspectiveCamera(shotsDoc.camera.fov, aspect, shotsDoc.camera.near, 1000);
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  return { camera, position, target, radius };
}

function corners(b) {
  const { x, z } = b.position;
  const { w, d, h } = b.footprint;
  const out = [];
  for (const sz of [-1, 1])
    for (const sx of [-1, 1])
      for (const y of [0, h])
        out.push(new Vector3(x + (sx * w) / 2, y, z + (sz * d) / 2));
  return out;
}

function projectAll(b, camera) {
  const rows = corners(b).map((p) => {
    const view = p.clone().applyMatrix4(camera.matrixWorldInverse);
    const front = view.z < 0;
    const ndc = p.clone().project(camera);
    const inFrustum = front && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && ndc.z >= -1 && ndc.z <= 1;
    return { ndc, front, inFrustum };
  });
  return {
    inFrustum: rows.filter((r) => r.inFrustum).length,
    front: rows.filter((r) => r.front).length,
    ndcX: [Math.min(...rows.map((r) => r.ndc.x)), Math.max(...rows.map((r) => r.ndc.x))],
    ndcY: [Math.min(...rows.map((r) => r.ndc.y)), Math.max(...rows.map((r) => r.ndc.y))],
  };
}

// ① ritual_idle 首幕
const shot = shotsDoc.shots.ritual_idle;
const spawn = buildingsDoc.world.spawn.position;
const { camera, position, target, radius } = buildCamera(shot, spawn);
console.log(`ritual_idle camera (${position.toArray().map((v) => v.toFixed(2)).join(', ')}) ` +
  `→ lookAt (${target.toArray().map((v) => v.toFixed(2)).join(', ')})  radius ${radius.toFixed(2)}m  ` +
  `fov ${shotsDoc.camera.fov}°  aspect ${aspect.toFixed(3)}`);
console.log('\n== ① ritual_idle 首幕入帧审计（全部 12 栋，八角点） ==');
console.log('building            lod       inFrustum  front  ndc.x range        ndc.y range');
for (const b of buildingsDoc.buildings) {
  const a = projectAll(b, camera);
  console.log(
    `${b.id.padEnd(20)}${b.lodProfile.padEnd(10)}${String(a.inFrustum).padStart(4)}/8   ${a.front}/8   ` +
      `[${a.ndcX[0].toFixed(2)}, ${a.ndcX[1].toFixed(2)}]`.padEnd(19) +
      `[${a.ndcY[0].toFixed(2)}, ${a.ndcY[1].toFixed(2)}]`,
  );
}

// ② 主干道沿街面：楼面朝最近道路 = 临街面；驾驶动线 = 两主轴全程
console.log('\n== ② 主干道沿街面判定（standard 楼 / 楼近缘-路缘距离） ==');
for (const b of buildingsDoc.buildings) {
  if (b.lodProfile !== 'standard') continue;
  const { x, z } = b.position;
  const { w, d } = b.footprint;
  const faces = [];
  // Axis Avenue：x∈±12（南北向）——判楼东/西面
  const nearX = Math.abs(x) - w / 2 - 12; // 楼近缘到路缘
  if (Math.abs(z) <= 260 && nearX < 40) faces.push(`${x > 0 ? 'west' : 'east'}→AxisAve(${nearX.toFixed(0)}m)`);
  // Neon Boulevard：z∈±12（东西向）——判楼北/南面
  const nearZ = Math.abs(z) - d / 2 - 12;
  if (Math.abs(x) <= 260 && nearZ < 40) faces.push(`${z > 0 ? 'north' : 'south'}→NeonBlvd(${nearZ.toFixed(0)}m)`);
  console.log(`${b.id.padEnd(20)}@(${String(x).padStart(4)},${String(z).padStart(4)}) w${w}×d${d}  ${faces.join('  ') || '（离路 ≥40m，零投入）'}`);
}

// ③ 前景管线桥 NDC 预演（跨 x±17，桥面带 y 13.4–15.6，腿柱 ±15.7）
// [CC-VIS-X2-PLUG] 桥位 z 与 src/lab/world/city/ForegroundFraming.ts BRIDGE 同步：
// −26 → −19.5（让出 e2e 驾驶走廊带 z∈[−24,−28]，碰撞面核对见 §④）
const BRIDGE_Z = -19.5;
const LEG_X = 15.7;
const LEG_HALF_XZ = 0.62;
console.log(`\n== ③ 前景管线桥 NDC 预演（ritual_idle，桥位 z=${BRIDGE_Z}） ==`);
const pts = {
  'deck W end (−17, 13.4)': new Vector3(-17, 13.4, BRIDGE_Z),
  'deck E end (+17, 13.4)': new Vector3(17, 13.4, BRIDGE_Z),
  'pipes top W (−17, 15.6)': new Vector3(-17, 15.6, BRIDGE_Z),
  'pipes top E (+17, 15.6)': new Vector3(17, 15.6, BRIDGE_Z),
  'leg W base (−15.7, 0)': new Vector3(-LEG_X, 0, BRIDGE_Z),
  'leg E base (+15.7, 0)': new Vector3(LEG_X, 0, BRIDGE_Z),
  'robot head (0, 2.2, 0)': new Vector3(0, 2.2, 0),
  'robot base (0, 0, 0)': new Vector3(0, 0, 0),
};
for (const [label, p] of Object.entries(pts)) {
  const view = p.clone().applyMatrix4(camera.matrixWorldInverse);
  const ndc = p.clone().project(camera);
  console.log(`${label.padEnd(26)} ndc(${ndc.x.toFixed(2)}, ${ndc.y.toFixed(2)})  front=${view.z < 0}`);
}

// ④ e2e 驾驶走廊余量审计（[CC-VIS-X2-PLUG]：桥腿柱 + 街角道具簇对走廊纪律的定量核对）
// 口径：障碍碰撞面（箱体近似为「中心 + 水平半对角」圆盘）到走廊带/各 driveTo 追线的
// 净距 ≥ 车半宽 ~1m + 转向余量 1.5m = 2.5m（T9 §1.3 修复域纪律）。
// 追线清单 = e2e 各 spec driveTo 线段（含 triage r1 绕行航点；测试面 = 审计面，只读转录）。
console.log('\n== ④ e2e 驾驶走廊余量审计（净距纪律 ≥2.5m） ==');
const MARGIN = 2.5;
/** 障碍：桥腿柱 ×2（ForegroundFraming BRIDGE/LEG 同步） + 东北簇三件（StreetProps
 *  PROP_CLUSTERS[0] (17.8,−17.8) face −3π/4 展开；rotY 随机 ±0.25 → 半对角取最劣） */
const clusterPiece = (along, half) => {
  const face = (-3 * Math.PI) / 4;
  const cx = 17.8 + Math.cos(face) * along;
  const cz = -17.8 - Math.sin(face) * along;
  return { x: cx, z: cz, r: Math.hypot(half[0], half[1]) };
};
const obstacles = [
  { name: `桥腿 W (−15.7,${BRIDGE_Z})`, x: -LEG_X, z: BRIDGE_Z, r: Math.hypot(LEG_HALF_XZ, LEG_HALF_XZ) },
  { name: `桥腿 E (+15.7,${BRIDGE_Z})`, x: LEG_X, z: BRIDGE_Z, r: Math.hypot(LEG_HALF_XZ, LEG_HALF_XZ) },
  { name: '东北簇 PropVending', ...clusterPiece(0, [0.65, 0.48]) },
  { name: '东北簇 PropCabinet', ...clusterPiece(1.9, [0.8, 0.4]) },
  { name: '东北簇 PropBin', ...clusterPiece(-1.8, [0.85, 0.4]) },
];
/** 追线（[x1,z1,x2,z2]）：triage r1 大道改线后（839b6fe）各 spec 现行 driveTo 腿 +
 *  出泊倒退线 + 原西走廊直线（纪律参考——走廊基线恢复与否归审计）；
 *  EXP-02 legM 以 (0,−24) r6 圈缘最劣停点 (0,−18) 起算 */
const legs = [
  ['EXP-01 倒退线 (28,−28)→(24.5,−24.5)', 28, -28, 24.5, -24.5],
  ['EXP-01 legA 北上 (24.5,−24.5)→(25.5,−10)', 24.5, -24.5, 25.5, -10],
  ['EXP-01 legB 大道西行 (25.5,−10)→(−24,−8)', 25.5, -10, -24, -8],
  ['EXP-01 末腿 (−24,−8)→(−28,−28)', -24, -8, -28, -28],
  ['EXP-01 去重出程 (−28,−28)→(−28,−42)', -28, -28, -28, -42],
  ['EXP-02 途径腿 (0,0)→(0,−24)', 0, 0, 0, -24],
  ['EXP-02 legM (0,−18)→(−20,−32.5)', 0, -18, -20, -32.5],
  ['EXP-02 末腿 (−20,−32.5)→(−28,−28)', -20, -32.5, -28, -28],
  ['OBS/PERF E1 (0,0)→(20,−8)', 0, 0, 20, -8],
  ['OBS/PERF 车道南下 (20,−8)→(28,−28)', 20, -8, 28, -28],
  ['（纪律参考）原西走廊线 (24.5,−24.5)→(−28,−28)', 24.5, -24.5, -28, -28],
];
const segDist = (px, pz, x1, z1, x2, z2) => {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (x1 + t * dx), pz - (z1 + t * dz));
};
/** 走廊带矩形 z∈[−28,−24] ∩ x∈[−28,24.5]（点到矩形距离） */
const bandDist = (px, pz) => {
  const dx = Math.max(-28 - px, 0, px - 24.5);
  const dz = Math.max(-28 - pz, 0, pz - -24);
  return Math.hypot(dx, dz);
};
let fail = 0;
for (const o of obstacles) {
  const rows = [['走廊带 z∈[−24,−28]∩x∈[−28,24.5]', bandDist(o.x, o.z) - o.r]];
  for (const [name, x1, z1, x2, z2] of legs) rows.push([name, segDist(o.x, o.z, x1, z1, x2, z2) - o.r]);
  const worst = rows.reduce((a, b) => (b[1] < a[1] ? b : a));
  const ok = worst[1] >= MARGIN;
  if (!ok) fail += 1;
  console.log(`${o.name.padEnd(24)} 最小净距 ${worst[1].toFixed(2)}m @ ${worst[0]}  ${ok ? 'PASS' : 'FAIL'}`);
}
console.log(fail === 0 ? `④ 全部 X2-PLUG 域障碍净距 ≥${MARGIN}m —— PASS` : `④ ${fail} 项低于 ${MARGIN}m —— FAIL`);
process.exitCode = fail === 0 ? 0 : 1;

// ④-登记：X1 充电桩排带墙（main 面遗留，非本段修复域——triage r1 839b6fe 归因修正：
// HeroBlenderMesh PROP_COLLIDERS 世界系 x∈[16.2,17.8]×z∈[−40.3,−25.3]，原西走廊
// 直线离其北端头仅 ~0.25m，X2 树车头 42km/h 撞停 x=19.4=东面 17.8+悬伸 1.6）。
// 只登记对现行动线的净距，不入本段 PASS/FAIL 门；走廊基线恢复须先由主线专项处置桩排。
const PILE_ROW = { x1: 16.2, x2: 17.8, z1: -40.3, z2: -25.3 };
const rectDist = (px, pz) =>
  Math.hypot(Math.max(PILE_ROW.x1 - px, 0, px - PILE_ROW.x2), Math.max(PILE_ROW.z1 - pz, 0, pz - PILE_ROW.z2));
let pileWorst = ['—', Infinity];
for (const [name, x1, z1, x2, z2] of legs.slice(0, -1)) {
  for (let t = 0; t <= 1; t += 0.01) {
    const d = rectDist(x1 + t * (x2 - x1), z1 + t * (z2 - z1));
    if (d < pileWorst[1]) pileWorst = [name, d];
  }
}
console.log(
  `④-登记 X1 充电桩排（x∈[16.2,17.8]×z∈[−40.3,−25.3]）对现行动线最小净距 ` +
    `${pileWorst[1].toFixed(2)}m @ ${pileWorst[0]}（原西走廊线 ~0.25m 卡死——main 面遗留，审计/主线专项定谳）`,
);
