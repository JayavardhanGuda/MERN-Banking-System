const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

/**
 * Create a service request
 * POST /api/service-requests
 */
exports.createServiceRequest = async (req, res) => {
  try {
    // Expected payload from frontend:
    // { accountNumber, category, oldValues, newValues, userRemarks, supportingDocument }
    const { accountNumber, category, oldValues, newValues, userRemarks, supportingDocument } = req.body;

    if (!accountNumber || !category || !newValues) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Determine a requestType for admin UI (optional)
    let requestType = 'General Request';
    if (category === 'personal') requestType = 'Personal Information Update';
    if (category === 'address') requestType = 'Address Update';
    if (category === 'account') requestType = 'Account Settings Update';
    if (category === 'statements') requestType = 'Statement Preferences Update';

    const serviceRequest = new ServiceRequest({
      accountNumber,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      category,
      requestType,
      oldValues: oldValues || {},
      newValues: newValues || {},
      userRemarks: userRemarks || '',
      supportingDocument: supportingDocument || undefined,
      status: 'Pending'
    });

    await serviceRequest.save();

    res.status(201).json({ success: true, message: 'Service request submitted successfully. It will be reviewed by admin.', data: serviceRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get service requests by account
 * GET /api/service-requests/account/:accountNumber
 */
exports.getServiceRequestsByAccount = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ 
      accountNumber: req.params.accountNumber 
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all service requests (admin)
 * GET /api/service-requests
 */
exports.getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get pending service requests (admin)
 * GET /api/service-requests/pending
 */
exports.getPendingServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Approve service request (admin)
 * PUT /api/service-requests/:requestId/approve
 */
exports.approveServiceRequest = async (req, res) => {
  try {
    const { adminRemarks } = req.body;

    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    const changeFields = [];
    const updates = {};
    const oldValues = request.oldValues || {};
    const newValues = request.newValues || {};

    Object.keys(newValues).forEach(field => {
      const oldValue = oldValues[field];
      const newValue = newValues[field];
      if (newValue !== oldValue) {
        changeFields.push({
          field,
          oldValue: oldValue === undefined || oldValue === null ? '' : oldValue,
          newValue: newValue === undefined || newValue === null ? '' : newValue
        });
        updates[field] = newValue;
      }
    });

    if (Object.keys(updates).length > 0) {
      await User.findOneAndUpdate(
        { accountNumber: request.accountNumber },
        updates,
        { new: true }
      );
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: 'Approved',
        adminRemarks,
        approvedAt: new Date(),
        reviewedAt: new Date(),
        changesApplied: changeFields
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: 'Service request approved', 
      data: updatedRequest 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Reject service request (admin)
 * PUT /api/service-requests/:requestId/reject
 */
exports.rejectServiceRequest = async (req, res) => {
  try {
    const { rejectionReason, adminRemarks } = req.body;

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: 'Rejected',
        rejectionReason,
        adminRemarks,
        rejectedAt: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Service request rejected', 
      data: request 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Cancel service request (user)
 * PUT /api/service-requests/:requestId/cancel
 */
exports.cancelServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: 'Cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Service request cancelled', 
      data: request 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
