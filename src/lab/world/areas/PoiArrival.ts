// [CC-FXN-C3] POI 进站前奏（CAM F1，P0）——设计正本 docs/research/cyber-city-camera-design.md
// F1 条 + 断言合同 docs/spec/cyber-city-function-test-plan.md §3.3：
//   圈内 E/Enter/点标点 → 0.8s 缓动至该楼 poi_showcase-* 机位 → 定帧 0.4s → navigate 进站
//   （v0 直跳，overlay/View Transition 归 CC-P1）。
// 三条红线（design F1 / 顾问 §4.2 行 4）：
//   · 驾驶意图至上：tween/定帧期间任何 RELEASE_ACTIONS 动作立即中断回 drive 跟随
//     （actionStart 同步事件 = 同帧中断，满足「0.1s 内交还」上限；SRD「世界永远能开」）；
//   · reduced-motion 降级：跳过 tween 直切 showcase 定帧（View 既有纪律外推），定帧
//     驻留与 navigate 照常——核心进站路径不因偏好剥夺（CITY-PA-03 冻结口径）；
//   · 不碰 ritual：robot_idle/transforming 期 poiInteract 被 Inputs filters（intro）
//     物理拦截，本模块根本不可达（CITY-PA-04 恒等门复证）。
// 数据驱动开关：注册表存在 `poi_showcase-<buildingId>` 条目才有前奏；无条目楼保持
// CITY-08 Phase 1 直跳（camera-shots.json 加条目即自动获得前奏，src 零改动）。
// 埋点（观测规格 §3.4 camera 族预留行转正，本 PR 随行）：
//   shot-apply {id}        前奏起帧（world-poi 之后同交互调用内，seq 序稳定）；
//   shot-interrupt {by:'drive'}  驾驶意图释放 shot（前奏中断与定帧后接管同一接线点）。
// 动画配额：事件驱动一次性 tween，不占 CITY-03 循环动画配额（design 纪律 5）。
import type { Game } from '../core/Game';
import type { CyberCityMap } from '../city/CityMap';
import type { ViewShotPose } from '../view/View';
import { getCameraShotsConfig, resolveShotPose, RELEASE_ACTIONS } from '../view/CameraShots';
import { lerp, smallestAngle } from '../utils/maths';

/** 前奏 tween 时长（游戏秒，design F1 冻结：0.8s 缓动至 showcase 机位） */
const TWEEN_DURATION = 0.8;
/** showcase 定帧驻留（游戏秒，design F1 冻结：0.4s 后 navigate） */
const HOLD_DURATION = 0.4;

/** smoothstep 缓动（power2InOut 数值近邻；InteractivePoints 手写缓动同纪律，G5 零依赖） */
const easeInOut = (t: number): number => t * t * (3 - 2 * t);

export interface PoiArrivalRequest {
  /** buildings JSON id（showcase shot 键 = `poi_showcase-<buildingId>`） */
  buildingId: string;
  /** 进站动作（null = console 型 POI 占位）；仅在前奏完整走完（未被中断）时调用 */
  navigate: (() => void) | null;
}

/**
 * idle → tween → hold → done：done = navigate 已发（或被 e2e route abort 拦下）但
 * shot 仍生效——首个驾驶意图把相机交还玩家跟随（CameraShots 深链释放同节拍），
 * 保证拦截/console 路径下世界始终可开。
 */
type PreludePhase = 'idle' | 'tween' | 'hold' | 'done';

export class PoiArrival {
  private readonly game: Game;
  private readonly map: CyberCityMap;
  private readonly reducedMotion: boolean;

  private phase: PreludePhase = 'idle';
  private elapsed = 0;
  private shotId: string | null = null;
  private from: ViewShotPose | null = null;
  private to: ViewShotPose | null = null;
  private navigate: (() => void) | null = null;
  private listening = false;

  /** 前奏推进（ticker.delta 游戏时基——SwiftShader 慢动作下时序仍与设计秒同构） */
  private readonly tickHandler = (): void => {
    if (this.phase !== 'tween' && this.phase !== 'hold') return;
    this.elapsed += this.game.ticker.delta;

    if (this.phase === 'tween') {
      const t = Math.min(this.elapsed / TWEEN_DURATION, 1);
      this.game.view.applyShot(t >= 1 ? this.to! : this.lerpPose(easeInOut(t)), this.shotId);
      if (t >= 1) {
        this.phase = 'hold';
        this.elapsed = 0;
      }
    } else if (this.elapsed >= HOLD_DURATION) {
      this.finish();
    }
  };

  /** 驾驶意图中断（RELEASE_ACTIONS 单源）：同帧释放，满足 design F1「0.1s 内」上限 */
  private readonly actionHandler = (action: { name: string }): void => {
    if (RELEASE_ACTIONS.indexOf(action.name) === -1) return;
    this.interrupt();
  };

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;
    this.map = map;
    this.reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // order 6（玩家 post 同拍、相机 order 7 之前）：插值位姿先落 View 参数，
    // 同帧被 View.update 消费——前奏无一帧延迟
    this.game.ticker.events.on('tick', this.tickHandler, 6);
  }

  /**
   * 圈内交互入口（Areas onInteract 调用；world-poi 埋点已由 Areas 先行触发）。
   * 注册表无该楼 showcase 条目 → 直跳降级（Phase 1 现状零回归）；
   * tween/hold 在途重复 E → 忽略（前奏不重启）；done 态再按 E（navigate 被
   * 拦截后重试）→ 定帧已在位，重打 shot-apply 并直接进 hold 重发 navigate。
   */
  begin(request: PoiArrivalRequest): void {
    if (this.phase === 'tween' || this.phase === 'hold') return;

    const shotId = `poi_showcase-${request.buildingId}`;
    const shot = getCameraShotsConfig().shots[shotId];
    const pose = shot !== undefined && shot.mode !== 'drive' ? resolveShotPose(shot, this.map) : null;
    if (!pose) {
      request.navigate?.();
      return;
    }

    this.shotId = shotId;
    this.to = pose;
    this.navigate = request.navigate;
    this.elapsed = 0;

    // 埋点先行（「跳转前取证」合同：navigate 最早发生在 hold 期满，seq 必然在后）
    this.game.session.log('shot-apply', { id: shotId });

    if (this.reducedMotion || this.phase === 'done') {
      // 降级/重试路径：直切 showcase 定帧（tween 跳过），驻留后照常 navigate
      this.from = null;
      this.game.view.applyShot(pose, shotId);
      this.phase = 'hold';
    } else {
      // t=0 帧即应用（= 当前取景恒等改写）：基线采集/焦点钉扎与埋点同帧落定
      this.from = this.game.view.captureShotPose();
      this.phase = 'tween';
      this.game.view.applyShot(this.lerpPose(0), shotId);
    }
    this.setListening(true);

    console.info(
      `[poi-arrival] 进站前奏：${request.buildingId} → shot ${shotId}` +
        `（${this.reducedMotion ? 'reduced-motion 直切定帧' : `tween ${TWEEN_DURATION}s`} + ` +
        `定帧 ${HOLD_DURATION}s → ${this.navigate ? 'navigate' : 'console 占位'}；驾驶输入随时中断）`,
    );
  }

  /** Areas.dispose 调用：摘监听（场景/总线资源归 Game.dispose） */
  dispose(): void {
    this.setListening(false);
    this.game.ticker.events.off('tick', this.tickHandler);
    this.phase = 'idle';
    this.navigate = null;
  }

  /* ———————————————————— 内部 ———————————————————— */

  /** 起讫位姿线性插值（theta 走最短角差，防跨 ±π 长绕） */
  private lerpPose(t: number): ViewShotPose {
    const from = this.from!;
    const to = this.to!;
    return {
      anchor: {
        x: lerp(from.anchor.x, to.anchor.x, t),
        z: lerp(from.anchor.z, to.anchor.z, t),
      },
      phi: lerp(from.phi, to.phi, t),
      theta: from.theta + smallestAngle(from.theta, to.theta) * t,
      radius: {
        min: lerp(from.radius.min, to.radius.min, t),
        max: lerp(from.radius.max, to.radius.max, t),
      },
      lookAtHeight: lerp(from.lookAtHeight, to.lookAtHeight, t),
      lateral: lerp(from.lateral, to.lateral, t),
    };
  }

  /** 定帧期满：发 navigate（route abort/console 型下页面存续——监听留岗等驾驶接管） */
  private finish(): void {
    this.phase = 'done';
    const navigate = this.navigate;
    this.navigate = null;
    navigate?.();
  }

  /** 驾驶意图释放：中断前奏（tween/hold 弃 navigate）或 done 态交还跟随，同一接线点 */
  private interrupt(): void {
    if (this.phase === 'idle') return;
    const interrupted = this.phase === 'tween' || this.phase === 'hold';
    this.phase = 'idle';
    this.navigate = null;
    this.setListening(false);
    this.game.view.releaseShot();
    this.game.session.log('shot-interrupt', { by: 'drive' });
    console.info(
      `[poi-arrival] 驾驶意图接管：shot ${this.shotId} 释放` +
        (interrupted ? '（前奏中断，navigate 取消）' : '（定帧交还玩家跟随）'),
    );
    this.shotId = null;
  }

  private setListening(on: boolean): void {
    if (this.listening === on) return;
    this.listening = on;
    if (on) this.game.inputs.events.on('actionStart', this.actionHandler as never);
    else this.game.inputs.events.off('actionStart', this.actionHandler as never);
  }
}
