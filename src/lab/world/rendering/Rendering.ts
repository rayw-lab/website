// 移植自 folio-2025 sources/Game/Rendering.js（184 行）。
// 保留：WebGPURenderer（不支持时自动回退 WebGL 2）、渲染器驱动 Ticker
// （setAnimationLoop → ticker.update，「渲染循环即游戏循环」）、
// renderOrder 排序纪律、tick order 998 渲染、viewport change 重设尺寸。
// 砍除（§9.1 第 7 项裁决）：后处理全砍（bloom/cheapDOF Spike 不需要）、Inspector、stats。
// 改动：去 Game 单例耦合；?gl=1 强制 WebGL 2（本站 §9.2 保留参数）；补 dispose。
import * as THREE from 'three/webgpu';
import type { Game } from '../core/Game';

export class Rendering {
  private readonly game: Game;
  renderer!: THREE.WebGPURenderer;
  /** 实际后端（renderer.init() 后可信；WebGPU 缺失时 three 自动落到 WebGL 2） */
  isWebGPU = false;

  constructor(game: Game) {
    this.game = game;
  }

  async setRenderer(options: { forceWebGL: boolean }): Promise<THREE.WebGPURenderer> {
    this.renderer = new THREE.WebGPURenderer({
      canvas: this.game.canvasElement,
      powerPreference: 'high-performance',
      forceWebGL: options.forceWebGL,
      antialias: this.game.viewport.pixelRatio < 2,
    });
    this.renderer.setSize(this.game.viewport.width, this.game.viewport.height);
    this.renderer.setPixelRatio(this.game.viewport.pixelRatio);
    this.renderer.sortObjects = false;

    this.renderer.shadowMap.enabled = true;
    this.renderer.setOpaqueSort((a, b) => (a.renderOrder ?? 0) - (b.renderOrder ?? 0));
    this.renderer.setTransparentSort((a, b) => (a.renderOrder ?? 0) - (b.renderOrder ?? 0));

    // ★ 渲染器驱动 ticker（folio Rendering.js L68）：从这行起 tick 总线开始跳动
    this.renderer.setAnimationLoop((elapsedTime: number) => {
      this.game.ticker.update(elapsedTime);
    });

    await this.renderer.init();

    this.isWebGPU = Boolean(
      (this.renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend,
    );

    return this.renderer;
  }

  /** 挂上渲染 tick（order 998）——必须先于世界构建调用（Game 启动坑②） */
  start(): void {
    this.game.ticker.events.on(
      'tick',
      () => {
        this.render();
      },
      998,
    );

    this.game.viewport.events.on('change', () => {
      this.resize();
    });
  }

  private resize(): void {
    this.renderer.setSize(this.game.viewport.width, this.game.viewport.height);
    this.renderer.setPixelRatio(this.game.viewport.pixelRatio);
  }

  private render(): void {
    this.renderer.render(this.game.scene, this.game.view.camera);
  }

  /** mount 契约：pause 时停帧循环（RAF 必须停，SRD §9.2） */
  pause(): void {
    this.renderer.setAnimationLoop(null);
  }

  resume(): void {
    this.renderer.setAnimationLoop((elapsedTime: number) => {
      this.game.ticker.update(elapsedTime);
    });
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();

    // dispose 后原 canvas 的 GL 上下文不可复用：原位克隆置换，保证可重复挂载
    //（spike engine.ts dispose 纪律迁入；WS-E2E-07 再挂载链路依赖此行为）
    const canvas = this.game.canvasElement;
    canvas.replaceWith(canvas.cloneNode(false) as HTMLCanvasElement);
  }
}
