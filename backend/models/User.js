const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  accountNumber: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  age: Number,
  gender: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: String,
  nomineeName: String,
  nomineeRelation: String,
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  password: String,
  accountType: String,
  initialDeposit: Number,
  balance: Number,
  currency: String,
  securityQuestion: String,
  securityAnswer: String,
  lockerNumber: String,
  lockerType: String,
  lockerBooking: Object,
  emailStatement: Boolean,
  physicalStatement: Boolean,
  kyc: {
    panCard: {
      fileName: String,
      fileSize: Number,
      fileType: String,
      fileData: String,
      uploadedAt: Date,
      verified: Boolean
    },
    aadhaarCard: {
      fileName: String,
      fileSize: Number,
      fileType: String,
      fileData: String,
      uploadedAt: Date,
      verified: Boolean
    }
  },
  kycStatus: String,
  agreeToTerms: Boolean,
  agreeToPrivacy: Boolean,
  agreeToMarketing: Boolean,
  approvedAt: Date,
  rejectedAt: Date,
  // Password reset fields
  resetToken: String,
  resetTokenExpiry: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
