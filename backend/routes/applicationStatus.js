const express = require('express');
const router = express.Router();
const statusController = require('../controllers/applicationStatusController');

// Check application status
router.get('/:accountNumber', statusController.checkApplicationStatus);

module.exports = router;

// Check application/account status by account number
router.get('/:accountNumber', async (req, res) => {
  try {
    const user = await User.findOne({
      accountNumber: { $regex: new RegExp(`^${req.params.accountNumber}$`, 'i') }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No application found for this ID' 
      });
    }

    res.json({
      success: true,
      data: {
        accountNumber: user.accountNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        approvedAt: user.approvedAt,
        rejectedAt: user.rejectedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
