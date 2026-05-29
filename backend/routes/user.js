const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendRegistrationEmail } = require('../utils/emailService');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'vjn_banking_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Helper: Generate account number
function generateAccountNumber() {
  return `SB${Math.floor(100000000 + Math.random() * 900000000)}`;
}

// User registration (creates user + account)
router.post('/register', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender,
      accountType, initialDeposit, currency, address, city, state, pincode, country,
      username, password, securityQuestion, securityAnswer,
      kyc, agreeToTerms, agreeToPrivacy, agreeToMarketing
    } = req.body;

    // Check for duplicate username or email
    const duplicate = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Username or email already registered.' });
    }

    // Calculate age
    const calculateAge = (dob) => {
      if (!dob) return 0;
      const today = new Date();
      const birth = new Date(dob);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    };

    const accountNumber = generateAccountNumber();

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      accountNumber,
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      dateOfBirth,
      age: calculateAge(dateOfBirth),
      gender,
      accountType,
      initialDeposit: parseFloat(initialDeposit),
      balance: parseFloat(initialDeposit),
      currency,
      address: address?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      pincode: pincode?.trim(),
      country,
      username: username?.trim(),
      password: hashedPassword,
      securityQuestion,
      securityAnswer: securityAnswer?.trim(),
      kyc,
      kycStatus: 'Pending Verification',
      status: 'Pending',
      agreeToTerms,
      agreeToPrivacy,
      agreeToMarketing
    });

    await newUser.save();

    // Send registration confirmation email
    sendRegistrationEmail(
      newUser.email,
      newUser.firstName,
      newUser.lastName,
      newUser.accountNumber
    ).catch(err => console.error('Failed to send registration email:', err));

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
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// User login with JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${username}$`, 'i') } },
        { accountNumber: username }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    }

    // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    let isPasswordValid = false;

    if (isHashed) {
      // Verify password using bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy: plain text password comparison
      isPasswordValid = (user.password === password);
      
      // If valid, upgrade to hashed password
      if (isPasswordValid) {
        user.password = await bcrypt.hash(password, 12);
        await user.save();
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    }

    // Check if account is approved
    if (user.status !== 'Approved') {
      return res.status(403).json({ 
        success: false, 
        message: user.status === 'Pending' 
          ? 'Your account is pending approval. Please wait for admin verification.' 
          : 'Your account has been rejected. Please contact support.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        accountNumber: user.accountNumber,
        email: user.email,
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        accountNumber: user.accountNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        status: user.status,
        accountType: user.accountType
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Verify token endpoint
router.get('/verify-token', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user profile by account number (protected)
router.get('/:accountNumber', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountNumber: req.params.accountNumber }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile (protected)
router.put('/:accountNumber', verifyToken, async (req, res) => {
  try {
    // Prevent password update through this route
    const updateData = { ...req.body };
    delete updateData.password;
    updateData.updatedAt = new Date();

    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user (protected)
router.delete('/:accountNumber', verifyToken, async (req, res) => {
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

// Get all accounts (for admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
