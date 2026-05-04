import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    adminId: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Admin Login attempt:', formData);
    // Add actual login logic here
  };

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Login', path: '/login' },
        { label: 'Admin Login', path: '/admin-login' }
      ]} />
      <main>
        <div className="login-page">
          <div className="login-container admin-container">
            <Link to="/login" className="back-button">
              <FaArrowLeft /> Back
            </Link>

            <div className="login-header admin-header">
              <div className="admin-icon-header">
                <FaShieldAlt className="admin-badge" />
              </div>
              <h2>Admin Portal</h2>
              <p>Administrative access only</p>
            </div>

            <div className="login-form-container">
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="adminId">Admin ID</label>
                  <div className="input-group">
                    <FaShieldAlt className="input-icon" />
                    <input
                      type="text"
                      id="adminId"
                      name="adminId"
                      value={formData.adminId}
                      onChange={handleInputChange}
                      placeholder="Enter your admin ID"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Admin Password</label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your admin password"
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

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                </div>

                <button type="submit" className="login-btn admin-btn">
                  Admin Sign In
                </button>
              </form>

              <div className="login-footer">
                <div className="security-notice admin-notice">
                  <small>
                    ⚠️ This portal is for authorized administrators only.
                    Unauthorized access attempts are logged.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
