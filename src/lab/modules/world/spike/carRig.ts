// CarConcept 上车（roadmap §7.2 Step 6）：把配置器同款 3.5MB 资产
// （public/models/car-concept/，Draco+KTX2，CC BY 4.0 显式豁免复用）挂到
// 运动学车辆控制器上，并把四个烘死在模型空间的轮组改造成可转/可打方向的枢轴。
//
// CarConcept 的几何全部烘在模型空间（节点无 translation），因此轮组不能直接
// rotate —— 必须先用包围盒实测轮心，再重挂到「转向枢轴(前轮) → 滚转枢轴 → 网格」
// 的层级里（网格反向平移回原位）。卡钳（BrakePad）挂转向枢轴、不随轮滚转。
import * as THREE from 'three/webgpu';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { VehicleGeometry } from './vehicle';

interface WheelPivot {
  /** 转向枢轴（前轮） / 滚转外壳（后轮） */
  steer: THREE.Group;
  /** 滚转枢轴（绕轮轴自转） */
  spin: THREE.Group;
  isFront: boolean;
}

export interface CarRig {
  /** 世界坐标根节点（KinematicVehicle.applyToObject 的写入目标） */
  root: THREE.Group;
  /** 从模型实测出的车辆几何（轴距/轮距/轮半径），喂给控制器 */
  geometry: VehicleGeometry;
  /** 每帧写入：前轮转角 + 车轮累计滚转 */
  update(steer: number, wheelSpin: number): void;
}

const WHEEL_NAMES = ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'] as const;

/** 程序化接触阴影（径向渐变，替代实时阴影 —— 与配置器同款，移动端零开销） */
function makeContactShadow(length: number, width: number): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.5, 'rgba(0,0,0,0.3)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 1.35, length * 1.12),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.04;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * 把加载好的 CarConcept gltf 组装成可驾驶 rig。
 * 模型前向轴在运行时从「前轴中点 - 后轴中点」实测（不硬编码轴向假设），
 * 内层容器整体旋转对齐到本站车辆约定：车头 = +Z、地面接触 = y0。
 */
export function buildCarRig(gltf: GLTF): CarRig {
  const model = gltf.scene;

  // ---- 1. 实测四个轮组的轮心（几何烘死 → 只能用包围盒） ----
  model.updateMatrixWorld(true);
  const wheelNodes = WHEEL_NAMES.map((name) => {
    const node = model.getObjectByName(name);
    if (!node) throw new Error(`CarConcept 缺少轮组节点 ${name}`);
    return node;
  });
  const box = new THREE.Box3();
  const centers = wheelNodes.map((node) => {
    box.setFromObject(node);
    return box.getCenter(new THREE.Vector3());
  });
  const [fl, fr, rl, rr] = centers as [
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3,
  ];

  // ---- 2. 模型空间的前向/左向/轮几何 ----
  const frontMid = fl.clone().add(fr).multiplyScalar(0.5);
  const rearMid = rl.clone().add(rr).multiplyScalar(0.5);
  const forwardM = frontMid.clone().sub(rearMid).setY(0).normalize();
  const upM = new THREE.Vector3(0, 1, 0);
  // left = up × forward；轮子绕 left 轴正向旋转 = 向前滚（见 vehicle.ts 坐标约定）
  const leftM = upM.clone().cross(forwardM).normalize();

  const wheelbase = frontMid.distanceTo(rearMid);
  const track = fl.distanceTo(fr);
  box.setFromObject(wheelNodes[0]!);
  const wheelSize = box.getSize(new THREE.Vector3());
  const wheelRadius = wheelSize.y / 2;

  // ---- 3. 轮组改枢轴：steer(前) → spin → 网格（反向平移回原位） ----
  const pivots: WheelPivot[] = wheelNodes.map((node, i) => {
    const center = centers[i]!;
    const parent = node.parent!;
    const steer = new THREE.Group();
    steer.position.copy(center);
    const spin = new THREE.Group();
    steer.add(spin);
    parent.add(steer);

    // 卡钳不随轮滚转：BrakePad 留在转向枢轴层
    const pads: THREE.Object3D[] = [];
    const spinners: THREE.Object3D[] = [];
    for (const child of [...node.children]) {
      (child.name.includes('BrakePad') ? pads : spinners).push(child);
    }
    for (const child of spinners) spin.add(child);
    for (const child of pads) steer.add(child);
    // 组内网格全部反向平移，使枢轴原点 = 轮心
    for (const child of [...spinners, ...pads]) child.position.sub(center);
    node.removeFromParent(); // 空壳节点（无 mesh）退役

    return { steer, spin, isFront: i < 2 };
  });

  // ---- 4. 内层容器对齐：模型前向 → +Z，轮底 → y=0，轮轴中心 → 原点 ----
  const inner = new THREE.Group();
  inner.add(model);
  const alignQ = new THREE.Quaternion().setFromUnitVectors(forwardM, new THREE.Vector3(0, 0, 1));
  inner.quaternion.copy(alignQ);
  // 平移：xz 用四轮心均值（轴中心），y 用整车包围盒底（轮胎着地面）
  const wheelMid = frontMid.clone().add(rearMid).multiplyScalar(0.5);
  box.setFromObject(model);
  model.position.set(-wheelMid.x, -box.min.y, -wheelMid.z);

  const root = new THREE.Group();
  root.add(inner);
  box.setFromObject(inner);
  const size = box.getSize(new THREE.Vector3());
  root.add(makeContactShadow(size.z, size.x));

  // ---- 5. 每帧驱动：前轮转向（绕模型 up）+ 全轮滚转（绕模型 left） ----
  const steerQ = new THREE.Quaternion();
  const spinQ = new THREE.Quaternion();
  const update = (steer: number, wheelSpin: number): void => {
    spinQ.setFromAxisAngle(leftM, wheelSpin);
    for (const p of pivots) {
      if (p.isFront) {
        steerQ.setFromAxisAngle(upM, steer);
        p.steer.quaternion.copy(steerQ);
      }
      p.spin.quaternion.copy(spinQ);
    }
  };

  return {
    root,
    geometry: { wheelbase, track, wheelRadius },
    update,
  };
}
