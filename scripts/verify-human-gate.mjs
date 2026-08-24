#!/usr/bin/env node
/**
 * 人工 Gate 回填完整性检查——合并 main 前由王磊本地运行。
 * 不替代人工测试本身；仅校验签署档与证据目录是否已填。
 *
 * 用法：node scripts/verify-human-gate.mjs
 * 通过 → exit 0；未填 → exit 1 + 清单
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const signoff = join(root, 'docs/spec/mvp-gate-signoff.md');
const checklist = join(root, 'docs/spec/human-gate-checklist.md');
const assetsDir = join(root, 'docs/spec/assets/human-gate');

const failures = [];

function read(path) {
  if (!existsSync(path)) {
    failures.push(`缺少文件：${path}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

const signoffText = read(signoff);
const checklistText = read(checklist);

for (const [id, label] of [
  ['H1', '10 秒定位'],
  ['H2', '桌面帧率'],
  ['H3', '安卓帧率'],
]) {
  const row = signoffText.match(new RegExp(`\\| ${id} \\|[^\\n]+`));
  if (!row || /未执行/.test(row[0])) {
    failures.push(`mvp-gate-signoff.md：${id}（${label}）仍为「未执行」`);
  }
}

if (/【待填】/.test(checklistText)) {
  const pending = (checklistText.match(/【待填】/g) || []).length;
  failures.push(`human-gate-checklist.md：仍有 ${pending} 处【待填】`);
}

if (!existsSync(assetsDir)) {
  failures.push('证据目录不存在：docs/spec/assets/human-gate/');
} else {
  const evidence = readdirSync(assetsDir).filter(
    (f) => /\.(png|jpg|webp|mp4|webm|mov)$/i.test(f),
  );
  if (evidence.length < 2) {
    failures.push(
      `human-gate/ 证据不足：需至少 2 个录屏或截图（当前 ${evidence.length}）`,
    );
  }
}

if (failures.length) {
  console.error('❌ 人工 Gate 未就绪，无法签署 MVP Gate 整体：\n');
  failures.forEach((f) => console.error(`  · ${f}`));
  console.error('\n执行：pnpm human-gate:preview → 填 checklist + signoff → 存证据到 human-gate/');
  process.exit(1);
}

console.log('✅ 人工 Gate 回填完整性检查通过（签署档 + 清单 + 证据目录）。');
console.log('   可更新 goal-progress-status「目标整体」为 Go，并合并 main。');
