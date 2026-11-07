# Noun Friends 🍎🐱🏫👩‍🏫

A ~3¾ minute cartoon video that teaches children (ages 6–7) what a **noun** is.
Word-characters with eyes, eyebrows, hands and feet introduce themselves in their own voices.

## Lesson

| Character | Says | Teaches |
|-----------|------|---------|
| **Noun** (host) | "A noun is a naming word." | the idea |
| **Teacher** | "I am a person. So, I am a noun!" | person |
| **School** | "I am a place." | place |
| **Cat** | "I am an animal." | animal |
| **Apple** | "I am a thing. You can eat me!" | thing |

Then a recap with big picture cards.

## The Noun Game (quiz show)

On a game-show stage with curtains, lights and a 5-star meter. Each question has a
4-second countdown ring and a "Say it out loud!" prompt so children answer before the reveal.

| Round | Host | Question | Answer |
|-------|------|----------|--------|
| 1 | Noun | Which one is a noun? *run / dog / happy* | dog |
| 2 | Teacher | Is a doctor a person, place, animal or thing? | person |
| 2 | School | Is a park a person, place, animal or thing? | place |
| 3 | Cat | Find the noun: *The bird can fly.* | bird |
| 4 | Apple | How many nouns? *The boy has a kite.* | 2 (boy, kite) |

Every right answer lights a star; the finale awards a trophy and the "Noun Star" medal.

## How it's made

Built with [HyperFrames](https://hyperframes.heygen.com) (HTML → video) and GSAP.

- Voices: HyperFrames' local Kokoro TTS, spoken phrase by phrase at a slower, child-friendly pace.
- Mouths are lip-synced to each voice; captions highlight each word as it is spoken.
- Music (marimba + bass + light drums, ducked under speech) and sound effects are synthesized in `audio.py`.

## Files

- `noun-friends.mp4` – the rendered video
- `build.py` – the script (all lines and quiz rounds live in `S`), TTS, timing, writes `index.html`
- `audio.py` – music and sound effects
- `page.tpl` – characters, backgrounds and GSAP animation
- `index.html` – generated HyperFrames composition

## Rebuild

```bash
python3 -m venv venv && ./venv/bin/pip install kokoro-onnx soundfile numpy
npm i hyperframes@0.9.20
HYPERFRAMES_PYTHON=$PWD/venv/bin/python ./venv/bin/python build.py
npx hyperframes check
npx hyperframes render -o noun-friends.mp4
```

To make a new lesson (verbs, adjectives…), edit the `S` list in `build.py` and rebuild.
