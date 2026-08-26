// [CC-L2-B1] 五栋 hero 楼可读招牌（视觉 rubric §6 Tier B1；AL2-a-plus 审计放行项）。
// rubric 原文：「TextCanvas（E9 已建管线）出楼名纹理 → 双面全息板替换占位箍带，
// 5 栋 hero 先行」——本文件即该替换，每栋两件套：
//   ① 楼顶双面全息板：title.en 楼名纹理悬浮楼顶（慢呼吸脉动，继承被替换箍带的
//      「招牌脉动」配额席位——CITY-03 ≤2 处不变：HeroRobot idle + 本件）；
//   ② 临街立面灯箱招牌：常亮面板挂在面向主轴道路的立面（主机位帧内可读——
//      楼顶板在 96m 塔上出画框，街面认楼由本件承接）。
// 文字 = TextCanvas（Canvas 2D 系统等宽字体栈，零外部字体文件零网络请求）；
// 颜色 = buildings JSON neonColor（A3 色纪律：neonColor 保留给「楼宇身份件」——
// 招牌/信标/大堂光带，窗格另走三族 palette）。
// draw call 台账：每栋 = 全息板 1 + 立面灯箱合并几何 1（多面共享同一纹理/材质，
// mergeGeometries 合一次 draw）→ 5 栋共 10 draw call。纯视觉无物理（招牌不碰撞）。
import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Game } from '../core/Game';
import type { Building, CyberCityMap } from './CityMap';
import { hashStringToSeed } from './CityMap';
import { createHoloSignMaterial, createSignPanelMaterial } from './NeonFacade';
import { TextCanvas } from '../world/TextCanvas';

/** 立面招牌只挂「面向主轴道路」的面：楼心到该轴距离超过此值视为不临街（concept-garage
 *  x=140 距南北大道过远，只保留朝东西大街的南立面招牌） */
const ROAD_FACING_MAX = 100;

/** 立面招牌离幕墙面外扩（米）：防 z-fighting，远机位不可辨 */
const PANEL_PROUD = 0.35;

interface FacadeSlot {
  /** 面法向的 Y 旋转（PlaneGeometry 默认法向 +Z） */
  rotationY: number;
  /** 面板中心本地坐标（y 由挂高决定） */
  offset: { x: number; z: number };
  /** 该立面可用宽度（米，面板宽度上限的基数） */
  facadeWidth: number;
}

export class BuildingSigns {
  /** 已挂招牌的楼 id 清单（调试/取证读数用） */
  readonly buildingIds: string[] = [];
  /** 立面灯箱面数合计（draw call 台账核对用） */
  panelFaceCount = 0;

  private readonly game: Game;

  constructor(game: Game, map: CyberCityMap) {
    this.game = game;

    for (const building of map.buildings) {
      if (building.lodProfile !== 'hero') continue;
      this.addSigns(building);
      this.buildingIds.push(building.id);
    }
  }

  private addSigns(building: Building): void {
    const { w, d, h } = building.footprint;
    const { x, z, rotationY } = building.position;
    const seed = hashStringToSeed(building.id);

    // 楼名纹理（系统等宽栈大写，零外部字体；单行自动量宽）
    const canvas = new TextCanvas({
      fontWeight: '700',
      fontSize: 56,
      height: 76,
      paddingLeft: 22,
      paddingRight: 22,
    });
    canvas.updateText(building.title.en.toUpperCase());
    const aspect = canvas.aspect;

    // 本地坐标系：原点 = 楼底中心（区别于 ThemeTowers 的楼体中心原点——招牌挂高
    // 直接用离地米数，免 h/2 换算）；随楼体 rotationY 整组旋转
    const group = new THREE.Group();
    group.name = `city-signs-${building.id}`;
    group.position.set(x, 0, z);
    group.rotation.y = (rotationY * Math.PI) / 180;

    // ① 面向主轴道路的立面槽位（内环四塔各 2 面、concept-garage 1 面）
    const slots: FacadeSlot[] = [];
    if (Math.abs(x) <= ROAD_FACING_MAX) {
      slots.push(
        x > 0
          ? { rotationY: -Math.PI / 2, offset: { x: -(w / 2 + PANEL_PROUD), z: 0 }, facadeWidth: d }
          : { rotationY: Math.PI / 2, offset: { x: w / 2 + PANEL_PROUD, z: 0 }, facadeWidth: d },
      );
    }
    if (Math.abs(z) <= ROAD_FACING_MAX) {
      slots.push(
        z > 0
          ? { rotationY: Math.PI, offset: { x: 0, z: -(d / 2 + PANEL_PROUD) }, facadeWidth: w }
          : { rotationY: 0, offset: { x: 0, z: d / 2 + PANEL_PROUD }, facadeWidth: w },
      );
    }

    // ② 立面灯箱：挂高压在双阶收分楼的下段满宽区（lower ≥ 0.56h，25 < 0.56×55）
    const mountY = Math.min(25, Math.max(9, h * 0.34));
    const quads: THREE.BufferGeometry[] = [];
    for (const slot of slots) {
      // 面板高按楼高取档，宽 = 高 × 纹理宽高比；超立面 80% 时整体等比缩
      let panelH = Math.min(3.6, Math.max(2.2, h * 0.055));
      let panelW = panelH * aspect;
      const maxW = slot.facadeWidth * 0.8;
      if (panelW > maxW) {
        panelH *= maxW / panelW;
        panelW = maxW;
      }

      const quad = new THREE.PlaneGeometry(1, 1);
      quad.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(slot.offset.x, mountY, slot.offset.z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, slot.rotationY, 0)),
          new THREE.Vector3(panelW, panelH, 1),
        ),
      );
      quads.push(quad);
    }
    if (quads.length > 0) {
      const panelMesh = new THREE.Mesh(
        mergeGeometries(quads),
        createSignPanelMaterial(canvas.texture, building.neonColor),
      );
      panelMesh.name = `city-sign-panels-${building.id}`;
      group.add(panelMesh);
      this.panelFaceCount += quads.length;
    }

    // ③ 楼顶双面全息板：内环双临街塔朝路口对角（双面板正/背各覆一个来向），
    //    单临街楼（garage）正对其道路
    const boardH = Math.min(5, Math.max(2.6, h * 0.075));
    const boardW = Math.min(Math.max(w, d) * 0.92, boardH * aspect);
    // 本地旋转：双临街塔取「朝路口」世界向再扣除楼体自转；单临街楼直接沿用立面槽位
    const boardRotationY =
      slots.length >= 2
        ? Math.atan2(-x, -z) - (rotationY * Math.PI) / 180
        : (slots[0]?.rotationY ?? 0);

    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(boardW, boardH),
      createHoloSignMaterial(canvas.texture, building.neonColor, { phase: seed % 6 }),
    );
    board.name = `city-sign-holo-${building.id}`;
    board.position.set(0, h + 1.1 + boardH / 2, 0);
    board.rotation.y = boardRotationY;
    group.add(board);

    this.game.scene.add(group);
  }
}
