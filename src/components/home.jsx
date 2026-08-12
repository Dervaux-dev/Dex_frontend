import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const categories = [
  { name: 'Programming', icon: '💻', slug: 'programming', color: '#667eea' },
  { name: 'Data Science', icon: '📊', slug: 'data-science', color: '#764ba2' },
  { name: 'Design', icon: '🎨', slug: 'design', color: '#f093fb' },
  { name: 'Business', icon: '💼', slug: 'business', color: '#4facfe' },
  { name: 'Marketing', icon: '📈', slug: 'marketing', color: '#f5576c' },
  { name: 'Other', icon: '📚', slug: 'other', color: '#28a745' },
];

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await coursesAPI.getAll({ limit: 6, sort: '-createdAt' });
        setFeaturedCourses(response.data.data.courses || []);
      } catch (err) {
        setError('Failed to load featured courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedCourses();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Learn Without <span className="gradient-text">Limits</span>
            </h1>
            <p className="hero-subtitle">
              Unlock your potential with expert-led courses in programming, data science,
              design, and more. Start your learning journey today.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-primary btn-lg">
                Explore Courses
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Get Started Free
                </Link>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1K+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration">
              <div className="floating-card card-1">📚</div>
              <div className="floating-card card-2">🎯</div>
              <div className="floating-card card-3">🏆</div>
              <div className="hero-graphic">
                <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="200" cy="200" r="180" fill="url(#grad1)" opacity="0.3" />
                  <circle cx="200" cy="200" r="120" fill="url(#grad1)" opacity="0.5" />
                  <circle cx="200" cy="200" r="60" fill="url(#grad1)" opacity="0.8" />
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="page-container">
          <h2 className="section-title text-center">Browse by Category</h2>
          <p className="section-subtitle text-center">
            Find the perfect course for your goals
          </p>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/courses?category=${cat.slug}`}
                className="category-card"
                style={{ '--cat-color': cat.color }}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-section">
        <div className="page-container">
          <h2 className="section-title text-center">Featured Courses</h2>
          <p className="section-subtitle text-center">
            Start learning from our top-rated courses
          </p>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p className="empty-state-text">{error}</p>
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📖</div>
              <h3 className="empty-state-title">No Courses Yet</h3>
              <p className="empty-state-text">Check back soon for new courses!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {featuredCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-card-image" style={{ background: `linear-gradient(135deg, ${getCategoryColor(course.category)}, ${getCategoryColor(course.category, true)})` }}>
                    <span className="course-card-icon">
                      {getCategoryIcon(course.category)}
                    </span>
                    <span className="course-level-badge">{course.level}</span>
                  </div>
                  <div className="course-card-body">
                    <h3 className="course-card-title">{course.title}</h3>
                    <p className="course-card-description">
                      {course.description?.substring(0, 100)}
                      {course.description?.length > 100 ? '...' : ''}
                    </p>
                    <div className="course-card-meta">
                      <span className="course-price">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      <span className="course-rating">
                        ★ {course.rating?.average?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn btn-primary btn-sm course-card-btn"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {featuredCourses.length > 0 && (
            <div className="text-center mt-4">
              <Link to="/courses" className="btn btn-secondary btn-lg">
                View All Courses
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="page-container text-center">
            <h2 className="cta-title">Ready to Start Learning?</h2>
            <p className="cta-text">
              Join thousands of learners and transform your career today.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="page-container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-icon">📚</span>
              <span className="brand-text">DexElearning</span>
              <p>Empowering learners worldwide with quality education.</p>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <Link to="/courses">Courses</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
            <div className="footer-links">
              <h4>Categories</h4>
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.slug} to={`/courses?category=${cat.slug}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} DexElearning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper functions
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

export default Home;

