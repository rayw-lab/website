// world 单例模块 · Phase A Spike —— mount() 契约入口（SRD §9.2）。
// 薄入口：重依赖（three 等）严禁在此静态 import，必须在 mount() 内动态 import，
// 保证引擎分包不进任何页面首屏 chunk（点击「进入」前零 world 字节）。
// 位于 src/lab/modules/ 下 = 自动进入 facade 的 import.meta.glob 分包映射，
// Phase B 转正 /world/ 路由时本入口原样复用。
import type { LabInstance, LabMountOptions } from '../../contracts';

export default async function mount(opts: LabMountOptions): Promise<LabInstance> {
  if (opts.mode !== 'full') {
    throw new Error(`world spike 尚未实现 mode='${opts.mode}'（POI 消费态为 Phase B 交付项）`);
  }
  const { createWorldSpike } = await import('./spike/engine');
  return createWorldSpike(opts);
}
