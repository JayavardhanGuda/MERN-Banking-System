import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaLock, FaCheck, FaCheckCircle, FaBox,
  FaUser, FaIdCard, FaEnvelope, FaHistory
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
  const [errors, setErrors]                 = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { navigate('/login'); return; }
    setCurrentUser(user);
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!itemDetails.trim()) e.itemDetails = 'Please describe the items you want to store';
    if (!itemValue.trim())   e.itemValue   = 'Please enter an approximate value';
    else if (isNaN(Number(itemValue)) || Number(itemValue) < 0) e.itemValue = 'Value must be a positive number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const typeCode    = lockerType.charAt(0).toUpperCase();
    const lockerNumber = `LOCK-${typeCode}-${currentUser.accountNumber.slice(-4)}-${Date.now().toString().slice(-6)}`;

    const booking = {
      id:               `booking_${Date.now()}`,
      accountNumber:    currentUser.accountNumber,
      userName:         `${currentUser.firstName} ${currentUser.lastName}`,
      lockerNumber,
      lockerType,
      itemDetails:      itemDetails.trim(),
      approximateValue: Number(itemValue).toFixed(2),
      bookedOn:         new Date().toISOString(),
      status:           'Booked',
    };

    const existing = JSON.parse(localStorage.getItem('lockerBookings') || '[]');
    localStorage.setItem('lockerBookings', JSON.stringify([...existing, booking]));

    const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    localStorage.setItem('bankAccounts', JSON.stringify(
      accounts.map(a => a.accountNumber === currentUser.accountNumber
        ? { ...a, lockerNumber, lockerType, lockerBooking: booking } : a)
    ));
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, lockerNumber, lockerType, lockerBooking: booking }));

    setSuccessMessage(`Locker ${lockerNumber} booked successfully!`);
    setItemDetails('');
    setItemValue('');
    setErrors({});
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  if (!currentUser) return <div className="sl-loading">Loading…</div>;

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

          {/* Locker type selector */}
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

          {!embedded && (
            <Link to="/locker-bookings" className="sl-history-link">
              <FaHistory /> View My Bookings
            </Link>
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

          <div className="sl-form-card">
            <div className="sl-form-card__title">Booking Details</div>
            <form onSubmit={handleSubmit} className="sl-form" noValidate>

              <div className="sl-form-group">
                <label>Item Details *</label>
                <textarea
                  value={itemDetails}
                  onChange={e => { setItemDetails(e.target.value); setErrors(p => ({ ...p, itemDetails: '' })); }}
                  rows={5}
                  placeholder="Describe the items you want to store (e.g. gold jewellery, property documents, passport)"
                  className={`sl-input${errors.itemDetails ? ' sl-input--error' : ''}`}
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

              <button type="submit" className="sl-submit-btn">
                <FaLock /> Book Locker Now
              </button>
            </form>
          </div>
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
