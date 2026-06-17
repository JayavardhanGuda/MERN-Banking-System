import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import ScrollToTop from './Components/ScrollToTop'
import PageLoader from './Components/PageLoader'
import Home from './Pages/Home'
import Register from './Pages/SavingsAccountRegister'
import SavingsAccount from './Pages/SavingsAccount'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'
import Login from './Pages/Login'
import AdminDashboard from './Pages/AdminDashboard'
import UserDashboard from './Pages/UserDashboard'
import InternetBankingRegister from './Pages/InternetBankingRegister'
import ReportFraud from './Pages/ReportFraud'
import ComingSoon from './Pages/ComingSoon'
import ApplicationStatus from './Pages/ApplicationStatus'

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
        <Route path="/user-dashboard"            element={<UserDashboard />} />
        <Route path="/admin-dashboard"           element={<AdminDashboard />} />
        <Route path="/savings-account"           element={<SavingsAccount />} />
        <Route path="/register"                  element={<Register />} />
        <Route path="/internet-banking-register" element={<InternetBankingRegister />} />
        <Route path="/service-request"           element={<Navigate to="/user-dashboard" state={{ section: 'service' }} replace />} />
        <Route path="/smart-lock"                element={<Navigate to="/user-dashboard" state={{ section: 'smartlock' }} replace />} />
        <Route path="/locker-bookings"           element={<Navigate to="/user-dashboard" replace />} />
        <Route path="/report-fraud"              element={<ReportFraud />} />
        <Route path="/cards"                     element={<ComingSoon />} />
        <Route path="/insurance"                 element={<ComingSoon />} />
        {/* Fallback renders when no backgroundLocation */}
        <Route path="/login"                     element={<Login />} />
        <Route path="/forgot-password"           element={<ForgotPassword />} />
        <Route path="/reset-password"            element={<ResetPassword />} />
        <Route path="/application-status"        element={<ApplicationStatus />} />
      </Routes>

      {/* ── Modal overlays: only when backgroundLocation is set ── */}
      {backgroundLocation && (
        <Routes>
          <Route path="/login"                element={<Login />} />
          <Route path="/forgot-password"      element={<ForgotPassword />} />
          <Route path="/reset-password"       element={<ResetPassword />} />
          <Route path="/application-status"   element={<ApplicationStatus />} />
        </Routes>
      )}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageLoader />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
