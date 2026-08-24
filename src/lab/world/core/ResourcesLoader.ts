// 移植自 folio-2025 sources/Game/ResourcesLoader.js（123 行）。
// 改动：去 Game 单例耦合（注入 game 取 renderer 做 KTX2 detectSupport）；
// loader 路径接本站管线——Draco/Basis 解码器不设路径，r185 起 loader 内置
// import.meta.url 解析，由 bundler 自动携带 wasm 产物（与 car-configurator 同款）；
// 修复原版空清单永不 resolve 的边界（Spike 灰盒零资产也要能走完两阶段加载）。
import * as THREE from 'three/webgpu';
import type { WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import type { Game } from './Game';

export type ResourceType = 'texture' | 'textureKtx' | 'draco' | 'gltf';

/** [资源名, URL, loader 类型, 可选 modifier（colorSpace/filter 等就地修饰）] */
export type ResourceFile = [string, string, ResourceType, ((resource: unknown) => void)?];

export type ResourceMap = Record<string, unknown>;

interface AnyLoader {
  load(
    url: string,
    onLoad: (resource: unknown) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void;
}

export class ResourcesLoader {
  private readonly game: Game;
  private readonly loaders = new Map<ResourceType, AnyLoader>();
  private readonly cache = new Map<string, unknown>();

  constructor(game: Game) {
    this.game = game;
  }

  getLoader(type: ResourceType): AnyLoader {
    const existing = this.loaders.get(type);
    if (existing) return existing;

    let loader: AnyLoader;

    if (type === 'texture') {
      loader = new THREE.TextureLoader();
    } else if (type === 'textureKtx') {
      const ktx2 = new KTX2Loader();
      // 类型断言与 car-configurator 同因：detectSupport 类型签名要求核心包
      // WebGLRenderer，运行时传 WebGPURenderer 是受支持的。
      ktx2.detectSupport(this.game.rendering.renderer as unknown as WebGLRenderer);
      loader = ktx2;
    } else if (type === 'draco') {
      const draco = new DRACOLoader();
      draco.preload();
      loader = draco;
    } else {
      const dracoLoader = this.getLoader('draco') as DRACOLoader;
      const ktx2Loader = this.getLoader('textureKtx') as KTX2Loader;

      const gltf = new GLTFLoader();
      gltf.setDRACOLoader(dracoLoader);
      gltf.setKTX2Loader(ktx2Loader);
      loader = gltf;
    }

    this.loaders.set(type, loader);

    return loader;
  }

  load(
    files: ResourceFile[],
    progressCallback: ((toLoad: number, total: number) => void) | null = null,
  ): Promise<ResourceMap> {
    return new Promise((resolve, reject) => {
      let toLoad = files.length;
      const loadedResources: ResourceMap = {};

      // 空清单：立即完成（folio 原版此处会卡死——灰盒 Spike 必须能零资产走通）
      if (toLoad === 0) {
        progressCallback?.(0, 0);
        resolve(loadedResources);
        return;
      }

      const progress = () => {
        toLoad--;

        progressCallback?.(toLoad, files.length);

        if (toLoad === 0) resolve(loadedResources);
      };

      const save = (file: ResourceFile, resource: unknown) => {
        // 就地修饰（colorSpace / filter / wrap 等）
        file[3]?.(resource);

        loadedResources[file[0]] = resource;
        this.cache.set(file[1], resource);
      };

      const error = (file: ResourceFile) => {
        console.error(`[world/resources] 加载失败：${file[1]}`);
        reject(new Error(`resource load failed: ${file[1]}`));
      };

      for (const file of files) {
        if (this.cache.has(file[1])) {
          loadedResources[file[0]] = this.cache.get(file[1]);
          progress();
        } else {
          const loader = this.getLoader(file[2]);
          loader.load(
            file[1],
            (resource) => {
              save(file, resource);
              progress();
            },
            undefined,
            () => error(file),
          );
        }
      }
    });
  }
}
