import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaLock, FaEye, FaEyeSlash, FaShieldAlt,
  FaTimes, FaArrowRight, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { resetPassword } from '../services/api';
import '../styles/Login.css';

export default function ResetPassword() {
  const location  = useLocation();
  const navigate  = useNavigate();
  
  // Get data from navigation state (from ForgotPassword)
  const accountNumber = location.state?.accountNumber || '';
  const resetToken = location.state?.resetToken || '';
  const userEmail = location.state?.email || '';
  const firstName = location.state?.firstName || '';

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData]                   = useState({ password: '', confirmPassword: '' });
  const [error, setError]                         = useState('');
  const [successMsg, setSuccessMsg]               = useState('');
  const [loading, setLoading]                     = useState(false);
  const [modalOpen, setModalOpen]                 = useState(false);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  /* Redirect if no reset token */
  useEffect(() => {
    if (!resetToken || !accountNumber) {
      navigate('/forgot-password');
    }
  }, [resetToken, accountNumber, navigate]);

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

  /* Password validation */
  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(v => v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.password || !formData.confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (!isPasswordValid()) {
      setError('Password does not meet all requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(accountNumber, resetToken, formData.password);

      if (!response.success) {
        setError(response.message || 'Failed to reset password. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Password updated successfully! Redirecting to login…');
      document.getElementById('root')?.classList.remove('page-blurred');

      setTimeout(() => {
        document.body.style.overflow = '';
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  // Validation check component
  const ValidationCheck = ({ valid, text }) => (
    <div className={`password-check ${valid ? 'valid' : 'invalid'}`}>
      {valid ? <FaCheckCircle className="check-icon valid" /> : <FaTimesCircle className="check-icon invalid" />}
      <span>{text}</span>
    </div>
  );

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
          <div className="lm-card__strip-tagline">VJN Cooperative Bank</div>

          <div className="lm-card__strip-features">
            {[
              { icon: <FaShieldAlt />,   text: 'Secure Password Reset' },
              { icon: <FaCheckCircle />, text: 'Strong Password Required' },
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

          <span className="login-eyebrow">Final Step: Password Reset</span>
          <h2 className="lm-card__title">Create New Password</h2>
          <p className="lm-card__sub">
            {firstName 
              ? <>Hello <strong>{firstName}</strong>! Create a strong password for your account.</>
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

            {/* Account info */}
            {accountNumber && (
              <div className="verified-user-info">
                <FaCheckCircle className="verified-icon" />
                <span>Account: <strong>{accountNumber}</strong></span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="rp-password">New Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="rp-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                  disabled={loading || !!successMsg}
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

            {/* Password requirements */}
            {formData.password && (
              <div className="password-requirements">
                <p className="requirements-title">Password Requirements:</p>
                <div className="requirements-grid">
                  <ValidationCheck valid={passwordValidation.minLength} text="At least 8 characters" />
                  <ValidationCheck valid={passwordValidation.hasUppercase} text="One uppercase letter (A-Z)" />
                  <ValidationCheck valid={passwordValidation.hasLowercase} text="One lowercase letter (a-z)" />
                  <ValidationCheck valid={passwordValidation.hasNumber} text="One number (0-9)" />
                  <ValidationCheck valid={passwordValidation.hasSpecial} text="One special character (@$!%*?&)" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="rp-confirm">Confirm New Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="rp-confirm"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                  disabled={loading || !!successMsg}
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
              {/* Password match indicator */}
              {formData.confirmPassword && (
                <div className={`password-match-indicator ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                  {formData.password === formData.confirmPassword 
                    ? <><FaCheckCircle /> Passwords match</>
                    : <><FaTimesCircle /> Passwords do not match</>
                  }
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="login-btn lm-submit-btn" 
              disabled={loading || !!successMsg || !isPasswordValid() || formData.password !== formData.confirmPassword}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
              {!loading && <FaArrowRight />}
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
