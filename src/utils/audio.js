// Web Audio API synthesized sound effects (no external audio files needed)

class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isSoundEnabled() {
    return this.enabled;
  }

  // Cheerful multi-note victory chime (C5 -> E5 -> G5 -> C6)
  playVictoryChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.15 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.15 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.20 }, // G5
        { freq: 1046.50, time: 0.40, dur: 0.45 }, // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Sweet, kid-friendly bell-like tone
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur);
      });
    } catch (e) {
      console.warn('Audio effect playback suppressed:', e);
    }
  }

  // Soft encouraging chime for try-again / practice
  playTryAgainChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [
        { freq: 440.00, time: 0.0, dur: 0.2 }, // A4
        { freq: 392.00, time: 0.18, dur: 0.3 }, // G4
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur);
      });
    } catch (e) {
      console.warn('Audio effect playback suppressed:', e);
    }
  }
}

export const soundEffects = new AudioManager();
