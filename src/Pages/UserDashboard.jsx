import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Breadcrumbs from '../Components/Breadcrumbs'
import MoneyTransfer from './MoneyTransfer'
import ServiceRequest from './ServiceRequest'
import SmartLock from './SmartLock'
import { isInternetBankingEnabled } from '../internetBankingUtils'
import {
  FaUser, FaChartBar, FaExchangeAlt, FaFileAlt,
  FaWallet, FaShoppingCart, FaClock, FaUniversity,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard,
  FaClipboardList, FaLock
} from 'react-icons/fa'
import '../styles/Dashboard.css'

export default function UserDashboard() {
  const location = useLocation()
  const [activeSection, setActiveSection] = useState(
    location.state?.openTransfer ? 'transfer' : 'details'
  )
  const [currentUser, setCurrentUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const transactionData = [
    { date: '2026-04-20', description: 'Salary deposit', amount: '+₹45,000.00', status: 'Credited' },
    { date: '2026-04-19', description: 'NEFT payment - Rent', amount: '-₹12,500.00', status: 'Debited' },
    { date: '2026-04-18', description: 'IMPS transfer - Grocery', amount: '-₹3,140.00', status: 'Debited' },
    { date: '2026-04-17', description: 'RTGS transfer - Car EMI', amount: '-₹18,750.00', status: 'Debited' },
    { date: '2026-04-16', description: 'Interest credit', amount: '+₹220.00', status: 'Credited' }
  ]

  const transferMethods = ['IMPS', 'NEFT', 'RTGS']

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  useEffect(() => {
    const loadData = () => {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
      setCurrentUser(storedUser)
      if (storedUser) {
        const historyKey = `transferHistory_${storedUser.accountNumber}`
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]')
        // Sort by date descending
        history.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))
        setTransactions(history)
      }
    }
    loadData()

    const handleTransferCompleted = () => {
      loadData()
    }

    window.addEventListener('transferCompleted', handleTransferCompleted)
    return () => window.removeEventListener('transferCompleted', handleTransferCompleted)
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case 'summary':
        return (
          <>
            <div className="dashboard-card-grid">
              <div className="dashboard-card balance-card">
                <h3><FaWallet style={{ marginRight: 6 }} />Available Balance</h3>
                <p>₹{currentUser && currentUser.balance ? parseFloat(currentUser.balance).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</p>
              </div>
              <div className="dashboard-card">
                <h3><FaShoppingCart style={{ marginRight: 6 }} />Monthly Spending</h3>
                <p>₹32,450.00</p>
              </div>
              <div className="dashboard-card">
                <h3><FaClock style={{ marginRight: 6 }} />Pending Payments</h3>
                <p>₹4,250.00</p>
              </div>
            </div>
            <p className="dashboard-text">View your account summary, recent activity, and cash flow at a glance.</p>
          </>
        )
      case 'transfer':
        return <MoneyTransfer />
      case 'service':
        return <ServiceRequest embedded />
      case 'smartlock':
        return <SmartLock embedded />
      case 'statement':
        return (
          <>
            <div className="statement-table-wrapper">
              <table className="statement-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? transactions.map((item, index) => {
                    const isCredit = item.recipientAccount === currentUser.accountNumber;
                    return (
                      <tr key={item.id || index}>
                        <td>{formatDate(item.date)}</td>
                        <td>{isCredit ? `Transfer from ${item.senderName} - ${item.description}` : `Transfer to ${item.recipientName} - ${item.description}`}</td>
                        <td style={{ color: isCredit ? '#15803d' : '#b91c1c', fontWeight: 700 }}>{isCredit ? `+₹${item.amount}` : `-₹${item.amount}`}</td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isCredit ? '#dcfce7' : '#fee2e2',
                            color: isCredit ? '#15803d' : '#b91c1c'
                          }}>
                            {isCredit ? 'Credited' : 'Debited'}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : transactionData.map((item, index) => {
                    const isCredit = item.status === 'Credited';
                    return (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td>{item.description}</td>
                        <td style={{ color: isCredit ? '#15803d' : '#b91c1c', fontWeight: 700 }}>{item.amount}</td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isCredit ? '#dcfce7' : '#fee2e2',
                            color: isCredit ? '#15803d' : '#b91c1c'
                          }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="dashboard-text">{transactions.length > 0 ? 'Your recent transactions are shown above.' : 'Sample account transactions are shown above for review.'}</p>
          </>
        )
      default:
        return (
          <>
            <div className="dashboard-card-grid">
              <div className="dashboard-card detail-card">
                <h3>Account Holder</h3>
                <p>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}</p>
              </div>
              <div className="dashboard-card detail-card">
                <h3>Account Number</h3>
                <p>{currentUser?.accountNumber || 'XXXX-XXXX-XXXX-2345'}</p>
              </div>
              <div className="dashboard-card detail-card">
                <h3>Account Type</h3>
                <p>{currentUser?.accountType ? currentUser.accountType.charAt(0).toUpperCase() + currentUser.accountType.slice(1) : 'Savings Account'}</p>
              </div>
            </div>
            <div className="dashboard-card-grid">
              <div className="dashboard-card detail-card">
                <h3>Email</h3>
                <p>{currentUser?.email || '-'}</p>
              </div>
              <div className="dashboard-card detail-card">
                <h3>Username</h3>
                <p>{currentUser?.username || '-'}</p>
              </div>
              <div className="dashboard-card detail-card">
                <h3>Phone</h3>
                <p>{currentUser?.phone || '-'}</p>
              </div>
            </div>
            <div className="dashboard-card-grid">
              <div className="dashboard-card detail-card">
                <h3>Branch</h3>
                <p>{currentUser?.city ? `${currentUser.city} Branch` : 'MG Road Branch'}</p>
              </div>
              <div className="dashboard-card detail-card">
                <h3>IFSC Code</h3>
                <p>PAVB0000234</p>
              </div>
            </div>
            <p className="dashboard-text">View your account metadata, branch details, and account type information.</p>
          </>
        )
    }
  }
  
  return (
    <>
      <Header />
      <main className="dashboard-page">
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/user-dashboard' }]} />
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div className="sidebar-heading">
              <h2>Account Menu</h2>
              <p>Quick access panel</p>
            </div>
            <button
              className={`sidebar-item ${activeSection === 'details' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('details')}
            >
              <FaIdCard /> Account Details
            </button>
            <button
              className={`sidebar-item ${activeSection === 'summary' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('summary')}
            >
              <FaChartBar /> Account Summary
            </button>
            <button
              className={`sidebar-item ${activeSection === 'transfer' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('transfer')}
            >
              <FaExchangeAlt /> Funds Transfer
            </button>
            <button
              className={`sidebar-item ${activeSection === 'statement' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('statement')}
            >
              <FaFileAlt /> Account Statement
            </button>
            <button
              className={`sidebar-item ${activeSection === 'service' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('service')}
            >
              <FaClipboardList /> Service Request
            </button>
            <button
              className={`sidebar-item ${activeSection === 'smartlock' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('smartlock')}
            >
              <FaLock /> Smart Lock
            </button>
          </aside>
          <section className="dashboard-content">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-panel-subtitle">Dashboard</p>
                  <h1>{
                    activeSection === 'details'   ? 'Account Details'    :
                    activeSection === 'summary'   ? 'Account Summary'    :
                    activeSection === 'transfer'  ? 'Funds Transfer'     :
                    activeSection === 'statement' ? 'Account Statement'  :
                    activeSection === 'service'   ? 'Service Request'    :
                    activeSection === 'smartlock' ? 'Smart Lock'         : ''
                  }</h1>
                </div>
              </div>
              {renderContent()}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
