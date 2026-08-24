// world Spike 引擎装配（Phase A · roadmap §7.2 Step 5-7）。
// 职责：渲染器（WebGPU→WebGL2 自动回退）+ 资产加载（共享 loader）+ 灰盒场景
// + CarConcept rig + 运动学控制器 + 输入 + 追尾相机 + HUD/帧率仪表 + 生命周期。
// 本文件是重资产分包：只允许经 index.ts 的 mount() 动态 import。
//
// 与并行「引擎层」任务的对接约定（合并时）：本装配器 = Game.ts 两阶段 init 的
// 单文件精简版；vehicle/carRig/inputs/camera 四个模块按原样插进正式 Game 循环
// （tick order：inputs → vehicle.step → scene.update → rig/camera → render）。
import * as THREE from 'three/webgpu';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import type { LabInstance, LabMountOptions } from '../../../contracts';
import { createGltfLoaderBundle } from '../../../shared/gltf-loaders';
import { buildCarRig } from './carRig';
import { ChaseCamera } from './camera';
import { createDriveInputs } from './inputs';
import { CONE_PARAMS, VEHICLE_PARAMS } from './params';
import { createGrayboxWorld } from './scene';
import { KinematicVehicle } from './vehicle';

/** 测试/调参钩子的全局声明（Spike 专用，dispose 时删除） */
declare global {
  interface Window {
    __worldSpike?: {
      backend: string;
      params: typeof VEHICLE_PARAMS;
      state: () => {
        x: number;
        y: number;
        z: number;
        yaw: number;
        speedKmh: number;
        grounded: boolean;
        cones: number;
      };
      fps: () => { avg: number; low1: number };
      info: () => { drawCalls: number; triangles: number };
    };
  }
}

/** 帧率仪表：滑动窗口平均 + 1% low（roadmap §7.3 Step 9 门禁读数） */
class FpsMeter {
  private samples: number[] = [];
  push(dt: number): void {
    if (dt <= 0) return;
    this.samples.push(dt);
    if (this.samples.length > 360) this.samples.shift(); // ~6s @60fps
  }
  read(): { avg: number; low1: number } {
    if (this.samples.length < 10) return { avg: 0, low1: 0 };
    const sum = this.samples.reduce((a, b) => a + b, 0);
    const sorted = [...this.samples].sort((a, b) => b - a);
    const worstN = Math.max(1, Math.floor(sorted.length * 0.01));
    const worst = sorted.slice(0, worstN).reduce((a, b) => a + b, 0) / worstN;
    return { avg: this.samples.length / sum, low1: 1 / worst };
  }
}

export async function createWorldSpike(opts: LabMountOptions): Promise<LabInstance> {
  const { host, params } = opts;
  const $ = <T extends HTMLElement>(sel: string): T | null => host.querySelector<T>(sel);
  const stage = $('[data-ws-stage]')!;
  const canvas = $<HTMLElement>('[data-ws-canvas]') as unknown as HTMLCanvasElement;
  const hudSpeed = $('[data-ws-speed]');
  const hudFps = $('[data-ws-fps]');
  const hudCones = $('[data-ws-cones]');
  const hudHint = $('[data-ws-hint]');
  const joystickHost = $('[data-ws-joystick]');

  const coarsePointer = matchMedia('(pointer: coarse)').matches;

  // ---- 渲染器：WebGPU 优先，WebGL2 自动回退（?gl=1 强制回退验证） ----
  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias: true,
    forceWebGL: params.get('gl') === '1',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  // DPR 封顶：移动 1.5 / 桌面 2（帧预算三板斧的第一板，roadmap §7.3）
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.5 : 2));
  await renderer.init();
  const isWebGPU = Boolean((renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend);
  opts.onBackend?.(isWebGPU ? 'webgpu' : 'webgl2');

  // ---- 资产：CarConcept（3.5MB 复用豁免）+ 配置器同款 HDRI —— 共享 loader ----
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const loaders = createGltfLoaderBundle(renderer, opts.onProgress);
  const [gltf, envTex] = await Promise.all([
    loaders.gltfLoader.loadAsync(`${base}/models/car-concept/CarConcept.gltf`),
    new HDRLoader(loaders.manager).loadAsync(`${base}/hdri/studio_small_08_1k.hdr`),
  ]);
  opts.onProgress?.(1, 1);

  // ---- 世界装配 ----
  const world = createGrayboxWorld(envTex);
  const rig = buildCarRig(gltf);
  world.scene.add(rig.root);
  const vehicle = new KinematicVehicle(rig.geometry);
  const inputs = createDriveInputs(stage, joystickHost);
  const chase = new ChaseCamera(stage.clientWidth / Math.max(stage.clientHeight, 1), vehicle);
  vehicle.applyToObject(rig.root);
  chase.snap(vehicle);

  // ---- 帧循环 ----
  // 车辆 dt 纪律（folio §5.3）：30 帧滑动平均 + clamp，与渲染瞬时 dt 分离，
  // 帧尖峰只影响画面节奏、不打乱手感积分。
  const dtWindow: number[] = [];
  let dtSum = 0;
  const fps = new FpsMeter();
  let last = performance.now();
  let hudClock = 0;
  let disposed = false;

  const loop = () => {
    const now = performance.now();
    const wallDt = (now - last) / 1000; // 未 clamp 的真实帧间隔（帧率仪表读真值）
    const rawDt = Math.min(wallDt, 1 / 20); // 物理 dt clamp：低于 20fps 世界进入慢动作而非隧穿
    last = now;
    fps.push(wallDt);

    dtWindow.push(rawDt);
    dtSum += rawDt;
    if (dtWindow.length > 30) dtSum -= dtWindow.shift()!;
    const vehicleDt = dtSum / dtWindow.length;

    if (inputs.consumeRespawn()) {
      vehicle.respawn();
      world.resetCones();
      chase.snap(vehicle);
    }
    const intent = inputs.read();
    vehicle.step(vehicleDt, intent, world.groundMeshes);
    const hits = world.update(vehicleDt, vehicle);
    if (hits > 0) {
      // 撞锥桶的代价：按命中数扣纵向速度（有反馈但不打断驾驶）
      const keep = Math.pow(CONE_PARAMS.carSpeedKeep, hits);
      vehicle.velocity.multiplyScalar(keep);
      vehicle.speed *= keep;
    }
    vehicle.applyToObject(rig.root);
    rig.update(vehicle.steer, vehicle.wheelSpin);
    chase.update(rawDt, vehicle, intent);

    hudClock += rawDt;
    if (hudClock > 0.25) {
      hudClock = 0;
      if (hudSpeed) hudSpeed.textContent = String(Math.round(Math.abs(vehicle.speed) * 3.6));
      const f = fps.read();
      if (hudFps) {
        hudFps.textContent = f.avg > 0 ? `${f.avg.toFixed(0)} / ${f.low1.toFixed(0)}` : '—';
      }
      if (hudCones) hudCones.textContent = String(world.knockedCount());
      if (hudHint && inputs.hasDriven()) hudHint.dataset.dismissed = 'true';
    }

    void renderer.render(world.scene, chase.camera);
  };

  const setRunning = (run: boolean) => {
    if (disposed) return;
    if (run) {
      last = performance.now();
      renderer.setAnimationLoop(loop);
    } else {
      renderer.setAnimationLoop(null);
    }
  };

  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    chase.setAspect(w / h);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  setRunning(true);

  // 测试/调参钩子（Spike 专用；Phase B 换 Tweakpane #debug 面板）
  window.__worldSpike = {
    backend: isWebGPU ? 'webgpu' : 'webgl2',
    params: VEHICLE_PARAMS,
    state: () => ({
      x: vehicle.position.x,
      y: vehicle.pose.y,
      z: vehicle.position.z,
      yaw: vehicle.yaw,
      speedKmh: Math.abs(vehicle.speed) * 3.6,
      grounded: vehicle.grounded,
      cones: world.knockedCount(),
    }),
    fps: () => fps.read(),
    // 场景复杂度读数（drawCalls/triangles）——帧率论证的硬件无关依据
    info: () => ({
      drawCalls: renderer.info.render.drawCalls,
      triangles: renderer.info.render.triangles,
    }),
  };

  // ---- LabInstance 契约 ----
  const disposeMaterial = (mat: THREE.Material) => {
    for (const value of Object.values(mat)) {
      if (value && typeof value === 'object' && 'isTexture' in value) {
        (value as THREE.Texture).dispose();
      }
    }
    mat.dispose();
  };

  return {
    pause: () => setRunning(false),
    resume: () => setRunning(true),
    dispose: () => {
      if (disposed) return;
      setRunning(false);
      disposed = true;
      resizeObserver.disconnect();
      inputs.dispose();
      delete window.__worldSpike;
      world.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(disposeMaterial);
      });
      world.dispose();
      envTex.dispose();
      loaders.dispose();
      void renderer.dispose();
      // dispose 后原 canvas 的 GL 上下文不可复用：原位克隆置换，保证可重复挂载
      canvas.replaceWith(canvas.cloneNode(false));
    },
  };
}
