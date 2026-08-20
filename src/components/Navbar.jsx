import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="kids-navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <span className="logo-icon">🎈</span>
          <div className="logo-text">
            <span className="brand-title">DexElearning</span>
            <span className="brand-tag">Primary 1 – Primary 6</span>
          </div>
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <div className={`nav-menu-box ${menuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>
              🏠 Home
            </Link>
            <Link to="/courses" className="nav-item" onClick={() => setMenuOpen(false)}>
              📚 Primary Grades
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>
                  ⭐ My Dashboard
                </Link>
                {isAdmin && (
                  <>
                    <Link to="/admin" className="nav-item admin-link" onClick={() => setMenuOpen(false)}>
                      🛠 Admin Portal
                    </Link>
                    <Link to="/admin/lessons" className="nav-item admin-link" onClick={() => setMenuOpen(false)}>
                      ⚡ Upload PDF & AI Quiz
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="nav-user-actions">
            {isAuthenticated ? (
              <div className="user-profile-pill">
                <span className="avatar-circle">
                  {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="user-name">{user?.fullname || 'Student'}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Exit
                </button>
              </div>
            ) : (
              <div className="auth-btn-group">
                <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="signup-btn" onClick={() => setMenuOpen(false)}>
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
