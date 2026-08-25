// CC-E3：赛博楼宇 TSL 窗格 emissive 材质族（程序化，零贴图零网络请求）。
// 算法思路重写自 three.js r185 SkyscraperGenerator 的窗格分支（MIT，见
// docs/research/cyber-city-github-assets-research.md §2.1 决议）——原「新哥特陶土」
// palette 换皮为「赛博玻璃幕墙 + 随机窗亮 + 呼吸闪烁」；参数由楼宇 JSON 驱动
// （每栋一个 seed 与主题色）。零复制：无 LICENSE 仓库只借思路（同文档 §7 纪律）。
// 品质升级挂载点：CC-E4 NeonMaterials 接手时替换本文件的材质工厂即可（接口不变）。
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
  vec3,
} from 'three/tsl';

/** hex → 线性空间 vec3 节点（emissive 需线性值，THREE.Color 构造默认按 sRGB 读入） */
function linearColorNode(hex: string) {
  const c = new THREE.Color(hex).convertSRGBToLinear();
  return vec3(c.r, c.g, c.b);
}

export interface FacadeMaterialOptions {
  /** 楼体高度（米）——局部坐标窗格以楼底为 0 层 */
  height: number;
  /** 主霓虹色 hex（JSON neonColor 直入） */
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
 * 窗格 = 层高 × 列宽栅格；每窗一个 hash：亮/灭、色相偏移（80% 主题色 + 20% 暖白）、
 * 呼吸闪烁相位。顶/底面与窗间梁柱不发光。
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

    // 每窗随机：亮/灭 + 色相 + 闪烁相位
    const cellId = cellX.floor().mul(157.31).add(cellY.floor().mul(913.73));
    const rand = hash(cellId.add(seedNode));
    const lit = step(1 - options.litRatio, rand);
    const hueRand = hash(cellId.mul(1.618).add(seedNode));
    const windowColor = mix(linearColorNode(options.neonColor), vec3(0.92, 0.86, 0.72), step(0.8, hueRand));
    const flicker = sin(time.mul(0.6).add(rand.mul(43.7))).mul(0.08).add(0.92);

    let emissive = windowColor.mul(windowMask.mul(lit).mul(sideMask).mul(flicker).mul(intensity));

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

    // 远景冷色系：青 × 紫按窗随机（全站霓虹色族的低饱和版）
    const coolMix = mix(vec3(0.11, 0.5, 0.46), vec3(0.35, 0.2, 0.62), step(0.5, hash(cellId.add(7.31))));
    const flicker = sin(time.mul(0.35).add(rand.mul(61.3))).mul(0.1).add(0.9);

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
    const pulse =
      pulseSpeed === 0 ? float(1) : sin(time.mul(pulseSpeed).add(phase)).mul(0.25).add(0.75);
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
    // 沿高度滚动的全息扫描条纹 + 呼吸
    const stripe = fract(positionWorld.y.mul(2.2).sub(time.mul(0.5)));
    const band = smoothstep(0.0, 0.25, stripe).mul(smoothstep(0.75, 0.5, stripe));
    const pulse = sin(time.mul(1.2)).mul(0.15).add(0.85);
    return linearColorNode(hex).mul(band.mul(0.6).add(0.25)).mul(pulse);
  })();
  material.opacityNode = float(0.55);

  return material;
}
