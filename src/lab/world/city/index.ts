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
import { CityBlocks } from './CityBlocks';
import { CitySilhouette } from './CitySilhouette';
import { Sky, SKY_FOG_COLOR, SKY_ZENITH_COLOR } from './Sky';
import { StreetProps } from './StreetProps';
import { BuildingSigns } from './BuildingSigns';
import { StreetLamps } from './StreetLamps';
import { applyNeonQuality } from './NeonFacade';

export interface City {
  /** 城市地图数据（单源 JSON 的运行时只读句柄） */
  map: CyberCityMap;
  roads: Roads;
  themeTowers: ThemeTowers;
  cityBlocks: CityBlocks;
  silhouette: CitySilhouette;
  /** 霓虹网格地面（CC-E4） */
  grid: Grid;
  /** 天空穹顶 + 地平线辉光（CC-L1 A1） */
  sky: Sky;
  /** 街角霓虹隔离墩（CC-L1 A2：城市道具层，替换 spike 锥桶） */
  streetProps: StreetProps;
  /** hero 五栋可读招牌：楼名全息板 + 立面灯箱（CC-L2-B1） */
  buildingSigns: BuildingSigns;
  /** 街道灯杆 + 沿街广告灯箱 10 件（CC-L2-B2） */
  streetLamps: StreetLamps;
}

/**
 * 把程序化科技城挂进已初始化的 Game。视觉件进 game.scene（Game.dispose 的场景遍历
 * 统一释放几何/材质），物理件经 game.objects 注册（physics.free 统一释放）——
 * city 无独立 dispose，生命周期完全随 Game。
 */
export function mountCity(game: Game): City {
  const map = loadCityMap();

  const roads = new Roads(game, map);
  const themeTowers = new ThemeTowers(game, map);
  const cityBlocks = new CityBlocks(game, map);
  const silhouette = new CitySilhouette(game, map);
  const sky = new Sky(game);
  const streetProps = new StreetProps(game, map);
  const buildingSigns = new BuildingSigns(game, map);
  const streetLamps = new StreetLamps(game, map);

  // CC-E4 地表升级：霓虹网格地面（湿地反射三档）接管 plaza 的地表职责——
  // plaza 对象保留（隐藏，回退开关），高度层 0.02 由 Grid 顶替（路面 0.1 仍在其上）
  roads.plaza.visible = false;
  const grid = new Grid(game);

  // CC-E4 品质联动：霓虹材质 uniform（窗格闪烁三态）+ 地面反射档 + 剪影密度。
  // Rendering 的 bloom/DPR/阴影档位由其自身监听 quality.events，此处不重复接。
  // [CC-L2-a+] Roads 路面湿反射层随档：Grid 先切（Q0 时 reflector 就绪）再喂给
  // Roads 共享——主体脚下/斑马线区的倒影与广场同一镜像渲染（AL2-a §6-1）。
  const applyCityQuality = (level: QualityLevel) => {
    applyNeonQuality(level);
    grid.applyQuality(level);
    roads.applyWetQuality(level, grid.reflectionNode);
    silhouette.applyQuality(level);
  };
  applyCityQuality(game.quality.level);
  game.quality.events.on('change', applyCityQuality);

  // 灰盒相机远裁剪面 200m 只够试车道；城市尺度放宽 + 距离雾衔接天际线渐隐。
  // [CC-L1 A1] 雾色与天空地平线辉光带同源（SKY_FOG_COLOR）：远景楼宇渐隐进
  // 「城市光污染」而非纯黑；背景兜底同天顶色，穹顶边角零黑缝。
  for (const camera of [game.view.camera, game.view.defaultCamera]) {
    camera.far = 1000;
    camera.updateProjectionMatrix();
  }
  game.scene.fog = new THREE.Fog(SKY_FOG_COLOR, 140, 850);
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
      `；外部资产 0 字节（全程序化）` +
      `；[CC-E4] 霓虹视觉系统就位：Quality ${game.quality.level} 档` +
      `（bloom/湿地反射/剪影密度/窗格动画四联动，?quality=0|1|2 或 #debug 句柄切档）` +
      `；[CC-L1] 天空穹顶+地平线辉光 · 窗色三族纪律 · 街角隔离墩 ${streetProps.spots.length} 只（锥桶已撤场）` +
      `；[CC-L2 Tier B] hero 招牌 ${buildingSigns.buildingIds.length} 栋（全息板 + 立面灯箱 ${
        buildingSigns.panelFaceCount
      } 面，占位箍带已替换）· 街道灯杆 ${streetLamps.spots.length} 杆（灯箱色族=路轴 neon 单源）` +
      `· 剪影填充增密至 ${silhouette.instanceCount - silhouette.slotColliders.length}（高度方差三档）`,
  );

  return {
    map,
    roads,
    themeTowers,
    cityBlocks,
    silhouette,
    grid,
    sky,
    streetProps,
    buildingSigns,
    streetLamps,
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
export { CityBlocks } from './CityBlocks';
export { CitySilhouette } from './CitySilhouette';
export { Sky, SKY_FOG_COLOR, SKY_ZENITH_COLOR } from './Sky';
export { StreetProps } from './StreetProps';
export { BuildingSigns } from './BuildingSigns';
export { StreetLamps } from './StreetLamps';
export {
  applyNeonQuality,
  createFacadeMaterial,
  createSilhouetteMaterial,
  createNeonGlowMaterial,
  createHologramBarrierMaterial,
  createHoloSignMaterial,
  createSignPanelMaterial,
  createStreetLampMaterial,
} from './NeonFacade';
