// [CC-L3-B3] 中远景飞行光轨（视觉 rubric §6 Tier B3「飞行光轨粒子层：中远景
// 2-3 条航线 additive 拖尾」；AL3-MID 裁决 V4 为剩余瓶颈后的条件批）。
// PRD CITY-03 描述项「飞行光轨粒子」的落地件——设计提案 §3.2 原案 ≤800 点。
//
// CITY-03 循环动画配额（书面登记见 cyber-city-eng-wave1-notes.md「CC-L3-B3」小节，
// A4 观察 B 口径收口）：本系统整体计 1 席（3/3）——计席口径 = 帧内可见的持续
// 时间性动画，与驱动源无关（shader time 与 Ticker 同权，防「换驱动源绕配额」）。
//
// 任务书锁定参数（越界即撤）：
//   · 航线 3 条（M 中景环 / F 远景环 / H 西北远环），全部中远景——离首幕主体
//     最近点 ≥110m，不入近景不抢主体（机器人/招牌/HUD 层零遮挡）；
//   · 总点数 630 ≤ 800（M 150 + F 240 + H 240；F/H 各 2 架次错拍 π，M 单架次）；
//   · Q0 全效 3 航线 / Q1 简化 2 航线（实例尾段裁剪 mesh.count，CitySilhouette
//     同款技法）+ 强度 0.8 / **Q2 明确关闭**（mesh.visible=false + 强度/时间轴
//     双归零——不是「调暗」而是不画）；
//   · prefers-reduced-motion：时间轴冻结（timeScale=0，光轨定格为静态光带——
//     View thetaDrift/HeroRobot 头部环顾同款「偏好静止即静止」纪律）；
//   · dispose 随 Game：单 InstancedMesh 进 game.scene，Game.dispose 场景遍历
//     统一释放几何/材质（city 无独立 dispose 的既有纪律，零 Ticker 订阅零监听器）。
//
// 实现形态：单 InstancedMesh(PlaneGeometry 1×1, SpriteNodeMaterial) = 全部航线
// 1 次 draw call。每实例 = 拖尾上一个 billboard 光点，位置在顶点级由航线参数
// （椭圆环 + 高度起伏）+ time 解析求出——零逐帧 JS update、零 CPU 写缓冲：
//   θ = phase0 + time·ω − tailT·signedSpan（tailT 0=机头 → 1=尾端，符号随 ω
//   使拖尾永远落在行进方向之后）；机头亮/大、尾端暗/小/微散（长曝光光轨读法）。
// 遮挡走深度测试（depthWrite=false 但 depthTest 保留）：光轨穿楼后即被楼体
// 剪影吞没，「城市里有东西在飞」的空间感由遮挡关系自证。
//
// 纪律对齐：
//   · additive + 逐点强度 ~0.3（机头叠加峰 ≈1.3 略过 bloom threshold=1 成小光晕，
//     拖尾快速跌落阈下——招牌 1.9-2.4 档的辉光名额不被挤占）；
//   · material.fog=false（additive 片元吃 scene.fogNode 会「加出雾灰」），
//     远景融入大气改为手工距离衰减（200-620m 渐暗 ×0.5，与 ATM 远景纱帘同带）；
//   · 色相纪律：航线只取 NEON.cyan / NEON.magenta 双主轴色族（neon-tokens 单源），
//     机头掺 40% 暖白读作「飞行器灯」——与窗色三族同轴，零新色相；
//   · 零贴图零资产（全程序化），frustumCulled=false（实例位置在 shader 内，
//     几何包围盒失真，Sky 穹顶同款处理）。
import * as THREE from 'three/webgpu';
import {
  Fn,
  cameraPosition,
  cos,
  float,
  hash,
  instanceIndex,
  instancedBufferAttribute,
  mix,
  sin,
  smoothstep,
  time,
  uniform,
  uv,
  vec3,
} from 'three/tsl';
import { NEON } from '../../../data/neon-tokens';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';

/** 机头暖白（与窗色三族 warmWhite 同值语义——「飞行器灯」不是第四色相） */
const HEAD_WARM_WHITE = '#f5decb';

/**
 * 品质/取证共享 uniform（模块级单例，atmosphereUniforms/neonUniforms 同款纪律：
 * 切档/开关 = uniform 写入，零材质重建零 shader 重编译）。
 * intensity：光轨强度——Q0 1 / Q1 0.8 / Q2 0；
 * timeScale：时间轴——Q2 与 prefers-reduced-motion 冻结为 0（光轨定格）；
 * master：取证/审计开关（同机位「有光轨/无光轨」对照协议专用，quality 不写它）。
 */
const trailUniforms = {
  intensity: uniform(1),
  timeScale: uniform(1),
  master: uniform(1),
};

/**
 * [CC-L3-B3] 取证开关：0 = 关光轨（additive 加零 = 像素级等价于不存在），1 = 全开。
 * 页面侧经 #debug 句柄 `__worldSpikeGame.scene.userData.cityFlightTrails.setTrails(0|1)`
 * 调用（cityAtmosphere.setLayers 同款协议）。
 */
export function setFlightTrails(strength: number): void {
  trailUniforms.master.value = Math.min(1, Math.max(0, strength));
}

/** 航线定义（全部中远景：离原点最近点 M≈111m / F≈260m / H≈170m） */
interface RouteSpec {
  /** 环心 [x, 巡航高度 y, z]（米） */
  center: [number, number, number];
  /** 椭圆半轴（x/z，米） */
  rx: number;
  rz: number;
  /** 角速度 rad/s（符号 = 环行方向；线速度 ≈ ω×平均半径 ≈ 13-15m/s 巡航） */
  omega: number;
  /** 高度起伏振幅/频率（沿航线的正弦起伏——「飞行」而非「轨道」的路径语感） */
  wobbleAmp: number;
  wobbleFreq: number;
  /** 航线色（NEON 双主轴单源） */
  color: string;
  /** 架次起始角（弧度；多架次错拍） */
  heads: number[];
  /** 每架次拖尾点数 */
  pointsPerHead: number;
  /** 拖尾角跨度（rad；×平均半径 ≈ 24-27m 拖尾长） */
  tailSpan: number;
}

/**
 * 三条航线（坐标系：+X=东 +Z=南；首幕相机在东南 ~(8,8,17) 看西北，
 * 可见方位角 ≈ N57°W..N7°E，巡航高度按「画框顶 ≈ 仰角 +6°」压在
 * 首幕可见天空/远楼带内 3-5°）：
 *   M 中景环：内外环楼群之间的走廊（z -110..-220），品红、单架次——离主体最近
 *     （111m）也最醒目，穿行于 now-signal/autodrive-lab 楼隙（航线避楼核对过）；
 *   F 远景环：外环外侧、剪影带之前（z -260..-400），青、双架次对开——远景暗剪影
 *     上的亮线，与低云带/辉光同帧；
 *   H 西北远环：西北象限（agent-nexus 后方视野），青、双架次——画框左半的纵深层。
 */
const ROUTES: RouteSpec[] = [
  {
    center: [-15, 20, -165],
    rx: 120,
    rz: 55,
    omega: 0.16,
    wobbleAmp: 2.2,
    wobbleFreq: 3,
    color: NEON.magenta,
    heads: [2.6],
    pointsPerHead: 150,
    tailSpan: 0.28,
  },
  {
    center: [30, 30, -330],
    rx: 230,
    rz: 70,
    omega: -0.085,
    wobbleAmp: 3.0,
    wobbleFreq: 2,
    color: NEON.cyan,
    heads: [0.4, 0.4 + Math.PI],
    pointsPerHead: 120,
    tailSpan: 0.15,
  },
  {
    center: [-120, 26, -260],
    rx: 150,
    rz: 90,
    omega: 0.11,
    wobbleAmp: 2.6,
    wobbleFreq: 4,
    color: NEON.cyan,
    heads: [1.9, 1.9 + Math.PI],
    pointsPerHead: 120,
    tailSpan: 0.2,
  },
];

export class FlightTrails {
  readonly mesh: THREE.InstancedMesh;

  /** 总点数（预算合同 ≤800；console 装配行取证） */
  readonly pointCount: number;

  /** 航线数（Q0 全量；Q1 裁到前 2 条） */
  readonly routeCount = ROUTES.length;

  /** Q1 简化档保留的实例数（航线 M+F；实例按航线序写入，裁尾即裁航线 H） */
  private readonly q1Count: number;

  constructor(game: Game) {
    const total = ROUTES.reduce((n, r) => n + r.heads.length * r.pointsPerHead, 0);
    this.pointCount = total;
    this.q1Count = ROUTES.slice(0, 2).reduce((n, r) => n + r.heads.length * r.pointsPerHead, 0);

    // 每实例航线/拖尾参数（route-major 写入序 = Q1 mesh.count 裁尾合同）
    const routeArr = new Float32Array(total * 4); // cx, cy, cz, omega
    const shapeArr = new Float32Array(total * 4); // rx, rz, wobbleAmp, wobbleFreq
    const pointArr = new Float32Array(total * 4); // phase0, tailT, signedSpan, rand
    const colorArr = new Float32Array(total * 3); // 航线色（线性空间）

    let i = 0;
    for (const route of ROUTES) {
      const linear = new THREE.Color(route.color).convertSRGBToLinear();
      for (const headPhase of route.heads) {
        for (let p = 0; p < route.pointsPerHead; p += 1) {
          const tailT = route.pointsPerHead === 1 ? 0 : p / (route.pointsPerHead - 1);
          routeArr.set([route.center[0], route.center[1], route.center[2], route.omega], i * 4);
          shapeArr.set([route.rx, route.rz, route.wobbleAmp, route.wobbleFreq], i * 4);
          pointArr.set(
            [headPhase, tailT, route.tailSpan * Math.sign(route.omega), (i * 0.618) % 1],
            i * 4,
          );
          colorArr.set([linear.r, linear.g, linear.b], i * 3);
          i += 1;
        }
      }
    }

    const geometry = new THREE.PlaneGeometry(1, 1);
    const iRoute = new THREE.InstancedBufferAttribute(routeArr, 4);
    const iShape = new THREE.InstancedBufferAttribute(shapeArr, 4);
    const iPoint = new THREE.InstancedBufferAttribute(pointArr, 4);
    const iColor = new THREE.InstancedBufferAttribute(colorArr, 3);
    geometry.setAttribute('trailRoute', iRoute);
    geometry.setAttribute('trailShape', iShape);
    geometry.setAttribute('trailPoint', iPoint);
    geometry.setAttribute('trailColor', iColor);

    const material = new THREE.SpriteNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    material.fog = false; // additive 片元吃 fogNode 会「加出雾灰」——距离衰减手工做

    // 显式节点类型（TS 面拿回类型化 swizzle；运行时与 BufferAttribute 推断同构）
    const route = instancedBufferAttribute<'vec4'>(iRoute, 'vec4');
    const shape = instancedBufferAttribute<'vec4'>(iShape, 'vec4');
    const point = instancedBufferAttribute<'vec4'>(iPoint, 'vec4');
    const color = instancedBufferAttribute<'vec3'>(iColor, 'vec3');

    // 航线点位（顶点/片元两处各自展开同一表达式——SpriteNodeMaterial 的 positionNode
    // 走独立 view-space 通路，positionWorld varying 不携带它，距离衰减需自算）
    const trailPosition = Fn(() => {
      const theta = point.x
        .add(time.mul(trailUniforms.timeScale).mul(route.w))
        .sub(point.y.mul(point.z));
      // 尾端微散（长曝光拖尾的「排气」发散：机头 0.08m 收束 → 尾端 ~1.4m）
      const seed = hash(instanceIndex.toFloat().add(point.w));
      const spread = point.y.mul(1.3).add(0.08);
      const jitter = vec3(
        hash(seed.mul(127.1)).sub(0.5),
        hash(seed.mul(311.7)).sub(0.5).mul(0.6),
        hash(seed.mul(74.7)).sub(0.5),
      ).mul(spread);
      return vec3(
        route.x.add(cos(theta).mul(shape.x)),
        route.y.add(sin(theta.mul(shape.w).add(point.x)).mul(shape.z)),
        route.z.add(sin(theta).mul(shape.y)),
      ).add(jitter);
    });

    material.positionNode = trailPosition();

    // 点径：机头 2.0m → 尾端 0.62m（±15% 逐点抖动防「机械珠串」）
    material.scaleNode = Fn(() => {
      const sizeJitter = hash(instanceIndex.toFloat().mul(2.417)).mul(0.3).add(0.85);
      return mix(float(2.0), float(0.62), smoothstep(0, 1, point.y)).mul(sizeJitter);
    })();

    material.colorNode = Fn(() => {
      // billboard 圆形软点（PlaneGeometry uv 0..1，中心径向衰减）
      const radial = uv().sub(0.5).length();
      const disc = smoothstep(0.5, 0.1, radial);

      // 拖尾强度：机头 1 → 尾端二次衰减；机头前 12% 追加 1.6× 闪亮（「灯」的读法）
      const fade = point.y.oneMinus().pow(2);
      const headFlare = smoothstep(0.12, 0.0, point.y).mul(1.6).add(1);

      // 远景融入大气：与 ATM 远景纱帘同带（200-620m）手工渐暗 ×0.5
      const dist = trailPosition().sub(cameraPosition).length();
      const atmosphericDim = smoothstep(200, 620, dist).mul(0.5).oneMinus();

      // 机头掺暖白（40%）：色相仍锁双主轴，机头读作飞行器灯而非纯霓虹
      const warm = new THREE.Color(HEAD_WARM_WHITE).convertSRGBToLinear();
      const headMix = smoothstep(0.06, 0.0, point.y).mul(0.4);
      const tinted = mix(color, vec3(warm.r, warm.g, warm.b), headMix);

      return tinted
        .mul(disc)
        .mul(fade)
        .mul(headFlare)
        .mul(0.3)
        .mul(atmosphericDim)
        .mul(trailUniforms.intensity)
        .mul(trailUniforms.master);
    })();

    this.mesh = new THREE.InstancedMesh(geometry, material, total);
    this.mesh.name = 'city-flight-trails';
    this.mesh.frustumCulled = false; // 实例位置在 shader 内，几何包围盒失真（Sky 同款）
    game.scene.add(this.mesh);

    // prefers-reduced-motion：时间轴冻结（View thetaDrift 同款「偏好静止即静止」）
    const reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) trailUniforms.timeScale.value = 0;

    // 取证/审计面（#debug 页面侧句柄，cityAtmosphere 同协议）
    game.scene.userData.cityFlightTrails = { setTrails: setFlightTrails };
  }

  /**
   * 品质分档（city 装配段接 quality.events 调用；幂等）：
   * Q0 全效 3 航线 / Q1 2 航线（mesh.count 裁尾）+ 强度 0.8 / Q2 明确关闭
   * （不画 + 强度/时间轴双归零）。reduced-motion 冻结优先级高于档位恢复。
   */
  applyQuality(level: QualityLevel): void {
    const reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mesh.visible = level !== 2;
    this.mesh.count = level === 0 ? this.pointCount : level === 1 ? this.q1Count : 0;
    trailUniforms.intensity.value = level === 0 ? 1 : level === 1 ? 0.8 : 0;
    trailUniforms.timeScale.value = level === 2 || reducedMotion ? 0 : 1;
  }
}
