require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// ── Security packages ──────────────────────────────────────────────────────
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
// ──────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB (non-blocking)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.warn('MongoDB connection warning (server will continue to run):', err.message);
  });

// ── SECURITY MIDDLEWARE ────────────────────────────────────────────────────

// 1. CORS must come FIRST — before helmet — so cross-origin requests
//    from the frontend (localhost:5173) are allowed through
app.use(cors());

// 2. HELMET — sets secure HTTP headers
//    crossOriginResourcePolicy set to false so it doesn't block
//    the frontend fetch calls (cors() handles that already)
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,   // disable CSP in dev — enable in production
}));

// 3. RATE LIMITING — general limit for all API routes
//    Allows 100 requests per IP per 15 minutes
//    Protects against: automated scraping and general flooding
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

// 4. STRICT RATE LIMITING — tighter limit for sensitive routes
//    Allows only 10 requests per IP per 15 minutes on login/OTP routes
//    Protects against: brute force password guessing and OTP guessing
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/users/login', strictLimiter);
app.use('/api/otp/', strictLimiter);
app.use('/api/admin/login', strictLimiter);

// ── STANDARD MIDDLEWARE ───────────────────────────────────────────────────
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 5. MONGO SANITIZE — strips $ and . from all request input
//    Protects against: MongoDB operator injection attacks like
//    { "username": { "$gt": "" } } which bypass password checks
//    Must come AFTER body-parser so req.body is already parsed
app.use(mongoSanitize());

// ─────────────────────────────────────────────────────────────────────────

// Import routes
const userRoutes = require('./routes/user');
const accountRoutes = require('./routes/account');
const transactionRoutes = require('./routes/transaction');
const lockerBookingRoutes = require('./routes/lockerBooking');
const internetBankingRoutes = require('./routes/internetBanking');
const serviceRequestRoutes = require('./routes/serviceRequest');
const logoutHistoryRoutes = require('./routes/logoutHistory');
const otpRoutes = require('./routes/otp');
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
