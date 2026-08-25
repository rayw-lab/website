// 移植自 folio-2025 sources/Game/Quality.js（48 行）。
// CC-E4：由 0|1 两档扩为 0|1|2 三档（实施方案 §5.3 Quality 三档表）：
//   0 = 桌面高端（D3 全效：bloom 全档 / 湿地面实时反射 / 阴影 / 逐楼随机窗格闪烁 / DPR 2.0）
//   1 = 移动/中端（bloom 弱档 / 假反射 / 无阴影 / 全局统一相位闪烁 / DPR 1.5）
//   2 = 止损档（后处理关 / 哑光地面 / 窗格静态 / 剪影层实例减档 / DPR 1.0）
// folio 语义原样保留：消费方读 level（车辆 dt / 相机 phi / bloom / 反射 / 剪影密度），
// changeLevel 触发 'change' 事件——三档切换 = uniform 写入 + 少量节点重建，零场景重建。
// 切换入口（M9 转正，CC-E7）：① URL ?quality=0|1|2 已并入壳页 PARAM_ALLOWLIST，
// 经 opts.params → GameOptions.quality 注入构造器——本类不再兜底 location.search
// （M4/M6 同款纪律：引擎只吃显式参数，壳负责白名单过滤）；
// ② #debug 句柄 __worldSpikeGame.quality.changeLevel(n) 运行时热切。
// 自动降档（连续 2s <30fps → 降 Quality 2 + toast，§5.3 触发条件行）依赖 FpsMeter
// （CC-E2 文件域），接线归 Phase 1 装配段——本类的 changeLevel 即其调用面。
import { Events } from './Events';

/** 0 = 桌面全效；1 = 移动/中端；2 = 止损档（实施方案 §5.3 三档表） */
export type QualityLevel = 0 | 1 | 2;

export class Quality {
  readonly events = new Events();
  level: QualityLevel;

  /** @param level 显式档位（?quality= 深链经 GameOptions 注入）；缺省按 UA 分档 */
  constructor(level?: QualityLevel) {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.level = level ?? (isMobile ? 1 : 0);
  }

  changeLevel(level: QualityLevel = 0): void {
    if (level === this.level) return;

    this.level = level;
    this.events.trigger('change', [this.level]);
  }
}
