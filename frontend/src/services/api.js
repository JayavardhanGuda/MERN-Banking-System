// API Base URL (use Vite env var when available). Default matches backend PORT=4000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Get regular user auth token
function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Get admin JWT token (stored in sessionStorage on admin login)
function getAdminToken() {
  return sessionStorage.getItem('adminToken');
}

/**
 * Decode a JWT and return its payload without verifying the signature.
 * We only use this client-side to read the exp claim.
 */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Returns true if the token is expired or within 30 seconds of expiring.
 * Returns FALSE (not expired) if token is null/missing — callers that need
 * a token will get a 401 from the server, which is the right way to handle
 * missing tokens. We only redirect proactively for tokens that ARE present
 * but expired.
 */
function isTokenExpired(token) {
  if (!token) return false;  // no token → not our job to redirect, let server 401
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false; // can't decode → let server decide
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now() + 30_000;
}

/**
 * Clear all auth data from storage and redirect to /login.
 * Called when a 401 is received from the backend (token expired/invalid).
 */
function handleSessionExpired(isAdmin = false) {
  // Clear all stored tokens and user data
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminSession');

  // Notify any listeners (e.g. Header component)
  window.dispatchEvent(new Event('userSessionChanged'));

  // Redirect to login — use replace so back button doesn't return to dashboard
  const message = isAdmin
    ? 'Admin session expired. Please log in again.'
    : 'Your session has expired. Please log in again.';

  // Store the message so Login page can display it
  sessionStorage.setItem('sessionExpiredMessage', message);
  window.location.replace('/login');

}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Admin routes (/api/admin/...) use the admin JWT; everything else uses the user JWT
  const isAdminRoute = endpoint.startsWith('/admin/') && !endpoint.startsWith('/admin/login');
  const token = isAdminRoute ? getAdminToken() : getAuthToken();

  // Routes that never require a token — skip expiry check and 401 redirect for these
  const isPublicRoute = endpoint === '/users/login'
    || endpoint === '/users/register'
    || endpoint === '/users/verify-token'
    || endpoint === '/admin/login'
    || endpoint.startsWith('/otp/')
    || endpoint.startsWith('/application-status/');

  if (!isPublicRoute && isTokenExpired(token)) {
    handleSessionExpired(isAdminRoute);
    return { success: false, message: 'Session expired' };
  }

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

    // 401 from the server means the token was rejected (expired or tampered).
    // Clear the session and redirect to login automatically.
    if (response.status === 401) {
      // Don't redirect for login attempts themselves — just return the error
      if (!isPublicRoute) {
        handleSessionExpired(isAdminRoute);
      }
      return {
        success: false,
        message: data.message || 'Session expired. Please log in again.',
        ...data
      };
    }

    // Return the data as-is (includes success: true/false from backend)
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'API request failed',
        ...data
      };
    }

    return data;
    
  } catch (error) {
    console.error('API Error:', error);
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
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminSession');
  window.dispatchEvent(new Event('userSessionChanged'));
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
  logLogout,
  reportFraud,
  submitFeedback,
};
