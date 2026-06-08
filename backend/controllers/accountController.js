const Account = require('../models/Account');
const User = require('../models/User');

/**
 * Get all accounts
 * GET /api/accounts
 */
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get account by account number
 * GET /api/accounts/:accountNumber
 */
exports.getAccountByNumber = async (req, res) => {
  try {
    // Try to find in Account collection first
    let account = await Account.findOne({ accountNumber: req.params.accountNumber }).populate('userId');

    if (account) {
      // Build a response shape compatible with frontend (includes `account` summary)
      const accountSummary = {
        accountNumber: account.accountNumber,
        accountHolder: account.userId ? `${account.userId.firstName || ''} ${account.userId.lastName || ''}`.trim() : undefined,
        accountType: account.accountType
      };

      return res.json({ success: true, data: account, account: accountSummary });
    }

    // Fallback: some data in this project is stored on the User model (legacy routes used User).
    const user = await User.findOne({ accountNumber: req.params.accountNumber }).select('-password');
    if (user) {
      const accountSummary = {
        accountNumber: user.accountNumber,
        accountHolder: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        accountType: user.accountType
      };

      return res.json({ success: true, data: user, account: accountSummary });
    }

    return res.status(404).json({ success: false, message: 'Account not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
