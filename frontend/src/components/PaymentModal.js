import React, { useState, useEffect } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, plan, billingCycle, amount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [cardType, setCardType] = useState('');
  
  useEffect(() => {
    // Disable scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Detect card type based on number
  useEffect(() => {
    // Simple card type detection
    if (cardNumber.startsWith('4')) {
      setCardType('visa');
    } else if (cardNumber.startsWith('5')) {
      setCardType('mastercard');
    } else if (cardNumber.startsWith('3')) {
      setCardType('amex');
    } else if (cardNumber.startsWith('6')) {
      setCardType('discover');
    } else {
      setCardType('');
    }
  }, [cardNumber]);
  
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Add spaces for better readability
    if (value) {
      if (value.length > 16) {
        value = value.substr(0, 16);
      }
      
      // Format with spaces
      const parts = [];
      for (let i = 0; i < value.length; i += 4) {
        parts.push(value.substr(i, 4));
      }
      value = parts.join(' ');
    }
    
    setCardNumber(value);
  };
  
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 4) {
      value = value.substr(0, 4);
    }
    
    if (value.length > 2) {
      value = value.substr(0, 2) + '/' + value.substr(2);
    }
    
    setExpiryDate(value);
  };
  
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.substr(0, 4));
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s/g, '').length < 15) {
      newErrors.cardNumber = 'Card number is invalid';
    }
    
    if (!cardName) {
      newErrors.cardName = 'Name on card is required';
    }
    
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = expiryDate.split('/');
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      if (parseInt(year, 10) < currentYear || 
          (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
        newErrors.expiryDate = 'Card is expired';
      }
    }
    
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'CVV is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsProcessing(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        onClose('success');
      }, 2000);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-container">
        <div className="payment-modal-header">
          <h2>Complete Your Payment</h2>
          <button className="close-button" onClick={() => onClose('cancel')}>×</button>
        </div>
        
        <div className="payment-modal-body">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-details">
              <p><strong>{plan} Plan</strong> ({billingCycle})</p>
              <p className="order-amount">${amount}</p>
            </div>
            <div className="secure-badge">
              <i className="fas fa-lock"></i> Secure Payment
            </div>
          </div>
          
          <div className="payment-form-container">
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label>
                  Card Number
                  {cardType && (
                    <span className={`card-type ${cardType}`}>
                      <i className={`fab fa-cc-${cardType}`}></i>
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className={errors.cardNumber ? 'error' : ''}
                />
                {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
              </div>
              
              <div className="form-group">
                <label>Name on Card</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className={errors.cardName ? 'error' : ''}
                />
                {errors.cardName && <div className="error-message">{errors.cardName}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    className={errors.expiryDate ? 'error' : ''}
                  />
                  {errors.expiryDate && <div className="error-message">{errors.expiryDate}</div>}
                </div>
                
                <div className="form-group half">
                  <label>CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className={errors.cvv ? 'error' : ''}
                  />
                  {errors.cvv && <div className="error-message">{errors.cvv}</div>}
                </div>
              </div>
              
              <button 
                type="submit" 
                className="payment-submit-button"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="loading-spinner"></span>
                    Processing...
                  </>
                ) : (
                  `Pay $${amount}`
                )}
              </button>
            </form>
            
            <div className="payment-security-info">
              <p>
                <i className="fas fa-shield-alt"></i> 
                Your payment information is encrypted and secure. We do not store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 