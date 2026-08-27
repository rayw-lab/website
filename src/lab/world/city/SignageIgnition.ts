// [CC-VIS-X3] stagger 逐楼点亮（design-confirm §4.2 第四件：「reveal 后 150ms
// 逐楼点亮，一次性瞬态零配额，reduced-motion 直出终态」；BR X3 ④「给 V5 加
// 首幕节拍」，Tier C 遗案销账）。
// 时序：world-reveal 事件（Reveal 光柱开演帧）→ 通道 i 在 i×150ms 起 0.45s 内
// 点亮（霓虹管起辉曲线：缓升 + 两次瞬时暗闪，单调不越 1——R2 纪律：瞬态任意
// 时刻 emissive ≤ 终态，阈下件绝不瞬时越阈）。全序完成后钳 1 并自摘 tick
// 监听——运行期零常驻（CITY-03 循环动画配额零占用，运镜瞬态同款先例）。
// 接线闸门（mountCity revealStagger 选项）：仅首幕（?ritual=1）且非 reduced-motion
// 时武装；其余路径（?city=1 / ?poi= / reduced-motion）lit 恒 1 直出终态。
import type { Game } from '../core/Game';
import type { SignLitUniform } from '../rendering/NeonMaterials';

/** 相邻通道点亮间隔（秒）——design-confirm §4.2 定值 150ms */
const STAGGER_STEP = 0.15;
/** 单通道起辉时长（秒） */
const IGNITION_RAMP = 0.45;

/** 霓虹管起辉曲线：smoothstep 缓升 + 两次暗闪（只减不增，终值恒 1） */
function ignitionCurve(u: number): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const eased = u * u * (3 - 2 * u);
  if (u >= 0.3 && u < 0.4) return Math.min(eased, 0.18);
  if (u >= 0.58 && u < 0.66) return Math.min(eased, 0.5);
  return eased;
}

/**
 * 武装点亮序列：置全部通道 0（首帧起招牌黑板待燃），world-reveal 一次性触发
 * 逐通道 stagger。通道序 = BuildingSigns.litChannels（距出生点近→远）+ AdBoards
 * 尾拍。时基 = Ticker 设计秒（idle-30s / TOAST 同时基，CI 慢放同倍不失序）。
 */
export function armSignageIgnition(game: Game, channels: SignLitUniform[]): void {
  if (channels.length === 0) return;
  for (const channel of channels) channel.value = 0;

  const total = STAGGER_STEP * (channels.length - 1) + IGNITION_RAMP;
  let clock = 0;

  const tick = (): void => {
    clock += game.ticker.delta;
    channels.forEach((channel, i) => {
      channel.value = ignitionCurve((clock - i * STAGGER_STEP) / IGNITION_RAMP);
    });
    if (clock >= total) {
      for (const channel of channels) channel.value = 1;
      game.ticker.events.off('tick', tick);
      console.info(
        `[city] [CC-VIS-X3] 招牌 stagger 点亮完成：${channels.length} 通道 × ${
          STAGGER_STEP * 1000
        }ms 间隔（一次性瞬态已自摘，运行期零常驻）`,
      );
    }
  };

  const onReveal = (): void => {
    game.events.off('world-reveal', onReveal);
    game.ticker.events.on('tick', tick);
  };
  game.events.on('world-reveal', onReveal);
}
