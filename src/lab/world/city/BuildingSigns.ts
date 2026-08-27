// [CC-L2-B1] 五栋 hero 楼可读招牌 → [CC-VIS-X3] 招牌叙事 v2 多层体系（design-confirm
// §4.2 第一/二件；rubric V4「招牌密度」/ V7「楼=产品线帧内自明」扣分点销账）。
// 每栋 hero 楼三层（B1 两件套扩为 2-3 层）：
//   ① 楼顶主匾（全息板）：图标 + EN 楼名——远景认楼（慢呼吸脉动继承 B1 席位，
//      CITY-03 配额恒 3 席不变：HeroRobot idle + 本件 + 光轨）；
//   ② 楼身竖幅：zh 楼名逐字竖排（港式挂旗，SignageAtlas 竖排管线）——中景认楼；
//   ③ 街层灯箱：图标 + 产品线名直写（车库=车轮廓、座舱=声波纹……）——近景/驾驶
//      视角「这栋楼是哪条产品线」帧内自明，V7 唯一明确扣分点的执行位。
// 纹理 = SignageAtlas（TextCanvas 管线扩展：竖排/双语/图标合成，零外部资产）；
// 颜色 = buildings JSON neonColor（A3 色纪律：neonColor 保留给「楼宇身份件」）。
// draw call 台账（O4 哨兵口径）：每栋 = 全息板 1 + 立面合并几何 1（灯箱+竖幅共用
// 同一图集/材质，mergeGeometries 合一次 draw）→ 5 栋共 10 draw call，与 v1 持平
// （多出的层吃进图集合并，零增量）。纯视觉无物理（招牌不碰撞）。
// stagger 点亮：每栋一支 lit uniform（litChannels 距出生点近→远序），由
// SignageIgnition 在 world-reveal 后 150ms 逐楼点亮（一次性瞬态零配额；
// reduced-motion / 非首幕路径不接线 = lit 恒 1 直出终态）。
import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Game } from '../core/Game';
import type { Building, CyberCityMap, DistrictCategory } from './CityMap';
import { hashStringToSeed } from './CityMap';
import {
  createHoloSignMaterial,
  createSignLitUniform,
  createSignPanelMaterial,
  type SignLitUniform,
} from './NeonFacade';
import type { AtlasRegion, SignIconKind } from './SignageAtlas';
import { composeBuildingSignAtlas } from './SignageAtlas';

/** 立面招牌只挂「面向主轴道路」的面：楼心到该轴距离超过此值视为不临街（concept-garage
 *  x=140 距南北大道过远，只保留朝东西大街的南立面招牌） */
const ROAD_FACING_MAX = 100;

/** 立面招牌离幕墙面外扩（米）：防 z-fighting，远机位不可辨 */
const PANEL_PROUD = 0.35;

/**
 * [CC-VIS-X3] 产品线台账（V7「楼=产品线」帧内自明正文；StreetLamps SLOGANS 同款
 * 代码侧常量表——楼名/坐标等数据面归 buildings JSON，招牌文案归呈现层）。
 * 新 hero 楼未登记时回退 title.en + 城区默认图标（CATEGORY_ICONS）。
 */
const PRODUCT_LINES: Record<string, { line: string; icon: SignIconKind }> = {
  'lingua-tower': { line: '39-LANG L10N', icon: 'lang' },
  'voice-pod': { line: 'IN-CAR TTS', icon: 'wave' },
  'agent-nexus': { line: 'MASTER AGENT', icon: 'agent' },
  'autodrive-lab': { line: 'AUTODRIVE', icon: 'radar' },
  'concept-garage': { line: 'CAR CONFIGURATOR', icon: 'car' },
};

const CATEGORY_ICONS: Record<DistrictCategory, SignIconKind> = {
  language: 'lang',
  'ai-core': 'agent',
  mobility: 'car',
  gallery: 'agent',
  civic: 'agent',
};

interface FacadeSlot {
  /** 面法向的 Y 旋转（PlaneGeometry 默认法向 +Z） */
  rotationY: number;
  /** 面板中心本地坐标（y 由挂高决定） */
  offset: { x: number; z: number };
  /** 该立面可用宽度（米，面板宽度上限的基数） */
  facadeWidth: number;
}

/**
 * [CC-VIS-X3] 图集 quad：uv 预编码进采样空间（v 向下，region 子图），本地 0..1
 * 存 uvLocal attribute（描边框/背光坐标）——createSignPanelMaterial atlas 模式合同。
 */
function makeRegionQuad(region: AtlasRegion): THREE.PlaneGeometry {
  const quad = new THREE.PlaneGeometry(1, 1);
  const uvAttr = quad.getAttribute('uv') as THREE.BufferAttribute;
  const local = new Float32Array(uvAttr.count * 2);
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i);
    const v = uvAttr.getY(i);
    local[i * 2] = u;
    local[i * 2 + 1] = v;
    // 平面 v=1 为顶 → 采样空间 v 向下：顶行采 region.v0
    uvAttr.setXY(i, region.u0 + u * (region.u1 - region.u0), region.v0 + (1 - v) * (region.v1 - region.v0));
  }
  quad.setAttribute('uvLocal', new THREE.BufferAttribute(local, 2));
  return quad;
}

export class BuildingSigns {
  /** 已挂招牌的楼 id 清单（调试/取证读数用；距出生点近→远序 = 点亮序） */
  readonly buildingIds: string[] = [];
  /** 立面灯箱面数合计（draw call 台账核对用） */
  panelFaceCount = 0;
  /** [CC-VIS-X3] 楼身竖幅数合计（台账读数） */
  bannerCount = 0;
  /** [CC-VIS-X3] stagger 点亮通道（每楼一支，序同 buildingIds；缺省恒 1 常亮） */
  readonly litChannels: SignLitUniform[] = [];

  private readonly game: Game;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    // 点亮序 = 距出生点近→远（内环四塔并列取 JSON 序，garage 殿后）
    const spawn = map.world.spawn.position;
    const heroes = map.buildings
      .map((building, index) => ({ building, index }))
      .filter(({ building }) => building.lodProfile === 'hero')
      .sort((a, b) => {
        const da = Math.hypot(a.building.position.x - spawn.x, a.building.position.z - spawn.z);
        const db = Math.hypot(b.building.position.x - spawn.x, b.building.position.z - spawn.z);
        return da - db || a.index - b.index;
      });

    for (const { building } of heroes) {
      this.addSigns(building);
      this.buildingIds.push(building.id);
    }
  }

  private addSigns(building: Building): void {
    const { w, d, h } = building.footprint;
    const { x, z, rotationY } = building.position;
    const seed = hashStringToSeed(building.id);

    // [CC-VIS-X3] 三层共用图集（SignageAtlas：双语 + 竖排 + 图标合成）
    const product = PRODUCT_LINES[building.id] ?? {
      line: building.title.en,
      icon: CATEGORY_ICONS[building.category] ?? 'agent',
    };
    const atlas = composeBuildingSignAtlas({
      nameEn: building.title.en,
      nameZh: building.title.zh,
      productLine: product.line,
      icon: product.icon,
    });
    const lit = createSignLitUniform();
    this.litChannels.push(lit);

    // 本地坐标系：原点 = 楼底中心（区别于 ThemeTowers 的楼体中心原点——招牌挂高
    // 直接用离地米数，免 h/2 换算）；随楼体 rotationY 整组旋转
    const group = new THREE.Group();
    group.name = `city-signs-${building.id}`;
    group.position.set(x, 0, z);
    group.rotation.y = (rotationY * Math.PI) / 180;

    // 面向主轴道路的立面槽位（内环四塔各 2 面、concept-garage 1 面）
    const slots: FacadeSlot[] = [];
    if (Math.abs(x) <= ROAD_FACING_MAX) {
      slots.push(
        x > 0
          ? { rotationY: -Math.PI / 2, offset: { x: -(w / 2 + PANEL_PROUD), z: 0 }, facadeWidth: d }
          : { rotationY: Math.PI / 2, offset: { x: w / 2 + PANEL_PROUD, z: 0 }, facadeWidth: d },
      );
    }
    if (Math.abs(z) <= ROAD_FACING_MAX) {
      slots.push(
        z > 0
          ? { rotationY: Math.PI, offset: { x: 0, z: -(d / 2 + PANEL_PROUD) }, facadeWidth: w }
          : { rotationY: 0, offset: { x: 0, z: d / 2 + PANEL_PROUD }, facadeWidth: w },
      );
    }

    const quads: THREE.BufferGeometry[] = [];

    // ③ 街层灯箱（v1 楼身灯箱下移进驾驶/街面视野；内容换产品线直写）：
    //    挂高压在裙房（≤4m）之上、近景可读带内
    const mountY = Math.min(8.5, Math.max(6.4, h * 0.18));
    for (const slot of slots) {
      // 面板高按楼高取档，宽 = 高 × 子图宽高比；超立面 80% 时整体等比缩
      let panelH = Math.min(3.4, Math.max(2.2, h * 0.055));
      let panelW = panelH * atlas.product.aspect;
      const maxW = slot.facadeWidth * 0.8;
      if (panelW > maxW) {
        panelH *= maxW / panelW;
        panelW = maxW;
      }

      const quad = makeRegionQuad(atlas.product);
      quad.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(slot.offset.x, mountY, slot.offset.z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, slot.rotationY, 0)),
          new THREE.Vector3(panelW, panelH, 1),
        ),
      );
      quads.push(quad);
      this.panelFaceCount += 1;
    }

    // ② 楼身竖幅（zh 楼名竖排，主临街面一幅）：贴双阶收分楼的下段满宽区
    //    （lower ≥ 0.56h），沿立面横向偏出 30% 避开中轴灯箱/大堂光带视线
    const primary = slots[0];
    if (primary) {
      let bannerW = Math.min(3.2, Math.max(1.9, Math.min(w, d) * 0.09));
      let bannerH = bannerW / atlas.banner.aspect;
      const maxH = h * 0.5;
      if (bannerH > maxH) {
        bannerH = maxH;
        bannerW = bannerH * atlas.banner.aspect;
      }
      const top = h >= 55 ? h * 0.54 : h * 0.9;
      const lateral = Math.min(primary.facadeWidth * 0.3, primary.facadeWidth / 2 - bannerW);
      // 本地 +X 经槽位旋转后的沿立面向（rotY 绕 Y：+X → (cos r, 0, -sin r)）
      const alongX = Math.cos(primary.rotationY);
      const alongZ = -Math.sin(primary.rotationY);

      const quad = makeRegionQuad(atlas.banner);
      quad.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(
            primary.offset.x + alongX * lateral,
            top - bannerH / 2,
            primary.offset.z + alongZ * lateral,
          ),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, primary.rotationY, 0)),
          new THREE.Vector3(bannerW, bannerH, 1),
        ),
      );
      quads.push(quad);
      this.bannerCount += 1;
    }

    if (quads.length > 0) {
      const panelMesh = new THREE.Mesh(
        mergeGeometries(quads),
        createSignPanelMaterial(atlas.texture, building.neonColor, { atlas: true, lit }),
      );
      panelMesh.name = `city-sign-panels-${building.id}`;
      group.add(panelMesh);
    }

    // ① 楼顶双面全息板（图标 + EN 楼名）：内环双临街塔朝路口对角（双面板正/背各覆
    //    一个来向），单临街楼（garage）正对其道路
    const boardH = Math.min(5, Math.max(2.6, h * 0.075));
    const boardW = Math.min(Math.max(w, d) * 0.92, boardH * atlas.roof.aspect);
    // 本地旋转：双临街塔取「朝路口」世界向再扣除楼体自转；单临街楼直接沿用立面槽位
    const boardRotationY =
      slots.length >= 2
        ? Math.atan2(-x, -z) - (rotationY * Math.PI) / 180
        : (slots[0]?.rotationY ?? 0);

    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(boardW, boardH),
      createHoloSignMaterial(atlas.texture, building.neonColor, {
        phase: seed % 6,
        region: atlas.roof,
        lit,
      }),
    );
    board.name = `city-sign-holo-${building.id}`;
    board.position.set(0, h + 1.1 + boardH / 2, 0);
    board.rotation.y = boardRotationY;
    group.add(board);

    this.game.scene.add(group);
  }
}
