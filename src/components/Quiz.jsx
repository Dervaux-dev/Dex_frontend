import { useState } from 'react';
import { quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { launchConfetti } from '../utils/confetti';
import { soundEffects } from '../utils/audio';
import './Quiz.css';

const Quiz = ({ quiz, lesson, onClose }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [soundOn, setSoundOn] = useState(soundEffects.isSoundEnabled());
  const toast = useToast();

  const handleToggleSound = () => {
    const newState = soundEffects.toggleSound();
    setSoundOn(newState);
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    const questions = quiz.questions || [];
    const answerArray = questions.map((_, idx) =>
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    );

    if (answerArray.includes(-1)) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await quizzesAPI.submit(quiz._id, { answers: answerArray });
      const data = res.data.data;
      setResult(data.attempt);
      setFeedback(data.feedback || []);
      setCourseProgress(data.courseProgress);

      if (data.attempt.passed) {
        launchConfetti(4500);
        soundEffects.playVictoryChime();
        toast.success('🎉 Fantastic Job! You passed the quiz!');
      } else {
        soundEffects.playTryAgainChime();
        toast.info('Good try! Review the answers and take it again to earn your stars! ⭐');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getStarRating = (score) => {
    if (score === 100) return '⭐⭐⭐ Perfect 3-Star Score!';
    if (score >= 80) return '⭐⭐ Great 2-Star Score!';
    if (score >= 70) return '⭐ Good 1-Star Score!';
    return '🌟 Practice makes perfect!';
  };

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal-container">
        <div className="quiz-modal-header">
          <div>
            <h2>{quiz.title || `Quiz: ${lesson?.title}`}</h2>
            <div className="quiz-header-badges">
              <span className="quiz-passing-score">🎯 Passing Score: {quiz.passingScore}%</span>
              <button 
                type="button" 
                className="quiz-sound-toggle-btn"
                onClick={handleToggleSound}
                title="Toggle Sound Effects"
              >
                {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
              </button>
            </div>
          </div>
          <button className="quiz-close-btn" onClick={onClose}>✕</button>
        </div>

        {result ? (
          <div className="quiz-result-card">
            <div className={`result-icon ${result.passed ? 'celebrate-bounce' : ''}`}>
              {result.passed ? '🏆' : '📖'}
            </div>
            
            <div className={`result-badge ${result.passed ? 'passed' : 'failed'}`}>
              {result.passed ? '🎉 PASSED — YOU DID IT!' : 'Keep Practicing!'}
            </div>

            <div className="result-stars-banner">
              {getStarRating(result.score)}
            </div>

            <h3 className="result-score-heading">Your Score: {result.score}%</h3>
            <p className="result-score-sub">
              You correctly answered <strong>{result.correct}</strong> out of <strong>{result.total}</strong> questions.
            </p>

            {courseProgress && (
              <div className="quiz-progress-notice">
                <span>🎓 Course Progress: <strong>{courseProgress.progress}%</strong></span>
                {courseProgress.status === 'completed' && (
                  <span className="course-completed-badge">🎉 Course Completed!</span>
                )}
              </div>
            )}

            <div className="result-actions">
              <button
                className="quiz-review-toggle-btn"
                onClick={() => setShowReview(!showReview)}
              >
                {showReview ? 'Hide Explanations' : '🔍 Review Explanations'}
              </button>
              <button
                className="quiz-retry-btn"
                onClick={() => {
                  setResult(null);
                  setSelectedAnswers({});
                  setShowReview(false);
                }}
              >
                🔄 Retake Quiz
              </button>
              <button className="quiz-finish-btn" onClick={onClose}>
                ✨ Done
              </button>
            </div>

            {showReview && feedback.length > 0 && (
              <div className="quiz-feedback-list">
                <h4>Answer Review &amp; Explanations</h4>
                {feedback.map((item, idx) => {
                  const opts = item.options || quiz.questions[idx]?.options || [];
                  return (
                    <div
                      key={idx}
                      className={`feedback-item ${item.isCorrect ? 'correct' : 'incorrect'}`}
                    >
                      <p className="feedback-q">
                        <strong>Q{idx + 1}:</strong> {item.question}
                      </p>
                      <div className="feedback-options">
                        {opts.map((opt, optIdx) => {
                          const isChosen = item.userAnswer === optIdx;
                          const isRight = (item.correctAnswer !== undefined ? item.correctAnswer : item.correctIndex) === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`feedback-opt ${
                                isRight ? 'is-right' : isChosen ? 'is-wrong' : ''
                              }`}
                            >
                              <span>
                                {isRight ? '✅ ' : isChosen ? '❌ ' : '• '}
                                {opt}
                              </span>
                              {isChosen && !isRight && (
                                <span className="your-answer-tag">(Your Answer)</span>
                              )}
                              {isRight && (
                                <span className="correct-answer-tag">(Correct Answer)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {item.explanation && (
                        <p className="feedback-explanation">
                          💡 <strong>Why:</strong> {item.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="quiz-questions-body">
            {(quiz.questions || []).map((q, qIdx) => (
              <div key={qIdx} className="quiz-question-card">
                <span className="question-number">Question {qIdx + 1} of {quiz.questions.length}</span>
                <p className="question-text">{q.question}</p>
                <div className="options-grid">
                  {(q.options || []).map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        className={`option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                      >
                        <span className="opt-letter">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="opt-text">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="quiz-footer-actions">
              <button
                type="button"
                className="quiz-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '✨ Grading with AI...' : '🚀 Submit Quiz for Instant AI Grading'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
