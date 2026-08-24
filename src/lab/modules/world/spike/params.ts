// Phase A Spike · 车辆手感参数单一事实源（roadmap §7.2 Step 5 决策材料）。
// 本表 = 手写运动学控制器（选型路线 1）的全部旋钮；
// 若 Spike 裁决切换 Rapier 路线（路线 2），改抄 source-teardown §5.2 的 folio 参数表，
// 并连带恢复 Ticker.scale=2（folio 手感按 2 倍速标定，两套参数不可混搭）。
//
// 单位约定：本控制器用真实 SI 单位（米/秒），dt 为墙钟秒 —— 不引入 folio 的全局 2 倍速。
// 数值语义标注 folio 对应物，便于对照调参与未来切换。

export const VEHICLE_PARAMS = {
  /* ———— 驱动（folio：engineForce = accel × 300 / (1+overflow) × deltaScaled） ———— */
  /** 基础油门加速度 m/s²（含滚阻后 0→50km/h 约 2s，跟手优先） */
  engineAccel: 24,
  /** boost（Shift）加速度倍率（folio：accel × (1 + boost×2) 过猛，本站收敛） */
  boostAccelFactor: 1.7,
  /** 常态软限速 m/s（≈65km/h；场地半径 55m 下的可控上限） */
  topSpeed: 18,
  /** boost 软限速 m/s（≈101km/h；folio：lerp(5, 40, boosting)） */
  topSpeedBoost: 28,
  /** 倒车软限速 m/s */
  topSpeedReverse: 7,
  /** 软限速衰减斜率：超速 overflow 后引擎力 ×1/(1+overflow×k)——folio 同型，无硬限速 */
  overflowSlope: 1.6,

  /* ———— 制动与阻力（folio：主动 brake=1 / 怠速 0.06 / 换向刹停 0.4，×35 尺度） ———— */
  /** 主动刹车减速度 m/s²（Space / B） */
  brakeDecel: 30,
  /** 换向刹停减速度 m/s²：行驶中按反方向先刹停再倒车（folio 真车手感三分支之 c） */
  reverseBrakeDecel: 22,
  /** 触发换向刹停的最低速度 m/s（folio：0.5） */
  reverseBrakeMinSpeed: 0.6,
  /** 怠速指数阻尼 s⁻¹（松油门自然滑停，folio idleBrake=0.06 的连续化） */
  idleDrag: 0.55,
  /** 恒定滚动阻力 m/s²（低速收尾，防无限蠕行） */
  rollingDecel: 1.1,

  /* ———— 转向（folio：steering × 0.5 直写无插值；本站加输入阻尼 + 高速收紧） ———— */
  /** 低速最大前轮转角 rad */
  maxSteer: 0.6,
  /** 高速转向收紧斜率：maxSteer / (1 + |v|×k)——防高速一碰就甩 */
  steerSpeedDrop: 0.055,
  /** 输入→前轮角的阻尼速率 s⁻¹（跟手度核心旋钮：高=跟手，低=船感） */
  steerLerpRate: 11,

  /* ———— 抓地 / 漂移（folio：sideFrictionStiffness=3 的运动学等价物） ———— */
  /** 侧向速度指数衰减 s⁻¹：高=轨道车，低=漂移（Spike 手感评估主旋钮） */
  gripRate: 7.0,
  /** boost 中侧向抓地打折（高速过弯带一点滑，可控漂移感） */
  boostGripFactor: 0.55,

  /* ———— 贴地（raycast 悬挂的运动学替身） ———— */
  /** 四轮 raycast 起点抬升 m（从轮心上方向下打射线，斜坡上坡沿不丢地） */
  rayLift: 1.6,
  /** 射线长度 m（超出即判定悬空，进入抛体下落） */
  rayLength: 4.0,
  /** 底盘姿态（y/pitch/roll）向地面拟合值的阻尼速率 s⁻¹（悬挂柔度的观感来源） */
  poseLerpRate: 9,
  /** 悬空时的重力 m/s²（冲出坡道有真实抛物线） */
  gravity: 9.81,

  /* ———— 车身戏剧化（纯视觉，不进物理积分） ———— */
  /** 侧倾系数：视觉 roll = -latAccel × k（过弯外倾） */
  visualRollK: 0.011,
  /** 俯仰系数：视觉 pitch = -longAccel × k（加速后蹲 / 刹车点头） */
  visualPitchK: 0.009,
  /** 视觉姿态角上限 rad */
  visualTiltMax: 0.09,

  /* ———— 复位 ———— */
  /** 出生点（环形道最下方切线方向朝 +X 逆时针） */
  spawn: { x: 0, z: 55, yaw: Math.PI / 2 },
} as const;

/** 锥桶简易动力学（球形距离碰撞，roadmap §7.1 Step 4 灰盒纪律） */
export const CONE_PARAMS = {
  /** 碰撞半径 m */
  radius: 0.42,
  /** 被撞初速 = 车速 × k + 基础值 */
  kickSpeedFactor: 0.95,
  kickSpeedBase: 1.6,
  /** 竖直弹起分量 = 车速 × k */
  kickUpFactor: 0.28,
  kickUpBase: 0.8,
  /** 空中角速度 rad/s 系数（翻滚观感） */
  tumbleFactor: 1.4,
  /** 地面滑动摩擦阻尼 s⁻¹ */
  groundDrag: 2.6,
  /** 落地反弹保留系数 */
  bounce: 0.28,
  /** 每次撞锥桶车速保留系数（有代价但不打断驾驶） */
  carSpeedKeep: 0.965,
} as const;

/** 场地几何（灰盒，一切程序化生成，零 public/ 资产） */
export const TRACK_PARAMS = {
  /** 地面（正方形边长 m，单张程序化画布纹理覆盖） */
  groundSize: 240,
  /** 环形试车道中心线半径 m（roadmap §3.2 主动线） */
  ringRadius: 55,
  /** 路面宽 m */
  ringWidth: 13,
  /** 场地硬边界半径 m（径向软夹持 + 轮胎墙视觉） */
  boundaryRadius: 92,
} as const;

export type VehicleParams = typeof VEHICLE_PARAMS;
