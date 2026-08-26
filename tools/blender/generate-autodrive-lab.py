# CC-BL1：autodrive-lab 单栋 hero 楼实模 + 十字路口东北角道具簇 —— Blender 4.0 headless 生成脚本。
#
# 这是资产的**唯一源文件**（.blend 二进制被预算门 G-F 黑名单禁止入库，本脚本可复现全部
# 几何/贴图/材质，零外部资产、零许可负担——全部原创程序化生成）：
#   blender -b --factory-startup -P scripts/blender/generate-autodrive-lab.py -- --out /tmp/bl1-asset
# 产出 /tmp/bl1-asset/AutodriveLab-raw.glb（未压缩）+ 三张程序化 PNG 贴图（≤1024，≤2K 合同）。
# 压缩管线（Draco + KTX2/ETC1S）见 public/models/autodrive-lab/README.md（gltf-transform + toktx）。
#
# 坐标契约（与 src/data/cyber-city-buildings.json 对齐）：
#   · Blender X=东、Y=北、Z=上；glTF 导出 Y-up 自动换轴（three: x=bx, y=bz, z=-by）；
#   · 原点 = 楼体足迹中心地面点；运行时由 HeroBlenderMesh 平移到 building.position (52,-52)；
#   · footprint w44(X) × d36(Y) × h60(Z) —— 视觉包络 = 程序化 ThemeTowers 同笼（物理碰撞体沿用
#     footprint cuboid，BuildingSigns 立面灯箱挂点 ±(w/2+0.35)/±(d/2+0.35) 与楼顶全息板对角线
#     x+y=0 均已避让）；
#   · 东北角象限（世界 x 8–52 / z −52–−8）→ 本地 bx∈[−44,0], by∈[−44,0]，道具全部路缘外，
#     避让既有隔离墩 (−38.4,−34.8)/(−34.8,−38.4) 与灯杆 (−38.5,+6)/(0,−38.5)。
#
# 色纪律（rubric A3 / AL5）：窗格只用 暖白/青/暗 三族（atlas 随机 cell）；
# 楼宇身份色 #ff6b35 只进 LED 竖带/檐口线/信标/道具警示件；全部 emissive ≤1（bloom
# threshold=1 阈下），唯一辉光锚 = 屋顶信标 + 门架警灯（emissive strength 2.2，
# 同类楼 beacon 先例 createNeonGlowMaterial intensity 3）。
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
OUT_DIR = '/tmp/bl1-asset'
for i, a in enumerate(argv):
    if a == '--out' and i + 1 < len(argv):
        OUT_DIR = argv[i + 1]
os.makedirs(OUT_DIR, exist_ok=True)

SEED = 0x1206  # 确定性：同脚本同输出
rng = random.Random(SEED)
np_rng = np.random.default_rng(SEED)

# 楼体常量（buildings JSON autodrive-lab 条目单源）
W, D, H = 44.0, 36.0, 60.0
HW, HD = W / 2, D / 2
PODIUM_H = 4.5          # 裙房高（≈程序化 podium 4m）
LOWER_TOP = 34.0        # 下段收分线（≈0.567h，程序化 0.56–0.64 区间内）
UPPER_W, UPPER_D = 32.0, 26.0  # 上段 0.72 收分
UHW, UHD = UPPER_W / 2, UPPER_D / 2
FLOOR_H = 3.6
MODULE_W = 2.4
CHAMFER = 3.2           # 西南角切角（面向路口的地标转角）
GRID = 8                # windows atlas 格数

# ----------------------------------------------------------------------------
# 程序化贴图（numpy → Blender image → PNG；全部 ≤1024，≤2K 合同）
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
    """工具 atlas 四象限：①警示斜纹（橙/黑）②标定棋盘 ③纯橙板 ④卷帘门横肋"""
    tex = np.zeros((size, size, 3), dtype=np.float32)
    half = size // 2
    orange = srgb(255, 107, 53)
    dark = srgb(18, 20, 26)
    ys, xs = np.mgrid[0:half, 0:half]
    stripes = ((xs + ys) // 24) % 2 == 0
    tex[:half, :half][stripes] = orange
    tex[:half, :half][~stripes] = dark
    checker = ((xs // 32) + (ys // 32)) % 2 == 0
    tex[:half, half:][checker] = srgb(158, 168, 178)
    tex[:half, half:][~checker] = srgb(30, 34, 42)
    tex[half:, :half] = orange * 0.92
    tex[half::24, :half] = orange * 0.55
    rib = ys % 20 < 4
    panel = np.tile(srgb(44, 50, 62)[None, None, :], (half, half, 1))
    panel[rib] = srgb(16, 18, 24)
    panel[:, :6, :] = srgb(12, 14, 18)
    panel[:, -6:, :] = srgb(12, 14, 18)
    tex[half:, half:] = panel
    return tex


print('[bl1] 生成程序化贴图 …')
img_windows = make_image('autodrive-windows', gen_windows_atlas())
img_panels = make_image('autodrive-panels', gen_panels())
img_utility = make_image('autodrive-utility', gen_utility())

# ----------------------------------------------------------------------------
# 材质（名字 = 运行时/审计对账键，HeroBlenderMesh 按名分派微调）
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
    'AccentOrange': make_material('AccentOrange', color=hexc(0xff6b35), metallic=0.0, roughness=0.5,
                                  emissive=hexc(0xff6b35), emissive_strength=0.85),
    'BeaconOrange': make_material('BeaconOrange', color=hexc(0xff6b35), metallic=0.0, roughness=0.4,
                                  emissive=hexc(0xff6b35), emissive_strength=2.2),
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
# 逐材质几何缓冲（quad/box 直写，UV 全手控，法线可 hint 自动纠向）
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


def cylinder(buf, cx, cy, z0, r_bottom, r_top, height, segments=12, uv_rect=None, cap_top=True):
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


def window_cell(kind=None):
    """随机窗 cell 的 uv_rect（8% 内缩防渗色）。kind='warm' 取第 0 行（大堂亮格）"""
    gx = rng.randrange(GRID)
    gy = 0 if kind == 'warm' else rng.randrange(1, GRID)
    inset = 0.08 / GRID
    return (gx / GRID + inset, gy / GRID + inset, (gx + 1) / GRID - inset, (gy + 1) / GRID - inset)


UV_HAZARD = (0.02, 0.02, 0.48, 0.48)
UV_CHECKER = (0.52, 0.02, 0.98, 0.48)
UV_ORANGE = (0.02, 0.52, 0.48, 0.98)
UV_DOOR = (0.52, 0.52, 0.98, 0.98)
PANEL_UV = 1 / 12.0  # Facade 贴图 12m 平铺


# ----------------------------------------------------------------------------
# 幕墙生成器
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
    window_recess 可为负 = 窗凸出墙面（裙房橱窗贴实体墙用）。
    clear_rects: [(a0,a1,zc0,zc1)] 招牌避让区——BuildingSigns 立面灯箱挂点在墙面外
    0.35（挂高 h*0.34≈20.4），而竖梃/层间梁凸出 0.31 只留 4cm 会远距 z-fight：
    区内竖梃截断、层间梁分段让位，并铺一块 0.05 凸暗背板（灯箱浮空 0.30 净距）。"""
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


# ----------------------------------------------------------------------------
# ① 裙房（0 – PODIUM_H）：基座 + 骑楼橱窗 + 门厅/展廊/试车门三开口 + 檐口橙线
# ----------------------------------------------------------------------------
POD_HW, POD_HD = HW + 0.5, HD + 0.5  # 45×37 外挑 0.5
POD_Z0, POD_Z1 = 0.6, PODIUM_H
FASCIA_H = 0.9
WALL_H = POD_Z1 - POD_Z0

print('[bl1] 建模：裙房 …')
# 底盘基座（下沉 0.1 咬合地坪）
box(BUFS['Concrete'], 0, 0, -0.1, POD_HW * 2 + 0.8, POD_HD * 2 + 0.8, 0.7, uv_scale=PANEL_UV, faces='side_top')

# 北墙/东墙（背街整面闭合）
wall_box(0, POD_HD - 0.4, POD_Z0, POD_HW * 2, 0.8, WALL_H)
wall_box(POD_HW - 0.4, 0, POD_Z0, 0.8, POD_HD * 2, WALL_H)

# 西墙：门厅开口 by∈[-6,6]，两侧实体墙 + 凸出橱窗条（贴墙 6cm 凸出）
ENT_Y0, ENT_Y1 = -6.0, 6.0
wall_box(-POD_HW + 0.4, (POD_HD + ENT_Y1) / 2, POD_Z0, 0.8, POD_HD - ENT_Y1, WALL_H)
wall_box(-POD_HW + 0.4, (-POD_HD + ENT_Y0) / 2, POD_Z0, 0.8, ENT_Y0 + POD_HD, WALL_H)
curtain_wall((-POD_HW, ENT_Y1 + 0.6), (0, 1), (-1, 0), POD_HD - ENT_Y1 - 1.4, POD_Z0 + 0.3, POD_Z1 - FASCIA_H,
             detailed=True, module_w=2.6, floor_h=WALL_H - FASCIA_H, spandrel_h=0.26,
             window_recess=-0.06, lobby=True)
curtain_wall((-POD_HW, -POD_HD + 0.8), (0, 1), (-1, 0), POD_HD + ENT_Y0 - 1.4, POD_Z0 + 0.3, POD_Z1 - FASCIA_H,
             detailed=True, module_w=2.6, floor_h=WALL_H - FASCIA_H, spandrel_h=0.26,
             window_recess=-0.06, lobby=True)

# 门厅内凹（深 2.2）：暖光内顶 + 暗玻璃门面 + 两樘暖窗 + 侧壁
ENT_DEPTH = 2.2
ent_x = -POD_HW + ENT_DEPTH
BUFS['InteriorWarm'].quad(
    (-POD_HW, ENT_Y0, POD_Z1 - FASCIA_H), (ent_x, ENT_Y0, POD_Z1 - FASCIA_H),
    (ent_x, ENT_Y1, POD_Z1 - FASCIA_H), (-POD_HW, ENT_Y1, POD_Z1 - FASCIA_H), normal_hint=(0, 0, -1))
BUFS['GlassDark'].quad((ent_x, ENT_Y0, POD_Z0), (ent_x, ENT_Y1, POD_Z0),
                       (ent_x, ENT_Y1, POD_Z1 - FASCIA_H), (ent_x, ENT_Y0, POD_Z1 - FASCIA_H),
                       normal_hint=(-1, 0, 0))
for wy in (-3.4, 0.6):
    u0, v0, u1, v1 = window_cell('warm')
    BUFS['Window'].quad((ent_x - 0.05, wy, POD_Z0 + 0.2), (ent_x - 0.05, wy + 2.6, POD_Z0 + 0.2),
                        (ent_x - 0.05, wy + 2.6, POD_Z1 - FASCIA_H - 0.4), (ent_x - 0.05, wy, POD_Z1 - FASCIA_H - 0.4),
                        ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(-1, 0, 0))
for sy in (ENT_Y0, ENT_Y1):
    box(BUFS['FacadeDark'], (-POD_HW + ent_x) / 2, sy, POD_Z0, ENT_DEPTH, 0.3, WALL_H - FASCIA_H, faces='side_top')
# 地面导入毯（暖光低发光条，抬 0.05 防 z-fight）
box(BUFS['InteriorWarm'], -POD_HW + 0.8, 0, 0.05, 1.6, 10.0, 0.03, faces='side_top')

# 南墙三段：展廊开口 bx∈[-16,-4]、试车卷帘门 bx∈[0,8] + 东段橱窗
VIT_X0, VIT_X1 = -16.0, -4.0
DOOR_X0, DOOR_X1 = 0.0, 8.0
wall_box((-POD_HW + VIT_X0) / 2, -POD_HD + 0.4, POD_Z0, VIT_X0 + POD_HW, 0.8, WALL_H)
wall_box((VIT_X1 + DOOR_X0) / 2, -POD_HD + 0.4, POD_Z0, DOOR_X0 - VIT_X1, 0.8, WALL_H)
wall_box((DOOR_X1 + POD_HW) / 2, -POD_HD + 0.4, POD_Z0, POD_HW - DOOR_X1, 0.8, WALL_H)
curtain_wall((DOOR_X1 + 0.8, -POD_HD), (1, 0), (0, -1), POD_HW - DOOR_X1 - 1.6, POD_Z0 + 0.3, POD_Z1 - FASCIA_H,
             detailed=True, module_w=2.6, floor_h=WALL_H - FASCIA_H, spandrel_h=0.26,
             window_recess=-0.06, lobby=True)

# 展廊（vitrine）：内凹 2.4 暖光展厅 + 展台 + 试验车壳
VIT_DEPTH = 2.4
vit_y = -POD_HD + VIT_DEPTH
BUFS['InteriorWarm'].quad(
    (VIT_X0, -POD_HD, POD_Z1 - FASCIA_H), (VIT_X0, vit_y, POD_Z1 - FASCIA_H),
    (VIT_X1, vit_y, POD_Z1 - FASCIA_H), (VIT_X1, -POD_HD, POD_Z1 - FASCIA_H), normal_hint=(0, 0, -1))
BUFS['InteriorWarm'].quad((VIT_X0, vit_y, POD_Z0), (VIT_X1, vit_y, POD_Z0),
                          (VIT_X1, vit_y, POD_Z1 - FASCIA_H), (VIT_X0, vit_y, POD_Z1 - FASCIA_H),
                          normal_hint=(0, -1, 0))
for sx in (VIT_X0, VIT_X1):
    box(BUFS['FacadeDark'], sx, (-POD_HD + vit_y) / 2, POD_Z0, 0.3, VIT_DEPTH, WALL_H - FASCIA_H, faces='side_top')
PLINTH_X, PLINTH_Y = (VIT_X0 + VIT_X1) / 2, -POD_HD + 1.3
box(BUFS['Concrete'], PLINTH_X, PLINTH_Y, POD_Z0, 5.2, 2.2, 0.35, uv_scale=PANEL_UV, faces='side_top')


def car_shell(cx, cy, z0, yaw=0.0, scale=1.0):
    """低模概念车壳：楔形车体 + 青罩座舱 + 尾灯橙条 + 盒式轮（~120 tri）"""
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
    BUFS['AccentOrange'].quad(tail[0], tail[1], tail[2], tail[3], normal_hint=(hint[0], hint[1], 0))


car_shell(PLINTH_X, PLINTH_Y, POD_Z0 + 0.35, yaw=math.radians(18))

# 试车卷帘门（Utility ④ 肋纹，内凹 0.35）+ 警示门柱
BUFS['Utility'].quad((DOOR_X0, -POD_HD + 0.35, POD_Z0), (DOOR_X1, -POD_HD + 0.35, POD_Z0),
                     (DOOR_X1, -POD_HD + 0.35, POD_Z1 - FASCIA_H), (DOOR_X0, -POD_HD + 0.35, POD_Z1 - FASCIA_H),
                     ((UV_DOOR[0], UV_DOOR[1]), (UV_DOOR[2], UV_DOOR[1]), (UV_DOOR[2], UV_DOOR[3]), (UV_DOOR[0], UV_DOOR[3])),
                     normal_hint=(0, -1, 0))
for dx in (DOOR_X0 - 0.25, DOOR_X1 + 0.25):
    box(BUFS['Utility'], dx, -POD_HD + 0.25, POD_Z0, 0.4, 0.4, WALL_H - FASCIA_H, uv_rect=UV_HAZARD, faces='side_top')

# 檐口（全周实体带，兼作裙房顶盖）+ 西/南橙识别线
box(BUFS['FacadeDark'], 0, 0, POD_Z1 - FASCIA_H, POD_HW * 2 + 0.3, POD_HD * 2 + 0.3, FASCIA_H,
    uv_scale=PANEL_UV, faces='side_top')
box(BUFS['AccentOrange'], -POD_HW - 0.18, 0, POD_Z1 - 0.42, 0.08, POD_HD * 2 - 2, 0.12, faces='side')
box(BUFS['AccentOrange'], 0, -POD_HD - 0.18, POD_Z1 - 0.42, POD_HW * 2 - 2, 0.08, 0.12, faces='side')

# ----------------------------------------------------------------------------
# ② 下段塔身（PODIUM_H – LOWER_TOP）：西/南逐窗 + 北/东条窗 + 西南切角 LED + 遮视芯
# ----------------------------------------------------------------------------
print('[bl1] 建模：下段塔身 …')
# 招牌避让区（BuildingSigns 立面灯箱：挂高 min(25, 0.34h)=20.4 ± 面板半高 ~1.65 + 余量；
# 面板中心对齐楼心 → 西墙 along = 0−(−HD+CHAMFER)、南墙 along = 0−(−HW+CHAMFER)）
SIGN_Z = (18.2, 22.7)
west_c = HD - CHAMFER   # 楼心在西墙 along 坐标
south_c = HW - CHAMFER  # 楼心在南墙 along 坐标
curtain_wall((-HW, -HD + CHAMFER), (0, 1), (-1, 0), D - CHAMFER, PODIUM_H, LOWER_TOP, detailed=True,
             clear_rects=[(west_c - 12, west_c + 12, SIGN_Z[0], SIGN_Z[1])])
curtain_wall((-HW + CHAMFER, -HD), (1, 0), (0, -1), W - CHAMFER, PODIUM_H, LOWER_TOP, detailed=True,
             clear_rects=[(south_c - 12, south_c + 12, SIGN_Z[0], SIGN_Z[1])])
curtain_wall((HW, HD), (0, -1), (1, 0), D, PODIUM_H, LOWER_TOP, detailed=False)
curtain_wall((HW, HD), (-1, 0), (0, 1), W, PODIUM_H, LOWER_TOP, detailed=False)
# 遮视芯（防窗缝透视）
box(BUFS['FacadeDark'], 0, 0, PODIUM_H, W - 1.2, D - 1.2, LOWER_TOP - PODIUM_H, faces='side')
# 西南 45° 切角面板 + 双橙 LED 竖带
ch_a, ch_b = (-HW, -HD + CHAMFER), (-HW + CHAMFER, -HD)
BUFS['FacadeDark'].quad((ch_a[0], ch_a[1], PODIUM_H), (ch_b[0], ch_b[1], PODIUM_H),
                        (ch_b[0], ch_b[1], LOWER_TOP), (ch_a[0], ch_a[1], LOWER_TOP),
                        normal_hint=(-1, -1, 0))
for t in (0.32, 0.68):
    lx = ch_a[0] + (ch_b[0] - ch_a[0]) * t - 0.12 * math.sqrt(0.5)
    ly = ch_a[1] + (ch_b[1] - ch_a[1]) * t - 0.12 * math.sqrt(0.5)
    box(BUFS['AccentOrange'], lx, ly, PODIUM_H + 0.8, 0.22, 0.22, LOWER_TOP - PODIUM_H - 1.6,
        yaw=math.pi / 4, faces='side')
# 三向包角柱（西南切角除外）
for (cx, cy) in ((HW, HD), (-HW, HD), (HW, -HD)):
    box(BUFS['MetalDark'], cx - math.copysign(0.2, cx), cy - math.copysign(0.2, cy), PODIUM_H,
        0.75, 0.75, LOWER_TOP - PODIUM_H, faces='side')

# ----------------------------------------------------------------------------
# ③ 下段屋面平台（LOWER_TOP）：环圈女儿墙 + 设备组 + 管线
# ----------------------------------------------------------------------------
print('[bl1] 建模：设备平台 …')
box(BUFS['FacadeDark'], 0, 0, LOWER_TOP - 0.5, W + 0.4, D + 0.4, 0.7, uv_scale=PANEL_UV, faces='side_top')
for (cx, cy, sx, sy) in ((0, HD - 0.15, W, 0.3), (0, -HD + 0.15, W, 0.3),
                         (HW - 0.15, 0, 0.3, D), (-HW + 0.15, 0, 0.3, D)):
    box(BUFS['FacadeDark'], cx, cy, LOWER_TOP + 0.2, sx, sy, 1.1, faces='side_top')
for (ax, ay, rot) in ((-HW + 3.6, -HD + 3.2, 0.2), (-HW + 8.4, -HD + 3.0, -0.15), (HW - 4.6, -HD + 3.4, 0.35)):
    box(BUFS['Metal'], ax, ay, LOWER_TOP + 0.2, 2.6, 1.8, 1.5, yaw=rot, faces='side_top')
    box(BUFS['MetalDark'], ax, ay, LOWER_TOP + 1.7, 2.2, 1.4, 0.25, yaw=rot, faces='side_top')
for i in range(3):
    box(BUFS['Metal'], -2, -HD + 1.6 + i * 0.5, LOWER_TOP + 0.25 + (i % 2) * 0.2, W * 0.7, 0.28, 0.28, faces='side_top')

# ----------------------------------------------------------------------------
# ④ 上段塔身（LOWER_TOP – H）：0.72 收分 + 遮阳鳍 + 顶部设备带百叶 + 檐口橙线
# ----------------------------------------------------------------------------
print('[bl1] 建模：上段塔身 …')
MECH_Z0 = H - 2.5
curtain_wall((-UHW, -UHD), (0, 1), (-1, 0), UPPER_D, LOWER_TOP, MECH_Z0, detailed=True)
curtain_wall((-UHW, -UHD), (1, 0), (0, -1), UPPER_W, LOWER_TOP, MECH_Z0, detailed=True)
curtain_wall((UHW, UHD), (0, -1), (1, 0), UPPER_D, LOWER_TOP, MECH_Z0, detailed=False)
curtain_wall((UHW, UHD), (-1, 0), (0, 1), UPPER_W, LOWER_TOP, MECH_Z0, detailed=False)
box(BUFS['FacadeDark'], 0, 0, LOWER_TOP, UPPER_W - 1.2, UPPER_D - 1.2, MECH_Z0 - LOWER_TOP, faces='side')
for (cx, cy) in ((UHW, UHD), (-UHW, UHD), (UHW, -UHD), (-UHW, -UHD)):
    box(BUFS['MetalDark'], cx - math.copysign(0.18, cx), cy - math.copysign(0.18, cy), LOWER_TOP,
        0.66, 0.66, MECH_Z0 - LOWER_TOP, faces='side')
fin_floors = int((MECH_Z0 - LOWER_TOP) / FLOOR_H)
for f in range(0, fin_floors, 2):
    box(BUFS['Metal'], -UHW - 0.45, 0, LOWER_TOP + (f + 1) * FLOOR_H, 0.5, UPPER_D - 1.2, 0.14, faces='side_top')
box(BUFS['FacadeDark'], 0, 0, MECH_Z0, UPPER_W, UPPER_D, H - MECH_Z0, uv_scale=PANEL_UV, faces='side')
for i in range(10):
    box(BUFS['MetalDark'], -UHW - 0.06, 0, MECH_Z0 + 0.3 + i * 0.2, 0.1, UPPER_D - 2, 0.08, faces='side')
    box(BUFS['MetalDark'], 0, -UHD - 0.06, MECH_Z0 + 0.3 + i * 0.2, UPPER_W - 2, 0.1, 0.08, faces='side')
box(BUFS['AccentOrange'], -UHW - 0.14, 0, H - 0.5, 0.07, UPPER_D - 1.5, 0.1, faces='side')
box(BUFS['AccentOrange'], 0, -UHD - 0.14, H - 0.5, UPPER_W - 1.5, 0.07, 0.1, faces='side')

# ----------------------------------------------------------------------------
# ⑤ 屋顶（H）：女儿墙 + 机房（东北象限）+ 风机 + 桅杆信标——全部避让全息板对角线 x+y=0
# ----------------------------------------------------------------------------
print('[bl1] 建模：屋顶 …')
box(BUFS['FacadeDark'], 0, 0, H - 0.4, UPPER_W + 0.3, UPPER_D + 0.3, 0.55, uv_scale=PANEL_UV, faces='side_top')
for (cx, cy, sx, sy) in ((0, UHD - 0.12, UPPER_W, 0.24), (0, -UHD + 0.12, UPPER_W, 0.24),
                         (UHW - 0.12, 0, 0.24, UPPER_D), (-UHW + 0.12, 0, 0.24, UPPER_D)):
    box(BUFS['FacadeDark'], cx, cy, H + 0.15, sx, sy, 0.8, faces='side_top')
box(BUFS['Facade'], 9, 7, H + 0.15, 9, 5.5, 2.3, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['MetalDark'], 9, 7, H + 2.45, 8.2, 4.7, 0.3, faces='side_top')
for (vx, vy) in ((-9, -3), (-5, -9)):
    cylinder(BUFS['Metal'], vx, vy, H + 0.15, 0.9, 0.9, 1.1, segments=12)
    cylinder(BUFS['MetalDark'], vx, vy, H + 1.25, 1.05, 0.6, 0.4, segments=12)
MAST_X, MAST_Y = -13.0, 6.0
cylinder(BUFS['Metal'], MAST_X, MAST_Y, H + 0.15, 0.28, 0.16, 7.2, segments=10)
box(BUFS['Metal'], MAST_X, MAST_Y, H + 4.4, 2.4, 0.16, 0.16, faces='side')
box(BUFS['BeaconOrange'], MAST_X, MAST_Y, H + 7.35, 0.5, 0.5, 0.5, faces='all')

# ----------------------------------------------------------------------------
# ⑥ 东北角道具簇（本地 bx∈[−44,0], by∈[−44,0]；世界 x 8–52 / z −52–−8）
# ----------------------------------------------------------------------------
print('[bl1] 建模：街角道具簇 …')

# —— 充电桩阵 ×4 + 光伏雨棚（西侧带，面向中轴大道；世界 x≈17 / z −38.5~−25） ——
CHARGE_X = -35.0
CHARGE_YS = (-26.0, -21.5, -17.0, -12.5)
for cy in CHARGE_YS:
    box(BUFS['Concrete'], CHARGE_X, cy, 0.0, 1.5, 1.1, 0.18, faces='side_top')
    box(BUFS['FacadeDark'], CHARGE_X, cy, 0.18, 0.55, 0.42, 1.55, faces='side_top')
    box(BUFS['Metal'], CHARGE_X, cy, 1.73, 0.55, 0.42, 0.14, faces='side_top')
    BUFS['ScreenCyan'].quad((CHARGE_X - 0.29, cy - 0.16, 0.85), (CHARGE_X - 0.29, cy + 0.16, 0.85),
                            (CHARGE_X - 0.29, cy + 0.16, 1.35), (CHARGE_X - 0.29, cy - 0.16, 1.35),
                            normal_hint=(-1, 0, 0))
    box(BUFS['AccentOrange'], CHARGE_X + 0.20, cy + 0.28, 0.18, 0.1, 0.1, 0.9, faces='side_top')
    box(BUFS['MetalDark'], CHARGE_X, cy - 0.28, 0.55, 0.4, 0.08, 0.5, faces='side')
    # 充电位地面标线（发光青描边框，抬 0.05 防 z-fight）
    px = CHARGE_X - 2.6
    for (sx, sy_, ln, wd) in ((px, cy - 1.05, 3.6, 0.12), (px, cy + 1.05, 3.6, 0.12),
                              (px - 1.74, cy, 0.12, 2.22), (px + 1.74, cy, 0.12, 2.22)):
        box(BUFS['ScreenCyan'], sx, sy_, 0.05, ln, wd, 0.03, faces='side_top')
# 光伏雨棚：4 柱 + 倾斜光伏顶板（panels 纹理细平铺=PV 模组阵）+ 金属横肋 + 底面橙灯带
for py_ in (-27.8, -10.7):
    for px_ in (-37.2, -32.8):
        box(BUFS['Metal'], px_, py_, 0.0, 0.28, 0.28, 3.3, faces='side')
roof_pts = [(-38.2, -28.8, 3.1), (-31.8, -28.8, 3.65), (-31.8, -9.7, 3.65), (-38.2, -9.7, 3.1)]
BUFS['Facade'].quad(*roof_pts, uv=((0, 0), (3.2, 0), (3.2, 9.5), (0, 9.5)), normal_hint=(0, 0, 1))
BUFS['Facade'].quad(*[(p[0], p[1], p[2] - 0.12) for p in roof_pts],
                    uv=((0, 0), (0.5, 0), (0.5, 1.6), (0, 1.6)), normal_hint=(0, 0, -1))
for ry in (-25.6, -19.25, -12.9):  # 横肋压条（贴坡面薄片，打散大板面）
    BUFS['Metal'].quad((-38.2, ry - 0.11, 3.15), (-31.8, ry - 0.11, 3.70),
                       (-31.8, ry + 0.11, 3.70), (-38.2, ry + 0.11, 3.15), normal_hint=(0, 0, 1))
for rt in (0.12, 0.5, 0.88):  # 纵向导轨压边（跟坡高）
    rxx = -38.2 + 6.4 * rt
    box(BUFS['MetalDark'], rxx, -19.25, 3.06 + 0.55 * rt, 0.14, 19.3, 0.09, faces='side_top')
box(BUFS['AccentOrange'], -35.0, -19.25, 3.02, 0.14, 17.5, 0.08, faces='side_top')

# —— 试车升降台（scissor lift + 试验车 + 传感门架；世界 (43,−21)，试车卷帘门前场）——
# 布局纪律：parkingBay 世界 (28,−28) 半径 6 → 本地 (−24,−24)，圈内 + 从隔离墩缺口
# (−36.6,−36.6) 进泊车位的对角行车走廊全部让空（POI 深链泊车不撞道具）。
RIG_X, RIG_Y, RIG_YAW = -9.0, -31.0, math.radians(24)
box(BUFS['Concrete'], RIG_X, RIG_Y, 0.0, 5.6, 3.4, 0.14, yaw=RIG_YAW, faces='side_top')
box(BUFS['Utility'], RIG_X, RIG_Y, 0.14, 5.0, 2.9, 0.22, yaw=RIG_YAW, uv_rect=UV_HAZARD, faces='side')
box(BUFS['Metal'], RIG_X, RIG_Y, 0.2, 3.6, 0.24, 1.0, yaw=RIG_YAW + math.radians(18), faces='side')
box(BUFS['Metal'], RIG_X, RIG_Y, 0.2, 3.6, 0.24, 1.0, yaw=RIG_YAW - math.radians(18), faces='side')
box(BUFS['MetalDark'], RIG_X, RIG_Y, 1.2, 4.9, 2.7, 0.22, yaw=RIG_YAW, faces='side_top')
car_shell(RIG_X, RIG_Y, 1.42, yaw=RIG_YAW)
g_off = rot_z((0, 1.9), RIG_YAW)
for s in (1, -1):
    box(BUFS['Metal'], RIG_X + g_off[0] * s, RIG_Y + g_off[1] * s, 0.0, 0.3, 0.3, 4.2, yaw=RIG_YAW, faces='side')
box(BUFS['Metal'], RIG_X, RIG_Y, 4.0, 0.34, 4.4, 0.34, yaw=RIG_YAW, faces='side_top')
for t in (-1.2, 0.0, 1.2):
    o = rot_z((0, t), RIG_YAW)
    box(BUFS['MetalDark'], RIG_X + o[0], RIG_Y + o[1], 3.62, 0.5, 0.4, 0.38, yaw=RIG_YAW, faces='all')
    box(BUFS['ScreenCyan'], RIG_X + o[0], RIG_Y + o[1], 3.56, 0.3, 0.26, 0.06, yaw=RIG_YAW, faces='all')
box(BUFS['BeaconOrange'], RIG_X + g_off[0], RIG_Y + g_off[1], 4.34, 0.22, 0.22, 0.22, yaw=RIG_YAW, faces='all')

# —— 全息信息 totem（近路口角充电区旁，世界 (15,−21)；避让隔离墩 ≥3m + 行车对角线让空） ——
TOT_X, TOT_Y = -37.0, -31.0
box(BUFS['Concrete'], TOT_X, TOT_Y, 0.0, 1.4, 1.4, 0.16, faces='side_top')
box(BUFS['FacadeDark'], TOT_X, TOT_Y, 0.16, 0.5, 0.34, 3.1, faces='side_top')
for s in (-1, 1):
    BUFS['AccentOrange'].quad(
        (TOT_X - 0.22, TOT_Y + s * 0.18, 0.7), (TOT_X + 0.22, TOT_Y + s * 0.18, 0.7),
        (TOT_X + 0.22, TOT_Y + s * 0.18, 2.9), (TOT_X - 0.22, TOT_Y + s * 0.18, 2.9),
        ((0.06, 0.55), (0.22, 0.55), (0.22, 0.95), (0.06, 0.95)), normal_hint=(0, s, 0))
box(BUFS['ScreenCyan'], TOT_X, TOT_Y, 3.26, 0.56, 0.4, 0.08, faces='all')

# —— 标定板 ×2（面向试车卷帘门；automotive 叙事件） ——
for (bx_, by_, byaw) in ((-6.0, -26.0, math.radians(8)), (-1.0, -28.5, math.radians(-14))):
    for (ox, oy) in ((0.0, -0.5), (-0.45, 0.4), (0.45, 0.4)):
        o = rot_z((ox, oy), byaw)
        box(BUFS['MetalDark'], bx_ + o[0], by_ + o[1], 0.0, 0.09, 0.09, 1.15, yaw=byaw, faces='side')
    box(BUFS['Utility'], bx_, by_, 1.1, 1.5, 0.08, 1.5, yaw=byaw, uv_rect=UV_CHECKER, faces='all')

# —— 设备杂件：备件箱堆 + 冷却罐 + 隔离墩 ×2 + 缆线槽（全部避开泊车圈 (−24,−24) r6 与行车对角线）——
for (cx_, cy_, sz_, yaw_) in ((-25.6, -33.0, 1.05, 0.2), (-24.6, -33.8, 0.8, -0.3), (-25.9, -32.0, 0.7, 0.55)):
    box(BUFS['Utility'], cx_, cy_, 0.0, sz_, sz_ * 0.8, sz_ * 0.7, yaw=yaw_, uv_rect=UV_ORANGE, faces='side_top')
cylinder(BUFS['Metal'], -21.5, -34.5, 0.0, 0.75, 0.75, 2.3, segments=14)
cylinder(BUFS['MetalDark'], -21.5, -34.5, 2.3, 0.78, 0.5, 0.35, segments=14)
box(BUFS['Metal'], -20.2, -34.5, 0.8, 1.9, 0.16, 0.16, faces='side_top')
for (hx, hy, hyaw) in ((-29.5, -36.5, math.radians(30)), (-26.0, -36.5, math.radians(-12))):
    box(BUFS['Concrete'], hx, hy, 0.0, 1.9, 0.42, 0.5, yaw=hyaw, faces='side_top')
    box(BUFS['Utility'], hx, hy, 0.5, 1.9, 0.36, 0.3, yaw=hyaw, uv_rect=UV_HAZARD, faces='side_top')
box(BUFS['MetalDark'], -30.0, -12.0, 0.0, 9.5, 0.5, 0.09, faces='side_top')
box(BUFS['MetalDark'], -29.0, -14.0, 0.0, 8.0, 0.5, 0.09, yaw=math.radians(6), faces='side_top')

# —— 门廊（西门厅外骑楼：4 柱 + 悬挑棚 + 底面暖光板 + 引导矮墙 + 台阶） ——
PORCH_X0, PORCH_X1 = -POD_HW - 5.6, -POD_HW
for py_ in (-4.6, 4.6):
    for px_ in (PORCH_X0 + 0.5, PORCH_X0 + 3.2):
        box(BUFS['MetalDark'], px_, py_, 0.0, 0.34, 0.34, 4.05, faces='side')
box(BUFS['FacadeDark'], (PORCH_X0 + PORCH_X1) / 2, 0, 4.05, PORCH_X1 - PORCH_X0 + 0.4, 11.0, 0.5,
    uv_scale=PANEL_UV, faces='side_top')
box(BUFS['AccentOrange'], (PORCH_X0 + PORCH_X1) / 2, -5.35, 4.12, PORCH_X1 - PORCH_X0 - 1.0, 0.14, 0.07, faces='side_top')
box(BUFS['AccentOrange'], (PORCH_X0 + PORCH_X1) / 2, 5.35, 4.12, PORCH_X1 - PORCH_X0 - 1.0, 0.14, 0.07, faces='side_top')
BUFS['InteriorWarm'].quad(
    (PORCH_X0 + 0.4, -4.9, 4.02), (PORCH_X1 - 0.2, -4.9, 4.02),
    (PORCH_X1 - 0.2, 4.9, 4.02), (PORCH_X0 + 0.4, 4.9, 4.02), normal_hint=(0, 0, -1))
for s in (-1, 1):
    box(BUFS['Concrete'], PORCH_X0 + 2.0, s * 5.6, 0.0, 4.5, 0.4, 0.75, faces='side_top')
    box(BUFS['ScreenCyan'], PORCH_X0 + 2.0, s * 5.6, 0.75, 4.1, 0.12, 0.06, faces='side_top')
for i in range(3):
    box(BUFS['Concrete'], PORCH_X0 + 1.2 - i * 0.45, 0, 0.0, 0.45, 9.6, 0.14 * (3 - i), faces='side_top')

# ----------------------------------------------------------------------------
# 落地：逐材质建 mesh（一物一材质 → ≤13 draw call），全挂 Root
# ----------------------------------------------------------------------------
print('[bl1] 组装 mesh …')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

root = bpy.data.objects.new('AutodriveLabRoot', None)
bpy.context.collection.objects.link(root)

total_tris = 0
for name in MAT_ORDER:
    buf = BUFS[name]
    if not buf.faces:
        continue
    mesh = bpy.data.meshes.new(f'AL_{name}')
    mesh.from_pydata(buf.verts, [], buf.faces)
    mesh.validate()
    uv_layer = mesh.uv_layers.new(name='UVMap')
    li = 0
    for fi, face in enumerate(buf.faces):
        for corner in range(len(face)):
            uv_layer.data[li].uv = buf.uvs[fi][corner]
            li += 1
    mesh.materials.append(MATS[name])
    obj = bpy.data.objects.new(f'AL_{name}', mesh)
    obj.parent = root
    bpy.context.collection.objects.link(obj)
    tris = sum(len(f) - 2 for f in buf.faces)
    total_tris += tris
    print(f'[bl1]   {name:14s} faces={len(buf.faces):5d} tris={tris:6d}')

print(f'[bl1] 总三角形 ≈ {total_tris}（合同 ≤100k）')
assert total_tris <= 100_000, 'tri 超出 ≤100k 合同'

# ----------------------------------------------------------------------------
# 导出 GLB（未压缩原件；Draco/KTX2 压缩由 gltf-transform 管线完成）
# ----------------------------------------------------------------------------
out_glb = os.path.join(OUT_DIR, 'AutodriveLab-raw.glb')
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    export_apply=True,
    export_animations=False,
    export_yup=True,
    export_image_format='AUTO',
)
print(f'[bl1] 导出 {out_glb}（{os.path.getsize(out_glb) / 1024:.0f}KB 未压缩）')
