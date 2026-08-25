// /world/ 引擎挂载入口（CC-E2 合流后唯一实现）——遵守既有 lab mount() 契约
// （SRD §9.2，同 contracts.LabMount 形状），由 src/lab/modules/world/index.ts
// 薄入口转发（facade 分包映射位不变；/world-spike/ 壳页经它动态 import）。
// spike 装配器（modules/world/spike/engine.ts）已退役：其 HUD 接线 / __worldSpike
// 遥测钩子 / FpsMeter / canvas 置换纪律全部迁入本文件与引擎系统（决策记录
// docs/research/world-spike-log.md §10）。
//
// 深链参数白名单（M4 转正：全部经壳页白名单转发，本入口不再兜底 location.search）：
//   gl=1      强制 WebGL 2 复测（roadmap §7.1 检查点）；
//   vehicle=kinematic 运动学回退档 A/B（SRD §12.7.5「世界永远能开」显式腿）；
//   city=1    挂载 CC-E3 程序化科技城（动态 import 独立分包，默认零城市字节）；
//   robot=1   机器人英雄演示挂点（CC-E5——城市装配段 CC-E6/E7 合流后接管）。
import type { LabInstance, LabMountOptions } from '../contracts';
import type { HeroRobot } from './city/HeroRobot';
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

  const game = new Game({
    domElement: stage,
    canvasElement: canvas,
    forceWebGL: opts.params.get('gl') === '1',
    vehicle: opts.params.get('vehicle') === 'kinematic' ? 'kinematic' : 'physics',
    onProgress: opts.onProgress,
    onBackend: opts.onBackend,
  });

  await game.init();

  // CC-E3 隐藏路径：?city=1 挂载程序化科技城（十字路口 + 12 栋在册楼 + 剪影层）。
  // 默认不挂载，灰盒零回归；出生点已与城市地图 world.spawn 同锚（M3）。
  if (opts.params.get('city') === '1') {
    const { mountCity } = await import('./city');
    mountCity(game);
  }

  // R/respawn 顺带复位锥桶（spike「复位即整场复位」语义保留）：
  // 键盘输入 → 动作路由 → 物理复位的整条链路肉眼可验。
  game.player.events.on('respawn', () => {
    game.objects.resetAll();
  });

  // CC-E5 演示挂点：?robot=1 → 机器人英雄立于出生锚点（光柱显现 + idle 呼吸灯）。
  // 动态 import：默认引擎路径零机器人字节；GLB 失败自动回退程序化块面机甲（R4 止损）。
  let heroRobot: HeroRobot | null = null;
  if (opts.params.get('robot') === '1') {
    const { HeroRobot: HeroRobotClass, loadHeroRobotGltf } = await import('./city/HeroRobot');
    const gltf = await loadHeroRobotGltf(game.resourcesLoader);
    const anchor = game.respawns.getDefault().position;
    heroRobot = new HeroRobotClass({
      gltf,
      // 机器人站位即出生锚点（SRD §12.7.5：变形后车落地同点；M3 后 = 城市 world.spawn）
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

  /**
   * 帧率仪表 + HUD 刷新（spike 帧循环 HUD 段迁入，tick order 999：渲染后结算）。
   * FpsMeter 喂墙钟时间戳（Ticker.delta 被 maxDelta 钳制，读不出真实帧间隔）。
   */
  const fps = new FpsMeter();
  let hudClock = 0;
  let hintDismissed = false;

  /** 真实速度 km/h（两档统一口径）：physics 档 forwardSpeed 是 folio 时基 → ×scale */
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

      // 教学提示消隐：任何驾驶意图（键盘或摇杆）出现过即收（spike hasDriven 语义）
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

  // 测试/调参钩子（spike 契约结转；Phase B 换 Tweakpane #debug 面板）
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
    // 场景复杂度读数（drawCalls/triangles）——帧率论证的硬件无关依据
    info: () => ({
      drawCalls: game.rendering.renderer.info.render.drawCalls,
      triangles: game.rendering.renderer.info.render.triangles,
    }),
  };

  // #debug：暴露 game 句柄供控制台/后续 Tweakpane 面板检查（roadmap §7.3 Step 9 模式）
  if (location.hash.includes('debug')) {
    window.__worldSpikeGame = game;
  }

  // ★ ready = 输入已放行：等 reveal（intro → wandering 过滤器切换）后才 resolve，
  // 否则「ready 即按键」会被 intro 过滤器吞掉（e2e/首帧即操作的真实用户场景）。
  if (!game.revealed) {
    await new Promise<void>((resolve) => game.events.on('revealed', resolve));
  }

  return {
    pause() {
      game.pause();
      fps.reset(); // 跨暂停的超长帧间隔不得计入 1% low
    },
    resume() {
      fps.reset();
      game.resume();
    },
    dispose() {
      heroRobot?.dispose();
      heroRobot = null;
      delete window.__worldSpike;
      delete window.__worldSpikeGame;
      game.dispose();
    },
    reset() {
      game.reset();
    },
  };
}
