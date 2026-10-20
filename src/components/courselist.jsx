import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import GradeRow from './GradeRow';
import './courselist.css';

const gradesList = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'];

const CourseList = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // Default to full vertical grid catalog on Browse page!
  const [searchParams, setSearchParams] = useSearchParams();
  const activeGrade = searchParams.get('grade') || 'all';

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await coursesAPI.getAll();
        setAllCourses(response.data.data.courses || []);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSelectGrade = (grade) => {
    if (grade === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ grade });
    }
  };

  const displayGrades = activeGrade === 'all'
    ? gradesList
    : [activeGrade];

  return (
    <div className="courselist-page-container">
      <div className="courselist-hero">
        <div className="hero-badge">🌟 Primary School Curriculum</div>
        <h1 className="hero-title">Interactive Lessons &amp; AI Quizzes</h1>
        <p className="hero-subtitle">
          Explore lessons from Primary 1 to Primary 6. Each topic includes downloadable PDF study materials,
          AI summaries, and interactive quizzes!
        </p>

        {/* Grade Filter Pills */}
        <div className="grade-filter-pills">
          <button
            className={`filter-pill ${activeGrade === 'all' ? 'active' : ''}`}
            onClick={() => handleSelectGrade('all')}
          >
            All Grades 🌈
          </button>
          {gradesList.map((g) => (
            <button
              key={g}
              className={`filter-pill ${activeGrade === g ? 'active' : ''}`}
              onClick={() => handleSelectGrade(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Catalog View Toggle on Browse page */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <div className="catalog-view-toggle">
            <span className="toggle-label">Layout:</span>
            <div className="toggle-btn-group">
              <button
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                📱 Grid Catalog
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'carousel' ? 'active' : ''}`}
                onClick={() => setViewMode('carousel')}
              >
                🎠 Carousel Slider
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="courselist-loading-box">
          <div className="spinner"></div>
          <p>Loading Primary 1 – 6 Curriculum...</p>
        </div>
      ) : error ? (
        <div className="course-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grade-rows-stack">
          {displayGrades.map((gradeLevel) => {
            const coursesForGrade = allCourses.filter((c) => c.gradeLevel === gradeLevel);
            return (
              <GradeRow
                key={gradeLevel}
                gradeLevel={gradeLevel}
                courses={coursesForGrade}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseList;
