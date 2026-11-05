import { chromium } from '@playwright/test';
const U = 'http://localhost:4321/website/world-spike/nexus-ink/';
const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

// 正控：不注入时必须正常起来（没有正控的负控不闭合）
const p0 = await br.newPage({ viewport: { width: 900, height: 600 } });
await p0.goto(U, { waitUntil: 'load' });
await p0.waitForTimeout(2500);
const ok = await p0.evaluate(() => ({ ready: document.documentElement.dataset.inkReady, fb: document.documentElement.dataset.inkFallback }));
console.log('正控（不注入）:', JSON.stringify(ok), ok.ready === '1' && !ok.fb ? '✅ 正常起来' : '🔴 基线就不对');

// 负控：让着色器编译必然失败 —— WebGL2 仍然可用，所以正确标签是 init-failed 而非 no-webgl2
const p1 = await br.newPage({ viewport: { width: 900, height: 600 } });
await p1.addInitScript(() => {
  const proto = WebGL2RenderingContext.prototype;
  const orig = proto.getShaderParameter;
  proto.getShaderParameter = function (sh, pname) {
    if (pname === this.COMPILE_STATUS) return false; // 编译永远"失败"
    return orig.call(this, sh, pname);
  };
});
await p1.goto(U, { waitUntil: 'load' });
await p1.waitForTimeout(2500);
const bad = await p1.evaluate(() => ({ ready: document.documentElement.dataset.inkReady, fb: document.documentElement.dataset.inkFallback }));
console.log('负控（编译失败）:', JSON.stringify(bad));
console.log('  必须报 init-failed 而不是 no-webgl2 →', bad.fb === 'init-failed' ? '✅' : `🔴 实报 ${bad.fb}`);
await br.close();
