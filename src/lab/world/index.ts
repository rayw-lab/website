// /world/ Spike 挂载入口——遵守既有 lab mount() 契约（SRD §9.2，同 contracts.LabMount 形状），
// 但作为独立 Spike 入口由 world-spike 壳页直接动态 import（不进 manifest/facade 分包映射：
// /world-spike/ 是 noindex 隐藏路由，Phase B 转正 /world/ 时再登记 manifest 单例）。
// 深链参数白名单：gl（?gl=1 强制 WebGL 2 复测，roadmap §7.1 检查点）；
// vehicle（?vehicle=kinematic 运动学回退档 A/B，CC-E1 临时接线——壳页白名单只
// 转发 gl，此参数从 location.search 兜底读取，CC-E2 转正时并入壳页白名单）；
// city（?city=1 隐藏路径挂载 CC-E3 程序化科技城，动态 import 独立分包，默认零城市字节）；
// robot（?robot=1 机器人英雄演示挂点，CC-E5——城市装配段 CC-E6/E7 合流后接管，见
// docs/research/cyber-city-eng-wave1-notes.md §E5）；
// ritual（?ritual=1 首幕全流程演示，CC-E6：城市 + 机器人 + TransformSystem + Reveal——
// 机器人光柱显现 → 变形 CTA/Space → 车落地十字路口 → WASD 即开（终裁 D4）；
// 隐含 city+robot 装配，出生锚点统一 buildings JSON world.spawn（M3）；
// CC-E7 路由切换后由 `/` 壳条件自动挂载接管，本参数随壳白名单转正）。
import type { LabInstance, LabMountOptions } from '../contracts';
import type { HeroRobot } from './city/HeroRobot';
import type { TransformSystem } from './player/TransformSystem';
import type { Reveal } from './world/Reveal';
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
  // CC-E6 首幕剧本模式：filters 由 Reveal/TransformSystem 接管（intro → driving），
  // 灰盒 autoReveal（intro → wandering）让位
  const ritualRequested = opts.params.get('ritual') === '1' || search.get('ritual') === '1';

  const game = new Game({
    domElement: stage,
    canvasElement: canvas,
    forceWebGL: opts.params.get('gl') === '1',
    vehicle: vehicleParam === 'kinematic' ? 'kinematic' : 'physics',
    autoReveal: !ritualRequested,
    onProgress: opts.onProgress,
    onBackend: opts.onBackend,
  });

  await game.init();

  // ————— CC-E6 首幕全流程（?ritual=1）：城市 + 机器人 + 变形仪式 + Reveal 编排 —————
  let heroRobot: HeroRobot | null = null;
  let transformSystem: TransformSystem | null = null;
  let reveal: Reveal | null = null;
  if (ritualRequested) {
    // 车先藏（同步于 init 完成帧，杜绝「车在灰盒环形道闪现」）；泊位随 TransformSystem 到锚点
    if (game.visualVehicle) game.visualVehicle.root.visible = false;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [{ mountCity }, robotModule, { TransformSystem: TransformSystemClass }, { Reveal: RevealClass }] =
      await Promise.all([
        import('./city'),
        import('./city/HeroRobot'),
        import('./player/TransformSystem'),
        import('./world/Reveal'),
      ]);

    const city = mountCity(game);
    const spawn = city.map.world.spawn;
    // heading（度，0=北(-Z) 顺时针）→ PlayerVehicle rotationY（前向 = (cos r, 0, -sin r)）
    const spawnRotationY = Math.PI / 2 - (spawn.heading * Math.PI) / 180;

    // M3：出生锚点统一 buildings JSON world.spawn——respawn 注册表改写到十字路口，
    // R 键复位与变形落点同点（SRD §12.7.5「机器人站位即出生锚点」）
    const landing = game.respawns.getDefault();
    landing.position.set(spawn.position.x, 0, spawn.position.z);
    landing.rotation = spawnRotationY;
    game.player.respawn(); // 藏着的车先泊到锚点：相机焦点即刻落到十字路口

    const gltf = await robotModule.loadHeroRobotGltf(game.resourcesLoader);
    heroRobot = new robotModule.HeroRobot({
      gltf,
      position: spawn.position, // 机器人站位 = 变形锚点 = JSON spawn（M3）
      headingY: Math.PI * 0.25, // 面向默认相机方位（View spherical theta = π/4）
      targetHeight: 5.2, // 灰盒 View 取景口径（E5 注：城市首幕相机 CC-E7 就位后回 9m）
      reducedMotion,
    });
    game.scene.add(heroRobot.group);

    transformSystem = new TransformSystemClass(game, {
      robot: heroRobot,
      anchor: spawn.position,
      rotationY: spawnRotationY,
      reducedMotion,
    });
    reveal = new RevealClass(game, {
      host: opts.host,
      stage,
      robot: heroRobot,
      transformSystem,
      reducedMotion,
    });

    // 壳页 spike 提示与首幕键位提示会叠显：预先隐去（DOM 级最小干预，不改壳页文件——
    // 壳页归 CC-E2/E7 文件域；CC-E7 正式壳自带 HUD 后本行随 ?ritual= 挂点退役）
    opts.host.querySelector('[data-ws-hint]')?.setAttribute('data-dismissed', 'true');
  }

  // CC-E3 隐藏路径：?city=1 挂载程序化科技城（十字路口 + 12 栋在册楼 + 剪影层）。
  // 壳页只转发白名单参数，故同时兜底读 location.search；默认不挂载，灰盒零回归。
  // ?ritual=1 已含城市装配，跳过重复挂载。
  const cityRequested = opts.params.get('city') === '1' || search.get('city') === '1';
  if (cityRequested && !ritualRequested) {
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
  // ?ritual=1 已含机器人（Reveal 驱动其 update/光柱），跳过独立挂点。
  const robotRequested = opts.params.get('robot') === '1' || search.get('robot') === '1';
  if (robotRequested && !ritualRequested) {
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

  // #debug：暴露 game 句柄供控制台/后续 Tweakpane 面板检查（roadmap §7.3 Step 9 模式）；
  // ritual 模式追加 transformSystem 句柄（控制台可验回变 transform('robot')，CC-P1 预演）
  if (location.hash.includes('debug')) {
    (
      window as unknown as { __worldSpikeGame?: Game; __worldTransform?: TransformSystem | null }
    ).__worldSpikeGame = game;
    if (transformSystem) {
      (window as unknown as { __worldTransform?: TransformSystem }).__worldTransform =
        transformSystem;
    }
  }

  return {
    pause() {
      game.pause();
    },
    resume() {
      game.resume();
    },
    dispose() {
      reveal?.dispose();
      reveal = null;
      transformSystem?.dispose();
      transformSystem = null;
      heroRobot?.dispose();
      heroRobot = null;
      game.dispose();
    },
    reset() {
      game.reset();
    },
  };
}
