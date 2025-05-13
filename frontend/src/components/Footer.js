import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col">
            <div className="footer-brand">
              <Link to="/">
                <i className="fas fa-briefcase"></i>
                <span>JobLink</span>
              </Link>
              <p>Connecting talented professionals with outstanding opportunities across Lebanon and beyond.</p>
            </div>
            <div className="footer-social">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3>Users</h3>
            <ul>
              <li><Link to="/jobs" aria-label="Browse Jobs">Browse Jobs</Link></li>
              <li><Link to="/user/account" aria-label="My Account">My Account</Link></li>
              <li><Link to="/jobs" aria-label="Saved Jobs">Saved Jobs</Link></li>
              <li><Link to="/postjob" aria-label="Post a Job">Post a Job</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              <li><Link to="/" aria-label="Home">Home</Link></li>
              <li><Link to="/about" aria-label="About Us">About Us</Link></li>
              <li><Link to="/contact" aria-label="Contact Us">Contact Us</Link></li>
              <li><Link to="/terms" aria-label="Terms and Conditions">Terms and Conditions</Link></li>
              <li><Link to="/privacy" aria-label="Privacy Policy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Stay Connected</h3>
            <div className="footer-newsletter">
              <p>Subscribe to our newsletter for the latest job listings and career advice.</p>
              <form className="footer-subscribe">
                <input type="email" placeholder="Your email address" required />
                <button type="submit">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-legal">
            <p>&copy; {currentYear} JobLink. All rights reserved.</p>
            <div className="footer-links">
              <Link to="/about" aria-label="Accessibility">Accessibility</Link>
              <Link to="/about" aria-label="Sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 