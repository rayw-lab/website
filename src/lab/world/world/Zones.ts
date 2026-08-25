// 移植自 folio-2025 sources/Game/Zones.js（82 行，POI 注册底座，Phase B 才真正用到）。
// 球形/圆柱触发区：每帧测玩家距离，进出触发 enter/leave 事件（tick order 8）。
// 改动：去 Game 单例/Debug 面板；preview 线框保留（默认隐藏，调试可开）。
import * as THREE from 'three/webgpu';
import { Events } from '../core/Events';
import type { Game } from '../core/Game';

export interface Zone {
  type: 'sphere' | 'cylinder';
  position: THREE.Vector3;
  radius: number;
  isIn: boolean;
  events: Events;
  preview: THREE.Mesh;
}

export class Zones {
  private readonly game: Game;
  readonly items: Zone[] = [];
  readonly previewGroup = new THREE.Group();

  constructor(game: Game) {
    this.game = game;

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      8, // order 8：区域检测在玩家 post 之后（§12 tick order 全表）
    );

    this.previewGroup.visible = false;
    this.game.scene.add(this.previewGroup);
  }

  create(type: Zone['type'], position: THREE.Vector3, radius: number): Zone {
    const preview = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 16, 16),
      new THREE.MeshBasicNodeMaterial({ color: '#ffffff', wireframe: true }),
    );
    preview.position.copy(position);
    this.previewGroup.add(preview);

    const zone: Zone = { type, position, radius, isIn: false, events: new Events(), preview };
    this.items.push(zone);

    return zone;
  }

  private update(): void {
    for (const zone of this.items) {
      const playerPosition = this.game.player.position;

      // cylinder：只比 XZ 平面距离（忽略高度差）
      const distance =
        zone.type === 'cylinder'
          ? Math.hypot(playerPosition.x - zone.position.x, playerPosition.z - zone.position.z)
          : playerPosition.distanceTo(zone.position);

      if (distance < zone.radius) {
        if (!zone.isIn) {
          zone.isIn = true;
          zone.events.trigger('enter', [zone]);
        }
      } else {
        if (zone.isIn) {
          zone.isIn = false;
          zone.events.trigger('leave', [zone]);
        }
      }
    }
  }
}
