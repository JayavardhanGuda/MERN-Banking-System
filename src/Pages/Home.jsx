import React, { useState } from 'react'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { FaShieldAlt, FaCreditCard, FaPiggyBank, FaMobileAlt, FaChevronLeft, FaChevronRight, FaUser, FaBuilding, FaChartLine, FaUniversity, FaClipboardList, FaSearch, FaLock, FaBan, FaExclamationTriangle } from 'react-icons/fa'
import houseLoan from '../assets/house_loan.jpg'

export default function Home(){
  const [currentSlide, setCurrentSlide] = useState(0)

  const offers = [
    {
      title: "Welcome to PavitraBandham Cooperative Bank",
      desc: "Fast, secure, and reliable banking solutions for all your financial needs.",
      badge: null,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80"
    },
    {
      title: "Home Loan",
      desc: "Get a Home Loan of up to ₹5 crore with quick processing",
      badge: "Ongoing Offer",
      image: houseLoan
    },
    {
      title: "Personal Loan",
      desc: "Get instant disbursement with no foreclosure charges",
      badge: "Ongoing Offer",
      image: "/pl-offer.jpg"
    }
  ]

  return (
    <>
    <Header/>
    <main>
      {/* Trust Banner */}
      {/* <section className="trust-banner">
        <h2>Truth, Trust, Transparency</h2>
      </section> */}

      {/* Hero Carousel */}
      <section id="home" className="hero-carousel">
        <div className="carousel-container">
          <button
            className="carousel-arrow prev"
            onClick={() => setCurrentSlide((currentSlide + offers.length - 1) % offers.length)}
            aria-label="Previous slide"
          >
            <FaChevronLeft />
          </button>
            <div
              className={`carousel-slide active ${currentSlide === 0 ? 'welcome-slide' : ''}`}
              style={
                currentSlide === 0
                  ? {
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.25)), url(${offers[0].image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
            <div className="slide-content">
              <h1>{offers[currentSlide].title}</h1>
              <p>{offers[currentSlide].desc}</p>
              {/* <button className="apply-btn">APPLY NOW</button> */}
            </div>
              {currentSlide !== 0 && (
                <div className="slide-image">
                  <img src={offers[currentSlide].image} alt={offers[currentSlide].title} />
                </div>
              )}
          </div>
          <button
            className="carousel-arrow next"
            onClick={() => setCurrentSlide((currentSlide + 1) % offers.length)}
            aria-label="Next slide"
          >
            <FaChevronRight />
          </button>
            {offers[currentSlide].badge && <span className="slide-badge">{offers[currentSlide].badge}</span>}
        </div>
        <div className="carousel-dots">
          {offers.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </section>

      {/* Quick Categories */}
      <section id="services" className="quick-categories">
        <div className="categories-grid">
          <div className="category-card">
            <FaClipboardList className="category-icon" />
            <h3>Service Request</h3>
            <FaChevronRight className="arrow-icon" />
          </div>
          <div className="category-card">
            <FaSearch className="category-icon" />
            <h3>Track Applications</h3>
            <FaChevronRight className="arrow-icon" />
          </div>
          <div className="category-card">
            <FaLock className="category-icon" />
            <h3>Smart Lock</h3>
            <FaChevronRight className="arrow-icon" />
          </div>
          <div className="category-card">
            <FaBan className="category-icon" />
            <h3>Block Card</h3>
            <FaChevronRight className="arrow-icon" />
          </div>
          <div className="category-card">
            <FaExclamationTriangle className="category-icon" />
            <h3>Report Fraud</h3>
            <FaChevronRight className="arrow-icon" />
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="featured-offers">
        <h2>Offers for You!</h2>
        <div className="offers-grid">
          <div className="offer-card">
            <div className="offer-badge">Hot Selling</div>
            <h3>Credit Card</h3>
            <p>Enjoy discounts on shopping, dining, entertainment and more with premium rewards!</p>
            <div className="offer-actions">
              <button className="btn-apply">APPLY</button>
              <button className="btn-details">DETAILS</button>
            </div>
          </div>
          <div className="offer-card">
            <div className="offer-badge">Ongoing Offer</div>
            <h3>Home Loan</h3>
            <p>Get a Home Loan of up to ₹5 crore with quick processing and competitive rates.</p>
            <div className="offer-actions">
              <button className="btn-apply">APPLY</button>
              <button className="btn-details">DETAILS</button>
            </div>
          </div>
          <div className="offer-card">
            <div className="offer-badge">Ongoing Offer</div>
            <h3>Personal Loan</h3>
            <p>Get instant disbursement with no foreclosure charges after 12 EMIs.</p>
            <div className="offer-actions">
              <button className="btn-apply">APPLY</button>
              <button className="btn-details">DETAILS</button>
            </div>
          </div>
          <div className="offer-card">
            <div className="offer-badge">Ongoing Offer</div>
            <h3>Fixed Deposits</h3>
            <p>Invest in FDs with attractive interest rates without worrying about market fluctuations.</p>
            <div className="offer-actions">
              <button className="btn-apply">INVEST</button>
              <button className="btn-details">DETAILS</button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <h2>Why Choose PavitraBandham?</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <FaShieldAlt className="benefit-icon" />
            <h3>Secure Banking</h3>
            <p>Advanced encryption and fraud protection for all transactions.</p>
          </div>
          <div className="benefit-item">
            <FaMobileAlt className="benefit-icon" />
            <h3>Digital First</h3>
            <p>Seamless mobile and online banking experience 24/7.</p>
          </div>
          <div className="benefit-item">
            <FaChartLine className="benefit-icon" />
            <h3>Competitive Rates</h3>
            <p>Best interest rates on savings, deposits, and investments.</p>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
    </>
  )
}