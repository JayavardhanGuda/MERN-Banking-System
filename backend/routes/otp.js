const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// Verify email exists
router.post('/verify-email', otpController.verifyEmail);

// Forgot password flow
router.post('/forgot-password/send', otpController.sendForgotPasswordOtp);
router.post('/forgot-password/verify', otpController.verifyForgotPasswordOtp);

// Reset password
router.post('/reset-password', otpController.resetPassword);

// Generic OTP operations
router.post('/generate', otpController.generateOtp);
router.post('/validate', otpController.validateOtp);

// Get OTPs by account (debug)
router.get('/account/:accountNumber', otpController.getOtpsByAccount);

// Registration email verification
router.post('/registration/send', otpController.sendRegistrationOtp);
router.post('/registration/verify', otpController.verifyRegistrationOtp);

module.exports = router;
