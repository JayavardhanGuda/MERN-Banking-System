const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ── Public route (no token needed) ──────────────────────────────────────────
// Admin login — returns a JWT on success
router.post('/login', adminController.adminLogin);

// ── All routes below require a valid admin JWT ───────────────────────────────
router.use(adminController.verifyAdminToken);

// Get pending accounts
router.get('/accounts/pending', adminController.getPendingAccounts);

// Get approved accounts
router.get('/accounts/approved', adminController.getApprovedAccounts);

// Get rejected accounts
router.get('/accounts/rejected', adminController.getRejectedAccounts);

// Get all accounts (with optional ?status= filter)
router.get('/accounts', adminController.getAllAccounts);

// Approve account
router.put('/accounts/:accountNumber/approve', adminController.approveAccount);

// Reject account
router.put('/accounts/:accountNumber/reject', adminController.rejectAccount);

module.exports = router;
