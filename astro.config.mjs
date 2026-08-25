// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import wasm from 'vite-plugin-wasm';

// world 分包命名谓词（CC-E7，G-G chunk 按 slug 命名——A3 观察⑤收敛）：
// 引擎源（src/lab/world/**）+ 薄入口（src/lab/modules/world/）+ world 专属数据
// （buildings/pois JSON）+ world 独占依赖（Rapier 物理）。三方共享库（three 系 /
// KTX2 / Draco / basis 与 car-configurator 共用）不在谓词内，保持共享 chunk 原名
// ——G-G 模块直测口径与 car-configurator 既有核算一致（共享库不重复计入单模块）。
const WORLD_CHUNK_RE =
  /src\/lab\/(?:world|modules\/world)\/|@dimforge\/rapier3d|src\/data\/(?:cyber-city-buildings|world-pois)\.json/;

// GitHub Pages 项目页配置（master-plan 7.4）。
// 绑定自定义域名后：site 改为正式域名，并删除 base。
export default defineConfig({
  site: 'https://rayw-lab.github.io',
  base: '/website',
  integrations: [
    mdx(),
    // /world-spike/ 已归档为工程验证入口（CC-E7 路由原子切换：noindex + canonical → `/`，
    // SRD §12.7.1 / 实施方案 §4.1）——从站点地图剔除；其余页面全部进 sitemap。
    sitemap({ filter: (page) => !page.includes('/world-spike/') }),
  ],
  vite: {
    // @dimforge/rapier3d 的 wasm ES 模块导入必需（source-teardown §9.3，
    // 对应 folio-2025/vite.config.js L28-30）；three/webgpu 与解码器已就绪。
    // 注：folio 还挂 vite-plugin-top-level-await，但它依赖 rollup、与
    // Astro 7 的 Vite 8（rolldown 内核）不兼容；wasm 插件产出的顶层 await
    // 改由 build.target esnext 直出——WebGPU/WebGL 2 目标浏览器全部原生支持 TLA。
    plugins: [wasm()],
    build: {
      target: 'esnext',
    },
    // G-G(world) 直测全覆盖（SRD §12.7.2 / audit-budget WORLD_RE，CC-E7）：
    // 凡含 world 域模块的浏览器 chunk 统一命名 _astro/world.<hash>.js——审计脚本
    // 按「world 词段命名」直接量测 JS 全量 ≤900KB gzip，不再漏计按需分包
    // （areas/city/HeroRobot/TransformSystem/Reveal/rapier 等，A3 观察⑤）。
    // 必须写在 client 环境级：Astro 7 的 client 构建用自有 chunkFileNames 覆盖顶层
    // rollupOptions.output，仅 environments.client…output 保持最终优先
    // （见 astro/dist/core/build/vite-build-config.js 的展开顺序）。
    environments: {
      client: {
        build: {
          rolldownOptions: {
            output: {
              chunkFileNames(chunkInfo) {
                if (chunkInfo.moduleIds?.some((id) => WORLD_CHUNK_RE.test(id))) {
                  return '_astro/world.[hash].js';
                }
                // 非 world chunk 按 Astro 默认命名（cleanChunkName 等价实现）
                return `_astro/${chunkInfo.name.replace(/[^\w.\-/]/g, '_')}.[hash].js`;
              },
            },
          },
        },
      },
    },
    optimizeDeps: {
      // dev 依赖预构建（esbuild）无法处理 wasm 导入，排除后交给 vite 插件链
      exclude: ['@dimforge/rapier3d'],
    },
  },
});
