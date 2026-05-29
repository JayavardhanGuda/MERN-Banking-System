const express = require('express');
const router = express.Router();
const ReportFraud = require('../models/ReportFraud');

// Report fraud
router.post('/', async (req, res) => {
  try {
    const { accountNumber, userName, reportType, description } = req.body;

    const fraudReport = new ReportFraud({
      accountNumber,
      userName,
      reportType,
      description,
      reportedAt: new Date().toISOString(),
      status: 'Pending'
    });

    await fraudReport.save();

    res.status(201).json({
      success: true,
      message: 'Fraud report submitted successfully',
      data: fraudReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all fraud reports
router.get('/', async (req, res) => {
  try {
    const reports = await ReportFraud.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get fraud reports by account number
router.get('/account/:accountNumber', async (req, res) => {
  try {
    const reports = await ReportFraud.find({ accountNumber: req.params.accountNumber }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update fraud report status
router.put('/:id', async (req, res) => {
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
});

module.exports = router;
