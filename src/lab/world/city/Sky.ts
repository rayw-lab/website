// CC-L1 A1：天空穹顶 + 地平线辉光（视觉 rubric §6 Tier A1；AL0 审计 §8「天空渐变 +
// 地平线辉光，并同步雾色」）。思路参照 three.js r185 webgpu_generator_city 的
// SkyMesh 极简版（只借「反面大球 + 垂直渐变」结构，着色为本站霓虹色轴自写）：
//   · 反面球体（BackSide）罩住可驾驶域（道路 range ±260m，半径 700 < 相机 far 1000）；
//   · TSL 垂直渐变：天顶深蓝紫 → 地平线「光污染」辉光带（青⇄品红按方位混色，
//     与双主轴道路霓虹同源：南北=青 / 东西=品红，Roads ROAD_NEON 同表）；
//   · 强度纪律：全穹顶 < 1（bloom threshold=1 之下）——天空是环境不是光源，
//     辉光名额留给楼宇窗格/招牌/信标（Rendering.ts bloom 注释同款约定）；
//   · material.fog=false：穹顶自身不吃距离雾（雾由本文件 fogNode 统一经营，
//     远景楼宇渐隐进辉光带而不是渐隐进纯黑）。
//
// [CC-L3-ATM] 分层大气系统（AL3-B2C 放行主题「分层雾/低云带」，rubric V2 越
// 50-65 段顶的裁定条件「帧内出现可辨的近/中/远大气层次」）。本文件即任务书
// 「扩展 Sky.ts 或新建大气层」的前者——天空/雾色/辉光三件本就同源，避免拆文件
// 造成色轴双源。两件新增：
//   ① 分层距离雾（scene.fogNode 取代 city/index.ts 的单层线性 THREE.Fog）：
//      · 中景 haze（50-520m 缓坡）+ 远景纱帘（260-640m 陡坡）双坡叠加——远楼
//        不再被单一线性斜率「融平」，中/远衰减节奏可分；
//      · 近地雾床（世界高度 <30m 增密、随距离展开）：街道级低空 haze——远处
//        楼底先没入雾、楼顶后没入，纵向也有层次（主体 20m 机位处为 0，机器人
//        剪影/招牌/HUD 不被吞没，AL3-B2C §5 边界第 2 条）；
//      · 方位辉光染色：远雾色按视线方位在青⇄品红光污染色间过渡（与穹顶辉光带
//        同一混色轴），远景剪影「融进城市光污染」而非融进单一深灰；
//      · 总量封顶 0.86：最远剪影保留暗形，不允许全消（防「雾更浓=层次更好」假象）。
//   ② 地平线低云带（穹顶着色内嵌）：mx_noise_float 两倍频程序化平流云
//      （纵向压扁的条状云棉，仰角 0.012-0.26 带内、峰值压在首幕可见天空带
//      ~0.03-0.10），云底被城市辉光自下点亮、云体半遮辉光带——天际线剪影之后
//      多出「剪影 → 辉光+云 → 渐变夜空」的远景层。静态无时间项（云漂移会占
//      CITY-03 循环动画配额，按顾问稿「默认静态层」纪律不开）。
// 品质分档（Q0 全效 / Q1 简化 / Q2 关闭走廉价兜底，顾问稿 ATM 行验收口径）与
// 取证开关（同机位「有雾/关雾」对照协议）均走模块级共享 uniform：切档/开关 =
// uniform 写入，零材质重建零 shader 重编译（NeonMaterials neonUniforms 同款纪律）。
// layerMix×master=0 时雾严格退回 CC-L1 口径的线性 Fog(140,850) 等价式 + 云带清零
// ——Q2 兜底与「关雾」对照帧共用同一条退化路径，归因干净。
// 零贴图零资产（全程序化 TSL）；无逐帧 update——静态穹顶/雾场不占循环动画配额（CITY-03）。
import * as THREE from 'three/webgpu';
import {
  Fn,
  cameraPosition,
  exp,
  fog,
  mix,
  mx_noise_float,
  positionLocal,
  positionWorld,
  smoothstep,
  uniform,
  vec3,
} from 'three/tsl';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';

/** 与地平线辉光带同步的雾基色（Q2/关雾兜底 = CC-L1 线性雾同色，单一事实源） */
export const SKY_FOG_COLOR = '#101c26';

/** 天顶色（scene.background 兜底同色：穹顶外的边角不露黑缝） */
export const SKY_ZENITH_COLOR = '#070810';

/** [CC-L3-ATM] 兜底线性雾参数（CC-L1 口径原值：Fog(SKY_FOG_COLOR, 140, 850)） */
const LEGACY_FOG = { near: 140, far: 850 } as const;

/**
 * 地平线光污染辉光色族（线性值；穹顶辉光带与远雾染色共用的单一事实源——
 * 青=南北轴 / 品红=东西轴，Roads ROAD_NEON 同源色相）。
 */
const HORIZON_GLOW = {
  cyan: [0.1, 0.33, 0.33],
  magenta: [0.3, 0.08, 0.22],
} as const;

/**
 * [CC-L3-ATM] 大气档位共享 uniform（模块级单例：穹顶云带与 fogNode 共用，
 * 切档一次写入全场生效）。
 * layerMix：分层雾/云带强度——Q0 1 全效 / Q1 0.8 简化 / Q2 0 关闭（雾退回
 *   CC-L1 线性兜底式；uniform 归零后分层项 ALU 仍在管线内，但每片元只是
 *   十几条标量运算，远低于窗格栅格着色，属可接受的廉价兜底）；
 * cloudDetail：云带第二倍频细节量（Q0 1 / Q1 0.35 / Q2 0——Q1 云形更平）；
 * master：取证/审计开关（同机位「有雾/关雾」对照协议专用，quality 档位不写它）。
 */
const atmosphereUniforms = {
  layerMix: uniform(1),
  cloudDetail: uniform(1),
  master: uniform(1),
};

/**
 * 按 Quality 档位写入大气 uniform（city 装配段接 quality.events 调用；幂等）。
 * 顾问稿 ATM 行「Q0 全效、Q1 简化、Q2 关闭或廉价兜底」的执行体。
 */
export function applyAtmosphereQuality(level: QualityLevel): void {
  atmosphereUniforms.layerMix.value = level === 0 ? 1 : level === 1 ? 0.8 : 0;
  atmosphereUniforms.cloudDetail.value = level === 0 ? 1 : level === 1 ? 0.35 : 0;
}

/**
 * [CC-L3-ATM] 取证开关：0 = 关雾（严格退回 CC-L1 线性雾 + 无云带），1 = 全开。
 * 消费方 = 视觉自评/审计的同机位对照帧协议（顾问稿 ATM 行「实现自评需同时给
 * 『有雾/关雾』同机位对照」）；页面侧经 #debug 句柄
 * `__worldSpikeGame.scene.userData.cityAtmosphere.setLayers(0|1)` 调用。
 */
export function setAtmosphereLayers(strength: number): void {
  atmosphereUniforms.master.value = Math.min(1, Math.max(0, strength));
}

export class Sky {
  readonly mesh: THREE.Mesh;

  constructor(game: Game) {
    // 半径纪律：驾驶域最远 ±260m，700+260=960 < 相机 far 1000（挂城后已放宽），
    // 开到路障尽头穹顶仍完整包住视锥
    const geometry = new THREE.SphereGeometry(700, 32, 15);

    const material = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide });
    material.fog = false;
    material.depthWrite = false;

    // 大气强度总闸（quality 档 × 取证开关；两处 uniform 乘积，见文件头）
    const layers = atmosphereUniforms.layerMix.mul(atmosphereUniforms.master);

    material.colorNode = Fn(() => {
      const direction = positionLocal.normalize();
      const elevation = direction.y;

      // 上半球：低空深蓝 → 天顶深蓝紫（近黑但非纯黑，保住远楼剪影层次）
      const zenith = vec3(0.010, 0.012, 0.030);
      const lowSky = vec3(0.020, 0.032, 0.062);
      const upper = mix(lowSky, zenith, smoothstep(0.04, 0.55, elevation));

      // 地平线以下：收进近地暗色（楼宇脚下不见硬切边）
      const below = vec3(0.012, 0.015, 0.022);
      const base = mix(below, upper, smoothstep(-0.12, 0.06, elevation));

      // 地平线辉光带（城市光污染）：青⇄品红按方位混色——东侧品红呼应东西轴
      // 霓虹大街，西/北侧青呼应南北中轴（HORIZON_GLOW 单源，fogNode 远雾同轴）
      const glowCyan = vec3(...HORIZON_GLOW.cyan);
      const glowMagenta = vec3(...HORIZON_GLOW.magenta);
      const horizonGlow = mix(glowCyan, glowMagenta, smoothstep(-0.55, 0.55, direction.x));
      const band = exp(elevation.abs().mul(-4.2));

      // [CC-L3-ATM] 地平线低云带：mx_noise 两倍频（纵向 ×26 压扁 = 条状平流云；
      // 3D 方向域直接采样，零贴图且无方位接缝）。带窗仰角 0.012-0.26，峰值
      // 0.045-0.08 压在首幕可见天空带内（俯角 15°/FOV 42° 下画框顶 ≈ 仰角 +6°）。
      const cloudDomain = vec3(direction.x.mul(4.5), elevation.mul(26), direction.z.mul(4.5));
      const cloudShape = mx_noise_float(cloudDomain).add(
        mx_noise_float(cloudDomain.mul(3.1).add(vec3(7.31, 3.7, 1.13))).mul(
          atmosphereUniforms.cloudDetail.mul(0.5),
        ),
      );
      const cloudWindow = smoothstep(0.012, 0.045, elevation).mul(
        smoothstep(0.26, 0.08, elevation),
      );
      // 覆盖率 ~45%（阈值 0.06-0.62 软边）：北向天空开口保留可辨的辉光间隙
      const coverage = smoothstep(0.06, 0.62, cloudShape).mul(cloudWindow).mul(layers);

      // 云底被城市辉光自下点亮（仰角越低越亮 0.45→1.15），云体半遮其后辉光带
      // （×0.45）——「剪影 → 辉光+云 → 夜空」三段远景层。峰值（青侧、满覆盖）
      // ≈ base + 辉光 0.15 + 云 0.38 < 0.6，bloom threshold=1 纪律之下
      const underLit = smoothstep(0.2, 0.02, elevation).mul(0.7).add(0.45);
      const glowTerm = horizonGlow.mul(band).mul(1.05);

      return base
        .add(glowTerm.mul(coverage.mul(0.45).oneMinus()))
        .add(horizonGlow.mul(underLit).mul(coverage));
    })();

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = 'city-sky-dome';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1; // 最先画（opaque 排序按 renderOrder，Rendering 纪律）
    game.scene.add(this.mesh);

    // ————— [CC-L3-ATM] 分层距离雾（scene.fogNode，接管 CC-L1 单层线性 Fog）—————
    // 全部为无状态 TSL 表达式 + 模块级 uniform：无逐帧 update，生命周期随 scene
    // （Game.dispose 释放 scene 时一并回收，city 无独立 dispose 的既有纪律不变）。
    const delta = positionWorld.sub(cameraPosition);
    const dist = delta.length();

    // 兜底：CC-L1 线性雾等价式（THREE.Fog 的 (d-near)/(far-near) 原式）
    const legacyFactor = dist.sub(LEGACY_FOG.near).div(LEGACY_FOG.far - LEGACY_FOG.near).clamp();

    // 分层雾三项（Q0 满档实测锚点，1440×900 主机位）：
    //   主体 20m ≈ 0（机器人零染雾）；中景楼群 100-150m 街面 0.04-0.13（轻纱，
    //   招牌可读）；北向路障 260m ≈ 0.44（道路消失点融入近地雾床）；
    //   远景剪影带 296-436m 楼底 0.7-0.86（封顶）/ 楼顶 0.4-0.56——远楼「底先隐、
    //   顶后隐」的纵向层次即来自雾床与双坡的高度差
    const midHaze = smoothstep(50, 520, dist).mul(0.42);
    const farVeil = smoothstep(260, 640, dist).mul(0.4);
    const groundHaze = smoothstep(30, 3, positionWorld.y)
      .mul(smoothstep(50, 380, dist))
      .mul(0.38);
    const layeredFactor = midHaze.add(farVeil).add(groundHaze).clamp(0, 0.86);

    // 雾色分层：近/中景为「抬亮蓝灰」haze（比兜底雾色亮一档，深色幕墙上可见），
    // 远景（160-620m 过渡）染向方位辉光（×0.55 = 比穹顶地平线峰值暗——远楼剪影
    // 融进光污染仍保持比天空暗一档，可读为剪影而非空洞）
    const glowTint = mix(
      vec3(...HORIZON_GLOW.cyan).mul(0.55),
      vec3(...HORIZON_GLOW.magenta).mul(0.55),
      smoothstep(-0.55, 0.55, delta.x.div(dist.max(0.001))),
    );
    const layeredColor = mix(vec3(0.010, 0.020, 0.036), glowTint, smoothstep(160, 620, dist));

    const legacy = new THREE.Color(SKY_FOG_COLOR);
    const legacyColor = vec3(legacy.r, legacy.g, legacy.b);

    game.scene.fogNode = fog(
      mix(legacyColor, layeredColor, layers),
      mix(legacyFactor, layeredFactor, layers),
    );

    // 取证/审计面（#debug 页面侧句柄，见 setAtmosphereLayers 注释）
    game.scene.userData.cityAtmosphere = { setLayers: setAtmosphereLayers };
  }
}
