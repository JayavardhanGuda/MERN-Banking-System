import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaPiggyBank, FaCreditCard, FaShieldAlt } from "react-icons/fa";
import "../styles/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) setCurrentUser(JSON.parse(user));

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("currentUser");
      setCurrentUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    const handleDocumentClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleLogout = (e) => {
    if (e) e.stopPropagation();

    if (currentUser) {
      const logoutRecord = {
        accountNumber: currentUser.accountNumber,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        logoutTime: new Date().toLocaleString(),
        logoutDate: new Date().toLocaleDateString(),
        timestamp: Date.now(),
      };
      const logoutHistory = JSON.parse(localStorage.getItem("logoutHistory") || "[]");
      logoutHistory.push(logoutRecord);
      localStorage.setItem("logoutHistory", JSON.stringify(logoutHistory));
      localStorage.setItem(`lastLogout_${currentUser.accountNumber}`, JSON.stringify(logoutRecord));
    }

    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    // After logout → go to home page top
    navigate("/", { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId) => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <div className="Header fixed">
        {/* Logo */}
        <Link to="/" className="logo-link">
          <div className="logo">
            <h2>PavitraBandham Cooperative Bank</h2>
            <p>Empowering trust, enabling growth</p>
          </div>
        </Link>

        {/* Nav */}
        <div className="head1">
          <nav>
            {/* Savings Account */}
            <Link to="/savings-account" className="nav-savings-btn">
              <FaPiggyBank /> Savings Account
            </Link>

            {/* Cards */}
            <Link to="/cards" className="nav-pill-btn nav-pill-btn--cards">
              <FaCreditCard /> Cards
            </Link>

            {/* Insurance */}
            <Link to="/insurance" className="nav-pill-btn nav-pill-btn--insurance">
              <FaShieldAlt /> Insurance
            </Link>

            <button
              className="nav-link"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onClick={() => handleScrollToSection("about-us")}
            >
              About Us
            </button>

            <button
              className="nav-link"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onClick={() => handleScrollToSection("contact-us")}
            >
              Contact Us
            </button>

            {/* Profile */}
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button
                type="button"
                className="profile-avatar-btn"
                title={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Guest User"}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FaUser className="profile-avatar-icon" />
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  {currentUser ? (
                    <>
                      <div className="profile-user-name">
                        {currentUser.firstName} {currentUser.lastName}
                      </div>
                      <Link
                        to="/user-dashboard"
                        className="profile-menu-link"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Account
                      </Link>
                      <button
                        type="button"
                        className="profile-menu-btn logout-btn"
                        onClick={(e) => { handleLogout(e); setShowProfileMenu(false); }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        state={{ backgroundLocation: location }}
                        className="profile-menu-link"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="profile-menu-link"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Register as New User
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
