// 3D 车辆配置器引擎（vanilla TS，无框架依赖）。
// 渲染：three/webgpu 的 WebGPURenderer（不支持 WebGPU 时自动回退 WebGL 2）。
// 资产：Khronos CarConcept（CC BY 4.0，Draco + KTX2 官方压缩变体）+ Poly Haven 影棚 HDRI（CC0）。
// 本模块由页面脚本按「client:visible 语义」动态 import，three.js 不进入首屏 bundle。
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
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

export async function mountCarConfigurator(root: HTMLElement): Promise<void> {
  const $ = <T extends HTMLElement>(sel: string): T | null => root.querySelector<T>(sel);
  const stage = $('[data-cfg-stage]')!;
  const canvas = $<HTMLElement>('[data-cfg-canvas]') as unknown as HTMLCanvasElement;
  const progressBar = $('[data-cfg-progress-bar]');
  const statusName = $('[data-cfg-config-name]');
  const backendEl = $('[data-cfg-backend]');

  const query = new URLSearchParams(location.search);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;

  const setProgress = (f: number) => {
    if (progressBar) progressBar.style.width = `${Math.round(f * 100)}%`;
  };

  // ---- 渲染器：WebGPU 优先，WebGL 2 自动回退（?gl=1 可强制回退用于验证） ----
  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias: true,
    forceWebGL: query.get('gl') === '1',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  // 移动端 DPR 封顶 1.5，桌面 2 —— 控制像素负载（性能预算见调研 7.2）
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.5 : 2));
  await renderer.init();
  const backendName = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend
    ? 'WebGPU'
    : 'WebGL 2';

  // ---- 资产加载（LoadingManager 汇总 17 个文件的进度） ----
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => setProgress(loaded / Math.max(total, 1));

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
    new RGBELoader(manager).loadAsync(`${base}/hdri/studio_small_08_1k.hdr`),
  ]);
  setProgress(1);

  // ---- 场景：影棚 HDRI 环境光 + 深色地面 + 接触阴影 ----
  const scene = new THREE.Scene();
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envTex;
  scene.environmentIntensity = 1.1;
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

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: makeContactShadowTexture(), transparent: true, depthWrite: false }),
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
  const setRunning = (v: boolean) => {
    if (v === running) return;
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

  // ---- 材质槽收集（加载时一次性遍历，运行时零 traverse —— 调研 4.1 反模式规避） ----
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

  // ---- 配置状态（支持 URL query 分享：?livery=&paint=&wheels=） ----
  const state: ConfiguratorState = { ...DEFAULT_STATE };
  {
    const l = query.get('livery');
    const p = query.get('paint');
    const w = query.get('wheels');
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
    root.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((btn) => {
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

  const writeURL = () => {
    const params = new URLSearchParams();
    if (state.livery !== DEFAULT_STATE.livery) params.set('livery', state.livery);
    if (state.paint !== DEFAULT_STATE.paint) params.set('paint', state.paint);
    if (state.wheels !== DEFAULT_STATE.wheels) params.set('wheels', state.wheels);
    if (query.get('gl') === '1') params.set('gl', '1');
    const qs = params.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  };

  const bindButtons = (attr: string, apply: (id: string) => void) => {
    root.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute(attr)!;
        apply(id);
        markSelected(attr, id);
        updateStatus();
        writeURL();
      });
    });
  };
  bindButtons('data-cfg-paint', (id) => applyPaint(id, true));
  bindButtons('data-cfg-wheel', (id) => applyWheels(id, true));
  bindButtons('data-cfg-livery', (id) => void applyLivery(id));

  // 分区导航：切换面板 + 相机运镜到对应部位
  root.querySelectorAll<HTMLButtonElement>('[data-cfg-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const section = tab.getAttribute('data-cfg-tab') as SectionId;
      root.querySelectorAll<HTMLButtonElement>('[data-cfg-tab]').forEach((t) => {
        t.setAttribute('aria-selected', String(t === tab));
      });
      root.querySelectorAll<HTMLElement>('[data-cfg-panel]').forEach((panel) => {
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
  if (backendEl) backendEl.textContent = backendName;

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
  new ResizeObserver(resize).observe(stage);

  // 入场：从稍远处缓推到主视角
  const home = VIEWS.paint;
  camera.position.copy(orbitPos(-52, 17, radius * 2.9, bodyTarget));
  controls.target.copy(home.target);
  renderer.render(scene, camera);
  flyTo(home, 1300);

  // 画布滚出视口即暂停渲染循环（离屏零 GPU 消耗）
  new IntersectionObserver(
    (entries) => {
      for (const e of entries) setRunning(e.isIntersecting);
    },
    { threshold: 0.02 },
  ).observe(stage);
  setRunning(true);

  root.dataset.state = 'ready';
  root.querySelectorAll<HTMLElement>('[data-cfg-gated]').forEach((el) => el.removeAttribute('inert'));
}
