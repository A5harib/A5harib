// ---------- scene renderers ----------
const SC = {};
const HOST = { x: 112, y: 622, s: 0.6 };

function lineFrac(S, mark, f) { const L = S.lines.find(l => l.mark === mark); return L ? L.t + L.d * f : 1e9; }

// ---------------- OPENING
SC.opening = S => {
  const lt = S.lt;
  bgSpace(lt, { speed: 2 });
  warpStars(lt, clamp(1.2 - lt * 0.25) * 0.9 + 0.1);
  planet('saturn', 1060 + Math.sin(lt * 0.3) * 20, 170 - lt * 2, 55, lt, { face: true });
  planet('mars', 170, 150 + Math.sin(lt * 0.5) * 10, 34, lt, { face: true });
  earthGlobe(1120, 590, 80, lt * 0.3, { face: true, t: lt });
  moonBody(980, 640, 26, { face: true, t: lt });
  const sh = (lt % 6) / 1.2; if (sh < 1) comet(1200 - sh * 900, 60 + sh * 260, 4, -0.3 + PI * 0.15 + PI, 160, lt);
  // title
  const ta = S.ap('title', 0.8);
  const t0 = Math.min(S.M('title'), 2.2);
  const p1 = eBack(prog(lt, t0 * 0 + 1.2, 0.8));
  const words = 'Our Amazing'.split('');
  ctx.save();
  const lay = (str, size, cx) => { ctx.font = font(size, 700); const ws = str.split('').map(c => ctx.measureText(c).width); const tot = ws.reduce((a, b) => a + b, 0) + (ws.length - 1) * size * 0.04; let x = cx - tot / 2; return ws.map(w => { const c = x + w / 2; x += w + size * 0.04; return c; }); };
  const X1 = lay('Our Amazing', 62, 640), X2 = lay('Outer Space!', 104, 640);
  words.forEach((ch, i) => { const p = eBack(prog(lt, 1.0 + i * 0.05, 0.6)); withT(X1[i], 210 - (1 - p) * 120, p, 0, () => text(ch, 0, 0, 62, '#fff', { stroke: '#7b2cbf', sw: 12, w: 700 })); });
  const cols = ['#ffd23f', '#ff7b54', '#ff5d8f', '#c77dff', '#4d96ff', '#3ddc84'];
  'Outer Space!'.split('').forEach((ch, i) => {
    const p = eBack(prog(lt, 1.6 + i * 0.06, 0.6));
    withT(X2[i], 310 + Math.sin(lt * 3 + i * 0.6) * 6, p * (1 + 0.15 * ta * Math.sin(lt * 6 + i)), 0, () => text(ch, 0, 0, 104, cols[i % 6], { stroke: '#2b1055', sw: 16, w: 700 }));
  });
  ctx.restore();
  for (let i = 0; i < 8; i++) sparkle(380 + hash(i) * 560, 160 + hash(i + 2) * 220, 18 * (0.5 + 0.5 * Math.sin(lt * 4 + i * 2)), clamp(lt - 1.6));
  // Twinkle
  const hp = eBack(prog(lt, S.M('hello') - 0.2, 0.7));
  if (hp > 0) twinkle(640, 520, 0.95 * hp, lt, { talk: S.talkT, wave: true });
  if (S.M('sayit') < lt) confetti(640, 330, S.M('sayit') + S.lines.find(l => l.mark === 'sayit').d + 1.6, lt);
  S.host = null;
};

// ---------------- MISSIONS
SC.missions = S => {
  bgSpace(S.lt, { neb1: '#3f7be4' });
  const names = ['The Solar System', 'Earth, Moon\n& Stars', 'Astronomers\n& Astronauts', 'What do we see\nin outer space?'];
  for (let i = 0; i < 4; i++) {
    const a = S.ap('m' + (i + 1), 0.7);
    if (a <= 0) continue;
    const x = 220 + i * 280, y = 330;
    withT(x, y - (1 - a) * 200, a, 0, () => {
      badge(i + 1, 0, 0, 90, S.lt, { rot: Math.sin(S.lt * 2 + i) * 0.05 });
      names[i].split('\n').forEach((ln, k) => text(ln, 0, 175 + k * 36, 30, '#fff', { stroke: '#2b1055', sw: 7 }));
    });
  }
  if (S.lt > S.M('ready')) { const p = prog(S.lt, S.M('ready'), 1.5); rocket(1150, 640 - eOut(p) * 60, 0.5, S.lt, { flame: 0.3 + 0.2 * Math.sin(S.lt * 9) }); }
};

// ---------------- LAUNCH
SC.launch = S => {
  const lt = S.lt, bl = S.M('blast');
  const up = clamp((lt - bl - 0.6) / 4), sky = clamp((lt - bl - 1.2) / 2.2);
  const shake = lt > bl && lt < bl + 3 ? (hash(Math.floor(lt * 30)) - 0.5) * 10 * (1 - up) : 0;
  ctx.save(); ctx.translate(shake, shake * 0.6);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mixc('#ff9a8b', '#0b0a2e', sky)); g.addColorStop(0.6, mixc('#ffd0a1', '#2b1055', sky)); g.addColorStop(1, mixc('#ffe8c2', '#3a1a6b', sky));
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  if (sky > 0) starField(lt, 0, sky);
  const camY = eOut(up) * 900;
  ctx.save(); ctx.translate(0, camY);
  sun(200, 470, 70, lt, { face: false });
  cloud(200, 200, 1.1, 0.9); cloud(900, 150, 0.9, 0.9); cloud(560, 260, 0.7, 0.7);
  hills('#7bc47f', '#4caf6e', 590);
  // tower
  ctx.strokeStyle = '#e76f51'; ctx.lineWidth = 8; ctx.strokeRect(990, 250, 50, 380);
  for (let yy = 250; yy < 630; yy += 40) { ctx.beginPath(); ctx.moveTo(990, yy); ctx.lineTo(1040, yy + 40); ctx.moveTo(1040, yy); ctx.lineTo(990, yy + 40); ctx.lineWidth = 3; ctx.stroke(); }
  ctx.fillStyle = '#5c677d'; ctx.fillRect(760, 620, 380, 30);
  ctx.restore();
  // rocket
  const rY = 470 - Math.pow(Math.max(0, lt - bl), 2) * 55;
  const rX = 870;
  if (lt > bl - 0.2) smoke(rX, 640 + camY, lt, clamp(1 - up * 1.5));
  rocket(rX, Math.max(rY, -400) + camY * 0.2, 1.15, lt, { flame: lt > bl ? 1.2 : (lt > S.M('n3') ? 0.25 + 0.1 * Math.sin(lt * 30) : 0), pilot: true });
  ctx.restore();
  // checklist clipboard
  const cOut = prog(lt, S.M('go') + 1.5, 0.6);
  if (cOut < 1) {
    const cx = 330 - eOut(cOut) * 700, cy = 390, a = S.ap('list', 0.6);
    withT(cx, cy + (1 - a) * 300, 1, -0.04, () => {
      rrect(-190, -230, 380, 440, 24); ctx.fillStyle = '#b5835a'; ctx.fill();
      rrect(-170, -200, 340, 390, 12); ctx.fillStyle = '#fffdf5'; ctx.fill();
      rrect(-60, -245, 120, 40, 10); ctx.fillStyle = '#7d8bb0'; ctx.fill();
      text('Launch Checklist', 0, -160, 34, '#7b2cbf', { shadow: false, w: 700 });
      ['Oxygen', 'Weather', 'Engines ready', 'Doors secure'].forEach((it, i) => {
        const y = -90 + i * 70;
        rrect(-140, y - 22, 44, 44, 8); ctx.strokeStyle = '#7b2cbf'; ctx.lineWidth = 4; ctx.stroke();
        text(it, -75, y, 30, '#333', { align: 'left', shadow: false });
        const c = prog(lt, S.M('c' + (i + 1)) + 0.35, 0.35);
        if (c > 0) { ctx.strokeStyle = '#2bb673'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-133, y); ctx.lineTo(lerp(-133, -120, clamp(c * 2)), lerp(y, y + 14, clamp(c * 2))); if (c > 0.5) ctx.lineTo(lerp(-120, -92, (c - 0.5) * 2), lerp(y + 14, y - 26, (c - 0.5) * 2)); ctx.stroke(); }
      });
      const gp = S.ap('go', 0.5);
      if (gp > 0) withT(0, 170, gp, 0, () => { circle(0, 0, 40); ctx.fillStyle = '#2bb673'; ctx.fill(); text('GO!', 0, 2, 30, '#fff', { shadow: false, w: 700 }); });
    });
  }
  // countdown numbers
  ['n5', 'n4', 'n3', 'n2', 'n1'].forEach((m, i) => {
    const t0 = S.M(m), dt = lt - t0;
    if (dt >= 0 && dt < 0.95) { const p = eBack(dt / 0.35); withT(400, 360, p * (1 + dt * 0.3), 0, () => text(String(5 - i), 0, 0, 230, '#ffd23f', { stroke: '#e63946', sw: 22, w: 700, alpha: clamp((0.95 - dt) * 4) })); }
  });
  if (lt > bl && lt < bl + 2.2) { const p = eBack((lt - bl) / 0.4); withT(420, 330, p, -0.08, () => text('BLAST OFF!', 0, 0, 110, '#fff', { stroke: '#ff6b35', sw: 18, w: 700, alpha: clamp((bl + 2.2 - lt) * 2) })); }
  S.host = lt < S.M('go') + 1.5 ? HOST : null;
};

// ---------------- MISSION TITLE
SC.mission = S => {
  const n = S.data.n, lt = S.lt;
  bgSpace(lt, { neb1: ['#ff7b54', '#4d96ff', '#9b5de5', '#00bb77'][n - 1] });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + lt * 0.3; ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(820, 330); ctx.arc(820, 330, 900, a, a + 0.12); ctx.fill(); ctx.restore(); }
  const done = S.M('done'), ti = S.M('title');
  if (n > 1 && lt < ti + 0.3) {
    const out = prog(lt, ti - 0.1, 0.4);
    withT(820 - eOut(out) * 900, 300, 1, 0, () => { badge(n - 1, 0, 0, 130, lt); stamp(0, 0, 1.3, prog(lt, done + 0.3, 0.25)); });
  }
  const a = eBack(prog(lt, ti - 0.1, 0.8));
  if (a > 0) {
    withT(820, 300, a, (1 - a) * 3, () => badge(n, 0, 0, 130, lt));
    const titles = ['The Solar System', 'Earth, Moon and Stars', 'Astronomers and Astronauts', 'What Do We See in Outer Space?'];
    text('MISSION ' + n, 820, 530, 46, '#ffd23f', { stroke: '#2b1055', sw: 10, w: 700, alpha: clamp((lt - ti) * 2) });
    text(titles[n - 1], 820, 590, n === 4 ? 40 : 46, '#fff', { stroke: '#2b1055', sw: 10, alpha: clamp((lt - ti - 0.2) * 2) });
  }
  twinkle(250, 380, 1.1, lt, { talk: S.talkT, wave: true });
  S.host = null;
};

// ---------------- UNIVERSE (zoom out)
function stageTransition(S, marks, fns) {
  // pick active stage, zoom-out effect between consecutive stages
  let k = 0; for (let i = 0; i < marks.length; i++) if (S.lt >= S.M(marks[i])) k = i + 1;
  const p = k > 0 ? eOut(prog(S.lt, S.M(marks[k - 1]), 1.3)) : 1;
  if (k > 0 && p < 1) {
    ctx.save(); ctx.globalAlpha = 1 - p; withT(640, 380, 1 - 0.7 * p, 0, () => { ctx.translate(-640, -380); fns[k - 1](S); }); ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = k > 0 ? p : 1; withT(640, 380, k > 0 ? 3 - 2 * p : 1, 0, () => { ctx.translate(-640, -380); fns[k](S); }); ctx.restore();
}
function miniSolar(cx, cy, sc, t, o = {}) {
  sun(cx, cy, 45 * sc, t, { face: sc > 0.8 });
  PORDER.forEach((p, i) => {
    const rx = (95 + i * 55) * sc, ry = rx * 0.4;
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke();
    const a = t * (0.6 / (1 + i * 0.5)) + i * 1.7;
    planet(p, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, [7, 10, 11, 9, 22, 19, 14, 14][i] * sc, t);
  });
}
SC.universe = S => {
  const lt = S.lt;
  bgSpace(lt, { speed: 0.3 });
  stageTransition(S, ['z1', 'z2', 'z3', 'z4', 'os'], [
    S => { for (let i = 0; i < 14; i++) sparkle(100 + hash(i) * 1080, 150 + hash(i + 3) * 450, 20 * (0.6 + 0.4 * Math.sin(lt * 3 + i)), 0.9); planet('jupiter', 980, 250, 60, lt, { face: true }); planet('neptune', 300, 470, 40, lt); galaxy(640, 380, 200, lt, 0.5); twinkle(640, 420, 1.0, lt, { talk: S.talkT }); },
    S => { earthGlobe(640, 420, 210, lt * 0.2, { face: true, t: lt }); kid(640, 160, 0.9, lt, { armsUp: true, shirt: '#ffd23f' }); },
    S => miniSolar(640, 400, 1.1, lt),
    S => { galaxy(640, 390, 430, lt, 1, { tilt: 0.5 }); },
    S => { [[300, 250, 140], [900, 200, 120], [640, 470, 170], [1100, 520, 90], [180, 560, 80], [500, 160, 60], [1150, 120, 50]].forEach(([x, y, r], i) => galaxy(x, y, r, lt, 0.9, { rot: i, tilt: 0.3 + hash(i) * 0.5 })); },
    S => {
      [[300, 200, 110], [900, 160, 100], [640, 300, 90], [1100, 330, 70]].forEach(([x, y, r], i) => galaxy(x, y, r, lt, 0.8, { rot: i, tilt: 0.4 + hash(i) * 0.4 }));
      ctx.save(); circle(640, 1500, 920); const g = ctx.createRadialGradient(640, 1500, 880, 640, 1500, 980); g.addColorStop(0, 'rgba(120,200,255,0.6)'); g.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 400, W, 400); ctx.restore();
      earthGlobe(640, 1500, 900, 1.2, { glow: false, clouds: true });
      [-1, 0, 1].forEach(k => arrowDown(640 + k * 300, 450, -1, lt + k, '#ffd23f'));
    },
  ]);
};

// ---------------- SUN
SC.sun = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#e48a3f', neb2: '#e43f5a' });
  const rv = S.ap('sun', 0.8);
  const shift = eOut(prog(lt, S.M('sphere'), 0.8));
  const shift2 = eOut(prog(lt, S.M('safe'), 0.8));
  const sx = 640 - 260 * shift + 0 * shift2, sy = 400 + (1 - eOut(prog(lt, 0, 2))) * 400, sr = 170 - 40 * shift;
  if (rv <= 0) { // silhouette + ?
    ctx.save(); ctx.globalAlpha = 0.85; glow(sx, sy, 330, '#ffb703', 0.6); circle(sx, sy, sr); ctx.fillStyle = '#ffcf4a'; ctx.fill(); ctx.restore();
    questionMark(sx, sy, 1.3, lt);
  } else {
    sun(sx, sy, sr * (0.9 + 0.1 * rv), lt, { face: true });
    // swirling gases
    const gp = clamp((lt - S.M('gas')) / 0.5);
    if (gp > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU + lt * 0.7, d = sr * (0.4 + 0.5 * hash(i)); glow(sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.95, 30, '#ff7b00', 0.25 * gp); } ctx.restore(); }
  }
  const stp = S.ap('star', 0.6);
  if (stp > 0 && lt < S.M('sphere')) { twinkle(1000, 300, 0.9 * stp, lt, { talk: S.talkT }); label('Both stars!', 1000, 470, 30, '#ff7b00', stp); }
  // sphere
  const sp = S.ap('sphere', 0.6);
  if (sp > 0 && lt < S.M('sol')) {
    withT(900, 390 - Math.abs(Math.sin(lt * 3)) * 60, sp, 0, () => {
      circle(0, 0, 110); const g = ctx.createRadialGradient(-35, -35, 10, 0, 0, 115); g.addColorStop(0, '#fff'); g.addColorStop(0.3, '#ffd23f'); g.addColorStop(1, '#ff7b00'); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 110, 35, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 35, 110, 0, 0, TAU); ctx.stroke();
    });
    label('a ball shape', 900, 580, 30, '#7b2cbf', sp);
  }
  const so = S.ap('sol', 0.6), sol2 = eOut(prog(lt, S.M('solar') + 0.2, 0.7));
  if (so > 0 && lt < S.M('safe') + 0.2) {
    ctx.save(); ctx.globalAlpha = clamp((S.M('safe') + 0.2 - lt) * 3);
    text('SOL', 880 - sol2 * 60, 330, 120 - sol2 * 30, '#ffd23f', { stroke: '#e63946', sw: 16, w: 700, alpha: so });
    if (sol2 > 0) { text('AR SYSTEM', 1005 + (1 - sol2) * 200, 330, 70, '#fff', { stroke: '#7b2cbf', sw: 12, w: 700, alpha: sol2 }); miniSolar(900, 520, 0.38, lt); }
    ctx.restore();
  }
  // safety sign
  const sa = S.ap('safe', 0.6);
  if (sa > 0) withT(940, 380, sa, 0, () => {
    card(0, 0, 360, 300, '#fff', 1, { border: '#e63946', bw: 8 });
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -10, 90, 50, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#333'; ctx.stroke();
    circle(0, -10, 32); ctx.fillStyle = '#5a3a22'; ctx.fill(); circle(0, -10, 14); ctx.fillStyle = '#111'; ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#e63946'; ctx.lineWidth = 16; circle(0, -10, 110); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-78, -88); ctx.lineTo(78, 68); ctx.stroke();
    text('Too bright!', 0, 118, 32, '#e63946', { shadow: false, w: 700 });
  });
};

// ---------------- SUNNY DAY
SC.sunny = S => {
  const lt = S.lt;
  bgSky(1, lt);
  const song = lt > S.M('song');
  const sunX = 1040, sunY = 150;
  cloud(160, 120, 0.8); cloud(560, 90, 0.6);
  // ground and street
  ctx.fillStyle = '#7bc47f'; ctx.fillRect(0, 470, W, 250);
  ctx.fillStyle = '#6c757d'; ctx.fillRect(0, 560, W, 120); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.setLineDash([40, 30]); ctx.beginPath(); ctx.moveTo(0, 620); ctx.lineTo(W, 620); ctx.stroke(); ctx.setLineDash([]);
  house(260, 420, 1.1); house(520, 430, 0.9, { wall: '#bde0fe', roof: '#7b2cbf' }); tree(720, 430, 1); house(900, 420, 1, { wall: '#ffc8dd', roof: '#2a9d8f' });
  // puddles
  const dry = eOut(prog(lt, S.M('dry'), 2.5));
  [[300, 600, 90], [700, 650, 70], [1050, 600, 80]].forEach(([x, y, r]) => { if (dry < 1) { ctx.fillStyle = 'rgba(80,160,255,0.75)'; ctx.beginPath(); ctx.ellipse(x, y, r * (1 - dry), 18 * (1 - dry), 0, 0, TAU); ctx.fill(); } if (dry > 0 && dry < 1) { for (let k = 0; k < 3; k++) { ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - dry)})`; ctx.lineWidth = 4; ctx.beginPath(); const yy = y - 20 - ((lt * 40 + k * 20) % 60); ctx.moveTo(x - 20 + k * 20, yy + 20); ctx.quadraticCurveTo(x - 30 + k * 20, yy + 10, x - 20 + k * 20, yy); ctx.stroke(); } } });
  // sun rays as golden rain
  const rp = clamp((lt - S.M('rays')) / 0.6);
  if (rp > 0) {
    ctx.save(); ctx.globalAlpha = 0.25 * rp; ctx.fillStyle = '#ffd23f';
    for (let i = 0; i < 7; i++) { const a = PI * 0.55 + i * 0.09; ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(sunX + Math.cos(a) * 1400, sunY + Math.sin(a) * 1400); ctx.lineTo(sunX + Math.cos(a + 0.04) * 1400, sunY + Math.sin(a + 0.04) * 1400); ctx.fill(); }
    ctx.restore();
  }
  const rain = clamp((lt - S.M('rain')) / 0.5);
  if (rain > 0) for (let i = 0; i < 40; i++) { const p = (lt * 0.6 + hash(i)) % 1; const x = sunX - 100 - hash(i + 5) * 900, y = sunY + p * 520; ctx.globalAlpha = rain * (1 - p * 0.6); ctx.fillStyle = '#ffcf3f'; ctx.beginPath(); ctx.ellipse(x + p * 120, y, 5, 13, -0.3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  withT(sunX, sunY, song ? 1 + 0.08 * Math.sin(lt * 6) : 1, song ? Math.sin(lt * 3) * 0.15 : 0, () => sun(0, 0, 85, lt));
  // thermometer
  const wa = S.ap('warm', 0.5);
  if (wa > 0) withT(1180, 380, wa, 0, () => {
    rrect(-22, -150, 44, 260, 22); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.stroke();
    const lvl = 0.35 + 0.55 * eOut(prog(lt, S.M('warm'), 1.6));
    rrect(-10, 110 - 250 * lvl, 20, 250 * lvl, 10); ctx.fillStyle = '#e63946'; ctx.fill(); circle(0, 120, 34); ctx.fill(); ctx.strokeStyle = '#555'; ctx.stroke();
    text('warmer!', 0, -180, 28, '#e63946', { stroke: '#fff', sw: 6 });
  });
  // kids
  kid(420, 600, 0.9, lt, { armsUp: song, shirt: '#ff5d8f', bunches: true });
  kid(820, 610, 0.9, lt, { armsUp: song, shirt: '#4d96ff', skin: '#8d5a3b' });
  if (song) {
    const l1 = S.M('l1'), l2 = S.M('l2');
    const txt = lt < l2 ? ['Shine, shine, Sun so bright!', 'Warm the world with golden light!'] : ['Shine, shine, high and round!', 'Dry the puddles on the ground!'];
    const a = clamp((lt - l1) * 3);
    if (a > 0) { card(600, 250, 760, 150, 'rgba(255,255,255,0.92)', a, { border: '#ffb703' }); txt.forEach((tx, i) => text(tx, 600, 215 + i * 62, 40, '#7b2cbf', { shadow: false, alpha: a })); }
    for (let i = 0; i < 6; i++) { const p = (lt * 0.4 + i / 6) % 1; text('♪', 200 + i * 170, 520 - p * 300, 44, ['#ff5d8f', '#7b2cbf', '#ff9f1c'][i % 3], { alpha: Math.sin(p * PI) }); }
  }
};

// ---------------- PLANETS
const PR = [9, 13, 14, 11, 28, 24, 18, 18];
SC.planets = S => {
  const lt = S.lt;
  bgSpace(lt);
  const cx = 640, cy = 405;
  const toRow = eOut(prog(lt, S.M('miss') - 0.3, 1.2));
  const orbitGlow = clamp((lt - S.M('orbit')) / 0.5) * (1 - toRow);
  // orbits
  PORDER.forEach((p, i) => {
    const rx = 115 + i * 63, ry = rx * 0.37;
    ctx.strokeStyle = `rgba(255,255,255,${(0.2 + 0.4 * orbitGlow) * (1 - toRow)})`; ctx.lineWidth = 2 + 2 * orbitGlow; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke();
  });
  const sunR = 62 * (1 - toRow * 0.3);
  const sunX = lerp(cx, 70, toRow), sunY = lerp(cy, 370, toRow);
  sun(sunX, sunY, sunR * (1 + 0.08 * clamp(1 - Math.abs(lt - S.M('centre') - 0.8))), lt);
  if (lt > S.M('centre') && lt < S.M('mid') + 2) arrowDown(cx, cy - 150, 1, lt, '#ff5d8f');
  const counting = lt > S.M('p1') - 0.2;
  PORDER.forEach((p, i) => {
    const rx = 115 + i * 63, ry = rx * 0.37;
    const a = lt * (0.5 / (1 + i * 0.45)) + i * 2.1;
    let x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, r = PR[i] * 1.15;
    const rowX = 190 + i * 132, rowY = 370, rowR = [22, 30, 32, 26, 55, 46, 38, 38][i];
    x = lerp(x, rowX, toRow); y = lerp(y, rowY, toRow); r = lerp(r, rowR, toRow);
    const hi = clamp(1 - Math.abs(lt - S.M('p' + (i + 1)) - 0.6) / 0.9);
    if (p === 'earth' && toRow > 0 && lt < S.M('missans')) {
      if (toRow > 0.5) { circle(x, y, 42); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill(); ctx.setLineDash([8, 8]); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]); questionMark(x, y + 5, 0.6, lt); }
      else planet(p, x, y, r, lt);
    } else {
      const pop = p === 'earth' && lt > S.M('missans') ? eBack(prog(lt, S.M('missans'), 0.6)) : 1;
      planet(p, x, y, r * (1 + hi * 0.9) * pop, lt, { glow: hi + (toRow > 0.5 ? 0.3 : 0), face: toRow > 0.5 || hi > 0.2 });
    }
    if (counting && lt > S.M('p' + (i + 1)) && (toRow > 0.5 || lt < S.M('moons') + 1)) {
      const la = clamp((lt - S.M('p' + (i + 1))) * 3);
      text(PLANETS[p].name, x, y + (toRow > 0.5 ? rowR + 30 : -r * (1 + hi) - 22), toRow > 0.5 ? 24 : 20 + hi * 8, '#fff', { stroke: '#2b1055', sw: 6, alpha: la });
    }
    if (orbitGlow > 0 && lt < S.M('count')) { // moving trail dots
      for (let k = 1; k < 6; k++) { const aa = a - k * 0.08; ctx.fillStyle = `rgba(255,255,255,${0.5 - k * 0.08})`; circle(cx + Math.cos(aa) * rx, cy + Math.sin(aa) * ry, 3); ctx.fill(); }
    }
  });
  if (lt > S.M('moons') && toRow < 0.5) { // little moons
    [2, 4, 5].forEach(i => { const rx = 115 + i * 63, ry = rx * 0.37, a = lt * (0.5 / (1 + i * 0.45)) + i * 2.1; const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; for (let k = 0; k < (i === 2 ? 1 : 3); k++) { const b = lt * 2 + k * 2; moonBody(x + Math.cos(b) * (PR[i] + 14), y + Math.sin(b) * (PR[i] + 10), 4, { glow: false }); } });
  }
  if (toRow > 0.5 && lt > S.M('missans')) confetti(640, 370, S.M('missans'), lt);
};

// ---------------- GALAXY
SC.galaxy = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#5b3fe4' });
  const zoom = 0.4 + 0.6 * eOut(prog(lt, 0, 3));
  galaxy(640, 400, 470 * zoom, lt, 1, { tilt: 0.55 });
  if (lt < S.M('gal')) { sun(640, 400, 30, lt, { face: false }); label('Our Sun', 640, 460, 26, '#ff7b00', clamp(1 - (lt - S.M('more')) * 0)); }
  if (lt > S.M('mw')) { const a = S.ap('mw', 0.6); text('The Milky Way', 640, 160, 64, '#fffbe6', { stroke: '#5b3fe4', sw: 12, w: 700, alpha: a }); }
  const hp = S.ap('here', 0.5);
  if (hp > 0) { const hx = 640 + 470 * 0.5 * Math.cos(2.2 + lt * 0.05), hy = 400 + 470 * 0.55 * 0.5 * Math.sin(2.2 + lt * 0.05); circle(hx, hy, 14 + 6 * Math.sin(lt * 6)); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 5; ctx.stroke(); arrowDown(hx, hy - 60, hp, lt); label('We are here!', hx, hy - 140, 32, '#ff5d8f', hp); }
  if (lt > S.M('count')) for (let i = 0; i < 40; i++) { const st = S.M('count') + i * 0.12; if (lt > st) sparkle(80 + hash(i) * 1120, 120 + hash(i + 9) * 520, 16 * Math.min(1, (lt - st) * 3) * (0.6 + 0.4 * Math.sin(lt * 5 + i)), 0.9); }
};

// ---------------- QUIZ (multiple choice)
function quizCards(S, q, qi, reveal, y0 = 430) {
  const lt = S.lt, n = q.opts.length, a = clamp((lt - q.t + 0.2) / 0.5);
  const cols = ['#ff7b54', '#4d96ff', '#3ddc84'];
  const w = n === 2 ? 360 : 300, gap = n === 2 ? 440 : 345;
  q.opts.forEach((op, i) => {
    const x = 640 + (i - (n - 1) / 2) * gap;
    const ok = i === q.ans, rv = reveal ? clamp((lt - reveal) / 0.4) : 0;
    const sc = eBack(clamp(a * 1.4 - i * 0.15)) * (1 + (ok ? 0.08 * rv : -0.1 * rv));
    if (sc <= 0) return;
    withT(x, y0, sc, 0, () => {
      if (ok && rv > 0) glow(0, 0, 260, '#7dff9b', 0.5 * rv);
      ctx.globalAlpha = ok ? 1 : 1 - 0.55 * rv;
      card(0, 0, w, 290, '#fff', 1, { border: ok && rv > 0 ? '#2bb673' : cols[i], bw: ok && rv > 0 ? 12 : 7 });
      icon(q.icons ? q.icons[i] : 'star', 0, -30, 95, lt);
      text(op, 0, 105, op.length > 12 ? 30 : 36, '#333', { shadow: false });
      circle(-w / 2 + 12, -133, 30); ctx.fillStyle = cols[i]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
      text('ABC'[i], -w / 2 + 12, -131, 34, '#fff', { shadow: false, w: 700 });
      if (ok && rv > 0) { withT(w / 2 - 20, -125, eBack(rv), 0, () => { circle(0, 0, 32); ctx.fillStyle = '#2bb673'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-4, 11); ctx.lineTo(15, -12); ctx.stroke(); }); }
      ctx.globalAlpha = 1;
    });
  });
}
function questionBanner(str, a, y = 150) {
  if (a <= 0 || !str) return;
  ctx.save(); ctx.font = font(40, 600);
  const words = str.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > 860) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur); ctx.restore();
  const h = 40 + lines.length * 52;
  withT(590, y, 0.8 + 0.2 * eBack(a), 0, () => {
    card(0, 0, 940, h, 'rgba(43,16,85,0.88)', clamp(a), { border: '#ffd23f', bw: 5 });
    lines.forEach((ln, i) => text(ln, 0, (i - (lines.length - 1) / 2) * 52 + 2, 40, '#fff', { alpha: clamp(a) }));
  });
}
const CAPS = {};
SC.quiz = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#e43fb5', neb2: '#3f9ae4' });
  // game-show lights
  for (let i = 0; i < 22; i++) { const on = (Math.floor(lt * 4) + i) % 3 === 0; circle(30 + i * 58, 28, 8); ctx.fillStyle = on ? '#ffd23f' : 'rgba(255,210,63,0.25)'; ctx.fill(); circle(30 + i * 58, 700, 8); ctx.fill(); }
  const qs = S.lines.filter(l => l.opts);
  let cur = -1; qs.forEach((q, i) => { if (lt >= q.t - 0.3) cur = i; });
  if (cur < 0) {
    const a = S.ap('start', 0.7);
    withT(640, 330, a, Math.sin(lt * 2) * 0.04, () => { text(S.id === 'final' ? 'BIG FINAL QUIZ!' : 'SPACE QUIZ!', 0, 0, 110, '#ffd23f', { stroke: '#7b2cbf', sw: 18, w: 700 }); });
    for (let i = 0; i < 10; i++) sparkle(640 + Math.cos(i / 10 * TAU + lt) * 420, 330 + Math.sin(i / 10 * TAU + lt) * 160, 22, a);
    twinkle(640, 560, 0.8 * a, lt, { talk: S.talkT, happyEyes: true }); S.host = null; return;
  }
  const q = qs[cur], idx = S.lines.indexOf(q), rv = S.lines[idx + 1];
  const reveal = rv && lt >= rv.t ? rv.t : null;
  questionBanner(S.lines[idx].cap, clamp((lt - q.t + 0.3) / 0.5), 150);
  if (!S.data.score) text(`${cur + 1} / ${qs.length}`, 640, 62, 26, '#fff', { stroke: '#2b1055', sw: 5 });
  quizCards(S, q, cur, reveal, 455);
  if (S.data.score) { for (let i = 0; i < qs.length; i++) { const got = i < cur || (i === cur && reveal); starPath(640 - (qs.length - 1) * 20 + i * 40, 64, 15, 7); ctx.fillStyle = got ? '#ffd23f' : 'rgba(255,255,255,0.2)'; ctx.fill(); } }
  if (lt > S.M('end')) { const a = S.ap('end', 0.6); ctx.fillStyle = `rgba(20,10,50,${0.6 * a})`; ctx.fillRect(0, 0, W, H); withT(640, 360, a, 0, () => { for (let i = 0; i < 12; i++) { starPath(Math.cos(i / 12 * TAU + lt) * 300, Math.sin(i / 12 * TAU + lt) * 200, 30, 13); ctx.fillStyle = '#ffd23f'; ctx.fill(); } twinkle(0, 0, 1.3, lt, { talk: S.talkT, happyEyes: true }); }); S.host = null; }
};

// ---------------- EARTH
SC.earth = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#3f8fe4' });
  const rv = S.ap('earth', 0.8);
  const third = eOut(prog(lt, S.M('third'), 1)), home = eOut(prog(lt, S.M('home'), 1));
  const v = third * (1 - home);
  if (rv <= 0) { ctx.save(); circle(640, 400, 190); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); ctx.setLineDash([14, 12]); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); questionMark(640, 410, 1.4, lt); }
  else {
    const ex = lerp(640, 600, v), ey = 400, er = lerp(190, 40, v) * (0.6 + 0.4 * rv);
    if (v > 0.02) {
      ctx.save(); ctx.globalAlpha = v;
      sun(lerp(-200, 120, v), 400, 120, lt);
      [[300, 'mercury', 16], [440, 'venus', 26]].forEach(([x, p, r]) => planet(p, x, 400, r, lt, { face: true }));
      [700, 830, 960, 1090].forEach((x, i) => { ctx.globalAlpha = v * 0.5; planet(['mars', 'jupiter', 'saturn', 'uranus'][i], x + 40, 400, [20, 45, 38, 28][i], lt); });
      ctx.globalAlpha = v;
      const cm = S.M('c'), cl = S.lines.find(l => l.mark === 'c');
      if (cl) [300, 440, 600].forEach((x, i) => { const tt = cl.t + cl.d * (0.3 + i * 0.2); const p = eBack(prog(lt, tt, 0.4)); if (p > 0) withT(x, 300, p, 0, () => { circle(0, 0, 32); ctx.fillStyle = ['#ff7b54', '#ffd23f', '#3ddc84'][i]; ctx.fill(); text(String(i + 1), 0, 2, 40, '#fff', { stroke: '#2b1055', sw: 6, w: 700 }); }); });
      ctx.restore();
    }
    earthGlobe(ex, ey, er, lt * 0.3, { face: v < 0.5, t: lt });
    if (home > 0) {
      [['tree', 0], ['water', 1], ['air', 2]].forEach(([k, i]) => {
        const a = lt * 0.6 + i * TAU / 3, x = ex + Math.cos(a) * 290, y = ey + Math.sin(a) * 200, p = eBack(prog(lt, S.M('home') + 0.5 + i * 0.5, 0.5));
        if (p <= 0) return;
        withT(x, y, p, 0, () => { card(0, 0, 130, 130, '#fff', 1, { r: 65 }); if (k === 'tree') tree(0, 10, 0.55); if (k === 'water') { ctx.strokeStyle = '#2a7bd6'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let xx = -40; xx <= 40; xx += 4) ctx.lineTo(xx, -20 + j * 20 + Math.sin(xx * 0.12 + lt * 4) * 6); ctx.stroke(); } } if (k === 'air') { ctx.strokeStyle = '#7fc8ff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(-40, -20 + j * 20); ctx.lineTo(20, -20 + j * 20); ctx.arc(20, -30 + j * 20, 10, PI / 2, -PI / 2, true); ctx.stroke(); } } text(['land', 'water', 'air'][i], 0, 88, 26, '#fff', { stroke: '#2b1055', sw: 6 }); });
      });
    }
  }
};

// ---------------- DAY & NIGHT
function lonAt(S) {
  const K = [[0, 60], [S.M('pk'), 160], [S.M('rot'), 160], [S.M('once') + 2.2, 520], [S.M('dark'), 520], [S.M('night') + 0.6, 700], [S.M('morning') + 0.2, 700], [S.M('morning') + 2.6, 880]];
  const lt = S.lt;
  for (let i = K.length - 1; i >= 0; i--) if (lt >= K[i][0]) { const n = K[i + 1]; if (!n) return K[i][1]; return lerp(K[i][1], n[1], ease((lt - K[i][0]) / (n[0] - K[i][0]))); }
  return K[0][1];
}
SC.daynight = S => {
  const lt = S.lt;
  const lon0 = lonAt(S);
  const [px, py, pz] = project(70, 30, lon0, 1);
  const dayness = clamp(0.5 - px * 1.6);
  bgSpace(lt, { neb1: '#3f5be4' });
  // torch
  const tp = S.ap('torch', 0.5);
  const gx = 790, gy = 400, gr = 175;
  withT(140, 400, 1, 0, () => {
    if (tp > 0) { ctx.save(); ctx.globalAlpha = 0.35 * tp; const g = ctx.createLinearGradient(60, 0, gx - 140, 0); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, 'rgba(255,243,176,0.1)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(60, -40); ctx.lineTo(gx - 140, -gr - 30); ctx.lineTo(gx - 140, gr + 30); ctx.lineTo(60, 40); ctx.fill(); ctx.restore(); }
    rrect(-90, -38, 140, 76, 18); ctx.fillStyle = '#ff5d5d'; ctx.fill(); ctx.strokeStyle = '#b52b2b'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#c9d3ea'; ctx.beginPath(); ctx.moveTo(40, -40); ctx.lineTo(80, -60); ctx.lineTo(80, 60); ctx.lineTo(40, 40); ctx.fill();
    ctx.fillStyle = tp > 0 ? '#fff9c4' : '#ddd'; ctx.beginPath(); ctx.ellipse(80, 0, 12, 60, 0, 0, TAU); ctx.fill();
    if (tp > 0) glow(85, 0, 120, '#fff3b0', 0.7 * tp);
    text('Sun', -20, 80, 30, '#ffd23f', { stroke: '#2b1055', sw: 6, alpha: tp });
  });
  // axis
  const ax = S.ap('axis', 0.5), tilt = 0.4;
  if (lt > S.M('globe')) {
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(tilt);
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.6 * ax})`; ctx.lineWidth = 6 + 3 * ax; ctx.setLineDash(ax > 0 ? [] : [10, 10]);
    ctx.beginPath(); ctx.moveTo(0, -gr - 70); ctx.lineTo(0, gr + 70); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  earthGlobe(gx, gy, gr, 0, { lon0, light: tp > 0 ? PI : undefined, pin: S.ap('pk', 0.5), pinLabel: lt > S.M('pk') });
  // rotation arrow
  const ro = S.ap('rot', 0.5);
  if (ro > 0) { ctx.save(); ctx.translate(gx, gy); ctx.rotate(tilt); ctx.globalAlpha = ro; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(0, -gr - 30, 70, 20, 0, 0.2, PI * 1.6); ctx.stroke(); ctx.fillStyle = '#ffd23f'; const ex = Math.cos(PI * 1.6) * 70, ey = -gr - 30 + Math.sin(PI * 1.6) * 20; ctx.beginPath(); ctx.moveTo(ex + 18, ey - 2); ctx.lineTo(ex - 6, ey - 16); ctx.lineTo(ex - 4, ey + 14); ctx.fill(); ctx.restore(); }
  // inset: sky over Pakistan
  if (lt > S.M('day') - 0.3) {
    const a = clamp((lt - S.M('day') + 0.3) * 2);
    ctx.save(); ctx.globalAlpha = a;
    const ix = 1140, iy = 160, ir = 100;
    circle(ix, iy, ir + 8); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.save(); circle(ix, iy, ir); ctx.clip();
    const g = ctx.createLinearGradient(0, iy - ir, 0, iy + ir); g.addColorStop(0, mixc('#0b0a2e', '#4fb3ff', dayness)); g.addColorStop(1, mixc('#3a1a6b', '#bfe8ff', dayness)); ctx.fillStyle = g; ctx.fillRect(ix - ir, iy - ir, ir * 2, ir * 2);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = `rgba(255,255,255,${(1 - dayness) * (0.5 + 0.5 * Math.sin(lt * 3 + i))})`; circle(ix - ir + hash(i) * ir * 2, iy - ir + hash(i + 3) * ir * 1.2, 2); ctx.fill(); }
    if (dayness > 0.5) sun(ix + 30, iy - 30 + (1 - dayness) * 120, 28, lt, { face: false }); else moonBody(ix + 30, iy - 30 + dayness * 120, 20, { glow: false });
    ctx.fillStyle = '#2fae66'; ctx.fillRect(ix - ir, iy + 50, ir * 2, 60); house(ix - 20, iy + 55, 0.35, { lit: dayness < 0.5 });
    ctx.restore();
    text(dayness > 0.5 ? 'DAY' : 'NIGHT', ix, iy + ir + 34, 34, dayness > 0.5 ? '#ffd23f' : '#c7b8ff', { stroke: '#2b1055', sw: 7, w: 700 });
    ctx.restore();
  }
};

// ---------------- DAY OR NIGHT GAME
function dnPic(i, x, y, s, t) {
  withT(x, y, s, 0, () => {
    const day = i === 0 || i === 2;
    ctx.save(); rrect(-170, -130, 340, 260, 18); ctx.clip();
    const g = ctx.createLinearGradient(0, -130, 0, 130); g.addColorStop(0, day ? '#5ec8ff' : '#141045'); g.addColorStop(1, day ? '#c9f0ff' : '#3a1a6b'); ctx.fillStyle = g; ctx.fillRect(-170, -130, 340, 260);
    if (i === 0) { sun(110, -75, 32, t, { face: true }); ctx.fillStyle = '#7bc47f'; ctx.fillRect(-170, 60, 340, 70); tree(-110, 30, 0.6); ctx.strokeStyle = '#8d5a3b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(10, 60); ctx.lineTo(40, -40); ctx.lineTo(70, 60); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, -40); ctx.lineTo(40 + Math.sin(t * 3) * 25, 20); ctx.stroke(); kid(-10, 50, 0.6, t, { armsUp: true, shirt: '#ff5d8f' }); kid(110, 55, 0.55, t, { run: true, shirt: '#4d96ff', skin: '#8d5a3b' }); }
    if (i === 1) { moonBody(110, -70, 30, { glow: true }); for (let k = 0; k < 14; k++) sparkle(-150 + hash(k) * 300, -110 + hash(k + 2) * 120, 6 + 3 * Math.sin(t * 4 + k), 0.9); ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-170, 60); ctx.lineTo(60, 40); ctx.stroke(); withT(-30, 0, 1, Math.sin(t * 2) * 0.1, () => { ctx.fillStyle = '#9c6b3f'; ctx.beginPath(); ctx.ellipse(0, 0, 38, 46, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#d9b48a'; ctx.beginPath(); ctx.ellipse(0, 10, 24, 30, 0, 0, TAU); ctx.fill(); [-14, 14].forEach(e => { circle(e, -14, 13); ctx.fillStyle = '#fff'; ctx.fill(); circle(e, -14, 6); ctx.fillStyle = '#111'; ctx.fill(); }); ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.lineTo(0, 8); ctx.fill(); ctx.fillStyle = '#9c6b3f'; ctx.beginPath(); ctx.moveTo(-30, -34); ctx.lineTo(-20, -52); ctx.lineTo(-10, -38); ctx.moveTo(30, -34); ctx.lineTo(20, -52); ctx.lineTo(10, -38); ctx.fill(); }); text('hoo hoo!', 70, 10, 26, '#fff', { stroke: '#7b2cbf', sw: 5 }); }
    if (i === 2) { ctx.fillStyle = '#ffe8c2'; ctx.fillRect(-170, -130, 340, 260); rrect(30, -110, 120, 90, 6); ctx.fillStyle = '#7fd3ff'; ctx.fill(); sun(110, -75, 22, t, { face: false }); ctx.fillStyle = '#c9884f'; ctx.fillRect(-170, 40, 340, 90); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-60, 40, 60, 16, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd23f'; circle(-70, 34, 14); ctx.fill(); ctx.fillStyle = '#4d96ff'; rrect(20, 0, 40, 46, 6); ctx.fill(); ctx.fillStyle = '#ff9f1c'; rrect(90, -10, 60, 56, 8); ctx.fill(); text('school', 120, 18, 16, '#fff', { shadow: false }); kid(-120, 10, 0.55, t, { shirt: '#3ddc84', bunches: true }); }
    if (i === 3) { for (let k = 0; k < 10; k++) sparkle(-150 + hash(k + 20) * 300, -110 + hash(k + 22) * 80, 6, 0.9); moonBody(120, -80, 24, {}); ctx.fillStyle = '#8d5a3b'; rrect(-150, 0, 300, 100, 10); ctx.fill(); ctx.fillStyle = '#fff'; rrect(-130, -10, 70, 40, 14); ctx.fill(); ctx.fillStyle = '#ff9eb5'; rrect(-90, 10, 230, 70, 16); ctx.fill(); withT(-95, 0, 0.5, -1.4, () => kid(0, 0, 1, t, { sleep: true, shirt: '#ff9eb5' })); for (let k = 0; k < 3; k++) { const p = (t * 0.5 + k / 3) % 1; text('z', -40 + p * 60, -40 - p * 70, 20 + k * 6, '#fff', { alpha: Math.sin(p * PI) }); } }
    ctx.restore();
    rrect(-170, -130, 340, 260, 18); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();
  });
}
SC.dngame = S => {
  const lt = S.lt;
  ctx.fillStyle = '#5ec8ff'; ctx.fillRect(0, 0, W / 2, H); ctx.fillStyle = '#141045'; ctx.fillRect(W / 2, 0, W / 2, H);
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); starField(lt, 0, 1); ctx.restore();
  sun(150, 150, 60, lt); cloud(300, 300, 0.6, 0.8);
  moonBody(1130, 150, 50, {}); text('DAY', 220, 640, 70, '#ffd23f', { stroke: '#ff7b00', sw: 12, w: 700 }); text('NIGHT', 1060, 640, 70, '#c7b8ff', { stroke: '#2b1055', sw: 12, w: 700 });
  if (lt < S.M('q1') - 0.2) { const a = S.ap('start', 0.6); withT(640, 360, a, 0, () => text('Day or Night?', 0, 0, 90, '#fff', { stroke: '#7b2cbf', sw: 16, w: 700 })); }
  const sides = [0, 1, 0, 1]; S.host = { x: 640, y: 650, s: 0.5 };
  for (let i = 0; i < 4; i++) {
    const q = S.M('q' + (i + 1)), r = S.M('r' + (i + 1));
    if (lt < q - 0.2) continue;
    const go = eOut(prog(lt, r + 0.9, 0.8));
    const tx = sides[i] ? 1040 : 240, ty = 300 + (i >> 1) * 0 + (i % 2 ? 0 : 0);
    const stackY = 260 + Math.floor(i / 2) * 150;
    const x = lerp(640, tx, go), y = lerp(370, stackY, go), s = lerp(1.15, 0.5, go) * eBack(prog(lt, q - 0.2, 0.5));
    if (lt > S.M('sum') && i < 2 && false) continue;
    dnPic(i, x, y, s, lt);
    if (lt > r && go < 1) { const p = eBack(prog(lt, r, 0.4)); label(sides[i] ? 'NIGHT' : 'DAY', 640, 120, 54, sides[i] ? '#5b3fe4' : '#ff9f1c', p); }
  }
};

// ---------------- MOON
SC.moon = S => {
  const lt = S.lt;
  bgSky(0, lt);
  const z = eOut(prog(lt, S.M('zoom'), 1.4)), back = eOut(prog(lt, S.M('eyes'), 1.2));
  const zz = z * (1 - back);
  const mx = lerp(950, 640, zz), my = lerp(190, 400, zz), mr = lerp(70, 240, zz);
  hills('#25305e', '#1b2347', 600 + zz * 200);
  moonBody(mx, my, mr, { face: zz < 0.3 && lt < S.M('moon') + 3, t: lt });
  if (lt < S.M('moon')) questionMark(950, 330, 0.5, lt);
  const feats = [['mtn', 'mountains', -0.55, -0.4, 0], ['val', 'valleys', 0.5, -0.25, 0], ['vol', 'old volcanoes', -0.4, 0.45, 0], ['cra', 'craters', 0.38, 0.45, 0]];
  if (zz > 0.9) feats.forEach(([m, name, fx, fy]) => {
    const a = S.ap(m, 0.5); if (a <= 0) return;
    const px = mx + fx * mr * 0.8, py = my + fy * mr * 0.8;
    if (m === 'mtn') { ctx.fillStyle = 'rgba(120,115,105,0.9)'; ctx.beginPath(); ctx.moveTo(px - 40, py + 15); ctx.lineTo(px - 12, py - 30 * a); ctx.lineTo(px + 5, py); ctx.lineTo(px + 22, py - 22 * a); ctx.lineTo(px + 45, py + 15); ctx.fill(); }
    if (m === 'val') { ctx.strokeStyle = 'rgba(100,95,85,0.8)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(px - 50, py - 10); ctx.quadraticCurveTo(px, py + 20 * a, px + 50, py - 5); ctx.stroke(); }
    if (m === 'vol') { ctx.fillStyle = 'rgba(110,100,90,0.9)'; ctx.beginPath(); ctx.moveTo(px - 40, py + 20); ctx.lineTo(px - 12, py - 22 * a); ctx.lineTo(px + 12, py - 22 * a); ctx.lineTo(px + 40, py + 20); ctx.fill(); ctx.fillStyle = 'rgba(70,65,60,1)'; ctx.beginPath(); ctx.ellipse(px, py - 22 * a, 12, 4, 0, 0, TAU); ctx.fill(); }
    if (m === 'cra') { [[0, 0, 24], [-30, 25, 14], [30, 20, 12]].forEach(([dx, dy, r]) => { circle(px + dx, py + dy, r * a); ctx.fillStyle = 'rgba(95,90,82,0.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px + dx, py + dy, r * a, PI * 0.9, PI * 1.7); ctx.stroke(); }); }
    const lx = px + (fx > 0 ? 250 : -250) * (mr / 240), ly = py + fy * 60;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px + (fx > 0 ? 40 : -40), py); ctx.lineTo(lx, ly); ctx.stroke();
    label(name, lx, ly, 30, '#5b3fe4', a);
  });
  if (back > 0) {
    kid(300, 590 + (1 - back) * 300, 1.1, lt, { armsUp: false, shirt: '#ffd23f' });
    const tp = S.ap('tele', 0.6);
    if (tp > 0) {
      telescope(470, 520, 1, { ang: -0.7 });
      withT(820, 380, tp, 0, () => { circle(0, 0, 175); ctx.fillStyle = '#000'; ctx.fill(); ctx.save(); circle(0, 0, 165); ctx.clip(); moonBody(20, 10, 200, { glow: false }); ctx.restore(); ctx.lineWidth = 14; ctx.strokeStyle = '#2a4fd6'; circle(0, 0, 172); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(540, 470); ctx.lineTo(680, 430); ctx.stroke(); ctx.setLineDash([]);
    }
  }
};

// ---------------- MOON PHASES
SC.phases = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#3f3fe4' });
  const ex = 390, ey = 410, orb = 185;
  // sun light from left
  glow(-60, ey, 420, '#ffd23f', 0.6); sun(-30, ey, 120, lt, { face: false });
  for (let i = 0; i < 5; i++) { const y = ey - 160 + i * 80, p = (lt * 0.5 + i * 0.2) % 1; ctx.strokeStyle = `rgba(255,220,80,${0.6 * Math.sin(p * PI)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(110 + p * 60, y); ctx.lineTo(150 + p * 60, y); ctx.stroke(); }
  const oa = clamp((lt - S.M('orbit')) / 0.6);
  ctx.strokeStyle = `rgba(255,255,255,${0.2 + 0.4 * oa})`; ctx.setLineDash([10, 10]); ctx.lineWidth = 3; circle(ex, ey, orb); ctx.stroke(); ctx.setLineDash([]);
  earthGlobe(ex, ey, 62, lt * 0.4, { light: PI, face: true, t: lt });
  const ang = lt * 0.55;
  const mx = ex + Math.cos(ang) * orb, my = ey + Math.sin(ang) * orb;
  moonBody(mx, my, 28, { glow: false });
  // night half of the moon (away from the sun)
  ctx.save(); ctx.fillStyle = 'rgba(15,12,45,0.85)'; ctx.beginPath(); ctx.arc(mx, my, 28.5, -PI / 2, PI / 2); ctx.fill(); ctx.restore();
  if (lt > S.M('refl')) { const a = clamp((lt - S.M('refl')) * 2); ctx.strokeStyle = `rgba(255,230,120,${0.8 * a})`; ctx.lineWidth = 4; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(mx - 100, my); ctx.lineTo(mx - 30, my); ctx.moveTo(mx - 20, my + 10); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]); label('reflects sunlight', mx, my - 70, 24, '#ff9f1c', a); }
  // phase cards
  const ph = [['ph1', 0.12, 'A'], ['ph2', 0.25, 'B'], ['ph3', 0.5, 'C']];
  const qrev = lt > S.M('r');
  ph.forEach(([m, p, L], i) => {
    const a = S.ap(m, 0.6); if (a <= 0) return;
    const y = 215 + i * 170, x = 930;
    const hi = qrev && i === 2 ? clamp((lt - S.M('r')) * 2) : 0;
    withT(x, y, a * (1 + hi * 0.1), 0, () => {
      if (hi) glow(0, 0, 200, '#7dff9b', 0.5 * hi);
      card(0, 0, 360, 160, 'rgba(20,16,60,0.9)', 1, { border: hi ? '#2bb673' : '#ffd23f', bw: hi ? 10 : 5 });
      moonBody(-90, 0, 55, { phase: p, glow: false });
      text(['crescent', 'half Moon', 'full Moon'][i], 60, 0, 32, '#fff');
      circle(-160, -62, 24); ctx.fillStyle = ['#ff7b54', '#4d96ff', '#3ddc84'][i]; ctx.fill(); text(L, -160, -60, 28, '#fff', { shadow: false, w: 700 });
    });
  });
};

// ---------------- NEIL ARMSTRONG
function moonGround(t, y0 = 560) {
  ctx.fillStyle = '#9d9a93'; ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y0 + Math.sin(x * 0.01) * 14 + Math.sin(x * 0.033) * 6); ctx.lineTo(W, H); ctx.fill();
  [[200, 640, 50], [700, 680, 70], [1100, 620, 40], [450, 600, 25]].forEach(([x, y, r]) => { ctx.fillStyle = '#827f78'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.3, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#bdbab3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y - 2, r, r * 0.3, 0, PI, TAU); ctx.stroke(); });
}
SC.armstrong = S => {
  const lt = S.lt;
  ctx.fillStyle = '#05051a'; ctx.fillRect(0, 0, W, H); starField(lt, 0, 1);
  earthGlobe(1100, 140, 55, lt * 0.2, {});
  moonGround(lt);
  // lander descends
  const land = eOut(prog(lt, S.M('fly'), 3.5));
  rocket(300, lerp(-200, 440, land), 0.75, lt, { flame: land < 1 ? 0.8 : 0 });
  if (lt < S.M('name') + 0.5) label('1969', 640, 200, 50, '#e63946', S.ap('fly', 0.6));
  const ap = S.ap('step', 0.6);
  const walk = clamp((lt - S.M('foot')) / 5);
  const ax = lerp(430, 900, walk);
  const bounce = lt > S.M('bounce') ? Math.abs(Math.sin((lt - S.M('bounce')) * 3)) * 90 : 0;
  // footprints
  const nprint = Math.floor(walk * 14);
  for (let i = 0; i < nprint; i++) { ctx.fillStyle = '#6f6c66'; ctx.beginPath(); ctx.ellipse(440 + i * 34, 612 + (i % 2) * 14, 11, 6, 0, 0, TAU); ctx.fill(); }
  if (lt > S.M('name') - 0.2) astronautGeneric(ax + (bounce ? (lt - S.M('bounce')) * 10 : 0), 470 - bounce, 0.7, lt, { walk: walk > 0 && walk < 1, wave: lt > S.M('you') });
  if (ap > 0 && lt < S.M('foot') + 1) { sparkle(450, 600, 40 * ap, 1, '#ffd23f'); label('First person on the Moon!', 640, 250, 40, '#ff5d8f', ap); }
  // flag
  if (lt > S.M('foot')) { const p = eBack(prog(lt, S.M('foot') + 1.5, 0.6)); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1060, 600); ctx.lineTo(1060, 600 - 140 * p); ctx.stroke(); }
  if (lt > S.M('you')) { kid(1150, 620 - Math.abs(Math.sin(lt * 3)) * 70, 0.7, lt, { armsUp: true, shirt: '#ff5d8f' }); }
  S.host = { x: HOST.x, y: HOST.y - (lt > S.M('you') ? Math.abs(Math.sin(lt * 3)) * 60 : 0), s: HOST.s };
};

// ---------------- STARS
SC.stars = S => {
  const lt = S.lt;
  const secret = lt > S.M('daysky') - 0.3, night = eOut(prog(lt, S.M('nightsky'), 1.5));
  const day = secret ? 1 - night : 0;
  bgSky(day, lt);
  const glitter = clamp(lt / 1);
  for (let i = 0; i < 70; i++) {
    const x = 60 + hash(i + 40) * 1160, y = 60 + hash(i + 90) * 430, s = 6 + hash(i + 7) * 14;
    const tw = 0.5 + 0.5 * Math.sin(lt * (2 + hash(i) * 3) + i);
    const a = (secret ? (day > 0.5 ? 0.25 : 1 - day) : 1) * glitter;
    if (secret && day > 0.5) { ctx.save(); ctx.globalAlpha = 0.35; ctx.setLineDash([4, 4]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; starPath(x, y, s, s * 0.45); ctx.stroke(); ctx.restore(); }
    else sparkle(x, y, s * (0.6 + 0.6 * tw), a, ['#fff', '#fff7b0', '#cfe8ff'][i % 3]);
  }
  if (secret) { sun(1050, 150 + night * 500, 70, lt); hills('#3c8d5a', '#2a6b44', 570); house(300, 540, 0.9, { lit: night > 0.5 }); text(day > 0.5 ? 'still there!' : '', 640, 470, 34, '#fff', { stroke: '#7b2cbf', sw: 6, alpha: day }); }
  else hills('#25305e', '#1b2347', 590);
  // touch a star
  if (lt > S.M('touch') - 0.2 && lt < S.M('friendly')) {
    kid(380, 600, 1.1, lt, { armsUp: true, shirt: '#ff5d8f', bunches: true });
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.setLineDash([10, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(420, 520); ctx.lineTo(880, 170); ctx.stroke(); ctx.setLineDash([]);
    label('far, far away!', 680, 330, 30, '#7b2cbf', S.ap('hot', 0.5));
  }
  if (lt > S.M('hot') && lt < S.M('friendly')) {
    const a = S.ap('hot', 0.7);
    withT(900, 220, a, 0, () => { glow(0, 0, 200, '#9fd0ff', 0.8); circle(0, 0, 80); const g = ctx.createRadialGradient(-20, -20, 5, 0, 0, 85); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#bfe3ff'); g.addColorStop(1, '#6fa8ff'); ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const an = i / 14 * TAU + lt; glow(Math.cos(an) * 60, Math.sin(an) * 60, 30, '#ffffff', 0.3); } ctx.restore(); });
  }
  if (lt > S.M('friendly') && lt < S.M('secret')) { S.host = { x: 640, y: 380, s: 1.4 }; return; }
};

// ---------------- CONSTELLATIONS
const DIPPER = [[380, 250], [500, 270], [600, 300], [700, 330], [730, 440], [880, 450], [900, 330]];
SC.constellations = S => {
  const lt = S.lt;
  bgSky(0, lt);
  const land = S.M('land');
  hills('#25305e', '#1b2347', 600);
  const jt = S.M('join'), jl = S.lines.find(l => l.mark === 'join');
  const jp = jl ? clamp((lt - jl.t - jl.d) / 3.5) : 0;
  const fadeC = clamp((lt - S.M('shoot')) * 0.8);
  ctx.save(); ctx.globalAlpha = 1 - fadeC * 0.7;
  const segs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];
  ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  segs.forEach(([a, b], i) => { const p = clamp(jp * segs.length - i); if (p <= 0) return; const A = DIPPER[a], B = DIPPER[b]; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(lerp(A[0], B[0], p), lerp(A[1], B[1], p)); ctx.stroke(); });
  DIPPER.forEach(([x, y], i) => { glow(x, y, 40, '#fff7b0', 0.6); sparkle(x, y, 20 + 5 * Math.sin(lt * 4 + i), 1); });
  if (lt > S.M('spoon') && fadeC < 1) { const a = S.ap('spoon', 0.6) * (1 - fadeC); label('Big Dipper', 640, 530, 38, '#7b2cbf', a); text('part of the Great Bear', 640, 590, 26, '#fff', { alpha: a }); }
  ctx.restore();
  // shooting star
  const sh = prog(lt, S.M('shoot'), 1.4);
  if (sh > 0 && sh < 1) comet(1200 - sh * 900, 80 + sh * 300, 5, -0.32, 220, lt);
  if (lt > S.M('rock') && lt < land) {
    const a = S.ap('rock', 0.6);
    withT(900, 280, a, 0, () => { circle(0, 0, 140); ctx.fillStyle = 'rgba(10,10,40,0.9)'; ctx.fill(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 6; ctx.stroke(); ctx.save(); circle(0, 0, 134); ctx.clip(); glow(10, 10, 90, '#ff9f1c', 0.8); asteroid(0, 0, 30, lt, 5); ctx.restore(); text('tiny space rock', 0, 175, 30, '#fff', { stroke: '#2b1055', sw: 6 }); });
  }
  if (lt > land) {
    const p = eOut(prog(lt, land, 1.3));
    const rx = lerp(1000, 760, p), ry = lerp(100, 620, p);
    if (p < 1) comet(rx, ry, 8, -1.1, 120, lt); else { ctx.fillStyle = '#0f1530'; ctx.beginPath(); ctx.ellipse(760, 640, 70, 16, 0, 0, TAU); ctx.fill(); asteroid(760, 625, 26, 0, 5); label('meteorite', 760, 540, 34, '#e63946', clamp((lt - land - 1.3) * 2)); }
  }
};

// ---------------- MILKY WAY NIGHT
SC.milkyway = S => {
  const lt = S.lt;
  const zo = eOut(prog(lt, S.M('many'), 2));
  bgSky(0, lt);
  const bp = clamp((lt - S.M('band') + 0.2) / 1.5);
  if (bp > 0) {
    ctx.save(); ctx.globalAlpha = bp * (1 - zo); ctx.translate(640, 300); ctx.rotate(-0.35);
    const g = ctx.createLinearGradient(0, -110, 0, 110); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(230,220,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-900, -110, 1800, 220);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 500; i++) { const x = (hash(i) - 0.5) * 1800, y = (hash(i + 3) + hash(i + 7) - 1) * 110; ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * hash(i + 9)})`; circle(x, y, 0.7 + hash(i + 2) * 1.6); ctx.fill(); }
    for (let i = 0; i < 6; i++) glow((hash(i + 50) - 0.5) * 1400, (hash(i + 60) - 0.5) * 60, 120, '#c9a8ff', 0.15);
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = 1 - zo;
  hills('#1d2a4d', '#141c38', 590); house(980, 560, 0.8, { lit: true }); tree(820, 560, 0.9); kid(300, 610, 0.9, lt, { armsUp: true, shirt: '#3ddc84' });
  if (lt > S.M('made')) ['stars', 'dust', 'gas clouds'].forEach((w, i) => label(w, 330 + i * 300, 160 + (i % 2) * 70, 30, ['#5b3fe4', '#c2185b', '#2a7bd6'][i], prog(lt, S.M('made') + i * 0.6, 0.4)));
  ctx.restore();
  if (zo > 0) { ctx.save(); ctx.globalAlpha = zo; galaxy(640, 380, 300, lt, 1); for (let i = 0; i < 9; i++) galaxy(100 + hash(i) * 1080, 100 + hash(i + 4) * 520, 30 + hash(i + 8) * 50, lt, 0.8 * clamp((lt - S.M('many') - 1.5 - i * 0.3) * 2), { rot: i, tilt: 0.3 + hash(i) * 0.5 }); ctx.restore(); }
};

// ---------------- TRUE / FALSE
function tfPic(name, x, y, t) {
  if (name === 'earth') { earthGlobe(x, y, 80, t * 1.2, {}); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y - 100, 60, 16, 0, 0.3, PI * 1.6); ctx.stroke(); }
  if (name === 'stars') { ctx.save(); circle(x, y, 95); ctx.clip(); ctx.fillStyle = '#5ec8ff'; ctx.fillRect(x - 100, y - 100, 200, 200); sun(x + 40, y - 30, 30, t, { face: false }); [[-40, -20], [0, 30], [-50, 50], [50, 40]].forEach(([a, b]) => { ctx.setLineDash([3, 3]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; starPath(x + a, y + b, 14, 6); ctx.stroke(); ctx.setLineDash([]); }); ctx.restore(); }
  if (name === 'moon') moonBody(x, y, 80, {});
  if (name === 'day') { earthGlobe(x + 40, y, 75, 0, { lon0: 160, light: PI, pin: 1 }); sun(x - 110, y, 40, t, { face: false }); }
}
SC.tf = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#3fe48a', neb2: '#e43f3f' });
  const qs = S.lines.filter(l => l.ans !== undefined && !l.opts);
  let cur = -1; qs.forEach((q, i) => { if (lt >= q.t - 0.3) cur = i; });
  const thumbsY = 470;
  if (cur < 0) {
    const a = S.ap('start', 0.6);
    text('True or False?', 640, 200, 90, '#fff', { stroke: '#7b2cbf', sw: 16, w: 700, alpha: a });
    thumb(420, thumbsY, 1.4 * a, true, '#2bb673'); thumb(860, thumbsY, 1.4 * a, false, '#e63946');
    text('TRUE', 420, 620, 44, '#7dffb3', { stroke: '#0d5c36', sw: 8, alpha: a }); text('FALSE', 860, 620, 44, '#ff9b9b', { stroke: '#7a1010', sw: 8, alpha: a });
    return;
  }
  const q = qs[cur], idx = S.lines.indexOf(q), rv = S.lines[idx + 1];
  const reveal = rv && lt >= rv.t ? clamp((lt - rv.t) / 0.4) : 0;
  questionBanner(S.lines[idx].cap, clamp((lt - q.t + 0.3) / 0.5), 140);
  tfPic(q.pic, 640, 400, lt);
  [[true, 330, '#2bb673', 'TRUE'], [false, 950, '#e63946', 'FALSE']].forEach(([v, x, col, w]) => {
    const ok = v === q.ans;
    const s = 1.1 * (1 + (ok ? 0.25 * reveal : -0.2 * reveal)) * (ok && reveal ? 1 + 0.05 * Math.sin(lt * 10) : 1);
    ctx.save(); ctx.globalAlpha = ok ? 1 : 1 - 0.6 * reveal;
    if (ok && reveal) glow(x, thumbsY, 200, '#fff6a8', 0.5 * reveal);
    thumb(x, thumbsY - (ok ? 20 * reveal : 0), s, v, col); text(w, x, 630, 40, '#fff', { stroke: col, sw: 8 });
    ctx.restore();
  });
};

// ---------------- ASTRONOMY
SC.astronomy = S => {
  const lt = S.lt;
  bgSky(0.15, lt);
  hills('#2c3e6b', '#1f2c52', 560);
  // astronomer
  withT(330, 520, 1.25, 0, () => { telescope(70, -40, 0.9, { ang: -0.75 }); kid(0, 0, 1, lt, { shirt: '#7b2cbf', skin: '#d9a679' }); });
  const lst = S.lines.find(l => l.mark === 'list');
  const items = ['sun', 'moon', 'star', 'comet', 'planet', 'galaxy'];
  items.forEach((it, i) => {
    const tt = lst ? lst.t + lst.d * (0.35 + i * 0.1) : 1e9;
    const p = eBack(prog(lt, tt, 0.5)); if (p <= 0) return;
    const a = -PI * 0.85 + i * PI * 0.17, x = 760 + Math.cos(a) * 380, y = 560 + Math.sin(a) * 380;
    withT(x, y + Math.sin(lt * 2 + i) * 6, p, 0, () => { card(0, 0, 130, 130, 'rgba(255,255,255,0.95)', 1, { r: 65, border: '#ffd23f', bw: 5 }); icon(it === 'planet' ? 'saturn' : it, 0, -4, 52, lt); text(['Sun', 'Moon', 'stars', 'comets', 'planets', 'galaxies'][i], 0, 88, 24, '#fff', { stroke: '#2b1055', sw: 6 }); });
  });
  if (lt > S.M('years')) {
    const a = S.ap('years', 0.6);
    withT(330, 230, a, -0.05, () => { rrect(-150, -70, 300, 140, 16); ctx.fillStyle = '#f3e1b6'; ctx.fill(); ctx.strokeStyle = '#a9824a'; ctx.lineWidth = 5; ctx.stroke(); for (let i = 0; i < 9; i++) { ctx.fillStyle = '#7a5a2a'; circle(-110 + hash(i) * 220, -45 + hash(i + 3) * 90, 3); ctx.fill(); } ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-100, -20); ctx.lineTo(-40, 10); ctx.lineTo(20, -30); ctx.lineTo(90, 20); ctx.stroke(); });
    label('thousands of years!', 330, 340, 30, '#a9824a', a);
  }
};

// ---------------- FAMOUS ASTRONOMERS
SC.famous = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#e4b03f' });
  const who = ['galileo', 'newton', 'hubble'], marks = ['g', 'n', 'h'], names = ['Galileo Galilei', 'Isaac Newton', 'Edwin Hubble'];
  const qmode = eOut(prog(lt, S.M('q') - 0.3, 0.8));
  let focus = -1; marks.forEach((m, i) => { if (lt >= S.M(m)) focus = i; });
  who.forEach((w, i) => {
    const a = S.ap(marks[i], 0.7); if (a <= 0) return;
    const isF = i === focus;
    if (!isF && qmode <= 0) return;
    let x = isF ? 420 : 140 + i * 40, y = isF ? 380 : 600, s = isF ? 1 : 0.42;
    if (!isF) { x = 1150 - (2 - i) * 0; y = 200 + i * 170; s = 0.38; }
    if (qmode > 0) { x = lerp(x, 280 + i * 360, qmode); y = lerp(y, 420, qmode); s = lerp(s, 0.72, qmode); }
    const rv = lt > S.M('r') ? clamp((lt - S.M('r')) * 2.5) : 0;
    withT(x, y + (1 - a) * 400, s * (1 + (i === 0 ? rv * 0.12 : 0)), 0, () => {
      ctx.globalAlpha = rv && i !== 0 ? 1 - rv * 0.5 : 1;
      if (i === 0 && rv) glow(0, 0, 300, '#7dff9b', 0.5 * rv);
      frame(0, 0, 360, 420, ['#c9973b', '#8a5cd6', '#2a9d8f'][i]);
      ctx.save(); rrect(-168, -198, 336, 396, 12); ctx.clip(); portrait(w, 0, 40, 1.6, lt); ctx.restore();
      rrect(-160, 150, 320, 56, 14); ctx.fillStyle = '#fff'; ctx.fill(); text(names[i], 0, 178, 32, '#333', { shadow: false });
      if (qmode > 0) { circle(-170, -200, 34); ctx.fillStyle = ['#ff7b54', '#4d96ff', '#3ddc84'][i]; ctx.fill(); text('ABC'[i], -170, -198, 36, '#fff', { shadow: false, w: 700 }); }
      ctx.globalAlpha = 1;
    });
  });
  if (qmode > 0.5) return;
  // attribute animations
  if (focus === 0) { telescope(830, 420, 1.3, { ang: -0.8 }); for (let i = 0; i < 6; i++) sparkle(950 + hash(i) * 250, 150 + hash(i + 2) * 150, 16, 0.5 + 0.5 * Math.sin(lt * 4 + i)); moonBody(1120, 170, 40, {}); }
  if (focus === 1) {
    tree(880, 470, 2.0);
    const ap = lt > S.M('apple') ? prog(lt, S.M('apple'), 1.0) : 0;
    apple(900, 390 + Math.pow(ap, 2) * 220, 24);
    if (lt > S.M('apple') + 1.5) { const p = lt - S.M('apple') - 1.5; if (lt > S.M('field')) { const fa = clamp((lt - S.M('field')) * 1.5); for (let k = 1; k <= 4; k++) { ctx.strokeStyle = `rgba(255,210,63,${fa * (0.5 - k * 0.1) * (0.7 + 0.3 * Math.sin(lt * 3 - k))})`; ctx.lineWidth = 3; circle(1080, 220, 40 + k * 45 + ((lt * 20) % 45)); ctx.stroke(); } } sun(1080, 220, 34, lt, { face: false }); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(1080, 220, 120, 50, 0, 0, TAU); ctx.stroke(); planet('earth', 1080 + Math.cos(p * 2) * 120, 220 + Math.sin(p * 2) * 50, 14, lt); label('pull!', 1080, 300, 24, '#e63946', clamp(p)); }
  }
  if (focus === 2) { earthGlobe(1000, 760, 260, lt * 0.1, {}); hubbleScope(940, 260, 1.1, lt); for (let i = 0; i < 3; i++) { const p = (lt * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(p * PI); rrect(1060 + p * 120, 170 - p * 80, 60, 45, 4); ctx.fillStyle = '#fff'; ctx.fill(); galaxy(1090 + p * 120, 192 - p * 80, 18, lt, 1); ctx.restore(); } }
};

// ---------------- SPACE STATION interior
function stationBg(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#d9e1f2'); g.addColorStop(1, '#aab6d3'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#97a3c2'; ctx.lineWidth = 3; for (let x = 0; x < W; x += 160) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  ctx.fillStyle = '#c3cce2'; ctx.fillRect(0, 0, W, 40); ctx.fillRect(0, H - 60, W, 60);
  // window
  const wx = o.wx ?? 1020, wy = o.wy ?? 230;
  circle(wx, wy, 150); ctx.fillStyle = '#7d8bb0'; ctx.fill(); circle(wx, wy, 132);
  ctx.save(); ctx.clip(); ctx.fillStyle = '#05051a'; ctx.fillRect(wx - 140, wy - 140, 280, 280); for (let i = 0; i < 30; i++) { ctx.fillStyle = '#fff'; circle(wx - 130 + hash(i) * 260, wy - 130 + hash(i + 5) * 260, 1.5); ctx.fill(); } earthGlobe(wx + 40, wy + 120, 140, t * 0.1, {}); ctx.restore();
  // handrails
  ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(60, 120); ctx.lineTo(60, 300); ctx.moveTo(1230, 450); ctx.lineTo(1230, 620); ctx.stroke();
}
function controlPanel(x, y, t, fast) {
  withT(x, y, 1, 0, () => {
    rrect(-230, -110, 460, 220, 18); ctx.fillStyle = '#3d4566'; ctx.fill(); ctx.strokeStyle = '#20243a'; ctx.lineWidth = 6; ctx.stroke();
    rrect(-200, -85, 190, 110, 10); ctx.fillStyle = '#0b2a3a'; ctx.fill();
    ctx.strokeStyle = '#3ddc84'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 40; i++) ctx.lineTo(-195 + i * 4.5, -30 + Math.sin(i * 0.5 + t * (fast ? 8 : 3)) * 25); ctx.stroke();
    for (let i = 0; i < 8; i++) { const on = (Math.floor(t * (fast ? 8 : 2)) + i * 3) % 4 === 0; circle(30 + (i % 4) * 50, -60 + Math.floor(i / 4) * 55, 17); ctx.fillStyle = on ? ['#ff5d5d', '#3ddc84', '#ffd23f', '#4d96ff'][i % 4] : '#566089'; ctx.fill(); }
    rrect(-200, 45, 400, 40, 10); ctx.fillStyle = '#20243a'; ctx.fill();
    for (let i = 0; i < 5; i++) { rrect(-185 + i * 78, 52, 60, 26, 6); ctx.fillStyle = ['#ff7b54', '#ffd23f', '#3ddc84', '#4d96ff', '#c77dff'][i]; ctx.fill(); }
  });
}
SC.astronauts = S => {
  const lt = S.lt;
  stationBg(lt);
  controlPanel(330, 470, lt, lt > S.M('station') && lt < S.M('class'));
  const za = S.ap('hi', 0.8);
  const classMode = eOut(prog(lt, S.M('class') - 0.2, 0.7));
  if (za > 0) zoe(lerp(1400, 760, za), 400, 1.15, lt, { talk: S.talkZ, float: true, wave: lt < S.M('rocket'), tool: lt > S.M('fix') && lt < S.M('station'), armUp: lt > S.M('fix') && lt < S.M('station') });
  if (lt > S.M('rocket') && lt < S.M('collect')) { const a = S.ap('rocket', 0.5); withT(1020, 230, a, 0, () => { rocket(-40, 0, 0.5, lt, { rot: 0.5, flame: 0.6 }); shuttle(60, 60, 0.35, lt, { rot: -0.4 }); }); }
  if (lt > S.M('collect') && lt < S.M('fix')) {
    const a = S.ap('collect', 0.5);
    withT(1020, 230, a, 0, () => { card(0, 0, 220, 170, '#fff', 1); ctx.fillStyle = '#4d96ff'; [40, 80, 60, 110].forEach((h, i) => { ctx.fillRect(-80 + i * 42, 60 - h, 30, h); }); text('data', 0, -62, 26, '#7b2cbf', { shadow: false }); });
    for (let i = 0; i < 3; i++) { const p = (lt * 0.5 + i / 3) % 1; planet(['mars', 'saturn', 'neptune'][i], 820 - p * 300, 300 - p * 100, 16, lt); }
    label('for scientists', 1020, 360, 26, '#2a9d8f', a);
  }
  if (lt > S.M('fix') && lt < S.M('station')) { for (let i = 0; i < 5; i++) { const p = (lt * 2 + i / 5) % 1; sparkle(920 + Math.cos(i * 1.3) * p * 60, 330 + Math.sin(i * 1.3) * p * 60, 14 * (1 - p), 1, '#ffd23f'); } rrect(860, 300, 120, 80, 8); ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.stroke(); }
  if (classMode > 0) {
    ctx.save(); ctx.globalAlpha = classMode;
    ctx.fillStyle = '#fce9d4'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#c79a6b'; ctx.fillRect(0, 560, W, 160);
    // black wall with planets
    ctx.fillStyle = '#111428'; ctx.fillRect(160, 80, 960, 480);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = '#fff'; circle(170 + hash(i) * 940, 90 + hash(i + 3) * 460, 2); ctx.fill(); }
    PORDER.forEach((p, i) => planet(p, 230 + i * 110, 150 + Math.sin(i) * 30, [14, 18, 20, 16, 38, 32, 24, 24][i], lt, { face: true }));
    // cardboard rocket
    withT(500, 420, 1, 0, () => { rrect(-70, -150, 140, 290, 10); ctx.fillStyle = '#5b7ce4'; ctx.fill(); ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.moveTo(-80, -150); ctx.lineTo(0, -240); ctx.lineTo(80, -150); ctx.fill(); circle(0, -70, 34); ctx.fillStyle = '#9fd8ff'; ctx.fill(); rrect(-40, 30, 80, 110, 30); ctx.fillStyle = '#e63946'; ctx.fill(); });
    controlPanel(870, 430, lt, true);
    kid(680, 600, 0.9, lt, { armsUp: true, shirt: '#f4f6fb' }); kid(1100, 610, 0.9, lt, { shirt: '#ff9f1c', bunches: true, skin: '#8d5a3b' });
    ctx.restore();
  }
};

// ---------------- SPACESUIT
SC.spacesuit = S => {
  const lt = S.lt;
  const q = S.lines.find(l => l.opts);
  const qOn = q && lt > q.t - 0.3;
  const noair = S.ap('noair', 0.6), suitT = S.M('suit');
  if (lt < suitT) {
    // compare Earth vs space
    bgSpace(lt, { neb1: '#3f8fe4' });
    ctx.fillStyle = '#5ec8ff'; ctx.fillRect(0, 0, W / 2, H);
    for (let i = 0; i < 10; i++) { const p = (lt * 0.3 + i / 10) % 1; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); const y = 120 + i * 50; ctx.moveTo(40 + p * 300, y); ctx.lineTo(120 + p * 300, y); ctx.arc(120 + p * 300, y - 10, 10, PI / 2, -PI / 2, true); ctx.stroke(); }
    text('air', 320, 120, 50, '#fff', { stroke: '#2a7bd6', sw: 10 });
    hills('#7bc47f', '#4caf6e', 600);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); kid(320, 600, 1, lt, { armsUp: true, shirt: '#ff5d8f' }); ctx.restore();
    if (noair > 0) { text('no air!', 960, 160, 60, '#ff9b9b', { stroke: '#7a1010', sw: 10, alpha: noair }); withT(960, 380, noair, 0, () => { ctx.strokeStyle = '#e63946'; ctx.lineWidth = 14; circle(0, 0, 110); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-78, -78); ctx.lineTo(78, 78); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-50, -10); ctx.lineTo(30, -10); ctx.arc(30, -20, 10, PI / 2, -PI / 2, true); ctx.stroke(); }); }
    if (lt > S.M('how')) questionMark(960, 560, 0.8, lt);
    return;
  }
  stationBg(lt, { wx: 1080, wy: 200 });
  const parts = { suit: S.ap('suit', 0.6), pack: S.ap('pack', 0.6), helmet: S.ap('helmet', 0.6), boots: S.ap('boots', 0.6) };
  const fl = lt > S.M('float') && !qOn;
  const zx = qOn ? 1130 : 520, zy = qOn ? 520 : 400 - (fl ? 40 + Math.sin(lt * 1.5) * 20 : 0), zs = qOn ? 0.6 : 1.25;
  if (parts.suit > 0) { const sw = parts.suit; if (sw < 1) { ctx.save(); ctx.globalAlpha = 1 - sw; zoe(zx, zy, zs, lt, { parts: { suit: 0, pack: 0, helmet: 0, boots: 0 }, talk: S.talkZ }); ctx.restore(); ctx.save(); ctx.globalAlpha = sw; } zoe(zx, zy, zs * (1 + 0.04 * Math.sin(clamp(lt - S.M('thick')) * PI * 4) * (lt < S.M('boots') ? 1 : 0)), lt, { parts, talk: S.talkZ, visor: lt > S.M('helmet') + 1 ? clamp((lt - S.M('helmet') - 1) * 2) * (lt < S.M('thick') ? 1 : 0) : 0, float: fl, rot: fl ? Math.sin(lt) * 0.25 : 0 }); if (sw < 1) ctx.restore(); }
  if (!qOn) {
    const tags = [['pack', 'backpack of air', 200, 360, zx - 70, zy], ['helmet', 'helmet + dark visor', 200, 150, zx - 50, zy - 120 * zs], ['thick', 'thick, bulky suit', 880, 380, zx + 60, zy + 20], ['boots', 'heavy boots', 880, 600, zx + 30, zy + 175]];
    tags.forEach(([m, w, lx, ly, px, py]) => { const a = S.ap(m, 0.5); if (a <= 0 || fl) return; ctx.strokeStyle = `rgba(123,44,191,${a})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(px, py); ctx.stroke(); circle(px, py, 8); ctx.fillStyle = '#7b2cbf'; ctx.fill(); label(w, lx, ly, 28, '#7b2cbf', a); });
    if (lt > S.M('thick') && lt < S.M('boots')) { sun(1150, 520, 40, lt, { face: false }); text('❄', 1150, 640, 60, '#9fd8ff', { stroke: '#2a4fd6', sw: 4 }); }
    if (fl) { [['apple', 300, 200], ['pencil', 900, 500], ['ball', 760, 180]].forEach(([k, x, y], i) => { const xx = x + Math.sin(lt * 0.8 + i) * 40, yy = y + Math.cos(lt * 0.7 + i) * 30; withT(xx, yy, 1, lt * 0.5 + i, () => { if (k === 'apple') apple(0, 0, 22); if (k === 'pencil') { ctx.fillStyle = '#ffd23f'; ctx.fillRect(-50, -8, 90, 16); ctx.fillStyle = '#f1c7a1'; ctx.beginPath(); ctx.moveTo(40, -8); ctx.lineTo(60, 0); ctx.lineTo(40, 8); ctx.fill(); } if (k === 'ball') { circle(0, 0, 22); ctx.fillStyle = '#ff5d8f'; ctx.fill(); } }); }); }
  } else {
    const rv = S.lines[S.lines.indexOf(q) + 1];
    questionBanner(q.cap, clamp((lt - q.t + 0.3) / 0.5), 140);
    withT(0, 0, 1, 0, () => { ctx.save(); ctx.translate(-120, 0); quizCards(S, q, 0, rv && lt >= rv.t ? rv.t : null, 440); ctx.restore(); });
  }
};

// ---------------- LIVING IN SPACE
SC.living = S => {
  const lt = S.lt;
  stationBg(lt, { wx: 1100, wy: 190 });
  zoe(1080, 470, 0.85, lt, { talk: S.talkZ, float: true });
  let k = 0; ['sleep', 'drinkq', 'blobs', 'straw', 'food', 'pouch', 'sticky'].forEach((m, i) => { if (lt >= S.M(m) - 0.2) k = i + 1; });
  const cx = 520, cy = 390;
  const a = k ? eBack(prog(lt, S.M(['sleep', 'drinkq', 'blobs', 'straw', 'food', 'pouch', 'sticky'][k - 1]) - 0.2, 0.5)) : 0;
  if (k === 0) { questionMark(520, 380, 1, lt); text('Zzz?', 520, 520, 50, '#7b2cbf'); return; }
  withT(cx, cy, a, 0, () => {
    if (k === 1) { // sleeping bag on wall
      rrect(-90, -230, 180, 440, 70); ctx.fillStyle = '#4d96ff'; ctx.fill(); ctx.strokeStyle = '#2a4fd6'; ctx.lineWidth = 6; ctx.stroke();
      circle(0, -150, 52); ctx.fillStyle = '#8d5a3b'; ctx.fill(); ctx.fillStyle = '#2b1a12'; ctx.beginPath(); ctx.arc(0, -158, 54, PI, TAU); ctx.fill();
      ctx.strokeStyle = '#1d120c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-18, -146, 8, 0, PI); ctx.stroke(); ctx.beginPath(); ctx.arc(18, -146, 8, 0, PI); ctx.stroke();
      ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 12; [-60, 60].forEach(y => { ctx.beginPath(); ctx.moveTo(-120, y); ctx.lineTo(120, y); ctx.stroke(); });
      for (let i = 0; i < 3; i++) { const p = (lt * 0.5 + i / 3) % 1; text('z', 80 + p * 70, -200 - p * 90, 28 + i * 8, '#7b2cbf', { alpha: Math.sin(p * PI) }); }
    }
    if (k === 2) { questionMark(0, -40, 1.2, lt); withT(-160, 100, 1, 0, () => { rrect(-40, -50, 80, 100, 10); ctx.fillStyle = '#ff9f1c'; ctx.fill(); }); withT(160, 100, 1, 0, () => { rrect(-40, -60, 80, 120, 16); ctx.fillStyle = '#c9e8ff'; ctx.fill(); ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 4; ctx.stroke(); }); }
    if (k === 3) { // cup + floating blobs
      withT(-150, 100, 1, -0.6, () => { ctx.fillStyle = '#ff5d8f'; ctx.beginPath(); ctx.moveTo(-50, -60); ctx.lineTo(50, -60); ctx.lineTo(38, 60); ctx.lineTo(-38, 60); ctx.fill(); });
      for (let i = 0; i < 9; i++) { const x = -60 + hash(i) * 300 + Math.sin(lt * 1.2 + i) * 20, y = -150 + hash(i + 4) * 220 + Math.cos(lt + i) * 18, r = 12 + hash(i + 2) * 22; ctx.fillStyle = 'rgba(80,170,255,0.75)'; ctx.beginPath(); ctx.ellipse(x, y, r * (1 + 0.12 * Math.sin(lt * 5 + i)), r * (1 - 0.12 * Math.sin(lt * 5 + i)), 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; circle(x - r * 0.3, y - r * 0.3, r * 0.25); ctx.fill(); }
    }
    if (k === 4) { // pouch + straw
      rrect(-90, -110, 180, 240, 30); ctx.fillStyle = '#e8f1ff'; ctx.fill(); ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 6; ctx.stroke();
      rrect(-70, -20, 140, 130, 24); ctx.fillStyle = 'rgba(80,170,255,0.6)'; ctx.fill();
      ctx.strokeStyle = '#ff5d8f'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(30, -100); ctx.lineTo(60, -220); ctx.lineTo(120, -240); ctx.stroke();
      text('water', 0, 40, 34, '#2a4fd6', { shadow: false });
    }
    if (k === 5) { [['peas', '#3ddc84'], ['pasta', '#ffd23f'], ['fruit', '#ff5d5d']].forEach(([n, c], i) => withT(-200 + i * 200, 0, 1, (i - 1) * 0.1, () => { rrect(-75, -110, 150, 220, 18); ctx.fillStyle = '#f2f4f8'; ctx.fill(); ctx.strokeStyle = '#9aa6c4'; ctx.lineWidth = 5; ctx.stroke(); for (let j = 0; j < 8; j++) { circle(-40 + hash(j + i * 9) * 80, -40 + hash(j + i * 9 + 3) * 110, 12); ctx.fillStyle = c; ctx.fill(); } text(n, 0, -80, 26, '#555', { shadow: false }); })); }
    if (k === 6) { rrect(-100, -100, 200, 230, 30); ctx.fillStyle = '#fff2d1'; ctx.fill(); ctx.strokeStyle = '#c99a4a'; ctx.lineWidth = 6; ctx.stroke(); text('powder', 0, 40, 32, '#a9824a', { shadow: false }); const p = (lt * 0.8) % 1; ctx.fillStyle = 'rgba(80,170,255,0.8)'; for (let j = 0; j < 4; j++) { circle(-170 + p * 150 + j * 20, -60 + j * 4, 10); ctx.fill(); } text('+ water', -200, -120, 32, '#2a4fd6'); text('Yum!', 150, -150, 50, '#ff5d8f', { stroke: '#fff', sw: 8 }); }
    if (k === 7) { rrect(-220, -100, 440, 200, 24); ctx.fillStyle = '#c3cce2'; ctx.fill(); ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 6; ctx.stroke(); [['#ff9f1c', -130], ['#3ddc84', 0], ['#e63946', 130]].forEach(([c, x]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, 0, 55, 40, 0, 0, TAU); ctx.fill(); }); text('sticky!', 0, 150, 40, '#7b2cbf', { stroke: '#fff', sw: 8 }); }
  });
};

// ---------------- LOG BOOK + APPLICATION
SC.logbook = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#e4793f' });
  const app = lt > S.M('app') - 0.2;
  if (!app) {
    const op = eOut(prog(lt, S.M('pages'), 1.2));
    withT(560, 380, eBack(prog(lt, 0.2, 0.7)), 0, () => {
      // right page
      if (op > 0) {
        rrect(0, -230, 360, 460, 14); ctx.fillStyle = '#fffdf5'; ctx.fill();
        text('Space Chart', 180, -190, 30, '#7b2cbf', { shadow: false, w: 700 });
        ['sun', 'star', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'neptune'].forEach((p, i) => icon(p === 'star' ? 'star' : p, 70 + (i % 3) * 110, -100 + Math.floor(i / 3) * 120, 46, lt));
        // left page (checklist)
        rrect(-360, -230, 360, 460, 14); ctx.fillStyle = '#fffdf5'; ctx.fill();
        text('Launch Checklist', -180, -190, 30, '#7b2cbf', { shadow: false, w: 700 });
        ['Oxygen', 'Weather', 'Engines', 'Doors', 'Go for launch!'].forEach((it, i) => { rrect(-330, -140 + i * 70, 36, 36, 6); ctx.strokeStyle = '#7b2cbf'; ctx.lineWidth = 4; ctx.stroke(); text(it, -280, -122 + i * 70, 28, '#333', { align: 'left', shadow: false }); ctx.strokeStyle = '#2bb673'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-325, -122 + i * 70); ctx.lineTo(-314, -110 + i * 70); ctx.lineTo(-296, -136 + i * 70); ctx.stroke(); });
      }
      // cover (flips)
      const sx = Math.cos(op * PI);
      if (sx > -0.99) withT(0, 0, 1, 0, () => { ctx.scale(sx, 1); rrect(0, -240, 370, 480, 18); ctx.fillStyle = sx > 0 ? '#2a4fd6' : '#d7e2ff'; ctx.fill(); if (sx > 0) { text('Astronaut', 185, -130, 46, '#ffd23f', { w: 700 }); text('Log Book', 185, -75, 46, '#ffd23f', { w: 700 }); rocket(185, 60, 0.6, lt, {}); rrect(50, 170, 270, 40, 8); ctx.fillStyle = '#fff'; ctx.fill(); text('Name: ________', 185, 190, 24, '#555', { shadow: false }); } });
    });
    zoe(1110, 450, 0.85, lt, { talk: S.talkZ, float: true });
    return;
  }
  // application form
  withT(470, 418, 0.9 * eBack(prog(lt, S.M('app') - 0.2, 0.6)), -0.03, () => {
    rrect(-260, -300, 520, 600, 16); ctx.fillStyle = '#fffdf5'; ctx.fill(); ctx.strokeStyle = '#7b2cbf'; ctx.lineWidth = 6; ctx.stroke();
    text('Astronaut Application', 0, -250, 34, '#7b2cbf', { shadow: false, w: 700 });
    zoe(-160, -60, 0.45, lt, { parts: { suit: 1, pack: 1, helmet: 1, boots: 1 } });
    ['Name:', 'Age:'].forEach((w, i) => { text(w, -60, -170 + i * 60, 26, '#333', { align: 'left', shadow: false }); ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, -158 + i * 60); ctx.lineTo(230, -158 + i * 60); ctx.stroke(); });
    [['I want to be an astronaut because...', 40, 'why'], ['If I went to space I would...', 170, 'do']].forEach(([w, y, m]) => {
      rrect(-230, y - 30, 460, 110, 10); ctx.setLineDash([8, 6]); ctx.strokeStyle = S.lt > S.M(m) ? '#ff5d8f' : '#aaa'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
      text(w, -215, y - 8, 22, '#333', { align: 'left', shadow: false });
      if (lt > S.M(m)) { const p = clamp((lt - S.M(m)) / 4); ctx.strokeStyle = '#2a4fd6'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x < 400 * p; x += 6) ctx.lineTo(-210 + x, y + 30 + Math.sin(x * 0.4) * 6); ctx.stroke(); }
    });
  });
  const pen = lt > S.M('why') ? clamp((lt - S.M('why')) / 4) : 0;
  // thought bubbles with ideas
  if (lt > S.M('why')) {
    const ideas = lt < S.M('do') ? [['saturn', 'explore'], ['star', 'see stars'], ['rocket', 'fly fast']] : [['moon', 'moon walk'], ['earth', 'wave at Earth'], ['astronaut', 'float!']];
    ideas.forEach(([ic, w], i) => { const a = eBack(prog(lt, Math.max(S.M('why'), lt < S.M('do') ? S.M('why') : S.M('do')) + 0.5 + i * 0.8, 0.5)); if (a <= 0) return; const x = 920 + (i % 2) * 180, y = 180 + i * 170; withT(x, y, a, 0, () => { card(0, 0, 170, 150, '#fff', 1, { r: 75, border: '#c77dff' }); icon(ic, 0, -12, 52, lt); text(w, 0, 50, 22, '#7b2cbf', { shadow: false }); }); });
  }
};

// ---------------- SATELLITES
SC.satellites = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#3f8fe4' });
  earthGlobe(330, 700, 360, lt * 0.05, {});
  const sa = S.ap('sat', 0.8);
  const sx = 860 + Math.cos(lt * 0.25) * 60, sy = 230 + Math.sin(lt * 0.25) * 20;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.setLineDash([10, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(330, 700, 620, 480, 0, PI * 1.25, PI * 1.95); ctx.stroke(); ctx.setLineDash([]);
  satellite(lerp(1400, sx, sa), sy, 0.9, lt);
  if (lt > S.M('signal')) { signalWaves(sx, sy + 50, 420, 420, lt, 1); for (let i = 0; i < 3; i++) { const p = (lt * 0.4 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(p * PI); planet(['mars', 'jupiter', 'neptune'][i], sx + 220 - p * 120, sy - 80 + i * 40, 12, lt); ctx.restore(); } }
  if (lt > S.M('tv')) {
    const a = S.ap('tv', 0.6);
    withT(980, 520, a, 0, () => {
      house(0, 40, 1.4, { lit: true });
      rrect(-150, -260, 300, 200, 18); ctx.fillStyle = '#20243a'; ctx.fill();
      rrect(-132, -244, 264, 160, 10); ctx.fillStyle = '#5ec8ff'; ctx.fill();
      ctx.save(); rrect(-132, -244, 264, 160, 10); ctx.clip(); twinkle(0, -150, 0.6, lt, { talk: S.talkT }); ctx.restore();
      ctx.strokeStyle = '#20243a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-30, -260); ctx.lineTo(-60, -310); ctx.moveTo(30, -260); ctx.lineTo(60, -310); ctx.stroke();
    });
    signalWaves(sx, sy + 50, 980, 280, lt + 0.3, a);
  }
};

// ---------------- ROCKETS
SC.rockets = S => {
  const lt = S.lt;
  const shuttleT = S.M('shuttle'), roverT = S.M('rover');
  if (lt > roverT - 0.3) {
    // red planet with rover
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f2a36b'); g.addColorStop(1, '#ffd6b0'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    planet('earth', 1120, 120, 26, lt);
    ctx.fillStyle = '#c1502e'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 520 + Math.sin(x * 0.008) * 30); ctx.lineTo(W, H); ctx.fill();
    for (let i = 0; i < 9; i++) asteroid(80 + hash(i) * 1100, 600 + hash(i + 3) * 80, 14 + hash(i + 5) * 16, 0, i);
    rover(lerp(-200, 640, eOut(prog(lt, roverT - 0.3, 2.5))), 470, 1.2, lt);
    return;
  }
  if (lt > shuttleT - 0.3) {
    const glide = eOut(prog(lt, S.M('glide') + lineD(S, 'glide') * 0.45, 1.2)), hot = clamp((lt - S.M('hot')) / 0.8);
    bgSky(1 - 0.6 * glide, lt);
    if (glide < 0.5) {
      const up = clamp((lt - S.M('glide')) / 3.5);
      hills('#7bc47f', '#4caf6e', 610);
      smoke(640, 640, lt, up > 0 ? 1 - up : 0);
      shuttle(640, 520 - Math.pow(up, 2) * 700, 1.1, lt, { rot: -PI / 2, flame: up > 0 ? 1 : 0 });
    } else {
      cloud(300, 600, 1.2, 0.9); cloud(900, 640, 1, 0.9);
      const gx = 1200 - ((lt - S.M('glide')) * 110) % 1600;
      shuttle(gx, 300 + Math.sin(lt) * 20, 1.0, lt, { rot: 0.12, hot });
      if (hot > 0) label('very hot!', gx, 160, 34, '#e63946', hot);
    }
    return;
  }
  bgSky(0.85, lt);
  hills('#7bc47f', '#4caf6e', 610);
  const fire = lt > S.M('fire'), straw = lt > S.M('straw');
  if (straw) {
    const p = prog(lt, S.M('straw') + 0.8, 0.9);
    withT(640, 330, 1, 0, () => {
      rrect(-300, -12, 420, 24, 12); ctx.fillStyle = '#ff5d8f'; ctx.fill(); ctx.fillStyle = '#fff'; for (let i = 0; i < 10; i++) ctx.fillRect(-290 + i * 42, -12, 14, 24);
      rrect(60 + p * 520, -16, 120, 32, 10); ctx.fillStyle = '#ffe9a8'; ctx.fill(); ctx.strokeStyle = '#d9a35a'; ctx.lineWidth = 3; ctx.stroke();
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = `rgba(255,255,255,${0.8 * Math.sin(clamp(p * 2) * PI)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-380 + i * 10, -30 + i * 20); ctx.lineTo(-320 + i * 10, -30 + i * 20); ctx.stroke(); }
      kid(-420, 40, 1.1, lt, { shirt: '#4d96ff' });
    });
    rocket(1120, 330, 0.5, lt, { flame: 1 });
    label('same push!', 1120, 520, 30, '#7b2cbf', clamp((lt - S.M('straw') - 1.5) * 2));
    return;
  }
  const lift = lt > S.M('strong') ? Math.pow(Math.max(0, lt - S.M('strong') - 0.5), 1.6) * 40 : 0;
  const rx = fire ? 520 : 640, ry = 400 - (fire ? 0 : Math.min(lift, 200));
  smoke(rx, 600, lt, lt > S.M('strong') ? 1 : 0);
  rocket(rx, ry, 1.3, lt, { flame: lt > S.M('strong') || fire ? 1.3 : 0, pilot: true });
  if (lt < S.M('strong')) { ['box', 'astro'].forEach((k, i) => { const p = eBack(prog(lt, S.M('carry') + i * 0.4, 0.5)); if (p <= 0) return; withT(rx + (i ? 260 : -260), 330, p, 0, () => { if (k === 'box') { rrect(-45, -45, 90, 90, 8); ctx.fillStyle = '#c99a4a'; ctx.fill(); ctx.strokeStyle = '#8a6a2e'; ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-45, 0); ctx.lineTo(45, 0); ctx.stroke(); } else astronautGeneric(0, 30, 0.45, lt, {}); }); ctx.strokeStyle = 'rgba(123,44,191,0.7)'; ctx.lineWidth = 5; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(rx + (i ? 200 : -200), 330); ctx.lineTo(rx + (i ? 70 : -70), 330); ctx.stroke(); ctx.setLineDash([]); }); }
  if (fire) {
    const a = S.ap('fire', 0.5);
    // cut-away labels
    label('fuel', rx + 220, 380, 32, '#ff7b00', a); ctx.strokeStyle = '#ff7b00'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(rx + 160, 380); ctx.lineTo(rx + 30, 380); ctx.stroke();
    label('nozzle', rx + 230, 530, 32, '#5c677d', a); ctx.strokeStyle = '#5c677d'; ctx.beginPath(); ctx.moveTo(rx + 160, 530); ctx.lineTo(rx + 35, 510); ctx.stroke();
    withT(rx - 230, 380, a, 0, () => { ctx.fillStyle = '#3ddc84'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(50, -50); ctx.lineTo(20, -50); ctx.lineTo(20, 60); ctx.lineTo(-20, 60); ctx.lineTo(-20, -50); ctx.lineTo(-50, -50); ctx.closePath(); ctx.fill(); ctx.stroke(); text('push!', 0, 100, 34, '#fff', { stroke: '#0d5c36', sw: 7 }); });
  }
};
function lineD(S, m) { const L = S.lines.find(l => l.mark === m); return L ? L.d : 0; }

// ---------------- PLANET PARADE
SC.parade = S => {
  const lt = S.lt;
  // stage
  bgSpace(lt, { neb1: '#e43f9a' });
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.ellipse(640, 650, 600, 90, 0, 0, TAU); ctx.fill();
  // spotlight
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.moveTo(560, 0); ctx.lineTo(720, 0); ctx.lineTo(980, 660); ctx.lineTo(300, 660); ctx.fill(); ctx.restore();
  const marks = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
  let k = -1; marks.forEach((m, i) => { if (lt >= S.M(m) - 0.2) k = i; });
  if (lt >= S.M('dwarf') - 0.2) k = 8;
  if (k < 0) {
    // hundreds of moons
    const a = S.ap('moons', 0.6);
    for (let i = 0; i < 60; i++) { const p = eBack(prog(lt, S.M('moons') + 0.8 + i * 0.05, 0.4)); moonBody(100 + hash(i) * 1080, 140 + hash(i + 5) * 460, (6 + hash(i + 9) * 18) * p, { glow: false }); }
    moonBody(640, 380, 70 * a, { face: true, t: lt });
    if (lt > S.M('parade')) { PORDER.forEach((p, i) => { const pp = eBack(prog(lt, S.M('parade') + i * 0.15, 0.5)); planet(p, 120 + i * 148, 600, 34 * pp, lt, { face: true }); }); }
    return;
  }
  if (k === 8) {
    const a = S.ap('dwarf', 0.8);
    sun(40, 380, 30, lt, { face: false });
    ['pluto', 'mercury', 'pluto', 'mercury', 'pluto'].forEach((p, i) => { const x = 450 + i * 170, y = 380 + Math.sin(lt * 2 + i) * 20; planet(p, x, y, (i === 0 ? 50 : 22) * a, lt, { face: i === 0 }); });
    label('Pluto', 450, 470, 30, '#a88b77', a);
    text('dwarf planets', 800, 560, 36, '#fff', { stroke: '#2b1055', sw: 7, alpha: a });
    return;
  }
  const name = PORDER[k], m = marks[k], a = eBack(prog(lt, S.M(m) - 0.2, 0.7));
  const x = lerp(1500, 640, a), y = 400;
  const R = [80, 110, 115, 95, 170, 120, 110, 110][k];
  const extra = clamp((lt - S.M(m) - 0.5) / 0.6);
  if (name === 'mercury') { sun(-60, 400, 260, lt, { face: true }); planet(name, x, y, R, lt, { face: true }); label('closest to the Sun', 640, 560, 32, '#ff7b00', extra); if (lt > lineFrac(S, m, 0.6)) { const p = clamp((lt - lineFrac(S, m, 0.6)) * 2); ['earth', 'neptune'].forEach((q, i) => planet(q, 980 + i * 150, 330, (40 + i * 25) * p, lt)); label('smallest', 640, 230, 34, '#7b2cbf', p); } }
  if (name === 'venus') { glow(x, y, 300, '#fff1b8', 0.6 * extra); planet(name, x, y, R, lt, { face: true }); withT(1060, 270, extra, 0, () => { rrect(-18, -100, 36, 180, 18); ctx.fillStyle = '#fff'; ctx.fill(); rrect(-8, -80, 16, 150, 8); ctx.fillStyle = '#e63946'; ctx.fill(); circle(0, 90, 28); ctx.fill(); }); label('hottest', 1060, 430, 32, '#e63946', extra); if (lt > lineFrac(S, m, 0.35)) { const p = clamp((lt - lineFrac(S, m, 0.35)) * 2); label('brightest in our sky', 640, 570, 32, '#ff9f1c', p); sparkle(250, 200, 50 * p, 1, '#fff7b0'); } }
  if (name === 'earth') { earthGlobe(x, y, R, lt * 0.4, { face: true, t: lt }); if (extra > 0) { withT(1040, 300, extra, 0, () => { card(0, 0, 240, 200, '#fff', 1); ctx.fillStyle = '#2a7bd6'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.arc(0, 10, 70, -PI / 2, PI * 0.9); ctx.fill(); ctx.fillStyle = '#49c25b'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.arc(0, 10, 70, PI * 0.9, PI * 1.5); ctx.fill();  }); label('more water than land', 640, 570, 32, '#2a7bd6', extra); } }
  if (name === 'mars') { planet(name, x, y, R, lt, { face: true }); if (extra > 0) withT(1020, 430, extra, 0, () => { ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(-180, 60); ctx.quadraticCurveTo(-60, -120, 0, -120); ctx.quadraticCurveTo(60, -120, 180, 60); ctx.fill(); ctx.fillStyle = '#7a1f14'; ctx.beginPath(); ctx.ellipse(0, -116, 40, 10, 0, 0, TAU); ctx.fill(); text('Olympus Mons', 0, 100, 32, '#fff', { stroke: '#7a1f14', sw: 7 }); }); label('the red planet', 640, 590, 32, '#c0392b', extra); }
  if (name === 'jupiter') {
    planet(name, x, y, R, lt, { face: true });
    const mn = ['Io', 'Europa', 'Ganymede', 'Callisto'];
    const mp = clamp((lt - lineFrac(S, m, 0.4)) * 1.5);
    mn.forEach((n, i) => { const an = lt * (0.8 - i * 0.15) + i * 1.6, rx = 230 + i * 55, ry = rx * 0.32; if (mp <= 0) return; ctx.strokeStyle = `rgba(255,255,255,${0.2 * mp})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.stroke(); const mx = x + Math.cos(an) * rx, my = y + Math.sin(an) * ry; moonBody(mx, my, (12 + i * 2) * mp, { glow: false }); text(n, mx, my - 30, 22, '#fff', { stroke: '#2b1055', sw: 5, alpha: mp }); });
    label('largest planet!', 640, 140, 34, '#c4844f', extra);
  }
  if (name === 'saturn') {
    const zoomR = lt > S.M('p6b') ? eOut(prog(lt, S.M('p6b'), 1)) : 0;
    planet(name, x - zoomR * 200, y, R, lt, { face: true });
    label('gas giant', 640, 160, 32, '#c99a4a', extra * (1 - zoomR));
    label('2nd largest', 640, 600, 32, '#c99a4a', extra * (1 - zoomR));
    if (zoomR > 0) withT(980, 400, zoomR, 0, () => { circle(0, 0, 200); ctx.fillStyle = 'rgba(10,10,40,0.92)'; ctx.fill(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 6; ctx.stroke(); ctx.save(); circle(0, 0, 194); ctx.clip(); for (let i = 0; i < 40; i++) { const r = 4 + Math.pow(hash(i), 3) * 40; ctx.fillStyle = `rgba(220,240,255,${0.6 + 0.4 * hash(i + 2)})`; withT(-200 + ((hash(i + 4) * 400 + lt * 20) % 400), -150 + hash(i + 6) * 300, 1, lt * 0.3 + i, () => { ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(0, -r * 0.7); ctx.lineTo(r, -r * 0.2); ctx.lineTo(r * 0.6, r * 0.7); ctx.lineTo(-r * 0.5, r * 0.6); ctx.closePath(); ctx.fill(); }); } house(70, 60, 0.4, {}); ctx.restore(); text('ice!', 0, 230, 34, '#fff', { stroke: '#2b1055', sw: 6 }); });
  }
  if (name === 'uranus') { const roll = (lt - S.M(m)) * 1.2; withT(x, y, 1, roll, () => planet(name, 0, 0, R, lt, { face: true })); label('blue-green', 640, 150, 32, '#2a9d8f', extra); label('rolls on its side', 640, 600, 32, '#2a9d8f', extra); }
  if (name === 'neptune') { planet(name, x + 150 * extra, y, R, lt, { face: true }); if (extra > 0) { sun(60, 400, 14, lt, { face: false }); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([8, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(90, 400); ctx.lineTo(640, 400); ctx.stroke(); ctx.setLineDash([]); label('farthest from the Sun', 380, 330, 30, '#2a4fd6', extra); } if (lt > lineFrac(S, m, 0.55)) { const p = clamp((lt - lineFrac(S, m, 0.55)) * 2); planet('earth', 420, 520, 28 * p, lt); label('Earth', 420, 580, 24, '#2a7bd6', p); label('almost 4 times as wide!', 790, 590, 30, '#2a4fd6', p); } }
};

// ---------------- COMETS
SC.comets = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#3fd4e4' });
  const pathOn = lt > S.M('path') - 0.2, met = lt > S.M('met') - 0.2, ast = lt > S.M('ast') - 0.2;
  if (ast) { asteroid(640, 380, 150, lt * 0.5, 7); for (let i = 0; i < 5; i++) asteroid(150 + i * 250, 150 + hash(i) * 450, 20 + hash(i + 3) * 25, lt, i); label('asteroid', 640, 590, 40, '#7a5a2a', S.ap('ast', 0.5)); return; }
  if (met) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1550'); g.addColorStop(1, '#48327a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); starField(lt, 0, 1); hills('#3c6b4a', '#2a5038', 540); const p = eOut(prog(lt, S.M('met') - 0.2, 1.2)); if (p < 1) comet(lerp(1100, 640, p), lerp(-50, 560, p), 10, -1.0, 160, lt); else { ctx.fillStyle = '#1e3826'; ctx.beginPath(); ctx.ellipse(640, 600, 110, 24, 0, 0, TAU); ctx.fill(); asteroid(640, 580, 40, 0, 2); } label('meteorite', 640, 450, 40, '#e63946', clamp((lt - S.M('met') - 1) * 2)); return; }
  if (!pathOn) {
    if (lt < S.M('ball')) { const p = (lt * 0.25) % 1; comet(lerp(1250, 200, p), lerp(150, 450, p), 22, -0.3, 420, lt, { face: lt > S.M('comet') }); if (lt < S.M('comet')) questionMark(640, 300, 0.7, lt); return; }
    // nucleus close-up
    const a = S.ap('ball', 0.7);
    withT(500, 390, a, 0, () => { glow(0, 0, 260, '#cfefff', 0.4); ctx.beginPath(); for (let i = 0; i < 16; i++) { const an = i / 16 * TAU, r = 150 * (0.85 + 0.2 * hash(i + 3)); ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fillStyle = '#d7e4ea'; ctx.fill(); for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(110,100,90,0.6)'; circle((hash(i) - 0.5) * 220, (hash(i + 7) - 0.5) * 220, 6 + hash(i + 2) * 12); ctx.fill(); } cuteFace(0, 0, 150, lt); });
    [['ice', '#9fd8ff', 0], ['frozen gases', '#c7b8ff', 1], ['dust', '#b9a99a', 2]].forEach(([w, c, i]) => label(w, 980, 220 + i * 140, 34, c === '#9fd8ff' ? '#2a7bd6' : c === '#c7b8ff' ? '#7b2cbf' : '#7a5a2a', prog(lt, lineFrac(S, 'ball', 0.5 + i * 0.12), 0.4)));
    return;
  }
  // orbit around the sun
  const cx = 660, cy = 400, rx = 480, ry = 190, fx = cx - Math.sqrt(rx * rx - ry * ry);
  sun(fx, cy, 60, lt);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([10, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx + 0, cy, rx, ry, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  const t2 = lt - S.M('path');
  const E = t2 * 0.5 + PI * 0.15; // simple param; fast near the Sun feel via easing
  const M = E + 0.6 * Math.sin(E);
  const px = cx + Math.cos(M) * rx, py = cy + Math.sin(M) * ry;
  const d = Math.hypot(px - fx, py - cy), near = clamp(1 - (d - 60) / 700);
  const ang = Math.atan2(py - cy, px - fx);
  const tailOn = lt > S.M('tail') ? 1 : 0.35;
  comet(px, py, 12, ang, 60 + 380 * near * tailOn, lt, { coma: 0.5 + 1.2 * near * tailOn });
  if (lt > S.M('tail')) { label('glowing cloud + long tail', 640, 660, 30, '#2a7bd6', S.ap('tail', 0.5)); }
};

// ---------------- ALIENS
SC.aliens = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#3fe46b', neb2: '#e43fd0' });
  planet('jupiter', 1100, 600, 120, lt);
  ufo(620, 300, 1.4, lt, { beam: lt > S.M('imagine') });
  if (lt > S.M('imagine')) label('pretend!', 620, 560, 38, '#ff5d8f', S.ap('imagine', 0.5));
  const bub = [['name', ['Zib Zob?', 'Blorp?', 'Twinkly?']], ['live', ['mars', 'saturn', 'neptune']], ['eat', ['cheese', 'sprinkles']]];
  bub.forEach(([m, items], i) => {
    if (lt < S.M(m) || (bub[i + 1] && lt > S.M(bub[i + 1][0]))) return;
    items.forEach((it, j) => { const a = eBack(prog(lt, S.M(m) + 0.5 + j * 0.5, 0.5)); const x = 250 + j * 390, y = 130 + (j % 2) * 30; withT(x, y, a, 0, () => { card(0, 0, 230, 120, '#fff', 1, { r: 60, border: '#7ee05a' }); if (m === 'name') text(it, 0, 2, 38, '#2bb673'); else if (m === 'live') { planet(it, -50, 0, 34, lt); text(PLANETS[it].name, 40, 2, 28, '#555', { shadow: false }); } else if (it === 'cheese') { moonBody(-50, 0, 34, { glow: false }); ctx.fillStyle = 'rgba(255,214,90,0.6)'; circle(-50, 0, 34); ctx.fill(); text('Moon cheese', 40, 2, 22, '#555', { shadow: false }); } else { for (let k = 0; k < 10; k++) { starPath(-70 + hash(k) * 50, -30 + hash(k + 3) * 60, 7, 3); ctx.fillStyle = ['#ff5d8f', '#ffd23f', '#4d96ff'][k % 3]; ctx.fill(); } text('Star sprinkles', 40, 2, 22, '#555', { shadow: false }); } }); });
  });
  if (lt > S.M('funny')) { for (let i = 0; i < 6; i++) text('ha', 400 + i * 100, 620 - Math.abs(Math.sin(lt * 4 + i)) * 40, 36, '#7ee05a', { stroke: '#1d5c12', sw: 6 }); }
};

// ---------------- SOLAR SYSTEM DAY
function costumeKid(x, y, s, t, kind, talk, active) {
  withT(x, y - (active ? Math.abs(Math.sin(t * 4)) * 14 : 0), s * (active ? 1.12 : 1), 0, () => {
    kid(0, 0, 1, t, { shirt: '#333', skin: ['#c68a5a', '#8d5a3b', '#f1c7a1'][kind], armsUp: active, bunches: kind === 1 });
    if (kind === 0) sun(0, 15, 48, t, { face: false });
    if (kind === 1) earthGlobe(0, 15, 46, t * 0.3, { glow: false });
    if (kind === 2) planet('saturn', 0, 15, 40, t);
  });
}
SC.celebration = S => {
  const lt = S.lt;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a1a6b'); g.addColorStop(1, '#7b2cbf'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  starField(lt, 0, 0.6);
  // bunting
  for (let r = 0; r < 2; r++) for (let i = 0; i < 16; i++) { const x = i * 85 + r * 40, y = 40 + r * 40 + Math.sin(i * 0.4) * 10; ctx.fillStyle = ['#ff5d8f', '#ffd23f', '#3ddc84', '#4d96ff'][(i + r) % 4]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60, y); ctx.lineTo(x + 30, y + 50); ctx.fill(); }
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(0, 560, W, 160); ctx.fillStyle = '#a8743d'; ctx.fillRect(0, 560, W, 18);
  text('Solar System Day', 640, 170, 60, '#ffd23f', { stroke: '#2b1055', sw: 12, w: 700, alpha: S.ap('party', 0.6) });
  const sing = lt > S.M('sing');
  [['k1', 360], ['k2', 640], ['k3', 920]].forEach(([m, x], i) => {
    const a = eBack(prog(lt, S.M('kids') + i * 0.4, 0.6)); if (a <= 0) return;
    const active = (lt > S.M(m) && lt < S.M(m) + lineD(S, m) + 0.3) || sing;
    costumeKid(x, 470, 1.6 * a, lt + i, i, 0, active);
    if (lt > S.M(m) && lt < S.M(m) + lineD(S, m) + 0.6) { const t2 = ['I am the Sun!', 'I am Earth!', 'I am Saturn!'][i]; card(x, 270, 270, 80, '#fff', 1, { border: '#ff5d8f' }); text(t2, x, 272, 32, '#7b2cbf', { shadow: false }); }
  });
  if (sing) { for (let i = 0; i < 8; i++) { const p = (lt * 0.4 + i / 8) % 1; text('♪', 100 + i * 150, 560 - p * 400, 46, ['#ffd23f', '#ff5d8f', '#7dffb3'][i % 3], { alpha: Math.sin(p * PI) }); } confetti(640, 300, S.M('sing'), lt); }
  if (lt > S.M('you') && lt < S.M('sing')) questionMark(1150, 300, 0.8, lt);
};

// ---------------- SPACE WORDS GAME
SC.words = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#e4c13f', neb2: '#3fe4b0' });
  const ps = S.pauses.filter(p => p.pic);
  let cur = -1; ps.forEach((p, i) => { if (lt >= p.t) cur = i; });
  if (cur < 0) { const a = S.ap('start', 0.6); withT(640, 380, a, Math.sin(lt * 2) * 0.05, () => { frame(0, 0, 420, 320, '#ffd23f'); questionMark(0, 0, 1.4, lt); }); return; }
  const p = ps[cur], rv = S.M('r' + cur);
  const a = eBack(prog(lt, p.t, 0.5));
  withT(640, 360, a, 0, () => {
    frame(0, 0, 440, 360, ['#ff7b54', '#4d96ff', '#3ddc84', '#c77dff'][cur % 4]);
    ctx.save(); rrect(-208, -168, 416, 336, 12); ctx.clip();
    const g = ctx.createLinearGradient(0, -168, 0, 168); g.addColorStop(0, '#1a1550'); g.addColorStop(1, '#3a1a6b'); ctx.fillStyle = g; ctx.fillRect(-210, -170, 420, 340);
    for (let i = 0; i < 20; i++) { ctx.fillStyle = '#fff'; circle(-200 + hash(i) * 400, -160 + hash(i + 3) * 320, 1.5); ctx.fill(); }
    icon(p.pic, 0, 0, 140, lt);
    ctx.restore();
  });
  // progress dots
  for (let i = 0; i < ps.length; i++) { circle(640 - (ps.length - 1) * 18 + i * 36, 660, 10); ctx.fillStyle = i < cur || (i === cur && lt > rv) ? '#ffd23f' : 'rgba(255,255,255,0.25)'; ctx.fill(); }
  if (lt > S.M('end')) {}
};

// ---------------- RECAP
SC.recap = S => {
  const lt = S.lt;
  bgSpace(lt, { neb1: '#7b3fe4' });
  let k = -1; for (let i = 1; i <= 9; i++) if (lt >= S.M('a' + i) - 0.2) k = i;
  if (k < 0) { const a = S.ap('start', 0.6); withT(640, 360, a, 0, () => { text("Let's remember!", 0, -40, 90, '#ffd23f', { stroke: '#7b2cbf', sw: 16, w: 700 }); }); twinkle(640, 520, 0.8 * a, lt, { talk: S.talkT, happyEyes: true }); S.host = null; return; }
  const a = eOut(prog(lt, S.M('a' + k) - 0.2, 0.6));
  ctx.save(); ctx.globalAlpha = a; withT(640 + (1 - a) * 300, 0, 1, 0, () => { ctx.translate(-640, 0);
    const cx = 640, cy = 380;
    if (k === 1) { [[400, 300, 120], [880, 260, 110], [640, 470, 140]].forEach(([x, y, r], i) => galaxy(x, y, r, lt, 1, { rot: i })); }
    if (k === 2) { sun(cx, cy, 150, lt); }
    if (k === 3) { miniSolar(cx, cy + 20, 1.1, lt); }
    if (k === 4) { galaxy(cx, cy, 360, lt, 1); earthGlobe(cx + 160, cy + 40, 40, lt, { face: true, t: lt }); label('home!', cx + 160, cy - 30, 26, '#ff5d8f', 1); }
    if (k === 5) { sun(120, cy, 90, lt, { face: false }); earthGlobe(cx + 60, cy, 170, 0, { lon0: lt * 60, light: PI, pin: 1 }); text('DAY', cx - 200, 620, 44, '#ffd23f', { stroke: '#7b2cbf', sw: 8 }); text('NIGHT', cx + 330, 620, 44, '#c7b8ff', { stroke: '#2b1055', sw: 8 }); }
    if (k === 6) { moonBody(cx, cy, 170, { face: true, t: lt }); }
    if (k === 7) { for (let i = 0; i < 40; i++) sparkle(150 + hash(i) * 980, 150 + hash(i + 3) * 450, 14 + 10 * Math.sin(lt * 3 + i), 1, '#fff7b0'); twinkle(cx, cy, 1.2, lt, { talk: S.talkT, happyEyes: true }); }
    if (k === 8) { telescope(380, 380, 1.4, { ang: -0.7 }); astronautGeneric(860, 380, 1.0, lt, { float: true, wave: true }); }
    if (k === 9) { rocket(300, 380, 0.9, lt, { flame: 1, rot: 0.3 }); satellite(700, 240, 0.6, lt); comet(1000, 470, 14, PI * 0.8, 260, lt, { face: true }); asteroid(720, 540, 50, lt, 4); }
  }); ctx.restore();
  S.host = k === 7 ? null : HOST;
};

// ---------------- CLOSING
SC.closing = S => {
  const lt = S.lt;
  const nightT = S.M('tonight');
  if (lt < nightT) {
    bgSpace(lt, { neb1: '#ffb03f' });
    if (lt < S.M('badge')) {
      for (let i = 0; i < 4; i++) { const x = 220 + i * 280; badge(i + 1, x, 330, 90, lt); stamp(x, 330, 0.8, i < 3 ? 1 : prog(lt, S.M('done') + 0.4, 0.3)); }
    } else {
      const a = eBack(prog(lt, S.M('badge') - 0.2, 0.8));
      withT(640, 330, a, Math.sin(lt * 2) * 0.05, () => {
        for (let i = 0; i < 16; i++) { const an = i / 16 * TAU + lt * 0.5; ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 360, an, an + 0.1); ctx.fill(); ctx.restore(); }
        ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.moveTo(-70, -60); ctx.lineTo(-110, -260); ctx.lineTo(-30, -260); ctx.lineTo(0, -90); ctx.fill(); ctx.fillStyle = '#4d96ff'; ctx.beginPath(); ctx.moveTo(70, -60); ctx.lineTo(110, -260); ctx.lineTo(30, -260); ctx.lineTo(0, -90); ctx.fill();
        circle(0, 0, 150); const g = ctx.createRadialGradient(-40, -40, 10, 0, 0, 150); g.addColorStop(0, '#fff3a8'); g.addColorStop(0.6, '#ffd23f'); g.addColorStop(1, '#e09b00'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#c98a00'; ctx.stroke();
        starPath(0, -10, 90, 40); ctx.fillStyle = '#fff6c9'; ctx.fill();
        twinkle(0, -10, 0.55, lt, { bob: 0, happyEyes: true });
      });
      if (lt > S.M('teacher')) {
        const p = S.ap('teacher', 0.6);
        withT(250, 560, p, -0.1, () => { rrect(-80, -100, 160, 200, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#7b2cbf'; ctx.lineWidth = 4; ctx.stroke(); planet('saturn', 0, -30, 26, lt); for (let i = 0; i < 4; i++) { ctx.strokeStyle = '#bbb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, 30 + i * 18); ctx.lineTo(60, 30 + i * 18); ctx.stroke(); } });
        withT(1030, 560, p, 0, () => { rrect(-45, -90, 90, 170, 8); ctx.fillStyle = '#5b7ce4'; ctx.fill(); ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.moveTo(-55, -90); ctx.lineTo(0, -150); ctx.lineTo(55, -90); ctx.fill(); circle(0, -40, 22); ctx.fillStyle = '#9fd8ff'; ctx.fill(); });
      }
    }
    const za = S.ap('zoe', 0.7);
    if (za > 0) zoe(lerp(1400, 1120, za), 430, 0.8, lt, { talk: S.talkZ, float: true, wave: true });
    return;
  }
  // night sky over a house
  bgSky(0, lt);
  moonBody(1000, 160, 60, { face: true, t: lt });
  hills('#25305e', '#1b2347', 580); house(300, 560, 1, { lit: true }); tree(470, 560, 0.9);
  kid(620, 610, 0.9, lt, { armsUp: true, shirt: '#ffd23f' });
  const kp = lt > S.M('keep') ? lt - S.M('keep') : -1;
  if (kp > 0) rocket(900 + kp * 60, 520 - kp * kp * 25, 0.5, lt, { flame: 1, rot: 0.4, pilot: false });
  const bye = lt > S.M('bye');
  zoe(1080, 470, 0.7, lt, { talk: S.talkZ, wave: bye, float: true });
  twinkle(820, 300, 1.0, lt, { talk: S.talkT, wave: bye });
  if (lt > S.M('end')) { const a = eBack(prog(lt, S.M('end'), 0.8)); withT(560, 175, a, 0, () => { text('The End', 0, 0, 120, '#ffd23f', { stroke: '#7b2cbf', sw: 18, w: 700 }); }); for (let i = 0; i < 10; i++) sparkle(300 + hash(i) * 520, 100 + hash(i + 3) * 160, 20 * (0.5 + 0.5 * Math.sin(lt * 5 + i)), a); }
  S.host = null;
};

// ---------------- engine
function makeS(sc, lt, gt) {
  const S = { id: sc.id, lt, gt, dur: sc.dur, lines: sc.lines, thinks: sc.thinks, pauses: sc.pauses, data: sc.data, part: sc.part, host: HOST, caps: sc.caps || [] };
  S.M = n => (sc.marks[n] !== undefined ? sc.marks[n] : 1e9);
  S.ap = (n, d = 0.6) => eBack(prog(lt, S.M(n), d));
  S.talkT = mouthAt('T', gt); S.talkZ = mouthAt('Z', gt);
  return S;
}
function overlays(S) {
  const lt = S.lt;
  // part label
  if (S.id !== 'opening') { ctx.save(); ctx.font = font(18, 500); const w = ctx.measureText(S.part).width + 30; ctx.globalAlpha = 0.85; rrect(16, 14, w, 32, 16); ctx.fillStyle = 'rgba(20,10,50,0.55)'; ctx.fill(); text(S.part, 16 + w / 2, 31, 18, '#fff', { shadow: false, w: 500 }); ctx.restore(); }
  // keyword chip
  const kws = S.lines.filter(l => l.kw && l.t <= lt + 0.05);
  for (const L of kws.slice(-1)) {
    const nxt = S.lines.find(l => l.kw && l.t > L.t);
    const t0 = L.t, t1 = Math.min(L.t + L.d + 0.7, nxt ? nxt.t - 0.3 : 1e9);
    if (lt < t0 - 0.05 || lt > t1 + 0.3) continue;
    const a = lt < t1 ? eBack(prog(lt, t0, 0.45)) : 1 - prog(lt, t1, 0.3);
    if (a <= 0) continue;
    withT(640, 78, a, Math.sin(lt * 3) * 0.015, () => {
      ctx.font = font(44, 700); const w = ctx.measureText(L.kw).width + 70;
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
      rrect(-w / 2, -36, w, 72, 36); const g = ctx.createLinearGradient(0, -36, 0, 36); g.addColorStop(0, '#ff5d8f'); g.addColorStop(1, '#c2185b'); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
      text(L.kw, 0, 3, 44, '#fff', { w: 700, shadow: false });
      sparkle(-w / 2 + 6, -30, 14 + 4 * Math.sin(lt * 6), 1, '#ffd23f'); sparkle(w / 2 - 6, 28, 12 + 4 * Math.cos(lt * 6), 1, '#ffd23f');
    });
  }
  // thinking timer
  for (const th of S.thinks) {
    if (lt < th.t - 0.1 || lt > th.t + th.d + 0.25) continue;
    const p = clamp((lt - th.t) / th.d), a = clamp((lt - th.t + 0.1) * 5) * clamp((th.t + th.d + 0.25 - lt) * 5);
    const left = Math.max(1, Math.ceil(th.d - (lt - th.t)));
    withT(1170, 112, 0.7 + 0.3 * a, 0, () => {
      ctx.globalAlpha = a;
      circle(0, 0, 62); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
      ctx.lineWidth = 12; ctx.strokeStyle = '#e8e0ff'; circle(0, 0, 50); ctx.stroke();
      ctx.strokeStyle = p > 0.75 ? '#ff5d8f' : '#7b2cbf'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 50, -PI / 2, -PI / 2 + TAU * (1 - p)); ctx.stroke();
      text(String(left), 0, 3, 50, '#7b2cbf', { w: 700, shadow: false });
      text('Think!', 0, 92, 30, '#fff', { stroke: '#7b2cbf', sw: 7, w: 700 });
      ctx.globalAlpha = 1;
    });
    // small thought bubbles near the host
    if (S.host) { for (let i = 0; i < 3; i++) { circle(S.host.x + 70 + i * 22, S.host.y - 90 - i * 26, 6 + i * 4); ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`; ctx.fill(); } }
  }
  // praise burst
  for (const L of S.lines) {
    if (!L.praise) continue;
    const dt = lt - L.t; if (dt < 0 || dt > 2.2) continue;
    const a = eBack(clamp(dt / 0.45)) * clamp((2.2 - dt) * 3);
    confetti(640, 400, L.t, lt, 80);
    withT(640, S.type === 'quiz' ? 655 : S.type === 'tf' ? 560 : 330, a, Math.sin(dt * 8) * 0.06, () => {
      text(L.praise, 0, 0, 92, '#ffd23f', { stroke: '#7b2cbf', sw: 18, w: 700 });
      for (let i = 0; i < 6; i++) sparkle(Math.cos(i + dt * 3) * 300, Math.sin(i * 2 + dt * 3) * 70, 22, 1);
    });
  }
}
function transition(lt, dur) {
  let k = 0;
  if (lt < 0.45) k = 1 - eOut(lt / 0.45);
  else if (lt > dur - 0.3) k = eOut((lt - (dur - 0.3)) / 0.3);
  if (k <= 0.001) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  const R = (1 - k) * 1100;
  for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5 + k, rr = i % 2 ? R * 0.5 : R; ctx.lineTo(640 + Math.cos(a) * rr, 360 + Math.sin(a) * rr); }
  ctx.closePath();
  ctx.fillStyle = '#1b0f3b'; ctx.fill('evenodd');
  ctx.restore();
}
let SCN_IDX = 0;
function renderFrame(gt) {
  const scs = TL.scenes;
  let i = 0; while (i < scs.length - 1 && gt >= scs[i + 1].start) i++;
  const sc = scs[i], lt = gt - sc.start;
  const S = makeS(sc, lt, gt); S.type = sc.type;
  ctx.save(); ctx.clearRect(0, 0, W, H);
  ctx.save(); (SC[sc.type] || SC.opening)(S); ctx.restore();
  if (S.host) twinkle(S.host.x, S.host.y, S.host.s, gt, { talk: S.talkT });
  overlays(S);
  transition(lt, sc.dur);
  ctx.restore();
}
