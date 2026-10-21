// Forgot password: request a reset link by email
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../services/api';
import './login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-emoji">🔑</span>
          <h2>Forgot Password?</h2>
          <p className="login-subtitle">
            Enter your email and we&apos;ll send you a link to reset it
          </p>
        </div>

        {sent ? (
          <>
            <div className="login-error" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
              ✅ If an account exists for <strong>{email}</strong>, a reset link is on its way.
              Check your inbox (and spam folder) — the link expires in 30 minutes.
            </div>
            <p className="login-footer">
              Remembered it? <Link to="/login">Back to sign in</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? '⏳ Sending...' : '📨 Send Reset Link'}
            </button>
          </form>
        )}

        {!sent && (
          <p className="login-footer">
            Remembered it? <Link to="/login">Back to sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
