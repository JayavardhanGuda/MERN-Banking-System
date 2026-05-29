import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Breadcrumbs from '../Components/Breadcrumbs'
import MoneyTransfer from './MoneyTransfer'
import ServiceRequest from './ServiceRequest'
import SmartLock from './SmartLock'
import { getAccountStatement, getAccount } from '../services/api'
import {
  FaUser, FaChartBar, FaExchangeAlt, FaFileAlt,
  FaWallet, FaShoppingCart, FaClock, FaUniversity,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard,
  FaClipboardList, FaLock, FaDownload, FaFilter,
  FaArrowUp, FaArrowDown, FaSpinner
} from 'react-icons/fa'
import '../styles/Dashboard.css'

export default function UserDashboard() {
  const location = useLocation()
  const [activeSection, setActiveSection] = useState(
    location.state?.openTransfer ? 'transfer' : 'details'
  )
  const [currentUser, setCurrentUser] = useState(null)
  const [statement, setStatement] = useState(null)
  const [statementLoading, setStatementLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all'
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const loadStatement = async (accountNumber) => {
    setStatementLoading(true)
    try {
      const response = await getAccountStatement(accountNumber, filters)
      if (response.success) {
        setStatement(response.statement)
      }
    } catch (error) {
      console.error('Error loading statement:', error)
    }
    setStatementLoading(false)
  }

  useEffect(() => {
    const loadData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
      setCurrentUser(storedUser)
      
      if (storedUser && storedUser.accountNumber) {
        try {
          // Fetch latest user data from MongoDB to get updated balance
          const accountResponse = await getAccount(storedUser.accountNumber)
          if (accountResponse.success && accountResponse.data) {
            const updatedUser = {
              ...storedUser,
              balance: accountResponse.data.balance || accountResponse.data.initialDeposit
            }
            setCurrentUser(updatedUser)
            localStorage.setItem('currentUser', JSON.stringify(updatedUser))
          }

          // Load statement
          await loadStatement(storedUser.accountNumber)
        } catch (error) {
          console.error('Error loading dashboard data:', error)
        }
      }
    }
    loadData()

    const handleTransferCompleted = () => {
      loadData()
    }

    window.addEventListener('transferCompleted', handleTransferCompleted)
    return () => window.removeEventListener('transferCompleted', handleTransferCompleted)
  }, [])

  // Reload statement when filters change
  useEffect(() => {
    if (currentUser && currentUser.accountNumber && activeSection === 'statement') {
      loadStatement(currentUser.accountNumber)
    }
  }, [filters, activeSection])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const downloadStatement = () => {
    if (!statement) return
    
    const transactionRows = statement.transactions.map(t => `
      <tr>
        <td>${t.date}</td>
        <td>${t.time}</td>
        <td>${t.referenceNumber}</td>
        <td>${t.description}</td>
        <td class="${t.type === 'credit' ? 'credit' : 'debit'}">${t.type === 'credit' ? 'Credit' : 'Debit'}</td>
        <td class="${t.type === 'credit' ? 'credit' : 'debit'}">${t.type === 'credit' ? '+' : '-'}₹${parseFloat(t.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        <td>₹${parseFloat(t.balanceAfter).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        <td>${t.counterparty.name}<br/><small style="color:#666">${t.counterparty.account}</small></td>
      </tr>
    `).join('')

    const statementHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Account Statement - VJN Cooperative Bank</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .statement-container {
              background-color: white;
              max-width: 1000px;
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
            .account-info {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 20px;
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
            .info-block {
              min-width: 200px;
            }
            .info-block .label {
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .info-block .value {
              color: #333;
              font-weight: bold;
              font-size: 16px;
            }
            .summary {
              display: flex;
              justify-content: space-around;
              flex-wrap: wrap;
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              text-align: center;
              padding: 20px 30px;
              border-radius: 8px;
              min-width: 180px;
            }
            .summary-card.credit {
              background-color: #d4edda;
              border: 1px solid #c3e6cb;
            }
            .summary-card.debit {
              background-color: #f8d7da;
              border: 1px solid #f5c6cb;
            }
            .summary-card.balance {
              background-color: #e7f1ff;
              border: 1px solid #b6d4fe;
            }
            .summary-card .title {
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            .summary-card .amount {
              font-size: 24px;
              font-weight: bold;
            }
            .summary-card.credit .amount { color: #155724; }
            .summary-card.debit .amount { color: #721c24; }
            .summary-card.balance .amount { color: #1b62b0; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #1b62b0;
              color: white;
              padding: 12px 10px;
              text-align: left;
              font-size: 12px;
              text-transform: uppercase;
            }
            td {
              padding: 12px 10px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 13px;
              color: #333;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f0f7ff;
            }
            .credit { color: #155724; font-weight: bold; }
            .debit { color: #dc3545; font-weight: bold; }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 12px;
            }
            @media print {
              body { background-color: white; }
              .statement-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="statement-container">
            <div class="header">
              <h1>VJN Cooperative Bank</h1>
              <p>Account Statement</p>
            </div>

            <div class="account-info">
              <div class="info-block">
                <div class="label">Account Holder</div>
                <div class="value">${currentUser?.firstName || ''} ${currentUser?.lastName || ''}</div>
              </div>
              <div class="info-block">
                <div class="label">Account Number</div>
                <div class="value">${statement.accountNumber}</div>
              </div>
              <div class="info-block">
                <div class="label">Statement Period</div>
                <div class="value">${filters.startDate || 'All'} to ${filters.endDate || 'Present'}</div>
              </div>
              <div class="info-block">
                <div class="label">Generated On</div>
                <div class="value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div class="summary">
              <div class="summary-card credit">
                <div class="title">Total Credits</div>
                <div class="amount">₹${parseFloat(statement.totalCredit).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
              </div>
              <div class="summary-card debit">
                <div class="title">Total Debits</div>
                <div class="amount">₹${parseFloat(statement.totalDebit).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
              </div>
              <div class="summary-card balance">
                <div class="title">Current Balance</div>
                <div class="amount">₹${parseFloat(currentUser?.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
              </div>
            </div>

            <div class="section-title" style="font-weight: bold; color: #1b62b0; margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">
              Transaction History (${statement.transactionCount} transactions)
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Counterparty</th>
                </tr>
              </thead>
              <tbody>
                ${transactionRows || '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #666;">No transactions found for the selected period.</td></tr>'}
              </tbody>
            </table>

            <div class="footer">
              <p>This is a computer-generated statement. No signature is required.</p>
              <p>For security, please keep this statement confidential.</p>
              <p>© 2026 VJN Cooperative Bank. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([statementHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `statement_${statement.accountNumber}_${new Date().toISOString().split('T')[0]}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

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
                <h3><FaArrowUp style={{ marginRight: 6, color: '#15803d' }} />Total Credits</h3>
                <p style={{ color: '#15803d' }}>₹{statement ? statement.totalCredit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}</p>
              </div>
              <div className="dashboard-card">
                <h3><FaArrowDown style={{ marginRight: 6, color: '#b91c1c' }} />Total Debits</h3>
                <p style={{ color: '#b91c1c' }}>₹{statement ? statement.totalDebit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}</p>
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
            {/* Statement Header */}
            <div className="statement-header" style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e3a5f' }}>Account Statement</h3>
                  <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    {statement ? `${statement.transactionCount} transactions found` : 'Loading...'}
                  </p>
                </div>
                <button 
                  onClick={downloadStatement} 
                  disabled={!statement || statement.transactions.length === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', background: '#1e3a5f', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    opacity: (!statement || statement.transactions.length === 0) ? 0.5 : 1
                  }}
                >
                  <FaDownload /> Download Statement
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="statement-filters" style={{ 
              display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap',
              padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaFilter style={{ color: '#64748b' }} />
                <span style={{ fontWeight: 600, color: '#1e3a5f' }}>Filters:</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#64748b' }}>From:</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#64748b' }}>To:</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Type:</label>
                <select 
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                  <option value="all">All</option>
                  <option value="transfer">Transfers</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                </select>
              </div>
            </div>

            {/* Summary Cards */}
            {statement && (
              <div className="dashboard-card-grid" style={{ marginBottom: '20px' }}>
                <div className="dashboard-card" style={{ background: '#dcfce7', borderColor: '#15803d' }}>
                  <h3 style={{ color: '#15803d' }}><FaArrowUp style={{ marginRight: 6 }} />Total Credit</h3>
                  <p style={{ color: '#15803d' }}>₹{statement.totalCredit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="dashboard-card" style={{ background: '#fee2e2', borderColor: '#b91c1c' }}>
                  <h3 style={{ color: '#b91c1c' }}><FaArrowDown style={{ marginRight: 6 }} />Total Debit</h3>
                  <p style={{ color: '#b91c1c' }}>₹{statement.totalDebit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="dashboard-card balance-card">
                  <h3><FaWallet style={{ marginRight: 6 }} />Current Balance</h3>
                  <p>₹{statement.currentBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            {statementLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#1e3a5f' }} />
                <p>Loading statement...</p>
              </div>
            ) : (
              <div className="statement-table-wrapper">
                <table className="statement-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Reference</th>
                      <th>Description</th>
                      <th>Counterparty</th>
                      <th>Amount</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statement && statement.transactions.length > 0 ? statement.transactions.map((item, index) => {
                      const isCredit = item.type === 'credit';
                      return (
                        <tr key={item.referenceNumber || index}>
                          <td>
                            <div>{item.date}</div>
                            <small style={{ color: '#64748b' }}>{item.time}</small>
                          </td>
                          <td><code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{item.referenceNumber}</code></td>
                          <td>{item.description}</td>
                          <td>
                            <div>{item.counterparty.name}</div>
                            <small style={{ color: '#64748b' }}>{item.counterparty.account}</small>
                          </td>
                          <td style={{ color: isCredit ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                            {isCredit ? '+' : '-'}₹{parseFloat(item.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            ₹{parseFloat(item.balanceAfter).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                          <FaFileAlt style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }} />
                          <p>No transactions found for the selected filters.</p>
                          <p style={{ fontSize: '0.9rem' }}>Make a fund transfer to see your transaction history here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
