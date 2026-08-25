// LAB RA-01 · 多语言 TTS × 智能座舱可视化 —— mount() 契约入口（SRD §9.2）。
// 薄入口：引擎（含 tts-manifest 数据）在 mount() 内动态 import，与页面首屏 chunk 隔离
// （SRD §12.2 第 3 步）。
import type { LabInstance, LabMountOptions } from '../../contracts';
import { injectNotoFonts } from './fonts';

export default async function mount(opts: LabMountOptions): Promise<LabInstance> {
  if (opts.mode !== 'full') {
    throw new Error(`tts-cockpit 尚未实现 mode='${opts.mode}'（嵌入态为后续 TtsWavePlayer island）`);
  }
  injectNotoFonts();
  const { createTtsCockpit } = await import('./engine');
  return createTtsCockpit(opts);
}
