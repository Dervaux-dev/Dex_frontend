import { useState, useEffect } from 'react';
import studyMusic from '../utils/studyMusic';
import './StudyMusicPlayer.css';

const StudyMusicPlayer = ({ isSpeaking = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(12); // Default 12% low volume
  const [mode, setMode] = useState('piano');
  const [expanded, setExpanded] = useState(false);

  // If text-to-speech voice is currently speaking, duck/pause background music so they don't clash
  useEffect(() => {
    if (isSpeaking && isPlaying) {
      studyMusic.stop();
    } else if (!isSpeaking && isPlaying) {
      studyMusic.start(mode);
    }
  }, [isSpeaking, isPlaying, mode]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      studyMusic.stop();
      setIsPlaying(false);
    } else {
      studyMusic.setVolume(volume / 100);
      studyMusic.start(mode);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    studyMusic.setVolume(val / 100);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    studyMusic.setMode(newMode);
    if (isPlaying) {
      studyMusic.stop();
      studyMusic.start(newMode);
    }
  };

  useEffect(() => {
    return () => {
      studyMusic.stop();
    };
  }, []);

  return (
    <div className={`study-music-container ${expanded ? 'expanded' : ''} ${isPlaying ? 'playing' : ''}`}>
      <div className="study-music-pill">
        <button
          type="button"
          className="study-music-toggle-btn"
          onClick={handleTogglePlay}
          title={isPlaying ? 'Pause background study instrumentals' : 'Play calm background study music (low volume)'}
        >
          <span className={`music-note-icon ${isPlaying ? 'pulse-anim' : ''}`}>
            {isPlaying ? '🎵' : '💤'}
          </span>
          <span className="music-status-text">
            {isPlaying ? 'Study Beats: ON' : 'Study Music'}
          </span>
        </button>

        <button
          type="button"
          className="music-expand-toggle"
          onClick={() => setExpanded(!expanded)}
          title="Adjust volume and theme"
          aria-label="Sound settings"
        >
          ⚙️
        </button>
      </div>

      {expanded && (
        <div className="study-music-panel">
          <div className="music-panel-header">
            <span>🎧 Focus Instrumentals</span>
            <span className="volume-display">{volume}% Vol</span>
          </div>

          <div className="volume-slider-row">
            <span className="vol-icon">🔉</span>
            <input
              type="range"
              min="2"
              max="30"
              value={volume}
              onChange={handleVolumeChange}
              className="study-volume-slider"
              aria-label="Study music volume"
            />
            <span className="vol-icon">🔊</span>
          </div>

          <div className="music-presets-row">
            <button
              type="button"
              className={`preset-btn ${mode === 'piano' ? 'active' : ''}`}
              onClick={() => handleModeChange('piano')}
            >
              🎹 Piano Chimes
            </button>
            <button
              type="button"
              className={`preset-btn ${mode === 'nature' ? 'active' : ''}`}
              onClick={() => handleModeChange('nature')}
            >
              🌿 Nature Bells
            </button>
            <button
              type="button"
              className={`preset-btn ${mode === 'lofi' ? 'active' : ''}`}
              onClick={() => handleModeChange('lofi')}
            >
              ☕ Cozy Lofi
            </button>
          </div>

          <p className="music-hint-text">
            ✨ Kept at gentle volume so you can read and focus peacefully!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyMusicPlayer;
