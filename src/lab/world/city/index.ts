// CC-E3：程序化科技城装配入口（src/lab/world/city/ 唯一对外面）。
// 挂载前提：game.init() 已完成（physics/objects 就绪——楼宇/路障要建 fixed 碰撞体）。
// 隐藏路径接线见 src/lab/world/index.ts（?city=1，动态 import 独立分包，
// 不挂载时 spike 灰盒零城市字节）。四大件：
//   Roads         主十字路口路面 + 出生标记 + 尽头路障 + 城市地面碰撞体
//   ThemeTowers   hero 五栋（内环四主题塔 + concept-garage），JSON 数据驱动
//   CityBlocks    standard 七栋中景体块，JSON 数据驱动
//   CitySilhouette 预留槽位 8 + 天际线填充（InstancedMesh 单 draw call）
// 资产台账：外部资产 0 字节（全程序化 TSL，零贴图零 GLB 零网络请求）。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { CyberCityMap } from './CityMap';
import { loadCityMap } from './CityMap';
import { Roads } from './Roads';
import { ThemeTowers } from './ThemeTowers';
import { CityBlocks } from './CityBlocks';
import { CitySilhouette } from './CitySilhouette';

export interface City {
  /** 城市地图数据（单源 JSON 的运行时只读句柄） */
  map: CyberCityMap;
  roads: Roads;
  themeTowers: ThemeTowers;
  cityBlocks: CityBlocks;
  silhouette: CitySilhouette;
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

  // 灰盒相机远裁剪面 200m 只够试车道；城市尺度放宽 + 距离雾衔接天际线渐隐
  for (const camera of [game.view.camera, game.view.defaultCamera]) {
    camera.far = 1000;
    camera.updateProjectionMatrix();
  }
  game.scene.fog = new THREE.Fog('#0d0c11', 160, 900);

  const spawn = map.world.spawn.position;
  console.info(
    `[city] CC-E3 程序化城区已挂载：在册 ${map.buildings.length} 栋可见地标` +
      `（hero ${themeTowers.towers.length} [${themeTowers.buildingIds.join(', ')}]` +
      ` + standard ${cityBlocks.blocks.length}）` +
      `；预留剪影槽位 ${silhouette.slotColliders.length} + 天际线填充 ${
        silhouette.instanceCount - silhouette.slotColliders.length
      }（1 draw call）；道路 ${map.world.roads.length} 条 + 尽头路障 ${roads.barriers.length}` +
      `；出生点 (${spawn.x}, ${spawn.z}) heading ${map.world.spawn.heading}（十字路口正中，车头朝北）` +
      `；外部资产 0 字节（全程序化）`,
  );

  return { map, roads, themeTowers, cityBlocks, silhouette };
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
export {
  createFacadeMaterial,
  createSilhouetteMaterial,
  createNeonGlowMaterial,
  createHologramBarrierMaterial,
} from './NeonFacade';
