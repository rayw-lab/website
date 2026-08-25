// LAB RB-01 · 3D 车辆配置器 —— mount() 契约入口（SRD §9.2）。
// 薄入口：重依赖（three 等）严禁在此静态 import，必须在 mount() 内动态 import
// （SRD §12.2 第 3 步——保证引擎分包不进任何页面首屏 chunk）。
import type { LabInstance, LabMountOptions } from '../../contracts';

export default async function mount(opts: LabMountOptions): Promise<LabInstance> {
  if (opts.mode !== 'full') {
    // viewer 精简态（Hero 复用）为 Track C3 交付项：入口显式拒绝而非静默错渲染
    throw new Error(`car-configurator 尚未实现 mode='${opts.mode}'（viewer 抽取见 roadmap C3）`);
  }
  const { createCarConfigurator } = await import('./engine');
  return createCarConfigurator(opts);
}
