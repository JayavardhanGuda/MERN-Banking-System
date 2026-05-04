import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaArrowLeft, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.password || !formData.confirmPassword) {
      setMessage('Both password fields are required.');
      return;
    }
    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    console.log('Password reset for:', userId, formData.password);
    setMessage('Password updated successfully. Redirecting to login...');
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Login', path: '/login' },
        { label: 'Set New Password', path: '/reset-password' }
      ]} />
      <main>
        <div className="forgot-page">
          <div className="forgot-container">
            <Link to="/login" className="back-button">
              <FaArrowLeft /> Back to Login
            </Link>

            <div className="forgot-header">
              <h2>Set New Password</h2>
              <p>{userId ? `Reset password for ${userId}` : 'Enter your new password below.'}</p>
            </div>

            <div className="forgot-form-container">
              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="form-group">
                  <label htmlFor="password">Login Password</label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Login Password</label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-btn">
                  Submit
                </button>
              </form>

              {message && <p className="status-message">{message}</p>}

              <div className="login-footer">
                <p>Already know your password? <Link to="/login" className="register-link">Login now</Link></p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
