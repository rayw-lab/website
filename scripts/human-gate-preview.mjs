#!/usr/bin/env node
/**
 * 人工 Gate 本地预览伺服——build + preview --host，打印手机可访问 URL。
 * 用法：node scripts/human-gate-preview.mjs
 * 见 docs/spec/human-gate-checklist.md
 */
import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { execSync } from 'node:child_process';

const PORT = Number(process.env.HUMAN_GATE_PORT || 4321);
const BASE = '/website';

function lanIp() {
  for (const ifaces of Object.values(networkInterfaces())) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

console.log('▶ pnpm build …');
execSync('pnpm build', { stdio: 'inherit' });

const ip = lanIp();
const local = `http://localhost:${PORT}${BASE}/`;
const lan = `http://${ip}:${PORT}${BASE}/`;
const spike = `${lan}world-spike/`;
const spikeGl2 = `${spike}?gl=1`;

console.log('\n══════════════════════════════════════════════════');
console.log('  人工 Gate 预览伺服（与 E2E 同口径：build 产物）');
console.log('══════════════════════════════════════════════════');
console.log('\n【H1 10 秒定位】手机浏览器打开首页：');
console.log(`  ${lan}`);
console.log('\n【H2/H3 帧率录测】world-spike：');
console.log(`  默认后端  ${spike}`);
console.log(`  WebGL 2   ${spikeGl2}`);
console.log('\n本机调试：');
console.log(`  ${local}`);
console.log('\n证据归档：docs/spec/assets/human-gate/');
console.log('回填：human-gate-checklist.md → mvp-gate-signoff.md §人工签署区');
console.log('══════════════════════════════════════════════════\n');

const child = spawn(
  'pnpm',
  ['exec', 'astro', 'preview', '--host', '0.0.0.0', '--port', String(PORT)],
  { stdio: 'inherit', shell: true },
);

child.on('exit', (code) => process.exit(code ?? 0));

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
