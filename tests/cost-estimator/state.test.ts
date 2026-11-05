import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../src/lab/modules/cost-estimator/state.ts';
import { params } from './data.ts';
import { compute } from '../../src/lab/modules/cost-estimator/core/compute.ts';
const card = params.packages['c3-euanz'].agents.find((a) => a.coverage.MAX === '承接' && a.coverage.Lite === '不承接')!;
test('undo caps at 50', () => {
  const st = createStore(params);
  for (let i = 1; i <= 60; i++) st.apply('车型', (s) => { s.car = `X${i}`; });
  assert.equal(st.history(), 50);
  for (let i = 0; i < 50; i++) st.undo();
  assert.equal(st.get().car, 'X10');
});
test('undo to initial returns null after empty', () => {
  const st = createStore(params), before = st.get();
  st.apply('车型', (s) => { s.car = 'X'; });
  assert.equal(st.undo(), '车型'); assert.deepEqual(st.get(), before); assert.equal(st.undo(), null);
});
test('tier switch removes uncovered and restores', () => {
  assert.ok(card);
  const st = createStore(params, { agents: [card.id] });
  st.apply('Lite', (s) => { s.tier = 'Lite'; }); assert.deepEqual(st.get().agents, []);
  st.apply('MAX', (s) => { s.tier = 'MAX'; }); assert.deepEqual(st.get().agents, [card.id]);
});
test('manual uncheck not restored on tier switch', () => {
  const st = createStore(params, { agents: [card.id] });
  st.apply('取消', (s) => { s.agents = []; });
  st.apply('Lite', (s) => { s.tier = 'Lite'; }); st.apply('MAX', (s) => { s.tier = 'MAX'; });
  assert.deepEqual(st.get().agents, []);
});
test('overrides cleared on pkg or car change', () => {
  const st = createStore(params, { agents: [card.id], overrides: { [card.id]: 'first' } });
  const labels: string[] = []; st.subscribe((_, l) => labels.push(l));
  st.apply('换车型', (s) => { s.car = 'X'; });
  assert.deepEqual(st.get().overrides, {}); assert.equal(labels.at(-1), '换车型（手改已清除）');
  st.apply('换包', (s) => { s.pkg = 'c3-sea'; s.overrides = { [card.id]: 'ext' }; });
  assert.deepEqual(st.get().agents, []); assert.deepEqual(st.get().overrides, {});
});
test('offLangs persists across region changes', () => {
  const st = createStore(params, { regions: ['eu'] });
  st.apply('剔除德语', (s) => { s.offLangs = ['de']; });
  st.apply('去欧盟', (s) => { s.regions = []; }); st.apply('加欧盟', (s) => { s.regions = ['eu']; });
  assert.deepEqual(st.get().offLangs, ['de']);
  const before = st.get(), n = st.history();
  assert.throws(() => st.apply('全剔除', (s) => { s.offLangs = [...params.regions.eu.langs]; }), { name: 'LastLanguageError' });
  assert.deepEqual(st.get(), before); assert.equal(st.history(), n);
});
test('merge and undo notify with immutable snapshots', () => {
  const st = createStore(params), labels: string[] = [];
  const off = st.subscribe((s, l) => { s.car = 'mutated'; labels.push(l); });
  st.apply('滑块', (s) => { s.dailyCalls = 20; });
  st.apply('滑块', (s) => { s.dailyCalls = 25; }, { merge: true });
  assert.equal(st.history(), 1); assert.equal(st.get().car, '');
  st.undo(); assert.equal(st.get().dailyCalls, params.lic.dailyCalls);
  assert.deepEqual(labels, ['滑块', '滑块', '已撤销：滑块']); off();
  const copy = st.get(); copy.agents.push('bad'); assert.deepEqual(st.get().agents, []);
});
test('undo restores tier restoration memory', () => {
  const st = createStore(params, { agents: [card.id] });
  st.apply('Lite', (s) => { s.tier = 'Lite'; });
  st.apply('MAX', (s) => { s.tier = 'MAX'; }); st.undo();
  st.apply('MAX', (s) => { s.tier = 'MAX'; }); assert.deepEqual(st.get().agents, [card.id]);
});
test('tier restoration survives manually toggling another visible card', () => {
  const visible = params.packages['c3-euanz'].agents.find((a) => a.coverage.MAX === '承接' && a.coverage.Lite === '承接')!;
  const st = createStore(params, { agents: [card.id] });
  st.apply('Lite', (s) => { s.tier = 'Lite'; });
  st.apply('勾选另一张', (s) => { s.agents.push(visible.id); });
  st.apply('MAX', (s) => { s.tier = 'MAX'; });
  assert.deepEqual(new Set(st.get().agents), new Set([card.id, visible.id]));
});
test('hidden choices survive rebuilding from a low-tier selection', () => {
  const original = createStore(params, { agents: [card.id] });
  original.apply('Lite', (s) => { s.tier = 'Lite'; });
  const snapshot = original.get();
  assert.deepEqual((snapshot as unknown as { hidden?: string[] }).hidden, [card.id]);
  const restored = createStore(params, snapshot);
  restored.apply('MAX', (s) => { s.tier = 'MAX'; });
  assert.deepEqual(restored.get().agents, [card.id]);
});
test('manual cancellation clears persisted hidden choices and undo restores them', () => {
  const st = createStore(params, { agents: [card.id] });
  st.apply('Lite', (s) => { s.tier = 'Lite'; });
  st.apply('取消隐藏勾选', (s) => { Object.assign(s, { hidden: [] }); });
  const restored = createStore(params, st.get());
  restored.apply('MAX', (s) => { s.tier = 'MAX'; }); assert.deepEqual(restored.get().agents, []);
  st.undo(); const afterUndo = createStore(params, st.get());
  afterUndo.apply('MAX', (s) => { s.tier = 'MAX'; }); assert.deepEqual(afterUndo.get().agents, [card.id]);
  st.apply('换包', (s) => { s.pkg = 'c3-sea'; });
  assert.deepEqual((st.get() as unknown as { hidden?: string[] }).hidden, []);
});
test('restore across cars reproduces saved overrides agents and cost', () => {
  const st = createStore(params, { car: 'NEW', regions: ['anz'], agents: ['chat'], overrides: { chat: 'first' } });
  const saved = st.get(), result = compute(params, saved);
  assert.equal(result.nre.known, 20.007);
  st.apply('换车型', (s) => { s.car = 'X99'; });
  assert.deepEqual(st.get().overrides, {});
  st.restore('载入 A', saved);
  assert.deepEqual(st.get(), saved);
  assert.deepEqual(compute(params, st.get()), result);
});
test('restore across packages reproduces saved overrides agents and cost', () => {
  const st = createStore(params, { car: 'NEW', regions: ['anz'], agents: ['chat'], overrides: { chat: 'first' } });
  const saved = st.get(), result = compute(params, saved);
  st.apply('换包', (s) => { s.pkg = 'c15-eu'; });
  assert.deepEqual(st.get().agents, []);
  st.restore('载入 A', saved);
  assert.deepEqual(st.get(), saved);
  assert.equal(compute(params, st.get()).nre.known, 20.007);
  assert.deepEqual(compute(params, st.get()), result);
});
test('restore is one undo record and notifies without deriving changes', () => {
  const st = createStore(params, { pkg: 'c15-eu', car: 'X99', agents: ['p1-core'] });
  const before = st.get();
  const saved = createStore(params, { car: 'NEW', regions: ['anz'], agents: ['chat'], overrides: { chat: 'first' } }).get();
  Object.assign(saved, { tier: 'Lite', hidden: ['edge-core'], voice: 'offline', activeRate: .8, dailyCalls: 30, perMarket: true, systemSwitch: true });
  const expected = structuredClone(saved), labels: string[] = [];
  st.subscribe((s, label) => { labels.push(label); s.agents.push('listener-mutation'); s.hidden?.push('listener-hidden'); });
  st.restore('载入 A', saved);
  assert.equal(st.history(), 1); assert.deepEqual(st.get(), expected); assert.deepEqual(labels, ['载入 A']);
  saved.agents.push('input-mutation'); saved.overrides.chat = 'ext'; saved.hidden?.push('input-hidden');
  assert.deepEqual(st.get(), expected);
  assert.equal(st.undo(), '载入 A'); assert.deepEqual(st.get(), before);
  assert.deepEqual(labels, ['载入 A', '已撤销：载入 A']); assert.equal(st.undo(), null);
});
test('restore resets desired to the saved visible and hidden choices only', () => {
  const st = createStore(params, { agents: ['edge-core', 'voice-control'] });
  st.apply('Lite', (s) => { s.tier = 'Lite'; });
  const saved = createStore(params, { tier: 'Lite', agents: ['chat'], hidden: ['edge-core'] }).get();
  st.restore('载入', saved);
  st.apply('MAX', (s) => { s.tier = 'MAX'; });
  assert.deepEqual(new Set(st.get().agents), new Set(['chat', 'edge-core']));
  st.undo(); assert.deepEqual(st.get(), saved);
  const withoutHidden = { ...saved }; delete withoutHidden.hidden;
  st.restore('旧快照', withoutHidden); assert.deepEqual(st.get(), withoutHidden);
  st.apply('MAX', (s) => { s.tier = 'MAX'; }); assert.deepEqual(st.get().agents, ['chat']);
});
test('explicit clear removes hidden choices across subsequent tier changes', () => {
  const st = createStore(params, { car: 'NEW', regions: ['anz'], agents: ['edge-core'] });
  st.apply('Lite', (s) => { s.tier = 'Lite'; });
  assert.deepEqual(st.get().hidden, ['edge-core']);
  st.apply('一键：清空', (s) => { s.agents = []; s.hidden = []; });
  assert.deepEqual(st.get().agents, []); assert.deepEqual(st.get().hidden, []);
  for (const tier of ['MAX', 'PRO', 'Lite', 'MAX'] as const) st.apply('切档', (s) => { s.tier = tier; });
  assert.deepEqual(st.get().agents, []); assert.equal(compute(params, st.get()).nre.known, 0);
});
test('in-place edits to hidden rebuild desired and clearing can be undone', () => {
  const st = createStore(params, { agents: ['edge-core'] });
  st.apply('Lite', (s) => { s.tier = 'Lite'; }); const hidden = st.get();
  st.apply('一键：清空', (s) => { s.agents.length = 0; s.hidden!.length = 0; });
  st.undo(); assert.deepEqual(st.get(), hidden);
  st.apply('MAX', (s) => { s.tier = 'MAX'; }); assert.deepEqual(st.get().agents, ['edge-core']);
  st.apply('取消', (s) => { s.agents = []; s.hidden = []; });
  st.apply('Lite', (s) => { s.tier = 'Lite'; }); st.apply('MAX', (s) => { s.tier = 'MAX'; });
  assert.deepEqual(st.get().agents, []);
});
