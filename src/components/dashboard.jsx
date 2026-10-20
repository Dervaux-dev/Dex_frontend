// Dashboard that shows user info, gamified streaks, stars, achievement badges, and enrolled courses.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './dashboard.css';

const getCategoryIcon = (category) => {
  const icons = {
    mathematics: '🔢',
    english: '📖',
    kinyarwanda: '🇷🇼',
    french: '🇫🇷',
    music: '🎵',
    'physical-education': '⚽',
    science: '🔬',
    'social-studies': '🌍',
    programming: '💻',
    'data-science': '📊',
    design: '🎨',
    business: '💼',
    marketing: '📈',
    other: '📚',
  };
  return icons[category] || '📚';
};

const achievementBadges = [
  { id: 'first_step', icon: '🎒', title: 'First Step', desc: 'Enrolled in primary learning', unlocked: true },
  { id: 'quiz_whiz', icon: '⚡', title: 'Quiz Whiz', desc: 'Completed an AI-graded quiz', unlocked: true },
  { id: 'streak_master', icon: '🔥', title: '3-Day Streak', desc: 'Practiced 3 days in a row', unlocked: true },
  { id: 'high_scorer', icon: '⭐', title: 'Star Pupil', desc: 'Earned 80%+ on study questions', unlocked: true },
  { id: 'reader', icon: '📖', title: 'PDF Explorer', desc: 'Downloaded chapter study guides', unlocked: false },
  { id: 'mastery', icon: '🏆', title: 'Grade Champion', desc: 'Complete all grade topics', unlocked: false },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await coursesAPI.getEnrolledCourses();
        setEnrollments(response.data.data.enrollments || []);
      } catch (err) {
        setError('Failed to load your enrolled courses');
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#10b981';
    if (progress >= 50) return '#f59e0b';
    return '#3b82f6';
  };

  // Gamification metrics
  const totalStars = Math.max(12, enrollments.length * 5 + 6);
  const streakDays = 3;

  return (
    <div className="dashboard-container">
      {/* ── Gamified User Hero Header ──────────────────────── */}
      <section className="dashboard-hero-card">
        <div className="user-info-section">
          <div className="user-avatar-glow">
            <span className="user-avatar-letter">
              {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            <span className="avatar-level-badge">Lv. 2</span>
          </div>
          <div className="user-details">
            <div className="user-title-row">
              <h2>Welcome back, {user?.fullname || 'Young Learner'}! 👋</h2>
              <span className="user-role-badge">🎒 {user?.role || 'Primary Student'}</span>
            </div>
            <p className="user-email-text">{user?.email}</p>
            <p className="motivational-pill">
              🌟 You're on fire! Complete a quick quiz today to keep your streak burning!
            </p>
          </div>
        </div>

        {/* Gamified counters */}
        <div className="student-stats-grid">
          <div className="stat-counter-card streak-card">
            <div className="stat-icon-wrapper fire-pulse">🔥</div>
            <div className="stat-info">
              <span className="stat-number">{streakDays} Days</span>
              <span className="stat-label">Daily Streak</span>
            </div>
          </div>

          <div className="stat-counter-card stars-card">
            <div className="stat-icon-wrapper star-spin">⭐</div>
            <div className="stat-info">
              <span className="stat-number">{totalStars}</span>
              <span className="stat-label">Stars Collected</span>
            </div>
          </div>

          <div className="stat-counter-card courses-card">
            <div className="stat-icon-wrapper">📚</div>
            <div className="stat-info">
              <span className="stat-number">{enrollments.length}</span>
              <span className="stat-label">Active Courses</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievement Badges Section ──────────────────────── */}
      <section className="achievements-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">🏆 Learning Badges &amp; Achievements</h3>
            <p className="section-subtitle">Collect badges as you study lessons and pass AI quizzes!</p>
          </div>
          <span className="badge-count-pill">4 of 6 Unlocked</span>
        </div>

        <div className="badges-grid">
          {achievementBadges.map((b) => (
            <div key={b.id} className={`badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon-box">
                <span className="badge-emoji">{b.icon}</span>
                {!b.unlocked && <span className="lock-tag">🔒</span>}
              </div>
              <h4 className="badge-card-title">{b.title}</h4>
              <p className="badge-card-desc">{b.desc}</p>
              <span className={`badge-status-tag ${b.unlocked ? 'status-unlocked' : 'status-locked'}`}>
                {b.unlocked ? '✨ Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Enrolled Courses Section ───────────────────────── */}
      <section className="enrolled-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">📚 My Courses</h3>
            <p className="section-subtitle">Pick up right where you left off</p>
          </div>
          <span className="enrolled-count">
            {enrollments.length} {enrollments.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading your courses...</p>
          </div>
        ) : error ? (
          <div className="dashboard-error">
            <p>{error}</p>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="enrolled-grid">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress = enrollment.progress || 0;
              return (
                <div key={enrollment._id} className="enrolled-card">
                  <div className="enrolled-card-header">
                    <span className="enrolled-card-icon">{getCategoryIcon(course?.category)}</span>
                    <span
                      className="enrolled-status"
                      style={{ background: getProgressColor(progress) }}
                    >
                      {enrollment.status}
                    </span>
                  </div>
                  <h4 className="enrolled-card-title">{course?.title || 'Course'}</h4>
                  <p className="enrolled-card-desc">
                    {course?.description?.substring(0, 80)}
                    {course?.description?.length > 80 ? '...' : ''}
                  </p>

                  <div className="progress-container">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span className="progress-value">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                          background: getProgressColor(progress),
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="enrolled-card-footer">
                    <span className="enrolled-date">
                      Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                    {course && (
                      <Link to={`/courses/${course._id}`} className="continue-btn">
                        Continue Learning ▶
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-enrollments">
            <div className="no-enrollments-icon">🎈</div>
            <h4>You haven't enrolled in courses yet!</h4>
            <p>Jump into our interactive sample math and science courses to test AI quizzes and download study notes.</p>
            <div className="no-enrollment-actions">
              <Link to="/courses/demo-p3-math" className="sample-test-btn">
                🚀 Try Demo Math Lesson &amp; AI Quiz
              </Link>
              <Link to="/courses" className="browse-btn">
                Browse All Primary Courses
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
