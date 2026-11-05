// 顶栏「快捷入口」：一键带入我们做过的成本项目场景（货架 + 档位 + 车型 + 区域 + 勾选），
// 链接走计算器已有的分享参数（url.ts decode），不带 ver，避免参数换版后提示过期。
// 勾选名单从发布参数里按规则现算，不手写编号：参数换版后名单自动跟着变。
import type { HeaderLink } from '../../../components/header-link';
import type { Params } from './core/types.ts';

const COUNTED = new Set(['承接', '部分承接', 'AIBOX 承载']);

interface Shortcut {
  label: string;
  title: string;
  pkg: string;
  tier: 'MAX' | 'PRO' | 'Lite';
  car: string;
  regions: string[];
  /** 'counted' = 该档位全部可承接；'phase2' = 只勾二期智能体 */
  pick: 'counted' | 'phase2';
}

const SHORTCUTS: Shortcut[] = [
  { label: 'EHV 欧盟澳新', title: '欧盟澳新包 · MAX · EHV · 欧盟+澳新 · 全选可承接', pkg: 'c3-euanz', tier: 'MAX', car: 'EHV', regions: ['eu', 'anz'], pick: 'counted' },
  { label: 'EHV 东盟', title: '东盟包 · MAX · EHV · 东盟 · 全选可承接', pkg: 'c3-sea', tier: 'MAX', car: 'EHV', regions: ['sea'], pick: 'counted' },
  { label: '欧盟二期', title: 'Carmind1.5 欧盟版 · T13C · 欧盟 · 只勾二期五个智能体', pkg: 'c15-eu', tier: 'MAX', car: 'T13C', regions: ['eu'], pick: 'phase2' },
  { label: '俄罗斯二期', title: 'Carmind1.5 俄罗斯版 · T22FL · 俄罗斯 · 只勾二期智能体', pkg: 'c15-ru', tier: 'MAX', car: 'T22FL', regions: ['ru'], pick: 'phase2' },
];

export function shortcutLinks(p: Params, toolHref: string): HeaderLink[] {
  return SHORTCUTS.filter((s) => p.packages[s.pkg as keyof Params['packages']]).map((s) => {
    const agents = p.packages[s.pkg as keyof Params['packages']].agents.filter((a) =>
      s.pick === 'phase2' ? a.layer === '二期' : COUNTED.has(a.coverage[s.tier]),
    );
    const q = new URLSearchParams({ p: s.pkg, t: s.tier, c: s.car, r: s.regions.join(','), a: agents.map((a) => a.id).join(',') });
    return { href: `${toolHref}?${q}`, label: s.label, title: s.title };
  });
}
