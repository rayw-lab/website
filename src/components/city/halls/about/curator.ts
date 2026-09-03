/**
 * About Hall 馆长：轻量 WebGL 渲染 HeroRobot.glb。
 * 禁止 import src/lab/world/**、rapier、three/webgpu。
 * 程序化四态（gaze / present / yield / salute）叠在 Idle 剪辑上，不加新剪辑。
 *
 * 姿态单源 = 宿主 `data-curator-pose`（由 Curator.astro 按主导幕写）。ADR-5 A：
 * present 仅 s5；s6 让位 = 冻最后一帧 + 降不透明度 + `cancelAnimationFrame`（冷 ≠ 空转挂环）。
 * 同屏 GPU 互斥（ADR-5 A.5）：Hero 指针 seek / S6 滚动 seek / renderer.render 同帧至多一条。
 */
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';

export const CURATOR_MQ = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

const EYE = 0x49c5b6;
const CREAM = 0xfef3c7;
const HALL_BG = 0x041020;
const MAX_GAZE = (15 * Math.PI) / 180;
/** Hero 指针 scrub「活动期」窗口：最后一次落在 Hero 内的 pointer 事件之后这段时间算热。 */
const HERO_POINTER_HOT_MS = 400;

export type CuratorPose = 'gaze' | 'present' | 'yield' | 'salute';

export type CuratorHandle = { destroy(): void };

declare global {
  interface Window {
    /** 只读调试出口（`__worldSpike` 同段纪律：挂载写、destroy 删）。 */
    __hallDebug?: { curatorFrames: number };
  }
}

type BoneBag = {
  head: THREE.Bone | null;
  neck: THREE.Bone | null;
  chest: THREE.Bone | null;
  shoulderL: THREE.Bone | null;
  shoulderR: THREE.Bone | null;
  upperL: THREE.Bone | null;
  upperR: THREE.Bone | null;
  lowerL: THREE.Bone | null;
  lowerR: THREE.Bone | null;
  palmL: THREE.Bone | null;
  palmR: THREE.Bone | null;
};

const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

function compactName(name: string): string {
  return name.replace(/\./g, '');
}

function overlayEuler(bone: THREE.Object3D | null, x: number, y: number, z: number, weight: number): void {
  if (!bone || weight <= 0.001) return;
  tmpE.set(x * weight, y * weight, z * weight, 'XYZ');
  tmpQ.setFromEuler(tmpE);
  bone.quaternion.multiply(tmpQ);
}

function collectBones(root: THREE.Object3D): BoneBag {
  let skeleton: THREE.Skeleton | null = null;
  root.traverse((child) => {
    const mesh = child as THREE.SkinnedMesh;
    if (mesh.isSkinnedMesh && mesh.skeleton) skeleton = mesh.skeleton;
  });
  const byCompact = (id: string): THREE.Bone | null => {
    if (!skeleton) return null;
    return skeleton.bones.find((b) => compactName(b.name) === id) ?? null;
  };
  return {
    head: byCompact('Head'),
    neck: byCompact('Neck'),
    chest: byCompact('Chest'),
    shoulderL: byCompact('ShoulderL'),
    shoulderR: byCompact('ShoulderR'),
    upperL: byCompact('UpperArmL'),
    upperR: byCompact('UpperArmR'),
    lowerL: byCompact('LowerArmL'),
    lowerR: byCompact('LowerArmR'),
    palmL: byCompact('PalmIL'),
    palmR: byCompact('PalmIR'),
  };
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function fitRobot(model: THREE.Object3D, targetHeight: number): void {
  const box = new THREE.Box3().setFromObject(model);
  const native = Math.max(box.max.y - box.min.y, 0.001);
  const scale = targetHeight / native;
  model.scale.setScalar(scale);
  model.position.y = -box.min.y * scale;
}

function tuneMaterials(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false;
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material || typeof material.name !== 'string') return;
    if (material.name === 'Eye') {
      material.emissive.setHex(EYE);
      material.emissiveIntensity = 1.2;
    }
  });
}

export function mountCurator(host: HTMLElement): CuratorHandle {
  const stage = host.querySelector<HTMLElement>('[data-curator-stage]');
  const modelUrl = host.dataset.model ?? '';
  if (!stage || !modelUrl || !hasWebGL()) {
    return { destroy() {} };
  }

  let disposed = false;
  let raf = 0;
  // preserveDrawingBuffer：让位（rAF 取消）后画面必须留在 canvas 上。默认 false 时
  // 合成完成即隐式清空 drawing buffer，「冻最后一帧」会变成馆长凭空消失。
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(HALL_BG, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  stage.replaceChildren(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
  camera.position.set(0, 0.95, 4.55);
  camera.lookAt(0, 0.92, 0);

  scene.add(new THREE.HemisphereLight(0x2a4a5c, HALL_BG, 0.95));
  const key = new THREE.DirectionalLight(0xe8eef6, 1.15);
  key.position.set(0.8, 2.4, 3.2);
  scene.add(key);
  const bounce = new THREE.DirectionalLight(CREAM, 0.28);
  bounce.position.set(-1.6, 1.8, 1.2);
  scene.add(bounce);
  const eyeLight = new THREE.PointLight(EYE, 0.9, 5, 2);
  eyeLight.position.set(0, 1.4, 0.85);
  scene.add(eyeLight);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 18, 18),
    new THREE.MeshBasicMaterial({ color: CREAM }),
  );
  orb.visible = false;
  scene.add(orb);
  const orbLight = new THREE.PointLight(CREAM, 0.7, 2.4, 2);
  orb.add(orbLight);

  let lastT = performance.now();
  let mixer: THREE.AnimationMixer | null = null;
  let bones: BoneBag | null = null;
  let robot: THREE.Object3D | null = null;
  let lift = 0;
  let saluteT = -1;
  let saluteDone = false;
  let pointerX = 0;
  let pointerY = 0;
  let pointerLive = false;
  let idleLook = 0;
  let draco: DRACOLoader | null = null;
  let ready = false;
  let heroPointerAt = Number.NEGATIVE_INFINITY;
  /** 让位已冻帧：pose=yield 且手臂已落回 gaze 末姿，此后 rAF 冷。 */
  let frozen = false;
  let yieldFrames = 0;

  const debug = window.__hallDebug ?? { curatorFrames: 0 };
  window.__hallDebug = debug;

  const resize = (): void => {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const poseOf = (): CuratorPose => {
    const raw = host.dataset.curatorPose;
    return raw === 'present' || raw === 'yield' || raw === 'salute' ? raw : 'gaze';
  };

  /**
   * 冷 = cancelAnimationFrame。让位（s6）与离场都必须真的把环摘掉。
   * yield 允许一段有上限的收势（托举的手落回下垂），落定即冻，之后一帧不渲染。
   */
  const wantsLoop = (): boolean =>
    ready && !disposed && host.classList.contains('is-on') && !(poseOf() === 'yield' && frozen);

  /** 同帧至多一条热路径：Hero 指针 scrub 或 S6 滚动 scrub 正在 seek 时，本帧不 render。 */
  const seekHot = (now: number): boolean => {
    const hero = document.querySelector<HTMLVideoElement>('[data-hero-scrub] video');
    if (hero?.seeking && now - heroPointerAt < HERO_POINTER_HOT_MS) return true;
    const s6 = document.querySelector<HTMLVideoElement>('[data-scene="s6"] video');
    return Boolean(s6?.seeking);
  };

  const onPointer = (ev: PointerEvent): void => {
    pointerLive = true;
    pointerX = (ev.clientX / window.innerWidth) * 2 - 1;
    pointerY = (ev.clientY / window.innerHeight) * 2 - 1;
    idleLook = 0;
    const target = ev.target;
    if (target instanceof Element && target.closest('[data-hero-scrub]')) {
      heroPointerAt = performance.now();
    }
  };

  const tick = (): void => {
    raf = 0;
    if (!wantsLoop()) {
      host.dataset.curatorRaf = '0';
      return;
    }
    raf = requestAnimationFrame(tick);
    const now = performance.now();
    if (seekHot(now)) {
      lastT = now;
      return;
    }
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const pose = poseOf();
    const yielding = pose === 'yield';
    const wantLift = pose === 'present' ? 1 : 0;
    // 让位收势比常规回落快一档，与 300ms 降透明同步；20 帧封顶，不许拖成第二套动作。
    lift += (wantLift - lift) * Math.min(1, dt * (yielding ? 9 : 4.2));
    if (yielding) {
      yieldFrames += 1;
      if (lift < 0.03 || yieldFrames > 20) {
        lift = 0;
        frozen = true;
      }
    }

    if (pose === 'salute' && !saluteDone && saluteT < 0) saluteT = 0;
    if (saluteT >= 0 && saluteT < 1) {
      saluteT = Math.min(1, saluteT + dt / 1.7);
      if (saluteT >= 1) {
        saluteT = 1;
        saluteDone = true;
      }
    }

    mixer?.update(dt);

    idleLook += dt;
    const usePointer = pointerLive && idleLook < 1.8;
    const gazeYaw = THREE.MathUtils.clamp(usePointer ? -pointerX * MAX_GAZE : 0, -MAX_GAZE, MAX_GAZE);
    const gazePitch = THREE.MathUtils.clamp(usePointer ? pointerY * MAX_GAZE * 0.55 : 0, -MAX_GAZE, MAX_GAZE);

    overlayEuler(bones?.neck ?? null, gazePitch * 0.35, gazeYaw * 0.4, 0, 1);
    overlayEuler(bones?.head ?? null, gazePitch, gazeYaw, 0, 1);

    const rest = 1 - lift;
    overlayEuler(bones?.upperL ?? null, 0.06 * rest, 0.04 * rest, -0.38 * rest, 1);
    overlayEuler(bones?.upperR ?? null, 0.06 * rest, -0.04 * rest, 0.38 * rest, 1);

    if (lift > 0.01) {
      const t = lift;
      overlayEuler(bones?.shoulderL ?? null, 0.12 * t, 0.28 * t, 0.22 * t, 1);
      overlayEuler(bones?.shoulderR ?? null, 0.12 * t, -0.28 * t, 0.22 * t, 1);
      overlayEuler(bones?.upperL ?? null, 0.22 * t, 0.72 * t, 0.88 * t, 1);
      overlayEuler(bones?.upperR ?? null, 0.22 * t, -0.72 * t, 0.88 * t, 1);
      overlayEuler(bones?.lowerL ?? null, -0.95 * t, 0.42 * t, -0.12 * t, 1);
      overlayEuler(bones?.lowerR ?? null, -0.95 * t, -0.42 * t, 0.12 * t, 1);
    }

    // 抬手只在 s8 期间保持：滚回 s7 就回落成 gaze，不留一只举着的手。
    if (saluteT >= 0 && (pose === 'salute' || saluteT < 1)) {
      const rise = Math.min(1, saluteT / 0.32);
      const nod =
        !saluteDone && saluteT > 0.32 && saluteT < 0.7
          ? Math.sin(((saluteT - 0.32) / 0.38) * Math.PI)
          : saluteDone
            ? 0.08
            : 0;
      overlayEuler(bones?.shoulderR ?? null, 0.08 * rise, -0.16 * rise, 0.32 * rise, 1);
      overlayEuler(bones?.upperR ?? null, -0.22 * rise, -0.18 * rise, 1.05 * rise, 1);
      overlayEuler(bones?.lowerR ?? null, -0.4 * rise, 0, 0.1 * rise, 1);
      overlayEuler(bones?.head ?? null, 0.32 * nod, 0, 0, 1);
    }

    host.dataset.curatorLift = lift.toFixed(2);

    robot?.updateMatrixWorld(true);

    const presenting = lift > 0.12;
    if (presenting) {
      orb.position.set(0, 0.98, 0.42);
      orb.visible = true;
      orb.scale.setScalar(1.25);
    } else {
      orb.visible = false;
    }

    renderer.render(scene, camera);
    debug.curatorFrames += 1;
  };

  const startLoop = (): void => {
    if (raf !== 0 || !wantsLoop()) return;
    lastT = performance.now();
    host.dataset.curatorRaf = '1';
    raf = requestAnimationFrame(tick);
  };

  const stopLoop = (): void => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    host.dataset.curatorRaf = '0';
  };

  const syncLoop = (): void => {
    if (poseOf() !== 'yield') {
      frozen = false;
      yieldFrames = 0;
    }
    if (wantsLoop()) startLoop();
    else stopLoop();
  };

  // 姿态与在场由宿主写属性，这里只跟随。attributeFilter 排掉自写的 lift/raf/frames，
  // 否则自己的每帧写入会把观察器变成第二个 rAF。
  const poseWatch = new MutationObserver(syncLoop);
  poseWatch.observe(host, { attributes: true, attributeFilter: ['data-curator-pose', 'class'] });

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  window.addEventListener('pointermove', onPointer, { passive: true });

  const boot = async (): Promise<void> => {
    draco = new DRACOLoader();
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    let gltf: GLTF;
    try {
      gltf = await loader.loadAsync(modelUrl);
    } catch {
      stage.replaceChildren();
      return;
    }
    if (disposed) return;
    robot = gltf.scene;
    fitRobot(robot, 1.66);
    tuneMaterials(robot);
    scene.add(robot);
    bones = collectBones(robot);

    const idle = THREE.AnimationClip.findByName(gltf.animations, 'Idle') ?? gltf.animations[0];
    if (idle) {
      mixer = new THREE.AnimationMixer(robot);
      mixer.clipAction(idle).play();
    }

    resize();
    ready = true;
    // 让位期（s6）加载完成时不补渲染，宁可 canvas 空着：ADR-5 A.5 的「至多一条热路径」
    // 优先于「一定有画面」。s5→s6 正常路径早已有帧可冻。
    startLoop();
  };

  void boot();

  return {
    destroy() {
      if (disposed) return;
      disposed = true;
      stopLoop();
      delete host.dataset.curatorRaf;
      delete window.__hallDebug;
      poseWatch.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      mixer?.stopAllAction();
      mixer = null;
      renderer.dispose();
      orb.geometry.dispose();
      (orb.material as THREE.Material).dispose();
      robot?.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
      });
      draco?.dispose();
      stage.replaceChildren();
    },
  };
}
