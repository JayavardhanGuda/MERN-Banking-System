import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaShieldAlt, FaLock, FaTimes,
  FaArrowRight, FaKey, FaCheckCircle
} from 'react-icons/fa';
import '../styles/Login.css';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [userId, setUserId]               = useState('');
  const [otp, setOtp]                     = useState('');
  const [generatedOtp, setGeneratedOtp]   = useState('');
  const [otpSent, setOtpSent]             = useState(false);
  const [timeLeft, setTimeLeft]           = useState(0);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const [modalOpen, setModalOpen]         = useState(false);

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

  /* OTP countdown */
  useEffect(() => {
    if (timeLeft <= 0) {
      if (otpSent) setError('OTP has expired. Please resend to get a new code.');
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, otpSent]);

  /* ── Send OTP ── */
  const handleSendOtp = () => {
    setError('');
    setSuccessMsg('');

    const input = userId.trim().toLowerCase();
    if (!input) {
      setError('Please enter your User ID, email, or account number first.');
      return;
    }

    /* Validate: user must already be registered */
    const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const match = accounts.find(acc =>
      acc.username?.toLowerCase() === input ||
      acc.email?.toLowerCase()    === input ||
      acc.accountNumber           === userId.trim()
    );

    if (!match) {
      setError('No registered account found for this User ID. Please check and try again.');
      return;
    }

    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(generated);
    setOtpSent(true);
    setTimeLeft(30);
    setOtp('');

    /* OTP goes to console only — NOT displayed on screen */
    console.log(`%c[ForgotPassword] OTP for "${userId.trim()}": ${generated}`, 'color:#c9a84c;font-weight:bold;font-size:14px');

    setSuccessMsg(`OTP sent to the registered contact for "${match.username || match.email}". Check the browser console.`);
  };

  /* ── Verify OTP & proceed ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!otpSent) {
      setError('Please send the OTP first.');
      return;
    }
    if (timeLeft <= 0) {
      setError('OTP has expired. Please resend.');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }
    if (otp.trim() !== generatedOtp) {
      setError('Incorrect OTP. Please try again.');
      return;
    }

    document.getElementById('root')?.classList.remove('page-blurred');
    navigate('/reset-password', {
      state: {
        userId,
        backgroundLocation: window.history.state?.usr?.backgroundLocation
      }
    });
  };

  return (
    <div
      className={`lm-overlay${modalOpen ? ' lm-overlay--visible' : ''}`}
      onClick={closeModal}
      aria-modal="true"
      role="dialog"
      aria-label="Forgot Password"
    >
      <div
        className={`lm-card${modalOpen ? ' lm-card--open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left strip ── */}
        <div className="lm-card__strip">
          <span className="lm-card__strip-icon">🔑</span>
          <div className="lm-card__strip-name">Password Recovery</div>
          <div className="lm-card__strip-tagline">PavitraBandham Cooperative Bank</div>

          <div className="lm-card__strip-features">
            {[
              { icon: <FaShieldAlt />,   text: 'Secure OTP Verification' },
              { icon: <FaCheckCircle />, text: 'Registered Users Only' },
              { icon: <FaLock />,        text: 'Encrypted Reset Process' },
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

          <span className="login-eyebrow">Account Recovery</span>
          <h2 className="lm-card__title">Forgot Password?</h2>
          <p className="lm-card__sub">
            Enter your registered User ID or email to receive a one-time password.
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
            {successMsg && !error && (
              <div className="lm-success">
                <FaCheckCircle className="lm-success__icon" />
                {successMsg}
              </div>
            )}

            {/* User ID field */}
            <div className="form-group">
              <label htmlFor="fp-userId">User ID / Email / Account Number</label>
              <div className="input-group">
                <input
                  type="text"
                  id="fp-userId"
                  value={userId}
                  onChange={e => { setUserId(e.target.value); setError(''); setSuccessMsg(''); }}
                  placeholder="Enter your registered User ID or email"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Send OTP row */}
            <div className="fp-otp-row">
              <button
                type="button"
                className="fp-otp-btn"
                onClick={handleSendOtp}
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
              {timeLeft > 0 && (
                <span className="fp-otp-timer">
                  Expires in <strong>{timeLeft}s</strong>
                </span>
              )}
            </div>

            {/* OTP field */}
            <div className="form-group">
              <label htmlFor="fp-otp">Enter OTP</label>
              <div className="input-group">
                <input
                  type="text"
                  id="fp-otp"
                  value={otp}
                  onChange={e => { setOtp(e.target.value); setError(''); }}
                  placeholder="Enter the 6-digit OTP"
                  maxLength={6}
                  inputMode="numeric"
                  disabled={!otpSent || timeLeft <= 0}
                />
              </div>
            </div>

            <button type="submit" className="login-btn lm-submit-btn">
              Verify &amp; Proceed <FaArrowRight />
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
