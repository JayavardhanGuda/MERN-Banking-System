import { useState, useEffect, useRef } from 'react'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import {
  FaShieldAlt, FaMobileAlt, FaChartLine,
  FaChevronLeft, FaChevronRight,
  FaClipboardList, FaLock, FaExclamationTriangle,
  FaUniversity, FaAward, FaUsers,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaArrowRight, FaCheckCircle
} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Home.css'

/* ── Count-up hook ── */
function useCountUp(target, duration = 1200, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

/* ── Stats strip with animated counters ── */
const STATS = [
  { target: 38,    prefix: '',  suffix: '+',   label: 'Years of Service',         duration: 1000 },
  { target: 700,   prefix: '',  suffix: 'K+',  label: 'Happy Customers',          duration: 1200 },
  { target: 500,   prefix: '₹', suffix: 'Cr+', label: 'Assets Under Management',  duration: 1400 },
  { target: 99.9,  prefix: '',  suffix: '%',   label: 'Uptime Guarantee',         duration: 1100, decimal: true },
];

function StatItem({ stat, started }) {
  const raw = useCountUp(
    stat.decimal ? Math.round(stat.target * 10) : stat.target,
    stat.duration,
    started
  );
  const display = stat.decimal ? (raw / 10).toFixed(1) : raw;
  return (
    <div className="home-stats__item">
      <div className="home-stats__value">
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div className="home-stats__label">{stat.label}</div>
    </div>
  );
}

function StatsStrip() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="home-stats" ref={ref}>
      <div className="container">
        <div className="row g-0">
          {STATS.map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <StatItem stat={s} started={started} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  const slides = [
    {
      title: "Welcome to VJN Cooperative Bank",
      desc: "Fast, secure, and reliable banking solutions for all your financial needs. Your trust is our foundation.",
      badge: null,
      cta: "Open an Account",
      ctaLink: "/register",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80",
      overlay: true
    },
    {
      title: "VJN Debit & Credit Cards",
      desc: "Earn cashback on every swipe, enjoy contactless payments, and unlock exclusive lifestyle rewards — all with zero annual fee in the first year.",
      badge: "Coming Soon",
      cta: "Explore Cards",
      ctaLink: "/cards",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
      overlay: true
    },
    {
      title: "Comprehensive Insurance Plans",
      desc: "Protect what matters most — life, health, vehicle, and home. Affordable premiums, cashless claims, and instant policy issuance.",
      badge: "Coming Soon",
      cta: "View Insurance Plans",
      ctaLink: "/insurance",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80",
      overlay: true
    }
  ]

  // Auto-advance every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [slides.length])

  const prevSlide = () => setCurrentSlide((currentSlide + slides.length - 1) % slides.length)
  const nextSlide = () => setCurrentSlide((currentSlide + 1) % slides.length)

  return (
    <>
      <Header />
      <main className="home-main">

        {/* ── HERO CAROUSEL ── */}
        <section id="home" className="home-hero">
          <div
            className="home-hero__slide"
            style={{
              backgroundImage: `${slides[currentSlide].overlay
                ? 'linear-gradient(135deg, rgba(13,27,62,0.88) 0%, rgba(26,47,107,0.70) 100%), '
                : 'linear-gradient(135deg, rgba(13,27,62,0.60) 0%, rgba(26,47,107,0.40) 100%), '
              }url(${slides[currentSlide].image})`
            }}
          >
            <div className="container h-100">
              <div className="row h-100 align-items-center">
                <div className="col-lg-7 col-md-9">
                  {slides[currentSlide].badge && (
                    <span className="home-hero__badge mb-3 d-inline-block">
                      {slides[currentSlide].badge}
                    </span>
                  )}
                  <h1 className="home-hero__title">{slides[currentSlide].title}</h1>
                  <p className="home-hero__desc">{slides[currentSlide].desc}</p>
                  <Link to={slides[currentSlide].ctaLink} className="home-hero__cta">
                    {slides[currentSlide].cta} <FaArrowRight className="ms-2" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <button className="home-hero__arrow home-hero__arrow--prev" onClick={prevSlide} aria-label="Previous slide">
              <FaChevronLeft />
            </button>
            <button className="home-hero__arrow home-hero__arrow--next" onClick={nextSlide} aria-label="Next slide">
              <FaChevronRight />
            </button>

            {/* Dots */}
            <div className="home-hero__dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`home-hero__dot${i === currentSlide ? ' active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <StatsStrip />

        {/* ── QUICK SERVICES ── */}
        <section id="services" className="home-services py-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="home-section__eyebrow">What We Offer</span>
              <h2 className="home-section__title">Quick Services</h2>
              <p className="home-section__sub">Access our most-used banking services in one click</p>
            </div>
            <div className="row g-4 justify-content-center">
              {[
                {
                  icon: <FaClipboardList />,
                  title: 'Service Request',
                  desc: 'Submit and track your banking service requests online.',
                  color: '#c9a84c',
                  onClick: () => navigate('/user-dashboard', { state: { section: 'service' } })
                },
                {
                  icon: <FaLock />,
                  title: 'Smart Lock',
                  desc: 'Instantly lock or unlock your account for added security.',
                  color: '#1a2f6b',
                  onClick: () => navigate('/user-dashboard', { state: { section: 'smartlock' } })
                },
                {
                  icon: <FaExclamationTriangle />,
                  title: 'Report Fraud',
                  desc: 'Report suspicious activity and protect your finances.',
                  color: '#e05252',
                  link: '/report-fraud'
                },
              ].map((svc, i) => (
                <div key={i} className="col-md-4 col-sm-6">
                  {svc.onClick ? (
                    <button
                      type="button"
                      className="home-service-card text-decoration-none"
                      onClick={svc.onClick}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <div className="home-service-card__icon" style={{ color: svc.color }}>
                        {svc.icon}
                      </div>
                      <h3 className="home-service-card__title">{svc.title}</h3>
                      <p className="home-service-card__desc">{svc.desc}</p>
                      <span className="home-service-card__arrow" style={{ color: svc.color }}>
                        Learn more <FaArrowRight />
                      </span>
                    </button>
                  ) : (
                    <Link to={svc.link} className="home-service-card text-decoration-none">
                      <div className="home-service-card__icon" style={{ color: svc.color }}>
                        {svc.icon}
                      </div>
                      <h3 className="home-service-card__title">{svc.title}</h3>
                      <p className="home-service-card__desc">{svc.desc}</p>
                      <span className="home-service-card__arrow" style={{ color: svc.color }}>
                        Learn more <FaArrowRight />
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT US ── */}
        <section id="about-us" className="home-about py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              {/* Left text */}
              <div className="col-lg-5">
                <span className="home-section__eyebrow home-section__eyebrow--light">Who We Are</span>
                <h2 className="home-section__title home-section__title--light">
                  Banking Built on Trust &amp; Transparency
                </h2>
                <p className="home-about__body">
                  VJN Cooperative Bank is built on trust, transparency, and
                  customer-focused banking solutions. With years of reliability and
                  innovation, we empower financial growth for every individual and
                  business we serve.
                </p>
                <ul className="home-about__checklist">
                  {[
                    'RBI regulated &amp; fully compliant',
                    'Deposit insurance up to ₹5 lakh',
                    'Zero hidden charges policy',
                    '24/7 customer support',
                  ].map((item, i) => (
                    <li key={i}>
                      <FaCheckCircle className="home-about__check-icon" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right cards */}
              <div className="col-lg-7">
                <div className="row g-4">
                  {[
                    {
                      icon: <FaUniversity />,
                      title: '10+ Years of Service',
                      desc: 'A decade of dependable banking delivering stability, security, and long-term customer relationships.'
                    },
                    {
                      icon: <FaUsers />,
                      title: 'Customer-Centric Approach',
                      desc: 'Over 1,00,000 customers trust our personalized financial solutions designed around real-world needs.'
                    },
                    {
                      icon: <FaAward />,
                      title: 'Award-Winning Support',
                      desc: 'Recognized for excellence in customer service and innovative banking practices that deliver real value.'
                    },
                    {
                      icon: <FaShieldAlt />,
                      title: 'Bank-Grade Security',
                      desc: 'Multi-layer encryption, real-time fraud monitoring, and secure digital infrastructure protect your assets.'
                    },
                  ].map((card, i) => (
                    <div key={i} className="col-sm-6">
                      <div className="home-about__card">
                        <div className="home-about__card-icon">{card.icon}</div>
                        <h4 className="home-about__card-title">{card.title}</h4>
                        <p className="home-about__card-desc">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="home-why py-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="home-section__eyebrow">Our Advantages</span>
              <h2 className="home-section__title">Why Choose VJN Bank?</h2>
              <p className="home-section__sub">We combine modern technology with personal banking to give you the best experience</p>
            </div>
            <div className="row g-4">
              {[
                {
                  icon: <FaShieldAlt />,
                  title: 'Secure Banking',
                  desc: 'Advanced encryption and real-time fraud protection for every transaction you make.',
                  gradient: 'linear-gradient(135deg, #0d1b3e, #1a2f6b)'
                },
                {
                  icon: <FaMobileAlt />,
                  title: 'Digital First',
                  desc: 'Seamless mobile and online banking experience available 24/7 from anywhere.',
                  gradient: 'linear-gradient(135deg, #c9a84c, #a8872e)'
                },
                {
                  icon: <FaChartLine />,
                  title: 'Competitive Rates',
                  desc: 'Best interest rates on savings, deposits, and investments to grow your wealth.',
                  gradient: 'linear-gradient(135deg, #2a4494, #1a2f6b)'
                },
              ].map((item, i) => (
                <div key={i} className="col-md-4">
                  <div className="home-why__card">
                    <div className="home-why__icon-wrap" style={{ background: item.gradient }}>
                      {item.icon}
                    </div>
                    <h3 className="home-why__title">{item.title}</h3>
                    <p className="home-why__desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="home-cta">
          <div className="container text-center">
            <h2 className="home-cta__title">Ready to Start Your Banking Journey?</h2>
            <p className="home-cta__sub">
              Join over 1,00,000 customers who trust VJN Bank for their financial needs.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="home-cta__btn-primary">
                Open an Account <FaArrowRight className="ms-2" />
              </Link>
              <Link to="/internet-banking-register" className="home-cta__btn-outline">
                Register for Internet Banking
              </Link>
            </div>
          </div>
        </section>

        {/* ── CONTACT US ── */}
        <section id="contact-us" className="home-contact py-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="home-section__eyebrow">Get in Touch</span>
              <h2 className="home-section__title">Contact Us</h2>
              <p className="home-section__sub">We're here to help you with all your banking needs</p>
            </div>
            <div className="row g-4 justify-content-center">
              {[
                {
                  icon: <FaPhoneAlt />,
                  title: 'Phone Support',
                  lines: ['1800-XXX-XXXX (Toll Free)', 'Mon – Sat, 9 AM – 6 PM']
                },
                {
                  icon: <FaEnvelope />,
                  title: 'Email Us',
                  lines: ['support@vjnbank.in', 'We reply within 24 hours']
                },
                {
                  icon: <FaMapMarkerAlt />,
                  title: 'Visit Us',
                  lines: ['123, Bank Street, Chennai', 'Tamil Nadu – 600001']
                },
              ].map((c, i) => (
                <div key={i} className="col-md-4 col-sm-6">
                  <div className="home-contact__card">
                    <div className="home-contact__icon">{c.icon}</div>
                    <h4 className="home-contact__title">{c.title}</h4>
                    {c.lines.map((l, j) => <p key={j} className="home-contact__line">{l}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
