// Course detail page with enroll button, lesson viewer, and quiz modal integration.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LessonViewer from './LessonViewer';
import Quiz from './Quiz';
import './coursedetail.css';

const gradeColors = {
  'Primary 1': 'linear-gradient(135deg, #ff6b6b, #ff8787)',
  'Primary 2': 'linear-gradient(135deg, #ff922b, #ffb347)',
  'Primary 3': 'linear-gradient(135deg, #fcc419, #ffe066)',
  'Primary 4': 'linear-gradient(135deg, #51cf66, #8ce99a)',
  'Primary 5': 'linear-gradient(135deg, #339af0, #74c0fc)',
  'Primary 6': 'linear-gradient(135deg, #845ef7, #b197fc)',
};

const categoryIcon = {
  mathematics: '🔢',
  english: '📖',
  kinyarwanda: '🇷🇼',
  french: '🇫🇷',
  music: '🎵',
  'physical-education': '⚽',
  science: '🔬',
  'social-studies': '🌍',
  history: '🏛️',
  geography: '🌍',
  art: '🎨',
  pe: '⚽',
  programming: '💻',
  'data-science': '📊',
  design: '🎨',
  business: '💼',
  marketing: '📈',
  other: '📚',
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await coursesAPI.getOne(id);
        setCourse(response.data.data.course);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load course details');
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      try {
        const response = await coursesAPI.getEnrolledCourses();
        const enrollments = response.data.data.enrollments || [];
        setIsEnrolled(enrollments.some((e) => e.course?._id === id || e.course?.id === id));
      } catch {
        // Not authenticated or error — ignore
      }
    };

    fetchCourse();
    if (isAuthenticated) {
      checkEnrollment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await coursesAPI.enroll(id);
      setIsEnrolled(true);
      toast.success('Enrolled successfully! Welcome aboard. 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleOpenQuiz = (lesson, quiz) => {
    setActiveLesson(lesson);
    setActiveQuiz(quiz);
  };

  if (loading) {
    return <div className="loading">✨ Loading Course...</div>;
  }

  if (!course) {
    return (
      <div className="coursedetail-container">
        <h1 style={{ textAlign: 'center', fontFamily: 'Fredoka', color: '#7c3aed', marginBottom: 12 }}>
          Course Not Found
        </h1>
        <p className="description">The course you are looking for does not exist.</p>
        <div style={{ textAlign: 'center' }}>
          <Link to="/courses" className="enroll-btn">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const icon = course.thumbnailEmoji || categoryIcon[course.category] || '📚';
  const heroGradient = gradeColors[course.gradeLevel] || 'linear-gradient(135deg, #7c3aed, #a855f7)';

  return (
    <div className="coursedetail-container">
      <div className="course-detail-card">
        {/* Hero Banner */}
        <div className="course-detail-hero" style={{ background: heroGradient }}>
          <div className="course-detail-header">
            <span className="course-detail-icon">{icon}</span>
            <div className="course-detail-info">
              {course.gradeLevel && (
                <span className="course-detail-category">{course.gradeLevel}</span>
              )}
              <span className="course-detail-level">{course.category}</span>
            </div>
          </div>
          <h1 className="course-detail-title">{course.title}</h1>
        </div>

        {/* Body */}
        <div className="course-detail-body">
          <div className="course-detail-meta">
            <span className="meta-item">👤 {course.instructor?.name || 'DexEdu Staff'}</span>
            <span className="meta-item">⭐ {course.rating?.average?.toFixed(1) || '5.0'} ({course.rating?.count || 0} reviews)</span>
            <span className="meta-item">
              {course.price === 0 ? '🆓 Free Course' : `💰 $${course.price}`}
            </span>
          </div>

          <p className="course-detail-description">{course.description}</p>

          <div className="course-detail-actions">
            {isEnrolled ? (
              <div className="enrolled-badge">
                <span className="enrolled-icon">✅</span>
                <span>You're enrolled — scroll down to study!</span>
              </div>
            ) : (
              <button
                className="enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? '⏳ Enrolling...' : '🚀 Enroll Now — It\'s Free!'}
              </button>
            )}
            <Link to="/courses" className="back-btn">← All Courses</Link>
          </div>
        </div>
      </div>

      {/* Render Lesson Viewer when user is enrolled */}
      {isEnrolled && (
        <LessonViewer courseId={id} onOpenQuiz={handleOpenQuiz} />
      )}

      {/* Render Quiz Modal when triggered */}
      {activeQuiz && (
        <Quiz
          quiz={activeQuiz}
          lesson={activeLesson}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
};

export default CourseDetail;
