// ---------- core helpers, art primitives and characters ----------
const W = 1280, H = 720, PI = Math.PI, TAU = PI * 2;
let ctx, TL;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => (t = clamp(t), t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
const eBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const prog = (t, t0, d) => clamp((t - t0) / d);
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const rgba = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

function font(size, w = 600) { return `${w} ${size}px Fredoka`; }
function text(str, x, y, size, color = '#fff', o = {}) {
  ctx.save();
  ctx.font = font(size, o.w || 600);
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; }
  if (o.stroke) { ctx.lineWidth = o.sw || size * 0.16; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); ctx.shadowColor = 'transparent'; }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
  ctx.restore();
}
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); }
function withT(x, y, s, rot, fn) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (s !== 1) ctx.scale(s, s); fn(); ctx.restore(); }
function starPath(cx, cy, R, r, n = 5, rot = -PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + i * PI / n, rr = i % 2 ? r : R;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}
function sparkle(x, y, s, a = 1, col = '#fff') {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) { const an = i * PI / 2; ctx.quadraticCurveTo(0, 0, Math.cos(an) * s, Math.sin(an) * s); ctx.quadraticCurveTo(0, 0, Math.cos(an + PI / 4) * s * 0.15, Math.sin(an + PI / 4) * s * 0.15); }
  ctx.fill(); ctx.restore();
}
function glow(x, y, r, col, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function mouthAt(spk, gt) { const m = TL.mouth[spk]; const i = Math.floor(gt * TL.fps); return i >= 0 && i < m.length ? (+m[i]) / 9 : 0; }

// ---------- backgrounds ----------
const STARS = Array.from({ length: 260 }, (_, i) => ({ x: hash(i) * W, y: hash(i + 500) * H, r: 0.6 + hash(i + 900) * 1.8, p: hash(i + 1300) * TAU, s: 1 + hash(i + 77) * 3 }));
function bgSpace(t, o = {}) {
  const top = o.top || '#0b0a2e', bot = o.bot || '#3a1a6b';
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // nebula blobs
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(250 + Math.sin(t * 0.1) * 30, 200, 380, o.neb1 || '#7b3fe4', 0.18);
  glow(1050, 520 + Math.cos(t * 0.12) * 30, 420, o.neb2 || '#e43f9a', 0.13);
  glow(700, 650, 300, '#2f8fe4', 0.10);
  ctx.restore();
  starField(t, o.speed || 0, o.alpha ?? 1);
}
function starField(t, speed = 0, alpha = 1) {
  ctx.save();
  for (const s of STARS) {
    let x = (s.x - t * speed * s.r * 6) % W; if (x < 0) x += W;
    const tw = 0.55 + 0.45 * Math.sin(t * s.s + s.p);
    ctx.globalAlpha = alpha * tw; ctx.fillStyle = '#fff';
    circle(x, s.y, s.r); ctx.fill();
    if (s.r > 2.1) sparkle(x, s.y, s.r * 3.5 * tw, alpha * tw * 0.8);
  }
  ctx.restore();
}
function warpStars(t, k) { // flying through stars from the centre
  ctx.save(); ctx.strokeStyle = '#fff';
  for (let i = 0; i < 160; i++) {
    const a = hash(i) * TAU, z = ((hash(i + 40) + t * k) % 1);
    const d0 = Math.pow(z, 2.2) * 900, d1 = Math.pow(clamp(z - 0.02 * k), 2.2) * 900;
    ctx.globalAlpha = z; ctx.lineWidth = 1 + z * 3;
    ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * d1, H / 2 + Math.sin(a) * d1); ctx.lineTo(W / 2 + Math.cos(a) * d0, H / 2 + Math.sin(a) * d0); ctx.stroke();
  }
  ctx.restore();
}
function bgSky(day, t) { // day: 1 = day, 0 = night
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mixc('#0b0a2e', '#4fb3ff', day)); g.addColorStop(1, mixc('#3a1a6b', '#bfe8ff', day));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (day < 0.9) starField(t, 0, (1 - day));
}
function mixc(a, b, t) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const r = lerp(A >> 16, B >> 16, t), g = lerp((A >> 8) & 255, (B >> 8) & 255, t), bl = lerp(A & 255, B & 255, t);
  return `rgb(${r | 0},${g | 0},${bl | 0})`;
}
function cloud(x, y, s, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#fff';
  ctx.beginPath();
  [[0, 0, 40], [45, -18, 50], [95, 0, 40], [50, 12, 42], [-30, 8, 28], [125, 10, 28]].forEach(([dx, dy, r]) => { ctx.moveTo(x + dx * s + r * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); });
  ctx.fill(); ctx.restore();
}
function hills(col1, col2, y0 = 560) {
  ctx.fillStyle = col1; ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y0 + Math.sin(x * 0.006) * 30 + Math.sin(x * 0.017) * 12);
  ctx.lineTo(W, H); ctx.fill();
  ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y0 + 60 + Math.sin(x * 0.009 + 2) * 25);
  ctx.lineTo(W, H); ctx.fill();
}

// ---------- characters ----------
function twinkle(x, y, s, t, o = {}) {
  const talk = o.talk || 0, bob = Math.sin(t * 2.4) * 6 * (o.bob ?? 1);
  withT(x, y + bob, s, Math.sin(t * 1.3) * 0.06 + (o.rot || 0), () => {
    glow(0, 0, 120, '#ffe066', 0.35);
    ctx.lineJoin = 'round';
    starPath(0, 4, 82, 40); ctx.lineWidth = 14; ctx.strokeStyle = '#ffb703'; ctx.stroke();
    const g = ctx.createRadialGradient(-15, -15, 5, 0, 0, 90); g.addColorStop(0, '#fff7b0'); g.addColorStop(0.6, '#ffe24a'); g.addColorStop(1, '#ffc300');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = g; ctx.stroke();
    // cheeks
    ctx.fillStyle = 'rgba(255,120,150,0.55)'; circle(-30, 18, 9); ctx.fill(); circle(30, 18, 9); ctx.fill();
    // eyes
    const blink = (t % 3.7) < 0.12 ? 0.15 : 1;
    if (o.happyEyes) {
      ctx.strokeStyle = '#3b2a10'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-18, 2, 8, PI * 1.1, PI * 1.9); ctx.stroke(); ctx.beginPath(); ctx.arc(18, 2, 8, PI * 1.1, PI * 1.9); ctx.stroke();
    } else {
      ctx.fillStyle = '#3b2a10';
      ctx.beginPath(); ctx.ellipse(-17, 0, 7, 10 * blink, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(17, 0, 7, 10 * blink, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; circle(-15, -4, 2.6); ctx.fill(); circle(19, -4, 2.6); ctx.fill();
    }
    // mouth
    ctx.fillStyle = '#7a2a1a';
    if (talk > 0.08) {
      ctx.beginPath(); ctx.ellipse(0, 20, 10 + talk * 3, 3 + talk * 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff7b8a'; ctx.beginPath(); ctx.ellipse(0, 20 + talk * 6, 6, 2.5 + talk * 3, 0, 0, PI); ctx.fill();
    } else {
      ctx.strokeStyle = '#7a2a1a'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 12, 12, 0.2 * PI, 0.8 * PI); ctx.stroke();
    }
    if (o.wave) { // little waving arm sparkle
      sparkle(70, -60 + Math.sin(t * 8) * 8, 16, 0.9, '#fff7b0');
    }
  });
  // orbiting sparkles
  for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * TAU / 3; sparkle(x + Math.cos(a) * 95 * s, y + bob + Math.sin(a) * 60 * s, 9 * s, 0.6 + 0.4 * Math.sin(t * 5 + i)); }
}

function zoe(x, y, s, t, o = {}) {
  const parts = o.parts || { suit: 1, pack: 1, helmet: 1, boots: 1 };
  const talk = o.talk || 0, fl = o.float ? Math.sin(t * 1.8) * 10 : 0;
  withT(x, y + fl, s, (o.float ? Math.sin(t * 1.1) * 0.08 : 0) + (o.rot || 0), () => {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const suitC = '#f4f6fb', edge = '#9aa6c4', acc = '#ff8a3d';
    // backpack
    if (parts.pack) { ctx.globalAlpha = parts.pack; rrect(-58, -40, 116, 120, 18); ctx.fillStyle = '#cfd6e6'; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 1; }
    // legs
    const legC = parts.suit ? suitC : '#2f5fb3';
    [-1, 1].forEach(sd => {
      const sw = o.walk ? Math.sin(t * 6 + (sd > 0 ? PI : 0)) * 0.3 : 0;
      withT(sd * 22, 70, 1, sw, () => {
        rrect(-17, 0, 34, 70, 14); ctx.fillStyle = legC; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 3; ctx.stroke();
        if (parts.boots) { ctx.globalAlpha = parts.boots; rrect(-22, 56, 44, 26, 10); ctx.fillStyle = '#56607a'; ctx.fill(); ctx.globalAlpha = 1; }
        else { rrect(-19, 60, 38, 18, 8); ctx.fillStyle = '#e54b4b'; ctx.fill(); }
      });
    });
    // body
    rrect(-50, -45, 100, 125, 34); ctx.fillStyle = parts.suit ? suitC : '#47b5ff'; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 4; ctx.stroke();
    if (parts.suit) {
      rrect(-26, -10, 52, 36, 8); ctx.fillStyle = '#dfe5f2'; ctx.fill(); ctx.stroke();
      ['#ff5d5d', '#3ddc84', '#ffd23f'].forEach((c, i) => { circle(-12 + i * 12, 8, 5); ctx.fillStyle = c; ctx.fill(); });
      ctx.fillStyle = acc; rrect(-50, 40, 100, 10, 4); ctx.fill();
      // flag patch
      rrect(24, -32, 18, 12, 2); ctx.fillStyle = '#01411c'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(24, -32, 5, 12);
    }
    // arms
    const wave = o.wave ? Math.sin(t * 7) * 0.4 : 0;
    [-1, 1].forEach(sd => {
      const ang = sd < 0 ? 0.35 : (o.armUp ? -2.4 + wave : -0.35 + (o.wave ? -2.1 + wave : 0));
      withT(sd * 50, -28, 1, sd < 0 ? ang : ang + (o.wave ? 0 : 0), () => {
        rrect(-14, 0, 28, 66, 13); ctx.fillStyle = parts.suit ? suitC : '#47b5ff'; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 3; ctx.stroke();
        circle(0, 70, 15); ctx.fillStyle = parts.suit ? acc : '#8d5a3b'; ctx.fill();
        if (sd > 0 && o.tool) { withT(0, 78, 1, 0.6, () => { rrect(-5, 0, 10, 46, 4); ctx.fillStyle = '#9aa6c4'; ctx.fill(); circle(0, 50, 12); ctx.fill(); ctx.fillStyle = '#20243a'; circle(0, 54, 6); ctx.fill(); }); }
      });
    });
    // head
    const skin = '#8d5a3b';
    // hair back
    ctx.fillStyle = '#2b1a12'; circle(0, -92, 44); ctx.fill(); circle(0, -140, 18); ctx.fill();
    circle(0, -88, 38); ctx.fillStyle = skin; ctx.fill();
    ctx.fillStyle = '#2b1a12'; ctx.beginPath(); ctx.arc(0, -96, 40, PI * 1.05, PI * 1.95); ctx.quadraticCurveTo(10, -110, -38, -100); ctx.fill();
    // face
    const blink = (t % 4.3) < 0.12 ? 0.15 : 1;
    ctx.fillStyle = '#1d120c';
    ctx.beginPath(); ctx.ellipse(-14, -86, 5, 7 * blink, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(14, -86, 5, 7 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; circle(-12, -89, 1.8); ctx.fill(); circle(16, -89, 1.8); ctx.fill();
    ctx.fillStyle = 'rgba(255,110,120,0.45)'; circle(-24, -72, 6); ctx.fill(); circle(24, -72, 6); ctx.fill();
    if (talk > 0.08) { ctx.fillStyle = '#5a1a14'; ctx.beginPath(); ctx.ellipse(0, -68, 7 + talk * 2, 2 + talk * 8, 0, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = '#5a1a14'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, -76, 9, 0.2 * PI, 0.8 * PI); ctx.stroke(); }
    // helmet
    if (parts.helmet) {
      ctx.globalAlpha = parts.helmet;
      circle(0, -88, 62); const hg = ctx.createRadialGradient(-20, -110, 5, 0, -88, 64);
      hg.addColorStop(0, 'rgba(255,255,255,0.45)'); hg.addColorStop(0.5, 'rgba(180,220,255,0.12)'); hg.addColorStop(1, 'rgba(120,170,255,0.35)');
      ctx.fillStyle = hg; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#e8edf7'; ctx.stroke();
      if (o.visor) { ctx.save(); circle(0, -88, 58); ctx.clip(); ctx.fillStyle = `rgba(255,170,40,${0.75 * o.visor})`; ctx.fillRect(-70, -160, 140, 70 + 40 * o.visor); ctx.restore(); }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -88, 48, PI * 1.15, PI * 1.45); ctx.stroke();
      rrect(-40, -32, 80, 14, 7); ctx.fillStyle = '#cfd6e6'; ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
}

function kid(x, y, s, t, o = {}) { // simple child figure
  const skin = o.skin || '#c68a5a', shirt = o.shirt || '#ff6b6b', hair = o.hair || '#2b1a12';
  withT(x, y, s, 0, () => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#33415c'; ctx.lineWidth = 12;
    const sw = o.run ? Math.sin(t * 9) * 0.5 : 0;
    ctx.beginPath(); ctx.moveTo(-8, 40); ctx.lineTo(-12 - sw * 20, 85); ctx.moveTo(8, 40); ctx.lineTo(12 + sw * 20, 85); ctx.stroke();
    rrect(-24, -10, 48, 56, 16); ctx.fillStyle = shirt; ctx.fill();
    ctx.strokeStyle = shirt; ctx.lineWidth = 11;
    const up = o.armsUp ? -1 : 0.4;
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-40, 25 * up - (o.armsUp ? 20 : 0) + Math.sin(t * 8) * (o.armsUp ? 6 : 0)); ctx.moveTo(20, 0); ctx.lineTo(40, 25 * up - (o.armsUp ? 20 : 0) - Math.sin(t * 8) * (o.armsUp ? 6 : 0)); ctx.stroke();
    circle(0, -36, 28); ctx.fillStyle = skin; ctx.fill();
    ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -42, 29, PI, TAU); ctx.fill();
    if (o.bunches) { circle(-28, -40, 9); ctx.fill(); circle(28, -40, 9); ctx.fill(); }
    if (o.sleep) {
      ctx.strokeStyle = '#1d120c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-10, -34, 5, 0, PI); ctx.stroke(); ctx.beginPath(); ctx.arc(10, -34, 5, 0, PI); ctx.stroke();
    } else {
      ctx.fillStyle = '#1d120c'; circle(-10, -36, 3.5); ctx.fill(); circle(10, -36, 3.5); ctx.fill();
      ctx.strokeStyle = '#5a1a14'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -28, 8, 0.15 * PI, 0.85 * PI); ctx.stroke();
    }
  });
}

// ---------- space objects ----------
function sun(x, y, r, t, o = {}) {
  if (!(r > 0.5)) return;
  ctx.save();
  glow(x, y, r * 2.3, '#ffb703', 0.45);
  // wiggly rays
  if (o.rays !== false) {
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    const n = 16;
    for (let i = 0; i <= n * 2; i++) {
      const a = i * PI / n + t * 0.25, rr = r * (i % 2 ? 1.05 : 1.32 + 0.06 * Math.sin(t * 3 + i));
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff6a8'); g.addColorStop(0.5, '#ffd000'); g.addColorStop(1, '#ff8c00');
  circle(x, y, r); ctx.fillStyle = g; ctx.fill();
  if (o.face !== false && r > 30) {
    const blink = (t % 4.1) < 0.12 ? 0.15 : 1;
    ctx.fillStyle = '#7a3a00';
    ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.1, r * 0.08, r * 0.12 * blink, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.3, y - r * 0.1, r * 0.08, r * 0.12 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,90,60,0.4)'; circle(x - r * 0.48, y + r * 0.18, r * 0.12); ctx.fill(); circle(x + r * 0.48, y + r * 0.18, r * 0.12); ctx.fill();
    ctx.strokeStyle = '#7a3a00'; ctx.lineWidth = r * 0.06; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y + r * 0.08, r * 0.3, 0.2 * PI, 0.8 * PI); ctx.stroke();
  }
  ctx.restore();
}

const PLANETS = {
  mercury: { c: ['#d9cfc4', '#8f8579'], name: 'Mercury' },
  venus: { c: ['#ffe2a6', '#d99a3f'], name: 'Venus', bands: '#f2c46d' },
  earth: { c: ['#5bc0ff', '#1d5fbf'], name: 'Earth' },
  mars: { c: ['#ff9a6b', '#c0392b'], name: 'Mars' },
  jupiter: { c: ['#f6d6b0', '#c4844f'], name: 'Jupiter', bands: '#b8693a', spot: true },
  saturn: { c: ['#fbe7b5', '#d1a85e'], name: 'Saturn', bands: '#c99a4a', ring: true },
  uranus: { c: ['#c8fbff', '#58c7d6'], name: 'Uranus', ring2: true },
  neptune: { c: ['#7fb2ff', '#2a4fd6'], name: 'Neptune', bands: '#3a63e0' },
  pluto: { c: ['#f1dccb', '#a88b77'], name: 'Pluto' },
};
const PORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

function planet(name, x, y, r, t = 0, o = {}) {
  if (!(r > 0.5)) return;
  const P = PLANETS[name];
  if (name === 'earth') return earthGlobe(x, y, r, (o.rot ?? t * 0.25), o);
  ctx.save();
  if (o.glow) glow(x, y, r * 1.8, P.c[0], 0.35 * o.glow);
  const tilt = name === 'uranus' ? 1.45 : -0.35;
  if (P.ring) ringHalf(x, y, r, tilt, true);
  if (P.ring2) ringHalf(x, y, r, tilt, true, 0.5);
  circle(x, y, r);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, P.c[0]); g.addColorStop(1, P.c[1]); ctx.fillStyle = g; ctx.fill();
  ctx.save(); circle(x, y, r); ctx.clip();
  if (P.bands) {
    ctx.strokeStyle = rgba(P.bands, 0.55); ctx.lineCap = 'round';
    for (let i = -3; i <= 3; i++) {
      ctx.lineWidth = r * (0.09 + 0.05 * hash(i + name.length));
      ctx.beginPath();
      if (name === 'uranus') { ctx.moveTo(x + i * r * 0.28, y - r); ctx.lineTo(x + i * r * 0.28, y + r); }
      else for (let k = -r; k <= r; k += r / 6) ctx.lineTo(x + k, y + i * r * 0.27 + Math.sin(k / r * 4 + t + i) * r * 0.03);
      ctx.stroke();
    }
  }
  if (P.spot) { ctx.fillStyle = '#c0533a'; ctx.beginPath(); ctx.ellipse(x + r * 0.35, y + r * 0.3, r * 0.2, r * 0.11, 0, 0, TAU); ctx.fill(); }
  if (name === 'mercury' || name === 'pluto') { ctx.fillStyle = 'rgba(90,80,70,0.35)'; [[-.3, -.2, .18], [.35, .1, .14], [-.05, .45, .12], [.2, -.45, .1]].forEach(([a, b, c]) => { circle(x + a * r, y + b * r, c * r); ctx.fill(); }); }
  if (name === 'mars') { ctx.fillStyle = 'rgba(120,30,20,0.35)'; [[-.3, -.1, .25], [.3, .3, .18]].forEach(([a, b, c]) => { circle(x + a * r, y + b * r, c * r); ctx.fill(); }); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(x, y - r * 0.92, r * 0.35, r * 0.12, 0, 0, TAU); ctx.fill(); }
  // shading
  const sh = ctx.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0.45, 'rgba(0,0,30,0)'); sh.addColorStop(1, 'rgba(0,0,30,0.45)');
  ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  if (P.ring) ringHalf(x, y, r, tilt, false);
  if (P.ring2) ringHalf(x, y, r, tilt, false, 0.5);
  if (o.face) cuteFace(x, y + r * 0.05, r, t);
  ctx.restore();
}
function ringHalf(x, y, r, tilt, back, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  ctx.beginPath(); ctx.ellipse(0, 0, r * 2.1, r * 0.55, 0, back ? PI : 0, back ? TAU : PI);
  ctx.lineWidth = r * 0.32; ctx.strokeStyle = `rgba(240,215,160,${0.9 * a})`; ctx.stroke();
  ctx.lineWidth = r * 0.08; ctx.strokeStyle = `rgba(190,150,90,${0.9 * a})`; ctx.stroke();
  ctx.restore();
}
function cuteFace(x, y, r, t) {
  const blink = ((t + x * 0.01) % 3.9) < 0.12 ? 0.15 : 1;
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.08, r * 0.08, r * 0.12 * blink, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + r * 0.3, y - r * 0.08, r * 0.08, r * 0.12 * blink, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = Math.max(2, r * 0.06); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y + r * 0.08, r * 0.22, 0.2 * PI, 0.8 * PI); ctx.stroke();
  ctx.fillStyle = 'rgba(255,100,120,0.4)'; circle(x - r * 0.48, y + r * 0.15, r * 0.1); ctx.fill(); circle(x + r * 0.48, y + r * 0.15, r * 0.1); ctx.fill();
}

// rough continents [lon, lat]
const CONT = [
  [[-6, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [40, -3], [40, -15], [35, -25], [20, -35], [18, -30], [12, -17], [9, -2], [9, 4], [-8, 5], [-17, 14], [-17, 21], [-13, 28]],
  [[-10, 36], [-9, 43], [-2, 48], [5, 53], [10, 57], [5, 62], [15, 69], [30, 71], [60, 70], [80, 73], [105, 77], [140, 72], [180, 68], [170, 60], [160, 58], [142, 52], [135, 43], [129, 35], [122, 30], [120, 22], [108, 18], [106, 10], [100, 7], [98, 15], [92, 22], [88, 22], [80, 15], [77, 8], [72, 20], [67, 24], [57, 25], [56, 27], [50, 30], [48, 29], [56, 26], [59, 22], [52, 16], [43, 13], [39, 22], [35, 28], [36, 36], [27, 37], [26, 40], [23, 37], [20, 40], [13, 44], [16, 38], [12, 38], [8, 44], [3, 43], [-5, 36]],
  [[-168, 66], [-160, 70], [-140, 70], [-120, 70], [-95, 72], [-80, 70], [-65, 60], [-55, 52], [-66, 45], [-70, 41], [-76, 35], [-81, 30], [-80, 25], [-83, 29], [-90, 30], [-97, 26], [-97, 20], [-90, 16], [-83, 9], [-78, 8], [-86, 14], [-92, 15], [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 60]],
  [[-78, 8], [-72, 12], [-62, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -27], [-58, -38], [-65, -42], [-68, -52], [-72, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -13], [-81, -5], [-80, 1]],
  [[114, -22], [122, -17], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [150, -37], [141, -38], [131, -31], [115, -34]],
  [[-55, 60], [-45, 60], [-20, 70], [-20, 82], [-60, 82], [-73, 78], [-55, 70]],
];
function project(lon, lat, lon0, r, tilt = 0.2) {
  const l = (lon - lon0) * PI / 180, p = lat * PI / 180;
  let X = Math.cos(p) * Math.sin(l), Y = Math.sin(p), Z = Math.cos(p) * Math.cos(l);
  // tilt toward viewer
  const y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt);
  return [X * r, -y2 * r, z2];
}
function earthGlobe(x, y, r, rot, o = {}) {
  if (!(r > 0.5)) return;
  const lon0 = (o.lon0 !== undefined ? o.lon0 : rot * 180 / PI) % 360;
  ctx.save();
  if (o.glow !== false) glow(x, y, r * 1.35, '#6fd0ff', 0.35);
  circle(x, y, r);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#7fd3ff'); g.addColorStop(1, '#1a56b8'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); circle(x, y, r); ctx.clip();
  ctx.fillStyle = '#49c25b';
  for (const poly of CONT) {
    ctx.beginPath();
    let any = false;
    for (const [lo, la] of poly) {
      let [px, py, z] = project(lo, la, lon0, r);
      if (z < 0) { const d = Math.hypot(px, py) || 1; px = px / d * r * 1.02; py = py / d * r * 1.02; } else any = true;
      ctx.lineTo(x + px, y + py);
    }
    if (any) ctx.fill();
  }
  // ice caps
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.6, r * 0.14, 0, 0, TAU); ctx.fill();
  // clouds
  if (o.clouds !== false) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 6; i++) { const [px, py, z] = project(i * 60 + 20, (hash(i) - 0.5) * 100, lon0 * 1.15, r); if (z > 0) { ctx.beginPath(); ctx.ellipse(x + px, y + py, r * 0.22 * z, r * 0.06, 0, 0, TAU); ctx.fill(); } } }
  // night side
  if (o.light !== undefined) {
    const a = o.light; // direction (radians) light comes FROM
    const lx = Math.cos(a), ly = Math.sin(a);
    const sg = ctx.createLinearGradient(x + lx * r, y + ly * r, x - lx * r, y - ly * r);
    sg.addColorStop(0.42, 'rgba(5,5,40,0)'); sg.addColorStop(0.58, 'rgba(5,5,40,0.72)'); sg.addColorStop(1, 'rgba(5,5,40,0.82)');
    ctx.fillStyle = sg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  } else {
    const sh = ctx.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0.5, 'rgba(0,0,30,0)'); sh.addColorStop(1, 'rgba(0,0,30,0.4)');
    ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
  if (o.pin) {
    const [px, py, z] = project(70, 30, lon0, r);
    if (z > 0.05) {
      const pa = clamp(z * 3) * o.pin;
      ctx.globalAlpha = pa;
      ctx.fillStyle = '#ff3d6e'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + px, y + py); ctx.lineTo(x + px - 12, y + py - 26); ctx.arc(x + px, y + py - 30, 12, PI * 0.8, PI * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      circle(x + px, y + py - 30, 4.5); ctx.fillStyle = '#fff'; ctx.fill();
      if (o.pinLabel) text('Pakistan', x + px, y + py - 58, 22, '#fff', { stroke: '#c2185b', sw: 5 });
      ctx.globalAlpha = 1;
    }
  }
  if (o.face) cuteFace(x, y + r * 0.1, r, o.t || 0);
  ctx.restore();
}

function moonBody(x, y, r, o = {}) {
  if (!(r > 0.5)) return;
  ctx.save();
  if (o.glow !== false) glow(x, y, r * 1.6, '#fffbe0', 0.3);
  circle(x, y, r);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#fbfbf2'); g.addColorStop(1, '#b9b6ad'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); circle(x, y, r); ctx.clip();
  [[-.35, -.3, .22], [.3, -.1, .16], [-.1, .35, .19], [.4, .4, .12], [.05, -.55, .1], [-.55, .15, .1], [.15, .05, .08]].forEach(([a, b, c], i) => {
    circle(x + a * r, y + b * r, c * r); ctx.fillStyle = 'rgba(140,135,125,0.55)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = r * 0.02; ctx.beginPath(); ctx.arc(x + a * r, y + b * r, c * r, PI * 0.9, PI * 1.6); ctx.stroke();
  });
  ctx.restore();
  if (o.phase !== undefined) phaseShadow(x, y, r, o.phase);
  if (o.face) cuteFace(x, y + r * 0.05, r, o.t || 0);
  ctx.restore();
}
function phaseShadow(x, y, r, p) { // p: 0 new, 0.5 full, 1 new (lit from right while waxing)
  ctx.save(); ctx.fillStyle = 'rgba(20,18,50,0.93)';
  const k = Math.cos(p * TAU); // 1 new -> -1 full
  ctx.beginPath();
  if (p <= 0.5) { // waxing: lit on right, shadow on left
    ctx.arc(x, y, r + 0.5, PI / 2, PI * 1.5); ctx.ellipse(x, y, Math.abs(k) * r, r + 0.5, 0, -PI / 2, PI / 2, k < 0);
  } else {
    ctx.arc(x, y, r + 0.5, -PI / 2, PI / 2); ctx.ellipse(x, y, Math.abs(k) * r, r + 0.5, 0, PI / 2, PI * 1.5, k < 0);
  }
  ctx.fill(); ctx.restore();
}

function rocket(x, y, s, t, o = {}) {
  withT(x, y, s, o.rot || 0, () => {
    if (o.flame) {
      const f = o.flame, fl = 1 + 0.15 * Math.sin(t * 40) + 0.1 * Math.sin(t * 23);
      glow(0, 120, 90 * f, '#ff9f1c', 0.6);
      ctx.fillStyle = '#ff6b35'; ctx.beginPath(); ctx.moveTo(-26, 85); ctx.quadraticCurveTo(0, 85 + 150 * f * fl, 26, 85); ctx.fill();
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-15, 85); ctx.quadraticCurveTo(0, 85 + 95 * f * fl, 15, 85); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-7, 85); ctx.quadraticCurveTo(0, 85 + 45 * f * fl, 7, 85); ctx.fill();
    }
    ctx.lineJoin = 'round';
    // fins
    ctx.fillStyle = '#e63946';
    ctx.beginPath(); ctx.moveTo(-34, 30); ctx.quadraticCurveTo(-75, 60, -70, 100); ctx.lineTo(-30, 75); ctx.fill();
    ctx.beginPath(); ctx.moveTo(34, 30); ctx.quadraticCurveTo(75, 60, 70, 100); ctx.lineTo(30, 75); ctx.fill();
    // nozzle
    ctx.fillStyle = '#5c677d'; rrect(-24, 70, 48, 22, 6); ctx.fill();
    // body
    ctx.beginPath(); ctx.moveTo(0, -130); ctx.bezierCurveTo(55, -80, 45, 40, 34, 78); ctx.lineTo(-34, 78); ctx.bezierCurveTo(-45, 40, -55, -80, 0, -130);
    const g = ctx.createLinearGradient(-45, 0, 45, 0); g.addColorStop(0, '#dfe7f5'); g.addColorStop(0.4, '#ffffff'); g.addColorStop(1, '#b8c4dc');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 4; ctx.stroke();
    // nose
    ctx.save(); ctx.clip(); ctx.fillStyle = '#e63946'; ctx.fillRect(-60, -140, 120, 55); ctx.fillStyle = '#457b9d'; ctx.fillRect(-60, 40, 120, 10); ctx.restore();
    // window
    circle(0, -30, 22); ctx.fillStyle = '#7d8bb0'; ctx.fill(); circle(0, -30, 16); const wg = ctx.createRadialGradient(-5, -36, 2, 0, -30, 16); wg.addColorStop(0, '#bfefff'); wg.addColorStop(1, '#2a7bd6'); ctx.fillStyle = wg; ctx.fill();
    if (o.pilot) { ctx.save(); circle(0, -30, 15); ctx.clip(); twinkle(0, -26, 0.17, t, { bob: 0 }); ctx.restore(); }
    ctx.fillStyle = '#e63946'; rrect(-6, 40, 12, 38, 4); ctx.fill();
  });
}
function smoke(x, y, t, k = 1) {
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const a = hash(i) * PI + PI * 0.0, sp = 40 + hash(i + 3) * 160;
    const life = ((t * 0.8 + hash(i + 9)) % 1);
    const px = x + Math.cos(a) * sp * life * 1.6 * (hash(i + 5) > 0.5 ? 1 : -1), py = y + life * 30 - Math.sin(a) * 10;
    ctx.globalAlpha = (1 - life) * 0.7 * k; ctx.fillStyle = '#eef2f8';
    circle(px, py, 25 + life * 50); ctx.fill();
  }
  ctx.restore();
}
function shuttle(x, y, s, t, o = {}) {
  withT(x, y, s, o.rot || 0, () => {
    if (o.hot) { glow(-10, 0, 170, '#ff5a1f', 0.6 * o.hot); }
    if (o.flame) { const fl = 1 + 0.15 * Math.sin(t * 40); ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.moveTo(-150, -12); ctx.quadraticCurveTo(-150 - 120 * o.flame * fl, 0, -150, 12); ctx.fill(); }
    ctx.lineJoin = 'round';
    // wing
    ctx.fillStyle = '#e9edf5'; ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-60, 10); ctx.lineTo(20, 10); ctx.lineTo(-120, 70); ctx.lineTo(-140, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
    // tail fin
    ctx.beginPath(); ctx.moveTo(-110, -20); ctx.lineTo(-150, -80); ctx.lineTo(-130, -80); ctx.lineTo(-80, -20); ctx.closePath(); ctx.fill(); ctx.stroke();
    // body
    ctx.beginPath(); ctx.moveTo(-150, -22); ctx.lineTo(90, -22); ctx.quadraticCurveTo(160, -18, 165, 8); ctx.quadraticCurveTo(160, 22, 90, 22); ctx.lineTo(-150, 22); ctx.closePath();
    ctx.fillStyle = '#fbfcff'; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#20243a'; ctx.fillRect(120, -30, 60, 60); ctx.fillRect(-150, 10, 320, 14); ctx.restore();
    ctx.fillStyle = '#20243a'; rrect(85, -16, 24, 10, 3); ctx.fill();
    ctx.fillStyle = o.hot ? `rgba(255,120,40,${o.hot * 0.6})` : 'transparent'; ctx.fillRect(100, -22, 70, 44);
  });
}
function rover(x, y, s, t, o = {}) {
  withT(x, y, s, 0, () => {
    const sp = t * (o.speed ?? 3);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-70, 30); ctx.lineTo(-90, 55); ctx.moveTo(0, 30); ctx.lineTo(0, 55); ctx.moveTo(70, 30); ctx.lineTo(90, 55); ctx.stroke();
    [-90, 0, 90].forEach(wx => { circle(wx, 60, 22); ctx.fillStyle = '#3d405b'; ctx.fill(); withT(wx, 60, 1, sp, () => { ctx.strokeStyle = '#a0a8c0'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.rotate(PI / 3); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); } }); });
    rrect(-95, -10, 190, 45, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill(); ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#2a4fd6'; rrect(-85, -30, 110, 20, 4); ctx.fill(); ctx.strokeStyle = '#9fc2ff'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-85 + i * 18, -30); ctx.lineTo(-85 + i * 18, -10); ctx.stroke(); }
    ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(60, -10); ctx.lineTo(60, -70); ctx.stroke();
    rrect(40, -95, 46, 28, 8); ctx.fillStyle = '#f4f6fb'; ctx.fill(); ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 4; ctx.stroke();
    circle(74, -81, 8); ctx.fillStyle = '#20243a'; ctx.fill(); circle(76, -83, 3); ctx.fillStyle = '#7fd3ff'; ctx.fill();
  });
}
function satellite(x, y, s, t, o = {}) {
  withT(x, y, s, o.rot ?? Math.sin(t) * 0.1, () => {
    ctx.lineJoin = 'round';
    [-1, 1].forEach(sd => {
      ctx.strokeStyle = '#9aa6c4'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sd * 30, 0); ctx.lineTo(sd * 55, 0); ctx.stroke();
      rrect(sd > 0 ? 55 : -175, -32, 120, 64, 6); const g = ctx.createLinearGradient(0, -32, 0, 32); g.addColorStop(0, '#3a6df0'); g.addColorStop(1, '#1c3a9e'); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = '#a9c4ff'; ctx.lineWidth = 2; for (let i = 1; i < 6; i++) { const bx = (sd > 0 ? 55 : -175) + i * 20; ctx.beginPath(); ctx.moveTo(bx, -32); ctx.lineTo(bx, 32); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(sd > 0 ? 55 : -175, 0); ctx.lineTo(sd > 0 ? 175 : -55, 0); ctx.stroke();
    });
    rrect(-32, -38, 64, 76, 10); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = '#c99a00'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#e8edf7'; ctx.beginPath(); ctx.ellipse(0, 52, 30, 12, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9aa6c4'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 38); ctx.lineTo(0, 62); ctx.stroke();
  });
}
function signalWaves(x0, y0, x1, y1, t, a = 1) {
  ctx.save(); ctx.strokeStyle = '#7dffb3'; ctx.lineCap = 'round';
  const ang = Math.atan2(y1 - y0, x1 - x0), d = Math.hypot(x1 - x0, y1 - y0);
  for (let i = 0; i < 5; i++) {
    const p = ((t * 0.7 + i / 5) % 1);
    ctx.globalAlpha = a * Math.sin(p * PI); ctx.lineWidth = 5;
    const cx = x0 + Math.cos(ang) * d * p, cy = y0 + Math.sin(ang) * d * p;
    ctx.beginPath(); ctx.arc(cx, cy, 18 + p * 30, ang - 0.6, ang + 0.6); ctx.stroke();
  }
  ctx.restore();
}
function comet(x, y, r, ang, len, t, o = {}) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 2; k++) {
    const a2 = ang + (k ? 0.18 : 0), L = len * (k ? 0.7 : 1);
    const g = ctx.createLinearGradient(x, y, x + Math.cos(a2) * L, y + Math.sin(a2) * L);
    g.addColorStop(0, k ? 'rgba(160,220,255,0.8)' : 'rgba(255,255,220,0.9)'); g.addColorStop(1, 'rgba(120,180,255,0)');
    ctx.fillStyle = g; ctx.beginPath();
    const px = Math.cos(a2 + PI / 2), py = Math.sin(a2 + PI / 2), w = r * (1.2 + len / 300);
    ctx.moveTo(x + px * r, y + py * r); ctx.lineTo(x + Math.cos(a2) * L + px * w * 2.4, y + Math.sin(a2) * L + py * w * 2.4);
    ctx.lineTo(x + Math.cos(a2) * L - px * w * 2.4, y + Math.sin(a2) * L - py * w * 2.4); ctx.lineTo(x - px * r, y - py * r); ctx.fill();
  }
  glow(x, y, r * 4 * (o.coma ?? 1), '#cfefff', 0.8);
  ctx.globalCompositeOperation = 'source-over';
  circle(x, y, r); ctx.fillStyle = '#e8f6ff'; ctx.fill();
  if (o.face) cuteFace(x, y, r, t);
  ctx.restore();
}
function asteroid(x, y, r, t, seed = 1) {
  withT(x, y, 1, t * 0.4, () => {
    ctx.beginPath();
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, rr = r * (0.78 + 0.3 * hash(i + seed * 20)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r * 1.1); g.addColorStop(0, '#b9a99a'); g.addColorStop(1, '#5e5047'); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(60,50,40,0.45)'; [[-.3, -.2, .2], [.3, .25, .16], [.1, -.4, .1]].forEach(([a, b, c]) => { circle(a * r, b * r, c * r); ctx.fill(); });
  });
}
function galaxy(x, y, R, t, a = 1, o = {}) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  glow(x, y, R * 0.5, '#fff1c9', 0.9); glow(x, y, R * 1.1, '#9b6bff', 0.25);
  const tilt = o.tilt ?? 0.55, rot = t * 0.05 + (o.rot || 0);
  for (let i = 0; i < 700; i++) {
    const arm = i % 2, d = Math.pow(hash(i), 0.7), th = d * 7 + arm * PI + rot + (hash(i + 3) - 0.5) * 0.6;
    const px = Math.cos(th) * d * R, py = Math.sin(th) * d * R * tilt;
    const c = d < 0.25 ? '255,240,200' : (hash(i + 8) > 0.5 ? '170,200,255' : '230,170,255');
    ctx.fillStyle = `rgba(${c},${0.25 + 0.6 * hash(i + 11)})`;
    circle(x + px, y + py, (0.6 + hash(i + 5) * 1.8) * R / 300 + 0.4); ctx.fill();
  }
  ctx.restore();
}
function telescope(x, y, s, o = {}) {
  withT(x, y, s, 0, () => {
    ctx.strokeStyle = '#5a4632'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-45, 110); ctx.moveTo(0, 0); ctx.lineTo(45, 110); ctx.moveTo(0, 0); ctx.lineTo(0, 115); ctx.stroke();
    withT(0, 0, 1, o.ang ?? -0.6, () => {
      rrect(-70, -18, 160, 36, 10); const g = ctx.createLinearGradient(0, -18, 0, 18); g.addColorStop(0, '#5f8bff'); g.addColorStop(1, '#2a4fd6'); ctx.fillStyle = g; ctx.fill();
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(60, -22, 16, 44); ctx.fillRect(-20, -19, 10, 38);
      rrect(-95, -10, 30, 20, 5); ctx.fillStyle = '#20243a'; ctx.fill();
    });
    circle(0, 0, 9); ctx.fillStyle = '#20243a'; ctx.fill();
  });
}
function ufo(x, y, s, t, o = {}) {
  withT(x, y + Math.sin(t * 2) * 10, s, Math.sin(t * 1.4) * 0.08, () => {
    if (o.beam) { ctx.fillStyle = 'rgba(160,255,190,0.25)'; ctx.beginPath(); ctx.moveTo(-40, 20); ctx.lineTo(40, 20); ctx.lineTo(110, 250); ctx.lineTo(-110, 250); ctx.fill(); }
    // alien in dome
    ctx.save(); ctx.beginPath(); ctx.arc(0, -10, 58, PI, TAU); ctx.closePath(); ctx.clip();
    ctx.fillStyle = 'rgba(190,240,255,0.35)'; ctx.fillRect(-60, -70, 120, 62);
    // alien
    ctx.fillStyle = '#7ee05a'; circle(0, -22, 30); ctx.fill();
    ctx.strokeStyle = '#7ee05a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-12, -48); ctx.lineTo(-20, -64); ctx.moveTo(12, -48); ctx.lineTo(20, -64); ctx.stroke();
    ctx.fillStyle = '#ff5dad'; circle(-20, -64, 6); ctx.fill(); circle(20, -64, 6); ctx.fill();
    const blink = (t % 3) < 0.12 ? 0.2 : 1;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -28, 13, 13 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1d120c'; circle(2, -27, 6 * blink); ctx.fill();
    ctx.strokeStyle = '#1d120c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -14, 9, 0.2 * PI, 0.8 * PI); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -10, 58, PI * 1.15, PI * 1.4); ctx.stroke();
    // saucer
    ctx.beginPath(); ctx.ellipse(0, 0, 120, 32, 0, 0, TAU); const g = ctx.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#c9d3ea'); g.addColorStop(1, '#6b7aa6'); ctx.fillStyle = g; ctx.fill();
    for (let i = 0; i < 7; i++) { const lx = -90 + i * 30; circle(lx, 6, 7); ctx.fillStyle = ['#ffd23f', '#ff5d5d', '#3ddc84'][(i + Math.floor(t * 4)) % 3]; ctx.fill(); }
  });
}
function badge(n, x, y, r, t, o = {}) {
  const cols = [['#ff7b54', '#ffb26b'], ['#4d96ff', '#6bcBff'], ['#9b5de5', '#c77dff'], ['#00bb77', '#5ae6a6']][n - 1];
  withT(x, y, 1, o.rot || 0, () => {
    // ribbon
    ctx.fillStyle = cols[0]; ctx.beginPath(); ctx.moveTo(-r * 0.5, r * 0.5); ctx.lineTo(-r * 0.75, r * 1.45); ctx.lineTo(-r * 0.35, r * 1.2); ctx.lineTo(-r * 0.1, r * 1.5); ctx.lineTo(0, r * 0.6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r * 0.5, r * 0.5); ctx.lineTo(r * 0.75, r * 1.45); ctx.lineTo(r * 0.35, r * 1.2); ctx.lineTo(r * 0.1, r * 1.5); ctx.lineTo(0, r * 0.6); ctx.fill();
    // scalloped edge
    ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, rr = i % 2 ? r : r * 1.1; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
    ctx.fillStyle = '#ffd23f'; ctx.fill();
    circle(0, 0, r * 0.86); const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r); g.addColorStop(0, cols[1]); g.addColorStop(1, cols[0]); ctx.fillStyle = g; ctx.fill();
    // icon
    const ir = r * 0.45;
    if (n === 1) { sun(0, 0, ir * 0.55, t, { face: false }); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, ir * 1.3, ir * 0.6, 0, 0, TAU); ctx.stroke(); circle(ir * 1.3, 0, ir * 0.18); ctx.fillStyle = '#5bc0ff'; ctx.fill(); }
    if (n === 2) { earthGlobe(-ir * 0.25, ir * 0.1, ir * 0.7, t * 0.3, { glow: false, clouds: false }); moonBody(ir * 0.65, -ir * 0.55, ir * 0.3, { glow: false }); sparkle(-ir * 0.8, -ir * 0.7, ir * 0.3); }
    if (n === 3) { zoe(0, ir * 0.55, ir * 0.0075, t, {}); }
    if (n === 4) { telescope(-ir * 0.1, -ir * 0.1, ir * 0.007, { ang: -0.7 }); sparkle(ir * 0.7, -ir * 0.7, ir * 0.35); sparkle(ir * 0.2, -ir * 0.9, ir * 0.2); }
    text(String(n), 0, r * 0.62, r * 0.32, '#fff', { stroke: cols[0], sw: 5 });
  });
}
function stamp(x, y, s, a) {
  if (a <= 0) return;
  withT(x, y, s * (1 + (1 - a) * 1.5), -0.25, () => {
    ctx.globalAlpha = a;
    rrect(-110, -32, 220, 64, 12); ctx.lineWidth = 7; ctx.strokeStyle = '#e63946'; ctx.stroke();
    text('COMPLETE!', 0, 2, 40, '#e63946', { shadow: false, w: 700 });
    ctx.globalAlpha = 1;
  });
}
function thumb(x, y, s, up, col) {
  withT(x, y, s * (up ? 1 : -1), 0, () => {
    ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-40, -5); ctx.lineTo(-10, -5); ctx.lineTo(-2, -45); ctx.quadraticCurveTo(10, -70, 22, -55); ctx.lineTo(16, -10);
    ctx.lineTo(45, -10); ctx.quadraticCurveTo(60, -8, 56, 8); ctx.lineTo(48, 50); ctx.quadraticCurveTo(44, 62, 30, 62); ctx.lineTo(-10, 62); ctx.lineTo(-10, 60); ctx.lineTo(-40, 60); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -5); ctx.lineTo(-10, 60); ctx.stroke();
  });
}
function house(x, y, s, o = {}) {
  withT(x, y, s, 0, () => {
    ctx.fillStyle = o.wall || '#ffd6a5'; ctx.fillRect(-60, -50, 120, 100);
    ctx.fillStyle = o.roof || '#e76f51'; ctx.beginPath(); ctx.moveTo(-75, -50); ctx.lineTo(0, -110); ctx.lineTo(75, -50); ctx.fill();
    ctx.fillStyle = '#8d5a3b'; rrect(-15, 5, 30, 45, 4); ctx.fill();
    ctx.fillStyle = o.lit ? '#ffe066' : '#9bd7ff'; ctx.fillRect(-48, -30, 26, 24); ctx.fillRect(22, -30, 26, 24);
  });
}
function tree(x, y, s) {
  withT(x, y, s, 0, () => {
    ctx.fillStyle = '#8d5a3b'; rrect(-10, -10, 20, 70, 6); ctx.fill();
    ctx.fillStyle = '#2fae66'; circle(0, -40, 45); ctx.fill(); circle(-30, -15, 32); ctx.fill(); circle(30, -15, 32); ctx.fill();
    ctx.fillStyle = '#4fd286'; circle(-10, -55, 20); ctx.fill();
  });
}
function confetti(x, y, t0, t, n = 70) {
  const dt = t - t0; if (dt < 0 || dt > 2.4) return;
  const cols = ['#ff5d8f', '#ffd23f', '#3ddc84', '#4d96ff', '#c77dff', '#ff9f1c'];
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = -PI / 2 + (hash(i) - 0.5) * 2.6, sp = 380 + hash(i + 7) * 520;
    const px = x + Math.cos(a) * sp * dt, py = y + Math.sin(a) * sp * dt + 520 * dt * dt;
    ctx.globalAlpha = clamp(2.4 - dt);
    withT(px, py, 1, dt * 8 * (hash(i + 3) - 0.5) * 3, () => {
      ctx.fillStyle = cols[i % cols.length];
      if (i % 3 === 0) { starPath(0, 0, 9, 4); ctx.fill(); } else ctx.fillRect(-6, -3, 12, 6);
    });
  }
  ctx.restore();
}
function questionMark(x, y, s, t) {
  withT(x, y + Math.sin(t * 3) * 5, s, Math.sin(t * 2) * 0.1, () => text('?', 0, 0, 120, '#ffd23f', { stroke: '#7b2cbf', sw: 14, w: 700 }));
}
function arrowDown(x, y, s, t, col = '#ff5d8f') {
  withT(x, y + Math.sin(t * 6) * 10, s, 0, () => {
    ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-14, -50); ctx.lineTo(14, -50); ctx.lineTo(14, -10); ctx.lineTo(32, -10); ctx.lineTo(0, 25); ctx.lineTo(-32, -10); ctx.lineTo(-14, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
}
function label(str, x, y, size = 30, bg = '#7b2cbf', a = 1, fg = '#fff') {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = font(size, 600); const w = ctx.measureText(str).width + size * 1.1, h = size * 1.55;
  withT(x, y, 0.6 + 0.4 * eBack(a), 0, () => {
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    rrect(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
    text(str, 0, 2, size, fg, { shadow: false });
  });
  ctx.restore();
}
function card(x, y, w, h, col = '#ffffff', a = 1, o = {}) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  rrect(x - w / 2, y - h / 2, w, h, o.r || 26); ctx.fillStyle = col; ctx.fill();
  ctx.shadowColor = 'transparent';
  if (o.border) { ctx.lineWidth = o.bw || 6; ctx.strokeStyle = o.border; ctx.stroke(); }
  ctx.restore();
}
