# CC-BL2：concept-garage 沿街 hero 楼实模（3D 汽车配置器车库）—— Blender 4.0 headless 生成脚本。
#
# 沿 BL1（generate-autodrive-lab.py）已验证管线扩第二栋：同一 Buf/box/curtain_wall 几何
# 语言、同一贴图生成器、同一压缩合同（Draco + KTX2/ETC1S）。本脚本是资产的**唯一源文件**
# （.blend 二进制被预算门 G-F 黑名单禁止入库，零外部资产、零许可负担——全部原创程序化生成）：
#   blender -b --factory-startup -P tools/blender/generate-concept-garage.py -- --out /tmp/bl2-asset
# 产出 /tmp/bl2-asset/ConceptGarage-raw.glb（未压缩）+ 三张程序化 PNG 贴图（≤1024，≤2K 合同）。
# 压缩管线见 public/models/concept-garage/README.md（gltf-transform + toktx）。
#
# 坐标契约（与 src/data/cyber-city-buildings.json concept-garage 条目对齐）：
#   · Blender X=东、Y=北、Z=上；glTF 导出 Y-up 自动换轴（three: x=bx, y=bz, z=-by）；
#   · 原点 = 楼体足迹中心地面点；运行时由 HeroBlenderMesh 平移到 building.position (140,-44)；
#   · footprint w60(X) × d36(Y) —— 物理碰撞体沿用 footprint cuboid h18 合同不变；
#     视觉包络 [CC-BL2-R2]：主体仍 h18 同笼，西端上探段体量再分布（BL2-R2 补洞：
#     后场螺旋塔在 ?poi=work-gallery 帧被自家南女儿墙 22.3-24.3m 遮挡线 + 西肩块
#     遮挡线 ~26.2m 全遮、信标顶 ndc.y=1.04 被帧顶裁切——NDC 探针实测）——
#     西肩块 21.6 不变 / 螺旋塔迁至南立面西段鼓塔（中心 bx-22.5,by-13.5，r7.5，
#     塔身 6.26→22.4、冠环 22.9、桅杆信标顶 24.65；南凸 3m 至 by-21 悬空件，
#     底 6.26m 高于雨棚 4.8m 悬挑先例，18m 以上无可达路径无碰撞需求；
#     FlightTrails 三航线全部 z≤-110，离本楼 ≥48m 已核）；
#     BuildingSigns 南立面灯箱挂高 min(25, max(9, 0.34h))=9、挂点 by=-(18+0.35)，
#     模型侧已留「招牌避让背板区」bx∈[-10.2,10.2] z∈[7.0,11.0]；
#   · 楼顶全息板（BuildingSigns 单临街楼朝南）：bx∈[-10.5,10.5] × z∈[19.1,21.7] @ by≈0
#     —— 屋顶设备全部避让 |bx|<12 ∧ |by|<1.8 走廊；
#   · 前场（南侧 plaza，世界 z -26~-12）：parkingBay (140,-18) r8 → 本地 bx∈[-8,8],
#     by∈[-34,-18] 让空（POI 深链泊车圈）；StreetLamps 灯杆世界 (150,-13.5) → 本地
#     (10,-30.5) 邻域 ≥2m 让空；卷帘门正面（bx 3.75~18.75 的 by -18~-24 带）留出入通道。
#
# 色纪律（rubric A3 / AL-BL1）：窗格只用 暖白/青/暗 三族（atlas 随机 cell）；
# 楼宇身份色 #3b82f6（蓝）只进 LED 檐口线/竖带/信标/屏幕描边——不直出窗格；
# 全部 emissive ≤1（bloom threshold=1 阈下），唯一辉光锚 = 屋顶信标 + 卷帘门警灯
# （BeaconBlue emissive strength 2.2，同 BL1 BeaconOrange 口径）。
import bpy
import numpy as np
import os
import sys
import math
import random

# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT_DIR = '/tmp/bl2-asset'
for i, a in enumerate(argv):
    if a == '--out' and i + 1 < len(argv):
        OUT_DIR = argv[i + 1]
os.makedirs(OUT_DIR, exist_ok=True)

SEED = 0x2207  # 确定性：同脚本同输出（与 BL1 0x1206 区分 → 窗格纹样独立）
rng = random.Random(SEED)
np_rng = np.random.default_rng(SEED)

# 楼体常量（buildings JSON concept-garage 条目单源）
W, D, H = 60.0, 36.0, 18.0
HW, HD = W / 2, D / 2
SHOW_Z0 = 0.5            # 混凝土基座顶 = 展厅地坪
SHOW_Z1 = 5.2            # 展厅带顶（临街主叙事层）
FASCIA_Z1 = 6.2          # 檐带顶（蓝 LED 识别线）
MID_Z1 = 13.4            # 中段条窗带顶（两层 3.6）
GRID = 8                 # windows atlas 格数
BAY = 7.5                # 南立面结构柱距（8 跨）
FLOOR_H = 3.6
MODULE_W = 2.4

# ----------------------------------------------------------------------------
# 程序化贴图（numpy → Blender image → PNG；全部 ≤1024，≤2K 合同）——生成器与 BL1
# 同构（windows/panels 逐像素逻辑一致、随机流独立；utility ③象限 纯橙→纯蓝 换身份色）
# ----------------------------------------------------------------------------

def srgb(r, g, b):
    return np.array([r, g, b], dtype=np.float32) / 255.0


def make_image(name, arr):
    """arr: HxWx3 float 0-1（sRGB 编码值直写字节缓冲）→ 落盘 PNG 供导出器引用"""
    h, w, _ = arr.shape
    img = bpy.data.images.new(name, width=w, height=h, alpha=False)
    rgba = np.ones((h, w, 4), dtype=np.float32)
    rgba[:, :, :3] = np.clip(arr, 0.0, 1.0)
    img.pixels.foreach_set(rgba.ravel())
    img.filepath_raw = os.path.join(OUT_DIR, f'{name}.png')
    img.file_format = 'PNG'
    img.save()
    return img


def gen_windows_atlas(size=1024, grid=GRID):
    """8×8 窗内景 atlas（emissive）：暖白/青/暗三族 + 百叶/家具剪影/顶灯。
    第 0 行（v∈[0,1/8)）固定全暖亮 = 大堂/展厅取格区；其余行按 44/28/18/10 权重随机。"""
    cell = size // grid
    tex = np.zeros((size, size, 3), dtype=np.float32)
    warm_hi = srgb(255, 214, 158)
    warm_lo = srgb(178, 128, 84)
    cool_hi = srgb(148, 224, 214)
    cool_lo = srgb(74, 128, 124)
    dark = srgb(6, 8, 13)
    frame = srgb(9, 11, 15)
    yy = np.linspace(0, 1, cell, dtype=np.float32)[:, None, None]  # 0=下 1=上

    for gy in range(grid):
        for gx in range(grid):
            if gy == 0:
                kind = 'warm'
            else:
                roll = rng.random()
                kind = 'dark' if roll < 0.44 else 'warm' if roll < 0.72 else 'cool' if roll < 0.90 else 'dim'
            block = np.zeros((cell, cell, 3), dtype=np.float32)
            if kind == 'dark':
                block[:] = dark
                xs = np.linspace(0, 1, cell, dtype=np.float32)[None, :, None]
                streak = np.exp(-((xs + yy * 0.6 - rng.uniform(0.4, 1.2)) ** 2) / 0.02)
                block += streak * srgb(24, 32, 44) * rng.uniform(0.3, 0.9)
            else:
                hi, lo = (warm_hi, warm_lo) if kind != 'cool' else (cool_hi, cool_lo)
                level = 1.0 if kind != 'dim' else 0.3
                block[:] = (lo + (hi - lo) * (yy ** 1.6)) * level  # 顶棚更亮
                lamp_h = int(cell * 0.08)
                block[-lamp_h:, :, :] = hi * min(1.0, level * 1.25)
                if gy != 0 and rng.random() < 0.5:  # 百叶（大堂行不挂）
                    cover = rng.uniform(0.2, 0.7)
                    n = int(cell * cover)
                    stripes = (np.arange(n) % 8 < 3)[::-1, None, None]
                    seg = block[cell - n:, :, :]
                    block[cell - n:, :, :] = np.where(stripes, seg * 0.22, seg)
                for _ in range(rng.randint(1, 3)):  # 家具剪影
                    fw = rng.randint(cell // 8, cell // 3)
                    fh = rng.randint(cell // 8, cell // 3)
                    fx = rng.randint(2, cell - fw - 2)
                    block[2:2 + fh, fx:fx + fw, :] *= 0.18
                if rng.random() < 0.4:  # 竖隔墙暗线
                    px = rng.randint(cell // 4, 3 * cell // 4)
                    block[:, px:px + 3, :] *= 0.25
            m = 6  # 窗框
            block[:m, :, :] = frame
            block[-m:, :, :] = frame
            block[:, :m, :] = frame
            block[:, -m:, :] = frame
            tex[gy * cell:(gy + 1) * cell, gx * cell:(gx + 1) * cell, :] = block
    return tex


def gen_panels(size=1024):
    """可平铺金属幕墙板：板缝 + 值抖动 + 竖向雨渍 + 铆钉——12m 平铺（板 ≈1.1×1.6m）"""
    base = srgb(26, 30, 40)
    seam = srgb(10, 12, 18)
    tex = np.tile(base[None, None, :], (size, size, 1)).astype(np.float32)
    px_per_m = size / 12.0
    panel_w = int(1.1 * px_per_m)
    panel_h = int(1.6 * px_per_m)
    for py in range(0, size, panel_h):
        for px in range(0, size, panel_w):
            tex[py:py + panel_h, px:px + panel_w, :] *= 1.0 + rng.uniform(-0.10, 0.10)
    for py in range(0, size, panel_h):
        tex[py:py + 2, :, :] = seam
    for px in range(0, size, panel_w):
        tex[:, px:px + 2, :] = seam
    for _ in range(90):  # 雨渍
        sx = rng.randint(0, size - 4)
        sy = rng.randint(0, size - 1) // panel_h * panel_h
        length = rng.randint(panel_h // 2, panel_h * 2)
        strength = rng.uniform(0.10, 0.30)
        wd = rng.randint(2, 3)
        for k in range(length):
            y = (sy + k) % size
            tex[y, sx:sx + wd, :] *= 1 - strength * (1 - k / length)
    for py in range(0, size, panel_h):  # 铆钉
        for px in range(0, size, panel_w):
            for (ox, oy) in ((4, 4), (panel_w - 6, 4), (4, panel_h - 6), (panel_w - 6, panel_h - 6)):
                x, y = (px + ox) % size, (py + oy) % size
                tex[y:y + 2, x:x + 2, :] = srgb(52, 58, 70)
    tex *= 1.0 + (np_rng.random((size, size, 1), dtype=np.float32) - 0.5) * 0.06
    return tex


def gen_utility(size=256):
    """工具 atlas 四象限：①警示斜纹（橙/黑，通用工业件）②标定棋盘 ③纯蓝板（#3b82f6
    楼宇身份色——备件箱/横幅面）④卷帘门横肋"""
    tex = np.zeros((size, size, 3), dtype=np.float32)
    half = size // 2
    orange = srgb(255, 107, 53)
    blue = srgb(59, 130, 246)
    dark = srgb(18, 20, 26)
    ys, xs = np.mgrid[0:half, 0:half]
    stripes = ((xs + ys) // 24) % 2 == 0
    tex[:half, :half][stripes] = orange
    tex[:half, :half][~stripes] = dark
    checker = ((xs // 32) + (ys // 32)) % 2 == 0
    tex[:half, half:][checker] = srgb(158, 168, 178)
    tex[:half, half:][~checker] = srgb(30, 34, 42)
    tex[half:, :half] = blue * 0.92
    tex[half::24, :half] = blue * 0.55
    rib = ys % 20 < 4
    panel = np.tile(srgb(44, 50, 62)[None, None, :], (half, half, 1))
    panel[rib] = srgb(16, 18, 24)
    panel[:, :6, :] = srgb(12, 14, 18)
    panel[:, -6:, :] = srgb(12, 14, 18)
    tex[half:, half:] = panel
    return tex


print('[bl2] 生成程序化贴图 …')
img_windows = make_image('garage-windows', gen_windows_atlas())
img_panels = make_image('garage-panels', gen_panels())
img_utility = make_image('garage-utility', gen_utility())

# ----------------------------------------------------------------------------
# 材质（名字 = 运行时/审计对账键；与 BL1 同构，AccentOrange/BeaconOrange →
# AccentBlue/BeaconBlue 换 concept-garage 身份色 #3b82f6）
# ----------------------------------------------------------------------------

def hexc(v):
    return ((v >> 16 & 255) / 255.0, (v >> 8 & 255) / 255.0, (v & 255) / 255.0)


def make_material(name, color=(1, 1, 1), metallic=0.0, roughness=0.7,
                  emissive=None, emissive_strength=1.0, base_tex=None, emissive_tex=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emissive is not None:
        bsdf.inputs['Emission Color'].default_value = (*emissive, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emissive_strength
    else:
        bsdf.inputs['Emission Strength'].default_value = 0.0
    if base_tex is not None:
        node = mat.node_tree.nodes.new('ShaderNodeTexImage')
        node.image = base_tex
        mat.node_tree.links.new(node.outputs['Color'], bsdf.inputs['Base Color'])
    if emissive_tex is not None:
        node = mat.node_tree.nodes.new('ShaderNodeTexImage')
        node.image = emissive_tex
        mat.node_tree.links.new(node.outputs['Color'], bsdf.inputs['Emission Color'])
        bsdf.inputs['Emission Strength'].default_value = emissive_strength
    return mat


MATS = {
    'Facade': make_material('Facade', metallic=0.35, roughness=0.62, base_tex=img_panels),
    'FacadeDark': make_material('FacadeDark', color=hexc(0x101018), metallic=0.55, roughness=0.6),
    'Window': make_material('Window', color=hexc(0x0a0c12), metallic=0.1, roughness=0.3,
                            emissive_tex=img_windows, emissive_strength=0.95),
    'MetalDark': make_material('MetalDark', color=hexc(0x232833), metallic=0.7, roughness=0.45),
    'Metal': make_material('Metal', color=hexc(0x5c6472), metallic=0.7, roughness=0.4),
    'AccentBlue': make_material('AccentBlue', color=hexc(0x3b82f6), metallic=0.0, roughness=0.5,
                                emissive=hexc(0x3b82f6), emissive_strength=0.85),
    'BeaconBlue': make_material('BeaconBlue', color=hexc(0x3b82f6), metallic=0.0, roughness=0.4,
                                emissive=hexc(0x3b82f6), emissive_strength=2.2),
    'ScreenCyan': make_material('ScreenCyan', color=hexc(0x0c1514), metallic=0.0, roughness=0.35,
                                emissive=hexc(0x49c5b6), emissive_strength=0.95),
    'InteriorWarm': make_material('InteriorWarm', color=hexc(0x2a2015), metallic=0.0, roughness=0.8,
                                  emissive=hexc(0xffd9a8), emissive_strength=0.9),
    'Concrete': make_material('Concrete', color=hexc(0x3f434e), metallic=0.0, roughness=0.9),
    'Utility': make_material('Utility', metallic=0.1, roughness=0.65, base_tex=img_utility),
    'CarShell': make_material('CarShell', color=hexc(0x39424f), metallic=0.8, roughness=0.32),
    'GlassDark': make_material('GlassDark', color=hexc(0x10141c), metallic=0.9, roughness=0.18),
}
MAT_ORDER = list(MATS.keys())

# ----------------------------------------------------------------------------
# 逐材质几何缓冲（quad/box 直写，UV 全手控，法线可 hint 自动纠向）——BL1 同款
# ----------------------------------------------------------------------------

class Buf:
    def __init__(self):
        self.verts = []
        self.faces = []
        self.uvs = []  # 每 face 一个 [(u,v)×n]

    def quad(self, p0, p1, p2, p3, uv=((0, 0), (1, 0), (1, 1), (0, 1)), normal_hint=None):
        pts, uvq = [p0, p1, p2, p3], list(uv)
        if normal_hint is not None:
            e1 = tuple(p1[i] - p0[i] for i in range(3))
            e2 = tuple(p3[i] - p0[i] for i in range(3))
            n = (e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0])
            if sum(n[i] * normal_hint[i] for i in range(3)) < 0:
                pts.reverse()
                uvq.reverse()
        base = len(self.verts)
        self.verts += pts
        self.faces.append((base, base + 1, base + 2, base + 3))
        self.uvs.append(tuple(uvq))

    def tri(self, p0, p1, p2, uv=((0, 0), (1, 0), (0.5, 1))):
        base = len(self.verts)
        self.verts += [p0, p1, p2]
        self.faces.append((base, base + 1, base + 2))
        self.uvs.append(tuple(uv))


BUFS = {k: Buf() for k in MATS}


def rot_z(p, ang, pivot=(0, 0)):
    if not ang:
        return p
    c, s = math.cos(ang), math.sin(ang)
    x, y = p[0] - pivot[0], p[1] - pivot[1]
    return (pivot[0] + x * c - y * s, pivot[1] + x * s + y * c, p[2] if len(p) > 2 else 0.0)


def box(buf, cx, cy, z0, sx, sy, sz, yaw=0.0, uv_scale=None, uv_rect=None, faces='all'):
    """盒体（可绕 Z yaw，z0 为底）。uv_scale=米→UV 平铺系数；uv_rect=全部面同矩形。
    faces: 'all' | 'side'（省顶底）| 'side_top'（省底）——法线全部外向（已核对绕序）。"""
    hx, hy = sx / 2, sy / 2
    z1 = z0 + sz
    c = [(cx - hx, cy - hy), (cx + hx, cy - hy), (cx + hx, cy + hy), (cx - hx, cy + hy)]
    if yaw:
        c = [rot_z((px, py), yaw, (cx, cy))[:2] for (px, py) in c]
    p = [(x, y, z0) for (x, y) in c] + [(x, y, z1) for (x, y) in c]

    def uvr(w_m, h_m):
        if uv_rect is not None:
            u0, v0, u1, v1 = uv_rect
            return ((u0, v0), (u1, v0), (u1, v1), (u0, v1))
        s = uv_scale or 0.0
        if not s:
            return ((0, 0), (0.01, 0), (0.01, 0.01), (0, 0.01))
        return ((0, 0), (w_m * s, 0), (w_m * s, h_m * s), (0, h_m * s))

    buf.quad(p[0], p[1], p[5], p[4], uvr(sx, sz))  # -Y
    buf.quad(p[1], p[2], p[6], p[5], uvr(sy, sz))  # +X
    buf.quad(p[2], p[3], p[7], p[6], uvr(sx, sz))  # +Y
    buf.quad(p[3], p[0], p[4], p[7], uvr(sy, sz))  # -X
    if faces in ('all', 'side_top'):
        buf.quad(p[4], p[5], p[6], p[7], uvr(sx, sy))  # top
    if faces == 'all':
        buf.quad(p[3], p[2], p[1], p[0], uvr(sx, sy))  # bottom


def cylinder(buf, cx, cy, z0, r_bottom, r_top, height, segments=12, uv_rect=None, cap_top=True,
             cap_bottom=False):
    z1 = z0 + height
    pts_b, pts_t = [], []
    for i in range(segments):
        a = 2 * math.pi * i / segments
        pts_b.append((cx + r_bottom * math.cos(a), cy + r_bottom * math.sin(a), z0))
        pts_t.append((cx + r_top * math.cos(a), cy + r_top * math.sin(a), z1))
    u0, v0, u1, v1 = uv_rect or (0, 0, 0.02, 0.02)
    for i in range(segments):
        j = (i + 1) % segments
        buf.quad(pts_b[i], pts_b[j], pts_t[j], pts_t[i], ((u0, v0), (u1, v0), (u1, v1), (u0, v1)))
    if cap_top:
        for i in range(1, segments - 1):
            buf.tri(pts_t[0], pts_t[i], pts_t[i + 1], ((u0, v0), (u1, v0), (u0, v1)))
    if cap_bottom:  # 法线朝下（悬空件仰视面）
        for i in range(1, segments - 1):
            buf.tri(pts_b[0], pts_b[i + 1], pts_b[i], ((u0, v0), (u1, v0), (u0, v1)))


def window_cell(kind=None):
    """随机窗 cell 的 uv_rect（8% 内缩防渗色）。kind='warm' 取第 0 行（大堂亮格）"""
    gx = rng.randrange(GRID)
    gy = 0 if kind == 'warm' else rng.randrange(1, GRID)
    inset = 0.08 / GRID
    return (gx / GRID + inset, gy / GRID + inset, (gx + 1) / GRID - inset, (gy + 1) / GRID - inset)


UV_HAZARD = (0.02, 0.02, 0.48, 0.48)
UV_CHECKER = (0.52, 0.02, 0.98, 0.48)
UV_BLUE = (0.02, 0.52, 0.48, 0.98)
UV_DOOR = (0.52, 0.52, 0.98, 0.98)
PANEL_UV = 1 / 12.0  # Facade 贴图 12m 平铺


# ----------------------------------------------------------------------------
# 幕墙生成器（BL1 同款：竖梃/层间梁/招牌避让/detailed 两档）
# ----------------------------------------------------------------------------

def _mullion_segments(a, z0, z1, clear_rects):
    """竖梃在避让区处截断：返回 [(zlo,zhi)] 竖向段列表"""
    segs = [(z0, z1)]
    for (a0, a1, zc0, zc1) in clear_rects:
        if not (a0 <= a <= a1):
            continue
        nxt = []
        for (b0, b1) in segs:
            if b1 <= zc0 or b0 >= zc1:
                nxt.append((b0, b1))
                continue
            if b0 < zc0:
                nxt.append((b0, zc0))
            if b1 > zc1:
                nxt.append((zc1, b1))
        segs = nxt
    return [(lo, hi) for (lo, hi) in segs if hi - lo > 0.3]


def curtain_wall(origin, right, out, width, z0, z1, detailed=True,
                 module_w=MODULE_W, floor_h=FLOOR_H, spandrel_h=0.9,
                 window_recess=0.22, lobby=False, clear_rects=()):
    """一面幕墙：origin=(x,y) 面左端起点（沿 right 铺满 width），out=(x,y) 单位外法向。
    每层槽 = [层线, 层线+spandrel_h] 层间梁 + [其上, 下一层线−0.05] 窗。
    detailed=True 逐窗几何（竖梃/内凹窗/随机 atlas cell）；False 逐层长条窗（远面省 tri）。
    clear_rects: [(a0,a1,zc0,zc1)] 招牌避让区——区内竖梃截断、层间梁分段让位，
    并铺一块 0.05 凸暗背板（灯箱浮空 0.30 净距，防远距 z-fight）。"""
    rx, ry = right
    ox, oy = out
    yaw = math.atan2(ry, rx)
    floors = max(1, round((z1 - z0) / floor_h))
    fh = (z1 - z0) / floors
    modules = max(1, int(width / module_w))
    mw = width / modules

    def pt(along, z, depth=0.0):
        return (origin[0] + rx * along + ox * depth, origin[1] + ry * along + oy * depth, z)

    hint = (ox, oy, 0.0)
    mullion, facade, win = BUFS['MetalDark'], BUFS['Facade'], BUFS['Window']

    def spans_outside(s0, s1, band_z0, band_z1):
        """把 along 区间 [s0,s1] 按与 z 带相交的避让区裁掉，返回剩余段列表"""
        segs = [(s0, s1)]
        for (a0, a1, zc0, zc1) in clear_rects:
            if band_z1 <= zc0 or band_z0 >= zc1:
                continue
            nxt = []
            for (b0, b1) in segs:
                if b1 <= a0 or b0 >= a1:
                    nxt.append((b0, b1))
                    continue
                if b0 < a0:
                    nxt.append((b0, a0))
                if b1 > a1:
                    nxt.append((a1, b1))
            segs = nxt
        return segs

    # 层间梁（每层线一根，避让区内分段）+ 顶封边
    for f in range(floors):
        zb = z0 + f * fh
        for (s0, s1) in spans_outside(0, width, zb, zb + spandrel_h):
            if s1 - s0 < 0.3:
                continue
            p = pt((s0 + s1) / 2, zb, 0.06)
            box(facade, p[0], p[1], p[2], s1 - s0, 0.5, spandrel_h, yaw=yaw, uv_scale=PANEL_UV, faces='side_top')
    p = pt(width / 2, z1 - 0.45, 0.06)
    box(facade, p[0], p[1], p[2], width, 0.55, 0.45, yaw=yaw, uv_scale=PANEL_UV, faces='side_top')

    # 招牌背板（FacadeDark 0.05 凸——盖住窗纹提高灯箱可读性，与灯箱 0.30 净距）
    for (a0, a1, zc0, zc1) in clear_rects:
        p = pt((a0 + a1) / 2, zc0, 0.0)
        box(BUFS['FacadeDark'], p[0], p[1], p[2], a1 - a0, 0.1, zc1 - zc0, yaw=yaw, faces='side_top')

    if detailed:
        for m in range(modules + 1):
            a = m * mw
            for (v0, v1) in _mullion_segments(a, z0, z1, clear_rects):
                p = pt(a, v0, 0.10)
                box(mullion, p[0], p[1], p[2], 0.16, 0.42, v1 - v0, yaw=yaw, faces='side')
        for f in range(floors):
            zb = z0 + f * fh + spandrel_h
            zt = z0 + (f + 1) * fh - 0.05
            if zt - zb < 0.5:
                continue
            for m in range(modules):
                a0, a1 = m * mw + 0.12, (m + 1) * mw - 0.12
                u0, v0, u1, v1 = window_cell('warm' if (lobby and f == 0) else None)
                win.quad(pt(a0, zb, -window_recess), pt(a1, zb, -window_recess),
                         pt(a1, zt, -window_recess), pt(a0, zt, -window_recess),
                         ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=hint)
    else:
        for m in range(5):
            p = pt(m * width / 4, z0, 0.08)
            box(mullion, p[0], p[1], p[2], 0.18, 0.36, z1 - z0, yaw=yaw, faces='side')
        for f in range(floors):
            zb = z0 + f * fh + spandrel_h
            zt = z0 + (f + 1) * fh - 0.05
            row = rng.randrange(1, GRID)
            cells = max(2, round(width / mw))
            u0 = rng.randrange(GRID) / GRID
            v0, v1 = row / GRID + 0.01, (row + 1) / GRID - 0.01
            win.quad(pt(0, zb, -0.12), pt(width, zb, -0.12), pt(width, zt, -0.12), pt(0, zt, -0.12),
                     ((u0, v0), (u0 + cells / GRID, v0), (u0 + cells / GRID, v1), (u0, v1)), normal_hint=hint)


def wall_box(cx, cy, z0, sx, sy, sz):
    box(BUFS['Facade'], cx, cy, z0, sx, sy, sz, uv_scale=PANEL_UV, faces='side_top')


def car_shell(cx, cy, z0, yaw=0.0, scale=1.0):
    """低模概念车壳：楔形车体 + 青罩座舱 + 尾灯蓝条 + 盒式轮（~120 tri）——BL1 同款
    （尾灯换 AccentBlue：车库展车的品牌件走楼宇身份色）"""
    s = scale
    bl, bw = 4.3 * s, 1.85 * s
    body = BUFS['CarShell']

    def T(p):
        return rot_z((cx + p[0], cy + p[1], z0 + p[2]), yaw, (cx, cy))

    pts = [
        (bl * 0.5, 0, 0.16 * s), (bl * 0.42, bw * 0.5, 0.16 * s), (-bl * 0.46, bw * 0.5, 0.16 * s),
        (-bl * 0.5, 0, 0.16 * s), (-bl * 0.46, -bw * 0.5, 0.16 * s), (bl * 0.42, -bw * 0.5, 0.16 * s),
        (bl * 0.5, 0, 0.55 * s), (bl * 0.40, bw * 0.48, 0.62 * s), (-bl * 0.48, bw * 0.48, 0.72 * s),
        (-bl * 0.5, 0, 0.72 * s), (-bl * 0.48, -bw * 0.48, 0.72 * s), (bl * 0.40, -bw * 0.48, 0.62 * s),
    ]
    P = [T(p) for p in pts]
    for q in ((0, 1, 7, 6), (1, 2, 8, 7), (2, 3, 9, 8), (3, 4, 10, 9), (4, 5, 11, 10), (5, 0, 6, 11),
              (6, 7, 8, 9), (9, 10, 11, 6)):
        body.quad(P[q[0]], P[q[1]], P[q[2]], P[q[3]])
    cab = BUFS['ScreenCyan']
    c0 = [T(p) for p in [(bl * 0.22, bw * 0.36, 0.62 * s), (-bl * 0.30, bw * 0.36, 0.72 * s),
                         (-bl * 0.30, -bw * 0.36, 0.72 * s), (bl * 0.22, -bw * 0.36, 0.62 * s)]]
    c1 = [T(p) for p in [(bl * 0.05, bw * 0.26, 1.05 * s), (-bl * 0.24, bw * 0.26, 1.08 * s),
                         (-bl * 0.24, -bw * 0.26, 1.08 * s), (bl * 0.05, -bw * 0.26, 1.05 * s)]]
    cab.quad(c0[0], c0[1], c1[1], c1[0])
    cab.quad(c0[2], c0[3], c1[3], c1[2])
    cab.quad(c0[3], c0[0], c1[0], c1[3])
    cab.quad(c0[1], c0[2], c1[2], c1[1])
    cab.quad(c1[0], c1[1], c1[2], c1[3])
    for (wx, wy) in ((bl * 0.30, bw * 0.5), (bl * 0.30, -bw * 0.5), (-bl * 0.32, bw * 0.5), (-bl * 0.32, -bw * 0.5)):
        c = T((wx, wy, 0))
        box(BUFS['MetalDark'], c[0], c[1], z0 + 0.02, 0.62 * s, 0.24 * s, 0.58 * s, yaw=yaw)
    tail = [T(p) for p in [(-bl * 0.5, -bw * 0.34, 0.60 * s), (-bl * 0.5, bw * 0.34, 0.60 * s),
                           (-bl * 0.5, bw * 0.34, 0.68 * s), (-bl * 0.5, -bw * 0.34, 0.68 * s)]]
    hint = rot_z((-1, 0), yaw)
    BUFS['AccentBlue'].quad(tail[0], tail[1], tail[2], tail[3], normal_hint=(hint[0], hint[1], 0))


# ----------------------------------------------------------------------------
# ① 基座 + 南立面展厅带（0.5 – 5.2）：8 跨结构柱 = 角墩 | 3 展厅 | 门厅 | 2 卷帘门 |
#   服务窗 | 角墩 —— POI 深链帧可见带（世界 x 116-155 → 本地 bx −24..15）密度最高
# ----------------------------------------------------------------------------
print('[bl2] 建模：基座与展厅带 …')
# 混凝土基座外挑 0.9（顶 0.5 = 展厅地坪；下沉 0.05 咬合地面）
box(BUFS['Concrete'], 0, 0, -0.05, W + 1.8, D + 1.8, 0.55, uv_scale=PANEL_UV, faces='side_top')

# 南立面结构柱位（bay 边界）：±3.75/±11.25/±18.75/±26.25 + 两角
COLS = [-HW, -26.25, -18.75, -11.25, -3.75, 3.75, 11.25, 18.75, 26.25, HW]
for cx in COLS:
    off = 0.35 if abs(cx) >= HW else 0.0  # 角柱内收防溢出包络
    box(BUFS['MetalDark'], cx - math.copysign(off, cx), -HD + 0.35, SHOW_Z0, 0.55, 0.7, FASCIA_Z1 - SHOW_Z0,
        faces='side_top')

# 北墙/东墙（背街整面闭合）+ 西墙实体（幕墙贴其上）
wall_box(0, HD - 0.4, SHOW_Z0, W, 0.8, SHOW_Z1 - SHOW_Z0)
wall_box(HW - 0.4, 0, SHOW_Z0, 0.8, D, SHOW_Z1 - SHOW_Z0)
wall_box(-HW + 0.4, 0, SHOW_Z0, 0.8, D, SHOW_Z1 - SHOW_Z0)
# 西立面地面带（面向 autodrive-lab 方向 = 同框驾驶帧可读面）：服务门 + 三樘凸窗 + 设备箱
BUFS['Utility'].quad((-HW - 0.06, 3.2, SHOW_Z0), (-HW - 0.06, 6.4, SHOW_Z0),
                     (-HW - 0.06, 6.4, SHOW_Z0 + 3.1), (-HW - 0.06, 3.2, SHOW_Z0 + 3.1),
                     ((UV_DOOR[0], UV_DOOR[1]), (UV_DOOR[2], UV_DOOR[1]),
                      (UV_DOOR[2], UV_DOOR[3]), (UV_DOOR[0], UV_DOOR[3])), normal_hint=(-1, 0, 0))
for wy0 in (-12.0, -6.5, 8.6):
    u0, v0, u1, v1 = window_cell()
    BUFS['Window'].quad((-HW - 0.06, wy0, SHOW_Z0 + 0.9), (-HW - 0.06, wy0 + 3.6, SHOW_Z0 + 0.9),
                        (-HW - 0.06, wy0 + 3.6, SHOW_Z1 - 0.8), (-HW - 0.06, wy0, SHOW_Z1 - 0.8),
                        ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(-1, 0, 0))
box(BUFS['Metal'], -HW - 0.5, 13.2, 0.5, 0.9, 2.6, 1.6, faces='side_top')
box(BUFS['MetalDark'], -HW - 0.5, 13.2, 2.1, 0.8, 2.2, 0.2, faces='side_top')

# 角墩（南立面两端实体 + 蓝 LED 竖带识别件）
for sx in (-1, 1):
    wall_box(sx * (HW - 1.875), -HD + 0.4, SHOW_Z0, 3.75, 0.8, SHOW_Z1 - SHOW_Z0)
    box(BUFS['AccentBlue'], sx * (HW - 1.875), -HD - 0.12, SHOW_Z0 + 0.5, 0.24, 0.1,
        FASCIA_Z1 - SHOW_Z0 - 1.2, faces='side')

VIT_DEPTH = 3.0
VIT_TOP = SHOW_Z1 - 0.35
vit_y = -HD + VIT_DEPTH

# —— 3 间展厅（西三跨，开放式暖光 vitrine：顶棚/背墙/侧壁/展台/概念车/转台环）——
VITRINES = [(-26.25, -18.75, math.radians(18)), (-18.75, -11.25, math.radians(-24)),
            (-11.25, -3.75, math.radians(32))]
for k, (x0, x1, cyaw) in enumerate(VITRINES):
    xin0, xin1 = x0 + 0.35, x1 - 0.35
    # 暖光顶棚 + 背墙（大堂亮格窗 = 展厅内景，配 InteriorWarm 底色墙）
    BUFS['InteriorWarm'].quad((xin0, -HD, VIT_TOP), (xin1, -HD, VIT_TOP),
                              (xin1, vit_y, VIT_TOP), (xin0, vit_y, VIT_TOP), normal_hint=(0, 0, -1))
    BUFS['InteriorWarm'].quad((xin0, vit_y, SHOW_Z0), (xin1, vit_y, SHOW_Z0),
                              (xin1, vit_y, VIT_TOP), (xin0, vit_y, VIT_TOP), normal_hint=(0, -1, 0))
    u0, v0, u1, v1 = window_cell('warm')
    BUFS['Window'].quad((xin0 + 0.8, vit_y - 0.05, SHOW_Z0 + 1.4), (xin1 - 0.8, vit_y - 0.05, SHOW_Z0 + 1.4),
                        (xin1 - 0.8, vit_y - 0.05, VIT_TOP - 0.5), (xin0 + 0.8, vit_y - 0.05, VIT_TOP - 0.5),
                        ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(0, -1, 0))
    for sx_ in (xin0, xin1):  # 侧壁
        box(BUFS['FacadeDark'], sx_, (-HD + vit_y) / 2, SHOW_Z0, 0.25, VIT_DEPTH, VIT_TOP - SHOW_Z0,
            faces='side_top')
    # 展台 + 概念车 + 转台屏环（地灯抬 0.04 防 z-fight）
    cxm = (x0 + x1) / 2
    box(BUFS['Concrete'], cxm, -HD + 1.55, SHOW_Z0, 5.0, 2.4, 0.32, uv_scale=PANEL_UV, faces='side_top')
    box(BUFS['ScreenCyan'], cxm, -HD + 1.55, SHOW_Z0 + 0.32, 4.4, 1.9, 0.04, faces='side_top')
    car_shell(cxm, -HD + 1.55, SHOW_Z0 + 0.36, yaw=cyaw, scale=0.92 if k == 1 else 1.0)
    # 展厅眉头蓝 LED 细线（识别件，emissive 0.85 ≤1）
    box(BUFS['AccentBlue'], cxm, -HD - 0.10, VIT_TOP + 0.08, x1 - x0 - 1.0, 0.08, 0.1, faces='side')

# —— 门厅（中跨 −3.75..3.75，内凹 2.4：暖顶 + 暗玻璃门 + 双暖窗 + 导入毯）——
ENT_DEPTH = 2.4
ent_y = -HD + ENT_DEPTH
BUFS['InteriorWarm'].quad((-3.4, -HD, VIT_TOP), (3.4, -HD, VIT_TOP),
                          (3.4, ent_y, VIT_TOP), (-3.4, ent_y, VIT_TOP), normal_hint=(0, 0, -1))
BUFS['GlassDark'].quad((-3.4, ent_y, SHOW_Z0), (3.4, ent_y, SHOW_Z0),
                       (3.4, ent_y, VIT_TOP), (-3.4, ent_y, VIT_TOP), normal_hint=(0, -1, 0))
for wx in (-3.0, 0.6):
    u0, v0, u1, v1 = window_cell('warm')
    BUFS['Window'].quad((wx, ent_y - 0.05, SHOW_Z0 + 0.2), (wx + 2.4, ent_y - 0.05, SHOW_Z0 + 0.2),
                        (wx + 2.4, ent_y - 0.05, VIT_TOP - 0.4), (wx, ent_y - 0.05, VIT_TOP - 0.4),
                        ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(0, -1, 0))
for sx_ in (-3.75, 3.75):
    box(BUFS['FacadeDark'], sx_, (-HD + ent_y) / 2, SHOW_Z0, 0.3, ENT_DEPTH, VIT_TOP - SHOW_Z0, faces='side_top')
box(BUFS['InteriorWarm'], 0, -HD + 0.9, SHOW_Z0 + 0.04, 6.4, 1.8, 0.03, faces='side_top')
# 门厅眉头蓝 LED 双细线（入口识别强化）
for dz in (0.08, 0.26):
    box(BUFS['AccentBlue'], 0, -HD - 0.10, VIT_TOP + dz, 6.6, 0.08, 0.1, faces='side')
# 门厅悬挑雨棚（南挑 2.2：暗板 + 底面暖光 + 蓝 LED 前缘——POI 帧中央「前门」锚点）
CAN_Y = -HD - 1.1  # 雨棚中心（挑出 2.2 的一半）
box(BUFS['FacadeDark'], 0, CAN_Y, VIT_TOP - 0.32, 9.0, 2.2, 0.32, faces='side_top')
BUFS['InteriorWarm'].quad((-4.3, -HD - 2.15, VIT_TOP - 0.34), (4.3, -HD - 2.15, VIT_TOP - 0.34),
                          (4.3, -HD - 0.1, VIT_TOP - 0.34), (-4.3, -HD - 0.1, VIT_TOP - 0.34),
                          normal_hint=(0, 0, -1))
box(BUFS['AccentBlue'], 0, -HD - 2.22, VIT_TOP - 0.22, 8.6, 0.1, 0.12, faces='side')
# （无柱悬挑：立柱会落入 parkingBay r8 泊车圈——布局纪律让空，底部横撑杆回锚立面）
for px_ in (-3.6, 3.6):
    box(BUFS['MetalDark'], px_, -HD - 1.05, VIT_TOP - 0.05, 0.14, 2.2, 0.14, faces='side')

# —— 双卷帘门（跨 3.75..11.25 / 11.25..18.75：Utility ④肋纹内凹 0.35 + 警示柱 + 蓝警灯）——
for (d0, d1) in ((3.75, 11.25), (11.25, 18.75)):
    BUFS['Utility'].quad((d0 + 0.55, -HD + 0.35, SHOW_Z0), (d1 - 0.55, -HD + 0.35, SHOW_Z0),
                         (d1 - 0.55, -HD + 0.35, VIT_TOP), (d0 + 0.55, -HD + 0.35, VIT_TOP),
                         ((UV_DOOR[0], UV_DOOR[1]), (UV_DOOR[2], UV_DOOR[1]),
                          (UV_DOOR[2], UV_DOOR[3]), (UV_DOOR[0], UV_DOOR[3])), normal_hint=(0, -1, 0))
    for sx_ in (d0 + 0.28, d1 - 0.28):
        box(BUFS['Utility'], sx_, -HD + 0.25, SHOW_Z0, 0.4, 0.4, VIT_TOP - SHOW_Z0, uv_rect=UV_HAZARD,
            faces='side_top')
    box(BUFS['BeaconBlue'], (d0 + d1) / 2, -HD - 0.14, VIT_TOP + 0.14, 0.3, 0.14, 0.3, faces='all')
    # 门内侧遮视浅盒（防视线穿门缝）
    box(BUFS['FacadeDark'], (d0 + d1) / 2, -HD + 0.9, SHOW_Z0, d1 - d0 - 0.9, 0.2, VIT_TOP - SHOW_Z0, faces='side')

# —— 服务窗跨（18.75..26.25：贴墙暖窗 + 值班室）——
wall_box((18.75 + 26.25) / 2, -HD + 0.4, SHOW_Z0, 7.5, 0.8, SHOW_Z1 - SHOW_Z0)
u0, v0, u1, v1 = window_cell('warm')
BUFS['Window'].quad((19.6, -HD - 0.06, SHOW_Z0 + 0.5), (25.4, -HD - 0.06, SHOW_Z0 + 0.5),
                    (25.4, -HD - 0.06, VIT_TOP - 0.6), (19.6, -HD - 0.06, VIT_TOP - 0.6),
                    ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(0, -1, 0))

# 展厅带顶封（兼 vitrine 上沿盖板）
box(BUFS['FacadeDark'], 0, -HD + 0.45, VIT_TOP, W - 0.6, 0.95, SHOW_Z1 - VIT_TOP, faces='side_top')

# ----------------------------------------------------------------------------
# ② 檐带（5.2 – 6.2）：FacadeDark 全周 + 南/西蓝 LED 识别线（身份色檐口）
# ----------------------------------------------------------------------------
print('[bl2] 建模：檐带 …')
box(BUFS['FacadeDark'], 0, 0, SHOW_Z1, W + 0.6, D + 0.6, FASCIA_Z1 - SHOW_Z1, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['AccentBlue'], 0, -HD - 0.38, SHOW_Z1 + 0.42, W - 2.0, 0.08, 0.14, faces='side')
box(BUFS['AccentBlue'], -HW - 0.38, 0, SHOW_Z1 + 0.42, 0.08, D - 2.0, 0.14, faces='side')

# ----------------------------------------------------------------------------
# ③ 中段条窗带（6.2 – 13.4）：南/西逐窗幕墙（南带招牌避让区）+ 北/东条窗 + 遮视芯
# ----------------------------------------------------------------------------
print('[bl2] 建模：中段条窗带 …')
# 招牌避让区（BuildingSigns 南立面灯箱：挂高 min(25,max(9,0.34h))=9 ± 半高 1.1 + 余量；
# 面板中心对齐楼心 → 南墙 along = HW）
SIGN_Z = (7.0, 11.0)
curtain_wall((-HW, -HD), (1, 0), (0, -1), W, FASCIA_Z1, MID_Z1, detailed=True,
             clear_rects=[(HW - 10.2, HW + 10.2, SIGN_Z[0], SIGN_Z[1])])
curtain_wall((-HW, -HD), (0, 1), (-1, 0), D, FASCIA_Z1, MID_Z1, detailed=True)
curtain_wall((HW, HD), (0, -1), (1, 0), D, FASCIA_Z1, MID_Z1, detailed=False)
curtain_wall((HW, HD), (-1, 0), (0, 1), W, FASCIA_Z1, MID_Z1, detailed=False)
# 遮视芯（防窗缝透视）
box(BUFS['FacadeDark'], 0, 0, FASCIA_Z1, W - 1.2, D - 1.2, MID_Z1 - FASCIA_Z1, faces='side')
# 四角包角柱
for (cx, cy) in ((HW, HD), (-HW, HD), (HW, -HD), (-HW, -HD)):
    box(BUFS['MetalDark'], cx - math.copysign(0.2, cx), cy - math.copysign(0.2, cy), FASCIA_Z1,
        0.72, 0.72, MID_Z1 - FASCIA_Z1, faces='side')

# ----------------------------------------------------------------------------
# ④ 设备顶带（13.4 – 18）：FacadeDark + 南/西百叶 + 竖向鳍片 + 檐口蓝线
# ----------------------------------------------------------------------------
print('[bl2] 建模：设备顶带 …')
box(BUFS['FacadeDark'], 0, 0, MID_Z1, W, D, H - MID_Z1, uv_scale=PANEL_UV, faces='side')
for i in range(8):
    box(BUFS['MetalDark'], 0, -HD - 0.06, MID_Z1 + 0.5 + i * 0.42, W - 4, 0.1, 0.12, faces='side')
    box(BUFS['MetalDark'], -HW - 0.06, 0, MID_Z1 + 0.5 + i * 0.42, 0.1, D - 4, 0.12, faces='side')
for cx in COLS[1:-1]:  # 南立面竖向鳍片（柱位对缝，打散 60m 长顶带）
    box(BUFS['Metal'], cx, -HD - 0.28, MID_Z1, 0.3, 0.5, H - MID_Z1 - 0.3, faces='side_top')
box(BUFS['AccentBlue'], 0, -HD - 0.16, H - 0.45, W - 1.6, 0.07, 0.1, faces='side')
box(BUFS['AccentBlue'], -HW - 0.16, 0, H - 0.45, 0.07, D - 1.6, 0.1, faces='side')

# ----------------------------------------------------------------------------
# ⑤ 屋顶（18）：女儿墙 + 设备组（避让全息板走廊 |bx|<12 ∧ |by|<1.8）
# ----------------------------------------------------------------------------
print('[bl2] 建模：屋顶 …')
box(BUFS['FacadeDark'], 0, 0, H - 0.35, W + 0.3, D + 0.3, 0.5, uv_scale=PANEL_UV, faces='side_top')
for (cx, cy, sx, sy) in ((0, HD - 0.12, W, 0.24), (0, -HD + 0.12, W, 0.24),
                         (HW - 0.12, 0, 0.24, D), (-HW + 0.12, 0, 0.24, D)):
    box(BUFS['FacadeDark'], cx, cy, H + 0.15, sx, sy, 0.75, faces='side_top')
# HVAC 机组（东区，全息板走廊外）
box(BUFS['Facade'], 19, 7.5, H + 0.15, 8.5, 5.0, 2.1, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['MetalDark'], 19, 7.5, H + 2.25, 7.7, 4.2, 0.28, faces='side_top')
box(BUFS['Facade'], 20, -8.5, H + 0.15, 6.5, 4.2, 1.7, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['MetalDark'], 20, -8.5, H + 1.85, 5.7, 3.4, 0.24, faces='side_top')
# 排风筒（中区北带——西区让位天际线段；均在走廊 |by|<1.8 之外，且顶 19.7 低于
# 「街面视线经女儿墙 18.9 的遮蔽线」→ 南向街面帧不进全息板背景，不添屋顶噪音）
for (vx, vy) in ((4.0, 12.5), (9.0, 14.0), (-6.0, 13.0)):
    cylinder(BUFS['Metal'], vx, vy, H + 0.15, 0.85, 0.85, 1.05, segments=12)
    cylinder(BUFS['MetalDark'], vx, vy, H + 1.2, 1.0, 0.55, 0.38, segments=12)
# 管线桥架（沿 by=-13 走廊，避开全息板；西段没入肩块体内 = 自然收头）
for i in range(3):
    box(BUFS['Metal'], 2, -13 + i * 0.55, H + 0.2 + (i % 2) * 0.18, W * 0.62, 0.26, 0.26, faces='side_top')

# ----------------------------------------------------------------------------
# ⑤′ [CC-BL2-R2] 西端天际线段——体量再分布（BL2-R2 最小补洞，BR X1「体量再分布」）
#   两轮 NO-GO 机理（NDC 探针实测，corridor_neon-boulevard-east 机位）：后场螺旋塔
#   (bx-20,by6) 的 14-26m 塔身被自家南女儿墙（遮挡线 22.3-24.3m）与西肩块南上缘
#   （遮挡线 ~26.2m）全遮，信标顶 ndc.y=1.04 被帧顶裁切——整帧只剩「顶缘冠环弧」。
#   帧内真可读区 = 南立面平面（z=-26）：bx∈[-30,+18] 自地面至 ~24.4m 无遮挡直读。
#   → 螺旋塔迁为「南立面西段鼓塔」：立体停车螺旋坡道鼓楼自展厅带檐口起身，
#   南凸 3m 出幕墙成弧形湾——塔身/螺旋带/冠环/信标全部落进可读区；
#   天际线成「主女儿墙 18.9 → 肩块压顶 22.0 → 鼓塔冠环 22.9 + 信标 24.65」三拍阶差。
#   铁律核对：
#   · 全息板走廊 bx∈[-10.5,10.5]×|by|<1.8×z∈[19.1,21.7]：肩块东缘 -12.2（压顶
#     -12.1）、鼓塔东缘 -15——全部 |bx|≥12.1 让空，板后天空背景不受遮挡；
#   · 招牌避让背板区 bx∈[-10.2,10.2] z∈[7.0,11.0]：鼓塔东缘 -15 让空；
#   · 前场道具（HeroBlenderMesh 碰撞体在册，坐标零改动）：展台 (-19,-24) 距鼓心
#     9.66m、kiosk (-12.5,-20.5) 12.3m 均在 r7.5 外；旗杆 (-26.5/-24,-21) 杆顶 4.6m
#     低于鼓底 6.26m ≥1.6m（街面视角旗幅读在鼓面之前，正常街景层叠）；
#   · 泊车圈 bx∈[-8,8]×by∈[-34,-18] 与卷帘门出入带 bx∈[3.75,18.75] 均让空；
#   · 物理合同不变：footprint cuboid h18 照旧，鼓塔为悬空视觉件（底 6.26m 高于
#     雨棚 4.8m 悬挑先例，机器人/车辆不可达；南凸段无立柱 = 雨棚同款无柱悬挑）；
#   · 辉光锚数量不变：信标随塔迁至鼓顶桅杆（仍是「屋顶信标 + 卷帘门警灯」两处）；
#     螺旋带 AccentBlue emissive 0.85 ≤1 阈下，不占辉光名额。
# ----------------------------------------------------------------------------
print('[bl2] 建模：西端天际线段（R2 体量再分布）…')
SH_X, SH_W = -21.1, 17.8   # 西肩块 bx∈[-30,-12.2]（南北各退 1m = 阶台读法）——R2 不动
SH_Z1 = 21.6
box(BUFS['Facade'], SH_X, 0, H - 0.1, SH_W, D - 2.0, SH_Z1 - H + 0.1, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['FacadeDark'], SH_X, 0, SH_Z1, SH_W + 0.2, D - 1.6, 0.4, faces='side_top')  # 压顶（东缘 -12.1）
box(BUFS['AccentBlue'], SH_X, -(HD - 1.0) - 0.26, SH_Z1 - 0.42, SH_W - 1.2, 0.07, 0.1, faces='side')
box(BUFS['AccentBlue'], -HW - 0.26, 0, SH_Z1 - 0.42, 0.07, D - 3.6, 0.1, faces='side')

# —— 南立面西段鼓塔（R2 迁位）：bx∈[-30,-15]、by∈[-21,-6]，南凸 3m 出幕墙 ——
DR_X, DR_Y, DR_R = -22.5, -13.5, 7.5
DR_Z0, DR_Z1 = 6.26, 22.4          # 鼓底檐口上 6cm 反光缝防共面；塔身顶 22.4
# 塔身（Facade 金属板逐段平铺 = 竖板肋节奏；仰视面封底）
_seg_arc = 2 * math.pi * DR_R / 24
cylinder(BUFS['Facade'], DR_X, DR_Y, DR_Z0, DR_R, DR_R, DR_Z1 - DR_Z0, segments=24,
         uv_rect=(0, 0, _seg_arc * PANEL_UV, (DR_Z1 - DR_Z0) * PANEL_UV), cap_bottom=True)
cylinder(BUFS['MetalDark'], DR_X, DR_Y, DR_Z0 + 0.04, DR_R + 0.18, DR_R + 0.18, 0.55,
         segments=24, cap_top=False, cap_bottom=True)                                   # 基座环
cylinder(BUFS['FacadeDark'], DR_X, DR_Y, DR_Z1, DR_R + 0.25, DR_R + 0.25, 0.5,
         segments=24, cap_bottom=True)                                                  # 冠环（顶 22.9）


def helix_ribbon(buf, cx, cy, r, z0, z1, turns, band_h, seg_per_turn=20, a0=0.0):
    """外向面螺旋光带（quad 带绕 Z 上升；法线径向外——街面读「螺旋坡道」剪影）"""
    total = int(turns * seg_per_turn)
    for i in range(total):
        t0, t1 = i / total, (i + 1) / total
        aa0, aa1 = a0 + t0 * turns * 2 * math.pi, a0 + t1 * turns * 2 * math.pi
        za0, za1 = z0 + (z1 - z0) * t0, z0 + (z1 - z0) * t1
        buf.quad((cx + r * math.cos(aa0), cy + r * math.sin(aa0), za0),
                 (cx + r * math.cos(aa1), cy + r * math.sin(aa1), za1),
                 (cx + r * math.cos(aa1), cy + r * math.sin(aa1), za1 + band_h),
                 (cx + r * math.cos(aa0), cy + r * math.sin(aa0), za0 + band_h))


# 螺旋带 2.5 圈自南（a0=-90°）起坡：南弧三道穿幕墙湾（z≈7.4/12.8/18.2）+ 女儿墙
# 18.9 以上整圈裸露收顶——「螺旋」在整帧内既有重复弧节奏又有完整缠绕证明
helix_ribbon(BUFS['AccentBlue'], DR_X, DR_Y, DR_R + 0.07, 7.4, 20.9, 2.5, 0.6,
             a0=math.radians(-90))

cylinder(BUFS['Metal'], DR_X, DR_Y, 22.9, 0.15, 0.09, 1.2, segments=10)   # 桅杆 → 24.1
box(BUFS['BeaconBlue'], DR_X, DR_Y, 24.1, 0.55, 0.55, 0.55, faces='all')  # 信标（顶 24.65）

# —— 东端书挡块（20.8/压顶 21.1：东段女儿墙上抬一档，天际线「塔-低-挡」三拍）——
BK_X, BK_W = 26.75, 5.5   # bx∈[24,29.5]：HVAC（x≤23.25）与东女儿墙（x≥29.76）之间
box(BUFS['Facade'], BK_X, 0, H - 0.1, BK_W, D - 4.0, 2.9, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['MetalDark'], BK_X, 0, H + 2.8, BK_W + 0.3, D - 3.6, 0.3, faces='side_top')
box(BUFS['AccentBlue'], BK_X, -(HD - 2.0) - 0.2, H + 2.45, BK_W - 0.8, 0.07, 0.1, faces='side')

# ----------------------------------------------------------------------------
# ⑥ 前场道具（南侧 plaza；避让 parkingBay bx∈[-8,8]×by∈[-34,-18]、灯杆 (10,-30.5)
#   ≥2m、卷帘门出入通道 bx∈[3.75,18.75] 正面带）
# ----------------------------------------------------------------------------
print('[bl2] 建模：前场道具 …')

# —— 西翼：室外展车台 + 配置器 kiosk totem + 双横幅旗杆（POI 帧左下可见）——
PL_X, PL_Y, PL_YAW = -19.0, -24.0, math.radians(-155)
box(BUFS['Concrete'], PL_X, PL_Y, 0.0, 5.4, 2.8, 0.38, yaw=PL_YAW, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['ScreenCyan'], PL_X, PL_Y, 0.38, 4.7, 2.2, 0.05, yaw=PL_YAW, faces='side_top')
car_shell(PL_X, PL_Y, 0.43, yaw=PL_YAW)
# 配置器 kiosk（双面青屏 + 蓝描边立柱——「3D 汽车配置器」叙事件）
KIO_X, KIO_Y = -12.5, -20.5
box(BUFS['Concrete'], KIO_X, KIO_Y, 0.0, 1.3, 1.3, 0.14, faces='side_top')
box(BUFS['FacadeDark'], KIO_X, KIO_Y, 0.14, 0.46, 0.3, 2.9, faces='side_top')
for s in (-1, 1):
    BUFS['ScreenCyan'].quad((KIO_X - 0.5, KIO_Y + s * 0.17, 1.0), (KIO_X + 0.5, KIO_Y + s * 0.17, 1.0),
                            (KIO_X + 0.5, KIO_Y + s * 0.17, 2.6), (KIO_X - 0.5, KIO_Y + s * 0.17, 2.6),
                            normal_hint=(0, s, 0))
    box(BUFS['AccentBlue'], KIO_X + s * 0.56, KIO_Y, 0.9, 0.08, 0.2, 1.8, faces='side')
box(BUFS['MetalDark'], KIO_X, KIO_Y, 3.04, 0.6, 0.4, 0.1, faces='side_top')
# 双横幅旗杆（蓝身份幅面 = Utility ③纯蓝象限）
for fx in (-26.5, -24.0):
    box(BUFS['Metal'], fx, -21.0, 0.0, 0.16, 0.16, 4.6, faces='side')
    BUFS['Utility'].quad((fx + 0.1, -21.0, 2.2), (fx + 1.0, -21.0, 2.2),
                         (fx + 1.0, -21.0, 4.4), (fx + 0.1, -21.0, 4.4),
                         ((UV_BLUE[0], UV_BLUE[1]), (UV_BLUE[2], UV_BLUE[1]),
                          (UV_BLUE[2], UV_BLUE[3]), (UV_BLUE[0], UV_BLUE[3])), normal_hint=(0, -1, 0))

# —— 东翼：备件箱堆 + 轮胎堆 + 服务推车（驾驶推进/同框帧内的沿街杂件层）——
for (cx_, cy_, sz_, yaw_) in ((21.0, -21.5, 1.0, 0.25), (22.1, -20.6, 0.75, -0.2), (20.4, -20.4, 0.62, 0.5)):
    box(BUFS['Utility'], cx_, cy_, 0.0, sz_, sz_ * 0.82, sz_ * 0.72, yaw=yaw_, uv_rect=UV_BLUE, faces='side_top')
for i in range(3):  # 轮胎堆（叠三环）
    cylinder(BUFS['MetalDark'], 24.4, -20.3, i * 0.42, 0.62, 0.62, 0.4, segments=12, cap_top=(i == 2))
box(BUFS['Metal'], 26.3, -22.0, 0.0, 1.5, 0.8, 0.85, yaw=math.radians(12), faces='side_top')
box(BUFS['Utility'], 26.3, -22.0, 0.85, 1.3, 0.66, 0.3, yaw=math.radians(12), uv_rect=UV_HAZARD, faces='side_top')

# —— 地面导视：泊车圈 → 门厅 双青光条 + 卷帘门前停车横线（抬 0.05 防 z-fight）——
for gx in (-4.6, 4.6):
    box(BUFS['ScreenCyan'], gx, -19.6, 0.05, 0.14, 2.6, 0.03, faces='side_top')
box(BUFS['ScreenCyan'], 11.25, -19.2, 0.05, 13.0, 0.14, 0.03, faces='side_top')

# ----------------------------------------------------------------------------
# 落地：逐材质建 mesh（一物一材质 → ≤13 draw call），全挂 Root
# ----------------------------------------------------------------------------
print('[bl2] 组装 mesh …')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

root = bpy.data.objects.new('ConceptGarageRoot', None)
bpy.context.collection.objects.link(root)

total_tris = 0
for name in MAT_ORDER:
    buf = BUFS[name]
    if not buf.faces:
        continue
    mesh = bpy.data.meshes.new(f'CG_{name}')
    mesh.from_pydata(buf.verts, [], buf.faces)
    mesh.validate()
    uv_layer = mesh.uv_layers.new(name='UVMap')
    li = 0
    for fi, face in enumerate(buf.faces):
        for corner in range(len(face)):
            uv_layer.data[li].uv = buf.uvs[fi][corner]
            li += 1
    mesh.materials.append(MATS[name])
    obj = bpy.data.objects.new(f'CG_{name}', mesh)
    obj.parent = root
    bpy.context.collection.objects.link(obj)
    tris = sum(len(f) - 2 for f in buf.faces)
    total_tris += tris
    print(f'[bl2]   {name:14s} faces={len(buf.faces):5d} tris={tris:6d}')

print(f'[bl2] 总三角形 ≈ {total_tris}（合同 ≤100k）')
assert total_tris <= 100_000, 'tri 超出 ≤100k 合同'

# ----------------------------------------------------------------------------
# 导出 GLB（未压缩原件；Draco/KTX2 压缩由 gltf-transform 管线完成）
# ----------------------------------------------------------------------------
out_glb = os.path.join(OUT_DIR, 'ConceptGarage-raw.glb')
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    export_apply=True,
    export_animations=False,
    export_yup=True,
    export_image_format='AUTO',
)
print(f'[bl2] 导出 {out_glb}（{os.path.getsize(out_glb) / 1024:.0f}KB 未压缩）')
