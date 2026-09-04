/**
 * 帧库 · 体纹理切片着色器
 *
 * 一个盒子：x = 画面横向，y = 画面纵向，z = 时间（-Dz → +Dz 即 t 0 → 1）。
 * 渲染 = 射线–盒相交 + 一个半空间裁剪（刀面）。命中点落在：
 *   - 刀面（cut plane）        → 采 3D 纹理，得「帧 / 斜切时间切片」
 *   - ±z 面（时间两端）        → 采 3D 纹理 t=0 / t=1
 *   - ±y 面（顶/底）           → 采 x–t 活动投影（2D），金色纸带
 *   - ±x 面（左/右）           → 采 y–t 活动投影（2D）
 * 单 pass、单 draw、零步进（草案 §6）。
 */

export const VERT = `#version 300 es
in vec2 p; out vec2 v; void main(){ v = p; gl_Position = vec4(p, 0.0, 1.0); }`;

export const FRAG = `#version 300 es
precision highp float; precision highp sampler3D;
uniform sampler3D uVol;     // 帧体 RGB8
uniform sampler2D uXT;      // x–t 投影：宽 = n（时间），高 = 160（x）
uniform sampler2D uYT;      // y–t 投影：宽 = n（时间），高 = 90（y）
uniform vec2 uRes; uniform mat3 uRot; uniform vec3 uEye;
uniform vec3 uHalf;         // 盒半长 (x, y, z)
uniform vec4 uCut;          // 刀面 (nx, ny, nz, d)：保留 dot(n,p) <= d 一侧
uniform float uCutOn;       // 0 = 不裁（完整盒）
uniform vec3 uBg; uniform vec3 uGold; uniform vec3 uInk;
uniform float uEdge;        // 刀口高光强度 0..1
uniform float uLine;        // 侧面「当前时间」细线位置 t（<0 关闭）
in vec2 v; out vec4 o;

bool hitBox(vec3 ro, vec3 rd, out float t0, out float t1){
  vec3 a = (-uHalf - ro) / rd, b = (uHalf - ro) / rd;
  vec3 mn = min(a, b), mx = max(a, b);
  t0 = max(max(mn.x, mn.y), mn.z); t1 = min(min(mx.x, mx.y), mx.z);
  return t1 > max(t0, 0.0);
}
vec3 uvw(vec3 p){ return (p + uHalf) / (2.0 * uHalf); }   // 0..1；z 即 t
vec3 paper(vec3 u){ return texture(uVol, vec3(u.x, 1.0 - u.y, u.z)).rgb; }
vec3 tape(float a, float t){
  // 活动投影：暗底 → 金；再叠一条当前时间细线
  vec3 c = mix(uBg * 1.6, uGold, smoothstep(0.02, 0.85, a));
  if (uLine >= 0.0) c += uGold * 0.9 * (1.0 - smoothstep(0.0, 0.006, abs(t - uLine)));
  return c;
}
void main(){
  vec2 s = v * vec2(uRes.x / uRes.y, 1.0);
  vec3 ro = uRot * uEye;
  vec3 rd = uRot * normalize(vec3(s * 0.62, -1.0));
  float t0, t1;
  if (!hitBox(ro, rd, t0, t1)) { o = vec4(uBg, 1.0); return; }
  float te = t0; int face = -1;                 // -1 = 盒面；1 = 刀面
  if (uCutOn > 0.5) {
    float dn = dot(uCut.xyz, rd), dp = dot(uCut.xyz, ro) - uCut.w;
    if (dp + t0 * dn > 0.0) {                    // 入点在被裁掉的一侧
      if (dn >= 0.0) { o = vec4(uBg, 1.0); return; }
      float tc = -dp / dn;
      if (tc > t1) { o = vec4(uBg, 1.0); return; }
      te = max(tc, t0); face = 1;
    }
  }
  vec3 p = ro + rd * te; vec3 u = clamp(uvw(p), 0.0, 1.0);
  vec3 n; vec3 col;
  if (face == 1) {
    n = uCut.xyz; col = paper(u);
    // 刀口：离盒边 2% 内提亮，读起来像被切开的金属边
    vec3 e = min(u, 1.0 - u); float edge = 1.0 - smoothstep(0.0, 0.02, min(min(e.x, e.y), 1.0));
    col = mix(col, vec3(0.91, 0.90, 0.87), edge * uEdge);
  } else {
    vec3 c = p / uHalf; vec3 a = abs(c);
    if (a.x > a.y && a.x > a.z) { n = vec3(sign(c.x), 0.0, 0.0); col = tape(texture(uYT, vec2(u.z, u.y)).r, u.z); }
    else if (a.y > a.z)         { n = vec3(0.0, sign(c.y), 0.0); col = tape(texture(uXT, vec2(u.z, u.x)).r, u.z); }
    else                        { n = vec3(0.0, 0.0, sign(c.z)); col = paper(vec3(u.x, u.y, c.z > 0.0 ? 1.0 : 0.0)); }
  }
  float l = 0.72 + 0.28 * max(0.0, dot(n, normalize(vec3(0.35, 0.85, 0.45))));
  o = vec4(pow(col * l, vec3(0.96)), 1.0);
}`;
