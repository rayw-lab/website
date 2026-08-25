// 移植自 folio-2025 sources/Game/PreRenderer.js（34 行，MIT，commit 41046b5）。
// 职责：32px CubeCamera 把全场景强制渲一遍，逼渲染器为所有材质预编译管线——
// 首帧/揭幕前消灭 shader 编译卡顿（SRD §12.7.2「shader 预热」行；Game 启动坑④
// 的 ticker.wait(3) 等的就是这类编译落地）。
// folio 调用门（Game.js L203-204）：仅 quality 0 且 WebGPU 后端——低端设备跳过，
// 防离屏渲染引发上下文丢失（§12.7.2 同款口径）；调用方自持此门（见 city/index.ts）。
// 迁移核对（three 0.185）：CubeRenderTarget 自 three/webgpu 具名导出（folio 从
// three/src/renderers/common/ 深路径引入，0.185 已在 webgpu 出口暴露，改走公开面）。
// 改动：去 Game 单例（传参）；补渲染后清场（cubeCamera 出场景 + renderTarget 释放，
// folio 原文遗留在场景里）；尊重 userData.preventPreRender 约定原样保留。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';

export class PreRenderer {
  /** 全场景管线预编译（挂载段末拍调用一次；调用方守 quality/后端门） */
  static render(game: Game): void {
    const renderTarget = new THREE.CubeRenderTarget(32);
    const cubeCamera = new THREE.CubeCamera(1, 100000, renderTarget);
    game.scene.add(cubeCamera);

    // 隐藏物一并编译（reveal/热交换时才现身的件，首秀不能卡）——
    // 标记 userData.preventPreRender 的除外
    const invisibles: THREE.Object3D[] = [];
    game.scene.traverse((child) => {
      if (child.visible === false && typeof child.userData.preventPreRender === 'undefined') {
        child.visible = true;
        invisibles.push(child);
      }
    });

    cubeCamera.update(game.rendering.renderer, game.scene);

    for (const child of invisibles) child.visible = false;

    game.scene.remove(cubeCamera);
    renderTarget.dispose();
  }
}
