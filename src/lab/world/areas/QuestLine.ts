// [CC-FXN-C5] QuestLine —— G4 目标线 v0「下一站」导视（FXN-BR
// docs/research/cyber-city-gameplay-features.md §4 G4 冻结稿形态；90 路径顾问
// §2 杠杆 B/C：F6 空闲主动引导 + F3 自然寻路，L7 腿的产品面）。
// 两件交付：
//   ① 目标 chip（HUD 顶部）：「下一站 · 楼名 距离」+ 城区色点 + 步进 n/5——
//      到站（Areas boundingIn）链上下一站，主链五站（world-pois.json quest.chain
//      城区顺序数据驱动）集齐转完成态「主链完成 · 自由探索」；
//   ② 目标站世界标记：parkingBay 提亮圈（halo，深链高亮同档 3.4）+ 静态霓虹
//      光柱（64m，远处可见的「可去」信号）——单组两 mesh 随链推进移动/换色
//      （tint uniform，零材质重建零重编译）。
// idle-30s 消费（L7 空闲主动引导）：index.ts 装配段 idle-30s 沿检测同拍调
// idleNudge() → chip 脉冲 + nudge 行「往光柱方向开」；驻留至下一个驾驶意图
// （clearNudge），不赛跑淡出计时；`idle-nudge` 埋点随行（观测规格 §3.4 加法）。
//
// 纪律红线：
//   · robot_idle poster 逐字节恒等（双保险）：DOM 面 = host[data-world-state]
//     robot_idle/transforming 时整层 display:none 样式门（ExploreProgress 同构）；
//     场景面 = ritual 模式（deferUntilCarReady）光柱与首个 shown 事件一并推迟到
//     首个 world-transform to='car'——首幕视锥内零新增件；回变机器人光柱同拍
//     隐藏。非 ritual 腿（?poi=/?city= 无状态机）挂载即激活（FB-06 同构口径）；
//   · CITY-03 循环动画配额：光柱/halo 静态发光零时间项（材质注记）；chip pop /
//     nudge 均一次性事件驱动动画，零 infinite 关键帧；
//   · **非强制**（G4 红线）：主链不锁任何楼（12 圈全程可用）、纯展示零输入劫持；
//     容器 pointer-events:none 全穿透——唯一交互件 = 折叠按钮（chip 可一键收起，
//     localStorage 记忆偏好；折叠后 idle nudge 仍呈现——空闲引导是 L7 功能面，
//     但绝不替用户展开 chip）；
//   · 待机纪律偏差留痕（ExploreProgress 同款）：chip 是常驻目标指示件（F6
//     「可见可选目标」本体），不适用瞬时反馈件「零事件时隐藏」——恒等门只管
//     poster 两态；
//   · 四降级轨：reduced-motion = pop/nudge 动画压 0.01ms，chip/距离/nudge 文字
//     照常（操作性信息不剥夺）；触屏 = 折叠按钮可点按、文案零键盘键位词；
//     quality=2 = 材质零时间项冻结无感；KinematicFallback = Zones 零物理依赖
//     （Areas 已兜底补建），链推进/距离读数照常、光柱纯视觉；
//   · 埋点随行：world-quest {action, step, targetId, elapsedMs}（goal 族）+
//     idle-nudge {targetId}（ux 族）——观测规格 §3.4 同 PR 加法登记；
//   · 样式内联注入（Reveal.injectStyles 先例），壳静态段零字节、LHCI 零影响。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { Building } from '../city/CityMap';
import {
  createQuestMarkerMaterials,
  type QuestMarkerMaterials,
} from '../rendering/NeonMaterials';

/** chip 折叠偏好持久键（G4 红线「可折叠 + 记忆偏好」；不可用时静默会话内） */
const COLLAPSE_KEY = 'world-quest-collapsed-v1';
/** 光柱高度（米）：静态发光柱——远处可见的「可去」信号 */
const BEAM_HEIGHT = 64;
/** 光柱半径（米） */
const BEAM_RADIUS = 0.8;
/** halo 基准触发圈半径（米）：其它半径的泊位按比例缩放整圈 */
const HALO_BASE_RADIUS = 6;

export interface QuestLineOptions {
  /** chip 标签（world-pois.json quest.label 单源） */
  label: { zh: string; en: string };
  /** 主链站点（Areas 按 quest.chain 解析出的在册楼，数组序即链序） */
  stations: readonly Building[];
  /**
   * ritual 模式：光柱入场与首个 shown 事件推迟到首个 world-transform to='car'
   * （robot_idle poster 恒等——光柱不得进首幕视锥；DOM 面另有样式门兜底）。
   */
  deferUntilCarReady: boolean;
  /**
   * [NX-W17 回城协议] 种子：挂载即计入 completed 的站（ExploreProgress 持久集∩主链）——
   * 回城后目标不再指向刚出来的楼、也不从第 1 站重头数。非链上 id 忽略；全满 = 直接自由探索态。
   */
  seedCompleted?: readonly string[];
}

export class QuestLine {
  private readonly game: Game;
  private readonly label: string;
  private readonly stations: readonly Building[];
  private readonly stationIndexById = new Map<string, number>();
  private readonly completed = new Set<string>();
  /** 当前目标 = stations[targetIndex]；=== stations.length 即主链完成 */
  private targetIndex = 0;

  private active = false;
  private activatedAt = 0;
  private deferred = false;
  private collapsed = false;
  private nudgeShown = false;
  private disposed = false;

  private root!: HTMLElement;
  private chip!: HTMLElement;
  private dot!: HTMLElement;
  private name!: HTMLElement;
  private distance!: HTMLElement;
  private step!: HTMLElement;
  private toggleBtn!: HTMLButtonElement;
  private nudge!: HTMLElement;

  private markers!: QuestMarkerMaterials;
  private beamGeometry!: THREE.CylinderGeometry;
  private haloGeometry!: THREE.TorusGeometry;
  private haloMesh!: THREE.Mesh;
  private readonly marker = new THREE.Group();
  private markerInScene = false;

  private distanceClock = 0;
  private lastDistanceText = '';

  /** 距离读数低频节拍（≈4Hz，G4 冻结稿「每 5Hz 更新」量级；变化帧才写 DOM） */
  private readonly tickHandler = (): void => {
    if (this.disposed || !this.active || this.isComplete()) return;
    this.distanceClock += this.game.ticker.delta;
    if (this.distanceClock < 0.25) return;
    this.distanceClock = 0;
    this.updateDistance();
  };

  /** ritual 激活/回变收场（世界标记的场景面门；DOM 面归样式门） */
  private readonly transformHandler = (to: 'robot' | 'car'): void => {
    if (this.disposed) return;
    if (to === 'car') this.activate();
    else this.marker.visible = false;
  };

  constructor(game: Game, options: QuestLineOptions) {
    this.game = game;
    this.label = options.label.zh;
    this.stations = options.stations;
    options.stations.forEach((building, index) => this.stationIndexById.set(building.id, index));
    for (const id of options.seedCompleted ?? []) if (this.stationIndexById.has(id)) this.completed.add(id);
    const firstOpen = this.stations.findIndex((building) => !this.completed.has(building.id));
    this.targetIndex = firstOpen === -1 ? this.stations.length : firstOpen;
    this.collapsed = this.readCollapsed();

    this.setDom(game.domElement);
    this.buildMarker();
    this.game.ticker.events.on('tick', this.tickHandler);

    if (options.deferUntilCarReady) {
      this.deferred = true;
      this.game.events.on('world-transform', this.transformHandler);
    } else {
      this.activate();
    }

    console.info(
      `[quest] G4 目标线 v0 就位：主链 ${this.stations.length} 站` +
        `（${this.stations.map((b) => b.id).join(' → ')}）；非强制可折叠` +
        `（折叠偏好还原=${this.collapsed}）；光柱/halo 静态发光零循环配额；` +
        (options.deferUntilCarReady ? '激活推迟至 car_ready（poster 恒等）' : '挂载即激活（非 ritual 腿）'),
    );
  }

  /** Areas boundingIn 接线：进任一未完成主链站触发圈即打钩（顺序外到站合法—— */
  /** 自由探索优先，目标恒为链上首个未完成站） */
  visit(id: string): void {
    if (this.disposed || !this.active || this.isComplete()) return;
    const index = this.stationIndexById.get(id);
    if (index === undefined || this.completed.has(id)) return;
    this.completed.add(id);
    this.log('reached', index, id);

    if (this.isComplete()) {
      this.enterComplete(id);
      return;
    }
    const next = this.stations.findIndex((building) => !this.completed.has(building.id));
    if (next !== this.targetIndex) {
      this.targetIndex = next;
      this.presentTarget();
    } else {
      // 顺序外到站：目标不动，仅 pop 确认（步进指的是目标步位，无需改写）
      this.pop(this.chip);
    }
  }

  /**
   * idle-30s 消费（L7 空闲主动引导）：index.ts 沿检测同拍调用。chip 脉冲 +
   * nudge 行「往光柱方向开」，驻留至下一个驾驶意图（clearNudge）；主链完成后
   * 无目标可指——静默返回（自由探索态不打扰）。
   */
  idleNudge(): void {
    if (this.disposed || !this.active || this.isComplete()) return;
    const building = this.stations[this.targetIndex];
    this.nudge.textContent =
      `空闲了？往光柱方向开——${this.label} ${building.title.zh} ${this.distanceTo(building)}m`;
    this.nudge.hidden = false;
    this.nudgeShown = true;
    this.pop(this.chip);
    this.pop(this.nudge);
    this.game.session.log('idle-nudge', { targetId: building.id });
    console.info(`[quest] idle-30s 消费：空闲引导 nudge → ${building.id}（下一个驾驶意图收起）`);
  }

  /** 驾驶意图收起 nudge（index.ts 节拍接线；未呈现时零副作用） */
  clearNudge(): void {
    if (this.disposed || !this.nudgeShown) return;
    this.nudgeShown = false;
    this.nudge.hidden = true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.game.ticker.events.off('tick', this.tickHandler);
    if (this.deferred) this.game.events.off('world-transform', this.transformHandler);
    if (this.markerInScene) this.game.scene.remove(this.marker);
    this.beamGeometry.dispose();
    this.haloGeometry.dispose();
    this.markers.dispose();
    this.root.remove();
  }

  /* ———————————————————— 链推进 ———————————————————— */

  private isComplete(): boolean {
    return this.completed.size === this.stations.length;
  }

  /** 激活（ritual = 首个 car_ready；非 ritual = 挂载即调）：幂等，回变再来只复显光柱 */
  private activate(): void {
    if (this.disposed) return;
    if (this.active) {
      if (!this.isComplete()) this.marker.visible = true;
      return;
    }
    this.active = true;
    this.activatedAt = performance.now();
    if (!this.markerInScene) {
      this.game.scene.add(this.marker);
      this.markerInScene = true;
    }
    // [NX-W17] 种子把链填满时不呈现目标（stations[length] 越界），直接进自由探索态
    if (this.isComplete()) {
      this.enterComplete(this.stations[this.stations.length - 1].id);
      return;
    }
    this.presentTarget();
  }

  /** 呈现当前目标站：chip 改写 + 标记移动/换色 + shown 埋点 */
  private presentTarget(): void {
    const building = this.stations[this.targetIndex];
    const bay = building.parkingBay;
    this.marker.position.set(bay.x, 0, bay.z);
    this.haloMesh.scale.setScalar(bay.radius / HALO_BASE_RADIUS);
    this.markers.setColor(building.neonColor);
    this.marker.visible = true;

    this.dot.style.setProperty('--quest-color', building.neonColor);
    this.name.textContent = building.title.zh;
    this.step.textContent = `${this.targetIndex + 1}/${this.stations.length}`;
    this.lastDistanceText = '';
    this.updateDistance();
    this.pop(this.chip);
    this.log('shown', this.targetIndex, building.id);
  }

  private enterComplete(lastId: string): void {
    this.targetIndex = this.stations.length;
    this.marker.visible = false;
    this.clearNudge();
    this.root.dataset.complete = '1';
    this.name.textContent = '主链完成 · 自由探索';
    this.distance.textContent = '';
    this.distance.hidden = true;
    this.step.textContent = `${this.stations.length}/${this.stations.length}`;
    this.pop(this.chip);
    this.log('chain-complete', this.stations.length - 1, lastId);
    console.info(`[quest] 主链五站集齐 🏁 目标线转自由探索态（光柱收场，12 圈照常可用）`);
  }

  private distanceTo(building: Building): number {
    const bay = building.parkingBay;
    const position = this.game.player.position;
    return Math.round(Math.hypot(position.x - bay.x, position.z - bay.z));
  }

  private updateDistance(): void {
    if (this.isComplete()) return;
    const text = `${this.distanceTo(this.stations[this.targetIndex])}m`;
    if (text === this.lastDistanceText) return;
    this.lastDistanceText = text;
    this.distance.textContent = text;
  }

  private log(action: 'shown' | 'reached' | 'chain-complete' | 'collapsed' | 'expanded', index: number, targetId: string): void {
    this.game.session.log('world-quest', {
      action,
      step: index + 1,
      targetId,
      elapsedMs: this.active ? Math.round(performance.now() - this.activatedAt) : 0,
    });
  }

  /* ———————————————————— 折叠偏好 ———————————————————— */

  private toggleCollapsed(): void {
    if (this.disposed) return;
    this.collapsed = !this.collapsed;
    this.applyCollapsed();
    this.writeCollapsed();
    const index = Math.min(this.targetIndex, this.stations.length - 1);
    this.log(this.collapsed ? 'collapsed' : 'expanded', index, this.stations[index].id);
  }

  private applyCollapsed(): void {
    if (this.collapsed) this.root.dataset.collapsed = '1';
    else delete this.root.dataset.collapsed;
    this.toggleBtn.textContent = this.collapsed ? `◈ ${this.label}` : '收起';
    this.toggleBtn.setAttribute('aria-expanded', this.collapsed ? 'false' : 'true');
  }

  /** 偏好还原（隐私模式/配额溢出一律静默会话内，ExploreProgress 同款降级） */
  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private writeCollapsed(): void {
    try {
      if (this.collapsed) localStorage.setItem(COLLAPSE_KEY, '1');
      else localStorage.removeItem(COLLAPSE_KEY);
    } catch {
      /* 静默会话内偏好 */
    }
  }

  /* ———————————————————— 世界标记 ———————————————————— */

  private buildMarker(): void {
    this.markers = createQuestMarkerMaterials(BEAM_HEIGHT);
    this.beamGeometry = new THREE.CylinderGeometry(BEAM_RADIUS, BEAM_RADIUS * 1.6, BEAM_HEIGHT, 12, 1, true);
    const beam = new THREE.Mesh(this.beamGeometry, this.markers.beam);
    beam.position.y = BEAM_HEIGHT / 2;
    this.haloGeometry = new THREE.TorusGeometry(HALO_BASE_RADIUS + 0.34, 0.22, 8, 64);
    this.haloMesh = new THREE.Mesh(this.haloGeometry, this.markers.halo);
    this.haloMesh.rotation.x = -Math.PI / 2;
    this.haloMesh.position.y = 0.12;
    this.marker.add(beam, this.haloMesh);
    // 场景入场推迟到 activate（ritual 首幕视锥零新增件——poster 恒等的场景面）
    this.marker.visible = false;
  }

  /* ———————————————————— DOM ———————————————————— */

  /** 一次性 pop 重触发（DriveFeedback 同款：remove → reflow → add，播完即静止） */
  private pop(el: HTMLElement): void {
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
  }

  private setDom(stage: HTMLElement): void {
    this.injectStyles();

    this.root = document.createElement('div');
    this.root.className = 'world-quest';
    this.root.dataset.worldQuest = '';

    this.chip = document.createElement('div');
    this.chip.className = 'world-quest-chip';

    this.dot = document.createElement('span');
    this.dot.className = 'world-quest-dot';
    this.dot.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'world-quest-label';
    label.textContent = this.label;

    this.name = document.createElement('span');
    this.name.className = 'world-quest-name';
    this.name.dataset.worldQuestName = '';

    this.distance = document.createElement('span');
    this.distance.className = 'world-quest-distance';
    this.distance.dataset.worldQuestDistance = '';

    this.step = document.createElement('span');
    this.step.className = 'world-quest-step';
    this.step.dataset.worldQuestStep = '';

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.type = 'button';
    this.toggleBtn.className = 'world-quest-toggle';
    this.toggleBtn.dataset.worldQuestToggle = '';
    this.toggleBtn.setAttribute('aria-label', '目标线：折叠或展开「下一站」导视');
    this.toggleBtn.addEventListener('click', () => {
      this.toggleCollapsed();
      // 焦点即还（Reveal recall 按钮同纪律）：驾驶键位零误触
      this.toggleBtn.blur();
    });

    this.chip.append(this.dot, label, this.name, this.distance, this.step, this.toggleBtn);

    this.nudge = document.createElement('p');
    this.nudge.className = 'world-quest-nudge';
    this.nudge.dataset.worldQuestNudge = '';
    this.nudge.setAttribute('role', 'status');
    this.nudge.setAttribute('aria-live', 'polite');
    this.nudge.hidden = true;

    this.root.append(this.chip, this.nudge);
    stage.appendChild(this.root);
    this.applyCollapsed();
  }

  private injectStyles(): void {
    const styleId = 'world-quest-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    // 霓虹胶囊语汇对齐反馈层/探索 chip（青主轴；完成态转琥珀金）；容器全层穿透，
    // 唯一交互件 = 折叠按钮；顶部居中 1rem（反馈 stack 3.4rem 起，纵向天然错开）
    style.textContent = `
.world-quest{position:absolute;top:1rem;left:50%;transform:translateX(-50%);z-index:5;display:flex;flex-direction:column;align-items:center;gap:.35rem;max-width:92%;pointer-events:none;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Noto Sans CJK SC',sans-serif}
[data-world-state='robot_idle'] .world-quest,[data-world-state='transforming'] .world-quest{display:none!important}
.world-quest-chip{display:flex;align-items:baseline;gap:.55em;color:#eafffb;background:rgba(8,13,19,.78);border:1px solid rgba(73,197,182,.55);border-radius:999px;padding:.4em .5em .4em 1.05em;text-shadow:0 0 8px rgba(73,197,182,.4);box-shadow:0 0 14px rgba(73,197,182,.22)}
.world-quest-dot{width:.55em;height:.55em;border-radius:50%;align-self:center;background:var(--quest-color,#49c5b6);box-shadow:0 0 8px var(--quest-color,#49c5b6)}
.world-quest-label{font-size:.72rem;letter-spacing:.2em;color:#9fe8dc}
.world-quest-name{font-size:.9rem;font-weight:650;letter-spacing:.08em}
.world-quest-distance{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.85rem;color:#bdfff4}
.world-quest-step{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.72rem;color:#9fb6b1}
.world-quest-toggle{pointer-events:auto;font:inherit;font-size:.7rem;letter-spacing:.1em;color:#9fb6b1;cursor:pointer;padding:.22em .7em;border-radius:999px;border:1px solid rgba(73,197,182,.32);background:rgba(12,13,17,.6);transition:color .25s,border-color .25s}
.world-quest-toggle:hover,.world-quest-toggle:focus-visible{color:#eafffb;border-color:rgba(73,197,182,.7)}
.world-quest[data-collapsed='1'] .world-quest-chip>:not(.world-quest-toggle){display:none}
.world-quest[data-collapsed='1'] .world-quest-chip{padding:.32em .5em}
.world-quest[data-complete='1'] .world-quest-chip{color:#fff3dc;border-color:rgba(255,196,84,.75);text-shadow:0 0 10px rgba(255,196,84,.6);box-shadow:0 0 18px rgba(255,196,84,.3)}
.world-quest-nudge{margin:0;font-size:.78rem;color:#eafffb;background:rgba(8,13,19,.72);border:1px solid rgba(255,196,84,.55);border-radius:999px;padding:.34em 1.1em;text-shadow:0 0 8px rgba(255,196,84,.45)}
.world-quest-nudge[hidden]{display:none}
.world-quest .is-pop{animation:world-quest-pop .45s ease}
@keyframes world-quest-pop{0%{transform:scale(.88);opacity:.4}60%{transform:scale(1.07)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.world-quest .is-pop{animation-duration:.01ms}.world-quest-toggle{transition:none}}
`;
    document.head.appendChild(style);
  }
}
