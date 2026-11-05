import type { Params, Selection } from './core/types.ts';
import { unionLangs } from './core/langs.ts';
export interface Store {
  get(): Selection;
  apply(label: string, fn: (s: Selection) => void, opts?: { merge?: boolean }): void;
  restore(label: string, sel: Selection): void;
  undo(): string | null;
  subscribe(cb: (s: Selection, label: string) => void): () => void;
  history(): number;
}
export class LastLanguageError extends Error {
  constructor() { super('至少保留一个语种'); this.name = 'LastLanguageError'; }
}
export function createStore(p: Params, init?: Partial<Selection>): Store {
  let state: Selection = structuredClone({ pkg: 'c3-euanz', tier: 'MAX', car: '', regions: [], offLangs: [], agents: [], overrides: {}, voice: 'online',
    activeRate: p.lic.activeRate, dailyCalls: p.lic.dailyCalls, perMarket: false, systemSwitch: false, ...init });
  const available = (s: Selection, id: string) => {
    const cov = p.packages[s.pkg].agents.find((a) => a.id === id)?.coverage[s.tier];
    return cov === '承接' || cov === '部分承接' || cov === 'AIBOX 承载';
  };
  const validIds = new Set(p.packages[state.pkg].agents.map((a) => a.id));
  const hidden = (state.hidden ?? []).filter((id) => validIds.has(id));
  let desired = new Set([...state.agents, ...hidden]);
  state.agents = [...new Set([...state.agents, ...hidden.filter((id) => available(state, id))])];
  state.hidden = [...desired].filter((id) => !state.agents.includes(id));
  const stack: { state: Selection; desired: string[]; label: string }[] = [];
  const listeners = new Set<(s: Selection, label: string) => void>();
  const notify = (label: string) => { for (const cb of listeners) cb(structuredClone(state), label); };
  const record = (label: string) => {
    stack.push({ state: structuredClone(state), desired: [...desired], label });
    if (stack.length > 50) stack.shift();
  };
  return {
    get: () => structuredClone(state), history: () => stack.length,
    subscribe(cb) { listeners.add(cb); return () => { listeners.delete(cb); }; },
    restore(label, sel) {
      // A saved snapshot is authoritative: do not run apply's transition rules.
      const next = structuredClone(sel);
      const nextDesired = new Set([...next.agents, ...(next.hidden ?? [])]);
      record(label);
      state = next; desired = nextDesired; notify(label);
    },
    apply(label, fn, opts) {
      const next = structuredClone(state), beforeAgents = next.agents, beforeHidden = next.hidden;
      fn(next);
      let nextDesired = new Set(desired);
      if (next.pkg !== state.pkg) { next.agents = []; next.overrides = {}; nextDesired.clear(); }
      else {
        const agentsEdited = beforeAgents !== next.agents || JSON.stringify(state.agents) !== JSON.stringify(next.agents);
        const hiddenEdited = beforeHidden !== next.hidden || JSON.stringify(state.hidden) !== JSON.stringify(next.hidden);
        // Explicit hidden writes replace the remembered selection, including a full clear.
        if (hiddenEdited) nextDesired = new Set([...next.agents, ...(next.hidden ?? [])]);
        else if (agentsEdited) {
          if (next.tier !== state.tier) nextDesired = new Set([...next.agents, ...(next.hidden ?? [])]);
          else {
            // Only an explicit removal of a visible card cancels its remembered choice.
            // Hidden cards must survive edits to other cards while a lower tier is active.
            for (const id of state.agents) if (!next.agents.includes(id)) nextDesired.delete(id);
            for (const id of next.agents) nextDesired.add(id);
          }
        }
        if (next.tier !== state.tier || hiddenEdited) {
          next.agents = [...nextDesired].filter((id) => available(next, id));
        }
        if (next.car !== state.car) {
          if (Object.keys(state.overrides).length || Object.keys(next.overrides).length) label += '（手改已清除）';
          next.overrides = {};
        }
      }
      next.hidden = [...nextDesired].filter((id) => !next.agents.includes(id));
      const langs = unionLangs(p, next).langs;
      if (langs.length && langs.every((l) => l.off)) throw new LastLanguageError();
      if (!opts?.merge) record(label);
      state = structuredClone(next); desired = nextDesired; notify(label);
    },
    undo() {
      const last = stack.pop(); if (!last) return null;
      state = last.state; desired = new Set(last.desired); notify('已撤销：' + last.label); return last.label;
    },
  };
}
