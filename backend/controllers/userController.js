const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const store = require('../data/store');
const { sendRegistrationEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'vjn_banking_super_secret_key_2024_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper: Generate account number
function generateAccountNumber() {
  return `SB${Math.floor(100000000 + Math.random() * 900000000)}`;
}

// Helper: Calculate age from date of birth
function calculateAge(dob) {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Register a new user account
 * POST /api/users/register
 */
exports.register = async (req, res) => {
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
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already registered.' 
      });
    }

    const accountNumber = generateAccountNumber();
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

    // Send registration confirmation email asynchronously
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
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

/**
 * User login with JWT token generation
 * POST /api/users/login
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Determine whether MongoDB is available; if not, fall back to in-memory store
    const dbAvailable = mongoose.connection && mongoose.connection.readyState === 1;

    // Find user by username, email, or account number
    let user = null;
    if (dbAvailable) {
      user = await User.findOne({
        $or: [
          { username: { $regex: new RegExp(`^${username}$`, 'i') } },
          { email: { $regex: new RegExp(`^${username}$`, 'i') } },
          { accountNumber: username }
        ]
      });
    } else {
      // Fallback: search in-memory store
      const key = String(username || '').toLowerCase();
      user = store.users.find(u => (
        (u.username && u.username.toLowerCase() === key) ||
        (u.email && u.email.toLowerCase() === key) ||
        (u.accountNumber === username)
      ));
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username/email or password' 
      });
    }

    // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
    const pwd = user.password || '';
    const isHashed = pwd.startsWith('$2a$') || pwd.startsWith('$2b$');
    let isPasswordValid = false;

    if (isHashed) {
      // Verify password using bcrypt
      isPasswordValid = await bcrypt.compare(password, pwd);
    }
    
    else {
      // Legacy: plain text password comparison
      isPasswordValid = (pwd === password);

      // If valid, upgrade to hashed password
      if (isPasswordValid) {
        const hashed = await bcrypt.hash(password, 12);
        if (dbAvailable) {
          user.password = hashed;
          await user.save();
        } else {
          // update in-memory store
          const idx = store.users.findIndex(u => u.accountNumber === user.accountNumber);
          if (idx >= 0) store.users[idx].password = hashed;
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username/email or password' 
      });
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
        id: user._id || user.id || user.accountNumber,
        accountNumber: user.accountNumber,
        email: user.email,
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login
    if (dbAvailable) {
      user.lastLogin = new Date();
      await user.save();
    } 

    else {
      const idx = store.users.findIndex(u => u.accountNumber === user.accountNumber);
      if (idx >= 0) store.users[idx].lastLogin = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id || user.id || user.accountNumber,
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
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

/**
 * Verify JWT token
 * GET /api/users/verify-token
 */
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

/**
 * Get user profile by account number
 * GET /api/users/:accountNumber
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ 
      accountNumber: req.params.accountNumber 
    }).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/:accountNumber
 */
exports.updateUserProfile = async (req, res) => {
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
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated', 
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

/**
 * Delete user account
 * DELETE /api/users/:accountNumber
 */
exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ 
      accountNumber: req.params.accountNumber 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

/**
 * Get all accounts (for admin)
 * GET /api/users
 */
exports.getAllAccounts = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
