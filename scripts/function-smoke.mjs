#!/usr/bin/env node
// 功能冒烟哨兵（CC-OBS-C2）—— 可观测规格 docs/spec/cyber-city-observability.md §6.2 冻结算法。
// score-loop.mjs 同构 sibling：只读 session dump（不跑浏览器），人读明细表 +
// test-results/function-smoke.json（§6.3 schema v1）+ 末行机读 `FUNCTION_SMOKE=<0-100>`。
//
// 定位（§6.5 四层分工）：冒烟分 = **哨兵不是登记分**——纯存在性/顺序性，不掺任何
// 时长/帧率（SwiftShader 下时长无意义）；功能登记分归 CC-AL-FXN 审计
// （docs/research/cyber-city-function-rubric-score.json）。首个 Loop 软门
// （OBS annotation），稳定后再议转硬（§9 开放问题 4）。
//
// 输入：--dump <path> 可重复（缺省 test-results/session-dump-funnel.json）；
//       多 dump 取并集（任一命中即命中——漏斗时序在单 dump 内校验，跨 dump 不比 t）。
// 计分（0-100 冻结）：
//   漏斗完整性 70% = 七步 × 10%——步 i 命中 ⇔ funnel[i] !== null 且对 ∀ j < i
//   （§3.2 声明序）：funnel[j] !== null && funnel[j] ≤ funnel[i]（同帧相等合法：
//   car_ready 同帧 driving 是既有契约；前步缺失或时序倒挂则本步不计）；
//   交互面覆盖 30% = 四项 × 7.5%——events 中存在 ≥1 条 cone-hit/respawn/world-poi/
//   world-drive-view。
// 退出码（score-loop 同构）：0 = 计算完成（分数高低不影响）；--min N 且分 < N → 1；
//   输入缺失/schemaVersion ≠ 1 → 2（基础设施问题区别于低分）。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

// ---------- CLI ----------
const args = process.argv.slice(2);
const DUMPS = [];
let MIN = null;
let OUT = 'test-results/function-smoke.json';
for (let i = 0; i < args.length; i++) {
  const take = () => {
    const v = args[i + 1];
    if (v === undefined || v.startsWith('--')) {
      console.error(`参数 ${args[i]} 缺少取值`);
      process.exit(2);
    }
    i++;
    return v;
  };
  if (args[i] === '--dump') DUMPS.push(take());
  else if (args[i] === '--min') MIN = Number(take());
  else if (args[i] === '--out') OUT = take();
  else {
    console.error(`未知参数：${args[i]}（支持 --dump <path>（可重复）/ --min N / --out <path>）`);
    process.exit(2);
  }
}
if (DUMPS.length === 0) DUMPS.push('test-results/session-dump-funnel.json');

// ---------- 冻结常量 ----------
/** funnel 七步声明序（§3.2 SessionDump.funnel 键序；步权重各 10%） */
const FUNNEL_STEPS = [
  'reveal',
  'robotIdle',
  'transformStart',
  'carReady',
  'driveStart',
  'firstPoiIn',
  'firstPoiInteract',
];
const FUNNEL_STEP_WEIGHT = 10;

/** 交互面覆盖四事件（各 7.5%） */
const COVERAGE_TYPES = ['cone-hit', 'respawn', 'world-poi', 'world-drive-view'];
const COVERAGE_WEIGHT = 7.5;

/**
 * knownGaps 常量表（§6.2）：「事件 → 依赖任务」——未命中且在表内 → 输出 knownGaps
 * 注记，只注记不改分（哨兵看趋势，分母跨轮恒定）；依赖合流后删行（加法维护）。
 * 维护记录：v1 初始行 `world-drive-view → VEH-VIEW 合流` 已随 CC-VEH-VIEW（PR #54）
 * 合流删除——当前表为空。
 */
const KNOWN_GAPS = {
  // 'event-type': '依赖任务说明',
};

// ---------- 读入 ----------
const dumps = [];
for (const path of DUMPS) {
  if (!existsSync(path)) {
    console.error(`✖ dump 不存在：${path}（先跑 e2e CITY-OBS-01 产出，或用 --dump 指定）`);
    process.exit(2);
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`✖ dump 不是合法 JSON：${path}（${e.message}）`);
    process.exit(2);
  }
  if (parsed.schemaVersion !== 1) {
    console.error(
      `✖ dump schemaVersion 不符：${path} 为 ${parsed.schemaVersion}，本脚本消费 v1` +
        '（规格 §3.6：破坏性变更需消费方同 PR 适配）',
    );
    process.exit(2);
  }
  dumps.push({ path, dump: parsed });
}

// ---------- 漏斗完整性（70%）：单 dump 内判命中，跨 dump 取并集 ----------
/** 步 i 在单 dump 内命中：非 null 且全部前步非 null、单调不减（同帧相等合法） */
function funnelHitInDump(funnel, index) {
  const t = funnel?.[FUNNEL_STEPS[index]];
  if (typeof t !== 'number') return false;
  for (let j = 0; j < index; j++) {
    const prev = funnel?.[FUNNEL_STEPS[j]];
    if (typeof prev !== 'number' || prev > t) return false;
  }
  return true;
}

const funnelResult = {};
for (let i = 0; i < FUNNEL_STEPS.length; i++) {
  const step = FUNNEL_STEPS[i];
  let hit = false;
  let t = null;
  for (const { dump } of dumps) {
    if (funnelHitInDump(dump.funnel, i)) {
      hit = true;
      if (t === null) t = dump.funnel[step]; // t 取首个命中 dump 的原始值（仅人读，不计分）
    }
  }
  funnelResult[step] = { hit, t };
}
const funnelHits = FUNNEL_STEPS.filter((step) => funnelResult[step].hit).length;
const funnelScore = funnelHits * FUNNEL_STEP_WEIGHT;

// ---------- 交互面覆盖（30%）：任一 dump 的 events 含 ≥1 条即命中 ----------
const coverage = {};
for (const type of COVERAGE_TYPES) {
  coverage[type] = dumps.some(({ dump }) =>
    (dump.events ?? []).some((event) => event.type === type),
  );
}
const coverageHits = COVERAGE_TYPES.filter((type) => coverage[type]).length;
const coverageScore = coverageHits * COVERAGE_WEIGHT;

const score = Number((funnelScore + coverageScore).toFixed(1));

// knownGaps：未命中且在常量表内 → 注记（不改分）
const knownGaps = COVERAGE_TYPES.filter((type) => !coverage[type] && KNOWN_GAPS[type]).map(
  (type) => `${type}（${KNOWN_GAPS[type]}）`,
);

// ---------- 输出 ----------
console.log('══════ 功能冒烟哨兵（cyber-city-observability.md §6.2 口径） ══════');
console.log(`  漏斗完整性（70%）：${funnelHits}/7 步 → ${funnelScore.toFixed(1)} 分`);
for (const step of FUNNEL_STEPS) {
  const { hit, t } = funnelResult[step];
  console.log(
    `    ${hit ? '✅' : '❌'} ${step.padEnd(17)}${hit ? `t=${t}ms（仅人读，不计分）` : '未达/时序倒挂'}`,
  );
}
console.log(`  交互面覆盖（30%）：${coverageHits}/4 项 → ${coverageScore.toFixed(1)} 分`);
for (const type of COVERAGE_TYPES) {
  console.log(`    ${coverage[type] ? '✅' : '❌'} ${type}`);
}
if (knownGaps.length > 0) console.log(`  knownGaps（只注记不改分）：${knownGaps.join('、')}`);
console.log('───────────────────────────────────────────────');
console.log(`  冒烟分 ${score.toFixed(1)}/100（哨兵软门，不冒充功能登记分——§6.5 四层分工）`);

const output = {
  schemaVersion: 1,
  computedAt: new Date().toISOString(),
  score,
  funnel: funnelResult,
  coverage,
  knownGaps,
  dumps: DUMPS,
  sessions: dumps.map(({ dump }) => ({
    sessionId: dump.sessionId,
    events: (dump.events ?? []).length,
    dropped: dump.dropped ?? 0,
    backend: dump.env?.backend ?? 'pending',
    vehicle: dump.env?.vehicle ?? 'pending',
  })),
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');
console.log(`  明细 JSON → ${OUT}`);
console.log(`FUNCTION_SMOKE=${score.toFixed(1)}`);

if (MIN !== null && score < MIN) {
  console.error(`冒烟分 ${score.toFixed(1)} < 门槛 ${MIN}`);
  process.exit(1);
}
