const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  // Request identification
  requestId: { type: String, unique: true },
  accountNumber: { type: String, required: true },
  userName: String,
  email: String,
  
  // Request type
  category: { 
    type: String, 
    enum: ['personal', 'address', 'account', 'statements'],
    required: true 
  },
  requestType: String, // e.g., "Name Change", "Address Update", "Nominee Update"
  
  // Old values (for comparison)
  oldValues: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    nomineeName: String,
    nomineeRelation: String,
    emailStatement: Boolean,
    physicalStatement: Boolean
  },
  
  // New requested values
  newValues: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    nomineeName: String,
    nomineeRelation: String,
    emailStatement: Boolean,
    physicalStatement: Boolean
  },
  
  // Supporting documents (if any)
  supportingDocument: {
    fileName: String,
    fileType: String,
    fileData: String,
    uploadedAt: Date
  },
  
  // Request reason/remarks from user
  userRemarks: String,
  
  // Status and admin actions
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending' 
  },
  reviewedBy: String,
  reviewedAt: Date,
  adminRemarks: String,
  rejectionReason: String,
  
  // Track what was actually changed
  changesApplied: [{
    field: String,
    oldValue: String,
    newValue: String
  }]
}, { timestamps: true });

// Pre-save hook to generate requestId
serviceRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.requestId = `SR${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
