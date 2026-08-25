// 移植自 folio-2025 sources/Game/Inputs/Nipple.js（279 行）。
// 自绘 3D 摇杆：跟车的 TSL 环形 shader（内环 tap 区 + 外环进度扇区 + forward 扇区判定），
// 不是 DOM 摇杆库——渲染在场景里、随车移动（folio 触屏方案核心）。
// 保留：环 SDF shader、forward 振幅 1.5π、progress 半径 2→4.5、tap 事件。
// 改动：去 Game 单例耦合；gsap jump 补间改为 ticker 驱动的手写两段缓动（依赖红线 G5）。
import * as THREE from 'three/webgpu';
import {
  Fn,
  If,
  abs,
  atan,
  float,
  max,
  positionGeometry,
  step,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import { Events } from '../core/Events';
import { clamp, smallestAngle } from '../utils/maths';
import type { Game } from '../core/Game';
import type { InputAction } from './Inputs';
import type { Pointer } from './Pointer';

export class Nipple {
  private readonly game: Game;
  readonly events = new Events();
  readonly position = new THREE.Vector3();
  private readonly raycaster = new THREE.Raycaster();

  active = false;
  private animated = false;
  angle = 0;
  progress = 0;
  smallestAngle = 0;
  private targetAngle = 0;
  forward = true;
  private inRadiusLow = false;

  private group!: THREE.Group;
  private mesh!: THREE.Mesh;

  readonly edgesThickness = 0.1;
  readonly outlineThickness = 0.2;
  readonly progressRadiusLow = 2;
  readonly progressRadiusHigh = 4.5;
  /** forward 扇区张角（1.5π）——超出即判定为倒车方向（§7.1 Step 8） */
  readonly forwardAmplitude = Math.PI * 1.5;

  private readonly uniforms = {
    progress: uniform(1),
    forward: uniform(1),
    progressStartAngle: uniform(0),
    progressEndAngle: uniform(0),
    colorMultiplier: uniform(1),
  };

  /** jump 补间状态（替代 gsap：0.1s 上弹 + 0.6s 回落） */
  private jumpTween: { phase: 'up' | 'down'; t: number } | null = null;

  constructor(game: Game) {
    this.game = game;

    this.setMeshes();
  }

  private setMeshes(): void {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.game.scene.add(this.group);

    const geometry = new THREE.RingGeometry(
      this.progressRadiusLow - this.edgesThickness - this.outlineThickness,
      this.progressRadiusHigh + this.edgesThickness + this.outlineThickness,
      20,
      1,
    );
    geometry.rotateX(-Math.PI * 0.5);

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      wireframe: false,
      depthWrite: false,
    });

    material.outputNode = Fn(() => {
      const radialCoord = vec2(positionGeometry.xz);
      const radialAngle = atan(radialCoord.y, radialCoord.x);

      // Angle（forward 扇区 SDF）
      const directionAngleSDF = abs(radialAngle).sub(this.forwardAmplitude * 0.5).toVar();

      If(this.uniforms.forward.lessThan(0.5), () => {
        directionAngleSDF.assign(directionAngleSDF.negate());
      });
      const directionAngle = step(directionAngleSDF, 0);

      // Edges
      const innerEdgeSDF = abs(radialCoord.length().sub(this.progressRadiusLow)).toVar();
      const outerEdgeSDF = abs(radialCoord.length().sub(this.progressRadiusHigh)).toVar();

      const innerEdgeFill = step(innerEdgeSDF, this.edgesThickness / 2).toVar();
      const innerEdgeOutline = step(innerEdgeSDF, this.outlineThickness / 2).toVar();

      const outerEdgeFill = step(outerEdgeSDF, this.edgesThickness / 2).mul(directionAngle).toVar();
      const outerEdgeOutline = step(outerEdgeSDF, this.outlineThickness / 2).toVar();

      const edgesFill = max(innerEdgeFill, outerEdgeFill);
      const edgesOutline = max(innerEdgeOutline, outerEdgeOutline);

      // Progress（内外环之间的推量扇区）
      const progressSDF = radialCoord
        .length()
        .sub(this.progressRadiusLow)
        .sub(
          this.uniforms.progress.mul(
            this.progressRadiusHigh - this.progressRadiusLow - this.outlineThickness / 2,
          ),
        )
        .toVar();

      const progressLowSDF = radialCoord
        .length()
        .sub(this.progressRadiusLow + this.outlineThickness / 2)
        .negate();
      progressSDF.assign(max(progressSDF, progressLowSDF));

      const progressFill = step(progressSDF, 0).toVar();

      const inAngle = float(0).toVar();
      If(
        radialAngle
          .greaterThan(this.uniforms.progressStartAngle)
          .and(radialAngle.lessThan(this.uniforms.progressEndAngle)),
        () => {
          inAngle.assign(1);
        },
      );
      progressFill.assign(progressFill.mul(inAngle));

      const progressOutline = step(progressSDF, this.outlineThickness / 4).mul(directionAngle);

      // Final fill and outline
      const outline = max(edgesOutline, progressOutline);
      const fill = max(edgesFill, progressFill).toVar();

      // Discard
      outline.lessThan(0.00001).discard();

      // Alpha
      const alpha = outline.mul(0.35).add(fill.mul(0.75));

      return vec4(vec3(fill).mul(this.uniforms.colorMultiplier), alpha);
    })();

    this.mesh = new THREE.Mesh(geometry, material);

    this.group.add(this.mesh);
  }

  /**
   * 每帧由 Player 写入车位与朝向（环随车走）。
   * rotationY = folio 底盘航向（前向 = (cos r, 0, -sin r)）；内部角运算统一用
   * 世界 XZ atan2 口径（targetAngle = atan2(dz, dx) 同空间）——车头 XZ 方位角
   * = atan2(-sin r, cos r) = -r（CC-E2 修正：直接存 rotationY 会镜像转向）。
   */
  setCoordinates(x: number, y: number, z: number, rotationY: number): void {
    const clampedY = clamp(y - 0.25, 0.1, 0.65);
    this.position.set(x, clampedY, z);
    this.group.position.copy(this.position);

    this.angle = -rotationY;
    // 本地 +X（shader forward 扇区中心）→ 世界 (cos r, 0, -sin r) = 车头
    this.mesh.rotation.y = rotationY;
  }

  updateFromPointer(pointer: Pointer, action: InputAction): void {
    // Start
    if (action.trigger === 'start') {
      if (pointer.touches.length === 1) this.active = true;
    }

    // End
    else if (action.trigger === 'end') {
      this.active = false;

      if (this.inRadiusLow) this.events.trigger('tap');

      this.inRadiusLow = false;
    }

    // Change
    if (action.trigger === 'start' || action.trigger === 'change') {
      if (this.active) {
        // 单指 → 摇杆
        if (pointer.touches.length === 1) {
          // 射线求交到摇杆平面。Pointer 给的是 client 视口坐标，NDC 归一化必须
          // 先减舞台 rect 偏移（CC-E2 修正：壳页舞台非满屏，直接除会整体偏移）
          const stageRect = this.game.viewport.domElement.getBoundingClientRect();
          const ndcPointer = new THREE.Vector2(
            ((pointer.current.x - stageRect.left) / this.game.viewport.width) * 2 - 1,
            -(((pointer.current.y - stageRect.top) / this.game.viewport.height) * 2 - 1),
          );
          this.raycaster.setFromCamera(ndcPointer, this.game.view.defaultCamera);

          const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.position.y);
          const intersect = new THREE.Vector3();
          this.raycaster.ray.intersectPlane(plane, intersect);

          // Distance
          const distance = this.position.distanceTo(intersect);

          // Target angle
          this.targetAngle = Math.atan2(
            intersect.z - this.position.z,
            intersect.x - this.position.x,
          );

          // Progress
          this.progress = clamp(
            (distance - this.progressRadiusLow) /
              (this.progressRadiusHigh - this.progressRadiusLow),
            0,
            1,
          );
          this.uniforms.progress.value = this.progress;

          // Tap（始终停在内环 = 点按）
          if (action.trigger === 'start') {
            if (this.progress === 0) this.inRadiusLow = true;
          } else if (action.trigger === 'change') {
            if (this.progress > 0) this.inRadiusLow = false;
          }
        }
        // 多指 → 结束摇杆
        else {
          this.active = false;
        }
      }
    }
  }

  /** tap 跳跃时环上弹回落的反馈动画（原 gsap 补间的手写版） */
  jump(): void {
    this.animated = true;
    this.jumpTween = { phase: 'up', t: 0 };
  }

  private updateJumpTween(delta: number): void {
    if (!this.jumpTween) return;

    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
    const easeInOutQuart = (t: number) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    if (this.jumpTween.phase === 'up') {
      this.jumpTween.t += delta / 0.1;
      if (this.jumpTween.t >= 1) {
        this.mesh.position.y = 1;
        this.jumpTween = { phase: 'down', t: 0 };
      } else {
        this.mesh.position.y = easeOutQuad(this.jumpTween.t);
      }
    } else {
      this.jumpTween.t += delta / 0.6;
      if (this.jumpTween.t >= 1) {
        this.mesh.position.y = 0;
        this.jumpTween = null;
        this.animated = false;
      } else {
        this.mesh.position.y = 1 - easeInOutQuart(this.jumpTween.t);
      }
    }
  }

  /** 由 Inputs 在 tick order 0 调用 */
  update(): void {
    this.updateJumpTween(this.game.ticker.delta);

    if (this.active || this.animated) {
      // 最短角差与 forward 判定
      this.smallestAngle = smallestAngle(this.angle, this.targetAngle);
      const smallestAngleAbs = Math.abs(this.smallestAngle);

      this.forward = smallestAngleAbs < this.forwardAmplitude / 2;

      this.uniforms.forward.value = this.forward ? 1 : 0;

      // 倒车方向：以车尾为基准重算
      if (!this.forward) this.smallestAngle = smallestAngle(this.angle + Math.PI, this.targetAngle);

      if (this.forward) {
        this.uniforms.progressStartAngle.value = Math.min(0, this.smallestAngle);
        this.uniforms.progressEndAngle.value = Math.max(0, this.smallestAngle);
      } else {
        if (this.smallestAngle > 0) {
          this.uniforms.progressStartAngle.value = -Math.PI;
          this.uniforms.progressEndAngle.value = -Math.PI + this.smallestAngle;
        } else {
          this.uniforms.progressStartAngle.value = Math.PI + this.smallestAngle;
          this.uniforms.progressEndAngle.value = Math.PI;
        }
      }

      // 满推量高亮
      this.uniforms.colorMultiplier.value = this.progress === 1 ? 1.5 : 1;

      this.group.visible = true;
    } else {
      this.group.visible = false;
    }
  }
}
