import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Agent, Params, Result, Selection } from '../../src/lab/modules/cost-estimator/core/types.ts';
const dir = process.env.COST_ESTIMATOR_DATA_DIR ?? resolve('src/data/cost-estimator');
export const params: Params = JSON.parse(readFileSync(process.env.COST_ESTIMATOR_PARAMS ?? resolve(dir, 'params.json'), 'utf8'));
export const golden: { name: string; selection: Selection; result: Result }[] = JSON.parse(readFileSync(process.env.COST_ESTIMATOR_GOLDEN ?? resolve(dir, 'golden.json'), 'utf8'));
export const scenario = (name: string) => {
  const g = golden.find((g) => g.name === name);
  if (!g) throw new Error(`没有金标场景 ${name}`);
  return structuredClone(g);
};
export function fixture() {
  const p = structuredClone(params), s = scenario('G-ANZ-PENDING').selection;
  p.capNames['test-cap'] = '测试能力';
  const a: Agent = { id: 'a', name: '测试智能体', layer: '测试', coverage: { MAX: '承接', PRO: '承接', Lite: '承接' }, caps: ['test-cap'], isVoice: false,
    first: { research: 10, product: 4, delivery: 6, direct: 2, preShared: false }, ext: { base: 2, perMarket: 1, perLang: .5, systemSwitch: 2 },
    lic: { mode: 'scaled', tokenPerCar: null, scaledBase: 7 }, notes: [], src: [] };
  p.packages[s.pkg].agents = [a]; s.agents = ['a']; s.overrides = {};
  return { p, s, a };
}
