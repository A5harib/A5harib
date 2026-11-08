// ---------- icons for quizzes, word game and portraits ----------
function portrait(who, x, y, s, t) {
  withT(x, y, s, 0, () => {
    const skin = '#f1c7a1';
    if (who === 'galileo') {
      rrect(-75, 40, 150, 90, 40); ctx.fillStyle = '#3d2b56'; ctx.fill();
      ctx.fillStyle = '#f4f1e6'; ctx.beginPath(); ctx.ellipse(0, 42, 48, 14, 0, 0, TAU); ctx.fill();
      circle(0, -10, 50); ctx.fillStyle = skin; ctx.fill();
      ctx.fillStyle = '#8b7d6b'; ctx.beginPath(); ctx.moveTo(-42, 5); ctx.quadraticCurveTo(-40, 70, 0, 72); ctx.quadraticCurveTo(40, 70, 42, 5); ctx.quadraticCurveTo(20, 22, 0, 20); ctx.quadraticCurveTo(-20, 22, -42, 5); ctx.fill();
      ctx.fillStyle = '#9b8c78'; circle(-48, -15, 14); ctx.fill(); circle(48, -15, 14); ctx.fill();
      ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 12, 12, 6, 0, 0, PI); ctx.fill();
    } else if (who === 'newton') {
      rrect(-75, 40, 150, 90, 40); ctx.fillStyle = '#7a3e1d'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-18, 38); ctx.lineTo(18, 38); ctx.lineTo(0, 80); ctx.fill();
      ctx.fillStyle = '#eceae4'; for (let i = 0; i < 14; i++) { const a = PI * 0.95 + i / 13 * PI * 1.1; circle(Math.cos(a) * 56, -12 + Math.sin(a) * 52 + (i % 2) * 4, 20); ctx.fill(); }
      for (let i = 0; i < 4; i++) { circle(-58, 10 + i * 18, 18); ctx.fill(); circle(58, 10 + i * 18, 18); ctx.fill(); }
      circle(0, -6, 46); ctx.fillStyle = skin; ctx.fill();
    } else if (who === 'hubble') {
      rrect(-75, 40, 150, 90, 40); ctx.fillStyle = '#2f3e5c'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-22, 36); ctx.lineTo(22, 36); ctx.lineTo(0, 70); ctx.fill();
      ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(-6, 42); ctx.lineTo(6, 42); ctx.lineTo(9, 80); ctx.lineTo(0, 90); ctx.lineTo(-9, 80); ctx.fill();
      circle(0, -8, 48); ctx.fillStyle = skin; ctx.fill();
      ctx.fillStyle = '#4a3222'; ctx.beginPath(); ctx.arc(0, -16, 50, PI * 1.02, PI * 1.98); ctx.quadraticCurveTo(10, -50, -30, -30); ctx.closePath(); ctx.fill();
    }
    // face (common)
    const blink = ((t + s) % 4.4) < 0.12 ? 0.15 : 1;
    const ey = who === 'galileo' ? -18 : -14;
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(-16, ey, 5, 7 * blink, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(16, ey, 5, 7 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,120,0.35)'; circle(-26, ey + 16, 7); ctx.fill(); circle(26, ey + 16, 7); ctx.fill();
    if (who !== 'galileo') { ctx.strokeStyle = '#7a3a2a'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, ey + 14, 10, 0.2 * PI, 0.8 * PI); ctx.stroke(); }
  });
}
function frame(x, y, w, h, col = '#c9973b') {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  rrect(x - w / 2, y - h / 2, w, h, 20); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  rrect(x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 12); const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#bfe6ff'); g.addColorStop(1, '#e9dcff'); ctx.fillStyle = g; ctx.fill();
}
function hubbleScope(x, y, s, t) {
  withT(x, y, s, -0.3 + Math.sin(t * 0.8) * 0.05, () => {
    [-1, 1].forEach(sd => { rrect(-30, sd > 0 ? 40 : -100, 60, 60, 4); ctx.fillStyle = '#2a4fd6'; ctx.fill(); ctx.strokeStyle = '#9fc2ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, sd > 0 ? 40 : -40); ctx.lineTo(0, sd > 0 ? 25 : -25); ctx.strokeStyle = '#999'; ctx.lineWidth = 4; ctx.stroke(); });
    rrect(-110, -26, 200, 52, 14); const g = ctx.createLinearGradient(0, -26, 0, 26); g.addColorStop(0, '#f2f4f8'); g.addColorStop(0.5, '#c7cedb'); g.addColorStop(1, '#8f9bb3'); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = '#20243a'; ctx.beginPath(); ctx.ellipse(90, 0, 10, 26, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d9dee8'; ctx.beginPath(); ctx.moveTo(90, -26); ctx.lineTo(130, -46); ctx.lineTo(132, -40); ctx.lineTo(96, -20); ctx.fill();
    ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 2; [-60, -10, 40].forEach(bx => { ctx.beginPath(); ctx.moveTo(bx, -26); ctx.lineTo(bx, 26); ctx.stroke(); });
  });
}
function apple(x, y, r) {
  circle(x - r * 0.35, y, r * 0.75); ctx.fillStyle = '#e63946'; ctx.fill(); circle(x + r * 0.35, y, r * 0.75); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; circle(x - r * 0.45, y - r * 0.3, r * 0.2); ctx.fill();
  ctx.strokeStyle = '#6b3e1d'; ctx.lineWidth = r * 0.15; ctx.beginPath(); ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x + r * 0.1, y - r * 1.05); ctx.stroke();
  ctx.fillStyle = '#3ddc84'; ctx.beginPath(); ctx.ellipse(x + r * 0.35, y - r * 0.9, r * 0.32, r * 0.14, -0.5, 0, TAU); ctx.fill();
}
function astronautGeneric(x, y, s, t, o = {}) { zoe(x, y, s, t, Object.assign({ visor: 1 }, o)); }

function icon(name, x, y, r, t) {
  ctx.save();
  switch (name) {
    case 'moon': case 'moonicon': moonBody(x, y, r * 0.75, { glow: false }); break;
    case 'sun': case 'sunicon': sun(x, y, r * 0.6, t, { face: name === 'sun' }); break;
    case 'earth': earthGlobe(x, y, r * 0.75, t * 0.3, { glow: false }); break;
    case 'galaxy': circle(x, y, r * 0.8); ctx.fillStyle = '#1a1550'; ctx.fill(); galaxy(x, y, r * 0.75, t, 1); break;
    case 'choc': withT(x, y, 1, -0.2, () => { rrect(-r * 0.7, -r * 0.45, r * 1.4, r * 0.9, 8); ctx.fillStyle = '#6b3e1d'; ctx.fill(); ctx.strokeStyle = '#4a2a12'; ctx.lineWidth = 3; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.7 + i * r * 0.35, -r * 0.45); ctx.lineTo(-r * 0.7 + i * r * 0.35, r * 0.45); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.lineTo(r * 0.7, 0); ctx.stroke(); }); break;
    case 'rainbow': ['#ff5d5d', '#ff9f1c', '#ffd23f', '#3ddc84', '#4d96ff', '#9b5de5'].forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.arc(x, y + r * 0.35, r * (0.8 - i * 0.1), PI, TAU); ctx.stroke(); }); break;
    case 'n5': case 'n8': case 'n10': {
      const n = +name.slice(1);
      for (let i = 0; i < n; i++) { const a = i / n * TAU - PI / 2; circle(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.13); ctx.fillStyle = ['#ff7b54', '#4d96ff', '#3ddc84', '#ffd23f', '#c77dff'][i % 5]; ctx.fill(); }
      text(String(n), x, y + 2, r * 0.7, '#fff', { stroke: '#7b2cbf', sw: 8, w: 700 }); break;
    }
    case 'umbrella': ctx.fillStyle = '#ff5d8f'; ctx.beginPath(); ctx.arc(x, y, r * 0.7, PI, TAU); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + r * 0.6); ctx.arc(x - r * 0.12, y + r * 0.6, r * 0.12, 0, PI); ctx.stroke(); break;
    case 'pack': rrect(x - r * 0.45, y - r * 0.6, r * 0.9, r * 1.2, 14); ctx.fillStyle = '#cfd6e6'; ctx.fill(); ctx.strokeStyle = '#7d8bb0'; ctx.lineWidth = 4; ctx.stroke(); rrect(x - r * 0.3, y - r * 0.4, r * 0.6, r * 0.3, 6); ctx.fillStyle = '#4d96ff'; ctx.fill(); text('O₂', x, y + r * 0.2, r * 0.35, '#2a4fd6', { shadow: false, w: 700 }); break;
    case 'balloon': ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + r * 0.3); ctx.quadraticCurveTo(x + 10, y + r * 0.6, x, y + r * 0.85); ctx.stroke(); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(x, y - r * 0.15, r * 0.42, r * 0.5, 0, 0, TAU); ctx.fill(); break;
    case 'juice': rrect(x - r * 0.35, y - r * 0.5, r * 0.7, r * 1.0, 8); ctx.fillStyle = '#ff9f1c'; ctx.fill(); ctx.fillStyle = '#fff'; rrect(x - r * 0.25, y - r * 0.2, r * 0.5, r * 0.35, 5); ctx.fill(); circle(x, y - r * 0.02, r * 0.12); ctx.fillStyle = '#ff9f1c'; ctx.fill(); ctx.strokeStyle = '#3ddc84'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + r * 0.15, y - r * 0.5); ctx.lineTo(x + r * 0.3, y - r * 0.85); ctx.stroke(); break;
    case 'sand': ctx.fillStyle = '#f4c27a'; ctx.beginPath(); ctx.moveTo(x - r * 0.75, y + r * 0.45); ctx.quadraticCurveTo(x, y - r * 0.7, x + r * 0.75, y + r * 0.45); ctx.fill(); ctx.fillStyle = '#d9a35a'; for (let i = 0; i < 12; i++) { circle(x + (hash(i) - 0.5) * r, y + r * 0.2 + (hash(i + 4) - 0.5) * r * 0.4, 2.5); ctx.fill(); } break;
    case 'star': starPath(x, y, r * 0.7, r * 0.33); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeStyle = '#ffb703'; ctx.stroke(); break;
    case 'stars': [[-.35, -.25, .4], [.35, -.1, .3], [-.05, .35, .28]].forEach(([a, b, c]) => { starPath(x + a * r, y + b * r, c * r, c * r * 0.45); ctx.fillStyle = '#ffd23f'; ctx.fill(); }); break;
    case 'asteroid': asteroid(x, y, r * 0.6, t, 3); break;
    case 'shuttle': shuttle(x, y, r * 0.0042, t, { rot: -0.2 }); break;
    case 'planet': planet('saturn', x, y, r * 0.38, t); break;
    case 'astronaut': astronautGeneric(x, y + r * 0.2, r * 0.0042, t, {}); break;
    case 'armstrong': astronautGeneric(x, y + r * 0.2, r * 0.0042, t, {}); break;
    case 'rover': rover(x, y, r * 0.0055, t); break;
    case 'rocket': rocket(x, y, r * 0.0055, t, { rot: 0.4 }); break;
    case 'telescope': telescope(x, y - r * 0.15, r * 0.0055, {}); break;
    case 'satellite': satellite(x, y - r * 0.05, r * 0.0036, t); break;
    case 'comet': if (r < 120) { circle(x, y, r * 0.8); ctx.fillStyle = '#1a1550'; ctx.fill(); } comet(x + r * 0.35, y - r * 0.3, r * 0.14, PI * 0.78, r * 1.2, t); break;
    case 'galileo': case 'newton': portrait(name, x, y + r * 0.05, r * 0.0068, t); break;
    default:
      if (PLANETS[name]) planet(name, x, y, r * (name === 'saturn' ? 0.36 : 0.6), t);
  }
  ctx.restore();
}
