import { useState } from 'react';
import { quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import './quiz.css';

const Quiz = ({ quiz, lesson, onClose }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
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
      setResult(res.data.data.attempt);
      toast.success(
        res.data.data.attempt.passed
          ? '🎉 Congratulations! You passed the quiz!'
          : 'Keep practicing! You can retake the quiz anytime.'
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
            <div className="result-actions">
              <button className="quiz-retry-btn" onClick={() => setResult(null)}>
                Retake Quiz
              </button>
              <button className="quiz-finish-btn" onClick={onClose}>
                Done
              </button>
            </div>
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
