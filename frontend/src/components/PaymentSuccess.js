import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get payment details from location state
  const paymentDetails = location.state || {
    plan: 'Unknown',
    amount: '0.00',
    billingCycle: 'monthly'
  };
  
  // Trigger the subscription notification on mount
  useEffect(() => {
    // If we have valid payment data, trigger the notification update
    if (location.state) {
      // Dispatch event to update subscription notification
      window.dispatchEvent(new Event('userStateChanged'));
    }
  }, [location.state]);
  
  // Redirect to home if accessed directly without payment data
  useEffect(() => {
    if (!location.state) {
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [location.state, navigate]);
  
  return (
    <div className="payment-success">
      <div className="success-container">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h1>Payment Successful!</h1>
        
        <div className="success-details">
          <p>Thank you for upgrading to the <strong>{paymentDetails.plan} plan</strong>.</p>
          
          <div className="payment-summary">
            <div className="summary-row">
              <span>Plan:</span>
              <span>{paymentDetails.plan}</span>
            </div>
            <div className="summary-row">
              <span>Amount:</span>
              <span>${paymentDetails.amount}</span>
            </div>
            <div className="summary-row">
              <span>Billing:</span>
              <span>{paymentDetails.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</span>
            </div>
          </div>
          
          <p>A confirmation email has been sent to your registered email address.</p>
        </div>
        
        <div className="success-actions">
          <button 
            className="primary-button"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
          
          <button 
            className="secondary-button"
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess; 