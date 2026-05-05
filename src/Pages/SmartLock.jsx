import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaLock, FaClipboardList, FaBox, FaCheck } from 'react-icons/fa';

export default function SmartLock() {
  const [currentUser, setCurrentUser] = useState(null);
  const [lockerType, setLockerType] = useState('Small');
  const [itemDetails, setItemDetails] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const validate = () => {
    const newErrors = {};
    if (!itemDetails.trim()) newErrors.itemDetails = 'Please describe the items you want to store';
    if (!itemValue.trim()) newErrors.itemValue = 'Please enter an approximate value for the contents';
    else if (isNaN(Number(itemValue)) || Number(itemValue) < 0) newErrors.itemValue = 'Value must be a positive number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateLockerNumber = () => {
    const typeCode = lockerType.charAt(0).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `LOCK-${typeCode}-${currentUser.accountNumber.slice(-4)}-${timestamp}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const lockerNumber = generateLockerNumber();
    const booking = {
      id: `booking_${Date.now()}`,
      accountNumber: currentUser.accountNumber,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      lockerNumber,
      lockerType,
      itemDetails: itemDetails.trim(),
      approximateValue: Number(itemValue).toFixed(2),
      bookedOn: new Date().toISOString(),
      status: 'Booked'
    };

    const existingBookings = JSON.parse(localStorage.getItem('lockerBookings') || '[]');
    localStorage.setItem('lockerBookings', JSON.stringify([...existingBookings, booking]));

    const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const updatedAccounts = storedAccounts.map((account) => {
      if (account.accountNumber === currentUser.accountNumber) {
        return {
          ...account,
          lockerNumber,
          lockerType,
          lockerBooking: booking
        };
      }
      return account;
    });
    localStorage.setItem('bankAccounts', JSON.stringify(updatedAccounts));
    localStorage.setItem('currentUser', JSON.stringify({
      ...currentUser,
      lockerNumber,
      lockerType,
      lockerBooking: booking
    }));

    setSuccessMessage(`Locker ${lockerNumber} has been booked successfully.`);
    setItemDetails('');
    setItemValue('');
    setErrors({});
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Smart Lock', path: '/smart-lock' }]} />
      <main>
        <div className="smart-lock-page">
          <div className="smart-lock-container">
            <Link to="/" className="back-button">
              <FaClipboardList /> Home
            </Link>

            <div className="smart-lock-header">
              <h2>Smart Locker Booking</h2>
              <p>Reserve a secure locker and submit details of the items you want to store.</p>
            </div>

            <div className="smart-lock-content">
              <div className="smart-lock-summary">
                <div className="summary-card">
                  <h3>Your Account</h3>
                  <p><strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}</p>
                  <p><strong>Account No:</strong> {currentUser.accountNumber}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                </div>
                <div className="summary-card">
                  <h3>Locker Options</h3>
                  <p>Select from Small, Medium, or Large based on your storage needs.</p>
                  <Link to="/locker-bookings" className="secondary-link">View my bookings</Link>
                </div>
              </div>

              <div className="smart-lock-form">
                {successMessage && (
                  <div className="success-message">
                    <FaCheck /> {successMessage}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Locker Type</label>
                    <div className="radio-group">
                      {['Small', 'Medium', 'Large'].map((type) => (
                        <label key={type} className={`radio-option ${lockerType === type ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="lockerType"
                            value={type}
                            checked={lockerType === type}
                            onChange={() => setLockerType(type)}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="itemDetails">Item Details</label>
                    <textarea
                      id="itemDetails"
                      name="itemDetails"
                      value={itemDetails}
                      onChange={(e) => setItemDetails(e.target.value)}
                      rows="5"
                      placeholder="Describe the items you want to keep in the locker"
                      className={errors.itemDetails ? 'error' : ''}
                    />
                    {errors.itemDetails && <span className="error-message">{errors.itemDetails}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="itemValue">Approximate Value (₹)</label>
                    <input
                      type="text"
                      id="itemValue"
                      name="itemValue"
                      value={itemValue}
                      onChange={(e) => setItemValue(e.target.value)}
                      placeholder="Estimated value of contents"
                      className={errors.itemValue ? 'error' : ''}
                    />
                    {errors.itemValue && <span className="error-message">{errors.itemValue}</span>}
                  </div>

                  <button type="submit" className="submit-btn">Book Locker Online</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}