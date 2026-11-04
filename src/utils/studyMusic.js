// Web Audio API Synthesized Calm Study Instrumentals (No external bandwidth or audio files needed)

class StudyMusicSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.volume = 0.12; // Gentle low volume default (12%)
    this.timer = null;
    this.currentMode = 'piano'; // 'piano', 'nature', 'lofi'
    this.activeNodes = [];
    this.chordIndex = 0;
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

  initMaster() {
    const ctx = this.getAudioContext();
    if (!ctx) return null;

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      // Gentle Lowpass filter to give warm, soothing, non-fatiguing tone
      this.filter = ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(650, ctx.currentTime);

      this.masterGain.connect(this.filter);
      this.filter.connect(ctx.destination);
    }
    this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    return ctx;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(0.4, Number(val)));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.1);
    }
    return this.volume;
  }

  // Play a gentle, soft sustained note
  playGentleTone(freq, duration, delay = 0, type = 'sine') {
    const ctx = this.getAudioContext();
    if (!ctx || !this.isPlaying || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      // Very soft slow attack, peaceful sustain, long smooth decay
      const attack = 0.8;
      const release = duration * 0.6;
      const startTime = ctx.currentTime + delay;

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.08, startTime + attack);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + release);

      this.activeNodes.push({ osc, gain: noteGain });
    } catch (e) {
      console.warn('Study instrumental tone failed:', e);
    }
  }

  // Calm pentatonic and major 7th chord progressions for focus & concentration
  scheduleNextChord() {
    if (!this.isPlaying) return;

    const chords = [
      // Cmaj7 (C4, E4, G4, B4)
      [261.63, 329.63, 392.00, 493.88],
      // Am9 (A3, C4, E4, B4)
      [220.00, 261.63, 329.63, 493.88],
      // Fmaj7 (F3, A3, C4, E4)
      [174.61, 220.00, 261.63, 329.63],
      // G6 (G3, B3, D4, E4)
      [196.00, 246.94, 293.66, 329.63],
      // Dm7 (D3, F3, A3, C4)
      [146.83, 174.61, 220.00, 261.63],
      // Em7 (E3, G3, B3, D4)
      [164.81, 196.00, 246.94, 293.66],
    ];

    const currentChord = chords[this.chordIndex % chords.length];
    const chordDuration = 4.5; // 4.5 seconds per chord transition

    // Arpeggiate lightly
    currentChord.forEach((noteFreq, idx) => {
      const stagger = idx * 0.22;
      const waveType = this.currentMode === 'nature' ? 'triangle' : 'sine';
      this.playGentleTone(noteFreq, chordDuration - stagger, stagger, waveType);
    });

    // In 'nature' mode, add a high bell chime on alternate chords
    if (this.currentMode === 'nature' && this.chordIndex % 2 === 0) {
      this.playGentleTone(currentChord[currentChord.length - 1] * 2, 2.0, 1.2, 'sine');
    }

    this.chordIndex = (this.chordIndex + 1) % chords.length;

    this.timer = setTimeout(() => {
      this.scheduleNextChord();
    }, (chordDuration - 0.5) * 1000);
  }

  start(mode = 'piano') {
    const ctx = this.initMaster();
    if (!ctx) return false;

    this.isPlaying = true;
    this.currentMode = mode;
    this.chordIndex = 0;

    // Fade master gain smoothly into set volume
    this.masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(this.volume, ctx.currentTime + 1.2);

    this.scheduleNextChord();
    return true;
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.gain.setTargetAtTime(0.0001, this.audioCtx.currentTime, 0.4);
      } catch (e) {
        void e;
      }
    }
    this.activeNodes.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch (e) {
        void e;
      }
    });
    this.activeNodes = [];
  }

  setMode(mode) {
    this.currentMode = mode;
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(this.currentMode);
      return true;
    }
  }
}

export const studyMusic = new StudyMusicSynthesizer();
export default studyMusic;
