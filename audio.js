// audio.js — Web Audio engine

let audioCtx = null;
let audioEnabled = true;
let masterGain = null;
let engineNodes = [];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(audioCtx.destination);
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  const btn = document.getElementById('audio-toggle');
  btn.textContent = audioEnabled ? '🔊 AUDIO ON' : '🔇 AUDIO OFF';
  if (masterGain) masterGain.gain.value = audioEnabled ? 0.7 : 0;
}

function beep(freq = 880, dur = 0.08, type = 'square', vol = 0.15, delay = 0) {
  if (!audioCtx || !audioEnabled) return;
  const t = audioCtx.currentTime + delay;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(masterGain);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function countdownBeep(n) {
  if (!audioCtx || !audioEnabled) return;
  if (n > 0) beep(n <= 3 ? 1200 : 880, 0.12, 'square', 0.2);
  else beep(1760, 0.4, 'sawtooth', 0.3);
}

function startEngineRumble() {
  if (!audioCtx || !audioEnabled) return;
  stopEngineRumble();

  // Noise buffer for low rumble
  const bufSize = audioCtx.sampleRate * 2;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 120;

  const gNoise = audioCtx.createGain();
  gNoise.gain.setValueAtTime(0, audioCtx.currentTime);
  gNoise.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 1.5);

  src.connect(lp);
  lp.connect(gNoise);
  gNoise.connect(masterGain);
  src.start();

  // Deep oscillators
  const o1 = audioCtx.createOscillator();
  o1.type = 'sawtooth';
  o1.frequency.value = 55;
  const g1 = audioCtx.createGain();
  g1.gain.setValueAtTime(0, audioCtx.currentTime);
  g1.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.0);
  o1.connect(g1);
  g1.connect(masterGain);
  o1.start();

  const o2 = audioCtx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = 80;
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(0, audioCtx.currentTime);
  g2.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.8);
  o2.connect(g2);
  g2.connect(masterGain);
  o2.start();

  // Store all source nodes (not gain nodes) for clean stop
  engineNodes = [{ source: src, gain: gNoise }, { source: o1, gain: g1 }, { source: o2, gain: g2 }];
}

function stopEngineRumble() {
  const now = audioCtx ? audioCtx.currentTime : 0;
  engineNodes.forEach(({ source, gain }) => {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
    } catch (e) { /* already stopped */ }
    try {
      source.stop(now + 0.35);
    } catch (e) { /* already stopped */ }
  });
  engineNodes = [];
}

function playLiftoffBoom() {
  if (!audioCtx || !audioEnabled) return;
  const bufSize = audioCtx.sampleRate * 0.5;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.15));
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 200;
  const g = audioCtx.createGain();
  g.gain.value = 1.0;
  src.connect(lp);
  lp.connect(g);
  g.connect(masterGain);
  src.start();
  beep(220, 0.8, 'sawtooth', 0.4);
  beep(110, 1.2, 'sawtooth', 0.35, 0.1);
}

function playWarpSound() {
  if (!audioCtx || !audioEnabled) return;
  const o = audioCtx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(200, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + 1.5);
  o.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 3.0);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0, audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.2);
  g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3.0);
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1200;
  o.connect(lp);
  lp.connect(g);
  g.connect(masterGain);
  o.start();
  o.stop(audioCtx.currentTime + 3.1);

  // Whoosh noise
  const bufSize = audioCtx.sampleRate * 2;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1)
      * Math.min(1, i / (audioCtx.sampleRate * 0.3))
      * Math.max(0, 1 - i / (audioCtx.sampleRate * 1.5));
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 800;
  const g2 = audioCtx.createGain();
  g2.gain.value = 0.5;
  src.connect(hp);
  hp.connect(g2);
  g2.connect(masterGain);
  src.start();
}

function playArrivalChime() {
  if (!audioCtx || !audioEnabled) return;
  [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.3, 'sine', 0.15, i * 0.12));
}