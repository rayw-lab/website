#!/usr/bin/env node
// CC-CAM-DATA — camera-shots NDC 投影审计探针（AL-BL2/PLUS 八角点论证方法的可复现脚本化）。
// 纯数学（three 数学类 + PerspectiveCamera 投影），零浏览器/playwright 依赖：
//   node tools/camera/audit-shot-ndc.mjs [--shot <id>] [--width 1440] [--height 900] [--json]
// 读 src/data/camera-shots.json + src/data/cyber-city-buildings.json，对每个 shot 解算
// View.ts 口径的静止收敛态机位，再把被审计楼体 bounding box（footprint w×d×h）八角点
// 投影到 NDC，并按 shot 内声明的 projectionAudit.gates 把门（任一 gate 失败 → exit 1）。
// 本脚本只读数据，不 import 引擎代码——View.ts / Areas.ts 零改动。

import { readFileSync } from 'node:fs';
import { PerspectiveCamera, Vector3 } from 'three';

const SHOTS_URL = new URL('../../src/data/camera-shots.json', import.meta.url);
const BUILDINGS_URL = new URL('../../src/data/cyber-city-buildings.json', import.meta.url);

// ---------- CLI ----------
const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
}
const onlyShot = argValue('--shot');
const width = Number(argValue('--width') ?? NaN);
const height = Number(argValue('--height') ?? NaN);
const asJson = args.includes('--json');

// ---------- 数据 ----------
const shotsDoc = JSON.parse(readFileSync(SHOTS_URL, 'utf8'));
const buildingsDoc = JSON.parse(readFileSync(BUILDINGS_URL, 'utf8'));
const buildingById = new Map(buildingsDoc.buildings.map((b) => [b.id, b]));

const viewport = {
  width: Number.isFinite(width) ? width : shotsDoc.camera.referenceViewport.width,
  height: Number.isFinite(height) ? height : shotsDoc.camera.referenceViewport.height,
};
const aspect = viewport.width / viewport.height;
// View.ts 构造式：ratioOverflow = max(1, idealRatio / viewportRatio) − 1
const ratioOverflow = Math.max(1, shotsDoc.camera.idealRatio / aspect) - 1;

const DEG = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- 解算 ----------
function resolveAnchor(shot) {
  const a = shot.anchor;
  if (a.type === 'spawn') {
    const p = buildingsDoc.world.spawn.position;
    return { x: p.x, z: p.z, label: `spawn(${p.x},${p.z})` };
  }
  if (a.type === 'building') {
    const b = buildingById.get(a.buildingId);
    if (!b) throw new Error(`anchor building 不存在：${a.buildingId}`);
    return { x: b.position.x, z: b.position.z, label: `${b.id}.centroid(${b.position.x},${b.position.z})` };
  }
  if (a.type === 'parkingBay') {
    const b = buildingById.get(a.buildingId);
    if (!b?.parkingBay) throw new Error(`anchor parkingBay 不存在：${a.buildingId}`);
    return { x: b.parkingBay.x, z: b.parkingBay.z, label: `${b.id}.parkingBay(${b.parkingBay.x},${b.parkingBay.z})` };
  }
  if (a.type === 'corridor') {
    return { x: a.point.x, z: a.point.z, label: `corridor:${a.corridorId}(${a.point.x},${a.point.z})` };
  }
  if (a.type === 'world') {
    return { x: a.point.x, z: a.point.z, label: `world(${a.point.x},${a.point.z})` };
  }
  throw new Error(`未知 anchor 类型：${a.type}`);
}

function resolveRadius(radiusSpec) {
  if (typeof radiusSpec === 'number') return radiusSpec;
  // View.ts 静止收敛态：smoothedRatio=baseRatio、dollyIn=0
  const max = radiusSpec.edges.max + ratioOverflow * radiusSpec.nonIdealRatioOffset;
  return lerp(radiusSpec.edges.min, max, 1 - radiusSpec.baseRatio);
}

function buildCamera(shot) {
  const anchor = resolveAnchor(shot);
  const phi = shot.spherical.phiDeg * DEG;
  const theta = shot.spherical.thetaDeg * DEG; // thetaDrift 取 0 基准位
  const radius = resolveRadius(shot.spherical.radius);
  const lateral = shot.lateral ?? 0;

  const offset = new Vector3().setFromSphericalCoords(radius, phi, theta);
  const lateralOffset = new Vector3(Math.cos(theta), 0, -Math.sin(theta)).multiplyScalar(lateral);

  const position = new Vector3(anchor.x, 0, anchor.z).add(offset).add(lateralOffset);
  const target = new Vector3(anchor.x, shot.lookAtHeight ?? 0, anchor.z).add(lateralOffset);

  const fov = shot.fovDeg ?? shotsDoc.camera.fov;
  const camera = new PerspectiveCamera(fov, aspect, shotsDoc.camera.near, shotsDoc.camera.far);
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  return { camera, anchor, radius, position, target, fov };
}

// 八角点：W/E = x∓、N/S = z∓（+X=东、+Z=南）、y0/yH = 地面/檐口
function bboxCorners(building) {
  const { x, z } = building.position;
  const { w, d, h } = building.footprint;
  const corners = [];
  for (const [sz, ns] of [[-1, 'N'], [1, 'S']])
    for (const [sx, we] of [[-1, 'W'], [1, 'E']])
      for (const [y, lv] of [[0, 'y0'], [h, 'yH']])
        corners.push({ label: `${ns}${we}·${lv}`, point: new Vector3(x + (sx * w) / 2, y, z + (sz * d) / 2) });
  return corners;
}

function projectCorner(point, camera) {
  const viewSpace = point.clone().applyMatrix4(camera.matrixWorldInverse);
  const front = viewSpace.z < 0; // three 相机看向 −Z
  const ndc = point.clone().project(camera);
  const inFrustum =
    front && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && ndc.z >= -1 && ndc.z <= 1;
  return { ndc, front, inFrustum, viewDistance: viewSpace.length() };
}

function auditBuilding(building, camera) {
  const rows = bboxCorners(building).map(({ label, point }) => ({ label, point, ...projectCorner(point, camera) }));
  const xs = rows.map((r) => r.ndc.x);
  return {
    building,
    rows,
    ndcXMin: Math.min(...xs),
    ndcXMax: Math.max(...xs),
    frontCount: rows.filter((r) => r.front).length,
    inFrustumCount: rows.filter((r) => r.inFrustum).length,
    maxAbsNdcXFront: rows.every((r) => r.front) ? Math.max(...rows.map((r) => Math.abs(r.ndc.x))) : Infinity,
  };
}

function evaluateGate(gate, audit) {
  const { rows } = audit;
  switch (gate.type) {
    case 'maxAbsNdcX': {
      const pass = rows.every((r) => r.front && Math.abs(r.ndc.x) <= gate.limit);
      return { pass, detail: `八角点全部位于相机前方且 |ndc.x| ≤ ${gate.limit}（实测 max=${audit.maxAbsNdcXFront === Infinity ? '∞(有角点在机位后方)' : audit.maxAbsNdcXFront.toFixed(3)}）` };
    }
    case 'inFrame':
      return { pass: audit.inFrustumCount === 8, detail: `八角点全部入帧（实测 ${audit.inFrustumCount}/8）` };
    case 'partiallyInFrame':
      return { pass: audit.inFrustumCount >= 1, detail: `至少一角入帧（实测 ${audit.inFrustumCount}/8）` };
    case 'outOfFrame':
      return { pass: audit.inFrustumCount === 0, detail: `八角点零入帧（实测 ${audit.inFrustumCount}/8 入帧）` };
    default:
      return { pass: false, detail: `未知 gate 类型：${gate.type}` };
  }
}

// ---------- 主流程 ----------
const fmt = (n, w = 8) => n.toFixed(3).padStart(w);
const halfHfovDeg = Math.atan(Math.tan((shotsDoc.camera.fov / 2) * DEG) * aspect) / DEG;

const shotIds = onlyShot ? [onlyShot] : Object.keys(shotsDoc.shots);
if (onlyShot && !shotsDoc.shots[onlyShot]) {
  console.error(`shot 不存在：${onlyShot}（可选：${Object.keys(shotsDoc.shots).join(', ')}）`);
  process.exit(2);
}

const report = { viewport, aspect, ratioOverflow, halfHfovDeg, shots: {} };
let failedGates = 0;

for (const shotId of shotIds) {
  const shot = shotsDoc.shots[shotId];
  // [CC-VEH-C2] drive_* 条目 anchor 随车（type=vehicle）动态解算，无静态世界机位——
  // 不做静态 NDC 审计（vehicle-camera spec §7.2「mode !== 'drive' 早退」条款）
  if (shot.mode === 'drive') {
    if (!asJson) console.log(`\n=== shot: ${shotId}（mode drive · ${shot.status}）=== 跳过：动态机位不做静态 NDC 审计`);
    continue;
  }
  const { camera, anchor, radius, position, target, fov } = buildCamera(shot);
  const shotReport = { anchor: anchor.label, radius, fov, position: position.toArray(), target: target.toArray(), buildings: {}, gates: [] };
  report.shots[shotId] = shotReport;

  if (!asJson) {
    console.log(`\n=== shot: ${shotId}（mode ${shot.mode} · ${shot.status}）===`);
    console.log(`anchor ${anchor.label}  radius ${radius.toFixed(3)}m  fov ${fov}°  aspect ${aspect.toFixed(3)}（${viewport.width}×${viewport.height}，水平半视场 ±${halfHfovDeg.toFixed(2)}°）`);
    console.log(`camera (${position.toArray().map((v) => v.toFixed(3)).join(', ')}) → lookAt (${target.toArray().map((v) => v.toFixed(3)).join(', ')})`);
  }

  const audits = new Map();
  for (const buildingId of shot.projectionAudit?.buildings ?? []) {
    const building = buildingById.get(buildingId);
    if (!building) throw new Error(`projectionAudit building 不存在：${buildingId}`);
    const audit = auditBuilding(building, camera);
    audits.set(buildingId, audit);
    shotReport.buildings[buildingId] = {
      bbox: { center: building.position, footprint: building.footprint },
      corners: audit.rows.map((r) => ({ label: r.label, world: r.point.toArray(), ndc: [r.ndc.x, r.ndc.y, r.ndc.z], front: r.front, inFrustum: r.inFrustum })),
      ndcX: { min: audit.ndcXMin, max: audit.ndcXMax },
      inFrustumCount: audit.inFrustumCount,
    };

    if (!asJson) {
      const { w, d, h } = building.footprint;
      console.log(`\n-- ${buildingId} @(${building.position.x},${building.position.z}) ${w}×${d}×${h} --`);
      console.log('corner      ndc.x    ndc.y    ndc.z  front  inFrustum');
      for (const r of audit.rows)
        console.log(`${r.label.padEnd(8)}${fmt(r.ndc.x)} ${fmt(r.ndc.y)} ${fmt(r.ndc.z)}   ${r.front ? ' ✓' : ' ✗'}      ${r.inFrustum ? '✓' : '✗'}`);
      console.log(`summary: ndc.x ∈ [${audit.ndcXMin.toFixed(3)}, ${audit.ndcXMax.toFixed(3)}]  front ${audit.frontCount}/8  inFrustum ${audit.inFrustumCount}/8`);
    }
  }

  for (const gate of shot.projectionAudit?.gates ?? []) {
    const audit = audits.get(gate.building);
    if (!audit) throw new Error(`gate 引用了未审计楼体：${gate.building}（须先列入 projectionAudit.buildings）`);
    const { pass, detail } = evaluateGate(gate, audit);
    if (!pass) failedGates += 1;
    shotReport.gates.push({ building: gate.building, type: gate.type, limit: gate.limit, pass, detail });
    if (!asJson) console.log(`GATE ${gate.type}${gate.limit != null ? `(${gate.limit})` : ''} ${gate.building}: ${pass ? 'PASS' : 'FAIL'} — ${detail}${gate.note ? `（${gate.note}）` : ''}`);
  }
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const gateTotal = shotIds.reduce((n, id) => n + (shotsDoc.shots[id].projectionAudit?.gates?.length ?? 0), 0);
  console.log(`\n=== 总结：gates ${gateTotal - failedGates}/${gateTotal} PASS ===`);
}
process.exit(failedGates > 0 ? 1 : 0);
