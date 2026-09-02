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
import { createSeededRandom, hashStringToSeed } from './CityMap';
import type { FacadeKit, FacadeKitPieceName, PieceTransform } from './FacadeKit';

const BOLLARD_RADIUS = 0.22;
const BOLLARD_HEIGHT = 1.15;

/**
 * [CC-VIS-X2] 街角道具带簇位（BR X2「垃圾箱/配电箱/自动售货亭 3-5 件同批」）：
 * 路口四角 plaza 各一簇（隔离墩 ±13.6/±17.2 外侧对角带，北二簇入首幕近中景）+
 * 主干道沿街二簇（work-gallery 北面 / edge-cloud-hub 南面——NDC 清单在册的驾驶
 * 动线临街段）。全部让空泊车圈（最近 voice-pod bay (12,28) r6 距 11.3m）、斑马线
 * 出口带与灯杆邻域；face = 簇朝向（售货亭正面朝路/路口）。
 *
 * [CC-VIS-X2-PLUG] 东北簇 (19.5,−19.5) → (17.8,−17.8)（沿自身对角线内退 2.4m）：
 * 原位 PropBin 展开位 (20.8,−20.8) 恰落 EXP-01 出泊倒退线 (28,−28)→(24.5,−24.5)
 * 的延长对角线上，距左转弧仅 ~2m ＜「车半宽 ~1m + 转向余量 1.5m」纪律，且位于
 * trace 实测出泊漂移环带（x≈19–22）内（X2 卡死点 x=19.4 与簇线同列——T9 §1.1
 * 证据 B 叠加因素）。内退后最近件 PropBin (19.07,−19.07) 距倒退线终点 7.6m、
 * 距走廊带 z∈[−24,−28] ≥3.9m；仍在隔离墩对角带外侧（17.8 > 17.2），墩位零改动；
 * 协同增益：内退同时把「X1 充电桩排东面 17.8 ↔ 裙房西沿 29.1」南下车道
 * （triage r1 839b6fe 改线）西缘净距从 ~3.3m 拓到 ~5.0m。
 * 余量定量核对：tools/camera/audit-x2-visibility.mjs §④。
 */
const PROP_CLUSTERS: { x: number; z: number; face: number }[] = [
  { x: 17.8, z: -17.8, face: (-3 * Math.PI) / 4 },
  { x: -19.5, z: -19.5, face: (3 * Math.PI) / 4 },
  { x: 19.5, z: 19.5, face: -Math.PI / 4 },
  { x: -19.5, z: 19.5, face: Math.PI / 4 },
  { x: 124, z: 25, face: Math.PI },
  { x: -124, z: -25, face: 0 },
];

/** 道具碰撞半长宽高（本地系，y=半高；生成脚本 bbox 印证——README §碰撞） */
const PROP_HALF: Record<'PropVending' | 'PropCabinet' | 'PropBin', [number, number, number]> = {
  PropVending: [0.65, 1.14, 0.48],
  PropCabinet: [0.8, 0.85, 0.4],
  PropBin: [0.85, 0.53, 0.4],
};

/**
 * [CC-FXN-C2] 撞击判定（Rapier CONTACT_FORCE_EVENTS，Physics.getPhysical 既有接缝）：
 * 阈值 = 原始接触力 ≥15（Physics 缺省，folio 碰撞音效同门槛——蹭墙/怠速贴靠不触发）；
 * 冷却 0.6s（真实秒，ticker.elapsed 时基）合并同一次冲撞的连续接触帧，
 * 保证「一次撞击 = 一次计数 = 一次 HUD 脉冲」（CITY-03：一次性事件驱动，非循环）。
 */
const HIT_COOLDOWN = 0.6;

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
  /**
   * [CC-FXN-C2] 隔离墩累计撞击数（城市档「撞道具」的碰撞真值——fixed 刚体不位移，
   * knockedConeCount 位移判据天然为 0，这里以接触力事件承接）。消费方 =
   * index.ts HUD 节拍沿检测：并入 cone-hit 埋点 total 与 HUD 脉冲；单调递增不随 R 复位。
   */
  hitCount = 0;

  private readonly game: Game;
  private lastHitAt = -Infinity;

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

  /**
   * [CC-VIS-X2] 街角道具带：套件 ready 后按 PROP_CLUSTERS 摆售货亭/配电箱/垃圾箱
   * 三件套（每类 1 InstancedMesh = 3 draw call），碰撞体合 1 个 fixed 刚体经
   * kit.registerBody 登记（Q2 与视觉同步 disable，防隐形墙）。零事件零循环动画
   * （隔离墩 hitCount 语义不动；道具为纯静态障碍，OBS 白名单零改动）。
   */
  placeCornerProps(kit: FacadeKit): void {
    void kit.ready.then((pieces) => {
      if (!pieces) return;

      const random = createSeededRandom(hashStringToSeed('x2-street-props'));
      const byPiece = new Map<FacadeKitPieceName, PieceTransform[]>();
      const colliders: {
        shape: 'cuboid';
        parameters: [number, number, number];
        position: { x: number; y: number; z: number };
        quaternion: { x: number; y: number; z: number; w: number };
      }[] = [];

      for (const cluster of PROP_CLUSTERS) {
        // 簇内一字排开：售货亭居中、配电箱/垃圾箱分列两侧（沿墙向 = 朝向的右向）
        const rx = Math.cos(cluster.face);
        const rz = -Math.sin(cluster.face);
        const line: [FacadeKitPieceName, number][] = [
          ['PropVending', 0],
          ['PropCabinet', 1.9],
          ['PropBin', -1.8],
        ];
        for (const [name, along] of line) {
          const rotY = cluster.face + (random() - 0.5) * 0.5;
          const x = cluster.x + rx * along;
          const z = cluster.z + rz * along;
          let list = byPiece.get(name);
          if (!list) byPiece.set(name, (list = []));
          list.push({ x, y: 0, z, rotY });

          const half = PROP_HALF[name as keyof typeof PROP_HALF];
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0));
          colliders.push({
            shape: 'cuboid',
            parameters: half,
            position: { x, y: half[1], z },
            quaternion: { x: q.x, y: q.y, z: q.z, w: q.w },
          });
        }
      }

      for (const [name, transforms] of byPiece) kit.addInstances(pieces, name, transforms);

      const body = this.game.objects.add(null, {
        type: 'fixed',
        position: { x: 0, y: 0, z: 0 },
        friction: 0.5,
        restitution: 0.1,
        category: 'object',
        colliders,
      });
      kit.registerBody(body);
    });
  }

  /** 8 个 cylinder 碰撞体合一个 fixed 刚体（Rapier cylinder(halfHeight, radius)） */
  private setPhysical(): void {
    this.bollardBody = this.game.objects.add(null, {
      type: 'fixed',
      position: { x: 0, y: 0, z: 0 },
      friction: 0.4,
      restitution: 0.35,
      category: 'object',
      // [CC-FXN-C2] 接触力事件（阈值取 Physics 缺省 15）：城市档唯一动态体 =
      // 玩家车，回调即「车撞隔离墩」；冷却合并连续接触帧后计数。消费走
      // index.ts HUD 节拍沿检测（OBS-C1 cone-hit 同模式），不新增总线事件
      contactThreshold: 15,
      onCollision: () => {
        const now = this.game.ticker.elapsed;
        if (now - this.lastHitAt < HIT_COOLDOWN) return;
        this.lastHitAt = now;
        this.hitCount += 1;
      },
      colliders: this.spots.map((spot) => ({
        shape: 'cylinder' as const,
        parameters: [BOLLARD_HEIGHT / 2, BOLLARD_RADIUS],
        position: { x: spot.x, y: BOLLARD_HEIGHT / 2, z: spot.z },
      })),
    });
  }
}
