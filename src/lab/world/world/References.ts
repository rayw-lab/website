// 移植自 folio-2025 sources/Game/References.js（52 行，零逻辑改动，加类型）。
// Blender 命名 → 引用点注册表：节点名 ref/reference 前缀（可带序号）自动归组。
// 灰盒 Spike 无 GLB 输入，Phase B 资产管线（respawns/POI/道具锚点）的解析底座。
import type * as THREE from 'three/webgpu';

export class References {
  readonly items = new Map<string, THREE.Object3D[]>();

  constructor(model?: THREE.Object3D) {
    if (model) this.parse(model);
  }

  parse(object: THREE.Object3D): void {
    object.traverse((child) => {
      const name = child.name;

      // 任何 "ref" / "reference" 开头的节点（结尾可带序号）
      const matches = name.match(/^ref(?:erence)?([^0-9]+)([0-9]+)?$/);
      if (matches) {
        // 去掉前缀与序号，首字母小写
        const referenceName = matches[1].charAt(0).toLowerCase() + matches[1].slice(1);

        const existing = this.items.get(referenceName);
        if (existing) existing.push(child);
        else this.items.set(referenceName, [child]);
      }
    });
  }

  getStartingWith(searched: string): Map<string, THREE.Object3D[]> {
    const items = new Map<string, THREE.Object3D[]>();

    this.items.forEach((value, name) => {
      if (name.startsWith(searched)) {
        let stripName = name.replace(new RegExp(`^${searched}(.+)$`), '$1');
        stripName = stripName.charAt(0).toLowerCase() + stripName.slice(1);

        items.set(stripName, value);
      }
    });

    return items;
  }
}
