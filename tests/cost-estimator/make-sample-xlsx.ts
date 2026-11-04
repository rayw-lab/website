import { writeFileSync } from 'node:fs';
import { buildWorkbook } from '../../src/lab/modules/cost-estimator/xlsx.ts';
import { compute } from '../../src/lab/modules/cost-estimator/core/compute.ts';
import { params, scenario } from './data.ts';
const [name, out] = process.argv.slice(2);
if (!name || !out) throw new Error('用法：node make-sample-xlsx.ts <scenario> <out.xlsx>');
const g = scenario(name);
writeFileSync(out, buildWorkbook(params, g.selection, compute(params, g.selection)));
console.log(`${name}: ${out}`);
