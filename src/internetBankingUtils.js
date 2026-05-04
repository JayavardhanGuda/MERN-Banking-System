/**
 * Internet Banking Utility Functions
 * Handles Internet Banking registration verification, transaction password validation,
 * and transfer-related operations
 */

/**
 * Check if Internet Banking is registered for a given account
 * @param {string} accountNumber - The account number to check
 * @returns {boolean} - True if registered, false otherwise
 */
export const isInternetBankingEnabled = (accountNumber) => {
  try {
    const bankingData = localStorage.getItem(`internetBanking_${accountNumber}`);
    return !!bankingData;
  } catch (error) {
    console.error('Error checking Internet Banking status:', error);
    return false;
  }
};

/**
 * Get Internet Banking details for an account
 * @param {string} accountNumber - The account number
 * @returns {Object|null} - Internet Banking details or null if not registered
 */
export const getInternetBankingDetails = (accountNumber) => {
  try {
    const bankingData = localStorage.getItem(`internetBanking_${accountNumber}`);
    if (bankingData) {
      return JSON.parse(bankingData);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving Internet Banking details:', error);
    return null;
  }
};

/**
 * Verify transaction password for an account
 * @param {string} accountNumber - The account number
 * @param {string} password - The transaction password to verify
 * @returns {boolean} - True if password is correct, false otherwise
 */
export const verifyTransactionPassword = (accountNumber, password) => {
  try {
    const bankingData = getInternetBankingDetails(accountNumber);
    if (!bankingData) {
      return false;
    }
    return bankingData.transactionPassword === password;
  } catch (error) {
    console.error('Error verifying transaction password:', error);
    return false;
  }
};

/**
 * Register Internet Banking for an account
 * @param {string} accountNumber - The account number
 * @param {string} password - The login password
 * @param {string} transactionPassword - The transaction password
 * @returns {Object} - Registration result with success status and message
 */
export const registerInternetBanking = (accountNumber, password, transactionPassword) => {
  try {
    // Check if already registered
    if (isInternetBankingEnabled(accountNumber)) {
      return {
        success: false,
        message: 'Internet Banking already registered for this account'
      };
    }

    const bankingData = {
      accountNumber,
      password,
      transactionPassword,
      registeredOn: new Date().toLocaleDateString(),
      lastLogin: null,
      transferCount: 0,
      totalTransferred: 0
    };

    localStorage.setItem(`internetBanking_${accountNumber}`, JSON.stringify(bankingData));

    return {
      success: true,
      message: 'Internet Banking registered successfully'
    };
  } catch (error) {
    console.error('Error registering Internet Banking:', error);
    return {
      success: false,
      message: 'Error registering Internet Banking: ' + error.message
    };
  }
};

/**
 * Update Internet Banking credentials
 * @param {string} accountNumber - The account number
 * @param {string} newPassword - The new login password
 * @param {string} newTransactionPassword - The new transaction password
 * @returns {Object} - Update result with success status and message
 */
export const updateInternetBankingCredentials = (accountNumber, newPassword, newTransactionPassword) => {
  try {
    const bankingData = getInternetBankingDetails(accountNumber);
    if (!bankingData) {
      return {
        success: false,
        message: 'Internet Banking not registered for this account'
      };
    }

    bankingData.password = newPassword;
    bankingData.transactionPassword = newTransactionPassword;

    localStorage.setItem(`internetBanking_${accountNumber}`, JSON.stringify(bankingData));

    return {
      success: true,
      message: 'Credentials updated successfully'
    };
  } catch (error) {
    console.error('Error updating credentials:', error);
    return {
      success: false,
      message: 'Error updating credentials: ' + error.message
    };
  }
};

/**
 * Get account details by account number
 * @param {string} accountNumber - The account number
 * @returns {Object|null} - Account details or null if not found
 */
export const getAccountDetails = (accountNumber) => {
  try {
    const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const account = bankAccounts.find(acc => acc.accountNumber === accountNumber);
    return account || null;
  } catch (error) {
    console.error('Error retrieving account details:', error);
    return null;
  }
};

/**
 * Validate account number format
 * @param {string} accountNumber - The account number to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const validateAccountNumber = (accountNumber) => {
  // Account number should be alphanumeric and 8-20 characters
  const accountRegex = /^[A-Z0-9]{8,20}$/;
  return accountRegex.test(accountNumber);
};

/**
 * Check if account exists in the system
 * @param {string} accountNumber - The account number to check
 * @returns {boolean} - True if account exists, false otherwise
 */
export const accountExists = (accountNumber) => {
  try {
    const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    return bankAccounts.some(acc => acc.accountNumber === accountNumber);
  } catch (error) {
    console.error('Error checking account existence:', error);
    return false;
  }
};

/**
 * Record a fund transfer transaction
 * @param {string} senderAccount - The sender's account number
 * @param {string} recipientAccount - The recipient's account number
 * @param {number} amount - The transfer amount
 * @param {string} description - Transfer description
 * @returns {Object} - Transfer result with success status and message
 */
export const recordFundTransfer = (senderAccount, recipientAccount, amount, description) => {
  try {
    const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const senderIndex = bankAccounts.findIndex(acc => acc.accountNumber === senderAccount);
    const recipientIndex = bankAccounts.findIndex(acc => acc.accountNumber === recipientAccount);

    if (senderIndex === -1 || recipientIndex === -1) {
      return {
        success: false,
        message: 'Invalid sender or recipient account'
      };
    }

    const transferAmount = parseFloat(amount);
    
    // Robust balance handling - use balance field, fallback to initialDeposit
    let senderBalance = bankAccounts[senderIndex].balance ? parseFloat(bankAccounts[senderIndex].balance) : parseFloat(bankAccounts[senderIndex].initialDeposit);
    if (isNaN(senderBalance)) {
      senderBalance = parseFloat(bankAccounts[senderIndex].initialDeposit);
    }
    
    let recipientBalance = bankAccounts[recipientIndex].balance ? parseFloat(bankAccounts[recipientIndex].balance) : parseFloat(bankAccounts[recipientIndex].initialDeposit);
    if (isNaN(recipientBalance)) {
      recipientBalance = parseFloat(bankAccounts[recipientIndex].initialDeposit);
    }

    // Check sufficient balance
    if (senderBalance < transferAmount) {
      return {
        success: false,
        message: `Insufficient balance for this transfer. Available: ₹${senderBalance.toFixed(2)}, Required: ₹${transferAmount.toFixed(2)}`
      };
    }

    // Update balances
    bankAccounts[senderIndex].balance = (senderBalance - transferAmount).toFixed(2);
    bankAccounts[recipientIndex].balance = (recipientBalance + transferAmount).toFixed(2);

    // Save updated accounts back to localStorage
    localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));

    // Record in transfer history
    const transferRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      type: 'transfer',
      senderAccount,
      recipientAccount,
      recipientName: `${bankAccounts[recipientIndex].firstName} ${bankAccounts[recipientIndex].lastName}`,
      amount: transferAmount.toFixed(2),
      description,
      status: 'completed',
      balanceAfter: bankAccounts[senderIndex].balance
    };

    const historyKey = `transferHistory_${senderAccount}`;
    const existingHistory = localStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.push(transferRecord);
    localStorage.setItem(historyKey, JSON.stringify(history));

    // Update transfer count and total in Internet Banking details
    const bankingData = getInternetBankingDetails(senderAccount);
    if (bankingData) {
      bankingData.transferCount = (bankingData.transferCount || 0) + 1;
      bankingData.totalTransferred = (parseFloat(bankingData.totalTransferred || 0) + transferAmount).toFixed(2);
      localStorage.setItem(`internetBanking_${senderAccount}`, JSON.stringify(bankingData));
    }

    return {
      success: true,
      message: 'Transfer completed successfully',
      transactionId: transferRecord.id
    };
  } catch (error) {
    console.error('Error recording fund transfer:', error);
    return {
      success: false,
      message: 'Error processing transfer: ' + error.message
    };
  }
};

/**
 * Get transfer history for an account
 * @param {string} accountNumber - The account number
 * @returns {Array} - Array of transfer records
 */
export const getTransferHistory = (accountNumber) => {
  try {
    const historyKey = `transferHistory_${accountNumber}`;
    const historyData = localStorage.getItem(historyKey);
    if (historyData) {
      return JSON.parse(historyData).sort((a, b) => b.id - a.id); // Sort by latest first
    }
    return [];
  } catch (error) {
    console.error('Error retrieving transfer history:', error);
    return [];
  }
};

/**
 * Get account balance
 * @param {string} accountNumber - The account number
 * @returns {number|null} - Account balance or null if account not found
 */
export const getAccountBalance = (accountNumber) => {
  try {
    const accountData = getAccountDetails(accountNumber);
    if (accountData) {
      return parseFloat(accountData.balance);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving account balance:', error);
    return null;
  }
};

/**
 * Get Internet Banking statistics for an account
 * @param {string} accountNumber - The account number
 * @returns {Object|null} - Internet Banking statistics or null
 */
export const getInternetBankingStats = (accountNumber) => {
  try {
    const bankingData = getInternetBankingDetails(accountNumber);
    if (!bankingData) {
      return null;
    }

    return {
      accountNumber: bankingData.accountNumber,
      registeredOn: bankingData.registeredOn,
      lastLogin: bankingData.lastLogin,
      transferCount: bankingData.transferCount || 0,
      totalTransferred: bankingData.totalTransferred || 0,
      lastTransferDate: getLastTransferDate(accountNumber)
    };
  } catch (error) {
    console.error('Error retrieving Internet Banking stats:', error);
    return null;
  }
};

/**
 * Get the date of the last transfer for an account
 * @param {string} accountNumber - The account number
 * @returns {string|null} - Last transfer date or null if no transfers
 */
export const getLastTransferDate = (accountNumber) => {
  try {
    const history = getTransferHistory(accountNumber);
    if (history.length > 0) {
      return history[0].date;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving last transfer date:', error);
    return null;
  }
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with isValid flag and message
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Validate transaction password format (6 digits)
 * @param {string} password - The transaction password to validate
 * @returns {Object} - Validation result with isValid flag and message
 */
export const validateTransactionPassword = (password) => {
  if (!/^\d{6}$/.test(password)) {
    return {
      isValid: false,
      message: 'Transaction password must be exactly 6 numeric digits'
    };
  }

  return {
    isValid: true,
    message: 'Valid transaction password'
  };
};

/**
 * Clear all Internet Banking and transfer data for testing purposes
 * CAUTION: This function deletes all Internet Banking registrations and transfer history
 * @returns {void}
 */
export const clearAllInternetBankingData = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('internetBanking_') || key.startsWith('transferHistory_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('All Internet Banking data cleared');
  } catch (error) {
    console.error('Error clearing Internet Banking data:', error);
  }
};
