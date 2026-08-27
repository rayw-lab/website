// CC-E9：POI 区域系统装配入口（src/lab/world/areas/ 唯一对外面）。
// 挂载前提：城市已挂载（mountCity 完成——触发圈坐标对齐 buildings JSON parkingBay，
// 楼体不在场时挂 POI 无意义）且 game.init() 已完成（player/view/inputs 就绪）。
// 接线见 src/lab/world/index.ts：?city=1 或 ?poi= 时动态 import 本分包
// （默认路径零 POI/areas 字节——facade 分包纪律同 city/）。
// 五件（folio Areas 机制链的数据驱动版，gap 报告 §5.1）：
//   Areas              双 JSON 单源注册表（world-pois.json ⇄ cyber-city-buildings.json）
//   Area               触发圈基类（game.zones 圆柱 + 圆-圆视野剔除）
//   InteractivePoints  POI 标点（菱形圈 + TextCanvas 标签 + E 键帽 + 开合状态机）
//   RayCursor          射线悬停/点按（inputs/，与 Nipple 共存，不占任何键位）
//   ExploreProgress    [CC-FXN-C4] 探索计数 n/12 chip（F6 轻目标 + goal 族埋点）
//   QuestLine          [CC-FXN-C5] G4 目标线 v0（下一站 chip + 光柱 + idle 引导）
// 资产台账：外部资产 0 字节（标签/键帽全 canvas 程序化，光圈复用 NeonMaterials）。
import type { Game } from '../core/Game';
import type { CyberCityMap } from '../city/CityMap';
import { Areas, type AreasOptions } from './Areas';

/**
 * 把 POI 区域系统挂进已初始化的 Game。视觉件进 game.scene（Game.dispose 场景遍历
 * 统一释放），触发圈进 game.zones；返回句柄仅需在 mount dispose 时调 dispose()
 * 释放 canvas 纹理。
 */
export function mountAreas(game: Game, map: CyberCityMap, options: AreasOptions = {}): Areas {
  return new Areas(game, map, options);
}

export { Areas } from './Areas';
export type { AreasOptions, WorldPoiEntry, WorldPoisConfig } from './Areas';
export { Area } from './Area';
export type { AreaOptions } from './Area';
export { InteractivePoints } from './InteractivePoints';
export type {
  InteractivePointConfig,
  InteractivePointItem,
  InteractivePointsOptions,
} from './InteractivePoints';
export { PoiArrival } from './PoiArrival';
export type { PoiArrivalRequest } from './PoiArrival';
export { ExploreProgress } from './ExploreProgress';
export { QuestLine } from './QuestLine';
export type { QuestLineOptions } from './QuestLine';
