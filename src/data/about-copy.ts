// About 纸面页与 /world/about-pavilion/ 展厅共用的文案单源。
// 事迹缺口不渲染（ADR-4 决策 C：删行不编造）；磊哥补履历后再回填 gap 字段。
import { PERSON } from './site';

export const HALL_H1 = '在技术与落地之间架桥';

/** 定位一页纸副标题（positioning-onepager.md「首页文案」） */
export const HALL_SUBTITLE =
  '从物联网、整车前瞻和 AR-HUD，到全球化多语种座舱、端云大模型与 AI 提效——十余年始终在技术与落地之间架桥。';

export const problems = [
  {
    q: '多语种座舱，怎么把「翻译一遍」变成可验收的交付？',
    how: '多语种不是文案问题，是时间轴、排版与验收口径问题。我的做法是建立「语种 × 功能」能力地图与分级验收标准，把 RTL 镜像、字宽膨胀、语音节奏差异全部纳入可回归的单一口径——需求定义到量产交付全链路把控。',
    proofPath: '/lab/tts-cockpit/',
    proofLabel: '可交互佐证 · 16 语种 TTS 座舱可视化',
  },
  {
    q: '端侧算力有限、云端能力强，大模型能力应该放在哪一侧？',
    how: '「端云怎么分」不该靠评审会上反复摇摆。我用能力分层框架回答：把每类场景（车控/闲聊/生成/多轮任务）按算力档位、网络状态与时延要求归入端/云/降级三路径，让选型变成有据可依的决策表。',
    proofPath: '/work/llm-capability-layering/',
    proofLabel: '案例 · 端云大模型分层',
  },
  {
    q: 'AI 提效停留在个人技巧，怎么升格为组织流程？',
    how: '把 AI 当工位而不是外挂：在需求、开发、测试、复盘四个阶段定义节点输入输出契约与风险分级人审点，提效可量化、产出可审计——个人经验变成可复制的工作流资产。',
    proofPath: '/work/ai-native-workflow/',
    proofLabel: '案例 · AI 原生工作流',
  },
] as const;

export const timeline = [
  { stage: '物联网', note: '设备连接与数据链路的工程地基' },
  { stage: '整车前瞻', note: '从单点技术转向整车级系统视角' },
  { stage: 'AR-HUD', note: '人机界面：显示链路、安全边界与工程落地' },
  { stage: '多语种座舱', note: '16 语种从需求定义到量产交付的全链路' },
  { stage: '端云大模型', note: '车端/云端能力分层架构与场景化选型' },
  { stage: 'AI 工作流', note: '用 AI 重构需求到复盘的交付流程本身' },
] as const;

export const speakerBio =
  `${PERSON.name}，${PERSON.jobTitle}，专注智能座舱多语种本地化、端云大模型架构与 AI 原生工作流三个交叉领域，` +
  '主张「把复杂技术转化为可决策、可交付、可复用的解决方案」。' +
  '他的个人网站以可交互 Demo 与脱敏案例公开工程方法（rayw-lab.github.io/website），' +
  '当前研究方向与开放的合作类型见站内 Now 页。';

export const crystalAxes = [
  { id: 'auto', label: '汽车行业' },
  { id: 'cockpit', label: '智能座舱' },
  { id: 'i18n', label: '多语种' },
  { id: 'llm', label: '大模型' },
  { id: 'workflow', label: 'AI 工作流' },
  { id: 'delivery', label: '项目交付' },
] as const;

export const jobEntries = [
  {
    title: '汽车 AI 座舱方向',
    body: '座舱方案 · 多语种全球化 · 端云大模型 · 芯片选型 · 复杂交付 → 看旗舰案例与方案方法论',
  },
  {
    title: 'AI 提效 / Agent 方向',
    body: 'AI 工作流 · Benchmark 评测 · Agent 搭建 · 知识管理 · 自动化 → 看工作流实践与工具沉淀',
  },
] as const;

export type HallStation = {
  scene: 's2' | 's3' | 's4' | 's5' | 's6';
  bind: string;
  kicker: string;
  title: string;
  stages: { n: string; name: string; note: string; gap?: string }[];
  body: string;
  proofPath?: string;
  proofLabel?: string;
  question?: string;
  figure: 'bus' | 'cone' | 'rings' | 'scale' | 'dag';
};

export const hallStations: HallStation[] = [
  {
    scene: 's2',
    bind: 'stage:1,2;pillar:none;proof:/about/#timeline-title',
    kicker: '地基 · 演进 01–02',
    title: '从物理连接到整车系统视角',
    stages: [
      {
        n: '01',
        name: '物联网',
        note: '设备连接与数据链路的工程地基。',
      },
      {
        n: '02',
        name: '整车前瞻',
        note: '从单点技术转向整车级系统视角。',
      },
    ],
    body: '每一站都在把「更复杂的技术」推向「更接近决策与交付的位置」。打牢设备通信与整车数据链路的地基，建立起理解一辆车、一套复杂硬件系统的全局视野。',
    figure: 'bus',
  },
  {
    scene: 's3',
    bind: 'stage:3;pillar:none;proof:/about/#timeline-title',
    kicker: '光影 · 演进 03',
    title: '把空间交互锚定在物理路面与安全边界上',
    stages: [
      {
        n: '03',
        name: 'AR-HUD',
        note: '人机界面：显示链路、安全边界与工程落地。',
      },
    ],
    body: 'AR-HUD 不是单纯的视觉炫技，而是显示链路时延、光学畸变校正与严苛安全边界的综合博弈。把虚拟光影稳定锚定在瞬息万变的真实道路上。',
    figure: 'cone',
  },
  {
    scene: 's4',
    bind: 'stage:4;pillar:cockpit-i18n;proof:/lab/tts-cockpit/',
    kicker: '声波 · 演进 04 × 支柱 1',
    title: '多语种座舱：从「翻译一遍」到可验收交付',
    stages: [
      {
        n: '04',
        name: '多语种座舱',
        note: '16 语种从需求定义到量产交付的全链路。',
      },
    ],
    body: problems[0].how,
    question: problems[0].q,
    proofPath: problems[0].proofPath,
    proofLabel: problems[0].proofLabel,
    figure: 'rings',
  },
  {
    scene: 's5',
    bind: 'stage:5;pillar:edge-cloud-llm;proof:/work/llm-capability-layering/',
    kicker: '天平 · 演进 05 × 支柱 2',
    title: '端侧算力有限、云端能力强，大模型应该放在哪一侧？',
    stages: [
      {
        n: '05',
        name: '端云大模型',
        note: '车端/云端能力分层架构与场景化选型。',
      },
    ],
    body: problems[1].how,
    question: problems[1].q,
    proofPath: problems[1].proofPath,
    proofLabel: problems[1].proofLabel,
    figure: 'scale',
  },
  {
    scene: 's6',
    bind: 'stage:6;pillar:ai-workflow;proof:/work/ai-native-workflow/',
    kicker: '流水线 · 演进 06 × 支柱 3',
    title: 'AI 提效停留在个人技巧，怎么升格为组织流程？',
    stages: [
      {
        n: '06',
        name: 'AI 工作流',
        note: '用 AI 重构需求到复盘的交付流程本身。',
      },
    ],
    body: problems[2].how,
    question: problems[2].q,
    proofPath: problems[2].proofPath,
    proofLabel: problems[2].proofLabel,
    figure: 'dag',
  },
];

export const hallExits = [
  { path: '/work/', label: '查阅三大旗舰案例' },
  { path: '/lab/', label: '看可交互 Demo' },
  { path: '/now/', label: '正在进行' },
  { path: '/contact/', label: '联系我' },
] as const;

/** 生产登记矩阵（看板单源，禁止示意分） */
export const SCORE_LINE = '综合 80 · 视觉 73 · 功能 87 · 性能 — · e2e 86/86';
