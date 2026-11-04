// 使用说明 Markdown 原文下载：与 /lab/cost-estimator/guide/ 网页版同一份源（src/data/cost-estimator/guide.md）。
import type { APIRoute } from 'astro';
import guide from '../../../data/cost-estimator/guide.md?raw';

export const GET: APIRoute = () =>
  new Response(guide, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
