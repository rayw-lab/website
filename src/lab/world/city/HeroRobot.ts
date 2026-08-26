// CC-E5：机器人英雄主体（PRD CITY-04 / SRD §12.7.4 资产条目 / 设计提案 §3.2 场景分层）。
// 职责：科技城中央的座舱 AI 机器人——GLB 挂载、光柱显现、idle 态（Idle 剪辑 +
// 胸/首传感器呼吸灯 + 头部环顾）、TransformSystem 预留接口（getAnchor/setVisible）。
//
// 资产：public/models/hero-robot/HeroRobot.glb（Quaternius Animated Mech Pack「Stan」，
// CC0 1.0，Draco 压缩 338KB ≤ 800KB 预算；来源/改造/热替换约定见该目录 README.md 与
// docs/spec/asset-ledger-cyber-city.md）。GLB 缺失或加载失败时自动回退**程序化块面机甲**
// （同接口同锚点，实施方案 Premortem R4 止损：占位有完成度下限、高模可热替换）。
//
// 与 TransformSystem（CC-E6）的对接契约（SRD §12.7.4）：
//   · getAnchor() 返回变形锚点（机器人与 CarConcept 共用同一锚点、同一接触阴影位）；
//   · 光幕峰值热交换 = robot.setVisible(false) + car.visible = true，本类不自带变形逻辑；
//   · idle 呼吸灯占用世界循环动画配额（CITY-03：≤2 处 = idle 呼吸 + 招牌脉动）。
import * as THREE from 'three/webgpu';
import { Fn, float, smoothstep, uv, vec3 } from 'three/tsl';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { ResourceFile, ResourcesLoader } from '../core/ResourcesLoader';

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 资源键名（ResourcesLoader 结果表中取件用） */
export const HERO_ROBOT_RESOURCE_KEY = 'heroRobot';

/**
 * ResourcesLoader 两阶段清单条目（Game.init 阶段二「并行加载」段拼入；
 * 合流挂点说明见 docs/research/cyber-city-eng-wave1-notes.md §E5）。
 * 热替换：同名覆盖 GLB 即完成资产升级，本清单与消费代码零改动。
 */
export const HERO_ROBOT_RESOURCES: ResourceFile[] = [
  [HERO_ROBOT_RESOURCE_KEY, `${base}/models/hero-robot/HeroRobot.glb`, 'gltf'],
];

/** R4 止损装载器：失败不抛出——返回 null 让 HeroRobot 走程序化回退，世界照常起 */
export async function loadHeroRobotGltf(loader: ResourcesLoader): Promise<GLTF | null> {
  try {
    const resources = await loader.load(HERO_ROBOT_RESOURCES);
    return (resources[HERO_ROBOT_RESOURCE_KEY] as GLTF) ?? null;
  } catch {
    console.warn('[hero-robot] GLB 加载失败，回退程序化块面机甲（Premortem R4）');
    return null;
  }
}

export interface HeroRobotOptions {
  /** 已加载的 GLB（null/缺省 = 程序化块面机甲回退） */
  gltf?: GLTF | null;
  /** 锚点地面坐标（默认原点 = 未来十字路口正中，buildings JSON world.spawn 对齐） */
  position?: { x: number; z: number };
  /** 朝向（弧度，绕 Y；默认面向 +Z） */
  headingY?: number;
  /** 目标身高（米）；设计口径 8–12m 级（CITY-04），默认 9 */
  targetHeight?: number;
  /** prefers-reduced-motion：光柱显现改为即时呈现（无动画） */
  reducedMotion?: boolean;
}

type RevealState = 'hidden' | 'revealing' | 'idle';

/** 光柱显现时间轴（秒）——升起 → 机器人落定弹出 → 光柱消散，总长 ≈1.1s */
const PILLAR_RISE = 0.45;
const POP_DURATION = 0.4;
const PILLAR_FADE_END = 1.1;
const PILLAR_HEIGHT = 16;

const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** 世界上向（rim 灯位反旋校正用） */
const UP = new THREE.Vector3(0, 1, 0);

export class HeroRobot {
  /** 场景挂载根 = 变形锚点（加进 scene 即可见光柱/机器人） */
  readonly group = new THREE.Group();
  /** 是否走了程序化回退（HUD/debug 读数用） */
  readonly usingFallback: boolean;

  private readonly inner = new THREE.Group();
  private readonly reducedMotion: boolean;

  private mixer: THREE.AnimationMixer | null = null;
  private head: THREE.Object3D | null = null;
  /** Idle 剪辑是否驱动头部骨骼（决定环顾偏移用叠加制还是绝对制） */
  private headAnimatedByClip = false;
  /** 呼吸灯载体材质（GLB 的 Eye 传感器 / 回退机甲的胸屏+视觉条） */
  private breathMaterials: THREE.MeshStandardMaterial[] = [];
  /**
   * [CC-L5-C1] 关节伺服辉光材质（GLB LightGrey 槽 / 回退机甲 joint 材质）：
   * 随胸口呼吸同拍微脉动（同一 CITY-03 idle 呼吸配额席位，非新增循环动画），
   * 峰值 0.42 阈下（bloom threshold=1 纪律：机器人辉光锚点仍只有 Eye 传感器）。
   */
  private jointMaterials: THREE.MeshStandardMaterial[] = [];
  private breathLight!: THREE.PointLight;

  private pillar!: THREE.Group;
  private pillarMaterials: THREE.MeshBasicMaterial[] = [];

  private revealState: RevealState = 'hidden';
  private revealClock = 0;
  private baseScale = 1;
  private disposed = false;

  /** 自建资源（回退机甲/光柱）登记表，dispose 时释放；GLB 资源归 Game 场景遍历释放 */
  private readonly ownedGeometries: THREE.BufferGeometry[] = [];
  private readonly ownedMaterials: THREE.Material[] = [];

  constructor(options: HeroRobotOptions = {}) {
    const targetHeight = options.targetHeight ?? 9;
    this.reducedMotion = options.reducedMotion ?? false;
    this.usingFallback = !options.gltf;

    this.group.name = 'hero-robot';
    this.group.position.set(options.position?.x ?? 0, 0, options.position?.z ?? 0);
    this.group.rotation.y = options.headingY ?? 0;

    this.inner.name = 'hero-robot-body';
    this.inner.visible = false; // reveal() 前不可见（光柱峰值落定）
    this.group.add(this.inner);

    if (options.gltf) this.setModel(options.gltf, targetHeight);
    else this.setFallbackMech(targetHeight);

    this.setBreathLight(targetHeight);
    this.setRimLight(targetHeight);
    this.setGroundRing(targetHeight);
    this.setPillar();
  }

  /** 变形锚点（SRD §12.7.4：机器人与车同锚点热交换；CC-E6 TransformSystem 消费） */
  getAnchor(): THREE.Object3D {
    return this.group;
  }

  /** TransformSystem 热交换开关：光幕峰值 robot.setVisible(false) + car.visible=true */
  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  /** 光柱显现：升起 → 机器人落定（easeOutBack 弹出）→ 光柱消散；reduced-motion 即时呈现 */
  reveal(): void {
    if (this.revealState !== 'hidden') return;

    if (this.reducedMotion) {
      this.inner.visible = true;
      this.pillar.visible = false;
      this.revealState = 'idle';
      return;
    }

    this.revealClock = 0;
    this.pillar.visible = true;
    this.revealState = 'revealing';
  }

  /** 每帧驱动（挂 ticker tick；dt/elapsed 用未缩放秒，与 Ticker.delta/elapsed 同源） */
  update(dt: number, elapsed: number): void {
    if (this.disposed || !this.group.visible) return;

    if (this.revealState === 'revealing') this.updateReveal(dt);
    if (!this.inner.visible) return;

    this.mixer?.update(dt);

    // 呼吸灯（idle 态循环动画配额内）：传感器 emissive + 同步点光呼吸
    const breath = 0.5 + 0.5 * Math.sin(elapsed * 1.6);
    for (const material of this.breathMaterials) {
      material.emissiveIntensity = 0.9 + 1.4 * breath;
    }
    // [CC-L5-C1] 关节伺服同拍微脉动（同一呼吸时间轴 = 同一配额席位；0.16–0.42 阈下）
    for (const material of this.jointMaterials) {
      material.emissiveIntensity = 0.16 + 0.26 * breath;
    }
    this.breathLight.intensity = 6 + 10 * breath;

    // 头部环顾（reduced-motion 静止）：
    // · 剪辑驱动的头骨骼每帧被 mixer 重写 → 在其后叠加当帧绝对偏移（无累积漂移）；
    // · 回退机甲的头 pivot 无人重写 → 直接设绝对角度。
    if (this.head && !this.reducedMotion) {
      const yaw = Math.sin(elapsed * 0.42) * 0.32;
      if (this.headAnimatedByClip) this.head.rotateY(yaw);
      else this.head.rotation.y = yaw;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.group.removeFromParent();
    for (const geometry of this.ownedGeometries) geometry.dispose();
    for (const material of this.ownedMaterials) material.dispose();
  }

  /* ———————————————————— GLB 路径 ———————————————————— */

  private setModel(gltf: GLTF, targetHeight: number): void {
    const model = gltf.scene;

    // 等比缩放到目标身高，脚底对齐地面 y=0（绑定姿态包围盒）
    const box = new THREE.Box3().setFromObject(model);
    const nativeHeight = Math.max(box.max.y - box.min.y, 0.001);
    this.baseScale = targetHeight / nativeHeight;
    this.inner.scale.setScalar(this.baseScale);
    model.position.y = -box.min.y;

    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      // 大比例缩放的 skinned mesh 包围球失真，关剔除防误裁（WebGPU/WebGL 双后端同策）
      mesh.frustumCulled = false;

      const material = mesh.material as THREE.MeshStandardMaterial;
      if (material.name === 'Eye') {
        material.emissiveIntensity = 1.2;
        this.breathMaterials.push(material);
      } else if (material.name === 'LightGrey') {
        // [CC-L5-C1] 材质分区②关节：肩/肘/髋/膝机械件（GLB LightGrey 槽）加青色
        // 伺服辉光，随呼吸同拍微脉动——「关节有动力」的材质层次
        material.emissive.set(0x49c5b6);
        material.emissiveIntensity = 0.24;
        this.jointMaterials.push(material);
      } else if (material.name === 'Accent') {
        // [CC-L5-C1] 材质分区③警示条：工业橙常亮微 emissive（0.42 阈下不辉光），
        // 夜景里胸/肩/胫警示条不再沉入黑装甲
        material.emissive.set(0xff6b35);
        material.emissiveIntensity = 0.42;
      } else if (material.name === 'Main') {
        // [CC-L5-C1] 材质分区①胸甲主装甲：metalness/roughness 微调锐化高光滚降，
        // A5 品红 rim 背光的轮廓响应更清晰（rim 灯位/强度零改动）
        material.metalness = 0.62;
        material.roughness = 0.38;
      }
    });

    // idle 循环剪辑（资产约定：Idle 必含，Walk 备用不自动播）
    const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle') ?? gltf.animations[0];
    if (idleClip) {
      this.mixer = new THREE.AnimationMixer(model);
      const action = this.mixer.clipAction(idleClip);
      action.play();
      if (this.reducedMotion) {
        // reduced-motion：定格 idle 首拍（不循环播放），呼吸灯仍缓变
        action.paused = true;
      }
    }

    this.head = model.getObjectByName('Head') ?? null;
    if (this.head && idleClip) {
      const headName = this.head.name;
      this.headAnimatedByClip = idleClip.tracks.some((track) =>
        track.name.startsWith(`${headName}.`),
      );
    }
    this.inner.add(model);
  }

  /* ———————————————— 程序化块面机甲（R4 回退） ———————————————— */

  private setFallbackMech(targetHeight: number): void {
    // 全站 token 配色（与 GLB 换装同表）：钛灰主装甲 / 工业橙警示 / 青传感器
    // [CC-L5-C1] 分区口径与 GLB 路径对齐：主装甲高光微锐化、关节伺服辉光、警示条微亮
    const titanium = this.ownMaterial(
      new THREE.MeshStandardMaterial({ color: 0x5c6472, metalness: 0.62, roughness: 0.38 }),
    );
    const dark = this.ownMaterial(
      new THREE.MeshStandardMaterial({ color: 0x3a404c, metalness: 0.5, roughness: 0.5 }),
    );
    const joint = this.ownMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xb3bac6,
        metalness: 0.65,
        roughness: 0.32,
        emissive: 0x49c5b6,
        emissiveIntensity: 0.24,
      }),
    );
    this.jointMaterials.push(joint as THREE.MeshStandardMaterial);
    const accent = this.ownMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        metalness: 0.2,
        roughness: 0.5,
        emissive: 0xff6b35,
        emissiveIntensity: 0.42,
      }),
    );
    const sensor = this.ownMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x49c5b6,
        emissive: 0x49c5b6,
        emissiveIntensity: 1.2,
        metalness: 0,
        roughness: 0.3,
      }),
    );
    this.breathMaterials.push(sensor as THREE.MeshStandardMaterial);

    const scale = targetHeight / 9; // 各部件按 9m 级标定
    const block = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      material: THREE.Material,
      parent: THREE.Object3D = this.inner,
    ): THREE.Mesh => {
      const geometry = new THREE.BoxGeometry(w * scale, h * scale, d * scale);
      this.ownedGeometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x * scale, y * scale, z * scale);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // 腿 × 2（胫甲橙条）+ 髋
    for (const side of [-1, 1]) {
      block(1.1, 3.4, 1.4, side * 0.95, 1.7, 0, titanium);
      block(1.2, 0.5, 1.5, side * 0.95, 3.55, 0, joint);
      block(0.5, 0.9, 0.12, side * 0.95, 1.2, 0.72, accent);
      block(1.5, 0.4, 2.0, side * 0.95, 0.2, 0.15, dark); // 足
    }
    block(2.7, 0.9, 1.6, 0, 4.1, 0, dark);

    // 躯干（宽胸装甲）+ 胸口座舱 HUD 屏（呼吸灯主载体）
    block(4.2, 2.6, 2.0, 0, 5.9, 0, titanium);
    block(1.9, 1.05, 0.14, 0, 6.15, 1.04, sensor);
    block(2.6, 0.35, 0.14, 0, 5.15, 1.04, accent);

    // 肩甲 + 臂 × 2
    for (const side of [-1, 1]) {
      block(1.6, 1.15, 1.9, side * 2.7, 6.9, 0, dark);
      block(0.95, 2.6, 1.2, side * 2.75, 4.7, 0, titanium);
      block(1.05, 0.5, 1.3, side * 2.75, 3.3, 0, joint);
      block(0.18, 0.8, 1.2, side * 3.35, 6.9, 0, accent); // 肩部警示条
    }

    // 头（独立 pivot 供环顾）：面罩传感器条 = 青 emissive
    const headGroup = new THREE.Group();
    headGroup.position.y = 7.55 * scale;
    this.inner.add(headGroup);
    block(1.35, 1.05, 1.2, 0, 0.5, 0, titanium, headGroup);
    block(1.0, 0.22, 0.1, 0, 0.55, 0.66, sensor, headGroup);
    block(0.16, 0.75, 0.16, 0.45, 1.25, -0.25, dark, headGroup); // 天线

    this.head = headGroup;
    this.baseScale = 1;
  }

  /* ———————————————— 呼吸点光 + 光柱 ———————————————— */

  private setBreathLight(targetHeight: number): void {
    // 单盏青色点光挂胸口：让呼吸灯在无 IBL 灰盒里也有体感（CITY-04 idle 呼吸灯）
    this.breathLight = new THREE.PointLight(0x49c5b6, 6, targetHeight * 2.4, 1.8);
    this.breathLight.position.y = targetHeight * 0.66;
    this.group.add(this.breathLight);
  }

  /**
   * [CC-L1 A5] 轮廓背光（rubric §6 Tier A5「机器人 rim light」）：品红聚光从
   * 后上方（对置首幕机位 SSE → 灯位 NNW）勾轮廓——对手色 = 胸口青呼吸灯
   * （品牌双色轴），主体从暗底里剥离。SpotLight 锥角/距离双限位只打机器人邻域，
   * 不污染全城；常亮不占循环动画配额，不投影（阴影预算留给主方向光）。
   * 挂 group：随 setVisible 与机器人同显同隐；世界方位经 -headingY 反旋校正，
   * 不随机器人朝向漂移。
   */
  private setRimLight(targetHeight: number): void {
    const rim = new THREE.SpotLight(0xff2d6f, 190, targetHeight * 4.5, 0.55, 0.75, 1.2);
    // 期望世界方位：机器人后上方偏西北（首幕机位 theta≈25° 的对置象限）
    rim.position
      .set(-0.35, 1.45, -1.05)
      .multiplyScalar(targetHeight)
      .applyAxisAngle(UP, -this.group.rotation.y);
    rim.target.position.set(0, targetHeight * 0.55, 0);
    this.group.add(rim, rim.target);
  }

  /**
   * [CC-L1 A5] 接地常亮青环（「接地环」）：additive 径向环带贴脚下，与 Roads 出生
   * 光圈（r≈2.9 路面 emissive）同心分层——机器人「站在能量位上」的视觉锚。
   * 常亮零时间项（不占动画配额）；挂 group：热交换隐藏机器人时随之让位充能环。
   */
  private setGroundRing(targetHeight: number): void {
    const radius = targetHeight * 0.24;
    const geometry = new THREE.CircleGeometry(radius, 40);
    this.ownedGeometries.push(geometry);

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    material.colorNode = Fn(() => {
      const radial = uv().sub(0.5).mul(2).length();
      // 外缘锐环 + 中心渐弱辉光（TransformSystem 充能环同语法的静态版）
      const band = smoothstep(0.55, 0.88, radial).mul(smoothstep(1.0, 0.94, radial));
      const core = smoothstep(0.7, 0.0, radial).mul(0.14);
      return vec3(0.29, 0.78, 0.72).mul(band.mul(0.85).add(core));
    })();
    material.opacityNode = float(0.85);
    this.ownMaterial(material);

    const ring = new THREE.Mesh(geometry, material);
    ring.name = 'hero-ground-ring';
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.13; // 路面 0.1 之上（Roads ROAD_Y），防 z-fight/被路面盖没
    this.group.add(ring);
  }

  private setPillar(): void {
    this.pillar = new THREE.Group();
    this.pillar.name = 'hero-robot-pillar';
    this.pillar.visible = false;
    this.group.add(this.pillar);

    const makeShaft = (radius: number, opacityMax: number, color: number): void => {
      const geometry = new THREE.CylinderGeometry(radius, radius * 1.12, PILLAR_HEIGHT, 24, 1, true);
      geometry.translate(0, PILLAR_HEIGHT / 2, 0); // 底部为缩放支点（贴地升起）
      this.ownedGeometries.push(geometry);

      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      material.userData.opacityMax = opacityMax;
      this.ownMaterial(material);
      this.pillarMaterials.push(material);

      this.pillar.add(new THREE.Mesh(geometry, material));
    };

    makeShaft(2.4, 0.28, 0x49c5b6); // 外柱：青
    makeShaft(1.0, 0.6, 0xbdfff4); // 内芯：亮青白
  }

  private updateReveal(dt: number): void {
    this.revealClock += dt;
    const t = this.revealClock;

    // ① 光柱贴地升起
    const rise = Math.min(t / PILLAR_RISE, 1);
    const riseEased = 1 - Math.pow(1 - rise, 3);
    this.pillar.scale.y = Math.max(riseEased, 0.001);

    // ② 峰值：机器人落定，easeOutBack 弹出（folio 落地弹跳语法）
    if (rise >= 1 && !this.inner.visible) this.inner.visible = true;
    if (this.inner.visible) {
      const pop = Math.min((t - PILLAR_RISE) / POP_DURATION, 1);
      this.inner.scale.setScalar(this.baseScale * (0.85 + 0.15 * easeOutBack(pop)));
    }

    // ③ 光柱透明度：升起段淡入 → 峰值后消散
    const fade =
      t < PILLAR_RISE ? riseEased : 1 - Math.min((t - PILLAR_RISE) / (PILLAR_FADE_END - PILLAR_RISE), 1);
    for (const material of this.pillarMaterials) {
      material.opacity = (material.userData.opacityMax as number) * Math.max(fade, 0);
    }

    if (t >= PILLAR_FADE_END) {
      this.pillar.visible = false;
      this.inner.scale.setScalar(this.baseScale);
      this.revealState = 'idle';
    }
  }

  private ownMaterial<T extends THREE.Material>(material: T): T {
    this.ownedMaterials.push(material);
    return material;
  }
}
