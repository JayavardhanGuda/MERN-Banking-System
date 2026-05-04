import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaArrowLeft, FaLock } from 'react-icons/fa';

export default function ForgotPassword() {
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft <= 0) {
      if (otpSent) {
        setGeneratedOtp('');
        setMessage('OTP has expired. Please resend to get a new code.');
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((current) => current - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSendOtp = () => {
    if (!userId.trim()) {
      setMessage('Enter your User ID first to receive OTP.');
      return;
    }
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(generated);
    setOtpSent(true);
    setTimeLeft(30);
    setMessage(`OTP sent to your registered mobile number. For testing, use ${generated}`);
    console.log('Forgot Password OTP:', generated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMessage('Please enter the OTP.');
      return;
    }
    if (!otpSent) {
      setMessage('Please send OTP first.');
      return;
    }
    if (timeLeft <= 0) {
      setMessage('OTP expired. Please resend to get a new code.');
      return;
    }
    if (otp !== generatedOtp) {
      setMessage('Incorrect OTP. Please try again.');
      return;
    }
    navigate('/reset-password', { state: { userId } });
  };

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Login', path: '/login' },
        { label: 'Forgot Password', path: '/forgot-password' }
      ]} />
      <main>
        <div className="forgot-page">
          <div className="forgot-container">
            <Link to="/login" className="back-button">
              <FaArrowLeft /> Back to Login
            </Link>

            <div className="forgot-header">
              <h2>Forgot Password</h2>
              <p>Enter your User ID and OTP to reset your password.</p>
            </div>

            <div className="forgot-form-container">
              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="form-group">
                  <label htmlFor="userId">Enter User ID</label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type="text"
                      id="userId"
                      name="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter your User ID"
                      required
                    />
                  </div>
                </div>

                <div className="otp-actions">
                  <button type="button" className="otp-btn" onClick={handleSendOtp}>
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                  {timeLeft > 0 && <span className="otp-timer">Expires in {timeLeft}s</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="otp">Enter OTP</label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the OTP"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="login-btn">
                  Proceed
                </button>
              </form>

              {message && <p className="status-message">{message}</p>}
              {otpSent && generatedOtp && (
                <p className="demo-otp">Demo OTP: {generatedOtp}</p>
              )}

              <div className="login-footer">
                <p>Remembered your password? <Link to="/login" className="register-link">Login now</Link></p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
