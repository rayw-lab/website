// 移植自 folio-2025 sources/Game/RayCursor.js（219 行，MIT，vendor/README.md
// 记录 commit 41046b5）。射线点击/悬停管理：注册世界内可点形状（Sphere/Box3/
// Plane/Mesh），经 'rayPointer' 动作（Pointer.any 的 start/change/end）做射线求交，
// 派发 onEnter/onLeave/onDown/onUp/onClick 并切换 canvas 光标态。
// CC-E9 首个消费方 = areas/InteractivePoints（POI 点悬停展开 + 点按交互）。
// 改动（其余零改）：
//   · 去 Game 单例（构造注入，mount 契约可重复挂载）；
//   · NDC 归一化补 stage 边界偏移（Pointer 给的是 client 视口坐标，folio 画布满窗
//     无此问题；本站画布嵌页面中段——Nipple.ts L199-205 同款口径）；
//   · 'rayPointer' 动作 categories 补 'driving'（CC-E6 首幕后的驾驶上下文，
//     terms 见 Inputs.ts 动作表注释）；不含 Space/Enter 等按键——键位交互归
//     InteractivePoints 的 poiInteract 动作，本类只管指针，不与 Reveal CTA 抢键。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';
import type { InputAction } from './Inputs';

export type RayShape = THREE.Sphere | THREE.Box3 | THREE.Plane | THREE.Mesh;

export interface RayIntersectDescription {
  /** false = 暂停求交（POI 隐藏态置 false） */
  active: boolean;
  shape: RayShape;
  onEnter?(): void;
  onLeave?(): void;
  onDown?(): void;
  onUp?(): void;
  /** 按下与抬起间指针位移 < 25px 才算点击（拖拽镜头不误触，folio L189） */
  onClick?(): void;
}

export interface RayIntersect extends RayIntersectDescription {
  isIntersecting: boolean;
  isDown: boolean;
  position: THREE.Vector3;
}

export class RayCursor {
  private readonly game: Game;

  currentIntersect: RayIntersect | null = null;
  private intersects: RayIntersect[] = [];
  private isAnyIntersecting = false;
  private needsTest = false;

  private readonly raycaster = new THREE.Raycaster();
  private readonly deltaCursor = { x: 0, y: 0 };

  constructor(game: Game) {
    this.game = game;
    this.setPointerTesting();
  }

  addIntersect(description: RayIntersectDescription): RayIntersect {
    const intersect: RayIntersect = {
      ...description,
      isIntersecting: false,
      isDown: false,
      position: new THREE.Vector3(),
    };

    if (intersect.shape instanceof THREE.Mesh) {
      intersect.shape.getWorldPosition(intersect.position);
    } else if (intersect.shape instanceof THREE.Sphere) {
      intersect.position.copy(intersect.shape.center);
    } else if (intersect.shape instanceof THREE.Box3) {
      intersect.shape.getCenter(intersect.position);
    }

    this.intersects.push(intersect);
    this.needsTest = intersect.active;

    if (this.needsTest) {
      this.game.ticker.wait(1, () => {
        if (this.needsTest) {
          this.testIntersects('change');
          this.needsTest = false;
        }
      });
    }

    return intersect;
  }

  removeIntersect(intersect: RayIntersect): void {
    this.intersects = this.intersects.filter((item) => item !== intersect);
  }

  private testIntersects(actionTrigger: InputAction['trigger']): void {
    // Start / Change：求交 + enter/leave/down
    if (actionTrigger === 'start' || actionTrigger === 'change') {
      if (actionTrigger === 'start') {
        this.deltaCursor.x = 0;
        this.deltaCursor.y = 0;
      } else {
        this.deltaCursor.x += Math.abs(this.game.inputs.pointer.delta.x);
        this.deltaCursor.y += Math.abs(this.game.inputs.pointer.delta.y);
      }

      const intersects = this.intersects.filter((intersect) => {
        if (!intersect.active) return false;

        // 超出视野最优区的形状不测（folio L79-88）
        const distance = Math.hypot(
          this.game.view.focusPoint.position.x - intersect.position.x,
          this.game.view.focusPoint.position.z - intersect.position.z,
        );
        return distance <= this.game.view.optimalArea.radius;
      });

      let isAnyIntersecting = false;

      if (intersects.length) {
        // Pointer 是 client 坐标：减 stage 边界再归一化（Nipple 同款口径）
        const stageRect = this.game.viewport.domElement.getBoundingClientRect();
        const ndcPointer = new THREE.Vector2(
          ((this.game.inputs.pointer.current.x - stageRect.left) / this.game.viewport.width) * 2 - 1,
          -(((this.game.inputs.pointer.current.y - stageRect.top) / this.game.viewport.height) * 2 - 1),
        );
        this.raycaster.setFromCamera(ndcPointer, this.game.view.camera);

        for (const intersect of intersects) {
          let isIntersecting = false;

          if (intersect.shape instanceof THREE.Sphere)
            isIntersecting = this.raycaster.ray.intersectsSphere(intersect.shape);
          else if (intersect.shape instanceof THREE.Box3)
            isIntersecting = this.raycaster.ray.intersectsBox(intersect.shape);
          else if (intersect.shape instanceof THREE.Plane)
            isIntersecting = this.raycaster.ray.intersectsPlane(intersect.shape);
          else if (intersect.shape instanceof THREE.Mesh)
            isIntersecting = this.raycaster.intersectObject(intersect.shape).length > 0;

          if (isIntersecting !== intersect.isIntersecting) {
            intersect.isIntersecting = isIntersecting;

            if (intersect.isIntersecting) {
              this.currentIntersect = intersect;
              intersect.onEnter?.();
            } else {
              intersect.onLeave?.();
            }
          }

          if (isIntersecting) isAnyIntersecting = true;
        }

        if (isAnyIntersecting !== this.isAnyIntersecting) {
          this.isAnyIntersecting = isAnyIntersecting;
          this.game.canvasElement.style.cursor = this.isAnyIntersecting ? 'pointer' : '';
        }

        if (!isAnyIntersecting) this.currentIntersect = null;
      }

      if (actionTrigger === 'start' && this.currentIntersect) {
        this.currentIntersect.isDown = true;
        this.currentIntersect.onDown?.();
      }
    }

    // End：up / click（位移阈值 25px 内才算点击）
    else if (actionTrigger === 'end') {
      const intersects = this.intersects.filter((intersect) => intersect.active);
      const distance = Math.hypot(this.deltaCursor.x, this.deltaCursor.y);

      for (const intersect of intersects) {
        if (intersect.isIntersecting) {
          intersect.onUp?.();

          if (intersect.isDown) {
            intersect.isDown = false;
            if (distance < 25) intersect.onClick?.();
          }
        } else if (intersect.isDown) {
          intersect.isDown = false;
          intersect.onUp?.();
        }
      }
    }
  }

  private setPointerTesting(): void {
    this.game.inputs.addActions([
      {
        name: 'rayPointer',
        categories: ['intro', 'wandering', 'racing', 'cinematic', 'driving'],
        keys: ['Pointer.any'],
      },
    ]);

    this.game.inputs.events.on('rayPointer', (action: InputAction) => {
      this.testIntersects(action.trigger);
    });
  }
}
