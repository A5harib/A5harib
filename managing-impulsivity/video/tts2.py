import json, re, hashlib, os, subprocess, wave, numpy as np, soundfile as sf
from concurrent.futures import ThreadPoolExecutor
from kokoro_onnx import Kokoro
K = Kokoro('../kokoro/kokoro-v1.0.onnx', '../kokoro/voices-v1.0.bin')
lines = json.load(open('lines.json')); os.makedirs('clips2', exist_ok=True)
# voice, speed, pitch ratio (rubberband, formants shift with pitch = younger/cartoon sound)
V = {'n': ('af_heart', 0.94, 1.0), 'thinky': ('am_puck', 1.02, 1.28), 'omar': ('am_echo', 1.0, 1.30),
     'leo': ('am_liam', 1.02, 1.33), 'zara': ('af_bella', 1.0, 1.20), 'mia': ('af_sky', 1.0, 1.22),
     'mum': ('bf_emma', 0.95, 1.0), 'cashier': ('bm_george', 0.95, 1.0)}
def clean(t):
    t = re.sub(r'\b[A-Z]{2,}\b', lambda m: m.group(0).capitalize() if m.group(0) != 'I' else 'I', t)
    return t.replace('“', '').replace('”', '').replace('Mr. Bilal', 'Mister Bilal').replace('…', '...')
jobs = []
for l in lines:
    key = l['who'] + '|' + l['text']; h = hashlib.md5(key.encode()).hexdigest()[:12]
    whos = ['zara', 'omar', 'mia', 'leo'] if l['who'] == 'all' else [l['who']]
    raws = []
    for i, w in enumerate(whos):
        v, sp, _ = V[w]
        a, sr = K.create(clean(l['text']), voice=v, speed=sp, lang='en-us')
        r = f'clips2/{h}.{i}.raw.wav'; sf.write(r, a, sr); raws.append((r, w))
    jobs.append((key, h, raws))
def post(j):
    key, h, raws = j; outs = []
    for r, w in raws:
        o = r.replace('.raw.wav', '.p.wav'); pr = V[w][2]
        af = (f'rubberband=pitch={pr}:formant=shifted,' if pr != 1 else '') + 'highpass=f=60,acompressor=threshold=-20dB:ratio=3:attack=5:release=80'
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', r, '-af', af, '-ar', '44100', '-ac', '1', o], check=True); outs.append(o)
    out = f'clips2/{h}.wav'
    if len(outs) > 1:
        ins = sum([['-i', o] for o in outs], []); dl = ''.join(f'[{i}]adelay={i*35}[d{i}];' for i in range(len(outs)))
        subprocess.run(['ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', dl + ''.join(f'[d{i}]' for i in range(len(outs))) + f'amix=inputs={len(outs)}:normalize=0,volume=0.55,loudnorm=I=-16:TP=-1.5', out], check=True)
    else:
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', outs[0], '-af', 'loudnorm=I=-16:TP=-1.5:LRA=8', '-ar', '44100', out], check=True)
    for f in outs + [r for r, _ in raws]: os.remove(f)
    with wave.open(out) as w: d = w.getnframes() / w.getframerate()
    return key, h, d
with ThreadPoolExecutor(4) as ex: res = list(ex.map(post, jobs))
json.dump({k: d for k, h, d in res}, open('clips.json', 'w')); json.dump({k: 'clips2/' + h for k, h, d in res}, open('clipfiles.json', 'w'))
print(len(res), 'clips', round(sum(d for _, _, d in res) / 60, 1), 'min')
