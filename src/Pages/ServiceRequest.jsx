import { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaUser, FaPhone, FaMapMarkerAlt, FaIdCard,
  FaFileAlt, FaArrowLeft, FaCheck, FaCheckCircle,
  FaEnvelope, FaCity
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ServiceRequest.css';

const CATEGORIES = [
  { id: 'personal',   label: 'Personal Information', icon: FaUser,        options: ['Change Name', 'Change Phone Number'] },
  { id: 'address',    label: 'Address Details',       icon: FaMapMarkerAlt, options: ['Change Address'] },
  { id: 'account',    label: 'Account Settings',      icon: FaIdCard,      options: ['Update Nominee'] },
  { id: 'statements', label: 'Account Statements',    icon: FaFileAlt,     options: ['Email Statement', 'Physical Statement'] },
];

export default function ServiceRequest({ embedded = false }) {
  const [activeCategory, setActiveCategory] = useState('personal');
  const [currentUser, setCurrentUser]       = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors]                 = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    nomineeName: '', nomineeRelation: '',
    emailStatement: false, physicalStatement: false,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { navigate('/login'); return; }
    setCurrentUser(user);
    setFormData({
      firstName:         user.firstName || '',
      lastName:          user.lastName || '',
      phone:             user.phone || '',
      address:           user.address || '',
      city:              user.city || '',
      state:             user.state || '',
      pincode:           user.pincode || '',
      nomineeName:       user.nomineeName || '',
      nomineeRelation:   user.nomineeRelation || '',
      emailStatement:    user.emailStatement || false,
      physicalStatement: user.physicalStatement || false,
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (activeCategory === 'personal') {
      if (!formData.firstName.trim()) e.firstName = 'First name is required';
      if (!formData.lastName.trim())  e.lastName  = 'Last name is required';
      if (!formData.phone.trim())     e.phone     = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone)) e.phone = 'Must be 10 digits';
    }
    if (activeCategory === 'address') {
      if (!formData.address.trim()) e.address = 'Address is required';
      if (!formData.city.trim())    e.city    = 'City is required';
      if (!formData.state.trim())   e.state   = 'State is required';
      if (!formData.pincode.trim()) e.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = 'Must be 6 digits';
    }
    if (activeCategory === 'account') {
      if (!formData.nomineeName.trim())     e.nomineeName     = 'Nominee name is required';
      if (!formData.nomineeRelation.trim()) e.nomineeRelation = 'Relation is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    localStorage.setItem('bankAccounts', JSON.stringify(
      accounts.map(a => a.accountNumber === currentUser.accountNumber
        ? { ...a, ...formData, updatedAt: new Date().toISOString() } : a)
    ));
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...formData }));
    setSuccessMessage('Request submitted successfully. Changes will reflect after admin approval.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const inputCls = (field) => `sr-input${errors[field] ? ' sr-input--error' : ''}`;

  const renderForm = () => {
    if (activeCategory === 'personal') return (
      <form onSubmit={handleSubmit} className="sr-form" noValidate>
        <div className="sr-form-row">
          <div className="sr-form-group">
            <label>First Name *</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputCls('firstName')} placeholder="First name" />
            {errors.firstName && <span className="sr-error">{errors.firstName}</span>}
          </div>
          <div className="sr-form-group">
            <label>Last Name *</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputCls('lastName')} placeholder="Last name" />
            {errors.lastName && <span className="sr-error">{errors.lastName}</span>}
          </div>
        </div>
        <div className="sr-form-group">
          <label>Phone Number *</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className={inputCls('phone')} placeholder="10-digit mobile number" maxLength={10} />
          {errors.phone && <span className="sr-error">{errors.phone}</span>}
        </div>
        <button type="submit" className="sr-submit-btn"><FaCheck /> Submit Request</button>
      </form>
    );

    if (activeCategory === 'address') return (
      <form onSubmit={handleSubmit} className="sr-form" noValidate>
        <div className="sr-form-group">
          <label>Address *</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={inputCls('address')} placeholder="House / Flat No., Street, Area" />
          {errors.address && <span className="sr-error">{errors.address}</span>}
        </div>
        <div className="sr-form-row">
          <div className="sr-form-group">
            <label>City *</label>
            <input name="city" value={formData.city} onChange={handleChange} className={inputCls('city')} placeholder="City" />
            {errors.city && <span className="sr-error">{errors.city}</span>}
          </div>
          <div className="sr-form-group">
            <label>State *</label>
            <input name="state" value={formData.state} onChange={handleChange} className={inputCls('state')} placeholder="State" />
            {errors.state && <span className="sr-error">{errors.state}</span>}
          </div>
        </div>
        <div className="sr-form-group">
          <label>PIN Code *</label>
          <input name="pincode" value={formData.pincode} onChange={handleChange} className={inputCls('pincode')} placeholder="6-digit PIN code" maxLength={6} />
          {errors.pincode && <span className="sr-error">{errors.pincode}</span>}
        </div>
        <button type="submit" className="sr-submit-btn"><FaCheck /> Submit Request</button>
      </form>
    );

    if (activeCategory === 'account') return (
      <form onSubmit={handleSubmit} className="sr-form" noValidate>
        <div className="sr-form-row">
          <div className="sr-form-group">
            <label>Nominee Name *</label>
            <input name="nomineeName" value={formData.nomineeName} onChange={handleChange} className={inputCls('nomineeName')} placeholder="Full name of nominee" />
            {errors.nomineeName && <span className="sr-error">{errors.nomineeName}</span>}
          </div>
          <div className="sr-form-group">
            <label>Relation *</label>
            <input name="nomineeRelation" value={formData.nomineeRelation} onChange={handleChange} className={inputCls('nomineeRelation')} placeholder="e.g. Father, Spouse" />
            {errors.nomineeRelation && <span className="sr-error">{errors.nomineeRelation}</span>}
          </div>
        </div>
        <button type="submit" className="sr-submit-btn"><FaCheck /> Submit Request</button>
      </form>
    );

    if (activeCategory === 'statements') return (
      <form onSubmit={handleSubmit} className="sr-form">
        <div className="sr-checkbox-group">
          <label className="sr-checkbox-label">
            <input type="checkbox" name="emailStatement" checked={formData.emailStatement} onChange={handleChange} />
            <span className="sr-checkmark" />
            <div>
              <div className="sr-checkbox-title">Email Statement</div>
              <div className="sr-checkbox-desc">Receive monthly account statements to your registered email address</div>
            </div>
          </label>
        </div>
        <div className="sr-checkbox-group">
          <label className="sr-checkbox-label">
            <input type="checkbox" name="physicalStatement" checked={formData.physicalStatement} onChange={handleChange} />
            <span className="sr-checkmark" />
            <div>
              <div className="sr-checkbox-title">Physical Statement</div>
              <div className="sr-checkbox-desc">Receive printed statements mailed to your registered address</div>
            </div>
          </label>
        </div>
        <button type="submit" className="sr-submit-btn"><FaCheck /> Submit Request</button>
      </form>
    );
  };

  if (!currentUser) return <div className="sr-loading">Loading…</div>;

  const content = (
    <div className={embedded ? 'sr-embedded' : 'sr-page'}>
      {!embedded && (
        <div className="sr-page-header">
          <div className="sr-page-header__icon"><FaIdCard /></div>
          <div>
            <h2 className="sr-page-header__title">Service Request</h2>
            <p className="sr-page-header__sub">Update your account details and manage banking preferences</p>
          </div>
        </div>
      )}

      <div className="sr-layout">
        {/* Sidebar */}
        <div className="sr-sidebar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`sr-sidebar-item${activeCategory === cat.id ? ' active' : ''}`}
                onClick={() => { setActiveCategory(cat.id); setSuccessMessage(''); setErrors({}); }}
              >
                <div className="sr-sidebar-item__icon"><Icon /></div>
                <div className="sr-sidebar-item__body">
                  <div className="sr-sidebar-item__label">{cat.label}</div>
                  <div className="sr-sidebar-item__opts">{cat.options.join(' · ')}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main */}
        <div className="sr-main">
          {successMessage && (
            <div className="sr-success">
              <FaCheckCircle className="sr-success__icon" />
              {successMessage}
            </div>
          )}

          <div className="sr-form-card">
            <div className="sr-form-card__title">
              {CATEGORIES.find(c => c.id === activeCategory)?.label}
            </div>
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Service Request', path: '/service-request' }]} />
      <main>{content}</main>
      <Footer />
    </>
  );
}
