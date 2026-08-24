// 灰盒场景（自写，非移植——source-teardown §9.2：World/Areas 内容类不抄）。
// 结构对照 folio World/World.js 的两段式：
//   step(0)：纯视觉底座（网格地面 + 灯光）——RAPIER 未就绪也能出画面，
//            加载期渲染循环已跑（Game 启动坑②）；
//   step(1)：物理内容（地面碰撞体 + 3 个动态锥桶）——必须晚于 Physics/Objects
//            构造（Game 启动坑③）。
// 地面网格 = MeshGridMaterial 简化版（TSL 程序化，零贴图资产）+ 程序化环形试车道；
// 锥桶 = cone primitive（不建模），掉落沉降即是物理循环在跑的可见证据。
import * as THREE from 'three/webgpu';
import { Fn, fwidth, mix, positionGeometry, positionWorld, smoothstep, vec3 } from 'three/tsl';
import type { Game } from '../core/Game';
import type { WorldObject } from '../core/Objects';

/** 环形试车道布局常量（Game 摆 respawn、World 摆锥桶都参照它） */
export const RING = { radius: 10, halfWidth: 2.5 };

/** 出生点：环形道上角度 0 处（静态相机取景以此为焦点） */
export const SPAWN = {
  position: { x: RING.radius, y: 0, z: 0 },
  // 朝向道路切线方向（+θ 侧），车辆接入后即沿道出发
  rotation: -Math.PI / 2,
};

export class World {
  private readonly game: Game;

  /** 掉出世界判定高度（folio 语义 water.depthElevation；Objects 每帧读它） */
  readonly killElevation = -8;

  /** 环形试车道（respawn/锥桶摆位都参照它） */
  readonly ring = RING;

  ground!: THREE.Mesh;
  cones: WorldObject[] = [];

  constructor(game: Game) {
    this.game = game;

    this.step(0);
  }

  step(step: 0 | 1): void {
    if (step === 0) {
      this.setLights();
      this.setGround();
    } else {
      this.setGroundPhysical();
      this.setCones();
    }
  }

  private setLights(): void {
    this.game.scene.background = new THREE.Color('#0d0c11');

    const hemisphere = new THREE.HemisphereLight('#4a4f6d', '#17151c', 1.1);
    this.game.scene.add(hemisphere);

    const directional = new THREE.DirectionalLight('#fff4e0', 2.2);
    directional.position.set(18, 28, 12);
    directional.castShadow = true;
    directional.shadow.mapSize.set(1024, 1024);
    directional.shadow.camera.left = -30;
    directional.shadow.camera.right = 30;
    directional.shadow.camera.top = 30;
    directional.shadow.camera.bottom = -30;
    directional.shadow.camera.far = 80;
    directional.shadow.bias = -0.002;
    this.game.scene.add(directional);
  }

  private setGround(): void {
    // fwidth 抗锯齿网格线（MeshGridMaterial 双层线简化版：2m 细线 + 10m 粗线）
    const gridLine = (cellSize: number, thickness: number) => {
      const coord = positionWorld.xz.div(cellSize);
      const distanceToLine = coord.fract().sub(0.5).abs().oneMinus().sub(0.5).abs();
      const aa = fwidth(coord);
      const lineVec = distanceToLine.sub(thickness).div(aa).clamp(0, 1);
      return lineVec.x.min(lineVec.y).oneMinus();
    };

    const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.95, metalness: 0 });
    material.colorNode = Fn(() => {
      const base = vec3(0.075, 0.07, 0.09); // 0x1b191f 系灰紫底
      const fine = vec3(0.19, 0.14, 0.33).mul(gridLine(2, 0.012)); // #8d55ff 系细线
      const coarse = vec3(0.32, 0.25, 0.5).mul(gridLine(10, 0.01)); // 10m 粗线

      // 环形试车道：深色路面带 + 白色边线（程序化，零资产）
      const distanceToRing = positionWorld.xz.length().sub(this.ring.radius).abs();
      const road = smoothstep(this.ring.halfWidth, this.ring.halfWidth - 0.3, distanceToRing);
      const edgeLine = smoothstep(
        0.22,
        0.08,
        distanceToRing.sub(this.ring.halfWidth - 0.35).abs(),
      );

      const gridColor = base.add(fine).add(coarse);
      const roadColor = vec3(0.045, 0.045, 0.055);
      const withRoad = mix(gridColor, roadColor, road);

      return withRoad.add(vec3(0.75).mul(edgeLine));
    })();

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), material);
    this.ground.rotation.x = -Math.PI * 0.5;
    this.ground.receiveShadow = true;
    this.game.scene.add(this.ground);
  }

  private setGroundPhysical(): void {
    // 纯物理地面（无视觉）：厚 cuboid 顶面对齐 y=0
    this.game.objects.add(null, {
      type: 'fixed',
      position: { x: 0, y: -0.5, z: 0 },
      friction: 0.8,
      restitution: 0.1,
      category: 'floor',
      colliders: [{ shape: 'cuboid', parameters: [150, 0.5, 150] }],
    });
  }

  private setCones(): void {
    // 3 个碰撞锥桶：环形道上、出生点正前方（cone primitive，不建模）
    const coneRadius = 0.45;
    const coneHeight = 1.1;

    const geometry = new THREE.ConeGeometry(coneRadius, coneHeight, 24);

    const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.7, metalness: 0 });
    material.colorNode = Fn(() => {
      // 橙底 + 白色反光带（按锥体局部高度切带，零贴图）
      const orange = vec3(1.0, 0.28, 0.02);
      const white = vec3(0.92, 0.92, 0.9);
      const band = smoothstep(0.16, 0.13, positionGeometry.y.sub(0.08).abs());
      return mix(orange, white, band);
    })();

    // 出生点正前方沿道排开（间距约 2.2m，左右交错成小 slalom），静态相机内可见
    const angles = [0.22, 0.33, 0.44];
    const offsets = [-0.9, 0.9, -0.9];
    for (let i = 0; i < angles.length; i++) {
      const theta = angles[i];
      const radius = this.ring.radius + offsets[i];
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const mesh = new THREE.Mesh(geometry, material);

      const object = this.game.objects.add(
        { model: mesh, castShadow: true, receiveShadow: false },
        {
          type: 'dynamic',
          // 从半空掉落沉降：首屏即可肉眼验证物理循环在跑
          position: { x, y: coneHeight * 0.5 + 1.2, z },
          mass: 0.3,
          friction: 0.7,
          restitution: 0.25,
          category: 'object',
          colliders: [{ shape: 'cone', parameters: [coneHeight * 0.5, coneRadius] }],
        },
      );

      this.cones.push(object);
    }
  }
}
