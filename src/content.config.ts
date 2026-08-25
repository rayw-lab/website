// Content Collections schema —— 内容结构唯一事实源（SRD §8.1 完整定义，AP-8）。
// 四集合：work / insights / ai-lab / now。lab Demo 注册表不在此维护——
// manifest 经 src/lab/manifest.ts 以 contracts.ts 的 labModuleSchema 校验（AP-3 解耦，SRD §8.2）。
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/* ---------- 公共枚举与片段 ---------- */

/** 三支柱（master-plan 1.3），全站统一口径 */
const pillarEnum = z.enum(['cockpit-i18n', 'edge-cloud-llm', 'ai-workflow']);

/** 证据等级（master-plan 附录 B） */
const evidenceEnum = z.enum(['L1', 'L2', 'L3', 'L4']);

/** 保密分级（material-security-grading）：只有 P2 允许出现在仓库内容目录 */
const securityGate = z.object({
  /** 素材分级判定结果；schema 层面锁死为 'P2'——P0/P1 内容根本不允许入库 */
  securityGrade: z.literal('P2'),
  /** 发布前检查表（分级体系 5.3 节）已逐项通过；false/缺失即构建失败 */
  sanitizationChecked: z.literal(true),
});

/** 所有可发布内容的公共字段 */
const publishable = z.object({
  title: z.string().min(4).max(60),
  /** 每页手写 meta description（master-plan 8.1），兼作列表页摘要 */
  description: z.string().min(20).max(160),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  /** 人工精选进入首页区块 4（master-plan 3 区块 4：featured 驱动，非最新自动列表） */
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  /** SEO keywords → JSON-LD keywords 字段 */
  keywords: z.array(z.string()).max(8).default([]),
  /** 自定义 OG 图（可选；缺省用构建期生成或站点默认图） */
  ogImage: z.string().optional(),
});

/* ---------- work：案例（master-plan 第 4 章） ---------- */

const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: publishable.merge(securityGate).extend({
    /** 首页案例卡三行结构（区块 3），各一句话 */
    problem: z.string().max(80),
    action: z.string().max(80),
    result: z.string().max(80),
    pillar: pillarEnum,
    /** 案例整体证据等级（结果模块内部还可逐条标注） */
    evidenceLevel: evidenceEnum,
    /**
     * 本篇实际包含的 12 模块编号（master-plan 4.1 canonical；可按敏感度裁剪但顺序不变）。
     * 旗舰完整版 = 1..12；精简版最小集 = [1,2,6,9,10]（MVP 对案例 B/C 的要求）
     */
    modules: z.array(z.number().int().min(1).max(12)).min(5),
    /** 旗舰标识：'A' | 'B' | 'C'，非旗舰缺省 */
    flagship: z.enum(['A', 'B', 'C']).optional(),
    /** 证据链：关联 Lab Demo（以 manifest slug 引用，AP-3 声明式耦合） */
    demo: z.string().regex(/^[a-z0-9-]+$/).optional(),
    /** 站内网（模块 12）：关联洞见/实验记录 */
    related: z.array(z.union([reference('insights'), reference('ai-lab')])).default([]),
  }),
});

/* ---------- insights：洞见（master-plan 5.1） ---------- */

const insights = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/insights' }),
  schema: publishable.merge(securityGate).extend({
    category: z.enum(['industry-judgment', 'methodology', 'retrospective']),
    /**
     * 一句话论点（首页区块 4 与索引页展示的是「结论」而非摘要）。
     * v1.1.1（审计 P0-3 裁决）：每篇必填——PRD INS-03 为 P0 验收项
     * （schema 校验缺失即构建失败），INS-01 要求索引页每篇显示一句话结论。
     */
    thesis: z.string().max(60),
    pillar: pillarEnum.optional(),
    related: z.array(z.union([reference('work'), reference('ai-lab')])).default([]),
  }),
});

/* ---------- ai-lab：AI 工作流实验记录（master-plan 5.2） ---------- */

const aiLab = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/ai-lab' }),
  schema: publishable.merge(securityGate).extend({
    /** 按工作阶段分类（核心原则：不按工具分类） */
    stage: z.enum([
      'requirements-planning',
      'design-development',
      'test-delivery',
      'ops-retrospective',
    ]),
    /** 场景一句话（该阶段中的具体工作场景） */
    scenario: z.string().max(80),
    /** 前后对比（每篇必须有，master-plan 5.2）：时间/质量维度的模糊化量化 */
    comparison: z.object({
      before: z.string().max(80),
      after: z.string().max(80),
      metric: z.string().max(40), // 如 "耗时 -40%（约数）"
    }),
    /** 是否附可复用模板/提示词（正文含下载或代码块） */
    hasTemplate: z.boolean().default(false),
    /** 局限与失败记录为必填叙事段——以布尔声明存在性，CI 抽查正文含「局限」章节 */
    hasLimitations: z.literal(true),
    evidenceLevel: evidenceEnum,
    /** 关联可运行 Demo（Lab manifest slug） */
    demo: z.string().regex(/^[a-z0-9-]+$/).optional(),
    related: z.array(z.union([reference('work'), reference('insights')])).default([]),
  }),
});

/* ---------- now：近况条目（master-plan 2.2 / 3 区块 5） ---------- */

const now = defineCollection({
  loader: file('./src/content/now/entries.json'),
  schema: z.object({
    id: z.string(), // 形如 "2026-08"
    updated: z.coerce.date(),
    researching: z.array(z.string().max(60)).min(1).max(3),
    writing: z.array(z.string().max(60)).max(3).default([]),
    openTo: z
      .array(z.enum(['tech-exchange', 'collaboration', 'speaking-writing', 'career']))
      .default([]),
    note: z.string().max(200).optional(),
  }),
});

export const collections = { work, insights, 'ai-lab': aiLab, now };
