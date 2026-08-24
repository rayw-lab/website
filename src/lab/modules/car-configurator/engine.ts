// 3D 车辆配置器引擎（LAB RB-01，vanilla TS，无框架依赖）。
// 渲染：three/webgpu 的 WebGPURenderer（不支持 WebGPU 时自动回退 WebGL 2）。
// 资产：Khronos CarConcept（CC BY 4.0，Draco + KTX2 官方压缩变体）+ Poly Haven 影棚 HDRI（CC0）。
// 本文件是重资产分包：只允许经 index.ts 的 mount() 动态 import（SRD §12.2 第 3 步），
// 生命周期（挂载条件/暂停/卸载/进度/后端徽章）全部交给统一 facade（§9.2）。
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import type { LabInstance, LabMountOptions } from '../../contracts';
import {
  PAINTS,
  WHEELS,
  LIVERIES,
  FINISH_PARAMS,
  DEFAULT_STATE,
  type ConfiguratorState,
  type SectionId,
} from './presets';

interface VariantMapping {
  material: number;
  variants: number[];
}

interface CameraView {
  pos: THREE.Vector3;
  target: THREE.Vector3;
}

type Ease = (t: number) => number;
const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** 程序化接触阴影贴图（径向渐变，替代实时阴影 —— 移动端零开销） */
function makeContactShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 16, 128, 128, 128);
  g.addColorStop(0, 'rgba(0,0,0,0.62)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.34)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export async function createCarConfigurator(opts: LabMountOptions): Promise<LabInstance> {
  const { host, params } = opts;
  const $ = <T extends HTMLElement>(sel: string): T | null => host.querySelector<T>(sel);
  const stage = $('[data-lab-stage]')!;
  const canvas = $<HTMLElement>('[data-cfg-canvas]') as unknown as HTMLCanvasElement;
  const statusName = $('[data-cfg-config-name]');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;

  /** 事件登记表：dispose 时统一解绑（模块必须释放全部监听，§9.2） */
  const listeners: Array<{ el: EventTarget; type: string; fn: EventListener }> = [];
  const on = (el: EventTarget, type: string, fn: EventListener) => {
    el.addEventListener(type, fn);
    listeners.push({ el, type, fn });
  };

  // ---- 渲染器：WebGPU 优先，WebGL 2 自动回退（?gl=1 可强制回退用于验证，§9.2 保留参数） ----
  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias: true,
    forceWebGL: params.get('gl') === '1',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  // 移动端 DPR 封顶 1.5，桌面 2 —— 控制像素负载（SRD §12.4 配套纪律）
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.5 : 2));
  await renderer.init();
  const isWebGPU = Boolean(
    (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend,
  );
  opts.onBackend?.(isWebGPU ? 'webgpu' : 'webgl2');

  // ---- 资产加载（LoadingManager 汇总进度 → facade 进度条） ----
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => opts.onProgress?.(loaded, Math.max(total, 1));

  // Draco / Basis 解码器不设路径：r185 起 loader 内置 import.meta.url 解析，
  // 由 bundler 自动携带 wasm 产物（带内容 hash，走同源 CDN 缓存）。
  const dracoLoader = new DRACOLoader(manager);
  const ktx2Loader = new KTX2Loader(manager).detectSupport(
    renderer as unknown as THREE.WebGLRenderer,
  );
  const gltfLoader = new GLTFLoader(manager)
    .setDRACOLoader(dracoLoader)
    .setKTX2Loader(ktx2Loader);

  const [gltf, envTex] = await Promise.all([
    gltfLoader.loadAsync(`${base}/models/car-concept/CarConcept.gltf`),
    new HDRLoader(manager).loadAsync(`${base}/hdri/studio_small_08_1k.hdr`),
  ]);
  opts.onProgress?.(1, 1);

  // ---- 场景：影棚 HDRI 环境光 + 深色地面 + 接触阴影 ----
  const scene = new THREE.Scene();
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envTex;
  scene.environmentIntensity = 0.95;
  const bgColor = new THREE.Color('#101216');
  scene.background = bgColor;

  const car = gltf.scene;
  const bbox = new THREE.Box3().setFromObject(car);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());
  car.position.set(car.position.x - center.x, car.position.y - bbox.min.y, car.position.z - center.z);
  scene.add(car);
  const radius = Math.max(size.x, size.z) * 0.5;

  scene.fog = new THREE.Fog(bgColor, radius * 4.5, radius * 9);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 9, 64),
    new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.94, metalness: 0 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const shadowTexture = makeContactShadowTexture();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(size.x * 1.08, size.z * 1.3, 1);
  shadow.position.y = 0.015;
  shadow.renderOrder = 1;
  scene.add(shadow);

  // ---- 相机与轨道控制 ----
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, radius * 60);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = radius * 1.1;
  controls.maxDistance = radius * 3.4;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = -0.6;

  const orbitPos = (azDeg: number, elDeg: number, dist: number, target: THREE.Vector3): THREE.Vector3 => {
    const az = (azDeg * Math.PI) / 180;
    const el = (elDeg * Math.PI) / 180;
    return new THREE.Vector3(
      target.x + dist * Math.cos(el) * Math.sin(az),
      target.y + dist * Math.sin(el),
      target.z + dist * Math.cos(el) * Math.cos(az),
    );
  };

  const bodyTarget = new THREE.Vector3(0, size.y * 0.34, 0);
  const wheelNode = car.getObjectByName('WheelFrontL');
  const wheelTarget = wheelNode
    ? wheelNode.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.05, 0))
    : bodyTarget.clone();
  const wheelAz = (Math.atan2(wheelTarget.x, wheelTarget.z) * 180) / Math.PI;

  const VIEWS: Record<SectionId, CameraView> = {
    paint: { pos: orbitPos(-38, 13, radius * 2.3, bodyTarget), target: bodyTarget },
    wheels: { pos: orbitPos(wheelAz + 24, 6, radius * 1.25, wheelTarget), target: wheelTarget },
    livery: { pos: orbitPos(118, 24, radius * 2.5, bodyTarget), target: bodyTarget },
  };

  // ---- 补间与按需渲染循环（静止时不重绘） ----
  interface Tween {
    start: number;
    dur: number;
    ease: Ease;
    update: (k: number) => void;
  }
  const tweens: Tween[] = [];
  let needsRender = true;
  const invalidate = () => {
    needsRender = true;
  };
  const addTween = (dur: number, update: (k: number) => void, ease: Ease = easeOutCubic) => {
    if (dur <= 0 || reduceMotion) {
      update(1);
      invalidate();
      return;
    }
    tweens.push({ start: performance.now(), dur, ease, update });
    invalidate();
  };

  let rafId = 0;
  let running = false;
  let disposed = false;
  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame);
    for (let i = tweens.length - 1; i >= 0; i--) {
      const t = tweens[i]!;
      const k = Math.min(1, (now - t.start) / t.dur);
      t.update(t.ease(k));
      if (k >= 1) tweens.splice(i, 1);
      needsRender = true;
    }
    controls.update();
    if (needsRender) {
      needsRender = false;
      renderer.render(scene, camera);
    }
  };
  /** RAF 开关：facade 经 pause()/resume() 驱动（离屏/隐藏标签页 RAF 必须停，§9.2） */
  const setRunning = (v: boolean) => {
    if (disposed || v === running) return;
    running = v;
    if (v) {
      needsRender = true;
      rafId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(rafId);
    }
  };

  controls.addEventListener('change', invalidate);
  let camToken = 0;
  controls.addEventListener('start', () => {
    controls.autoRotate = false; // 用户首次交互后停止展台自转
    camToken++; // 取消进行中的运镜
  });

  const flyTo = (view: CameraView, dur = 950) => {
    camToken++;
    const token = camToken;
    const p0 = camera.position.clone();
    const t0 = controls.target.clone();
    addTween(
      dur,
      (k) => {
        if (token !== camToken) return;
        camera.position.lerpVectors(p0, view.pos, k);
        controls.target.lerpVectors(t0, view.target, k);
      },
      easeInOutCubic,
    );
  };

  // ---- 材质槽收集（加载时一次性遍历，运行时零 traverse） ----
  const variantMeshes: { mesh: THREE.Mesh; mappings: VariantMapping[] }[] = [];
  const paint1Meshes: THREE.Mesh[] = [];
  let paint1Source: THREE.MeshPhysicalMaterial | null = null;
  let rim1: THREE.MeshStandardMaterial | null = null;
  let rim2: THREE.MeshStandardMaterial | null = null;

  car.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const gltfExt = (mesh.userData as { gltfExtensions?: Record<string, { mappings?: VariantMapping[] }> })
      .gltfExtensions;
    const mappings = gltfExt?.['KHR_materials_variants']?.mappings;
    if (mappings) variantMeshes.push({ mesh, mappings });
    const mat = mesh.material as THREE.Material;
    if (Array.isArray(mat) || !mat) return;
    if (mat.name.startsWith('Paint 1')) {
      paint1Meshes.push(mesh);
      paint1Source ??= mat as THREE.MeshPhysicalMaterial;
    } else if (mat.name === 'Rim1') {
      rim1 ??= mat as THREE.MeshStandardMaterial;
    } else if (mat.name === 'Rim2') {
      rim2 ??= mat as THREE.MeshStandardMaterial;
    }
  });

  const variantsDef =
    (gltf.userData as { gltfExtensions?: Record<string, { variants?: { name: string }[] }> }).gltfExtensions?.[
      'KHR_materials_variants'
    ]?.variants ?? [];
  const variantNames = variantsDef.map((v) => v.name);

  // 自定义车漆材质：从原厂 Paint 1 克隆（保留法线 / AO 贴图与清漆层）
  const customPaint = paint1Source!.clone();
  customPaint.name = 'Paint 1 Custom';

  const rimDefaults = {
    r1: { color: rim1!.color.clone(), roughness: rim1!.roughness, metalness: rim1!.metalness },
    r2: { color: rim2!.color.clone(), roughness: rim2!.roughness, metalness: rim2!.metalness },
  };

  // ---- 配置状态（深链参数已由 facade 按 manifest 白名单过滤：paint / wheels / livery / gl） ----
  const state: ConfiguratorState = { ...DEFAULT_STATE };
  {
    const l = params.get('livery');
    const p = params.get('paint');
    const w = params.get('wheels');
    if (l && LIVERIES.some((x) => x.id === l)) state.livery = l;
    if (p && (p === 'livery' || PAINTS.some((x) => x.id === p))) state.paint = p;
    if (w && WHEELS.some((x) => x.id === w)) state.wheels = w;
  }

  function applyPaint(id: string, animate: boolean): void {
    state.paint = id;
    if (id === 'livery') {
      for (const mesh of paint1Meshes) {
        const vm = mesh.userData.variantMaterial as THREE.Material | undefined;
        if (vm) mesh.material = vm;
      }
      invalidate();
      return;
    }
    const preset = PAINTS.find((x) => x.id === id);
    if (!preset) return;
    const fp = FINISH_PARAMS[preset.finish];
    for (const mesh of paint1Meshes) mesh.material = customPaint;
    const toColor = new THREE.Color(preset.color);
    if (animate) {
      const fromColor = customPaint.color.clone();
      const from = {
        m: customPaint.metalness,
        r: customPaint.roughness,
        c: customPaint.clearcoat,
        cr: customPaint.clearcoatRoughness,
        i: customPaint.iridescence,
      };
      addTween(380, (k) => {
        customPaint.color.lerpColors(fromColor, toColor, k);
        customPaint.metalness = lerp(from.m, fp.metalness, k);
        customPaint.roughness = lerp(from.r, fp.roughness, k);
        customPaint.clearcoat = lerp(from.c, fp.clearcoat, k);
        customPaint.clearcoatRoughness = lerp(from.cr, fp.clearcoatRoughness, k);
        customPaint.iridescence = lerp(from.i, fp.iridescence, k);
      });
    } else {
      customPaint.color.copy(toColor);
      customPaint.metalness = fp.metalness;
      customPaint.roughness = fp.roughness;
      customPaint.clearcoat = fp.clearcoat;
      customPaint.clearcoatRoughness = fp.clearcoatRoughness;
      customPaint.iridescence = fp.iridescence;
    }
    invalidate();
  }

  function applyWheels(id: string, animate: boolean): void {
    state.wheels = id;
    const stealth = id === 'stealth';
    const to2 = stealth
      ? { color: new THREE.Color('#17181b'), roughness: 0.34, metalness: 1 }
      : rimDefaults.r2;
    const to1 = stealth
      ? { color: new THREE.Color('#0a0a0b'), roughness: 0.5, metalness: rimDefaults.r1.metalness }
      : rimDefaults.r1;
    const apply = (mat: THREE.MeshStandardMaterial, to: typeof to1, fromColor: THREE.Color, from: { r: number; m: number }, k: number) => {
      mat.color.lerpColors(fromColor, to.color, k);
      mat.roughness = lerp(from.r, to.roughness, k);
      mat.metalness = lerp(from.m, to.metalness, k);
    };
    const f1 = { c: rim1!.color.clone(), r: rim1!.roughness, m: rim1!.metalness };
    const f2 = { c: rim2!.color.clone(), r: rim2!.roughness, m: rim2!.metalness };
    addTween(animate ? 320 : 0, (k) => {
      apply(rim1!, to1, f1.c, { r: f1.r, m: f1.m }, k);
      apply(rim2!, to2, f2.c, { r: f2.r, m: f2.m }, k);
    });
  }

  async function applyLivery(id: string): Promise<void> {
    state.livery = id;
    const livery = LIVERIES.find((x) => x.id === id) ?? LIVERIES[0]!;
    const idx = variantNames.indexOf(livery.variantName);
    const parser = gltf.parser as unknown as {
      getDependency: (type: string, index: number) => Promise<THREE.Material>;
      assignFinalMaterial?: (mesh: THREE.Mesh) => void;
    };
    await Promise.all(
      variantMeshes.map(async ({ mesh, mappings }) => {
        const mapping = mappings.find((m) => m.variants.includes(idx));
        if (!mapping) return;
        const mat = await parser.getDependency('material', mapping.material);
        mesh.userData.variantMaterial = mat;
        mesh.material = mat;
        parser.assignFinalMaterial?.(mesh);
      }),
    );
    // 变体切换会覆盖 Paint 1 分区，需要重新套用自定义漆
    applyPaint(state.paint, false);
    invalidate();
  }

  // ---- UI 绑定 ----
  const markSelected = (attr: string, id: string) => {
    host.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute(attr) === id));
    });
  };

  const updateStatus = () => {
    if (!statusName) return;
    const livery = LIVERIES.find((x) => x.id === state.livery)!;
    const paintLabel =
      state.paint === 'livery' ? '原厂配色' : (PAINTS.find((x) => x.id === state.paint)?.name ?? '');
    const wheelLabel = WHEELS.find((x) => x.id === state.wheels)?.name ?? '';
    statusName.textContent = `${livery.name} · ${paintLabel} · ${wheelLabel}`;
  };

  // 状态变更以 history.replaceState 同步回 URL（不产生历史条目，§9.2 深链契约）
  const writeURL = () => {
    const next = new URLSearchParams();
    if (state.livery !== DEFAULT_STATE.livery) next.set('livery', state.livery);
    if (state.paint !== DEFAULT_STATE.paint) next.set('paint', state.paint);
    if (state.wheels !== DEFAULT_STATE.wheels) next.set('wheels', state.wheels);
    if (params.get('gl') === '1') next.set('gl', '1');
    const qs = next.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  };

  const applyById: Record<string, (id: string) => void> = {
    paint: (id) => applyPaint(id, true),
    wheels: (id) => applyWheels(id, true),
    livery: (id) => void applyLivery(id),
  };

  const bindButtons = (attr: string, key: 'paint' | 'wheels' | 'livery') => {
    host.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((btn) => {
      on(btn, 'click', () => {
        const id = btn.getAttribute(attr)!;
        applyById[key]!(id);
        markSelected(attr, id);
        updateStatus();
        writeURL();
      });
    });
  };
  bindButtons('data-cfg-paint', 'paint');
  bindButtons('data-cfg-wheel', 'wheels');
  bindButtons('data-cfg-livery', 'livery');

  // 分区导航：切换面板 + 相机运镜到对应部位
  host.querySelectorAll<HTMLButtonElement>('[data-cfg-tab]').forEach((tab) => {
    on(tab, 'click', () => {
      const section = tab.getAttribute('data-cfg-tab') as SectionId;
      host.querySelectorAll<HTMLButtonElement>('[data-cfg-tab]').forEach((t) => {
        t.setAttribute('aria-selected', String(t === tab));
      });
      host.querySelectorAll<HTMLElement>('[data-cfg-panel]').forEach((panel) => {
        panel.hidden = panel.getAttribute('data-cfg-panel') !== section;
      });
      controls.autoRotate = false;
      flyTo(VIEWS[section]);
    });
  });

  // ---- 初始状态套用 + 首帧渲染 + 揭幕 ----
  await applyLivery(state.livery);
  applyWheels(state.wheels, false);
  markSelected('data-cfg-paint', state.paint);
  markSelected('data-cfg-wheel', state.wheels);
  markSelected('data-cfg-livery', state.livery);
  updateStatus();

  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  // 入场：从稍远处缓推到主视角
  const home = VIEWS.paint;
  camera.position.copy(orbitPos(-52, 17, radius * 2.9, bodyTarget));
  controls.target.copy(home.target);
  renderer.render(scene, camera);
  flyTo(home, 1300);
  setRunning(true);

  // ---- LabInstance 契约（§9.2） ----
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
      for (const { el, type, fn } of listeners) el.removeEventListener(type, fn);
      listeners.length = 0;
      controls.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(disposeMaterial);
      });
      disposeMaterial(customPaint);
      envTex.dispose();
      shadowTexture.dispose();
      dracoLoader.dispose();
      void ktx2Loader.dispose();
      void renderer.dispose();
      // dispose 后原 canvas 的 GL 上下文已不可复用：原位换成全新克隆，保证舞台可重复挂载
      canvas.replaceWith(canvas.cloneNode(false));
    },
    setParam: (key, value) => {
      const apply = applyById[key];
      if (!apply) return; // 白名单外与 gl（仅初始化生效）一律忽略
      const valid =
        (key === 'paint' && (value === 'livery' || PAINTS.some((x) => x.id === value))) ||
        (key === 'wheels' && WHEELS.some((x) => x.id === value)) ||
        (key === 'livery' && LIVERIES.some((x) => x.id === value));
      if (!valid) return;
      apply(value);
      markSelected(key === 'paint' ? 'data-cfg-paint' : key === 'wheels' ? 'data-cfg-wheel' : 'data-cfg-livery', value);
      updateStatus();
      writeURL();
    },
  };
}
