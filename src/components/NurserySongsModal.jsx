import { useState, useEffect } from 'react';
import { launchConfetti } from '../utils/confetti';
import { soundEffects } from '../utils/audio';
import './NurserySongsModal.css';

const NURSERY_SONGS = [
  {
    id: 'karaba-intoki',
    title: 'Karaba Intoki (Wash Hands)',
    language: 'kiny',
    langLabel: '🇷🇼 Kinyarwanda',
    emoji: '🧼',
    theme: '#06b6d4',
    melodyNotes: [
      { freq: 261.63, dur: 0.3 }, // C4
      { freq: 293.66, dur: 0.3 }, // D4
      { freq: 329.63, dur: 0.4 }, // E4
      { freq: 261.63, dur: 0.3 }, // C4
      { freq: 329.63, dur: 0.3 }, // E4
      { freq: 392.00, dur: 0.5 }, // G4
    ],
    lyrics: [
      'Karaba intoki zawe n\'amazi meza 💧',
      'Fata isabune uyisige hose 🧼',
      'Mesa neza imbere n\'inyuma 🤲',
      'Igisate cyose kigire isuku ✨',
      'Turi abana bazi ubwenge kandi basukuye! 🎈',
    ],
    actionPrompt: '👏 Koma amashyi 3 wisige isabune mu ntoki! (Clap 3 times!)',
  },
  {
    id: 'rimwe-kabiri',
    title: 'Rimwe, Kabiri, Gatatu (1, 2, 3 Counting)',
    language: 'kiny',
    langLabel: '🇷🇼 Kinyarwanda',
    emoji: '🔢',
    theme: '#ec4899',
    melodyNotes: [
      { freq: 261.63, dur: 0.25 },
      { freq: 293.66, dur: 0.25 },
      { freq: 329.63, dur: 0.35 },
      { freq: 349.23, dur: 0.25 },
      { freq: 392.00, dur: 0.5 },
    ],
    lyrics: [
      'Rimwe: Inyenyeri imwe mu kirere ⭐',
      'Kabiri: Amaso abiri adufasha kureba 👀',
      'Gatatu: Amaguru y\'intebe yicayeho 🪑',
      'Kane: Amapine ane y\'imodoka igenda 🚗',
      'Gatanu: Intoki eshanu z\'ikiganza cyacu! 🖐️',
    ],
    actionPrompt: '🖐️ Emeza intoki zawe zose uko ari eshanu hejuru!',
  },
  {
    id: 'abc-song',
    title: 'The ABC Song',
    language: 'en',
    langLabel: '🇬🇧 English',
    emoji: '🔤',
    theme: '#8b5cf6',
    melodyNotes: [
      { freq: 261.63, dur: 0.3 },
      { freq: 261.63, dur: 0.3 },
      { freq: 392.00, dur: 0.3 },
      { freq: 392.00, dur: 0.3 },
      { freq: 440.00, dur: 0.3 },
      { freq: 440.00, dur: 0.3 },
      { freq: 392.00, dur: 0.6 },
    ],
    lyrics: [
      'A - B - C - D - E - F - G 🎵',
      'H - I - J - K - L - M - N - O - P 🎶',
      'Q - R - S, and T - U - V 🎈',
      'W - X, and Y and Z! 🚀',
      'Now I know my ABCs, next time won\'t you sing with me! ⭐',
    ],
    actionPrompt: '💃 Sing loud and dance to the rhythm!',
  },
  {
    id: 'twinkle-star',
    title: 'Twinkle, Twinkle, Little Star',
    language: 'en',
    langLabel: '🇬🇧 English',
    emoji: '⭐',
    theme: '#f59e0b',
    melodyNotes: [
      { freq: 261.63, dur: 0.35 },
      { freq: 261.63, dur: 0.35 },
      { freq: 392.00, dur: 0.35 },
      { freq: 392.00, dur: 0.35 },
      { freq: 440.00, dur: 0.35 },
      { freq: 440.00, dur: 0.35 },
      { freq: 392.00, dur: 0.7 },
    ],
    lyrics: [
      'Twinkle, twinkle, little star ⭐',
      'How I wonder what you are! 🌌',
      'Up above the world so high ☁️',
      'Like a diamond in the sky 💎',
      'Twinkle, twinkle, little star, how I wonder what you are! 🌟',
    ],
    actionPrompt: '✨ Open and close your fingers like twinkling stars!',
  },
  {
    id: 'head-shoulders',
    title: 'Head, Shoulders, Knees and Toes',
    language: 'en',
    langLabel: '🇬🇧 English',
    emoji: '🤸',
    theme: '#10b981',
    melodyNotes: [
      { freq: 392.00, dur: 0.3 },
      { freq: 392.00, dur: 0.3 },
      { freq: 329.63, dur: 0.3 },
      { freq: 261.63, dur: 0.4 },
    ],
    lyrics: [
      'Head, shoulders, knees and toes, knees and toes! 🙆‍♂️',
      'Head, shoulders, knees and toes, knees and toes! 🦶',
      'And eyes, and ears, and mouth, and nose! 👀👂👄👃',
      'Head, shoulders, knees and toes, knees and toes! 🎉',
    ],
    actionPrompt: '🙆 Touch your head, your shoulders, and then your knees!',
  },
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    language: 'fr',
    langLabel: '🇫🇷 Français',
    emoji: '🔔',
    theme: '#3b82f6',
    melodyNotes: [
      { freq: 261.63, dur: 0.35 },
      { freq: 293.66, dur: 0.35 },
      { freq: 329.63, dur: 0.35 },
      { freq: 261.63, dur: 0.35 },
    ],
    lyrics: [
      'Frère Jacques, Frère Jacques, 🛌',
      'Dormez-vous? Dormez-vous? 😴',
      'Sonnez les matines! Sonnez les matines! 🔔',
      'Ding, dang, dong! Ding, dang, dong! 🎶',
    ],
    actionPrompt: '🔔 Sonnez la cloche : Ding, dang, dong !',
  },
];

const NurserySongsModal = ({ isOpen, onClose }) => {
  const [selectedSong, setSelectedSong] = useState(NURSERY_SONGS[0]);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  const [isSinging, setIsSinging] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState('all');

  useEffect(() => {
    // Stop audio and speech on unmount or close
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Filter songs by language
  const displayedSongs = activeLangTab === 'all'
    ? NURSERY_SONGS
    : NURSERY_SONGS.filter((s) => s.language === activeLangTab);

  // Play Web Audio synthesized melody
  const handlePlayMelody = () => {
    if (isPlayingMelody) return;
    setIsPlayingMelody(true);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      let offset = 0.05;
      selectedSong.melodyNotes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // sweet kid-friendly glockenspiel tone
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + offset);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + n.dur);

        offset += n.dur + 0.05;
      });

      setTimeout(() => {
        setIsPlayingMelody(false);
      }, offset * 1000);
    } catch (e) {
      console.warn('Melody playback error:', e);
      setIsPlayingMelody(false);
    }
  };

  // Sing along / read aloud with browser speech
  const handleSingAlong = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSinging) {
      window.speechSynthesis.cancel();
      setIsSinging(false);
      return;
    }

    window.speechSynthesis.cancel();
    const fullLyrics = selectedSong.lyrics.join('. ');
    const utterance = new SpeechSynthesisUtterance(fullLyrics);
    utterance.rate = 0.85; // slower, gentle pace for nursery kids
    utterance.pitch = 1.15; // friendly, cheerful pitch

    utterance.onstart = () => setIsSinging(true);
    utterance.onend = () => setIsSinging(false);
    utterance.onerror = () => setIsSinging(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleClapHands = () => {
    launchConfetti(2500);
    soundEffects.playVictoryChime();
  };

  return (
    <div className="nursery-modal-overlay" onClick={onClose}>
      <div className="nursery-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="nursery-modal-header">
          <div className="nursery-title-wrap">
            <span className="nursery-mascot">🧸</span>
            <div>
              <h2 className="nursery-modal-title">Nursery Sing &amp; Learn</h2>
              <p className="nursery-modal-subtitle">Fun Rhymes &amp; Songs for Nursery Students (Ages 3–6)</p>
            </div>
          </div>
          <button type="button" className="nursery-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Language Filter Pills */}
        <div className="nursery-lang-pills">
          <button
            type="button"
            className={`lang-pill ${activeLangTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveLangTab('all')}
          >
            🌈 All Songs
          </button>
          <button
            type="button"
            className={`lang-pill ${activeLangTab === 'kiny' ? 'active' : ''}`}
            onClick={() => setActiveLangTab('kiny')}
          >
            🇷🇼 Kinyarwanda
          </button>
          <button
            type="button"
            className={`lang-pill ${activeLangTab === 'en' ? 'active' : ''}`}
            onClick={() => setActiveLangTab('en')}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            className={`lang-pill ${activeLangTab === 'fr' ? 'active' : ''}`}
            onClick={() => setActiveLangTab('fr')}
          >
            🇫🇷 Français
          </button>
        </div>

        <div className="nursery-modal-body">
          {/* Left Column: Song List */}
          <div className="nursery-song-list">
            {displayedSongs.map((song) => {
              const isSelected = song.id === selectedSong.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  className={`nursery-song-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSong(song);
                    if (isSinging) window.speechSynthesis.cancel();
                    setIsSinging(false);
                  }}
                  style={{ borderLeftColor: song.theme }}
                >
                  <span className="song-emoji">{song.emoji}</span>
                  <div className="song-info">
                    <span className="song-name">{song.title}</span>
                    <span className="song-lang-tag">{song.langLabel}</span>
                  </div>
                  {isSelected && <span className="song-playing-indicator">🎵</span>}
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Song Player & Big Sing-Along Lyrics */}
          <div className="nursery-player-card" style={{ borderColor: selectedSong.theme }}>
            <div className="player-top">
              <span className="player-emoji">{selectedSong.emoji}</span>
              <div>
                <h3 className="player-song-title">{selectedSong.title}</h3>
                <span className="player-badge">{selectedSong.langLabel}</span>
              </div>
            </div>

            {/* Interactive Action Toolbar */}
            <div className="player-controls">
              <button
                type="button"
                className={`player-btn melody-btn ${isPlayingMelody ? 'pulse' : ''}`}
                onClick={handlePlayMelody}
                disabled={isPlayingMelody}
              >
                {isPlayingMelody ? '🎶 Playing Melody...' : '▶ Play Song Tune'}
              </button>

              <button
                type="button"
                className={`player-btn sing-btn ${isSinging ? 'active' : ''}`}
                onClick={handleSingAlong}
              >
                {isSinging ? '⏹ Stop Voice' : '🔊 Sing Along'}
              </button>

              <button
                type="button"
                className="player-btn clap-btn"
                onClick={handleClapHands}
                title="Clap your hands and release stars!"
              >
                👏 Clap Hands!
              </button>
            </div>

            {/* Big Sing-Along Lyrics */}
            <div className="player-lyrics-card">
              <span className="lyrics-tag">🎶 Sing-Along Words:</span>
              <ul className="lyrics-lines">
                {selectedSong.lyrics.map((line, idx) => (
                  <li key={idx} className="lyrics-line">
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Prompt */}
            {selectedSong.actionPrompt && (
              <div className="player-action-prompt">
                <span className="action-icon">💡</span>
                <span>{selectedSong.actionPrompt}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurserySongsModal;
