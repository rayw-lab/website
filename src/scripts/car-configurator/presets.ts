// 车漆 / 轮毂 / 涂装预设数据。
// 同时被 Astro 页面（构建期静态渲染色卡）与 3D 引擎模块（运行时应用材质）导入，
// 保证 UI 与渲染使用同一份数据源。

export type PaintFinish = 'metallic' | 'matte' | 'pearl';

export interface PaintPreset {
  id: string;
  name: string;
  /** 3D 材质基础色（sRGB hex） */
  color: string;
  /** UI 色卡展示色（通常与 color 一致，深色漆可略提亮以便识别） */
  swatch: string;
  finish: PaintFinish;
}

export const FINISH_LABELS: Record<PaintFinish, string> = {
  metallic: '金属',
  matte: '哑光',
  pearl: '珠光',
};

/** 各漆面类型的 PBR 参数（作用于 MeshPhysicalMaterial） */
export const FINISH_PARAMS: Record<
  PaintFinish,
  {
    metalness: number;
    roughness: number;
    clearcoat: number;
    clearcoatRoughness: number;
    iridescence: number;
  }
> = {
  metallic: { metalness: 1, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06, iridescence: 0 },
  matte: { metalness: 0.4, roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.5, iridescence: 0 },
  pearl: { metalness: 0.65, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: 0.6 },
};

/** 主车身（Paint 1 分区）自定义车漆，8 色 */
export const PAINTS: PaintPreset[] = [
  { id: 'obsidian', name: '曜石黑', color: '#0b0b0d', swatch: '#17171a', finish: 'metallic' },
  { id: 'moonlight', name: '月光白', color: '#e9eaec', swatch: '#e9eaec', finish: 'pearl' },
  { id: 'titanium', name: '钛灰', color: '#8f959c', swatch: '#8f959c', finish: 'metallic' },
  { id: 'graphene', name: '石墨', color: '#3c4046', swatch: '#3c4046', finish: 'matte' },
  { id: 'crimson', name: '熔岩红', color: '#7d1020', swatch: '#8d1424', finish: 'metallic' },
  { id: 'abyss', name: '深海蓝', color: '#1c3f73', swatch: '#1c3f73', finish: 'metallic' },
  { id: 'forest', name: '竞速绿', color: '#1b4534', swatch: '#1b4534', finish: 'metallic' },
  { id: 'amber', name: '落日橙', color: '#c05a1e', swatch: '#c05a1e', finish: 'metallic' },
];

export interface WheelPreset {
  id: string;
  name: string;
  desc: string;
  /** UI 预览用的轮辋主色 */
  swatch: string;
}

/** 轮毂饰面（作用于模型的 Rim1 / Rim2 材质槽） */
export const WHEELS: WheelPreset[] = [
  { id: 'machined', name: '双色机加工', desc: '亮银切削面 × 曜黑辐条（原厂）', swatch: '#c9ccd2' },
  { id: 'stealth', name: '曜黑竞速', desc: '枪灰色低反射涂层', swatch: '#26282c' },
];

export interface LiveryPreset {
  id: string;
  /** 对应 glTF KHR_materials_variants 中的变体名 */
  variantName: string;
  name: string;
  desc: string;
  /** UI 预览的双色组合：[主漆色, 饰板色] */
  chips: [string, string];
}

/** 预设涂装：模型内置的 3 套官方材质变体（双色车身 + 内饰联动） */
export const LIVERIES: LiveryPreset[] = [
  {
    id: 'carmine',
    variantName: 'Carmine Candy',
    name: '糖果胭脂',
    desc: '高清漆糖果红车身 × 曜黑饰板',
    chips: ['#a01020', '#151517'],
  },
  {
    id: 'pearly',
    variantName: 'Pearly Swirly',
    name: '幻彩珠光',
    desc: '虹彩珠光车身 × 银灰饰板',
    chips: ['#d6d8dc', '#7c8390'],
  },
  {
    id: 'graphite',
    variantName: 'Torched Graphite',
    name: '炙烤石墨',
    desc: '石墨灰车身 × 虹彩饰板',
    chips: ['#2f3033', '#565b63'],
  },
];

export type SectionId = 'paint' | 'wheels' | 'livery';

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'paint', label: '车漆' },
  { id: 'wheels', label: '轮毂' },
  { id: 'livery', label: '涂装' },
];

export interface ConfiguratorState {
  livery: string;
  /** 'livery' 表示跟随涂装原厂漆，否则为 PaintPreset.id */
  paint: string;
  wheels: string;
}

export const DEFAULT_STATE: ConfiguratorState = {
  livery: 'carmine',
  paint: 'livery',
  wheels: 'machined',
};
