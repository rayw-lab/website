#!/usr/bin/env node
// CC-VIS-X2-FACADE-R2 — 可见楼清单 NDC 取证（设计确认 ④ 前置：只给首幕与主动线可见的楼做立面）。
// 口径 = tools/camera/audit-shot-ndc.mjs（同一解算式，viewport 1440×900），扩展为全楼遍历：
//   ① ritual_idle 首幕机位：全部 12 栋 bbox 八角点投影 → 入帧计数 + ndc 范围；
//   ② 主干道驾驶动线（两条主轴路）：逐楼判定临街面（面向最近道路的立面）与楼-路缘距离。
// 只读 src/data，两个 JSON 均零改动。
import { readFileSync } from 'node:fs';
import { PerspectiveCamera, Vector3 } from 'three';

const shotsDoc = JSON.parse(readFileSync('/workspace/src/data/camera-shots.json', 'utf8'));
const buildingsDoc = JSON.parse(readFileSync('/workspace/src/data/cyber-city-buildings.json', 'utf8'));

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

// ③ 前景管线桥 NDC 预演（世界 (0,0,-26)，跨 x±17，桥面带 z 13.4–15.6，腿柱 ±15.7）
console.log('\n== ③ 前景管线桥 NDC 预演（ritual_idle） ==');
const pts = {
  'deck W end (−17, 13.4)': new Vector3(-17, 13.4, -26),
  'deck E end (+17, 13.4)': new Vector3(17, 13.4, -26),
  'pipes top W (−17, 15.6)': new Vector3(-17, 15.6, -26),
  'pipes top E (+17, 15.6)': new Vector3(17, 15.6, -26),
  'leg W base (−15.7, 0)': new Vector3(-15.7, 0, -26),
  'leg E base (+15.7, 0)': new Vector3(15.7, 0, -26),
  'robot head (0, 2.2, 0)': new Vector3(0, 2.2, 0),
  'robot base (0, 0, 0)': new Vector3(0, 0, 0),
};
for (const [label, p] of Object.entries(pts)) {
  const view = p.clone().applyMatrix4(camera.matrixWorldInverse);
  const ndc = p.clone().project(camera);
  console.log(`${label.padEnd(26)} ndc(${ndc.x.toFixed(2)}, ${ndc.y.toFixed(2)})  front=${view.z < 0}`);
}
