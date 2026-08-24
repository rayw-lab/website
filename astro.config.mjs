// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// GitHub Pages 项目页配置（master-plan 7.4）。
// 绑定自定义域名后：site 改为正式域名，并删除 base。
export default defineConfig({
  site: 'https://rayw-lab.github.io',
  base: '/mywebsite',
  integrations: [mdx(), sitemap()],
});
