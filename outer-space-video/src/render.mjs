import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
import { spawn } from 'child_process';
import fs from 'fs'; import path from 'path'; import url from 'url';
const dir = path.dirname(url.fileURLToPath(import.meta.url));
const [mode, a, b, out] = process.argv.slice(2);
const tl = JSON.parse(fs.readFileSync(path.join(dir, 'out/timeline.json')));
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => { console.error('PAGEERR', e.message); });
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto('file://' + path.join(dir, 'render.html'));
console.error('font ok:', await page.evaluate(t => setup(t), tl));
if (mode === 'stills') { // a = comma list of seconds, b = out dir
  for (const s of a.split(',')) {
    const [d] = await page.evaluate(([f]) => frames(f, 1, 0.9), [Math.round(+s * tl.fps)]);
    fs.writeFileSync(path.join(b, `still_${(+s).toFixed(1).padStart(6, '0')}.jpg`), Buffer.from(d, 'base64'));
  }
} else { // frames a..b -> out mp4
  const f0 = +a, f1 = +b;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(tl.fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-threads', '1', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const B = 10; let t0 = Date.now();
  for (let f = f0; f < f1; f += B) {
    const n = Math.min(B, f1 - f);
    const arr = await page.evaluate(([f, n]) => frames(f, n, 0.93), [f, n]);
    for (const d of arr) { if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    if ((f - f0) % 900 === 0) console.error(`${out}: ${f - f0}/${f1 - f0} frames, ${((f - f0) / ((Date.now() - t0) / 1000 + 1e-3)).toFixed(1)} fps`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
