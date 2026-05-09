import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import {
  FaPiggyBank, FaShieldAlt, FaMobileAlt, FaPercentage,
  FaCheckCircle, FaArrowRight, FaUniversity, FaIdCard,
  FaFileAlt, FaUserCheck, FaGift, FaLock, FaHeadset,
  FaChartLine, FaWallet, FaExchangeAlt
} from 'react-icons/fa';
import '../styles/SavingsAccount.css';

export default function SavingsAccount() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    setIsLoggedIn(!!user);
  }, []);

  const features = [
    {
      icon: <FaPercentage />,
      title: 'Attractive Interest Rates',
      desc: 'Earn up to 6.5% p.a. interest on your savings balance, credited quarterly directly to your account.',
      color: '#c9a84c'
    },
    {
      icon: <FaMobileAlt />,
      title: 'Internet & Mobile Banking',
      desc: 'Manage your account 24/7 via our secure internet banking portal and mobile app — anytime, anywhere.',
      color: '#1a2f6b'
    },
    {
      icon: <FaShieldAlt />,
      title: 'DICGC Insured Deposits',
      desc: 'Your deposits are insured up to ₹5 lakh under the Deposit Insurance and Credit Guarantee Corporation.',
      color: '#2a4494'
    },
    {
      icon: <FaExchangeAlt />,
      title: 'Free Fund Transfers',
      desc: 'Transfer funds instantly via NEFT, RTGS, and IMPS with zero transaction charges on digital transfers.',
      color: '#c9a84c'
    },
    {
      icon: <FaWallet />,
      title: 'Zero Minimum Balance',
      desc: 'Open and maintain your savings account with zero minimum balance — no hidden penalties ever.',
      color: '#1a2f6b'
    },
    {
      icon: <FaGift />,
      title: 'Exclusive Rewards',
      desc: 'Earn reward points on every debit card transaction and redeem them for cashback, vouchers, and more.',
      color: '#2a4494'
    },
  ];

  const eligibility = [
    'Indian resident individual (18 years and above)',
    'Minor accounts available with guardian co-holder',
    'Valid government-issued photo ID proof',
    'Valid address proof (Aadhaar, Passport, Utility Bill)',
    'PAN card or Form 60 (if PAN not available)',
    'Initial deposit of ₹500 (waived for zero-balance accounts)',
  ];

  const documents = [
    { icon: <FaIdCard />, title: 'Identity Proof', items: ['Aadhaar Card', 'Passport', 'Voter ID', 'Driving Licence'] },
    { icon: <FaFileAlt />, title: 'Address Proof', items: ['Aadhaar Card', 'Passport', 'Utility Bill (< 3 months)', 'Bank Statement'] },
    { icon: <FaUserCheck />, title: 'Other Documents', items: ['PAN Card / Form 60', 'Passport-size photographs (2)', 'Initial deposit cheque / cash'] },
  ];

  const steps = [
    { step: '01', title: 'Fill Application', desc: 'Complete the online savings account registration form with your personal and KYC details.' },
    { step: '02', title: 'Upload Documents', desc: 'Upload scanned copies of your identity proof, address proof, and PAN card securely.' },
    { step: '03', title: 'Verification', desc: 'Our team verifies your documents within 1–2 working days and activates your account.' },
    { step: '04', title: 'Start Banking', desc: 'Receive your account number, debit card, and internet banking credentials. You\'re all set!' },
  ];

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Accounts', path: '/' },
        { label: 'Savings Account', path: '/savings-account' }
      ]} />

      <main className="sa-main">

        {/* ── HERO ── */}
        <section className="sa-hero">
          <div className="sa-hero__overlay" />
          <div className="container sa-hero__content">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <span className="sa-eyebrow">PavitraBandham Cooperative Bank</span>
                <h1 className="sa-hero__title">
                  Savings Account —<br />
                  <span className="sa-hero__title-gold">Grow Every Rupee You Save</span>
                </h1>
                <p className="sa-hero__desc">
                  Open a savings account that works as hard as you do. Enjoy competitive
                  interest rates, zero charges, and the security of a trusted cooperative bank —
                  all in one place.
                </p>
                <div className="sa-hero__actions">
                  <Link to="/register" className="sa-btn-primary">
                    Open Account <FaArrowRight className="ms-2" />
                  </Link>
                  <Link
                    to={isLoggedIn ? '/user-dashboard' : '/login'}
                    className="sa-btn-outline"
                  >
                    {isLoggedIn ? 'Manage Account' : 'Login to Access'}
                  </Link>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="col-lg-5 d-none d-lg-flex justify-content-center">
                <div className="sa-hero__cards">
                  <div className="sa-stat-card sa-stat-card--gold">
                    <FaPercentage className="sa-stat-card__icon" />
                    <div className="sa-stat-card__value">6.5%</div>
                    <div className="sa-stat-card__label">Interest p.a.</div>
                  </div>
                  <div className="sa-stat-card sa-stat-card--navy">
                    <FaShieldAlt className="sa-stat-card__icon" />
                    <div className="sa-stat-card__value">₹5L</div>
                    <div className="sa-stat-card__label">DICGC Insured</div>
                  </div>
                  <div className="sa-stat-card sa-stat-card--mid">
                    <FaWallet className="sa-stat-card__icon" />
                    <div className="sa-stat-card__value">₹0</div>
                    <div className="sa-stat-card__label">Min. Balance</div>
                  </div>
                  <div className="sa-stat-card sa-stat-card--gold">
                    <FaHeadset className="sa-stat-card__icon" />
                    <div className="sa-stat-card__value">24/7</div>
                    <div className="sa-stat-card__label">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="sa-stats">
          <div className="container">
            <div className="row g-0">
              {[
                { value: '6.5% p.a.', label: 'Interest Rate' },
                { value: '₹0', label: 'Minimum Balance' },
                { value: '₹5 Lakh', label: 'DICGC Insurance' },
                { value: 'Instant', label: 'Account Activation' },
              ].map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="sa-stats__item">
                    <div className="sa-stats__value">{s.value}</div>
                    <div className="sa-stats__label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TABS ── */}
        <section className="sa-tabs-section py-5">
          <div className="container">
            <div className="sa-tabs">
              {['features', 'eligibility', 'documents', 'how-to-open'].map((tab) => (
                <button
                  key={tab}
                  className={`sa-tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'features' && 'Features & Benefits'}
                  {tab === 'eligibility' && 'Eligibility'}
                  {tab === 'documents' && 'Documents Required'}
                  {tab === 'how-to-open' && 'How to Open'}
                </button>
              ))}
            </div>

            {/* Features */}
            {activeTab === 'features' && (
              <div className="row g-4 mt-2">
                {features.map((f, i) => (
                  <div key={i} className="col-md-4 col-sm-6">
                    <div className="sa-feature-card">
                      <div className="sa-feature-card__icon" style={{ color: f.color }}>
                        {f.icon}
                      </div>
                      <h3 className="sa-feature-card__title">{f.title}</h3>
                      <p className="sa-feature-card__desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Eligibility */}
            {activeTab === 'eligibility' && (
              <div className="row mt-2 justify-content-center">
                <div className="col-lg-8">
                  <div className="sa-info-box">
                    <h3 className="sa-info-box__title">
                      <FaUserCheck className="me-2" /> Who Can Open a Savings Account?
                    </h3>
                    <ul className="sa-checklist">
                      {eligibility.map((item, i) => (
                        <li key={i}>
                          <FaCheckCircle className="sa-checklist__icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="sa-info-note">
                      <FaShieldAlt className="me-2" />
                      All accounts are opened in compliance with RBI KYC norms and AML guidelines.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="row g-4 mt-2 justify-content-center">
                {documents.map((doc, i) => (
                  <div key={i} className="col-md-4">
                    <div className="sa-doc-card">
                      <div className="sa-doc-card__icon">{doc.icon}</div>
                      <h4 className="sa-doc-card__title">{doc.title}</h4>
                      <ul className="sa-doc-card__list">
                        {doc.items.map((item, j) => (
                          <li key={j}>
                            <FaCheckCircle className="sa-doc-card__check" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* How to Open */}
            {activeTab === 'how-to-open' && (
              <div className="row g-4 mt-2">
                {steps.map((s, i) => (
                  <div key={i} className="col-md-3 col-sm-6">
                    <div className="sa-step-card">
                      <div className="sa-step-card__number">{s.step}</div>
                      <h4 className="sa-step-card__title">{s.title}</h4>
                      <p className="sa-step-card__desc">{s.desc}</p>
                      {i < steps.length - 1 && <div className="sa-step-card__connector" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── ACCOUNT TYPES ── */}
        <section className="sa-types py-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="sa-eyebrow">Choose Your Account</span>
              <h2 className="sa-section__title">Savings Account Variants</h2>
              <p className="sa-section__sub">Pick the account that fits your lifestyle and financial goals</p>
            </div>
            <div className="row g-4 justify-content-center">
              {[
                {
                  icon: <FaPiggyBank />,
                  name: 'Regular Savings',
                  rate: '4.5% p.a.',
                  minBal: '₹0',
                  highlights: ['Free debit card', 'Internet banking', 'NEFT/RTGS/IMPS', 'Passbook facility'],
                  tag: null
                },
                {
                  icon: <FaChartLine />,
                  name: 'Premium Savings',
                  rate: '6.5% p.a.',
                  minBal: '₹10,000',
                  highlights: ['Premium debit card', 'Priority banking', 'Free DD/PO', 'Locker discount 20%'],
                  tag: 'Most Popular'
                },
                {
                  icon: <FaUniversity />,
                  name: 'Senior Citizen Savings',
                  rate: '7.0% p.a.',
                  minBal: '₹0',
                  highlights: ['Higher interest rate', 'Doorstep banking', 'Free health checkup', 'Dedicated RM'],
                  tag: 'Special Rate'
                },
              ].map((type, i) => (
                <div key={i} className="col-md-4">
                  <div className={`sa-type-card${type.tag ? ' sa-type-card--featured' : ''}`}>
                    {type.tag && <div className="sa-type-card__tag">{type.tag}</div>}
                    <div className="sa-type-card__icon">{type.icon}</div>
                    <h3 className="sa-type-card__name">{type.name}</h3>
                    <div className="sa-type-card__rate">{type.rate}</div>
                    <div className="sa-type-card__bal">Min. Balance: <strong>{type.minBal}</strong></div>
                    <ul className="sa-type-card__list">
                      {type.highlights.map((h, j) => (
                        <li key={j}><FaCheckCircle className="sa-type-card__check" />{h}</li>
                      ))}
                    </ul>
                    <Link to="/register" className="sa-type-card__cta">
                      Open Now <FaArrowRight />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="sa-cta">
          <div className="container text-center">
            <h2 className="sa-cta__title">Ready to Open Your Savings Account?</h2>
            <p className="sa-cta__sub">
              Join thousands of customers who trust PavitraBandham for their savings.
              Open your account online in minutes — no branch visit required.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="sa-btn-primary">
                Open Account Now <FaArrowRight className="ms-2" />
              </Link>
             
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
