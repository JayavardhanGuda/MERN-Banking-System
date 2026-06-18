import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Breadcrumbs from '../Components/Breadcrumbs'
import {
  FaUsers, FaUserCheck, FaUserTimes, FaClock,
  FaSearch, FaEye, FaCheck, FaTimes, FaIdCard,
  FaFileAlt, FaMapMarkerAlt, FaLock, FaEnvelope,
  FaPhone, FaCalendarAlt, FaVenusMars, FaUniversity,
  FaMoneyBillWave, FaShieldAlt, FaDownload,
  FaFilePdf, FaFileImage, FaExternalLinkAlt,
  FaHistory, FaArrowUp, FaArrowDown, FaBox, FaKey,
  FaSpinner, FaSignOutAlt, FaClipboardList, FaUser, FaEdit
} from 'react-icons/fa'
import { 
  getPendingAccounts, 
  getApprovedAccounts, 
  getRejectedAccounts, 
  approveAccount, 
  rejectAccount,
  getTransactionsByAccount,
  getLockerBookings,
  getAllLockerBookings,
  getPendingLockerBookings,
  approveLockerBooking,
  rejectLockerBooking,
  getPendingServiceRequests,
  getAllServiceRequests,
  approveServiceRequest,
  rejectServiceRequest
} from '../services/api'
import '../styles/AdminDashboard.css'

/* ── helpers ── */
const fmt       = (v) => v || '—'
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtMoney  = (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—'
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    Pending:  'adm-badge adm-badge--pending',
    Approved: 'adm-badge adm-badge--approved',
    Rejected: 'adm-badge adm-badge--rejected',
  }
  return <span className={map[status] || 'adm-badge'}>{status}</span>
}

/* ── KYC file preview card ── */
function KycFileCard({ doc, label }) {
  const [zoomed, setZoomed] = useState(false)

  if (!doc) return (
    <div className="adm-kyc-card adm-kyc-card--empty">
      <FaFileAlt className="adm-kyc-card__empty-icon" />
      <span>No {label} uploaded</span>
    </div>
  )

  const isPdf = doc.fileType === 'application/pdf'
  const isImg = doc.fileType?.startsWith('image/')
  const hasData = !!doc.fileData

  return (
    <>
      <div className="adm-kyc-card">
        {/* ── Header row ── */}
        <div className="adm-kyc-card__header">
          {isPdf
            ? <FaFilePdf    className="adm-kyc-card__type-icon adm-kyc-card__type-icon--pdf" />
            : <FaFileImage  className="adm-kyc-card__type-icon adm-kyc-card__type-icon--img" />
          }
          <div className="adm-kyc-card__meta-block">
            <div className="adm-kyc-card__title">{label}</div>
            <div className="adm-kyc-card__filename" title={doc.fileName}>{doc.fileName}</div>
            <div className="adm-kyc-card__size">
              {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
              {doc.uploadedAt ? ` · Uploaded ${fmtDate(doc.uploadedAt)}` : ''}
            </div>
          </div>
          {doc.verified
            ? <span className="adm-badge adm-badge--approved" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <FaCheck style={{ marginRight: 4 }} />Verified
              </span>
            : <span className="adm-badge adm-badge--pending" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <FaClock style={{ marginRight: 4 }} />Pending
              </span>
          }
        </div>

        {/* ── Preview area ── */}
        <div className="adm-kyc-card__preview-wrap">
          {!hasData ? (
            /* File data not stored — old registration before base64 was added */
            <div className="adm-kyc-card__no-data">
              <FaFileAlt className="adm-kyc-card__no-data-icon" />
              <p className="adm-kyc-card__no-data-title">Preview not available</p>
              <p className="adm-kyc-card__no-data-sub">
                This document was submitted before file storage was enabled.
                The applicant must re-upload for preview.
              </p>
            </div>
          ) : isImg ? (
            /* Image preview — click to zoom */
            <div className="adm-kyc-card__img-wrap" onClick={() => setZoomed(true)} title="Click to enlarge">
              <img src={doc.fileData} alt={label} className="adm-kyc-card__img" />
              <div className="adm-kyc-card__img-overlay">
                <FaEye /> Click to enlarge
              </div>
            </div>
          ) : isPdf ? (
            /* PDF — inline iframe preview */
            <div className="adm-kyc-card__pdf-wrap">
              <iframe
                src={doc.fileData}
                title={`${label} preview`}
                className="adm-kyc-card__pdf-iframe"
              />
              <div className="adm-kyc-card__pdf-note">
                <FaFilePdf /> If the PDF does not render, use the Download button below.
              </div>
            </div>
          ) : (
            <div className="adm-kyc-card__no-data">
              <FaFileAlt className="adm-kyc-card__no-data-icon" />
              <p className="adm-kyc-card__no-data-title">Unsupported format</p>
              <p className="adm-kyc-card__no-data-sub">Use the download button to view this file.</p>
            </div>
          )}
        </div>

        {/* ── Action buttons ── */}
        <div className="adm-kyc-card__actions">
          {hasData && isImg && (
            <button
              type="button"
              className="adm-kyc-card__btn"
              onClick={() => setZoomed(true)}
            >
              <FaEye /> Full Preview
            </button>
          )}
          {hasData && isPdf && (
            <a
              href={doc.fileData}
              target="_blank"
              rel="noreferrer"
              className="adm-kyc-card__btn"
            >
              <FaExternalLinkAlt /> Open PDF
            </a>
          )}
          {hasData ? (
            <a
              href={doc.fileData}
              download={doc.fileName}
              className="adm-kyc-card__btn adm-kyc-card__btn--dl"
            >
              <FaDownload /> Download
            </a>
          ) : (
            <span className="adm-kyc-card__btn adm-kyc-card__btn--disabled">
              <FaDownload /> Not Available
            </span>
          )}
        </div>
      </div>

      {/* ── Lightbox for image zoom ── */}
      {zoomed && isImg && (
        <div className="adm-lightbox" onClick={() => setZoomed(false)}>
          <button className="adm-lightbox__close" onClick={() => setZoomed(false)} aria-label="Close preview">
            <FaTimes />
          </button>
          <div className="adm-lightbox__label">{label} — {doc.fileName}</div>
          <img
            src={doc.fileData}
            alt={label}
            className="adm-lightbox__img"
            onClick={e => e.stopPropagation()}
          />
          <div className="adm-lightbox__hint">Click outside the image to close</div>
        </div>
      )}
    </>
  )
}

/* ── Info grid item ── */
function InfoItem({ icon, label, value }) {
  return (
    <div className="adm-info-item">
      <div className="adm-info-item__icon">{icon}</div>
      <div className="adm-info-item__label">{label}</div>
      <div className="adm-info-item__value">{value || '—'}</div>
    </div>
  )
}

/* ── Confirm dialog ── */
function ConfirmDialog({ action, account, onConfirm, onCancel }) {
  const isApprove = action === 'Approved'
  return (
    <div className="adm-confirm-overlay" onClick={onCancel}>
      <div className="adm-confirm-box" onClick={e => e.stopPropagation()}>
        <div className={`adm-confirm-box__icon ${isApprove ? 'adm-confirm-box__icon--approve' : 'adm-confirm-box__icon--reject'}`}>
          {isApprove ? <FaUserCheck /> : <FaUserTimes />}
        </div>
        <h3 className="adm-confirm-box__title">
          {isApprove ? 'Approve Account?' : 'Reject Account?'}
        </h3>
        <p className="adm-confirm-box__desc">
          {isApprove
            ? <><strong>{account.firstName} {account.lastName}</strong>'s account will be <strong>activated</strong>. They can log in immediately.</>
            : <><strong>{account.firstName} {account.lastName}</strong>'s application will be <strong>rejected</strong> and moved to Removed.</>
          }
        </p>
        <div className="adm-confirm-box__actions">
          <button className="adm-confirm-box__cancel" onClick={onCancel}>Cancel</button>
          <button
            className={`adm-confirm-box__ok ${isApprove ? 'adm-confirm-box__ok--approve' : 'adm-confirm-box__ok--reject'}`}
            onClick={onConfirm}
          >
            {isApprove ? 'Yes, Approve' : 'Yes, Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ACCOUNT DETAIL MODAL — tabbed for approved accounts
══════════════════════════════════════════════════════════ */
function AccountDetailModal({ account, onClose, onConfirm }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [transactions, setTransactions] = useState([])
  const [lockerBookings, setLockerBookings] = useState([])
  const [loading, setLoading] = useState(false)

  /* Fetch transactions and locker bookings from MongoDB */
  useEffect(() => {
    const fetchData = async () => {
      if (account.status === 'Approved') {
        setLoading(true)
        try {
          const [txnRes, lockerRes] = await Promise.all([
            getTransactionsByAccount(account.accountNumber),
            getLockerBookings(account.accountNumber)
          ])
          if (txnRes.success) setTransactions(txnRes.transactions || [])
          if (lockerRes.success) setLockerBookings(lockerRes.data || [])
        } catch (error) {
          console.error('Error fetching account data:', error)
        }
        setLoading(false)
      }
    }
    fetchData()
  }, [account.accountNumber, account.status])

  /* Tabs — extra tabs only for approved accounts */
  const tabs = [
    { key: 'overview',   label: 'Overview',          icon: <FaUsers /> },
    ...(account.status === 'Approved' ? [
      { key: 'statement', label: 'Account Statement', icon: <FaHistory /> },
      { key: 'locker',    label: 'Locker Requests',   icon: <FaBox /> },
    ] : []),
    { key: 'kyc',        label: 'KYC Documents',      icon: <FaIdCard /> },
  ]

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal adm-modal--tabbed" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="adm-modal__header">
          <div className="adm-modal__avatar">
            {(account.firstName?.[0] || '?').toUpperCase()}
          </div>
          <div className="adm-modal__header-info">
            <h2 className="adm-modal__name">{account.firstName} {account.lastName}</h2>
            <div className="adm-modal__header-meta">
              <span className="adm-table__mono">{account.accountNumber}</span>
              <StatusBadge status={account.status} />
              <span className="adm-modal__applied">Applied {fmtDate(account.createdAt)}</span>
            </div>
          </div>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className="adm-modal__tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`adm-modal__tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab body ── */}
        <div className="adm-modal__body">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <>
              <div className="adm-modal__row">
                <div className="adm-modal__section">
                  <div className="adm-modal__section-title"><FaUsers /> Personal Information</div>
                  <div className="adm-info-grid">
                    <InfoItem icon={<FaUsers />}       label="First Name"    value={account.firstName} />
                    <InfoItem icon={<FaUsers />}       label="Last Name"     value={account.lastName} />
                    <InfoItem icon={<FaEnvelope />}    label="Email"         value={account.email} />
                    <InfoItem icon={<FaPhone />}       label="Phone"         value={account.phone} />
                    <InfoItem icon={<FaCalendarAlt />} label="Date of Birth" value={fmtDate(account.dateOfBirth)} />
                    <InfoItem icon={<FaCalendarAlt />} label="Age"           value={account.age ? `${account.age} years` : '—'} />
                    <InfoItem icon={<FaVenusMars />}   label="Gender"        value={capitalize(account.gender)} />
                  </div>
                </div>
                <div className="adm-modal__section">
                  <div className="adm-modal__section-title"><FaUniversity /> Account Details</div>
                  <div className="adm-info-grid">
                    <InfoItem icon={<FaUniversity />}    label="Account Type"    value={capitalize(account.accountType)} />
                    <InfoItem icon={<FaMoneyBillWave />} label="Initial Deposit" value={fmtMoney(account.initialDeposit)} />
                    <InfoItem icon={<FaMoneyBillWave />} label="Current Balance" value={fmtMoney(account.balance)} />
                    <InfoItem icon={<FaLock />}          label="Username"        value={account.username} />
                    <InfoItem icon={<FaCalendarAlt />}   label="Applied On"      value={fmtDate(account.createdAt)} />
                    {account.approvedAt && <InfoItem icon={<FaUserCheck />} label="Approved On" value={fmtDate(account.approvedAt)} />}
                    {account.rejectedAt && <InfoItem icon={<FaUserTimes />} label="Rejected On" value={fmtDate(account.rejectedAt)} />}
                  </div>
                </div>
              </div>
              <div className="adm-modal__section adm-modal__section--full">
                <div className="adm-modal__section-title"><FaMapMarkerAlt /> Address Information</div>
                <div className="adm-info-grid adm-info-grid--4">
                  <InfoItem icon={<FaMapMarkerAlt />} label="Address"  value={account.address} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="City"     value={account.city} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="State"    value={account.state} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="PIN Code" value={account.pincode} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="Country"  value={account.country} />
                </div>
              </div>
            </>
          )}

          {/* ── ACCOUNT STATEMENT ── */}
          {activeTab === 'statement' && (
            <div className="adm-modal__section adm-modal__section--full">
              <div className="adm-modal__section-title"><FaHistory /> Transaction History</div>

              {/* Balance summary */}
              <div className="adm-stmt-summary">
                <div className="adm-stmt-summary__item">
                  <div className="adm-stmt-summary__label">Current Balance</div>
                  <div className="adm-stmt-summary__value adm-stmt-summary__value--gold">{fmtMoney(account.balance)}</div>
                </div>
                <div className="adm-stmt-summary__item">
                  <div className="adm-stmt-summary__label">Total Transactions</div>
                  <div className="adm-stmt-summary__value">{transactions.length}</div>
                </div>
                <div className="adm-stmt-summary__item">
                  <div className="adm-stmt-summary__label">Total Credits</div>
                  <div className="adm-stmt-summary__value adm-stmt-summary__value--green">
                    {fmtMoney(transactions.filter(t => t.recipientAccount === account.accountNumber).reduce((s, t) => s + parseFloat(t.amount || 0), 0).toFixed(2))}
                  </div>
                </div>
                <div className="adm-stmt-summary__item">
                  <div className="adm-stmt-summary__label">Total Debits</div>
                  <div className="adm-stmt-summary__value adm-stmt-summary__value--red">
                    {fmtMoney(transactions.filter(t => t.senderAccount === account.accountNumber).reduce((s, t) => s + parseFloat(t.amount || 0), 0).toFixed(2))}
                  </div>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="adm-empty" style={{ padding: '40px 0' }}>
                  <div className="adm-empty__icon"><FaHistory /></div>
                  <p className="adm-empty__title">No transactions yet</p>
                  <p className="adm-empty__sub">This account has not made any fund transfers.</p>
                </div>
              ) : (
                <div className="adm-stmt-table-wrap">
                  <table className="adm-stmt-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Description</th>
                        <th>Counterparty</th>
                        <th>Amount</th>
                        <th>Balance After</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, i) => {
                        const isCredit = t.recipientAccount === account.accountNumber
                        return (
                          <tr key={t.id || i} className="adm-stmt-table__row">
                            <td className="adm-stmt-table__date">
                              <div>{t.date}</div>
                              <div className="adm-stmt-table__time">{t.time}</div>
                            </td>
                            <td>{t.description || '—'}</td>
                            <td>
                              {isCredit
                                ? <span>{t.senderName || t.senderAccount}</span>
                                : <span>{t.recipientName || t.recipientAccount}</span>
                              }
                            </td>
                            <td>
                              <span className={`adm-stmt-table__amount ${isCredit ? 'adm-stmt-table__amount--credit' : 'adm-stmt-table__amount--debit'}`}>
                                {isCredit ? <FaArrowDown /> : <FaArrowUp />}
                                ₹{parseFloat(t.amount).toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="adm-stmt-table__balance">
                              {t.balanceAfter ? `₹${parseFloat(t.balanceAfter).toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td>
                              <span className={`adm-badge ${isCredit ? 'adm-badge--approved' : 'adm-badge--pending'}`}>
                                {isCredit ? 'Credit' : 'Debit'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── LOCKER REQUESTS ── */}
          {activeTab === 'locker' && (
            <div className="adm-modal__section adm-modal__section--full">
              <div className="adm-modal__section-title"><FaBox /> Locker Booking Requests</div>

              {lockerBookings.length === 0 ? (
                <div className="adm-empty" style={{ padding: '40px 0' }}>
                  <div className="adm-empty__icon"><FaBox /></div>
                  <p className="adm-empty__title">No locker requests</p>
                  <p className="adm-empty__sub">This account has not submitted any locker booking requests.</p>
                </div>
              ) : (
                <div className="adm-locker-grid">
                  {lockerBookings.map((b, i) => (
                    <div key={b.id || i} className="adm-locker-card">
                      <div className="adm-locker-card__header">
                        <div className="adm-locker-card__icon"><FaBox /></div>
                        <div>
                          <div className="adm-locker-card__number">{b.lockerNumber}</div>
                          <span className={`adm-badge ${b.status === 'Booked' ? 'adm-badge--approved' : 'adm-badge--pending'}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                      <div className="adm-locker-card__rows">
                        <div className="adm-locker-card__row">
                          <span className="adm-locker-card__label">Locker Type</span>
                          <span className="adm-locker-card__value">{b.lockerType}</span>
                        </div>
                        <div className="adm-locker-card__row">
                          <span className="adm-locker-card__label">Booked On</span>
                          <span className="adm-locker-card__value">{fmtDate(b.bookedOn)}</span>
                        </div>
                        <div className="adm-locker-card__row">
                          <span className="adm-locker-card__label">Approx. Value</span>
                          <span className="adm-locker-card__value adm-locker-card__value--gold">
                            {fmtMoney(b.approximateValue)}
                          </span>
                        </div>
                        <div className="adm-locker-card__row adm-locker-card__row--full">
                          <span className="adm-locker-card__label">Item Details</span>
                          <span className="adm-locker-card__value">{b.itemDetails || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── KYC DOCUMENTS ── */}
          {activeTab === 'kyc' && (
            <div className="adm-modal__section adm-modal__section--full">
              <div className="adm-modal__section-title"><FaIdCard /> KYC Documents</div>
              {account.kyc ? (
                <div className="adm-kyc-grid">
                  <KycFileCard doc={account.kyc.panCard}     label="PAN Card" />
                  <KycFileCard doc={account.kyc.aadhaarCard} label="Aadhaar Card" />
                </div>
              ) : (
                <p className="adm-no-kyc">No KYC documents were submitted with this application.</p>
              )}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="adm-modal__footer">
          {account.status === 'Pending' ? (
            <>
              <div className="adm-modal__footer-note">
                <FaShieldAlt /> Review all details and KYC documents before taking action.
              </div>
              <div className="adm-modal__footer-actions">
                <button className="adm-modal__btn adm-modal__btn--reject"
                  onClick={() => onConfirm('Rejected')}>
                  <FaTimes /> Reject Application
                </button>
                <button className="adm-modal__btn adm-modal__btn--approve"
                  onClick={() => onConfirm('Approved')}>
                  <FaCheck /> Approve Account
                </button>
              </div>
            </>
          ) : (
            <div className={`adm-modal__status-info ${account.status === 'Approved' ? 'adm-modal__status-info--green' : 'adm-modal__status-info--red'}`}>
              {account.status === 'Approved'
                ? <><FaUserCheck /> Account is <strong>active</strong>. Approved on {fmtDate(account.approvedAt)}.</>
                : <><FaUserTimes /> Account was <strong>rejected</strong> on {fmtDate(account.rejectedAt)}.</>
              }
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab]   = useState('pending')
  const [accounts, setAccounts]     = useState([])
  const [lockerRequests, setLockerRequests] = useState([])
  const [serviceRequests, setServiceRequests] = useState([])
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [confirm, setConfirm]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [lockerLoading, setLockerLoading] = useState(false)
  const [lockerActionLoading, setLockerActionLoading] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(false)
  const [serviceActionLoading, setServiceActionLoading] = useState(null)
  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // Check admin authentication on mount
  useEffect(() => {
    const adminSession = sessionStorage.getItem('adminSession')
    if (!adminSession) {
      navigate('/login', { replace: true })
      return
    }
    
    try {
      const session = JSON.parse(adminSession)
      if (!session.isAdmin) {
        navigate('/login', { replace: true })
        return
      }
      setIsAuthenticated(true)
    } catch {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  // Admin logout handler
  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminSession')
    navigate('/', { replace: true })
  }

  /* Fetch all accounts and locker requests from MongoDB on mount */
  useEffect(() => {
    if (!isAuthenticated) return
    
    const fetchAllData = async () => {
      setLoading(true)
      try {
        const [pendingRes, approvedRes, rejectedRes, lockerRes, serviceRes] = await Promise.all([
          getPendingAccounts(),
          getApprovedAccounts(),
          getRejectedAccounts(),
          getAllLockerBookings(),
          getAllServiceRequests()
        ])
        
        const allAccounts = [
          ...(pendingRes.success ? pendingRes.data : []),
          ...(approvedRes.success ? approvedRes.data : []),
          ...(rejectedRes.success ? rejectedRes.data : [])
        ]
        setAccounts(allAccounts)
        
        if (lockerRes.success) {
          setLockerRequests(lockerRes.data || [])
        }
        
        if (serviceRes.success) {
          setServiceRequests(serviceRes.data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setLoading(false)
    }
    fetchAllData()
  }, [isAuthenticated])

  // Handle locker approval
  const handleApproveLocker = async (bookingId) => {
    setLockerActionLoading(bookingId)
    try {
      const response = await approveLockerBooking(bookingId, { adminRemarks: 'Approved by admin' })
      if (response.success) {
        setLockerRequests(prev => prev.map(l => 
          l._id === bookingId ? { ...l, ...response.data } : l
        ))
      }
    } catch (error) {
      console.error('Error approving locker:', error)
    }
    setLockerActionLoading(null)
  }

  // Handle locker rejection
  const handleRejectLocker = async (bookingId, reason = '') => {
    setLockerActionLoading(bookingId)
    try {
      const response = await rejectLockerBooking(bookingId, { 
        rejectionReason: reason || 'Does not meet criteria',
        adminRemarks: 'Rejected by admin'
      })
      if (response.success) {
        setLockerRequests(prev => prev.map(l => 
          l._id === bookingId ? { ...l, ...response.data } : l
        ))
      }
    } catch (error) {
      console.error('Error rejecting locker:', error)
    }
    setLockerActionLoading(null)
  }

  // Handle service request approval
  const handleApproveServiceRequest = async (requestId) => {
    setServiceActionLoading(requestId)
    try {
      const response = await approveServiceRequest(requestId, 'Approved by admin')
      if (response.success) {
        setServiceRequests(prev => prev.map(r => 
          r._id === requestId ? { ...r, ...response.data } : r
        ))
        setSelectedServiceRequest(null)
      }
    } catch (error) {
      console.error('Error approving service request:', error)
    }
    setServiceActionLoading(null)
  }

  // Handle service request rejection
  const handleRejectServiceRequest = async (requestId, reason = '') => {
    setServiceActionLoading(requestId)
    try {
      const response = await rejectServiceRequest(requestId, reason || 'Rejected by admin')
      if (response.success) {
        setServiceRequests(prev => prev.map(r => 
          r._id === requestId ? { ...r, ...response.data } : r
        ))
        setSelectedServiceRequest(null)
        setRejectReason('')
      }
    } catch (error) {
      console.error('Error rejecting service request:', error)
    }
    setServiceActionLoading(null)
  }

  const updateStatus = async (id, status) => {
    try {
      const account = accounts.find(a => a.id === id || a._id === id)
      if (!account) return

      let response
      if (status === 'Approved') {
        response = await approveAccount(account.accountNumber)
      } else {
        response = await rejectAccount(account.accountNumber)
      }

      if (response.success) {
        // Update local state
        setAccounts(prev => prev.map(a =>
          (a.id === id || a._id === id) 
            ? { ...a, status, [`${status.toLowerCase()}At`]: new Date().toISOString() } 
            : a
        ))
        setSelected(prev => (prev?.id === id || prev?._id === id) ? { ...prev, status } : prev)
      }
    } catch (error) {
      console.error('Error updating account status:', error)
    }
    setConfirm(null)
  }

  const q = search.toLowerCase()
  const filterList = (list) => !q ? list : list.filter(a =>
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
    (a.email || '').toLowerCase().includes(q) ||
    (a.username || '').toLowerCase().includes(q) ||
    (a.accountNumber || '').toLowerCase().includes(q) ||
    (a.phone || '').includes(q)
  )

  const pending  = useMemo(() => filterList(accounts.filter(a => a.status === 'Pending')),  [accounts, q])
  const approved = useMemo(() => filterList(accounts.filter(a => a.status === 'Approved')), [accounts, q])
  const removed  = useMemo(() => filterList(accounts.filter(a => a.status === 'Rejected')), [accounts, q])

  // Locker requests counts
  const pendingLockers = lockerRequests.filter(l => l.status === 'Pending')
  const approvedLockers = lockerRequests.filter(l => l.status === 'Approved')
  const rejectedLockers = lockerRequests.filter(l => l.status === 'Rejected')

  // Service requests counts
  const pendingServices = serviceRequests.filter(s => s.status === 'Pending')
  const approvedServices = serviceRequests.filter(s => s.status === 'Approved')
  const rejectedServices = serviceRequests.filter(s => s.status === 'Rejected')

  const tabs = [
    { key: 'pending',  label: 'Pending Approvals', icon: <FaClock />,     count: accounts.filter(a => a.status === 'Pending').length },
    { key: 'approved', label: 'Approved Accounts', icon: <FaUserCheck />, count: accounts.filter(a => a.status === 'Approved').length },
    { key: 'removed',  label: 'Removed Accounts',  icon: <FaUserTimes />, count: accounts.filter(a => a.status === 'Rejected').length },
    { key: 'lockers',  label: 'Locker Requests',   icon: <FaBox />,       count: pendingLockers.length, alert: pendingLockers.length > 0 },
    { key: 'services', label: 'Service Requests',  icon: <FaClipboardList />, count: pendingServices.length, alert: pendingServices.length > 0 },
  ]

  const currentList = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : activeTab === 'removed' ? removed : []

  /* ── Table row ── */
  const Row = ({ account }) => (
    <tr className="adm-table__row" onClick={() => setSelected(account)}>
      <td>
        <div className="adm-table__name">
          <div className="adm-table__avatar">{(account.firstName?.[0] || '?').toUpperCase()}</div>
          <div>
            <div className="adm-table__fullname">{account.firstName} {account.lastName}</div>
            <div className="adm-table__sub">{account.email}</div>
          </div>
        </div>
      </td>
      <td><span className="adm-table__mono">{account.accountNumber}</span></td>
      <td>{capitalize(account.accountType)}</td>
      <td>{account.phone}</td>
      <td>{fmtDate(account.createdAt)}</td>
      <td><StatusBadge status={account.status} /></td>
      <td>
        <button className="adm-view-btn" onClick={e => { e.stopPropagation(); setSelected(account) }}>
          <FaEye /> View Details
        </button>
      </td>
    </tr>
  )

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="adm-loading-screen">
        <FaSpinner className="adm-loading-spinner" />
        <p>Verifying authentication...</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="adm-page">
        <Breadcrumbs items={[{ label: 'Admin Dashboard', path: '/admin-dashboard' }]} />

        <div className="adm-layout">

          {/* ── SIDEBAR ── */}
          <aside className="adm-sidebar">
            <div className="adm-sidebar__brand">
              <div className="adm-sidebar__brand-icon"><FaShieldAlt /></div>
              <div>
                <div className="adm-sidebar__brand-name">Admin Panel</div>
                <div className="adm-sidebar__brand-sub">VJN Bank</div>
              </div>
            </div>

            <div className="adm-sidebar__nav">
              {tabs.map(t => (
                <button
                  key={t.key}
                  className={`adm-sidebar__item${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => { setActiveTab(t.key); setSearch(''); setSelected(null) }}
                >
                  <span className="adm-sidebar__item-icon">{t.icon}</span>
                  <span className="adm-sidebar__item-label">{t.label}</span>
                  <span className={`adm-sidebar__item-count${(t.key === 'pending' || t.alert) && t.count > 0 ? ' adm-sidebar__item-count--alert' : ''}`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="adm-sidebar__stats">
              <div className="adm-sidebar__stat">
                <FaUsers className="adm-sidebar__stat-icon" />
                <div>
                  <div className="adm-sidebar__stat-val">{accounts.length}</div>
                  <div className="adm-sidebar__stat-lbl">Total Applications</div>
                </div>
              </div>
              <div className="adm-sidebar__stat">
                <FaUserCheck className="adm-sidebar__stat-icon adm-sidebar__stat-icon--green" />
                <div>
                  <div className="adm-sidebar__stat-val">{accounts.filter(a => a.status === 'Approved').length}</div>
                  <div className="adm-sidebar__stat-lbl">Active Accounts</div>
                </div>
              </div>
              <div className="adm-sidebar__stat">
                <FaBox className="adm-sidebar__stat-icon adm-sidebar__stat-icon--gold" />
                <div>
                  <div className="adm-sidebar__stat-val">{pendingLockers.length}</div>
                  <div className="adm-sidebar__stat-lbl">Pending Lockers</div>
                </div>
              </div>
            </div>

            {/* Admin Profile & Logout */}
            <div className="adm-sidebar__profile">
              <div className="adm-sidebar__profile-info">
                <div className="adm-sidebar__profile-avatar">
                  <FaShieldAlt />
                </div>
                <div>
                  <div className="adm-sidebar__profile-name">Admin</div>
                  <div className="adm-sidebar__profile-role">Super Administrator</div>
                </div>
              </div>
              <button className="adm-sidebar__logout-btn" onClick={handleAdminLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <section className="adm-main">
            <div className="adm-main__header">
              <div>
                <p className="adm-main__eyebrow">{tabs.find(t => t.key === activeTab)?.label}</p>
                <h1 className="adm-main__title">
                  {activeTab === 'pending'  && 'Pending Account Approvals'}
                  {activeTab === 'approved' && 'Approved Accounts'}
                  {activeTab === 'removed'  && 'Removed / Rejected Accounts'}
                  {activeTab === 'lockers'  && 'Locker Booking Requests'}
                    {activeTab === 'services' && 'Service Requests'}
                </h1>
              </div>
              <div className="adm-search">
                <FaSearch className="adm-search__icon" />
                <input
                  type="text"
                  className="adm-search__input"
                  placeholder="Search by name, email, phone…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Stats strip */}
            {/* Stats strip - only show for account tabs (pending/approved/removed) */}
            {['pending', 'approved', 'removed'].includes(activeTab) && (
              <div className="adm-stats-strip">
                {[
                  { icon: <FaClock />,     label: 'Pending',  val: accounts.filter(a => a.status === 'Pending').length,  cls: 'adm-stat--pending' },
                  { icon: <FaUserCheck />, label: 'Approved', val: accounts.filter(a => a.status === 'Approved').length, cls: 'adm-stat--approved' },
                  { icon: <FaUserTimes />, label: 'Rejected', val: accounts.filter(a => a.status === 'Rejected').length, cls: 'adm-stat--rejected' },
                  { icon: <FaUsers />,     label: 'Total',    val: accounts.length,                                       cls: '' },
                ].map((s, i) => (
                  <div key={i} className={`adm-stat ${s.cls}`}>
                    <div className="adm-stat__icon">{s.icon}</div>
                    <div className="adm-stat__val">{s.val}</div>
                    <div className="adm-stat__lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Locker stats strip */}
            {activeTab === 'lockers' && (
              <div className="adm-stats-strip">
                {[
                  { icon: <FaClock />,     label: 'Pending',  val: pendingLockers.length,  cls: 'adm-stat--pending' },
                  { icon: <FaCheck />,     label: 'Approved', val: approvedLockers.length, cls: 'adm-stat--approved' },
                  { icon: <FaTimes />,     label: 'Rejected', val: rejectedLockers.length, cls: 'adm-stat--rejected' },
                  { icon: <FaBox />,       label: 'Total',    val: lockerRequests.length,  cls: '' },
                ].map((s, i) => (
                  <div key={i} className={`adm-stat ${s.cls}`}>
                    <div className="adm-stat__icon">{s.icon}</div>
                    <div className="adm-stat__val">{s.val}</div>
                    <div className="adm-stat__lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Locker Requests Table */}
            {activeTab === 'lockers' && (
              <div className="adm-table-card">
                {lockerRequests.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty__icon"><FaBox /></div>
                    <p className="adm-empty__title">No locker requests</p>
                    <p className="adm-empty__sub">No locker booking requests have been submitted yet.</p>
                  </div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Account No.</th>
                          <th>Locker Type</th>
                          <th>Annual Rent</th>
                          <th>Requested On</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lockerRequests.map(locker => (
                          <tr key={locker._id} className="adm-table__row">
                            <td>
                              <div className="adm-table__name">
                                <div className="adm-table__avatar">{(locker.userName?.[0] || '?').toUpperCase()}</div>
                                <div>
                                  <div className="adm-table__fullname">{locker.userName}</div>
                                  <div className="adm-table__sub">{locker.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="adm-table__mono">{locker.accountNumber}</span></td>
                            <td>
                              <span className="adm-locker-type">{locker.lockerType}</span>
                              <div className="adm-table__sub">{locker.lockerSize}</div>
                            </td>
                            <td>{fmtMoney(locker.annualRent)}</td>
                            <td>{fmtDate(locker.createdAt)}</td>
                            <td><StatusBadge status={locker.status} /></td>
                            <td>
                              {locker.status === 'Pending' ? (
                                <div className="adm-action-btns">
                                  <button 
                                    className="adm-btn adm-btn--approve"
                                    onClick={() => handleApproveLocker(locker._id)}
                                    disabled={lockerActionLoading === locker._id}
                                  >
                                    {lockerActionLoading === locker._id ? <FaSpinner className="spin" /> : <FaCheck />}
                                    Approve
                                  </button>
                                  <button 
                                    className="adm-btn adm-btn--reject"
                                    onClick={() => handleRejectLocker(locker._id)}
                                    disabled={lockerActionLoading === locker._id}
                                  >
                                    {lockerActionLoading === locker._id ? <FaSpinner className="spin" /> : <FaTimes />}
                                    Reject
                                  </button>
                                </div>
                              ) : locker.status === 'Approved' ? (
                                <div className="adm-locker-approved">
                                  <FaKey className="adm-locker-approved__icon" />
                                  <div>
                                    <div className="adm-locker-approved__num">{locker.assignedLockerNumber}</div>
                                    <div className="adm-locker-approved__branch">{locker.assignedBranch}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="adm-rejected-text">
                                  {locker.rejectionReason || 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Service Requests Stats */}
            {activeTab === 'services' && (
              <div className="adm-stat-row">
                {[
                  { icon: <FaClock />,          val: pendingServices.length,  label: 'Pending Requests', cls: 'warning' },
                  { icon: <FaCheck />,          val: approvedServices.length, label: 'Approved',         cls: 'success' },
                  { icon: <FaTimes />,          val: rejectedServices.length, label: 'Rejected',         cls: 'danger' },
                  { icon: <FaClipboardList />, val: serviceRequests.length,  label: 'Total',            cls: '' },
                ].map((s, i) => (
                  <div key={i} className={`adm-stat ${s.cls ? 'adm-stat--' + s.cls : ''}`}>
                    <div className="adm-stat__icon">{s.icon}</div>
                    <div className="adm-stat__val">{s.val}</div>
                    <div className="adm-stat__lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Service Requests Table */}
            {activeTab === 'services' && (
              <div className="adm-table-card">
                {serviceRequests.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty__icon"><FaClipboardList /></div>
                    <p className="adm-empty__title">No service requests</p>
                    <p className="adm-empty__sub">No service requests have been submitted yet.</p>
                  </div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Account No.</th>
                          <th>Request Type</th>
                          <th>Category</th>
                          <th>Requested On</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceRequests.map(request => (
                          <tr key={request._id} className="adm-table__row" onClick={() => setSelectedServiceRequest(request)}>
                            <td>
                              <div className="adm-table__name">
                                <div className="adm-table__avatar">{(request.userName?.[0] || '?').toUpperCase()}</div>
                                <div>
                                  <div className="adm-table__fullname">{request.userName}</div>
                                  <div className="adm-table__sub">{request.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="adm-table__mono">{request.accountNumber}</span></td>
                            <td>
                              <span className="adm-request-type">{request.requestType}</span>
                            </td>
                            <td>{capitalize(request.category)}</td>
                            <td>{fmtDate(request.createdAt)}</td>
                            <td><StatusBadge status={request.status} /></td>
                            <td>
                              {request.status === 'Pending' ? (
                                <div className="adm-action-btns">
                                  <button 
                                    className="adm-btn adm-btn--approve"
                                    onClick={(e) => { e.stopPropagation(); handleApproveServiceRequest(request._id) }}
                                    disabled={serviceActionLoading === request._id}
                                  >
                                    {serviceActionLoading === request._id ? <FaSpinner className="spin" /> : <FaCheck />}
                                    Approve
                                  </button>
                                  <button 
                                    className="adm-btn adm-btn--reject"
                                    onClick={(e) => { e.stopPropagation(); setSelectedServiceRequest(request) }}
                                    disabled={serviceActionLoading === request._id}
                                  >
                                    <FaEye /> View
                                  </button>
                                </div>
                              ) : request.status === 'Approved' ? (
                                <span className="adm-approved-text">
                                  <FaCheck /> Changes Applied
                                </span>
                              ) : (
                                <span className="adm-rejected-text">
                                  {request.rejectionReason || 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Account Table - only for account tabs */}
            {activeTab !== 'lockers' && activeTab !== 'services' && (
              <div className="adm-table-card">
                {currentList.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty__icon">
                      {activeTab === 'pending' ? <FaClock /> : activeTab === 'approved' ? <FaUserCheck /> : <FaUserTimes />}
                    </div>
                    <p className="adm-empty__title">{search ? 'No results found' : `No ${activeTab} accounts`}</p>
                    <p className="adm-empty__sub">{search ? 'Try a different search term.' : 'Nothing here yet.'}</p>
                  </div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Account No.</th>
                          <th>Type</th>
                          <th>Phone</th>
                          <th>Applied On</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentList.map(a => <Row key={a.id || a._id} account={a} />)}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════
          FULL-SCREEN DETAIL MODAL (centered, wide)
      ══════════════════════════════════════════════════════ */}
      {selected && (
        <AccountDetailModal
          account={selected}
          onClose={() => setSelected(null)}
          onConfirm={(action) => setConfirm({ action, account: selected })}
        />
      )}

      {/* ── Confirm dialog ── */}
      {confirm && (
        <ConfirmDialog
          action={confirm.action}
          account={confirm.account}
          onConfirm={() => updateStatus(confirm.account.id, confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Service Request Detail Modal */}
      {selectedServiceRequest && (
        <div className="adm-modal-overlay" onClick={() => setSelectedServiceRequest(null)}>
          <div className="adm-modal adm-modal--service" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <div className="adm-modal__avatar">
                <FaEdit />
              </div>
              <div className="adm-modal__header-info">
                <h2 className="adm-modal__name">Service Request Details</h2>
                <div className="adm-modal__header-meta">
                  <span>{selectedServiceRequest.requestType}</span>
                  <StatusBadge status={selectedServiceRequest.status} />
                </div>
              </div>
              <button className="adm-modal__close" onClick={() => setSelectedServiceRequest(null)} aria-label="Close">
                <FaTimes />
              </button>
            </div>

            <div className="adm-modal__body">
              {/* User Info */}
              <div className="adm-service-section">
                <h4><FaUser /> Applicant Details</h4>
                <div className="adm-info-grid adm-info-grid--2col">
                  <InfoItem icon={<FaUser />} label="Name" value={selectedServiceRequest.userName} />
                  <InfoItem icon={<FaIdCard />} label="Account No." value={selectedServiceRequest.accountNumber} />
                  <InfoItem icon={<FaEnvelope />} label="Email" value={selectedServiceRequest.email} />
                  <InfoItem icon={<FaCalendarAlt />} label="Requested On" value={fmtDate(selectedServiceRequest.createdAt)} />
                </div>
              </div>

              {/* Changes Requested */}
              <div className="adm-service-section">
                <h4><FaEdit /> Changes Requested ({capitalize(selectedServiceRequest.category)})</h4>
                <div className="adm-changes-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Current Value</th>
                        <th>Requested Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedServiceRequest.category === 'personal' && (
                        <>
                          {selectedServiceRequest.oldValues?.firstName !== selectedServiceRequest.newValues?.firstName && (
                            <tr>
                              <td>First Name</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.firstName || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.firstName || '—'}</td>
                            </tr>
                          )}
                          {selectedServiceRequest.oldValues?.lastName !== selectedServiceRequest.newValues?.lastName && (
                            <tr>
                              <td>Last Name</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.lastName || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.lastName || '—'}</td>
                            </tr>
                          )}
                          {selectedServiceRequest.oldValues?.phone !== selectedServiceRequest.newValues?.phone && (
                            <tr>
                              <td>Phone</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.phone || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.phone || '—'}</td>
                            </tr>
                          )}
                        </>
                      )}
                      {selectedServiceRequest.category === 'address' && (
                        <>
                          {selectedServiceRequest.oldValues?.address !== selectedServiceRequest.newValues?.address && (
                            <tr>
                              <td>Address</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.address || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.address || '—'}</td>
                            </tr>
                          )}
                          {selectedServiceRequest.oldValues?.city !== selectedServiceRequest.newValues?.city && (
                            <tr>
                              <td>City</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.city || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.city || '—'}</td>
                            </tr>
                          )}
                          {selectedServiceRequest.oldValues?.state !== selectedServiceRequest.newValues?.state && (
                            <tr>
                              <td>State</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.state || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.state || '—'}</td>
                            </tr>
                          )}
                          {selectedServiceRequest.oldValues?.pincode !== selectedServiceRequest.newValues?.pincode && (
                            <tr>
                              <td>Pincode</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.pincode || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.pincode || '—'}</td>
                            </tr>
                          )}
                        </>
                      )}
                      {selectedServiceRequest.category === 'account' && (
                        <>
                          {selectedServiceRequest.oldValues?.nomineeName !== selectedServiceRequest.newValues?.nomineeName && (
                            <tr>
                              <td>Nominee Name</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.nomineeName || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.nomineeName || '—'}</td>
                            </tr>
                          )}
                          {selectedServiceRequest.oldValues?.nomineeRelation !== selectedServiceRequest.newValues?.nomineeRelation && (
                            <tr>
                              <td>Nominee Relation</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.nomineeRelation || '—'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.nomineeRelation || '—'}</td>
                            </tr>
                          )}
                        </>
                      )}
                      {selectedServiceRequest.category === 'statements' && (
                        <>
                          {selectedServiceRequest.oldValues?.emailStatement !== selectedServiceRequest.newValues?.emailStatement && (
                            <tr>
                              <td>Email Statement</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.emailStatement ? 'Yes' : 'No'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.emailStatement ? 'Yes' : 'No'}</td>
                            </tr>
                          )}
                          {selectedServiceRequest.oldValues?.physicalStatement !== selectedServiceRequest.newValues?.physicalStatement && (
                            <tr>
                              <td>Physical Statement</td>
                              <td className="old-value">{selectedServiceRequest.oldValues?.physicalStatement ? 'Yes' : 'No'}</td>
                              <td className="new-value">{selectedServiceRequest.newValues?.physicalStatement ? 'Yes' : 'No'}</td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Remarks */}
              {selectedServiceRequest.userRemarks && (
                <div className="adm-service-section">
                  <h4><FaFileAlt /> User Remarks</h4>
                  <p className="adm-service-remarks">{selectedServiceRequest.userRemarks}</p>
                </div>
              )}

              {/* Admin Actions */}
              {selectedServiceRequest.status === 'Pending' && (
                <div className="adm-service-actions">
                  <div className="adm-reject-reason">
                    <label>Rejection Reason (if rejecting):</label>
                    <textarea 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows={2}
                    />
                  </div>
                  <div className="adm-action-btns adm-action-btns--modal">
                    <button 
                      className="adm-btn adm-btn--approve adm-btn--lg"
                      onClick={() => handleApproveServiceRequest(selectedServiceRequest._id)}
                      disabled={serviceActionLoading === selectedServiceRequest._id}
                    >
                      {serviceActionLoading === selectedServiceRequest._id ? <FaSpinner className="spin" /> : <FaCheck />}
                      Approve & Apply Changes
                    </button>
                    <button 
                      className="adm-btn adm-btn--reject adm-btn--lg"
                      onClick={() => handleRejectServiceRequest(selectedServiceRequest._id, rejectReason)}
                      disabled={serviceActionLoading === selectedServiceRequest._id}
                    >
                      {serviceActionLoading === selectedServiceRequest._id ? <FaSpinner className="spin" /> : <FaTimes />}
                      Reject Request
                    </button>
                  </div>
                </div>
              )}

              {/* Show status for processed requests */}
              {selectedServiceRequest.status !== 'Pending' && (
                <div className={`adm-service-status ${selectedServiceRequest.status === 'Approved' ? 'adm-service-status--approved' : 'adm-service-status--rejected'}`}>
                  {selectedServiceRequest.status === 'Approved' ? (
                    <>
                      <FaCheck /> Request approved and changes applied on {fmtDate(selectedServiceRequest.reviewedAt)}
                      {selectedServiceRequest.adminRemarks && <p>Admin Remarks: {selectedServiceRequest.adminRemarks}</p>}
                    </>
                  ) : (
                    <>
                      <FaTimes /> Request rejected on {fmtDate(selectedServiceRequest.reviewedAt)}
                      {selectedServiceRequest.rejectionReason && <p>Reason: {selectedServiceRequest.rejectionReason}</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
