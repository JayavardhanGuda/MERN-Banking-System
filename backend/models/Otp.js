const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accountNumber: String,
  email: String, // For registration email verification
  otp: String,
  type: String, // e.g., 'forgot-password', 'transaction', 'registration'
  expiresAt: Date,
  used: { type: Boolean, default: false },
  verifiedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
