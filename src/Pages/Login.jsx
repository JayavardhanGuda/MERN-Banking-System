import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser, FaLock, FaEye, FaEyeSlash,
  FaShieldAlt, FaTimes, FaArrowRight
} from 'react-icons/fa';
import '../styles/Login.css';

/**
 * Login is now a pure modal overlay — it does NOT render its own
 * Header/Footer/background. The actual page the user was on stays
 * fully visible behind the blurred overlay, so the backdrop is
 * always the real current page.
 */
export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
  const [loginError, setLoginError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  /* Animate in */
  useEffect(() => {
    const t = setTimeout(() => setModalOpen(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Close → go back to the page the user was on */
  const closeModal = useCallback(() => {
    setModalOpen(false);
    // Remove blur class from app root immediately on close
    document.getElementById('root')?.classList.remove('page-blurred');
    setTimeout(() => navigate(-1), 280);
  }, [navigate]);

  /* Escape key */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal]);

  /* Blur the app root (everything behind the modal) */
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (loginError) setLoginError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = formData.username.trim().toLowerCase();
    const password = formData.password;

    if (email === 'admin-vjn@gmail.com' && password === 'admin@123') {
      document.getElementById('root')?.classList.remove('page-blurred');
      navigate('/admin-dashboard');
      return;
    }

    const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const userAccount = storedAccounts.find(acc =>
      (acc.username.toLowerCase() === email || acc.email.toLowerCase() === email) &&
      acc.password === password
    );

    if (!userAccount || userAccount.status !== 'Approved') {
      setLoginError('Invalid username / email or password.');
      return;
    }

    setLoginError('');
    localStorage.setItem('currentUser', JSON.stringify(userAccount));
    document.getElementById('root')?.classList.remove('page-blurred');
    navigate('/user-dashboard');
  };

  return (
    /* The modal sits on top of whatever page is already rendered */
    <div
      className={`lm-overlay${modalOpen ? ' lm-overlay--visible' : ''}`}
      onClick={closeModal}
      aria-modal="true"
      role="dialog"
      aria-label="Sign in"
    >
      <div
        className={`lm-card${modalOpen ? ' lm-card--open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left decorative strip ── */}
        <div className="lm-card__strip">
          <span className="lm-card__strip-icon">🏛</span>
          <div className="lm-card__strip-name">VJN<br />Cooperative Bank</div>
          <div className="lm-card__strip-tagline">Empowering trust, enabling growth</div>

          <div className="lm-card__strip-features">
            {[
              { icon: <FaShieldAlt />, text: 'Bank-grade Security' },
              { icon: <FaUser />,      text: 'DICGC Insured Deposits' },
              { icon: <FaLock />,      text: '24/7 Secure Access' },
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

          <span className="login-eyebrow">Welcome Back</span>
          <h2 className="lm-card__title">Sign In to Your Account</h2>
          <p className="lm-card__sub">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="login-form">
            {loginError && (
              <div className="lm-error">
                <FaTimes className="lm-error__icon" />
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="lm-username">Email / Customer ID</label>
              <div className="input-group">
                 <input
                  type="text"
                  id="lm-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your email or customer ID"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lm-password">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="lm-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span className="checkmark" />
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-btn lm-submit-btn">
              Sign In Securely <FaArrowRight />
            </button>
          </form>

          <div className="lm-card__footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="register-link">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
