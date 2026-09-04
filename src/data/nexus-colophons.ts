/**
 * 五跋的**骨架数据**（题候选 / 墨法 / 绑定）。
 * 🔴 正文与「迹」是磊哥的私有思考与真实翻车记录，NEEDS_LEIGE；本文件不代写一个字。
 * 题取草案 §2.2 的「立意候选」，在页面上明标「候选 · 待定稿」——候选≠定稿，不冒充。
 * 绑定只到**标题级**（规则文件名），公开尺度逐条由磊哥批（ADR-6 / 草案 §2.1 内容硬规）。
 */
export interface Colophon {
  id: 'harness' | 'skill' | 'subagent' | 'models' | 'tips';
  scene: 's2' | 's3' | 's4' | 's5' | 's6';
  n: '一' | '二' | '三' | '四' | '五';
  method: string;           // 墨法（草案 §1.3）
  titleCandidate: string;   // ≤14 字
  rules: string[];          // ~/.claude/rules/<basename>（标题级绑定）
  sealsFrom?: 'models';     // 跋④的印来自 ledger.receipts
}
export const COLOPHONS: Colophon[] = [
  { id: 'harness', scene: 's2', n: '一', method: '洇', titleCandidate: '模型是墨，harness 是纸',
    rules: ['cc-harness-probe-discipline.md', 'dispatch-actual-channel-forensics.md', 'channel-cognition-flywheel.md', 'rescue-fleet-routing.md'] },
  { id: 'skill', scene: 's3', n: '二', method: '积墨', titleCandidate: '技能不是越多越好',
    rules: ['rules-vs-skill-loading.md', 'roster-sync-on-set-expansion.md'] },
  { id: 'subagent', scene: 's4', n: '三', method: '泼墨', titleCandidate: '并行不是多开窗口',
    rules: ['parallel-safety.md', 'parallel-instruction-second-half-dropped.md', 'concurrent-audit-time-race.md', 'foreground-batch-not-background-drip.md'] },
  { id: 'models', scene: 's5', n: '四', method: '印', titleCandidate: '评测先问「谁在答」',
    rules: ['claim-vs-reality-gap.md', 'ai-fabrication-taxonomy.md', 'cross-vendor-final-audit.md', 'opus-fable-parity.md'], sealsFrom: 'models' },
  { id: 'tips', scene: 's6', n: '五', method: '飞白', titleCandidate: '小技巧的本体是反射',
    rules: ['completion-claim-triage.md', 'absence-claim-probe-first.md', 'pre-mortem-reflex.md', 'unverified-premise-hardening.md'] },
];
