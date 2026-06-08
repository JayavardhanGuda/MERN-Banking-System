import { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaUser, FaPhone, FaMapMarkerAlt, FaIdCard,
  FaFileAlt, FaCheck, FaCheckCircle, FaTimes,
  FaClock, FaHistory, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createServiceRequest, getServiceRequests, cancelServiceRequest, getUserProfile } from '../services/api';
import '../styles/ServiceRequest.css';

const CATEGORIES = [
  { id: 'personal',   label: 'Personal Information', icon: FaUser,        options: ['Change Name', 'Change Phone Number'] },
  { id: 'address',    label: 'Address Details',       icon: FaMapMarkerAlt, options: ['Change Address'] },
  { id: 'account',    label: 'Account Settings',      icon: FaIdCard,      options: ['Update Nominee'] },
  { id: 'statements', label: 'Account Statements',    icon: FaFileAlt,     options: ['Email Statement', 'Physical Statement'] },
];

export default function ServiceRequest({ embedded = false }) {
  const [activeCategory, setActiveCategory] = useState('personal');
  const [activeTab, setActiveTab] = useState('request'); // 'request' or 'history'
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    nomineeName: '', nomineeRelation: '',
    emailStatement: false, physicalStatement: false,
    userRemarks: ''
  });

  // Original values for comparison
  const [originalData, setOriginalData] = useState({});

  // Load request history function (defined before useEffect to avoid hoisting issues)
  const loadRequestHistory = async (accountNumber) => {
    setLoadingHistory(true);
    try {
      const response = await getServiceRequests(accountNumber);
      if (response.success) {
        setRequestHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error loading request history:', error);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    const init = async () => {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      let latestUser = user;
      try {
        const profileResponse = await getUserProfile(user.accountNumber);
        if (profileResponse.success && profileResponse.data) {
          latestUser = profileResponse.data;
          localStorage.setItem('currentUser', JSON.stringify(latestUser));
        }
      } catch (error) {
        console.warn('Unable to refresh profile on service request page:', error);
      }

      const userData = {
        firstName:         latestUser.firstName || '',
        lastName:          latestUser.lastName || '',
        phone:             latestUser.phone || '',
        address:           latestUser.address || '',
        city:              latestUser.city || '',
        state:             latestUser.state || '',
        pincode:           latestUser.pincode || '',
        nomineeName:       latestUser.nomineeName || '',
        nomineeRelation:   latestUser.nomineeRelation || '',
        emailStatement:    latestUser.emailStatement || false,
        physicalStatement: latestUser.physicalStatement || false,
      };

      setCurrentUser(latestUser);
      setFormData({ ...userData, userRemarks: '' });
      setOriginalData(userData);
      loadRequestHistory(latestUser.accountNumber);
    };

    init();
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

  const hasChanges = () => {
    if (activeCategory === 'personal') {
      return formData.firstName !== originalData.firstName ||
             formData.lastName !== originalData.lastName ||
             formData.phone !== originalData.phone;
    }
    if (activeCategory === 'address') {
      return formData.address !== originalData.address ||
             formData.city !== originalData.city ||
             formData.state !== originalData.state ||
             formData.pincode !== originalData.pincode;
    }
    if (activeCategory === 'account') {
      return formData.nomineeName !== originalData.nomineeName ||
             formData.nomineeRelation !== originalData.nomineeRelation;
    }
    if (activeCategory === 'statements') {
      return formData.emailStatement !== originalData.emailStatement ||
             formData.physicalStatement !== originalData.physicalStatement;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!hasChanges()) {
      setErrors({ general: 'No changes detected. Please modify at least one field.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const requestData = {
        accountNumber: currentUser.accountNumber,
        category: activeCategory,
        oldValues: {
          firstName: originalData.firstName,
          lastName: originalData.lastName,
          phone: originalData.phone,
          address: originalData.address,
          city: originalData.city,
          state: originalData.state,
          pincode: originalData.pincode,
          nomineeName: originalData.nomineeName,
          nomineeRelation: originalData.nomineeRelation,
          emailStatement: originalData.emailStatement,
          physicalStatement: originalData.physicalStatement
        },
        newValues: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          nomineeName: formData.nomineeName,
          nomineeRelation: formData.nomineeRelation,
          emailStatement: formData.emailStatement,
          physicalStatement: formData.physicalStatement
        },
        userRemarks: formData.userRemarks
      };

      const response = await createServiceRequest(requestData);

      if (response.success) {
        setSuccessMessage('Request submitted successfully! It will be reviewed by admin.');
        setTimeout(() => setSuccessMessage(''), 5000);
        // Reload history
        loadRequestHistory(currentUser.accountNumber);
        // Reset remarks
        setFormData(prev => ({ ...prev, userRemarks: '' }));
      } else {
        setErrors({ general: response.message || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ general: error.message || 'Failed to submit request' });
    }

    setIsSubmitting(false);
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      const response = await cancelServiceRequest(requestId);
      if (response.success) {
        loadRequestHistory(currentUser.accountNumber);
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const inputCls = (field) => `sr-input${errors[field] ? ' sr-input--error' : ''}`;

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { class: 'sr-badge--pending', icon: <FaClock /> },
      'Approved': { class: 'sr-badge--approved', icon: <FaCheckCircle /> },
      'Rejected': { class: 'sr-badge--rejected', icon: <FaTimes /> },
      'Cancelled': { class: 'sr-badge--cancelled', icon: <FaTimes /> }
    };
    const s = statusMap[status] || statusMap['Pending'];
    return <span className={`sr-badge ${s.class}`}>{s.icon} {status}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const renderForm = () => {
    if (activeCategory === 'personal') return (
      <form onSubmit={handleSubmit} className="sr-form" noValidate>
        <div className="sr-current-values">
          <h4>Current Values</h4>
          <p><strong>Name:</strong> {originalData.firstName} {originalData.lastName}</p>
          <p><strong>Phone:</strong> {originalData.phone || 'Not set'}</p>
        </div>
        
        <div className="sr-new-values">
          <h4>New Values</h4>
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
        </div>

        <div className="sr-form-group">
          <label>Remarks (Optional)</label>
          <textarea name="userRemarks" value={formData.userRemarks} onChange={handleChange} className="sr-input" rows={2} placeholder="Any additional information for the admin..." />
        </div>

        {errors.general && <div className="sr-error-box"><FaExclamationTriangle /> {errors.general}</div>}
        
        <button type="submit" className="sr-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? <><FaSpinner className="spin" /> Submitting...</> : <><FaCheck /> Submit Request</>}
        </button>
      </form>
    );

    if (activeCategory === 'address') return (
      <form onSubmit={handleSubmit} className="sr-form" noValidate>
        <div className="sr-current-values">
          <h4>Current Address</h4>
          <p>{originalData.address || 'Not set'}</p>
          <p>{originalData.city}, {originalData.state} - {originalData.pincode}</p>
        </div>

        <div className="sr-new-values">
          <h4>New Address</h4>
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
        </div>

        <div className="sr-form-group">
          <label>Remarks (Optional)</label>
          <textarea name="userRemarks" value={formData.userRemarks} onChange={handleChange} className="sr-input" rows={2} placeholder="Any additional information for the admin..." />
        </div>

        {errors.general && <div className="sr-error-box"><FaExclamationTriangle /> {errors.general}</div>}

        <button type="submit" className="sr-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? <><FaSpinner className="spin" /> Submitting...</> : <><FaCheck /> Submit Request</>}
        </button>
      </form>
    );

    if (activeCategory === 'account') return (
      <form onSubmit={handleSubmit} className="sr-form" noValidate>
        <div className="sr-current-values">
          <h4>Current Nominee</h4>
          <p><strong>Name:</strong> {originalData.nomineeName || 'Not set'}</p>
          <p><strong>Relation:</strong> {originalData.nomineeRelation || 'Not set'}</p>
        </div>

        <div className="sr-new-values">
          <h4>New Nominee Details</h4>
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
        </div>

        <div className="sr-form-group">
          <label>Remarks (Optional)</label>
          <textarea name="userRemarks" value={formData.userRemarks} onChange={handleChange} className="sr-input" rows={2} placeholder="Any additional information for the admin..." />
        </div>

        {errors.general && <div className="sr-error-box"><FaExclamationTriangle /> {errors.general}</div>}

        <button type="submit" className="sr-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? <><FaSpinner className="spin" /> Submitting...</> : <><FaCheck /> Submit Request</>}
        </button>
      </form>
    );

    if (activeCategory === 'statements') return (
      <form onSubmit={handleSubmit} className="sr-form">
        <div className="sr-current-values">
          <h4>Current Statement Preferences</h4>
          <p><strong>Email Statement:</strong> {originalData.emailStatement ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Physical Statement:</strong> {originalData.physicalStatement ? 'Enabled' : 'Disabled'}</p>
        </div>

        <div className="sr-new-values">
          <h4>Update Preferences</h4>
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
        </div>

        {errors.general && <div className="sr-error-box"><FaExclamationTriangle /> {errors.general}</div>}

        <button type="submit" className="sr-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? <><FaSpinner className="spin" /> Submitting...</> : <><FaCheck /> Submit Request</>}
        </button>
      </form>
    );
  };

  const renderHistory = () => (
    <div className="sr-history">
      {loadingHistory ? (
        <div className="sr-history-loading"><FaSpinner className="spin" /> Loading history...</div>
      ) : requestHistory.length === 0 ? (
        <div className="sr-history-empty">
          <FaHistory className="sr-history-empty__icon" />
          <p>No service requests yet</p>
        </div>
      ) : (
        <div className="sr-history-list">
          {requestHistory.map(req => (
            <div key={req._id} className="sr-history-item">
              <div className="sr-history-item__header">
                <div className="sr-history-item__type">{req.requestType || req.category}</div>
                {getStatusBadge(req.status)}
              </div>
              <div className="sr-history-item__id">Request ID: {req.requestId}</div>
              <div className="sr-history-item__date">Submitted: {formatDate(req.createdAt)}</div>
              
              {req.status === 'Approved' && (
                <div className="sr-history-item__approved">
                  <FaCheckCircle /> Approved on {formatDate(req.reviewedAt)}
                  {req.changesApplied?.length > 0 && (
                    <div className="sr-history-item__changes">
                      <strong>Changes Applied:</strong>
                      <ul>
                        {req.changesApplied.map((change, i) => (
                          <li key={i}>{change.field}: {change.oldValue} → {change.newValue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {req.status === 'Rejected' && (
                <div className="sr-history-item__rejected">
                  <FaTimes /> Rejected: {req.rejectionReason}
                </div>
              )}

              {req.status === 'Pending' && (
                <button 
                  className="sr-history-item__cancel"
                  onClick={() => handleCancelRequest(req._id)}
                >
                  <FaTimes /> Cancel Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!currentUser) return <div className="sr-loading"><FaSpinner className="spin" /> Loading…</div>;

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

      {/* Tab switcher */}
      <div className="sr-tabs">
        <button 
          className={`sr-tab ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          <FaFileAlt /> New Request
        </button>
        <button 
          className={`sr-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> Request History
          {requestHistory.filter(r => r.status === 'Pending').length > 0 && (
            <span className="sr-tab__badge">{requestHistory.filter(r => r.status === 'Pending').length}</span>
          )}
        </button>
      </div>

      {activeTab === 'request' ? (
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
              <p className="sr-form-card__note">
                <FaClock /> Changes will be reviewed by admin before being applied to your account.
              </p>
              {renderForm()}
            </div>
          </div>
        </div>
      ) : (
        renderHistory()
      )}
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
