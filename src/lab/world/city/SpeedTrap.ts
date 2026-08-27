// [CC-FXN-C6] G9 测速标牌 speed trap（FXN-BR §4 G9 冻结稿 / 90 路径顾问 §2.1 杠杆 D
// 「F3 想再来一次玩点」）：霓虹大街东段路侧一块雷达测速牌——车进测速区实时显示
// km/h，驶离显示本次通过最高速；≥90 km/h 牌面切「SPEED DEMON」+ 一次性闪烁；
// 低速通过偶尔吐槽慢车（G10 幽默系统的世界内出口，60 设计秒冷却防骚扰）。
// 把 boost 从「按了 Shift」变成「刷出数字」——速度感的世界内证据，与 HUD 互为表里。
//
// 形态与预算：
//   · TextCanvas 动态纹理（既有能力，InteractivePoints 标签同款 .r 通道 mask 采样）；
//   · 3 个 draw call 封顶（灯柱 + 牌框共用暗金属材质 ×2 mesh + 牌面 ×1）；
//   · 牌面刷新走 0.25s 节拍（HUD 同拍粒度）且仅文案变化帧重绘 canvas；
//   · 色族纪律：东西向轴 = 品红（StreetProps 顶环双主轴同表），不引第三色相。
// 纪律红线：
//   · robot_idle poster 恒等：站位 (68, -14.8) 在首幕视锥外——首幕机位约
//     (11.9, 5.2, 15.8) 视线朝北偏西（theta 25°），本牌位于机位正东 ~56m，
//     与视向夹角 >90°（数据可复算），首幕帧零像素涉及；出生点距测速区 40m+，
//     robot_idle/transforming 期物理车冻结在出生点，测速区物理不可达；
//   · CITY-03 循环动画配额：牌面刷新与 SPEED DEMON 闪烁全部事件驱动一次性
//     （ticker.delay 链，播完即静止），零 infinite 循环——不占席；
//   · 降级四轨：KinematicFallback（读 PlayerVehicle 契约速度，照常工作）/
//     Quality 2（静态小件零粒子，无需减档）/ reduced-motion（去闪烁，恒亮直显）/
//     触屏（纯观赏件零输入依赖）；
//   · 埋点随行：world-speedtrap{kmh, isRecord} 驶离沿至多 1 条 + 5 设计秒冷却
//     （challenge 族，白名单加法见 SessionTimeline / 观测规格 §3.4 随行修订）。
import * as THREE from 'three/webgpu';
import { Fn, mix, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { Game } from '../core/Game';
import { TextCanvas } from '../world/TextCanvas';
import type { CyberCityMap } from './CityMap';

/** 测速区进入半径 m（滞回下界：进得早、退得晚，防路缘徘徊抖动） */
const ZONE_ENTER = 30;
/** 测速区驶离半径 m（滞回上界；驶离沿 = 结算 + 埋点 + 牌面收尾） */
const ZONE_EXIT = 34;
/** SPEED DEMON 门槛 km/h（G9 冻结稿：超 90 闪烁 + isRecord 候选场景） */
const DEMON_KMH = 90;
/** 吐槽门槛 km/h：低于此速通过 = 慢车（怠速滑行/找路），触发幽默文案 */
const TEASE_BELOW_KMH = 25;
/** 吐槽冷却（设计秒，G10 频控纪律：同类 60s，幽默不变骚扰） */
const TEASE_COOLDOWN = 60;
/** world-speedtrap 事件冷却（设计秒；驶离沿本就每次通过至多 1 条，冷却兜底防绕圈刷） */
const EVENT_COOLDOWN = 5;
/** 通过后牌面驻留（设计秒）：本次最高/吐槽展示完回落待机 */
const AFTER_HOLD = 3.5;
/** SPEED DEMON 一次性闪烁：翻转次数 × 步进（设计秒）——事件驱动播完即静止 */
const BLINK_STEPS = 6;
const BLINK_INTERVAL = 0.14;

/** 慢车吐槽文案表（纯数据；轮换不重复，二行制适配牌面画幅） */
const TEASE_LINES: ReadonlyArray<readonly [string, string]> = [
  ['这速度…', '在找停车位吗'],
  ['雷达都替你', '着急了'],
];

export class SpeedTrap {
  /** 牌位世界坐标（取证/调试读数用） */
  readonly position: { x: number; z: number };
  /** 本会话最高速 km/h（整数；G9「驶离显示本会话最高速」的数据面） */
  sessionMaxKmh = 0;

  private readonly game: Game;
  private readonly reducedMotion: boolean;
  private readonly text: TextCanvas;
  /** 牌面辉光系数（SPEED DEMON 闪烁通道；reduced-motion 恒 1） */
  private readonly glow = uniform(1);

  private beatClock = 0;
  private inZone = false;
  private passMaxKmh = 0;
  private demonFlashed = false;
  private shownLines = '';
  private teaseIndex = 0;
  private lastTeaseAt = -Infinity;
  private lastLogAt = -Infinity;
  private afterHold: { kill(): void } | null = null;
  private blinkDelay: { kill(): void } | null = null;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 站位：霓虹大街（东西主轴）东段北路缘外 2.8m——出生点以东首分钟必经段，
    // 概念车库门前灯杆 (52/110, -13.5) 之间的空档；不侵入可驾驶路面带（|z|<12）
    const eastWest = map.world.roads.find((road) => road.axis === 'east-west');
    const curb = (eastWest?.halfWidth ?? 12) + 2.8;
    this.position = { x: 68, z: -curb };

    // 牌面文本：固定画幅（自动量宽会逐帧重建 canvas 状态，动态读数用定宽防churn）
    this.text = new TextCanvas({
      fontWeight: '700',
      fontSize: 44,
      width: 320,
      height: 128,
      lineHeight: 56,
    });

    this.setVisuals();
    this.showIdle();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.beatClock += this.game.ticker.delta;
        if (this.beatClock < 0.25) return;
        this.beatClock = 0;
        this.update();
      },
      999, // order 999：HUD 同拍（读 post-physics 位置/速度终值）
    );
  }

  /* ———————————————————— 视觉 ———————————————————— */

  private setVisuals(): void {
    const group = new THREE.Group();
    group.position.set(this.position.x, 0, this.position.z);
    // 牌面朝西（局部 +Z → 世界 -X）：迎着从路口驶来的东行车流
    group.rotation.y = -Math.PI / 2;
    group.name = 'city-speedtrap';

    // 灯柱 + 牌框：暗金属（StreetProps 墩身同族近黑色），共用单材质 = 2 draw call
    const metal = new THREE.MeshStandardNodeMaterial({
      color: new THREE.Color('#12141c'),
      roughness: 0.55,
      metalness: 0.6,
    });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.5, 8), metal);
    pole.position.y = 1.25;
    pole.castShadow = true;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.6, 0.16), metal);
    frame.position.y = 3.1;

    // 牌面：TextCanvas .r 通道 mask → 暗底 + 品红霓虹字（东西向轴色族；>1 供 bloom）
    const backColor = vec3(0.03, 0.02, 0.035);
    const accent = new THREE.Color('#ff3e91').convertSRGBToLinear();
    const accentNode = vec3(accent.r, accent.g, accent.b).mul(1.6);

    const faceMaterial = new THREE.MeshBasicNodeMaterial();
    faceMaterial.outputNode = Fn(() => {
      // flipY=false 纹理：v.oneMinus() 翻转采样（InteractivePoints 标签同口径）
      const mask = texture(this.text.texture, vec2(uv().x, uv().y.oneMinus())).r;
      return vec4(mix(backColor, accentNode.mul(this.glow), mask), 1);
    })();

    const face = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), faceMaterial);
    face.scale.set(3.0, 1.2, 1);
    face.position.set(0, 3.1, 0.09);

    group.add(pole, frame, face);
    this.game.scene.add(group);
  }

  /** 牌面写字（仅变化帧重绘 canvas / 上传纹理） */
  private show(lines: readonly [string, string]): void {
    const key = lines.join('\n');
    if (key === this.shownLines) return;
    this.shownLines = key;
    this.text.updateText([...lines]);
  }

  private showIdle(): void {
    this.show(
      this.sessionMaxKmh > 0
        ? ['雷达测速', `MAX ${this.sessionMaxKmh}`]
        : ['雷达测速', '限 90 km/h'],
    );
  }

  /** SPEED DEMON 一次性闪烁（每次通过至多一轮；reduced-motion 去闪烁恒亮直显） */
  private blink(remaining = BLINK_STEPS): void {
    if (this.reducedMotion) return;
    if (remaining <= 0) {
      this.glow.value = 1;
      return;
    }
    this.glow.value = remaining % 2 === 0 ? 0.12 : 1;
    this.blinkDelay?.kill();
    this.blinkDelay = this.game.ticker.delay(BLINK_INTERVAL, () => this.blink(remaining - 1));
  }

  /* ———————————————————— 测速状态机 ———————————————————— */

  /** 车速 km/h（index.ts HUD speedKmh 同公式：物理档 forwardSpeed × Ticker.scale） */
  private speedKmh(): number {
    const vehicle = this.game.physicalVehicle;
    if (!vehicle) return 0;
    const scale = this.game.vehicleKind === 'physics' ? this.game.ticker.scale : 1;
    return Math.abs(vehicle.forwardSpeed) * scale * 3.6;
  }

  private update(): void {
    const player = this.game.player;
    if (!player) return;

    const distance = Math.hypot(
      player.position.x - this.position.x,
      player.position.z - this.position.z,
    );

    if (!this.inZone && distance <= ZONE_ENTER) {
      // 进区沿：清本次通过状态，接管牌面为实时读数
      this.inZone = true;
      this.passMaxKmh = 0;
      this.demonFlashed = false;
      this.afterHold?.kill();
      this.afterHold = null;
    } else if (this.inZone && distance >= ZONE_EXIT) {
      this.inZone = false;
      this.finishPass();
      return;
    }

    if (!this.inZone) return;

    const kmh = Math.round(this.speedKmh());
    if (kmh > this.passMaxKmh) this.passMaxKmh = kmh;

    if (kmh >= DEMON_KMH) {
      if (!this.demonFlashed) {
        this.demonFlashed = true;
        this.blink();
      }
      this.show(['SPEED DEMON', `${kmh} km/h`]);
    } else {
      this.show(['雷达测速', `${kmh} km/h`]);
    }
  }

  /** 驶离沿：会话纪录结算 + world-speedtrap 埋点 + 牌面收尾（本次最高 / 慢车吐槽） */
  private finishPass(): void {
    const passMax = this.passMaxKmh;
    const isRecord = passMax > this.sessionMaxKmh;
    if (isRecord) this.sessionMaxKmh = passMax;

    const now = this.game.ticker.elapsed;
    // 埋点节流：驶离沿每次通过至多 1 条 + 冷却兜底（观测规格 §3.4 challenge 族行）
    if (passMax > 0 && now - this.lastLogAt >= EVENT_COOLDOWN) {
      this.lastLogAt = now;
      this.game.session.log('world-speedtrap', { kmh: passMax, isRecord });
    }

    if (passMax > 0 && passMax < TEASE_BELOW_KMH && now - this.lastTeaseAt >= TEASE_COOLDOWN) {
      // 慢车吐槽（频控在前：60 设计秒同类冷却）
      this.lastTeaseAt = now;
      this.show(TEASE_LINES[this.teaseIndex % TEASE_LINES.length]);
      this.teaseIndex += 1;
    } else if (passMax > 0) {
      this.show(['本次最高', `${passMax} km/h`]);
    } else {
      this.showIdle();
      return;
    }

    this.afterHold?.kill();
    this.afterHold = this.game.ticker.delay(AFTER_HOLD, () => {
      this.afterHold = null;
      this.showIdle();
    });
  }
}
