import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSelector from './LanguageSelector';
import NurserySongsModal from './NurserySongsModal';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNursery, setShowNursery] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <>
      <header className="kids-navbar">
        <div className="navbar-container">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">🎈</span>
            <div className="logo-text">
              <span className="brand-title">DexElearning</span>
              <span className="brand-tag">{t('nav.tagline', 'Primary 1 – Primary 6')}</span>
            </div>
          </Link>

          {/* Mobile action bar with quick language rotation button */}
          <div className="mobile-nav-actions">
            <ThemeToggle />
            <LanguageSelector />
            <button
              className="mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
          </div>

          <div className={`nav-menu-box ${menuOpen ? 'open' : ''}`}>
            <nav className="nav-links">
              <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>
                🏠 {t('nav.home', 'Home')}
              </Link>
              <Link to="/courses" className="nav-item" onClick={() => setMenuOpen(false)}>
                📚 {t('nav.grades', 'Primary Grades')}
              </Link>

              {/* Dedicated Nursery Songs Button */}
              <button
                type="button"
                className="nav-item nursery-nav-pill"
                onClick={() => {
                  setShowNursery(true);
                  setMenuOpen(false);
                }}
                title="Fun songs and rhymes for nursery students"
              >
                🧸 Nursery Songs
              </button>

              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>
                    ⭐ {t('nav.dashboard', 'My Dashboard')}
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin" className="nav-item admin-link" onClick={() => setMenuOpen(false)}>
                        🛠 {t('nav.adminPortal', 'Admin Portal')}
                      </Link>
                      <Link to="/admin/lessons" className="nav-item admin-link" onClick={() => setMenuOpen(false)}>
                        ⚡ {t('nav.adminLessons', 'Upload PDF & AI Quiz')}
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            <div className="nav-user-actions">
              <ThemeToggle />
              <div className="desktop-lang-selector">
                <LanguageSelector />
              </div>

              {isAuthenticated ? (
                <div className="user-profile-pill">
                  <span className="avatar-circle">
                    {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="user-name">{user?.fullname || 'Student'}</span>
                  <button className="logout-btn" onClick={handleLogout}>
                    {t('nav.exit', 'Exit')}
                  </button>
                </div>
              ) : (
                <div className="auth-btn-group">
                  <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
                    {t('nav.login', 'Log In')}
                  </Link>
                  <Link to="/register" className="signup-btn" onClick={() => setMenuOpen(false)}>
                    {t('nav.signup', 'Sign Up Free')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Nursery Songs Modal */}
      <NurserySongsModal isOpen={showNursery} onClose={() => setShowNursery(false)} />
    </>
  );
};

export default Navbar;
