// [CC-BL1] hero 楼实模层：Blender 实模 GLB 热替换程序化 ThemeTowers 体块视觉。
//
// 数据驱动：buildings JSON 条目带 `heroGlb`（public/ 相对路径）即入册——本拍只有
// autodrive-lab（scripts/blender/generate-autodrive-lab.py 全程序化生成，Draco+KTX2
// 压缩 154KB，台账见 public/models/autodrive-lab/README.md + asset-ledger）。
//
// 回退合同（任务书「保留程序化路径作加载失败 / Q2 fallback」）：
//   · Q2 挂载：**不发起加载**（止损档零 GLB 字节零解码），程序化体块原样；
//   · Q0/Q1 挂载：异步加载（不阻塞 mountCity/ready 帧），成功后隐藏对应
//     ThemeTowers 视觉（物理 footprint cuboid 合同不动），失败 console.warn 静默回退；
//   · 运行时热切档（#debug 句柄）：已加载的实模只切 visible（Q2 显程序化/隐实模），
//     道具碰撞体同步 enable/disable——Q2 下无「隐形墙」；Q2 挂载后升档不补加载
//     （零字节承诺以挂载时档位为准，与 CitySilhouette 密度档同纪律）。
//
// 街角道具簇碰撞体：GLB 内东北角道具（充电桩/雨棚柱/试车台/totem/杂件/门廊柱）
// 按下表注册 fixed cuboid（StreetProps 同款 game.objects 注册；薄片标线/缆线槽/
// 标定板不设碰撞——可碾压件）。泊车圈 (28,−28) r6 与隔离墩缺口→泊车位的对角
// 行车走廊在建模侧已让空（generate-autodrive-lab.py 布局纪律注释）。
import * as THREE from 'three/webgpu';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';
import type { WorldObject } from '../core/Objects';
import type { Building, CyberCityMap } from './CityMap';
import type { ThemeTowers } from './ThemeTowers';

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 道具碰撞体条目（楼体本地坐标，米；y=半高中心，rotY 弧度） */
interface PropCollider {
  x: number;
  y: number;
  z: number;
  half: [number, number, number];
  rotY?: number;
}

/**
 * 楼 id → 道具碰撞体表（资产随附合同：几何位置见 generate-autodrive-lab.py 对应段）。
 * Blender(bx,by,bz) → three 本地 (x=bx, y=bz, z=−by)；autodrive-lab rotationY=0。
 */
const PROP_COLLIDERS: Record<string, PropCollider[]> = {
  'autodrive-lab': [
    // 裙房基座外挑台阶（0.6m 可见石沿，防车头穿模）
    { x: 0, y: 0.3, z: 0, half: [22.9, 0.3, 18.9] },
    // 充电桩排（4 桩带状）
    { x: -35, y: 1.0, z: 19.25, half: [0.8, 1.0, 7.5] },
    // 光伏雨棚柱 ×4
    { x: -37.2, y: 1.65, z: 27.8, half: [0.2, 1.65, 0.2] },
    { x: -32.8, y: 1.65, z: 27.8, half: [0.2, 1.65, 0.2] },
    { x: -37.2, y: 1.65, z: 10.7, half: [0.2, 1.65, 0.2] },
    { x: -32.8, y: 1.65, z: 10.7, half: [0.2, 1.65, 0.2] },
    // 试车升降台（平台 + 门架整包）
    { x: -9, y: 1.1, z: 31, half: [2.9, 1.1, 1.8], rotY: (24 * Math.PI) / 180 },
    // 全息 totem / 冷却罐 / 备件箱堆
    { x: -37, y: 1.7, z: 31, half: [0.4, 1.7, 0.35] },
    { x: -21.5, y: 1.35, z: 34.5, half: [0.8, 1.35, 0.8] },
    { x: -25.4, y: 0.5, z: 33, half: [1.3, 0.5, 1.2] },
    // 警示隔离墩 ×2
    { x: -29.5, y: 0.4, z: 36.5, half: [0.95, 0.4, 0.25], rotY: (30 * Math.PI) / 180 },
    { x: -26, y: 0.4, z: 36.5, half: [0.95, 0.4, 0.25], rotY: (-12 * Math.PI) / 180 },
    // 门廊柱 ×4 + 引导矮墙 ×2（西门厅骑楼）
    { x: -27.6, y: 2.0, z: 4.6, half: [0.17, 2.0, 0.17] },
    { x: -24.9, y: 2.0, z: 4.6, half: [0.17, 2.0, 0.17] },
    { x: -27.6, y: 2.0, z: -4.6, half: [0.17, 2.0, 0.17] },
    { x: -24.9, y: 2.0, z: -4.6, half: [0.17, 2.0, 0.17] },
    { x: -26.1, y: 0.4, z: 5.6, half: [2.25, 0.4, 0.2] },
    { x: -26.1, y: 0.4, z: -5.6, half: [2.25, 0.4, 0.2] },
  ],
};

interface HeroGlbEntry {
  building: Building;
  glbRoot: THREE.Group;
  towerVisual: THREE.Object3D;
  /** 道具碰撞体单 fixed body（StreetProps 同款：1 body 多 collider；无道具楼为 null） */
  propBody: WorldObject | null;
}

export class HeroBlenderMesh {
  /** 全部实模加载尝试收敛（成功/失败均 resolve；e2e/取证同步点） */
  readonly ready: Promise<void>;
  /** 已成功挂载实模的楼 id（顺序 = JSON 在册序） */
  readonly activeBuildingIds: string[] = [];
  /** 在册（带 heroGlb 字段）楼数——挂载日志/台账读数 */
  readonly plannedCount: number;

  private readonly game: Game;
  private readonly entries: HeroGlbEntry[] = [];

  constructor(game: Game, map: CyberCityMap, themeTowers: ThemeTowers) {
    this.game = game;

    const planned = map.buildings.filter(
      (building) => building.lodProfile === 'hero' && building.heroGlb,
    );
    this.plannedCount = planned.length;

    // Q2 挂载 = 止损档合同：零 GLB 请求零解码，程序化体块即最终视觉
    if (game.quality.level === 2 || planned.length === 0) {
      this.ready = Promise.resolve();
      return;
    }

    this.ready = Promise.allSettled(
      planned.map((building) => this.loadOne(building, themeTowers)),
    ).then(() => undefined);

    // 运行时热切档：已加载实模按档位切 visible（碰撞体同步，防 Q2 隐形墙）
    game.quality.events.on('change', (level: QualityLevel) => this.applyQuality(level));
  }

  private async loadOne(building: Building, themeTowers: ThemeTowers): Promise<void> {
    const url = `${base}/${building.heroGlb}`;
    let gltf: GLTF | null = null;
    try {
      const resources = await this.game.resourcesLoader.load([[building.id, url, 'gltf']]);
      gltf = (resources[building.id] as GLTF) ?? null;
    } catch {
      gltf = null;
    }

    const tower = themeTowers.getTower(building.id);
    if (!gltf || !tower?.visual) {
      console.warn(`[hero-glb] ${building.id} 实模加载失败，保留程序化体块（R4 止损回退）`);
      return;
    }

    const glbRoot = gltf.scene;
    glbRoot.name = `city-hero-glb-${building.id}`;
    const rotationY = (building.position.rotationY * Math.PI) / 180;
    glbRoot.position.set(building.position.x, 0, building.position.z);
    glbRoot.rotation.y = rotationY;

    glbRoot.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      // 阴影口径与 ThemeTowers 同：投影不受影（城市地表 receiveShadow 已开）
      mesh.castShadow = true;
      mesh.receiveShadow = false;
    });

    this.game.scene.add(glbRoot);

    // 程序化体块只隐视觉——footprint cuboid 物理合同、BuildingSigns 招牌挂点不动
    tower.visual.object3D.visible = false;

    // 街角道具簇碰撞体：单 fixed body（挂楼位 + rotationY）+ 表驱动多 collider
    //（collider position/quaternion 均为 body 本地系——楼旋转自动带动道具）
    const props = PROP_COLLIDERS[building.id] ?? [];
    let propBody: WorldObject | null = null;
    if (props.length > 0) {
      const bodyQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationY, 0));
      propBody = this.game.objects.add(null, {
        type: 'fixed',
        position: { x: building.position.x, y: 0, z: building.position.z },
        rotation: {
          x: bodyQuaternion.x,
          y: bodyQuaternion.y,
          z: bodyQuaternion.z,
          w: bodyQuaternion.w,
        },
        friction: 0.5,
        restitution: 0.05,
        category: 'object',
        colliders: props.map((prop) => {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, prop.rotY ?? 0, 0));
          return {
            shape: 'cuboid' as const,
            parameters: prop.half,
            position: { x: prop.x, y: prop.y, z: prop.z },
            quaternion: { x: q.x, y: q.y, z: q.z, w: q.w },
          };
        }),
      });
    }

    this.entries.push({ building, glbRoot, towerVisual: tower.visual.object3D, propBody });
    this.activeBuildingIds.push(building.id);

    // 当前已是 Q2（加载期间被热切档）：立即按档位收敛可见性
    if (this.game.quality.level === 2) this.applyQuality(2);

    console.info(
      `[hero-glb] [CC-BL1] ${building.id} 实模已挂载：${building.heroGlb}` +
        `（Draco+KTX2，13 材质 primitive；街角道具碰撞体 ${props.length} 件；` +
        `程序化体块转入 Q2/失败回退位）`,
    );
  }

  /** 档位可见性收敛：Q0/Q1 实模、Q2 程序化（碰撞体随实模 enable/disable） */
  private applyQuality(level: QualityLevel): void {
    const useGlb = level < 2;
    for (const entry of this.entries) {
      entry.glbRoot.visible = useGlb;
      entry.towerVisual.visible = !useGlb;
      if (entry.propBody) {
        if (useGlb) this.game.objects.enable(entry.propBody);
        else this.game.objects.disable(entry.propBody);
      }
    }
  }
}
