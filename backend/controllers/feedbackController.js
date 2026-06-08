const Feedback = require('../models/Feedback');
const User = require('../models/User');

/**
 * Submit feedback
 * POST /api/feedback
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { accountNumber, feedbackType, message, rating } = req.body;

    if (!accountNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    const feedback = new Feedback({
      accountNumber,
      userId: user._id,
      feedbackType,
      message,
      rating,
      submittedAt: new Date()
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all feedback
 * GET /api/feedback
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, data: feedbackList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get feedback by account number
 * GET /api/feedback/account/:accountNumber
 */
exports.getFeedbackByAccount = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ accountNumber: req.params.accountNumber }).sort({ createdAt: -1 });
    res.json({ success: true, data: feedbackList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update feedback status
 * PUT /api/feedback/:id
 */
exports.updateFeedbackStatus = async (req, res) => {
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
};
