#!/usr/bin/env node
/**
 * 帧库 · 构建期管线：视频 → 帧体图集 + 活动投影 + manifest + BUILD-RECEIPT
 *
 * ops 机运行（需要 ffmpeg、cwebp、raw 仓），产物入库；不进 CI。
 * 用法：
 *   node scripts/frame-vault-build.mjs --state <EPISODE-STATE.json> --video-dir <重编码 mp4 目录> [--eps EP2,EP3]
 * 产物：
 *   public/demo/frame-vault/<ep>/{atlas-k.webp, proj-xt.png, proj-yt.png, manifest.json}
 *   src/data/frame-vault/<ep>.json（同 manifest，Astro 构建期读）
 *   evidence/frame-vault/<ep>/BUILD-RECEIPT.json
 * 纪律：sha 不符即 FAIL；manifest 零本地路径；数字全部从源文件读，不手写。
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePngGray } from './lib/png-gray.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const W = 160, H = 90, TILE = 16, PER_ATLAS = TILE * TILE, MAX_SLICES = 2000;
const FPS_LADDER = [6, 4, 3, 2, 1, 0.5];
const LOCKS = [
  { letter: 'D', name: '开发' }, { letter: 'S', name: '台本锁' }, { letter: 'A', name: '样片锁' },
  { letter: 'P', name: '画面锁' }, { letter: 'M', name: '声音锁' }, { letter: 'F', name: '定稿' },
];
const FORBIDDEN = /\/Users\/|studio-data-root|worktrees\//;
const WHISPER_MODEL = 'mlx-community/whisper-large-v3-turbo';

const args = parseArgs(process.argv.slice(2));
const statePath = resolve(args.state ?? '');
const videoDir = resolve(args['video-dir'] ?? '');
if (!existsSync(statePath) || !existsSync(videoDir)) usage();
const state = JSON.parse(readFileSync(statePath, 'utf8'));
const rawDir = dirname(statePath);
const only = args.eps ? String(args.eps).split(',').map((s) => s.trim().toUpperCase()) : null;
const episodes = state.episodes.filter((e) => e.current_sha256 && (!only || only.includes(e.ep)));

const rows = [];
let failed = 0;
for (const ep of episodes) {
  try {
    rows.push(buildEpisode(ep));
  } catch (err) {
    failed++;
    rows.push({ ep: ep.ep, status: 'FAIL', note: String(err.message ?? err) });
  }
}
// 全集状态（含无成片的集：线框立方体，只有锁与门灯）—— 供 S2 陈列；同样零本地路径
const allEpisodes = state.episodes.map((e) => ({
  ep: e.ep, title: e.title ?? null, stage: e.stage ?? null, label: e.current_label ?? null,
  gates: e.gates ?? null, has_video: Boolean(e.current_sha256), sha8: e.current_sha256 ? e.current_sha256.slice(0, 8) : null,
  duration_s: e.duration_s ?? null, next_lock: e.next_lock ?? null, human_score: e.human_score ?? null,
}));
const epText = JSON.stringify({ updated_at: state.updated_at ?? null, locks: LOCKS, episodes: allEpisodes }, null, 2) + '\n';
if (FORBIDDEN.test(epText)) { console.error('episodes.json 含本地路径'); process.exit(1); }
mkdirSync(join(ROOT, 'src/data/frame-vault'), { recursive: true });
writeFileSync(join(ROOT, 'src/data/frame-vault/episodes.json'), epText);
console.table(rows);
process.exit(failed ? 1 : 0);

// ---------------------------------------------------------------------------

function buildEpisode(ep) {
  const key = ep.ep.toLowerCase();
  const src = ep.producer_path;
  if (!src || !existsSync(src)) throw new Error(`原片不存在：${ep.ep}`);
  const sha = sha256File(src);
  if (sha !== ep.current_sha256) throw new Error(`sha 不符：登记 ${ep.current_sha256.slice(0, 8)} / 实际 ${sha.slice(0, 8)}`);
  const video = join(videoDir, `${key}.mp4`);
  if (!existsSync(video)) throw new Error(`重编码视频缺失：${video}`);

  const fps = FPS_LADDER.find((f) => Math.ceil(ep.duration_s * f) <= MAX_SLICES);
  if (!fps) throw new Error('时长超出 0.5 fps 仍 >2000 片');
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', src, '-vf', `fps=${fps},scale=${W}:${H}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 });
  const n = Math.floor(raw.length / (W * H * 3));
  if (n < 2) throw new Error('抽帧为空');

  const outDir = join(ROOT, 'public/demo/frame-vault', key);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const atlas = writeAtlases(raw, n, outDir);
  const proj = writeProjections(raw, n, outDir);

  const rings = readJsonl(join(rawDir, 'fixtures/human-rejects.jsonl'))
    .filter((r) => r.ep === ep.ep && r.status === 'LOCATABLE')
    .map(({ id, time_s, frame, defect_class, quote, fixed_in, status, region }) => ({ id, time_s, frame, defect_class, quote, fixed_in, status, region: region ?? null }));
  const reviews = readJsonl(join(rawDir, 'HUMAN-REVIEW-LOG.jsonl'))
    .filter((r) => r.ep === ep.ep)
    .map(({ id, date, verdict, category, timecode }) => ({ id, date, verdict, category, timecode: timecode ?? null }));

  const videoSha = sha256File(video);
  // whisper 片尾会幻听出超出时长的句子（EP5 实证 300–316 s，成片 306.7 s）：起点越界的丢，终点夹到时长
  const cuesRaw = transcribe(video, videoSha, join(ROOT, 'evidence/frame-vault', key));
  const cues = cuesRaw ? cuesRaw.filter((c) => c.start < ep.duration_s).map((c) => ({ ...c, end: Math.min(c.end, +ep.duration_s.toFixed(2)) })) : null;
  const manifest = {
    ep: ep.ep, title: ep.title, stage: ep.stage, label: ep.current_label ?? null,
    gates: ep.gates ?? null, sha256: sha, bytes: ep.bytes, duration_s: ep.duration_s, frames: ep.frames ?? null,
    fps_src: ep.frames ? ep.frames / ep.duration_s : null,
    volume: { w: W, h: H, n, fps, atlas: atlas.map((a) => a.name), proj: { xt: proj.xt.name, yt: proj.yt.name } },
    rings, reviews, locks: LOCKS,
    script: cues ? { source: 'asr', model: WHISPER_MODEL, segments: cues.length, cues } : null,
    script_pack: ep.script_pack ? { narration_sha256: ep.script_pack.narration_sha256 ?? null, director_sha256: ep.script_pack.director_sha256 ?? null } : null,
    video: { src: `/website/video/frame-vault/${key}.mp4`, sha256: videoSha, bytes: statSize(video) },
    built_at: new Date().toISOString(),
  };
  const text = JSON.stringify(manifest, null, 2) + '\n';
  if (FORBIDDEN.test(text)) throw new Error('manifest 含本地路径');
  writeFileSync(join(outDir, 'manifest.json'), text);
  mkdirSync(join(ROOT, 'src/data/frame-vault'), { recursive: true });
  writeFileSync(join(ROOT, 'src/data/frame-vault', `${key}.json`), text);

  const evDir = join(ROOT, 'evidence/frame-vault', key);
  mkdirSync(evDir, { recursive: true });
  const receipt = {
    ep: ep.ep, input_sha256: sha, fps, n, atlas_count: atlas.length,
    products: [...atlas, proj.xt, proj.yt].map((p) => ({ name: p.name, bytes: p.bytes, sha256: p.sha256 })),
    atlas_bytes_total: atlas.reduce((s, a) => s + a.bytes, 0),
    video: { bytes: statSize(video), sha256: videoSha },
    ffmpeg: version('ffmpeg', ['-version']), cwebp: version('cwebp', ['-version']), built_at: manifest.built_at,
  };
  writeFileSync(join(evDir, 'BUILD-RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n');
  return { ep: ep.ep, status: 'OK', fps, n, atlases: atlas.length, atlasKB: Math.round(receipt.atlas_bytes_total / 1024), rings: rings.length, reviews: reviews.length };
}

/** 每 256 帧一张 16×16 网格，PPM → cwebp 无损 -z 9（R2-2 实测：纸色+文字用无损反而最小） */
function writeAtlases(raw, n, outDir) {
  const out = [];
  const aw = W * TILE, ah = H * TILE;
  for (let k = 0; k * PER_ATLAS < n; k++) {
    const img = Buffer.alloc(aw * ah * 3, 0);
    const count = Math.min(PER_ATLAS, n - k * PER_ATLAS);
    for (let f = 0; f < count; f++) {
      const z = k * PER_ATLAS + f;
      const ox = (f % TILE) * W, oy = Math.floor(f / TILE) * H;
      for (let y = 0; y < H; y++) {
        raw.copy(img, ((oy + y) * aw + ox) * 3, (z * H + y) * W * 3, (z * H + y + 1) * W * 3);
      }
    }
    const ppm = join(outDir, `atlas-${k}.ppm`);
    writeFileSync(ppm, Buffer.concat([Buffer.from(`P6\n${aw} ${ah}\n255\n`), img]));
    const name = `atlas-${k}.webp`;
    run('cwebp', ['-quiet', '-lossless', '-z', '9', ppm, '-o', join(outDir, name)]);
    rmSync(ppm);
    out.push(fileInfo(outDir, name));
  }
  return out;
}

/** 逐帧差分（三通道之和 ×2 clip 255）→ x–t（沿 y 取最大）与 y–t（沿 x 取最大）投影，8-bit 灰度 PNG */
function writeProjections(raw, n, outDir) {
  const xt = new Uint8Array(n * W), yt = new Uint8Array(n * H);
  for (let z = 1; z < n; z++) {
    const a = z * W * H * 3, b = (z - 1) * W * H * 3;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 3;
        const d = Math.abs(raw[a + i] - raw[b + i]) + Math.abs(raw[a + i + 1] - raw[b + i + 1]) + Math.abs(raw[a + i + 2] - raw[b + i + 2]);
        const v = Math.min(255, d * 2);
        if (v > xt[x * n + z]) xt[x * n + z] = v;   // 行 = x，列 = 时间
        if (v > yt[y * n + z]) yt[y * n + z] = v;
      }
    }
  }
  writeFileSync(join(outDir, 'proj-xt.png'), encodePngGray(xt, n, W));
  writeFileSync(join(outDir, 'proj-yt.png'), encodePngGray(yt, n, H));
  return { xt: fileInfo(outDir, 'proj-xt.png'), yt: fileInfo(outDir, 'proj-yt.png') };
}

/**
 * 台本时间对齐：磊哥 2026-09-05——不装新模型，直接用本机现成 mlx_whisper（scout 系工作流同款）。
 * 成片没有带时间的字幕（烧在画面里），所以对成片音轨做 ASR 得到句级时间；按视频 sha 缓存在 evidence，
 * 同一 sha 不重跑。mlx_whisper 缺席 → 返回 null（背面只显示无时间台本，草案 §7 降级）。
 */
function transcribe(video, videoSha, evDir) {
  mkdirSync(evDir, { recursive: true });
  const cache = join(evDir, `cues-${videoSha.slice(0, 8)}.json`);
  if (!existsSync(cache)) {
    const probe = spawnSync('mlx_whisper', ['--help'], { stdio: 'pipe' });
    if (probe.status !== 0) { console.warn(`[frame-vault] mlx_whisper 不可用，${video} 不做台本对齐`); return null; }
    const tmp = join(evDir, '_asr');
    rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
    run('mlx_whisper', [video, '--model', WHISPER_MODEL, '--language', 'zh', '--output-format', 'json', '--output-dir', tmp, '--word-timestamps', 'True']);
    const outName = readdirSync(tmp).find((f) => f.endsWith('.json'));
    // mlx_whisper 会把 avg_logprob 写成裸 NaN（非法 JSON，EP5 实证）：先按 JSON 语法换成 null 再解析
    const raw = JSON.parse(readFileSync(join(tmp, outName), 'utf8').replace(/:\s*(NaN|-?Infinity)\b/g, ': null'));
    const cues = raw.segments.map((sg) => ({ start: +sg.start.toFixed(2), end: +sg.end.toFixed(2), text: String(sg.text).trim() })).filter((c) => c.text);
    writeFileSync(cache, JSON.stringify({ model: WHISPER_MODEL, video_sha256: videoSha, cues }, null, 1) + '\n');
    rmSync(tmp, { recursive: true, force: true });
  }
  return JSON.parse(readFileSync(cache, 'utf8')).cues;
}

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function sha256File(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
function statSize(path) { return readFileSync(path).length; }
function fileInfo(dir, name) { const p = join(dir, name); const buf = readFileSync(p); return { name, bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex') }; }
function run(cmd, a) { const r = spawnSync(cmd, a, { stdio: 'pipe' }); if (r.status !== 0) throw new Error(`${cmd} rc=${r.status}: ${r.stderr}`); }
function version(cmd, a) { const r = spawnSync(cmd, a, { stdio: 'pipe' }); return String(r.stdout || r.stderr).split('\n')[0].trim(); }
function parseArgs(argv) { const o = {}; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { o[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; } } return o; }
function usage() { console.error('用法：node scripts/frame-vault-build.mjs --state <EPISODE-STATE.json> --video-dir <dir> [--eps EP2,EP3]'); process.exit(2); }
