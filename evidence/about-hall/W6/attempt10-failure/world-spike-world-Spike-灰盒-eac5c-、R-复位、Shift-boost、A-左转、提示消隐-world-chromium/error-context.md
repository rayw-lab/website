# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: world-spike.spec.ts >> world Spike 灰盒试验场 >> WS-E2E-03 WASD 可驾驶：W 加速、空格刹停、R 复位、Shift boost、A 左转、提示消隐
- Location: e2e/world-spike.spec.ts:221:3

# Error details

```
Test timeout of 600000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - paragraph [ref=e4]: WORLD · 灰盒验证场（已归档）
    - heading "灰盒工程验证场 —— 概念车驾驶验证" [level=1] [ref=e5]
    - paragraph [ref=e6]:
      - text: 本页为工程验证入口（驾驶/物理 e2e 契约被测面），正式 3D 体验与内容导航请访问
      - link "科技城首页 /（Full Entry）→" [ref=e7] [cursor=pointer]:
        - /url: /website/
      - text: 。 验证口径不变：W/A/S/D 或方向键驾驶 CarConcept 概念车（触屏为虚拟摇杆）， WebGPU 优先、WebGL 2 自动回退，点击进入后才开始加载 3D 资源。 技术验证记录见
      - code [ref=e8]: docs/research/world-spike-log.md
      - text: 。
  - generic [ref=e10]:
    - generic "灰盒试验场：WASD/方向键驾驶概念车" [ref=e11]
    - generic:
      - generic:
        - generic: "56"
        - generic: km/h
      - generic:
        - generic: FPS 均值 / 1% low
        - generic: 2 / 0
      - generic:
        - generic: 锥桶
        - generic: 2/16
      - generic: WebGL 2
      - button [ref=e12] [cursor=pointer]: 复位 (R)
    - paragraph: W/A/S/D 或方向键驾驶 · Shift 加速 · 空格/B 刹车 · F 悬挂跳 · R 复位 · 触屏按住拖动为摇杆
    - generic:
      - generic:
        - heading "进入灰盒试验场" [level=2]
        - paragraph: 加载约 5.5 MB（CarConcept 3.5 MB 复用配置器资产 + HDRI + Rapier 物理 wasm 1.5 MB）· WebGPU 优先，WebGL 2 自动回退
        - button "进入试验场（实验性）"
    - generic:
      - generic:
        - paragraph: 碰撞 ×2
        - paragraph: 已复位 · 回到最近路口
    - button "静音音效" [ref=e13] [cursor=pointer]: 音效 ON
    - button "BGM 氛围垫" [ref=e14] [cursor=pointer]: BGM OFF
  - generic [ref=e15]:
    - heading "操作与验证口径" [level=2] [ref=e16]
    - list [ref=e17]:
      - listitem [ref=e18]:
        - strong [ref=e19]: 驾驶
        - text: ：W/↑ 前进 · S/↓ 倒车（行驶中先刹停再倒车）· A/D 或 ←/→ 转向 · Shift boost · 空格/B 刹车 · F 悬挂跳 · R 复位（整场：车 + 锥桶）。
      - listitem [ref=e20]:
        - strong [ref=e21]: 触屏
        - text: ：画面内按住拖动出现随车 3D 摇杆环（推离越远油门越大，环外扇区为倒车方向，内环点按 = 悬挂跳）；窄屏触屏不自动加载，需显式点击进入。
      - listitem [ref=e22]:
        - strong [ref=e23]: 场地
        - text: ：灰盒环形试车道（半径 10 m）+ 16 只 Rapier 动态锥桶（直道慢弯桩 4 + 环道 slalom 8 + 出弯双排门 4）；出生点 = 城市地图
        - code [ref=e24]: world.spawn
        - text: (0,0)，与机器人站位/变形落点同锚。
      - listitem [ref=e25]:
        - strong [ref=e26]: 车辆
        - text: ：默认 Rapier 物理车（folio 参数表原封，raycast vehicle + 可玩悬挂）；加
        - code [ref=e27]: "?vehicle=kinematic"
        - text: 切运动学回退档（wasm 加载失败时自动兜底；该档与锥桶无物理互动）。
      - listitem [ref=e28]:
        - strong [ref=e29]: 帧率读数
        - text: ：HUD 实时显示均值与 1% low；控制台
        - code [ref=e30]: __worldSpike.fps()
        - text: 可取数。双后端验证加
        - code [ref=e31]: "?gl=1"
        - text: 强制 WebGL 2；
        - code [ref=e32]: "#debug"
        - text: 暴露
        - code [ref=e33]: __worldSpikeGame
        - text: 句柄。
      - listitem [ref=e34]:
        - strong [ref=e35]: 科技城预览（CC-E3）
        - text: ：加
        - code [ref=e36]: "?city=1"
        - text: 挂载程序化科技城（十字路口 + 在册楼 + 剪影层，独立分包默认零城市字节）。
      - listitem [ref=e37]:
        - strong [ref=e38]: 机器人英雄（CC-E5）
        - text: ：加
        - code [ref=e39]: "?robot=1"
        - text: 于出生锚点实例化座舱 AI 机器人（Quaternius CC0 机甲换装钛灰/青/橙，Draco 338KB）：光柱显现 + Idle 呼吸灯 + 头部环顾；GLB 加载失败自动回退程序化块面机甲。
      - listitem [ref=e40]:
        - strong [ref=e41]: 门禁
        - text: ：世界新增美术资产（public/world/）= 0（全程序化灰盒）≤ 1 MB；CarConcept 3.5 MB 复用显式豁免（审计 P0-2）。
    - paragraph [ref=e42]:
      - text: 车模：
      - link "Khronos CarConcept" [ref=e43] [cursor=pointer]:
        - /url: https://github.com/KhronosGroup/glTF-Sample-Assets
      - text: （CC BY 4.0，Khronos Group + DGG）· 环境贴图：Poly Haven Studio Small 08（CC0）
```