// 移植改造自 folio-2025 sources/Game/World/Areas/Areas.js（81 行，MIT，
// vendor/README.md 记录 commit 41046b5）。区域注册表：folio 从 areas.glb 子节点
// 命名前缀实例化 14 个 Area 子类；本站改为**双 JSON 单源数据驱动**（CC-E9 验收
// 「POI 数据零硬编码」）：
//   src/data/world-pois.json          POI 注册表（引用 buildings id + 交互语义）
//   src/data/cyber-city-buildings.json 坐标/标题/产品线/触发圈（parkingBay）/进站
//                                      URL（deepLink 字段）——楼数据唯一事实源
// 每条 POI = Area 触发圈（game.zones 圆柱，folio 基类三件套）+ 泊车位霓虹光圈
// （NeonMaterials 同源材质，静态常亮不占循环动画配额）+ InteractivePoints 标点
// （楼名标签 + E 键帽提示）。
// ?poi= 深链（SRD §12.7.8 出口⑧ / CITY-09）：出生点改写为对应楼 parkingBay
// （朝向楼门，SRD §12.7.5），光圈提亮高亮；无效 slug 告警并原地出生（不阻断）。
// 进站动线为 CITY-08 Phase 1 先遣态：E/Enter/点按 → world-poi 事件 + 真实 URL
// 直跳占位（overlay/View Transition 进站归 CC-P1）。
import * as THREE from 'three/webgpu';
import poisRaw from '../../../data/world-pois.json';
import type { Game } from '../core/Game';
import type { Building, CyberCityMap } from '../city/CityMap';
import { createNeonGlowMaterial } from '../rendering/NeonMaterials';
import { Zones } from '../world/Zones';
import { RayCursor } from '../inputs/RayCursor';
import { Area } from './Area';
import { InteractivePoints } from './InteractivePoints';

/** world-pois.json 条目（id 一经发布不变；buildingId 必须存在于 buildings JSON） */
export interface WorldPoiEntry {
  id: string;
  /** 楼数据外键（cyber-city-buildings.json buildings[].id） */
  buildingId: string;
  /** POI 类型（先遣版仅 building-entry；Phase B 扩 signpost/module 等） */
  kind: 'building-entry';
  /** 交互动作：navigate = location 直跳进站 URL；console = 仅日志占位 */
  action: 'navigate' | 'console';
  /** 标签延展方向覆写（缺省 left） */
  align?: 'left' | 'right';
}

/** src/data/world-pois.json 顶层结构（破坏性变更 schemaVersion +1） */
export interface WorldPoisConfig {
  schemaVersion: string;
  task: string;
  updatedAt: string;
  docs: string;
  buildingsSource: string;
  deepLink: { param: string; slugField: string; entryUrlField: string };
  interaction: { keys: string[]; keyLabel: string; prompt: { zh: string; en: string } };
  point: { hoverHeight: number };
  pois: WorldPoiEntry[];
}

export interface AreasOptions {
  /**
   * ?poi= 深链 slug（buildings JSON id）：出生点改写到对应楼 parkingBay。
   * ritual 模式传 null——首幕出生锚点归 TransformSystem（变形落点），触发圈照常挂载。
   */
  deepLinkPoi?: string | null;
}

interface PoiRecord {
  entry: WorldPoiEntry;
  building: Building;
  area: Area;
  ring: THREE.Mesh;
}

export class Areas {
  private readonly game: Game;
  readonly config: WorldPoisConfig;
  readonly rayCursor: RayCursor;
  readonly points: InteractivePoints;
  readonly records: PoiRecord[] = [];

  constructor(game: Game, map: CyberCityMap, options: AreasOptions = {}) {
    this.game = game;
    this.config = poisRaw as unknown as WorldPoisConfig;

    // Zones 底座兜底：Game.init 仅在 Rapier 就绪时建 zones（运动学回退档缺席）；
    // Zones 本身零物理依赖（只测 player.position 距离），此处按需补建。
    if (!game.zones) game.zones = new Zones(game);

    this.rayCursor = new RayCursor(game);
    this.points = new InteractivePoints(game, this.rayCursor, {
      keys: this.config.interaction.keys,
      keyLabel: this.config.interaction.keyLabel,
    });

    // ———— 轻量运行期校验（zod 构建期硬校验归 CC-E8 管线）————
    const buildingById = new Map(map.buildings.map((building) => [building.id, building]));
    const seenPoiIds = new Set<string>();
    for (const entry of this.config.pois) {
      if (seenPoiIds.has(entry.id)) console.warn(`[areas] POI id 重复：${entry.id}`);
      seenPoiIds.add(entry.id);
      if (!buildingById.has(entry.buildingId))
        console.warn(`[areas] POI ${entry.id} 引用了不存在的楼：${entry.buildingId}（buildings JSON 未登记）`);
    }
    if (this.config.pois.length < 10)
      console.warn(`[areas] POI 数量 ${this.config.pois.length} < 10（CITY-07 首版 ≥10 栋可见地标）`);

    // ———— 逐 POI 装配：触发圈 + 泊车位光圈 + 标点 ————
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
    const ringGeometryByRadius = new Map<number, THREE.TorusGeometry>();
    const highlightPoi = options.deepLinkPoi ?? null;

    for (const entry of this.config.pois) {
      const building = buildingById.get(entry.buildingId);
      if (!building) continue;

      const bay = building.parkingBay;
      const highlighted = entry.buildingId === highlightPoi;

      // 泊车位霓虹光圈（楼色一致；pulseSpeed 0 常亮——CITY-03 循环动画配额不占用；
      // 深链目标楼提亮 = 「定位/高亮对应楼触发区」验收口径）
      let ringGeometry = ringGeometryByRadius.get(bay.radius);
      if (!ringGeometry) {
        ringGeometry = new THREE.TorusGeometry(bay.radius, 0.16, 8, 64);
        ringGeometryByRadius.set(bay.radius, ringGeometry);
      }
      const ring = new THREE.Mesh(
        ringGeometry,
        createNeonGlowMaterial(building.neonColor, { pulseSpeed: 0, intensity: highlighted ? 3.4 : 1.5 }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(bay.x, 0.14, bay.z);
      game.scene.add(ring);

      // 标点（悬浮于触发圈圆心；标签双语 + 键帽提示行）
      const point = this.points.create({
        id: building.id,
        position: new THREE.Vector3(bay.x, this.config.point.hoverHeight, bay.z),
        lines: [
          building.title.zh,
          `${building.title.en} · ${this.config.interaction.keyLabel} ${this.config.interaction.prompt.zh}`,
        ],
        accentColor: building.neonColor,
        align:
          entry.align === 'right' ? InteractivePoints.ALIGN_RIGHT : InteractivePoints.ALIGN_LEFT,
        onInteract: () => {
          const entryUrl = building.deepLink;
          // 埋点通路占位（SRD §9.5 world-poi:{slug}；统计接线归 CITY-11/CC-P1）
          game.events.trigger('world-poi', [building.id]);
          console.info(
            `[areas] world-poi:${building.id} → 进站 ${entryUrl}` +
              `（CITY-08 Phase 1：真实 URL 直跳占位，overlay/View Transition 归 CC-P1）`,
          );
          if (entry.action === 'navigate') location.assign(`${base}${entryUrl}`);
        },
      });

      // 触发圈（Area 基类 = game.zones 圆柱；frustum 圆-圆剔除把光圈/标点整组出画隐藏）
      const area = new Area(game, {
        id: building.id,
        bounding: { x: bay.x, z: bay.z, radius: bay.radius },
        frustum: { x: bay.x, z: bay.z, radius: bay.radius + 10 },
      });
      area.addHideable(ring);
      area.addHideable(point.group);

      area.events.on('boundingIn', () => {
        // [CC-OBS-C1] 漏斗步⑥：首次触发圈进入（观测规格 §3.4 poi-bounding-in 行）
        game.session.log('poi-bounding-in', { id: building.id });
        point.pinned = true;
        point.reveal();
        console.info(
          `[areas] 触发圈进入：${building.id}（${building.title.zh}）——` +
            `${this.config.interaction.keyLabel}/Enter 或点按标点进站 ${building.deepLink}`,
        );
      });
      area.events.on('boundingOut', () => {
        game.session.log('poi-bounding-out', { id: building.id });
        point.pinned = false;
        point.conceal();
      });

      this.records.push({ entry, building, area, ring });
    }

    // ———— ?poi= 深链出生（非 ritual）————
    if (highlightPoi) this.applyDeepLink(highlightPoi, buildingById);

    console.info(
      `[areas] CC-E9 POI 系统就位：触发圈 ${this.records.length}/${this.config.pois.length}` +
        `（CITY-07 首版 ≥10，目标 12）；交互 = ${this.config.interaction.keyLabel}/Enter/点按标点；` +
        `?poi= 深链候选 [${this.records.map((record) => record.building.id).join(', ')}]；` +
        `数据单源 world-pois.json ⇄ cyber-city-buildings.json（坐标/标题/产品线零硬编码）；` +
        `新增外部资产 0 字节（键帽/标签全 canvas 程序化）`,
    );
  }

  /** 出生点改写到目标楼 parkingBay（朝向楼门，SRD §12.7.5 深链出生条款） */
  private applyDeepLink(slug: string, buildingById: Map<string, Building>): void {
    const building = buildingById.get(slug);
    const registered = this.records.some((record) => record.building.id === slug);
    if (!building || !registered) {
      console.warn(
        `[areas] ?poi=${slug} 无效（未登记的楼/POI）；原地出生。` +
          `候选：[${this.records.map((record) => record.building.id).join(', ')}]`,
      );
      return;
    }

    const bay = building.parkingBay;
    const landing = this.game.respawns.getDefault();
    landing.position.set(bay.x, 0, bay.z);
    // heading（0=北，顺时针）→ PlayerVehicle rotationY（forward=(cos r,0,-sin r)）：
    // 与 index.ts ritual 出生锚点同一换算式
    landing.rotation = Math.PI / 2 - (bay.heading * Math.PI) / 180;
    this.game.player.respawn();

    console.info(
      `[areas] ?poi=${slug} 深链出生：${building.title.zh}（${building.title.en}）` +
        ` parkingBay (${bay.x}, ${bay.z}) heading ${bay.heading}，触发圈半径 ${bay.radius}m 已高亮`,
    );
  }

  /** 纹理等非场景资源释放（几何/材质归 Game.dispose 场景遍历；zones/tick 随 Game 停摆） */
  dispose(): void {
    this.points.dispose();
  }
}
