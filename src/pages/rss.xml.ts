// 全站 RSS（GLB-03 / SRD §9.4）：条目 = insights ∪ ai-lab（排除 draft），
// 按 publishDate 倒序；work 更新低频不进 RSS（v1.1.1 审计 P0-4 裁决，口径 SRD §5.6/§9.4）。
// <link> 为绝对 URL（site + base 拼接）；<description> 用 frontmatter description，
// 全文不入 feed（引流回站）。
import rss, { type RSSFeedItem } from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { PERSON, SITE_NAME } from '../data/site';

export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

  const insights = await getCollection('insights', ({ data }) => !data.draft);
  const aiLab = await getCollection('ai-lab', ({ data }) => !data.draft);

  const items: RSSFeedItem[] = [
    ...insights.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: `${base}/insights/${entry.id}/`,
      categories: ['insights', entry.data.category],
    })),
    ...aiLab.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: `${base}/ai-lab/${entry.id}/`,
      categories: ['ai-lab', entry.data.stage],
    })),
  ].sort((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime());

  return rss({
    title: SITE_NAME,
    description: `${PERSON.jobTitle}——洞见与 AI 工作流实验记录（insights + ai-lab；案例更新见站内 Work 栏目）。`,
    // Astro.site 不含 base；条目 link 已带 base 前缀，feed 自身 URL 同样拼接
    site: new URL(`${base}/`, context.site).href,
    items,
    customData: '<language>zh-CN</language>',
  });
}
