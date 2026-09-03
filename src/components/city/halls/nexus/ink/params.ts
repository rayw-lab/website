/**
 * 墨迹厅 · LOCKED 参数
 *
 * 🔴 证据等级：
 *  [源码] = 从 inkwash `index.html` 实读（refs/nexus-hall/inkwash/repo/）
 *  [推导] = 本厅紫墨要求自行推导（见 shaders.ts ADVECT_INK_FS 注释）
 *  [待验] = W1 spike 帧率/体积实测后回填，**现在不是既定事实**
 */

export interface InkParams {
  paper: readonly [number, number, number];
  absorb: readonly [number, number, number];
  chroma: readonly [number, number, number];
  strength: number;
  edge: number;
  grain: number;
  vignette: number;
  bleed: number;
  spread: number;
  /** 干燥时间常数（秒）：湿度衰减 exp(-dt / dryTau) */
  dryTau: number;
  dissipation: number;
  /** 纸纤维对迁移率的调制强度 0–1；0 = 各向同性（出圆），锚点门 A2 靠它 */
  fibre: number;
  /** 迁移率响应窗口下界：湿度低于它墨完全不动 */
  mobLo: number;
  /** 上界：湿度高于它迁移率饱和。窗口太窄 → 参数长期无效（W1b 实证） */
  mobHi: number;
  curlAmount: number;
  pressureIterations: number;
  /** 速度/压力场短边格数 */
  simResolution: number;
  /** 墨/湿度场短边上限 */
  dyeResolution: number;
  /** 无交互多少秒后停转 */
  idleSeconds: number;
}

/** #efe9dc 暖白宣纸（磊哥拍板基调 A） */
const PAPER = [0.937, 0.914, 0.863] as const;

/**
 * 紫墨吸收谱 [推导]。
 * 近中性、G 略高：保证浓处三通道齐吸 → 趋黑（锚点门 A4 仍要求 ≥0.06 不死黑）。
 * 对照：inkwash 近黑墨为 [1.00, 0.97, 0.88] [源码 index.html:225]。
 */
const ABSORB = [0.88, 1.12, 0.82] as const;

/**
 * 色谱分离速率 [推导]。G 最大 = 绿通道 bleed 最快 = 外晕吸绿光 = 透射泛紫。
 * 反直觉但推导见 shaders.ts；W1 spike 出图后按锚点门 A5（色相差 ≥15°）回调。
 */
const CHROMA = [0.72, 1.4, 0.52] as const;

export const DESKTOP: InkParams = {
  paper: PAPER,
  absorb: ABSORB,
  chroma: CHROMA,
  strength: 2.1, // [待验] agy 建议 2.1，inkwash 默认 1.9 [源码]
  edge: 1.35, // [待验] 锚点门 A1 边缘沉积 ≥1.15× 由它决定
  grain: 0.35,
  vignette: 0.16, // [源码]
  bleed: 0.5, // [源码 index.html:217 P.BLEED]
  spread: 0.1, // [待验] inkwash 0.12 [源码]
  dryTau: 6.0, // [待验] 展厅阅读节奏，非 inkwash 原值
  dissipation: 0.985,
  fibre: 0.62, // [实测] 0.85 过强会吃掉外围淡紫晕；W1b 网格定
  mobLo: 0.02,
  mobHi: 0.85, // [实测] 0.45 太低：clamp 后湿度核心仍长期 >0.45 → 饱和无响应
  curlAmount: 26.0, // [实测] 12 太弱，涡量放大不出毛刺；A2 与它一同决定
  pressureIterations: 22, // [源码 index.html:222] —— agy 报 16 有误，以源码为准
  simResolution: 256, // [源码 index.html:219]
  dyeResolution: 1280, // [待验] 草案给 1024、inkwash 给 min(2048,短边)；取中并由帧率定
  idleSeconds: 12,
};

export const MOBILE: InkParams = {
  ...DESKTOP,
  pressureIterations: 14,
  simResolution: 160,
  dyeResolution: 768,
  curlAmount: 22.0,
  fibre: 0.6,
};

export function pickParams(isMobile: boolean): InkParams {
  return isMobile ? MOBILE : DESKTOP;
}
