import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decode, encode, recall, remember } from '../../src/lab/modules/cost-estimator/url.ts';
import { params, scenario } from './data.ts';
import { createStore } from '../../src/lab/modules/cost-estimator/state.ts';
import { compute } from '../../src/lab/modules/cost-estimator/core/compute.ts';
test('encode/decode roundtrip', () => {
  const s = scenario('G-OVERRIDE').selection;
  Object.assign(s, { car: '新车型 X99&?', regions: ['eu', 'ru'], offLangs: ['de'], voice: 'offline', activeRate: .8, dailyCalls: 30, perMarket: true, systemSwitch: true });
  const d = decode(encode(s, params.version), params);
  assert.deepEqual(d.sel, s); assert.deepEqual(d.dropped, []); assert.equal(d.staleVersion, false);
});
test('decode drops invalid', () => {
  const d = decode('?pkg=bogus&regions=eu,xx&active=999', params);
  assert.equal(d.dropped.length, 3); assert.deepEqual(d.sel, { regions: ['eu'] });
});
test('decode flags stale version', () => { assert.equal(decode('ver=2000-01-01', params).staleVersion, true); });
test('decode has no defaults without known keys', () => { assert.deepEqual(decode('utm_source=test&foo=bar', params).sel, {}); });
test('decode rejects malformed numbers ids enums overrides and last language', () => {
  const d = decode('p=c3-euanz&t=bad&r=anz&x=en&a=unknown&o=__proto__:f,chat:z&ar=NaN&dc=Infinity&pm=yes&v=bad&ss=2', params);
  assert.ok(d.dropped.length >= 10); assert.equal(d.sel.offLangs, undefined);
  assert.deepEqual(d.sel.overrides, {}); assert.equal(d.sel.dailyCalls, undefined);
});
test('recall survives storage throw', () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
    assert.equal(recall(), null); assert.doesNotThrow(() => remember(scenario('G-EMPTY').selection));
  } finally { if (old) Object.defineProperty(globalThis, 'localStorage', old); else Reflect.deleteProperty(globalThis, 'localStorage'); }
});
test('remember recall and corrupt data', () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage'); let data: string | null = null;
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => data, setItem: (_k: string, v: string) => { data = v; } } });
    const s = scenario('G-EU-MAX').selection; remember(s); assert.deepEqual(recall(), s);
    data = '{'; assert.equal(recall(), null); data = '{"agents":3}'; assert.equal(recall(), null);
  } finally { if (old) Object.defineProperty(globalThis, 'localStorage', old); else Reflect.deleteProperty(globalThis, 'localStorage'); }
});
test('low-tier hidden choices roundtrip through links and local memory', () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage'); let raw: string | null = null;
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => raw, setItem: (_k: string, v: string) => { raw = v; } } });
    const original = createStore(params, { car: 'NEW', regions: ['anz'], agents: ['edge-core'] });
    original.apply('Lite', (s) => { s.tier = 'Lite'; });
    const snapshot = original.get(), query = encode(snapshot, params.version);
    assert.equal(new URLSearchParams(query).get('h'), 'edge-core');
    const decoded = decode(query, params); assert.deepEqual(decoded.sel, snapshot); assert.deepEqual(decoded.dropped, []);
    remember(snapshot); assert.deepEqual(recall(), snapshot);
    const stores = [original, createStore(params, decoded.sel), createStore(params, recall()!)];
    for (const st of stores) {
      st.apply('MAX', (s) => { s.tier = 'MAX'; });
      assert.deepEqual(st.get().agents, ['edge-core']);
      assert.equal(compute(params, st.get()).nre.known, 124.947);
    }
  } finally { if (old) Object.defineProperty(globalThis, 'localStorage', old); else Reflect.deleteProperty(globalThis, 'localStorage'); }
});
test('hidden link ids are validated against the selected package', () => {
  const d = decode('p=c3-euanz&t=Lite&h=edge-core,bogus,p1-core,edge-core', params);
  assert.deepEqual((d.sel as { hidden?: string[] }).hidden, ['edge-core']);
  assert.deepEqual(d.dropped, ['h=bogus', 'h=p1-core']);
});
