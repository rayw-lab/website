// LAB RC-01 · 多语种座舱大模型成本粗估 —— mount() 契约入口（SRD §9.2）。
// 薄入口：界面、计算核心与参数数据在 mount() 内动态 import，与页面首屏 chunk 隔离。
import type { LabInstance, LabMountOptions } from '../../contracts';
import type { Params } from './core/types';

export default async function mount(opts: LabMountOptions): Promise<LabInstance> {
  if (opts.mode !== 'full') {
    throw new Error(`cost-estimator 只实现 mode='full'，收到 '${opts.mode}'`);
  }
  const [{ createCostEstimator }, { default: params }] = await Promise.all([
    import('./ui'),
    import('../../../data/cost-estimator/params.json'),
  ]);
  return createCostEstimator(opts, params as unknown as Params);
}
