const User = require('../models/User');

/**
 * Check application status
 * GET /api/application-status/:accountNumber
 */
exports.checkApplicationStatus = async (req, res) => {
  try {
    const user = await User.findOne({ 
      accountNumber: req.params.accountNumber 
    }).select('accountNumber status kycStatus approvedAt rejectedAt firstName lastName email');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    res.json({ 
      success: true, 
      data: {
        accountNumber: user.accountNumber,
        status: user.status,
        kycStatus: user.kycStatus,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        approvedAt: user.approvedAt,
        rejectedAt: user.rejectedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
