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
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3>For Job Seekers</h3>
            <ul>
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/account">My Account</Link></li>
              <li><Link to="/resume">Upload Resume</Link></li>
              <li><Link to="/saved-jobs">Saved Jobs</Link></li>
              <li><Link to="/job-alerts">Job Alerts</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>For Employers</h3>
            <ul>
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/employer-resources">Resources</Link></li>
              <li><Link to="/employer-dashboard">Dashboard</Link></li>
              <li><Link to="/applicant-tracking">Applicant Tracking</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/support">Support</Link></li>
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
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/accessibility">Accessibility</Link>
              <Link to="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 