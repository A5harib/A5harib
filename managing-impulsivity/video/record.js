// usage: node record.js OUTDIR [startScene] [maxSeconds]
const { chromium } = require('playwright'); const fs = require('fs');
const [out, start = '0', maxS = '99999'] = process.argv.slice(2);
fs.mkdirSync(out + '/f', { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-device-scale-factor=1'] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const clips = fs.readFileSync('clips.json', 'utf8');
  await p.addInitScript(`window.__RENDER=true;window.__CLIPS=${clips};`);
  await p.goto('file:///home/user/A5harib/managing-impulsivity/index.html');
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(p); const frames = []; let n = 0;
  cdp.on('Page.screencastFrame', async f => {
    const name = `f/${String(n++).padStart(6, '0')}.jpg`;
    fs.writeFile(out + '/' + name, Buffer.from(f.data, 'base64'), () => {});
    frames.push([name, f.metadata.timestamp]);
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {}
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  await p.waitForTimeout(500);
  const t0 = Date.now() / 1000;
  await p.evaluate(s => window.__mi.jump(s), +start);
  while (!(await p.evaluate(() => window.__DONE)) && Date.now() / 1000 - t0 < +maxS) await p.waitForTimeout(250);
  await p.waitForTimeout(2500);
  await cdp.send('Page.stopScreencast');
  const ev = await p.evaluate(() => window.__EV);
  fs.writeFileSync(out + '/frames.json', JSON.stringify(frames)); fs.writeFileSync(out + '/events.json', JSON.stringify({ t0, ev }));
  const dur = frames[frames.length - 1][1] - frames[0][1];
  console.log('frames', frames.length, 'dur', dur.toFixed(1), 'fps', (frames.length / dur).toFixed(1));
  await b.close();
})();
