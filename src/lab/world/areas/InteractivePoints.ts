// 移植精简自 folio-2025 sources/Game/InteractivePoints.js（663 行 → ~280 行，MIT，
// vendor/README.md 记录 commit 41046b5；裁决口径 = folio-gap-and-reuse-report §5.3 B-5）。
// POI 标点三件套：TSL 菱形圈（threshold/line 双 uniform 开合）+ 楼名标签
// （TextCanvas 纹理滑入）+ 键位图标（共享单 mesh，跟随 activeItem）。
// 状态机 STATE_HIDDEN / STATE_OPEN / STATE_CONCEALED 原样保留。
// 保留：items 注册、zone 联动开合（Areas 驱动 reveal/conceal）、RayCursor 悬停/点按、
//       interact 键位动作（键从 world-pois.json 注入；categories 只挂
//       wandering/driving——intro 归 Reveal CTA，勿抢 Space）。
// 砍除（gap 报告精简口径）：音效注册、成就钩子、debug 面板、Gamepad 键图三款、
//       temporaryHide/recover 全局隐显、逐帧玩家距离扫描（触发圈归 game.zones）。
// gsap 补间全部换手写缓动（back.in/elastic.out/power2 数值等价）+ tick 驱动
// tween 通道表（同通道后写覆盖 = gsap overwrite:true 语义）——依赖红线 G5。
import * as THREE from 'three/webgpu';
import { Fn, max, mix, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { Game } from '../core/Game';
import { Inputs, type InputAction } from '../inputs/Inputs';
import type { RayCursor, RayIntersect } from '../inputs/RayCursor';
import { TextCanvas } from '../world/TextCanvas';

/* ———— 手写缓动（gsap 同名曲线的数值等价） ———— */
type EaseFunction = (t: number) => number;
const easePower2In: EaseFunction = (t) => t * t;
const easePower2Out: EaseFunction = (t) => 1 - (1 - t) * (1 - t);
const easeBackIn = (s: number): EaseFunction => (t) => t * t * ((s + 1) * t - s);
const easeElasticOut = (amplitude: number, period: number): EaseFunction => {
  const shift = (period / (Math.PI * 2)) * Math.asin(1 / amplitude);
  return (t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : amplitude * Math.pow(2, -10 * t) * Math.sin(((t - shift) * Math.PI * 2) / period) + 1;
};

/** hex → 线性空间 vec3 节点（NeonMaterials 同款口径；POI 三色运行期不变，无需 uniform） */
function colorNode(hex: string) {
  const c = new THREE.Color(hex).convertSRGBToLinear();
  return vec3(c.r, c.g, c.b);
}

interface TweenItem {
  read: () => number;
  apply: (value: number) => void;
  to: number;
  duration: number;
  delay: number;
  ease: EaseFunction;
  elapsed: number;
  from: number | null;
  onComplete?: () => void;
}

export interface InteractivePointConfig {
  /** 稳定机器键（POI 场景 = buildings JSON id） */
  id: string;
  /** 标点世界坐标（含悬浮高度 y） */
  position: THREE.Vector3;
  /** 标签行（TextCanvas 多行） */
  lines: string[];
  /** 菱形圈/描边强调色（buildings JSON neonColor） */
  accentColor: string;
  align?: typeof InteractivePoints.ALIGN_LEFT | typeof InteractivePoints.ALIGN_RIGHT;
  onInteract?(): void;
}

export interface InteractivePointItem {
  readonly id: string;
  readonly group: THREE.Group;
  state: number;
  /** true = 触发圈把它压住展开（悬停离开不收合），Areas 的 boundingIn/Out 维护 */
  pinned: boolean;
  intersect: RayIntersect;
  reveal(): void;
  conceal(): void;
  hide(): void;
  interact(): void;
}

export interface InteractivePointsOptions {
  /** 交互键位（Inputs keys 语法，world-pois.json interaction.keys 注入） */
  keys: string[];
  /** 键位图标字符（世界内键帽，如 'E'） */
  keyLabel: string;
}

export class InteractivePoints {
  static readonly ALIGN_LEFT = 1;
  static readonly ALIGN_RIGHT = 2;

  static readonly STATE_HIDDEN = 3;
  static readonly STATE_OPEN = 4;
  static readonly STATE_CONCEALED = 5;

  /** 标点整体缩放（folio 0.85 → 城市尺度放大；菱形全开对角 ≈ 2×scale 米。
   *  1.7 = 运行时冒烟标定：跟车相机 15–30m 机位下标签可读且不压 HUD 提示行） */
  static readonly POINT_SCALE = 1.7;

  private readonly game: Game;
  private readonly rayCursor: RayCursor;
  readonly items: InteractivePointItem[] = [];
  activeItem: InteractivePointItem | null = null;

  private readonly tweens = new Map<string, TweenItem>();
  private readonly disposables: Array<{ dispose(): void }> = [];

  private readonly geometries: { plane: THREE.PlaneGeometry; label: THREE.PlaneGeometry };
  private readonly backColor = colorNode('#141019');
  private readonly frontColor = colorNode('#f4f2f8');
  private keyIcon!: THREE.Mesh;

  constructor(game: Game, rayCursor: RayCursor, options: InteractivePointsOptions) {
    this.game = game;
    this.rayCursor = rayCursor;

    this.geometries = {
      plane: new THREE.PlaneGeometry(2, 2),
      label: new THREE.PlaneGeometry(1, 1, 1, 1),
    };
    this.geometries.label.translate(0.5, 0, 0);

    this.setKeyIcon(options.keyLabel);
    this.setInputs(options.keys);

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updateTweens();
      },
      9, // order 9：标点动画在 zones(8) 后、区域逻辑(10) 前（folio 同位）
    );
  }

  /** 键位图标：canvas 手绘键帽（圆角框 + 字符），零外部资产（folio 用 KTX 键图三款） */
  private setKeyIcon(keyLabel: string): void {
    const size = 96;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, size, size);
    context.strokeStyle = '#ffffff';
    context.lineWidth = 7;
    context.beginPath();
    context.roundRect(10, 10, size - 20, size - 20, 18);
    context.stroke();
    context.fillStyle = '#ffffff';
    context.font = '700 46px ui-monospace, Menlo, Consolas, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(keyLabel, size / 2, size / 2 + 2);

    const keyTexture = new THREE.Texture(canvas);
    keyTexture.colorSpace = THREE.SRGBColorSpace;
    keyTexture.minFilter = THREE.NearestFilter;
    keyTexture.magFilter = THREE.NearestFilter;
    keyTexture.flipY = false;
    keyTexture.generateMipmaps = false;
    keyTexture.needsUpdate = true;
    this.disposables.push(keyTexture);

    const material = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false });
    material.outputNode = Fn(() => {
      const iconAlpha = texture(keyTexture, vec2(uv().x, uv().y.oneMinus())).r;
      iconAlpha.lessThan(0.5).discard();
      return vec4(this.frontColor, 1);
    })();

    const mesh = new THREE.Mesh(this.geometries.plane, material);
    mesh.renderOrder = 8;
    mesh.scale.setScalar(0);
    mesh.position.z = 0.01;
    mesh.visible = false;
    this.keyIcon = mesh;

    // 触屏无键盘：键帽隐藏（点按走 RayCursor onClick）
    this.game.inputs.events.on('modeChange', () => {
      if (this.game.inputs.mode === Inputs.MODE_TOUCH) this.keyIcon.visible = false;
      else if (this.activeItem?.state === InteractivePoints.STATE_OPEN) this.keyIcon.visible = true;
    });
  }

  private setInputs(keys: string[]): void {
    // 只挂 wandering/driving：intro 上下文的 Space/CTA 归 Reveal（CC-A2 键位裁决不越界）
    this.game.inputs.addActions([{ name: 'poiInteract', categories: ['wandering', 'driving'], keys }]);
    this.game.inputs.events.on('poiInteract', (action: InputAction) => {
      if (action.active && this.activeItem && this.activeItem.state === InteractivePoints.STATE_OPEN)
        this.activeItem.interact();
    });
  }

  create(config: InteractivePointConfig): InteractivePointItem {
    const align = config.align ?? InteractivePoints.ALIGN_LEFT;
    const channel = `poi:${config.id}:`;

    const group = new THREE.Group();
    group.rotation.reorder('YXZ');
    group.rotation.x = -Math.PI * 0.15;
    group.rotation.y = Math.PI * 0.25; // 对齐 View spherical.theta（固定等距视角）
    group.position.copy(config.position);
    group.scale.setScalar(InteractivePoints.POINT_SCALE);
    this.game.scene.add(group);

    /* ———— 标签（TextCanvas 纹理 + 滑入 offset）———— */
    const labelCanvas = new TextCanvas({
      fontWeight: '700',
      fontSize: 30,
      height: 92,
      horizontalAlign: 'left',
      lineHeight: 40,
      paddingLeft: 88, // 键帽/菱形让位（folio 60px 语义，按本站键帽尺寸放大）
      paddingRight: 26,
    });
    labelCanvas.updateText(config.lines);
    this.disposables.push(labelCanvas);

    const labelMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: true });
    const labelOffset = uniform(align === InteractivePoints.ALIGN_LEFT ? -1 : 1);
    labelMaterial.outputNode = Fn(() => {
      const shiftedU = uv().x.sub(labelOffset);
      const mask = texture(labelCanvas.texture, vec2(shiftedU, uv().y.oneMinus())).r;
      shiftedU.greaterThan(1).discard();
      shiftedU.lessThan(0).discard();
      return vec4(mix(this.backColor, this.frontColor, mask), 1);
    })();

    const label = new THREE.Mesh(this.geometries.label, labelMaterial);
    label.renderOrder = 6;
    label.scale.y = 0.9;
    label.scale.x = 0.9 * labelCanvas.aspect;
    label.position.z = -0.01;
    label.position.x = align === InteractivePoints.ALIGN_LEFT ? 0 : -label.scale.x;
    label.visible = false;
    group.add(label);

    /* ———— 菱形圈（Chebyshev 距离场 + 双描边 uniform）———— */
    const accentColor = colorNode(config.accentColor);
    const threshold = uniform(0.25); // 初始即 CONCEALED 小圈（砍 folio revealed 全局门）
    const lineThickness = uniform(0.15);
    const lineOffset = uniform(0.175);

    const diamondMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: true });
    diamondMaterial.outputNode = Fn(() => {
      const dist = max(uv().x.sub(0.5).abs(), uv().y.sub(0.5).abs()).mul(2);
      const line = step(threshold.sub(dist).sub(lineOffset).abs(), lineThickness.mul(0.5));
      dist.greaterThan(threshold).discard();
      return vec4(mix(this.backColor, accentColor, line), 1);
    })();

    const diamond = new THREE.Mesh(this.geometries.plane, diamondMaterial);
    diamond.renderOrder = 7;
    diamond.rotation.z = Math.PI * 0.25;
    group.add(diamond);

    const itemMaterials = [labelMaterial, diamondMaterial];

    const item: InteractivePointItem = {
      id: config.id,
      group,
      state: InteractivePoints.STATE_CONCEALED,
      pinned: false,
      intersect: null as unknown as RayIntersect,
      reveal: () => {
        if (item.state === InteractivePoints.STATE_OPEN) return;
        item.state = InteractivePoints.STATE_OPEN;
        item.intersect.active = true;
        diamond.visible = true;
        label.visible = true;
        group.add(this.keyIcon);

        this.tween(`${channel}threshold`, threshold, 0.5, 1.5, 0, easeElasticOut(1.3, 0.4));
        this.tween(`${channel}lineThickness`, lineThickness, 0.075, 1.5, 0, easeElasticOut(1.3, 0.4));
        this.tween(`${channel}lineOffset`, lineOffset, 0.15, 1.5, 0, easeElasticOut(1.3, 0.4));
        this.tween(`${channel}labelOffset`, labelOffset, 0, 0.6, 0.2, easePower2Out);

        if (this.game.inputs.mode !== Inputs.MODE_TOUCH) {
          this.keyIcon.visible = true;
          this.keyIcon.scale.setScalar(0);
          this.tweenKeyIconScale(0.25, 1.5, 0.6, easeElasticOut(1.3, 0.8));
        }

        // 开态穿墙可见（folio depthTest 热切）
        for (const material of itemMaterials) {
          material.depthTest = false;
          material.needsUpdate = true;
        }

        if (this.activeItem && this.activeItem !== item) this.activeItem.conceal();
        this.activeItem = item;
      },
      conceal: () => {
        if (item.state === InteractivePoints.STATE_CONCEALED) return;
        const wasHidden = item.state === InteractivePoints.STATE_HIDDEN;
        item.state = InteractivePoints.STATE_CONCEALED;
        item.intersect.active = true;
        diamond.visible = true;

        const ease = wasHidden ? easePower2Out : easeBackIn(4.5);
        this.tween(`${channel}threshold`, threshold, 0.25, 0.6, 0.2, ease);
        this.tween(`${channel}lineThickness`, lineThickness, 0.15, 0.6, 0.2, ease);
        this.tween(`${channel}lineOffset`, lineOffset, 0.175, 0.6, 0.2, ease, () => {
          label.visible = false;
          for (const material of itemMaterials) {
            material.depthTest = true;
            material.needsUpdate = true;
          }
        });
        this.tween(
          `${channel}labelOffset`,
          labelOffset,
          align === InteractivePoints.ALIGN_LEFT ? -1 : 1,
          0.6,
          0,
          easePower2In,
        );

        if (this.activeItem === item) {
          this.tweenKeyIconScale(0, 0.6, 0, easePower2In, () => {
            this.keyIcon.visible = false;
          });
          this.activeItem = null;
        }
      },
      hide: () => {
        if (item.state === InteractivePoints.STATE_HIDDEN) return;
        item.state = InteractivePoints.STATE_HIDDEN;
        item.intersect.active = false;

        this.tween(`${channel}threshold`, threshold, 0, 0.6, 0, easeBackIn(4.5));
        this.tween(`${channel}lineThickness`, lineThickness, 0.15, 0.6, 0, easeBackIn(4.5));
        this.tween(`${channel}lineOffset`, lineOffset, 0.175, 0.6, 0, easeBackIn(4.5), () => {
          diamond.visible = false;
          label.visible = false;
        });
        this.tween(`${channel}labelOffset`, labelOffset, 1, 0.6, 0, easePower2In);
        this.tweenKeyIconScale(0, 0.6, 0, easePower2In, () => {
          this.keyIcon.visible = false;
        });

        if (this.activeItem === item) this.activeItem = null;
      },
      interact: () => {
        // 确认脉冲：圈瞬胀回弹（folio interact 补间对）
        this.tween(`${channel}threshold`, threshold, 0.6, 0.1, 0, easePower2Out, () => {
          this.tween(`${channel}threshold`, threshold, 0.5, 1.5, 0, easeElasticOut(1.3, 0.6));
        });
        config.onInteract?.();
      },
    };

    /* ———— RayCursor：悬停展开 / 点按交互（触屏「进入」等价键）———— */
    const sphereCenter = config.position.clone();
    item.intersect = this.rayCursor.addIntersect({
      active: true,
      shape: new THREE.Sphere(sphereCenter, 1.1 * InteractivePoints.POINT_SCALE),
      onClick: () => {
        if (item.state !== InteractivePoints.STATE_HIDDEN) item.interact();
      },
      onEnter: () => {
        if (item.state !== InteractivePoints.STATE_HIDDEN) item.reveal();
      },
      onLeave: () => {
        // 触发圈压住（pinned）时悬停离开不收合——zone leave 才收
        if (this.activeItem === item && item.state !== InteractivePoints.STATE_HIDDEN && !item.pinned)
          item.conceal();
      },
    });

    this.items.push(item);
    return item;
  }

  /* ———— tick 驱动 tween 通道表（同通道覆盖 = gsap overwrite:true）———— */
  private tween(
    channel: string,
    target: { value: number },
    to: number,
    duration: number,
    delay: number,
    ease: EaseFunction,
    onComplete?: () => void,
  ): void {
    this.tweens.set(channel, {
      read: () => target.value,
      apply: (value) => {
        target.value = value;
      },
      to,
      duration,
      delay,
      ease,
      elapsed: 0,
      from: null,
      onComplete,
    });
  }

  private tweenKeyIconScale(to: number, duration: number, delay: number, ease: EaseFunction, onComplete?: () => void): void {
    this.tweens.set('poi:keyIconScale', {
      read: () => this.keyIcon.scale.x,
      apply: (value) => this.keyIcon.scale.setScalar(value),
      to,
      duration,
      delay,
      ease,
      elapsed: 0,
      from: null,
      onComplete,
    });
  }

  private updateTweens(): void {
    const delta = this.game.ticker.delta;
    for (const [channel, item] of this.tweens) {
      item.elapsed += delta;
      if (item.elapsed < item.delay) continue;
      if (item.from === null) item.from = item.read();

      const t = Math.min((item.elapsed - item.delay) / item.duration, 1);
      item.apply(item.from + (item.to - item.from) * item.ease(t));

      if (t >= 1) {
        this.tweens.delete(channel);
        item.onComplete?.();
      }
    }
  }

  /** 纹理等非场景资源释放（几何/材质由 Game.dispose 场景遍历统一回收） */
  dispose(): void {
    this.tweens.clear();
    for (const disposable of this.disposables) disposable.dispose();
    this.disposables.length = 0;
  }
}
