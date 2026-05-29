const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');

// Admin credentials (in production, use environment variables)
const ADMIN_EMAIL = 'admin-vjn@gmail.com';
const ADMIN_PASSWORD = 'admin@123';

// Admin login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      res.json({
        success: true,
        message: 'Admin login successful',
        data: { role: 'admin', email: ADMIN_EMAIL }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all pending accounts
router.get('/accounts/pending', async (req, res) => {
  try {
    const pendingAccounts = await User.find({ status: 'Pending' }).select('-password');
    res.json({ success: true, data: pendingAccounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all approved accounts
router.get('/accounts/approved', async (req, res) => {
  try {
    const approvedAccounts = await User.find({ status: 'Approved' }).select('-password');
    res.json({ success: true, data: approvedAccounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all rejected accounts
router.get('/accounts/rejected', async (req, res) => {
  try {
    const rejectedAccounts = await User.find({ status: 'Rejected' }).select('-password');
    res.json({ success: true, data: rejectedAccounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve account
router.put('/accounts/:accountNumber/approve', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      { status: 'Approved', approvedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Send approval email to user
    sendApprovalEmail(
      user.email,
      user.firstName,
      user.lastName,
      user.accountNumber,
      user.username
    ).catch(err => console.error('Failed to send approval email:', err));

    res.json({ success: true, message: 'Account approved', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject account
router.put('/accounts/:accountNumber/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      { status: 'Rejected', rejectedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Send rejection email to user
    sendRejectionEmail(
      user.email,
      user.firstName,
      user.lastName,
      user.accountNumber,
      reason || ''
    ).catch(err => console.error('Failed to send rejection email:', err));

    res.json({ success: true, message: 'Account rejected', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all accounts (with optional status filter)
router.get('/accounts', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const users = await User.find(filter).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
