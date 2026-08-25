// 移植自 folio-2025 sources/Game/Physics/PhysicsVehicle.js（590 行 → TS，
// gap 报告 §8.2 第 5 项 / SRD §12.7.5 物理主路径 / teardown §5 复现手册）。
// raycast vehicle 本质：轮子不是刚体，是从底盘向下打的 4 条射线；悬挂力 = 弹簧-阻尼
// 作用于底盘；驱动/转向 = 沿接触点切向施力。Rapier DynamicRayCastVehicleController
// 内置全部数值积分，本类只做参数与状态管理。
//
// ★ 参数表原封不动起步（roadmap §7.2 决策点 2 / CC-E1 验收）：
//   · 底盘三 collider：主体 mass 2.5 + centerOfMass.y=-0.5 压质心（防翻车第一要素）、
//     车顶零质量纯碰撞、推土铲 bumper 分组（撞飞道具、不被小物件绊住）；
//   · 轮参表：frictionSlip 0.9 / sideFrictionStiffness 3（漂移手感核心旋钮）/
//     悬挂三档 restLength 0.88/1.23/1.63 + stiffness 20/30/40（可玩悬挂 = 跳跃来源）；
//   · 两段式 tick：order 2 pre（写引擎力/刹车/转向/悬挂 + updateVehicle）/
//     order 5 post（回读位姿 + 测速 + 四状态检测器）；
//   · controller dt = min(1/60, 30 帧滑动平均)——与 world.step 的瞬时 deltaScaled 分离，
//     帧尖峰只影响世界、不打乱悬挂积分（§5.3）；
//   · 全部数值依赖 Ticker.scale = 2（隐藏参数，§5.4——抄参数必须连 Ticker 一起抄）。
// 砍除：碰撞音效（onCollision → audio.hitDefault）、冰面摩擦插值（无 waterSurface）、
//       waterGravityMultiplier（无水体）、debug 面板；backWheel 检测器 folio 已注释不搬。
// 改动：去 Game 单例；实现 player/Player.ts 的 PlayerVehicle 契约（与 KinematicFallback
//       同接口热切换）；moveTo 自行抬升离地净高（本站重生点存地面坐标，folio 的
//       respawn GLB 自带高程）；新增 wheelSpin / steeringTarget / wheels 视觉消费面。
import * as THREE from 'three/webgpu';
import type { DynamicRayCastVehicleController } from '@dimforge/rapier3d';
import { Events } from '../core/Events';
import { clamp, lerp, smallestAngle } from '../utils/maths';
import {
  VEHICLE_GROUND_CLEARANCE,
  type PlayerVehicle,
  type PlayerVehicleWheelState,
  type SuspensionState,
} from '../player/Player';
import type { Game } from '../core/Game';
import type { Physical } from './Physics';

/** 物理轮状态（folio wheels.items 元素，L120-137） */
interface PhysicsWheel {
  inContact: boolean;
  contactPoint: { x: number; y: number; z: number } | null;
  suspensionLength: number | null;
  lastTouchTime: number;
  basePosition: THREE.Vector3;
}

/**
 * 轮序映射：接口视觉序（0 前左 / 1 前右 / 2 后左 / 3 后右）→ folio 物理序。
 * folio 轮位（L158-163，底盘局部 +X 车头 / +Z 右侧）：
 * 0=(+x,+z)前右 1=(+x,-z)前左 2=(-x,+z)后右 3=(-x,-z)后左。
 */
const SITE_TO_FOLIO = [1, 0, 3, 2] as const;

export class PhysicsVehicle implements PlayerVehicle {
  private readonly game: Game;
  readonly events = new Events();

  /* ———— 手感参数（folio L14-40 原值，勿凭直觉改） ———— */
  steeringAmplitude = 0.5;
  engineForceAmplitude = 300;
  boostMultiplier = 2;
  topSpeed = 5;
  topSpeedBoost = 40;
  brakeAmplitude = 35;
  idleBrake = 0.06;
  reverseBrake = 0.4;
  /** 可玩悬挂三档：restLength（low=常态 mid=低趴 high=跳跃——弹簧瞬间加长把车弹起来） */
  readonly suspensionsHeights: Record<SuspensionState, number> = {
    low: 0.88,
    mid: 1.23,
    high: 1.63,
  };
  readonly suspensionsStiffness: Record<SuspensionState, number> = {
    low: 20,
    mid: 30,
    high: 40,
  };

  /* ———— 位姿与测量（post-physics 回读，folio L23-31 / L515-535） ———— */
  readonly sideward = new THREE.Vector3(0, 0, 1);
  readonly upward = new THREE.Vector3(0, 1, 0);
  readonly forward = new THREE.Vector3(1, 0, 0);
  readonly position = new THREE.Vector3(0, 4, 0);
  readonly quaternion = new THREE.Quaternion();
  velocity = new THREE.Vector3();
  direction = new THREE.Vector3(1, 0, 0);
  /** 速度标量（folio 口径：位置差分 / deltaScaled，非引擎报告值） */
  speed = 0;
  xzSpeed = 0;
  forwardRatio = 0;
  goingForward = true;
  forwardSpeed = 0;
  /** PlayerVehicle 契约：视觉轮累计滚转 / 前轮转角目标 */
  wheelSpin = 0;
  steeringTarget = 0;
  readonly wheels: PlayerVehicleWheelState[] = [
    { suspensionOffset: 0, inContact: false },
    { suspensionOffset: 0, inContact: false },
    { suspensionOffset: 0, inContact: false },
    { suspensionOffset: 0, inContact: false },
  ];

  private xRotation = 0;
  private zRotation = 0;

  private chassis!: { physical: Physical; mass: number };
  private controller!: DynamicRayCastVehicleController;

  /** 物理轮组（folio wheels 结构；接口面 wheels 为视觉序投影） */
  readonly wheelsPhysics = {
    inContactCount: 0,
    justTouchedCount: 0,
    items: [] as PhysicsWheel[],
    settings: {
      offset: { x: 0.9, y: 0, z: 0.75 },
      radius: 0.4,
      directionCs: { x: 0, y: -1, z: 0 },
      axleCs: { x: 0, y: 0, z: 1 },
      frictionSlip: 0.9,
      maxSuspensionForce: 150,
      maxSuspensionTravel: 2,
      sideFrictionStiffness: 3,
      suspensionCompression: 10,
      suspensionRelaxation: 2.7,
      // folio 设了 suspensionStiffness: 25 但从不经 updateSettings 写入——
      // 每帧按三档表（suspensionsStiffness）写，此处留档不启用
      suspensionStiffness: 25,
    },
  };

  /* ———— 状态检测器（全部滞回设计，防抖动） ———— */
  /** 双阈值滞回：speed < 0.04 → stop；> 0.7 → start（L203-230） */
  readonly stop = { active: true, lowThreshold: 0.04, highThreshold: 0.7 };
  /** upward·(0,-1,0) 归一化 > 0.3 → 翻覆（L232-260） */
  readonly upsideDown = { active: false, ratio: 0, threshold: 0.3 };
  /** 3s 滑动窗口累计位移 < 0.5m 且在踩油门 → 卡死（L262-314，环形缓冲存 [位移,时间] 对） */
  readonly stuck = {
    durationTest: 3,
    durationSaved: 0,
    savedItems: [] as Array<[number, number]>,
    distance: 0,
    distanceThreshold: 0.5,
    active: false,
  };
  /** 翻车自救冲量系数（L347） */
  flipForce = 5;
  private flipInAir = false;
  private flipPreviousXAngle = 0;
  private flipAccumulatedXAngle = 0;
  private flipPreviousZAngle = 0;
  private flipAccumulatedZAngle = 0;

  constructor(game: Game) {
    this.game = game;

    this.setChassis();
    this.controller = this.game.physics.world.createVehicleController(this.chassis.physical.body);
    this.setWheels();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePrePhysics();
      },
      2, // order 2：车辆 pre 在意图结算（1）后、world.step（3）前
    );
    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePostPhysics();
      },
      5, // order 5：车辆 post 在视觉同步（4）后、玩家回读（6）前
    );
  }

  get upsideDownActive(): boolean {
    return this.upsideDown.active;
  }

  /** 底盘三 collider（folio L87-109；分组语义见 Physics.categories） */
  private setChassis(): void {
    const object = this.game.objects.add(null, {
      type: 'dynamic',
      position: this.position,
      friction: 0.4,
      colliders: [
        // 主体：唯一有质量的部分。centerOfMass y=-0.5 手动压低质心 ← 防翻车第一要素
        {
          shape: 'cuboid',
          mass: 2.5,
          parameters: [1.3, 0.4, 0.85],
          position: { x: 0, y: -0.1, z: 0 },
          centerOfMass: { x: 0, y: -0.5, z: 0 },
        },
        // 车顶：零质量纯碰撞（翻车时车顶着地不穿模）
        { shape: 'cuboid', mass: 0, parameters: [0.5, 0.15, 0.65], position: { x: 0, y: 0.4, z: 0 } },
        // 推土铲：bumper 分组只推 object 组、不碰 floor 组
        {
          shape: 'cuboid',
          mass: 0,
          parameters: [1.5, 0.5, 0.9],
          position: { x: 0.1, y: -0.2, z: 0 },
          category: 'bumper',
        },
      ],
      canSleep: false, // 玩家的车永不休眠
    });

    if (!object.physical) throw new Error('[world/physics-vehicle] 底盘刚体创建失败');
    this.chassis = { physical: object.physical, mass: object.physical.body.mass() };
  }

  /** 四轮注册 + 参数写入（folio L111-201 setWheels/updateSettings） */
  private setWheels(): void {
    for (let i = 0; i < 4; i++) {
      // 先按占位参数注册（folio L131），实际值随 updateSettings 统一写入
      this.controller.addWheel(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), 1, 1);

      this.wheelsPhysics.items.push({
        inContact: false,
        contactPoint: null,
        suspensionLength: null,
        lastTouchTime: this.game.ticker.elapsed,
        basePosition: new THREE.Vector3(),
      });
    }

    this.updateWheelSettings();
  }

  private updateWheelSettings(): void {
    const settings = this.wheelsPhysics.settings;

    const wheelsPositions = [
      new THREE.Vector3(settings.offset.x, settings.offset.y, settings.offset.z),
      new THREE.Vector3(settings.offset.x, settings.offset.y, -settings.offset.z),
      new THREE.Vector3(-settings.offset.x, settings.offset.y, settings.offset.z),
      new THREE.Vector3(-settings.offset.x, settings.offset.y, -settings.offset.z),
    ];

    for (let i = 0; i < this.wheelsPhysics.items.length; i++) {
      const wheel = this.wheelsPhysics.items[i];
      wheel.basePosition.copy(wheelsPositions[i]);

      this.controller.setWheelDirectionCs(i, settings.directionCs);
      this.controller.setWheelAxleCs(i, settings.axleCs);
      this.controller.setWheelRadius(i, settings.radius);
      this.controller.setWheelChassisConnectionPointCs(i, wheel.basePosition);
      this.controller.setWheelFrictionSlip(i, settings.frictionSlip);
      this.controller.setWheelMaxSuspensionForce(i, settings.maxSuspensionForce);
      this.controller.setWheelMaxSuspensionTravel(i, settings.maxSuspensionTravel);
      this.controller.setWheelSideFrictionStiffness(i, settings.sideFrictionStiffness);
      this.controller.setWheelSuspensionCompression(i, settings.suspensionCompression);
      this.controller.setWheelSuspensionRelaxation(i, settings.suspensionRelaxation);
    }
  }

  /** 瞬移（folio L446-455 + 本站离地净高抬升；重生点存地面坐标） */
  moveTo(position: THREE.Vector3, rotation = 0): void {
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation,
    );
    // 小落差 0.12m：出生瞬间悬挂落定微弹（folio 初始位 y=4 的收敛版），防穿地
    const spawnY = position.y + VEHICLE_GROUND_CLEARANCE + 0.12;

    const body = this.chassis.physical.body;
    body.setTranslation({ x: position.x, y: spawnY, z: position.z }, true);
    body.setRotation(quaternion, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    // 立即同步回读面（下一 post tick 前 Player/相机也能拿到正确位姿）
    this.position.set(position.x, spawnY, position.z);
    this.quaternion.copy(quaternion);
    this.sideward.set(0, 0, 1).applyQuaternion(quaternion);
    this.upward.set(0, 1, 0).applyQuaternion(quaternion);
    this.forward.set(1, 0, 0).applyQuaternion(quaternion);
    this.velocity.set(0, 0, 0);
    this.speed = 0;
    this.forwardSpeed = 0;
  }

  /** pre-physics（folio L457-513，order 2）：意图 → 引擎力/刹车/转向/悬挡 → updateVehicle */
  private updatePrePhysics(): void {
    const player = this.game.player;
    if (!player) return;

    // 1. 引擎力：无硬限速——超速后按 1/(1+overflow) 软衰减（下坡能自然超过 topSpeed）
    const topSpeed = lerp(this.topSpeed, this.topSpeedBoost, player.boosting);
    const overflowSpeed = Math.max(0, this.speed - topSpeed);
    let engineForce =
      ((player.accelerating * (1 + player.boosting * this.boostMultiplier)) *
        this.engineForceAmplitude) /
      (1 + overflowSpeed) /
      1 *
      this.game.ticker.deltaScaled;

    // 2. 刹车三分支：主动刹车 / 怠速阻力（车会慢慢滑停）/ 换向刹停（先刹停再倒车）
    let brake = player.braking;

    if (!player.braking && Math.abs(player.accelerating) < 0.1) brake = this.idleBrake;

    if (
      this.speed > 0.5 &&
      ((player.accelerating > 0 && !this.goingForward) ||
        (player.accelerating < 0 && this.goingForward))
    ) {
      brake = this.reverseBrake;
      engineForce = 0;
    }

    brake *= this.brakeAmplitude * this.game.ticker.deltaScaled;

    // 3. 转向：前两轮直写，无渐进无插值（视觉平滑在 VisualVehicle 层）
    const steer = player.steering * this.steeringAmplitude;
    this.steeringTarget = steer;
    this.controller.setWheelSteering(0, steer);
    this.controller.setWheelSteering(1, steer);

    // 4. 逐轮写入 brake / engineForce / 悬挂档位（冰面摩擦插值段砍除——无水面系统）
    for (let i = 0; i < 4; i++) {
      this.controller.setWheelBrake(i, brake);
      this.controller.setWheelEngineForce(i, engineForce);
      this.controller.setWheelSuspensionRestLength(
        i,
        this.suspensionsHeights[player.suspensions[i]],
      );
      this.controller.setWheelSuspensionStiffness(
        i,
        this.suspensionsStiffness[player.suspensions[i]],
      );
    }

    // 5. ★ 车辆控制器 dt = 30 帧滑动平均 + 1/60 封顶（与 world.step 的瞬时 dt 分离）
    const delta =
      this.game.quality.level === 1 ? 1 / 60 : Math.min(1 / 60, this.game.ticker.deltaAverage);
    this.controller.updateVehicle(delta);
  }

  /** post-physics（folio L515-578，order 5）：位姿回读 + 测速 + 轮接触 + 状态检测 */
  private updatePostPhysics(): void {
    const player = this.game.player;
    if (!player) return;

    const body = this.chassis.physical.body;

    // 位姿与三基向量
    const newPosition = new THREE.Vector3().copy(body.translation());
    this.velocity = newPosition.clone().sub(this.position);
    this.direction = this.velocity.clone().normalize();
    this.position.copy(newPosition);
    this.quaternion.copy(body.rotation());
    this.sideward.set(0, 0, 1).applyQuaternion(this.quaternion);
    this.upward.set(0, 1, 0).applyQuaternion(this.quaternion);
    this.forward.set(1, 0, 0).applyQuaternion(this.quaternion);

    // 测速：位置差分（不用引擎报告值）
    this.speed = this.velocity.length() / this.game.ticker.deltaScaled;
    this.xzSpeed = Math.hypot(this.velocity.x, this.velocity.z) / this.game.ticker.deltaScaled;
    this.forwardRatio = this.direction.dot(this.forward);
    this.goingForward = this.forwardRatio > 0.5;
    this.forwardSpeed = this.speed * this.forwardRatio;

    // 视觉轮累计滚转：本帧位移 / 物理轮半径（PlayerVehicle 契约）
    this.wheelSpin +=
      (this.forwardSpeed * this.game.ticker.deltaScaled) / this.wheelsPhysics.settings.radius;

    this.xRotation = new THREE.Euler().setFromQuaternion(this.quaternion, 'XYZ').x;
    this.zRotation = new THREE.Euler().setFromQuaternion(this.quaternion, 'ZYX').z;

    if (Math.abs(player.accelerating) > 0.5)
      this.stuckAccumulate(this.velocity.length(), this.game.ticker.deltaScaled);

    // 轮子接触统计（inContactCount + 0.2s 窗口 justTouchedCount）
    let inContactCount = 0;
    for (let i = 0; i < 4; i++) {
      const wheel = this.wheelsPhysics.items[i];

      const inContact = this.controller.wheelIsInContact(i);
      if (inContact && !wheel.inContact) wheel.lastTouchTime = this.game.ticker.elapsed;

      wheel.inContact = inContact;
      wheel.contactPoint = this.controller.wheelContactPoint(i);
      wheel.suspensionLength = this.controller.wheelSuspensionLength(i);

      if (wheel.inContact) inContactCount++;
    }

    let justTouchedCount = 0;
    if (inContactCount > this.wheelsPhysics.inContactCount) {
      for (const wheel of this.wheelsPhysics.items) {
        if (wheel.lastTouchTime > this.game.ticker.elapsed - 0.2) justTouchedCount++;
      }
    }

    this.wheelsPhysics.inContactCount = inContactCount;
    this.wheelsPhysics.justTouchedCount = justTouchedCount;

    // 接口面：视觉序四轮状态（悬挂行程差；上抬按 folio wheelY ≤ -0.5 语义封顶 0.38）
    const restLow = this.suspensionsHeights.low;
    for (let s = 0; s < 4; s++) {
      const wheel = this.wheelsPhysics.items[SITE_TO_FOLIO[s]];
      const suspensionLength = wheel.suspensionLength ?? restLow;
      this.wheels[s].inContact = wheel.inContact;
      this.wheels[s].suspensionOffset = clamp(restLow - suspensionLength, -1.0, 0.38);
    }

    this.testStop();
    this.testUpsideDown();
    this.testStuck();
    this.testFlip();
  }

  private testStop(): void {
    if (this.speed < this.stop.lowThreshold) {
      if (!this.stop.active) {
        this.stop.active = true;
        this.events.trigger('stop');
      }
    } else if (this.speed > this.stop.highThreshold) {
      if (this.stop.active) {
        this.stop.active = false;
        this.events.trigger('start');
      }
    }
  }

  private testUpsideDown(): void {
    this.upsideDown.ratio = this.upward.dot(new THREE.Vector3(0, -1, 0)) * 0.5 + 0.5;

    if (this.upsideDown.ratio > this.upsideDown.threshold) {
      if (!this.upsideDown.active) {
        this.upsideDown.active = true;
        this.events.trigger('upsideDown', [this.upsideDown.ratio]);
      }
    } else {
      if (this.upsideDown.active) {
        this.upsideDown.active = false;
        this.events.trigger('rightSideUp');
      }
    }
  }

  /** 环形缓冲累计 [位移, 时间] 对（folio L272-293） */
  private stuckAccumulate(traveled: number, time: number): void {
    const stuck = this.stuck;
    stuck.savedItems.unshift([traveled, time]);
    stuck.distance = 0;
    stuck.durationSaved = 0;

    for (let i = 0; i < stuck.savedItems.length; i++) {
      const item = stuck.savedItems[i];

      if (stuck.durationSaved >= stuck.durationTest) {
        stuck.savedItems.splice(i);
        break;
      } else {
        stuck.distance += item[0];
        stuck.durationSaved += item[1];
      }
    }
  }

  private testStuck(): void {
    const stuck = this.stuck;
    if (stuck.durationSaved >= stuck.durationTest && stuck.distance < stuck.distanceThreshold) {
      if (!stuck.active) {
        stuck.active = true;
        this.events.trigger('stuck');
      }
    } else {
      if (stuck.active) {
        stuck.active = false;
        this.events.trigger('unstuck');
      }
    }
  }

  /** 四轮离地期间累计 X/Z 轴转角（smallestAngle 累加防 2π 跳变，L344-402） */
  private testFlip(): void {
    if (this.wheelsPhysics.inContactCount === 0) {
      if (!this.flipInAir) {
        this.flipInAir = true;

        this.flipPreviousXAngle = this.xRotation;
        this.flipAccumulatedXAngle = 0;

        this.flipPreviousZAngle = this.zRotation;
        this.flipAccumulatedZAngle = 0;
      }
    }

    if (this.wheelsPhysics.inContactCount >= 4) {
      if (this.flipInAir) {
        this.flipInAir = false;

        // 落地时 |X 累计|<1 且 |Z 累计|>5 rad → 空翻（前空翻/后空翻）
        if (Math.abs(this.flipAccumulatedXAngle) < 1 && Math.abs(this.flipAccumulatedZAngle) > 5) {
          this.events.trigger('flip', [Math.sign(this.flipAccumulatedZAngle)]);
        }
      }
    } else {
      if (this.flipInAir) {
        this.flipAccumulatedXAngle += smallestAngle(this.flipPreviousXAngle, this.xRotation);
        this.flipPreviousXAngle = this.xRotation;

        this.flipAccumulatedZAngle += smallestAngle(this.flipPreviousZAngle, this.zRotation);
        this.flipPreviousZAngle = this.zRotation;
      }
    }
  }

  /** 翻车自救（folio flip.jump L404-438）：向上冲量 5×mass + 按姿态分支的扭矩把车拧回正面 */
  flipJump(): void {
    this.flipAccumulatedXAngle = 0;
    this.flipAccumulatedZAngle = 0;

    const up = new THREE.Vector3(0, 1, 0);
    const sidewardDot = up.dot(this.sideward);
    const forwardDot = up.dot(this.forward);
    const upwardDot = up.dot(this.upward);

    const sidewardAbsolute = Math.abs(sidewardDot);
    const forwardAbsolute = Math.abs(forwardDot);
    const upwardAbsolute = Math.abs(upwardDot);

    const body = this.chassis.physical.body;
    const bodyQuaternion = new THREE.Quaternion().copy(body.rotation());

    const impulse = new THREE.Vector3(0, 1, 0).multiplyScalar(this.flipForce * this.chassis.mass);
    body.applyImpulse(impulse, true);

    if (upwardAbsolute > sidewardAbsolute && upwardAbsolute > forwardAbsolute) {
      // 四脚朝天：固定 X 扭矩
      const torque = new THREE.Vector3(0.8 * this.chassis.mass, 0, 0);
      torque.applyQuaternion(bodyQuaternion);
      body.applyTorqueImpulse(torque, true);
    } else {
      // 侧翻：按 sideward/forward 与世界 up 的点积算扭矩方向
      const torqueX = sidewardDot * 0.4 * this.chassis.mass;
      const torqueZ = -forwardDot * 0.8 * this.chassis.mass;
      const torque = new THREE.Vector3(torqueX, 0, torqueZ);
      torque.applyQuaternion(bodyQuaternion);
      body.applyTorqueImpulse(torque, true);
    }
  }

  /** 车形态启用（TransformSystem 变形挂点，teardown §10：morph 物理插入点） */
  activate(): void {
    const body = this.chassis.physical.body;
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    body.setEnabled(true);
  }

  /** 机器人形态冻结（同上） */
  deactivate(): void {
    this.chassis.physical.body.setEnabled(false);
  }
}
