/**
 * LAB RA-01 · Noto 子集 @font-face —— 演示 mount() 时注入，不进页面 <head>。
 *
 * 四个子集合计 ~320KB；若随页面加载，控制面里的原生语名（阿/希/泰/天城文）
 * 一渲染就触发下载，在 Lighthouse 移动端模拟中被计入 FCP/LCP 悲观依赖图，
 * Performance 掉破 0.95 门槛（MVP Gate）。注入前原生语名与字幕走系统字体回退，
 * 注入后 unicode-range 命中的文字自动换用 Noto（font-display: swap）。
 */

const RAW_BASE = import.meta.env.BASE_URL as string;
const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : RAW_BASE + '/';

const FACES: Array<{ family: string; file: string; range: string }> = [
  {
    family: 'Noto Sans Arabic',
    file: 'noto-sans-arabic-var.woff2',
    range:
      'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC',
  },
  {
    family: 'Noto Sans Hebrew',
    file: 'noto-sans-hebrew-var.woff2',
    range: 'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
  },
  {
    family: 'Noto Sans Thai',
    file: 'noto-sans-thai-var.woff2',
    range: 'U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC',
  },
  {
    family: 'Noto Sans Devanagari',
    file: 'noto-sans-devanagari-var.woff2',
    range:
      'U+0900-097F, U+1CD0-1CF9, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
  },
];

const STYLE_ID = 'ttsc-noto-fonts';

/** 幂等：重复 mount（facade 重试等）只注入一次。 */
export function injectNotoFonts(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = FACES.map(
    (f) =>
      `@font-face{font-family:'${f.family}';font-style:normal;font-weight:400 700;` +
      `font-display:swap;src:url('${BASE}fonts/${f.file}') format('woff2');unicode-range:${f.range};}`
  ).join('\n');
  document.head.append(style);
}
