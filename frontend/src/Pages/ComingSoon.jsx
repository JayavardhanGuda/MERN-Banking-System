import { Link, useLocation } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { FaClock, FaBell, FaCreditCard, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import '../styles/ComingSoon.css';

const pageConfig = {
  '/cards': {
    icon: <FaCreditCard />,
    label: 'Cards',
    title: 'Our Cards Are Coming Soon',
    subtitle: 'Debit Cards · Credit Cards · Prepaid Cards',
    desc: 'We are crafting a world-class card experience for you — cashback rewards, zero annual fees, contactless payments, and exclusive lifestyle privileges. Stay tuned!',
    features: [
      'Cashback & reward points on every spend',
      'Contactless & tap-to-pay enabled',
      'Zero annual fee for the first year',
      'Global acceptance on Visa / RuPay network',
      'Instant virtual card for online shopping',
      'Real-time spend alerts & controls',
    ],
    accent: '#c9a84c',
    bg: 'linear-gradient(135deg, #0d1b3e 0%, #1a2f6b 55%, #2a4494 100%)',
  },
  '/insurance': {
    icon: <FaShieldAlt />,
    label: 'Insurance',
    title: 'Insurance Plans Are Coming Soon',
    subtitle: 'Life · Health · Vehicle · Home Insurance',
    desc: 'Comprehensive insurance solutions tailored for you and your family — affordable premiums, hassle-free claims, and complete peace of mind. Launching very soon!',
    features: [
      'Term life cover up to ₹1 crore',
      'Cashless health insurance at 5000+ hospitals',
      'Vehicle insurance with zero depreciation',
      'Home & property protection plans',
      'Instant policy issuance online',
      'Dedicated claims support team',
    ],
    accent: '#c9a84c',
    bg: 'linear-gradient(135deg, #0d1b3e 0%, #1a3a2a 55%, #1a4a30 100%)',
  },
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const config = pageConfig[pathname] || pageConfig['/cards'];

  return (
    <>
      <Header />
      <main className="cs-main" style={{ background: config.bg }}>

        {/* Decorative orbs */}
        <div className="cs-orb cs-orb--1" />
        <div className="cs-orb cs-orb--2" />

        <div className="container cs-container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 text-center">

              {/* Icon badge */}
              <div className="cs-icon-wrap">
                {config.icon}
              </div>

              {/* Coming soon pill */}
              <div className="cs-pill">
                <FaClock className="cs-pill__icon" />
                Coming Soon
              </div>

              <h1 className="cs-title">{config.title}</h1>
              <p className="cs-subtitle">{config.subtitle}</p>
              <p className="cs-desc">{config.desc}</p>

              {/* Feature grid */}
              <div className="cs-features">
                {config.features.map((f, i) => (
                  <div key={i} className="cs-feature-item">
                    <span className="cs-feature-dot" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Notify strip */}
              <div className="cs-notify">
                <FaBell className="cs-notify__icon" />
                <span>We'll notify you as soon as this feature launches.</span>
              </div>

              {/* Back button */}
              <Link to="/" className="cs-back-btn">
                <FaArrowLeft className="me-2" /> Back to Home
              </Link>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
