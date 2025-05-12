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
            <h3>For Job Seekers</h3>
            <ul>
              <li><Link to="/jobs" aria-label="Browse Jobs">Browse Jobs</Link></li>
              <li><Link to="/account" aria-label="My Account">My Account</Link></li>
              <li><Link to="/resume" aria-label="Upload Resume">Upload Resume</Link></li>
              <li><Link to="/saved-jobs" aria-label="Saved Jobs">Saved Jobs</Link></li>
              <li><Link to="/job-alerts" aria-label="Job Alerts">Job Alerts</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>For Employers</h3>
            <ul>
              <li><Link to="/post-job" aria-label="Post a Job">Post a Job</Link></li>
              <li><Link to="/pricing" aria-label="Pricing">Pricing</Link></li>
              <li><Link to="/employer-resources" aria-label="Employer Resources">Resources</Link></li>
              <li><Link to="/employer-dashboard" aria-label="Employer Dashboard">Dashboard</Link></li>
              <li><Link to="/applicant-tracking" aria-label="Applicant Tracking">Applicant Tracking</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              <li><Link to="/about" aria-label="About Us">About Us</Link></li>
              <li><Link to="/contact" aria-label="Contact Us">Contact Us</Link></li>
              <li><Link to="/contact" aria-label="Support">Support</Link></li>
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
              <Link to="/terms" aria-label="Terms of Service">Terms of Service</Link>
              <Link to="/privacy" aria-label="Privacy Policy">Privacy Policy</Link>
              <Link to="/accessibility" aria-label="Accessibility">Accessibility</Link>
              <Link to="/sitemap" aria-label="Sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 