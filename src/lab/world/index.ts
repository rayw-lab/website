// /world/ Spike 挂载入口——遵守既有 lab mount() 契约（SRD §9.2，同 contracts.LabMount 形状），
// 但作为独立 Spike 入口由 world-spike 壳页直接动态 import（不进 manifest/facade 分包映射：
// /world-spike/ 是 noindex 隐藏路由，Phase B 转正 /world/ 时再登记 manifest 单例）。
// 深链参数白名单：gl（?gl=1 强制 WebGL 2 复测，roadmap §7.1 检查点）；
// vehicle（?vehicle=kinematic 运动学回退档 A/B，CC-E1 临时接线——壳页白名单只
// 转发 gl，此参数从 location.search 兜底读取，CC-E2 转正时并入壳页白名单）。
import type { LabInstance, LabMountOptions } from '../contracts';
import { Game } from './core/Game';

export interface WorldSpikeInstance extends LabInstance {
  /** 重置试验场（Game.reset 模式：respawn 玩家 + 全部动态体回初始位姿） */
  reset(): void;
}

export default async function mount(opts: LabMountOptions): Promise<WorldSpikeInstance> {
  const canvas = opts.host.querySelector<HTMLCanvasElement>('[data-world-canvas]');
  const stage = opts.host.querySelector<HTMLElement>('[data-lab-stage]') ?? opts.host;

  if (!canvas) throw new Error('[world] 宿主缺少 [data-world-canvas] 画布');

  // 车辆 A/B（CC-E1 临时接线，见页首注释）：壳页参数优先，location.search 兜底
  const vehicleParam =
    opts.params.get('vehicle') ?? new URLSearchParams(location.search).get('vehicle');

  const game = new Game({
    domElement: stage,
    canvasElement: canvas,
    forceWebGL: opts.params.get('gl') === '1',
    vehicle: vehicleParam === 'kinematic' ? 'kinematic' : 'physics',
    onProgress: opts.onProgress,
    onBackend: opts.onBackend,
  });

  await game.init();

  // Spike 级行为（不写进引擎）：无车阶段 R/respawn 顺带复位锥桶，
  // 让键盘输入 → 动作路由 → 物理复位的整条链路肉眼可验。
  game.player.events.on('respawn', () => {
    game.objects.resetAll();
  });

  // #debug：暴露 game 句柄供控制台/后续 Tweakpane 面板检查（roadmap §7.3 Step 9 模式）
  if (location.hash.includes('debug')) {
    (window as unknown as { __worldSpikeGame?: Game }).__worldSpikeGame = game;
  }

  return {
    pause() {
      game.pause();
    },
    resume() {
      game.resume();
    },
    dispose() {
      game.dispose();
    },
    reset() {
      game.reset();
    },
  };
}
