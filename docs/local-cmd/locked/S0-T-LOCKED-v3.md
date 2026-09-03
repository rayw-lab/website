# LOCKED · S0-T「桥」首屏 Hero · 卡通 3D · v3（2026-09-03 14:05 · 磊哥人拣后）

继承 v2 全部内容（first/last/negative/硬门不变），仅两处变更：

1. **输入帧 = 瘦身版**：`S0-T/slim/first-v2-3-slim.png`（AH-W1f 审计 PASS 后启用）；last 基准同批 `last-v2-1-slim.png`。磊哥 2026-09-03 13:47 人拣：真人路线终止，T 转正，体型偏瘦。
2. **motion 收紧**（i2v 第 1 次 `clip-v2-1` 审计 REJECT：头转 70–80° 到全侧脸；本项目叶级配额 3 次，已用 1）：

```text
Static locked camera, no zoom, no pan, no dolly. The man stays planted on the bridge deck in the right third of the frame with arms crossed and his face stays toward the camera the whole time; over six seconds his head turns only very slightly, no more than fifteen degrees, toward his own left (screen left), so that both eyes and both lenses of his glasses remain fully visible in every frame, then holds still; shoulders do not move. The fiber-optic cables pulse slowly with cyan light flowing left to right at constant speed. Volumetric haze drifts very slightly. Nothing enters or leaves the frame; the left third of the frame stays empty midnight-blue sky throughout. Stylized 3D animated-film look maintained in every frame; no morphing of face, glasses or hands; no flicker. No profile view, no turning away from the camera.
```

审计追加硬门：抽 0/2/4/6s 四帧，任一帧只见单侧镜片 = REJECT（主体漂移）。
- GO=待 W1f slim 审计 PASS
