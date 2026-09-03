/**
 * 墨迹厅 · 十二 pass 水墨 GLSL
 *
 * 物理来源全部是公开数学：Stam 1999《Stable Fluids》半拉格朗日对流 +
 * GPU Gems ch.38 的 Jacobi 压力投影与涡量强化 + Beer–Lambert 吸收定律。
 * 架构与参数初值参考 inkwash（All Rights Reserved，仅学机理不复制源码，
 * 磊哥 2026-09-04 裁定；CHARTER §6-5）与 PavelDoGreat（MIT）。
 *
 * 与参考实现的三处**本厅自有决策**：
 *  1. 紫墨而非近黑墨 —— 见 ABSORB / CHROMA 的推导注释；
 *  2. 干纸遮罩是一等公民（试墨区「指挥官区域拒墨」要用它演示权限语义）；
 *  3. replay 模式固定 dt，构建期可截确定性海报。
 */

/** 全屏三角形。gl_VertexID 省掉一个 attribute。 */
export const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;`;

/** 高斯笔触。加法混合直接打进目标纹理。 */
export const SPLAT_FS = `${HEAD}
uniform vec2 uPoint;
uniform vec4 uValue;
uniform float uRadius;
uniform float uAspect;
void main() {
  vec2 d = vUv - uPoint;
  d.x *= uAspect;
  o = uValue * exp(-dot(d, d) / uRadius);
}`;

/**
 * splat 的干纸变体：**逐片元**乘 (1 - dryMask)。
 *
 * 为什么必须独立编译一份，而不是给 SPLAT_FS 加个开关：
 * `setDryMask` 自己就是用 splat program 去画 dryMask 的，若同一个 program 里带上
 * `texture(uDryMask, …)`，画 mask 时就成了「采样正在写的那张纹理」——未定义行为，
 * 实测 gate 完全不生效。两个实例就没有这条反馈边。
 *
 * 为什么 CPU 侧判笔心还不够：splat 的足迹是高斯，笔心落在干区边界**外侧**时
 * CPU 门放行，而尾部照样写进 ink；wet 场每帧有 (1-mask) 清扫，**ink 场没有**，
 * 于是那点尾墨在干区里冻结可见——正是 P0 的原症状。访客沿边界涂抹必然触发。
 * 也不能改用「每帧 ink *= (1-mask)」：高斯 mask 的无限尾会变成常驻蒸发场，
 * 距圆心两倍半径处每秒也要吃掉大量合法墨。
 */
export const SPLAT_DRY_FS = `${HEAD}
uniform sampler2D uDryMask;
uniform vec2 uPoint;
uniform vec4 uValue;
uniform float uRadius;
uniform float uAspect;
void main() {
  vec2 d = vUv - uPoint;
  d.x *= uAspect;
  o = uValue * exp(-dot(d, d) / uRadius) * (1.0 - texture(uDryMask, vUv).x);
}`;

/**
 * pass 1 · 速度自对流 + 阻尼 + **湿度门**。
 * 湿度门是本厅的「权限系统」隐喻的物理本体：干纸上速度被 mask 归零，
 * 墨在那里绝对不动（试墨区的指挥官干纸靠它）。
 */
export const ADVECT_VEL_FS = `${HEAD}
uniform sampler2D uVelocity, uWet;
uniform vec2 uTexel;
uniform float uDt, uDissipation;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
  vec2 vel = texture(uVelocity, coord).xy * uDissipation;
  float wet = texture(uWet, vUv).x;
  o = vec4(clamp(vel * smoothstep(0.005, 0.2, wet), -1000.0, 1000.0), 0.0, 1.0);
}`;

/** pass 2 · 旋度 */
export const CURL_FS = `${HEAD}
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float l = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float r = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float b = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  o = vec4(0.5 * ((r - l) - (t - b)), 0.0, 0.0, 1.0);
}`;

/**
 * pass 3 · 涡量强化。
 * 这一步决定锚点门 A2「洇边分形度」：没有它，洇散会收敛成高斯圆，一眼假。
 */
export const VORTICITY_FS = `${HEAD}
uniform sampler2D uVelocity, uCurl;
uniform vec2 uTexel;
uniform float uCurlAmount, uDt;
void main() {
  float l = texture(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float c = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
  force /= length(force) + 1e-4;
  force *= uCurlAmount * c * vec2(1.0, -1.0);
  vec2 vel = texture(uVelocity, vUv).xy + force * uDt;
  o = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
}`;

/** pass 4 · 散度 */
export const DIVERGENCE_FS = `${HEAD}
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float l = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float t = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  o = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}`;

/** pass 5 · Jacobi 压力迭代（跑 N 次） */
export const PRESSURE_FS = `${HEAD}
uniform sampler2D uPressure, uDivergence;
uniform vec2 uTexel;
void main() {
  float l = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float div = texture(uDivergence, vUv).x;
  o = vec4((l + r + b + t - div) * 0.25, 0.0, 0.0, 1.0);
}`;

/**
 * pass 6 · 减压力梯度 → 无散度场。
 * S1 墨流的「后落的滴把先前的环推薄」全靠这一步的保面积性质。
 */
export const GRADIENT_SUB_FS = `${HEAD}
uniform sampler2D uPressure, uVelocity;
uniform vec2 uTexel;
void main() {
  float l = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  vec2 vel = texture(uVelocity, vUv).xy - 0.5 * vec2(r - l, t - b);
  o = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);   // xhsapi P2：此前仅 VORTICITY 有 clamp
}`;

/**
 * pass 7 · 湿度场：随流走 + 毛细侧渗 + 蒸发。
 * uDryMask 是本厅新增：静态遮罩里为 1 的地方湿度永远被压回 0
 * （= 指挥官区域的干纸；权限系统的物理实现）。
 */
export const ADVECT_WET_FS = `${HEAD}
uniform sampler2D uVelocity, uWet, uDryMask;
uniform vec2 uTexel, uSrcTexel;
uniform float uDt, uDecay, uSpread;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel * 0.6;
  float w = texture(uWet, coord).x;
  vec2 b = uSrcTexel * 1.6;
  float n = (texture(uWet, coord + vec2(b.x, 0.0)).x + texture(uWet, coord - vec2(b.x, 0.0)).x
           + texture(uWet, coord + vec2(0.0, b.y)).x + texture(uWet, coord - vec2(0.0, b.y)).x) * 0.25;
  w = mix(w, n, uSpread) * uDecay;
  // 🔴 clamp：splat 是加法写入且无上限，核心湿度会冲到 1.5+，
  // 使下游 smoothstep(uMobLo, uMobHi) 长期饱和在 1 —— 于是干燥/洇散类参数
  // 在很长时间里对形态毫无影响（W1b 六组参数出图全同的直接成因）。
  o = vec4(clamp(w, 0.0, 1.0) * (1.0 - texture(uDryMask, vUv).x), 0.0, 0.0, 1.0);
}`;

/**
 * pass 8 · 颜料：只在湿处可动 + **色谱分离洇散**。
 *
 * 色谱分离 = 给 RGBA 四个通道**不同的 bleed 速率**（uChroma.rgb + alpha 固定 1.05）。
 * 跑得快的通道先冲到外缘，于是一滴单色墨会分层。
 *
 * 🔴 紫墨的反直觉点（本厅自有推导，与参考实现的近黑墨不同）：
 *   显示式是 col = paper * exp(-density * ABSORB)，density.g 高意味着**绿光被吸掉**，
 *   透射出来的是品红/紫。所以要「外晕泛紫」，必须让 **G 通道 bleed 最快**，
 *   而不是直觉上的 R 或 B。→ CHROMA.g 取最大值。
 *   三通道齐聚的墨核则三色全吸 → 自然趋黑，无需额外处理。
 */
export const ADVECT_INK_FS = `${HEAD}
uniform sampler2D uVelocity, uInk, uWet;
uniform vec2 uTexel, uSrcTexel;
uniform float uDt, uBleed, uAspect, uFibre, uMobLo, uMobHi;
uniform vec2 uResolution;
uniform vec3 uChroma;
uniform vec3 uBrush;   // xy = 位置, z = 半径（≤0 表示无笔）

// 纸纤维的各向异性。W1 出图实测：只把纤维噪声放在 display 视觉层，
// 洇散数学上仍是各向同性 → 必然收敛成高斯圆（锚点门 A2 判 FAIL）。
// 真实宣纸的不规则边界来自**纤维决定迁移率**，所以噪声必须进这一层。
float h(vec2 p){ p = fract(p * vec2(127.31, 311.7)); p += dot(p, p + 34.7); return fract(p.x * p.y); }
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1,0)), f.x), mix(h(i + vec2(0,1)), h(i + vec2(1,1)), f.x), f.y);
}
float fibre(vec2 p){
  // 沿纤维方向拉长采样（x 压缩 y 拉伸），得到有走向的纹理而非各向同性斑点
  float a = vn(p * vec2(2.4, 0.42));
  float b = vn(p * vec2(0.5, 3.1) + 17.3);
  float c = vn(p * 1.7 + 5.1);
  return (a * 0.45 + b * 0.35 + c * 0.20);
}

void main() {
  float wet = texture(uWet, vUv).x;
  float mob = smoothstep(uMobLo, uMobHi, wet);
  // 纤维调制迁移率：墨沿好走的纤维冲得远，遇到密处滞留 → 边界长出毛刺
  // 🔴 纤维的空间尺度必须远小于笔触，否则大笔会把噪声平均掉、边界收敛成圆
  // （W1b 实测：0.012 ≈ 12 周期/屏 ≈ 83px 特征尺度，小笔 26px 出分形、大笔 58px 出圆）。
  // 0.035 ≈ 12–67px 三层特征尺度，覆盖到最大笔触之下。
  mob *= mix(1.0, 0.35 + 1.5 * fibre(vUv * uResolution * 0.035), uFibre);
  vec4 cur = texture(uInk, vUv);
  // 干纸：墨原地不动。这一句就是「访客在指挥官区域画不上去」的全部实现。
  if (mob < 0.002) { o = cur; return; }

  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 coord = vUv - uDt * vel * uTexel * mob;
  vec4 adv = texture(uInk, coord);

  float brush = 0.0;
  if (uBrush.z > 0.0) {
    vec2 d = vUv - uBrush.xy;
    d.x *= uAspect;
    brush = exp(-dot(d, d) / (uBrush.z * uBrush.z));
  }

  vec2 b = uSrcTexel * 1.6;
  vec4 n = (texture(uInk, coord + vec2(b.x, 0.0)) + texture(uInk, coord - vec2(b.x, 0.0))
          + texture(uInk, coord + vec2(0.0, b.y)) + texture(uInk, coord - vec2(0.0, b.y))) * 0.25;
  vec4 amount = clamp(uBleed * (0.25 + 1.3 * brush) * mob * vec4(uChroma, 1.05), 0.0, 0.92);
  o = mix(cur, mix(adv, n, amount), mob);
}`;

/**
 * pass 9 · 流动层 ⇄ 固定层交换。
 * 「定」= uSettle > 0：流动的墨沉入 fixed 层，此后新笔再洗不动它（合入 main 的隐喻）。
 * 白墨（A 通道）是破坏性的：它把底下的密度真的漂白，用于 NO_GO / revert。
 */
export const EXCHANGE_FS = `${HEAD}
uniform sampler2D uFixed, uInk;
uniform float uSettle, uMode;   // uMode < 0.5 写 fixed，否则写 ink
void main() {
  vec4 F = texture(uFixed, vUv);
  vec4 M = texture(uInk, vUv);
  if (uMode < 0.5) {
    vec3 density = F.rgb + M.rgb * uSettle;
    float white = F.a + M.a * uSettle;
    if (uSettle > 0.0) {
      // 白墨漂白：在透射域里混一次，再取对数回到密度域，
      // 保证「擦除」是真的抹掉密度，而不是盖一层白。
      float cover = (1.0 - exp(-2.2 * white)) * uSettle;
      vec3 T = exp(-density);
      density = -log(clamp(T * (1.0 - cover) + cover, 1e-4, 1.0));
      white *= 1.0 - uSettle;
    }
    o = vec4(density, white);
  } else {
    o = M * (1.0 - uSettle);
  }
}`;

/**
 * pass 10–12 · 显示：Beer–Lambert + 纸纤维 + 边缘沉积 + 湿润光泽。
 * 锚点门 A1/A3/A4 全在这一支里判。
 */
export const DISPLAY_FS = `${HEAD}
uniform sampler2D uInk, uFixed, uWet;
uniform vec2 uTexel, uResolution;
uniform vec3 uPaper, uAbsorb;
uniform float uStrength, uEdge, uGrain, uVignette;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.07; a *= 0.5; }
  return v;
}
vec4 pigment(vec2 uv) { return texture(uInk, uv) + texture(uFixed, uv); }

void main() {
  vec4 pw = pigment(vUv);
  vec3 density = pw.rgb;

  // 边缘沉积（锚点门 A1）：水在边界蒸发把颜料留下，是「像水墨」的第一开关。
  float c = dot(density, vec3(1.0));
  float l = dot(pigment(vUv - vec2(uTexel.x, 0.0)).rgb, vec3(1.0));
  float r = dot(pigment(vUv + vec2(uTexel.x, 0.0)).rgb, vec3(1.0));
  float b = dot(pigment(vUv - vec2(0.0, uTexel.y)).rgb, vec3(1.0));
  float t = dot(pigment(vUv + vec2(0.0, uTexel.y)).rgb, vec3(1.0));
  float edge = length(vec2(r - l, t - b));

  // 纸（锚点门 A3）：两层程序化噪声，不贴图。幅度刻意压得很小。
  vec2 px = vUv * uResolution;
  float fiber = fbm(px * 0.055);
  float tooth = vnoise(px * 0.42);
  float grain = fbm(px * 0.12 + 31.7);
  vec3 paper = uPaper - (fiber - 0.5) * 0.05 - (tooth - 0.5) * 0.022;

  // Beer–Lambert（锚点门 A4）：密度相加，指数衰减，浓处趋黑但永不死黑。
  vec3 absorbed = density * uStrength * uAbsorb;
  absorbed *= 1.0 + (grain - 0.5) * uGrain * clamp(c * 2.0, 0.0, 1.0);
  absorbed *= 1.0 + edge * uEdge;
  // 🔴 透射底光夹持：Beer–Lambert 在数学上永不到 0，但 8bit 量化会把它压成纯黑
  // （实测 W1b 定稿图有 956 个 RGB=(0,0,0) 的死黑像素，锚点门 A4 实际失守，
  //  是异源视觉审计发现的，我自己的量化门当时没查这一项）。
  // 真实宣纸上最浓的焦墨仍有纸骨反光，绝对黑洞既不物理也不贵气 —— 焦墨要有光泽感。
  vec3 col = max(paper * exp(-absorbed), uPaper * 0.055);

  // 白墨：漂白后的区域回到纸面之上
  float cover = clamp((1.0 - exp(-pw.a * 2.2)) * (1.0 - (grain - 0.5) * 0.35), 0.0, 1.0);
  col = mix(col, uPaper + 0.03, cover);

  // 湿处变暗且微冷 —— 这是「墨还没干」的唯一视觉线索，干燥后自然消失
  // 湿润光泽：「墨还没干」的唯一视觉线索。
  // 🔴 强度必须很轻。0.16 在单滴场景下没问题，但 S1 把一百天压进十几秒时
  // 所有滴同时湿着 —— 每滴外面套一个大小相近的灰盘子，几十滴并排就是集合级 AI 味。
  // 之前三次都在改 wet 场本身（半径/蒸发/随机化）而收效甚微，因为病灶在**呈现层**。
  // 同时把响应窗口抬高：只有真正很湿的地方才发暗，边缘的余湿不参与。
  float ws = smoothstep(0.18, 0.85, texture(uWet, vUv).x);
  col *= vec3(1.0) - ws * vec3(0.065, 0.06, 0.045);

  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q, q) * uVignette;
  o = vec4(col, 1.0);
}`;

/** 把纹理按倍率拷出去（海报/降采样用） */
export const COPY_FS = `${HEAD}
uniform sampler2D uTex;
uniform float uScale;
void main() { o = texture(uTex, vUv) * uScale; }`;
