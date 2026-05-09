import { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft,
  FaCheck, FaShieldAlt, FaExchangeAlt, FaCheckCircle,
  FaKey, FaInfoCircle
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/InternetBankingRegister.css';

export default function InternetBankingRegister() {
  const [showPassword, setShowPassword]                   = useState(false);
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [currentUser, setCurrentUser]                     = useState(null);
  const [isRegistered, setIsRegistered]                   = useState(false);
  const [loading, setLoading]                             = useState(true);
  const [successMessage, setSuccessMessage]               = useState('');
  const [errors, setErrors]                               = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountNumber: '',
    password: '',
    confirmPassword: '',
    transactionPassword: '',
    confirmTransactionPassword: '',
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) { navigate('/login'); return; }

      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      const key = `internetBanking_${user.accountNumber}`;
      setIsRegistered(!!localStorage.getItem(key));
      setFormData(prev => ({ ...prev, accountNumber: user.accountNumber }));
      setLoading(false);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountNumber.trim())
      newErrors.accountNumber = 'Account number is required';

    if (!formData.password) {
      newErrors.password = 'Login password is required';
    } else {
      const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
      const userAccount = storedAccounts.find(a => a.accountNumber === formData.accountNumber);
      if (!userAccount)
        newErrors.password = 'Account not found. Please contact support.';
      else if (formData.password !== userAccount.password)
        newErrors.password = 'Password does not match your account registration password.';
      else if (formData.password.length < 8)
        newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.transactionPassword)
      newErrors.transactionPassword = 'Transaction password is required';
    else if (formData.transactionPassword.length !== 6)
      newErrors.transactionPassword = 'Transaction password must be exactly 6 digits';
    else if (!/^\d+$/.test(formData.transactionPassword))
      newErrors.transactionPassword = 'Transaction password must contain only numbers';

    if (!formData.confirmTransactionPassword)
      newErrors.confirmTransactionPassword = 'Please confirm your transaction password';
    else if (formData.transactionPassword !== formData.confirmTransactionPassword)
      newErrors.confirmTransactionPassword = 'Transaction passwords do not match';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    if (formData.password === formData.transactionPassword) {
      setErrors({ password: 'Login password and transaction password must be different' });
      return;
    }

    const data = {
      accountNumber: formData.accountNumber,
      password: formData.password,
      transactionPassword: formData.transactionPassword,
      registeredAt: new Date().toISOString(),
      isInternetBankingEnabled: true
    };

    try {
      localStorage.setItem(`internetBanking_${formData.accountNumber}`, JSON.stringify(data));
      setSuccessMessage('Internet Banking registered successfully! Redirecting to fund transfer…');
      setIsRegistered(true);
      setTimeout(() => navigate('/user-dashboard'), 1800);
    } catch {
      setErrors({ submit: 'Failed to register. Please try again.' });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    if (formData.password === formData.transactionPassword) {
      setErrors({ password: 'Login password and transaction password must be different' });
      return;
    }

    const data = {
      accountNumber: formData.accountNumber,
      password: formData.password,
      transactionPassword: formData.transactionPassword,
      updatedAt: new Date().toISOString(),
      isInternetBankingEnabled: true
    };

    try {
      localStorage.setItem(`internetBanking_${formData.accountNumber}`, JSON.stringify(data));
      setSuccessMessage('Credentials updated successfully!');
      setTimeout(() => navigate('/user-dashboard'), 1800);
    } catch {
      setErrors({ submit: 'Failed to update. Please try again.' });
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Internet Banking', path: '/internet-banking-register' }]} />
      <div className="ibr-loading">Loading…</div>
    </>
  );

  /* ── Already registered — show status + proceed button ── */
  if (isRegistered && !successMessage) return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Dashboard', path: '/user-dashboard' },
        { label: 'Internet Banking', path: '/internet-banking-register' }
      ]} />
      <main className="ibr-page">
        <div className="ibr-container ibr-container--narrow">

          {/* Header strip */}
          <div className="ibr-header">
            <div className="ibr-header__icon-wrap ibr-header__icon-wrap--green">
              <FaCheckCircle />
            </div>
            <div>
              <h2 className="ibr-header__title">Internet Banking Active</h2>
              <p className="ibr-header__sub">Your account is set up for secure online fund transfers</p>
            </div>
          </div>

          <div className="ibr-body">
            {/* Status card */}
            <div className="ibr-status-card">
              <div className="ibr-status-card__row">
                <FaUser className="ibr-status-card__icon" />
                <div>
                  <div className="ibr-status-card__label">Account Holder</div>
                  <div className="ibr-status-card__value">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                </div>
              </div>
              <div className="ibr-status-card__row">
                <FaKey className="ibr-status-card__icon" />
                <div>
                  <div className="ibr-status-card__label">Account Number</div>
                  <div className="ibr-status-card__value ibr-status-card__value--mono">
                    {currentUser?.accountNumber}
                  </div>
                </div>
              </div>
              <div className="ibr-status-card__row">
                <FaShieldAlt className="ibr-status-card__icon ibr-status-card__icon--green" />
                <div>
                  <div className="ibr-status-card__label">Internet Banking Status</div>
                  <div className="ibr-status-card__value">
                    <span className="ibr-badge ibr-badge--active">
                      <FaCheckCircle /> Active &amp; Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="ibr-info-note">
              <FaInfoCircle className="ibr-info-note__icon" />
              <p>
                You are already registered for Internet Banking. You can proceed directly
                to fund transfer, or update your credentials below if needed.
              </p>
            </div>

            {/* Actions */}
            <div className="ibr-registered-actions">
              <button
                className="ibr-btn ibr-btn--primary"
                onClick={() => navigate('/user-dashboard', { state: { openTransfer: true } })}
              >
                <FaExchangeAlt /> Proceed to Fund Transfer
              </button>
              <button
                className="ibr-btn ibr-btn--outline"
                onClick={() => setIsRegistered(false)}
              >
                <FaLock /> Update Credentials
              </button>
              <Link to="/user-dashboard" className="ibr-btn ibr-btn--ghost">
                <FaArrowLeft /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  /* ── Registration / Update form ── */
  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Dashboard', path: '/user-dashboard' },
        { label: 'Internet Banking', path: '/internet-banking-register' }
      ]} />
      <main className="ibr-page">
        <div className="ibr-container">

          {/* Header strip */}
          <div className="ibr-header">
            <div className="ibr-header__icon-wrap">
              <FaShieldAlt />
            </div>
            <div>
              <h2 className="ibr-header__title">
                {isRegistered ? 'Update Internet Banking' : 'Register for Internet Banking'}
              </h2>
              <p className="ibr-header__sub">
                Set up secure passwords to enable online fund transfers
              </p>
            </div>
          </div>

          <div className="ibr-body">
            <form
              onSubmit={isRegistered ? handleUpdate : handleSubmit}
              className="ibr-form"
              noValidate
            >
              {/* Global errors */}
              {errors.submit && (
                <div className="ibr-alert ibr-alert--error">{errors.submit}</div>
              )}
              {successMessage && (
                <div className="ibr-alert ibr-alert--success">
                  <FaCheckCircle /> {successMessage}
                </div>
              )}

              {/* ── Account Information ── */}
              <div className="ibr-section">
                <div className="ibr-section__title">
                  <FaUser /> Account Information
                </div>
                <div className="ibr-form-group">
                  <label htmlFor="accountNumber">Account Number</label>
                  <div className="ibr-input-wrap">
                    <FaUser className="ibr-input-icon" />
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      disabled
                      className="ibr-input ibr-input--disabled"
                    />
                  </div>
                  <small className="ibr-help">Pre-filled from your account — cannot be changed</small>
                </div>
              </div>

              {/* ── Login Credentials ── */}
              <div className="ibr-section">
                <div className="ibr-section__title">
                  <FaLock /> Login Credentials
                </div>

                <div className="ibr-form-group">
                  <label htmlFor="password">Login Password</label>
                  <div className="ibr-input-wrap">
                    <FaLock className="ibr-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your account password"
                      className={`ibr-input${errors.password ? ' ibr-input--error' : ''}`}
                    />
                    <button type="button" className="ibr-toggle" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <span className="ibr-error">{errors.password}</span>}
                  <small className="ibr-help">Must match your account registration password</small>
                </div>

                <div className="ibr-form-group">
                  <label htmlFor="confirmPassword">Confirm Login Password</label>
                  <div className="ibr-input-wrap">
                    <FaLock className="ibr-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter your password"
                      className={`ibr-input${errors.confirmPassword ? ' ibr-input--error' : ''}`}
                    />
                    <button type="button" className="ibr-toggle" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="ibr-error">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* ── Transaction Password ── */}
              <div className="ibr-section">
                <div className="ibr-section__title">
                  <FaKey /> Transaction Password
                </div>
                <p className="ibr-section__desc">
                  A separate 6-digit numeric PIN used to authorise every fund transfer.
                </p>

                <div className="ibr-form-group">
                  <label htmlFor="transactionPassword">Transaction Password (6 digits)</label>
                  <div className="ibr-input-wrap">
                    <FaKey className="ibr-input-icon" />
                    <input
                      type={showTransactionPassword ? 'text' : 'password'}
                      id="transactionPassword"
                      name="transactionPassword"
                      value={formData.transactionPassword}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit numeric PIN"
                      maxLength={6}
                      inputMode="numeric"
                      className={`ibr-input${errors.transactionPassword ? ' ibr-input--error' : ''}`}
                    />
                    <button type="button" className="ibr-toggle" onClick={() => setShowTransactionPassword(p => !p)}>
                      {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.transactionPassword && <span className="ibr-error">{errors.transactionPassword}</span>}
                  <small className="ibr-help">Exactly 6 numeric digits — different from your login password</small>
                </div>

                <div className="ibr-form-group">
                  <label htmlFor="confirmTransactionPassword">Confirm Transaction Password</label>
                  <div className="ibr-input-wrap">
                    <FaKey className="ibr-input-icon" />
                    <input
                      type={showTransactionPassword ? 'text' : 'password'}
                      id="confirmTransactionPassword"
                      name="confirmTransactionPassword"
                      value={formData.confirmTransactionPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter 6-digit PIN"
                      maxLength={6}
                      inputMode="numeric"
                      className={`ibr-input${errors.confirmTransactionPassword ? ' ibr-input--error' : ''}`}
                    />
                  </div>
                  {errors.confirmTransactionPassword && (
                    <span className="ibr-error">{errors.confirmTransactionPassword}</span>
                  )}
                </div>
              </div>

              {/* ── Security note ── */}
              <div className="ibr-security-note">
                <FaShieldAlt className="ibr-security-note__icon" />
                <div>
                  <div className="ibr-security-note__title">Security Guidelines</div>
                  <ul className="ibr-security-note__list">
                    <li>Never share your passwords with anyone, including bank staff</li>
                    <li>Transaction password is required for every fund transfer</li>
                    <li>Login and transaction passwords must be different</li>
                    <li>Change your passwords regularly for better security</li>
                  </ul>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="ibr-form-actions">
                <Link to="/user-dashboard" className="ibr-btn ibr-btn--ghost">
                  <FaArrowLeft /> Back to Dashboard
                </Link>
                <button type="submit" className="ibr-btn ibr-btn--primary">
                  <FaCheck />
                  {isRegistered ? 'Update Credentials' : 'Register for Internet Banking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
