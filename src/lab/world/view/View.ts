// 移植自 folio-2025 sources/Game/View.js（788 行 → 精简版）。
// 保留（§9.1 第 13 项裁决）：focusPoint（跟踪 + 磁吸 + 平滑）/ zoom（速度自动拉远）/
// spherical（等距斜视角，phi 按 quality 分档）/ optimalArea（视野最优区，
// Objects 远离休眠与 Phase B 装饰密度都读它）/ roll（碰撞镜头晃动小件）。
// 砍除：free 相机（camera-controls 依赖，G5 红线）、cinematic、speedLines、
// mapControls、gamepad 摇杆平移、debug 面板。
// 改动：去 Game 单例耦合；gsap 补间路径均不在保留面内，无需替代。
// [CC-E7] 城市首幕取景（game.cameraFraming='city'，SRD §12.7.2 首幕相机行）：
// FOV 42° / 静止机位斜距 18m（radius edges {14,24} × baseRatio 0.6 → 静止 18）/
// 俯角 22°（phi = 68° 极角，机位高 ≈6.7m）+ 视线上抬 2.5m——配 9m 级机器人满幅
// 入画；灰盒试车道（greybox，默认）保持 folio 原框（FOV 25 / phi 按 quality 分档），
// world-spike 驾驶验证零回归。
import * as THREE from 'three/webgpu';
import { clamp, lerp, remap, smoothstep } from '../utils/maths';
import type { Game } from '../core/Game';

export class View {
  private readonly game: Game;

  readonly position = new THREE.Vector3();
  delta = new THREE.Vector3();
  readonly idealRatio: number;
  ratioOverflow: number;
  /** 视线目标离地高（米）：城市首幕上抬 2.5（9m 机器人构图）；灰盒 0（folio 原样） */
  private readonly lookAtHeight: number;
  private readonly lookAtTarget = new THREE.Vector3();
  /**
   * [CC-L1 A4] 城市首幕构图件（rubric §6 Tier A4「偏轴 1/3 构图 + 慢 yaw 微动」）：
   * lateral = 机位与视线目标同步沿相机右向平移（纯屏幕平移——主体让出画面中心，
   * 落 1/3 竖线，峡谷对景占开阔侧）；thetaDrift = 慢 yaw 呼吸微动振幅（弧度，
   * reduced-motion 置 0——静止用户偏好零动画）。灰盒档两者归零（folio 原样零回归）。
   */
  private readonly framing: { lateral: number; thetaDrift: number };
  private readonly lateralOffset = new THREE.Vector3();

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
    this.camera = new THREE.PerspectiveCamera(fov, this.game.viewport.ratio, 0.1, 200);
    this.camera.position.setFromSphericalCoords(
      this.spherical.radius.current,
      this.spherical.phi,
      this.spherical.theta,
    );

    this.defaultCamera = this.camera.clone();

    this.game.scene.add(this.camera, this.defaultCamera);
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

    // 半径与球坐标偏移（[CC-L1 A4] 城市档叠加慢 yaw 微动：theta 呼吸 ±thetaDrift）
    const radiusMax =
      this.spherical.radius.edges.max +
      this.ratioOverflow * this.spherical.radius.nonIdealRatioOffset;
    this.spherical.radius.current = lerp(
      this.spherical.radius.edges.min,
      radiusMax,
      1 - this.zoom.smoothedRatio,
    );
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

    // 机位
    this.position
      .copy(this.focusPoint.smoothedPosition)
      .add(this.spherical.offset)
      .add(this.lateralOffset);
    this.delta = this.position.clone().sub(this.defaultCamera.position);
    this.defaultCamera.position.copy(this.position);

    // 朝向 + roll（弹簧-阻尼镜头晃动，碰撞时 kick）；城市首幕视线上抬 lookAtHeight
    this.defaultCamera.rotation.set(0, 0, 0);
    this.lookAtTarget.copy(this.focusPoint.smoothedPosition).add(this.lateralOffset);
    this.lookAtTarget.y += this.lookAtHeight;
    this.defaultCamera.lookAt(this.lookAtTarget);

    this.roll.velocity = -this.roll.value * this.roll.pullStrength * this.game.ticker.deltaScaled;
    this.roll.speed += this.roll.velocity;
    this.roll.value += this.roll.speed * this.game.ticker.deltaScaled;
    this.roll.speed *= 1 - this.roll.damping * this.game.ticker.deltaScaled;
    this.defaultCamera.rotation.z += this.roll.value;

    // 输出到最终相机（free 模式已砍，直通）
    this.camera.position.copy(this.defaultCamera.position);
    this.camera.quaternion.copy(this.defaultCamera.quaternion);

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
