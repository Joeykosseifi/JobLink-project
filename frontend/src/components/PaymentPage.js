import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from './NotificationContext';
import './PaymentPage.css';

function PaymentPage() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [cardType, setCardType] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  
  // Get plan details from location state
  const paymentInfo = location.state?.paymentInfo || {
    plan: 'Unknown',
    amount: '0.00',
    billingCycle: 'monthly'
  };
  
  // Detect card type based on number
  useEffect(() => {
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
  
  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setZipCode(value);
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
    
    if (!billingAddress) {
      newErrors.billingAddress = 'Billing address is required';
    }
    
    if (!city) {
      newErrors.city = 'City is required';
    }
    
    if (!region) {
      newErrors.region = 'Governorate is required';
    }
    
    if (!zipCode) {
      newErrors.zipCode = 'Postal code is required';
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
        showNotification(`Successfully upgraded to ${paymentInfo.plan} plan!`, 'success');
        navigate('/payment-success', { 
          state: { 
            plan: paymentInfo.plan,
            amount: paymentInfo.amount,
            billingCycle: paymentInfo.billingCycle
          } 
        });
      }, 2000);
    }
  };
  
  const handleCancel = () => {
    navigate('/pricing');
  };
  
  return (
    <div className="payment-page">
      <div className="payment-header">
        <h1>Complete Your Payment</h1>
        <p>You're almost set to enjoy your premium features</p>
      </div>
      
      <div className="payment-container">
        <div className="payment-left">
          <div className="order-summary-card">
            <h2>Order Summary</h2>
            <div className="plan-details">
              <div className="plan-icon">
                <i className="fas fa-crown"></i>
              </div>
              <div className="plan-info">
                <h3>{paymentInfo.plan} Plan</h3>
                <p>{paymentInfo.billingCycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}</p>
              </div>
              <div className="plan-price">
                ${paymentInfo.amount}
              </div>
            </div>
            
            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>${paymentInfo.amount}</span>
              </div>
              <div className="price-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>${paymentInfo.amount}</span>
              </div>
            </div>
            
            <div className="billing-info">
              <p>
                <i className="fas fa-repeat"></i> 
                {paymentInfo.billingCycle === 'monthly' 
                  ? 'You will be billed monthly. Cancel anytime.' 
                  : 'You will be billed annually. Cancel anytime.'}
              </p>
            </div>
            
            <div className="secure-payment-badge">
              <i className="fas fa-lock"></i> Secure Payment
            </div>
          </div>
          
          <div className="why-upgrade">
            <h3>Why Upgrade to {paymentInfo.plan}?</h3>
            <ul>
              {paymentInfo.plan === 'Premium' ? (
                <>
                  <li><i className="fas fa-check"></i> Unlimited job applications</li>
                  <li><i className="fas fa-check"></i> Featured profile for employers</li>
                  <li><i className="fas fa-check"></i> Priority application review</li>
                  <li><i className="fas fa-check"></i> Access to premium job listings</li>
                </>
              ) : (
                <>
                  <li><i className="fas fa-check"></i> Post up to 10 jobs per month</li>
                  <li><i className="fas fa-check"></i> Advanced applicant screening</li>
                  <li><i className="fas fa-check"></i> Company profile page</li>
                  <li><i className="fas fa-check"></i> Analytics dashboard</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <div className="payment-right">
          <div className="payment-form-wrapper">
            <h2>Payment Details</h2>
            <div className="lebanon-only-badge">
              <i className="fas fa-map-marker-alt"></i> Available in Lebanon only
            </div>
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-section">
                <h3>Card Information</h3>
                
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
                    placeholder="Samir Kassab"
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
              </div>
              
              <div className="form-section">
                <h3>Billing Address in Lebanon</h3>
                
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Hamra Street, Building 42"
                    className={errors.billingAddress ? 'error' : ''}
                  />
                  {errors.billingAddress && <div className="error-message">{errors.billingAddress}</div>}
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Beirut"
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <div className="error-message">{errors.city}</div>}
                  </div>
                  
                  <div className="form-group half">
                    <label>Governorate</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className={errors.region ? 'error' : ''}
                    >
                      <option value="">Select Governorate</option>
                      <option value="Beirut">Beirut</option>
                      <option value="Mount Lebanon">Mount Lebanon</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="Beqaa">Beqaa</option>
                      <option value="Nabatieh">Nabatieh</option>
                      <option value="Akkar">Akkar</option>
                      <option value="Baalbek-Hermel">Baalbek-Hermel</option>
                    </select>
                    {errors.region && <div className="error-message">{errors.region}</div>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group full">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={handleZipCodeChange}
                      placeholder="1107"
                      className={errors.zipCode ? 'error' : ''}
                    />
                    {errors.zipCode && <div className="error-message">{errors.zipCode}</div>}
                  </div>
                </div>
                
                <div className="lebanon-info">
                  <p><i className="fas fa-info-circle"></i> JobLink is currently only available in Lebanon</p>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
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
                    `Pay $${paymentInfo.amount}`
                  )}
                </button>
              </div>
            </form>
            
            <div className="payment-security-info">
              <div className="security-badges">
                <span><i className="fas fa-lock"></i> SSL Secured</span>
                <span><i className="fas fa-shield-alt"></i> 256-bit Encryption</span>
              </div>
              <p>
                Your payment information is encrypted and secure. We do not store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage; 