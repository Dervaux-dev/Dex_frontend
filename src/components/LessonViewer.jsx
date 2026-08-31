import { useState, useEffect } from 'react';
import { lessonsAPI, quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import './LessonViewer.css';

const LessonViewer = ({ courseId, onOpenQuiz }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState(null);
  const [bulkQuizStatus, setBulkQuizStatus] = useState({});
  const [quizList, setQuizList] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const toast = useToast();

  // Load the full quiz object for every chapter that has one
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
        } catch {}
      }
      setQuizList(items);
      setLoadingQuizzes(false);
    };
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, bulkQuizStatus]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await lessonsAPI.getByCourse(courseId);
        const list = res.data.data.lessons || [];
        setLessons(list);
        if (list.length > 0) {
          setSelectedLesson(list[0]);
          // Fetch quiz status for all chapters at once
          try {
            const bulkRes = await quizzesAPI.getBulkStatus(list.map((l) => l._id));
            setBulkQuizStatus(bulkRes.data.data);
          } catch {}
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
  }, [selectedLesson]);

  if (loading) {
    return <div className="lesson-viewer-loading">Loading lessons...</div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="lesson-viewer-empty">
        <h3>📚 No lessons available yet</h3>
        <p>Lessons and AI study notes will appear here once uploaded by your instructor.</p>
      </div>
    );
  }

  return (
    <div className="lesson-viewer-container">
      <div className="lesson-sidebar">
        <h3>Course Chapters</h3>
        <ul className="chapter-list">
          {lessons.map((lesson) => (
            <li
              key={lesson._id}
              className={`chapter-item ${selectedLesson?._id === lesson._id ? 'active' : ''}`}
              onClick={() => setSelectedLesson(lesson)}
            >
              <span className="chapter-num">Ch {lesson.chapter}</span>
              <span className="chapter-title">{lesson.title}</span>
              {bulkQuizStatus[lesson._id]?.hasQuiz && (
                <span className="chapter-quiz-badge">🎯 Quiz</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="lesson-main">
        <div className="quizzes-overview">
          <h3>🎯 Chapter Quizzes</h3>
          {loadingQuizzes ? (
            <p className="quizzes-loading">Loading quizzes...</p>
          ) : quizList.length > 0 ? (
            <div className="quizzes-grid">
              {quizList.map(({ lesson, quiz }) => (
                <button
                  key={quiz._id}
                  className="quiz-card"
                  onClick={() => {
                    setSelectedLesson(lesson);
                    onOpenQuiz(lesson, quiz);
                  }}
                >
                  <span className="quiz-card-icon">🎯</span>
                  <span className="quiz-card-title">
                    Chapter {lesson.chapter}: {lesson.title}
                  </span>
                  <span className="quiz-card-count">{quiz.questions.length} questions</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="quizzes-empty">No quizzes available for this course yet.</p>
          )}
        </div>

        {selectedLesson && (
          <>
            <div className="lesson-header">
              <h2>Chapter {selectedLesson.chapter}: {selectedLesson.title}</h2>
              <div className="lesson-actions">
                <a
                  href={selectedLesson.pdfUrl || lessonsAPI.getPdfUrl(selectedLesson._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="pdf-download-btn"
                >
                  📄 View / Download Original PDF
                </a>

                {quizInfo?.hasQuiz && (
                  <button
                    className="take-quiz-btn"
                    onClick={() => onOpenQuiz(selectedLesson, quizInfo.quiz)}
                  >
                    🎯 Take Chapter Quiz
                  </button>
                )}
              </div>
            </div>

            <div className="study-notes-card">
              <div className="study-notes-header">
                <div className="study-notes-badge">🤖 AI Study Notes</div>
                <span className="study-notes-tag">Learn this chapter</span>
              </div>

              {selectedLesson.studyNotes && (selectedLesson.studyNotes.keyPoints?.length || selectedLesson.studyNotes.vocabulary?.length) ? (
                <>
                  {selectedLesson.studyNotes.overview && (
                    <p className="study-notes-overview">{selectedLesson.studyNotes.overview}</p>
                  )}

                  {selectedLesson.studyNotes.keyPoints?.length > 0 && (
                    <div className="study-section">
                      <h4 className="study-section-title">📌 Key Points</h4>
                      <ul className="study-keypoints">
                        {selectedLesson.studyNotes.keyPoints.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedLesson.studyNotes.keyFacts?.length > 0 && (
                    <div className="study-section">
                      <h4 className="study-section-title">💡 Key Facts</h4>
                      <div className="study-facts">
                        {selectedLesson.studyNotes.keyFacts.map((f, i) => (
                          <span key={i} className="study-fact-chip">✨ {f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLesson.studyNotes.vocabulary?.length > 0 && (
                    <div className="study-section">
                      <h4 className="study-section-title">🔑 Vocabulary</h4>
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
              ) : selectedLesson.summary ? (
                <div className="summary-content">
                  {selectedLesson.summary.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="study-notes-empty">No AI summary available for this chapter yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
