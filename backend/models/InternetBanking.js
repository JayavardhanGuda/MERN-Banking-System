const mongoose = require('mongoose');

const internetBankingSchema = new mongoose.Schema({
  accountNumber: { type: String, unique: true, required: true },
  userName: String,
  email: String,
  transactionPassword: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
  isInternetBankingEnabled: { type: Boolean, default: true },
  lastTransactionAt: Date,
  transactionCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('InternetBanking', internetBankingSchema);
