// CC-E3：主十字路口路网（数据驱动自 buildings JSON world.roads / world.spawn）。
// 路面着色思路重写自 three.js r185 CityGenerator 的 createRoadMaterial（MIT，
// 车道线/斑马线程序化画法），换皮为「暗沥青 + 霓虹路缘光」；全部世界坐标系取样，
// 三块路面网格共用 1 个材质、图案跨网格无缝。
// 物理（Objects 命名约定，World.ts 同款 objects.add 显式描述）：
//   ① 城市地面碰撞体（±340m，补齐 World 灰盒 ±150m 之外的可驾驶区）；
//   ② 四条道路尽头全息路障（fixed cuboid，CC-P1 全图开放前的「世界边界」）。
// 出生点标记 = 霓虹光圈 + 朝北箭标，直接读 JSON world.spawn 坐标（对齐 SRD §12.7.5）。
import * as THREE from 'three/webgpu';
import { Fn, abs, float, fract, hash, mix, positionWorld, smoothstep, step, vec2, vec3 } from 'three/tsl';
import { NEON } from '../../../data/neon-tokens';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { QualityLevel } from '../core/Quality';
import type { Vec3Node } from '../rendering/MeshGridMaterial';
import { cityPuddleMask, citySheenColor, type Grid } from '../world/Grid';
import type { CyberCityMap, Road } from './CityMap';
import { createHologramBarrierMaterial } from './NeonFacade';

/** 道路主题色（中轴大道=青（南北）、霓虹大街=品红（东西））。
 *  [CC-L2-a+] 色值收敛 src/data/neon-tokens.ts 单源（壳 CSS --neon-* 同一出处） */
const ROAD_NEON = { northSouth: NEON.cyan, eastWest: NEON.magenta } as const;

/** 分层高度：plaza(0.02) < 路面(0.1)——WebGL 2 标准深度下远端 24bit 精度约 ±8cm，留足余量防 z-fighting */
const PLAZA_Y = 0.02;
const ROAD_Y = 0.1;

export class Roads {
  private readonly game: Game;
  private readonly map: CyberCityMap;

  /** 广场地坪（覆盖灰盒网格，城市态的地表基底） */
  plaza!: THREE.Mesh;
  /** 路面网格（南北 1 段 + 东西 2 段，十字交叠区归南北段画） */
  surfaces: THREE.Mesh[] = [];
  /** 道路尽头全息路障（视觉 + fixed 碰撞体） */
  barriers: WorldObject[] = [];
  /** 城市地面碰撞体（物理-only） */
  cityFloor!: WorldObject;

  /** 路面共享材质（湿反射层按品质档重组 emissive/roughness，见 applyWetQuality） */
  private surfaceMaterial!: THREE.MeshStandardNodeMaterial;
  /** 路面霓虹 emissive 基底（路缘光 + 出生标记；品质无关，构造时建一次跨档复用） */
  private neonBase!: Vec3Node;
  private currentWetLevel: QualityLevel | null = null;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;
    this.map = map;

    const northSouth = map.world.roads.find((road) => road.axis === 'north-south');
    const eastWest = map.world.roads.find((road) => road.axis === 'east-west');
    if (!northSouth || !eastWest) {
      throw new Error('[city] buildings JSON world.roads 缺少南北/东西主轴条目');
    }

    this.setPlaza();
    this.setSurfaces(northSouth, eastWest);
    this.setCityFloorPhysical();
    this.setBarriers(northSouth, eastWest);
  }

  private setPlaza(): void {
    // 地坪：近黑混凝土 + 8m 暗紫街区栅格（比灰盒网格暗一档，突出路面与楼宇）
    const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.96, metalness: 0 });
    material.colorNode = Fn(() => {
      const coord = positionWorld.xz.div(8);
      const distanceToLine = coord.fract().sub(0.5).abs().oneMinus().sub(0.5).abs();
      const line = smoothstep(0.03, 0.012, distanceToLine.x.min(distanceToLine.y));
      const speckle = hash(coord.floor().dot(vec2(127.1, 311.7))).mul(0.006);
      return vec3(0.02, 0.02, 0.028).add(vec3(0.05, 0.035, 0.1).mul(line)).add(speckle);
    })();

    this.plaza = new THREE.Mesh(new THREE.PlaneGeometry(680, 680), material);
    this.plaza.rotation.x = -Math.PI * 0.5;
    this.plaza.position.y = PLAZA_Y;
    this.plaza.receiveShadow = true;
    this.game.scene.add(this.plaza);
  }

  private setSurfaces(northSouth: Road, eastWest: Road): void {
    const material = this.createRoadMaterial(northSouth, eastWest);

    const addSurface = (width: number, depth: number, x: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
      mesh.rotation.x = -Math.PI * 0.5;
      mesh.position.set(x, ROAD_Y, z);
      mesh.receiveShadow = true;
      this.game.scene.add(mesh);
      this.surfaces.push(mesh);
    };

    // 南北全段（含十字交叠区）
    const nsLength = northSouth.range[1] - northSouth.range[0];
    addSurface(northSouth.halfWidth * 2, nsLength, 0, (northSouth.range[0] + northSouth.range[1]) / 2);

    // 东西两段（扣除交叠方块，避免共面双画）
    const westLength = -northSouth.halfWidth - eastWest.range[0];
    addSurface(westLength, eastWest.halfWidth * 2, eastWest.range[0] + westLength / 2, 0);
    const eastLength = eastWest.range[1] - northSouth.halfWidth;
    addSurface(eastLength, eastWest.halfWidth * 2, eastWest.range[1] - eastLength / 2, 0);
  }

  /** 路面材质：暗沥青 + 中线虚线 + 白边线 + 斑马线（colorNode）+ 霓虹路缘光/出生标记（emissiveNode） */
  private createRoadMaterial(northSouth: Road, eastWest: Road): THREE.MeshStandardNodeMaterial {
    const nsHalf = northSouth.halfWidth;
    const ewHalf = eastWest.halfWidth;
    const spawn = this.map.world.spawn.position;

    const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.85, metalness: 0.05 });

    material.colorNode = Fn(() => {
      const x = positionWorld.x;
      const z = positionWorld.z;

      // 暗沥青底 + 廉价噪点
      const speckle = hash(positionWorld.xz.mul(2).floor().dot(vec2(269.5, 183.3))).mul(0.008);
      let paint = vec3(0.028, 0.029, 0.036).add(speckle);

      // 中线虚线（8m 节距，路口段让位斑马线）
      const dashNS = smoothstep(0.24, 0.1, abs(x))
        .mul(step(fract(z.div(8)), 0.5))
        .mul(step(ewHalf + 5, abs(z)));
      const dashEW = smoothstep(0.24, 0.1, abs(z))
        .mul(step(fract(x.div(8)), 0.5))
        .mul(step(nsHalf + 5, abs(x)));

      // 白边线（路缘内 0.5m）
      const edgeNS = smoothstep(0.24, 0.1, abs(abs(x).sub(nsHalf - 0.5))).mul(step(ewHalf, abs(z)));
      const edgeEW = smoothstep(0.24, 0.1, abs(abs(z).sub(ewHalf - 0.5))).mul(step(nsHalf, abs(x)));

      // 斑马线：四个路口进口道（条纹 1.7m 节距）
      const crossNS = step(abs(abs(z).sub(ewHalf + 2.6)), 1.4)
        .mul(step(fract(x.div(1.7)), 0.55))
        .mul(step(abs(x), nsHalf - 0.9));
      const crossEW = step(abs(abs(x).sub(nsHalf + 2.6)), 1.4)
        .mul(step(fract(z.div(1.7)), 0.55))
        .mul(step(abs(z), ewHalf - 0.9));

      const white = vec3(0.5, 0.5, 0.52);
      const markings = dashNS.max(dashEW).max(edgeNS).max(edgeEW).max(crossNS).max(crossEW);
      paint = mix(paint, white, markings.clamp(0, 1).mul(0.85));

      return paint;
    })();

    this.neonBase = Fn(() => {
      const x = positionWorld.x;
      const z = positionWorld.z;

      const cyan = vec3(0.06, 0.5, 0.44); // ROAD_NEON.northSouth 线性近似
      const magenta = vec3(0.62, 0.02, 0.14); // ROAD_NEON.eastWest 线性近似

      // 霓虹路缘光（贴路缘 0.18m 细线，路口段断开）
      const curbNS = smoothstep(0.16, 0.04, abs(abs(x).sub(nsHalf - 0.12))).mul(step(ewHalf, abs(z)));
      const curbEW = smoothstep(0.16, 0.04, abs(abs(z).sub(ewHalf - 0.12))).mul(step(nsHalf, abs(x)));

      // 出生点标记：光圈（r≈2.9m）+ 朝北箭标（heading 0 = -Z，SRD §12.7.5 对齐证明）
      const dx = x.sub(spawn.x);
      const dz = z.sub(spawn.z);
      const radius = vec2(dx, dz).length();
      const ring = smoothstep(0.3, 0.1, abs(radius.sub(2.9)));
      const chevron = step(abs(dx), 0.22).mul(step(abs(dz.add(1.9)), 0.7));

      return cyan
        .mul(curbNS)
        .add(magenta.mul(curbEW))
        .add(cyan.mul(ring.max(chevron)).mul(1.6));
    })() as unknown as Vec3Node;
    material.emissiveNode = this.neonBase;

    this.surfaceMaterial = material;
    return material;
  }

  /**
   * [CC-L2-a+ V2] 路面湿反射层（AL2-a §6-1「湿反射进主体前景」）：机器人站位 (0,0)
   * 与斑马线带都在本路面上（y=0.1），此前湿反射只在 Grid 广场（帧内右缘）——路面
   * 三档接入后，首幕主体脚下/斑马线区可见倒影（机器人品红 rim、路缘霓虹、楼窗随源入水）。
   *   Q0 共享 Grid 的实时 reflector（同一镜像渲染零二次开销；反射平面 y=0.02 与路面
   *      高差 8cm，20m 斜距观感可忽略）；反射项峰值系数 0.72+0.1=0.82<1——bloom
   *      threshold=1 纪律不动（Grid 同款 0.98 更严一档，斑马线白条在湿区不炸白）
   *   Q1 假反射 sheen（citySheenColor 单源，与 Grid 观感衔接）
   *   Q2 干燥哑光（emissive 只留霓虹基底）
   * 掩码 = cityPuddleMask 单源（含首幕前景英雄湿区，Grid/Roads 跨网格图案无缝）。
   * 幂等、事件级调用；city/index.ts 保证 Grid 先切档（Q0 时 reflection 已就绪）。
   */
  applyWetQuality(level: QualityLevel, reflection: Grid['reflectionNode']): void {
    if (level === this.currentWetLevel) return;
    this.currentWetLevel = level;

    const material = this.surfaceMaterial;

    if (level === 0 && reflection) {
      const puddle = cityPuddleMask();
      const wet = reflection.rgb.mul(puddle.mul(0.72).add(0.1));
      material.emissiveNode = this.neonBase.add(wet);
      // 湿区更光滑：主光在积水路面拉出高光条（干区维持沥青 0.82）
      material.roughnessNode = mix(float(0.82), float(0.24), puddle);
    } else if (level === 1) {
      const puddle = cityPuddleMask();
      material.emissiveNode = this.neonBase.add(citySheenColor().mul(puddle).mul(0.18));
      material.roughnessNode = mix(float(0.85), float(0.4), puddle);
    } else {
      material.emissiveNode = this.neonBase;
      material.roughnessNode = float(0.85);
    }

    material.needsUpdate = true;
  }

  /** 城市地面碰撞体：可驾驶范围铺满（World 灰盒地面只有 ±150m，道路 range 到 ±260m） */
  private setCityFloorPhysical(): void {
    this.cityFloor = this.game.objects.add(null, {
      type: 'fixed',
      position: { x: 0, y: -0.5, z: 0 },
      friction: 0.8,
      restitution: 0.1,
      category: 'floor',
      colliders: [{ shape: 'cuboid', parameters: [340, 0.5, 340] }],
    });
  }

  /** 道路尽头全息路障：视觉（加色扫描条纹）+ fixed cuboid 碰撞体（Objects 约定注册） */
  private setBarriers(northSouth: Road, eastWest: Road): void {
    const barrierHeight = 2.6;

    const addBarrier = (road: Road, along: number) => {
      const isNS = road.axis === 'north-south';
      const width = road.halfWidth * 2;
      const material = createHologramBarrierMaterial(
        isNS ? ROAD_NEON.northSouth : ROAD_NEON.eastWest,
      );
      // 注意：Objects 对 fixed 体会以刚体位姿覆盖视觉位姿，旋转须烘进几何尺寸而非 mesh.rotation
      const geometry = isNS
        ? new THREE.BoxGeometry(width, barrierHeight, 0.4)
        : new THREE.BoxGeometry(0.4, barrierHeight, width);
      const mesh = new THREE.Mesh(geometry, material);

      const position = isNS
        ? { x: 0, y: barrierHeight / 2, z: along }
        : { x: along, y: barrierHeight / 2, z: 0 };
      const halfExtents: [number, number, number] = isNS
        ? [width / 2, barrierHeight / 2, 0.2]
        : [0.2, barrierHeight / 2, width / 2];

      const object = this.game.objects.add(
        { model: mesh, castShadow: false, receiveShadow: false },
        {
          type: 'fixed',
          position,
          friction: 0.2,
          restitution: 0.4,
          category: 'object',
          colliders: [{ shape: 'cuboid', parameters: halfExtents }],
        },
      );
      this.barriers.push(object);
    };

    addBarrier(northSouth, northSouth.range[0]);
    addBarrier(northSouth, northSouth.range[1]);
    addBarrier(eastWest, eastWest.range[0]);
    addBarrier(eastWest, eastWest.range[1]);
  }
}
