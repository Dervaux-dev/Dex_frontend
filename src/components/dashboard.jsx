// Dashboard that shows user info and enrolled courses with progress.
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
    if (progress >= 100) return '#28a745';
    if (progress >= 50) return '#ffc107';
    return '#667eea';
  };

  return (
    <div className="dashboard-container">
      <h1>My Dashboard</h1>

      {user && (
        <section className="user-info">
          <div className="user-avatar">
            {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <h2>Welcome, {user.fullname || 'Learner'}! 👋</h2>
            <p>{user.email}</p>
            <span className="user-role">{user.role}</span>
          </div>
        </section>
      )}

      <section className="enrolled-section">
        <div className="section-header">
          <h3>My Enrolled Courses</h3>
          <span className="enrolled-count">
            {enrollments.length} {enrollments.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
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
            <div className="no-enrollments-icon">🎓</div>
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="browse-btn">
              Browse Courses
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
