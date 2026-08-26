// CC-E3：主题楼（lodProfile: 'hero' 五栋 = 内环四主题塔 + concept-garage 车库）。
// 100% 数据驱动自 buildings JSON：位置/足迹/霓虹色/旋转全部来自条目字段，
// 加一栋 hero 楼 = 加一条 JSON，本文件零改动（SRD §12.7.3 守则④）。
// 体量思路重写自 three.js r185 SkyscraperGenerator 的分阶收分（MIT，只借算法）：
// 高楼（≥55m）双阶 setback + 楼顶天线信标；矮楼/横向体量单体块。可读招牌
//（[CC-L2-B1] 楼名全息板 + 立面灯箱）见 BuildingSigns（占位箍带已被其替换）。
// 每栋 = 若干 box 网格共享 1 个幕墙材质（窗格 TSL 程序化，см NeonFacade），
// 几何 translate 烘进「楼体中心为原点」的本地坐标——窗格层高跨体块连续。
// 物理：fixed cuboid 按 footprint 注册进 Objects（World.ts 同款显式描述）。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { Building, CyberCityMap } from './CityMap';
import { createSeededRandom, hashStringToSeed } from './CityMap';
import { createFacadeMaterial, createNeonGlowMaterial } from './NeonFacade';

/** 裙房/天线共用暗金属材质（全部主题楼共享 1 份） */
function createPodiumMaterial(): THREE.MeshStandardNodeMaterial {
  return new THREE.MeshStandardNodeMaterial({
    color: new THREE.Color('#101018'),
    roughness: 0.6,
    metalness: 0.55,
  });
}

export class ThemeTowers {
  private readonly game: Game;
  /** 已注册主题楼（visual group + fixed 碰撞体） */
  towers: WorldObject[] = [];
  /** 数据驱动清单（调试/HUD 联动用：id 顺序与 towers 对齐） */
  readonly buildingIds: string[] = [];

  private readonly podiumMaterial = createPodiumMaterial();

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    for (const building of map.buildings) {
      if (building.lodProfile !== 'hero') continue;
      this.towers.push(this.addTower(building));
      this.buildingIds.push(building.id);
    }
  }

  /**
   * [CC-BL1] 按楼 id 取已注册体——HeroBlenderMesh 实模热替换用：只隐藏程序化
   * 视觉（visual.object3D.visible），fixed 碰撞体照旧（footprint cuboid 合同不动）。
   */
  getTower(id: string): WorldObject | null {
    const index = this.buildingIds.indexOf(id);
    return index >= 0 ? this.towers[index] : null;
  }

  private addTower(building: Building): WorldObject {
    const { w, d, h } = building.footprint;
    const seed = hashStringToSeed(building.id);
    const random = createSeededRandom(seed);

    // 本地坐标系：原点 = 楼体中心 (0,0,0)，对应世界 (x, h/2, z)；楼底局部 y = -h/2
    const baseY = -h / 2;
    const group = new THREE.Group();
    group.name = `city-tower-${building.id}`;

    const facade = createFacadeMaterial({
      height: h,
      neonColor: building.neonColor,
      seed,
      litRatio: 0.5,
      intensity: 1.5,
      lobby: true,
      // [CC-L5-C1] hero 近景楼 ~10% 窗格升格假室内映射（standard 楼不开，零开销）；
      // rotationY 供室内视差的视线世界→本地变换（JSON 单源，编译期常量）
      interiorRatio: 0.1,
      rotationY: (building.position.rotationY * Math.PI) / 180,
    });

    const addBox = (
      sizeX: number,
      sizeY: number,
      sizeZ: number,
      centerY: number,
      material: THREE.Material,
    ) => {
      const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
      geometry.translate(0, centerY, 0); // 烘进楼体本地坐标（窗格取 positionGeometry）
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      return mesh;
    };

    // 裙房（临街基座）
    const podiumHeight = Math.min(4, h * 0.25);
    addBox(w * 1.14, podiumHeight, d * 1.14, baseY + podiumHeight / 2, this.podiumMaterial);

    // 体量：高楼双阶收分，矮楼/横向楼单体块。
    // [CC-L2-B1] 楼顶霓虹占位箍带已撤——可读招牌（楼名全息板 + 立面灯箱）由
    // BuildingSigns 接管（rubric §6 B1「双面全息板替换占位箍带」的替换项）；
    // 其「招牌脉动」循环动画配额席位随迁至全息板（CITY-03 ≤2 处不变）。
    if (h >= 55) {
      const lowerHeight = h * (0.56 + random() * 0.08);
      const upperHeight = h - lowerHeight;
      const shrink = 0.72 + random() * 0.1;
      addBox(w, lowerHeight, d, baseY + lowerHeight / 2, facade);
      addBox(w * shrink, upperHeight, d * shrink, baseY + lowerHeight + upperHeight / 2, facade);
    } else {
      addBox(w, h, d, 0, facade);
    }

    // 楼顶天线 + 呼吸信标（超高层地标性，Agent Nexus / Contact Beacon 类）
    if (h >= 70) {
      const mastHeight = h * 0.16;
      const mastGeometry = new THREE.CylinderGeometry(0.3, 0.5, mastHeight, 8);
      mastGeometry.translate(0, h / 2 + mastHeight / 2, 0);
      group.add(new THREE.Mesh(mastGeometry, this.podiumMaterial));

      const beaconGeometry = new THREE.SphereGeometry(0.7, 12, 8);
      beaconGeometry.translate(0, h / 2 + mastHeight + 0.5, 0);
      group.add(
        new THREE.Mesh(
          beaconGeometry,
          createNeonGlowMaterial(building.neonColor, { pulseSpeed: 2.4, phase: seed % 7, intensity: 3 }),
        ),
      );
    }

    // fixed 碰撞体：footprint cuboid（含 rotationY，度 → 四元数）
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
