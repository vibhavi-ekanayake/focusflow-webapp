/**
 * Play a soothing completion chime using the native Web Audio API.
 * No external audio files or network requests required!
 */
export const playCompletionChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic chords (E5, B5, G#5) for a calming, uplifting chime
    const frequencies = [659.25, 987.77, 830.61];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      // Attack and gentle exponential decay
      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, now + index * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 1.8);
    });
  } catch (e) {
    console.warn('Audio chime could not be played:', e.message);
  }
};
