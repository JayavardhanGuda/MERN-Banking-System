const express = require('express');
const router = express.Router();
const LockerBooking = require('../models/LockerBooking');
const User = require('../models/User');

// ── Config ─────────────────────────────────────────────────────────────────

const LOCKER_CONFIG = {
  Small:  { size: '30×20×15 cm', rent: 500 },
  Medium: { size: '45×30×20 cm', rent: 900 },
  Large:  { size: '60×40×30 cm', rent: 1400 }
};

function generateLockerNumber(type, accountNumber) {
  const typeCode = type.charAt(0).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const accountSuffix = accountNumber.slice(-4);
  return `LOCK-${typeCode}-${accountSuffix}-${timestamp}`;
}

function generateAssignedLockerNumber(type) {
  const typeCode = type.charAt(0).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `VJN-${typeCode}${random}`;
}

// ── Routes ──────────────────────────────────────────────────────────────────

// POST / — Book locker (creates pending request)
router.post('/', async (req, res) => {
  try {
    const { accountNumber, userName, lockerType, itemDetails, approximateValue, purpose, duration } = req.body;

    if (!accountNumber || !lockerType) {
      return res.status(400).json({ success: false, message: 'Account number and locker type are required' });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Block duplicate pending requests
    const existingPending = await LockerBooking.findOne({ accountNumber, status: 'Pending' });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending locker request. Please wait for admin approval.'
      });
    }

    const config = LOCKER_CONFIG[lockerType] || LOCKER_CONFIG.Small;
    const lockerNumber = generateLockerNumber(lockerType, accountNumber);

    const booking = new LockerBooking({
      accountNumber,
      userName: userName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      lockerNumber,
      lockerType,
      lockerSize: config.size,
      annualRent: config.rent,
      itemDetails: itemDetails?.trim(),
      approximateValue: parseFloat(approximateValue) || 0,
      purpose: purpose?.trim(),
      duration: duration || '1 Year',
      bookedOn: new Date(),
      status: 'Pending'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Locker booking request submitted successfully. Awaiting admin approval.',
      data: booking
    });
  } catch (error) {
    console.error('Locker booking error:', error);
    res.status(500).json({ success: false, message: 'Server error during booking' });
  }
});

// GET / — Get all locker bookings (admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const bookings = await LockerBooking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /pending/count — Pending count for admin notifications
router.get('/pending/count', async (req, res) => {
  try {
    const count = await LockerBooking.countDocuments({ status: 'Pending' });
    res.json({ success: true, count, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /pending — All pending requests (admin)
router.get('/pending', async (req, res) => {
  try {
    const bookings = await LockerBooking.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /account/:accountNumber — Bookings by account
router.get('/account/:accountNumber', async (req, res) => {
  try {
    const bookings = await LockerBooking.find({ accountNumber: req.params.accountNumber }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /:id — Single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await LockerBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /:id/approve — Admin: approve locker request
router.put('/:id/approve', async (req, res) => {
  try {
    const { adminRemarks, assignedBranch } = req.body;

    const booking = await LockerBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot approve a ${booking.status.toLowerCase()} request` });
    }

    const assignedLockerNumber = generateAssignedLockerNumber(booking.lockerType);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const updatedBooking = await LockerBooking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        reviewedAt: new Date(),
        reviewedBy: 'Admin',
        adminRemarks: adminRemarks || 'Locker request approved',
        approvedAt: new Date(),
        assignedBranch: assignedBranch || 'Main Branch',
        assignedLockerNumber,
        keyIssuedAt: new Date(),
        expiresAt
      },
      { new: true }
    );

    // Reflect locker info on the user record
    await User.findOneAndUpdate(
      { accountNumber: booking.accountNumber },
      {
        lockerNumber: assignedLockerNumber,
        lockerType: booking.lockerType
      }
    );

    res.json({ success: true, message: 'Locker request approved successfully', data: updatedBooking });
  } catch (error) {
    console.error('Approve locker error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /:id/reject — Admin: reject locker request
router.put('/:id/reject', async (req, res) => {
  try {
    const { rejectionReason, adminRemarks } = req.body;

    const booking = await LockerBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot reject a ${booking.status.toLowerCase()} request` });
    }

    const updatedBooking = await LockerBooking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        reviewedAt: new Date(),
        reviewedBy: 'Admin',
        adminRemarks: adminRemarks || 'Locker request rejected',
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'Request does not meet criteria'
      },
      { new: true }
    );

    res.json({ success: true, message: 'Locker request rejected', data: updatedBooking });
  } catch (error) {
    console.error('Reject locker error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /:id — User: cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await LockerBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const updatedBooking = await LockerBooking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    res.json({ success: true, message: 'Booking cancelled', data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
