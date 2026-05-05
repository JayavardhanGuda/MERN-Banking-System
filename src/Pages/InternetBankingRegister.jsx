import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheck, FaShieldAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/InternetBankingRegister.css';

export default function InternetBankingRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountNumber: '',
    password: '',
    confirmPassword: '',
    transactionPassword: '',
    confirmTransactionPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        navigate('/user-login');
        return;
      }
      
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      // Check if user already registered for internet banking
      const internetBankingKey = `internetBanking_${user.accountNumber}`;
      const internetBankingData = localStorage.getItem(internetBankingKey);
      
      if (internetBankingData) {
        setIsRegistered(true);
      }
      
      setFormData(prev => ({
        ...prev,
        accountNumber: user.accountNumber
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/user-login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Account Number Validation
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = 'Login password is required';
    } else {
      // Check if password matches the account registration password
      const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
      const userAccount = storedAccounts.find(account => account.accountNumber === formData.accountNumber);
      
      if (!userAccount) {
        newErrors.password = 'Account not found. Please contact support.';
      } else if (formData.password !== userAccount.password) {
        newErrors.password = 'Login password does not match your account registration password.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } 
    }

    // Confirm Password Validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Transaction Password Validation
    if (!formData.transactionPassword) {
      newErrors.transactionPassword = 'Transaction password is required';
    } else if (formData.transactionPassword.length !== 6) {
      newErrors.transactionPassword = 'Transaction password must be exactly 6 digits';
    } else if (!/^\d+$/.test(formData.transactionPassword)) {
      newErrors.transactionPassword = 'Transaction password must contain only numbers';
    }

    // Confirm Transaction Password Validation
    if (!formData.confirmTransactionPassword) {
      newErrors.confirmTransactionPassword = 'Please confirm your transaction password';
    } else if (formData.transactionPassword !== formData.confirmTransactionPassword) {
      newErrors.confirmTransactionPassword = 'Transaction passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if passwords are different
    if (formData.password === formData.transactionPassword) {
      setErrors({
        password: 'Login password and transaction password must be different'
      });
      return;
    }

    // Store internet banking registration in localStorage
    const internetBankingData = {
      accountNumber: formData.accountNumber,
      password: formData.password,
      transactionPassword: formData.transactionPassword,
      registeredAt: new Date().toISOString(),
      isInternetBankingEnabled: true
    };

    try {
      localStorage.setItem(
        `internetBanking_${formData.accountNumber}`,
        JSON.stringify(internetBankingData)
      );

      setSuccessMessage('Internet Banking registration successful! You can now transfer funds.');
      setIsRegistered(true);

      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (error) {
      setErrors({ submit: 'Failed to register. Please try again.' });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (formData.password === formData.transactionPassword) {
      setErrors({
        password: 'Login password and transaction password must be different'
      });
      return;
    }

    const internetBankingData = {
      accountNumber: formData.accountNumber,
      password: formData.password,
      transactionPassword: formData.transactionPassword,
      updatedAt: new Date().toISOString(),
      isInternetBankingEnabled: true
    };

    try {
      localStorage.setItem(
        `internetBanking_${formData.accountNumber}`,
        JSON.stringify(internetBankingData)
      );

      setSuccessMessage('Internet Banking credentials updated successfully!');

      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (error) {
      setErrors({ submit: 'Failed to update. Please try again.' });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Breadcrumbs items={[{ label: 'Internet Banking', path: '/internet-banking-register' }]} />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Header />
        <Breadcrumbs items={[{ label: 'Internet Banking', path: '/internet-banking-register' }]} />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Please log in first</p>
        </div>
        
      </>
    );
  }

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Internet Banking', path: '/internet-banking-register' }]} />
      <div className="internet-banking-page">
        <div className="internet-banking-container">
          <div className="internet-banking-header">
           
            <h2>{isRegistered ? 'Update Internet Banking' : 'Register for Internet Banking'}</h2>
            <p>Set up secure passwords for online fund transfers</p>
          </div>

          <div className="internet-banking-form-wrapper">
            <form onSubmit={isRegistered ? handleUpdate : handleSubmit} className="internet-banking-form">
              {errors.submit && (
                <div className="alert alert-error">
                  {errors.submit}
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success">
                  {/* <FaCheck className="alert-icon" /> */}
                  {successMessage}
                </div>
              )}

              <div className="form-section">
                <h3 className="section-title">Account Information</h3>

                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number</label>
                  <div className="input-wrapper">
                    {/* <FaUser className="input-icon" /> */}
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      disabled
                      className="form-input disabled"
                      placeholder="Your account number"
                    />
                  </div>
                  <small className="help-text">Your account number is pre-filled and cannot be changed</small>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Login Credentials</h3>

                <div className="form-group">
                  <label htmlFor="password">Login Password</label>
                  <div className="input-wrapper">
                    {/* <FaLock className="input-icon" /> */}
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Enter a strong password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                  <small className="help-text">Min 8 characters, uppercase, lowercase, number, special character</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Login Password</label>
                  <div className="input-wrapper">
                    {/* <FaLock className="input-icon" /> */}
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm your password"
                    />
                      <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Transaction Password</h3>
                <p className="section-description">
                  A separate 6-digit numeric password for authorizing fund transfers
                </p>

                <div className="form-group">
                  <label htmlFor="transactionPassword">Transaction Password</label>
                  <div className="input-wrapper">
                    {/* <FaLock className="input-icon" /> */}
                    <input
                      type={showTransactionPassword ? 'text' : 'password'}
                      id="transactionPassword"
                      name="transactionPassword"
                      value={formData.transactionPassword}
                      onChange={handleInputChange}
                      className={`form-input ${errors.transactionPassword ? 'error' : ''}`}
                      placeholder="Enter 6-digit numeric password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                    >
                      {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.transactionPassword && <span className="error-message">{errors.transactionPassword}</span>}
                  <small className="help-text">Must be 6 numeric digits only</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmTransactionPassword">Confirm Transaction Password</label>
                  <div className="input-wrapper">
                    {/* <FaLock className="input-icon" /> */}
                    <input
                      type={showTransactionPassword ? 'text' : 'password'}
                      id="confirmTransactionPassword"
                      name="confirmTransactionPassword"
                      value={formData.confirmTransactionPassword}
                      onChange={handleInputChange}
                      className={`form-input ${errors.confirmTransactionPassword ? 'error' : ''}`}
                      placeholder="Confirm transaction password"
                    />
                  </div>
                  {errors.confirmTransactionPassword && (
                    <span className="error-message">{errors.confirmTransactionPassword}</span>
                  )}
                </div>
              </div>

              <div className="security-info">
                {/* <FaShieldAlt className="security-icon" /> */}
                <div>
                  <h4>Security Note</h4>
                  <ul>
                    <li>Never share your passwords with anyone</li>
                    <li>Use a strong, unique combination for better security</li>
                    <li>Transaction password is required for all fund transfers</li>
                    <li>Keep your credentials confidential</li>
                  </ul>
                </div>
              </div>

              <div className="form-actions">
                <Link to="/user-dashboard" className="btn btn-secondary">
                  <FaArrowLeft /> Back to Dashboard
                </Link>
                <button type="submit" className="btn btn-primary">
                  <FaCheck /> {isRegistered ? 'Update Credentials' : 'Register for Internet Banking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
