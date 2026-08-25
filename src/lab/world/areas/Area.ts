// 移植改造自 folio-2025 sources/Game/World/Areas/Area.js（177 行，MIT，
// vendor/README.md 记录 commit 41046b5）。POI 区域基类三件套 → 本站两件半：
//   setBounding —— 触发圈：game.zones 圆柱触发器（enter/leave → boundingIn/Out 事件）
//                  ★ folio 原样（数据源从 Blender 'zoneBounding' 参考节点改为
//                    显式构造参数——CC-E9 纪律：坐标一律来自 JSON 单源，零 glb 依赖）；
//   setFrustum  —— 视野剔除：区域圆 vs 相机视野最优区，出画 hideable 整组 visible=false
//                  ★ 判定改圆-圆相交近似：folio 用 circleIntersectsPolygon 对
//                    view.optimalArea.quad2 四边形，本站 View 精简版无 quad2，
//                    改用既有 optimalArea.position/radius（外接圆，偏保守=宁显勿隐）；
//   setObjects  —— 砍除：folio 从 areas.glb 子节点批量 objects.addFromModel；
//                  本站楼体/碰撞体归 city/ 系统（CC-E3 数据驱动），基类只保留
//                  addHideable() 接缝供视觉件挂进剔除组（Phase B 接回 glb 时再补）。
// 去 Game 单例（构造注入）；tick order 10 原样（区域逻辑在 zones(8)/points(9) 后）。
import * as THREE from 'three/webgpu';
import { Events } from '../core/Events';
import type { Game } from '../core/Game';
import type { Zone } from '../world/Zones';

export interface AreaOptions {
  /** 稳定机器键（POI 场景 = buildings JSON id） */
  id: string;
  /** 触发圈（世界 XZ 平面圆柱，米）——POI 场景 = buildings JSON parkingBay */
  bounding: { x: number; z: number; radius: number };
  /** 视野剔除圆（缺省 = 不剔除，hideable 恒可见） */
  frustum?: { x: number; z: number; radius: number } | null;
}

export class Area {
  protected readonly game: Game;
  readonly id: string;
  readonly events = new Events();

  /** 玩家是否在触发圈内（boundingIn/boundingOut 之间为 true） */
  isIn = false;
  readonly zone: Zone;

  /** 出画整组隐藏的视觉件（不含物理体；folio objects.hideable 语义） */
  readonly hideable: THREE.Object3D[] = [];

  private frustum: {
    position: THREE.Vector2;
    radius: number;
    isIn: boolean | null;
    alwaysVisible: boolean;
  } | null = null;

  /** 子类每帧钩子（仅视野内执行，folio update() 语义） */
  protected onUpdate: (() => void) | null = null;

  constructor(game: Game, options: AreaOptions) {
    this.game = game;
    this.id = options.id;

    // —— setBounding（folio L72-102 原样，数据源换构造参数）——
    this.zone = this.game.zones.create(
      'cylinder',
      new THREE.Vector3(options.bounding.x, 0, options.bounding.z),
      options.bounding.radius,
    );

    this.zone.events.on('enter', () => {
      this.isIn = true;
      this.events.trigger('boundingIn', [this]);
    });

    this.zone.events.on('leave', () => {
      this.isIn = false;
      this.events.trigger('boundingOut', [this]);
    });

    // —— setFrustum（folio L104-177，判定换圆-圆近似）——
    if (options.frustum) {
      this.frustum = {
        position: new THREE.Vector2(options.frustum.x, options.frustum.z),
        radius: options.frustum.radius,
        isIn: null,
        alwaysVisible: false,
      };
    }

    this.game.ticker.events.on(
      'tick',
      () => {
        if (this.frustum) this.testFrustum();
        if (this.onUpdate && (!this.frustum || this.frustum.isIn)) this.onUpdate();
      },
      10, // order 10：区域逻辑在 zones(8) / points(9) 之后（§12 tick order 全表）
    );
  }

  addHideable(object3D: THREE.Object3D): void {
    this.hideable.push(object3D);
    // 初始态与当前判定对齐（挂晚了不闪帧）
    if (this.frustum && this.frustum.isIn === false) object3D.visible = false;
  }

  private testFrustum(): void {
    const frustum = this.frustum as NonNullable<Area['frustum']>;
    const optimalArea = this.game.view.optimalArea;

    // 圆-圆相交：区域圆 vs 视野最优区外接圆（folio quad2 多边形判定的保守近似）
    const isVisible =
      frustum.alwaysVisible ||
      Math.hypot(
        frustum.position.x - optimalArea.position.x,
        frustum.position.y - optimalArea.position.z,
      ) <
        frustum.radius + optimalArea.radius;

    if (isVisible) {
      if (frustum.isIn !== true) {
        for (const object3D of this.hideable) object3D.visible = true;
        frustum.isIn = true;
        this.events.trigger('frustumIn', [this]);
      }
    } else if (frustum.isIn !== false) {
      for (const object3D of this.hideable) object3D.visible = false;
      frustum.isIn = false;
      this.events.trigger('frustumOut', [this]);
    }
  }
}
