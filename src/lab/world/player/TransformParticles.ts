// [CC-TRANS-FX] 变形窗过程化粒子炫技（Loop 7 指挥官追加：机器人↔车变形中间缺
// 炫技展示——入口 doc `docs/research/cyber-city-vehicle-transform-experience.md`
// §1.2/§2/§5；`docs/spec/cyber-city-transform-fx.md` 未就绪，按入口 doc 自洽）。
//
// 定位：TransformSystem 四拍时间轴的**叠加粒子层**（与既有充能环/光幕叠加而非
// 替换；墙钟 1.0–1.2s 与状态机零改动）。三段炫技随既有节拍走：
//   充能段 0→RING_IN           能量粒子沿展开中的充能环边缘持续喷发上冲（喷发 90）
//                              + 环向碎屑贴环带轨道旋转（碎屑 60，holding 多转时
//                              吃 ringSpin 继续公转——与刻度扫掠同源时钟）；
//   光幕段 RING_IN→+VEIL_IN/OUT 体积感 additive 光尘绕锚点柱域缓升内旋（光尘 60，
//                              强度吃 veilOpacity——峰值热交换被粒子雾包裹）；
//   落地段 触地帧→DROP 末       余烬自触地点低角迸散、抛物线回落消散（余烬 90；
//                              car 触地帧 = easeOutBack 首达 1 ≈ drop 37%，CPU 侧
//                              EMBER_TOUCHDOWN 门控；robot 回变复用为聚形尘）。
//
// 实现形态（FlightTrails 同族技法）：单 InstancedMesh(PlaneGeometry 1×1,
// SpriteNodeMaterial) = 全部三段 1 次 draw call；粒子位置/包络全部在顶点/片元级
// 由逐实例常量属性 + 6 个节拍 uniform 解析求出——零逐帧 JS 写缓冲、零贴图零资产、
// TSL 双后端（WebGPU 主路径 / ?gl=1 WebGL 2 同构，CITY-E2E-05 合同）。节拍 uniform
// 由 TransformSystem.update 逐帧写入（随 Ticker.delta 走，暂停即冻结——不吃 TSL
// `time`，与「补间一律 Ticker」纪律同轴）。
//
// CITY-03 循环动画配额自登记（口径 = 帧内可见的持续时间性动画，台账见
// cyber-city-eng-wave1-notes.md「CC-L3-B3」小节；入口 doc §5「变形粒子须登记席位」）：
// 本系统为**变形窗瞬态件**——仅 transforming 窗内（设计 1.05s）mesh.visible=true，
// robot_idle/driving 恒 visible=false 且节拍 uniform 不写（无 time 驱动源），
// 帧内零贡献、poster 逐字节恒等合同零影响。故不占持续循环席（持续席仍 3/3 =
// HeroRobot idle 呼吸 + 招牌脉动 + FlightTrails），以本注释登记为瞬态席备查，
// 不挤占 HeroRobot idle 配额。
//
// 预算与纪律：
//   · 实例 300 ≤ FlightTrails 800 点合同口径（喷发 90/碎屑 60/光幕尘 60/余烬 90，
//     角色按 10 步模板交错写入——Q1 裁 mesh.count 即近似等比裁全角色）；
//   · Q0 300 全效 / Q1 180 + 强度 0.85 / **Q2 明确关闭**（begin 时 count=0 +
//     visible=false——不是调暗而是不画，FlightTrails 同款）；
//   · prefers-reduced-motion：TransformSystem 不构造本类（instant swap 路径零改动，
//     零粒子——CITY-E2E-04 合同）；
//   · 白爆抑制（rubric §6 Tier A6「光幕洗帧」扣分项延伸）：光幕尘峰值强度 0.75（软点无硬核，峰值片元 ≈0.86）
//     恒阈下（bloom threshold=1）只做体积雾感；火花/余烬硬核 ≈1.7 仅限
//     0.2-0.6m 微点（FlightTrails 机头 1.3 / 调研 §5.3 允限 1.6-2.0 之内）——
//     无整幅 additive 洗帧，光幕峰值不透明度 0.7 封顶纪律不被叠加突破；
//   · 色相纪律：NEON.cyan/magenta 双主轴（光幕尘沿用竖幕 青→品红 渐变语义）+
//     余烬掺暖白（FlightTrails HEAD_WARM_WHITE 同值语义「热金属火星」，零新色相）；
//   · dispose 闭合：TransformSystem.dispose 链式调用——移除 mesh + 释放几何/材质 +
//     摘除取证句柄，中途卸载零残留。
//
// 取证协议（cityFlightTrails.setTrails 同款）：#debug 下
// `__worldSpikeGame.scene.userData.transformFx.setParticles(0|1)` 同机位
// 「有粒子/无粒子」对照（additive 加零 = 像素级等价于不存在）。
import * as THREE from 'three/webgpu';
import {
  Fn,
  clamp,
  cos,
  float,
  instancedBufferAttribute,
  select,
  sin,
  smoothstep,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import { NEON } from '../../../data/neon-tokens';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';
// 时间轴常量单源 = TransformSystem（循环 import 仅取模块级 const，构造期才消费，安全）
import { RING_IN, RING_RADIUS, VEIL_IN, VEIL_OUT } from './TransformSystem';

/** 余烬暖白（FlightTrails HEAD_WARM_WHITE 同值语义：热金属火星，不是第三色相） */
const EMBER_WARM_WHITE = '#f5decb';

/** 角色：0 喷发火花 / 1 环向碎屑 / 2 光幕光尘 / 3 落地余烬 */
type RoleId = 0 | 1 | 2 | 3;

/** 10 步角色交错模板（喷发 3 : 碎屑 2 : 光尘 2 : 余烬 3）——尾裁近似等比 */
const ROLE_PATTERN: RoleId[] = [0, 3, 2, 0, 1, 3, 0, 2, 1, 3];
/** 实例总数（Q0；≤ FlightTrails 800 点合同口径） */
const TOTAL_INSTANCES = 300;
/** Q1 简化档实例数（模板交错写入 → 尾裁即全角色 ~60%） */
const Q1_INSTANCES = 180;

/**
 * 取证/审计开关（模块级共享 uniform，trailUniforms.master 同款纪律）：
 * 0 = 关粒子（additive 加零 = 像素级等价于不存在），1 = 全开；quality 不写它。
 */
const fxMaster = uniform(1);

/** [CC-TRANS-FX] 取证开关：页面侧经 scene.userData.transformFx.setParticles 调用 */
export function setTransformParticles(strength: number): void {
  fxMaster.value = Math.min(1, Math.max(0, strength));
}

/** 确定性 RNG（mulberry32）：粒子布点可复现，帧优先取证/审计逐帧可比对 */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 充能环展开缓动的 CPU 同式（TransformSystem easeOutCubic——r0 预烘焙用） */
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export interface TransformParticlesOptions {
  /** 变形锚点地面坐标（= TransformSystem anchor，mesh 落位；粒子位置全部相对锚点） */
  anchor: { x: number; z: number };
}

export class TransformParticles {
  private readonly game: Game;
  private readonly mesh: THREE.InstancedMesh;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.SpriteNodeMaterial;

  /** 节拍 uniform（TransformSystem.update 逐帧写；窗外不写不画） */
  private readonly uClock = uniform(0); // ritual 时钟（holding 冻结，与光幕段同钟）
  private readonly uSpin = uniform(0); // ringSpin（holding 仍走——碎屑公转/闪烁时基）
  private readonly uRingScale = uniform(0); // 充能环展开 0→1（碎屑轨道半径）
  private readonly uRing = uniform(0); // 充能环不透明度（碎屑强度，落地随环消散）
  private readonly uVeil = uniform(0); // 光幕不透明度（光尘强度）
  private readonly uSettle = uniform(0); // 余烬归一进度（CPU 侧触地门控后 0→1）
  private readonly uIntensity = uniform(1); // 品质强度（Q0 1 / Q1 0.85）

  constructor(game: Game, options: TransformParticlesOptions) {
    this.game = game;

    // ————— 逐实例常量属性（构造期一次写入；运行期零 JS 写缓冲） —————
    // fxRole: 角色 id；fxA/fxB: 角色语义各异的 vec4 参数包；fxColor: 线性色
    const roleArr = new Float32Array(TOTAL_INSTANCES);
    const aArr = new Float32Array(TOTAL_INSTANCES * 4);
    const bArr = new Float32Array(TOTAL_INSTANCES * 4);
    const colorArr = new Float32Array(TOTAL_INSTANCES * 3);

    const random = createRandom(0x7f4a7c15);
    const cyan = new THREE.Color(NEON.cyan).convertSRGBToLinear();
    const magenta = new THREE.Color(NEON.magenta).convertSRGBToLinear();
    const warm = new THREE.Color(EMBER_WARM_WHITE).convertSRGBToLinear();
    const color = new THREE.Color();

    for (let i = 0; i < TOTAL_INSTANCES; i += 1) {
      const role = ROLE_PATTERN[i % ROLE_PATTERN.length];
      roleArr[i] = role;
      const theta0 = random() * Math.PI * 2;

      if (role === 0) {
        // 喷发火花：t0 出生于充能段前 70%，r0 = 出生时刻环缘半径（CPU 预烘焙缓动）
        const t0 = random() * RING_IN * 0.7;
        const life = 0.35 + random() * 0.3;
        const r0 = easeOutCubic(t0 / RING_IN) * RING_RADIUS * (0.5 + random() * 0.5);
        aArr.set([theta0, t0, life, r0], i * 4);
        // [size, 径向外抛速, 上冲高度（沿 9m 机器人剪影）, 螺旋扭转]
        bArr.set(
          [0.24 + random() * 0.36, 1.0 + random() * 2.2, 2.2 + random() * 4.6, (random() - 0.5) * 2.4],
          i * 4,
        );
        // 主青 + ~22% 品红点缀（双主轴），掺 15% 暖白读作「能量火花」
        color.copy(random() < 0.22 ? magenta : cyan).lerp(warm, 0.15);
      } else if (role === 1) {
        // 环向碎屑：贴充能环带公转（uSpin 时基——holding 多转时碎屑同步多转）
        aArr.set([theta0, 1.2 + random() * 1.8, 4 + random() * 5, 0.86 + random() * 0.22], i * 4);
        // [size, 起伏振幅, 基础高度, 翻滚速度]
        bArr.set(
          [0.26 + random() * 0.26, 0.06 + random() * 0.12, 0.12 + random() * 0.55, 2 + random() * 6],
          i * 4,
        );
        color.copy(cyan); // 环带同源色（充能环 vec3(0.29,0.78,0.72) 的 token 面）
      } else if (role === 2) {
        // 光幕光尘：锚点柱域（r 1.2–6.6m × y 0.6–9m）缓升内旋
        aArr.set([theta0, 1.2 + random() * 5.4, 0.6 + random() * 8.4, 0.8 + random() * 2.4], i * 4);
        // [size, 内旋角速, 闪烁频率, 备用]
        bArr.set([0.6 + random() * 0.7, (random() - 0.5) * 2.2, 5 + random() * 9, 0], i * 4);
        // 竖幕同语义 青→品红 双色（逐粒随机相位近似横向渐变的体积化）
        color.copy(cyan).lerp(magenta, random());
      } else {
        // 落地余烬：触地点低角迸散 → 抛物线回落消散
        aArr.set([theta0, 1.3 + random() * 1.5, 2.5 + random() * 4.5, 0.35 + random() * 1.4], i * 4);
        // [size, 逐粒错拍延迟, 闪烁频率, 切向漂移]
        bArr.set(
          [0.2 + random() * 0.3, random() * 0.35, 8 + random() * 10, (random() - 0.5) * 1.2],
          i * 4,
        );
        // 暖白主导 → 青（热金属火星冷却读法；FlightTrails 机头掺暖白同轴）
        color.copy(warm).lerp(cyan, random() * 0.45);
      }
      colorArr.set([color.r, color.g, color.b], i * 3);
    }

    this.geometry = new THREE.PlaneGeometry(1, 1);
    const iRole = new THREE.InstancedBufferAttribute(roleArr, 1);
    const iA = new THREE.InstancedBufferAttribute(aArr, 4);
    const iB = new THREE.InstancedBufferAttribute(bArr, 4);
    const iColor = new THREE.InstancedBufferAttribute(colorArr, 3);
    this.geometry.setAttribute('fxRole', iRole);
    this.geometry.setAttribute('fxA', iA);
    this.geometry.setAttribute('fxB', iB);
    this.geometry.setAttribute('fxColor', iColor);

    this.material = new THREE.SpriteNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.material.fog = false; // additive 片元吃 fogNode 会「加出雾灰」（FlightTrails 同款）

    const role = instancedBufferAttribute<'float'>(iRole, 'float');
    const A = instancedBufferAttribute<'vec4'>(iA, 'vec4');
    const B = instancedBufferAttribute<'vec4'>(iB, 'vec4');
    const tint = instancedBufferAttribute<'vec3'>(iColor, 'vec3');

    const isBurst = role.lessThan(0.5);
    const isDebris = role.lessThan(1.5);
    const isMote = role.lessThan(2.5);

    // ————— 充能段 · 喷发火花（沿展开环缘出生 → 螺旋上冲 → 二次衰减熄灭） —————
    const burstAlpha = clamp(this.uClock.sub(A.y).div(A.z), 0, 1);
    const burstTheta = A.x.add(burstAlpha.mul(B.w));
    const burstR = A.w.add(burstAlpha.mul(B.y));
    const burstY = burstAlpha.mul(B.z).mul(burstAlpha.mul(-0.35).add(1));
    const burstPos = vec3(cos(burstTheta).mul(burstR), burstY, sin(burstTheta).mul(burstR));
    const burstEnv = smoothstep(0, 0.12, burstAlpha).mul(burstAlpha.oneMinus().pow(2)).mul(1.7);

    // ————— 充能段 · 环向碎屑（贴环带公转 + 正弦起伏；强度随环出现/消散） —————
    const debrisTheta = A.x.add(this.uSpin.mul(A.y));
    const debrisR = this.uRingScale.mul(RING_RADIUS).mul(A.w);
    const debrisY = B.z.add(sin(this.uSpin.mul(A.z).add(A.x.mul(7))).mul(B.y));
    const debrisPos = vec3(cos(debrisTheta).mul(debrisR), debrisY, sin(debrisTheta).mul(debrisR));
    const debrisEnv = this.uRing
      .mul(sin(this.uSpin.mul(9).add(A.x.mul(13))).mul(0.28).add(0.72))
      .mul(1.25);

    // ————— 光幕段 · 体积光尘（柱域缓升内旋；强度吃光幕不透明度，恒阈下） —————
    const motePhase = clamp(this.uClock.sub(RING_IN).div(VEIL_IN + VEIL_OUT), 0, 1);
    const moteTheta = A.x.add(motePhase.mul(B.y));
    const moteR = A.y.mul(motePhase.mul(-0.3).add(1));
    const moteY = A.z.add(motePhase.mul(A.w));
    const motePos = vec3(cos(moteTheta).mul(moteR), moteY, sin(moteTheta).mul(moteR));
    const moteEnv = this.uVeil
      .mul(sin(this.uSpin.mul(B.z).add(A.x.mul(11))).mul(0.45).add(0.55))
      .mul(0.75);

    // ————— 落地段 · 余烬（触地迸散抛物线回落，闪烁衰减消散） —————
    const emberStagger = clamp(this.uSettle.sub(B.y).div(B.y.oneMinus()), 0, 1);
    const emberTheta = A.x.add(emberStagger.mul(B.w));
    const emberR = A.y.add(emberStagger.mul(A.z));
    const emberY = emberStagger.mul(emberStagger.oneMinus()).mul(4).mul(A.w).add(0.04);
    const emberPos = vec3(cos(emberTheta).mul(emberR), emberY, sin(emberTheta).mul(emberR));
    const emberEnv = smoothstep(0, 0.1, emberStagger)
      .mul(emberStagger.oneMinus().pow(1.7))
      .mul(sin(this.uSpin.mul(B.z).add(A.x.mul(23))).mul(0.35).add(0.65))
      .mul(1.7);

    // 位置（相对锚点，mesh 落位在 anchor）；四角色 select 链
    this.material.positionNode = select(
      isBurst,
      burstPos,
      select(isDebris, debrisPos, select(isMote, motePos, emberPos)),
    );

    // 点径包络：火花熄灭收缩 / 碎屑长条恒定 / 光尘缓涨（体积雾感）/ 余烬冷却收缩
    const burstScale = B.x.mul(burstAlpha.mul(-0.35).add(1));
    const moteScale = B.x.mul(motePhase.mul(0.4).add(1));
    const emberScale = B.x.mul(emberStagger.mul(-0.55).add(1));
    this.material.scaleNode = select(
      isBurst,
      vec2(burstScale),
      select(
        isDebris,
        vec2(B.x.mul(1.7), B.x.mul(0.5)), // 碎屑 = 长条金属屑（配合翻滚旋转）
        select(isMote, vec2(moteScale), vec2(emberScale)),
      ),
    );

    // 翻滚（碎屑主消费；圆点角色旋转不可见，无需分支）
    this.material.rotationNode = A.x.mul(17).add(this.uSpin.mul(B.w));

    this.material.colorNode = Fn(() => {
      const centered = uv().sub(0.5).mul(2);
      const d = centered.length();
      // 光尘 = 全软雾点（体积感）；火花/碎屑/余烬 = 软缘 + 热核微点
      const disc = smoothstep(1.0, select(isMote, float(0.0), float(0.3)), d);
      const core = smoothstep(0.42, 0.0, d).mul(select(isMote, float(0.15), float(0.75)));
      const env = select(isBurst, burstEnv, select(isDebris, debrisEnv, select(isMote, moteEnv, emberEnv)));
      return tint
        .mul(disc.add(core))
        .mul(env)
        .mul(this.uIntensity)
        .mul(fxMaster);
    })();

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, TOTAL_INSTANCES);
    this.mesh.name = 'transform-fx-particles';
    this.mesh.frustumCulled = false; // 实例位置在 shader 内，几何包围盒失真（FlightTrails 同款）
    this.mesh.position.set(options.anchor.x, 0, options.anchor.z);
    this.mesh.visible = false; // 窗外恒不画（CITY-03 瞬态席合同 + poster 恒等合同）
    game.scene.add(this.mesh);

    // 取证/审计面（#debug 页面侧句柄，cityFlightTrails 同协议）
    game.scene.userData.transformFx = { setParticles: setTransformParticles };

    console.info(
      `[transform-fx] 变形窗粒子层就绪：${TOTAL_INSTANCES} 实例` +
        '（喷发 90/碎屑 60/光幕尘 60/余烬 90）单 InstancedMesh 1 draw call——' +
        `Q0 ${TOTAL_INSTANCES}/Q1 ${Q1_INSTANCES}/Q2 0；reduced-motion 不构造（instant swap 零粒子）`,
    );
  }

  /** 变形起拍（TransformSystem.transform 建 ritual 同帧）：按品质档定量放粒 */
  begin(level: QualityLevel): void {
    const count = level === 0 ? TOTAL_INSTANCES : level === 1 ? Q1_INSTANCES : 0;
    this.mesh.count = count;
    this.mesh.visible = count > 0; // Q2 明确关闭：不是调暗而是不画
    this.uIntensity.value = level === 1 ? 0.85 : 1;
    this.uClock.value = 0;
    this.uSpin.value = 0;
    this.uRingScale.value = 0;
    this.uRing.value = 0;
    this.uVeil.value = 0;
    this.uSettle.value = 0;
  }

  /**
   * 节拍同步（TransformSystem.update 每帧末尾调用；全部入参为该帧既有中间量，
   * 本方法零计算零分配——粒子层对时间轴严格只读）。
   * @param clock ritual 时钟（holding 冻结）  @param spin ringSpin（holding 仍走）
   * @param ringScale 环展开 0→1  @param ringOpacity 环不透明度（落地随环消散）
   * @param veil 光幕不透明度  @param settle 余烬归一进度（触地门控后 0→1）
   */
  frame(
    clock: number,
    spin: number,
    ringScale: number,
    ringOpacity: number,
    veil: number,
    settle: number,
  ): void {
    this.uClock.value = clock;
    this.uSpin.value = spin;
    this.uRingScale.value = ringScale;
    this.uRing.value = ringOpacity;
    this.uVeil.value = veil;
    this.uSettle.value = settle;
  }

  /** 变形收拍（completeRun 同帧）：隐藏 + 节拍归零——窗外零贡献合同 */
  end(): void {
    this.mesh.visible = false;
    this.uRing.value = 0;
    this.uVeil.value = 0;
    this.uSettle.value = 0;
  }

  /** dispose 闭合（TransformSystem.dispose 链式）：GPU 资源 + 取证句柄零残留 */
  dispose(): void {
    this.mesh.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
    delete this.game.scene.userData.transformFx;
  }
}
