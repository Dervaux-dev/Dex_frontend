// Reset password: set a new password using the emailed token
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../services/api';
import PasswordInput from './PasswordInput';
import './login.css';

const STRONG_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ResetPassword = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Support both /password-reset/:userId/:token and /reset-password?token=...
  const userId = params.userId || '';
  const token = params.token || searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (!STRONG_RE.test(password)) {
      toast.error('Password must be 8+ characters with uppercase, lowercase, number, and symbol');
      return;
    }
    setLoading(true);
    try {
      if (userId && token) {
        // Step 2 Confirm Reset endpoint: POST /password-reset/:userId/:token
        await authAPI.resetPasswordWithParams(userId, token, { password });
      } else {
        // Fallback for query-token endpoint: POST /auth/reset-password
        await authAPI.resetPassword({ token, password });
      }
      toast.success('✅ Password reset! Sign in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <span className="login-emoji">🔗</span>
            <h2>Invalid Link</h2>
            <p className="login-subtitle">This reset link is incomplete. Request a fresh one below.</p>
          </div>
          <p className="login-footer">
            <Link to="/forgot-password">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-emoji">🛡️</span>
          <h2>Set New Password</h2>
          <p className="login-subtitle">Choose a strong password you haven&apos;t used before</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <PasswordInput
              id="password"
              placeholder="8+ chars, upper, lower, number, symbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoFocus
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <PasswordInput
              id="confirm"
              placeholder="Repeat your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? '⏳ Saving...' : '💾 Save New Password'}
          </button>
        </form>

        <p className="login-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
