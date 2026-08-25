// Lab 模块注册表加载器（仅构建期 / 服务端使用，禁止被客户端脚本 import）。
// 职责：zod 校验 manifest.json（SRD §8.2）+ 解耦下的完整性检查（§12.3 精神）：
//   - slug / code / viewTransitionName 全站唯一；
//   - entry 必须真实存在于 src/lab/modules/*/index.ts（world 单例除外，Phase 4 接入）；
//   - poster 必须真实存在于 public/。
// 任何一条不满足 = 构建失败，问题不出仓库。
// 存在性检查用 import.meta.glob：键在编译期从源码位置解析，prerender 阶段依然可靠（无 fs 依赖）。
import { labModuleSchema, type LabModule } from './contracts';
import rawManifest from './manifest.json';

const moduleEntries = import.meta.glob('./modules/*/index.ts');
const posterFiles = import.meta.glob('../../public/posters/**/*.{webp,png,jpg,jpeg,avif,svg}');

function assertUnique(values: string[], label: string): void {
  const dup = values.find((v, i) => values.indexOf(v) !== i);
  if (dup) throw new Error(`[lab/manifest] ${label} 重复：${dup}`);
}

function parseManifest(): LabModule[] {
  const modules = labModuleSchema.array().parse(rawManifest);

  assertUnique(modules.map((m) => m.slug), 'slug');
  assertUnique(modules.map((m) => m.code), 'code');
  assertUnique(modules.map((m) => m.viewTransitionName), 'viewTransitionName');

  for (const m of modules) {
    if (m.slug !== 'world' && !(`./${m.entry}` in moduleEntries)) {
      throw new Error(
        `[lab/manifest] ${m.slug} 的 entry "${m.entry}" 不存在于 src/lab/modules/*/index.ts`,
      );
    }
    if (!(`../../public/${m.poster}` in posterFiles)) {
      throw new Error(`[lab/manifest] ${m.slug} 的 poster "public/${m.poster}" 不存在`);
    }
  }
  return modules;
}

/** 全量注册表（已过 schema + 唯一性 + 资产存在性校验） */
export const labModules: LabModule[] = parseManifest();

/** 按 slug 取模块记录；页面薄壳使用，slug 不存在 = 构建失败 */
export function getLabModule(slug: string): LabModule {
  const found = labModules.find((m) => m.slug === slug);
  if (!found) throw new Error(`[lab/manifest] 未注册的 slug：${slug}`);
  return found;
}
