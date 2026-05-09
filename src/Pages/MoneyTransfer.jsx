import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaUser, FaLock, FaCheck, FaExclamationCircle, FaDownload, FaHome } from 'react-icons/fa';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import '../styles/MoneyTransfer.css';

const MoneyTransfer = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);

  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Step 1: Recipient Details
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [recipientError, setRecipientError] = useState('');

  // Step 2: Transfer Details
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Step 3: Transaction Password
  const [transactionPassword, setTransactionPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Success/Error Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Recipient Details
  const [recipientDetails, setRecipientDetails] = useState(null);

  // Receipt
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUser(userData);

        // Check if Internet Banking is registered for this account
        const bankingData = localStorage.getItem(`internetBanking_${userData.accountNumber}`);
        setIsRegistered(!!bankingData);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Clear field errors when user starts typing
  const handleRecipientChange = (e) => {
    setRecipientAccountNumber(e.target.value);
    setRecipientError('');
    setRecipientDetails(null);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setAmountError('');
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setDescriptionError('');
  };

  const handlePasswordChange = (e) => {
    setTransactionPassword(e.target.value);
    setPasswordError('');
  };

  // Step 1: Validate and search recipient account
  const handleVerifyRecipient = () => {
    setRecipientError('');
    setErrorMessage('');

    // Validation
    if (!recipientAccountNumber.trim()) {
      setRecipientError('Please enter recipient account number');
      return;
    }

    if (recipientAccountNumber === currentUser.accountNumber) {
      setRecipientError('Cannot transfer to your own account');
      return;
    }

    // Check if recipient account exists in bankAccounts array
    try {
      const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
      const recipientAccount = bankAccounts.find(account => account.accountNumber === recipientAccountNumber);

      if (!recipientAccount) {
        setRecipientError('Recipient account number not found');
        return;
      }

      setRecipientDetails({
        accountNumber: recipientAccount.accountNumber,
        accountHolder: `${recipientAccount.firstName} ${recipientAccount.lastName}`,
        accountType: recipientAccount.accountType
      });

      setErrorMessage('');
      setSuccessMessage('Recipient account verified successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setRecipientError('Error verifying recipient account');
      console.error('Error:', error);
    }
  };

  // Move to Step 2
  const handleProceedToAmount = () => {
    if (recipientDetails) {
      setStep(2);
      setErrorMessage('');
      setSuccessMessage('');
    }
  };

  // Step 2: Validate transfer amount
  const handleProceedToPassword = () => {
    let isValid = true;
    setAmountError('');
    setDescriptionError('');
    setErrorMessage('');

    if (!amount.trim()) {
      setAmountError('Please enter transfer amount');
      isValid = false;
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      setAmountError('Please enter a valid amount greater than 0');
      isValid = false;
    } else if (parseFloat(amount) > 999999.99) {
      setAmountError('Amount exceeds maximum transfer limit');
      isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError('Please enter a description for the transfer');
      isValid = false;
    }

    if (isValid) {
      setStep(3);
      setSuccessMessage('');
    }
  };

  // Step 3: Verify transaction password and complete transfer
  const handleCompleteTransfer = () => {
    setPasswordError('');
    setErrorMessage('');
    setSuccessMessage('');

    if (!transactionPassword.trim()) {
      setPasswordError('Please enter your transaction password');
      return;
    }

    // Verify transaction password
    try {
      const bankingData = localStorage.getItem(`internetBanking_${currentUser.accountNumber}`);
      if (!bankingData) {
        setErrorMessage('Internet Banking registration not found');
        return;
      }

      const bankingDetails = JSON.parse(bankingData);

      if (bankingDetails.transactionPassword !== transactionPassword) {
        setPasswordError('Invalid transaction password');
        return;
      }

      // Process the transfer
      setIsProcessing(true);

      // Simulate processing delay
      setTimeout(() => {
        try {
          // Get all accounts from bankAccounts array
          const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
          const senderAccountIndex = bankAccounts.findIndex(acc => acc.accountNumber === currentUser.accountNumber);
          const recipientAccountIndex = bankAccounts.findIndex(acc => acc.accountNumber === recipientDetails.accountNumber);

          if (senderAccountIndex === -1 || recipientAccountIndex === -1) {
            setErrorMessage('Error processing transfer: Account not found');
            setIsProcessing(false);
            return;
          }

          const transferAmount = parseFloat(amount);
          
          // Ensure balance is properly set - use balance if available, otherwise use initialDeposit
          let senderBalance = bankAccounts[senderAccountIndex].balance ? parseFloat(bankAccounts[senderAccountIndex].balance) : parseFloat(bankAccounts[senderAccountIndex].initialDeposit);
          
          // Safety check: if balance is NaN, use initialDeposit
          if (isNaN(senderBalance)) {
            senderBalance = parseFloat(bankAccounts[senderAccountIndex].initialDeposit);
          }

          // Check sufficient balance
          if (senderBalance < transferAmount) {
            setErrorMessage(`Insufficient balance for this transfer. Available balance: ₹${senderBalance.toFixed(2)}, Transfer amount: ₹${transferAmount.toFixed(2)}`);
            setIsProcessing(false);
            return;
          }

          // Update sender's balance
          bankAccounts[senderAccountIndex].balance = (senderBalance - transferAmount).toFixed(2);

          // Update recipient's balance
          let recipientBalance = bankAccounts[recipientAccountIndex].balance ? parseFloat(bankAccounts[recipientAccountIndex].balance) : parseFloat(bankAccounts[recipientAccountIndex].initialDeposit);
          
          // Safety check: if balance is NaN, use initialDeposit
          if (isNaN(recipientBalance)) {
            recipientBalance = parseFloat(bankAccounts[recipientAccountIndex].initialDeposit);
          }
          
          bankAccounts[recipientAccountIndex].balance = (recipientBalance + transferAmount).toFixed(2);

          // Save updated accounts back to localStorage
          localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));

          // Record transaction in transfer history
          const transferRecord = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            type: 'transfer',
            senderAccount: currentUser.accountNumber,
            recipientAccount: recipientDetails.accountNumber,
            recipientName: recipientDetails.accountHolder,
            amount: transferAmount.toFixed(2),
            description: description,
            status: 'completed',
            balanceAfter: bankAccounts[senderAccountIndex].balance
          };

          // Save to transfer history
          const historyKey = `transferHistory_${currentUser.accountNumber}`;
          const existingHistory = localStorage.getItem(historyKey);
          const history = existingHistory ? JSON.parse(existingHistory) : [];
          history.push(transferRecord);
          localStorage.setItem(historyKey, JSON.stringify(history));

          // Save to recipient's transfer history as credit
          const recipientHistoryKey = `transferHistory_${recipientDetails.accountNumber}`;
          const recipientRecord = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            type: 'transfer',
            senderAccount: currentUser.accountNumber,
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            recipientAccount: recipientDetails.accountNumber,
            amount: transferAmount.toFixed(2),
            description: description,
            status: 'completed',
            balanceAfter: bankAccounts[recipientAccountIndex].balance
          };
          const recipientExistingHistory = localStorage.getItem(recipientHistoryKey);
          const recipientHistory = recipientExistingHistory ? JSON.parse(recipientExistingHistory) : [];
          recipientHistory.push(recipientRecord);
          localStorage.setItem(recipientHistoryKey, JSON.stringify(recipientHistory));

          // Dispatch event to update dashboard
          window.dispatchEvent(new Event('transferCompleted'));

          // Update currentUser with new balance
          const updatedUser = { ...currentUser, balance: bankAccounts[senderAccountIndex].balance };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          // Create receipt data
          const receipt = {
            referenceNumber: 'TXN' + Date.now(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            status: 'Success',
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            senderAccount: currentUser.accountNumber,
            recipientName: recipientDetails.accountHolder,
            recipientAccount: recipientDetails.accountNumber,
            amount: transferAmount.toFixed(2),
            description: description,
            senderBalanceBefore: (senderBalance).toFixed(2),
            senderBalanceAfter: bankAccounts[senderAccountIndex].balance
          };

          setReceiptData(receipt);
          setSuccessMessage('Transfer completed successfully!');
          setIsProcessing(false);
        } catch (error) {
          setErrorMessage('Error processing transfer');
          console.error('Transfer error:', error);
          setIsProcessing(false);
        }
      }, 1500);
    } catch (error) {
      setErrorMessage('Error processing transfer');
      console.error('Error:', error);
    }
  };

  // Reset form to initial state
  const resetTransferForm = () => {
    setStep(1);
    setRecipientAccountNumber('');
    setRecipientDetails(null);
    setRecipientError('');
    setAmount('');
    setDescription('');
    setAmountError('');
    setDescriptionError('');
    setTransactionPassword('');
    setPasswordError('');
    setShowPassword(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Download receipt as HTML file
  const downloadReceipt = () => {
    if (!receiptData) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fund Transfer Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .receipt-container {
              background-color: white;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1b62b0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #1b62b0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .status {
              text-align: center;
              margin-bottom: 30px;
              padding: 15px;
              background-color: #d4edda;
              border: 1px solid #c3e6cb;
              border-radius: 5px;
              color: #155724;
              font-weight: bold;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-weight: bold;
              color: #1b62b0;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
              font-size: 14px;
            }
            .row.last {
              border-bottom: none;
            }
            .label {
              color: #666;
              font-weight: normal;
            }
            .value {
              color: #333;
              font-weight: bold;
            }
            .amount-highlight {
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 5px;
              font-size: 16px;
              color: #1b62b0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1>PavitraBandham Cooperative Bank</h1>
              <p>Fund Transfer Receipt</p>
            </div>

            <div class="status">✓ ${receiptData.status}</div>

            <div class="section">
              <div class="section-title">Transaction Details</div>
              <div class="row">
                <span class="label">Reference Number:</span>
                <span class="value">${receiptData.referenceNumber}</span>
              </div>
              <div class="row">
                <span class="label">Date:</span>
                <span class="value">${receiptData.date}</span>
              </div>
              <div class="row last">
                <span class="label">Time:</span>
                <span class="value">${receiptData.time}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">From (Sender)</div>
              <div class="row">
                <span class="label">Name:</span>
                <span class="value">${receiptData.senderName}</span>
              </div>
              <div class="row last">
                <span class="label">Account Number:</span>
                <span class="value">${receiptData.senderAccount}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">To (Recipient)</div>
              <div class="row">
                <span class="label">Name:</span>
                <span class="value">${receiptData.recipientName}</span>
              </div>
              <div class="row last">
                <span class="label">Account Number:</span>
                <span class="value">${receiptData.recipientAccount}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Amount Details</div>
              <div class="row">
                <span class="label">Transfer Amount:</span>
                <span class="value">₹ ${receiptData.amount}</span>
              </div>
              <div class="row last">
                <span class="label">Description:</span>
                <span class="value">${receiptData.description}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Account Balance</div>
              <div class="row">
                <span class="label">Balance Before Transfer:</span>
                <span class="value">₹ ${receiptData.senderBalanceBefore}</span>
              </div>
              <div class="row last amount-highlight">
                <span class="label">Balance After Transfer:</span>
                <span class="value">₹ ${receiptData.senderBalanceAfter}</span>
              </div>
            </div>

            <div class="footer">
              <p>This is a computer-generated receipt. No signature is required.</p>
              <p>For security, please keep this receipt confidential.</p>
              <p>© 2026 PavitraBandham Cooperative Bank. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement('a');
    const file = new Blob([receiptHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt_${receiptData.referenceNumber}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Reset receipt and go to dashboard
  const resetReceipt = () => {
    setReceiptData(null);
    resetTransferForm();
    navigate('/user-dashboard');
  };

  const handleCancel = () => {
    resetTransferForm();
    navigate('/user-dashboard');
  };

  if (loading) {
    return (
      <div className="money-transfer-page">
        <Header />
        <Breadcrumbs items={[{ label: 'Fund Transfer', path: '/user-dashboard?tab=transfer' }]} />
        <div className="money-transfer-container">
          <div className="loading">Loading...</div>
        </div>
        
      </div>
    );
  }

  // Show receipt after successful transfer
  if (receiptData) {
    return (
      <div className="money-transfer-page">
        <Header />
        <Breadcrumbs items={[{ label: 'Fund Transfer', path: '/user-dashboard?tab=transfer' }, { label: 'Receipt', path: '#' }]} />
        
        <div className="money-transfer-container">
          <div className="receipt-container">
            <div className="receipt-header">
              <div className="success-icon">✓</div>
              <h1>Transfer Successful</h1>
              <p>Your fund transfer has been completed successfully</p>
            </div>

            <div className="receipt-content">
              <div className="receipt-section">
                <h3>Transaction Details</h3>
                <div className="receipt-row">
                  <span className="label">Reference Number:</span>
                  <span className="value">{receiptData.referenceNumber}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Date & Time:</span>
                  <span className="value">{receiptData.date} at {receiptData.time}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h3>From (Sender)</h3>
                <div className="receipt-row">
                  <span className="label">Name:</span>
                  <span className="value">{receiptData.senderName}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Account Number:</span>
                  <span className="value">{receiptData.senderAccount}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h3>To (Recipient)</h3>
                <div className="receipt-row">
                  <span className="label">Name:</span>
                  <span className="value">{receiptData.recipientName}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Account Number:</span>
                  <span className="value">{receiptData.recipientAccount}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Transfer Details</h3>
                <div className="receipt-row">
                  <span className="label">Transfer Amount:</span>
                  <span className="value highlight">₹ {receiptData.amount}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Description:</span>
                  <span className="value">{receiptData.description}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Account Balance</h3>
                <div className="receipt-row">
                  <span className="label">Balance Before Transfer:</span>
                  <span className="value">₹ {receiptData.senderBalanceBefore}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Balance After Transfer:</span>
                  <span className="value highlight">₹ {receiptData.senderBalanceAfter}</span>
                </div>
              </div>
            </div>

            <div className="receipt-actions">
              <button className="btn btn-primary" onClick={downloadReceipt}>
                <FaDownload /> Download Receipt
              </button>
              <button className="btn btn-secondary" onClick={resetReceipt}>
                <FaHome /> Back to Dashboard
              </button>
            </div>

            <div className="receipt-footer">
              <p>This is a computer-generated receipt. No signature is required.</p>
              <p>For security, please keep this receipt confidential.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="money-transfer-page">
        <Header />
        <Breadcrumbs items={[{ label: 'Fund Transfer', path: '/user-dashboard?tab=transfer' }]} />
        <div className="money-transfer-container">
          <div className="registration-prompt">
            <div className="prompt-icon">
              <FaExclamationCircle />
            </div>
            <h2>Internet Banking Registration Required</h2>
            <p>To transfer funds, you need to register for Internet Banking first.</p>
            <p>Internet Banking registration allows you to set a transaction password for secure fund transfers.</p>
            <button className="btn btn-primary" onClick={() => navigate('/internet-banking-register')}>
              Register for Internet Banking
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="money-transfer-page">
      <Header />
      <Breadcrumbs items={[{ label: 'Fund Transfer', path: '/user-dashboard?tab=transfer' }]} />
      
      <div className="money-transfer-container">
        <div className="transfer-wrapper">
          <div className="transfer-header">
            <h1>Fund Transfer</h1>
            <p>Transfer funds securely to another account in 3 simple steps</p>
          </div>

          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <div className="steps-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Recipient</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Amount</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Confirm</div>
            </div>
          </div>

          <div className="transfer-form">
            {step === 1 && (
              <div className="form-step">
                <h2>Step 1: Select Recipient Account</h2>
                
                <div className="form-group">
                  <label htmlFor="recipientAccount">
                    <FaUser /> Recipient Account Number
                  </label>
                  <input
                    type="text"
                    id="recipientAccount"
                    placeholder="Enter recipient account number"
                    value={recipientAccountNumber}
                    onChange={handleRecipientChange}
                    className={recipientError ? 'input-error' : ''}
                  />
                  {recipientError && <div className="error-message">{recipientError}</div>}
                </div>

                {recipientDetails && (
                  <div className="recipient-preview">
                    <h3>Recipient Details</h3>
                    <div className="details-item">
                      <span className="label">Account Number:</span>
                      <span className="value">{recipientDetails.accountNumber}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Account Holder:</span>
                      <span className="value">{recipientDetails.accountHolder}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Account Type:</span>
                      <span className="value">{recipientDetails.accountType}</span>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  {!recipientDetails ? (
                    <button className="btn btn-primary" onClick={handleVerifyRecipient}>
                      <FaCheck /> Verify Recipient
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={handleProceedToAmount}>
                      <FaArrowRight /> Continue to Amount
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h2>Step 2: Transfer Amount</h2>

                <div className="transfer-summary">
                  <div className="summary-item">
                    <span className="label">From Account:</span>
                    <span className="value">{currentUser.accountNumber}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">To Account:</span>
                    <span className="value">{recipientDetails.accountNumber} ({recipientDetails.accountHolder})</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">
                    Transfer Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    placeholder="Enter amount to transfer"
                    value={amount}
                    onChange={handleAmountChange}
                    step="0.01"
                    min="0"
                    className={amountError ? 'input-error' : ''}
                  />
                  {amountError && <div className="error-message">{amountError}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Description/Reference
                  </label>
                  <textarea
                    id="description"
                    placeholder="Enter a brief description for this transfer"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="4"
                    className={descriptionError ? 'input-error' : ''}
                  />
                  {descriptionError && <div className="error-message">{descriptionError}</div>}
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleProceedToPassword}>
                    <FaArrowRight /> Review Transfer
                  </button>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>
                    Back
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <h2>Step 3: Confirm Transfer</h2>

                <div className="transfer-summary">
                  <div className="summary-item">
                    <span className="label">From Account:</span>
                    <span className="value">{currentUser.accountNumber}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">To Account:</span>
                    <span className="value">{recipientDetails.accountNumber}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Recipient Name:</span>
                    <span className="value">{recipientDetails.accountHolder}</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="label">Amount:</span>
                    <span className="value">₹ {parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Description:</span>
                    <span className="value">{description}</span>
                  </div>
                </div>

                <div className="security-info">
                  <FaLock className="lock-icon" />
                  <h3>Transaction Security</h3>
                  <p>Your transaction is protected by your transaction password. Please enter it to complete the transfer.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="transactionPassword">
                    <FaLock /> Transaction Password
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="transactionPassword"
                      placeholder="Enter your 6-digit transaction password"
                      value={transactionPassword}
                      onChange={handlePasswordChange}
                      className={passwordError ? 'input-error' : ''}
                      maxLength="6"
                      disabled={isProcessing}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isProcessing}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {passwordError && <div className="error-message">{passwordError}</div>}
                </div>

                <div className="form-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCompleteTransfer}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Complete Transfer'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setStep(2)}
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MoneyTransfer;
