import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (response.data.token && response.data.data && response.data.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // If user is admin, redirect to admin dashboard, otherwise go to home
        if (response.data.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response) {
        setError(error.response.data.message || 'Invalid email or password');
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to access your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <i className="bx bx-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <i className="bx bx-lock-alt"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>

            <div className="social-login">
              <p>Or continue with</p>
              <div className="social-buttons">
                <button type="button" className="social-button google">
                  <i className="bx bxl-google"></i>
                  Google
                </button>
                <button type="button" className="social-button linkedin">
                  <i className="bx bxl-linkedin"></i>
                  LinkedIn
                </button>
              </div>
            </div>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>

        <div className="login-image">
          <div className="image-overlay">
            <h2>Welcome to JobLink</h2>
            <p>Your gateway to professional opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

    
