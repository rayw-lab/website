// [CC-VIS-X2] 前景景框层（设计确认 D7 并入 X2）：近景管线桥剪影——补齐 V1
// 「前景剪影→主体→中景街道→天际线→天空」五层纵深中唯一缺失的前景层。
//
// [CC-VIS-X2-PLUG] 桥位 z −26 → −19.5：原腿柱 (±15.7, −26) 正压 e2e 驾驶走廊带
// z∈[−24,−28]（EXP-01 追线与右腿箱体间隙仅 ~0.3m 必蹭；EXP-02 leg2 追线在
// x=−15.7 处 z=−26.24 正穿左腿箱占位——T9 §1.1 证据 B，CITY-EXP-01 终局失败
// 归因坐实）。南移后腿柱箱南缘 z=−20.12，距走廊带北缘 3.88m ≥「车半宽 ~1m +
// 转向余量 1.5m」纪律；且出泊左转弧的外鼓方向（北，−z）背离新柱位，位于安全侧。
// 余量定量核对可复跑 tools/camera/audit-x2-visibility.mjs §④（构图 §③ + 碰撞 §④
// 双达标才算改完，T9 §1.3 双门）。
//
// 构图取证（复现：public/models/facade-kit/README.md §NDC，1440×900 ritual_idle）：
//   · ritual_idle 机位 (12.13, 5.28, 16.08) 朝北偏西 25°；桥体世界 (0, 0, −19.5)
//     沿 X 跨中轴大道——桥面带 13.4–15.6m 投影至帧顶带（deck ndc.y ≈ +0.74…+0.97），
//     主体机器人（出生点，ndc −0.34, −0.44…−0.16）零遮挡（桥面带 y ≥ +0.74 无重叠，
//     且桥在主体身后）；腿柱 ±15.7 落路缘（halfWidth 12）外 plaza 角区，
//     ndc.x ≈ −0.37 / +0.96——左腿仍叠在 agent-nexus 塔前成近/远景深度差；
//   · 驾驶动线：北向中轴大道从桥下穿过（净高 13.4m ≫ 车高），桥即「出城门框」。
// 站位避让核对（[CC-VIS-X2-PLUG] 新增固定核对项「e2e 驾驶走廊」列首位）：
//   e2e 走廊带 z∈[−24,−28] 距腿柱箱南缘 3.88m（EXP-02 leg2 最劣追线净距 ≈2.98m）；
//   灯杆最近 (−13.5, −34) 距左腿 14.7m；广告板最近 (−15.8, −46) 26.5m；parkingBay
//   最近 agent-nexus (−28, −28) 距左腿 15.0m（r6 外）；隔离墩最近 (13.6, −17.2) 距
//   右腿 3.1m（墩阵 |x|,|z|≲18 为 e2e 避让域非驾驶域）；斑马线带 |z|≤16.6 距柱箱
//   北缘 2.3m；FlightTrails z≤−110。
// [CC-VIS-X2-TRIAGE r1] 已知遗漏教训（保留）：X2 首版避让表只核静态站位，未核
// e2e 遥测驾驶动线（docs/research/cc-vis-x2-e2e-triage-r1.md §3）。注意：桥腿
// 南移只解开 X2 自身对走廊的压占；原西走廊直线东段仍被 X1 充电桩排带墙
// （HeroBlenderMesh PROP_COLLIDERS，x∈[16.2,17.8]×z∈[−40.3,−25.3]，main 面遗留，
// triage r1 839b6fe 归因修正）卡死 ~0.25m——动线现走东西大道，走廊基线恢复与
// 桩排处置归审计/主线专项。后续摆位新增碰撞体时，必须同步复跑
// audit-x2-visibility.mjs §④ 核对 e2e 各 driveTo 线段。
//
// 纪律：纯静态件（D7「静态、零循环配额」——桥上警灯为阈下 emissive 静态点阵，
// 非动画）；腿柱碰撞体 2 件经 kit.registerBody 登记（Q2 同步 disable）；桥面带
// 高于一切可达路径，除腿柱外零碰撞需求。
import type { Game } from '../core/Game';
import type { FacadeKit } from './FacadeKit';

/** 桥位（世界系）：跨中轴大道，出生点北侧 19.5m（首幕帧顶带 / 北向驾驶必经门；
 *  [CC-VIS-X2-PLUG] z=−19.5 让出 e2e 驾驶走廊带 z∈[−24,−28]，回移前必须复跑
 *  tools/camera/audit-x2-visibility.mjs §③/§④ 双门） */
const BRIDGE = { x: 0, y: 0, z: -19.5, rotY: 0 };
/** 腿柱位（构件本地 ±15.7 → 世界 x）与碰撞半长宽高（生成脚本 bbox 印证） */
const LEG_X = 15.7;
const LEG_HALF: [number, number, number] = [0.62, 6.7, 0.62];

export class ForegroundFraming {
  /** 已挂载的景框件数（挂载日志读数） */
  pieceCount = 0;

  constructor(game: Game, kit: FacadeKit) {
    void kit.ready.then((pieces) => {
      if (!pieces) return;

      const mesh = kit.addInstances(pieces, 'FramePipeBridge', [BRIDGE]);
      if (!mesh) return;
      this.pieceCount = 1;

      // 腿柱碰撞体（plaza 可达 → 撞上有反馈；桥面 13.4m 高于可达路径零碰撞）
      const body = game.objects.add(null, {
        type: 'fixed',
        position: { x: BRIDGE.x, y: 0, z: BRIDGE.z },
        friction: 0.5,
        restitution: 0.05,
        category: 'object',
        colliders: [-LEG_X, LEG_X].map((legX) => ({
          shape: 'cuboid' as const,
          parameters: LEG_HALF,
          position: { x: legX, y: LEG_HALF[1], z: 0 },
        })),
      });
      kit.registerBody(body);
    });
  }
}

export { BRIDGE as FOREGROUND_BRIDGE_SPOT };
