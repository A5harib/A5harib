# usage: python3 build2.py DIR OUT.mp4
import json, sys, wave, subprocess, numpy as np
D, OUT = sys.argv[1], sys.argv[2]; SR = 44100
rng = np.random.default_rng(7)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def env_exp(n, d, a=.005): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t * 6.9 / d)
def osc(f, n, kind='sine'):
    f = np.broadcast_to(f, (n,)) if np.ndim(f) else np.full(n, f)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == 'sine': return np.sin(ph)
    if kind == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    if kind == 'sq': return np.tanh(3 * np.sin(ph))
    if kind == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
def band(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X[(fr < lo) | (fr > hi)] = 0; return np.fft.irfft(X, len(x))
def noise(n): return rng.standard_normal(n)
def mix_into(buf, t, x, g=1.0):
    i = int(round(t * SR)); 
    if i >= len(buf): return
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i] * g
def seq(parts, extra=0.0):
    L = max(int(o * SR) + len(x) for o, x in parts); b = np.zeros(L)
    for o, x in parts: mix_into(b, o, x)
    return b
# ---------- instruments ----------
def kick():
    n = int(.4 * SR); t = np.arange(n) / SR; f = 45 + 110 * np.exp(-t * 28)
    return osc(f, n) * np.exp(-t * 9) * .9 + band(noise(n), 1000, 5000) * np.exp(-t * 200) * .15
def clap():
    n = int(.25 * SR); x = band(noise(n), 900, 3500); e = np.zeros(n); t = np.arange(n) / SR
    for o in (0, .011, .022): e += (t >= o) * np.exp(-(t - o).clip(0) * (60 if o < .02 else 18))
    return x / np.abs(x).max() * e * .5
def hat(d=.045, g=.22): n = int(d * 3 * SR); x = band(noise(n), 7000, 16000); return x / np.abs(x).max() * env_exp(n, d) * g
def shaker(): return hat(.05, .07)
def tom(m): n = int(.35 * SR); t = np.arange(n) / SR; return osc(mtof(m) * (1 + .4 * np.exp(-t * 20)), n) * np.exp(-t * 9) * .5
def bass(m, d=.3):
    n = int(d * SR) + 800; return (osc(mtof(m), n, 'tri') * .7 + osc(mtof(m), n) * .5) * env_exp(n, d * .9, .004) * .55
def glock(m, d=1.1, g=.30):
    n = int(d * SR); f = mtof(m)
    return (osc(f, n) + .35 * osc(f * 2.76, n) * env_exp(n, d * .3) + .12 * osc(f * 5.4, n) * env_exp(n, d * .12)) * env_exp(n, d, .002) * g
def marimba(m, d=.45, g=.35):
    n = int(d * SR); f = mtof(m); return (osc(f, n) + .25 * osc(f * 4, n) * env_exp(n, .05)) * env_exp(n, d, .002) * g
def ks(m, d=.9, g=.22, bright=.5):
    f = mtof(m); L = max(2, int(SR / f)); n = int(d * SR)
    buf = band(noise(L * 4), 0, 3000 + bright * 6000)[:L]; buf /= np.abs(buf).max()
    out = np.empty(n); dec = .996
    b = buf.copy(); pos = 0
    for i in range(n):
        nx = (pos + 1) % L; v = b[pos]; b[pos] = dec * .5 * (b[pos] + b[nx]); out[i] = v; pos = nx
    return out * env_exp(n, d, .002) * g
def strum(ch, d=.6, g=.16, down=True):
    notes = ch if down else ch[::-1]; return seq([(i * .012, ks(m, d, g)) for i, m in enumerate(notes)])
def lead(m, d=.25, g=.16):
    n = int(d * SR) + 400; t = np.arange(n) / SR; f = mtof(m) * (1 + .006 * np.sin(2 * np.pi * 6 * t))
    return band(osc(f, n, 'sq'), 0, 5000) * env_exp(n, d, .005) * g
def pad(ch, d, g=.05):
    n = int(d * SR); x = sum(band(osc(mtof(m) * (1 + k * .003), n, 'saw'), 0, 1800) for m in ch for k in (-1, 1))
    t = np.arange(n) / SR; e = np.minimum(1, t / .6) * np.minimum(1, (d - t) / .6).clip(0); return x * e * g
# ---------- song ----------
BPM = 112; S16 = 60 / BPM / 4; BAR = 16 * S16
CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]] * 2
ROOT = [48, 45, 41, 43] * 2
MEL = [[76, 79, 81, 79, 76, None, 72, None], [72, 74, 76, None, 69, None, 72, None], [77, 76, 74, 72, 74, None, 69, None], [71, 74, 79, None, 77, 76, 74, None],
       [76, 79, 81, 84, 81, None, 79, None], [81, 79, 76, 74, 76, None, 72, None], [74, 76, 77, 79, 81, 79, 77, None], [79, None, 74, None, 71, 74, 72, None]]
MELB = [[72, None, 76, 79, None, 76, 79, 84], [81, None, 76, None, 72, None, 76, None], [77, None, 81, 84, None, 81, 77, None], [79, 81, 83, None, 86, None, 83, None]] * 2
def make_loop(kind):
    L = int(8 * BAR * SR) + SR * 2; b = np.zeros(L)
    for bar in range(8):
        o = bar * BAR; ch = CH[bar]; r = ROOT[bar]
        if kind != 'calm':
            for st in range(16):
                t = o + st * S16
                if st in (0, 8) or (st == 10 and bar % 2): mix_into(b, t, kick())
                if st in (4, 12): mix_into(b, t, clap(), .9)
                if st % 2 == 0: mix_into(b, t, hat(), .9 if st % 4 == 2 else .5)
                if kind == 'quiz' and st % 2 == 1: mix_into(b, t, hat(.03, .12))
                mix_into(b, t, shaker(), .8)
            if bar == 7:
                for k, m in enumerate([50, 47, 45, 43]): mix_into(b, o + (12 + k) * S16, tom(m))
            for st, iv in zip([0, 4, 6, 8, 11, 12, 14], [0, 12, 7, 0, 12, 7, 12]): mix_into(b, o + st * S16, bass(r + iv, .28))
            for st in (2, 6, 10, 14): mix_into(b, o + st * S16, strum([m + 12 for m in ch] + [ch[0] + 24], .35, .13, st % 4 == 2))
            mix_into(b, o, strum([m + 12 for m in ch] + [ch[0] + 24], .7, .14))
        else:
            mix_into(b, o, pad([m + 12 for m in ch], BAR + .6, .045))
            for st in (0, 8): mix_into(b, o + st * S16, bass(r, 1.0), .6)
            for st in (0, 4, 8, 12): mix_into(b, o + st * S16, ks(ch[st // 4 % 3] + 12, 1.2, .14))
        mel = MELB[bar] if kind == 'quiz' else MEL[bar]
        for k, m in enumerate(mel):
            if m is None: continue
            t = o + k * 2 * S16
            if kind == 'quiz': mix_into(b, t, lead(m, .22, .13)); mix_into(b, t, marimba(m, .35, .18))
            elif kind == 'calm':
                if k % 2 == 0: mix_into(b, t, glock(m, 1.6, .18))
            else: mix_into(b, t, glock(m, .9, .26)); mix_into(b, t, marimba(m - 12, .3, .12))
    n = int(8 * BAR * SR); tail = b[n:]; b = b[:n].copy(); b[:len(tail)] += tail
    return b / np.abs(b).max() * .8
# ---------- sfx ----------
def applause(d=1.6, g=.5):
    n = int(d * SR); b = np.zeros(n + SR // 4); c = clap()
    for _ in range(int(d * 140)): mix_into(b, rng.uniform(0, d * .85), c * rng.uniform(.3, 1))
    t = np.arange(len(b)) / SR; e = np.minimum(1, t / .15) * np.clip((d - t) / (d * .5), 0, 1)
    return band(b * e, 300, 9000) * g / max(1e-9, np.abs(b).max())
def slide(f0, f1, d, g=.25):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (f1 / f0) ** (t / d) * (1 + .02 * np.sin(2 * np.pi * 7 * t))
    return osc(f, n) * np.minimum(1, t / .02) * np.minimum(1, (d - t) / .05).clip(0) * g
def woodblock(f, g=.4): n = int(.12 * SR); return (osc(f, n) * env_exp(n, .05) + band(noise(n), 2000, 6000) * env_exp(n, .008) * .3) * g
def brass(m, d, g=.18):
    n = int(d * SR) + 600; t = np.arange(n) / SR; x = osc(mtof(m) * (1 + .004 * np.sin(2 * np.pi * 5.5 * t)), n, 'saw') + .5 * osc(mtof(m) * 1.003, n, 'saw')
    return band(x, 0, 2800) * np.minimum(1, t / .03) * np.exp(-t * 2.2 / d) * g
def cymbal(d=1.4, g=.12): n = int(d * SR); x = band(noise(n), 5000, 15000); return x / np.abs(x).max() * env_exp(n, d) * g
SFX = {
 'whoosh': lambda: seq([(0, band(noise(int(.6 * SR)), 300, 5000) * np.hanning(int(.6 * SR)) * .12)] + [(.05 + i * .045, glock(m, .5, .16)) for i, m in enumerate([72, 74, 76, 79, 81, 84, 88])]),
 'fanfare': lambda: seq([(0, kick() * .6), (0, cymbal(1.6, .1))] + [(o, sum(brass(m, d) for m in ch)) for o, d, ch in [(0, .14, [67, 72, 76]), (.16, .14, [67, 72, 76]), (.32, .9, [72, 76, 79, 84])]] + [(.32, glock(96, 1.2, .15))]),
 'ding': lambda: seq([(0, glock(84, .8, .3)), (.1, glock(91, 1.0, .3))]),
 'correct': lambda: seq([(i * .07, glock(m, 1.0, .28)) for i, m in enumerate([72, 76, 79, 84, 88])] + [(.1, applause(1.8, .38)), (.35, cymbal(1.2, .06))]),
 'tick': lambda: woodblock(1250, .32), 'tock': lambda: woodblock(880, .32),
 'question': lambda: seq([(0, slide(500, 1300, .38, .18)), (.42, marimba(79, .3, .3)), (.56, marimba(84, .4, .3))]),
 'sparkle': lambda: seq([(i * .035, glock(m, .7, .12)) for i, m in enumerate([84, 86, 88, 91, 93, 96, 98, 100, 103])]),
 'cheer': lambda: seq([(0, applause(2.2, .45))] + [(i * .08, glock(m, .9, .2)) for i, m in enumerate([79, 84, 88, 91])]),
 'freeze': lambda: seq([(i * .04, glock(m, .9, .14)) for i, m in enumerate([103, 100, 96, 91, 88, 84])] + [(0, slide(2400, 600, .35, .06))]),
 'rewind': lambda: seq([(0, osc(300 * (1 + .5 * np.sin(2 * np.pi * 14 * np.arange(int(.9 * SR)) / SR)) * np.linspace(1.6, .6, int(.9 * SR)), int(.9 * SR), 'tri') * np.hanning(int(.9 * SR)) * .14)]),
 'crash': lambda: seq([(0, kick() * .8)] + [(rng.uniform(0, .5), woodblock(rng.uniform(500, 1100), .35)) for _ in range(9)]),
 'pop': lambda: slide(380, 1300, .09, .3),
 'uhoh': lambda: seq([(0, brass(70, .22, .2)), (.24, brass(65, .5, .2))]),
 'bloop': lambda: slide(500, 220, .3, .25),
 'beep': lambda: seq([(0, osc(1760, int(.09 * SR)) * .15), (.13, osc(1760, int(.09 * SR)) * .15)]),
 'knock': lambda: seq([(d, (osc(110, int(.15 * SR)) * env_exp(int(.15 * SR), .07) + band(noise(int(.15 * SR)), 100, 900) * env_exp(int(.15 * SR), .03) * .3) * .7) for d in (0, .22, .44)]),
 'car': lambda: (lambda n: (band(osc(55 * (1 + .03 * np.sin(2 * np.pi * 9 * np.arange(n) / SR)), n, 'saw'), 0, 900) * .3 + band(noise(n), 100, 1200) * .15) * np.hanning(n) * .6)(int(2.2 * SR)),
 'shout': lambda: slide(220, 700, .35, .25),
 'chime': lambda: seq([(i * .2, glock(m, 1.6, .25)) for i, m in enumerate([84, 88, 91, 96])]),
 'clap': lambda: seq([(i * .12, clap()) for i in range(3)]),
}
# ---------- assemble ----------
frames = json.load(open(f'{D}/frames.json')); E = json.load(open(f'{D}/events.json'))['ev']; files = json.load(open('clipfiles.json'))
T0 = frames[0][1]; TOTAL = frames[-1][1] - T0 + 0.6; N = int(TOTAL * SR) + SR
voice = np.zeros(N); fx = np.zeros(N); speech = np.zeros(N)
def rd(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
cache = {}
scenes = []; mus = []; on = None
for e in E:
    t = e['t'] - T0
    if e['k'] == 'say':
        k = e['who'] + '|' + e['text']
        if k in files: x = rd(files[k] + '.wav'); mix_into(voice, t, x); mix_into(speech, t, np.ones(len(x)))
    elif e['k'] == 'sfx' and e['n'] in SFX:
        if e['n'] not in cache or e['n'] in ('crash', 'whoosh'): cache[e['n']] = SFX[e['n']]()
        mix_into(fx, t, cache[e['n']])
    elif e['k'] == 'scene':
        kind = 'quiz' if e['bg'] == 'studio' else ('calm' if ('breathing' in e['title'].lower() or 'coping tools' in e['title'].lower()) else 'main')
        scenes.append((t, kind))
    elif e['k'] == 'music':
        if e['on'] and on is None: on = t
        elif not e['on'] and on is not None: mus.append((on, t)); on = None
if on is not None: mus.append((on, TOTAL))
print('building loops'); LOOPS = {k: make_loop(k) for k in ('main', 'quiz', 'calm')}
music = np.zeros(N); kind_at = np.zeros(N, dtype=np.int8); KI = {'main': 0, 'quiz': 1, 'calm': 2}
for i, (t, k) in enumerate(scenes):
    a = int(t * SR); b = int(scenes[i + 1][0] * SR) if i + 1 < len(scenes) else N; kind_at[a:b] = KI[k]
for k, idx in KI.items():
    L = LOOPS[k]; tiled = np.resize(L, N)  # phase-locked to time 0 so loops stay on the beat
    m = (kind_at == idx).astype(float); w = int(.6 * SR); m = np.convolve(m, np.ones(w) / w, mode='same')
    music += tiled * m
gate = np.zeros(N)
for a, b in mus:
    i, j = int(a * SR), min(N, int(b * SR)); g = np.ones(j - i); r = min(len(g) // 2, int(SR * 1.2)); g[:r] = np.linspace(0, 1, r); g[-r:] *= np.linspace(1, 0, r); gate[i:j] = np.maximum(gate[i:j], g)
w = int(.3 * SR); sm = np.convolve(np.minimum(speech, 1), np.ones(w) / w, mode='same')
mix = voice * 1.0 + fx * .75 + music * (0.42 - 0.27 * sm) * gate
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
with wave.open(f'{D}/audio_raw.wav', 'w') as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.clip(mix, -1, 1) * 32000).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{D}/audio_raw.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '2', f'{D}/audio.wav'], check=True)
with open(f'{D}/list.txt', 'w') as f:
    for (a, ta), (_, tb) in zip(frames, frames[1:]): f.write(f"file '{a}'\nduration {max(0.001, tb - ta):.4f}\n")
    f.write(f"file '{frames[-1][0]}'\nduration 0.6\nfile '{frames[-1][0]}'\n")
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', f'{D}/list.txt', '-i', f'{D}/audio.wav',
  '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-tune', 'animation', '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart', '-shortest', OUT], check=True)
print('done', OUT, round(TOTAL, 1))
