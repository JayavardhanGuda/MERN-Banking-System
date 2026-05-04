import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaUser, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function LoginSelector() {
  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Login', path: '/login' }]} />
      <main>
        <div className="login-page">
          <div className="login-selector-container">
            <Link to="/" className="back-button">
              <FaArrowLeft /> Home
            </Link>

            <div className="selector-header">
              <h2>Choose Your Portal</h2>
              <p>Select the appropriate login for your account type</p>
            </div>

            <div className="login-options">
              <Link to="/user-login" className="login-option user-option">
                <div className="option-icon">
                  <FaUser />
                </div>
                <h3>User Login</h3>
                <p>Access your personal banking account</p>
                <span className="option-cta">Login as User →</span>
              </Link>

              <Link to="/admin-login" className="login-option admin-option">
                <div className="option-icon">
                  <FaShieldAlt />
                </div>
                <h3>Admin Portal</h3>
                <p>Administrative access for bank staff</p>
                <span className="option-cta">Login as Admin →</span>
              </Link>
            </div>

            <div className="selector-footer">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
