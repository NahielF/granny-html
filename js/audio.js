// Motor de audio 100% sintetizado con Web Audio API (sin ficheros externos).
import { clamp, randRange } from './utils.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.unlocked = false;
    this._ambientNodes = null;
    this._heartbeatTimer = null;
    this._heartbeatRate = 0;
  }

  unlock() {
    if (this.unlocked) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.6;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 1;
    this.sfxGain.connect(this.master);
    this.unlocked = true;
    this.startAmbient();
  }

  setMasterVolume(v) { if (this.master) this.master.gain.value = clamp(v, 0, 1); }
  setMusicVolume(v) { if (this.musicGain) this.musicGain.gain.value = clamp(v, 0, 1); }

  _noiseBuffer(duration = 1) {
    const ctx = this.ctx;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // ---------------- Ambiente continuo ----------------
  startAmbient() {
    if (!this.ctx || this._ambientNodes) return;
    const ctx = this.ctx;
    const nodes = [];
    const drone = ctx.createGain();
    drone.gain.value = 0.18;
    drone.connect(this.musicGain);
    for (const [freq, det] of [[55, 0], [55.6, 3], [110, -4]]) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = det;
      const g = ctx.createGain();
      g.gain.value = 0.33;
      osc.connect(g); g.connect(drone);
      osc.start();
      nodes.push(osc);
    }
    // LFO de amplitud lenta para dar sensación inquietante
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain);
    lfoGain.connect(drone.gain);
    lfo.start();
    nodes.push(lfo);

    // Ruido de viento filtrado
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = this._noiseBuffer(4);
    windSrc.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 300;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;
    windSrc.connect(windFilter); windFilter.connect(windGain); windGain.connect(this.musicGain);
    windSrc.start();
    nodes.push(windSrc);

    this._ambientNodes = { drone, nodes };
  }

  setTension(t) {
    // t: 0 (calma) a 1 (persecución) — sube el drone y activa latido
    if (!this._ambientNodes) return;
    this._ambientNodes.drone.gain.value = 0.18 + t * 0.35;
    this.setHeartbeat(t);
  }

  setHeartbeat(intensity) {
    if (!this.ctx) return;
    if (intensity < 0.05) {
      this._heartbeatRate = 0;
      return;
    }
    const rate = 1.1 - intensity * 0.75; // segundos entre latidos
    this._heartbeatRate = rate;
    const now = performance.now();
    if (!this._lastBeat || now - this._lastBeat > rate * 1000) {
      this._lastBeat = now;
      this._playHeartbeatThump(0.15 + intensity * 0.35);
    }
  }

  update() {
    if (this._heartbeatRate > 0) {
      const now = performance.now();
      if (!this._lastBeat || now - this._lastBeat > this._heartbeatRate * 1000) {
        this._lastBeat = now;
        this._playHeartbeatThump(0.2);
      }
    }
  }

  _playHeartbeatThump(vol) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  // ---------------- Efectos puntuales ----------------
  footstep(running) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(0.08);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = running ? 900 : 500;
    filter.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(running ? 0.22 : 0.13, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    src.connect(filter); filter.connect(g); g.connect(this.sfxGain);
    src.start();
  }

  doorCreak() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(randRange(140, 200), ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(randRange(220, 320), ctx.currentTime + 0.6);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(filter); filter.connect(g); g.connect(this.sfxGain);
    osc.start(); osc.stop(ctx.currentTime + 0.75);
  }

  uiClick() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 320;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(); osc.stop(ctx.currentTime + 0.09);
  }

  pickupItem() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    [520, 780, 1040].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t0 + i * 0.05);
      g.gain.linearRampToValueAtTime(0.12, t0 + i * 0.05 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.05 + 0.18);
      osc.connect(g); g.connect(this.sfxGain);
      osc.start(t0 + i * 0.05); osc.stop(t0 + i * 0.05 + 0.2);
    });
  }

  errorBeep() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 140;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(); osc.stop(ctx.currentTime + 0.3);
  }

  growl() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(0.9);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.9);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    src.connect(filter); filter.connect(g); g.connect(this.sfxGain);
    src.start();
  }

  jumpscare() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t0);
    osc.frequency.exponentialRampToValueAtTime(900, t0 + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t0);
    g.gain.linearRampToValueAtTime(0.55, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.9);
    const dist = ctx.createWaveShaper();
    dist.curve = this._distortionCurve(60);
    osc.connect(dist); dist.connect(g); g.connect(this.sfxGain);
    osc.start(t0); osc.stop(t0 + 1);

    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(0.6);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.4, t0);
    g2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
    src.connect(g2); g2.connect(this.sfxGain);
    src.start(t0);
  }

  _distortionCurve(amount) {
    const n = 44100;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  victoryFanfare() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t0 + i * 0.18);
      g.gain.linearRampToValueAtTime(0.2, t0 + i * 0.18 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.18 + 0.5);
      osc.connect(g); g.connect(this.sfxGain);
      osc.start(t0 + i * 0.18); osc.stop(t0 + i * 0.18 + 0.55);
    });
  }

  defeatDrone() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t0);
    osc.frequency.exponentialRampToValueAtTime(40, t0 + 2.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 2.4);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(t0); osc.stop(t0 + 2.5);
  }

  stunZap() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, t0);
    osc.frequency.linearRampToValueAtTime(80, t0 + 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(t0); osc.stop(t0 + 0.3);
  }
}

export const audio = new AudioEngine();
