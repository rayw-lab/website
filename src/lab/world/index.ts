// /world/ 引擎挂载入口（CC-E2 合流后唯一实现）——遵守既有 lab mount() 契约
// （SRD §9.2，同 contracts.LabMount 形状），由 src/lab/modules/world/index.ts
// 薄入口转发（facade 分包映射位不变；/world-spike/ 壳页经它动态 import）。
// spike 装配器（modules/world/spike/engine.ts）已退役：其 HUD 接线 / __worldSpike
// 遥测钩子 / FpsMeter / canvas 置换纪律全部迁入本文件与引擎系统（决策记录
// docs/research/world-spike-log.md §10）。
//
// 深链参数白名单（M4/M6/M9 转正：全部经壳页白名单转发，本入口不再兜底 location.search）：
//   gl=1      强制 WebGL 2 复测（roadmap §7.1 检查点）；
//   vehicle=kinematic 运动学回退档 A/B（SRD §12.7.5「世界永远能开」显式腿）；
//   city=1    挂载 CC-E3 程序化科技城（动态 import 独立分包，默认零城市字节）；
//   robot=1   机器人英雄演示挂点（CC-E5）；
//   ritual=1  首幕全流程（CC-E6：城市+机器人+TransformSystem+Reveal——D4 变形后即开）；
//   quality=0|1|2 画质档（M9 转正，CC-E7）：经 GameOptions.quality 注入 Quality 构造器；
//   poi=slug  POI 深链（CC-E9 / SRD §12.7.8 出口⑧）：隐含挂城 + 挂 POI 系统，
//             出生点改写到对应楼 parkingBay（ritual 模式仅挂 POI，出生锚点归首幕）；
//             无 ?poi/?city 时 areas 分包零字节（与 city 同纪律）。
//   shot=id   镜头预设深链（CC-CAM-VIEW）：仅与 ?poi= 组合生效——camera-shots.json
//             注册表白名单校验后应用展示机位（poi 模式挂载即应用；ritual+poi 组合
//             在 robot_idle 应用，最小可行口径——DES 规格定稿后可细化时机）；
//             首个驾驶意图动作释放回玩家跟随。无 ?shot= 时 CameraShots 分包零字节
//             且 View 零触碰（robot_idle 主帧与 main 逐字节一致——poster/VIS-03
//             零漂移合同）。
//
// CC-A2 M5：ritual 模式下 autoReveal=false，mount 不得 await 'revealed'（否则死锁）；
// 输入放行由 TransformSystem 在 car_ready 帧 intro→driving 热切，ready = 首幕剧本已接管。
import type { LabInstance, LabMountOptions } from '../contracts';
import type { Areas } from './areas';
import type { City } from './city';
import type { HeroRobot } from './city/HeroRobot';
import type { DebugPanel } from './debug/DebugPanel';
import type { TransformSystem } from './player/TransformSystem';
import type { Reveal } from './world/Reveal';
import type { QualityLevel } from './core/Quality';
import type { SessionDump } from './core/SessionTimeline';
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
        view: string;
      };
      fps: () => { avg: number; low1: number };
      info: () => { drawCalls: number; triangles: number };
    };
    /**
     * [CC-OBS-C1] 只读单方法导出面（观测规格 §4.1）：e2e/CI/审计经 dump() 取证
     * （可 JSON.stringify）；与 __worldSpike 同段挂载/删除——取证必须在卸载前调用。
     */
    __worldSession?: { dump(): SessionDump };
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
  // CC-CAM-VIEW：?shot= 镜头预设 id（camera-shots.json 注册表白名单，仅与 ?poi= 组合生效）
  const shotId = opts.params.get('shot');
  // M9（CC-E7 转正）：?quality=0|1|2 显式档位，非法值忽略、走 UA 分档
  const qualityParam = opts.params.get('quality');
  const quality =
    qualityParam === '0' || qualityParam === '1' || qualityParam === '2'
      ? (Number(qualityParam) as QualityLevel)
      : undefined;
  // CC-E7：挂城路径（首幕/城市/POI/机器人）用城市首幕取景（FOV 42°/距 18m/俯角 22°），
  // 纯灰盒试车道保持原框（零回归）
  const cityScene =
    ritualRequested ||
    poiSlug !== null ||
    opts.params.get('city') === '1' ||
    opts.params.get('robot') === '1';

  const game = new Game({
    domElement: stage,
    canvasElement: canvas,
    forceWebGL: opts.params.get('gl') === '1',
    vehicle: opts.params.get('vehicle') === 'kinematic' ? 'kinematic' : 'physics',
    quality,
    cameraFraming: cityScene ? 'city' : 'greybox',
    autoReveal: !ritualRequested,
    onProgress: opts.onProgress,
    onBackend: opts.onBackend,
  });

  await game.init();

  // [CC-OBS-C1] deep-link 首打（观测规格 §3.4 poi 族：?poi= 非 null 时挂载即打；
  // shot 字段随 CAM 深链同点补传——无 ?shot= 时 null 由 log() 扁平清洗自然剔除）
  if (poiSlug !== null) game.session.log('deep-link', { poi: poiSlug, shot: shotId });

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
      // CC-E7：城市首幕相机（FOV 42°/距 18m/俯角 22°）就位，回 9m 级设计口径
      // （CITY-04；灰盒适配值 5.2 归档于 A2 观察③）
      targetHeight: 9,
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

  // CC-CAM-VIEW：?poi=&shot= 组合深链 → 应用 camera-shots.json 展示机位（白名单校验
  // 在 CameraShots 内单点裁决，名单外告警不阻断）。poi 模式挂载即应用（出生已在
  // parkingBay）；ritual+poi 组合此刻 state=robot_idle（最小可行口径）。
  // 无 ?shot= 时本分包零字节、View.applyShot 零调用（零漂移合同）。
  if (city && poiSlug !== null && shotId !== null) {
    const { applyCameraShot } = await import('./view/CameraShots');
    applyCameraShot(game, city.map, shotId);
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
      targetHeight: 9, // 同首幕口径（CC-E7 回 9m，城市相机已就位）
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
  // [CC-OBS-C1] HUD 节拍沿检测状态（观测规格 §3.4 cone-hit / idle-30s 行）
  let lastConeCount = 0;
  let idleClock = 0;
  let idleLogged = false;

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
      const beatElapsed = hudClock;
      hudClock = 0;

      if (hudSpeed) hudSpeed.textContent = String(Math.round(speedKmh()));
      if (hudFps) {
        const reading = fps.read();
        hudFps.textContent =
          reading.avg > 0 ? `${reading.avg.toFixed(0)} / ${reading.low1.toFixed(0)}` : '—';
      }
      const coneCount = game.world.knockedConeCount();
      if (hudCones) hudCones.textContent = String(coneCount);

      // [CC-OBS-C1] cone-hit 沿检测：计数较上拍增大即打（total = 当前值，HUD 同源；
      // respawn 重置后计数回落，lastConeCount 跟随不打点）
      if (coneCount > lastConeCount) game.session.log('cone-hit', { total: coneCount });
      lastConeCount = coneCount;

      const player = game.player;
      const driveIntent =
        player.accelerating !== 0 ||
        player.steering !== 0 ||
        player.braking !== 0 ||
        player.boosting !== 0 ||
        game.inputs.nipple.active;

      // [CC-OBS-C1] idle-30s 沿检测：driving 态连续 30s 零驾驶意图打一条；
      // 有输入即重置计时，可再打（每静默期至多 1 条）
      if (transformSystem?.state !== 'driving' || driveIntent) {
        idleClock = 0;
        idleLogged = false;
      } else {
        idleClock += beatElapsed;
        if (!idleLogged && idleClock >= 30) {
          idleLogged = true;
          game.session.log('idle-30s');
        }
      }

      if (hudHint && !hintDismissed) {
        if (driveIntent) {
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
      // [CC-VEH-VIEW] 驾驶视角遥测（DOM 契约 data-drive-view 之外的引擎侧真值，
      // e2e 双口径互证）：'third' | 'fpv'
      view: game.view.driveView.mode,
    }),
    fps: () => fps.read(),
    info: () => ({
      drawCalls: game.rendering.renderer.info.render.drawCalls,
      triangles: game.rendering.renderer.info.render.triangles,
    }),
  };

  // [CC-OBS-C1] 会话取证面（观测规格 §4.1）：只读单方法，与 __worldSpike 同段挂载
  window.__worldSession = { dump: () => game.session.dump() };

  // [CC-OBS-C2] #debug 只读面板 v0（观测规格 §5.1）：沿用既有 hash 判断分支，
  // 动态 import 独立 chunk——无 #debug 的生产路径零请求零字节（CITY-OBS-05 断言）；
  // v0 仅挂载时判定（__worldSpikeGame 同口径），hashchange 动态开合归 Phase B。
  // 面板故障不得影响游戏路径（§5.3 红线 3）：加载失败仅告警。
  let debugPanel: DebugPanel | null = null;
  if (location.hash.includes('debug')) {
    window.__worldSpikeGame = game;
    if (transformSystem) window.__worldTransform = transformSystem;
    try {
      const { DebugPanel: DebugPanelClass } = await import('./debug/DebugPanel');
      debugPanel = new DebugPanelClass({ game, fps });
    } catch (error) {
      console.warn('[debug] 面板加载失败，静默降级（游戏路径零影响）', error);
    }
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
      debugPanel?.dispose();
      debugPanel = null;
      areas?.dispose();
      areas = null;
      reveal?.dispose();
      reveal = null;
      transformSystem?.dispose();
      transformSystem = null;
      heroRobot?.dispose();
      heroRobot = null;
      delete window.__worldSpike;
      delete window.__worldSession;
      delete window.__worldSpikeGame;
      delete window.__worldTransform;
      game.dispose();
    },
    reset() {
      game.reset();
    },
  };
}
