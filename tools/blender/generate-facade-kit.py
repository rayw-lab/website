# CC-VIS-X2-FACADE-R2：城区立面套件 + 街角道具带 + 前景景框剪影 —— Blender 4.0 headless 生成脚本。
#
# 沿 BL1/BL2/X1b 已验证管线（Buf/box/cylinder 几何语言 + numpy 程序化贴图 + Draco/KTX2
# 压缩合同）产出**模块化构件套件**（BR X2「混合路径」：楼体保持程序化，构件经
# InstancedMesh 贴附）。本脚本是资产唯一源文件（零外部资产、零许可负担）：
#   blender -b --factory-startup -P tools/blender/generate-facade-kit.py -- --out /tmp/x2-asset
# 产出 /tmp/x2-asset/FacadeKit-raw.glb + 两张程序化 PNG（base 1024 / emissive 512，≤2K 合同）。
# 压缩管线见 public/models/facade-kit/README.md（gltf-transform etc1s → draco）。
#
# 套件清单（10 类构件 = 10 个具名单材质 mesh → 运行时每类 1 个 InstancedMesh = 1 draw call）：
#   立面件（贴附 CityBlocks 可见临街面，NDC 清单先行——README §NDC）：
#     KitCanopy    街层入口雨棚 6.0×1.9（暖光底面 + 青 LED 前缘，emissive ≤1）
#     KitAcCluster 空调外机组挂架 2.2×1.3（双机 + 滴水管）
#     KitPipeRun   竖向管线组 12m（双管 + 抱箍 + 阀箱；y 向可缩放；凸出 ≤0.28 不设碰撞）
#     KitBalcony   检修走台 4.0×1.1（栏杆 + 斜撑 + 青光条阈下）
#     KitLouver    百叶通风板 2.4×1.8（设备带用）
#     KitRoofVent  屋顶设备组 3.2×2.4（HVAC 箱 + 风机筒 + 天线桅 4.5——远景屋际线变化件）
#   街角道具带（StreetProps 消费，均带碰撞体注册表——README §碰撞）：
#     PropVending  自动售货亭 1.25×0.95×2.25（青屏 0.95 + 暖内光，均阈下）
#     PropCabinet  配电箱 1.5×0.7×1.7（通用工业警示纹——不随楼染色，A3 纪律）
#     PropBin      垃圾箱组 1.7×0.8×1.05（双桶 + 基座）
#   前景景框（ForegroundFraming 消费，D7：静态零循环配额）：
#     FramePipeBridge 跨路管线桥 34m（桁架 + 三管 + 吊缆 + 桅灯点阵阈下；
#                     腿柱 ±15.7 落路缘外，碰撞体 2 件——README §碰撞）
#
# 坐标契约：Blender X=东、Y=北、Z=上；glTF 导出 Y-up 自动换轴（three: x=bx, y=bz, z=−by）。
# 立面件本地原点 = 贴墙点（墙面 = y=0 平面，构件向 −Y 凸出 → three 侧 +Z，运行时按
# 立面法向旋转）；独立件（RoofVent/Prop*/Bridge）原点 = 底面中心。
#
# 色纪律（rubric A3）：只用既有三族色（暖白/青/暗）+ 通用工业橙黑警示纹；**不引入新色相、
# 不使用楼宇身份色**（套件跨楼共享，身份色归 BuildingSigns 域）。全部 emissive ≤1
#（bloom threshold=1 阈下）——零新增辉光锚（R2 不动 threshold 与 strength）。
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
OUT_DIR = '/tmp/x2-asset'
for i, a in enumerate(argv):
    if a == '--out' and i + 1 < len(argv):
        OUT_DIR = argv[i + 1]
os.makedirs(OUT_DIR, exist_ok=True)

SEED = 0x2FAC  # 确定性：同脚本同输出（与 BL1 0x1206 / BL2 0x2207 / X1b 0x2D6F 区分）
rng = random.Random(SEED)
np_rng = np.random.default_rng(SEED)


# ----------------------------------------------------------------------------
# 程序化贴图：base 1024（图集）+ emissive 512（同 UV 空间，非发光区纯黑）
# ----------------------------------------------------------------------------

def srgb(r, g, b):
    return np.array([r, g, b], dtype=np.float32) / 255.0


def make_image(name, arr):
    h, w, _ = arr.shape
    img = bpy.data.images.new(name, width=w, height=h, alpha=False)
    rgba = np.ones((h, w, 4), dtype=np.float32)
    rgba[:, :, :3] = np.clip(arr, 0.0, 1.0)
    img.pixels.foreach_set(rgba.ravel())
    img.filepath_raw = os.path.join(OUT_DIR, f'{name}.png')
    img.file_format = 'PNG'
    img.save()
    return img


# 图集区块（px，原点=左下；u=x/1024, v=y/1024）——base 与 emissive 共用同一 UV 空间
REGIONS = {
    'panel':   (0, 0, 512, 512),       # 深色金属板（板缝+雨渍+铆钉）
    'dark':    (512, 0, 768, 256),     # 近黑桁架金属
    'hazard':  (768, 0, 1024, 256),    # 工业橙黑警示斜纹（通用件，不随楼染色）
    'louver':  (512, 256, 1024, 512),  # 百叶横肋
    'ac':      (0, 512, 256, 768),     # 空调外机正面格栅
    'vending': (256, 512, 512, 768),   # 售货亭正面（货架窗+屏区）
    'cabinet': (512, 512, 768, 768),   # 配电箱双门
    'bin':     (768, 512, 1024, 768),  # 垃圾箱桶身
    'pipe':    (0, 768, 256, 1024),    # 管身金属（纵向拉丝）
    'canopy':  (256, 768, 512, 1024),  # 雨棚顶板
    'ledwarm': (512, 768, 640, 896),   # 暖白发光条（emissive 同区亮）
    'ledcyan': (640, 768, 768, 896),   # 青发光条（emissive 同区亮）
    'screen':  (512, 896, 768, 1024),  # 售货亭青屏内容
    'warm':    (768, 768, 1024, 1024), # 暖光面板（雨棚底面）
}

WARM_HI = srgb(255, 214, 158)
CYAN = srgb(73, 197, 182)   # #49c5b6 —— 既有青族（neon tokens 同源色相）
DARK = srgb(14, 16, 22)


def region_slice(tex, key):
    x0, y0, x1, y1 = REGIONS[key]
    return tex[y0:y1, x0:x1, :]


def gen_base_atlas(size=1024):
    tex = np.tile(srgb(20, 23, 31)[None, None, :], (size, size, 1)).astype(np.float32)

    # panel：板缝 + 值抖动 + 雨渍 + 铆钉（BL2 gen_panels 同构，区块内 6m 平铺假设）
    p = region_slice(tex, 'panel')
    ph, pw = p.shape[:2]
    p[:] = srgb(30, 34, 44)
    px_per_m = pw / 6.0
    bw, bh = int(1.1 * px_per_m), int(1.5 * px_per_m)
    for py in range(0, ph, bh):
        for px in range(0, pw, bw):
            p[py:py + bh, px:px + bw, :] *= 1.0 + rng.uniform(-0.10, 0.10)
    for py in range(0, ph, bh):
        p[py:py + 2, :, :] = srgb(11, 13, 18)
    for px in range(0, pw, bw):
        p[:, px:px + 2, :] = srgb(11, 13, 18)
    for _ in range(40):
        sx = rng.randint(0, pw - 3)
        sy = rng.randint(0, ph - 1) // bh * bh
        ln = rng.randint(bh // 2, bh * 2)
        st = rng.uniform(0.10, 0.28)
        for k in range(ln):
            y = (sy + k) % ph
            p[y, sx:sx + 2, :] *= 1 - st * (1 - k / ln)

    # dark：近黑桁架金属 + 焊缝微亮
    d = region_slice(tex, 'dark')
    d[:] = srgb(15, 17, 23)
    d[::28, :, :] = srgb(26, 30, 38)

    # hazard：橙黑斜纹（通用工业件）
    hz = region_slice(tex, 'hazard')
    hh, hw = hz.shape[:2]
    ys, xs = np.mgrid[0:hh, 0:hw]
    stripes = ((xs + ys) // 22) % 2 == 0
    hz[stripes] = srgb(255, 107, 53)
    hz[~stripes] = srgb(18, 20, 26)

    # louver：横肋（亮缘+暗槽）
    lv = region_slice(tex, 'louver')
    lh = lv.shape[0]
    lv[:] = srgb(24, 27, 35)
    for y in range(0, lh, 18):
        lv[y:y + 7, :, :] = srgb(38, 43, 54)
        lv[y + 7:y + 11, :, :] = srgb(8, 9, 13)

    # ac：外机格栅（横条 + 圆形风扇罩暗影 + 品牌暗块）
    ac = region_slice(tex, 'ac')
    ah, aw = ac.shape[:2]
    ac[:] = srgb(58, 63, 74)
    for y in range(0, ah, 10):
        ac[y:y + 4, :, :] = srgb(40, 44, 53)
    cy0, cx0, r = ah // 2, aw // 2, int(aw * 0.34)
    ys, xs = np.mgrid[0:ah, 0:aw]
    ring = np.abs(np.hypot(ys - cy0, xs - cx0) - r) < 3
    ac[ring] = srgb(22, 25, 31)
    ac[cy0 - 4:cy0 + 4, cx0 - 4:cx0 + 4, :] = srgb(22, 25, 31)

    # vending：正面三层货架窗（暖）+ 屏位（青）+ 出货口
    vd = region_slice(tex, 'vending')
    vh, vw = vd.shape[:2]
    vd[:] = srgb(26, 30, 40)
    for i, y0 in enumerate((int(vh * 0.55), int(vh * 0.68), int(vh * 0.81))):
        vd[y0:y0 + int(vh * 0.09), int(vw * 0.10):int(vw * 0.62), :] = WARM_HI * (0.55 - i * 0.08)
        for k in range(5):  # 货品剪影
            x0 = int(vw * (0.12 + k * 0.10))
            vd[y0:y0 + int(vh * 0.05), x0:x0 + int(vw * 0.05), :] *= 0.35
    vd[int(vh * 0.30):int(vh * 0.46), int(vw * 0.66):int(vw * 0.92), :] = CYAN * 0.35
    vd[int(vh * 0.08):int(vh * 0.20), int(vw * 0.10):int(vw * 0.50), :] = srgb(10, 12, 16)

    # cabinet：双门 + 铰链 + 警示小牌
    cb = region_slice(tex, 'cabinet')
    ch, cw = cb.shape[:2]
    cb[:] = srgb(44, 49, 60)
    cb[:, cw // 2 - 2:cw // 2 + 2, :] = srgb(16, 18, 24)
    cb[8:14, :, :] = srgb(16, 18, 24)
    cb[-14:-8, :, :] = srgb(16, 18, 24)
    for x0 in (cw // 4, 3 * cw // 4):
        cb[ch // 2 - 10:ch // 2 + 10, x0 - 3:x0 + 3, :] = srgb(20, 22, 28)
    cb[int(ch * 0.72):int(ch * 0.84), int(cw * 0.58):int(cw * 0.86), :] = srgb(255, 107, 53) * 0.85

    # bin：桶身竖条纹 + 顶缘
    bn = region_slice(tex, 'bin')
    bh_, bw_ = bn.shape[:2]
    bn[:] = srgb(33, 37, 46)
    for x in range(0, bw_, 24):
        bn[:, x:x + 10, :] = srgb(25, 28, 35)
    bn[-16:, :, :] = srgb(14, 16, 21)

    # pipe：纵向拉丝金属 + 锈渍
    pp = region_slice(tex, 'pipe')
    pph, ppw = pp.shape[:2]
    pp[:] = srgb(46, 50, 60)
    pp *= 1.0 + (np_rng.random((pph, 1, 1), dtype=np.float32) - 0.5) * 0.16
    for _ in range(12):
        x0 = rng.randint(0, ppw - 6)
        y0 = rng.randint(0, pph // 2)
        pp[y0:y0 + rng.randint(20, 60), x0:x0 + 5, :] *= 0.6

    # canopy：顶板肋条
    cn = region_slice(tex, 'canopy')
    cnh = cn.shape[0]
    cn[:] = srgb(21, 24, 32)
    for y in range(0, cnh, 32):
        cn[y:y + 5, :, :] = srgb(34, 38, 48)

    # led/screen/warm：base 给暗色打底（发光主要走 emissive）
    region_slice(tex, 'ledwarm')[:] = WARM_HI * 0.30
    region_slice(tex, 'ledcyan')[:] = CYAN * 0.30
    sc = region_slice(tex, 'screen')
    sc[:] = CYAN * 0.18
    region_slice(tex, 'warm')[:] = WARM_HI * 0.32

    tex *= 1.0 + (np_rng.random((size, size, 1), dtype=np.float32) - 0.5) * 0.05
    return tex


def gen_emissive_atlas(size=512):
    """emissive 图集（512，同 UV 空间坐标 ÷2）：非发光区纯黑；发光值全靠材质
    strength 0.95 阈下（threshold=1 之下，不入 bloom）。"""
    tex = np.zeros((size, size, 3), dtype=np.float32)

    def rg(key):
        x0, y0, x1, y1 = REGIONS[key]
        return tex[y0 // 2:y1 // 2, x0 // 2:x1 // 2, :]

    rg('ledwarm')[:] = WARM_HI
    rg('ledcyan')[:] = CYAN
    # 售货亭屏：青底 + 横向价签行
    sc = rg('screen')
    sc[:] = CYAN * 0.8
    sch = sc.shape[0]
    for y in range(6, sch, 14):
        sc[y:y + 4, 8:-8, :] = CYAN * 0.35
    # 暖光面板（雨棚底面/售货亭货架窗联动区）
    rg('warm')[:] = WARM_HI * 0.85
    # 售货亭正面：货架窗三行 + 屏位随 base 同坐标发光
    vd = rg('vending')
    vh, vw = vd.shape[:2]
    for i, y0 in enumerate((int(vh * 0.55), int(vh * 0.68), int(vh * 0.81))):
        vd[y0:y0 + int(vh * 0.09), int(vw * 0.10):int(vw * 0.62), :] = WARM_HI * (0.75 - i * 0.12)
    vd[int(vh * 0.30):int(vh * 0.46), int(vw * 0.66):int(vw * 0.92), :] = CYAN * 0.9
    return tex


print('[x2] 生成程序化贴图 …')
img_base = make_image('facade-kit-base', gen_base_atlas())
img_emissive = make_image('facade-kit-emissive', gen_emissive_atlas())

# ----------------------------------------------------------------------------
# 单材质（KitSurface）：全部构件共用 → 每类构件 1 primitive = 1 draw call
# ----------------------------------------------------------------------------
mat = bpy.data.materials.new('KitSurface')
mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Metallic'].default_value = 0.45
bsdf.inputs['Roughness'].default_value = 0.55
node_b = mat.node_tree.nodes.new('ShaderNodeTexImage')
node_b.image = img_base
mat.node_tree.links.new(node_b.outputs['Color'], bsdf.inputs['Base Color'])
node_e = mat.node_tree.nodes.new('ShaderNodeTexImage')
node_e.image = img_emissive
mat.node_tree.links.new(node_e.outputs['Color'], bsdf.inputs['Emission Color'])
bsdf.inputs['Emission Strength'].default_value = 0.95  # ≤1 阈下合同

# ----------------------------------------------------------------------------
# 几何缓冲（BL2 同款 Buf/box/cylinder；每构件独立 Buf → 独立具名 mesh）
# ----------------------------------------------------------------------------


class Buf:
    def __init__(self):
        self.verts = []
        self.faces = []
        self.uvs = []

    def quad(self, p0, p1, p2, p3, uv=((0, 0), (1, 0), (1, 1), (0, 1)), normal_hint=None):
        pts, uvq = [p0, p1, p2, p3], list(uv)
        if normal_hint is not None:
            e1 = tuple(p1[i] - p0[i] for i in range(3))
            e2 = tuple(p3[i] - p0[i] for i in range(3))
            n = (e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2],
                 e1[0] * e2[1] - e1[1] * e2[0])
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


def uvrect(key, inset=0.04):
    x0, y0, x1, y1 = REGIONS[key]
    w, h = (x1 - x0) / 1024.0, (y1 - y0) / 1024.0
    return (x0 / 1024.0 + w * inset, y0 / 1024.0 + h * inset,
            x1 / 1024.0 - w * inset, y1 / 1024.0 - h * inset)


def rot_z(p, ang, pivot=(0, 0)):
    if not ang:
        return p
    c, s = math.cos(ang), math.sin(ang)
    x, y = p[0] - pivot[0], p[1] - pivot[1]
    return (pivot[0] + x * c - y * s, pivot[1] + x * s + y * c, p[2] if len(p) > 2 else 0.0)


def box(buf, cx, cy, z0, sx, sy, sz, yaw=0.0, uv_rect=None, faces='all'):
    hx, hy = sx / 2, sy / 2
    z1 = z0 + sz
    c = [(cx - hx, cy - hy), (cx + hx, cy - hy), (cx + hx, cy + hy), (cx - hx, cy + hy)]
    if yaw:
        c = [rot_z((px, py), yaw, (cx, cy))[:2] for (px, py) in c]
    p = [(x, y, z0) for (x, y) in c] + [(x, y, z1) for (x, y) in c]
    u0, v0, u1, v1 = uv_rect or uvrect('dark')
    uvq = ((u0, v0), (u1, v0), (u1, v1), (u0, v1))
    buf.quad(p[0], p[1], p[5], p[4], uvq)
    buf.quad(p[1], p[2], p[6], p[5], uvq)
    buf.quad(p[2], p[3], p[7], p[6], uvq)
    buf.quad(p[3], p[0], p[4], p[7], uvq)
    if faces in ('all', 'side_top'):
        buf.quad(p[4], p[5], p[6], p[7], uvq)
    if faces == 'all':
        buf.quad(p[3], p[2], p[1], p[0], uvq)


def cylinder(buf, cx, cy, z0, r_bottom, r_top, height, segments=10, uv_rect=None,
             cap_top=True, cap_bottom=False):
    z1 = z0 + height
    pts_b, pts_t = [], []
    for i in range(segments):
        a = 2 * math.pi * i / segments
        pts_b.append((cx + r_bottom * math.cos(a), cy + r_bottom * math.sin(a), z0))
        pts_t.append((cx + r_top * math.cos(a), cy + r_top * math.sin(a), z1))
    u0, v0, u1, v1 = uv_rect or uvrect('pipe')
    for i in range(segments):
        j = (i + 1) % segments
        buf.quad(pts_b[i], pts_b[j], pts_t[j], pts_t[i], ((u0, v0), (u1, v0), (u1, v1), (u0, v1)))
    if cap_top:
        for i in range(1, segments - 1):
            buf.tri(pts_t[0], pts_t[i], pts_t[i + 1], ((u0, v0), (u1, v0), (u0, v1)))
    if cap_bottom:
        for i in range(1, segments - 1):
            buf.tri(pts_b[0], pts_b[i + 1], pts_b[i], ((u0, v0), (u1, v0), (u0, v1)))


def hpipe(buf, x0, x1, cy, cz, r, segments=8, uv_rect=None):
    """沿 X 轴水平管（桥面管线用）"""
    u0, v0, u1, v1 = uv_rect or uvrect('pipe')
    ring0, ring1 = [], []
    for i in range(segments):
        a = 2 * math.pi * i / segments
        ring0.append((x0, cy + r * math.cos(a), cz + r * math.sin(a)))
        ring1.append((x1, cy + r * math.cos(a), cz + r * math.sin(a)))
    for i in range(segments):
        j = (i + 1) % segments
        buf.quad(ring0[i], ring0[j], ring1[j], ring1[i], ((u0, v0), (u1, v0), (u1, v1), (u0, v1)))
    for i in range(1, segments - 1):  # 两端封口
        buf.tri(ring0[0], ring0[i + 1], ring0[i], ((u0, v0), (u1, v0), (u0, v1)))
        buf.tri(ring1[0], ring1[i], ring1[i + 1], ((u0, v0), (u1, v0), (u0, v1)))


PIECES = {}


def piece(name):
    PIECES[name] = Buf()
    return PIECES[name]


# ----------------------------------------------------------------------------
# 立面件（贴墙约定：墙面 = y=0 平面，构件向 −Y 凸出；原点 = 贴墙点底部中心）
# ----------------------------------------------------------------------------
print('[x2] 建模：立面件 …')

# —— KitCanopy 入口雨棚：暗板 6.0×1.9 + 暖光底面 + 青 LED 前缘 + 双拉杆 ——
b = piece('KitCanopy')
box(b, 0, -0.95, 0.30, 6.0, 1.9, 0.16, uv_rect=uvrect('canopy'), faces='side_top')
u0, v0, u1, v1 = uvrect('warm')
b.quad((-2.85, -1.82, 0.29), (2.85, -1.82, 0.29), (2.85, -0.08, 0.29), (-2.85, -0.08, 0.29),
       ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(0, 0, -1))  # 暖光底面
box(b, 0, -1.86, 0.30, 5.9, 0.08, 0.12, uv_rect=uvrect('ledcyan'), faces='side')  # LED 前缘
for sx in (-2.5, 2.5):  # 斜拉杆回锚立面
    box(b, sx, -0.9, 0.46, 0.09, 1.85, 0.09, yaw=0, uv_rect=uvrect('dark'), faces='side')
    box(b, sx, -0.05, 0.46, 0.12, 0.10, 1.15, uv_rect=uvrect('dark'), faces='side_top')

# —— KitAcCluster 空调外机挂架：托架 + 双机 + 滴水立管 ——
b = piece('KitAcCluster')
box(b, 0, -0.30, 0.0, 2.2, 0.60, 0.08, uv_rect=uvrect('dark'), faces='side_top')  # 托板
for sx in (-0.72, 0.72):  # 斜撑
    box(b, sx, -0.28, -0.42, 0.07, 0.52, 0.42, uv_rect=uvrect('dark'), faces='side')
for k, sx in enumerate((-0.56, 0.56)):  # 双机（正面=格栅区块）
    u0, v0, u1, v1 = uvrect('ac')
    x0, x1 = sx - 0.48, sx + 0.48
    b.quad((x0, -0.585, 0.10), (x1, -0.585, 0.10), (x1, -0.585, 0.92), (x0, -0.585, 0.92),
           ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(0, -1, 0))
    box(b, sx, -0.30, 0.08, 0.97, 0.56, 0.86, uv_rect=uvrect('panel', inset=0.3), faces='side_top')
box(b, 0.95, -0.12, 0.0, 0.06, 0.06, 1.28, uv_rect=uvrect('pipe'), faces='side_top')  # 滴水管

# —— KitPipeRun 竖向管线组（高 12，可 y 向缩放；凸出 ≤0.28 → 不设碰撞合同）——
b = piece('KitPipeRun')
cylinder(b, -0.20, -0.14, 0.0, 0.13, 0.13, 12.0, segments=8, cap_top=True)
cylinder(b, 0.16, -0.11, 0.0, 0.08, 0.08, 12.0, segments=8, cap_top=True)
for z in (1.0, 4.0, 7.0, 10.0):  # 抱箍
    box(b, 0, -0.12, z, 0.66, 0.24, 0.10, uv_rect=uvrect('dark'), faces='all')
box(b, -0.20, -0.26, 1.35, 0.34, 0.24, 0.46, uv_rect=uvrect('cabinet', inset=0.2), faces='all')  # 阀箱
box(b, -0.20, -0.385, 1.47, 0.10, 0.02, 0.10, uv_rect=uvrect('ledcyan'), faces='side')  # 阀位指示

# —— KitBalcony 检修走台：平台 + 三面栏杆 + 斜撑 + 底缘青光条 ——
b = piece('KitBalcony')
box(b, 0, -0.55, 0.0, 4.0, 1.1, 0.10, uv_rect=uvrect('panel', inset=0.2), faces='all')
for sx in (-1.9, 1.9):
    box(b, sx, -0.55, -0.55, 0.08, 0.95, 0.55, uv_rect=uvrect('dark'), faces='side')  # 斜撑
rail_uv = uvrect('dark')
for (px, py) in ((-1.96, -0.55), (1.96, -0.55)):
    box(b, px, py, 0.10, 0.06, 1.06, 0.98, uv_rect=rail_uv, faces='side_top')  # 端柱
for py in (-1.06,):
    box(b, 0, py, 0.10, 3.98, 0.06, 0.98, uv_rect=rail_uv, faces='side_top')  # 前栏板（半透视栏杆简化为板）
box(b, 0, -1.10, 0.02, 3.9, 0.05, 0.06, uv_rect=uvrect('ledcyan'), faces='side')  # 底缘光条

# —— KitLouver 百叶板 2.4×1.8 + 边框 ——
b = piece('KitLouver')
u0, v0, u1, v1 = uvrect('louver')
b.quad((-1.2, -0.10, 0.0), (1.2, -0.10, 0.0), (1.2, -0.10, 1.8), (-1.2, -0.10, 1.8),
       ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(0, -1, 0))
box(b, 0, -0.06, -0.06, 2.52, 0.12, 0.06, uv_rect=uvrect('dark'), faces='side_top')
box(b, 0, -0.06, 1.80, 2.52, 0.12, 0.06, uv_rect=uvrect('dark'), faces='side_top')
box(b, -1.23, -0.06, 0.0, 0.06, 0.12, 1.8, uv_rect=uvrect('dark'), faces='side')
box(b, 1.23, -0.06, 0.0, 0.06, 0.12, 1.8, uv_rect=uvrect('dark'), faces='side')

# —— KitRoofVent 屋顶设备组（独立件，原点=底面中心）——
b = piece('KitRoofVent')
box(b, 0, 0, 0.0, 3.2, 2.4, 0.18, uv_rect=uvrect('dark'), faces='side_top')  # 底座 skid
box(b, -0.45, 0, 0.18, 2.1, 1.6, 1.35, uv_rect=uvrect('panel', inset=0.15), faces='side_top')  # HVAC 箱
box(b, -0.45, 0, 1.53, 1.9, 1.4, 0.14, uv_rect=uvrect('dark'), faces='side_top')
cylinder(b, 1.05, -0.5, 0.18, 0.42, 0.36, 1.05, segments=10)  # 风机筒
cylinder(b, 1.05, 0.62, 0.18, 0.30, 0.30, 0.72, segments=8)
cylinder(b, 1.28, 0.86, 0.18, 0.045, 0.035, 4.5, segments=6, uv_rect=uvrect('dark'))  # 天线桅
box(b, 1.28, 0.86, 4.42, 0.34, 0.05, 0.22, uv_rect=uvrect('dark'), faces='all')  # 横担
box(b, 1.28, 0.86, 4.70, 0.10, 0.10, 0.10, uv_rect=uvrect('ledwarm'), faces='all')  # 桅顶警灯（阈下）

# ----------------------------------------------------------------------------
# 街角道具带（独立件，原点=底面中心；碰撞体注册表见 README §碰撞）
# ----------------------------------------------------------------------------
print('[x2] 建模：街角道具带 …')

# —— PropVending 自动售货亭 ——
b = piece('PropVending')
box(b, 0, 0, 0.0, 1.25, 0.95, 0.12, uv_rect=uvrect('dark'), faces='side_top')  # 基座
box(b, 0, 0.05, 0.12, 1.25, 0.85, 2.05, uv_rect=uvrect('panel', inset=0.25), faces='side_top')  # 柜体
u0, v0, u1, v1 = uvrect('vending')
b.quad((-0.56, -0.43, 0.24), (0.56, -0.43, 0.24), (0.56, -0.43, 2.05), (-0.56, -0.43, 2.05),
       ((u0, v0), (u1, v0), (u1, v1), (u0, v1)), normal_hint=(0, -1, 0))  # 正面（货架+屏，emissive 同区）
box(b, 0, 0.05, 2.17, 1.29, 0.89, 0.10, uv_rect=uvrect('dark'), faces='side_top')  # 顶檐

# —— PropCabinet 配电箱 ——
b = piece('PropCabinet')
box(b, 0, 0, 0.0, 1.6, 0.8, 0.10, uv_rect=uvrect('hazard'), faces='side_top')  # 警示基座
box(b, 0, 0, 0.10, 1.5, 0.7, 1.52, uv_rect=uvrect('cabinet', inset=0.06), faces='side_top')  # 箱体
box(b, 0, 0, 1.62, 1.56, 0.76, 0.08, uv_rect=uvrect('dark'), faces='side_top')  # 顶盖
cylinder(b, 0.55, 0.28, 1.70, 0.03, 0.03, 0.55, segments=6, uv_rect=uvrect('dark'))  # 出线管

# —— PropBin 垃圾箱组（双桶 + 基座）——
b = piece('PropBin')
box(b, 0, 0, 0.0, 1.7, 0.8, 0.08, uv_rect=uvrect('dark'), faces='side_top')
for sx in (-0.42, 0.42):
    cylinder(b, sx, 0, 0.08, 0.30, 0.28, 0.92, segments=10, uv_rect=uvrect('bin'))
    cylinder(b, sx, 0, 1.00, 0.31, 0.31, 0.06, segments=10, uv_rect=uvrect('dark'))

# ----------------------------------------------------------------------------
# 前景景框：FramePipeBridge 跨路管线桥（D7 静态剪影；跨 34m，腿柱 ±15.7）
# ----------------------------------------------------------------------------
print('[x2] 建模：前景管线桥 …')
b = piece('FramePipeBridge')
SPAN_HALF = 17.0
LEG_X = 15.7
DECK_Z = 13.4

# 腿柱 ×2：格构塔（四角柱 + 横缀条 + 警示基座）——碰撞体 half [0.62, 6.7, 0.62]
for sx in (-LEG_X, LEG_X):
    box(b, sx, 0, 0.0, 1.5, 1.5, 0.5, uv_rect=uvrect('hazard'), faces='side_top')  # 基座
    for (dx, dy) in ((-0.45, -0.45), (0.45, -0.45), (-0.45, 0.45), (0.45, 0.45)):
        box(b, sx + dx, dy, 0.5, 0.18, 0.18, DECK_Z - 0.5, uv_rect=uvrect('dark'), faces='side')
    for z in (3.4, 6.6, 9.8, 12.6):  # 横缀条
        box(b, sx, 0, z, 1.08, 0.10, 0.10, uv_rect=uvrect('dark'), faces='all')
        box(b, sx, 0, z, 0.10, 1.08, 0.10, uv_rect=uvrect('dark'), faces='all')
    box(b, sx, 0, DECK_Z - 0.10, 1.3, 1.3, 0.10, uv_rect=uvrect('dark'), faces='side_top')  # 柱顶托板
    box(b, sx, -0.66, DECK_Z + 1.9, 0.14, 0.03, 0.14, uv_rect=uvrect('ledwarm'), faces='all')  # 桅位警灯（阈下）

# 桥面桁架：上下弦 + 竖杆 + 斜腹杆（沿 X 一段一段，剪影可读的镂空节奏）
CHORD_UV = uvrect('dark')
box(b, 0, 0, DECK_Z, 2 * SPAN_HALF, 1.35, 0.14, uv_rect=uvrect('panel', inset=0.3), faces='side_top')  # 走道板
for cy in (-0.62, 0.62):
    box(b, 0, cy, DECK_Z + 0.14, 2 * SPAN_HALF, 0.12, 0.12, uv_rect=CHORD_UV, faces='all')       # 下弦
    box(b, 0, cy, DECK_Z + 1.68, 2 * SPAN_HALF, 0.12, 0.12, uv_rect=CHORD_UV, faces='all')       # 上弦
    step = 2.6
    n = int((2 * SPAN_HALF) / step)
    for i in range(n + 1):
        x = -SPAN_HALF + i * step
        if abs(x) > SPAN_HALF - 0.1:
            x = math.copysign(SPAN_HALF - 0.1, x)
        box(b, x, cy, DECK_Z + 0.26, 0.10, 0.10, 1.42, uv_rect=CHORD_UV, faces='side')            # 竖杆
    for i in range(n):  # 斜腹杆（交替方向）
        x0 = -SPAN_HALF + i * step
        mid = x0 + step / 2
        dz = 1.42
        dirn = 1 if i % 2 == 0 else -1
        # 斜杆以 yaw 无法表达（XZ 面内斜），用两点 quad 条带
        u0, v0, u1, v1 = CHORD_UV
        xa, xb = (x0 + 0.1, x0 + step - 0.1) if dirn > 0 else (x0 + step - 0.1, x0 + 0.1)
        b.quad((xa, cy - 0.04, DECK_Z + 0.26), (xb, cy - 0.04, DECK_Z + 0.26 + dz),
               (xb, cy + 0.04, DECK_Z + 0.26 + dz), (xa, cy + 0.04, DECK_Z + 0.26),
               ((u0, v0), (u1, v0), (u1, v1), (u0, v1)))

# 三管（主视觉件：粗管 + 双细管，管箍分段）
hpipe(b, -SPAN_HALF, SPAN_HALF, 0.0, DECK_Z + 0.62, 0.34, segments=10)
hpipe(b, -SPAN_HALF, SPAN_HALF, -0.42, DECK_Z + 0.98, 0.17, segments=8)
hpipe(b, -SPAN_HALF, SPAN_HALF, 0.44, DECK_Z + 1.12, 0.13, segments=8)
for x in (-12.4, -6.2, 0.0, 6.2, 12.4):  # 管箍环
    box(b, x, 0, DECK_Z + 0.22, 0.16, 1.30, 1.30, uv_rect=CHORD_UV, faces='side')

# 中跨警灯双点（阈下暖白，桥剪影的「呼吸感」由静态点阵而非动画承担——零循环配额）
for x in (-5.2, 5.2):
    box(b, x, -0.70, DECK_Z + 1.86, 0.12, 0.03, 0.12, uv_rect=uvrect('ledwarm'), faces='all')

# 吊缆（catenary 近似：三段折线薄带 ×2 组，垂在桥侧——顶带装饰，不垂入路空）
u0, v0, u1, v1 = uvrect('dark')
for (xc, drop) in ((-9.0, 1.4), (9.6, 1.1)):
    xs = (xc - 2.4, xc - 0.8, xc + 0.8, xc + 2.4)
    zs = (DECK_Z + 0.55, DECK_Z + 0.55 - drop * 0.8, DECK_Z + 0.55 - drop, DECK_Z + 0.55 - drop * 0.55)
    for k in range(3):
        b.quad((xs[k], -0.70, zs[k]), (xs[k + 1], -0.70, zs[k + 1]),
               (xs[k + 1], -0.64, zs[k + 1] + 0.06), (xs[k], -0.64, zs[k] + 0.06),
               ((u0, v0), (u1, v0), (u1, v1), (u0, v1)))

# ----------------------------------------------------------------------------
# 落地：逐构件建具名 mesh（同一 KitSurface 材质 → 每构件 1 primitive）
# ----------------------------------------------------------------------------
print('[x2] 组装 mesh …')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

root = bpy.data.objects.new('FacadeKitRoot', None)
bpy.context.collection.objects.link(root)

total_tris = 0
for name, buf in PIECES.items():
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(buf.verts, [], buf.faces)
    mesh.validate()
    uv_layer = mesh.uv_layers.new(name='UVMap')
    li = 0
    for fi, face in enumerate(buf.faces):
        for corner in range(len(face)):
            uv_layer.data[li].uv = buf.uvs[fi][corner]
            li += 1
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    obj.parent = root
    bpy.context.collection.objects.link(obj)
    tris = sum(len(f) - 2 for f in buf.faces)
    total_tris += tris
    xs = [v[0] for v in buf.verts]
    ys = [v[1] for v in buf.verts]
    zs = [v[2] for v in buf.verts]
    print(f'[x2]   {name:16s} tris={tris:5d}  bbox x[{min(xs):+6.2f},{max(xs):+6.2f}] '
          f'y[{min(ys):+6.2f},{max(ys):+6.2f}] z[{min(zs):+6.2f},{max(zs):+6.2f}]')

print(f'[x2] 构件 {len(PIECES)} 类，总三角形 ≈ {total_tris}（合同 ≤100k）')
assert total_tris <= 100_000, 'tri 超出 ≤100k 合同'
assert len(PIECES) == 10, '构件数合同 = 10 类（6 立面 + 3 道具 + 1 景框）'

# ----------------------------------------------------------------------------
# 导出 GLB（未压缩原件；Draco/KTX2 压缩由 gltf-transform 管线完成）
# ----------------------------------------------------------------------------
out_glb = os.path.join(OUT_DIR, 'FacadeKit-raw.glb')
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    export_apply=True,
    export_animations=False,
    export_yup=True,
    export_image_format='AUTO',
)
print(f'[x2] 导出 {out_glb}（{os.path.getsize(out_glb) / 1024:.0f}KB 未压缩）')
