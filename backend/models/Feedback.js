const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  accountNumber: String,
  userName: String,
  email: String,
  message: String,
  submittedAt: Date,
  status: { type: String, default: 'New' } // New, Reviewed, Archived
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
