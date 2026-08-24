// JSON-LD 构建器（SRD §9.4 / master-plan §8.2）。
// 注入点：BaseLayout 尾部单个 <script type="application/ld+json">——
// 全站 Person + WebSite 由布局自动拼装，页型增量（Article / ProfilePage /
// BreadcrumbList）由页面经 jsonLd prop 传入。数据一律派生自 frontmatter
// 与 src/data/site.ts 常量（AP-8），禁止手工维护第二份。
import { PERSON, SITE_NAME } from './site';

export type JsonLd = Record<string, unknown>;

/** 全站 Person（SRD §9.4 Person 常量行） */
export function personJsonLd(homeUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON.name,
    jobTitle: PERSON.jobTitle,
    url: homeUrl,
    knowsAbout: [...PERSON.knowsAbout],
    sameAs: [...PERSON.sameAs],
  };
}

/** 全站 WebSite */
export function webSiteJsonLd(homeUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: homeUrl,
    inLanguage: 'zh-CN',
  };
}

/** About → ProfilePage（mainEntity → Person，master-plan §8.2） */
export function profilePageJsonLd(homeUrl: string, aboutUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: aboutUrl,
    inLanguage: 'zh-CN',
    mainEntity: personJsonLd(homeUrl),
  };
}

/** 全部内容页附 BreadcrumbList（首页 → 栏目 → 当前页） */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ArticleJsonLdInput {
  /** work → 'TechArticle'；insights / ai-lab → 'BlogPosting'（SRD §9.4） */
  type: 'TechArticle' | 'BlogPosting';
  headline: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified?: Date;
  keywords?: readonly string[];
  homeUrl: string;
}

/** 文章页 Article（数据源 = content collections frontmatter，由 Article/CaseLayout 消费） */
export function articleJsonLd(input: ArticleJsonLdInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': input.type,
    headline: input.headline,
    description: input.description,
    url: input.url,
    inLanguage: 'zh-CN',
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    ...(input.keywords?.length ? { keywords: input.keywords.join(',') } : {}),
    author: personJsonLd(input.homeUrl),
  };
}
