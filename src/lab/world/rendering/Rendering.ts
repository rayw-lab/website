// 移植自 folio-2025 sources/Game/Rendering.js（184 行）。
// 保留：WebGPURenderer（不支持时自动回退 WebGL 2）、渲染器驱动 Ticker
// （setAnimationLoop → ticker.update，「渲染循环即游戏循环」）、
// renderOrder 排序纪律、tick order 998 渲染、viewport change 重设尺寸。
// 砍除（§9.1 第 7 项裁决）：cheapDOF（Spike 不需要）、Inspector、stats。
// CC-E4 回补后处理（D3 品质线，folio setPostprocessing 的 bloom 主干）：
//   RenderPipeline + 全彩通路 bloom（threshold 1：只有 emissive>1 的霓虹件起辉）。
//   迁移核对（three 0.185）：THREE.RenderPipeline 为 r183 起的正名
//   （PostProcessing 同名类保留为弃用别名）；bloom 仍自
//   three/addons/tsl/display/BloomNode.js 具名导出——folio 用法零改名直迁；
//   folio 的 _nMips 按档 5/2 属私有字段调优，本移植取默认 5、以档位关停代替。
// Quality 三档响应（实施方案 §5.3；quality.events 驱动，事件级切换）：
//   0 = bloom 全档 + 阴影 + DPR≤2 ｜ 1 = bloom 弱档 + 无阴影 + DPR≤1.5
//   2 = 后处理整段旁路（直连 renderer.render，零 pass 开销）+ 无阴影 + DPR≤1
// 改动：去 Game 单例耦合；?gl=1 强制 WebGL 2（本站 §9.2 保留参数）；补 dispose。
import * as THREE from 'three/webgpu';
import { pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import type { Game } from '../core/Game';
import type { QualityLevel } from '../core/Quality';

/** 三档 DPR 封顶（§5.3 表首行；移动端 1.5 沿用 SRD §12.4 纪律） */
const PIXEL_RATIO_CAPS: Record<QualityLevel, number> = { 0: 2, 1: 1.5, 2: 1 };

export class Rendering {
  private readonly game: Game;
  renderer!: THREE.WebGPURenderer;
  /** 实际后端（renderer.init() 后可信；WebGPU 缺失时 three 自动落到 WebGL 2） */
  isWebGPU = false;

  /** 后处理管线（start() 时组建；Quality 2 整段旁路） */
  pipeline: THREE.RenderPipeline | null = null;
  /** bloom 通路（debug 走查可直调 strength/threshold/radius value） */
  bloomPass: ReturnType<typeof bloom> | null = null;
  private postEnabled = true;

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
    this.setPostProcessing();
    this.applyQuality(this.game.quality.level);
    this.game.quality.events.on('change', (level: QualityLevel) => {
      this.applyQuality(level);
    });

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

  /** 后处理组建（folio setPostprocessing 主干；需 view.camera 已就位——start() 时序保证） */
  private setPostProcessing(): void {
    const scenePass = pass(this.game.scene, this.game.view.camera);
    const scenePassColor = scenePass.getTextureNode('output');

    // threshold 1 = 线性色值超 1 才起辉：楼宇亮窗（≈1.3）、招牌（≥2）、信标（3）
    // 进入辉光，路面网格底纹（≤0.9）与普通照明不受污染
    this.bloomPass = bloom(scenePassColor, 0.55, 0, 1);
    this.bloomPass.smoothWidth.value = 1;

    this.pipeline = new THREE.RenderPipeline(this.renderer);
    this.pipeline.outputNode = scenePassColor.add(this.bloomPass);
  }

  /**
   * Quality 三档渲染响应（§5.3：DPR / bloom / 阴影三行的执行体；
   * 事件级操作——切档时一次性调整，不在渲染热路径上）。
   */
  private applyQuality(level: QualityLevel): void {
    // DPR 封顶（antialias 建器时按初始 DPR 定死，运行时只调分辨率）
    this.game.viewport.pixelRatioMax = PIXEL_RATIO_CAPS[level];
    this.game.viewport.measure();
    this.resize();

    // bloom：0 全档 / 1 弱档 / 2 整段旁路（render() 直连，零后处理开销）
    this.postEnabled = level < 2;
    if (this.bloomPass) this.bloomPass.strength.value = level === 0 ? 0.55 : 0.3;

    // 阴影：仅桌面全效档（切换时全场材质重编译——事件级成本，可接受）
    const shadowsEnabled = level === 0;
    if (this.renderer.shadowMap.enabled !== shadowsEnabled) {
      this.renderer.shadowMap.enabled = shadowsEnabled;
      this.game.scene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) material.needsUpdate = true;
        }
      });
    }
  }

  private resize(): void {
    this.renderer.setSize(this.game.viewport.width, this.game.viewport.height);
    this.renderer.setPixelRatio(this.game.viewport.pixelRatio);
  }

  private render(): void {
    if (this.pipeline && this.postEnabled) {
      this.pipeline.render();
    } else {
      this.renderer.render(this.game.scene, this.game.view.camera);
    }
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
    this.pipeline?.dispose();
    this.pipeline = null;
    this.bloomPass = null;
    this.renderer.dispose();

    // dispose 后原 canvas 的 GL 上下文不可复用：原位克隆置换，保证可重复挂载
    //（spike engine.ts dispose 纪律迁入；WS-E2E-07 再挂载链路依赖此行为）
    const canvas = this.game.canvasElement;
    canvas.replaceWith(canvas.cloneNode(false) as HTMLCanvasElement);
  }
}
