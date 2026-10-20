/* eslint-disable no-unused-vars */
// Register form with full redesign
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import './register.css';

const getPasswordChecks = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  symbol: /[^A-Za-z0-9]/.test(password),
});

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const checks = getPasswordChecks(formData.password);
  const passwordValid = Object.values(checks).every(Boolean);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!passwordValid) {
      toast.error('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        toast.success('🎉 Account created! Welcome to DexElearning!');
        navigate('/login');
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <span className="register-emoji">🌟</span>
          <h2>Join DexElearning!</h2>
          <p className="register-subtitle">Create your free student account today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="Your full name"
              value={formData.fullname}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              required
              disabled={loading}
              aria-invalid={touched && !passwordValid}
            />
            <ul className={`password-checklist ${touched && !passwordValid ? 'invalid' : ''}`}>
              <li className={checks.length ? 'met' : ''}>{checks.length ? '✓' : '○'} At least 8 characters</li>
              <li className={checks.uppercase ? 'met' : ''}>{checks.uppercase ? '✓' : '○'} One uppercase letter (A–Z)</li>
              <li className={checks.lowercase ? 'met' : ''}>{checks.lowercase ? '✓' : '○'} One lowercase letter (a–z)</li>
              <li className={checks.number ? 'met' : ''}>{checks.number ? '✓' : '○'} One number (0–9)</li>
              <li className={checks.symbol ? 'met' : ''}>{checks.symbol ? '✓' : '○'} One symbol (!@#$…)</li>
            </ul>
          </div>
          <button className="register-btn" type="submit" disabled={loading || !passwordValid}>
            {loading ? '⏳ Creating account...' : '✨ Create My Account'}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
