// 移植自 folio-2025 sources/Game/Physics/Physics.js（313 行）。
// 保留：碰撞分组编码 / getPhysical 工厂（shape 表 + 质量/摩擦/弹性/分组）/
//       deltaScaled 驱动 timestep / drainContactForceEvents 碰撞回调。
// 改动：去 Game 单例耦合；水体阻尼段砍除（Spike 无 Water 系统）；
//       新增 'cone' shape（灰盒锥桶用 Rapier 原生 cone，folio 时代 API 尚缺）。
// 分组语义（Rapier 32 位）：高 16 位 = 我属于谁，低 16 位 = 我碰谁（§5.1）。
import type RAPIER from '@dimforge/rapier3d';
import type {
  Collider,
  EventQueue,
  RigidBody,
  World as RapierWorld,
} from '@dimforge/rapier3d';
import type { Game } from '../core/Game';

export type RapierModule = typeof RAPIER;

export type PhysicalBodyType =
  | 'dynamic'
  | 'fixed'
  | 'kinematicPositionBased'
  | 'kinematicVelocityBased';

export type PhysicsCategory = 'floor' | 'object' | 'bumper';

export interface ColliderDescription {
  shape?: 'cuboid' | 'ball' | 'cylinder' | 'cone' | 'trimesh' | 'hull' | 'heightfield';
  parameters?: unknown[];
  position?: { x: number; y: number; z: number };
  quaternion?: { x: number; y: number; z: number; w: number };
  mass?: number;
  centerOfMass?: { x: number; y: number; z: number };
  friction?: number;
  restitution?: number;
  category?: PhysicsCategory;
}

export interface PhysicalDescription {
  type?: PhysicalBodyType;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number; w: number };
  canSleep?: boolean;
  sleeping?: boolean;
  enabled?: boolean;
  mass?: number;
  friction?: number;
  frictionRule?: 'average' | 'min' | 'max' | 'multiply';
  restitution?: number;
  category?: PhysicsCategory;
  linearDamping?: number;
  angularDamping?: number;
  contactThreshold?: number;
  onCollision?: (force: number, position: { x: number; y: number; z: number }) => void;
  colliders: ColliderDescription[];
  collidersOverwrite?: Partial<ColliderDescription>;
}

export interface Physical {
  type: PhysicalBodyType;
  body: RigidBody;
  colliders: Collider[];
  linearDamping: number;
  angularDamping: number;
  onCollision?: (force: number, position: { x: number; y: number; z: number }) => void;
  initialState: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    sleeping: boolean;
  };
}

/** body.userData 反查约定（碰撞回调经由 Objects 建立的双向引用触达，§5.1） */
export interface PhysicsUserData {
  object?: { physical?: Physical | null };
}

export class Physics {
  private readonly game: Game;
  readonly RAPIER: RapierModule;
  readonly world: RapierWorld;
  readonly eventQueue: EventQueue;
  readonly physicals: Physical[] = [];

  readonly groups = {
    all: 0b0000000000000001,
    object: 0b0000000000000010,
    bumper: 0b0000000000000100,
  };
  readonly categories: Record<PhysicsCategory, number>;
  readonly frictionRules: Record<'average' | 'min' | 'max' | 'multiply', number>;

  constructor(game: Game) {
    this.game = game;
    this.RAPIER = game.RAPIER;

    this.world = new this.RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
    this.eventQueue = new this.RAPIER.EventQueue(true);

    this.categories = {
      floor: (this.groups.all << 16) | this.groups.all,
      object:
        ((this.groups.all | this.groups.object) << 16) | (this.groups.all | this.groups.bumper),
      bumper: (this.groups.bumper << 16) | this.groups.object,
    };
    this.frictionRules = {
      average: this.RAPIER.CoefficientCombineRule.Average,
      min: this.RAPIER.CoefficientCombineRule.Min,
      max: this.RAPIER.CoefficientCombineRule.Max,
      multiply: this.RAPIER.CoefficientCombineRule.Multiply,
    };

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      3, // order 3：world.step（§12 tick order 全表）
    );
  }

  getPhysical(description: PhysicalDescription): Physical {
    const linearDamping = description.linearDamping ?? 0.1;
    const angularDamping = description.angularDamping ?? 0.1;

    // Body
    let rigidBodyDesc: RAPIER.RigidBodyDesc;
    let type: PhysicalBodyType;

    if (description.type === 'dynamic' || typeof description.type === 'undefined') {
      type = 'dynamic';
      rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic();
    } else if (description.type === 'fixed') {
      type = 'fixed';
      rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed();
    } else if (description.type === 'kinematicPositionBased') {
      type = 'kinematicPositionBased';
      rigidBodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased();
    } else {
      type = 'kinematicVelocityBased';
      rigidBodyDesc = this.RAPIER.RigidBodyDesc.kinematicVelocityBased();
    }

    if (description.position)
      rigidBodyDesc.setTranslation(description.position.x, description.position.y, description.position.z);

    if (description.rotation) rigidBodyDesc.setRotation(description.rotation);

    if (typeof description.canSleep !== 'undefined') rigidBodyDesc.setCanSleep(description.canSleep);

    rigidBodyDesc.setLinearDamping(linearDamping);
    rigidBodyDesc.setAngularDamping(angularDamping);

    if (typeof description.sleeping !== 'undefined') rigidBodyDesc.setSleeping(description.sleeping);

    if (typeof description.enabled !== 'undefined') rigidBodyDesc.setEnabled(description.enabled);

    const body = this.world.createRigidBody(rigidBodyDesc);

    // Colliders
    const collidersOverwrite = description.collidersOverwrite ?? {};

    const colliders: Collider[] = [];
    const physical: Physical = {
      type,
      body,
      colliders,
      linearDamping,
      angularDamping,
      initialState: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 }, sleeping: false },
    };

    for (let rawCollider of description.colliders) {
      rawCollider = { ...rawCollider, ...collidersOverwrite };

      const params = (rawCollider.parameters ?? []) as unknown[];
      let colliderDescription: RAPIER.ColliderDesc;

      switch (rawCollider.shape) {
        case 'cuboid':
          colliderDescription = this.RAPIER.ColliderDesc.cuboid(...(params as [number, number, number]));
          break;
        case 'ball':
          colliderDescription = this.RAPIER.ColliderDesc.ball(...(params as [number]));
          break;
        case 'cylinder':
          colliderDescription = this.RAPIER.ColliderDesc.cylinder(...(params as [number, number]));
          break;
        case 'cone':
          colliderDescription = this.RAPIER.ColliderDesc.cone(...(params as [number, number]));
          break;
        case 'trimesh':
          colliderDescription = this.RAPIER.ColliderDesc.trimesh(
            ...(params as [Float32Array, Uint32Array]),
          );
          break;
        case 'hull': {
          const hull = this.RAPIER.ColliderDesc.convexHull(...(params as [Float32Array]));
          if (!hull) throw new Error('[world/physics] convexHull 生成失败');
          colliderDescription = hull;
          break;
        }
        case 'heightfield':
          colliderDescription = this.RAPIER.ColliderDesc.heightfield(
            ...(params as [number, number, Float32Array, { x: number; y: number; z: number }]),
          );
          break;
        default:
          throw new Error(`[world/physics] 未支持的 collider shape：${String(rawCollider.shape)}`);
      }

      if (rawCollider.position)
        colliderDescription = colliderDescription.setTranslation(
          rawCollider.position.x,
          rawCollider.position.y,
          rawCollider.position.z,
        );

      if (rawCollider.quaternion)
        colliderDescription = colliderDescription.setRotation(rawCollider.quaternion);

      colliderDescription = colliderDescription.setDensity(0.1);

      if (typeof rawCollider.mass !== 'undefined') {
        // collider 级质量：centerOfMass 手动压质心是防翻车第一要素（§5.1）
        if (typeof rawCollider.centerOfMass !== 'undefined')
          colliderDescription = colliderDescription.setMassProperties(
            rawCollider.mass,
            rawCollider.centerOfMass,
            { x: 1, y: 1, z: 1 },
            { x: 0, y: 0, z: 0, w: 1 },
          );
        else colliderDescription = colliderDescription.setMass(rawCollider.mass);
      }

      if (typeof description.mass !== 'undefined') {
        // body 级质量：均摊到每个 collider
        colliderDescription = colliderDescription.setMass(
          description.mass / description.colliders.length,
        );
      }

      if (typeof description.friction !== 'undefined')
        colliderDescription = colliderDescription.setFriction(description.friction);
      else if (typeof rawCollider.friction !== 'undefined')
        colliderDescription = colliderDescription.setFriction(rawCollider.friction);
      else colliderDescription = colliderDescription.setFriction(0.2);

      if (typeof description.frictionRule !== 'undefined')
        colliderDescription = colliderDescription.setFrictionCombineRule(
          this.frictionRules[description.frictionRule],
        );

      if (typeof description.restitution !== 'undefined')
        colliderDescription = colliderDescription.setRestitution(description.restitution);
      else if (typeof rawCollider.restitution !== 'undefined')
        colliderDescription = colliderDescription.setRestitution(rawCollider.restitution);
      else colliderDescription = colliderDescription.setRestitution(0.15);

      let category: PhysicsCategory = 'object';
      if (typeof description.category !== 'undefined') category = description.category;
      else if (typeof rawCollider.category !== 'undefined') category = rawCollider.category;

      colliderDescription = colliderDescription.setCollisionGroups(this.categories[category]);

      if (
        typeof description.onCollision === 'function' ||
        typeof description.contactThreshold !== 'undefined'
      ) {
        colliderDescription = colliderDescription.setActiveEvents(
          this.RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS,
        );
        colliderDescription = colliderDescription.setContactForceEventThreshold(
          description.contactThreshold ?? 15,
        );

        if (typeof description.onCollision === 'function')
          physical.onCollision = description.onCollision;
      }

      const collider = this.world.createCollider(colliderDescription, body);
      colliders.push(collider);
    }

    // 初始位姿（reset 用）
    physical.initialState = {
      position: { x: body.translation().x, y: body.translation().y, z: body.translation().z },
      rotation: body.rotation(),
      sleeping: body.isSleeping(),
    };

    this.physicals.push(physical);

    return physical;
  }

  private update(): void {
    // timestep 跟随 deltaScaled（2 倍速世界的物理时基，§5.4）
    this.world.timestep = this.game.ticker.deltaScaled;

    this.world.step(this.eventQueue);

    this.eventQueue.drainContactForceEvents((event) => {
      const collider1 = this.world.getCollider(event.collider1());
      const collider2 = this.world.getCollider(event.collider2());

      const body1 = collider1.parent();
      const body2 = collider2.parent();
      if (!body1 || !body2) return;

      const callback1 = (body1.userData as PhysicsUserData | undefined)?.object?.physical
        ?.onCollision;
      const callback2 = (body2.userData as PhysicsUserData | undefined)?.object?.physical
        ?.onCollision;

      if (typeof callback1 === 'function' || typeof callback2 === 'function') {
        const mass1 = body1.mass();
        const mass2 = body2.mass();
        const force = event.maxForceMagnitude() / (mass1 + mass2);

        const position1 = body1.translation();
        const position2 = body2.translation();

        const bodyPosition =
          position1.x === 0 && position1.y === 0 && position1.z === 0 ? position2 : position1;

        callback1?.(force, bodyPosition);
        callback2?.(force, bodyPosition);
      }
    });
  }

  /** dispose 释放 wasm 侧内存（mount 契约要求，folio 无此需求故无此方法） */
  free(): void {
    this.eventQueue.free();
    this.world.free();
  }
}
