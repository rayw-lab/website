// CC-E3：城市地图 schema 的 TypeScript 固化 + 数据单源加载器。
// 结构契约 = SRD §12.7.3（zod 构建期校验归 CC-E8，本文件先做轻量运行期断言）；
// 字段字典与扩展规则全文见 docs/research/cyber-city-buildings-map.md（CC-MAP1）。
// 数据单源 = src/data/cyber-city-buildings.json：3D 楼宇、DOM 楼宇快览、noscript
// 列表、2D 降级地图、停车触发区全部由它派生，禁止第二份维护（AP-8）。
// 本模块只读不改：加一栋楼 = 改 JSON（认领 reservedSlots 槽位补齐字段），零引擎代码改动。
import rawMap from '../../../data/cyber-city-buildings.json';

/** 城区归属（五大城区，§CC-MAP1 §3）：迷你地图图例分组 / 街区色调 / HUD 分栏共用 */
export type DistrictCategory = 'language' | 'ai-core' | 'mobility' | 'gallery' | 'civic';

/** 流式档位画像（SRD §12.7.6）：hero=出生圈高清直出；standard=接近可升 H；skyline=最高只到中模 */
export type LodProfile = 'hero' | 'standard' | 'skyline';

/** 道路条目：两条主轴（中轴大道南北 × 霓虹大街东西），halfWidth/range 生成路面与围栏 */
export interface Road {
  /** 稳定机器键（kebab-case） */
  id: string;
  /** 中英双语路名（HUD/迷你地图用） */
  title: { zh: string; en: string };
  /** 轴向：north-south = 沿 Z 轴（路面在 |x|<halfWidth 带），east-west = 沿 X 轴 */
  axis: 'north-south' | 'east-west';
  /** 半路宽（米）：路面带 = 轴垂直方向 ±halfWidth */
  halfWidth: number;
  /** 沿轴范围 [min, max]（米），尽头设 CC-P1 全息路障 */
  range: [number, number];
}

/** 世界配置（坐标系/道路/出生点）——出生点 = 十字路口正中 (0,0)、车头朝北（SRD §12.7.5） */
export interface WorldConfig {
  /** 单位恒为米 */
  units: string;
  /** three.js 右手系：+X=东，+Z=南，+Y=上；地面 y=0，position 省略 y */
  coordinateSystem: string;
  /** 朝向约定：度；0=北(-Z)，顺时针递增（90=东）——换算见 headingToRotationY */
  headingConvention: string;
  /** 大楼槽位硬上限：buildings.length + reservedSlots.length ≤ 20 */
  maxBuildingSlots: number;
  /** 出生点：变形（机器人→车）落点 */
  spawn: {
    position: { x: number; z: number };
    heading: number;
    note?: string;
  };
  roads: Road[];
}

/** 三档流式 LOD 参数（SRD §12.7.6 的数据单源；CC-E3 只消费 S 档语义，H/M 归 CC-P1） */
export interface StreamingConfig {
  tiers: Record<
    'H' | 'M' | 'S',
    { label: string; source: string; budgetKbPerBuilding?: number; sharedAtlas?: string; networkRequests?: number }
  >;
  /** H 档升模半径（米） */
  hdRadius: number;
  /** M 档中模半径（米） */
  mediumRadius: number;
  /** 升降模迟滞（±米，防路口徘徊抖动） */
  hysteresis: number;
  /** 行进朝向预取半径（米） */
  prefetchRadius: number;
  maxConcurrentLoads: number;
  maxResidentHd: number;
  /** 出生圈高清五栋（随首包直出 H 档，终裁 D3） */
  spawnHd: string[];
  spawnHdBudgetKb: number;
  idlePrefetchPhase: number;
}

/** 城区条目（category 取值域见 DistrictCategory） */
export interface District {
  id: DistrictCategory;
  title: { zh: string; en: string };
  buildings: string[];
}

/** 在册大楼条目（字段字典全文见 CC-MAP1 §5.1；id 一经发布不可改） */
export interface Building {
  /** 稳定机器键（kebab-case）：?poi= 深链与 world-poi 事件引用它 */
  id: string;
  /** URL/资产目录友好名，通常与 id 同值 */
  slug: string;
  /** 中英双语楼名：楼顶全息招牌显示 en，DOM 楼宇快览显示 zh */
  title: { zh: string; en: string };
  /** 一句话职能（HUD tooltip / aria-label） */
  role: string;
  category: DistrictCategory;
  /** 足迹中心世界坐标（米）+ 楼体绕 Y 旋转（度，three.js 旋转向，非 heading）；y 恒 0 不入库 */
  position: { x: number; z: number; rotationY: number };
  /** 宽 w（x 向）× 深 d（z 向）× 高 h（米）：剪影/体块/碰撞体直接由此拉伸 */
  footprint: { w: number; d: number; h: number };
  /** 主霓虹色 hex：招牌、窗格 emissive、泊车位光圈、迷你地图图钉共用；01–04 号楼为提案锁定值 */
  neonColor: string;
  /** 站内路由（尾斜杠齐全）；check-links 存在性校验（CC-E8） */
  deepLink: string;
  /** fallback = 目标专页未上线暂落上级索引，上线后只改 JSON 两字段 */
  deepLinkStatus: 'live' | 'fallback';
  priority: 'P0' | 'P1' | 'P2';
  /** 0 首屏第一幕点亮；1 世界壳 WASD 开放点亮；2 Phase 2 扩展点亮 */
  unlockPhase: 0 | 1 | 2;
  lodProfile: LodProfile;
  /**
   * [CC-BL1] hero 实模 GLB（public/ 相对路径，Draco+KTX2）：存在即 Q0/Q1 挂载时
   * 由 HeroBlenderMesh 异步加载替换程序化体块视觉（物理碰撞体不动）；
   * Q2 / 加载失败回退程序化 ThemeTowers。加一栋实模 = 补本字段，引擎零改动。
   */
  heroGlb?: string;
  /** 楼前泊车触发区（圆心/车头朝向/触发半径）——进楼判定归 CC-P1/CC-E9 */
  parkingBay: { x: number; z: number; heading: number; radius: number };
}

/** 预留槽位 13–20（外环）：占位可解析，激活 = 补齐 Building 字段升入 buildings[] */
export interface ReservedSlot {
  id: string;
  position: { x: number; z: number; rotationY: number };
  suggestedTheme: { zh: string; en: string };
  suggestedCategory: DistrictCategory;
  unlockPhase: number;
  lodProfile: LodProfile;
}

/** src/data/cyber-city-buildings.json 顶层结构（SRD §12.7.3；破坏性变更 schemaVersion +1） */
export interface CyberCityMap {
  schemaVersion: string;
  task: string;
  updatedAt: string;
  docs: string;
  world: WorldConfig;
  streaming: StreamingConfig;
  districts: District[];
  buildings: Building[];
  reservedSlots: ReservedSlot[];
}

/**
 * heading（度；0=北(-Z)，顺时针递增）→ three.js Object3D.rotation.y（弧度）。
 * 约定物体局部前向为 -Z（three.js 相机/folio 车同向）：
 * rotation.y = -heading·π/180 时，局部 -Z 指向 (sin h, 0, -cos h) —— h=0 朝北、h=90 朝东。
 */
export function headingToRotationY(headingDeg: number): number {
  return -headingDeg * (Math.PI / 180);
}

/** 字符串 → 32 位确定性种子（FNV-1a）：楼宇 id 驱动窗格随机/体量变体，跨端一致 */
export function hashStringToSeed(input: string): number {
  let hashValue = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hashValue ^= input.charCodeAt(i);
    hashValue = Math.imul(hashValue, 0x01000193);
  }
  return hashValue >>> 0;
}

/** mulberry32 确定性伪随机（种子同 → 序列同；剪影层摆位/尺寸用它，刷新不跳变） */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 加载并轻量校验城市地图（结构断言 console.warn，不阻断——构建期 zod/CI 硬校验归 CC-E8）：
 * ① 槽位封顶：buildings + reservedSlots ≤ world.maxBuildingSlots；
 * ② id 唯一（含槽位）；
 * ③ 道路带不侵入：楼体足迹 AABB 不得进入 |x|<halfWidth 或 |z|<halfWidth 条带
 *    （rotationY≠0 的楼按外接 AABB 保守判定）。
 */
export function loadCityMap(): CyberCityMap {
  const map = rawMap as unknown as CyberCityMap;

  const slotCount = map.buildings.length + map.reservedSlots.length;
  if (slotCount > map.world.maxBuildingSlots) {
    console.warn(
      `[city] 槽位超限：${slotCount} > maxBuildingSlots ${map.world.maxBuildingSlots}（CC-MAP1 §5.2 封顶 20）`,
    );
  }

  const seenIds = new Set<string>();
  for (const entry of [...map.buildings, ...map.reservedSlots]) {
    if (seenIds.has(entry.id)) console.warn(`[city] id 重复：${entry.id}`);
    seenIds.add(entry.id);
  }

  for (const building of map.buildings) {
    // 外接 AABB（含旋转保守化）：rotationY=0 时即足迹本身
    const rotation = (building.position.rotationY * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rotation));
    const sin = Math.abs(Math.sin(rotation));
    const halfW = (building.footprint.w * cos + building.footprint.d * sin) * 0.5;
    const halfD = (building.footprint.w * sin + building.footprint.d * cos) * 0.5;

    for (const road of map.world.roads) {
      // 垂轴方向：楼体近街边缘挤进路面带；沿轴方向：足迹区间与道路 range 有重叠
      const crossAxisIntrudes =
        road.axis === 'north-south'
          ? Math.abs(building.position.x) - halfW < road.halfWidth
          : Math.abs(building.position.z) - halfD < road.halfWidth;
      const alongCenter = road.axis === 'north-south' ? building.position.z : building.position.x;
      const alongHalf = road.axis === 'north-south' ? halfD : halfW;
      const alongOverlaps =
        alongCenter + alongHalf > road.range[0] && alongCenter - alongHalf < road.range[1];
      if (crossAxisIntrudes && alongOverlaps) {
        console.warn(
          `[city] 楼体 ${building.id} 侵入道路带 ${road.id}（CC-MAP1 §5.2 规则 4）`,
        );
      }
    }
  }

  return map;
}
