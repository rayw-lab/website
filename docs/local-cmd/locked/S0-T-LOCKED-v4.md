# LOCKED · S0-T「桥」首屏 Hero · 卡通 3D · v4（2026-09-03 16:13 · 磊哥选 A）

继承 v3（输入 = 瘦身首帧 `S0-T/slim/first-v2-3-slim.png`；first/last/negative 不变）。变更：**motion 改为零头部动作**。
依据：i2v #1 `clip-v2-1`、#2 `clip-v2-2` 均因头转 70–80° 成侧脸 REJECT；两次同模式 = 模型不服从头部角度约束，第 3 次（最后配额）不再赌"小转头"。

## motion prompt（duration 6）

```text
Static locked camera, no zoom, no pan, no dolly. The man stands perfectly still on the bridge deck in the right third of the frame, arms crossed, facing the camera the entire time; his head does not turn at all and his eyes stay on the camera; the only motion on him is a slow calm breath (chest and shoulders rise and fall very slightly), one natural eye blink around the middle, and the tips of his hair moving faintly in a light breeze. All visible motion is in the environment: the fiber-optic cables pulse with cyan light flowing steadily from the far left server hall toward the warm city on the right, tiny bright particles drift along the cables, and the volumetric haze in the left third drifts very slowly. Nothing enters or leaves the frame; the left third stays empty midnight-blue sky throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses or hands; no flicker; no head turn; no profile view.
```

## 审计硬门（追加）
- 抽 0/2/4/6s：四帧人物头部朝向与首帧一致（双镜片、双眼全程可见），头部 bbox 位移 < 2% 画幅；任一帧侧脸/转头 = REJECT。
- 光缆区域帧间必须有可见变化（不是静帧循环）：相邻抽帧光缆区 ΔRGB mean > 1.0。
- 配额：第 3/3 次。REJECT 则该叶熔断，首屏走静帧 poster（ADR-3 决策 C 合法降级）+ 6s 环境微动由 CSS 做（W8 债），不再重开。
- GO=yes
