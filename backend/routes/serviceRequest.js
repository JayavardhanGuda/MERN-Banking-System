const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceRequestController');

// Create service request
router.post('/', serviceController.createServiceRequest);

// Get service requests by account
router.get('/account/:accountNumber', serviceController.getServiceRequestsByAccount);

// Get all service requests (admin)
router.get('/', serviceController.getAllServiceRequests);

// Get pending service requests (admin)
router.get('/pending', serviceController.getPendingServiceRequests);

// Approve service request
router.put('/:requestId/approve', serviceController.approveServiceRequest);

// Reject service request
router.put('/:requestId/reject', serviceController.rejectServiceRequest);

// Cancel service request
router.put('/:requestId/cancel', serviceController.cancelServiceRequest);

module.exports = router;

