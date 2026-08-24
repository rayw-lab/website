// CarConcept 上车（roadmap §7.2 Step 6）：把配置器同款 3.5MB 资产
// （public/models/car-concept/，Draco+KTX2，CC BY 4.0 显式豁免复用）挂到
// 运动学车辆控制器上，并把四个轮组改造成可滚转/可打方向的枢轴。
//
// 资产实测结构（Spike 排查结论，勿凭直觉改）：
//   · 场景唯一根 BodyUnderside 带 matrix = -90°X（Z-up 导出），车身网格几何
//     烘在它的 Z-up 本地空间；
//   · 四个轮组节点 WheelFront/RearL/R 用 matrix 承载「轮心平移 + 导出时随手
//     转过的任意姿态旋转」，轮组内子网格（Rim/胎/卡钳/刹车盘）几何全部原点居中；
//   · 因此枢轴 = 轮节点平移（父本地空间），烘死的姿态旋转直接丢弃（前轮导出
//     时带转向角，不丢会呈内八字），旋转轴必须换算进父节点 Z-up 本地空间。
// 层级：父 → 转向枢轴(steer) → 滚转枢轴(spin) → 网格；卡钳挂 steer 不随轮滚转。
import * as THREE from 'three/webgpu';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { VehicleGeometry } from './vehicle';

interface WheelPivot {
  /** 转向枢轴（前轮） / 滚转外壳（后轮） */
  steer: THREE.Group;
  /** 滚转枢轴（绕轮轴自转） */
  spin: THREE.Group;
  /** 转向轴（枢轴父节点本地空间；见 buildCarRig 内注释） */
  steerAxis: THREE.Vector3;
  /** 滚转轴（同上；轴随转向枢轴一起转 = 真实轮轴行为） */
  spinAxis: THREE.Vector3;
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

  // ---- 1. 轮心 = 轮节点世界位置（子网格几何原点居中 ⇒ 节点平移即轮心） ----
  model.updateMatrixWorld(true);
  const wheelNodes = WHEEL_NAMES.map((name) => {
    const node = model.getObjectByName(name);
    if (!node) throw new Error(`CarConcept 缺少轮组节点 ${name}`);
    return node;
  });
  const centers = wheelNodes.map((node) => node.getWorldPosition(new THREE.Vector3()));
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
  // 轮半径：轮组子网格本地几何（原点居中）的联合包围盒直径 / 2
  const wheelBox = new THREE.Box3();
  wheelNodes[0]!.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.computeBoundingBox();
    wheelBox.union(mesh.geometry.boundingBox!);
  });
  const wheelRadius = (wheelBox.max.y - wheelBox.min.y) / 2;

  // ---- 3. 轮组改枢轴：steer(前) → spin → 网格 ----
  // 陷阱回顾（Spike 实测教训）：轮节点 matrix 同时带「轮心平移 + 导出时的任意
  // 姿态旋转」，子网格几何原点居中。旧实现用包围盒中心当轮心（包围盒来自
  // accessor 声明、原点居中 → 轮心测成 0），四轮静止时全部叠在车体中心（被
  // 车身轮拱遮住看似正常），一打方向/滚转就绕 1.8m 半径公转飞出车顶。
  const pivots: WheelPivot[] = wheelNodes.map((node, i) => {
    const parent = node.parent!;
    const qParentInv = parent.getWorldQuaternion(new THREE.Quaternion()).invert();
    const steerAxis = upM.clone().applyQuaternion(qParentInv).normalize();
    const spinAxis = leftM.clone().applyQuaternion(qParentInv).normalize();

    const steer = new THREE.Group();
    // 枢轴 = 轮节点平移（父本地空间）；节点烘死的姿态旋转刻意不继承
    steer.position.copy(node.position);
    const spin = new THREE.Group();
    steer.add(spin);
    parent.add(steer);

    // 卡钳不随轮滚转：BrakePad 留在转向枢轴层；子网格几何原点居中，本地位置原样保留
    const pads: THREE.Object3D[] = [];
    const spinners: THREE.Object3D[] = [];
    for (const child of [...node.children]) {
      (child.name.includes('BrakePad') ? pads : spinners).push(child);
    }
    for (const child of spinners) spin.add(child);
    for (const child of pads) steer.add(child);
    node.removeFromParent(); // 空壳节点（无 mesh）退役

    return { steer, spin, steerAxis, spinAxis, isFront: i < 2 };
  });

  // ---- 4. 内层容器对齐：模型前向 → +Z，轮底 → y=0，轮轴中心 → 原点 ----
  const inner = new THREE.Group();
  inner.add(model);
  const alignQ = new THREE.Quaternion().setFromUnitVectors(forwardM, new THREE.Vector3(0, 0, 1));
  inner.quaternion.copy(alignQ);
  // 平移：xz 用四轮心均值（轴中心），y 用整车包围盒底（轮胎着地面）
  const wheelMid = frontMid.clone().add(rearMid).multiplyScalar(0.5);
  const box = new THREE.Box3().setFromObject(model);
  model.position.set(-wheelMid.x, -box.min.y, -wheelMid.z);

  const root = new THREE.Group();
  root.add(inner);
  box.setFromObject(inner);
  const size = box.getSize(new THREE.Vector3());
  root.add(makeContactShadow(size.z, size.x));

  // ---- 5. 每帧驱动：前轮转向（绕枢轴本地 up）+ 全轮滚转（绕枢轴本地 left） ----
  // spin 轴以 steer 静止系度量：转向时轮轴随枢轴一起转（真实轮轴行为），
  // 因此 spinAxis 常量即可，不需要每帧重算。
  const update = (steer: number, wheelSpin: number): void => {
    for (const p of pivots) {
      if (p.isFront) p.steer.quaternion.setFromAxisAngle(p.steerAxis, steer);
      p.spin.quaternion.setFromAxisAngle(p.spinAxis, wheelSpin);
    }
  };

  return {
    root,
    geometry: { wheelbase, track, wheelRadius },
    update,
  };
}
