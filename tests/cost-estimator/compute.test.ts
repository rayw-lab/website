import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../../src/lab/modules/cost-estimator/core/compute.ts';
import { params, golden, scenario, fixture } from './data.ts';
test('published parameters and golden contain no local absolute paths', () => {
  assert.doesNotMatch(JSON.stringify({ params, golden }), /\/(?:Users|Volumes)\//);
});
function roundDeep(v: unknown): unknown {
  if (typeof v === 'number') return Math.round(v * 1e9) / 1e9;
  if (Array.isArray(v)) return v.map(roundDeep);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, v]) => [k, roundDeep(v)]));
  return v;
}
for (const g of golden) test(g.name, () => {
  assert.deepStrictEqual(roundDeep(compute(params, g.selection)), roundDeep(g.result));
});
test('all human result text uses capability names', () => {
  const pattern = /\b(p[12]-[a-z]+|voice-(control|switch|visible))\b/;
  function* strings(value: unknown, path = '', human = false): Generator<[string, string]> {
    if (Array.isArray(value)) {
      for (const [i, item] of value.entries()) yield* strings(item, `${path}[${i}]`, human);
    } else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) yield* strings(item, `${path}.${key}`, human || ['pending', 'notes', 'formula'].includes(key));
    } else if (human && typeof value === 'string') yield [path, value];
  }
  const texts = golden.flatMap((g) => [...strings(compute(params, g.selection))].map(([path, text]) => ({ scenario: g.name, path, text })));
  assert.deepEqual(texts.filter(({ text }) => pattern.test(text)), []);
  assert.ok(texts.some(({ text }) => text.includes('二期·周边推荐智能体')));
});
test('G-ROUND display', () => {
  const g = scenario('G-ROUND');
  assert.equal(compute(params, g.selection).nre.total!.toFixed(2), g.result.nre.total!.toFixed(2));
  assert.equal(g.result.nre.total!.toFixed(2), '106.31');
});
test('LIC ANZ keeps known token alongside pending agents', () => {
  const lic = compute(params, scenario('G-ANZ-PENDING').selection).lic;
  assert.equal(lic.token, 148.5); assert.ok(lic.pendingAgents.length > 0);
  assert.equal(lic.known, lic.voice + lic.token + lic.source + lic.server);
});
test('LIC mixed regions keep known source and separate pending components', () => {
  const lic = compute(params, scenario('G-EU+ANZ').selection).lic;
  assert.equal(lic.source, 779.44); assert.deepEqual(lic.pendingSource, ['anz']);
  assert.equal(lic.server, 0); assert.deepEqual(lic.pendingServer, ['eu', 'anz']);
  assert.deepEqual(lic.pendingRegions, ['eu', 'anz']);
  assert.equal(lic.known, lic.voice + lic.token + lic.source + lic.server);
});
test('all selected ids including uncovered have stable rows', () => {
  const g = scenario('G-EU-LITE');
  const r = compute(params, g.selection);
  assert.deepEqual(r.rows.map((r) => r.id), params.packages[g.selection.pkg].agents.map((a) => a.id));
  for (const a of params.packages[g.selection.pkg].agents.filter((a) => ['不承接', '待评估'].includes(a.coverage.Lite))) {
    assert.equal(r.rows.find((r) => r.id === a.id)!.counted, false);
  }
});
test('known first components remain visible when direct cost is missing', () => {
  const { p, s, a } = fixture(); a.first!.direct = null;
  const r = compute(p, s);
  assert.equal(r.nre.research, 8.82); assert.equal(r.nre.product, 3); assert.equal(r.nre.delivery, 18); assert.equal(r.nre.direct, 0);
  assert.ok(Math.abs(r.nre.known - 29.82) < 1e-9); assert.equal(r.nre.total, null);
  assert.equal(r.rows[0].sum, null); assert.ok(r.rows[0].pending[0].includes('直接费用待补'));
  assert.equal(r.rows[0].formula[0], '研究院 10 人月 × 4.41 万 × 0.2 = 8.82 万');
});
test('partial ext row preserves known PM and delivery', () => {
  const s = scenario('G-EU-MAX').selection; s.car = 'NEW'; s.agents = ['chat'];
  const r = compute(params, s), row = r.rows.find((r) => r.id === 'chat')!;
  assert.equal(row.pm, 3.2); assert.ok(Math.abs(row.delivery! - 9.6) < 1e-9);
  assert.ok(row.pending.some((text) => text.includes('每等效语种增量待补')));
  assert.equal(row.sum, null); assert.equal(row.counted, false);
  assert.equal(row.delivery, r.nre.delivery);
});
test('partial first and unknown pool rows keep numeric components', () => {
  const { p, s, a } = fixture(); a.first!.research = null; a.first!.direct = null;
  const row = compute(p, s).rows[0];
  assert.deepEqual([row.pm, row.research, row.product, row.delivery, row.direct], [10, 0, 3, 18, 0]);
  assert.equal(row.sum, null); assert.equal(row.counted, false);
  p.researchPools = [{ id: 'shared', caps: ['test-cap'], research: null }];
  const pooled = compute(p, s).rows[0];
  assert.equal(pooled.research, 0); assert.equal(pooled.sum, null);
  assert.ok(pooled.pending.some((text) => text.includes('研究院共用工作包待补')));
});
test('every golden row has numeric known components', () => {
  for (const g of golden) for (const row of compute(params, g.selection).rows) {
    for (const k of ['pm', 'research', 'product', 'delivery', 'direct'] as const) assert.equal(typeof row[k], 'number', `${g.name}/${row.id}/${k}`);
    if (row.pending.length) { assert.equal(row.sum, null); assert.equal(row.counted, false); }
    else assert.ok(Math.abs(row.sum! - row.research! - row.product! - row.delivery! - row.direct!) < 1e-9);
  }
});
test('decimal product preserves half-cent display for Excel', () => {
  const { p, s, a } = fixture(); a.first!.product = 10.1;
  const r = compute(p, s); assert.equal(r.rows[0].product, 7.575); assert.equal(r.rows[0].product!.toFixed(2), '7.58');
});
test('known ext parts remain visible when market increment is missing', () => {
  const { p, s, a } = fixture(); s.regions = ['anz', 'ru']; s.overrides = { a: 'ext' }; a.ext!.perMarket = null;
  const r = compute(p, s); assert.equal(r.rows[0].pm, 2.5); assert.equal(r.rows[0].delivery, 7.5); assert.equal(r.nre.delivery, 7.5);
  assert.ok(r.nre.pending.delivery![0].includes('后续市场增量待补'));
});
test('research pool clears replaced missing research and is charged once', () => {
  const { p, s, a } = fixture(); a.first!.research = null;
  const b = structuredClone(a); b.id = 'b'; p.packages[s.pkg].agents.push(b); s.agents.push('b');
  p.researchPools = [{ id: 'shared', caps: ['test-cap'], research: 10 }];
  const r = compute(p, s); assert.equal(r.nre.research, 8.82); assert.deepEqual(r.nre.pending, {});
  assert.ok(r.rows.every((r) => r.counted && r.pending.length === 0));
});
