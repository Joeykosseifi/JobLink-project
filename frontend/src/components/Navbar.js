import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import JobLink from './JobLink';
import './Navbar.css';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const savedAccounts = JSON.parse(localStorage.getItem('recentAccounts') || '[]');
    
    console.log('Debug - Saved Accounts:', savedAccounts); // Debug log
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser) {
          setIsLoggedIn(true);
          setUser(parsedUser);
          
          // Update recent accounts
          const currentAccount = {
            email: parsedUser.email,
            name: parsedUser.name,
            role: parsedUser.role
          };
          
          console.log('Debug - Current Account:', currentAccount); // Debug log
          
          // Add current account to recent accounts if not already present
          const updatedAccounts = savedAccounts.filter(acc => acc.email !== currentAccount.email);
          updatedAccounts.unshift(currentAccount);
          
          // Keep only the last 5 accounts
          const limitedAccounts = updatedAccounts.slice(0, 5);
          console.log('Debug - Updated Recent Accounts:', limitedAccounts); // Debug log
          
          setRecentAccounts(limitedAccounts);
          localStorage.setItem('recentAccounts', JSON.stringify(limitedAccounts));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      // Still load recent accounts even when logged out
      setRecentAccounts(savedAccounts);
    }
  };

  // Check auth status on mount and when location changes
  useEffect(() => {
    checkAuthStatus();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowAccountMenu(false);
    navigate('/login');
  };

  const switchAccount = (account) => {
    // Store current account credentials if needed
    setShowAccountMenu(false);
    navigate('/login', { state: { email: account.email } });
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/"><JobLink /></Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About Us</Link>
        <Link to="/jobs" className="nav-link">Jobs</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>
        
        {isLoggedIn && user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="nav-link admin-link">
                <i className="fas fa-shield-alt"></i> Admin Dashboard
              </Link>
            )}
            <div className="auth-buttons">
              <div className="account-dropdown">
                <button className="account-button" onClick={toggleAccountMenu}>
                  <i className="fas fa-user-circle"></i>
                  <span>{user.name}</span>
                  <i className={`fas fa-chevron-${showAccountMenu ? 'up' : 'down'}`}></i>
                </button>
                
                {showAccountMenu && (
                  <div className="account-menu">
                    <div className="account-menu-header">
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                        <span className={`user-role ${user.role}`}>{user.role}</span>
                      </div>
                    </div>
                    
                    <div className="account-menu-items">
                      <Link 
                        to="/user/account" 
                        className="menu-item" 
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <i className="fas fa-user"></i>
                        My Account
                      </Link>
                      <Link 
                        to="/settings" 
                        className="menu-item" 
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <i className="fas fa-cog"></i>
                        Settings
                      </Link>
                      
                      {recentAccounts.length > 1 && (
                        <>
                          <div className="menu-divider"></div>
                          <div className="menu-section-title">Recent Accounts</div>
                          {recentAccounts
                            .filter(account => account.email !== user.email)
                            .map((account, index) => (
                              <button
                                key={index}
                                className="menu-item account-switch"
                                onClick={() => switchAccount(account)}
                              >
                                <i className="fas fa-user-circle"></i>
                                <div className="account-info">
                                  <span className="account-name">{account.name}</span>
                                  <span className="account-email">{account.email}</span>
                                </div>
                              </button>
                            ))}
                        </>
                      )}
                      
                      <div className="menu-divider"></div>
                      <button className="menu-item logout" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/signup" className="nav-button">Sign Up</Link>
            <Link to="/login" className="nav-button">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 