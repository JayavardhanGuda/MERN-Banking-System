import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaUser, FaPhone, FaMapMarkerAlt, FaIdCard, FaEnvelope, FaFileAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function ServiceRequest() {
  const [activeCategory, setActiveCategory] = useState('personal');
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    nomineeName: '',
    nomineeRelation: '',
    emailStatement: false,
    physicalStatement: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      nomineeName: user.nomineeName || '',
      nomineeRelation: user.nomineeRelation || '',
      emailStatement: user.emailStatement || false,
      physicalStatement: user.physicalStatement || false
    });
  }, [navigate]);

  const categories = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: FaUser,
      options: ['Change Name', 'Change Phone Number']
    },
    {
      id: 'address',
      title: 'Address Details',
      icon: FaMapMarkerAlt,
      options: ['Change Address']
    },
    {
      id: 'account',
      title: 'Account Settings',
      icon: FaIdCard,
      options: ['Update Nominee']
    },
    {
      id: 'statements',
      title: 'Account Statements',
      icon: FaFileAlt,
      options: ['Account Statement through Email', 'Apply for Physical Statement']
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeCategory === 'personal') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    }

    if (activeCategory === 'address') {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (activeCategory === 'account') {
      if (!formData.nomineeName.trim()) newErrors.nomineeName = 'Nominee name is required';
      if (!formData.nomineeRelation.trim()) newErrors.nomineeRelation = 'Relation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
      const updatedAccounts = storedAccounts.map(account => {
        if (account.accountNumber === currentUser.accountNumber) {
          return {
            ...account,
            ...formData,
            updatedAt: new Date().toISOString()
          };
        }
        return account;
      });

      localStorage.setItem('bankAccounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        ...formData
      }));

      setSuccessMessage('Your request has been submitted successfully. Changes will be reflected after admin approval.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const renderForm = () => {
    switch (activeCategory) {
      case 'personal':
        return (
          <div className="service-form">
            <h3>Update Personal Information</h3>
            <form onSubmit={handleSubmit}>
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
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              <button type="submit" className="submit-btn">Submit Request</button>
            </form>
          </div>
        );

      case 'address':
        return (
          <div className="service-form">
            <h3>Update Address</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                  rows="3"
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
              <div className="form-group">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={errors.pincode ? 'error' : ''}
                  placeholder="6-digit pincode"
                />
                {errors.pincode && <span className="error-message">{errors.pincode}</span>}
              </div>
              <button type="submit" className="submit-btn">Submit Request</button>
            </form>
          </div>
        );

      case 'account':
        return (
          <div className="service-form">
            <h3>Update Nominee Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nomineeName">Nominee Name *</label>
                  <input
                    type="text"
                    id="nomineeName"
                    name="nomineeName"
                    value={formData.nomineeName}
                    onChange={handleInputChange}
                    className={errors.nomineeName ? 'error' : ''}
                  />
                  {errors.nomineeName && <span className="error-message">{errors.nomineeName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="nomineeRelation">Relation *</label>
                  <input
                    type="text"
                    id="nomineeRelation"
                    name="nomineeRelation"
                    value={formData.nomineeRelation}
                    onChange={handleInputChange}
                    className={errors.nomineeRelation ? 'error' : ''}
                    placeholder="e.g., Father, Mother, Spouse"
                  />
                  {errors.nomineeRelation && <span className="error-message">{errors.nomineeRelation}</span>}
                </div>
              </div>
              <button type="submit" className="submit-btn">Submit Request</button>
            </form>
          </div>
        );

      case 'statements':
        return (
          <div className="service-form">
            <h3>Account Statement Preferences</h3>
            <form onSubmit={handleSubmit}>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="emailStatement"
                    checked={formData.emailStatement}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Receive Account Statement through Email
                </label>
              </div>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="physicalStatement"
                    checked={formData.physicalStatement}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Apply for Physical Statement (mailed to your address)
                </label>
              </div>
              <button type="submit" className="submit-btn">Submit Request</button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Home', path: '/' },
        { label: 'Service Request', path: '/service-request' }
      ]} />
      <main>
        <div className="service-request-page">
          <div className="service-container">
            <Link to="/" className="back-button">
              <FaArrowLeft /> Home
            </Link>

            <div className="service-header">
              <h2>Service Request</h2>
              <p>Update your account details and manage your banking preferences</p>
            </div>

            <div className="service-content">
              <div className="service-sidebar">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`sidebar-category ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <category.icon className="category-icon" />
                    <div className="category-info">
                      <h4>{category.title}</h4>
                      <ul className="category-options">
                        {category.options.map(option => (
                          <li key={option}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="service-main">
                {successMessage && (
                  <div className="success-message">
                    <FaCheck /> {successMessage}
                  </div>
                )}
                {renderForm()}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}