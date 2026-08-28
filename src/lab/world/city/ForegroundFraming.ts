// [CC-VIS-X2] 前景景框层（设计确认 D7 并入 X2）：近景管线桥剪影——补齐 V1
// 「前景剪影→主体→中景街道→天际线→天空」五层纵深中唯一缺失的前景层。
//
// 构图取证（复现：public/models/facade-kit/README.md §NDC，1440×900 ritual_idle）：
//   · ritual_idle 机位 (12.13, 5.28, 16.08) 朝北偏西 25°；桥体世界 (0, 0, −26) 沿 X
//     跨中轴大道——桥面带 13.4–15.6m 投影至帧顶带（ndc.y ≈ +0.72…+0.93），主体
//     机器人（出生点，ndc.y ≤ 0.2 带）零遮挡；腿柱 ±15.7 落路缘（halfWidth 12）外
//     plaza 角区，ndc.x ≈ −0.28 / +0.80——左腿叠在 agent-nexus 塔前成近/远景深度差；
//   · 驾驶动线：北向中轴大道从桥下穿过（净高 13.4m ≫ 车高），桥即「出城门框」。
// 站位避让核对：灯杆最近 (−13.5, −34) 距左腿 8.3m；广告板最近 (−15.8, −46)；
// parkingBay 最近 agent-nexus (−28, −28) 距左腿 12.4m（r6 外）；FlightTrails z≤−110。
// [CC-VIS-X2-TRIAGE r1] 已知遗漏教训：上表只核静态站位，未核 e2e 遥测驾驶动线——
// 腿柱 (±15.7,−26) 恰截断泊位间直线走廊 z∈[−24,−28]（EXP-01/EXP-02/OBS-01/PERF-Q2
// 四条动线），已在各 spec 加南侧绕行途径点（z≈−30…−33 带）。后续摆位新增碰撞体时，
// 必须同步核对 e2e 各 driveTo 线段（docs/research/cc-vis-x2-e2e-triage-r1.md §3）。
//
// 纪律：纯静态件（D7「静态、零循环配额」——桥上警灯为阈下 emissive 静态点阵，
// 非动画）；腿柱碰撞体 2 件经 kit.registerBody 登记（Q2 同步 disable）；桥面带
// 高于一切可达路径，除腿柱外零碰撞需求。
import type { Game } from '../core/Game';
import type { FacadeKit } from './FacadeKit';

/** 桥位（世界系）：跨中轴大道，出生点北侧 26m（首幕帧顶带 / 北向驾驶必经门） */
const BRIDGE = { x: 0, y: 0, z: -26, rotY: 0 };
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
