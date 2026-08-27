// [CC-VIS-X3] 全息广告板 4 块（design-confirm §4.2 第三件：「3-5 块，默认静帧
// 零配额，轮播变体不在本批」）。街道叙事密度层：沿两主轴路缘外浮空的产品线
// 广告板——V4 招牌密度成层 + V7 叙事道具入帧，全息无实体（不设碰撞，与路障
// 同一「全息=可穿」拟真口径；摆位全部路面带外 + 远离全部 parkingBay 触发圈）。
// 纪律：
//   · 静帧：材质零时间项（createHoloAdBoardMaterial——无呼吸/无滚动，CITY-03
//     循环动画配额零占用；R3 台账恒 3 席）；
//   · 色相 = neon-tokens 单源按路轴取族（南北=青 / 东西=品红，StreetLamps 同表；
//     A3 纪律：楼 neonColor 只归楼宇身份件，广告板不是）；
//   · draw call = 1（4 块 quad 合并几何 + 共享图集 + 'signColor' attribute 逐板
//     着色；O4 哨兵台账：招牌域合计 10→11，增量 +10% < +20% 阈值）；
//   · stagger：整组一支 lit uniform，SignageIgnition 点亮序列的尾拍。
import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NEON } from '../../../data/neon-tokens';
import type { Game } from '../core/Game';
import { createHoloAdBoardMaterial, createSignLitUniform, type SignLitUniform } from './NeonFacade';
import type { AdBoardContent } from './SignageAtlas';
import { composeAdBoardAtlas } from './SignageAtlas';

interface AdBoardSpot {
  x: number;
  z: number;
  /** 板面法向的 Y 旋转（PlaneGeometry 默认法向 +Z，朝路面/来车向） */
  rotationY: number;
  /** 色族 = 所属道路轴（南北=青 / 东西=品红，neon-tokens 单源） */
  axis: 'north-south' | 'east-west';
  content: AdBoardContent;
}

/** 板面尺寸（米）：7×4 = 图集行 448×256 同宽高比（字形不变形） */
const BOARD_W = 7;
const BOARD_H = 4;
/** 板面中心离地（米）：底缘 ~4.1m，驾驶/首幕机位平视带 */
const BOARD_Y = 6.1;

/**
 * 摆位台账（路缘外 |轴距| 15.8m > halfWidth 12 + 灯杆线 13.5；已核对全部
 * parkingBay 触发圈 ≥12m、全部灯杆位 ≥8m）：
 *   A/B 北向路廊两翼（首幕机位帧内，出生点朝北）· D 南段——南北大道青族；
 *   C concept-garage 引路段（VIS-04 深链帧内）——东西大街品红族。
 * 文案 = 产品线交叉引流（楼=产品线的街面回声，与 PRODUCT_LINES 同轴措辞）。
 */
const SPOTS: AdBoardSpot[] = [
  {
    x: -15.8,
    z: -46,
    rotationY: Math.PI / 2,
    axis: 'north-south',
    content: { headline: 'MASTER AGENT', tagline: 'AI CORE DISTRICT · N', icon: 'agent' },
  },
  {
    x: 15.8,
    z: -70,
    rotationY: -Math.PI / 2,
    axis: 'north-south',
    content: { headline: 'AUTODRIVE', tagline: 'ROAD CASES LIVE', icon: 'radar' },
  },
  {
    x: 76,
    z: 15.8,
    rotationY: Math.PI,
    axis: 'east-west',
    content: { headline: 'CAR CONFIG', tagline: 'GARAGE · 140 EAST', icon: 'car' },
  },
  {
    x: -15.8,
    z: 40,
    rotationY: Math.PI / 2,
    axis: 'north-south',
    content: { headline: '39 LANGS', tagline: 'TTS + L10N COCKPIT', icon: 'lang' },
  },
];

export class AdBoards {
  /** 摆位清单（调试/取证读数用） */
  readonly spots: readonly AdBoardSpot[] = SPOTS;
  /** [CC-VIS-X3] stagger 点亮通道（整组一支，点亮序列尾拍；缺省恒 1 常亮） */
  readonly lit: SignLitUniform;

  constructor(game: Game) {
    this.lit = createSignLitUniform();

    const { texture, regions } = composeAdBoardAtlas(SPOTS.map((spot) => spot.content));

    const quads: THREE.BufferGeometry[] = [];
    SPOTS.forEach((spot, i) => {
      const region = regions[i]!;
      const quad = new THREE.PlaneGeometry(BOARD_W, BOARD_H);

      // uv 预编码图集行（v 向下采样空间）+ uvLocal 本地框 + signColor 逐板色族
      const uvAttr = quad.getAttribute('uv') as THREE.BufferAttribute;
      const local = new Float32Array(uvAttr.count * 2);
      const colors = new Float32Array(uvAttr.count * 3);
      const tint = new THREE.Color(spot.axis === 'north-south' ? NEON.cyan : NEON.magenta)
        .convertSRGBToLinear();
      for (let v = 0; v < uvAttr.count; v++) {
        const uu = uvAttr.getX(v);
        const vv = uvAttr.getY(v);
        local[v * 2] = uu;
        local[v * 2 + 1] = vv;
        uvAttr.setXY(v, region.u0 + uu * (region.u1 - region.u0), region.v0 + (1 - vv) * (region.v1 - region.v0));
        colors[v * 3] = tint.r;
        colors[v * 3 + 1] = tint.g;
        colors[v * 3 + 2] = tint.b;
      }
      quad.setAttribute('uvLocal', new THREE.BufferAttribute(local, 2));
      quad.setAttribute('signColor', new THREE.BufferAttribute(colors, 3));

      quad.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(spot.x, BOARD_Y, spot.z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, spot.rotationY, 0)),
          new THREE.Vector3(1, 1, 1),
        ),
      );
      quads.push(quad);
    });

    const mesh = new THREE.Mesh(
      mergeGeometries(quads),
      createHoloAdBoardMaterial(texture, { lit: this.lit }),
    );
    mesh.name = 'city-ad-boards';
    game.scene.add(mesh);
  }
}
