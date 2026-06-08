const express = require('express');
const router = express.Router();
const internetBankingController = require('../controllers/internetBankingController');

// Register for internet banking
router.post('/register', internetBankingController.registerInternetBanking);

// Check if internet banking is registered
router.get('/check/:accountNumber', internetBankingController.checkInternetBankingStatus);

// Get internet banking details
router.get('/:accountNumber', internetBankingController.getInternetBankingStatus);

// Update internet banking credentials
router.put('/:accountNumber', internetBankingController.updateInternetBankingStatus);

module.exports = router;
