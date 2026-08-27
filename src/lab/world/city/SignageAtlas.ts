// [CC-VIS-X3] 招牌叙事 v2 · 纹理图集合成器（TextCanvas 管线扩展：竖排/双语/图标合成）。
// 设计正本：cyber-city-visual-l8-design-confirm.md §4.2「多层招牌体系——TextCanvas
// 扩展竖排/双语/图标合成 + 纹理图集合并控 draw call」。
// 与 world/TextCanvas.ts 的关系：TextCanvas 是 folio 移植正本（行式横排，勿加扩展）；
// 本模块沿用其全部纹理约定（黑底白字 mask、采样只取 .r、SRGB、Nearest、flipY=false、
// generateMipmaps=false——WebGPU/WebGL 双后端一致的前提），在其外做自由排版：
//   · 双语：同一张图集同时容纳 EN 楼名行（楼顶主匾）与 zh 竖排列（楼身竖幅）；
//   · 竖排：中文楼名逐字纵向堆叠（港式挂旗阅读向，StreetLamps 旋转映射的原生版）；
//   · 图标合成：产品线符号图形（车轮廓/声波纹/语言气泡/智能中枢/方向盘）Canvas 2D
//     矢量笔画直绘进行内——零外部字体零图片资产（R8 资产纪律：全程序化 0 字节）。
// 每 hero 楼 1 张图集 = 楼顶主匾 + 街层灯箱 + 楼身竖幅三层共用 → 每楼灯箱/竖幅
// 合并几何后仍 1 draw call（BuildingSigns 台账），广告板 4 块共用另 1 张图集。
import * as THREE from 'three/webgpu';

/** 图集子图区域（采样空间归一坐标，v 向下 = flipY=false 的纹理内存序） */
export interface AtlasRegion {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  /** 子图像素宽高比（招牌网格 scale 换算用，TextCanvas.aspect 同语义） */
  aspect: number;
}

/** 产品线符号图形（design-confirm §4.2「车库=车轮廓、座舱=声波纹……」的执行位） */
export type SignIconKind = 'car' | 'wave' | 'lang' | 'agent' | 'radar';

export interface BuildingSignContent {
  /** 楼顶主匾：EN 楼名（buildings JSON title.en） */
  nameEn: string;
  /** 楼身竖幅：zh 楼名逐字竖排（buildings JSON title.zh） */
  nameZh: string;
  /** 街层灯箱：产品线名直写（V7「楼=产品线帧内自明」扣分点的销账正文） */
  productLine: string;
  icon: SignIconKind;
}

export interface BuildingSignAtlas {
  texture: THREE.Texture;
  /** 楼顶主匾行：图标 + EN 楼名 */
  roof: AtlasRegion;
  /** 街层灯箱行：图标 + 产品线名 */
  product: AtlasRegion;
  /** 楼身竖幅列：zh 楼名竖排 */
  banner: AtlasRegion;
}

/** EN 行字体栈（TextCanvas 默认等宽栈同源口径） */
const MONO_STACK = "ui-monospace, Menlo, Consolas, 'PingFang SC', monospace";
/** zh 竖排字体栈（CJK 优先，兜底回等宽——壳页系统字体同一现实） */
const CJK_STACK = "'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', ui-monospace, monospace";

/** 楼顶主匾行高 px（TextCanvas B1 楼名纹理 56/76 档的图标加宽版） */
const ROOF_ROW_H = 84;
const ROOF_FONT = 56;
/** 街层灯箱行高 px */
const PRODUCT_ROW_H = 68;
const PRODUCT_FONT = 42;
/** 楼身竖幅：字格边长 / 列宽 px */
const BANNER_CELL = 76;
const BANNER_COL_W = 92;
const BANNER_FONT = 58;
/** 行内图标与文字间距 px */
const ICON_GAP = 16;
/** 行左右留白 px */
const ROW_PAD = 22;

/** TextCanvas 同款纹理装配（约定单源见文件头；消费方负责 dispose） */
function makeMaskTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.Texture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * 产品线符号图形直绘（白色 mask 笔画，s = 图标外接方边长，中心 (cx, cy)）。
 * 五种图形对应五条产品线语义：car=车轮廓（配置器车库）、wave=声波纹（座舱语音）、
 * lang=语言气泡（多语种本地化）、agent=神经中枢节点（Master Agent）、
 * radar=方向盘（智驾实验）。
 */
export function drawSignIcon(
  ctx: CanvasRenderingContext2D,
  kind: SignIconKind,
  cx: number,
  cy: number,
  s: number,
): void {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (kind) {
    case 'car': {
      // 车身圆角矩形 + 座舱梯形 + 双轮（黑挖孔 + 白轮圈）——远读为侧视车剪影
      ctx.beginPath();
      ctx.roundRect(cx - 0.46 * s, cy - 0.04 * s, 0.92 * s, 0.28 * s, 0.07 * s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 0.26 * s, cy - 0.02 * s);
      ctx.lineTo(cx - 0.16 * s, cy - 0.24 * s);
      ctx.lineTo(cx + 0.16 * s, cy - 0.24 * s);
      ctx.lineTo(cx + 0.28 * s, cy - 0.02 * s);
      ctx.closePath();
      ctx.fill();
      for (const wx of [cx - 0.24 * s, cx + 0.24 * s]) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(wx, cy + 0.24 * s, 0.13 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 0.05 * s;
        ctx.beginPath();
        ctx.arc(wx, cy + 0.24 * s, 0.1 * s, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case 'wave': {
      // 发声点 + 三重递增圆弧（声波纹）
      ctx.beginPath();
      ctx.arc(cx - 0.32 * s, cy, 0.07 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 0.07 * s;
      for (const r of [0.2, 0.34, 0.48]) {
        ctx.beginPath();
        ctx.arc(cx - 0.32 * s, cy, r * s, -0.85, 0.85);
        ctx.stroke();
      }
      break;
    }
    case 'lang': {
      // 语言气泡（A / 文 双语字符入泡——双语管线自指）
      ctx.lineWidth = 0.06 * s;
      ctx.beginPath();
      ctx.roundRect(cx - 0.44 * s, cy - 0.36 * s, 0.88 * s, 0.56 * s, 0.12 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 0.16 * s, cy + 0.2 * s);
      ctx.lineTo(cx - 0.08 * s, cy + 0.42 * s);
      ctx.lineTo(cx + 0.06 * s, cy + 0.2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.font = `700 ${0.34 * s}px ${CJK_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', cx - 0.18 * s, cy - 0.07 * s);
      ctx.fillText('文', cx + 0.16 * s, cy - 0.07 * s);
      break;
    }
    case 'agent': {
      // 神经中枢：核心环 + 四向触梢节点
      ctx.lineWidth = 0.07 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 0.17 * s, 0, Math.PI * 2);
      ctx.stroke();
      for (const [dx, dy] of [
        [0.34, -0.34],
        [0.34, 0.34],
        [-0.34, 0.34],
        [-0.34, -0.34],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(cx + dx * 0.5 * s, cy + dy * 0.5 * s);
        ctx.lineTo(cx + dx * s, cy + dy * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, 0.08 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'radar': {
      // 方向盘：外圈 + 三辐 + 毂
      ctx.lineWidth = 0.08 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 0.42 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 0.06 * s;
      for (const angle of [Math.PI / 2, Math.PI * (7 / 6), Math.PI * (11 / 6)]) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 0.12 * s, cy + Math.sin(angle) * 0.12 * s);
        ctx.lineTo(cx + Math.cos(angle) * 0.4 * s, cy + Math.sin(angle) * 0.4 * s);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 0.1 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/** 行式绘制：图标 + 大写文字，返回行内容像素宽（图标 + 间距 + 文字 + 两侧留白） */
function drawIconRow(
  ctx: CanvasRenderingContext2D,
  content: { icon: SignIconKind; text: string; font: number; y: number; rowH: number },
): number {
  const { icon, text, font, y, rowH } = content;
  ctx.font = `700 ${font}px ${MONO_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(text).width;
  const iconSize = font * 1.06;
  const centerY = y + rowH / 2;
  drawSignIcon(ctx, icon, ROW_PAD + iconSize / 2, centerY, iconSize);
  ctx.font = `700 ${font}px ${MONO_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, ROW_PAD + iconSize + ICON_GAP, centerY);
  return ROW_PAD + iconSize + ICON_GAP + textW + ROW_PAD;
}

/** 行宽预量（布局先行，第二遍真绘——canvas 重设尺寸会清画布） */
function measureIconRow(ctx: CanvasRenderingContext2D, text: string, font: number): number {
  ctx.font = `700 ${font}px ${MONO_STACK}`;
  return ROW_PAD + font * 1.06 + ICON_GAP + ctx.measureText(text).width + ROW_PAD;
}

/**
 * 每 hero 楼一张招牌图集：
 *   ┌ roof（图标+EN 楼名，整宽首行）────────┐
 *   ├ product（图标+产品线名，左下行）┬ banner ┤
 *   └────────────────────────────────┴（zh 竖排）┘
 * 区域坐标输出为采样空间归一值（v 向下），BuildingSigns 直接编码进几何 uv。
 */
export function composeBuildingSignAtlas(content: BuildingSignContent): BuildingSignAtlas {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const roofText = content.nameEn.toUpperCase();
  const productText = content.productLine.toUpperCase();
  const roofW = Math.ceil(measureIconRow(ctx, roofText, ROOF_FONT));
  const productW = Math.ceil(measureIconRow(ctx, productText, PRODUCT_FONT));
  const bannerChars = [...content.nameZh];
  const bannerH = bannerChars.length * BANNER_CELL + 20;

  const width = Math.max(roofW, productW + BANNER_COL_W);
  const height = ROOF_ROW_H + Math.max(PRODUCT_ROW_H, bannerH);
  canvas.width = width;
  canvas.height = height;

  // 黑底白字 mask（TextCanvas 口径：材质采样只取 .r 通道）
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';

  // ① roof 行（整宽首行）
  drawIconRow(ctx, { icon: content.icon, text: roofText, font: ROOF_FONT, y: 0, rowH: ROOF_ROW_H });

  // ② product 行（左下）
  drawIconRow(ctx, {
    icon: content.icon,
    text: productText,
    font: PRODUCT_FONT,
    y: ROOF_ROW_H,
    rowH: PRODUCT_ROW_H,
  });

  // ③ banner 竖排列（右下）：逐字纵向堆叠 + 列顶菱形装饰（挂旗排版锚点）
  const colX = width - BANNER_COL_W / 2;
  ctx.font = `700 ${BANNER_FONT}px ${CJK_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  bannerChars.forEach((char, i) => {
    ctx.fillText(char, colX, ROOF_ROW_H + 10 + (i + 0.5) * BANNER_CELL);
  });

  const region = (x0: number, y0: number, x1: number, y1: number): AtlasRegion => ({
    u0: x0 / width,
    v0: y0 / height,
    u1: x1 / width,
    v1: y1 / height,
    aspect: (x1 - x0) / (y1 - y0),
  });

  return {
    texture: makeMaskTexture(canvas),
    roof: region(0, 0, roofW, ROOF_ROW_H),
    product: region(0, ROOF_ROW_H, productW, ROOF_ROW_H + PRODUCT_ROW_H),
    banner: region(width - BANNER_COL_W, ROOF_ROW_H, width, ROOF_ROW_H + bannerH),
  };
}

export interface AdBoardContent {
  /** 主标语（大字行） */
  headline: string;
  /** 副标语（小字行） */
  tagline: string;
  icon: SignIconKind;
}

/** 广告板行像素尺寸（板面 7×4m 级 → 1.75 宽高比） */
const AD_ROW_W = 448;
const AD_ROW_H = 256;

/**
 * 全息广告板图集：4 块共用 1 张（行等高纵向堆叠，StreetLamps SLOGANS atlas 同款
 * 组织），AdBoards 合并几何按行编码 uv → 全部广告板 1 draw call。
 */
export function composeAdBoardAtlas(ads: AdBoardContent[]): {
  texture: THREE.Texture;
  regions: AtlasRegion[];
} {
  const canvas = document.createElement('canvas');
  canvas.width = AD_ROW_W;
  canvas.height = AD_ROW_H * ads.length;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ads.forEach((ad, i) => {
    const top = i * AD_ROW_H;
    const iconSize = 96;
    drawSignIcon(ctx, ad.icon, 28 + iconSize / 2, top + AD_ROW_H / 2 - 18, iconSize);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 58px ${MONO_STACK}`;
    ctx.fillText(ad.headline.toUpperCase(), 28 + iconSize + 20, top + AD_ROW_H / 2 - 34);
    ctx.font = `500 30px ${MONO_STACK}`;
    ctx.fillText(ad.tagline.toUpperCase(), 28 + iconSize + 20, top + AD_ROW_H / 2 + 30);
    // 行内分隔细线（广告排版层次，StreetLamps 装饰线同手法）
    ctx.fillRect(28 + iconSize + 20, top + AD_ROW_H / 2 - 2, AD_ROW_W - iconSize - 96, 3);
  });

  const regions = ads.map((_, i) => ({
    u0: 0,
    v0: (i * AD_ROW_H) / canvas.height,
    u1: 1,
    v1: ((i + 1) * AD_ROW_H) / canvas.height,
    aspect: AD_ROW_W / AD_ROW_H,
  }));

  return { texture: makeMaskTexture(canvas), regions };
}
