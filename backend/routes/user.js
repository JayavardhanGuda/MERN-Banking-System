const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'vjn_banking_secret_key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) 
  {
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

// User registration
router.post('/register', userController.register);

// User login
router.post('/login', userController.login);

// Verify token
router.get('/verify-token', verifyToken, userController.verifyToken);

// Get all accounts (admin)
router.get('/', userController.getAllAccounts);

// Get user profile (protected)
router.get('/:accountNumber', verifyToken, userController.getUserProfile);

// Update user profile (protected)
router.put('/:accountNumber', verifyToken, userController.updateUserProfile);

// Delete user account (protected)
router.delete('/:accountNumber', verifyToken, userController.deleteUserAccount);

module.exports = router;
