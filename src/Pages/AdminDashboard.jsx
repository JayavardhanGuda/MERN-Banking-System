import { useEffect, useState, useMemo } from 'react'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Breadcrumbs from '../Components/Breadcrumbs'
import {
  FaUsers, FaUserCheck, FaUserTimes, FaClock,
  FaSearch, FaEye, FaCheck, FaTimes, FaIdCard,
  FaFileAlt, FaMapMarkerAlt, FaLock, FaEnvelope,
  FaPhone, FaCalendarAlt, FaVenusMars, FaUniversity,
  FaMoneyBillWave, FaShieldAlt, FaDownload,
  FaFilePdf, FaFileImage, FaExternalLinkAlt
} from 'react-icons/fa'
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
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab]   = useState('pending')
  const [accounts, setAccounts]     = useState([])
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [confirm, setConfirm]       = useState(null)

  useEffect(() => {
    setAccounts(JSON.parse(localStorage.getItem('bankAccounts') || '[]'))
  }, [])

  const updateStatus = (id, status) => {
    setAccounts(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, status, [`${status.toLowerCase()}At`]: new Date().toISOString() } : a
      )
      localStorage.setItem('bankAccounts', JSON.stringify(updated))
      return updated
    })
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
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

  const tabs = [
    { key: 'pending',  label: 'Pending Approvals', icon: <FaClock />,     count: accounts.filter(a => a.status === 'Pending').length },
    { key: 'approved', label: 'Approved Accounts', icon: <FaUserCheck />, count: accounts.filter(a => a.status === 'Approved').length },
    { key: 'removed',  label: 'Removed Accounts',  icon: <FaUserTimes />, count: accounts.filter(a => a.status === 'Rejected').length },
  ]

  const currentList = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : removed

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
                <div className="adm-sidebar__brand-sub">PavitraBandham Bank</div>
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
                  <span className={`adm-sidebar__item-count${t.key === 'pending' && t.count > 0 ? ' adm-sidebar__item-count--alert' : ''}`}>
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

            {/* Table */}
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
                      {currentList.map(a => <Row key={a.id} account={a} />)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════
          FULL-SCREEN DETAIL MODAL (centered, wide)
      ══════════════════════════════════════════════════════ */}
      {selected && (
        <div className="adm-modal-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>

            {/* ── Modal header ── */}
            <div className="adm-modal__header">
              <div className="adm-modal__avatar">
                {(selected.firstName?.[0] || '?').toUpperCase()}
              </div>
              <div className="adm-modal__header-info">
                <h2 className="adm-modal__name">{selected.firstName} {selected.lastName}</h2>
                <div className="adm-modal__header-meta">
                  <span className="adm-table__mono">{selected.accountNumber}</span>
                  <StatusBadge status={selected.status} />
                  <span className="adm-modal__applied">Applied {fmtDate(selected.createdAt)}</span>
                </div>
              </div>
              <button className="adm-modal__close" onClick={() => setSelected(null)} aria-label="Close">
                <FaTimes />
              </button>
            </div>

            {/* ── Modal body ── */}
            <div className="adm-modal__body">

              {/* Row 1: Personal + Account */}
              <div className="adm-modal__row">

                {/* Personal Information */}
                <div className="adm-modal__section">
                  <div className="adm-modal__section-title"><FaUsers /> Personal Information</div>
                  <div className="adm-info-grid">
                    <InfoItem icon={<FaUsers />}       label="First Name"    value={selected.firstName} />
                    <InfoItem icon={<FaUsers />}       label="Last Name"     value={selected.lastName} />
                    <InfoItem icon={<FaEnvelope />}    label="Email"         value={selected.email} />
                    <InfoItem icon={<FaPhone />}       label="Phone"         value={selected.phone} />
                    <InfoItem icon={<FaCalendarAlt />} label="Date of Birth" value={fmtDate(selected.dateOfBirth)} />
                    <InfoItem icon={<FaCalendarAlt />} label="Age"           value={selected.age ? `${selected.age} years` : '—'} />
                    <InfoItem icon={<FaVenusMars />}   label="Gender"        value={capitalize(selected.gender)} />
                  </div>
                </div>

                {/* Account Details */}
                <div className="adm-modal__section">
                  <div className="adm-modal__section-title"><FaUniversity /> Account Details</div>
                  <div className="adm-info-grid">
                    <InfoItem icon={<FaUniversity />}    label="Account Type"    value={capitalize(selected.accountType)} />
                    <InfoItem icon={<FaMoneyBillWave />} label="Initial Deposit" value={fmtMoney(selected.initialDeposit)} />
                    <InfoItem icon={<FaMoneyBillWave />} label="Balance"         value={fmtMoney(selected.balance)} />
                    <InfoItem icon={<FaLock />}          label="Username"        value={selected.username} />
                    <InfoItem icon={<FaCalendarAlt />}   label="Applied On"      value={fmtDate(selected.createdAt)} />
                    {selected.approvedAt && <InfoItem icon={<FaUserCheck />} label="Approved On" value={fmtDate(selected.approvedAt)} />}
                    {selected.rejectedAt && <InfoItem icon={<FaUserTimes />} label="Rejected On" value={fmtDate(selected.rejectedAt)} />}
                  </div>
                </div>
              </div>

              {/* Row 2: Address */}
              <div className="adm-modal__section adm-modal__section--full">
                <div className="adm-modal__section-title"><FaMapMarkerAlt /> Address Information</div>
                <div className="adm-info-grid adm-info-grid--4">
                  <InfoItem icon={<FaMapMarkerAlt />} label="Address"  value={selected.address} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="City"     value={selected.city} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="State"    value={selected.state} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="PIN Code" value={selected.pincode} />
                  <InfoItem icon={<FaMapMarkerAlt />} label="Country"  value={selected.country} />
                </div>
              </div>

              {/* Row 3: KYC Documents — full width, side by side */}
              <div className="adm-modal__section adm-modal__section--full">
                <div className="adm-modal__section-title"><FaIdCard /> KYC Documents for Verification</div>
                {selected.kyc ? (
                  <div className="adm-kyc-grid">
                    <KycFileCard doc={selected.kyc.panCard}     label="PAN Card" />
                    <KycFileCard doc={selected.kyc.aadhaarCard} label="Aadhaar Card" />
                  </div>
                ) : (
                  <p className="adm-no-kyc">No KYC documents were submitted with this application.</p>
                )}
              </div>

            </div>

            {/* ── Modal footer ── */}
            <div className="adm-modal__footer">
              {selected.status === 'Pending' ? (
                <>
                  <div className="adm-modal__footer-note">
                    <FaShieldAlt /> Review all details and KYC documents before taking action.
                  </div>
                  <div className="adm-modal__footer-actions">
                    <button
                      className="adm-modal__btn adm-modal__btn--reject"
                      onClick={() => setConfirm({ action: 'Rejected', account: selected })}
                    >
                      <FaTimes /> Reject Application
                    </button>
                    <button
                      className="adm-modal__btn adm-modal__btn--approve"
                      onClick={() => setConfirm({ action: 'Approved', account: selected })}
                    >
                      <FaCheck /> Approve Account
                    </button>
                  </div>
                </>
              ) : (
                <div className={`adm-modal__status-info ${selected.status === 'Approved' ? 'adm-modal__status-info--green' : 'adm-modal__status-info--red'}`}>
                  {selected.status === 'Approved'
                    ? <><FaUserCheck /> Account is <strong>active</strong>. Approved on {fmtDate(selected.approvedAt)}.</>
                    : <><FaUserTimes /> Account was <strong>rejected</strong> on {fmtDate(selected.rejectedAt)}.</>
                  }
                </div>
              )}
            </div>

          </div>
        </div>
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

      <Footer />
    </>
  )
}
