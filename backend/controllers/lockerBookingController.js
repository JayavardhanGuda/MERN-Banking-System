const LockerBooking = require('../models/LockerBooking');
const User = require('../models/User');

/**
 * Book a locker
 * POST /api/locker-bookings
 */
exports.bookLocker = async (req, res) => {
  try {
    const { accountNumber, lockerType, lockerSize, duration } = req.body;

    if (!accountNumber || !lockerType || !duration) {
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

    const lockerBooking = new LockerBooking({
      accountNumber,
      userId: user._id,
      lockerType,
      lockerSize,
      duration,
      status: 'Pending',
      requestedAt: new Date()
    });

    await lockerBooking.save();

    res.status(201).json({
      success: true,
      message: 'Locker booking request submitted',
      data: lockerBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all locker bookings (admin)
 * GET /api/locker-bookings
 */
exports.getAllLockerBookings = async (req, res) => {
  try {
    const bookings = await LockerBooking.find().sort({ requestedAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get pending locker bookings (admin)
 * GET /api/locker-bookings/pending
 */
exports.getPendingLockerBookings = async (req, res) => {
  try {
    const bookings = await LockerBooking.find({ status: 'Pending' }).sort({ requestedAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get pending locker count (for notifications)
 * GET /api/locker-bookings/pending/count
 */
exports.getPendingLockerCount = async (req, res) => {
  try {
    const count = await LockerBooking.countDocuments({ status: 'Pending' });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get locker bookings by account
 * GET /api/locker-bookings/account/:accountNumber
 */
exports.getLockerBookingsByAccount = async (req, res) => {
  try {
    const bookings = await LockerBooking.find({ 
      accountNumber: req.params.accountNumber 
    }).sort({ requestedAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Approve locker booking (admin)
 * PUT /api/locker-bookings/:bookingId/approve
 */
exports.approveLockerBooking = async (req, res) => {
  try {
    const { lockerNumber } = req.body;

    const booking = await LockerBooking.findByIdAndUpdate(
      req.params.bookingId,
      {
        status: 'Approved',
        lockerNumber,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Locker booking approved', 
      data: booking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Reject locker booking (admin)
 * PUT /api/locker-bookings/:bookingId/reject
 */
exports.rejectLockerBooking = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const booking = await LockerBooking.findByIdAndUpdate(
      req.params.bookingId,
      {
        status: 'Rejected',
        rejectionReason,
        rejectedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Locker booking rejected', 
      data: booking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Cancel locker booking
 * DELETE /api/locker-bookings/:bookingId
 */
exports.cancelLockerBooking = async (req, res) => {
  try {
    const booking = await LockerBooking.findByIdAndDelete(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
