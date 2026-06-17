import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { bookLocker, getLockerBookings } from '../services/api';
import {
  FaLock, FaCheck, FaCheckCircle, FaBox,
  FaUser, FaIdCard, FaEnvelope,
  FaSpinner, FaExclamationCircle, FaClock
} from 'react-icons/fa';
import '../styles/SmartLock.css';

const LOCKER_TYPES = [
  { id: 'Small',  desc: 'Ideal for documents, jewellery, small valuables', size: '30×20×15 cm', rent: '₹500/year' },
  { id: 'Medium', desc: 'Suitable for larger jewellery sets, important files', size: '45×30×20 cm', rent: '₹900/year' },
  { id: 'Large',  desc: 'Best for bulky items, multiple valuables', size: '60×40×30 cm', rent: '₹1,400/year' },
];

export default function SmartLock({ embedded = false }) {
  const [currentUser, setCurrentUser]       = useState(null);
  const [lockerType, setLockerType]         = useState('Small');
  const [itemDetails, setItemDetails]       = useState('');
  const [itemValue, setItemValue]           = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [errors, setErrors]                 = useState({});
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { navigate('/login'); return; }
    setCurrentUser(user);
    
    // Check for existing bookings
    const fetchBookings = async () => {
      try {
        const response = await getLockerBookings(user.accountNumber);
        if (response.success) {
          setExistingBookings(response.data || []);
          const pending = response.data?.find(b => b.status === 'Pending');
          setHasPendingRequest(!!pending);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!itemDetails.trim()) e.itemDetails = 'Please describe the items you want to store';
    if (!itemValue.trim())   e.itemValue   = 'Please enter an approximate value';
    else if (isNaN(Number(itemValue)) || Number(itemValue) < 0) e.itemValue = 'Value must be a positive number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const bookingData = {
        accountNumber: currentUser.accountNumber,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        lockerType,
        itemDetails: itemDetails.trim(),
        approximateValue: Number(itemValue),
        duration: '1 Year'
      };

      const response = await bookLocker(bookingData);

      if (response.success) {
        setSuccessMessage(response.message || 'Locker booking request submitted successfully! Awaiting admin approval.');
        setItemDetails('');
        setItemValue('');
        setErrors({});
        setHasPendingRequest(true);
        
        // Refresh bookings
        const bookingsResponse = await getLockerBookings(currentUser.accountNumber);
        if (bookingsResponse.success) {
          setExistingBookings(bookingsResponse.data || []);
        }
      } else {
        setErrorMessage(response.message || 'Failed to submit locker booking request');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrorMessage(error.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return <div className="sl-loading">Loading…</div>;

  // Get approved locker if any
  const approvedLocker = existingBookings.find(b => b.status === 'Approved');
  const pendingRequest = existingBookings.find(b => b.status === 'Pending');

  const content = (
    <div className={embedded ? 'sl-embedded' : 'sl-page'}>
      {!embedded && (
        <div className="sl-page-header">
          <div className="sl-page-header__icon"><FaLock /></div>
          <div>
            <h2 className="sl-page-header__title">Smart Locker Booking</h2>
            <p className="sl-page-header__sub">Reserve a secure bank locker for your valuables</p>
          </div>
        </div>
      )}

      <div className="sl-layout">

        {/* Left — account info + locker types */}
        <div className="sl-left">
          {/* Account card */}
          <div className="sl-account-card">
            <div className="sl-account-card__title"><FaUser /> Your Account</div>
            <div className="sl-account-card__row">
              <span className="sl-account-card__label">Name</span>
              <span className="sl-account-card__value">{currentUser.firstName} {currentUser.lastName}</span>
            </div>
            <div className="sl-account-card__row">
              <span className="sl-account-card__label">Account No.</span>
              <span className="sl-account-card__value sl-account-card__value--mono">{currentUser.accountNumber}</span>
            </div>
            <div className="sl-account-card__row">
              <span className="sl-account-card__label">Email</span>
              <span className="sl-account-card__value">{currentUser.email}</span>
            </div>
          </div>

          {/* Show approved locker info */}
          {approvedLocker && (
            <div className="sl-approved-card">
              <div className="sl-approved-card__title"><FaCheckCircle /> Your Active Locker</div>
              <div className="sl-approved-card__row">
                <span>Locker Number</span>
                <strong>{approvedLocker.assignedLockerNumber || approvedLocker.lockerNumber}</strong>
              </div>
              <div className="sl-approved-card__row">
                <span>Type</span>
                <strong>{approvedLocker.lockerType}</strong>
              </div>
              <div className="sl-approved-card__row">
                <span>Branch</span>
                <strong>{approvedLocker.assignedBranch || 'Main Branch'}</strong>
              </div>
              <div className="sl-approved-card__row">
                <span>Expires</span>
                <strong>{approvedLocker.expiresAt ? new Date(approvedLocker.expiresAt).toLocaleDateString() : '-'}</strong>
              </div>
            </div>
          )}

          {/* Show pending request info */}
          {pendingRequest && !approvedLocker && (
            <div className="sl-pending-card">
              <div className="sl-pending-card__title"><FaClock /> Pending Request</div>
              <p>Your locker booking request is awaiting admin approval.</p>
              <div className="sl-pending-card__row">
                <span>Request ID</span>
                <strong>{pendingRequest.lockerNumber}</strong>
              </div>
              <div className="sl-pending-card__row">
                <span>Type</span>
                <strong>{pendingRequest.lockerType}</strong>
              </div>
              <div className="sl-pending-card__row">
                <span>Submitted</span>
                <strong>{new Date(pendingRequest.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>
          )}

          {/* Locker type selector */}
          {!approvedLocker && !pendingRequest && (
            <div className="sl-type-section">
              <div className="sl-type-section__title"><FaBox /> Select Locker Size</div>
              {LOCKER_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`sl-type-btn${lockerType === t.id ? ' active' : ''}`}
                  onClick={() => setLockerType(t.id)}
                >
                  <div className="sl-type-btn__top">
                    <span className="sl-type-btn__name">{t.id}</span>
                    <span className="sl-type-btn__rent">{t.rent}</span>
                  </div>
                  <div className="sl-type-btn__desc">{t.desc}</div>
                  <div className="sl-type-btn__size">{t.size}</div>
                </button>
              ))}
            </div>
          )}


        </div>

        {/* Right — booking form */}
        <div className="sl-right">
          {successMessage && (
            <div className="sl-success">
              <FaCheckCircle className="sl-success__icon" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="sl-error-msg">
              <FaExclamationCircle className="sl-error-msg__icon" />
              {errorMessage}
            </div>
          )}

          {approvedLocker ? (
            <div className="sl-info-card">
              <FaCheckCircle className="sl-info-card__icon" />
              <h3>You already have an active locker</h3>
              <p>Your locker <strong>{approvedLocker.assignedLockerNumber}</strong> is currently active.</p>
              <p>Visit the branch to access your locker or contact support for assistance.</p>
            </div>
          ) : pendingRequest ? (
            <div className="sl-info-card sl-info-card--pending">
              <FaClock className="sl-info-card__icon" />
              <h3>Request Under Review</h3>
              <p>Your locker booking request is being reviewed by our team.</p>
              <p>You will be notified once your request is approved or if additional information is needed.</p>
            </div>
          ) : (
            <div className="sl-form-card">
              <div className="sl-form-card__title">Booking Details</div>
              <form onSubmit={handleSubmit} className="sl-form" noValidate>

                <div className="sl-form-group">
                  <label>Item Details *</label>
                  <textarea
                    value={itemDetails}
                    onChange={e => { setItemDetails(e.target.value); setErrors(p => ({ ...p, itemDetails: '' })); }}
                    rows={4}
                    placeholder="Describe the items you want to store (e.g. gold jewellery, property documents, passport)"
                    className={`sl-input${errors.itemDetails ? ' sl-input--error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.itemDetails && <span className="sl-error">{errors.itemDetails}</span>}
                </div>

                <div className="sl-form-group">
                  <label>Approximate Value (₹) *</label>
                  <input
                    type="number"
                    value={itemValue}
                    onChange={e => { setItemValue(e.target.value); setErrors(p => ({ ...p, itemValue: '' })); }}
                    placeholder="Estimated total value of contents"
                    min="0"
                    className={`sl-input${errors.itemValue ? ' sl-input--error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.itemValue && <span className="sl-error">{errors.itemValue}</span>}
                </div>

                {/* Summary strip */}
                <div className="sl-summary-strip">
                  <div className="sl-summary-strip__item">
                    <span className="sl-summary-strip__label">Locker Type</span>
                    <span className="sl-summary-strip__value">{lockerType}</span>
                  </div>
                  <div className="sl-summary-strip__item">
                    <span className="sl-summary-strip__label">Annual Rent</span>
                    <span className="sl-summary-strip__value sl-summary-strip__value--gold">
                      {LOCKER_TYPES.find(t => t.id === lockerType)?.rent}
                    </span>
                  </div>
                  <div className="sl-summary-strip__item">
                    <span className="sl-summary-strip__label">Dimensions</span>
                    <span className="sl-summary-strip__value">{LOCKER_TYPES.find(t => t.id === lockerType)?.size}</span>
                  </div>
                </div>

                <button type="submit" className="sl-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><FaSpinner className="sl-spinner" /> Submitting...</>
                  ) : (
                    <><FaLock /> Submit Locker Request</>
                  )}
                </button>
                
                <p className="sl-form-note">
                  Your request will be reviewed by our team. You will be notified once approved.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Smart Lock', path: '/smart-lock' }]} />
      <main>{content}</main>
      <Footer />
    </>
  );
}
