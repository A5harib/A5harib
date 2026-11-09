import json, subprocess, hashlib, re, wave, os, sys
from concurrent.futures import ThreadPoolExecutor
lines = json.load(open('lines.json')); os.makedirs('clips', exist_ok=True)
V = {  # voice, speed (wpm), pitch 0-99
 'n':('mb-us1',158,55), 'thinky':('mb-us2',165,92), 'omar':('mb-us2',168,99), 'leo':('mb-us2',172,99),
 'zara':('mb-us1',166,92), 'mia':('mb-us1',166,96), 'mum':('mb-us1',155,42), 'cashier':('mb-us2',155,40)}
def clean(t):
    t = re.sub(r'\b[A-Z]{2,}\b', lambda m: m.group(0).lower(), t)
    t = t.replace('“','').replace('”','').replace('Mr. Bilal','Mister Bilal').replace('...', ', ').replace('…', ', ')
    return t
def synth(who, text, out):
    v, s, p = V[who]
    raw = out + '.raw.wav'
    subprocess.run(['espeak-ng','-v',v,'-s',str(s),'-p',str(p),'-w',raw,clean(text)], check=True, capture_output=True)
    subprocess.run(['ffmpeg','-y','-v','error','-i',raw,'-ar','44100','-ac','1','-af','highpass=f=70,loudnorm=I=-17:TP=-2:LRA=7',out], check=True)
    os.remove(raw)
def job(l):
    key = l['who'] + '|' + l['text']; h = hashlib.md5(key.encode()).hexdigest()[:12]; out = f'clips/{h}.wav'
    if l['who'] == 'all':
        a, b2 = out+'.a.wav', out+'.b.wav'; synth('zara', l['text'], a); synth('omar', l['text'], b2)
        subprocess.run(['ffmpeg','-y','-v','error','-i',a,'-i',b2,'-filter_complex','amix=inputs=2:normalize=0,volume=0.8',out], check=True); os.remove(a); os.remove(b2)
    else: synth(l['who'], l['text'], out)
    with wave.open(out) as w: d = w.getnframes() / w.getframerate()
    return key, h, d
with ThreadPoolExecutor(4) as ex: res = list(ex.map(job, lines))
json.dump({k: d for k, h, d in res}, open('clips.json','w')); json.dump({k: h for k, h, d in res}, open('clipfiles.json','w'))
print(len(res), 'clips', round(sum(d for _,_,d in res)/60,1), 'min of speech')
