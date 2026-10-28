import { useState, useEffect, useMemo, useRef } from 'react';
import { lessonsAPI, quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { launchConfetti } from '../utils/confetti';
import { soundEffects } from '../utils/audio';
import './LessonViewer.css';

const LessonViewer = ({ courseId, onOpenQuiz, lastCompletedQuiz }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState(null);
  const [bulkQuizStatus, setBulkQuizStatus] = useState({});
  const [completedLessons, setCompletedLessons] = useState([]);
  const [passedQuizzes, setPassedQuizzes] = useState([]);
  const [courseProgress, setCourseProgress] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Layout states (matching Picture 3)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [questionAccordionOpen, setQuestionAccordionOpen] = useState(false);
  const [feedbackAccordionOpen, setFeedbackAccordionOpen] = useState(false);

  // Interactive tabs: 'notes', 'flashcards', 'scenario', 'pdf'
  const [activeTab, setActiveTab] = useState('notes');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardHint, setShowCardHint] = useState(false);

  // Scenario state
  const [scenarioAnswer, setScenarioAnswer] = useState(null);
  const [scenarioSubmitted, setScenarioSubmitted] = useState(false);

  // PDF blob and download states
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Web Speech API Read-Aloud state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Question & Feedback accordion states
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [askingAi, setAskingAi] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const toast = useToast();
  const pdfBlobRef = useRef(null);

  // Fetch Lessons and initial progress
  useEffect(() => {
    let isMounted = true;
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const res = await lessonsAPI.getByCourse(courseId);
        const list = res.data?.data?.lessons || [];
        const completed = res.data?.data?.completedLessons || [];
        const passed = res.data?.data?.passedQuizzes || [];

        if (isMounted) {
          setLessons(list);
          setCompletedLessons(completed);
          setPassedQuizzes(passed);

          if (list.length > 0) {
            setSelectedLesson(list[0]);
            try {
              const bulkRes = await quizzesAPI.getBulkStatus(list.map((l) => l._id));
              setBulkQuizStatus(bulkRes.data?.data || {});
            } catch (e) {
              void e;
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          toast.error('Failed to load lessons for this course');
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (courseId) {
      fetchLessons();
    }

    return () => {
      isMounted = false;
    };
  }, [courseId, toast]);

  // Sync quiz completion when user submits quiz modal
  useEffect(() => {
    if (lastCompletedQuiz?.passed && lastCompletedQuiz?.quizId) {
      setPassedQuizzes((prev) => {
        if (!prev.includes(lastCompletedQuiz.quizId)) {
          return [...prev, lastCompletedQuiz.quizId];
        }
        return prev;
      });
      if (lastCompletedQuiz.courseProgress?.progress !== undefined) {
        setCourseProgress(lastCompletedQuiz.courseProgress.progress);
      }
    }
  }, [lastCompletedQuiz]);

  // Fetch quiz for current lesson
  useEffect(() => {
    let isMounted = true;
    const fetchQuizInfo = async () => {
      if (!selectedLesson) return;
      try {
        const res = await quizzesAPI.getByLesson(selectedLesson._id);
        if (isMounted) setQuizInfo(res.data?.data || null);
      } catch {
        if (isMounted) setQuizInfo(null);
      }
    };

    fetchQuizInfo();
    setActiveTab('notes');
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setShowCardHint(false);
    setScenarioAnswer(null);
    setScenarioSubmitted(false);
    setUserQuestion('');
    setAiAnswer(null);
    stopSpeech();

    return () => {
      isMounted = false;
    };
  }, [selectedLesson]);

  // Load authenticated PDF blob safely
  useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      if (!selectedLesson) return;
      setLoadingPdf(true);

      // Clean up previous blob
      if (pdfBlobRef.current && pdfBlobRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(pdfBlobRef.current);
        pdfBlobRef.current = null;
      }

      try {
        if (selectedLesson.pdfUrl && selectedLesson.pdfUrl.startsWith('http') && !selectedLesson.pdfUrl.includes('/api/')) {
          if (isMounted) {
            setPdfBlobUrl(selectedLesson.pdfUrl);
            pdfBlobRef.current = selectedLesson.pdfUrl;
          }
        } else {
          const blobUrl = await lessonsAPI.getPdfBlobUrl(selectedLesson._id);
          if (isMounted) {
            setPdfBlobUrl(blobUrl);
            pdfBlobRef.current = blobUrl;
          }
        }
      } catch (err) {
        console.warn('PDF blob loading fallback to direct url:', err);
        const directUrl = lessonsAPI.getPdfUrl(selectedLesson._id);
        if (isMounted) {
          setPdfBlobUrl(directUrl);
          pdfBlobRef.current = directUrl;
        }
      } finally {
        if (isMounted) setLoadingPdf(false);
      }
    };

    if (activeTab === 'pdf') {
      loadPdf();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedLesson, activeTab]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobRef.current && pdfBlobRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(pdfBlobRef.current);
      }
    };
  }, []);

  // Build complete checklist items: all lessons + all quizzes
  const checklistItems = useMemo(() => {
    const items = [];
    lessons.forEach((l) => {
      const isLessonDone = completedLessons.includes(l._id);
      items.push({
        type: 'lesson',
        id: `lesson-${l._id}`,
        lessonId: l._id,
        title: l.title,
        chapter: l.chapter,
        isCompleted: isLessonDone,
        lesson: l,
      });

      const quizMeta = bulkQuizStatus[l._id];
      if (quizMeta?.hasQuiz || l.hasQuiz) {
        const quizId = quizMeta?.quizId || `quiz-${l._id}`;
        const isQuizPassed = passedQuizzes.includes(quizId) || (lastCompletedQuiz?.passed && lastCompletedQuiz?.lessonId === l._id);
        items.push({
          type: 'quiz',
          id: `quiz-item-${l._id}`,
          quizId,
          lessonId: l._id,
          title: `Quiz: ${l.title}`,
          isCompleted: Boolean(isQuizPassed),
          lesson: l,
        });
      }
    });
    return items;
  }, [lessons, completedLessons, bulkQuizStatus, passedQuizzes, lastCompletedQuiz]);

  // Recalculate dynamic checklist progress
  useEffect(() => {
    if (checklistItems.length === 0) {
      setCourseProgress(0);
      return;
    }
    const completedCount = checklistItems.filter((i) => i.isCompleted).length;
    const computed = Math.round((completedCount / checklistItems.length) * 100);
    setCourseProgress(computed);
  }, [checklistItems]);

  // Audio Read-Aloud Narration
  const startSpeech = () => {
    if (!selectedLesson || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.info('Audio read-aloud is not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const overviewText = selectedLesson.studyNotes?.overview || selectedLesson.summary || '';
    const pointsText = (selectedLesson.studyNotes?.keyPoints || []).join('. ');
    const fullText = `Chapter ${selectedLesson.chapter || 1}: ${selectedLesson.title}. ${overviewText}. Key points: ${pointsText}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9;
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

  // Toggle lesson complete
  const handleToggleLessonComplete = async (lessonToToggle) => {
    if (!lessonToToggle) return;
    const targetId = lessonToToggle._id;
    const isCurrentlyDone = completedLessons.includes(targetId);
    setMarkingComplete(true);

    try {
      const res = await lessonsAPI.markComplete(targetId, true);
      const newCompleted = res.data?.data?.completedLessons || (
        isCurrentlyDone
          ? completedLessons.filter((id) => id !== targetId)
          : [...completedLessons, targetId]
      );
      setCompletedLessons(newCompleted);

      if (!isCurrentlyDone) {
        launchConfetti(3500);
        soundEffects.playVictoryChime();
        toast.success(`🎉 Great job! "${lessonToToggle.title}" marked completed!`);
      } else {
        toast.info(`"${lessonToToggle.title}" marked incomplete.`);
      }
    } catch (err) {
      // Local fallback for smooth guest/demo resilience
      const updated = isCurrentlyDone
        ? completedLessons.filter((id) => id !== targetId)
        : [...completedLessons, targetId];
      setCompletedLessons(updated);
      if (!isCurrentlyDone) {
        launchConfetti(2500);
        soundEffects.playVictoryChime();
        toast.success(`🎉 Marked completed!`);
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  // Download PDF file reliably via Blob
  const handleDownloadPdf = async () => {
    if (!selectedLesson) return;
    setDownloadingPdf(true);
    try {
      await lessonsAPI.downloadPdf(selectedLesson._id, `${selectedLesson.title || 'lesson'}.pdf`);
      toast.success('📥 PDF download started!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Could not download PDF. Opening in new tab instead.');
      window.open(lessonsAPI.getPdfUrl(selectedLesson._id), '_blank');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // AI Tutor Quick Question
  const handleAskAiTutor = (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    setAskingAi(true);

    setTimeout(() => {
      const q = userQuestion.toLowerCase();
      let answer = '';
      if (selectedLesson?.studyNotes?.keyPoints?.length > 0) {
        const found = selectedLesson.studyNotes.keyPoints.find((p) =>
          q.split(' ').some((word) => word.length > 3 && p.toLowerCase().includes(word))
        );
        answer = found || selectedLesson.studyNotes.keyPoints[0];
      }
      if (!answer) {
        answer = selectedLesson?.studyNotes?.overview || selectedLesson?.summary ||
          `Great question about ${selectedLesson?.title}! Remember to check the key takeaways and flashcards for extra tips.`;
      }

      setAiAnswer(`🤖 Dex AI Tutor: "${answer}"`);
      setAskingAi(false);
    }, 600);
  };

  // Submit Feedback
  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    launchConfetti(2500);
    soundEffects.playVictoryChime();
    toast.success('❤️ Thank you! Your feedback helps us improve Rwandan primary education!');
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

  // Guiding questions matching Picture 3
  const guidingQuestions = [
    `What is the main foundation and core principle behind "${selectedLesson?.title}"?`,
    'How does this knowledge apply directly to real life and everyday shopping/sharing in Rwanda?',
    'Which problem-solving strategy feels most natural for you to explain to a friend?'
  ];

  // Picture 3 structured cards (Concept vs Real Application)
  const isPitchPitch = selectedLesson?.title?.toLowerCase().includes('pitch');

  const cardA = isPitchPitch
    ? {
        title: '"About me" pitch',
        badge: 'describes you',
        badgeClass: 'badge-gray',
        bullets: [
          "Focuses on your background, titles, and credentials",
          "Lists what you've done and where you've been",
          'Leaves the listener wondering: "so what does that mean for me?"'
        ],
        eg: "I'm an award-winning, bestselling author with 10 years of experience in publishing."
      }
    : {
        title: `"${selectedLesson?.title || 'Core Concept'}" Foundation`,
        badge: 'core concept',
        badgeClass: 'badge-gray',
        bullets: selectedLesson?.studyNotes?.keyPoints?.slice(0, 3) || [
          'Understand the fundamental definition and core mechanics step-by-step',
          'Break down complex equations or ideas into simple, manageable pieces',
          'Remember the primary rules and properties before tackling advanced problems'
        ],
        eg: selectedLesson?.studyNotes?.keyFacts?.[0] || 'Rule: Understand the principles first before jumping to conclusions.'
      };

  const cardB = isPitchPitch
    ? {
        title: '"About you" pitch',
        badge: 'describes your value',
        badgeClass: 'badge-green',
        bullets: [
          'Focuses on the benefit you bring to your listener',
          'Answers the listener\'s question: "how will my life be different?"',
          'Makes the listener lean in and say "tell me more"'
        ],
        eg: 'I help new authors get published faster — so they can focus on writing, not navigating the industry.'
      }
    : {
        title: 'Real-World Value & Application',
        badge: 'describes practical value',
        badgeClass: 'badge-green',
        bullets: selectedLesson?.studyNotes?.keyPoints?.slice(3, 6).length
          ? selectedLesson.studyNotes.keyPoints.slice(3, 6)
          : [
              'Applies directly to Rwandan marketplace trade, time management, and family life',
              'Saves mental energy and speeds up your calculations during school and national exams',
              'Empowers you to make smart, confident choices every day'
            ],
        eg: selectedLesson?.scenarioChallenge?.story?.slice(0, 110)
          ? `${selectedLesson.scenarioChallenge.story.slice(0, 110)}...`
          : 'Example: Knowing shortcuts helps you quickly count money at the market in Kigali!'
      };

  const takeawayBannerText = isPitchPitch
    ? {
        strong: 'Same person. Same experience. Completely different impression.',
        sub: "The only thing that changed is the frame — from \"here's who I am\" to \"here's what I can do for you.\""
      }
    : {
        strong: 'Same lesson. Same facts. Completely different understanding.',
        sub: `The secret is active learning — connect "${selectedLesson?.title || 'the concept'}" to real decisions and practice every day!`
      };

  return (
    <div className="picture3-course-layout">
      {/* ── LEFT / MAIN CONTENT AREA (Matching Picture 3) ──── */}
      <main className="content-main-column">
        {selectedLesson && (
          <article className="lesson-content-card">
            {/* ── Top Header with Title & Collapse Chevron ─ */}
            <div className="picture3-header-row">
              <div
                className="picture3-title-toggle"
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
              >
                <span className="picture3-media-icon">
                  {selectedLesson.pdfUrl ? '📹' : '📖'}
                </span>
                <h1 className="picture3-lesson-title">{selectedLesson.title}</h1>
                <span className="picture3-chevron">
                  {isHeaderCollapsed ? '⌄' : '⌃'}
                </span>
              </div>

              {/* Action Buttons: Audio Narration, Mark Complete, Quiz */}
              <div className="picture3-actions-toolbar">
                <button
                  type="button"
                  className={`picture3-audio-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={isSpeaking ? stopSpeech : startSpeech}
                  title="Listen to lesson notes read out loud"
                >
                  {isSpeaking ? '⏹️ Stop Voice' : '🔊 Listen to Lesson'}
                </button>

                <button
                  type="button"
                  className={`picture3-complete-btn ${isCurrentCompleted ? 'completed' : ''}`}
                  onClick={() => handleToggleLessonComplete(selectedLesson)}
                  disabled={markingComplete}
                >
                  {isCurrentCompleted ? '✅ Completed' : markingComplete ? 'Saving...' : '✓ Mark Done'}
                </button>

                {quizInfo?.hasQuiz && (
                  <button
                    type="button"
                    className="picture3-quiz-btn"
                    onClick={() => onOpenQuiz(selectedLesson, quizInfo.quiz)}
                  >
                    🎯 Take Quiz
                  </button>
                )}
              </div>
            </div>

            {/* ── Collapsible Content Section ────────────── */}
            {!isHeaderCollapsed && (
              <div className="picture3-body-section">
                {/* Intro summary paragraph */}
                <p className="picture3-intro-text">
                  {selectedLesson.studyNotes?.overview ||
                    selectedLesson.summary ||
                    'Welcome to this module! Study the concepts below, test your knowledge with interactive flashcards, and solve the scenario problem.'}
                </p>

                {/* Guiding Questions (Picture 3 style) */}
                <div className="picture3-guiding-block">
                  <p className="guiding-title">Before you begin, keep these three questions in mind:</p>
                  <ol className="guiding-list">
                    {guidingQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ol>
                </div>

                {/* ── Concept Breakdown Cards (Picture 3 Side-by-Side Cards) ── */}
                <div className="picture3-comparison-grid">
                  {/* Left Card: Foundation */}
                  <div className="concept-card card-foundation">
                    <div className="card-top-bar">
                      <span className="card-heading">{cardA.title}</span>
                      <span className={`card-pill-tag ${cardA.badgeClass}`}>{cardA.badge}</span>
                    </div>
                    <ul className="card-bullet-list">
                      {cardA.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <div className="card-example-callout">
                      <span className="eg-label">e.g.</span>
                      <span className="eg-quote">"{cardA.eg}"</span>
                    </div>
                  </div>

                  {/* Right Card: Real-World Value */}
                  <div className="concept-card card-value">
                    <div className="card-top-bar">
                      <span className="card-heading">{cardB.title}</span>
                      <span className={`card-pill-tag ${cardB.badgeClass}`}>{cardB.badge}</span>
                    </div>
                    <ul className="card-bullet-list green-bullets">
                      {cardB.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <div className="card-example-callout green-callout">
                      <span className="eg-label green-label">e.g.</span>
                      <span className="eg-quote">"{cardB.eg}"</span>
                    </div>
                  </div>
                </div>

                {/* ── High-Impact Takeaway Banner (Green Box at Bottom) ── */}
                <div className="picture3-takeaway-banner">
                  <p className="takeaway-strong">{takeawayBannerText.strong}</p>
                  <p className="takeaway-sub">{takeawayBannerText.sub}</p>
                </div>

                {/* ── Interactive Activity Tabs (Story, Flashcards, Scenario, PDF) ── */}
                <div className="picture3-tabs-bar">
                  <button
                    className={`nav-tab-pill ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                  >
                    📖 1. Full Study Notes
                  </button>
                  <button
                    className={`nav-tab-pill ${activeTab === 'flashcards' ? 'active' : ''}`}
                    onClick={() => setActiveTab('flashcards')}
                  >
                    🗂️ 2. Flashcards {flashcards.length > 0 && `(${flashcards.length})`}
                  </button>
                  <button
                    className={`nav-tab-pill ${activeTab === 'scenario' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scenario')}
                  >
                    🤔 3. Real-World Challenge
                  </button>
                  <button
                    className={`nav-tab-pill ${activeTab === 'pdf' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pdf')}
                  >
                    📄 4. Study Sheet PDF
                  </button>
                </div>

                {/* ── Tab 1: Detailed Study Notes & Vocabulary ── */}
                {activeTab === 'notes' && (
                  <div className="tab-pane-card">
                    {selectedLesson.studyNotes ? (
                      <>
                        {selectedLesson.studyNotes.keyPoints?.length > 0 && (
                          <div className="study-sub-block">
                            <h4 className="study-sub-title">📌 Key Takeaways</h4>
                            <ul className="study-bullet-points">
                              {selectedLesson.studyNotes.keyPoints.map((pt, i) => (
                                <li key={i}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedLesson.studyNotes.keyFacts?.length > 0 && (
                          <div className="study-sub-block">
                            <h4 className="study-sub-title">💡 Core Facts &amp; Rules</h4>
                            <div className="facts-chips-wrapper">
                              {selectedLesson.studyNotes.keyFacts.map((fact, i) => (
                                <span key={i} className="fact-badge-chip">✨ {fact}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedLesson.studyNotes.vocabulary?.length > 0 && (
                          <div className="study-sub-block">
                            <h4 className="study-sub-title">🔑 Essential Vocabulary</h4>
                            <div className="vocab-terms-grid">
                              {selectedLesson.studyNotes.vocabulary.map((v, i) => (
                                <div key={i} className="vocab-box">
                                  <span className="vocab-word">{v.term}</span>
                                  <span className="vocab-meaning">{v.definition}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="plain-summary-text">
                        {(selectedLesson.summary || '').split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab 2: Interactive 3D Flashcards ─────── */}
                {activeTab === 'flashcards' && (
                  <div className="tab-pane-card flashcards-pane">
                    {flashcards.length > 0 ? (
                      <div className="flashcards-box">
                        <div className="flashcards-counter-bar">
                          <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                          <button
                            type="button"
                            className="hint-btn"
                            onClick={() => setShowCardHint(!showCardHint)}
                          >
                            💡 {showCardHint ? 'Hide Hint' : 'Show Hint'}
                          </button>
                        </div>

                        <div
                          className={`flashcard-card-3d ${isCardFlipped ? 'flipped' : ''}`}
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                        >
                          <div className="flashcard-inner">
                            <div className="flashcard-face face-front">
                              <span className="side-badge">Question</span>
                              <p className="card-text">{flashcards[currentCardIndex].front}</p>
                              {showCardHint && flashcards[currentCardIndex].hint && (
                                <span className="hint-text">💡 Hint: {flashcards[currentCardIndex].hint}</span>
                              )}
                              <span className="flip-prompt">🔄 Click card to see answer</span>
                            </div>

                            <div className="flashcard-face face-back">
                              <span className="side-badge badge-green">Answer &amp; Explanation</span>
                              <p className="card-text answer-text">{flashcards[currentCardIndex].back}</p>
                              <span className="flip-prompt">🔄 Click card to flip back</span>
                            </div>
                          </div>
                        </div>

                        <div className="flashcard-nav-controls">
                          <button
                            type="button"
                            className="nav-control-btn"
                            onClick={() => {
                              setIsCardFlipped(false);
                              setShowCardHint(false);
                              setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
                            }}
                          >
                            ◀ Previous
                          </button>
                          <button
                            type="button"
                            className="flip-action-btn"
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                          >
                            🔄 Flip Card
                          </button>
                          <button
                            type="button"
                            className="nav-control-btn"
                            onClick={() => {
                              setIsCardFlipped(false);
                              setShowCardHint(false);
                              setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
                            }}
                          >
                            Next ▶
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state-card">
                        <p>No flashcards created for this chapter yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab 3: Real-World Scenario Challenge ──── */}
                {activeTab === 'scenario' && (
                  <div className="tab-pane-card scenario-pane">
                    {scenario ? (
                      <div className="scenario-card-container">
                        <div className="scenario-badge-title">
                          <span className="scenario-icon">🛒</span>
                          <div>
                            <h3>{scenario.title}</h3>
                            <span className="scenario-tag">Practical Rwanda Application</span>
                          </div>
                        </div>

                        <p className="scenario-story-body">{scenario.story}</p>

                        <div className="scenario-question-section">
                          <p className="scenario-question-text">🤔 <strong>Question:</strong> {scenario.question}</p>
                          <div className="scenario-choices-list">
                            {scenario.options.map((option, optIdx) => {
                              const isSelected = scenarioAnswer === optIdx;
                              const isCorrect = optIdx === scenario.correctAnswer;
                              let btnClass = 'scenario-choice-btn';
                              if (scenarioSubmitted && isSelected) {
                                btnClass += isCorrect ? ' correct' : ' wrong';
                              } else if (scenarioSubmitted && isCorrect) {
                                btnClass += ' correct';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  className={btnClass}
                                  onClick={() => {
                                    setScenarioAnswer(optIdx);
                                    setScenarioSubmitted(true);
                                    if (optIdx === scenario.correctAnswer) {
                                      launchConfetti(3000);
                                      soundEffects.playVictoryChime();
                                    } else {
                                      soundEffects.playTryAgainChime();
                                    }
                                  }}
                                >
                                  <span className="choice-letter">{String.fromCharCode(65 + optIdx)}</span>
                                  <span>{option}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {scenarioSubmitted && (
                          <div className={`scenario-feedback-box ${scenarioAnswer === scenario.correctAnswer ? 'success' : 'retry'}`}>
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
                      <div className="empty-state-card">
                        <p>No scenario challenge added for this chapter yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab 4: Study Sheet PDF (Fixes "No token provided" & download) ── */}
                {activeTab === 'pdf' && (
                  <div className="tab-pane-card pdf-pane">
                    <div className="pdf-pane-header">
                      <div>
                        <h3>📄 Chapter Study Sheet &amp; Original PDF</h3>
                        <p>Curriculum-aligned reference material for printing, offline reading, and exam review.</p>
                      </div>

                      <button
                        type="button"
                        className="download-pdf-btn"
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                      >
                        {downloadingPdf ? '⏳ Downloading...' : '⬇️ Download Full PDF'}
                      </button>
                    </div>

                    <div className="pdf-display-wrapper">
                      {loadingPdf ? (
                        <div className="pdf-loading-box">
                          <span>📄 Loading curriculum PDF document...</span>
                        </div>
                      ) : pdfBlobUrl ? (
                        <iframe
                          src={pdfBlobUrl}
                          title={`PDF Study Sheet for ${selectedLesson.title}`}
                          className="pdf-viewer-frame"
                        />
                      ) : (
                        <div className="pdf-printable-sheet">
                          <h4>📘 Study Sheet: {selectedLesson.title}</h4>
                          <p>{selectedLesson.studyNotes?.overview || selectedLesson.summary}</p>
                          <div className="printable-points">
                            {(selectedLesson.studyNotes?.keyPoints || []).map((pt, i) => (
                              <div key={i} className="point-row">✓ {pt}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        )}
      </main>

      {/* ── RIGHT COLUMN: "Your Checklist" SIDEBAR (Matching Picture 3) ──── */}
      <aside className="sidebar-checklist-column">
        <div className="checklist-card">
          {/* Header */}
          <div className="checklist-card-header">
            <div className="checklist-title-row">
              <span className="checklist-icon">📑</span>
              <h3 className="checklist-heading">Your Checklist</h3>
            </div>

            {/* Dynamic Progress Indicator */}
            <div className="checklist-progress-box">
              <div className="progress-labels">
                <span className="progress-pct">{courseProgress}% Complete</span>
                <span className="progress-count">
                  {checklistItems.filter((i) => i.isCompleted).length} / {checklistItems.length}
                </span>
              </div>
              <div className="checklist-bar-track">
                <div
                  className="checklist-bar-fill"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist items list */}
          <div className="checklist-items-list">
            {checklistItems.map((item) => {
              const isSelected = item.type === 'lesson' && selectedLesson?._id === item.lessonId;
              return (
                <div
                  key={item.id}
                  className={`checklist-item-row ${isSelected ? 'selected' : ''} ${item.isCompleted ? 'is-done' : ''}`}
                >
                  <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => {
                        if (item.type === 'lesson') {
                          handleToggleLessonComplete(item.lesson);
                        } else if (item.type === 'quiz') {
                          if (item.isCompleted) {
                            toast.info('Quiz already completed! You can retake it anytime.');
                          }
                          onOpenQuiz(item.lesson, quizInfo?.quiz || { _id: item.quizId, title: item.title });
                        }
                      }}
                    />
                    <span className="checkmark" />
                  </label>

                  <div
                    className="item-info-click"
                    onClick={() => {
                      if (item.type === 'lesson') {
                        setSelectedLesson(item.lesson);
                      } else if (item.type === 'quiz') {
                        onOpenQuiz(item.lesson, quizInfo?.quiz || { _id: item.quizId, title: item.title });
                      }
                    }}
                  >
                    <span className={`item-title-text ${isSelected ? 'active-bold' : ''}`}>
                      {item.title}
                    </span>
                    {item.type === 'quiz' && (
                      <span className="quiz-mini-tag">🎯 Quiz</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Accordion 1: Question about the Content? ──────── */}
          <div className="sidebar-accordion">
            <button
              type="button"
              className="accordion-trigger-btn"
              onClick={() => setQuestionAccordionOpen(!questionAccordionOpen)}
            >
              <span className="accordion-label">
                <span className="acc-icon">❔</span> Question about the Content?
              </span>
              <span className="acc-chevron">{questionAccordionOpen ? '⌃' : '⌄'}</span>
            </button>

            {questionAccordionOpen && (
              <div className="accordion-content-panel">
                <p className="acc-helper-text">
                  Ask Dex AI Tutor or reach out to Rwandan teachers for fast help:
                </p>
                <form onSubmit={handleAskAiTutor} className="ai-ask-form">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Type your question..."
                    className="ai-question-input"
                  />
                  <button type="submit" className="ai-ask-submit-btn" disabled={askingAi}>
                    {askingAi ? 'Thinking...' : 'Ask AI'}
                  </button>
                </form>

                {aiAnswer && (
                  <div className="ai-response-bubble">
                    <p>{aiAnswer}</p>
                  </div>
                )}

                <div className="teacher-support-contact">
                  <strong>📞 Rwandan Teacher Support:</strong>
                  <div>Email: inezadervaux@gmail.com</div>
                  <div>Phone: +250 783 589 357</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 2: Feedback ─────────────────────────── */}
          <div className="sidebar-accordion">
            <button
              type="button"
              className="accordion-trigger-btn"
              onClick={() => setFeedbackAccordionOpen(!feedbackAccordionOpen)}
            >
              <span className="accordion-label">
                <span className="acc-icon">💬</span> Feedback
              </span>
              <span className="acc-chevron">{feedbackAccordionOpen ? '⌃' : '⌄'}</span>
            </button>

            {feedbackAccordionOpen && (
              <div className="accordion-content-panel">
                {feedbackSubmitted ? (
                  <div className="feedback-thankyou">
                    <span>🎉 Thank you for helping us improve!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="feedback-form">
                    <label className="feedback-stars-row">
                      <span>Rate this chapter:</span>
                      <div className="stars-picker">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${star <= feedbackRating ? 'filled' : ''}`}
                            onClick={() => setFeedbackRating(star)}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </label>

                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="What did you like? What should we make clearer?"
                      className="feedback-textarea"
                    />

                    <button type="submit" className="feedback-submit-btn">
                      Send Feedback
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LessonViewer;
