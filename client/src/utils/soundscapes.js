/**
 * Native Web Audio API procedural Ambient Soundscapes generator.
 * Zero external audio assets or network downloads required!
 */

let audioCtx = null;
let currentNodes = null;
let activeSoundType = null;
let masterGainNode = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Generate 5-second buffer of colored noise
const createNoiseBuffer = (ctx, type = 'pink') => {
  const bufferSize = ctx.sampleRate * 5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  let lastOut = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;

    if (type === 'white') {
      data[i] = white * 0.15;
    } else if (type === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    } else if (type === 'brown') {
      // Brown / Red noise (integrated white noise)
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 0.5; // Scale down
    }
  }

  return buffer;
};

export const SOUNDSCAPE_TYPES = [
  { id: 'rain', name: 'Gentle Rain', icon: '🌧️', desc: 'Calming raindrop patter' },
  { id: 'waves', name: 'Ocean Waves', icon: '🌊', desc: 'Rhythmic tidal surge' },
  { id: 'binaural', name: 'Alpha Focus (40Hz)', icon: '🧠', desc: 'Deep focus binaural tone' },
  { id: 'brown', name: 'Cozy Brown Noise', icon: '☕', desc: 'Warm distraction-masking hum' }
];

export const startSoundscape = (type, volume = 0.5) => {
  stopSoundscape();

  const ctx = getAudioContext();
  if (!ctx) return;

  masterGainNode = ctx.createGain();
  masterGainNode.gain.setValueAtTime(volume, ctx.currentTime);
  masterGainNode.connect(ctx.destination);

  if (type === 'rain') {
    // Pink noise through multi-band filters
    const buffer = createNoiseBuffer(ctx, 'pink');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(300, ctx.currentTime);

    source.connect(highpass);
    highpass.connect(filter);
    filter.connect(masterGainNode);

    source.start();
    currentNodes = [source];
  } else if (type === 'waves') {
    // Brown noise modulated with very slow LFO
    const buffer = createNoiseBuffer(ctx, 'brown');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const waveGain = ctx.createGain();
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 second wave cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    source.connect(waveGain);
    waveGain.connect(masterGainNode);

    lfo.start();
    source.start();
    currentNodes = [source, lfo];
  } else if (type === 'binaural') {
    // 200Hz base tone with 240Hz right ear (40Hz Gamma/Alpha focus beat)
    const merger = ctx.createChannelMerger(2);

    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, ctx.currentTime);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.15, ctx.currentTime);

    oscLeft.connect(merger, 0, 0); // left ear
    oscRight.connect(merger, 0, 1); // right ear
    merger.connect(subGain);
    subGain.connect(masterGainNode);

    oscLeft.start();
    oscRight.start();
    currentNodes = [oscLeft, oscRight];
  } else if (type === 'brown') {
    const buffer = createNoiseBuffer(ctx, 'brown');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    source.connect(filter);
    filter.connect(masterGainNode);

    source.start();
    currentNodes = [source];
  }

  activeSoundType = type;
};

export const stopSoundscape = () => {
  if (currentNodes) {
    currentNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {
        // Ignore already stopped
      }
    });
    currentNodes = null;
  }
  if (masterGainNode) {
    try {
      masterGainNode.disconnect();
    } catch (e) {}
    masterGainNode = null;
  }
  activeSoundType = null;
};

export const setSoundscapeVolume = (volume) => {
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
};

export const getActiveSoundscape = () => activeSoundType;
