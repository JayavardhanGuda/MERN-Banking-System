const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

// Create service request
router.post('/', async (req, res) => {
  try {
    const { accountNumber, category, oldValues, newValues, userRemarks, supportingDocument } = req.body;

    // Get user details
    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Determine request type based on category
    let requestType = '';
    switch (category) {
      case 'personal':
        if (oldValues.firstName !== newValues.firstName || oldValues.lastName !== newValues.lastName) {
          requestType = 'Name Change';
        }
        if (oldValues.phone !== newValues.phone) {
          requestType = requestType ? `${requestType}, Phone Update` : 'Phone Update';
        }
        break;
      case 'address':
        requestType = 'Address Update';
        break;
      case 'account':
        requestType = 'Nominee Update';
        break;
      case 'statements':
        requestType = 'Statement Preferences';
        break;
      default:
        requestType = 'General Request';
    }

    const serviceRequest = new ServiceRequest({
      accountNumber,
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      category,
      requestType,
      oldValues,
      newValues,
      userRemarks,
      supportingDocument,
      status: 'Pending'
    });

    await serviceRequest.save();

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully. It will be reviewed by admin.',
      data: serviceRequest
    });
  } catch (error) {
    console.error('Service request error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Get all service requests (for admin)
router.get('/', async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all pending service requests (for admin)
router.get('/pending', async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get approved service requests (for admin)
router.get('/approved', async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ status: 'Approved' }).sort({ reviewedAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get rejected service requests (for admin)
router.get('/rejected', async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ status: 'Rejected' }).sort({ reviewedAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get requests by account number (for user)
router.get('/account/:accountNumber', async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ 
      accountNumber: req.params.accountNumber 
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve service request - UPDATES USER DATA IN MONGODB
router.put('/:id/approve', async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // Find the user and apply the changes
    const user = await User.findOne({ accountNumber: request.accountNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Track what changes are being applied
    const changesApplied = [];
    const newValues = request.newValues;
    const oldValues = request.oldValues;

    // Apply changes based on category
    if (request.category === 'personal') {
      if (newValues.firstName && newValues.firstName !== oldValues.firstName) {
        changesApplied.push({ field: 'firstName', oldValue: user.firstName, newValue: newValues.firstName });
        user.firstName = newValues.firstName;
      }
      if (newValues.lastName && newValues.lastName !== oldValues.lastName) {
        changesApplied.push({ field: 'lastName', oldValue: user.lastName, newValue: newValues.lastName });
        user.lastName = newValues.lastName;
      }
      if (newValues.phone && newValues.phone !== oldValues.phone) {
        changesApplied.push({ field: 'phone', oldValue: user.phone, newValue: newValues.phone });
        user.phone = newValues.phone;
      }
    }

    if (request.category === 'address') {
      if (newValues.address && newValues.address !== oldValues.address) {
        changesApplied.push({ field: 'address', oldValue: user.address, newValue: newValues.address });
        user.address = newValues.address;
      }
      if (newValues.city && newValues.city !== oldValues.city) {
        changesApplied.push({ field: 'city', oldValue: user.city, newValue: newValues.city });
        user.city = newValues.city;
      }
      if (newValues.state && newValues.state !== oldValues.state) {
        changesApplied.push({ field: 'state', oldValue: user.state, newValue: newValues.state });
        user.state = newValues.state;
      }
      if (newValues.pincode && newValues.pincode !== oldValues.pincode) {
        changesApplied.push({ field: 'pincode', oldValue: user.pincode, newValue: newValues.pincode });
        user.pincode = newValues.pincode;
      }
    }

    if (request.category === 'account') {
      if (newValues.nomineeName && newValues.nomineeName !== oldValues.nomineeName) {
        changesApplied.push({ field: 'nomineeName', oldValue: user.nomineeName, newValue: newValues.nomineeName });
        user.nomineeName = newValues.nomineeName;
      }
      if (newValues.nomineeRelation && newValues.nomineeRelation !== oldValues.nomineeRelation) {
        changesApplied.push({ field: 'nomineeRelation', oldValue: user.nomineeRelation, newValue: newValues.nomineeRelation });
        user.nomineeRelation = newValues.nomineeRelation;
      }
    }

    if (request.category === 'statements') {
      if (newValues.emailStatement !== oldValues.emailStatement) {
        changesApplied.push({ field: 'emailStatement', oldValue: String(user.emailStatement), newValue: String(newValues.emailStatement) });
        user.emailStatement = newValues.emailStatement;
      }
      if (newValues.physicalStatement !== oldValues.physicalStatement) {
        changesApplied.push({ field: 'physicalStatement', oldValue: String(user.physicalStatement), newValue: String(newValues.physicalStatement) });
        user.physicalStatement = newValues.physicalStatement;
      }
    }

    // Save user changes
    await user.save();

    // Update service request status
    request.status = 'Approved';
    request.reviewedBy = 'Admin';
    request.reviewedAt = new Date();
    request.adminRemarks = adminRemarks || 'Request approved and changes applied';
    request.changesApplied = changesApplied;
    await request.save();

    res.json({
      success: true,
      message: 'Service request approved and changes applied to user account',
      data: request,
      changesApplied
    });
  } catch (error) {
    console.error('Approve service request error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Reject service request
router.put('/:id/reject', async (req, res) => {
  try {
    const { rejectionReason, adminRemarks } = req.body;

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'Rejected';
    request.reviewedBy = 'Admin';
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason || 'Request rejected by admin';
    request.adminRemarks = adminRemarks;
    await request.save();

    res.json({
      success: true,
      message: 'Service request rejected',
      data: request
    });
  } catch (error) {
    console.error('Reject service request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel service request (by user)
router.put('/:id/cancel', async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
    }

    request.status = 'Cancelled';
    await request.save();

    res.json({
      success: true,
      message: 'Service request cancelled',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

