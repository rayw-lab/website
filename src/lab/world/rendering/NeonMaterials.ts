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
  cameraPosition,
  float,
  fract,
  hash,
  instanceIndex,
  max,
  mix,
  normalGeometry,
  normalWorld,
  positionGeometry,
  positionWorld,
  sign,
  sin,
  smoothstep,
  step,
  texture,
  time,
  uniform,
  uv,
  vec2,
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
  /**
   * [CC-L5-C1] 假室内映射窗格占比 0..1（0/缺省 = 整段编译剔除，standard 楼零开销；
   * hero 近景楼 0.10——rubric §6 Tier C「假室内映射窗格（generator_city 同技法，
   * ~10% 近景窗）」的执行位）
   */
  interiorRatio?: number;
  /** 楼体世界旋转（弧度，绕 Y）：室内映射视线世界→本地变换用，编译期常量 */
  rotationY?: number;
}

/**
 * 楼体幕墙材质（几何以「楼体中心为原点、真实米制」构建时使用——positionGeometry 即米）。
 * 窗格 = 层高 × 列宽栅格；每窗一个 hash：亮/灭、色相（[CC-L1 A3] 三族纪律：
 * 青 55% / 品红 25% / 暖白 20%，WINDOW_PALETTE 单源）、呼吸闪烁相位
 * （相位散布/振幅/时间轴受品质档 uniform 控制）、亮屏升格（~7% 高亮窗）、
 * [CC-L5-C1] 假室内映射升格（interiorRatio>0 时 ~10% 窗格出「有进深的房间」，
 * hero 近景楼专用；standard 楼缺省 0 = 编译剔除零开销）。
 */
export function createFacadeMaterial(options: FacadeMaterialOptions): THREE.MeshStandardNodeMaterial {
  const floorHeight = options.floorHeight ?? 3.4;
  const columnWidth = options.columnWidth ?? 3.0;
  const intensity = options.intensity ?? 1.4;
  const interiorRatio = options.interiorRatio ?? 0;
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

    // 窗内容层（平涂窗基线；interiorRatio>0 时部分窗格升格为假室内映射）
    let windowCore = windowColor.mul(lit.mul(flicker).mul(screenBoost).mul(intensity));

    // —— [CC-L5-C1] 假室内映射窗格（rubric §6 Tier C 首项：generator_city 同技法，
    // TSL 程序化零贴图）：~interiorRatio 的窗格升格为「有进深的房间」——视线与窗后
    // 虚拟房盒（宽=窗宽 / 高=窗高 / 进深 2.2m）逐轴求交，按最近命中面（后墙/侧墙/
    // 天花/地板）给出暖房 72% / 冷屏房 28% 的房内光 + 家具剪影。全静态零时间项
    //（不占 CITY-03 循环动画配额，Q2 冻结无感）；房内亮度峰值 ≈0.6 全程 <1
    //（bloom threshold=1 纪律：「室内是纵深不是光源」，阈上名额台账见
    // cyber-city-rendering-architecture-audit.md §5，本件登记在阈下方）。
    if (interiorRatio > 0) {
      // 世界→楼体本地视线（buildings JSON rotationY 编译期常量；0 = 直通零开销）
      const viewWorld = positionWorld.sub(cameraPosition).normalize();
      const rotY = options.rotationY ?? 0;
      const cosR = Math.cos(rotY);
      const sinR = Math.sin(rotY);
      const vx = rotY === 0 ? viewWorld.x : viewWorld.x.mul(cosR).sub(viewWorld.z.mul(sinR));
      const vz = rotY === 0 ? viewWorld.z : viewWorld.x.mul(sinR).add(viewWorld.z.mul(cosR));

      // 面内正交基（与 alongFacade 同轴选择）；进深分量按外法线取负 = 入房为正，
      // 掠射角下限 0.04 防除零/过度拉伸
      const dAlong = mix(vx, vz, xFaceMask);
      const dIn = mix(vz.mul(sign(normalGeometry.z)), vx.mul(sign(normalGeometry.x)), xFaceMask)
        .negate()
        .max(0.04);
      const dUp = viewWorld.y;

      // 窗内 UV（windowMask 全开区间 [0.24,0.76]×[0.36,0.78] → [0,1]）+ 房间米制
      const u0 = wx.sub(0.24).div(0.52).clamp();
      const v0 = wy.sub(0.36).div(0.42).clamp();
      const roomDepth = 2.2;

      // 射线转房间单位盒空间，三对壁面取最近命中 t（|d| 下限 1e-4 防除零）
      const du = dAlong.div(columnWidth * 0.52);
      const dv = dUp.div(floorHeight * 0.42);
      const dw = dIn.div(roomDepth);
      const tU = step(0, du).sub(u0).abs().div(du.abs().max(1e-4));
      const tV = step(0, dv).sub(v0).abs().div(dv.abs().max(1e-4));
      const tBack = float(1).div(dw);
      const tHit = tBack.min(tU).min(tV);

      const hitU = u0.add(du.mul(tHit)).clamp();
      const hitV = v0.add(dv.mul(tHit)).clamp();
      const hitW = dw.mul(tHit).clamp(); // 0 = 窗面 → 1 = 后墙

      // 命中面权重（互斥）：后墙 / 侧墙 / 仰视天花 / 俯视地板
      const wBack = step(tBack, tHit.add(1e-3));
      const wSide = step(tU, tHit.add(1e-3)).mul(wBack.oneMinus());
      const wVert = float(1).sub(wBack).sub(wSide).max(0);
      const wCeil = wVert.mul(step(0, dv));
      const wFloor = wVert.sub(wCeil);

      // 逐房随机：暖房（钨丝白）72% / 冷屏房（显示器蓝）28%，亮度 0.55–1.0
      const roomTint = mix(
        vec3(1.0, 0.62, 0.34),
        vec3(0.45, 0.75, 1.0),
        step(0.72, hash(cellId.mul(4.271).add(seedNode))),
      );
      const roomLum = hash(cellId.mul(6.733).add(seedNode)).mul(0.45).add(0.55);

      // 逐壁明暗：后墙上亮下暗 + 3 列家具剪影；天花最亮（顶灯面）；地板最暗；侧墙中间调
      const furnRand = hash(cellId.mul(9.157).add(hitU.mul(3).floor()).add(seedNode));
      const furniture = step(hitV, furnRand.mul(0.3).add(0.22)).mul(step(0.4, furnRand));
      const backLum = hitV.mul(0.32).add(0.3).mul(float(1).sub(furniture.mul(0.72)));
      const ceilLum = float(0.62).sub(hitW.mul(0.18));
      const floorLum = float(1).sub(hitW).mul(0.1).add(0.1);
      const sideLum = float(1).sub(hitW).mul(0.16).add(0.2);
      const wallLum = wBack
        .mul(backLum)
        .add(wCeil.mul(ceilLum))
        .add(wFloor.mul(floorLum))
        .add(wSide.mul(sideLum));

      // 升格选择与亮/灭窗独立（部分暗窗因此点亮为中间调房间，密度净增益）
      const interiorSel = step(1 - interiorRatio, hash(cellId.mul(5.113).add(seedNode)));
      windowCore = mix(windowCore, roomTint.mul(wallLum).mul(roomLum).mul(0.95), interiorSel);
    }

    let emissive = windowCore.mul(windowMask.mul(sideMask));

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

export interface SignPanelMaterialOptions {
  /** 文字 emissive 强度（>1 起 bloom 锚点） */
  intensity?: number;
}

/**
 * [CC-L2-B1] 楼身招牌灯箱面板（临街立面侧挂）：TextCanvas 楼名纹理出霓虹字 +
 * Chebyshev 细描边框 + 面板微背光。常亮无时间项——不占 CITY-03 循环动画配额
 * （配额两席 = HeroRobot idle 呼吸 + 楼顶全息板脉动，见 createHoloSignMaterial）。
 * 纹理采样口径 = TextCanvas flipY=false 约定（v.oneMinus()，InteractivePoints 同款）。
 */
export function createSignPanelMaterial(
  map: THREE.Texture,
  hex: string,
  options: SignPanelMaterialOptions = {},
): THREE.MeshStandardNodeMaterial {
  const intensity = options.intensity ?? 1.9;

  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.45, metalness: 0.1 });
  material.colorNode = vec3(0.015, 0.016, 0.023);
  material.emissiveNode = Fn(() => {
    const mask = texture(map, vec2(uv().x, uv().y.oneMinus())).r;
    // 描边框：归一 Chebyshev 距离 0.88 处细环（灯箱金属框内衬霓虹管语义）
    const cheb = max(uv().x.sub(0.5).abs().mul(2), uv().y.sub(0.5).abs().mul(2));
    const border = smoothstep(0.05, 0.015, cheb.sub(0.88).abs());
    // 文字全强 + 描边半强 + 0.05 面板背光（灯箱面板整体微亮，非纯黑板）
    return linearColorNode(hex).mul(mask.mul(intensity).add(border.mul(0.5)).add(0.05));
  })();

  return material;
}

export interface HoloSignMaterialOptions {
  /** 呼吸相位（多楼错拍） */
  phase?: number;
  /** 文字强度（默认 2.4，对齐被替换的占位箍带 bloom 档） */
  intensity?: number;
}

/**
 * [CC-L2-B1] 楼顶双面全息招牌板（rubric §6 Tier B1：TextCanvas 楼名纹理 →
 * 双面全息板替换 ThemeTowers 占位箍带）：加色半透明 + 静态扫描纹（无时间项）+
 * 慢速呼吸脉动。脉动继承被替换箍带的「招牌脉动」配额席位（CITY-03 ≤2 处不变），
 * 振幅受品质档 flickerScale 控制（Q2 冻结为常亮）。DoubleSide = 正反可见；
 * 背面文字镜像是全息板拟真口径（同 folio/Orion 惯例），不加第二块板。
 */
export function createHoloSignMaterial(
  map: THREE.Texture,
  hex: string,
  options: HoloSignMaterialOptions = {},
): THREE.MeshBasicNodeMaterial {
  const intensity = options.intensity ?? 2.4;
  const phase = options.phase ?? 0;

  const material = new THREE.MeshBasicNodeMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  material.colorNode = Fn(() => {
    const mask = texture(map, vec2(uv().x, uv().y.oneMinus())).r;
    // 静态全息扫描纹（fract 无时间项——滚动版归路障，此处不占动画配额）
    const scan = fract(uv().y.mul(26));
    const scanline = smoothstep(0.0, 0.35, scan).mul(smoothstep(1.0, 0.65, scan)).mul(0.25).add(0.75);
    const amp = float(0.18).mul(neonUniforms.flickerScale);
    const pulse = sin(neonTime.mul(0.9).add(phase)).mul(amp).add(float(1).sub(amp));
    return linearColorNode(hex).mul(mask.mul(intensity).add(0.08)).mul(scanline).mul(pulse);
  })();
  material.opacityNode = Fn(() => {
    const mask = texture(map, vec2(uv().x, uv().y.oneMinus())).r;
    return mask.mul(0.72).add(0.14); // 板底 0.14 若隐若现，文字段近实体
  })();

  return material;
}

/** [CC-L2-B2] 灯杆发光件局部包围（合并几何的本地坐标带，StreetLamps 布局单源传入） */
export interface StreetLampMaterialOptions {
  /** 灯头盒：y 带 + x 下界（悬臂端，x 为「朝路面」向） */
  head: { y0: number; y1: number; xMin: number };
  /** 沿街广告灯箱：y 带 + x 下界（杆侧挂旗式灯箱） */
  banner: { y0: number; y1: number; xMin: number };
  /** [CC-L3-content] 灯箱广告内容层（TextCanvas 标语 atlas，AL2 §7 保留项 #2 收口） */
  ads: {
    /** 标语 atlas 纹理（TextCanvas 黑底白字 mask，flipY=false 口径，行等高纵向堆叠） */
    map: THREE.Texture;
    /** atlas 总行数（全部灯位共 1 张 atlas，两色族材质共享） */
    rows: number;
    /** 本 InstancedMesh 首实例对应的 atlas 行号（行 = instanceIndex + rowStart） */
    rowStart: number;
    /** 灯箱盒本地坐标范围（大面 UV 由几何位置推导——合并几何无独立 UV 通道） */
    box: { x0: number; x1: number; y0: number; y1: number };
  };
}

/**
 * [CC-L2-B2] 街道灯杆材质（杆/臂暗金属 + 灯头/灯箱按局部坐标带切出 emissive）：
 * 合并几何（杆+臂+灯头+灯箱）单材质单 draw call/色族——positionGeometry 是实例
 * 本地坐标，InstancedMesh 逐实例旋转不破坏掩码。色 hex 从 neon-tokens 单源传入
 * （双主轴色族：南北=青、东西=品红，Roads/壳 CSS 同一出处）。常亮无时间项。
 *
 * [CC-L3-content] 挂旗灯箱大面从通用条纹升级为可读广告内容（AL2 审计 §3「灯箱只有
 * 条纹 emissive，视觉上仍读作通用发光板」判词收口）：
 *   · 逐实例标语：instanceIndex + rowStart 在共享 atlas 里选行——draw call 台账
 *     不变（仍 2 个 InstancedMesh），零新增几何零新增材质；
 *   · 竖排广告字：横排 atlas 行旋转 90°（阅读方向自上而下、字形顶朝观者右手，
 *     港式挂旗惯例）；±Z 两面各自镜像映射，双面正读不出镜像字；
 *   · 三分之一灯位反相（亮板暗字，行号 %3==2）：面板底 0.95 < bloom threshold 1
 *     不入泛光，暗字保读；其余灯位暗板亮字，字符 1.9 与楼身立面招牌同档 bloom 锚点。
 */
export function createStreetLampMaterial(
  hex: string,
  options: StreetLampMaterialOptions,
): THREE.MeshStandardNodeMaterial {
  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.5, metalness: 0.55 });
  material.colorNode = vec3(0.013, 0.014, 0.02);

  material.emissiveNode = Fn(() => {
    const y = positionGeometry.y;
    const x = positionGeometry.x;
    const band = (v: typeof y, lo: number, hi: number) =>
      smoothstep(lo - 0.03, lo, v).mul(smoothstep(hi + 0.03, hi, v));

    const headMask = band(y, options.head.y0, options.head.y1).mul(
      smoothstep(options.head.xMin - 0.03, options.head.xMin, x),
    );
    const bannerMask = band(y, options.banner.y0, options.banner.y1).mul(
      smoothstep(options.banner.xMin - 0.03, options.banner.xMin, x),
    );

    // 灯箱大面（本地法向 ±Z）= 广告面；窄边 = 金属框沿常亮
    const nz = normalGeometry.z;
    const faceMask = bannerMask.mul(step(0.5, abs(nz)));
    const rimMask = bannerMask.mul(step(abs(nz), 0.5));

    // 大面板内坐标：p = 杆侧(0)→外缘(1)，q = 底(0)→顶(1)
    const { box, rows, rowStart } = options.ads;
    const p = x.sub(box.x0).div(box.x1 - box.x0).clamp();
    const q = y.sub(box.y0).div(box.y1 - box.y0).clamp();

    // 竖排字映射：u = 阅读向（banner 顶→底 = atlas 行左→右）；v = 行内字形向
    // （字形顶朝观者右手——+Z 面观者右手 = +X，-Z 面 = -X，两面镜像选择）。
    // 行内 v 压进 [0.01,0.99] 防 clamp 边缘采到相邻行。
    const row = float(rowStart).add(instanceIndex.toFloat());
    const glyphV = mix(p, p.oneMinus(), step(0, nz)).mul(0.98).add(0.01);
    const adsMask = texture(options.ads.map, vec2(q.oneMinus(), row.add(glyphV).div(rows))).r;

    // 描边框（灯箱金属框内衬霓虹管，SignPanel 同款 Chebyshev 细环）
    const cheb = max(p.sub(0.5).abs(), q.sub(0.5).abs()).mul(2);
    const border = smoothstep(0.05, 0.015, cheb.sub(0.9).abs());

    // 行号 %3==2 反相（亮板暗字）：件间差异 + 面板 0.95<1 不触 bloom 保暗字可读
    const inverted = step(0.6, fract(row.mul(1 / 3)));
    const faceLum = mix(
      adsMask.mul(1.9).add(border.mul(0.5)).add(0.15),
      float(0.95).sub(adsMask.mul(0.85)),
      inverted,
    );

    const c = linearColorNode(hex);
    return c
      .mul(headMask)
      .mul(2.3)
      .add(c.mul(faceMask).mul(faceLum))
      .add(c.mul(rimMask).mul(0.8));
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
