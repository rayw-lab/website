// 灰盒场景（自写，非移植——source-teardown §9.2：World/Areas 内容类不抄）。
// 结构对照 folio World/World.js 的两段式：
//   step(0)：纯视觉底座（网格地面 + 灯光）——RAPIER 未就绪也能出画面，
//            加载期渲染循环已跑（Game 启动坑②）；
//   step(1)：物理内容（地面碰撞体 + 16 个动态锥桶）——必须晚于 Physics/Objects
//            构造（Game 启动坑③）。
// 地面网格 = MeshGridMaterial 简化版（TSL 程序化，零贴图资产）+ 程序化环形试车道；
// 锥桶 = cone primitive（不建模），掉落沉降即是物理循环在跑的可见证据；
// 阵位继承 spike scene.ts 三组布局（CC-E2 合流：慢弯桩 + 环道 slalom + 出弯门），
// 按 10m 环缩尺重排，动力学从 spike 手写球碰撞换成 Rapier 动态体（碰撞即物理真值）。
import * as THREE from 'three/webgpu';
import { Fn, fwidth, mix, positionGeometry, positionWorld, smoothstep, vec3 } from 'three/tsl';
import cityMapData from '../../../data/cyber-city-buildings.json';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';

/** 环形试车道布局常量（World 摆锥桶参照它；出生点另有单一事实源，见 SPAWN） */
export const RING = { radius: 10, halfWidth: 2.5 };

/** 出生点单一事实源（审计 M3）：城市地图 world.spawn——十字路口正中 (0,0)、heading 0 */
const CITY_SPAWN = (
  cityMapData as {
    world: { spawn: { position: { x: number; z: number }; heading: number } };
  }
).world.spawn;

/**
 * 出生点（M3 合流后 = cyber-city-buildings.json 的 world.spawn，机器人站位 /
 * 变形落点 / 城市出生光圈三者同锚；灰盒环形道恰以此为圆心，出发直行即上道）。
 * heading（度；0=北(-Z)，顺时针）→ folio 底盘 rotationY（前向 = (cos r, 0, -sin r)）：
 * 世界前向 (sin h, 0, -cos h) ≡ (cos r, 0, -sin r) ⇒ r = π/2 − h·π/180；
 * h=0 → r=π/2，车头朝 -Z（北）。
 */
export const SPAWN = {
  position: { x: CITY_SPAWN.position.x, y: 0, z: CITY_SPAWN.position.z },
  rotation: Math.PI / 2 - CITY_SPAWN.heading * (Math.PI / 180),
};

export class World {
  private readonly game: Game;

  /** 掉出世界判定高度（folio 语义 water.depthElevation；Objects 每帧读它） */
  readonly killElevation = -8;

  /** 环形试车道（respawn/锥桶摆位都参照它） */
  readonly ring = RING;

  ground!: THREE.Mesh;
  cones: WorldObject[] = [];

  /** [Tier-C T-4] 变形落地拍灯光引用（巡航态色温微移消费；setLights 装配） */
  private hemisphereLight!: THREE.HemisphereLight;
  private directionalLight!: THREE.DirectionalLight;
  private readonly reducedMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(game: Game) {
    this.game = game;

    this.step(0);
    // [Tier-C T-4] 变形落地拍 → 全城色温 +3% 暖移（巡航态；一次性 ~1s easeOutCubic，
    // 完成即自毁 tick 监听——稳态循环动画配额占用 0；reduced-motion 直出落位）
    this.game.events.on('world-transform', () => {
      this.applyCruiseWarmShift();
    });
  }

  step(step: 0 | 1): void {
    if (step === 0) {
      this.setLights();
      this.setGround();
    } else {
      this.setGroundPhysical();
      // [CC-L1 A2] 锥桶撤出城市首幕（rubric V4/V7「驾校」出戏扣分）：spike 试车
      // 锥桶只在灰盒档出场（/world-spike/ 锥桶 e2e 闭环被测面不动）；城市取景档
      //（ritual/city/poi/robot）道具层由 city/StreetProps.ts 霓虹隔离墩承接，
      // knockedConeCount 自然为 0（CITY 用例经核对零锥桶依赖）。
      if (this.game.cameraFraming === 'greybox') this.setCones();
    }
  }

  private setLights(): void {
    this.game.scene.background = new THREE.Color('#0d0c11');

    this.hemisphereLight = new THREE.HemisphereLight('#4a4f6d', '#17151c', 1.1);
    this.game.scene.add(this.hemisphereLight);

    this.directionalLight = new THREE.DirectionalLight('#fff4e0', 2.2);
    this.directionalLight.position.set(18, 28, 12);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.shadow.camera.left = -30;
    this.directionalLight.shadow.camera.right = 30;
    this.directionalLight.shadow.camera.top = 30;
    this.directionalLight.shadow.camera.bottom = -30;
    this.directionalLight.shadow.camera.far = 80;
    this.directionalLight.shadow.bias = -0.002;
    this.game.scene.add(this.directionalLight);
  }

  /**
   * [Tier-C T-4] 巡航态色温微移：变形落地拍全城灯光 +3% 暖移
   * （主光 #fff4e0 → #fff0d6、天光 #4a4f6d → #4f4d6d），一次性 ~1.0s easeOutCubic，
   * 完成即自毁 tick 监听——稳态循环动画配额占用 0（CITY-03 口径）；
   * reduced-motion / Q2 直出落位不进插值。
   */
  private applyCruiseWarmShift(): void {
    if (!this.hemisphereLight || !this.directionalLight) return;
    const targetDir = new THREE.Color('#fff0d6');
    const targetHemi = new THREE.Color('#4f4d6d');
    const baseDir = this.directionalLight.color.clone();
    const baseHemi = this.hemisphereLight.color.clone();

    if (this.reducedMotion || this.game.quality.level === 2) {
      this.directionalLight.color.copy(targetDir);
      this.hemisphereLight.color.copy(targetHemi);
      return;
    }

    let elapsed = 0;
    const DURATION = 1.0;
    const onTick = () => {
      elapsed += this.game.ticker.delta;
      const progress = Math.min(elapsed / DURATION, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.directionalLight.color.lerpColors(baseDir, targetDir, ease);
      this.hemisphereLight.color.lerpColors(baseHemi, targetHemi, ease);
      if (progress >= 1) this.game.ticker.events.off('tick', onTick);
    };
    this.game.ticker.events.on('tick', onTick);
  }

  private setGround(): void {
    // fwidth 抗锯齿网格线（MeshGridMaterial 双层线简化版：2m 细线 + 10m 粗线）
    const gridLine = (cellSize: number, thickness: number) => {
      const coord = positionWorld.xz.div(cellSize);
      const distanceToLine = coord.fract().sub(0.5).abs().oneMinus().sub(0.5).abs();
      const aa = fwidth(coord);
      const lineVec = distanceToLine.sub(thickness).div(aa).clamp(0, 1);
      return lineVec.x.min(lineVec.y).oneMinus();
    };

    const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.95, metalness: 0 });
    material.colorNode = Fn(() => {
      const base = vec3(0.075, 0.07, 0.09); // 0x1b191f 系灰紫底
      const fine = vec3(0.19, 0.14, 0.33).mul(gridLine(2, 0.012)); // #8d55ff 系细线
      const coarse = vec3(0.32, 0.25, 0.5).mul(gridLine(10, 0.01)); // 10m 粗线

      // 环形试车道：深色路面带 + 白色边线（程序化，零资产）
      const distanceToRing = positionWorld.xz.length().sub(this.ring.radius).abs();
      const road = smoothstep(this.ring.halfWidth, this.ring.halfWidth - 0.3, distanceToRing);
      const edgeLine = smoothstep(
        0.22,
        0.08,
        distanceToRing.sub(this.ring.halfWidth - 0.35).abs(),
      );

      const gridColor = base.add(fine).add(coarse);
      const roadColor = vec3(0.045, 0.045, 0.055);
      const withRoad = mix(gridColor, roadColor, road);

      return withRoad.add(vec3(0.75).mul(edgeLine));
    })();

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), material);
    this.ground.rotation.x = -Math.PI * 0.5;
    this.ground.receiveShadow = true;
    this.game.scene.add(this.ground);
  }

  private setGroundPhysical(): void {
    // 纯物理地面（无视觉）：厚 cuboid 顶面对齐 y=0
    this.game.objects.add(null, {
      type: 'fixed',
      position: { x: 0, y: -0.5, z: 0 },
      friction: 0.8,
      restitution: 0.1,
      category: 'floor',
      colliders: [{ shape: 'cuboid', parameters: [150, 0.5, 150] }],
    });
  }

  private setCones(): void {
    // 16 个碰撞锥桶（cone primitive，不建模）：阵位继承 spike scene.ts 三组布局，
    // 按 10m 环缩尺重排——出生点 (0,0) 朝北（-Z）出发，直道桩→环道 slalom→出弯门。
    const coneRadius = 0.45;
    const coneHeight = 1.1;

    const geometry = new THREE.ConeGeometry(coneRadius, coneHeight, 24);

    const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.7, metalness: 0 });
    material.colorNode = Fn(() => {
      // 橙底 + 白色反光带（按锥体局部高度切带，零贴图）
      const orange = vec3(1.0, 0.28, 0.02);
      const white = vec3(0.92, 0.92, 0.9);
      const band = smoothstep(0.16, 0.13, positionGeometry.y.sub(0.08).abs());
      return mix(orange, white, band);
    })();

    // ① 出生直道慢弯桩 4：车头正前方沿 -Z 排到环道内沿——首脚油门即有可撞物
    //   （e2e 锥桶闭环的确定性锚点：(0,-4.5) 恰在直行路径正中）
    const homes: [number, number][] = [
      [0, -4.5],
      [-1.5, -6.8],
      [1.5, -6.8],
      [0, -9],
    ];
    // ② 环道 slalom 8：北偏东起顺时针（φ 自 -Z 向 +X 展开），内外线交错 ∓1.5m
    //   （spike 阵位 ±2.6 @ 6.5m 半宽路 → 2.5m 半宽路等比收窄）
    for (let i = 0; i < 8; i++) {
      const phi = 0.5 + i * 0.4;
      const radius = this.ring.radius + (i % 2 === 0 ? -1.5 : 1.5);
      homes.push([Math.sin(phi) * radius, -Math.cos(phi) * radius]);
    }
    // ③ 出弯双排门 4：slalom 段末尾两道门（spike φ=90° 出弯门的缩尺版）
    for (const phi of [3.8, 4.2]) {
      homes.push(
        [Math.sin(phi) * (this.ring.radius - 1.7), -Math.cos(phi) * (this.ring.radius - 1.7)],
        [Math.sin(phi) * (this.ring.radius + 1.7), -Math.cos(phi) * (this.ring.radius + 1.7)],
      );
    }

    for (const [x, z] of homes) {
      const mesh = new THREE.Mesh(geometry, material);

      const object = this.game.objects.add(
        { model: mesh, castShadow: true, receiveShadow: false },
        {
          type: 'dynamic',
          // 从半空掉落沉降：首屏即可肉眼验证物理循环在跑
          position: { x, y: coneHeight * 0.5 + 1.2, z },
          mass: 0.3,
          friction: 0.7,
          restitution: 0.25,
          category: 'object',
          colliders: [{ shape: 'cone', parameters: [coneHeight * 0.5, coneRadius] }],
        },
      );

      this.cones.push(object);
    }
  }

  /**
   * 已击倒锥桶数（HUD 计数 + __worldSpike 遥测消费；spike knockedCount 的物理真值版）。
   * 判定：相对初始位的水平位移 > 0.6m（被撞飞/推走）或倾角 > ~56°（up·ŷ < 0.55，
   * 撞倒后倒伏）。出生掉落沉降是纯竖直下落 + 直立姿态，两条都不会误报；
   * R 复位（Objects.resetAll）回初始位姿后计数自然归零。
   */
  knockedConeCount(): number {
    let knocked = 0;
    for (const cone of this.cones) {
      const physical = cone.physical;
      if (!physical || cone.reseting) continue;

      const initial = physical.initialState.position;
      const position = physical.body.translation();
      const dx = position.x - initial.x;
      const dz = position.z - initial.z;

      // 四元数旋转后的本地 +Y 在世界系的 y 分量：up.y = 1 − 2(qx² + qz²)
      const rotation = physical.body.rotation();
      const upY = 1 - 2 * (rotation.x * rotation.x + rotation.z * rotation.z);

      if (dx * dx + dz * dz > 0.36 || upY < 0.55) knocked++;
    }
    return knocked;
  }
}
