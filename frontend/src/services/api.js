// API Base URL
const API_BASE_URL = 'http://localhost:4000/api';

// Get auth token from storage
function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    // Return the data as-is (includes success: true/false from backend)
    // This allows components to handle both success and error cases
    if (!response.ok) {
      // Return the error response from backend instead of throwing
      return { 
        success: false, 
        message: data.message || 'API request failed',
        ...data 
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Return a consistent error format for network/parsing errors
    return { 
      success: false, 
      message: error.message || 'Network error. Please check your connection.' 
    };
  }
}

// ============ USER / ACCOUNT APIs ============

// Register new account
export async function registerAccount(accountData) {
  return apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(accountData),
  });
}

// User login
export async function loginUser(credentials) {
  return apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Verify JWT token
export async function verifyToken() {
  return apiCall('/users/verify-token');
}

// Logout - clear tokens
export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('currentUser');
}

// ============ FORGOT PASSWORD / OTP APIs ============

// Step 1: Verify email exists in database
export async function verifyEmailExists(email) {
  return apiCall('/otp/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Step 2: Send OTP for forgot password
export async function sendForgotPasswordOtp(email, accountNumber) {
  return apiCall('/otp/forgot-password/send', {
    method: 'POST',
    body: JSON.stringify({ email, accountNumber }),
  });
}

// Step 3: Verify OTP for forgot password
export async function verifyForgotPasswordOtp(accountNumber, otp) {
  return apiCall('/otp/forgot-password/verify', {
    method: 'POST',
    body: JSON.stringify({ accountNumber, otp }),
  });
}

// Step 4: Reset password with token
export async function resetPassword(accountNumber, resetToken, newPassword) {
  return apiCall('/otp/reset-password', {
    method: 'POST',
    body: JSON.stringify({ accountNumber, resetToken, newPassword }),
  });
}

// ============ REGISTRATION EMAIL VERIFICATION APIs ============

// Send OTP to verify email during registration
export async function sendRegistrationOtp(email) {
  return apiCall('/otp/registration/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Verify OTP during registration
export async function verifyRegistrationOtp(email, otp) {
  return apiCall('/otp/registration/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

// Check if user is authenticated
export function isAuthenticated() {
  const token = getAuthToken();
  return !!token;
}

// Get current user from storage
export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Get user profile
export async function getUserProfile(accountNumber) {
  return apiCall(`/users/${accountNumber}`);
}

// Update user profile
export async function updateUserProfile(accountNumber, data) {
  return apiCall(`/users/${accountNumber}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ ACCOUNT APIs ============

// Get all accounts
export async function getAllAccounts() {
  return apiCall('/accounts');
}

// Get account by account number
export async function getAccount(accountNumber) {
  return apiCall(`/accounts/${accountNumber}`);
}

// ============ TRANSACTION APIs ============

// Create transaction (fund transfer)
export async function createTransaction(transactionData) {
  return apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
}

// Get transactions by account
export async function getTransactionsByAccount(accountNumber) {
  return apiCall(`/transactions/account/${accountNumber}`);
}

// Get all transactions (admin)
export async function getAllTransactions() {
  return apiCall('/transactions');
}

// Get recent transactions
export async function getRecentTransactions(accountNumber) {
  return apiCall(`/transactions/recent/${accountNumber}`);
}

// Get account statement with filters
export async function getAccountStatement(accountNumber, filters = {}) {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.type) params.append('type', filters.type);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  return apiCall(`/transactions/statement/${accountNumber}${queryString ? '?' + queryString : ''}`);
}

// Verify recipient account
export async function verifyRecipientAccount(accountNumber) {
  return apiCall(`/accounts/${accountNumber}`);
}

// ============ INTERNET BANKING APIs ============

// Register for internet banking
export async function registerInternetBanking(data) {
  return apiCall('/internet-banking/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Check if internet banking is registered
export async function checkInternetBankingStatus(accountNumber) {
  return apiCall(`/internet-banking/check/${accountNumber}`);
}

// Get internet banking status
export async function getInternetBankingStatus(accountNumber) {
  return apiCall(`/internet-banking/${accountNumber}`);
}

// ============ LOCKER BOOKING APIs ============

// Book locker
export async function bookLocker(bookingData) {
  return apiCall('/locker-bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

// Get all locker bookings (admin)
export async function getAllLockerBookings() {
  return apiCall('/locker-bookings');
}

// Get pending locker bookings (admin)
export async function getPendingLockerBookings() {
  return apiCall('/locker-bookings/pending');
}

// Get pending locker count (for notifications)
export async function getPendingLockerCount() {
  return apiCall('/locker-bookings/pending/count');
}

// Get locker bookings by account
export async function getLockerBookings(accountNumber) {
  return apiCall(`/locker-bookings/account/${accountNumber}`);
}

// Approve locker booking (admin)
export async function approveLockerBooking(bookingId, data = {}) {
  return apiCall(`/locker-bookings/${bookingId}/approve`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Reject locker booking (admin)
export async function rejectLockerBooking(bookingId, data = {}) {
  return apiCall(`/locker-bookings/${bookingId}/reject`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Cancel locker booking
export async function cancelLockerBooking(bookingId) {
  return apiCall(`/locker-bookings/${bookingId}`, {
    method: 'DELETE',
  });
}

// ============ SERVICE REQUEST APIs ============

// Create service request
export async function createServiceRequest(requestData) {
  return apiCall('/service-requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

// Get service requests by account
export async function getServiceRequests(accountNumber) {
  return apiCall(`/service-requests/account/${accountNumber}`);
}

// Get all service requests (admin)
export async function getAllServiceRequests() {
  return apiCall('/service-requests');
}

// Get pending service requests (admin)
export async function getPendingServiceRequests() {
  return apiCall('/service-requests/pending');
}

// Approve service request (admin)
export async function approveServiceRequest(requestId, adminRemarks = '') {
  return apiCall(`/service-requests/${requestId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ adminRemarks }),
  });
}

// Reject service request (admin)
export async function rejectServiceRequest(requestId, rejectionReason, adminRemarks = '') {
  return apiCall(`/service-requests/${requestId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ rejectionReason, adminRemarks }),
  });
}

// Cancel service request (user)
export async function cancelServiceRequest(requestId) {
  return apiCall(`/service-requests/${requestId}/cancel`, {
    method: 'PUT',
  });
}

// ============ ADMIN APIs ============

// Admin login
export async function adminLogin(credentials) {
  return apiCall('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Get pending accounts
export async function getPendingAccounts() {
  return apiCall('/admin/accounts/pending');
}

// Get approved accounts
export async function getApprovedAccounts() {
  return apiCall('/admin/accounts/approved');
}

// Get rejected accounts
export async function getRejectedAccounts() {
  return apiCall('/admin/accounts/rejected');
}

// Approve account
export async function approveAccount(accountNumber) {
  return apiCall(`/admin/accounts/${accountNumber}/approve`, {
    method: 'PUT',
  });
}

// Reject account
export async function rejectAccount(accountNumber) {
  return apiCall(`/admin/accounts/${accountNumber}/reject`, {
    method: 'PUT',
  });
}

// ============ APPLICATION STATUS APIs ============

// Check application status
export async function checkApplicationStatus(accountNumber) {
  return apiCall(`/application-status/${accountNumber}`);
}

// ============ OTP APIs ============

// Generate OTP
export async function generateOtp(data) {
  return apiCall('/otp/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Validate OTP
export async function validateOtp(data) {
  return apiCall('/otp/validate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============ LOGOUT HISTORY APIs ============

// Log logout
export async function logLogout(data) {
  return apiCall('/logout-history', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============ REPORT FRAUD APIs ============

// Report fraud
export async function reportFraud(data) {
  return apiCall('/report-fraud', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============ FEEDBACK APIs ============

// Submit feedback
export async function submitFeedback(data) {
  return apiCall('/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export default {
  registerAccount,
  loginUser,
  verifyToken,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getAllAccounts,
  getAccount,
  createTransaction,
  getTransactionsByAccount,
  getAllTransactions,
  getRecentTransactions,
  getAccountStatement,
  verifyRecipientAccount,
  registerInternetBanking,
  checkInternetBankingStatus,
  getInternetBankingStatus,
  bookLocker,
  getAllLockerBookings,
  getPendingLockerBookings,
  getPendingLockerCount,
  getLockerBookings,
  approveLockerBooking,
  rejectLockerBooking,
  cancelLockerBooking,
  createServiceRequest,
  getServiceRequests,
  getAllServiceRequests,
  getPendingServiceRequests,
  approveServiceRequest,
  rejectServiceRequest,
  cancelServiceRequest,
  adminLogin,
  getPendingAccounts,
  getApprovedAccounts,
  getRejectedAccounts,
  approveAccount,
  rejectAccount,
  checkApplicationStatus,
  generateOtp,
  validateOtp,
  logLogout,
  reportFraud,
  submitFeedback,
};
