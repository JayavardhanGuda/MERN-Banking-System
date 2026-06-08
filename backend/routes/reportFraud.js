const express = require('express');
const router = express.Router();
const reportFraudController = require('../controllers/reportFraudController');

// Report fraud
router.post('/', reportFraudController.reportFraud);

// Get all fraud reports
router.get('/', reportFraudController.getAllFraudReports);

// Get fraud reports by account number
router.get('/account/:accountNumber', reportFraudController.getFraudReportsByAccount);

// Update fraud report status
router.put('/:id', reportFraudController.updateFraudReportStatus);

module.exports = router;
