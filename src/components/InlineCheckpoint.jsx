import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';
import { soundEffects } from '../utils/audio';
import './InlineCheckpoint.css';

/**
 * InlineCheckpoint
 * Interactive micro-quiz inserted directly inside chapters to break up long reading.
 * Provides instant feedback, confetti, and sound effects for primary learners.
 */
const InlineCheckpoint = ({
  checkpointNumber = 1,
  question,
  options = [],
  correctIndex = 0,
  explanation = '',
  hint = '',
  onPassed,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shakeIdx, setShakeIdx] = useState(null);

  const handleSelect = (idx) => {
    if (isAnswered && selectedIdx === correctIndex) return;

    setSelectedIdx(idx);
    if (idx === correctIndex) {
      setIsAnswered(true);
      launchConfetti(2800);
      soundEffects.playVictoryChime();
      if (onPassed) onPassed(checkpointNumber);
    } else {
      soundEffects.playTryAgainChime();
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 500);
    }
  };

  const isPassed = isAnswered && selectedIdx === correctIndex;

  return (
    <div className={`inline-checkpoint-card ${isPassed ? 'passed' : ''}`}>
      <div className="checkpoint-top-bar">
        <div className="checkpoint-badge">
          <span className="badge-icon">🎯</span>
          <span className="badge-title">Brain Checkpoint #{checkpointNumber}</span>
        </div>
        {hint && !isPassed && (
          <button
            type="button"
            className="checkpoint-hint-btn"
            onClick={() => setShowHint(!showHint)}
          >
            💡 {showHint ? 'Hide Hint' : 'Need a Hint?'}
          </button>
        )}
      </div>

      <h4 className="checkpoint-question">{question}</h4>

      {showHint && hint && (
        <div className="checkpoint-hint-box">
          <span className="hint-label">💡 Clue:</span> {hint}
        </div>
      )}

      <div className="checkpoint-options-grid">
        {options.map((opt, idx) => {
          let btnClass = 'checkpoint-opt-btn';
          if (isPassed && idx === correctIndex) {
            btnClass += ' correct';
          } else if (selectedIdx === idx && idx !== correctIndex) {
            btnClass += ' incorrect';
          }
          if (shakeIdx === idx) {
            btnClass += ' shake';
          }

          return (
            <button
              key={idx}
              type="button"
              className={btnClass}
              onClick={() => handleSelect(idx)}
              disabled={isPassed}
            >
              <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="opt-text">{opt}</span>
              {isPassed && idx === correctIndex && <span className="opt-status-icon">⭐</span>}
            </button>
          );
        })}
      </div>

      {/* Success banner */}
      {isPassed && (
        <div className="checkpoint-success-box">
          <span className="success-emoji">🎉</span>
          <div className="success-text">
            <strong>Awesome work! You got it right!</strong>
            {explanation && <p>{explanation}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineCheckpoint;
