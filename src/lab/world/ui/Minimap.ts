// [CC-NAV-C1] Minimap —— M 键非模态半屏小地图 + pin 点击进楼（两段式传送）。
// 立项依据 = GAP-12 POI 发现性 P0（无罗盘/距离/小地图，最近 bay 距出生 ~30m）；
// 交互正本 = NAV 调研 docs/research/cyber-city-minimap-nav-survey.md §3/§5；
// 语义终裁 = 董事会 R5-impl-gate §B（DP-1 传送式两段式 GO / DP-3 双态 hidden 随案盖章）。
// folio Game/Map.js（commit 41046b5）模式级重写：M 键动作注册 / worldToMap 线性投影 /
// pin=传送+关面板 / 玩家标记整米去抖 + tick order 14 / 懒初始化五件照搬（调研 P1-P6）；
// 位图底图换程序化 SVG（楼宇 JSON 派生，零资产字节——调研 N1）、Modals 依赖换 DOM
// 注入非模态面板（N2）、无障碍层从零新写（N7）。
//
// 交互合同（调研 §3 冻结口径）：
//   · M toggle（动作 'minimap'，运行期 addActions 注册——Keyboard.ts 零改动）+
//     HUD「地图」钮（触屏唯一入口）+ Esc 只关不开；
//   · categories ['wandering','driving']：与 poiInteract（E 进站）同队——?poi=/?city=
//     深链腿（非 ritual，filters='wandering'）小地图与 E 同权可用；robot_idle/
//     transforming 仍被 intro 闸门物理拦截（调研 P1 的 ['driving'] 收敛口径按
//     E 键同权原则放宽一档，恒等保证不变——灰盒 /world-spike/ 不挂城市，本模块
//     根本不构造，wandering 放行零波及）；
//   · Esc 双响拆弹（调研 §3.1 / 风险 R1）：壳页在 window 冒泡段监听 Escape 开合
//     ESC 菜单（index.astro）——本模块在 window capture 段先行吞键（stopPropagation
//     + preventDefault）再关面板，引擎自洽零壳改；
//   · 非模态（调研 §3.2）：开态不吞驾驶键、不暂停 Ticker——「驾驶意图至上」红线；
//     面板本体 pointer-events:auto 接管指针（Pointer 挂 canvasElement，误点穿透
//     天然阻断——风险 R4）；焦点在面板内的 Enter 只留给 pin 原生激活（capture 段
//     stopPropagation，不 preventDefault——防 poiInteract 同键双响）；
//   · 两段式进楼（DP-1 终裁）：pin 点击 → teleportTo() 传送至该楼 parkingBay
//     （applyDeepLink 同一位姿换算式；落点即触发圈内，boundingIn 全链天然入账：
//     poi-bounding-in / explore / quest 零旁路）→ 关面板 → 玩家 E 确认进站
//     （PoiArrival 前奏照常）。直跳楼页已被董事会否决（v1 禁做）；
//   · 传送竞态（调研风险 R3）：teleport 不经 actionStart，RELEASE_ACTIONS 拦不到
//     在途进站前奏——传送入口显式调 arrival.cancel() 释放（防传送后仍跳去旧楼页）；
//   · 不动 Respawns（调研风险 R2）：传送直写 physicalVehicle.moveTo，R 键语义
//     （回到路口）零漂移；
//   · v1 零缩略资产（DP-2 默认值）：pin = neonColor 色钉 + 双语楼名；底部预留
//     [data-world-minimap-dock] 槽位（NAV-C1.5 楼卡缩略条落点，本段禁扩批不做）。
//
// 纪律红线（ExploreProgress/DriveFeedback 同款）：
//   · DP-3 双态 hidden 三重保险：① categories 闸门（intro 物理拦截）② CSS 样式门
//     [data-world-state='robot_idle'/'transforming'] 整层 display:none（非 ritual
//     路径无该属性恒放行，FB-06 同构）③ 懒初始化（首开才建面板 DOM——robot_idle
//     帧零面板节点，poster 逐字节恒等零风险面）；
//   · 玩家标记更新走整米去抖 + 面板关闭即 return（folio P5 纪律，勿逐帧写 DOM）；
//   · 开合为一次性事件驱动动画（CITY-03 循环配额零占用）；reduced-motion 直切
//     0.01ms（开合是装饰动效；标记朝向/位置是操作性信息，保留）；
//   · 样式内联注入（Reveal.injectStyles 先例）——壳静态段零字节、LHCI 零影响；
//   · 埋点随行（观测规格 §3.4 [CC-NAV-C1] 加法行）：minimap-open {via} /
//     minimap-close {via} / minimap-teleport {id, distanceM}。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { Building, CyberCityMap } from '../city/CityMap';
import type { PoiArrival } from '../areas/PoiArrival';

/** 地图边距（米）：世界边长 = 道路 range 最远端 + 本值，两侧对称（调研 P2 派生式） */
const MAP_MARGIN = 10;
/** 玩家标记朝向量化步长（度）：去抖粒度，防逐帧写 transform */
const MARKER_ROT_STEP = 3;

export interface MinimapOptions {
  /** DOM 注入舞台（canvas 同级；Reveal/DriveFeedback 同层同窗） */
  stage: HTMLElement;
  /** 进站前奏控制器（Areas.arrival）：传送入口显式取消在途前奏（风险 R3）；null 容忍 */
  arrival?: PoiArrival | null;
}

export class Minimap {
  private readonly game: Game;
  private readonly map: CyberCityMap;
  private readonly arrival: PoiArrival | null;
  /** 世界边长（米）：worldToMap 线性投影分母（folio P2：world/size + 0.5） */
  private readonly worldSize: number;
  /** districts 序展平的在册楼（Tab 顺序 = JSON districts 序，调研 §3.4） */
  private readonly buildings: Building[];
  private readonly buildingById: Map<string, Building>;
  /** 触屏检测（构造时快照，SessionTimeline env.touch 同口径） */
  private readonly touch = matchMedia('(pointer: coarse)').matches;

  private root!: HTMLElement;
  private btn!: HTMLButtonElement;
  /** 懒初始化（folio P6）：首次 open 才建面板 DOM——robot_idle 帧零面板节点 */
  private panel: HTMLElement | null = null;
  private marker: HTMLElement | null = null;
  private firstPin: HTMLButtonElement | null = null;
  private openState = false;
  /** 关面板后的焦点还原目标（壳 Esc 菜单 close 同纪律） */
  private returnFocus: HTMLElement | null = null;
  private readonly markerLast = { x: NaN, z: NaN, rot: NaN };
  private disposed = false;

  /** M 键 toggle（isToggle 语义：按下翻转一次，长按不连发——hintToggle 同构） */
  private readonly minimapActionHandler = (action: { active: boolean }): void => {
    if (action.active) this.toggle('key');
  };

  /**
   * window capture 段键盘拆弹（调研 §3.1 吞键方案）：面板开态 ① Escape 吞掉再关
   * （壳菜单冒泡段监听不再收到——A2 双响回归锁）；② 焦点在面板内的 Enter 只
   * stopPropagation（原生 pin 激活保留，引擎 poiInteract 不双响）。闭态零干预。
   */
  private readonly keyCaptureHandler = (event: KeyboardEvent): void => {
    if (!this.openState) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close('esc');
    } else if (event.key === 'Enter' && this.panel?.contains(document.activeElement)) {
      event.stopPropagation();
    }
  };

  /** 玩家标记同步（folio P5：tick order 14 + 面板关闭即 return + 整米去抖） */
  private readonly tickHandler = (): void => {
    this.syncMarker(false);
  };

  constructor(game: Game, map: CyberCityMap, options: MinimapOptions) {
    this.game = game;
    this.map = map;
    this.arrival = options.arrival ?? null;

    const roadExtent = Math.max(
      ...map.world.roads.flatMap((road) => road.range.map((edge) => Math.abs(edge))),
    );
    this.worldSize = (roadExtent + MAP_MARGIN) * 2;

    this.buildingById = new Map(map.buildings.map((building) => [building.id, building]));
    const ordered: Building[] = [];
    for (const district of map.districts)
      for (const id of district.buildings) {
        const building = this.buildingById.get(id);
        if (building) ordered.push(building);
      }
    for (const building of map.buildings)
      if (!ordered.includes(building)) ordered.push(building);
    this.buildings = ordered;

    this.setDom(options.stage);

    // M 动作运行期注册（Keyboard.ts 零改动——调研 §1.3「比 R5 文件域预估更正交」）
    this.game.inputs.addActions([
      { name: 'minimap', categories: ['wandering', 'driving'], keys: ['Keyboard.KeyM', 'Keyboard.m'] },
    ]);
    this.game.inputs.events.on('minimap', this.minimapActionHandler);
    window.addEventListener('keydown', this.keyCaptureHandler, true);
    this.game.ticker.events.on('tick', this.tickHandler, 14);

    console.info(
      `[minimap] CC-NAV-C1 小地图就位：M/「地图」钮开合（非模态），pin 点击 = 传送 parkingBay + ` +
        `E 确认进站（两段式，DP-1）；在册楼 ${this.buildings.length}，世界边长 ${this.worldSize}m；` +
        `零缩略资产（色钉+双语楼名，DP-2 v1 口径）`,
    );
  }

  /**
   * 两段式第一段（进楼语义单源——NAV-C1.5 楼卡缩略条与 pin 共用本入口）：
   * 传送至目标楼 parkingBay（applyDeepLink 同一 heading 换算式）+ 关面板。
   * 不动 Respawns（R 键语义零漂移）、不发 player 'respawn' 事件（不重置世界道具、
   * 不出复位 toast——传送 ≠ 失败恢复）；落点即触发圈内，下一 tick Zones 距离检测
   * 自然触发 boundingIn（标点 pinned 展开 + explore/quest 入账），玩家 E 确认进站。
   */
  teleportTo(buildingId: string): boolean {
    const building = this.buildingById.get(buildingId);
    if (!building) {
      console.warn(`[minimap] 传送目标未在册：${buildingId}`);
      return false;
    }

    const bay = building.parkingBay;
    const player = this.game.player;
    const distanceM = Math.round(Math.hypot(player.position.x - bay.x, player.position.z - bay.z));

    // 风险 R3：在途进站前奏/定帧 shot 显式取消（teleport 不经 actionStart，
    // RELEASE_ACTIONS 拦不到）——防传送到 B 后仍跳去 A 楼页/相机滞留旧机位
    this.arrival?.cancel();

    // heading（0=北，顺时针）→ rotationY：Areas.applyDeepLink 同一换算式（单源口径）
    const rotation = Math.PI / 2 - (bay.heading * Math.PI) / 180;
    const target = new THREE.Vector3(bay.x, 0, bay.z);
    const vehicle = this.game.physicalVehicle;
    if (vehicle) {
      vehicle.moveTo(target, rotation);
    } else {
      player.position.copy(target);
      player.rotationY = rotation;
    }

    this.game.session.log('minimap-teleport', { id: buildingId, distanceM });
    console.info(
      `[minimap] minimap-teleport:${buildingId} → parkingBay (${bay.x}, ${bay.z})` +
        `（距离 ${distanceM}m；落点即触发圈内，E 确认进站——两段式 DP-1）`,
    );
    this.close('teleport');
    return true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.game.inputs.events.off('minimap', this.minimapActionHandler);
    window.removeEventListener('keydown', this.keyCaptureHandler, true);
    this.game.ticker.events.off('tick', this.tickHandler);
    this.root.remove();
  }

  /* ———————————————————— 开合 ———————————————————— */

  private toggle(via: 'key' | 'button'): void {
    if (this.openState) this.close(via);
    else this.openPanel(via);
  }

  private openPanel(via: 'key' | 'button'): void {
    if (this.disposed || this.openState) return;
    this.ensurePanel();
    this.openState = true;
    this.panel!.hidden = false;
    this.btn.setAttribute('aria-expanded', 'true');

    // 一次性开合 pop（remove → reflow → add，播完即静止——DriveFeedback 同款）；
    // reduced-motion 由样式表压 0.01ms 直切
    this.panel!.classList.remove('is-pop');
    void this.panel!.offsetWidth;
    this.panel!.classList.add('is-pop');

    // 焦点移入面板首 pin（调研 §3.4）；关面板时还原触发前元素
    this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.firstPin?.focus();
    this.syncMarker(true);
    this.game.session.log('minimap-open', { via });
  }

  private close(via: 'key' | 'esc' | 'button' | 'teleport'): void {
    if (!this.openState) return;
    this.openState = false;
    if (this.panel) this.panel.hidden = true;
    this.btn.setAttribute('aria-expanded', 'false');

    const target = this.returnFocus;
    this.returnFocus = null;
    if (target?.isConnected) target.focus();
    this.game.session.log('minimap-close', { via });
  }

  /* ———————————————————— 玩家标记 ———————————————————— */

  /** worldToMap 线性投影（folio P2 照搬）：world/size + 0.5，clamp [0,1] → 百分比 */
  private toMapPct(value: number): number {
    return Math.min(Math.max(value / this.worldSize + 0.5, 0), 1) * 100;
  }

  private syncMarker(force: boolean): void {
    if (!this.openState || !this.marker) return;

    const player = this.game.player;
    // 整米去抖 + 朝向量化（folio P5）：变化帧才写 DOM
    const x = Math.round(player.position.x);
    const z = Math.round(player.position.z);
    // rotationY（forward = (cos r, 0, -sin r)）→ 地图 CSS 顺时针角（上 = 北 = -Z）
    const rotationDeg =
      Math.round(
        (Math.atan2(Math.cos(player.rotationY), Math.sin(player.rotationY)) * 180) /
          Math.PI /
          MARKER_ROT_STEP,
      ) * MARKER_ROT_STEP;
    if (
      !force &&
      x === this.markerLast.x &&
      z === this.markerLast.z &&
      rotationDeg === this.markerLast.rot
    )
      return;
    this.markerLast.x = x;
    this.markerLast.z = z;
    this.markerLast.rot = rotationDeg;

    this.marker.style.left = `${this.toMapPct(x)}%`;
    this.marker.style.top = `${this.toMapPct(z)}%`;
    this.marker.style.transform = `translate(-50%,-50%) rotate(${rotationDeg}deg)`;
  }

  /* ———————————————————— DOM ———————————————————— */

  private setDom(stage: HTMLElement): void {
    this.injectStyles();

    this.root = document.createElement('div');
    this.root.className = 'world-minimap-root';
    this.root.dataset.worldMinimapRoot = '';

    // HUD「地图」钮（recallBtn 同窗先例；触屏唯一入口）。可见窗由 CSS 样式门管：
    // ritual 两态 hidden、car_ready/driving 与非 ritual 路径可见
    this.btn = document.createElement('button');
    this.btn.type = 'button';
    this.btn.className = 'world-minimap-btn';
    this.btn.dataset.worldMinimapBtn = '';
    this.btn.setAttribute('aria-keyshortcuts', 'KeyM');
    this.btn.setAttribute('aria-expanded', 'false');
    this.btn.setAttribute('aria-label', '城市地图：打开或关闭小地图');
    this.btn.innerHTML = this.touch ? '地图' : '地图 <kbd>M</kbd>';
    this.btn.addEventListener('click', () => this.toggle('button'));

    this.root.appendChild(this.btn);
    stage.appendChild(this.root);
  }

  /** 懒初始化（folio P6）：首次 open 才构建面板/pin/标记 DOM */
  private ensurePanel(): void {
    if (this.panel) return;

    const panel = document.createElement('section');
    panel.className = 'world-minimap';
    panel.dataset.worldMinimap = '';
    panel.hidden = true;
    // 非模态 dialog（调研 §3.4）：驾驶键不吞、世界不暂停——aria-modal 显式 false
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', '城市地图');

    const head = document.createElement('header');
    head.className = 'world-minimap-head';
    const title = document.createElement('span');
    title.className = 'world-minimap-title';
    title.textContent = '城市地图 · CITY MAP';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'world-minimap-close';
    closeBtn.dataset.worldMinimapClose = '';
    closeBtn.setAttribute('aria-label', '关闭地图（Esc）');
    closeBtn.innerHTML = this.touch ? '关闭' : '关闭 <kbd>Esc</kbd>';
    closeBtn.addEventListener('click', () => this.close('button'));
    head.append(title, closeBtn);

    const board = document.createElement('div');
    board.className = 'world-minimap-board';
    board.appendChild(this.buildBaseSvg());

    // pin = 原生 button 列表（Enter/Space 激活免费获得）；Tab 顺序 = districts 序
    for (const building of this.buildings) {
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'world-minimap-pin';
      pin.dataset.worldMinimapPin = building.id;
      pin.style.left = `${this.toMapPct(building.position.x)}%`;
      pin.style.top = `${this.toMapPct(building.position.z)}%`;
      // aria-label = 楼名 · role 一句话职能（调研 §3.4；buildings JSON 现成字段）
      pin.setAttribute('aria-label', `${building.title.zh}（${building.title.en}）· ${building.role}`);
      const dot = document.createElement('i');
      dot.style.background = building.neonColor;
      dot.style.color = building.neonColor;
      const zh = document.createElement('span');
      zh.className = 'world-minimap-pin-zh';
      zh.textContent = building.title.zh;
      const en = document.createElement('span');
      en.className = 'world-minimap-pin-en';
      en.textContent = building.title.en;
      pin.append(dot, zh, en);
      pin.addEventListener('click', () => this.teleportTo(building.id));
      board.appendChild(pin);
      this.firstPin ??= pin;
    }

    this.marker = document.createElement('div');
    this.marker.className = 'world-minimap-player';
    this.marker.dataset.worldMinimapPlayer = '';
    this.marker.setAttribute('aria-hidden', 'true');
    board.appendChild(this.marker);

    const note = document.createElement('p');
    note.className = 'world-minimap-note';
    note.textContent = this.touch
      ? '点按楼名传送至楼前泊车位 · 点按标点进站'
      : '点击楼名传送至楼前泊车位 · E 确认进站 · Esc 关闭';

    // NAV-C1.5 楼卡缩略条预留槽位（调研 §4：v1 落结构、v1.5 只加呈现；本段禁扩批）
    const dock = document.createElement('div');
    dock.className = 'world-minimap-dock';
    dock.dataset.worldMinimapDock = '';
    dock.hidden = true;

    panel.append(head, board, note, dock);
    this.root.appendChild(panel);
    this.panel = panel;
  }

  /** 程序化底图（调研 N1）：SVG 道路带 + 楼 footprint 矩形——楼宇 JSON 派生零资产字节 */
  private buildBaseSvg(): SVGSVGElement {
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    for (const road of this.map.world.roads) {
      const band = document.createElementNS(svgNs, 'rect');
      const half = (road.halfWidth / this.worldSize) * 100;
      const from = this.toMapPct(road.range[0]);
      const span = this.toMapPct(road.range[1]) - from;
      if (road.axis === 'north-south') {
        band.setAttribute('x', String(50 - half));
        band.setAttribute('width', String(half * 2));
        band.setAttribute('y', String(from));
        band.setAttribute('height', String(span));
      } else {
        band.setAttribute('y', String(50 - half));
        band.setAttribute('height', String(half * 2));
        band.setAttribute('x', String(from));
        band.setAttribute('width', String(span));
      }
      band.setAttribute('fill', 'rgba(73,197,182,.10)');
      band.setAttribute('stroke', 'rgba(73,197,182,.30)');
      band.setAttribute('stroke-width', '.3');
      svg.appendChild(band);
    }

    // footprint 轴对齐近似（rotationY 忽略——2D 示意图口径，非测绘）
    for (const building of this.buildings) {
      const rect = document.createElementNS(svgNs, 'rect');
      const w = (building.footprint.w / this.worldSize) * 100;
      const d = (building.footprint.d / this.worldSize) * 100;
      rect.setAttribute('x', String(this.toMapPct(building.position.x) - w / 2));
      rect.setAttribute('y', String(this.toMapPct(building.position.z) - d / 2));
      rect.setAttribute('width', String(w));
      rect.setAttribute('height', String(d));
      rect.setAttribute('fill', `${building.neonColor}22`);
      rect.setAttribute('stroke', building.neonColor);
      rect.setAttribute('stroke-width', '.35');
      rect.setAttribute('rx', '.6');
      svg.appendChild(rect);
    }

    return svg;
  }

  private injectStyles(): void {
    const styleId = 'world-minimap-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    // z 序（调研 §3.2）：toast/chip（z5）之上、#debug 面板（z40）之下；
    // 根层全穿透，钮/面板各自 pointer-events:auto 接管
    style.textContent = `
.world-minimap-root{position:absolute;inset:0;z-index:6;pointer-events:none;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Noto Sans CJK SC',sans-serif}
[data-world-state='robot_idle'] .world-minimap-root,[data-world-state='transforming'] .world-minimap-root{display:none!important}
.world-minimap-btn{position:absolute;top:2.85rem;right:.95rem;pointer-events:auto;font:inherit;font-size:.68rem;letter-spacing:.14em;color:#9fb6b1;cursor:pointer;padding:.34em 1em;border-radius:999px;border:1px solid rgba(73,197,182,.32);background:rgba(12,13,17,.6);transition:color .25s,border-color .25s}
.world-minimap-btn:hover,.world-minimap-btn:focus-visible{color:#eafffb;border-color:rgba(73,197,182,.7)}
.world-minimap-btn kbd{font:inherit;font-size:.9em;letter-spacing:.1em;padding:.1em .5em;margin-left:.35em;border:1px solid rgba(234,255,251,.35);border-radius:6px;background:rgba(234,255,251,.08)}
.world-minimap{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(62vmin,calc(100vw - 2rem));max-height:min(78vh,42rem);pointer-events:auto;display:flex;flex-direction:column;gap:.55rem;padding:.85rem .95rem .9rem;color:#eafffb;background:rgba(7,11,18,.93);border:1px solid rgba(73,197,182,.55);border-radius:14px;box-shadow:0 0 30px rgba(73,197,182,.22)}
.world-minimap[hidden]{display:none}
.world-minimap-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem}
.world-minimap-title{font-size:.74rem;letter-spacing:.22em;color:#bdfff4;text-shadow:0 0 8px rgba(73,197,182,.55)}
.world-minimap-close{font:inherit;font-size:.66rem;letter-spacing:.12em;color:#9fb6b1;cursor:pointer;padding:.3em .9em;border-radius:999px;border:1px solid rgba(73,197,182,.32);background:rgba(12,13,17,.6)}
.world-minimap-close:hover,.world-minimap-close:focus-visible{color:#eafffb;border-color:rgba(73,197,182,.7)}
.world-minimap-close kbd{font:inherit;font-size:.9em;padding:.08em .45em;margin-left:.3em;border:1px solid rgba(234,255,251,.35);border-radius:5px;background:rgba(234,255,251,.08)}
.world-minimap-board{position:relative;width:100%;aspect-ratio:1;background:rgba(9,14,21,.92);border:1px solid rgba(73,197,182,.28);border-radius:10px;overflow:hidden}
.world-minimap-board svg{position:absolute;inset:0;width:100%;height:100%}
.world-minimap-pin{position:absolute;transform:translate(-50%,-50%);min-width:44px;min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:2px;border:0;background:transparent;color:#eafffb;cursor:pointer;font:inherit;line-height:1.15;text-shadow:0 1px 3px rgba(0,0,0,.85)}
.world-minimap-pin i{width:9px;height:9px;border-radius:50%;box-shadow:0 0 8px currentColor}
.world-minimap-pin:hover,.world-minimap-pin:focus-visible{outline:2px solid rgba(73,197,182,.85);outline-offset:-2px;border-radius:8px;background:rgba(73,197,182,.12)}
.world-minimap-pin-zh{font-size:.58rem;letter-spacing:.04em}
.world-minimap-pin-en{font-size:.48rem;opacity:.62;letter-spacing:.03em}
.world-minimap-player{position:absolute;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:13px solid #49c5b6;filter:drop-shadow(0 0 6px rgba(73,197,182,.9))}
.world-minimap-note{margin:0;font-size:.62rem;letter-spacing:.06em;color:#9fb6b1;text-align:center}
.world-minimap-dock{min-height:0}
.world-minimap.is-pop{animation:world-minimap-pop .26s ease}
@keyframes world-minimap-pop{from{opacity:0;transform:translate(-50%,-50%) scale(.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@media (max-width:820px){.world-minimap{top:40%;width:min(80vmin,calc(100vw - 1.4rem))}}
@media (prefers-reduced-motion:reduce){.world-minimap.is-pop{animation-duration:.01ms}.world-minimap-btn,.world-minimap-close{transition:none}}
`;
    document.head.appendChild(style);
  }
}
