const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const InternetBanking = require('../models/InternetBanking');

// Generate unique transaction reference number
function generateReferenceNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}

// Create transaction (fund transfer)
router.post('/', async (req, res) => {
  try {
    const {
      senderAccount, recipientAccount, amount, description, transactionPassword
    } = req.body;

    console.log('Transfer request received:', { senderAccount, recipientAccount, amount, description });

    // Validation
    if (!senderAccount || !recipientAccount || !amount || !transactionPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: senderAccount, recipientAccount, amount, transactionPassword' 
      });
    }

    // Cannot transfer to self
    if (senderAccount === recipientAccount) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to your own account' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
    }

    if (transferAmount > 1000000) {
      return res.status(400).json({ success: false, message: 'Transfer amount exceeds maximum limit of ₹10,00,000' });
    }

    // Find sender account
    const sender = await User.findOne({ accountNumber: senderAccount });
    if (!sender) {
      console.log('Sender not found:', senderAccount);
      return res.status(404).json({ success: false, message: 'Sender account not found' });
    }

    console.log('Sender found:', sender.firstName, sender.lastName, 'Status:', sender.status);

    if (sender.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Your account is not active. Please contact support.' });
    }

    // Find recipient account
    const recipient = await User.findOne({ accountNumber: recipientAccount });
    if (!recipient) {
      console.log('Recipient not found:', recipientAccount);
      return res.status(404).json({ success: false, message: 'Recipient account not found in the system' });
    }

    console.log('Recipient found:', recipient.firstName, recipient.lastName, 'Status:', recipient.status);

    if (recipient.status !== 'Approved') {
      return res.status(400).json({ success: false, message: `Recipient account (${recipient.firstName} ${recipient.lastName}) is not active. Status: ${recipient.status}. Only approved accounts can receive funds.` });
    }

    // Check internet banking registration
    const internetBanking = await InternetBanking.findOne({ accountNumber: senderAccount });
    if (!internetBanking) {
      console.log('Internet banking not found for:', senderAccount);
      return res.status(403).json({ success: false, message: 'Internet banking not registered. Please register first.' });
    }

    console.log('Internet banking found, enabled:', internetBanking.isInternetBankingEnabled);

    if (!internetBanking.isInternetBankingEnabled) {
      return res.status(403).json({ success: false, message: 'Internet banking is disabled for your account' });
    }

    // Verify transaction password (supports both hashed and plain text)
    let isPasswordValid = false;
    const storedPassword = internetBanking.transactionPassword;
    
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      // Password is hashed
      isPasswordValid = await bcrypt.compare(transactionPassword, storedPassword);
    } else {
      // Password is plain text
      isPasswordValid = (storedPassword === transactionPassword);
    }

    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid transaction password' });
    }

    // Calculate sender balance - handle both balance and initialDeposit
    let senderBalance = 0;
    if (sender.balance !== undefined && sender.balance !== null && !isNaN(parseFloat(sender.balance))) {
      senderBalance = parseFloat(sender.balance);
    } else if (sender.initialDeposit !== undefined && sender.initialDeposit !== null) {
      senderBalance = parseFloat(sender.initialDeposit);
    }

    console.log('Sender balance:', senderBalance, 'Transfer amount:', transferAmount);

    // Check sufficient balance
    if (senderBalance < transferAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Available: ₹${senderBalance.toFixed(2)}, Required: ₹${transferAmount.toFixed(2)}` 
      });
    }

    // Calculate recipient balance
    let recipientBalance = 0;
    if (recipient.balance !== undefined && recipient.balance !== null && !isNaN(parseFloat(recipient.balance))) {
      recipientBalance = parseFloat(recipient.balance);
    } else if (recipient.initialDeposit !== undefined && recipient.initialDeposit !== null) {
      recipientBalance = parseFloat(recipient.initialDeposit);
    }

    // Calculate new balances
    const newSenderBalance = parseFloat((senderBalance - transferAmount).toFixed(2));
    const newRecipientBalance = parseFloat((recipientBalance + transferAmount).toFixed(2));

    console.log('New sender balance:', newSenderBalance, 'New recipient balance:', newRecipientBalance);

    // Update sender balance
    const senderUpdate = await User.findOneAndUpdate(
      { accountNumber: senderAccount },
      { $set: { balance: newSenderBalance } },
      { new: true }
    );
    console.log('Sender updated, new balance:', senderUpdate.balance);

    // Update recipient balance
    const recipientUpdate = await User.findOneAndUpdate(
      { accountNumber: recipientAccount },
      { $set: { balance: newRecipientBalance } },
      { new: true }
    );
    console.log('Recipient updated, new balance:', recipientUpdate.balance);

    // Create transaction record
    const referenceNumber = generateReferenceNumber();
    const now = new Date();
    
    const transaction = new Transaction({
      referenceNumber,
      senderAccount,
      senderName: `${sender.firstName} ${sender.lastName}`,
      recipientAccount,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      amount: transferAmount,
      description: description || 'Fund Transfer',
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN'),
      status: 'completed',
      type: 'transfer',
      senderBalanceAfter: newSenderBalance,
      recipientBalanceAfter: newRecipientBalance
    });

    await transaction.save();
    console.log('Transaction saved with reference:', referenceNumber);

    // Update internet banking stats
    await InternetBanking.findOneAndUpdate(
      { accountNumber: senderAccount },
      { 
        $set: { lastTransactionAt: now },
        $inc: { transactionCount: 1 }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      transaction: {
        referenceNumber: transaction.referenceNumber,
        senderAccount: transaction.senderAccount,
        senderName: transaction.senderName,
        recipientAccount: transaction.recipientAccount,
        recipientName: transaction.recipientName,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        time: transaction.time,
        status: transaction.status,
        senderBalanceAfter: transaction.senderBalanceAfter,
        recipientBalanceAfter: transaction.recipientBalanceAfter
      }
    });

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during transfer. Please try again.' 
    });
  }
});

// Get all transactions (for admin)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get transactions by account number
router.get('/account/:accountNumber', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { senderAccount: req.params.accountNumber },
        { recipientAccount: req.params.accountNumber }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get transaction by reference number
router.get('/ref/:referenceNumber', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ referenceNumber: req.params.referenceNumber });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recent transactions for an account (limit 10)
router.get('/recent/:accountNumber', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { senderAccount: req.params.accountNumber },
        { recipientAccount: req.params.accountNumber }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get account statement with filters (date range, type)
router.get('/statement/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { startDate, endDate, type, limit = 50 } = req.query;

    // Build query
    const query = {
      $or: [
        { senderAccount: accountNumber },
        { recipientAccount: accountNumber }
      ]
    };

    // Add date filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the end date fully
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lte = end;
      }
    }

    // Add type filter if provided
    if (type && type !== 'all') {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get account details for balance
    const User = require('../models/User');
    const account = await User.findOne({ accountNumber });

    // Calculate totals
    let totalCredit = 0;
    let totalDebit = 0;

    const formattedTransactions = transactions.map(txn => {
      const isCredit = txn.recipientAccount === accountNumber;
      const amount = parseFloat(txn.amount);
      
      if (isCredit) {
        totalCredit += amount;
      } else {
        totalDebit += amount;
      }

      return {
        referenceNumber: txn.referenceNumber,
        date: txn.date,
        time: txn.time,
        description: txn.description,
        type: isCredit ? 'credit' : 'debit',
        transactionType: txn.type,
        amount: amount,
        balanceAfter: isCredit ? txn.recipientBalanceAfter : txn.senderBalanceAfter,
        counterparty: isCredit 
          ? { account: txn.senderAccount, name: txn.senderName }
          : { account: txn.recipientAccount, name: txn.recipientName },
        status: txn.status,
        createdAt: txn.createdAt
      };
    });

    // Calculate current balance
    let currentBalance = 0;
    if (account) {
      currentBalance = account.balance !== undefined && account.balance !== null 
        ? parseFloat(account.balance) 
        : parseFloat(account.initialDeposit) || 0;
    }

    res.json({
      success: true,
      statement: {
        accountNumber,
        accountHolder: account ? `${account.firstName} ${account.lastName}` : 'Unknown',
        currentBalance,
        totalCredit,
        totalDebit,
        netChange: totalCredit - totalDebit,
        transactionCount: formattedTransactions.length,
        transactions: formattedTransactions,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Statement error:', error);
    res.status(500).json({ success: false, message: 'Error generating statement' });
  }
});

module.exports = router;
