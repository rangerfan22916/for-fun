// renderer.js — All canvas drawing functions
// Depends on: globals W, H set by main.js

// ─── BACKGROUND SCENES ──────────────────────────────────────────────

function drawSpaceBg(ctx) {
  ctx.fillStyle = '#00000e';
  ctx.fillRect(0, 0, W, H);
  for (const n of nebulae) {
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    g.addColorStop(0, `hsla(${n.h},60%,40%,${n.a})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
  }
}

function drawPadBg(ctx) {
  ctx.fillStyle = '#000008';
  ctx.fillRect(0, 0, W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sky.addColorStop(0, '#000008');
  sky.addColorStop(0.5, '#050814');
  sky.addColorStop(1, '#0a1018');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.65);
  const gnd = ctx.createLinearGradient(0, H * 0.65, 0, H);
  gnd.addColorStop(0, '#0a1008');
  gnd.addColorStop(1, '#182410');
  ctx.fillStyle = gnd;
  ctx.fillRect(0, H * 0.65, W, H * 0.35);
}

// ─── STARS ──────────────────────────────────────────────────────────

function drawStars(ctx, shake = 0) {
  for (const s of stars) {
    s.t += s.sp;
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.t));
    ctx.beginPath();
    ctx.arc(s.x + (shake * (Math.random() - 0.5) * 0.3), s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210,220,255,${a})`;
    ctx.fill();
  }
}

function drawFlyStars(ctx, speed = 1) {
  for (const s of flyStars) {
    const trail = s.speed * speed * 5;
    const alpha = Math.min(1, s.speed * speed / 10) * (0.5 + s.bright * 0.5);
    ctx.strokeStyle = `rgba(200,215,255,${alpha})`;
    ctx.lineWidth = s.speed * speed > 8 ? 1.5 : 0.7;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x, s.y - trail);
    ctx.stroke();
    s.y += s.speed * speed;
    if (s.y > H + trail) { s.y = -5; s.x = Math.random() * W; }
  }
}

// ─── LAUNCH PAD ─────────────────────────────────────────────────────

function drawLaunchPad(ctx, shake = 0) {
  const cx = W / 2 + shake;
  const gY = H - Math.round(H * 0.1);

  ctx.fillStyle = '#181810';
  ctx.fillRect(0, gY, W, H - gY);
  ctx.fillStyle = '#222218';
  ctx.fillRect(0, gY, W, 6);

  // Concrete apron
  ctx.fillStyle = '#1e1e16';
  ctx.fillRect(cx - 220, gY - 18, 440, 18);

  // Flame trench
  ctx.fillStyle = '#0a0a06';
  ctx.fillRect(cx - 70, gY - 14, 140, 14);
  ctx.fillStyle = 'rgba(255,120,0,0.04)';
  ctx.fillRect(cx - 50, gY - 10, 100, 10);

  // Gantry tower
  const gantryH = H * 0.65;
  ctx.strokeStyle = '#2a2820';
  ctx.lineWidth = 4;
  ctx.strokeRect(cx - 165, gantryH, 12, gY - gantryH);
  ctx.strokeRect(cx + 153, gantryH, 12, gY - gantryH);

  for (let y = gantryH; y < gY; y += 55) {
    ctx.beginPath();
    ctx.moveTo(cx - 165, y);
    ctx.lineTo(cx + 165, y);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#222018';
    ctx.beginPath();
    ctx.moveTo(cx - 165, y);
    ctx.lineTo(cx + 165, y + 55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 165, y);
    ctx.lineTo(cx - 165, y + 55);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2a2820';
  }

  // Service arms
  ctx.strokeStyle = '#353525';
  ctx.lineWidth = 5;
  const armY1 = gantryH + (gY - gantryH) * 0.35;
  const armY2 = gantryH + (gY - gantryH) * 0.55;
  ctx.beginPath(); ctx.moveTo(cx - 165, armY1); ctx.lineTo(cx - 42, armY1 + 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 165, armY1); ctx.lineTo(cx + 42, armY1 + 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 165, armY2); ctx.lineTo(cx - 38, armY2 + 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 165, armY2); ctx.lineTo(cx + 38, armY2 + 12); ctx.stroke();

  // Engine glow
  if (engineOn) {
    const lg = ctx.createRadialGradient(cx, gY, 0, cx, gY, 300);
    lg.addColorStop(0, 'rgba(255,150,30,0.12)');
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(cx - 300, gY - 300, 600, 300);
  }
}

// ─── SATURN V ROCKET ────────────────────────────────────────────────

function drawSaturnV(ctx, yOff = 0, shake = 0, thrust = false) {
  const groundY = H - Math.round(H * 0.1);
  const baseY = groundY + yOff;
  const cx = W / 2 + shake;

  // S-IC First Stage engine skirt
  const sk = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
  sk.addColorStop(0, '#222');
  sk.addColorStop(0.5, '#555');
  sk.addColorStop(1, '#222');
  ctx.fillStyle = sk;
  ctx.beginPath();
  ctx.moveTo(cx - 40, baseY);
  ctx.lineTo(cx + 40, baseY);
  ctx.lineTo(cx + 36, baseY - 20);
  ctx.lineTo(cx - 36, baseY - 20);
  ctx.closePath();
  ctx.fill();

  // Fins
  [[-1, 1], [1, -1]].forEach(([dx1, dx2]) => {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(cx + dx1 * 40, baseY - 20);
    ctx.lineTo(cx + dx1 * 54, baseY - 6);
    ctx.lineTo(cx + dx2 * -36, baseY - 20);
    ctx.closePath();
    ctx.fill();
  });

  // S-IC body
  const s1W = 36, s1H = 130;
  const s1g = ctx.createLinearGradient(cx - s1W, 0, cx + s1W, 0);
  s1g.addColorStop(0, '#1a1a1a');
  s1g.addColorStop(0.15, '#444');
  s1g.addColorStop(0.5, '#eee');
  s1g.addColorStop(0.85, '#555');
  s1g.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = s1g;
  ctx.fillRect(cx - s1W, baseY - 20 - s1H, s1W * 2, s1H);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - s1W, baseY - 20 - s1H + 10, s1W * 2, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.font = 'bold 9px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('USA', cx, baseY - 20 - s1H + 50);

  // Interstage 1
  const isY = baseY - 20 - s1H;
  ctx.fillStyle = '#333';
  ctx.fillRect(cx - s1W + 1, isY - 14, s1W * 2 - 2, 14);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(cx - s1W + 1, isY - 4, s1W * 2 - 2, 4);

  // S-II Second Stage
  const s2W = 34, s2H = 80, s2Y = isY - 14;
  const s2g = ctx.createLinearGradient(cx - s2W, 0, cx + s2W, 0);
  s2g.addColorStop(0, '#111');
  s2g.addColorStop(0.1, '#555');
  s2g.addColorStop(0.5, '#f5f5f5');
  s2g.addColorStop(0.9, '#555');
  s2g.addColorStop(1, '#111');
  ctx.fillStyle = s2g;
  ctx.fillRect(cx - s2W, s2Y - s2H, s2W * 2, s2H);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - s2W, s2Y - s2H + 8, s2W * 2, 5);
  ctx.fillStyle = '#cc1111';
  ctx.fillRect(cx - s2W, s2Y - s2H + 18, s2W * 2, 4);
  ctx.fillStyle = '#1122cc';
  ctx.fillRect(cx - s2W, s2Y - s2H + 22, s2W * 2, 4);

  // Interstage 2
  const is2Y = s2Y - s2H;
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(cx - s2W + 1, is2Y - 12, s2W * 2 - 2, 12);

  // S-IVB Third Stage
  const s3W = 30, s3H = 55, s3Y = is2Y - 12;
  const s3g = ctx.createLinearGradient(cx - s3W, 0, cx + s3W, 0);
  s3g.addColorStop(0, '#111');
  s3g.addColorStop(0.1, '#444');
  s3g.addColorStop(0.5, '#ececec');
  s3g.addColorStop(0.9, '#444');
  s3g.addColorStop(1, '#111');
  ctx.fillStyle = s3g;
  ctx.fillRect(cx - s3W, s3Y - s3H, s3W * 2, s3H);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - s3W, s3Y - s3H + 6, s3W * 2, 4);

  // Instrument Unit
  const iuY = s3Y - s3H;
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(cx - s3W, iuY - 10, s3W * 2, 10);
  ctx.fillStyle = 'rgba(80,100,180,0.4)';
  ctx.fillRect(cx - s3W + 2, iuY - 8, s3W * 2 - 4, 6);

  // SLA (tapered adapter)
  const slaY = iuY - 10, slaH = 40, slaWtop = 22, slaWbot = s3W;
  const slag = ctx.createLinearGradient(cx - slaWbot, 0, cx + slaWbot, 0);
  slag.addColorStop(0, '#111');
  slag.addColorStop(0.15, '#555');
  slag.addColorStop(0.5, '#ddd');
  slag.addColorStop(0.85, '#555');
  slag.addColorStop(1, '#111');
  ctx.fillStyle = slag;
  ctx.beginPath();
  ctx.moveTo(cx - slaWbot, slaY);
  ctx.lineTo(cx + slaWbot, slaY);
  ctx.lineTo(cx + slaWtop, slaY - slaH);
  ctx.lineTo(cx - slaWtop, slaY - slaH);
  ctx.closePath();
  ctx.fill();

  // Service Module
  const smY = slaY - slaH, smH = 28, smW = 20;
  const smg = ctx.createLinearGradient(cx - smW, 0, cx + smW, 0);
  smg.addColorStop(0, '#111');
  smg.addColorStop(0.2, '#666');
  smg.addColorStop(0.5, '#ccc');
  smg.addColorStop(0.8, '#666');
  smg.addColorStop(1, '#111');
  ctx.fillStyle = smg;
  ctx.fillRect(cx - smW, smY - smH, smW * 2, smH);
  ctx.fillStyle = 'rgba(200,180,100,0.5)';
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(cx + i * 12 - 4, smY - smH + 4, 7, smH - 8);
  }

  // Command Module
  const cmY = smY - smH, cmH = 22, cmW = 17;
  const cmg = ctx.createLinearGradient(cx - cmW, 0, cx + cmW, 0);
  cmg.addColorStop(0, '#222');
  cmg.addColorStop(0.2, '#888');
  cmg.addColorStop(0.5, '#ddd');
  cmg.addColorStop(0.8, '#888');
  cmg.addColorStop(1, '#222');
  ctx.fillStyle = cmg;
  ctx.beginPath();
  ctx.moveTo(cx - cmW, cmY);
  ctx.lineTo(cx + cmW, cmY);
  ctx.lineTo(cx + cmW - 4, cmY - cmH);
  ctx.lineTo(cx - cmW + 4, cmY - cmH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(100,180,255,0.7)';
  ctx.fillRect(cx - 8, cmY - cmH + 6, 6, 6);
  ctx.fillRect(cx + 2, cmY - cmH + 6, 6, 6);

  // Launch Escape Tower
  const letY = cmY - cmH;
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 4, letY); ctx.lineTo(cx - 3, letY - 55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 4, letY); ctx.lineTo(cx + 3, letY - 55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 3, letY - 55); ctx.lineTo(cx + 3, letY - 55); ctx.stroke();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1.5;
  for (let y = letY; y > letY - 55; y -= 12) {
    ctx.beginPath();
    ctx.moveTo(cx - 3.5, y);
    ctx.lineTo(cx + 3.5, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#cc2222';
  ctx.beginPath();
  ctx.moveTo(cx - 3, letY - 55);
  ctx.lineTo(cx + 3, letY - 55);
  ctx.lineTo(cx + 1.5, letY - 65);
  ctx.lineTo(cx - 1.5, letY - 65);
  ctx.closePath();
  ctx.fill();

  // Thrust flames
  if (thrust) {
    const fb = baseY;
    for (let i = -2; i <= 2; i++) {
      const fx = cx + i * 10;
      const fl = 90 + Math.random() * 70 + padShake * 4;
      const fg = ctx.createLinearGradient(fx, fb, fx, fb + fl);
      fg.addColorStop(0, 'rgba(255,255,200,0.98)');
      fg.addColorStop(0.1, 'rgba(255,220,50,0.95)');
      fg.addColorStop(0.35, 'rgba(255,100,0,0.85)');
      fg.addColorStop(0.65, 'rgba(200,30,0,0.6)');
      fg.addColorStop(1, 'rgba(100,0,0,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.ellipse(fx, fb + fl * 0.4, 5 + Math.random() * 4, fl * 0.6, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Bloom
    const bloom = ctx.createRadialGradient(cx, fb, 0, cx, fb, 80);
    bloom.addColorStop(0, 'rgba(255,200,50,0.15)');
    bloom.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(cx - 80, fb - 10, 160, 90);

    // Smoke particles
    for (const s of smoke) {
      s.x += s.vx;
      s.y += s.vy;
      s.r += 0.5;
      s.a -= 0.006;
      if (s.a <= 0) {
        s.a = 0.2 + Math.random() * 0.25;
        s.y = fb + 10 + Math.random() * 20;
        s.x = cx + (Math.random() - 0.5) * 50;
        s.r = 10 + Math.random() * 10;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160,155,140,${s.a})`;
      ctx.fill();
    }
  }
}

// ─── WARP TUNNEL ────────────────────────────────────────────────────

function drawWarp(ctx) {
  ctx.fillStyle = '#000010';
  ctx.fillRect(0, 0, W, H);
  const vignette = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
  vignette.addColorStop(0, 'rgba(10,20,80,0.5)');
  vignette.addColorStop(1, 'rgba(0,0,20,0)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  for (const l of warpLines) {
    l.len += l.speed * (1 + l.len * 0.007);
    const ex = l.ox + Math.cos(l.angle) * l.len;
    const ey = l.oy + Math.sin(l.angle) * l.len;
    const a = Math.max(0, 1 - l.len / 550);
    ctx.strokeStyle = `rgba(${l.r},${l.g},${l.b},${a})`;
    ctx.lineWidth = l.w;
    ctx.beginPath();
    ctx.moveTo(l.ox, l.oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
}

// ─── PLANET RENDERING ───────────────────────────────────────────────

function lightenHex(hex, amt) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
}

/**
 * Draw a planet onto ctx at (cx, cy) with radius rad.
 * BUG FIX: All array literals now use ASCII minus (-) not Unicode minus (−).
 * BUG FIX: Atmosphere glow now uses a fresh save/restore outside the clip,
 *          so it renders as a soft glow on top of the sphere correctly.
 */
function drawPlanet(ctx, p, cx, cy, rad, spin = 0) {
  // ── Base sphere ──────────────────────────────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.clip();

  const bg = ctx.createRadialGradient(cx - rad * 0.38, cy - rad * 0.38, rad * 0.04, cx, cy, rad * 1.05);
  bg.addColorStop(0, lightenHex(p.c1, 90));
  bg.addColorStop(0.3, p.c1);
  bg.addColorStop(0.75, p.c2);
  bg.addColorStop(1, p.c3);
  ctx.fillStyle = bg;
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);

  // ── Planet-specific surface detail ──────────────────────────────
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin);

  if (p.id === 'earth') {
    // Continents — all coordinates use ASCII minus
    ctx.fillStyle = '#2d7a35';
    [
      [-18, -14, 52, 28, 0.4],
      [20,   10, 45, 32, -0.2],
      [-35,  20, 28, 22,  0.3],
      [8,   -30, 38, 18, -0.4],
      [-55,  -5, 20, 18,  0.1],
    ].forEach(([x, y, rx, ry, rot]) => {
      ctx.save();
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // Polar caps
    ctx.fillStyle = 'rgba(230,240,255,0.7)';
    ctx.beginPath(); ctx.ellipse(0, -rad * 0.85, rad * 0.35, rad * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0,  rad * 0.88, rad * 0.25, rad * 0.13, 0, 0, Math.PI * 2); ctx.fill();
    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    [
      [-20, -25, 50, 12, -0.2],
      [15,   15, 55, 14,  0.3],
      [-40,   5, 38, 11,  0.1],
      [5,   -45, 42, 10, -0.3],
    ].forEach(([x, y, rx, ry, rot]) => {
      ctx.save();
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

  } else if (p.id === 'jupiter') {
    const bands = [
      [-rad * 0.65, 12, 'rgba(170,100,50,0.4)'],
      [-rad * 0.45, 18, 'rgba(210,170,90,0.25)'],
      [-rad * 0.2,  14, 'rgba(160,90,40,0.35)'],
      [-rad * 0.02, 10, 'rgba(220,190,110,0.2)'],
      [ rad * 0.15, 16, 'rgba(180,110,55,0.38)'],
      [ rad * 0.35, 12, 'rgba(200,160,80,0.22)'],
      [ rad * 0.55, 10, 'rgba(150,80,35,0.3)'],
    ];
    bands.forEach(([y, h, c]) => { ctx.fillStyle = c; ctx.fillRect(-rad, y, rad * 2, h); });
    // Great Red Spot
    ctx.fillStyle = 'rgba(200,70,40,0.55)';
    ctx.beginPath(); ctx.ellipse(rad * 0.2, rad * 0.22, rad * 0.25, rad * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(230,110,80,0.35)';
    ctx.beginPath(); ctx.ellipse(rad * 0.2, rad * 0.22, rad * 0.18, rad * 0.09, 0, 0, Math.PI * 2); ctx.fill();

  } else if (p.id === 'saturn') {
    const bands = [
      [-rad * 0.6,  14, 'rgba(200,170,80,0.3)'],
      [-rad * 0.35, 18, 'rgba(220,200,110,0.2)'],
      [-rad * 0.1,  12, 'rgba(190,155,65,0.32)'],
      [ rad * 0.1,  16, 'rgba(215,195,100,0.22)'],
      [ rad * 0.35, 12, 'rgba(185,148,58,0.28)'],
    ];
    bands.forEach(([y, h, c]) => { ctx.fillStyle = c; ctx.fillRect(-rad, y, rad * 2, h); });
    // Hexagonal polar storm
    ctx.strokeStyle = 'rgba(255,220,100,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a) * rad * 0.18;
      const y = -rad * 0.72 + Math.sin(a) * rad * 0.1;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

  } else if (p.id === 'mars') {
    // Dark regions
    ctx.fillStyle = 'rgba(80,25,8,0.45)';
    [
      [-15, -20, 48, 28,  0.5],
      [ 30,  25, 35, 22, -0.3],
      [-38,  15, 28, 18,  0.2],
    ].forEach(([x, y, rx, ry, rot]) => {
      ctx.save();
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // Craters
    [[-25, -30, 10], [22, 20, 8], [0, 35, 6], [38, -15, 7], [-40, 5, 5]].forEach(([x, y, r]) => {
      ctx.strokeStyle = 'rgba(40,12,4,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(30,8,2,0.2)'; ctx.fill();
    });
    // Polar cap
    ctx.fillStyle = 'rgba(220,230,240,0.6)';
    ctx.beginPath(); ctx.ellipse(0, -rad * 0.82, rad * 0.28, rad * 0.16, 0, 0, Math.PI * 2); ctx.fill();

  } else if (p.id === 'mercury') {
    const craterData = [
      [-20, -18, 16], [-38, 10, 11], [15,  30, 13], [ 30, -25,  9],
      [-10,  38, 10], [ 40, 15,  8], [-30, -35,  7], [  5, -10,  6],
      [ 38,  35,  9], [-15,  12,  5],
    ];
    craterData.forEach(([x, y, r]) => {
      ctx.strokeStyle = 'rgba(50,32,18,0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(40,25,12,0.18)'; ctx.fill();
      ctx.fillStyle = 'rgba(180,160,130,0.08)';
      ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2); ctx.fill();
    });

  } else if (p.id === 'venus') {
    for (let i = 0; i < 7; i++) {
      const by = -rad + i * (rad * 2 / 6);
      ctx.fillStyle = `rgba(220,180,${40 + i * 15},${0.15 + i % 2 * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(0, by + rad / 6, rad * 0.9, rad * 0.18, i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (p.id === 'uranus') {
    for (let i = 0; i < 5; i++) {
      const by = -rad + i * (rad * 2 / 4);
      ctx.fillStyle = `rgba(100,210,225,${0.08 + i % 2 * 0.06})`;
      ctx.fillRect(-rad, by, rad * 2, rad * 2 / 4);
    }

  } else if (p.id === 'neptune') {
    ctx.fillStyle = 'rgba(50,100,220,0.3)';
    ctx.beginPath(); ctx.ellipse(-15, -20, 40, 22, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(20, 25, 28, 16, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(80,140,255,0.18)';
    for (let i = 0; i < 4; i++) {
      const by = -rad + i * (rad * 2 / 3);
      ctx.fillRect(-rad, by, rad * 2, (rad * 2 / 3) * 0.35);
    }
  }

  ctx.restore(); // un-translate/rotate

  // ── Specular highlight (inside clip) ─────────────────────────────
  const shine = ctx.createRadialGradient(cx - rad * 0.42, cy - rad * 0.42, 0, cx - rad * 0.1, cy - rad * 0.1, rad * 0.75);
  shine.addColorStop(0, 'rgba(255,255,255,0.2)');
  shine.addColorStop(0.4, 'rgba(255,255,255,0.06)');
  shine.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);

  // ── Terminator shadow (inside clip) ──────────────────────────────
  const shadow = ctx.createRadialGradient(cx + rad * 0.5, cy + rad * 0.5, 0, cx + rad * 0.25, cy + rad * 0.25, rad * 0.95);
  shadow.addColorStop(0, 'rgba(0,0,0,0)');
  shadow.addColorStop(0.65, 'rgba(0,0,0,0.08)');
  shadow.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = shadow;
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);

  ctx.restore(); // end sphere clip

  // ── Atmosphere glow (outside clip, layered on top) ────────────────
  // BUG FIX: was incorrectly nested inside the clip in the original code
  if (p.atm) {
    ctx.save();
    const atg = ctx.createRadialGradient(cx, cy, rad * 0.85, cx, cy, rad * 1.15);
    atg.addColorStop(0, p.atm);
    atg.addColorStop(1, 'transparent');
    ctx.fillStyle = atg;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Rings (Saturn & Uranus) ───────────────────────────────────────
  if (p.rings) {
    if (p.id === 'saturn') {
      const ringColors = [
        'rgba(220,200,100,0.15)', 'rgba(210,185,85,0.38)', 'rgba(225,205,95,0.28)',
        'rgba(200,175,70,0.42)',  'rgba(215,195,88,0.22)', 'rgba(205,180,75,0.35)',
      ];
      const ringRanges = [
        [rad * 1.22, rad * 1.38], [rad * 1.42, rad * 1.62], [rad * 1.66, rad * 1.82],
        [rad * 1.86, rad * 2.05], [rad * 2.09, rad * 2.22], [rad * 2.26, rad * 2.42],
      ];

      // Back half of rings (behind planet)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, cy);
      ctx.clip();
      ringRanges.forEach(([r1, r2], i) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy + rad * 0.12, r2, r2 * 0.22, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ringColors[i];
        ctx.lineWidth = r2 - r1;
        ctx.stroke();
      });
      ctx.restore();

      // Redraw planet sphere to cover back rings
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.clip();
      const pg = ctx.createRadialGradient(cx - rad * 0.38, cy - rad * 0.38, rad * 0.04, cx, cy, rad * 1.05);
      pg.addColorStop(0, lightenHex(p.c1, 90));
      pg.addColorStop(0.3, p.c1);
      pg.addColorStop(0.75, p.c2);
      pg.addColorStop(1, p.c3);
      ctx.fillStyle = pg;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      // shadow on redraw too
      const sd2 = ctx.createRadialGradient(cx + rad * 0.5, cy + rad * 0.5, 0, cx + rad * 0.25, cy + rad * 0.25, rad * 0.95);
      sd2.addColorStop(0, 'rgba(0,0,0,0)');
      sd2.addColorStop(0.65, 'rgba(0,0,0,0.08)');
      sd2.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = sd2;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      ctx.restore();

      // Front half of rings (in front of planet)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, cy, W, H - cy);
      ctx.clip();
      ringRanges.forEach(([r1, r2], i) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy + rad * 0.12, r2, r2 * 0.22, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ringColors[i];
        ctx.lineWidth = r2 - r1;
        ctx.stroke();
      });
      ctx.restore();

    } else if (p.id === 'uranus') {
      const rc = p.ringColor || 'rgba(150,210,225,0.35)';
      for (let i = 0; i < 4; i++) {
        const rr = rad * 1.25 + i * rad * 0.12;
        ctx.strokeStyle = rc;
        ctx.lineWidth = Math.max(0.5, 2 - i * 0.3);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * 0.2, Math.PI * 0.15, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}