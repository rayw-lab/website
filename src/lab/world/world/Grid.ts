// 移植改造自 folio-2025 sources/Game/World/Grid.js（101 行，MIT，commit 41046b5）。
// folio 的 Grid 是出生点 unlit 网格舞台（MeshGridMaterial 直出 + MeshDefaultMaterial
// 包裹补光照 + reveal discard）；本站城市态要吃光照/阴影/距离雾，故走等效路线：
// MeshStandardNodeMaterial 为壳，网格线用 rendering/MeshGridMaterial.ts 的
// toAntialiasedGrid（folio 同源 TSL 函数）组进 emissiveNode——「城市地面升级」形态
// （CC-E4 文件域备选：world/Grid.ts 或 city 地面升级，此处两者合一）。
// 湿地面反射三档（实施方案 §5.3「湿地面反射」行）：
//   Quality 0  实时平面反射：TSL reflector（three 0.185 r185 webgpu_reflection 例
//              同款管线；resolutionScale 0.35 + bounces:false = 每帧一次低清镜像渲染）
//   Quality 1  假反射：价噪声水洼 × 青/品红城市光晕 sheen（零二次渲染）
//   Quality 2  关（哑光地面，网格线保留但无反射项）
// 切档 = 重建 emissive/roughness 节点图 + needsUpdate（事件级，非逐帧；reflector
// 节点不在图中时 updateBefore 不触发，Q1/Q2 零镜像渲染开销）。
import * as THREE from 'three/webgpu';
import { Fn, float, hash, mix, positionWorld, reflector, smoothstep, vec2, vec3 } from 'three/tsl';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';
import { toAntialiasedGrid, type FloatNode, type Vec2Node } from '../rendering/MeshGridMaterial';

/** 2D 价噪声（hash 双线性插值）：水洼掩码用，~10 指令零贴图 */
function valueNoise(p: Vec2Node): FloatNode {
  const i = p.floor();
  const f = p.fract();
  const u = f.mul(f).mul(f.mul(-2).add(3)); // smoothstep 权重

  const hashAt = (offsetX: number, offsetY: number) =>
    hash(i.add(vec2(offsetX, offsetY)).dot(vec2(127.1, 311.7)));

  return mix(
    mix(hashAt(0, 0), hashAt(1, 0), u.x),
    mix(hashAt(0, 1), hashAt(1, 1), u.x),
    u.y,
  ) as FloatNode;
}

export interface GridOptions {
  /** 地面边长（米），默认 680 对齐城市地坪/可驾驶范围 */
  size?: number;
  /** 地面高度（米），默认 0.02 顶替 Roads plaza 的高度层（路面 0.1 在其上） */
  y?: number;
}

/**
 * 城市霓虹网格地面（挂载后接管 Roads.plaza 的地表职责，见 city/index.ts 接线）。
 * 线层配色沿用城市双主轴霓虹色族：8m 青色细格（街区肌理）+ 40m 紫色粗格（城市尺度），
 * 强度压在 bloom 阈值下——网格是底纹不是光源，bloom 高光留给楼宇窗格与招牌。
 */
export class Grid {
  private readonly game: Game;
  private readonly y: number;

  mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardNodeMaterial;
  private reflection: ReturnType<typeof reflector> | null = null;
  private currentLevel: QualityLevel | null = null;

  constructor(game: Game, options: GridOptions = {}) {
    this.game = game;
    const size = options.size ?? 680;
    this.y = options.y ?? 0.02;

    this.material = new THREE.MeshStandardNodeMaterial({ roughness: 0.9, metalness: 0.08 });

    // 基色（品质无关）：近黑沥青地坪 + 廉价噪点（速度感参照物）
    this.material.colorNode = Fn(() => {
      const speckle = hash(positionWorld.xz.mul(2).floor().dot(vec2(269.5, 183.3))).mul(0.007);
      return vec3(0.017, 0.018, 0.026).add(speckle);
    })();

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), this.material);
    this.mesh.name = 'city-grid-ground';
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.position.y = this.y;
    this.mesh.receiveShadow = true;
    this.game.scene.add(this.mesh);

    this.applyQuality(this.game.quality.level);
  }

  /** 网格线 emissive（各档共用）：8m 青细格 + 40m 紫粗格，抗锯齿（folio 同源函数） */
  private gridEmissive() {
    const groundUv = positionWorld.xz;
    const one = float(1);

    // 细格：青（#49c5b6 线性近似），交点处断开成十字段（cross 0.25，folio Grid 层同款手法）
    const fine = toAntialiasedGrid(
      groundUv,
      float(8) as FloatNode,
      float(0.014) as FloatNode,
      vec2(0.5, 0.5),
      float(0.25) as FloatNode,
      one as FloatNode,
    );

    // 粗格：紫（#8d55ff 线性近似），整线贯通，城市尺度参照
    const coarse = toAntialiasedGrid(
      groundUv,
      float(40) as FloatNode,
      float(0.004) as FloatNode,
      vec2(0.5, 0.5),
      one as FloatNode,
      one as FloatNode,
    );

    // [CC-L2 A9] 棋盘格弱化（rubric §6 A9「广场棋盘格弱化」）：线强 0.55/0.8 → 0.3/0.45
    // ——地面读作湿沥青 + 水洼倒影而非发光棋盘，网格降为底纹参照（bloom 高光让给反射）
    return vec3(0.05, 0.42, 0.36)
      .mul(fine)
      .mul(0.3)
      .add(vec3(0.27, 0.1, 0.62).mul(coarse).mul(0.45));
  }

  /** 水洼掩码：低频价噪声，0 = 干燥 1 = 积水（Q0 反射强度 / Q1 sheen / 湿区粗糙度共用）。
   *  [CC-L2 A9] 占比上调：阈值 0.42/0.78 → 0.3/0.64——积水覆盖率 ~18% → ~38%，
   *  首幕主机位（俯角 15° 低斜视，反射入画角有利）帧内可见湿反射（V2 帧优先口径） */
  private puddleMask() {
    const noise = valueNoise(positionWorld.xz.div(19).add(vec2(3.7, 8.1)) as Vec2Node);
    return smoothstep(0.3, 0.64, noise);
  }

  /**
   * 按品质档重建反射/粗糙度节点图（幂等；事件级调用）。
   * reflector 节点懒建、跨档保留——回到 Q0 零重建成本，离开 Q0 后不在节点图中，
   * 其镜像渲染（updateBefore）自然停跑。
   */
  applyQuality(level: QualityLevel): void {
    if (level === this.currentLevel) return;
    this.currentLevel = level;

    const grid = this.gridEmissive();

    if (level === 0) {
      // 实时平面反射：低清镜像 + 水洼加权（湿沥青的模糊倒影感来自低分辨率本身）。
      // [CC-L2 A9] 强度上调 0.55/0.14 → 0.8/0.18：反射项峰值系数 0.98 仍 <1——
      // bloom threshold=1 纪律不动，倒影只在光源本身超阈处随源辉光（Orion 水洼观感）
      if (!this.reflection) {
        this.reflection = reflector({ resolutionScale: 0.35, bounces: false });
        this.reflection.target.rotateX(-Math.PI * 0.5);
        this.reflection.target.position.y = this.y;
        this.game.scene.add(this.reflection.target);
      }
      const puddle = this.puddleMask();
      const wet = this.reflection.rgb.mul(puddle.mul(0.8).add(0.18));
      this.material.emissiveNode = grid.add(wet);
      // 湿区更光滑：主光在积水里拉出高光条（[CC-L2 A9] 0.28 → 0.22 略增镜面感）
      this.material.roughnessNode = mix(float(0.85), float(0.22), puddle);
    } else if (level === 1) {
      // 假反射：城市光晕 sheen 落在水洼里（青/品红按噪声混色，§5.3「emissive 翻转」的等效近似）
      // [CC-L2 A9] 同步上调：sheen 0.12 → 0.2、湿区粗糙度 0.45 → 0.38（与 Q0 观感衔接）
      const puddle = this.puddleMask();
      const sheenColor = mix(
        vec3(0.06, 0.5, 0.44),
        vec3(0.62, 0.02, 0.14),
        valueNoise(positionWorld.xz.div(47) as Vec2Node),
      );
      this.material.emissiveNode = grid.add(sheenColor.mul(puddle).mul(0.2));
      this.material.roughnessNode = mix(float(0.88), float(0.38), puddle);
    } else {
      // 止损档：哑光地面，仅保留网格底纹
      this.material.emissiveNode = grid;
      this.material.roughnessNode = float(0.9);
    }

    this.material.needsUpdate = true;
  }

  /** 释放反射渲染目标（Game.dispose 的场景遍历只管几何/材质，reflector RT 在此收口） */
  dispose(): void {
    if (this.reflection) {
      this.game.scene.remove(this.reflection.target);
      this.reflection.dispose();
      this.reflection = null;
    }
  }
}
