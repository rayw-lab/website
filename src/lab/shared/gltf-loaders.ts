// 共享 GLTF 加载器组（Draco + KTX2 + LoadingManager）——
// car-configurator 与 world Spike 的公共加载逻辑（roadmap §7.2 Step 6「共享 loader」）。
// Draco / Basis 解码器不设路径：three r185 起 loader 内置 import.meta.url 解析，
// 由 bundler 自动携带 wasm 产物（带内容 hash，走同源 CDN 缓存）。
import * as THREE from 'three/webgpu';
// 仅类型导入：KTX2Loader.detectSupport 的类型签名要求核心包的 WebGLRenderer，
// 而 three/webgpu 的类型不再导出它（运行时传 WebGPURenderer 是受支持的）。
import type { WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

export interface GltfLoaderBundle {
  manager: THREE.LoadingManager;
  gltfLoader: GLTFLoader;
  /** 模块 dispose 时必须调用（释放 Draco/Basis worker 与 wasm 实例） */
  dispose(): void;
}

/**
 * 建一组带 Draco/KTX2 支持的 GLTF 加载器。
 * @param renderer 已 init 的 WebGPURenderer（KTX2 转码目标格式探测需要它）
 * @param onProgress LoadingManager 汇总进度（喂 facade 进度条）
 */
export function createGltfLoaderBundle(
  renderer: THREE.WebGPURenderer,
  onProgress?: (loaded: number, total: number) => void,
): GltfLoaderBundle {
  const manager = new THREE.LoadingManager();
  if (onProgress) {
    manager.onProgress = (_url, loaded, total) => onProgress(loaded, Math.max(total, 1));
  }
  const dracoLoader = new DRACOLoader(manager);
  const ktx2Loader = new KTX2Loader(manager).detectSupport(
    renderer as unknown as WebGLRenderer,
  );
  const gltfLoader = new GLTFLoader(manager)
    .setDRACOLoader(dracoLoader)
    .setKTX2Loader(ktx2Loader);

  return {
    manager,
    gltfLoader,
    dispose() {
      dracoLoader.dispose();
      void ktx2Loader.dispose();
    },
  };
}
