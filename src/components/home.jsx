import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import GradeRow from './GradeRow';
import './Home.css';

const gradeBadges = [
  { grade: 'Primary 1', icon: '🎒', color: 'linear-gradient(135deg, #ff6b6b, #ff8787)', desc: 'Ages 6–7' },
  { grade: 'Primary 2', icon: '🎨', color: 'linear-gradient(135deg, #ff922b, #ffb347)', desc: 'Ages 7–8' },
  { grade: 'Primary 3', icon: '🚀', color: 'linear-gradient(135deg, #fcc419, #ffe066)', desc: 'Ages 8–9' },
  { grade: 'Primary 4', icon: '🧬', color: 'linear-gradient(135deg, #51cf66, #8ce99a)', desc: 'Ages 9–10' },
  { grade: 'Primary 5', icon: '🌍', color: 'linear-gradient(135deg, #339af0, #74c0fc)', desc: 'Ages 10–11' },
  { grade: 'Primary 6', icon: '🏆', color: 'linear-gradient(135deg, #845ef7, #b197fc)', desc: 'Ages 11–12' },
];

const GRADE_LEVELS = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'];

const Home = () => {
  const [coursesByGrade, setCoursesByGrade] = useState({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCoursesByGrade = async () => {
      try {
        // Try grouped endpoint first; fall back to getAll and group client-side
        try {
          const response = await coursesAPI.getByGrade();
          setCoursesByGrade(response.data.data.coursesByGrade || {});
        } catch {
          // Fallback: fetch all and group
          const response = await coursesAPI.getAll();
          const all = response.data.data.courses || [];
          const grouped = {};
          GRADE_LEVELS.forEach((g) => {
            grouped[g] = all.filter((c) => c.gradeLevel === g);
          });
          setCoursesByGrade(grouped);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesByGrade();
  }, []);

  return (
    <div className="home-container">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="kids-hero">
        <div className="hero-badge-pill">🎈 Fun Learning for Primary 1 – Primary 6</div>
        <h1 className="kids-hero-title">
          Learn, Play &amp; Master <br />
          <span className="highlight-text">Primary School Subjects!</span>
        </h1>
        <p className="kids-hero-desc">
          Download PDF lessons, read instant AI study notes, and take fun interactive quizzes!
          Slide left or right to explore your grade level below.
        </p>

        <div className="hero-cta-buttons">
          <Link to="/courses" className="primary-kids-btn">
            🚀 Browse All Courses
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="secondary-kids-btn">
              ✨ Join as Student
            </Link>
          )}
        </div>

        {/* Grade shortcut cards */}
        <div className="grade-shortcuts-grid">
          {gradeBadges.map((gb) => (
            <Link
              key={gb.grade}
              to={`/courses?grade=${encodeURIComponent(gb.grade)}`}
              className="grade-shortcut-card"
              style={{ background: gb.color }}
            >
              <span className="shortcut-icon">{gb.icon}</span>
              <span className="shortcut-title">{gb.grade}</span>
              <span className="shortcut-desc">{gb.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Feature Highlights ───────────────────────── */}
      <section className="features-highlight-section">
        <div className="feature-card">
          <div className="feature-icon">📄</div>
          <h3>PDF Study Lessons</h3>
          <p>Curriculum-aligned PDF lessons for Primary 1 through 6 learners.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI Study Summaries</h3>
          <p>Complex topics simplified into easy bullet-point notes by AI.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>AI Interactive Quizzes</h3>
          <p>Test knowledge with auto-graded multiple-choice quizzes per chapter.</p>
        </div>
      </section>

      {/* ── Grade Rows ───────────────────────────────── */}
      <section className="home-grade-rows-section">
        <div className="section-header-box">
          <h2 className="section-main-title">Primary 1 to Primary 6 Courses</h2>
          <p className="section-sub-title">Slide left or right on any grade row to find your class topics!</p>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="loading-spinner" />
            <span>Loading grade rows...</span>
          </div>
        ) : (
          GRADE_LEVELS.map((grade) => (
            <GradeRow
              key={grade}
              gradeLevel={grade}
              courses={coursesByGrade[grade] || []}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default Home;
