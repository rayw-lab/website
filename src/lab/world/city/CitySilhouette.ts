// CC-E3：剪影层（S 档，SRD §12.7.6）——零网络请求的城市密度来源：
//   ① 预留槽位 13–20（JSON reservedSlots）：外环「熄灯窗格」剪影 + fixed 碰撞体
//      （槽位在可驾驶平原内，防车穿楼），激活后由 CityBlocks/ThemeTowers 接管；
//   ② 天际线填充：外环带（半径 300–420m）确定性随机体块，纯视觉无物理。
// 全层 1 个 InstancedMesh = 1 次 draw call（单位盒逐实例缩放；窗格取世界坐标栅格，
// 见 NeonFacade.createSilhouetteMaterial 注释）。确定性种子：刷新/跨端摆位不跳变。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { QualityLevel } from '../core/Quality';
import type { CyberCityMap } from './CityMap';
import { createSeededRandom, hashStringToSeed } from './CityMap';
import { createSilhouetteMaterial } from './NeonFacade';

/** 天际线填充块数量（CC-E4：低配档按 Quality 减档，见 applyQuality） */
const SKYLINE_FILLER_COUNT = 48;

/** 填充带（米）：道路 range(±260) 与雾衰减(900) 之间 */
const FILLER_RADIUS_MIN = 300;
const FILLER_RADIUS_MAX = 420;

/** 道路走廊避让半宽（米）：两主轴视线走廊内不摆填充块，保住轴线尽头天际光 */
const ROAD_CORRIDOR_CLEARANCE = 42;

export class CitySilhouette {
  private readonly game: Game;

  /** 剪影实例网格（槽位 + 填充共用） */
  mesh!: THREE.InstancedMesh;
  /** 预留槽位碰撞体（物理-only，与实例一一对应） */
  slotColliders: WorldObject[] = [];
  /** 实例总数（槽位数 + 填充数） */
  instanceCount = 0;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    const slots = map.reservedSlots;
    this.instanceCount = slots.length + SKYLINE_FILLER_COUNT;

    this.mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      createSilhouetteMaterial(),
      this.instanceCount,
    );
    this.mesh.name = 'city-silhouette';
    // 单 draw call、实例散布全外环：整体包围盒剔除收益为负，直接常绘
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    let index = 0;

    // ① 预留槽位：尺寸由槽位 id 确定性生成（激活升楼时以 JSON footprint 为准）
    for (const slot of slots) {
      const random = createSeededRandom(hashStringToSeed(slot.id));
      const w = 24 + random() * 20;
      const d = 24 + random() * 20;
      const h = 40 + random() * 48;

      position.set(slot.position.x, h / 2, slot.position.z);
      scale.set(w, h, d);
      matrix.compose(position, quaternion, scale);
      this.mesh.setMatrixAt(index++, matrix);

      // 槽位碰撞体（物理-only）：可驾驶平原内的静态障碍
      this.slotColliders.push(
        this.game.objects.add(null, {
          type: 'fixed',
          position: { x: slot.position.x, y: h / 2, z: slot.position.z },
          friction: 0.5,
          restitution: 0.05,
          category: 'object',
          colliders: [{ shape: 'cuboid', parameters: [w / 2, h / 2, d / 2] }],
        }),
      );
    }

    // ② 天际线填充：均匀布圈 + 抖动，避开道路走廊；纯视觉（雾中远景）
    const random = createSeededRandom(hashStringToSeed('cc-e3-skyline-filler'));
    for (let i = 0; i < SKYLINE_FILLER_COUNT; i++) {
      let x = 0;
      let z = 0;
      // 重掷至走廊之外（确定性序列，均值 ~1.2 次命中）
      for (let attempt = 0; attempt < 8; attempt++) {
        const angle = ((i + random() * 0.9) / SKYLINE_FILLER_COUNT) * Math.PI * 2;
        const radius = FILLER_RADIUS_MIN + random() * (FILLER_RADIUS_MAX - FILLER_RADIUS_MIN);
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        if (Math.abs(x) > ROAD_CORRIDOR_CLEARANCE && Math.abs(z) > ROAD_CORRIDOR_CLEARANCE) break;
      }

      const w = 20 + random() * 40;
      const d = 20 + random() * 40;
      const h = 30 + random() * 85;

      position.set(x, h / 2, z);
      scale.set(w, h, d);
      matrix.compose(position, quaternion, scale);
      this.mesh.setMatrixAt(index++, matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.game.scene.add(this.mesh);
  }

  /**
   * CC-E4 品质分档（实施方案 §5.3「天际线剪影层楼数」行）：实例缓冲区槽位在前、
   * 填充在后，收缩 mesh.count 只裁填充尾段——预留槽位（带碰撞体）任何档位都可见，
   * 视觉与物理永远对齐。Quality 0 全量 / 1 填充减半 / 2 填充四分之一
   * （§5.3 原文 Q2 为「静态天空盒纹理」，其贴图资产违背默认路径零重资产纪律，
   * 以最低密度程序化剪影等效替代——零资产且更省：窗格动画在 Q2 已整体冻结）。
   */
  applyQuality(level: QualityLevel): void {
    const fillers =
      level === 0
        ? SKYLINE_FILLER_COUNT
        : level === 1
          ? SKYLINE_FILLER_COUNT / 2
          : SKYLINE_FILLER_COUNT / 4;
    this.mesh.count = this.instanceCount - SKYLINE_FILLER_COUNT + fillers;
  }
}
