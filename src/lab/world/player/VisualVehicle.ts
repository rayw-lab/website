// 视觉车辆（CC-E1 合体层）：spike carRig（src/lab/modules/world/spike/carRig.ts，
// CarConcept 资产排查结论全量继承）并入引擎层，外加 folio VisualVehicle 的
// 轮同步消费段（gap 报告 §8.2 第 6 项）——每帧从 game.physicalVehicle
// （PhysicsVehicle 或 KinematicFallback，同一 PlayerVehicle 契约）回读：
//   位姿（position/quaternion 直拷）· 前轮转角（目标值 + 本层阻尼平滑）·
//   轮滚转（累计 rad，按视觉半径换算）· 悬挂行程（沿轮枢轴 up 轴上下浮动）。
//
// 与 spike carRig 的差异（迁入改动，资产结构陷阱注释原样保留）：
//   · 对齐目标从「车头 +Z」换到 folio 底盘约定「车头 +X」（PlayerVehicle 契约）；
//   · 新增统一缩放：模型实测轴距 → folio 物理脚印轴距 1.8m（轮位与物理接触点
//     对齐优先；车宽随缩略窄于物理盒 ~1.7m，灰盒期可接受，E2 换正式资产解决）；
//   · 车身容器不再由控制器写入（spike applyToObject），改为本层每帧从契约回读；
//   · 程序化接触阴影退役——引擎层世界有实时阴影（World 平行光 shadow map），
//     双影叠加会假；改开 castShadow；
//   · 悬挂行程视觉：轮枢轴沿本地 up 轴平移 suspensionOffset（folio VisualVehicle
//     轮 y 同步段），带阻尼防物理毛刺直传。
// 另职：环境贴图（配置器同款 studio_small_08_1k.hdr，1k 免审豁免资产）异步装载
// 到 scene.environment——车漆/clearcoat 没有环境反射会发闷，非阻塞失败可容忍。
//
// 资产实测结构（spike 排查结论，勿凭直觉改）：
//   · 场景唯一根 BodyUnderside 带 matrix = -90°X（Z-up 导出），车身网格几何
//     烘在它的 Z-up 本地空间；
//   · 四个轮组节点 WheelFront/RearL/R 用 matrix 承载「轮心平移 + 导出时随手
//     转过的任意姿态旋转」，轮组内子网格（Rim/胎/卡钳/刹车盘）几何全部原点居中；
//   · 因此枢轴 = 轮节点平移（父本地空间），烘死的姿态旋转直接丢弃（前轮导出
//     时带转向角，不丢会呈内八字），旋转轴必须换算进父节点 Z-up 本地空间。
// 层级：父 → 转向枢轴(steer) → 滚转枢轴(spin) → 网格；卡钳挂 steer 不随轮滚转。
import * as THREE from 'three/webgpu';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { Game } from '../core/Game';
import { VEHICLE_GROUND_CLEARANCE } from './Player';

/** folio 物理脚印（PhysicsVehicle 轮位 ±0.9 → 轴距 1.8；轮半径 0.4——wheelSpin 积分口径） */
const PHYSICS_WHEELBASE = 1.8;
const PHYSICS_WHEEL_RADIUS = 0.4;

/** 前轮转角显示阻尼速率 s⁻¹（物理层直写无插值——folio 的视觉平滑在这层） */
const STEER_SMOOTH_RATE = 12;
/** 悬挂行程显示阻尼速率 s⁻¹（防物理毛刺直传轮子） */
const SUSPENSION_SMOOTH_RATE = 14;

/** 视觉序（= PlayerVehicle.wheels 索引序）：0 前左 / 1 前右 / 2 后左 / 3 后右 */
const WHEEL_NAMES = ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'] as const;

interface WheelPivot {
  /** 转向枢轴（前轮） / 滚转外壳（后轮） */
  steer: THREE.Group;
  /** 滚转枢轴（绕轮轴自转） */
  spin: THREE.Group;
  /** 轮心静息位（枢轴父节点本地空间；悬挂偏移的基准） */
  basePosition: THREE.Vector3;
  /** 转向轴 = up（枢轴父节点本地空间） */
  steerAxis: THREE.Vector3;
  /** 滚转轴 = left（同上；轴随转向枢轴一起转 = 真实轮轴行为） */
  spinAxis: THREE.Vector3;
  isFront: boolean;
  /** 悬挂行程显示值（阻尼后） */
  suspensionDisplay: number;
}

export class VisualVehicle {
  private readonly game: Game;
  /** 世界坐标根节点 = PlayerVehicle 底盘参考系（position/quaternion 每帧直拷） */
  readonly root = new THREE.Group();

  private readonly pivots: WheelPivot[];
  /** 模型 → 物理脚印的统一缩放（悬挂偏移写进模型本地空间时要除回去） */
  private readonly modelScale: number;
  /** 视觉轮半径（缩放后实测值）——wheelSpin 按 0.4m 口径积分，显示前换算真实滚转 */
  private readonly spinRatio: number;
  private steerDisplay = 0;

  constructor(game: Game, gltf: GLTF) {
    this.game = game;

    const model = gltf.scene;

    // ---- 1. 轮心 = 轮节点世界位置（子网格几何原点居中 ⇒ 节点平移即轮心） ----
    model.updateMatrixWorld(true);
    const wheelNodes = WHEEL_NAMES.map((name) => {
      const node = model.getObjectByName(name);
      if (!node) throw new Error(`[world/visual-vehicle] CarConcept 缺少轮组节点 ${name}`);
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
    // left = up × forward；轮子绕 left 轴正向旋转 = 向前滚
    const leftM = upM.clone().cross(forwardM).normalize();

    const wheelbase = frontMid.distanceTo(rearMid);
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
    // 陷阱回顾（spike 实测教训）：轮节点 matrix 同时带「轮心平移 + 导出时的任意
    // 姿态旋转」，子网格几何原点居中。若用包围盒中心当轮心（包围盒来自 accessor
    // 声明、原点居中 → 轮心测成 0），四轮静止时全部叠在车体中心，一打方向/滚转
    // 就绕 1.8m 半径公转飞出车顶。
    this.pivots = wheelNodes.map((node, i) => {
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

      return {
        steer,
        spin,
        basePosition: steer.position.clone(),
        steerAxis,
        spinAxis,
        isFront: i < 2,
        suspensionDisplay: 0,
      };
    });

    // ---- 4. 内层容器对齐：模型前向 → +X（folio 底盘约定），轮底 → 离地净高下方 ----
    const inner = new THREE.Group();
    inner.add(model);
    // 前向都在水平面上 → 最小弧旋转轴为竖直，up 不歪
    inner.quaternion.setFromUnitVectors(forwardM, new THREE.Vector3(1, 0, 0));
    // 统一缩放到物理脚印轴距（轮位对齐物理接触点优先）
    this.modelScale = PHYSICS_WHEELBASE / wheelbase;
    inner.scale.setScalar(this.modelScale);
    // 底盘原点约定：静息时高于地面接触点 VEHICLE_GROUND_CLEARANCE（Player.ts 契约）
    inner.position.y = -VEHICLE_GROUND_CLEARANCE;
    // 平移：xz 用四轮心均值（轴中心），y 用整车包围盒底（轮胎着地面）
    const wheelMid = frontMid.clone().add(rearMid).multiplyScalar(0.5);
    const box = new THREE.Box3().setFromObject(model);
    model.position.set(-wheelMid.x, -box.min.y, -wheelMid.z);

    // wheelSpin 按物理轮半径 0.4 积分（契约口径），显示按视觉实测半径换算真实滚转
    this.spinRatio = PHYSICS_WHEEL_RADIUS / Math.max(wheelRadius * this.modelScale, 1e-4);

    // 实时阴影（World 平行光 shadow map 覆盖 ±30m 试车场）
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) child.castShadow = true;
    });

    this.root.add(inner);
    this.game.scene.add(this.root);

    this.setEnvironment();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      6, // order 6：车辆 post（5）之后回读位姿，相机（7）之前落位
    );
  }

  /** 每帧：底盘位姿直拷 + 前轮转角阻尼 + 轮滚转 + 悬挂行程（folio VisualVehicle 同步段） */
  private update(): void {
    const vehicle = this.game.physicalVehicle;
    if (!vehicle) return;

    this.root.position.copy(vehicle.position);
    this.root.quaternion.copy(vehicle.quaternion);

    const dt = this.game.ticker.delta;
    this.steerDisplay += (vehicle.steeringTarget - this.steerDisplay) * Math.min(1, STEER_SMOOTH_RATE * dt);
    const kSuspension = Math.min(1, SUSPENSION_SMOOTH_RATE * dt);
    const spin = vehicle.wheelSpin * this.spinRatio;

    for (let i = 0; i < this.pivots.length; i++) {
      const pivot = this.pivots[i];
      const state = vehicle.wheels[i];

      // 悬挂行程：沿枢轴父本地 up 轴浮动（世界米 → 模型本地要除缩放）
      pivot.suspensionDisplay += (state.suspensionOffset - pivot.suspensionDisplay) * kSuspension;
      pivot.steer.position
        .copy(pivot.basePosition)
        .addScaledVector(pivot.steerAxis, pivot.suspensionDisplay / this.modelScale);

      if (pivot.isFront) pivot.steer.quaternion.setFromAxisAngle(pivot.steerAxis, this.steerDisplay);
      pivot.spin.quaternion.setFromAxisAngle(pivot.spinAxis, spin);
    }
  }

  /** 环境贴图（配置器同款 HDRI 复用，1k 豁免资产）：异步非阻塞，失败只降观感 */
  private setEnvironment(): void {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
    new HDRLoader()
      .loadAsync(`${base}/hdri/studio_small_08_1k.hdr`)
      .then((texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.game.scene.environment = texture;
        this.game.scene.environmentIntensity = 0.55;
      })
      .catch((error: unknown) => {
        console.warn('[world/visual-vehicle] 环境贴图加载失败（可容忍，仅观感）', error);
      });
  }
}
