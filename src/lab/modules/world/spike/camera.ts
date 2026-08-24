// 追尾相机（folio View.ts 的 focusPoint/zoom 精简版，roadmap §7.2 Step 7）。
//   - focusPoint 磁吸：注视点以 9/s 阻尼追车（不硬锁，过弯有「甩镜头」余味）；
//   - 方位角橡皮筋：相机 yaw 以 3.2/s 追车头朝向（漂移时能看到车侧面）；
//   - 速度变焦：车速拉高 → 距离/FOV 同步放大（boost 有推背观感）。
import * as THREE from 'three/webgpu';
import type { DriveIntent, KinematicVehicle } from './vehicle';

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export class ChaseCamera {
  readonly camera: THREE.PerspectiveCamera;
  private camYaw: number;
  private readonly focus = new THREE.Vector3();
  private readonly lookTarget = new THREE.Vector3();
  private readonly tmpFwd = new THREE.Vector3();
  private fov = 52;

  constructor(aspect: number, vehicle: KinematicVehicle) {
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 400);
    this.camYaw = vehicle.yaw;
    this.focus.copy(vehicle.position);
    this.snap(vehicle);
  }

  /** respawn / 首帧：跳过阻尼直接就位 */
  snap(vehicle: KinematicVehicle): void {
    this.camYaw = vehicle.yaw;
    this.focus.set(vehicle.position.x, vehicle.pose.y, vehicle.position.z);
    this.place(vehicle, 0);
  }

  update(dt: number, vehicle: KinematicVehicle, intent: DriveIntent): void {
    // focusPoint 磁吸
    const k = Math.min(1, 9 * dt);
    this.focus.x += (vehicle.position.x - this.focus.x) * k;
    this.focus.y += (vehicle.pose.y - this.focus.y) * Math.min(1, 5 * dt);
    this.focus.z += (vehicle.position.z - this.focus.z) * k;

    // 方位角橡皮筋（倒车时不翻转，保持车尾视角）
    const yawK = Math.min(1, 3.2 * dt);
    this.camYaw = wrapAngle(this.camYaw + wrapAngle(vehicle.yaw - this.camYaw) * yawK);

    // 速度变焦
    const speedAbs = Math.abs(vehicle.speed);
    const fovTarget = 52 + speedAbs * 0.45 + (intent.boost && speedAbs > 12 ? 6 : 0);
    this.fov += (fovTarget - this.fov) * Math.min(1, 4 * dt);
    if (Math.abs(this.fov - this.camera.fov) > 0.05) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }

    this.place(vehicle, speedAbs);
  }

  private place(vehicle: KinematicVehicle, speedAbs: number): void {
    const dist = 7.2 + speedAbs * 0.11;
    const height = 2.9 + speedAbs * 0.05;
    const fwd = this.tmpFwd.set(Math.sin(this.camYaw), 0, Math.cos(this.camYaw));
    this.camera.position.set(
      this.focus.x - fwd.x * dist,
      Math.max(this.focus.y + height, 0.6), // 相机永不穿地（灰盒地面近似平面）
      this.focus.z - fwd.z * dist,
    );
    // 注视点：车前方 3m + 抬高 1.2m（地平线留在画面上 1/3）
    vehicle.forwardDir(this.tmpFwd);
    this.lookTarget.set(
      this.focus.x + this.tmpFwd.x * 3,
      this.focus.y + 1.2,
      this.focus.z + this.tmpFwd.z * 3,
    );
    this.camera.lookAt(this.lookTarget);
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
