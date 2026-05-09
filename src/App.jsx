import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home'
import LoginSelector from './Pages/LoginSelector'
import UserLogin from './Pages/UserLogin'
import AdminLogin from './Pages/AdminLogin'
import Register from './Pages/SavingsAccountRegister'
import SavingsAccount from './Pages/SavingsAccount'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'
import Login from './Pages/Login'
import AdminDashboard from './Pages/AdminDashboard'
import UserDashboard from './Pages/UserDashboard'
import InternetBankingRegister from './Pages/InternetBankingRegister'
import ServiceRequest from './Pages/ServiceRequest'
import SmartLock from './Pages/SmartLock'
import LockerBookings from './Pages/LockerBookings'
import ReportFraud from './Pages/ReportFraud'
import ComingSoon from './Pages/ComingSoon'

function AppRoutes() {
  const location = useLocation()

  // If we navigated to /login, /forgot-password, or /reset-password with a
  // background location in state, render the background page underneath
  // and the modal on top.
  const backgroundLocation = location.state?.backgroundLocation

  return (
    <>
      {/* ── Background page (or normal page when no modal) ── */}
      <Routes location={backgroundLocation || location}>
        <Route path="/"                          element={<Home />} />
        <Route path="/user-login"                element={<UserLogin />} />
        <Route path="/admin-login"               element={<AdminLogin />} />
        <Route path="/user-dashboard"            element={<UserDashboard />} />
        <Route path="/admin-dashboard"           element={<AdminDashboard />} />
        <Route path="/savings-account"           element={<SavingsAccount />} />
        <Route path="/register"                  element={<Register />} />
        <Route path="/internet-banking-register" element={<InternetBankingRegister />} />
        <Route path="/service-request"           element={<ServiceRequest />} />
        <Route path="/smart-lock"                element={<SmartLock />} />
        <Route path="/locker-bookings"           element={<LockerBookings />} />
        <Route path="/report-fraud"              element={<ReportFraud />} />
        <Route path="/cards"                     element={<ComingSoon />} />
        <Route path="/insurance"                 element={<ComingSoon />} />
        {/* Fallback renders when no backgroundLocation */}
        <Route path="/login"                     element={<Login />} />
        <Route path="/forgot-password"           element={<ForgotPassword />} />
        <Route path="/reset-password"            element={<ResetPassword />} />
      </Routes>

      {/* ── Modal overlays: only when backgroundLocation is set ── */}
      {backgroundLocation && (
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
        </Routes>
      )}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
