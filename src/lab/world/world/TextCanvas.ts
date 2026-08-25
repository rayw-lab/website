// 移植自 folio-2025 sources/Game/TextCanvas.js（112 行，MIT，vendor/README.md
// 记录 commit 41046b5）。Canvas 2D 文字 → THREE.Texture：世界内招牌/POI 标签/
// 提示文字的纹理源（CC-E9 首个消费方 = areas/InteractivePoints 的楼名标签）。
// 改动（其余零改）：
//   · 位置参数 → options 对象（TS 人体工学；默认字体从 Comic Sans 换站点等宽栈）；
//   · width 可缺省 = 自动量宽（updateText 后按最长行 + padding 重设 canvas 并重建
//     context 状态——folio 需调用方先手工 measureText，见 InteractivePoints.js L228）；
//   · padding 左右非对称（folio 标签给键位图标留 60px 左空隙的语义参数化）；
//   · 砍调试用 fixed 定位 DOM 挂载残留；补 dispose()（纹理释放归属消费方）。
// flipY=false 原样保留：采样侧按 folio 键位图标同款 v.oneMinus() 翻转（WebGPU/WebGL
// 双后端行为一致的前提，勿在此处改回 true）。
import * as THREE from 'three/webgpu';

export interface TextCanvasOptions {
  /** CSS font-family 栈（canvas font 简写接受逗号列表） */
  fontFamily?: string;
  fontWeight?: string;
  /** 字号 px（乘 density 后落 canvas） */
  fontSize?: number;
  /** 画布宽 px；缺省 = updateText 时按最长行自动量宽 */
  width?: number | null;
  /** 画布高 px（多行时应 ≥ lines × lineHeight） */
  height?: number;
  /** 像素密度倍率 */
  density?: number;
  horizontalAlign?: 'center' | 'left' | 'right';
  /** 行距 px（乘 density） */
  lineHeight?: number;
  /** 文字与画布左/右边缘留白 px（乘 density）；自动量宽时计入总宽 */
  paddingLeft?: number;
  paddingRight?: number;
}

export class TextCanvas {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.Texture;

  private context!: CanvasRenderingContext2D;
  private lines: string[] = [];
  private readonly font: string;
  private readonly autoWidth: boolean;
  private readonly horizontalAlign: 'center' | 'left' | 'right';
  private readonly lineHeight: number;
  private readonly paddingLeft: number;
  private readonly paddingRight: number;
  private width: number;
  private height: number;

  constructor(options: TextCanvasOptions = {}) {
    const fontFamily = options.fontFamily ?? "ui-monospace, Menlo, Consolas, 'PingFang SC', monospace";
    const fontWeight = options.fontWeight ?? '400';
    const fontSize = options.fontSize ?? 10;
    const density = options.density ?? 1;

    this.font = `${fontWeight} ${fontSize * density}px ${fontFamily}`;
    this.autoWidth = options.width == null;
    this.width = Math.ceil((options.width ?? 2) * density);
    this.height = Math.ceil((options.height ?? fontSize * 1.5) * density);
    this.horizontalAlign = options.horizontalAlign ?? 'center';
    this.lineHeight = (options.lineHeight ?? fontSize * 1.2) * density;
    this.paddingLeft = (options.paddingLeft ?? 0) * density;
    this.paddingRight = (options.paddingRight ?? 0) * density;

    // folio setCanvas()（去调试 DOM 挂载）
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.font = this.font;

    // folio setTexture() 原样
    this.texture = new THREE.Texture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.flipY = false;
    this.texture.generateMipmaps = false;
  }

  updateText(text: string | string[]): void {
    this.lines = typeof text === 'string' ? [text] : [...text];

    // 自动量宽：canvas 尺寸变更会重置 context 状态，font 必须重设
    if (this.autoWidth) {
      this.width = Math.ceil(this.getMeasure().width + this.paddingLeft + this.paddingRight) + 2;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
      this.context.font = this.font;
    }

    this.draw();
  }

  getMeasure(): { width: number } {
    this.context.font = this.font;
    let width = 0;
    for (const line of this.lines) {
      const measure = this.context.measureText(line);
      if (measure.width > width) width = measure.width;
    }
    return { width };
  }

  /** 画布宽高比（label mesh scale.x 换算用） */
  get aspect(): number {
    return this.width / this.height;
  }

  private draw(): void {
    // Clear（黑底白字：采样侧只取 .r 通道当 mask，folio 口径）
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.font = this.font;
    this.context.textAlign = this.horizontalAlign === 'center' ? 'center' : this.horizontalAlign === 'left' ? 'start' : 'end';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = '#ffffff';

    let i = 0;
    for (const line of this.lines) {
      const y = this.height / 2 + (i - (this.lines.length - 1) / 2) * this.lineHeight;

      let x = this.width / 2;
      if (this.horizontalAlign === 'left') x = this.paddingLeft;
      else if (this.horizontalAlign === 'right') x = this.width - this.paddingRight;

      this.context.fillText(line, x, y);
      i++;
    }

    this.texture.needsUpdate = true;
  }

  dispose(): void {
    this.texture.dispose();
  }
}
