// [CC-L2-B2] 街道灯杆 + 沿街广告灯箱（视觉 rubric §6 Tier B2；AL2-a-plus 审计
// 放行项，10 件 ≤ 「6-10 件」上限）。街道层此前只有路缘光与 8 只隔离墩——本层
// 补上垂直街道家具：暗金属灯杆 + 悬臂灯头 + 杆侧挂旗式广告灯箱，全部常亮
// （无时间项，不占 CITY-03 循环动画配额）。AL2-a-plus §5 裁决第 1 条：灯箱给
// 湿地面提供有语义的反射源——Q0 的 Grid/Roads 共享 reflector 是真镜像渲染，
// 灯头/灯箱发光自动入水，零额外接线。
// [CC-L3-content] 挂旗灯箱补可读广告内容（AL2 终审 §7 非阻塞保留项 #2 收口，
// rubric B2 施工说明「灯箱纹理走 TextCanvas 程序化」原文兑现）：10 件各有差异的
// 竖排霓虹标语（与产品线/楼名弱关联，见 SLOGANS 表）合打 1 张 TextCanvas atlas
// （系统等宽字体栈，零外部字体文件零网络请求），材质按 instanceIndex 逐灯选行。
// 纪律：
//   · InstancedMesh 1-2 draw call（rubric B2 原文）：杆+臂+灯头+灯箱合并为
//     1 份几何，按路轴色族分 2 个 InstancedMesh（青=南北 / 品红=东西）；
//     广告内容走共享 atlas + instanceIndex 选行，draw call 台账不变（仍 2）；
//   · neon 色单源：色 hex 走 src/data/neon-tokens.ts（Roads/壳 CSS 同一出处），
//     材质工厂 createStreetLampMaterial 在 NeonMaterials（单材质系统纪律）；
//   · 物理 = 1 个 fixed 刚体挂 10 个 cylinder 碰撞体（StreetProps 隔离墩同款
//     model:null 注册）——撞杆有反馈；
//   · 摆位全部路缘外 1.5m（halfWidth+1.5），已核对不侵入任何 parkingBay
//     触发圈（最近 = concept-garage bay 距 11m > 半径 8m）与隔离墩阵。
import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NEON } from '../../../data/neon-tokens';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';
import type { CyberCityMap } from './CityMap';
import { createStreetLampMaterial } from './NeonFacade';
import { TextCanvas } from '../world/TextCanvas';

const POLE_HEIGHT = 8.2;
const POLE_RADIUS = 0.2;
const ARM_LENGTH = 2.6;

/** 发光件局部包围带（材质掩码与几何布局共用一份常量，防错位） */
const HEAD_BAND = { y0: 7.3, y1: 7.8, xMin: 1.55 };
const BANNER_BAND = { y0: 3.6, y1: 6.2, xMin: 0.24 };

/** [CC-L3-content] 挂旗灯箱盒本地坐标（几何、材质掩码、广告 UV 三处单源） */
const BANNER_BOX = { x0: 0.24, x1: 1.28, y0: 3.65, y1: 6.15, depth: 0.12 };

/**
 * [CC-L3-content] 灯箱标语表（10 件各异，行序 = this.spots 摆位序 = atlas 行号）。
 * 文案与就近楼/产品线弱关联（AL2 §7 #2「补 TextCanvas 广告内容」验收口径）：
 * 南北大道 6 件（青族）沿 AI 中枢区/语言区，东西大街 4 件（品红族）沿出行/作品区。
 * 全大写 ≤8 字符（等宽 60px × atlas 行宽 308px 上限；短句出街读得快）；
 * 装饰字符只用等宽栈普遍在册的 »/→/·，不用 emoji 呈现字符（Chromium 会转彩色位图）。
 */
const SLOGANS = [
  'AI CORE', // (西,-34) agent-nexus 主智能体中枢
  'DRIVE', //   (东,-58) autodrive-lab 智驾实验楼
  'EDGE AI', // (西,-82) edge-cloud-hub 端云算力枢纽
  'FOUNDRY', // (东,-106) workflow-foundry 帧库 · 视频闭环车间
  'TTS LIVE', // (东,44) voice-pod 座舱语音舱
  '39 LANGS', // (西,68) lingua-tower 多语种方案塔
  'SAY HI »', // (-52,南) contact-beacon 联络信标塔
  'WORKS →', // (52,北) work-gallery 交付案例馆
  'GARAGE', //  (110,南) concept-garage 门前段（VIS-04 深链帧内）
  'TUNE-UP', // (150,北) 车配置器改装位
] as const;

/** atlas 行高 px：308/128 ≈ 2.41 ≈ 灯箱大面纵横比 2.5/1.04——旋转映射后字形不变形 */
const ATLAS_ROW_H = 128;
const ATLAS_WIDTH = 308;

interface LampSpot {
  x: number;
  z: number;
  /** 本地 +X（悬臂朝向）→ 世界的 Y 旋转：臂永远伸向路面上空 */
  rotationY: number;
  /** 色族 = 所属道路轴（南北=青 / 东西=品红，Roads ROAD_NEON 同表） */
  axis: 'north-south' | 'east-west';
}

export class StreetLamps {
  /** 灯杆阵物理体（10 个 cylinder 碰撞体合一个 fixed 刚体） */
  lampBody: WorldObject | null = null;
  /** 灯位清单（调试/取证读数用） */
  readonly spots: LampSpot[] = [];
  /** [CC-L3-content] 灯箱标语清单（取证读数用；行序 = spots 序） */
  readonly slogans: readonly string[] = SLOGANS;

  private readonly game: Game;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    const northSouth = map.world.roads.find((road) => road.axis === 'north-south');
    const eastWest = map.world.roads.find((road) => road.axis === 'east-west');
    if (!northSouth || !eastWest) return; // Roads 构造器已抛错兜底

    // 路缘外 1.5m 的灯杆线（路面带 ±halfWidth，臂长 2.6m 探入路面上空 ~1m）
    const nsCurb = northSouth.halfWidth + 1.5;
    const ewCurb = eastWest.halfWidth + 1.5;

    // 南北大道 6 杆：北向路廊 4 杆左右交错（主机位帧内纵深节奏），南段 2 杆；
    // 臂朝路心：西侧杆 rotY=0（+X=东），东侧杆 rotY=π（+X=西）
    for (const [side, z] of [
      [-1, -34],
      [1, -58],
      [-1, -82],
      [1, -106],
      [1, 44],
      [-1, 68],
    ] as const) {
      this.spots.push({
        x: side * nsCurb,
        z,
        rotationY: side < 0 ? 0 : Math.PI,
        axis: 'north-south',
      });
    }

    // 东西大街 4 杆：路口两翼 + concept-garage 门前段（VIS-04 深链帧内可见）；
    // 北侧杆（z<0）臂朝南 rotY=-π/2，南侧杆臂朝北 rotY=+π/2
    for (const [x, side] of [
      [-52, 1],
      [52, -1],
      [110, 1],
      [150, -1],
    ] as const) {
      this.spots.push({
        x,
        z: side * ewCurb,
        rotationY: side < 0 ? -Math.PI / 2 : Math.PI / 2,
        axis: 'east-west',
      });
    }

    this.setVisuals();
    this.setPhysical();
  }

  /** 杆+臂+灯头+灯箱合并几何（本地 +X = 臂朝向；发光带常量与材质掩码同源） */
  private buildLampGeometry(): THREE.BufferGeometry {
    const pole = new THREE.CylinderGeometry(0.13, POLE_RADIUS, POLE_HEIGHT, 8);
    pole.translate(0, POLE_HEIGHT / 2, 0);

    const arm = new THREE.BoxGeometry(ARM_LENGTH, 0.15, 0.15);
    arm.translate(ARM_LENGTH / 2 + 0.05, 8.0, 0);

    // 灯头盒：悬臂端下挂（y 7.38-7.72 ⊂ HEAD_BAND，x 1.7-3.2 > xMin）
    const head = new THREE.BoxGeometry(1.5, 0.34, 0.5);
    head.translate(2.45, 7.55, 0);

    // 挂旗式广告灯箱：杆侧竖版（BANNER_BOX 单源 ⊂ BANNER_BAND；
    // 大面朝本地 ±Z = 沿路方向，行车/主机位正视可读）
    const banner = new THREE.BoxGeometry(
      BANNER_BOX.x1 - BANNER_BOX.x0,
      BANNER_BOX.y1 - BANNER_BOX.y0,
      BANNER_BOX.depth,
    );
    banner.translate((BANNER_BOX.x0 + BANNER_BOX.x1) / 2, (BANNER_BOX.y0 + BANNER_BOX.y1) / 2, 0);

    return mergeGeometries([pole, arm, head, banner]);
  }

  /**
   * [CC-L3-content] 标语 atlas：10 行等高纵向堆叠的单张 TextCanvas 纹理
   * （黑底白字 mask，材质侧按 instanceIndex 选行并旋转 90° 竖排映射）。
   * TextCanvas 多行绘制 = 行距均匀居中，height=rows×lineHeight 时行带与
   * 采样带精确对齐。文字之外补一笔行内装饰线（偶数行细通栏 / 奇数行短粗条），
   * 给灯箱「广告排版」层次——同画布后画，不扰动文字，仍零外部资产。
   */
  private buildAdsAtlas(): THREE.Texture {
    const canvas = new TextCanvas({
      fontWeight: '700',
      fontSize: 60,
      width: ATLAS_WIDTH,
      height: SLOGANS.length * ATLAS_ROW_H,
      lineHeight: ATLAS_ROW_H,
    });
    canvas.updateText([...SLOGANS]);

    const ctx = canvas.canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = '#ffffff';
    SLOGANS.forEach((_, i) => {
      const centerY = (i + 0.5) * ATLAS_ROW_H;
      if (i % 2 === 0) ctx.fillRect(ATLAS_WIDTH / 2 - 92, centerY + 40, 184, 4);
      else ctx.fillRect(ATLAS_WIDTH / 2 - 40, centerY + 38, 80, 8);
    });
    canvas.texture.needsUpdate = true;

    return canvas.texture;
  }

  private setVisuals(): void {
    const geometry = this.buildLampGeometry();
    const adsAtlas = this.buildAdsAtlas();
    const dummy = new THREE.Object3D();

    for (const axis of ['north-south', 'east-west'] as const) {
      const spots = this.spots.filter((spot) => spot.axis === axis);
      if (spots.length === 0) continue;

      const mesh = new THREE.InstancedMesh(
        geometry,
        createStreetLampMaterial(axis === 'north-south' ? NEON.cyan : NEON.magenta, {
          head: HEAD_BAND,
          banner: BANNER_BAND,
          ads: {
            map: adsAtlas,
            rows: SLOGANS.length,
            // spots 序 = atlas 行序：南北块在前（行 0-5）、东西块在后（行 6-9）
            rowStart: this.spots.findIndex((spot) => spot.axis === axis),
            box: BANNER_BOX,
          },
        }),
        spots.length,
      );
      mesh.name = `city-street-lamps-${axis}`;
      mesh.castShadow = true;

      spots.forEach((spot, i) => {
        dummy.position.set(spot.x, 0, spot.z);
        dummy.rotation.set(0, spot.rotationY, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;

      this.game.scene.add(mesh);
    }
  }

  /** 10 个 cylinder 碰撞体合一个 fixed 刚体（Rapier cylinder(halfHeight, radius)） */
  private setPhysical(): void {
    this.lampBody = this.game.objects.add(null, {
      type: 'fixed',
      position: { x: 0, y: 0, z: 0 },
      friction: 0.4,
      restitution: 0.3,
      category: 'object',
      colliders: this.spots.map((spot) => ({
        shape: 'cylinder' as const,
        parameters: [POLE_HEIGHT / 2, POLE_RADIUS],
        position: { x: spot.x, y: POLE_HEIGHT / 2, z: spot.z },
      })),
    });
  }
}
