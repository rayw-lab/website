// 统一 facade 控制器（SRD §9.2 懒加载契约 + §12.4 降级链）。
// 状态机：idle → observing → loading → ready | error；宿主以 data-state 暴露当前态供 CSS 使用。
//
// 自动挂载四项检查（§12.4）：视口+idle / reduced-motion / pointer / Save-Data。
// 任一不满足 → poster 常驻（data-blocked 标注原因，不发起任何 chunk 请求）；
// 用户显式点击启动按钮 = §12.4 流程图 POSTER -.-> 探测 的显式路径，跳过全部自动挡拦截。
//
// 本文件运行在浏览器端：只允许 `import type` 引入契约类型，禁止任何运行时依赖。
import type {
  LabBackend,
  LabFacadeHandle,
  LabFacadeState,
  LabInstance,
  LabModule,
  LabModuleEntry,
} from './contracts';

/** 模块入口懒加载映射（构建期展开为按 slug 分包的动态 import） */
const entryLoaders = import.meta.glob('./modules/*/index.ts') as Record<
  string,
  () => Promise<LabModuleEntry>
>;

const BACKEND_LABELS: Record<LabBackend, string> = {
  webgpu: 'WebGPU',
  webgl2: 'WebGL 2',
  canvas2d: 'Canvas 2D',
  dom: 'DOM',
};

interface FacadeHost extends HTMLElement {
  __labFacade?: LabFacadeHandle;
}

/** §9.5 统计事件契约：GoatCounter 就位前先以 CustomEvent 暴露，接入后自动上报 */
function emitAnalytics(name: string, slug: string): void {
  document.dispatchEvent(new CustomEvent('lab:analytics', { detail: { name, slug } }));
  const gc = (window as { goatcounter?: { count?: (o: object) => void } }).goatcounter;
  gc?.count?.({ path: name, event: true });
}

function whenIdle(cb: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => cb(), { timeout: 2000 });
  } else {
    // Safari 无 requestIdleCallback：退化为宏任务延迟
    setTimeout(cb, 200);
  }
}

/** 按 manifest.deepLinkParams 白名单过滤当前 URL query（§9.2 URL 状态契约） */
function filterDeepLinkParams(whitelist: string[]): URLSearchParams {
  const incoming = new URLSearchParams(location.search);
  const filtered = new URLSearchParams();
  for (const key of whitelist) {
    const value = incoming.get(key);
    if (value !== null) filtered.set(key, value);
  }
  return filtered;
}

export function initLabFacade(host: FacadeHost): LabFacadeHandle | null {
  if (host.__labFacade) return host.__labFacade;

  const configEl = host.querySelector<HTMLScriptElement>('script[data-lab-config]');
  if (!configEl?.textContent) {
    console.error('[lab/facade] 宿主缺少 data-lab-config manifest 数据');
    return null;
  }
  const module = JSON.parse(configEl.textContent) as LabModule;

  const stage = host.querySelector<HTMLElement>('[data-lab-stage]') ?? host;
  const startBtn = host.querySelector<HTMLButtonElement>('[data-lab-start]');
  const progressBar = host.querySelector<HTMLElement>('[data-lab-progress-bar]');
  const errorEl = host.querySelector<HTMLElement>('[data-lab-error]');
  const backendEl = host.querySelector<HTMLElement>('[data-lab-backend]');

  let state: LabFacadeState = 'idle';
  let instance: LabInstance | null = null;
  let loadPromise: Promise<void> | null = null;
  let pausedByVisibility = false;
  let pausedByViewport = false;

  const setState = (next: LabFacadeState) => {
    state = next;
    host.dataset.state = next;
  };

  // ---- 挂载后的暂停/恢复（§9.2：离屏 / visibilitychange=hidden 时 RAF 必须停） ----
  const syncPaused = () => {
    if (!instance) return;
    if (pausedByVisibility || pausedByViewport) instance.pause();
    else instance.resume();
  };
  const onVisibility = () => {
    pausedByVisibility = document.visibilityState === 'hidden';
    syncPaused();
  };
  const viewportObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) pausedByViewport = !e.isIntersecting;
      syncPaused();
    },
    { threshold: 0.02 },
  );

  // ---- 卸载（View Transitions 离页 / 显式 unmount）：必须释放 GPU 资源与事件监听 ----
  const disposeInstance = () => {
    if (!instance) return;
    try {
      instance.dispose();
    } catch (err) {
      console.error(`[lab/facade] ${module.slug} dispose 失败：`, err);
    }
    instance = null;
    viewportObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  };
  const onPageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) disposeInstance(); // bfcache 快照保留实例，真实离页才释放
  };
  window.addEventListener('pagehide', onPageHide);
  document.addEventListener('astro:before-swap', () => disposeInstance());

  // ---- 挂载 ----
  const mountModule = async (): Promise<void> => {
    setState('loading');
    if (progressBar) progressBar.style.width = '4%'; // chunk 拉取期的最小可见进度

    const loader = entryLoaders[`./${module.entry}`];
    if (!loader) throw new Error(`entry 未注册进 facade 分包映射：${module.entry}`);
    const entry = await loader();

    instance = await entry.default({
      host,
      mode: 'full',
      params: filterDeepLinkParams(module.deepLinkParams),
      onProgress: (loaded, total) => {
        if (progressBar) {
          const f = total > 0 ? loaded / total : 0;
          progressBar.style.width = `${Math.round(4 + f * 96)}%`;
        }
      },
      onBackend: (backend) => {
        if (backendEl) backendEl.textContent = BACKEND_LABELS[backend];
        if (backend === 'webgpu' || backend === 'webgl2') {
          emitAnalytics(`lab-backend:${backend}`, module.slug);
        }
      },
    });

    // ready：poster → 画布 400ms 交叉淡入（CSS 由 data-state 驱动），控制面解除 inert
    setState('ready');
    host.querySelectorAll<HTMLElement>('[data-lab-gated]').forEach((el) => {
      el.removeAttribute('inert');
    });
    emitAnalytics(`lab-mount:${module.slug}`, module.slug);

    document.addEventListener('visibilitychange', onVisibility);
    viewportObserver.observe(stage);
    onVisibility();
  };

  const start = (): Promise<void> => {
    if (loadPromise) return loadPromise;
    loadPromise = mountModule().catch((err: unknown) => {
      console.error(`[lab/facade] ${module.slug} mount 失败：`, err);
      setState('error'); // error 态：poster 常驻 + 错误文案（§9.2）
      if (errorEl) errorEl.hidden = false;
      emitAnalytics(`lab-error:${module.slug}`, module.slug);
    });
    return loadPromise;
  };

  // ---- 自动挂载四项检查（§12.4）；显式点击不经过本函数 ----
  const armAutoMount = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.dataset.blocked = 'reduced-motion';
      return;
    }
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData === true) {
      host.dataset.blocked = 'save-data';
      return;
    }
    if (
      module.capabilities.pointerFine &&
      !matchMedia('(pointer: fine)').matches &&
      window.innerWidth < 960
    ) {
      host.dataset.blocked = 'pointer';
      return;
    }

    // 条件 1：进入视口（rootMargin 200px）且 requestIdleCallback 已回调
    setState('observing');
    let inViewport = false;
    let idleDone = false;
    const tryAuto = () => {
      if (inViewport && idleDone && !loadPromise) void start();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          inViewport = true;
          tryAuto();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(stage);
    whenIdle(() => {
      idleDone = true;
      tryAuto();
    });
  };

  startBtn?.addEventListener('click', () => void start()); // 显式启动跳过全部自动挡拦截
  armAutoMount();

  const handle: LabFacadeHandle = {
    get state() {
      return state;
    },
    get instance() {
      return instance;
    },
    start,
    unmount() {
      disposeInstance();
      loadPromise = null;
      if (progressBar) progressBar.style.width = '0%';
      if (errorEl) errorEl.hidden = true;
      host.querySelectorAll<HTMLElement>('[data-lab-gated]').forEach((el) => {
        el.setAttribute('inert', '');
      });
      setState('idle');
    },
  };
  host.__labFacade = handle;
  return handle;
}

/** 页面入口：初始化当前文档内的全部 Lab 宿主（每页至多 1 个模块，§12.6 配额） */
export function initAllLabFacades(): void {
  document.querySelectorAll<HTMLElement>('[data-lab-host]').forEach((el) => {
    initLabFacade(el as FacadeHost);
  });
}
