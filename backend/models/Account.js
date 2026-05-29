const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountNumber: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accountType: String, // e.g., Savings, Current
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  balance: Number,
  initialDeposit: Number,
  currency: String,
  openedAt: Date,
  closedAt: Date,
  approvedAt: Date,
  rejectedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
