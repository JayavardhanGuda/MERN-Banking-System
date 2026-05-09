import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer id="contact-us" className="footer">
      <div className="footer-content">

        {/* Brand */}
        <div className="footer-section">
          <div className="footer-brand-name">PavitraBandham Cooperative Bank</div>
          <div className="footer-brand-tagline">Empowering trust, enabling growth</div>
          <p className="footer-brand-desc">
            A trusted cooperative bank serving individuals and businesses with
            integrity, innovation, and a commitment to your financial well-being.
          </p>
          <p className="footer-copyright">© 2026 PavitraBandham Cooperative Bank. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/savings-account">Savings Account</a></li>
            <li><a href="/register">Open an Account</a></li>
            <li><a href="/internet-banking-register">Internet Banking</a></li>
            <li><a href="/service-request">Service Request</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul className="contact-info">
            <li>
              <FaMapMarkerAlt />
              <span>123 Bank Street, Hyderabad, Telangana – 500001</span>
            </li>
            <li>
              <FaPhoneAlt />
              <span>1800-XXX-XXXX (Toll Free)<br />Mon – Sat, 9 AM – 6 PM</span>
            </li>
            <li>
              <FaEnvelope />
              <span>support@pavitrabandhambank.com</span>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>Regulated by the Reserve Bank of India &nbsp;|&nbsp; DICGC insured deposits up to ₹5 lakh</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Grievance Redressal</a>
        </div>
      </div>
    </footer>
  );
}
