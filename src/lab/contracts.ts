// Lab 子系统契约（SRD §8.2 manifest schema + §9.2 facade 协议）。
// 本文件同时被构建期（manifest.ts 校验）与运行期（模块/facade 以 import type 引用）消费：
// 客户端代码必须只用 `import type`，保证 zod 不进入任何浏览器 chunk。
import { z } from 'astro/zod';

/** 资源预算分级（gzip / 磁盘）——超级需在 PR 中专项审批（SRD §8.2） */
export const budgetClassEnum = z.enum(['S', 'M', 'L', 'world']);
// S：懒加载 JS ≤ 50KB gzip，资产 ≤ 1MB   —— 数据可视化 / SVG HMI 类
// M：懒加载 JS ≤ 300KB gzip，资产 ≤ 6MB  —— WebGPU 3D 类
// L：超出 M —— 默认拒绝，引入需修订 SRD 并评审
// world：仅限 slug='world' 的单例模块（SRD §12.7.2）

export const labModuleSchema = z.object({
  /** 路由 slug：/lab/{slug}/，全小写短横线（C-5：一经发布永不变更） */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** LAB 编号（页面页眉展示），格式 R[A-Z]-\d{2}，如 RA-01 / RB-01 */
  code: z.string().regex(/^R[A-Z]-\d{2}$/),
  title: z.string().max(40),
  description: z.string().max(160),
  status: z.enum(['live', 'wip', 'archived']),
  /** 模块类别（决定 LabLayout 的默认壳与审计规则） */
  kind: z.enum(['webgpu-3d', 'audio-viz', 'svg-hmi', 'data-viz', 'world']),
  /** 动态 import 入口，相对 src/lab/；必须默认导出 mount()（§9.2 契约） */
  entry: z.string(),
  /** facade 海报（public/ 相对路径）；无 JS / 降级态的视觉底座 */
  poster: z.string(),
  budgetClass: budgetClassEnum,
  /** 实测预算数字（构建审计脚本据此校验，超 10% 即 CI 告警） */
  budget: z.object({
    lazyJsKbGzip: z.number().positive(),
    assetsMb: z.number().nonnegative(),
    /**
     * 流式豁免（SRD §10.1 预算表注*）：assetsMb 计入语料全量，但运行时按需
     * 单文件流式拉取，不构成一次性加载。豁免不是自动放行——audit-budget 实测
     * public/{dir} 内每个文件都 ≤ singleFetchKbMax 时才成立，否则照常按
     * 预算级上限阻断。
     */
    streaming: z
      .object({
        /** 流式语料目录（public/ 相对路径） */
        dir: z.string(),
        /** 单次拉取（单文件）体积上限，KB */
        singleFetchKbMax: z.number().positive(),
      })
      .optional(),
  }),
  /** 能力需求声明（facade 据此决定探测与降级链） */
  capabilities: z.object({
    webgpu: z.enum(['preferred', 'unused']).default('unused'),
    webgl2: z.enum(['fallback', 'required', 'unused']).default('unused'),
    audio: z.boolean().default(false),
    pointerFine: z.boolean().default(false), // true = 移动端默认不自动挂载
  }),
  /** 深链参数白名单（URL 状态契约，§9.2）；不在此表的 query 参数一律忽略 */
  deepLinkParams: z.array(z.string()).default([]),
  /** View Transitions 跨页 morph 名（§9.3 注册表，全站唯一） */
  viewTransitionName: z.string().regex(/^(demo|world)-[a-z0-9-]+$/),
  /** 首页/索引卡片角标（工程外显） */
  techChips: z.array(z.string().max(16)).max(6),
  /** 证据链反向引用：作为哪些案例/文章的 L2 展项 */
  relatedWork: z.array(z.string()).default([]),
  relatedArticles: z.array(z.string()).default([]),
});

export type LabModule = z.infer<typeof labModuleSchema>;
export type LabBudgetClass = z.infer<typeof budgetClassEnum>;

// ---------------------------------------------------------------------------
// mount() 契约（SRD §9.2）——每个 lab/modules/{slug}/index.ts 必须默认导出 mount()

/** 展示模式：full = Lab 页全功能；viewer = Hero/嵌入精简态；world = 世界消费态（§12.5） */
export type LabMode = 'full' | 'viewer' | 'world';

/** 实际渲染后端（§9.2 onBackend 回调 / §9.5 lab-backend 事件） */
export type LabBackend = 'webgpu' | 'webgl2' | 'canvas2d' | 'dom';

export interface LabMountOptions {
  /** 舞台容器（含 canvas 或由模块自建 DOM）；模块只允许查询该子树 */
  host: HTMLElement;
  mode: LabMode;
  /** 已按 manifest.deepLinkParams 白名单过滤 */
  params: URLSearchParams;
  /** 驱动 facade 进度条 */
  onProgress?(loaded: number, total: number): void;
  /** 实时后端徽章 */
  onBackend?(backend: LabBackend): void;
}

export interface LabInstance {
  /** 离屏 / visibilitychange=hidden 时由 facade 调用（RAF 必须停） */
  pause(): void;
  resume(): void;
  /** View Transitions 离页 / 显式 unmount 时调用；必须释放 GPU 资源与事件监听 */
  dispose(): void;
  /** 深链参数运行时热更（如 ?paint=） */
  setParam?(key: string, value: string): void;
}

export type LabMount = (opts: LabMountOptions) => Promise<LabInstance>;

/** 动态 import 的模块入口形状（facade 侧校验默认导出存在） */
export interface LabModuleEntry {
  default: LabMount;
}

// ---------------------------------------------------------------------------
// facade 状态机（SRD §9.2）

/** 宿主元素以 data-state 暴露当前态供 CSS 使用 */
export type LabFacadeState = 'idle' | 'observing' | 'loading' | 'ready' | 'error';

/** 自动挂载被拦下的原因（§12.4 挂载条件四项检查；宿主以 data-blocked 暴露） */
export type LabFacadeBlockReason = 'reduced-motion' | 'pointer' | 'save-data';

/** facade 控制器句柄：显式启动（=点击启动按钮）与显式卸载（回 poster 态） */
export interface LabFacadeHandle {
  readonly state: LabFacadeState;
  readonly instance: LabInstance | null;
  /** 显式启动：跳过视口/idle 等待与自动挂载拦截（§12.4 POSTER -.-> 点击启动路径） */
  start(): Promise<void>;
  /** 卸载模块（dispose 实例、回 idle/poster 态）；幂等 */
  unmount(): void;
}
