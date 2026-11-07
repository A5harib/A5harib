"""Build the "Noun Friends" HyperFrames video.

Steps:
  1. Speak every line with HyperFrames' local TTS (Kokoro) - one voice per character.
  2. Measure each clip so the scenes are timed to the speech, and bake a
     loudness envelope that drives each character's mouth (lip sync).
  3. Synthesize background music + sound effects.
  4. Write index.html (HyperFrames composition animated with GSAP).

Run:  HYPERFRAMES_PYTHON=/path/to/venv/python  python build.py
(the venv needs: kokoro-onnx soundfile numpy)
"""
import hashlib
import html
import json
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE_DIR = os.path.join(ROOT, "assets", "voice")
SFX_DIR = os.path.join(ROOT, "assets", "sfx")
SR = 24000
FPS_MOUTH = 15

# ---------------------------------------------------------------- characters
CHARS = {
    "noun":    {"label": "NOUN",    "voice": "af_heart",   "speed": 0.95, "color": "#8e5cf5", "dark": "#6a3fd1", "shape": "block"},
    "teacher": {"label": "Teacher", "voice": "am_michael", "speed": 0.95, "color": "#21b6a8", "dark": "#14897e", "shape": "block"},
    "school":  {"label": "School",  "voice": "bf_emma",    "speed": 0.95, "color": "#f2683c", "dark": "#c94d26", "shape": "school"},
    "cat":     {"label": "Cat",     "voice": "af_sky",     "speed": 1.0,  "color": "#ffa62b", "dark": "#e08410", "shape": "cat"},
    "apple":   {"label": "Apple",   "voice": "af_nova",    "speed": 0.95, "color": "#ef3b3b", "dark": "#c42323", "shape": "round"},
    "ball":    {"label": "Ball",    "voice": "am_adam",    "speed": 1.0,  "color": "#2f8cff", "dark": "#1c68cc", "shape": "ball"},
}
NAMES = {"noun": "Noun", "teacher": "Teacher", "school": "School", "cat": "Cat",
         "apple": "Apple", "ball": "Ball", "all": "Everyone"}

# ---------------------------------------------------------------- script
# line: (speaker, text, options)
#   pops: [(keyword_in_text, emoji, label)] cards that pop in when the word is said
#   act:  wave | jump
SCENES = [
    {"id": "title", "fixed": 4.2, "bg": "#7fd3ff", "lines": []},
    {"id": "intro", "bg": "#7fd3ff",
     "chars": [("noun", 960, 1.05)],
     "lines": [
        ("noun", "Hello, friends! I am Noun!", {"act": "wave"}),
        ("noun", "A noun is a naming word.", {}),
        ("noun", "A noun can be a person, a place, an animal, or a thing!",
         {"pops": [("person", "👩", "person"), ("place", "🏫", "place"),
                   ("animal", "🐶", "animal"), ("thing", "⚽", "thing")]}),
        ("noun", "Let's meet my noun friends!", {"act": "jump"}),
     ]},
    {"id": "person", "bg": "#ffd36e", "badge": ("👩‍🏫", "PERSON"),
     "chars": [("teacher", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("teacher", "Good morning, class! I am Teacher.", {"act": "wave"}),
        ("teacher", "I am a person. So, I am a noun!", {}),
        ("noun", "Yes! People are nouns. Like mom, dad, baby, and you!",
         {"pops": [("mom", "👩", "mom"), ("dad", "👨", "dad"), ("baby", "👶", "baby"), ("you", "🧒", "you")]}),
     ]},
    {"id": "place", "bg": "#9be59b", "badge": ("🏫", "PLACE"),
     "chars": [("school", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("school", "Hello! I am School.", {"act": "wave"}),
        ("school", "I am a place. Children come to me to learn!", {}),
        ("noun", "Places are nouns too! Like park, home, and zoo!",
         {"pops": [("park", "🌳", "park"), ("home", "🏠", "home"), ("zoo", "🦒", "zoo")]}),
     ]},
    {"id": "animal", "bg": "#ffb3d1", "badge": ("🐾", "ANIMAL"),
     "chars": [("cat", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("cat", "Meow! Meow! I am Cat!", {"act": "jump"}),
        ("cat", "I am an animal. So, I am a noun!", {}),
        ("noun", "Animals are nouns! Like dog, cow, and fish!",
         {"pops": [("dog", "🐶", "dog"), ("cow", "🐮", "cow"), ("fish", "🐟", "fish")]}),
     ]},
    {"id": "thing", "bg": "#a9c8ff", "badge": ("🎁", "THING"),
     "chars": [("apple", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("apple", "Yummy! I am Apple!", {"act": "wave"}),
        ("apple", "I am a thing. You can eat me! So, I am a noun!", {}),
        ("noun", "Things are nouns too! Like ball, book, and car!",
         {"pops": [("ball", "⚽", "ball"), ("book", "📘", "book"), ("car", "🚗", "car")]}),
     ]},
    {"id": "recap", "bg": "#7fd3ff", "badge": ("⭐", "REMEMBER"),
     "chars": [("noun", 960, 0.85)],
     "lines": [
        ("noun", "Let's remember!", {"act": "jump"}),
        ("noun", "A noun names a person, a place, an animal, or a thing!",
         {"big": [("person", "👩", "person"), ("place", "🏫", "place"),
                  ("animal", "🐶", "animal"), ("thing", "⚽", "thing")]}),
     ]},
    {"id": "quiz", "bg": "#ffd36e", "badge": ("❓", "QUIZ TIME"),
     "chars": [("noun", 1600, 0.78), ("ball", 960, 0.85)],
     "lines": [
        ("noun", "Quiz time! Which word is a noun?", {"quiz": True}),
        ("pause", 3.6, {}),
        ("noun", "Ball! Yes! Ball is a thing. So, ball is a noun!", {"answer": True}),
        ("ball", "Boing! Boing! I am Ball. I am a noun!", {"act": "jump", "enter": True}),
     ]},
    {"id": "outro", "bg": "#7fd3ff",
     "chars": [("teacher", 260, 0.66), ("school", 540, 0.66), ("cat", 820, 0.66),
               ("noun", 1100, 0.66), ("apple", 1380, 0.66), ("ball", 1660, 0.66)],
     "lines": [
        ("noun", "Great job, friends! Now you know nouns!", {}),
        ("all", "Bye bye!", {"act": "wave"}),
     ]},
]

GAP = 0.45        # silence between lines
LEAD_IN = 1.1     # before the first line of a scene (entrance)
TAIL = 1.1        # after the last line of a scene


def tts(text, voice, speed, out):
    key = hashlib.md5(f"{text}|{voice}|{speed}".encode()).hexdigest()[:10]
    path = os.path.join(VOICE_DIR, f"{out}-{key}.wav")
    if not os.path.exists(path):
        print("tts:", voice, text)
        r = subprocess.run(["npx", "hyperframes", "tts", text, "-v", voice, "-s", str(speed),
                            "-o", path, "--json"], capture_output=True, text=True, cwd=ROOT)
        if r.returncode != 0 or not os.path.exists(path):
            sys.exit(f"TTS failed: {r.stdout}\n{r.stderr}")
    data, sr = sf.read(path)
    if data.ndim > 1:
        data = data.mean(axis=1)
    # trim silence at the edges so mouths line up with the sound
    thr = 0.01 * np.max(np.abs(data))
    idx = np.where(np.abs(data) > thr)[0]
    a, b = max(0, idx[0] - int(0.03 * sr)), min(len(data), idx[-1] + int(0.08 * sr))
    data = data[a:b]
    sf.write(path, data, sr)
    win = sr // FPS_MOUTH
    env = [float(np.sqrt(np.mean(data[i:i + win] ** 2))) for i in range(0, len(data), win)]
    ref = np.percentile(env, 90) or 1
    env = [round(min(1.0, e / ref), 2) for e in env]
    return os.path.relpath(path, ROOT), len(data) / sr, env


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
    return s


def make_music(total):
    """Gentle plucked arpeggio loop: C - G - Am - F at 100 bpm."""
    beat = 60 / 100
    eighth = beat / 2
    chords = [[261.63, 329.63, 392.0], [196.0, 246.94, 293.66],
              [220.0, 261.63, 329.63], [174.61, 220.0, 261.63]]
    bass = [130.81, 98.0, 110.0, 87.31]
    n = int(SR * (total + 2))
    y = np.zeros(n)
    cache = {}

    def note(f, d, dec):
        k = (f, d, dec)
        if k not in cache:
            cache[k] = pluck(f, d, dec)
        return cache[k]

    pos, bar = 0.0, 0
    while pos < total:
        ch = chords[bar % 4]
        pattern = [ch[0], ch[1], ch[2], ch[1] * 2, ch[2], ch[1], ch[0] * 2, ch[1]]
        st = int(SR * pos)
        b = note(bass[bar % 4], 1.8, 0.998) * 0.8
        y[st:st + len(b)] += b[:max(0, n - st)]
        for i, f in enumerate(pattern):
            s2 = int(SR * (pos + i * eighth))
            p = note(f, 0.9, 0.994) * 0.45
            y[s2:s2 + len(p)] += p[:max(0, n - s2)]
        pos += 8 * eighth
        bar += 1
    y = y[: int(SR * total)]
    fade = int(SR * 2)
    y[-fade:] *= np.linspace(1, 0, fade)
    return write("music.wav", y, 0.8)


# ---------------------------------------------------------------- layout
def build_timeline():
    t = 0.0
    out = []
    for sc in SCENES:
        start = t
        lines = []
        if sc.get("fixed"):
            t += sc["fixed"]
        else:
            t += LEAD_IN
            for i, (spk, text, opt) in enumerate(sc["lines"]):
                if spk == "pause":
                    lines.append({"speaker": "pause", "start": round(t, 3), "dur": text})
                    t += text
                    continue
                if opt.get("enter"):
                    t += 0.9  # time for the character to bounce in
                if spk == "all":
                    clips = []
                    for name, _x, _s in sc["chars"]:
                        c = CHARS[name]
                        p, d, e = tts(text, c["voice"], c["speed"], f"{sc['id']}-{i}-{name}")
                        clips.append({"who": name, "src": p, "dur": d, "env": e})
                    dur = max(c["dur"] for c in clips)
                else:
                    c = CHARS[spk]
                    p, d, e = tts(text, c["voice"], c["speed"], f"{sc['id']}-{i}")
                    clips = [{"who": spk, "src": p, "dur": d, "env": e}]
                    dur = d
                line = {"speaker": spk, "text": text, "start": round(t, 3), "dur": round(dur, 3),
                        "clips": clips, **{k: v for k, v in opt.items()}}
                # keyword timing for pop cards (by position in the sentence)
                for key in ("pops", "big"):
                    if key in opt:
                        line[key] = []
                        low = text.lower()
                        search_from = 0
                        for kw, emoji, label in opt[key]:
                            m = re.search(r"\b" + re.escape(kw) + r"\b", low[search_from:])
                            at = (search_from + m.start()) if m else 0
                            search_from = at + len(kw)
                            line[key].append({"emoji": emoji, "label": label,
                                              "at": round(t + dur * at / len(text) - 0.05, 3)})
                # give young readers time: ~0.5s + 0.3s per word on screen
                hold = max(dur + GAP, 0.6 + 0.3 * len(text.split()) + 0.2)
                line["hold"] = round(hold - 0.15, 3)
                lines.append(line)
                t += hold
            t += TAIL - GAP
        out.append({**{k: v for k, v in sc.items() if k != "lines"},
                    "start": round(start, 3), "dur": round(t - start, 3), "lines": lines})
    return out, round(t, 3)


# ---------------------------------------------------------------- html
def char_html(name, x, scale, sid, facing):
    c = CHARS[name]
    shape = c["shape"]
    extra = ""
    if name == "noun":
        extra = '<div class="antenna"></div><div class="star"></div>'
    elif name == "teacher":
        extra = '<div class="hair"></div><div class="bun"></div>'
    elif shape == "school":
        extra = '<div class="roof"></div><div class="bell"></div><div class="door"></div>'
    elif shape == "cat":
        extra = '<div class="tail"></div><div class="ear l"><i></i></div><div class="ear r"><i></i></div>'
    elif name == "apple":
        extra = '<div class="stem"></div><div class="leaf"></div>'
    elif name == "ball":
        extra = '<div class="stripe"></div><div class="shine"></div>'
    glasses = '<div class="glasses"><b></b><b></b></div>' if name == "teacher" else ""
    whiskers = '<div class="whiskers l"><s></s><s></s></div><div class="whiskers r"><s></s><s></s></div><div class="nose"></div>' if shape == "cat" else ""
    cid = f"{sid}-{name}"
    return f'''
      <div class="char-pos" style="left:{x}px; --sz:{scale}; --c:{c['color']}; --d:{c['dark']};">
        <div class="char-in" id="{cid}">
          <div class="char-bob shape-{shape}">
            <div class="leg l"><div class="shoe"></div></div><div class="leg r"><div class="shoe"></div></div>
            <div class="arm l"><div class="hand"></div></div><div class="arm r"><div class="hand"></div></div>
            {extra}
            <div class="body">
              <div class="face" data-facing="{facing}">
                <div class="eye l"><div class="pupil"><i></i></div><div class="lid"></div></div>
                <div class="eye r"><div class="pupil"><i></i></div><div class="lid"></div></div>
                {glasses}{whiskers}
                <div class="cheek l"></div><div class="cheek r"></div>
                <div class="mouth"><div class="tongue"></div></div>
              </div>
              <div class="label">{c['label']}</div>
            </div>
          </div>
        </div>
      </div>'''


def caption_html(text):
    def repl(m):
        w = m.group(0)
        lw = w.lower()
        cls = "hl-noun" if lw.startswith("noun") else "hl-kind"
        return f'<span class="{cls}">{w}</span>'
    esc = html.escape(text)
    return re.sub(r"\b(nouns?|person|people|place|places|animal|animals|thing|things)\b", repl, esc, flags=re.I)


def build_html(scenes, total, sfx, music):
    parts, audio, caps = [], [], []
    rng = np.random.default_rng(42)
    for si, sc in enumerate(scenes):
        sid = sc["id"]
        inner = []
        # background
        inner.append(f'''
      <div class="sky" style="--sky:{sc['bg']}"></div>
      <div class="sun"><div class="rays"></div><div class="sun-core"></div></div>
      <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
      <div class="hill h1"></div><div class="hill h2"></div><div class="ground"></div>
      <div class="flowers">{''.join(f'<span style="left:{int(x)}px">{f}</span>' for x, f in zip(np.linspace(40, 1860, 9), "🌼🌷🌼🌸🌼🌷🌸🌼🌷"))}</div>''')
        if sid == "title":
            word = "".join(f'<span class="tl" style="--i:{i}">{ch}</span>' for i, ch in enumerate("NOUNS"))
            inner.append(f'''
      <div class="title-wrap">
        <div class="title-top">Let's learn about</div>
        <div class="title-word">{word}</div>
        <div class="title-sub">🍎 🐱 🏫 👩‍🏫</div>
      </div>''')
        if sc.get("badge"):
            em, txt = sc["badge"]
            inner.append(f'<div class="badge"><span class="b-em">{em}</span><span class="b-tx">{txt}</span></div>')
        for idx, (name, x, s) in enumerate(sc.get("chars", [])):
            facing = 1 if x < 960 else (-1 if x > 960 else 0)
            if sid == "outro":
                facing = 0
            inner.append(char_html(name, x, s, sid, facing))
        for li, ln in enumerate(sc["lines"]):
            if ln["speaker"] == "pause":
                for k in range(3):
                    inner.append(f'<div class="count" id="{sid}-count{k}">{3 - k}</div>')
                continue
            for pk, key in (("pops", "pop"), ("big", "big")):
                if pk in ln:
                    cards = "".join(f'<div class="{key}-card" id="{sid}-{li}-{key}{k}"><div class="em">{p["emoji"]}</div><div class="lb">{p["label"]}</div></div>'
                                    for k, p in enumerate(ln[pk]))
                    inner.append(f'<div class="{key}-row" id="{sid}-{li}-{key}row">{cards}</div>')
            if ln.get("quiz"):
                inner.append('''<div class="quiz-row">
          <div class="qcard" id="q-jump">jump</div><div class="qcard" id="q-ball">ball</div><div class="qcard" id="q-happy">happy</div></div>''')
            # audio + caption
            for ci, cl in enumerate(ln["clips"]):
                audio.append(f'<audio id="vo-{sid}-{li}-{ci}" src="{cl["src"]}" data-start="{ln["start"]}" data-duration="{round(cl["dur"], 3)}" data-volume="1" data-track-index="{10 + ci}"></audio>')
            cap_id = f"cap-{sid}-{li}"
            spk = ln["speaker"]
            col = CHARS[spk]["dark"] if spk in CHARS else "#d6246f"
            caps.append(f'''<div class="clip caption" id="{cap_id}" data-start="{ln['start']}" data-duration="{ln['hold']:.3f}" data-track-index="3">
        <div class="cap-in"><div class="who" style="background:{col}">{NAMES[spk]}</div><div class="cap-text">{caption_html(ln['text'])}</div></div></div>''')
        if sid == "outro":
            conf = []
            cols = ["#ff5fa2", "#ffd23f", "#3bceac", "#2f8cff", "#8e5cf5", "#ef3b3b"]
            for k in range(70):
                conf.append(f'<i class="cf" style="left:{int(rng.uniform(0, 1920))}px; background:{cols[k % 6]}; width:{int(rng.uniform(14, 26))}px; height:{int(rng.uniform(22, 38))}px" data-dx="{int(rng.uniform(-160, 160))}" data-r="{int(rng.uniform(-720, 720))}" data-d="{rng.uniform(0, 1.6):.2f}" data-sp="{rng.uniform(2.6, 4.2):.2f}"></i>')
            inner.append(f'<div class="confetti">{"".join(conf)}</div>')
            inner.append('<div class="end-text">You did it! ⭐</div>')
        parts.append(f'''
    <div class="clip scene" id="scene-{sid}" data-start="{sc['start']}" data-duration="{sc['dur']}" data-track-index="1">{''.join(inner)}
    </div>''')

    # sfx placement
    sfx_list = [("jingle", 0.25, 2.4, 0.8)]
    for sc in scenes[1:]:
        sfx_list.append(("whoosh", sc["start"] - 0.3, 0.55, 0.7))
        for ln in sc["lines"]:
            for key in ("pops", "big"):
                for p in ln.get(key, []):
                    sfx_list.append(("pop", p["at"], 0.18, 0.7))
            if ln["speaker"] == "pause":
                for k in range(3):
                    sfx_list.append(("tick", ln["start"] + 0.2 + k * 1.1, 0.1, 0.8))
            if ln.get("answer"):
                sfx_list.append(("ding", ln["start"] - 0.25, 1.2, 0.6))
            if ln.get("act") == "jump":
                sfx_list.append(("boing", ln["start"] + 0.05, 0.45, 0.5))
            if ln.get("enter"):
                sfx_list.append(("boing", ln["start"] - 0.85, 0.45, 0.5))
    for i, (k, st, d, v) in enumerate(sfx_list):
        audio.append(f'<audio id="sfx-{i}" src="{sfx[k]}" data-start="{max(0, round(st, 3))}" data-duration="{d}" data-volume="{v}" data-track-index="20"></audio>')
    audio.append(f'<audio id="music" src="{music}" data-start="0" data-duration="{total}" data-volume="0.16" data-fade-in="1" data-fade-out="2" data-track-index="30"></audio>')

    data = json.dumps({"total": total, "scenes": scenes}, ensure_ascii=False)
    tpl = open(os.path.join(ROOT, "page.tpl"), encoding="utf-8").read()
    out = (tpl.replace("{{TOTAL}}", str(total))
              .replace("{{SCENES}}", "".join(parts))
              .replace("{{CAPTIONS}}", "\n    ".join(caps))
              .replace("{{AUDIO}}", "\n    ".join(audio))
              .replace("{{DATA}}", data))
    open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(out)


if __name__ == "__main__":
    os.makedirs(VOICE_DIR, exist_ok=True)
    os.makedirs(SFX_DIR, exist_ok=True)
    scenes, total = build_timeline()
    sfx = make_sfx()
    music = make_music(total)
    build_html(scenes, total, sfx, music)
    print(f"built index.html  total={total}s  scenes={len(scenes)}")
