// CC-E3：剪影层（S 档，SRD §12.7.6）——零网络请求的城市密度来源：
//   ① 预留槽位 13–20（JSON reservedSlots）：外环「熄灯窗格」剪影 + fixed 碰撞体
//      （槽位在可驾驶平原内，防车穿楼），激活后由 CityBlocks/ThemeTowers 接管；
//   ② 天际线填充：外环带（半径 296–436m）确定性随机体块，纯视觉无物理
//      （[CC-L2-B4] 密度 48→84 + 高度方差三档 + 模 4 交错写入）。
// 全层 1 个 InstancedMesh = 1 次 draw call（单位盒逐实例缩放；窗格取世界坐标栅格，
// 见 NeonFacade.createSilhouetteMaterial 注释）。确定性种子：刷新/跨端摆位不跳变。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { QualityLevel } from '../core/Quality';
import type { CyberCityMap } from './CityMap';
import { createSeededRandom, hashStringToSeed } from './CityMap';
import { createSilhouetteMaterial } from './NeonFacade';

/** 天际线填充块数量（CC-E4：低配档按 Quality 减档，见 applyQuality；
 *  [CC-L2-B4] 48 → 84：剪影密度上调，主机位远景楼间黑缝收窄） */
const SKYLINE_FILLER_COUNT = 84;

/** 填充带（米）：道路 range(±260) 与雾衰减(900) 之间（[CC-L2-B4] 带宽 120→140，
 *  地标档压外带——雾里巨塔分层，见 addTierVariance 注释） */
const FILLER_RADIUS_MIN = 296;
const FILLER_RADIUS_MAX = 436;

/** 道路走廊避让半宽（米）：两主轴视线走廊内不摆填充块，保住轴线尽头天际光 */
const ROAD_CORRIDOR_CLEARANCE = 42;

/** [CC-L2-B4] 地标档（132m+）加宽避让：超高剪影更容易探进画框顶部，走廊放宽
 *  防止密度上调吃掉北向天空开口（AL2-a-plus §5 裁决第 2 条的护栏） */
const LANDMARK_CORRIDOR_CLEARANCE = 58;

/** [CC-L2-B4] 北向视锥避让（主机位帧控归因的护栏本体）：固定主机位视线朝北压
 *  中轴大道，透视收敛让 z<-120 的「走廊旁」填充楼在帧内恰好落进路廊尽头的天空
 *  开口——平行走廊避让管不住透视。北侧带按锥形放宽：|x| 下限随 -z 线性外扩
 *  （z=-300 → 78m，z=-436 → 105m），南/东/西三臂维持平行避让（驾驶视角是
 *  动态掠过，不承担固定构图）。 */
function northViewConeClearance(z: number, baseClearance: number): number {
  if (z >= -120) return baseClearance;
  return baseClearance + (-z - 120) * 0.2;
}

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

    // ② 天际线填充：均匀布圈 + 抖动，避开道路走廊；纯视觉（雾中远景）。
    // [CC-L2-B4] 高度方差三档（确定性种子换代 cc-l2-b4）：
    //   基底 28-96m（原 30-115 收顶，让出对比空间）≈68%
    //   中挑 96-134m ≈22%（天际线第二排肩线）
    //   地标 132-196m ≈10%（窄足迹塔楼压外带 + 加宽走廊避让——雾中巨塔剪影
    //   给远景「城市在长高」的纵深锚，不侵入北向天空开口）
    // 写入顺序 = 模 4 交错（i≡0 → i≡2 → i≡1 → i≡3）：applyQuality 收缩 mesh.count
    // 裁「缓冲区尾段」时，Q1(1/2)/Q2(1/4) 保留的都是全环均匀子集——原顺序写入
    // 会把低配档裁成半圈天际线缺口（连带修复的既有瑕疵，非本批新逻辑）。
    const random = createSeededRandom(hashStringToSeed('cc-l2-b4-skyline-filler'));
    const writeOrder: number[] = [];
    for (const residue of [0, 2, 1, 3]) {
      for (let i = residue; i < SKYLINE_FILLER_COUNT; i += 4) writeOrder.push(i);
    }
    for (const i of writeOrder) {
      // 档位与体量（先掷档位，确定走廊避让宽度与半径带偏置）
      const tier = random();
      let w = 18 + random() * 42;
      let d = 18 + random() * 42;
      let h = 28 + random() * 68;
      let clearance = ROAD_CORRIDOR_CLEARANCE;
      let radiusBias = 0;
      if (tier > 0.9) {
        w = 16 + random() * 16;
        d = 16 + random() * 16;
        h = 132 + random() * 64;
        clearance = LANDMARK_CORRIDOR_CLEARANCE;
        radiusBias = 0.4; // 地标压外带 40%+：近带天空开口不吃，雾衰减给层次
      } else if (tier > 0.68) {
        h = 96 + random() * 38;
      }

      let x = 0;
      let z = 0;
      // 重掷至走廊/视锥之外（确定性序列）：北向锥半宽（半径 436 处 ≈14°）可能
      // 整体罩住某些实例的基角槽位，故逐次加大角度游走（attempt×0.6 槽 ≈ 最多
      // 偏移 17°）让其走出锥体；仍未逃出则末尾钳位到锥缘（沿走廊开口收边，
      // 不允许任何填充楼滞留天空开口内）。
      for (let attempt = 0; attempt < 8; attempt++) {
        const angle =
          ((i + random() * 0.9 + attempt * 0.6) / SKYLINE_FILLER_COUNT) * Math.PI * 2;
        const radius =
          FILLER_RADIUS_MIN +
          (radiusBias + (1 - radiusBias) * random()) * (FILLER_RADIUS_MAX - FILLER_RADIUS_MIN);
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        if (Math.abs(x) > northViewConeClearance(z, clearance) && Math.abs(z) > clearance) break;
      }
      const minX = northViewConeClearance(z, clearance);
      if (Math.abs(x) < minX) x = (x < 0 ? -1 : 1) * (minX + random() * 8);
      if (Math.abs(z) < clearance) z = (z < 0 ? -1 : 1) * (clearance + random() * 8);

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
