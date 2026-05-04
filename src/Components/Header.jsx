import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

export default function Header(){
    const [showLogin, setShowLogin] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const isScrolled = true;

    const handleMouseEnter = (dropdown) => {
        setActiveDropdown(dropdown);
    };

    const handleMouseLeave = () => {
        setActiveDropdown(null);
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
                            <a href="#accounts">Senior Citizen Account</a>
                        </div>
                    </div>

                    <div 
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
                    </div>

                    <div 
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
                    </div>

                    <div 
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
                    </div>

                    <div 
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
                    </div>

                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact Us</Link>
                    <button className="hamburger" onClick={() => setShowLogin(!showLogin)}>
                    ☰
                    </button>
                </nav>
                {showLogin && (
                <div className="overlay" onClick={() => setShowLogin(false)}></div>
                )}
            </div>
        </div>
        <div className={`loginDiv ${showLogin ? "open" : ""}`}>
            <button onClick={() => window.location.href="/login"}>Login</button>
            <button onClick={() => window.location.href="/register"}>New User Register</button>
            <button onClick={() => window.location.href="/onlineAccount"}>Apply for Online Account</button>
        </div>
 
        </>
    )
}