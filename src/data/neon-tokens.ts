// [CC-L2-a+] 城市双主轴霓虹色 · 跨 TS/CSS 单一事实源。
// AL2-a §2 收窄条款销账：此前壳 CSS `--neon-*` 与引擎 `ROAD_NEON` 是「同值的
// 两份字面量」，技术上不构成单源——本模块起，引擎侧（Roads 路缘光/出生标记、
// NeonMaterials 窗色纪律、Reveal 仪式进度条）与壳侧（index.astro 经 <html>
// 内联 style 注入 CSS 自定义属性）全部 import 同一常量；改色只改这里。
// 谱系：品牌青 = buildings JSON agent-nexus 品牌楼 neonColor；品红 = 东西轴大街。
// （buildings JSON 的逐楼 neonColor 是独立数据面，不归本 token——楼色语义随数据走。）
export const NEON = {
  /** 南北中轴大道 · 品牌青 */
  cyan: '#49c5b6',
  /** 东西霓虹大街 · 品红 */
  magenta: '#ff2d6f',
} as const;
