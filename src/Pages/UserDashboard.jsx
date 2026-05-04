import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Breadcrumbs from '../Components/Breadcrumbs'
import MoneyTransfer from './MoneyTransfer'
import { isInternetBankingEnabled } from '../internetBankingUtils'
import '../styles/Dashboard.css'

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState('details')
  const [currentUser, setCurrentUser] = useState(null)
  const transactionData = [
    { date: '2026-04-20', description: 'Salary deposit', amount: '+₹45,000.00', status: 'Credited' },
    { date: '2026-04-19', description: 'NEFT payment - Rent', amount: '-₹12,500.00', status: 'Debited' },
    { date: '2026-04-18', description: 'IMPS transfer - Grocery', amount: '-₹3,140.00', status: 'Debited' },
    { date: '2026-04-17', description: 'RTGS transfer - Car EMI', amount: '-₹18,750.00', status: 'Debited' },
    { date: '2026-04-16', description: 'Interest credit', amount: '+₹220.00', status: 'Credited' }
  ]

  const transferMethods = ['IMPS', 'NEFT', 'RTGS']

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    setCurrentUser(storedUser)
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case 'summary':
        return (
          <>
            <div className="dashboard-card-grid">
              <div className="dashboard-card">
                <h3>Available Balance</h3>
                <p>₹{currentUser && currentUser.balance ? parseFloat(currentUser.balance).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</p>
              </div>
              <div className="dashboard-card">
                <h3>Monthly Spending</h3>
                <p>₹32,450.00</p>
              </div>
              <div className="dashboard-card">
                <h3>Pending Payments</h3>
                <p>₹4,250.00</p>
              </div>
            </div>
            <p className="dashboard-text">View your account summary, recent activity, and cash flow at a glance.</p>
          </>
        )
      case 'transfer':
        return <MoneyTransfer />
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
                  {transactionData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.description}</td>
                      <td>{item.amount}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dashboard-text">Sample account transactions are shown above for review.</p>
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
              Account Details
            </button>
            <button
              className={`sidebar-item ${activeSection === 'summary' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('summary')}
            >
              Account Summary
            </button>
            <button
              className={`sidebar-item ${activeSection === 'transfer' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('transfer')}
            >
              Funds Transfer
            </button>
            <button
              className={`sidebar-item ${activeSection === 'statement' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('statement')}
            >
              Account Statement
            </button>
          </aside>
          <section className="dashboard-content">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-panel-subtitle">Dashboard</p>
                  <h1>{
                    activeSection === 'details'
                      ? 'Account Details'
                      : activeSection === 'summary'
                      ? 'Account Summary'
                      : activeSection === 'transfer'
                      ? 'Funds Transfer'
                      : 'Account Statement'
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
