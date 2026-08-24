// 灰盒试验场（roadmap §7.1 Step 4 灰盒纪律：一切正式美术零投入）。
// 全部程序化生成 —— 地面网格 + 环形试车道画在一张 2048px 画布纹理上，
// 锥桶/坡道/轮胎墙全是 primitive。public/world/ 零新增资产（Spike 门禁 ≤1MB 自然满足）。
import * as THREE from 'three/webgpu';
import { CONE_PARAMS as CP, TRACK_PARAMS as TP } from './params';
import type { KinematicVehicle } from './vehicle';

/* ———— 地面画布：world(x,z) → canvas(cx,cy) 的仿射映射 ————
   PlaneGeometry rotation.x=-π/2 + flipY 纹理 ⇒ cx=(x/S+0.5)W, cy=(z/S+0.5)H */
function paintGround(): HTMLCanvasElement {
  const W = 2048;
  const c = document.createElement('canvas');
  c.width = c.height = W;
  const ctx = c.getContext('2d')!;
  const px = (m: number) => (m / TP.groundSize) * W; // 米 → 像素
  const cx = W / 2;
  const R = px(TP.ringRadius);
  const road = px(TP.ringWidth);

  // 灰盒底色 + 10m 参考网格（工程车间感）
  ctx.fillStyle = '#22262c';
  ctx.fillRect(0, 0, W, W);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 2;
  for (let m = 10; m < TP.groundSize; m += 10) {
    const p = px(m);
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, W);
    ctx.moveTo(0, p);
    ctx.lineTo(W, p);
    ctx.stroke();
  }

  // 内场圈（略暖的水泥色）
  ctx.fillStyle = '#292d33';
  ctx.beginPath();
  ctx.arc(cx, cx, R - road / 2 - px(2), 0, Math.PI * 2);
  ctx.fill();

  // 环形试车道：沥青 + 双白边线 + 虚线中线
  ctx.strokeStyle = '#3c4046';
  ctx.lineWidth = road;
  ctx.beginPath();
  ctx.arc(cx, cx, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(240,240,240,0.85)';
  ctx.lineWidth = Math.max(3, px(0.25));
  for (const r of [R - road / 2 + px(0.4), R + road / 2 - px(0.4)]) {
    ctx.beginPath();
    ctx.arc(cx, cx, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,196,72,0.75)';
  ctx.setLineDash([px(3), px(3)]);
  ctx.beginPath();
  ctx.arc(cx, cx, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 起终点：出生点 (0, +ringRadius) 处横跨路面的棋盘带（车头朝 +X = 画布 +x）
  const sy = cx + R; // 画布 y = world z
  const cell = px(1.1);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < Math.ceil(road / cell); i++) {
      ctx.fillStyle = (i + row) % 2 === 0 ? '#e8e8e8' : '#17181b';
      ctx.fillRect(
        cx - px(4) - row * cell,
        sy - road / 2 + i * cell,
        cell,
        Math.min(cell, road - i * cell),
      );
    }
  }

  // 出生位提示箭头（朝 +X）
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(cx + px(2.5), sy);
  ctx.lineTo(cx - px(1.5), sy - px(1.6));
  ctx.lineTo(cx - px(1.5), sy + px(1.6));
  ctx.closePath();
  ctx.fill();
  return c;
}

/* ———— 锥桶贴纸：橙底白环 ———— */
function paintConeTexture(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#e8641d';
  ctx.fillRect(0, 0, 8, 64);
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 22, 8, 14);
  return c;
}

interface ConeState {
  home: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  tiltAxis: THREE.Vector3;
  tilt: number;
  angVel: number;
  knocked: boolean;
}

export interface GrayboxWorld {
  scene: THREE.Scene;
  /** 贴地 raycast 目标（地面 + 坡道） */
  groundMeshes: THREE.Object3D[];
  /**
   * 每帧：锥桶碰撞 + 简易动力学 + 场地边界夹持。
   * @returns 本帧撞到的锥桶数（引擎侧按 CP.carSpeedKeep 扣车速）
   */
  update(dt: number, vehicle: KinematicVehicle): number;
  /** respawn 时恢复锥桶阵列 */
  resetCones(): void;
  /** 已击倒的锥桶数（HUD/测试断言用） */
  knockedCount(): number;
  dispose(): void;
}

export function createGrayboxWorld(envTexture: THREE.Texture): GrayboxWorld {
  const scene = new THREE.Scene();
  const disposables: { dispose(): void }[] = [];

  // ---- 天空 / 雾 / 环境（复用配置器 HDRI 做车漆反射，零新增资产） ----
  const bg = new THREE.Color('#171a20');
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 130, 300);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.55;

  const hemi = new THREE.HemisphereLight('#b9c4d4', '#3a3e46', 1.35);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight('#ffe9c4', 1.1);
  dir.position.set(60, 90, -40);
  scene.add(dir);

  // ---- 地面（单 plane + 程序化画布纹理） ----
  const groundTex = new THREE.CanvasTexture(paintGround());
  groundTex.anisotropy = 8;
  groundTex.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(TP.groundSize, TP.groundSize),
    new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.96, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  disposables.push(ground.geometry, ground.material, groundTex);

  // ---- 坡道（内场，贴地 raycast + 起跳验证用） ----
  const rampMat = new THREE.MeshStandardMaterial({ color: '#4a5058', roughness: 0.85 });
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(7, 0.5, 16), rampMat);
  // 绕 X 旋转：+Z 端下沉埋入地面、-Z 端翘起 ~2m（从起点直行 20m 左转即到）
  const rampTilt = 0.16;
  ramp.rotation.x = rampTilt;
  ramp.position.set(0, (16 / 2) * Math.sin(rampTilt) - 0.22, 30);
  scene.add(ramp);
  disposables.push(ramp.geometry, rampMat);

  // ---- 轮胎墙（场地硬边界视觉：红白相间弧形块，InstancedMesh 单 draw call） ----
  const barrierCount = 96;
  const barrierGeo = new THREE.BoxGeometry(3.4, 0.85, 0.7);
  const barrierMat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
  const barriers = new THREE.InstancedMesh(barrierGeo, barrierMat, barrierCount);
  const m4 = new THREE.Matrix4();
  const colRed = new THREE.Color('#b03a2e');
  const colWhite = new THREE.Color('#d8d5cd');
  for (let i = 0; i < barrierCount; i++) {
    const a = (i / barrierCount) * Math.PI * 2;
    m4.makeRotationY(-a);
    m4.setPosition(Math.sin(a) * TP.boundaryRadius, 0.42, Math.cos(a) * TP.boundaryRadius);
    barriers.setMatrixAt(i, m4);
    barriers.setColorAt(i, i % 2 === 0 ? colRed : colWhite);
  }
  scene.add(barriers);
  disposables.push(barrierGeo, barrierMat);

  // ---- 锥桶（InstancedMesh：桶身 + 底座各 1 个 draw call） ----
  // 阵位：起点直道慢弯桩 8 只 + φ=90° 出弯双排门 6 只 + 坡道落点缓冲 2 只
  const coneHomes: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const a = ((i * 7 + 14) / TP.ringRadius) * 1; // 弧长间隔 ~7m
    coneHomes.push([
      Math.sin(a) * (TP.ringRadius + (i % 2 === 0 ? -2.6 : 2.6)),
      Math.cos(a) * (TP.ringRadius + (i % 2 === 0 ? -2.6 : 2.6)),
    ]);
  }
  for (let i = 0; i < 3; i++) {
    coneHomes.push([TP.ringRadius - 3.4, -8 + i * 8], [TP.ringRadius + 3.4, -8 + i * 8]);
  }
  coneHomes.push([-2.6, 8], [2.6, 8]);

  const coneTex = new THREE.CanvasTexture(paintConeTexture());
  coneTex.colorSpace = THREE.SRGBColorSpace;
  const coneBodyGeo = new THREE.CylinderGeometry(0.045, 0.17, 0.6, 10);
  coneBodyGeo.translate(0, 0.33, 0); // 枢轴放桶底（倒下绕底沿转）
  const coneBodyMat = new THREE.MeshStandardMaterial({ map: coneTex, roughness: 0.7 });
  const coneBaseGeo = new THREE.BoxGeometry(0.38, 0.06, 0.38);
  coneBaseGeo.translate(0, 0.03, 0);
  const coneBaseMat = new THREE.MeshStandardMaterial({ color: '#c9531a', roughness: 0.8 });
  const coneBody = new THREE.InstancedMesh(coneBodyGeo, coneBodyMat, coneHomes.length);
  const coneBase = new THREE.InstancedMesh(coneBaseGeo, coneBaseMat, coneHomes.length);
  scene.add(coneBody, coneBase);
  disposables.push(coneBodyGeo, coneBodyMat, coneBaseGeo, coneBaseMat, coneTex);

  const cones: ConeState[] = coneHomes.map(([x, z]) => ({
    home: new THREE.Vector3(x, 0, z),
    pos: new THREE.Vector3(x, 0, z),
    vel: new THREE.Vector3(),
    tiltAxis: new THREE.Vector3(1, 0, 0),
    tilt: 0,
    angVel: 0,
    knocked: false,
  }));

  const q = new THREE.Quaternion();
  const scl = new THREE.Vector3(1, 1, 1);
  const writeCone = (i: number) => {
    const c = cones[i]!;
    q.setFromAxisAngle(c.tiltAxis, Math.min(c.tilt, 1.5));
    m4.compose(c.pos, q, scl);
    coneBody.setMatrixAt(i, m4);
    coneBase.setMatrixAt(i, m4);
  };
  cones.forEach((_, i) => writeCone(i));
  coneBody.instanceMatrix.needsUpdate = true;
  coneBase.instanceMatrix.needsUpdate = true;

  const resetCones = () => {
    for (let i = 0; i < cones.length; i++) {
      const c = cones[i]!;
      c.pos.copy(c.home);
      c.vel.set(0, 0, 0);
      c.tilt = 0;
      c.angVel = 0;
      c.knocked = false;
      writeCone(i);
    }
    coneBody.instanceMatrix.needsUpdate = true;
    coneBase.instanceMatrix.needsUpdate = true;
  };

  // ---- 每帧：碰撞检测（车 OBB×锥桶球） + 锥桶动力学 + 边界夹持 ----
  const fwd = new THREE.Vector3();
  const kick = new THREE.Vector3();
  const update = (dt: number, vehicle: KinematicVehicle): number => {
    let hits = 0;
    let dirty = false;
    vehicle.forwardDir(fwd);
    const rx = -fwd.z;
    const rz = fwd.x; // 车身右向
    const carSpeed = Math.abs(vehicle.speed);

    for (let i = 0; i < cones.length; i++) {
      const c = cones[i]!;

      // 碰撞：锥桶入车身 OBB（半长 2.25 × 半宽 1.1，含锥桶半径余量）
      const dx = c.pos.x - vehicle.position.x;
      const dz = c.pos.z - vehicle.position.z;
      if (dx * dx + dz * dz < 36 && c.pos.y < 0.9) {
        const lo = dx * fwd.x + dz * fwd.z;
        const la = dx * rx + dz * rz;
        if (Math.abs(lo) < 2.25 + CP.radius && Math.abs(la) < 1.1 + CP.radius && carSpeed > 0.4) {
          hits++;
          c.knocked = true;
          // 击飞方向：车心 → 锥桶（平面），叠加行进方向分量
          kick.set(dx, 0, dz).normalize().multiplyScalar(0.6);
          kick.addScaledVector(fwd, Math.sign(vehicle.speed) * 0.8).normalize();
          const v = CP.kickSpeedBase + carSpeed * CP.kickSpeedFactor;
          c.vel.set(kick.x * v, CP.kickUpBase + carSpeed * CP.kickUpFactor, kick.z * v);
          c.tiltAxis.set(kick.z, 0, -kick.x).normalize(); // 绕垂直于飞行方向的轴翻滚
          c.angVel = (1 + carSpeed) * CP.tumbleFactor;
        }
      }

      if (!c.knocked) continue;
      // 简易动力学：抛体 + 落地摩擦 + 翻滚收敛
      c.vel.y -= 9.81 * dt;
      c.pos.addScaledVector(c.vel, dt);
      if (c.pos.y <= 0) {
        c.pos.y = 0;
        c.vel.y = c.vel.y < -1.2 ? -c.vel.y * CP.bounce : 0;
        const drag = Math.exp(-CP.groundDrag * dt);
        c.vel.x *= drag;
        c.vel.z *= drag;
        c.angVel *= drag;
      }
      c.tilt += c.angVel * dt;
      writeCone(i);
      dirty = true;
      if (c.pos.y === 0 && c.vel.lengthSq() < 0.01 && c.angVel < 0.05) {
        c.knocked = c.tilt > 0.01; // 静止后不再积分（保持倒伏姿态）
        c.angVel = 0;
        c.vel.set(0, 0, 0);
        if (c.tilt > 0.01) {
          writeCone(i);
          // 已定格：从动力学集合摘除
          c.knocked = false;
          c.tilt = Math.min(c.tilt, 1.5);
        }
      }
    }
    if (dirty) {
      coneBody.instanceMatrix.needsUpdate = true;
      coneBase.instanceMatrix.needsUpdate = true;
    }

    // 场地边界：径向软夹持 + 去除向外速度分量（轮胎墙碰撞的运动学替身）
    const margin = 1.6;
    const limit = TP.boundaryRadius - margin;
    const r = Math.hypot(vehicle.position.x, vehicle.position.z);
    if (r > limit) {
      const nx = vehicle.position.x / r;
      const nz = vehicle.position.z / r;
      vehicle.position.x = nx * limit;
      vehicle.position.z = nz * limit;
      const vn = vehicle.velocity.x * nx + vehicle.velocity.z * nz;
      if (vn > 0) {
        // 反弹保留 25%（有「撞墙感」但不弹飞）
        vehicle.velocity.x -= nx * vn * 1.25;
        vehicle.velocity.z -= nz * vn * 1.25;
        vehicle.speed *= 0.82;
      }
    }
    return hits;
  };

  return {
    scene,
    groundMeshes: [ground, ramp],
    update,
    resetCones,
    knockedCount: () => cones.filter((c) => c.tilt > 0.01 || c.knocked).length,
    dispose() {
      for (const d of disposables) d.dispose();
      barriers.dispose();
      coneBody.dispose();
      coneBase.dispose();
    },
  };
}
