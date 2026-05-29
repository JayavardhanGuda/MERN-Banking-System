const mongoose = require('mongoose');

const reportFraudSchema = new mongoose.Schema({
  accountNumber: String,
  userName: String,
  reportType: String, // e.g., 'Phishing', 'Unauthorized Transaction'
  description: String,
  reportedAt: Date,
  status: { type: String, default: 'Pending' } // Pending, Reviewed, Resolved
}, { timestamps: true });

module.exports = mongoose.model('ReportFraud', reportFraudSchema);
