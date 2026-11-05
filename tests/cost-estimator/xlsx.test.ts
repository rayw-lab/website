import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkbook, fileName } from '../../src/lab/modules/cost-estimator/xlsx.ts';
import { params, golden, scenario, fixture } from './data.ts';
import { unzip } from './zip.ts';
import { evaluator } from './formulas.ts';
import { compute } from '../../src/lab/modules/cost-estimator/core/compute.ts';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const make = (name = 'G-EU-MAX') => { const g = scenario(name); return unzip(buildWorkbook(params, g.selection, g.result)); };
test('zip is readable', () => {
  const f = make();
  for (const name of ['[Content_Types].xml', 'xl/workbook.xml', 'xl/styles.xml', ...[1, 2, 3].map((n) => `xl/worksheets/sheet${n}.xml`)]) assert.ok(f[name], name);
});
test('three sheet names', () => { for (const name of ['你选了什么', 'NRE 明细', 'LIC 明细']) assert.ok(make()['xl/workbook.xml'].includes(`name="${name}"`)); });
test('first row disclaimer', () => {
  for (const n of [1, 2, 3]) assert.match(make()[`xl/worksheets/sheet${n}.xml`], /<c r="A1"[^>]*>.*?<t[^>]*>成本粗估，不是报价<\/t>/);
});
test('langs in chinese', () => {
  const xml = make()['xl/worksheets/sheet1.xml']; assert.ok(xml.includes('德语')); assert.doesNotMatch(xml, />de<|>EN</);
});
test('formulas live', () => {
  const f = make(), xml = f['xl/worksheets/sheet2.xml'];
  assert.match(xml, /<f>[^<]*\$B\$3[^<]*<\/f>/); assert.match(xml, /<f>SUM\(/);
  assert.match(f['xl/workbook.xml'], /<calcPr fullCalcOnLoad="1"/);
  assert.doesNotMatch(xml, /<f>[^<]+<\/f><v>/); assert.ok(f['xl/styles.xml'].includes('FFF2CC'));
  for (const cell of xml.matchAll(/<f>(.*?)<\/f>/g)) assert.doesNotMatch(cell[1], /(?:IF|LET|XLOOKUP|PRODUCT|COUNTA)\(/);
});
test('pending is blank yellow', () => {
  const xml = make('G-ANZ-PENDING')['xl/worksheets/sheet3.xml'];
  assert.match(xml, /<c r="B\d+" s="1"\/>/); assert.ok(xml.includes('待补：澳新信源单价'));
});
test('LIC known sums retain separate pending explanations', () => {
  const g = scenario('G-EU+ANZ'), r = compute(params, g.selection);
  const xml = unzip(buildWorkbook(params, g.selection, r))['xl/worksheets/sheet3.xml'], read = evaluator(xml);
  assert.ok(Math.abs(read('B13')! - 779.44) < 1e-9); assert.equal(read('B14'), 0);
  assert.ok(Math.abs(read('B15')! - r.lic.token) < 1e-9);
  assert.ok(Math.abs(read('B16')! - r.lic.known) < 1e-9);
  const rows = new Map([...xml.matchAll(/<row r="(\d+)"[^>]*>(.*?)<\/row>/g)].map((m) => [m[1], m[2]]));
  assert.ok(rows.get('13')!.includes('待补：澳新信源单价'));
  assert.ok(!rows.get('13')!.includes('欧盟信源单价'));
  assert.ok(rows.get('14')!.includes('欧盟服务器单价、澳新服务器单价'));
  assert.ok(rows.get('15')!.includes('待补：') && rows.get('15')!.includes('调用费用'));
});
test('file name', () => {
  const g = scenario('G-EU-MAX'); assert.equal(fileName(params, g.selection), `成本粗估-欧盟澳新包-T13C-${params.version}.xlsx`);
});
test('formula graph matches known golden amounts and keeps pending calculations live', () => {
  for (const g of golden) {
    const files = unzip(buildWorkbook(params, g.selection, g.result));
    const read = Object.fromEntries(['你选了什么', 'NRE 明细', 'LIC 明细'].map((name, i) => [name, evaluator(files[`xl/worksheets/sheet${i + 1}.xml`])]));
    for (const m of files['xl/workbook.xml'].matchAll(/<definedName name="CE__(.*?)">'(.*?)'!(.*?)<\/definedName>/g)) {
      const path = m[1].split('__'); let expected: unknown = g.result;
      for (const k of path) expected = (expected as Record<string, unknown>)[k];
      const actual = read[m[2]](m[3]);
      if (expected === null && path.join('.') !== 'nre.total') {
        assert.ok(actual !== null && Number.isFinite(actual) && actual >= 0, `${g.name} ${path.join('.')} must retain a live known-part calculation`);
      } else if (expected === null) assert.equal(actual, null, `${g.name} ${path.join('.')}`);
      else assert.ok(actual !== null && Math.abs(actual - Number(expected)) < 1e-9, `${g.name} ${path.join('.')} expected ${expected}, got ${actual}`);
    }
  }
});
test('changing yellow research price changes known NRE through formulas', () => {
  const files = make('G-ROUND'), original = evaluator(files['xl/worksheets/sheet2.xml'])('B19')!;
  const changed = files['xl/worksheets/sheet2.xml'].replace('<v>4.41</v>', '<v>8.82</v>');
  const after = evaluator(changed)('B19')!;
  assert.ok(Math.abs(after - original - scenario('G-ROUND').result.nre.research) < 1e-9);
});
test('shared research pool has one editable source for all members', () => {
  const { p, s, a } = fixture(); const b = structuredClone(a); b.id = 'b'; p.packages[s.pkg].agents.push(b); s.agents.push('b');
  p.researchPools = [{ id: 'shared', caps: ['test-cap'], research: 10 }];
  const r = compute(p, s), files = unzip(buildWorkbook(p, s, r)), xml = files['xl/worksheets/sheet2.xml'];
  assert.equal([...xml.matchAll(/共用研究院工作包人月/g)].length, 1);
  assert.ok(Math.abs(evaluator(xml)('B13')! - 8.82) < 1e-9);
});
const setCell = (xml: string, ref: string, value: number) => xml.replace(new RegExp(`<c r="${ref}"[^>]*?(?:/>|>.*?</c>)`), `<c r="${ref}" s="1"><v>${value}</v></c>`);
test('pending NRE direct yellow input flows into row and known totals after filling', () => {
  const f = make('G-C15EU-EU'), xml = setCell(f['xl/worksheets/sheet2.xml'], 'B107', 100), read = evaluator(xml);
  assert.equal(read('G33'), 100);
  assert.ok(Math.abs(read('H33')! - 152.9785) < 1e-9);
  assert.equal(read('B16'), 100); assert.ok(Math.abs(read('B19')! - (scenario('G-C15EU-EU').result.nre.known + 100)) < 1e-9);
});
test('pending LIC scaled yellow input flows into token row and known total after filling', () => {
  const f = make('G-C15EU-EU'), xml = setCell(f['xl/worksheets/sheet3.xml'], 'B21', 100), read = evaluator(xml);
  assert.ok(Math.abs(read('B22')! - 385.7142857142857) < 1e-9);
  assert.ok(Math.abs(read('B16')! - 1354.6542857142858) < 1e-9);
});
test('pending first PM inputs update research product delivery PM and subtotal', () => {
  const p = structuredClone(params), g = scenario('G-C15EU-EU');
  const a = p.packages['c15-eu'].agents.find((a) => a.id === 'p2-nearby')!;
  Object.assign(a.first!, { research: null, product: null, delivery: null, direct: null });
  let xml = unzip(buildWorkbook(p, g.selection, compute(p, g.selection)))['xl/worksheets/sheet2.xml'];
  for (const [ref, value] of [['B104', 10], ['B105', 4], ['B106', 6], ['B107', 100]] as const) xml = setCell(xml, ref, value);
  const read = evaluator(xml);
  assert.equal(read('C33'), 20); assert.equal(read('D33'), 8.82); assert.equal(read('E33'), 3); assert.equal(read('F33'), 18);
  assert.ok(Math.abs(read('H33')! - 129.82) < 1e-9);
});
test('language first weight is a yellow editable input linked to totals', () => {
  const { p, s } = fixture(); s.regions = ['eu']; p.regions.eu.langs = ['zh', 'yue'];
  Object.assign(p.langs.zh, { anchorRank: 1 }); Object.assign(p.langs.yue, { anchorRank: 2 });
  p.langFirst = { 'test-cap': { overall: 100, research: null, src: '' } };
  const xml = unzip(buildWorkbook(p, s, compute(p, s)))['xl/worksheets/sheet2.xml'];
  const row = [...xml.matchAll(/<row r="(\d+)"[^>]*>(.*?)<\/row>/g)].find((m) => m[2].includes('中文') && m[2].includes('语种首发权重'));
  assert.ok(row, 'Chinese first weight input must exist');
  const ref = `B${row[1]}`;
  assert.match(row[2], new RegExp(`<c r="${ref}" s="1"><v>1<\/v><\/c>`));
  assert.equal(evaluator(xml)('B17'), 30);
  const changed = evaluator(setCell(xml, ref, 2));
  assert.equal(changed('B17'), 50);
  assert.ok(Math.abs(changed('B19')! - evaluator(xml)('B19')! - 20) < 1e-9);
});
test('LibreOffice recomputes filled NRE and LIC yellow inputs against Python truth', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ce-pending-recalc-'));
  try {
    const g = scenario('G-C15EU-EU'), path = join(dir, 'source.xlsx');
    writeFileSync(path, buildWorkbook(params, g.selection, compute(params, g.selection)));
    writeFileSync(join(dir, 'params.json'), JSON.stringify(params));
    writeFileSync(join(dir, 'scenario.json'), JSON.stringify(g));
    const run = spawnSync('python3', [fileURLToPath(new URL('./recalc-pending.py', import.meta.url)), path, join(dir, 'params.json'), join(dir, 'scenario.json')], { encoding: 'utf8', timeout: 150_000 });
    process.stdout.write(run.stdout ?? '');
    assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}\n${run.error ?? ''}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
