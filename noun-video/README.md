# Noun Friends 🍎🐱🏫👩‍🏫

A ~1.5 minute cartoon video that teaches children what a **noun** is.
Word-characters with eyes, hands and feet introduce themselves in their own voices:

| Character | Says | Teaches |
|-----------|------|---------|
| **Noun** (host) | "A noun is a naming word." | the idea |
| **Teacher** | "I am a person. So, I am a noun!" | person |
| **School** | "I am a place." | place |
| **Cat** | "I am an animal." | animal |
| **Apple** | "I am a thing. You can eat me!" | thing |
| **Ball** | "I am Ball. I am a noun!" | quiz answer |

Then a recap, a 3-2-1 quiz (*jump / ball / happy*), and a goodbye with everyone.

Built with [HyperFrames](https://hyperframes.heygen.com) (HTML → video) and GSAP.
Voices come from HyperFrames' local Kokoro TTS; mouths are lip-synced to each voice's loudness.
Music and sound effects are synthesized in `build.py`.

## Files

- `noun-friends.mp4` – the rendered video
- `build.py` – the script (all lines live in `SCENES`), TTS, timing, music, writes `index.html`
- `page.tpl` – HTML/CSS characters + GSAP animation
- `index.html` – generated HyperFrames composition

## Rebuild

```bash
python3 -m venv venv && ./venv/bin/pip install kokoro-onnx soundfile numpy
npm i hyperframes@0.9.20
HYPERFRAMES_PYTHON=$PWD/venv/bin/python ./venv/bin/python build.py
npx hyperframes check
npx hyperframes render -o noun-friends.mp4
```

To make a new lesson (verbs, adjectives…), edit the `SCENES` list in `build.py` and rebuild.
