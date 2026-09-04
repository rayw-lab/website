// CC-FXN-C4：ExploreProgress —— 探索计数 n/12 轻目标 chip（功能 rubric F6
// 「目标/进度」维的最小可见形态，FXN-BR G5 巡访护照的先遣版）。
// 语义：12 个 POI 触发圈 = 12 个探索点；首次驶入某楼触发圈（Areas boundingIn）
// 即「发现」该点，chip 计数 +1；集齐全部探索点给完成态呈现。**非强制**：纯展示
// 层零输入劫持、零楼锁定——无视它一切照常（rubric F6「阻断自由探索按本维扣分」）。
// 持久化：localStorage 跨会话累计（G5 红线：不可用时静默降级为会话内计数，
// 不报错不弹窗）；进度还原/递增/集齐三个节点各有白名单事件（观测规格 §3.4
// goal 族，[CC-FXN-C4] 随行加法）：
//   explore-restore {n, total}      挂载时还原到非零进度
//   explore-progress {id, n, total} 首次发现某探索点
//   explore-complete {total}        全部集齐（跨会话至多一次：只在跨越沿触发）
//
// 纪律红线（DriveFeedback 同款）：
//   · ritual_idle 恒等：host[data-world-state] 为 robot_idle / transforming 时
//     整层 display:none（样式门；非 ritual 路径无该属性 = 恒放行，FB-06 同构）。
//     注：chip 是常驻进度指示件（F6「可见可选目标」本体），不适用瞬时反馈件的
//     「零事件时隐藏」待机纪律——待机可见性即功能面，恒等门只管 poster 两态；
//   · CITY-03 循环动画配额：递增 pop 为一次性事件驱动动画，零 infinite 关键帧；
//   · reduced-motion：pop/过渡压 0.01ms（进度数字是操作性信息，不因偏好剥夺）；
//   · 样式内联注入（Reveal.injectStyles 先例），壳静态段零字节、LHCI 零影响；
//   · pointer-events:none 全层穿透，不遮 CTA/HUD/摇杆热区（左上角与 HUD 底栏/
//     反馈层顶部堆叠/debug 右上面板天然错开）。
import type { Game } from '../core/Game';

/** 跨会话进度存储键（值 = 已发现 building id 的 JSON 数组；破坏性变更换 v2） */
const STORAGE_KEY = 'world-explore-v1';

export class ExploreProgress {
  private readonly game: Game;
  private readonly total: number;
  /** 在册探索点白名单（POI 注册表 building id）：过滤 storage 陈旧/伪造条目 */
  private readonly validIds: ReadonlySet<string>;
  private readonly found = new Set<string>();

  /** [NX-W17] 已到过的楼（持久集快照，合法 id）——QuestLine 回城种子消费 */
  foundIds(): string[] {
    return [...this.found];
  }

  private root!: HTMLElement;
  private label!: HTMLElement;
  private count!: HTMLElement;
  private disposed = false;

  constructor(game: Game, options: { poiIds: readonly string[] }) {
    this.game = game;
    this.validIds = new Set(options.poiIds);
    this.total = this.validIds.size;

    for (const id of this.readStore()) if (this.validIds.has(id)) this.found.add(id);

    this.setDom(game.domElement);
    this.render(false);

    if (this.found.size > 0) {
      game.session.log('explore-restore', { n: this.found.size, total: this.total });
      console.info(
        `[explore] 跨会话进度还原：${this.found.size}/${this.total}（localStorage ${STORAGE_KEY}）`,
      );
    }
  }

  /** 首次发现某探索点（Areas boundingIn 接线）：去重 → 持久化 → 呈现 + 埋点 */
  discover(id: string): void {
    if (this.disposed || this.found.has(id) || !this.validIds.has(id)) return;
    this.found.add(id);
    this.writeStore();

    const n = this.found.size;
    this.game.session.log('explore-progress', { id, n, total: this.total });
    this.render(true);
    if (n === this.total) {
      this.game.session.log('explore-complete', { total: this.total });
      console.info(`[explore] 全城探索完成 ${n}/${this.total} 🏁`);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.root.remove();
  }

  /* ———————————————————— 内部 ———————————————————— */

  private render(pop: boolean): void {
    const n = this.found.size;
    const complete = this.total > 0 && n === this.total;
    this.count.textContent = `${n}/${this.total}`;
    this.label.textContent = complete ? '探索完成' : '探索';
    if (complete) this.root.dataset.complete = '1';
    if (pop) {
      // 一次性 pop 重触发（DriveFeedback 同款：remove → reflow → add，播完即静止）
      this.root.classList.remove('is-pop');
      void this.root.offsetWidth;
      this.root.classList.add('is-pop');
    }
  }

  /** 还原（隐私模式/配额溢出等一律静默降级为会话内计数，G5 红线） */
  private readStore(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  private writeStore(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.found]));
    } catch {
      /* 静默降级为会话内计数 */
    }
  }

  private setDom(stage: HTMLElement): void {
    this.injectStyles();

    this.root = document.createElement('div');
    this.root.className = 'world-explore';
    this.root.dataset.worldExplore = '';
    this.root.setAttribute('aria-hidden', 'true');

    this.label = document.createElement('span');
    this.label.className = 'world-explore-label';

    this.count = document.createElement('span');
    this.count.className = 'world-explore-count';
    this.count.dataset.worldExploreCount = '';

    this.root.append(this.label, this.count);
    stage.appendChild(this.root);
  }

  private injectStyles(): void {
    const styleId = 'world-explore-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    // 霓虹胶囊语汇对齐反馈层（青主轴；完成态转琥珀金以示达成）；全层穿透不接管指针
    style.textContent = `
.world-explore{position:absolute;top:1rem;left:1.15rem;z-index:5;display:flex;align-items:baseline;gap:.5em;pointer-events:none;font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Noto Sans CJK SC',sans-serif;color:#eafffb;background:rgba(8,13,19,.78);border:1px solid rgba(73,197,182,.55);border-radius:999px;padding:.42em 1.1em;text-shadow:0 0 8px rgba(73,197,182,.55);box-shadow:0 0 14px rgba(73,197,182,.22)}
[data-world-state='robot_idle'] .world-explore,[data-world-state='transforming'] .world-explore{display:none!important}
.world-explore-label{font-size:.78rem;letter-spacing:.18em}
.world-explore-count{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.95rem;font-weight:650;letter-spacing:.06em}
.world-explore[data-complete='1']{color:#fff3dc;border-color:rgba(255,196,84,.75);text-shadow:0 0 10px rgba(255,196,84,.75);box-shadow:0 0 18px rgba(255,196,84,.32)}
.world-explore.is-pop{animation:world-explore-pop .45s ease}
@keyframes world-explore-pop{0%{transform:scale(.86);opacity:.4}60%{transform:scale(1.08)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.world-explore.is-pop{animation-duration:.01ms}}
`;
    document.head.appendChild(style);
  }
}
