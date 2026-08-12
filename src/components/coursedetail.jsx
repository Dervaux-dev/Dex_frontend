// Course detail page with enroll button. Uses coursesAPI and toast notifications.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import './coursedetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!course) {
    return (
      <div className="coursedetail-container">
        <h1>Course Not Found</h1>
        <p className="description">The course you are looking for does not exist.</p>
        <Link to="/courses" className="enroll-btn">← Back to Courses</Link>
      </div>
    );
  }

  const categoryIcon = {
    programming: '💻',
    'data-science': '📊',
    design: '🎨',
    business: '💼',
    marketing: '📈',
    other: '📚',
  }[course.category] || '📚';

  return (
    <div className="coursedetail-container">
      <div className="course-detail-card">
        <div className="course-detail-header">
          <span className="course-detail-icon">{categoryIcon}</span>
          <div className="course-detail-info">
            <span className="course-detail-category">{course.category}</span>
            <span className="course-detail-level">{course.level}</span>
          </div>
        </div>

        <h1 className="course-detail-title">{course.title}</h1>

        <div className="course-detail-meta">
          <span className="meta-item">👤 {course.instructor?.name || 'Staff'}</span>
          <span className="meta-item">⭐ {course.rating?.average?.toFixed(1) || '0.0'} ({course.rating?.count || 0})</span>
          <span className="meta-item">
            {course.price === 0 ? '🆓 Free' : `💰 $${course.price}`}
          </span>
        </div>

        <p className="course-detail-description">{course.description}</p>

        <div className="course-detail-actions">
          {isEnrolled ? (
            <div className="enrolled-badge">
              <span className="enrolled-icon">✅</span>
              <span>You are enrolled in this course</span>
            </div>
          ) : (
            <button
              className="enroll-btn"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}
          <Link to="/courses" className="back-btn">Back to Courses</Link>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
