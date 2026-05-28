import { create } from 'zustand';

/* ═══════════════════════════════════════════════════════════════
   Ambient Sound Store — Web Audio API generated sounds
   No external URLs needed — everything is synthesized locally.
   ═══════════════════════════════════════════════════════════════ */

const AMBIENT_SOUNDS = [
  { id: 'rain',          label: 'Rain',           emoji: '🌧️' },
  { id: 'cafe',          label: 'Café',           emoji: '☕' },
  { id: 'whitenoise',    label: 'White Noise',    emoji: '📡' },
  { id: 'darkambience',  label: 'Dark Ambience',  emoji: '🌑' },
];

let _ctx = null;
let _masterGain = null;

function stopAndClose() {
  if (_ctx) {
    try {
      if (_ctx.state !== 'closed') {
        _ctx.close();
      }
    } catch (e) {
      console.error('[AmbientStore] Error closing AudioContext:', e);
    }
    _ctx = null;
    _masterGain = null;
  }
}

function createWhiteNoise(ctx, dest) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = 0.25;

  source.connect(gain);
  gain.connect(dest);
  source.start();
}

function createRain(ctx, dest) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  // Layer 1: Pitter-patter (bandpass-filtered noise)
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2000;
  bp.Q.value = 0.5;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 500;

  const gain1 = ctx.createGain();
  gain1.gain.value = 0.4;

  source.connect(bp);
  bp.connect(hp);
  hp.connect(gain1);
  gain1.connect(dest);
  source.start();

  // Layer 2: Deep rumble
  const source2 = ctx.createBufferSource();
  source2.buffer = buffer;
  source2.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 200;

  const gain2 = ctx.createGain();
  gain2.gain.value = 0.15;

  source2.connect(lp);
  lp.connect(gain2);
  gain2.connect(dest);
  source2.start();
}

function createCafe(ctx, dest) {
  // Generate brown noise
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // scale brown noise to typical levels
  }

  // Layer 1: Chatter background (brownian noise + bandpass filter)
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 800;
  bp.Q.value = 0.6;

  const gain1 = ctx.createGain();
  gain1.gain.value = 0.45;

  source.connect(bp);
  bp.connect(gain1);
  gain1.connect(dest);
  source.start();

  // Layer 2: High clatter sounds (plates, cups)
  const source2 = ctx.createBufferSource();
  // Use simple white noise for high-frequency crinkle
  const buf2 = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const d2 = buf2.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    d2[i] = Math.random() * 2 - 1;
  }
  source2.buffer = buf2;
  source2.loop = true;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 4000;

  const gain2 = ctx.createGain();
  gain2.gain.value = 0.04;

  source2.connect(hp);
  hp.connect(gain2);
  gain2.connect(dest);
  source2.start();
}

function createDarkAmbience(ctx, dest) {
  // Deep drone using sine waves
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 60; // low C/D

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 90; // fifth (G)

  // Slow LFO for volume wobble
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.12; // slow drift
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 10; // pitch shift range
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency); // modulate pitch of osc1
  
  const gain1 = ctx.createGain();
  gain1.gain.value = 0.25;
  const gain2 = ctx.createGain();
  gain2.gain.value = 0.18;

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(dest);
  gain2.connect(dest);

  osc1.start();
  osc2.start();
  lfo.start();

  // Low hum background noise
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 150;

  const gain3 = ctx.createGain();
  gain3.gain.value = 0.12;

  source.connect(lp);
  lp.connect(gain3);
  gain3.connect(dest);
  source.start();
}

function startSound(id, ctx, dest) {
  switch (id) {
    case 'rain':          createRain(ctx, dest); break;
    case 'cafe':          createCafe(ctx, dest); break;
    case 'whitenoise':    createWhiteNoise(ctx, dest); break;
    case 'darkambience':  createDarkAmbience(ctx, dest); break;
    default:              break;
  }
}

export const useAmbientStore = create((set, get) => ({
  sounds: AMBIENT_SOUNDS,
  activeId: null,
  volume: 40,

  play: async (soundId) => {
    const { activeId } = get();

    // Toggle off if same
    if (activeId === soundId) {
      get().stop();
      return;
    }

    // Stop current
    stopAndClose();

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const masterGain = ctx.createGain();
      masterGain.gain.value = get().volume / 100;
      masterGain.connect(ctx.destination);

      // Synthesize and start sounds
      startSound(soundId, ctx, masterGain);

      // Force resume
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      _ctx = ctx;
      _masterGain = masterGain;

      set({ activeId: soundId });
    } catch (err) {
      console.error('[AmbientStore] Failed to play sound:', err);
    }
  },

  stop: () => {
    stopAndClose();
    set({ activeId: null });
  },

  setVolume: (vol) => {
    const v = Math.max(0, Math.min(100, vol));
    set({ volume: v });
    if (_masterGain && _ctx) {
      _masterGain.gain.setValueAtTime(v / 100, _ctx.currentTime);
    }
  },
}));
