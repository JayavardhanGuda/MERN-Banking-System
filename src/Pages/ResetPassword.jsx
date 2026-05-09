import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaLock, FaEye, FaEyeSlash, FaShieldAlt,
  FaTimes, FaArrowRight, FaCheckCircle
} from 'react-icons/fa';
import '../styles/Login.css';

export default function ResetPassword() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const userId    = location.state?.userId || '';

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData]                   = useState({ password: '', confirmPassword: '' });
  const [error, setError]                         = useState('');
  const [successMsg, setSuccessMsg]               = useState('');
  const [modalOpen, setModalOpen]                 = useState(false);

  /* Animate in */
  useEffect(() => {
    const t = setTimeout(() => setModalOpen(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Close → go back */
  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.getElementById('root')?.classList.remove('page-blurred');
    document.body.style.overflow = '';
    setTimeout(() => navigate(-1), 280);
  }, [navigate]);

  /* Escape key */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal]);

  /* Blur root */
  useEffect(() => {
    const root = document.getElementById('root');
    if (modalOpen) {
      root?.classList.add('page-blurred');
      document.body.style.overflow = 'hidden';
    } else {
      root?.classList.remove('page-blurred');
      document.body.style.overflow = '';
    }
    return () => {
      root?.classList.remove('page-blurred');
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.password || !formData.confirmPassword) {
      setError('Both password fields are required.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const input = userId.trim().toLowerCase();
    const idx = storedAccounts.findIndex(acc =>
      acc.username?.toLowerCase() === input ||
      acc.email?.toLowerCase()    === input ||
      acc.accountNumber           === userId.trim()
    );

    if (idx === -1) {
      setError('No matching account found. Please go back and enter the correct User ID.');
      return;
    }

    storedAccounts[idx].password = formData.password;
    localStorage.setItem('bankAccounts', JSON.stringify(storedAccounts));

    /* Update currentUser session if it matches */
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.accountNumber === storedAccounts[idx].accountNumber) {
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, password: formData.password }));
    }

    setSuccessMsg('Password updated successfully! Redirecting to login…');
    document.getElementById('root')?.classList.remove('page-blurred');

    setTimeout(() => {
      document.body.style.overflow = '';
      navigate('/login');
    }, 1400);
  };

  return (
    <div
      className={`lm-overlay${modalOpen ? ' lm-overlay--visible' : ''}`}
      onClick={closeModal}
      aria-modal="true"
      role="dialog"
      aria-label="Reset Password"
    >
      <div
        className={`lm-card${modalOpen ? ' lm-card--open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left strip ── */}
        <div className="lm-card__strip">
          <span className="lm-card__strip-icon">🔒</span>
          <div className="lm-card__strip-name">Set New Password</div>
          <div className="lm-card__strip-tagline">PavitraBandham Cooperative Bank</div>

          <div className="lm-card__strip-features">
            {[
              { icon: <FaShieldAlt />,   text: 'Secure Password Reset' },
              { icon: <FaCheckCircle />, text: 'Min. 8 Characters Required' },
              { icon: <FaLock />,        text: 'Encrypted & Protected' },
            ].map((f, i) => (
              <div key={i} className="lm-card__strip-feature">
                <div className="lm-card__strip-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="lm-card__strip-ssl">
            <FaShieldAlt /> 256-bit SSL Encrypted
          </div>
        </div>

        {/* ── Right form ── */}
        <div className="lm-card__form">
          <button className="lm-close" onClick={closeModal} aria-label="Close">
            <FaTimes />
          </button>

          <span className="login-eyebrow">Password Reset</span>
          <h2 className="lm-card__title">Create New Password</h2>
          <p className="lm-card__sub">
            {userId
              ? <>Resetting password for <strong>{userId}</strong></>
              : 'Enter and confirm your new password below.'}
          </p>

          <form onSubmit={handleSubmit} className="login-form">

            {/* Error banner */}
            {error && (
              <div className="lm-error">
                <FaTimes className="lm-error__icon" />
                {error}
              </div>
            )}

            {/* Success banner */}
            {successMsg && (
              <div className="lm-success">
                <FaCheckCircle className="lm-success__icon" />
                {successMsg}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="rp-password">New Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="rp-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password (min. 8 characters)"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rp-confirm">Confirm New Password</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="rp-confirm"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn lm-submit-btn" disabled={!!successMsg}>
              Update Password <FaArrowRight />
            </button>
          </form>

          <div className="lm-card__footer">
            <p>
              Remembered your password?{' '}
              <Link to="/login" className="register-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
