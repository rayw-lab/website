// 运动学回退档（SRD §12.7.5「世界永远能开」）：spike 手写控制器
// （src/lab/modules/world/spike/vehicle.ts，Phase A 决策记录的验证对象）迁入引擎层，
// 实现与 PhysicsVehicle 相同的 PlayerVehicle 契约——Rapier wasm 加载失败或
// ?vehicle=kinematic 显式指定时热切换，玩家侧（Player/View/VisualVehicle）零感知。
// 本质：单刚体运动学 + 自行车转向模型 + 四轮 raycast 贴地——没有约束求解器，
// 不依赖 Rapier（游离于 physics 系统之外，raycast 打的是视觉地面网格）。
//
// 与 spike 原版的差异（迁入改动，其余数值原封）：
//   · 坐标约定从 spike「车头 +Z / yaw=0 朝 +Z」换到 folio 底盘约定
//     「车头 +X / rotationY=r → 世界前向 (cos r, 0, -sin r)」——数学同构，
//     只换基向量展开（forward = (cos, 0, -sin)，right = (-f.z, 0, f.x)）；
//   · 几何（轴距/轮距/轮半径）不再从 CarConcept 实测，直接用 folio 物理脚印
//     （轮位 ±0.9/±0.75、半径 0.4），与 PhysicsVehicle/VisualVehicle 同一套；
//   · 时基：参数是 SI 真实秒标定（spike 决策），dt 用 ticker.deltaAverage
//     （30 帧滑动平均，本身已被 maxDelta=1/30 钳制）——★ 不乘 Ticker.scale=2，
//     两套参数不可混搭（spike params.ts 头注红线）；
//   · 出生/复位走 PlayerVehicle.moveTo（重生点存地面坐标，position 自行抬升
//     离地净高），不再内置 spawn 常量；
//   · 锥桶扫掠碰撞/场地边界夹持是 spike 场景逻辑，不属于车辆——不迁；
//     运动学档下锥桶无互动（物理域不同），验收留档说明。
// 砍除：无（车辆积分逻辑全量保留：软限速/换向刹停/怠速滑行/侧向抓地/
//       四轮贴地拟合 pitch·roll/悬空抛体/视觉戏剧化后蹲点头）。
import * as THREE from 'three/webgpu';
import { Events } from '../core/Events';
import {
  VEHICLE_GROUND_CLEARANCE,
  type PlayerVehicle,
  type PlayerVehicleWheelState,
} from './Player';
import type { Game } from '../core/Game';

/**
 * 手感参数：spike params.ts VEHICLE_PARAMS 原值拷贝（决策记录引用源）。
 * 单位 SI（米/秒/真实秒）。拷贝而非 import——spike/ 目录 CC-E2 整体退役，
 * 引擎层不得对其产生模块依赖。
 */
const P = {
  /* ———— 驱动（folio：engineForce = accel × 300 / (1+overflow) × deltaScaled） ———— */
  engineAccel: 24,
  boostAccelFactor: 1.7,
  topSpeed: 18,
  topSpeedBoost: 28,
  topSpeedReverse: 7,
  overflowSlope: 1.6,
  overspeedDecay: 0.9,
  /* ———— 制动与阻力 ———— */
  brakeDecel: 30,
  reverseBrakeDecel: 22,
  reverseBrakeMinSpeed: 0.6,
  idleDrag: 0.55,
  rollingDecel: 1.1,
  /* ———— 转向 ———— */
  maxSteer: 0.6,
  steerSpeedDrop: 0.055,
  steerLerpRate: 11,
  /* ———— 抓地 / 漂移 ———— */
  gripRate: 7.0,
  boostGripFactor: 0.55,
  /* ———— 贴地（raycast 悬挂的运动学替身） ———— */
  rayLift: 1.6,
  rayLength: 4.0,
  poseLerpRate: 9,
  gravity: 9.81,
  /* ———— 车身戏剧化（纯视觉，不进积分） ———— */
  visualRollK: 0.011,
  visualPitchK: 0.009,
  visualTiltMax: 0.09,
} as const;

/** 几何 = folio 物理脚印（PhysicsVehicle 轮位 ±0.9/±0.75、半径 0.4），三件套同一口径 */
const GEOM = { wheelbase: 1.8, track: 1.5, wheelRadius: 0.4 } as const;

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

/** 角度归一化到 -π ~ π */
function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export class KinematicFallback implements PlayerVehicle {
  private readonly game: Game;
  readonly events = new Events();

  /* ———— PlayerVehicle 契约面 ———— */
  readonly position = new THREE.Vector3(0, VEHICLE_GROUND_CLEARANCE, 0);
  readonly quaternion = new THREE.Quaternion();
  readonly forward = new THREE.Vector3(1, 0, 0);
  readonly upward = new THREE.Vector3(0, 1, 0);
  /** 有符号前向速度 m/s（本实现 SI 时基——与 PhysicsVehicle 的 folio 单位不同，契约已声明） */
  forwardSpeed = 0;
  wheelSpin = 0;
  /** 本实现内置输入阻尼（steerLerpRate），暴露的是已平滑值；视觉层再叠一层无妨 */
  steeringTarget = 0;
  /** 运动学档无悬挂行程（贴地拟合在底盘姿态里），offset 恒 0；inContact = 贴地判定 */
  readonly wheels: PlayerVehicleWheelState[] = [
    { suspensionOffset: 0, inContact: true },
    { suspensionOffset: 0, inContact: true },
    { suspensionOffset: 0, inContact: true },
    { suspensionOffset: 0, inContact: true },
  ];
  /** 运动学档不会翻车 */
  readonly upsideDownActive = false;

  /* ———— 内部状态（spike KinematicVehicle 原字段） ———— */
  /** 航向角：folio rotationY 口径（前向 = (cos, 0, -sin)） */
  private yaw = 0;
  private readonly velocity = new THREE.Vector3();
  private steer = 0;
  private grounded = true;
  /** 贴地拟合后的底盘位姿（y = 地面高度；pitch/roll 含视觉戏剧化） */
  private readonly pose = { y: 0, pitch: 0, roll: 0 };
  private fallVelocity = 0;
  private lastLongAccel = 0;
  private lastLatAccel = 0;

  /** 双阈值滞回 stop/start（folio 检测器语义，SI 阈值） */
  private stopActive = true;

  private readonly wheelPoints: { fwd: number; right: number }[];
  private readonly raycaster = new THREE.Raycaster();
  private readonly tmpOrigin = new THREE.Vector3();
  private readonly tmpForward = new THREE.Vector3();
  private readonly tmpRight = new THREE.Vector3();
  private readonly tmpEuler = new THREE.Euler();

  constructor(game: Game) {
    this.game = game;

    const hb = GEOM.wheelbase / 2;
    const ht = GEOM.track / 2;
    this.wheelPoints = [
      { fwd: hb, right: ht },
      { fwd: hb, right: -ht },
      { fwd: -hb, right: ht },
      { fwd: -hb, right: -ht },
    ];
    this.raycaster.far = P.rayLift + P.rayLength;

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      2, // order 2：与 PhysicsVehicle pre 同槽位（本档无 post——积分即终态）
    );
  }

  /** 航向单位向量（folio 口径：yaw=r → (cos r, 0, -sin r)） */
  private forwardDir(out: THREE.Vector3): THREE.Vector3 {
    return out.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
  }

  moveTo(position: THREE.Vector3, rotationY = 0): void {
    this.position.set(position.x, position.y + VEHICLE_GROUND_CLEARANCE, position.z);
    this.pose.y = position.y;
    this.pose.pitch = 0;
    this.pose.roll = 0;
    this.yaw = rotationY;
    this.velocity.set(0, 0, 0);
    this.steer = 0;
    this.steeringTarget = 0;
    this.forwardSpeed = 0;
    this.fallVelocity = 0;
    this.grounded = true;
    this.syncPose();
  }

  /** 运动学档不会翻车：契约要求的方法保留为 no-op */
  flipJump(): void {}

  private update(): void {
    const player = this.game.player;
    if (!player) return;

    // ★ SI 时基：30 帧滑动平均真实秒（delta 已被 maxDelta=1/30 钳制），不乘 scale
    const dt = this.game.ticker.deltaAverage;

    // Player 意图 → spike DriveIntent 形状
    const throttle = clamp(player.accelerating, -1, 1);
    const steerInput = clamp(player.steering, -1, 1);
    const boost = player.boosting > 0.5;
    const brake = player.braking > 0.5;

    const forward = this.forwardDir(this.tmpForward);
    const right = this.tmpRight.set(-forward.z, 0, forward.x);

    // ---- 速度分解（平面分量） ----
    let vLong = this.velocity.x * forward.x + this.velocity.z * forward.z;
    let vLat = this.velocity.x * right.x + this.velocity.z * right.z;

    // ---- 转向：输入阻尼 + 高速收紧 ----
    const steerMax = P.maxSteer / (1 + Math.abs(vLong) * P.steerSpeedDrop);
    const steerTarget = steerInput * steerMax;
    this.steer += (steerTarget - this.steer) * Math.min(1, P.steerLerpRate * dt);

    // ---- 引擎力三分支（folio pre-physics 的运动学移植） ----
    let accel = 0;
    let reverseBraking = false;
    const opposing =
      throttle !== 0 &&
      Math.abs(vLong) > P.reverseBrakeMinSpeed &&
      Math.sign(throttle) !== Math.sign(vLong);
    if (opposing) {
      reverseBraking = true; // 换向刹停：先刹停再倒车（真车手感）
    } else if (throttle !== 0) {
      const boostK = boost ? P.boostAccelFactor : 1;
      const top = throttle > 0 ? (boost ? P.topSpeedBoost : P.topSpeed) : P.topSpeedReverse;
      const overflow = Math.max(0, Math.abs(vLong) - top);
      // folio 软限速：无硬 clamp，超速后引擎力按 1/(1+overflow×k) 衰减
      accel = (throttle * P.engineAccel * boostK) / (1 + overflow * P.overflowSlope);
    }

    // ---- 纵向积分：引擎 + 刹车 + 怠速阻力（仅触地时有力可施） ----
    if (this.grounded) {
      vLong += accel * dt;
      const applyBrake = (decel: number) => {
        const dv = decel * dt;
        vLong = Math.abs(vLong) <= dv ? 0 : vLong - Math.sign(vLong) * dv;
      };
      if (brake) applyBrake(P.brakeDecel);
      if (reverseBraking) applyBrake(P.reverseBrakeDecel);
      if (throttle === 0 && !brake) {
        vLong *= Math.exp(-P.idleDrag * dt); // 怠速滑行（folio idleBrake 连续化）
        applyBrake(P.rollingDecel);
      }
      // 超速回落：向当前档软限速指数逼近（运动学模型的「轮胎阻力」替身）
      const cap = vLong >= 0 ? (boost ? P.topSpeedBoost : P.topSpeed) : P.topSpeedReverse;
      if (Math.abs(vLong) > cap) {
        const sign = Math.sign(vLong);
        vLong = sign * (cap + (Math.abs(vLong) - cap) * Math.exp(-P.overspeedDecay * dt));
      }
      // ---- 侧向抓地：指数衰减（sideFrictionStiffness 的运动学等价物） ----
      const grip =
        boost && Math.abs(vLong) > P.topSpeed * 0.6 ? P.gripRate * P.boostGripFactor : P.gripRate;
      vLat *= Math.exp(-grip * dt);
    }

    // ---- 自行车模型 yaw 积分（正 steer → 正 yawRate → 左转） ----
    let yawRate = 0;
    if (this.grounded && Math.abs(vLong) > 0.05) {
      yawRate = (vLong / GEOM.wheelbase) * Math.tan(this.steer);
      this.yaw = wrapAngle(this.yaw + yawRate * dt);
      this.forwardDir(forward);
      right.set(-forward.z, 0, forward.x);
    }

    // ---- 合成速度并推进位置 ----
    const prevSpeed = this.forwardSpeed;
    this.velocity.set(
      forward.x * vLong + right.x * vLat,
      0,
      forward.z * vLong + right.z * vLat,
    );
    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
    this.forwardSpeed = vLong;
    this.wheelSpin += (vLong / GEOM.wheelRadius) * dt;
    this.steeringTarget = this.steer;

    // 视觉戏剧化输入（纯观感，不回写积分）：纵向加速度 + 向心加速度
    this.lastLongAccel = (vLong - prevSpeed) / Math.max(dt, 1e-4);
    this.lastLatAccel = vLong * yawRate;

    // ---- 四轮 raycast 贴地 ----
    this.updateGroundPose(dt, forward, right);

    // ---- 契约回读面 ----
    this.syncPose();
    for (const wheel of this.wheels) wheel.inContact = this.grounded;
    this.testStop(Math.abs(vLong));
  }

  /**
   * 四轮心上方 rayLift 处向下打射线（目标 = 视觉地面网格，不依赖 Rapier）；
   * ≥3 轮命中 → 前后差拟合 pitch、左右差拟合 roll、均值拟合 y；否则转抛体自由落体。
   */
  private updateGroundPose(dt: number, forward: THREE.Vector3, right: THREE.Vector3): void {
    const groundMeshes: THREE.Object3D[] = this.game.world.ground ? [this.game.world.ground] : [];

    let n = 0;
    let sumY = 0;
    let frontY = 0;
    let rearY = 0;
    let leftY = 0;
    let rightY = 0;
    for (const wp of this.wheelPoints) {
      this.tmpOrigin
        .copy(this.position)
        .addScaledVector(forward, wp.fwd)
        .addScaledVector(right, wp.right);
      this.tmpOrigin.y = this.pose.y + P.rayLift;
      this.raycaster.set(this.tmpOrigin, DOWN);
      const hit = this.raycaster.intersectObjects(groundMeshes, false)[0];
      if (!hit) continue;
      n++;
      sumY += hit.point.y;
      if (wp.fwd > 0) frontY += hit.point.y;
      else rearY += hit.point.y;
      if (wp.right > 0) rightY += hit.point.y;
      else leftY += hit.point.y;
    }

    if (n >= 3) {
      this.grounded = true;
      this.fallVelocity = 0;
      const targetY = sumY / n;
      // 每侧均值（四轮全命中时每组恰 2 个；3 命中时以 0.5 权重近似，观感足够）
      const targetPitch = Math.atan2(rearY / 2 - frontY / 2, GEOM.wheelbase);
      const targetRoll = Math.atan2(leftY / 2 - rightY / 2, GEOM.track);

      // 视觉戏剧化：加速后蹲/刹车点头（pitch 正 = 低头）+ 过弯外倾（roll 正 = 左高右低）
      const dramaPitch = clamp(-this.lastLongAccel * P.visualPitchK, -P.visualTiltMax, P.visualTiltMax);
      const dramaRoll = clamp(this.lastLatAccel * P.visualRollK, -P.visualTiltMax, P.visualTiltMax);

      const k = Math.min(1, P.poseLerpRate * dt);
      this.pose.y += (targetY - this.pose.y) * k;
      this.pose.pitch += (targetPitch + dramaPitch - this.pose.pitch) * k;
      this.pose.roll += (targetRoll + dramaRoll - this.pose.roll) * k;
    } else {
      // 悬空：抛体下落，姿态缓慢回平
      this.grounded = false;
      this.fallVelocity -= P.gravity * dt;
      this.pose.y += this.fallVelocity * dt;
      const k = Math.min(1, 2.2 * dt);
      this.pose.pitch -= this.pose.pitch * k;
      this.pose.roll -= this.pose.roll * k;
      // 落地兜底：中心射线
      this.tmpOrigin.copy(this.position);
      this.tmpOrigin.y = this.pose.y + P.rayLift;
      this.raycaster.set(this.tmpOrigin, DOWN);
      const hit = this.raycaster.intersectObjects(groundMeshes, false)[0];
      if (hit && this.pose.y <= hit.point.y) {
        this.pose.y = hit.point.y;
        this.grounded = true;
        this.fallVelocity = 0;
      }
    }
  }

  /** 位姿 → 契约回读面（yaw → pitch → roll，与 spike applyToObject 同序） */
  private syncPose(): void {
    this.position.y = this.pose.y + VEHICLE_GROUND_CLEARANCE;

    // folio 前向 (cos r, 0, -sin r) 恰为「绕 +Y 旋转 r 应用到 +X」——直接 setFromAxisAngle
    this.quaternion.setFromAxisAngle(UP, this.yaw);
    this.tmpEuler.set(this.pose.pitch, 0, this.pose.roll, 'XYZ');
    this.quaternion.multiply(new THREE.Quaternion().setFromEuler(this.tmpEuler));

    this.forward.set(1, 0, 0).applyQuaternion(this.quaternion);
    this.upward.set(0, 1, 0).applyQuaternion(this.quaternion);
  }

  /** stop/start 双阈值滞回（folio 检测器语义；SI 阈值 0.05 / 0.7 m/s） */
  private testStop(speedAbs: number): void {
    if (speedAbs < 0.05) {
      if (!this.stopActive) {
        this.stopActive = true;
        this.events.trigger('stop');
      }
    } else if (speedAbs > 0.7) {
      if (this.stopActive) {
        this.stopActive = false;
        this.events.trigger('start');
      }
    }
  }
}
