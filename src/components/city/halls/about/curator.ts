/**
 * About Hall 馆长：轻量 WebGL 渲染 HeroRobot.glb。
 * 禁止 import src/lab/world/**、rapier、three/webgpu。
 * 程序化三动作（注视 / 托举 / 致意）叠在 Idle 剪辑上，不加新剪辑。
 */
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';

export const CURATOR_MQ = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

const EYE = 0x49c5b6;
const CREAM = 0xfef3c7;
const HALL_BG = 0x041020;
const MAX_GAZE = (15 * Math.PI) / 180;
const LIFT_SCENES = new Set(['s2', 's3', 's4', 's5', 's6']);

export type CuratorHandle = { destroy(): void };

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

function sceneOf(el: Element): string {
  return (el as HTMLElement).dataset.scene ?? '';
}

function revealOf(el: HTMLElement): number {
  const raw = getComputedStyle(el).getPropertyValue('--hall-reveal').trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
}

function currentHallState(): { scene: string; station: number } {
  const nodes = document.querySelectorAll<HTMLElement>('[data-scene]');
  let best: HTMLElement | null = null;
  let bestScore = -1;
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    const visible = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    if (visible > bestScore) {
      bestScore = visible;
      best = el;
    }
  }
  const scene = best ? sceneOf(best) : 's0';
  let station = 0;
  if (scene === 's2') station = revealOf(best!) < 0.5 ? 1 : 2;
  else if (scene === 's3') station = 3;
  else if (scene === 's4') station = 4;
  else if (scene === 's5') station = 5;
  else if (scene === 's6') station = 6;
  return { scene, station };
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
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
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

  const resize = (): void => {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const onPointer = (ev: PointerEvent): void => {
    pointerLive = true;
    pointerX = (ev.clientX / window.innerWidth) * 2 - 1;
    pointerY = (ev.clientY / window.innerHeight) * 2 - 1;
    idleLook = 0;
  };

  const tick = (): void => {
    if (disposed) return;
    raf = requestAnimationFrame(tick);
    if (!host.classList.contains('is-on')) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const { scene: sceneId, station } = currentHallState();
    const wantLift = LIFT_SCENES.has(sceneId) ? 1 : 0;
    lift += (wantLift - lift) * Math.min(1, dt * 4.2);

    if (sceneId === 's8' && !saluteDone && saluteT < 0) saluteT = 0;
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

    if (saluteT >= 0) {
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
    host.dataset.curatorScene = sceneId;

    robot?.updateMatrixWorld(true);

    const presenting = lift > 0.12;
    if (presenting) {
      orb.position.set(0, 0.98, 0.42);
      orb.visible = true;
      orb.scale.setScalar(1 + 0.05 * station);
    } else {
      orb.visible = false;
    }

    renderer.render(scene, camera);
  };

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
    lastT = performance.now();
    tick();
  };

  void boot();

  return {
    destroy() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
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
