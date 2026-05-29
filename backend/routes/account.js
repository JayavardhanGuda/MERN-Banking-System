const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create account (alternative endpoint)
router.post('/', async (req, res) => {
  try {
    const accountData = req.body;
    
    // Check for duplicate
    const duplicate = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${accountData.username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${accountData.email}$`, 'i') } }
      ]
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Username or email already registered.' });
    }

    const newUser = new User(accountData);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        accountNumber: newUser.accountNumber,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        status: newUser.status
      }
    });
  } catch (error) {
    console.error('Account creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get account by account number
router.get('/:accountNumber', async (req, res) => {
  try {
    const user = await User.findOne({ accountNumber: req.params.accountNumber }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    
    // Return both data (for general use) and account (for recipient verification)
    res.json({ 
      success: true, 
      data: user,
      account: {
        accountNumber: user.accountNumber,
        accountHolder: `${user.firstName} ${user.lastName}`,
        accountType: user.accountType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update account
router.put('/:accountNumber', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      req.body,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, message: 'Account updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete account
router.delete('/:accountNumber', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ accountNumber: req.params.accountNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
