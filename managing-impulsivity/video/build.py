# usage: python3 build.py DIR OUT.mp4
import json, sys, wave, subprocess, numpy as np
D, OUT = sys.argv[1], sys.argv[2]; SR = 44100
frames = json.load(open(f'{D}/frames.json')); E = json.load(open(f'{D}/events.json'))['ev']
files = json.load(open('clipfiles.json'))
T0 = frames[0][1]; TOTAL = frames[-1][1] - T0 + 0.5
N = int(TOTAL * SR) + SR
voice = np.zeros(N); fxb = np.zeros(N); duckenv = np.zeros(N)
def rd(path):
    with wave.open(path) as w: return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
def put(buf, t, x, g=1.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x)); buf[i:j] += x[:j - i] * g
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def tone(m, d, kind='sine', g=.5, slide=None):
    n = int(d * SR); t = np.arange(n) / SR
    f = mtof(m) if slide is None else mtof(m) * (mtof(slide) / mtof(m)) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    w = {'sine': np.sin(ph), 'triangle': 2 / np.pi * np.arcsin(np.sin(ph)), 'square': np.sign(np.sin(ph)) * .6, 'saw': 2 * ((ph / (2 * np.pi)) % 1) - 1}[kind]
    env = np.minimum(1, t / .015) * np.exp(-t * 6.9 / d)
    return w * env * g
rng = np.random.default_rng(1)
def noise(d, lo, hi, g=.4):
    n = int(d * SR); x = rng.standard_normal(n)
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR); X[(fr < lo) | (fr > hi)] = 0
    x = np.fft.irfft(X, n); x /= (np.abs(x).max() + 1e-9)
    t = np.arange(n) / SR; return x * np.exp(-t * 5 / d) * g
def seq(parts):
    L = max(int((o + len(x) / SR) * SR) for o, x in parts); b = np.zeros(L + 1)
    for o, x in parts: i = int(o * SR); b[i:i + len(x)] += x
    return b
SFX = {
 'ding': lambda: seq([(0, tone(84, .35, g=.3)), (.11, tone(88, .5, g=.3))]),
 'bloop': lambda: tone(64, .35, g=.3, slide=52),
 'uhoh': lambda: seq([(0, tone(72, .22, 'triangle', .3)), (.22, tone(67, .4, 'triangle', .3))]),
 'whoosh': lambda: noise(.55, 400, 4000, .25),
 'pop': lambda: tone(76, .12, g=.35, slide=88),
 'tick': lambda: noise(.05, 2500, 6000, .5),
 'beep': lambda: tone(88, .14, 'square', .12),
 'crash': lambda: seq([(0, noise(.7, 150, 1500, .55))] + [(d, tone(55 + i * 3, .18, 'triangle', .3)) for i, d in enumerate([0, .08, .17, .26])]),
 'clap': lambda: noise(.12, 1000, 5000, .6),
 'sparkle': lambda: seq([(i * .06, tone(m, .3, g=.16)) for i, m in enumerate([88, 91, 95, 100, 103])]),
 'fanfare': lambda: seq([(i * .13, tone(m, .8 if i == 3 else .22, 'triangle', .3)) for i, m in enumerate([72, 76, 79, 84])] + [(.39, tone(60, .8, g=.25))]),
 'cheer': lambda: seq([(i * .07, tone(m, .4, 'triangle', .2)) for i, m in enumerate([79, 84, 88, 91])] + [(0, noise(.9, 800, 3000, .15))]),
 'freeze': lambda: seq([(i * .05, tone(m, .5, g=.14)) for i, m in enumerate([96, 91, 88, 84])]),
 'rewind': lambda: seq([(0, tone(84, .8, 'saw', .06, slide=60)), (0, noise(.8, 500, 3000, .1))]),
 'knock': lambda: seq([(d, tone(40, .16, g=.7, slide=34)) for d in [0, .22, .44]]),
 'car': lambda: seq([(0, noise(1.6, 150, 900, .3)), (0, tone(41, 1.6, 'saw', .05, slide=46))]),
 'shout': lambda: noise(.3, 800, 2000, .2),
 'chime': lambda: seq([(i * .18, tone(m, 1.2, g=.22)) for i, m in enumerate([84, 88, 91, 96])]),
}
music_on = []; state = None
for e in E:
    t = e['t'] - T0
    if e['k'] == 'say':
        k = e['who'] + '|' + e['text']
        if k in files:
            x = rd(f'clips/{files[k]}.wav'); put(voice, t, x); put(duckenv, t, np.ones(len(x)))
    elif e['k'] == 'sfx' and e['n'] in SFX: put(fxb, t, SFX[e['n']]())
    elif e['k'] == 'music':
        if e['on'] and state is None: state = t
        elif not e['on'] and state is not None: music_on.append((state, t)); state = None
if state is not None: music_on.append((state, TOTAL))
# music: C G Am F arpeggio loop at 108 bpm (same as the page)
spb = 60 / 108 / 2; CH = [[60, 64, 67], [67, 71, 74], [69, 72, 76], [65, 69, 72]]; pat = [0, 1, 2, 1, 0, 2, 1, 2]
bar_len = 8 * spb; loop = np.zeros(int(4 * bar_len * SR) + SR * 2)
for b in range(4):
    for i in range(8):
        o = (b * 8 + i) * spb; ch = CH[b]
        put_l = lambda x, oo=o: loop.__setitem__(slice(int(oo * SR), int(oo * SR) + len(x)), loop[int(oo * SR):int(oo * SR) + len(x)] + x)
        put_l(tone(ch[pat[i]] + 12, .32, 'triangle', .42))
        if i == 0: put_l(tone(ch[0] - 12, 1.7, g=.55))
        if i == 4: put_l(tone(ch[2] - 12, 1.0, g=.3))
        if i % 4 == 2: put_l(tone(ch[(b * 2 + i // 4) % 3] + 24, .22, g=.16))
L = int(4 * bar_len * SR); tail = loop[L:]; loop = loop[:L].copy(); loop[:len(tail)] += tail
music = np.zeros(N); gate = np.zeros(N)
for a, b in music_on:
    i, j = int(a * SR), min(N, int(b * SR)); reps = np.tile(loop, (j - i) // L + 1)[:j - i]; music[i:j] = reps
    g = np.ones(j - i); r = min(len(g), int(SR * 1.5)); g[:r] = np.linspace(0, 1, r); g[-r:] = np.minimum(g[-r:], np.linspace(1, 0, r)); gate[i:j] = g
# duck music under speech (smoothed)
k = int(.25 * SR); sm = np.convolve(np.minimum(duckenv, 1), np.ones(k) / k, mode='same')
mus_gain = (0.16 - 0.10 * sm) * gate
mix = voice * 0.95 + fxb * 0.55 + music * mus_gain
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
with wave.open(f'{D}/audio.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32000).astype(np.int16).tobytes())
# video concat list from frame timestamps
with open(f'{D}/list.txt', 'w') as f:
    for (a, ta), (_, tb) in zip(frames, frames[1:]): f.write(f"file '{a}'\nduration {max(0.001, tb - ta):.4f}\n")
    f.write(f"file '{frames[-1][0]}'\nduration 0.5\nfile '{frames[-1][0]}'\n")
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-stats', '-f', 'concat', '-safe', '0', '-i', f'{D}/list.txt', '-i', f'{D}/audio.wav',
  '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-c:a', 'aac', '-b:a', '160k',
  '-movflags', '+faststart', '-shortest', OUT], check=True)
print('done', OUT, round(TOTAL, 1), 's')
