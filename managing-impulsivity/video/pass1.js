const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__RENDER = true; window.__SPEED = 60; });
  await p.goto('file:///home/user/A5harib/managing-impulsivity/index.html');
  await p.waitForTimeout(800);
  await p.evaluate(() => window.__mi.jump(0));
  let shots={3:0,11:0,20:0,26:0};
  while (!(await p.evaluate(() => window.__DONE))) {
    const c = await p.evaluate(() => window.__mi.cur());
    if (shots[c.sc]===0 && await p.evaluate(()=>!document.querySelector('#qbox').hidden)) { shots[c.sc]=1; await p.screenshot({ path: `r-${c.sc}.png` }); }
    await p.waitForTimeout(80);
  }
  const ev = await p.evaluate(() => window.__EV);
  const says = {}; ev.filter(e => e.k === 'say').forEach(e => says[e.who + '|' + e.text] = { who: e.who, text: e.text });
  require('fs').writeFileSync('lines.json', JSON.stringify(Object.values(says), null, 1));
  console.log('events', ev.length, 'unique lines', Object.keys(says).length, 'errors', errs);
  await b.close();
})();
