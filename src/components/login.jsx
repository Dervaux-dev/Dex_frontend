// Login page that uses AuthContext, shows errors via toast, and redirects on success
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData);
      if (result.success) {
        toast.success('🎉 Welcome back! Ready to learn?');
        // If logging in as admin, navigate directly to /admin
        const idLower = formData.identifier.toLowerCase();
        if (idLower.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.message || 'Login failed. Please try again.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setLoading(true);
    try {
      const result = await login({
        identifier: 'admin@dexelearning.com',
        password: 'Admin@12345'
      });
      if (result.success) {
        toast.success('👑 Welcome Administrator!');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-emoji">🎓</span>
          <h2>Welcome Back!</h2>
          <p className="login-subtitle">Sign in to continue your learning journey</p>
        </div>

        {/* Quick Admin Test Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f3e8ff, #fce7f3)',
          border: '1.5px dashed #a855f7',
          borderRadius: '16px',
          padding: '14px 16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            👑 Administrator Testing
          </div>
          <p style={{ fontSize: '0.84rem', color: '#6b21a8', margin: '0 0 10px', lineHeight: '1.4' }}>
            Want to test the <strong>Admin Dashboard</strong> (/admin)? Click below to sign in instantly.
          </p>
          <button
            type="button"
            onClick={handleQuickAdmin}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
          >
            ⚡ 1-Click Admin Access (/admin)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email or Full Name</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="your@email.com or admin@dexelearning.com"
              value={formData.identifier}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🚀 Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
