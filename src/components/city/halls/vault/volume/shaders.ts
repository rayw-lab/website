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
// 纸面：160×90 放大到屏幕会发糊，做一点对比与提亮（k3 盲评 A：正面发灰）
vec3 paper(vec3 u){ vec3 c = texture(uVol, vec3(u.x, 1.0 - u.y, u.z)).rgb; return clamp((c - 0.5) * 1.12 + 0.5 + 0.03, 0.0, 1.0); }
vec3 tape(float a, float t){
  // 活动投影：暗底 → 金；再叠一条当前时间细线
  vec3 c = mix(uBg * 1.6, uGold, smoothstep(0.02, 0.85, a));
  if (uLine >= 0.0) c += uGold * 0.9 * (1.0 - smoothstep(0.0, 0.006, abs(t - uLine)));
  return c;
}
// 盒子表面着色（含刀面裁剪）。返回 false = 这条射线没打到实体
bool shadeBox(vec3 ro, vec3 rd, out vec3 col, out float dist){
  float t0, t1;
  if (!hitBox(ro, rd, t0, t1)) return false;
  float te = t0; int face = -1;                 // -1 = 盒面；1 = 刀面
  if (uCutOn > 0.5) {
    float dn = dot(uCut.xyz, rd), dp = dot(uCut.xyz, ro) - uCut.w;
    if (dp + t0 * dn > 0.0) {                    // 入点在被裁掉的一侧
      if (dn >= 0.0) return false;
      float tc = -dp / dn;
      if (tc > t1) return false;
      te = max(tc, t0); face = 1;
    }
  }
  vec3 p = ro + rd * te; vec3 u = clamp(uvw(p), 0.0, 1.0);
  vec3 n;
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
  float l = 0.84 + 0.22 * max(0.0, dot(n, normalize(vec3(0.35, 0.85, 0.45))));
  col *= l; dist = te;
  return true;
}
// 片库环境：放映机光锥（左上打下）+ 一块暗地面（柔和倒影 + 接触阴影）+ 微弱边缘暗角
const float FLOOR_Y = -0.92;
vec3 environment(vec3 ro, vec3 rd, vec2 s){
  vec3 bg = uBg;
  // 光锥：以盒子上方为锥顶的软亮区，沿屏幕向下变宽变淡
  vec2 cone = s - vec2(-0.18, 0.55);
  float coneK = smoothstep(0.9, 0.0, abs(cone.x) / max(0.08, -cone.y * 0.9 + 0.12)) * smoothstep(0.35, -1.2, cone.y);
  bg += vec3(0.11, 0.10, 0.08) * coneK * 0.55;
  if (rd.y < -1e-4) {
    float tf = (FLOOR_Y - ro.y) / rd.y; vec3 pf = ro + rd * tf;
    // 地面基色随距离沉入黑；盒脚下接触阴影
    float horiz = length(max(abs(pf.xz) - uHalf.xz, 0.0));
    float shadow = 1.0 - 0.75 * smoothstep(0.9, 0.0, horiz);
    float fall = exp(-0.28 * length(pf.xz));
    vec3 floorCol = (uBg * 2.2 + vec3(0.03, 0.03, 0.035)) * fall * shadow;
    // 倒影：反射射线再打一次盒子，按反射距离衰减
    vec3 rr = reflect(rd, vec3(0.0, 1.0, 0.0)); vec3 rc; float rdist;
    if (shadeBox(pf + vec3(0.0, 1e-3, 0.0), rr, rc, rdist)) floorCol += rc * 0.22 * exp(-0.9 * rdist) * fall;
    bg = mix(bg, floorCol, smoothstep(0.0, 0.02, -rd.y));
  }
  // 暗角
  bg *= 1.0 - 0.35 * smoothstep(0.7, 1.6, length(s));
  return bg;
}
void main(){
  vec2 s = v * vec2(uRes.x / uRes.y, 1.0);
  vec3 ro = uRot * uEye;
  vec3 rd = uRot * normalize(vec3(s * 0.62, -1.0));
  vec3 col; float dist;
  if (!shadeBox(ro, rd, col, dist)) col = environment(ro, rd, s);
  o = vec4(pow(col, vec3(0.96)), 1.0);
}`;
