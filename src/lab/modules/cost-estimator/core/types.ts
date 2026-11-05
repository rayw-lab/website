export type PackageId = 'c3-euanz' | 'c3-sea' | 'c15-eu' | 'c15-ru';
export type RegionId = 'eu' | 'anz' | 'ru' | 'sea' | 'me' | 'za' | 'latam' | 'ca' | 'eul';
export type Tier = 'MAX' | 'PRO' | 'Lite';
export type Coverage = '承接' | '部分承接' | 'AIBOX 承载' | '不承接' | '待评估';
export type Kind = 'first' | 'ext' | 'fused' | 'delivered';
export type NreKey = 'research' | 'product' | 'delivery' | 'direct' | 'langFirst' | 'voiceLang';
export interface First {
  research: number | null; product: number | null; delivery: number | null; direct: number | null; preShared: boolean;
}
export interface Ext {
  base: number | null; perMarket: number | null; perLang: number | null; systemSwitch: number | null;
}
export interface Agent {
  id: string; name: string; layer: string; coverage: Record<Tier, Coverage>; caps: string[]; isVoice: boolean;
  first: First | null; ext: Ext | null; extByTier?: Partial<Record<Tier, Ext | null>>;
  lic: { mode: 'bottomUp' | 'scaled'; tokenPerCar: number | null; scaledBase: number | null } | null;
  notes: string[]; src: string[];
}
export interface Params {
  version: string;
  capNames: Record<string, string>;
  rates: { research: number; researchShare: number; product: number; productShare: number; delivery: number;
    voiceLangFirst: number; voiceLangReuse: number; perMarketPm: number };
  lic: { voiceOnline: number; voiceOffline: number; activeRate: number; dailyCalls: number; baseActive: number; baseCalls: number };
  regions: Record<RegionId, { name: string; langs: string[]; sourcePerCar: number | null; serverPerCar: number | null; pkgHint?: PackageId[] }>;
  langs: Record<string, { name: string; family: string; anchorRank: number; verified: boolean; voiceDone: boolean | null; variantOf?: string | null }>;
  weights: Partial<Record<RegionId, Record<string, number>>>;
  cars: { id: string; name: string; delivered: { region: RegionId; caps: string[]; langs: string[] }[] }[];
  packages: Record<PackageId, { name: string; tiers: boolean; layers: string[]; agents: Agent[] }>;
  langFirst?: Record<string, { overall: number | null; research: number | null; src: string }>;
  researchPools?: { id: string; caps: string[]; research: number | null; src?: string }[];
  onceCaps?: Record<string, number>;
}
export interface Selection {
  pkg: PackageId; tier: Tier; car: string; regions: RegionId[]; offLangs: string[];
  agents: string[]; overrides: Record<string, 'first' | 'ext'>; voice: 'online' | 'offline';
  hidden?: string[];
  activeRate: number; dailyCalls: number; perMarket: boolean; systemSwitch: boolean;
}
export interface LangView { id: string; name: string; weight: number; firstW?: number; isNew: boolean; off: boolean; why: string }
export interface RowResult {
  id: string; kind: Kind; manual: boolean; counted: boolean; pm: number;
  research: number; product: number; delivery: number; direct: number; sum: number | null;
  formula: string[]; notes: string[]; pending: string[];
}
export interface Result {
  langs: LangView[]; eq: number; newLangs: string[]; rows: RowResult[];
  nre: Record<NreKey, number> & { known: number; total: number | null; pending: Partial<Record<NreKey, string[]>> };
  lic: { voice: number; source: number; server: number; token: number; known: number;
    pendingRegions: RegionId[]; pendingSource: RegionId[]; pendingServer: RegionId[]; pendingAgents: string[] };
  counts: { first: number; ext: number; fused: number; no: number; tbd: number }; notes: string[];
}
