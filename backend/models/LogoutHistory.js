const mongoose = require('mongoose');

const logoutHistorySchema = new mongoose.Schema({
  accountNumber: String,
  userName: String,
  logoutTime: String,
  logoutDate: String,
  timestamp: Number
}, { timestamps: true });

module.exports = mongoose.model('LogoutHistory', logoutHistorySchema);
