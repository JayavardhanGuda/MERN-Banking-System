const ReportFraud = require('../models/ReportFraud');
const User = require('../models/User');

/**
 * Report fraud
 * POST /api/report-fraud
 */
exports.reportFraud = async (req, res) => {
  try {
    const { accountNumber, fraudType, description, amount } = req.body;

    if (!accountNumber || !fraudType || !description) {
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

    const fraudReport = new ReportFraud({
      accountNumber,
      userId: user._id,
      fraudType,
      description,
      amount,
      status: 'Reported',
      reportedAt: new Date()
    });

    await fraudReport.save();

    res.status(201).json({
      success: true,
      message: 'Fraud reported successfully',
      data: fraudReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all fraud reports
 * GET /api/report-fraud
 */
exports.getAllFraudReports = async (req, res) => {
  try {
    const reports = await ReportFraud.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get fraud reports by account number
 * GET /api/report-fraud/account/:accountNumber
 */
exports.getFraudReportsByAccount = async (req, res) => {
  try {
    const reports = await ReportFraud.find({ accountNumber: req.params.accountNumber }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update fraud report status
 * PUT /api/report-fraud/:id
 */
exports.updateFraudReportStatus = async (req, res) => {
  try {
    const report = await ReportFraud.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report updated', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
