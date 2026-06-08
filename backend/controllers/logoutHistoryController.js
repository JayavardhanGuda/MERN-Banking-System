const LogoutHistory = require('../models/LogoutHistory');

/**
 * Log user logout
 * POST /api/logout-history
 */
exports.logLogout = async (req, res) => {
  try {
    const { accountNumber, userId, ipAddress, userAgent } = req.body;

    const logoutRecord = new LogoutHistory({
      accountNumber,
      userId,
      ipAddress,
      userAgent,
      loggedOutAt: new Date()
    });

    await logoutRecord.save();

    res.status(201).json({
      success: true,
      message: 'Logout logged successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
