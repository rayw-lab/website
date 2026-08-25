// 移植自 folio-2025 sources/Game/Game.js（276 行 → 根对象精简版，§9.1 第 3 项）。
// 两阶段异步 init 结构照抄（source-teardown §4 启动序列），系统列表换成 Spike 清单。
// ★ 启动序列四坑（§4 尾注，全部编码在 init 时序里）：
//   ① Inputs 初始 filter 必须 ['intro']——防加载期按键漏进不存在的车；
//   ② rendering.start() 先于世界构建——加载进度需要渲染循环已跑；
//   ③ world.step(1) 必须晚于 physics/objects——世界内容构造时要建碰撞体；
//   ④ ticker.wait(3) 再 reveal——等 shader 编译落地，防白帧闪烁。
// 改动：去单例（mount 契约要求可重复挂载）；Debug/Server/Audio/氛围系统全砍；
//       Rapier 仍走动态 import（wasm ~1.5MB 与资源加载并行，不进入口 chunk）。
import * as THREE from 'three/webgpu';
import { Events } from './Events';
import { Ticker } from './Ticker';
import { Viewport } from './Viewport';
import { Quality } from './Quality';
import { ResourcesLoader, type ResourceMap } from './ResourcesLoader';
import { Objects } from './Objects';
import { Rendering } from '../rendering/Rendering';
import { Inputs } from '../inputs/Inputs';
import { Physics, type RapierModule } from '../physics/Physics';
import { PhysicsVehicle } from '../physics/PhysicsVehicle';
import { Respawns } from '../world/Respawns';
import { Zones } from '../world/Zones';
import { View } from '../view/View';
import { Player, type PlayerVehicle } from '../player/Player';
import { KinematicFallback } from '../player/KinematicFallback';
import { VisualVehicle } from '../player/VisualVehicle';
import { World, SPAWN } from '../world/World';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

export interface GameOptions {
  /** 舞台容器（Viewport 量它） */
  domElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  /** ?gl=1 强制 WebGL 2 复测路径（§9.2 保留参数） */
  forceWebGL?: boolean;
  /** 移动端 DPR 封顶（SRD §12.4 纪律：1.5） */
  pixelRatioMax?: number;
  /**
   * 车辆实现选择（SRD §12.7.5 热切换）：physics = Rapier 主路径（默认）；
   * kinematic = 运动学回退档（A/B 对照）。Rapier wasm 加载失败时无视此项强制回退。
   */
  vehicle?: 'physics' | 'kinematic';
  /**
   * [CC-E6] false = init 后不自动 intro→wandering（灰盒 reveal 极简版让位）：
   * 首幕剧本模式（?ritual=1）由 world/Reveal + TransformSystem 接管输入上下文
   * （intro → driving 随 car_ready 热切，SRD §12.7.4 / 终裁 D4）。缺省 true 零回归。
   */
  autoReveal?: boolean;
  /** 喂 facade 进度条 */
  onProgress?(loaded: number, total: number): void;
  /** 实际渲染后端徽章 */
  onBackend?(backend: 'webgpu' | 'webgl2'): void;
}

export class Game {
  readonly domElement: HTMLElement;
  readonly canvasElement: HTMLCanvasElement;
  readonly events = new Events();
  /** dispose 一键解绑全部 DOM 监听（SRD §9.2 mount 契约） */
  private readonly abortController = new AbortController();
  private readonly options: GameOptions;

  scene!: THREE.Scene;
  resourcesLoader!: ResourcesLoader;
  quality!: Quality;
  ticker!: Ticker;
  inputs!: Inputs;
  viewport!: Viewport;
  rendering!: Rendering;
  resources: ResourceMap = {};
  respawns!: Respawns;
  view!: View;
  objects!: Objects;
  world!: World;

  RAPIER!: RapierModule;
  physics!: Physics;
  zones!: Zones;
  player!: Player;
  /**
   * 车辆挂点（CC-E1 起就位）：PhysicsVehicle（Rapier 主路径）或
   * KinematicFallback（wasm 失败 / ?vehicle=kinematic），同 PlayerVehicle 契约。
   */
  physicalVehicle: PlayerVehicle | null = null;
  /** 视觉车辆（CarConcept rig）：从 physicalVehicle 契约回读，两档通用 */
  visualVehicle: VisualVehicle | null = null;

  revealed = false;
  private disposed = false;

  constructor(options: GameOptions) {
    this.options = options;
    this.domElement = options.domElement;
    this.canvasElement = options.canvasElement;
  }

  async init(): Promise<void> {
    const signal = this.abortController.signal;

    /**
     * 阶段一：intro 前（同步链 + 2 个 await，对照 Game.js L73-126）
     */
    this.scene = new THREE.Scene();
    this.resourcesLoader = new ResourcesLoader(this);
    this.quality = new Quality();
    this.ticker = new Ticker();
    this.inputs = new Inputs(this, [], ['intro'], signal); // ★坑①：初始 filter 只有 intro
    this.viewport = new Viewport(this.domElement, {
      pixelRatioMax: this.options.pixelRatioMax ?? (this.quality.level === 0 ? 2 : 1.5),
      signal,
    });
    this.rendering = new Rendering(this);
    // ★ 第一个 await：从这行起 tick 总线开始跳动（setAnimationLoop → ticker.update）
    await this.rendering.setRenderer({ forceWebGL: this.options.forceWebGL ?? false });
    this.options.onBackend?.(this.rendering.isWebGPU ? 'webgpu' : 'webgl2');

    // ★ 第二个 await：首批资源（灰盒 Spike 零资产，空清单直通；
    //   Phase B 在此接 respawns GLB / palette 等 intro 前置资源）
    this.resources = await this.resourcesLoader.load([]);

    this.respawns = new Respawns(
      [{ name: 'landing', position: SPAWN.position, rotation: SPAWN.rotation }],
      'landing',
    );
    this.view = new View(this);
    this.rendering.start(); // ★坑②：渲染先跑起来，再构建世界
    this.objects = new Objects(this);
    this.world = new World(this); // step(0)：灯光 + 网格地面（无物理依赖）

    /**
     * 阶段二：并行加载（Game.js L129-183 —— wasm 编译与资源下载完全并行）。
     * Rapier 失败不再致命（SRD §12.7.5「世界永远能开」）：捕获 → null →
     * 阶段三跳过物理系统，车辆走运动学回退档。
     */
    const rapierPromise = import('@dimforge/rapier3d').catch((error: unknown) => {
      console.error('[world] Rapier wasm 加载失败，切运动学回退档', error);
      return null;
    });
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
    const resourcesPromise = this.resourcesLoader.load(
      // CC-E1 首个正式资产：CarConcept（3.5MB 复用豁免，Draco+KTX2）；
      // Phase B 在此接完整清单（31 项模式）
      [['carConcept', `${base}/models/car-concept/CarConcept.gltf`, 'gltf']],
      (toLoad, total) => {
        this.options.onProgress?.(total - toLoad, total);
      },
    );

    const [newResources, RAPIER] = await Promise.all([resourcesPromise, rapierPromise]);
    if (this.disposed) return; // 加载期间被卸载：不再构建物理系统
    this.resources = { ...newResources, ...this.resources };

    /**
     * 阶段三：物理与玩法系统（Game.js L185-209）。
     * 车辆热切换（SRD §12.7.5）：Rapier 就绪且未显式要求运动学档 → PhysicsVehicle；
     * 否则 KinematicFallback（同 PlayerVehicle 契约，Player/View/VisualVehicle 零感知）。
     * 挂点必须先于 Player 构造——Player 构造期做出生点对齐 + 翻车自救注册。
     */
    if (RAPIER) {
      this.RAPIER = RAPIER;
      this.physics = new Physics(this);
      this.zones = new Zones(this);
    }

    const useKinematic = this.options.vehicle === 'kinematic' || !RAPIER;
    this.physicalVehicle = useKinematic ? new KinematicFallback(this) : new PhysicsVehicle(this);
    this.player = new Player(this);
    this.visualVehicle = new VisualVehicle(this, this.resources.carConcept as GLTF);

    // ★坑③：地面碰撞体 + 锥桶，必须晚于 physics/objects；无 RAPIER 时跳过
    //（运动学档 raycast 打视觉地面网格，不需要碰撞体；锥桶无物理域自然缺席）
    if (RAPIER) this.world.step(1);
    this.options.onProgress?.(1, 1);

    // ★坑④：等 3 帧（shader 编译落地）再 reveal；
    // autoReveal=false（CC-E6 首幕剧本模式）时跳过——filters 停留 'intro'，
    // 由 TransformSystem 在 car_ready 帧切 'driving'（加载期按键漏车的坑①防线不变）
    if (this.options.autoReveal ?? true) {
      this.ticker.wait(3, () => {
        this.reveal();
      });
    }
  }

  /** 开场完成：输入上下文 intro → wandering（Reveal 状态机的 Spike 极简版） */
  private reveal(): void {
    if (this.disposed) return;

    this.inputs.filters.delete('intro');
    this.inputs.filters.add('wandering');

    this.revealed = true;
    this.events.trigger('revealed');
  }

  /** 世界软复位（Game.js L218-274 模式精简）：respawn 玩家 + 全部动态体回初始位姿 */
  reset(): void {
    this.player.respawn(null, () => {
      this.objects.resetAll();
    });
  }

  pause(): void {
    this.rendering.pause();
  }

  resume(): void {
    this.rendering.resume();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.abortController.abort(); // 解绑 resize/keyboard/pointer 全部监听
    this.inputs.dispose();

    // GPU 资源
    this.scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) material.dispose();
      }
    });
    this.scene.clear();

    // wasm 侧内存
    if (this.physics) this.physics.free();

    this.rendering.dispose();
  }
}
