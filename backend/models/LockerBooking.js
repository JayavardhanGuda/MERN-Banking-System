const mongoose = require('mongoose');

const lockerBookingSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true },
  userName: String,
  email: String,
  phone: String,
  lockerNumber: { type: String, unique: true },
  lockerType: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
  lockerSize: String,
  annualRent: Number,
  itemDetails: String,
  approximateValue: Number,
  purpose: String,
  duration: { type: String, default: '1 Year' },
  bookedOn: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], 
    default: 'Pending' 
  },
  // Admin action fields
  reviewedBy: String,
  reviewedAt: Date,
  adminRemarks: String,
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  // Locker assignment (after approval)
  assignedBranch: String,
  assignedLockerNumber: String,
  keyIssuedAt: Date,
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('LockerBooking', lockerBookingSchema);
