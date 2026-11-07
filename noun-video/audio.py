"""Synthesized music and sound effects for Noun Friends (no samples, all generated)."""
import os

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
SFX_DIR = os.path.join(ROOT, "assets", "sfx")
SR = 24000


# ---------------------------------------------------------------- audio synth
def env_adsr(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def write(name, y, vol=0.9):
    y = y / (np.max(np.abs(y)) or 1) * vol
    sf.write(os.path.join(SFX_DIR, name), y.astype(np.float32), SR)
    return f"assets/sfx/{name}"


def pluck(freq, dur, decay=0.996):
    n = int(SR * dur)
    p = max(2, int(SR / freq))
    rng = np.random.default_rng(int(freq * 10))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = decay * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out


def make_sfx():
    t = lambda d: np.arange(int(SR * d)) / SR
    s = {}
    tt = t(0.18)
    s["pop"] = write("pop.wav", np.sin(2 * np.pi * (500 + 1400 * tt) * tt) * env_adsr(len(tt), 0.002, 0.04), 0.6)
    tt = t(1.2)
    s["ding"] = write("ding.wav", (np.sin(2 * np.pi * 1318.5 * tt) + 0.6 * np.sin(2 * np.pi * 1975.5 * tt)
                                   + 0.3 * np.sin(2 * np.pi * 2637 * tt)) * env_adsr(len(tt), 0.003, 0.35), 0.7)
    tt = t(0.1)
    s["tick"] = write("tick.wav", np.sin(2 * np.pi * 1000 * tt) * env_adsr(len(tt), 0.001, 0.02), 0.5)
    tt = t(0.55)
    rng = np.random.default_rng(7)
    noise = rng.uniform(-1, 1, len(tt))
    k = np.convolve(noise, np.ones(12) / 12, mode="same")
    s["whoosh"] = write("whoosh.wav", k * np.sin(np.pi * tt / tt[-1]) ** 2, 0.35)
    tt = t(0.45)
    s["boing"] = write("boing.wav", np.sin(2 * np.pi * (180 + 120 * np.sin(2 * np.pi * 9 * tt)) * tt)
                       * env_adsr(len(tt), 0.003, 0.18), 0.5)
    # title jingle: C E G C' arpeggio + chord
    notes = [523.25, 659.25, 783.99, 1046.5]
    y = np.zeros(int(SR * 2.4))
    for i, f in enumerate(notes):
        st = int(SR * 0.16 * i)
        p = pluck(f, 1.6, 0.997)
        y[st:st + len(p)] += p
    st = int(SR * 0.7)
    for f in notes[:3]:
        p = pluck(f * 2, 1.6, 0.998) * 0.6
        y[st:st + len(p)] += p
    s["jingle"] = write("jingle.wav", y, 0.6)

    def bell(f, d=1.2, r=0.4):
        tt = t(d)
        return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt / 0.08)) * env_adsr(len(tt), 0.002, r)

    # star collected: quick rising sparkle
    y = np.zeros(int(SR * 1.4))
    for i, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
        b = bell(f, 1.0, 0.3)
        st = int(SR * 0.07 * i)
        y[st:st + len(b)] += b
    s["chime"] = write("chime.wav", y, 0.6)
    # correct answer: two-note "ta-da"
    y = np.zeros(int(SR * 1.6))
    for i, (f, at) in enumerate([(783.99, 0.0), (1046.5, 0.14)]):
        for h in (1, 1.25, 1.5):
            p = pluck(f * h, 1.3, 0.998)
            st = int(SR * at)
            y[st:st + len(p)] += p * (1 if h == 1 else 0.5)
    s["tada"] = write("tada.wav", y, 0.65)
    # result fanfare: G C E G ... big chord
    y = np.zeros(int(SR * 3.0))
    for i, f in enumerate([392.0, 523.25, 659.25, 783.99]):
        p = pluck(f, 1.2, 0.997)
        st = int(SR * 0.13 * i)
        y[st:st + len(p)] += p
    st = int(SR * 0.62)
    for f in [523.25, 659.25, 783.99, 1046.5]:
        p = pluck(f, 2.3, 0.999)
        y[st:st + len(p)] += p * 0.8
    s["fanfare"] = write("fanfare.wav", y, 0.7)
    return s


def make_music(total, scenes):
    """Bouncy kids' tune at 112 bpm: marimba melody + bass + light drums.
    The track is ducked (made quieter) while anyone is speaking."""
    bpm = 112
    beat = 60 / bpm
    e8 = beat / 2
    n = int(SR * (total + 3))
    y = np.zeros(n)
    rng = np.random.default_rng(3)

    def add(sig, at, gain=1.0):
        st = int(SR * at)
        if st >= n:
            return
        seg = sig[: n - st]
        y[st:st + len(seg)] += seg * gain

    def marimba(f, d=0.6):
        tt = np.arange(int(SR * d)) / SR
        w = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.03)
        return w * np.minimum(1, tt / 0.003) * np.exp(-tt / 0.22)

    def glock(f, d=1.0):
        tt = np.arange(int(SR * d)) / SR
        w = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt / 0.1)
        return w * np.minimum(1, tt / 0.002) * np.exp(-tt / 0.45)

    def bassnote(f, d=0.5):
        tt = np.arange(int(SR * d)) / SR
        w = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
        return w * np.minimum(1, tt / 0.005) * np.exp(-tt / 0.25)

    tt = np.arange(int(SR * 0.3)) / SR
    kick = np.sin(2 * np.pi * (50 + 110 * np.exp(-tt / 0.04)) * tt) * np.exp(-tt / 0.12)
    tt = np.arange(int(SR * 0.2)) / SR
    noise = rng.uniform(-1, 1, len(tt))
    clap = (noise - np.convolve(noise, np.ones(6) / 6, "same")) * np.exp(-tt / 0.05)
    tt = np.arange(int(SR * 0.06)) / SR
    nz = rng.uniform(-1, 1, len(tt))
    shaker = (nz - np.convolve(nz, np.ones(3) / 3, "same")) * np.exp(-tt / 0.015)

    N = {"C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0, "B4": 493.88,
         "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.0}
    # C - Am - F - G, a simple sing-song melody (one note per eighth, None = rest)
    prog = [(130.81, "C"), (110.0, "Am"), (87.31, "F"), (98.0, "G")]
    melody = [
        ["E5", None, "G5", "E5", "C5", None, "D5", "E5"],
        ["C5", None, "A4", "C5", "E5", None, "C5", None],
        ["F5", None, "A5", "F5", "C5", None, "A4", "C5"],
        ["D5", None, "B4", "D5", "G5", None, None, None],
        ["E5", "E5", "G5", None, "E5", "D5", "C5", None],
        ["A4", None, "C5", "E5", "A5", None, "E5", None],
        ["F5", "E5", "D5", "C5", "A4", None, "C5", None],
        ["B4", None, "D5", None, "G4", None, None, None],
    ]
    chord_tones = {"C": ["C4", "E4", "G4"], "Am": ["A4", "C5", "E5"], "F": ["F4", "A4", "C5"], "G": ["G4", "B4", "D5"]}

    pos, bar = 0.0, 0
    while pos < total + 1:
        broot, name = prog[bar % 4]
        mel = melody[bar % 8]
        # bass: root on 1 and 3, fifth on the "and" of 4
        add(bassnote(broot), pos, 0.9)
        add(bassnote(broot), pos + 2 * beat, 0.8)
        add(bassnote(broot * 1.5, 0.3), pos + 3.5 * beat, 0.6)
        # drums
        for b4 in range(4):
            add(kick if b4 % 2 == 0 else clap, pos + b4 * beat, 0.9 if b4 % 2 == 0 else 0.35)
        for k in range(8):
            add(shaker, pos + k * e8, 0.18 if k % 2 else 0.1)
        # soft chord stabs on the off-beats
        for k in (1, 3, 5, 7):
            for nt in chord_tones[name]:
                add(marimba(N[nt], 0.3), pos + k * e8, 0.12)
        # melody
        for k, nt in enumerate(mel):
            if nt:
                add(marimba(N[nt]), pos + k * e8, 0.55)
        # sparkle every 4 bars
        if bar % 4 == 0:
            add(glock(N["C5"] * 2), pos, 0.25)
        pos += 8 * e8
        bar += 1

    y = y[: int(SR * total)]
    # ducking: quieter under speech, smooth 0.2 s ramps
    gain = np.ones(len(y))
    for sc in scenes:
        for ln in sc["lines"]:
            if ln["speaker"] == "pause":
                a, b = int(SR * ln["start"]), int(SR * (ln["start"] + ln["dur"]))
                gain[max(0, a):min(len(y), b)] = 0.5
                continue
            a, b = int(SR * (ln["start"] - 0.15)), int(SR * (ln["start"] + ln["dur"] + 0.1))
            gain[max(0, a):min(len(y), b)] = 0.32
    k = int(SR * 0.2)
    gain = np.convolve(gain, np.ones(k) / k, "same")
    y *= gain
    y[: int(SR * 0.5)] *= np.linspace(0, 1, int(SR * 0.5))
    fade = int(SR * 2.5)
    y[-fade:] *= np.linspace(1, 0, fade)
    return write("music.wav", y, 0.85)


