// Course list page that fetches courses from the backend and displays them in a grid.
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import './courselist.css';

const getCategoryIcon = (category) => {
  const icons = {
    programming: '💻',
    'data-science': '📊',
    design: '🎨',
    business: '💼',
    marketing: '📈',
    other: '📚',
  };
  return icons[category] || '📚';
};

const getCategoryColor = (category, secondary = false) => {
  const colors = {
    programming: secondary ? '#5a6fd6' : '#667eea',
    'data-science': secondary ? '#6a3da8' : '#764ba2',
    design: secondary ? '#d47ce0' : '#f093fb',
    business: secondary ? '#3a9bdc' : '#4facfe',
    marketing: secondary ? '#e04560' : '#f5576c',
    other: secondary ? '#218838' : '#28a745',
  };
  return colors[category] || '#667eea';
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = {};
        if (categoryFilter) params.category = categoryFilter;
        const response = await coursesAPI.getAll(params);
        setCourses(response.data.data.courses || []);
      } catch (err) {
        setError('Failed to load courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [categoryFilter]);

  return (
    <div className="courselist-container">
      <div className="courselist-header">
        <h1>{categoryFilter ? `${categoryFilter.replace('-', ' ')} Courses` : 'All Courses'}</h1>
        <p className="courselist-subtitle">
          {categoryFilter
            ? `Browse courses in ${categoryFilter.replace('-', ' ')}`
            : 'Find the perfect course to accelerate your learning'}
        </p>
      </div>

      {loading ? (
        <div className="courselist-loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="course-error">
          <p>{error}</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <div
                className="course-card-image"
                style={{
                  background: `linear-gradient(135deg, ${getCategoryColor(course.category)}, ${getCategoryColor(course.category, true)})`,
                }}
              >
                <span className="course-card-icon">{getCategoryIcon(course.category)}</span>
                <span className="course-level-badge">{course.level}</span>
              </div>
              <div className="course-card-body">
                <h2 className="course-card-title">{course.title}</h2>
                <p className="course-card-description">
                  {course.description?.substring(0, 100)}
                  {course.description?.length > 100 ? '...' : ''}
                </p>
                <div className="course-card-meta">
                  <span className="course-instructor">👤 {course.instructor?.name || 'Staff'}</span>
                  <span className="course-price">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>
                <div className="course-card-footer">
                  <span className="course-rating">⭐ {course.rating?.average?.toFixed(1) || '0.0'}</span>
                  <Link to={`/courses/${course._id}`} className="view-course-btn">
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-courses">
          <div className="no-courses-icon">📖</div>
          <p>No courses available.</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;
