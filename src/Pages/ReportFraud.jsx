import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaShieldAlt, FaExclamationTriangle, FaPhoneAlt,
  FaEnvelope, FaGlobe, FaLock, FaMobileAlt,
  FaUserShield, FaBan, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';
import '../styles/ReportFraud.css';

const SAFETY_TIPS = [
  { icon: <FaLock />,        title: 'Protect Your Credentials',   desc: 'Never share your PIN, OTP, CVV, password, or account number with anyone — including people claiming to be bank staff.' },
  { icon: <FaMobileAlt />,   title: 'Beware of Phishing',         desc: 'Do not click links in unsolicited SMS or emails. Always type the bank URL directly in your browser.' },
  { icon: <FaUserShield />,  title: 'Verify Before You Act',      desc: 'Fraudsters impersonate bank officials. Always call back on the official helpline to verify any request.' },
  { icon: <FaBan />,         title: 'Avoid Public Wi-Fi',         desc: 'Never access internet banking on public or unsecured Wi-Fi networks. Use mobile data or a trusted network.' },
  { icon: <FaShieldAlt />,   title: 'Use Strong Passwords',       desc: 'Set unique, complex passwords for internet banking. Enable two-factor authentication wherever available.' },
  { icon: <FaCheckCircle />, title: 'Monitor Your Account',       desc: 'Regularly check your account statement and transaction alerts. Report any unrecognised transaction immediately.' },
];

const REPORT_CHANNELS = [
  {
    icon: <FaPhoneAlt />,
    title: 'National Cyber Crime Helpline',
    detail: '1930',
    sub: 'Available 24×7 for reporting cyber fraud',
    type: 'phone',
  },
  {
    icon: <FaGlobe />,
    title: 'National Cyber Crime Portal',
    detail: 'cybercrime.gov.in',
    sub: 'File an online complaint with the Government of India',
    type: 'link',
    href: 'https://cybercrime.gov.in',
  },
  {
    icon: <FaPhoneAlt />,
    title: 'PavitraBandham Bank Helpline',
    detail: '1800-XXX-XXXX',
    sub: 'Toll-free · Mon–Sat, 9 AM – 6 PM',
    type: 'phone',
  },
  {
    icon: <FaEnvelope />,
    title: 'Email Fraud Reporting',
    detail: 'fraud@pavitrabandhambank.com',
    sub: 'Send evidence of phishing or suspicious activity',
    type: 'email',
    href: 'mailto:fraud@pavitrabandhambank.com',
  },
];

const FRAUD_TYPES = [
  { title: 'Phishing Emails / SMS',    desc: 'Fake messages that mimic the bank to steal your login credentials or OTP.' },
  { title: 'Vishing (Voice Fraud)',     desc: 'Callers posing as bank officials asking for sensitive account information.' },
  { title: 'SIM Swap Fraud',           desc: 'Fraudsters get a duplicate SIM to intercept your OTPs and access your account.' },
  { title: 'UPI / QR Code Scams',      desc: 'Fake payment requests or QR codes that debit money instead of crediting it.' },
  { title: 'Fake Banking Apps',        desc: 'Counterfeit apps that steal credentials when you log in.' },
  { title: 'Card Skimming',            desc: 'Devices placed on ATMs or POS terminals to clone your debit/credit card data.' },
];

export default function ReportFraud() {
  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Report Fraud', path: '/report-fraud' }]} />
      <main className="rf-main">

        {/* ── Hero ── */}
        <section className="rf-hero">
          <div className="rf-hero__overlay" />
          <div className="container rf-hero__content">
            <div className="rf-hero__icon-wrap">
              <FaShieldAlt />
            </div>
            <h1 className="rf-hero__title">Fraud Awareness &amp; Reporting</h1>
            <p className="rf-hero__desc">
              PavitraBandham Cooperative Bank is committed to keeping your money safe.
              Learn how to identify fraud, protect yourself, and report suspicious activity immediately.
            </p>
            <div className="rf-hero__actions">
              <a href="#report" className="rf-btn-primary">
                Report Fraud Now <FaArrowRight />
              </a>
              <a href="#tips" className="rf-btn-outline">
                Safety Tips
              </a>
            </div>
          </div>
        </section>

        {/* ── Safety Tips ── */}
        <section id="tips" className="rf-section rf-section--light">
          <div className="container">
            <div className="rf-section__head">
              <span className="rf-eyebrow">Stay Protected</span>
              <h2 className="rf-section__title">Safe Banking Practices</h2>
              <p className="rf-section__sub">Follow these guidelines to keep your account and finances secure at all times.</p>
            </div>
            <div className="rf-tips-grid">
              {SAFETY_TIPS.map((tip, i) => (
                <div key={i} className="rf-tip-card">
                  <div className="rf-tip-card__icon">{tip.icon}</div>
                  <h3 className="rf-tip-card__title">{tip.title}</h3>
                  <p className="rf-tip-card__desc">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fraud Types ── */}
        <section className="rf-section rf-section--dark">
          <div className="container">
            <div className="rf-section__head rf-section__head--light">
              <span className="rf-eyebrow rf-eyebrow--light">Know the Threats</span>
              <h2 className="rf-section__title rf-section__title--light">Common Types of Banking Fraud</h2>
              <p className="rf-section__sub rf-section__sub--light">Recognising these fraud patterns is your first line of defence.</p>
            </div>
            <div className="rf-fraud-grid">
              {FRAUD_TYPES.map((f, i) => (
                <div key={i} className="rf-fraud-card">
                  <div className="rf-fraud-card__num">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="rf-fraud-card__title">{f.title}</h3>
                    <p className="rf-fraud-card__desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Report Channels ── */}
        <section id="report" className="rf-section rf-section--light">
          <div className="container">
            <div className="rf-section__head">
              <span className="rf-eyebrow">Take Action</span>
              <h2 className="rf-section__title">How to Report Fraud</h2>
              <p className="rf-section__sub">
                If you suspect fraud or notice an unauthorised transaction, act immediately.
                Every minute counts — report as soon as possible to minimise loss.
              </p>
            </div>
            <div className="rf-channels-grid">
              {REPORT_CHANNELS.map((c, i) => (
                <div key={i} className="rf-channel-card">
                  <div className="rf-channel-card__icon">{c.icon}</div>
                  <h3 className="rf-channel-card__title">{c.title}</h3>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noreferrer" className="rf-channel-card__detail">
                      {c.detail}
                    </a>
                  ) : (
                    <div className="rf-channel-card__detail">{c.detail}</div>
                  )}
                  <p className="rf-channel-card__sub">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Important note */}
            <div className="rf-important-note">
              <FaExclamationTriangle className="rf-important-note__icon" />
              <div>
                <strong>Report Immediately:</strong> The sooner you report an unauthorised transaction,
                the higher the chance of recovery. Delays increase the risk of permanent loss.
                PavitraBandham Bank will never ask for your OTP, PIN, or password over phone or email.
              </div>
            </div>
          </div>
        </section>

        {/* ── Always Remember ── */}
        <section className="rf-remember">
          <div className="container">
            <h2 className="rf-remember__title">Always Remember</h2>
            <div className="rf-remember__grid">
              {[
                'Bank staff will NEVER ask for your OTP, PIN, CVV, or password',
                'Do not click links in unsolicited emails or SMS messages',
                'Verify the sender before responding to any banking communication',
                'Register for transaction alerts to monitor your account in real time',
                'Use the official bank app or website — never third-party links',
                'Lock your card immediately if lost or if you suspect misuse',
              ].map((item, i) => (
                <div key={i} className="rf-remember__item">
                  <FaCheckCircle className="rf-remember__icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
