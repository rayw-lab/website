// 移植自 folio-2025 sources/Game/Materials/MeshGridMaterial.js（156 行，MIT，
// vendor/README.md 记录 commit 41046b5；抗锯齿网格算法出处：folio 头注所引
// Ben Golus "The Best Darn Grid Shader (Yet)"）。CC-E4 迁移核对（three 0.185）：
//   · NodeMaterial / Color 自 three/webgpu，TSL 节点自 three/tsl——0.185 导出面与
//     folio（r183）一致，零改名；
//   · folio 原文引用了未导入的 positionLocal（local* 分支的潜在 bug），本移植补齐导入；
//   · Line.offset 原文 uniform(vec2(0))（节点包节点），改为 uniform(new Vector2())——
//     语义相同、类型干净；
//   · toMask 的 mask 显式 .toVar()（WGSL 侧 assign 目标必须是变量，folio 依赖隐式转换）；
//   · 四个网格函数由 Fn([...]) 改为普通 TS 函数（构图内联，产物 shader 等价；
//     绕开 @types/three 0.185 对 Fn 参数元组的类型摩擦）。
// 用途：出生点/城市网格地面材质（world/Grid.ts 消费 TSL 函数出口；
// MeshGridMaterial 类保留 folio 完整 API，供 intro 舞台/灰盒地面后续复用）。
import * as THREE from 'three/webgpu';
import type { Node, UniformNode } from 'three/webgpu';
import {
  If,
  clamp,
  mix,
  normalWorld,
  positionLocal,
  positionWorld,
  smoothstep,
  step,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';

/** TSL 节点句柄类型锚（@types/three 0.185 新制式：Node<"float"> 泛型字符串） */
export type FloatNode = Node<'float'>;
export type Vec2Node = Node<'vec2'>;
export type Vec3Node = Node<'vec3'>;

/** 法线主轴掩码：法线最接近哪根世界轴，返回该轴的单位向量（triplanar 选面） */
export function toMask(normal: Vec3Node): Vec3Node {
  const vecX = vec3(1, 0, 0);
  const vecY = vec3(0, 1, 0);
  const vecZ = vec3(0, 0, 1);

  const dotX = normal.dot(vecX).abs();
  const dotY = normal.dot(vecY).abs();
  const dotZ = normal.dot(vecZ).abs();

  const mask = vecX.toVar();

  If(dotZ.greaterThan(dotX), () => {
    mask.assign(vecZ);
  });
  If(dotY.greaterThan(dotX).and(dotY.greaterThan(dotZ)), () => {
    mask.assign(vecY);
  });

  return mask;
}

/** triplanar UV：按主轴掩码从三组平面坐标中选一 */
export function toTriplanarUv(position: Vec3Node, mask: Vec3Node): Vec2Node {
  const uvX = position.yz;
  const uvY = position.xz;
  const uvZ = position.xy;

  let planarUv = uvX;
  planarUv = mix(planarUv, uvY, mask.y) as typeof planarUv;
  planarUv = mix(planarUv, uvZ, mask.z) as typeof planarUv;

  return planarUv;
}

/** 无抗锯齿网格线（远景/低配可用；cross < 1 时线在交点处收缩成十字段） */
export function toGrid(
  referenceUvInput: Vec2Node,
  scale: FloatNode,
  thickness: FloatNode,
  offset: Vec2Node,
  cross: FloatNode,
): FloatNode {
  const referenceUv = referenceUvInput.div(scale).add(offset);
  const crossGrid = step(referenceUv.fract().sub(0.5).abs(), cross.oneMinus().mul(0.5));
  const crossMask = mix(crossGrid.x, 1, crossGrid.y).oneMinus();
  const grid = step(referenceUv.sub(0.5).fract().sub(0.5).abs().mul(2), thickness).mul(crossMask);
  return mix(grid.x, 1, grid.y);
}

/**
 * 抗锯齿网格线（Ben Golus 算法，folio 原实现）：fwidth 求屏幕空间导数 →
 * 线宽夹持 + smoothstep 羽化 + 远处按覆盖率淡出（防摩尔纹）。
 * derivateMask：triplanar 面切换缝隙处导数爆炸，掩掉（平面地面传 1 即可）。
 */
export function toAntialiasedGrid(
  referenceUvInput: Vec2Node,
  scale: FloatNode,
  thickness: FloatNode,
  offset: Vec2Node,
  cross: FloatNode,
  derivateMask: FloatNode,
): FloatNode {
  // folio 原文以 float lineWidth 隐式广播进 vec2 运算；@types 0.185 泛型收紧后
  // 显式 vec2 化（产物 shader 等价）
  const lineWidth = vec2(thickness);
  const referenceUv = referenceUvInput.div(scale).add(offset);
  const uvDeriv = referenceUv.fwidth().mul(derivateMask);
  const drawWidth = clamp(lineWidth, uvDeriv, vec2(1));
  const lineAA = uvDeriv.mul(1.5);

  const crossGrid = step(referenceUv.fract().sub(0.5).abs(), cross.oneMinus().mul(0.5));
  const crossMask = mix(crossGrid.x, 1, crossGrid.y).oneMinus();

  const gridUV = referenceUv.fract().mul(2).sub(1).abs().oneMinus();
  let grid = smoothstep(drawWidth.add(lineAA), drawWidth.sub(lineAA), gridUV);
  grid = grid.mul(clamp(lineWidth.div(drawWidth), vec2(0), vec2(1))) as typeof grid;
  // folio 原文 mix(grid, lineWidth, fade)——@types 0.185 的 mix 重载未覆盖三 vec2
  // 形参组合，展开为等价的线性插值方法链（产物 shader 等价）
  const fade = clamp(uvDeriv.mul(2).sub(1), vec2(0), vec2(1));
  grid = grid
    .mul(fade.oneMinus())
    .add(lineWidth.mul(fade))
    .mul(crossMask) as typeof grid;
  return mix(grid.x, 1, grid.y);
}

/** 单层网格线参数组（全部 uniform：运行时可调，debug 面板/品质档直改 value） */
export class MeshGridMaterialLine {
  readonly color: UniformNode<'color', THREE.Color>;
  readonly scale: UniformNode<'float', number>;
  readonly thickness: UniformNode<'float', number>;
  readonly cross: UniformNode<'float', number>;
  readonly offset: UniformNode<'vec2', THREE.Vector2>;

  constructor(
    lineColor: THREE.ColorRepresentation = 0xffffff,
    scale = 1,
    thickness = 0.05,
    cross = 1,
    offset = new THREE.Vector2(0, 0),
  ) {
    this.color = uniform(new THREE.Color(lineColor));
    this.scale = uniform(scale);
    this.thickness = uniform(thickness);
    this.cross = uniform(cross);
    this.offset = uniform(offset);
  }
}

export type MeshGridMaterialReference =
  | 'uv'
  | 'worldTriplanar'
  | 'worldX'
  | 'worldY'
  | 'worldZ'
  | 'localTriplanar'
  | 'localX'
  | 'localY'
  | 'localZ';

export interface MeshGridMaterialParameters extends THREE.MaterialParameters {
  /** 底色（网格线之外的填充色） */
  color?: THREE.ColorRepresentation;
  /** 全局缩放（所有线层共乘；uv 参考系常用 0.001 级） */
  scale?: number;
  /** 抗锯齿网格（默认开；关闭走硬边 step 版本） */
  antialiased?: boolean;
  /** UV 参考系：uv / world*（世界坐标跨网格无缝）/ local* */
  reference?: MeshGridMaterialReference;
  /** 线层列表（按序混合，后层压前层） */
  lines?: MeshGridMaterialLine[];
}

/**
 * 网格地板材质（unlit NodeMaterial：outputNode 直出，不参与光照——
 * 需要光照/阴影/雾时，用本文件导出的 toAntialiasedGrid 组进 Standard 材质，
 * 见 world/Grid.ts 的城市地面用法，对应 folio 以 MeshDefaultMaterial 包裹的做法）。
 */
export class MeshGridMaterial extends THREE.NodeMaterial {
  readonly isMeshGridMaterial = true;

  readonly scaleNode: UniformNode<'float', number>;
  reference: MeshGridMaterialReference = 'uv';
  antialiased = true;
  color = new THREE.Color(0x000000);
  lines: MeshGridMaterialLine[] = [new MeshGridMaterialLine()];

  constructor(parameters: MeshGridMaterialParameters = {}) {
    super();

    // 迁移核对：folio 原文另设 this.normals = false——0.185 NodeMaterial 已无该
    // 布尔开关（normalNode 体系取代），unlit 语义由 lights=false + outputNode 直出承担
    this.lights = false;

    this.scaleNode = uniform(1);

    this.setValues(parameters);

    const mask = toMask(normalWorld);
    const maskDerivate = mask.fwidth().length().oneMinus().clamp(0, 1);

    let uvReference: Vec2Node = uv();
    if (this.reference === 'worldTriplanar') uvReference = toTriplanarUv(positionWorld, mask);
    else if (this.reference === 'worldX') uvReference = positionWorld.yz;
    else if (this.reference === 'worldY') uvReference = positionWorld.xz;
    else if (this.reference === 'worldZ') uvReference = positionWorld.xy;
    else if (this.reference === 'localTriplanar') uvReference = toTriplanarUv(positionLocal, mask);
    else if (this.reference === 'localX') uvReference = positionLocal.yz;
    else if (this.reference === 'localY') uvReference = positionLocal.xz;
    else if (this.reference === 'localZ') uvReference = positionLocal.xy;

    let gridColor: Vec3Node = uniform(this.color) as unknown as Vec3Node;

    for (const line of this.lines) {
      const grid = this.antialiased
        ? toAntialiasedGrid(
            uvReference,
            line.scale.mul(this.scaleNode) as FloatNode,
            line.thickness,
            line.offset as unknown as Vec2Node,
            line.cross,
            maskDerivate as FloatNode,
          )
        : toGrid(
            uvReference,
            line.scale.mul(this.scaleNode) as FloatNode,
            line.thickness,
            line.offset as unknown as Vec2Node,
            line.cross,
          );

      gridColor = mix(gridColor, line.color, grid) as Vec3Node;
    }

    this.outputNode = vec4(gridColor, 1);
  }

  get scale(): number {
    return this.scaleNode.value;
  }

  set scale(value: number) {
    this.scaleNode.value = value;
  }
}
