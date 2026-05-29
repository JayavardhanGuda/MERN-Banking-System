const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const InternetBanking = require('../models/InternetBanking');
const User = require('../models/User');

// Register for internet banking
router.post('/register', async (req, res) => {
  try {
    const { accountNumber, password, transactionPassword } = req.body;

    // Check if account exists and is approved
    const account = await User.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Account is not approved yet' });
    }

    // Check if already registered
    const existing = await InternetBanking.findOne({ accountNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Internet banking already registered for this account' });
    }

    // Validate account password (check both hashed and plain text)
    const isHashed = account.password.startsWith('$2a$') || account.password.startsWith('$2b$');
    let isPasswordValid = false;

    if (isHashed) {
      isPasswordValid = await bcrypt.compare(password, account.password);
    } else {
      isPasswordValid = (account.password === password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid login password. Please use your account login password.' });
    }

    // Hash the transaction password before storing
    const hashedTransactionPassword = await bcrypt.hash(transactionPassword, 12);

    const registration = new InternetBanking({
      accountNumber,
      userName: `${account.firstName} ${account.lastName}`,
      email: account.email,
      transactionPassword: hashedTransactionPassword,
      isInternetBankingEnabled: true,
      registeredAt: new Date()
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Internet banking registered successfully',
      data: {
        accountNumber,
        userName: registration.userName,
        isInternetBankingEnabled: true,
        registeredAt: registration.registeredAt
      }
    });
  } catch (error) {
    console.error('Internet banking registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Check if internet banking is registered
router.get('/check/:accountNumber', async (req, res) => {
  try {
    const registration = await InternetBanking.findOne({ accountNumber: req.params.accountNumber });
    
    res.json({
      success: true,
      isRegistered: !!registration,
      data: registration ? {
        accountNumber: registration.accountNumber,
        userName: registration.userName,
        isInternetBankingEnabled: registration.isInternetBankingEnabled,
        registeredAt: registration.registeredAt
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update internet banking credentials
router.put('/:accountNumber', async (req, res) => {
  try {
    const { password, transactionPassword } = req.body;
    
    const updateData = {};
    if (password) updateData.password = password;
    if (transactionPassword) updateData.transactionPassword = transactionPassword;

    const registration = await InternetBanking.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      updateData,
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Internet banking not registered' });
    }

    res.json({
      success: true,
      message: 'Internet banking credentials updated',
      data: {
        accountNumber: req.params.accountNumber,
        updatedAt: registration.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
