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
  private dryRegions: ReadonlyArray<{ x: number; y: number; radius: number }> = [];

  private aspect = 1;
  private disposed = false;
  /** 有笔在纸上时传给 bleed，让笔尖附近洇得更凶 */
  private brush: [number, number, number] = [0, 0, -1];

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly caps: GLCaps,
    opts: InkEngineOptions,
  ) {
    this.gl = caps.gl;
    this.params = { ...pickParams(opts.mobile ?? false), ...opts.params };
    // 正控出口：外部探针据此确认「传进来的参数真的生效了」。
    // 没有它，「N 组参数出图相同」分不清是参数不敏感还是传参链路断了。
    (globalThis as Record<string, unknown>).__inkParams = this.params;
    // 正控出口：外部探针据此确认「传进来的参数真的生效了」，
    // 否则「六组参数出图一样」分不清是参数不敏感还是传参链断了。
    (globalThis as Record<string, unknown>).__inkParams = this.params;
    this.tri = new ScreenTriangle(this.gl);
    this.programs = {
      splat: new Program(this.gl, S.VERT, S.SPLAT_FS),
      splatDry: new Program(this.gl, S.VERT, S.SPLAT_DRY_FS),
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
    // 环境不支持 → null（调用方报 no-webgl2）。
    // 🔴 着色器编译/FBO 分配失败**不能**也返回 null：那会被打成 no-webgl2 标签，
    // 埋点与 e2e 分不清「这台设备不行」和「我们的代码坏了」（xhsapi P1）。
    if (!caps || !caps.halfFloatRenderable) return null;
    return new InkEngine(canvas, caps, opts); // 构造失败向上抛，由 mount 归类为 init-failed
  }

  private allocate(): void {
    const gl = this.gl;
    const f = formats(gl);
    const { simResolution, dyeResolution } = this.params;

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.aspect = w / h;

    // 半浮点线性过滤缺失时退化为 NEAREST（画质降但仍可跑）。
    // 此前 probeGL 探测了该能力却从未消费，gl.ts 的注释是空头承诺（xhsapi P2）。
    const smooth = this.caps.halfFloatLinear ? gl.LINEAR : gl.NEAREST;
    const sim = fit(simResolution, w, h);
    const dye = fit(dyeResolution, w, h);

    this.velocity = new DoubleFBO(gl, sim.w, sim.h, f.rg, smooth);
    this.pressure = new DoubleFBO(gl, sim.w, sim.h, f.r, gl.NEAREST);
    this.divergence = createFBO(gl, sim.w, sim.h, f.r, gl.NEAREST);
    this.curl = createFBO(gl, sim.w, sim.h, f.r, gl.NEAREST);

    this.wet = new DoubleFBO(gl, dye.w, dye.h, f.r, smooth);
    this.ink = new DoubleFBO(gl, dye.w, dye.h, f.rgba, smooth);
    this.fixedLayer = new DoubleFBO(gl, dye.w, dye.h, f.rgba, smooth);
    this.dryMask = createFBO(gl, dye.w, dye.h, f.r, smooth);
  }

  // ---------- 落墨 ----------

  /** 通用加法 splat */
  private splat(
    target: DoubleFBO,
    x: number,
    y: number,
    radius: number,
    value: Vec4,
    dry = false,
  ): void {
    const gl = this.gl;
    const p = dry ? this.programs.splatDry : this.programs.splat;
    p.use();
    if (dry) p.texture('uDryMask', this.dryMask.texture, 0);
    // 已有内容靠 blendFunc(ONE, ONE) 累加保留，不需要也不能绑输入纹理：
    // SPLAT_FS 没有 uTex sampler，绑当前 draw FBO 的纹理还会形成反馈环隐患。
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
    if (this.disposed) return;
    if (this.dryAt(x, y) > 0.98) return; // early-out：笔心正落在干纸上，整笔免谈
    this.splat(this.ink, x, y, radius, [density[0], density[1], density[2], 0], true);
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
    /**
     * 宏观几何调制。异源审计（advisor 与 agy 独立收敛）指出：墨被 `mob<0.002`
     * 锁在湿迹剪影内，而湿迹几何由固定 seed 决定 —— 只映射"落点"不足以让不同
     * 会话看起来不同，微观参数（fibre/bleed）改不动宏观剪影。
     * 数据映射层必须从这里注入差异。
     */
    shape: { vigor?: number; eccentricity?: number } = {},
  ): void {
    if (this.disposed) return;
    const vigor = shape.vigor ?? 1;           // 冲量倍率 ∝ 会话强度
    const ecc = Math.min(Math.max(shape.eccentricity ?? 0, 0), 0.9); // 偏心 ∝ 不均衡度
    // 🔴 扰动必须随笔触尺寸缩放。W1b 出图实测：冲量写死 34 时，
    // 小笔（r≈0.026）边缘分形漂亮，大笔（r≈0.058）却收敛成纯高斯圆 —— 因为
    // 相对扰动强度 ∝ impulse/radius，笔越大越"平静"。锚点门 A2 会在大笔触上悄悄失效。
    // 线性缩放会过冲：radius 0.058 时 kick=66、湿斑 10 个，冲量总量约 4 倍，
    // 实测把颜料整个吹散、画面全白（引擎不报错、ready 正常，最难查的那种）。
    // 相对扰动强度 = kick / radius。sqrt 缩放让大笔的相对扰动弱于小笔，
    // 正是大笔收敛成圆的直接原因；线性缩放才让各尺寸笔触"同样地乱"。
    // （首次试线性时画面全白，是因为同时把 lobes 提到了 10 —— 冲量总量约 4 倍；
    //   现在 lobes 收敛且 ADVECT_VEL/GRADIENT_SUB 都补了 clamp。）
    const kick = 34 * (radius / 0.03) * vigor;
    const lobes = 5 + Math.round(radius * 40); // 大笔要更多湿斑，否则边界仍然太圆
    // 🔴 主湿区半径必须随笔变化。写死 2.1 倍时，每一滴外面都套着一个大小完全相同的
    // 灰色圆盘 —— 单看一滴没问题，几十滴并排就是典型的集合级 AI 味（同批多件同模）。
    // 真人落墨时纸的吸水、落笔力度、墨的含水量都不一样，晕本就该大小不一。
    this.splatWater(x, y, radius * (1.45 + pseudo(seed, 77) * 0.95), 0.62 + pseudo(seed, 78) * 0.4);
    for (let i = 0; i < lobes; i++) {
      const a = pseudo(seed, i) * Math.PI * 2;
      const r = radius * (1.1 + pseudo(seed, i + 90) * 1.3);
      // 偏心：沿 x 拉长、y 压扁，让湿迹整体呈流向而非同心圆
      const wx = x + Math.cos(a) * r * 0.55 * (1 + ecc);
      const wy = y + Math.sin(a) * r * 0.55 * (1 - ecc * 0.55);
      this.splatWater(wx, wy, radius * (0.7 + pseudo(seed, i + 40) * 0.8), 0.5);
      // 微涡偶极子：制造旋度，涡量强化 pass 才有东西可放大
      const s = i % 2 === 0 ? 1 : -1;
      this.splatWater(wx, wy, radius * 0.6, 0, [-Math.sin(a) * kick * s, Math.cos(a) * kick * s]);
    }
    // 🔴 第二尺度：更小、更多、更靠外的湿斑。
    // 只有单一尺度的 lobe 时，大笔的湿区只是小笔的等比放大 —— 起伏比例不变，
    // 在更大面积上看就是平滑的圆（W1b 实测：r=0.026 出分形、r=0.058 出圆，
    // 提高纸纤维频率只带来微小改善，因为主因在湿区几何不在迁移率调制）。
    // 分形的本质是自相似的多尺度起伏，所以次级湿斑的半径必须显著小于主 lobe。
    const fine = lobes * 2;
    for (let i = 0; i < fine; i++) {
      const a = pseudo(seed, i + 200) * Math.PI * 2;
      const r = radius * (1.25 + pseudo(seed, i + 260) * 0.95);
      this.splatWater(
        x + Math.cos(a) * r * 0.62,
        y + Math.sin(a) * r * 0.62,
        radius * (0.16 + pseudo(seed, i + 300) * 0.2),
        0.44,
      );
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
    if (this.disposed) return;
    const g = 1 - this.dryAt(x, y);
    this.splat(this.wet, x, y, radius, [amount, 0, 0, 0], true);
    if (impulse[0] !== 0 || impulse[1] !== 0) {
      // 冲量同样受干纸拦截：干纸上没有水，也就不该有水流扰动去推动邻近的墨。
      // 漏掉这一路时，行为门表现为「墨没落进去、画面却还是变了」。
      this.splat(this.velocity, x, y, radius, [impulse[0] * g, impulse[1] * g, 0, 0]);
    }
  }

  /** 白墨：破坏性覆盖，用来表达 NO_GO / revert（真擦除，不是盖白） */
  splatWhite(x: number, y: number, radius: number, amount: number): void {
    if (this.disposed) return;
    this.splat(this.ink, x, y, radius, [0, 0, 0, amount], true);
  }

  /** 设置笔位（影响洇的强度）；radius ≤ 0 表示抬笔 */
  setBrush(x: number, y: number, radius: number): void {
    if (this.disposed) return;
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

  /**
   * 干纸的「落笔侧」拦截。
   *
   * 🔴 GPU 侧的 dryMask 只压湿度场，管的是【已经在纸上的墨会不会扩散过去】；
   * 对 `splatInk` 直接写进来的**新笔**毫无拦截 —— 访客在指挥官区域落笔会留下
   * 一个永不移动、永远可见的黑点，「画不上去」的隐喻当场破产（xhsapi 反核 P0，
   * 行为门实测最大色阶差 230 = 墨完全进去了）。
   *
   * 曾试过在 SPLAT_FS 里采 dryMask 做 gate，但 `setDryMask` 复用同一个 splat
   * program 去画 dryMask 自己，构成「采样正在写的纹理」的未定义行为，实测 gate
   * 完全不生效。落点判定本就只需要圆形区域（setDryMask 的入参形状），放在 CPU
   * 侧既确定又零 GPU 风险。
   */
  private dryAt(x: number, y: number): number {
    let m = 0;
    for (const r of this.dryRegions) {
      const dx = (x - r.x) * this.aspect;
      const dy = y - r.y;
      m = Math.max(m, Math.exp(-(dx * dx + dy * dy) / (r.radius * r.radius)));
    }
    return Math.min(1, m);
  }

  /** 干纸遮罩：值为 1 的像素湿度恒为 0，墨永远进不去（试墨区的指挥官区域） */
  setDryMask(regions: ReadonlyArray<{ x: number; y: number; radius: number }>): void {
    if (this.disposed) return;
    this.dryRegions = regions;
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

  /**
   * 画布尺寸变化后重建全部场。内容不保留：
   * 旋转屏幕后重来一笔是可接受的，尺寸失配的画面不是。
   */
  resize(): void {
    if (this.disposed) return;
    const gl = this.gl;
    for (const d of [this.velocity, this.pressure, this.wet, this.ink, this.fixedLayer]) d.dispose();
    for (const f of [this.divergence, this.curl, this.dryMask]) {
      gl.deleteTexture(f.texture);
      gl.deleteFramebuffer(f.fbo);
    }
    this.allocate();
    // 干纸区是语义资产，不能因为一次旋转就消失
    if (this.dryRegions.length > 0) this.setDryMask(this.dryRegions);
  }

  /** 无交互多久后停转（秒）。InkSurface 的 idle 判据从这里取，不再硬编码 */
  get idleSeconds(): number {
    return this.params.idleSeconds;
  }

  step(dtRaw: number): void {
    if (this.disposed) return;
    // 上界在引擎入口统一夹：调用方给的 fixedStep / seek stepSize 此前完全没有保护，
    // 半拉格朗日对流的步长失控会直接毁掉整个场（xhsapi P2）。
    const dt = Math.min(Math.max(dtRaw, 0), 1 / 30);
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
    p.uniform1f('uMobLo', P.mobLo);
    p.uniform1f('uMobHi', P.mobHi);
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
