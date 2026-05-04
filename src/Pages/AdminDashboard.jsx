import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Breadcrumbs from '../Components/Breadcrumbs'
import '../styles/Dashboard.css'

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('pending')
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    setAccounts(storedAccounts);
  }, [])

  const handleStatusUpdate = (id, status) => {
    setAccounts((current) => {
      const updated = current.map((account) =>
        account.id === id ? { ...account, status } : account
      )
      localStorage.setItem('bankAccounts', JSON.stringify(updated))
      return updated
    })
  }

  const pendingAccounts = accounts.filter((account) => account.status === 'Pending')
  const approvedAccounts = accounts.filter((account) => account.status === 'Approved')

  const renderContent = () => {
    if (activeSection === 'approved') {
      return (
        <>
          <div className="dashboard-card-grid">
            <div className="dashboard-card">
              <h3>Approved Accounts</h3>
              <p>{approvedAccounts.length}</p>
            </div>
            <div className="dashboard-card">
              <h3>Pending Accounts</h3>
              <p>{pendingAccounts.length}</p>
            </div>
          </div>
          <div className="statement-table-wrapper">
            <table className="statement-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Account Type</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{account.username}</td>
                    <td>{account.email}</td>
                    <td>{account.phone}</td>
                    <td>{account.accountType}</td>
                    <td>{account.dateOfBirth}</td>
                    <td>{account.gender}</td>
                    <td>{account.city}</td>
                    <td>{account.state}</td>
                    <td>{account.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )
    }

    return (
      <>
        <div className="dashboard-card-grid">
          <div className="dashboard-card">
            <h3>Pending Approvals</h3>
            <p>{pendingAccounts.length}</p>
          </div>
          <div className="dashboard-card">
            <h3>Approved Accounts</h3>
            <p>{approvedAccounts.length}</p>
          </div>
        </div>
        <div className="statement-table-wrapper">
          <table className="statement-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Account Type</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.username}</td>
                  <td>{account.email}</td>
                  <td>{account.phone}</td>
                  <td>{account.accountType}</td>
                    <td>{account.dateOfBirth}</td>
                    <td>{account.gender}</td>
                    <td>{account.city}</td>
                    <td>{account.state}</td>
                  <td>
                    <button
                      type="button"
                      className="transfer-button"
                      onClick={() => handleStatusUpdate(account.id, 'Approved')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="transfer-button"
                      onClick={() => handleStatusUpdate(account.id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="dashboard-page">
        <Breadcrumbs items={[{ label: 'Admin Dashboard', path: '/admin-dashboard' }]} />
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div className="sidebar-heading">
              <h2>Admin Panel</h2>
              <p>Verify new accounts</p>
            </div>
            <button
              className={`sidebar-item ${activeSection === 'pending' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('pending')}
            >
              Pending Approvals
            </button>
            <button
              className={`sidebar-item ${activeSection === 'approved' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveSection('approved')}
            >
              Approved Accounts
            </button>
          </aside>
          <section className="dashboard-content">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-panel-subtitle">Admin Dashboard</p>
                  <h1>{activeSection === 'approved' ? 'Approved Accounts' : 'Pending Account Approvals'}</h1>
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
