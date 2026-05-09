import { useState, useRef } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaUser, FaLock, FaEye, FaEyeSlash,
  FaArrowLeft, FaCheck, FaShieldAlt,
  FaIdCard, FaUpload, FaTimesCircle, FaCheckCircle,
  FaArrowRight, FaUserCheck, FaClock, FaClipboardList
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

/* ── Age helper ── */
function calculateAge(dob) {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/* ── File upload field component ── */
function FileUploadField({ id, label, accept, file, onChange, error, hint }) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className={`reg-file-box${file ? ' reg-file-box--filled' : ''}${error ? ' reg-file-box--error' : ''}`}>
        {!file ? (
          <>
            <FaUpload className="reg-file-box__icon" />
            <span className="reg-file-box__prompt">
              Click to upload or drag &amp; drop
            </span>
            <span className="reg-file-box__hint">{hint}</span>
            <input
              ref={inputRef}
              type="file"
              id={id}
              accept={accept}
              className="reg-file-box__input"
              onChange={e => onChange(e.target.files[0] || null)}
            />
          </>
        ) : (
          <div className="reg-file-box__preview">
            <FaCheckCircle className="reg-file-box__ok" />
            <div className="reg-file-box__info">
              <span className="reg-file-box__name">{file.name}</span>
              <span className="reg-file-box__size">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              type="button"
              className="reg-file-box__clear"
              onClick={handleClear}
              aria-label="Remove file"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

export default function Register() {
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [panFile, setPanFile]                         = useState(null);
  const [aadhaarFile, setAadhaarFile]                 = useState(null);
  const [showSuccess, setShowSuccess]                 = useState(false);
  const [registeredAccount, setRegisteredAccount]     = useState(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '',
    accountType: '', initialDeposit: '', currency: 'INR',
    address: '', city: '', state: '', pincode: '', country: 'India',
    username: '', password: '', confirmPassword: '',
    securityQuestion: '', securityAnswer: '',
    agreeToTerms: false, agreeToPrivacy: false, agreeToMarketing: false
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  /* ── Input change ── */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* ── Validation ── */
  const validateForm = () => {
    const newErrors = {};

    // Personal
    if (!formData.firstName.trim())  newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim())   newErrors.lastName  = 'Last name is required';
    if (!formData.email.trim())      newErrors.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim())      newErrors.phone     = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid 10-digit phone number';

    // DOB — must be provided AND applicant must be at least 18
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = `You must be at least 18 years old to open an account. Your current age is ${age}.`;
      }
    }

    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Account
    if (!formData.accountType) newErrors.accountType = 'Account type is required';
    if (!formData.initialDeposit || Number(formData.initialDeposit) < 1000)
      newErrors.initialDeposit = 'Minimum initial deposit is ₹1,000';

    // Address
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim())    newErrors.city    = 'City is required';
    if (!formData.state.trim())   newErrors.state   = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = 'Enter a valid 6-digit PIN code';

    // KYC documents
    if (!panFile)     newErrors.panFile     = 'PAN card document is required for KYC verification';
    if (!aadhaarFile) newErrors.aadhaarFile = 'Aadhaar card document is required for KYC verification';

    // Security
    if (!formData.username.trim())  newErrors.username = 'Username is required';
    if (!formData.password)         newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.securityQuestion) newErrors.securityQuestion = 'Security question is required';
    if (!formData.securityAnswer.trim()) newErrors.securityAnswer = 'Security answer is required';

    // Terms
    if (!formData.agreeToTerms)   newErrors.agreeToTerms   = 'You must agree to the Terms and Conditions';
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstErr = document.querySelector('.error-message');
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const duplicate = storedAccounts.find(acc =>
      acc.username.toLowerCase() === formData.username.trim().toLowerCase() ||
      acc.email.toLowerCase()    === formData.email.trim().toLowerCase()
    );

    if (duplicate) {
      setErrors(prev => ({ ...prev, username: 'This username or email is already registered.' }));
      return;
    }

    /* Read both files as base64, then save everything */
    const readAsBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    Promise.all([readAsBase64(panFile), readAsBase64(aadhaarFile)])
      .then(([panBase64, aadhaarBase64]) => {
        const newAccount = {
          id:            Date.now(),
          accountNumber: `SB${Math.floor(100000000 + Math.random() * 900000000)}`,
          firstName:     formData.firstName.trim(),
          lastName:      formData.lastName.trim(),
          email:         formData.email.trim(),
          phone:         formData.phone.trim(),
          dateOfBirth:   formData.dateOfBirth,
          age:           calculateAge(formData.dateOfBirth),
          gender:        formData.gender,
          accountType:   formData.accountType,
          initialDeposit: formData.initialDeposit,
          balance:       parseFloat(formData.initialDeposit).toFixed(2),
          currency:      formData.currency,
          address:       formData.address.trim(),
          city:          formData.city.trim(),
          state:         formData.state.trim(),
          pincode:       formData.pincode.trim(),
          country:       formData.country,
          username:      formData.username.trim(),
          password:      formData.password,
          securityQuestion: formData.securityQuestion,
          securityAnswer:   formData.securityAnswer.trim(),
          kyc: {
            panCard: {
              fileName:   panFile.name,
              fileSize:   panFile.size,
              fileType:   panFile.type,
              fileData:   panBase64,       // base64 for preview
              uploadedAt: new Date().toISOString(),
              verified:   false
            },
            aadhaarCard: {
              fileName:   aadhaarFile.name,
              fileSize:   aadhaarFile.size,
              fileType:   aadhaarFile.type,
              fileData:   aadhaarBase64,   // base64 for preview
              uploadedAt: new Date().toISOString(),
              verified:   false
            }
          },
          kycStatus: 'Pending Verification',
          status:    'Pending',
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('bankAccounts', JSON.stringify([...storedAccounts, newAccount]));
        setRegisteredAccount(newAccount);
        setShowSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => {
        setErrors(prev => ({ ...prev, panFile: 'Failed to read file. Please try again.' }));
      });
  };

  /* ── Max date for DOB (today) ── */
  const maxDob = new Date().toISOString().split('T')[0];

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
                <div className="register-badge-wrap">
                  <FaUser className="register-badge" />
                </div>
                <div className="register-header-text">
                  <h2>Open Your Savings Account</h2>
                  <p>Join our banking family today — quick &amp; secure</p>
                </div>
              </div>
              <div className="register-header-badge">
                <FaShieldAlt /> SSL Secured
              </div>
            </div>

            <div className="register-form-container">
              <form onSubmit={handleSubmit} className="register-form" noValidate>

                {/* ── Personal Information ── */}
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input type="text" id="firstName" name="firstName"
                        value={formData.firstName} onChange={handleInputChange}
                        placeholder="Enter first name"
                        className={errors.firstName ? 'error' : ''} />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input type="text" id="lastName" name="lastName"
                        value={formData.lastName} onChange={handleInputChange}
                        placeholder="Enter last name"
                        className={errors.lastName ? 'error' : ''} />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input type="email" id="email" name="email"
                        value={formData.email} onChange={handleInputChange}
                        placeholder="example@email.com"
                        className={errors.email ? 'error' : ''} />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input type="tel" id="phone" name="phone"
                        value={formData.phone} onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={errors.phone ? 'error' : ''} />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth * <span className="reg-age-note">(Must be 18+)</span></label>
                      <input type="date" id="dateOfBirth" name="dateOfBirth"
                        value={formData.dateOfBirth} onChange={handleInputChange}
                        max={maxDob}
                        className={errors.dateOfBirth ? 'error' : ''} />
                      {/* Live age display */}
                      {formData.dateOfBirth && !errors.dateOfBirth && (
                        <span>
                          <FaCheckCircle /> Age: {calculateAge(formData.dateOfBirth)} years
                        </span>
                      )}
                      {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="gender">Gender *</label>
                      <select id="gender" name="gender"
                        value={formData.gender} onChange={handleInputChange}
                        className={errors.gender ? 'error' : ''}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && <span className="error-message">{errors.gender}</span>}
                    </div>
                  </div>
                </div>

                {/* ── KYC Documents ── */}
                <div className="form-section">
                  <h3><FaIdCard style={{ marginRight: 6 }} />KYC Documents</h3>
                  <div className="reg-kyc-notice">
                    <FaShieldAlt className="reg-kyc-notice__icon" />
                    <div>
                      <strong>Document Verification Required</strong>
                      <p>Upload clear scanned copies or photos of your PAN card and Aadhaar card.
                        These will be reviewed by our admin team before your account is activated.
                        Accepted formats: JPG, PNG, PDF (max 5 MB each).</p>
                    </div>
                  </div>

                  <div className="form-row">
                    <FileUploadField
                      id="panFile"
                      label="PAN Card *"
                      accept="image/jpeg,image/png,application/pdf"
                      file={panFile}
                      onChange={(f) => { setPanFile(f); setErrors(prev => ({ ...prev, panFile: '' })); }}
                      error={errors.panFile}
                      hint="JPG, PNG or PDF · Max 5 MB"
                    />
                    <FileUploadField
                      id="aadhaarFile"
                      label="Aadhaar Card *"
                      accept="image/jpeg,image/png,application/pdf"
                      file={aadhaarFile}
                      onChange={(f) => { setAadhaarFile(f); setErrors(prev => ({ ...prev, aadhaarFile: '' })); }}
                      error={errors.aadhaarFile}
                      hint="JPG, PNG or PDF · Max 5 MB"
                    />
                  </div>
                </div>

                {/* ── Account Information ── */}
                <div className="form-section">
                  <h3>Account Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="accountType">Account Type *</label>
                      <select id="accountType" name="accountType"
                        value={formData.accountType} onChange={handleInputChange}
                        className={errors.accountType ? 'error' : ''}>
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
                      <input type="number" id="initialDeposit" name="initialDeposit"
                        value={formData.initialDeposit} onChange={handleInputChange}
                        min="1000" step="100" placeholder="Minimum ₹1,000"
                        className={errors.initialDeposit ? 'error' : ''} />
                      {errors.initialDeposit && <span className="error-message">{errors.initialDeposit}</span>}
                    </div>
                  </div>
                </div>

                {/* ── Address Information ── */}
                <div className="form-section">
                  <h3>Address Information</h3>
                  <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <textarea id="address" name="address"
                      value={formData.address} onChange={handleInputChange}
                      rows="3" placeholder="House / Flat No., Street, Area"
                      className={errors.address ? 'error' : ''} />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input type="text" id="city" name="city"
                        value={formData.city} onChange={handleInputChange}
                        placeholder="City"
                        className={errors.city ? 'error' : ''} />
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <input type="text" id="state" name="state"
                        value={formData.state} onChange={handleInputChange}
                        placeholder="State"
                        className={errors.state ? 'error' : ''} />
                      {errors.state && <span className="error-message">{errors.state}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="pincode">PIN Code *</label>
                      <input type="text" id="pincode" name="pincode"
                        value={formData.pincode} onChange={handleInputChange}
                        placeholder="6-digit PIN code" maxLength={6}
                        className={errors.pincode ? 'error' : ''} />
                      {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input type="text" id="country" name="country"
                        value={formData.country} onChange={handleInputChange} readOnly />
                    </div>
                  </div>
                </div>

                {/* ── Security Information ── */}
                <div className="form-section">
                  <h3>Security Information</h3>
                  <div className="form-group">
                    <label htmlFor="username">Username *</label>
                    <input type="text" id="username" name="username"
                      value={formData.username} onChange={handleInputChange}
                      placeholder="Choose a unique username"
                      className={errors.username ? 'error' : ''} />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="password">Password *</label>
                      <div className="password-input-container">
                        <input type={showPassword ? 'text' : 'password'}
                          id="password" name="password"
                          value={formData.password} onChange={handleInputChange}
                          placeholder="Min. 8 characters"
                          className={errors.password ? 'error' : ''} />
                        <button type="button" className="password-toggle"
                          onClick={() => setShowPassword(p => !p)}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password *</label>
                      <div className="password-input-container">
                        <input type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword" name="confirmPassword"
                          value={formData.confirmPassword} onChange={handleInputChange}
                          placeholder="Re-enter password"
                          className={errors.confirmPassword ? 'error' : ''} />
                        <button type="button" className="password-toggle"
                          onClick={() => setShowConfirmPassword(p => !p)}>
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="securityQuestion">Security Question *</label>
                      <select id="securityQuestion" name="securityQuestion"
                        value={formData.securityQuestion} onChange={handleInputChange}
                        className={errors.securityQuestion ? 'error' : ''}>
                        <option value="">Select a question</option>
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
                      <input type="text" id="securityAnswer" name="securityAnswer"
                        value={formData.securityAnswer} onChange={handleInputChange}
                        placeholder="Your answer"
                        className={errors.securityAnswer ? 'error' : ''} />
                      {errors.securityAnswer && <span className="error-message">{errors.securityAnswer}</span>}
                    </div>
                  </div>
                </div>

                {/* ── Terms ── */}
                <div className="form-section">
                  <h3>Terms and Conditions</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" name="agreeToTerms"
                        checked={formData.agreeToTerms} onChange={handleInputChange} />
                      <span className="checkmark" />
                      I agree to the <a href="#terms" target="_blank" rel="noreferrer">Terms and Conditions</a> *
                    </label>
                    {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
                  </div>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" name="agreeToPrivacy"
                        checked={formData.agreeToPrivacy} onChange={handleInputChange} />
                      <span className="checkmark" />
                      I agree to the <a href="#privacy" target="_blank" rel="noreferrer">Privacy Policy</a> *
                    </label>
                    {errors.agreeToPrivacy && <span className="error-message">{errors.agreeToPrivacy}</span>}
                  </div>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" name="agreeToMarketing"
                        checked={formData.agreeToMarketing} onChange={handleInputChange} />
                      <span className="checkmark" />
                      I agree to receive marketing communications
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="register-btn">
                    <FaCheck /> Submit Application
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

      {/* ── Registration Success Popup ── */}
      {showSuccess && (
        <div className="reg-success-overlay" onClick={() => { setShowSuccess(false); navigate('/login'); }}>
          <div className="reg-success-modal" onClick={e => e.stopPropagation()}>

            {/* Top accent bar */}
            <div className="reg-success-modal__bar" />

            {/* Icon */}
            <div className="reg-success-modal__icon-wrap">
              <FaCheckCircle className="reg-success-modal__icon" />
            </div>

            {/* Heading */}
            <h2 className="reg-success-modal__title">Application Submitted!</h2>
            <p className="reg-success-modal__sub">
              Your savings account application has been received successfully.
            </p>

            {/* Account info card */}
            {registeredAccount && (
              <div className="reg-success-modal__card">
                <div className="reg-success-modal__card-row">
                  <span className="reg-success-modal__card-label">Applicant Name</span>
                  <span className="reg-success-modal__card-value">
                    {registeredAccount.firstName} {registeredAccount.lastName}
                  </span>
                </div>
                <div className="reg-success-modal__card-row">
                  <span className="reg-success-modal__card-label">Application ID</span>
                  <span className="reg-success-modal__card-value reg-success-modal__card-value--accent">
                    {registeredAccount.accountNumber}
                  </span>
                </div>
                <div className="reg-success-modal__card-row">
                  <span className="reg-success-modal__card-label">Account Type</span>
                  <span className="reg-success-modal__card-value" style={{ textTransform: 'capitalize' }}>
                    {registeredAccount.accountType} Account
                  </span>
                </div>
                <div className="reg-success-modal__card-row">
                  <span className="reg-success-modal__card-label">Submitted On</span>
                  <span className="reg-success-modal__card-value">
                    {new Date(registeredAccount.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="reg-success-modal__steps">
              <div className="reg-success-modal__step">
                <div className="reg-success-modal__step-icon reg-success-modal__step-icon--done">
                  <FaCheck />
                </div>
                <div>
                  <div className="reg-success-modal__step-title">Application Received</div>
                  <div className="reg-success-modal__step-desc">Your details &amp; KYC documents are submitted</div>
                </div>
              </div>
              <div className="reg-success-modal__step-line" />
              <div className="reg-success-modal__step">
                <div className="reg-success-modal__step-icon reg-success-modal__step-icon--pending">
                  <FaUserCheck />
                </div>
                <div>
                  <div className="reg-success-modal__step-title">Admin Verification</div>
                  <div className="reg-success-modal__step-desc">KYC documents reviewed within 1–2 working days</div>
                </div>
              </div>
              <div className="reg-success-modal__step-line" />
              <div className="reg-success-modal__step">
                <div className="reg-success-modal__step-icon reg-success-modal__step-icon--pending">
                  <FaClock />
                </div>
                <div>
                  <div className="reg-success-modal__step-title">Account Activation</div>
                  <div className="reg-success-modal__step-desc">Login credentials activated after approval</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="reg-success-modal__actions">
              <button
                className="reg-success-modal__btn-primary"
                onClick={() => { setShowSuccess(false); navigate('/login'); }}
              >
                Go to Login <FaArrowRight />
              </button>
              <button
                className="reg-success-modal__btn-outline"
                onClick={() => { setShowSuccess(false); navigate('/'); }}
              >
                Back to Home
              </button>
            </div>

            {/* Check status button */}
            {registeredAccount && (
              <button
                className="reg-success-modal__btn-status"
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/application-status', {
                    state: { prefillAccountNumber: registeredAccount.accountNumber }
                  });
                }}
              >
                <FaClipboardList style={{ marginRight: 7 }} />
                Check Application Status
              </button>
            )}

            {/* Footnote */}
            <p className="reg-success-modal__note">
              <FaShieldAlt style={{ marginRight: 5, color: 'var(--accent)' }} />
              You will be notified via email once your account is approved.
            </p>

          </div>
        </div>
      )}
    </>
  );
}
