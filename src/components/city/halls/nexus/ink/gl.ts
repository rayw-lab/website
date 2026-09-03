/**
 * 墨迹厅 · WebGL2 底座
 *
 * 零依赖。只提供三件事：能力探测、program 编译、ping-pong 浮点 FBO。
 * 不引 three/OGL——全屏 quad 不需要场景图（CHARTER §6 硬禁区 4）。
 */

export interface GLCaps {
  gl: WebGL2RenderingContext;
  /** 半精度浮点可渲染。没有它整条水墨链路不成立 → 调用方降海报 */
  halfFloatRenderable: boolean;
  /** 线性插值半精度纹理。缺失时 advect 退化为 NEAREST，画质降但仍可跑 */
  halfFloatLinear: boolean;
  maxTextureSize: number;
}

/** 支持的内部格式组合，由 caps 决定 */
export interface TexFormat {
  internalFormat: number;
  format: number;
  type: number;
}

export function probeGL(canvas: HTMLCanvasElement): GLCaps | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    // 我们自己管重绘时机；保留缓冲避免每帧清屏开销
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  // EXT_color_buffer_float 让 RGBA16F/R16F/RG16F 可作为 color attachment。
  // Safari 与部分 Android WebView 只给 half_float 版本，两个都试。
  const cbf = gl.getExtension('EXT_color_buffer_float');
  const cbhf = gl.getExtension('EXT_color_buffer_half_float');
  const linear = gl.getExtension('OES_texture_float_linear');
  const linearHalf = gl.getExtension('OES_texture_half_float_linear');

  return {
    gl,
    halfFloatRenderable: Boolean(cbf || cbhf),
    // WebGL2 核心里 HALF_FLOAT 本就可线性过滤，但部分实现要显式扩展；两条都认
    halfFloatLinear: Boolean(linear || linearHalf || cbf),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
  };
}

export function formats(gl: WebGL2RenderingContext): Record<'rgba' | 'rg' | 'r', TexFormat> {
  return {
    rgba: { internalFormat: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT },
    rg: { internalFormat: gl.RG16F, format: gl.RG, type: gl.HALF_FLOAT },
    r: { internalFormat: gl.R16F, format: gl.RED, type: gl.HALF_FLOAT },
  };
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new Error('createShader failed');
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh) ?? '(no log)';
    gl.deleteShader(sh);
    // 系统边界：着色器编译失败必须显式抛，不能静默降级成黑屏
    throw new Error(`shader compile failed: ${log}`);
  }
  return sh;
}

export class Program {
  readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();

  constructor(
    private readonly gl: WebGL2RenderingContext,
    vertSrc: string,
    fragSrc: string,
  ) {
    const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
    const p = gl.createProgram();
    if (!p) throw new Error('createProgram failed');
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(p) ?? '(no log)';
      gl.deleteProgram(p);
      throw new Error(`program link failed: ${log}`);
    }
    this.program = p;
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  private loc(name: string): WebGLUniformLocation | null {
    if (!this.uniforms.has(name)) {
      this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this.uniforms.get(name) ?? null;
  }

  uniform1i(name: string, v: number): void {
    this.gl.uniform1i(this.loc(name), v);
  }
  uniform1f(name: string, v: number): void {
    this.gl.uniform1f(this.loc(name), v);
  }
  uniform2f(name: string, x: number, y: number): void {
    this.gl.uniform2f(this.loc(name), x, y);
  }
  uniform3f(name: string, x: number, y: number, z: number): void {
    this.gl.uniform3f(this.loc(name), x, y, z);
  }
  uniform4f(name: string, x: number, y: number, z: number, w: number): void {
    this.gl.uniform4f(this.loc(name), x, y, z, w);
  }

  /** 绑定纹理到指定 unit 并把 sampler uniform 指过去 */
  texture(name: string, tex: WebGLTexture, unit: number): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    this.uniform1i(name, unit);
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
    this.uniforms.clear();
  }
}

export interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  /** 1/width, 1/height —— shader 里高频用，预算好省一次除法 */
  texelX: number;
  texelY: number;
}

export function createFBO(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  fmt: TexFormat,
  filter: number,
): FBO {
  const texture = gl.createTexture();
  if (!texture) throw new Error('createTexture failed');
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texStorage2D(gl.TEXTURE_2D, 1, fmt.internalFormat, width, height);

  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error('createFramebuffer failed');
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`framebuffer incomplete: 0x${status.toString(16)}`);
  }
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return { texture, fbo, width, height, texelX: 1 / width, texelY: 1 / height };
}

/** ping-pong 对：读 read、写 write，然后 swap */
export class DoubleFBO {
  private a: FBO;
  private b: FBO;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    width: number,
    height: number,
    fmt: TexFormat,
    filter: number,
  ) {
    this.a = createFBO(gl, width, height, fmt, filter);
    this.b = createFBO(gl, width, height, fmt, filter);
  }

  get read(): FBO {
    return this.a;
  }
  get write(): FBO {
    return this.b;
  }
  swap(): void {
    const t = this.a;
    this.a = this.b;
    this.b = t;
  }
  get width(): number {
    return this.a.width;
  }
  get height(): number {
    return this.a.height;
  }

  dispose(): void {
    for (const f of [this.a, this.b]) {
      this.gl.deleteTexture(f.texture);
      this.gl.deleteFramebuffer(f.fbo);
    }
  }
}

/**
 * 全屏三角形（不是 quad）：一次 draw 三个顶点覆盖整屏，
 * 比两三角形的 quad 少一条对角线上的重复着色。
 */
export class ScreenTriangle {
  private readonly vao: WebGLVertexArrayObject;
  private readonly vbo: WebGLBuffer;

  constructor(private readonly gl: WebGL2RenderingContext) {
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    if (!vao || !vbo) throw new Error('createVertexArray/Buffer failed');
    this.vao = vao;
    this.vbo = vbo;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  /** 绑定目标（null = 画到屏幕）并画一次 */
  blit(target: FBO | null): void {
    const gl = this.gl;
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.width, target.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteBuffer(this.vbo);
  }
}
