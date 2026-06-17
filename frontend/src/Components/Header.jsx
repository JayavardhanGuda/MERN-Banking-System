import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaPiggyBank, FaCreditCard, FaShieldAlt, FaClipboardList } from "react-icons/fa";
import "../styles/Header.css";

// ── Theme helpers ─────────────────────────────────────────
const THEME_KEY = "vjn-theme";

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  // Respect OS preference on first visit
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}
// ─────────────────────────────────────────────────────────

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [adminSession, setAdminSession] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const profileMenuRef = useRef(null);

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Check for user/admin on every location change to ensure real-time updates
  useEffect(() => {
    const checkSession = () => {
      // Check for regular user
      const user = localStorage.getItem("currentUser");
      setCurrentUser(user ? JSON.parse(user) : null);
      
      // Check for admin session
      const admin = sessionStorage.getItem("adminSession");
      setAdminSession(admin ? JSON.parse(admin) : null);
    };

    // Check immediately
    checkSession();

    const handleStorageChange = () => {
      checkSession();
    };

    const handleDocumentClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("click", handleDocumentClick);

    // Also listen for custom event for same-tab updates
    window.addEventListener("userSessionChanged", checkSession);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("userSessionChanged", checkSession);
    };
  }, [location]);

  const handleLogout = (e) => {
    if (e) e.stopPropagation();

    // Handle admin logout
    if (adminSession) {
      sessionStorage.removeItem("adminSession");
      setAdminSession(null);
      window.dispatchEvent(new Event('userSessionChanged'));
      navigate("/", { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Handle user logout
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
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
    setCurrentUser(null);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('userSessionChanged'));
    
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
            <h2>VJN Cooperative Bank</h2>
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

            {/* Dark / Light mode toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              <span className="theme-toggle-thumb">
                <span className="toggle-icon-sun">☀️</span>
                <span className="toggle-icon-moon">🌙</span>
              </span>
            </button>

            {/* Profile */}
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button
                type="button"
                className="profile-avatar-btn"
                title={adminSession ? "Admin" : currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Guest User"}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FaUser className="profile-avatar-icon" />
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  {adminSession ? (
                    <>
                      <div className="profile-user-name profile-admin-name">
                        <FaShieldAlt style={{ marginRight: 6, color: '#c9a84c' }} />
                        Admin
                      </div>
                      <Link
                        to="/admin-dashboard"
                        className="profile-menu-link"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <button
                        type="button"
                        className="profile-menu-btn logout-btn"
                        onClick={(e) => { handleLogout(e); setShowProfileMenu(false); }}
                      >
                        Logout
                      </button>
                    </>
                  ) : currentUser ? (
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
                      <div className="profile-dropdown-divider" />
                      <Link
                        to="/application-status"
                        state={{ backgroundLocation: location }}
                        className="profile-menu-link profile-menu-link--status"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FaClipboardList className="profile-menu-link__icon" />
                        Check Application Status
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
