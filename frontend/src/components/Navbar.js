import React from 'react';
import { Link } from 'react-router-dom';
import JobLink from './JobLink';
import './Navbar.css';

function Navbar() {
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
        <div className="auth-buttons">
          <Link to="/signup" className="nav-button">Sign Up</Link>
          <Link to="/login" className="nav-button">Login</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 