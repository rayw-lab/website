/**
 * 楼内展厅的头部文案（`<title>` / `<meta description>`）单源。
 *
 * 🔴 为什么独立成模块，而不是写在 `world/[slug].astro` 的 frontmatter 里：
 * Astro 的 `getStaticPaths()` **在独立作用域中求值**，frontmatter 顶层声明的常量
 * 对它不可见（实测报 `assertHallCopyClosed is not defined`，且 `astro check`
 * 零报错——这条只有 `astro build` 抓得到）。要让闭合断言在构建期真的跑，
 * 它必须是 import 进来的东西。
 */
import ledger from './nexus-ledger.json';
import { HALL_SUBTITLE } from './about-copy';

export interface HallCopy {
  title: string;
  description: string;
}

// 墨迹展厅的副题从台账派生，正文一个数字都不手写（与组件同一条纪律）。
const nx = ledger.totals as Record<string, number>;
const nxRange = ledger.range as { from: string; to: string };

/**
 * 每个展厅的头部文案必须显式登记。缺了**构建期就炸**：
 * 原代码的标题写死为 about 文案，照原样静默兜底会让新厅顶着
 * 「在技术与落地之间架桥」上线且零报错——正是「沉默的垃圾桶」形态。
 */
export const HALL_COPY: Record<string, HallCopy> = {
  'about-pavilion': { title: '在技术与落地之间架桥', description: HALL_SUBTITLE },
  'agent-nexus': {
    title: '墨迹 · Ink Ledger',
    description:
      `${nx.sessions} 次真实 AI 协作会话、${nx.days} 天、${nx.seats} 个席位，` +
      `按机器台账渲染成水墨（${nxRange.from} — ${nxRange.to}）。`,
  },
};

/**
 * 文案表与票册的**双向**闭合。
 * 🔴 只挡「有 slug 无文案」是单向的：反过来「文案表里有一个谁也不认识的键」
 * （改名后留下的孤儿、或提前写好的下一个厅）会一直静默待着，
 * 直到某天有人以为它已经接线了。异源反核（glm）点名了这一侧，补上。
 * 两个方向都在构建期抛错，不留运行期惊喜。
 */
export function assertHallCopyClosed(slugs: readonly string[]): void {
  const missing = slugs.filter((s) => !(s in HALL_COPY));
  if (missing.length > 0) {
    throw new Error(`world/[slug]：这些 slug 没有登记头部文案（见 HALL_COPY）：${missing.join(', ')}`);
  }
  const orphan = Object.keys(HALL_COPY).filter((k) => !slugs.includes(k));
  if (orphan.length > 0) {
    throw new Error(`world/[slug]：HALL_COPY 有孤儿键（world-halls.json 里没有这些 slug）：${orphan.join(', ')}`);
  }
}
