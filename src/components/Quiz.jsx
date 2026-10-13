import { useState } from 'react';
import { quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import './Quiz.css';

const Quiz = ({ quiz, lesson, onClose }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const toast = useToast();

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
      toast.success(
        data.attempt.passed
          ? '🎉 Congratulations! You passed the quiz!'
          : 'Keep practicing! Review your answers below and retake anytime.'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal-container">
        <div className="quiz-modal-header">
          <div>
            <h2>{quiz.title || `Quiz: ${lesson?.title}`}</h2>
            <span className="quiz-passing-score">Passing Score: {quiz.passingScore}%</span>
          </div>
          <button className="quiz-close-btn" onClick={onClose}>✕</button>
        </div>

        {result ? (
          <div className="quiz-result-card">
            <div className="result-icon">{result.passed ? '🏆' : '📖'}</div>
            <div className={`result-badge ${result.passed ? 'passed' : 'failed'}`}>
              {result.passed ? '🎉 PASSED!' : 'Keep Practising!'}
            </div>
            <h3>Your Score: {result.score}%</h3>
            <p>
              You correctly answered {result.correct} out of {result.total} questions.
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
                {showReview ? 'Hide Answer Review' : '🔍 Review Explanations'}
              </button>
              <button
                className="quiz-retry-btn"
                onClick={() => {
                  setResult(null);
                  setSelectedAnswers({});
                  setShowReview(false);
                }}
              >
                Retake Quiz
              </button>
              <button className="quiz-finish-btn" onClick={onClose}>
                Done
              </button>
            </div>

            {showReview && feedback.length > 0 && (
              <div className="quiz-feedback-list">
                <h4>Answer Review & Explanations</h4>
                {feedback.map((item, idx) => (
                  <div
                    key={idx}
                    className={`feedback-item ${item.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <p className="feedback-q">
                      <strong>Q{idx + 1}:</strong> {item.question}
                    </p>
                    <div className="feedback-options">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = item.userAnswer === optIdx;
                        const isRight = item.correctIndex === optIdx;
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
                          </div>
                        );
                      })}
                    </div>
                    {item.explanation && (
                      <p className="feedback-explanation">
                        💡 <strong>Explanation:</strong> {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="quiz-questions-list">
            {(quiz.questions || []).map((q, qIdx) => (
              <div key={q._id || qIdx} className="quiz-question-item">
                <p className="question-text">
                  <strong>Q{qIdx + 1}.</strong> {q.question}
                </p>
                <div className="options-grid">
                  {(q.options || []).map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={`option-label ${
                        selectedAnswers[qIdx] === optIdx ? 'selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${qIdx}`}
                        checked={selectedAnswers[qIdx] === optIdx}
                        onChange={() => handleSelectOption(qIdx, optIdx)}
                      />
                      <span className="option-text">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="quiz-footer">
              <button
                className="quiz-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Grading...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
