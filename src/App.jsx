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
      </Routes>
    </BrowserRouter>
    </>
  )
}
 
export default App