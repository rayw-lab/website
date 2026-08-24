#!/usr/bin/env python3
"""构建期 TTS 预生成脚本（路线A 座舱演示 · MVP）。

读取 scripts/tts-corpus.json，用 eSpeak NG（离线开源引擎，无需任何 API Key）
为每个「场景 × 语种」合成一条助手播报，产出：

  public/demo/tts/<scene>/<locale>.mp3            音频（22.05kHz 单声道 48kbps）
  public/demo/tts/<scene>/<locale>.timeline.json  词级时间戳 + 分段动作 + 波形峰值
  src/data/tts-manifest.json                      前端构建期引入的语种/场景清单

词级时间戳来自 espeak 库的 WORD 边界事件（等价于 Azure WordBoundary 的
离线替代）；分段动作时间点由「语料分段的字符偏移 → 事件锚点插值」得到，
对应调研文档 4.2 节的 bookmark 语义标记思路。

运行前置（Ubuntu）：
  sudo apt-get install -y espeak-ng ffmpeg
  # 中文依赖系统自带的 cmn-latn-pinyin voice（汉字→拼音→音素）。

用法：
  python3 scripts/generate-tts.py            # 全量生成
  python3 scripts/generate-tts.py --check    # 只做合成校验，不写文件
"""

from __future__ import annotations

import ctypes
import json
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CORPUS_PATH = ROOT / "scripts" / "tts-corpus.json"
OUT_DIR = ROOT / "public" / "demo" / "tts"
MANIFEST_PATH = ROOT / "src" / "data" / "tts-manifest.json"

SPEECH_RATE_WPM = 160  # 默认 175 略快，演示取更从容的语速
PEAK_INTERVAL_MS = 50  # 波形峰值采样间隔（AnalyserNode 不可用时的降级数据）
MP3_BITRATE = "32k"

# ---------------------------------------------------------------- espeak ctypes

EVENT_LIST_TERMINATED = 0
EVENT_WORD = 1
EVENT_SENTENCE = 2
EVENT_END = 5


class EspeakEvent(ctypes.Structure):
    class _Id(ctypes.Union):
        _fields_ = [
            ("number", ctypes.c_int),
            ("name", ctypes.c_char_p),
            ("string", ctypes.c_char * 8),
        ]

    _fields_ = [
        ("type", ctypes.c_int),
        ("unique_identifier", ctypes.c_uint),
        ("text_position", ctypes.c_int),   # 1-based，按字符计
        ("length", ctypes.c_int),          # 词长，按字符计
        ("audio_position", ctypes.c_int),  # 毫秒
        ("sample", ctypes.c_int),
        ("user_data", ctypes.c_void_p),
        ("id", _Id),
    ]


CALLBACK_T = ctypes.CFUNCTYPE(
    ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.POINTER(EspeakEvent)
)


class EspeakVoice(ctypes.Structure):
    _fields_ = [
        ("name", ctypes.c_char_p),
        ("languages", ctypes.c_char_p),
        ("identifier", ctypes.c_char_p),
        ("gender", ctypes.c_ubyte),
        ("age", ctypes.c_ubyte),
        ("variant", ctypes.c_ubyte),
        ("xx1", ctypes.c_ubyte),
        ("score", ctypes.c_int),
        ("spare", ctypes.c_void_p),
    ]


class Synth:
    """espeak-ng 同步合成器：返回 PCM 与词/句边界事件。"""

    def __init__(self) -> None:
        self.lib = ctypes.CDLL("libespeak-ng.so.1")
        # AUDIO_OUTPUT_SYNCHRONOUS = 2：espeak_Synth 返回前通过回调交付全部音频
        self.rate = self.lib.espeak_Initialize(2, 0, None, 0)
        if self.rate <= 0:
            raise RuntimeError("espeak_Initialize failed")
        self._samples = bytearray()
        self._events: list[tuple[int, int, int, int]] = []
        self._cb = CALLBACK_T(self._on_synth)
        self.lib.espeak_SetSynthCallback(self._cb)
        self.lib.espeak_SetParameter(1, SPEECH_RATE_WPM, 0)  # espeakRATE = 1

    def _on_synth(self, wav, numsamples, events) -> int:
        if wav and numsamples > 0:
            self._samples.extend(ctypes.string_at(wav, numsamples * 2))
        i = 0
        while True:
            ev = events[i]
            if ev.type == EVENT_LIST_TERMINATED:
                break
            if ev.type in (EVENT_WORD, EVENT_SENTENCE, EVENT_END):
                self._events.append((ev.type, ev.text_position, ev.length, ev.audio_position))
            i += 1
        return 0

    def set_voice(self, voice: str) -> None:
        if self.lib.espeak_SetVoiceByName(voice.encode()) == 0:
            return
        # 名称解析失败时按语言属性匹配（等价 CLI 的 -v 解析路径）
        v = EspeakVoice()
        v.languages = voice.encode()
        if self.lib.espeak_SetVoiceByProperties(ctypes.byref(v)) == 0:
            return
        raise RuntimeError(f"voice not found: {voice}")

    def synth(self, voice: str, text: str) -> tuple[bytes, list[tuple[int, int, int, int]]]:
        self.set_voice(voice)
        self._samples = bytearray()
        self._events = []
        data = text.encode("utf-8")
        # position_type=POS_CHARACTER(1)，flags=espeakCHARS_UTF8(1)
        self.lib.espeak_Synth(data, len(data) + 1, 0, 1, 0, 1, None, None)
        self.lib.espeak_Synchronize()
        return bytes(self._samples), list(self._events)


# ---------------------------------------------------------------- timeline 构建


def is_wordish(s: str) -> bool:
    return any(unicodedata.category(c)[0] in ("L", "N") for c in s)


def build_timeline(text: str, events, duration_ms: int, segments_src):
    """由 espeak 事件构建词级/分段时间轴。

    锚点 = WORD 事件（字符位 → 毫秒）；缺锚点的 token（个别语种分词稀疏，
    如泰语）按字符偏移在相邻锚点间线性插值——对应调研 8.3 的降级预案。
    """
    n = len(text)
    anchors: dict[int, int] = {0: 0}
    word_starts: set[int] = set()
    for typ, pos, length, ms in events:
        cpos = pos - 1
        if typ == EVENT_WORD and 0 <= cpos < n and length > 0:
            anchors[cpos] = min(anchors.get(cpos, ms), ms)
            word_starts.add(cpos)
        elif typ == EVENT_END and 0 <= cpos <= n:
            anchors[cpos] = min(anchors.get(cpos, ms), ms)
    anchors[n] = min(anchors.get(n, duration_ms), duration_ms)

    a_pos = sorted(anchors)
    a_time = []
    t_prev = 0
    for p in a_pos:  # 时间单调化
        t_prev = max(t_prev, anchors[p])
        a_time.append(t_prev)

    def time_at(cpos: int) -> int:
        if cpos <= a_pos[0]:
            return a_time[0]
        for i in range(1, len(a_pos)):
            if cpos <= a_pos[i]:
                p0, p1 = a_pos[i - 1], a_pos[i]
                t0, t1 = a_time[i - 1], a_time[i]
                if cpos == p1 or p1 == p0:
                    return t1
                return round(t0 + (t1 - t0) * (cpos - p0) / (p1 - p0))
        return a_time[-1]

    # 分段字符区间（语料各分段直接拼接而成）
    seg_bounds = []
    off = 0
    for seg in segments_src:
        seg_bounds.append((off, off + len(seg)))
        off += len(seg)
    assert off == n, "segments must concatenate to full text"

    # token 边界 = 空白分词起点 ∪ espeak 词事件起点 ∪ 分段起点
    starts = {m.start() for m in re.finditer(r"\S+", text)}
    starts |= word_starts
    starts |= {s for s, _ in seg_bounds}
    bounds = sorted(p for p in starts if 0 <= p < n)
    if not bounds:
        bounds = [0]

    raw_tokens = []
    for i, s in enumerate(bounds):
        e = bounds[i + 1] if i + 1 < len(bounds) else n
        seg_text = text[s:e]
        stripped = seg_text.strip()
        if not stripped:
            continue
        s2 = s + (len(seg_text) - len(seg_text.lstrip()))
        e2 = s2 + len(stripped)
        raw_tokens.append([s2, e2])

    tokens: list[list[int]] = []
    for tok in raw_tokens:  # 纯标点并入前一个 token
        if tokens and not is_wordish(text[tok[0]:tok[1]]):
            tokens[-1][1] = tok[1]
        else:
            tokens.append(tok)

    end_time = duration_ms
    end_events = [ms for typ, _, _, ms in events if typ == EVENT_END]
    if end_events:
        end_time = min(duration_ms, max(end_events) + 40)

    words = []
    for i, (s, e) in enumerate(tokens):
        t0 = time_at(s)
        t1 = time_at(tokens[i + 1][0]) if i + 1 < len(tokens) else end_time
        words.append({"c": [s, e], "t": [t0, max(t0, t1)]})

    segments = []
    for i, (s, e) in enumerate(seg_bounds):
        t0 = time_at(s)
        t1 = time_at(seg_bounds[i + 1][0]) if i + 1 < len(seg_bounds) else end_time
        segments.append({"c": [s, e], "t": [t0, max(t0, t1)]})

    return words, segments


def compute_peaks(pcm: bytes, sample_rate: int) -> list[float]:
    import array

    arr = array.array("h")
    arr.frombytes(pcm[: len(pcm) // 2 * 2])
    win = max(1, sample_rate * PEAK_INTERVAL_MS // 1000)
    peaks = []
    for i in range(0, len(arr), win):
        chunk = arr[i : i + win]
        peak = max((abs(v) for v in chunk), default=0) / 32768
        peaks.append(round(peak, 3))
    return peaks


def write_wav_to_mp3(pcm: bytes, sample_rate: int, out_path: Path) -> None:
    import wave

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        with wave.open(str(tmp_path), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sample_rate)
            w.writeframes(pcm)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp_path),
                "-ac", "1", "-ar", str(sample_rate), "-codec:a", "libmp3lame",
                "-b:a", MP3_BITRATE, str(out_path),
            ],
            check=True,
        )
    finally:
        tmp_path.unlink(missing_ok=True)


# ---------------------------------------------------------------- 主流程


def main() -> int:
    check_only = "--check" in sys.argv
    if not shutil.which("ffmpeg"):
        print("error: ffmpeg not found (sudo apt-get install -y ffmpeg)", file=sys.stderr)
        return 1

    corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    synth = Synth()
    print(f"espeak-ng sample rate: {synth.rate} Hz, speech rate: {SPEECH_RATE_WPM} wpm")

    locales = corpus["locales"]
    scenes = corpus["scenes"]
    failures: list[str] = []
    total_bytes = 0
    rows = []

    for scene in scenes:
        for loc in locales:
            code, voice = loc["code"], loc["voice"]
            segs_src = scene["response"][code]
            text = "".join(segs_src)
            pcm, events = synth.synth(voice, text)
            duration_ms = len(pcm) // 2 * 1000 // synth.rate
            n_word_events = sum(1 for t, _, _, _ in events if t == EVENT_WORD)

            if duration_ms < 800 or duration_ms > 30000:
                failures.append(f"{scene['id']}/{code}: suspicious duration {duration_ms}ms")
            if n_word_events < 2:
                failures.append(f"{scene['id']}/{code}: only {n_word_events} word events")

            words, segments = build_timeline(text, events, duration_ms, segs_src)
            for seg, action in zip(segments, scene["actions"]):
                seg["action"] = action

            rows.append((scene["id"], code, duration_ms, len(words), n_word_events))

            if check_only:
                continue

            mp3_path = OUT_DIR / scene["id"] / f"{code}.mp3"
            write_wav_to_mp3(pcm, synth.rate, mp3_path)
            total_bytes += mp3_path.stat().st_size

            timeline = {
                "locale": code,
                "voice": voice,
                "dir": loc["dir"],
                "engine": "eSpeak NG 1.51 (offline, pre-generated)",
                "text": text,
                "chars": len(text.replace(" ", "")),
                "durationMs": duration_ms,
                "words": words,
                "segments": segments,
                "peakIntervalMs": PEAK_INTERVAL_MS,
                "peaks": compute_peaks(pcm, synth.rate),
            }
            tl_path = OUT_DIR / scene["id"] / f"{code}.timeline.json"
            tl_path.write_text(
                json.dumps(timeline, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
            )

    print(f"\n{'scene':8} {'locale':6} {'dur':>7} {'tokens':>6} {'events':>6}")
    for sid, code, dur, ntok, nev in rows:
        print(f"{sid:8} {code:6} {dur:6}ms {ntok:6} {nev:6}")

    if not check_only:
        manifest = {
            "engine": "eSpeak NG 1.51",
            "sampleRate": synth.rate,
            "peakIntervalMs": PEAK_INTERVAL_MS,
            "locales": locales,
            "scenes": [
                {
                    "id": s["id"],
                    "label": s["label"],
                    "tag": s["tag"],
                    "hmi": s["hmi"],
                    "actions": s["actions"],
                    "user": s["user"],
                }
                for s in scenes
            ],
        }
        MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST_PATH.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"\nwrote {len(rows)} clips, audio total {total_bytes / 1024:.0f} KiB")
        print(f"manifest: {MANIFEST_PATH.relative_to(ROOT)}")

    if failures:
        print("\nQA warnings:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        return 2
    print("QA: all clips OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
