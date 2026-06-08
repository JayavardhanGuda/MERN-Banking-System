const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/lockerBookingController');

// Book locker
router.post('/', lockerController.bookLocker);

// Get all locker bookings (admin)
router.get('/', lockerController.getAllLockerBookings);

// Get pending locker bookings (admin)
router.get('/pending', lockerController.getPendingLockerBookings);

// Get pending locker count
router.get('/pending/count', lockerController.getPendingLockerCount);

// Get locker bookings by account
router.get('/account/:accountNumber', lockerController.getLockerBookingsByAccount);

// Approve locker booking
router.put('/:bookingId/approve', lockerController.approveLockerBooking);

// Reject locker booking
router.put('/:bookingId/reject', lockerController.rejectLockerBooking);

// Cancel locker booking
router.delete('/:bookingId', lockerController.cancelLockerBooking);

module.exports = router;

// Locker type configurations
const LOCKER_CONFIG = {
  Small:  { size: '30×20×15 cm', rent: 500 },
  Medium: { size: '45×30×20 cm', rent: 900 },
  Large:  { size: '60×40×30 cm', rent: 1400 }
};

// Generate unique locker number
function generateLockerNumber(type, accountNumber) {
  const typeCode = type.charAt(0).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const accountSuffix = accountNumber.slice(-4);
  return `LOCK-${typeCode}-${accountSuffix}-${timestamp}`;
}

// Generate assigned locker number (after approval)
function generateAssignedLockerNumber(type) {
  const typeCode = type.charAt(0).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `VJN-${typeCode}${random}`;
}

// Book locker (creates pending request)
router.post('/', async (req, res) => {
  try {
    const { accountNumber, userName, lockerType, itemDetails, approximateValue, purpose, duration } = req.body;

    // Validate required fields
    if (!accountNumber || !lockerType) {
      return res.status(400).json({ success: false, message: 'Account number and locker type are required' });
    }

    // Check if user exists and is approved
    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check for existing pending request
    const existingPending = await LockerBooking.findOne({ 
      accountNumber, 
      status: 'Pending' 
    });
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

// Get all locker bookings (for admin)
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

// Get pending locker requests count (for admin notifications)
router.get('/pending/count', async (req, res) => {
  try {
    const count = await LockerBooking.countDocuments({ status: 'Pending' });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all pending locker requests (for admin)
router.get('/pending', async (req, res) => {
  try {
    const bookings = await LockerBooking.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get bookings by account number
router.get('/account/:accountNumber', async (req, res) => {
  try {
    const bookings = await LockerBooking.find({ accountNumber: req.params.accountNumber }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single booking by ID
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

// Admin: Approve locker request
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

    // Generate assigned locker number
    const assignedLockerNumber = generateAssignedLockerNumber(booking.lockerType);
    
    // Calculate expiry date (1 year from approval)
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

    // Update user record with locker info
    await User.findOneAndUpdate(
      { accountNumber: booking.accountNumber },
      {
        lockerNumber: assignedLockerNumber,
        lockerType: booking.lockerType,
        lockerBooking: updatedBooking
      }
    );

    res.json({
      success: true,
      message: 'Locker request approved successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Approve locker error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Reject locker request
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

    res.json({
      success: true,
      message: 'Locker request rejected',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Reject locker error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User: Cancel locker booking
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
