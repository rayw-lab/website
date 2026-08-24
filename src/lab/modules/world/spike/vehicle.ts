// 手写运动学车辆控制器（Phase A Spike · 物理选型路线 1，roadmap §7.2 Step 5）。
// 本质：单刚体运动学 + 自行车转向模型 + 四轮 raycast 贴地 —— 没有约束求解器。
//   - 速度向量分解为纵向/侧向，侧向按 gripRate 指数衰减（= raycast vehicle 的
//     sideFrictionStiffness 的运动学等价物：调低即漂移，调高即轨道车）；
//   - 引擎力沿用 folio 的软限速模式：超速后按 1/(1+overflow×k) 衰减，无硬 clamp；
//   - 贴地不是「吸附到 y=0」：四轮心向下打真实 THREE.Raycaster，命中距离拟合
//     出底盘 y/pitch/roll，全部命空则转抛体自由落体（冲出坡道有真实抛物线）。
// 坐标约定：车头 = 局部 +Z；yaw=0 朝 +Z，正 yaw 向 +X 旋转（= 左转）；
//   right = forward × up = (-fz, 0, fx)。wheelPoints 的 z 为「右侧为正」。
// 参数全部集中在 params.ts（Spike 决策记录的引用源）。
import * as THREE from 'three/webgpu';
import { VEHICLE_PARAMS as P } from './params';

/** 每帧驾驶意图（inputs.ts 产出；folio Player 意图层的精简版） */
export interface DriveIntent {
  /** 油门 -1（倒车）~ 1（前进） */
  throttle: number;
  /** 转向 -1（右）~ 1（左） */
  steer: number;
  boost: boolean;
  brake: boolean;
}

export interface VehicleGeometry {
  /** 轴距 m（从 CarConcept 轮心实测） */
  wheelbase: number;
  /** 轮距 m（左右轮心距，实测） */
  track: number;
  /** 轮半径 m（实测，驱动视觉转速） */
  wheelRadius: number;
}

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

/** 角度归一化到 -π ~ π */
function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export class KinematicVehicle {
  /** 底盘参考点（几何中心）世界坐标 */
  readonly position = new THREE.Vector3(P.spawn.x, 0, P.spawn.z);
  /** 平面速度向量 */
  readonly velocity = new THREE.Vector3();
  /** 航向角（绕 y，0 = +Z 方向） */
  yaw = P.spawn.yaw;
  /** 当前前轮转角 rad（阻尼插值后的实际值） */
  steer = 0;
  /** 纵向签名速度 m/s（>0 前进）；HUD 与视觉转速消费 */
  speed = 0;
  /** 四轮是否触地（≥3 轮命中） */
  grounded = true;
  /** 视觉车轮累计滚转 rad */
  wheelSpin = 0;
  /** 贴地拟合后的底盘位姿（y/pitch/roll，含视觉戏剧化），供 carRig 消费 */
  readonly pose = { y: 0, pitch: 0, roll: 0 };

  private readonly geom: VehicleGeometry;
  /** 四轮采样点（局部系 {x: 右+, z: 前+} 改记作 {fwd, right}） */
  private readonly wheelPoints: { fwd: number; right: number }[];
  private readonly raycaster = new THREE.Raycaster();
  private readonly tmpOrigin = new THREE.Vector3();
  private readonly tmpForward = new THREE.Vector3();
  private readonly tmpRight = new THREE.Vector3();
  private lastLongAccel = 0;
  private lastLatAccel = 0;
  /** 悬空时的竖直速度 */
  private fallVelocity = 0;

  constructor(geom: VehicleGeometry) {
    this.geom = geom;
    const hb = geom.wheelbase / 2;
    const ht = geom.track / 2;
    this.wheelPoints = [
      { fwd: hb, right: ht },
      { fwd: hb, right: -ht },
      { fwd: -hb, right: ht },
      { fwd: -hb, right: -ht },
    ];
    this.raycaster.far = P.rayLift + P.rayLength;
  }

  /** 航向单位向量（平面） */
  forwardDir(out: THREE.Vector3): THREE.Vector3 {
    return out.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  respawn(): void {
    this.position.set(P.spawn.x, 0, P.spawn.z);
    this.velocity.set(0, 0, 0);
    this.yaw = P.spawn.yaw;
    this.steer = 0;
    this.speed = 0;
    this.fallVelocity = 0;
    this.pose.y = 0;
    this.pose.pitch = 0;
    this.pose.roll = 0;
  }

  /**
   * 单步积分。dt 已由调用方做滑动平均 + clamp（folio「车辆 dt 与 world
   * 瞬时 dt 分离」的等价纪律，防帧尖峰打乱手感积分）。
   */
  step(dt: number, intent: DriveIntent, groundMeshes: THREE.Object3D[]): void {
    const forward = this.forwardDir(this.tmpForward);
    const right = this.tmpRight.set(-forward.z, 0, forward.x);

    // ---- 速度分解（平面分量） ----
    let vLong = this.velocity.x * forward.x + this.velocity.z * forward.z;
    let vLat = this.velocity.x * right.x + this.velocity.z * right.z;

    // ---- 转向：输入阻尼 + 高速收紧 ----
    const steerMax = P.maxSteer / (1 + Math.abs(vLong) * P.steerSpeedDrop);
    const steerTarget = intent.steer * steerMax;
    this.steer += (steerTarget - this.steer) * Math.min(1, P.steerLerpRate * dt);

    // ---- 引擎力三分支（folio pre-physics L460-482 的运动学移植） ----
    let accel = 0;
    let reverseBraking = false;
    const opposing =
      intent.throttle !== 0 &&
      Math.abs(vLong) > P.reverseBrakeMinSpeed &&
      Math.sign(intent.throttle) !== Math.sign(vLong);
    if (opposing) {
      reverseBraking = true; // c. 换向刹停：先刹停再倒车（真车手感）
    } else if (intent.throttle !== 0) {
      const boostK = intent.boost ? P.boostAccelFactor : 1;
      const top =
        intent.throttle > 0
          ? intent.boost
            ? P.topSpeedBoost
            : P.topSpeed
          : P.topSpeedReverse;
      const overflow = Math.max(0, Math.abs(vLong) - top);
      // folio 软限速：无硬 clamp，超速后引擎力按 1/(1+overflow×k) 衰减
      accel = (intent.throttle * P.engineAccel * boostK) / (1 + overflow * P.overflowSlope);
    }

    // ---- 纵向积分：引擎 + 刹车 + 怠速阻力（仅触地时有力可施） ----
    if (this.grounded) {
      vLong += accel * dt;
      const applyBrake = (decel: number) => {
        const dv = decel * dt;
        vLong = Math.abs(vLong) <= dv ? 0 : vLong - Math.sign(vLong) * dv;
      };
      if (intent.brake) applyBrake(P.brakeDecel);
      if (reverseBraking) applyBrake(P.reverseBrakeDecel);
      if (intent.throttle === 0 && !intent.brake) {
        vLong *= Math.exp(-P.idleDrag * dt); // 怠速滑行（folio idleBrake 连续化）
        applyBrake(P.rollingDecel);
      }
      // ---- 侧向抓地：指数衰减（sideFrictionStiffness 的运动学等价物） ----
      const grip =
        intent.boost && Math.abs(vLong) > P.topSpeed * 0.6
          ? P.gripRate * P.boostGripFactor
          : P.gripRate;
      vLat *= Math.exp(-grip * dt);
    }

    // ---- 自行车模型 yaw 积分（正 steer → 正 yawRate → 左转） ----
    let yawRate = 0;
    if (this.grounded && Math.abs(vLong) > 0.05) {
      yawRate = (vLong / this.geom.wheelbase) * Math.tan(this.steer);
      this.yaw = wrapAngle(this.yaw + yawRate * dt);
      forward.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      right.set(-forward.z, 0, forward.x);
    }

    // ---- 合成速度并推进位置 ----
    const prevSpeed = this.speed;
    this.velocity.set(
      forward.x * vLong + right.x * vLat,
      0,
      forward.z * vLong + right.z * vLat,
    );
    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
    this.speed = vLong;
    this.wheelSpin += (vLong / this.geom.wheelRadius) * dt;

    // 视觉戏剧化输入（纯观感，不回写物理）：纵向加速度 + 向心加速度
    this.lastLongAccel = (vLong - prevSpeed) / Math.max(dt, 1e-4);
    this.lastLatAccel = vLong * yawRate;

    // ---- 四轮 raycast 贴地 ----
    this.updateGroundPose(dt, forward, right, groundMeshes);
  }

  /**
   * 四轮心上方 rayLift 处向下打射线；≥3 轮命中 → 前后差拟合 pitch、
   * 左右差拟合 roll、均值拟合 y；否则转抛体自由落体。
   */
  private updateGroundPose(
    dt: number,
    forward: THREE.Vector3,
    right: THREE.Vector3,
    groundMeshes: THREE.Object3D[],
  ): void {
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
      const targetPitch = Math.atan2(rearY / 2 - frontY / 2, this.geom.wheelbase);
      const targetRoll = Math.atan2(leftY / 2 - rightY / 2, this.geom.track);

      // 视觉戏剧化：加速后蹲/刹车点头（rotateX 正 = 低头）+ 过弯外倾（rotateZ 正 = 左高右低）
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

  /** 把位姿写入车身容器（carRig 根节点）：yaw → pitch → roll */
  applyToObject(obj: THREE.Object3D): void {
    obj.position.set(this.position.x, this.pose.y, this.position.z);
    obj.rotation.set(0, 0, 0);
    obj.rotateOnWorldAxis(UP, this.yaw);
    obj.rotateX(this.pose.pitch);
    obj.rotateZ(this.pose.roll);
  }
}
