import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_COURSES } from '../services/demoData';
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

const GradeRow = ({ gradeLevel, courses = [], viewMode = 'carousel' }) => {
  const scrollRef = useRef(null);
  const config = gradeConfig[gradeLevel] || { icon: '📚', badgeClass: 'badge-p1', desc: '' };

  // If no backend courses exist yet, provide the high-quality demo course for this grade
  const demoFallback = DEMO_COURSES.filter((c) => c.gradeLevel === gradeLevel);
  const isDemo = courses.length === 0 && demoFallback.length > 0;
  const activeList = courses.length > 0 ? courses : demoFallback;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(activeList.length > 1);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [activeList]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      // Step by card width (320px) + gap (20px) = 340px for clean snap
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
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
              <span className={`grade-badge ${config.badgeClass}`}>
                {activeList.length} {activeList.length === 1 ? 'Course' : 'Courses'}
                {isDemo && ' (Demo Ready)'}
              </span>
            </div>
            <p className="grade-desc">{config.desc}</p>
          </div>
        </div>

        <div className="grade-header-actions">
          <Link
            to={`/courses?grade=${encodeURIComponent(gradeLevel)}`}
            className="grade-browse-btn"
          >
            Browse All {gradeLevel} →
          </Link>

          {viewMode === 'carousel' && activeList.length > 0 && (
            <div className="grade-slider-controls">
              <button
                className={`slider-arrow arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll Left"
                title="Previous Course"
              >
                ◀
              </button>
              <button
                className={`slider-arrow arrow-right ${!canScrollRight ? 'disabled' : ''}`}
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll Right"
                title="Next Course"
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {activeList.length > 0 ? (
        <div
          className={viewMode === 'grid' ? 'grade-courses-grid' : 'grade-courses-slider'}
          ref={viewMode === 'carousel' ? scrollRef : null}
          onScroll={viewMode === 'carousel' ? checkScroll : null}
        >
          {activeList.map((course) => {
            const emoji = course.thumbnailEmoji || categoryEmojis[course.category] || '📚';
            return (
              <div key={course._id || course.id} className="grade-course-card">
                <div className="card-top-banner">
                  <div className="emoji-badge-wrap">
                    <span className="course-emoji">{emoji}</span>
                    {course.isDemo && (
                      <span className="demo-ribbon">✨ Demo Ready</span>
                    )}
                  </div>
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
                    <span className="feature-pill pdf-pill">📄 PDF Lesson</span>
                    <span className="feature-pill ai-pill">🤖 AI Summary</span>
                    <span className="feature-pill quiz-pill">🎯 AI Quiz</span>
                  </div>

                  <div className="card-footer">
                    <div className="instructor-info">
                      <span className="instructor-avatar">👤</span>
                      <span className="instructor-name">{course.instructor?.name || 'Staff'}</span>
                    </div>
                    <Link
                      to={`/courses/${course._id || course.id}`}
                      className={`explore-btn ${course.isDemo ? 'demo-explore-btn' : ''}`}
                    >
                      {course.isDemo ? '🎮 Try Demo Lesson →' : 'Start Lesson →'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-grade-row">
          <p>🎈 No courses added for {gradeLevel} yet. Instructors will add lessons soon!</p>
          <Link to="/courses/demo-p3-math" className="empty-row-action-btn">
            Test Primary 3 Demo Math Lesson →
          </Link>
        </div>
      )}
    </div>
  );
};

export default GradeRow;
