const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');

/**
 * Admin login (you'll need to add admin route to handle this)
 * POST /api/admin/login
 */
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check against hardcoded admin or db admin collection
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      res.json({
        success: true,
        message: 'Admin login successful',
        data: { username, role: 'admin' }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid admin credentials' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get pending accounts (status = Pending)
 * GET /api/admin/accounts/pending
 */
exports.getPendingAccounts = async (req, res) => {
  try {
    const accounts = await User.find({ status: 'Pending' }).select('-password');
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get approved accounts (status = Approved)
 * GET /api/admin/accounts/approved
 */
exports.getApprovedAccounts = async (req, res) => {
  try {
    const accounts = await User.find({ status: 'Approved' }).select('-password');
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get rejected accounts (status = Rejected)
 * GET /api/admin/accounts/rejected
 */
exports.getRejectedAccounts = async (req, res) => {
  try {
    const accounts = await User.find({ status: 'Rejected' }).select('-password');
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Approve an account
 * PUT /api/admin/accounts/:accountNumber/approve
 */
exports.approveAccount = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      { 
        status: 'Approved',
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    // Send approval email asynchronously
    sendApprovalEmail(
      user.email,
      user.firstName,
      user.lastName,
      user.accountNumber,
      user.username
    ).catch(err => console.error('Failed to send approval email:', err));

    res.json({ 
      success: true, 
      message: 'Account approved successfully', 
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Reject an account
 * PUT /api/admin/accounts/:accountNumber/reject
 */
exports.rejectAccount = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      { 
        status: 'Rejected',
        rejectedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    // Send rejection email asynchronously
    sendRejectionEmail(
      user.email,
      user.firstName,
      user.lastName,
      user.accountNumber,
      reason || 'Documents do not meet our requirements'
    ).catch(err => console.error('Failed to send rejection email:', err));

    res.json({ 
      success: true, 
      message: 'Account rejected successfully', 
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
