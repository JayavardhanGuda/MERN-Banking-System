const express = require('express');
const router = express.Router();
const logoutController = require('../controllers/logoutHistoryController');

// Log logout
router.post('/', logoutController.logLogout);

module.exports = router;

// Log a logout event
router.post('/', async (req, res) => {
  try {
    const { accountNumber, userName } = req.body;

    const logoutRecord = new LogoutHistory({
      accountNumber,
      userName,
      logoutTime: new Date().toLocaleTimeString(),
      logoutDate: new Date().toLocaleDateString(),
      timestamp: Date.now()
    });

    await logoutRecord.save();

    res.status(201).json({
      success: true,
      message: 'Logout recorded',
      data: logoutRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all logout history
router.get('/', async (req, res) => {
  try {
    const history = await LogoutHistory.find().sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get logout history by account number
router.get('/account/:accountNumber', async (req, res) => {
  try {
    const history = await LogoutHistory.find({ accountNumber: req.params.accountNumber }).sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
