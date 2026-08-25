// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import wasm from 'vite-plugin-wasm';

// GitHub Pages 项目页配置（master-plan 7.4）。
// 绑定自定义域名后：site 改为正式域名，并删除 base。
export default defineConfig({
  site: 'https://rayw-lab.github.io',
  base: '/website',
  integrations: [
    mdx(),
    // /world-spike/ 已转公开路由（index,follow），全站页面进 sitemap 无需过滤
    sitemap(),
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
    optimizeDeps: {
      // dev 依赖预构建（esbuild）无法处理 wasm 导入，排除后交给 vite 插件链
      exclude: ['@dimforge/rapier3d'],
    },
  },
});
