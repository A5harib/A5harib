"""Builds narration audio, the scene timeline, music + sound effects and captions."""
import hashlib, json, os, sys
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from script import SCENES

MODELS = sys.argv[1]
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
CACHE = os.path.join(HERE, 'cache'); os.makedirs(CACHE, exist_ok=True)
SR = 48000
FPS = 30
VOICES = {'T': ('af_heart', 'en-us', 0.86), 'Z': ('bf_emma', 'en-gb', 0.88), 'K': ('af_sky', 'en-us', 0.95)}

_k = None
def tts(text, spk, voice=None, speed=None):
    v, lang, sp = VOICES[spk]
    v = voice or v
    if voice and voice.startswith('b'): lang = 'en-gb'
    sp = speed * sp if speed else sp
    key = hashlib.md5(f'{v}|{lang}|{sp}|{text}'.encode()).hexdigest()
    path = os.path.join(CACHE, key + '.wav')
    if not os.path.exists(path):
        global _k
        if _k is None:
            from kokoro_onnx import Kokoro
            _k = Kokoro(os.path.join(MODELS, 'kokoro.onnx'), os.path.join(MODELS, 'voices.bin'))
        a, sr = _k.create(text, voice=v, speed=sp, lang=lang)
        a = resample_poly(a, SR, sr).astype(np.float32)
        # trim leading / trailing silence
        thr = 0.01 * np.max(np.abs(a))
        idx = np.where(np.abs(a) > thr)[0]
        a = a[max(0, idx[0] - 480): idx[-1] + 2400]
        sf.write(path, a, SR)
    a, _ = sf.read(path, dtype='float32')
    return a

# ------------------------------------------------------------------ timeline
timeline = []
voice_clips = []   # (start_sec, audio, spk)
sfx_events = []    # (start_sec, name)
captions = []
t = 0.0
for sc in SCENES:
    start = t
    lt = 0.45  # local time; small lead-in for the transition
    marks, lines, thinks, pauses = {}, [], [], []
    items = sc['items']
    for i, it in enumerate(items):
        nxt = items[i + 1] if i + 1 < len(items) else None
        if it.get('mark'): marks[it['mark']] = round(lt, 3)
        if it['k'] == 'say':
            a = tts(it['text'], it['spk'], it.get('voice'), it.get('speed'))
            d = len(a) / SR
            voice_clips.append((start + lt, a, it['spk']))
            if it.get('sfx'): sfx_events.append((start + lt, it['sfx']))
            if it.get('praise') and not it.get('sfx'): sfx_events.append((start + lt, 'correct'))
            ln = {k: it[k] for k in ('spk', 'kw', 'praise', 'opts', 'icons', 'ans', 'pic', 'q', 'mark') if k in it}
            ln.update(t=round(lt, 3), d=round(d, 3), cap=it.get('cap', it['text']))
            lines.append(ln)
            captions.append((start + lt, start + lt + d, it.get('cap', it['text'])))
            gap = it.get('gap', 0.2 if (nxt and nxt['k'] == 'think') else 0.38)
            lt += d + gap
        elif it['k'] == 'pause':
            if it.get('sfx'): sfx_events.append((start + lt, it['sfx']))
            p = {k: it[k] for k in ('pic', 'mark') if k in it}; p.update(t=round(lt, 3), d=it['d'])
            pauses.append(p)
            lt += it['d']
        elif it['k'] == 'think':
            thinks.append(dict(t=round(lt, 3), d=it['d']))
            for s in range(int(it['d'])):
                sfx_events.append((start + lt + s, 'tick' if s % 2 == 0 else 'tock'))
            lt += it['d'] + 0.25
    lt += 0.55
    timeline.append(dict(id=sc['id'], type=sc['type'], part=sc['part'], start=round(start, 3), dur=round(lt, 3),
                         marks=marks, lines=lines, thinks=thinks, pauses=pauses, data=sc['data']))
    t += lt
TOTAL = t
N = int(np.ceil(TOTAL * SR)) + SR
print(f'total duration {TOTAL/60:.2f} min, {len(voice_clips)} voice clips')

# ------------------------------------------------------------------ voice track + mouth envelopes
voice = np.zeros(N, np.float32)
nfr = int(np.ceil(TOTAL * FPS)) + 2
mouth = {s: np.zeros(nfr) for s in ('T', 'Z', 'K')}
for st, a, spk in voice_clips:
    i0 = int(st * SR)
    voice[i0:i0 + len(a)] += a
    hop = SR // FPS
    f0 = int(round(st * FPS))
    for f in range(len(a) // hop):
        seg = a[f * hop:(f + 1) * hop]
        if f0 + f < nfr:
            mouth[spk][f0 + f] = max(mouth[spk][f0 + f], np.sqrt(np.mean(seg ** 2)))
for s in mouth:
    m = mouth[s]
    if m.max() > 0:
        m = np.clip(m / (np.percentile(m[m > 0], 90) + 1e-9), 0, 1)
    mouth[s] = ''.join(str(int(round(v * 9))) for v in m)
voice *= 0.82 / (np.max(np.abs(voice)) + 1e-9)

# ------------------------------------------------------------------ synth helpers
def tvec(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_ad(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
def bell(f, d=1.2, amp=1.0, decay=0.45):
    t = tvec(d)
    mod = 1.6 * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * 3.5 * t)
    return (amp * np.sin(2 * np.pi * f * t + mod) * env_ad(len(t), 0.004, decay)).astype(np.float32)
def place(buf, at, sig, g=1.0):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig))
    buf[i:j] += g * sig[:j - i]
rng = np.random.default_rng(7)
def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    av = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        acc += av[i] * (x[i] - acc); y[i] = acc
    return y

# ------------------------------------------------------------------ music
BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT
PROG = [[48, 52, 55, 60], [45, 52, 57, 60], [41, 53, 57, 60], [43, 55, 59, 62],
        [48, 52, 55, 64], [40, 52, 55, 59], [41, 53, 57, 60], [43, 55, 59, 62]]
PENTA = [60, 62, 64, 67, 69, 72, 74, 76, 79]

def music_loop(variant):
    r = np.random.default_rng(100 + variant)
    L = int(8 * BAR * SR) + SR * 2
    out = np.zeros(L, np.float32)
    for b, ch in enumerate(PROG):
        t0 = b * BAR
        # pad
        n = int(BAR * SR * 1.1); tt = np.arange(n) / SR
        e = np.minimum(1, tt / 0.35) * np.minimum(1, np.maximum(0, (BAR * 1.1 - tt)) / 0.45)
        for m in ch[1:]:
            f = mtof(m)
            s = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.004 * tt) + 0.15 * np.sin(4 * np.pi * f * tt)) * e
            place(out, t0, s.astype(np.float32), 0.030)
        # bass
        for bt in (0, 2):
            n = int(BEAT * 1.8 * SR); tt = np.arange(n) / SR
            f = mtof(ch[0] - 12 if ch[0] > 44 else ch[0])
            s = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * env_ad(n, 0.01, 0.5)
            place(out, t0 + bt * BEAT, s.astype(np.float32), 0.11)
        # soft kick + shaker
        for bt in range(4):
            n = int(0.18 * SR); tt = np.arange(n) / SR
            if bt in (0, 2):
                k = np.sin(2 * np.pi * (55 + 60 * np.exp(-tt / 0.03)) * tt) * np.exp(-tt / 0.07)
                place(out, t0 + bt * BEAT, k.astype(np.float32), 0.10)
            sh = np.diff(r.standard_normal(int(0.06 * SR) + 1)) * np.exp(-np.arange(int(0.06 * SR)) / SR / 0.015)
            place(out, t0 + (bt + 0.5) * BEAT, sh.astype(np.float32), 0.006)
        # bell arpeggio (eighths)
        pat = [0, 1, 2, 3, 2, 1, 2, 3] if variant % 2 == 0 else [0, 2, 1, 3, 0, 2, 3, 2]
        tones = [m + 12 for m in ch[1:]] + [ch[1] + 24]
        for k, p in enumerate(pat):
            place(out, t0 + k * BEAT / 2, bell(mtof(tones[p]), 0.9, 1, 0.35), 0.022)
        # melody in variants 1,3
        if variant in (1, 3):
            for k in range(4):
                if r.random() < 0.75:
                    cands = [m for m in PENTA if (m % 12) in [c % 12 for c in ch]] or PENTA
                    m = r.choice(cands) + 12
                    place(out, t0 + k * BEAT + (BEAT / 2 if r.random() < 0.3 else 0), bell(mtof(m), 1.4, 1, 0.6), 0.035)
    return out[:int(8 * BAR * SR)]

loops = [music_loop(v) for v in range(4)]
music = np.zeros(N, np.float32)
pos, v = 0, 0
order = [0, 1, 2, 3]
while pos < N:
    lp = loops[order[v % 4]]; v += 1
    j = min(N, pos + len(lp)); music[pos:j] += lp[:j - pos]; pos = j
music /= np.max(np.abs(music)) + 1e-9

# ducking: voice activity + thinking moments
act = np.abs(voice) > 0.02
win = int(0.25 * SR)
act_s = np.convolve(act.astype(np.float32), np.ones(win) / win, mode='same') > 0.02
gain = np.where(act_s, 0.10, 0.22).astype(np.float32)
for sc in timeline:
    for th in sc['thinks']:
        i0 = int((sc['start'] + th['t']) * SR); i1 = int((sc['start'] + th['t'] + th['d']) * SR)
        gain[i0:i1] = 0.07
# smooth gain
k = int(0.3 * SR)
cs = np.cumsum(np.concatenate([[0], gain]))
gain = ((cs[k:] - cs[:-k]) / k).astype(np.float32)
gain = np.concatenate([gain, np.full(N - len(gain), gain[-1])])
music *= gain
fade = int(2.5 * SR); music[:fade] *= np.linspace(0, 1, fade)
end = int(TOTAL * SR); music[end - 4 * SR:end] *= np.linspace(1, 0, 4 * SR); music[end:] = 0

# ------------------------------------------------------------------ sound effects
def sfx(name):
    if name == 'whoosh':
        d = 1.1; n = int(d * SR); tt = np.arange(n) / SR
        noise = rng.standard_normal(n).astype(np.float32)
        a = 0.02 + 0.25 * np.sin(np.pi * tt / d) ** 2
        s = lowpass(noise, a.astype(np.float32)) * np.sin(np.pi * tt / d) ** 1.5
        return s * 0.9
    if name == 'sparkle':
        out = np.zeros(int(1.3 * SR), np.float32)
        for i in range(9):
            place(out, i * 0.09 + rng.random() * 0.03, bell(mtof(84 + rng.choice([0, 2, 4, 7, 9, 12])), 0.5, 1, 0.18), 0.35)
        return out
    if name == 'tada':
        out = np.zeros(int(2.0 * SR), np.float32)
        for i, m in enumerate([72, 76, 79, 84]):
            place(out, i * 0.09, bell(mtof(m), 1.6, 1, 0.6), 0.4)
        for m in (72, 76, 79):
            place(out, 0.36, bell(mtof(m), 1.6, 1, 0.8), 0.25)
        return out
    if name in ('ding', 'correct'):
        out = np.zeros(int(1.4 * SR), np.float32)
        place(out, 0, bell(mtof(88), 1.2, 1, 0.5), 0.45)
        place(out, 0.11, bell(mtof(95), 1.2, 1, 0.6), 0.45)
        if name == 'correct':
            sp = sfx('sparkle'); out[:len(sp)] += 0.6 * sp[:len(out)]
        return out
    if name == 'pop':
        n = int(0.12 * SR); tt = np.arange(n) / SR
        return (np.sin(2 * np.pi * (700 * np.exp(-tt / 0.03) + 180) * tt) * np.exp(-tt / 0.035) * 0.7).astype(np.float32)
    if name == 'beep':
        n = int(0.22 * SR); tt = np.arange(n) / SR
        return (np.sin(2 * np.pi * 880 * tt) * np.minimum(1, tt / 0.005) * np.exp(-tt / 0.12) * 0.5).astype(np.float32)
    if name == 'beeps':
        out = np.zeros(int(0.9 * SR), np.float32)
        for i, f in enumerate([1200, 900, 1500, 1100]):
            n = int(0.09 * SR); tt = np.arange(n) / SR
            place(out, i * 0.16, (np.sign(np.sin(2 * np.pi * f * tt)) * 0.15 * np.exp(-tt / 0.06)).astype(np.float32))
        return out
    if name == 'rocket':
        d = 4.0; n = int(d * SR); tt = np.arange(n) / SR
        noise = rng.standard_normal(n).astype(np.float32)
        s = lowpass(lowpass(noise, np.float32(0.02)), np.float32(0.05)) * 12
        e = np.minimum(1, tt / 0.6) * np.minimum(1, (d - tt) / 1.8)
        crackle = (rng.random(n) < 0.002) * rng.standard_normal(n) * 0.3
        return ((s + crackle) * e * 0.8).astype(np.float32)
    if name == 'boing':
        n = int(0.6 * SR); tt = np.arange(n) / SR
        f = 220 + 260 * tt / 0.6 + 40 * np.sin(2 * np.pi * 14 * tt) * np.exp(-tt / 0.3)
        ph = 2 * np.pi * np.cumsum(f) / SR
        return (np.sin(ph) * np.exp(-tt / 0.25) * 0.5).astype(np.float32)
    if name == 'stamp':
        n = int(0.4 * SR); tt = np.arange(n) / SR
        th = np.sin(2 * np.pi * (60 + 90 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.09)
        cl = rng.standard_normal(n) * np.exp(-tt / 0.01) * 0.3
        return ((th + cl) * 0.8).astype(np.float32)
    if name in ('tick', 'tock'):
        n = int(0.05 * SR); tt = np.arange(n) / SR
        f = 2400 if name == 'tick' else 1700
        return (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.008) * 0.35).astype(np.float32)
    raise ValueError(name)

fx = np.zeros(N, np.float32)
cache = {}
for at, name in sfx_events:
    if name not in cache: cache[name] = sfx(name)
    place(fx, at, cache[name], 0.5)

mix = voice + music + fx
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix[:int(TOTAL * SR) + SR // 2]
sf.write(os.path.join(OUT, 'audio.wav'), mix, SR, subtype='PCM_16')

# ------------------------------------------------------------------ outputs
json.dump(dict(fps=FPS, total=TOTAL, scenes=timeline, mouth=mouth), open(os.path.join(OUT, 'timeline.json'), 'w'))
def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f'{h:02d}:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}'
with open(os.path.join(OUT, 'captions.srt'), 'w') as f:
    for i, (a, b, txt) in enumerate(captions, 1):
        f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n')
print('done')
