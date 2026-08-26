// CC-E4：霓虹材质系统（D3 品质线）——全城唯一一套 TSL 霓虹材质工厂。
// 前身：CC-E3 city/NeonFacade.ts（算法思路重写自 three.js r185 SkyscraperGenerator
// 窗格分支，MIT，见 docs/research/cyber-city-github-assets-research.md §2.1；零复制）。
// E3 已留「品质升级挂载点：替换材质工厂即可（接口不变）」——本文件即该替换：
// 工厂签名原样保留（NeonFacade.ts 转薄壳 re-export，杜绝 Premortem P9 双材质系统），
// 在其上加 Quality 三档响应（实施方案 §5.3 表「窗格 emissive 动画」行）：
//   Quality 0  逐楼随机闪烁（每窗独立相位——E3 原行为）
//   Quality 1  全局统一相位（全城同拍呼吸，视觉收敛）
//   Quality 2  静态（时间轴冻结 + 振幅归零，招牌/信标/路障扫描同步冻结）
// 实现纪律（风险表 R1 缓解）：三档切换 = 3 个模块级共享 uniform 写入，
// 零材质重建、零 shader 重编译——所有动画项统一从这组 uniform 取时间轴与振幅。
// 另加 D3 桌面档质感件：约 7% 的窗升格为「亮屏窗」（1.9× 强度，bloom 下成为
// 立面上的高光锚点）；窗格 atlas（≤300KB 预算位）本波未启用——TSL 程序化已达
// 关键帧且保住「默认路径零重资产」，atlas 槽位留给 CC-P1 M 档（§12.7.6）。
import * as THREE from 'three/webgpu';
import {
  Fn,
  abs,
  float,
  fract,
  hash,
  mix,
  normalGeometry,
  normalWorld,
  positionGeometry,
  positionWorld,
  sin,
  smoothstep,
  step,
  time,
  uniform,
  vec3,
} from 'three/tsl';
import { NEON } from '../../../data/neon-tokens';
import type { QualityLevel } from '../core/Quality';

/**
 * 品质档共享 uniform（模块级单例：全部霓虹材质共用，切档一次写入全城生效）。
 * timeScale：0 = 冻结全部霓虹动画（窗闪/招牌脉动/信标呼吸/路障扫描条纹）；
 * flickerScale：0..1 闪烁振幅系数；phaseSpread：1 = 每窗随机相位，0 = 全局统一相位。
 */
const neonUniforms = {
  timeScale: uniform(1),
  flickerScale: uniform(1),
  phaseSpread: uniform(1),
};

/** 霓虹动画共用时间轴（品质档可冻结） */
const neonTime = time.mul(neonUniforms.timeScale);

/**
 * 按 Quality 档位写入共享 uniform（city 装配段接 quality.events 调用；
 * 幂等，可重复调用）。§5.3「窗格 emissive 动画」行的执行体。
 */
export function applyNeonQuality(level: QualityLevel): void {
  neonUniforms.timeScale.value = level === 2 ? 0 : 1;
  neonUniforms.flickerScale.value = level === 2 ? 0 : 1;
  neonUniforms.phaseSpread.value = level === 0 ? 1 : 0;
}

/** hex → 线性空间 vec3 节点（emissive 需线性值，THREE.Color 构造默认按 sRGB 读入） */
function linearColorNode(hex: string) {
  const c = new THREE.Color(hex).convertSRGBToLinear();
  return vec3(c.r, c.g, c.b);
}

/**
 * [CC-L1 A3] 全城窗色纪律 palette（单一事实源）：窗格只从青/品红/暖白三族取色，
 * 楼体 `neonColor` 不再直出窗格（rubric V3「绿红紫白同帧互撞」扣分项）——
 * neonColor 保留给招牌带/信标/大堂光带等「楼宇身份件」（ThemeTowers/CityBlocks
 * 的 createNeonGlowMaterial 调用与 lobby 光带不变）。
 * 色值与双主轴道路霓虹同源（[CC-L2-a+] 经 src/data/neon-tokens.ts 单一事实源
 * import——与 Roads ROAD_NEON、壳 CSS --neon-* 同一出处，不再是同值字面量拷贝）。
 */
const WINDOW_PALETTE = {
  cyan: NEON.cyan,
  magenta: NEON.magenta,
  warmWhite: '#f5decb',
} as const;

export interface FacadeMaterialOptions {
  /** 楼体高度（米）——局部坐标窗格以楼底为 0 层 */
  height: number;
  /** 主霓虹色 hex（JSON neonColor 直入；[CC-L1 A3] 只进大堂光带——窗格走 WINDOW_PALETTE） */
  neonColor: string;
  /** 确定性种子（hashStringToSeed(building.id)），窗亮分布跨端一致 */
  seed: number;
  /** 亮窗占比 0..1（hero 0.5 / standard 0.32 档位由调用方给） */
  litRatio: number;
  /** 层高（米/层） */
  floorHeight?: number;
  /** 窗列宽（米/列） */
  columnWidth?: number;
  /** emissive 总强度 */
  intensity?: number;
  /** 底层大堂霓虹光带（临街观感，hero 楼开） */
  lobby?: boolean;
}

/**
 * 楼体幕墙材质（几何以「楼体中心为原点、真实米制」构建时使用——positionGeometry 即米）。
 * 窗格 = 层高 × 列宽栅格；每窗一个 hash：亮/灭、色相（[CC-L1 A3] 三族纪律：
 * 青 55% / 品红 25% / 暖白 20%，WINDOW_PALETTE 单源）、呼吸闪烁相位
 * （相位散布/振幅/时间轴受品质档 uniform 控制）、亮屏升格（~7% 高亮窗）。
 */
export function createFacadeMaterial(options: FacadeMaterialOptions): THREE.MeshStandardNodeMaterial {
  const floorHeight = options.floorHeight ?? 3.4;
  const columnWidth = options.columnWidth ?? 3.0;
  const intensity = options.intensity ?? 1.4;
  const seedNode = float((options.seed % 100000) / 97);

  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.55, metalness: 0.35 });

  // 幕墙基色：近黑蓝灰 + 自底向上微亮渐变（剪影层次感）
  material.colorNode = Fn(() => {
    const yNorm = positionGeometry.y.add(options.height * 0.5).div(options.height);
    return vec3(0.014, 0.016, 0.024).mul(yNorm.mul(0.5).add(0.75));
  })();

  material.emissiveNode = Fn(() => {
    // 只在侧立面发光（法线水平分量占优）
    const sideMask = step(abs(normalGeometry.y), 0.5);

    // 立面横坐标：X 向立面（法线 ±X）取 z，Z 向立面取 x —— mix 按面选择
    const xFaceMask = step(0.5, abs(normalGeometry.x));
    const alongFacade = mix(positionGeometry.x, positionGeometry.z, xFaceMask);
    const yFromBase = positionGeometry.y.add(options.height * 0.5);

    // 窗格栅格 cell 与窗内区域（smoothstep 抗锯齿窗边）
    const cellX = alongFacade.div(columnWidth);
    const cellY = yFromBase.div(floorHeight);
    const wx = fract(cellX);
    const wy = fract(cellY);
    const windowMask = smoothstep(0.16, 0.24, wx)
      .mul(smoothstep(0.84, 0.76, wx))
      .mul(smoothstep(0.28, 0.36, wy))
      .mul(smoothstep(0.86, 0.78, wy));

    // 每窗随机：亮/灭 + 色相 + 闪烁相位（相位散布受品质档控制）
    const cellId = cellX.floor().mul(157.31).add(cellY.floor().mul(913.73));
    const rand = hash(cellId.add(seedNode));
    const lit = step(1 - options.litRatio, rand);
    // [CC-L1 A3] 窗色三族纪律：青 55% / 品红 25% / 暖白 20%（WINDOW_PALETTE 单源；
    // neonColor 不再直出窗格——见 palette 常量注释）
    const hueRand = hash(cellId.mul(1.618).add(seedNode));
    const windowColor = mix(
      mix(linearColorNode(WINDOW_PALETTE.cyan), linearColorNode(WINDOW_PALETTE.magenta), step(0.55, hueRand)),
      linearColorNode(WINDOW_PALETTE.warmWhite),
      step(0.8, hueRand),
    );

    const amp = float(0.08).mul(neonUniforms.flickerScale);
    const flicker = sin(neonTime.mul(0.6).add(rand.mul(43.7).mul(neonUniforms.phaseSpread)))
      .mul(amp)
      .add(float(1).sub(amp));

    // 亮屏窗升格（D3 质感件）：~7% 的亮窗 1.9× 强度，bloom 档成为立面高光锚点
    const screenBoost = step(0.93, hash(cellId.mul(2.417).add(seedNode))).mul(0.9).add(1);

    let emissive = windowColor.mul(
      windowMask.mul(lit).mul(sideMask).mul(flicker).mul(screenBoost).mul(intensity),
    );

    // 底层大堂光带（0–3.2m 渐隐），hero 楼临街辨识度
    if (options.lobby) {
      const lobbyBand = smoothstep(3.2, 0.4, yFromBase).mul(sideMask).mul(0.5);
      emissive = emissive.add(linearColorNode(options.neonColor).mul(lobbyBand));
    }

    return emissive;
  })();

  return material;
}

export interface SilhouetteMaterialOptions {
  /** 亮窗占比（剪影层默认调暗：预留槽位「熄灯窗格」语义，CC-MAP1 §2） */
  litRatio?: number;
  /** emissive 总强度（远景不抢戏） */
  intensity?: number;
}

/**
 * 剪影层共享材质（InstancedMesh 单位盒缩放实例专用）：
 * 窗格取世界坐标栅格——实例各在不同世界位置，天然获得逐楼随机且窗尺寸恒定
 * （单位盒局部坐标被非均匀缩放，不能作米制栅格）。全剪影层 1 个材质 1 次 draw call。
 */
export function createSilhouetteMaterial(
  options: SilhouetteMaterialOptions = {},
): THREE.MeshStandardNodeMaterial {
  const litRatio = options.litRatio ?? 0.14;
  const intensity = options.intensity ?? 0.5;

  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.9, metalness: 0.1 });
  material.colorNode = vec3(0.01, 0.011, 0.016);

  material.emissiveNode = Fn(() => {
    const sideMask = step(abs(normalWorld.y), 0.5);

    const xFaceMask = step(0.5, abs(normalWorld.x));
    const alongFacade = mix(positionWorld.x, positionWorld.z, xFaceMask);

    const cellX = alongFacade.div(3.2);
    const cellY = positionWorld.y.div(3.6);
    const wx = fract(cellX);
    const wy = fract(cellY);
    const windowMask = smoothstep(0.2, 0.3, wx)
      .mul(smoothstep(0.8, 0.7, wx))
      .mul(smoothstep(0.3, 0.4, wy))
      .mul(smoothstep(0.84, 0.74, wy));

    const cellId = cellX.floor().mul(311.7).add(cellY.floor().mul(741.13));
    const rand = hash(cellId);
    const lit = step(1 - litRatio, rand);

    // 远景冷色系：青 × 品红按窗随机（[CC-L1 A3] 与 WINDOW_PALETTE 同轴的低饱和版）
    const coolMix = mix(vec3(0.11, 0.5, 0.46), vec3(0.5, 0.05, 0.17), step(0.5, hash(cellId.add(7.31))));

    const amp = float(0.1).mul(neonUniforms.flickerScale);
    const flicker = sin(neonTime.mul(0.35).add(rand.mul(61.3).mul(neonUniforms.phaseSpread)))
      .mul(amp)
      .add(float(1).sub(amp));

    return coolMix.mul(windowMask.mul(lit).mul(sideMask).mul(flicker).mul(intensity));
  })();

  return material;
}

export interface NeonGlowMaterialOptions {
  /** 脉冲速度（rad/s 系数；0 = 常亮） */
  pulseSpeed?: number;
  /** 基础强度 */
  intensity?: number;
  /** 相位偏移（多件错拍） */
  phase?: number;
}

/** 纯霓虹发光件（招牌带 / 出生光圈 / 天线信标）：不透明、自发光、随时间呼吸 */
export function createNeonGlowMaterial(
  hex: string,
  options: NeonGlowMaterialOptions = {},
): THREE.MeshStandardNodeMaterial {
  const pulseSpeed = options.pulseSpeed ?? 1.6;
  const intensity = options.intensity ?? 2.0;
  const phase = options.phase ?? 0;

  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.4, metalness: 0 });
  material.colorNode = vec3(0.02, 0.02, 0.025);
  material.emissiveNode = Fn(() => {
    const amp = float(0.25).mul(neonUniforms.flickerScale);
    const pulse =
      pulseSpeed === 0
        ? float(1)
        : sin(neonTime.mul(pulseSpeed).add(phase)).mul(amp).add(float(1).sub(amp));
    return linearColorNode(hex).mul(pulse).mul(intensity);
  })();

  return material;
}

/** 全息路障材质（道路尽头「CC-P1 开放」占位）：加色半透明、条纹滚动 */
export function createHologramBarrierMaterial(hex: string): THREE.MeshBasicNodeMaterial {
  const material = new THREE.MeshBasicNodeMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  material.colorNode = Fn(() => {
    // 沿高度滚动的全息扫描条纹 + 呼吸（品质档冻结时定格为静态条纹）
    const stripe = fract(positionWorld.y.mul(2.2).sub(neonTime.mul(0.5)));
    const band = smoothstep(0.0, 0.25, stripe).mul(smoothstep(0.75, 0.5, stripe));
    const ampNode = float(0.15).mul(neonUniforms.flickerScale);
    const pulse = sin(neonTime.mul(1.2)).mul(ampNode).add(float(1).sub(ampNode));
    return linearColorNode(hex).mul(band.mul(0.6).add(0.25)).mul(pulse);
  })();
  material.opacityNode = float(0.55);

  return material;
}
