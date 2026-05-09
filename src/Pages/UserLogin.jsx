import { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaUser, FaLock, FaEye, FaEyeSlash,
  FaArrowLeft, FaShieldAlt, FaCheckCircle, FaMobileAlt, FaUniversity
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function UserLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = formData.username.trim().toLowerCase();
    const password = formData.password;
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
    navigate('/user-dashboard');
  };

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Login', path: '/login' }, { label: 'User Login', path: '/user-login' }]} />
      <main>
        <div className="login-page">
          <div className="login-split">

            {/* LEFT panel */}
            <div className="login-split__left">
              <div className="login-brand">
                <span className="login-brand__icon">🏛</span>
                <div className="login-brand__name">PavitraBandham<br />Cooperative Bank</div>
                <div className="login-brand__tagline">Empowering trust, enabling growth</div>
              </div>
              <h2 className="login-left__title">
                Your Finances,<br /><span>Your Control</span>
              </h2>
              <p className="login-left__desc">
                Log in to view your balance, transfer funds, pay bills, and manage
                all your banking needs from one secure dashboard.
              </p>
              <div className="login-left__features">
                {[
                  { icon: <FaShieldAlt />,   text: '256-bit SSL Encrypted' },
                  { icon: <FaCheckCircle />, text: 'DICGC Insured Deposits' },
                  { icon: <FaMobileAlt />,   text: '24/7 Account Access' },
                  { icon: <FaUniversity />,  text: 'Trusted Cooperative Bank' },
                ].map((f, i) => (
                  <div key={i} className="login-left__feature">
                    <div className="login-left__feature-icon">{f.icon}</div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT form panel */}
            <div className="login-split__right">
              <Link to="/login" className="back-button" style={{ margin: '-56px -48px 32px', display: 'flex' }}>
                <FaArrowLeft /> Back to Login
              </Link>

              <div className="user-icon-header" style={{ marginBottom: 16 }}>
                <FaUser className="user-badge" />
              </div>

              <span className="login-eyebrow">Customer Portal</span>
              <h1 className="login-form-title">User Login</h1>
              <p className="login-form-sub">Access your banking services securely</p>

              <form onSubmit={handleSubmit} className="login-form">
                {loginError && (
                  <div style={{
                    background: '#fff0f0', border: '1px solid #fcc', borderLeft: '3px solid #e05252',
                    borderRadius: '8px', padding: '10px 14px', fontSize: '0.87rem',
                    color: '#c0392b', fontWeight: 600
                  }}>
                    {loginError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="username">Username / Customer ID</label>
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text" id="username" name="username"
                      value={formData.username} onChange={handleInputChange}
                      placeholder="Enter your username or customer ID" required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'} id="password" name="password"
                      value={formData.password} onChange={handleInputChange}
                      placeholder="Enter your password" required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} />
                    <span className="checkmark" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                </div>

                <button type="submit" className="login-btn">Sign In</button>
              </form>

              <div className="login-footer">
                <p>Don't have an account? <Link to="/register" className="register-link">Register here</Link></p>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
