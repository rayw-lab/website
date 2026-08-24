// 移植自 folio-2025 sources/Game/Player.js（676 行 → 意图层精简版，§9.1 第 12 项）。
// 保留：动作表（forward/backward/left/right/boost/brake/respawn/suspensions，
// 照抄 Player.js L220-239 模式）、每帧意图结算（accelerating/steering/boosting/braking，
// tick order 1 pre-physics）、respawn、nipple 摇杆 → 意图映射（progress³ 油门 +
// 角差转向 + 倒车反转，L572-598 原算法）、post-physics 位置回读喂相机/摇杆（order 6）。
// 砍除：音效注册、成就、里程/游玩时长、honk、逐轮 numpad 悬挂动作。
// 车辆挂点：game.physicalVehicle（vehicle 分支交付 PhysicsVehicle 后即插即用）；
// 未挂车时玩家驻留重生点——意图照常结算，供调试面板/后续系统消费。
import * as THREE from 'three/webgpu';
import { Events } from '../core/Events';
import { Inputs } from '../inputs/Inputs';
import type { Game } from '../core/Game';

/** 悬挂档位：low = 常态；mid = 低趴；high = 跳跃冲量档 */
export type SuspensionState = 'low' | 'mid' | 'high';

/** 车辆侧最小契约（PhysicsVehicle 分支按此对接） */
export interface PlayerVehicle {
  position: THREE.Vector3;
  forward: THREE.Vector3;
  moveTo(position: THREE.Vector3, rotationY: number): void;
}

export class Player {
  static readonly STATE_DEFAULT = 1;
  static readonly STATE_LOCKED = 2;

  private readonly game: Game;
  readonly events = new Events();

  state: number = Player.STATE_DEFAULT;
  /** 意图层输出（每帧 order 1 重算；车辆控制器在 order 2 消费） */
  accelerating = 0;
  steering = 0;
  boosting = 0;
  braking = 0;
  suspensions: SuspensionState[] = ['low', 'low', 'low', 'low'];

  readonly position: THREE.Vector3;
  readonly basePosition: THREE.Vector3;
  position2: THREE.Vector2;
  rotationY = 0;

  private nippleJumpTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(game: Game) {
    this.game = game;

    const respawn = this.game.respawns.getDefault();

    this.position = respawn.position.clone();
    this.basePosition = this.position.clone();
    this.position2 = new THREE.Vector2(this.position.x, this.position.z);
    this.rotationY = respawn.rotation;

    this.setInputs();

    // 车辆已挂载时：出生点对齐（folio L39-42 模式）
    this.game.physicalVehicle?.moveTo(respawn.position, respawn.rotation);

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePrePhysics();
      },
      1, // order 1：意图结算在输入（0）后、车辆 pre（2）/物理（3）前
    );

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePostPhysics();
      },
      6, // order 6：位置回读在视觉同步（4）/车辆 post（5）后、相机（7）前
    );
  }

  private setInputs(): void {
    // 动作表（Player.js L220-239 的 Spike 子集；Gamepad 键位随模块砍除）
    this.game.inputs.addActions([
      { name: 'forward',     categories: ['wandering', 'racing', 'cinematic'], keys: ['Keyboard.ArrowUp', 'Keyboard.KeyW'] },
      { name: 'right',       categories: ['wandering', 'racing', 'cinematic'], keys: ['Keyboard.ArrowRight', 'Keyboard.KeyD'] },
      { name: 'backward',    categories: ['wandering', 'racing', 'cinematic'], keys: ['Keyboard.ArrowDown', 'Keyboard.KeyS'] },
      { name: 'left',        categories: ['wandering', 'racing', 'cinematic'], keys: ['Keyboard.ArrowLeft', 'Keyboard.KeyA'] },
      { name: 'boost',       categories: ['wandering', 'racing'],              keys: ['Keyboard.ShiftLeft', 'Keyboard.ShiftRight'] },
      { name: 'brake',       categories: ['wandering', 'racing'],              keys: ['Keyboard.KeyB', 'Keyboard.ControlLeft'] },
      { name: 'respawn',     categories: ['wandering'],                        keys: ['Keyboard.KeyR'] },
      { name: 'suspensions', categories: ['wandering', 'racing'],              keys: ['Keyboard.Space'] },
    ]);

    // Respawn
    this.game.inputs.events.on('respawn', (action: { active: boolean }) => {
      if (this.state !== Player.STATE_DEFAULT) return;

      if (action.active) this.respawn();
    });

    // 悬挂（四轮齐跳；逐轮花活留给 Phase B）
    this.game.inputs.events.on('suspensions', (action: { active: boolean }) => {
      if (this.state !== Player.STATE_DEFAULT) return;

      const state: SuspensionState = action.active ? 'high' : 'low';
      for (let i = 0; i < 4; i++) this.suspensions[i] = state;

      if (action.active && this.game.inputs.mode === Inputs.MODE_TOUCH)
        this.game.inputs.nipple.jump();
    });

    // 摇杆内环点按 = 跳（folio L311-326：200ms 后回落）
    this.game.inputs.nipple.events.on('tap', () => {
      this.game.inputs.nipple.jump();

      for (let i = 0; i < 4; i++) this.suspensions[i] = 'high';

      if (this.nippleJumpTimeout) clearTimeout(this.nippleJumpTimeout);

      this.nippleJumpTimeout = setTimeout(() => {
        for (let i = 0; i < 4; i++) this.suspensions[i] = 'low';
      }, 200);
    });
  }

  respawn(respawnName: string | null = null, callback: (() => void) | null = null): void {
    // folio 经 Overlay 遮罩过渡（L469-488）——Overlay 未移植，直接瞬移
    callback?.();

    const respawn =
      (respawnName ? this.game.respawns.getByName(respawnName) : null) ??
      this.game.respawns.getClosest(this.position);

    if (this.game.physicalVehicle) {
      this.game.physicalVehicle.moveTo(respawn.position, respawn.rotation);
    } else {
      this.position.copy(respawn.position);
      this.rotationY = respawn.rotation;
    }

    this.state = Player.STATE_DEFAULT;
    this.events.trigger('respawn', [respawn]);
  }

  private updatePrePhysics(): void {
    this.accelerating = 0;
    this.steering = 0;
    this.boosting = 0;
    this.braking = 0;

    if (this.state !== Player.STATE_DEFAULT) return;

    const actions = this.game.inputs.actions;

    /**
     * Accelerating
     */
    const forward = actions.get('forward');
    if (forward?.active && typeof forward.value === 'number') this.accelerating += forward.value;

    const backward = actions.get('backward');
    if (backward?.active && typeof backward.value === 'number') this.accelerating -= backward.value;

    /**
     * Boosting
     */
    if (actions.get('boost')?.active) this.boosting = 1;

    /**
     * Braking（刹车压过油门）
     */
    if (actions.get('brake')?.active) {
      this.accelerating = 0;
      this.braking = 1;
    }

    /**
     * Steering
     */
    if (actions.get('right')?.active) this.steering -= 1;
    if (actions.get('left')?.active) this.steering += 1;

    /**
     * Nipple（触屏摇杆 → 意图，folio L572-598 原算法）
     */
    const nipple = this.game.inputs.nipple;
    if (nipple.active && nipple.progress > 0) {
      if (!this.game.view.focusPoint.isTracking) {
        // 等几帧再吸附相机（防多指手势误判）
        this.game.ticker.wait(5, () => {
          if (nipple.active) this.game.view.focusPoint.isTracking = true;
        });
      }
      this.accelerating = Math.pow(nipple.progress, 3);

      const angleDeltaAbs = Math.abs(nipple.smallestAngle);
      const angleDeltaAbsNormalized =
        angleDeltaAbs / ((Math.PI * 2 - nipple.forwardAmplitude) / 2);
      const angleDeltaSign = Math.sign(nipple.smallestAngle);
      this.steering = -Math.min(angleDeltaAbsNormalized, 1) * angleDeltaSign;

      // 倒车扇区：油门与转向同时反转
      if (!nipple.forward) {
        this.accelerating *= -1;
        this.steering *= -1;
      }
    }
  }

  private updatePostPhysics(): void {
    // 位置：有车读车，无车驻留（respawn 已写 this.position）
    const vehicle = this.game.physicalVehicle;
    if (vehicle) {
      this.position.copy(vehicle.position);
      this.rotationY = Math.atan2(vehicle.forward.z, vehicle.forward.x);
    }
    this.position2 = new THREE.Vector2(this.position.x, this.position.z);

    // View > 焦点跟踪
    this.game.view.focusPoint.trackedPosition.copy(this.position);

    // 触屏摇杆随玩家走
    this.game.inputs.nipple.setCoordinates(
      this.position.x,
      this.position.y,
      this.position.z,
      this.rotationY,
    );
  }
}
