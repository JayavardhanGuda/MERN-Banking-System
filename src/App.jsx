import { BrowserRouter,Route,Routes } from 'react-router-dom'
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
 
 
function App() {
 
 
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/user-login" element={<UserLogin />}/>
        <Route path="/admin-login" element={<AdminLogin />}/>
        <Route path="/user-dashboard" element={<UserDashboard />}/>
        <Route path="/admin-dashboard" element={<AdminDashboard />}/>
        <Route path="/savings-account" element={<SavingsAccount />}/>
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/internet-banking-register" element={<InternetBankingRegister />}/>
        <Route path="/service-request" element={<ServiceRequest />}/>
        <Route path="/smart-lock" element={<SmartLock />}/>
        <Route path="/locker-bookings" element={<LockerBookings />}/>
        <Route path="/report-fraud" element={<ReportFraud />}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}
 
export default App