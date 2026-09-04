/**
 * 帧库 · 体纹理引擎（VolumeEngine）
 *
 * 零依赖 WebGL2。把一支视频当成 RGB8 三维纹理（W×H×N），用一个刀面切它。
 * 能力不足时 `create()` 返回 null，调用方显示构建期海报（与墨迹厅同一约定）。
 *
 * 帧体从 16×16 网格的图集（每张 256 帧）装入：图集先画到 2D canvas 取像素，
 * 在 CPU 端重排成 (256, H, W, RGB) 的片，再一次 `texSubImage3D`。
 * 侧面不采体纹理边缘（那是一片纸色，spike 实证），采构建期算好的活动投影。
 */
import { FRAG, VERT } from './shaders';

export interface VolumeSpec {
  w: number; h: number; n: number;
  /** 每张 16×16 的帧图集，按时间顺序 */
  atlases: readonly (ImageBitmap | HTMLImageElement)[];
  /** x–t / y–t 活动投影（宽 n，高 w / h） */
  xt: ImageBitmap | HTMLImageElement;
  yt: ImageBitmap | HTMLImageElement;
}

export interface VolumeView {
  rx: number; ry: number;
  /** 刀锋位置 t ∈ [0,1] */
  cut: number;
  /** 刀面倾角（弧度，绕 y 轴，0 = 正切） */
  tilt: number;
  /** 是否裁剪；false = 完整盒 */
  cutOn: boolean;
  /** 侧面当前时间线（<0 关闭） */
  line: number;
  edge: number;
}

const HALF: readonly [number, number, number] = [0.89, 0.5, 1.1];
const TILE = 16;

export class VolumeEngine {
  private readonly gl: WebGL2RenderingContext;
  private readonly prog: WebGLProgram;
  private readonly u: Record<string, WebGLUniformLocation | null> = {};
  private vol: WebGLTexture | null = null;
  private xt: WebGLTexture | null = null;
  private yt: WebGLTexture | null = null;
  private n = 0;
  readonly maxDepth: number;

  static create(canvas: HTMLCanvasElement, preserve = false): VolumeEngine | null {
    const gl = canvas.getContext('webgl2', {
      alpha: false, depth: false, stencil: false, antialias: false,
      preserveDrawingBuffer: preserve, powerPreference: 'high-performance',
    });
    if (!gl) return null;
    try { return new VolumeEngine(gl); } catch { return null; }
  }

  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.maxDepth = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) as number;
    this.prog = link(gl, VERT, FRAG);
    gl.useProgram(this.prog);
    for (const k of ['uVol', 'uXT', 'uYT', 'uRes', 'uRot', 'uEye', 'uHalf', 'uCut', 'uCutOn', 'uBg', 'uGold', 'uInk', 'uEdge', 'uLine'])
      this.u[k] = gl.getUniformLocation(this.prog, k);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(this.u.uVol, 0); gl.uniform1i(this.u.uXT, 1); gl.uniform1i(this.u.uYT, 2);
    gl.uniform3f(this.u.uHalf, HALF[0], HALF[1], HALF[2]);
    gl.uniform3f(this.u.uBg, 0.02, 0.027, 0.05);
    gl.uniform3f(this.u.uGold, 1.0, 0.82, 0.47);
    gl.uniform3f(this.u.uInk, 0.11, 0.12, 0.15);
  }

  /** 装帧体。n 超过硬件上限时按整数步长抽稀时间轴（草案 §7 降级第一行） */
  load(spec: VolumeSpec): { n: number; stride: number } {
    const { gl } = this;
    const stride = Math.max(1, Math.ceil(spec.n / this.maxDepth));
    const n = Math.ceil(spec.n / stride);
    this.n = n;
    this.unload();                                   // 切集：先放掉上一集的三张纹理
    this.vol = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D, this.vol);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texStorage3D(gl.TEXTURE_3D, 1, gl.RGB8, spec.w, spec.h, n);
    setFilter(gl, gl.TEXTURE_3D);
    const scratch = document.createElement('canvas');
    scratch.width = spec.w * TILE; scratch.height = spec.h * TILE;
    const ctx = scratch.getContext('2d', { willReadFrequently: true })!;
    let zOut = 0;
    for (let k = 0; k < spec.atlases.length; k++) {
      ctx.drawImage(spec.atlases[k], 0, 0);
      const px = ctx.getImageData(0, 0, scratch.width, scratch.height).data;
      const framesHere = Math.min(TILE * TILE, spec.n - k * TILE * TILE);
      const slab = new Uint8Array(spec.w * spec.h * 3 * Math.ceil(framesHere / stride));
      let d = 0;
      for (let f = 0; f < framesHere; f++) {
        if ((k * TILE * TILE + f) % stride) continue;
        const ox = (f % TILE) * spec.w, oy = Math.floor(f / TILE) * spec.h;
        for (let y = 0; y < spec.h; y++) {
          let s = ((oy + y) * scratch.width + ox) * 4;
          for (let x = 0; x < spec.w; x++, s += 4) { slab[d++] = px[s]; slab[d++] = px[s + 1]; slab[d++] = px[s + 2]; }
        }
      }
      const depth = d / (spec.w * spec.h * 3);
      gl.texSubImage3D(gl.TEXTURE_3D, 0, 0, 0, zOut, spec.w, spec.h, depth, gl.RGB, gl.UNSIGNED_BYTE, slab.subarray(0, d));
      zOut += depth;
    }
    this.xt = tex2d(gl, spec.xt); this.yt = tex2d(gl, spec.yt);
    return { n, stride };
  }

  get frames(): number { return this.n; }

  render(view: VolumeView, width: number, height: number): void {
    const { gl } = this;
    if (!this.vol) return;
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.prog);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_3D, this.vol);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.xt);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.yt);
    gl.uniform2f(this.u.uRes, width, height);
    gl.uniformMatrix3fv(this.u.uRot, false, rotation(view.rx, view.ry));
    gl.uniform3f(this.u.uEye, 0, 0, 2.75);
    // 刀面：法线绕 y 轴从 +z 转 tilt；d 使刀面在 x=0 处经过 z = cut
    const nx = Math.sin(view.tilt), nz = Math.cos(view.tilt);
    const z = (view.cut * 2 - 1) * HALF[2];
    gl.uniform4f(this.u.uCut, nx, 0, nz, nz * z);
    gl.uniform1f(this.u.uCutOn, view.cutOn ? 1 : 0);
    gl.uniform1f(this.u.uEdge, view.edge);
    gl.uniform1f(this.u.uLine, view.line);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** 离屏出图（海报）：同一 view、同一算法，尺寸自定 → 结果确定 */
  snapshot(view: VolumeView, width: number, height: number): Promise<Blob | null> {
    const c = this.gl.canvas as HTMLCanvasElement;
    const w0 = c.width, h0 = c.height;
    c.width = width; c.height = height;
    this.render(view, width, height);
    return new Promise((res) => c.toBlob((b) => { c.width = w0; c.height = h0; res(b); }, 'image/png'));
  }

  unload(): void {
    const { gl } = this;
    for (const t of [this.vol, this.xt, this.yt]) if (t) gl.deleteTexture(t);
    this.vol = this.xt = this.yt = null;
  }

  dispose(): void {
    this.unload();
    this.gl.deleteProgram(this.prog);
  }
}

function setFilter(gl: WebGL2RenderingContext, target: number): void {
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (target === gl.TEXTURE_3D) gl.texParameteri(target, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
}

function tex2d(gl: WebGL2RenderingContext, src: ImageBitmap | HTMLImageElement): WebGLTexture {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, src);
  setFilter(gl, gl.TEXTURE_2D);
  // 投影宽 = 片数（~1700–2000），屏上一格常盖几十列 → 不开 mipmap 就是摩尔纹（W1 真机截图实证）
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  return t;
}

function rotation(rx: number, ry: number): Float32Array {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  const Rx = [1, 0, 0, 0, cx, sx, 0, -sx, cx], Ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];
  const m = new Float32Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    let s = 0; for (let k = 0; k < 3; k++) s += Ry[k * 3 + j] * Rx[i * 3 + k]; m[i * 3 + j] = s;
  }
  return m;
}

function link(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const sh = (type: number, src: string): WebGLShader => {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}
