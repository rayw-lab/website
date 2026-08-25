// 移植自 folio-2025 sources/Game/Objects.js（362 行）。
// 「视觉 + 物理」复合对象注册表：物理→视觉位姿同步（tick order 4）、
// Blender 命名约定解析（physical/dynamic/kinematicPositionBased + trimesh/hull/cuboid*/tube*/ball*
// 子节点自动转碰撞体——Phase B 正式资产管线的地基，原样保留）、
// 掉出世界重置、远离视野休眠（读 View.optimalArea）。
// 改动：去 Game 单例耦合；Materials 系统砍除（updateMaterials 保留开关位但为 no-op）；
//       water.depthElevation → world.killElevation（Spike 无水体）。
import * as THREE from 'three/webgpu';
import type { Game } from './Game';
import type { Physical, PhysicalDescription } from '../physics/Physics';

export interface VisualDescription {
  model: THREE.Object3D;
  updateMaterials?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  parent?: THREE.Object3D | null;
}

export interface WorldObject {
  visual: { object3D: THREE.Object3D; parent: THREE.Object3D | null } | null;
  physical: Physical | null;
  needsUpdate: boolean;
  reseting: boolean;
}

export class Objects {
  private readonly game: Game;
  readonly list = new Map<number, WorldObject>();
  private key = 0;
  private roundedViewPosition = { x: 0, z: 0 };

  constructor(game: Game) {
    this.game = game;

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      4, // order 4：物理→视觉同步（在 world.step 之后、车辆 post 之前）
    );
  }

  add(
    visualDescription: VisualDescription | null = null,
    physicalDescription: PhysicalDescription | null = null,
  ): WorldObject {
    const object: WorldObject = {
      visual: null,
      physical: null,
      needsUpdate: false,
      reseting: false,
    };

    /**
     * Visual
     */
    if (visualDescription && visualDescription.model) {
      const visual = {
        updateMaterials: true,
        castShadow: true,
        receiveShadow: true,
        parent: this.game.scene as THREE.Object3D | null,
        ...visualDescription,
      };

      // Materials 系统未移植（Spike 用标准材质），updateMaterials 暂为 no-op；
      // Phase B 引入 Materials 注册表后在此接回 game.materials.updateObject(model)。

      if (visual.castShadow || visual.receiveShadow) {
        visual.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            if (visual.castShadow) child.castShadow = true;
            if (visual.receiveShadow) child.receiveShadow = true;
          }
        });
      }

      if (visual.parent !== null) visual.parent.add(visual.model);

      object.visual = { object3D: visual.model, parent: visual.parent };
    }

    /**
     * Physical
     */
    if (physicalDescription) {
      object.physical = this.game.physics.getPhysical(physicalDescription);
    }

    /**
     * 双向引用（碰撞回调经 body.userData 反查）
     */
    if (object.physical) {
      object.physical.body.userData = { object };
    }
    if (object.visual) {
      object.visual.object3D.userData.object = object;
    }

    /**
     * Save
     */
    this.key++;
    this.list.set(this.key, object);

    // sleeping / 未启用 / fixed：位姿直接应用一次
    if (object.visual && object.physical && physicalDescription) {
      if (
        physicalDescription.sleeping ||
        physicalDescription.enabled === false ||
        object.physical.type === 'fixed'
      ) {
        object.visual.object3D.position.copy(object.physical.body.translation());
        object.visual.object3D.quaternion.copy(object.physical.body.rotation());
      }
    }

    return object;
  }

  // Blender 命名约定 → 视觉/物理描述（folio 资产管线核心，原样保留）：
  // 节点名含 physical（+ dynamic/kinematicPositionBased）→ 生成刚体；
  // 子节点名 trimesh… / hull… / cuboid… / tube… / ball… → 对应碰撞体（scale 即尺寸参数）。
  getFromModel(
    model: THREE.Object3D,
    visualDescription: Partial<VisualDescription> = {},
    physicalDescription: Partial<PhysicalDescription> = {},
  ): [VisualDescription, PhysicalDescription | null] {
    const name = model.name;

    const physical = !!name.match(/physical/i);
    const cleanUpRegexp = /physical|fixed|dynamic|kinematicPositionBased/gi;

    const colliders: NonNullable<PhysicalDescription['colliders']> = [];

    if (physical) {
      if (typeof physicalDescription.type === 'undefined') {
        physicalDescription.type = 'fixed';

        if (model.name.match(/dynamic/i)) physicalDescription.type = 'dynamic';
        else if (model.name.match(/kinematicPositionBased/i))
          physicalDescription.type = 'kinematicPositionBased';
      }

      const userData = model.userData as Record<string, unknown>;
      if (typeof userData.restitution !== 'undefined')
        physicalDescription.restitution = userData.restitution as number;
      if (typeof userData.friction !== 'undefined')
        physicalDescription.friction = userData.friction as number;
      if (typeof userData.category !== 'undefined')
        physicalDescription.category = userData.category as PhysicalDescription['category'];

      model.name = name.replaceAll(cleanUpRegexp, '');

      // Colliders
      const children = [...model.children];
      for (const child of children) {
        const collider: (typeof colliders)[number] = {
          position: child.position,
          quaternion: child.quaternion,
        };
        const geometry = (child as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;

        if (child.name.match(/^trimesh/i) && geometry?.index) {
          collider.shape = 'trimesh';
          collider.parameters = [geometry.attributes.position.array, geometry.index.array];
        } else if (child.name.match(/^hull/i) && geometry) {
          collider.shape = 'hull';
          collider.parameters = [geometry.attributes.position.array];
        } else if (child.name.match(/^cuboid/i)) {
          collider.shape = 'cuboid';
          collider.parameters = [child.scale.x * 0.5, child.scale.y * 0.5, child.scale.z * 0.5];
        } else if (child.name.match(/^tube/i)) {
          collider.shape = 'cylinder';
          collider.parameters = [child.scale.y * 0.5, child.scale.x * 0.5];
        } else if (child.name.match(/^ball/i)) {
          collider.shape = 'ball';
          collider.parameters = [child.scale.y * 0.5];
        }

        const childData = child.userData as Record<string, unknown>;
        if (typeof childData.restitution !== 'undefined')
          collider.restitution = childData.restitution as number;
        if (typeof childData.friction !== 'undefined')
          collider.friction = childData.friction as number;
        if (typeof childData.category !== 'undefined')
          collider.category = childData.category as PhysicalDescription['category'];

        if (collider.shape) {
          colliders.push(collider);
          child.removeFromParent();
        }
      }
    }

    return [
      { ...visualDescription, model },
      physical ? ({ ...physicalDescription, colliders } as PhysicalDescription) : null,
    ];
  }

  addFromModel(
    model: THREE.Object3D,
    visualDescription: Partial<VisualDescription> = {},
    physicalDescription: Partial<PhysicalDescription> = {},
  ): WorldObject {
    return this.add(...this.getFromModel(model, visualDescription, physicalDescription));
  }

  resetObject(object: WorldObject): void {
    if (
      !object.physical ||
      (object.physical.type !== 'dynamic' && object.physical.type !== 'kinematicPositionBased') ||
      object.reseting
    )
      return;

    object.reseting = true;
    const physical = object.physical;

    const isEnabled = physical.body.isEnabled();
    physical.body.setEnabled(false);
    physical.body.setTranslation(physical.initialState.position, false);
    physical.body.setRotation(physical.initialState.rotation, false);
    physical.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
    physical.body.setAngvel({ x: 0, y: 0, z: 0 }, false);
    physical.body.resetForces(false);
    physical.body.resetTorques(false);

    // 等一帧再恢复（同帧 setTranslation + setEnabled 会带出残余速度）
    this.game.ticker.wait(1, () => {
      physical.body.setEnabled(isEnabled);

      if (physical.initialState.sleeping) physical.body.sleep();

      object.reseting = false;
      this.game.ticker.wait(1, () => {
        object.needsUpdate = true;
      });
    });

    if (object.visual) {
      if (object.visual.parent && object.visual.parent !== object.visual.object3D.parent)
        object.visual.parent.add(object.visual.object3D);
      object.visual.object3D.position.copy(physical.initialState.position);
      object.visual.object3D.quaternion.copy(physical.initialState.rotation);
    }
  }

  resetAll(): void {
    this.list.forEach((object) => {
      this.resetObject(object);
    });
  }

  disable(object: WorldObject): void {
    if (object.physical) {
      object.physical.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
      object.physical.body.setAngvel({ x: 0, y: 0, z: 0 }, false);
      object.physical.body.resetForces(false);
      object.physical.body.resetTorques(false);
      object.physical.body.setEnabled(false);
    }

    if (object.visual) object.visual.object3D.removeFromParent();
  }

  enable(object: WorldObject): void {
    if (object.physical) object.physical.body.setEnabled(true);

    if (object.visual && object.visual.parent && object.visual.parent !== object.visual.object3D.parent)
      object.visual.parent.add(object.visual.object3D);
  }

  private update(): void {
    const roundedViewPosition = {
      x: Math.round(this.game.view.focusPoint.position.x),
      z: Math.round(this.game.view.focusPoint.position.z),
    };
    let objectsNeedDistanceTest = false;

    if (
      roundedViewPosition.x !== this.roundedViewPosition.x ||
      roundedViewPosition.z !== this.roundedViewPosition.z
    ) {
      objectsNeedDistanceTest = true;
      this.roundedViewPosition.x = roundedViewPosition.x;
      this.roundedViewPosition.z = roundedViewPosition.z;
    }

    this.list.forEach((object) => {
      const position = object.physical ? object.physical.body.translation() : null;

      // 物理 → 视觉
      if (
        object.visual &&
        object.physical &&
        position &&
        (object.needsUpdate ||
          (!object.physical.body.isSleeping() && object.physical.body.isEnabled()))
      ) {
        object.needsUpdate = false;
        object.visual.object3D.position.copy(position);
        object.visual.object3D.quaternion.copy(object.physical.body.rotation());
      }

      if (object.physical && position) {
        // 掉出世界 → 重置（folio 语义：低于 water.depthElevation）
        if (position.y < this.game.world.killElevation) {
          this.resetObject(object);
        }

        // 远离视野 → 休眠（省物理开销）
        if (objectsNeedDistanceTest) {
          const distanceToView = Math.hypot(
            this.roundedViewPosition.x - position.x,
            this.roundedViewPosition.z - position.z,
          );

          if (
            object.physical.body.isEnabled() &&
            !object.physical.body.isSleeping() &&
            distanceToView > this.game.view.optimalArea.radius
          ) {
            object.physical.body.sleep();
          }
        }
      }
    });
  }
}
