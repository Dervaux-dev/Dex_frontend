import { useState, useEffect } from 'react';
import { lessonsAPI, quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import './LessonViewer.css';

const LessonViewer = ({ courseId, onOpenQuiz }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await lessonsAPI.getByCourse(courseId);
        const list = res.data.data.lessons || [];
        setLessons(list);
        if (list.length > 0) {
          setSelectedLesson(list[0]);
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
            </li>
          ))}
        </ul>
      </div>

      <div className="lesson-main">
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

            <div className="summary-box">
              <div className="summary-badge">🤖 AI Generated Key Summary</div>
              <div className="summary-content">
                {selectedLesson.summary ? (
                  selectedLesson.summary.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))
                ) : (
                  <p>No AI summary available for this chapter.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
