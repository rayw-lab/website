// 站点常量单点维护（SRD §9.4「Person 常量」+ AP-8 单一事实源）。
// 全部 SEO / JSON-LD / 统计 / 联系渠道的站点级事实只允许写在这里，
// 布局与页面一律 import 消费，禁止在别处复制第二份。

/** 站点名（og:site_name / WebSite.name / 讲者简介署名） */
export const SITE_NAME = '王磊｜汽车智能座舱与 AI 解决方案';

/** 标题体系后缀（master-plan §8.1：{页面标题}｜王磊 - 汽车智能座舱与 AI 解决方案） */
export const TITLE_SUFFIX = '｜王磊 - 汽车智能座舱与 AI 解决方案';

/** Person 常量（SRD §9.4 表）：name / jobTitle / knowsAbout / sameAs */
export const PERSON = {
  name: '王磊',
  jobTitle: '汽车智能座舱与 AI 解决方案经理',
  knowsAbout: ['智能座舱', '多语种本地化', '端云大模型', 'AI 工作流'],
  /**
   * 已验证的公开档案。LinkedIn 与公众号入口待王磊提供正式 URL 后追加
   * （SRD §9.4 要求三者齐备；未验证的链接不允许先行入库）。
   */
  sameAs: ['https://github.com/rayw-lab'],
} as const;

/**
 * 联系邮箱（防爬拆分存放，Contact 页由 JS 组装渲染——PRD ABT-04「邮箱防爬混淆渲染」）。
 * 单点维护：上线前若王磊更换正式邮箱，只改这两个字段。
 */
export const CONTACT_EMAIL = { user: 'rayw.lab', domain: 'gmail.com' } as const;

/** Contact 页回复时限承诺（工作日，PRD ABT-04） */
export const REPLY_SLA_DAYS = 5;

/**
 * GoatCounter 计数端点（SRD §5.5 / §9.5：独立子域，无 Cookie、无横幅）。
 * count.js 自带 localhost 不上报守卫；脚本仅在生产构建注入（BaseLayout）。
 */
export const GOATCOUNTER_ENDPOINT = 'https://rayw-lab.goatcounter.com/count';

/** Now.openTo 枚举 → 中文标签（与 Contact 四交流方向一一对应，mvp-checklist §5.1） */
export const OPEN_TO_LABELS: Record<string, string> = {
  'tech-exchange': '技术交流',
  collaboration: '合作机会',
  'speaking-writing': '演讲与写作',
  career: '职业机会',
};
