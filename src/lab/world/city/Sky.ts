// CC-L1 A1：天空穹顶 + 地平线辉光（视觉 rubric §6 Tier A1；AL0 审计 §8「天空渐变 +
// 地平线辉光，并同步雾色」）。思路参照 three.js r185 webgpu_generator_city 的
// SkyMesh 极简版（只借「反面大球 + 垂直渐变」结构，着色为本站霓虹色轴自写）：
//   · 反面球体（BackSide）罩住可驾驶域（道路 range ±260m，半径 700 < 相机 far 1000）；
//   · TSL 垂直渐变：天顶深蓝紫 → 地平线「光污染」辉光带（青⇄品红按方位混色，
//     与双主轴道路霓虹同源：南北=青 / 东西=品红，Roads ROAD_NEON 同表）；
//   · 强度纪律：全穹顶 < 1（bloom threshold=1 之下）——天空是环境不是光源，
//     辉光名额留给楼宇窗格/招牌/信标（Rendering.ts bloom 注释同款约定）；
//   · material.fog=false：穹顶自身不吃距离雾（雾色由 city/index.ts 与地平线带同步，
//     远景楼宇渐隐进辉光带而不是渐隐进纯黑）。
// 零贴图零资产（全程序化 TSL）；无逐帧 update——静态穹顶不占循环动画配额（CITY-03）。
import * as THREE from 'three/webgpu';
import { Fn, exp, mix, positionLocal, smoothstep, vec3 } from 'three/tsl';
import type { Game } from '../core/Game';

/** 与地平线辉光带同步的雾色（city/index.ts 建 Fog 时引用，单一事实源） */
export const SKY_FOG_COLOR = '#101c26';

/** 天顶色（scene.background 兜底同色：穹顶外的边角不露黑缝） */
export const SKY_ZENITH_COLOR = '#070810';

export class Sky {
  readonly mesh: THREE.Mesh;

  constructor(game: Game) {
    // 半径纪律：驾驶域最远 ±260m，700+260=960 < 相机 far 1000（挂城后已放宽），
    // 开到路障尽头穹顶仍完整包住视锥
    const geometry = new THREE.SphereGeometry(700, 32, 15);

    const material = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide });
    material.fog = false;
    material.depthWrite = false;

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
      // 霓虹大街，西/北侧青呼应南北中轴（Roads ROAD_NEON 同源色族）
      const glowCyan = vec3(0.10, 0.33, 0.33);
      const glowMagenta = vec3(0.30, 0.08, 0.22);
      const horizonGlow = mix(glowCyan, glowMagenta, smoothstep(-0.55, 0.55, direction.x));
      const band = exp(elevation.abs().mul(-5.5));

      return base.add(horizonGlow.mul(band).mul(0.85));
    })();

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = 'city-sky-dome';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1; // 最先画（opaque 排序按 renderOrder，Rendering 纪律）
    game.scene.add(this.mesh);
  }
}
