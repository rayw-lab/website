// 移植自 folio-2025 sources/Game/View.js（788 行 → 精简版）。
// 保留（§9.1 第 13 项裁决）：focusPoint（跟踪 + 磁吸 + 平滑）/ zoom（速度自动拉远）/
// spherical（等距斜视角，phi 按 quality 分档）/ optimalArea（视野最优区，
// Objects 远离休眠与 Phase B 装饰密度都读它）/ roll（碰撞镜头晃动小件）。
// 砍除：free 相机（camera-controls 依赖，G5 红线）、cinematic、speedLines、
// mapControls、gamepad 摇杆平移、debug 面板。
// 改动：去 Game 单例耦合；gsap 补间路径均不在保留面内，无需替代。
// [CC-VEH-VIEW] 驾驶态双视角（docs/spec/cyber-city-vehicle-camera.md，参数/裁决
// D1-D5 全部照抄该 spec）：V 键在 third（现状 folio 跟随，叠 lookahead 加法通道）
// ↔ fpv（挡风机位 rig）间硬切；双相机管线——defaultCamera 恒为第三人称解算
// （Nipple 射线/optimalArea/focusPointSpeed 零回归），fpv 只覆盖输出相机。
// 恒等合同：third 直通路径逐行不动 + lookahead 门外恒 +0（ritualCam.shakeY 同款
// IEEE 恒等）——robot_idle 首幕帧逐字节恒等（poster 协议 B / VIS-03）。
// [CC-E7] 城市首幕取景（game.cameraFraming='city'，SRD §12.7.2 首幕相机行）：
// FOV 42° / 静止机位斜距 18m（radius edges {14,24} × baseRatio 0.6 → 静止 18）/
// 俯角 22°（phi = 68° 极角，机位高 ≈6.7m）+ 视线上抬 2.5m——配 9m 级机器人满幅
// 入画；灰盒试车道（greybox，默认）保持 folio 原框（FOV 25 / phi 按 quality 分档），
// world-spike 驾驶验证零回归。
import * as THREE from 'three/webgpu';
import { clamp, lerp, remap, smoothstep } from '../utils/maths';
import type { Game } from '../core/Game';
import type { TransformState } from '../player/TransformSystem';

/**
 * [CC-L4 B5] 变形运镜推镜幅度上限：dollyIn=1 时斜距 ×(1-0.07)（静止 20m → 18.6m）。
 * rubric §6 Tier B5 施工基线 5% 上调至 7%：帧内可辨性（5% 在 42° FOV 下主体仅
 * 放大约半档，录屏几乎不可读）；白爆无回归的 A/B 帧证据见 eng notes CC-L4-B5。
 */
const RITUAL_DOLLY_MAX = 0.07;

/**
 * [CC-CAM-VIEW] 数据驱动镜头预设位姿（camera-shots.json 解析后的世界口径；
 * 加载/白名单/单位换算归 CameraShots.ts，本类只收最终数值——不引入任何用户相机
 * 输入，G5 红线）。
 */
export interface ViewShotPose {
  /** 视线锚点地面坐标（米；焦点脱离玩家跟踪，钉在该点） */
  anchor: { x: number; z: number };
  /** 极角（弧度，自 +Y；spherical.phi 同口径） */
  phi: number;
  /** 方位角（弧度；spherical.theta 同口径） */
  theta: number;
  /** 斜距档（米，写入 radius.edges）：定值 shot 传 min=max；跟随档 snapshot shot 传原 edges */
  radius: { min: number; max: number };
  /** 视线目标离地高（米） */
  lookAtHeight: number;
  /** 偏轴平移（米；framing.lateral 同口径，0 = 居中构图） */
  lateral: number;
}

/** [CC-CAM-VIEW] applyShot 前的取景现场（releaseShot 恢复用；null = 从未应用过 shot） */
interface ShotBaseline {
  phi: number;
  theta: number;
  radiusMin: number;
  radiusMax: number;
  lookAtHeight: number;
  lateral: number;
}

/**
 * [CC-VEH-VIEW] 第三人称行进 lookahead（spec §6.1 冻结值；字段名与 camera-shots.json
 * `drive_third.dynamics.lookahead` 条目草案一字不差）。
 * TODO(CC-CAM 合流：改读 camera-shots.json drive_third.dynamics.lookahead——CAM-C1
 * PR #45 合 main 后删除本内联双源，spec §7.2 降级条款)。
 */
const DRIVE_LOOKAHEAD = {
  /** 满 lookahead 4.5m ≈ FOV 42°/斜距 20m 下画面半宽 13.7m 的 1/3（不出构图带） */
  maxDistance: 4.5,
  /** 输入 = focusPointSpeed（真实 m/s、实现无关）；巡航 ~10 → L≈1.9m 微感 */
  speedEdge: { min: 3, max: 20 },
  /** 方向低通 s⁻¹（方向 = 位移方向而非车头——倒车/甩尾自动正确） */
  directionSmoothRate: 6,
  /** 幅值低通 s⁻¹（加速/急刹不阶跃） */
  magnitudeSmoothRate: 4,
  /** 满舵时 L ×0.55（转弯看近处，弯中焦点稳定） */
  steeringShrink: 0.45,
  /** 舵量低通 s⁻¹（收缩渐进非阶跃，spec §9.1） */
  steeringSmoothRate: 8,
  /** 偏移向量变化率硬钳 m/s（防晕兜底，SwiftShader 大 dt 下同样成立） */
  offsetRateClamp: 8,
} as const;

/**
 * [CC-VEH-VIEW] FPV 挡风机位 rig（spec §6.2 冻结值；camera-shots.json
 * `drive_fpv.rig` 条目草案同名字段）。裁决 D4：CarConcept 无内饰实模，挡风前
 * 上沿舱外机位（hood cam）为诚实 V1——offsetLocal 底盘系 +X=车头 +Y=上 +Z=右，
 * 中置 z=0 防不对称穿帮；底盘原点离地 0.92m → 视高 ≈1.5m。
 * TODO(CC-CAM 合流：改读 camera-shots.json drive_fpv.rig，同上)。
 */
const DRIVE_FPV = {
  offsetLocal: { x: 0.35, y: 0.55, z: 0 },
  /** 与 third 42° 拉开明确档差 = 切换的即时视觉反馈 */
  fovDeg: 58,
  /** 速度 FOV kick：推背感，低通缓变防晕；reduced-motion 恒 0 */
  fovKick: { maxDeg: 6, speedEdge: { min: 8, max: 24 }, smoothRate: 3 },
  /**
   * 防晕核心（spec §6.2）：yaw 直通（转向反馈零延迟——延迟 yaw 才是晕源）；
   * pitch/roll 衰减 + 低通（颠簸/侧倾进相机前先削幅）；reduced-motion 下
   * pitch/roll 恒 0 = 地平线完全锁定（yaw 保留——关掉无法驾驶，属功能非动效）。
   */
  attitudeTransfer: { yaw: 1, pitch: 0.7, roll: 0.35, pitchSmoothRate: 10, rollSmoothRate: 8 },
} as const;

export class View {
  private readonly game: Game;

  readonly position = new THREE.Vector3();
  delta = new THREE.Vector3();
  readonly idealRatio: number;
  ratioOverflow: number;
  /** 视线目标离地高（米）：城市首幕上抬 2.5（9m 机器人构图）；灰盒 0（folio 原样）；
   *  [CC-CAM-VIEW] shot 预设可改写（releaseShot 恢复现场）——去 readonly 仅类型面，运行时零差异 */
  private lookAtHeight: number;
  private readonly lookAtTarget = new THREE.Vector3();
  /**
   * [CC-L1 A4] 城市首幕构图件（rubric §6 Tier A4「偏轴 1/3 构图 + 慢 yaw 微动」）：
   * lateral = 机位与视线目标同步沿相机右向平移（纯屏幕平移——主体让出画面中心，
   * 落 1/3 竖线，峡谷对景占开阔侧）；thetaDrift = 慢 yaw 呼吸微动振幅（弧度，
   * reduced-motion 置 0——静止用户偏好零动画）。灰盒档两者归零（folio 原样零回归）。
   */
  private readonly framing: { lateral: number; thetaDrift: number };
  private readonly lateralOffset = new THREE.Vector3();

  /**
   * [CC-L4 B5] 变形运镜通道（TransformSystem order-4 写入，本类 order-7 同帧消费）：
   * dollyIn = 充能推镜进度 0..1（斜距 ×(1-RITUAL_DOLLY_MAX·dollyIn)）；
   * shakeY = 落地微震垂直偏移（米，TransformSystem 解析阻尼正弦驱动）。
   * 恒等保证：两者为 0 时 ×1/+0 按 IEEE 逐位恒等——robot_idle 首幕帧零漂移
   * （poster 三面免重拍前提）与驾驶接管零残余漂移都由该恒等式机器保证。
   */
  readonly ritualCam = { dollyIn: 0, shakeY: 0 };

  /**
   * [CC-CAM-VIEW] shot 预设应用前的取景现场（首次 applyShot 采集，releaseShot 恢复）。
   * 零漂移合同：未指定 ?shot= 时 applyShot/releaseShot 均不被调用，本字段恒 null，
   * update() 全程零改动——robot_idle 主帧与 main 逐字节一致（poster 免重拍前提）。
   */
  private shotBaseline: ShotBaseline | null = null;
  /**
   * [CC-VEH-VIEW] 驾驶视角二态子状态机（spec §5.1）：
   * mode = third（默认；= 现状输出直通）| fpv（挡风机位 rig 解算，硬切 D3）；
   * gate = TransformSystem 状态镜像（其构造/setState 推送；灰盒无变形系统恒
   * 'none'）——V 切换冗余门（∈{car_ready,driving}）与 lookahead 状态门
   * （==='driving'）都读它，防未来 filters 语义漂移。
   */
  readonly driveView: { mode: 'third' | 'fpv'; gate: 'none' | TransformState } = {
    mode: 'third',
    gate: 'none',
  };
  /**
   * [CC-VEH-VIEW] 第三人称 lookahead 状态（spec §9.1）：dir = 行进方向低通
   * （XZ 单位向量）；len/steer = 幅值与舵量低通；offset = 变化率硬钳后的偏移
   * 输出（机位与视线目标同加 = 纯屏幕平移，lateralOffset 同构）。
   * 恒等论证（spec §9.1）：robot_idle 从未进过 driving ⇒ len 恒为精确 0 ⇒
   * offset=(0,0,0)，下游 +0 逐位恒等——非渐近近似。
   */
  private readonly lookahead = {
    dir: new THREE.Vector3(1, 0, 0),
    len: 0,
    steer: 0,
    offset: new THREE.Vector3(),
  };
  private readonly lookaheadStep = new THREE.Vector3();
  /** FPV 姿态低通状态（pitch/roll 衰减通道；yaw 直通不驻留） */
  private readonly fpvState = { pitch: 0, roll: 0 };
  private readonly fpvEye = new THREE.Vector3();
  private readonly fpvLook = new THREE.Vector3();
  private readonly fpvRef = new THREE.Vector3();
  private readonly fpvCross = new THREE.Vector3();
  /** 基线 FOV（setCameras 落定；fpv→third 切回帧精确恢复投影） */
  private fovBase = 0;
  private readonly reducedMotion: boolean;

  /** 输出相机（Rendering 渲染它） */
  camera!: THREE.PerspectiveCamera;
  /** 默认跟随相机（Nipple 射线求交 / optimalArea 计算都用它） */
  defaultCamera!: THREE.PerspectiveCamera;

  focusPoint!: {
    trackedPosition: THREE.Vector3;
    isTracking: boolean;
    position: THREE.Vector3;
    smoothedPosition: THREE.Vector3;
    easing: number;
    magnet: { active: boolean; multiplier: number };
  };

  zoom!: {
    baseRatio: number;
    ratio: number;
    smoothedRatio: number;
    /** 速度拉远幅度（负值 = 越快越远，folio 隐藏手感参数） */
    speedAmplitude: number;
    speedEdge: { min: number; max: number };
    sensitivity: number;
  };

  spherical!: {
    phi: number;
    theta: number;
    radius: { edges: { min: number; max: number }; current: number; nonIdealRatioOffset: number };
    offset: THREE.Vector3;
  };

  roll!: {
    value: number;
    velocity: number;
    speed: number;
    damping: number;
    pullStrength: number;
    kickStrength: number;
    kick: (strength?: number) => void;
  };

  optimalArea!: {
    needsUpdate: boolean;
    position: THREE.Vector3;
    basePosition: THREE.Vector3;
    nearPosition: THREE.Vector3;
    farPosition: THREE.Vector3;
    nearDistance: number;
    farDistance: number;
    radius: number;
    raycaster: THREE.Raycaster;
    floorPlane: THREE.Plane;
    update: () => void;
  };

  constructor(game: Game, idealRatio = 1920 / 1080) {
    this.game = game;
    // [CC-L1 A4] 城市视线上抬 2.5→3.4：配合俯角 15°，主体头部让出上 1/3 天际线带
    this.lookAtHeight = game.cameraFraming === 'city' ? 3.4 : 0;

    // [CC-L1 A4] 城市首幕：右向平移 4.2m ≈ 1/3 竖线（FOV 42°/斜距 20m 下画面半宽
    // ≈13.7m）；慢 yaw ±1.1°（周期 ~50s 设计秒，远低于可察觉眩晕阈）。
    // reduced-motion 关微动（构图平移是静态取景，不属动画，保留）。
    const reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.reducedMotion = reducedMotion;
    this.framing =
      game.cameraFraming === 'city'
        ? { lateral: 4.2, thetaDrift: reducedMotion ? 0 : 0.019 }
        : { lateral: 0, thetaDrift: 0 };

    this.idealRatio = idealRatio;
    this.ratioOverflow = Math.max(1, this.idealRatio / this.game.viewport.ratio) - 1;

    this.setFocusPoint();
    this.setZoom();
    this.setSpherical();
    this.setRoll();
    this.setCameras();
    this.setDriveView();
    this.setOptimalArea();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      7, // order 7：相机在玩家 post（6）之后、渲染（998）之前
    );

    this.update();

    this.game.viewport.events.on('change', () => {
      this.resize();
    });

    this.game.viewport.events.on(
      'throttleChange',
      () => {
        this.optimalArea.update();
      },
      1,
    );
  }

  private setFocusPoint(): void {
    const defaultRespawn = this.game.respawns.getDefault();

    const trackedPosition = new THREE.Vector3(defaultRespawn.position.x, 0, defaultRespawn.position.z);
    this.focusPoint = {
      trackedPosition,
      isTracking: true,
      position: trackedPosition.clone(),
      smoothedPosition: trackedPosition.clone(),
      easing: 1,
      magnet: { active: true, multiplier: 0.25 },
    };

    // 任何驾驶意图动作 → 相机重新吸附玩家（folio L131-155 动作清单的 Spike 子集）
    const focusActionsNames = ['forward', 'right', 'backward', 'left', 'boost', 'brake', 'respawn'];
    this.game.inputs.events.on('actionStart', (action: { name: string }) => {
      if (focusActionsNames.indexOf(action.name) !== -1) this.focusPoint.isTracking = true;
    });
  }

  private setZoom(): void {
    // Wheel 输入 V1 已砍（§9.1 第 11 项）：baseRatio 固定，速度拉远仍生效。
    // speedEdge 为 CC-E2 重标定（spike camera.ts 速度变焦的引擎版）：
    // focusPointSpeed 是真实 m/s，物理车常态软限速 ≈10 m/s（folio topSpeed 5 ×
    // Ticker.scale 2）、boost 更高——folio 原值 {5,40} 在此速度域几乎不动；
    // 取 {4,24}：巡航即有可感拉远，boost 逼近满幅（spike「推背观感」等价物）。
    this.zoom = {
      baseRatio: 0.6,
      ratio: 0.6,
      smoothedRatio: 0.6,
      speedAmplitude: -0.4,
      speedEdge: { min: 4, max: 24 },
      sensitivity: 0.05,
    };
  }

  private setSpherical(): void {
    const city = this.game.cameraFraming === 'city';
    this.spherical = {
      // 城市首幕：俯角 22°（极角 68°，设计口径）；灰盒：folio 按 quality 分档
      // （桌面俯角更平 0.31π，移动端更俯视 0.27π）
      // [CC-L1 A4] 城市俯角 22°→15°（极角 75°）：地平线辉光带与远景剪影入画
      // （原 22° 俯角下天空被楼群顶出画框，A1 天空件首幕不可见）
      phi: city
        ? Math.PI * (75 / 180)
        : Math.PI * (this.game.quality.level === 0 ? 0.31 : 0.27),
      // [CC-L1 A4] 城市首幕 theta 45°→25°（偏轴 20°，rubric §6 Tier A4）：机位南偏东、
      // 视线朝北压中轴大道——峡谷对景（西 agent-nexus 96m / 东 autodrive-lab 60m 夹持
      // 北向路廊）取代原 45° 平铺斜视；机器人 headingY 不动，自然获得 3/4 侧身位。
      // 灰盒保持 folio 原值 45°（零回归）。
      theta: city ? Math.PI * (25 / 180) : Math.PI * 0.25,
      radius: {
        // 城市首幕：静止机位斜距 = min + (max-min)×(1-baseRatio) = 16+10×0.4 = 20m
        // （[CC-L1 A4] 18→20m：满幅主体退半步，给峡谷/天际线留层次位）
        edges: city ? { min: 16, max: 26 } : { min: 15, max: 30 },
        current: 0,
        nonIdealRatioOffset: 9,
      },
      offset: new THREE.Vector3(),
    };
    this.spherical.radius.current = lerp(
      this.spherical.radius.edges.min,
      this.spherical.radius.edges.max,
      1 - this.zoom.smoothedRatio,
    );
    this.spherical.offset.setFromSphericalCoords(
      this.spherical.radius.current,
      this.spherical.phi,
      this.spherical.theta,
    );
  }

  private setRoll(): void {
    this.roll = {
      value: 0,
      velocity: 0,
      speed: 0,
      damping: 4,
      pullStrength: 100,
      kickStrength: 1,
      kick: (strength = 1) => {
        this.roll.speed = strength * this.roll.kickStrength * (Math.random() < 0.5 ? -1 : 1);
      },
    };
  }

  private setCameras(): void {
    // 城市首幕 FOV 42°（沉浸广角）；灰盒 25°（folio 等距望远原样）
    const fov = this.game.cameraFraming === 'city' ? 42 : 25;
    this.fovBase = fov;
    this.camera = new THREE.PerspectiveCamera(fov, this.game.viewport.ratio, 0.1, 200);
    this.camera.position.setFromSphericalCoords(
      this.spherical.radius.current,
      this.spherical.phi,
      this.spherical.theta,
    );

    this.defaultCamera = this.camera.clone();

    this.game.scene.add(this.camera, this.defaultCamera);
  }

  private setDriveView(): void {
    // V 键消费（动作表在 Player.setInputs 注册 toggleDriveView，categories
    // ['driving']）：intro/robot_idle 下被 Inputs filters 闸门物理拦截（恒等
    // 保证 #1，spec §6.3）；actionStart 沿触发 = 按下翻转一次，长按不连发。
    // 不进 focusActionsNames（切视角不抢 focus 跟踪）、不进 TransformSystem
    // DRIVE_ACTIONS（切视角 ≠ 驾驶意图，car_ready 按 V 状态恒 car_ready）。
    this.game.inputs.events.on('toggleDriveView', (action: { active: boolean }) => {
      if (action.active) this.toggleDriveView();
    });
  }

  /** [CC-VEH-VIEW] V 切换（spec §9.3 硬切）：冗余门 state ∈ {car_ready, driving} */
  private toggleDriveView(): void {
    const gate = this.driveView.gate;
    if (gate !== 'car_ready' && gate !== 'driving') return;
    this.setDriveViewMode(this.driveView.mode === 'third' ? 'fpv' : 'third');
  }

  /**
   * [CC-VEH-VIEW] 设定驾驶视角（内部切换 + TransformSystem 强制回位共用，幂等）。
   * fpv→third 切回帧（spec §9.3）：焦点回玩家跟踪、FOV 立即回基线（同输入重算
   * 投影 = 与接管前逐位一致）；位姿下一帧由直通拷贝接管（defaultCamera 后台连续
   * 更新，切回无 pop）。变更时 trigger 'world-drive-view' [mode]（SRD §9.5
   * world-* 埋点族；Reveal 镜像 data-drive-view）。
   */
  setDriveViewMode(mode: 'third' | 'fpv'): void {
    if (this.driveView.mode === mode) return;
    this.driveView.mode = mode;

    // 两向切换都清 FPV 低通驻留：进入帧从 0 起坡（无上次残留姿态甩镜）
    this.fpvState.pitch = 0;
    this.fpvState.roll = 0;

    if (mode === 'third') {
      this.focusPoint.isTracking = true;
      this.camera.fov = this.fovBase;
      this.camera.updateProjectionMatrix();
    }

    this.game.events.trigger('world-drive-view', [mode]);
  }

  /**
   * [CC-VEH-VIEW] 第三人称行进 lookahead（spec §9.1；update 焦点平滑段之后调用）。
   * 门 = gate==='driving' 且非 reduced-motion；门外目标恒 0——robot_idle 从未
   * 进过 driving ⇒ len/offset 恒为精确 0，下游 +0 逐位恒等（ritualCam.shakeY
   * 同款 IEEE 恒等先例）。全部低通用 1−e^(−rate·dt) 帧率无关式（R4）。
   */
  private updateLookahead(smoothFocusPointDelta: THREE.Vector3, focusPointSpeed: number): void {
    const la = this.lookahead;
    const dt = this.game.ticker.delta;
    const gateOpen = this.driveView.gate === 'driving' && !this.reducedMotion;

    // ① 方向低通：位移方向（非车头朝向——倒车/甩尾/counter-steer 自动正确）；
    //   近静止（v≤0.5）保持上帧方向，防噪声抖向
    const travelMagnitude = Math.hypot(smoothFocusPointDelta.x, smoothFocusPointDelta.z);
    if (focusPointSpeed > 0.5 && travelMagnitude > 0) {
      const kDir = 1 - Math.exp(-DRIVE_LOOKAHEAD.directionSmoothRate * dt);
      la.dir.x += (smoothFocusPointDelta.x / travelMagnitude - la.dir.x) * kDir;
      la.dir.z += (smoothFocusPointDelta.z / travelMagnitude - la.dir.z) * kDir;
      const dirLength = Math.hypot(la.dir.x, la.dir.z);
      if (dirLength > 1e-6) {
        la.dir.x /= dirLength;
        la.dir.z /= dirLength;
      }
    }

    // ② 舵量低通（gate 开才读 player——'driving' 镜像必在 Player 构造之后）
    const steerTarget = gateOpen ? Math.min(Math.abs(this.game.player.steering), 1) : 0;
    la.steer +=
      (steerTarget - la.steer) * (1 - Math.exp(-DRIVE_LOOKAHEAD.steeringSmoothRate * dt));

    // ③ 目标幅值：速度 smoothstep × 转弯收缩（满舵 ×0.55——弯中看近处焦点稳）
    const targetLen = gateOpen
      ? DRIVE_LOOKAHEAD.maxDistance *
        smoothstep(focusPointSpeed, DRIVE_LOOKAHEAD.speedEdge.min, DRIVE_LOOKAHEAD.speedEdge.max) *
        (1 - DRIVE_LOOKAHEAD.steeringShrink * la.steer)
      : 0;

    // ④ 幅值低通 + 偏移变化率硬钳（防晕兜底）
    la.len += (targetLen - la.len) * (1 - Math.exp(-DRIVE_LOOKAHEAD.magnitudeSmoothRate * dt));
    this.lookaheadStep.set(la.dir.x * la.len, 0, la.dir.z * la.len).sub(la.offset);
    const maxStep = DRIVE_LOOKAHEAD.offsetRateClamp * dt;
    if (this.lookaheadStep.length() > maxStep) this.lookaheadStep.setLength(maxStep);
    la.offset.add(this.lookaheadStep);
  }

  /**
   * [CC-VEH-VIEW] FPV 挡风机位 rig 解算（spec §9.2；update 直通拷贝之后调用，
   * 仅 mode==='fpv' 进入）。双相机管线：只写输出相机 this.camera——defaultCamera
   * 已按第三人称解算完毕，Nipple 射线 / optimalArea / focusPointSpeed 零回归。
   * order 7 时底盘位姿已定（车辆 post = order 5），无帧延迟。
   */
  private updateFpv(focusPointSpeed: number): void {
    const vehicle = this.game.physicalVehicle;
    if (!vehicle) return; // 防御窗（car_ready 前不可达）：直通第三人称输出

    const dt = this.game.ticker.delta;
    const rm = this.reducedMotion;
    const forward = vehicle.forward;

    // ① 姿态分解：yaw 直通零延迟（Player.rotationY 同式反解；延迟 yaw 是晕源）
    const yaw = Math.atan2(-forward.z, forward.x);
    const pitch = Math.asin(clamp(forward.y, -1, 1));

    // roll = 车体 up 绕前向轴相对世界 up 的有符号偏转：参考上向 = 世界 up 在
    // ⊥forward 平面的投影；车身近垂直的特异位形（投影长 →0）保持上帧值。
    // 符号口径：cross(u, ref)·f —— 车顶向车体右侧（+Z 底盘系）倾时输出负值，
    // rotation.z 叠加后相机上向同侧倾（相机右向 = 世界系车右，解析推导）
    let rollRaw = this.fpvState.roll;
    this.fpvRef.set(-forward.x * forward.y, 1 - forward.y * forward.y, -forward.z * forward.y);
    const refLengthSq = this.fpvRef.lengthSq();
    if (refLengthSq > 1e-6) {
      this.fpvRef.multiplyScalar(1 / Math.sqrt(refLengthSq));
      this.fpvCross.crossVectors(vehicle.upward, this.fpvRef);
      rollRaw = Math.atan2(this.fpvCross.dot(forward), this.fpvRef.dot(vehicle.upward));
    }

    // ② 传递衰减 + 低通（帧率无关 1−e^(−rate·dt)，R4）；reduced-motion：
    //   pitch/roll 目标恒 0 = 地平线完全锁定（yaw 直通保留——功能非动效，§10）
    const transfer = DRIVE_FPV.attitudeTransfer;
    const pitchTarget = rm ? 0 : pitch * transfer.pitch;
    const rollTarget = rm ? 0 : rollRaw * transfer.roll;
    this.fpvState.pitch +=
      (pitchTarget - this.fpvState.pitch) * (1 - Math.exp(-transfer.pitchSmoothRate * dt));
    this.fpvState.roll +=
      (rollTarget - this.fpvState.roll) * (1 - Math.exp(-transfer.rollSmoothRate * dt));

    // ③ 机位：offsetLocal 经【完整】底盘四元数（机位随悬挂/姿态走，防头穿引擎盖；
    //   衰减只作用于视线姿态，不作用于机位——spec §9.2 第 3 步）
    this.fpvEye
      .set(DRIVE_FPV.offsetLocal.x, DRIVE_FPV.offsetLocal.y, DRIVE_FPV.offsetLocal.z)
      .applyQuaternion(vehicle.quaternion)
      .add(vehicle.position);
    this.camera.position.copy(this.fpvEye);

    // ④ 视线：稳定前向 lookAt + roll 追加（View.roll 弹簧同法 rotation.z）。
    //   陷阱注记（spec）：相机默认前向 −Z 与底盘前向 +X 相差绕 Y 的 −π/2——
    //   用 lookAt 合成即可绕开手写四元数的轴系换算，勿凭直觉拼 Euler
    const pitchCos = Math.cos(this.fpvState.pitch);
    this.fpvLook.set(
      this.fpvEye.x + Math.cos(yaw) * pitchCos,
      this.fpvEye.y + Math.sin(this.fpvState.pitch),
      this.fpvEye.z - Math.sin(yaw) * pitchCos,
    );
    this.camera.lookAt(this.fpvLook);
    this.camera.rotation.z += this.fpvState.roll;

    // ⑤ FOV kick 缓变（3 s⁻¹ 低通 ⇒ 实际变化率 ≪ 18°/s 防晕上限）；
    //   reduced-motion 恒 58（脉动关，档差保留 = 切换反馈仍在）
    const fovTarget =
      DRIVE_FPV.fovDeg +
      (rm
        ? 0
        : DRIVE_FPV.fovKick.maxDeg *
          smoothstep(
            focusPointSpeed,
            DRIVE_FPV.fovKick.speedEdge.min,
            DRIVE_FPV.fovKick.speedEdge.max,
          ));
    this.camera.fov += (fovTarget - this.camera.fov) * (1 - Math.exp(-DRIVE_FPV.fovKick.smoothRate * dt));
    this.camera.updateProjectionMatrix();
  }

  private setOptimalArea(): void {
    this.optimalArea = {
      needsUpdate: true,
      position: new THREE.Vector3(),
      basePosition: new THREE.Vector3(),
      nearPosition: new THREE.Vector3(),
      farPosition: new THREE.Vector3(),
      nearDistance: 0,
      farDistance: 0,
      radius: 0,
      raycaster: new THREE.Raycaster(),
      floorPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),

      // 视野最优区：把最远机位下的视锥投到地面，取外接圆（folio L213-281 原算法）
      update: () => {
        const area = this.optimalArea;

        // 保存现场
        const savedPosition = this.defaultCamera.position.clone();
        const savedQuaternion = this.defaultCamera.quaternion.clone();

        // 用最大半径机位重置
        let radiusMax =
          this.spherical.radius.edges.max +
          this.ratioOverflow * this.spherical.radius.nonIdealRatioOffset;

        if (this.game.quality.level === 0) radiusMax *= 1 - this.zoom.speedAmplitude;

        const offset = new THREE.Vector3();
        offset.setFromSphericalCoords(radiusMax, this.spherical.phi, this.spherical.theta);

        this.defaultCamera.position.set(0, 0, 0).add(offset);
        this.defaultCamera.lookAt(new THREE.Vector3());
        this.defaultCamera.updateProjectionMatrix();
        this.defaultCamera.updateWorldMatrix(true, false);

        // 两条对角线与地面的交点 → 取两中心的中点为最优区中心
        area.raycaster.setFromCamera(new THREE.Vector2(1, -1), this.defaultCamera);
        area.raycaster.ray.intersectPlane(area.floorPlane, area.nearPosition);
        area.raycaster.setFromCamera(new THREE.Vector2(-1, 1), this.defaultCamera);
        area.raycaster.ray.intersectPlane(area.floorPlane, area.farPosition);
        const centerA = area.nearPosition.clone().lerp(area.farPosition, 0.5);

        area.raycaster.setFromCamera(new THREE.Vector2(-1, -1), this.defaultCamera);
        area.raycaster.ray.intersectPlane(area.floorPlane, area.nearPosition);
        area.raycaster.setFromCamera(new THREE.Vector2(1, 1), this.defaultCamera);
        area.raycaster.ray.intersectPlane(area.floorPlane, area.farPosition);
        const centerB = area.nearPosition.clone().lerp(area.farPosition, 0.5);

        area.basePosition = centerA.clone().lerp(centerB, 0.5);
        area.radius = area.basePosition.distanceTo(area.farPosition);

        // 近/远平面距离（Phase B 雾距/装饰密度用）
        area.raycaster.setFromCamera(new THREE.Vector2(0, -1), this.defaultCamera);
        area.raycaster.ray.intersectPlane(area.floorPlane, area.nearPosition);
        area.raycaster.setFromCamera(new THREE.Vector2(0, 1), this.defaultCamera);
        area.raycaster.ray.intersectPlane(area.floorPlane, area.farPosition);
        area.nearDistance = this.defaultCamera.position.distanceTo(area.nearPosition);
        area.farDistance = this.defaultCamera.position.distanceTo(area.farPosition);

        // 恢复现场
        this.defaultCamera.position.copy(savedPosition);
        this.defaultCamera.quaternion.copy(savedQuaternion);

        area.needsUpdate = false;
      },
    };
  }

  /**
   * [CC-CAM-VIEW] 应用数据驱动镜头预设（camera-shots.json → CameraShots.ts 解析产物）：
   * 焦点脱离玩家跟踪钉在锚点（磁吸同关，防镜头被玩家缓慢拉走）+ 球坐标/视线高/偏轴
   * 整组改写。smoothedPosition 直写 = 深链帧零补间直达（挂载期应用，无在途镜头）。
   * 玩家跟踪的回归走 releaseShot（CameraShots 在首个驾驶意图动作上接线）——
   * 本方法不注册任何输入监听，不引入 camera-controls 用户接管（G5 红线）。
   */
  applyShot(pose: ViewShotPose): void {
    if (!this.shotBaseline) {
      this.shotBaseline = {
        phi: this.spherical.phi,
        theta: this.spherical.theta,
        radiusMin: this.spherical.radius.edges.min,
        radiusMax: this.spherical.radius.edges.max,
        lookAtHeight: this.lookAtHeight,
        lateral: this.framing.lateral,
      };
    }

    this.focusPoint.isTracking = false;
    this.focusPoint.magnet.active = false;
    this.focusPoint.position.set(pose.anchor.x, 0, pose.anchor.z);
    this.focusPoint.smoothedPosition.copy(this.focusPoint.position);

    this.spherical.phi = pose.phi;
    this.spherical.theta = pose.theta;
    // 定值 shot（min=max）= 静帧展示语义，速度变焦失效；窄屏 nonIdealRatioOffset 回拉照旧
    this.spherical.radius.edges.min = pose.radius.min;
    this.spherical.radius.edges.max = pose.radius.max;
    this.lookAtHeight = pose.lookAtHeight;
    this.framing.lateral = pose.lateral;

    // 斜距变了 → 视野最优区（Objects 休眠圈 / RayCursor 命中圈）按新机位重算
    this.optimalArea.needsUpdate = true;
  }

  /**
   * [CC-CAM-VIEW] 释放 shot 预设：取景参数恢复 applyShot 前现场 + 焦点回归玩家跟踪
   * （磁吸复活）。从未应用过 shot 时为空操作（幂等；零漂移合同的另一半）。
   */
  releaseShot(): void {
    const baseline = this.shotBaseline;
    if (!baseline) return;
    this.shotBaseline = null;

    this.spherical.phi = baseline.phi;
    this.spherical.theta = baseline.theta;
    this.spherical.radius.edges.min = baseline.radiusMin;
    this.spherical.radius.edges.max = baseline.radiusMax;
    this.lookAtHeight = baseline.lookAtHeight;
    this.framing.lateral = baseline.lateral;

    this.focusPoint.magnet.active = true;
    this.focusPoint.isTracking = true;
    this.optimalArea.needsUpdate = true;
  }

  private resize(): void {
    this.ratioOverflow = Math.max(1, this.idealRatio / this.game.viewport.ratio) - 1;

    this.camera.aspect = this.game.viewport.width / this.game.viewport.height;
    this.camera.updateProjectionMatrix();

    this.defaultCamera.aspect = this.game.viewport.width / this.game.viewport.height;
    this.defaultCamera.updateProjectionMatrix();
  }

  private update(): void {
    // 焦点：跟踪态直接贴玩家
    if (this.focusPoint.isTracking) {
      this.focusPoint.position.x = this.focusPoint.trackedPosition.x;
      this.focusPoint.position.z = this.focusPoint.trackedPosition.z;
    }

    // 磁吸：脱离跟踪后仍被玩家缓慢拉回（强度随距离增长）
    if (this.focusPoint.magnet.active) {
      const magnetDelta = {
        x: this.focusPoint.trackedPosition.x - this.focusPoint.position.x,
        z: this.focusPoint.trackedPosition.z - this.focusPoint.position.z,
      };
      const distanceToMagnet = Math.hypot(magnetDelta.x, magnetDelta.z);
      const magnetStrength = distanceToMagnet * this.focusPoint.magnet.multiplier;
      this.focusPoint.position.x += magnetStrength * magnetDelta.x * this.game.ticker.delta;
      this.focusPoint.position.z += magnetStrength * magnetDelta.z * this.game.ticker.delta;
    }

    // 平滑焦点 + 焦点移动速度（喂给速度变焦）
    const easing = remap(this.focusPoint.easing, 0, 1, 1, this.game.ticker.delta * 10);
    const newSmoothFocusPoint = this.focusPoint.smoothedPosition
      .clone()
      .lerp(this.focusPoint.position, easing);

    const smoothFocusPointDelta = newSmoothFocusPoint.clone().sub(this.focusPoint.smoothedPosition);
    const focusPointSpeed =
      Math.hypot(smoothFocusPointDelta.x, smoothFocusPointDelta.z) / this.game.ticker.delta;
    this.focusPoint.smoothedPosition.copy(newSmoothFocusPoint);

    // 变焦：速度越快镜头越远（低画质档关闭，防移动端过绘）
    const zoomSpeedRatio = smoothstep(focusPointSpeed, this.zoom.speedEdge.min, this.zoom.speedEdge.max);
    this.zoom.ratio = this.zoom.baseRatio;

    if (this.focusPoint.isTracking && this.game.quality.level === 0)
      this.zoom.ratio += this.zoom.speedAmplitude * zoomSpeedRatio;

    this.zoom.ratio = clamp(this.zoom.ratio, -1, 1);
    this.zoom.smoothedRatio = lerp(this.zoom.smoothedRatio, this.zoom.ratio, this.game.ticker.delta * 10);

    // [CC-VEH-VIEW] 行进 lookahead（driving 态 + 非 reduced-motion 才有幅值；
    // 门外恒精确 0 → 下游 +0 逐位恒等）——速度/方向源与速度变焦同为平滑焦点（协调单源）
    this.updateLookahead(smoothFocusPointDelta, focusPointSpeed);

    // 半径与球坐标偏移（[CC-L1 A4] 城市档叠加慢 yaw 微动：theta 呼吸 ±thetaDrift；
    // [CC-L4 B5] 变形充能推镜 = 斜距乘法通道，dollyIn=0 时为 ×1 恒等零漂移）
    const radiusMax =
      this.spherical.radius.edges.max +
      this.ratioOverflow * this.spherical.radius.nonIdealRatioOffset;
    this.spherical.radius.current =
      lerp(this.spherical.radius.edges.min, radiusMax, 1 - this.zoom.smoothedRatio) *
      (1 - RITUAL_DOLLY_MAX * this.ritualCam.dollyIn);
    const theta =
      this.spherical.theta +
      this.framing.thetaDrift * Math.sin(this.game.ticker.elapsed * 0.13);
    this.spherical.offset.setFromSphericalCoords(
      this.spherical.radius.current,
      this.spherical.phi,
      theta,
    );

    // [CC-L1 A4] 偏轴构图：机位与视线目标同步沿相机右向平移（视向 -(sinθ,0,cosθ)
    // 的右向 = (cosθ,0,-sinθ)）——纯屏幕平移，主体落 1/3 竖线；灰盒 lateral=0 恒零
    this.lateralOffset
      .set(Math.cos(theta), 0, -Math.sin(theta))
      .multiplyScalar(this.framing.lateral);

    // 机位（[CC-VEH-VIEW] lookahead 偏移与机位/视线目标同加 = 纯屏幕平移，
    // lateralOffset 偏轴构图同构先例；非 driving 帧恒 +0 恒等）
    this.position
      .copy(this.focusPoint.smoothedPosition)
      .add(this.spherical.offset)
      .add(this.lateralOffset)
      .add(this.lookahead.offset);
    this.delta = this.position.clone().sub(this.defaultCamera.position);
    this.defaultCamera.position.copy(this.position);

    // 朝向 + roll（弹簧-阻尼镜头晃动，碰撞时 kick）；城市首幕视线上抬 lookAtHeight
    this.defaultCamera.rotation.set(0, 0, 0);
    this.lookAtTarget
      .copy(this.focusPoint.smoothedPosition)
      .add(this.lateralOffset)
      .add(this.lookahead.offset);
    this.lookAtTarget.y += this.lookAtHeight;
    this.defaultCamera.lookAt(this.lookAtTarget);

    this.roll.velocity = -this.roll.value * this.roll.pullStrength * this.game.ticker.deltaScaled;
    this.roll.speed += this.roll.velocity;
    this.roll.value += this.roll.speed * this.game.ticker.deltaScaled;
    this.roll.speed *= 1 - this.roll.damping * this.game.ticker.deltaScaled;
    this.defaultCamera.rotation.z += this.roll.value;

    // [CC-L4 B5] 落地微震：垂直平移叠加在朝向解算之后（纯平移抖动，不改视线目标；
    // shakeY=0 时 +0 恒等）——落地冲击的位移分量，旋转分量走既有 roll.kick 弹簧
    this.defaultCamera.position.y += this.ritualCam.shakeY;

    // 输出到最终相机（free 模式已砍，直通）
    this.camera.position.copy(this.defaultCamera.position);
    this.camera.quaternion.copy(this.defaultCamera.quaternion);

    // [CC-VEH-VIEW] fpv 态输出覆盖（spec §0 双相机管线）：defaultCamera 上面已按
    // 第三人称解算完毕（Nipple/optimalArea 消费面零回归），仅输出相机改从车体
    // 解算；third 态本分支不执行——直通拷贝即最终输出，逐行与现状一致（恒等 #4）
    if (this.driveView.mode === 'fpv') this.updateFpv(focusPointSpeed);

    this.camera.updateMatrixWorld();
    this.defaultCamera.updateMatrixWorld();

    // 视野最优区（随焦点平移；重算只在 resize 节流后触发）
    if (this.optimalArea.needsUpdate) this.optimalArea.update();

    this.optimalArea.position
      .copy(this.optimalArea.basePosition)
      .add(
        new THREE.Vector3(this.focusPoint.smoothedPosition.x, 0, this.focusPoint.smoothedPosition.z),
      );
  }
}
