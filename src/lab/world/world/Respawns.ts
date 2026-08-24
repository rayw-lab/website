// 移植自 folio-2025 sources/Game/Respawns.js（68 行）。
// 重生点注册表：getByName / getDefault / getClosest API 原样保留。
// 改动：folio 从 respawnsReferences.glb 解析（Blender 命名 respawn* → 重生点）；
// 灰盒 Spike 零资产，改为构造参数直接注入；Phase B 接回 GLB 时用
// References 解析结果填充 items 即可，消费方 API 不变。
import * as THREE from 'three/webgpu';

export interface RespawnItem {
  name: string;
  position: THREE.Vector3;
  /** 出生朝向（绕 Y 弧度） */
  rotation: number;
}

export interface RespawnDescription {
  name: string;
  position: { x: number; y: number; z: number };
  rotation?: number;
}

export class Respawns {
  private readonly defaultName: string;
  readonly items = new Map<string, RespawnItem>();

  constructor(descriptions: RespawnDescription[], defaultName = 'landing') {
    this.defaultName = defaultName;

    for (const description of descriptions) {
      this.items.set(description.name, {
        name: description.name,
        position: new THREE.Vector3(
          description.position.x,
          description.position.y,
          description.position.z,
        ),
        rotation: description.rotation ?? 0,
      });
    }

    if (!this.items.has(this.defaultName))
      throw new Error(`[world/respawns] 默认重生点不存在：${this.defaultName}`);
  }

  getByName(name: string): RespawnItem | undefined {
    return this.items.get(name);
  }

  getDefault(): RespawnItem {
    return this.items.get(this.defaultName) as RespawnItem;
  }

  getClosest(position: { x: number; z: number }): RespawnItem {
    let closestItem: RespawnItem = this.getDefault();
    let closestDistance = Infinity;

    this.items.forEach((item) => {
      const distance = Math.hypot(item.position.x - position.x, item.position.z - position.z);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }
    });

    return closestItem;
  }
}
