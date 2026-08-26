// [CC-L2-B2] 街道灯杆 + 沿街广告灯箱（视觉 rubric §6 Tier B2；AL2-a-plus 审计
// 放行项，10 件 ≤ 「6-10 件」上限）。街道层此前只有路缘光与 8 只隔离墩——本层
// 补上垂直街道家具：暗金属灯杆 + 悬臂灯头 + 杆侧挂旗式广告灯箱，全部常亮
// （无时间项，不占 CITY-03 循环动画配额）。AL2-a-plus §5 裁决第 1 条：灯箱给
// 湿地面提供有语义的反射源——Q0 的 Grid/Roads 共享 reflector 是真镜像渲染，
// 灯头/灯箱发光自动入水，零额外接线。
// 纪律：
//   · InstancedMesh 1-2 draw call（rubric B2 原文）：杆+臂+灯头+灯箱合并为
//     1 份几何，按路轴色族分 2 个 InstancedMesh（青=南北 / 品红=东西）；
//   · neon 色单源：色 hex 走 src/data/neon-tokens.ts（Roads/壳 CSS 同一出处），
//     材质工厂 createStreetLampMaterial 在 NeonMaterials（单材质系统纪律）；
//   · 物理 = 1 个 fixed 刚体挂 10 个 cylinder 碰撞体（StreetProps 隔离墩同款
//     model:null 注册）——撞杆有反馈；
//   · 摆位全部路缘外 1.5m（halfWidth+1.5），已核对不侵入任何 parkingBay
//     触发圈（最近 = concept-garage bay 距 11m > 半径 8m）与隔离墩阵。
import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NEON } from '../../../data/neon-tokens';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { CyberCityMap } from './CityMap';
import { createStreetLampMaterial } from './NeonFacade';

const POLE_HEIGHT = 8.2;
const POLE_RADIUS = 0.2;
const ARM_LENGTH = 2.6;

/** 发光件局部包围带（材质掩码与几何布局共用一份常量，防错位） */
const HEAD_BAND = { y0: 7.3, y1: 7.8, xMin: 1.55 };
const BANNER_BAND = { y0: 3.6, y1: 6.2, xMin: 0.24 };

interface LampSpot {
  x: number;
  z: number;
  /** 本地 +X（悬臂朝向）→ 世界的 Y 旋转：臂永远伸向路面上空 */
  rotationY: number;
  /** 色族 = 所属道路轴（南北=青 / 东西=品红，Roads ROAD_NEON 同表） */
  axis: 'north-south' | 'east-west';
}

export class StreetLamps {
  /** 灯杆阵物理体（10 个 cylinder 碰撞体合一个 fixed 刚体） */
  lampBody: WorldObject | null = null;
  /** 灯位清单（调试/取证读数用） */
  readonly spots: LampSpot[] = [];

  private readonly game: Game;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    const northSouth = map.world.roads.find((road) => road.axis === 'north-south');
    const eastWest = map.world.roads.find((road) => road.axis === 'east-west');
    if (!northSouth || !eastWest) return; // Roads 构造器已抛错兜底

    // 路缘外 1.5m 的灯杆线（路面带 ±halfWidth，臂长 2.6m 探入路面上空 ~1m）
    const nsCurb = northSouth.halfWidth + 1.5;
    const ewCurb = eastWest.halfWidth + 1.5;

    // 南北大道 6 杆：北向路廊 4 杆左右交错（主机位帧内纵深节奏），南段 2 杆；
    // 臂朝路心：西侧杆 rotY=0（+X=东），东侧杆 rotY=π（+X=西）
    for (const [side, z] of [
      [-1, -34],
      [1, -58],
      [-1, -82],
      [1, -106],
      [1, 44],
      [-1, 68],
    ] as const) {
      this.spots.push({
        x: side * nsCurb,
        z,
        rotationY: side < 0 ? 0 : Math.PI,
        axis: 'north-south',
      });
    }

    // 东西大街 4 杆：路口两翼 + concept-garage 门前段（VIS-04 深链帧内可见）；
    // 北侧杆（z<0）臂朝南 rotY=-π/2，南侧杆臂朝北 rotY=+π/2
    for (const [x, side] of [
      [-52, 1],
      [52, -1],
      [110, 1],
      [150, -1],
    ] as const) {
      this.spots.push({
        x,
        z: side * ewCurb,
        rotationY: side < 0 ? -Math.PI / 2 : Math.PI / 2,
        axis: 'east-west',
      });
    }

    this.setVisuals();
    this.setPhysical();
  }

  /** 杆+臂+灯头+灯箱合并几何（本地 +X = 臂朝向；发光带常量与材质掩码同源） */
  private buildLampGeometry(): THREE.BufferGeometry {
    const pole = new THREE.CylinderGeometry(0.13, POLE_RADIUS, POLE_HEIGHT, 8);
    pole.translate(0, POLE_HEIGHT / 2, 0);

    const arm = new THREE.BoxGeometry(ARM_LENGTH, 0.15, 0.15);
    arm.translate(ARM_LENGTH / 2 + 0.05, 8.0, 0);

    // 灯头盒：悬臂端下挂（y 7.38-7.72 ⊂ HEAD_BAND，x 1.7-3.2 > xMin）
    const head = new THREE.BoxGeometry(1.5, 0.34, 0.5);
    head.translate(2.45, 7.55, 0);

    // 挂旗式广告灯箱：杆侧竖版（y 3.65-6.15 ⊂ BANNER_BAND，x 0.24-1.28 > xMin；
    // 大面朝本地 ±Z = 沿路方向，行车/主机位正视可读）
    const banner = new THREE.BoxGeometry(1.04, 2.5, 0.12);
    banner.translate(0.76, 4.9, 0);

    return mergeGeometries([pole, arm, head, banner]);
  }

  private setVisuals(): void {
    const geometry = this.buildLampGeometry();
    const dummy = new THREE.Object3D();

    for (const axis of ['north-south', 'east-west'] as const) {
      const spots = this.spots.filter((spot) => spot.axis === axis);
      if (spots.length === 0) continue;

      const mesh = new THREE.InstancedMesh(
        geometry,
        createStreetLampMaterial(axis === 'north-south' ? NEON.cyan : NEON.magenta, {
          head: HEAD_BAND,
          banner: BANNER_BAND,
        }),
        spots.length,
      );
      mesh.name = `city-street-lamps-${axis}`;
      mesh.castShadow = true;

      spots.forEach((spot, i) => {
        dummy.position.set(spot.x, 0, spot.z);
        dummy.rotation.set(0, spot.rotationY, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;

      this.game.scene.add(mesh);
    }
  }

  /** 10 个 cylinder 碰撞体合一个 fixed 刚体（Rapier cylinder(halfHeight, radius)） */
  private setPhysical(): void {
    this.lampBody = this.game.objects.add(null, {
      type: 'fixed',
      position: { x: 0, y: 0, z: 0 },
      friction: 0.4,
      restitution: 0.3,
      category: 'object',
      colliders: this.spots.map((spot) => ({
        shape: 'cylinder' as const,
        parameters: [POLE_HEIGHT / 2, POLE_RADIUS],
        position: { x: spot.x, y: POLE_HEIGHT / 2, z: spot.z },
      })),
    });
  }
}
