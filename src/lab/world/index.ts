// /world/ Spike 挂载入口——遵守既有 lab mount() 契约（SRD §9.2，同 contracts.LabMount 形状），
// 但作为独立 Spike 入口由 world-spike 壳页直接动态 import（不进 manifest/facade 分包映射：
// /world-spike/ 是 noindex 隐藏路由，Phase B 转正 /world/ 时再登记 manifest 单例）。
// 深链参数白名单：gl（?gl=1 强制 WebGL 2 复测，roadmap §7.1 检查点）；
// robot（?robot=1 机器人英雄演示挂点，CC-E5——城市装配段 CC-E6/E7 合流后接管，见
// docs/research/cyber-city-eng-wave1-notes.md §E5）。
import type { LabInstance, LabMountOptions } from '../contracts';
import type { HeroRobot } from './city/HeroRobot';
import { Game } from './core/Game';

export interface WorldSpikeInstance extends LabInstance {
  /** 重置试验场（Game.reset 模式：respawn 玩家 + 全部动态体回初始位姿） */
  reset(): void;
}

export default async function mount(opts: LabMountOptions): Promise<WorldSpikeInstance> {
  const canvas = opts.host.querySelector<HTMLCanvasElement>('[data-world-canvas]');
  const stage = opts.host.querySelector<HTMLElement>('[data-lab-stage]') ?? opts.host;

  if (!canvas) throw new Error('[world] 宿主缺少 [data-world-canvas] 画布');

  const game = new Game({
    domElement: stage,
    canvasElement: canvas,
    forceWebGL: opts.params.get('gl') === '1',
    onProgress: opts.onProgress,
    onBackend: opts.onBackend,
  });

  await game.init();

  // Spike 级行为（不写进引擎）：无车阶段 R/respawn 顺带复位锥桶，
  // 让键盘输入 → 动作路由 → 物理复位的整条链路肉眼可验。
  game.player.events.on('respawn', () => {
    game.objects.resetAll();
  });

  // CC-E5 演示挂点：?robot=1 → 机器人英雄立于环形试车道中心（光柱显现 + idle 呼吸灯）。
  // 动态 import：默认引擎路径零机器人字节；GLB 失败自动回退程序化块面机甲（R4 止损）。
  let heroRobot: HeroRobot | null = null;
  if (opts.params.get('robot') === '1') {
    const { HeroRobot: HeroRobotClass, loadHeroRobotGltf } = await import('./city/HeroRobot');
    const gltf = await loadHeroRobotGltf(game.resourcesLoader);
    heroRobot = new HeroRobotClass({
      gltf,
      position: { x: 0, z: 0 }, // 环心站位（未来十字路口正中，buildings JSON world.spawn 对齐）
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    game.scene.add(heroRobot.group);
    game.ticker.events.on('tick', () => {
      heroRobot?.update(game.ticker.delta, game.ticker.elapsed);
    });
    // 等 shader 编译落地几拍再起光柱（同 Game reveal 的坑④节奏，防首帧卡顿吃掉动画）
    game.ticker.wait(6, () => heroRobot?.reveal());
  }

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
      heroRobot?.dispose();
      heroRobot = null;
      game.dispose();
    },
    reset() {
      game.reset();
    },
  };
}
