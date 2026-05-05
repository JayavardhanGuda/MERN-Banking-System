import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaClipboardList, FaTrashAlt, FaShieldAlt } from 'react-icons/fa';

export default function LockerBookings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    const storedBookings = JSON.parse(localStorage.getItem('lockerBookings') || '[]');
    const userBookings = storedBookings.filter((booking) => booking.accountNumber === user.accountNumber);
    setBookings(userBookings);
  }, [navigate]);

  const cancelBooking = (bookingId) => {
    const storedBookings = JSON.parse(localStorage.getItem('lockerBookings') || '[]');
    const updatedBookings = storedBookings.filter((booking) => booking.id !== bookingId);
    localStorage.setItem('lockerBookings', JSON.stringify(updatedBookings));

    const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const updatedAccounts = storedAccounts.map((account) => {
      if (account.accountNumber === currentUser.accountNumber) {
        return {
          ...account,
          lockerNumber: undefined,
          lockerType: undefined,
          lockerBooking: undefined
        };
      }
      return account;
    });
    localStorage.setItem('bankAccounts', JSON.stringify(updatedAccounts));

    const updatedUser = {
      ...currentUser,
      lockerNumber: undefined,
      lockerType: undefined,
      lockerBooking: undefined
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setBookings(updatedBookings.filter((booking) => booking.accountNumber === currentUser.accountNumber));
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Locker Bookings', path: '/locker-bookings' }]} />
      <main>
        <div className="locker-bookings-page">
          <div className="locker-bookings-container">
            <Link to="/smart-lock" className="back-button">
              <FaClipboardList /> Smart Lock
            </Link>

            <div className="locker-bookings-header">
              <h2>Your Locker Reservations</h2>
              <p>Manage your current locker bookings and cancel any reservation if needed.</p>
            </div>

            <div className="locker-bookings-list">
              {bookings.length === 0 ? (
                <div className="no-bookings-card">
                  <FaShieldAlt className="no-bookings-icon" />
                  <h3>No locker bookings found</h3>
                  <p>You do not have any active locker reservations. Book a locker from the Smart Lock page.</p>
                  <Link to="/smart-lock" className="secondary-link">Book a locker now</Link>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-card-header">
                      <div>
                        <h3>{booking.lockerNumber}</h3>
                        <p className="booking-type">{booking.lockerType} Locker</p>
                      </div>
                      <button className="cancel-btn" onClick={() => cancelBooking(booking.id)}>
                        <FaTrashAlt /> Cancel Booking
                      </button>
                    </div>
                    <div className="booking-details">
                      <p><strong>Booked On:</strong> {new Date(booking.bookedOn).toLocaleString()}</p>
                      <p><strong>Item Details:</strong> {booking.itemDetails}</p>
                      <p><strong>Approximate Value:</strong> ₹{booking.approximateValue}</p>
                      <p><strong>Status:</strong> {booking.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
