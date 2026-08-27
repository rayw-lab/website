// CC-OBS-C2：#debug 只读面板 v0（可观测规格 docs/spec/cyber-city-observability.md §5）。
// 入口：index.ts 既有 `location.hash.includes('debug')` 分支动态 import——Vite 自动
// 独立 chunk，无 #debug 的生产路径零请求零字节（CAM-DES F7 同款红线，CITY-OBS-05
// 机器断言）；audit-budget 门参数零改动（本 chunk 不带 world 命名、不进首屏/壳清单）。
//
// 红线（§5.3，实现逐条对齐）：
//   1. 只读 + 导出——面板不含任何改状态控件（唯一 button = [data-debug-export]，
//      无 teleport/重生/画质/相机接管；free 相机 G5 红线不从 debug 后门破窗）；
//   2. 零新依赖；样式内联注入（Reveal.injectStyles 先例），不进壳样式表；
//   3. 面板异常不得影响游戏路径——构造/刷新全 try-catch，静默降级为不渲染 +
//      console.warn 一次。
//
// DOM 契约（§5.2 冻结，e2e SEL 对齐）：根 [data-debug-panel]（fixed 右上、等宽字体、
// 半透明底、z-index 高于 ritual 覆盖层 z:3、不遮左下 CTA/HUD 热区）；根
// pointer-events:none、仅导出按钮 auto；[data-debug-tail] 事件尾巴（最近 10 条，
// 新在下）；[data-debug-cam] CAM F7 留位空容器（CAM 在此扩展，禁止第二块 overlay）。
// 刷新：ticker tick order 999（HUD 同拍）+ 内部 0.25s 节流。
// [CC-PERF-C2-B0] §5.2 随行加法：性能行下增分段帧时行（frame + 7 段 avg/max ms，
// FrameProfiler 供数，O10 归因工具）——纯只读 dt/dd 行，只读红线与既有断言面零变化。
import type { Game } from '../core/Game';
import type { FpsMeter } from '../utils/FpsMeter';
import type { SessionEventEntry } from '../core/SessionTimeline';
import { FrameProfiler, type SegmentReading } from './FrameProfiler';

export interface DebugPanelOptions {
  game: Game;
  /** 复用 index.ts 装配段既有 FpsMeter 实例（§5.1：不重复建表） */
  fps: FpsMeter;
}

/** 刷新节流（§5.2：HUD 同拍 0.25s） */
const REFRESH_INTERVAL = 0.25;
/** 事件尾巴条数（§5.2 冻结：最近 10 条） */
const TAIL_LIMIT = 10;
/** [CC-PERF-C2-B0] 分段帧时行（FrameProfiler 段表投影；顺序 = tick order 段序） */
const PROFILE_SEGMENTS = ['anim', 'physics', 'sync', 'camera', 'areas', 'render', 'hud'] as const;

/** [CC-PERF-C2-B0] 段耗时格式（ms）：量级自适应位数（SwiftShader 段值可达数百 ms） */
const fmtMs = (v: number): string => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2));

const STYLE_ID = 'world-debug-style';

const PANEL_CSS = `
[data-debug-panel]{position:fixed;top:12px;right:12px;z-index:40;min-width:260px;max-width:340px;
padding:10px 12px;border:1px solid rgba(73,197,182,.35);border-radius:10px;
background:rgba(8,10,16,.82);color:#d7fef6;
font:11px/1.55 ui-monospace,Menlo,Consolas,'SF Mono',monospace;
pointer-events:none;user-select:text;white-space:nowrap}
[data-debug-panel] dl{display:grid;grid-template-columns:auto 1fr;gap:0 10px;margin:0}
[data-debug-panel] dt{margin:0;color:#7fb8ae;text-align:right}
[data-debug-panel] dd{margin:0}
[data-debug-panel] [data-debug-tail]{margin:8px 0 0;padding:6px 0 0;list-style:none;
border-top:1px dashed rgba(73,197,182,.3);max-width:100%;overflow:hidden}
[data-debug-panel] [data-debug-tail] li{overflow:hidden;text-overflow:ellipsis}
[data-debug-panel] [data-debug-export]{pointer-events:auto;margin-top:8px;cursor:pointer;
font:inherit;color:#eafffb;background:rgba(18,46,52,.9);border:1px solid rgba(73,197,182,.6);
border-radius:6px;padding:.35em 1em}
[data-debug-panel] [data-debug-export]:hover{background:rgba(28,66,72,.95)}
[data-debug-panel] [data-debug-cam]:empty{display:none}
`;

export class DebugPanel {
  private readonly game: Game;
  private readonly fps: FpsMeter;
  /** host = data-world-state / data-drive-view 属性载体（`/` 壳或 world-spike 壳） */
  private readonly host: Element | null;

  private root: HTMLElement | null = null;
  private values: Record<string, HTMLElement> = {};
  private tailList: HTMLUListElement | null = null;
  /** [CC-PERF-C2-B0] 分段帧时剖析（O10 #debug 门控层）：随面板同生共死 */
  private profiler: FrameProfiler | null = null;
  private clock = 0;
  private lastTailSeq = -1;
  private warned = false;
  private disposed = false;

  private readonly tickHandler = (): void => {
    this.refresh();
  };

  constructor(options: DebugPanelOptions) {
    this.game = options.game;
    this.fps = options.fps;
    this.host =
      options.game.canvasElement.closest('[data-world-host], [data-ws-host]') ??
      document.querySelector('[data-world-host], [data-ws-host]');

    // 红线 3：构造异常静默降级为不渲染（游戏路径零影响）
    try {
      this.setDom();
      this.refresh(true);
      // tick order 999 = HUD 同拍（index.ts 装配段先例）
      this.game.ticker.events.on('tick', this.tickHandler, 999);
      // [CC-PERF-C2-B0] 剖析器最后挂：其 c999 检查点后于面板刷新 handler 注册
      // （同 order 后注册后执行）——面板刷新成本计入 hud 段，帧终点结算完整
      this.profiler = new FrameProfiler(options.game);
    } catch (error) {
      this.warnOnce(error);
      this.profiler?.dispose();
      this.profiler = null;
      this.teardownDom();
    }
  }

  /** instance.dispose() 调用（§5.1）：移除 DOM + tick 订阅 + 剖析检查点（幂等） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.game.ticker.events.off('tick', this.tickHandler);
    this.profiler?.dispose();
    this.profiler = null;
    this.teardownDom();
  }

  /* ———————————————————— DOM ———————————————————— */

  private setDom(): void {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = PANEL_CSS;
      document.head.appendChild(style);
    }

    this.root = document.createElement('aside');
    this.root.dataset.debugPanel = '';

    // 状态/性能/玩家三行组（§5.2 表；数据缺席显示 —）
    const grid = document.createElement('dl');
    const row = (key: string, label: string): void => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = '—';
      this.values[key] = dd;
      grid.append(dt, dd);
    };
    row('state', 'state');
    row('driveView', 'drive-view');
    row('shot', 'shot'); // [CC-FXN-C3] View.shotId（?shot= 深链 / POI 进站前奏共用遥测）
    row('fps', 'fps avg/1%');
    row('draws', 'drawCalls');
    row('tris', 'triangles');
    // [CC-PERF-C2-B0] O10 分段帧时行（FrameProfiler，avg/max ms @0.25s 窗）：
    // frame = 全帧 c0→c999；各段按 tick order 段表（FrameProfiler 文件头）
    row('frame', 'frame ms');
    for (const seg of PROFILE_SEGMENTS) row(`seg:${seg}`, `· ${seg}`);
    row('speed', 'speed km/h');
    row('pos', 'pos x/y/z');

    // 事件尾巴：最近 10 条 `#seq t(ms) type {data}`，新在下
    this.tailList = document.createElement('ul');
    this.tailList.dataset.debugTail = '';

    // 导出（面板唯一交互控件，只读红线的机器断言面）
    const exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.dataset.debugExport = '';
    exportButton.textContent = 'EXPORT session JSON';
    exportButton.addEventListener('click', () => {
      this.exportDump();
    });

    // CAM F7 留位：机位读数 + shot JSON 导出在此容器内扩展（禁止第二块 overlay）
    const camSlot = document.createElement('div');
    camSlot.dataset.debugCam = '';

    this.root.append(grid, this.tailList, exportButton, camSlot);
    document.body.appendChild(this.root);
  }

  private teardownDom(): void {
    this.root?.remove();
    this.root = null;
    this.tailList = null;
    this.values = {};
    document.getElementById(STYLE_ID)?.remove();
  }

  /* ———————————————————— 刷新 ———————————————————— */

  private refresh(force = false): void {
    try {
      if (!this.root) return;
      if (!force) {
        this.clock += this.game.ticker.delta;
        if (this.clock < REFRESH_INTERVAL) return;
        this.clock = 0;
      }

      const game = this.game;
      const set = (key: string, text: string): void => {
        const el = this.values[key];
        if (el && el.textContent !== text) el.textContent = text;
      };

      // 状态行：host DOM 属性镜像（无 ritual / VEH 属性缺席时 —）；shot =
      // View.shotId 遥测（[CC-FXN-C3] 深链/进站前奏共用单源，无 shot 时 —）
      set('state', this.host?.getAttribute('data-world-state') ?? '—');
      set('driveView', this.host?.getAttribute('data-drive-view') ?? '—');
      set('shot', game.view.shotId ?? '—');

      // 性能行：FpsMeter.read()（样本不足 avg=0 显示 —）+ renderer.info
      const reading = this.fps.read();
      set('fps', reading.avg > 0 ? `${reading.avg.toFixed(0)} / ${reading.low1.toFixed(0)}` : '—');
      const info = game.rendering.renderer.info.render;
      set('draws', String(info.drawCalls));
      set('tris', String(info.triangles));

      // [CC-PERF-C2-B0] 分段帧时行：取一窗（≈0.25s）avg/max 并清零；
      // 窗口零帧（暂停）显示 —
      if (this.profiler) {
        const profile = this.profiler.take();
        const fmtSeg = (seg: SegmentReading): string =>
          profile.frames > 0 ? `${fmtMs(seg.avgMs)} / ${fmtMs(seg.maxMs)}` : '—';
        set('frame', fmtSeg(profile.total));
        for (const seg of profile.segments) set(`seg:${seg.name}`, fmtSeg(seg));
      }

      // 玩家行：速度 HUD 同公式（physics 档 forwardSpeed × Ticker.scale × 3.6）
      const vehicle = game.physicalVehicle;
      const scale = game.vehicleKind === 'physics' ? game.ticker.scale : 1;
      set('speed', vehicle ? String(Math.round(Math.abs(vehicle.forwardSpeed) * scale * 3.6)) : '—');
      const position = game.player?.position;
      set(
        'pos',
        position
          ? `${position.x.toFixed(1)} / ${position.y.toFixed(1)} / ${position.z.toFixed(1)}`
          : '—',
      );

      this.refreshTail();
    } catch (error) {
      this.warnOnce(error);
    }
  }

  private refreshTail(): void {
    if (!this.tailList) return;
    const tail = this.game.session.tail(TAIL_LIMIT);
    const lastSeq = tail.length > 0 ? tail[tail.length - 1].seq : 0;
    if (lastSeq === this.lastTailSeq) return; // 无新事件不重建列表
    this.lastTailSeq = lastSeq;

    this.tailList.replaceChildren(
      ...tail.map((entry: SessionEventEntry) => {
        const item = document.createElement('li');
        item.textContent =
          `#${entry.seq} ${entry.t}ms ${entry.type}` +
          (entry.data !== undefined ? ` ${JSON.stringify(entry.data)}` : '');
        return item;
      }),
    );
  }

  /* ———————————————————— 导出 ———————————————————— */

  /** [data-debug-export]：session.dump() → Blob 下载 session-<sessionId 前 8 位>.json */
  private exportDump(): void {
    try {
      const dump = this.game.session.dump();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `session-${dump.sessionId.slice(0, 8)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      this.warnOnce(error);
    }
  }

  private warnOnce(error: unknown): void {
    if (this.warned) return;
    this.warned = true;
    console.warn('[debug] 面板异常，静默降级（游戏路径零影响）', error);
  }
}
