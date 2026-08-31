import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './GradeRow.css';

const gradeConfig = {
  'Primary 1': { icon: '🎒', badgeClass: 'badge-p1', desc: 'Ages 6-7 • Fun Math, Phonics & Nature' },
  'Primary 2': { icon: '🎨', badgeClass: 'badge-p2', desc: 'Ages 7-8 • Stories, Math & Animal World' },
  'Primary 3': { icon: '🚀', badgeClass: 'badge-p3', desc: 'Ages 8-9 • Geometry, Science & Art Studio' },
  'Primary 4': { icon: '🧬', badgeClass: 'badge-p4', desc: 'Ages 9-10 • Fractions, Health & Coding' },
  'Primary 5': { icon: '🌍', badgeClass: 'badge-p5', desc: 'Ages 10-11 • Electricity, Ratios & Geography' },
  'Primary 6': { icon: '🏆', badgeClass: 'badge-p6', desc: 'Ages 11-12 • Math Mastery, Science & Exam Prep' },
};

const categoryEmojis = {
  mathematics: '🔢',
  science: '🔬',
  english: '📖',
  'social-studies': '🌍',
  'creative-arts': '🎨',
  ict: '💻',
  programming: '👾',
  french: '🇫🇷',
  kinyarwanda: '🇷🇼',
  music: '🎵',
  'physical-education': '⚽',
  other: '📚',
};

const GradeRow = ({ gradeLevel, courses = [] }) => {
  const scrollRef = useRef(null);
  const config = gradeConfig[gradeLevel] || { icon: '📚', badgeClass: 'badge-p1', desc: '' };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="grade-row-container">
      <div className="grade-row-header">
        <div className="grade-row-title-box">
          <span className="grade-icon">{config.icon}</span>
          <div>
            <div className="grade-title-group">
              <h2 className="grade-title">{gradeLevel}</h2>
              <span className={`grade-badge ${config.badgeClass}`}>{courses.length} Courses</span>
            </div>
            <p className="grade-desc">{config.desc}</p>
          </div>
        </div>

        <div className="grade-slider-controls">
          <button
            className="slider-arrow arrow-left"
            onClick={() => handleScroll('left')}
            aria-label="Scroll Left"
          >
            ◀
          </button>
          <button
            className="slider-arrow arrow-right"
            onClick={() => handleScroll('right')}
            aria-label="Scroll Right"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="grade-courses-slider" ref={scrollRef}>
        {courses.length > 0 ? (
          courses.map((course) => {
            const emoji = course.thumbnailEmoji || categoryEmojis[course.category] || '📚';
            return (
              <div key={course._id} className="grade-course-card">
                <div className="card-top-banner">
                  <span className="course-emoji">{emoji}</span>
                  <span className="subject-tag">{course.category}</span>
                </div>
                <div className="card-body">
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">
                    {course.description?.length > 90
                      ? `${course.description.substring(0, 90)}...`
                      : course.description}
                  </p>
                  
                  <div className="card-features-bar">
                    <span className="feature-pill pdf-pill">📄 PDF Lessons</span>
                    <span className="feature-pill ai-pill">✨ AI Quiz</span>
                  </div>

                  <div className="card-footer">
                    <div className="instructor-info">
                      <span className="instructor-avatar">👤</span>
                      <span className="instructor-name">{course.instructor?.name || 'Staff'}</span>
                    </div>
                    <Link to={`/courses/${course._id}`} className="explore-btn">
                      Start Lesson →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-grade-row">
            <p>🎈 No courses added for {gradeLevel} yet. Instructors will add PDF lessons soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeRow;
