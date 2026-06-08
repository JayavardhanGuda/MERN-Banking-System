const InternetBanking = require('../models/InternetBanking');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Register for internet banking
 * POST /api/internet-banking/register
 */
exports.registerInternetBanking = async (req, res) => {
  try {
    const { accountNumber, password, transactionPassword } = req.body;

    if (!accountNumber || !password || !transactionPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (user.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Account is not approved yet' });
    }

    // Check if already registered
    const existing = await InternetBanking.findOne({ accountNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Internet banking already registered for this account' });
    }

    // Validate account login password (supports hashed and legacy plain)
    const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));
    let isPasswordValid = false;
    if (isHashed) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = (user.password === password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid account password' });
    }

    // Hash transaction password
    const hashedPassword = await bcrypt.hash(transactionPassword, 12);

    const internetBanking = new InternetBanking({ accountNumber, userId: user._id, transactionPassword: hashedPassword, isInternetBankingEnabled: true, registeredAt: new Date() });
    await internetBanking.save();

    res.status(201).json({ success: true, message: 'Internet banking registered successfully', data: { accountNumber: internetBanking.accountNumber, isInternetBankingEnabled: internetBanking.isInternetBankingEnabled } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Check internet banking status
 * GET /api/internet-banking/check/:accountNumber
 */
exports.checkInternetBankingStatus = async (req, res) => {
  try {
    const internetBanking = await InternetBanking.findOne({ 
      accountNumber: req.params.accountNumber 
    });

    if (!internetBanking) {
      return res.json({
        success: true,
        isRegistered: false,
        data: { isRegistered: false }
      });
    }

    res.json({ 
      success: true, 
      isRegistered: true,
      data: { 
        isRegistered: true,
        isEnabled: internetBanking.isInternetBankingEnabled
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get internet banking details
 * GET /api/internet-banking/:accountNumber
 */
exports.getInternetBankingStatus = async (req, res) => {
  try {
    const internetBanking = await InternetBanking.findOne({ 
      accountNumber: req.params.accountNumber 
    }).select('-transactionPassword');

    if (!internetBanking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Internet banking not registered' 
      });
    }

    res.json({ 
      success: true, 
      data: internetBanking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update internet banking status/credentials
 * PUT /api/internet-banking/:accountNumber
 */
exports.updateInternetBankingStatus = async (req, res) => {
  try {
    const { transactionPassword, isInternetBankingEnabled } = req.body;

    const updateData = {};
    if (transactionPassword) {
      updateData.transactionPassword = await bcrypt.hash(transactionPassword, 12);
    }
    if (typeof isInternetBankingEnabled === 'boolean') {
      updateData.isInternetBankingEnabled = isInternetBankingEnabled;
    }

    const registration = await InternetBanking.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      updateData,
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Internet banking not registered' });
    }

    res.json({ success: true, message: 'Internet banking credentials updated', data: { accountNumber: req.params.accountNumber, updatedAt: registration.updatedAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
