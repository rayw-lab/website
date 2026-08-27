// [CC-VIS-X2] 立面套件加载器：Blender 实模构件库（tools/blender/generate-facade-kit.py
// 单源；Draco+KTX2 80KB，10 类构件 = 10 个具名单材质 mesh）。
//
// 混合路径合同（BR X2）：楼体保持程序化（CityBlocks 体块零改动），构件经 InstancedMesh
// 贴附到 NDC 取证清单在册的可见临街面——每类构件 1 个 InstancedMesh = 1 draw call。
// 消费方三处：CityBlocks（立面件）/ StreetProps（街角道具带）/ ForegroundFraming（前景景框）。
//
// 回退合同（HeroBlenderMesh 同款 R4 止损）：
//   · Q2 挂载：不发起加载（止损档零 GLB 字节零解码），程序化体块即最终视觉；
//   · Q0/Q1 挂载：异步加载（不阻塞 mountCity/ready），失败 console.warn 静默回退
//     （楼体/道具/物理全部照常，只是没有细节层）；
//   · 运行时热切档：已挂载构件只切 visible（Q2 隐藏），注册过的道具碰撞体同步
//     enable/disable——Q2 下无「隐形墙」；Q2 挂载后升档不补加载（零字节承诺以
//     挂载时档位为准，CitySilhouette 密度档同纪律）。
//
// 纪律自查（X2 任务书硬门）：零循环动画（全部静态件）；emissive 全部 ≤1 阈下
// （KitSurface 单材质 strength 0.95，R2 不动 threshold=1 与 strength）；零新增事件
// （道具碰撞体不挂 onCollision，OBS 白名单不动）。
import * as THREE from 'three/webgpu';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';
import type { WorldObject } from '../core/Objects';

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 套件构件名合同（生成脚本 PIECES 键 = glTF 节点名，运行时/审计对账键） */
export type FacadeKitPieceName =
  | 'KitCanopy'
  | 'KitAcCluster'
  | 'KitPipeRun'
  | 'KitBalcony'
  | 'KitLouver'
  | 'KitRoofVent'
  | 'PropVending'
  | 'PropCabinet'
  | 'PropBin'
  | 'FramePipeBridge';

export interface FacadeKitPiece {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

export type FacadeKitPieces = Map<FacadeKitPieceName, FacadeKitPiece>;

/** 单实例摆位（世界系）：rotY 弧度，scale 省略 = 1 */
export interface PieceTransform {
  x: number;
  y: number;
  z: number;
  rotY?: number;
  scaleY?: number;
}

export class FacadeKit {
  /** 套件加载收敛（成功 = 构件表 / Q2 或失败 = null；e2e/取证同步点） */
  readonly ready: Promise<FacadeKitPieces | null>;
  /** 已注册实例网格数（挂载日志读数；每类构件 1 draw call） */
  meshCount = 0;
  /** 已注册实例总数（含全部构件类的实例和） */
  instanceCount = 0;

  private readonly game: Game;
  private readonly meshes: THREE.Object3D[] = [];
  private readonly bodies: WorldObject[] = [];

  constructor(game: Game) {
    this.game = game;

    // Q2 挂载 = 止损档合同：零 GLB 请求零解码
    if (game.quality.level === 2) {
      this.ready = Promise.resolve(null);
      return;
    }

    this.ready = game.resourcesLoader
      .load([['facadeKit', `${base}/models/facade-kit/FacadeKit.glb`, 'gltf']])
      .then((resources) => {
        const gltf = resources.facadeKit as GLTF | undefined;
        if (!gltf) return null;
        const pieces: FacadeKitPieces = new Map();
        gltf.scene.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          pieces.set(mesh.name as FacadeKitPieceName, {
            geometry: mesh.geometry,
            material: mesh.material as THREE.Material,
          });
        });
        return pieces;
      })
      .catch(() => {
        console.warn('[facade-kit] 套件加载失败，保留程序化体块（R4 止损回退）');
        return null;
      });

    // 运行时热切档：Q2 隐藏细节层 + 道具碰撞体同步（防隐形墙）
    game.quality.events.on('change', (level: QualityLevel) => this.applyQuality(level));
  }

  /**
   * 由构件几何批量建 InstancedMesh 并入场（消费方唯一入口）：
   * 静态实例（挂载后矩阵不再更新），Q2 档位收敛/释放随 Game 场景遍历。
   */
  addInstances(
    pieces: FacadeKitPieces,
    name: FacadeKitPieceName,
    transforms: PieceTransform[],
    options: { castShadow?: boolean } = {},
  ): THREE.InstancedMesh | null {
    const piece = pieces.get(name);
    if (!piece || transforms.length === 0) return null;

    const mesh = new THREE.InstancedMesh(piece.geometry, piece.material, transforms.length);
    mesh.name = `city-facade-${name}`;
    mesh.castShadow = options.castShadow ?? true;
    mesh.receiveShadow = false;
    // 实例散布多楼面：整体包围盒剔除收益为负（CitySilhouette 同判），直接常绘
    mesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.rotY ?? 0, 0);
      dummy.scale.set(1, t.scaleY ?? 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    this.game.scene.add(mesh);
    this.meshes.push(mesh);
    this.meshCount += 1;
    this.instanceCount += transforms.length;

    // 加载完成时已被热切到 Q2：立即收敛可见性
    if (this.game.quality.level === 2) mesh.visible = false;
    return mesh;
  }

  /** 登记套件随附碰撞体（道具/桥腿）：Q2 与视觉同步 enable/disable */
  registerBody(body: WorldObject): void {
    this.bodies.push(body);
    if (this.game.quality.level === 2) this.game.objects.disable(body);
  }

  private applyQuality(level: QualityLevel): void {
    const show = level < 2;
    for (const mesh of this.meshes) mesh.visible = show;
    for (const body of this.bodies) {
      if (show) this.game.objects.enable(body);
      else this.game.objects.disable(body);
    }
  }
}
