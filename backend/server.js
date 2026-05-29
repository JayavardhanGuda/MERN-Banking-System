require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Import routes
const userRoutes = require('./routes/user');
const accountRoutes = require('./routes/account');
const transactionRoutes = require('./routes/transaction');
const lockerBookingRoutes = require('./routes/lockerBooking');
const internetBankingRoutes = require('./routes/internetBanking');
const serviceRequestRoutes = require('./routes/serviceRequest');
const logoutHistoryRoutes = require('./routes/logoutHistory');
const otpRoutes = require('./routes/otp');
const reportFraudRoutes = require('./routes/reportFraud');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const applicationStatusRoutes = require('./routes/applicationStatus');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/locker-bookings', lockerBookingRoutes);
app.use('/api/internet-banking', internetBankingRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/logout-history', logoutHistoryRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/report-fraud', reportFraudRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/application-status', applicationStatusRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VJN Banking API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
