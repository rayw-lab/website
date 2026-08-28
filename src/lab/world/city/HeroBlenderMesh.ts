// [CC-BL1] hero 楼实模层：Blender 实模 GLB 热替换程序化 ThemeTowers 体块视觉。
//
// 数据驱动：buildings JSON 条目带 `heroGlb`（public/ 相对路径）即入册——在册三栋：
//   · autodrive-lab（CC-BL1，tools/blender/generate-autodrive-lab.py，Draco+KTX2 154KB）
//   · concept-garage（CC-BL2 沿街扩展 + CC-BL2-PLUS 西端天际线段补洞，
//     tools/blender/generate-concept-garage.py，Draco+KTX2 145KB）
//   · voice-pod（CC-VIS-X1B 第三栋 hero，tools/blender/generate-voice-pod.py，
//     Draco+KTX2 166KB；零随楼道具——PROP_COLLIDERS 无条目即零碰撞体）——台账见
//     各自 public/models/*/README.md + asset-ledger。
//
// 回退合同（任务书「保留程序化路径作加载失败 / Q2 fallback」）：
//   · Q2 挂载：**不发起加载**（止损档零 GLB 字节零解码），程序化体块原样；
//   · Q0/Q1 挂载：异步加载（不阻塞 mountCity/ready 帧），成功后隐藏对应
//     ThemeTowers 视觉（物理 footprint cuboid 合同不动），失败 console.warn 静默回退；
//   · 运行时热切档（#debug 句柄）：已加载的实模只切 visible（Q2 显程序化/隐实模），
//     道具碰撞体同步 enable/disable——Q2 下无「隐形墙」；Q2 挂载后升档不补加载
//     （零字节承诺以挂载时档位为准，与 CitySilhouette 密度档同纪律）。
//
// 街角/前场道具簇碰撞体：GLB 内随楼道具（autodrive-lab 东北角充电桩/雨棚柱/试车台/
// totem/杂件/门廊柱；concept-garage 南前场展车台/kiosk/旗杆/备件杂件）按下表注册
// fixed cuboid（StreetProps 同款 game.objects 注册；薄片标线/导视光条/标定板不设
// 碰撞——可碾压件）。各楼 parkingBay 泊车圈与行车通道在建模侧已让空（各生成脚本
// 布局纪律注释：autodrive-lab (28,−28) r6 对角走廊；concept-garage (140,−18) r8 +
// 卷帘门正面出入带 + 灯杆 (150,−13.5) 邻域）。
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
 * 楼 id → 道具碰撞体表（资产随附合同：几何位置见 tools/blender/generate-*.py 对应段）。
 * Blender(bx,by,bz) → three 本地 (x=bx, y=bz, z=−by)；两楼 rotationY 均为 0。
 */
const PROP_COLLIDERS: Record<string, PropCollider[]> = {
  'autodrive-lab': [
    // 裙房基座外挑台阶（0.6m 可见石沿，防车头穿模）
    { x: 0, y: 0.3, z: 0, half: [22.9, 0.3, 18.9] },
    // 充电桩排（4 桩带状）[CC-FXN-EXP01-ENV] 减深：原 half z=7.5（世界 z∈[-40.25,-25.25]）
    // 南缘伸入 e2e 驾驶走廊带（EXP-01 西行线 x=17 处 z≈-25.0、OBS-01 东行线 z≈-26.4），
    // 高帧率下车辆高速擦碰可偏转通过，SwiftShader 慢帧下则贴壁楔死——main/X2 双树
    // CITY-EXP-01 失败主因（T11 #124 F4/F5：main 卡 (25.2,-25.7)、X2 楔死 (19.4,-32.7)
    // 即本带东面）。碰撞带收缩到北三桩（世界 z∈[-40.25,-29.75]，出走廊带 ≥2.5m 余量）；
    // 南端第 1 桩（世界 (17,-26)）转纯视觉件——罕见脱线穿模换确定性楔死陷阱消除
    { x: -35, y: 1.0, z: 17.0, half: [0.8, 1.0, 5.25] },
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
  'concept-garage': [
    // 混凝土基座外挑台阶（0.5m 可见石沿，防车头穿模）
    { x: 0, y: 0.25, z: 0, half: [30.9, 0.25, 18.9] },
    // 西翼：室外展车台（含展车整包）+ 配置器 kiosk + 横幅旗杆 ×2
    { x: -19, y: 1.0, z: 24, half: [2.8, 1.0, 1.5], rotY: (-155 * Math.PI) / 180 },
    { x: -12.5, y: 1.6, z: 20.5, half: [0.35, 1.6, 0.3] },
    { x: -26.5, y: 2.3, z: 21, half: [0.12, 2.3, 0.12] },
    { x: -24, y: 2.3, z: 21, half: [0.12, 2.3, 0.12] },
    // 东翼：备件箱堆 + 轮胎堆 + 服务推车
    { x: 21.2, y: 0.55, z: 21, half: [1.5, 0.55, 1.3] },
    { x: 24.4, y: 0.65, z: 20.3, half: [0.65, 0.65, 0.65] },
    { x: 26.3, y: 0.6, z: 22, half: [0.8, 0.6, 0.5], rotY: (12 * Math.PI) / 180 },
    // 西立面贴墙设备箱（凸出基座沿外 0.1，独立小碰撞体防侧擦穿模）
    { x: -30.5, y: 1.15, z: -13.2, half: [0.5, 1.15, 1.35] },
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
      `[hero-glb] ${building.id} 实模已挂载：${building.heroGlb}` +
        `（Draco+KTX2 逐材质 primitive；随楼道具碰撞体 ${props.length} 件；` +
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
