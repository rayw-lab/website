import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../../src/lab/modules/cost-estimator/core/compute.ts';
import { unionLangs } from '../../src/lab/modules/cost-estimator/core/langs.ts';
import { fixture } from './data.ts';

function setup(ids: string[]) {
  const { p, s, a } = fixture();
  for (const language of Object.values(p.langs)) Object.assign(language, { anchorRank: 2 });
  for (const [id, anchorRank] of Object.entries({ en: 1, de: 1, fr: 1, pl: 1, ru: 1, zh: 1, yue: 2, id: 1, ms: 2, ar: 1, he: 2, tr: 1, kk: 2, uz: 3, th: 1, fa: 1 })) Object.assign(p.langs[id], { anchorRank });
  s.regions = ['eu']; p.regions.eu.langs = ids; s.offLangs = [];
  a.caps = ['p2-nearby']; a.isVoice = false;
  a.first = { research: 0, product: 0, delivery: 0, direct: 0, preShared: false };
  p.langFirst = { 'p2-nearby': { overall: 100, research: null, src: '' }, 'p2-planner': { overall: 100, research: null, src: '' } };
  return { p, s, a };
}
const cases: [string[], Record<string, number>][] = [
  [['no'], { no: .5 }], [['yue', 'zh'], { zh: 1, yue: .5 }], [['yue'], { yue: 1 }],
  [['uz', 'kk', 'tr'], { tr: 1, kk: .5, uz: .5 }], [['he', 'ar', 'ms', 'id'], { ar: 1, he: .5, id: 1, ms: .5 }],
];
for (const [ids, expected] of cases) test(`language first family weights: ${ids.join(',')}`, () => {
  const { p, s } = setup(ids), r = compute(p, s);
  assert.deepEqual(Object.fromEntries(r.langs.map((l) => [l.id, l.firstW])), expected);
  assert.equal(r.nre.langFirst, Object.values(expected).reduce((a, b) => a + b, 0) * 100 * .2);
  assert.ok(r.notes.includes('语系权重沿用 T18FL4 横展：锚点 1.0、同族 0.5'));
  if (ids[0] === 'no') assert.match(r.langs[0].why, /同族 0.5.*英语/);
});
test('swapping anchor priority preserves total and deduplicates capabilities', () => {
  const { p, s, a } = setup(['zh', 'yue']); a.caps = ['p2-nearby', 'p2-nearby', 'p2-planner'];
  const first = compute(p, s);
  p.langs.zh.anchorRank = 2; p.langs.yue.anchorRank = 1;
  const second = compute(p, s);
  assert.equal(first.nre.langFirst, 60); assert.equal(second.nre.langFirst, 60);
  assert.deepEqual(first.langs.map((l) => l.firstW), [1, .5]);
  assert.deepEqual(second.langs.map((l) => l.firstW), [.5, 1]);
});
test('excluded language does not take anchor and variants stay unchanged', () => {
  const { p, s } = setup(['zh', 'yue', 'esmx']); s.offLangs = ['zh'];
  const r = unionLangs(p, s);
  assert.equal(r.langs.find((l) => l.id === 'yue')!.firstW, 1);
  const variant = r.langs.find((l) => l.id === 'esmx')!;
  assert.equal(variant.isNew, false); assert.equal(variant.weight, .5); assert.equal(variant.firstW, undefined);
});
test('delivered language is known outside selected car and region', () => {
  const { p, s } = setup(['no']); p.cars[0].delivered[0].langs.push('no');
  const language = unionLangs(p, s).langs[0];
  assert.equal(language.isNew, false); assert.equal(language.firstW, undefined);
});
