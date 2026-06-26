const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'vjn_banking_super_secret_key_2024_secure';
const ADMIN_JWT_EXPIRES_IN = '7d'; // Admin sessions expire in 7 days

/**
 * Admin login — credentials come from .env, never hardcoded in source.
 * Issues a short-lived JWT with role:'admin' on success.
 * POST /api/admin/login
 */
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Safety check — if env vars aren't loaded, fail with a clear message
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.error('[ADMIN] ADMIN_USERNAME or ADMIN_PASSWORD not set in .env');
      return res.status(500).json({
        success: false,
        message: 'Admin credentials not configured on server. Check .env file.'
      });
    }

    console.log(`[ADMIN] Login attempt for username: "${username}"`);

    // Credentials live in .env — never in source code
    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      console.log(`[ADMIN] Login failed — expected username: "${process.env.ADMIN_USERNAME}"`);
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Sign a JWT so the frontend can authenticate future admin requests
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      data: { username, role: 'admin' },
      token
    });
  } catch (error) {
    console.error('[ADMIN] Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Middleware — verifies the admin JWT on every protected admin route.
 * The frontend must send: Authorization: Bearer <adminToken>
 */
exports.verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No admin token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: not an admin' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

/**
 * Get pending accounts (status = Pending)
 * GET /api/admin/accounts/pending
 */
exports.getPendingAccounts = async (req, res) => {
  try {
    const accounts = await User.find({ status: 'Pending' }).select('-password');
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get approved accounts (status = Approved)
 * GET /api/admin/accounts/approved
 */
exports.getApprovedAccounts = async (req, res) => {
  try {
    const accounts = await User.find({ status: 'Approved' }).select('-password');
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get rejected accounts (status = Rejected)
 * GET /api/admin/accounts/rejected
 */
exports.getRejectedAccounts = async (req, res) => {
  try {
    const accounts = await User.find({ status: 'Rejected' }).select('-password');
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all accounts with optional status filter
 * GET /api/admin/accounts?status=Pending
 */
exports.getAllAccounts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const users = await User.find(filter).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Approve an account
 * PUT /api/admin/accounts/:accountNumber/approve
 */
exports.approveAccount = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      { status: 'Approved', approvedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Send approval email asynchronously (non-blocking)
    sendApprovalEmail(
      user.email,
      user.firstName,
      user.lastName,
      user.accountNumber,
      user.username
    ).catch(err => console.error('Failed to send approval email:', err));

    res.json({ success: true, message: 'Account approved successfully', data: user });
  } catch (error) {
    console.error('[ADMIN] Approve error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Reject an account
 * PUT /api/admin/accounts/:accountNumber/reject
 */
exports.rejectAccount = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findOneAndUpdate(
      { accountNumber: req.params.accountNumber },
      { status: 'Rejected', rejectedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Send rejection email asynchronously (non-blocking)
    sendRejectionEmail(
      user.email,
      user.firstName,
      user.lastName,
      user.accountNumber,
      reason || 'Documents do not meet our requirements'
    ).catch(err => console.error('Failed to send rejection email:', err));

    res.json({ success: true, message: 'Account rejected successfully', data: user });
  } catch (error) {
    console.error('[ADMIN] Reject error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
