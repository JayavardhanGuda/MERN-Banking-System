import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';

export default function SavingsAccount() {
  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: 'Accounts', path: '/' },
        { label: 'Savings Account', path: '/savings-account' }
      ]} />
      <main className="savings-page">
        <section className="savings-hero">
          <div className="savings-hero-copy">
            {/* <p className="savings-breadcrumb">Personal Banking &gt; Accounts &gt; Savings Account</p> */}
            <h1>Savings Account — One Account, Endless Benefits</h1>
            <div className="savings-hero-links">
              <Link to="/register" className="hero-btn hero-btn-primary">Get Started</Link>
              <Link to="/login" className="hero-btn hero-btn-secondary">Manage Account</Link>
            </div>
          </div>
          <div className="savings-hero-image">
            <div className="savings-card savings-card-savings">Savings</div>
            <div className="savings-card savings-card-demat">Demat</div>
            <div className="savings-card savings-card-trading">Trading</div>
            <div className="savings-hero-visual"></div>
          </div>
        </section>

        <section className="savings-features">
          <div className="feature-card">
            <h2>Personalized Debit Cards</h2>
            <p>Choose from a curated selection of debit cards with cashback and rewards.</p>
          </div>
          <div className="feature-card">
            <h2>Unified Account View</h2>
            <p>Manage all linked savings accounts and investments in one place.</p>
          </div>
          <div className="feature-card">
            <h2>Accidental Death Cover</h2>
            <p>Benefit from complimentary insurance cover with every savings account.</p>
          </div>
          <div className="feature-card">
            <h2>Smart Banking Tools</h2>
            <p>Access budgeting, goal tracking, and account analytics tools instantly.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
