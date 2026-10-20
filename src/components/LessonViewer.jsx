import { useState, useEffect } from 'react';
import { lessonsAPI, quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { launchConfetti } from '../utils/confetti';
import { soundEffects } from '../utils/audio';
import './LessonViewer.css';

const LessonViewer = ({ courseId, onOpenQuiz }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState(null);
  const [bulkQuizStatus, setBulkQuizStatus] = useState({});
  const [quizList, setQuizList] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [courseProgress, setCourseProgress] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Instructional redesign tabs: 'notes', 'flashcards', 'scenario', 'pdf'
  const [activeTab, setActiveTab] = useState('notes');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardHint, setShowCardHint] = useState(false);

  // Scenario state
  const [scenarioAnswer, setScenarioAnswer] = useState(null);
  const [scenarioSubmitted, setScenarioSubmitted] = useState(false);

  // Web Speech API Read-Aloud state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toast = useToast();

  // Load quizzes for chapters
  useEffect(() => {
    const loadQuizzes = async () => {
      if (lessons.length === 0) return;
      setLoadingQuizzes(true);
      const items = [];
      for (const lesson of lessons) {
        if (!bulkQuizStatus[lesson._id]?.hasQuiz) continue;
        try {
          const res = await quizzesAPI.getByLesson(lesson._id);
          if (res.data?.data?.quiz) {
            items.push({ lesson, quiz: res.data.data.quiz });
          }
        } catch (e) {
          void e;
        }
      }
      setQuizList(items);
      setLoadingQuizzes(false);
    };
    loadQuizzes();
  }, [lessons, bulkQuizStatus]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await lessonsAPI.getByCourse(courseId);
        const list = res.data.data.lessons || [];
        setLessons(list);
        setCompletedLessons(res.data.data.completedLessons || []);
        setCourseProgress(res.data.data.progress || 0);

        if (list.length > 0) {
          setSelectedLesson(list[0]);
          try {
            const bulkRes = await quizzesAPI.getBulkStatus(list.map((l) => l._id));
            setBulkQuizStatus(bulkRes.data.data);
          } catch (e) {
            void e;
          }
        }
      } catch (err) {
        toast.error('Failed to load lessons for this course');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchLessons();
    }
  }, [courseId, toast]);

  useEffect(() => {
    const fetchQuizInfo = async () => {
      if (!selectedLesson) return;
      try {
        const res = await quizzesAPI.getByLesson(selectedLesson._id);
        setQuizInfo(res.data.data);
      } catch {
        setQuizInfo(null);
      }
    };
    fetchQuizInfo();
    // Reset tab and interactive states when switching lesson
    setActiveTab('notes');
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setShowCardHint(false);
    setScenarioAnswer(null);
    setScenarioSubmitted(false);
    stopSpeech();
  }, [selectedLesson]);

  // Audio Read-Aloud Narration
  const startSpeech = () => {
    if (!selectedLesson || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.info('Audio read-aloud is not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const overviewText = selectedLesson.studyNotes?.overview || selectedLesson.summary || '';
    const pointsText = (selectedLesson.studyNotes?.keyPoints || []).join('. ');
    const fullText = `Chapter ${selectedLesson.chapter}: ${selectedLesson.title}. ${overviewText}. Key points: ${pointsText}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9; // Friendly, clear pace for kids
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson) return;
    setMarkingComplete(true);
    try {
      const res = await lessonsAPI.markComplete(selectedLesson._id);
      setCompletedLessons(res.data.data.completedLessons || [selectedLesson._id]);
      setCourseProgress(res.data.data.progress || 100);
      launchConfetti(3500);
      soundEffects.playVictoryChime();
      toast.success('🎉 Great job! Chapter marked as completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return <div className="lesson-viewer-loading">✨ Loading Course Lessons &amp; Activities...</div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="lesson-viewer-empty">
        <h3>📚 No lessons available yet</h3>
        <p>Lessons and AI study notes will appear here once uploaded by your instructor.</p>
      </div>
    );
  }

  const isCurrentCompleted = selectedLesson && completedLessons.includes(selectedLesson._id);
  const flashcards = selectedLesson?.flashcards || [];
  const scenario = selectedLesson?.scenarioChallenge;
  const objectives = selectedLesson?.learningObjectives || [
    'Read and understand the core chapter principles.',
    'Test your memory with the flashcard challenges.',
    'Solve the real-world scenario decision problem.',
    'Score 75% or higher on the AI interactive quiz.'
  ];

  const handleNextCard = () => {
    setIsCardFlipped(false);
    setShowCardHint(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setShowCardHint(false);
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleSelectScenario = (index) => {
    setScenarioAnswer(index);
    setScenarioSubmitted(true);
    if (scenario && index === scenario.correctAnswer) {
      launchConfetti(2500);
      soundEffects.playVictoryChime();
    } else {
      soundEffects.playTryAgainChime();
    }
  };

  return (
    <div className="lesson-viewer-container">
      {/* ── Left Sidebar: Chapter Stepper ──────────────── */}
      <div className="lesson-sidebar">
        <div className="sidebar-header-progress">
          <h3>Course Modules</h3>
          <div className="sidebar-progress-badge">
            <span>{courseProgress}% Complete</span>
            <div className="sidebar-progress-bar">
              <div
                className="sidebar-progress-fill"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>
        </div>

        <ul className="chapter-list">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson._id);
            return (
              <li
                key={lesson._id}
                className={`chapter-item ${selectedLesson?._id === lesson._id ? 'active' : ''}`}
                onClick={() => setSelectedLesson(lesson)}
              >
                <span className="chapter-num">
                  {isCompleted ? '✅' : `Ch ${lesson.chapter || 1}`}
                </span>
                <span className="chapter-title">{lesson.title}</span>
                {bulkQuizStatus[lesson._id]?.hasQuiz && (
                  <span className="chapter-quiz-badge">🎯 Quiz</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Right Content Area ─────────────────────────── */}
      <div className="lesson-main">
        {selectedLesson && (
          <>
            {/* ── Lesson Title Bar & Audio Narration ─────── */}
            <div className="lesson-header">
              <div>
                <span className="module-tag">Module {selectedLesson.chapter || 1}</span>
                <h2>{selectedLesson.title}</h2>
                <div className="lesson-metrics-chips">
                  <span className="metric-chip">
                    ⏱️ ~{selectedLesson.readingTime || 4} min read
                  </span>
                  {selectedLesson.wordCount > 0 && (
                    <span className="metric-chip">
                      📝 {selectedLesson.wordCount.toLocaleString()} words
                    </span>
                  )}
                  {isCurrentCompleted && (
                    <span className="metric-chip completed-chip">
                      ✅ Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="lesson-actions">
                {/* Audio Read Aloud button */}
                <button
                  type="button"
                  className={`audio-read-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={isSpeaking ? stopSpeech : startSpeech}
                  title="Listen to lesson notes read out loud"
                >
                  {isSpeaking ? '⏹️ Stop Voice' : '🔊 Listen to Lesson'}
                </button>

                <button
                  className={`mark-complete-btn ${isCurrentCompleted ? 'is-completed' : ''}`}
                  onClick={handleMarkComplete}
                  disabled={markingComplete || isCurrentCompleted}
                >
                  {isCurrentCompleted ? '✅ Completed' : markingComplete ? 'Saving...' : '✓ Mark Done'}
                </button>

                {quizInfo?.hasQuiz && (
                  <button
                    className="take-quiz-btn"
                    onClick={() => onOpenQuiz(selectedLesson, quizInfo.quiz)}
                  >
                    🎯 Take Quiz
                  </button>
                )}
              </div>
            </div>

            {/* ── Learning Objectives Callout ("I Can..." Goals) ── */}
            <div className="objectives-card">
              <div className="objectives-header">
                <span className="objectives-icon">🎯</span>
                <div>
                  <h4>Learning Objectives</h4>
                  <p>By the end of this chapter, you will be able to:</p>
                </div>
              </div>
              <ul className="objectives-list">
                {objectives.map((obj, i) => (
                  <li key={i}>
                    <span className="obj-check">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Interactive Redesign Tabs Navigation ───── */}
            <div className="instructional-nav-tabs">
              <button
                className={`inst-tab ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                📖 1. Story &amp; Notes
              </button>
              <button
                className={`inst-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setActiveTab('flashcards')}
              >
                🗂️ 2. Flashcards {flashcards.length > 0 && `(${flashcards.length})`}
              </button>
              <button
                className={`inst-tab ${activeTab === 'scenario' ? 'active' : ''}`}
                onClick={() => setActiveTab('scenario')}
              >
                🤔 3. Real-World Challenge
              </button>
              <button
                className={`inst-tab ${activeTab === 'pdf' ? 'active' : ''}`}
                onClick={() => setActiveTab('pdf')}
              >
                📄 4. Study Sheet PDF
              </button>
            </div>

            {/* ── Tab 1: Story & Study Notes ─────────────── */}
            {activeTab === 'notes' && (
              <div className="study-notes-card">
                <div className="study-notes-header">
                  <div className="study-notes-badge">🤖 AI Study Summary</div>
                  <span className="study-notes-tag">Chunked Key Takeaways</span>
                </div>

                {selectedLesson.studyNotes ? (
                  <>
                    {selectedLesson.studyNotes.overview && (
                      <p className="study-notes-overview">
                        {selectedLesson.studyNotes.overview}
                      </p>
                    )}

                    {selectedLesson.studyNotes.keyPoints?.length > 0 && (
                      <div className="study-section">
                        <h4 className="study-section-title">📌 Key Takeaways</h4>
                        <ul className="study-keypoints">
                          {selectedLesson.studyNotes.keyPoints.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedLesson.studyNotes.keyFacts?.length > 0 && (
                      <div className="study-section">
                        <h4 className="study-section-title">💡 Core Facts &amp; Rules</h4>
                        <div className="study-facts">
                          {selectedLesson.studyNotes.keyFacts.map((f, i) => (
                            <span key={i} className="study-fact-chip">✨ {f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedLesson.studyNotes.vocabulary?.length > 0 && (
                      <div className="study-section">
                        <h4 className="study-section-title">🔑 Essential Vocabulary</h4>
                        <div className="study-vocab">
                          {selectedLesson.studyNotes.vocabulary.map((v, i) => (
                            <div key={i} className="study-vocab-item">
                              <span className="study-vocab-term">{v.term}</span>
                              <span className="study-vocab-def">{v.definition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="summary-content">
                    {(selectedLesson.summary || '').split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                )}

                <div className="notes-next-prompt">
                  <span>Ready to test your memory?</span>
                  <button className="prompt-tab-btn" onClick={() => setActiveTab('flashcards')}>
                    🗂️ Flip the Flashcards →
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab 2: Interactive Flashcards ───────────── */}
            {activeTab === 'flashcards' && (
              <div className="flashcards-wrapper">
                {flashcards.length > 0 ? (
                  <div className="flashcards-deck">
                    <div className="flashcard-deck-header">
                      <span className="card-counter">
                        Card {currentCardIndex + 1} of {flashcards.length}
                      </span>
                      <button
                        className="hint-toggle-btn"
                        onClick={() => setShowCardHint(!showCardHint)}
                      >
                        💡 {showCardHint ? 'Hide Hint' : 'Show Hint'}
                      </button>
                    </div>

                    <div
                      className={`flashcard-3d ${isCardFlipped ? 'flipped' : ''}`}
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                    >
                      <div className="flashcard-inner">
                        {/* Front of card */}
                        <div className="flashcard-face flashcard-front">
                          <span className="card-side-tag">Question</span>
                          <p className="card-main-text">
                            {flashcards[currentCardIndex].front}
                          </p>
                          {showCardHint && flashcards[currentCardIndex].hint && (
                            <span className="card-hint-text">
                              💡 Hint: {flashcards[currentCardIndex].hint}
                            </span>
                          )}
                          <span className="card-flip-prompt">🔄 Click card to see answer</span>
                        </div>

                        {/* Back of card */}
                        <div className="flashcard-face flashcard-back">
                          <span className="card-side-tag back-tag">Answer &amp; Explanation</span>
                          <p className="card-main-text answer-text">
                            {flashcards[currentCardIndex].back}
                          </p>
                          <span className="card-flip-prompt">🔄 Click card to flip back</span>
                        </div>
                      </div>
                    </div>

                    <div className="flashcard-controls">
                      <button className="card-nav-btn" onClick={handlePrevCard}>
                        ◀ Previous
                      </button>
                      <button
                        className="card-flip-action-btn"
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                      >
                        🔄 {isCardFlipped ? 'Show Front' : 'Flip Card'}
                      </button>
                      <button className="card-nav-btn" onClick={handleNextCard}>
                        Next ▶
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-interactive-box">
                    <p>No flashcards created for this chapter yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 3: Real-World Scenario Challenge ───── */}
            {activeTab === 'scenario' && (
              <div className="scenario-wrapper">
                {scenario ? (
                  <div className="scenario-card">
                    <div className="scenario-header">
                      <span className="scenario-emoji">🛒</span>
                      <div>
                        <h3>{scenario.title}</h3>
                        <span className="scenario-tag">Practical Rwanda Application</span>
                      </div>
                    </div>

                    <p className="scenario-story">{scenario.story}</p>

                    <div className="scenario-question-box">
                      <p className="scenario-prompt">🤔 <strong>Question:</strong> {scenario.question}</p>

                      <div className="scenario-options-grid">
                        {scenario.options.map((option, optIdx) => {
                          const isSelected = scenarioAnswer === optIdx;
                          const isCorrect = optIdx === scenario.correctAnswer;
                          let btnClass = 'scenario-option-btn';
                          if (scenarioSubmitted && isSelected) {
                            btnClass += isCorrect ? ' correct' : ' incorrect';
                          } else if (scenarioSubmitted && isCorrect) {
                            btnClass += ' correct';
                          }

                          return (
                            <button
                              key={optIdx}
                              className={btnClass}
                              onClick={() => handleSelectScenario(optIdx)}
                            >
                              <span className="opt-marker">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {scenarioSubmitted && (
                      <div className={`scenario-feedback-card ${scenarioAnswer === scenario.correctAnswer ? 'success' : 'retry'}`}>
                        <h4>
                          {scenarioAnswer === scenario.correctAnswer
                            ? '🎉 Brilliant Decision!'
                            : '🤔 Good Thinking — Review the Solution:'}
                        </h4>
                        <p>{scenario.explanation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-interactive-box">
                    <p>No scenario challenge added for this chapter yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 4: Study Sheet PDF ─────────────────── */}
            {activeTab === 'pdf' && (
              <div className="pdf-preview-card">
                <div className="pdf-card-header">
                  <div>
                    <h3>📄 Chapter Study Sheet &amp; Original PDF</h3>
                    <p>Curriculum-aligned reference material for printing and offline review.</p>
                  </div>
                  <a
                    href={selectedLesson.pdfUrl || lessonsAPI.getPdfUrl(selectedLesson._id)}
                    target="_blank"
                    rel="noreferrer"
                    className="pdf-download-action-btn"
                  >
                    ⬇️ Download Full PDF
                  </a>
                </div>

                <div className="pdf-embed-box">
                  <iframe
                    src={selectedLesson.pdfUrl || lessonsAPI.getPdfUrl(selectedLesson._id)}
                    title={`PDF viewer for ${selectedLesson.title}`}
                    className="pdf-iframe"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
