# CC-VIS-X1B：voice-pod 第三栋 hero 楼实模 —— Blender 4.0 headless 生成脚本。
#
# 这是资产的**唯一源文件**（.blend 二进制被预算门 G-F 黑名单禁止入库，本脚本可复现全部
# 几何/贴图/材质，零外部资产、零许可负担——全部原创程序化生成）：
#   blender -b --factory-startup -P tools/blender/generate-voice-pod.py -- --out /tmp/x1b-asset
# 产出 /tmp/x1b-asset/VoicePod-raw.glb（未压缩）+ 三张程序化 PNG 贴图（≤1024，≤2K 合同）。
# 压缩管线（Draco + KTX2/ETC1S）见 public/models/voice-pod/README.md（gltf-transform + toktx）。
#
# 选楼裁定（CC-VIS-L8-DES §3 W2③：robot_idle 视锥或主干道驾驶动线可见优先，候选
# work-gallery / tts-cockpit 楼）：双候选均不入 ritual_idle 视锥（camera-shots.json 在案
# work-gallery outOfFrame 机器门；voice-pod 位于机位后方 SE 象限）→ 按第二标准取
# voice-pod：中轴大道 × 霓虹大街交叉口东南角**双临街**（work-gallery 单临街），出生
# 路口四塔之一、驶离路口任意动线沿途；且已是 ThemeTowers hero 在册——补 heroGlb
# 字段即挂载，引擎零改动（CityMap.ts 合同），V4 归因纯净。
#
# 坐标契约（与 src/data/cyber-city-buildings.json 对齐）：
#   · Blender X=东、Y=北、Z=上；glTF 导出 Y-up 自动换轴（three: x=bx, y=bz, z=-by）；
#   · 原点 = 楼体足迹中心地面点；运行时由 HeroBlenderMesh 平移到 building.position (52,52)；
#   · footprint w32(X) × d32(Y) × h42(Z) —— 视觉包络严格同笼（含屋顶桅杆信标顶 41.75 ≤ 42；
#     物理碰撞体沿用 ThemeTowers footprint cuboid，**零随楼道具、零新增碰撞体**）；
#   · 临街面 = 西（bx=−16，面向中轴大道）+ 北（by=+16，面向霓虹大街）；南/东为背街面。
#
# 挂点避让（BuildingSigns / 消费端合同）：
#   · 立面灯箱（挂高 min(8.5,max(6.4,0.18h))≈7.6，面板高 ≈2.3）：西/北墙 along 楼心 ±8、
#     z∈[6.2,9.0] 竖梃截断 + 0.05 凸暗背板（灯箱 proud 0.35 → 净距 0.30）；
#   · 楼身竖幅（西墙 primary slot，沿立面 +z(three) 偏 9.6 → 本地 by=−9.6，顶 0.9h=37.8）：
#     by∈[−12,−7.2] 立 FacadeDark 竖幅背板脊至 38.3（幕墙区内 clear_rects 同步让位）；
#   · 楼顶全息板（中心 (0,0) 高 43.1–46.3、朝路口对角 → 本地 bx=by 对角带）：屋面设备/
#     桅杆全部押反对角（bx=−by 侧），对角带让空。
#
# 色纪律（rubric A3 / AL5）：窗格只用 暖白/青/暗 三族（atlas 随机 cell）；
# 楼宇身份色 #ff2d6f 只进 LED 檐口线/均衡器光条/环带/信标；工业警示件保持通用橙黑
# （不随楼染色）；全部 emissive ≤1（bloom threshold=1 阈下），唯一辉光锚 = 屋顶信标
# （BeaconPink emissive strength 2.2，BL1/BL2 同款先例）。
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
OUT_DIR = '/tmp/x1b-asset'
for i, a in enumerate(argv):
    if a == '--out' and i + 1 < len(argv):
        OUT_DIR = argv[i + 1]
os.makedirs(OUT_DIR, exist_ok=True)

SEED = 0x2D6F  # 确定性：同脚本同输出（= 身份色 #ff2d6f 尾值，与 BL1 0x1206 / BL2 0x2207 区分）
rng = random.Random(SEED)
np_rng = np.random.default_rng(SEED)

# 楼体常量（buildings JSON voice-pod 条目单源）
W, D, H = 32.0, 32.0, 42.0
HW, HD = W / 2, D / 2          # 16 / 16
PODIUM_H = 4.8                 # 裙房高
SHAFT_TOP = 30.5               # 主塔身顶（其上为波形天冠）
CROWN_CAP = 35.2               # 天冠内芯顶 / 屋面设备台
FLOOR_H = 3.6
MODULE_W = 2.4
GRID = 8                       # windows atlas 格数

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
    """可平铺**穿孔声学幕墙板**：板缝 + 值抖动 + 穿孔点阵（声学腔）+ 轻雨渍——12m 平铺。
    与 BL1 铆钉金属板 / BL2 幕墙板区分：点阵孔 = 声学舱身份的材质层证据。"""
    base = srgb(30, 30, 40)
    seam = srgb(11, 12, 18)
    tex = np.tile(base[None, None, :], (size, size, 1)).astype(np.float32)
    px_per_m = size / 12.0
    panel_w = int(1.5 * px_per_m)
    panel_h = int(1.2 * px_per_m)
    for py in range(0, size, panel_h):
        for px in range(0, size, panel_w):
            tex[py:py + panel_h, px:px + panel_w, :] *= 1.0 + rng.uniform(-0.09, 0.09)
    # 穿孔点阵（每板内 8×10 孔，孔径 3px，暗腔色）
    hole = srgb(8, 9, 14)
    pitch = max(8, int(0.14 * px_per_m))
    for py in range(0, size, panel_h):
        for px in range(0, size, panel_w):
            for hy in range(py + pitch, min(py + panel_h - 4, size) - 2, pitch):
                for hx in range(px + pitch, min(px + panel_w - 4, size) - 2, pitch):
                    tex[hy:hy + 3, hx:hx + 3, :] = hole
    for py in range(0, size, panel_h):
        tex[py:py + 2, :, :] = seam
    for px in range(0, size, panel_w):
        tex[:, px:px + 2, :] = seam
    for _ in range(60):  # 轻雨渍
        sx = rng.randint(0, size - 4)
        sy = rng.randint(0, size - 1) // panel_h * panel_h
        length = rng.randint(panel_h // 2, panel_h * 2)
        strength = rng.uniform(0.08, 0.22)
        wd = rng.randint(2, 3)
        for k in range(length):
            y = (sy + k) % size
            tex[y, sx:sx + wd, :] *= 1 - strength * (1 - k / length)
    tex *= 1.0 + (np_rng.random((size, size, 1), dtype=np.float32) - 0.5) * 0.06
    return tex


def gen_utility(size=256):
    """工具 atlas 四象限：①警示斜纹（通用橙黑，不随楼染色）②消声劈尖（anechoic
    竖向楔条，门厅内壁声学叙事件）③纯粉板（身份色 #ff2d6f）④卷帘门横肋"""
    tex = np.zeros((size, size, 3), dtype=np.float32)
    half = size // 2
    orange = srgb(255, 107, 53)
    pink = srgb(255, 45, 111)
    dark = srgb(18, 20, 26)
    ys, xs = np.mgrid[0:half, 0:half]
    stripes = ((xs + ys) // 24) % 2 == 0
    tex[:half, :half][stripes] = orange
    tex[:half, :half][~stripes] = dark
    # ② 消声劈尖：竖向三角楔条（明暗锯齿 = 楔面受光），深灰蓝底
    saw = np.abs(((xs / 18.0) % 1.0) - 0.5) * 2.0  # 0..1 锯齿
    wedge = srgb(20, 24, 34)[None, None, :] * (0.45 + 0.9 * saw[:, :, None])
    wedge *= 0.82 + 0.18 * (ys[:, :, None] / half)  # 顶部略亮
    tex[:half, half:] = wedge
    tex[half:, :half] = pink * 0.92
    tex[half::24, :half] = pink * 0.55
    rib = ys % 20 < 4
    panel = np.tile(srgb(44, 50, 62)[None, None, :], (half, half, 1))
    panel[rib] = srgb(16, 18, 24)
    panel[:, :6, :] = srgb(12, 14, 18)
    panel[:, -6:, :] = srgb(12, 14, 18)
    tex[half:, half:] = panel
    return tex


print('[x1b] 生成程序化贴图 …')
img_windows = make_image('voicepod-windows', gen_windows_atlas())
img_panels = make_image('voicepod-panels', gen_panels())
img_utility = make_image('voicepod-utility', gen_utility())

# ----------------------------------------------------------------------------
# 材质（名字 = 运行时/审计对账键；与 BL1/BL2 合同仅差身份色两名 Orange/Blue→Pink）
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
    'Facade': make_material('Facade', metallic=0.3, roughness=0.66, base_tex=img_panels),
    'FacadeDark': make_material('FacadeDark', color=hexc(0x101018), metallic=0.55, roughness=0.6),
    'Window': make_material('Window', color=hexc(0x0a0c12), metallic=0.1, roughness=0.3,
                            emissive_tex=img_windows, emissive_strength=0.95),
    'MetalDark': make_material('MetalDark', color=hexc(0x232833), metallic=0.7, roughness=0.45),
    'Metal': make_material('Metal', color=hexc(0x5c6472), metallic=0.7, roughness=0.4),
    'AccentPink': make_material('AccentPink', color=hexc(0xff2d6f), metallic=0.0, roughness=0.5,
                                emissive=hexc(0xff2d6f), emissive_strength=0.85),
    'BeaconPink': make_material('BeaconPink', color=hexc(0xff2d6f), metallic=0.0, roughness=0.4,
                                emissive=hexc(0xff2d6f), emissive_strength=2.2),
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
UV_WEDGE = (0.52, 0.02, 0.98, 0.48)
UV_PINK = (0.02, 0.52, 0.48, 0.98)
UV_DOOR = (0.52, 0.52, 0.98, 0.98)
PANEL_UV = 1 / 12.0  # Facade 贴图 12m 平铺


# ----------------------------------------------------------------------------
# 幕墙生成器（BL1 同源：clear_rects 支持招牌避让区截断 + 0.05 凸暗背板）
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
    0.35，而竖梃/层间梁凸出 0.31 只留 4cm 会远距 z-fight：区内竖梃截断、层间梁分段
    让位，并铺一块 0.05 凸暗背板（灯箱浮空 0.30 净距）。"""
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
    """低模概念车壳：楔形车体 + 青罩座舱 + 尾灯粉条 + 盒式轮（~120 tri）——
    北橱窗「座舱试听间」展车（TTS Cockpit 叙事：楼=产品线帧内自明）"""
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
    BUFS['AccentPink'].quad(tail[0], tail[1], tail[2], tail[3], normal_hint=(hint[0], hint[1], 0))


# ----------------------------------------------------------------------------
# ① 裙房（0 – PODIUM_H）：基座 + 西门厅（消声劈尖内壁）+ 北座舱试听橱窗 + 南卷帘门
# —— 全部几何严格 |bx|,|by| ≤ 16（footprint 同笼，零基座外挑 → 零随楼道具碰撞体）
# ----------------------------------------------------------------------------
PW = 15.7               # 裙房墙半宽（塔身 ±16 微悬挑 0.3，玻璃裙房内收现代式）
POD_Z0, POD_Z1 = 0.5, PODIUM_H
FASCIA_H = 0.9
WALL_H = POD_Z1 - POD_Z0

print('[x1b] 建模：裙房 …')
# 底盘基座（下沉 0.1 咬合地坪；32×32 与 footprint 齐平——不出笼即不需要台阶碰撞体）
box(BUFS['Concrete'], 0, 0, -0.1, 32.0, 32.0, 0.6, uv_scale=PANEL_UV, faces='side_top')

# 南墙三段 + 服务卷帘门 bx∈[2.5,9.5]（背街面）
DOOR_X0, DOOR_X1 = 2.5, 9.5
wall_box((-PW + DOOR_X0) / 2, -PW + 0.4, POD_Z0, DOOR_X0 + PW, 0.8, WALL_H)
wall_box((DOOR_X1 + PW) / 2, -PW + 0.4, POD_Z0, PW - DOOR_X1, 0.8, WALL_H)
BUFS['Utility'].quad((DOOR_X0, -PW + 0.35, POD_Z0), (DOOR_X1, -PW + 0.35, POD_Z0),
                     (DOOR_X1, -PW + 0.35, POD_Z1 - FASCIA_H), (DOOR_X0, -PW + 0.35, POD_Z1 - FASCIA_H),
                     ((UV_DOOR[0], UV_DOOR[1]), (UV_DOOR[2], UV_DOOR[1]), (UV_DOOR[2], UV_DOOR[3]), (UV_DOOR[0], UV_DOOR[3])),
                     normal_hint=(0, -1, 0))
for dx in (DOOR_X0 - 0.25, DOOR_X1 + 0.25):
    box(BUFS['Utility'], dx, -PW + 0.25, POD_Z0, 0.4, 0.4, WALL_H - FASCIA_H, uv_rect=UV_HAZARD, faces='side_top')

# 东墙整面闭合（背街面）
wall_box(PW - 0.4, 0, POD_Z0, 0.8, PW * 2, WALL_H)

# 西墙：门厅开口 by∈[-4.2,4.2]，两侧实体墙 + 大堂橱窗条（贴墙 6cm 凸出）
ENT_Y0, ENT_Y1 = -4.2, 4.2
wall_box(-PW + 0.4, (PW + ENT_Y1) / 2, POD_Z0, 0.8, PW - ENT_Y1, WALL_H)
wall_box(-PW + 0.4, (-PW + ENT_Y0) / 2, POD_Z0, 0.8, ENT_Y0 + PW, WALL_H)
curtain_wall((-PW, ENT_Y1 + 0.6), (0, 1), (-1, 0), PW - ENT_Y1 - 1.4, POD_Z0 + 0.3, POD_Z1 - FASCIA_H,
             detailed=True, module_w=2.6, floor_h=WALL_H - FASCIA_H, spandrel_h=0.26,
             window_recess=-0.06, lobby=True)
curtain_wall((-PW, -PW + 0.8), (0, 1), (-1, 0), PW + ENT_Y0 - 1.4, POD_Z0 + 0.3, POD_Z1 - FASCIA_H,
             detailed=True, module_w=2.6, floor_h=WALL_H - FASCIA_H, spandrel_h=0.26,
             window_recess=-0.06, lobby=True)

# 门厅内凹（深 2.0）：暖光内顶 + 暗玻璃门面 + 两樘暖窗 + **消声劈尖侧壁**（声学叙事）
ENT_DEPTH = 2.0
ent_x = -PW + ENT_DEPTH
BUFS['InteriorWarm'].quad(
    (-PW, ENT_Y0, POD_Z1 - FASCIA_H), (ent_x, ENT_Y0, POD_Z1 - FASCIA_H),
    (ent_x, ENT_Y1, POD_Z1 - FASCIA_H), (-PW, ENT_Y1, POD_Z1 - FASCIA_H), normal_hint=(0, 0, -1))
BUFS['GlassDark'].quad((ent_x, ENT_Y0, POD_Z0), (ent_x, ENT_Y1, POD_Z0),
                       (ent_x, ENT_Y1, POD_Z1 - FASCIA_H), (ent_x, ENT_Y0, POD_Z1 - FASCIA_H),
                       normal_hint=(-1, 0, 0))
for wy in (-3.2, 0.8):
    u0, v0, u1, v1 = window_cell('warm')
    BUFS['Window'].quad((ent_x - 0.05, wy, POD_Z0 + 0.2), (ent_x - 0.05, wy + 2.4, POD_Z0 + 0.2),
                        (ent_x - 0.05, wy + 2.4, POD_Z1 - FASCIA_H - 0.35), (ent_x - 0.05, wy, POD_Z1 - FASCIA_H - 0.35),
                        ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(-1, 0, 0))
for sy in (ENT_Y0, ENT_Y1):  # 消声劈尖侧壁（Utility ② anechoic 楔条）
    inner = 1 if sy < 0 else -1
    BUFS['Utility'].quad((-PW, sy, POD_Z0), (ent_x, sy, POD_Z0),
                         (ent_x, sy, POD_Z1 - FASCIA_H), (-PW, sy, POD_Z1 - FASCIA_H),
                         ((UV_WEDGE[0], UV_WEDGE[1]), (UV_WEDGE[2], UV_WEDGE[1]),
                          (UV_WEDGE[2], UV_WEDGE[3]), (UV_WEDGE[0], UV_WEDGE[3])),
                         normal_hint=(0, inner, 0))
# 地面导入毯（暖光低发光条，抬 0.05 防 z-fight）
box(BUFS['InteriorWarm'], -PW + 0.9, 0, 0.05, 1.8, 7.6, 0.03, faces='side_top')

# 北墙（霓虹大街临街面）：座舱试听橱窗 bx∈[-11,-1] + 东段 TTS 波形屏 + 实体墙分段
VIT_X0, VIT_X1 = -11.0, -1.0
wall_box((-PW + VIT_X0) / 2, PW - 0.4, POD_Z0, VIT_X0 + PW, 0.8, WALL_H)
wall_box((VIT_X1 + PW) / 2, PW - 0.4, POD_Z0, PW - VIT_X1, 0.8, WALL_H)
# 座舱试听间：内凹 2.2 暖光展厅 + 展台 + 试听座舱车（车头朝街 yaw≈12°）
VIT_DEPTH = 2.2
vit_y = PW - VIT_DEPTH
BUFS['InteriorWarm'].quad(
    (VIT_X0, PW, POD_Z1 - FASCIA_H), (VIT_X0, vit_y, POD_Z1 - FASCIA_H),
    (VIT_X1, vit_y, POD_Z1 - FASCIA_H), (VIT_X1, PW, POD_Z1 - FASCIA_H), normal_hint=(0, 0, -1))
BUFS['InteriorWarm'].quad((VIT_X0, vit_y, POD_Z0), (VIT_X1, vit_y, POD_Z0),
                          (VIT_X1, vit_y, POD_Z1 - FASCIA_H), (VIT_X0, vit_y, POD_Z1 - FASCIA_H),
                          normal_hint=(0, 1, 0))
for sx in (VIT_X0, VIT_X1):
    box(BUFS['FacadeDark'], sx, (PW + vit_y) / 2, POD_Z0, 0.3, VIT_DEPTH, WALL_H - FASCIA_H, faces='side_top')
PLINTH_X, PLINTH_Y = (VIT_X0 + VIT_X1) / 2, PW - 1.3
box(BUFS['Concrete'], PLINTH_X, PLINTH_Y, POD_Z0, 5.2, 2.0, 0.35, uv_scale=PANEL_UV, faces='side_top')
car_shell(PLINTH_X, PLINTH_Y, POD_Z0 + 0.35, yaw=math.radians(168))
# 展台后壁环绕声阵列（小扬声器盒 ×5 + 状态灯）
for i in range(5):
    spx = VIT_X0 + 1.4 + i * 1.9
    box(BUFS['MetalDark'], spx, vit_y + 0.25, POD_Z0 + 2.3, 0.5, 0.3, 0.7, faces='all')
    box(BUFS['AccentPink'], spx, vit_y + 0.32, POD_Z0 + 3.05, 0.2, 0.16, 0.06, faces='all')
# 东段 TTS 波形直播屏（ScreenCyan 宽屏贴实体墙，proud 0.06）
BUFS['ScreenCyan'].quad((4.0, PW + 0.06, POD_Z0 + 1.0), (11.5, PW + 0.06, POD_Z0 + 1.0),
                        (11.5, PW + 0.06, POD_Z0 + 3.2), (4.0, PW + 0.06, POD_Z0 + 3.2),
                        normal_hint=(0, 1, 0))
box(BUFS['MetalDark'], 7.75, PW + 0.02, POD_Z0 + 0.85, 7.9, 0.1, 2.6, faces='side')

# 檐口（全周实体带，兼作裙房顶盖）+ 西/北粉识别线（身份色 LED，emissive 0.85 阈下）
box(BUFS['FacadeDark'], 0, 0, POD_Z1 - FASCIA_H, PW * 2 + 0.6, PW * 2 + 0.6, FASCIA_H,
    uv_scale=PANEL_UV, faces='side_top')
box(BUFS['AccentPink'], -PW - 0.36, 0, POD_Z1 - 0.42, 0.08, PW * 2 - 2, 0.12, faces='side')
box(BUFS['AccentPink'], 0, PW + 0.36, POD_Z1 - 0.42, PW * 2 - 2, 0.08, 0.12, faces='side')

# ----------------------------------------------------------------------------
# ② 主塔身（PODIUM_H – SHAFT_TOP）：西/北逐窗幕墙（招牌避让）+ 东/南条窗 +
#    扬声环鳍 ×3 + 均衡器 LED 光条带 + 西竖幅背板脊
# ----------------------------------------------------------------------------
print('[x1b] 建模：主塔身 …')
# 招牌避让区：
#   立面灯箱（BuildingSigns 街层灯箱挂高 min(8.5,max(6.4,0.18×42))≈7.6，面板高 ≈2.3
#   → z∈[6.2,9.0]，面板中心对齐楼心 → along = 16 ± 8）；
#   西墙楼身竖幅（primary slot 沿立面 +z(three) 偏 9.6 → by=−9.6 → along 6.4 ± 2.4，
#   底沿避让放宽至 z24 起——其上由竖幅背板脊承接）。
SIGN_Z = (6.2, 9.0)
curtain_wall((-HW, -HD), (0, 1), (-1, 0), D, PODIUM_H, SHAFT_TOP, detailed=True,
             clear_rects=[(HD - 8, HD + 8, SIGN_Z[0], SIGN_Z[1]), (4.0, 8.8, 24.0, SHAFT_TOP)])
curtain_wall((HW, HD), (-1, 0), (0, 1), W, PODIUM_H, SHAFT_TOP, detailed=True,
             clear_rects=[(HW - 8, HW + 8, SIGN_Z[0], SIGN_Z[1])])
curtain_wall((HW, HD), (0, -1), (1, 0), D, PODIUM_H, SHAFT_TOP, detailed=False)
curtain_wall((-HW, -HD), (1, 0), (0, -1), W, PODIUM_H, SHAFT_TOP, detailed=False)
# 遮视芯（防窗缝透视）
box(BUFS['FacadeDark'], 0, 0, PODIUM_H, W - 1.2, D - 1.2, SHAFT_TOP - PODIUM_H, faces='side')
# 四包角柱
for (cx, cy) in ((HW, HD), (-HW, HD), (HW, -HD), (-HW, -HD)):
    box(BUFS['MetalDark'], cx - math.copysign(0.2, cx), cy - math.copysign(0.2, cy), PODIUM_H,
        0.75, 0.75, SHAFT_TOP - PODIUM_H, faces='side')

# 扬声环鳍 ×3（MetalDark 全周环带，proud 0.25——「扬声器纸盆叠层」体量图腾）
for ring_z in (11.6, 17.4, 23.2):
    box(BUFS['MetalDark'], 0, 0, ring_z, W + 0.5, D + 0.5, 0.42, faces='all')
    # 环鳍下沿身份色细线（西/北临街两面，emissive 0.85 阈下）
    box(BUFS['AccentPink'], -HW - 0.28, 0, ring_z - 0.1, 0.06, D - 3, 0.08, faces='side')
    box(BUFS['AccentPink'], 0, HD + 0.28, ring_z - 0.1, W - 3, 0.06, 0.08, faces='side')

# 均衡器 LED 光条带（z 26.4 起，条高随 seed 变化——「声音可视化」立面叙事；
# 西墙跳过竖幅背板脊 by∈[−12,−7.2]；proud 0.14，emissive 0.85 阈下）
EQ_Z0 = 26.4
eq_positions = [-14.0, -12.2, -5.6, -3.8, -2.0, 0.0, 2.0, 3.8, 5.6, 7.4, 9.2, 11.0, 12.8, 14.4]
for by_ in eq_positions:
    if -12.6 <= by_ <= -6.6:
        continue  # 竖幅背板脊让位
    bar_h = 1.2 + rng.random() * 2.6
    box(BUFS['AccentPink'], -HW - 0.07, by_, EQ_Z0, 0.14, 0.5, bar_h, faces='all')
for bx_ in eq_positions:
    bar_h = 1.2 + rng.random() * 2.6
    box(BUFS['AccentPink'], bx_, HD + 0.07, EQ_Z0, 0.5, 0.14, bar_h, faces='all')

# 西竖幅背板脊（FacadeDark 竖向体量：幕墙区贴面 + 顶段独立升至 38.3 承接竖幅顶 37.8；
# BuildingSigns 竖幅 proud 0.35 → 背板面 proud 0.05 → 净距 0.30 同 BL1 口径）
box(BUFS['FacadeDark'], -HW + 0.25, -9.6, 24.0, 0.6, 4.8, 38.3 - 24.0, faces='side_top')
box(BUFS['AccentPink'], -HW - 0.10, -9.6 - 2.5, 24.6, 0.05, 0.12, 12.6, faces='side')
box(BUFS['AccentPink'], -HW - 0.10, -9.6 + 2.5, 24.6, 0.05, 0.12, 12.6, faces='side')

# ----------------------------------------------------------------------------
# ③ 波形天冠（SHAFT_TOP – 38.3）：女儿墙 + 身份色环带 + 四面「声波柱」参差剪影 +
#    内芯/顶盖——整帧远读的第一识别件（与 BL1 双阶收分 / BL2 鼓塔区分）
# ----------------------------------------------------------------------------
print('[x1b] 建模：波形天冠 …')
# 女儿墙压顶（幕墙顶封）
box(BUFS['FacadeDark'], 0, 0, SHAFT_TOP - 0.3, W + 0.35, D + 0.35, 0.75, uv_scale=PANEL_UV, faces='side_top')
# 天冠基线身份色环带（西/北临街两面 + 东/南补齐 = 全周，emissive 0.85 阈下）
box(BUFS['AccentPink'], -HW - 0.22, 0, SHAFT_TOP + 0.1, 0.08, D - 1.6, 0.14, faces='side')
box(BUFS['AccentPink'], HW + 0.22, 0, SHAFT_TOP + 0.1, 0.08, D - 1.6, 0.14, faces='side')
box(BUFS['AccentPink'], 0, HD + 0.22, SHAFT_TOP + 0.1, W - 1.6, 0.08, 0.14, faces='side')
box(BUFS['AccentPink'], 0, -HD - 0.22, SHAFT_TOP + 0.1, W - 1.6, 0.08, 0.14, faces='side')

# 声波柱（waveform skyline）：临街两面 12 柱细分参差、背街两面 6 柱粗分——
# 柱高确定性 seed 序列；西墙 by∈[−12,−7.2] 段由背板脊（38.3 恒高）占位
CROWN_Z0 = SHAFT_TOP + 0.45
wave_fine = [3.2, 5.6, 2.4, 6.8, 4.4, 7.4, 3.6, 6.2, 2.8, 5.0, 3.9, 6.6]
wave_coarse = [3.4, 5.8, 4.2, 6.4, 3.0, 5.2]
# 西面（12 柱，跳过背板脊区间）
for i, wh in enumerate(wave_fine):
    cy_ = -HD + 1.5 + i * (D - 3.0) / 11
    if -12.6 <= cy_ <= -6.6:
        continue
    box(BUFS['FacadeDark'], -HW + 0.55, cy_, CROWN_Z0, 1.0, 2.05, wh, faces='all')
    box(BUFS['AccentPink'], -HW + 0.02, cy_, CROWN_Z0 + wh - 0.5, 0.07, 1.1, 0.4, faces='side_top')
# 北面（12 柱）
for i, wh in enumerate(wave_fine):
    cx_ = -HW + 1.5 + (11 - i) * (W - 3.0) / 11
    box(BUFS['FacadeDark'], cx_, HD - 0.55, CROWN_Z0, 2.05, 1.0, wh, faces='all')
    box(BUFS['AccentPink'], cx_, HD - 0.02, CROWN_Z0 + wh - 0.5, 1.1, 0.07, 0.4, faces='side_top')
# 东/南背街面（6 柱粗分，无 LED）
for i, wh in enumerate(wave_coarse):
    cy_ = -HD + 3.0 + i * (D - 6.0) / 5
    box(BUFS['FacadeDark'], HW - 0.55, cy_, CROWN_Z0, 1.0, 3.4, wh, faces='all')
    cx_ = -HW + 3.0 + i * (W - 6.0) / 5
    box(BUFS['FacadeDark'], cx_, -HD + 0.55, CROWN_Z0, 3.4, 1.0, wh, faces='all')
# 天冠内芯 + 屋面设备台盖板
box(BUFS['FacadeDark'], 0, 0, SHAFT_TOP, W - 6.0, D - 6.0, CROWN_CAP - SHAFT_TOP, faces='side')
box(BUFS['Facade'], 0, 0, CROWN_CAP, W - 5.6, D - 5.6, 0.5, uv_scale=PANEL_UV, faces='side_top')

# ----------------------------------------------------------------------------
# ④ 屋面（CROWN_CAP+0.5）：机房 + 风机 + 桅杆信标——全部押反对角（bx=−by 侧），
#    楼顶全息板对角带（bx=by，中心 (0,0) 高 43.1+）让空；信标顶 41.75 ≤ 42 同笼
# ----------------------------------------------------------------------------
print('[x1b] 建模：屋面 …')
ROOF_Z = CROWN_CAP + 0.5
box(BUFS['Facade'], 5.6, -5.2, ROOF_Z, 5.4, 3.6, 1.7, uv_scale=PANEL_UV, faces='side_top')
box(BUFS['MetalDark'], 5.6, -5.2, ROOF_Z + 1.7, 4.8, 3.0, 0.25, faces='side_top')
for (vx, vy) in ((2.2, -8.0), (8.4, -1.6)):
    cylinder(BUFS['Metal'], vx, vy, ROOF_Z, 0.7, 0.7, 0.9, segments=12)
    cylinder(BUFS['MetalDark'], vx, vy, ROOF_Z + 0.9, 0.82, 0.45, 0.32, segments=12)
MAST_X, MAST_Y = -7.2, 7.2
cylinder(BUFS['Metal'], MAST_X, MAST_Y, ROOF_Z, 0.26, 0.15, 41.2 - ROOF_Z, segments=10)
box(BUFS['Metal'], MAST_X, MAST_Y, 39.6, 2.2, 0.15, 0.15, faces='side')
box(BUFS['BeaconPink'], MAST_X, MAST_Y, 41.25, 0.5, 0.5, 0.5, faces='all')

# ----------------------------------------------------------------------------
# 落地：逐材质建 mesh（一物一材质 → ≤13 draw call），全挂 Root
# ----------------------------------------------------------------------------
print('[x1b] 组装 mesh …')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

root = bpy.data.objects.new('VoicePodRoot', None)
bpy.context.collection.objects.link(root)

total_tris = 0
for name in MAT_ORDER:
    buf = BUFS[name]
    if not buf.faces:
        continue
    mesh = bpy.data.meshes.new(f'VP_{name}')
    mesh.from_pydata(buf.verts, [], buf.faces)
    mesh.validate()
    uv_layer = mesh.uv_layers.new(name='UVMap')
    li = 0
    for fi, face in enumerate(buf.faces):
        for corner in range(len(face)):
            uv_layer.data[li].uv = buf.uvs[fi][corner]
            li += 1
    mesh.materials.append(MATS[name])
    obj = bpy.data.objects.new(f'VP_{name}', mesh)
    obj.parent = root
    bpy.context.collection.objects.link(obj)
    tris = sum(len(f) - 2 for f in buf.faces)
    total_tris += tris
    print(f'[x1b]   {name:14s} faces={len(buf.faces):5d} tris={tris:6d}')

print(f'[x1b] 总三角形 ≈ {total_tris}（合同 ≤100k）')
assert total_tris <= 100_000, 'tri 超出 ≤100k 合同'

# 包络自检（严格同笼：|x|,|y| ≤ 16.35 竖梃/鳍容差、z ≤ 42——信标顶 41.75）
env_x = max(max(abs(v[0]) for v in BUFS[n].verts) for n in MAT_ORDER if BUFS[n].verts)
env_y = max(max(abs(v[1]) for v in BUFS[n].verts) for n in MAT_ORDER if BUFS[n].verts)
env_z = max(max(v[2] for v in BUFS[n].verts) for n in MAT_ORDER if BUFS[n].verts)
print(f'[x1b] 包络：|x|≤{env_x:.2f} |y|≤{env_y:.2f} z≤{env_z:.2f}（合同 16.35/16.35/42）')
assert env_x <= 16.35 and env_y <= 16.35 and env_z <= 42.0, '视觉包络出笼'

# ----------------------------------------------------------------------------
# 导出 GLB（未压缩原件；Draco/KTX2 压缩由 gltf-transform 管线完成）
# ----------------------------------------------------------------------------
out_glb = os.path.join(OUT_DIR, 'VoicePod-raw.glb')
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    export_apply=True,
    export_animations=False,
    export_yup=True,
    export_image_format='AUTO',
)
print(f'[x1b] 导出 {out_glb}（{os.path.getsize(out_glb) / 1024:.0f}KB 未压缩）')
