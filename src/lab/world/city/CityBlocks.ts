// CC-E3：城区体块楼（lodProfile: 'standard' 七栋——work-gallery / insights-archive /
// about-pavilion / contact-beacon / edge-cloud-hub / workflow-foundry / now-signal）。
// 中景档程序化体块：单 box 拉伸 footprint + 窗格 emissive（比主题楼低一档的亮窗率）
// + 楼顶霓虹檐口。CC-P1 接 §12.7.6 流式后，本层即 M 档基底（接近可升 H 档 GLB）。
// 100% 数据驱动（同 ThemeTowers 纪律）；物理 fixed cuboid 按 footprint 注册。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { Building, CyberCityMap } from './CityMap';
import { hashStringToSeed } from './CityMap';
import { createFacadeMaterial, createNeonGlowMaterial } from './NeonFacade';

export class CityBlocks {
  private readonly game: Game;
  /** 已注册体块楼（visual group + fixed 碰撞体） */
  blocks: WorldObject[] = [];
  /** 数据驱动清单（id 顺序与 blocks 对齐） */
  readonly buildingIds: string[] = [];

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    for (const building of map.buildings) {
      if (building.lodProfile !== 'standard') continue;
      this.blocks.push(this.addBlock(building));
      this.buildingIds.push(building.id);
    }
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
