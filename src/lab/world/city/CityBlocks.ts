// CC-E3：城区体块楼（lodProfile: 'standard' 七栋——work-gallery / insights-archive /
// about-pavilion / contact-beacon / edge-cloud-hub / workflow-foundry / now-signal）。
// 中景档程序化体块：单 box 拉伸 footprint + 窗格 emissive（比主题楼低一档的亮窗率）
// + 楼顶霓虹檐口。CC-P1 接 §12.7.6 流式后，本层即 M 档基底（接近可升 H 档 GLB）。
// 100% 数据驱动（同 ThemeTowers 纪律）；物理 fixed cuboid 按 footprint 注册。
// [CC-VIS-X2] 立面细节层：attachFacades(kit) 把 Blender 立面套件构件经 InstancedMesh
// 贴附到 NDC 取证在册的可见临街面（FACADE_PLAN），楼体/碰撞体零改动。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { Building, CyberCityMap } from './CityMap';
import { createSeededRandom, hashStringToSeed } from './CityMap';
import { createFacadeMaterial, createNeonGlowMaterial } from './NeonFacade';
import type { FacadeKit, FacadeKitPieceName, PieceTransform } from './FacadeKit';

type Face = 'north' | 'south' | 'east' | 'west';

/**
 * [CC-VIS-X2] 立面投资清单——NDC 可见楼取证正本（设计确认 ④「可见楼清单先行」，
 * 复现：public/models/facade-kit/README.md §NDC，1440×900 ritual_idle 八角点投影 +
 * 主干道临街面判定）。首列 face = 临街面（驾驶动线近读，全套构件）；tier 1 = 首幕
 * 入帧楼（now-signal 4/8、workflow-foundry 4/8、edge-cloud-hub 1/8 角点入帧），
 * 追加首幕朝向面（远读：中高层构件 + 屋顶设备剪影）；背街/不可见面零投入。
 */
const FACADE_PLAN: Record<string, { street: Face; firstFrame?: Face; roof?: boolean }> = {
  'now-signal': { street: 'east', firstFrame: 'south', roof: true },
  'workflow-foundry': { street: 'west', firstFrame: 'south', roof: true },
  'edge-cloud-hub': { street: 'south', firstFrame: 'east', roof: true },
  'work-gallery': { street: 'north' },
  'insights-archive': { street: 'west' },
  'about-pavilion': { street: 'east' },
  'contact-beacon': { street: 'north' },
};

/** face → 外法向 + 构件朝向（构件本地 +Z = 凸出方向；rotation.y 把 +Z 转到法向） */
const FACE_DEF: Record<Face, { nx: number; nz: number; rotY: number }> = {
  south: { nx: 0, nz: 1, rotY: 0 },
  north: { nx: 0, nz: -1, rotY: Math.PI },
  east: { nx: 1, nz: 0, rotY: Math.PI / 2 },
  west: { nx: -1, nz: 0, rotY: -Math.PI / 2 },
};

export class CityBlocks {
  private readonly game: Game;
  /** 已注册体块楼（visual group + fixed 碰撞体） */
  blocks: WorldObject[] = [];
  /** 数据驱动清单（id 顺序与 blocks 对齐） */
  readonly buildingIds: string[] = [];
  /** [CC-VIS-X2] standard 楼数据句柄（立面贴附摆位用） */
  private readonly buildings: Building[] = [];

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    for (const building of map.buildings) {
      if (building.lodProfile !== 'standard') continue;
      this.blocks.push(this.addBlock(building));
      this.buildingIds.push(building.id);
      this.buildings.push(building);
    }
  }

  /**
   * [CC-VIS-X2] 立面细节层贴附：套件 ready 后按 FACADE_PLAN 逐楼逐面生成摆位，
   * 每类构件合一个 InstancedMesh（≤6 draw call）。全静态（零循环配额）、零碰撞体
   * 增量（构件凸出 ≤1.9m 且全部高于车顶/或凸出 ≤0.28m 贴墙——README §碰撞）。
   */
  attachFacades(kit: FacadeKit): void {
    void kit.ready.then((pieces) => {
      if (!pieces) return;

      const byPiece = new Map<FacadeKitPieceName, PieceTransform[]>();
      const push = (name: FacadeKitPieceName, t: PieceTransform) => {
        let list = byPiece.get(name);
        if (!list) byPiece.set(name, (list = []));
        list.push(t);
      };

      for (const building of this.buildings) {
        const plan = FACADE_PLAN[building.id];
        // rotationY≠0 的楼不在贴附口径（当前 12 栋全为 0；保守跳过防错位）
        if (!plan || building.position.rotationY !== 0) continue;

        const { w, d, h } = building.footprint;
        const { x: bx, z: bz } = building.position;
        const random = createSeededRandom(hashStringToSeed(`x2-facade-${building.id}`));

        const placeOnFace = (face: Face, mode: 'street' | 'far') => {
          const { nx, nz, rotY } = FACE_DEF[face];
          const wallX = bx + (nx * w) / 2;
          const wallZ = bz + (nz * d) / 2;
          const width = nx === 0 ? w : d; // 沿墙可布宽度
          // 沿墙方向 = 构件本地 +X 的世界向（rotation.y 同步旋转）
          const ax = Math.cos(rotY);
          const az = -Math.sin(rotY);
          const at = (along: number, y: number, out = 0.04, scaleY?: number): PieceTransform => ({
            x: wallX + ax * along + nx * out,
            y,
            z: wallZ + az * along + nz * out,
            rotY,
            scaleY,
          });

          if (mode === 'street') {
            // 街层入口雨棚（面中，驾驶动线近读锚点）+ 竖向管线组 + 全高节奏件
            push('KitCanopy', at((random() - 0.5) * width * 0.2, 3.6));
            push('KitPipeRun', at((0.3 + random() * 0.12) * width * (random() < 0.5 ? -1 : 1), 0, 0.04, Math.min(3.2, (h - 1.5) / 12)));
            push('KitBalcony', at((random() - 0.5) * width * 0.5, h * 0.52));
            for (let i = 0; i < 3; i++) {
              push('KitAcCluster', at((random() - 0.5) * width * 0.72, 4.5 + random() * (h * 0.5 - 4.5)));
            }
            push('KitLouver', at((random() - 0.5) * width * 0.6, h * 0.82));
          } else {
            // 首幕远读面：中高层构件 + 顶带百叶（150m+ 处只有大轮廓与明暗差可读）
            push('KitBalcony', at((random() - 0.5) * width * 0.5, h * 0.7));
            for (let i = 0; i < 2; i++) {
              push('KitAcCluster', at((random() - 0.5) * width * 0.6, h * (0.3 + random() * 0.35)));
            }
            push('KitLouver', at((random() - 0.5) * width * 0.5, h * 0.85));
          }
        };

        placeOnFace(plan.street, 'street');
        if (plan.firstFrame && plan.firstFrame !== plan.street) placeOnFace(plan.firstFrame, 'far');

        // 屋顶设备剪影（首幕楼际线变化件：靠首幕朝向侧摆两组，随机朝向）
        if (plan.roof) {
          const ff = FACE_DEF[plan.firstFrame ?? plan.street];
          for (let i = 0; i < 2; i++) {
            push('KitRoofVent', {
              x: bx + ff.nx * (w * 0.22) + (random() - 0.5) * w * 0.4,
              y: h,
              z: bz + ff.nz * (d * 0.22) + (random() - 0.5) * d * 0.4,
              rotY: random() * Math.PI * 2,
            });
          }
        }
      }

      for (const [name, transforms] of byPiece) kit.addInstances(pieces, name, transforms);
    });
  }

  private addBlock(building: Building): WorldObject {
    const { w, d, h } = building.footprint;
    const seed = hashStringToSeed(building.id);

    const group = new THREE.Group();
    group.name = `city-block-${building.id}`;

    // 主体块（本地原点 = 体块中心；box 居中即楼体坐标，无需 translate）
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      createFacadeMaterial({
        height: h,
        neonColor: building.neonColor,
        seed,
        litRatio: 0.32,
        intensity: 1.1,
      }),
    );
    group.add(body);

    // 楼顶霓虹檐口（常亮，中景层次的「城市在呼吸」底光）
    const corniceHeight = Math.min(0.5, h * 0.03);
    const corniceGeometry = new THREE.BoxGeometry(w * 1.03, corniceHeight, d * 1.03);
    corniceGeometry.translate(0, h / 2 - corniceHeight / 2, 0);
    group.add(
      new THREE.Mesh(
        corniceGeometry,
        createNeonGlowMaterial(building.neonColor, { pulseSpeed: 0, intensity: 1.3 }),
      ),
    );

    const rotationQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, (building.position.rotationY * Math.PI) / 180, 0),
    );

    return this.game.objects.add(
      { model: group, castShadow: true, receiveShadow: false },
      {
        type: 'fixed',
        position: { x: building.position.x, y: h / 2, z: building.position.z },
        rotation: {
          x: rotationQuaternion.x,
          y: rotationQuaternion.y,
          z: rotationQuaternion.z,
          w: rotationQuaternion.w,
        },
        friction: 0.5,
        restitution: 0.05,
        category: 'object',
        colliders: [{ shape: 'cuboid', parameters: [w / 2, h / 2, d / 2] }],
      },
    );
  }
}
