// 顶栏链接类型：SiteHeader 默认全站五栏目；工具页可经 BaseLayout.headerLinks 替换。
export interface HeaderLink {
  href: string;
  label: string;
  /** 悬停提示（快捷入口写清带入的选择） */
  title?: string;
  /** 'button' = 描边按钮样式（如「使用说明」） */
  kind?: 'button';
}
