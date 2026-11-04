// LAB RC-01 成本粗估 · 界面层：从 C3 原型移植的货架拼装台。
// 数据全部来自 Params / Result（core/compute.ts）；状态与撤销在 state.ts；分享链接在 url.ts；
// Excel 在 xlsx.ts（下载时才动态加载）。界面关键元素带 data-ce 属性供 e2e 使用。
import './ui.css';
import type { LabInstance, LabMountOptions } from '../../contracts';
import type { Agent, Params, PackageId, RegionId, Result, RowResult, Selection, Tier } from './core/types';
import { compute } from './core/compute';
import { createStore } from './state';
import { decode, encode, recall, remember } from './url';
import { createFx, type Fx } from './fx';

type Motion = 0 | 1 | 2; // 完整 / 精简 / 关闭
const TIERS: Tier[] = ['MAX', 'PRO', 'Lite'];
const PKGS: PackageId[] = ['c3-euanz', 'c3-sea', 'c15-eu', 'c15-ru'];
const REGION_ORDER: RegionId[] = ['eu', 'anz', 'ru', 'sea', 'me', 'za', 'latam', 'ca', 'eul'];
const COUNTED = new Set(['承接', '部分承接', 'AIBOX 承载']);
const KIND_TXT: Record<RowResult['kind'], string> = { first: '首发', ext: '横展', fused: '融合', delivered: '已交付' };
const KIND_VAR: Record<RowResult['kind'], [string, string]> = {
  first: ['var(--first)', 'var(--first-soft)'], ext: ['var(--ext)', 'var(--ext-soft)'],
  fused: ['var(--fuse)', 'var(--fuse-soft)'], delivered: ['var(--done)', 'var(--done-soft)'],
};
const STEPS: { key: StepKey; name: string; color: string }[] = [
  { key: 'research', name: '研究院', color: 'var(--first)' },
  { key: 'product', name: '产研', color: 'var(--first2)' },
  { key: 'delivery', name: '五职能', color: 'var(--ext)' },
  { key: 'langFirst', name: '语种首发', color: 'var(--g1)' },
  { key: 'voiceLang', name: '基础语音语种费', color: 'var(--g2)' },
  { key: 'direct', name: '直接费用', color: 'var(--g3)' },
];

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
const wan = (v: number | null | undefined) => (v == null ? '待补' : `${v.toFixed(2)} 万`);
const num = (v: number | null | undefined) => v ?? 0;
// 一行已知部分的金额：合计待补时仍要算进高亮、明细和人月
const known = (r: RowResult) => num(r.research) + num(r.product) + num(r.delivery) + num(r.direct);
type StepKey = 'research' | 'product' | 'delivery' | 'langFirst' | 'voiceLang' | 'direct';
const yuan = (v: number) => v.toFixed(1);
// 新语种的首发语系权重（锚点 1.0 / 同族 0.5），由核心给出
const fw = (l: object) => (l as { firstW?: number | null }).firstW ?? null;

export function createCostEstimator(opts: LabMountOptions, p: Params): LabInstance {
  const mountEl = (opts.host.querySelector('[data-ce-root]') as HTMLElement | null) ?? opts.host;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const MOB = matchMedia('(max-width: 760px)');
  let motion: Motion = RM.matches ? 2 : 0;
  let pkgPicked = false;
  let lastTotal: number | null = null;
  let lastPkg: PackageId | null = null;
  let justAdded: string | null = null;
  const cmp: Partial<Record<'A' | 'B', { sel: Selection; r: Result; desc: string }>> = {};
  const cleanups: (() => void)[] = [];

  // ---------- 初始状态：链接 > 本地记忆 > 默认 ----------
  const fromUrl = decode(opts.params.toString(), p);
  const hasUrl = Object.keys(fromUrl.sel).length > 0;
  const remembered = hasUrl ? null : recall();
  const store = createStore(p, hasUrl ? fromUrl.sel : remembered ?? undefined);
  pkgPicked = hasUrl || !!remembered;

  // ---------- 骨架 ----------
  const root = document.createElement('div');
  root.className = 'ce';
  root.dataset.ce = 'root';
  root.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="ce-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"/></filter>
      <filter id="ce-rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter></svg>
    <div class="ce-ink" aria-hidden="true"><i></i><svg preserveAspectRatio="none" viewBox="0 0 1200 720"><filter id="ce-fiber" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.11" numOctaves="2" seed="17"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .16 0"/></filter><rect width="1200" height="720" filter="url(#ce-fiber)"/></svg></div>
    <div class="ce-top"><span class="ce-orb"></span><h2>多语种座舱大模型 · 成本粗估</h2><span class="ce-ver">参数 ${esc(p.version)} 版</span>
      <div class="r"><div class="ce-mo"><span>动效</span><div class="ce-seg sm" data-ce="motion"><span class="pill"></span></div></div><span class="ce-warn">成本粗估，不是报价</span></div></div>
    <div class="ce-guide" data-ce="guide"></div>
    <div class="ce-cfg">
      <div class="ce-grp" data-g="pkg"><div class="h">① 货架 / SOR 包</div><div class="ce-seg" data-ce="pkg"><span class="pill"></span></div></div>
      <div class="ce-grp" data-g="tier"><div class="h">档位</div><div class="ce-seg" data-ce="tier"><span class="pill"></span></div></div>
      <div class="ce-grp" data-g="car"><div class="h">② 车型</div><div class="ce-car"><input data-ce="car" list="ce-cars" placeholder="选择或输入新车型" aria-label="车型"><datalist id="ce-cars"></datalist><small data-ce="car-note"></small></div></div>
      <div class="ce-grp" data-g="region"><div class="h">③ 区域（多选 · 语种自动去重）</div><div class="ce-chips" data-ce="regions"></div></div>
      <div class="ce-grp" data-g="lang"><div class="h">语种（点一下剔除）<button class="ce-lnk" data-ce="why-lang" type="button">折算怎么算？</button></div><div class="ce-langs" data-ce="langs"></div></div>
      <div class="ce-grp"><div class="h">开关</div><div class="ce-adv">
        <label><input type="checkbox" data-ce="per-market"> 分市场验收</label>
        <label><input type="checkbox" data-ce="sys-switch"> 系统方切换适配</label></div></div>
    </div>
    <div class="ce-hint" data-ce="hint" hidden></div>
    <div class="ce-main">
      <aside class="ce-ours"><div class="ce-ttl">我方能力 · 交付情况</div><div data-ce="ours"></div></aside>
      <section class="ce-shelf" data-ce="shelf"><svg class="ce-links" data-ce="links"></svg>
        <div class="ce-presets"><span class="ce-ttl">一键勾选</span><span data-ce="presets"></span></div>
        <div data-ce="lanes"></div></section>
      <aside class="ce-res" data-ce="res">
        <button class="ce-tray" type="button" data-ce="tray"><span><span class="t2">NRE 成本 · 万元</span><b data-ce="tray-v">—</b></span><span class="t2" data-ce="tray-l"></span><span class="go" data-ce="tray-go">明细 ▲</span></button>
        <div class="ce-halo" data-ce="halo"><div class="ce-lbl">NRE 成本 · 万元</div><div class="ce-odo" data-ce="total"></div><div class="ce-delta" data-ce="delta"></div><button type="button" class="ce-pend" data-ce="pending" hidden></button><div class="ce-sub" data-ce="sub"></div>
          <svg class="ce-seal" data-ce="seal" viewBox="0 0 64 64" aria-hidden="true"><g filter="url(#ce-rough)"><rect x="3" y="3" width="58" height="58" rx="5" fill="none" stroke="var(--first)" stroke-width="3.2"/><line x1="32" y1="7" x2="32" y2="57" stroke="var(--first)" stroke-width="1.2" opacity=".5"/><g fill="var(--first)" font-family="Songti SC,STSong,Source Han Serif SC,Noto Serif SC,serif" font-weight="900" font-size="22" text-anchor="middle"><text x="46" y="29">成</text><text x="46" y="53">本</text><text x="18" y="29">粗</text><text x="18" y="53">估</text></g></g></svg></div>
        <div class="ce-acts"><button class="ce-shim" type="button" data-ce="download">下载 Excel（带公式）</button><button class="ce-btn ce-copy" type="button" data-ce="copy-link">复制链接</button></div>
        <div class="ce-wfh ce-lbl">成本怎么堆起来的 · 点柱子看算式</div>
        <div class="ce-wf" data-ce="wf"></div><div class="ce-wfl" data-ce="wfl"></div>
        <div class="ce-cnt" data-ce="cnt"></div>
        <div class="ce-box ce-top3"><div class="ce-lbl">最贵的三项</div><ol data-ce="top3"></ol></div>
        <div class="ce-box ce-lic" data-ce="lic"><div class="row"><span class="ce-lbl">LIC · 元/车/三年</span><b data-ce="lic-v">—</b></div>
          <div class="ce-seg sm" data-ce="lic-voice" style="margin-top:6px"><span class="pill"></span></div>
          <div class="parts" data-ce="lic-parts"></div>
          <div class="ce-sl" data-ce="sl-a"><span>日活跃率</span><input type="range" min="15" max="80" step="5" data-ce="lic-active" aria-label="日活跃率"><output></output></div>
          <div class="ce-sl" data-ce="sl-c"><span>每天次数</span><input type="range" min="5" max="30" step="1" data-ce="lic-calls" aria-label="每天次数"><output></output></div>
          <div style="text-align:right;margin-top:4px"><button class="ce-lnk" type="button" data-ce="lic-reset">恢复默认</button></div></div>
        <div class="ce-box ce-cmp" data-ce="cmp"><div class="ce-lbl">两套方案对比</div><div class="btns"><button class="ce-btn" type="button" data-ce="save-a">存为方案 A</button><button class="ce-btn" type="button" data-ce="save-b">存为方案 B</button></div><div data-ce="cmp-t"></div></div>
      </aside>
    </div>
    <div class="ce-scrim" data-ce="scrim"></div>
    <aside class="ce-drawer" data-ce="drawer" aria-hidden="true" role="dialog" aria-label="算式说明"><header><h3 data-ce="d-title"></h3><button type="button" data-ce="d-close" aria-label="关闭">×</button></header><div class="body" data-ce="d-body"></div></aside>
    <div class="ce-hud" data-ce="hud" role="status"><span class="msg" data-ce="hud-msg"></span><button type="button" data-ce="undo">撤销<kbd>⌘Z</kbd></button></div>
    <div class="ce-toast" data-ce="toast" role="status"></div>`;
  mountEl.appendChild(root);
  const $ = <T extends Element = HTMLElement>(k: string) => root.querySelector(`[data-ce="${k}"]`) as T;
  const fx: Fx = createFx(root);

  // ---------- 小工具 ----------
  const toastEl = $('toast');
  let toastT = 0;
  // 计算器所在层叠上下文低于站点顶栏（sticky, z-index 50）：浮层一律从顶栏底边往下排，避免被盖住
  const syncHeader = () => { const hb = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0; root.style.setProperty('--ce-hdr', `${Math.max(0, Math.round(hb))}px`); };
  const toast = (m: string) => { syncHeader(); toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = window.setTimeout(() => toastEl.classList.remove('on'), 2400); };
  const pkg = () => p.packages[store.get().pkg];
  const tierOf = (s: Selection): Tier => (p.packages[s.pkg].tiers ? s.tier : 'MAX');
  const covOf = (a: Agent, s: Selection) => a.coverage[tierOf(s)];
  const availIds = (s: Selection) => p.packages[s.pkg].agents.filter((a) => COUNTED.has(covOf(a, s))).map((a) => a.id);
  const ready = (s: Selection) => pkgPicked && s.car.trim() !== '' && s.regions.length > 0;
  const deliveredCaps = new Set(p.cars.flatMap((c) => c.delivered.flatMap((d) => d.caps)));
  // 能力中文名来自总表「能力」表（params.capNames）；缺名时退回编号，避免空白
  const capName = (c: string) => p.capNames[c] ?? c;
  const capWhere = (c: string) => p.cars.flatMap((car) => car.delivered.filter((d) => d.caps.includes(c)).map((d) => `${car.name} ${p.regions[d.region].name}`));

  const act = (label: string, fn: (s: Selection) => void) => {
    try { store.apply(label, fn); } catch (e) {
      toast(e instanceof Error && e.name === 'LastLanguageError' ? '至少保留一个语种' : `操作没有生效：${e instanceof Error ? e.message : e}`);
    }
  };

  const seg = (el: HTMLElement, items: string[], cur: number, on: (i: number) => void, key?: string) => {
    el.querySelectorAll('button').forEach((b) => b.remove());
    items.forEach((t, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', String(i === cur));
      if (key) b.dataset.v = key + i;
      b.onclick = () => { if (i !== cur) on(i); };
      el.appendChild(b);
    });
    el.classList.toggle('has', cur >= 0);
    requestAnimationFrame(() => {
      const o = el.querySelectorAll('button')[cur] as HTMLElement | undefined;
      const pill = el.querySelector('.pill') as HTMLElement;
      if (!o) return;
      pill.style.width = `${o.offsetWidth}px`;
      pill.style.height = `${o.offsetHeight}px`;
      pill.style.transform = `translate(${o.offsetLeft - 3}px, ${o.offsetTop - 3}px)`;
    });
  };

  // ---------- 机械数字 ----------
  const odo = (v: number | null) => {
    const el = $('total');
    if (v == null) { el.className = 'ce-odo idle'; el.dataset.len = ''; el.textContent = '选完包、车型、区域后出数'; el.dataset.value = ''; return; }
    el.dataset.value = v.toFixed(2);
    const s = v.toFixed(2).padStart(7, ' ');
    if (el.dataset.len !== String(s.length) || el.classList.contains('idle')) {
      el.className = 'ce-odo'; el.innerHTML = ''; el.dataset.len = String(s.length);
      for (const ch of s) el.insertAdjacentHTML('beforeend', ch === '.' ? '<span class="dot">.</span>' : `<div class="c">${' 0123456789'.split('').map((d) => `<span>${d === ' ' ? '&nbsp;' : d}</span>`).join('')}</div>`);
      el.insertAdjacentHTML('beforeend', '<span class="u">万</span>');
      el.setAttribute('aria-label', `${v.toFixed(2)} 万元`);
    }
    el.setAttribute('aria-label', `${v.toFixed(2)} 万元`);
    const cols = [...el.querySelectorAll<HTMLElement>('.c')];
    let ci = 0;
    for (const ch of s) {
      if (ch === '.') continue;
      const c = cols[ci++];
      c.style.transitionDelay = `${ci * 35}ms`;
      c.style.transform = `translateY(${-52 * (ch === ' ' ? 0 : +ch + 1)}px)`;
    }
  };
  const halo = () => {
    if (motion === 2) return;
    const h = $('halo');
    h.classList.remove('beam', 'glow'); void h.offsetWidth; h.classList.add('glow');
    if (motion === 0) h.classList.add('beam');
    window.setTimeout(() => h.classList.remove('glow', 'beam'), 1300);
  };

  // ---------- 渲染 ----------
  let view: Map<string, RowResult> = new Map();
  let result: Result;

  const render = (label?: string) => {
    const s = store.get();
    root.classList.toggle('m-lite', motion === 1);
    root.classList.toggle('m-off', motion === 2);
    root.classList.toggle('idle', !ready(s));
    const P = p.packages[s.pkg];
    const isReady = ready(s);
    result = compute(p, s);
    // 卡片视图：把所有智能体当作已勾选算一遍，拿每张卡自己的首发 / 横展与人月
    view = new Map(compute(p, { ...s, agents: P.agents.map((a) => a.id) }).rows.map((r) => [r.id, r]));

    // 引导
    const steps = [['选包', pkgPicked], ['选车型', s.car.trim() !== ''], ['选区域', s.regions.length > 0]] as const;
    const g = $('guide');
    g.hidden = isReady;
    const nextIdx = steps.findIndex((x) => !x[1]);
    g.innerHTML = steps.map(([t, ok], i) => `<span class="${ok ? 'ok' : i === nextIdx ? 'on' : ''}"><b>${ok ? '✓' : i + 1}</b>${t}</span>${i < 2 ? '<i>→</i>' : ''}`).join('') + '<span style="margin-left:auto">三步选完出总价；智能体默认一个不勾</span>';
    root.querySelectorAll<HTMLElement>('.ce-grp[data-g]').forEach((el) => el.classList.toggle('hot', !isReady && el.dataset.g === ['pkg', 'car', 'region'][nextIdx]));

    // 顶栏动效
    seg($('motion'), ['完整', '精简', '关闭'], motion, (i) => { motion = i as Motion; render(); toast(['动效：完整', '动效：精简（保留过渡，关掉粒子和流光）', '动效：关闭'][i]); }, 'm');
    // 包 / 档位
    seg($('pkg'), PKGS.map((k) => p.packages[k].name), pkgPicked ? PKGS.indexOf(s.pkg) : -1, (i) => {
      pkgPicked = true;
      if (PKGS[i] === s.pkg) { render(); return; }
      act(`切到 ${p.packages[PKGS[i]].name}`, (x) => { x.pkg = PKGS[i]; x.agents = []; });
    }, 'p');
    (root.querySelector('[data-g="tier"]') as HTMLElement).hidden = !P.tiers;
    seg($('tier'), TIERS, TIERS.indexOf(s.tier), (i) => act(`档位改为 ${TIERS[i]}`, (x) => { x.tier = TIERS[i]; }), 't');
    // 车型
    const carIn = $<HTMLInputElement>('car');
    if (document.activeElement !== carIn) carIn.value = s.car;
    (root.querySelector('#ce-cars') as HTMLElement).innerHTML = p.cars.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    const car = p.cars.find((c) => c.id === s.car);
    $('car-note').textContent = !s.car ? '' : car ? (car.delivered.length ? `已交付：${car.delivered.map((d) => p.regions[d.region].name).join('、')}` : '评估中，无交付记录') : '新车型：无交付记录';
    // 区域
    $('regions').innerHTML = REGION_ORDER.map((k) => {
      const r = p.regions[k];
      return `<button type="button" class="ce-rg" data-ce="region" data-id="${k}" aria-pressed="${s.regions.includes(k)}" title="${esc(r.langs.map((l) => p.langs[l]?.name ?? l).join('、'))}"><i></i>${esc(r.name)}<small>${r.langs.length} 语种</small></button>`;
    }).join('');
    // 语种
    $('langs').innerHTML = result.langs.length
      ? result.langs.map((l) => `<button type="button" class="ce-lg ${l.off ? 'off' : l.isNew ? 'new' : l.weight === 1 ? 'w1' : 'w05'}" data-ce="lang" data-id="${esc(l.id)}" aria-pressed="${!l.off}" title="${esc(l.why)}">${esc(l.name)}<b>${l.off ? '—' : l.isNew ? `新${fw(l) != null ? '·' + fw(l)!.toFixed(1) : ''}` : l.weight === 1 ? '1.0' : '0.5'}</b></button>`).join('')
      : '<span class="ce-empty">先选区域</span>';
    $<HTMLInputElement>('per-market').checked = s.perMarket;
    $<HTMLInputElement>('sys-switch').checked = s.systemSwitch;
    // 包外区域提示
    const target = REGION_ORDER.filter((k) => p.regions[k].pkgHint?.includes(s.pkg));
    const outside = s.regions.filter((k) => target.length && !target.includes(k));
    const hint = $('hint');
    hint.hidden = !(pkgPicked && outside.length);
    hint.textContent = `该包的 SOR 针对${target.map((k) => p.regions[k].name).join('、')}；${outside.map((k) => p.regions[k].name).join('、')}按同一份货架估算，仅供参考。`;

    // 我方能力
    const caps = [...new Set(P.agents.flatMap((a) => a.caps))];
    $('ours').innerHTML = !pkgPicked ? '<span class="ce-empty">选包后列出包里用到的我方能力</span>'
      : caps.length ? caps.map((c) => { const w = capWhere(c); return `<div class="ce-ab ${w.length ? 'done' : ''}" data-cap="${esc(c)}" title="${esc(w.length ? `已交付：${w.join('、')}` : '还没在任何车型交付过')}"><span>${esc(capName(c))}</span><small>${w.length ? esc(w.join('、')) : '未交付'}</small></div>`; }).join('') : '<span class="ce-empty">该包没有对应能力</span>';

    // 一键勾选
    const av = availIds(s);
    const presets: [string, string[]][] = [
      ['全选可承接', av],
      ['只看首发', av.filter((id) => view.get(id)?.kind === 'first')],
      ['只看沿用我方能力', av.filter((id) => (P.agents.find((a) => a.id === id)?.caps.length ?? 0) > 0)],
      ['清空', []],
    ];
    $('presets').innerHTML = presets.map(([n, l], j) => `<button type="button" class="ce-btn ce-pb" data-ce="preset" data-j="${j}">${n}<em>${l.length}</em></button> `).join('');
    $('presets').querySelectorAll<HTMLElement>('button').forEach((b) => { b.onclick = () => { const [n, l] = presets[+b.dataset.j!]; act(`一键：${n}`, (x) => { x.agents = [...l]; if (!l.length) x.hidden = []; }); }; });

    // 货架（FLIP：记旧位置）
    const pkgChanged = lastPkg !== s.pkg;
    const before = new Map<string, DOMRect>();
    if (!pkgChanged) root.querySelectorAll<HTMLElement>('.ce-card').forEach((c) => before.set(c.dataset.id!, c.getBoundingClientRect()));
    const lanes = $('lanes');
    lanes.innerHTML = '';
    ($('presets').parentElement as HTMLElement).hidden = !pkgPicked;
    if (!pkgPicked) lanes.innerHTML = `<div class="ce-shelf-empty"><b>先选一个货架包</b><span>${PKGS.map((k) => esc(p.packages[k].name)).join(' · ')}</span><small>选包后这里列出包里的全部智能体，按「基础语音 / 端侧 / 云端」分层；智能体默认一个不勾。</small></div>`;
    let gi = 0;
    const rank = (a: Agent) => { const c = covOf(a, s); return c === '不承接' ? 1 : c === '待评估' ? 2 : 0; };
    for (const layer of pkgPicked ? P.layers : []) {
      const items = P.agents.map((a, i) => [a, i] as const).filter(([a]) => a.layer === layer).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]);
      if (!items.length) continue;
      const lane = document.createElement('div');
      lane.className = 'ce-lane';
      lane.innerHTML = `<div class="ce-ttl">${esc(layer)}<em>${items.length}</em></div><div class="ce-cards"></div>`;
      const box = lane.lastElementChild as HTMLElement;
      for (const [a] of items) box.appendChild(card(a, s, gi++, pkgChanged));
      lanes.appendChild(lane);
    }
    if (!pkgChanged && motion < 2) {
      root.querySelectorAll<HTMLElement>('.ce-card').forEach((c) => {
        const o = before.get(c.dataset.id!); if (!o) return;
        const n = c.getBoundingClientRect(); const dx = o.left - n.left, dy = o.top - n.top;
        if (Math.abs(dx) + Math.abs(dy) < 1) return;
        c.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.9,.25,1)' });
      });
    }
    lastPkg = s.pkg;

    // 结果
    const total = isReady ? result.nre.known : null;
    const pendSteps = STEPS.filter((x) => (result.nre.pending?.[x.key]?.length ?? 0) > 0);
    odo(total);
    const pendBtn = $('pending');
    pendBtn.hidden = !isReady || !pendSteps.length;
    const pendN = pendSteps.reduce((a, x) => a + result.nre.pending![x.key]!.length, 0);
    pendBtn.textContent = `+ 待补 ${pendN} 项（${pendSteps.map((x) => x.name).join('、')}）· 查看缺什么 ›`;
    $('tray-v').textContent = total == null ? '—' : `${total.toFixed(2)}${pendSteps.length ? ' + 待补' : ''}`;
    const licPend = result.lic.pendingRegions.length > 0 || (result.lic.pendingAgents?.length ?? 0) > 0;
    const licTxt = licPend ? `${yuan(result.lic.known)} + 待补` : yuan(result.lic.known);
    $('tray-l').textContent = isReady ? `LIC ${licTxt} 元` : '';
    if (total != null && lastTotal != null && Math.abs(total - lastTotal) > 0.005) {
      const d = total - lastTotal;
      $('delta').innerHTML = `<span class="${d > 0 ? 'up' : 'dn'}">${d > 0 ? '+' : '−'} ${Math.abs(d).toFixed(2)} 万</span><em style="font-style:normal;color:var(--ink3)">较上一步</em>`;
      halo();
    } else if (total == null) $('delta').innerHTML = '';
    lastTotal = total;
    const pm = result.rows.filter((r) => known(r) > 0).reduce((a, r) => a + num(r.pm), 0);
    $('sub').textContent = isReady ? `≈ ${pm.toFixed(1)} 人月 · ${P.tiers ? `${s.tier} · ` : ''}${result.langs.filter((l) => !l.off).length} 语种（${result.newLangs.length} 个新）· 等效 ${result.eq.toFixed(1)}` : '';
    waterfall(isReady);
    // 计数按卡片类型算：「待补」是缺数据，「不计入」是不承接 / 待评估 / 已交付，两件事分开
    const selRows = result.rows.filter((r) => s.agents.includes(r.id));
    const byKind = (k: RowResult['kind']) => selRows.filter((r) => r.kind === k && COUNTED.has(covOf(agentOf(r.id)!, s))).length;
    const pendRows = selRows.filter((r) => r.pending.length > 0).length;
    const outN = P.agents.filter((a) => !COUNTED.has(covOf(a, s)) || view.get(a.id)?.kind === 'delivered').length;
    $('cnt').innerHTML = ([['f', '首发', byKind('first'), '已勾选'], ['x', '横展', byKind('ext'), '已勾选'], ['u', '融合', byKind('fused'), '已勾选'], ['tbd', '含待补', pendRows, '已勾选里缺底数的'], ['no', '不计入', outN, '本包里不承接、待评估或已交付的']] as const).map(([k, n, v, t]) => `<div class="${k}" title="${t}"><b>${v}</b><span>${n}</span></div>`).join('');
    const top = result.rows.filter((r) => known(r) > 0).sort((x, y) => known(y) - known(x)).slice(0, 3);
    const mx = (top[0] ? known(top[0]) : 0) || 1;
    $('top3').innerHTML = top.length && isReady
      ? top.map((r, j) => `<li><button type="button" data-id="${esc(r.id)}"><span class="rk">${j + 1}</span><span><span class="nm">${esc(agentOf(r.id)?.name)}</span><span class="bar" style="display:block;width:${(known(r) / mx) * 100}%;background:${KIND_VAR[r.kind][0]}"></span></span><span class="v">${r.sum == null ? `${known(r).toFixed(1)} 万<em class="tbd"> + 待补</em>` : `${r.sum.toFixed(1)} 万`}</span></button></li>`).join('')
      : '<li class="empty">还没勾选智能体</li>';
    $('top3').querySelectorAll<HTMLElement>('button[data-id]').forEach((b) => { b.onclick = () => openCard(b.dataset.id!); });
    // LIC
    const L = result.lic;
    $('lic-v').textContent = isReady ? licTxt : '—';
    seg($('lic-voice'), [`在线 ${p.lic.voiceOnline}`, `离线 ${p.lic.voiceOffline}`], s.voice === 'online' ? 0 : 1, (i) => act(`基础语音改为${i ? '离线' : '在线'}`, (x) => { x.voice = i ? 'offline' : 'online'; }), 'v');
    // 每项显示已知部分；缺数的项后面标「+ 待补」（与 NRE 各级同一口径）
    const Lx = L as typeof L & { pendingSource?: RegionId[]; pendingServer?: RegionId[] };
    const pv = (v: number | null, pend: boolean) => (v == null ? '<span class="tbd">待补</span>' : `${yuan(v)}${pend ? ' <span class="tbd">+ 待补</span>' : ''}`);
    const pSrc = Lx.pendingSource ?? s.regions.filter((k) => p.regions[k].sourcePerCar == null);
    const pSrv = Lx.pendingServer ?? s.regions.filter((k) => p.regions[k].serverPerCar == null);
    $('lic-parts').innerHTML = `<span>基础语音（${s.voice === 'online' ? '在线' : '离线'} · 固定项）</span><span>${yuan(L.voice)}</span><span>信源分摊</span><span>${pv(L.source, pSrc.length > 0)}</span><span>token 分摊</span><span>${pv(L.token, (L.pendingAgents?.length ?? 0) > 0)}</span><span>服务器扩容分摊</span><span>${pv(L.server, pSrv.length > 0)}</span>${pSrc.length ? `<span class="note">缺信源单价：${pSrc.map((k) => p.regions[k].name).join('、')}</span>` : ''}${pSrv.length ? `<span class="note">缺服务器扩容分摊：${pSrv.map((k) => p.regions[k].name).join('、')}</span>` : ''}${L.pendingAgents?.length ? `<span class="note">${L.pendingAgents.length} 个智能体缺 token 基准，未计入</span>` : ''}`;
    const sa = $<HTMLInputElement>('lic-active'), sc = $<HTMLInputElement>('lic-calls');
    sa.value = String(Math.round(s.activeRate * 100)); sc.value = String(s.dailyCalls);
    ($('sl-a').querySelector('output') as HTMLElement).textContent = `${Math.round(s.activeRate * 100)}%`;
    ($('sl-c').querySelector('output') as HTMLElement).textContent = `${s.dailyCalls} 次`;
    $('sl-a').classList.toggle('chg', Math.abs(s.activeRate - p.lic.activeRate) > 1e-9);
    $('sl-c').classList.toggle('chg', s.dailyCalls !== p.lic.dailyCalls);
    renderCmp();
    ($('download') as HTMLButtonElement).disabled = !isReady;
    ($('copy-link') as HTMLButtonElement).disabled = !isReady;
    if (label) hud(label);
    if (isReady) remember(s);
  };

  const agentOf = (id: string) => pkg().agents.find((a) => a.id === id);

  const card = (a: Agent, s: Selection, i: number, rise: boolean) => {
    const cov = covOf(a, s);
    const row = view.get(a.id);
    const kind = row?.kind ?? 'first';
    const sel = s.agents.includes(a.id);
    const countable = COUNTED.has(cov) && kind !== 'delivered';
    const d = document.createElement('div');
    const cls = ['ce-card'];
    if (cov === '部分承接') cls.push('part');
    if (cov === '不承接') cls.push('no');
    if (cov === '待评估') cls.push('tbd');
    if (kind === 'delivered') cls.push('done');
    if (countable && !sel) cls.push('unsel');
    if (sel && justAdded === a.id && motion === 0) cls.push('beam');
    if (rise && motion < 2) cls.push('rise');
    d.className = cls.join(' ');
    d.dataset.ce = 'card'; d.dataset.id = a.id; d.dataset.kind = kind; d.dataset.cov = cov;
    d.setAttribute('role', 'checkbox'); d.setAttribute('aria-checked', String(sel && countable)); d.tabIndex = countable ? 0 : -1;
    d.style.setProperty('--sc', KIND_VAR[kind][0]); d.style.setProperty('--sc-soft', KIND_VAR[kind][1]); d.style.setProperty('--i', String(i));
    const covTxt = cov === '不承接' ? '不承接' : cov === '待评估' ? '待评估' : kind === 'delivered' ? '已交付，不计入' : cov === '承接' ? '承接' : `承接 <span class="cov">· ${esc(cov)}</span>`;
    const pmTxt = !COUNTED.has(cov) || kind === 'delivered' ? '—' : row?.pm == null ? '待补' : row.pm > 0 ? `${row.pm.toFixed(1)} 人月` : '0 人月';
    d.innerHTML = `<span class="stripe"></span><span class="ck"></span><span class="nm">${esc(a.name)}</span>`
      + `<button type="button" class="tag ${row?.manual ? 'man' : ''}" data-ce="card-tag" title="点一下切换首发 / 横展（手改）">${KIND_TXT[kind]}</button>`
      + `<span class="st">${covTxt}${a.caps.length ? ` <span class="from">← ${a.caps.map((c) => esc(capName(c))).join(' + ')}</span>` : ''}</span>`
      + `<button type="button" class="pm ${COUNTED.has(cov) && row ? 'i' : ''}" data-ce="card-pm">${pmTxt}</button>`;
    d.onpointermove = (e) => { const b = d.getBoundingClientRect(); d.style.setProperty('--mx', `${e.clientX - b.left}px`); d.style.setProperty('--my', `${e.clientY - b.top}px`); };
    d.onmouseenter = () => hover(a, d, kind);
    d.onmouseleave = () => hover(null, d, kind);
    const toggle = (e?: MouseEvent) => {
      if (!countable) { toast(cov === '待评估' ? '待评估：成本另行评估，不计入合计' : cov === '不承接' ? '不承接：不计入合计' : '该能力在这台车型已交付，不计入'); return; }
      const add = !sel;
      justAdded = add ? a.id : null;
      act(`${add ? '勾选' : '取消'} ${a.name}`, (x) => { x.agents = add ? [...x.agents, a.id] : x.agents.filter((y) => y !== a.id); });
      if (e && motion === 0 && !MOB.matches) {
        fx.spark(e.clientX, e.clientY, getComputedStyle(root).getPropertyValue(kind === 'ext' ? '--ext' : kind === 'fused' ? '--fuse' : '--first').trim());
        if (add && kind === 'first' && (row?.pm ?? 0) > 10) {
          const nd = root.querySelector(`.ce-card[data-id="${CSS.escape(a.id)}"]`);
          if (nd) fx.burst(nd.getBoundingClientRect(), $('total').getBoundingClientRect(), getComputedStyle(root).getPropertyValue('--first').trim());
        }
      }
    };
    d.onclick = (e) => toggle(e);
    d.onkeydown = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } };
    (d.querySelector('[data-ce="card-pm"]') as HTMLElement).onclick = (e) => { e.stopPropagation(); if (COUNTED.has(cov) && row) openCard(a.id); };
    (d.querySelector('[data-ce="card-tag"]') as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      if (kind === 'delivered' || !COUNTED.has(cov)) return;
      const cur = s.overrides[a.id];
      act(cur ? `撤回手改 ${a.name}` : `手改 ${a.name} 为${kind === 'ext' ? '首发' : '横展'}`, (x) => {
        const o = { ...x.overrides };
        if (o[a.id]) delete o[a.id]; else o[a.id] = kind === 'ext' ? 'first' : 'ext';
        x.overrides = o;
      });
    };
    return d;
  };

  // ---------- 瀑布图 ----------
  const waterfall = (isReady: boolean) => {
    const wf = $('wf');
    const W = Math.max(240, wf.clientWidth || 300), H = 180, n = STEPS.length + 1, gap = 8, bw = (W - gap * (n - 1)) / n;
    const t = result.nre;
    const tot = isReady && t.known > 0 ? t.known : 1;
    // 顶部留 18px 给柱顶数字，避免压到上方标题
    const PAD = 18, yOf = (v: number) => H - (v / tot) * (H - PAD);
    let acc = 0, h = '';
    STEPS.forEach((st, j) => {
      const v = isReady ? num(t[st.key]) : 0;
      const pend = isReady && (t.pending?.[st.key]?.length ?? 0) > 0;
      const y0 = yOf(acc); acc += v; const y1 = yOf(acc); const x = j * (bw + gap);
      h += `<g class="col" data-ce="wf-col" data-k="${st.key}" tabindex="0" role="button" aria-label="${st.name} ${wan(v)}，点开看算式"><rect class="bar" x="${x}" y="${y1}" width="${bw}" height="${Math.max(y0 - y1, 1)}" rx="2" fill="${st.color}"${pend ? ' stroke="var(--amber)" stroke-dasharray="3 2" stroke-width="1.5"' : ''}/><text x="${x + bw / 2}" y="${y1 - 4}" text-anchor="middle">${v.toFixed(0)}${pend ? '*' : ''}</text></g>`;
      h += `<line class="step" x1="${x + bw}" x2="${x + bw + gap}" y1="${y1}" y2="${y1}"/>`;
    });
    const x = (n - 1) * (bw + gap);
    h += `<g class="col" data-ce="wf-col" data-k="total" tabindex="0" role="button" aria-label="NRE 合计"><rect class="bar" x="${x}" y="${isReady ? PAD : H - 1}" width="${bw}" height="${isReady ? H - PAD : 1}" rx="2" fill="url(#ce-hatch)"/><text x="${x + bw / 2}" y="${isReady ? PAD - 4 : H - 5}" text-anchor="middle" font-weight="700">${isReady ? `${t.known.toFixed(0)}${t.total == null ? '*' : ''}` : ''}</text></g>`;
    wf.innerHTML = `<svg viewBox="0 0 ${W} ${H}"><defs><pattern id="ce-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--ink)"/><rect width="3" height="6" fill="var(--ink2)"/></pattern></defs>${h}</svg>`;
    $('wfl').innerHTML = STEPS.map((s) => `<div>${s.name}</div>`).join('') + `<div><b>合计</b></div>`;
    wf.title = t.total == null && isReady ? '带 * 的一级含待补项，合计只含已知部分' : '';
    wf.querySelectorAll<SVGGElement>('g.col').forEach((g) => {
      const k = g.dataset.k!;
      g.onmouseenter = () => linkStep(k); g.onmouseleave = () => linkStep(null);
      g.onclick = () => openStep(k);
      g.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStep(k); } };
    });
  };
  const contrib = (k: string) => result.rows.filter((r) => (k === 'total' ? known(r) : num((r as unknown as Record<string, number | null>)[k])) > 0).map((r) => r.id);
  const linkStep = (k: string | null) => {
    const sh = $('shelf');
    root.querySelectorAll('.ce-card.hl, .ce-lg.hl').forEach((x) => x.classList.remove('hl'));
    sh.classList.remove('linking');
    if (!k || k === 'total') return;
    if (k === 'langFirst' || k === 'voiceLang') {
      root.querySelectorAll('.ce-lg.new').forEach((x) => x.classList.add('hl'));
      if (k === 'voiceLang') root.querySelectorAll('.ce-lg:not(.off)').forEach((x) => x.classList.add('hl'));
      return;
    }
    const ids = contrib(k);
    if (!ids.length) return;
    sh.classList.add('linking');
    ids.forEach((id) => root.querySelector(`.ce-card[data-id="${CSS.escape(id)}"]`)?.classList.add('hl'));
  };
  const hover = (a: Agent | null, el: HTMLElement, kind: RowResult['kind']) => {
    root.querySelectorAll('.ce-ab').forEach((x) => x.classList.remove('hot', 'lit'));
    const svg = $('links'); svg.innerHTML = '';
    const wf = $('wf'); wf.classList.remove('linking'); wf.querySelectorAll('g.col').forEach((g) => g.classList.remove('hl'));
    if (!a) return;
    const row = result.rows.find((r) => r.id === a.id && known(r) > 0);
    if (row) {
      wf.classList.add('linking');
      STEPS.forEach((st) => { if (num((row as unknown as Record<string, number | null>)[st.key]) > 0) wf.querySelector(`g.col[data-k="${st.key}"]`)?.classList.add('hl'); });
    }
    const ours = root.querySelector('.ce-ours') as HTMLElement;
    if (!a.caps.length || !ours.offsetParent) return;
    const sr = $('shelf').getBoundingClientRect(), cr = el.getBoundingClientRect();
    const col = getComputedStyle(root).getPropertyValue(kind === 'fused' ? '--fuse' : '--ext').trim();
    let h = '';
    for (const c of a.caps) {
      const ab = root.querySelector(`.ce-ab[data-cap="${CSS.escape(c)}"]`) as HTMLElement | null;
      if (!ab) continue;
      ab.classList.add(a.caps.length > 1 ? 'hot' : 'lit');
      const er = ab.getBoundingClientRect();
      const x1 = er.right - sr.left + 4, y1 = er.top + er.height / 2 - sr.top, x2 = cr.left - sr.left, y2 = cr.top + cr.height / 2 - sr.top;
      const dd = `M${x1},${y1} C${x1 + 90},${y1} ${x2 - 90},${y2} ${x2},${y2}`;
      h += `<path class="base" d="${dd}" stroke="${col}"/>${motion === 0 ? `<path class="flow" d="${dd}" stroke="${col}" style="color:${col}"/>` : ''}`;
    }
    svg.innerHTML = h;
  };

  // ---------- 抽屉 ----------
  const drawer = $('drawer'), scrim = $('scrim');
  let lastFocus: HTMLElement | null = null;
  const openD = (title: string, html: string) => {
    lastFocus = document.activeElement as HTMLElement | null;
    $('d-title').textContent = title; $('d-body').innerHTML = html;
    syncHeader();
    drawer.classList.add('on'); scrim.classList.add('on'); drawer.setAttribute('aria-hidden', 'false');
    ($('d-close') as HTMLElement).focus();
  };
  const closeD = () => {
    if (!drawer.classList.contains('on')) return;
    drawer.classList.remove('on'); scrim.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true');
    lastFocus?.focus?.();
  };
  const fl = (k: string, v: string, eq = '') => `<div class="ce-fl"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span>${eq ? `<span class="eq">${esc(eq)}</span>` : ''}</div>`;
  const openCard = (id: string) => {
    const a = agentOf(id); const r = view.get(id); if (!a || !r) return;
    const s = store.get();
    let h = `<p><span style="background:${KIND_VAR[r.kind][0]};color:#fff;font-family:var(--mono);font-size:10px;padding:1px 6px;border-radius:3px">${KIND_TXT[r.kind]}${r.manual ? ' · 手改' : ''}</span> <span style="color:var(--ink2)">${esc(covOf(a, s))}${p.packages[s.pkg].tiers ? ` · ${s.tier}` : ''}</span></p>`;
    h += fl('研究院', wan(r.research)) + fl('产研', wan(r.product)) + fl('交付五职能', wan(r.delivery)) + fl('直接费用', wan(r.direct)) + fl('这一项合计', wan(r.sum), '语种首发、基础语音语种费按整单算，见瀑布图');
    if (r.pending?.length) h += `<div class="ce-src" style="color:var(--amber)"><b>待补</b><ul>${r.pending.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
    if (r.formula.length) h += `<div class="ce-src"><b>算式</b><ul>${r.formula.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
    if (a.notes.length) h += `<div class="ce-src"><b>说明</b><ul>${a.notes.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
    if (a.src.length) h += `<div class="ce-src"><b>出处</b><ul>${a.src.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
    openD(`${a.name} · 这个数怎么来的`, h);
  };
  const openStep = (k: string) => {
    const t = result.nre;
    const st = STEPS.find((x) => x.key === k);
    const pendList = (keys: StepKey[]) => keys.flatMap((k2) => (t.pending?.[k2] ?? []).map((m) => `<li>${esc(m)}</li>`)).join('');
    if (!st) { const pl = pendList(STEPS.map((x) => x.key)); openD('NRE 合计 · 怎么算的', STEPS.map((x) => fl(x.name + ((t.pending?.[x.key]?.length ?? 0) ? ' *' : ''), wan(t[x.key]))).join('') + fl('已知合计', wan(t.known), t.total == null ? '带 * 的一级含待补项，不计入合计' : '') + (pl ? `<div class="ce-src" style="color:var(--amber)"><b>待补</b><ul>${pl}</ul></div>` : '')); return; }
    let h = fl(`${st.name}（已知部分）`, wan(t[st.key]));
    const pl1 = pendList([st.key]);
    if (pl1) h += `<div class="ce-src" style="color:var(--amber)"><b>待补</b><ul>${pl1}</ul></div>`;
    if (k === 'langFirst' || k === 'voiceLang') {
      h += k === 'langFirst'
        ? `<p>每个没交付过的语种 × 所选能力（同一能力只算一次）：扩展语种整体成本 × ${p.rates.researchShare} × 语系权重。语系权重沿用 T18FL4 横展：语系里已有交付语种的按同族 0.5；全新语系里锚点语种 1.0、其余同族 0.5。</p>`
        : `<p>基础语音：语种第一次做 ${p.rates.voiceLangFirst} 万；在奇瑞做过、搬到新车型 ${p.rates.voiceLangReuse} 万。只有勾了基础语音卡才计入。</p>`;
      h += `<table class="ce-tab"><tr><th>语种</th><th>折算</th><th>说明</th></tr>${result.langs.filter((l) => !l.off).map((l) => `<tr><td>${esc(l.name)}</td><td>${l.isNew ? `新${fw(l) != null ? ' × ' + fw(l)!.toFixed(1) : ''}` : l.weight}</td><td>${esc(l.why)}</td></tr>`).join('')}</table>`;
    } else {
      const val = (r: RowResult) => num((r as unknown as Record<string, number | null>)[k]);
      const rows = result.rows.filter((r) => val(r) > 0).sort((x, y) => val(y) - val(x));
      h += k === 'research' ? `<p>研究院人月 × ${p.rates.research} 万 × 奇瑞分摊 ${p.rates.researchShare}（已分摊的底数不再分摊）。</p>`
        : k === 'product' ? `<p>产研人月 × ${p.rates.product} 万 × 分摊 ${p.rates.productShare}。</p>`
        : k === 'delivery' ? `<p>项目、产品、开发、测试、技术支持，单价 ${p.rates.delivery} 万 / 人月，全额不分摊。</p>` : '<p>外采、数据等全额计入。</p>';
      h += rows.length ? `<table class="ce-tab"><tr><th>智能体</th><th style="text-align:right">万元</th></tr>${rows.map((r) => `<tr><td>${esc(agentOf(r.id)?.name)}${r.pending.length ? ' <span class="ce-pend" title="' + esc(r.pending.join('；')) + '">含待补</span>' : ''}</td><td class="m">${val(r).toFixed(2)}</td></tr>`).join('')}</table>` : '<p style="color:var(--ink3)">当前没有智能体计入这一项。</p>';
    }
    openD(`${st.name} · 怎么算的`, h);
  };
  const openWhy = () => {
    const rows = result.langs;
    const h = fl('语种等效数', result.eq.toFixed(1), '已交付语种（T13C 欧盟 10 种、T22FL 俄罗斯俄英）按 T18FL4 横展表权重：锚点 1.0、同语系回归 0.5；没交付过的语种为「新」，走语种首发，首发也按语系折算：语系里已有交付语种的 × 0.5，全新语系的锚点 × 1.0、其余 × 0.5')
      + (rows.length ? `<table class="ce-tab"><tr><th>语种</th><th>折算</th><th>为什么</th></tr>${rows.map((l) => `<tr style="${l.off ? 'opacity:.4' : ''}"><td>${esc(l.name)}</td><td>${l.off ? '—' : l.isNew ? `新${fw(l) != null ? ' × ' + fw(l)!.toFixed(1) : ''}` : l.weight}</td><td>${esc(l.off ? '已剔除' : l.why)}</td></tr>`).join('')}</table>` : '<p>先选区域。</p>');
    openD('语种折算怎么算', h);
  };

  // ---------- 方案对比 ----------
  const desc = (s: Selection) => `${p.packages[s.pkg].name}${p.packages[s.pkg].tiers ? ` · ${s.tier}` : ''} · ${s.car || '未选车型'} · ${s.regions.map((k) => p.regions[k].name).join('+')} · ${s.agents.length} 个智能体`;
  const renderCmp = () => {
    const A = cmp.A, B = cmp.B;
    ($('save-a') as HTMLElement).textContent = A ? '更新方案 A' : '存为方案 A';
    ($('save-b') as HTMLElement).textContent = B ? '更新方案 B' : '存为方案 B';
    $('save-a').classList.toggle('has', !!A); $('save-b').classList.toggle('has', !!B);
    const t = $('cmp-t');
    if (!A || !B) { t.innerHTML = `<div class="desc">${A || B ? '再存一套就能并排看差多少。' : '比如先存「欧盟」那套，再换区域存一套。'}</div>`; return; }
    // 已知部分 + 待补：任一边该级有待补，金额后标「+待补」，差额只是已知部分之差
    const tb = '<em class="tbd">+待补</em>';
    const row = (n: string, a: number, b: number, pa = false, pb = false) => { const d = b - a; return `<tr><td>${n}</td><td>${a.toFixed(1)}${pa ? tb : ''}</td><td>${b.toFixed(1)}${pb ? tb : ''}</td><td class="${d > 0.05 ? 'up' : d < -0.05 ? 'dn' : ''}">${d > 0 ? '+' : ''}${d.toFixed(1)}${pa || pb ? tb : ''}</td></tr>`; };
    const pend = (r: Result, k: StepKey) => (r.nre.pending?.[k]?.length ?? 0) > 0;
    const licCell = (r: Result) => (r.lic.pendingRegions.length || r.lic.pendingAgents?.length ? `${yuan(r.lic.known)}+待补` : yuan(r.lic.known));
    t.innerHTML = `<table data-ce="cmp-table"><tr><th>万元</th><th>A</th><th>B</th><th>B − A</th></tr>${STEPS.map((x) => row(x.name, num(A.r.nre[x.key]), num(B.r.nre[x.key]), pend(A.r, x.key), pend(B.r, x.key))).join('')}${row('<b>NRE 已知合计</b>', A.r.nre.known, B.r.nre.known, A.r.nre.total == null, B.r.nre.total == null)}<tr><td>LIC 元/车</td><td>${licCell(A.r)}</td><td>${licCell(B.r)}</td><td>${A.r.lic.pendingRegions.length || B.r.lic.pendingRegions.length ? '—' : (B.r.lic.known - A.r.lic.known).toFixed(1)}</td></tr></table>`
      + `<div class="desc">A：${esc(A.desc)} <button class="ce-lnk" type="button" data-k="A">载入</button><br>B：${esc(B.desc)} <button class="ce-lnk" type="button" data-k="B">载入</button></div>`;
    t.querySelectorAll<HTMLElement>('button[data-k]').forEach((b) => { b.onclick = () => { const k = b.dataset.k as 'A' | 'B'; const snap = structuredClone(cmp[k]!.sel); pkgPicked = true; store.restore(`载入方案 ${k}`, snap); }; });
  };
  const save = (k: 'A' | 'B') => { const s = store.get(); cmp[k] = { sel: structuredClone(s), r: compute(p, s), desc: desc(s) }; toast(`已存为方案 ${k}：${cmp[k]!.desc}`); renderCmp(); };

  // ---------- HUD ----------
  const hudEl = $('hud'); let hudT = 0;
  const hud = (msg: string) => {
    $('hud-msg').innerHTML = `${esc(msg)} · 已选 <span class="n">${store.get().agents.length}</span> 项`;
    ($('undo') as HTMLButtonElement).disabled = store.history() === 0;
    hudEl.classList.add('on'); clearTimeout(hudT); hudT = window.setTimeout(() => hudEl.classList.remove('on'), 5200);
  };
  const doUndo = () => { const l = store.undo(); if (l == null) { toast('没有可撤销的操作'); return; } justAdded = null; };

  // ---------- 事件 ----------
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget, ev: K | string, fn: (e: Event) => void) => { el.addEventListener(ev, fn); cleanups.push(() => el.removeEventListener(ev, fn)); };
  on($('regions'), 'click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-ce="region"]'); if (!b) return;
    const k = b.dataset.id as RegionId; const s = store.get();
    act(`${s.regions.includes(k) ? '去掉' : '加上'} ${p.regions[k].name}`, (x) => { x.regions = x.regions.includes(k) ? x.regions.filter((y) => y !== k) : [...x.regions, k]; });
  });
  on($('langs'), 'click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-ce="lang"]'); if (!b) return;
    const id = b.dataset.id!; const s = store.get(); const name = p.langs[id]?.name ?? id;
    act(`${s.offLangs.includes(id) ? '恢复' : '剔除'} ${name}`, (x) => { x.offLangs = x.offLangs.includes(id) ? x.offLangs.filter((y) => y !== id) : [...x.offLangs, id]; });
  });
  const carIn = $<HTMLInputElement>('car');
  on(carIn, 'change', () => { const v = carIn.value.trim(); if (v === store.get().car) return; act(v ? `车型改为 ${v}` : '清空车型', (x) => { x.car = v; }); });
  on($('per-market'), 'change', (e) => { const v = (e.target as HTMLInputElement).checked; act(`${v ? '打开' : '关闭'}分市场验收`, (x) => { x.perMarket = v; }); });
  on($('sys-switch'), 'change', (e) => { const v = (e.target as HTMLInputElement).checked; act(`${v ? '打开' : '关闭'}系统方切换适配`, (x) => { x.systemSwitch = v; }); });
  let slideOpen = false;
  const slide = (fn: (x: Selection) => void) => { if (!slideOpen) { slideOpen = true; act('调整 LIC 参数', fn); window.setTimeout(() => { slideOpen = false; }, 600); } else { store.apply('调整 LIC 参数', fn, { merge: true }); } };
  on($('lic-active'), 'input', (e) => { const v = +(e.target as HTMLInputElement).value / 100; slide((x) => { x.activeRate = v; }); });
  on($('lic-calls'), 'input', (e) => { const v = +(e.target as HTMLInputElement).value; slide((x) => { x.dailyCalls = v; }); });
  on($('lic-reset'), 'click', () => act('LIC 参数恢复默认', (x) => { x.activeRate = p.lic.activeRate; x.dailyCalls = p.lic.dailyCalls; }));
  on($('save-a'), 'click', () => save('A'));
  on($('save-b'), 'click', () => save('B'));
  on($('undo'), 'click', doUndo);
  on($('why-lang'), 'click', openWhy);
  on($('pending'), 'click', () => openStep('total'));
  on($('d-close'), 'click', closeD);
  on(scrim, 'click', closeD);
  on(document, 'keydown', (e) => {
    const k = e as KeyboardEvent;
    if ((k.metaKey || k.ctrlKey) && k.key.toLowerCase() === 'z' && !k.shiftKey) {
      const t = k.target as HTMLElement; if (t && (t.tagName === 'INPUT' && (t as HTMLInputElement).type === 'text')) return;
      k.preventDefault(); doUndo();
    }
    if (k.key === 'Escape') closeD();
  });
  const res = $('res');
  let ty0: number | null = null;
  const setTray = (open: boolean) => { res.classList.toggle('open', open); $('tray-go').textContent = open ? '收起 ▼' : '明细 ▲'; };
  on($('tray'), 'pointerdown', (e) => { ty0 = (e as PointerEvent).clientY; });
  on($('tray'), 'pointerup', (e) => { if (ty0 == null) return; const dy = (e as PointerEvent).clientY - ty0; ty0 = null; if (Math.abs(dy) > 30) setTray(dy < 0); else setTray(!res.classList.contains('open')); });
  on($('download'), 'click', async (e) => {
    const s = store.get(); if (!ready(s)) return;
    res.scrollTo({ top: 0, behavior: motion === 2 ? 'auto' : 'smooth' });
    const seal = $('seal'); seal.classList.remove('on'); void seal.getBoundingClientRect(); seal.classList.add('on');
    if (motion === 0 && !MOB.matches) fx.spark((e as MouseEvent).clientX, (e as MouseEvent).clientY, '#ffb48c');
    try {
      const { buildWorkbook, fileName } = await import('./xlsx');
      const bytes = buildWorkbook(p, s, compute(p, s));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a'); a.href = url; a.download = fileName(p, s); document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('已下载 3 张表：你选了什么 · NRE 明细 · LIC 明细');
    } catch (err) { toast(`下载失败：${err instanceof Error ? err.message : err}`); }
  });
  on($('copy-link'), 'click', async () => {
    const s = store.get();
    const url = `${location.origin}${location.pathname}?${encode(s, p.version)}`;
    try { await navigator.clipboard.writeText(url); toast('链接已复制，对方打开就是同一个画面'); }
    catch { window.prompt('复制这个链接：', url); }
  });
  const onRM = () => { if (RM.matches) { motion = 2; render(); } };
  RM.addEventListener('change', onRM); cleanups.push(() => RM.removeEventListener('change', onRM));
  const onResize = () => waterfall(ready(store.get()));
  addEventListener('resize', onResize); cleanups.push(() => removeEventListener('resize', onResize));

  const unsub = store.subscribe((_s, label) => render(label || undefined));
  render();
  if (fromUrl.dropped.length) toast(`链接里有 ${fromUrl.dropped.length} 项无效，已忽略`);
  else if (fromUrl.staleVersion) toast('参数已更新，已按当前参数重算');
  opts.onBackend?.('dom');

  return {
    pause: () => fx.pause(),
    resume: () => fx.resume(),
    dispose: () => { unsub(); cleanups.forEach((f) => f()); fx.dispose(); clearTimeout(toastT); clearTimeout(hudT); root.remove(); },
  };
}
