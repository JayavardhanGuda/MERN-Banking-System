const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true, required: true },
  senderAccount: String,
  recipientAccount: String,
  recipientName: String,
  senderName: String,
  amount: Number,
  description: String,
  date: String,
  time: String,
  status: { type: String, default: 'completed' }, // completed, pending, failed
  senderBalanceAfter: Number,
  recipientBalanceAfter: Number,
  type: { type: String, default: 'transfer' } // transfer, deposit, withdrawal
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
