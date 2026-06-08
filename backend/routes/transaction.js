const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Create transaction (fund transfer)
router.post('/', transactionController.createTransaction);

// Get all transactions (admin)
router.get('/', transactionController.getAllTransactions);

// Get transactions by account
router.get('/account/:accountNumber', transactionController.getTransactionsByAccount);

// Get transaction by reference number
router.get('/ref/:referenceNumber', transactionController.getTransactionByReference);

// Get recent transactions
router.get('/recent/:accountNumber', transactionController.getRecentTransactions);

// Get account statement with filters
router.get('/statement/:accountNumber', transactionController.getAccountStatement);

module.exports = router;
