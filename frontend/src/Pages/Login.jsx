import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser, FaLock, FaEye, FaEyeSlash,
  FaShieldAlt, FaTimes, FaArrowRight, FaSpinner
} from 'react-icons/fa';
import { loginUser, adminLogin } from '../services/api';
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
  const [sessionMessage, setSessionMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* Animate in */
  useEffect(() => {
    const t = setTimeout(() => setModalOpen(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Pick up session-expired message set by apiCall before redirect */
  useEffect(() => {
    const msg = sessionStorage.getItem('sessionExpiredMessage');
    if (msg) {
      setSessionMessage(msg);
      sessionStorage.removeItem('sessionExpiredMessage');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = formData.username.trim();
    const password = formData.password;

    setIsLoading(true);
    setLoginError('');

    try {
      // Check if this is the admin username — if so go straight to admin login,
      // skip user login entirely. This avoids polluting backend logs with failed
      // user lookups for the admin account and vice versa.
      const isAdminUsername = username === 'vjnadmin';

      if (isAdminUsername) {
        const adminResponse = await adminLogin({ username, password });

        if (adminResponse.success) {
          localStorage.setItem('adminToken', adminResponse.token);
          localStorage.setItem('adminSession', JSON.stringify({
            isAdmin: true,
            username: adminResponse.data.username,
            loginTime: new Date().toISOString()
          }));
          document.getElementById('root')?.classList.remove('page-blurred');
          navigate('/admin-dashboard', { replace: true });
        } else {
          // Use the actual server message — this shows "Too many attempts"
          // when rate limit is hit, or "Invalid admin credentials" otherwise
          setLoginError(adminResponse.message || 'Invalid admin credentials.');
        }
        return;
      }

      // Regular user login
      const response = await loginUser({ username, password });

      if (response.success) {
        // Token storage respects rememberMe:
        // - rememberMe ON  → localStorage  (survives browser close)
        // - rememberMe OFF → sessionStorage (clears when tab closes)
        const tokenStorage = formData.rememberMe ? localStorage : sessionStorage;
        tokenStorage.setItem('authToken', response.token);

        // currentUser always goes to localStorage so UserDashboard
        // can reliably read it regardless of rememberMe state.
        localStorage.setItem('currentUser', JSON.stringify(response.data));

        window.dispatchEvent(new Event('userSessionChanged'));
        document.getElementById('root')?.classList.remove('page-blurred');
        navigate('/user-dashboard');
      } else {
        setLoginError(response.message || 'Invalid username/email or password.');
      }

    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            {/* Session expired banner */}
            {sessionMessage && !loginError && (
              <div className="lm-session-expired">
                <FaShieldAlt className="lm-session-expired__icon" />
                {sessionMessage}
              </div>
            )}

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

            <button type="submit" className="login-btn lm-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <><FaSpinner className="spinner" /> Signing In...</>
              ) : (
                <>Sign In Securely <FaArrowRight /></>
              )}
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
