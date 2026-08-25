// /world/ Spike 挂载入口——遵守既有 lab mount() 契约（SRD §9.2，同 contracts.LabMount 形状），
// 但作为独立 Spike 入口由 world-spike 壳页直接动态 import（不进 manifest/facade 分包映射：
// /world-spike/ 是 noindex 隐藏路由，Phase B 转正 /world/ 时再登记 manifest 单例）。
// 深链参数白名单：gl（?gl=1 强制 WebGL 2 复测，roadmap §7.1 检查点）；
// vehicle（?vehicle=kinematic 运动学回退档 A/B，CC-E1 临时接线——壳页白名单只
// 转发 gl，此参数从 location.search 兜底读取，CC-E2 转正时并入壳页白名单）；
// city（?city=1 隐藏路径挂载 CC-E3 程序化科技城，动态 import 独立分包，默认零城市字节）；
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

  const search = new URLSearchParams(location.search);

  // 车辆 A/B（CC-E1 临时接线，见页首注释）：壳页参数优先，location.search 兜底
  const vehicleParam = opts.params.get('vehicle') ?? search.get('vehicle');

  const game = new Game({
    domElement: stage,
    canvasElement: canvas,
    forceWebGL: opts.params.get('gl') === '1',
    vehicle: vehicleParam === 'kinematic' ? 'kinematic' : 'physics',
    onProgress: opts.onProgress,
    onBackend: opts.onBackend,
  });

  await game.init();

  // CC-E3 隐藏路径：?city=1 挂载程序化科技城（十字路口 + 12 栋在册楼 + 剪影层）。
  // 壳页只转发白名单参数，故同时兜底读 location.search；默认不挂载，灰盒零回归。
  const cityRequested = opts.params.get('city') === '1' || search.get('city') === '1';
  if (cityRequested) {
    const { mountCity } = await import('./city');
    mountCity(game);
  }

  // Spike 级行为（不写进引擎）：无车阶段 R/respawn 顺带复位锥桶，
  // 让键盘输入 → 动作路由 → 物理复位的整条链路肉眼可验。
  game.player.events.on('respawn', () => {
    game.objects.resetAll();
  });

  // CC-E5 演示挂点：?robot=1 → 机器人英雄立于出生锚点（光柱显现 + idle 呼吸灯）。
  // 动态 import：默认引擎路径零机器人字节；GLB 失败自动回退程序化块面机甲（R4 止损）。
  let heroRobot: HeroRobot | null = null;
  const robotRequested = opts.params.get('robot') === '1' || search.get('robot') === '1';
  if (robotRequested) {
    const { HeroRobot: HeroRobotClass, loadHeroRobotGltf } = await import('./city/HeroRobot');
    const gltf = await loadHeroRobotGltf(game.resourcesLoader);
    const anchor = game.respawns.getDefault().position;
    heroRobot = new HeroRobotClass({
      gltf,
      // 机器人站位即出生锚点（SRD §12.7.5：变形后车落地同点；相机焦点默认也在此）
      position: { x: anchor.x, z: anchor.z },
      headingY: Math.PI * 0.25, // 面向默认相机方位（View spherical theta = π/4）
      // 灰盒 View（FOV 25° / 半径 ~21m）取景适配：9m 级巨人只会拍到腿。
      // 城市首幕相机（设计提案 §3.1：FOV 42° / 距 18m / 俯角 22°）时用类默认 9m。
      targetHeight: 5.2,
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
