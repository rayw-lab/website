/**
 * 墨迹厅 · 水墨引擎
 *
 * 七个场 + 一张静态干纸遮罩，十二 pass。零依赖，WebGL2。
 * 两种模式：replay（脚本驱动、固定 dt、可确定性截图）与 interactive（试墨区）。
 *
 * 能力不足时**不实例化**——`create()` 返回 null，调用方直接显示构建期海报
 * （CHARTER §4.0-e：四态 × 两张海报全覆盖，不许落到既无 canvas 又无海报的空态）。
 */

import {
  DoubleFBO,
  createFBO,
  formats,
  probeGL,
  Program,
  ScreenTriangle,
  type FBO,
  type GLCaps,
} from './gl';
import { pickParams, type InkParams } from './params';
import * as S from './shaders';

export interface InkEngineOptions {
  mobile?: boolean;
  params?: Partial<InkParams>;
  /** replay 模式用固定步长，保证构建期截图逐像素可复现 */
  fixedStep?: number;
}

type Vec4 = readonly [number, number, number, number];

export class InkEngine {
  private readonly gl: WebGL2RenderingContext;
  private readonly tri: ScreenTriangle;
  private readonly params: InkParams;
  private readonly programs: Record<string, Program>;

  private velocity!: DoubleFBO;
  private pressure!: DoubleFBO;
  private wet!: DoubleFBO;
  private ink!: DoubleFBO;
  private fixedLayer!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;
  private dryMask!: FBO;

  private aspect = 1;
  private disposed = false;
  /** 有笔在纸上时传给 bleed，让笔尖附近洇得更凶 */
  private brush: [number, number, number] = [0, 0, -1];

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    caps: GLCaps,
    opts: InkEngineOptions,
  ) {
    this.gl = caps.gl;
    this.params = { ...pickParams(opts.mobile ?? false), ...opts.params };
    this.tri = new ScreenTriangle(this.gl);
    this.programs = {
      splat: new Program(this.gl, S.VERT, S.SPLAT_FS),
      advectVel: new Program(this.gl, S.VERT, S.ADVECT_VEL_FS),
      curl: new Program(this.gl, S.VERT, S.CURL_FS),
      vorticity: new Program(this.gl, S.VERT, S.VORTICITY_FS),
      divergence: new Program(this.gl, S.VERT, S.DIVERGENCE_FS),
      pressure: new Program(this.gl, S.VERT, S.PRESSURE_FS),
      gradientSub: new Program(this.gl, S.VERT, S.GRADIENT_SUB_FS),
      advectWet: new Program(this.gl, S.VERT, S.ADVECT_WET_FS),
      advectInk: new Program(this.gl, S.VERT, S.ADVECT_INK_FS),
      exchange: new Program(this.gl, S.VERT, S.EXCHANGE_FS),
      display: new Program(this.gl, S.VERT, S.DISPLAY_FS),
      copy: new Program(this.gl, S.VERT, S.COPY_FS),
    };
    this.allocate();
  }

  /**
   * 唯一入口。返回 null = 这台设备跑不了水墨，调用方降海报。
   * 半浮点不可渲染是硬否决：整条光学密度链路建立在 16F 之上。
   */
  static create(canvas: HTMLCanvasElement, opts: InkEngineOptions = {}): InkEngine | null {
    const caps = probeGL(canvas);
    if (!caps || !caps.halfFloatRenderable) return null;
    try {
      return new InkEngine(canvas, caps, opts);
    } catch (err) {
      // 着色器编译/FBO 分配失败属于系统边界：记录后降级，不把黑屏留给访客
      console.warn('[InkEngine] 初始化失败，降级到海报：', err);
      return null;
    }
  }

  private allocate(): void {
    const gl = this.gl;
    const f = formats(gl);
    const { simResolution, dyeResolution } = this.params;

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.aspect = w / h;

    const sim = fit(simResolution, w, h);
    const dye = fit(dyeResolution, w, h);

    this.velocity = new DoubleFBO(gl, sim.w, sim.h, f.rg, gl.LINEAR);
    this.pressure = new DoubleFBO(gl, sim.w, sim.h, f.r, gl.NEAREST);
    this.divergence = createFBO(gl, sim.w, sim.h, f.r, gl.NEAREST);
    this.curl = createFBO(gl, sim.w, sim.h, f.r, gl.NEAREST);

    this.wet = new DoubleFBO(gl, dye.w, dye.h, f.r, gl.LINEAR);
    this.ink = new DoubleFBO(gl, dye.w, dye.h, f.rgba, gl.LINEAR);
    this.fixedLayer = new DoubleFBO(gl, dye.w, dye.h, f.rgba, gl.LINEAR);
    this.dryMask = createFBO(gl, dye.w, dye.h, f.r, gl.LINEAR);
  }

  // ---------- 落墨 ----------

  /** 通用加法 splat */
  private splat(target: DoubleFBO, x: number, y: number, radius: number, value: Vec4): void {
    const gl = this.gl;
    const p = this.programs.splat;
    p.use();
    p.texture('uTex', target.read.texture, 0); // 保持已有内容
    p.uniform2f('uPoint', x, y);
    p.uniform4f('uValue', value[0], value[1], value[2], value[3]);
    p.uniform1f('uRadius', radius * radius);
    p.uniform1f('uAspect', this.aspect);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    this.tri.blit(target.read); // 加法直接打进当前读缓冲，不消耗一次 swap
    gl.disable(gl.BLEND);
  }

  /** 落一滴墨：density 是三个染料分量的光学密度，扩散速度由 CHROMA 决定 */
  splatInk(x: number, y: number, radius: number, density: readonly [number, number, number]): void {
    this.splat(this.ink, x, y, radius, [density[0], density[1], density[2], 0]);
  }

  /**
   * 落一滴真实的墨：先铺**不规则湿斑**再落颜料。
   * W1 出图实测：单点湿区 + 各向同性 bleed = 高斯圆（锚点门 A2 FAIL）。
   * 真实一滴墨在纸上的湿区边界本就不规则，且滴落瞬间有径向冲量与微涡，
   * 这两者才是分形毛边的来源。seed 保证 replay 确定性。
   */
  drop(
    x: number,
    y: number,
    radius: number,
    density: readonly [number, number, number],
    seed = 1,
  ): void {
    // 不规则湿斑：主湿区 + 5 个偏移小湿点，边界因此天然凹凸
    this.splatWater(x, y, radius * 2.1, 0.85);
    for (let i = 0; i < 5; i++) {
      const a = pseudo(seed, i) * Math.PI * 2;
      const r = radius * (1.1 + pseudo(seed, i + 90) * 1.3);
      const wx = x + Math.cos(a) * r * 0.55;
      const wy = y + Math.sin(a) * r * 0.55;
      this.splatWater(wx, wy, radius * (0.7 + pseudo(seed, i + 40) * 0.8), 0.5);
      // 微涡偶极子：制造旋度，涡量强化 pass 才有东西可放大
      const s = i % 2 === 0 ? 1 : -1;
      this.splatWater(wx, wy, radius * 0.6, 0, [-Math.sin(a) * 34 * s, Math.cos(a) * 34 * s]);
    }
    this.splatInk(x, y, radius, density);
  }

  /** 打湿纸面并给一个冲量。没有水，墨寸步不行——这是权限系统的正面 */
  splatWater(
    x: number,
    y: number,
    radius: number,
    amount: number,
    impulse: readonly [number, number] = [0, 0],
  ): void {
    this.splat(this.wet, x, y, radius, [amount, 0, 0, 0]);
    if (impulse[0] !== 0 || impulse[1] !== 0) {
      this.splat(this.velocity, x, y, radius, [impulse[0], impulse[1], 0, 0]);
    }
  }

  /** 白墨：破坏性覆盖，用来表达 NO_GO / revert（真擦除，不是盖白） */
  splatWhite(x: number, y: number, radius: number, amount: number): void {
    this.splat(this.ink, x, y, radius, [0, 0, 0, amount]);
  }

  /** 设置笔位（影响洇的强度）；radius ≤ 0 表示抬笔 */
  setBrush(x: number, y: number, radius: number): void {
    this.brush = [x, y, radius];
  }

  /**
   * 「定」：把流动层沉进固定层，此后新笔洗不动它 —— 合入 main 的隐喻。
   * amount 建议 0.6–1.0 分两三帧完成，避免一帧硬切。
   */
  fix(amount: number): void {
    this.runExchange(amount, 0); // 写 fixed
    this.runExchange(amount, 1); // 扣减 ink
  }

  private runExchange(settle: number, mode: 0 | 1): void {
    const p = this.programs.exchange;
    const target = mode === 0 ? this.fixedLayer : this.ink;
    p.use();
    p.texture('uFixed', this.fixedLayer.read.texture, 0);
    p.texture('uInk', this.ink.read.texture, 1);
    p.uniform1f('uSettle', settle);
    p.uniform1f('uMode', mode);
    this.tri.blit(target.write);
    target.swap();
  }

  /** 干纸遮罩：值为 1 的像素湿度恒为 0，墨永远进不去（试墨区的指挥官区域） */
  setDryMask(regions: ReadonlyArray<{ x: number; y: number; radius: number }>): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.dryMask.fbo);
    gl.viewport(0, 0, this.dryMask.width, this.dryMask.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const p = this.programs.splat;
    p.use();
    p.uniform1f('uAspect', this.aspect);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    for (const r of regions) {
      p.uniform2f('uPoint', r.x, r.y);
      p.uniform4f('uValue', 1, 0, 0, 0);
      p.uniform1f('uRadius', r.radius * r.radius);
      this.tri.blit(this.dryMask);
    }
    gl.disable(gl.BLEND);
  }

  // ---------- 推进 ----------

  step(dt: number): void {
    if (this.disposed) return;
    const gl = this.gl;
    const P = this.params;
    const vTexel: [number, number] = [this.velocity.read.texelX, this.velocity.read.texelY];
    const dTexel: [number, number] = [this.ink.read.texelX, this.ink.read.texelY];

    // 1 速度自对流（湿度门）
    let p = this.programs.advectVel;
    p.use();
    p.texture('uVelocity', this.velocity.read.texture, 0);
    p.texture('uWet', this.wet.read.texture, 1);
    p.uniform2f('uTexel', vTexel[0], vTexel[1]);
    p.uniform1f('uDt', dt);
    p.uniform1f('uDissipation', P.dissipation);
    this.tri.blit(this.velocity.write);
    this.velocity.swap();

    // 2 旋度 → 3 涡量强化（决定洇边的分形毛刺）
    p = this.programs.curl;
    p.use();
    p.texture('uVelocity', this.velocity.read.texture, 0);
    p.uniform2f('uTexel', vTexel[0], vTexel[1]);
    this.tri.blit(this.curl);

    p = this.programs.vorticity;
    p.use();
    p.texture('uVelocity', this.velocity.read.texture, 0);
    p.texture('uCurl', this.curl.texture, 1);
    p.uniform2f('uTexel', vTexel[0], vTexel[1]);
    p.uniform1f('uCurlAmount', P.curlAmount);
    p.uniform1f('uDt', dt);
    this.tri.blit(this.velocity.write);
    this.velocity.swap();

    // 4 散度
    p = this.programs.divergence;
    p.use();
    p.texture('uVelocity', this.velocity.read.texture, 0);
    p.uniform2f('uTexel', vTexel[0], vTexel[1]);
    this.tri.blit(this.divergence);

    // 5 压力：上一帧的解衰减后作初值，比清零收敛快
    p = this.programs.copy;
    p.use();
    p.texture('uTex', this.pressure.read.texture, 0);
    p.uniform1f('uScale', 0.8);
    this.tri.blit(this.pressure.write);
    this.pressure.swap();

    p = this.programs.pressure;
    p.use();
    p.uniform2f('uTexel', vTexel[0], vTexel[1]);
    p.texture('uDivergence', this.divergence.texture, 1);
    for (let i = 0; i < P.pressureIterations; i++) {
      p.texture('uPressure', this.pressure.read.texture, 0);
      this.tri.blit(this.pressure.write);
      this.pressure.swap();
    }

    // 6 减梯度 → 无散度（S1 墨流"后滴推薄前环"的保面积就在这里）
    p = this.programs.gradientSub;
    p.use();
    p.texture('uPressure', this.pressure.read.texture, 0);
    p.texture('uVelocity', this.velocity.read.texture, 1);
    p.uniform2f('uTexel', vTexel[0], vTexel[1]);
    this.tri.blit(this.velocity.write);
    this.velocity.swap();

    // 7 湿度：随流 + 毛细 + 蒸发 + 干纸遮罩
    p = this.programs.advectWet;
    p.use();
    p.texture('uVelocity', this.velocity.read.texture, 0);
    p.texture('uWet', this.wet.read.texture, 1);
    p.texture('uDryMask', this.dryMask.texture, 2);
    p.uniform2f('uTexel', dTexel[0], dTexel[1]);
    p.uniform2f('uSrcTexel', dTexel[0], dTexel[1]);
    p.uniform1f('uDt', dt);
    p.uniform1f('uDecay', Math.exp(-dt / P.dryTau));
    p.uniform1f('uSpread', P.spread);
    this.tri.blit(this.wet.write);
    this.wet.swap();

    // 8 颜料：只在湿处可动 + 色谱分离
    p = this.programs.advectInk;
    p.use();
    p.texture('uVelocity', this.velocity.read.texture, 0);
    p.texture('uInk', this.ink.read.texture, 1);
    p.texture('uWet', this.wet.read.texture, 2);
    p.uniform2f('uTexel', dTexel[0], dTexel[1]);
    p.uniform2f('uSrcTexel', dTexel[0], dTexel[1]);
    p.uniform1f('uDt', dt);
    p.uniform1f('uBleed', P.bleed);
    p.uniform1f('uAspect', this.aspect);
    p.uniform1f('uFibre', P.fibre);
    p.uniform2f('uResolution', this.canvas.width, this.canvas.height);
    p.uniform3f('uChroma', P.chroma[0], P.chroma[1], P.chroma[2]);
    p.uniform3f('uBrush', this.brush[0], this.brush[1], this.brush[2]);
    this.tri.blit(this.ink.write);
    this.ink.swap();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render(): void {
    if (this.disposed) return;
    const P = this.params;
    const p = this.programs.display;
    p.use();
    p.texture('uInk', this.ink.read.texture, 0);
    p.texture('uFixed', this.fixedLayer.read.texture, 1);
    p.texture('uWet', this.wet.read.texture, 2);
    p.uniform2f('uTexel', this.ink.read.texelX, this.ink.read.texelY);
    p.uniform2f('uResolution', this.canvas.width, this.canvas.height);
    p.uniform3f('uPaper', P.paper[0], P.paper[1], P.paper[2]);
    p.uniform3f('uAbsorb', P.absorb[0], P.absorb[1], P.absorb[2]);
    p.uniform1f('uStrength', P.strength);
    p.uniform1f('uEdge', P.edge);
    p.uniform1f('uGrain', P.grain);
    p.uniform1f('uVignette', P.vignette);
    this.tri.blit(null);
  }

  /** 清空所有场（试墨区的「清」） */
  clear(): void {
    const gl = this.gl;
    for (const d of [this.velocity, this.pressure, this.wet, this.ink, this.fixedLayer]) {
      for (const fbo of [d.read, d.write]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  get resolution(): { sim: [number, number]; dye: [number, number] } {
    return {
      sim: [this.velocity.width, this.velocity.height],
      dye: [this.ink.width, this.ink.height],
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    for (const d of [this.velocity, this.pressure, this.wet, this.ink, this.fixedLayer]) d.dispose();
    for (const f of [this.divergence, this.curl, this.dryMask]) {
      gl.deleteTexture(f.texture);
      gl.deleteFramebuffer(f.fbo);
    }
    for (const p of Object.values(this.programs)) p.dispose();
    this.tri.dispose();
  }
}

/** 确定性伪随机：replay 模式下同 seed 必得同图 */
function pseudo(seed: number, i: number): number {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** 按短边目标格数等比缩放，长边跟着走 */
function fit(shortSide: number, width: number, height: number): { w: number; h: number } {
  const ratio = width / height;
  const [w, h] = ratio >= 1 ? [Math.round(shortSide * ratio), shortSide] : [shortSide, Math.round(shortSide / ratio)];
  return { w: Math.max(2, w), h: Math.max(2, h) };
}
