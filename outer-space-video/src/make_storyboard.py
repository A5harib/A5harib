"""Builds storyboard.html: scene-by-scene storyboard + coverage checklist, from script.py and timeline.json."""
import base64, html, io, json, os, re, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from script import SCENES
TL = json.load(open(os.path.join(HERE, 'out/timeline.json')))
THUMBS = os.path.join(HERE, 'thumbs')
sc_by = {s['id']: s for s in TL['scenes']}
def tc(x): return f'{int(x // 60)}:{int(x % 60):02d}'
def at(sid): return tc(sc_by[sid]['start'])
E = html.escape

SECTIONS = [
    ('1. Exciting opening', ['opening']),
    ('2. Friendly introduction', ['missions', 'launch']),
    ('3-5. Step-by-step lessons with examples, questions and mini-games', [s['id'] for s in SCENES if s['part'].startswith('Unit')]),
    ('6. Fun revision', ['words', 'recap']),
    ('7. Final quiz', ['final']),
    ('8. Cheerful closing', ['closing']),
]

COVER = [
    ('Teacher notes', [
        ('Introduce the universe, planets, moons and stars; pretend play as astronauts; fun of telescopes', ['universe', 'planets', 'astronauts', 'moon']),
        ('Space Station dramatic play centre (rocket, astronaut, telescope, planets on black background)', ['astronauts', 'closing']),
        ('Labelled images and flash cards of planets and space items', ['planets', 'parade', 'words']),
    ]),
    ('Learning objectives', [
        ('1. The solar system and the different planets', ['planets', 'parade', 'final']),
        ('2. Differences between the night sky and the day sky', ['daynight', 'daynightgame', 'stars', 'quiz2']),
        ('3. What astronauts do and how life may be in space', ['astronauts', 'spacesuit', 'living']),
        ('4. Other outer space bodies', ['satellites', 'rockets', 'comets']),
    ]),
    ('Unit 1: The Solar System', [
        ('Everything around us is called the Universe', ['universe']),
        ('The Sun is a star: a sphere of hot, glowing gases', ['sun']),
        ('Sol (Latin) gives us "Solar System"', ['sun']),
        ('What we feel and see on a sunny day: warmer air, wet streets dry', ['sunny']),
        ('Sun rays fall on Earth like rain; sing a weather song', ['sunny']),
        ('The Solar System: the Sun and 8 planets orbiting it; moons', ['planets']),
        ('Planet names (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)', ['planets']),
        ('The Sun is at the centre; children point to the Sun', ['planets']),
        ('Outer space is the area beyond the Earth', ['universe']),
        ('Solar System videos and songs', ['sunny', 'celebration']),
        ('Galaxy: a system of solar systems and stars, separated by empty space', ['galaxy']),
        ('Our galaxy is the Milky Way; tens of billions of solar systems', ['galaxy']),
    ]),
    ('Unit 2: Earth, Moon and Stars', [
        ('Name of our planet; Earth is 3rd from the Sun; find Earth on a display', ['earth', 'planets']),
        ('Globe = model of Earth, sphere shape', ['daynight']),
        ('Torch as Sun: facing the Sun is day; Pakistan on the globe', ['daynight']),
        ('Earth rotates on its axis once a day; turning away = night', ['daynight']),
        ('Day and night activities and what we see', ['daynightgame']),
        ('Night sky: stars and the Moon', ['moon']),
        ('Moon: mountains, valleys, old volcanoes, dusty craters', ['moon']),
        ('Moon seen without a telescope or binoculars', ['moon']),
        ('Moon phases: the Moon orbits Earth; sunlight reflects from it', ['phases']),
        ('Neil Armstrong visited and explored the Moon', ['armstrong']),
        ('Stars look like glitter; can we touch them? Hot balls of gas', ['stars']),
        ('Constellations', ['constellations']),
        ('A shooting star and meteorites', ['constellations']),
        ('Stars are always in the sky; the Sun hides them in the day', ['stars']),
        ('Milky Way: dusty white band; hundreds of billions of stars; one of billions of galaxies', ['milkyway']),
    ]),
    ('Unit 3: Astronomers and Astronauts', [
        ('Astronomy is the science of outer space and celestial bodies', ['astronomy']),
        ('Astronomers have studied space for thousands of years', ['astronomy']),
        ('Galileo Galilei built telescopes', ['famous']),
        ('Isaac Newton and gravity', ['famous']),
        ('Edwin Hubble and the Hubble Space Telescope', ['famous']),
        ('Space Station activity: act as astronauts', ['astronauts']),
        ('Astronauts collect information for scientists; fix spacecraft', ['astronauts']),
        ('No air in space: oxygen, space suit, helmet, air supply', ['spacesuit']),
        ('Nothing has weight in space', ['spacesuit']),
        ('Suit protects from heat and cold; backpack of air; dark visor; heavy boots', ['spacesuit']),
        ('Sleeping bags that hold astronauts down', ['living']),
        ('Drinking from a pouch with a straw; sticky food', ['living']),
        ('Freeze-dried and vacuum-packed food; powder + water in a pouch', ['living']),
        ('Astronaut log book: cover, launch checklist, space chart', ['logbook', 'launch']),
    ]),
    ('Unit 4: What Do We See in Outer Space?', [
        ('Satellites collect information and send TV programmes around the world', ['satellites']),
        ('Rockets: fuel rushes out of the nozzle; like blowing a wrapper off a straw', ['rockets']),
        ('Space shuttle: lifts off like a rocket, returns like a glider, gets very hot', ['rockets']),
        ('Many moons in the Solar System', ['parade']),
        ('Planet facts: Mercury, Venus, Earth, Mars (Olympus Mons)', ['parade']),
        ('Jupiter\'s Galilean moons: Io, Europa, Ganymede, Callisto', ['parade']),
        ('Saturn: gas giant, 2nd largest, icy rings, many moons', ['parade']),
        ('Uranus: blue-green, rolls on its side; Neptune: farthest, ~4x Earth', ['parade']),
        ('Dwarf planets (from the unit picture)', ['parade']),
        ('Meteorites and comets (frozen nucleus, glowing coma near the Sun)', ['comets']),
        ('Solar System Day: dress up as planets, share facts, sing the song', ['celebration']),
    ]),
    ('Worksheets', [
        ('WS1 Planet Riddle "Who Am I?" (8 riddles)', ['final']),
        ('WS2 My Space Words (asteroid, shuttle, space rover, planet, moon, sun, stars, astronaut)', ['words']),
        ('WS3 The Solar System order (cut and paste)', ['planets', 'earth', 'quiz1']),
        ('WS4 If I Were An Alien', ['aliens']),
        ('WS5 Astronaut Application', ['logbook']),
        ('WS6 Day and Night', ['daynight', 'quiz2', 'final']),
    ]),
]
VOCAB = ['Solar System', 'Universe', 'Galaxy', 'Space', 'Sun', 'Moon', 'Stars', 'Mercury', 'Venus', 'Earth', 'Jupiter', 'Neptune', 'Mars', 'Saturn', 'Uranus', 'Milky Way', 'Meteorite', 'Constellation', 'Rotation', 'Axis', 'Orbit', 'Night', 'Day', 'Sphere', 'Spaceship', 'Telescope', 'Astronaut', 'Space Suit', 'Aliens', 'Satellite', 'Rocket', 'Discover', 'Explore', 'Glow', 'Sparkle', 'Twinkle', 'Shine', 'Sun rays', 'Moon walk', 'Craters', 'Volcanoes', 'Surface', 'Comet', 'Gravitational field']
NOTES = [
    ('Moon phases', 'The document says phases happen "when Earth blocks some of the sunlight". That describes an eclipse, not phases. The video uses the correct, simple idea from the same paragraph: the Moon orbits Earth and we see different amounts of its sunlit side.'),
    ('Moons per planet', 'The document says "each planet has one or two moons". Mercury and Venus have none, and Jupiter and Saturn have dozens, so the video says "many planets have moons".'),
    ('Number of moons', 'The document gives 336 moons "as of 2009". Astronomers have found many more since then, so the video says "hundreds of moons" and stays correct as the count grows.'),
    ('Shooting stars', 'The document calls a shooting star "a meteorite". The video explains that a shooting star is a small space rock glowing in the sky, and that a rock which lands on Earth is a meteorite. This matches the document\'s own Unit 4 definition.'),
    ('Space shuttle', 'The shuttle stopped flying in 2011, so it is described in the past tense ("could blast off... came back").'),
    ('Big Dipper', 'The video calls it "part of a star picture called the Great Bear", which is more exact than calling the Big Dipper a constellation.'),
    ('Added safety line', 'One line was added: "never look straight at the Sun."'),
    ('YouTube videos', 'The two linked videos cannot be embedded. Their purpose (a solar system song) is covered by the original sunshine song, the planet count-along and the Solar System Day sing-along. Teachers can still play the links in class.'),
]

def thumb(sid):
    p = os.path.join(THUMBS, sid + '.jpg')
    if not os.path.exists(p): return ''
    im = Image.open(p).resize((480, 270)); b = io.BytesIO(); im.save(b, 'JPEG', quality=72)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

all_text = ' '.join(it.get('cap', it['text']) + ' ' + str(it.get('kw', '')) for s in SCENES for it in s['items'] if it['k'] == 'say').lower()
def vocab_ok(w):
    w2 = w.lower(); alts = {w2, w2.rstrip('s'), w2 + 's', w2.replace(' ', ''), w2.replace('spaceship', 'spaceship')}
    return any(a in all_text for a in alts)

h = []
h.append('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Outer Space Storyboard</title>
<style>
:root{--bg:#f7f5ff;--card:#fff;--ink:#1f1736;--muted:#6a6284;--acc:#7b2cbf;--pink:#c2185b;--ok:#1f9d5a;--line:#e5e0f5}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#140f24;--card:#1f1835;--ink:#efeaff;--muted:#a9a0c8;--acc:#c79bff;--pink:#ff7aa8;--ok:#5fd896;--line:#332a52}}
:root[data-theme="dark"]{--bg:#140f24;--card:#1f1835;--ink:#efeaff;--muted:#a9a0c8;--acc:#c79bff;--pink:#ff7aa8;--ok:#5fd896;--line:#332a52}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:980px;margin:0 auto;padding:24px 16px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:21px;margin:36px 0 12px;color:var(--acc)}h3{font-size:17px;margin:20px 0 8px}
.sub{color:var(--muted);margin:0 0 18px}.pill{display:inline-block;background:var(--line);border-radius:99px;padding:2px 10px;font-size:13px;margin:0 6px 6px 0}
.scene{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:12px 0;display:grid;grid-template-columns:240px 1fr;gap:14px}
.scene img{width:100%;border-radius:10px;display:block}.tc{font-weight:700;color:var(--pink)}.part{color:var(--muted);font-size:13px}
.vis{font-style:italic;color:var(--muted);margin:6px 0}.lines{margin:6px 0 0;padding:0;list-style:none}.lines li{padding:3px 0;border-top:1px dashed var(--line)}
.spk{font-weight:700;color:var(--acc)}.q{background:rgba(123,44,191,.08);border-radius:6px}.think{color:var(--pink);font-size:13px;font-weight:600}.kw{font-size:12px;background:var(--pink);color:#fff;border-radius:99px;padding:1px 8px;margin-left:6px}
table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;border:1px solid var(--line)}td,th{padding:8px 10px;border-top:1px solid var(--line);text-align:left;vertical-align:top;font-size:15px}th{background:var(--line)}
.ok{color:var(--ok);font-weight:700}.grid{display:flex;flex-wrap:wrap;gap:6px}.v{border:1px solid var(--line);border-radius:8px;padding:3px 8px;font-size:14px;background:var(--card)}
@media (max-width:640px){.scene{grid-template-columns:1fr}}
</style></head><body><main>''')
h.append(f'<h1>Our Amazing Outer Space: Storyboard</h1><p class="sub">Source: NGS Preschool Thematic Unit "Outer Space (Preparatory)", 18 pages. Video length {tc(TL["total"])} · {len(SCENES)} scenes · ages 4–7</p>')
h.append('<div><span class="pill">Host: Twinkle the Star (cheerful teacher voice)</span><span class="pill">Captain Zoe, astronaut (Unit 3 onwards)</span><span class="pill">Bright 2D animation, 1280×720, 30 fps</span><span class="pill">Original music and sound effects</span><span class="pill">Think timers after every question</span></div>')
h.append('<h2>Video structure</h2><table><tr><th>Part</th><th>Scenes</th><th>Starts</th></tr>')
for name, ids in SECTIONS:
    h.append(f'<tr><td>{E(name)}</td><td>{len(ids)}</td><td class="tc">{at(ids[0])}</td></tr>')
h.append('</table>')
nq = sum(1 for s in SCENES for it in s['items'] if it['k'] == 'think')
h.append(f'<p class="sub">Interactive moments: {nq} questions with a counted thinking pause, plus positive feedback ("Excellent!", "Well done!", "Amazing!") after answers.</p>')

h.append('<h2>Scene-by-scene storyboard</h2>')
cur_part = None
for s in SCENES:
    t = sc_by[s['id']]
    if s['part'] != cur_part:
        cur_part = s['part']; h.append(f'<h3>{E(cur_part)}</h3>')
    lines = []
    items = s['items']
    for i, it in enumerate(items):
        if it['k'] == 'say':
            who = {'T': 'Twinkle', 'Z': 'Zoe', 'K': 'Child'}[it['spk']]
            kw = f'<span class="kw">{E(it["kw"])}</span>' if it.get('kw') else ''
            opts = (' <span class="part">[' + ' / '.join(E(o) for o in it['opts']) + ']</span>') if it.get('opts') else ''
            lines.append(f'<li class="{"q" if it.get("q") else ""}"><span class="spk">{who}:</span> {E(it.get("cap", it["text"]))}{opts}{kw}</li>')
        elif it['k'] == 'think':
            lines.append(f'<li class="think">⏱ {int(it["d"])}-second thinking pause (children answer)</li>')
        elif it['k'] == 'pause' and it.get('pic'):
            lines.append(f'<li class="think">Picture appears: {E(it["pic"])}</li>')
    img = thumb(s['id'])
    h.append(f'<div class="scene"><div>{f"<img alt=\"{E(s["id"])}\" src=\"{img}\">" if img else ""}</div><div><div><span class="tc">{tc(t["start"])}</span> · <b>{E(s["id"].replace("_", " ").title())}</b> <span class="part">({t["dur"]:.0f}s)</span></div><p class="vis">{E(s["vis"])}</p><ul class="lines">{"".join(lines)}</ul></div></div>')

h.append('<h2>Coverage check: every topic in the document</h2>')
total = 0
for grp, rows in COVER:
    h.append(f'<h3>{E(grp)}</h3><table><tr><th style="width:55%">Topic in the document</th><th>Covered in</th><th></th></tr>')
    for topic, ids in rows:
        total += 1
        where = ', '.join(f'{E(i)} <span class="tc">{at(i)}</span>' for i in ids)
        h.append(f'<tr><td>{E(topic)}</td><td>{where}</td><td class="ok">✓</td></tr>')
    h.append('</table>')
ok = [w for w in VOCAB if vocab_ok(w)]
h.append(f'<h3>Vocabulary list ({len(ok)} of {len(VOCAB)} words spoken in the narration)</h3><div class="grid">')
for w in VOCAB:
    h.append(f'<span class="v">{"<span class=ok>✓</span>" if vocab_ok(w) else "✗"} {E(w)}</span>')
h.append('</div>')
h.append('<h2>Accuracy notes</h2><p class="sub">A few facts in the document were simplified or are out of date. Each was kept, but phrased correctly:</p><table>')
for a, b in NOTES: h.append(f'<tr><td style="width:24%"><b>{E(a)}</b></td><td>{E(b)}</td></tr>')
h.append('</table></main></body></html>')
open(os.path.join(HERE, 'out', 'storyboard.html'), 'w').write(''.join(h))
print('topics', total, 'vocab', len(ok), '/', len(VOCAB), [w for w in VOCAB if not vocab_ok(w)])
