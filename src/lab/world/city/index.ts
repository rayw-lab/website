// CC-E3：程序化科技城装配入口（src/lab/world/city/ 唯一对外面）。
// 挂载前提：game.init() 已完成（physics/objects 就绪——楼宇/路障要建 fixed 碰撞体）。
// 隐藏路径接线见 src/lab/world/index.ts（?city=1，动态 import 独立分包，
// 不挂载时 spike 灰盒零城市字节）。五大件（CC-E4 起 +Grid）：
//   Roads         主十字路口路面 + 出生标记 + 尽头路障 + 城市地面碰撞体
//   ThemeTowers   hero 五栋（内环四主题塔 + concept-garage），JSON 数据驱动
//   CityBlocks    standard 七栋中景体块，JSON 数据驱动
//   CitySilhouette 预留槽位 8 + 天际线填充（InstancedMesh 单 draw call）
//   Grid          霓虹网格地面（CC-E4 城市地面升级：湿地反射三档，接管 plaza 地表）
// CC-E4 品质接线：Quality 0/1/2 切档 → 霓虹材质 uniform + 地面反射 + 剪影密度
// 联动（bloom/DPR/阴影档位在 rendering/Rendering.ts 内自持）；挂载末拍 PreRenderer
// 离屏预编译全部城市材质（仅 Quality 0 + WebGPU，folio Game.js L203 同门）。
// 资产台账：外部资产 0 字节（全程序化 TSL，零贴图零 GLB 零网络请求）。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';
import { PreRenderer } from '../rendering/PreRenderer';
import { Grid } from '../world/Grid';
import type { CyberCityMap } from './CityMap';
import { loadCityMap } from './CityMap';
import { Roads } from './Roads';
import { ThemeTowers } from './ThemeTowers';
import { HeroBlenderMesh } from './HeroBlenderMesh';
import { CityBlocks } from './CityBlocks';
import { CitySilhouette } from './CitySilhouette';
import { FacadeKit } from './FacadeKit';
import { ForegroundFraming } from './ForegroundFraming';
import { Sky, SKY_ZENITH_COLOR, applyAtmosphereQuality } from './Sky';
import { StreetProps } from './StreetProps';
import { BuildingSigns } from './BuildingSigns';
import { AdBoards } from './AdBoards';
import { armSignageIgnition } from './SignageIgnition';
import { StreetLamps } from './StreetLamps';
import { SpeedTrap } from './SpeedTrap';
import { FlightTrails } from './FlightTrails';
import { applyNeonQuality } from './NeonFacade';

export interface City {
  /** 城市地图数据（单源 JSON 的运行时只读句柄） */
  map: CyberCityMap;
  roads: Roads;
  themeTowers: ThemeTowers;
  /** [CC-BL1] hero 楼实模层（Blender GLB 热替换；Q2/加载失败回退 ThemeTowers） */
  heroBlenderMesh: HeroBlenderMesh;
  cityBlocks: CityBlocks;
  silhouette: CitySilhouette;
  /** [CC-VIS-X2] 立面套件（10 类构件 InstancedMesh；Q2 零请求/加载失败静默回退） */
  facadeKit: FacadeKit;
  /** [CC-VIS-X2] 前景景框层（D7：近景管线桥剪影，静态零循环配额） */
  foregroundFraming: ForegroundFraming;
  /** 霓虹网格地面（CC-E4） */
  grid: Grid;
  /** 天空穹顶 + 地平线辉光（CC-L1 A1）+ 分层大气：低云带/分层雾 fogNode（CC-L3-ATM） */
  sky: Sky;
  /** 街角霓虹隔离墩（CC-L1 A2：城市道具层，替换 spike 锥桶） */
  streetProps: StreetProps;
  /** hero 五栋三层招牌体系：楼顶主匾 + 楼身竖幅 + 街层产品线灯箱（CC-L2-B1 → CC-VIS-X3） */
  buildingSigns: BuildingSigns;
  /** [CC-VIS-X3] 全息广告板 4 块（静帧零配额，产品线街面回声） */
  adBoards: AdBoards;
  /** 街道灯杆 + 沿街广告灯箱 10 件（CC-L2-B2） */
  streetLamps: StreetLamps;
  /** [CC-FXN-C6] G9 测速标牌（霓虹大街东段；TextCanvas 实时读数 + world-speedtrap 埋点） */
  speedTrap: SpeedTrap;
  /** 中远景飞行光轨 3 航线（CC-L3-B3：CITY-03 配额第 3 席，≤800 点） */
  flightTrails: FlightTrails;
}

export interface CityOptions {
  /**
   * [CC-VIS-X3] 首幕 stagger 点亮接线：true = 招牌黑板待燃，world-reveal 后
   * 150ms 逐楼点亮（一次性瞬态）。仅 ?ritual=1 且非 reduced-motion 时开——
   * 其余路径（?city=1 / ?poi= / reduced-motion 直出终态）缺省常亮。
   */
  revealStagger?: boolean;
}

/**
 * 把程序化科技城挂进已初始化的 Game。视觉件进 game.scene（Game.dispose 的场景遍历
 * 统一释放几何/材质），物理件经 game.objects 注册（physics.free 统一释放）——
 * city 无独立 dispose，生命周期完全随 Game。
 */
export function mountCity(game: Game, options: CityOptions = {}): City {
  const map = loadCityMap();

  const roads = new Roads(game, map);
  const themeTowers = new ThemeTowers(game, map);
  // [CC-BL1] hero 实模层：Q0/Q1 异步加载 GLB（不阻塞挂载/ready），Q2 零请求
  const heroBlenderMesh = new HeroBlenderMesh(game, map, themeTowers);
  const cityBlocks = new CityBlocks(game, map);
  const silhouette = new CitySilhouette(game, map);
  const sky = new Sky(game);
  const streetProps = new StreetProps(game, map);
  // [CC-VIS-X2] 立面套件三消费方（异步贴附，不阻塞挂载/ready；Q2 零 GLB 请求）：
  // CityBlocks 可见临街面立面件 + StreetProps 街角道具带 + 前景景框管线桥
  const facadeKit = new FacadeKit(game);
  cityBlocks.attachFacades(facadeKit);
  streetProps.placeCornerProps(facadeKit);
  const foregroundFraming = new ForegroundFraming(game, facadeKit);
  const buildingSigns = new BuildingSigns(game, map);
  const adBoards = new AdBoards(game);
  const streetLamps = new StreetLamps(game, map);
  const speedTrap = new SpeedTrap(game, map);
  const flightTrails = new FlightTrails(game);

  // [CC-VIS-X3] stagger 点亮（楼序 = litChannels 距出生点近→远，广告板尾拍）
  if (options.revealStagger) {
    armSignageIgnition(game, [...buildingSigns.litChannels, adBoards.lit]);
  }

  // CC-E4 地表升级：霓虹网格地面（湿地反射三档）接管 plaza 的地表职责——
  // plaza 对象保留（隐藏，回退开关），高度层 0.02 由 Grid 顶替（路面 0.1 仍在其上）
  roads.plaza.visible = false;
  const grid = new Grid(game);

  // CC-E4 品质联动：霓虹材质 uniform（窗格闪烁三态）+ 地面反射档 + 剪影密度。
  // Rendering 的 bloom/DPR/阴影档位由其自身监听 quality.events，此处不重复接。
  // [CC-L2-a+] Roads 路面湿反射层随档：Grid 先切（Q0 时 reflector 就绪）再喂给
  // Roads 共享——主体脚下/斑马线区的倒影与广场同一镜像渲染（AL2-a §6-1）。
  // [CC-L3-ATM] 大气分档（Sky.ts 模块 uniform）：Q0 全效 / Q1 简化 / Q2 兜底
  // [CC-L3-B3] 光轨分档：Q0 3 航线 / Q1 2 航线 + 0.8 / Q2 明确关闭（不画）
  const applyCityQuality = (level: QualityLevel) => {
    applyNeonQuality(level);
    applyAtmosphereQuality(level);
    grid.applyQuality(level);
    roads.applyWetQuality(level, grid.reflectionNode);
    silhouette.applyQuality(level);
    flightTrails.applyQuality(level);
  };
  applyCityQuality(game.quality.level);
  game.quality.events.on('change', applyCityQuality);

  // 灰盒相机远裁剪面 200m 只够试车道；城市尺度放宽 + 距离雾衔接天际线渐隐。
  // [CC-L3-ATM] 雾本体已升级为 Sky.ts 分层大气 fogNode（Sky 构造时装上 scene，
  // 接管 CC-L1 单层线性 Fog；雾色/辉光/云带三件同源单文件）；背景兜底同天顶色，
  // 穹顶边角零黑缝。
  for (const camera of [game.view.camera, game.view.defaultCamera]) {
    camera.far = 1000;
    camera.updateProjectionMatrix();
  }
  game.scene.background = new THREE.Color(SKY_ZENITH_COLOR);

  // 挂载末拍 shader 预热（§12.7.2「shader 预热」行）：离屏 CubeCamera 逼全部
  // 城市 TSL 材质完成管线编译，防首帧/首次入画卡顿。folio 同门：仅桌面全效档 +
  // WebGPU 后端（低端设备跳过防上下文丢失）。
  if (game.quality.level === 0 && game.rendering.isWebGPU) {
    PreRenderer.render(game);
  }

  const spawn = map.world.spawn.position;
  console.info(
    `[city] CC-E3 程序化城区已挂载：在册 ${map.buildings.length} 栋可见地标` +
      `（hero ${themeTowers.towers.length} [${themeTowers.buildingIds.join(', ')}]` +
      ` + standard ${cityBlocks.blocks.length}）` +
      `；预留剪影槽位 ${silhouette.slotColliders.length} + 天际线填充 ${
        silhouette.instanceCount - silhouette.slotColliders.length
      }（1 draw call）；道路 ${map.world.roads.length} 条 + 尽头路障 ${roads.barriers.length}` +
      `；出生点 (${spawn.x}, ${spawn.z}) heading ${map.world.spawn.heading}（十字路口正中，车头朝北）` +
      `；外部资产：hero 实模 GLB ${heroBlenderMesh.plannedCount} 件在册` +
      `（[CC-BL1] Q0/Q1 异步加载，Q2/失败回退程序化——其余全程序化 0 字节）` +
      `；[CC-E4] 霓虹视觉系统就位：Quality ${game.quality.level} 档` +
      `（bloom/湿地反射/剪影密度/窗格动画四联动，?quality=0|1|2 或 #debug 句柄切档）` +
      `；[CC-L1] 天空穹顶+地平线辉光 · 窗色三族纪律 · 街角隔离墩 ${streetProps.spots.length} 只（锥桶已撤场）` +
      `；[CC-VIS-X3] 楼宇招牌叙事 v2：${buildingSigns.buildingIds.length} 栋三层体系` +
      `（楼顶主匾 + 楼身竖幅 ${buildingSigns.bannerCount} 幅 + 街层产品线灯箱 ${
        buildingSigns.panelFaceCount
      } 面，图集合并每栋 2 draw call）· 全息广告板 ${adBoards.spots.length} 块` +
      `（静帧零配额，1 draw call）· stagger 点亮=${options.revealStagger ? 'reveal 后 150ms 逐楼' : '直出终态'}` +
      ` · 街道灯杆 ${streetLamps.spots.length} 杆（灯箱色族=路轴 neon 单源）` +
      ` · [CC-FXN-C6] G9 测速牌就位（霓虹大街东段 (${speedTrap.position.x}, ${speedTrap.position.z})，` +
      `实时 km/h + SPEED DEMON ≥90 + 会话纪录，3 draw call 静态小件）` +
      `· 剪影填充增密至 ${silhouette.instanceCount - silhouette.slotColliders.length}（高度方差三档）` +
      `；[CC-L3-ATM] 分层大气就位：双坡距离雾+近地雾床+方位辉光染雾（fogNode）· 地平线低云带（静态）` +
      `——Q0 全效/Q1 简化/Q2 线性雾兜底` +
      `；[CC-L3-B3] 飞行光轨 ${flightTrails.routeCount} 航线 ${flightTrails.pointCount} 点` +
      `（≤800 合同；CITY-03 配额第 3 席，单 InstancedMesh 1 draw call）` +
      `——Q0 3 航线/Q1 2 航线/Q2 关闭` +
      `；[CC-VIS-X2] 立面套件 FacadeKit.glb 在册（Q0/Q1 异步贴附：可见临街面立面件 +` +
      ` 街角道具带 6 簇 ×3 件 + 前景管线桥景框——NDC 清单先行，每类构件 1 draw call，` +
      `全静态零循环配额，emissive 阈下零辉光锚；Q2 零请求/失败静默回退）`,
  );

  return {
    map,
    roads,
    themeTowers,
    heroBlenderMesh,
    cityBlocks,
    silhouette,
    facadeKit,
    foregroundFraming,
    grid,
    sky,
    streetProps,
    buildingSigns,
    adBoards,
    streetLamps,
    speedTrap,
    flightTrails,
  };
}

export { loadCityMap, headingToRotationY, hashStringToSeed, createSeededRandom } from './CityMap';
export type {
  Building,
  CyberCityMap,
  District,
  DistrictCategory,
  LodProfile,
  ReservedSlot,
  Road as CityRoad,
  StreamingConfig,
  WorldConfig,
} from './CityMap';
export { Roads } from './Roads';
export { ThemeTowers } from './ThemeTowers';
export { HeroBlenderMesh } from './HeroBlenderMesh';
export { CityBlocks } from './CityBlocks';
export { CitySilhouette } from './CitySilhouette';
export { FacadeKit } from './FacadeKit';
export type { FacadeKitPieceName, FacadeKitPieces, PieceTransform } from './FacadeKit';
export { ForegroundFraming, FOREGROUND_BRIDGE_SPOT } from './ForegroundFraming';
export {
  Sky,
  SKY_FOG_COLOR,
  SKY_ZENITH_COLOR,
  applyAtmosphereQuality,
  setAtmosphereLayers,
} from './Sky';
export { StreetProps } from './StreetProps';
export { BuildingSigns } from './BuildingSigns';
export { AdBoards } from './AdBoards';
export { armSignageIgnition } from './SignageIgnition';
export {
  composeAdBoardAtlas,
  composeBuildingSignAtlas,
  drawSignIcon,
} from './SignageAtlas';
export type { AtlasRegion, BuildingSignAtlas, SignIconKind } from './SignageAtlas';
export { StreetLamps } from './StreetLamps';
export { SpeedTrap } from './SpeedTrap';
export { FlightTrails, setFlightTrails } from './FlightTrails';
export {
  applyNeonQuality,
  createFacadeMaterial,
  createSilhouetteMaterial,
  createNeonGlowMaterial,
  createHologramBarrierMaterial,
  createHoloAdBoardMaterial,
  createHoloSignMaterial,
  createSignLitUniform,
  createSignPanelMaterial,
  createStreetLampMaterial,
} from './NeonFacade';
