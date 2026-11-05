#!/usr/bin/env node
/**
 * 帧库 · 构建期门：manifest ↔ EPISODE-STATE 一致、环时刻在时长内、零本地路径、
 * 图集张数与投影尺寸自洽、引用文件实存、图集体积门。
 *
 *   node scripts/frame-vault-gate.mjs --state <EPISODE-STATE.json>
 *   node scripts/frame-vault-gate.mjs --selftest            # 注入坏样本，断言门会红
 * 输出 `checked=<数> violations=<数>`；violations>0 或 checked==0 → rc=1（式三：没分母的门不可信）。
 */
import { existsSync, readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pngSize } from './lib/png-gray.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FORBIDDEN = /\/Users\/|studio-data-root|worktrees\//;
const ATLAS_BUDGET = 10 * 1024 * 1024;   // 草案 §5.3：R2-2 按 EP3 定 2.5 MB，EP2（烧字幕、镜头多）实测 9.6 MB → R2-4 改 10 MB，只按需加载当前集
const args = parseArgs(process.argv.slice(2));

if (args.selftest) { selftest(); }
else {
  const r = gate(join(ROOT, 'public/demo/frame-vault'), join(ROOT, 'src/data/frame-vault'), args.state ? JSON.parse(readFileSync(resolve(args.state), 'utf8')) : null);
  for (const v of r.violations) console.error('✖', v);
  console.log(`checked=${r.checked} violations=${r.violations.length}`);
  process.exit(r.violations.length > 0 || r.checked === 0 ? 1 : 0);
}

export function gate(demoDir, dataDir, state) {
  const violations = [];
  let checked = 0;
  if (!existsSync(demoDir)) return { checked, violations: [`目录不存在：${demoDir}`] };
  for (const key of readdirSync(demoDir).filter((d) => existsSync(join(demoDir, d, 'manifest.json')))) {
    checked++;
    const dir = join(demoDir, key);
    const text = readFileSync(join(dir, 'manifest.json'), 'utf8');
    const m = JSON.parse(text);
    const tag = `${key}:`;
    if (FORBIDDEN.test(text)) violations.push(`${tag} manifest 含本地路径`);
    const twin = join(dataDir, `${key}.json`);
    if (!existsSync(twin) || readFileSync(twin, 'utf8') !== text) violations.push(`${tag} src/data 副本缺失或不同`);
    if (state) {
      const reg = state.episodes.find((e) => e.ep === m.ep);
      if (!reg) violations.push(`${tag} EPISODE-STATE 无此集`);
      else if (reg.current_sha256 !== m.sha256) violations.push(`${tag} sha256 与 EPISODE-STATE 不符`);
    }
    for (const r of m.rings ?? []) if (!(r.time_s >= 0 && r.time_s <= m.duration_s)) violations.push(`${tag} 环 ${r.id} time_s=${r.time_s} 超出时长 ${m.duration_s}`);
    for (const c of m.script?.cues ?? []) if (!(c.start >= 0 && c.end <= m.duration_s + 0.5 && c.end >= c.start)) violations.push(`${tag} 台本句 ${c.start}–${c.end} 越界`);
    if (m.script && (m.script.cues?.length ?? 0) !== m.script.segments) violations.push(`${tag} script.segments 与 cues 数不符`);
    const n = m.volume?.n ?? 0;
    if (!(n >= 2 && n <= 2000)) violations.push(`${tag} 片数 ${n} 不在 2..2000`);
    if ((m.volume?.atlas ?? []).length !== Math.ceil(n / 256)) violations.push(`${tag} 图集张数 ${m.volume?.atlas?.length} ≠ ceil(${n}/256)`);
    let atlasBytes = 0;
    for (const a of m.volume?.atlas ?? []) {
      const p = join(dir, a);
      if (!existsSync(p)) { violations.push(`${tag} 图集缺失 ${a}`); continue; }
      atlasBytes += readFileSync(p).length;
    }
    if (atlasBytes > ATLAS_BUDGET) violations.push(`${tag} 图集合计 ${atlasBytes} B 超预算 ${ATLAS_BUDGET}`);
    for (const [k, h] of [['xt', m.volume?.w], ['yt', m.volume?.h]]) {
      const p = join(dir, m.volume?.proj?.[k] ?? '');
      if (!existsSync(p)) { violations.push(`${tag} 投影缺失 ${k}`); continue; }
      const s = pngSize(readFileSync(p));
      if (!s || s.width !== n || s.height !== h) violations.push(`${tag} 投影 ${k} 尺寸 ${s?.width}×${s?.height} ≠ ${n}×${h}`);
    }
    const src = String(m.video?.src ?? '');
    if (/^https?:\/\//.test(src)) { if (!/^https:\/\/github\.com\/rayw-lab\/website\/releases\/download\//.test(src)) violations.push(`${tag} 视频外链不在 Release 白名单：${src}`); }
    else if (!existsSync(join(ROOT, 'public', src.replace(/^\/website/, '')))) violations.push(`${tag} 视频缺失 ${src}`);
  }
  return { checked, violations };
}

/** 正控（原样必绿）+ 三个负控（各自必红且报对文件名） */
function selftest() {
  const demo = join(ROOT, 'public/demo/frame-vault'), data = join(ROOT, 'src/data/frame-vault');
  const base = gate(demo, data, null);
  if (base.checked === 0 || base.violations.length) { console.error('selftest：正控不绿', base); process.exit(1); }
  const key = readdirSync(demo).find((d) => existsSync(join(demo, d, 'manifest.json')));
  const cases = [
    ['环越界', (m) => { m.rings = [{ id: 'X', time_s: m.duration_s + 1 }]; }, /超出时长/],
    ['本地路径', (m) => { m.note = '/Users/x'; }, /本地路径/],
    ['图集张数', (m) => { m.volume.atlas = m.volume.atlas.slice(1); }, /图集张数/],
  ];
  let bad = 0;
  for (const [name, mutate, re] of cases) {
    const tmp = mkdtempSync(join(tmpdir(), 'fv-gate-'));
    cpSync(demo, join(tmp, 'demo'), { recursive: true }); cpSync(data, join(tmp, 'data'), { recursive: true });
    const p = join(tmp, 'demo', key, 'manifest.json');
    const m = JSON.parse(readFileSync(p, 'utf8')); mutate(m);
    const t = JSON.stringify(m, null, 2) + '\n';
    writeFileSync(p, t); writeFileSync(join(tmp, 'data', `${key}.json`), t);
    const r = gate(join(tmp, 'demo'), join(tmp, 'data'), null);
    const hit = r.violations.some((v) => re.test(v) && v.startsWith(`${key}:`));
    console.log(`${hit ? '✔' : '✖'} 负控「${name}」 violations=${r.violations.length}`);
    if (!hit) bad++;
    rmSync(tmp, { recursive: true, force: true });
  }
  console.log(`selftest checked=${base.checked} negatives=${cases.length} failed=${bad}`);
  process.exit(bad ? 1 : 0);
}

function parseArgs(argv) { const o = {}; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { o[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; } } return o; }
