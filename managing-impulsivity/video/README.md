# Making the MP4

The video is recorded from `../index.html` in render mode (1920×1080, captions under the stage, answers revealed after 5 seconds of thinking time).

Needs: Node + Playwright (Chromium), Python 3 + numpy, ffmpeg (with rubberband), and `pip install kokoro-onnx soundfile` with the Kokoro model files (`kokoro-v1.0.onnx`, `voices-v1.0.bin` from the kokoro-onnx GitHub release) in `../kokoro/`.

Run from this folder:

1. `node pass1.js` – plays the show at high speed and writes every spoken line to `lines.json`.
2. `python3 tts2.py` – makes one natural voice clip per line (Kokoro voices, pitched up for the children and Thinky) in `clips2/`, with their lengths in `clips.json`. (`tts.py` is the older espeak version.)
3. `node record.js full` – plays the show in real time (about 27 minutes) and records frames plus a log of every line, sound effect and music cue.
4. `python3 build2.py full managing-impulsivity.mp4` – builds the soundtrack (three music loops, sound effects, voices, music ducking under speech) to match the log, and encodes the MP4.

To use better voices, replace the clips in step 2 with recordings or another speech engine. Keep the same file names and update `clips.json` with the new lengths before step 3, so the animation waits for each line.
