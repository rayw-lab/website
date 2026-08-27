// CC-CAM-VIEW：镜头单源消费器 —— 加载 src/data/camera-shots.json（CC-CAM-DATA
// schemaVersion 1 注册表；提案草案 docs/research/cyber-city-camera-poi-research.md
// §3.1），把 anchor 解析成世界位姿后经 View.applyShot 应用到 spherical/lookAtHeight/
// lateral 三件。
// 纪律（G5 红线 + 零漂移合同）：
//   · 数据驱动预设镜头，不引入 camera-controls / 任何用户相机接管输入；
//   · ?shot= id 白名单 = 注册表键集，名单外一律 console.warn + 原机位（?poi= 无效
//     slug 同款不阻断口径）；
//   · 本模块仅在 ?poi=&shot= 合法组合时被动态 import（接线见 src/lab/world/index.ts）
//     ——未指定 shot 时 View.applyShot 零调用，robot_idle 主帧与 main 逐字节一致
//     （poster 三面免重拍前提；VIS-03 基线合同）。
// 释放（预设 → 玩家跟随）：首个驾驶意图动作（View.setFocusPoint 重吸附动作清单 +
// nipplePointer 触屏摇杆）触发 View.releaseShot——取景参数恢复现场、焦点回归玩家，
// 与既有「任何驾驶意图 → 相机重新吸附」机制同一节拍，非用户自由相机。
// 消费口径备注：spherical.thetaDriftDeg（慢 yaw 呼吸微动振幅）不消费——View 构造期
// 已按档位/reduced-motion 落定 framing.thetaDrift，shot 只改取景不改微动纪律。
import shotsRaw from '../../../data/camera-shots.json';
import type { Game } from '../core/Game';
import type { CyberCityMap } from '../city/CityMap';
import type { ViewShotPose } from './View';

/** 锚点解析口径（camera-shots.json conventions + research §3.1 锚点类型枚举） */
export type CameraShotAnchor =
  | { type: 'spawn' }
  | { type: 'building'; buildingId: string }
  | { type: 'parkingBay'; buildingId: string }
  | { type: 'corridor'; corridorId: string; point: { x: number; z: number }; pointSource?: string }
  | { type: 'world'; x: number; z: number };

/**
 * 斜距字段双形态（camera-shots.json conventions.radiusProfile）：
 * 数字 = 预设定值（View.applyShot 收 min=max，静帧展示语义）；
 * 对象 = View 跟随档快照（edges 原样回写，baseRatio/nonIdealRatioOffset 为文档字段，
 * 运行时以 View 现值为准——本消费器不改 zoom）。
 */
export type CameraShotRadius =
  | number
  | { edges: { min: number; max: number }; baseRatio?: number; nonIdealRatioOffset?: number };

/** 注册表条目（数值口径 = View 同名件：phiDeg/thetaDeg 度、radius/lookAtHeight/lateral 米） */
export interface CameraShotEntry {
  /** 模式（研究草案 §3.1）：ritual = 首幕快照；poi = 深链展示帧 */
  mode: 'ritual' | 'poi';
  /** current-snapshot = 现状文档化快照；proposal = 展示机位提案（两者均可经 ?shot= 应用） */
  status: 'current-snapshot' | 'proposal';
  posterContract?: string;
  anchor: CameraShotAnchor;
  spherical: { phiDeg: number; thetaDeg: number; thetaDriftDeg?: number; radius: CameraShotRadius };
  lookAtHeight: number;
  lateral: number;
  notes?: string;
  /** NDC 八角点审计元数据（tools/camera/audit-shot-ndc.mjs 消费；运行时不读） */
  projectionAudit?: unknown;
}

/**
 * [CC-VEH-C2] 驾驶态条目（vehicle-camera spec §7.1 冻结字段；schemaVersion 1 加法）：
 * 运行时消费方 = View.ts 构造期读参（drive_third.dynamics.lookahead / drive_fpv.rig），
 * **非** ?shot= 深链预设——anchor 是随车动态参考系，无静态世界机位可应用，
 * applyCameraShot 对 mode='drive' 早退告警（守卫见下）。字段形状由 View.ts 经
 * resolveJsonModule 编译期校验，此处仅作 union 判别（避免与静态 shot 字段耦合）。
 */
export interface DriveShotEntry {
  mode: 'drive';
  status: string;
  anchor: { type: 'vehicle' };
  spherical?: CameraShotEntry['spherical'];
  lookAtHeight?: number;
  lateral?: number;
  dynamics?: unknown;
  rig?: unknown;
  notes?: string;
}

/** src/data/camera-shots.json 顶层结构（CC-CAM-DATA schemaVersion 1；破坏性变更 +1） */
export interface CameraShotsConfig {
  schemaVersion: number;
  task: string;
  updatedAt: string;
  sources: Record<string, string>;
  conventions: Record<string, string>;
  camera: { fov: number; near: number; far: number; idealRatio: number };
  shots: Record<string, CameraShotEntry | DriveShotEntry>;
}

const config = shotsRaw as unknown as CameraShotsConfig;

/** 与 View.setFocusPoint 重吸附清单同源 + nipplePointer（触屏摇杆经 Player 侧路吸附） */
const RELEASE_ACTIONS = ['forward', 'right', 'backward', 'left', 'boost', 'brake', 'respawn', 'nipplePointer'];

const DEG_TO_RAD = Math.PI / 180;

export function getCameraShotsConfig(): CameraShotsConfig {
  return config;
}

/** ?shot= 白名单（注册表键集）——壳页只透传字符串，合法性在此单点裁决 */
export function listShotIds(): string[] {
  return Object.keys(config.shots);
}

/** anchor → 世界地面坐标；引用了未登记楼时返回 null（调用侧告警不阻断） */
export function resolveShotAnchor(
  anchor: CameraShotAnchor,
  map: CyberCityMap,
): { x: number; z: number } | null {
  switch (anchor.type) {
    case 'spawn':
      return { x: map.world.spawn.position.x, z: map.world.spawn.position.z };
    case 'world':
      return { x: anchor.x, z: anchor.z };
    case 'corridor':
      return anchor.point ? { x: anchor.point.x, z: anchor.point.z } : null;
    case 'building': {
      const building = map.buildings.find((entry) => entry.id === anchor.buildingId);
      return building ? { x: building.position.x, z: building.position.z } : null;
    }
    case 'parkingBay': {
      const building = map.buildings.find((entry) => entry.id === anchor.buildingId);
      return building ? { x: building.parkingBay.x, z: building.parkingBay.z } : null;
    }
    default:
      return null;
  }
}

/**
 * 应用 ?shot= 深链镜头：白名单校验 → anchor 解析 → View.applyShot，并在首个驾驶
 * 意图动作上一次性接线 View.releaseShot（预设让位玩家跟随，监听即拆）。
 * 返回 false = shot id 名单外或 anchor 不可解析（已告警，机位保持现状不阻断）。
 */
export function applyCameraShot(game: Game, map: CyberCityMap, shotId: string): boolean {
  const shot = config.shots[shotId];
  if (!shot) {
    console.warn(
      `[camera-shots] ?shot=${shotId} 无效（注册表未登记）；保持默认机位。` +
        `候选：[${listShotIds().join(', ')}]`,
    );
    return false;
  }

  // [CC-VEH-C2] drive_* 条目是驾驶态运行时参数（View.ts 构造期消费），anchor 随车
  // 动态无静态世界机位可解算——深链请求一律告警不阻断（无效 slug 同款口径）
  if (shot.mode === 'drive') {
    console.warn(
      `[camera-shots] ?shot=${shotId} 是驾驶态运行时条目（mode=drive，View 消费），` +
        `非深链展示预设；保持默认机位。`,
    );
    return false;
  }

  const anchor = resolveShotAnchor(shot.anchor, map);
  if (!anchor) {
    console.warn(
      `[camera-shots] shot ${shotId} 的 anchor 不可解析（type=${shot.anchor.type}` +
        `${'buildingId' in shot.anchor ? `, buildingId=${shot.anchor.buildingId}` : ''}）；保持默认机位。`,
    );
    return false;
  }

  const radius =
    typeof shot.spherical.radius === 'number'
      ? { min: shot.spherical.radius, max: shot.spherical.radius }
      : { min: shot.spherical.radius.edges.min, max: shot.spherical.radius.edges.max };

  const pose: ViewShotPose = {
    anchor,
    phi: shot.spherical.phiDeg * DEG_TO_RAD,
    theta: shot.spherical.thetaDeg * DEG_TO_RAD,
    radius,
    lookAtHeight: shot.lookAtHeight,
    lateral: shot.lateral,
  };
  game.view.applyShot(pose);

  // 首个驾驶意图 → 释放预设（一次性监听；总线随 Game.dispose 整体丢弃，无泄漏面）
  const releaseHandler = (action: { name: string }): void => {
    if (RELEASE_ACTIONS.indexOf(action.name) === -1) return;
    game.inputs.events.off('actionStart', releaseHandler);
    game.view.releaseShot();
    console.info(`[camera-shots] 驾驶意图接管：shot ${shotId} 释放，相机回归玩家跟随`);
  };
  game.inputs.events.on('actionStart', releaseHandler);

  console.info(
    `[camera-shots] shot 应用：${shotId}（${shot.mode}/${shot.status}）—— ` +
      `anchor (${anchor.x}, ${anchor.z})，φ=${shot.spherical.phiDeg}° θ=${shot.spherical.thetaDeg}° ` +
      `斜距 ${radius.min === radius.max ? `${radius.min}m 定值` : `${radius.min}–${radius.max}m 跟随档`}，` +
      `视线高 ${shot.lookAtHeight}m，偏轴 ${shot.lateral}m` +
      (shot.notes ? `（${shot.notes}）` : ''),
  );
  return true;
}
