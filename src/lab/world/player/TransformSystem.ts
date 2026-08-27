// CC-E6：TransformSystem —— 机器人 ↔ 车变形系统（SRD §12.7.4 / PRD CITY-05/06 /
// 终裁 D4「变形后落十字路口 + WASD 即刻可开」/ 实施方案 §1 六幕之幕③④）。
//
// 状态机（DOM HUD 经 Reveal 以 data-world-state 镜像；e2e 选择器契约见
// e2e/cyber-city.spec.ts SEL 区）：
//   robot_idle → transforming → car_ready →（首个驾驶输入）driving
// v0.1 提案的 car_idle/car_ready 两态已按终裁 D4 合并：变形完即可开，零等待——
// car_ready 进入的同一帧输入上下文切 'driving'（filters intro → driving），
// PhysicsVehicle.activate() 同帧完成，WASD 不需要任何二次点击/等待。
//
// V1 遮蔽式变形（不做骨骼 IK；V2 预烘焙动画 CC-P2 评审）时间轴（真实秒，随
// Ticker.delta 走，暂停即冻结）：
//   0        →0.35  地面充能环半径 0→4m（TSL 环带 + 旋转刻度扫掠；PRD「充能环 0.35s」。
//                   充能环兼作车资产进度：waitFor 未 resolve 则环保持旋转多转，
//                   CC-E7 两阶段加载在此接线——本波隐藏路径演示中车已随 Game.init 就绪）
//   0.35→0.60  全屏截面光幕淡入（additive 竖幕，opacity 0→1）
//   0.60       ★ 光幕峰值热交换：robot.setVisible(false) + car.visible=true——
//              同一 transform 锚点、同一实时阴影投射（防「PPT 切页」感，Premortem P4/R8）
//   0.60→1.05  车 y 从 +2m 落至 0，easeOutBack 落地弹跳 0.45s（光幕 0.3s 内淡出、
//              充能环随落地消散）；落定即 activate() → car_ready
//   合计 1.05s ∈ 验收窗 1.0–1.2s
// [CC-L4 B5] 变形运镜（rubric Tier B5）：充能段推镜蓄力→光幕峰值定格→落地段回放
//   归零 + 落地帧垂直微震/roll 微滚（常量区 SHAKE_*/LANDING_ROLL_KICK；消费通道 =
//   View.ritualCam，时间轴四拍与状态机零改动）。
// [CC-TRANS-FX] 变形窗粒子炫技层（TransformParticles，Loop 7 指挥官追加）：充能段
//   能量喷发/环向碎屑 → 光幕段体积光尘 → 落地段余烬消散，与 ring/veil 叠加而非
//   替换——同样只是既有节拍的粒子注解（帧末 uniform 同步），时间轴与状态机零改动。
// prefers-reduced-motion：instant swap（零动画热交换 + 文字状态提示由 Reveal 呈现；
//   不建 ritual 时间轴 → 运镜通道恒 0，全程不动镜；粒子层不构造 = 零粒子）。
// 补间一律 Ticker + 手写缓动（第 6 章 gsap 禁令）。
//
// 物理插入点（CC-E1 交底，wave1-notes §E1「契约」）：
//   · 机器人形态：PhysicsVehicle.deactivate() 冻结底盘（KinematicFallback 无此面，
//     duck-typing 跳过——运动学档无外力自不位移，输入由 filters 闸门拦截）；
//   · 落地帧：moveTo(锚点地面坐标) + activate()（清零速度后启用，内置 0.12m 落差
//     让悬挂自然落定微弹）；
//   · 落点 = buildings JSON world.spawn（M3：与机器人锚点同点，respawn 注册表由
//     装配段改写到同点，R 键复位回十字路口）。
// 埋点：变形完成 game.events.trigger('world-transform', [to])（SRD §9.5）；
//       首个驾驶输入 trigger('world-drive-start')（实施方案 §1.1 幕④）。
import * as THREE from 'three/webgpu';
import { Fn, atan, mix, smoothstep, uniform, uv, vec3 } from 'three/tsl';
import { Events } from '../core/Events';
import type { Game } from '../core/Game';
import type { HeroRobot } from '../city/HeroRobot';
import { TransformParticles } from './TransformParticles';
import type { PlayerVehicle } from './Player';

export type TransformForm = 'robot' | 'car';
export type TransformState = 'robot_idle' | 'transforming' | 'car_ready' | 'driving';

/** 时间轴常量（秒；总长 = RING_IN + VEIL_IN + DROP = 1.05s，验收窗 1.0–1.2s。
 *  [CC-TRANS-FX] export 仅为 TransformParticles 单源消费（防常量双写漂移），
 *  数值与四拍语义零改动） */
export const RING_IN = 0.35;
export const VEIL_IN = 0.25;
export const VEIL_OUT = 0.3;
const DROP = 0.45;
const DROP_HEIGHT = 2;
export const RING_RADIUS = 4;

/**
 * [CC-TRANS-FX] 余烬触地门控：easeOutBack 首达 1（车轮首次触地）在 drop 进度
 * 1 − c1/c3 ≈ 0.37 处——余烬自触地帧起迸散（触地前是光幕/下落拍，不出火星）。
 * 纯 CPU 侧粒子包络参数，四拍时间轴常量与状态机零改动。
 */
const EMBER_TOUCHDOWN = 0.37;

/**
 * [CC-L4 B5] 变形运镜（rubric §6 Tier B5「充能推镜 + 落地微震」；四拍时间轴常量
 * 零改动，运镜只是既有节拍的相机注解）：
 *   充能段 0→RING_IN     推镜蓄力 0→1（easeInQuad，与充能环展开同拍）；
 *   光幕段 RING_IN→swap  峰值保持（waitFor 多转时同样定格在峰值）；
 *   收尾段 swap→完成      随落地/散幕回放到 0（landing 帧机位已回基线）；
 *   落地帧               垂直微震 SHAKE_DURATION 内解析衰减归零 + roll.kick 微滚。
 * reduced-motion 走 instant swap 不建 ritual 时间轴 → 运镜通道恒为 0（全程不动镜）。
 */
const SHAKE_DURATION = 0.3;
/** 微震初始振幅（米）：20m 机位 / FOV 42° 下首个波峰≈画面高 1%，微震不晕镜 */
const SHAKE_AMPLITUDE = 0.2;
/** 微震震荡圈数（SHAKE_DURATION 内 2.5 圈 ≈ 8Hz）与衰减指数（终帧强制归零兜底） */
const SHAKE_CYCLES = 2.5;
const SHAKE_DECAY = 4.5;
/** 落地 roll 微滚强度（View.roll 弹簧既有小件；峰值 ≈0.025rad≈1.4°，~0.5s 内收敛） */
const LANDING_ROLL_KICK = 0.25;

/** 变形期间可触发 driving 态的驾驶动作（键盘四向 + 触屏摇杆） */
const DRIVE_ACTIONS = ['forward', 'backward', 'left', 'right', 'nipplePointer'];

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** [CC-L4 B5] 充能蓄力缓动（慢起加速逼近光幕峰值 = 能量积聚观感） */
const easeInQuad = (t: number): number => t * t;

/** folio 落地弹跳缓动（HeroRobot 落定同款；轻微过冲 = 悬挂压缩观感） */
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** CC-E1 物理插入点 duck-typing：PhysicsVehicle 有 activate/deactivate，运动学档没有 */
type FreezableVehicle = PlayerVehicle & { activate?(): void; deactivate?(): void };

export interface TransformSystemOptions {
  /** 机器人英雄（热交换对手方；锚点 = robot.getAnchor() 所在地面坐标） */
  robot: HeroRobot;
  /** 变形锚点地面坐标（= buildings JSON world.spawn，M3 单源） */
  anchor: { x: number; z: number };
  /** 车辆落地朝向（PlayerVehicle.moveTo rotationY 口径；spawn heading 0=北 → π/2） */
  rotationY: number;
  /** prefers-reduced-motion：instant swap（PRD CITY-05 验收） */
  reducedMotion?: boolean;
  /**
   * 充能环兼资产进度（实施方案 §1.1 幕③）：未 resolve 前光幕不落、环多转。
   * 本波演示路径车已随 Game.init 就绪（缺省 = 立即 resolve）；CC-E7 两阶段清单接这里。
   */
  waitFor?: Promise<unknown>;
}

interface RitualRun {
  to: TransformForm;
  /** 时间轴时钟（真实秒） */
  clock: number;
  /** waitFor 尚未 resolve：充能环峰值处保持旋转（环多转一圈语义） */
  holding: boolean;
  swapped: boolean;
  resolve: () => void;
  promise: Promise<void>;
}

export class TransformSystem {
  /** 'stateChange' [state] / 'swap' [to]（Reveal 消费：热交换时停/起机器人 update 驱动） */
  readonly events = new Events();

  private readonly game: Game;
  private readonly robot: HeroRobot;
  private readonly anchor: { x: number; z: number };
  private readonly rotationY: number;
  private readonly reducedMotion: boolean;

  private _state: TransformState = 'robot_idle';
  private ritual: RitualRun | null = null;
  private carAssetsReady: boolean;
  /** [CC-L4 B5] 落地微震时钟（≥SHAKE_DURATION = 静默；completeRun(car) 置 0 起震） */
  private shakeClock = SHAKE_DURATION;

  private ringMesh!: THREE.Mesh;
  private veilMesh!: THREE.Mesh;
  private readonly ringOpacity = uniform(0);
  private readonly ringSpin = uniform(0);
  private readonly veilOpacity = uniform(0);
  /**
   * [CC-TRANS-FX] 变形窗粒子炫技层（与 ring/veil 叠加而非替换）：
   * reduced-motion 恒 null——instant swap 路径零粒子零改动（CITY-E2E-04 合同）。
   */
  private readonly particles: TransformParticles | null;

  private readonly ownedGeometries: THREE.BufferGeometry[] = [];
  private readonly ownedMaterials: THREE.Material[] = [];
  private readonly moveTarget = new THREE.Vector3();
  private disposed = false;

  private readonly tickHandler = (): void => this.update();
  private readonly actionStartHandler = (action: { name: string }): void => {
    if (this._state !== 'car_ready') return;
    if (DRIVE_ACTIONS.indexOf(action.name) === -1) return;
    this.setState('driving');
    this.game.events.trigger('world-drive-start');
    console.info('[transform] world-drive-start：首个驾驶输入接管（幕④ driving）');
  };

  constructor(game: Game, options: TransformSystemOptions) {
    this.game = game;
    this.robot = options.robot;
    this.anchor = options.anchor;
    this.rotationY = options.rotationY;
    this.reducedMotion = options.reducedMotion ?? false;

    this.carAssetsReady = !options.waitFor;
    options.waitFor?.then(
      () => {
        this.carAssetsReady = true;
      },
      () => {
        // 资产失败不锁死变形（R4 同源止损）：车模缺失时 VisualVehicle 缺席但物理照常
        this.carAssetsReady = true;
      },
    );

    // 机器人形态初始化：车隐藏 + 物理冻结 + 泊到变形锚点（同锚点热交换前置，
    // SRD §12.7.4「机器人形态物理体冻结为静态 collider」——E1 插入点即 deactivate）
    if (this.game.visualVehicle) this.game.visualVehicle.root.visible = false;
    const vehicle = this.game.physicalVehicle as FreezableVehicle | null;
    if (vehicle) {
      vehicle.moveTo(this.moveTarget.set(this.anchor.x, 0, this.anchor.z), this.rotationY);
      vehicle.deactivate?.();
    }

    this.setRing();
    this.setVeil();
    // [CC-TRANS-FX] 粒子层（三段炫技随四拍节奏走；Q2/reduced-motion 关断见其头注）
    this.particles = this.reducedMotion ? null : new TransformParticles(game, { anchor: this.anchor });

    // order 4（视觉同步段）：时间轴推进在意图/物理（1–3）后、车辆 post/相机（5–7）前
    this.game.ticker.events.on('tick', this.tickHandler, 4);
    // car_ready → driving：首个驾驶输入即接管（终裁 D4 第一拍）
    this.game.inputs.events.on('actionStart', this.actionStartHandler);
  }

  get state(): TransformState {
    return this._state;
  }

  /** 状态订阅（SRD §12.7.4 接口）：返回退订函数 */
  onStateChange(callback: (state: TransformState) => void): () => void {
    const wrapped = (state: TransformState): void => callback(state);
    this.events.on('stateChange', wrapped);
    return () => {
      this.events.off('stateChange', wrapped);
    };
  }

  /**
   * 变形（SRD §12.7.4）：幂等——transforming 期间的重复调用返回在途 Promise；
   * 已处于目标形态时立即 resolve。robot→car 为 CC-P0 主路径；car→robot 回变
   * （CC-P1 双向可逆）共用同一遮蔽序列（无落地拍，机器人原地重现）。
   */
  transform(to: TransformForm): Promise<void> {
    if (this.disposed) return Promise.resolve();
    if (this.ritual) return this.ritual.promise;
    if (to === 'car' && this._state !== 'robot_idle') return Promise.resolve();
    if (to === 'robot' && this._state === 'robot_idle') return Promise.resolve();

    this.setState('transforming');

    // reduced-motion：instant swap + 文字状态切换（Reveal 呈现），零动画窗
    if (this.reducedMotion) {
      this.hotSwap(to);
      this.finish(to);
      return Promise.resolve();
    }

    let resolveRun!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveRun = resolve;
    });
    this.ritual = { to, clock: 0, holding: false, swapped: false, resolve: resolveRun, promise };
    this.ringSpin.value = 0;
    // [CC-TRANS-FX] 起拍放粒（按当前品质档定量；Q2 = 不画）
    this.particles?.begin(this.game.quality.level);
    return promise;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.game.ticker.events.off('tick', this.tickHandler);
    this.game.inputs.events.off('actionStart', this.actionStartHandler);
    // [CC-L4 B5] 运镜通道归零：仪式/微震中途卸载不得在相机上留残余偏移
    this.game.view.ritualCam.dollyIn = 0;
    this.game.view.ritualCam.shakeY = 0;
    this.ringMesh.removeFromParent();
    this.veilMesh.removeFromParent();
    for (const geometry of this.ownedGeometries) geometry.dispose();
    for (const material of this.ownedMaterials) material.dispose();
    // [CC-TRANS-FX] 粒子层闭合（GPU 资源 + 取证句柄零残留）
    this.particles?.dispose();
  }

  /* ———————————————————— 状态机 ———————————————————— */

  private setState(state: TransformState): void {
    if (this._state === state) return;
    this._state = state;
    this.events.trigger('stateChange', [state]);
  }

  /** 光幕峰值热交换（SRD §12.7.4：robot.setVisible(false) + car.visible=true 同锚点） */
  private hotSwap(to: TransformForm): void {
    const vehicle = this.game.physicalVehicle as FreezableVehicle | null;
    if (to === 'car') {
      this.robot.setVisible(false);
      if (this.game.visualVehicle) this.game.visualVehicle.root.visible = true;
      // 车从 +2m 起落（reduced-motion 直落 0；moveTo 收地面坐标，各实现自行抬净高）
      this.moveVehicle(this.reducedMotion ? 0 : DROP_HEIGHT);
    } else {
      if (this.game.visualVehicle) this.game.visualVehicle.root.visible = false;
      vehicle?.deactivate?.();
      vehicle?.moveTo(this.moveTarget.set(this.anchor.x, 0, this.anchor.z), this.rotationY);
      this.robot.setVisible(true);
    }
    this.events.trigger('swap', [to]);
  }

  /** 变形收尾：车形态启用物理 + 输入上下文热切（D4 零等待的机器保证） */
  private finish(to: TransformForm): void {
    const filters = this.game.inputs.filters;
    if (to === 'car') {
      this.moveVehicle(0);
      (this.game.physicalVehicle as FreezableVehicle | null)?.activate?.();
      // ★ filters intro → driving 与 car_ready 同帧：WASD 即刻可开（终裁 D4）
      filters.delete('intro');
      filters.add('driving');
      this.setState('car_ready');
    } else {
      filters.delete('driving');
      filters.add('intro');
      this.setState('robot_idle');
    }
    this.game.events.trigger('world-transform', [to]);
    console.info(
      `[transform] world-transform:${to} 变形完成` +
        (this.reducedMotion
          ? '（reduced-motion instant swap）'
          : `（V1 遮蔽式 ${to === 'car' ? RING_IN + VEIL_IN + DROP : RING_IN + VEIL_IN + VEIL_OUT}s）`) +
        (to === 'car' ? '——车落十字路口，WASD 即刻可开（D4 零等待）' : '——机器人回到讲解态'),
    );
  }

  private moveVehicle(y: number): void {
    this.game.physicalVehicle?.moveTo(
      this.moveTarget.set(this.anchor.x, y, this.anchor.z),
      this.rotationY,
    );
  }

  /* ———————————————————— 时间轴推进 ———————————————————— */

  private update(): void {
    if (this.disposed) return;
    const dt = this.game.ticker.delta;

    // [CC-L4 B5] 落地微震推进（ritual 已清仍需衰减）：解析阻尼正弦按时钟直出，
    // 任意帧长无积分发散（SwiftShader 大 dt 稳定）；终帧强制归零 = 驾驶零残余漂移
    if (this.shakeClock < SHAKE_DURATION) {
      this.shakeClock = Math.min(this.shakeClock + dt, SHAKE_DURATION);
      const st = this.shakeClock / SHAKE_DURATION;
      this.game.view.ritualCam.shakeY =
        st >= 1
          ? 0
          : SHAKE_AMPLITUDE * Math.exp(-SHAKE_DECAY * st) * Math.sin(SHAKE_CYCLES * Math.PI * 2 * st);
    }

    const run = this.ritual;
    if (!run) return;

    this.ringSpin.value += dt;

    // 充能环兼资产进度：峰值处等待 waitFor（环保持旋转，时钟不进光幕段）
    if (run.clock >= RING_IN && !run.swapped && !this.carAssetsReady) {
      run.holding = true;
    } else {
      run.holding = false;
      run.clock += dt;
    }
    const t = run.clock;

    // ⓪ [CC-L4 B5] 充能推镜：蓄力段 0→1，光幕段定格峰值（holding 多转同帧），
    //    收尾段随落地（car，DROP）/散幕（robot，VEIL_OUT）回放到 0——
    //    completeRun 前机位已回基线，驾驶接管帧无任何在途相机补间
    const camSettleClock = t - RING_IN - VEIL_IN;
    if (t < RING_IN) {
      this.game.view.ritualCam.dollyIn = easeInQuad(t / RING_IN);
    } else if (camSettleClock <= 0) {
      this.game.view.ritualCam.dollyIn = 1;
    } else {
      const settleTotal = run.to === 'car' ? DROP : VEIL_OUT;
      this.game.view.ritualCam.dollyIn =
        1 - easeOutCubic(Math.min(camSettleClock / settleTotal, 1));
    }

    // ① 充能环展开 0→4m（easeOutCubic 展开 + 刻度扫掠旋转）
    const ringProgress = easeOutCubic(Math.min(t / RING_IN, 1));
    const ringScale = Math.max(RING_RADIUS * ringProgress, 0.001);
    this.ringMesh.visible = true;
    this.ringMesh.scale.setScalar(ringScale);
    this.ringOpacity.value = ringProgress;

    // ② 光幕 opacity 0→1（峰值热交换）→ 0
    const veilClock = t - RING_IN;
    if (veilClock >= 0) {
      if (veilClock < VEIL_IN) {
        this.veilOpacity.value = veilClock / VEIL_IN;
      } else {
        if (!run.swapped) {
          run.swapped = true;
          this.hotSwap(run.to);
        }
        this.veilOpacity.value = Math.max(1 - (veilClock - VEIL_IN) / VEIL_OUT, 0);
      }
      this.veilMesh.visible = this.veilOpacity.value > 0;
      // 竖幕面向相机（billboard）：任何机位下都遮住热交换截面
      this.veilMesh.quaternion.copy(this.game.view.camera.quaternion);
    }

    // ③ 收尾：car = 落地弹跳段（easeOutBack，环随落地消散）；robot = 光幕散尽即完成
    const settleClock = veilClock - VEIL_IN;
    // [CC-TRANS-FX] 余烬归一进度：car 自触地帧（EMBER_TOUCHDOWN）起 0→1；
    // robot 回变复用为聚形尘（光幕散尽窗 0→1）——纯粒子包络参数，时间轴零改动
    let emberSettle = 0;
    if (run.swapped && settleClock >= 0) {
      if (run.to === 'car') {
        const dropProgress = Math.min(settleClock / DROP, 1);
        emberSettle = Math.max((dropProgress - EMBER_TOUCHDOWN) / (1 - EMBER_TOUCHDOWN), 0);
        this.moveVehicle(DROP_HEIGHT * (1 - easeOutBack(dropProgress)));
        this.ringOpacity.value = Math.max(1 - dropProgress, 0);
        if (dropProgress >= 1) this.completeRun(run);
      } else {
        emberSettle = Math.min(settleClock / VEIL_OUT, 1);
        this.ringOpacity.value = Math.max(1 - settleClock / VEIL_OUT, 0);
        if (settleClock >= VEIL_OUT) this.completeRun(run);
      }
    }

    // [CC-TRANS-FX] 粒子节拍同步（帧末一次 uniform 写入；completeRun 已收拍则跳过）
    if (this.ritual) {
      this.particles?.frame(
        t,
        this.ringSpin.value,
        ringProgress,
        this.ringOpacity.value,
        this.veilOpacity.value,
        emberSettle,
      );
    }
  }

  private completeRun(run: RitualRun): void {
    this.ritual = null;
    this.ringMesh.visible = false;
    this.veilMesh.visible = false;
    this.ringOpacity.value = 0;
    this.veilOpacity.value = 0;
    // [CC-TRANS-FX] 粒子收拍：隐藏 + 节拍归零（窗外零贡献合同）
    this.particles?.end();
    // [CC-L4 B5] 推镜显式归零（收尾段回放的兜底恒等）；car 落地帧起垂直微震 +
    // roll 微滚（既有碰撞弹簧小件复用，~0.5s 自收敛）——robot 回变无落地拍不震
    this.game.view.ritualCam.dollyIn = 0;
    if (run.to === 'car') {
      this.shakeClock = 0;
      this.game.view.roll.kick(LANDING_ROLL_KICK);
    }
    this.finish(run.to);
    run.resolve();
  }

  /* ———————————————————— 仪式视觉件（全程序化 TSL，零资产） ———————————————————— */

  /** 地面充能环：环带 + 旋转刻度扫掠 + 中心微光（复用进度圆环 shader 思路，SRD §12.7.4） */
  private setRing(): void {
    const geometry = new THREE.CircleGeometry(1, 48);
    this.ownedGeometries.push(geometry);

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    material.colorNode = Fn(() => {
      const centered = uv().sub(0.5).mul(2);
      const radial = centered.length();
      const angle = atan(centered.y, centered.x);
      // 主环带（外缘 0.96–1.0 锐、内缘 0.62 渐入）
      const band = smoothstep(0.62, 0.9, radial).mul(smoothstep(1.0, 0.955, radial));
      // 旋转刻度扫掠（充能观感；holding 时环持续多转）
      const dashes = angle.mul(18).sub(this.ringSpin.mul(9)).sin().mul(0.5).add(0.5);
      // 中心充能微光
      const core = smoothstep(0.55, 0.0, radial).mul(0.16);
      const intensity = band.mul(dashes.mul(0.55).add(0.55)).add(core);
      return vec3(0.29, 0.78, 0.72).mul(intensity).mul(2.2);
    })();
    material.opacityNode = this.ringOpacity;
    this.ownedMaterials.push(material);

    this.ringMesh = new THREE.Mesh(geometry, material);
    this.ringMesh.name = 'transform-charge-ring';
    this.ringMesh.rotation.x = -Math.PI / 2;
    // 略抬防与路面标线 z-fight（Roads 出生光圈同策）
    this.ringMesh.position.set(this.anchor.x, 0.06, this.anchor.z);
    this.ringMesh.visible = false;
    this.game.scene.add(this.ringMesh);
  }

  /**
   * 全屏截面光幕：additive 竖幕（[CC-L1 A6] 品牌双色 青→品红 横向渐变 + 扫描线），
   * billboard 面向相机。白爆抑制（rubric §6 Tier A6「光幕洗帧」扣分项）：
   * 近白单色 ×1.9 改双色 tint ×1.3 + 峰值不透明度 ×0.7（降 30%）——热交换仍被
   * 完整遮蔽（四拍时间轴常量零改动），但 car 落地帧不再被余辉洗成灰绿低对比。
   */
  private setVeil(): void {
    const geometry = new THREE.PlaneGeometry(26, 15);
    this.ownedGeometries.push(geometry);

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    material.colorNode = Fn(() => {
      const centered = uv().sub(0.5).mul(2);
      // 软边衰减（横向 0.5 起收、纵向 0.62 起收）：幕缘不见硬切
      const falloff = smoothstep(1.0, 0.5, centered.x.abs()).mul(
        smoothstep(1.0, 0.62, centered.y.abs()),
      );
      // 扫描线（沿高度细纹 + 随时间流动）
      const scan = centered.y.mul(34).sub(this.ringSpin.mul(16)).sin().mul(0.12).add(0.88);
      // 中腰亮带（热交换截面高光，[CC-L1 A6] 0.6→0.42 降腰线白热）
      const beltLine = smoothstep(0.5, 0.0, centered.y.abs()).mul(0.42).add(0.55);
      // [CC-L1 A6] 品牌双色：左青 → 右品红（Roads ROAD_NEON 同源线性近似）
      const tint = mix(vec3(0.32, 0.9, 0.8), vec3(0.95, 0.2, 0.5), smoothstep(-0.85, 0.85, centered.x));
      return tint.mul(falloff).mul(scan).mul(beltLine).mul(1.3);
    })();
    // [CC-L1 A6] 峰值不透明度封顶 0.7（时间轴 0→1→0 曲线不动，整体降 30%）
    material.opacityNode = this.veilOpacity.mul(0.7);
    this.ownedMaterials.push(material);

    this.veilMesh = new THREE.Mesh(geometry, material);
    this.veilMesh.name = 'transform-veil';
    this.veilMesh.position.set(this.anchor.x, 4.6, this.anchor.z);
    this.veilMesh.visible = false;
    this.game.scene.add(this.veilMesh);
  }
}
