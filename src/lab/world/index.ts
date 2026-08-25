// /world/ 引擎挂载入口（CC-E2 合流后唯一实现）——遵守既有 lab mount() 契约
// （SRD §9.2，同 contracts.LabMount 形状），由 src/lab/modules/world/index.ts
// 薄入口转发（facade 分包映射位不变；/world-spike/ 壳页经它动态 import）。
// spike 装配器（modules/world/spike/engine.ts）已退役：其 HUD 接线 / __worldSpike
// 遥测钩子 / FpsMeter / canvas 置换纪律全部迁入本文件与引擎系统（决策记录
// docs/research/world-spike-log.md §10）。
//
// 深链参数白名单（M4/M6 转正：全部经壳页白名单转发，本入口不再兜底 location.search）：
//   gl=1      强制 WebGL 2 复测（roadmap §7.1 检查点）；
//   vehicle=kinematic 运动学回退档 A/B（SRD §12.7.5「世界永远能开」显式腿）；
//   city=1    挂载 CC-E3 程序化科技城（动态 import 独立分包，默认零城市字节）；
//   robot=1   机器人英雄演示挂点（CC-E5）；
//   ritual=1  首幕全流程（CC-E6：城市+机器人+TransformSystem+Reveal——D4 变形后即开）；
//   poi=slug  POI 深链（CC-E9 / SRD §12.7.8 出口⑧）：隐含挂城 + 挂 POI 系统，
//             出生点改写到对应楼 parkingBay（ritual 模式仅挂 POI，出生锚点归首幕）；
//             无 ?poi/?city 时 areas 分包零字节（与 city 同纪律）。
//
// CC-A2 M5：ritual 模式下 autoReveal=false，mount 不得 await 'revealed'（否则死锁）；
// 输入放行由 TransformSystem 在 car_ready 帧 intro→driving 热切，ready = 首幕剧本已接管。
import type { LabInstance, LabMountOptions } from '../contracts';
import type { Areas } from './areas';
import type { City } from './city';
import type { HeroRobot } from './city/HeroRobot';
import type { TransformSystem } from './player/TransformSystem';
import type { Reveal } from './world/Reveal';
import { Game } from './core/Game';
import { FpsMeter } from './utils/FpsMeter';

export interface WorldSpikeInstance extends LabInstance {
  /** 重置试验场（Game.reset 模式：respawn 玩家 + 全部动态体回初始位姿） */
  reset(): void;
}

/** 测试/调参钩子的全局声明（spike engine.ts 契约结转，e2e 断言消费；dispose 时删除） */
declare global {
  interface Window {
    __worldSpike?: {
      backend: string;
      /** 实际车辆档（physics = Rapier 主路径 / kinematic = 运动学回退档） */
      vehicle: string;
      state: () => {
        x: number;
        y: number;
        z: number;
        yaw: number;
        speedKmh: number;
        grounded: boolean;
        cones: number;
        nippleActive: boolean;
        nippleProgress: number;
      };
      fps: () => { avg: number; low1: number };
      info: () => { drawCalls: number; triangles: number };
    };
    __worldSpikeGame?: Game;
    __worldTransform?: TransformSystem | null;
  }
}

export default async function mount(opts: LabMountOptions): Promise<WorldSpikeInstance> {
  const canvas = opts.host.querySelector<HTMLCanvasElement>('[data-world-canvas]');
  const stage = opts.host.querySelector<HTMLElement>('[data-lab-stage]') ?? opts.host;

  if (!canvas) throw new Error('[world] 宿主缺少 [data-world-canvas] 画布');

  // HUD 挂点（spike engine.ts 接线迁入；缺席容忍——引擎不依赖壳页 DOM）
  const hudSpeed = opts.host.querySelector<HTMLElement>('[data-ws-speed]');
  const hudFps = opts.host.querySelector<HTMLElement>('[data-ws-fps]');
  const hudCones = opts.host.querySelector<HTMLElement>('[data-ws-cones]');
  const hudHint = opts.host.querySelector<HTMLElement>('[data-ws-hint]');

  // CC-E6 首幕剧本：filters 由 Reveal/TransformSystem 接管（intro → driving）
  const ritualRequested = opts.params.get('ritual') === '1';
  // CC-E9：?poi= 深链 slug（buildings JSON id）——存在即隐含挂城
  const poiSlug = opts.params.get('poi');

  const game = new Game({
    domElement: stage,
    canvasElement: canvas,
    forceWebGL: opts.params.get('gl') === '1',
    vehicle: opts.params.get('vehicle') === 'kinematic' ? 'kinematic' : 'physics',
    autoReveal: !ritualRequested,
    onProgress: opts.onProgress,
    onBackend: opts.onBackend,
  });

  await game.init();

  // ————— CC-E6 首幕全流程（?ritual=1）：城市 + 机器人 + 变形仪式 + Reveal 编排 —————
  let heroRobot: HeroRobot | null = null;
  let transformSystem: TransformSystem | null = null;
  let reveal: Reveal | null = null;
  let city: City | null = null;
  if (ritualRequested) {
    if (game.visualVehicle) game.visualVehicle.root.visible = false;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [{ mountCity }, robotModule, { TransformSystem: TransformSystemClass }, { Reveal: RevealClass }] =
      await Promise.all([
        import('./city'),
        import('./city/HeroRobot'),
        import('./player/TransformSystem'),
        import('./world/Reveal'),
      ]);

    city = mountCity(game);
    const spawn = city.map.world.spawn;
    const spawnRotationY = Math.PI / 2 - (spawn.heading * Math.PI) / 180;

    // M3：出生锚点统一 buildings JSON world.spawn
    const landing = game.respawns.getDefault();
    landing.position.set(spawn.position.x, 0, spawn.position.z);
    landing.rotation = spawnRotationY;
    game.player.respawn();

    const gltf = await robotModule.loadHeroRobotGltf(game.resourcesLoader);
    heroRobot = new robotModule.HeroRobot({
      gltf,
      position: spawn.position,
      headingY: Math.PI * 0.25,
      targetHeight: 5.2,
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

    opts.host.querySelector('[data-ws-hint]')?.setAttribute('data-dismissed', 'true');
  }

  // CC-E3：?city=1（ritual 已含城市则跳过）；CC-E9：?poi= 深链隐含挂城
  if ((opts.params.get('city') === '1' || poiSlug !== null) && !ritualRequested) {
    const { mountCity } = await import('./city');
    city = mountCity(game);
  }

  game.player.events.on('respawn', () => {
    game.objects.resetAll();
  });

  // CC-E9：POI 系统（12 楼触发圈 + 标点 + ?poi= 深链出生）——城市就位才挂载，
  // 独立分包默认零字节；ritual 模式触发圈照挂、深链出生让位首幕锚点（M3 纪律）
  let areas: Areas | null = null;
  if (city) {
    const { mountAreas } = await import('./areas');
    areas = mountAreas(game, city.map, { deepLinkPoi: ritualRequested ? null : poiSlug });
  }

  // CC-E5：?robot=1（ritual 已含机器人则跳过）
  if (opts.params.get('robot') === '1' && !ritualRequested) {
    const { HeroRobot: HeroRobotClass, loadHeroRobotGltf } = await import('./city/HeroRobot');
    const gltf = await loadHeroRobotGltf(game.resourcesLoader);
    const anchor = game.respawns.getDefault().position;
    heroRobot = new HeroRobotClass({
      gltf,
      position: { x: anchor.x, z: anchor.z },
      headingY: Math.PI * 0.25,
      targetHeight: 5.2,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    game.scene.add(heroRobot.group);
    game.ticker.events.on('tick', () => {
      heroRobot?.update(game.ticker.delta, game.ticker.elapsed);
    });
    game.ticker.wait(6, () => heroRobot?.reveal());
  }

  const fps = new FpsMeter();
  let hudClock = 0;
  let hintDismissed = false;

  const speedKmh = (): number => {
    const vehicle = game.physicalVehicle;
    if (!vehicle) return 0;
    const scale = game.vehicleKind === 'physics' ? game.ticker.scale : 1;
    return Math.abs(vehicle.forwardSpeed) * scale * 3.6;
  };

  game.ticker.events.on(
    'tick',
    () => {
      fps.tick(performance.now());

      hudClock += game.ticker.delta;
      if (hudClock < 0.25) return;
      hudClock = 0;

      if (hudSpeed) hudSpeed.textContent = String(Math.round(speedKmh()));
      if (hudFps) {
        const reading = fps.read();
        hudFps.textContent =
          reading.avg > 0 ? `${reading.avg.toFixed(0)} / ${reading.low1.toFixed(0)}` : '—';
      }
      if (hudCones) hudCones.textContent = String(game.world.knockedConeCount());

      if (hudHint && !hintDismissed) {
        const player = game.player;
        if (
          player.accelerating !== 0 ||
          player.steering !== 0 ||
          player.braking !== 0 ||
          player.boosting !== 0 ||
          game.inputs.nipple.active
        ) {
          hintDismissed = true;
          hudHint.dataset.dismissed = 'true';
        }
      }
    },
    999,
  );

  window.__worldSpike = {
    backend: game.rendering.isWebGPU ? 'webgpu' : 'webgl2',
    vehicle: game.vehicleKind ?? 'unknown',
    state: () => ({
      x: game.player.position.x,
      y: game.player.position.y,
      z: game.player.position.z,
      yaw: game.player.rotationY,
      speedKmh: speedKmh(),
      grounded: game.physicalVehicle?.wheels.some((wheel) => wheel.inContact) ?? false,
      cones: game.world.knockedConeCount(),
      nippleActive: game.inputs.nipple.active,
      nippleProgress: game.inputs.nipple.progress,
    }),
    fps: () => fps.read(),
    info: () => ({
      drawCalls: game.rendering.renderer.info.render.drawCalls,
      triangles: game.rendering.renderer.info.render.triangles,
    }),
  };

  if (location.hash.includes('debug')) {
    window.__worldSpikeGame = game;
    if (transformSystem) window.__worldTransform = transformSystem;
  }

  // M5：ritual 模式跳过 await revealed（TransformSystem 自行 intro→driving）
  if (!ritualRequested && !game.revealed) {
    await new Promise<void>((resolve) => game.events.on('revealed', resolve));
  }

  return {
    pause() {
      game.pause();
      fps.reset();
    },
    resume() {
      fps.reset();
      game.resume();
    },
    dispose() {
      areas?.dispose();
      areas = null;
      reveal?.dispose();
      reveal = null;
      transformSystem?.dispose();
      transformSystem = null;
      heroRobot?.dispose();
      heroRobot = null;
      delete window.__worldSpike;
      delete window.__worldSpikeGame;
      delete window.__worldTransform;
      game.dispose();
    },
    reset() {
      game.reset();
    },
  };
}
