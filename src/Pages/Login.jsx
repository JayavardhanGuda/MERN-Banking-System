import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = formData.username.trim().toLowerCase();
    const password = formData.password;

    if (email === 'admin-vjn@gmail.com' && password === 'admin@123') {
      navigate('/admin-dashboard');
      return;
    }
    

    const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const userAccount = storedAccounts.find((account) =>
      (account.username.toLowerCase() === email || account.email.toLowerCase() === email) &&
      account.password === password
    );

    if (!userAccount || userAccount.status !== 'Approved') {
      setLoginError('Invalid username/email or password.');
      return;
    }

    setLoginError('');
    localStorage.setItem('currentUser', JSON.stringify(userAccount));
    navigate('/user-dashboard');
  };

  return (
    <>
      <Header />
      <main>
        <div className="login-page">
          <div className="login-container">
            <div className="login-header">
              <div className="bank-logo">
                <p>Secure Online Banking</p>
              </div>
              <div className="security-badge">
                <FaShieldAlt />
                <span>256-bit SSL Encrypted</span>
              </div>
            </div>

            <div className="login-form-container">
              <h3>Welcome Back</h3>
              <p>Please sign in to your account</p>

              <form onSubmit={handleSubmit} className="login-form">
                  {loginError && <span className="error-message">{loginError}</span>}
                <div className="form-group">
                  <label htmlFor="username">Email / Customer ID</label>
                  <div className="input-group">
                    {/* <FaUser className="input-icon" /> */}
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username or customer ID"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-group">
                    {/* <FaLock className="input-icon" /> */}
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
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

                <button type="submit" className="login-btn">
                  Sign In Securely
                </button>
              </form>

              <div className="login-footer">
                <p>Don't have an account?
                  <Link to="/register" className="register-link"> Register here</Link>
                </p>
              </div>
            </div>

            <div className="login-features">
              <div className="feature-item">
                <FaShieldAlt />
                <span>Bank-grade Security</span>
              </div>
              <div className="feature-item">
                <FaLock />
                <span>Encrypted Connection</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}