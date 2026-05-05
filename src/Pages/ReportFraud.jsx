import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function ReportFraud() {
  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Report Fraud', path: '/report-fraud' }]} />
      <main>
        <div className="report-fraud-page">
          <div className="report-fraud-container">
            <Link to="/" className="back-button">← Back to Home</Link>
            <div className="report-fraud-header">
              <h1>Why you should follow Safe Banking practices</h1>
              <p>Protect your finances with proactive fraud awareness and secure digital banking habits.</p>
            </div>

            <section className="safety-block">
              <div className="safety-card">
                <FaShieldAlt className="safety-icon" />
                <h2>Safe Banking</h2>
                <p>Keep your banking information secure by staying alert, verifying sources, and using only trusted banking channels.</p>
              </div>
              <div className="safety-card">
                <FaExclamationTriangle className="safety-icon" />
                <h2>Stay Alert</h2>
                <p>Be careful about suspicious messages, phishing emails, and unknown callers asking for sensitive information.</p>
              </div>
              <div className="safety-card">
                <FaShieldAlt className="safety-icon" />
                <h2>Stay Secure</h2>
                <p>Use strong passwords, avoid public Wi-Fi for banking, and never share OTPs, CVV, PINs, or passwords with anyone.</p>
              </div>
            </section>

            <section className="report-block">
              <h2>Report a Fraud</h2>
              <p>If you have been a victim of online fraud, reach out to the National Cyber Crime Portal at <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a> or call the helpline on <strong>1930</strong>. You can also call the ICICI Bank helpline on <strong>1800 2662</strong>.</p>
              <div className="report-section">
                <h3>Report to ICICI Bank if you have been a victim of online scam / digital fraud</h3>
                <p><strong>Report a fraud using iMobile</strong><br />Log into iMobile &gt; Accounts & FD / RD &gt; Select your Account &gt; More Options &gt; Report a Fraud</p>
                <p><strong>Report a fraud using Internet Banking</strong><br />Log into Internet Banking &gt; Accounts &gt; Bank Accounts &gt; View Statement &gt; Have a Dispute? &gt; Report a Fraud</p>
                <p><strong>Call the ICICI Bank helpline</strong> on <strong>1800 2662</strong>.</p>
              </div>
              <p className="important-note">Please ensure that you report any unauthorised transaction immediately. The longer the time taken to notify the Bank, the higher will be the risk of loss to you and to the Bank.</p>
            </section>

            <section className="report-block">
              <h2>Report Suspicious Messages or Calls</h2>
              <p>If you have received any suspicious, malicious, or phishing e-mails or calls, please report them to Sanchar Saathi at <a href="https://sancharsaathi.gov.in" target="_blank" rel="noreferrer">sancharsaathi.gov.in</a> and to ICICI Bank at <a href="mailto:antiphishing@icicibank.com">antiphishing@icicibank.com</a>.</p>
              <div className="report-section">
                <h3>Report to ICICI Bank if you receive suspicious messages / calls</h3>
                <p>If you receive an e-mail claiming to be from ICICI Bank regarding updation of sensitive account information like PIN, password, Account Number or any other important information, forward the e-mail to <strong>antiphishing@icicibank.com</strong>.</p>
                <p>If you notice any spoofed (duplicate / unofficial) ICICI Bank website, e-mail us the spoofed URL at <strong>antiphishing@icicibank.com</strong>.</p>
                <p>You can also report such suspicious activities to our Customer Care on <strong>1800 1080</strong>.</p>
              </div>
              <p><strong>Report any kind of suspicious activity using iMobile</strong><br />Login to iMobile &gt; Services &gt; Report suspicious call / message</p>
            </section>

            <section className="report-block">
              <h2>How to use Smart Lock</h2>
              <p>The Smart Lock feature helps you book a secure locker to store valuable items safely at the bank. Choose your locker size, describe the items, and book online.</p>
            </section>

            <section className="report-block always-remember">
              <h2>Always Remember</h2>
              <ul>
                <li>Do not click on or open any links in e-mails received from unknown sources.</li>
                <li>Do not share sensitive information with anyone.</li>
                <li>Bank employees will never ask for your CVV, PIN, password, OTP, or Card/Account Number.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
