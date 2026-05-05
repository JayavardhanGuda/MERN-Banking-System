// import React from "react";
// import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
 
// export default function Footer() {
//   return (
//     <footer className="footer">
//       <div className="footer-content">
//         <div className="footer-section">
//           <h4>PavitraBandham Cooperative Bank</h4>
//           <p>© 2026 Your Company Name</p>
//         </div>
//         <div className="footer-section">
//           <h4>Quick Links</h4>
//           <ul>
//             <li><a href="/about">About Us</a></li>
//             <li><a href="/contact">Contact</a></li>
//             <li><a href="/privacy">Privacy Policy</a></li>
//           </ul>
//         </div>
//         <div className="footer-section">
//           <h4>Follow Us</h4>
//           <div className="social-icons">
//             <a href="#"><FaFacebook /></a>
//             <a href="#"><FaTwitter /></a>
//             <a href="#"><FaLinkedin /></a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
 
export default function Footer() {
  return (
    <footer id="contact-us" className="footer">
      <div className="footer-content">
       
        {/* Company Info */}
        <div className="footer-section">
          <h4>PavitraBandham Cooperative Bank</h4>
          <p>Empowering trust, enabling growth.</p>
          <p>© 2026 PavitraBandham Cooperative Bank</p>
        </div>
 
        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
 
        {/* Contact Information */}
        <div className="footer-section">
          <h4>Contact Information</h4>
          <ul className="contact-info">
            <li>
              <FaMapMarkerAlt />
              <span>123 Main Road, Hyderabad, Telangana, India</span>
            </li>
            <li>
              <FaPhoneAlt />
              <span>+91 98765 43210</span>
            </li>
            <li>
              <FaEnvelope />
              <span>support@pavitrabandhambank.com</span>
            </li>
          </ul>
        </div>
 
        {/* Social Media */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
 
      </div>
    </footer>
  );
}