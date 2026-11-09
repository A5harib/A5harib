# Making the MP4

The video is recorded from `../index.html` in render mode (1920×1080, captions under the stage, answers revealed after 5 seconds of thinking time).

Needs: Node + Playwright (Chromium), Python 3 + numpy, ffmpeg, `espeak-ng` and the MBROLA voices (`apt-get install espeak-ng mbrola mbrola-us1 mbrola-us2`).

Run from this folder:

1. `node pass1.js` – plays the show at high speed and writes every spoken line to `lines.json`.
2. `python3 tts.py` – makes one voice clip per line in `clips/` and their lengths in `clips.json`.
3. `node record.js full` – plays the show in real time (about 27 minutes) and records frames plus a log of every line, sound effect and music cue.
4. `python3 build.py full managing-impulsivity.mp4` – mixes voices, music and sound effects to match the log, and encodes the MP4.

To use better voices, replace the clips in step 2 with recordings or another speech engine. Keep the same file names and update `clips.json` with the new lengths before step 3, so the animation waits for each line.
