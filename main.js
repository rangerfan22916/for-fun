// main.js — Application state, animation loop, and UI interactions
// Depends on: planets.js, audio.js, renderer.js

// ─── CANVAS SETUP ───────────────────────────────────────────────────
const bgC = document.getElementById('bg-c');
const rkC = document.getElementById('rocket-c');
const plC = document.getElementById('planet-c');

let W = window.innerWidth;
let H = window.innerHeight;

function resizeAll() {
  W = window.innerWidth;
  H = window.innerHeight;
  [bgC, rkC, plC].forEach(c => { c.width = W; c.height = H; });
  initStars();
}
window.addEventListener('resize', resizeAll);
resizeAll();

const bgX = bgC.getContext('2d');
const rkX = rkC.getContext('2d');
const plX = plC.getContext('2d');

// ─── GLOBAL STATE ───────────────────────────────────────────────────
let STATE = 'pad';

// Star fields
let stars = [];
let nebulae = [];
let flyStars = [];
let warpLines = [];

// Rocket / ascent
let rocketY = 0;
let rocketVY = 0;
let smoke = [];
let padShake = 0;
let engineOn = false;
let ascentT = 0;
let altKm = 0;
let velMs = 0;

// Planet view
let currentPlanet = null;
let planetSpinAngle = 0;

// Misc
let countIv = null;
let frame = 0;

// ─── STAR INIT ──────────────────────────────────────────────────────
function initStars() {
  stars = [];
  for (let i = 0; i < 350; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      a: Math.random(),
      t: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.012 + 0.004,
    });
  }
  flyStars = [];
  for (let i = 0; i < 250; i++) {
    flyStars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: Math.random() * 9 + 2,
      bright: Math.random(),
    });
  }
  nebulae = [];
  for (let i = 0; i < 5; i++) {
    nebulae.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 120 + 60,
      h: Math.random() * 360,
      a: Math.random() * 0.04 + 0.01,
    });
  }
}

function initSmoke() {
  smoke = [];
  const fb = H - Math.round(H * 0.1);
  for (let i = 0; i < 60; i++) {
    smoke.push({
      x: W / 2 + (Math.random() - 0.5) * 60,
      y: fb + Math.random() * 30,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 2 + 0.5,
      r: 12 + Math.random() * 16,
      a: Math.random() * 0.15 + 0.05,
    });
  }
}

function initWarp() {
  warpLines = [];
  const cx = W / 2, cy = H / 2;
  for (let i = 0; i < 150; i++) {
    const angle = Math.random() * Math.PI * 2;
    const d = Math.random() * 80 + 10;
    warpLines.push({
      ox: cx + Math.cos(angle) * d,
      oy: cy + Math.sin(angle) * d,
      angle,
      len: 0,
      speed: Math.random() * 8 + 4,
      r: 180 + Math.floor(Math.random() * 75),
      g: 200 + Math.floor(Math.random() * 55),
      b: 255,
      w: Math.random() * 1.4 + 0.3,
    });
  }
}

// ─── SCREEN MANAGEMENT ──────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── COUNTDOWN SEQUENCE ─────────────────────────────────────────────
const COUNT_STEPS = [
  { n: 10, msg: 'ALL STATIONS: INITIATE LAUNCH SEQUENCE', sys: [] },
  { n: 9,  msg: 'GUIDANCE COMPUTER: GO',                  sys: ['NAV: ALIGNED'] },
  { n: 8,  msg: 'FUEL CELLS: NOMINAL',                    sys: ['NAV: ALIGNED', 'FUEL: 100%'] },
  { n: 7,  msg: 'ENGINES: ARMED',                         sys: ['NAV: ALIGNED', 'FUEL: 100%', 'ENG: ARMED'] },
  { n: 6,  msg: 'GYROS: LOCKED',                          sys: ['NAV: ALIGNED', 'FUEL: 100%', 'ENG: ARMED', 'GYRO: LOCK'] },
  { n: 5,  msg: 'RANGE SAFETY: GO',                       sys: ['NAV: ALIGNED', 'FUEL: 100%', 'ENG: ARMED', 'GYRO: LOCK', 'RANGE: GO'] },
  { n: 4,  msg: 'ABORT SYSTEM: ARMED',                    sys: ['NAV: ALIGNED', 'FUEL: 100%', 'ENG: ARMED', 'GYRO: LOCK', 'RANGE: GO', 'ABORT: ARMED'] },
  { n: 3,  msg: 'ALL SYSTEMS GO — IGNITION START',        sys: ['NAV: ALIGNED', 'FUEL: 100%', 'ENG: ARMED', 'GYRO: LOCK', 'RANGE: GO', 'ABORT: ARMED', 'IGNITION: GO'] },
  { n: 2,  msg: 'FULL THRUST — HOLD DOWN RELEASE',        sys: ['NAV: ALIGNED', 'FUEL: 100%', 'ENG: ARMED', 'GYRO: LOCK', 'RANGE: GO', 'ABORT: ARMED', 'IGNITION: GO', 'THRUST: 100%'] },
  { n: 1,  msg: 'TOWER CLEARED — ROLL PROGRAM',           sys: ['ENGINE 1: GO', 'ENGINE 2: GO', 'ENGINE 3: GO', 'ENGINE 4: GO', 'ENGINE 5: GO', 'THRUST: 100%', 'ROLL: NOMINAL', 'LIFTOFF: GO'] },
];

function beginSequence() {
  initAudio();
  showScreen('s-count');
  STATE = 'countdown';
  initSmoke();
  engineOn = false;
  padShake = 0;

  let step = 0;
  countIv = setInterval(() => {
    if (step >= COUNT_STEPS.length) {
      clearInterval(countIv);
      countIv = null;
      executeLiftoff();
      return;
    }
    const cs = COUNT_STEPS[step];
    const numEl = document.getElementById('cnt-num');
    numEl.textContent = cs.n;
    numEl.className = 'big-countdown' + (cs.n <= 3 ? ' fire' : '');
    document.getElementById('status-msg').textContent = cs.msg;
    document.getElementById('sys-log').innerHTML = cs.sys.map(s => `<div class="sys-line">${s}</div>`).join('');
    countdownBeep(cs.n);
    if (cs.n <= 3) {
      engineOn = true;
      padShake = Math.min(10, padShake + 2.5);
    }
    step++;
  }, 950);
}

function executeLiftoff() {
  const numEl = document.getElementById('cnt-num');
  numEl.textContent = 'LIFTOFF';
  numEl.className = 'big-countdown liftoff-text';
  document.getElementById('status-msg').textContent = 'WE HAVE LIFTOFF — APOLLO SPACE EXPLORER';
  playLiftoffBoom();
  padShake = 14;
  setTimeout(startAscent, 1400);
}

function skipToWarp() {
  if (countIv) { clearInterval(countIv); countIv = null; }
  stopEngineRumble();
  startWarpPhase();
}

function startAscent() {
  STATE = 'ascent';
  rocketY = 0;
  rocketVY = 2.2;
  ascentT = 0;
  altKm = 0;
  velMs = 0;
  showScreen('s-ascent');
  startEngineRumble();
  // Auto-transition to warp after 5 s
  setTimeout(() => { if (STATE === 'ascent') startWarpPhase(); }, 5000);
}

function startWarpPhase() {
  stopEngineRumble();
  STATE = 'warp';
  showScreen('s-warp');
  initWarp();
  playWarpSound();
  document.getElementById('warp-label').textContent = 'ENTERING WARP CORRIDOR';
  document.getElementById('warp-sub').textContent = 'DESTINATION SELECTION IN PROGRESS';
  setTimeout(() => { buildPlanetMenu(); showScreen('s-planets'); STATE = 'planets'; }, 3200);
}

// ─── PLANET MENU ────────────────────────────────────────────────────
function buildPlanetMenu() {
  const grid = document.getElementById('planet-grid');
  grid.innerHTML = '';
  PLANETS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'p-card';
    const ic = document.createElement('canvas');
    ic.width = 70;
    ic.height = 70;
    drawPlanet(ic.getContext('2d'), p, 35, 35, 32, 0);
    card.appendChild(ic);
    const nm = document.createElement('div');
    nm.className = 'p-card-name';
    nm.textContent = p.name;
    const tp = document.createElement('div');
    tp.className = 'p-card-type';
    tp.textContent = p.type;
    card.appendChild(nm);
    card.appendChild(tp);
    card.onclick = () => showPlanetInfo(p);
    grid.appendChild(card);
  });
  playArrivalChime();
}

function showPlanetInfo(p) {
  currentPlanet = p;
  planetSpinAngle = 0;
  STATE = 'planet-view';
  showScreen('s-info');

  // Static initial draw; animation loop will keep spinning it
  const ic = document.getElementById('info-canvas');
  ic.width = 200;
  ic.height = 200;
  drawPlanet(ic.getContext('2d'), p, 100, 100, 96, 0);

  const ir = document.getElementById('info-right');
  const fc = p.facts.map(([l, v]) =>
    `<div class="fact-item"><div class="fact-label">${l}</div><div class="fact-val">${v}</div></div>`
  ).join('');
  const fl = p.fun.map(f => `<li>${f}</li>`).join('');
  ir.innerHTML = `
    <div class="p-title">${p.name}</div>
    <div class="p-tagline">${p.type} — ${p.tagline}</div>
    <div class="p-desc">${p.desc}</div>
    <div class="fact-grid">${fc}</div>
    <div class="fun-box">
      <div class="fun-title">// MISSION DATA</div>
      <ul class="fun-list">${fl}</ul>
    </div>`;
  playArrivalChime();
}

function goDestinations() {
  currentPlanet = null;
  STATE = 'planets';
  showScreen('s-planets');
}

// ─── MAIN ANIMATION LOOP ────────────────────────────────────────────
function loop() {
  requestAnimationFrame(loop);
  frame++;

  bgX.clearRect(0, 0, W, H);
  rkX.clearRect(0, 0, W, H);
  plX.clearRect(0, 0, W, H);

  if (STATE === 'pad') {
    drawPadBg(bgX);
    drawStars(bgX, 0);
    drawLaunchPad(rkX, 0);
    drawSaturnV(rkX, 0, 0, false);

  } else if (STATE === 'countdown') {
    drawPadBg(bgX);
    const sh = engineOn ? (Math.random() - 0.5) * padShake : 0;
    drawStars(bgX, padShake * 0.5);
    drawLaunchPad(rkX, sh);
    drawSaturnV(rkX, 0, sh, engineOn);
    if (engineOn) padShake = Math.min(16, padShake + 0.05);

  } else if (STATE === 'ascent') {
    drawSpaceBg(bgX);
    drawStars(bgX, 0);
    drawFlyStars(bgX, 2.5);
    const sh = (Math.random() - 0.5) * 1.5;
    drawSaturnV(rkX, rocketY, sh, true);
    rocketY -= rocketVY;
    rocketVY += 0.25;
    ascentT += 1 / 60;
    altKm = Math.round(ascentT * ascentT * 8);
    velMs = Math.round(rocketVY * 60 * ascentT * 10);
    document.getElementById('alt-disp').textContent = altKm + ' km';
    document.getElementById('vel-disp').textContent = velMs + ' m/s';
    // BUG FIX: STATE='transit' was dead-end — auto-transition now in setTimeout above

  } else if (STATE === 'warp') {
    drawWarp(bgX);

  } else if (STATE === 'planets') {
    drawSpaceBg(bgX);
    drawStars(bgX, 0);
    drawFlyStars(bgX, 0.4);

  } else if (STATE === 'planet-view') {
    drawSpaceBg(bgX);
    drawStars(bgX, 0);
    // BUG FIX: animate the planet on the large background canvas AND refresh the info canvas
    planetSpinAngle += 0.002;
    if (currentPlanet) {
      drawPlanet(plX, currentPlanet, W / 2, H / 2, Math.min(W, H) * 0.30, planetSpinAngle);
      // Keep info-canvas spinning too
      const ic = document.getElementById('info-canvas');
      const ictx = ic.getContext('2d');
      ictx.clearRect(0, 0, 200, 200);
      drawPlanet(ictx, currentPlanet, 100, 100, 96, planetSpinAngle);
    }
  }
}

// ─── BOOT ───────────────────────────────────────────────────────────
initStars();
loop();