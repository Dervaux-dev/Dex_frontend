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
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">DexElearning</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`toggle-icon ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/courses" className="nav-link" onClick={() => setMenuOpen(false)}>
              Courses
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Wishlist
                </Link>
                <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="nav-link nav-admin" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

<div className="navbar-actions">
            {isAuthenticated ? (
              <div className="user-menu">
                <Link to="/profile" className="nav-link user-name" onClick={() => setMenuOpen(false)}>
                  <span className="avatar-icon">
                    {user?.fullname?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="user-fullname">{user?.fullname || user?.name || 'User'}</span>
                </Link>
                <button className="nav-btn btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="nav-btn btn-login"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-btn btn-register"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

