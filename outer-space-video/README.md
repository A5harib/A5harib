# Our Amazing Outer Space (children's educational video)

An animated, interactive video lesson for ages 4–7. It is based on the NGS Preschool thematic unit "Outer Space (Preparatory)".

- **Length:** 23 minutes, 1280×720, 30 fps
- **Presenters:** Twinkle the Star (host) and Captain Zoe (astronaut)
- **Contents:** all 4 units, the 6 worksheets as games, a revision section and a 12-question final quiz
- `output/storyboard.html`: scene-by-scene storyboard with thumbnails, narration, timecodes, a coverage checklist and accuracy notes
- `output/captions.srt`: captions for the narration

The MP4 is not stored here because it is larger than GitHub's 100 MB file limit.

## How it is made

| File | Purpose |
| --- | --- |
| `src/script.py` | Storyboard and narration script (all scenes, questions and on-screen keywords) |
| `src/build.py` | Narration (Kokoro TTS), timeline, original music, sound effects, mix and captions |
| `src/core.js`, `src/icons.js`, `src/scenes.js` | Canvas artwork, characters and scene animation |
| `src/render.html`, `src/render.mjs` | Frame-accurate rendering with Playwright, piped into ffmpeg |
| `src/make_storyboard.py` | Builds the storyboard page |

To rebuild:

```bash
pip install kokoro-onnx soundfile scipy pillow
# Download kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx GitHub releases into ./models
python src/build.py ./models          # audio + timeline -> src/out/
node src/render.mjs video 0 41554 video.mp4
ffmpeg -i video.mp4 -i src/out/audio.wav -c:v copy -c:a aac final.mp4
```

The font is Fredoka (SIL Open Font License).
