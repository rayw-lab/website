// CC-E3 建、CC-E4 接管：本文件曾是赛博楼宇 TSL 窗格材质族的实现体，
// E3 头注预留的「品质升级挂载点：CC-E4 NeonMaterials 接手时替换本文件的材质工厂
// 即可（接口不变）」已兑现——实现体整体迁至 rendering/NeonMaterials.ts
// （加 Quality 0/1/2 三档 uniform 响应与 D3 质感件），此处保留薄壳 re-export：
// city/ 各消费方（ThemeTowers/CityBlocks/CitySilhouette/Roads）import 路径零改动，
// 全城仍只有一套霓虹材质系统（Premortem P9 双材质系统禁令）。
export {
  applyNeonQuality,
  createFacadeMaterial,
  createHologramBarrierMaterial,
  createHoloSignMaterial,
  createNeonGlowMaterial,
  createSignPanelMaterial,
  createSilhouetteMaterial,
  createStreetLampMaterial,
} from '../rendering/NeonMaterials';
export type {
  FacadeMaterialOptions,
  HoloSignMaterialOptions,
  NeonGlowMaterialOptions,
  SignPanelMaterialOptions,
  SilhouetteMaterialOptions,
  StreetLampMaterialOptions,
} from '../rendering/NeonMaterials';
