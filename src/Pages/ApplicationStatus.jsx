import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaTimes, FaCheckCircle, FaClock,
  FaTimesCircle, FaShieldAlt, FaArrowRight,
  FaIdCard, FaUser, FaCalendarAlt, FaUniversity
} from 'react-icons/fa';
import '../styles/ApplicationStatus.css';

/* ── Status config ── */
const STATUS_CONFIG = {
  Approved: {
    icon:    <FaCheckCircle />,
    cls:     'as-result--approved',
    iconCls: 'as-result__icon--approved',
    title:   'Account Approved!',
    desc:    'Your account has been verified and activated. You can now log in to access your banking services.',
    cta:     { label: 'Login Now', to: '/login' },
  },
  Pending: {
    icon:    <FaClock />,
    cls:     'as-result--pending',
    iconCls: 'as-result__icon--pending',
    title:   'Application Under Review',
    desc:    'Your application is currently being reviewed by our admin team. This typically takes 1–2 working days.',
    cta:     null,
  },
  Rejected: {
    icon:    <FaTimesCircle />,
    cls:     'as-result--rejected',
    iconCls: 'as-result__icon--rejected',
    title:   'Application Rejected',
    desc:    'Unfortunately your application was not approved. Please contact our support team for more information.',
    cta:     null,
  },
};

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState('');
  const [result, setResult]               = useState(null); // account object
  const [error, setError]                 = useState('');
  const [searched, setSearched]           = useState(false);
  const [modalOpen, setModalOpen]         = useState(false);

  /* Animate in */
  useEffect(() => {
    const t = setTimeout(() => setModalOpen(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Close → go back */
  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.getElementById('root')?.classList.remove('page-blurred');
    document.body.style.overflow = '';
    setTimeout(() => navigate(-1), 280);
  }, [navigate]);

  /* Escape key */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal]);

  /* Blur root */
  useEffect(() => {
    const root = document.getElementById('root');
    if (modalOpen) {
      root?.classList.add('page-blurred');
      document.body.style.overflow = 'hidden';
    } else {
      root?.classList.remove('page-blurred');
      document.body.style.overflow = '';
    }
    return () => {
      root?.classList.remove('page-blurred');
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSearched(false);

    const input = accountNumber.trim();
    if (!input) {
      setError('Please enter your Application ID / Account Number.');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const found = accounts.find(acc =>
      acc.accountNumber === input ||
      acc.accountNumber?.toLowerCase() === input.toLowerCase()
    );

    setSearched(true);
    if (!found) {
      setError('No application found for this ID. Please check and try again.');
      return;
    }

    setResult(found);
  };

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const cfg = result ? STATUS_CONFIG[result.status] || STATUS_CONFIG.Pending : null;

  return (
    <div
      className={`lm-overlay${modalOpen ? ' lm-overlay--visible' : ''}`}
      onClick={closeModal}
      aria-modal="true"
      role="dialog"
      aria-label="Application Status"
    >
      <div
        className={`lm-card as-card${modalOpen ? ' lm-card--open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left strip ── */}
        <div className="lm-card__strip">
          <span className="lm-card__strip-icon">📋</span>
          <div className="lm-card__strip-name">Application Status</div>
          <div className="lm-card__strip-tagline">VJN Cooperative Bank</div>

          <div className="lm-card__strip-features">
            {[
              { icon: <FaIdCard />,    text: 'Track Your Application' },
              { icon: <FaShieldAlt />, text: 'Secure Status Check' },
              { icon: <FaClock />,     text: 'Real-time Updates' },
            ].map((f, i) => (
              <div key={i} className="lm-card__strip-feature">
                <div className="lm-card__strip-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="lm-card__strip-ssl">
            <FaShieldAlt /> 256-bit SSL Encrypted
          </div>
        </div>

        {/* ── Right form ── */}
        <div className="lm-card__form">
          <button className="lm-close" onClick={closeModal} aria-label="Close">
            <FaTimes />
          </button>

          <span className="login-eyebrow">Track Your Application</span>
          <h2 className="lm-card__title">Check Application Status</h2>
          <p className="lm-card__sub">
            Enter the Application ID shown in your registration confirmation to check your account status.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="as-search-form">
            <div className="form-group">
              <label htmlFor="as-accno">Application ID / Account Number</label>
              <div className="input-group">
                 <input
                  type="text"
                  id="as-accno"
                  value={accountNumber}
                  onChange={e => { setAccountNumber(e.target.value); setError(''); setResult(null); setSearched(false); }}
                  placeholder="e.g. SB123456789"
                  autoComplete="off"
                  spellCheck={false}
                />
                {accountNumber && (
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => { setAccountNumber(''); setResult(null); setError(''); setSearched(false); }}
                    aria-label="Clear"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="lm-error">
                <FaTimes className="lm-error__icon" />
                {error}
              </div>
            )}

            <button type="submit" className="login-btn lm-submit-btn">
              <FaSearch /> Check Status
            </button>
          </form>

          {/* ── Result card ── */}
          {searched && result && cfg && (
            <div className={`as-result ${cfg.cls}`}>
              {/* Status icon */}
              <div className={`as-result__icon-wrap ${cfg.iconCls}`}>
                {cfg.icon}
              </div>

              <h3 className="as-result__title">{cfg.title}</h3>
              <p className="as-result__desc">{cfg.desc}</p>

              {/* Account details strip */}
              <div className="as-result__details">
                <div className="as-result__detail-item">
                  <FaUser className="as-result__detail-icon" />
                  <div>
                    <div className="as-result__detail-label">Applicant</div>
                    <div className="as-result__detail-value">{result.firstName} {result.lastName}</div>
                  </div>
                </div>
                <div className="as-result__detail-item">
                  <FaIdCard className="as-result__detail-icon" />
                  <div>
                    <div className="as-result__detail-label">Application ID</div>
                    <div className="as-result__detail-value as-result__detail-value--mono">{result.accountNumber}</div>
                  </div>
                </div>
                <div className="as-result__detail-item">
                  <FaUniversity className="as-result__detail-icon" />
                  <div>
                    <div className="as-result__detail-label">Account Type</div>
                    <div className="as-result__detail-value" style={{ textTransform: 'capitalize' }}>
                      {result.accountType} Account
                    </div>
                  </div>
                </div>
                <div className="as-result__detail-item">
                  <FaCalendarAlt className="as-result__detail-icon" />
                  <div>
                    <div className="as-result__detail-label">Applied On</div>
                    <div className="as-result__detail-value">{fmtDate(result.createdAt)}</div>
                  </div>
                </div>
                {result.approvedAt && (
                  <div className="as-result__detail-item">
                    <FaCheckCircle className="as-result__detail-icon" style={{ color: '#22c55e' }} />
                    <div>
                      <div className="as-result__detail-label">Approved On</div>
                      <div className="as-result__detail-value">{fmtDate(result.approvedAt)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              {cfg.cta && (
                <button
                  className="as-result__cta"
                  onClick={() => {
                    setModalOpen(false);
                    document.getElementById('root')?.classList.remove('page-blurred');
                    document.body.style.overflow = '';
                    navigate(cfg.cta.to);
                  }}
                >
                  {cfg.cta.label} <FaArrowRight />
                </button>
              )}

              {/* Pending timeline */}
              {result.status === 'Pending' && (
                <div className="as-timeline">
                  <div className="as-timeline__step as-timeline__step--done">
                    <div className="as-timeline__dot as-timeline__dot--done"><FaCheckCircle /></div>
                    <div className="as-timeline__info">
                      <div className="as-timeline__label">Application Submitted</div>
                      <div className="as-timeline__date">{fmtDate(result.createdAt)}</div>
                    </div>
                  </div>
                  <div className="as-timeline__line" />
                  <div className="as-timeline__step as-timeline__step--active">
                    <div className="as-timeline__dot as-timeline__dot--active"><FaClock /></div>
                    <div className="as-timeline__info">
                      <div className="as-timeline__label">Under Admin Review</div>
                      <div className="as-timeline__date">1–2 working days</div>
                    </div>
                  </div>
                  <div className="as-timeline__line as-timeline__line--dashed" />
                  <div className="as-timeline__step">
                    <div className="as-timeline__dot"><FaUniversity /></div>
                    <div className="as-timeline__info">
                      <div className="as-timeline__label">Account Activation</div>
                      <div className="as-timeline__date">After approval</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="lm-card__footer">
            <p>
              New applicant?{' '}
              <Link to="/register" className="register-link" onClick={closeModal}>Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
