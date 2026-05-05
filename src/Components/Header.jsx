import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaUser } from "react-icons/fa";

export default function Header(){
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const isScrolled = true;
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }

        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem('currentUser');
            setCurrentUser(updatedUser ? JSON.parse(updatedUser) : null);
        };

        window.addEventListener('storage', handleStorageChange);

        const handleDocumentClick = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const handleLogout = (e) => {
        if (e) {
            e.stopPropagation();
        }
        if (currentUser) {
            // Save logout information to localStorage
            const logoutRecord = {
                accountNumber: currentUser.accountNumber,
                userName: `${currentUser.firstName} ${currentUser.lastName}`,
                logoutTime: new Date().toLocaleString(),
                logoutDate: new Date().toLocaleDateString(),
                timestamp: Date.now()
            };

            // Get existing logout records
            const logoutHistory = JSON.parse(localStorage.getItem('logoutHistory') || '[]');
            logoutHistory.push(logoutRecord);
            localStorage.setItem('logoutHistory', JSON.stringify(logoutHistory));

            // Also save last logout for this user
            localStorage.setItem(`lastLogout_${currentUser.accountNumber}`, JSON.stringify(logoutRecord));
        }

        // Clear current user session
        localStorage.removeItem('currentUser');
        setCurrentUser(null);

        // Redirect to login
        navigate('/login');
    };

    const handleMouseEnter = (dropdown) => {
        setActiveDropdown(dropdown);
    };

    const handleMouseLeave = () => {
        setActiveDropdown(null);
    };

    const handleScrollToSection = (sectionId) => {
        // Navigate to home page
        navigate('/');
        
        // Scroll to section after a small delay to ensure page is loaded
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return(
        <>
        <div className="Header fixed">
            <Link to="/" className="logo-link">
                <div className="logo">
                    <h2>PavitraBandham Cooperative Bank</h2>
                    <p>Empowering trust, enabling growth</p>
                </div>
            </Link>
            <div className="head1" >
                <nav>
                    <div 
                        className="nav-dropdown"
                        onMouseEnter={() => handleMouseEnter('accounts')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="dropdown-toggle">
                            Accounts <FaChevronDown className={`dropdown-icon ${activeDropdown === 'accounts' ? 'active' : ''}`} />
                        </button>
                        <div className={`dropdown-menu ${activeDropdown === 'accounts' ? 'show' : ''}`}>
                                                        <Link to="/savings-account" className="dropdown-link" onClick={handleMouseLeave}>
                                                            Savings Account
                                                        </Link>
                            <a href="#accounts">Current Account</a>
                            <a href="#accounts">Salary Account</a>
                            <a href="#accounts">Student Account</a>
                        </div>
                    </div>

                    {/* <div 
                        className="nav-dropdown"
                        onMouseEnter={() => handleMouseEnter('cards')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="dropdown-toggle">
                            Cards <FaChevronDown className={`dropdown-icon ${activeDropdown === 'cards' ? 'active' : ''}`} />
                        </button>
                        <div className={`dropdown-menu ${activeDropdown === 'cards' ? 'show' : ''}`}>
                            <a href="#cards">Credit Cards</a>
                            <a href="#cards">Debit Cards</a>
                            <a href="#cards">Prepaid Cards</a>
                            <a href="#cards">Corporate Cards</a>
                        </div>
                    </div> */}

                    {/* <div 
                        className="nav-dropdown"
                        onMouseEnter={() => handleMouseEnter('loans')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="dropdown-toggle">
                            Loans <FaChevronDown className={`dropdown-icon ${activeDropdown === 'loans' ? 'active' : ''}`} />
                        </button>
                        <div className={`dropdown-menu ${activeDropdown === 'loans' ? 'show' : ''}`}>
                            <a href="#loans">Personal Loan</a>
                            <a href="#loans">Home Loan</a>
                            <a href="#loans">Auto Loan</a>
                            <a href="#loans">Education Loan</a>
                            <a href="#loans">Business Loan</a>
                        </div>
                    </div> */}

                    {/* <div 
                        className="nav-dropdown"
                        onMouseEnter={() => handleMouseEnter('deposits')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="dropdown-toggle">
                            Deposits <FaChevronDown className={`dropdown-icon ${activeDropdown === 'deposits' ? 'active' : ''}`} />
                        </button>
                        <div className={`dropdown-menu ${activeDropdown === 'deposits' ? 'show' : ''}`}>
                            <a href="#deposits">Fixed Deposits</a>
                            <a href="#deposits">Recurring Deposits</a>
                            <a href="#deposits">Bulk Deposits</a>
                        </div>
                    </div> */}

                    {/* <div 
                        className="nav-dropdown"
                        onMouseEnter={() => handleMouseEnter('investments')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="dropdown-toggle">
                            Investments <FaChevronDown className={`dropdown-icon ${activeDropdown === 'investments' ? 'active' : ''}`} />
                        </button>
                        <div className={`dropdown-menu ${activeDropdown === 'investments' ? 'show' : ''}`}>
                            <a href="#investments">Mutual Funds</a>
                            <a href="#investments">Stocks</a>
                            <a href="#investments">Bonds</a>
                            <a href="#investments">Insurance Products</a>
                        </div>
                    </div> */}

                    <button 
                        className="nav-link" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => handleScrollToSection('about-us')}
                    >
                        About Us
                    </button>
                    <button 
                        className="nav-link" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => handleScrollToSection('contact-us')}
                    >
                        Contact Us
                    </button>
                    <div className="profile-menu-container" ref={profileMenuRef}>
                        <button 
                            type="button"
                            className="profile-avatar-btn" 
                            title={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <FaUser className="profile-avatar-icon" />
                        </button>
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                {currentUser ? (
                                    <>
                                        <div className="profile-user-name">{currentUser.firstName} {currentUser.lastName}</div>
                                        <Link to="/user-dashboard" className="profile-menu-link" onClick={() => setShowProfileMenu(false)}>
                                            Account
                                        </Link>
                                        <button type="button" className="profile-menu-btn logout-btn" onClick={(e) => { handleLogout(e); setShowProfileMenu(false); }}>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="profile-menu-link" onClick={() => setShowProfileMenu(false)}>
                                            Login
                                        </Link>
                                        <Link to="/register" className="profile-menu-link" onClick={() => setShowProfileMenu(false)}>
                                            Register as New User
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
                {showLogin && (
                <div className="overlay" onClick={() => setShowLogin(false)}></div>
                )}
            </div>
        </div>
        {showLogin && (
        <div className={`loginDiv ${showLogin ? "open" : ""}`}>
            <button onClick={() => window.location.href="/login"}>Login</button>
            <button onClick={() => window.location.href="/register"}>New User Register</button>
            <button onClick={() => window.location.href="/onlineAccount"}>Apply for Online Account</button>
        </div>
        )}
 
        </>
    )
}