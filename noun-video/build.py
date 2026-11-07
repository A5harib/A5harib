"""Build the "Noun Friends" HyperFrames video.

Steps:
  1. Speak every line with HyperFrames' local TTS (Kokoro) - one voice per character.
  2. Measure each clip: scene timing follows the speech, a loudness envelope
     drives each character's mouth (lip sync), and word timings (estimated from
     the pauses in the audio) drive karaoke captions and pop-ups.
  3. Synthesize music + sound effects (audio.py).
  4. Write index.html (HyperFrames composition, animated with GSAP in page.tpl).

Run:  HYPERFRAMES_PYTHON=/path/to/venv/python  /path/to/venv/python build.py
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

from audio import make_music, make_sfx

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE_DIR = os.path.join(ROOT, "assets", "voice")
FPS_MOUTH = 15

# ---------------------------------------------------------------- characters
CHARS = {
    "noun":    {"label": "NOUN",    "voice": "af_heart",   "speed": 0.8, "color": "#8e5cf5", "light": "#c4a6ff", "dark": "#6a3fd1", "shape": "block"},
    "teacher": {"label": "Teacher", "voice": "am_michael", "speed": 0.8, "color": "#21b6a8", "light": "#7fe6dc", "dark": "#0f7f75", "shape": "block"},
    "school":  {"label": "School",  "voice": "bf_emma",    "speed": 0.8, "color": "#f2683c", "light": "#ffaa85", "dark": "#c2471f", "shape": "school"},
    "cat":     {"label": "Cat",     "voice": "af_sky",     "speed": 0.85,  "color": "#ffa62b", "light": "#ffd28a", "dark": "#cf7406", "shape": "cat"},
    "apple":   {"label": "Apple",   "voice": "af_nova",    "speed": 0.8, "color": "#ef3b3b", "light": "#ff8f8f", "dark": "#b81d1d", "shape": "round"},
    "ball":    {"label": "Ball",    "voice": "am_adam",    "speed": 0.85,  "color": "#2f8cff", "light": "#8cc2ff", "dark": "#1559b8", "shape": "ball"},
}
NAMES = {"noun": "Noun", "teacher": "Teacher", "school": "School", "cat": "Cat",
         "apple": "Apple", "ball": "Ball", "all": "Everyone"}

# sky top / sky bottom / hill colours per theme
THEMES = {
    "sky":    ("#3fb8ff", "#bfeaff", "#7ddc6a", "#5cc451"),
    "sunny":  ("#ff9f43", "#ffe39a", "#8fdc5e", "#69c447"),
    "mint":   ("#2ec4b6", "#c9f7ec", "#86e07a", "#5fc65a"),
    "candy":  ("#ff6fb5", "#ffd6ec", "#8fe08a", "#6cc96b"),
    "lilac":  ("#7b8cff", "#dfe4ff", "#7fdb8c", "#58c46c"),
}
CAT_COLORS = {"person": "#e8317f", "place": "#10995a", "animal": "#f07c00", "thing": "#1f6fe0"}

# ---------------------------------------------------------------- script
# line: (speaker, text, options)
#   pops:  [(keyword, emoji, label)]  picture cards that pop in as the word is said
#   big:   same, large recap cards
#   act:   wave | jump        enter: character bounces in just before the line
#   show:  [element ids]      pop in at line start
#   opts:  [(keyword, id)]    pop in as the word is said (from: start searching after this word)
#   marks: [(id, keyword|None)] mark as correct (None = at line start)
#   dim:   [ids]              fade wrong answers   star: n  fill star n
# ("pause", seconds, {"timer": True}) = thinking time with a countdown ring
S = [
    {"id": "title", "kind": "title", "theme": "sky", "fixed": 5.6, "rainbow": True,
     "chars": [("teacher", 330, 0.5), ("school", 590, 0.5), ("cat", 850, 0.5),
               ("apple", 1110, 0.5), ("ball", 1370, 0.5), ("noun", 1630, 0.5)],
     "lines": []},
    {"id": "intro", "theme": "sky", "rainbow": True,
     "chars": [("noun", 960, 1.0)],
     "lines": [
        ("noun", "Hello, friends! I am Noun!", {"act": "wave"}),
        ("noun", "A noun is a naming word.", {}),
        ("noun", "A noun can be a person, a place, an animal, or a thing!",
         {"pops": [("person", "👩", "person"), ("place", "🏫", "place"),
                   ("animal", "🐶", "animal"), ("thing", "⚽", "thing")]}),
        ("noun", "Let's meet my noun friends!", {"act": "jump"}),
     ]},
    {"id": "person", "theme": "sunny", "badge": ("👩‍🏫", "PERSON", "person"),
     "chars": [("teacher", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("teacher", "Good morning, class! I am Teacher.", {"act": "wave"}),
        ("teacher", "I am a person. So, I am a noun!", {}),
        ("noun", "Yes! People are nouns. Like mom, dad, baby, and you!",
         {"pops": [("mom", "👩", "mom"), ("dad", "👨", "dad"), ("baby", "👶", "baby"), ("you", "🧒", "you")]}),
     ]},
    {"id": "place", "theme": "mint", "badge": ("🏫", "PLACE", "place"),
     "chars": [("school", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("school", "Hello! I am School.", {"act": "wave"}),
        ("school", "I am a place. Children come to me to learn!", {}),
        ("noun", "Places are nouns too! Like park, home, and zoo!",
         {"pops": [("park", "🌳", "park"), ("home", "🏠", "home"), ("zoo", "🦒", "zoo")]}),
     ]},
    {"id": "animal", "theme": "candy", "badge": ("🐾", "ANIMAL", "animal"),
     "chars": [("cat", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("cat", "Meow! Meow! I am Cat!", {"act": "jump"}),
        ("cat", "I am an animal. So, I am a noun!", {}),
        ("noun", "Animals are nouns! Like dog, cow, and fish!",
         {"pops": [("dog", "🐶", "dog"), ("cow", "🐮", "cow"), ("fish", "🐟", "fish")]}),
     ]},
    {"id": "thing", "theme": "lilac", "badge": ("🎁", "THING", "thing"),
     "chars": [("apple", 470, 1.0), ("noun", 1560, 0.78)],
     "lines": [
        ("apple", "Yummy! I am Apple!", {"act": "wave"}),
        ("apple", "I am a thing. You can eat me! So, I am a noun!", {}),
        ("noun", "Things are nouns too! Like ball, book, and car!",
         {"pops": [("ball", "⚽", "ball"), ("book", "📘", "book"), ("car", "🚗", "car")]}),
     ]},
    {"id": "recap", "theme": "sky", "rainbow": True, "badge": ("⭐", "REMEMBER", "person"),
     "chars": [("noun", 960, 0.85)],
     "lines": [
        ("noun", "Let's remember!", {"act": "jump"}),
        ("noun", "A noun names a person, a place, an animal, or a thing!",
         {"big": [("person", "👩", "person"), ("place", "🏫", "place"),
                  ("animal", "🐶", "animal"), ("thing", "⚽", "thing")]}),
     ]},

    # ------------------------------------------------------------ quiz show
    {"id": "qintro", "kind": "quiz", "badge": ("🎮", "NOUN GAME", "person"), "stars": 0,
     "chars": [("noun", 1450, 0.9)],
     "q": {"type": "intro"},
     "lines": [
        ("noun", "Now, let's play the Noun Game!", {"act": "jump", "show": ["qtext"]}),
        ("noun", "You get a star for every right answer. Are you ready?", {"act": "wave", "show": ["meterhi"]}),
     ]},
    {"id": "r1", "kind": "quiz", "badge": ("1️⃣", "ROUND 1", "animal"), "stars": 0,
     "chars": [("noun", 1660, 0.72)],
     "q": {"type": "pick", "question": "Which one is a noun?",
           "options": [("run", "🏃"), ("dog", "🐶"), ("happy", "😊")]},
     "lines": [
        ("noun", "Round one! Which one is a noun? Run, dog, or happy?",
         {"show": ["qtext"], "opts": [("run", "opt0"), ("dog", "opt1"), ("happy", "opt2")], "from": "noun"}),
        ("pause", 4.6, {"timer": True}),
        ("noun", "Dog! A dog is an animal. So, dog is a noun!",
         {"marks": [("opt1", None)], "dim": ["opt0", "opt2"], "star": 1}),
     ]},
    {"id": "r2a", "kind": "quiz", "badge": ("2️⃣", "ROUND 2", "place"), "stars": 1,
     "chars": [("teacher", 1660, 0.72)],
     "q": {"type": "group", "question": "Person, place, animal, or thing?", "item": ("doctor", "👩‍⚕️")},
     "lines": [
        ("teacher", "Round two! Look, a doctor! Is a doctor a person, a place, an animal, or a thing?",
         {"show": ["qtext", "item"], "opts": [("person", "opt0"), ("place", "opt1"), ("animal", "opt2"), ("thing", "opt3")], "from": "doctor?"}),
        ("pause", 4.6, {"timer": True}),
        ("teacher", "A person! A doctor is a person. So, doctor is a noun!",
         {"marks": [("opt0", None)], "dim": ["opt1", "opt2", "opt3"], "star": 2}),
     ]},
    {"id": "r2b", "kind": "quiz", "badge": ("2️⃣", "ROUND 2", "place"), "stars": 2,
     "chars": [("school", 1660, 0.72)],
     "q": {"type": "group", "question": "Person, place, animal, or thing?", "item": ("park", "🎠")},
     "lines": [
        ("school", "Now, what about a park? Is a park a person, a place, an animal, or a thing?",
         {"show": ["qtext", "item"], "opts": [("person", "opt0"), ("place", "opt1"), ("animal", "opt2"), ("thing", "opt3")], "from": "park?"}),
        ("pause", 4.6, {"timer": True}),
        ("school", "A place! We play at the park. So, park is a noun!",
         {"marks": [("opt1", None)], "dim": ["opt0", "opt2", "opt3"], "star": 3}),
     ]},
    {"id": "r3", "kind": "quiz", "badge": ("3️⃣", "ROUND 3", "thing"), "stars": 3,
     "chars": [("cat", 1660, 0.72)],
     "q": {"type": "sentence", "question": "Find the noun in the sentence!",
           "words": ["The", "bird", "can", "fly."], "pic": "🐦"},
     "lines": [
        ("cat", "Round three! Find the noun in this sentence. The bird can fly.",
         {"show": ["qtext"], "opts": [("the", "w0"), ("bird", "w1"), ("can", "w2"), ("fly", "w3")], "from": "sentence."}),
        ("pause", 4.6, {"timer": True}),
        ("cat", "Bird! A bird is an animal. So, bird is the noun!",
         {"marks": [("w1", None)], "dim": ["w0", "w2", "w3"], "star": 4, "show_at": [("pic", "animal.")]}),
     ]},
    {"id": "r4", "kind": "quiz", "badge": ("4️⃣", "LAST ROUND", "person"), "stars": 4,
     "chars": [("apple", 1660, 0.72)],
     "q": {"type": "count", "question": "How many nouns?", "words": ["The", "boy", "has", "a", "kite."],
           "nums": [1, 2, 3], "pics": [(1, "👦"), (4, "🪁")]},
     "lines": [
        ("apple", "Last round! How many nouns are in this sentence? The boy has a kite.",
         {"show": ["qtext"], "opts": [("the", "w0"), ("boy", "w1"), ("has", "w2"), ("a", "w3"), ("kite", "w4")],
          "from": "sentence?", "show_end": ["n0", "n1", "n2"]}),
        ("pause", 4.6, {"timer": True}),
        ("apple", "Two! Boy is a person, and kite is a thing. Two nouns!",
         {"marks": [("n1", None), ("w1", "boy"), ("w4", "kite.")], "dim": ["n0", "n2", "w0", "w2", "w3"], "star": 5,
          "show_at": [("pic1", "boy"), ("pic4", "kite.")]}),
     ]},
    {"id": "result", "kind": "result", "badge": ("🏆", "GREAT JOB", "place"), "stars": 5,
     "chars": [("noun", 1530, 0.85)],
     "lines": [
        ("noun", "Wow! You got five stars!", {"act": "jump", "allstars": True}),
        ("noun", "You are a Noun Star! Hooray!", {"act": "wave", "show": ["medal"]}),
     ]},
    {"id": "outro", "theme": "sky", "rainbow": True,
     "chars": [("teacher", 260, 0.66), ("school", 540, 0.66), ("cat", 820, 0.66),
               ("noun", 1100, 0.66), ("apple", 1380, 0.66), ("ball", 1660, 0.66)],
     "lines": [
        ("noun", "Thank you for playing, friends! Now you know nouns!", {}),
        ("all", "Bye bye!", {"act": "wave"}),
     ]},
]

GAP = 0.45
LEAD_IN = 1.2
TAIL = 1.1


# ---------------------------------------------------------------- speech
def _synth(text, voice, speed):
    """One phrase through HyperFrames TTS (cached), edges trimmed."""
    key = hashlib.md5(f"{text}|{voice}|{speed}".encode()).hexdigest()[:12]
    path = os.path.join(VOICE_DIR, "parts", f"{key}.wav")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print("tts:", voice, text)
        r = subprocess.run(["npx", "hyperframes", "tts", text, "-v", voice, "-s", str(speed),
                            "-o", path, "--json"], capture_output=True, text=True, cwd=ROOT)
        if r.returncode != 0 or not os.path.exists(path):
            sys.exit(f"TTS failed: {r.stdout}\n{r.stderr}")
    data, sr = sf.read(path)
    if data.ndim > 1:
        data = data.mean(axis=1)
    thr = 0.02 * np.max(np.abs(data))
    idx = np.where(np.abs(data) > thr)[0]
    return data[max(0, idx[0] - int(0.02 * sr)):min(len(data), idx[-1] + int(0.05 * sr))], sr


def tts(text, voice, speed, out):
    """Speak a line phrase by phrase with child-friendly pauses in between.
    Returns (wav path, duration, mouth envelope, start time of every word)."""
    phrases = [p.strip() for p in re.findall(r"[^,.!?]+[,.!?]*", text) if p.strip()]
    pieces, word_t, t = [], [], 0.0
    sr = 24000
    for i, ph in enumerate(phrases):
        data, sr = _synth(ph, voice, speed)
        words = ph.split()
        weight = [len(re.sub(r"\W", "", w)) + 2 for w in words]
        dur = len(data) / sr
        acc = 0
        for w in weight:
            word_t.append(round(t + dur * acc / sum(weight), 3))
            acc += w
        pieces.append(data)
        t += dur
        if i < len(phrases) - 1:
            gap = 0.22 if ph.endswith(",") else 0.38
            pieces.append(np.zeros(int(sr * gap)))
            t += gap
    data = np.concatenate(pieces)
    key = hashlib.md5(f"{text}|{voice}|{speed}".encode()).hexdigest()[:10]
    path = os.path.join(VOICE_DIR, f"{out}-{key}.wav")
    sf.write(path, data, sr)
    win = sr // FPS_MOUTH
    env = [float(np.sqrt(np.mean(data[i:i + win] ** 2))) for i in range(0, len(data), win)]
    ref = np.percentile(env, 90) or 1
    env = [round(min(1.0, e / ref), 2) for e in env]
    return os.path.relpath(path, ROOT), len(data) / sr, env, word_t


def find_word(words, kw, start=0):
    for i in range(start, len(words)):
        if re.sub(r"[^\w']", "", words[i].lower()) == re.sub(r"[^\w']", "", kw.lower()):
            return i
    return None


# ---------------------------------------------------------------- layout
def build_timeline():
    t = 0.0
    out = []
    for sc in S:
        start = t
        lines = []
        if sc.get("fixed"):
            t += sc["fixed"]
        else:
            t += LEAD_IN
            for i, (spk, text, opt) in enumerate(sc["lines"]):
                if spk == "pause":
                    lines.append({"speaker": "pause", "start": round(t, 3), "dur": text, **opt})
                    t += text
                    continue
                if opt.get("enter"):
                    t += 0.9
                if spk == "all":
                    clips = []
                    for name, _x, _s in sc["chars"]:
                        c = CHARS[name]
                        p, d, e, wt = tts(text, c["voice"], c["speed"], f"{sc['id']}-{i}-{name}")
                        clips.append({"who": name, "src": p, "dur": d, "env": e})
                    dur = max(c["dur"] for c in clips)
                else:
                    c = CHARS[spk]
                    p, d, e, wt = tts(text, c["voice"], c["speed"], f"{sc['id']}-{i}")
                    clips = [{"who": spk, "src": p, "dur": d, "env": e}]
                    dur = d
                words = text.split()
                abs_wt = [round(t + w, 3) for w in wt]
                line = {"speaker": spk, "text": text, "start": round(t, 3), "dur": round(dur, 3),
                        "clips": clips, "wt": abs_wt}
                for k in ("act", "enter", "show", "dim", "star", "allstars", "show_end"):
                    if k in opt:
                        line[k] = opt[k]

                def at_word(kw, frm=0):
                    wi = find_word(words, kw, frm)
                    return (abs_wt[wi] if wi is not None else t), (wi if wi is not None else frm)

                for key in ("pops", "big"):
                    if key in opt:
                        line[key], pos = [], 0
                        for kw, emoji, label in opt[key]:
                            at, wi = at_word(kw, pos)
                            pos = wi + 1
                            line[key].append({"emoji": emoji, "label": label, "at": round(at - 0.05, 3)})
                if "opts" in opt:
                    pos = (find_word(words, opt["from"]) + 1) if opt.get("from") else 0
                    line["opts"] = []
                    for kw, oid in opt["opts"]:
                        at, wi = at_word(kw, pos)
                        pos = wi + 1
                        line["opts"].append({"id": oid, "at": round(at - 0.05, 3)})
                if "marks" in opt:
                    line["marks"] = [{"id": mid, "at": round((at_word(kw)[0] - 0.05) if kw else t - 0.25, 3)}
                                     for mid, kw in opt["marks"]]
                if "show_at" in opt:
                    line["show_at"] = [{"id": sid_, "at": round(at_word(kw)[0], 3)} for sid_, kw in opt["show_at"]]
                hold = max(dur + GAP, 0.6 + 0.3 * len(words) + 0.2)
                line["hold"] = round(hold - 0.15, 3)
                lines.append(line)
                t += hold
            t += TAIL - GAP
        meta = {k: v for k, v in sc.items() if k not in ("lines",)}
        out.append({**meta, "start": round(start, 3), "dur": round(t - start, 3), "lines": lines})
    return out, round(t, 3)


# ---------------------------------------------------------------- html pieces
def char_html(name, x, scale, sid, facing):
    c = CHARS[name]
    shape = c["shape"]
    extra = {
        "noun": '<div class="antenna"></div><div class="star"></div>',
        "teacher": '<div class="hair"></div><div class="bun"></div>',
        "school": '<div class="roof"><i></i></div><div class="bell"></div><div class="flag"></div>',
        "cat": '<div class="tail"></div><div class="ear l"><i></i></div><div class="ear r"><i></i></div>',
        "apple": '<div class="stem"></div><div class="leaf"></div>',
        "ball": '<div class="shine"></div>',
    }[name]
    glasses = '<div class="glasses"><b></b><b></b></div>' if name == "teacher" else ""
    whiskers = ('<div class="whiskers l"><s></s><s></s></div><div class="whiskers r"><s></s><s></s></div>'
                '<div class="nose"></div>') if shape == "cat" else ""
    return f'''
      <div class="char-pos" style="left:{x}px; --sz:{scale}; --c:{c['color']}; --l:{c['light']}; --d:{c['dark']};">
        <div class="shadow" id="{sid}-{name}-sh"></div>
        <div class="char-in" id="{sid}-{name}">
          <div class="char-bob shape-{shape}">
            <div class="leg l"><div class="shoe"></div></div><div class="leg r"><div class="shoe"></div></div>
            <div class="arm l"><div class="hand"></div></div><div class="arm r"><div class="hand"></div></div>
            {extra}
            <div class="body"><div class="gloss"></div>
              <div class="face" data-facing="{facing}">
                <div class="brow l"></div><div class="brow r"></div>
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


KEYWORDS = r"^(nouns?|person|people|place|places|animal|animals|thing|things)$"


def caption_html(text):
    out = []
    for w in text.split():
        core = re.sub(r"[^\w']", "", w).lower()
        cls = "w"
        if re.match(KEYWORDS, core):
            cls += " kw-noun" if core.startswith("noun") else " kw-kind"
        out.append(f'<span class="{cls}">{html.escape(w)}</span>')
    return " ".join(out)


def outdoor_bg(theme, rainbow, rng):
    top, bot, h1, h2 = THEMES[theme]
    trees = "".join(
        f'<div class="tree" style="left:{x}px; bottom:{b}px; --s:{s}"><i></i></div>'
        for x, b, s in [(150, 330, 0.8), (310, 300, 1.0), (1290, 320, 0.9), (1430, 345, 0.7), (1780, 300, 1.05)])
    sparkles = "".join(
        f'<i class="spk" style="left:{int(rng.uniform(60, 1860))}px; top:{int(rng.uniform(60, 520))}px; --s:{rng.uniform(0.6, 1.2):.2f}"></i>'
        for _ in range(12))
    flowers = "".join(
        f'<span data-layout-allow-occlusion style="left:{int(x)}px">{f}</span>'
        for x, f in zip(np.linspace(40, 1860, 11), "🌼🌷🌸🌼🌻🌷🌸🌼🌻🌷🌸"))
    rb = '<div class="rainbow"></div>' if rainbow else ""
    return f'''
      <div class="sky" style="--top:{top}; --bot:{bot}"></div>
      {rb}
      <div class="sun"><div class="rays"></div><div class="sun-core"><b class="se l"></b><b class="se r"></b><b class="sm"></b></div></div>
      <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
      <div class="sparkles">{sparkles}</div>
      <div class="hill h1" style="--h:{h1}"></div><div class="hill h2" style="--h:{h2}"></div>
      {trees}
      <div class="ground"><div class="grass"></div></div>
      <div class="bfly b1" data-layout-allow-overlap data-layout-allow-occlusion>🦋</div><div class="bfly b2" data-layout-allow-overlap data-layout-allow-occlusion>🦋</div>
      <div class="flowers" data-layout-allow-occlusion>{flowers}</div>'''


def stage_bg(rng):
    bulbs = "".join(f'<i style="left:{int(x)}px"></i>' for x in np.linspace(30, 1890, 32))
    sparkles = "".join(
        f'<i class="spk" style="left:{int(rng.uniform(60, 1860))}px; top:{int(rng.uniform(60, 700))}px; --s:{rng.uniform(0.5, 1.1):.2f}"></i>'
        for _ in range(16))
    return f'''
      <div class="stage-bg"></div>
      <div class="beams"></div>
      <div class="sparkles">{sparkles}</div>
      <div class="curtain l"></div><div class="curtain r"></div>
      <div class="valance"></div>
      <div class="bulbs">{bulbs}</div>
      <div class="floor"></div>'''


def star_meter(sid, filled):
    stars = "".join(f'<div class="ms{" on" if i < filled else ""}" id="{sid}-ms{i + 1}"><b>★</b></div>' for i in range(5))
    return f'<div class="meter" id="{sid}-meter">{stars}</div>'


def burst():
    return '<div class="burst" data-layout-allow-occlusion>' + "".join(f'<i style="--a:{a}deg"><b></b></i>' for a in range(0, 360, 45)) + "</div>"


def quiz_html(sc):
    sid, q = sc["id"], sc["q"]
    h = []
    if q["type"] == "intro":
        h.append(f'<div class="qtext big-q" id="{sid}-qtext">🎉 The Noun Game 🎉</div>')
        h.append(f'<div class="meter-hint" id="{sid}-meterhi">⭐ ⭐ ⭐ ⭐ ⭐<span>Win 5 stars!</span></div>')
        return "".join(h)
    h.append(f'<div class="qtext" id="{sid}-qtext">{html.escape(q["question"])}</div>')
    if q["type"] == "pick":
        cards = "".join(
            f'<div class="opt pick" data-layout-allow-occlusion id="{sid}-opt{k}"><div class="em">{em}</div><div class="lb">{w}</div><div class="chk">✓</div>{burst()}</div>'
            for k, (w, em) in enumerate(q["options"]))
        h.append(f'<div class="qarea pick-row">{cards}</div>')
    elif q["type"] == "group":
        w, em = q["item"]
        cats = [("person", "🧑"), ("place", "🏡"), ("animal", "🐾"), ("thing", "🎁")]
        btns = "".join(
            f'<div class="opt cat" data-layout-allow-occlusion id="{sid}-opt{k}" style="--cc:{CAT_COLORS[c]}"><span class="em">{e}</span><span class="lb">{c}</span><div class="chk">✓</div>{burst()}</div>'
            for k, (c, e) in enumerate(cats))
        h.append(f'''<div class="qarea group">
          <div class="item" id="{sid}-item"><div class="em">{em}</div><div class="lb">{w}</div></div>
          <div class="arrow">➜</div>
          <div class="cat-grid">{btns}</div></div>''')
    elif q["type"] in ("sentence", "count"):
        tiles = "".join(f'<div class="opt tile" data-layout-allow-occlusion id="{sid}-w{k}">{html.escape(w)}<div class="chk">✓</div>{burst()}</div>'
                        for k, w in enumerate(q["words"]))
        pics = ""
        if q.get("pic"):
            pics = f'<div class="pic" data-layout-allow-occlusion id="{sid}-pic">{q["pic"]}</div>'
        for wi, em in q.get("pics", []):
            pics += f'<div class="pic small" data-layout-allow-occlusion id="{sid}-pic{wi}" data-w="{wi}">{em}</div>'
        nums = ""
        if q.get("nums"):
            nums = '<div class="nums">' + "".join(
                f'<div class="opt num" data-layout-allow-occlusion id="{sid}-n{k}">{n}<div class="chk">✓</div>{burst()}</div>' for k, n in enumerate(q["nums"])) + "</div>"
        h.append(f'<div class="qarea sent {q["type"]}"><div class="pics" data-layout-allow-occlusion>{pics}</div><div class="tiles">{tiles}</div>{nums}</div>')
    # countdown timer
    h.append(f'''<div class="timer" id="{sid}-timer">
        <svg viewBox="0 0 200 200"><circle class="tr-bg" cx="100" cy="100" r="84"/><circle class="tr" cx="100" cy="100" r="84"/></svg>
        {''.join(f'<div class="tn" id="{sid}-tn{n}">{n}</div>' for n in (4, 3, 2, 1))}
      </div>
      <div class="sayit" id="{sid}-sayit">🗣️ Say it out loud!</div>''')
    return "".join(h)


def result_html(sid):
    stars = "".join(f'<div class="rs" id="{sid}-rs{i + 1}">★</div>' for i in range(5))
    return f'''
      <div class="trophy-wrap"><div class="trophy-rays"></div><div class="trophy">🏆</div></div>
      <div class="rstars">{stars}</div>
      <div class="medal" id="{sid}-medal"><span>⭐ NOUN STAR ⭐</span></div>'''


def confetti(rng, n=80):
    cols = ["#ff5fa2", "#ffd23f", "#3bceac", "#2f8cff", "#8e5cf5", "#ef3b3b", "#ff9f1c"]
    out = []
    for k in range(n):
        shape = "border-radius:50%;" if k % 3 == 0 else ""
        w = int(rng.uniform(14, 26))
        out.append(f'<i class="cf" style="left:{int(rng.uniform(0, 1920))}px; background:{cols[k % 7]}; width:{w}px; height:{w if shape else int(rng.uniform(22, 38))}px; {shape}" '
                   f'data-dx="{int(rng.uniform(-160, 160))}" data-r="{int(rng.uniform(-720, 720))}" data-d="{rng.uniform(0, 1.8):.2f}" data-sp="{rng.uniform(2.6, 4.2):.2f}"></i>')
    return f'<div class="confetti">{"".join(out)}</div>'


def build_html(scenes, total, sfx, music):
    parts, audio, caps = [], [], []
    rng = np.random.default_rng(42)
    for sc in scenes:
        sid, kind = sc["id"], sc.get("kind", "lesson")
        inner = []
        if kind in ("quiz", "result"):
            inner.append(stage_bg(rng))
        else:
            inner.append(outdoor_bg(sc["theme"], sc.get("rainbow"), rng))
        if kind == "title":
            letters = "".join(f'<span class="tl">{ch}</span>' for ch in "NOUN")
            inner.append(f'''
      <div class="title-wrap">
        <div class="logo"><div class="logo-word">{letters}</div><div class="logo-sub">Friends</div></div>
        <div class="title-pill">What is a noun? 🤔</div>
      </div>''')
        if sc.get("badge"):
            em, txt, cat = sc["badge"]
            inner.append(f'<div class="badge" style="--bc:{CAT_COLORS[cat]}"><span class="b-em">{em}</span><span class="b-tx">{txt}</span></div>')
        if kind == "quiz":
            inner.append(quiz_html(sc))
        if kind in ("quiz", "result") and sc["id"] != "qintro":
            inner.append(star_meter(sid, sc.get("stars", 0)))
        if kind == "result":
            inner.append(result_html(sid))
        for name, x, s in sc.get("chars", []):
            facing = 0 if sid in ("outro", "title", "qintro") else (1 if x < 960 else -1)
            inner.append(char_html(name, x, s, sid, facing))
        for li, ln in enumerate(sc["lines"]):
            if ln["speaker"] == "pause":
                continue
            for pk, key in (("pops", "pop"), ("big", "big")):
                if pk in ln:
                    cards = "".join(
                        f'<div class="{key}-card" id="{sid}-{li}-{key}{k}" style="--cc:{CAT_COLORS.get(p["label"], CAT_COLORS.get(sc.get("badge", ("", "", "person"))[2]))}">'
                        f'<div class="em" data-layout-allow-occlusion>{p["emoji"]}</div><div class="lb">{p["label"]}</div></div>'
                        for k, p in enumerate(ln[pk]))
                    inner.append(f'<div class="{key}-row">{cards}</div>')
            for ci, cl in enumerate(ln["clips"]):
                audio.append(f'<audio id="vo-{sid}-{li}-{ci}" src="{cl["src"]}" data-start="{ln["start"]}" data-duration="{round(cl["dur"], 3)}" data-volume="1" data-track-index="{10 + ci}"></audio>')
            spk = ln["speaker"]
            col = CHARS[spk]["dark"] if spk in CHARS else "#d6246f"
            caps.append(f'''<div class="clip caption" id="cap-{sid}-{li}" data-start="{ln['start']}" data-duration="{ln['hold']:.3f}" data-track-index="3">
        <div class="cap-in" style="--sc:{col}"><div class="who">{NAMES[spk]}</div><div class="cap-text">{caption_html(ln['text'])}</div></div></div>''')
        if sid in ("outro", "result"):
            inner.append(confetti(rng))
        if sid == "outro":
            inner.append('<div class="end-text">See you next time! 👋</div>')
        parts.append(f'''
    <div class="clip scene {'stage' if kind in ('quiz', 'result') else 'outdoor'}" id="scene-{sid}" data-start="{sc['start']}" data-duration="{sc['dur']}" data-track-index="1">{''.join(inner)}
    </div>''')

    # ---- sound effects
    fx = [("jingle", 0.3, 2.4, 0.8)]
    for sc in scenes[1:]:
        fx.append(("whoosh", sc["start"] - 0.3, 0.55, 0.7))
        for ln in sc["lines"]:
            for key in ("pops", "big", "opts"):
                for p in ln.get(key, []):
                    fx.append(("pop", p["at"], 0.18, 0.6))
            for p in ln.get("show_at", []):
                fx.append(("pop", p["at"], 0.18, 0.6))
            if ln["speaker"] == "pause":
                for k in range(4):
                    fx.append(("tick", ln["start"] + 0.3 + k, 0.1, 0.8))
            if ln.get("marks"):
                fx.append(("tada", ln["start"] - 0.3, 1.6, 0.7))
            if ln.get("star"):
                fx.append(("chime", ln["start"] + ln["dur"] * 0.5, 1.4, 0.6))
            if ln.get("allstars"):
                fx.append(("fanfare", ln["start"] - 0.4, 3.0, 0.75))
            if ln.get("act") == "jump":
                fx.append(("boing", ln["start"] + 0.05, 0.45, 0.45))
    for i, (k, st, d, v) in enumerate(fx):
        audio.append(f'<audio id="sfx-{i}" src="{sfx[k]}" data-start="{max(0, round(st, 3))}" data-duration="{d}" data-volume="{v}" data-track-index="20"></audio>')
    audio.append(f'<audio id="music" src="{music}" data-start="0" data-duration="{total}" data-volume="0.55" data-track-index="30"></audio>')

    slim = [{k: v for k, v in sc.items() if k not in ("q",)} for sc in scenes]
    data = json.dumps({"total": total, "scenes": slim, "chars": {k: v["color"] for k, v in CHARS.items()}}, ensure_ascii=False)
    tpl = open(os.path.join(ROOT, "page.tpl"), encoding="utf-8").read()
    out = (tpl.replace("{{TOTAL}}", str(total))
              .replace("{{SCENES}}", "".join(parts))
              .replace("{{CAPTIONS}}", "\n    ".join(caps))
              .replace("{{AUDIO}}", "\n    ".join(audio))
              .replace("{{DATA}}", data))
    open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(out)


if __name__ == "__main__":
    os.makedirs(VOICE_DIR, exist_ok=True)
    scenes, total = build_timeline()
    sfx = make_sfx()
    music = make_music(total, scenes)
    build_html(scenes, total, sfx, music)
    print(f"built index.html  total={total}s  scenes={len(scenes)}")
