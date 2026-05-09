import { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaShieldAlt, FaLock, FaEye, FaEyeSlash,
  FaArrowLeft, FaExclamationTriangle, FaFingerprint, FaServer
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ adminId: '', password: '', rememberMe: false });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Admin Login attempt:', formData);
  };

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Login', path: '/login' }, { label: 'Admin Login', path: '/admin-login' }]} />
      <main>
        <div className="login-page">
          <div className="login-split">

            {/* LEFT panel – darker admin theme */}
            <div className="login-split__left" style={{ background: 'linear-gradient(145deg, #0a0a1a 0%, #1a0a2e 55%, #2d1060 100%)' }}>
              <div className="login-brand">
                <span className="login-brand__icon">🔐</span>
                <div className="login-brand__name">PavitraBandham<br />Admin Portal</div>
                <div className="login-brand__tagline">Authorized Personnel Only</div>
              </div>
              <h2 className="login-left__title">
                Administrative<br /><span>Control Center</span>
              </h2>
              <p className="login-left__desc">
                This portal is restricted to authorized bank administrators.
                All access attempts are monitored and logged for security compliance.
              </p>
              <div className="login-left__features">
                {[
                  { icon: <FaShieldAlt />,        text: 'Multi-factor Authentication' },
                  { icon: <FaFingerprint />,       text: 'Biometric Access Logging' },
                  { icon: <FaServer />,            text: 'Encrypted Admin Sessions' },
                  { icon: <FaExclamationTriangle />, text: 'Unauthorized Access Monitored' },
                ].map((f, i) => (
                  <div key={i} className="login-left__feature">
                    <div className="login-left__feature-icon" style={{ borderColor: 'rgba(180,100,255,0.4)', background: 'rgba(180,100,255,0.12)', color: '#c084fc' }}>
                      {f.icon}
                    </div>
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

              <div className="admin-icon-header" style={{ marginBottom: 16 }}>
                <FaShieldAlt className="admin-badge" />
              </div>

              <span className="login-eyebrow" style={{ color: '#7c3aed' }}>Restricted Access</span>
              <h1 className="login-form-title">Admin Portal</h1>
              <p className="login-form-sub">Administrative access only — credentials are monitored</p>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="adminId">Admin ID</label>
                  <div className="input-group">
                    <FaShieldAlt className="input-icon" style={{ color: '#7c3aed' }} />
                    <input
                      type="text" id="adminId" name="adminId"
                      value={formData.adminId} onChange={handleInputChange}
                      placeholder="Enter your admin ID" required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Admin Password</label>
                  <div className="input-group">
                    <FaLock className="input-icon" style={{ color: '#7c3aed' }} />
                    <input
                      type={showPassword ? 'text' : 'password'} id="password" name="password"
                      value={formData.password} onChange={handleInputChange}
                      placeholder="Enter your admin password" required
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

                <button type="submit" className="login-btn admin-btn">Admin Sign In</button>
              </form>

              <div className="login-footer">
                <div className="security-notice admin-notice">
                  <small>
                    ⚠️ This portal is for authorized administrators only.
                    Unauthorized access attempts are logged and reported.
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
