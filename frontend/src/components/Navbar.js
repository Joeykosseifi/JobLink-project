import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';
import { useNotification } from './NotificationContext';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState(0);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);
  const accountMenuRef = useRef(null);
  const { showNotification } = useNotification();

  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const savedAccounts = JSON.parse(localStorage.getItem('recentAccounts') || '[]');
    
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
          
          // Add current account to recent accounts if not already present
          const updatedAccounts = savedAccounts.filter(acc => acc.email !== currentAccount.email);
          updatedAccounts.unshift(currentAccount);
          
          // Keep only the last 2 accounts
          const limitedAccounts = updatedAccounts.slice(0, 2);
          
          setRecentAccounts(limitedAccounts);
          localStorage.setItem('recentAccounts', JSON.stringify(limitedAccounts));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        showNotification('Session expired. Please login again.', 'warning');
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      // Still load recent accounts even when logged out
      setRecentAccounts(savedAccounts);
    }
  }, [showNotification]);

  const fetchConnectionRequests = useCallback(async () => {
    if (!isLoggedIn) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('http://localhost:5000/api/users/connections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        const { connectionRequests } = response.data.data;
        setConnectionRequests(connectionRequests ? connectionRequests.length : 0);
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  }, [isLoggedIn]);

  const fetchNewJobsCount = useCallback(async () => {
    try {
      // In a real app, you would fetch this from your API
      // Example: Check localStorage for the last time jobs were viewed
      const lastJobCheck = localStorage.getItem('lastJobCheck');
      const currentTime = new Date().getTime();
      
      // For demo purposes, simulate new jobs notification
      // In real app, you would fetch the actual count of new jobs since lastJobCheck
      if (!lastJobCheck || (currentTime - parseInt(lastJobCheck)) > 86400000) { // 24 hours
        // Generate a random number between 1 and 5 for demo
        const randomCount = Math.floor(Math.random() * 5) + 1;
        setNewJobsCount(randomCount);
      }
    } catch (error) {
      console.error('Error fetching new jobs count:', error);
    }
  }, []);

  // Check auth status on mount and when location changes
  useEffect(() => {
    checkAuthStatus();
    // Close mobile menu when location changes
    setMobileMenuOpen(false);
  }, [location, checkAuthStatus]);

  // Fetch connection requests when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchConnectionRequests();
      fetchNewJobsCount();
      
      // Set up polling every 30 seconds to check for new connection requests
      const intervalId = setInterval(fetchConnectionRequests, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [isLoggedIn, fetchConnectionRequests, fetchNewJobsCount]);

  // Reset connection requests when location changes to /network
  useEffect(() => {
    if (location.pathname === '/network') {
      setConnectionRequests(0);
    }
  }, [location.pathname]);

  // Clear new jobs notification when going to Jobs page
  useEffect(() => {
    if (location.pathname === '/jobs') {
      setNewJobsCount(0);
      localStorage.setItem('lastJobCheck', new Date().getTime().toString());
    }
  }, [location.pathname]);

  const handleLogout = () => {
    const userName = user?.name || 'User';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowAccountMenu(false);
    
    // Trigger userStateChanged event to update subscription notification
    window.dispatchEvent(new Event('userStateChanged'));
    
    showNotification(`Goodbye, ${userName}! You have been logged out successfully.`, 'info');
    navigate('/login');
  };

  const switchAccount = (account) => {
    // Store current account credentials if needed
    setShowAccountMenu(false);
    showNotification(`Switching to ${account.name}'s account...`, 'info');
    navigate('/login', { state: { email: account.email } });
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAccountMenu && accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
      
      if (mobileMenuOpen && mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) && 
          !event.target.classList.contains('mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu, mobileMenuOpen]);

  // Determine if a nav link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Add a function to close mobile menu when clicking a link
  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-brand">
          <Link to="/">
            <i className="fas fa-briefcase"></i>
            <span>JobLink</span>
          </Link>
        </div>
      </div>
      
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
      </button>
      
      <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} ref={mobileMenuRef}>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={handleNavLinkClick}>
          <i className="fas fa-home"></i> Home
        </Link>
        <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={handleNavLinkClick}>
          <i className="fas fa-info-circle"></i> About Us
        </Link>
        <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`} onClick={handleNavLinkClick}>
          <i className="fas fa-briefcase"></i> Jobs
          {newJobsCount > 0 && (
            <span className="notification-badge">{newJobsCount}</span>
          )}
        </Link>
        <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={handleNavLinkClick}>
          <i className="fas fa-envelope"></i> Contact Us
        </Link>
        
        {(!isLoggedIn || !user || user.role !== 'admin') && (
          <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'active' : ''}`} onClick={handleNavLinkClick}>
            <i className="fas fa-tag"></i> Pricing
            <span className="upgrade-badge">Upgrade</span>
          </Link>
        )}
        
        {isLoggedIn && user && user.role === 'admin' && (
          <Link to="/admin/dashboard" className={`admin-link ${isActive('/admin') ? 'active' : ''}`} onClick={handleNavLinkClick}>
            <i className="fas fa-shield-alt"></i> Dashboard
          </Link>
        )}
      </div>
      
      {isLoggedIn && user ? (
        <div className="auth-buttons">
          <div className="account-dropdown" ref={accountMenuRef}>
            <button className="account-button" onClick={toggleAccountMenu}>
              <i className="fas fa-user-circle"></i>
              <span>{user.name}</span>
              <i className={`fas fa-chevron-${showAccountMenu ? 'up' : 'down'}`}></i>
            </button>
            
            <div className={`account-menu ${showAccountMenu ? 'active' : ''}`}>
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
                  className="dropdown-menu-item" 
                  onClick={() => setShowAccountMenu(false)}
                >
                  <i className="fas fa-user"></i>
                  My Account
                </Link>
                
                {user.role !== 'admin' && (
                  <>
                    <Link 
                      to="/network" 
                      className="dropdown-menu-item" 
                      onClick={() => setShowAccountMenu(false)}
                    >
                      <i className="fas fa-users"></i>
                      My Network
                      {connectionRequests > 0 && (
                        <span className="menu-notification-badge">{connectionRequests}</span>
                      )}
                    </Link>
                    
                    {/* Only show My Applications link for job seekers */}
                    {(user.jobRole === 'job-seeker' || !user.jobRole) && (
                      <Link 
                        to="/my-applications" 
                        className="dropdown-menu-item" 
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <i className="fas fa-clipboard-list"></i>
                        My Applications
                      </Link>
                    )}
                    
                    {/* Link for job posters to view applications for their jobs */}
                    {(user.jobRole === 'job-poster' || user.role === 'admin') && (
                      <Link 
                        to="/job-applications" 
                        className="dropdown-menu-item" 
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <i className="fas fa-clipboard-check"></i>
                        Job Applications
                      </Link>
                    )}
                  </>
                )}
                
                <Link 
                  to="/settings" 
                  className="dropdown-menu-item" 
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
                          className="dropdown-menu-item account-switch"
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
                <button className="dropdown-menu-item logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-buttons">
          <Link to="/signup" className="nav-button">
            <i className="fas fa-user-plus"></i> Sign Up
          </Link>
          <Link to="/login" className="nav-button">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 