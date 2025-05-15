import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';
import './Pricing.css';

function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  // eslint-disable-next-line no-unused-vars
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedFaqs, setExpandedFaqs] = useState([0, 1, 2, 3]); // All expanded by default
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isLoggedIn = localStorage.getItem('token') !== null;

  const plans = {
    free: {
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Basic job search',
        'Up to 5 job applications per month',
        'Basic profile',
        'Email notifications',
      ],
      cta: 'Current Plan',
      color: 'basic'
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      features: [
        'All Free features',
        'Unlimited job applications',
        'Featured profile for employers',
        'Priority application review',
        'Application tracking',
        'Message employers directly',
      ],
      cta: 'Upgrade',
      color: 'premium'
    },
    business: {
      name: 'Business',
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      features: [
        'All Premium features',
        'Post up to 10 jobs per month',
        'Advanced applicant screening',
        'Priority support',
        'Company profile page',
        'Analytics dashboard',
      ],
      cta: 'Upgrade',
      color: 'business'
    }
  };

  const handleSelectPlan = (plan) => {
    if (!isLoggedIn) {
      showNotification('Please log in to upgrade your plan', 'warning');
      navigate('/login', { state: { returnTo: '/pricing' } });
      return;
    }
    
    if (plan === 'free') {
      showNotification('You are already on the Free plan', 'info');
      return;
    }
    
    setSelectedPlan(plan);
    
    // Calculate amount based on the selected plan and billing cycle
    const planDetails = plans[plan];
    const amount = billingCycle === 'monthly' 
      ? planDetails.monthlyPrice 
      : planDetails.yearlyPrice;
      
    // Navigate to payment page instead of showing modal
    navigate('/payment', {
      state: {
        paymentInfo: {
          plan: planDetails.name,
          amount: amount.toFixed(2),
          billingCycle
        }
      }
    });
  };

  const getPriceDisplay = (plan) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}${billingCycle === 'monthly' ? '/mo' : '/yr'}`;
  };

  const getSavingsAmount = (plan) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    return savings.toFixed(2);
  };

  return (
    <div className="pricing-container">
      <h1 className="pricing-title">Choose Your JobLink Plan</h1>
      <p className="pricing-subtitle">Unlock the full potential of your job search or recruitment</p>
      
      <div className="billing-toggle">
        <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
        <label className="switch">
          <input 
            type="checkbox" 
            onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            checked={billingCycle === 'yearly'}
          />
          <span className="slider round"></span>
        </label>
        <span className={billingCycle === 'yearly' ? 'active' : ''}>
          Yearly <span className="save-badge">Save up to 16%</span>
        </span>
      </div>

      <div className="pricing-cards">
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} className={`pricing-card ${plan.color}`}>
            <div className="plan-header">
              <h2>{plan.name}</h2>
              <div className="plan-price">
                <span className="price">{getPriceDisplay(plan)}</span>
                {billingCycle === 'yearly' && getSavingsAmount(plan) && (
                  <span className="savings-text">Save ${getSavingsAmount(plan)} per year</span>
                )}
              </div>
            </div>
            
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <i className="fas fa-check"></i> {feature}
                </li>
              ))}
            </ul>
            
            <button 
              className={`upgrade-button ${plan.color}`}
              onClick={() => handleSelectPlan(key)}
              disabled={key === 'free'}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
      
      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {[
            {
              question: "Can I change plans later?",
              answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be effective immediately."
            },
            {
              question: "Do you offer refunds?",
              answer: "We offer a 14-day money-back guarantee if you're not satisfied with your premium plan."
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, PayPal, and bank transfers for yearly plans."
            },
            {
              question: "Is there a discount for annual billing?",
              answer: "Yes, you save up to 16% when choosing the annual billing option."
            }
          ].map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${!expandedFaqs.includes(index) ? 'collapsed' : ''}`}
              onClick={() => {
                setExpandedFaqs(prev => 
                  prev.includes(index) 
                    ? prev.filter(i => i !== index) 
                    : [...prev, index]
                );
              }}
            >
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pricing;