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
//             [CC-PERF-C2-B1] 显式深链同时禁用 O1 FPS 自动降档——取证与 e2e
//             可复现性优先（perf rubric §3.2 复现协议）；非法值 = 未显式，自动档照常；
//   poi=slug  POI 深链（CC-E9 / SRD §12.7.8 出口⑧）：隐含挂城 + 挂 POI 系统，
//             出生点改写到对应楼 parkingBay（ritual 模式仅挂 POI，出生锚点归首幕）；
//             无 ?poi/?city 时 areas 分包零字节（与 city 同纪律）。
//   shot=id   镜头预设深链（CC-CAM-VIEW）：仅与 ?poi= 组合生效——camera-shots.json
//             注册表白名单校验后应用展示机位（poi 模式挂载即应用；ritual+poi 组合
//             在 robot_idle 应用，最小可行口径——DES 规格定稿后可细化时机）；
//             首个驾驶意图动作释放回玩家跟随。[CC-FXN-C3] 起 CameraShots 模块随
//             areas 分包在挂 POI 时装载（PoiArrival 进站前奏复用换算单源）——
//             「零字节」合同收窄为非城市路径；零漂移合同不变：无 ?shot= 且无进站
//             交互时 View.applyShot 零调用（robot_idle 主帧与 main 逐字节一致——
//             poster/VIS-03 合同）。
//
// CC-A2 M5：ritual 模式下 autoReveal=false，mount 不得 await 'revealed'（否则死锁）；
// 输入放行由 TransformSystem 在 car_ready 帧 intro→driving 热切，ready = 首幕剧本已接管。
import type { LabInstance, LabMountOptions } from '../contracts';
import type { Areas } from './areas';
import type { City } from './city';
import type { HeroRobot } from './city/HeroRobot';
import type { DebugPanel } from './debug/DebugPanel';
import type { RespawnReason } from './player/Player';
import type { TransformSystem } from './player/TransformSystem';
import type { Reveal } from './world/Reveal';
import type { QualityLevel } from './core/Quality';
import type { SessionDump } from './core/SessionTimeline';
import { Game } from './core/Game';
import { DriveFeedback } from './world/DriveFeedback';
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
        fov: number;
        shot: string | null;
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

    // [CC-VIS-X3] 首幕招牌 stagger 点亮（world-reveal 后 150ms 逐楼，一次性瞬态）；
    // reduced-motion 直出终态（design-confirm §4.2 第四件口径）
    city = mountCity(game, { revealStagger: !reducedMotion });
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

  // ————— [CC-FXN-C2] 驾驶反馈层（功能 rubric F2「反馈闭环」确认层）—————
  // toast/碰撞脉冲/boost/翻车倒计时四件 DOM 反馈：样式内联注入（Reveal 先例，
  // 壳静态段零字节）、pointer-events 全穿透；robot_idle/transforming 由样式门
  // 整层 display:none（ritual_idle 恒等合同）。全部一次性事件驱动（CITY-03
  // 循环动画配额零占用）；埋点零新增——本层只是 OBS-C1 既有事件的呈现面。
  const driveFeedback = new DriveFeedback(game, { stage, speedEl: hudSpeed });

  // ② respawn toast：reason ∈ key/fall/unstuck 时呈现（R 键/坠落兜底两来路；
  // null = 装配对齐/Game.reset 软复位，不出提示）。壳复位按钮走合成 KeyR，同路
  game.player.events.on('respawn', (_respawn: unknown, reason?: RespawnReason | null) => {
    if (reason) driveFeedback.respawnToast(reason);
  });

  // ③ boost 徽标+暗角：'boost' 动作双沿（actionStart/End 同名事件）即按即亮——
  // 不走 0.25s HUD 节拍（按键反馈延迟可感）；intro filter 天然闸门（robot_idle/
  // transforming 期间动作不触发，与样式门双保险）
  game.inputs.events.on('boost', (action: { active: boolean }) => {
    driveFeedback.setBoost(action.active);
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
  // [CC-FXN-C3] 注记：CameraShots 模块已随 areas 分包在挂 POI 时装载（PoiArrival
  // 复用），本动态 import 复用同一 chunk；无 ?shot= 时 View.applyShot 仍零调用
  // （零漂移合同不变，文件头 shot= 行同步收窄注记）。
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
  // [CC-PERF-C2-B0] O10 常驻长帧阈值（秒）：>50ms 计入 counters.longFrames——
  // 与 WS-PERF-01/CITY-PERF-01 采样 STALL_MS=50 同源口径（跨证据面可互证）
  const LONG_FRAME_S = 0.05;
  let hudClock = 0;
  let hintDismissed = false;
  // [CC-OBS-C1] HUD 节拍沿检测状态（观测规格 §3.4 cone-hit / idle-30s 行）
  // [CC-FXN-C2] 口径扩为 锥桶+隔离墩 合计（灰盒无城市时与纯锥桶数逐拍等值）
  let lastCollisionTotal = 0;
  let idleClock = 0;
  let idleLogged = false;

  // ————— [CC-PERF-C2-B1] O1 FPS 自动降档（PERF-BR O1 / perf-impl-plan §2 PR-B B1）—————
  // 三档梯退的裁决者接线：FpsMeter 滑窗读数 → 滞回窗 + 只降不升 + 冷却 →
  // Quality.changeLevel 降一档（0→1→2 阶梯；bloom/DPR/阴影/反射/粒子全链
  // quality 'change' 事件级切换既有，Rendering.applyQuality 等消费方零改动）。纪律：
  //   · `?quality=` 显式深链禁用自动档（文件头参数注记）；
  //   · 仅 ritual driving 态评估——robot_idle/transforming 恒等合同零涉及（poster
  //     逐字节 / 变形四拍墙钟），灰盒 /world-spike/（无 ritual）不接线，WS-PERF-01
  //     采样基线零污染；
  //   · 滞回窗/冷却用 Ticker 设计秒累计（idle-30s / TOAST_DURATION 同时基，
  //     SwiftShader 慢放同倍——CI 软渲染下触发天然限频）；FpsMeter 读数本身恒为
  //     墙钟真值（wallDt 双轨纪律）；
  //   · Q0→Q1 降档瞬间的全场景阴影重编译尖峰：取 BR O1 缓解案「接受一次性尖峰 +
  //     toast 同拍归因」（另一案「缓期到遮蔽窗」driving 态无稳定遮蔽窗，不取）；
  //   · 只降不升——升档归 B2（O2 初判校准）且只在非驾驶态执行。
  const autoQualityDrop = quality === undefined;
  /** 连续低帧滞回窗（设计秒）：avg<30 或 low1<20 持续此窗才降（BR O1 参数） */
  const AUTO_DROP_WINDOW = 3;
  /** 两次降档最小间隔（设计秒）：防抖——Q0→Q1→Q2 阶梯至多每 20s 一步 */
  const AUTO_DROP_COOLDOWN = 20;
  const AUTO_DROP_AVG_FPS = 30;
  const AUTO_DROP_LOW1_FPS = 20;
  let lowFpsClock = 0;
  let dropCooldown = 0;

  const speedKmh = (): number => {
    const vehicle = game.physicalVehicle;
    if (!vehicle) return 0;
    const scale = game.vehicleKind === 'physics' ? game.ticker.scale : 1;
    return Math.abs(vehicle.forwardSpeed) * scale * 3.6;
  };

  game.ticker.events.on(
    'tick',
    () => {
      // [CC-PERF-C2-B0] 长帧计数（O10 常驻轻量层）：复用 FpsMeter 墙钟间隔，
      // 一次比较零分配；首帧/pause 后 dt=0 天然不计（FpsMeter.reset 纪律）
      if (fps.tick(performance.now()) > LONG_FRAME_S) game.session.countLongFrame();

      hudClock += game.ticker.delta;
      if (hudClock < 0.25) return;
      const beatElapsed = hudClock;
      hudClock = 0;

      if (hudSpeed) hudSpeed.textContent = String(Math.round(speedKmh()));
      // [CC-PERF-C2-B1] 读数上提：HUD 与自动降档裁决共用同一拍 read()（零新 tick）
      const fpsReading = fps.read();
      if (hudFps) {
        hudFps.textContent =
          fpsReading.avg > 0
            ? `${fpsReading.avg.toFixed(0)} / ${fpsReading.low1.toFixed(0)}`
            : '—';
      }
      const coneCount = game.world.knockedConeCount();
      if (hudCones) hudCones.textContent = String(coneCount);

      // [CC-OBS-C1] cone-hit 沿检测：计数较上拍增大即打（total = 当前值，HUD 同源；
      // respawn 重置后锥桶计数回落，lastCollisionTotal 跟随不打点）。
      // [CC-FXN-C2] total 口径扩为 锥桶+隔离墩（观测规格 §3.4 随行修订：城市档
      // 锥桶撤场、隔离墩 fixed 不位移，接触力计数承接「撞道具」真值；灰盒无城市
      // 时两口径逐拍等值）；沿上同时驱动 HUD 碰撞脉冲（反馈层①，同源同拍）
      const collisionTotal = coneCount + (city?.streetProps.hitCount ?? 0);
      if (collisionTotal > lastCollisionTotal) {
        game.session.log('cone-hit', { total: collisionTotal });
        driveFeedback.collisionPulse(collisionTotal);
      }
      lastCollisionTotal = collisionTotal;

      const player = game.player;
      // [CC-FXN-C2] ④ 翻车自救倒计时喂数（Player.rescueCountdown 镜像；null =
      // 收窗即藏。0.25s 节拍粒度由进度条 transition 平滑，变化帧才写 DOM）
      driveFeedback.setRescue(player.rescueCountdown);
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

      // [CC-PERF-C2-B1] O1 自动降档裁决（接线纪律见上方常量块注记）：
      // 滞回窗 = 连续低帧持续 AUTO_DROP_WINDOW 才降（读数健康即清零）；
      // 冷却 = 两次降档间隔 ≥ AUTO_DROP_COOLDOWN（窗照常累计，冷却到期即可再降）；
      // avg=0（样本未热，<10 帧）不计——挂载/恢复瞬间零误判。
      if (dropCooldown > 0) dropCooldown -= beatElapsed;
      if (autoQualityDrop && game.quality.level < 2 && transformSystem?.state === 'driving') {
        const lowFps =
          fpsReading.avg > 0 &&
          (fpsReading.avg < AUTO_DROP_AVG_FPS || fpsReading.low1 < AUTO_DROP_LOW1_FPS);
        lowFpsClock = lowFps ? lowFpsClock + beatElapsed : 0;
        if (lowFps && lowFpsClock >= AUTO_DROP_WINDOW && dropCooldown <= 0) {
          const from = game.quality.level;
          const to = (from + 1) as QualityLevel;
          game.quality.changeLevel(to);
          // 埋点随行（观测规格 §3.4 perf 族，本 PR 落白名单）：读数一位小数控噪
          game.session.log('quality-auto-drop', {
            from,
            to,
            avg: Math.round(fpsReading.avg * 10) / 10,
            low1: Math.round(fpsReading.low1 * 10) / 10,
          });
          // R8 反馈闭环：降档瞬间 toast 确认层（独立 chip，respawn toast 零竞态）
          driveFeedback.qualityDropToast(to);
          lowFpsClock = 0;
          dropCooldown = AUTO_DROP_COOLDOWN;
        }
      } else {
        lowFpsClock = 0;
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
      // [CC-VEH-C2] 输出相机 FOV 遥测（度）：V 硬切合同的引擎侧断言口径——
      // fpv 基础档 = camera-shots.json drive_fpv.rig.fovDeg（切换帧即写，
      // reduced-motion 逐帧恰等）；third 恒为基线 42
      fov: game.view.camera.fov,
      // [CC-FXN-C3] 当前生效 shot id（View.shotId 单源：?shot= 深链与 POI 进站
      // 前奏共用；null = 玩家跟随）——e2e CITY-PA 断言口径
      shot: game.view.shotId,
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
      driveFeedback.dispose();
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
