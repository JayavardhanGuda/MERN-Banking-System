const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const { accountNumber, userName, email, message } = req.body;

    const feedbackRecord = new Feedback({
      accountNumber,
      userName,
      email,
      message,
      submittedAt: new Date().toISOString(),
      status: 'New'
    });

    await feedbackRecord.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedbackRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, data: feedbackList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get feedback by account number
router.get('/account/:accountNumber', async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ accountNumber: req.params.accountNumber }).sort({ createdAt: -1 });
    res.json({ success: true, data: feedbackList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update feedback status
router.put('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, message: 'Feedback updated', data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
