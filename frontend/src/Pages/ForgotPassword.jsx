import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaShieldAlt, FaLock, FaTimes,
  FaArrowRight, FaKey, FaCheckCircle, FaEnvelope
} from 'react-icons/fa';
import { verifyEmailExists, sendForgotPasswordOtp, verifyForgotPasswordOtp } from '../services/api';
import '../styles/Login.css';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step management: 1 = Enter Email, 2 = OTP Verification
  const [step, setStep] = useState(1);
  
  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // Verified user data
  const [verifiedUser, setVerifiedUser] = useState(null);
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // UI states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  /* ── Step 1: Verify Email ── */
  const handleVerifyEmail = async () => {
    setError('');
    setSuccessMsg('');

    const inputEmail = email.trim();
    if (!inputEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyEmailExists(inputEmail);

      if (!response.success) {
        setError(response.message || 'Email verification failed.');
        setLoading(false);
        return;
      }

      // Store verified user data
      setVerifiedUser(response.data);
      setSuccessMsg(`Email verified! Account found for ${response.data.firstName}. Proceeding to send OTP...`);
      
      // Automatically send OTP after email verification
      setTimeout(async () => {
        await handleSendOtp(response.data);
      }, 1000);

    } catch (err) {
      setError('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  /* ── Step 2: Send OTP ── */
  const handleSendOtp = async (userData = verifiedUser) => {
    setError('');
    
    if (!userData) {
      setError('Please verify your email first.');
      return;
    }

    setLoading(true);

    try {
      const response = await sendForgotPasswordOtp(email.trim(), userData.accountNumber);

      if (!response.success) {
        setError(response.message || 'Failed to send OTP.');
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setTimeLeft(300); // 5 minutes
      setOtp('');
      setStep(2);
      
      // Show OTP in console for testing (remove in production)
      if (response.data?.otp) {
        console.log(`%c[ForgotPassword] OTP: ${response.data.otp}`, 'color:#c9a84c;font-weight:bold;font-size:14px');
      }

      setSuccessMsg(response.message);

    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    setError('');
    setSuccessMsg('');
    await handleSendOtp();
  };

  /* ── Step 3: Verify OTP & Proceed ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      // Verify email
      await handleVerifyEmail();
      return;
    }

    // Step 2: Verify OTP
    if (!otpSent) {
      setError('Please wait for OTP to be sent.');
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
    if (otp.trim().length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyForgotPasswordOtp(verifiedUser.accountNumber, otp.trim());

      if (!response.success) {
        setError(response.message || 'OTP verification failed.');
        setLoading(false);
        return;
      }

      // OTP verified, navigate to reset password
      setSuccessMsg('OTP verified! Redirecting to reset password...');
      
      document.getElementById('root')?.classList.remove('page-blurred');
      
      setTimeout(() => {
        navigate('/reset-password', {
          state: {
            accountNumber: verifiedUser.accountNumber,
            resetToken: response.data.resetToken,
            email: email.trim(),
            firstName: verifiedUser.firstName,
            backgroundLocation: window.history.state?.usr?.backgroundLocation
          }
        });
      }, 1000);

    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  /* Format time remaining */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <div className="lm-card__strip-tagline">VJN Cooperative Bank</div>

          <div className="lm-card__strip-features">
            {[
              { icon: <FaEnvelope />, text: 'Email Verification' },
              { icon: <FaKey />, text: 'OTP to Email' },
              { icon: <FaShieldAlt />, text: 'Secure Reset Process' },
            ].map((f, i) => (
              <div key={i} className="lm-card__strip-feature">
                <div className="lm-card__strip-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Step indicator */}
          <div className="lm-card__strip-steps">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-text">Verify Email</span>
            </div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-text">Enter OTP</span>
            </div>
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

          <span className="login-eyebrow">
            {step === 1 ? 'Step 1: Email Verification' : 'Step 2: OTP Verification'}
          </span>
          <h2 className="lm-card__title">Forgot Password?</h2>
          <p className="lm-card__sub">
            {step === 1 
              ? 'Enter your registered email address to receive a one-time password.'
              : `OTP sent to ${verifiedUser?.maskedEmail || email}`}
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

            {/* Step 1: Email field */}
            {step === 1 && (
              <div className="form-group">
                <label htmlFor="fp-email">Registered Email Address</label>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="fp-email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); setSuccessMsg(''); }}
                    placeholder="Enter your registered email"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Step 2: OTP verification */}
            {step === 2 && (
              <>
                {/* Show verified user info */}
                {verifiedUser && (
                  <div className="verified-user-info">
                    <FaCheckCircle className="verified-icon" />
                    <span>Account: <strong>{verifiedUser.username}</strong> ({verifiedUser.accountNumber})</span>
                  </div>
                )}

                {/* OTP Timer */}
                {timeLeft > 0 && (
                  <div className="otp-timer">
                    <FaKey className="timer-icon" />
                    <span>OTP expires in <strong>{formatTime(timeLeft)}</strong></span>
                  </div>
                )}

                {/* OTP field */}
                <div className="form-group">
                  <label htmlFor="fp-otp">Enter 6-Digit OTP</label>
                  <div className="input-group">
                    <FaKey className="input-icon" />
                    <input
                      type="text"
                      id="fp-otp"
                      value={otp}
                      onChange={e => { 
                        const val = e.target.value.replace(/\D/g, '');
                        setOtp(val);
                        setError(''); 
                      }}
                      placeholder="Enter OTP sent to your email"
                      maxLength={6}
                      inputMode="numeric"
                      disabled={!otpSent || timeLeft <= 0 || loading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Resend OTP button */}
                <div className="fp-otp-row">
                  <button
                    type="button"
                    className="fp-otp-btn"
                    onClick={handleResendOtp}
                    disabled={loading || (timeLeft > 240)} // Can resend after 1 minute
                  >
                    {loading ? 'Sending...' : 'Resend OTP'}
                  </button>
                  {timeLeft > 240 && (
                    <span className="fp-otp-timer">
                      Resend available in {timeLeft - 240}s
                    </span>
                  )}
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="login-btn lm-submit-btn"
              disabled={loading}
            >
              {loading 
                ? 'Please wait...' 
                : step === 1 
                  ? 'Verify Email' 
                  : 'Verify OTP & Proceed'
              }
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
