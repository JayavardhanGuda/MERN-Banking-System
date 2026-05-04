import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',

    // Account Information
    accountType: '',
    initialDeposit: '',
    currency: 'INR',

    // Address Information
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',

    // Security Information
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',

    // Terms and Conditions
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information Validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Account Information Validation
    if (!formData.accountType) newErrors.accountType = 'Account type is required';
    if (!formData.initialDeposit || formData.initialDeposit < 1000) {
      newErrors.initialDeposit = 'Minimum initial deposit is ₹1,000';
    }

    // Address Information Validation
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required';

    // Security Information Validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.securityQuestion) newErrors.securityQuestion = 'Security question is required';
    if (!formData.securityAnswer.trim()) newErrors.securityAnswer = 'Security answer is required';

    // Terms Validation
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = 'You must agree to the privacy policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
      const duplicateAccount = storedAccounts.find((account) =>
        account.username.toLowerCase() === formData.username.trim().toLowerCase() ||
        account.email.toLowerCase() === formData.email.trim().toLowerCase()
      );

      if (duplicateAccount) {
        alert('This username or email is already registered. Please use a different account.');
        return;
      }

      const newAccount = {
        id: Date.now(),
        accountNumber: `SB${Math.floor(100000000 + Math.random() * 900000000)}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        accountType: formData.accountType,
        initialDeposit: formData.initialDeposit,
        currency: formData.currency,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        country: formData.country,
        username: formData.username.trim(),
        password: formData.password,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer.trim(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('bankAccounts', JSON.stringify([...storedAccounts, newAccount]));
      alert('Registration submitted successfully. Admin will review and approve your account.');
      navigate('/login');
    }
  };

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Register', path: '/register' }]} />
      <main>
        <div className="register-page">
          <div className="register-container">
            <Link to="/" className="back-button">
              <FaArrowLeft /> Home
            </Link>

            <div className="register-header">
              <div className="register-icon-header">
                <FaUser className="register-badge" />
              </div>
              <h2>Open Your Savings Account</h2>
              <p>Join our banking family today</p>
            </div>

            <div className="register-form-container">
              <form onSubmit={handleSubmit} className="register-form">

                {/* Personal Information Section */}
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? 'error' : ''}
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? 'error' : ''}
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? 'error' : ''}
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth *</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={errors.dateOfBirth ? 'error' : ''}
                      />
                      {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="gender">Gender *</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={errors.gender ? 'error' : ''}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && <span className="error-message">{errors.gender}</span>}
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="form-section">
                  <h3>Account Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="accountType">Account Type *</label>
                      <select
                        id="accountType"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleInputChange}
                        className={errors.accountType ? 'error' : ''}
                      >
                        <option value="">Select Account Type</option>
                        <option value="savings">Savings Account</option>
                        <option value="current">Current Account</option>
                        <option value="salary">Salary Account</option>
                        <option value="fixed">Fixed Deposit</option>
                      </select>
                      {errors.accountType && <span className="error-message">{errors.accountType}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="initialDeposit">Initial Deposit (₹) *</label>
                      <input
                        type="number"
                        id="initialDeposit"
                        name="initialDeposit"
                        value={formData.initialDeposit}
                        onChange={handleInputChange}
                        min="1000"
                        step="100"
                        className={errors.initialDeposit ? 'error' : ''}
                      />
                      {errors.initialDeposit && <span className="error-message">{errors.initialDeposit}</span>}
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="form-section">
                  <h3>Address Information</h3>
                  <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={errors.state ? 'error' : ''}
                      />
                      {errors.state && <span className="error-message">{errors.state}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="pincode">PIN Code *</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={errors.pincode ? 'error' : ''}
                      />
                      {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Security Information Section */}
                <div className="form-section">
                  <h3>Security Information</h3>
                  <div className="form-group">
                    <label htmlFor="username">Username *</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="password">Password *</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={errors.password ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password *</label>
                      <div className="password-input-container">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={errors.confirmPassword ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="securityQuestion">Security Question *</label>
                      <select
                        id="securityQuestion"
                        name="securityQuestion"
                        value={formData.securityQuestion}
                        onChange={handleInputChange}
                        className={errors.securityQuestion ? 'error' : ''}
                      >
                        <option value="">Select Security Question</option>
                        <option value="mother">What is your mother's maiden name?</option>
                        <option value="pet">What is your pet's name?</option>
                        <option value="school">What is your first school name?</option>
                        <option value="city">What is your birth city?</option>
                        <option value="color">What is your favorite color?</option>
                      </select>
                      {errors.securityQuestion && <span className="error-message">{errors.securityQuestion}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="securityAnswer">Security Answer *</label>
                      <input
                        type="text"
                        id="securityAnswer"
                        name="securityAnswer"
                        value={formData.securityAnswer}
                        onChange={handleInputChange}
                        className={errors.securityAnswer ? 'error' : ''}
                      />
                      {errors.securityAnswer && <span className="error-message">{errors.securityAnswer}</span>}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions Section */}
                <div className="form-section">
                  <h3>Terms and Conditions</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      I agree to the <a href="#terms" target="_blank">Terms and Conditions</a> *
                    </label>
                    {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeToPrivacy"
                        checked={formData.agreeToPrivacy}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      I agree to the <a href="#privacy" target="_blank">Privacy Policy</a> *
                    </label>
                    {errors.agreeToPrivacy && <span className="error-message">{errors.agreeToPrivacy}</span>}
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeToMarketing"
                        checked={formData.agreeToMarketing}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      I agree to receive marketing communications
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="register-btn">
                    <FaCheck /> Create Account
                  </button>
                  <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}