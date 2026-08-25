// CC-L1 A2：街角霓虹隔离墩（视觉 rubric §6 Tier A2；AL0 审计 §8「撤首幕试车锥桶，
// 替换少量叙事一致的霓虹城市道具」的替换项）。
// spike 遗留的 16 只橙色试车锥桶在城市首幕被读作「驾校」（rubric V4/V7 双扣分），
// 已按取景档撤场（World.setCones 只在 greybox 档执行）；本文件补上城市语汇的道具层：
//   · 8 只隔离墩分列十字路口四角（各 2 只，framing 四条斑马线出口，站位在路缘外
//     plaza 角区——不侵入可驾驶路面）；
//   · 视觉 = InstancedMesh × 2（墩身暗金属 + 顶环常亮霓虹，共 2 个 draw call）；
//     常亮（pulseSpeed=0 语义）不占循环动画配额（CITY-03 ≤2 处纪律）；
//   · 物理 = 1 个 fixed 刚体挂 8 个 cylinder 碰撞体（Objects 显式描述，Roads
//     cityFloor 同款 model:null 注册）——撞上有反馈，「物理在跑」的可见证据由
//     车辆本体与路障承接。
// 颜色纪律（A3 同 PR）：顶环只用双主轴霓虹色族——南北向斑马线口=青、东西向=品红
// （Roads ROAD_NEON 同表），不引入第三色相。
import * as THREE from 'three/webgpu';
import { Fn, mix, positionGeometry, smoothstep, vec3 } from 'three/tsl';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { Vec3Node } from '../rendering/MeshGridMaterial';
import type { CyberCityMap } from './CityMap';

const BOLLARD_RADIUS = 0.22;
const BOLLARD_HEIGHT = 1.15;

interface BollardSpot {
  x: number;
  z: number;
  /** 顶环色族：南北向斑马线口=青 / 东西向=品红（线性空间近似值在材质内取） */
  axis: 'north-south' | 'east-west';
}

export class StreetProps {
  /** 隔离墩阵物理体（8 个 cylinder 碰撞体合一个 fixed 刚体） */
  bollardBody: WorldObject | null = null;
  /** 墩位清单（调试/取证读数用） */
  readonly spots: BollardSpot[] = [];

  private readonly game: Game;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    const northSouth = map.world.roads.find((road) => road.axis === 'north-south');
    const eastWest = map.world.roads.find((road) => road.axis === 'east-west');
    if (!northSouth || !eastWest) return; // Roads 构造器已抛错兜底，此处静默即可

    // 站位：路缘（halfWidth=12）外 1.6m 的 plaza 角区，纵向贴斑马线带（±14.6±2）——
    // 每个路口角 2 只：一只押南北向斑马线出口、一只押东西向出口
    const nsCurb = northSouth.halfWidth + 1.6;
    const ewCurb = eastWest.halfWidth + 1.6;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        this.spots.push({ x: sx * nsCurb, z: sz * (ewCurb + 3.6), axis: 'north-south' });
        this.spots.push({ x: sx * (nsCurb + 3.6), z: sz * ewCurb, axis: 'east-west' });
      }
    }

    this.setVisuals();
    this.setPhysical();
  }

  private setVisuals(): void {
    // 墩身：暗金属圆柱（ThemeTowers podium 同族近黑色）
    const bodyGeometry = new THREE.CylinderGeometry(
      BOLLARD_RADIUS * 0.82,
      BOLLARD_RADIUS,
      BOLLARD_HEIGHT,
      10,
    );
    bodyGeometry.translate(0, BOLLARD_HEIGHT / 2, 0);
    const bodyMaterial = new THREE.MeshStandardNodeMaterial({
      color: new THREE.Color('#12141c'),
      roughness: 0.55,
      metalness: 0.6,
    });

    // 顶环：常亮霓虹带（局部高度切带，锥桶反光带同手法；emissive>1 起 bloom 锚点）
    const ringGeometry = new THREE.CylinderGeometry(
      BOLLARD_RADIUS * 0.92,
      BOLLARD_RADIUS * 0.92,
      0.14,
      10,
    );
    ringGeometry.translate(0, BOLLARD_HEIGHT - 0.18, 0);

    // 顶环双色族分双 InstancedMesh（4 个 draw call 封顶：墩身×2 + 顶环×2）
    const cyan = vec3(0.29, 0.78, 0.72).mul(1.7);
    const magenta = vec3(0.98, 0.16, 0.44).mul(1.5);

    const makeRingMaterial = (color: Vec3Node) => {
      const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.4, metalness: 0 });
      material.colorNode = vec3(0.02, 0.02, 0.025);
      material.emissiveNode = Fn(() => {
        // 环带上缘微暗（立体感），常亮无时间项——不占循环动画配额
        const fade = smoothstep(0.2, -0.2, positionGeometry.y.sub(BOLLARD_HEIGHT - 0.18));
        return mix(color.mul(0.7), color, fade);
      })();
      return material;
    };

    const dummy = new THREE.Object3D();
    const byAxis: Record<BollardSpot['axis'], BollardSpot[]> = {
      'north-south': this.spots.filter((spot) => spot.axis === 'north-south'),
      'east-west': this.spots.filter((spot) => spot.axis === 'east-west'),
    };

    for (const axis of ['north-south', 'east-west'] as const) {
      const spots = byAxis[axis];
      const ringColor = axis === 'north-south' ? cyan : magenta;

      const bodies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, spots.length);
      const rings = new THREE.InstancedMesh(ringGeometry, makeRingMaterial(ringColor), spots.length);
      bodies.name = `city-bollards-${axis}`;
      rings.name = `city-bollard-rings-${axis}`;
      bodies.castShadow = true;

      spots.forEach((spot, i) => {
        dummy.position.set(spot.x, 0, spot.z);
        dummy.updateMatrix();
        bodies.setMatrixAt(i, dummy.matrix);
        rings.setMatrixAt(i, dummy.matrix);
      });
      bodies.instanceMatrix.needsUpdate = true;
      rings.instanceMatrix.needsUpdate = true;

      this.game.scene.add(bodies, rings);
    }
  }

  /** 8 个 cylinder 碰撞体合一个 fixed 刚体（Rapier cylinder(halfHeight, radius)） */
  private setPhysical(): void {
    this.bollardBody = this.game.objects.add(null, {
      type: 'fixed',
      position: { x: 0, y: 0, z: 0 },
      friction: 0.4,
      restitution: 0.35,
      category: 'object',
      colliders: this.spots.map((spot) => ({
        shape: 'cylinder' as const,
        parameters: [BOLLARD_HEIGHT / 2, BOLLARD_RADIUS],
        position: { x: spot.x, y: BOLLARD_HEIGHT / 2, z: spot.z },
      })),
    });
  }
}
