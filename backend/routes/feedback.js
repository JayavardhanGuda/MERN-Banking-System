const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Submit feedback
router.post('/', feedbackController.submitFeedback);

// Get all feedback
router.get('/', feedbackController.getAllFeedback);

// Get feedback by account number
router.get('/account/:accountNumber', feedbackController.getFeedbackByAccount);

// Update feedback status
router.put('/:id', feedbackController.updateFeedbackStatus);

module.exports = router;
